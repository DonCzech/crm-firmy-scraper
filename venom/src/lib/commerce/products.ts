import type { PoolClient } from "pg";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { initCommerceDb } from "./schema";
import { looksLikeHtml, sanitizeRichHtml } from "./html";
import type {
  Product,
  ProductDetail,
  ProductImage,
  ProductListRow,
  ProductStatus,
  ProductVariant,
} from "./types";

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface VariantInput {
  id?: number; // present = update, absent = insert
  sku?: string | null;
  ean?: string | null;
  title?: string | null;
  option_values?: Record<string, string>;
  price_cents: number;
  compare_at_price_cents?: number | null;
  cost_cents?: number | null;
  weight_grams?: number | null;
  stock_qty?: number;
  stock_policy?: "deny" | "continue";
  track_stock?: boolean;
  is_default?: boolean;
  position?: number;
}

export interface ImageInput {
  id?: number;
  url: string;
  alt?: string | null;
  variant_id?: number | null;
  position?: number;
}

export interface ProductInput {
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  brand?: string | null;
  status?: ProductStatus;
  tax_rate?: number | null;
  primary_category_id?: number | null;
  options?: Array<{ name: string; values: string[] }>;
  flags?: Record<string, unknown>;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  category_ids?: number[];
  variants?: VariantInput[];
  images?: ImageInput[];
}

export interface ListProductsParams {
  page?: number;
  perPage?: number;
  search?: string;
  /** Modul chytre-vyhledavani: synonymní výrazy k `search` (OR match). */
  searchAlternatives?: string[];
  status?: ProductStatus | "all";
  categoryId?: number;
  /** Zahrnout i produkty všech podkategorií (strom pod categoryId). */
  includeDescendants?: boolean;
  brand?: string;
  sort?: "updated" | "title" | "price";
}

// ── Unique brands (for mega menu) ────────────────────────────────────────────

export async function getUniqueBrands(tenantId: number): Promise<string[]> {
  await initCommerceDb();
  const rows = await query<{ brand: string }>(
    `SELECT DISTINCT brand FROM products WHERE tenant_id = $1 AND brand IS NOT NULL AND status = 'active' ORDER BY brand`,
    [tenantId]
  );
  return rows.map((r) => r.brand);
}

// ── List (admin grid + storefront) ────────────────────────────────────────────

