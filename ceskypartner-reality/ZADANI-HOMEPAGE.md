# ZADÁNÍ — Český Partner s.r.o. · Homepage prémiové realitní kanceláře

> **Pro implementátora (Opus):** Toto je kompletní A–Z návrh homepage. Referenční
> vzor je https://svoboda-williams.com — přebíráme **moderní pattern a úroveň
> zpracování, NE 1:1 kopii**. Vlastní brand, vlastní paleta, vlastní texty,
> vlastní fotografie/video (stock/placeholder). Žádný asset ani text z jejich webu.
> Cíl kvality: **awwwards-level** — mikrointerakce, typografická disciplína,
> velkorysý whitespace, žádný šablonovitý vzhled.

---

## 1. Brand

- **Název:** Český Partner s.r.o. (v logu „ČESKÝ PARTNER“, doprovodný řádek „Realitní kancelář“)
- **Positioning:** prémiová česká realitní kancelář — prodej, pronájem a investiční nemovitosti v ČR
- **Tone of voice:** sebevědomý, klidný, noblesní. Krátké věty. Žádné výprodejové fráze.

### Logo (SVG, vytvořit v kódu)
- Wordmark „ČESKÝ PARTNER" v brand fontu, semibold, letter-spacing ~0.18em,
  pod ním menší „REALITNÍ KANCELÁŘ" ve spacing ~0.35em.
- Monogram „ČP" pro favicon a mobilní header.
- Varianty: bílá (na hero/video), inkoustová (na světlém pozadí po scrollu).

## 2. Vizuální identita

### Paleta (vlastní — odlišná od reference)
| Token | Hex | Použití |
|---|---|---|
| `--ink` | `#14181A` | text, tmavé sekce, footer |
| `--paper` | `#FAF9F6` | hlavní pozadí (teplá off-white) |
| `--stone` | `#EDEAE3` | sekundární pozadí sekcí, karty |
| `--bronze` | `#A9885A` | akcent: linky, hover, ceny, aktivní stavy |
| `--bronze-deep` | `#8A6D43` | hover akcentu, gradient okraje |
| `--muted` | `#6E6A63` | popisky, meta text |
| `--line` | `rgba(20,24,26,.12)` | hairline bordery 1px |

Zásady: převážně světlý web (paper/stone), tmavé (`--ink`) jsou jen hero overlay,
jedna „statement" sekce a footer. Bronz používat střídmě — je to koření, ne barva pozadí.

### Typografie (awwwards úroveň)
Reference používá jediný custom grotesk ve 2 řezech — to je její typografický
podpis. Uděláme totéž s vlastním fontem:

- **Primární font: `Hanken Grotesk`** (Google Fonts, variable) — prémiový
  neo-grotesk, výborná čeština/diakritika. Používat **pouze váhy 400 a 600**
  (disciplína dvou řezů jako u reference).
- Headingy: weight 600, `letter-spacing: -0.02em`, `line-height: 1.05–1.15`.
- H1 hero: `clamp(2.6rem, 5.5vw, 4.5rem)`. Sekční H2: `clamp(1.9rem, 3vw, 2.75rem)`.
- Malé popisky/eyebrow: 400, uppercase, `letter-spacing: 0.22em`, 11–12px, barva `--muted`.
- Body: 400, 16–17px, `line-height: 1.65`.
- **Žádný druhý font.** Žádné dekorativní číslované markery typu /01 /02 /03.
- `font-display: swap`, self-host přes `next/font` (žádný FOUT skok).

### Micro-interakce (povinné, ale jemné)
- Hover na kartách: fotka `scale(1.05)` s `transition 0.8s cubic-bezier(0.22,1,0.36,1)`, titulek podtržení bronzovou linkou (animovaná `background-size`).
- Odkazy: bronzová underline slide-in zleva.
- Scroll reveal: `IntersectionObserver`, fade-up 24px, stagger 80ms, jednou (ne při každém scrollu). Respektovat `prefers-reduced-motion`.
- Tlačítka: outline 1px `--ink`, hover → vyplní se `--ink`, text `--paper` (300ms). Primární CTA: `--ink` pozadí → hover `--bronze-deep`.

## 3. Tech stack

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS** — samostatný projekt v této složce (`/Users/apple/DEV/CRM/ceskypartner-reality`), port 3010.
- Ikony: **Lucide**. Toasty: **sonner**. UI jazyk: **čeština**.
- Slidery: **Embla Carousel** (lehký, bez jQuery vzhledu) — volný drag + šipky.
- Data nemovitostí: mock JSON (`/data/listings.ts`) — 8–12 realistických záznamů na kategorii (název, lokalita, dispozice, m², cena, 1 foto). Fotky: Unsplash (interiéry/architektura Praha-like), přes `next/image`.
- Hero video: použij kvalitní volné stock video (Coverr/Pexels — luxusní interiér / večerní město / architektura), `<video autoplay muted loop playsinline preload="metadata" poster=...>`, optimalizované mp4 ≤ 6 MB, poster obrázek jako LCP fallback.
- SEO: metadata, OG tagy, `lang="cs"`. Lighthouse cíl 90+.

