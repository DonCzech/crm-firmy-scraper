# PEAK-CUT — RE-SCRAPE + DEMO DATA + ENGINE PŘEVOD (jedno zadání)

**Projekt:** `/Users/apple/DEV/CRM/venom` | DEV: `http://localhost:3015`
**Šablona:** peak-cut (poškozena předchozím Sonnetem — viz Sekce 0)
**Workflow:** Tento prompt nahrazuje obvyklý FÁZE A/B postup pro peak-cut. Pro ostatní šablony platí `docs/FAZE_A_PROMPT.md` + `docs/FAZE_B_PROMPT.md`.

---

## 🔴🔴🔴 NEJDŮLEŽITĚJŠÍ PRAVIDLO — DVA ODDĚLENÉ TENANTI

Tohle čti TŘIKRÁT než cokoli uděláš. **Třikrát po sobě Sonnet smazal clone tenant** s vysvětlením typu *"musím smazat starého tenanta a seedovat znovu z JSON šablony"*. **NE. NIKDY.** Tady je správný model:

### V DATABÁZI existují DVA SAMOSTATNÉ TENANTI pro peak-cut:

| Tenant | Slug v DB | URL | Typ | Renderer | Source of truth |
|--------|-----------|-----|-----|----------|-----------------|
| **Clone** | `peak-cut` (nebo `peak-cut-clone`) | `/preview/peak-cut` | full-page-clone | originální HTML z `public/clones/peak-cut/` | scrape live webu |
| **Engine** | `peak-cut-demo` | `/demo/peak-cut-demo` | json-template | `src/templates/peak-cut/template.json` + content/cs.json | demo data |

**Tito dva tenanti EXISTUJÍ VEDLE SEBE. NIKDY se neslučují, nemažou, nepřepisují.**

- ❌ NESMAZÁVEJ tenant `peak-cut` / `peak-cut-clone` v DB
- ❌ NEMĚŇ jeho `type` z `full-page-clone` na `json-template`
- ❌ NESEEDUJ JSON šablonu do existujícího clone tenantu
- ❌ NESPOUŠTĚJ `DELETE FROM tenants WHERE slug LIKE '%peak%'` ani podobné
- ❌ NESPOUŠTĚJ `seed-peak-cut/route.ts` nebo podobný seed endpoint, pokud by přepisoval clone tenant

**Pokud najdeš, že `/preview/peak-cut` renderuje JSON šablonu místo full-page-clone — TO JE BUG, ne featura.** Znamená to, že předchozí Sonnet smazal clone tenanta. Tvůj úkol je ho **obnovit**, ne se na to "adaptovat" tak, že ho přepíšeš ještě jednou.

### Když máš pocit "musím přepnout tenant na engine":
**NE. ZASTAV SE. ZEPTEJ SE UŽIVATELE.**
Engine šablona má vlastní tenant `peak-cut-demo` na vlastní URL `/demo/peak-cut-demo`. Pokud tam nic není, **vytvoř nového tenantu**, nikdy nepřepisuj clone.

---

---

## 🚨 ABSOLUTNÍ ZÁKAZY

1. **`/preview` a `public/clones/` jsou filesystem read-only.** Pokud narazíš na "Permission denied" — NEOBCHÁZEJ, je to záměrné. V kroku 2 ti uživatel dočasně povolí write na `public/clones/peak-cut/`, jinde NE.
2. **NEPŘEDĚLÁVEJ DESIGN — měň POUZE OBSAH.** Layout, hlavička, hero, šířka sekcí, grid, fonty, barvy = nesahat.
3. **Nemaž clone tenant ani DB záznamy renderující `/preview`.**
4. **Po každém kroku reportuj — žádné autonomní "už to mám".** Po krocích 0, 1, 2, 3 zastav a počkej na pokyn.

---

## SEKCE 0 — STAV ŠKODY (vykaž a STOP)

Předchozí Sonnet poškodil `public/clones/peak-cut/`:
- `wp-content/themes/buddy/style.css` přepsán čerstvým stažením z live
- `bundle.min.js` zmenšen na ~2698 b (podezřele malý)
- HTML v DB nahrazeno čerstvým stažením s jinými obfuskovanými třídami než původní CSS
- Důsledek: CSS a HTML jsou asynchronní, web vypadá rozbitě

