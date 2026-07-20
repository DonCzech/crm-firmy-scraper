# Webero Commerce: zadani pro Claude Fable

Datum: 2026-07-09
Projekt: `CRM/venom` / Webero (`webero.co`)

## Hlavni cil

Pridat do Webero plnohodnotnou e-shopovou produktovou vetvi, ktera nebude kopii Shoptetu, Shopify ani WPJ. Cilem je postavit lepsi system: rychly, designove spickovy, modulovy, snadno migrovatelny ze Shoptetu a dost silny pro B2C, B2B i hybridni e-shopy.

Webero Commerce musi byt:

- kvalitnejsi designem nez genericke Shoptet sablony,
- dostupnejsi a rychlejsi nez zakazkova reseni typu WPJ,
- modulove rozsiritelny jako Shoptet/Shopify,
- profesionalni administraci a procesem migrace blizko WPJ,
- napojeny na soucasny onboarding, sablony, tenants, billing a studio Webero.

Zakladni princip: nedelame kopii konkurence. Stavime vlastni system, ktery resi stejne potreby lepe.

## Overene trzni body

WPJ verejne komunikuje WPJshop jako hybridni platformu s originalnim frontendem, analyzou, UX testovanim, ERP napojenim, prevodem dat, rychlym frontendem a dlouhodobou peci. Na strance e-shopu uvadi 220+ uspesnych e-shopu, 4,7 mil. objednavek za rok 2025, 11,1 mld. Kc trzeb za rok 2025 a proces prevodu e-shopu do 3 mesicu.

Shoptet verejne komunikuje 47 346 internetovych obchodu, 91 mld. Kc rocni obrat, 43 mil. objednavek za rok, 30 dni zdarma, prehlednou administraci, Shoptet Pay, Shoptet Baliky, Shoptet Kampane, doplnky a partner ecosystem. Marketplace doplnku ma kategorie Premium, Marketing, Logistika, Platby, Sablony, Vzhled, Produkty, Sprava obchodu a AI.

Shopify verejne stavi na globalnim checkoutu, online/POS/AI prodeji, B2B katalogach, inventory locations, Shopify Sidekick AI, app store a 16 000+ aplikacich. Na ceniku zobrazuje Basic/Grow/Advanced/Plus, plus podporu social/marketplace kanalu a AI chat prodej.

Zdroje:

- https://www.wpj.cz/e-shopy/
- https://www.wpj.cz/reference/
- https://www.shoptet.cz/
- https://www.shoptet.cz/cenik/
- https://doplnky.shoptet.cz/
- https://www.shopify.com/pricing
- https://apps.shopify.com/

## Soucasny stav Webero v repozitari

Relevantni projekt je `CRM/venom`.

Stack:

- Next.js 16.2.6, React 19.2.4, TypeScript 5.9
- Postgres pres `pg`
- GoPay subscription/billing zaklad v `src/lib/gopay.ts` a DB schema
- Vercel Blob / local media upload pres `src/lib/media-storage.ts`
- Template system zalozeny na `src/templates/{key}/template.json`, `theme.json`, `content/cs.json`
- Tenant render a editor zalozeny na `tenants`, `pages`, `sections`, `template_versions`, `tenant_data_slots`, `tenant_overrides`

Kriticke body v kodu:

- `src/app/api/onboarding/route.ts`: onboarding prijima `templateKey`, zalozi demo tenant, user account/subscription a vrati `editorUrl: /demo/{slug}/admin`.
- `src/lib/tenant-factory.ts`: `createDemoTenantFromTemplate()` seeduje tenant, homepage, pages, free modules a access token.
- `src/lib/db.ts`: centralni idempotentni schema init. Obsahuje `templates`, `template_versions`, `tenants`, `subscriptions`, `pages`, `sections`, `modules`, `tenant_modules`, `tenant_data_slots`, billing a audit.
- `src/app/vybrat-design/PickDesignPageContent.tsx`: katalog sablon bere jen approved active templates z DB a dela oborove kategorie.
- `src/app/api/templates/approved/route.ts`: verejny endpoint pro onboarding picker.
- `src/lib/schema/section.ts`: `templateManifestSchema` je strict a dnes nema `kind`, `tags`, `commerceCapabilities`.
- `src/components/studio/StudioLeftRail.tsx`: `MODULES_ENABLED = false`; studio moduly jsou zatim skryte.
- `src/components/studio/StudioModulesCanvas.tsx`: jen prazdna UI skorepina bez realneho CRUD.
- `src/app/demo/[tenantSlug]/admin/page.tsx`: hlavni editor/admin pro homepage.

