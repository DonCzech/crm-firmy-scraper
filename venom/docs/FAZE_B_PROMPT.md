# FÁZE B — IMPLEMENTACE ŠABLONY NA MASTER ENGINE

**Datum:** 2026-05-25
**Použití:** Tento prompt se posílá do **stejného okna** jako FÁZE A (`docs/FAZE_A_PROMPT.md`) — Sonnet už má načtenou vlastní analýzu výše a navazuje na ni.
Uživatel řekne: *"Vypracuj práci podle docs/FAZE_B_PROMPT.md"*.

---

## 🔧 SPOLEČNÝ KONTEXT (znovu si ověř — neopírej se jen o paměť)

PROJEKT: Venom / Webero
ROOT: `/Users/apple/DEV/CRM/venom`
DEV: `http://localhost:3015`

**Fronta šablon:** [docs/MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md)
- **Vstup:** `/preview` → **Výstup:** `/preview-2` (auto-discovery z `src/templates/<slug>/template.json`)
- Šablona = první `TODO` v queue (tu samou jsi analyzoval ve FÁZI A).

### 🚨🚨🚨 `/preview` JE READ-ONLY — NIKDY DO NĚJ NEZAPISUJ
`/preview` (`src/app/preview/page.tsx` + `public/clones/*` + jakékoli soubory, které ho zásobují) je **referenční zdroj pravdy** = 1:1 mirror 91 originálních scrapovaných webů. Slouží jako:
- vizuální reference pro side-by-side parity test
- fallback, kdyby engine šablona padla
- archiv pro budoucí audit

**ABSOLUTNÍ ZÁKAZ:**
- ❌ Měnit jakýkoli soubor v `src/app/preview/**`
- ❌ Měnit, mazat, nebo přepisovat soubory v `public/clones/<slug>/**`
- ❌ Nahrazovat clone tenanty engine šablonou
- ❌ Mazat tenanty / databázové záznamy, které renderují `/preview`
- ❌ Cokoli, co by změnilo vizuální výstup na `http://localhost:3015/preview` nebo `http://localhost:3015/preview/<slug>`

Veškerá tvoje práce probíhá VÝHRADNĚ v:
- `src/templates/<slug>/**` (nová engine verze)
- `src/app/preview-2/**` (auto-discovery výstup)
- `public/templates/<slug>/**` (engine assets — demo logo, placeholder images)
- shared sekce (`src/components/sections/**`) — pouze EXTEND varianty, ne breaking changes

Pokud máš pocit, že musíš sáhnout do `/preview` nebo `public/clones/`, **ZASTAV SE a zeptej uživatele**. Není to volitelné — porušení = okamžitý revert + ztráta důvěry.

**Před každou prací spusť kontrolu, že jsi nesáhl do /preview:**
```bash
git status -- src/app/preview/ public/clones/
# Musí být prázdné (clean). Jinak okamžitě git restore.
```

**⚠️ POZOR: `public/clones/` je untracked v gitu** (`.gitignore`). To znamená:
- `git restore` nepomůže → soubory NEJSOU v historii
- Jakákoli změna = **nevratná ztráta** dat
- Před jakoukoli operací, která by mohla sáhnout do `public/clones/<slug>/`, **vytvoř zálohu**:
  ```bash
  cp -R public/clones/<slug> /tmp/clones-backup-<slug>-$(date +%Y%m%d-%H%M%S)
  ```
- Jen tak budeš mít z čeho obnovit, když něco posereš.

**Sedm závazných standardů:**
`TEMPLATE_STANDARD.md`, `LIVE_EDITOR_STANDARD.md`, `PAGE_BUILDER_STANDARD.md`, `COMPONENT_ARCHITECTURE.md`, `IMAGE_PIPELINE_STANDARD.md`, `TENANT_DEPLOYMENT_FLOW.md`, `SEO_PERFORMANCE_CHECKLIST.md`

---

## ⚠️ POVINNÁ DEMO DATA (hard rule, DONE-blocker)

**Hlavní princip:** Z naskenovaného webu se zachovává **POUZE struktura, layout a vizuální styl**. Veškerý obsah (text, ceny, recenze, jména, fotky, loga, telefony, e-maily, adresy, IČO, partnerské značky, copy v patičce) MUSÍ být přepsán na demo. Pokud v `git diff` nebo na live `/demo/<slug>-demo` zůstane cokoli z originálu, šablona **NENÍ DONE** — vrať se a oprav.

