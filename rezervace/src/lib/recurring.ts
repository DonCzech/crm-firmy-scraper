import { sql } from '@/lib/db'

// Vygeneruje rezervace ze série do daného počtu týdnů dopředu. Přeskočí termíny,
// které kolidují s existující rezervací (unikátní slot index je poslední pojistka).
// Vrací počet nově vytvořených rezervací.
export async function generateRecurringBookings(seriesId: string, weeksAhead = 8): Promise<number> {
  const rows = await sql`
    SELECT rs.*, s.duration_minutes, s.price, s.currency, st.name as staff_name
    FROM rez_recurring_series rs
    JOIN rez_services s ON rs.service_id = s.id
    LEFT JOIN rez_staff st ON rs.staff_id = st.id
    WHERE rs.id = ${seriesId} AND rs.is_active = true
    LIMIT 1
  `
  if (rows.length === 0) return 0
  const r = rows[0]

  const startTime = String(r.start_time).substring(0, 5)
  const dow = Number(r.day_of_week)
  const interval = Math.max(1, Number(r.interval_weeks) || 1)

  // Najdi nejbližší budoucí datum s daným dnem v týdnu
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const first = new Date(now)
  const delta = (dow - first.getDay() + 7) % 7
  first.setDate(first.getDate() + delta)

  const until = r.until_date ? new Date(String(r.until_date)) : null
  const horizon = new Date(now)
  horizon.setDate(horizon.getDate() + weeksAhead * 7)

  let created = 0
  for (let d = new Date(first); d <= horizon; d.setDate(d.getDate() + interval * 7)) {
    if (until && d > until) break
    const dateStr = d.toISOString().split('T')[0]

    // Existuje už na tento den v sérii rezervace?
    const existing = await sql`
      SELECT 1 FROM rez_bookings
      WHERE recurring_group_id = ${seriesId} AND booking_date = ${dateStr} LIMIT 1
    `
    if (existing.length > 0) continue

    try {
      await sql`
        INSERT INTO rez_bookings (
          service_id, provider_id, staff_id, staff_name,
          client_name, client_email, client_phone,
          booking_date, start_time, duration_minutes,
          price, currency, status, recurring_group_id
        ) VALUES (
          ${r.service_id}, ${r.provider_id}, ${r.staff_id}, ${r.staff_name || ''},
          ${r.client_name}, ${(r.client_email || '').toLowerCase()}, ${r.client_phone || ''},
          ${dateStr}, ${startTime}, ${r.duration_minutes},
          ${r.price}, ${r.currency}, 'confirmed', ${seriesId}
        )
      `
      created++
    } catch {
      // kolize se slotem → přeskoč
    }
  }
  return created
}