Soucasny system je vyborny zaklad pro weby. E-shop nesmi byt jen dalsi sekce. Musi vzniknout commerce domain model a commerce admin napojeny na tenant.

## Produktova pozice

Webero Commerce ma mit tri produktove urovne:

1. Start: rychly e-shop ze sablony pro male/rostouci obchody, migrace ze Shoptetu, jednoducha admin sprava.
2. Growth: pokrocile produkty, varianty, sklad, objednavky, feedy, marketing, doplnky, B2B ceniky.
3. Premium: custom frontend, enterprise integrace, ERP, marketplace, multijazyk, multisklad, SLA, datove migrace, UX/SEO audit.

Proti Shoptetu:

- lepsi sablony a vizualni kvalita,
- mene pocitu genericke krabice,
- rychlejsi moderni storefront,
- lepsi onboarding a migracni wizard,
- vice veci nativne bez nutnosti kupovat hromadu malych doplnku.

Proti WPJ:

- rychlejsi spusteni pro mensi/stredni e-shopy,
- nizsi vstupni cena,
- samostatna editace bez zavislosti na agenture,
- stale profesionalni sablony, UX, migrace a premium moznost.

Proti Shopify:

- lokalizace pro CR/SR/EU,
- ceske dopravce, platby, ucetnictvi, ERP, Heureku/Zbozi/Sklik,
- ceske pravni a fakturacni workflow,
- lepsi default pro cesky trh.

## Navrhovana integrace do Webero

### 1. Rozsireni sablon

Pridat typ sablony:

- `template_kind`: `website | commerce | landing | hybrid`
- v manifestu `kind`, `tags`, `commerceCapabilities`
- v DB `templates.kind`, `templates.tags`, `templates.commerce_capabilities`
- ve vyberu designu pridat tab "E-shop"
- v onboardingu pridat intent: "Web" vs "E-shop"

E-shop sablona musi seedovat:

- homepage,
- category/listing page,
- product detail page,
- cart,
- checkout,
- customer account,
- order confirmation,
- legal pages,
- sample products/categories/collections.

Nezakladat e-shop sablony jako staticke produktove sekce. Produktova data musi jit z commerce tabulek.

### 2. Tenant commerce aktivace

Pridat `tenant_kind` nebo `commerce_enabled`:

- jednoduche reseni: `tenants.tenant_kind TEXT DEFAULT 'website'`
- pro e-shop onboarding vytvorit tenant s `tenant_kind = 'commerce'`
- automaticky aktivovat core moduly `commerce-core`, `products`, `orders`, `checkout`, `payments`, `shipping`, `feeds`
- plan a billing pozdeji svazat s commerce tiers.

### 3. Commerce administrace

Nedelat to pouze v existujicim `StudioModulesCanvas`; ten je prazdny.

Pridat samostatny obchodni admin do soucasneho editoru:

- rail item "Obchod" nebo "E-shop"
- views:
  - Dashboard
  - Objednavky
  - Produkty
  - Kategorie
  - Zakaznici
  - Sklad
  - Slevy
  - Marketing a feedy
  - Doprava
  - Platby
  - Nastaveni obchodu
  - Import / migrace ze Shoptetu

Pro velky e-shop musi byt admin dense, rychly, tabulkovy a klavesnicove ovladatelny. Ne marketingove karty, ne prazdne ilustrace.

## Commerce data model

Zakladni tabulky:

- `shops`: tenant-level commerce settings, currency, locale, VAT mode, order prefix, legal settings.
- `product_categories`: tree/nested categories, SEO, visibility.
- `products`: base product, slug, title, description, brand, status, SEO, tax class, flags.
- `product_variants`: SKU, EAN, price, compare price, weight, dimensions, option values.
- `product_options` / `product_option_values`: velikost, barva, material.
- `product_images`: variant/product images, alt, order.
- `collections`: manual/smart product sets.
- `inventory_locations`: warehouses/stores.
- `inventory_levels`: stock by variant/location.
- `stock_movements`: audit stock changes.
- `customers`: customer records.
- `customer_addresses`: billing/shipping.
- `customer_groups`: B2B/loyalty groups.
- `price_lists`: B2B/custom pricing.
- `carts`: persistent carts.
- `checkouts`: checkout sessions.
- `orders`: immutable order header.
- `order_items`: line items snapshot.
- `order_events`: order timeline.
- `payments`: payment status, provider payload.
- `shipments`: carrier, tracking, labels.
- `returns` / `refunds`: vratky a reklamace.
- `discounts`: coupons, automatic discounts, free shipping.
- `gift_cards` / `loyalty_points`: later phase.
- `feeds`: Google/Heureka/Zbozi/etc.
- `integration_connections`: provider auth/config.
- `import_jobs` / `import_job_logs`: migration/import.
- `webhook_endpoints` / `webhook_events`: ecosystem.

