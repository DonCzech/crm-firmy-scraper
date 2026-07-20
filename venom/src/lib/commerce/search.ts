import { query } from "@/lib/db";
import { initCommerceDb } from "./schema";
import {
  DEFAULT_SEARCH_SETTINGS,
  expandQuerySynonyms,
  type SearchSettings,
} from "./search-settings";

/**
 * Webero Commerce — data pro našeptávač ve stylu Luigi's Box:
 * fráze + kategorie + značky + top produkt + produkty, plus „top" stav
 * (prázdný input) a log hledaných frází.
 *
 * Modul chytre-vyhledavani řídí chování přes SearchSettings (synonyma,
 * boosting, typo-tolerance, limity) — viz search-settings.ts.
 */

export interface SuggestProduct {
  id: number;
  slug: string;
  title: string;
  brand: string | null;
  price_cents: number;
  image_url: string | null;
  default_variant_id: number | null;
  variant_count: number;
}

export interface SuggestCategory {
  id: number;
  slug: string;
  name: string;
  parent_name: string | null;
}

export interface SearchSuggestions {
  phrases: string[];
  categories: SuggestCategory[];
  brands: string[];
  products: SuggestProduct[];
}

const PRODUCT_SELECT = `
  SELECT p.id, p.slug, p.title, p.brand,
         COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
         (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url,
         (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS default_variant_id,
         (SELECT COUNT(*)::int FROM product_variants pv WHERE pv.product_id = p.id) AS variant_count
  FROM products p`;

