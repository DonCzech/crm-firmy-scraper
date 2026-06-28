# FÁZE A — ANALÝZA DALŠÍ ŠABLONY (POUZE ANALÝZA, ŽÁDNÝ KÓD)

**Datum:** 2026-05-25
**Použití:** Uživatel řekne Sonnetovi: *"Vypracuj práci podle docs/FAZE_A_PROMPT.md"*.
Sonnet provede POUZE analýzu. Po dokončení čeká — uživatel pak v **stejném okně** odkáže na `docs/FAZE_B_PROMPT.md` (implementace).

---

## 🔧 SPOLEČNÝ KONTEXT

PROJEKT: Venom / Webero
ROOT: `/Users/apple/DEV/CRM/venom`
DEV: `http://localhost:3015`

**Fronta šablon (jediný zdroj pravdy):** [docs/MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md)
- **Vstup:** `/preview` (91 legacy scrapů) — `src/app/preview/page.tsx`
- **Výstup:** `/preview-2` — auto-discovery z `src/templates/<slug>/template.json`
- **Pořadí:** první `TODO` v tabulce. Nepřeskakuj.

### 🚨🚨🚨 `/preview` JE READ-ONLY — POUZE ČTEŠ
`/preview` (`src/app/preview/page.tsx` + `public/clones/<slug>/**`) je referenční zdroj pravdy = 1:1 mirror originálu. **Ve FÁZI A ho POUZE ČTEŠ** (otevíráš v prohlížeči, čteš HTML/CSS soubory). NIKDY do něj nezapisuj, nemaž, nepřepisuj — ani jako součást "úprav" pro engine verzi. Veškerá implementace patří do `src/templates/<slug>/` a `src/app/preview-2/`. Detailní zákazy najdeš v FÁZI B.

**Sedm závazných standardů:**
- `docs/TEMPLATE_STANDARD.md`
- `docs/LIVE_EDITOR_STANDARD.md`
- `docs/PAGE_BUILDER_STANDARD.md`
- `docs/COMPONENT_ARCHITECTURE.md`
- `docs/IMAGE_PIPELINE_STANDARD.md`
- `docs/TENANT_DEPLOYMENT_FLOW.md`
- `docs/SEO_PERFORMANCE_CHECKLIST.md`

**Index implementace:** `docs/MASTER_ARCHITECTURE_INDEX.md`

---

## ⚠️ POVINNÁ DEMO DATA (platí už ve FÁZI A — musíš je naplánovat)

**Hlavní princip:** Ve výsledné šabloně **NESMÍ zůstat NIC originálního z obsahu**. Vše musí být demo. ALE: **struktura, layout, design a všechny vizuální prvky se NESMÍ MĚNIT.** Mění se pouze **OBSAH** — text, ceny, jména, kontakty, IČO, značky → placeholdery, fotky → demo placeholder.

### 🚨 CO SE MĚNÍ vs. CO SE NESAHÁ (číst nahlas před každou šablonou)

**MĚNÍ SE (obsah):**
- texty (nadpisy, popisy, copy v sekcích, O nás, recenze, FAQ otázky/odpovědi)
- čísla (ceny ±15–30 %, počet recenzí, hodnocení)
- jména (zákazníci v recenzích, jednatel, firma)
- kontakty (e-mail, telefon, adresa, web, sociální sítě)
- IČO, DIČ, s.r.o. název, registrovaná adresa v patičce
- loga partnerských značek (Rézl/Jameson → demo SVG)
- názvy poboček a jejich adresy
- obrázky → 1 demo placeholder s rozměrem (pokud nemáme licencované fotky)

**NESAHAT (struktura, layout, design):**
- hlavička / navigace (počet položek, layout, sticky chování, hamburger breakpoint)
- hero sekce (typ, kompozice, pozice CTA, výška, pozadí, slider/video/static)
- šířka sekcí (ceník, services, gallery — pokud byl ceník na full-width, zůstává full-width; pokud byl `max-width: 720px`, zůstává `720px`)
- grid sloupců (3 sloupce zůstávají 3 sloupce, ne 2 ani 4)
- pořadí sekcí na homepage i podstránkách
- typografie (fonty, váhy, velikosti, letter-spacing, line-height)
- barvy (primary, secondary, accent — zachovat HEX)
- button styl (radius, padding, shadow, hover)
- spacing personality (těsné/vzdušné — neměnit rytmus)
- shadows, border radius, atmosféra
- breakpointy a responzivní chování (pokud nejsou rozbité)

