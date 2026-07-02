import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET /api/staff/[id]/availability
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    // Verify ownership
    const staff = await sql`
      SELECT id FROM rez_staff WHERE id = ${params.id} AND user_id = ${user.userId} LIMIT 1
    `
    if (staff.length === 0) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    const availability = await sql`
      SELECT * FROM rez_staff_availability
      WHERE staff_id = ${params.id}
      ORDER BY day_of_week ASC
    `
    return NextResponse.json(availability)
  } catch (error) {
    console.error('Get staff availability error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/staff/[id]/availability — upsert full week schedule
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const staff = await sql`
      SELECT id FROM rez_staff WHERE id = ${params.id} AND user_id = ${user.userId} LIMIT 1
    `
    if (staff.length === 0) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    const body = await request.json()
    // body: Array of { day_of_week, start_time, end_time, is_active }
    const slots: { day_of_week: number; start_time: string; end_time: string; is_active: boolean }[] = body

    for (const slot of slots) {
      await sql`
        INSERT INTO rez_staff_availability (staff_id, day_of_week, start_time, end_time, is_active)
        VALUES (${params.id}, ${slot.day_of_week}, ${slot.start_time}, ${slot.end_time}, ${slot.is_active})
        ON CONFLICT (staff_id, day_of_week) DO UPDATE SET
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          is_active = EXCLUDED.is_active
      `
    }

    const updated = await sql`
      SELECT * FROM rez_staff_availability WHERE staff_id = ${params.id} ORDER BY day_of_week ASC
    `
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Save staff availability error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
