import type { Shop } from "./types";

/**
 * Modul chytre-vyhledavani — nastavení ve stylu Luigi's Box.
 * Ukládá se do shops.settings.search (merge přes updateShop).
 */

export interface SearchSettings {
  /** Minimální délka dotazu pro našeptávač (1–4). */
  min_chars: number;
  /** Typo-tolerance (pg_trgm word_similarity) — „samsnug" najde Samsung. */
  typo_tolerance: boolean;
  /** Max. produktů v našeptávači (3–12). */
  max_products: number;
  /** Sekce našeptávače. */
  show_phrases: boolean;
  show_categories: boolean;
  show_brands: boolean;
  /** Skupiny synonym — dotaz na kterýkoli výraz skupiny najde i ostatní. */
  synonyms: string[][];
  /** Boostované produkty — ve výsledcích vždy nahoře. */
  boosted_product_ids: number[];
}

export const DEFAULT_SEARCH_SETTINGS: SearchSettings = {
  min_chars: 2,
  typo_tolerance: true,
  max_products: 7,
  show_phrases: true,
  show_categories: true,
  show_brands: true,
  synonyms: [],
  boosted_product_ids: [],
};

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function normalizeSearchSettings(raw: unknown): SearchSettings {
  const s = (raw ?? {}) as Record<string, unknown>;
  const synonyms = Array.isArray(s.synonyms)
    ? s.synonyms
        .map((g) => (Array.isArray(g) ? g.map((t) => String(t).trim().toLowerCase().slice(0, 40)).filter(Boolean) : []))
        .filter((g) => g.length >= 2)
        .slice(0, 100)
    : DEFAULT_SEARCH_SETTINGS.synonyms;
  const boosted = Array.isArray(s.boosted_product_ids)
    ? s.boosted_product_ids.map((x) => Number(x)).filter((x) => Number.isInteger(x) && x > 0).slice(0, 50)
    : DEFAULT_SEARCH_SETTINGS.boosted_product_ids;
  return {
    min_chars: clampInt(s.min_chars, 1, 4, DEFAULT_SEARCH_SETTINGS.min_chars),
    typo_tolerance: s.typo_tolerance !== false,
    max_products: clampInt(s.max_products, 3, 12, DEFAULT_SEARCH_SETTINGS.max_products),
    show_phrases: s.show_phrases !== false,
    show_categories: s.show_categories !== false,
    show_brands: s.show_brands !== false,
    synonyms,
    boosted_product_ids: boosted,
  };
}

export function readSearchSettings(shop: Shop): SearchSettings {
  return normalizeSearchSettings((shop.settings as { search?: unknown })?.search);
}

/**
 * Rozšíří dotaz o synonyma: vrátí seznam alternativních výrazů (bez dotazu
 * samotného). Dotaz matchuje skupinu, pokud obsahuje některý její výraz.
 */
export function expandQuerySynonyms(q: string, synonyms: string[][]): string[] {
  const norm = q.trim().toLowerCase();
  if (!norm) return [];
  const out = new Set<string>();
  for (const group of synonyms) {
    const hit = group.some((term) => norm === term || norm.includes(term));
    if (!hit) continue;
    for (const term of group) {
      if (term !== norm && !norm.includes(term)) out.add(term);
    }
  }
  return [...out].slice(0, 8);
}
