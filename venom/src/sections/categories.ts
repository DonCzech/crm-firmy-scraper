/**
 * Wix-style category taxonomy for the section library.
 *
 * Problem we're solving: we have ~785 variants across ~20 section types and
 * 90+ templates. A user opening "+ Add" should see a clean, Wix-shaped
 * left sidebar of intents (Vítejte / O nás / Služby / …), not a flat list
 * of 90 hero variants. This module is the single source of truth for that
 * mapping. The thumbnail generator (next session) also reads it.
 *
 * Two layers:
 *  - LIBRARY_CATEGORIES: top-level intent buckets (~14 like Wix).
 *  - STYLE_TAGS: per-variant visual tags inferred from the key/label
 *    (Light/Dark/Slider/Split/Video/Fullbleed/Cream/Centered). Used for
 *    secondary filter chips inside a category.
 */

import { SECTION_VARIANTS, type VariantMeta } from "./variants";

export type CategoryId =
  | "welcome" | "about" | "services" | "pricing" | "gallery"
  | "testimonials" | "team" | "stats" | "cta" | "promo"
  | "faq" | "blog" | "contact" | "products" | "advanced"
  | "header" | "footer";

export interface LibraryCategory {
  id: CategoryId;
  label: string;            // Czech, user-facing
  description: string;      // short hover/help text
  sectionTypes: string[];   // types from SECTION_VARIANTS this category covers
}

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  { id: "welcome",      label: "Úvod",         description: "Hero a uvítací sekce", sectionTypes: ["hero"] },
  { id: "about",        label: "O nás",        description: "Příběh, hodnoty, tým", sectionTypes: ["about"] },
  { id: "services",     label: "Služby",       description: "Co nabízíte",          sectionTypes: ["services"] },
  { id: "pricing",      label: "Ceník",        description: "Ceny a tarify",        sectionTypes: ["pricing"] },
  { id: "gallery",      label: "Portfolio",    description: "Galerie a reference",  sectionTypes: ["gallery"] },
  { id: "testimonials", label: "Recenze",      description: "Hodnocení zákazníků",  sectionTypes: ["testimonials"] },
  { id: "team",         label: "Tým",          description: "Lidé v týmu",          sectionTypes: ["team"] },
  { id: "stats",        label: "Statistiky",   description: "Čísla a fakta",        sectionTypes: ["stats"] },
  { id: "cta",          label: "Výzva k akci", description: "CTA bannery",          sectionTypes: ["cta", "rezora-cta"] },
  { id: "promo",        label: "Propagace",    description: "Promo a benefity",     sectionTypes: ["promo"] },
  { id: "faq",          label: "FAQ",          description: "Časté dotazy",         sectionTypes: ["faq"] },
  { id: "blog",         label: "Blog",         description: "Novinky a články",     sectionTypes: ["blog-preview"] },
  { id: "contact",      label: "Kontakt",      description: "Formulář, mapa, info", sectionTypes: ["contact", "opening-hours", "map"] },
  { id: "products",     label: "Produkty",     description: "E-shop a katalog",     sectionTypes: ["products"] },
  { id: "header",       label: "Hlavička",     description: "Navigace webu",        sectionTypes: ["navbar"] },
  { id: "footer",       label: "Patička",      description: "Spodní část webu",     sectionTypes: ["footer"] },
  { id: "advanced",     label: "Pokročilé",    description: "Embed a volné plátno", sectionTypes: ["embed", "freeform", "rezora-widget"] },
];

/* ── Visual style tags (secondary filter chips inside a category) ─────── */

export type StyleTag =
  | "light" | "dark" | "cream"
  | "split" | "centered" | "fullbleed"
  | "slider" | "video" | "image"
  | "minimal" | "luxury";

const TAG_RULES: Array<{ tag: StyleTag; test: RegExp }> = [
  { tag: "dark",      test: /dark|tmav|navy|black|cern/i },
  { tag: "cream",     test: /cream|kr[ée]m/i },
  { tag: "light",     test: /light|svetl|b[ií]l/i },
  { tag: "slider",    test: /slider|carousel/i },
  { tag: "video",     test: /video/i },
  { tag: "split",     test: /split|2-col|two-col|2col/i },
  { tag: "centered",  test: /center|centr/i },
  { tag: "fullbleed", test: /fullbleed|full-bleed|full bleed|fullscreen/i },
  { tag: "luxury",    test: /luxury|luxus|gold|zlat/i },
  { tag: "minimal",   test: /minimal|titleonly|title-only|clean/i },
  { tag: "image",     test: /image|fotk|foto/i },
];

