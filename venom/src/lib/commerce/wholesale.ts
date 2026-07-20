import { query, queryOne } from "@/lib/db";
import type { DiscountLine } from "./discounts";

/**
 * Modul „Velkoobchod (B2B)" — registrace velkoobchodních partnerů,
 * schvalování v adminu a individuální velkoobchodní sleva.
 * Sleva se aplikuje serverově při objednávce podle e-mailu schváleného partnera.
 */

export interface WholesalePartner {
  id: number;
  email: string;
  company: string;
  ico: string | null;
  dic: string | null;
  phone: string | null;
  note: string | null;
  discount_pct: number;
  status: string; // pending | approved | rejected
  created_at: string;
  orders_count: number;
  orders_total_cents: number;
}

export async function initWholesaleDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_wholesale_partners (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      ico TEXT,
      dic TEXT,
      phone TEXT,
      note TEXT,
      discount_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, email)
    );
  `);
}

export async function listWholesalePartners(tenantId: number): Promise<WholesalePartner[]> {
  await initWholesaleDb();
  return query<WholesalePartner>(
    `SELECT wp.id, wp.email, wp.company, wp.ico, wp.dic, wp.phone, wp.note,
       wp.discount_pct::float AS discount_pct, wp.status, wp.created_at,
       COALESCE(o.cnt, 0)::int AS orders_count,
       COALESCE(o.total, 0)::bigint AS orders_total_cents
     FROM commerce_wholesale_partners wp
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS cnt, SUM(total_cents) AS total
       FROM orders WHERE tenant_id = wp.tenant_id AND email = wp.email AND status <> 'cancelled'
     ) o ON true
     WHERE wp.tenant_id = $1
     ORDER BY (wp.status = 'pending') DESC, wp.id DESC`,
    [tenantId]
  );
}

/** Veřejná registrace partnera ze storefrontu — čeká na schválení. */
export async function requestWholesalePartner(
  tenantId: number,
  data: { email: string; company: string; ico?: string; dic?: string; phone?: string; note?: string }
): Promise<{ ok: true } | { error: string }> {
  await initWholesaleDb();
  const email = data.email.trim().toLowerCase();
  const existing = await queryOne<{ status: string }>(
    "SELECT status FROM commerce_wholesale_partners WHERE tenant_id = $1 AND email = $2",
    [tenantId, email]
  );
  if (existing) {
    if (existing.status === "approved") return { error: "Tento e-mail už má schválený velkoobchodní účet." };
    if (existing.status === "pending") return { error: "Žádost s tímto e-mailem už čeká na schválení." };
    return { error: "Žádost s tímto e-mailem byla zamítnuta. Kontaktujte nás prosím." };
  }
  await query(
    `INSERT INTO commerce_wholesale_partners (tenant_id, email, company, ico, dic, phone, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [tenantId, email, data.company.trim(), data.ico?.trim() || null, data.dic?.trim() || null, data.phone?.trim() || null, data.note?.trim() || null]
  );
  return { ok: true };
}

/** Admin: rovnou schválený partner. */
export async function createWholesalePartner(
  tenantId: number,
  data: { email: string; company: string; ico?: string; discount_pct: number }
): Promise<{ id: number } | { error: string }> {
  await initWholesaleDb();
  const email = data.email.trim().toLowerCase();
  const dup = await queryOne<{ id: number }>(
    "SELECT id FROM commerce_wholesale_partners WHERE tenant_id = $1 AND email = $2",
    [tenantId, email]
  );
  if (dup) return { error: "Partner s tímto e-mailem už existuje" };
  const row = await queryOne<{ id: number }>(
    `INSERT INTO commerce_wholesale_partners (tenant_id, email, company, ico, discount_pct, status)
     VALUES ($1, $2, $3, $4, $5, 'approved') RETURNING id`,
    [tenantId, email, data.company.trim(), data.ico?.trim() || null, data.discount_pct]
  );
  return { id: row!.id };
}

export async function updateWholesalePartner(
  tenantId: number,
  id: number,
  patch: { status?: string; discount_pct?: number }
): Promise<boolean> {
  if (patch.status && !["pending", "approved", "rejected"].includes(patch.status)) return false;
  const sets: string[] = [];
  const vals: unknown[] = [tenantId, id];
  if (patch.status) { vals.push(patch.status); sets.push(`status = $${vals.length}`); }
  if (patch.discount_pct != null) { vals.push(patch.discount_pct); sets.push(`discount_pct = $${vals.length}`); }
  if (!sets.length) return false;
  const res = await query(
    `UPDATE commerce_wholesale_partners SET ${sets.join(", ")} WHERE tenant_id = $1 AND id = $2 RETURNING id`,
    vals
  );
  return res.length > 0;
}

export async function deleteWholesalePartner(tenantId: number, id: number): Promise<boolean> {
  const res = await query(
    "DELETE FROM commerce_wholesale_partners WHERE tenant_id = $1 AND id = $2 RETURNING id",
    [tenantId, id]
  );
  return res.length > 0;
}

export async function getApprovedPartner(tenantId: number, email: string): Promise<{ company: string; discount_pct: number } | null> {
  await initWholesaleDb();
  const row = await queryOne<{ company: string; discount_pct: number }>(
    `SELECT company, discount_pct::float AS discount_pct FROM commerce_wholesale_partners
     WHERE tenant_id = $1 AND email = $2 AND status = 'approved'`,
    [tenantId, email.trim().toLowerCase()]
  );
  return row ?? null;
}

/** Velkoobchodní sleva na celý košík pro schváleného partnera. */
export async function computeWholesaleDiscount(
  tenantId: number,
  email: string,
  subtotalCents: number
): Promise<DiscountLine | null> {
  const partner = await getApprovedPartner(tenantId, email);
  if (!partner || partner.discount_pct <= 0) return null;
  const amount = Math.round(subtotalCents * (partner.discount_pct / 100));
  if (amount <= 0) return null;
  return {
    source: "velkoobchod",
    label: `Velkoobchodní sleva (${partner.company}) −${partner.discount_pct} %`,
    amount_cents: amount,
  };
}
