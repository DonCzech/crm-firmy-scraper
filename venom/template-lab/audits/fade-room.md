# Audit šablony: fade-room

## Identifikace

| Pole | Hodnota |
|------|---------|
| Original slug (queue id 3) | `fade-room` |
| Original název firmy | Barbershop URBAN |
| Originální doména | `barbershopurban.cz` |
| Kategorie (z queue) | Barbershop |
| **Skeleton** | `service-personal` |
| **Engine slug** | `barber-03` |
| **Engine tenant slug** | `barber-03-v2` |
| **Demo název** | Studio Břitva |
| **s.r.o. forma** | Studio Břitva s.r.o. |
| Předchozí DONE šablona stejné kategorie | `barber-02` (Holičství Atelier, ze the-barber), `barber-01` legacy, `peak-cut` legacy |
| URL na `/preview` kartu | `http://localhost:3015/preview` (slug: `fade-room-demo`) |
| URL na `/demo/fade-room-demo` (clone) | `http://localhost:3015/demo/fade-room-demo` |
| Zdrojový mirror | `public/clones/fade-room/` (assets/img/thumb/lang/theme/media; HTML se renderuje z DB tenantu, externí CSS z `barbershopurban.cz/assets/templates/barbershop/css/styles.min.css`) |
| Externí závislosti v mirror | Fancybox (gallery), Elfsight platform.js (reviews widget), Google Maps embed, externí video mp4/webm z `barbershopurban.cz` |

## Identifikované podstránky originálu

Originál je **multi-page** (WordPress / vlastní CMS, šablona "barbershop"). Mirror v `public/clones/fade-room/` obsahuje **pouze assets** (img/thumb/theme/media/lang) — HTML renderuje engine z DB tenantu jako single-page. Z menu rozpoznané podstránky:

| Slug | Název | Implementovat v FÁZI C? | Důvod |
|------|-------|--------------------------|-------|
| `/` | Homepage | ✅ | povinné |
| `/sluzby/` | Služby | ⏸ defer (v1.1) | scope FÁZE C = homepage; obsah služeb je již v homepage services sekci (video+pricing table) |
| `/o-nas/` | O nás | ⏸ defer (v1.1) | About snippet na homepage stačí pro v1 |
| `/akce/` | Akce (promo) | ⏸ defer (v1.1) | 2 promo karty na homepage |
| `/cenik/` | Ceník | ⏸ defer (v1.1) | ceník je v services sekci homepage |
| `/galerie/` | Galerie | ⏸ defer (v1.1) | grid 4-col na homepage |
| `/faq/` | FAQ | ⏸ defer (v1.1) | originál to má jako subpage, ne na homepage |
| `/blog/` | Blog | ⏸ defer (v2) | content-heavy, mimo skeleton priority |
| `/en/`, `/ru/`, `/uk/` | Lang varianty | ❌ skip | engine i18n: cs only |

**Rozhodnutí pro FÁZE C v1:** implementovat **pouze homepage** (8 sekcí). Podstránky `/sluzby`, `/cenik`, `/galerie`, `/o-nas`, `/akce`, `/faq` zaznamenat do `template.json:pages[]` jako stub (slug + title), ale s `sections: []` + komentář "v1.1 — homepage parity first". Tím se podstránky objeví v navbar + studio struktuře, dokončí se v dalším pass.

## Layout — sekce v pořadí (homepage)

Pořadí v originále: **header → hero → AKCE (promo) → REVIEWS → ABOUT → SERVICES (video+pricing table) → GALLERY → FOOTER**.
Skeleton `service-personal` má: header → hero → about → services → pricing → gallery → team → testimonials → cta → locations → faq → footer.

