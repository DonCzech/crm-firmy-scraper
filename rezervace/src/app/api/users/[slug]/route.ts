import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'

// Widget i veřejná stránka musí vždy dostat aktuální data (nové služby, personál,
// nastavení povinných kontaktů). Bez tohoto Next route staticky nacachuje.
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Veřejný profil poskytovatele pro rezervační widget.
 *
 * VÝKON: dřív se base64 obrázky posílaly přímo v JSONu — odpověď měla 386 kB,
 * z toho 375 kB obrázků, a čtyři dotazy běžely za sebou. Widget kvůli tomu
 * naskakoval přes 4 s. Nyní:
 *   1. obrázky se nevybírají; vrací se odkaz na `/api/img/...`, který je
 *      cacheovatelný a stahuje se paralelně až při vykreslení,
 *   2. nezávislé dotazy běží současně (`Promise.all`) místo kol po sobě.
 */

/**
 * Prázdná hodnota = bez obrázku; data URI nahradíme odkazem na obrázkový endpoint.
 * Odkaz je ZÁMĚRNĚ absolutní — widget běží na cizí doméně (webero.co i vlastní
 * domény klientů), kde by se relativní cesta přeložila na špatný server.
 */
function imageRef(
  origin: string,
  kind: 'service' | 'staff' | 'user',
  id: string,
  stored: string | null
): string | null {
  if (!stored) return null
  // Externí URL (starší data / jiné úložiště) necháme projít beze změny.
  if (!stored.startsWith('data:')) return stored
  return `${origin}/api/img/${kind}/${id}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await initDb()
    const slug = String(params.slug)
    // Origin bereme primárně z požadavku — je to vždy doména, na kterou klient
    // skutečně dosáhl. Env proměnná umí zastarat (mířila na starou vercel.app
    // adresu) a v tomhle projektu navíc obsahuje zalomení řádku.
    const origin = new URL(request.url).origin.trim().replace(/\/$/, '')

    const users = await sql`
      SELECT id, name, slug, avatar_color, avatar_url, bio, timezone,
             payment_cash, payment_transfer, bank_iban, bank_owner, payment_note,
             require_email, require_phone, require_deposit, deposit_percent, default_locale
      FROM rez_users
      WHERE slug = ${slug}
      LIMIT 1
    `
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const user = users[0]

    // Tři nezávislé dotazy → jedno kolo místo tří.
    const [services, availability, staff] = await Promise.all([
      sql`
        SELECT id, user_id, name, description, duration_minutes, price, currency,
               color, is_addon, image_url, is_active, sort_order, created_at
        FROM rez_services
        WHERE user_id = ${user.id} AND is_active = true
        ORDER BY
          CASE WHEN sort_order IS NULL OR sort_order <= 0 THEN 1 ELSE 0 END ASC,
          sort_order ASC NULLS LAST,
          created_at ASC
      `,
      sql`
        SELECT day_of_week, start_time, end_time, is_active
        FROM rez_availability
        WHERE user_id = ${user.id}
        ORDER BY day_of_week ASC
      `,
      sql`
        SELECT s.id, s.user_id, s.name, s.bio, s.color, s.avatar_url,
               s.is_active, s.sort_order, s.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', sa.id,
                'staff_id', sa.staff_id,
                'day_of_week', sa.day_of_week,
                'start_time', sa.start_time,
                'end_time', sa.end_time,
                'is_active', sa.is_active
              ) ORDER BY sa.day_of_week
            ) FILTER (WHERE sa.id IS NOT NULL),
            '[]'
          ) as availability
        FROM rez_staff s
        LEFT JOIN rez_staff_availability sa ON sa.staff_id = s.id
        WHERE s.user_id = ${user.id} AND s.is_active = true
        GROUP BY s.id
        ORDER BY s.sort_order ASC, s.created_at ASC
      `,
    ])

    // Base64 ven z odpovědi — místo něj odkaz na cacheovatelný obrázek.
    return NextResponse.json({
      user: { ...user, avatar_url: imageRef(origin, 'user', user.id, user.avatar_url) },
      services: services.map((s) => ({ ...s, image_url: imageRef(origin, 'service', s.id, s.image_url) })),
      availability,
      staff: staff.map((m) => ({ ...m, avatar_url: imageRef(origin, 'staff', m.id, m.avatar_url) })),
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
