# ZADÁNÍ: Skladový systém + B2B portál (konkurence cust.naarden.cz / Woodlo ERP)

> **Pro:** Opus (implementační session)
> **Od:** analýza veřejně dostupných částí cust.naarden.cz, portal.dev.wdlerp.net a woodloerp.com (2026-07-21)
> **Cíl:** Postavit skladový systém s B2B zákaznickým portálem, který funkčně pokrývá a designově překonává portál Naarden (běží na platformě Woodlo ERP).

---

## 1. Konkurenční analýza — co přesně konkurence má

### 1.1 Kdo je konkurence

- **cust.naarden.cz** = B2B zákaznický portál velkoobchodu Naarden International (6 000+ produktů, 150+ značek, pěstitelské potřeby). Zákazník se přihlásí a objednává za velkoobchodní ceny.
- Portál běží na platformě **Woodlo ERP** (wdlerp.com), která se prodává jako „Operating System for Indoor Growing Distribution" s 5 moduly:
  1. **Command Center** — centrální admin: objednávky napříč sklady, real-time inventura per SKU/šarže, správa zákazníků, automatická fakturace, KPI dashboardy.
  2. **Floor Operations Hub** — mobilní rozhraní pro skladníky: touch-optimalizované, řízené picking/packing workflow, čtení čárových kódů, šarže, přidělování úkolů.
  3. **B2B Customer Portal** — 24/7 samoobslužné objednávání, real-time sklad + ceny, historie objednávek a faktur ke stažení, individuální ceníky, **bulk CSV upload do košíku**, API.
  4. **Smart Inventory** — čárové/QR kódy, chain-of-custody log, příjemky, perpetuální inventura.
  5. **Analytics & Reporting** — role-based dashboardy, plánované automatické reporty.

### 1.2 Technologie konkurence (zjištěno z kódu)

Nette (PHP) + latte šablony, Bootstrap 5.1, jQuery, nette.ajax, simplelightbox, masonry, Font Awesome. Server-rendered, klasické stránkování, AJAX jen na drobnosti. **Tzn. technologicky zastaralé — tady je lehce překonáme (rychlost, UX, responzivita).**

### 1.3 Funkce portálu vyčtené z jejich CSS/JS (třídy = mapa obrazovek)

