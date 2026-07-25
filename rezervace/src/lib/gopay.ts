// Platební brána GoPay přes REST API (bez SDK). Aktivní jen když jsou nastaveny
// GOPAY_GOID, GOPAY_CLIENT_ID, GOPAY_CLIENT_SECRET. GoPay nepodepisuje callback
// tělo jako Stripe — notifikace přijde jen s ?id=<paymentId> a stav si musíme
// autoritativně dotáhnout přes API (getPaymentState). To je zároveň ochrana proti
// podvrženému callbacku.

const DEFAULT_BASE = 'https://gate.gopay.com/api' // sandbox: https://gw.sandbox.gopay.com/api

function base(): string {
  return (process.env.GOPAY_API_URL || DEFAULT_BASE).replace(/\/$/, '')
}

export function isGoPayConfigured(): boolean {
  return !!(process.env.GOPAY_GOID && process.env.GOPAY_CLIENT_ID && process.env.GOPAY_CLIENT_SECRET)
}

// OAuth2 client_credentials → access token. Cachovat netřeba: zálohy jsou řídké
// a token má krátkou platnost; jeden token na jednu operaci je bezpečnější.
async function getToken(scope: 'payment-create' | 'payment-all'): Promise<string> {
  const id = process.env.GOPAY_CLIENT_ID!
  const secret = process.env.GOPAY_CLIENT_SECRET!
  const res = await fetch(`${base()}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: `grant_type=client_credentials&scope=${scope}`,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.access_token) {
    throw new Error(`GoPay token error: ${json?.errors?.[0]?.message || res.status}`)
  }
  return json.access_token as string
}

export interface GoPayCreateParams {
  amountMinor: number // v haléřích/centech (integer)
  currency: string
  orderNumber: string
  description: string
  productName: string
  returnUrl: string
  notifyUrl: string
  contactEmail?: string
}

// Vytvoří platbu a vrátí bránu (gw_url) k přesměrování plátce.
export async function createGoPayPayment(p: GoPayCreateParams): Promise<{ id: string; gwUrl: string }> {
  const token = await getToken('payment-create')
  const goid = Number(process.env.GOPAY_GOID)

  const body = {
    target: { type: 'ACCOUNT', goid },
    amount: Math.round(p.amountMinor),
    currency: p.currency.toUpperCase(),
    order_number: p.orderNumber,
    order_description: p.description,
    items: [{ name: p.productName, amount: Math.round(p.amountMinor), count: 1 }],
    ...(p.contactEmail ? { payer: { contact: { email: p.contactEmail } } } : {}),
    callback: { return_url: p.returnUrl, notification_url: p.notifyUrl },
    lang: 'CS',
  }

  const res = await fetch(`${base()}/payments/payment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.gw_url) {
    throw new Error(`GoPay create error: ${json?.errors?.[0]?.message || res.status}`)
  }
  return { id: String(json.id), gwUrl: json.gw_url as string }
}

// Autoritativní stav platby (PAID/CANCELED/TIMEOUTED/CREATED/…).
export async function getGoPayPaymentState(paymentId: string): Promise<string> {
  const token = await getToken('payment-all')
  const res = await fetch(`${base()}/payments/payment/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`GoPay status error: ${json?.errors?.[0]?.message || res.status}`)
  return String(json.state || '')
}
