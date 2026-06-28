# FÁZE C — SECTION-BY-SECTION IMPLEMENTACE (nahrazuje monolitickou FÁZI B)

**Datum:** 2026-05-27
**Použití:** Tento prompt nahrazuje `docs/FAZE_B_PROMPT.md`. Sonnet už má hotový audit ve `template-lab/audits/<original-slug>.md` (z FÁZE A) + skeleton kategorie (`docs/SKELETONS.md`).
Uživatel řekne: *"Vypracuj práci podle docs/FAZE_C_PROMPT.md"*.

---

## 🔧 SPOLEČNÝ KONTEXT

PROJEKT: Venom / Webero (SaaS s 100+ profesionálními šablonami)
ROOT: `/Users/apple/DEV/CRM/venom`
DEV: `http://localhost:3015` (LOCALHOST ONLY — data jsou na desktopu, ne na Vercelu)

**Fronta:** [docs/MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md) — první `TODO` je tvoje šablona.
**Audit této šablony:** `template-lab/audits/<original-slug>.md` (vyplněný ve FÁZI A).
**Skeleton:** `docs/SKELETONS.md` — kategorie šablony určuje **závazné pořadí sekcí**.
**Workflow:** `docs/SECTION_WORKFLOW.md` — 6 mikro-fází per sekci, **závazné**.

---

## 🚨 SLUG NAMESPACE — separace clone vs engine

**Clone tenant** (originální 1:1 mirror v `/preview`):
- Slug v DB: `<original-slug>-demo` (např. `the-barber-demo`)
- Renderuje se v `/preview` (hardcoded TEMPLATES array) → `/demo/<original-slug>-demo`
- **NIKDY nesahej do clone tenantu.** Pre-commit hook ti to zablokuje.

**Engine tenant** (tvoje nová verze na master engine):
- Slug v DB: `<engine-slug>-v2` (např. `barber-02-v2`)
- Engine slug = generický `<kategorie>-NN` (audit ti řekl jaký), **nikoli odvozený z originálu**
- Renderuje se v `/preview-2` (auto-discovery) → `/demo/<engine-slug>-v2`

**Tvoje práce probíhá výhradně v:**
- `src/templates/<engine-slug>/` (engine šablona)
- `public/templates/<engine-slug>/` (engine assets)
- `template-lab/audits/<original-slug>/section-<i>/` (per-section screenshoty + diff)
- `src/sections/`, `src/components/studio/` (shared engine — jen EXTEND, ne breaking)

**ABSOLUTNÍ ZÁKAZ:**
- ❌ Měnit `src/app/preview/**`
- ❌ Měnit `public/clones/<slug>/**`
- ❌ Použít engine slug shodný s originálním slugem (žádný `the-barber-v2`, místo toho `barber-02-v2`)
- ❌ Použít sufix `-demo` pro engine tenant
- ❌ Stavět víc sekcí naráz — striktně **jedna sekce, 6 mikro-fází, další**

---

## 0) Úvodní checklist (vypiš v odpovědi, doslova)

1. Potvrď, že jsi načetl:
   - `docs/SKELETONS.md` (skeleton pro tuto kategorii)
   - `docs/SECTION_WORKFLOW.md` (6 mikro-fází)
   - `template-lab/audits/<original-slug>.md` (svůj audit z FÁZE A)
   - poslední DONE šablonu ze stejné kategorie (kontinuita variant)

2. V 1 řádku vypiš:
   - Original slug: `___`
   - Engine slug: `___-NN` (např. `barber-02`)
   - Engine tenant slug: `___-NN-v2`
   - Kategorie: `___`
   - Skeleton (z SKELETONS.md): `___` (např. `service-personal`)
   - Demo název (z audit souboru — vymyšlený, ne odvozený z originálu): `___`

3. Vypiš plán sekcí (skeleton kategorie filtrovaný originálem):
   ```
   Sekce 1  Header              BUILD
   Sekce 2  Hero                BUILD
   Sekce 3  About               BUILD
   Sekce 4  Services            BUILD
   Sekce 5  Pricing             SKIP (originál nemá ceník)
   Sekce 6  Gallery             BUILD
   Sekce 7  Team                SKIP (originál nemá tým)
   Sekce 8  Testimonials        BUILD
   Sekce 9  Booking / CTA       BUILD
   Sekce 10 Locations           BUILD
   Sekce 11 FAQ                 BUILD
   Sekce 12 Footer              BUILD
   ```
   SKIP sekce zaznamenej do `template.json:skippedSections[]` s důvodem.

