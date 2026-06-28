# PAGE_BUILDER_STANDARD.md

**Status:** Standard v1
**Datum:** 2026-05-23

---

## 1. Cíl

Jeden page builder pro všechny šablony. Uživatel skládá stránku ze **sekcí**, každá sekce má **variantu** (vizuální skin) a **content** (data).

```
Page = [Section1(type, variant, content), Section2(...), ...]
```

---

## 2. Section registry

Centrální mapa typ → komponenta v `src/sections/registry.ts`:

```ts
export const SECTION_RENDERERS: Record<SectionType, LazyComponent> = {
  navbar:        dynamic(() => import("./Navbar")),
  hero:          dynamic(() => import("./Hero")),
  services:      dynamic(() => import("./Services")),
  about:         dynamic(() => import("./About")),
  blog-preview:  dynamic(() => import("./BlogPreview")),
  testimonials:  dynamic(() => import("./Testimonials")),
  gallery:       dynamic(() => import("./Gallery")),
  pricing:       dynamic(() => import("./Pricing")),
  faq:           dynamic(() => import("./Faq")),
  contact:       dynamic(() => import("./Contact")),
  cta:           dynamic(() => import("./Cta")),
  footer:        dynamic(() => import("./Footer")),
};
```

**Přidání nové sekce = jeden řádek v registry + složka v `src/sections/<type>/`.** Žádná editace `SectionRenderer.tsx` switch case.

---

## 3. Section structure (na disku)

```
src/sections/hero/
  index.tsx               # router přes variantu
  variants/
    default/
      Hero.tsx
      skin.module.css
      schema.ts           # Zod schema pro content
      preview.png
    cafe-wave/
      Hero.tsx
      skin.module.css
      schema.ts
      preview.png
    luxury-dark/
      ...
  meta.ts                 # exportuje SectionMeta (viz §4)
```

---

## 4. Variant registry (`SECTION_VARIANTS`)

```ts
// src/sections/variants.ts
export const SECTION_VARIANTS: Record<SectionType, VariantMeta[]> = {
  hero: [
    { key: "default",     label: "Default",       industries: ["*"] },
    { key: "cafe-wave",   label: "Café Wave",     industries: ["cafe","bakery"] },
    { key: "luxury-dark", label: "Luxury Dark",   industries: ["barber","wellness"] },
    { key: "split-image", label: "Split Image",   industries: ["*"] },
  ],
  services: [
    { key: "cards-grid",   label: "Cards Grid",   industries: ["*"] },
    { key: "pricing-list", label: "Pricing List", industries: ["barber","wellness"] },
    { key: "icon-grid",    label: "Icon Grid",    industries: ["*"] },
  ],
  // ...
};
```

**Naming:** `<type>:<variant>` (např. `hero:cafe-wave`). `:` jako namespace separator — zabraňuje kolizím při sloučení katalogu.

`PageBuilder` SECTION_LIBRARY se **generuje** z tohoto registry + filtruje podle `industries` šablony. Žádné ruční vypisování.

---

## 5. Component contract

Každá variant komponenta dodržuje:

```ts
export interface SectionComponentProps<TContent = unknown> {
  content: TContent;
  variant: string;
  isAdmin: boolean;
  tenantSlug: string;
  sectionId: number;
  theme: ThemeTokens;
}
```

**Žádná sekce nesmí mít odlišnou signaturu.** ServicesSection musí přijímat `tenantSlug`, i když ho dnes nepotřebuje.

---

## 6. Operace builderu

| Operace | UI | API |
|---------|----|----|
| Add | drag z library / `+ Přidat sekci` | `POST /sections` |
| Reorder | drag handle / arrows | `PATCH /sections/reorder` (batch) |
| Hide/Show | toggle | `PATCH /sections/:id { hidden }` |
| Duplicate | menu | `POST /sections/:id/duplicate` |
| Delete | menu + confirm | `DELETE /sections/:id` |
| Change variant | dropdown na sekci | `PATCH /sections/:id { variant }` |

### Lock pravidla (enforced backend)

- `navbar` musí být první sekce stránky (order_index = 0).
- `footer` musí být poslední.
- Backend odmítne PATCH, který by porušil pořadí, s 400 + důvodem.
- UI pouze odráží stav; nesmí být jediná zábrana.

### Reorder = batch

Místo posílat 10 PATCH requestů při drag-and-drop, klient posílá:
```
PATCH /pages/:pageId/sections/reorder
{ order: [12, 7, 9, 3, ...] }   // sectionId v novém pořadí
```
Server validuje vlastnictví všech ID, atomicky updatuje v transakci.

---

## 7. Layout editing v sekci

