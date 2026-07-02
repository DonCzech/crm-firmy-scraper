import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'

// GET /api/bookings/available-dates?slug=...&month=YYYY-MM&staffId=...
// Returns dates that have at least one available staff member (respects overrides)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const month = searchParams.get('month') // "YYYY-MM"
  const staffId = searchParams.get('staffId') // optional

  if (!slug || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const year = Number(month.split('-')[0])
  const monthNum = Number(month.split('-')[1])
  const daysInMonth = new Date(year, monthNum, 0).getDate()

  try {
    await initDb()

    const users = await sql`SELECT id FROM rez_users WHERE slug = ${slug} LIMIT 1`
    if (!users.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const provider = users[0]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Collect staff IDs to check
    let staffIds: string[] = []
    if (staffId) {
      staffIds = [staffId]
    } else {
      const staffRows = await sql`
        SELECT id FROM rez_staff WHERE user_id = ${provider.id} AND is_active = true
      `
      staffIds = staffRows.map((s: Record<string, unknown>) => String(s.id))
    }

    const availableDates: string[] = []

    if (staffIds.length === 0) {
      // No staff → use provider-level availability
      const providerOverrides = await sql`
        SELECT date::text as date, is_available FROM rez_availability_overrides
        WHERE user_id = ${provider.id}
          AND date >= ${`${month}-01`}::date
          AND date <= ${`${month}-${String(daysInMonth).padStart(2, '0')}`}::date
      `
      const providerAvail = await sql`
        SELECT day_of_week, is_active FROM rez_availability WHERE user_id = ${provider.id}
      `

      const ovMap = new Map<string, boolean>(
        providerOverrides.map((o: Record<string, unknown>) => [
          String(o.date).substring(0, 10),
          Boolean(o.is_available),
        ])
      )
      const avMap = new Map<number, boolean>(
        providerAvail.map((a: Record<string, unknown>) => [Number(a.day_of_week), Boolean(a.is_active)])
      )

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, monthNum - 1, d)
        if (dateObj < today) continue
        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const dow = dateObj.getDay()
        if (ovMap.has(dateStr)) {
          if (ovMap.get(dateStr)) availableDates.push(dateStr)
        } else if (avMap.get(dow)) {
          availableDates.push(dateStr)
        }
      }
    } else {
      // Per-staff: fetch all overrides + regular availability for the month in bulk
      const overridesPerStaff = new Map<string, Map<string, boolean>>() // staffId -> date -> is_available
      const availabilityPerStaff = new Map<string, Map<number, boolean>>() // staffId -> dow -> is_active

      for (const sid of staffIds) {
        // Overrides for this staff in the month
        const ovRows = await sql`
          SELECT date::text as date, is_available
          FROM rez_staff_availability_overrides
          WHERE staff_id = ${sid}
            AND date >= ${`${month}-01`}::date
            AND date <= ${`${month}-${String(daysInMonth).padStart(2, '0')}`}::date
        `
        const ovMap = new Map<string, boolean>(
          ovRows.map((o: Record<string, unknown>) => [String(o.date).substring(0, 10), Boolean(o.is_available)])
        )
        overridesPerStaff.set(sid, ovMap)

        // Regular weekly availability
        const avRows = await sql`
          SELECT day_of_week, is_active FROM rez_staff_availability WHERE staff_id = ${sid}
        `
        // If staff has no availability configured → default Mon-Fri (matches UI default)
        const avMap = avRows.length > 0
          ? new Map<number, boolean>(avRows.map((a: Record<string, unknown>) => [Number(a.day_of_week), Boolean(a.is_active)]))
          : new Map<number, boolean>([[1, true], [2, true], [3, true], [4, true], [5, true]])
        availabilityPerStaff.set(sid, avMap)
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, monthNum - 1, d)
        if (dateObj < today) continue
        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const dow = dateObj.getDay()

        let anyAvailable = false
        for (const sid of staffIds) {
          const ovMap = overridesPerStaff.get(sid)
          const avMap = availabilityPerStaff.get(sid)

          if (ovMap?.has(dateStr)) {
            if (ovMap.get(dateStr)) { anyAvailable = true; break }
            continue // explicitly off via override
          }
          if (avMap?.get(dow)) { anyAvailable = true; break }
        }

        if (anyAvailable) availableDates.push(dateStr)
      }
    }

    return NextResponse.json({ dates: availableDates })
  } catch (error) {
    console.error('Available dates error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
