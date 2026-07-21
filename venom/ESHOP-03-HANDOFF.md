# HANDOFF: eshop-03 „Shoptet Disco" — poznatky z eshop-02

Píše instance, která právě dokončila **eshop-02 „Modrý Košík"** (Shoptet Classic DNA). Ty stavíš **eshop-03 (Shoptet Disco DNA)**. Tenhle dokument ti ušetří všechny slepé uličky, ve kterých jsem se zasekával. Přečti celý PŘED prvním řádkem kódu.

---

## 0. Zlatá pravidla (user na tohle 2× eskaloval, neignoruj)

1. **🚨 NIKDY nesahat na eshop-01 ani eshop-02** — soubory, DB, vizuál. Všechna práce v nových variantách/souborech. Každá změna sdíleného kódu MUSÍ být no-op pro předchozí šablony — po každé takové změně ověř curl testem (viz §8).
2. **🚨 Šablona = KOMPLETNÍ standalone e-shop.** Nejen homepage! Storefront (/obchod listing, detail produktu, kategorie, košík, pokladna — všech 14 routes) musí mít identitu eshop-03, ne fallback na sdílený design. User doslova: *„a co třeba kategorie či detail produktu... však to musíš udělat komplet ať je to osamocený ne?"* a podruhé *„však to je header a stránka předchozí šablony!!"*. Řešení už existuje (§4) — jen přidáš svoji větev.
3. **Workflow: sekce po sekci.** Postav jednu sekci → seed → pošli demo link → **ČEKEJ na „ok"** od usera. Žádné dávky dopředu. (memory: feedback_section_by_section)
4. Žádné dekorativní /01 /02 /03 markery (memory: feedback_no_numbered_decorative). Czech UI. Awwwards kvalita, maximální editovatelnost (všechen text přes editovatelné komponenty).
5. `AGENTS.md`: tohle je Next.js 16.2.6 — **není to Next, který znáš**. Před psaním kódu čti guide v `node_modules/next/dist/docs/`. `params` jsou `Promise<{...}>` a musí se awaitnout.

---

## 1. Prostředí a základní fakta

- Repo: `/Users/apple/DEV/CRM/venom`. Dev server **port 3015**.
- Tenanti: eshop-01-v2 = **1275**, eshop-02-v2 = **1278**. eshop-03 si vytvoříš vlastní (eshop-03-v2).
- Demo URL vzor: `http://localhost:3015/demo/eshop-03-v2` a `/demo/eshop-03-v2/obchod`.
- DB: PostgreSQL přes `DATABASE_URL` v `.env.local`.

**⚠️ Shell cwd se resetuje mezi Bash voláními** → každý příkaz začínej `cd /Users/apple/DEV/CRM/venom && ...`.

**DB one-liner recept:**
```bash
cd /Users/apple/DEV/CRM/venom && export $(grep -E '^DATABASE_URL=' .env.local | head -1) && node -e "..."
```
⚠️ Inline `node -e` s escapovaným JSON tiše selhává (exit 1) → delší skripty piš do souboru ve scratchpadu. Ve scratchpad skriptech: `require('/Users/apple/DEV/CRM/venom/node_modules/pg')` (jinak pg nenajde).

**Dev server opakovaně umírá (OOM, exit 0).** Restart:
```bash
lsof -ti:3015 | xargs kill -9 2>/dev/null; cd /Users/apple/DEV/CRM/venom && NODE_OPTIONS="--max-old-space-size=8192" PORT=3015 npm run dev
```
(run_in_background + curl wait loop na 200).

---

## 2. Architektura sekcí (pipeline)

1. **Šablona** = `src/templates/eshop-03/{theme.json, template.json, content/cs.json}`. `template.json` definuje stránky a sekce (section_type + variant + contentRef); `cs.json` drží obsah. `lookupRef` umí tečkové cesty (`pages.kontakt.contact`).
2. **Seed:** `node scripts/seed-all-templates.mjs --key eshop-03` → pak tenant skript (zkopíruj `scripts/create-eshop-02-tenant.mjs` na `create-eshop-03-tenant.mjs`). Je **idempotentní** — smaže a znovu vloží všechny pages/sections tenanta, takže ho pouštěj po každé změně obsahu.
3. **Render:** DB sekce → `hydrateCommerceSections` injektuje `content.__commerce` (produkty/kategorie z katalogu) → sekční komponenty dispatchují podle `variant`.
4. **Nová varianta sekce = append nové funkce na KONEC existujícího souboru** (`src/components/sections/HeroSection.tsx`, `AboutSection.tsx`, …) + jeden dispatch řádek na začátek exportované funkce. **Nikdy nesahej na existující varianty.**

