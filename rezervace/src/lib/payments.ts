import crypto from 'crypto'

// Platební brána Stripe přes REST API (bez SDK závislosti — voláme přímo endpointy
// přes fetch s application/x-www-form-urlencoded). Aktivní jen když je nastaven
// STRIPE_SECRET_KEY; jinak appka běží dál v režimu bez online plateb.

const STRIPE_API = 'https://api.stripe.com/v1'

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

function secret(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY není nastaven')
  return key
}

// Zploští objekt do form-encoded páru dle Stripe konvence (a[b][c]=x).
function encodeForm(obj: Record<string, unknown>, prefix = ''): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (typeof v === 'object') {
      parts.push(encodeForm(v as Record<string, unknown>, key))
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
    }
  }
  return parts.filter(Boolean).join('&')
}

async function stripePost(path: string, data: Record<string, unknown>) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodeForm(data),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Stripe error: ${json?.error?.message || res.status}`)
  }
  return json
}

export interface CheckoutParams {
  amountMinor: number // částka v haléřích/centech
  currency: string
  bookingId: string
  productName: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}

// Vytvoří Stripe Checkout Session pro zálohu/platbu a vrátí URL k přesměrování.
export async function createCheckoutSession(p: CheckoutParams): Promise<{ id: string; url: string }> {
  const session = await stripePost('/checkout/sessions', {
    mode: 'payment',
    success_url: p.successUrl,
    cancel_url: p.cancelUrl,
    customer_email: p.customerEmail || undefined,
    client_reference_id: p.bookingId,
    'metadata[booking_id]': p.bookingId,
    'line_items[0][quantity]': 1,
    'line_items[0][price_data][currency]': p.currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': Math.round(p.amountMinor),
    'line_items[0][price_data][product_data][name]': p.productName,
  })
  return { id: session.id, url: session.url }
}

// Ověří podpis webhooku dle schématu Stripe (t=..,v1=..) bez SDK.
export function verifyStripeWebhook(rawBody: string, sigHeader: string | null): { type: string; data: { object: Record<string, unknown> } } {
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!whSecret) throw new Error('STRIPE_WEBHOOK_SECRET není nastaven')
  if (!sigHeader) throw new Error('Chybí Stripe-Signature')

  const parts = Object.fromEntries(
    sigHeader.split(',').map((kv) => kv.split('=').map((s) => s.trim()) as [string, string])
  )
  const timestamp = parts['t']
  const expected = parts['v1']
  if (!timestamp || !expected) throw new Error('Neplatná Stripe-Signature')

  const signedPayload = `${timestamp}.${rawBody}`
  const computed = crypto.createHmac('sha256', whSecret).update(signedPayload, 'utf8').digest('hex')

  const a = Buffer.from(computed)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('Podpis webhooku nesouhlasí')
  }

  // Ochrana proti replayi (tolerance 5 minut)
  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (age > 300) throw new Error('Webhook je příliš starý')

  return JSON.parse(rawBody)
}

// Kolik měn má nulový počet desetinných míst (částka se nenásobí 100).
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'HUF', 'CLP', 'VND'])

export function toMinorUnits(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100)
}
