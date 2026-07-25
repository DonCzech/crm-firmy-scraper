import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { buildIcsFeed } from '@/lib/ics'

// Veřejný iCal feed pro odběr v kalendáři (Google/Apple). Autorizuje neuhodnutelný
// token (rez_users.ical_token). Vrací nadcházející nezrušené rezervace.
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token
  if (!token) return new NextResponse('Not found', { status: 404 })

  try {
    const users = await sql`SELECT id, name FROM rez_users WHERE ical_token = ${token} LIMIT 1`
    if (users.length === 0) return new NextResponse('Not found', { status: 404 })
    const user = users[0]

    const from = new Date()
    from.setDate(from.getDate() - 1)
    const fromStr = from.toISOString().split('T')[0]

    const rows = await sql`
      SELECT b.id, b.booking_date, b.start_time, b.duration_minutes, b.client_name,
             b.client_phone, b.status, s.name as service_name, b.staff_name
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      WHERE b.provider_id = ${user.id}
        AND b.booking_date >= ${fromStr}
        AND b.status != 'cancelled'
      ORDER BY b.booking_date, b.start_time
    `

    const events = rows.map((b: Record<string, unknown>) => ({
      uid: `${b.id}@rezora.cz`,
      title: `${b.service_name} – ${b.client_name}`,
      description: [b.staff_name ? `Pracovník: ${b.staff_name}` : '', b.client_phone ? `Tel: ${b.client_phone}` : '']
        .filter(Boolean).join('\n'),
      date: String(b.booking_date).split('T')[0],
      startTime: String(b.start_time).substring(0, 5),
      durationMinutes: Number(b.duration_minutes),
    }))

    const feed = buildIcsFeed(`Rezervace – ${user.name}`, events)

    return new NextResponse(feed, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="rezervace.ics"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('iCal feed error:', error)
    return new NextResponse('Server error', { status: 500 })
  }
}
