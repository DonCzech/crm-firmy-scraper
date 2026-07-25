// SMS notifikace — abstrakce nad poskytovatelem. Aktivní jen když je nastaven
// SMS_PROVIDER a příslušné klíče. Bez konfigurace se volání tiše přeskočí (no-op),
// aby zbytek appky fungoval beze změny.
//
// Podporováno:
//   SMS_PROVIDER=smsbrana  → SMSBRANA_LOGIN, SMSBRANA_PASSWORD (smsbrana.cz)
//   SMS_PROVIDER=twilio    → TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM

export function isSmsConfigured(): boolean {
  const p = process.env.SMS_PROVIDER
  if (p === 'smsbrana') return !!(process.env.SMSBRANA_LOGIN && process.env.SMSBRANA_PASSWORD)
  if (p === 'twilio') return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM)
  return false
}

// Normalizace čísla do E.164 (předpokládá české číslo, když bez předvolby).
export function normalizePhone(raw: string): string {
  let p = String(raw || '').replace(/[\s()-]/g, '')
  if (!p) return ''
  if (p.startsWith('00')) p = '+' + p.slice(2)
  if (p.startsWith('+')) return p
  if (p.length === 9) return '+420' + p // ČR bez předvolby
  return '+' + p
}

export interface SmsResult {
  ok: boolean
  ref?: string
  error?: string
}

async function sendViaSmsbrana(to: string, text: string): Promise<SmsResult> {
  const login = process.env.SMSBRANA_LOGIN!
  const password = process.env.SMSBRANA_PASSWORD!
  const url = new URL('https://api.smsbrana.cz/smsconnect/http.php')
  url.searchParams.set('action', 'send_sms')
  url.searchParams.set('login', login)
  url.searchParams.set('password', password)
  url.searchParams.set('number', to.replace('+', ''))
  url.searchParams.set('message', text)
  const res = await fetch(url.toString())
  const body = await res.text()
  // smsbrana vrací XML s <err>0</err> při úspěchu
  const ok = /<err>0<\/err>/.test(body) || res.ok
  return ok ? { ok: true } : { ok: false, error: body.slice(0, 200) }
}

async function sendViaTwilio(to: string, text: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID!
  const token = process.env.TWILIO_AUTH_TOKEN!
  const from = process.env.TWILIO_FROM!
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: text }).toString(),
  })
  const json = await res.json().catch(() => ({}))
  return res.ok ? { ok: true, ref: json.sid } : { ok: false, error: json?.message || String(res.status) }
}

export async function sendSms(rawTo: string, text: string): Promise<SmsResult> {
  if (!isSmsConfigured()) return { ok: false, error: 'SMS není nakonfigurováno' }
  const to = normalizePhone(rawTo)
  if (!to) return { ok: false, error: 'Chybí telefonní číslo' }
  try {
    if (process.env.SMS_PROVIDER === 'smsbrana') return await sendViaSmsbrana(to, text)
    if (process.env.SMS_PROVIDER === 'twilio') return await sendViaTwilio(to, text)
    return { ok: false, error: 'Neznámý SMS_PROVIDER' }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
