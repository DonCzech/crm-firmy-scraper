import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const date = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')
  const staffId = searchParams.get('staffId') // optional: filter by specific staff member

  if (!slug || !date || !serviceId) {
    return NextResponse.json({ error: 'Chybí parametry slug, date a serviceId' }, { status: 400 })
  }

  try {
    await initDb()

    // Get provider
    const users = await sql`
      SELECT id, timezone, min_booking_hours, buffer_minutes FROM rez_users WHERE slug = ${slug} LIMIT 1
    `
    if (users.length === 0) {
      return NextResponse.json({ error: 'Uživatel nenalezen' }, { status: 404 })
    }
    const provider = users[0]

    // Get service
    const services = await sql`
      SELECT duration_minutes FROM rez_services
      WHERE id = ${serviceId} AND user_id = ${provider.id} AND is_active = true
      LIMIT 1
    `
    if (services.length === 0) {
      return NextResponse.json({ error: 'Služba nenalezena' }, { status: 404 })
    }
    const service = services[0]

    // Get day of week for the date
    const dateObj = new Date(date + 'T00:00:00')
    const dayOfWeek = dateObj.getDay()

    let start_time: string
    let end_time: string

    if (staffId) {
      // Use staff-specific availability
      const staffOverrides = await sql`
        SELECT is_available, start_time, end_time
        FROM rez_staff_availability_overrides
        WHERE staff_id = ${staffId} AND date = ${date}::date
        LIMIT 1
      `
      if (staffOverrides.length > 0) {
        const ov = staffOverrides[0]
        if (!ov.is_available) return NextResponse.json({ slots: [] })
        // Fall back to default hours if override has no explicit times
        if (ov.start_time && ov.end_time) {
          start_time = String(ov.start_time).substring(0, 5)
          end_time = String(ov.end_time).substring(0, 5)
        } else {
          start_time = '09:00'
          end_time = '17:00'
        }
      } else {
        const staffAvail = await sql`
          SELECT start_time, end_time, is_active
          FROM rez_staff_availability
          WHERE staff_id = ${staffId} AND day_of_week = ${dayOfWeek}
          LIMIT 1
        `
        if (staffAvail.length === 0) {
          // No schedule configured → default Mon-Fri 09:00-17:00
          if (dayOfWeek < 1 || dayOfWeek > 5) return NextResponse.json({ slots: [] })
          start_time = '09:00'
          end_time = '17:00'
        } else if (!staffAvail[0].is_active) {
          return NextResponse.json({ slots: [] })
        } else {
          start_time = String(staffAvail[0].start_time).substring(0, 5)
          end_time = String(staffAvail[0].end_time).substring(0, 5)
        }
      }
    } else {
      // No specific staff selected (Kdokoli mode)
      // Check if provider has staff members → use union of their availability
      const allStaff = await sql`
        SELECT id FROM rez_staff WHERE user_id = ${provider.id} AND is_active = true
      `

      if (allStaff.length > 0) {
        // Build union of all staff windows for this day
        const bufferMins = Number(provider.buffer_minutes) || 0
        const minBookingHours = Number(provider.min_booking_hours) || 0
        const duration = service.duration_minutes

        // For each staff, get their window for this day
        type StaffWindow = { staffId: string; startMin: number; endMin: number }
        const staffWindows: StaffWindow[] = []

        for (const s of allStaff) {
          // Check override first
          const ovRows = await sql`
            SELECT is_available, start_time, end_time
            FROM rez_staff_availability_overrides
            WHERE staff_id = ${s.id} AND date = ${date}::date LIMIT 1
          `
          if (ovRows.length > 0) {
            if (!ovRows[0].is_available) continue
            // Use override times if present, otherwise default to 09:00-17:00
            if (ovRows[0].start_time && ovRows[0].end_time) {
              const [sh, sm] = String(ovRows[0].start_time).substring(0, 5).split(':').map(Number)
              const [eh, em] = String(ovRows[0].end_time).substring(0, 5).split(':').map(Number)
              staffWindows.push({ staffId: s.id, startMin: sh * 60 + sm, endMin: eh * 60 + em })
            } else {
              staffWindows.push({ staffId: s.id, startMin: 9 * 60, endMin: 17 * 60 })
            }
          } else {
            const avRows = await sql`
              SELECT start_time, end_time, is_active
              FROM rez_staff_availability
              WHERE staff_id = ${s.id} AND day_of_week = ${dayOfWeek} LIMIT 1
            `
            if (avRows.length === 0) {
              // No schedule configured → default Mon-Fri 09:00-17:00
              if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                staffWindows.push({ staffId: s.id, startMin: 9 * 60, endMin: 17 * 60 })
              }
              continue
            }
            if (!avRows[0].is_active) continue
            const [sh, sm] = String(avRows[0].start_time).substring(0, 5).split(':').map(Number)
            const [eh, em] = String(avRows[0].end_time).substring(0, 5).split(':').map(Number)
            staffWindows.push({ staffId: s.id, startMin: sh * 60 + sm, endMin: eh * 60 + em })
          }
        }

        if (staffWindows.length === 0) return NextResponse.json({ slots: [] })

        // Union window: min startMin → max endMin across all staff
        const unionStart = Math.min(...staffWindows.map((w) => w.startMin))
        const unionEnd = Math.max(...staffWindows.map((w) => w.endMin))

        // Get bookings per staff for that day
        const dayBookings = await sql`
          SELECT staff_id, start_time, duration_minutes FROM rez_bookings
          WHERE provider_id = ${provider.id}
            AND booking_date = ${date}
            AND status != 'cancelled'
            AND staff_id IS NOT NULL
        `

        // Also get provider-level bookings (no staff assigned)
        const providerBookings = await sql`
          SELECT start_time, duration_minutes FROM rez_bookings
          WHERE provider_id = ${provider.id}
            AND booking_date = ${date}
            AND status != 'cancelled'
            AND staff_id IS NULL
        `

        const now = new Date()
        const cutoffMs = now.getTime() + minBookingHours * 60 * 60 * 1000
        const cutoffDt = new Date(cutoffMs)
        const cutoffDateStr = cutoffDt.toISOString().split('T')[0]
        const cutoffMinutes = cutoffDt.getHours() * 60 + cutoffDt.getMinutes()
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        const isToday = date === now.toISOString().split('T')[0]

        const result: { time: string; available: boolean }[] = []
        for (let min = unionStart; min + duration <= unionEnd; min += duration) {
          const h = Math.floor(min / 60)
          const m = min % 60
          const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
          const slotEnd = min + duration

          // Time-based blocks
          let timeBlocked = false
          if (minBookingHours > 0) {
            if (date < cutoffDateStr || (date === cutoffDateStr && min < cutoffMinutes)) timeBlocked = true
          } else if (isToday && min <= nowMinutes + 30) {
            timeBlocked = true
          }

          if (timeBlocked) {
            result.push({ time: timeStr, available: false })
            continue
          }

          // Check if at least one staff member is free during this slot
          let anyFree = false
          for (const w of staffWindows) {
            // Slot must fit within this staff's window
            if (min < w.startMin || slotEnd > w.endMin) continue

            // Check that staff member has no booking conflict
            const staffBooked = (dayBookings as Record<string, unknown>[])
              .filter((b) => b.staff_id === w.staffId)
              .some((b) => {
                const [bh, bm] = String(b.start_time).substring(0, 5).split(':').map(Number)
                const bs = bh * 60 + bm
                const be = bs + Number(b.duration_minutes)
                return min < be + bufferMins && slotEnd > bs - bufferMins
              })

            // Also block if provider-level bookings conflict
            const providerConflict = (providerBookings as Record<string, unknown>[]).some((b) => {
              const [bh, bm] = String(b.start_time).substring(0, 5).split(':').map(Number)
              const bs = bh * 60 + bm
              const be = bs + Number(b.duration_minutes)
              return min < be + bufferMins && slotEnd > bs - bufferMins
            })

            if (!staffBooked && !providerConflict) {
              anyFree = true
              break
            }
          }

          result.push({ time: timeStr, available: anyFree })
        }

        return NextResponse.json({ slots: result })
      }

      // No staff at all → use provider-level availability
      const overrides = await sql`
        SELECT is_available, start_time, end_time
        FROM rez_availability_overrides
        WHERE user_id = ${provider.id} AND date = ${date}::date
        LIMIT 1
      `
      if (overrides.length > 0) {
        const ov = overrides[0]
        if (!ov.is_available) return NextResponse.json({ slots: [] })
        start_time = String(ov.start_time).substring(0, 5)
        end_time = String(ov.end_time).substring(0, 5)
      } else {
        const avail = await sql`
          SELECT start_time, end_time, is_active
          FROM rez_availability
          WHERE user_id = ${provider.id} AND day_of_week = ${dayOfWeek}
          LIMIT 1
        `
        if (avail.length === 0 || !avail[0].is_active) return NextResponse.json({ slots: [] })
        start_time = String(avail[0].start_time).substring(0, 5)
        end_time = String(avail[0].end_time).substring(0, 5)
      }
    }

    // Generate slots (provider-level path)
    const slots: string[] = []
    const [startH, startM] = start_time!.split(':').map(Number)
    const [endH, endM] = end_time!.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const duration = service.duration_minutes

    for (let min = startMinutes; min + duration <= endMinutes; min += duration) {
      const h = Math.floor(min / 60)
      const m = min % 60
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }

    const booked = await sql`
      SELECT start_time, duration_minutes FROM rez_bookings
      WHERE provider_id = ${provider.id}
        AND booking_date = ${date}
        AND status != 'cancelled'
    `

    const bufferMins = Number(provider.buffer_minutes) || 0
    const minBookingHours = Number(provider.min_booking_hours) || 0

    const bookedRanges = booked.map((b: Record<string, unknown>) => {
      const [bh, bm] = String(b.start_time).substring(0, 5).split(':').map(Number)
      const startMin = bh * 60 + bm
      const endMin = startMin + Number(b.duration_minutes)
      return { startMin, endMin }
    })

    const now = new Date()
    const cutoffMs = now.getTime() + minBookingHours * 60 * 60 * 1000
    const cutoffDt = new Date(cutoffMs)
    const cutoffDateStr = cutoffDt.toISOString().split('T')[0]
    const cutoffMinutes = cutoffDt.getHours() * 60 + cutoffDt.getMinutes()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const isToday = date === now.toISOString().split('T')[0]

    const result = slots.map((time) => {
      const [h, m] = time.split(':').map(Number)
      const slotMin = h * 60 + m
      const slotEndMin = slotMin + duration

      let blocked = false
      for (const r of bookedRanges) {
        if (slotMin < r.endMin + bufferMins && slotEndMin > r.startMin - bufferMins) {
          blocked = true
          break
        }
      }

      if (!blocked && minBookingHours > 0) {
        if (date < cutoffDateStr || (date === cutoffDateStr && slotMin < cutoffMinutes)) blocked = true
      }

      if (!blocked && minBookingHours === 0 && isToday) {
        if (slotMin <= nowMinutes + 30) blocked = true
      }

      return { time, available: !blocked }
    })

    return NextResponse.json({ slots: result })
  } catch (error) {
    console.error('Get slots error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
