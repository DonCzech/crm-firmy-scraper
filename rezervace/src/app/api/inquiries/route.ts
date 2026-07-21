import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { sendInquiryNotificationToProvider } from '@/lib/email'

const MODES = new Set(['inquiry', 'course', 'table', 'stay'])

// GET /api/inquiries — admin: list all inquiries for current user
export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const inquiries = await sql`
      SELECT i.*, s.name AS service_name
      FROM rez_inquiries i
      LEFT JOIN rez_services s ON i.service_id = s.id
      WHERE i.provider_id = ${user.userId}
      ORDER BY i.created_at DESC
    `
    return NextResponse.json(inquiries)
  } catch (error) {
    console.error('Get inquiries error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/inquiries — veřejné: vytvoří poptávku/přihlášku (režimy bez pevného
 * slotu). Sdílí kontaktní pravidla s /api/bookings: povinnost e-mailu/telefonu
 * řídí poskytovatel, ale bez jakéhokoli kontaktu je poptávka nedoručitelná.
 * Strukturovaná pole (party_size, preferred_*, check_in/out) jsou nepovinná —
 * plní se dle režimu a server ukládá jen ta, co dávají smysl.
 */
export async function POST(request: NextRequest) {
  try {
    await initDb()

    const body = await request.json()
    const {
      providerSlug,
      mode = 'inquiry',
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      clientNotes,
      partySize,
      preferredDate,
      preferredTime,
      checkIn,
      checkOut,
    } = body

    if (!providerSlug || !clientName || !String(clientName).trim()) {
      return NextResponse.json({ error: 'Chybí povinné údaje' }, { status: 400 })
    }
    if (!MODES.has(mode)) {
      return NextResponse.json({ error: 'Neplatný režim poptávky' }, { status: 400 })
    }

    const providers = await sql`
      SELECT id, name, email, require_email, require_phone
      FROM rez_users WHERE slug = ${providerSlug} LIMIT 1
    `
    if (providers.length === 0) {
      return NextResponse.json({ error: 'Poskytovatel nenalezen' }, { status: 404 })
    }
    const provider = providers[0]

    // Kontaktní pravidla — stejná jako u rezervace
    const requireEmail = provider.require_email !== false
    const requirePhone = provider.require_phone === true
    if (requireEmail && !clientEmail) {
      return NextResponse.json({ error: 'E-mail je povinný' }, { status: 400 })
    }
    if (requirePhone && !clientPhone) {
      return NextResponse.json({ error: 'Telefon je povinný' }, { status: 400 })
    }
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(clientEmail).trim())) {
      return NextResponse.json({ error: 'Neplatný formát e-mailu' }, { status: 400 })
    }
    if (!clientEmail && !clientPhone) {
      return NextResponse.json({ error: 'Zadejte e-mail nebo telefon' }, { status: 400 })
    }

    // Volitelný předmět: název vybrané služby/kurzu (kontrola vlastnictví)
    let subject = ''
    let resolvedServiceId: string | null = null
    if (serviceId) {
      const svc = await sql`
        SELECT id, name FROM rez_services
        WHERE id = ${serviceId} AND user_id = ${provider.id} AND is_active = true LIMIT 1
      `
      if (svc.length > 0) {
        resolvedServiceId = svc[0].id
        subject = svc[0].name
      }
    }

    // Stay: příjezd musí předcházet odjezdu
    if (mode === 'stay' && checkIn && checkOut && checkOut <= checkIn) {
      return NextResponse.json({ error: 'Datum odjezdu musí být po příjezdu' }, { status: 400 })
    }

    const party = mode === 'table' && Number(partySize) > 0 ? Number(partySize) : null

    const rows = await sql`
      INSERT INTO rez_inquiries (
        provider_id, service_id, mode, subject,
        client_name, client_email, client_phone, client_notes,
        party_size, preferred_date, preferred_time, check_in, check_out
      ) VALUES (
        ${provider.id}, ${resolvedServiceId}, ${mode}, ${subject},
        ${clientName}, ${(clientEmail || '').toLowerCase()}, ${clientPhone || ''}, ${clientNotes || ''},
        ${party}, ${preferredDate || null}, ${preferredTime || ''}, ${checkIn || null}, ${checkOut || null}
      )
      RETURNING *
    `
    const inquiry = rows[0]

    // Detaily do e-mailu — jen relevantní pro režim
    const detailRows: [string, string][] = []
    if (subject) detailRows.push([mode === 'course' ? 'Kurz' : mode === 'stay' ? 'Ubytování' : 'Předmět', subject])
    if (party) detailRows.push(['Počet osob', String(party)])
    if (preferredDate) detailRows.push(['Preferovaný termín', formatDate(preferredDate)])
    if (preferredTime) detailRows.push(['Preferovaný čas', String(preferredTime)])
    if (checkIn) detailRows.push(['Příjezd', formatDate(checkIn)])
    if (checkOut) detailRows.push(['Odjezd', formatDate(checkOut)])

    // Non-blocking notifikace poskytovateli
    void sendInquiryNotificationToProvider({
      providerEmail: provider.email,
      providerName: provider.name,
      mode,
      subject,
      clientName,
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      clientNotes: clientNotes || '',
      detailRows,
    })

    return NextResponse.json({ success: true, inquiry }, { status: 201 })
  } catch (error) {
    console.error('Create inquiry error:', error)
    return NextResponse.json({ error: 'Nastala chyba serveru' }, { status: 500 })
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
