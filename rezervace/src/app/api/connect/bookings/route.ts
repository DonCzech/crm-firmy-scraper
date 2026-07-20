import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { authenticateConnectKey } from '@/lib/connect-auth'

export const dynamic = 'force-dynamic'

/**
 * Rezervace propojeného účtu pro administraci na webu klienta.
 *
 * Autorizuje se párovacím klíčem (`Authorization: Bearer rz_…`), který posílá
 * VÝHRADNĚ server webu — díky tomu spravuje majitel rezervace přímo ze svého
 * webu a do Rezory se přihlašovat nemusí. Autoritativní data zůstávají tady;
 * web si je jen zobrazuje a posílá změny.
 *
 * Cena a délka se čtou z rezervace, ne ze služby — služba mohla mezitím zdražit
 * a historická rezervace musí zůstat taková, jaká byla sjednaná.
 */

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const
type Status = (typeof STATUSES)[number]

/** GET ?scope=upcoming|past|all&limit=50 — přehled rezervací. */
export async function GET(request: NextRequest) {
  const account = await authenticateConnectKey(request)
  if (!account) return NextResponse.json({ error: 'Neplatný klíč' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') ?? 'upcoming'
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 200)
    const uid = account.userId

    const rows =
      scope === 'past'
        ? await sql`
            SELECT b.id, b.booking_date, b.start_time, b.duration_minutes, b.status,
                   b.client_name, b.client_email, b.client_phone, b.client_notes,
                   b.payment_method, b.price, b.currency, b.created_at,
                   b.staff_name, s.name AS service_name
              FROM rez_bookings b
              LEFT JOIN rez_services s ON s.id = b.service_id
             WHERE b.provider_id = ${uid} AND b.booking_date < CURRENT_DATE
             ORDER BY b.booking_date DESC, b.start_time DESC
             LIMIT ${limit}`
        : scope === 'all'
        ? await sql`
            SELECT b.id, b.booking_date, b.start_time, b.duration_minutes, b.status,
                   b.client_name, b.client_email, b.client_phone, b.client_notes,
                   b.payment_method, b.price, b.currency, b.created_at,
                   b.staff_name, s.name AS service_name
              FROM rez_bookings b
              LEFT JOIN rez_services s ON s.id = b.service_id
             WHERE b.provider_id = ${uid}
             ORDER BY b.booking_date DESC, b.start_time DESC
             LIMIT ${limit}`
        : await sql`
            SELECT b.id, b.booking_date, b.start_time, b.duration_minutes, b.status,
                   b.client_name, b.client_email, b.client_phone, b.client_notes,
                   b.payment_method, b.price, b.currency, b.created_at,
                   b.staff_name, s.name AS service_name
              FROM rez_bookings b
              LEFT JOIN rez_services s ON s.id = b.service_id
             WHERE b.provider_id = ${uid} AND b.booking_date >= CURRENT_DATE
             ORDER BY b.booking_date ASC, b.start_time ASC
             LIMIT ${limit}`

    return NextResponse.json({
      bookings: rows,
      account: { slug: account.slug, name: account.name },
    })
  } catch (error) {
    console.error('Connect bookings error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** PATCH { id, status } — změna stavu rezervace (potvrdit / zrušit / dokončit). */
export async function PATCH(request: NextRequest) {
  const account = await authenticateConnectKey(request)
  if (!account) return NextResponse.json({ error: 'Neplatný klíč' }, { status: 401 })

  try {
    await initDb()
    const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string }
    const id = typeof body.id === 'string' ? body.id : ''
    const status = String(body.status ?? '') as Status

    if (!id) return NextResponse.json({ error: 'Chybí ID rezervace' }, { status: 400 })
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Neplatný stav' }, { status: 400 })
    }

    // provider_id v podmínce zajistí, že klíč nesáhne na cizí rezervaci.
    const rows = await sql`
      UPDATE rez_bookings
         SET status = ${status}, updated_at = NOW()
       WHERE id = ${id} AND provider_id = ${account.userId}
       RETURNING id, status`
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, booking: rows[0] })
  } catch (error) {
    console.error('Connect booking update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