| Pos skel | Sekce | Originál má? | Pozice v origin. | Variant (Reuse/Extend/New) | Poznámka |
|---|---|---|---|---|---|
| 1 | Header | ✅ | 1 | navbar variant `barber-luxury-promo` (**Extend** z `barber-luxury`) | Přidat top-row: phone callto vlevo + Instagram + lang switcher (v engine pouze CZ; lang ikony skryté nebo nahrazené prázdným placeholderem). 8 nav linků (Služby, O nás, Akce, Ceník, FAQ, Blog, Galerie, Kontakty). Hamburger < 992px (Bootstrap col-lg breakpoint). |
| 2 | Hero | ✅ | 2 | hero variant `hero-barber-titleonly` (**Extend** z `hero-barber-luxury`) | Full-bleed image bg (warm golden lighting), **pouze title** `h1.title` bez subtitle/CTA/info bloku. Min-height ~80vh. Title centered, serif uppercase. |
| — extra | **Promo (Akce)** | ✅ | 3 | `extraSections[]` → variant `promo-2cards` (**New**) | 2-col grid (col-lg-6 × 2): každá karta má bg-image + bullets list (`<ul>`) + descr. Zachovat layout 2 karet vedle sebe na desktopu. Pod 992px → 1 sloupec. |
| 8 | Testimonials | ✅ (Reviews) | 4 | testimonials variant `testimonials-cards-3col` (**Reuse** nebo Extend) | Originál používá Elfsight widget (Google reviews iframe) — **NEPOUŽÍT externí widget** v engine. Nahradit 5–6 inline demo recenzí (cards layout: avatar iniciály + jméno + 5★ + text). Title "Recenze". |
| 3 | About | ✅ | 5 | about variant `about-barber-2col-cta` (**Extend** z `about-barber-luxury`) | 2-col grid: text vlevo (title "O nás" + 2 odstavce + button "více o nás" `btn--3`), image vpravo. Pod 768px → 1 sloupec. |
| 4+5 | Services + Pricing (combo) | ✅ | 6 | **New** kombo variant `services-video-pricing-table` (varianta `pricing` v engine) | 2-col grid: vlevo video (poster + mp4/webm fallback) + title "O salónu", vpravo pricing TABLE (4 sloupce: Služba / Junior / Barber·ProBarber / Head·Top Barber). Mobile: stack 1-col, table scrollable horizontally. **Zde sloučím skeleton pos 4 (Services) + pos 5 (Pricing) do jedné sekce** — originál to má sloučené. Sekci dát type `pricing` s variant `pricing-services-table-video` (engine smí pricing-* prefix). |
| 6 | Gallery | ✅ | 7 | gallery variant `four-col-lightbox` (**Reuse** z barber-02 `four-col` + Extend lightbox) | 4-col grid (col-lg-3), aspect-ratio 1:1, gap ≈ 8–12px. 8 nebo 12 fotek. Lightbox přes shared `GalleryLightbox`. Pod 992px → 2 sloupce. Title "Galerie" + secondary CTA "Zobrazit vše" → vede na `/galerie/`. |
| 7 | Team | ❌ SKIP | — | — | Originál nemá team sekci. |
| 9 | Booking/CTA | ❌ SKIP | — | — | Žádná samostatná booking sekce. Phone callto v headeru funguje jako primary CTA. |
| 10 | Locations | ❌ SKIP samostatně | — | — implementováno ve footeru | Jediná pobočka — adresa + mapa jsou ve footeru. |
| 11 | FAQ | ❌ SKIP (homepage) | — | — | Originál má jen `/faq/` subpage, ne homepage. Defer na v1.1. |
| 12 | Footer | ✅ | 8 | footer variant `footer-map-contact` (**Extend** z `barber-luxury`) | 2-col grid: vlevo Google Maps iframe (col-lg-9), vpravo "Kontakty" widget s adresou + otevírací dobou (col-lg-3). Pod 992px → stack (kontakty první, mapa pod). Pod mapou: legal řádek + social. |

**Pořadí v `template.json:pages[home].sections[]`:**
`[navbar, hero, promo, testimonials, about, pricing(services+table+video), gallery, footer]` — 8 sekcí.

**`sectionOrderNote`:** "Pořadí originálu (hero → promo → reviews → about → services+pricing → gallery) se liší od skeletonu service-personal (about → services → pricing → gallery → testimonials). Pro 1:1 vizuální paritu s `/preview` priorita > skeleton order — viz `the-barber/barber-02` precedent."

