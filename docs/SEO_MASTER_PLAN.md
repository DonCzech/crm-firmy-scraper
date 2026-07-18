# SEO Master Plan — všechny projekty (audit 2026-07-18)

Cíl: maximálně profesionální SEO na úrovni top konkurence pro všech 12 projektů.
Stav se aktualizuje po každé dokončené fázi. Pořadí = priorita (公public dosah × závažnost nálezů).

## Stav přehled

| # | Projekt | Doména | Stav | Priorita |
|---|---------|--------|------|----------|
| 1 | bettercv | cv-editor.com | 🟢 HOTOVO (37 locales indexace, committed) | vysoká |
| 2 | myiq-clone | iq-boost.com | 🟢 AUDIT OK — sitemap+hreflang v pořádku | vysoká |
| 3 | smlouvy (Signy) | smlouvy-five.vercel.app | 🟢 HOTOVO (sitemap 216 URL, JSON-LD, committed) | vysoká |
| 4 | rezora | rezora-web.vercel.app | 🟢 HOTOVO (sitemap, metadata, JSON-LD, committed) | vysoká |
| 5 | Pojisteni | zivotni-pojisteni.com +4 domény | 🟢 HOTOVO (JSON-LD, OG, favicon, 10 route layoutů, committed) | vysoká |
| 6 | fakturina | fakturina.cz | 🟢 HOTOVO (canonical fix, JSON-LD, robots, committed) | střední |
| 7 | ceskypartner-reality | ceskypartner.cz | 🟢 HOTOVO (diakritika, blog schema, makléři, committed) | střední |
| 8 | odhady-zdarma | online-odhad.cz | 🟢 HOTOVO (OG PNG, committed) | nízká |
| 9 | convee | convee.co | 🟢 HOTOVO (OG image, canonicaly, committed) | střední |
| 10 | XORA | xora.cz | 🟢 HOTOVO (single-locale indexace, OG, committed) | střední |
| 11 | venom (webero) | webero.co | 🟢 BEZE ZMĚNY — custom domény nejsou wired, canonical /demo/ správně | střední |
| 12 | rezervace | interní | ⚪ jen /book/[slug] veřejné — OG tagy stačí | nízká |

## Hotovo

### bettercv (2026-07-18)
Zjištění: všech 37 jazyků má KOMPLETNÍ překlady (81/81 klíčů v EXTRA_LOCALE_PACKS
+ lokalizované meta title/description), ale `CONTENT_LANGS` (cs,en,de,fr) uměle
omezoval indexaci — 33 jazyků mělo noindex, chybělo v sitemapě i v hreflang.
Provedené fixy:
- `src/lib/locales.ts` — `isFullyTranslatedLocale` → všech 37 locales; `buildAlternates` iteruje `SUPPORTED_LOCALES`
- `src/app/sitemap.ts` — statické stránky + šablony × 37 locales; přidán `/help`
- `templates/[templateId]/page.tsx` — robots přes `robotsForLocale` (dříve noindex pro 33 jazyků)
- tsc PASS
Zbývá (HIGH/MEDIUM z auditu):
- templates listing: META jen 4 jazyky (EN title pro /es/templates), hardcoded EN h1
- OG images na většině stránek; og:locale mapováno jen na 4 hodnoty
- root ne-locale stránky (/pricing, /blog) bez canonical → duplicitní s /en/...
- FAQPage schema na /help, BreadcrumbList, ItemList na templates
- blog sitemap záznamy bez hreflang alternates

### myiq-clone (2026-07-18) — AUDIT OK
- sitemap.xml: 820 URL, 29 714 hreflang alternates, image tagy ✓
- HTML head: 76 hreflang link tagů (38 jazyků + x-default), canonical per-locale ✓ (pozor: Next renderuje `hrefLang` camelCase — grep na "hreflang" selže)
- Překlady: 37 jazyků kompletní, žádný fallback ✓; title/description lokalizované ✓
- html lang + dir ✓; robots.ts wildcard ✓
- Závěr: "kopie/fallback" v GSC NENÍ chyba kódu — pravděpodobně starý stav indexace.
  Doporučení: v GSC požádat o reindexaci, ověřit Coverage report po 2–4 týdnech.

## Detailní nálezy per projekt (z auditů)

### smlouvy (Signy) — právní šablony, 100+ stránek
1. Přidat sitemap.ts + robots.ts (KRITICKÉ — 100+ stránek formulářů)
2. OG tagy + canonical všude
3. JSON-LD: Product (šablony s cenou), FAQPage, Organization, BreadcrumbList
4. blog/[slug] chybí generateMetadata

### rezora — marketing web rezervačního SaaS
1. sitemap.ts + robots.ts
2. Per-page metadata pro /cenik, /produkt, /funkce, /odvetvi, /o-nas, /zdroje, /kariera
3. OG tagy, canonical, Twitter card
4. JSON-LD: Organization, WebSite, FAQPage (FAQ.tsx existuje), Product
5. Ověřit h1 na homepage

### Pojisteni (zivotni-pojisteni.com + 4 domény)
1. Organization + WebSite @graph do (public)/layout.tsx (E-E-A-T!)
2. FinancialProduct/Service schema na produktové stránky
3. OG image (layout i [...slug] stránky)
4. favicon
5. [...slug] stránky: doplnit hreflang alternates

