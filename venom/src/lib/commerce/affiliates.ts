import { query, queryOne } from "@/lib/db";

/**
 * Modul „Provizní (affiliate) systém" — partneři s ref. kódy, tracking cookie
 * na storefrontu (?aff=KOD) a konverze zapsané při dokončení objednávky.
 */

export const AFF_COOKIE_PREFIX = "webero_aff_";
export const AFF_COOKIE_DAYS = 30;

export interface AffiliateRow {
  id: number;
  name: string;
  email: string | null;
  code: string;
  commission_pct: number;
  status: string; // active | paused
  created_at: string;
  conversions_count: number;
  orders_total_cents: number;
  commission_pending_cents: number;
  commission_approved_cents: number;
  commission_paid_cents: number;
}

export interface ConversionRow {
  id: number;
  affiliate_id: number;
  affiliate_name: string;
  affiliate_code: string;
  order_id: number;
  order_number: string | null;
  order_total_cents: number;
  commission_cents: number;
  status: string; // pending | approved | paid | rejected
  created_at: string;
}

export async function initAffiliatesDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_affiliates (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      code TEXT NOT NULL,
      commission_pct NUMERIC(5,2) NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, code)
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_affiliate_conversions (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      affiliate_id INTEGER NOT NULL REFERENCES commerce_affiliates(id) ON DELETE CASCADE,
      order_id INTEGER NOT NULL,
      order_total_cents INTEGER NOT NULL,
      commission_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, order_id)
    );
  `);
}

function randomCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createAffiliate(
  tenantId: number,
  data: { name: string; email?: string | null; code?: string | null; commission_pct: number }
): Promise<{ id: number; code: string } | { error: string }> {
  await initAffiliatesDb();
  const code = (data.code?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "") || randomCode()).slice(0, 24);
  const existing = await queryOne<{ id: number }>(
    `SELECT id FROM commerce_affiliates WHERE tenant_id = $1 AND code = $2`,
    [tenantId, code]
  );
  if (existing) return { error: `Kód ${code} už používá jiný partner` };
  const row = await queryOne<{ id: number }>(
    `INSERT INTO commerce_affiliates (tenant_id, name, email, code, commission_pct)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [tenantId, data.name, data.email || null, code, data.commission_pct]
  );
  return { id: row!.id, code };
}

export async function updateAffiliate(
  tenantId: number,
  id: number,
  data: { status?: string; commission_pct?: number }
): Promise<boolean> {
  const sets: string[] = [];
  const args: unknown[] = [tenantId, id];
  if (data.status) { args.push(data.status); sets.push(`status = $${args.length}`); }
  if (data.commission_pct !== undefined) { args.push(data.commission_pct); sets.push(`commission_pct = $${args.length}`); }
  if (!sets.length) return false;
  const res = await query(
    `UPDATE commerce_affiliates SET ${sets.join(", ")} WHERE tenant_id = $1 AND id = $2 RETURNING id`,
    args
  );
  return res.length > 0;
}

export async function deleteAffiliate(tenantId: number, id: number): Promise<boolean> {
  const res = await query(
    `DELETE FROM commerce_affiliates WHERE tenant_id = $1 AND id = $2 RETURNING id`,
    [tenantId, id]
  );
  return res.length > 0;
}

export async function listAffiliates(tenantId: number): Promise<AffiliateRow[]> {
  await initAffiliatesDb();
  return query<AffiliateRow>(
    `SELECT a.id, a.name, a.email, a.code, a.commission_pct::float AS commission_pct, a.status, a.created_at,
       COUNT(c.id)::int AS conversions_count,
       COALESCE(SUM(c.order_total_cents), 0)::int AS orders_total_cents,
       COALESCE(SUM(c.commission_cents) FILTER (WHERE c.status = 'pending'), 0)::int AS commission_pending_cents,
       COALESCE(SUM(c.commission_cents) FILTER (WHERE c.status = 'approved'), 0)::int AS commission_approved_cents,
       COALESCE(SUM(c.commission_cents) FILTER (WHERE c.status = 'paid'), 0)::int AS commission_paid_cents
     FROM commerce_affiliates a
     LEFT JOIN commerce_affiliate_conversions c ON c.affiliate_id = a.id AND c.status <> 'rejected'
     WHERE a.tenant_id = $1
     GROUP BY a.id
     ORDER BY a.created_at DESC`,
    [tenantId]
  );
}

/** Zapíše konverzi pro objednávku podle ref. kódu z cookie (idempotentně na objednávku). */
export async function recordConversion(
  tenantId: number,
  code: string,
  order: { id: number; total_cents: number }
): Promise<void> {
  await initAffiliatesDb();
  const aff = await queryOne<{ id: number; commission_pct: number }>(
    `SELECT id, commission_pct::float AS commission_pct FROM commerce_affiliates
     WHERE tenant_id = $1 AND code = $2 AND status = 'active'`,
    [tenantId, code.toUpperCase()]
  );
  if (!aff) return;
  const commission = Math.round(order.total_cents * (aff.commission_pct / 100));
  await query(
    `INSERT INTO commerce_affiliate_conversions (tenant_id, affiliate_id, order_id, order_total_cents, commission_cents)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tenant_id, order_id) DO NOTHING`,
    [tenantId, aff.id, order.id, order.total_cents, commission]
  );
}

export async function listConversions(tenantId: number, limit = 100): Promise<ConversionRow[]> {
  await initAffiliatesDb();
  return query<ConversionRow>(
    `SELECT c.id, c.affiliate_id, a.name AS affiliate_name, a.code AS affiliate_code,
       c.order_id, o.order_number, c.order_total_cents, c.commission_cents, c.status, c.created_at
     FROM commerce_affiliate_conversions c
     JOIN commerce_affiliates a ON a.id = c.affiliate_id
     LEFT JOIN orders o ON o.id = c.order_id
     WHERE c.tenant_id = $1
     ORDER BY c.id DESC LIMIT $2`,
    [tenantId, limit]
  );
}

const CONVERSION_STATUSES = new Set(["pending", "approved", "paid", "rejected"]);

export async function updateConversionStatus(tenantId: number, id: number, status: string): Promise<boolean> {
  if (!CONVERSION_STATUSES.has(status)) return false;
  const res = await query(
    `UPDATE commerce_affiliate_conversions SET status = $3 WHERE tenant_id = $1 AND id = $2 RETURNING id`,
    [tenantId, id, status]
  );
  return res.length > 0;
}
