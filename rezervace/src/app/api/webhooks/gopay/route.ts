import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getGoPayPaymentState } from '@/lib/gopay'
import { sendConfirmationsForBooking } from '@/lib/notify'

// GoPay notifikace: přijde jako GET s ?id=<paymentId> (bez podepsaného těla).
// Stav platby si proto autoritativně dotáhneme přes API — to je zároveň ochrana
// proti podvrženému volání. GoPay očekává rychlou 200 odpověď.
async function handle(paymentId: string | null) {
  if (!paymentId) return NextResponse.json({ error: 'Chybí id' }, { status: 400 })

  let state: string
  try {
    state = await getGoPayPaymentState(paymentId)
  } catch (err) {
    console.error('GoPay status fetch selhal:', err)
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }

  // Rezervace čekající na tuto platbu
  const rows = await sql`
    SELECT id FROM rez_bookings
    WHERE stripe_session_id = ${paymentId} AND payment_provider = 'gopay'
    LIMIT 1
  `
  if (rows.length === 0) return NextResponse.json({ ok: true }) // neznámá platba → nic

  const bookingId = rows[0].id

  if (state === 'PAID') {
    const updated = await sql`
      UPDATE rez_bookings
      SET status = 'confirmed', payment_status = 'paid', payment_method = 'card', updated_at = NOW()
      WHERE id = ${bookingId} AND payment_status = 'awaiting_payment'
      RETURNING id
    `
    if (updated.length > 0) await sendConfirmationsForBooking(bookingId)
  } else if (state === 'CANCELED' || state === 'TIMEOUTED') {
    // Nezaplacená rezervace uvolní slot
    await sql`DELETE FROM rez_bookings WHERE id = ${bookingId} AND payment_status = 'awaiting_payment'`
  }

  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  return handle(request.nextUrl.searchParams.get('id'))
}

// GoPay v některých konfiguracích posílá notifikaci POSTem — podchytíme obojí.
export async function POST(request: NextRequest) {
  return handle(request.nextUrl.searchParams.get('id'))
}
