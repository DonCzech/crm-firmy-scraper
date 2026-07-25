import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

// PATCH — admin: změna stavu položky (waiting/notified/converted/cancelled)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await request.json()
  const allowed = ['waiting', 'notified', 'converted', 'cancelled']
  if (!allowed.includes(status)) return NextResponse.json({ error: 'Neplatný stav' }, { status: 400 })

  await sql`UPDATE rez_waitlist SET status = ${status} WHERE id = ${params.id} AND provider_id = ${user.userId}`
  return NextResponse.json({ success: true })
}

// DELETE — admin: odstranění položky
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await sql`DELETE FROM rez_waitlist WHERE id = ${params.id} AND provider_id = ${user.userId}`
  return NextResponse.json({ success: true })
}
