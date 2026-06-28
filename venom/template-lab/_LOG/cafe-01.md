# cafe-01 — Log

## 2026-05-23 — Fáze 0 + 1 hotovo

- Zdroj: `public/clones/costa/` (8 HTML, 2.3 MB, Tailwind-based WP theme)
- Přejmenováno: `costa` → `cafe-01` (kategorie: cafe)
- Adresář `public/clones/costa/` ponechán (nepřejmenováván — referenční zdroj)
- Audit: `research/cafe-01/audit.md`
- Sekce + DS: `research/cafe-01/sections.json`

**Klíčová rozhodnutí**
1. Fonty CostaDisplayWave + CostaText nelze distribuovat (proprietární) → náhrada Caveat Brush + Manrope (Google Fonts). Vizuální gate s tolerancí 3 % nemusí projít — pokud uživatel chce 1:1, musí dodat licenci.
2. Costa burgundy `#6d1f37` — necháno v presetu jako default, builder nabídne 5 alternativ pro klienty.
3. Logo Costa, Query studio logo — DROP, nahradit placeholder.
4. Cleanup target: jQuery, Fancybox, WooCommerce, Contact Form 7, GTranslate, WP scripts — celkem ~340 KB odpadu.

**Sekce do katalogu (10 nových varianty)**
hero-fullbleed (image-bg + wave-mask), split-promo (tilted image), card-grid-3 (filled-bg cards), split-feature (text+cover), site-footer (6col), site-header (logo-center), list-locations (map+grid), menu-categories, menu-grid (price card), timeline-vertical.

**Před fází 2** — STOP. Povinné:
1. Přečíst Next.js 16 docs v `node_modules/next/dist/docs/` (per AGENTS.md)
2. Rozhodnout: kde žije katalog sekcí (`src/components/templates/_sections/` nebo `src/components/sections/`?)
3. Rozhodnout: jak se identifikuje preset → routing (`/templates/cafe-01/preview` nebo přes tenant?)
4. Rozhodnout: kdy se přepisuje existující `PageBuilder.tsx` (teď v F2, nebo až ve F4 spolu s editorem?)