Zasady:

- Objednavka musi ukladat snapshot cen, produktu, DPH a adres.
- Produktove slugy a URL musi mit redirect historii.
- Product data nesmi byt ulozena jen v `sections.settings`.
- Kazda zmena produktu, ceny, skladu a objednavky musi mit audit trail.

## Storefront UX

MVP storefront:

- homepage commerce sections,
- listing/category with filters,
- product detail with variants,
- cart drawer/page,
- checkout,
- order confirmation,
- customer account,
- search,
- recommended/related products,
- SEO metadata, structured data, OG.

Designove sablony:

- Fashion / premium brand
- Outdoor/sport
- Beauty/cosmetics
- Food/delicatessen
- Electronics/catalog
- Handmade/local craft
- Supplements/health
- B2B wholesale
- Books/digital-light

Kazda sablona musi mit realny UX pro dany segment, ne jen prebarveny layout.

Performance targety:

- LCP <= 2.0s na demo sablonach
- CLS <= 0.05
- product listing bez tezkych client-only filtru pro prvni render
- image pipeline pres existujici media optimalizaci
- cache pro katalog tam, kde je to bezpecne

## Checkout a platby

Start:

- GoPay navazat na existujici billing/payment zaklady, ale oddelit shop payments od subscription billing.
- Dobirka / bankovni prevod jako fallback.
- Platebni stavy: pending, authorized, paid, failed, cancelled, refunded, partially_refunded.

Pozdeji:

- Comgate, GP webpay, Stripe, Apple Pay/Google Pay podle trhu.
- Payment provider abstraction.
- Webhook reconciliation a idempotence.

Checkout:

- guest checkout,
- customer account optional,
- delivery/billing address,
- shipping method selection,
- payment method selection,
- consent/legal checkboxes,
- VAT/company fields,
- order number generation.

## Doprava a fulfillment

Start:

- manual shipping rates,
- Packeta/Zasilkovna,
- PPL/DPD/GLS/Balikovna podle priority,
- shipping label workflow as soon as possible.

Model:

- carrier providers,
- pickup points,
- price rules by weight/order total/country,
- free shipping threshold,
- tracking URL,
- shipment split later.

## Cesky/EU business layer

Musi byt reseno od zacatku:

- DPH sazby, VAT ID, company checkout fields.
- Fakturace a ciselne rady.
- Storno, refund, dobropis.
- GDPR export/delete for customers.
- Obchodni podminky, reklamacni rad, ochrana osobnich udaju.
- EU consumer withdrawal flow.
- Cookie/marketing consents.
- Heureka/Zbozi/Google feedy.

## Migrace ze Shoptetu

Toto je strategicky kanal.

Vytvorit "Shoptet migration wizard":

1. Upload/export/import:
   - produkty,
   - kategorie,
   - varianty,
   - obrazky,
   - zakaznici,
   - objednavky,
   - slevove kupony,
   - URL a SEO metadata,
   - blog/content pokud dostupne.
2. Mapovani poli:
   - Shoptet export -> Webero Commerce schema.
3. URL preservation:
   - vytvorit 301 redirecty ze starych URL.
4. SEO safety:
   - canonical, title, description, structured data.
5. Design upgrade:
   - neprebirat design Shoptetu 1:1,
   - nabidnout profesionalni commerce sablonu odpovidajici segmentu.
6. Dry-run report:
   - co se importovalo,
   - co chybi,
   - konflikty SKU/slug,
   - obrazky bez alt,
   - produkty bez ceny/skladu.

MVP muze zacit CSV/XML importem. API import a crawler mohou byt faze 2.

## Moduly a marketplace

Webero musi mit moduly, ale nesmi uzivatele trestat za zakladni e-shopove funkce.

Core included:

