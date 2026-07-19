import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { sendBookingConfirmationToClient, sendBookingNotificationToProvider } from '@/lib/email'

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
    } = body

    if (!serviceId || !providerSlug || !clientName || !bookingDate || !startTime) {
      return NextResponse.json({ error: 'Chybí povinné údaje' }, { status: 400 })
    }

    // Get service + provider
    const services = await sql`
      SELECT s.*, u.id as user_id, u.name as user_name, u.email as user_email, u.slug as user_slug,
             u.min_booking_hours, u.buffer_minutes, u.require_email, u.require_phone
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

    // Create booking
    const bookings = await sql`
      INSERT INTO rez_bookings (
        service_id, provider_id, staff_id, staff_name,
        client_name, client_email, client_phone, client_notes,
        booking_date, start_time, duration_minutes,
        price, currency, status, payment_method
      ) VALUES (
        ${serviceId}, ${service.user_id}, ${resolvedStaffId}, ${resolvedStaffName},
        ${clientName}, ${(clientEmail || '').toLowerCase()}, ${clientPhone || ''}, ${clientNotes || ''},
        ${bookingDate}, ${startTime}, ${service.duration_minutes},
        ${service.price}, ${service.currency}, 'confirmed', ${paymentMethod || ''}
      )
      RETURNING *
    `

    const booking = bookings[0]

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rezervace-kappa.vercel.app'

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
        price: Number(service.price),
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

    return NextResponse.json({ success: true, booking }, { status: 201 })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Nastala chyba serveru' }, { status: 500 })
  }
}