export async function listProducts(
  tenantId: number,
  params: ListProductsParams = {}
): Promise<{ items: ProductListRow[]; total: number; page: number; perPage: number }> {
  await initCommerceDb();

  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 50));

  const where: string[] = ["p.tenant_id = $1"];
  const values: unknown[] = [tenantId];

  if (params.status && params.status !== "all") {
    values.push(params.status);
    where.push(`p.status = $${values.length}`);
  }
  if (params.search) {
    // Bez diakritiky (unaccent) + typo-tolerance (pg_trgm word_similarity)
    values.push(`%${params.search}%`);
    const i = values.length;
    values.push(params.search);
    const j = values.length;
    // Synonyma (modul chytre-vyhledavani) — pole LIKE patternů, prázdné = no-op
    values.push((params.searchAlternatives ?? []).map((t) => `%${t}%`));
    const k = values.length;
    where.push(
      `(unaccent(p.title) ILIKE unaccent($${i}) OR unaccent(p.slug) ILIKE unaccent($${i}) OR unaccent(COALESCE(p.brand,'')) ILIKE unaccent($${i})
        OR EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.sku ILIKE $${i})
        OR word_similarity(unaccent(lower($${j})), unaccent(lower(p.title))) > 0.45
        OR EXISTS (SELECT 1 FROM unnest($${k}::text[]) pat
                   WHERE unaccent(p.title) ILIKE unaccent(pat) OR unaccent(COALESCE(p.brand,'')) ILIKE unaccent(pat)))`
    );
  }
  if (params.categoryId) {
    values.push(params.categoryId);
    if (params.includeDescendants) {
      const subtree = `(WITH RECURSIVE sub AS (
          SELECT id FROM product_categories WHERE tenant_id = $1 AND id = $${values.length}
          UNION ALL
          SELECT c.id FROM product_categories c JOIN sub s ON c.parent_id = s.id WHERE c.tenant_id = $1
        ) SELECT id FROM sub)`;
      where.push(
        `(p.primary_category_id IN ${subtree}
          OR EXISTS (SELECT 1 FROM product_category_links l WHERE l.product_id = p.id AND l.category_id IN ${subtree}))`
      );
    } else {
      where.push(
        `(p.primary_category_id = $${values.length}
          OR EXISTS (SELECT 1 FROM product_category_links l WHERE l.product_id = p.id AND l.category_id = $${values.length}))`
      );
    }
  }
  if (params.brand) {
    values.push(params.brand);
    where.push(`p.brand = $${values.length}`);
  }

  const orderBy =
    params.sort === "title" ? "p.title ASC"
    : params.sort === "price" ? "price_min_cents ASC"
    : "p.updated_at DESC";

  const totalRow = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM products p WHERE ${where.join(" AND ")}`,
    values
  );
  const total = parseInt(totalRow[0]?.count ?? "0", 10);

  values.push(perPage, (page - 1) * perPage);
  const items = await query<ProductListRow>(
    `SELECT
       p.id, p.slug, p.title, p.subtitle, p.brand, p.status, p.primary_category_id, p.updated_at, p.flags::text, p.created_at,
       COALESCE(v.price_min, 0) AS price_min_cents,
       COALESCE(v.price_max, 0) AS price_max_cents,
       v.compare_at_max AS compare_at_max_cents,
       COALESCE(v.stock_total, 0) AS stock_total,
       COALESCE(v.variant_count, 0) AS variant_count,
       v.sku,
       img.url AS image_url
     FROM products p
     LEFT JOIN LATERAL (
       SELECT MIN(pv.price_cents) AS price_min, MAX(pv.price_cents) AS price_max,
              MAX(pv.compare_at_price_cents) AS compare_at_max,
              SUM(pv.stock_qty)::int AS stock_total, COUNT(*)::int AS variant_count,
              MIN(pv.sku) AS sku
       FROM product_variants pv WHERE pv.product_id = p.id
     ) v ON true
     LEFT JOIN LATERAL (
       SELECT pi.url FROM product_images pi
       WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1
     ) img ON true
     WHERE ${where.join(" AND ")}
     ORDER BY ${orderBy}
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return { items, total, page, perPage };
}

// ── Detail ────────────────────────────────────────────────────────────────────

async function attachDetail(product: Product): Promise<ProductDetail> {
  const [variants, images, links] = await Promise.all([
    query<ProductVariant>(
      "SELECT * FROM product_variants WHERE tenant_id = $1 AND product_id = $2 ORDER BY position, id",
      [product.tenant_id, product.id]
    ),
    query<ProductImage>(
      "SELECT * FROM product_images WHERE tenant_id = $1 AND product_id = $2 ORDER BY position, id",
      [product.tenant_id, product.id]
    ),
    query<{ category_id: number }>(
      "SELECT category_id FROM product_category_links WHERE tenant_id = $1 AND product_id = $2",
      [product.tenant_id, product.id]
    ),
  ]);
  return { ...product, variants, images, category_ids: links.map((l) => l.category_id) };
}

export async function getProduct(tenantId: number, productId: number): Promise<ProductDetail | null> {
  await initCommerceDb();
  const product = await queryOne<Product>(
    "SELECT * FROM products WHERE tenant_id = $1 AND id = $2",
    [tenantId, productId]
  );
  return product ? attachDetail(product) : null;
}

export async function getProductBySlug(tenantId: number, slug: string): Promise<ProductDetail | null> {
  await initCommerceDb();
  const product = await queryOne<Product>(
    "SELECT * FROM products WHERE tenant_id = $1 AND slug = $2",
    [tenantId, slug]
  );
  return product ? attachDetail(product) : null;
}

/** Storefront helper: resolve a slug that may have been renamed (301 target). */
export async function resolveProductSlugRedirect(tenantId: number, slug: string): Promise<string | null> {
  await initCommerceDb();
  const row = await queryOne<{ to_slug: string }>(
    "SELECT to_slug FROM commerce_slug_redirects WHERE tenant_id = $1 AND entity_type = 'product' AND from_slug = $2",
    [tenantId, slug]
  );
  return row?.to_slug ?? null;
}

