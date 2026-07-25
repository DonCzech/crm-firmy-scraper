import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { generateRecurringBookings } from '@/lib/recurring'

// GET — admin: seznam sérií
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT rs.*, s.name as service_name, st.name as staff_name,
      (SELECT COUNT(*) FROM rez_bookings b WHERE b.recurring_group_id = rs.id AND b.status != 'cancelled') as booking_count
    FROM rez_recurring_series rs
    JOIN rez_services s ON rs.service_id = s.id
    LEFT JOIN rez_staff st ON rs.staff_id = st.id
    WHERE rs.provider_id = ${user.userId}
    ORDER BY rs.created_at DESC
  `
  return NextResponse.json(rows)
}

// POST — admin: založí sérii a rovnou vygeneruje nejbližší termíny
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { serviceId, staffId, clientName, clientEmail, clientPhone, dayOfWeek, startTime, intervalWeeks, untilDate } = body

  if (!serviceId || !clientName || dayOfWeek == null || !startTime) {
    return NextResponse.json({ error: 'Chybí povinné údaje' }, { status: 400 })
  }

  // Ověř vlastnictví služby
  const svc = await sql`SELECT id FROM rez_services WHERE id = ${serviceId} AND user_id = ${user.userId} LIMIT 1`
  if (svc.length === 0) return NextResponse.json({ error: 'Služba nenalezena' }, { status: 404 })

  const rows = await sql`
    INSERT INTO rez_recurring_series (
      provider_id, service_id, staff_id, client_name, client_email, client_phone,
      day_of_week, start_time, interval_weeks, until_date
    ) VALUES (
      ${user.userId}, ${serviceId}, ${staffId || null}, ${clientName}, ${clientEmail || ''}, ${clientPhone || ''},
      ${Number(dayOfWeek)}, ${startTime}, ${Number(intervalWeeks) || 1}, ${untilDate || null}
    )
    RETURNING id
  `
  const seriesId = rows[0].id
  const created = await generateRecurringBookings(seriesId, 8)

  return NextResponse.json({ success: true, id: seriesId, created }, { status: 201 })
}
