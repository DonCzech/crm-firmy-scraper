import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function newKey() {
  return `rz_${randomBytes(24).toString('base64url')}`
}

/**
 * GET — vrátí párovací klíč přihlášeného poskytovatele (vytvoří ho při prvním
 * vyžádání). Klíč je čitelný POUZE pro vlastníka účtu; slouží k propojení webu
 * s Rezorou a nikdy se neposílá do prohlížeče návštěvníka.
 */
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const rows = await sql`SELECT connection_key FROM rez_users WHERE id = ${user.userId} LIMIT 1`
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let key = rows[0].connection_key as string | null
    if (!key) {
      key = newKey()
      await sql`UPDATE rez_users SET connection_key = ${key} WHERE id = ${user.userId}`
    }
    return NextResponse.json({ key, slug: user.slug })
  } catch (error) {
    console.error('Connection key error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** POST — vygeneruje nový klíč (starý okamžitě přestane platit). */
export async function POST() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const key = newKey()
    await sql`UPDATE rez_users SET connection_key = ${key} WHERE id = ${user.userId}`
    return NextResponse.json({ key, slug: user.slug })
  } catch (error) {
    console.error('Connection key regenerate error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
