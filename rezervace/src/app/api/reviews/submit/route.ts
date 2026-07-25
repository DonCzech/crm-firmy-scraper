import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// GET ?token= — info k rezervaci pro formulář recenze (a zda už byla odeslána)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Chybí token' }, { status: 400 })

  const rows = await sql`
    SELECT b.id, b.client_name, b.status, s.name as service_name, u.name as provider_name,
           (SELECT COUNT(*) FROM rez_reviews r WHERE r.booking_id = b.id) as review_count
    FROM rez_bookings b
    JOIN rez_services s ON b.service_id = s.id
    JOIN rez_users u ON b.provider_id = u.id
    WHERE b.review_token = ${token}
    LIMIT 1
  `
  if (rows.length === 0) return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
  const b = rows[0]
  return NextResponse.json({
    clientName: b.client_name,
    serviceName: b.service_name,
    providerName: b.provider_name,
    alreadyReviewed: Number(b.review_count) > 0,
  })
}

// POST ?token= — odeslání recenze (nepublikuje se hned, majitel schvaluje)
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Chybí token' }, { status: 400 })

  const rl = rateLimit(`review:${clientIp(request)}`, { limit: 5, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: 'Příliš mnoho pokusů' }, { status: 429 })

  const { rating, comment } = await request.json()
  const r = Number(rating)
  if (!r || r < 1 || r > 5) return NextResponse.json({ error: 'Hodnocení musí být 1–5' }, { status: 400 })

  const rows = await sql`
    SELECT id, provider_id, client_name FROM rez_bookings WHERE review_token = ${token} LIMIT 1
  `
  if (rows.length === 0) return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
  const b = rows[0]

  const existing = await sql`SELECT id FROM rez_reviews WHERE booking_id = ${b.id} LIMIT 1`
  if (existing.length > 0) return NextResponse.json({ error: 'Recenzi jste již odeslali' }, { status: 409 })

  await sql`
    INSERT INTO rez_reviews (provider_id, booking_id, client_name, rating, comment, is_published)
    VALUES (${b.provider_id}, ${b.id}, ${b.client_name}, ${r}, ${String(comment || '').slice(0, 1000)}, false)
  `
  return NextResponse.json({ success: true })
}
