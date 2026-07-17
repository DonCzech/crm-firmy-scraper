import { query } from "@/lib/db";
import type { Section } from "@/lib/db";
import { initCommerceDb } from "./schema";
import { getShopByTenantId } from "./shop";

/**
 * Server-side hydratace commerce sekcí (Fáze 2).
 *
 * Sekce zůstávají prezentační (registry pattern) — produktová data z commerce
 * tabulek se před renderem vstříknou do `settings.content.__commerce`.
 * Editovatelné texty (nadpisy, CTA) zůstávají normální content; `__commerce`
 * je read-only datový payload řízený DB, ne editorem.
 *
 * Pro website tenanty bez commerce sekcí je to no-op (nulová cena).
 */

export const COMMERCE_SECTION_TYPES = new Set([
  "product-grid",
  "featured-products",
  "category-grid",
]);

export interface CommerceProductCard {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  brand: string | null;
  price_min_cents: number;
  price_max_cents: number;
  compare_at_price_cents: number | null;
  stock_total: number;
  image_url: string | null;
  image_alt: string | null;
  flags: Record<string, unknown>;
  default_variant_id: number | null;
}

export interface CommerceCategoryCard {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
  product_count: number;
}

export interface CommerceSectionData {
  currency: string;
  storeBase: string; // "/demo/{slug}/obchod" — proxy stripne /demo/{slug} na custom doméně
  products?: CommerceProductCard[];
  categories?: CommerceCategoryCard[];
}

async function fetchProductCards(
  tenantId: number,
  opts: {
    limit: number;
    featuredOnly?: boolean;
    categorySlug?: string;
    /** Kategorie včetně celého podstromu (rodič zahrne produkty potomků). */
    includeDescendants?: boolean;
    /** Ruční výběr — vrátí přesně tyto produkty v zadaném pořadí. */
    ids?: number[];
    excludeIds?: number[];
    sort?: "newest" | "price-asc" | "price-desc" | "title";
  }
): Promise<CommerceProductCard[]> {
  const values: unknown[] = [tenantId];
  const where: string[] = ["p.tenant_id = $1", "p.status = 'active'"];

  let idsIdx = 0;
  if (opts.ids?.length) {
    values.push(opts.ids);
    idsIdx = values.length;
    where.push(`p.id = ANY($${idsIdx}::int[])`);
  }
  if (opts.excludeIds?.length) {
    values.push(opts.excludeIds);
    where.push(`p.id <> ALL($${values.length}::int[])`);
  }
  if (opts.featuredOnly) {
    where.push(`(p.flags->>'featured')::boolean IS TRUE`);
  }
  if (opts.categorySlug) {
    values.push(opts.categorySlug);
    const catCond = opts.includeDescendants
      ? `l.category_id IN (WITH RECURSIVE sub AS (
           SELECT id FROM product_categories WHERE tenant_id = $1 AND slug = $${values.length}
           UNION ALL
           SELECT c2.id FROM product_categories c2 JOIN sub s ON c2.parent_id = s.id WHERE c2.tenant_id = $1
         ) SELECT id FROM sub)`
      : `EXISTS (SELECT 1 FROM product_categories c
           WHERE c.id = l.category_id AND c.tenant_id = $1 AND c.slug = $${values.length})`;
    where.push(`EXISTS (
      SELECT 1 FROM product_category_links l
      WHERE l.product_id = p.id AND ${catCond}
    )`);
  }

  const orderBy =
    idsIdx ? `array_position($${idsIdx}::int[], p.id)`
    : opts.sort === "price-asc" ? "price_min_cents ASC NULLS LAST"
    : opts.sort === "price-desc" ? "price_min_cents DESC NULLS LAST"
    : opts.sort === "title" ? "p.title ASC"
    : "p.updated_at DESC";

  values.push(opts.limit);
  return query<CommerceProductCard>(
    `SELECT
       p.id, p.slug, p.title, p.subtitle, p.brand, p.flags,
       COALESCE(v.price_min, 0) AS price_min_cents,
       COALESCE(v.price_max, 0) AS price_max_cents,
       v.compare_at AS compare_at_price_cents,
       COALESCE(v.stock_total, 0) AS stock_total,
       img.url AS image_url,
       img.alt AS image_alt,
       (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id
        ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS default_variant_id
     FROM products p
     LEFT JOIN LATERAL (
       SELECT MIN(pv.price_cents) AS price_min, MAX(pv.price_cents) AS price_max,
              MAX(pv.compare_at_price_cents) AS compare_at,
              SUM(pv.stock_qty)::int AS stock_total
       FROM product_variants pv WHERE pv.product_id = p.id
     ) v ON true
     LEFT JOIN LATERAL (
       SELECT pi.url, pi.alt FROM product_images pi
       WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1
     ) img ON true
     WHERE ${where.join(" AND ")}
     ORDER BY ${orderBy}
     LIMIT $${values.length}`,
    values
  );
}

