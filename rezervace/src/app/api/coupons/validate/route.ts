import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { resolveCoupon } from '@/lib/discounts'

// Veřejné ověření kupónu pro živý přepočet ve formuláři.
// GET ?slug=&code=&amount=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const code = searchParams.get('code')
  const amount = Number(searchParams.get('amount') || '0')
  if (!slug || !code) return NextResponse.json({ valid: false, discount: 0 })

  const users = await sql`SELECT id FROM rez_users WHERE slug = ${slug} LIMIT 1`
  if (users.length === 0) return NextResponse.json({ valid: false, discount: 0 })

  const res = await resolveCoupon(users[0].id, code, amount)
  return NextResponse.json({ valid: res.valid, discount: res.discount, reason: res.reason })
}
