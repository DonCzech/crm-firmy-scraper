import { query } from "@/lib/db";
import { initCommerceDb } from "./schema";

export async function bulkUpdatePrices(
  tenantId: number,
  opts: {
    productIds?: number[];
    categoryId?: number;
    mode: "percent" | "fixed" | "set";
    value: number;
    field: "price_cents" | "compare_at_price_cents" | "cost_cents";
    roundTo?: number;
  }
): Promise<{ updated: number }> {
  await initCommerceDb();

  let variantFilter: string;
  const params: unknown[] = [tenantId];

  if (opts.productIds?.length) {
    params.push(opts.productIds);
    variantFilter = `pv.product_id = ANY($2)`;
  } else if (opts.categoryId) {
    params.push(opts.categoryId);
    variantFilter = `pv.product_id IN (SELECT product_id FROM product_category_links WHERE category_id = $2 AND tenant_id = $1)`;
  } else {
    variantFilter = "1=1";
  }

  let updateExpr: string;
  const roundTo = opts.roundTo ?? 100;

  switch (opts.mode) {
    case "percent":
      updateExpr = `ROUND(pv.${opts.field} * (1 + $${params.length + 1}::numeric / 100) / ${roundTo}) * ${roundTo}`;
      params.push(opts.value);
      break;
    case "fixed":
      updateExpr = `pv.${opts.field} + $${params.length + 1}`;
      params.push(opts.value);
      break;
    case "set":
      updateExpr = `$${params.length + 1}`;
      params.push(opts.value);
      break;
  }

  const result = await query<{ id: number }>(
    `UPDATE product_variants pv SET ${opts.field} = GREATEST(0, (${updateExpr})::int), updated_at = now()
     WHERE pv.tenant_id = $1 AND ${variantFilter} RETURNING pv.id`,
    params
  );

  return { updated: result.length };
}

export async function bulkAssignCategory(
  tenantId: number,
  productIds: number[],
  categoryId: number,
  mode: "add" | "replace"
): Promise<{ updated: number }> {
  await initCommerceDb();

  if (mode === "replace") {
    await query(
      `DELETE FROM product_category_links WHERE tenant_id = $1 AND product_id = ANY($2)`,
      [tenantId, productIds]
    );
  }

  const result = await query<{ product_id: number }>(
    `INSERT INTO product_category_links (tenant_id, product_id, category_id)
     SELECT $1, unnest($2::int[]), $3
     ON CONFLICT (product_id, category_id) DO NOTHING
     RETURNING product_id`,
    [tenantId, productIds, categoryId]
  );

  return { updated: result.length };
}

export async function bulkSetFlag(
  tenantId: number,
  productIds: number[],
  flag: string,
  value: boolean
): Promise<{ updated: number }> {
  await initCommerceDb();
  const result = await query<{ id: number }>(
    `UPDATE products SET flags = jsonb_set(COALESCE(flags, '{}'), $1, $2::jsonb), updated_at = now()
     WHERE tenant_id = $3 AND id = ANY($4) RETURNING id`,
    [`{${flag}}`, JSON.stringify(value), tenantId, productIds]
  );
  return { updated: result.length };
}

export async function bulkSetParams(
  tenantId: number,
  productIds: number[],
  params: Array<{ param_id: number; value: string }>
): Promise<{ updated: number }> {
  await initCommerceDb();
  let total = 0;
  for (const p of params) {
    for (const pid of productIds) {
      const numericValue = isNaN(Number(p.value)) ? null : Number(p.value);
      await query(
        `INSERT INTO commerce_product_params (tenant_id, product_id, param_id, value, numeric_value)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (product_id, param_id) DO UPDATE SET value = $4, numeric_value = $5`,
        [tenantId, pid, p.param_id, p.value, numericValue]
      );
      total++;
    }
  }
  return { updated: total };
}

export async function bulkSetTaxRate(
  tenantId: number,
  productIds: number[],
  taxRate: number
): Promise<{ updated: number }> {
  await initCommerceDb();
  const result = await query<{ id: number }>(
    `UPDATE products SET tax_rate = $1, updated_at = now() WHERE tenant_id = $2 AND id = ANY($3) RETURNING id`,
    [taxRate, tenantId, productIds]
  );
  return { updated: result.length };
}

export async function bulkUpdateStock(
  tenantId: number,
  updates: Array<{ variant_id: number; delta: number; reason?: string }>,
  actorEmail?: string
): Promise<{ updated: number }> {
  await initCommerceDb();
  let updated = 0;
  for (const u of updates) {
    await query(
      `UPDATE product_variants SET stock_qty = stock_qty + $1, updated_at = now()
       WHERE id = $2 AND tenant_id = $3`,
      [u.delta, u.variant_id, tenantId]
    );
    const row = await query<{ stock_qty: number }>(
      `SELECT stock_qty FROM product_variants WHERE id = $1`, [u.variant_id]
    );
    const qtyAfter = row?.[0]?.stock_qty ?? 0;
    await query(
      `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, actor_email)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tenantId, u.variant_id, u.delta, qtyAfter, u.reason ?? "manual", actorEmail ?? null]
    );
    updated++;
  }
  return { updated };
}

export async function bulkExportProducts(tenantId: number, opts?: { categoryId?: number; status?: string }) {
  await initCommerceDb();
  let where = "p.tenant_id = $1";
  const params: unknown[] = [tenantId];
  if (opts?.status) {
    params.push(opts.status);
    where += ` AND p.status = $${params.length}`;
  }
  if (opts?.categoryId) {
    params.push(opts.categoryId);
    where += ` AND p.id IN (SELECT product_id FROM product_category_links WHERE category_id = $${params.length})`;
  }

  const rows = await query<{
    title: string; slug: string; brand: string | null; sku: string | null;
    price_cents: number; compare_at_price_cents: number | null; stock_qty: number;
    status: string; category_name: string | null;
  }>(
    `SELECT p.title, p.slug, p.brand, pv.sku, pv.price_cents, pv.compare_at_price_cents, pv.stock_qty,
       p.status, pc.name AS category_name
     FROM products p
     JOIN product_variants pv ON pv.product_id = p.id AND pv.is_default = true
     LEFT JOIN product_categories pc ON pc.id = p.primary_category_id
     WHERE ${where}
     ORDER BY p.title`,
    params
  ) ?? [];

  const header = "Název;Slug;Značka;SKU;Cena;Původní cena;Sklad;Stav;Kategorie";
  const csvRows = rows.map((r) =>
    [
      `"${r.title.replace(/"/g, '""')}"`,
      r.slug,
      r.brand ?? "",
      r.sku ?? "",
      (r.price_cents / 100).toFixed(2),
      r.compare_at_price_cents ? (r.compare_at_price_cents / 100).toFixed(2) : "",
      r.stock_qty,
      r.status,
      r.category_name ?? "",
    ].join(";")
  );

  return "﻿" + [header, ...csvRows].join("\r\n");
}