Některé sekce mají vnitřní layout sloty (např. Hero = title/subtitle/cta/image). Jejich umístění:

- Definováno v `variants/<variant>/schema.ts` → `layout: { slots: ["title","subtitle","cta","image"], arrangement: "left-text" }`.
- Tenant nemůže přidávat nové sloty, ale může **přesouvat** předem definované sloty (jen v rámci enum `arrangement`).
- Tím udržíme: vizuální charakter varianty zachován, drobné customizace povoleny.

---

## 8. Drag & Drop

- Lib: `@dnd-kit/core` (lehčí než react-dnd, lepší a11y).
- Drop zóny: mezi sekcemi (insert) a v library panelu (origin).
- Touch support povinný.
- Klávesnice: `Tab` na drag handle → `Space` pick → arrows → `Space` drop.

---

## 9. Section library UI

Panel vpravo, filtrovaný:
- **All** | **Recommended for this template** (podle `industries`) | **By type**
- Card preview (`preview.png`, 240×160).
- Hover → tooltip s description + variant key.
- Drag → drop na canvas mezi sekce.

---

## 10. Page templates (composite presets)

Knihovna předkonfigurovaných stránek („landing", „about page", „pricing page"):
```
src/page-presets/
  landing-cafe/
    preset.json   # array of (type, variant, defaultContent)
```
Uživatel: „Přidat stránku" → vybere preset → vygeneruje se page se sekcemi.

---

## 11. Zakázané vzory

| ❌ | ✅ |
|---|---|
| Hardcoded SECTION_LIBRARY array | Generovat z `SECTION_VARIANTS` |
| Switch case v SectionRenderer | Registry mapa + `dynamic()` |
| Reorder = N PATCH requestů | Batch reorder endpoint |
| UI-only navbar/footer lock | Backend validace |
| Variant `hero-cafe-wave` (dash) | `hero:cafe-wave` (namespace) |

---

## 📋 FRONTA ŠABLON & DEMO DATA — POVINNÉ PRO KAŽDOU PŘEVÁDĚNOU ŠABLONU

> Tato sekce je **závazná** pro každého agenta (Sonnet), který převádí šablonu na MASTER ENGINE.

**Fronta:** [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md) — jediný zdroj pravdy, která šablona je další.
- **Vstup:** [/preview](http://localhost:3015/preview) (91 legacy scrapů, `src/app/preview/page.tsx`).
- **Výstup:** [/preview-2](http://localhost:3015/preview-2) — auto-discovery z `src/templates/<slug>/template.json`.
- **Pořadí:** ber **první `TODO`** v tabulce (viz [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md#fronta-šablon-91)). Nepřeskakuj.
- **Kontinuita:** před FÁZÍ A si přečti README.md poslední `DONE` šablony v `src/templates/`, abys navázal na zavedené varianty sdílených sekcí.
- **Prompty Sonneta:** [FAZE_A_PROMPT.md](./FAZE_A_PROMPT.md) (analýza) + [FAZE_B_PROMPT.md](./FAZE_B_PROMPT.md) (implementace) (FÁZE A = analýza, FÁZE B = implementace).

### Demo logo — POVINNÉ
- ❌ NESMÍ zůstat originální logo.
- ✅ Vygeneruj **demo logo** (SVG inline nebo `public/templates/<slug>/logo.svg`) s demo názvem (viz sloupec "Demo název" v queue) a barvami z `theme.json`.

### Demo kontakty — POVINNÉ (jednotná tabulka)
| Pole | Hodnota |
|------|---------|
| Email | `email@demo.cz` (případně `info@demo.cz`, `rezervace@demo.cz`) |
| Telefon | `704 123 456` (formát `+420 704 123 456`); druhé číslo `704 654 321` |
| Adresa | `Ukázková 123, 110 00 Praha 1` |
| Web | `https://demo.cz` |
| Sociální | `facebook.com/demo`, `instagram.com/demo` |
| IČO | `12345678` |
| Provozní doba | `Po–Pá 9:00–18:00, So 9:00–14:00` |

### Grep audit před `DONE`
Šablona není hotová, dokud tyto greppy neprojdou na **0** výsledků v `src/templates/<slug>/`:
- `grep -r '@<originální-doména>' src/templates/<slug>/` → 0
- `grep -r '<reálný-název-firmy>' src/templates/<slug>/` → 0 (vyjma README "Zdrojový web")
- Jakékoliv telefonní číslo `\+?420 ?\d{3} ?\d{3} ?\d{3}` MIMO `704 123 456` / `704 654 321` → 0

Po úspěšné FÁZI B aktualizuj v [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md) řádek `TODO → DONE` + datum a ověř, že se šablona zobrazila v [/preview-2](http://localhost:3015/preview-2).

