# Venom SaaS — Dev Log

Záznamy chyb, zjištění a oprav. Přidávat průběžně — cíl: neopakovat zdlouhavé debugování.

---

## Server & Build

### SWC arm64 „untagged enum Config" error
**Chyba:** `SWC failed to load the file ... untagged enum Config at line 1 column 1063`  
**Kdy:** Při spuštění `next dev` na Apple Silicon (darwin-arm64), Next.js 16.2.2  
**Příčina:** `@next/swc-darwin-arm64` binárka má bug v Rust serde deserializaci — selže, když options JSON obsahuje:
- `styledJsx` jako objekt `{ useLightningcss: false }` místo boolean
- `undefined` pole v `serverComponents` (Rust očekává bool, ne chybějící klíč)
- `serverActions` config pro Next.js interní `dist/` soubory

**Oprava** v `node_modules/next/dist/build/swc/options.js` **A** `node_modules/next/dist/esm/build/swc/options.js` (nutné obě):
```js
// 1. styledJsx jako boolean, ne objekt
styledJsx: true,

// 2. force boolean v serverComponents
cacheComponentsEnabled: !!isCacheComponents,
taintEnabled: !!taintEnabled,

// 3. cjsRequireOptimizer zakázat úplně
if (false && baseOptions.cjsRequireOptimizer_disabled) baseOptions.cjsRequireOptimizer = { ... };

// 4. serverActions zakázat pro Next.js interní soubory
if (isNodeModules && filename.includes(nextDirname + '/dist/')) {
  options.serverActions = undefined;
}
```
**Pozor:** Patche jsou v `node_modules/` — po `npm install` nebo aktualizaci Next.js se přepíší. Nutno znovu aplikovat.

---

### CSS parse error: `Unexpected character '@' (1:0)`
**Chyba:** `Module parse failed: Unexpected character '@' (1:0)` pro `globals.css`  
**Kdy:** Při `next dev`, soubor `globals.css` začíná `@import "tailwindcss"`  
**Příčina:** Shell měl nastaven `NODE_ENV=production`. `next-flight-css-loader.js` v production mode vrací raw CSS místo JS modulu → webpack to nedokáže parsovat jako JS.  
**Oprava:** Explicitní `NODE_ENV=development` v dev scriptu:
```json
// package.json
"dev": "NODE_ENV=development next dev --webpack"
```

---

### PostCSS nečte config z `.mjs`
**Chyba:** Tailwind CSS utility třídy se negenerují, žádný error  
**Příčina:** webpack čte `postcss.config.js` (CJS), ne `postcss.config.mjs` (ESM)  
**Oprava:** Vytvořit `postcss.config.js` vedle (nebo místo) `.mjs`:
```js
// postcss.config.js
module.exports = {
  plugins: { "@tailwindcss/postcss": {} },
};
```

---

### `WEBPACK_LAYERS` — co je RSC layer
RSC (React Server Components) layer = `'rsc'`, `'action-browser'`, atd.  
`isWebpackAppPagesLayer()` vrací `true` pro `'app-pages-browser'` (client-side app router).  
Důležité pro pochopení, kdy se `serverActions` config aplikuje — platí jen pro `isAppRouterPagesLayer && !jest`.

---

## Databáze

### Schéma klíčových tabulek

**`tenants`**: `id, slug, email, template_id, template_version, industry, status, active_modules, plan, access_token, analytics_config`  
**`pages`**: `id, tenant_id, slug, title, is_homepage, status, seo_title, seo_description`  
**`sections`**: `id, tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings (JSONB)`  
→ settings JSONB struktura: `{ content: {...}, designTokens: {...} }`  
→ `UNIQUE(page_id, order_index)` — dvě sekce na stejné stránce nemohou mít stejný order_index!

**`templates`**: `id, key, name, industry, current_version, status` (key = "barber", "wellness", "lawyer")  
**`template_versions`**: `id, template_id, version, default_sections (JSONB), default_design_tokens (JSONB), default_demo_content (JSONB)`  
→ `default_sections` je pole objektů `{type, order, variant, visible}` — BEZ content dat  
→ Plný content je v `default_demo_content` jako dict klíčovaný typem sekce

**`template_lab_generated`**: `job_id, template_slug, template_name, industry, source_url, editable_schema (JSONB), status`  
→ `editable_schema` má strukturu: `{key, name, industry, designTokens, defaultSections, demoContent, pages[{sections[{type,order,variant,content,settings}]}]}`  
→ `pages[0].sections[]` obsahuje PLNÝ content každé sekce

---

### Seed demo tenanta ze šablony
Skript: `node scripts/seed-barber-demo.mjs`  
Postup (viz `tenant-factory.ts`):
1. INSERT do `tenants`
2. INSERT do `pages` (homepage, slug='home', is_homepage=true)
3. Pro každou sekci INSERT do `sections` se `settings = {content, designTokens}`
4. INSERT do `tenant_modules` pro free moduly

---

## Template Lab — Workflow pro novou šablonu (1:1 klon)

### ZLATÉ PRAVIDLO: Výsledek MUSÍ být naprosto totožný s originálem — pixel perfect, ne "podobný"

Jakákoliv odchylka od originálu je chyba. Klon musí vypadat přesně jako původní web.

---

### Kompletní postup: Od URL ke spuštěnému demu (pro každou novou šablonu)

#### Krok 1 — Stáhni assets originálu

Vytvoř skript `scripts/mirror-[nazev]-assets.mjs` (viz vzor `mirror-barber-assets.mjs`).

```
public/clones/[nazev]/          ← sem patří VŠECHNY assety (CSS, JS, fonty, obrázky, videa)
```

Adresářová struktura musí zrcadlit URL cesty originálu:
- `https://domena.cz/assets/css/styles.css` → `public/clones/[nazev]/assets/css/styles.css`
- Lokální base path: `/clones/[nazev]`

