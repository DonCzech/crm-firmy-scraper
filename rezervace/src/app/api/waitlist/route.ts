import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { rateLimit, clientIp } from '@/lib/rate-limit'

// GET — admin: čekací listina poskytovatele
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT w.*, s.name as service_name, st.name as staff_name
    FROM rez_waitlist w
    LEFT JOIN rez_services s ON w.service_id = s.id
    LEFT JOIN rez_staff st ON w.staff_id = st.id
    WHERE w.provider_id = ${user.userId}
    ORDER BY w.created_at DESC
  `
  return NextResponse.json(rows)
}

// POST — veřejné: zapsání zájemce na čekací listinu
export async function POST(request: NextRequest) {
  try {
    await initDb()
    const body = await request.json()
    const { providerSlug, serviceId, staffId, clientName, clientEmail, clientPhone, desiredDate, website } = body

    // Honeypot
    if (website) return NextResponse.json({ success: true }, { status: 201 })

    const rl = rateLimit(`waitlist:${clientIp(request)}`, { limit: 5, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'Příliš mnoho pokusů' }, { status: 429 })

    if (!providerSlug || !clientName || !desiredDate) {
      return NextResponse.json({ error: 'Chybí povinné údaje' }, { status: 400 })
    }
    if (!clientEmail && !clientPhone) {
      return NextResponse.json({ error: 'Zadejte e-mail nebo telefon' }, { status: 400 })
    }

    const users = await sql`SELECT id FROM rez_users WHERE slug = ${providerSlug} LIMIT 1`
    if (users.length === 0) return NextResponse.json({ error: 'Poskytovatel nenalezen' }, { status: 404 })
    const providerId = users[0].id

    const rows = await sql`
      INSERT INTO rez_waitlist (provider_id, service_id, staff_id, client_name, client_email, client_phone, desired_date)
      VALUES (${providerId}, ${serviceId || null}, ${staffId || null}, ${clientName},
              ${(clientEmail || '').toLowerCase()}, ${clientPhone || ''}, ${desiredDate})
      RETURNING id
    `
    return NextResponse.json({ success: true, id: rows[0].id }, { status: 201 })
  } catch (error) {
    console.error('Waitlist create error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
