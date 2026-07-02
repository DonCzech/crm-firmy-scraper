import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET /api/staff — admin: list all staff for current user
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const staff = await sql`
      SELECT s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sa.id,
              'staff_id', sa.staff_id,
              'day_of_week', sa.day_of_week,
              'start_time', sa.start_time,
              'end_time', sa.end_time,
              'is_active', sa.is_active
            ) ORDER BY sa.day_of_week
          ) FILTER (WHERE sa.id IS NOT NULL),
          '[]'
        ) as availability
      FROM rez_staff s
      LEFT JOIN rez_staff_availability sa ON sa.staff_id = s.id
      WHERE s.user_id = ${user.userId}
      GROUP BY s.id
      ORDER BY s.sort_order ASC, s.created_at ASC
    `
    return NextResponse.json(staff)
  } catch (error) {
    console.error('Get staff error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/staff — admin: create new staff member
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const body = await request.json()
    const { name, color, bio, avatar_url } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Jméno je povinné' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO rez_staff (user_id, name, color, bio, avatar_url)
      VALUES (${user.userId}, ${name.trim()}, ${color || '#6366f1'}, ${bio || ''}, ${avatar_url || ''})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Create staff error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
