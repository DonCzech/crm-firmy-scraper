# PROOF — Universal Service Engine (`proof-01`)

**Kolekce:** Fable Premium V3 (šablona 1/10)
**Archetyp:** Universal Service Engine — poptávka / rezervace termínu
**Zdrojový web:** žádný (originální design, ne klon). Business archetyp, ne oborová kopie.
**Autor:** Fable · **Licence:** interní Webero · **Vytvořeno:** 2026-07-21

## Positioning
Ne další oborový web. Systém navržený podle toho, čeho má web dosáhnout: získat poptávku.
Jedna kostra použitelná pro lokální služby, řemesla, kliniky, autoservisy, poradce a úklid —
adaptace přes content, fotografie a theme, ne přes nové komponenty.

## Design systém — „Confident minimalism"
- **Barvy:** ink `#14161B`, paper `#F5F3EE`, surface `#FFFFFF`, jediný akcent ember `#E7502E`, muted `#6A6E78`, border `#E4E0D8`.
- **Typografie:** Overpass (display 700–800 / body 400–600) + Instrument Serif italic (eyebrow, úvozovky) — self-hosted přes `next/font` v `layout.tsx`, žádný FOUT.
- **Motion:** subtilní reveal a hover, vše pod `prefers-reduced-motion`.
- Žádné generické modré karty s ikonami, žádné blob gradienty, žádné falešné dashboardy.

## Signature interaction
**Interaktivní předvýběr poptávky** v hero (`proof-01-hero`): výběr typu služby (radio) × rozsah
(segmented control) → živý orientační odhad ceny + „Chci přesnou nabídku". Klávesnicově ovladatelné,
`aria-live`, funguje i bez JS jako statická nabídka služeb.

## Nové engine capabilities (reusable pro další V3 šablony)
1. **Before/after posuvník** — `gallery:proof-01-beforeafter`. Range input (klávesy ←/→ + ARIA) + drag,
   editovatelné oba obrázky + caption, aspect 4/3, reduced-motion.
2. **Sticky mobilní CTA lišta** — součást `navbar:proof-01-navbar`. Fixní spodní lišta (Zavolat / Poptávka)
   na mobilu, safe-area padding.
3. **Interaktivní pre-selektor poptávky** — `hero:proof-01-hero` (viz výše).

## Sekce / varianty (vše registrované v `src/sections/variants.ts`)
| Typ | Varianta |
|---|---|
| navbar | `proof-01-navbar` (+ sticky mobilní CTA) |
| hero | `proof-01-hero` (signature), `hero-proof-01-page` (podstránky) |
| stats | `proof-01-stats` (trust band) |
| services | `proof-01-services`, `proof-01-process` |
| gallery | `proof-01-beforeafter` |
| pricing | `proof-01-pricing` |
| testimonials | `proof-01-testimonials` |
| faq | `proof-01-faq` |
| contact | `proof-01-contact` (poptávka + success/error) |
| footer | `proof-01-footer` (+ oblast působnosti) |

## Stránky
Domů · Služby · Realizace · Ceník · O nás · Kontakt (reuse sekcí přes podstránkové hero).

## Tři mood presety (theme override sady)
1. **Signal** (default, shipnutý v `theme.json`) — ember `#E7502E`, radius 10, měkké stíny, teplá off-white. Řemesla, technické služby, autoservis.
2. **Clinic** — accent `#0E7C6B`, radius 6, jemné stíny, čistá bílá, motion none/subtle. Kliniky, poradci, právo.
3. **Estate** — accent `#B08540` na tmavším ink pozadí, radius 4, výrazné stíny, editorial spacing. Prémiové/luxusní služby, reality.

Presety mění tokeny + `data-mood` skin; struktura a business logika zůstávají. Přepínač presetů ve
Studiu je engine backlog (viz `docs/FABLE_V3/PROOF_WIX_MATRIX.md`).

## Editovatelnost
Všechny texty, obrázky, CTA, odkazy, položky polí (services, scopes, steps, tiers, testimonials, faq,
areas, badges) jsou editovatelné přes `GenericEditableText` / `GenericEditableImage` (dot-path `field`).
Poptávkový formulář odesílá na `POST /api/demo/:slug/contact` se stavy sending/success/error.

## Validace
- `pnpm validate:template proof-01` → viz `docs/FABLE_V3/PROOF_BRIEF.md` a report.
- Demo data: telefon `704 123 456`, e-mail `poptavka@demo.cz`, adresa `Ukázková 123, 110 00 Praha 1`, IČO `12345678`.

## Changelog
- **1.0.0** (2026-07-21) — první verze: homepage systém + 6 stránek, 12 nových shared variant, 3 nové engine capabilities.
