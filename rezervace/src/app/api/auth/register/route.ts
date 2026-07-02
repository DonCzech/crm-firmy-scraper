import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql, initDb } from '@/lib/db'
import { signToken, createTokenCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await initDb()

    const { name, email, slug, password } = await request.json()

    if (!name || !email || !slug || !password) {
      return NextResponse.json({ error: 'Všechna pole jsou povinná' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Heslo musí mít alespoň 8 znaků' }, { status: 400 })
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug smí obsahovat pouze malá písmena, čísla a pomlčky' }, { status: 400 })
    }

    // Check uniqueness
    const existing = await sql`
      SELECT id FROM rez_users WHERE email = ${email.toLowerCase()} OR slug = ${slug} LIMIT 1
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: 'E-mail nebo slug je již obsazen' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const users = await sql`
      INSERT INTO rez_users (email, password_hash, name, slug)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${name}, ${slug})
      RETURNING id, email, name, slug
    `

    const user = users[0]

    // Create default availability (Mon-Fri 9:00-17:00)
    for (let day = 1; day <= 5; day++) {
      await sql`
        INSERT INTO rez_availability (user_id, day_of_week, start_time, end_time, is_active)
        VALUES (${user.id}, ${day}, '09:00', '17:00', true)
        ON CONFLICT (user_id, day_of_week) DO NOTHING
      `
    }
    // Sat + Sun as inactive
    for (const day of [0, 6]) {
      await sql`
        INSERT INTO rez_availability (user_id, day_of_week, start_time, end_time, is_active)
        VALUES (${user.id}, ${day}, '09:00', '17:00', false)
        ON CONFLICT (user_id, day_of_week) DO NOTHING
      `
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      slug: user.slug,
    })

    const response = NextResponse.json({ success: true, user })
    const cookie = createTokenCookie(token)
    response.cookies.set(cookie)

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Nastala chyba serveru' }, { status: 500 })
  }
}