async function fetchCategoryCards(
  tenantId: number,
  limit: number,
  opts: { topLevelOnly?: boolean; excludeSlugs?: string[] } = {}
): Promise<CommerceCategoryCard[]> {
  const values: unknown[] = [tenantId];
  const where = ["c.tenant_id = $1", "c.is_visible = true"];
  if (opts.topLevelOnly) where.push("c.parent_id IS NULL");
  if (opts.excludeSlugs?.length) {
    values.push(opts.excludeSlugs);
    where.push(`c.slug <> ALL($${values.length}::text[])`);
  }
  values.push(limit);
  return query<CommerceCategoryCard>(
    `SELECT c.id, c.slug, c.name, c.image_url,
            (SELECT COUNT(*)::int FROM product_category_links l
              JOIN products p ON p.id = l.product_id AND p.status = 'active'
             WHERE l.category_id = c.id) AS product_count
     FROM product_categories c
     WHERE ${where.join(" AND ")}
     ORDER BY c.sort_order, c.name
     LIMIT $${values.length}`,
    values
  );
}

/**
 * Injects `__commerce` into content of commerce sections. Returns the same
 * array reference when no commerce section is present.
 */
export async function hydrateCommerceSections<T extends Section>(
  tenantId: number,
  tenantSlug: string,
  sections: T[]
): Promise<T[]> {
  const commerceSections = sections.filter((s) => COMMERCE_SECTION_TYPES.has(s.section_type));
  if (!commerceSections.length) return sections;

  await initCommerceDb();
  const shop = await getShopByTenantId(tenantId);
  if (!shop) return sections; // commerce sekce bez shopu → komponenty vyrenderují empty state

  const storeBase = `/demo/${tenantSlug}/obchod`;

  const hydrated = new Map<number, CommerceSectionData>();
  await Promise.all(
    commerceSections.map(async (s) => {
      const content = ((s.settings as Record<string, unknown>)?.content ?? {}) as Record<string, unknown>;
      const limit = Math.min(24, Math.max(1, Number(content.limit) || 8));
      const data: CommerceSectionData = { currency: shop.currency, storeBase };

      if (s.section_type === "category-grid") {
        data.categories = await fetchCategoryCards(tenantId, limit, {
          topLevelOnly: content.topLevel === true,
          excludeSlugs: Array.isArray(content.excludeSlugs)
            ? content.excludeSlugs.filter((x): x is string => typeof x === "string")
            : undefined,
        });
      } else {
        // Režimy railu: manual (přesný ruční výběr), hybrid (připnuté + smart
        // doplnění), smart (default — pravidla source/categorySlug/sort).
        const mode = content.mode === "manual" || content.mode === "hybrid" ? content.mode : "smart";
        const toIds = (v: unknown): number[] =>
          Array.isArray(v) ? v.filter((x): x is number => Number.isInteger(x) && (x as number) > 0) : [];
        const manualIds = toIds(content.productIds);
        const pinnedIds = toIds(content.pinnedIds);
        const excludeIds = toIds(content.excludeIds);
        const sort = ["newest", "price-asc", "price-desc", "title"].includes(String(content.sort))
          ? (content.sort as "newest" | "price-asc" | "price-desc" | "title")
          : undefined;
        const featuredOnly = s.section_type === "featured-products" && content.source !== "newest";
        const smartOpts = {
          featuredOnly,
          categorySlug: typeof content.categorySlug === "string" ? content.categorySlug : undefined,
          includeDescendants: content.includeDescendants === true,
          sort,
          excludeIds,
        };

        let products: CommerceProductCard[];
        if (mode === "manual" && manualIds.length) {
          products = await fetchProductCards(tenantId, { limit, ids: manualIds });
        } else {
          const pinned = pinnedIds.length
            ? await fetchProductCards(tenantId, { limit, ids: pinnedIds })
            : [];
          products = pinned;
          if (products.length < limit) {
            const smart = await fetchProductCards(tenantId, {
              limit,
              ...smartOpts,
              excludeIds: [...excludeIds, ...pinnedIds],
            });
            products = [...pinned, ...smart].slice(0, limit);
          }
          // Featured top-up: málo oflagovaných produktů → doplň nejnovějšími
          // (homepage mřížka nesmí zůstat poloprázdná).
          if (featuredOnly && products.length < limit) {
            const fill = await fetchProductCards(tenantId, { limit, excludeIds });
            const seen = new Set(products.map((x) => x.id));
            for (const item of fill) {
              if (products.length >= limit) break;
              if (!seen.has(item.id)) products.push(item);
            }
          }
        }
        data.products = products;
      }
      hydrated.set(s.id, data);
    })
  );

  return sections.map((s) => {
    const data = hydrated.get(s.id);
    if (!data) return s;
    const settings = (s.settings ?? {}) as Record<string, unknown>;
    const content = (settings.content ?? {}) as Record<string, unknown>;
    return {
      ...s,
      settings: { ...settings, content: { ...content, __commerce: data } },
    };
  });
}
