import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

const NAME_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 250

// GET /api/services — if ?slug= param, public; else admin
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  try {
    if (slug) {
      // Public: get services by provider slug
      const services = await sql`
        SELECT s.*
        FROM rez_services s
        JOIN rez_users u ON s.user_id = u.id
        WHERE u.slug = ${slug} AND s.is_active = true
        ORDER BY
          CASE WHEN s.sort_order IS NULL OR s.sort_order <= 0 THEN 1 ELSE 0 END ASC,
          s.sort_order ASC NULLS LAST,
          s.created_at ASC
      `
      return NextResponse.json(services)
    }

    // Admin
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const services = await sql`
      SELECT * FROM rez_services
      WHERE user_id = ${user.userId}
      ORDER BY
        CASE WHEN sort_order IS NULL OR sort_order <= 0 THEN 1 ELSE 0 END ASC,
        sort_order ASC NULLS LAST,
        created_at ASC
    `
    return NextResponse.json(services)
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/services — admin: create service
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, description, duration_minutes, price, currency, color, image_url, sort_order, is_addon } = await request.json()

    if (!name || !duration_minutes) {
      return NextResponse.json({ error: 'Název a délka jsou povinné' }, { status: 400 })
    }

    if (name.length > NAME_MAX_LENGTH) {
      return NextResponse.json({ error: `Název může mít maximálně ${NAME_MAX_LENGTH} znaků` }, { status: 400 })
    }

    if ((description || '').length > DESCRIPTION_MAX_LENGTH) {
      return NextResponse.json({ error: `Popis může mít maximálně ${DESCRIPTION_MAX_LENGTH} znaků` }, { status: 400 })
    }

    const manualSortOrder = Number(sort_order) > 0 ? Number(sort_order) : null

    if (manualSortOrder !== null) {
      await sql`
        UPDATE rez_services
        SET sort_order = sort_order + 1
        WHERE user_id = ${user.userId}
          AND sort_order >= ${manualSortOrder}
      `
    }

    const services = await sql`
      INSERT INTO rez_services (user_id, name, description, duration_minutes, price, currency, color, image_url, sort_order, is_addon)
      VALUES (
        ${user.userId},
        ${name},
        ${description || ''},
        ${duration_minutes},
        ${price || 0},
        ${currency || 'CZK'},
        ${color || '#006bff'},
        ${image_url || ''},
        ${manualSortOrder},
        ${is_addon || false}
      )
      RETURNING *
    `

    return NextResponse.json(services[0], { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
