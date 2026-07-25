import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendReviewRequestEmail } from '@/lib/email'

// Po dokončené návštěvě pošli žádost o recenzi. Kandidáti: rezervace v minulosti
// (do ~14 dní zpět), stav 'confirmed' nebo 'completed', s e-mailem, bez odeslané
// žádosti. Termín už musel proběhnout.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rezervace-kappa.vercel.app'

  try {
    const today = new Date().toISOString().split('T')[0]
    const back = new Date()
    back.setDate(back.getDate() - 14)
    const backStr = back.toISOString().split('T')[0]

    const rows = await sql`
      SELECT b.id, b.client_name, b.client_email, b.review_token,
             b.booking_date, b.start_time,
             s.name as service_name, u.name as provider_name
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      JOIN rez_users u ON b.provider_id = u.id
      WHERE b.booking_date >= ${backStr}
        AND b.booking_date <= ${today}
        AND b.status IN ('confirmed', 'completed')
        AND b.review_request_sent = false
        AND b.client_email <> ''
        AND b.review_token IS NOT NULL
    `

    const now = Date.now()
    let sent = 0
    for (const b of rows) {
      const dateStr = String(b.booking_date).split('T')[0]
      const timeStr = String(b.start_time).substring(0, 5)
      const endMs = new Date(`${dateStr}T${timeStr}:00`).getTime()
      if (endMs > now) continue // termín ještě neproběhl

      await sendReviewRequestEmail({
        clientEmail: b.client_email,
        clientName: b.client_name,
        providerName: b.provider_name,
        serviceName: b.service_name,
        reviewUrl: `${appUrl}/review/${b.review_token}`,
      })
      await sql`UPDATE rez_bookings SET review_request_sent = true WHERE id = ${b.id}`
      sent++
    }

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    console.error('Cron review-requests error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
