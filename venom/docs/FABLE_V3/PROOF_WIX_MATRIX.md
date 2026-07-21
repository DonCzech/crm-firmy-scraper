# Wix / Wix Studio capability matrix — PROOF (proof-01)

Průběžný technický backlog (ne marketingový seznam). Stav se aktualizuje při stavbě všech deseti V3 šablon.

Legenda stav: **supported** (engine + Studio umí) · **partial** (runtime umí, Studio ovládání částečné) · **missing**.

| Oblast | Wix capability | Webero stav | Chybějící část | Rozhodnutí (proof-01) | Test / QA cesta |
|---|---|---|---|---|---|
| Layout | Section / container / stack / grid | supported | — | reuse (flex/grid v inline `<style>`) | vizuální QA 320–1440 |
| Layout | Sticky / fixed prvky | supported | — | reuse (sticky navbar) + build sticky mobile CTA | scroll test mobil |
| Layout | Full-height / viewport sekce | supported | — | reuse (hero min-height) | QA 100svh |
| Layout | Breakpoint-specific hodnoty, hide/show | partial | per-element breakpoint override v Studiu | reuse CSS media; Studio breakpoint overrides = engine backlog | media 320/390/768/1024/1440 |
| Typografie | Fluid type scale | supported | — | reuse `clamp()` | overflow test |
| Typografie | Text spans / zvýraznění části nadpisu | supported | — | reuse (GenericEditableText highlight) | — |
| Interaktivní | Slider / carousel | supported | — | reuse | — |
| Interaktivní | Tabs | partial | obecná Studio-editable tab komponenta | v hero pre-selektoru řešeno jako segmented control (editable položky) | klik + klávesy |
| Interaktivní | Accordion | supported | — | reuse (`faq`) | klik/klávesy |
| Interaktivní | **Before/after comparison** | **missing** | renderer + Studio | **build** `gallery:proof-01-beforeafter` | drag + ←/→ + reduced-motion |
| Interaktivní | Countdown / progress | partial | — | mimo scope proof-01 (SUMMIT) | — |
| Interaktivní | Filter / sort / search | partial | obecné CMS filtry ve Studiu | listing archetyp; filtry = backlog | — |
| Interaktivní | **Sticky CTA (mobil)** | **missing (jako systém)** | renderer + editace | **build** v `proof-01-navbar` | mobil scroll, tel/poptávka |
| Konverze | Interaktivní kalkulace / pre-selektor | partial | znovupoužitelný, plně editovatelný | **build** v `proof-01-hero` | výběr → odhad → předvyplnění |
| Formuláře | Text/email/tel/textarea/select | supported | — | reuse (`contact`) | validace |
| Formuláře | Klient+server validace, success/error | partial | jednotný success/error UX | reuse contact + explicitní stavy | odeslání OK/chyba |
| Formuláře | Spam ochrana, GDPR souhlas | partial | — | GDPR checkbox v contactu | — |
| Média | Responsive image + art direction | supported | — | reuse `GenericEditableImage` (WebP pipeline) | — |
| Média | Mapa / oblast působnosti | supported | — | reuse (`map` / footer oblast) | — |
| Navigace | Víceúrovňová / mega menu | partial | mega menu editace ve Studiu | proof-01 používá flat nav; mega menu = backlog | — |
| Navigace | 404 / utility / legal | partial | dedikované 404 do enginu | legal odkazy v footeru; 404 = platform-level | — |
| CMS | Collections / dynamic listing+detail | partial | obecný CMS runtime pro „cases" | listing archetyp hotov, detail binding backlog | — |
| CMS | Empty / loading / error stavy | partial | — | contact + listing prázdné stavy | — |
| Motion | Entrance / reveal / scroll | supported | — | reuse (subtle reveal, reduced-motion guard) | prefers-reduced-motion |

## Priorita buildů v rámci proof-01
1. `proof-01-hero` interaktivní pre-selektor (signature). — **hotovo**
2. `gallery:proof-01-beforeafter` before/after slider. — **hotovo**
3. Sticky mobilní CTA v `proof-01-navbar`. — **hotovo**

## Přenos do dalších šablon
- Before/after slider → reuse v MAISON (produkt), ATELIER (case study).
- Sticky mobilní CTA → reuse ve všech konverzních šablonách (SIGNAL, PERSONA, ACADEMY).
- Pre-selektor pattern → reuse v ACADEMY (výběr kurzu), SUMMIT (výběr vstupenky).
