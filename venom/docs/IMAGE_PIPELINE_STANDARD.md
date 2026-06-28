# IMAGE_PIPELINE_STANDARD.md

**Status:** Standard v2 — AVIF zakázán
**Datum:** 2026-05-25

---

## 1. Cíl

Jeden image pipeline pro celý Webero. Uživatel uploaduje libovolný obraz; systém vrátí **WebP + JPG (100 % fallback)** v responsivních variantách s LQIP placeholderem. Žádná sekce neimplementuje vlastní handling.

> **⛔ AVIF je zakázán napříč celou platformou.** Nepodporujeme AVIF — výstupní formáty jsou výhradně **WebP** (primární) a **JPEG/MozJPEG** (fallback). Toto pravidlo platí absolutně: v kódu, pipeline, šablonách, konfiguraci sharp i v `<picture>` zdrojích.

---

## 2. Tech stack

| Vrstva | Volba | Důvod |
|--------|-------|-------|
| Processing | **sharp** (libvips) | rychlé, server-side, podporuje WebP/MozJPEG |
| Storage | **S3-kompatibilní** (Cloudflare R2 v produkci, local FS v dev) | nezávislé na hostingu |
| CDN | **Cloudflare** před R2 | edge cache, transformace fallback |
| Optimization API | vlastní `/api/img/[...path]` | kontrola, žádný third-party lock |
| Client | `next/image` s custom loader | srcSet a sizes automaticky |

---

## 3. Upload flow

```
Client                       API                     Worker                  Storage
  │ POST multipart            │                        │                        │
  │ ───────────────────────► │                        │                        │
  │                          │ validate (size,mime)   │                        │
  │                          │ store original         │                        │
  │                          │ ──────────────────────────────────────────────► │
  │                          │ enqueue job            │                        │
  │ ◄─── 202 { jobId, lqip } │                        │                        │
  │                          │                        │ pickup, sharp pipeline │
  │                          │                        │ ──────────────────────►│
  │                          │                        │ write variants         │
  │ poll GET /jobs/:id       │                        │                        │
  │ ◄─── 200 { manifest }    │                        │                        │
```

**LQIP** (Low-Quality Image Placeholder) se generuje **synchronně** při uploadu (24px wide blurred base64 ~600 B) → editor okamžitě má placeholder, finální URL doplní polling.

---

## 4. Validace uploadu

| Kritérium | Limit | Behavior on fail |
|-----------|-------|------------------|
| MIME | `image/jpeg|png|webp|heic` | 415 |
| Velikost | ≤ 25 MB | 413 |
| Min rozměr | 200×200 px | 422 + hint |
| Max megapixely | 50 MP | 422, downscale before processing |
| Animace | první frame jen | warning v response |
| EXIF GPS | strip | silent |

---

## 5. Variant matrix

Pro každý uploadovaný obraz se generují **3 formáty × N šířek**:

| Šířky (px) | Použití |
|-----------|---------|
| 320, 480, 640, 960, 1280, 1600, 1920 | běžné `<img>` |
| 1920, 2560, 3200 | hero / fullbleed |

Format priorita: **WebP → JPG (MozJPEG q=82)**. AVIF se **negeneruje ani nepoužívá**.

Output struktura v storage:
```
tenants/{tenantId}/img/{hash}/orig.jpg
                              w320.webp  w320.jpg
                              w640.webp  w640.jpg
                              ...
                              meta.json   # { width, height, lqip, srcSet }
```

`hash` = sha256 prvních 16 znaků obsahu (deduplikace cross-tenant zakázáná z důvodu izolace).

---

## 6. Dimension katalog (`IMAGE_DIMENSIONS`)

Centrální `src/lib/image/dimensions.ts`:

```ts
export const IMAGE_DIMENSIONS = {
  "hero":           { aspect: 5/2,  sizes: "100vw" },
  "hero-split":     { aspect: 4/3,  sizes: "(min-width:1024px) 50vw, 100vw" },
  "service-card":   { aspect: 4/3,  sizes: "(min-width:1024px) 33vw, 100vw" },
  "blog-card":      { aspect: 4/3,  sizes: "(min-width:768px) 50vw, 100vw" },
  "gallery-tile":   { aspect: 1,    sizes: "(min-width:768px) 25vw, 50vw" },
  "avatar":         { aspect: 1,    sizes: "80px" },
  "logo":           { aspect: null, sizes: "200px" },
  "og-image":       { aspect: 1.91, sizes: null /* social */ },
} as const;
```

Sekce **odkazuje klíčem**, ne hardcoded číslem:
```tsx
<GenericEditableImage path="home.hero.image" dimensions="hero" />
```

Pipeline crop → `aspect`, srcSet → `sizes`. Změna velikosti = úprava jednoho katalogu, ne 100 šablon.

---

## 7. Render (next/image custom loader)

```tsx
<Image
  src={url}
  loader={weberoLoader}
  alt={alt}
  fill
  sizes={IMAGE_DIMENSIONS[dim].sizes}
  placeholder="blur"
  blurDataURL={lqip}
  priority={isAboveFold}
/>
```

Loader vrací `/api/img/{hash}?w={width}&f={webp|jpg}`. Edge worker stáhne pre-rendered variantu z R2 (žádná on-demand transformace, vše předgenerované při uploadu). Parametr `f=avif` je **zakázán a vrátí 400**.

---

## 8. Crop / Focal point

- Editor zobrazí crop modal (lib: `react-easy-crop`) při uploadu.
- Tenant volí: free-form crop / lock to aspect z `dimensions`.
- Focal point (`x%, y%`) se uloží do `meta.json` → loader posílá `&fx=50&fy=30` → server crop kolem focal pointu.
- Default focal point = `50,50`.

---

## 9. Performance pravidla

| Pravidlo | Enforced kým |
|----------|--------------|
| Hero image = `priority` | core `Section` komponenta podle `aboveFold` prop |
| Ostatní = `loading="lazy"` | default v `next/image` |
| Žádný obraz nad fold bez LQIP | linter / build check |
| `<img>` bez `alt` | ESLint rule `jsx-a11y/alt-text` |
| WebP → vždy první volba, JPEG 100% fallback | `<picture>` s `type="image/webp"` source |
| OG image max 1200×630, q=85 | special pipeline branch |

---

## 10. Migrace existujících assetů

Při uploadu starých assetů (z klonovaných Costa apod.):
1. Skript `scripts/migrate-images.ts` projde `public/clones/**/*.{jpg,png}`.
2. Pro každý vytvoří job v image queue.
3. Update reference v `sections.settings` na nový hash URL.

---

## 11. Anti-patterns

| ❌ | ✅ |
|---|---|
| `<img src="/clones/costa/hero.jpg" />` 2.3 MB | pipeline upload + responsive variants |
| `placeholderImage(1600, 640)` v šabloně | placeholder z `IMAGE_DIMENSIONS["hero"]` |
| On-demand transformace (cdn.example/?w=) | pre-generated variants v storage |
| Synchronous variant generation v request | async job + LQIP okamžitě |
| Per-template hardcoded rozměry | centrální `IMAGE_DIMENSIONS` katalog |

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

