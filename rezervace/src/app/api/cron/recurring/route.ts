import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { generateRecurringBookings } from '@/lib/recurring'

// Posouvá aktivní série dopředu — doplní chybějící budoucí termíny (klouzavé okno).
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const series = await sql`
      SELECT id FROM rez_recurring_series
      WHERE is_active = true AND (until_date IS NULL OR until_date >= CURRENT_DATE)
    `
    let created = 0
    for (const s of series) {
      created += await generateRecurringBookings(s.id, 8)
    }
    return NextResponse.json({ ok: true, series: series.length, created })
  } catch (error) {
    console.error('Cron recurring error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