- produkty,
- objednavky,
- kategorie,
- checkout,
- zakladni slevove kupony,
- zakladni SEO,
- zakladni feedy,
- zakladni doprava/platby.

Paid/growth moduly:

- B2B ceniky,
- advanced warehouse,
- marketplace sync,
- loyalty,
- subscriptions,
- reviews/Q&A,
- advanced search,
- advanced automation,
- AB testing,
- ERP connectors,
- premium support,
- AI merchandiser.

Technicky:

- rozsirit `modules` o `category`, `description`, `icon`, `admin_route`, `dependencies`, `permissions`, `billing_model`, `trial_days`, `config_schema`.
- pridat runtime feature checks.
- pridat module install lifecycle hooks.
- pripravit API/webhooks pro partner ecosystem.

## Admin UX standard

Admin musi byt "operator grade":

- rychle tabulky s virtualizaci,
- ulozene filtry,
- bulk actions,
- command palette,
- keyboard shortcuts,
- inline edit where safe,
- audit history,
- optimistic updates,
- empty states s konkretni akci, ne dekorace,
- mobile only for monitoring/basic edits, full admin desktop-first.

Klicove obrazovky:

- Products grid: SKU, status, stock, price, category, visibility, channel health.
- Product detail: content, variants, pricing, inventory, SEO, media, feeds, related.
- Orders: queue/list with statuses, payment/shipment badges, bulk shipment.
- Order detail: timeline, customer, items, payment, shipment, refund.
- Customers: profile, order history, groups, GDPR.
- Dashboard: revenue, orders, conversion, top products, low stock, failed payments.

## AI funkce

AI nesmi byt hracka. Ma setrit cas:

- generator produktu z fotky/textu,
- bulk SEO descriptions,
- smart category mapping pri importu,
- Shoptet migration cleanup,
- navrh cross-sell/upsell,
- detekce problemu feedu,
- AI support nad objednavkami/produkty,
- sablonovy content generator pro obor.

## Faze implementace

### Faze 0: analyza a technicky navrh

Claude musi:

- precist `AGENTS.md`, relevantni docs a uvedene soubory,
- overit aktualni stav konkurence,
- zmapovat existujici DB schema a admin/studio patterny,
- navrhnout konkretni DB migrace a routes,
- urcit prvni vertikalu sablony pro MVP.

Vystup:

- technicky RFC,
- ERD,
- API routes plan,
- UX sitemap adminu,
- scope MVP.

### Faze 1: commerce foundation

Implementovat:

- DB schema commerce core,
- typed helpers v `src/lib/commerce/*`,
- `tenant_kind` / commerce activation,
- module seed pro commerce,
- zakladni API pro products/categories/orders/settings,
- test seed data.

DoD:

- e-shop tenant ma shop row a seed produkty,
- API umi CRUD produkty/kategorie,
- zadne produktove jadro neni ulozene v section JSON.

### Faze 2: e-shop sablony a storefront MVP

Implementovat:

- template manifest `kind: commerce`,
- galerii s tabem "E-shop",
- onboarding branch pro e-shop,
- commerce sections/renderers:
  - product-grid,
  - featured-products,
  - category-grid,
  - cart-summary,
  - product-detail,
  - checkout shell.

DoD:

- uzivatel vybere e-shop sablonu,
- onboarding vytvori tenant s produkty,
- demo storefront ma listing, PDP a cart.

### Faze 3: commerce admin MVP

Implementovat:

- "Obchod" rail item/view,
- products grid/detail,
- categories,
- orders list/detail,
- shop settings,
- import page shell.

DoD:

- admin upravi produkt, cenu, sklad a viditelnost,
- storefront zmenu okamzite vidi,
- objednavky jsou videt v adminu.

### Faze 4: checkout, payments, shipping

Implementovat:

- cart/checkout persistence,
- order creation,
- payment provider abstraction,
- GoPay shop payment,
- manual/bank transfer,
- shipping method rules,
- transactional emails.

DoD:

- testovaci objednavka projde od produktu po potvrzeni,
- admin vidi payment/shipping status,
- webhooky jsou idempotentni.

### Faze 5: Shoptet migration

Implementovat:

- import jobs,
- CSV/XML importer,
- mapping UI,
- redirect generator,
- SEO report,
- dry-run summary.

DoD:

- import sample Shoptet exportu vytvori produkty/kategorie/obrazky,
- konflikty jsou reportovane,
- URL redirecty jsou ulozene.

