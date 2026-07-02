# QA Sprint 4 — Editor Coverage & Variant Audit

**Datum:** 2026-06-29  
**Metoda:** code-level audit (variant existence check + GenericEditableText coverage)

## Výsledky Coverage Auditu

| Metrika | Hodnota |
|---------|---------|
| Celkem šablon | 92 |
| ✅ 100% pokryto | 91 |
| ⚠️ Partial | 1 (barber-01 — locked, known exception) |
| ❌ 0% pokryto | 0 |
| Registry typy | 22/22 registrováno |

## Top 15 šablon — variant check

| Šablona | Status |
|---------|--------|
| stavba-01 | ✅ PASS |
| elektro-01 | ✅ PASS |
| solar-01 | ✅ PASS |
| garden-01 | ✅ PASS |
| hotel-01 | ✅ PASS |
| klima-01 | ✅ PASS |
| malir-01 | ✅ PASS |
| catering-01 | ✅ PASS |
| ddd-01 | ✅ PASS |
| events-01 | ✅ PASS |
| cafe-01 | ✅ PASS |
| arbo-01 | ✅ PASS |
| clean-01 | ✅ PASS |
| ucetni-01 | ✅ PASS |
| tattoo-01 | ✅ PASS |

## Opravené varianty (T4.4)

Během T4.4 byly implementovány 3 chybějící section varianty:

| Varianta | Sekce | Popis |
|----------|-------|-------|
| `autoservis-03-stats` | StatsSection.tsx | Dark BMW strip — #000 bg, orange #f97316 čísla, 4-col |
| `ananda-01-faq` | FaqSection.tsx | Cream/gold accordion, Jost font, ayurvéda SPA styl |
| `arch-01-contact` | ContactSection.tsx | Minimální B&W, 2 ateliéry, kontaktní formulář |

## Známé výjimky

- **barber-01** (77%): Locked template. Varianty `default`/`cards-grid` pro team/faq/opening-hours
  používají generic fallback renderer (GenericEditableText přítomen, vizuální styl je generický místo dark-luxury).
  Problém pre-existuje před Sprint 4 a nezhoršuje se. Fix vyžaduje změnu variant v DB + template.json —
  odloženo na Sprint 5 (spolu s rozhodnutím o unlock).

## Open issues

Žádné kritické FAIL položky.

## Závěr

Sprint 4 cíl splněn: **91/92 šablon (99%)** má plně pokryté sekce GenericEditableText wrappers.
Všechny section typy registrovány. 3 chybějící varianty implementovány.
OverlayLayer automaticky dostupný na všech sekcích přes SectionFrame.