**`extraSections[]`:**
```json
[{ "pos": 3, "name": "Promo (Akce)", "type": "promo", "variant": "promo-2cards", "reason": "originál má dvojici akčních karet hned za hero" }]
```

**`skippedSections[]`:**
```json
[
  { "pos": 7,  "name": "Team",         "reason": "originál nemá team sekci" },
  { "pos": 9,  "name": "Booking/CTA",  "reason": "phone callto v headeru je primární CTA, samostatná booking sekce neexistuje" },
  { "pos": 10, "name": "Locations",    "reason": "jediná pobočka — mapa + adresa ve footeru" },
  { "pos": 11, "name": "FAQ",          "reason": "/faq/ je samostatná podstránka, na homepage chybí; implementace v1.1" }
]
```

## Vizuální identita

### Fonty

| Role | Font | Váhy | Poznámka |
|------|------|------|----------|
| Display (h1, section-title) | **Cormorant Garamond** nebo **Playfair Display** (serif) — k ověření z `styles.min.css` na clone | 400, 600, 700 | uppercase v titlech, letter-spacing ≈ .08–.15em |
| Body | **Inter** / **Roboto** (sans-serif) | 300, 400, 600 | běžný text, tlačítka |

Engine ponechá fonty self-hosted v `public/templates/barber-03/fonts/` (Google Fonts WOFF2, `font-display: swap`). Pokud `styles.min.css` originálu používá konkrétní fonty (Playfair, Cormorant), engine je převezme; jinak fallback na stejné jako barber-02 (Libre Baskerville + Source Sans Pro) s mírně teplejším laděním.

### Barvy (extrahovat z `barbershopurban.cz/assets/templates/barbershop/css/styles.min.css`; preview.tsx zaznamenal `color: #1c1410, accent: #c8a96e`)

| Token | Hodnota | Použití |
|-------|---------|---------|
| `primary` (gold accent) | `#c8a96e` | titles, prices, hover, buttons accent |
| `primary-dark` | `#a98a55` | hover na gold linkech |
| `background-dark-1` | `#1c1410` | hero overlay, footer bg, pricing bg |
| `background-dark-2` | `#0f0a07` | deeper sections |
| `background-cream` | `#f7f3ec` | about / promo light bg (pokud existuje) |
| `text-light` | `#fff` | hero, header, footer |
| `text-muted-light` | `rgba(255,255,255,.65)` | footer adresa, hodiny |
| `text-body-dark` | `#1c1410` | body text na cream pozadí |

### Button styl (`.btn--3`)

- Border: `1.5px solid #c8a96e`, hover `background: rgba(200,169,110,.12)`
- Padding: `12px 28px`
- Font: Source Sans Pro / Inter 12–13px, uppercase, letter-spacing .15em
- Border-radius: `2px` (téměř ostré rohy, ne pill jako barber-02)
- Color: `#c8a96e` na dark bg; `#1c1410` na light bg

### Spacing personality

**Vzdušné, ale strukturované** — sekce `padding: 80–100px 0`. Hero ~80vh. Promo karty s `padding: 60px 30px`. Pricing table má těsnější `padding: 16px` na buňku. Gallery gap ≈ 8–12px (mírně širší než the-barber).

### Shadows / radius

- Promo karta: subtle `box-shadow: 0 8px 24px rgba(0,0,0,.35)` (přes gradient overlay)
- Gallery image: bez shadow, jen hover `scale(1.04)` + overlay
- Border-radius: 2–4px (decentní), pricing table buňky 0px

### Atmosféra

**Luxusní + warm + tradiční** — teplé golden lighting (visible na hero/about images), kožená černá, mosaz/gold. Vibe podobný NYC speakeasy s dramatic warm tones (víc warm než `barber-02` — ten je víc cool/cream).

## UX patterny

