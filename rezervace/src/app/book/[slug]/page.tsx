import { notFound } from 'next/navigation'
import { sql, initDb } from '@/lib/db'
import BookingPage from '@/components/booking/BookingPage'
import type { User, Service, Staff } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: { slug: string }
}

async function getProviderData(slug: string) {
  await initDb()
  const users = await sql`
    SELECT id, name, slug, avatar_color, avatar_url, bio, timezone
    FROM rez_users
    WHERE slug = ${slug}
    LIMIT 1
  `

  if (users.length === 0) return null

  const user = users[0] as User

  const services = await sql`
    SELECT id, user_id, name, description, duration_minutes, price, currency, color, image_url, is_active, is_addon, sort_order, created_at
    FROM rez_services
    WHERE user_id = ${user.id}
      AND is_active = true
    ORDER BY
      CASE WHEN sort_order IS NULL OR sort_order <= 0 THEN 1 ELSE 0 END ASC,
      sort_order ASC NULLS LAST,
      created_at ASC
  `

  const staffRows = await sql`
    SELECT s.id, s.user_id, s.name, s.color, s.bio, s.avatar_url, s.is_active, s.sort_order, s.created_at,
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
    GROUP BY s.id, s.user_id, s.name, s.color, s.bio, s.avatar_url, s.is_active, s.sort_order, s.created_at
    ORDER BY s.sort_order ASC, s.created_at ASC
  `

  return { user, services: services as Service[], staff: staffRows as Staff[] }
}

export async function generateMetadata({ params }: Props) {
  const data = await getProviderData(params.slug)
  if (!data) return { title: 'Nenalezeno' }

  return {
    title: `Rezervace – ${data.user.name}`,
    description: data.user.bio || `Rezervujte si schůzku s ${data.user.name}`,
  }
}

export default async function BookSlugPage({ params }: Props) {
  const data = await getProviderData(params.slug)

  if (!data) {
    notFound()
  }

  return <BookingPage user={data.user} services={data.services} staff={data.staff} />
}
