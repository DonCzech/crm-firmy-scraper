import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET
//  - ?slug=...  → veřejné: publikované recenze poskytovatele (pro /book/[slug])
//  - bez slug   → admin: všechny recenze přihlášeného poskytovatele
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')

  if (slug) {
    const users = await sql`SELECT id FROM rez_users WHERE slug = ${slug} LIMIT 1`
    if (users.length === 0) return NextResponse.json({ reviews: [], average: 0, count: 0 })
    const providerId = users[0].id
    const reviews = await sql`
      SELECT client_name, rating, comment, created_at
      FROM rez_reviews
      WHERE provider_id = ${providerId} AND is_published = true
      ORDER BY created_at DESC
      LIMIT 50
    `
    const agg = await sql`
      SELECT COALESCE(AVG(rating), 0) as avg, COUNT(*) as cnt
      FROM rez_reviews WHERE provider_id = ${providerId} AND is_published = true
    `
    return NextResponse.json({
      reviews,
      average: Math.round(Number(agg[0].avg) * 10) / 10,
      count: Number(agg[0].cnt),
    })
  }

  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const reviews = await sql`
    SELECT r.*, s.name as service_name
    FROM rez_reviews r
    LEFT JOIN rez_bookings b ON r.booking_id = b.id
    LEFT JOIN rez_services s ON b.service_id = s.id
    WHERE r.provider_id = ${user.userId}
    ORDER BY r.created_at DESC
  `
  return NextResponse.json(reviews)
}
