# FABLE V3 PLAYBOOK — závazný manuál pro šablony 2–10

> **Pro nového Fable: přečti CELÝ tento soubor PŘED prvním řádkem kódu. Nic dalšího nezkoumej —
> vše podstatné je tady. proof-01 stál 3 designové iterace a ~200 USD; tvým úkolem je postavit
> další šablonu NAPOPRVÉ správně. Každá odchylka od tohoto manuálu = spálené peníze.**

Zadání kolekce: `docs/ZADANI_FABLE_SABLONY_V3.md` (platí beze změny — tento playbook ho doplňuje o závazný design standard a workflow).
Stav: **proof-01 (PROOF) = HOTOVÁ a schválená** (commity `81238fda…47a9b9e7`), živě `http://localhost:3015/demo/proof-01-v2`. Další v pořadí: **SIGNAL** (brief v §8).

---

## 1. ZÁVAZNÝ DESIGN STANDARD (naučeno za draho na proof-01)

Uživatel schválil finální podobu proof-01. **Otevři si ji v prohlížeči jako referenci PŘED stavbou**
(homepage + /realizace + detail realizace). Měřítko kvality = solidpixels.com/cs/vybrat-design a top
Wix Studio/Framer šablony. Tohle je závazný jazyk kolekce (každá šablona ho interpretuje po svém,
ale drží úroveň):

### Co FUNGUJE (dělej)
- **Cinematic hero**: full-bleed fotka přes celou sekci (min-height ~90vh), tmavý gradient overlay,
  velká bílá typografie (H1 clamp až 4.6rem, weight 800, letter-spacing -0.035em, text-wrap:balance),
  akcentová linka H1 v akcentové barvě jako samostatný řádek.
- **Interaktivní prvek v hero = dark glass panel**: rgba(10,17,27,.66) + backdrop-blur(18px),
  border rgba(255,255,255,.14), radius 16 — NIKDY bílá karta s naskládanými orámovanými boxy.
  Uvnitř: hairline řádky (border-bottom rgba(255,255,255,.12)) místo boxů, výsledek jako VELKÁ
  typografie (ne box v boxu), jedno akcentové CTA se stínem.
