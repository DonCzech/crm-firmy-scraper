import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendReminderEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rezervace-kappa.vercel.app'

  try {
    // Find confirmed bookings for tomorrow that haven't had a reminder sent
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const bookings = await sql`
      SELECT
        b.id, b.client_name, b.client_email,
        b.booking_date, b.start_time, b.duration_minutes,
        b.confirmation_token,
        s.name as service_name,
        u.name as provider_name
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      JOIN rez_users u ON b.provider_id = u.id
      WHERE b.booking_date = ${tomorrowStr}
        AND b.status = 'confirmed'
        AND b.reminder_sent = false
    `

    let sent = 0
    for (const b of bookings) {
      await sendReminderEmail({
        clientEmail: b.client_email,
        clientName: b.client_name,
        serviceName: b.service_name,
        providerName: b.provider_name,
        bookingDate: String(b.booking_date).split('T')[0],
        startTime: String(b.start_time).substring(0, 5),
        durationMinutes: b.duration_minutes,
        confirmationToken: b.confirmation_token,
        appUrl,
      })

      await sql`UPDATE rez_bookings SET reminder_sent = true WHERE id = ${b.id}`
      sent++
    }

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    console.error('Cron reminders error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
