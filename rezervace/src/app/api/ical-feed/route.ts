import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { sql } from '@/lib/db'
import crypto from 'crypto'

// GET — vrátí (a při první potřebě vygeneruje) odběrovou URL iCal feedu.
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let rows = await sql`SELECT ical_token FROM rez_users WHERE id = ${user.userId} LIMIT 1`
  let token = rows[0]?.ical_token as string | null
  if (!token) {
    token = crypto.randomBytes(24).toString('hex')
    await sql`UPDATE rez_users SET ical_token = ${token} WHERE id = ${user.userId}`
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  return NextResponse.json({ token, url: `${appUrl}/api/ical/${token}` })
}

// POST — přegeneruje token (starý odkaz přestane fungovat).
export async function POST() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = crypto.randomBytes(24).toString('hex')
  await sql`UPDATE rez_users SET ical_token = ${token} WHERE id = ${user.userId}`

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  return NextResponse.json({ token, url: `${appUrl}/api/ical/${token}` })
}
