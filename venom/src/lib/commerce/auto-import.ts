import { query, queryOne } from "@/lib/db";
import { createProduct } from "@/lib/commerce/products";

/**
 * Modul „Automatický import" — import produktů z XML/CSV feedu na URL.
 * Nové SKU → založí produkt (draft) s variantou, cenou, obrázkem a skladem;
 * existující SKU → aktualizuje cenu a sklad. Každý běh je zalogovaný.
 */

export interface ImportFeedItem {
  sku: string;
  title: string;
  price_cents: number;
  description?: string | null;
  brand?: string | null;
  image_url?: string | null;
  ean?: string | null;
  stock_qty?: number | null;
}

export interface AutoImportRun {
  id: number;
  feed_url: string;
  status: string; // ok | error
  items_in_feed: number;
  created: number;
  updated: number;
  skipped: number;
  error: string | null;
  created_at: string;
}

export async function initAutoImportDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_auto_import_config (
      tenant_id INTEGER PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
      feed_url TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_auto_import_runs (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      feed_url TEXT NOT NULL,
      status TEXT NOT NULL,
      items_in_feed INTEGER NOT NULL DEFAULT 0,
      created INTEGER NOT NULL DEFAULT 0,
      updated INTEGER NOT NULL DEFAULT 0,
      skipped INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function parsePriceCents(raw: string | undefined): number | null {
  if (!raw) return null;
  const num = parseFloat(raw.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100);
}

function tag(block: string, names: string[]): string | undefined {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${n}>`, "i"));
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return undefined;
}

/** XML: Shoptet/Heureka-like <SHOPITEM> nebo obecné <item>/<product> bloky. */
function parseXmlFeed(text: string): ImportFeedItem[] {
  const items: ImportFeedItem[] = [];
  const blocks = text.match(/<(shopitem|item|product|polozka)\b[\s\S]*?<\/\1>/gi) ?? [];
  for (const block of blocks) {
    const sku = tag(block, ["CODE", "SKU", "KOD", "ITEM_ID", "ITEMID"]);
    const title = tag(block, ["NAME", "PRODUCTNAME", "PRODUCT", "TITLE", "NAZEV"]);
    const price = parsePriceCents(tag(block, ["PRICE_VAT", "PRICEVAT", "PRICE", "CENA"]));
    if (!sku || !title || price === null) continue;
    const stockRaw = tag(block, ["STOCK", "QTY", "QUANTITY", "SKLAD"]);
    const stock = stockRaw !== undefined ? parseInt(stockRaw, 10) : null;
    items.push({
      sku, title, price_cents: price,
      description: tag(block, ["DESCRIPTION", "POPIS"]) ?? null,
      brand: tag(block, ["MANUFACTURER", "BRAND", "VYROBCE"]) ?? null,
      image_url: tag(block, ["IMGURL", "IMAGE", "IMG", "OBRAZEK"]) ?? null,
      ean: tag(block, ["EAN"]) ?? null,
      stock_qty: Number.isFinite(stock) ? stock : null,
    });
  }
  return items;
}

/** CSV s hlavičkou: sku/code, title/name, price, volitelně description, brand, image, ean, stock. */
function parseCsvFeed(text: string): ImportFeedItem[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const header = lines[0].toLowerCase().split(sep).map((h) => h.trim().replace(/"/g, ""));
  const idx = (names: string[]) => header.findIndex((h) => names.includes(h));
  const skuI = idx(["sku", "code", "kod"]);
  const titleI = idx(["title", "name", "nazev"]);
  const priceI = idx(["price", "price_vat", "cena"]);
  if (skuI === -1 || titleI === -1 || priceI === -1) return [];
  const descI = idx(["description", "popis"]);
  const brandI = idx(["brand", "manufacturer", "vyrobce"]);
  const imgI = idx(["image", "imgurl", "obrazek"]);
  const eanI = idx(["ean"]);
  const stockI = idx(["stock", "qty", "sklad"]);

  const items: ImportFeedItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const price = parsePriceCents(cols[priceI]);
    if (!cols[skuI] || !cols[titleI] || price === null) continue;
    const stock = stockI !== -1 ? parseInt(cols[stockI], 10) : NaN;
    items.push({
      sku: cols[skuI], title: cols[titleI], price_cents: price,
      description: descI !== -1 ? cols[descI] || null : null,
      brand: brandI !== -1 ? cols[brandI] || null : null,
      image_url: imgI !== -1 ? cols[imgI] || null : null,
      ean: eanI !== -1 ? cols[eanI] || null : null,
      stock_qty: Number.isFinite(stock) ? stock : null,
    });
  }
  return items;
}

export function parseProductFeed(text: string): ImportFeedItem[] {
  const trimmed = text.trim();
  return trimmed.startsWith("<") ? parseXmlFeed(trimmed) : parseCsvFeed(trimmed);
}

function slugify(input: string): string {
  return input
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 80) || "produkt";
}

export async function getAutoImportConfig(tenantId: number): Promise<{ feed_url: string } | null> {
  await initAutoImportDb();
  return queryOne<{ feed_url: string }>(
    `SELECT feed_url FROM commerce_auto_import_config WHERE tenant_id = $1`, [tenantId]
  );
}

export async function saveAutoImportConfig(tenantId: number, feedUrl: string): Promise<void> {
  await initAutoImportDb();
  await query(
    `INSERT INTO commerce_auto_import_config (tenant_id, feed_url) VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO UPDATE SET feed_url = $2, updated_at = now()`,
    [tenantId, feedUrl]
  );
}

export async function listAutoImportRuns(tenantId: number, limit = 20): Promise<AutoImportRun[]> {
  await initAutoImportDb();
  return query<AutoImportRun>(
    `SELECT id, feed_url, status, items_in_feed, created, updated, skipped, error, created_at
     FROM commerce_auto_import_runs WHERE tenant_id = $1 ORDER BY id DESC LIMIT $2`,
    [tenantId, limit]
  );
}

async function logRun(tenantId: number, feedUrl: string, data: { status: string; items_in_feed?: number; created?: number; updated?: number; skipped?: number; error?: string | null }): Promise<void> {
  await query(
    `INSERT INTO commerce_auto_import_runs (tenant_id, feed_url, status, items_in_feed, created, updated, skipped, error)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [tenantId, feedUrl, data.status, data.items_in_feed ?? 0, data.created ?? 0, data.updated ?? 0, data.skipped ?? 0, data.error ?? null]
  );
}

export async function runAutoImport(
  tenantId: number,
  feedUrl: string,
  actorEmail: string | null
): Promise<{ ok: true; items_in_feed: number; created: number; updated: number; skipped: number } | { error: string }> {
  await initAutoImportDb();

  let text: string;
  try {
    const res = await fetch(feedUrl, { signal: AbortSignal.timeout(20000), headers: { Accept: "application/xml, text/xml, text/csv, text/plain" } });
    if (!res.ok) throw new Error(`Feed vrátil HTTP ${res.status}`);
    text = await res.text();
    if (text.length > 10_000_000) throw new Error("Feed je příliš velký (max 10 MB)");
  } catch (e) {
    const error = e instanceof Error ? e.message : "Stažení feedu selhalo";
    await logRun(tenantId, feedUrl, { status: "error", error });
    return { error };
  }

  const items = parseProductFeed(text);
  if (!items.length) {
    const error = "Ve feedu nebyly nalezeny žádné produkty (očekávám XML <SHOPITEM>/<item> nebo CSV sku,title,price)";
    await logRun(tenantId, feedUrl, { status: "error", error });
    return { error };
  }

  // Existující varianty podle SKU
  const variants = await query<{ id: number; sku: string; price_cents: number; stock_qty: number }>(
    `SELECT v.id, v.sku, v.price_cents, v.stock_qty FROM product_variants v
     JOIN products p ON p.id = v.product_id
     WHERE p.tenant_id = $1 AND v.sku IS NOT NULL AND v.sku <> ''`,
    [tenantId]
  );
  const bySku = new Map(variants.map((v) => [v.sku.toLowerCase(), v]));
  const slugs = new Set((await query<{ slug: string }>(
    `SELECT slug FROM products WHERE tenant_id = $1`, [tenantId]
  )).map((r) => r.slug));

  let created = 0, updated = 0, skipped = 0;
  const restockedIds: number[] = [];
  const cap = 500; // pojistka na jeden běh

  for (const item of items.slice(0, cap)) {
    const existing = bySku.get(item.sku.toLowerCase());
    if (existing) {
      const priceChanged = existing.price_cents !== item.price_cents;
      const stockChanged = item.stock_qty !== null && item.stock_qty !== undefined && existing.stock_qty !== item.stock_qty;
      if (!priceChanged && !stockChanged) { skipped++; continue; }
      await query(
        `UPDATE product_variants SET price_cents = $1, stock_qty = COALESCE($2, stock_qty), updated_at = now() WHERE id = $3`,
        [item.price_cents, item.stock_qty ?? null, existing.id]
      );
      if (stockChanged) {
        await query(
          `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, actor_email, note)
           VALUES ($1, $2, $3, $4, 'import', $5, 'Automatický import z feedu')`,
          [tenantId, existing.id, (item.stock_qty as number) - existing.stock_qty, item.stock_qty, actorEmail]
        );
        if ((item.stock_qty as number) > existing.stock_qty && (item.stock_qty as number) > 0) {
          restockedIds.push(existing.id);
        }
      }
      updated++;
      continue;
    }

    // Nový produkt (draft — obchodník ho zkontroluje a publikuje)
    let slug = slugify(item.title);
    if (slugs.has(slug)) slug = `${slug}-${item.sku.toLowerCase().replace(/[^a-z0-9]+/g, "")}`.slice(0, 90);
    if (slugs.has(slug)) { skipped++; continue; }
    slugs.add(slug);
    try {
      await createProduct(tenantId, {
        slug,
        title: item.title.slice(0, 200),
        description: item.description ?? null,
        brand: item.brand ?? null,
        status: "draft",
        variants: [{
          sku: item.sku, ean: item.ean ?? null, price_cents: item.price_cents,
          stock_qty: item.stock_qty ?? 0, is_default: true,
        }],
        images: item.image_url ? [{ url: item.image_url, alt: item.title }] : [],
      }, actorEmail ?? undefined);
      created++;
    } catch (e) {
      console.error("[auto-import] create failed:", e);
      skipped++;
    }
  }

  // Modul hlidaci-pes: naskladněné varianty → upozornit čekající zákazníky (mimo kritickou cestu)
  if (restockedIds.length) {
    import("./stock-watch")
      .then((m) => m.notifyStockWatchers(tenantId, restockedIds))
      .catch((e) => console.error("[stock-watch] notify failed:", e));
  }

  const result = { items_in_feed: items.length, created, updated, skipped };
  await logRun(tenantId, feedUrl, { status: "ok", ...result });
  return { ok: true, ...result };
}
