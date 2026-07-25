import { sql } from '@/lib/db'
import { sendBookingConfirmationToClient, sendBookingNotificationToProvider, sendWaitlistOpeningEmail } from '@/lib/email'
import { sendSms, isSmsConfigured } from '@/lib/sms'

// Odešle kompletní potvrzení k rezervaci (e-mail klientovi + majiteli + SMS).
// Načte si vše z DB podle ID, aby se dal volat i z webhooku po zaplacení zálohy.
export async function sendConfirmationsForBooking(bookingId: string): Promise<void> {
  const rows = await sql`
    SELECT b.*, s.name AS service_name,
           u.name AS provider_name, u.email AS provider_email, u.sms_reminders
    FROM rez_bookings b
    JOIN rez_services s ON b.service_id = s.id
    JOIN rez_users u ON b.provider_id = u.id
    WHERE b.id = ${bookingId}
    LIMIT 1
  `
  if (rows.length === 0) return
  const b = rows[0]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rezervace-kappa.vercel.app'
  const bookingDate = String(b.booking_date).split('T')[0]
  const startTime = String(b.start_time).substring(0, 5)

  await Promise.allSettled([
    b.client_email
      ? sendBookingConfirmationToClient({
          clientName: b.client_name,
          clientEmail: b.client_email,
          serviceName: b.service_name,
          providerName: b.provider_name,
          bookingDate,
          startTime,
          durationMinutes: b.duration_minutes,
          price: Number(b.price),
          currency: b.currency,
          confirmationToken: b.confirmation_token,
          appUrl,
        })
      : Promise.resolve(),
    sendBookingNotificationToProvider({
      providerEmail: b.provider_email,
      providerName: b.provider_name,
      clientName: b.client_name,
      clientEmail: b.client_email,
      clientPhone: b.client_phone || '',
      clientNotes: b.client_notes || '',
      serviceName: b.service_name,
      bookingDate,
      startTime,
      durationMinutes: b.duration_minutes,
    }),
  ])

  if (b.sms_reminders === true && b.client_phone && isSmsConfigured()) {
    const msg = `Rezervace potvrzena: ${b.service_name}, ${bookingDate} ${startTime}. ${b.provider_name}`
    const r = await sendSms(b.client_phone, msg)
    await sql`INSERT INTO rez_sms_log (provider_id, booking_id, phone, body, kind, status, provider_ref)
      VALUES (${b.provider_id}, ${b.id}, ${b.client_phone}, ${msg}, 'confirmation', ${r.ok ? 'sent' : 'failed'}, ${r.ref || r.error || ''})`.catch(() => {})
  }
}

// Když se uvolní termín (zrušení), obešle čekající zájemce o dané datum.
// Notifikuje jen ty se stavem 'waiting'; po odeslání je přepne na 'notified'.
export async function notifyWaitlistForOpening(providerId: string, date: string): Promise<number> {
  const providerRows = await sql`SELECT name, slug FROM rez_users WHERE id = ${providerId} LIMIT 1`
  if (providerRows.length === 0) return 0
  const provider = providerRows[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rezervace-kappa.vercel.app'
  const bookingUrl = `${appUrl}/book/${provider.slug}`

  const waiting = await sql`
    SELECT w.id, w.client_name, w.client_email, w.client_phone, s.name as service_name
    FROM rez_waitlist w
    LEFT JOIN rez_services s ON w.service_id = s.id
    WHERE w.provider_id = ${providerId} AND w.desired_date = ${date} AND w.status = 'waiting'
  `

  let notified = 0
  for (const w of waiting) {
    if (w.client_email) {
      await sendWaitlistOpeningEmail({
        clientEmail: w.client_email,
        clientName: w.client_name,
        providerName: provider.name,
        serviceName: w.service_name || 'termín',
        desiredDate: date,
        bookingUrl,
      })
    }
    if (w.client_phone && isSmsConfigured()) {
      const msg = `Uvolnil se termin ${date} u ${provider.name}. Rezervujte: ${bookingUrl}`
      await sendSms(w.client_phone, msg).catch(() => {})
    }
    await sql`UPDATE rez_waitlist SET status = 'notified', notified_at = NOW() WHERE id = ${w.id}`
    notified++
  }
  return notified
}