4. **Teprve teď zacni sekci 1 (Header).** NIKDY nezačínej dřív, než je checklist vypsaný.

---

## 1) Pro každou sekci — 6 mikro-fází (`docs/SECTION_WORKFLOW.md`)

Striktně po jedné. Po sekci `i`:

### [1] BUILD
- Otevři audit, sekce `i`. Zjisti: layout, font/barvy, demo data, defekty originálu k opravě.
- V `src/sections/registry.ts` najdi shared variant (Reuse > Extend > New).
- Doplň content do `src/templates/<engine-slug>/content/cs.json` (demo data!).
- Přidej sekci do `src/templates/<engine-slug>/template.json:sections[]` na pozici dle skeletonu.

### [2] VISUAL DIFF + MOBILE AUDIT
```bash
pnpm snap:clone <original-slug>            # jen poprvé pro celý web
pnpm snap:engine <engine-slug> <i>          # engine sekce i v 1440 + 375
pnpm diff:section <original-slug> <engine-slug> <i>
```
PASS = layout ≥ 95%, font exact, color HEX exact, výška ±10%. FAIL → BUILD znovu (max 3 iterace).

**POVINNÝ MOBILE AUDIT per sekce (375 px snapshot):**
Po každém snapshoту otevři `/tmp/snaps/<engine-slug>-v2/section-<i>-375.png` a zkontroluj:
- ❌ Žádné velké prázdné mezery (padding/gap > 40 px navíc oproti desktopu)
- ❌ Žádný přetékající text nebo element mimo viewport
- ❌ Žádné příliš malé touch targety (min 44 px výška pro tlačítka / linky)
- ❌ Žádný zlomený grid (sloupce nejsou stack nebo jsou špatně zarovnané)
- ❌ Žádné obrázky s deformovaným aspect-ratio
- ✅ Fonty čitelné (heading ≥ 24 px, body ≥ 14 px na 375)
- ✅ Sekce vypadá pixel-perfect — profesionálně, luxusně, „jako z Wixu"

Pokud cokoliv z výše selže → **NEPOKRAČUJ na sekci i+1**. Oprav a re-snap.
Pokud si nejsi jistý, zda je mobilní verze dostatečně profesionální → **zastav a hlas uživateli** se screenshotem.

### [3] DEMO AUDIT
- `curl -s http://localhost:3015/demo/<engine-slug>-v2 > /tmp/<engine-slug>-v2.html`
- Pro každou originální hodnotu z audit souboru: `grep -F` v `/tmp/<engine-slug>-v2.html` → **0 výsledků**
- Pozitivní: `704 123 456` ≥ 1 výskyt, `@demo.cz` ≥ 1 výskyt

### [4] STUDIO TEST
```bash
pnpm test:studio <engine-slug> <i>
```
7 kroků: text edit, image edit, CTA edit, duplicate, delete, hide/show, reorder, viewport switch (375/768/1440). PASS = všech 7 zelená.

### [5] PARITY GATE
- Pro sekci 1 (Header) a sekci N (Footer): **vždy hlas uživateli** ("Sekce X hotová, OK?").
- Pro mezi-sekce v autonomním režimu: pokračuj automaticky pokud diff+studio PASS.
- Při FAIL diff/studio: **vždy zastav a hlas uživateli**, neopravuj naslepo.

### [6] COMMIT
```bash
git add src/templates/<engine-slug>/ public/templates/<engine-slug>/ \
        template-lab/audits/<original-slug>/section-<i>/
git commit -m "feat(<engine-slug>): section <i> <name> — parity+editor PASS"
```

**Pak posun na sekci `i+1`. Žádné výjimky.**

---

## 2) Demo data — POVINNÉ od první iterace [1] BUILD

Nikdy se nedělá "nejdřív zkopíruju originál, pak nahradím" — to vede k reálným hodnotám v gitu/cache.