---

## 4. Struktura homepage (sekce po pořadí)

### 4.1 Header — vnořený do hero (overlay)
Přesně tento pattern z reference:
- `position: fixed`, plná šířka, **transparentní přes hero video**, text bílý.
- Horní mikro-lišta (volitelně skrytá na mobilu): vlevo telefon + e-mail, vpravo přepínač **CZ / EN** (EN jen vizuálně) a ikona srdce (oblíbené) + ikona lupy.
- Hlavní lišta: vlevo logo, vpravo menu:
  **Prodej · Pronájem · Investiční nemovitosti · Novostavby · Služby · O nás · Kontakt**
- Po scrollu za hero (~80vh): header se přepne na `--paper` pozadí s blur
  (`backdrop-filter: blur(12px)`, `background: rgba(250,249,246,.85)`), text `--ink`,
  hairline border dole, výška se zmenší (např. 96px → 64px), plynulá tranzice.
- Mobil: hamburger → fullscreen overlay menu (`--ink` pozadí, bílé položky, stagger animace).

### 4.2 Hero — fullscreen video (klíčová sekce)
- **Výška `100svh`** — na MacBook Air 13" (1440×900 efektivně, viewport ~820px)
  se musí VŠE vejít bez scrollu: header + H1 + vyhledávač + scroll button.
- Fullscreen video na pozadí (`object-fit: cover`), přes něj gradient overlay
  `linear-gradient(rgba(10,12,14,.35), rgba(10,12,14,.55))` pro čitelnost.
- Obsah (vertikálně centrovaný, mírně pod středem):
  1. Eyebrow: `PRÉMIOVÉ NEMOVITOSTI V ČESKÉ REPUBLICE` (uppercase, tracking, bílá 70 %)
  2. **H1:** „Český Partner" + druhý řádek „Realitní kancelář" (menší, weight 400)
  3. **Vyhledávací panel** (pattern z reference): bílý/glass panel `border-radius 2px`, uvnitř:
     - taby **Prodej | Pronájem** (aktivní = bronzová underline)
     - select „Typ nemovitosti" (Byt, Dům, Pozemek, Komerční)
     - input „Lokalita" (placeholder „Praha, Brno…")
     - select „Dispozice" (1+kk … 5+1 a více)
     - tlačítko **Hledat** (`--ink`, ikona lupy)
     - Na desktopu jeden řádek (grid), na mobilu sloupec. Kompaktní výška (~64px řádek), aby hero nepřerostlo viewport.
- **Scroll button** dole uprostřed: kroužek 48px s hairline borderem, chevron-down,
  jemný `translateY` bounce (2s loop), po kliku smooth-scroll na první sekci.
- Fallback: než se video načte, zobrazit poster; `prefers-reduced-motion` → jen poster.

### 4.3 Vybrané nemovitosti (signature slider)
- Eyebrow „VÝBĚR TÝDNE" + H2 „Vybrané nemovitosti" + vpravo šipky slideru + link „Zobrazit vše →".
- **Embla slider**, karty přes ~1.15 sloupce přesahující doprava (peek dalšího slidu — moderní pattern), drag kurzorem.
- Karta: foto 4:3 (hover zoom), pod ním: název (H3), lokalita s ikonou `MapPin`,
  řádek meta „4+kk · 168 m² · Praha 6", **cena bronzově** (`29 900 000 Kč`),
  hairline oddělovač. Celá karta klikatelná (href="#" placeholder).
- Štítky na fotce: „Novinka" / „Rezervováno" (malý uppercase chip, glass).

### 4.4 Prodej — slider
- H2 „Nemovitosti na prodej", stejný slider pattern jako 4.3, 8+ karet, CTA „Celá nabídka prodeje →".

### 4.5 Pronájem — slider
- H2 „Nemovitosti k pronájmu", ceny formátem „65 000 Kč / měsíc". CTA „Celá nabídka pronájmů →".

### 4.6 Statement sekce — O nás (tmavý předěl)
- Pozadí `--ink`, text `--paper`, velkorysý padding (`py-32`).
- Layout 2 sloupce: vlevo velký claim (H2, 2–3 řádky):
  „Nemovitost je víc než adresa. Je to rozhodnutí na celý život — a my jsme jeho partner."
- Vpravo krátký odstavec + **count-up statistiky** (animace při scrollu do view):
  `15+ let na trhu · 1 200+ prodaných nemovitostí · 4,9/5 hodnocení klientů · 98 % úspěšnost prodeje`