**Co stáhnout:**
- CSS soubory (všechny, co jsou v `<head>`)
- JS soubory (jQuery nejdřív!, pak vlastní skripty)
- Fonty (.woff2 a .woff) — CSS je referencuje jako `../fonts/` → nutno přepsat na absolutní lokální cestu
- Obrázky (logo, hero, galerie, thumbnaily)
- Videa (.mp4, .webm) pokud jsou
- Favicon, language flags atd.

**Přepis CSS po stažení:**
```js
// ../fonts/ → absolutní lokální
css = css.replace(/url\((['"]?)\.\.\/fonts\//g, `url($1/clones/[nazev]/assets/.../fonts/`);
// ../img/ → absolutní lokální
css = css.replace(/url\((['"]?)\.\.\/img\//g, `url($1/clones/[nazev]/assets/.../img/`);
// Zbývající absolutní URL
css = css.replace(/https?:\/\/domena\.cz\/?/g, `/clones/[nazev]/`);
```

---

#### Krok 2 — Stáhni a zpracuj HTML každé stránky (homepage + všechny podstránky)

```
Stránky k zpracování: homepage, /sluzby/, /o-nas/, /cenik/, /galerie/, /faq/, /akce/ ...
```

**HTML pipeline (povinné kroky pro KAŽDOU stránku):**

```js
// 1. Extrahuj pouze <body> obsah (ne celou stránku s <head>)
const body = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1];

// 2. Nahraď VŠECHNY reference na původní doménu lokálními cestami
html = html.replace(/https?:\/\/domena\.cz\/\//g, `/clones/[nazev]/`);
html = html.replace(/https?:\/\/domena\.cz\//g, `/clones/[nazev]/`);

// 3. Fix relativní src/href reference (src="assets/..." → absolutní)
html = html.replace(/src="assets\//g, `src="/clones/[nazev]/assets/`);

// 4. jQuery na lokální verzi (bylo v <head>, musíme inject na začátek body)
html = html.replace(/https:\/\/ajax\.googleapis\.com\/ajax\/libs\/jquery\/[^"']*/g,
  `/clones/[nazev]/assets/.../js/jquery.min.js`);
html = `<script src="/clones/[nazev]/assets/.../js/jquery.min.js"></script>\n` + html;

// 5. Odstraň preloader (jQuery window.load nefunguje spolehlivě v Next.js SSR)
html = html.replace(/<!-- BEGIN BLOCK PRELOADER -->[\s\S]*?<!-- BEGIN BLOCK PRELOADER -->/, '');
html = html.replace(/<script>\s*\/\/ PRELOADER[\s\S]*?\/\/ PRELOADER\s*<\/script>/, '');

// 6. Odstraň 3rd party widgety (analytika, recenze, booking)
html = html.replace(/<!-- Yandex\.Metrika counter -->[\s\S]*?<!-- \/Yandex\.Metrika counter -->/g, '');
html = html.replace(/<script[^>]*googletagmanager[^<]*<\/script>/gi, '');
html = html.replace(/<script[^>]*elfsight[^<]*defer[^>]*><\/script>/gi, '');
// ⚠️ NIKDY nepoužívat [\s\S]*? na hledání <script> bloků — přeskočí hranice jiných scriptů!
// Vždy používej comment-delimiter removal (<!-- ... -->) nebo specifické vzory.

// 7. Přepiš nav linky na /demo/[tenant-slug]/[slug]
html = html.replace(/href="\/o-nas\/?"/g, `href="/demo/[tenant-slug]/o-nas"`);
html = html.replace(/href="\/cenik\/?"/g, `href="/demo/[tenant-slug]/cenik"`);
// ... atd. pro každou podstránku
// Pozor: mirror script mohl již přepsat /domena.cz/o-nas/ → /clones/[nazev]/o-nas/
// Nutno přepsat i tyto:
html = html.replace(/href="\/clones\/[nazev]\/o-nas\/?"/g, `href="/demo/[tenant-slug]/o-nas"`);
```

**Cache HTML do /tmp pro rychlé opakování:**
```js
const cacheFile = `/tmp/[nazev]-home.html`;
if (existsSync(cacheFile) && !process.argv.includes('--refetch')) {
  html = readFileSync(cacheFile, 'utf-8');
} else {
  // fetch + uložit
  writeFileSync(cacheFile, rawBody);
}
// Spustit s --refetch pro vynucení nového stažení
```

---

#### Krok 3 — Ulož do DB (tenant + stránky + sekce)

```
Tenant slug: [nazev]-demo
```

**Skript:** `scripts/seed-[nazev]-demo.mjs`

```js
// 1. Vytvoř nebo recykluj tenanta
INSERT INTO tenants (slug, template_id, industry, status) VALUES ('[nazev]-demo', ...)

// 2. Pro každou stránku (home + každá podstránka):
INSERT INTO pages (tenant_id, slug, title, is_homepage) VALUES (...)

// 3. Pro každou stránku — jedna sekce full-page-clone:
INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
VALUES (tenantId, pageId, 'full-page-clone', 'default', 0, true, JSON.stringify({
  html,                                         // zpracované HTML těla
  cssUrls: ['/clones/[nazev]/assets/css/...'],  // cesty k lokálním CSS
  jsUrls: [],                                   // JS je injektovaný přímo v html
}))
```

**Pozor:** `UNIQUE(page_id, order_index)` — při opakovaném seeding vždy nejdřív `DELETE FROM sections WHERE tenant_id = X AND page_id = Y`.

---

#### Krok 4 — Ověř výsledek

```bash
# Veřejné stránky (musí být 200):
curl -I http://localhost:3015/demo/[nazev]-demo
curl -I http://localhost:3015/demo/[nazev]-demo/o-nas
curl -I http://localhost:3015/demo/[nazev]-demo/cenik
# ... všechny podstránky

# Admin stránky (musí být 200 s cookie):
curl -I -H "Cookie: venom_access_[nazev]-demo=[access_token]" \
  http://localhost:3015/demo/[nazev]-demo/admin
curl -I -H "Cookie: venom_access_[nazev]-demo=[access_token]" \
  http://localhost:3015/demo/[nazev]-demo/admin/o-nas
```

**Vizuální kontrola (povinná):**
- Otevři veřejnou URL a originál vedle sebe — musí být identické
- Klikni na všechny nav linky — nesmí být 404
- Zkontroluj admin view — admin bar s Page Builder musí být viditelný přes klon

---

### Architektura full-page-clone renderování

```
Veřejná URL (/demo/[slug]):
  page.tsx → getTenantPage() → getPageSections()
           → find(section_type === 'full-page-clone')
           → <ClonedSiteRenderer html cssUrls jsUrls />
           → dangerouslySetInnerHTML + React 19 <link> hoisting do <head>

Admin URL (/demo/[slug]/admin):
  admin/page.tsx → <TenantEditorView sections={...} />
                → SectionRenderer case 'full-page-clone'
                → <ClonedSiteRenderer /> (clone viditelný pod admin barem)
                → admin bar fixed nahoře (Page Builder, SEO, Blog, atd.)
                → inline klikací editor DISABLED pro clone stránky (raw HTML)
```

**Klíčové soubory:**
- `src/components/tenant/ClonedSiteRenderer.tsx` — renderuje raw HTML + CSS
- `src/components/tenant/SectionRenderer.tsx` — case 'full-page-clone' → ClonedSiteRenderer
- `src/components/tenant/TenantEditorView.tsx` — `hasClonePage` disabluje inline editor
- `src/app/demo/[tenantSlug]/page.tsx` — home page clone detection
- `src/app/demo/[tenantSlug]/[slug]/page.tsx` — subpage clone detection

**React 19 feature:** `<link rel="stylesheet" precedence="default">` v komponentě se automaticky hoistuje do `<head>`.  
Root `layout.tsx` je čistý (`{children}` only) — clone se renderuje bez Venom UI navrchu.

---

### Šablony — aktuální názvy

| key | name | industry |
|-----|------|----------|
| barber | Cutsmith | barber |
| wellness | Serenova | wellness |
| lawyer | Lexis | legal |
| astera | Canvas Studio | consulting |
| barber-barbershopurban | The Fade Room | barber |
| peak-cut | Peak Cut Barbershop | barber |

Přejmenovat: `UPDATE templates SET name = 'Nové Jméno' WHERE key = '...'`

---

### Chyby při scraping — co se nesmí opakovat

**Regex přes hranice `</script>` tagů:**  
`/<script[^>]*>[\s\S]*?mc\.yandex\.ru[\s\S]*?<\/script>/g` — může začít od úplně jiného `<script>` a spolykat celé bloky JS (ai8d.js, common.js). **Řešení:** Používej comment-delimiter removal pro skripty třetích stran.

**jQuery chybí v body:**  
Originál má jQuery v `<head>` — my extrahujeme jen `<body>`. Nutno vždy inject `<script src="...jquery...">` na začátek body HTML.

**Preloader se točí donekonečna:**  
jQuery `$(window).on('load', ...)` nefunguje v Next.js SSR kontextu. Preloader div musíme vždy kompletně odebrat.

**Nav linky vedou na localhost:3015/o-nas/ → 404:**  
Mirror script přepsal `barbershopurban.cz/o-nas/` na `/clones/barber-urban/o-nas/` (lokální path, ne demo path). Subpage script musí přepsat i tyto `/clones/[nazev]/` nav linky na `/demo/[slug]/`.

**`thumbHash` referenced before declaration:**  
V Node.js ESM modulech `const` deklarace nejsou hoistovány — funkce, která referuje `const THUMB_HASHES`, musí být definována AŽ po deklaraci té konstanty.

---

### Mapování sekcí: generator výstup vs. section komponenty

Generator (`src/lib/template-lab/generator.ts`) generuje jiné field names než co komponenty očekávají. **Opraveno přidáním fallbacků do komponent** (obě varianty fungují):

| Section | Generator field | Komponenta očekávala | Opraveno v |
|---------|----------------|---------------------|------------|
| testimonials | `reviews[]{author, text, rating}` | `testimonials[]{name, text, rating}` | `TestimonialsSection.tsx` |
| faq | `items[]{q, a}` | `faq[]{question, answer}` | `FaqSection.tsx` |
| opening-hours | `hours[]{day, time}` | `openingHours[]{day, hours}` | `OpeningHoursSection.tsx` |
| pricing | `items[]{name, price, description}` | `services[]{name, price}` | `ServicesSection.tsx` |

Sekce `pricing` nebyla v `SectionRenderer` — přidána jako alias pro `services` case.

### Struktura `editable_schema` (template_lab_generated)
```
{
  key, name, industry, version,
  designTokens: { colorPrimary, colorBackground, fontHeading, ... },
  defaultSections: [{type, order, variant, visible}],  // bez content!
  demoContent: { navbar: {...}, hero: {...}, ... },     // content podle type
  pages: [{
    sections: [{type, order, variant, visible, content: {...}, settings: {...}}]
  }]
}
```
→ `pages[0].sections` má vše — použít to pro seeding tenanta, ne `defaultSections`

### Import file-system šablon do DB
`POST /api/template-lab/import` — prochází `template-lab/generated/` a importuje JSON soubory do DB.  
Pozor: `template_lab_jobs` nemá textový `job_id` sloupec — má jen serial `id`.  
Pozor: `template_lab_generated` má sloupec `editable_schema`, ne `definition`.

---

## TypeScript / Next.js Gotchas

### `params` je v Next.js 16 Promise
```tsx
// Next.js 16 — params je Promise, nutno await
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}
```

### `middleware.ts` → `proxy.ts`
V Next.js 16 byl middleware přejmenován na `proxy.ts` (edge runtime). `middleware.ts` se ignoruje.

### `useSearchParams()` vyžaduje Suspense
Komponenta používající `useSearchParams()` musí být obalena v `<Suspense>`, jinak build selže.

### pg query — jsonb vs. string
Když pg vrací `JSONB` sloupec, dostanete přímo JS objekt (ne string) — `JSON.parse()` by failnulo s `"Unexpected token 'o'"`. Použijte přímo `r.rows[0].column` bez parsování.

### `UNIQUE(page_id, order_index)` v sections
Při opakovaném seedování bez smazání → duplicate key error. Před seedováním vždy smazat starého tenanta nebo použít `DELETE FROM tenants WHERE slug = '...'` (CASCADE smaže pages + sections).

---

## Template Lab — Fáze 3: Obfuskace klonu (spouštět po Fázi 1+2)

### POŘADÍ FÁZÍ — povinné, nelze přeskočit

```
Fáze 1: mirror-[nazev]-assets.mjs     → stáhne assety, zpracuje HTML homepage
Fáze 2: mirror-[nazev]-subpages.mjs   → scrapuje podstránky, opraví nav linky, uloží do DB
Fáze 3: obfuscate-clone.mjs           → přejmenuje třídy/ID, odstraní tracking, kód autor nepozná
Fáze 4: rename-clone.mjs              → přejmenuje klon (barber-urban → fade-room), slug v DB
Fáze 5: cleanup-clone.mjs             → přejmenuje adresáře, smaže ext. URL, PageSpeed, SEO, sitemap
```

Fáze 4 a 5 spouštět vždy v tomto pořadí (4 → 5). Fáze 5 je idempotentní, lze opakovat.  
Pokud dojde k resetu (seed-demo smaže tenanta), musí se Fáze 2 + 3 + 5 znovu spustit.

---

### Fáze 3: Co obfuskace dělá

1. **CSS třídy přejmenovány** — všech 611+ tříd dostane deterministický FNV hash: `.container → .x1cl0`, `.navbar → .xb0ac` atd.  
   Format: `x` + 4 znaky base36. Vypadá jako CSS Modules / Webpack hash.

2. **HTML-only třídy přejmenovány** — třídy přítomné jen v HTML (generované CMS, ne v CSS) jsou také přejmenovány. Celkem 659+ tříd.

3. **HTML ID atributy přejmenovány** — `id="menu"` → `id="vxf4"`. Přepsány i `href="#id"`, `data-target="#id"`, `aria-controls`, `aria-labelledby`, `for` atributy.

4. **CSS komentáře odstraněny** — `-11%` velikost CSS souboru.

5. **Tracking scripty odstraněny** — Google Tag Manager, Google Analytics, Facebook Pixel, Hotjar, Yandex Metrika, Alteg, Elfsight, Clarity, Tawk, Intercom a všechny ostatní.

6. **HTML komentáře odstraněny** — žádné komentáře s infem o CMS, autorovi, datu.

7. **Meta generator odstraněn** — žádný `<meta name="generator" content="WordPress/MODX/...">`.

8. **3rd party data atributy odstraněny** — `data-vc-*`, `data-elementor-*` apod.

9. **Mapping uložen** — `template-lab/obfuscation-maps/[clone-name].json` — kompletní tabulka původní → nový název (pro audit).

---

### Spuštění

```bash
# Produkční run
node scripts/obfuscate-clone.mjs barber-urban barber-urban-demo

# Dry run (jen výpis, nic nepíše)
node scripts/obfuscate-clone.mjs barber-urban barber-urban-demo --dry-run

# Obecný tvar
node scripts/obfuscate-clone.mjs <clone-name> <tenant-slug>
# <clone-name>   = název adresáře pod public/clones/
# <tenant-slug>  = slug tenanta v DB
```

---

### Technické detaily — co se nesmí opakovat

**url() bloky musí být chráněny při CSS replacement:**  
Regex `/\.([-a-zA-Z_][\w-]*)/g` aplikovaný na CSS bez ochrany url() bloků najde `.woff2`, `.css`, `.jpg` v cestách jako `url('/clones/.../fonts/Font.woff2')` a pokusí se je přejmenovat → rozbije se font-face. Řešení: před replacementem extrahovat `url(...)` do placeholderů, po replacementu obnovit.

**Extrahovat třídy z CSS I Z HTML:**  
CMS jako MODX generuje třídy jako `menu-main-menu-rus-container` do HTML ale ne do CSS. Bez extrakce z HTML by tyto třídy zůstaly původní a prozradily použitý CMS.

**Barvy `#rrggbb` v CSS nesmí být přejmenovány:**  
`#c19556` je barva, ne ID selektor. Filtr: `isColorValue(token)` kontroluje zda token je 3 nebo 6 hex znaků.

**File extensions nejsou CSS třídy:**  
`.woff`, `.woff2`, `.css`, `.jpg` atd. jsou chyceny regexem z komentářů a URL — nutno filtrovat přes `NOT_CLASS` set.

**Fáze 3 je idempotentní (na čistých datech):**  
Hash je deterministický (FNV32) — stejný vstup vždy dá stejný výstup. Ale při re-run přes již obfuskovaná data by se hashe hashaly znovu a výsledek by byl nesmyslný. Vždy spouštět na čistých datech.

**seed-barber-demo.mjs smaže tenanta (CASCADE):**  
Pokud se seed znovu spustí, přijdou o se všechny subpages i sections. Nutno znovu spustit Fáze 2 + 3.

---

## Template Lab — Fáze 4: Přejmenování klonu (rename-clone.mjs)

**Spustit VŽDY po Fázi 3, PŘED Fází 5.**  
Nikdy nesmí v žádném souboru, DB záznamu ani URL zůstat název původní šablony (barber-urban, barbershopurban, apod.)

### Co rename-clone dělá

1. **Kopíruje adresář** `public/clones/[old]` → `public/clones/[new]` (zachovává originál pro ověření)
2. **Přepisuje CSS soubory** — nahradí všechny výskyty `/clones/old` → `/clones/new`
3. **Aktualizuje DB:**
   - `tenants.slug`: `old-demo` → `new-demo`
   - `templates.key`: klíče odpovídající starému jménu
   - HTML ve všech `full-page-clone` sekcích: nahrazení `/clones/old`, `/demo/old-demo`, `oldName`, `oldTenantSlug`
4. **Vytvoří přejmenované skripty** s nahrazeným obsahem

### Spuštění

```bash
node scripts/rename-clone.mjs <starý-slug> <nový-slug>
# Příklad:
node scripts/rename-clone.mjs barber-urban fade-room
# → tenant slug: barber-urban-demo → fade-room-demo
# → adresář: public/clones/barber-urban/ → public/clones/fade-room/
```

### Pravidla jmen klonů

- **Jméno klonu** = krátké, neutrální anglické jméno (fade-room, glow-studio, peak-cut, aurora-spa…)
- **Nikdy** nesmí být: barbershop, barbershopurban, barber-urban, urban, wellness[original], modx, evo, evoBabel, slova z originálního brandu
- **Tenant slug** = vždy `[clone-name]-demo` (pro všechna demo prostředí)
- Po přejmenování smaž starý adresář `public/clones/[old]/` ručně po ověření

### Gotcha: template key v DB

Template key se hledá pomocí `LIKE '[oldName]%'`. Pokud original seed uložil klíč jako `barber-barbershopurban` místo `barber-urban-barbershopurban`, skript ho nenajde. Ověř ručně:

```sql
SELECT id, key FROM templates WHERE key LIKE '%barber%' OR key LIKE '%urban%';
UPDATE templates SET key = 'fade-room' WHERE key = 'barber-barbershopurban';
```

---

## Template Lab — Fáze 5: Kompletní čistka (cleanup-clone.mjs)

**Spustit VŽDY jako poslední fázi, po Fázi 4.**  
Tento skript je idempotentní — lze spustit opakovaně bez vedlejších efektů.

### Co cleanup-clone dělá

1. **Přejmenuje adresáře na disku** — odstraní CMS-revealing názvy:
   | Starý název | Nový název | Proč odhaluje |
   |---|---|---|
   | `assets/templates/barbershop/` | `theme/` | MODX + šablona "barbershop" |
   | `assets/galleries/1/` | `media/` | MODX galerie systém |
   | `assets/cache/images/assets/galleries/1/` | `thumb/` | MODX cache struktura |
   | `assets/images/` | `img/` | generický ale zbytečný |
   | `assets/snippets/evoBabel/config/images/` | `lang/` | evoBabel = MODX plugin |

2. **Přepíše CSS soubory** — remapuje všechny staré cesty na nové

3. **Opraví DB (full-page-clone sekce):**
   - cssUrls: nahradí externí URL lokální cestou `/clones/[name]/theme/css/styles.min.css`
   - jsUrls: lokalizuje jQuery CDN → `/clones/[name]/theme/js/jquery.min.js`, ostatní js → remapuje přes PATH_MAP
   - HTML: remapuje všechny staré cesty, odstraní zbývající externí domény
   - tenant.email: anonymizuje `demo@originalsite.cz` → `info@demo.local` (Next.js RSC serializuje celý tenant objekt do flight data — email by jinak prozradil originál)

4. **PageSpeed optimalizace:**
   - 1. obrázek: `loading="eager" fetchpriority="high"` (hero image)
   - Ostatní obrázky: `loading="lazy" decoding="async"`
   - Skripty (ne jQuery): přidá `defer`
   - Video: `preload="auto"` → `preload="none"`

5. **SEO metadata** — neutralní tituly bez původního brandu:
   | Slug | Titulek | Popis |
   |---|---|---|
   | home | [BrandName] | Profesionální služby. Objednejte se online. |
   | sluzby | Služby — [BrandName] | Přehled všech nabízených služeb a jejich cen. |
   | o-nas | O nás — [BrandName] | Poznejte náš tým a příběh naší provozovny. |
   | akce | Akce & Novinky — [BrandName] | Aktuální akce, slevy a novinky pro vás. |
   | cenik | Ceník — [BrandName] | Transparentní ceník všech našich služeb. |
   | faq | Časté otázky — [BrandName] | Odpovědi na nejčastější dotazy zákazníků. |
   | galerie | Galerie — [BrandName] | Fotogalerie naší práce a prostředí. |

6. **Generuje sitemap** — `public/sitemaps/[tenant-slug].xml`

7. **robots.txt** — generuje Next.js přes `src/app/robots.ts` (MetadataRoute). NIKDY nevytvářet `public/robots.txt` — konflikt s Next.js routou. Ujistit se, že `src/app/robots.ts` má `/demo/` a `/api/` v disallow listu.

### Spuštění

```bash
node scripts/cleanup-clone.mjs <clone-name> <tenant-slug> "<Brand Name>"
# Příklad:
node scripts/cleanup-clone.mjs fade-room fade-room-demo "The Fade Room"
```

### Pravidla pro remapování cest — co nesmí projít

Všechny následující typy refs musí být 0 po cleanup:

```bash
# Ověření v DB (node -e nebo psql):
SELECT count(*) FROM sections s
  JOIN pages p ON p.id = s.page_id
  WHERE s.section_type = 'full-page-clone'
  AND (s.settings->>'html' LIKE '%barbershopurban.cz%'
    OR s.settings->>'html' LIKE '%assets/templates%'
    OR s.settings->>'html' LIKE '%.cz/%assets%');
# Výsledek musí být 0
```

Povolené externí URL v HTML (nevadí, patří ke content):
- `https://www.instagram.com/...` — sociální sítě (business content, klient si změní)
- `https://www.facebook.com/...` — totéž
- `https://www.google.com/maps/...` — Maps embed (lokace provozovny)
- `https://www.w3.org/...` — SVG namespace (povinné, standardní HTML)

### Gotcha: double-slash v URL

MODX CMS generuje backgroundy jako `url('https://domain.cz//media/img.jpg')` (double slash po doméně). Standardní regex `/https?:\/\/domain\/path/` to nechytne. Regex final sweep v `remapPaths()` musí používat `\/{1,2}` a capture skupinu bez leading slash:

```js
text = text.replace(
  /https?:\/\/[a-z0-9.-]+\.[a-z]{2,}\/{1,2}((?:theme|img|media|thumb|lang|gallery|assets|fav|cache)[^"'\s\)>\\]*)/gi,
  `${BASE}/$1`
);
```

### Gotcha: jsUrls v settings nejsou HTML atributy

`settings.jsUrls` je pole čistých URL stringů, ne HTML atributů. Regex `/(href|src)=".../` je nechytí. Řešení: procházet pole a každou URL zpracovat přes `remapPaths()` samostatně (step 4 v `remapPaths` přepíše `assets/templates/barbershop/` → `theme/`, step 5 pak odstraní původní doménu).

### Gotcha: tenant.email v Next.js RSC flight data

Next.js App Router serializuje celý tenant objekt do RSC flight data (skrytý JSON v HTML). Pokud `tenants.email = 'demo@originaldomain.cz'`, tento string se objeví ve view-source. Cleanup musí anonymizovat email: `UPDATE tenants SET email = 'info@demo.local' WHERE slug = $1`.

### Gotcha: url() blok v CSS s externím odkazem

CSS `url()` bloky s externími doménami je nutno chytat zvlášť (před general regex) protože mají jiný tvar — `url('https://...')` vs `href="https://..."`. Viz krok 2 v `remapPaths()`.

---

## KOMPLETNÍ POVINNÝ POSTUP PRO KAŽDOU NOVOU ŠABLONU

> **AI NESMÍ OZNAČIT ŠABLONU JAKO HOTOVOU BEZ SPLNĚNÍ VŠECH BODŮ NÍŽE.**
> Každý bod musí být ověřen screenshotem nebo výpisem. Žádný bod nelze přeskočit.

---

### FÁZE 0 — Analýza originálu

Před psaním jediného řádku kódu:

```
□ Stáhnout homepage → zjistit CMS (WordPress/MODX/jiný)
□ Zjistit typ: multi-page nebo single-page (anchor nav)
□ Vypsat všechny CSS, JS, font, image URL
□ Zjistit nav strukturu: kolik stránek, jaké slugy
□ Zkontrolovat mobilní zobrazení originálu (screenshot 390px)
□ Ověřit Google Fonts → stáhnout lokálně (ŽÁDNÉ externe CDN!)
□ Sepsat seznam všech externích zdrojů, které musí být lokalizovány
```

---

### FÁZE 1 — Stažení a lokalizace assets

```
□ Stáhnout CSS soubory → přepsat cesty na lokální
□ Stáhnout Google Fonts (woff2) → uložit lokálně, přepsat @font-face URL
□ Stáhnout JS soubory (jQuery, carousel, vlastní bundle)
□ Stáhnout SVG sprite, všechny ikony
□ Stáhnout VŠECHNY obrázky (hero, galerie, about, kontakty, partnery)
□ Stáhnout favicon
□ CDN knihovny (slick, swiper…) → lokální kopie v /clones/[name]/cdn/
□ Network check: 0 externích requestů na CSS/JS/fonty po lokalizaci
□ Zpracovat HTML každé stránky (body only, tracking odstraněn)
□ Opravit všechny src/href na lokální cesty
```

**KRITICKÉ — Google Fonts musí být vždy lokální:**
```js
// Stáhnout všechny varianty fontu:
// https://fonts.googleapis.com/css2?family=Oswald:wght@200;400;600
// → parsovat CSS → stáhnout každý .woff2 → uložit lokálně
// → přepsat @font-face src na /clones/[name]/fonts/Oswald-400.woff2
// Injektovat jako <style> do HTML nebo přidat do CSS souboru
```

---

### FÁZE 2 — Seed DB

```
□ Vytvořit tenanta se slugem [name]-demo
□ Vytvořit každou stránku (nebo 1 pro single-page)
□ Každá stránka = 1 sekce full-page-clone
□ cssUrls: POUZE lokální cesty /clones/[name]/...
□ jsUrls: POUZE lokální cesty /clones/[name]/...
□ Ověřit: tenant.email = info@demo.local
□ Ověřit: tenant.access_token nastaven
```

---

### FÁZE 3 — Obfuskace (obfuscate-clone.mjs)

```
□ node scripts/obfuscate-clone.mjs [name] [name]-demo
□ Ověřit: CSS třídy přejmenovány (BEM → xhash)
□ Ověřit: HTML ID atributy přejmenovány
□ Ověřit: CSS komentáře odstraněny
□ Ověřit: tracking skripty odstraněny
□ Ověřit: meta generator odstraněn (WordPress/MODX)
□ Mapping uložen do template-lab/obfuscation-maps/[name].json
```

---

### FÁZE 4 — Přejmenování (rename-clone.mjs)

```
□ node scripts/rename-clone.mjs [raw-name] [final-name]
□ Ověřit: v DB není žádná reference na původní clone name
□ Ověřit: public/clones/[final-name]/ existuje a má všechny assety
□ Ověřit: public/clones/[raw-name]/ smazán
```

---

### FÁZE 5 — Cleanup (cleanup-clone.mjs)

```
□ node scripts/cleanup-clone.mjs [final-name] [final-name]-demo
□ Ověřit: tenant.email = info@demo.local
□ Ověřit: sitemap vygenerována → public/sitemaps/[tenant-slug].xml
□ Ověřit: žádný odkaz na původní doménu v HTML ani CSS
```

---

### FÁZE 6 — AI GENEROVÁNÍ OBRÁZKŮ (povinné!)

**AI NESMÍ ponechat originální fotografie! Všechny fotky musí být AI-generované.**
**Sonnet generuje obrázky SÁM — ne ručně, ne placeholderami.**

```
□ Identifikovat všechny obrázky, které obsahují rozpoznatelný brand/logo originálu
□ Identifikovat hero image, galerie, about image, kontaktní fotky
□ Vygenerovat náhrady přes Pollinations.ai (Flux model, ZDARMA, bez API klíče):
  - Hero desktop: 1536x1024, dramatická atmosféra odvětví
  - Hero mobile:  768x1152, portrétní formát (uložit jako .jpg, ne .png!)
  - Gallery:      1024x1024, 4-6 variant
  - About:        1024x1024, interiér nebo tým
  - Kontakty:     1024x1024
□ Záloha: gpt-image-1 přes OPENAI_API_KEY (pokud billing dostupný)
□ Komprimovat přes sharp (mozjpeg, quality 82)
  - Hero: max 350KB
  - Gallery: max 220KB
  - Thumbs: max 80KB
□ PNG obrázky s > 400KB → převést na .jpg + aktualizovat HTML srcset reference
□ Uložit do public/clones/[name]/wp-content/uploads/ (stejné cesty jako originál)
□ Ověřit: žádná původní fotografie není v HTML ani CSS
```

```js
// PRIMÁRNÍ: Pollinations.ai (Flux) — zcela zdarma, bez API klíče
// Vzorový kód generování (VŽDY přes Sonnet/AI — ne ručně):

const sharp = (await import('sharp')).default;

async function generateViaPollinations({ prompt, width, height }) {
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function generateAndSave({ prompt, width, height, destPath, maxKB }) {
  const raw = await generateViaPollinations({ prompt, width, height });
  const ext = path.extname(destPath).toLowerCase();
  let buf;
  if (ext === '.jpg' || ext === '.jpeg') {
    buf = await sharp(raw).resize(width, height, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    if (buf.length / 1024 > maxKB) {
      buf = await sharp(raw).resize(width, height, { fit: 'cover' }).jpeg({ quality: 65, mozjpeg: true }).toBuffer();
    }
  } else if (ext === '.png') {
    buf = await sharp(raw).resize(width, height, { fit: 'cover' }).png({ compressionLevel: 9 }).toBuffer();
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
}

// Povinné obrázky:
// Hero desktop:  width=1536, height=1024, maxKB=350 → uložit jako .jpg
// Hero mobile:   width=768, height=1152, maxKB=120 → uložit jako .jpg (!)
//                → aktualizovat HTML srcset: Mobile-1.png → Mobile-1.jpg
// About:         width=1024, height=1024, maxKB=220
// Contact-us:    width=1024, height=1024, maxKB=220
// Contacts 1-2:  width=1024, height=1024, maxKB=220
// Gallery (4-6): width=1024, height=1024, maxKB=220
// Pauza 3s mezi každým requestem (rate limit)
```

**ZÁLOHA (pokud Pollinations nefunguje): OpenAI gpt-image-1**
```js
const { default: OpenAI } = await import('/Users/apple/DEV/CRM/convee-app/node_modules/openai/index.js');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const r = await openai.images.generate({ model: 'gpt-image-1', prompt, size: '1024x1024', quality: 'high' });
const raw = Buffer.from(r.data[0].b64_json, 'base64');
```

**Prompty musí být specifické pro odvětví šablony:**
- Barbershop: "professional barber cutting hair, dark moody atmosphere, dramatic lighting, photorealistic"
- Wellness: "serene spa interior, candles, white towels, zen atmosphere, photorealistic"
- Lawyer: "modern law office, leather chairs, bookshelves, professional, photorealistic"

**Skript pro každou šablonu:** `scripts/generate-[clone-name]-images.mjs`
- Vzor: `scripts/generate-peak-cut-images.mjs` (Pollinations.ai + OpenAI fallback)

**Po generování ověřit:**
- Každý soubor přepsal originál (stejná cesta!)
- Žádný obrázek > limit KB
- Screenshot stránky → vizuálně zkontrolovat AI obrázky

---

### FÁZE 7 — DEMO TEXTY (povinné!)

**Žádný text z originálu nesmí zůstat. Demo texty musí být neutrální a profesionální.**

```
□ Název firmy: "Peak Cut Barbershop" / "Serenova Wellness" / "Lexis Advokátní kancelář"
□ Adresa: "Václavské náměstí 1, Praha 1" (neutrální, ne originál)
□ Telefon: "+420 123 456 789"
□ Email: "info@demo.local"
□ Hero H1: nový popis služeb bez původního brandu
□ Služby: ceny a popis mohou zůstat (obecné)
□ Recenze: nahradit fiktivními neutrálními recenzemi
□ FAQ: obecné otázky bez specifik původní firmy
□ Copyright footer: "[Rok] [Demo Název]"
□ Všechny <title> a <meta description>: bez původního brandu
□ Otevírací doba: může zůstat nebo upravit
```

**Pattern pro nahrazení v HTML (po obfuskaci):**
```js
// Po seedu nebo v cleanup kroku:
html = html.replace(/BUDDY/gi, 'Peak Cut');
html = html.replace(/Barbershop BUDDY/gi, 'Peak Cut Barbershop');
html = html.replace(/buddy_barbershop_/gi, 'peakcut.barbershop');
html = html.replace(/info@demo\.local/g, 'info@demo.local'); // již čistý
// Ověřit: grep pro původní brand → 0 výsledků
```

---

### FÁZE 8 — MOBILNÍ OPTIMALIZACE (povinné!)

```
□ Screenshot 390x844: hero je viditelný (výška > 0)
□ Screenshot 390x844: nav hamburger funguje (klik → menu se otevře)
□ Screenshot 390x844: žádný horizontální scroll
□ Screenshot 390x844: text čitelný (ne příliš malý)
□ Screenshot 390x844: tlačítka dostatečně velká (min 44px)
□ Viewport meta tag přítomen: <meta name="viewport" content="width=device-width, initial-scale=1">
□ Obrázky responsive: max-width:100%, height:auto
□ Google Fonts: swap display pro FOUT prevenci
```

---

### FÁZE 9 — SEO & TECHNICKÉ (povinné!)

```
□ <title>: "[Demo název] — [Služba] [Město]" (bez původního brandu)
□ <meta description>: popis bez původního brandu, 150-160 znaků
□ <meta name="robots" content="noindex, nofollow"> (demo nesmí indexovat)
□ Sitemap: public/sitemaps/[tenant-slug].xml vygenerována
□ robots.txt: /demo/ je disallowed
□ OG tags: og:title, og:description, og:image (lokální obrázek)
□ Canonical URL: nastavena na demo URL
□ Structured data: odstraněna nebo nahrazena demo daty
□ Žádný <meta name="generator"> (WordPress/MODX)
```

---

### FÁZE 10 — PAGE SPEED & VÝKON (povinné!)

```
□ Google Fonts: display=swap (nebo lokální woff2 bez FOUT)
□ Obrázky: lazy loading (loading="lazy" na všechny mimo hero)
□ Hero image: loading="eager", fetchpriority="high"
□ JS: defer na všechny non-critical skripty
□ CSS: žádné render-blocking externí CSS (vše lokální nebo inline)
□ Playwright: page.evaluate() → zkontrolovat LCP element (hero img)
□ Cílová metrika: Lighthouse score ≥ 90 desktop, ≥ 80 mobil
□ Komprese: sharp optimalizace všech obrázků (viz FÁZE 6)
```

**Lazy loading patch pro HTML:**
```js
// Všechny img mimo hero dostat loading=lazy:
html = html.replace(/<img(?![^>]*loading=)/g, '<img loading="lazy"');
// Hero image zpět na eager:
html = html.replace(/(<img[^>]*Frame-1[^>]*)loading="lazy"/g, '$1loading="eager" fetchpriority="high"');
```

---

### FÁZE 11 — OVĚŘOVACÍ SCREENSHOTY (povinné!)

**Vše musí být prokázáno screenshotem. Nestačí "curl 200" nebo "žádné JS errory".**

```js
// Povinný kód:
const { chromium } = require('/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [], resources404 = [], externalResources = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', r => {
  if (r.status() === 404) resources404.push(r.url());
  const u = r.url();
  if (!u.includes('localhost') && !u.includes('fonts.gstatic') && !u.includes('maps.google'))
    externalResources.push(u);
});

// Desktop
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/[name]-desktop.png', fullPage: false });

// Mobile
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.screenshot({ path: '/tmp/[name]-mobile.png', fullPage: false });

// Originál srovnání
await page.goto(ORIG_URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.screenshot({ path: '/tmp/[name]-orig-desktop.png', fullPage: false });
```

```
□ Screenshot desktop přečten přes Read tool — layout viditelný, ne černá
□ Screenshot mobile přečten přes Read tool — hero viditelný, nav funguje
□ Screenshot orig desktop přečten — side-by-side srovnání provedeno
□ 404 resources: 0
□ External resources (CSS/JS/fonts): 0 (mapy jsou OK)
□ JS errory (mimo CSP bloky na mapy/ext.): 0
□ Originální brand v HTML: 0 výskytů
□ Originální doména v HTML: 0 výskytů
```

---

### FÁZE 12 — FINÁLNÍ VERIFIKACE

```
□ View Source / Network tab: žádný external CSS/JS/font request
□ View Source: žádný původní brand, doména, CMS jméno, tracking
□ DB: tenant.email = info@demo.local
□ DB: SEO tituly bez původního brandu
□ Sitemap existuje a je přístupná
□ Hamburger menu funguje na mobilu (JS test přes Playwright click)
□ Kontaktní formulář: odstraněn JS nebo nahrazen statickým
□ Google Maps: buď funkční nebo nahrazen obrázkem mapy
□ Copyright footer: demo název, ne originál
□ AI obrázky: všechny originální fotky nahrazeny
□ Lighthouse Desktop: ≥ 90
□ Lighthouse Mobile: ≥ 80
```

**AI NESMÍ napsat "hotovo" bez průchodu celým tímto checklistem.**

---

## Finální (starý) checklist — zachován pro kompatibilitu

```
□ http://localhost:3015/demo/[tenant-slug]          → homepage se načte
□ View Source: žádný odkaz na originální doménu
□ View Source: žádný název CMS (MODX, WordPress, evoBabel…)
□ View Source: žádný tracking (GTM, GA, FB Pixel…)
□ Network tab: všechny assety z /clones/[name]/ (0 external asset requests)
□ PageBuilder v /demo/[tenant-slug]/admin funguje pro admin
□ Mobile viewport: všechny stránky responsive
□ SEO tituly v DB: neutrální, bez původního brandu
□ public/sitemaps/[tenant-slug].xml existuje
□ public/robots.txt existuje a blokuje /demo/
```
