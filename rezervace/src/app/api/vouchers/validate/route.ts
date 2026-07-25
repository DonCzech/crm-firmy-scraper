import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { resolveVoucher } from '@/lib/discounts'

// Veřejné ověření dárkového poukazu. GET ?slug=&code=&amount=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const code = searchParams.get('code')
  const amount = Number(searchParams.get('amount') || '0')
  if (!slug || !code) return NextResponse.json({ valid: false, applied: 0, remaining: 0 })

  const users = await sql`SELECT id FROM rez_users WHERE slug = ${slug} LIMIT 1`
  if (users.length === 0) return NextResponse.json({ valid: false, applied: 0, remaining: 0 })

  const res = await resolveVoucher(users[0].id, code, amount)
  return NextResponse.json({ valid: res.valid, applied: res.applied, remaining: res.remaining, reason: res.reason })
}
