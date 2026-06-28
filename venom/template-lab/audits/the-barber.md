# Audit šablony: the-barber

## Identifikace

| Pole | Hodnota |
|------|---------|
| Original slug (queue id 2) | `the-barber` |
| Original název firmy | The Barber |
| Originální doména | `thebarber.cz` |
| Kategorie (z queue) | Barbershop |
| **Skeleton** | `service-personal` |
| **Engine slug** | `barber-02` |
| **Engine tenant slug** | `barber-02-v2` |
| **Demo název** | Holičství Atelier |
| **s.r.o. forma** | Holičství Atelier s.r.o. |
| Předchozí DONE šablona stejné kategorie | `peak-cut` (barber-01 retro), `barber-01` (legacy) |
| URL na `/preview` kartu | `http://localhost:3015/preview` (slug: `the-barber-demo`) |
| URL na `/demo/the-barber-demo` (clone) | `http://localhost:3015/demo/the-barber-demo` |
| Zdrojový mirror | `public/clones/the-barber/` + `/tmp/the-barber-home.html` (mirror-the-barber-assets.mjs) |
| Mirror HTML velikost | 9810 znaků, 163 řádků |
| Mirror CSS velikost | 206 řádků, jeden soubor `css/style.css` |
| Mirror fonty | Source Sans Pro (300/400/700) + Libre Baskerville (400/700/400i) — WOFF2, lokálně v `fonts/` |

## Identifikované podstránky originálu

Originál byl scrapnut jako **single-page** (jen home s anchor sekcemi `#onas-cs`, `#galerie-cs`, `#cenik-cs`). Mirror nestáhl žádné podstránky. Skript `mirror-the-barber-assets.mjs` v ROOTu generuje pouze homepage.

| Slug | Název | Sekce v pořadí | Implementovat? | Důvod |
|------|-------|----------------|----------------|-------|
| `/` | Homepage | header, hero, about, gallery, pricing, footer | ✅ | povinné |

**Žádné podstránky.** Originál `thebarber.cz` má single-page architekturu — vše na homepage s anchor navigací.

## Layout — sekce v pořadí (homepage)

⚠️ **POZOR — pořadí v originále vs. skeleton:**
- **Skeleton `service-personal`** doporučuje: `Services (4) → Pricing (5) → Gallery (6)`
- **Originál the-barber** má: `About → Gallery → Pricing` (gallery PŘED pricing)
- **Rozhodnutí:** Pro **1:1 parity** (user requirement) následuji pořadí originálu. Skeleton pořadí poslouží jako referenční katalog dovolených section types, ne jako vynucené pořadí. **Otázka pro update SKELETONS.md:** přidat výjimku — visual parity > skeleton order.

| Skeleton pos | Sekce | Originál má? | Pozice v originále | Variant (Reuse/Extend/New) | Poznámka |
|---|----------------|--------------|--------------------|----------------------------|----------|
| 1 | Header | ✅ | 1 | navbar variant `barber-transparent-fixed` (Extend nebo Reuse z barber-01) | Fixed/sticky, transparent s gradient overlay přes hero, logo vlevo (90px), 3 nav linky (O nás, Galerie, Ceník), hamburger < 600px |
| 2 | Hero | ✅ | 2 | hero variant `barber-fullbleed-overlay` (Reuse z barber-01) | Full-bleed image bg + dark gradient overlay (0.2→0.55→0.75), centered title (Libre Baskerville, .18em letter-spacing, uppercase, 3-6rem), subtitle, button rezervace (ghost outline, pill radius 50px, uppercase .2em), info blok (hodiny + adresa), scroll indicator (animated bounce). min-height 100vh. |
| 3 | About | ✅ | 3 | about variant `barber-split-cream` (Extend) | 2-col grid (text vlevo, fotka vpravo), bg #f9f7f5, italic lead v `#9a7a50` (Libre Baskerville, italic), body text font-weight 300, max-width 1100px, gap 80px. Pod 900px → 1 sloupec. |
| 4 | Services | ❌ SKIP | — | — | Originál NEMÁ samostatnou services sekci — služby jsou v pricing. Zaznamenat do `manifest.skippedSections[]`. |
| 5 | Pricing | ✅ | 5 (po gallery) | pricing variant `barber-dark-3col-gold` (Extend) | 3-col grid (STŘIH / HOLENÍ / KOMPLETNÍ PÉČE), dark bg s image+overlay (.75), titles Libre Baskerville uppercase v gold `#d4a96e`, list flex justify-between border-bottom rgba(255,255,255,.08). Pod 900px → 1 sloupec. |
| 6 | Gallery | ✅ | 4 (před pricing!) | gallery variant `barber-grid-tight` (Extend) | 4×3 grid (12 fotek), gap 3px, aspect-ratio 1:1, bg #1a1a1a, hover scale(1.04). Pod 900px → 3 sloupce, pod 600px → 2 sloupce. |
| 7 | Team | ❌ SKIP | — | — | Originál nemá tým — žádný seznam barberů. |
| 8 | Testimonials | ❌ SKIP | — | — | Originál nemá recenze. |
| 9 | Booking/CTA | ❌ SKIP | — | — | CTA "REZERVOVAT" je v hero, samostatná booking sekce neexistuje. |
| 10 | Locations | ❌ SKIP | — | — | Jediná pobočka — adresa v hero info + footer. Žádná samostatná locations sekce. |
| 11 | FAQ | ❌ SKIP | — | — | Originál nemá FAQ. |
| 12 | Footer | ✅ | 6 | footer variant `barber-dark-2col-hours` (Extend) | 2-col grid (logo+adresa+telefon+email+social vlevo, hodiny vpravo), bg #111, color rgba(255,255,255,.65), gold accent `#d4a96e` na hover linkech a hodinách. Tabulka otevírací doby. Pod 900px → 1 sloupec. |