**Platí pro CELOU šablonu — homepage I všechny podstránky** (services, gallery, contact, about, blog, blog detail, cenník, rezervace, FAQ, GDPR, obchodní podmínky, kariéra, …). Žádná podstránka nesmí zůstat s originálním obsahem nebo s nedotaženým layoutem. Defekty (rozházené gridy, velké mezery, nefunkční komponenty, překryvy, broken responsive) **profesionálně oprav** — vstup je inspirace, ne závazná pravda.

### 🚨 ZÁKAZ PŘEDĚLÁVÁNÍ DESIGNU (nejčastější chyba — peak-cut)
**Mění se POUZE obsah. Layout, hlavička, hero, šířka sekcí, počet sloupců v gridu, fonty, barvy, button styl = NESAHAT.**
- Ceník byl na full-width → zůstává full-width. NEZUŽUJ jej.
- Hlavička měla 5 položek a logo vlevo → zachovat 5 položek a logo vlevo. NEPŘEDĚLÁVEJ ji.
- Hero bylo full-bleed s overlay nadpisem → zůstává full-bleed s overlay. NEMĚŇ na split-screen.
- Pokud máš pochybnost, jestli něco měnit → **nesahej**. Jediný důvod ke změně layoutu je explicitní záznam v sekci "Defekty originálu k opravě" z FÁZE A.

### 🚨 ZÁKAZ MAZÁNÍ EXISTUJÍCÍHO FULL-PAGE-CLONE TENANTU
Pokud existuje fungující full-page-clone tenant (původní 1:1 mirror originálu, který slouží jako referenční vzhled v `/preview`), **NESMÍŠ ho smazat ani přepsat**, dokud:
1. nová engine šablona PROŠLA vizuálním diff testem (5e) proti tomuto clonu
2. uživatel ji explicitně schválil

Postup: nová šablona vzniká **vedle** clonu (nový adresář `src/templates/<slug>/`, nový tenant na `/demo/<slug>-demo`). Clone zůstává netknutý jako referenční verze. Teprve po PASS auditu se clone může smazat — a to jen na pokyn uživatele, ne autonomně.

**Pokud clone už neexistuje** (předchozí Sonnet ho omylem smazal): zjisti, jak byl vytvořen (`git log -- public/clones/<slug>/`, `git log -- src/templates/<slug>/`, mirror skripty v `template-lab/scripts/`), obnov ho z gitu (`git show <commit>:<path>`), a teprve pak pokračuj. Bez referenčního clone nelze vizuálně ověřit, že engine verze vypadá identicky.

**Implementuj VŠECHNY podstránky z FÁZE A — nejen homepage.** Pokud originál má 6 podstránek, musíš dodat 6 podstránek (každá s vlastní `template.json` route nebo v `pages` poli, vlastním obsahem v `content/cs.json`, demo daty, opravenými defekty). Cíl: **maximální využití toho, co originál nabízí** — když má originál sekci "Náš tým", "Před / Po", "Reference", "Akce", "Kariéra" — všechny musí být v šabloně. Pokud některou podstránku **záměrně vynecháš** (např. duplicitní, nedává smysl pro engine), v sekci 7 finálního auditu **vysvětli proč**. Bez vysvětlení = chybí podstránka = NENÍ DONE.

### Demo logo
- ❌ NESMÍŠ použít originální logo z naskenovaného webu.
- ✅ Vygeneruj **vlastní demo logo** jako SVG (inline NEBO `public/templates/<slug>/logo.svg`).
- Demo název ze sloupce "Demo název" v queue (např. "Demo Barber Studio"), nikoli reálný název firmy.
- Barvy = `primary` / `accent` z `theme.json`.

### Demo kontakty (jednotné, vždy stejné)
| Pole | Hodnota |
|------|---------|
| Email | `email@demo.cz` (`info@demo.cz`, `rezervace@demo.cz` volitelně) |
| Telefon | `704 123 456` (`+420 704 123 456`); druhé `704 654 321` |
| Adresa | `Ukázková 123, 110 00 Praha 1` |
| Web | `https://demo.cz` |
| Facebook | `https://facebook.com/demo` |
| Instagram | `https://instagram.com/demo` |
| IČO | `12345678` |
| DIČ | `CZ12345678` |
| Název firmy / s.r.o. | `Demo Studio s.r.o.` |
| Jednatel | `Jan Demo` |
| Provozní doba | `Po–Pá 9:00–18:00, So 9:00–14:00` |

