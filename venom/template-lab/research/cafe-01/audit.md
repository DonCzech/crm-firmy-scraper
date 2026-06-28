# cafe-01 (původně `costa`) — Fáze 0 audit

**Datum:** 2026-05-23
**Zdroj:** `venom/public/clones/costa/`
**Kategorie:** `cafe` (kavárna — Costa Coffee, řetězec)
**Nový slug:** `cafe-01`

## Inventář

| Metrika | Hodnota |
|---------|---------|
| Celková váha | 2.3 MB |
| HTML stránek | 8 (4× raw + 4× cleaned: home, kavarny, nabidka, historie) |
| Největší HTML | `kavarny.html` (225 KB) — výpis kaváren, dlouhý seznam |
| Ostatní HTML | ~35–40 KB každá |
| CSS souborů | 5 (`global.min.css` 105 KB, fancybox 25 KB, contact-form-7 3 KB, google-maps 3 KB, woo-gpwebpay 1 KB) |
| JS souborů | 12 (~280 KB total) |
| Obrázků | 34 |
| Fontů | 8 (CostaDisplayWave + CostaText 3 weights × woff/woff2) |
| WP plugins balast | woocommerce, woo-gpwebpay, contact-form-7, gtranslate |

## Cleanup targets (vše DROP)

| Soubor | Velikost | Akce |
|--------|----------|------|
| `jquery.min.js` | 87 KB | DROP — žádný kód v naší šabloně |
| `fancybox.min.js + .css` | 167 KB | DROP — neexistuje lightbox v homepage; pokud bude potřeba v `kavarny`, použít native `<dialog>` |
| `woocommerce/*` (4 scripts) | ~15 KB | DROP — žádný e-shop |
| `contact-form-7/*` | ~26 KB | REPLACE — native React form + server action |
| `gtranslate/*` | ~14 KB | DROP — Next.js i18n |
| `wp-includes/js/dist/*` (hooks, i18n) | ~11 KB | DROP |
| inline JSON-LD yoast schema | 2 KB | REPLACE — Next.js `metadata` API |
| inline WP block styles, gtranslate inline CSS | ~6 KB | DROP — Tailwind utility tokens stačí |
| `wp-img-auto-sizes-contain-inline-css` | DROP | |
| `speculationrules` script | KEEP | useful, native browser prefetch |

**Očekávaná úspora:** ~310 KB JS + ~30 KB CSS = **~340 KB** odpadu pryč.

## Brand assets — POZOR proprietární

- **Fonty CostaDisplayWave, CostaText** — proprietární Costa Coffee fonty. Demo šablona je **nesmí distribuovat**.
  - **Náhrada — CostaDisplayWave (script-display, vlnitý)** → free font `Caveat Brush` nebo `Permanent Marker` (Google Fonts), případně vlastní `wave-display.woff2`.
  - **Náhrada — CostaText** → `Manrope` (Google Fonts) — geometric humanist sans.
  - Výsledný vizuál bude **velmi blízký, ne 1:1** (proto vizuální gate s tolerancí 3 % nemusí projít — pokud uživatel chce 1:1, musí dodat licenci nebo akceptovat náhradu).
- **Barva `#6d1f37` (Costa burgundy)** — silně asociována se značkou. Doporučuji nechat v `cafe-01` presetu jako default, ale v builderu nabídnout pro klienty 5 alternativních cafe-preset barev (latte brown, espresso, matcha green, terracotta, navy).
- **Logo Costa SVG + Query studio logo + Costa wave SVG masks** — DROP (logo nahradit placeholder, query logo úplně pryč).

## Performance — počáteční odhad

- Aktuální (originál): pravděpodobně Lighthouse perf ~50–70 (3× framework, 280 KB JS), CLS slušný (mají sizes na obrázcích).
- Cíl po refaktoru: perf ≥ 90, SEO ≥ 95, a11y ≥ 95, **page weight < 500 KB**.
- Cesta: drop balast (340 KB), self-host fonty (2 weights, ne 5+), `next/image` AVIF, jen kritické CSS.

## Datový dump (k extrakci v fázi 1)

- 7 nav položek (Novinky, Kavárny, Nabídka, Věrnostní klub, E-shop, Kariéra, Kontakt)
- Hero claim: "Ledové drinky v cherry stylu" + sub + CTA
- 3 news cards (post-feed pattern)
- Loyalty CTA strip (split image+text)
- Newspaper "Costa Coffee Times" feature (split text+magazine cover)
- Footer 6-col + bottom bar (socials, copyright, legal links)
