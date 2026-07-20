import { query, queryOne, withTransaction } from "@/lib/db";
import type { DiscountLine } from "./discounts";

/**
 * Modul „Sady produktů" — bundly variant se společnou slevou.
 * PDP zobrazuje sadu s přeškrtnutou cenou; sleva se počítá serverově
 * v pokladně i placeOrder, jakmile jsou v košíku všechny položky sady.
 */

export interface BundleItem {
  variant_id: number;
  qty: number;
  product_id: number;
  product_slug: string;
  product_title: string;
  variant_title: string | null;
  price_cents: number;
  image_url: string | null;
}

export interface Bundle {
  id: number;
  name: string;
  discount_pct: number;
  status: string; // active | paused
  created_at: string;
  items: BundleItem[];
  regular_cents: number;
  bundle_cents: number;
}

export async function initBundlesDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_bundles (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      discount_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_bundle_items (
      id SERIAL PRIMARY KEY,
      bundle_id INTEGER NOT NULL REFERENCES commerce_bundles(id) ON DELETE CASCADE,
      variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL DEFAULT 1
    );
  `);
}

async function hydrateBundles(tenantId: number, rows: { id: number; name: string; discount_pct: number; status: string; created_at: string }[]): Promise<Bundle[]> {
  if (!rows.length) return [];
  const items = await query<BundleItem & { bundle_id: number }>(
    `SELECT bi.bundle_id, bi.variant_id, bi.qty,
       p.id AS product_id, p.slug AS product_slug, p.title AS product_title,
       pv.title AS variant_title, pv.price_cents,
       img.url AS image_url
     FROM commerce_bundle_items bi
     JOIN product_variants pv ON pv.id = bi.variant_id
     JOIN products p ON p.id = pv.product_id
     LEFT JOIN LATERAL (
       SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1
     ) img ON true
     WHERE bi.bundle_id = ANY($1) AND p.tenant_id = $2
     ORDER BY bi.id`,
    [rows.map((r) => r.id), tenantId]
  );
  return rows.map((r) => {
    const its = items.filter((i) => i.bundle_id === r.id);
    const regular = its.reduce((s, i) => s + i.price_cents * i.qty, 0);
    const pct = Number(r.discount_pct);
    return {
      ...r,
      discount_pct: pct,
      items: its,
      regular_cents: regular,
      bundle_cents: Math.round(regular * (1 - pct / 100)),
    };
  });
}

export async function listBundles(tenantId: number): Promise<Bundle[]> {
  await initBundlesDb();
  const rows = await query<{ id: number; name: string; discount_pct: number; status: string; created_at: string }>(
    `SELECT id, name, discount_pct::float AS discount_pct, status, created_at
     FROM commerce_bundles WHERE tenant_id = $1 ORDER BY id DESC`,
    [tenantId]
  );
  return hydrateBundles(tenantId, rows);
}

/** Aktivní sady obsahující libovolnou variantu daného produktu (pro PDP). */
export async function getBundlesForProduct(tenantId: number, productId: number): Promise<Bundle[]> {
  await initBundlesDb();
  const rows = await query<{ id: number; name: string; discount_pct: number; status: string; created_at: string }>(
    `SELECT DISTINCT b.id, b.name, b.discount_pct::float AS discount_pct, b.status, b.created_at
     FROM commerce_bundles b
     JOIN commerce_bundle_items bi ON bi.bundle_id = b.id
     JOIN product_variants pv ON pv.id = bi.variant_id
     WHERE b.tenant_id = $1 AND b.status = 'active' AND pv.product_id = $2
     ORDER BY b.id`,
    [tenantId, productId]
  );
  // Jen kompletní sady se všemi produkty v prodeji
  const bundles = await hydrateBundles(tenantId, rows);
  const withActive = await Promise.all(bundles.map(async (b) => {
    const activeCount = await queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM commerce_bundle_items bi
       JOIN product_variants pv ON pv.id = bi.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE bi.bundle_id = $1 AND p.status = 'active'`,
      [b.id]
    );
    return parseInt(activeCount?.count ?? "0", 10) === b.items.length ? b : null;
  }));
  return withActive.filter((b): b is Bundle => b !== null);
}