### Demo ceník
- Zachovat strukturu (počet položek, řazení), **přepsat popisy vlastními slovy** a **posunout ceny o ±15–30 %** (zaokrouhleno na 50 Kč). Žádná cena nesmí být identická s originálem.

### Demo recenze + hodnocení
- Jména: `Jan Novák`, `Petra Svobodová`, `Tomáš Dvořák`, `Eva Procházková`, `Martin Černý`.
- Texty recenzí napiš sám (2–4 věty, tématické pro kategorii).
- Celkové hodnocení změň (např. `4.8★ z 127 recenzí`).

### Demo "O nás" text
- Přepiš celý odstavec — bez zmínek o reálné firmě, historii, osobách, lokacích.

### Demo partnerské značky / "spolupracujeme s"
- Pásky log reálných značek (Rézl, Jameson, Becherovka, Coca-Cola, kosmetika…) NAHRAĎ demo loga (`Demo Brand 1`, `Demo Brand 2` jako text SVG), nebo sekci vypusť.

### Demo pobočky (pokud má originál víc poboček)
- Pobočka 1: `Ukázková 123, 110 00 Praha 1`
- Pobočka 2: `Vzorová 456, 120 00 Praha 2`
- Pobočka 3: `Demonstrační 789, 130 00 Praha 3`
- Všechny telefony = `+420 704 123 456`, všechny e-maily = `info@demo.cz`.

### Demo obrázky / galerie
- Default: **jeden demo placeholder** s textem "Sem nahraj obrázek" + rozměr (např. `1200×800`).
- Rozházená galerie z originálu → **profesionálně oprav** (sjednocený grid, stejné aspect-ratio).
- Sekce "Kontaktujte nás" se 3 obrázky → **redukuj na 1** (nebo žádný).

### Demo patička (legal / GDPR blok)
- VŽDY: `Demo Studio s.r.o.`, IČO `12345678`, DIČ `CZ12345678`, adresa `Ukázková 123, 110 00 Praha 1`, telefon `+420 704 123 456`.
- ZAKÁZÁNO: jakékoli reálné s.r.o. názvy, IČO, jména jednatelů, adresy z originálního scrape.

---

# 🚫 KRITICKÁ PRAVIDLA FÁZE B
- Nepřeskakuj kroky.
- Neimprovizuj architekturu.
- Žádné isolated řešení, nový editor, nový page builder, nový image systém.
- Žádný generický vzhled.
- **Nezačínej psát kód, dokud nedokončíš sekci 0.**

---

## 0) NEJDŘÍV — povinný úvod (vypiš v odpovědi, doslova)

1. Potvrď, že jsi (nebo právě znovu) načetl: 7 standardů + queue + svou FÁZI A analýzu výše v tomto okně.
2. Zopakuj v 1 řádku: slug šablony, demo název, předchozí `DONE` šablona, na kterou navazuješ.
3. **Vypiš checklist bod po bodu** podle plánu implementace z FÁZE A (sekce 5). Ke každému bodu napiš:
   - "✅ splním + krátce jak"
   - jakou shared sekci / variantu použiju (Reuse / Extend / New)
4. Teprve **po vypsání celého checklistu** začni implementaci.

> ⚠️ Pokud tento úvod přeskočíš, uživatel implementaci zahodí. Není to volitelné.

## 1) Šablona MUSÍ používat (zero exception)
- shared template engine
- shared live editor (klikem editovatelné: text, button, image, ikona, social, hero, gallery, slider, CTA, navbar, footer, FAQ, formuláře, backgroundy)
- shared page builder (drag&drop, reorder, hide/show, duplicate, add/remove, layout, responsive)
- shared image pipeline (fyzický resize, WebP + JPG fallback, responsive variants, alt; **pouhé CSS resize je zakázáno**)
- shared SEO systém (title, meta, canonical, OG, Twitter, JSON-LD podle kategorie, sitemap, heading hierarchy)
- shared tenant architektura
- shared component API

## 2) Demo data — POVINNÉ ZA POCHODU
Při generování každého copy/asset bloku **rovnou** dosazuj demo hodnoty (tabulka výše).
Neukládej ani dočasně reálné kontakty / logo — jinak je pak najdeš v gitu / cache.