**Pravidlo palce:** Pokud bys musel upravit `template.json` strukturu sekcí, změnit variantu sdílené komponenty na jinou, snížit/zvýšit max-width, přidat/ubrat sloupec, změnit font nebo barvu — **NEDĚLEJ TO**, pokud k tomu není explicitně v sekci "Defekty originálu k opravě" odůvodnění. Při pochybnostech: nesahej a zachovej originální vzhled.

**Platí pro CELOU šablonu, ne jen homepage** — všechny podstránky (services, gallery, contact, about, blog, blog detail, cenník, rezervace, FAQ, GDPR, obchodní podmínky, kariéra, …) musí mít stejné demo údaje, stejně opravené defekty a stejný vizuální standard. Pokud má originál 6 podstránek, projeď VŠECH 6 — vstup/výstup, demo data, defekty.

V minulých převodech zůstávaly **reálné kontakty, loga, ceník, recenze i IČO** z originálních webů
(např. `info@barberpraha.cz`, telefon `+420 777 ...`, "Pashkov s.r.o. IČO 19446969", recenze od reálných zákazníků, partnerské značky Rézl/Jameson/Becherovka).
**TO JE ZAKÁZÁNO.** Ve FÁZI A naplánuj, kde všude originální data jsou a čím je nahradíš:

### Demo logo
- ❌ Nepoužívej originální logo z naskenovaného webu.
- ✅ Plánuj vlastní demo logo jako SVG (inline v komponentě NEBO `public/templates/<slug>/logo.svg`).
- Logo bude používat **demo název** ze sloupce "Demo název" v queue (např. "Demo Barber Studio"), nikoli reálný název firmy.
- Barvy logo = `primary` / `accent` z `theme.json` šablony.
- Žádné kradené ikony / fotografie značky.

### Demo kontakty (jednotné napříč všemi šablonami)
| Pole | Demo hodnota |
|------|--------------|
| Email | `email@demo.cz` |
| Email (info) | `info@demo.cz` |
| Email (rezervace) | `rezervace@demo.cz` (jen pokud šablona má rezervační formulář) |
| Telefon hlavní | `704 123 456` (mezinárodně `+420 704 123 456`) |
| Telefon druhý | `704 654 321` (jen pokud originál měl 2 čísla) |
| Adresa | `Ukázková 123, 110 00 Praha 1` |
| Web | `https://demo.cz` |
| Facebook | `https://facebook.com/demo` |
| Instagram | `https://instagram.com/demo` |
| IČO | `12345678` |
| DIČ | `CZ12345678` |
| Název firmy / s.r.o. | `Demo Studio s.r.o.` (případně název z queue "Demo název") |
| Registrovaná adresa (patička, GDPR) | `Ukázková 123, 110 00 Praha 1` |
| Jednatel / majitel | `Jan Demo` |
| Provozní doba | `Po–Pá 9:00–18:00, So 9:00–14:00` |

### Demo ceník (povinné, pokud originál má ceník)
- ❌ Nesmíš zkopírovat ceny 1:1 z originálu.
- ✅ Zachovej strukturu (počet položek, řazení, kategorie), ale **přepiš texty popisků** a **uprav ceny** tak, aby NEODPOVÍDALY originálu.
- Pravidlo: posuň každou cenu o ±15–30 % nahoru či dolů (zaokrouhli na 50 Kč). Příklad: originál 850 Kč → demo 650 Kč; 1300 Kč → 1100 Kč; 700 Kč → 850 Kč.
- Názvy služeb mohou zůstat generické (např. "Klasické stříhání"), ale popis pod nimi přepiš vlastními slovy — nesmí se shodovat větu po větě s originálem.

