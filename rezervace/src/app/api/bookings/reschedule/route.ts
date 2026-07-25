import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { sendConfirmationsForBooking } from '@/lib/notify'

// Samoobslužné přeobjednání klientem přes potvrzovací token.
// POST /api/bookings/reschedule?token=...  body: { date, time }
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Chybí token' }, { status: 400 })

  const rl = rateLimit(`reschedule:${clientIp(request)}`, { limit: 10, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: 'Příliš mnoho pokusů' }, { status: 429 })

  let body: { date?: string; time?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Neplatný požadavek' }, { status: 400 })
  }
  const { date, time } = body
  if (!date || !time || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: 'Neplatné datum nebo čas' }, { status: 400 })
  }

  try {
    const rows = await sql`
      SELECT id, provider_id, staff_id, duration_minutes, status, booking_date, start_time
      FROM rez_bookings WHERE confirmation_token = ${token} LIMIT 1
    `
    if (rows.length === 0) return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
    const b = rows[0]
    if (b.status === 'cancelled') return NextResponse.json({ error: 'Rezervace je zrušena' }, { status: 409 })

    const dur = Number(b.duration_minutes)
    const [nh, nm] = time.split(':').map(Number)
    const newStart = nh * 60 + nm
    const newEnd = newStart + dur

    // Kontrola konfliktu (kromě sebe sama)
    const others = b.staff_id
      ? await sql`SELECT id, start_time, duration_minutes FROM rez_bookings
          WHERE staff_id = ${b.staff_id} AND booking_date = ${date} AND status != 'cancelled' AND id != ${b.id}`
      : await sql`SELECT id, start_time, duration_minutes FROM rez_bookings
          WHERE provider_id = ${b.provider_id} AND booking_date = ${date} AND status != 'cancelled' AND id != ${b.id}`

    const conflict = others.some((o: Record<string, unknown>) => {
      const [bh, bm] = String(o.start_time).substring(0, 5).split(':').map(Number)
      const bs = bh * 60 + bm
      const be = bs + Number(o.duration_minutes)
      return newStart < be && newEnd > bs
    })
    if (conflict) return NextResponse.json({ error: 'Tento termín je již obsazen' }, { status: 409 })

    try {
      await sql`
        UPDATE rez_bookings
        SET booking_date = ${date}, start_time = ${time}, status = 'confirmed',
            reminder_sent = false, sms_reminder_sent = false, updated_at = NOW()
        WHERE id = ${b.id}
      `
    } catch (err) {
      if (String((err as { code?: string })?.code) === '23505') {
        return NextResponse.json({ error: 'Tento termín byl právě obsazen' }, { status: 409 })
      }
      throw err
    }

    // Znovu odešleme potvrzení s novým termínem (+ .ics)
    await sendConfirmationsForBooking(b.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reschedule error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