- Logo: vygeneruj SVG s demo názvem (z queue) v barvách `theme.json`.
- Email/tel/adresa/sítě/web: jen demo hodnoty.
- Název firmy v hero / footer / about / title / OG: jen demo název.
- Texty: pokud kopíruješ copy z originálu, projdi a nahraď všechny zmínky reálné značky a všechny reálné domény.

## 3) Vizuální identita — zachovat
- typography personality
- spacing personality
- branding feeling, button styl, atmosféra
- unikátní vzhled (nesmí splynout s ostatními šablonami)

## 4) Validace po implementaci (povinná — vykaž výstupy)
- `pnpm build` — musí projít (vykaž tail logu)
- `pnpm typecheck` (resp. `tsc --noEmit`) — 0 chyb
- Otevři šablonu na `/preview-2` — karta se objevila, klik otevírá demo
- Editor: klikni na nadpis, text, obrázek, button → otevře editaci → save → reload → změna zůstala
- Upload + crop + resize obrázku → funguje
- WebP existuje vedle JPG fallback (`ls public/templates/<slug>/images/`)
- Mobile 375 + tablet 768 + desktop 1440 — bez vizuálních breakage
- SEO meta v `<head>` view-source: title, description, canonical, OG, Twitter, JSON-LD
- Lighthouse: cíl 100/100 (min 90 perf / 95 SEO / 95 a11y) — vykaž čísla

## 5) DEMO DATA — povinný audit shody (DONE-blocker, není volitelný)

**Důležité:** Předchozí šablona (peak-cut) prošla auditem, protože jsme jen kontrolovali, že demo hodnoty JSOU PŘÍTOMNÉ — ale originální data tam zůstala vedle nich. **Tato chyba se nesmí opakovat.** Audit musí prokázat, že originál FYZICKY ZMIZEL.

### 5a) Negative grep — originál NESMÍ existovat ve šabloně
Z analýzy FÁZE A si vypiš **konkrétní hodnoty z originálu** (název firmy, doména, IČO, jména poboček, reálné telefony, reálné e-maily, reálná jména v recenzích, reálné značky partnerů). Pak spusť pro každou:
```bash
grep -ri '<originální-hodnota>' src/templates/<slug>/ public/templates/<slug>/
```
Každý jeden grep MUSÍ vrátit prázdný výstup. Vykaž v odpovědi seznam testovaných hodnot a výsledek.

### 5b) Generic guards — žádné cizí kontakty
```bash
grep -rE '@[a-z0-9.-]+\.(cz|com|sk|eu)' src/templates/<slug>/ public/templates/<slug>/ | grep -v 'demo.cz' | grep -v README
grep -rE '\+?420 ?[0-9]{3} ?[0-9]{3} ?[0-9]{3}' src/templates/<slug>/ public/templates/<slug>/ | grep -vE '704 ?123 ?456|704 ?654 ?321'
grep -rE 'IČO[: ]*[0-9]{8}' src/templates/<slug>/ public/templates/<slug>/ | grep -v '12345678' | grep -v README
```
Všechny MUSÍ vrátit prázdný výstup.

### 5c) Live test proti originálnímu scrape (rendered HTML)
1. Spusť `curl -s http://localhost:3015/demo/<slug>-demo > /tmp/<slug>-rendered.html`.
2. Identifikuj zdrojový mirror (`public/clones/<slug>/index.html` nebo `template-lab/research/<slug>/`).
3. Pro každou kategorii projdi rendered output a ověř, že žádná z těchto věcí NENÍ v rendered HTML:
   - originální název firmy
   - originální doména (`grep -E '<orig-domain>' /tmp/<slug>-rendered.html`)
   - reálné telefony (jakýkoli `+420` jiný než `704 123 456` / `704 654 321`)
   - reálné e-maily (cokoli mimo `*@demo.cz`)
   - jména poboček z originálu
   - názvy partnerských značek z originálu
   - jména osob z originálních recenzí
   - reálné IČO/DIČ
4. Vykaž v odpovědi výpis kontrol s ✅ / ❌ ke každé položce.

### 5d) Cena-diff (jen pokud má šablona ceník)
- Vypiš v odpovědi mapování `originál → demo` pro **každou** cenu (např. `850 → 650`, `1300 → 1100`).
- Ověř, že žádná demo cena se nerovná originální (`diff` čísel).

