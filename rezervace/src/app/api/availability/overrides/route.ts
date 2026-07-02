import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const overrides = await sql`
      SELECT * FROM rez_availability_overrides
      WHERE user_id = ${user.userId}
      ORDER BY date ASC
    `
    return NextResponse.json(overrides)
  } catch (error) {
    console.error('Get overrides error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const { date, is_available, start_time, end_time, note } = await request.json()

    if (!date) {
      return NextResponse.json({ error: 'Chybí datum' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO rez_availability_overrides (user_id, date, is_available, start_time, end_time, note)
      VALUES (
        ${user.userId}, ${date}, ${is_available ?? false},
        ${start_time || null}, ${end_time || null}, ${note || ''}
      )
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        is_available = EXCLUDED.is_available,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        note = EXCLUDED.note
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Create override error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
