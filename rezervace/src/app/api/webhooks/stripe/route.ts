import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyStripeWebhook } from '@/lib/payments'
import { sendConfirmationsForBooking } from '@/lib/notify'

// Stripe posílá webhook s podepsaným raw tělem — nesmíme ho parsovat přes .json()
// dřív, než ověříme podpis. Proto čteme text().
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event
  try {
    event = verifyStripeWebhook(rawBody, sig)
  } catch (err) {
    console.error('Stripe webhook ověření selhalo:', err)
    return NextResponse.json({ error: 'Neplatný podpis' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Record<string, unknown>
      const bookingId = (session.metadata as Record<string, string>)?.booking_id || (session.client_reference_id as string)
      if (bookingId) {
        // Potvrdíme jen rezervaci, která na platbu čekala (idempotentní)
        const updated = await sql`
          UPDATE rez_bookings
          SET status = 'confirmed', payment_status = 'paid', payment_method = 'card', updated_at = NOW()
          WHERE id = ${bookingId} AND payment_status = 'awaiting_payment'
          RETURNING id
        `
        if (updated.length > 0) {
          await sendConfirmationsForBooking(bookingId)
        }
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Record<string, unknown>
      const bookingId = (session.metadata as Record<string, string>)?.booking_id || (session.client_reference_id as string)
      if (bookingId) {
        // Nezaplacená vypršelá rezervace se uvolní (smaže), ať neblokuje slot
        await sql`DELETE FROM rez_bookings WHERE id = ${bookingId} AND payment_status = 'awaiting_payment'`
      }
    }
  } catch (err) {
    console.error('Stripe webhook zpracování selhalo:', err)
    return NextResponse.json({ error: 'Chyba zpracování' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
