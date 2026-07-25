import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendReminderEmail } from '@/lib/email'
import { sendSms, isSmsConfigured } from '@/lib/sms'

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rezervace-kappa.vercel.app'

  try {
    // Kandidáti: potvrzené rezervace v nejbližších ~3 dnech, bez odeslané připomínky.
    // Zda už je čas, rozhodujeme v JS podle per-poskytovatel reminder_hours, takže
    // cron může běžet klidně jednou za hodinu bez ohledu na okno připomínky.
    const horizon = new Date()
    horizon.setDate(horizon.getDate() + 3)
    const horizonStr = horizon.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    const bookings = await sql`
      SELECT
        b.id, b.client_name, b.client_email, b.client_phone,
        b.booking_date, b.start_time, b.duration_minutes,
        b.confirmation_token, b.reminder_sent, b.sms_reminder_sent,
        s.name as service_name,
        u.name as provider_name, u.id as provider_id,
        COALESCE(u.reminder_hours, 24) as reminder_hours, u.sms_reminders
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      JOIN rez_users u ON b.provider_id = u.id
      WHERE b.booking_date >= ${todayStr}
        AND b.booking_date <= ${horizonStr}
        AND b.status = 'confirmed'
        AND (b.reminder_sent = false OR (u.sms_reminders = true AND b.sms_reminder_sent = false))
    `

    const now = Date.now()
    let emailsSent = 0
    let smsSent = 0
    const smsOn = isSmsConfigured()

    for (const b of bookings) {
      const dateStr = String(b.booking_date).split('T')[0]
      const timeStr = String(b.start_time).substring(0, 5)
      const slotMs = new Date(`${dateStr}T${timeStr}:00`).getTime()
      const hoursUntil = (slotMs - now) / 3_600_000
      const windowH = Number(b.reminder_hours) || 24

      // Připomínku pošli, jakmile jsme uvnitř okna (a slot ještě nenastal)
      if (hoursUntil > windowH || hoursUntil <= 0) continue

      // E-mail
      if (!b.reminder_sent && b.client_email) {
        await sendReminderEmail({
          clientEmail: b.client_email,
          clientName: b.client_name,
          serviceName: b.service_name,
          providerName: b.provider_name,
          bookingDate: dateStr,
          startTime: timeStr,
          durationMinutes: b.duration_minutes,
          confirmationToken: b.confirmation_token,
          appUrl,
        })
        await sql`UPDATE rez_bookings SET reminder_sent = true WHERE id = ${b.id}`
        emailsSent++
      }

      // SMS
      if (b.sms_reminders === true && !b.sms_reminder_sent && b.client_phone && smsOn) {
        const msg = `Pripominka: ${b.service_name} ${dateStr} v ${timeStr}. ${b.provider_name}`
        const r = await sendSms(b.client_phone, msg)
        await sql`UPDATE rez_bookings SET sms_reminder_sent = true WHERE id = ${b.id}`
        await sql`INSERT INTO rez_sms_log (provider_id, booking_id, phone, body, kind, status, provider_ref)
          VALUES (${b.provider_id}, ${b.id}, ${b.client_phone}, ${msg}, 'reminder', ${r.ok ? 'sent' : 'failed'}, ${r.ref || r.error || ''})`.catch(() => {})
        if (r.ok) smsSent++
      }
    }

    return NextResponse.json({ ok: true, emailsSent, smsSent })
  } catch (error) {
    console.error('Cron reminders error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
