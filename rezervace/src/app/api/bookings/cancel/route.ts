import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendCancellationEmail } from '@/lib/email'
import { notifyWaitlistForOpening } from '@/lib/notify'

// GET — get booking info by token (for cancel preview page)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  try {
    const rows = await sql`
      SELECT
        b.id, b.status, b.client_name, b.booking_date, b.start_time, b.duration_minutes,
        b.service_id, b.staff_id,
        s.name as service_name,
        u.name as provider_name, u.slug as provider_slug
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      JOIN rez_users u ON b.provider_id = u.id
      WHERE b.confirmation_token = ${token}
      LIMIT 1
    `
    if (rows.length === 0) return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST — cancel booking by token
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  try {
    const rows = await sql`
      SELECT b.id, b.status, b.client_name, b.client_email, b.booking_date, b.start_time,
             b.provider_id, s.name as service_name
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      WHERE b.confirmation_token = ${token}
      LIMIT 1
    `
    if (rows.length === 0) return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })

    const booking = rows[0]
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Rezervace již byla zrušena' }, { status: 409 })
    }

    await sql`
      UPDATE rez_bookings SET status = 'cancelled', updated_at = NOW()
      WHERE confirmation_token = ${token}
    `

    await sendCancellationEmail({
      clientEmail: booking.client_email,
      clientName: booking.client_name,
      serviceName: booking.service_name,
      bookingDate: String(booking.booking_date).split('T')[0],
      startTime: String(booking.start_time).substring(0, 5),
    })

    // Uvolněný termín nabídneme čekající listině (best-effort, neblokuje odpověď)
    notifyWaitlistForOpening(booking.provider_id, String(booking.booking_date).split('T')[0]).catch(() => {})

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
