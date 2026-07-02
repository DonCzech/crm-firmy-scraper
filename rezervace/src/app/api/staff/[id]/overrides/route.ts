import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET /api/staff/[id]/overrides — list all overrides for a staff member
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const staff = await sql`SELECT id FROM rez_staff WHERE id = ${params.id} AND user_id = ${user.userId} LIMIT 1`
    if (staff.length === 0) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    const overrides = await sql`
      SELECT id, date, is_available, start_time, end_time, note
      FROM rez_staff_availability_overrides
      WHERE staff_id = ${params.id}
      ORDER BY date ASC
    `
    return NextResponse.json(overrides)
  } catch (error) {
    console.error('Get staff overrides error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/staff/[id]/overrides — upsert override for a specific date
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const staff = await sql`SELECT id FROM rez_staff WHERE id = ${params.id} AND user_id = ${user.userId} LIMIT 1`
    if (staff.length === 0) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    const { date, is_available, start_time, end_time, note } = await request.json()
    if (!date) return NextResponse.json({ error: 'Datum je povinné' }, { status: 400 })

    const result = await sql`
      INSERT INTO rez_staff_availability_overrides (staff_id, date, is_available, start_time, end_time, note)
      VALUES (${params.id}, ${date}, ${is_available}, ${start_time || null}, ${end_time || null}, ${note || ''})
      ON CONFLICT (staff_id, date) DO UPDATE SET
        is_available = EXCLUDED.is_available,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        note = EXCLUDED.note
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Save staff override error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/staff/[id]/overrides?date=YYYY-MM-DD — remove override for a specific date
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const staff = await sql`SELECT id FROM rez_staff WHERE id = ${params.id} AND user_id = ${user.userId} LIMIT 1`
    if (staff.length === 0) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    const date = new URL(request.url).searchParams.get('date')
    if (!date) return NextResponse.json({ error: 'Datum je povinné' }, { status: 400 })

    await sql`DELETE FROM rez_staff_availability_overrides WHERE staff_id = ${params.id} AND date = ${date}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete staff override error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
