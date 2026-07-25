import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

// Analytika poskytovatele: trend tržeb, míra no-show, top služby, vytížení
// pracovníků a nejrušnější časy. Vše počítáno z rez_bookings.
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = user.userId

  const [revenueByMonth, statusCounts, topServices, byWeekday, byHour, staffUtil, totals] = await Promise.all([
    // Tržby za posledních 6 měsíců (jen realizované: confirmed/completed)
    sql`
      SELECT to_char(date_trunc('month', booking_date), 'YYYY-MM') as month,
             COALESCE(SUM(price), 0) as revenue, COUNT(*) as count
      FROM rez_bookings
      WHERE provider_id = ${uid}
        AND status IN ('confirmed','completed')
        AND booking_date >= (CURRENT_DATE - INTERVAL '6 months')
      GROUP BY 1 ORDER BY 1
    `,
    // Rozpad podle stavu (pro no-show rate)
    sql`SELECT status, COUNT(*) as count FROM rez_bookings WHERE provider_id = ${uid} GROUP BY status`,
    // Nejžádanější služby
    sql`
      SELECT s.name, COUNT(*) as count, COALESCE(SUM(b.price),0) as revenue
      FROM rez_bookings b JOIN rez_services s ON b.service_id = s.id
      WHERE b.provider_id = ${uid} AND b.status != 'cancelled'
      GROUP BY s.name ORDER BY count DESC LIMIT 8
    `,
    // Podle dne v týdnu (0=neděle)
    sql`
      SELECT EXTRACT(DOW FROM booking_date)::int as dow, COUNT(*) as count
      FROM rez_bookings WHERE provider_id = ${uid} AND status != 'cancelled'
      GROUP BY 1 ORDER BY 1
    `,
    // Podle hodiny
    sql`
      SELECT EXTRACT(HOUR FROM start_time)::int as hour, COUNT(*) as count
      FROM rez_bookings WHERE provider_id = ${uid} AND status != 'cancelled'
      GROUP BY 1 ORDER BY 1
    `,
    // Vytížení pracovníků
    sql`
      SELECT COALESCE(NULLIF(staff_name,''),'Bez přiřazení') as staff, COUNT(*) as count,
             COALESCE(SUM(price),0) as revenue
      FROM rez_bookings WHERE provider_id = ${uid} AND status != 'cancelled'
      GROUP BY 1 ORDER BY count DESC
    `,
    // Souhrn
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status != 'cancelled') as total,
        COUNT(*) FILTER (WHERE status = 'no_show') as no_shows,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(DISTINCT client_email) FILTER (WHERE client_email <> '') as clients,
        COALESCE(SUM(price) FILTER (WHERE status IN ('confirmed','completed')),0) as revenue_total
      FROM rez_bookings WHERE provider_id = ${uid}
    `,
  ])

  const t = totals[0]
  const attended = Number(t.total)
  const noShow = Number(t.no_shows)
  const noShowRate = attended > 0 ? Math.round((noShow / attended) * 1000) / 10 : 0

  return NextResponse.json({
    revenueByMonth,
    statusCounts,
    topServices,
    byWeekday,
    byHour,
    staffUtil,
    totals: {
      total: attended,
      noShows: noShow,
      cancelled: Number(t.cancelled),
      completed: Number(t.completed),
      clients: Number(t.clients),
      revenueTotal: Number(t.revenue_total),
      noShowRate,
    },
  })
}
