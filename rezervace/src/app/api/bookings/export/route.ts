import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const bookings = await sql`
      SELECT
        b.id,
        b.client_name,
        b.client_email,
        b.client_phone,
        b.client_notes,
        b.booking_date,
        b.start_time,
        b.duration_minutes,
        b.price,
        b.currency,
        b.status,
        b.created_at,
        s.name as service_name
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      WHERE b.provider_id = ${user.userId}
      ORDER BY b.booking_date DESC, b.start_time DESC
    `

    const header = ['ID', 'Klient', 'E-mail', 'Telefon', 'Poznámka', 'Datum', 'Čas', 'Délka (min)', 'Cena', 'Měna', 'Stav', 'Služba', 'Vytvořeno']
    const rows = bookings.map((b: Record<string, unknown>) => [
      b.id,
      b.client_name,
      b.client_email,
      b.client_phone || '',
      (String(b.client_notes || '')).replace(/"/g, '""'),
      String(b.booking_date).split('T')[0],
      String(b.start_time).substring(0, 5),
      b.duration_minutes,
      b.price,
      b.currency,
      b.status,
      b.service_name,
      String(b.created_at).split('T')[0],
    ])

    const csvLines = [header, ...rows].map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
    const csv = '\uFEFF' + csvLines.join('\r\n') // BOM for Excel UTF-8

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rezervace-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export bookings error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