**Commerce data pro sekce:** `src/lib/commerce/section-data.ts` — `fetchCategoryCards` podporuje `{ topLevelOnly, excludeSlugs }` (v cs.json: `"topLevel": true, "excludeSlugs": ["novinky","akce"]`), produktové gridy přes `categorySlug` + `limit`.

**eshop-02 varianty k inspiraci (vzor struktury, NE vizuálu — Disco má vlastní DNA):**
`eshop-02-navbar`, `eshop-02-hero`, `eshop-02-featured` / `eshop-02-products`, `eshop-02-categories` (CommerceCategoriesSection), `eshop-02-about` + `eshop-02-shipping` (obě v AboutSection.tsx), `eshop-02-testimonials`, `eshop-02-faq`, `eshop-02-cta`, `eshop-02-footer`, `eshop-02-page-hero` (slim banner pro podstránky), `eshop-02-contact` (ContactSection). CSS třídy prefixuj unikátně (eshop-02 má `wc2*` — zvol si např. `wc3*`).

**Rozsah eshop-02 (minimální laťka pro eshop-03):** 10 home sekcí + 3 podstránky (/o-nas, /kontakt, /doprava-a-platba) + kompletní storefront chrome (§4).

---

## 3. Editace velkých sekčních souborů — NEPOUŽÍVEJ Edit tool naslepo

Sekční soubory mají 10 000+ řádků a **VSCode watcher je přeformátovává → Edit tool padá na „file modified since read" race**.

- **Append nové varianty:** `cat >> src/components/sections/XxxSection.tsx << 'EOF' ... EOF` (heredoc).
- **Dispatch řádky:** atomický Python line-replace skript (read → assert count==1 → replace → write), ne Edit tool:
```python
src = open(path).read()
old = 'export function HeroSection({'   # kotva
assert src.count(old) == 1
src = src.replace(old, new)
open(path, 'w').write(src)
```
- ⚠️ **HeroSection.tsx má dispatche v BLOKOVÉ formě** (`if (variant === "...") {\n  return <.../>;\n}`), ne jednořádkové — jednořádkový pattern match tam selže. Vždy si nejdřív vyhledej přesnou podobu okolních dispatchů.
- **tsc:** `npx tsc --noEmit` a filtruj grep na svoje soubory. **ContactSection.tsx má 2 PRE-EXISTING errory (ř. ~34 `ContactFloors01` undefined, ř. ~13158 `JSX` namespace) — NEJSOU tvoje, nech je být.**

---

## 4. Storefront identity — TOHLE JE TO, KDE SE NEJVÍC ZASEKÁVALO

Sdílený storefront (`src/app/demo/[tenantSlug]/obchod/**` — listing, detail, košík, pokladna, 14 routes) má defaultně design eshop-01. Pro eshop-02 jsem vybudoval **dvouvrstvé řešení — pro eshop-03 stačí přidat svoji větev, infrastruktura hotová:**

### Vrstva 1: CSS skin (obsah stránek)
- `src/components/storefront/shop-skins.ts` — `getShopSkinCss(templateKey)`. **Přidej `ESHOP_03_CSS` větev.** CSS je scoped `[data-shop-skin="eshop-03"]` a přemapovává Tailwind neutral-* utility na paletu šablony s `!important` (včetně escapovaných pseudo selektorů jako `.hover\\:bg-neutral-800:hover`). Vzor: ESHOP_02_CSS tamtéž.
- Wrapper už existuje: `src/app/demo/[tenantSlug]/obchod/layout.tsx` čte template key z DB a obaluje children — **nesahat**, funguje automaticky, jakmile getShopSkinCss vrátí CSS pro tvůj key.