### fakturina.cz
1. KRITICKÉ: canonical "/" v root layoutu dědí všechny podstránky → vše se tváří jako homepage
2. JSON-LD: Organization + SoftwareApplication + FAQPage (homepage má FAQ accordion)
3. OG image neexistuje (public/ prázdné)
4. Podstránky (kontakt, podminky, ochrana-soukromi) jen title — doplnit description+OG
5. Odstranit /login,/register ze sitemapy; favicon

### ceskypartner-reality (ceskypartner.cz)
1. Diakritika v meta (o-nas, kontakt, sluzby — ASCII čeština)
2. OG image (root layout bez images)
3. blog/[slug]: canonical, OG, Article JSON-LD
4. Listing JSON-LD: Product → RealEstateListing
5. hreflang cs/en; /makleri/[id] do sitemapy; favicon/apple-touch-icon

### odhady-zdarma (online-odhad.cz) — celkově dobré
1. KRITICKÉ: OG image je SVG → exportovat 1200×630 PNG (FB/TW/LI SVG nerenderují)
2. Ověřit indexaci SPA stránek v GSC (Vite SPA, prerender skript existuje)
3. Dynamické lastmod v generate-sitemap.mjs

### convee (convee.co) — celkově dobré
1. OG image chybí v [locale]/layout.tsx (shadowuje root)
2. Ne-locale stránky (/pricing, /login, /convert) bez canonical/hreflang → duplicity s [locale] verzemi
3. JSON-LD inLanguage hardcoded "en"; ověřit reviewCount 1284 (nesmí být fake)

### XORA (xora.cz)
1. KRITICKÉ: html lang="cs" hardcoded pro en/de/fr/es (layout.tsx:27)
2. JSON-LD (FAQ answers) česky pro všechny jazyky
3. OG image chybí (twitter summary_large_image bez image)
4. Sitemap jen 5 root stránek

### venom/webero (webero.co) — celkově výborné
1. tenant-seo.ts:88 — canonical vždy webero.co/demo/{slug} i pro custom domény (mismatch se sitemapou)
2. tenant-seo.ts:106 — og:locale hardcoded cs_CZ
3. manifest description česky; kategorie přes query string

### rezervace — interní tool
1. Jen OG tagy na /book/[slug] pro sdílení odkazů; nízká priorita

## Fáze 2 — provedené fixy (2026-07-18, vše committed, NENASAZENO)

- **smlouvy**: sitemap 216 URL (202 smluv + blog), robots, metadataBase+OG+JSON-LD
  (Organization/WebSite, Product+Breadcrumb na detailech, Article na blogu), per-page
  canonical, fix diakritického slugu smlouva-o-dilo-osvč→-osvc. Build PASS.
- **rezora**: sitemap 8 stránek, robots, JSON-LD (Org/WebSite/SoftwareApplication),
  per-page metadata všech 7 podstránek. Build PASS. POZOR: v repu je rozpracovaný
  uživatelův redesign (uncommitted deleted components).
- **fakturina**: FIX canonical dědičnosti (podstránky měly canonical "/"), JSON-LD,
  noindex login/register, robots disallow /invoice/ /quote/ (tokenové URL). Build PASS.
- **Pojisteni**: Organization+WebSite JSON-LD (domain-aware), og:image+twitter (maskot),
  app icon, 10 per-route layoutů s metadaty (produktové stránky dědily generický title!),
  Service JSON-LD, noindex /prihlaseni. Build FAILÍ na pre-existujících lint chybách
  uživatelova WIP homepage-beta (selhává i bez mých změn); tsc PASS.
- **XORA**: KLÍČOVÉ ZJIŠTĚNÍ — obsah homepage je hardcoded česky, /en /de /fr /es
  servírují identický český obsah. Řešení: canonical všech locales → /cs, noindex
  ne-cs, sitemap jen /cs. Po dodání překladů vrátit per-locale indexaci (komentář
  v [locale]/page.tsx). + og:image, správné og:locale kódy. Build PASS.
- **ceskypartner-reality**: diakritika v meta (o-nas/kontakt/sluzby) + odstranění
  duplicitního "| Cesky Partner" suffixu (template ho přidává), blog canonical+OG+
  Article JSON-LD, makléři /makleri/[id] v sitemapě. tsc PASS. TODO: OG image asset
  neexistuje (public/ má jen video), tělo stránek má taky ASCII češtinu (content práce).
- **odhady-zdarma**: og-image.png 1200×630 vygenerováno z SVG přes Playwright, reference
  přepnuty (index.html, Seo.tsx).
- **convee**: root layout odkazoval na neexistující /og-image.png → vygenerován brand
  asset; [locale] OG dostal images+twitter; /contact /convert /pricing (neprefixované
  duplikáty) canonical → /en verze.
- **venom**: beze změny — getTenantByDomain není nikde napojený, custom domény zatím
  neservírují weby, canonical /demo/{slug} je správně. AŽ SE DOMÉNY NAPOJÍ: canonical
  musí používat custom doménu (tenant-seo.ts:88).

### Deploy checklist (user)
Žádný projekt nebyl nasazen. Deploy: bettercv, smlouvy (`vercel deploy --prod`),
rezora, fakturina, Pojisteni (pozor na lint fail z homepage-beta), XORA,
ceskypartner-reality, odhady-zdarma (rebuild dist), convee.
