import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { generateCode } from '@/lib/discounts'

// GET — admin: poukazy poskytovatele
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`SELECT * FROM rez_vouchers WHERE user_id = ${user.userId} ORDER BY created_at DESC`
  return NextResponse.json(rows)
}

// POST — admin: vystaví nový poukaz (kód se vygeneruje)
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, currency, recipientName, recipientEmail, note, validUntil } = await request.json()
  const val = Number(amount)
  if (!(val > 0)) return NextResponse.json({ error: 'Zadejte kladnou částku' }, { status: 400 })

  // Vygeneruj unikátní kód (pár pokusů kvůli UNIQUE)
  let code = ''
  for (let i = 0; i < 5; i++) {
    code = generateCode('DAR')
    const exists = await sql`SELECT 1 FROM rez_vouchers WHERE user_id = ${user.userId} AND code = ${code} LIMIT 1`
    if (exists.length === 0) break
  }

  const rows = await sql`
    INSERT INTO rez_vouchers (user_id, code, initial_amount, remaining_amount, currency, recipient_name, recipient_email, note, valid_until)
    VALUES (${user.userId}, ${code}, ${val}, ${val}, ${currency || 'CZK'}, ${recipientName || ''}, ${recipientEmail || ''}, ${note || ''}, ${validUntil || null})
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