- **Navigation:** sticky/fixed header, transparent přes hero, plain solid dark `#1c1410` při scrollu mimo hero. Top-row (callto + IG + lang) + main-row (logo + 8 nav linků). Hamburger pod 992px (Bootstrap `col-lg`).
- **Hero CTA:** **žádné** — pouze title. (Defekt — viz oprava níže: ponechat původní strukturu, NEPŘIDÁVAT CTA bez explicitního důvodu v defektech.)
- **Promo karty (Akce):** 2 bg-image karty s `ul` bullets + popisek. Nejsou klikatelné v originále.
- **Reviews:** Elfsight Google Reviews widget (iframe load) → **v engine nahradit inline cards**.
- **Services (video):** HTML5 video s mp4+webm fallback, poster image, controls. **V engine použít demo video poster** (placeholder 1200×675), bez reálných mp4/webm souborů (vypnuto controls=false, nebo nahrát demo loop). Default: poster only, video off.
- **Pricing table:** 4-col table (Služba + 3 cenové úrovně). Mobile: horizontal scroll nebo stack do 4-row cards.
- **Gallery:** Fancybox lightbox → shared `GalleryLightbox`.
- **Footer mapa:** Google Maps iframe → v engine **statický mapový placeholder** (PNG) nebo demo `<iframe>` s neutrální Prahou (centrum, ne reálná Hartigova adresa). Preferuju statický placeholder PNG s pinem, kvůli žádné externí závislosti.
- **Phone link:** `callto:` → standardní `tel:+420704123456` v engine.
- **Social:** Instagram only (originál nemá FB).

## Demo data — originál → demo (kompletní mapping)