- CTA outline (bílý border): „Poznejte nás →".

### 4.7 Investiční nemovitosti — slider
- Světlé pozadí `--stone` (vizuální odlišení).
- H2 „Investiční nemovitosti" + perex („Činžovní domy, komerční objekty a developerské projekty s prověřeným výnosem.")
- Karty jako 4.3, ale meta řádek s výnosem: „Výnos 5,2 % p.a. · 1 420 m²". CTA „Investiční příležitosti →".

### 4.8 Aktuálně / Z trhu — editorial grid (pattern „Lifestyle" z reference)
- H2 „Aktuálně z realitního trhu".
- **Editorial grid 1 velká + 4 menší** (bento): velká karta vlevo (foto 3:2, titulek přes 2 řádky), vpravo 2×2 menší.
- Karta článku: kategorie eyebrow bronzově („TRH / ANALÝZA / TIP"), titulek, datum. Mock 5 článků (realistické české titulky o trhu, hypotékách, lokalitách).
- CTA „Všechny články →".

### 4.9 Služby — 3 karty
- H2 „S čím pomůžeme". 3 karty na `--paper` s hairline borderem, Lucide ikona
  (Home / KeyRound / TrendingUp), titulek, 2 věty, link:
  1. **Prodej nemovitosti** — odhad zdarma, profesionální prezentace, právní servis.
  2. **Pronájem a správa** — prověření nájemníci, kompletní správa.
  3. **Investiční poradenství** — výnosové analýzy, off-market příležitosti.
- Hover: border → bronz, jemný lift `translateY(-4px)`.

### 4.10 Reference — quote slider
- Tmavší pozadí `--stone`, centrovaný layout.
- Velká uvozovka (SVG), citace klienta (1–2 věty, font-size ~1.5rem), jméno + kontext
  („Prodej bytu, Praha 2"), Embla fade/slide, tečky. 4 mock reference.

### 4.11 Newsletter (pattern z reference)
- Úzký pás: H3 „Nejnovější nabídky do vašeho e-mailu", input + tlačítko „Odebírat",
  checkbox souhlasu, sonner toast po odeslání („Děkujeme, jste přihlášeni k odběru.").

### 4.12 Footer (velký, strukturovaný)
- Pozadí `--ink`, text bílá/60 %, bronzové hovery.
- 4 sloupce: **Nabídka** (Prodej, Pronájem, Investiční, Novostavby) ·
  **Společnost** (O nás, Služby, Aktuálně, Kariéra) ·
  **Kontakt** (adresa: Václavské náměstí 1, Praha 1 — placeholder, telefon, e-mail) ·
  **Sledujte nás** (Instagram, Facebook, LinkedIn — Lucide ikony).
- Nad sloupci velké logo. Pod tím hairline + řádek:
  „© 2026 Český Partner s.r.o. · Ochrana osobních údajů · Podmínky užívání".

---

## 5. Responsivita & QA checklist

- [ ] **MacBook Air 13" (viewport ~1440×~820): hero = header + H1 + search + scroll button, vše viditelné bez scrollu** (klíčový požadavek klienta — testovat!)
- [ ] `100svh` (ne `100vh`) kvůli mobilním lištám.
- [ ] Breakpointy: 1440 / 1280 / 1024 / 768 / 480. Slider: 3.2 → 2.2 → 1.15 karty.
- [ ] Žádný horizontální scroll body. Slidery mají vlastní overflow.
- [ ] Video se nenačítá na mobilu < 768px (jen poster) — výkon.
- [ ] Diakritika v headinzích nikde nepřetéká (line-height min 1.05).
- [ ] Lighthouse: Performance 90+, A11y 95+ (kontrast bronz na paper ověřit — na malém textu použít `--bronze-deep`).
- [ ] `prefers-reduced-motion` vypíná video autoplay, reveal animace, count-up.

## 6. Co NEDĚLAT

- ❌ Nekopírovat texty, logo, fotky, přesné barvy ani font ze svoboda-williams.com.
- ❌ Žádné dekorativní číslované markery /01 /02 /03 u sekcí.
- ❌ Žádný druhý font, žádné gradient texty, žádné glassmorphism karty mimo hero search.
- ❌ Žádné lorem ipsum — všechny texty realistické české.

## 7. Pořadí implementace (doporučené)

1. Scaffold Next.js + Tailwind + font + design tokeny (CSS proměnné).
2. Header (overlay → scrolled stav) + mobilní menu.
3. Hero (video, search panel, scroll button) — **hned ověřit 1440×820**.
4. Mock data + karta nemovitosti + Embla slider (sdílená komponenta `ListingSlider`).
5. Sekce 4.3–4.7.
6. Editorial grid, služby, reference, newsletter, footer.
7. Responsivita + QA checklist + Lighthouse.