**Tvůj první krok — vykaž současný stav:**

```bash
ls -la public/clones/peak-cut/wp-content/themes/buddy/style.css 2>/dev/null
find public/clones/peak-cut -name '*bundle*' -exec ls -la {} \;
du -sh public/clones/peak-cut
find public/clones/peak-cut -type f | wc -l
shasum -a 256 public/clones/peak-cut/wp-content/themes/buddy/style.css 2>/dev/null
find public/clones/peak-cut -name 'bundle.min.js' -exec shasum -a 256 {} \;
```

Najdi URL originálního live webu peak-cut (zkus v tomto pořadí):
```bash
cat template-lab/research/peak-cut/source.txt 2>/dev/null
cat template-lab/research/peak-cut/*.json 2>/dev/null
grep -ri 'peak-cut' docs/MASTER_TEMPLATE_QUEUE.md
grep -ri 'peak' template-lab/ 2>/dev/null | grep -E 'https?://' | head -10
```

Ověř velikost bundle.min.js na live:
```bash
curl -sI <live-bundle-url> | grep -i content-length
```

**STOP. Pošli mi:**
- výstup `ls -la`, `du`, `find`, `shasum`
- URL live webu
- správnou velikost bundle.min.js z live
- jaký scraping skript byl použit pro ostatní šablony (najdeš v `template-lab/scripts/`)

Čekej na pokyn k SEKCI 1.

---

## SEKCE 0.5 — OBNOVA CLONE TENANTU V DB (před re-scrape)

Sonnet smazal/přepsal clone tenanta `peak-cut` v DB. Před re-scrape ho **obnov**.

1. Najdi DB schema a connection:
```bash
grep -ri 'tenants' src/lib/db/ src/db/ prisma/ drizzle/ 2>/dev/null | head -20
cat .env.local 2>/dev/null | grep -iE 'DATABASE|POSTGRES|NEON'
```

2. Zjisti, co je v DB teď:
```sql
SELECT id, slug, type, created_at, updated_at FROM tenants WHERE slug LIKE '%peak%';
```

3. Najdi seed/migration skript, který původně vytvořil clone tenanty pro ostatní šablony:
```bash
find . -name '*seed*' -path '*clone*' -o -name '*clone*seed*' 2>/dev/null
grep -ri "type.*full.page.clone\|full_page_clone\|fullPageClone" src/ scripts/ 2>/dev/null | head -10
ls -la template-lab/scripts/ scripts/ 2>/dev/null
```

4. Identifikuj, jak byly clone tenanti seedováni pro **už hotové** šablony (např. costa, cafe-01) a použij stejný postup pro peak-cut.

5. **STOP. Pošli mi:**
   - výstup SQL query (co je v DB s peak)
   - jméno seed skriptu, který používáš pro ostatní clony
   - návrh příkazu, kterým obnovíš clone tenanta (NESPOUŠTĚJ ho — počkej na můj pokyn)

Čekej.

---

## SEKCE 1 — RE-SCRAPE (až po mém pokynu)

Cíl: stáhnout HTML + CSS + JS + obrázky **v jednom běhu**, aby CSS třídy v HTML odpovídaly CSS souborům.

**Já (uživatel) ti dočasně povolím write:**
```bash
chmod -R u+w /Users/apple/DEV/CRM/venom/public/clones/peak-cut/
```

**Ty pak:**

1. Použij **stejný scraping skript** jako pro ostatní DONE šablony (najdi v `template-lab/scripts/`). Nevymýšlej vlastní wget — chceme konzistenci s ostatními clony.
2. Stáhni **celý mirror** v jednom běhu:
   - homepage + všechny podstránky (services, gallery, contact, about, FAQ, blog, …)
   - všechny CSS (style.css, theme.css, plugin CSS)
   - všechny JS (zvlášť bundle.min.js — musí odpovídat Content-Length z live)
   - obrázky, fonty
3. Aktualizuj DB záznam tenantu `peak-cut-clone` (pokud existuje) novým HTML — ale jen pokud byl předtím v DB, nedělej nový tenant.
4. Po stažení ověř:
```bash
du -sh public/clones/peak-cut
find public/clones/peak-cut -type f | wc -l
ls -la public/clones/peak-cut/wp-content/themes/buddy/style.css
find public/clones/peak-cut -name 'bundle.min.js' -exec ls -la {} \;
```
5. Restartuj dev server, otevři `http://localhost:3015/preview/peak-cut` — musí vypadat jako originální live web.

