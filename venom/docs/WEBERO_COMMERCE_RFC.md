# Webero Commerce — RFC + stav implementace

Datum: 2026-07-09 · Autor: Claude Fable · Zadání: `docs/WEBERO_COMMERCE_CLAUDE_BRIEF.md`

## Rozhodnutí (Fáze 0 → 1)

### Architektura

1. **Oddělené schéma.** Commerce tabulky žijí v `src/lib/commerce/schema.ts` s vlastním
   `initCommerceDb()`. `src/lib/db.ts` zůstává platformní jádro — commerce DDL se spouští
   lazy, jen když se sáhne na commerce code path. 1000+ website tenantů commerce init
   nikdy nezaplatí.
2. **Do `db.ts` přibyly jen metadata sloupce** (idempotentní ALTER):
   `tenants.tenant_kind` (`website`|`commerce`), `templates.kind`, `templates.tags`,
   `templates.commerce_capabilities`.
3. **Produktová data nikdy v `sections.settings`.** Storefront čte z commerce tabulek
   přes typed helpers (`src/lib/commerce/*`).
4. **Peníze = integer haléře** (`*_cents`), konzistentní s `gopay_payments.amount_cents`.
   DPH v procentech (int). Výchozí režim `inclusive` (ceny vč. DPH, český B2C).
5. **Varianty vždy.** Každý produkt má ≥1 variantu (`is_default`). Definice options jsou
   Fázi 1 JSONB na produktu (`options`) + `option_values` na variantě; normalizace do
   `product_options`/`product_option_values` je připravená pozdější migrace (viz brief).
6. **Audit všude:** `stock_movements` (každá změna skladu vč. důvodu a aktéra),
   `order_events` (timeline objednávky), `commerce_slug_redirects` (SEO historie slugů),
   platformní `audit_log` pro mutace produktů/shopu.
7. **Objednávka = snapshot.** `orders` + `order_items` ukládají ceny, DPH, tituly, SKU
   a adresy jako kopie; FK na produkt/variantu jsou `ON DELETE SET NULL`.
8. **Stavové přechody validované** (`canTransitionOrder`), storno vrací sklad.
   Order number: `shops.order_number_prefix + rok + atomická sekvence` (`OBJ202600001`).

### ERD (Fáze 1)

```
tenants 1─1 shops
tenants 1─* product_categories (tree přes parent_id)
tenants 1─* products 1─* product_variants
                    1─* product_images
                    *─* product_categories (product_category_links)
product_variants 1─* stock_movements
tenants 1─* customers 1─* customer_addresses
tenants 1─* orders 1─* order_items (snapshot)
                  1─* order_events
tenants 1─* commerce_slug_redirects
```

Odloženo do dalších fází: `carts`, `checkouts`, `commerce_payments`, `shipments`,
`returns/refunds`, `discounts`, `price_lists`, `inventory_locations`, `feeds`,
`import_jobs`, `webhook_endpoints`.

### API (Fáze 1, auth = requireTenantAdmin cookie + same-origin)

```
GET/POST      /api/demo/:slug/commerce/products
GET/PATCH/DEL /api/demo/:slug/commerce/products/:id     (DELETE = archive)
GET/POST      /api/demo/:slug/commerce/categories
GET/PATCH/DEL /api/demo/:slug/commerce/categories/:id
GET/POST      /api/demo/:slug/commerce/orders           (POST = manuální objednávka)
GET/PATCH     /api/demo/:slug/commerce/orders/:id       (stav/platba/poznámka)
GET/PATCH     /api/demo/:slug/commerce/settings
POST          /api/demo/:slug/commerce/stock            (rychlá skladová korekce)
```

Guard: `src/lib/commerce/api-guard.ts` (403 origin → 401 auth → 404 bez shopu).
Vstupy: Zod schémata v `src/lib/commerce/api-schemas.ts`.

### Onboarding + šablony

- Manifest (`template.json`) nově podporuje `kind`, `tags`, `commerceCapabilities`
  (strict schema, vše optional s defaulty → 90+ webových šablon beze změny validní).
- `createDemoTenantFromTemplate` přijímá `intent: "web" | "eshop"`. Commerce aktivace
  (`activateCommerceInTx`) běží **ve stejné transakci** jako vznik tenanta:
  `tenant_kind='commerce'` + shop row + 7 commerce modulů + demo katalog
  (4 kategorie, 6 produktů s variantami a skladem).
- Galerie `/vybrat-design` má tab **E-shop** (filtr přes `templates.kind`,
  ne slug prefix). `/api/templates/approved` vrací `kind`.

### UI skeletony (Fáze 1)

- **Admin `/demo/:slug/admin/obchod`** — dense tabulky (Produkty / Objednávky /
  Kategorie / Nastavení), `/` fokusuje hledání, inline změny stavů objednávky
  s validovanými přechody, timeline, low-stock zvýraznění. Žádné marketingové karty.
- **Storefront `/demo/:slug/obchod`** — server-rendered listing s kategoriemi a
  paginací; `/obchod/:productSlug` PDP s Product JSON-LD, redirect starých slugů,
  varianty, vyprodáno stavy. CTA košíku je disabled placeholder (Fáze 4).
- Demo tenanty mají `robots: noindex` na storefront stránkách.

## Co je hotovo (DoD Fáze 1)

- [x] e-shop tenant vzniká atomicky se shop row + seed produkty
- [x] API CRUD produkty/kategorie/objednávky/nastavení/sklad
- [x] žádné produktové jádro v section JSON
- [x] E-shop kategorie v galerii + onboarding intent
- [x] minimální produktový admin + storefront skeleton
- [x] lint + tsc čisté (jediná TS chyba v repu je předchozí WIP `HeroSection.tsx`)

## Další fáze (zkráceně, plné znění v briefu)

- **Fáze 2 — šablony:** 1. univerzální e-shop šablona (awwwards úroveň, max
  editovatelná), 2× Shoptet-style (disco/classic), pak fronta 20 inspirací
  (viz paměť `project_venom_commerce_templates_queue`). Commerce sekce napojené
  na design tokens; produkty vždy z DB.
- **Fáze 3 — admin:** produktový editor (variant matrix, media), bulk akce,
  command palette, virtualizace, dashboard.
- **Fáze 4 — checkout/platby/doprava:** carts, checkouts, GoPay (oddělené od
  subscription billingu), dobírka/převod, idempotentní webhooky, e-maily.
- **Fáze 5 — Shoptet migrace:** import_jobs, CSV/XML, mapping UI, redirect
  generator, dry-run report.
- **Fáze 6 — feedy/integrace**, **Fáze 7 — B2B/enterprise**.

## Známá rizika / dluh

- Options jako JSONB (viz rozhodnutí 5) — migrace na normalizované tabulky až
  bude potřeba smart-filtering podle option values.
- `fulfillment_status` se zatím nemění automaticky (bez shipments tabulky).
- Storefront skeleton nepoužívá design tokens šablony — nahradí ho commerce
  sekce ve Fázi 2.
- Produkční URL: `/demo/{slug}` je jen sandbox; pro ostrý provoz je potřeba
  host-based routing (custom domény + subdomény) — samostatný úkol, viz DEVLOG.
