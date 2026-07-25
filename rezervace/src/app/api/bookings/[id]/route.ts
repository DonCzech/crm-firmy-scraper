import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { sendCancellationEmail } from '@/lib/email'
import { notifyWaitlistForOpening } from '@/lib/notify'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { status, booking_date, start_time } = body

    // Verify ownership
    const existing = await sql`
      SELECT b.*, s.name as service_name
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      WHERE b.id = ${params.id} AND b.provider_id = ${user.userId}
      LIMIT 1
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
    }

    // Move booking (drag & drop)
    if (booking_date || start_time) {
      await sql`
        UPDATE rez_bookings SET
          booking_date = COALESCE(${booking_date ?? null}, booking_date),
          start_time = COALESCE(${start_time ?? null}, start_time),
          updated_at = NOW()
        WHERE id = ${params.id}
      `
      return NextResponse.json({ success: true })
    }

    // Status change
    const validStatuses = ['confirmed', 'cancelled', 'completed', 'pending', 'no_show']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Neplatný stav' }, { status: 400 })
    }

    await sql`
      UPDATE rez_bookings SET status = ${status}, updated_at = NOW()
      WHERE id = ${params.id}
    `

    // Send cancellation email + nabídka čekací listině
    if (status === 'cancelled') {
      const booking = existing[0]
      sendCancellationEmail({
        clientEmail: booking.client_email,
        clientName: booking.client_name,
        serviceName: booking.service_name,
        bookingDate: String(booking.booking_date).split('T')[0],
        startTime: String(booking.start_time).substring(0, 5),
      }).catch(console.error)
      notifyWaitlistForOpening(user.userId, String(booking.booking_date).split('T')[0]).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await sql`
      DELETE FROM rez_bookings
      WHERE id = ${params.id} AND provider_id = ${user.userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
