import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await sql`
      DELETE FROM rez_availability_overrides
      WHERE id = ${params.id} AND user_id = ${user.userId}
      RETURNING id
    `
    if (result.length === 0) {
      return NextResponse.json({ error: 'Override nenalezen' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete override error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
