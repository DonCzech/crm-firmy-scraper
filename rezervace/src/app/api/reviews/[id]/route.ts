import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

// PATCH — admin: publikovat / skrýt recenzi
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { is_published } = await request.json()
  await sql`
    UPDATE rez_reviews SET is_published = ${!!is_published}
    WHERE id = ${params.id} AND provider_id = ${user.userId}
  `
  return NextResponse.json({ success: true })
}

// DELETE — admin: smazat recenzi
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await sql`DELETE FROM rez_reviews WHERE id = ${params.id} AND provider_id = ${user.userId}`
  return NextResponse.json({ success: true })
}
