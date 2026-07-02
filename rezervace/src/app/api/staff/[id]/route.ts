import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

// PATCH /api/staff/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const body = await request.json()
    const { name, color, bio, avatar_url, is_active, sort_order } = body

    // Verify ownership
    const existing = await sql`
      SELECT id FROM rez_staff WHERE id = ${params.id} AND user_id = ${user.userId} LIMIT 1
    `
    if (existing.length === 0) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    const result = await sql`
      UPDATE rez_staff SET
        name = COALESCE(${name ?? null}, name),
        color = COALESCE(${color ?? null}, color),
        bio = COALESCE(${bio ?? null}, bio),
        avatar_url = COALESCE(${avatar_url ?? null}, avatar_url),
        is_active = COALESCE(${is_active ?? null}, is_active),
        sort_order = COALESCE(${sort_order ?? null}, sort_order)
      WHERE id = ${params.id}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Update staff error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/staff/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const existing = await sql`
      SELECT id FROM rez_staff WHERE id = ${params.id} AND user_id = ${user.userId} LIMIT 1
    `
    if (existing.length === 0) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    await sql`DELETE FROM rez_staff WHERE id = ${params.id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete staff error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
