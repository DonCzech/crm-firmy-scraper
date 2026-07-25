import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

// DELETE — admin: ukončí sérii. ?future=1 navíc zruší budoucí nekonané rezervace.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owned = await sql`SELECT id FROM rez_recurring_series WHERE id = ${params.id} AND provider_id = ${user.userId} LIMIT 1`
  if (owned.length === 0) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

  if (request.nextUrl.searchParams.get('future') === '1') {
    const today = new Date().toISOString().split('T')[0]
    await sql`
      UPDATE rez_bookings SET status = 'cancelled', updated_at = NOW()
      WHERE recurring_group_id = ${params.id} AND booking_date >= ${today} AND status != 'cancelled'
    `
  }
  await sql`UPDATE rez_recurring_series SET is_active = false WHERE id = ${params.id}`
  return NextResponse.json({ success: true })
}