// ── Create / update ───────────────────────────────────────────────────────────

async function upsertVariantsInTx(
  client: PoolClient,
  tenantId: number,
  productId: number,
  variants: VariantInput[],
  actorEmail?: string
): Promise<void> {
  const existing = await client.query(
    "SELECT id, stock_qty FROM product_variants WHERE tenant_id = $1 AND product_id = $2",
    [tenantId, productId]
  );
  const existingIds = new Set<number>(existing.rows.map((r) => r.id));
  const stockBefore = new Map<number, number>(existing.rows.map((r) => [r.id, r.stock_qty]));
  const keptIds = new Set<number>();

  // Delete dropped variants FIRST — jinak nová varianta se stejným SKU narazí
  // na unique index (tenant_id, sku) dřív, než se stará stihne smazat.
  const incomingIds = new Set(variants.map((v) => v.id).filter((id): id is number => !!id));
  const droppedIds = [...existingIds].filter((id) => !incomingIds.has(id));
  if (droppedIds.length) {
    await client.query(
      "DELETE FROM product_variants WHERE tenant_id = $1 AND product_id = $2 AND id = ANY($3::int[])",
      [tenantId, productId, droppedIds]
    );
    for (const id of droppedIds) existingIds.delete(id);
  }

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const values = [
      v.sku ?? null,
      v.ean ?? null,
      v.title ?? null,
      JSON.stringify(v.option_values ?? {}),
      v.price_cents,
      v.compare_at_price_cents ?? null,
      v.cost_cents ?? null,
      v.weight_grams ?? null,
      v.stock_qty ?? 0,
      v.stock_policy ?? "deny",
      v.track_stock ?? true,
      v.is_default ?? i === 0,
      v.position ?? i,
    ];

    if (v.id && existingIds.has(v.id)) {
      keptIds.add(v.id);
      await client.query(
        `UPDATE product_variants SET
           sku = $3, ean = $4, title = $5, option_values = $6, price_cents = $7,
           compare_at_price_cents = $8, cost_cents = $9, weight_grams = $10,
           stock_qty = $11, stock_policy = $12, track_stock = $13, is_default = $14,
           position = $15, updated_at = now()
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, v.id, ...values]
      );
      // Manual stock edit through product save → audit movement
      const before = stockBefore.get(v.id) ?? 0;
      const after = v.stock_qty ?? 0;
      if (before !== after) {
        await client.query(
          `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, actor_email)
           VALUES ($1, $2, $3, $4, 'manual', $5)`,
          [tenantId, v.id, after - before, after, actorEmail ?? null]
        );
      }
    } else {
      const inserted = await client.query(
        `INSERT INTO product_variants
           (tenant_id, product_id, sku, ean, title, option_values, price_cents,
            compare_at_price_cents, cost_cents, weight_grams, stock_qty, stock_policy,
            track_stock, is_default, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING id`,
        [tenantId, productId, ...values]
      );
      keptIds.add(inserted.rows[0].id);
      const qty = v.stock_qty ?? 0;
      if (qty !== 0) {
        await client.query(
          `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, actor_email)
           VALUES ($1, $2, $3, $4, 'manual', $5)`,
          [tenantId, inserted.rows[0].id, qty, qty, actorEmail ?? null]
        );
      }
    }
  }

}

async function replaceImagesInTx(
  client: PoolClient,
  tenantId: number,
  productId: number,
  images: ImageInput[]
): Promise<void> {
  await client.query(
    "DELETE FROM product_images WHERE tenant_id = $1 AND product_id = $2",
    [tenantId, productId]
  );
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    await client.query(
      `INSERT INTO product_images (tenant_id, product_id, variant_id, url, alt, position)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tenantId, productId, img.variant_id ?? null, img.url, img.alt ?? null, img.position ?? i]
    );
  }
}

