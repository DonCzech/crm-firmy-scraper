import { sql } from '@/lib/db'

// Vyhodnocení slevového kódu a dárkového poukazu vůči částce rezervace.
// Sdílené mezi veřejným ověřením (živý přepočet ve formuláři) a vlastním
// založením rezervace (autoritativní přepočet na serveru).

export interface CouponResult {
  valid: boolean
  reason?: string
  couponId?: string
  code?: string
  discount: number // absolutní sleva v měně
}

export async function resolveCoupon(userId: string, rawCode: string, amount: number): Promise<CouponResult> {
  const code = String(rawCode || '').trim().toUpperCase()
  if (!code) return { valid: false, discount: 0, reason: 'Prázdný kód' }

  const rows = await sql`
    SELECT * FROM rez_coupons
    WHERE user_id = ${userId} AND UPPER(code) = ${code} AND is_active = true
    LIMIT 1
  `
  if (rows.length === 0) return { valid: false, discount: 0, reason: 'Kód neplatí' }
  const c = rows[0]

  if (c.valid_until && new Date(String(c.valid_until)) < new Date(new Date().toDateString())) {
    return { valid: false, discount: 0, reason: 'Platnost vypršela' }
  }
  if (c.max_uses != null && Number(c.used_count) >= Number(c.max_uses)) {
    return { valid: false, discount: 0, reason: 'Vyčerpáno' }
  }

  let discount = c.type === 'percent' ? (amount * Number(c.value)) / 100 : Number(c.value)
  discount = Math.min(Math.max(discount, 0), amount) // nikdy víc než částka
  discount = Math.round(discount * 100) / 100

  return { valid: true, discount, couponId: c.id, code: c.code }
}

export interface VoucherResult {
  valid: boolean
  reason?: string
  voucherId?: string
  code?: string
  applied: number // kolik se z poukazu použije
  remaining: number
}

export async function resolveVoucher(userId: string, rawCode: string, amount: number): Promise<VoucherResult> {
  const code = String(rawCode || '').trim().toUpperCase()
  if (!code) return { valid: false, applied: 0, remaining: 0, reason: 'Prázdný kód' }

  const rows = await sql`
    SELECT * FROM rez_vouchers
    WHERE user_id = ${userId} AND UPPER(code) = ${code} AND is_active = true
    LIMIT 1
  `
  if (rows.length === 0) return { valid: false, applied: 0, remaining: 0, reason: 'Poukaz neplatí' }
  const v = rows[0]

  if (v.valid_until && new Date(String(v.valid_until)) < new Date(new Date().toDateString())) {
    return { valid: false, applied: 0, remaining: 0, reason: 'Platnost vypršela' }
  }
  const remaining = Number(v.remaining_amount)
  if (remaining <= 0) return { valid: false, applied: 0, remaining: 0, reason: 'Vyčerpáno' }

  const applied = Math.min(remaining, amount)
  return { valid: true, applied: Math.round(applied * 100) / 100, remaining, voucherId: v.id, code: v.code }
}

// Náhodný čitelný kód (bez matoucích znaků) pro poukazy.
export function generateCode(prefix = ''): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return prefix ? `${prefix}-${out}` : out
}
