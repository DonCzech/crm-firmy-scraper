import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { sendBookingConfirmationToClient, sendBookingNotificationToProvider } from '@/lib/email'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { resolveCoupon, resolveVoucher } from '@/lib/discounts'
import { isPaymentConfigured, createDepositCheckout } from '@/lib/payment-gateway'
import { sendSms, isSmsConfigured } from '@/lib/sms'

// GET /api/bookings — admin: list all bookings for current user
export async function GET() {
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const bookings = await sql`
      SELECT
        b.*,
        s.name as service_name,
        s.color as service_color,
        u.name as provider_name,
        u.email as provider_email
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      JOIN rez_users u ON b.provider_id = u.id
      WHERE b.provider_id = ${user.userId}
      ORDER BY b.booking_date DESC, b.start_time DESC
    `
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/bookings — public: create booking
export async function POST(request: NextRequest) {
  try {
    await initDb()

    const body = await request.json()
    const {
      serviceId,
      providerSlug,
      clientName,
      clientEmail,
      clientPhone,
      clientNotes,
      bookingDate,
      startTime,
      staffId,
      paymentMethod,
      couponCode,
      voucherCode,
      consent,
      // Honeypot: skryté pole, které vyplní jen bot. Legitimní formulář ho pošle prázdné.
      website,
    } = body

    // Anti-spam: honeypot. Botovi vrátíme falešný úspěch, ať nezkouší dál, ale nic neuložíme.
    if (website) {
      return NextResponse.json({ success: true, booking: { id: 'ok' } }, { status: 201 })
    }

    // Anti-spam: rate limit per IP (5 rezervací / minutu).
    const rl = rateLimit(`booking:${clientIp(request)}`, { limit: 5, windowMs: 60_000 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    if (!serviceId || !providerSlug || !clientName || !bookingDate || !startTime) {
      return NextResponse.json({ error: 'Chybí povinné údaje' }, { status: 400 })
    }

    // Get service + provider
    const services = await sql`
      SELECT s.*, u.id as user_id, u.name as user_name, u.email as user_email, u.slug as user_slug,
             u.min_booking_hours, u.buffer_minutes, u.require_email, u.require_phone,
             u.require_deposit, u.deposit_percent, u.sms_reminders
      FROM rez_services s
      JOIN rez_users u ON s.user_id = u.id
      WHERE s.id = ${serviceId} AND u.slug = ${providerSlug} AND s.is_active = true
      LIMIT 1
    `

    if (services.length === 0) {
      return NextResponse.json({ error: 'Služba nenalezena' }, { status: 404 })
    }

    const service = services[0]

    // Povinnost kontaktů dle nastavení poskytovatele (klient se nesmí obejít)
    const requireEmail = service.require_email !== false
    const requirePhone = service.require_phone === true
    if (requireEmail && !clientEmail) {
      return NextResponse.json({ error: 'E-mail je povinný' }, { status: 400 })
    }
    if (requirePhone && !clientPhone) {
      return NextResponse.json({ error: 'Telefon je povinný' }, { status: 400 })
    }
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(clientEmail).trim())) {
      return NextResponse.json({ error: 'Neplatný formát e-mailu' }, { status: 400 })
    }
    // Rezervace bez jakéhokoli kontaktu je nedoručitelná
    if (!clientEmail && !clientPhone) {
      return NextResponse.json({ error: 'Zadejte e-mail nebo telefon' }, { status: 400 })
    }

    // Validate minimum booking notice
    const minBookingHours = Number(service.min_booking_hours) || 0
    if (minBookingHours > 0) {
      const slotDatetime = new Date(`${bookingDate}T${startTime}:00`)
      const cutoff = new Date(Date.now() + minBookingHours * 60 * 60 * 1000)
      if (slotDatetime < cutoff) {
        return NextResponse.json({ error: `Rezervaci je nutné provést alespoň ${minBookingHours} hodin předem` }, { status: 400 })
      }
    }

    // Resolve staff name if staffId provided
    let resolvedStaffId: string | null = null
    let resolvedStaffName = ''
    if (staffId) {
      const staffRows = await sql`
        SELECT id, name FROM rez_staff WHERE id = ${staffId} AND user_id = ${service.user_id} AND is_active = true LIMIT 1
      `
      if (staffRows.length > 0) {
        resolvedStaffId = staffRows[0].id
        resolvedStaffName = staffRows[0].name
      }
    }

    // Check slot availability (including buffer time)
    const bufferMins = Number(service.buffer_minutes) || 0
    const [sh, sm] = startTime.split(':').map(Number)
    const newStartMin = sh * 60 + sm
    const newEndMin = newStartMin + Number(service.duration_minutes)

    // If staff assigned: check only that staff's bookings for conflicts
    const existingBookings = resolvedStaffId
      ? await sql`
          SELECT start_time, duration_minutes FROM rez_bookings
          WHERE staff_id = ${resolvedStaffId}
            AND booking_date = ${bookingDate}
            AND status != 'cancelled'
        `
      : await sql`
          SELECT start_time, duration_minutes FROM rez_bookings
          WHERE provider_id = ${service.user_id}
            AND booking_date = ${bookingDate}
            AND status != 'cancelled'
        `

    const conflict = existingBookings.some((b: Record<string, unknown>) => {
      const [bh, bm] = String(b.start_time).substring(0, 5).split(':').map(Number)
      const bStart = bh * 60 + bm
      const bEnd = bStart + Number(b.duration_minutes)
      return newStartMin < bEnd + bufferMins && newEndMin > bStart - bufferMins
    })

    if (conflict) {
      return NextResponse.json({ error: 'Tento termín je již obsazen' }, { status: 409 })
    }

    // Slevový kód (autoritativní přepočet na serveru)
    const basePrice = Number(service.price) || 0
    let discountAmount = 0
    let appliedCoupon: { couponId: string; code: string } | null = null
    if (couponCode) {
      const c = await resolveCoupon(service.user_id, couponCode, basePrice)
      if (c.valid) {
        discountAmount = c.discount
        appliedCoupon = { couponId: c.couponId!, code: c.code! }
      }
    }
    const priceAfterCoupon = Math.max(basePrice - discountAmount, 0)

    // Dárkový poukaz (uplatní se na zbývající částku po slevě)
    let voucherApplied = 0
    let appliedVoucher: { voucherId: string; code: string } | null = null
    if (voucherCode && priceAfterCoupon > 0) {
      const v = await resolveVoucher(service.user_id, voucherCode, priceAfterCoupon)
      if (v.valid) {
        voucherApplied = v.applied
        appliedVoucher = { voucherId: v.voucherId!, code: v.code! }
      }
    }
    const finalPrice = Math.max(priceAfterCoupon - voucherApplied, 0)
    // Celková evidovaná sleva = kupón + poukaz
    discountAmount = discountAmount + voucherApplied

    // Záloha: procento z ceny po slevě, jen když to poskytovatel vyžaduje a je Stripe
    const depositPercent = Number(service.deposit_percent) || 0
    const wantsDeposit = service.require_deposit === true && depositPercent > 0 && finalPrice > 0
    const canCharge = wantsDeposit && isPaymentConfigured()
    const depositAmount = canCharge ? Math.round((finalPrice * depositPercent) / 100 * 100) / 100 : 0

    // Rezervace, u které čekáme na platbu zálohy, je 'pending'; jinak rovnou 'confirmed'
    const initialStatus = canCharge ? 'pending' : 'confirmed'
    const initialPaymentStatus = canCharge ? 'awaiting_payment' : 'pending'

    // Create booking (unique index idx_bookings_slot_unique je poslední pojistka
    // proti souběhu — kolizi zachytíme jako 409)
    let bookings
    try {
      bookings = await sql`
        INSERT INTO rez_bookings (
          service_id, provider_id, staff_id, staff_name,
          client_name, client_email, client_phone, client_notes,
          booking_date, start_time, duration_minutes,
          price, currency, status, payment_method, payment_status,
          deposit_amount, coupon_code, discount_amount,
          review_token, consent_at
        ) VALUES (
          ${serviceId}, ${service.user_id}, ${resolvedStaffId}, ${resolvedStaffName},
          ${clientName}, ${(clientEmail || '').toLowerCase()}, ${clientPhone || ''}, ${clientNotes || ''},
          ${bookingDate}, ${startTime}, ${service.duration_minutes},
          ${finalPrice}, ${service.currency}, ${initialStatus}, ${paymentMethod || ''}, ${initialPaymentStatus},
          ${depositAmount}, ${appliedCoupon?.code || ''}, ${discountAmount},
          replace(gen_random_uuid()::text, '-', ''), ${consent ? new Date().toISOString() : null}
        )
        RETURNING *
      `
    } catch (err) {
      // 23505 = unique_violation → slot obsadil někdo mezitím
      if (String((err as { code?: string })?.code) === '23505' || /duplicate key|idx_bookings_slot_unique/.test(String(err))) {
        return NextResponse.json({ error: 'Tento termín byl právě obsazen' }, { status: 409 })
      }
      throw err
    }

    const booking = bookings[0]

    // Zvýšit počet použití kupónu (best-effort)
    if (appliedCoupon) {
      await sql`UPDATE rez_coupons SET used_count = used_count + 1 WHERE id = ${appliedCoupon.couponId}`.catch(() => {})
    }
    // Odečíst uplatněnou částku z dárkového poukazu (best-effort)
    if (appliedVoucher && voucherApplied > 0) {
      await sql`UPDATE rez_vouchers
        SET remaining_amount = GREATEST(remaining_amount - ${voucherApplied}, 0)
        WHERE id = ${appliedVoucher.voucherId}`.catch(() => {})
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rezervace-kappa.vercel.app'

    // Vyžaduje-li se záloha: vytvoř platbu u brány (GoPay/Stripe) a vrať přesměrování.
    // Potvrzovací e-maily odejdou až po zaplacení (notifikace/webhook).
    if (canCharge) {
      try {
        const checkout = await createDepositCheckout({
          amount: depositAmount,
          currency: service.currency,
          bookingId: booking.id,
          orderNumber: String(booking.id),
          productName: `Záloha – ${service.name}`,
          description: `Záloha za ${service.name}`,
          returnUrl: `${appUrl}/book/${service.user_slug}?paid=1`,
          cancelUrl: `${appUrl}/book/${service.user_slug}?canceled=1`,
          notifyUrl: `${appUrl}/api/webhooks/gopay`,
          customerEmail: clientEmail || undefined,
        })
        await sql`UPDATE rez_bookings SET stripe_session_id = ${checkout.ref}, payment_provider = ${checkout.provider} WHERE id = ${booking.id}`
        return NextResponse.json(
          { success: true, requiresPayment: true, checkoutUrl: checkout.url, booking },
          { status: 201 }
        )
      } catch (err) {
        console.error('Payment checkout error:', err)
        // Platbu nešlo založit → rezervaci zrušíme, ať nezůstane viset pending
        await sql`DELETE FROM rez_bookings WHERE id = ${booking.id}`.catch(() => {})
        return NextResponse.json({ error: 'Platbu se nepodařilo zahájit, zkuste to prosím znovu' }, { status: 502 })
      }
    }

    // Send emails (non-blocking) — potvrzení klientovi jen když e-mail máme
    Promise.allSettled([
      clientEmail ? sendBookingConfirmationToClient({
        clientName,
        clientEmail,
        serviceName: service.name,
        providerName: service.user_name,
        bookingDate,
        startTime,
        durationMinutes: service.duration_minutes,
        price: finalPrice,
        currency: service.currency,
        confirmationToken: booking.confirmation_token,
        appUrl,
      }) : Promise.resolve(),
      sendBookingNotificationToProvider({
        providerEmail: service.user_email,
        providerName: service.user_name,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        clientNotes: clientNotes || '',
        serviceName: service.name,
        bookingDate,
        startTime,
        durationMinutes: service.duration_minutes,
      }),
    ])

    // SMS potvrzení klientovi (jen když poskytovatel zapnul SMS a je konfigurace)
    if (service.sms_reminders === true && clientPhone && isSmsConfigured()) {
      const dateLabel = String(bookingDate).split('T')[0]
      const msg = `Rezervace potvrzena: ${service.name}, ${dateLabel} ${String(startTime).substring(0, 5)}. ${service.user_name}`
      sendSms(clientPhone, msg)
        .then((r) => sql`INSERT INTO rez_sms_log (provider_id, booking_id, phone, body, kind, status, provider_ref)
          VALUES (${service.user_id}, ${booking.id}, ${clientPhone}, ${msg}, 'confirmation', ${r.ok ? 'sent' : 'failed'}, ${r.ref || r.error || ''})`)
        .catch(() => {})
    }

    return NextResponse.json({ success: true, booking }, { status: 201 })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Nastala chyba serveru' }, { status: 500 })
  }
}
