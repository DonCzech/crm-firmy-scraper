# PROOF — Universal Service Engine (proof-01)

**Kolekce:** Fable Premium V3 — šablona 1/10
**Archetyp:** Universal Service Engine
**Primární konverze:** poptávka / rezervace termínu (jeden primární CTA: „Nezávazná poptávka")
**Slug:** `proof-01`
**Status:** homepage + IA implementováno a zvalidováno; showcase tenant a live Lighthouse/Studio QA = viz „Zbývá".

---

## 1. Fáze A — Product / design brief

### Cíloví uživatelé a obory (universální, ne oborový klon)
PROOF je nejuniverzálnější a obchodně nejdůležitější šablona kolekce. Jedna kostra, kterou content + fotografie + theme adaptují na:

1. lokální služby a řemesla (instalatér, elektro, malíř),
2. stavební a rekonstrukční firmy,
3. kliniky a zdravotní služby,
4. autoservisy a technické služby,
5. právníci, poradci a účetní,
6. úklidové a zahradní služby.

Použitelnost pro ≥ 5 oborů je splněná designem (neutrální „confident minimalism", jeden akcent, výsledkový hero), ne oborovými prvky.

### Informační architektura (stránky)
- **Domů** (kompletní systém — implementováno)
- **Služby** (listing služeb)
- **Detail služby**
- **Realizace / případové studie** (CMS listing)
- **Detail realizace** (before/after)
- **Ceník**
- **O nás**
- **Kontakt / poptávka**
- **Poradna / blog**

V proof-01 jsou Domů + Služby + Realizace + Ceník + O nás + Kontakt zapojené v manifestu (reuse homepage sekcí přes samostatné podstránkové hero). Detail služby a detail realizace jsou připravené jako CMS archetyp (listing → detail), plná CMS runtime vazba je v backlogu enginu (viz PROOF_WIX_MATRIX).

### CMS modely
- `services` (název, popis, ikona, cena-od, obrázek, slug)
- `cases` / realizace (název, obor, before img, after img, výsledek, slug)
- `posts` / poradna (title, perex, cover, slug) — reuse blog modul v2

### Konverzní flow
1. Hero: problém → řešení → **signature interaction: interaktivní předvýběr poptávky** (typ služby + rozsah + termín → okamžitý orientační odhad + „Chci přesnou nabídku").
2. Důkazy hned za bariérou: trust band (čísla, certifikace, záruky).
3. Služby → proces → realizace (before/after) → ceník → reference → FAQ.
4. Kontakt: poptávkový formulář se success/error stavem.
5. Mobil: **sticky spodní CTA lišta** (Zavolat / Poptávka) — vždy dostupná konverze.

### Visual concept — „Confident minimalism"
- Velká typografie, jasná hierarchie, hodně bílého prostoru, jeden výrazný akcent.
- Žádné generické modré karty s ikonami, žádné blob gradienty.
- Fotografická direction: reálné realizace, matný kontrast, konzistentní teplý grade.

### Typografie
- Display / nadpisy: **Overpass** 700–800 (neutrální, sebevědomý grotesk, self-hosted).
- Body: **Overpass** 400–600.
- Editorial akcent (eyebrow, pull-quote): **Instrument Serif** italic.
- Fluid `clamp()` škála, tight tracking na velkých nadpisech.

### Paleta (Preset „Signal" = default)
| Token | Hodnota | Role |
|---|---|---|
| ink | `#14161B` | text, tmavé plochy |
| paper | `#F5F3EE` | pozadí (teplá off-white) |
| surface | `#FFFFFF` | karty |
| accent | `#E7502E` | jediný akcent (CTA, čísla, aktivní stav) |
| textMuted | `#6A6E78` | sekundární text |
| border | `#E4E0D8` | linky, oddělovače |

### Signature interaction
**Interaktivní předvýběr poptávky v hero** — návštěvník vybere typ služby a rozsah, ihned vidí orientační cenové rozpětí a předvyplní tím poptávku. Plně klávesnicově ovladatelné, respektuje reduced-motion, funguje bez JS jako statická nabídka služeb.

### Tři mood presety (koordinovaně mění barvy, typo, radius, shadow, spacing, foto, motion)
1. **Signal** (default) — ember accent `#E7502E`, radius střední (10px), měkké stíny, teplá off-white, motion subtle. Řemesla, technické služby, autoservis.
2. **Clinic** — accent chladná zelenomodrá `#0E7C6B`, radius malý (6px), velmi jemné stíny, čistá bílá, motion none/subtle, klidná fotografie. Kliniky, poradci, právo.
3. **Estate** — accent grafit-zlatá `#B08540` na ink pozadí (tmavší, prémiový), radius 4px, výrazné stíny, editorial spacing, motion playful. Prémiové/luxusní služby, reality, developer.

Presety mění tokeny + `data-mood` skin, business logika a struktura zůstávají. V proof-01 je shipnutý Preset 1 (Signal) v `theme.json`; presety 2–3 jsou zdokumentované a připravené jako theme override sada (plné přepínání v Studiu = engine backlog).

---

## 2. Fáze B — Engine gap analysis (shrnutí)

| Capability | Webero stav | Rozhodnutí |
|---|---|---|
| Interaktivní hero pre-selektor/kalkulace | partial (ucetni-03 měl mortgage kalkulačku uvnitř jedné varianty) | build — nová `proof-01-hero` varianta se service selectorem, plně editovatelná přes content pole |
| Before/after comparison slider | missing | build — nová `gallery` varianta `proof-01-beforeafter`, drag/klávesy, reduced-motion |
| Sticky mobilní CTA lišta | missing jako systém | build — součást `proof-01-navbar` (fixed bottom bar na mobilu), editovatelné labely/hrefy |
| Numbered process steps | partial (existují v CTA variantách) | reuse vzor jako `services` varianta `proof-01-process` |
| Trust/stats band | supported (`stats`) | reuse + `proof-01-stats` skin |
| Lead form success/error | supported (`contact`) | reuse + `proof-01-contact` skin |
| CMS listing/detail (realizace) | partial (blog modul v2) | archetyp zapojen; plná commerce-like CMS runtime pro „cases" = backlog |

Detailní Wix/Wix Studio matice: [PROOF_WIX_MATRIX.md](./PROOF_WIX_MATRIX.md).

---

## 3. Nové / rozšířené shared varianty (reusable)
- `hero:proof-01-hero` — výsledkový hero + interaktivní pre-selektor poptávky.
- `hero:hero-proof-01-page` — podstránkové hero (breadcrumb + claim).
- `navbar:proof-01-navbar` — sticky minimal navbar + sticky mobilní CTA lišta.
- `services:proof-01-services` — výběr služby (karty).
- `services:proof-01-process` — číslované kroky procesu.
- `pricing:proof-01-pricing` — orientační balíčky.
- `stats:proof-01-stats` — trust band.
- `gallery:proof-01-beforeafter` — before/after slider (nová capability).
- `testimonials:proof-01-testimonials` — reference.
- `faq:proof-01-faq` — časté dotazy.
- `contact:proof-01-contact` — poptávkový formulář.
- `footer:proof-01-footer` — footer + oblast působnosti.

---

## 4. Zbývá (transparentní blockery pro plný DONE)
- Live Lighthouse běh (Perf ≥ 90 / SEO ≥ 95 / A11y ≥ 95) na běžícím dev serveru.
- Browser Studio QA (add/reorder/hide/duplicate/variant-change/reload/persist) na živém tenantu.
- Showcase tenant seed přes deployment flow.
- Plné přepínání 3 mood presetů v UI Studia (engine backlog — theme preset switcher).
- CMS runtime pro „cases" detail (listing archetyp hotov, detail data-binding backlog).
