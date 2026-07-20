import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { sql, initDb } from '@/lib/db'

/**
 * Obrázky (avatary personálu, fotky služeb) jako samostatný, cacheovatelný zdroj.
 *
 * Historicky se posílaly jako base64 data URI přímo uvnitř JSONu z
 * `/api/users/[slug]`. Jedna odpověď tak měla 386 kB, z toho 375 kB obrázků —
 * prohlížeč je musel stáhnout celé, než vůbec vykreslil seznam služeb, a nešly
 * cachovat ani načítat postupně. Tady se servírují binárně (base64 je navíc
 * o ~33 % větší), s ETagem a dlouhou cache, takže se stáhnou jednou a paralelně.
 */

export const runtime = 'nodejs'

type Kind = 'service' | 'staff' | 'user'
const KINDS: Kind[] = ['service', 'staff', 'user']

/**
 * Načte uloženou hodnotu obrázku. Každý druh má vlastní dotaz — název tabulky
 * ani sloupce se do SQL nikdy neinterpoluje z požadavku.
 */
async function loadImage(kind: Kind, id: string): Promise<string | null> {
  let rows: Array<{ img: string | null }>
  if (kind === 'service') {
    rows = await sql`SELECT image_url AS img FROM rez_services WHERE id = ${id} LIMIT 1`
  } else if (kind === 'staff') {
    rows = await sql`SELECT avatar_url AS img FROM rez_staff WHERE id = ${id} LIMIT 1`
  } else {
    rows = await sql`SELECT avatar_url AS img FROM rez_users WHERE id = ${id} LIMIT 1`
  }
  return rows[0]?.img ?? null
}

/** Rozloží `data:image/webp;base64,…` na typ a binární data. */
function decodeDataUri(value: string): { body: Buffer; mime: string } | null {
  const m = /^data:([^;,]+);base64,([\s\S]+)$/.exec(value)
  if (!m) return null
  const mime = m[1]
  if (!mime.startsWith('image/')) return null
  try {
    return { body: Buffer.from(m[2], 'base64'), mime }
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { kind: string; id: string } }
) {
  const kind = params.kind as Kind
  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: 'Neznámý typ' }, { status: 404 })
  }

  // UUID validace — id jde do dotazu jen jako parametr, ale tímhle odfiltrujeme
  // nesmyslné požadavky dřív, než se sáhne na databázi.
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
    return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 })
  }

  try {
    await initDb()
    const raw = await loadImage(kind, params.id)
    if (!raw) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    // Uložená hodnota může být i běžná URL (starší data / externí úložiště).
    if (!raw.startsWith('data:')) return NextResponse.redirect(raw, 302)

    const decoded = decodeDataUri(raw)
    if (!decoded) return NextResponse.json({ error: 'Nepodporovaný formát' }, { status: 415 })

    const etag = `"${createHash('sha1').update(decoded.body).digest('base64url')}"`
    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } })
    }

    return new NextResponse(new Uint8Array(decoded.body), {
      headers: {
        'Content-Type': decoded.mime,
        'Content-Length': String(decoded.body.length),
        ETag: etag,
        // Obrázek se mění jen když ho majitel přenahraje; URL zůstává stejná,
        // proto krátká „čerstvost" + dlouhé dojíždění přes ETag na CDN.
        'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image endpoint error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
