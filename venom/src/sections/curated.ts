/**
 * Kurátorovaná knihovna sekcí — „Doporučené".
 *
 * Problém: knihovna má ~800 variant a kategorie typu „Úvod" sype uživateli
 * 90+ hero variant z konkrétních šablon (s napevno zadrátovanými barvami
 * a fonty konkrétního dema) do jednoho gridu. To je guláš.
 *
 * Řešení: dvouvrstvá knihovna.
 *  1. DOPORUČENÉ (tento soubor) — ručně vybraná, layout-first sada bloků
 *     pro každou kategorii. Jména popisují ROZLOŽENÍ („Split — text +
 *     obrázek"), ne zdrojovou šablonu. Univerzální (theme-aware) varianty
 *     jdou první, pak nejlepší kousky ze šablon pokrývající různé styly.
 *  2. ZE ŠABLON — kompletní katalog všech variant, seskupený podle rodiny
 *     šablon (barber-04, fyzio-02, …), pro uživatele, kteří chtějí přesně
 *     ten kousek, který viděli v hotovém konceptu.
 *
 * Panel: src/components/studio/panels/WixAddOverlay.tsx (SectionsPanel).
 */

import type { StyleTag } from "./categories";

export interface CuratedEntry {
  type: string;
  variant: string;
  /** Layout-first český název — říká, JAK sekce vypadá, ne odkud je. */
  name: string;
  /** Krátký popis pro tooltip / druhý řádek karty. */
  desc: string;
  tags: StyleTag[];
  /** Univerzální varianta — plně přebírá barvy/fonty z panelu Design. */
  themeAware?: boolean;
}

