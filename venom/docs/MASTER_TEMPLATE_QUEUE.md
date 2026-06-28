# MASTER TEMPLATE QUEUE — Fronta převodu šablon na MASTER ENGINE

**Datum:** 2026-05-25
**Zdroj fronty (vstup):** [http://localhost:3015/preview](http://localhost:3015/preview) → [src/app/preview/page.tsx](../src/app/preview/page.tsx)
**Cíl převodu (výstup):** [http://localhost:3015/preview-2](http://localhost:3015/preview-2) → [src/templates/&lt;slug&gt;/](../src/templates/) (auto-discovery podle `template.json`)
**Celkem šablon ve frontě:** 91
**Hotovo (převedeno na MASTER ENGINE):** 37 (`barber-01`–`barber-04`, `peak-cut`, `hair-01`–`hair-04`, `nails-01`–`nails-03`, `beauty-01`, `massage-01`, `cafe-01`–`cafe-04`, `restaurant-01`–`restaurant-03`, `fitness-01`–`fitness-02`, `fyzio-01`–`fyzio-02`, `clinic-02`–`clinic-03`, `tattoo-01`–`tattoo-03`, `ananda-01`, `bakery-01`, `tawan-01`–`tawan-02`, `reality-01`–`reality-03`)
**Zbývá:** 54
**⚡ DALŠÍ V POŘADÍ:** `hybernska` → slug `restaurant-02`
**Rolled back (2026-05-27):** `the-barber`, `fade-room` — engine verze nesplňovaly 1:1 parity s `/preview`; clone tenanty (`the-barber-demo`, `fade-room-demo`) navíc mají vymazanou `full-page-clone` sekci → vyžadují recovery přes `scripts/recover-clone-tenant.mjs`.
**Druhý průchod (2026-05-28):** `the-barber` → engine `barber-02` (Holičství Atelier) DONE; `fade-room` → engine `barber-03` (Studio Břitva) DONE — section-by-section per FÁZE C.

> **Tok:** `/preview` (91 legacy scrapů) → FÁZE A + B → `src/templates/<slug>/` → automaticky se objeví v `/preview-2`.
> Šablona je `DONE` teprve když je viditelná v `/preview-2` a všechny grep audity prošly.

> Tento soubor je **jediný zdroj pravdy** o tom, která šablona je další v pořadí.
> Sonnet ho čte ve FÁZI A (analýza) i ve FÁZI B (implementace).
> Po dokončení šablony se zde aktualizuje status `TODO → DONE` a doplní datum.
> Pořadí převodu = pořadí v tabulce (id 1 → 91). Vždy se bere první `TODO` v pořadí.

> ⛔ **KRITICKÉ PRAVIDLO — POŘADÍ ŠABLON:**
> Při výběru "další šablony" VŽDY čti tuto tabulku a vezmi **první řádek se `TODO`**.
> NIKDY nevybírej šablonu z `template-lab/_STATE.md` (ten sleduje jiný stav).
> NIKDY nevybírej šablonu podle abecedního pořadí složek v `/public/clones/`.
> Pokud šablona ze skupiny (např. Kadeřnictví) dostala slug `hair-01`, další ze STEJNÉ skupiny dostane `hair-02` — ne nový slug.
> Nový slug přichází jen když jde o NOVOU kategorii (první šablona z dané skupiny).

---

## ⚠️ POVINNÁ PRAVIDLA PRO KAŽDOU PŘEVÁDĚNOU ŠABLONU

Tato pravidla jsou závazná pro všech 7 standardů (TEMPLATE_STANDARD.md,
LIVE_EDITOR_STANDARD.md, PAGE_BUILDER_STANDARD.md, COMPONENT_ARCHITECTURE.md,
IMAGE_PIPELINE_STANDARD.md, TENANT_DEPLOYMENT_FLOW.md, SEO_PERFORMANCE_CHECKLIST.md).

### 1. DEMO LOGO — POVINNÉ
- ❌ NESMÍ zůstat originální logo z naskenovaného webu.
- ✅ Sonnet **vytvoří demo logo** (SVG inline nebo PNG v `public/templates/<slug>/logo.svg`).
- Logo musí používat:
  - **demo název** (nikoliv reálný název firmy — viz `name:` v `src/app/preview/page.tsx`,
    např. "Demo Barber Studio", nikoliv "Barber Praha")
  - **theme tokens** šablony (primary / accent z `theme.json`)
  - jednoduchý wordmark + volitelně ikona (žádné kradené grafiky)

### 2. DEMO KONTAKTY — POVINNÉ
Sonnet **NESMÍ ponechat** reálné kontakty z naskenovaného webu
(typicky zůstávají `info@barberpraha.cz`, `+420 777 123 456` z originálu).
Musí je nahradit jednotnými **demo** hodnotami:

| Pole | Demo hodnota | Poznámka |
|------|--------------|----------|
| Email (hlavní) | `email@demo.cz` | jednotně všude |
| Email (info) | `info@demo.cz` | volitelná druhá adresa |
| Email (booking) | `rezervace@demo.cz` | jen pokud šablona má rezervace |
| Telefon | `704 123 456` | mezinárodní forma: `+420 704 123 456` |
| Telefon 2 (volitelný) | `704 654 321` | jen pokud originál má 2 čísla |
| Adresa (ulice) | `Ukázková 123` | |
| Adresa (město + PSČ) | `110 00 Praha 1` | |
| Web (footer/canonical) | `https://demo.cz` | |
| Facebook | `https://facebook.com/demo` | |
| Instagram | `https://instagram.com/demo` | |
| IČO | `12345678` | |
| Provozní doba | `Po–Pá 9:00–18:00, So 9:00–14:00` | |

### 3. KONTROLA PŘED `DONE`

#### 3a. VALIDÁTOR — POVINNÁ BRÁNA (DONE-blocker)
Před grep auditem **MUSÍ** šablona projít validátorem:

```bash
pnpm validate:template <slug>
# nebo:
node scripts/validate-template.mjs <slug>
```

Exit code **0** = OK; **1** = FAIL. Validátor kontroluje:
- každý `type` v manifestu existuje v `SECTION_RENDERERS` (`src/sections/registry.ts`),
- každý pár `(type, variant)` existuje v `SECTION_VARIANTS` (`src/sections/variants.ts`) — jinak studio variantu nedokáže přidat/přepnout,
- každý `contentRef` resolvuje v `content/cs.json`,
- povinné a doporučené content klíče sekcí (např. `navbar.logoUrl`, `gallery.images[].url`),
- industry vs variant prefix (`barber-*` jen pro `industry: barber` atd.).

**Pokud validátor selže (exit 1), šablona NENÍ `DONE`.** Žádné výjimky.
Pokud potřebuješ nový variant nebo nový section type — nejdřív ho přidej do
`variants.ts` / `registry.ts` (shared engine), pak teprve do template manifestu.

#### 3b. GREP AUDIT (kontakty / brand)
Po průchodu validátorem musí proběhnout **grep audit**:
- `grep -r '@<originální-doména>' src/templates/<slug>/` → musí vrátit **0 výsledků**
- `grep -rE '\+?420 ?[0-9]{3} ?[0-9]{3} ?[0-9]{3}' src/templates/<slug>/` → musí obsahovat **POUZE** `704 123 456` (případně `704 654 321`)
- `grep -r '<originální-název-firmy>' src/templates/<slug>/` → musí vrátit **0 výsledků** (vyjma reference v `README.md` v sekci "Zdrojový web")

Pokud je v grep auditu nalezen jakýkoliv reálný kontakt → šablona **NENÍ** `DONE`.

### 3c. SHOWCASE CHILD — POVINNÁ BRÁNA (DONE-blocker)
Po průchodu validátorem + grep auditem **MUSÍ** být vytvořen showcase child tenant:

```bash
pnpm seed:showcase <engine-slug>
# Pokud master master má slug `<engine-slug>-v2`, showcase se vytvoří jako
# `<engine-slug>-showcase` (parent_tenant_id = master.id, showcase_kind="filled").
```

Showcase se objeví v `/preview-2` jako **tab "Ukázková"** vedle Core verze (master).
Slouží jako prostor pro vyplněnou verzi šablony s reálnými demo obrázky/texty —
**uživatel ji manuálně vyplní přes Studio**, NIKDY Sonnet automaticky.

Strukturální změny master → showcase: `pnpm sync:showcase <engine-slug>` (manuální).
Content overrides v showcase se zachovají (detekce přes `last_master_baseline` snapshot).

**Pokud showcase tenant neexistuje, šablona NENÍ `DONE`.** Žádné výjimky.

### 4. KONTINUITA — NAVAZOVÁNÍ NA PŘEDCHOZÍ ŠABLONU
- Sonnet vždy čte **stav předchozí dokončené šablony** (poslední `DONE` v tabulce níže) a její `README.md` v `src/templates/<predchozi-slug>/`.
- Reuse: pokud předchozí šablona zavedla novou variantu sdílené sekce (např. `hero:cafe-wave`), nová šablona ji **smí použít**, ne kopírovat.
- Pokud nová šablona potřebuje rozšířit shared engine → změna jde do shared kódu, ne do template-only kódu.

---

## FRONTA ŠABLON (91)

Pořadí = pořadí kartiček na [/preview](http://localhost:3015/preview).
Při výběru další šablony pro FÁZI A: vezmi **první `TODO`** v tabulce.

| # | Slug (demo) | Demo název | Originál (origin) | Kategorie | Status | Datum DONE |
|---|-------------|------------|-------------------|-----------|--------|------------|
| 1 | peak-cut | Peak Cut | barbershop-buddy.cz | Barbershop | **DONE** | 2026-05-26 |
| 2 | the-barber | The Barber | thebarber.cz | Barbershop | **DONE** (barber-02 Holičství Atelier) | 2026-05-29 |
| 3 | fade-room | Barber Urban | barbershopurban.cz | Barbershop | **DONE** (barber-03 Studio Břitva) | 2026-05-28 |
| 4 | barber-praha | Barber Praha | barberpraha.online | Barbershop | **DONE** (barber-04 Černý Fade) | 2026-05-29 |
| 5 | studio-jarka | Studio Jarka | studio-jarka.cz | Kadeřnictví | **DONE** (hair-01 Salon Aria) | 2026-05-29 |
| 6 | hairsalon-no1 | Hair Studio No.1 | hairsalon-no1.cz | Kadeřnictví | **DONE** (hair-02 Demo Hair Salon) | 2026-05-30 |
| 7 | petramechurova | Petra Studio | petramechurova.cz | Kadeřnictví | **DONE** (hair-03 Petra Studio) | 2026-05-30 |
| 8 | selfbeauty | Demo Beauty Studio | selfbeauty.cz | Beauty & Wellness | **DONE** (beauty-01 Demo Beauty Studio) | 2026-05-30 |
| 9 | praha-masaze | Demo Masáže | praha-masaze.cz | Masáže & Wellness | **DONE** (massage-01 Demo Masáže Praha) | 2026-06-01 |
| 10 | ananda | Demo Ananda SPA | anandaspa.cz | Ayurvéda & Wellness | **DONE** (ananda-01 Demo Ananda SPA) | 2026-06-01 |
| 11 | tawan | Demo TAWAN Masáže | tawan.cz | Thajské masáže | **DONE** (tawan-01 Demo TAWAN Masáže) | 2026-06-01 |
| 12 | escape | Demo Escape Massage | escapemassage.cz | Thajské masáže | **DONE** (tawan-02 Demo Escape Massage) | 2026-06-02 |
| 13 | tribo | Demo TRIBO Studio | tribo.cz | Tetování & Piercing | **DONE** (tattoo-01 Demo TRIBO Studio) | 2026-06-02 |
| 14 | homie | Demo Homie Tattoo | homietattoo.cz | Tetování & Piercing | **DONE** (tattoo-02 Demo Homie Tattoo) | 2026-06-02 |
| 15 | magic | Demo Magic Tattoo | magic.cz | Tetování & Piercing | **DONE** (tattoo-03 Demo Magic Tattoo Studio) | 2026-06-02 |
| 16 | soho | Demo Soho Nails & Spa | soho.cz | Nehtové studio | **DONE** (nails-01 Demo Soho Nails & Spa) | 2026-06-03 |
| 17 | celebrate | Demo Celebrate Salon | celebrate.cz | Nehtové studio | **DONE** (nails-02 Premium Nails) | 2026-06-04 |
| 18 | maidenstudio | Demo Maiden Studio | maidenstudio.cz | Nehtové studio | **DONE** (nails-03 Studio Krásy) | 2026-06-04 |
| 19 | esthesia | Demo Esthesia Clinic | esthesia.cz | Kosmetická klinika | 🔒 IN PROGRESS | 2026-06-05 |
| 20 | bomton | Demo Bomton Clinic | bomton.cz | Kosmetická klinika | **DONE** (clinic-02 Demo Bomton Clinic) | 2026-06-05 |
| 21 | yesvisage | Demo Yes Visage / Diamond Look Klinika | yesvisage.cz | Kosmetická klinika | ✅ DONE | 2026-06-05 |
| 22 | linda | Demo Linda Sikorová | linda.cz | Fitness & Wellness | ✅ DONE (fitness-01 Pavel Marak) | 2026-06-06 |
| 23 | victory | Demo Fitness Victory | victory.cz | Fitness & Wellness | ✅ DONE | 2026-06-06 |
| 24 | fyziovsem | Vaše Fyzio | fyziovsem.cz | Fyzioterapie | ✅ DONE (fyzio-01) | 2026-06-07 |
| 25 | resetclinic | Demo Reset Fyzio | resetclinic.cz | Fyzioterapie | ✅ DONE (fyzio-02) | 2026-06-07 |
| 26 | ambi-bistro | Demo Memento | ambi-bistro.cz | Restaurace | **DONE** (restaurant-01 Demo Memento) | 2026-06-07 |
| 27 | hybernska | Demo Hybernská | hybernska.cz | Restaurace | ✅ DONE | 2026-06-08 |
| 28 | lacasa-latina | Demo La Casa Latina | lacasalatina.cz | Restaurace | ✅ DONE | 2026-06-08 |
| 29 | cafe-savoy | Demo Café Savoy | cafesavoy.cz | Kavárna | ✅ DONE | 2026-06-08 |
| 30 | zrno-zrnko | Demo Zrno Zrnko | zrnozrnko.cz | Pekárna & Kavárna | ✅ DONE | 2026-06-08 |
| 31 | costa-coffee | Demo Costa Coffee | costa-coffee.cz | Kavárenský řetězec | **DONE** (cafe-01) | 2026-05-23 |
| 32 | coffee-room | Demo Coffee Room | coffeeroom.cz | Specialty kavárna | ✅ DONE | 2026-06-08 |
| 33 | cathedral-cafe | Demo Cathedral Café | cathedral.cz | Kavárna & Restaurace | ✅ DONE | 2026-06-08 |
| 34 | lexxus-norton | Demo Lexxus Norton | lexxusnorton.cz | Realitní kancelář | ✅ DONE | 2026-06-08 |
| 35 | fer-makleri | Demo FER Makléři | fermakleri.cz | Realitní kancelář | ✅ DONE | 2026-06-08 |
| 36 | reality-skutovi | Demo Reality Škutovi | realityskutovi.cz | Realitní kancelář | ✅ DONE | 2026-06-08 |
| 37 | quantum-reality | Demo Quantum Reality | quantum.cz | Realitní kancelář | ✅ DONE | 2026-06-08 |
| 38 | jan-srubar | Demo Jan Šrubař | srubar.cz | Realitní makléř | ✅ DONE (reality-06 Demo Dominik Krejčí) | 2026-06-08 |
| 39 | ondrej-kucera | Demo Ondřej Kučera | okucera.cz | Realitní makléř | ✅ DONE | 2026-06-08 |
| 40 | best-drive | Demo BestDrive | bestdrive.cz | Autoservis & Pneuservis | ✅ DONE | 2026-06-09 |
| 41 | autoservis-garant | Demo Autoservis GARANT | garant.cz | Autoservis | ✅ DONE | 2026-06-09 |
| 42 | autoservis-tomas | Demo Autoservis Tomáš | tomas.cz | Autoservis BMW | ✅ DONE | 2026-06-09 |
| 43 | magic-smile | Demo Magic Smile | magicsmile.cz | Zubní klinika | ✅ DONE | 2026-06-10 |
| 44 | svet-rovnatek | Demo Svět rovnátek | svetrov.cz | Ortodoncie | ✅ DONE | 2026-06-10 |
| 45 | perfect-smile | Demo Perfect Smile | perfectsmile.cz | Ortodoncie | ✅ DONE (ortho-02 Premium Care) | 2026-06-10 |
| 46 | havel-partners | Demo SVOBODA & PARTNERS | havelpartners.cz | Advokátní kancelář | ✅ DONE (lawyer-01) | 2026-06-11 |
| 47 | rowan-legal | Demo ROWAN LEGAL | rowan.cz | Advokátní kancelář | ✅ DONE (legal-02 DOLEŽAL & PARTNEŘI) | 2026-06-12 |
| 48 | stavbadesign | Demo Stavba Design | stavbadesign.cz | Stavební firma | ✅ DONE (stavba-01 Demo Stavba Design) | 2026-06-12 |
| 49 | baurekstav | Demo BauRekStav | baurekstav.cz | Rekonstrukce bytů | 🔒 IN PROGRESS | 2026-06-12 |
| 50 | bytyjadra | Demo Byty Jadra | bytyjadra.cz | Rekonstrukce bytů | ✅ DONE (stavba-02 Mistr Rekonstrukcí) | 2026-06-14 |
| 51 | elektrobohacek | Demo Elektro Boháček | elektro-bohacek.cz | Elektroinstalace | **DONE** (elektro-01) | 2026-06-14 |
| 52 | instalateritopenari | Demo Instalatéři Praha | instalateritopenari.cz | Instalatérství | ✅ DONE (instala-01) | 2026-06-14 |
| 53 | perfectcatering | Demo Catering Praha | perfectcatering.cz | Catering & Gastronomie | 🔒 IN PROGRESS | 2026-06-14 |
| 54 | freja | Demo Květinářství | freja.cz | Květinářství & E-shop | ✅ DONE | 2026-06-14 |
| 55 | ovocnysvetozor | Demo Světozor | ovocnysvetozor.cz | Cukrárna & Pekárna | ✅ DONE | 2026-06-15 |
| 56 | antoninova | Demo pekářství | antoninovopekarstvi.cz | Pekárna & Kavárna | ✅ DONE `bakery-02` | 2026-06-15 |
| 57 | nobe | Demo autoškola | nobe.cz | Autoškola | ✅ DONE | 2026-06-15 |
| 58 | jipka | Demo Jazyková škola | jipka.cz | Jazyková škola | ✅ DONE | 2026-06-15 |
| 59 | skolapopulo | Demo Akademie | skolapopulo.cz | Doučování & vzdělávání | ✅ DONE `edu-01` | 2026-06-15 |
| 60 | scioles | Demo Kroužky | scioles.cz | Dětské kroužky & vzdělávání | 🔒 IN PROGRESS | 2026-06-15 |
| 61 | veterinafenix | Demo Veterinární Klinika | veterinafenix.cz | Veterinární klinika | 🔒 IN PROGRESS | 2026-06-15 |
| 62 | cutedogs | Demo Psí Salon | cutedogs.cz | Psí a kočičí grooming salon | 🔒 IN PROGRESS | 2026-06-15 |
| 63 | skolkapropejska | Demo Hotel pro psy | skolkapropejska.cz | Psí hotel & školka | ✅ DONE | 2026-06-15 |
| 64 | ucetnictvispravne | Demo Účetnictví | ucetnictvispravne.cz | Účetní firma & daňové poradenství | 🔒 IN PROGRESS | 2026-06-16 |
| 65 | grantex | Demo Daňový Poradce | grantex.cz | Daňové poradenství & účetnictví | ✅ DONE | 2026-06-16 |
| 66 | gpf | Demo Hypoteční Poradce | gpf.cz | Hypoteční poradenství & finance | ✅ DONE | 2026-06-16 |
| 67 | brokerconsulting | Demo Finanční Poradce | brokerconsulting.cz | Finanční poradenství & investice | 🔒 IN PROGRESS | 2026-06-16 |
| 68 | karesarch | Demo Arch | karesarch.cz | Architektonický ateliér | DONE ✅ | 2026-06-17 |
| 69 | schlieger | Demo Solar | schlieger.cz | Fotovoltaika & tepelná čerpadla | DONE ✅ | 2026-06-17 |
| 70 | cleancat | Demo Clean | cleancat.cz | Úklidová firma & mytí oken | ✅ DONE | 2026-06-17 |
| 71 | vestop | Demo Vestop | vestop.cz | Topenářství & Instalatérství | ✅ DONE | 2026-06-17 |
| 72 | pragoclima | Demo Pragoclima | pragoclima.cz | Klimatizace & Tepelná čerpadla | ✅ DONE | 2026-06-17 |
| 73 | acheating | Demo AC-Heating | ac-heating.cz | Tepelná čerpadla & Fotovoltaika | ✅ DONE | 2026-06-18 |
| 74 | greensie | Demo Greensie | greensie.cz | Fotovoltaika | 🔒 IN PROGRESS | 2026-06-17 |
| 75 | supellex | Demo Supellex | supellex.cz | Podlahy & E-shop | ✅ DONE | 2026-06-18 |
| 76 | petrovomalovani | Demo Petrovo malování | petrovomalovani.cz | Malíř & Natěrač | ✅ DONE | 2026-06-18 |
| 77 | klempirzprahy | Demo Klempíř z Prahy | klempirzprahy.cz | Klempíř & Pokrývač | ✅ DONE | 2026-06-18 |
| 78 | gerberra | Demo Gerberra | gerberra.cz | Zahradnické služby | ✅ DONE | 2026-06-18 |
| 79 | polgarden | Demo PolGarden | polgarden.cz | Realizace zahrad | ✅ DONE | 2026-06-19 |
| 80 | lesarb | Demo Lesarb | lesarb.cz | Arboristika | ✅ DONE | 2026-06-19 |
| 81 | modryzralok | Demo Modrý Žralok | modryzralok.cz | Úklidové služby | ✅ DONE | 2026-06-19 |
| 82 | deratizace | Demo Deratizace | deratizacepraha.com | Deratizace / DDD | ✅ DONE | 2026-06-20 |
| 83 | chaletmilada | Demo Chalet | chaletmilada.cz | Ubytování / Horská chata | ✅ DONE `chalet-01` | 2026-06-20 |
| 84 | palacehotel | Demo Boutique Hotel | palacehotel.cz | Boutique Hotel / Apartmány | ✅ DONE `hotel-01` | 2026-06-20 |
| 85 | malirstvibastar | Demo Malířství | malirstvi-bastar.cz | Malíř / Natěrač (2. varianta) | ✅ DONE `malir-02` | 2026-06-20 |
| 86 | hotelatlantis | Demo Hotel Atlantis | hotel-atlantis.cz | Hotel & Wellness | ✅ DONE | 2026-06-20 |
| 87 | zbiralova | Demo Fotografka | zbiralova.cz | Fotograf | 🔒 IN PROGRESS | 2026-06-20 |
| 88 | honzakamenar | Demo Kameraman | honzakamenar.cz | Videografie | ✅ DONE (video-01 Demo Kameraman) | 2026-06-20 |
| 89 | vasdj | Demo DJ | vasdj.cz | DJ & Events | ✅ DONE (dj-01 DJ Agosto) | 2026-06-20 |
| 90 | amdenevents | Lumina Events | amdenevents.cz | Event Agency | ✅ DONE (events-01 · 8 sekcí · 100% editovatelnost · mobile) | 2026-06-20 |
| 91 | corleone | Demo Pizzeria | corleone.cz | Restaurace & Pizzerie | ✅ DONE | 2026-06-20 |
| 92 | kim-impressive | Impresiv Studio | kim-impressive.cz | Kadeřnictví | ✅ DONE | 2026-05-30 |

---

## JAK SE FRONTA AKTUALIZUJE

Po dokončení FÁZE B (validace + finální audit prošel):
1. V tabulce výše: `TODO` → `DONE` u dané šablony, doplnit datum.
2. Volitelně: aktualizovat `template-lab/_STATE.md` (legacy tabulka 87 šablon).
3. Šablona se objeví ve `src/templates/<slug>/` ve formátu MASTER ENGINE
   (template.json + theme.json + skin.css + preview.png + README.md).

## REFERENCE Z OSTATNÍCH STANDARDŮ

Tento queue je referencován z:
- [TEMPLATE_STANDARD.md](./TEMPLATE_STANDARD.md) — sekce "Fronta šablon"
- [LIVE_EDITOR_STANDARD.md](./LIVE_EDITOR_STANDARD.md) — sekce "Fronta šablon"
- [PAGE_BUILDER_STANDARD.md](./PAGE_BUILDER_STANDARD.md) — sekce "Fronta šablon"
- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) — sekce "Fronta šablon"
- [IMAGE_PIPELINE_STANDARD.md](./IMAGE_PIPELINE_STANDARD.md) — sekce "Fronta šablon"
- [TENANT_DEPLOYMENT_FLOW.md](./TENANT_DEPLOYMENT_FLOW.md) — sekce "Fronta šablon"
- [SEO_PERFORMANCE_CHECKLIST.md](./SEO_PERFORMANCE_CHECKLIST.md) — sekce "Fronta šablon"

Prompty pro Sonneta (FÁZE A / FÁZE B): [FAZE_A_PROMPT.md](./FAZE_A_PROMPT.md) (analýza) + [FAZE_B_PROMPT.md](./FAZE_B_PROMPT.md) (implementace)