| Pole | Demo hodnota |
|------|--------------|
| Email | `email@demo.cz`, `info@demo.cz`, `rezervace@demo.cz` |
| Telefon | `704 123 456` (`+420 704 123 456`); druhé `704 654 321` |
| Adresa | `Ukázková 123, 110 00 Praha 1` (resp. `Vzorová 456, 120 00 Praha 2`, `Demonstrační 789, 130 00 Praha 3`) |
| Web | `https://demo.cz` |
| Facebook | `https://facebook.com/demo` |
| Instagram | `https://instagram.com/demo` |
| IČO | `12345678` |
| DIČ | `CZ12345678` |
| s.r.o. | `Demo Studio s.r.o.` (nebo `Demo název z audit souboru`) |
| Jednatel | `Jan Demo` |
| Provozní doba | `Po–Pá 9:00–18:00, So 9:00–14:00` |
| Recenze (jména) | `Jan Novák`, `Petra Svobodová`, `Tomáš Dvořák`, `Eva Procházková`, `Martin Černý` |
| Ceník | každá cena ±15–30 % oproti originálu, zaokrouhleno na 50 Kč |
| Logo | vlastní demo SVG v `public/templates/<engine-slug>/logo.svg`, používá `Demo název` |
| Partnerské značky | demo SVG (`Demo Brand 1`, `Demo Brand 2`) nebo vypustit |
| Obrázky | demo placeholder s rozměrem (např. `1200×800` "Sem nahraj obrázek") |

---

## 3) Vizuální identita — zachovat (NESAHAT)

Co kopíruješ z originálu (přes skeleton + diff testy):
- typografie (font-family, váhy, velikosti, letter-spacing) — exact match
- barvy (primary, secondary, accent — HEX exact)
- button styl (radius, padding, shadow, hover)
- spacing personality (rytmus mezi sekcemi)
- branding feeling, atmosféra

Co naopak **MĚNÍŠ pouze v případě defektu zaznamenaného v audit souboru** v sekci "Defekty originálu k opravě":
- rozházené gridy → sjednocený grid (stejná aspect-ratio)
- velké prázdné mezery → sjednocený `--section-gap`
- 3 obrázky v kontaktech → 1 obrázek + form
- broken responsive → fix
- nefunkční slider/akordeon → shared variant

**Pravidlo palce:** Pokud bys musel udělat změnu, která **není** v "Defektech originálu k opravě", **NEDĚLEJ TO**. Místo toho hlas uživateli a navrhni doplnění auditu.

---

## 4) Final validation (po dokončení všech sekcí ze skeletonu)

```bash
pnpm validate:template <engine-slug>   # skeleton compliance + editable + content keys
pnpm build                              # TypeScript + Next.js build
pnpm typecheck                          # tsc --noEmit
```

### 4a) FULL MOBILE AUDIT (POVINNÝ — DONE-blocker)

Před grep auditem proveď celkový mobile průchod celého webu na 375 px:

```bash
pnpm snap:engine <engine-slug> full    # fullpage snapshot celého webu v 375 + 768 + 1440
```

Otevři mobilní snapshot a projdi **každou sekci shora dolů**. Kontrolní seznam:

| # | Co kontroluješ | Kritérium |
|---|---|---|
| 1 | Mezery mezi sekcemi | Konzistentní rytmus, žádná sekce nefloatuje ve vzduchu |
| 2 | Hero sekce | Text čitelný, CTA tlačítko celou šířku nebo centrované |
| 3 | Navigace (header) | Hamburger/drawer funguje, logo viditelné, výška ≤ 64 px |
| 4 | Gridy a karty | Stack na 1 sloupec nebo max 2, žádné přetékání |
| 5 | Obrázky | Správný aspect-ratio, žádné rozmazané/deformované |
| 6 | Texty | Heading ≥ 24 px, body ≥ 14 px, žádný overflow |
| 7 | Tlačítka / CTA | Min výška 44 px, padding ≥ 12 px vlevo/vpravo |
| 8 | Galerie / slider | Swipeable nebo stack, žádné rozlité elementy |
| 9 | Kontaktní formulář | Pole celou šířku, submit button viditelný |
| 10 | Footer | Přehledný, kontakty čitelné, copyright viditelný |

**Celkový dojem:** Mobilní verze musí vypadat **pixel-perfect, profesionálně a luxusně** — jako by ji navrhoval senior UX designer. Pokud toto kritérium nesplňuje → oprav a re-snap před pokračováním.