export async function createBundle(
  tenantId: number,
  data: { name: string; discount_pct: number; items: { variant_id: number; qty: number }[] }
): Promise<{ id: number } | { error: string }> {
  await initBundlesDb();
  if (data.items.length < 2) return { error: "Sada musí obsahovat alespoň 2 položky" };

  // Varianty musí patřit tenantovi
  const owned = await query<{ id: number }>(
    `SELECT pv.id FROM product_variants pv JOIN products p ON p.id = pv.product_id
     WHERE p.tenant_id = $1 AND pv.id = ANY($2)`,
    [tenantId, data.items.map((i) => i.variant_id)]
  );
  if (owned.length !== new Set(data.items.map((i) => i.variant_id)).size) {
    return { error: "Některá varianta nebyla nalezena" };
  }

  const id = await withTransaction(async (client) => {
    const res = await client.query(
      `INSERT INTO commerce_bundles (tenant_id, name, discount_pct) VALUES ($1, $2, $3) RETURNING id`,
      [tenantId, data.name, data.discount_pct]
    );
    const bundleId: number = res.rows[0].id;
    for (const item of data.items) {
      await client.query(
        `INSERT INTO commerce_bundle_items (bundle_id, variant_id, qty) VALUES ($1, $2, $3)`,
        [bundleId, item.variant_id, Math.max(1, item.qty)]
      );
    }
    return bundleId;
  });
  return { id };
}

export async function updateBundleStatus(tenantId: number, id: number, status: string): Promise<boolean> {
  if (status !== "active" && status !== "paused") return false;
  const res = await query(
    `UPDATE commerce_bundles SET status = $3 WHERE tenant_id = $1 AND id = $2 RETURNING id`,
    [tenantId, id, status]
  );
  return res.length > 0;
}

export async function deleteBundle(tenantId: number, id: number): Promise<boolean> {
  const res = await query(
    `DELETE FROM commerce_bundles WHERE tenant_id = $1 AND id = $2 RETURNING id`,
    [tenantId, id]
  );
  return res.length > 0;
}

/**
 * Serverový výpočet slev za kompletní sady v košíku.
 * Sada se počítá tolikrát, kolik kompletních setů košík obsahuje.
 */
export async function computeBundleDiscounts(
  tenantId: number,
  cartItems: { variant_id: number; qty: number }[]
): Promise<DiscountLine[]> {
  await initBundlesDb();
  if (!cartItems.length) return [];

  const bundles = await listBundles(tenantId);
  const active = bundles.filter((b) => b.status === "active" && b.items.length >= 2);
  if (!active.length) return [];

  const inCart = new Map<number, number>();
  for (const i of cartItems) inCart.set(i.variant_id, (inCart.get(i.variant_id) ?? 0) + i.qty);

  const lines: DiscountLine[] = [];
  for (const b of active) {
    let sets = Infinity;
    for (const item of b.items) {
      const have = inCart.get(item.variant_id) ?? 0;
      sets = Math.min(sets, Math.floor(have / item.qty));
    }
    if (!Number.isFinite(sets) || sets <= 0) continue;
    const amount = sets * (b.regular_cents - b.bundle_cents);
    if (amount <= 0) continue;
    lines.push({
      source: "sady-produktu",
      label: `Sada „${b.name}" −${b.discount_pct} %${sets > 1 ? ` (${sets}×)` : ""}`,
      amount_cents: amount,
    });
    // Odečíst spotřebované kusy, aby se nepřekrývaly sady
    for (const item of b.items) {
      inCart.set(item.variant_id, (inCart.get(item.variant_id) ?? 0) - sets * item.qty);
    }
  }
  return lines;
}
