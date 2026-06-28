# MASTER ARCHITECTURE — Index a stav implementace

**Datum:** 2026-05-23
**Účel:** Mapuje 7 standardů na existující kód. Říká, **co už máme**, **co se musí upravit**, **co je nové**. Cílem je MAXIMÁLNĚ POUŽÍT existující řešení, ne stavět greenfield.

---

## 0. Sedm standardů — odkazy

1. [TEMPLATE_STANDARD.md](./TEMPLATE_STANDARD.md)
2. [LIVE_EDITOR_STANDARD.md](./LIVE_EDITOR_STANDARD.md)
3. [PAGE_BUILDER_STANDARD.md](./PAGE_BUILDER_STANDARD.md)
4. [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)
5. [IMAGE_PIPELINE_STANDARD.md](./IMAGE_PIPELINE_STANDARD.md)
6. [TENANT_DEPLOYMENT_FLOW.md](./TENANT_DEPLOYMENT_FLOW.md)
7. [SEO_PERFORMANCE_CHECKLIST.md](./SEO_PERFORMANCE_CHECKLIST.md)

---

## 1. TEMPLATE STANDARD — stav

| Požadavek | Existuje? | Soubor | Akce |
|-----------|-----------|--------|------|
| Template registry | ✅ | [src/lib/templates/index.ts](../src/lib/templates/index.ts) | Ponechat, rozšířit o load z JSON |
| Template definition typu | ✅ | [src/lib/templates/types.ts](../src/lib/templates/types.ts) | Upravit — přidat `i18n`, `baseTemplate`, oddělit `content` |
| `cafe-01` master | ✅ TS | [src/lib/templates/cafe-01.ts](../src/lib/templates/cafe-01.ts) | **Migrovat na `template.json` + `theme.json`** — pilotní krok |
| `designTokens` | ✅ částečně | uvnitř `cafe-01.ts:93-106` | Vytáhnout do `theme.json`, přidat Zod schéma |
| `placeholder` images | ✅ | [src/lib/templates/placeholder.ts](../src/lib/templates/placeholder.ts) | Nahradit `IMAGE_DIMENSIONS` katalogem |
| i18n content separace | ❌ | — | Nové — zavést `content/<lang>.json` per šablona |
| `baseTemplate` dědičnost | ❌ | — | Nové — implementovat JSON Patch overrides |
| Schema validace (Zod) | ❌ | — | Nové — `src/lib/schema/template.schema.ts` |
| Acceptance gate | ❌ | — | Nové — Lighthouse + visual gate v CI |

**Doporučený první krok:** vytvořit `template.schema.ts` (Zod) a v paralelním PR migrovat `cafe-01.ts` na `cafe-01/template.json + theme.json`. Loader `lib/templates/index.ts` přijímá oba formáty během přechodu.

---

## 2. LIVE EDITOR — stav

| Požadavek | Existuje? | Soubor | Akce |
|-----------|-----------|--------|------|
| Editor context | ✅ | [src/components/tenant/GenericInlineEditorContext.tsx](../src/components/tenant/GenericInlineEditorContext.tsx) | Ponechat, přesunout do `core/editable/EditorContext.tsx` |
| Editable text primitive | ✅ | [src/components/tenant/GenericEditableText.tsx](../src/components/tenant/GenericEditableText.tsx) | Ponechat, doplnit `maxLength`, `richText`, sanitizaci |
| Editable image primitive | ✅ | [src/components/tenant/GenericEditableImage.tsx](../src/components/tenant/GenericEditableImage.tsx) | Ponechat, napojit na novou pipeline (LQIP, async job) |
| Editable link primitive | ❌ | — | Nové — `GenericEditableLink.tsx` |
| Autosave + debounce | ✅ | uvnitř `GenericInlineEditorContext` (1500 ms) | Zvýšit na 2000 ms, přidat retry, `If-Match` header |
| Undo/redo | ✅ in-memory (30) | tamtéž | Doplnit načítání z `page_revisions` po refreshi |
| Save status UI | ✅ částečně | [src/components/tenant/TenantEditorView.tsx](../src/components/tenant/TenantEditorView.tsx) | Doplnit explicitní error stav + ručně-uložit tlačítko |
| Concurrent edit detection | ❌ | — | Nové — `If-Match` + 412 modal |
| Path utils (`get/setPathValue`) | ⚠️ DUPLIKACE | `TenantEditorView.tsx:34-80`, `TenantPublicView.tsx:33-54` | Sjednotit do `src/lib/path.ts` |
| Rich text sanitizace | ❌ | — | Nové — DOMPurify |
| Klávesové zkratky | ❌ | — | Nové |

