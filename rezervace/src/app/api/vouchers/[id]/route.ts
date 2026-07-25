import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

// PATCH — admin: aktivace/deaktivace poukazu
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { is_active } = await request.json()
  await sql`UPDATE rez_vouchers SET is_active = ${!!is_active} WHERE id = ${params.id} AND user_id = ${user.userId}`
  return NextResponse.json({ success: true })
}

// DELETE — admin
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await sql`DELETE FROM rez_vouchers WHERE id = ${params.id} AND user_id = ${user.userId}`
  return NextResponse.json({ success: true })
}