Pak v rendered HTML:
```bash
curl -s http://localhost:3015/demo/<engine-slug>-v2 > /tmp/<engine-slug>-final.html

# Negative grep — originál NESMÍ být v rendered HTML
grep -F '<orig-domena.cz>'      /tmp/<engine-slug>-final.html  # 0 výsledků
grep -F '<orig-telefon>'         /tmp/<engine-slug>-final.html  # 0 výsledků
grep -F '<orig-brand>'           /tmp/<engine-slug>-final.html  # 0 výsledků
grep -F '<orig-ico>'             /tmp/<engine-slug>-final.html  # 0 výsledků

# Generic guards
grep -rE '@[a-z0-9.-]+\.(cz|com|sk|eu)' src/templates/<engine-slug>/ public/templates/<engine-slug>/ \
  | grep -v 'demo.cz' | grep -v README                               # 0 výsledků
grep -rE '\+?420 ?[0-9]{3} ?[0-9]{3} ?[0-9]{3}' src/templates/<engine-slug>/ public/templates/<engine-slug>/ \
  | grep -vE '704 ?123 ?456|704 ?654 ?321'                            # 0 výsledků
```

Vše musí být 0. Jinak NENÍ DONE.

---

## 5) Aktualizace fronty

Po PASS všech sekcí + validátoru + grep auditu:
- V `docs/MASTER_TEMPLATE_QUEUE.md`: řádek originálu `TODO → DONE`, datum (ISO), do sloupce poznámky doplň engine slug.
- Ověř, že engine šablona je viditelná na `http://localhost:3015/preview-2` (karta s diff parity badge).
- Ověř, že `/demo/<original-slug>-demo` (clone) **stále funguje a vypadá stejně** jako před prací (sanity check, že jsi nesáhl do clone tenantu).

## 5b) POVINNĚ — seed showcase child tenant (DONE-blocker)

**Každá nová DONE šablona MUSÍ mít showcase child tenant.** Showcase = druhý tenant
viditelný v `/preview-2` jako tab "Ukázková" vedle Core verze. Slouží jako vyplněná
demo verze pro ukázku klientům — uživatel ji manuálně vyplní obrázky/texty přes Studio.

```bash
# Po dokončení sekce 8 Footer + final validation:
pnpm seed:showcase <engine-slug>
# Příklad: pnpm seed:showcase barber-04

# Ověř, že tab "Ukázková" se objevil v /preview-2 u karty této šablony.
curl -s http://localhost:3015/preview-2 | grep -F "<engine-slug>-showcase"
# Musí vrátit ≥1 výsledek.
```

Showcase tenant:
- Slug: `<engine-slug>-showcase` (např. `barber-04-showcase`)
- parent_tenant_id = master tenant id; showcase_kind = `"filled"`
- Sync master → showcase: `pnpm sync:showcase <engine-slug>`
- Uživatel uploaduje vlastní obrázky přes Studio (`/demo/<engine-slug>-showcase/admin`)
- Strukturální změny v master Studio se NEpropagují automaticky — volá se manuálně sync

**Bez showcase = šablona NENÍ DONE.** Žádné výjimky.

---

## 6) Finální výstup (vypiš uživateli)

```
✅ Šablona <engine-slug> (z originálu <original-slug>) DONE

Sekce (skeleton: <skeleton>):
  1. Header        ✅ diff 98%, studio 7/7
  2. Hero          ✅ diff 96%, studio 7/7
  3. About         ✅ diff 97%, studio 7/7
  4. Services      ✅ diff 95%, studio 7/7
  5. Pricing       — SKIP (originál nemá ceník)
  6. Gallery       ✅ diff 99%, studio 7/7
  ...

Validátor: PASS
Build: PASS
Demo audit: 0 originálních hodnot
Mobile audit: PASS (375 px — všech 10 bodů ✅)
Clone tenant <original-slug>-demo: nezměněn ✅

Engine URL:    http://localhost:3015/demo/<engine-slug>-v2
Clone URL:     http://localhost:3015/demo/<original-slug>-demo (reference, READ-ONLY)
Studio URL:    http://localhost:3015/demo/<engine-slug>-v2/studio
```

---

## ⛔ Kritická připomínka

- Nepředělávej design — kopíruj 1:1 layout, dělej demo data.
- Jedna sekce v jedné iteraci. Žádné monolitické "vyplním vše a otestuju".
- Engine slug = `<kategorie>-NN`, NIKDY shodný s originálem.
- Engine tenant = `<slug>-v2`, NIKDY `-demo`.
- `/preview` a `public/clones/` jsou READ-ONLY. Pre-commit hook to vynucuje.
- Při FAIL diff/studio max 3 iterace, pak hlas uživateli — neimprovizuj.
