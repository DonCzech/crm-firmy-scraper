import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// Samoobslužné GDPR pro klienta. Autorizace přes potvrzovací token rezervace,
// který má klient v e-mailu — nevyžaduje účet. Působí na data svázaná s e-mailem
// klienta u daného poskytovatele.

async function resolveClient(token: string) {
  const rows = await sql`
    SELECT b.provider_id, b.client_email, u.name as provider_name
    FROM rez_bookings b JOIN rez_users u ON b.provider_id = u.id
    WHERE b.confirmation_token = ${token} LIMIT 1
  `
  return rows[0] || null
}

// GET ?token= — export dat (JSON ke stažení)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Chybí token' }, { status: 400 })

  const ctx = await resolveClient(token)
  if (!ctx || !ctx.client_email) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

  const bookings = await sql`
    SELECT b.booking_date, b.start_time, b.duration_minutes, b.status, b.price, b.currency,
           b.client_name, b.client_email, b.client_phone, b.client_notes, b.created_at,
           s.name as service_name
    FROM rez_bookings b JOIN rez_services s ON b.service_id = s.id
    WHERE b.provider_id = ${ctx.provider_id} AND b.client_email = ${ctx.client_email}
    ORDER BY b.booking_date DESC
  `
  const reviews = await sql`
    SELECT rating, comment, created_at FROM rez_reviews
    WHERE provider_id = ${ctx.provider_id}
      AND booking_id IN (SELECT id FROM rez_bookings WHERE provider_id = ${ctx.provider_id} AND client_email = ${ctx.client_email})
  `

  return NextResponse.json(
    { provider: ctx.provider_name, email: ctx.client_email, bookings, reviews },
    { headers: { 'Content-Disposition': 'attachment; filename="moje-data.json"' } }
  )
}

// POST ?token= — anonymizace (výmaz osobních údajů) klienta u poskytovatele
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Chybí token' }, { status: 400 })

  const rl = rateLimit(`gdpr:${clientIp(request)}`, { limit: 3, windowMs: 300_000 })
  if (!rl.ok) return NextResponse.json({ error: 'Příliš mnoho pokusů' }, { status: 429 })

  const ctx = await resolveClient(token)
  if (!ctx || !ctx.client_email) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

  // Zachováme řádky rezervací (kvůli výkaznictví), ale zbavíme je osobních údajů.
  const res = await sql`
    UPDATE rez_bookings
    SET client_name = 'Smazáno', client_email = '', client_phone = '', client_notes = ''
    WHERE provider_id = ${ctx.provider_id} AND client_email = ${ctx.client_email}
    RETURNING id
  `
  await sql`
    DELETE FROM rez_waitlist
    WHERE provider_id = ${ctx.provider_id} AND client_email = ${ctx.client_email}
  `
  return NextResponse.json({ success: true, anonymized: res.length })
}
