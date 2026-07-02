import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql, initDb } from '@/lib/db'
import { signToken, createTokenCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await initDb()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail a heslo jsou povinné' }, { status: 400 })
    }

    const users = await sql`
      SELECT * FROM rez_users WHERE email = ${email.toLowerCase()} LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'Nesprávný e-mail nebo heslo' }, { status: 401 })
    }

    const user = users[0]
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return NextResponse.json({ error: 'Nesprávný e-mail nebo heslo' }, { status: 401 })
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      slug: user.slug,
    })

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, slug: user.slug } })
    const cookie = createTokenCookie(token)
    response.cookies.set(cookie)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Nastala chyba serveru' }, { status: 500 })
  }
}
