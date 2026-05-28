# MASTER TEMPLATE QUEUE — Fronta převodu šablon na MASTER ENGINE

**Datum:** 2026-05-25
**Zdroj fronty (vstup):** [http://localhost:3015/preview](http://localhost:3015/preview) → [src/app/preview/page.tsx](../src/app/preview/page.tsx)
**Cíl převodu (výstup):** [http://localhost:3015/preview-2](http://localhost:3015/preview-2) → [src/templates/&lt;slug&gt;/](../src/templates/) (auto-discovery podle `template.json`)
**Celkem šablon ve frontě:** 91
**Hotovo (převedeno na MASTER ENGINE):** 5 (`cafe-01`, `barber-01`, `peak-cut`, `barber-02`, `barber-03`)
**Zbývá:** 86
**Rolled back (2026-05-27):** `the-barber`, `fade-room` — engine verze nesplňovaly 1:1 parity s `/preview`; clone tenanty (`the-barber-demo`, `fade-room-demo`) navíc mají vymazanou `full-page-clone` sekci → vyžadují recovery přes `scripts/recover-clone-tenant.mjs`.
**Druhý průchod (2026-05-28):** `the-barber` → engine `barber-02` (Holičství Atelier) DONE; `fade-room` → engine `barber-03` (Studio Břitva) DONE — section-by-section per FÁZE C.

> **Tok:** `/preview` (91 legacy scrapů) → FÁZE A + B → `src/templates/<slug>/` → automaticky se objeví v `/preview-2`.
> Šablona je `DONE` teprve když je viditelná v `/preview-2` a všechny grep audity prošly.

> Tento soubor je **jediný zdroj pravdy** o tom, která šablona je další v pořadí.
> Sonnet ho čte ve FÁZI A (analýza) i ve FÁZI B (implementace).
> Po dokončení šablony se zde aktualizuje status `TODO → DONE` a doplní datum.
> Pořadí převodu = pořadí v tabulce (id 1 → 91). Vždy se bere první `TODO` v pořadí.

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
| 2 | the-barber | The Barber | thebarber.cz | Barbershop | TODO (rolled back 2026-05-27) | — |
| 3 | fade-room | Barber Urban | barbershopurban.cz | Barbershop | **DONE** (barber-03 Studio Břitva) | 2026-05-28 |
| 4 | barber-praha | Barber Praha | barberpraha.cz | Barbershop | TODO | — |
| 5 | studio-jarka | Studio Jarka | studio-jarka.cz | Kadeřnictví | TODO | — |
| 6 | hairsalon-no1 | Hair Studio No.1 | hairsalon-no1.cz | Kadeřnictví | TODO | — |
| 7 | petramechurova | Petra Studio | petramechurova.cz | Kadeřnictví | TODO | — |
| 8 | selfbeauty | Demo Beauty Studio | selfbeauty.cz | Beauty & Wellness | TODO | — |
| 9 | praha-masaze | Demo Masáže | praha-masaze.cz | Masáže & Wellness | TODO | — |
| 10 | ananda | Demo Ananda SPA | ananda.cz | Ayurvéda & Wellness | TODO | — |
| 11 | tawan | Demo TAWAN Masáže | tawan.cz | Thajské masáže | TODO | — |
| 12 | escape | Demo Escape Massage | escapemassage.cz | Thajské masáže | TODO | — |
| 13 | tribo | Demo TRIBO Studio | tribo.cz | Tetování & Piercing | TODO | — |
| 14 | homie | Demo Homie Tattoo | homietattoo.cz | Tetování & Piercing | TODO | — |
| 15 | magic | Demo Magic Tattoo | magic.cz | Tetování & Piercing | TODO | — |
| 16 | soho | Demo Soho Nails & Spa | soho.cz | Nehtové studio | TODO | — |
| 17 | celebrate | Demo Celebrate Salon | celebrate.cz | Nehtové studio | TODO | — |
| 18 | maidenstudio | Demo Maiden Studio | maidenstudio.cz | Nehtové studio | TODO | — |
| 19 | esthesia | Demo Esthesia Clinic | esthesia.cz | Kosmetická klinika | TODO | — |
| 20 | bomton | Demo Bomton Clinic | bomton.cz | Kosmetická klinika | TODO | — |
| 21 | yesvisage | Demo Yes Visage | yesvisage.cz | Kosmetická klinika | TODO | — |
| 22 | linda | Demo Linda Sikorová | linda.cz | Fitness & Wellness | TODO | — |
| 23 | victory | Demo Fitness Victory | victory.cz | Fitness & Wellness | TODO | — |
| 24 | fyziovsem | Demo Fyzio Všem | fyziovsem.cz | Fyzioterapie | TODO | — |
| 25 | resetclinic | Demo Reset Fyzio | resetclinic.cz | Fyzioterapie | TODO | — |
| 26 | ambi-bistro | Demo Ambiente Bistro | ambi-bistro.cz | Restaurace | TODO | — |
| 27 | hybernska | Demo Hybernská | hybernska.cz | Restaurace | TODO | — |
| 28 | lacasa-latina | Demo La Casa Latina | lacasalatina.cz | Restaurace | TODO | — |
| 29 | cafe-savoy | Demo Café Savoy | cafesavoy.cz | Kavárna | TODO | — |
| 30 | zrno-zrnko | Demo Zrno Zrnko | zrnozrnko.cz | Pekárna & Kavárna | TODO | — |
| 31 | costa-coffee | Demo Costa Coffee | costa-coffee.cz | Kavárenský řetězec | **DONE** (cafe-01) | 2026-05-23 |
| 32 | coffee-room | Demo Coffee Room | coffeeroom.cz | Specialty kavárna | TODO | — |
| 33 | cathedral-cafe | Demo Cathedral Café | cathedral.cz | Kavárna & Restaurace | TODO | — |
| 34 | lexxus-norton | Demo Lexxus Norton | lexxusnorton.cz | Realitní kancelář | TODO | — |
| 35 | fer-makleri | Demo FER Makléři | fermakleri.cz | Realitní kancelář | TODO | — |
| 36 | reality-skutovi | Demo Reality Škutovi | realityskutovi.cz | Realitní kancelář | TODO | — |
| 37 | quantum-reality | Demo Quantum Reality | quantum.cz | Realitní kancelář | TODO | — |
| 38 | jan-srubar | Demo Jan Šrubař | srubar.cz | Realitní makléř | TODO | — |
| 39 | ondrej-kucera | Demo Ondřej Kučera | okucera.cz | Realitní makléř | TODO | — |
| 40 | best-drive | Demo BestDrive | bestdrive.cz | Autoservis & Pneuservis | TODO | — |
| 41 | autoservis-garant | Demo Autoservis GARANT | garant.cz | Autoservis | TODO | — |
| 42 | autoservis-tomas | Demo Autoservis Tomáš | tomas.cz | Autoservis BMW | TODO | — |
| 43 | magic-smile | Demo Magic Smile | magicsmile.cz | Zubní klinika | TODO | — |
| 44 | svet-rovnatek | Demo Svět rovnátek | svetrov.cz | Ortodoncie | TODO | — |
| 45 | perfect-smile | Demo Perfect Smile | perfectsmile.cz | Ortodoncie | TODO | — |
| 46 | havel-partners | Demo HAVEL & PARTNERS | havel.cz | Advokátní kancelář | TODO | — |
| 47 | rowan-legal | Demo ROWAN LEGAL | rowan.cz | Advokátní kancelář | TODO | — |
| 48 | stavbadesign | Demo Stavba Design | stavbadesign.cz | Stavební firma | TODO | — |
| 49 | baurekstav | Demo BauRekStav | baurekstav.cz | Rekonstrukce bytů | TODO | — |
| 50 | bytyjadra | Demo Byty Jadra | bytyjadra.cz | Rekonstrukce bytů | TODO | — |
| 51 | elektrobohacek | Demo Elektro Boháček | elektro-bohacek.cz | Elektroinstalace | TODO | — |
| 52 | instalateritopenari | Demo Instalatéři Praha | instalateritopenari.cz | Instalatérství | TODO | — |
| 53 | perfectcatering | Demo Catering Praha | perfectcatering.cz | Catering & Gastronomie | TODO | — |
| 54 | freja | Demo Květinářství | freja.cz | Květinářství & E-shop | TODO | — |
| 55 | ovocnysvetozor | Demo Světozor | ovocnysvetozor.cz | Cukrárna & Pekárna | TODO | — |
| 56 | antoninova | Demo pekářství | antoninovopekarstvi.cz | Pekárna & Kavárna | TODO | — |
| 57 | nobe | Demo autoškola | nobe.cz | Autoškola | TODO | — |
| 58 | jipka | Demo Jazyková škola | jipka.cz | Jazyková škola | TODO | — |
| 59 | skolapopulo | Demo Akademie | skolapopulo.cz | Doučování & vzdělávání | TODO | — |
| 60 | scioles | Demo Kroužky | scioles.cz | Dětské kroužky & vzdělávání | TODO | — |
| 61 | veterinafenix | Demo Veterinární Klinika | veterinafenix.cz | Veterinární klinika | TODO | — |
| 62 | cutedogs | Demo Psí Salon | cutedogs.cz | Psí a kočičí grooming salon | TODO | — |
| 63 | skolkapropejska | Demo Hotel pro psy | skolkapropejska.cz | Psí hotel & školka | TODO | — |
| 64 | ucetnictvispravne | Demo Účetnictví | ucetnictvispravne.cz | Účetní firma & daňové poradenství | TODO | — |
| 65 | grantex | Demo Daňový Poradce | grantex.cz | Daňové poradenství & účetnictví | TODO | — |
| 66 | gpf | Demo Hypoteční Poradce | gpf.cz | Hypoteční poradenství & finance | TODO | — |
| 67 | brokerconsulting | Demo Finanční Poradce | brokerconsulting.cz | Finanční poradenství & investice | TODO | — |
| 68 | karesarch | Demo Arch | karesarch.cz | Architektonický ateliér | TODO | — |
| 69 | schlieger | Demo Solar | schlieger.cz | Fotovoltaika & tepelná čerpadla | TODO | — |
| 70 | cleancat | Demo Clean | cleancat.cz | Úklidová firma & mytí oken | TODO | — |
| 71 | vestop | Demo Vestop | vestop.cz | Topenářství & Instalatérství | TODO | — |
| 72 | pragoclima | Demo Pragoclima | pragoclima.cz | Klimatizace & Tepelná čerpadla | TODO | — |
| 73 | acheating | Demo AC-Heating | ac-heating.cz | Tepelná čerpadla & Fotovoltaika | TODO | — |
| 74 | greensie | Demo Greensie | greensie.cz | Fotovoltaika | TODO | — |
| 75 | supellex | Demo Supellex | supellex.cz | Podlahy & E-shop | TODO | — |
| 76 | petrovomalovani | Demo Petrovo malování | petrovomalovani.cz | Malíř & Natěrač | TODO | — |
| 77 | klempirzprahy | Demo Klempíř z Prahy | klempirzprahy.cz | Klempíř & Pokrývač | TODO | — |
| 78 | gerberra | Demo Gerberra | gerberra.cz | Zahradnické služby | TODO | — |
| 79 | polgarden | Demo PolGarden | polgarden.cz | Realizace zahrad | TODO | — |
| 80 | lesarb | Demo Lesarb | lesarb.cz | Arboristika | TODO | — |
| 81 | modryzralok | Demo Modrý Žralok | modryzralok.cz | Úklidové služby | TODO | — |
| 82 | deratizace | Demo Deratizace | deratizacepraha.com | Deratizace / DDD | TODO | — |
| 83 | chaletmilada | Demo Chalet | chaletmilada.cz | Ubytování / Horská chata | TODO | — |
| 84 | palacehotel | Demo Boutique Hotel | palacehotel.cz | Boutique Hotel / Apartmány | TODO | — |
| 85 | malirstvibastar | Demo Malířství | malirstvi-bastar.cz | Malíř / Natěrač (2. varianta) | TODO | — |
| 86 | hotelatlantis | Demo Hotel Atlantis | hotel-atlantis.cz | Hotel & Wellness | TODO | — |
| 87 | zbiralova | Demo Fotografka | zbiralova.cz | Fotograf | TODO | — |
| 88 | honzakamenar | Demo Kameraman | honzakamenar.cz | Videografie | TODO | — |
| 89 | vasdj | Demo DJ | vasdj.cz | DJ & Events | TODO | — |
| 90 | amdenevents | Demo Events | amdenevents.cz | Event Agency | TODO | — |
| 91 | corleone | Demo Pizzeria | corleone.cz | Restaurace & Pizzerie | TODO | — |

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
