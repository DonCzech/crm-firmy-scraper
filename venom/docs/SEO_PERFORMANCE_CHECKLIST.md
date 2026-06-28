# SEO_PERFORMANCE_CHECKLIST.md

**Status:** Standard v2 — mobile section zpřísněna; AVIF zakázán
**Datum:** 2026-05-25

---

## 1. Metadata (Next.js `generateMetadata`)

Pro každou public page povinně:

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { tenant, page } = await loadTenantPage(params);
  return {
    title: applyTitleTemplate(page.seoTitle, tenant.settings.seo.titleTemplate),
    description: page.seoDescription ?? tenant.settings.seo.defaultDescription,
    alternates: {
      canonical: canonicalUrl(tenant, page),
      languages: buildAlternates(tenant, page),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl(tenant, page),
      title: page.seoTitle,
      description: page.seoDescription,
      images: [{ url: ogImageUrl(tenant, page), width: 1200, height: 630 }],
      locale: page.locale,
      siteName: tenant.settings.branding.siteName,
    },
    twitter: { card: "summary_large_image", ...},
    robots: page.status === "published"
      ? tenant.settings.seo.robots
      : { index: false, follow: false },
  };
}
```

### Kontrola
- [ ] Každá public route má `generateMetadata`.
- [ ] Demo a admin routes → `robots: noindex, nofollow`.
- [ ] `canonical` absolute URL.
- [ ] `alternates.languages` pro každý lang variant stránky.
- [ ] OG image existuje a má 1200×630 (pipeline preset `og-image`).

---

## 2. JSON-LD strukturovaná data

Komponenta `<JsonLd>` injektuje `<script type="application/ld+json">` v `<head>`.

### Povinné typy

| Typ | Kde | Builder |
|-----|-----|---------|
| `Organization` / `LocalBusiness` | každá stránka | `buildLocalBusiness(tenant)` |
| `WebSite` + `SearchAction` | homepage | `buildWebsite(tenant)` |
| `BreadcrumbList` | každá vnitřní stránka | `buildBreadcrumb(page)` |
| `Article` / `BlogPosting` | blog post | `buildArticle(post)` |
| `Product` / `Service` | service/product detail | `buildService(item)` |
| `FAQPage` | sekce FAQ | `buildFaq(items)` |

Vše centralizováno v `src/lib/schema-org.ts`.

### Kontrola
- [ ] LocalBusiness obsahuje `address`, `geo`, `openingHours`, `telephone`.
- [ ] Žádné duplicitní `@id` v rámci stránky.
- [ ] Validováno přes Schema.org validator (CI step).

---

## 3. HTML / Accessibility základ

- [ ] `<html lang="cs">` (dynamicky podle page locale).
- [ ] Jeden `<h1>` per page (Hero sekce).
- [ ] Heading hierarchy bez skoků (h1 → h2 → h3).
- [ ] Všechny `<img>` mají `alt` (background images mohou mít prázdný `alt=""`).
- [ ] Form fieldy mají `<label>` (asociovaný).
- [ ] Kontrast min. WCAG AA (4.5:1 text, 3:1 large).
- [ ] Focus visible (žádný `outline: none` bez náhrady).
- [ ] Keyboard navigable (žádné `tabIndex={-1}` na interaktivních prvcích).

---

## 4. Sitemap & robots

```ts
// app/sitemap.ts
export default async function sitemap() {
  const tenants = await db.tenantsWithCustomDomain();
  return tenants.flatMap(t =>
    t.publishedPages.map(p => ({
      url: `https://${t.primaryDomain}${p.path}`,
      lastModified: p.publishedAt,
      changeFrequency: "weekly",
      priority: p.isHomepage ? 1.0 : 0.7,
    }))
  );
}
```

- [ ] `sitemap.xml` jen pro `published` stránky tenantů s custom domain.
- [ ] `robots.txt` → `Disallow: /demo/*/admin/`.
- [ ] Demo subdomény mají `X-Robots-Tag: noindex` v middleware.

---

## 5. Performance budgety

| Metrika | Budget | Měřeno |
|---------|--------|--------|
| LCP | ≤ 2.0 s | Lighthouse mobile + RUM |
| INP | ≤ 200 ms | RUM |
| CLS | ≤ 0.05 | Lighthouse + RUM |
| TBT | ≤ 200 ms | Lighthouse |
| TTFB | ≤ 600 ms | edge log |
| Total JS (gzipped) | ≤ 150 kB | bundle analyzer CI |
| Total CSS (gzipped) | ≤ 30 kB | CI |
| Hero image | ≤ 200 kB (WebP) / ≤ 350 kB (JPEG fallback) | pipeline output |

CI fail-on-regression: PR proti `main` spouští Lighthouse na demo tenantu; pokud kterákoli metrika klesne > 5 % → PR block.

---

## 6. Loading strategie

- [ ] Hero/above-fold image: `priority`, `fetchpriority="high"`.
- [ ] Below-fold image: `loading="lazy"`.
- [ ] Sekce → dynamic import (code-split) v `SECTION_RENDERERS`.
- [ ] Tracking skripty (GA4, Plausible): `next/script` se `strategy="afterInteractive"`.
- [ ] Cookie consent banner: SSR shell, JS hydratuje async.
- [ ] Fonty: `display: swap`, self-hosted (žádný blocking Google Fonts request).
- [ ] Critical CSS: inline pro above-fold sekce (Next.js to dělá automaticky pro CSS Modules).

---

## 7. Hydratace

- [ ] Server-component-first. Client components jen pro: editor, formuláře, slidery, mapy.
- [ ] Žádný velký state v root layoutu → zbytečná hydratace.
- [ ] `next/dynamic({ ssr: false })` pouze pro browser-only widgety (mapa, embed).
- [ ] Žádný `useEffect` fetch pro above-fold data — fetch na serveru a předat props.

---

## 8. CSP & bezpečnost (perf souvislost)

Aktuální CSP v `next.config.ts` má `'unsafe-inline' 'unsafe-eval'` — **nutno opravit**:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{...}' https://plausible.io;
  style-src 'self' 'unsafe-inline';   /* unavoidable kvůli inline kritickému CSS */
  img-src 'self' data: https://cdn.webero.cz;
  font-src 'self' data:;
  connect-src 'self' https://plausible.io;
  frame-ancestors 'none';