### Demo recenze / hodnocení
- ❌ Nepoužívej jména reálných zákazníků, ani jejich texty, ani jejich hvězdičky / počet recenzí.
- ✅ Vytvoř **demo recenze** s demo jmény (`Jan Novák`, `Petra Svobodová`, `Tomáš Dvořák`, `Eva Procházková`, `Martin Černý`, …).
- Texty recenzí napiš sám (2–4 věty, generické, tématické pro kategorii — barber/wellness/restaurace…).
- Celkové hodnocení (např. "4.9★ z 312 recenzí") změň na demo (např. `4.8★ z 127 recenzí`).
- Pokud jsou v originálu loga platforem (Google, Heureka, Firmy.cz) — ponech jen pokud je to obecné logo platformy, ne ID konkrétního profilu.

### Demo "O nás" / about text
- ❌ Nezachovávej text o nás z originálu — i kdyby byl krátký, je to copy reálné firmy.
- ✅ Přepiš celý odstavec(y) o nás tématicky pro kategorii šablony s demo názvem firmy.
- Bez zmínek o reálné historii, reálných osobách, reálných lokacích originální firmy.

### Demo partnerské značky / loga "spolupracujeme s"
- ❌ Pokud originál ukazuje pásek s logy partnerských značek (např. Rézl, Jameson, Becherovka, Coca-Cola, Heineken, kosmetické značky), NESMÍŠ je tam ponechat.
- ✅ Nahraď je demo logy (text-only SVG: "Demo Brand 1", "Demo Brand 2", …) v barvách `theme.json`, případně sekci úplně vypusť, pokud není pro kategorii zásadní.

### Demo pobočky / kontaktní adresy
- ❌ Reálné adresy poboček (`Vlkova 9, Žižkov`; `Wuchterlova 584/16, Praha 6`) jsou ZAKÁZÁNY.
- ✅ Pokud má originál více poboček, zachovej počet, ale použij demo adresy:
  - Pobočka 1: `Ukázková 123, 110 00 Praha 1`
  - Pobočka 2: `Vzorová 456, 120 00 Praha 2`
  - Pobočka 3: `Demonstrační 789, 130 00 Praha 3`
- Telefony všech poboček = `+420 704 123 456` (případně druhé `+420 704 654 321`).
- E-maily všech poboček = `info@demo.cz`.

### Demo obrázky / galerie
- ❌ Nepoužívej fotky z originálu (interiér, lidé, jídlo, produkty), pokud to není povolené licenčně.
- ✅ Default: **jeden demo placeholder** s textem "Sem nahraj obrázek" + uveden rozměr (např. `1200×800`).
- Pokud je galerie rozházená v originále (nepřesné gridy, různé výšky), profesionálně to **uprav** v šabloně — sjednocený grid, stejná aspect-ratio, čistý layout.
- Sekce "Kontaktujte nás" se 3 obrázky → redukuj na **1 obrázek** (nebo žádný).

### Vstupní `/preview` může být rozbitý — neopisuj chyby, oprav je
Zdrojové scrape v `/preview` (a v `public/clones/<slug>/`) jsou často nedotažené:
- velké prázdné mezery / padding díry mezi sekcemi
- rozházená galerie (asymetrický grid, fotky různé velikosti, ořezy)
- elementy přesazené přes sebe, překryvy textu, useknuté nadpisy
- nefunkční tlačítka, mrtvé odkazy, nefunkční slider/akordeon/lightbox
- nenačítající se fonty / ikony / fallback boxy
- chybějící alt texty, prázdné `<img>`, broken responsive (mobil přetéká)
- duplicitní bloky (např. dvě hero sekce, 3 stejné obrázky v kontaktech)
- inline JS chyby v konzoli, nezavřené tagy, nevalidní HTML

**Pravidlo:** Vstup = inspirace pro layout a styl, **ne závazná pravda**. Při převodu na engine **profesionálně oprav**, co je rozbité — nikdy nekopíruj chybu jen proto, že byla v originále.

