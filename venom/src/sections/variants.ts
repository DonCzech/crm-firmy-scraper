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
    { key: "hero-barber-04-slider", label: "Hero – fullbleed slider (barber-04)", description: "Full-bleed 2+ slide slider s fade transition, Bebas Neue gold CTA, autoplay 6s — barber-04 Černý Fade", industries: ["barber"] },
    { key: "hero-barber-04-page-title", label: "Hero – mini page-title (barber-04)", description: "Centrovaný uppercase title + gold separator + italic podtitulek; pro podstránky — barber-04 Černý Fade", industries: ["barber"] },
    { key: "hero-hair-fullbleed", label: "Hero – full-bleed foto (hair-01)", description: "Full-bleed tmavá foto, žádný text overlay, animovaný SCROLL indikátor dole — hair-01 Salon Aria", industries: ["hair"] },
    { key: "hero-split-image", label: "Hero – split obrázek", description: "Hero s obrázkem napravo", industries: ["*"] },
    { key: "hero-cafe-wave", label: "Hero – kavárna vlna", description: "Full-bleed hero s wave-mask (cafe-01)", industries: ["cafe"] },
    { key: "hero-centered", label: "Hero – centrovaný", description: "Centrovaný nadpis pro podstránky", industries: ["*"] },
  ],
  about: [
    { key: "two-col", label: "O nás – dvousloupcový", description: "Text + obrázek", industries: ["*"] },
    { key: "cafe-loyalty-tilted", label: "O nás – nakloněný", description: "Obrázek nakloněný + display font (cafe-01)", industries: ["cafe"] },
    { key: "about-barber-luxury", label: "O nás – luxusní barber (barber-02)", description: "Lead italic + body + photo vpravo, cream bg", industries: ["barber"] },
    { key: "about-barber-04-strip", label: "O nás – centered + 8-strip (barber-04)", description: "Centered intro (H2 gold + separator + lead + body) + carousel strip s číselnými badges 01–N", industries: ["barber"] },
    { key: "about-hair-split-stats", label: "O nás – split dark/gold se stats (hair-01)", description: "2-col: dark left (text+3 stat counters) / gold bg right (portrait foto + CTA) — hair-01 Salon Aria", industries: ["hair"] },
    { key: "about-hair-values", label: "Hodnoty – fullbleed 2-col (hair-01)", description: "Fullbleed: obrázek vlevo 55% + text right na white bg — hair-01 Salon Aria", industries: ["hair"] },
  ],
  "blog-preview": [
    { key: "default", label: "Novinky – výchozí", description: "3 nejnovější články", industries: ["*"] },
    { key: "cafe-filled-cards", label: "Novinky – vyplněné karty", description: "3 karty s barevným pozadím (cafe-01)", industries: ["cafe"] },
  ],
  cta: [
    { key: "default", label: "CTA – výchozí", description: "Výzva k akci s tlačítkem", industries: ["*"] },
    { key: "cafe-magazine", label: "CTA – časopis", description: "Split: text + obálka časopisu (cafe-01)", industries: ["cafe"] },
    { key: "barber-04-reservation-dark", label: "CTA – rezervace tmavá (barber-04)", description: "Tmavá sekce s gradient overlay, Bebas Neue H2 bílá, gold separator + Lato CTA — barber-04 Černý Fade", industries: ["barber"] },
    { key: "cta-hair-01", label: "CTA – cream outline (hair-01)", description: "Cream bg, dark title, gold outline button — hair-01 Salon Aria", industries: ["hair"] },
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
    { key: "barber-04-services-cards", label: "Služby – 4 karty (barber-04)", description: "4-col dark karty s gold H4 Bebas Neue uppercase + Lato popis — barber-04 Černý Fade", industries: ["barber"] },
    { key: "peak-cut-pricing", label: "Ceník – minimal (peak-cut)", description: "Bezserif uppercase názvy, tenké linky mezi položkami, černé ceny vpravo — peak-cut Minimal White", industries: ["barber"] },
    { key: "hair-numbered-cards", label: "Služby – numbered 4-col (hair-01)", description: "4 karty s gold numbered 01–04, Montserrat, cream bg, inline CTA button — hair-01 Salon Aria", industries: ["hair"] },
  ],
  pricing: [
    { key: "pricing-list", label: "Ceník – seznam", description: "Seznam s cenami", industries: ["*"] },
    { key: "pricing-table-video", label: "Ceník – tabulka + video (barber-03)", description: "Video vlevo + 4-col tabulka služeb vpravo na warm dark", industries: ["barber"] },
    { key: "barber-04-pricing-flat", label: "Ceník – plochý seznam (barber-04)", description: "Plochý ceník s kategoriemi, Bebas Neue názvy uppercase + gold ceny, white bg — barber-04 Černý Fade", industries: ["barber"] },
  ],
  gallery: [
    { key: "default",   label: "Galerie – výchozí",   description: "Mřížka 2–3 sloupce s lightboxem",         industries: ["*"] },
    { key: "four-col",  label: "Galerie – 4 sloupce", description: "4-sloupcová čtvercová galerie, tmavé bg",  industries: ["barber", "tattoo"] },
    { key: "four-col-contained", label: "Galerie – 4 sloupce (kontejner)", description: "4-sloupcová galerie s max-width, gap 16px a title (barber-03)", industries: ["barber", "tattoo"] },
    { key: "masonry",   label: "Galerie – masonry",   description: "Nepravidelná mřížka",                      industries: ["*"] },
    { key: "grid",      label: "Galerie – mřížka",    description: "Pravidelná mřížka",                        industries: ["*"] },
    { key: "peak-cut-mosaic", label: "Galerie – mosaic (peak-cut)", description: "Asymetrická 12-col mřížka s těsným gap, malý uppercase label, cream bg — peak-cut Minimal White", industries: ["barber"] },
  ],
  testimonials: [
    { key: "default", label: "Reference – výchozí", description: "Statické kartičky (3 sloupce)", industries: ["*"] },
    { key: "slider", label: "Reference – slider", description: "Posuvné reference", industries: ["*"] },
    { key: "static", label: "Reference – karty", description: "Statické kartičky", industries: ["*"] },
    { key: "barber-dark-3col", label: "Reference – tmavé 3-col (barber-03)", description: "3-sloupcové karty na warm dark s gold accent", industries: ["barber"] },
    { key: "barber-04-single-stars", label: "Reference – single + 5 hvězd (barber-04)", description: "Centrovaná jediná recenze s 5★, italic text, gold autor; pagination jen pokud více recenzí — barber-04 Černý Fade", industries: ["barber"] },
    { key: "hair-01-cards", label: "Reference – cream karty (hair-01)", description: "Cream card grid s gold hvězdami, italic text, rating line nahoře — hair-01 Salon Aria", industries: ["hair"] },
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
    { key: "hair-01-team-cards", label: "Tým – portrait slider (hair-01)", description: "Horizontálně posuvné tall portrait karty na cream bg, gold role napis — hair-01 Salon Aria", industries: ["hair"] },
  ],
  map: [
    { key: "default", label: "Mapa", description: "Google Maps", industries: ["*"] },
  ],
  promo: [
    { key: "promo-2cards", label: "Promo – 2 karty (barber-03)", description: "Dvojice akčních karet s bg image, bullety v gold a popiskem", industries: ["barber", "wellness"] },
  ],
  stats: [
    { key: "default", label: "Stats – centrované", description: "Centrované statistiky 2/4-col s velkými čísly", industries: ["*"] },
    { key: "barber-stats-counter-4col", label: "Stats – 4-col counter (barber-04)", description: "4-col animované počítadlo s SVG ikonami, gold accent, Bebas Neue čísla — barber-04 Černý Fade", industries: ["barber"] },
  ],
  navbar: [
    { key: "default",          label: "Navigace",                description: "Hlavní navigace",                          industries: ["*"] },
    { key: "barber-overlay",   label: "Navigace – průhledná",    description: "Fixní průhledná navigace přes hero (the-barber)", industries: ["barber"] },
    { key: "barber-overlay-promo", label: "Navigace – průhledná + top-bar", description: "Fixní průhledná navigace s top-row (phone + social) — barber-03 fade-room", industries: ["barber"] },
    { key: "barber-04-overlay", label: "Navigace – průhledná + top-bar (compact)", description: "Fixní průhledná navigace s top-row skrytým <768px, SVG ikony FB/IG/YT/TikTok — barber-04 Černý Fade", industries: ["barber"] },
    { key: "cafe-wave",        label: "Navigace – vlna",         description: "Cafe styl s vlnou",                        industries: ["cafe"] },
    { key: "barber-dark",      label: "Navigace – tmavá",        description: "Tmavá navigace pro barber",                industries: ["barber"] },
    { key: "peak-cut-minimal", label: "Navigace – minimal (peak-cut)", description: "Light cream bg, SVG ikonka logo vlevo, nav linky uprostřed, social ikonky vpravo, žádné CTA — peak-cut Minimal White", industries: ["barber"] },
    { key: "hair-01-topbar",   label: "Navigace – salon topbar (hair-01)", description: "Tmavý single-bar, logo vlevo, nav linky uprostřed, phone+email+social vpravo — hair-01 Salon Aria", industries: ["hair"] },
  ],
  footer: [
    { key: "default",     label: "Patička",               description: "Patička stránky",              industries: ["*"] },
    { key: "light",       label: "Patička – světlá",      description: "Světlá patička (peak-cut)",    industries: ["*"] },
    { key: "6col",        label: "Patička – 6 sloupců",   description: "6-sloupcová patička (cafe-01)", industries: ["cafe"] },
    { key: "barber-dark", label: "Patička – tmavá",       description: "Tmavá patička pro barber",     industries: ["barber"] },
    { key: "barber-luxury", label: "Patička – luxusní 2-col (barber-02)", description: "2-sloupcová patička, kontakt+social vlevo, hodiny vpravo", industries: ["barber"] },
    { key: "footer-map-contact", label: "Patička – mapa + kontakty (barber-03)", description: "Velká mapa vlevo (75%) + kontakt widget vpravo (25%) s hodinami a sociálními ikonkami", industries: ["barber", "wellness"] },
    { key: "barber-04-multi-blurb-legal", label: "Patička – 3-col blurb + legal (barber-04)", description: "3 sloupce (lokalita/hodiny/kontakt+social) + bottom legal řádek s IČO/DIČ/účtem, dark #0f0f0f, gold #d5b981 H4 — barber-04 Černý Fade", industries: ["barber"] },
    { key: "hair-01-footer", label: "Patička – salon kontakt (hair-01)", description: "Dark bg, nadpis 'Těšíme se na vás!', 3-col (phone/hours/address+social), bottom legal — hair-01 Salon Aria", industries: ["hair"] },
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