export function tagsForVariant(v: VariantMeta): StyleTag[] {
  const hay = `${v.key} ${v.label} ${v.description}`;
  const tags = new Set<StyleTag>();
  for (const { tag, test } of TAG_RULES) if (test.test(hay)) tags.add(tag);
  return [...tags];
}

/* ── Enriched library entry consumed by the panel ─────────────────────── */

export interface SectionLibraryEntryRich {
  type: string;
  variant: string;
  label: string;
  description: string;
  industries: string[];
  tags: StyleTag[];
  /** Display name with the template family extracted (e.g. "Barber 04 – tmavý fade"). */
  displayName: string;
  /** Family slug e.g. "barber-04", "hair-01", or "generic" for universal. */
  family: string;
}

const FAMILY_RE = /\b([a-z]+-\d{2,})\b/;

function extractFamily(v: VariantMeta): string {
  const m = FAMILY_RE.exec(v.key) || FAMILY_RE.exec(v.description);
  return m ? m[1] : "generic";
}

function deriveDisplayName(v: VariantMeta): string {
  // Strip leading "Hero – " etc. and any "(family)" trail
  return v.label.replace(/\s*\(([a-z]+-\d{2,})\)\s*$/i, "").trim();
}

export function buildRichLibrary(): SectionLibraryEntryRich[] {
  const out: SectionLibraryEntryRich[] = [];
  for (const [type, variants] of Object.entries(SECTION_VARIANTS)) {
    for (const v of variants) {
      out.push({
        type, variant: v.key, label: v.label, description: v.description,
        industries: v.industries, tags: tagsForVariant(v),
        displayName: deriveDisplayName(v), family: extractFamily(v),
      });
    }
  }
  return out;
}

/** Group a flat library by CategoryId following LIBRARY_CATEGORIES order. */
export function groupByCategory(lib: SectionLibraryEntryRich[]):
  Record<CategoryId, SectionLibraryEntryRich[]>
{
  const out = {} as Record<CategoryId, SectionLibraryEntryRich[]>;
  for (const cat of LIBRARY_CATEGORIES) {
    out[cat.id] = lib.filter(e => cat.sectionTypes.includes(e.type));
  }
  return out;
}

/* ── Pages catalog (loaded from src/sections/built-in-pages.json) ─────── */

import builtInPagesJson from "./built-in-pages.json";

export interface BuiltInPage {
  id: string;             // "{family}__{slug}"
  family: string;         // "barber-01"
  familyLabel: string;    // "Barber — Dark Luxury"
  industry: string | null;
  slug: string;           // "home"
  label: string;          // "Úvod"
  category: string;       // "home" | "about" | …
  isHomepage: boolean;
  sections: Array<{ type: string; variant: string }>;
  thumbHint: { type: string; variant: string };
}

export const BUILT_IN_PAGES: BuiltInPage[] = builtInPagesJson as BuiltInPage[];

export interface PageCategory {
  id: string;
  label: string;
  description: string;
}

export const PAGE_CATEGORIES: PageCategory[] = [
  { id: "home",      label: "Úvodní",   description: "Celá hotová homepage šablona" },
  { id: "about",     label: "O nás",    description: "Příběh, hodnoty, tým" },
  { id: "services",  label: "Služby",   description: "Co nabízíte" },
  { id: "pricing",   label: "Ceník",    description: "Ceny a tarify" },
  { id: "portfolio", label: "Portfolio",description: "Reference a galerie" },
  { id: "menu",      label: "Menu",     description: "Jídelní lístek / nabídka" },
  { id: "rooms",     label: "Pokoje",   description: "Ubytování a apartmány" },
  { id: "products",  label: "Produkty", description: "Katalog / e-shop" },
  { id: "team",      label: "Tým",      description: "Lidé" },
  { id: "blog",      label: "Blog",     description: "Novinky a články" },
  { id: "faq",       label: "FAQ",      description: "Časté dotazy" },
  { id: "contact",   label: "Kontakt",  description: "Mapa, formulář, info" },
  { id: "legal",     label: "Právní",   description: "GDPR, podmínky" },
  { id: "404",       label: "404",      description: "Chybová stránka" },
  { id: "other",     label: "Ostatní",  description: "Vlastní stránky šablon" },
];

export function pagesByCategory(catId: string): BuiltInPage[] {
  return BUILT_IN_PAGES.filter(p => p.category === catId);
}
