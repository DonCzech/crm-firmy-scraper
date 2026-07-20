import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { sql, initDb } from '@/lib/db'

/**
 * Autorizace serverových volání párovacím klíčem.
 *
 * Klíč původně sloužil jen k ověření vlastnictví při propojení webu. Aby mohl
 * majitel spravovat rezervace přímo z administrace svého webu (webero), musí
 * tímtéž klíčem i autorizovat čtení a změny — jinak by se musel pokaždé
 * přihlašovat do Rezory.
 *
 * Klíč se posílá VÝHRADNĚ z serveru webu v hlavičce `Authorization: Bearer rz_…`.
 * Endpointy pod /api/connect/* proto nemají CORS (viz middleware) — z cizího
 * prohlížeče na ně nejde sáhnout a klíč se nikdy neobjeví v HTML.
 */

export interface ConnectedAccount {
  userId: string
  slug: string
  name: string
}

/** Vytáhne klíč z hlavičky Authorization. */
function bearer(request: NextRequest): string | null {
  const h = request.headers.get('authorization') ?? ''
  const m = /^Bearer\s+(.+)$/i.exec(h.trim())
  const key = m?.[1]?.trim()
  return key && key.startsWith('rz_') && key.length >= 20 ? key : null
}

/**
 * Ověří klíč a vrátí účet, kterému patří. Porovnání je časově konstantní, aby
 * klíč nešlo uhodnout po znacích; předvýběr podle prefixu drží dotaz rychlý.
 */
export async function authenticateConnectKey(
  request: NextRequest
): Promise<ConnectedAccount | null> {
  const key = bearer(request)
  if (!key) return null

  await initDb()
  const rows = await sql`
    SELECT id, slug, name, connection_key
    FROM rez_users
    WHERE connection_key IS NOT NULL
      AND left(connection_key, 12) = ${key.slice(0, 12)}
    LIMIT 5
  `

  const match = rows.find((r: Record<string, unknown>) => {
    const a = Buffer.from(String(r.connection_key))
    const b = Buffer.from(key)
    return a.length === b.length && timingSafeEqual(a, b)
  })

  if (!match) return null
  return { userId: String(match.id), slug: String(match.slug), name: String(match.name) }
}