Ve FÁZI A vypiš samostatný blok **"Defekty originálu k opravě"** — projdi `/preview` kartu na desktop + mobile, **a stejně tak každou podstránku** (services, gallery, contact, about, blog, blog detail, cenník, rezervace, FAQ, GDPR, obchodní podmínky, kariéra, …). Vyjmenuj konkrétní problémy + jak je opravíš, **rozdělené po stránkách**:

```
Homepage:
- galerie 7 fotek různé výšky → 8-grid 4×2 s aspect-ratio 4/3
- mezera 280 px mezi services a galerií → sjednotit na `--section-gap`
- 3 obrázky v kontaktech → 1 vlevo + form vpravo
- nefunkční accordion v FAQ → shared `FAQSection` variant `accordion`

/sluzby:
- ceník přetéká na mobilu → grid 1 sloupec < 768 px
- prázdné `<img>` u 3 služeb → demo placeholder 800×600

/galerie:
- lightbox nefunguje → shared `GalleryLightbox`
- duplicitní řádek 4 fotek → smazat

/kontakt:
- mapa iframe odkazuje na originální adresu → demo adresa
- form bez submit handleru → shared `ContactForm`
```

Sekce **NIKDY nesmí** být ve výsledku méně profesionální než originál. Cíl je: zachovat charakter, opravit defekty, sjednotit rytmus.

### Demo údaje v patičce (legal / GDPR blok)
- ❌ Reálné s.r.o. názvy, IČO, DIČ, jména jednatelů ZAKÁZÁNY (např. "Pashkov s.r.o., IČO 19446969, Čerpadlová 1034/2…").
- ✅ Vždy: `Demo Studio s.r.o.`, IČO `12345678`, DIČ `CZ12345678`, adresa `Ukázková 123, 110 00 Praha 1`.
- Žádné reálné kontaktní telefony ani v patičce — pouze demo (`+420 704 123 456`).

---

# 🚫 KRITICKÁ PRAVIDLA FÁZE A
- **NEIMPLEMENTUJ** žádné změny — POUZE analýza.
- Neupravuj soubory, nevytvářej komponenty, nepřeskakuj kroky.
- Žádná zjednodušená řešení, žádné "krátké" verze sekcí níže.

---

## 0) Kontext (přečti si **nejdřív**)
1. Načti všech 7 standardů (`docs/TEMPLATE_STANDARD.md`, `LIVE_EDITOR_STANDARD.md`, `PAGE_BUILDER_STANDARD.md`, `COMPONENT_ARCHITECTURE.md`, `IMAGE_PIPELINE_STANDARD.md`, `TENANT_DEPLOYMENT_FLOW.md`, `SEO_PERFORMANCE_CHECKLIST.md`).
2. Načti `docs/MASTER_ARCHITECTURE_INDEX.md` — víš, co je už hotové ve sdíleném enginu.
3. Načti `docs/MASTER_TEMPLATE_QUEUE.md` — najdi **první `TODO`** v tabulce; **to je tvoje šablona**.
4. Načti `README.md` poslední `DONE` šablony v `src/templates/` — kontinuita variant.
5. Otevři odpovídající kartu na `http://localhost:3015/preview` (slug + suffix `-demo`) a zdrojový HTML/CSS scrap (typicky `public/clones/<slug>/` nebo `template-lab/research/<slug>/`).

## 1) Identifikace šablony (vypiš v odpovědi)
- Slug, demo název, originální doména, kategorie (z queue).
- URL na `/preview` kartu.
- URL na zdrojové soubory (mirror) — co je k dispozici.
- Předchozí `DONE` šablona, na kterou navazuješ + varianty sekcí, které zavedla.