**Pořadí v `template.json:pages[home].sections[]`:** `[navbar, hero, about, gallery, pricing, footer]` (6 sekcí, 6 SKIP zaznamenaných).

## Vizuální identita

### Fonty

| Role | Font | Váhy | Letter-spacing |
|------|------|------|----------------|
| Display (hero title, pricing title, footer hours title, about lead) | **Libre Baskerville** (serif) | 400, 400 italic, 700 | .10em – .18em uppercase |
| Body (navbar, button, hero info, about body, pricing list, footer) | **Source Sans Pro** (sans-serif) | 300, 400, 700 | .05em – .20em selektivně |

Oba fonty servované lokálně z `/clones/the-barber/fonts/` (WOFF2, `font-display:swap`). Engine musí použít stejné fonty (nahrát do `public/templates/barber-02/fonts/` nebo namapovat na shared font assets).

### Barvy (extrahované HEX)

| Token | Hodnota | Použití |
|-------|---------|---------|
| `primary` (gold accent) | `#d4a96e` | pricing title, pricing price, footer hover/hours, decorative |
| `primary-dark` | `#b89060` | pricing subtitle |
| `accent` (italic lead) | `#9a7a50` | about lead text (italic) |
| `background-cream` | `#f9f7f5` | about section bg |
| `background-dark-1` | `#1a1a1a` | gallery bg, body text color |
| `background-dark-2` | `#111` | footer bg |
| `background-pricing-overlay` | `rgba(10,8,6,.75)` | pricing image overlay |
| `text-body` | `#444` (about body), `#1a1a1a` (default) | |
| `text-light` | `#fff` | hero, header |
| `text-muted-light` | `rgba(255,255,255,.65)`, `.85`, `.55`, `.5` | footer, hero info, pricing |

### Button styl

- Border: `1.5px solid rgba(255,255,255,.8)`
- Color: `#fff`, hover `background:rgba(255,255,255,.15)`
- Padding: `14px 36px`
- Font: Source Sans Pro 12px, letter-spacing `.2em`, uppercase
- Border-radius: `50px` (pill)
- Transition: `background .25s, border-color .25s`

### Spacing personality

**Vzdušné** — sekce `padding: 100px 40px` desktop, `60px 24px` mobile. Hero min-height 100vh. About grid gap 80px. Pricing grid gap 60px. Footer grid gap 60px. Gallery záměrně bez gap (3px), aby vytvořila kontinuální mosaic.

### Atmosféra

**Luxusní + tradičná** — tmavé tóny (gallery+pricing+footer), gold accent, serifový display font (Libre Baskerville), upscale cream tóny v about sekci. Vibe podobný NYC speakeasy barber shopu — "rum, kožená křesla, krb".

## UX patterny

- **Navigation:** fixed/sticky se gradient transparent overlay přes hero (background: `linear-gradient(to bottom, rgba(0,0,0,.55) 0%, transparent 100%)`). Pod 600px → hamburger menu, full-screen overlay s `rgba(10,8,6,.97)`.
- **Hero CTA:** ghost outline button "REZERVOVAT" → externí link `welns.io/product/booking/...` (booking system). V engine verzi nahradit za `https://demo.cz/rezervace`.
- **Galerie:** statický grid, hover scale, **bez lightboxu** v originále. Reuse může přidat shared lightbox jako enhancement.
- **Slider/akordeon/animace:** žádné — pouze scroll bounce indicator a CSS hover transitions.
- **Forms:** **žádné** v originále. Žádný kontaktní formulář, žádná rezervace inline.

## Demo data — originál → demo (kompletní mapping)