async function replaceCategoryLinksInTx(
  client: PoolClient,
  tenantId: number,
  productId: number,
  categoryIds: number[]
): Promise<void> {
  await client.query(
    "DELETE FROM product_category_links WHERE tenant_id = $1 AND product_id = $2",
    [tenantId, productId]
  );
  for (const categoryId of categoryIds) {
    await client.query(
      `INSERT INTO product_category_links (tenant_id, product_id, category_id)
       SELECT $1, $2, c.id FROM product_categories c WHERE c.tenant_id = $1 AND c.id = $3
       ON CONFLICT (product_id, category_id) DO NOTHING`,
      [tenantId, productId, categoryId]
    );
  }
}

/** Popis z WYSIWYG projde whitelist sanitizací; prostý text se nechává beze změny. */
function cleanDescription(d: string | null | undefined): string | null | undefined {
  if (d == null) return d;
  return looksLikeHtml(d) ? sanitizeRichHtml(d) || null : d;
}

export async function createProduct(
  tenantId: number,
  input: ProductInput,
  actorEmail?: string
): Promise<ProductDetail> {
  await initCommerceDb();

  const productId = await withTransaction(async (client) => {
    const res = await client.query(
      `INSERT INTO products
         (tenant_id, slug, title, subtitle, description, brand, status, tax_rate,
          primary_category_id, options, flags, seo_title, seo_description, og_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [
        tenantId,
        input.slug,
        input.title,
        input.subtitle ?? null,
        cleanDescription(input.description) ?? null,
        input.brand ?? null,
        input.status ?? "draft",
        input.tax_rate ?? null,
        input.primary_category_id ?? null,
        JSON.stringify(input.options ?? []),
        JSON.stringify(input.flags ?? {}),
        input.seo_title ?? null,
        input.seo_description ?? null,
        input.og_image ?? null,
      ]
    );
    const id: number = res.rows[0].id;

    // Every product has at least one (default) variant.
    const variants = input.variants?.length
      ? input.variants
      : [{ price_cents: 0, is_default: true } satisfies VariantInput];
    await upsertVariantsInTx(client, tenantId, id, variants, actorEmail);

    if (input.images?.length) await replaceImagesInTx(client, tenantId, id, input.images);
    if (input.category_ids?.length) await replaceCategoryLinksInTx(client, tenantId, id, input.category_ids);

    return id;
  });

  await auditLog("commerce_product_created", {
    tenantId,
    actorEmail,
    targetType: "product",
    targetId: String(productId),
    extra: { slug: input.slug, title: input.title },
  });

  const detail = await getProduct(tenantId, productId);
  if (!detail) throw new Error("Product vanished after create");
  return detail;
}

export async function updateProduct(
  tenantId: number,
  productId: number,
  patch: Partial<ProductInput>,
  actorEmail?: string
): Promise<ProductDetail | null> {
  await initCommerceDb();

  const found = await withTransaction(async (client) => {
    const current = await client.query(
      "SELECT * FROM products WHERE tenant_id = $1 AND id = $2 FOR UPDATE",
      [tenantId, productId]
    );
    if (!current.rows.length) return false;
    const row = current.rows[0] as Product;

    if (patch.slug && patch.slug !== row.slug) {
      await client.query(
        `INSERT INTO commerce_slug_redirects (tenant_id, entity_type, from_slug, to_slug)
         VALUES ($1, 'product', $2, $3)
         ON CONFLICT (tenant_id, entity_type, from_slug) DO UPDATE SET to_slug = $3`,
        [tenantId, row.slug, patch.slug]
      );
    }

    const scalar: Array<[string, unknown]> = [];
    const scalarKeys = [
      "slug", "title", "subtitle", "description", "brand", "status", "tax_rate",
      "primary_category_id", "seo_title", "seo_description", "og_image",
    ] as const;
    for (const key of scalarKeys) {
      if (patch[key] !== undefined) {
        scalar.push([key, key === "description" ? cleanDescription(patch.description) ?? null : patch[key]]);
      }
    }
    if (patch.options !== undefined) scalar.push(["options", JSON.stringify(patch.options)]);
    if (patch.flags !== undefined) scalar.push(["flags", JSON.stringify(patch.flags)]);

    if (scalar.length) {
      const sets = scalar.map(([k], i) => `${k} = $${i + 3}`).join(", ");
      await client.query(
        `UPDATE products SET ${sets}, updated_at = now() WHERE tenant_id = $1 AND id = $2`,
        [tenantId, productId, ...scalar.map(([, v]) => v)]
      );
    } else {
      await client.query(
        "UPDATE products SET updated_at = now() WHERE tenant_id = $1 AND id = $2",
        [tenantId, productId]
      );
    }

    if (patch.variants !== undefined) {
      if (!patch.variants.length) throw new Error("Produkt musí mít alespoň jednu variantu");
      await upsertVariantsInTx(client, tenantId, productId, patch.variants, actorEmail);
    }
    if (patch.images !== undefined) await replaceImagesInTx(client, tenantId, productId, patch.images);
    if (patch.category_ids !== undefined) await replaceCategoryLinksInTx(client, tenantId, productId, patch.category_ids);

    return true;
  });

  if (!found) return null;

  await auditLog("commerce_product_updated", {
    tenantId,
    actorEmail,
    targetType: "product",
    targetId: String(productId),
    extra: { fields: Object.keys(patch) },
  });

  return getProduct(tenantId, productId);
}

/** Soft delete — archives the product (storefront hides it, orders keep history). */
export async function archiveProduct(tenantId: number, productId: number, actorEmail?: string): Promise<boolean> {
  await initCommerceDb();
  const rows = await query<{ id: number }>(
    `UPDATE products SET status = 'archived', updated_at = now()
     WHERE tenant_id = $1 AND id = $2 RETURNING id`,
    [tenantId, productId]
  );
  if (rows.length) {
    await auditLog("commerce_product_archived", {
      tenantId, actorEmail, targetType: "product", targetId: String(productId),
    });
  }
  return rows.length > 0;
}

// ── Stock ─────────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: number; slug: string; title: string; brand: string | null;
  price_cents: number; image_url: string | null;
}

export async function searchProducts(tenantId: number, q: string, limit = 8): Promise<SearchResult[]> {
  await initCommerceDb();
  return query<SearchResult>(
    `SELECT p.id, p.slug, p.title, p.brand,
            COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
            (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
     FROM products p
     WHERE p.tenant_id = $1 AND p.status = 'active'
       AND (unaccent(p.title) ILIKE unaccent($2) OR unaccent(COALESCE(p.brand,'')) ILIKE unaccent($2) OR unaccent(p.slug) ILIKE unaccent($2)
            OR EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.sku ILIKE $2)
            OR word_similarity(unaccent(lower($5)), unaccent(lower(p.title))) > 0.45)
     ORDER BY CASE WHEN unaccent(p.title) ILIKE unaccent($3) THEN 0 ELSE 1 END, p.title
     LIMIT $4`,
    [tenantId, `%${q}%`, `${q}%`, limit, q]
  );
}

/** Adjust stock with a row lock + audit movement. Returns new quantity or null. */
export async function adjustStock(
  tenantId: number,
  variantId: number,
  delta: number,
  reason: "manual" | "correction" | "import" | "return",
  actorEmail?: string,
  note?: string
): Promise<number | null> {
  await initCommerceDb();
  return withTransaction(async (client) => {
    const res = await client.query(
      `UPDATE product_variants SET stock_qty = stock_qty + $3, updated_at = now()
       WHERE tenant_id = $1 AND id = $2
       RETURNING stock_qty`,
      [tenantId, variantId, delta]
    );
    if (!res.rows.length) return null;
    const qtyAfter: number = res.rows[0].stock_qty;
    await client.query(
      `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, actor_email, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tenantId, variantId, delta, qtyAfter, reason, actorEmail ?? null, note ?? null]
    );
    return qtyAfter;
  }).then((qtyAfter) => {
    // Modul hlidaci-pes: naskladnění → upozornit čekající zákazníky (mimo kritickou cestu)
    if (qtyAfter != null && qtyAfter > 0 && delta > 0) {
      import("./stock-watch")
        .then((m) => m.notifyStockWatchers(tenantId, [variantId]))
        .catch((e) => console.error("[stock-watch] notify failed:", e));
    }
    return qtyAfter;
  });
}