**STOP. Pošli mi:**
- výstup `du`, `find`, `ls`
- screenshot `/preview/peak-cut` na desktop (1440 px)
- screenshot `/preview/peak-cut` na mobile (375 px)

Čekej na pokyn. Já zamknu zpět: `chmod -R a-w public/clones/peak-cut/`.

---

## SEKCE 2 — FÁZE A: ANALÝZA (až po mém pokynu)

Načti **celé** soubory:
- `docs/FAZE_A_PROMPT.md`
- `docs/FAZE_B_PROMPT.md`
- `docs/MASTER_TEMPLATE_QUEUE.md`
- `docs/MASTER_ARCHITECTURE_INDEX.md`
- 7 standardů: `TEMPLATE_STANDARD.md`, `LIVE_EDITOR_STANDARD.md`, `PAGE_BUILDER_STANDARD.md`, `COMPONENT_ARCHITECTURE.md`, `IMAGE_PIPELINE_STANDARD.md`, `TENANT_DEPLOYMENT_FLOW.md`, `SEO_PERFORMANCE_CHECKLIST.md`

Vypiš:

### 2.1 Identifikace
- slug, demo název, originální doména, kategorie

### 2.2 Layout
- homepage struktura (sekce v pořadí)
- **VŠECHNY podstránky** (slug, název, sekce, URL na originále, URL na `/preview` pokud existuje)
- hero typ, gridy, spacing personality

### 2.3 Vizuální identita
- typografie (fonty, váhy, hierarchie)
- barvy (primary/secondary/accent — HEX z CSS)
- button styl, shadows, border radius
- atmosféra

### 2.4 Demo data — KONKRÉTNÍ VÝSKYTY V SCRAPE
Pro každou kategorii vypiš PŘESNĚ kde v `public/clones/peak-cut/` se to nachází (soubor + co tam je) a čím to nahradíš:

| Kategorie | Originál v scrape | Demo náhrada |
|-----------|-------------------|--------------|
| Logo | (cesta + soubor) | demo SVG s názvem "Demo Peak Cut" |
| Email(y) | (všechny výskyty) | `email@demo.cz` / `info@demo.cz` |
| Telefon(y) | (všechny výskyty) | `+420 704 123 456` |
| Adresa | (všechny výskyty) | `Ukázková 123, 110 00 Praha 1` |
| Web URL | (všechny doménové odkazy) | `https://demo.cz` |
| Facebook | (URL) | `https://facebook.com/demo` |
| Instagram | (URL) | `https://instagram.com/demo` |
| IČO | (všechny výskyty) | `12345678` |
| DIČ | (všechny výskyty) | `CZ12345678` |
| Firma s.r.o. | (např. "Pashkov s.r.o.") | `Demo Studio s.r.o.` |
| Jednatel | (např. "Illia Pashkov") | `Jan Demo` |
| Pobočky | (všechny) | Ukázková / Vzorová / Demonstrační |
| Ceník | (všechny položky originál ceny) | každá ±15–30 %, popisy přepsat |
| Recenze | (jména + texty) | Jan Novák, Petra Svobodová, Tomáš Dvořák, Eva Procházková, Martin Černý + vlastní texty |
| Celkové hodnocení | (např. "4.9★ z 312") | `4.8★ z 127 recenzí` |
| O nás text | (odstavce z originálu) | kompletně přepsat |
| Partnerské značky | (Rézl, Jameson, Becherovka, …) | demo SVG `Demo Brand 1/2/3` NEBO sekce pryč |
| Obrázky | (počet, kategorie) | 1 demo placeholder s rozměrem; kontaktní sekce max 1 obrázek |

### 2.5 Defekty originálu k opravě (PER STRÁNKA)
```
Homepage:
- (konkrétní defekt) → (konkrétní řešení)

/sluzby:
- ...

/galerie:
- ...

/kontakt:
- ...
```
Layout/hlavička/hero/šířka sekcí = NESAHAT, pokud k tomu není explicitní řádek v seznamu defektů.