- **Rytmus sekcí**: tmavá (hero) → bílá → bílá/béžová → tmavá (proces) → bílá … → tmavá (kontakt)
  → tmavší footer (#0E1926). NIKDY dvě tmavé za sebou, NIKDY jednolitá béžová plocha celé stránky.
- **Stats/čísla**: bílý pás, čísla ~50px v tmavé barvě, VERTIKÁLNÍ hairline oddělovače mezi sloupci,
  popisky malé pod čísly, badges jako jeden inline řádek s akcentovými fajfkami pod horizontální linkou.
- **Karty s FOTKAMI**: service/item karty mají fotku (aspect 16/10, hover scale 1.05, spodní gradient,
  číslo/štítek v rohu) — ne ikonky v barevných čtverečcích.
- **FAQ**: bílé, centrovaný úzký sloupec (max 760px), hairline accordion (border-bottom), kruhový
  +/× toggle, pod ním akcentové CTA tlačítko s anchor odkazem na konverzní sekci (#poptavka apod.).
- **Eyebrow**: small-caps label (.78rem, weight 800, letter-spacing .16em, uppercase, akcentová barva,
  krátká linka před textem). ŽÁDNÝ italic serif.
- Radius 6 (tlačítka) / 10–12 (karty) / 16 (glass). Stíny decentní. Tlačítka: solid akcent, radius 6.
- Hairline oddělovače (1px, ~#E7E3DB na světlé / rgba(255,255,255,.12) na tmavé) jako hlavní
  strukturální prvek — ne boxy, ne rámečky všude.
- Mikrointerakce: IO scroll-reveal se staggerem, count-up čísel (jen public — viz §3.6), hover lift,
  sliding thumb u segmented controlů. Vše pod `prefers-reduced-motion`.

### Co je ZAKÁZÁNO (za tohle byl uživatel právem nasraný)
- ikonky v tinted čtverečcích jako hlavní vizuál karet
- bílé formulářové karty s boxy uvnitř boxů v hero
- béžové pozadí všude / žádný kontrastní rytmus
- Instrument Serif italic akcenty, „ghost" čísla, pulzující badge, radiální glow dekorace
- malá bojácná typografie, generické „AI" gradienty a blob pozadí
- dvě tmavé sekce za sebou; footer jinou navy než zbytek tmavých sekcí
- prvky bez fotky tam, kde fotka prodává (hero, služby, reference z praxe)

### Paleta a fonty
- Každá šablona má VLASTNÍ paletu (proof-01: navy #1B3A5C / červená #C3352B / béžová #F4F1EB /
  tmavá #0C1622) — SIGNAL má svou v §8. Vždy: 1 tmavá, 1 akcent, 1 světlá neutrální, bílá.
- Fonty jen z root layoutu (self-hosted next/font): `--font-overpass`, `--font-oswald`,
  `--font-instrument-serif`, `--font-overpass-mono`, `--font-libre-baskerville`, `--font-source-sans`.
  Jiný font NEPŘIDÁVEJ bez úpravy layout.tsx.

---

## 2. KRITICKÉ ENGINE PASTI (každá mě stála hodiny/peníze)

1. **FONTY**: `globals.css` má `@layer base { h1..h6 { font-family:'Playfair Display'; color:#1f1f1f } }`
   — přímé pravidlo VŽDY porazí dědičnost. ⇒ **KAŽDÝ h1/h2/h3 v tvých sekcích musí mít explicitní
   `font-family: var(--font-heading, system-ui, sans-serif)` + explicitní `color`.** A v theme.json:
   `"fontHeading": "var(--font-overpass), 'Overpass', system-ui, sans-serif"` — literál `'Overpass'`
   NEEXISTUJE (next/font registruje jen CSS proměnné).
2. **Selektory na spany**: `GenericEditableText` i count-up renderují `<span>` — pravidlo typu
   `.moje-num span { font-size:.88rem }` ti srazí i číslo uvnitř `<b>`. Vždy `>` direct child
   (`.moje-num > span`) + pojistka `.moje-num b span { font-size: inherit }`.
3. **GenericEditableImage**: wrapper je positioned ⇒ absolutní `<img>` uvnitř se kotví k němu.
   ClassName wrapperu MUSÍ mít CSS `{ position:absolute; inset:0; width:100%; height:100%; display:block }`.
4. **validate-template.mjs parser**: blok variant v `variants.ts` končí na PRVNÍM `],` — v `description`
   NIKDY nepiš `pole[]` následované čárkou (rozbije celý typ i všechny další varianty).
5. **Hooks ve variantách**: hooky volat bezpodmínečně NAD dispatch if-y, nebo mít variantu jako
   samostatnou funkci-komponentu (zavedený vzor). Jinak Studio spadne při přepnutí varianty.
6. **RSC cache**: `revalidate = 60` — po změně může prohlížeč/screenshot ukázat starou verzi.
   Ověřuj computed styly přes `page.evaluate(getComputedStyle...)`, ne jen okem.
7. **Contact API rate-limit**: 3 odeslání/hod/IP ⇒ QA skript napoprvé spadne na formuláři — druhý
   běh je čistý. Neladit neexistující bug.
8. **Onboarding API**: vyžaduje `password` (min 6) a pole se jmenuje `name` (ne businessName).
9. **Sekce = props kontrakt**: `{ content, variant, isAdmin, tenantSlug, sectionId }`; footer/gallery
   dispatch předává tenantSlug+isAdmin jen když je komponenta potřebuje — zkontroluj u linků.
10. **Tenant DB**: tabulky `tenant_pages` + sections přes `getPageSections`; pole `section_variant`
    (ne `variant`), Tenant nemá `name`. `SectionRenderer` chce `tenantId`.

---

## 3. PARALELNÍ SESSIONS — OCHRANA PRÁCE (přišel jsem 3× o hotové komponenty!)

V repu může běžet druhá Claude session, která přepisuje soubory na disku (stale buffery editoru,
vlastní commity). Pravidla:
- **Commituj po KAŽDÉM dokončeném celku** (komponenty, registrace, content) — commit je jediná ochrana.
- Komponenty a registrace piš jako **deterministické rebuild skripty** (vzor:
  `scripts/proof01-rebuild{,2,3}.py`, `scripts/proof01-skin-solidpixels.py`) — když ti něco zmizí,
  spustíš skript znovu místo ručního dolování. Pro novou šablonu zkopíruj vzor → `signal-rebuild.py`.
- Když „záhadně" chybí varianta: NEJDŘÍV `grep <slug> src/sections/variants.ts` a `git log --oneline -5`.
- Když tsc hlásí chyby v CIZÍM kódu (rozdělaná práce druhé session): oprav chirurgicky z `git show HEAD:...`,
  ne mazáním jejich kódu.

---

## 4. WORKFLOW STAVBY (přesné pořadí — žádné odbočky)

1. **Brief** (max ½ h): přečti §8 (SIGNAL) — je hotový. Nevymýšlej znovu.
2. **Assets NEJDŘÍV**: vyber fotky z existujících `public/templates/*/` (sharp resize → WebP do
   `public/templates/<slug>/img/`). **Každou fotku VIZUÁLNĚ zkontroluj** (sharp → thumb → Read):
   memory past — Unsplash/asset může být úplně jiný motiv, HEAD/název nestačí. Logo: SVG v paletě
   šablony + `logo-white.svg` pro tmavý footer.
3. **Komponenty**: nové varianty jako `if (variant === "<slug>-...")` větve + funkce na KONCI
   příslušného `src/components/sections/*Section.tsx`. Piš je rovnou podle §1 standardu —
   žádný „první nástřel a pak předělám".
4. **Registrace**: entries do `src/sections/variants.ts` (pozor §2.4), industries `["*"]` u
   univerzálních.
5. **Šablona**: `src/templates/<slug>/{template.json, theme.json, content/cs.json, README.md}`.
   - template.json: `skeleton` z `docs/skeletons.json` (SIGNAL → `professional`) + `skippedSections`
     + `extraSections` se zdůvodněním; navbar první, footer poslední.
   - theme.json: fonty přes var() (§2.1) + **presets** (3 moody — engine je už umí, viz §6).
   - content: demo data POVINNĚ — tel `704 123 456`, `email@demo.cz`/`poptavka@demo.cz`,
     `Ukázková 123, 110 00 Praha 1`, IČO `12345678`; žádné reálné značky. CS kompletní, pak EN+SK.
6. **Gate**: `node scripts/validate-template.mjs <slug>` PASS + `npx tsc --noEmit` 0 → **COMMIT**.
7. **Nasazení lokálně**: dev server běží na :3015. Pak:
   ```
   export DATABASE_URL="$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')"
   node scripts/seed-all-templates.mjs --key <slug>
   # tenant: POST /api/onboarding {name,email:'demo@<slug>.test',password:'demo-2026',templateKey,industry,slug:'<slug>-v2'}
   # (před opakováním DELETE FROM tenants WHERE slug=...; DELETE FROM user_accounts WHERE email=...)
   ```
8. **VIZUÁLNÍ SMYČKA — nejdůležitější krok**: screenshot playwright-core
   (`chromium.launch({channel:"chrome"})`, cookie banner: klik "Accept all") po KAŽDÉM celku:
   hero hned po dokončení hero → Read → porovnej se standardem §1 → oprav → až pak další sekce.
   **NIKDY nestav všech 10+ sekcí naslepo a nekoukej až na konec** — přesně to stálo ty peníze.
9. **QA**: zkopíruj `scripts/proof01-qa.mjs` → uprav slug/selektory. Overflow 320–1440 × všechny
   stránky, interakce, konzole. Spusť 2× (§2.7). A11y: aria-checked (ne aria-pressed u radio),
   role="img" na aria-label divech, kontrast na tmavých pozadích (muted ≥ .72 alpha, akcent na tmavé
   zesvětlit — např. #E85A48 místo #C3352B).
10. **Finální commit + memory update** (`project_venom_fable_v3_*` v memory adresáři) + řádek
    v tomto souboru (§9 stav).

## 5. KÁZEŇ SPOTŘEBY (proč proof-01 stál 200 USD a jak to neudělat)

- **Ne-iteruj design.** §1 je schválený standard — postav podle něj napoprvé. Redesign = selhání.
- Screenshotuj brzy a často (levné), nepřepisuj celé komponenty (drahé).
- tsc/validate spouštěj po CELCÍCH, ne po každém řádku.
- Nečti obří soubory celé — greppuj přesné kotvy; sekce-soubory mají 15–36k řádků.
- Velké vkládání kódu dělej python heredoc skriptem (jeden tool call), ne sérií Edit volání.
- Neopakuj průzkum enginu — VŠE podstatné je v tomto souboru + `PROOF_BRIEF.md` + `PROOF_WIX_MATRIX.md`.

## 6. HOTOVÉ CAPABILITIES K REUSE (nestavěj znovu!)

| Capability | Kde | Použití |
|---|---|---|
| Before/after slider | `gallery:proof-01-beforeafter` (GallerySection) | case studies — pro SIGNAL/ATELIER klidně nová varianta se stejným vzorem |
| Sticky mobilní CTA lišta | `navbar:proof-01-navbar` (NavbarSection) | vzor pro každý konverzní navbar |
| Interaktivní pre-selektor + živý výsledek | `hero:proof-01-hero` | SIGNAL: přepínač řešení dle role (§8) |
| Count-up čísla (public-only) | `Pf01CountUp` v StatsSection | zkopíruj vzor |
| **Mood presety** | theme.json `presets` → `GET /api/demo/:slug/theme-presets` → Studio „Vzhled šablony" (design/panels.tsx `MoodPresetyPanel`) | JEN přidej `presets` do theme.json — UI a API už existují |
| **CMS detail** | `src/app/demo/[tenantSlug]/realizace/[itemSlug]/page.tsx` | vzor: data ze section contentu (items+slug), `TenantChrome` (navbar+footer zdarma), gallery sekce s 1 položkou pod STEJNÝM sectionId, contact sekce tenanta, 404, breadcrumb schema. Pro SIGNAL zkopíruj jako `case-studies/[itemSlug]` |
| QA skript | `scripts/proof01-qa.mjs` | zkopíruj + uprav |
| Rebuild skripty | `scripts/proof01-rebuild*.py` | vzor ochrany proti paralelní session |

## 7. EDITOVATELNOST (nutná podmínka DONE)

Každý viditelný text/obrázek = `GenericEditableText` / `GenericEditableImage` s dot-path `field`
(`items.${i}.name`…). Pole arrays: name/description/photo/href per item. Formuláře: honeypot,
GDPR checkbox, stavy sending/success/error (vzor `ContactProof01`). Odkazy resolvovat přes
resolveDemoHref (v admin módu „#").

---

## 8. SIGNAL — BRIEF PŘIPRAVENÝ KE STAVBĚ (šablona 2/10)

**Slug `signal-01`** · archetyp B2B Authority · cíl: kvalifikovaný lead / rezervace konzultace.
Obory: consulting, IT/cybersecurity, finance, právo, HR, logistika, výroba, energetika.

**Vizuální systém — „Swiss authority"** (odlišný od PROOF, stejná úroveň):
- Paleta: charcoal `#101418` (tmavé sekce), electric blue `#2563EB` (akcent), ledová šedá `#F3F5F7`
  (světlá neutrální), bílá; text na světlé `#111827`, muted `#5B6472`.
- Typografie: nadpisy **Oswald** (`var(--font-oswald)`, weight 600, uppercase eyebrows) — jiný
  charakter než PROOF; body Overpass. Precizní modulární mřížka, data-driven vizuál (čísla, grafy-like
  bary CSS, tabulkové srovnání), decentní mono akcenty (`--font-overpass-mono`) pro čísla/labely.
- Hero: cinematic dle §1 — fotka kanceláře/týmu (assety: `reality-*/`, `ucetni-*/`, `lawyer-01/`,
  `legal-02/` — VIZUÁLNĚ ověřit!), overlay, velká typografie; glass panel = **signature interakce:
  „Vyberte svou roli/problém"** (segmented: CEO / IT ředitel / CFO …) → panel živě přepíná 3 bullet
  benefity + relevantní case study číslo + CTA „Rezervovat konzultaci". Vzor pre-selektoru z PROOF.
- Homepage sekce (typy → existující): navbar (`signal-01-navbar` + sticky CTA vzor) → hero
  (`signal-01-hero`) → stats bílý pás (klienti/čísla/certifikace — vzor proof stats) → services =
  „Řešení" karty s fotkami (`signal-01-services`) → about/metodika = číslované kroky na charcoal
  (`services` druhá varianta `signal-01-method`) → case studies s měřitelnými výsledky
  (`gallery:signal-01-cases` — karty fotka + metrika + odkaz na CMS detail) → testimonials (featured
  vzor) → faq (centrovaný vzor + CTA „Rezervovat konzultaci") → contact (`signal-01-contact` — navy→charcoal
  panel + formulář s polem Společnost + select „Co řešíte") → footer.
- Stránky: home, reseni (řešení+metodika), case-studies (listing) + **CMS detail
  `case-studies/[itemSlug]`** (§6), o-firme (stats+tým+testimonials), kontakt. Skeleton `professional`.
- Mood presety: **Corporate** (blue, default) / **Counsel** (deep green #0E6B4F, právo/finance) /
  **Industrial** (amber #D97706 + tmavší charcoal, výroba/energetika).
- Content: konzultační firma „Ukázka Consulting" — konkrétní čísla (snížili jsme náklady o 23 %…),
  demo kontakty dle §4.5, case studies 3 ks s metrikami (slug/title/excerpt/body/metric/industry).

**DONE gate SIGNAL**: validate PASS, tsc 0, QA skript ALL PASS (2. běh), a11y vzory z §4.9,
screenshoty každé sekce porovnané s §1, commit po celcích, memory update.

---

## 9. STAV KOLEKCE
| # | Šablona | Stav |
|---|---|---|
| 1 | PROOF (proof-01) | ✅ DONE — schváleno uživatelem, QA ALL PASS |
| 2 | SIGNAL (signal-01) | ⏭ další — brief §8 |
| 3–10 | ORBIT, ATELIER, MAISON, PERSONA, ACADEMY, JOURNAL, SUMMIT, COMMON | čeká |