| Originální hodnota | Kde se vyskytuje | Demo hodnota |
|--------------------|------------------|--------------|
| `Barbershop URBAN`, `URBAN`, `Barber Urban` | header logo, title, footer, alt textech, og:title | `Studio Břitva` |
| `Barbershop Praha pánský střih - Barbershop URBAN` | `<title>` meta | `Pánský střih v centru Prahy — Studio Břitva` |
| `Profesionální barbershop v Praze 3` | meta description | `Pánský barbershop v centru Prahy — řemeslný střih a tradiční holení.` |
| `+420 773 096 906`, `callto:+420773096906` | header phone, footer | `+420 704 123 456`, `tel:+420704123456` |
| `Hartigova 151/24, Praha 3, 130 00` | footer adresa | `Ukázková 123, 110 00 Praha 1` |
| Google Maps embed (GPS `50.0872, 14.4534`, lokace "Barbershop URBAN") | footer mapa | statický mapový placeholder PNG `public/templates/barber-03/images/map-placeholder.png` (1200×600) s pinem na neutrální Praha 1 centrum, NEBO embed mapa s adresou `Ukázková 123, Praha` (= centrum, fake pin) |
| `https://www.instagram.com/barbershop_urban_prague/` | header IG ikon, footer | `https://instagram.com/demo` |
| Lang URL `/en/`, `/ru/`, `/uk/` + ikony `lang_en.png`, `lang_ru.png`, `lang_uk.png` | top-row header | **odstranit** — engine i18n: cs only. Ikony mimo grid, ne lang-switcher row. |
| Hero title `Nejlepší místo pro pánský střih` | hero h1 | **přepsat na neutrální demo** → `Pánský střih jako tradiční řemeslo` (vlastní formulace, neutrální barbershop tone) |
| About lead `Skvělý účes je vizitkou každého muže...` (1. odstavec) | about | viz "Demo About copy" níže |
| About body `V našem barber shopu najdete talentované barbery...` (2. odstavec) | about | viz níže |
| `O salónu Urban` (services title vlevo) | services | `O salónu Břitva` |
| `Holičské služby v Praze` (services title vpravo) | services | `Holičské služby` |
| Pricing column header `Junior Barber` | pricing table | `Junior` (zachováno generické) |
| Pricing column header `Barber / Pro Barber` | pricing table | `Barber / Pro` |
| Pricing column header `Head barber / Top barber` | pricing table | `Senior / Top` |
| `Klasické stříhání 500/659/699/800 CZK` | pricing | `Klasický střih 400/550/600/700 Kč` (−15 až −20 %, zaokr. 50 Kč) |
| `Klasické stříhání + úprava vousů 600/879/949/1050` | pricing | `Střih + úprava vousů 500/750/800/900 Kč` (−17 % průměr) |
| `Stříhání dlouhých vlasů 500/769/799/900` | pricing | `Střih dlouhých vlasů 400/650/700/800 Kč` |
| `Tradiční holení Hot Towel 549/589/650` | pricing | `Holení horkým ručníkem 450/500/550 Kč` (−18 %) |
| `Stříhání pro dítě 400/459/500` | pricing | `Dětský střih (5–12 let) 350/400/450 Kč` |
| (zbytek řádků pricing — vyplnit obdobně −15 až −25 %) | pricing | viz `content/cs.json` při buildu |
| Promo karta 1 `Alkoholický nápoj / KAVA / VODA — Ke každé službě, kterou nabízíme` | promo (akce) | `Káva / Voda / Drink — Ke každé objednané službě` (vlastní wording, bez explicitního alkoholu) |
| Promo karta 2 `DÁREK — každá 5. návštěva` | promo | `Dárek — každá 5. návštěva` (zachovat koncept; vlastní wording) |
| Logo `logo-1.png` (z `barbershopurban.cz`) | header, footer | demo SVG `public/templates/barber-03/logo.svg` (wordmark "BŘITVA" + decorativní break/svg ornament, gold `#c8a96e` na transparent) |
| Hero image (warm golden barbershop) | hero bg | demo placeholder `hero.{webp,jpg}` (1920×1280, warm dark interiér holičství s vyhřátým světlem — generic) |
| About image | about | demo placeholder `about.{webp,jpg}` (1200×900) |
| Gallery 8–12× JPG (`img_4880.jpg`, `img_4868.jpg`, atd.) | gallery | demo placeholdery `gallery-{01-08}.{webp,jpg}` (1000×1000, neutrální barbershop scény) |
| Promo karta bg images (`img-akce-2.jpg`, `img-akce-3.jpg`) | promo | demo placeholdery `promo-{01,02}.{webp,jpg}` (800×600 each, warm dark) |
| Services video (`barber-1.mp4` + `barber-1.webm` + poster `hero2.jpg`) | services | demo poster `services-video-poster.{webp,jpg}` (1200×675); video src **prázdné nebo placeholder** (engine: poster-only s play tlačítkem disabled) |
| Reviews — **Elfsight widget** (Google reviews import) | reviews | 5 inline demo cards: Jan Novák, Petra Svobodová, Tomáš Dvořák, Eva Procházková, Martin Černý — každá 4–5 vět, 5★, datum (relativní typu "před 2 měsíci") |
| `Po - Pá: 09:00 - 19:00, So: 10:00 - 19:00, Ne: 10:00 - 19:00` | footer kontakty | `Po–Pá 9:00–18:00, So 9:00–14:00` (jednotná demo hodinová tabulka; **bez neděle** — soulad s demo standardem) |
| `Design Online Studio` (copyright footer) | footer | odstranit / nahradit `© Studio Břitva s.r.o.` |
| `design-online.cz` link | footer copyright | `https://demo.cz` |
| `https://barbershopurban.cz/assets/files/zasady-ochrany-osobnich-udaju.pdf` | footer GDPR link | `/gdpr` (interní stub stránka nebo `#gdpr` anchor) |
| og:url, canonical `venom-saas.vercel.app/demo/fade-room-demo` | meta | `http://localhost:3015/demo/barber-03-v2` |

### Demo About copy (vlastní text, ne překlad originálu)

**1. odstavec:**
> Pánská péče je řemeslo. Ve Studiu Břitva věnujeme každému zákazníkovi tolik času, kolik si zaslouží — bez spěchu, s důrazem na detail a tradiční techniky.

**2. odstavec:**
> Tým holičů, kteří chápou, že střih není jen účes, ale součást vašeho stylu. Pracujeme s klasickými břitvami, horkým ručníkem a kvalitní kosmetikou. Atmosféra teplých tónů, dřeva a kůže vám dovolí na chvíli vypnout.

### Demo testimonials (inline místo Elfsight widgetu)