### 2.6 Mapování sekcí na MASTER ENGINE
Pro každou sekci homepage + podstránek:
- ✅ **Reuse** (jméno shared sekce + varianty)
- ⚠️ **Extend** (jaká varianta chybí, jak ji přidám)
- 🆕 **New** (proč nejde použít shared)

### 2.7 Plán implementace
1. `src/templates/peak-cut/template.json` (sekce v pořadí, podstránky)
2. `src/templates/peak-cut/theme.json` (design tokens)
3. `src/templates/peak-cut/skin.css` (variant overrides)
4. `public/templates/peak-cut/logo.svg`
5. `src/templates/peak-cut/content/cs.json` (demo obsah)
6. Nové varianty shared sekcí (kde + proč)
7. Image pipeline (rozměry, WebP variants)
8. SEO bloky

**STOP. Pošli mi analýzu. Čekej na pokyn k SEKCI 3.**

---

## SEKCE 3 — FÁZE B: IMPLEMENTACE (až po mém pokynu)

### 3.0 Úvodní checklist (povinný, vypiš PŘED kódem)
1. Potvrď, že máš načteno: 7 standardů + queue + svou analýzu z SEKCE 2
2. Zopakuj v 1 řádku: slug, demo název, předchozí DONE šablona
3. Vypiš checklist bod po bodu z plánu 2.7 — ke každému "✅ splním + jak" + shared sekce (Reuse/Extend/New)

### 3.1 Implementace
- engine šablona vzniká v `src/templates/peak-cut/` (NE v `public/clones/`, NE v `src/app/preview/`)
- shared template engine, shared live editor, shared page builder, shared image pipeline, shared SEO, shared tenant arch
- DEMO DATA dosazuj **rovnou za pochodu** (logo, kontakty, ceník, recenze, atd.) — nikdy ani dočasně reálné hodnoty
- VŠECHNY podstránky z 2.2 musí být implementované (ne jen homepage)
- LAYOUT/HLAVIČKA/HERO/ŠÍŘKA SEKCÍ/GRID/FONTY/BARVY = NESAHAT (pokud není explicitní defekt z 2.5)

### 3.2 Validace
```bash
pnpm build    # PASS
pnpm typecheck   # 0 chyb
```
- Karta na `/preview-2` viditelná
- Klik otevírá funkční demo
- Editor klikem: text, button, image, gallery, social
- Upload + crop + resize obrázku funguje
- WebP + JPG fallback
- Mobile 375 / tablet 768 / desktop 1440 PASS
- SEO meta v `<head>`
- Lighthouse ≥ 90/95/95

### 3.3 AUDIT 5a — Negative grep (originál NESMÍ existovat)
Z 2.4 si vezmi seznam originálních hodnot. Pro každou:
```bash
grep -ri '<originál>' src/templates/peak-cut/ public/templates/peak-cut/
```
Každý jeden MUSÍ vrátit prázdný výstup. Vykaž seznam testovaných hodnot + výsledek.

### 3.4 AUDIT 5b — Generic guards
```bash
grep -rE '@[a-z0-9.-]+\.(cz|com|sk|eu)' src/templates/peak-cut/ public/templates/peak-cut/ | grep -v 'demo.cz' | grep -v README
grep -rE '\+?420 ?[0-9]{3} ?[0-9]{3} ?[0-9]{3}' src/templates/peak-cut/ public/templates/peak-cut/ | grep -vE '704 ?123 ?456|704 ?654 ?321'
grep -rE 'IČO[: ]*[0-9]{8}' src/templates/peak-cut/ public/templates/peak-cut/ | grep -v '12345678' | grep -v README
```
Všechny prázdné.

### 3.5 AUDIT 5c — Live test proti rendered HTML
```bash
curl -s http://localhost:3015/demo/peak-cut-demo > /tmp/peak-cut-rendered.html
```
Pro každou kategorii z 2.4 ověř, že v `/tmp/peak-cut-rendered.html` se nevyskytuje žádná originální hodnota. Vykaž ✅/❌ ke každé.

### 3.6 AUDIT 5d — Cena-diff
Vypiš mapování `originál → demo` pro **každou** cenu (např. `850 → 650`, `1300 → 1100`, …). Žádná identická.

### 3.7 AUDIT 5e — Vizuální parity side-by-side
Otevři **vedle sebe**:
- `http://localhost:3015/preview/peak-cut` (clone, 1:1 originál)
- `http://localhost:3015/demo/peak-cut-demo` (engine)

