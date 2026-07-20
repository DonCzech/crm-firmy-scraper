import { query, queryOne, withTransaction } from "@/lib/db";

/**
 * Modul „Synchronizace skladu" — načte skladový feed (CSV nebo XML) z URL,
 * spáruje položky podle SKU/EAN s variantami a zapíše nové stavy skladu
 * včetně auditních záznamů do stock_movements (reason 'sync').
 */

export interface StockFeedItem { sku: string; qty: number }

export interface StockSyncRun {
  id: number;
  feed_url: string;
  status: string; // ok | error
  items_in_feed: number;
  matched: number;
  updated: number;
  unchanged: number;
  unknown_skus: string[];
  error: string | null;
  created_at: string;
}

export async function initStockSyncDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_stock_sync_config (
      tenant_id INTEGER PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
      feed_url TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_stock_sync_runs (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      feed_url TEXT NOT NULL,
      status TEXT NOT NULL,
      items_in_feed INTEGER NOT NULL DEFAULT 0,
      matched INTEGER NOT NULL DEFAULT 0,
      updated INTEGER NOT NULL DEFAULT 0,
      unchanged INTEGER NOT NULL DEFAULT 0,
      unknown_skus JSONB NOT NULL DEFAULT '[]',
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

/** CSV: hlavička s sloupci sku/code/ean + qty/stock/quantity, nebo prosté `sku,qty` řádky. */
function parseCsv(text: string): StockFeedItem[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const header = lines[0].toLowerCase().split(sep).map((h) => h.trim().replace(/"/g, ""));
  let skuIdx = header.findIndex((h) => ["sku", "code", "kod", "ean"].includes(h));
  let qtyIdx = header.findIndex((h) => ["qty", "quantity", "stock", "sklad", "mnozstvi"].includes(h));
  let start = 1;
  if (skuIdx === -1 || qtyIdx === -1) { skuIdx = 0; qtyIdx = 1; start = 0; }

  const items: StockFeedItem[] = [];
  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const sku = cols[skuIdx];
    const qty = parseInt(cols[qtyIdx], 10);
    if (sku && Number.isFinite(qty) && qty >= 0) items.push({ sku, qty });
  }
  return items;
}

/** XML: páruje <SKU|CODE|KOD|EAN> a <QTY|STOCK|QUANTITY|SKLAD> uvnitř item elementů. */
function parseXml(text: string): StockFeedItem[] {
  const items: StockFeedItem[] = [];
  const itemBlocks = text.match(/<(item|shopitem|product|polozka)\b[\s\S]*?<\/\1>/gi) ?? [];
  for (const block of itemBlocks) {
    const sku = block.match(/<(sku|code|kod|ean)>\s*([^<]+?)\s*<\/\1>/i)?.[2];
    const qtyRaw = block.match(/<(qty|stock|quantity|sklad|mnozstvi)>\s*([^<]+?)\s*<\/\1>/i)?.[2];
    const qty = parseInt(qtyRaw ?? "", 10);
    if (sku && Number.isFinite(qty) && qty >= 0) items.push({ sku, qty });
  }
  return items;
}

export function parseStockFeed(text: string): StockFeedItem[] {
  const trimmed = text.trim();
  return trimmed.startsWith("<") ? parseXml(trimmed) : parseCsv(trimmed);
}

export async function getStockSyncConfig(tenantId: number): Promise<{ feed_url: string } | null> {
  await initStockSyncDb();
  return queryOne<{ feed_url: string }>(
    `SELECT feed_url FROM commerce_stock_sync_config WHERE tenant_id = $1`, [tenantId]
  );
}

export async function saveStockSyncConfig(tenantId: number, feedUrl: string): Promise<void> {
  await initStockSyncDb();
  await query(
    `INSERT INTO commerce_stock_sync_config (tenant_id, feed_url) VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO UPDATE SET feed_url = $2, updated_at = now()`,
    [tenantId, feedUrl]
  );
}

export async function listStockSyncRuns(tenantId: number, limit = 20): Promise<StockSyncRun[]> {
  await initStockSyncDb();
  return query<StockSyncRun>(
    `SELECT id, feed_url, status, items_in_feed, matched, updated, unchanged, unknown_skus, error, created_at
     FROM commerce_stock_sync_runs WHERE tenant_id = $1 ORDER BY id DESC LIMIT $2`,
    [tenantId, limit]
  );
}

async function logRun(tenantId: number, feedUrl: string, data: Partial<StockSyncRun> & { status: string }): Promise<void> {
  await query(
    `INSERT INTO commerce_stock_sync_runs (tenant_id, feed_url, status, items_in_feed, matched, updated, unchanged, unknown_skus, error)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [tenantId, feedUrl, data.status, data.items_in_feed ?? 0, data.matched ?? 0, data.updated ?? 0,
     data.unchanged ?? 0, JSON.stringify(data.unknown_skus ?? []), data.error ?? null]
  );
}

export async function runStockSync(
  tenantId: number,
  feedUrl: string,
  actorEmail: string | null
): Promise<{ ok: true; items_in_feed: number; matched: number; updated: number; unchanged: number; unknown_skus: string[] } | { error: string }> {
  await initStockSyncDb();

  let text: string;
  try {
    const res = await fetch(feedUrl, { signal: AbortSignal.timeout(15000), headers: { Accept: "text/csv, application/xml, text/xml, text/plain" } });
    if (!res.ok) throw new Error(`Feed vrátil HTTP ${res.status}`);
    text = await res.text();
    if (text.length > 5_000_000) throw new Error("Feed je příliš velký (max 5 MB)");
  } catch (e) {
    const error = e instanceof Error ? e.message : "Stažení feedu selhalo";
    await logRun(tenantId, feedUrl, { status: "error", error });
    return { error };
  }

  const items = parseStockFeed(text);
  if (!items.length) {
    const error = "Ve feedu nebyly nalezeny žádné položky (očekávám CSV sku,qty nebo XML <item><sku><qty>)";
    await logRun(tenantId, feedUrl, { status: "error", error });
    return { error };
  }

  // Mapování SKU i EAN → varianta
  const variants = await query<{ id: number; sku: string | null; ean: string | null; stock_qty: number }>(
    `SELECT v.id, v.sku, v.ean, v.stock_qty FROM product_variants v
     JOIN products p ON p.id = v.product_id WHERE p.tenant_id = $1`,
    [tenantId]
  );
  const byKey = new Map<string, { id: number; stock_qty: number }>();
  for (const v of variants) {
    if (v.sku) byKey.set(v.sku.toLowerCase(), v);
    if (v.ean) byKey.set(v.ean.toLowerCase(), v);
  }

  let matched = 0, updated = 0, unchanged = 0;
  const unknown: string[] = [];
  const restockedIds: number[] = [];

  await withTransaction(async (client) => {
    for (const item of items) {
      const variant = byKey.get(item.sku.toLowerCase());
      if (!variant) { unknown.push(item.sku); continue; }
      matched++;
      if (variant.stock_qty === item.qty) { unchanged++; continue; }
      const delta = item.qty - variant.stock_qty;
      if (delta > 0 && item.qty > 0) restockedIds.push(variant.id);
      await client.query(
        `UPDATE product_variants SET stock_qty = $1, updated_at = now() WHERE id = $2`,
        [item.qty, variant.id]
      );
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, actor_email, note)
         VALUES ($1, $2, $3, $4, 'sync', $5, $6)`,
        [tenantId, variant.id, delta, item.qty, actorEmail, `Synchronizace skladu z feedu`]
      );
      updated++;
    }
  });

  // Modul hlidaci-pes: naskladněné varianty → upozornit čekající zákazníky (mimo kritickou cestu)
  if (restockedIds.length) {
    import("./stock-watch")
      .then((m) => m.notifyStockWatchers(tenantId, restockedIds))
      .catch((e) => console.error("[stock-watch] notify failed:", e));
  }

  const result = { items_in_feed: items.length, matched, updated, unchanged, unknown_skus: unknown.slice(0, 50) };
  await logRun(tenantId, feedUrl, { status: "ok", ...result });
  return { ok: true, ...result };
}
