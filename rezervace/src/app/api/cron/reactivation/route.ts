import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendReactivationEmail } from '@/lib/email'

// Reaktivace: klientům, jejichž poslední návštěva byla ~60 dní zpět a od té doby
// nemají žádnou budoucí rezervaci, pošli "chybíte nám" e-mail. reactivation_sent
// se značí na poslední rezervaci klienta, aby nechodil opakovaně.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rezervace-kappa.vercel.app'

  try {
    const today = new Date().toISOString().split('T')[0]
    const from = new Date(); from.setDate(from.getDate() - 90)
    const to = new Date(); to.setDate(to.getDate() - 60)
    const fromStr = from.toISOString().split('T')[0]
    const toStr = to.toISOString().split('T')[0]

    // Poslední rezervace každého klienta v okně 60–90 dní zpět, bez budoucí rezervace,
    // bez už odeslané reaktivace.
    const rows = await sql`
      SELECT DISTINCT ON (b.provider_id, b.client_email)
             b.id, b.client_name, b.client_email, b.provider_id,
             u.name as provider_name, u.slug as provider_slug
      FROM rez_bookings b
      JOIN rez_users u ON b.provider_id = u.id
      WHERE b.client_email <> ''
        AND b.booking_date BETWEEN ${fromStr} AND ${toStr}
        AND b.status IN ('confirmed', 'completed')
        AND b.reactivation_sent = false
        AND NOT EXISTS (
          SELECT 1 FROM rez_bookings f
          WHERE f.provider_id = b.provider_id
            AND f.client_email = b.client_email
            AND f.booking_date > ${toStr}
            AND f.status != 'cancelled'
        )
      ORDER BY b.provider_id, b.client_email, b.booking_date DESC
    `

    let sent = 0
    for (const b of rows) {
      await sendReactivationEmail({
        clientEmail: b.client_email,
        clientName: b.client_name,
        providerName: b.provider_name,
        bookingUrl: `${appUrl}/book/${b.provider_slug}`,
      })
      // Označíme všechny minulé rezervace tohoto klienta jako "reaktivace odeslána"
      await sql`
        UPDATE rez_bookings SET reactivation_sent = true
        WHERE provider_id = ${b.provider_id} AND client_email = ${b.client_email} AND booking_date <= ${today}
      `
      sent++
    }

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    console.error('Cron reactivation error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
