import { query } from "@/lib/db";
import { initCommerceDb } from "./schema";

export interface CouponRow {
  id: number;
  code: string;
  type: string;
  value: number;
  min_order_cents: number | null;
  max_uses: number | null;
  used_count: number;
  applies_to: string;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export async function listCoupons(tenantId: number): Promise<CouponRow[]> {
  await initCommerceDb();
  return query<CouponRow>(
    `SELECT id, code, type, value, min_order_cents, max_uses, used_count, applies_to,
            valid_from, valid_until, is_active, created_at
     FROM commerce_coupons WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  );
}

export interface CouponInput {
  code: string;
  type: string;
  value: number;
  min_order_cents?: number | null;
  max_uses?: number | null;
  applies_to?: string;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean;
}

export async function createCoupon(tenantId: number, data: CouponInput): Promise<CouponRow> {
  await initCommerceDb();
  const rows = await query<CouponRow>(
    `INSERT INTO commerce_coupons (tenant_id, code, type, value, min_order_cents, max_uses, applies_to, valid_from, valid_until, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, code, type, value, min_order_cents, max_uses, used_count, applies_to, valid_from, valid_until, is_active, created_at`,
    [tenantId, data.code.toUpperCase().trim(), data.type, data.value,
     data.min_order_cents ?? null, data.max_uses ?? null,
     data.applies_to ?? "order", data.valid_from ?? null, data.valid_until ?? null,
     data.is_active ?? true]
  );
  return rows[0];
}

export async function updateCoupon(tenantId: number, couponId: number, data: Partial<CouponInput>): Promise<CouponRow | null> {
  await initCommerceDb();
  const sets: string[] = [];
  const vals: unknown[] = [tenantId, couponId];
  let i = 3;
  if (data.code !== undefined) { sets.push(`code = $${i++}`); vals.push(data.code.toUpperCase().trim()); }
  if (data.type !== undefined) { sets.push(`type = $${i++}`); vals.push(data.type); }
  if (data.value !== undefined) { sets.push(`value = $${i++}`); vals.push(data.value); }
  if (data.min_order_cents !== undefined) { sets.push(`min_order_cents = $${i++}`); vals.push(data.min_order_cents); }
  if (data.max_uses !== undefined) { sets.push(`max_uses = $${i++}`); vals.push(data.max_uses); }
  if (data.applies_to !== undefined) { sets.push(`applies_to = $${i++}`); vals.push(data.applies_to); }
  if (data.valid_from !== undefined) { sets.push(`valid_from = $${i++}`); vals.push(data.valid_from); }
  if (data.valid_until !== undefined) { sets.push(`valid_until = $${i++}`); vals.push(data.valid_until); }
  if (data.is_active !== undefined) { sets.push(`is_active = $${i++}`); vals.push(data.is_active); }
  if (!sets.length) return null;
  sets.push("updated_at = now()");
  const rows = await query<CouponRow>(
    `UPDATE commerce_coupons SET ${sets.join(", ")} WHERE tenant_id = $1 AND id = $2
     RETURNING id, code, type, value, min_order_cents, max_uses, used_count, applies_to, valid_from, valid_until, is_active, created_at`,
    vals
  );
  return rows[0] ?? null;
}

// ── Uplatnění v pokladně ──────────────────────────────────────────────────────

export type CouponValidation =
  | { ok: true; coupon: CouponRow; discount_cents: number; free_shipping: boolean }
  | { ok: false; error: string };

function czk(cents: number): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(cents / 100);
}

/** Ověří kupón proti mezisoučtu košíku a spočítá slevu. Ceny VŽDY počítá server. */
export async function validateCoupon(tenantId: number, code: string, subtotalCents: number): Promise<CouponValidation> {
  await initCommerceDb();
  const rows = await query<CouponRow>(
    `SELECT id, code, type, value, min_order_cents, max_uses, used_count, applies_to,
            valid_from, valid_until, is_active, created_at
     FROM commerce_coupons WHERE tenant_id = $1 AND code = $2`,
    [tenantId, code.toUpperCase().trim()]
  );
  const c = rows[0];
  if (!c) return { ok: false, error: "Tento kupón neznáme. Zkontrolujte kód." };
  if (!c.is_active) return { ok: false, error: "Kupón již není platný." };
  const now = Date.now();
  if (c.valid_from && new Date(c.valid_from).getTime() > now) return { ok: false, error: "Kupón zatím neplatí." };
  if (c.valid_until && new Date(c.valid_until).getTime() < now) return { ok: false, error: "Platnost kupónu vypršela." };
  if (c.max_uses != null && c.used_count >= c.max_uses) return { ok: false, error: "Kupón byl již vyčerpán." };
  if (c.min_order_cents != null && subtotalCents < c.min_order_cents) {
    return { ok: false, error: `Kupón platí pro objednávky od ${czk(c.min_order_cents)}.` };
  }

  let discount = 0;
  let freeShipping = false;
  if (c.type === "percentage") discount = Math.round((subtotalCents * c.value) / 100);
  else if (c.type === "fixed") discount = Math.min(c.value, subtotalCents);
  else if (c.type === "free_shipping") freeShipping = true;
  else return { ok: false, error: "Kupón již není platný." };

  return { ok: true, coupon: c, discount_cents: discount, free_shipping: freeShipping };
}

/** Započítá použití kupónu (po úspěšném vytvoření objednávky). */
export async function redeemCoupon(tenantId: number, couponId: number): Promise<void> {
  await query(
    "UPDATE commerce_coupons SET used_count = used_count + 1, updated_at = now() WHERE tenant_id = $1 AND id = $2",
    [tenantId, couponId]
  );
}

export async function deleteCoupon(tenantId: number, couponId: number): Promise<boolean> {
  await initCommerceDb();
  const rows = await query(`DELETE FROM commerce_coupons WHERE tenant_id = $1 AND id = $2 RETURNING id`, [tenantId, couponId]);
  return rows.length > 0;
}
