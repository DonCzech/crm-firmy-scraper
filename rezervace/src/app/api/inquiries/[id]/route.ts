import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

const VALID_STATUSES = ['new', 'contacted', 'closed']

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { status } = await request.json()
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Neplatný stav' }, { status: 400 })
    }

    const result = await sql`
      UPDATE rez_inquiries SET status = ${status}
      WHERE id = ${params.id} AND provider_id = ${user.userId}
      RETURNING id
    `
    if (result.length === 0) {
      return NextResponse.json({ error: 'Poptávka nenalezena' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update inquiry error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await sql`
      DELETE FROM rez_inquiries
      WHERE id = ${params.id} AND provider_id = ${user.userId}
      RETURNING id
    `
    if (result.length === 0) {
      return NextResponse.json({ error: 'Poptávka nenalezena' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete inquiry error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
