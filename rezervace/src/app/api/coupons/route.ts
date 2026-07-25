import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET — admin: kupóny poskytovatele
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`SELECT * FROM rez_coupons WHERE user_id = ${user.userId} ORDER BY created_at DESC`
  return NextResponse.json(rows)
}

// POST — admin: nový kupón
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, type, value, maxUses, validUntil } = await request.json()
  const cleanCode = String(code || '').trim().toUpperCase()
  if (!cleanCode) return NextResponse.json({ error: 'Zadejte kód' }, { status: 400 })
  if (type !== 'percent' && type !== 'fixed') return NextResponse.json({ error: 'Neplatný typ' }, { status: 400 })
  const val = Number(value)
  if (!(val > 0)) return NextResponse.json({ error: 'Hodnota musí být kladná' }, { status: 400 })
  if (type === 'percent' && val > 100) return NextResponse.json({ error: 'Procento max 100' }, { status: 400 })

  try {
    const rows = await sql`
      INSERT INTO rez_coupons (user_id, code, type, value, max_uses, valid_until)
      VALUES (${user.userId}, ${cleanCode}, ${type}, ${val}, ${maxUses ? Number(maxUses) : null}, ${validUntil || null})
      RETURNING *
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    if (String((err as { code?: string })?.code) === '23505') {
      return NextResponse.json({ error: 'Takový kód už máte' }, { status: 409 })
    }
    throw err
  }
}
