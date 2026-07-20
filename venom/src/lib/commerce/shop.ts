import type { PoolClient } from "pg";
import { query, queryOne } from "@/lib/db";
import { initCommerceDb } from "./schema";
import type { Shop } from "./types";

/** Shop row for a tenant, or null when the tenant has no commerce activated. */
export async function getShopByTenantId(tenantId: number): Promise<Shop | null> {
  await initCommerceDb();
  return queryOne<Shop>("SELECT * FROM shops WHERE tenant_id = $1", [tenantId]);
}

/**
 * Create the shop row inside an existing transaction (tenant-factory / activation).
 * Idempotent — returns the existing row when already present.
 */
export async function ensureShopInTx(
  client: PoolClient,
  tenantId: number,
  defaults: { name?: string; orderNumberPrefix?: string } = {}
): Promise<Shop> {
  const existing = await client.query("SELECT * FROM shops WHERE tenant_id = $1", [tenantId]);
  if (existing.rows.length) return existing.rows[0] as Shop;

  const inserted = await client.query(
    `INSERT INTO shops (tenant_id, name, order_number_prefix)
     VALUES ($1, $2, $3)
     ON CONFLICT (tenant_id) DO UPDATE SET updated_at = now()
     RETURNING *`,
    [tenantId, defaults.name ?? "", defaults.orderNumberPrefix ?? "OBJ"]
  );
  return inserted.rows[0] as Shop;
}

const UPDATABLE_FIELDS = new Set([
  "name",
  "currency",
  "locale",
  "vat_mode",
  "default_tax_rate",
  "order_number_prefix",
  "company",
  "legal",
  "settings",
]);

export async function updateShop(
  tenantId: number,
  patch: Partial<Pick<Shop, "name" | "currency" | "locale" | "vat_mode" | "default_tax_rate" | "order_number_prefix" | "company" | "legal" | "settings">>
): Promise<Shop | null> {
  await initCommerceDb();

  const sets: string[] = [];
  const values: unknown[] = [tenantId];
  for (const [key, value] of Object.entries(patch)) {
    if (!UPDATABLE_FIELDS.has(key) || value === undefined) continue;
    values.push(typeof value === "object" ? JSON.stringify(value) : value);
    sets.push(`${key} = $${values.length}`);
  }
  if (!sets.length) return getShopByTenantId(tenantId);

  const rows = await query<Shop>(
    `UPDATE shops SET ${sets.join(", ")}, updated_at = now() WHERE tenant_id = $1 RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

/**
 * Atomically claim the next order number for a shop.
 * Format: {prefix}{YYYY}{5-digit seq} → "OBJ202600042".
 */
export async function nextOrderNumberInTx(client: PoolClient, tenantId: number): Promise<string> {
  const res = await client.query(
    `UPDATE shops SET order_number_seq = order_number_seq + 1, updated_at = now()
     WHERE tenant_id = $1
     RETURNING order_number_prefix, order_number_seq`,
    [tenantId]
  );
  if (!res.rows.length) throw new Error("Shop not found for tenant");
  const { order_number_prefix, order_number_seq } = res.rows[0];
  const year = new Date().getFullYear();
  return `${order_number_prefix}${year}${String(order_number_seq).padStart(5, "0")}`;
}
