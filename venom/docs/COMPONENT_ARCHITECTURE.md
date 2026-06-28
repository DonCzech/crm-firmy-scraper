# COMPONENT_ARCHITECTURE.md

**Status:** Standard v1
**Datum:** 2026-05-23

---

## 1. Vrstvy

```
┌─────────────────────────────────────────────────┐
│ APP (Next.js routes)                            │  src/app/
├─────────────────────────────────────────────────┤
│ FEATURES                                        │  src/features/
│   admin/  editor/  public-site/                 │
├─────────────────────────────────────────────────┤
│ SECTIONS  (15 typů × N variant)                 │  src/sections/
├─────────────────────────────────────────────────┤
│ CORE  (visual skin agnostic primitives)         │  src/components/core/
│   editable/  builder/  layout/  ui/             │
├─────────────────────────────────────────────────┤
│ LIB  (pure utilities, no JSX)                   │  src/lib/
│   db, auth, image, schema, i18n, ...            │
└─────────────────────────────────────────────────┘
```

**Závislost smí jít pouze shora dolů.** Section nesmí importovat z `features/admin`. `core/` nesmí importovat z `sections/`.

---

## 2. Cílová struktura

```
src/
├─ app/                          # Next.js routing
│   ├─ (public)/demo/[slug]/...
│   ├─ (editor)/demo/[slug]/admin/...
│   └─ (platform)/admin/...
├─ features/
│   ├─ editor/                   # PageBuilder UI, SectionEditor, toolbars
│   ├─ public-site/              # PublicView, hydration shell
│   ├─ admin-platform/           # platform admin (template-lab, tenants)
│   └─ tenant-account/           # billing, settings, members
├─ sections/
│   ├─ registry.ts
│   ├─ variants.ts
│   ├─ hero/
│   ├─ services/
│   └─ ...                       # každá sekce má /variants/<key>/
├─ components/core/
│   ├─ editable/
│   │    GenericEditableText.tsx
│   │    GenericEditableImage.tsx
│   │    GenericEditableLink.tsx
│   │    EditorContext.tsx
│   ├─ builder/
│   │    PageBuilder.tsx
│   │    SectionLibrary.tsx
│   │    DragHandle.tsx
│   ├─ layout/
│   │    Container.tsx
│   │    Grid.tsx
│   │    Section.tsx              # wrapper s padding theme tokens
│   └─ ui/                        # button, input, modal (Radix-based)
└─ lib/
    ├─ db.ts
    ├─ auth.ts
    ├─ image/                     # pipeline utility
    ├─ schema/                    # zod schémata
    ├─ i18n/
    ├─ theme/                     # token application, CSS var injection
    └─ patch.ts                   # JSON Patch apply
```

---

## 3. Pravidla pro core komponenty

- **Visual-skin agnostic.** Nesmí mít hardcoded barvy. Vše přes CSS variables z theme.
- **Headless logic + className API.** Konzument předává `className` pro vizuální skin.
- **Žádný tenant kontext uvnitř.** Pokud potřebují stav, čerpají z `EditorContext` (props), ne globální import.
- **Server-component-first.** Pouze `"use client"` když opravdu nutné (interakce, state).

---

## 4. Pravidla pro sections

Každá sekce:
- Server component by default.
- Pro editable části deleguje na `GenericEditable*` (které jsou client).
- Style scoped přes CSS Module (`skin.module.css`) — žádný globální leak.
- Žádný direct DB call. Data dostává jako prop.
- Žádný fetch v sekci. Loading řeší route v `app/`.

### Visual skin layer

Sekce má **stejnou kostru pro všechny varianty**, vizuální rozdíl řeší:
1. `skin.module.css` — gridy, spacing, dekorativní prvky (wave SVG, gradients).
2. `theme tokens` — barvy, fonty, radius.
3. **Variant-specific dekorace** (např. café-wave SVG mask) žije v `variants/cafe-wave/Decoration.tsx`.

Tím **technická uniformita ↔ vizuální unikátnost**.

---

## 5. Component API kontrakt

```ts
// universal section props
interface SectionComponentProps<C = unknown> {
  content: C;
  variant: string;
  isAdmin: boolean;
  tenantSlug: string;
  sectionId: number;
  theme: ThemeTokens;
}

// editable primitive
interface EditableProps {
  path: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

// layout primitive
interface ContainerProps {
  size?: "narrow" | "default" | "wide" | "bleed";
  padding?: "tight" | "normal" | "airy";
  children: ReactNode;
}
```

**Změna kontraktu = major bump core verze + migrace všech sekcí v jednom PR.**

---

## 6. Sdílené primitivy (`core/ui/`)

Postaveno na **Radix Primitives** (headless) + Tailwind. Konkrétně:

- `Button` (varianty: primary/secondary/ghost/link; skin přes theme)
- `Input`, `Textarea`, `Select`
- `Modal`, `Drawer`, `Popover`
- `Toast`
- `Tabs`, `Accordion`
- `Toolbar` (pro editor)

Žádné vlastní wheels — Radix má a11y vyřešený.

---

## 7. Reusable logika (`lib/` + hooks)

```
lib/
  path.ts             getPath, setPath, deletePath
  patch.ts            applyJsonPatch, createPatch
  text-diff.ts        snippet, changedFields
  schema-org.ts       buildLocalBusiness, buildArticle, buildBreadcrumb
  demo-href.ts        resolveDemoHref(slug, tenantSlug, isAdmin)
  image/
    optimize.ts
    upload.ts
    placeholder.ts
hooks/
  useEditorContext.ts
  useAutosave.ts
  useDebounce.ts
  useHistory.ts
```

**Duplicitní `getPathValue`/`setPathValue` v `TenantEditorView` a `TenantPublicView` (viz audit) se sjednotí sem.**

---

## 8. Konvence

- **Pojmenování:** PascalCase pro komponenty, camelCase pro funkce, kebab-case pro slug/key.
- **Soubory:** jeden export per soubor pro komponenty (`Hero.tsx` exportuje `Hero`).
- **Typy:** primárně inference z Zod schémat (`z.infer<typeof heroSchema>`).
- **Žádný default export** kromě Next.js route souborů.
- **Žádný barrel `index.ts`** který re-exportuje desítky věcí — zabíjí tree-shaking.

---

## 9. Anti-patterns

| ❌ | ✅ |
|---|---|
| Sekce importuje z `features/editor` | Editor obaluje sekci, ne naopak |
| Core komponenta s hardcoded `#fff` | Vše přes CSS variables theme |
| `'use client'` na celé sekci | Pouze editable wrapper je client |
| Hardcoded copy v komponentě | `useT('key')` i18n hook |
| Vlastní button v každé sekci | `core/ui/Button` s variantami |

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