## 2) Detailní analýza
### a) Layout
- homepage struktura (sekce v pořadí)
- **podstránky — vyjmenuj VŠECHNY** (slug, název, sekce v pořadí, URL na originále, URL na `/preview` pokud existuje). Nesmí žádná chybět. Pro každou popiš strukturu sekcí stejně detailně jako homepage.
- **Discovery podstránek (povinné):** projdi originál systematicky — neopírej se jen o hlavní menu. Otevři `public/clones/<slug>/` (nebo `template-lab/research/<slug>/`) a vypiš všechny HTML soubory; otevři `sitemap.xml` originálu pokud existuje; projdi odkazy v patičce (legal, kariéra, GDPR, blog); klikni do menu i submenu; projdi breadcrumbs. Cíl: **maximální využití toho, co originál má** — pokud existují stránky typu "Náš tým", "Před / Po", "Časté dotazy", "Kariéra", "Akce", "Reference", "Cenník", "Rezervace", **musí být v šabloně**, ne jen homepage. Skryté nebo nelinkované stránky (existují v adresáři, ale chybí v menu) zařaď taky, pokud mají smysluplný obsah.
- hero typ (full-bleed / split / video / slider …)
- gridy (počet sloupců, responzivní breakpointy)
- spacing personality (těsné / vzdušné / asymetrické)

### b) Vizuální identita
- typografie (font families, váhy, hierarchie, letter-spacing)
- barvy (primary, secondary, accent, neutrals — extrahuj HEX z CSS)
- button styl (radius, padding, shadow, hover)
- shadows
- border radius
- branding feeling
- atmosféra (luxusní / přátelská / minimalistická …)

### c) UX patterny
- navigation (typ, sticky, hamburger breakpoint)
- CTA (kde, kolik, jak silné)
- galleries (typ, počet)
- sliders (Swiper / Flickity / vlastní)
- forms (jaké, kam posílají)

### d) Kompatibilita s MASTER ENGINE
Namapuj **každou sekci** homepage na:
- ✅ **Reuse** — existuje varianta sdílené sekce, kterou použiju (jméno varianty)
- ⚠️ **Extend** — sdílená sekce existuje, ale potřebuje novou variantu / skin (popiš co)
- 🆕 **New** — sdílená sekce neexistuje, je nutné ji založit (popiš proč, není to template-only)

## 3) Demo data plán
Vypiš konkrétně, kam ve scrape se nachází:
- originální logo (cesta) → bude nahrazeno demo SVG (skicovat: text + barva)
- originální emaily/telefony/adresa (najdi všechny) → mapování na demo hodnoty z tabulky výše
- originální název firmy v copy (všechny výskyty) → demo název z queue
- vypiš všechny domény / URL odkazy v scrape, které potřebují nahradit za `demo.cz` / `facebook.com/demo` / atd.

## 4) Risky & pasti
- Co může rozbít vizuální identitu při unifikaci na engine?
- Wix / Webflow / Squarespace blokátory (data-mesh, runtime layout)?
- Externí trackery, jQuery, fonty, ikony — co je nutné vyhodit?
- PageSpeed rizika (oversized obrázky, render-blocking)?

## 5) Plán implementace pro FÁZI B
Stručný step-by-step (bez kódu):
1. `src/templates/<slug>/template.json` — sekce v pořadí, variants
2. `src/templates/<slug>/theme.json` — design tokens
3. `src/templates/<slug>/skin.css` — variant-specific overrides
4. `public/templates/<slug>/logo.svg` — demo logo
5. `src/templates/<slug>/README.md` — autor, zdrojový web, demo data
6. Případné nové varianty / extend sdílených sekcí — kde a proč
7. Image pipeline — kolik obrázků, jaké rozměry, WebP variants
8. SEO bloky — title, OG, JSON-LD podle kategorie

## ⛔ Kritické připomenutí
- Technická standardizace **nesmí zničit** vizuální identitu.
- Šablona **nesmí** působit genericky.
- Musí zůstat: typography personality, spacing personality, branding, button styl, atmosféra.

---

## 🎯 Výstup FÁZE A (POUZE TEXT, NIC NEIMPLEMENTUJ)
- Identifikace šablony (sekce 1)
- Analýza (2a–d) — všechny 4 bloky, žádný zkrácený
- Demo data plán (sekce 3) — konkrétní výskyty, ne obecnosti
- Risky & pasti (sekce 4)
- Plán implementace (sekce 5)
- Checklist sekcí + variant + mapování + identifikované problémy

**STOP po výstupu. NEPOKRAČUJ na implementaci. Čekej, až uživatel pošle FÁZI B (`docs/FAZE_B_PROMPT.md`).**