/** Fráze z logu doplní bigramy z názvů nalezených produktů. */
function derivePhrases(q: string, logged: string[], products: SuggestProduct[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const norm = q.toLowerCase();
  const push = (s: string) => {
    const key = s.toLowerCase();
    if (key === norm || seen.has(key)) return;
    seen.add(key);
    out.push(s);
  };
  for (const p of logged) push(p);
  for (const p of products) {
    const tokens = p.title.toLowerCase().replace(/[^\p{L}\p{N}+ ]/gu, " ").split(/\s+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      if (!tokens[i].startsWith(norm.split(/\s+/)[0])) continue;
      if (tokens[i + 1]) push(`${tokens[i]} ${tokens[i + 1]}`);
      else push(tokens[i]);
      if (out.length >= 6) return out.slice(0, 4);
    }
  }
  return out.slice(0, 4);
}

export async function getSearchSuggestions(
  tenantId: number,
  q: string,
  settings: SearchSettings = DEFAULT_SEARCH_SETTINGS
): Promise<SearchSuggestions> {
  await initCommerceDb();
  const prefix = `${q}%`;
  // Synonyma: dotaz + alternativní výrazy jako pole LIKE patternů
  const terms = [q, ...expandQuerySynonyms(q, settings.synonyms)];
  const patterns = terms.map((t) => `%${t}%`);
  // Vypnutá typo-tolerance → nedosažitelný práh (similarity je max 1)
  const simThreshold = settings.typo_tolerance ? 0.45 : 1.01;
  const boosted = settings.boosted_product_ids;

  const [products, categories, brands, loggedPhrases] = await Promise.all([
    // Diakritika (unaccent) + typo-tolerance (word_similarity) + synonyma + boosting
    query<SuggestProduct>(
      `${PRODUCT_SELECT}
       WHERE p.tenant_id = $1 AND p.status = 'active'
         AND (EXISTS (SELECT 1 FROM unnest($2::text[]) pat
                      WHERE unaccent(p.title) ILIKE unaccent(pat)
                         OR unaccent(COALESCE(p.brand,'')) ILIKE unaccent(pat)
                         OR unaccent(p.slug) ILIKE unaccent(pat))
              OR EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.sku ILIKE $5)
              OR word_similarity(unaccent(lower($4)), unaccent(lower(p.title))) > $6)
       ORDER BY CASE WHEN p.id = ANY($7::int[]) THEN 0 ELSE 1 END,
                CASE WHEN unaccent(p.title) ILIKE unaccent($3) THEN 0 ELSE 1 END,
                word_similarity(unaccent(lower($4)), unaccent(lower(p.title))) DESC, p.title
       LIMIT $8`,
      [tenantId, patterns, prefix, q, `%${q}%`, simThreshold, boosted, settings.max_products]
    ),
    settings.show_categories ? query<SuggestCategory>(
      `SELECT c.id, c.slug, c.name, pc.name AS parent_name
       FROM product_categories c
       LEFT JOIN product_categories pc ON pc.id = c.parent_id
       WHERE c.tenant_id = $1 AND c.is_visible
         AND (EXISTS (SELECT 1 FROM unnest($2::text[]) pat WHERE unaccent(c.name) ILIKE unaccent(pat))
           OR c.id IN (
           SELECT l.category_id FROM product_category_links l
           JOIN products p ON p.id = l.product_id
           WHERE p.tenant_id = $1 AND p.status = 'active'
             AND (EXISTS (SELECT 1 FROM unnest($2::text[]) pat
                          WHERE unaccent(p.title) ILIKE unaccent(pat)
                             OR unaccent(COALESCE(p.brand,'')) ILIKE unaccent(pat))
                  OR word_similarity(unaccent(lower($3)), unaccent(lower(p.title))) > $4)))
       ORDER BY CASE WHEN EXISTS (SELECT 1 FROM unnest($2::text[]) pat WHERE unaccent(c.name) ILIKE unaccent(pat)) THEN 0 ELSE 1 END,
                c.sort_order, c.name
       LIMIT 4`,
      [tenantId, patterns, q, simThreshold]
    ) : Promise.resolve([] as SuggestCategory[]),
    settings.show_brands ? query<{ brand: string }>(
      `SELECT p.brand FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active' AND p.brand IS NOT NULL
         AND (EXISTS (SELECT 1 FROM unnest($2::text[]) pat
                      WHERE unaccent(p.brand) ILIKE unaccent(pat) OR unaccent(p.title) ILIKE unaccent(pat))
              OR word_similarity(unaccent(lower($3)), unaccent(lower(p.brand))) > $4)
       GROUP BY p.brand ORDER BY COUNT(*) DESC, p.brand LIMIT 3`,
      [tenantId, patterns, q, simThreshold]
    ) : Promise.resolve([] as { brand: string }[]),
    settings.show_phrases ? query<{ query: string }>(
      `SELECT sq.query FROM shop_search_queries sq
       WHERE sq.tenant_id = $1 AND (unaccent(sq.query) ILIKE unaccent($2)
              OR word_similarity(unaccent(lower($3)), unaccent(lower(sq.query))) > 0.5)
         AND lower(sq.query) <> lower($3)
       ORDER BY sq.hits DESC, sq.last_searched_at DESC LIMIT 3`,
      [tenantId, prefix, q]
    ) : Promise.resolve([] as { query: string }[]),
  ]);

  return {
    phrases: settings.show_phrases ? derivePhrases(q, loggedPhrases.map((r) => r.query), products) : [],
    categories,
    brands: brands.map((r) => r.brand),
    products,
  };
}

/** Obsah panelu při prázdném inputu — nejhledanější fráze + top kategorie/značky/produkty. */
export async function getTopSearchData(tenantId: number): Promise<SearchSuggestions> {
  await initCommerceDb();

  const [products, categories, brands, loggedPhrases] = await Promise.all([
    // Top produkty = nejprodávanější (reálně objednané kusy), pak featured, pak nejnovější
    query<SuggestProduct>(
      `${PRODUCT_SELECT}
       WHERE p.tenant_id = $1 AND p.status = 'active'
       ORDER BY COALESCE((SELECT SUM(oi.qty) FROM order_items oi WHERE oi.product_id = p.id), 0) DESC,
                CASE WHEN p.flags->>'featured' = 'true' THEN 0 ELSE 1 END, p.id DESC
       LIMIT 7`,
      [tenantId]
    ),
    query<SuggestCategory>(
      `SELECT c.id, c.slug, c.name, NULL AS parent_name
       FROM product_categories c
       WHERE c.tenant_id = $1 AND c.is_visible
       ORDER BY (SELECT COUNT(*) FROM product_category_links l WHERE l.category_id = c.id) DESC, c.sort_order
       LIMIT 7`,
      [tenantId]
    ),
    query<{ brand: string }>(
      `SELECT p.brand FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active' AND p.brand IS NOT NULL
       GROUP BY p.brand ORDER BY COUNT(*) DESC, p.brand LIMIT 3`,
      [tenantId]
    ),
    query<{ query: string }>(
      `SELECT sq.query FROM shop_search_queries sq
       WHERE sq.tenant_id = $1
       ORDER BY sq.hits DESC, sq.last_searched_at DESC LIMIT 4`,
      [tenantId]
    ),
  ]);

  const phrases = loggedPhrases.map((r) => r.query);
  // Fallback dokud log nemá data: značky jako výchozí fráze
  if (phrases.length === 0) phrases.push(...brands.map((b) => b.brand.toLowerCase()).slice(0, 3));

  return { phrases: phrases.slice(0, 4), categories, brands: brands.map((r) => r.brand), products };
}

/** Zaloguje „potvrzené" hledání (klik na výsledek / Enter) pro nejhledanější fráze. */
export async function logSearchQuery(tenantId: number, q: string): Promise<void> {
  const norm = q.trim().toLowerCase().slice(0, 60);
  if (norm.length < 2) return;
  await initCommerceDb();
  await query(
    `INSERT INTO shop_search_queries (tenant_id, query)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id, query) DO UPDATE SET hits = shop_search_queries.hits + 1, last_searched_at = now()`,
    [tenantId, norm]
  );
}

/** Zaloguje dotaz našeptávače + počet výsledků (0 = hledání bez výsledků → statistiky). */
export async function logSuggestQuery(tenantId: number, q: string, resultsCount: number): Promise<void> {
  const norm = q.trim().toLowerCase().slice(0, 60);
  if (norm.length < 2) return;
  await initCommerceDb();
  await query(
    `INSERT INTO shop_search_queries (tenant_id, query, hits, suggest_count, results_count)
     VALUES ($1, $2, 0, 1, $3)
     ON CONFLICT (tenant_id, query) DO UPDATE
       SET suggest_count = shop_search_queries.suggest_count + 1,
           results_count = $3,
           last_searched_at = now()`,
    [tenantId, norm, resultsCount]
  );
}

// ── Statistiky hledání (admin modul chytre-vyhledavani) ───────────────────────

export interface SearchQueryStat {
  query: string;
  hits: number;
  suggest_count: number;
  results_count: number | null;
  last_searched_at: string;
}

export interface SearchStats {
  total_confirmed: number;
  total_suggested: number;
  unique_queries: number;
  zero_result_count: number;
  top: SearchQueryStat[];
  zero_results: SearchQueryStat[];
}

export async function getSearchStats(tenantId: number): Promise<SearchStats> {
  await initCommerceDb();
  const [totals, top, zero] = await Promise.all([
    query<{ total_confirmed: string; total_suggested: string; unique_queries: string; zero_result_count: string }>(
      `SELECT COALESCE(SUM(hits),0)::text AS total_confirmed,
              COALESCE(SUM(suggest_count),0)::text AS total_suggested,
              COUNT(*)::text AS unique_queries,
              COUNT(*) FILTER (WHERE results_count = 0)::text AS zero_result_count
       FROM shop_search_queries WHERE tenant_id = $1`,
      [tenantId]
    ),
    query<SearchQueryStat>(
      `SELECT query, hits, suggest_count, results_count, last_searched_at
       FROM shop_search_queries WHERE tenant_id = $1
       ORDER BY (hits * 3 + suggest_count) DESC, last_searched_at DESC LIMIT 20`,
      [tenantId]
    ),
    query<SearchQueryStat>(
      `SELECT query, hits, suggest_count, results_count, last_searched_at
       FROM shop_search_queries WHERE tenant_id = $1 AND results_count = 0
       ORDER BY suggest_count DESC, last_searched_at DESC LIMIT 20`,
      [tenantId]
    ),
  ]);
  const t = totals[0];
  return {
    total_confirmed: parseInt(t?.total_confirmed ?? "0", 10),
    total_suggested: parseInt(t?.total_suggested ?? "0", 10),
    unique_queries: parseInt(t?.unique_queries ?? "0", 10),
    zero_result_count: parseInt(t?.zero_result_count ?? "0", 10),
    top,
    zero_results: zero,
  };
}

/** Smaže statistiky hledání (admin akce). */
export async function clearSearchStats(tenantId: number): Promise<void> {
  await initCommerceDb();
  await query(`DELETE FROM shop_search_queries WHERE tenant_id = $1`, [tenantId]);
}
