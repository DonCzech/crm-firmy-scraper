import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

// POST /api/admin/bookings — admin creates a booking on behalf of a client
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const body = await request.json()
    const { serviceId, clientName, clientEmail, clientPhone, clientNotes, bookingDate, startTime, staffId, paymentMethod } = body

    if (!serviceId || !clientName || !bookingDate || !startTime) {
      return NextResponse.json({ error: 'Chybí povinné údaje' }, { status: 400 })
    }

    // Povinnost kontaktů dle nastavení poskytovatele (stejný kontrakt jako widget)
    const settingsRows = await sql`
      SELECT require_email, require_phone FROM rez_users WHERE id = ${user.userId} LIMIT 1
    `
    const requireEmail = settingsRows[0]?.require_email !== false
    const requirePhone = settingsRows[0]?.require_phone === true
    if (requireEmail && !clientEmail) {
      return NextResponse.json({ error: 'E-mail je povinný' }, { status: 400 })
    }
    if (requirePhone && !clientPhone) {
      return NextResponse.json({ error: 'Telefon je povinný' }, { status: 400 })
    }
    if (!clientEmail && !clientPhone) {
      return NextResponse.json({ error: 'Zadejte e-mail nebo telefon' }, { status: 400 })
    }

    // Verify the service belongs to this admin
    const services = await sql`
      SELECT * FROM rez_services WHERE id = ${serviceId} AND user_id = ${user.userId} AND is_active = true LIMIT 1
    `
    if (services.length === 0) {
      return NextResponse.json({ error: 'Služba nenalezena' }, { status: 404 })
    }
    const service = services[0]

    // Resolve staff
    let resolvedStaffId: string | null = null
    let resolvedStaffName = ''
    if (staffId) {
      const staffRows = await sql`
        SELECT id, name FROM rez_staff WHERE id = ${staffId} AND user_id = ${user.userId} AND is_active = true LIMIT 1
      `
      if (staffRows.length > 0) {
        resolvedStaffId = staffRows[0].id
        resolvedStaffName = staffRows[0].name
      }
    }

    // Check for conflicts
    const [sh, sm] = startTime.split(':').map(Number)
    const newStartMin = sh * 60 + sm
    const newEndMin = newStartMin + Number(service.duration_minutes)

    const existing = resolvedStaffId
      ? await sql`
          SELECT start_time, duration_minutes FROM rez_bookings
          WHERE staff_id = ${resolvedStaffId} AND booking_date = ${bookingDate} AND status != 'cancelled'
        `
      : await sql`
          SELECT start_time, duration_minutes FROM rez_bookings
          WHERE provider_id = ${user.userId} AND booking_date = ${bookingDate} AND status != 'cancelled'
        `

    const conflict = existing.some((b: Record<string, unknown>) => {
      const [bh, bm] = String(b.start_time).substring(0, 5).split(':').map(Number)
      const bStart = bh * 60 + bm
      const bEnd = bStart + Number(b.duration_minutes)
      return newStartMin < bEnd && newEndMin > bStart
    })

    if (conflict) {
      return NextResponse.json({ error: 'Tento termín je již obsazen' }, { status: 409 })
    }

    const result = await sql`
      INSERT INTO rez_bookings (
        service_id, provider_id, staff_id, staff_name,
        client_name, client_email, client_phone, client_notes,
        booking_date, start_time, duration_minutes,
        price, currency, status, payment_method
      ) VALUES (
        ${serviceId}, ${user.userId}, ${resolvedStaffId}, ${resolvedStaffName},
        ${clientName}, ${(clientEmail || '').toLowerCase()}, ${clientPhone || ''}, ${clientNotes || ''},
        ${bookingDate}, ${startTime}, ${service.duration_minutes},
        ${service.price}, ${service.currency}, 'confirmed', ${paymentMethod || ''}
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, booking: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Admin create booking error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