| Originální hodnota | Kde se vyskytuje (sekce) | Demo hodnota |
|--------------------|--------------------------|--------------|
| `The Barber` (značka / title) | hero h1, header logo alt, footer logo alt, gallery alt, about alt | `Holičství Atelier` |
| `thebarber` (slug v ID) | `#thebarber-cs` anchor | `#atelier-cs` |
| `Jilská 452/22, Praha 1, 110 00` | hero info, footer | `Ukázková 123, 110 00 Praha 1` |
| `+420 774 352 600` | footer (tel link `tel:+420774352600`) | `+420 704 123 456` (tel `+420704123456`) |
| `info@demo.local` (už změněné v mirror seedu) | footer | `info@demo.cz` |
| `thebarberdemo` (sociální) | footer instagram + facebook URL | `demo` (facebook.com/demo, instagram.com/demo) |
| `https://www.welns.io/product/booking/WFRCHN000016004?bk_src=LI103` | hero CTA | `https://demo.cz/rezervace` (placeholder anchor `#rezervace`) |
| About lead (italic) | about | Přepsat (viz níže) |
| About body | about | Přepsat (viz níže) |
| `Po - Pá 10:00 - 19:00`, `So 11:00 - 17:00` | hero info, footer hours | `Po–Pá 9:00–18:00, So 9:00–14:00` (jednotná demo hodinová tabulka) |
| `1000 / 800 / 600 / 450 / 350 Kč` (STŘIH) | pricing | `850 / 700 / 500 / 400 / 300 Kč` (−15 až −25 %, zaokrouhleno na 50 Kč) |
| `550 / 550 / 550 Kč` (HOLENÍ) | pricing | `450 / 450 / 450 Kč` (−18 %) |
| `1550 / 1350 / 1150 / 1000 / 1100 Kč` (PÉČE) | pricing | `1300 / 1150 / 950 / 850 / 950 Kč` (−16 % průměr) |
| Pricing note: „Při návštěvě dostanete kávu a vodu." | pricing | „Ke každé službě podáváme čerstvou kávu a balenou vodu." (vlastní formulace) |
| Pricing note: „Navíc ještě rum nebo whiskey dle vlastního výběru." | pricing | „Ke kompletní péči nabízíme malý drink (rum nebo whisky)." (vlastní formulace) |
| Section title `STŘIH` | pricing | `STŘÍHÁNÍ` (neutrálnější) |
| Section title `HOLENÍ (Hot towel)` | pricing | `HOLENÍ (HORKÝ RUČNÍK)` |
| Section title `KOMPLETNÍ PÉČE` | pricing | `KOMBINOVANÁ PÉČE` |
| Logo image `/clones/the-barber/img/logo.png` | header, footer | demo SVG `public/templates/barber-02/logo.svg` (wordmark "ATELIER" + decorative line, gold #d4a96e na transparent) |
| Gallery 12× JPG | gallery | demo placeholder `public/templates/barber-02/images/gallery-{01-12}.{webp,jpg}` (1000×1000) — neutrální interiér/nástroje, žádné reálné foto |
| Hero image `/clones/the-barber/img/hero.jpg` | hero | demo placeholder `hero.{webp,jpg}` (1920×1280, tmavá atmosféra holičství) |
| About photo `/clones/the-barber/img/about.jpg` | about | demo placeholder `about.{webp,jpg}` (1200×900) |
| Pricing bg `/clones/the-barber/img/pricing-bg.jpg` | pricing | demo placeholder `pricing-bg.{webp,jpg}` (1920×1080, tmavé pozadí) |

### Demo About copy (vlastní text — nikoli překlad originálu)

**Lead (italic, Libre Baskerville):**
> Klasické holičství v centru Prahy s důrazem na řemeslné provedení každého střihu a holení.

**Body (Source Sans Pro 300):**
> Atelier vznikl ze společné vášně pro klasickou holičskou tradici a moderní pánskou péči. Pracujeme v intimním prostředí s vlastní atmosférou — koženými křesly, vinylovými deskami a klidem, který odlišuje rituál od běžného střihu. Každý zákazník dostává tolik času, kolik si zaslouží.

### Demo IČO / patička (legal blok)

V originále **žádný legal blok není** — footer obsahuje jen logo+kontakt+social+hours. Pro engine přidat **footnote-style legal řádek pod footer-inner** s:

> `Holičství Atelier s.r.o.` · IČO `12345678` · DIČ `CZ12345678` · `Ukázková 123, 110 00 Praha 1`

Font: Source Sans Pro 12px, color `rgba(255,255,255,.4)`, center-aligned, padding-top 32px, border-top 1px solid `rgba(255,255,255,.08)`.

## Defekty originálu k opravě

```
Homepage:
- Žádné hlavní defekty — clone je čistý a vizuálně konzistentní.
- POZN: Originál nemá Services/Team/Testimonials/FAQ — to NEJSOU defekty, je to úmyslně minimalistická šablona. SKIP v skeleton compliance je očekávaný.
- Drobné UX vylepšení: gallery hover scale .04 je decentní, OK ponechat.
- Pricing bg image: v engine udělat WebP variantu pro perf (originál JPG only).
- Hero CTA vede mimo doménu (welns.io booking) — v engine nahradit za interní rezervační stránku nebo anchor.
```

## Risks & pasti

- **Welns.io booking** — externí systém, engine použije placeholder anchor `#rezervace` nebo stránku `/rezervace`. Žádný third-party iframe.
- **Žádný JS framework** v originále — pouze 12 řádků inline JS pro hamburger toggle. Engine převede do React komponenty s `useState`.
- **Mobile gallery** — pod 900px 3 sloupce, pod 600px 2 sloupce. Engine musí zachovat tento responsive pattern (nikoli paušálně 2-col).
- **Anchor IDs** (`#thebarber-cs`, `#onas-cs`, `#galerie-cs`, `#cenik-cs`) — nahradit za neutrální (`#atelier-cs`, `#onas`, `#galerie`, `#cenik`). Nav linky updatovat odpovídajícím způsobem.
- **Font display swap** — fonty jsou WOFF2 s `font-display:swap`. Engine ponechat stejný `font-display: swap` v `@font-face`.
- **Sticky header transparent gradient** — když je hero pod headerem, header musí být `position:fixed` s gradient overlay. Při scrollu mimo hero by mohl header mít solid bg — originál to nemá (zůstává transparent), engine zachovat.
- **Hero `min-height:100vh`** — na malých mobilních zařízeních (notch / address bar) může selhat. Engine použít `min-height:100svh` jako fallback v `@supports`.

## Plán implementace pro FÁZI C (skeleton sequence)

Závazné pořadí dle SECTION_WORKFLOW.md — jedna sekce na iteraci, 6 mikro-fází per sekci:

```
Krok 1   Sekce 1   Header              BUILD → DIFF → DEMO → STUDIO → PARITY → COMMIT
Krok 2   Sekce 2   Hero                BUILD → DIFF → DEMO → STUDIO → PARITY → COMMIT
Krok 3   Sekce 3   About               BUILD → DIFF → DEMO → STUDIO → (skip parity, autonom) → COMMIT
Krok 4   Sekce 4   Gallery             (pořadí dle originálu: PŘED pricing!)
Krok 5   Sekce 5   Pricing
Krok 6   Sekce 6   Footer              BUILD → DIFF → DEMO → STUDIO → PARITY → COMMIT
```

SKIP sekce (zaznamenat v `template.json:skippedSections[]`):
```json
[
  { "pos": 4, "name": "Services",      "reason": "originál nemá samostatnou services sekci — služby v pricing" },
  { "pos": 7, "name": "Team",          "reason": "originál nemá team sekci" },
  { "pos": 8, "name": "Testimonials",  "reason": "originál nemá recenze" },
  { "pos": 9, "name": "Booking/CTA",   "reason": "CTA Rezervace je v hero, samostatná booking sekce neexistuje" },
  { "pos": 10, "name": "Locations",    "reason": "jediná pobočka, adresa v hero info + footer" },
  { "pos": 11, "name": "FAQ",          "reason": "originál nemá FAQ" }
]
```

**Otevřená otázka pro skeleton compliance:** Pořadí v originále (`About → Gallery → Pricing`) NEODPOVÍDÁ skeletonu (`About → Services → Pricing → Gallery`). Pro 1:1 parity je nutné použít pořadí originálu. Validátor je třeba upravit, aby skeleton bral jako **catalog dovolených section types**, ne jako vynucené pořadí. **Pravidlo k odsouhlasení uživatelem:** visual parity > skeleton order, pokud se originál liší.

## Závazný checklist FÁZE C

- [ ] Sekce 1 Header — diff PASS / studio PASS / demo PASS / commit
- [ ] Sekce 2 Hero
- [ ] Sekce 3 About
- [ ] Sekce 4 Gallery (PŘED pricing!)
- [ ] Sekce 5 Pricing
- [ ] Sekce 6 Footer
- [ ] Final: `pnpm validate:template barber-02`
- [ ] Final: `pnpm build`
- [ ] Final: grep audit (originální hodnoty = 0 výskytů)
- [ ] Final: `/preview-2` karta viditelná, link na `/demo/barber-02-v2` funguje
- [ ] Final: `/demo/the-barber-demo` (clone) nezměněn

## Status

`READY_FOR_PHASE_C`