1. **Jan Novák** ★★★★★ — "Profesionální přístup od první návštěvy. Holení horkým ručníkem je rituál sám o sobě. Doporučuji každému." (před 1 měsícem)
2. **Petra Svobodová** ★★★★★ — "Manželovi tady stříhají vlasy už druhý rok a vždy odchází spokojený. Atmosféra je výborná." (před 2 měsíci)
3. **Tomáš Dvořák** ★★★★★ — "Klasický střih + úprava vousů — přesně to, co jsem hledal. Tým rozumí řemeslu." (před 2 týdny)
4. **Eva Procházková** ★★★★★ — "Brala jsem syna na první dětský střih. Trpěliví, přátelští, profesionální. Hned jsme se objednali zpátky." (před 3 měsíci)
5. **Martin Černý** ★★★★★ — "Konečně místo, kde se vyznají v dlouhých vlasech. Předtím to byla loterie." (před 1 měsícem)

### Demo legal blok (patička)

> `Studio Břitva s.r.o.` · IČO `12345678` · DIČ `CZ12345678` · `Ukázková 123, 110 00 Praha 1` · `info@demo.cz` · [GDPR](#gdpr)

Font Source Sans Pro 12px, `rgba(255,255,255,.4)`, center-aligned, border-top 1px solid `rgba(255,255,255,.08)`, padding-top 24px.

## Defekty originálu k opravě

```
Homepage:
- REVIEWS sekce = externí Elfsight widget (third-party script + iframe) → NESMÍ být v engine
  → REPLACE inline shared TestimonialsSection (variant testimonials-cards-3col) s 5 demo recenzemi.
  Důvod: external dependency, nevidíme v statickém HTML auditu, není editovatelné v Live Editoru,
  porušuje SEO_PERFORMANCE_CHECKLIST (render-blocking script).

- SERVICES VIDEO = externí mp4/webm z barbershopurban.cz (~MB) + autoplay-capable
  → REPLACE demo poster image (1200×675 WebP), video src "" nebo placeholder MP4 ≤200KB.
  Důvod: ne náš asset, perf hit, autoplay potenciál.

- HERO bez CTA — title-only — nepřidávat. Zachovat původní minimalismus.
  POZN: Není to defekt, je to úmyslná stylová volba (luxusní vibe). NESAHAT.

- LANG SWITCHER v header top-row (CZ/EN/UA/RU 4 ikonky) — engine i18n: cs only
  → ODSTRANIT lang ikony z navbar markup. Top-row bude jen phone + IG.
  Důvod: i18n není scope, ikony by byly mrtvé linky.

- GOOGLE MAPS iframe ve footeru s reálnou GPS lokací Hartigova 151/24
  → REPLACE statickým mapovým placeholderem (PNG 1200×600 s pinem na neutrální Praha 1)
  NEBO embed s adresou "Ukázková 123, Praha" (centrum, fake pin).
  Doporučení: statický PNG = zero third-party, lighthouse friendly.

- PRICING TABLE má pro Junior Barber u "Holení Hot Towel" hodnotu `-----CZK` (prázdné)
  → V engine vyplnit `—` (em-dash) nebo `nedostupné`. Konzistence.

- TABULKA na mobilu < 768px přetéká přes viewport
  → V engine: horizontal scroll wrapper s `overflow-x:auto` NEBO stack do 4-card layout per řádek.
  Pravidlo: zachovat tabulku na desktopu, na mobilu stack.

- FANCYBOX lightbox (jQuery dep) → shared GalleryLightbox (React).

- COPYRIGHT footer "Design Online Studio" link na design-online.cz
  → ODSTRANIT, nahradit "© Studio Břitva s.r.o." + link na demo.cz.

/sluzby, /o-nas, /akce, /cenik, /faq, /blog, /galerie:
- Mimo scope homepage v1. V template.json jako pages[] stubs (sections: []) s komentářem "v1.1".
  Studio uvidí, že stránky existují, navbar je nalinkuje, ale render bude prázdný shell.
```

## Risks & pasti

- **Externí CSS závislost:** clone `/preview/demo/fade-room-demo` načítá `https://barbershopurban.cz/assets/templates/barbershop/css/styles.min.css`. Engine **NESMÍ** mít externí CSS dependency — všechny tokeny + layouty v `skin.css` + theme.json + shared engine sekcích.
- **Externí asset paths (`https://barbershopurban.cz/assets/...`):** žádný engine asset nesmí mít originální doménu. Všechny obrázky/fonty self-hosted v `public/templates/barber-03/`.
- **Pricing table = 5 kategorií × 4 sloupce + 5–6 řádků** — neumí Engine `pricing` variant `pricing-cols` (3-col cards z barber-02). Potřebuje **novou variantu** `pricing-table-grid` (table layout) v shared engine. Plán: rozšířit `src/sections/registry.ts` o `pricing/pricing-table-grid` + content shape `{ columns: [], rows: [{ service, prices: [] }], notes: [] }`. Validátor pak najde variant.
- **Promo (extraSection)** — `promo` type možná v engine neexistuje. Plán: přidat do `SECTION_RENDERERS` + `SECTION_VARIANTS` shared engine variant `promo/promo-2cards`. Content shape `{ cards: [{ bgImage, bullets[], desc }] }`.
- **Services + Pricing kombo** — skeleton dovoluje obě sekce samostatně, originál to má jako 1 sekci (2-col). Mám 2 možnosti:
  - **(A)** Implementovat jako 1 sekci `pricing` s variant `pricing-services-table-video` (video vlevo + tabulka vpravo). Skeleton compliance: skip `services`, použij `pricing`. Doporučeno.
  - **(B)** Rozdělit do 2 samostatných sekcí (services s video + pricing s table). Porušuje 1:1 paritu (originál to nemá rozdělené).
  - **Volba: (A).** Skeleton catalog dovoluje pricing variant; sekce 4 (Services) → SKIP s důvodem "služby v pricing-services-table-video".
- **Reviews — Elfsight widget** = nutné nahradit. Pokud bych ho ponechal jako embed, porušuji 7 standardů (LIVE_EDITOR — needitovatelné, SEO — render-blocking, COMPONENT_ARCHITECTURE — external dep).
- **Footer mapa** = totéž — externí Google Maps iframe → statický placeholder.
- **Bootstrap grid (col-lg-X)** v originále — engine používá vlastní grid utility v `skin.css`. Mapping: col-lg-3 = ~25%, col-lg-6 = ~50%, col-lg-9 = ~75%, breakpoint 992px.
- **Multi-jazyk top header** — odstranit lang ikony, top-row obsahuje jen phone callto + IG.
- **Image sizes/PageSpeed** — gallery 8–12 fotek po 1000×1000 (~ 200KB WebP each). Hero 1920×1280 (~ 400KB WebP). Plán: build-time WebP + JPG fallback.
- **Defaultní jQuery** v originále (Fancybox, slider) — engine je čistě React, žádný jQuery.

## Plán implementace pro FÁZE C (skeleton sequence)

Závazné pořadí dle `docs/SECTION_WORKFLOW.md` — jedna sekce per iterace, 6 mikro-fází per sekci:

```
Krok 1   Sekce 1   Header (navbar)         BUILD → DIFF → DEMO → STUDIO → PARITY → COMMIT
Krok 2   Sekce 2   Hero (title-only)       BUILD → DIFF → DEMO → STUDIO → autonom → COMMIT
Krok 3   Sekce 3   Promo (Akce, extra)     BUILD → DIFF → DEMO → STUDIO → autonom → COMMIT
Krok 4   Sekce 4   Testimonials (Reviews)  BUILD → DIFF → DEMO → STUDIO → autonom → COMMIT
Krok 5   Sekce 5   About                   BUILD → DIFF → DEMO → STUDIO → autonom → COMMIT
Krok 6   Sekce 6   Pricing (services+table+video combo) BUILD → DIFF → DEMO → STUDIO → autonom → COMMIT
Krok 7   Sekce 7   Gallery                 BUILD → DIFF → DEMO → STUDIO → autonom → COMMIT
Krok 8   Sekce 8   Footer                  BUILD → DIFF → DEMO → STUDIO → PARITY → COMMIT
```

### Pre-flight shared engine extensions (před BUILDem sekcí, kde chybí variant)

| Co přidat | Kam | Kdy |
|-----------|-----|-----|
| `pricing/pricing-table-grid` (table layout) variant | `src/sections/variants.ts` + `src/sections/pricing/` renderer | Před Krokem 6 (Pricing) |
| `promo/promo-2cards` (extra section) | `SECTION_RENDERERS` + `SECTION_VARIANTS` | Před Krokem 3 (Promo) |
| `testimonials/testimonials-cards-3col` (pokud neexistuje) | ditto | Před Krokem 4 — POZN: barber-02 zatím testimonials neimplementoval, takže pravděpodobně chybí |
| `navbar/barber-luxury-promo` (Extend `barber-luxury` o top-row) | variants.ts | Před Krokem 1 (Header) |
| `hero/hero-barber-titleonly` (Extend luxury, no subtitle/CTA) | variants.ts | Před Krokem 2 |

Každé rozšíření = malý commit do `src/sections/` (shared engine), pak teprve template manifest.

### Final validation (po Krok 8)

```bash
pnpm validate:template barber-03           # skeleton + manifest + content keys
pnpm build                                  # TypeScript + Next.js webpack build
pnpm typecheck                              # tsc --noEmit

curl -s http://localhost:3015/demo/barber-03-v2 > /tmp/barber-03-final.html
grep -F 'barbershopurban.cz'  /tmp/barber-03-final.html   # 0
grep -F 'Barbershop URBAN'    /tmp/barber-03-final.html   # 0
grep -F '773 096 906'          /tmp/barber-03-final.html   # 0
grep -F 'Hartigova'            /tmp/barber-03-final.html   # 0
grep -F 'elfsight'             /tmp/barber-03-final.html   # 0
grep -F 'design-online'        /tmp/barber-03-final.html   # 0
grep -F '704 123 456'          /tmp/barber-03-final.html   # ≥1
grep -F '@demo.cz'             /tmp/barber-03-final.html   # ≥1

grep -rE '@[a-z0-9.-]+\.(cz|com|sk|eu)' src/templates/barber-03/ public/templates/barber-03/ \
  | grep -v 'demo.cz' | grep -v README                     # 0
grep -rE '\+?420 ?[0-9]{3} ?[0-9]{3} ?[0-9]{3}' src/templates/barber-03/ public/templates/barber-03/ \
  | grep -vE '704 ?123 ?456|704 ?654 ?321'                  # 0
```

## Závazný checklist FÁZE C

- [ ] Pre-flight: shared engine variants přidané (pricing-table-grid, promo-2cards, testimonials-cards-3col, navbar-luxury-promo, hero-titleonly)
- [ ] Sekce 1 Header — diff PASS / studio PASS / demo PASS / commit + **PARITY hlas uživateli**
- [ ] Sekce 2 Hero
- [ ] Sekce 3 Promo (Akce)
- [ ] Sekce 4 Testimonials (Reviews)
- [ ] Sekce 5 About
- [ ] Sekce 6 Pricing (services+table+video combo)
- [ ] Sekce 7 Gallery
- [ ] Sekce 8 Footer — diff PASS / studio PASS / demo PASS / commit + **PARITY hlas uživateli**
- [ ] Final: `pnpm validate:template barber-03`
- [ ] Final: `pnpm build`
- [ ] Final: grep audit (`barbershopurban.cz`, `Barbershop URBAN`, `773 096 906`, `Hartigova`, `elfsight`, `design-online` = 0 výskytů)
- [ ] Final: `/preview-2` karta viditelná, link na `/demo/barber-03-v2` funguje
- [ ] Final: `/demo/fade-room-demo` (clone) nezměněn — sanity check

## Status

`DONE` — 2026-05-28
- Engine slug: `barber-03` (Studio Břitva)
- Tenant: `barber-03-v2` → http://localhost:3015/demo/barber-03-v2
- Validator: PASS s 2 warnings (sectionOrderNote akceptován; pricing missing "services" key — combo)
- Demo audit: 0 originálních hodnot; 9 výskytů "Studio Břitva", 4× "704 123 456", 3× "info@demo.cz"
- 8 sekcí committed atomicky (sections 1–8)
- Clone tenant `fade-room-demo` nezměněn (READ-ONLY ✅)