Pořiď screenshoty obou na desktop (1440) + mobile (375). Pro každou sekci vykaž ✅:
- hlavička: identická struktura, počet položek, pozice loga
- hero: identický typ, kompozice, výška
- ceník: identická šířka kontejneru, počet sloupců, styl řádků
- gallery: identický grid (počet sloupců, aspect-ratio)
- footer: identický layout
- typografie: identické fonty, váhy, velikosti
- barvy: identické HEX
- spacing: identický rytmus
- veškerý text NOVÝ ✅
- loga partnerů demo / pryč ✅
- patička demo s.r.o., demo IČO ✅

**Pokud screenshoty NEJSOU vizuálně téměř identické (až na obsah a opravené defekty z 2.5):**
NEPŘEPRACOVÁVEJ engine šablonu. Místo toho **rozšiř variantu sdílené sekce** (Extend), ať vzhled odpovídá originálu.

### 3.8 Kontrola netknutelnosti
```bash
git status -- src/app/preview/ public/clones/
```
Musí být clean (kromě legitimního re-scrape v `public/clones/peak-cut/` ze SEKCE 1).

### 3.9 Aktualizace queue
`docs/MASTER_TEMPLATE_QUEUE.md` řádek peak-cut: `TODO → DONE`, datum `2026-05-25`.

### 3.10 Finální audit (vypiš)
1. Co je splněno
2. Co není splněno + proč
3. Co bylo zjednodušeno
4. Scale rizika (pro dalších 89 šablon)
5. Doporučení pro shared standardy

---

## SEKCE 4 — STUDIO KOMPATIBILITA (povinné pro OBA tenanty)

Plné znění pravidel: `docs/LIVE_EDITOR_STANDARD.md` sekce 1.1.

Sonnet si stěžoval, že "klony nelze upravovat ve studiu kvůli media queries a 1 LayersPanel řádku". **NENÍ to omluva pro DONE bez studia.** Implementace je povinná:

### 4.1 StudioCanvas — dva render módy
- `mode: 'json' | 'clone'` podle typu tenantu z DB
- Mode `clone` renderuje `<iframe src="/preview/peak-cut" style="width: {390|768|1280}px">` — fyzická viewportní šířka, ne CSS scale

### 4.2 LayersPanel — sub-vrstvy z DOM pro clone tenant
- Strom z `iframe.contentDocument.body.children`
- Selektory: `header`, `section.hero`, `section.services`, `section.gallery`, `section.contact`, `footer`, …
- Klik na vrstvu → highlight + scroll do iframe

### 4.3 postMessage bridge studio ↔ iframe
- Hover highlight, click selection, in-place edit, save
- Injekce `data-edit-id` atributů do clone HTML při loadu (per text/image/button/icon/social)

### 4.4 Save flow pro clone
- Patch do clone HTML přes `data-edit-id`
- Diff ukládán zpět do tenantu (DB)
- Reload → změna zůstala

### 4.5 Validace
- `http://localhost:3015/studio?tenant=peak-cut` (clone): LayersPanel ≥ 5 sub-vrstev, iframe na desktop = 1280 px, mobile = 390 px (media queries reagují), klik na text/obrázek/button otevře in-place edit, save→reload PASS
- `http://localhost:3015/studio?tenant=peak-cut-demo` (engine): LayersPanel ze `template.json`, edit + save PASS

Bez 4.5 PASS pro **oba tenanty** = NENÍ DONE.

---

## ✅ DONE pouze pokud

- SEKCE 0, 1 PASS (re-scrape PASS, `/preview/peak-cut` vypadá jako live)
- SEKCE 4 PASS (studio funguje pro clone i engine tenanta)
- SEKCE 2 výstup vypsaný a schválený
- SEKCE 3.0 checklist vypsaný
- Build + typecheck PASS
- VŠECHNY podstránky implementované
- Editor funguje
- Image pipeline PASS
- Mobile + tablet + desktop PASS
- SEO + Lighthouse PASS
- 5a, 5b, 5c, 5d, 5e všechny ✅
- `git status -- src/app/preview/ public/clones/` clean
- Queue: DONE + datum
- Finální audit vypsaný

**Bez všech bodů: NENÍ DONE.**