**Editor jádro je v praxi hotové.** Hlavní práce: oddedupovat utility, doplnit save protokol (revision/If-Match) a sanitizaci.

---

## 3. PAGE BUILDER — stav

| Požadavek | Existuje? | Soubor | Akce |
|-----------|-----------|--------|------|
| PageBuilder UI | ✅ | [src/components/tenant/PageBuilder.tsx](../src/components/tenant/PageBuilder.tsx) | Ponechat, přesunout do `core/builder/`, odstranit hardcoded library |
| Section renderer | ✅ switch | [src/components/tenant/SectionRenderer.tsx](../src/components/tenant/SectionRenderer.tsx) | **Nahradit registry mapou** `SECTION_RENDERERS` + `dynamic()` |
| Section editor (form fallback) | ✅ | [src/components/tenant/SectionEditor.tsx](../src/components/tenant/SectionEditor.tsx) | Ponechat pro non-inline fieldy |
| Reorder / hide / duplicate | ✅ | `PageBuilder.tsx:197-210` | Přepsat reorder na batch endpoint |
| Hardcoded `SECTION_LIBRARY` | ⚠️ | `PageBuilder.tsx:36-66` | Nahradit auto-generací z `SECTION_VARIANTS` |
| Variant registry | ❌ | — | Nové — `src/sections/variants.ts` |
| Navbar/Footer lock backend | ❌ | jen UI | Doplnit validaci v `/api/.../sections` route |
| Drag & drop | ⚠️ částečně (arrows) | `PageBuilder.tsx` | Přidat `@dnd-kit/core` |
| Page presets | ❌ | — | Nové |

**Sekce existují** (15 ks v [src/components/sections/](../src/components/sections/)) — Hero, Services, About, BlogPreview, Testimonials, Gallery, Faq, Contact, Cta, Footer, Navbar, Team, Map, OpeningHours, RezoraWidget. Refaktor: rozdělit do `src/sections/<type>/variants/<key>/`.

---

## 4. COMPONENT ARCHITECTURE — stav

| Požadavek | Existuje? | Soubor | Akce |
|-----------|-----------|--------|------|
| Sections složka | ✅ | [src/components/sections/](../src/components/sections/) | **Přesunout do `src/sections/`** + rozdělit per variant |
| Tenant editor složka | ✅ | [src/components/tenant/](../src/components/tenant/) | Rozdělit: editable → `core/editable`, builder → `core/builder`, view → `features/public-site` + `features/editor` |
| Astera template wrapper | ✅ izolovaný | [src/components/templates/](../src/components/templates/) | Posoudit: buď deprekovat (převést na standardní šablonu), nebo izolovat jako legacy |
| Core UI (button, modal) | ❌ explicitní | — | Nové — `src/components/core/ui/` (Radix-based) |
| Layout primitives | ❌ | — | Nové — `Container`, `Section`, `Grid` v `core/layout/` |
| Lib utility split | ✅ částečně | [src/lib/](../src/lib/) má: auth, db, image-source, media-storage, overrides, content-types | Doplnit: `path.ts`, `text-diff.ts`, `schema-org.ts`, `demo-href.ts`, `patch.ts` |
| Overrides logic | ✅ | [src/lib/overrides.ts](../src/lib/overrides.ts) | Ověřit, jestli odpovídá JSON Patch modelu; pokud ne, refaktorovat |

**Velký refaktor adresářů** — naplánovat jako jednu velkou změnu (jeden PR), aby se nepřeplnily importy chaosem.