### Faze 6: integrace a feedy

Implementovat:

- Google Merchant feed,
- Heureka/Zbozi feed,
- Packeta pickup/shipping,
- GA4/e-commerce events,
- Meta/Sklik/Google marketing pixels.

DoD:

- feedy validuji zakladni data,
- objednavkove eventy se meri.

### Faze 7: growth/enterprise

Implementovat:

- B2B customer groups,
- price lists,
- multistore/multicurrency/multilanguage,
- ERP connectors,
- advanced search,
- marketplace sync,
- module marketplace.

## Prvni MVP rozsah

Nejmensi smysluplny MVP:

- `tenant_kind = commerce`
- 1-2 e-shop sablony
- produkty/kategorie/varianty/obrazky/sklad
- storefront listing + PDP + cart + checkout shell
- manual order creation nebo plny basic checkout
- admin produkty + objednavky
- CSV import
- zakladni SEO structured data

Nezacinat B2B, marketplace, vsechny dopravce a vsechny ERP najednou.

## Rizika

- Pritelovani produktu do `sections.settings` by rychle znicilo skalovatelnost.
- Zapnuti soucasneho `StudioModulesCanvas` bez realneho backendu by vytvorilo iluzi funkcnosti.
- Prekopirovani WPJ/Shoptet designu nebo textu je pravni i brand riziko.
- Checkout bez idempotence webhooks a order snapshotu bude zdroj prusvihu.
- Prilis siroky MVP zastavi shipping cele veci.
- Existujici `src/lib/db.ts` uz je velky; u commerce zvazit migracni modul nebo jasne oddelit schema bloky.

## Akceptacni kritéria pro leader-level kvalitu

- E-shop sablony vypadaji jako profesionalni brandy, ne generic SaaS skin.
- Admin zvladne stovky/tisice produktu bez pocitu pomalosti.
- Migrace ze Shoptetu je viditelny produktovy tah, ne interní skript.
- Storefront je SEO/performance-first.
- Zakladni ceske e-commerce workflow funguje native.
- Commerce core je oddeleny a testovatelny.
- Integrace do Webero onboardingu je hladka: vyberu E-shop -> vyberu sablonu -> dostanu hotovy e-shop -> v adminu mam obchod.

## Startovni prompt pro Claude Fable

Jsi Claude Fable a mas plnou odpovednost navrhnout a postupne implementovat Webero Commerce v projektu `CRM/venom`. Nejde o kopii Shoptetu, Shopify ani WPJ. Cilem je postavit lepsi e-shopovy system pro Webero: profesionalni design jako premium agentura, jednoduchost a moduly jako SaaS, lokalizace pro cesky trh a migrace ze Shoptetu jako hlavni akvizicni kanal.

Nejdrive proved vlastni analyzu:

1. Projdi repozitar `CRM/venom`, hlavne `src/lib/db.ts`, `src/lib/tenant-factory.ts`, `src/app/api/onboarding/route.ts`, `src/app/vybrat-design/PickDesignPageContent.tsx`, `src/app/api/templates/approved/route.ts`, `src/lib/schema/section.ts`, `src/components/studio/*`.
2. Over aktualni verejne informace o WPJ, Shoptetu a Shopify. Neprebirej je slepe, pouzij je jen pro strategickou diferenciaci.
3. Navrhni technicke RFC a ERD pro commerce core.
4. Navrhni, jak pridat e-shop tab do sablon a commerce branch do onboardingu bez rozbiti soucasnych webovych sablon.
5. Navrhni commerce admin, ktery je profesionalni a dense, ne prazdna modulova skorepina.
6. Navrhni MVP tak, aby sel skutecne implementovat po krocich.
7. Potom implementuj prvni fazi: commerce schema, tenant commerce activation, commerce template metadata a zakladni produktovy CRUD/seed.

Pravidla:

- Nenic existujici rozdelane zmeny.
- Nepouzivej destruktivni git prikazy.
- Neprepisuj design nebo texty konkurence.
- Produktova data ukladej do commerce tabulek, ne do section JSON.
- Checkout/order/payment musi byt idempotentni a auditovatelny.
- Vsechny zmeny over lintem/buildem nebo aspon cilenymi testy podle rozsahu.

Prvni dodavka ma byt mala, ale realna: e-shop tenant, commerce DB model, commerce API zaklady, e-shop kategorie v galerii/onboardingu a minimalni produktovy admin/storefront skeleton.
