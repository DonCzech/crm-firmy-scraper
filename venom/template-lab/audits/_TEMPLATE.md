# Audit šablony: <original-slug>

> **Zkopíruj tento soubor** na `template-lab/audits/<original-slug>.md` a vyplň.
> Po vyplnění proběhne FÁZE A. Implementace = FÁZE C podle `docs/FAZE_C_PROMPT.md`.

## Identifikace

| Pole | Hodnota |
|------|---------|
| Original slug (z queue) | `___` |
| Original název firmy | `___` |
| Originální doména | `___.cz` |
| Kategorie (z queue) | `___` |
| **Skeleton** (z `docs/SKELETONS.md`) | `service-personal` / `gastro` / `b2b-trade` / `professional` / `real-estate` / `health` / `events-media` / `education` / `e-shop` |
| **Engine slug** (`<kategorie>-NN`) | `___-NN` (např. `barber-02`) |
| **Engine tenant slug** | `___-NN-v2` |
| **Demo název** (vymyšlený, nesouvisí s originálem) | `___` |
| Předchozí DONE šablona stejné kategorie | `___` |
| URL na `/preview` kartu | `http://localhost:3015/preview` (slug: `___-demo`) |
| URL na `/demo/<slug>-demo` (clone) | `http://localhost:3015/demo/___-demo` |
| Zdrojový mirror | `public/clones/___/` |

## Identifikované podstránky originálu

| Slug | Název | Sekce v pořadí | Implementovat? | Důvod |
|------|-------|----------------|----------------|-------|
| `/` | Homepage | … | ✅ | povinné |
| `/sluzby` | Služby | … | ✅ | |
| `/galerie` | Galerie | … | ✅ | |
| `/kontakt` | Kontakt | … | ✅ | |
| `/o-nas` | O nás | … | ✅/❌ | |
| `/blog` | Blog | … | ✅/❌ | |

## Layout — sekce v pořadí (homepage)

(Vyplnit dle skeletonu + originálu. SKIP = sekce ve skeletonu ale originál ji nemá.)

| Pos | Skeleton sekce | Originál má? | Variant (Reuse/Extend/New) | Poznámka |
|-----|----------------|--------------|----------------------------|----------|
| 1 | Header | ✅ | navbar variant `___` Reuse | sticky? hamburger breakpoint? |
| 2 | Hero | ✅ | hero variant `___` Reuse | full-bleed / split / video / slider |
| 3 | About | ✅ | about variant `___` | |
| 4 | Services | ✅ | services variant `___` | |
| 5 | Pricing | ❌ SKIP | — | originál nemá ceník |
| … | | | | |

## Vizuální identita

- **Fonty:** primary `___` (váhy: `___`), secondary `___`
- **Barvy:**
  - primary: `#______`
  - secondary: `#______`
  - accent: `#______`
  - background: `#______`
  - text: `#______`
- **Button styl:** radius `__px`, padding `__/__`, shadow `___`, hover `___`
- **Spacing personality:** těsné / vzdušné / asymetrické
- **Atmosféra:** luxusní / přátelská / minimalistická / industriální

## Demo data — originál → demo (kompletní mapping)

| Originální hodnota | Demo hodnota | Kde se vyskytuje (sekce) |
|--------------------|--------------|--------------------------|
| `Pashkov s.r.o.` | `Demo Studio s.r.o.` | footer, GDPR |
| `info@example.cz` | `info@demo.cz` | header, contact, footer |
| `+420 777 123 456` | `+420 704 123 456` | header, contact, footer |
| `Vlkova 9, Praha 3` | `Ukázková 123, 110 00 Praha 1` | contact, footer, GDPR |
| `IČO 19446969` | `IČO 12345678` | footer, GDPR |
| `<orig brand 1>` | demo logo SVG | partneři |
| `<orig zaměstnanec>` | `Jan Novák` | team |
| ceník `850 Kč` | `650 Kč` (−24 %) | pricing |
| ceník `1300 Kč` | `1100 Kč` (−15 %) | pricing |

## Defekty originálu k opravě

```
Homepage:
- galerie 7 fotek různé výšky → 8-grid 4×2 s aspect-ratio 4/3
- mezera 280 px mezi services a galerií → sjednotit na --section-gap
- 3 obrázky v kontaktech → 1 vlevo + form vpravo
- nefunkční accordion v FAQ → shared FAQSection variant accordion

/sluzby:
- ceník přetéká na mobilu → grid 1 sloupec < 768 px
- prázdné <img> u 3 služeb → demo placeholder 800×600

/galerie:
- lightbox nefunguje → shared GalleryLightbox
```

## Risks & pasti

- Wix / Webflow / Squarespace blokátory? `___`
- Externí trackery / jQuery / fonty k vyhozeni: `___`
- Oversized obrázky pro PageSpeed: `___`
- Komplexní animace / GSAP: `___`

## Závazný checklist FÁZE C (kopíruje pořadí skeletonu)

(Sonnet zaškrtává postupně po PASS [2]+[3]+[4] mikro-fází.)

- [ ] Sekce 1 Header — diff PASS / studio PASS / demo PASS
- [ ] Sekce 2 Hero
- [ ] Sekce 3 About
- [ ] Sekce 4 Services
- [ ] Sekce 5 Pricing (nebo SKIP s důvodem)
- [ ] Sekce 6 Gallery
- [ ] Sekce 7 Team (nebo SKIP)
- [ ] Sekce 8 Testimonials
- [ ] Sekce 9 Booking/CTA
- [ ] Sekce 10 Locations
- [ ] Sekce 11 FAQ
- [ ] Sekce 12 Footer

## Status

`NOT_STARTED` / `IN_PROGRESS` / `READY_FOR_PHASE_C` / `DONE`