export const CURATED_LIBRARY: CuratedEntry[] = [
  /* ── Úvod (hero) ────────────────────────────────────────────────────── */
  { type: "hero", variant: "default",           name: "Banner s textem a tlačítkem", desc: "Klasický úvodní banner — nadpis, podtitulek, CTA. Přebírá barvy webu.", tags: ["centered"], themeAware: true },
  { type: "hero", variant: "hero-centered",     name: "Centrovaný hero",             desc: "Centrovaný nadpis s volitelnou fotkou na pozadí. Přebírá barvy webu.", tags: ["centered"], themeAware: true },
  { type: "hero", variant: "hero-split-image",  name: "Split — text + obrázek",      desc: "Text vlevo, velký obrázek vpravo. Přebírá barvy webu.", tags: ["split", "image"], themeAware: true },
  { type: "hero", variant: "restaurant-01-hero", name: "Fullscreen slider (Ken Burns)", desc: "Celoobrazovkový crossfade slider s jemným zoomem a CTA.", tags: ["fullbleed", "slider", "dark"] },
  { type: "hero", variant: "arch-01-hero",      name: "Fullscreen slider — monochrom", desc: "Minimalistický černobílý celoobrazovkový slider s tečkovou navigací.", tags: ["fullbleed", "slider", "dark", "minimal"] },
  { type: "hero", variant: "events-01-hero",    name: "Fullscreen foto — elegantní",  desc: "Celoobrazovkové foto, serif typografie a zlatavý akcent.", tags: ["fullbleed", "dark", "luxury"] },
  { type: "hero", variant: "tawan-01-hero-slider", name: "Fullscreen video",          desc: "Video na pozadí přes celou obrazovku, centrovaný text a CTA.", tags: ["fullbleed", "video", "dark"] },
  { type: "hero", variant: "hero-fyzio-02-split", name: "Split světlý s fotkou",      desc: "Světlé pozadí, serif nadpis vlevo, velké foto vpravo, avatary a statistiky.", tags: ["split", "light"] },
  { type: "hero", variant: "hero-fitness-01-split", name: "Split krémový s hodnocením", desc: "Krémové pozadí, citát, CTA a hvězdičkové hodnocení.", tags: ["split", "cream"] },
  { type: "hero", variant: "solar-01-hero",     name: "Tmavý gradient — 2 sloupce",   desc: "Tmavě modrý gradient, text vlevo, foto s rámečkem vpravo.", tags: ["split", "dark"] },
  { type: "hero", variant: "lang-01-hero",      name: "Světlý gradient s kartou",     desc: "Jemný gradient, velký nadpis a bílá karta s obsahem vpravo.", tags: ["split", "light"] },
  { type: "hero", variant: "autoservis-03-hero", name: "Tmavý — outline typografie",  desc: "Velkoformátový outline nadpis, gradient a výrazné CTA.", tags: ["fullbleed", "dark"] },

  /* ── O nás ──────────────────────────────────────────────────────────── */
  { type: "about", variant: "two-col",                 name: "Text + obrázek (2 sloupce)", desc: "Klasické představení — text vlevo, foto vpravo. Přebírá barvy webu.", tags: ["split"], themeAware: true },
  { type: "about", variant: "about-fyzio-01-2col",     name: "2 sloupce s CTA",            desc: "Text s kickerem a tlačítkem, foto s barevným rámečkem.", tags: ["split", "light"] },
  { type: "about", variant: "about-fyzio-02-features", name: "3 benefit karty",            desc: "Nadpis a tři karty s ikonou, titulkem a popisem.", tags: ["centered", "light"] },
  { type: "about", variant: "about-fitness-01-benefits", name: "3 ikony benefitů",         desc: "Tři sloupce s ikonou v kroužku, nadpisem a popisem.", tags: ["light", "cream"] },
  { type: "about", variant: "about-fitness-01-trainer", name: "Bio s fotkou a statistikami", desc: "Osobní představení — text, portrét a řádek statistik.", tags: ["split", "cream"] },
  { type: "about", variant: "arch-01-about",           name: "Minimalistický editorial",   desc: "Velká typografie a hodně bílého prostoru.", tags: ["minimal", "light"] },

  /* ── Služby ─────────────────────────────────────────────────────────── */
  { type: "services", variant: "cards-grid",   name: "Karty v mřížce",   desc: "Mřížka karet se službami. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "services", variant: "icon-grid",    name: "Ikony v mřížce",   desc: "Služby s ikonami ve vzdušné mřížce. Přebírá barvy webu.", tags: ["minimal"], themeAware: true },
  { type: "services", variant: "pricing-list", name: "Seznam s cenami",  desc: "Řádkový seznam služeb s cenou. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "services", variant: "fyzio-02-services-list", name: "Seznam s ikonami a fotkou", desc: "Ikonový seznam služeb vedle velké fotky.", tags: ["split", "light"] },
  { type: "services", variant: "fitness-02-services-grid", name: "Tmavá mřížka",  desc: "Služby na tmavém pozadí s výrazným akcentem.", tags: ["dark"] },

  /* ── Ceník ──────────────────────────────────────────────────────────── */
  { type: "pricing", variant: "pricing-list",           name: "Jednoduchý ceník",  desc: "Přehledný řádkový ceník. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "pricing", variant: "fitness-01-pricing-3col", name: "3 balíčky",        desc: "Tři cenové balíčky vedle sebe se zvýrazněným středem.", tags: ["light"] },

  /* ── Portfolio / galerie ────────────────────────────────────────────── */
  { type: "gallery", variant: "gallery-universal", name: "Univerzální galerie",  desc: "6 stylů (mřížka, bento, masonry…), lightbox a luxusní kurzor. Doporučeno.", tags: [], themeAware: true },
  { type: "gallery", variant: "grid",              name: "Mřížka",               desc: "Jednoduchá mřížka fotek s lightboxem.", tags: [], themeAware: true },
  { type: "gallery", variant: "four-col-contained", name: "4 sloupce",           desc: "Kompaktní čtyřsloupcová mřížka.", tags: [] },
  { type: "gallery", variant: "beauty-01-gallery-masonry", name: "Masonry",      desc: "Kaskádová mozaika fotek různých výšek.", tags: ["light"] },
  { type: "gallery", variant: "stavba-01-gallery", name: "Filtrovatelná galerie", desc: "Galerie s kategoriemi, filtrem a lightboxem.", tags: [] },

  /* ── Recenze ────────────────────────────────────────────────────────── */
  { type: "testimonials", variant: "default", name: "Karty s recenzemi", desc: "Mřížka karet s citací a jménem. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "testimonials", variant: "slider",  name: "Slider recenzí",    desc: "Recenze v posuvném slideru. Přebírá barvy webu.", tags: ["slider"], themeAware: true },
  { type: "testimonials", variant: "static",  name: "Statické citace",   desc: "Klidný layout s velkými citacemi. Přebírá barvy webu.", tags: ["minimal"], themeAware: true },

  /* ── Tým ────────────────────────────────────────────────────────────── */
  { type: "team", variant: "cards-grid",         name: "Karty členů",       desc: "Mřížka karet s fotkou, jménem a rolí. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "team", variant: "hair-03-circles",    name: "Kruhové portréty",  desc: "Členové týmu v kruhových výřezech.", tags: ["light"] },
  { type: "team", variant: "fyzio-01-team-grid", name: "Mřížka s bio",      desc: "Fotky členů s krátkým popisem.", tags: ["light"] },

  /* ── Statistiky ─────────────────────────────────────────────────────── */
  { type: "stats", variant: "default",                  name: "Čísla v řadě",       desc: "Řádek klíčových čísel s popisky. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "stats", variant: "barber-stats-counter-4col", name: "Count-up 4 sloupce", desc: "Animovaná počítadla ve čtyřech sloupcích.", tags: ["dark"] },

  /* ── Výzva k akci ───────────────────────────────────────────────────── */
  { type: "cta", variant: "default",       name: "CTA pruh",           desc: "Nadpis, text a tlačítko v barevném pruhu. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "cta", variant: "stavba-01-cta", name: "Banner s pozadím",   desc: "CTA s fotkou na pozadí a výrazným tlačítkem.", tags: ["dark", "image"] },
  { type: "cta", variant: "events-01-cta", name: "Elegantní tmavé CTA", desc: "Tmavé pozadí, serif typografie, zlatavý akcent.", tags: ["dark", "luxury"] },

  /* ── Propagace ──────────────────────────────────────────────────────── */
  { type: "promo", variant: "promo-2cards",     name: "2 karty",          desc: "Dvě velké propagační karty vedle sebe.", tags: [] },
  { type: "promo", variant: "reality-02-steps", name: "Číslované kroky",  desc: "Postup ve třech–čtyřech číslovaných krocích.", tags: ["light"] },
  { type: "promo", variant: "solar-01-process", name: "Kroky procesu",    desc: "Jak spolupráce probíhá — kroky s ikonami.", tags: [] },

  /* ── FAQ ────────────────────────────────────────────────────────────── */
  { type: "faq", variant: "default",   name: "Harmonika",          desc: "Rozbalovací otázky a odpovědi. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "faq", variant: "accordion", name: "Harmonika — klasik", desc: "Alternativní klasické provedení harmoniky.", tags: [], themeAware: true },

  /* ── Blog ───────────────────────────────────────────────────────────── */
  { type: "blog-preview", variant: "default", name: "Poslední články", desc: "Tři poslední články z blogu. Přebírá barvy webu.", tags: [], themeAware: true },

  /* ── Kontakt ────────────────────────────────────────────────────────── */
  { type: "contact", variant: "default",   name: "Formulář + kontakty", desc: "Kontaktní formulář s údaji vedle. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "contact", variant: "split",     name: "2 sloupce",           desc: "Formulář vlevo, kontaktní informace vpravo.", tags: ["split"], themeAware: true },
  { type: "contact", variant: "map-split", name: "Formulář + mapa",     desc: "Formulář vedle interaktivní mapy.", tags: ["split"], themeAware: true },
  { type: "map",     variant: "default",   name: "Mapa",                desc: "Interaktivní mapa s adresou (OpenStreetMap).", tags: [], themeAware: true },
  { type: "opening-hours", variant: "default", name: "Otevírací doba",  desc: "Přehled otevírací doby po dnech.", tags: [], themeAware: true },

  /* ── Hlavička / patička ─────────────────────────────────────────────── */
  { type: "navbar", variant: "default", name: "Klasická lišta", desc: "Logo vlevo, odkazy a CTA vpravo. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "footer", variant: "default", name: "Jednoduchá patička", desc: "Název, odkazy a copyright. Přebírá barvy webu.", tags: [], themeAware: true },
  { type: "footer", variant: "footer-map-contact", name: "Patička s mapou a kontakty", desc: "Patička s mapou, kontakty a odkazy.", tags: [] },

  /* ── Pokročilé ──────────────────────────────────────────────────────── */
  { type: "freeform", variant: "default", name: "Volné plátno", desc: "Pixel-perfect plátno — texty, tlačítka, obrázky a tvary kamkoliv.", tags: [], themeAware: true },
  { type: "embed",    variant: "default", name: "Vlastní HTML / embed", desc: "Vložte vlastní kód — YouTube, mapy, widgety.", tags: [], themeAware: true },
];

/** Kurátorované entry pro daný section type (v pořadí definice). */
export function curatedForTypes(types: string[]): CuratedEntry[] {
  return CURATED_LIBRARY.filter((e) => types.includes(e.type));
}
