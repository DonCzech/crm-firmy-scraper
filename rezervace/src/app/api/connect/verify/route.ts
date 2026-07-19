import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { sql, initDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST { key } — ověří párovací klíč a vrátí veřejné údaje účtu.
 *
 * Volá se ze SERVERU webu (venom), nikdy z prohlížeče — proto se klíč nedostane
 * do HTML. Odpověď obsahuje jen veřejné informace (slug, jméno), žádné tajemství.
 * Porovnání je časově konstantní, aby klíč nešlo uhodnout po znacích.
 */
export async function POST(request: NextRequest) {
  try {
    await initDb()
    const { key } = await request.json().catch(() => ({ key: '' }))

    if (typeof key !== 'string' || !key.startsWith('rz_') || key.length < 20) {
      return NextResponse.json({ ok: false, error: 'Neplatný formát klíče' }, { status: 400 })
    }

    const rows = await sql`
      SELECT id, slug, name, connection_key
      FROM rez_users
      WHERE connection_key IS NOT NULL
        AND left(connection_key, 12) = ${key.slice(0, 12)}
      LIMIT 5
    `

    const match = rows.find((r: Record<string, unknown>) => {
      const stored = String(r.connection_key)
      const a = Buffer.from(stored)
      const b = Buffer.from(key)
      return a.length === b.length && timingSafeEqual(a, b)
    })

    if (!match) {
      return NextResponse.json({ ok: false, error: 'Klíč nenalezen nebo byl zneplatněn' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, slug: match.slug, name: match.name })
  } catch (error) {
    console.error('Connect verify error:', error)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
