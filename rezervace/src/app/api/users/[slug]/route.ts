import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await initDb()
    const slug = String(params.slug)
    const users = await sql`
      SELECT id, name, slug, avatar_color, avatar_url, bio, timezone,
             payment_cash, payment_transfer, bank_iban, bank_owner, payment_note
      FROM rez_users
      WHERE slug = ${slug}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]

    const services = await sql`
      SELECT id, user_id, name, description, duration_minutes, price, currency, color, image_url, is_active, sort_order, created_at
      FROM rez_services
      WHERE user_id = ${user.id} AND is_active = true
      ORDER BY
        CASE WHEN sort_order IS NULL OR sort_order <= 0 THEN 1 ELSE 0 END ASC,
        sort_order ASC NULLS LAST,
        created_at ASC
    `

    const availability = await sql`
      SELECT day_of_week, start_time, end_time, is_active
      FROM rez_availability
      WHERE user_id = ${user.id}
      ORDER BY day_of_week ASC
    `

    const staff = await sql`
      SELECT s.*,
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
    `

    return NextResponse.json({ user, services, availability, staff })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