---

## 5. IMAGE PIPELINE — stav

| Požadavek | Existuje? | Soubor | Akce |
|-----------|-----------|--------|------|
| Upload endpoint | ✅ | `src/app/api/demo/[tenantSlug]/upload-image/route.ts` | Rozšířit: validace, async job, LQIP |
| Media storage | ✅ | [src/lib/media-storage.ts](../src/lib/media-storage.ts) | Zkontrolovat: drží už AVIF? S3-kompatibilní? |
| Image source utility | ✅ | [src/lib/image-source.ts](../src/lib/image-source.ts) | Rozšířit o `dimensions` katalog |
| Image formats utility | ✅ | [src/lib/image-formats.ts](../src/lib/image-formats.ts) | Ověřit AVIF/WebP/JPG matrix |
| `IMAGE_DIMENSIONS` katalog | ❌ | — | Nové — `src/lib/image/dimensions.ts` |
| Async job queue | ❌ | — | Nové — minimálně `setImmediate` background, ideálně BullMQ |
| LQIP generování | ❌ | — | Nové — sharp `.resize(24).blur().toBuffer()` → base64 |
| Crop / focal point UI | ❌ | — | Nové — `react-easy-crop` |
| Next.js custom loader | ❌ | — | Nové — `lib/image/loader.ts` |
| Rate limit & max-size | ❌ | — | Nové |

**Základ existuje** (storage, formats, source). Chybí: dimensions katalog, async pipeline, LQIP, custom loader. Doporučuji nasadit jako jeden samostatný balík.

---

## 6. TENANT DEPLOYMENT — stav

| Požadavek | Existuje? | Soubor | Akce |
|-----------|-----------|--------|------|
| DB schéma (tenants, pages, sections, media, domains, subscriptions) | ✅ | [src/lib/db.ts:15-200](../src/lib/db.ts) | Ponechat, doplnit `pages.status`, `pages.publishedRevisionId`, `pages.draftRevisionId` |
| `page_revisions` tabulka | ✅ existuje | `db.ts` | Připojit ke save protokolu editoru |
| Tenant factory | ✅ | [src/lib/tenant-factory.ts:68-102](../src/lib/tenant-factory.ts) | Ponechat, doplnit asset import job |
| Tenant resolve middleware | ⚠️ | route-level v `app/demo/[tenantSlug]/` | Posoudit: stačí to, nebo přidat host-based pro custom domény |
| Custom domain flow | ❌ | (tabulka `domains` existuje) | Nové — DNS check worker, ACME issuance |
| Draft/published model | ❌ | jen `tenants.status` | Nové — na úrovni `pages` + `publish` endpoint |
| Preview tokens | ❌ | — | Nové |
| RLS (row-level security) | ❌ | — | Nové — `SET LOCAL app.tenant_id` per transakce |
| Audit log | ⚠️ existuje v API | sections/route.ts používá `auditLog` | Sjednotit do `audit_events` tabulky, dotáhnout všude |
| Settings JSONB | ⚠️ pravděpodobně | `tenants` row | Ověřit, doplnit Zod validátor |
| Backup/restore | ❌ | — | Nové (operační) |

**Schéma a factory existují** — chybí draft/published a custom-domain operace. Doporučuji jako samostatný projekt po template refactoru.

---

## 7. SEO & PERFORMANCE — stav

| Požadavek | Existuje? | Soubor | Akce |
|-----------|-----------|--------|------|
| `generateMetadata` | ✅ | [src/app/demo/[tenantSlug]/page.tsx:17-38](../src/app/demo/%5BtenantSlug%5D/page.tsx) | Rozšířit: `alternates.languages`, JSON-LD link |
| Sitemap | ✅ | [src/app/sitemap.ts](../src/app/sitemap.ts) | Ověřit: jen published + custom domain tenanti |
| Robots noindex (admin) | ✅ | [next.config.ts:39-44](../next.config.ts) | OK |
| CSP | ⚠️ slabá | [next.config.ts:14-26](../next.config.ts) | **Odstranit `unsafe-eval`**, nasadit nonce |
| JSON-LD builders | ❌ explicitní | — | Nové — `src/lib/schema-org.ts` |
| OG image generator | ❌ | — | Nové — pipeline preset `og-image` |
| Lighthouse CI gate | ❌ | — | Nové — GitHub Action |
| Cache headers | ⚠️ defaultní | — | Doplnit explicitně dle tabulky v SEO checklistu |
| Cookie consent | ❌ explicitní | — | Nové |

