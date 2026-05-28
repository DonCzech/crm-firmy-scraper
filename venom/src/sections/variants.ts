export interface VariantMeta {
  key: string;
  label: string;
  description: string;
  industries: string[];
}

export const SECTION_VARIANTS: Record<string, VariantMeta[]> = {
  hero: [
    { key: "default", label: "Hero – výchozí", description: "Hlavní banner s nadpisem a tlačítkem", industries: ["*"] },
    { key: "hero-full-bleed", label: "Hero – full bleed", description: "Full-bleed hero s velkým pozadím (barber)", industries: ["barber"] },
    { key: "hero-split", label: "Hero – split", description: "Split: text vlevo + obrázek vpravo, svislá coral linka", industries: ["barber"] },
    { key: "hero-luxury-dark", label: "Hero – tmavý luxusní", description: "Tmavý hero pro barber/luxus", industries: ["barber", "lawyer"] },
    { key: "hero-barber-luxury", label: "Hero – luxusní centrovaný (barber-02)", description: "Centrovaný serif title, ghost CTA, info blok pod CTA, scroll indicator", industries: ["barber"] },
    { key: "hero-barber-titleonly", label: "Hero – luxusní title-only (barber-03)", description: "Centrovaný serif title bez CTA/info/subtitle, fluid font pro delší titulky", industries: ["barber"] },
    { key: "hero-split-image", label: "Hero – split obrázek", description: "Hero s obrázkem napravo", industries: ["*"] },
    { key: "hero-cafe-wave", label: "Hero – kavárna vlna", description: "Full-bleed hero s wave-mask (cafe-01)", industries: ["cafe"] },
    { key: "hero-centered", label: "Hero – centrovaný", description: "Centrovaný nadpis pro podstránky", industries: ["*"] },
  ],
  about: [
    { key: "two-col", label: "O nás – dvousloupcový", description: "Text + obrázek", industries: ["*"] },
    { key: "cafe-loyalty-tilted", label: "O nás – nakloněný", description: "Obrázek nakloněný + display font (cafe-01)", industries: ["cafe"] },
    { key: "about-barber-luxury", label: "O nás – luxusní barber (barber-02)", description: "Lead italic + body + photo vpravo, cream bg", industries: ["barber"] },
  ],
  "blog-preview": [
    { key: "default", label: "Novinky – výchozí", description: "3 nejnovější články", industries: ["*"] },
    { key: "cafe-filled-cards", label: "Novinky – vyplněné karty", description: "3 karty s barevným pozadím (cafe-01)", industries: ["cafe"] },
  ],
  cta: [
    { key: "default", label: "CTA – výchozí", description: "Výzva k akci s tlačítkem", industries: ["*"] },
    { key: "cafe-magazine", label: "CTA – časopis", description: "Split: text + obálka časopisu (cafe-01)", industries: ["cafe"] },
  ],
  services: [
    { key: "cards-grid", label: "Služby – kartičky", description: "Mřížka karet se službami", industries: ["*"] },
    { key: "grid", label: "Služby – mřížka", description: "Mřížka 2-3 sloupce", industries: ["*"] },
    { key: "pricing-list", label: "Ceník – seznam", description: "Seznam s cenami", industries: ["*"] },
    { key: "pricing-rows", label: "Ceník – řádky",   description: "Řádkový ceník s cenou a délkou",           industries: ["barber", "wellness"] },
    { key: "pricing-cols", label: "Ceník – sloupce", description: "3-sloupcový ceník s kategoriemi, tmavé bg", industries: ["barber", "wellness"] },
    { key: "pricing-urban", label: "Ceník – urban", description: "Číslovaný ceník s large čísly, dark urban styl", industries: ["barber"] },
    { key: "pricing-table-video", label: "Ceník – tabulka + video (barber-03)", description: "Video vlevo + 4-col tabulka služeb vpravo na warm dark", industries: ["barber"] },
    { key: "icon-grid", label: "Služby – ikony", description: "Ikony s popisky", industries: ["*"] },
  ],
  pricing: [
    { key: "pricing-list", label: "Ceník – seznam", description: "Seznam s cenami", industries: ["*"] },
    { key: "pricing-table-video", label: "Ceník – tabulka + video (barber-03)", description: "Video vlevo + 4-col tabulka služeb vpravo na warm dark", industries: ["barber"] },
  ],
  gallery: [
    { key: "default",   label: "Galerie – výchozí",   description: "Mřížka 2–3 sloupce s lightboxem",         industries: ["*"] },
    { key: "four-col",  label: "Galerie – 4 sloupce", description: "4-sloupcová čtvercová galerie, tmavé bg",  industries: ["barber", "tattoo"] },
    { key: "masonry",   label: "Galerie – masonry",   description: "Nepravidelná mřížka",                      industries: ["*"] },
    { key: "grid",      label: "Galerie – mřížka",    description: "Pravidelná mřížka",                        industries: ["*"] },
  ],
  testimonials: [
    { key: "default", label: "Reference – výchozí", description: "Statické kartičky (3 sloupce)", industries: ["*"] },
    { key: "slider", label: "Reference – slider", description: "Posuvné reference", industries: ["*"] },
    { key: "static", label: "Reference – karty", description: "Statické kartičky", industries: ["*"] },
    { key: "barber-dark-3col", label: "Reference – tmavé 3-col (barber-03)", description: "3-sloupcové karty na warm dark s gold accent", industries: ["barber"] },
  ],
  contact: [
    { key: "default", label: "Kontakt – výchozí", description: "Kontaktní údaje", industries: ["*"] },
    { key: "split", label: "Kontakt – split", description: "Údaje + formulář", industries: ["*"] },
    { key: "map-split", label: "Kontakt – s mapou", description: "Mapa vedle údajů", industries: ["*"] },
  ],
  faq: [
    { key: "default", label: "FAQ", description: "Nejčastější otázky", industries: ["*"] },
  ],
  "opening-hours": [
    { key: "default", label: "Otevírací doba", description: "Přehled otvíracích hodin", industries: ["*"] },
  ],
  team: [
    { key: "cards-grid", label: "Tým", description: "Členové týmu", industries: ["*"] },
  ],
  map: [
    { key: "default", label: "Mapa", description: "Google Maps", industries: ["*"] },
  ],
  promo: [
    { key: "promo-2cards", label: "Promo – 2 karty (barber-03)", description: "Dvojice akčních karet s bg image, bullety v gold a popiskem", industries: ["barber", "wellness"] },
  ],
  navbar: [
    { key: "default",          label: "Navigace",                description: "Hlavní navigace",                          industries: ["*"] },
    { key: "barber-overlay",   label: "Navigace – průhledná",    description: "Fixní průhledná navigace přes hero (the-barber)", industries: ["barber"] },
    { key: "barber-overlay-promo", label: "Navigace – průhledná + top-bar", description: "Fixní průhledná navigace s top-row (phone + social) — barber-03 fade-room", industries: ["barber"] },
    { key: "cafe-wave",        label: "Navigace – vlna",         description: "Cafe styl s vlnou",                        industries: ["cafe"] },
    { key: "barber-dark",      label: "Navigace – tmavá",        description: "Tmavá navigace pro barber",                industries: ["barber"] },
  ],
  footer: [
    { key: "default",     label: "Patička",               description: "Patička stránky",              industries: ["*"] },
    { key: "light",       label: "Patička – světlá",      description: "Světlá patička (peak-cut)",    industries: ["*"] },
    { key: "6col",        label: "Patička – 6 sloupců",   description: "6-sloupcová patička (cafe-01)", industries: ["cafe"] },
    { key: "barber-dark", label: "Patička – tmavá",       description: "Tmavá patička pro barber",     industries: ["barber"] },
    { key: "barber-luxury", label: "Patička – luxusní 2-col (barber-02)", description: "2-sloupcová patička, kontakt+social vlevo, hodiny vpravo", industries: ["barber"] },
  ],
  "rezora-cta": [
    { key: "default",     label: "Rezervace CTA",         description: "Tlačítko pro online rezervaci", industries: ["barber", "wellness"] },
    { key: "barber-dark", label: "Rezervace CTA – tmavá", description: "Tmavá CTA pro barber",          industries: ["barber"] },
  ],
  "rezora-widget": [
    { key: "default", label: "Rezervace Widget", description: "Rezora widget", industries: ["barber", "wellness"] },
  ],
};

export interface SectionLibraryEntry {
  type: string;
  variant: string;
  label: string;
  description: string;
  industries: string[];
}

export function buildSectionLibrary(industryFilter?: string): SectionLibraryEntry[] {
  const entries: SectionLibraryEntry[] = [];
  for (const [type, variants] of Object.entries(SECTION_VARIANTS)) {
    for (const v of variants) {
      if (industryFilter && !v.industries.includes("*") && !v.industries.includes(industryFilter)) continue;
      entries.push({ type, variant: v.key, label: v.label, description: v.description, industries: v.industries });
    }
  }
  return entries;
}