### 5e) Vizuální parity-check (side-by-side proti clone)
Po PASS bodů 5a–5d otevři **vedle sebe** live `/demo/<slug>-demo` (engine verze) a originální clone v `/preview` (full-page-clone tenant). Pořiď screenshot obou na desktop (1440 px) a mobile (375 px). Pro každou sekci ověř:
- hlavička: stejný počet položek, stejná pozice loga, stejný styl ✅
- hero: stejný typ (full-bleed / split / video), stejná pozice CTA, stejná výška ✅
- ceník: stejná šířka kontejneru, stejný počet sloupců, stejný styl řádků ✅
- gallery: stejný grid (počet sloupců, aspect-ratio) ✅
- footer: stejný layout (počet sloupců, pozice logo/menu/social) ✅
- typografie: stejné fonty, váhy, velikosti ✅
- barvy: stejné HEX (primary, accent, background) ✅
- spacing: stejný rytmus, žádné nové mezery ani zhuštění ✅

A obsahová pravidla:
- veškerý text = NOVÝ (žádné identické věty s originálem) ✅
- loga partnerů = demo / vypuštěné ✅
- galerie sjednocená (jen pokud byla v originále rozházená) ✅
- patička = demo s.r.o., demo IČO, demo telefon ✅

**Pravidlo:** Pokud screenshoty NEJSOU vizuálně téměř identické (až na obsah a opravené defekty), nepřepracovávej engine šablonu — místo toho zjisti, kterou sdílenou variantu/skin musíš rozšířit (`Extend`), aby výsledek odpovídal originálu. Vlož tu změnu do shared sekce, ne do generického přepisu šablony.

**Pokud kterýkoli z bodů 5a–5e vrátí byť 1 originální hodnotu → NENÍ DONE → fix → spusť celou sekci 5 znovu.**

## 6) Aktualizace fronty
Po PASS bodů 4 + 5:
- V `docs/MASTER_TEMPLATE_QUEUE.md` přepiš řádek šablony: `TODO → DONE`, doplň dnešní datum (ISO).
- Ověř, že šablona je viditelná na `http://localhost:3015/preview-2`.

## 7) Finální audit (vypiš v odpovědi)
Projdi své změny proti:
- TEMPLATE_STANDARD.md
- LIVE_EDITOR_STANDARD.md
- PAGE_BUILDER_STANDARD.md
- IMAGE_PIPELINE_STANDARD.md
- SEO_PERFORMANCE_CHECKLIST.md

Vypiš:
1. **Co je splněno** (bullet list)
2. **Co není splněno** (a proč)
3. **Co bylo zjednodušeno** (pokud něco)
4. **Kde může vzniknout problém při scale** (89 dalších šablon)
5. **Co doporučuješ zlepšit** ve sdílených standardech

---

## ✅ Šablona je DONE pouze pokud
- Úvodní checklist (sekce 0) vypsán
- Build + typecheck PASS
- Editor funguje (klikem editovatelné prvky)
- Image pipeline PASS (WebP + JPG + responsive + alt)
- Mobile + tablet + desktop PASS
- SEO bloky existují
- Lighthouse ≥ 90/95/95
- **Všechny podstránky z FÁZE A implementované** (homepage + každá podstránka funkční na live, s vlastním obsahem a demo daty)
- **Defekty originálu opravené** napříč homepage i podstránkami (rozházené gridy, mezery, nefunkční komponenty, broken responsive)
- **`/studio` plně funkční pro OBA tenanty (engine i clone)** podle `docs/LIVE_EDITOR_STANDARD.md` sekce 1.1: StudioCanvas mode json+clone, iframe s viewportní šířkou pro clone, LayersPanel sub-vrstvy z DOM, postMessage bridge, in-place edit + save funguje, mobile/tablet/desktop preset přepíná viewport. Bez funkčního studia na clone tenantu = NENÍ DONE.
- Demo logo + demo kontakty PASS (audit 5a–5e všechny ✅, 0 originálních hodnot)
- Ceník: každá cena posunutá ±15–30 %, žádná cena identická s originálem
- Recenze: demo jména, demo texty, demo celkové hodnocení
- Patička: `Demo Studio s.r.o.`, IČO `12345678`, demo telefon
- Pobočky: všechny adresy z demo seznamu (Ukázková / Vzorová / Demonstrační)
- Galerie sjednocená, "kontaktujte nás" má max 1 obrázek
- Partnerské značky: demo nebo vypuštěné
- Queue aktualizovaná
- Karta viditelná na `/preview-2`
- Finální audit vypsaný

**Bez všech bodů: NENÍ DONE — pokračuj v opravách.**
