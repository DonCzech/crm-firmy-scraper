import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUser } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Vyplňte současné i nové heslo' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Nové heslo musí mít alespoň 6 znaků' }, { status: 400 })
    }

    const users = await sql`
      SELECT password_hash FROM rez_users WHERE id = ${user.userId} LIMIT 1
    `
    if (users.length === 0) return NextResponse.json({ error: 'Uživatel nenalezen' }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, users[0].password_hash)
    if (!valid) return NextResponse.json({ error: 'Současné heslo není správné' }, { status: 400 })

    const newHash = await bcrypt.hash(newPassword, 10)
    await sql`UPDATE rez_users SET password_hash = ${newHash} WHERE id = ${user.userId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Nastala chyba serveru' }, { status: 500 })
  }
}
