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
    { key: "hero-hair-02-slider", label: "Hero – image slider (hair-02)", description: "Full-bleed Flickity slider 687px výška, bílý overlay 25%, teal CTA rezervace dole uprostřed — hair-02 Hair Studio No.1", industries: ["hair"] },
    { key: "hero-hair-03-split", label: "Hero – 2-col split (hair-03)", description: "Bg foto full-bleed, 2-col overlay: text vlevo (H1 serif + subtitle + dark pill CTA) / portrait foto vpravo — hair-03 Petra Studio", industries: ["hair"] },
    { key: "hero-hair-04-with-navbar", label: "Hero + Navbar – fullscreen s embedded navbarem (hair-04)", description: "100vh bg foto (salon-inside-bg.jpg), overlay rgba(0,0,0,0.24), steel-blue navbar (#92a8d1) embedded nahoře, H1 bílý bold v tmavém boxu, 2× gold-border pill CTA (#FFDF25) — hair-04 Impresiv Studio", industries: ["hair"] },
    { key: "hero-beauty-01-fullbleed", label: "Hero – fullbleed tmavý overlay (beauty-01)", description: "Full-bleed hero foto, tmavý overlay, centrované texty: tag + H1 + subtitle + CTA — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
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
    { key: "about-hair-02-story", label: "O nás – story + brandy (hair-02)", description: "White bg, velký H1, 3 odstavce příběhu, řada brand log (Goldwell/Oribe/Varis/Malibu) — hair-02 Hair Studio No.1", industries: ["hair"] },
    { key: "about-hair-03-founder", label: "O nás – zakladatel story (hair-03)", description: "White bg, 2-col: portrait foto vlevo (rounded 28px + shadow) / text vpravo (gold label + H1 + founder story) — hair-03 Petra Studio", industries: ["hair"] },
    { key: "about-hair-04-split", label: "O nás – 2-col dark split (hair-04)", description: "Tmavé bg #0d0d0d, text vlevo (gold linka + H2 + 2 odstavce), foto vpravo edge-to-edge — hair-04 Impresiv Studio", industries: ["hair"] },
    { key: "about-beauty-01-brands", label: "O nás – prémiové značky (beauty-01)", description: "Cream bg, uppercase label + řada brand názvů — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
    { key: "about-beauty-01-features", label: "Hodnoty – 4 features (beauty-01)", description: "White bg, uppercase H2 + subtitle + 4-col features grid s ikonou/H3/popis — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
  ],
  "blog-preview": [
    { key: "default", label: "Novinky – výchozí", description: "3 nejnovější články", industries: ["*"] },
    { key: "cafe-filled-cards", label: "Novinky – vyplněné karty", description: "3 karty s barevným pozadím (cafe-01)", industries: ["cafe"] },
    { key: "hair-03-blog-cards", label: "Novinky – 3-col karty (hair-03)", description: "Bílé bg, H1 40px Helvetica 400, 3-col grid, 24px nadpis + dark solid CTA — hair-03 Petra Studio", industries: ["hair"] },
  ],
  cta: [
    { key: "default", label: "CTA – výchozí", description: "Výzva k akci s tlačítkem", industries: ["*"] },
    { key: "cafe-magazine", label: "CTA – časopis", description: "Split: text + obálka časopisu (cafe-01)", industries: ["cafe"] },
    { key: "barber-04-reservation-dark", label: "CTA – rezervace tmavá (barber-04)", description: "Tmavá sekce s gradient overlay, Bebas Neue H2 bílá, gold separator + Lato CTA — barber-04 Černý Fade", industries: ["barber"] },
    { key: "cta-hair-01", label: "CTA – cream outline (hair-01)", description: "Cream bg, dark title, gold outline button — hair-01 Salon Aria", industries: ["hair"] },
    { key: "cta-hair-02-promo", label: "CTA – e-shop promo beige (hair-02)", description: "Beige (#ebe8e2) bg, 2-col: teal tag + H1 + lead text + outline CTA vlevo; kruhový obrázek vpravo — hair-02 Hair Studio No.1", industries: ["hair"] },
    { key: "cta-beauty-01", label: "CTA – dark fullbleed (beauty-01)", description: "Tmavé bg, fullbleed foto s overlay, centrovaný H2 + podtitulek + ghost CTA — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
    { key: "hair-04-cta-phone", label: "CTA – žlutý phone bar (hair-04)", description: "Žlutý (#FFDF25) horizontální bar: text vlevo + tmavé pill tlačítko s telefonem vpravo — hair-04 Impresiv Studio", industries: ["hair"] },
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
    { key: "hair-04-service-cards", label: "Služby – 3 diamond karty (hair-04)", description: "3 sloupce, diamond foto s gold borderem, tmavé bg #0d0d0d, gold h3, bílý popis — hair-04 Impresiv Studio (kim-impressive.cz)", industries: ["hair"] },
    { key: "beauty-01-services-3col", label: "Služby – 3 karty s cenou (beauty-01)", description: "3 service karty: foto nahoře + název + cena + popis + 2 CTA (rezervace + ceník) — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
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
    { key: "beauty-01-gallery-masonry", label: "Galerie – masonry 3-col (beauty-01)", description: "Cream bg, 3-col masonry grid, foto s hover overlay, nadpis nad galerií — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
    { key: "hair-03-gallery-slider", label: "Galerie – slider + thumbnail strip (hair-03)", description: "Bílé bg, H2 40px Helvetica 400, velký hlavní snímek + thumbnail pás dole — hair-03 Petra Studio", industries: ["hair"] },
    { key: "hair-04-carousel", label: "Galerie – 3-up carousel s lightboxem (hair-04)", description: "Tmavé bg, gold nadpis, 3 fotky najednou, arrow nav + dots + lightbox po kliknutí — hair-04 Impresiv Studio", industries: ["hair"] },
  ],
  testimonials: [
    { key: "default", label: "Reference – výchozí", description: "Statické kartičky (3 sloupce)", industries: ["*"] },
    { key: "slider", label: "Reference – slider", description: "Posuvné reference", industries: ["*"] },
    { key: "static", label: "Reference – karty", description: "Statické kartičky", industries: ["*"] },
    { key: "barber-dark-3col", label: "Reference – tmavé 3-col (barber-03)", description: "3-sloupcové karty na warm dark s gold accent", industries: ["barber"] },
    { key: "barber-04-single-stars", label: "Reference – single + 5 hvězd (barber-04)", description: "Centrovaná jediná recenze s 5★, italic text, gold autor; pagination jen pokud více recenzí — barber-04 Černý Fade", industries: ["barber"] },
    { key: "hair-01-cards", label: "Reference – cream karty (hair-01)", description: "Cream card grid s gold hvězdami, italic text, rating line nahoře — hair-01 Salon Aria", industries: ["hair"] },
    { key: "beauty-01-testimonials-3col", label: "Reference – 3 karty cream (beauty-01)", description: "3 karty na cream bg, italic text, jméno + role, rating hvězdičky — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
  ],
  contact: [
    { key: "default", label: "Kontakt – výchozí", description: "Kontaktní údaje", industries: ["*"] },
    { key: "split", label: "Kontakt – split", description: "Údaje + formulář", industries: ["*"] },
    { key: "map-split", label: "Kontakt – s mapou", description: "Mapa vedle údajů", industries: ["*"] },
    { key: "contact-hair-02-location", label: "Kontakt – location split (hair-02)", description: "Beige (#ebe8e2) left: teal tag + H1 adresa + text + CTA + phone/email; right: full-height foto — hair-02 Hair Studio No.1", industries: ["hair"] },
    { key: "hair-04-contact", label: "Kontakt – dark mapa + info (hair-04)", description: "Tmavé bg, gold nadpis, 2-col: Google mapa vlevo (dark filter) + kontaktní info vpravo (adresa/hodiny/tel/email/soc.sítě) — hair-04 Impresiv Studio", industries: ["hair"] },
    { key: "contact-beauty-01", label: "Kontakt – 4-col info (beauty-01)", description: "Cream bg, centered H2, 4-col: adresa / telefon / email / hodiny — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
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
    { key: "hair-03-circles", label: "Tým – kruhové portréty (hair-03)", description: "White bg, 3 kruhové portréty (220px) v řadě, dark jméno + muted role centrováno — hair-03 Petra Studio", industries: ["hair"] },
    { key: "beauty-01-team-grid", label: "Tým – portrait grid (beauty-01)", description: "Cream bg, 3-col grid tall portrétů, jméno + role pod foto — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
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
    { key: "hair-02-navbar",   label: "Navigace – světlá teal (hair-02)", description: "Bílý single-bar, logo vlevo, nav linky vpravo, teal (#8ab2ab) CTA rezervace — hair-02 Hair Studio No.1", industries: ["hair"] },
    { key: "hair-03-navbar",   label: "Navigace – bílá dvě CTA (hair-03)", description: "Bílý single-bar, SVG logo vlevo, nav linky uprostřed, social ikony + E-SHOP outline + REZERVACE solid vpravo — hair-03 Petra Studio", industries: ["hair"] },
    { key: "hair-04-navbar",   label: "Navigace – steel-blue fixed (hair-04)", description: "Fixní steel-blue bar (#92a8d1), SVG logo vlevo, 5 nav linků vpravo bílá, hamburger mobile — hair-04 Impresiv Studio (kim-impressive.cz inspirace)", industries: ["hair"] },
    { key: "beauty-01-topbar", label: "Navigace – cream sticky (beauty-01)", description: "Bílá sticky navbar, Fahkwang font, logo vlevo, nav linky uprostřed, phone + sand CTA rezervace vpravo — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
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
    { key: "hair-03-footer", label: "Patička – minimální šedá (hair-03)", description: "Šedé (#c1c1c1) bg, centrovaný logo + copyright text + GDPR link — hair-03 Petra Studio", industries: ["hair"] },
    { key: "hair-04-footer", label: "Patička – tmavá 3-col (hair-04)", description: "Tmavé #0a0a0a bg, 3 sloupce: logo+tagline vlevo / adresa+tel+email uprostřed / sociální sítě vpravo; copyright bar dole — hair-04 Impresiv Studio", industries: ["hair"] },
    { key: "beauty-01-footer", label: "Patička – dark cream (beauty-01)", description: "Dark #1F1F1F bg, CTA nadpis, 3-col (kontakt/hodiny/adresa+social), bottom legal — beauty-01 Demo Beauty Studio", industries: ["beauty"] },
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