### Vrstva 2: Template chrome (navbar + footer šablony místo sdíleného ShopHeader/ShopFooter)
- `src/components/storefront/TemplateShopChrome.tsx` — **jen přidej `"eshop-03"` do `TEMPLATE_CHROME_KEYS`**. Komponenta fetchne navbar/footer sekci z homepage tenanta v DB a renderuje NavbarSection/FooterSection (isAdmin=false) → úpravy v editoru se propíší i do storefrontu.
- Napojení už je hotové na všech 14 routes: 9 stránek jde přes `ShopHeaderServer.tsx`/`ShopFooterServer.tsx`, `obchod/page.tsx` a `obchod/[productSlug]/page.tsx` mají přímý conditional `{chromeKey ? <TemplateShopHeader .../> : <ShopHeader .../>}`. **Nic z toho needituj.**

**Tvůj checklist pro storefront = 2 edity:** (1) key do TEMPLATE_CHROME_KEYS, (2) CSS větev do shop-skins.ts. Pak ověř §8.

⚠️ Pozor na footer sekci šablony: musí fungovat i mimo homepage — linky resolvuj s prefixem `/demo/${tenantSlug}` (viz `FooterEshop02` `resolve()` helper).

---

## 5. Katalog / DB pasti

- `product_category_links` má **`tenant_id NOT NULL`** → INSERT vždy `(tenant_id, product_id, category_id)`.
- Kategorie „novinky"/„akce" jsou virtuální marketing kategorie — produktové gridy je plní přes `categorySlug`; když je málo produktů, dopln linky skriptem (+ `flags.new=true` / `flags.sale=true` v products.flags JSON).
- Sekce v DB: `sections.settings.content` (JSON), `section_variant`, `is_visible`, `order_index`; stránky `pages.is_homepage`.
- Subpage inserty (pokud děláš ručně mimo seed): `content_source='v2'` + `tenant_id` NOT NULL.

---

## 6. Postup, který se osvědčil (chronologie eshop-02)

1. Scaffold: `src/templates/eshop-03/` (theme + template.json s home: navbar+hero+footer + cs.json) → seed → tenant skript → demo link navbaru → **OK**.
2. Sekce po sekci: hero → akce (featured) → kategorie → novinky → about → recenze → FAQ → CTA+footer (poslední dvě šly jako dvojice) → **každou OK**.
3. Podstránky: /o-nas, /kontakt, /doprava-a-platba (page-hero slim banner + reuse sekcí + nové contact/shipping varianty) → **OK**.
4. Storefront: skin CSS + chrome key (§4) → ověřit §8 → **OK**.
5. Memory zápis.

---

## 7. Editovatelnost (user na ní trvá — „maximální editovatelnost")

Všechen text/obrázky přes editovatelné primitivy používané v existujících variantách (`GenericEditable*`, editovatelné labels i u položek v polích — viz `col()` helper ve FooterEshop02 nebo `infoCard()` v ContactEshop02). Obrázky: WebP, ne hotlink Unsplash.

---

## 8. Verifikační checklist (spusť po každé změně sdíleného kódu i na konci)

```bash
P="http://localhost:3015/demo/eshop-03-v2"
# chrome + skin na klíčových routes (uprav marker na svůj navbar/footer class)
for u in "obchod?kategorie=obleceni" "obchod/kosik" "obchod/pokladna"; do
  html=$(curl -s "$P/$u"); echo "$u navbar=$(echo "$html"|grep -c 'eshop-03-navbar') skin=$(echo "$html"|grep -c 'data-shop-skin')"
done
# detail produktu — POZOR: první href match bývá /obchod/kosik, filtruj:
slug=$(curl -s "$P/obchod?kategorie=obleceni" | grep -o 'href="/demo/eshop-03-v2/obchod/[a-z0-9-]*"' | sed 's|.*obchod/||;s|"||' | grep -vE '^(kosik|pokladna|dekujeme)$' | sort -u | head -1)
curl -s "$P/obchod/$slug" | grep -c 'eshop-03-navbar'
# 🚨 regrese předchozích šablon — MUSÍ být 0 / beze změny:
curl -s "http://localhost:3015/demo/eshop-01-v2/obchod" | grep -c 'data-shop-skin\|eshop-03'   # očekávej 0
curl -s "http://localhost:3015/demo/eshop-02-v2/obchod" | grep -c 'eshop-02-navbar'            # očekávej ≥1 (beze změny)
```

Hodně štěstí. Když si nejsi jistý strukturou, čti eshop-02 varianty — jsou nejnovější a prošly celým user review.
