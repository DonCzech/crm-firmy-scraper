import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'

const NAME_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 250

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const hasSortOrder = Object.prototype.hasOwnProperty.call(body, 'sort_order')
    const manualSortOrder = Number(body.sort_order) > 0 ? Number(body.sort_order) : null

    if ((body.description || '').length > DESCRIPTION_MAX_LENGTH) {
      return NextResponse.json({ error: `Popis může mít maximálně ${DESCRIPTION_MAX_LENGTH} znaků` }, { status: 400 })
    }

    if ((body.name || '').length > NAME_MAX_LENGTH) {
      return NextResponse.json({ error: `Název může mít maximálně ${NAME_MAX_LENGTH} znaků` }, { status: 400 })
    }

    if (hasSortOrder) {
      const currentRows = await sql`
        SELECT sort_order
        FROM rez_services
        WHERE id = ${params.id} AND user_id = ${user.userId}
        LIMIT 1
      `

      if (currentRows.length === 0) {
        return NextResponse.json({ error: 'Služba nenalezena' }, { status: 404 })
      }

      const currentSortOrder = Number(currentRows[0].sort_order) > 0 ? Number(currentRows[0].sort_order) : null

      if (manualSortOrder !== null && currentSortOrder === null) {
        await sql`
          UPDATE rez_services
          SET sort_order = sort_order + 1
          WHERE user_id = ${user.userId}
            AND id <> ${params.id}
            AND sort_order >= ${manualSortOrder}
        `
      } else if (manualSortOrder !== null && currentSortOrder !== null && manualSortOrder < currentSortOrder) {
        await sql`
          UPDATE rez_services
          SET sort_order = sort_order + 1
          WHERE user_id = ${user.userId}
            AND id <> ${params.id}
            AND sort_order >= ${manualSortOrder}
            AND sort_order < ${currentSortOrder}
        `
      } else if (manualSortOrder !== null && currentSortOrder !== null && manualSortOrder > currentSortOrder) {
        await sql`
          UPDATE rez_services
          SET sort_order = sort_order - 1
          WHERE user_id = ${user.userId}
            AND id <> ${params.id}
            AND sort_order > ${currentSortOrder}
            AND sort_order <= ${manualSortOrder}
        `
      } else if (manualSortOrder === null && currentSortOrder !== null) {
        await sql`
          UPDATE rez_services
          SET sort_order = sort_order - 1
          WHERE user_id = ${user.userId}
            AND id <> ${params.id}
            AND sort_order > ${currentSortOrder}
        `
      }
    }

    const result = await sql`
      UPDATE rez_services SET
        name = COALESCE(${body.name ?? null}, name),
        description = COALESCE(${body.description ?? null}, description),
        duration_minutes = COALESCE(${body.duration_minutes ?? null}, duration_minutes),
        price = COALESCE(${body.price ?? null}, price),
        currency = COALESCE(${body.currency ?? null}, currency),
        color = COALESCE(${body.color ?? null}, color),
        image_url = COALESCE(${body.image_url ?? null}, image_url),
        is_active = COALESCE(${body.is_active ?? null}, is_active),
        sort_order = CASE WHEN ${hasSortOrder} THEN ${manualSortOrder} ELSE sort_order END,
        is_addon = COALESCE(${body.is_addon ?? null}, is_addon)
      WHERE id = ${params.id} AND user_id = ${user.userId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Služba nenalezena' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await sql`
      DELETE FROM rez_services
      WHERE id = ${params.id} AND user_id = ${user.userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Služba nenalezena' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