```

- [ ] Nonce-based script CSP (Next.js middleware injekce).
- [ ] Žádný `dangerouslySetInnerHTML` bez sanitizace.
- [ ] ClonedSiteRenderer (XSS risk z auditu) → buď deprekovat, nebo iframe sandbox.

---

## 9. Cache strategie

| Resource | Cache-Control |
|----------|---------------|
| HTML (public published) | `public, s-maxage=60, stale-while-revalidate=86400` |
| HTML (admin/draft) | `private, no-store` |
| Image variants | `public, max-age=31536000, immutable` |
| JS/CSS chunks | `public, max-age=31536000, immutable` (hash v name) |
| `/api/*` | `private, no-store` (default) |

ISR (Incremental Static Regeneration) `revalidate: 60` pro public stránky. Při `publish` event → on-demand `revalidatePath`.

---

## 10. Tracking & analytika

- [ ] Plausible (zero-cookie) jako default.
- [ ] GA4 pouze pokud tenant explicitně zapne + cookie consent OK.
- [ ] Žádný tag manager auto-injekce — vše přes settings.

---

## 11. Mobilní — POVINNÉ (každá šablona před publish)

> Tato sekce vychází z auditu cafe-01-demo/studio. Lighthouse mobile skóre ≥ 90 je **nutná podmínka**, nikoliv cíl — tato pravidla ji zajišťují strukturálně.

### 11.1 Viewport & základní responsivita
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` přítomno v `<head>`.
- [ ] **Žádný horizontal scroll** na viewport 360 px — testováno fyzicky v DevTools + reálné zařízení.
- [ ] `overflow-x: hidden` na `<body>` nebo `<html>` je příznak problému, ne fix — identifikovat a opravit příčinu.
- [ ] Žádný element s `width` nebo `min-width` tvrdě nastaveným na px hodnotu > 360 px bez `max-width: 100%`.

### 11.2 Hlavička (navbar) na mobilu — KRITICKÁ OBLAST
- [ ] Logo v navbar má `max-height` (doporučeno ≤ 48 px na mobilu) a nepřetéká kontejner.
- [ ] Hamburger menu tlačítko: min. 44×44 px touch area, viditelné i na bílém/světlém pozadí (kontrast ≥ 3:1).
- [ ] Sticky header na mobilu: `position: sticky; top: 0` + `z-index` nad hero sekcí, nesmí zakrývat kotvy (`scroll-margin-top` na cílových sekcích).
- [ ] Mobilní menu (otevřené): neposunuje page content (fixed/absolute overlay, ne push).
- [ ] Mobilní menu: zavírá se kliknutím na backdrop + klávesou Esc.
- [ ] Žádný navbar obsah skrytý přes `display: none` bez mobilní alternativy (např. kontaktní číslo musí být dostupné i na mobilu).
- [ ] Výška hlavičky nepřesahuje 64 px na 360 px viewportu.
- [ ] **Studio mobile preview**: hlavičku ověř i v `/demo/<slug>/studio` při náhledu Mobile (390 px). Tailwind responsive prefixy (`lg:`, `md:`) reagují na window width, ne na canvas — pokud logo používá `lg:left-12 lg:translate-x-0` (nebo jiné poziční `lg:` třídy), musí mít odpovídající base třídy pro mobilní vystředění (`left-1/2 -translate-x-1/2`), jinak v náhledu překryje hamburger.

### 11.3 Typografie na mobilu
- [ ] Body text ≥ 16 px na mobilu (iOS automaticky zoomuje při < 16 px v input fields — zabráníme).
- [ ] H1 ve viewport 360 px: `font-size` via `clamp()` nebo `vw` jednotky, nesmí přesahovat přes viewport ani být menší než 24 px.
- [ ] Řádkování (`line-height`) ≥ 1.4 pro body text, ≥ 1.2 pro headings na mobilu.
- [ ] Žádné `white-space: nowrap` na prvcích, které mohou obsahovat delší text.

### 11.4 Tap targets & interakce
- [ ] Všechny klikatelné prvky (tlačítka, linky, ikony) ≥ **44×44 px** touch target (použij `padding`, ne `min-height` samotný).
- [ ] Mezi sousedními tap targets minimálně **8 px** mezera.
- [ ] CTA tlačítka na mobilu: `width: 100%` nebo alespoň `min-width: 200 px`, aby šla pohodlně trefit palcem.
- [ ] Formulářová pole: `font-size: 16px` minimum (jinak iOS zoom).

### 11.5 Obrázky na mobilu
- [ ] Hero image srcSet obsahuje `w320` a `w480` varianty — pipeline je generuje automaticky.
- [ ] `<img sizes="...">` nebo `next/image sizes` odpovídá skutečné CSS šířce na mobilu (ne výchozí `100vw` pro obrázky v 50% sloupci).
- [ ] Hero image na mobilu není vyšší než 60 vh — použít `aspect-ratio` nebo `max-height`.
- [ ] Žádná hero background-image bez `background-size: cover` + `background-position: center`.
- [ ] WebP s JPEG fallback v `<picture>` — AVIF se nepoužívá nikdy.

### 11.6 Spacing & layout na mobilu
- [ ] Sekce mají `padding-inline: clamp(16px, 5vw, 32px)` na mobilu — žádný obsah na samém kraji obrazovky.
- [ ] Grid/Flex layouts se na mobilu přeloží do jednoho sloupce (`flex-direction: column` nebo `grid-cols-1`).
- [ ] Cards/service tiles na mobilu: plná šířka nebo 2 sloupce max.
- [ ] Žádný absolutně pozicovaný element, který na mobilu přesahuje viewport.

### 11.7 Výkon na mobilu
- [ ] **LCP ≤ 2.5 s na simulovaném 4G** (Lighthouse mobile throttling) — hero image musí mít `priority` / `fetchpriority="high"`.
- [ ] **CLS < 0.1** — obrázky bez explicitních `width`+`height` nebo `aspect-ratio` způsobují CLS; všechny obrázky musí mít rozměry.
- [ ] Žádné `vh` jednotky v kritických layoutech — použij `dvh` (dynamic viewport height) nebo pevné px pro sticky prvky.
- [ ] Fonty: `font-display: swap`, self-hosted, preloaded v `<head>`.
- [ ] `preload` pro hero image (LCP element) v `<head>`: `<link rel="preload" as="image" href="hero.webp">`.

### 11.8 Mobilní Lighthouse gate (NUTNÁ podmínka před publish)

| Check | Threshold | Nástroj |
|-------|-----------|---------|
| Performance score | **≥ 90** | Lighthouse mobile CI |
| LCP | **≤ 2.5 s** | Lighthouse mobile |
| CLS | **≤ 0.1** | Lighthouse mobile |
| TBT | **≤ 300 ms** | Lighthouse mobile |
| Tap targets | 0 violations | Lighthouse A11y |
| Text readable | 0 violations | Lighthouse A11y |
| Viewport configured | PASS | Lighthouse |

**Všechny musí projít. Jeden FAIL = blokace publish.**

### 11.9 Manuální test (DevTools, 360×800)
- [ ] Navbar vypadá správně, hamburger funguje.
- [ ] Hero sekce viditelná bez scrollu, CTA tlačítko dostupné palcem.
- [ ] Žádný text oříznutý nebo skrytý mimo viewport.
- [ ] Galerie/slider funguje swipem.
- [ ] Footer čitelný, linky klikatelné bez zoomu.

---

## 12. Acceptance checklist (před `publish`)

| Check | Tool |
|-------|------|
| Lighthouse Perf ≥ 90 (mobile) | CI |
| Lighthouse SEO ≥ 95 | CI |
| Lighthouse A11y ≥ 95 | CI |
| JSON-LD valid | Schema.org validator |
| Žádný broken link | linkinator |
| OG image preview | opengraph.xyz |
| Rich results | Google Rich Results Test |
| robots.txt + sitemap dostupné | smoke test |
| CSP bez `unsafe-eval` | response header check |

Bez všech ✅ → publish blokován v UI.

---

## 13. Anti-patterns

| ❌ | ✅ |
|---|---|
| `<title>` v komponentě | `generateMetadata` v route |
| JSON-LD inline v sekci | `<JsonLd>` v layout, builder z `lib/schema-org` |
| Hero img 2.3 MB JPG | WebP přes pipeline + `priority` + JPEG fallback |
| `useEffect` fetch homepage data | Server fetch v RSC, props down |
| Cookie consent blokuje render | SSR shell, JS hydrate later |
| Demo URLs indexované | `robots: noindex` + middleware header |
| **AVIF obraz kdekoliv** | **Zakázáno — pouze WebP + JPEG** |
| `<img>` bez `width`+`height` | Explicitní rozměry nebo `aspect-ratio` (CLS!) |
| `overflow-x:hidden` jako fix scroll | Najít a opravit přetékající element |
| `vh` v sticky/hero layoutech | `dvh` nebo px |
| Fonty z Google Fonts bez preload | Self-hosted + `font-display:swap` + `<link rel="preload">` |

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