- **Login landing** — split-screen: vlevo 45 % ilustrace, vpravo 55 % světle modrý panel (#f3fbff) s formulářem e-mail + heslo. Registrace vypnutá — účty zřizuje obchodník (na landing page je kontakt na obchodnici).
- **Hlavní navbar** (bílý, spodní linka #e6eaee): logo + tagline, hlavní menu (aktivní položka zeleně #2cc185), **fulltext vyhledávání s našeptávačem** — dropdown 50vw široký, výsledky seskupené po kategoriích, zvýrazněná shoda tučně, cena vpravo, stav „no-results", řádek „hledat vše".
- **Režim „retail"** — přepínač/indikátor v navbaru (červený badge), tj. portál umí B2B i B2C ceny — obchodník může objednávat za koncové ceny.
- **Dashboard** — bannery/carousel (marketingové akce), featured produkty s cenami.
- **Katalog / seznam produktů** — tabulkový výpis: thumbnail 38×38 px s lightboxem, badge **bestseller** (červená tečka) a **novinka** (zelená tečka) přes roh obrázku, primární řádek (název, tučně) + sekundární řádek (kód, značka, parametry oddělené „~", šedě), cena basic + finální (po slevě, tučně), skladový stav, input množství přímo v řádku tabulky → přidání do košíku bez otevírání detailu. Stránkování nahoře i dole.
- **Skladové stavy** (barevně, všude konzistentně):
  - `in-stock` skladem — #009688 (teal)
  - `out-of-stock` vyprodáno — #f44336 (červená)
  - `backorder` na objednávku — #e0621f (oranžová)
  - `incoming` naskladňujeme — #607d8b (šedomodrá)
- **Detail produktu** — velká fotka (min-height 400 px) + galerie náhledů (4 sloupce, lightbox), cena finální (200 %, tučně) + basic (přeškrtnutá/šedá) + **MSRP** (doporučená koncová — pro B2B zásadní, počítá si marži), šedý box „stock-and-cart": velký skladový stav + množství + do košíku, popis, štítky (item-label zelená/oranžová).
- **Košík a checkout** — tabulka položek s inline editací množství, patička s dvojitou linkou a součty (`table-totals`), výběr dopravy jako list-group s radio selektory (název + popis + cena), stavy required polí (modrý rámeček, hvězdička).
- **Objednávky (historie)** — tabulka `table-white` s caption nadpisem + **nav-pills filtry stavů s počty** (např. „Nové 3 / Expedované 12 / …", prázdné počty šedě), sloupec status = barevný plný badge přes celou buňku, celé řádky klikací (tr[href], loading opacity). Prázdné stavy s ikonou („zatím žádné objednávky").
- **Dokumenty** — dodací listy, faktury ke stažení (PDF).
- **CMS stránky** (`ctrl-customer-cms`) — obchodní podmínky, kontakty, nápověda; nadpisy s modrou podtržkou (#047bf8).
- **Patička** — adresa firmy, drobné odkazy.

### 1.4 Designové tokeny konkurence (pro referenci, NE ke kopírování 1:1)

| Token | Hodnota |
|---|---|
| Pozadí aplikace | #eff3f6 |
| Karty/tabulky | #fff, border #e6eaee, radius 4px |
| Thead | bg #f5f8fa, text #7f8fa4, 500, .875rem |
| Nadpisy | #334152 / #354052, 600, modrá podtržka #047bf8 |
| Akcent (aktivní nav, brand) | #2cc185 (zelená) |
| Stavové barvy | viz skladové stavy výše + #ff9800, #398000 |
| Zvýrazněný řádek | #fff8e1 |
| Typografie | Bootstrap default (systémový sans) |

Celkově: čistý „admin SaaS 2018" vzhled — světlé tabulky, hodně bílé, malé fotky. **Funkčně dobré, vizuálně nudné.**

---

## 2. Cíl a rozsah našeho systému

Postavit **vlastní produkt o dvou tvářích nad jednou DB**:

**A) B2B zákaznický portál** (to, co vidí zákazník na cust.naarden.cz) — priorita 1, tím konkurujeme viditelně.

**B) Admin + sklad** (Command Center + Floor Operations) — priorita 2, bez něj portál nemá data: produkty, zákazníci, ceníky, příjem/výdej, vychystávání, doklady.

Multi-tenant NENÍ požadavek první verze — stavíme pro jednoho provozovatele velkoobchodu, ale datový model psát tak, aby se tenant dal doplnit (žádné globální singletony).

---

## 3. Tech stack (závazně)

- **Next.js 14 App Router** (stejně jako fakturina/bettercv), TypeScript, Tailwind.
- **Neon Postgres**, přímé SQL (pg) — žádné ORM experimenty.
- Auth: JWT v httpOnly cookie, bcrypt; oddělené role `customer` / `admin` / `warehouse`.
- PDF (faktury, dodací listy): puppeteer `setContent` — vzor v bettercv.
- **Port 3030** (3000/3002/3003/3010/3015/3020/3025 jsou obsazené).
- Path: `/Users/apple/DEV/CRM/sklad`.
- Žádné placené služby v MVP; obrázky lokálně v `/public/uploads`.

---

## 4. Datový model (minimální jádro)

```
users(id, email, password_hash, role, customer_id?, name, phone, active)
customers(id, name, ico, dic, billing_address, shipping_addresses jsonb,
          price_tier_id, credit_limit, payment_days, active)
price_tiers(id, name, discount_pct)          -- + product_prices override per tier
categories(id, parent_id, name, slug, position)
brands(id, name, slug)
products(id, sku, ean, name, slug, brand_id, category_id, description,
         msrp, base_price, vat_rate, unit, weight, is_new, is_bestseller,
         active, images jsonb)
product_prices(product_id, price_tier_id, price)   -- individuální ceníky
warehouses(id, name, code)
stock(product_id, warehouse_id, qty_on_hand, qty_reserved, reorder_point)
stock_moves(id, product_id, warehouse_id, type[receipt|issue|adjust|transfer],
            qty, batch, ref_type, ref_id, user_id, created_at)  -- chain of custody
orders(id, number, customer_id, user_id, status[new|confirmed|picking|packed|
       shipped|delivered|cancelled], delivery_method, payment_method,
       note, totals jsonb, created_at)
order_items(id, order_id, product_id, qty, unit_price, vat_rate, picked_qty)
invoices(id, order_id, number, issued_at, due_at, pdf_path)
delivery_notes(id, order_id, number, pdf_path)
banners(id, image, href, position, active)
cms_pages(id, slug, title, body_html)
```

Skladová logika: `qty_available = on_hand − reserved`. Potvrzení objednávky rezervuje, expedice odepíše přes `stock_moves` (jediný zdroj pravdy, stav skladu je materializovaný součet — kontrolovatelný přepočtem).

---

## 5. Funkční specifikace

### 5.1 Portál — MUSÍ mít (parita s konkurencí)

1. **Login landing** split-screen s vlastní ilustrací, kontaktem na obchodníka; bez veřejné registrace.
2. **Fulltext našeptávač** v hlavičce: debounce 300 ms, skupiny podle kategorií, zvýrazněná shoda, cena, skladový stav, klávesnice (↑↓ Enter Esc). **Lepší než oni: hledat i v SKU/EAN a zobrazit thumbnail.**
3. **Katalog**: strom kategorií + výpis s filtry (značka, skladem, novinky), řazení, stránkování; inline qty → do košíku z výpisu; badge novinka/bestseller.
4. **Detail produktu**: galerie, ceny (moje cena / běžná / MSRP + „vaše marže X %" — to konkurence nemá!), velký skladový stav vč. „skladem X ks" pro B2B, related produkty.
5. **4 skladové stavy** barevně konzistentně všude (výpis, detail, našeptávač, košík).
6. **Košík**: inline editace, přepočet bez reloadu, doprava + platba (list-group vzor), poznámka, kontrola dostupnosti při odeslání.
7. **Rychlá objednávka / CSV import**: textarea „SKU;množství" + upload CSV → validační report (nenalezené položky, málo skladem) → naplnit košík. Klíčový B2B feature Woodlo, musíme mít.
8. **Historie objednávek**: filtry stavů s počty (pills), barevné stavy, detail objednávky, **„Objednat znovu"** (kopie do košíku).
9. **Dokumenty**: faktury + dodací listy, PDF ke stažení, stav úhrady.
10. **Dashboard po přihlášení**: bannery, novinky, bestsellery, rozpracovaná objednávka, poslední objednávky.
11. **CMS stránky** + patička s kontakty.
12. **Účet**: dodací adresy, uživatelé zákazníka (majitel může přidat nákupčí), změna hesla.

### 5.2 Admin/sklad — MUSÍ mít

1. **Dashboard**: dnešní objednávky, obrat, low-stock alerty (pod reorder point), čekající vychystávání.
2. **Produkty**: CRUD, obrázky, kategorie/značky, ceníky (tier + individuální ceny), příznaky novinka/bestseller.
3. **Zákazníci**: CRUD, přiřazení tieru, splatnost, uživatelské účty, impersonace („zobrazit portál jako zákazník" — retail/B2C režim konkurence tím pokryjeme elegantněji).
4. **Objednávky**: fronta podle stavů, změna stavu s validací workflow, tisk dokladů.
5. **Vychystávání (Floor Ops light)**: mobilní view `/sklad` — seznam objednávek k vychystání, položka po položce s lokací a množstvím, potvrzování ťuknutím, podpora čtečky (input EAN → auto-match). Bez nativní appky — PWA responsive stačí.
6. **Příjemky**: naskladnění (dodavatel, položky, šarže volitelně) → stock_moves.
7. **Inventura**: přepočet, ruční korekce s povinným důvodem.
8. **Faktury/dodací listy**: automatické číslování, PDF generace při expedici.
9. **Reporty**: prodeje po produktech/zákaznících/období, export CSV.

### 5.3 NICE-TO-HAVE (jen pokud zbyde čas, v tomto pořadí)

API pro zákazníky (read katalog + POST objednávka, API klíč per zákazník) → e-mail notifikace stavů → plánované reporty e-mailem → multi-warehouse transfery.

---

## 6. Design — „konkurenční, ne kopie"

Konkurence = nudný Bootstrap. My chceme **prémiový, moderní B2B vzhled** (úroveň Linear/Stripe dashboardů), ale POZOR: B2B uživatel je konzervativní — hustota informací a tabulky zůstávají, žádné hero animace.

- **Vlastní identita**: navrhni paletu kolem jedné výrazné akcentní barvy (doporučuji hlubokou modř/indigo + jantarový akcent pro stavy — NE zelenou #2cc185, ať nejsme klon). Neutrály teplé šedé, pozadí ~#f6f7f9, karty bílé, radius 8–10 px, jemné stíny.
- **Typografie**: Inter (self-host), tabulková čísla `tabular-nums`.
- **Tabulky**: sticky header, řádkový hover, inline qty inputy, skeleton loading. Hustota vyšší než u konkurence (jejich 0.5rem padding je fajn benchmark).
- **Stavy**: barevné tečky + text (ne celobarevné buňky jako oni — čitelnější), konzistentní tokeny pro 4 skladové + 7 objednávkových stavů.
- **Prázdné stavy** s ikonou a CTA (mají, nesmíme být horší).
- **Mobil**: portál plně responsivní; skladové view design-mobile-first (velké touch targety ≥ 44 px).
- Žádný Bootstrap — Tailwind + vlastní komponenty. Ikony Phosphor (registry vzor ve venom).

---

## 7. Pracovní postup a akceptační brány (závazně, viz docs/pravidla.md)

**Fáze:** ① DB schema + seed (30 produktů, 3 kategorie, 2 tiery, 2 zákazníci, sklad) → ② auth + layout portálu → ③ katalog + hledání → ④ košík + checkout → ⑤ objednávky + dokumenty + PDF → ⑥ admin produkty/zákazníci/objednávky → ⑦ sklad (příjem, vychystávání, inventura) → ⑧ dashboard + reporty + CMS → ⑨ polish + QA.

**Po každé fázi:** `tsc --noEmit` čistý + ruční smoke test v prohlížeči (screenshot). Nepokračovat na další fázi s rozbitou předchozí.

**DONE = E2E průchod:** admin založí produkt a naskladní → zákazník ho najde našeptávačem, objedná (vč. CSV rychlé objednávky) → sklad vychystá na mobilním view → expedice vygeneruje fakturu PDF → stavy skladu sedí (kontrolní přepočet stock_moves), historie objednávky se stavy sedí na portálu.

**Zakázáno:** kopírovat texty/obrázky/logo/ilustrace Naarden nebo Woodlo; jakýkoliv pokus o přístup za jejich login; hromadné generování bez kontroly; přebarvování už schválených částí bez ptaní.

---

*Zdrojová analýza: veřejná login page + main.css/main.js z cust.naarden.cz (kopie v scratchpadu analýzy), woodloerp.com marketing, portal.dev.wdlerp.net landing. Za loginem konkurence nikdo nebyl — funkce odvozeny z CSS selektorů a veřejné dokumentace Woodlo.*