---

## 8. CRITICAL PATH (pořadí prací)

| # | Krok | Závisí na | Dopad |
|---|------|-----------|-------|
| 1 | **CSP fix** (remove `unsafe-eval`, sandbox ClonedSiteRenderer) | nic | bezpečnost |
| 2 | **Schema vrstva** — `template.schema.ts`, `theme.schema.ts`, `section.schema.ts` (Zod) | nic | basis pro vše dál |
| 3 | **Dedupe utility** (`path.ts`, `text-diff.ts`, `demo-href.ts`) | nic | čistí cestu refaktoru |
| 4 | **Section + Variant registry** (`SECTION_RENDERERS`, `SECTION_VARIANTS`) | #2 | odblokuje škálování |
| 5 | **Migrace cafe-01 na JSON manifest** (pilot) | #2, #4 | důkazní bod modelu |
| 6 | **Image pipeline rebuild** (dimensions katalog, LQIP, async job, AVIF) | nic | perf + UX |
| 7 | **Draft/published model** (DB + API + UI publish flow) | nic | core SaaS feature |
| 8 | **i18n framework** (`next-intl`, extrakce CZ stringů) | #2 | mezinárodní expanze |
| 9 | **Custom domain flow** (DNS check, ACME) | #7 | enterprise feature |
| 10 | **Velký adresářový refaktor** (`sections/`, `core/`, `features/`) | #4, #5 | čistota — dělat v jednom PR |
| 11 | **Lighthouse CI + acceptance gates** | #6 | quality gate před publish |

---

## 9. Co se NEMĚNÍ (existující kód, který přežije)

- **DB schéma** (`tenants`, `pages`, `sections`, `media`, `domains`, `subscriptions`, `page_revisions`).
- **API auth & validation** (`requireTenantAdmin`, `assertSameOrigin`, Zod, `withTransaction`, `auditLog`).
- **Tenant factory & provisioning**.
- **Editor primitives** (`GenericEditableText/Image`, `GenericInlineEditorContext`).
- **15 section komponent** (Hero, Services, About, BlogPreview, Testimonials, Gallery, Faq, Contact, Cta, Footer, Navbar, Team, Map, OpeningHours, RezoraWidget) — refaktor jen do nové adresářové struktury + sjednocení props.
- **Sitemap, basic metadata, noindex admin**.

---

## 10. Co se RUŠÍ / migruje

- **`cafe-01.ts` jako TS soubor** → `cafe-01/template.json + theme.json + content/*.json` (po pilotu).
- **`placeholderImage(w, h, label)`** s hardcoded čísly → odkaz přes `IMAGE_DIMENSIONS["hero"]`.
- **`SECTION_LIBRARY` hardcoded array** → generování z `SECTION_VARIANTS`.
- **`SectionRenderer.tsx` switch case** → registry mapa.
- **Hardcoded CZ stringy** v UI → i18n klíče.
- **`ClonedSiteRenderer`** s raw HTML inject → buď do iframe sandboxu, nebo deprekovat (nahradit nativní section variantami z auditu klonu).
- **Duplikované `getPathValue/setPathValue/textSnippets/changedField`** ve dvou souborech → jeden `lib/path.ts`.

---

## 11. Fáze 2 — DONE

Tento dokument + 7 standardů jsou hotové. **Zatím se NIC nerefaktoruje.** Standardy slouží jako:
- Reference pro PR review (každý PR musí splnit dotčený standard).
- Acceptance kritéria pro nové šablony.
- Roadmap pro Fázi 3 (refaktor jádra).

Fáze 3 by měla začít kroky #1 a #2 z critical path (CSP fix + schema vrstva).
