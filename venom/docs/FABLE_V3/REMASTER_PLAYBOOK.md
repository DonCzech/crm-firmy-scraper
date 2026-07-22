# REMASTER PLAYBOOK — 11 starých šablon na V3 úroveň (běh Fable, 2026-07-21)

> **Pro nového Fable: přečti CELÝ tento soubor PŘED prvním řádkem kódu.** Doplňuje
> `V3_PLAYBOOK.md` (přečti i ten — hlavně §1 design standard, §2 engine pasti, §5 kázeň
> spotřeby). Tento dokument pokrývá to, co je u REMASTERU jinak než u stavby nové šablony:
> pracuješ nad EXISTUJÍCÍMI šablonami, tenanty a obsahem v DB. Nic dalšího nezkoumej.
> Paralelně běží jiný Fable na signal-01 (nové V3 šablony) — nesahej na proof-01/signal-01.

## 0. ZADÁNÍ (od uživatele, závazné)

Kompletně předělat šablony od Sonnetu na awwwards úroveň 2026 („výkladní skříně, žádný
generický odpad"): mezery, menu, typografie, barvy, **výměna fotek**, mobil, funkčnost
Studia, SEO/PageSpeed, rezora + blog moduly zkontrolovat na desktopu i mobilu.

| # | Šablona | Tenant slug | tenant_id | Rozsah | Stav |
|---|---------|-------------|-----------|--------|------|
| 1 | clean-02 | clean-02-demo | 1119 (+showcase 1091) | kompletně + fotky | ✅ DONE |
| 2 | klempir-01 | klempir-01-demo | 1086 | kompletně + fotky | ✅ DONE |
| 3 | ortho-01 | ortho-01-v2 | 684 | kompletně + VŠECHNY obrázky | ✅ DONE |
| 4 | hair-01 | hair-01-v2 | 401 | kompletně | ✅ DONE |
| 5 | hair-02 | hair-02-demo | 414 (+showcase 415) | kompletně | ✅ DONE |
| 6 | hair-03 | hair-03-v2 | 407 (+showcase 420) | kompletně | ✅ DONE |
| 7 | hair-04 | hair-04-v2 | 419 | kompletně | ✅ DONE |
| 8 | kids-01 | **kids-01-showcase** | **873** (+v2 896) | vylepšit + Webero credit | ✅ DONE |
| 9 | lang-01 | **lang-01-showcase** | **884** (+v2 885) | vylepšit + Webero credit | ✅ DONE |
| 10 | malir-02 | malir-02-demo | 1163 | kompletně | ✅ DONE |
| 11 | ucetni-01 | ucetni-01-v2 | 960 | kompletně | ✅ DONE |

**AKTUÁLNÍ BĚH (zadání 2026-07-21, závazný rozsah):** řádky 5–11 = přesně těchto 7 šablon, nic
jiného. Uživatel je kontroluje na produkci `https://webero.co/demo/<slug>`, a to na těchto
tenantech: `hair-04-v2`, `malir-02-demo`, `hair-03-v2`, `hair-02-demo`, `ucetni-01-v2`,
`kids-01-showcase`, `lang-01-showcase`.
⇒ **DB propagaci (reset overrides + designTokens) dělej pro VŠECHNY tenanty daného
`template_id`** (v2 i showcase mají společnou šablonu, ale vlastní `content_overrides` —
jinak zákazník uvidí starý obsah na tom druhém). Kontrolní dotaz:
`SELECT id, slug FROM tenants WHERE template_id = (SELECT template_id FROM tenants WHERE slug='<slug>')`.

Další závazné pokyny uživatele z průběhu:
- **MULTIPAGE povinně** — menu a footer na reálné routy (`/sluzby`, `/o-mne`…), ne #anchory.
  Tenant v DB má často víc stránek, než zná template.json — dorovnat manifest podle DB
  (viz clean-02/klempir-01 vzor: podstránky = navbar + `hero-<key>-page` + sekce + footer).
- **Označení V3**: v template.json `"version": "3.0.0"` + `"tags": ["v3"]`. Klíč šablony NEMĚNIT.
- **Mood presety**: do theme.json přidat `presets` (3 moody) — engine UI/API už existují
  (theme.json → `GET /api/demo/:slug/theme-presets` → Studio Design → „Vzhled šablony — mood
  presety"). Aby fungovaly, KAŽDÁ barva v CSS sekcí musí být `var(--color-*, #fallback)` (§3).
- **Webero credit**: `<WeberoCredit />` (import `@/components/WeberoCredit`) do copyright baru footeru.
- Kontaktní formuláře: REÁLNÝ POST `/api/demo/${tenantSlug}/contact` se stavy
  sending/success/error (+ GDPR poznámka). Sonnet je fake-odesílal přes setTimeout — vždy zkontroluj.
- `hero-<key>-page` podstránkový hero: DB ho u těchto šablon často používá, ale v kódu
  NEEXISTUJE (bug u clean-02 i klempir-01) — doimplementovat + registrovat.

## 1. HOTOVÉ VZORY — kopíruj, nevymýšlej

Dva kompletní referenční remastery (otevři si živě + v kódu):
- **clean-02** „Arctic Editorial": paper `#F4F6F9`, ink `#0B1526`, akcent `#1B5BFF`,
  Bricolage Grotesque + Onest. Bloky: `c02-*`, `c02h-*`, `c02s-*`, `c02p-*`, `c02sv-*`,
  `c02ab-*`, `c02bl-*`, `c02ct-*`, `c02tm-*`, `c02co-*`, `c02ft-*`, `c02hp-*` (page hero).
  http://localhost:3015/demo/clean-02-demo
- **klempir-01** „Copper & Slate": paper `#F5F3EF`, slate `#14171A`, měď `#B4622D`,
  Fraunces + Manrope, radius 4–6. Bloky: `k01-*`, `k01h-*`, `k01ab-*`, `k01sv-*`, `k01g-*`,
  `k01hi-*`, `k01tm-*`, `k01co-*`, `k01ft-*`, `k01hp-*`.
  http://localhost:3015/demo/klempir-01-demo

Per-šablona vždy: vlastní paleta+fonty (žádné dvě šablony stejné), blur/transparent sticky
navbar s underline-slide linky, fullscreen overlay menu (scroll-lock, stagger, Esc),
**sticky mobilní CTA lišta** se safe-area paddingem, editorial eyebrow s linkou (žádný italic
serif), hairline dělítka místo boxů, číslované sekce, foto karty s hover zoomem
(cubic-bezier(0.22,1,0.36,1)), `prefers-reduced-motion` fallbacky, `text-wrap: balance` na H1/H2.
Recenze: iniciálové avatary (NIKDY stock portréty), hvězdy v akcentové barvě. Trust-stripy:
textové wordmarky demo klientů (NIKDY cizí reálná loga — residue z klonů).

**Fonty:** u remasteru se drží zavedený vzor těchto šablon = Google Fonts `<link>` v navbaru
(+ preconnect). To je vědomá odchylka od V3_PLAYBOOK §1 (next/font) — nech to tak, nechceš
předělávat root layout. Každý h1/h2/h3 MUSÍ mít explicitní font-family + color (globals.css
past s Playfair — V3_PLAYBOOK §2.1 platí i tady).

## 2. WORKFLOW PER ŠABLONA (ověřený 2×, drž pořadí)

1. **Před-screenshot + audit**: `node scripts/_shot-master.mjs <slug> <prefix> [subpath]`
   (desktop 1440 + mobil 390, fullPage, výstup do scratchpadu) → Read → sepiš vady.
2. **DB inventura**: `node scripts/_db-query.mjs "SELECT p.slug, s.section_type,
   s.section_variant, s.order_index FROM pages p JOIN sections s ON s.page_id=p.id WHERE
   p.tenant_id=<id> ORDER BY p.id, s.order_index"` — zjistíš reálné stránky/varianty
   (manifest často zná jen zlomek) + jestli je tam `rezora-widget` (nech variantu, zdědí barvy)
   a `blog-preview`.
3. **Fotky NEJDŘÍV** (Unsplash hotlinky `images.unsplash.com/photo-<id>?w=&h=&fit=crop&auto=format&q=80`):
   batch thumbs → `magick montage -font /System/Library/Fonts/Helvetica.ttc -pointsize 13
   -label '%f' *.jpg -tile 4x4 -geometry 280x200+4+24 grid.png` → **Read a vizuálně vybrat**
   (id-čka jsou často úplně jiný motiv!). Smaž <1kB soubory (404). Ověřené sady: §5.
4. **Přepis variant**: bloky v `src/components/sections/*Section.tsx` najdi přes
   `grep -n '── <key>' src/components/sections/*.tsx`. 250řádkové bloky NEpřepisuj Edit
   toolem — **splice node skriptem** podle markerů (vzor v §4). Obsahové klíče (field names)
   zachovej — mapují na DB.
5. **Registrace**: aktualizuj popisy v `src/sections/variants.ts` + přidej `hero-<key>-page`.
   Pozor na `],` v description (validator parser!).
6. **Šablona**: cs.json (python3 json skriptem — multipage links, demo data, nové fotky,
   `hero<Page>` klíče pro podstránky), template.json (stránky dle DB, version 3.0.0, tags v3,
   extraSections s důvody), theme.json (tokens + `presets` 3 moody).
7. **Gate**: `pnpm validate:template <key>` PASS + `npx tsc --noEmit` 0 → **COMMIT HNED**
   (`git add` konkrétní cesty; paralelní session jinak tvé změny smete nebo sloučí do svých commitů).
8. **DB propagace**:
   ```bash
   export $(grep -E '^DATABASE_URL=' .env.local | head -1)
   node scripts/seed-all-templates.mjs --key <key>
   node scripts/sync-template-tenants.mjs --key <key> --fix-versions
   ```
   Pak reset starého obsahu tenanta (residua z klonů!) + nové tokeny — node skript:
   `UPDATE sections SET content_overrides='{}'::jsonb WHERE tenant_id=<id> AND
   section_variant <> 'hero-<key>-page'` (page-hero overrides mají platné titulky, nech je)
   a `UPDATE sections SET settings = jsonb_set(settings,'{designTokens}','<json>')` s paletou
   šablony (klíče: colorPrimary/Secondary/Accent/Background/Surface/Text/TextMuted/Border,
   fontHeading/Body, borderRadius, spacing). Nakonec `touch src/lib/section-resolver.ts`
   (5min template cache).
9. **Vizuální QA**: `_shot-master.mjs` desktop+mobil+aspoň 1 podstránka → Read → oprav.
   Studio: `node scripts/_shot-studio.mjs <slug> <access_token>` (token:
   `SELECT access_token FROM tenants WHERE id=<id>`) — kontrola JS chyb + render.
   Kontakt API: `curl -X POST /api/demo/<slug>/contact` (pozor rate-limit 3/hod/IP).
10. **Memory update** (`project_venom_v3_remaster_run.md`) + stav v tabulce §0 tohoto souboru.

## 3. ENGINE PASTI SPECIFICKÉ PRO REMASTER (nad rámec V3_PLAYBOOK §2)

- **Obsah demo tenantů žije v DB**, ne v cs.json: render = template_versions.default_demo_content
  (ze seed skriptu) ⊕ content_overrides. Overrides drží STARÝ brand z klonů (Modrý Žralok,
  klempirzprahy…) — bez resetu overrides se nové texty NEprojeví.
- **designTokens** = `sections[*].settings.designTokens` (mirror na všech řádcích sekcí);
  TenantPublicView je mapuje na `--color-primary`, `--color-secondary`, `--color-bg`,
  `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-border`,
  `--font-heading`, `--font-body`, `--radius`. CSS sekcí piš `var(--color-primary, #hex)` —
  jinak mood presety a Studio color picker nefungují.
- **Paralelní session**: přepsala mi HeroSection.tsx uprostřed práce (commit „restore z HEAD").
  Po každé sérii splice-ů `grep -c '<tvůj-class-prefix>' <soubor>` a při 0 → znovu aplikuj
  ze scratch souboru. COMMITUJ po každé šabloně. Scratch soubory s bodies drž v scratchpadu.
- **zsh**: `$files` se neexpanduje na slova (žádný word-split) — v perl/grep smyčkách používej
  explicitní výčet nebo `cd` + jmenné argumenty. Bash tool drží cwd mezi voláními — po `cd` do
  scratchpadu se VRAŤ do venom.
- Validator: KAŽDÁ varianta z manifestu musí být v SECTION_VARIANTS; `contact` mimo skeleton
  b2b-trade → přidat do extraSections s reason.
- `_shot-studio.mjs` může na první běh spadnout ERR_EMPTY_RESPONSE (cold compile) — spusť znovu.
- AVIF je zakázán platformou; Unsplash auto=format je OK (servíruje webp).
- Onboarding modal ve Studiu překrývá canvas — do testů klik „Přeskočit".

## 4. NÁSTROJE (existují, nekopíruj slepě — uprav cesty scratchpadu!)

- `scripts/_shot-master.mjs <slug> <prefix> [subpath]` — desktop+mobile fullpage screenshot.
- `scripts/_shot-studio.mjs <slug> <token> <prefix>` — Studio s auth cookie
  `webero_access_<slug>`, loguje pageerror/console.error.
- `scripts/_db-query.mjs "SQL" [json]` — Neon DB (čte DATABASE_URL z .env.local).
- Splice vzor (nahrazení celého bloku komponenty):
  ```js
  const lines = fs.readFileSync(path,'utf8').split('\n');
  const start = lines.findIndex(l => l.startsWith('// ── <key>-<sekce>'));
  const end = lines.findIndex((l,i) => i > start && l.startsWith('// ── <další-blok>'));
  fs.writeFileSync(path, [...lines.slice(0,start), body, ...lines.slice(end)].join('\n'));
  ```
  Pozn.: POZOR, výstupy jednotlivých bloků končí `}` + prázdný řádek; body soubor musí
  obsahovat i úvodní `// ── …` komentář a interface, pokud ho blok měl.

## 5. ORTHO-01 — ✅ DONE (2026-07-21, commit 7f5574e3; sekce níže jen jako referenční brief)

Hotovo vč. DB propagace: podstránkové hero sekce tenanta 684 přepnuty na `hero-ortho-01-page`
s obsahem v overrides, promo vloženo na financovani (footer order 2→3), overrides reset,
designTokens na 26 řádcích, presets API vrací 3 moody. QA: home+sluzby+financovani
desktop/mobil OK, Studio bez JS chyb, kontakt API {"ok":true}. Rezora „clinical" dědí teal.
POZOR: starý blok ortho-01-promo obsahoval i PromoDental01 bez vlastního markeru — při
splice přes markery vždy zkontroluj tsc, komponenta obnovena z HEAD.

**Návrh „Porcelain"**: bg `#FAFAF8`, surface `#fff`, ink `#14201E`, teal `#0F766E`
(accent hover `#0B5D57`), wash `#E9F4F1`, border `#E4E7E3`, muted `#5F6B68`.
Fonty: **Young Serif** (display) + **Outfit** (body). Radius: pill CTA, karty 16–20.

**Co už JE hotové:** `NavbarOrtho01` přepsán (blok `o01n-*` v NavbarSection.tsx: blur bar,
Young Serif wordmark logoLine1/2, teal CTA, overlay menu, sticky mobilní CTA lišta,
var(--color-*) od začátku). tsc PASS. NIC dalšího zatím neměněno.

**Co ZBÝVÁ (v pořadí):**
1. `HeroOrtho01` (HeroSection.tsx `── ortho-01-hero` → end `── dental-01-hero`): split hero —
   vlevo eyebrow + Young Serif H1 (`title`) + `subtitle` + CTA pár + Google rating řádek
   (`googleRating`, `googleReviewCount`, hvězdy v `#F5A623`); vpravo foto karta 4/5 radius 20
   (fotka smějící se ženy) s plovoucím chip „4,8/5 na Google". Obsahová pole zachovat
   (title/subtitle/bgImage→image, googleRating, googleReviewCount).
2. `HeroOrtho01Page` (nová) + dispatch `hero-ortho-01-page` + registrace ve variants.ts —
   vzor `HeroClean02Page`/`HeroKlempir01Page` (porcelain bg, breadcrumb, Young Serif H1).
3. `PromoOrtho01` (PromoSection `── ortho-01-promo` → `── ortho-02-process`): wash `#E9F4F1`
   pás — title + message + teal CTA (obsah: title/message/ctaText/ctaHref).
4. `ServicesOrtho01` („5 důvodů", ServicesSection `── ortho-01-services` → `── ortho-02-services`):
   header + grid: vlevo sticky foto karta, vpravo číslované hairline řádky (items:
   number/name/description/imageUrl — imageUrl jako malý thumb 72px radius 12 u řádku).
5. `TestimonialsOrtho01` (`── ortho-01-testimonials` → `── ortho-02-testimonials`): citát
   lékaře — wash karta split: foto vlevo (imageUrl), vpravo velký Young Serif quote +
   authorName/authorRole/authorBio.
6. `FaqOrtho01` (FaqSection `── ortho-01-faq` → `── faq-fitness-01`): centrovaný úzký sloupec
   max 760px, hairline accordion, kruhový +/× teal toggle (V3_PLAYBOOK §1 FAQ vzor).
7. `ContactOrtho01` (`── ortho-01-contact` → `── ortho-02-contact`): „Kde nás najdete" —
   2 pobočkové karty (branches: city/address/zip/phone/email/hours[]) + teal CTA;
   porcelain karty, hairline řádky hodin.
8. `FooterOrtho01` (`── ortho-01-footer` → `── ortho-02-footer`): tmavý petrol `#0B2E2B`
   footer + WeberoCredit (obsah: siteName/logoLine1/2/tagline/googleRating/address/phone/
   email/social/links).
9. cs.json: nové fotky (níže), multipage navbar links (`/sluzby`, `/financovani`, `/faq`,
   `/blog`, `/kontakt` — DB stránky: home, sluzby, financovani, faq, kontakt + blog modul),
   `hero<Page>` klíče; template.json: stránky dle DB (podstránky s `hero-ortho-01-page`),
   version 3.0.0 + tags v3, extraSections; theme.json: tokens + presets
   (Porcelain teal default / Sky `#2563EB` / Blush `#B4527A` např.).
10. Seed → sync → reset overrides (kromě hero-ortho-01-page) + designTokens tenant 684 →
    touch resolver → screenshoty (home/sluzby/mobil) → Studio smoke → kontakt API test.
    Rezora widget (variant `clinical`) po změně tokenů VIZUÁLNĚ zkontrolovat na home
    (desktop i mobil) — dědí barvy z motivu.

**Fotky ortho — VIZUÁLNĚ OVĚŘENÉ (použij tato id):**
- Hero: `1494790108377-be9c29b29330` (smějící se žena, červený svetr)
- Feature/2: `1508214751196-bcfd4ca60f91` (usmívající se blondýnka venku)
- Feature: `1524250502761-1ac6f2e30d43` (blondýnka přes rameno, smích)
- 3D vizualizace/odbornost: `1588776814546-1ffcf47267a5` (lékař u rentgenů zubů)
- Kontrola/klinika: `1606811841689-23dfddce3e95` (zubař s pacientkou na křesle)
- Interiér kliniky: `1629909613654-28e377c37b09` (moderní ordinace)
- Lékař portrét (Dr. Demo): `1545167622-3a6ac756afa4` (vousatý muž, úsměv)
- Děti/každý věk: `1503454537195-1dcabb73ffb9` (smějící se dítě — pozor, od barev umazané; použij jen malé)

## 5b. HAIR-01 — ✅ DONE (2026-07-21, commity c233a3d4 + 475f7f4a)

„Ivory & Brass" editorial luxe: bg `#F6F3EE`, noir `#14100B`, brass `#A07C33` (hover `#7D6026`),
border `#E6DDD0`, muted `#756A5D`; Libre Caslon Display + Hanken Grotesk; radius 2px. 10 variant
(topbar, fullbleed hero, page hero, about split s brass rámem, foto služby, CTA pás, noir values,
tým 3/4 portréty + mobil scroll-snap, iniciálové recenze, noir footer + WeberoCredit). DB tenant 401:
pořadí home opraveno (hero bylo na pozici 3!), navbar fyzio-01-navbar→hair-01-topbar, junk stránka
`test` smazána, + stránky sluzby/tym/kontakt (kontakt = rezora widget), presets brass/rosewood/graphite.
**NOVÉ PASTI:**
- **GenericEditableImage wrapper dostává inline `position: style?.position ?? "relative"`** — CSS
  třída s `position:absolute` NIKDY nevyhraje. Fullbleed obrázek ⇒ předat `style={{position:"absolute",
  inset:0,width:"100%",height:"100%"}}` PROP + inline styly na vnitřní `<img>`. Jinak img h=0 a
  wrapper v toku odsune obsah (text najednou vpravo).
- Brace-match splice na `function X({...}: Props)` chytne destrukturaci — matchovat od `(` po
  first-column `}`, ne první `{`.
- (page_id, order_index) má UNIQUE — přeuspořádání sekcí dvoufázově (přes +100 offsety).
- Paralelní session vkládá vlastní bloky (esMegaNode duplikát) — po jejích zásazích tsc + dedupe.

## 6. DALŠÍCH 7 ŠABLON — směr (rozpracuj brief per šablona před stavbou, 10 min max)

Každá NOVÁ paleta + fontová dvojice (neopakovat: Bricolage+Onest, Fraunces+Manrope,
Young Serif+Outfit). Kandidátní fonty na Google Fonts: Sora, Space Grotesk, Libre Caslon,
Playfair Display (pozor globals past), Archivo, Epilogue, Gantari, Schibsted Grotesk,
Hanken Grotesk, Crimson Pro, Newsreader.
- **hair-01..04** (kadeřnictví, 4 šablony — každá JINÁ osobnost: např. editorial luxe /
  soft pastel / tmavá barber-adjacent / fresh color-pop). Fotky: salony, střihy, detaily.
  Sdílený brand „Salon" demo. Rezervace? — zkontroluj rezora sekce v DB.
- **kids-01** (dětská skupina/školka?) + **lang-01** (jazykovka): jen VYLEPŠIT (ne full redo)
  + POVINNĚ WeberoCredit do footeru; multipage; fotky zkontrolovat.
- **malir-02** (malíř pokojů): řemeslný vzor jako klempir-01, ale vlastní barva (např.
  ultramarine/ochre) — NEkopírovat copper.
- **ucetni-01** (účetní): professional vzor — data-driven, čísla, tabulky, důvěra.

## 7. STAV & KÁZEŇ

- Commituj po každé šabloně (i WIP na konci session!) s prefixem `feat(venom/remaster):`.
- Po dokončení šablony aktualizuj §0 tabulku + memory `project_venom_v3_remaster_run.md`.
- Neopakuj průzkum: vše o enginu je v tomto souboru + V3_PLAYBOOK.md. Sekce-soubory greppuj,
  nečti celé. Screenshotuj po celcích, ne až na konci.

## 5c. HAIR-02 — ✅ DONE (2026-07-21)

„Blush & Clay" soft pastel: paper `#FBF6F3`, ink `#2A211E`, clay rose `#C0685C`
(hover `#9E5147`), wash `#F3E3DC`, border `#EADDD6`, muted `#7C6B64`; **Newsreader +
Schibsted Grotesk**; radius 20 + pill CTA (vědomý protiklad ostrého hair-01). 10 variant
(`h02n/h02h/h02hp/h02ab/h02ct/h02sv/h02g/h02tm/h02co/h02ft-*`). Presety blush/sage/plum.
Pořadí home přerovnáno na rytmus světlá/tmavá; kontakt dostal REÁLNÝ formulář místo
prázdného bílého boxu; `recenze` doplněna do manifestu; všechny fotky nové.

**NOVÉ NÁSTROJE (použij u zbylých šablon, nepiš znovu):**
- `scripts/_align-tenant-sections.mjs <key> [--keep-overrides v1,v2] [--dry]` — srovná
  sekce VŠECH tenantů šablony podle template.json (varianty, pořadí, chybějící/přebývající),
  resetne overrides a nastaví designTokens z theme.json. Řeší UNIQUE (page_id, order_index)
  dvoufázově přes +1000 offset.
- `scripts/_console-check.mjs <slug> [subpath]` — pageerror/console.error + overflow
  na 320/390/768/1024/1440.

**NOVÉ PASTI:**
- **hair-02 si půjčovalo `hair-01-*` varianty** (testimonials, footer) — po remasteru hair-01
  se do něj propsala cizí identita. U KAŽDÉ šablony zkontroluj `section_variant` cizích prefixů.
- **Rezora `editorial`/`sharp`/`soft`/`clinical` NEBYLY v SECTION_VARIANTS**, přestože je
  používá 114 sekcí v DB → validator FAIL a Studio je neumělo přepnout. Doregistrovány jako
  `industries: ["*"]`. Manifesty starých šablon drží mrtvé bespoke klíče (`hair-02`, `ortho-01`…) —
  při remasteru přepiš na preset, který je reálně v DB.
- **Platformní bugy odhalené QA** (opraveny, týkaly se všech šablon): `fetchpriority` →
  `fetchPriority` v `GenericEditableImage` (invalid DOM property, React error v konzoli);
  `.rz *{box-sizing}` nezahrnovalo `.rz` samotné + mobilní `grid-template-columns:1fr`
  způsobovalo grid blowout ⇒ +20px horizontální overflow na 320px u KAŽDÉ šablony s widgetem.
- Unsplash `&crop=faces` zachrání fotku, kde by centrální ořez ukázal nesmysl (u nás věšák
  s pláštěnkami místo klientky).
- Mřížka galerie se `span 2` výjimkami dělá díry a nerovné řady — jednotné dlaždice 4×2 vyhrály.

## 5d. HAIR-03 — ✅ DONE (2026-07-21)

„Noir & Oxblood" tmavý editorial: bone `#F1EEEA`, noir `#141110`, oxblood `#8E2B36`
(hover `#6E1F28`), border `#E0D9D2`, muted `#6E645D`; **Archivo + Gantari**; radius 0.
11 variant (`h03n/h03h/h03hp/h03ab/h03tm/h03sv/h03g/h03bl/h03rv/h03co/h03ft-*`).
Presety oxblood/brass/steel. Šabloně ÚPLNĚ CHYBĚLY služby, recenze i kontaktní formulář
(kontakt měl generický `default`) — doplněny. Footer byl holý copyright pás → 4 sloupce
+ WeberoCredit. Rozbitý slider s mikro-náhledy → mřížka. Brand residue „petra studio“.

**NOVÁ PAST (stála by hodinu ladění):**
- **`sections.content_source` musí být `'v2'`.** Nově vložené řádky dostanou default
  `'legacy'` a renderer je NEKRMÍ z `template_versions.default_demo_content` ⇒ sekce se
  vykreslí jen s fallback defaulty z komponenty (u hair-03: prázdný ceník, chybějící
  recenze, kontakt bez údajů). `_align-tenant-sections.mjs` už `'v2'` nastavuje.
  Kontrola: `SELECT section_type, content_source FROM sections WHERE tenant_id=<id>`.
  Výjimka: `rezora-widget` nech `legacy` (sync ho drží zamrzlý a renderuje správně).
- Rezora `editorial` preset sází nadpis KURZÍVOU záměrně — font ale dědí z motivu
  správně (ověřeno `getComputedStyle`), takže to není bug; neopravovat.
- `_shot-master.mjs` může chytit stránku uprostřed rekompilace (screenshot 1440×900
  místo plné výšky) — když je výška podezřele malá, spusť znovu.

## 5e. HAIR-04 — ✅ DONE (2026-07-22)

„Studio Pop" svěží pop: cool paper `#F5F4FA`, indigo `#17132A`, violet `#6D4AFF`
(hover `#5233E0`), border `#E4E1F2`, muted `#6A6382`; **Space Grotesk + Epilogue**;
radius 14 + pill CTA. 11 variant (`h04n/h04h/h04hp/h04sv/h04ct/h04ab/h04g/h04rv/h04bl/
h04co/h04ft-*`). Presety pop/citrus/mint. Tím jsou všechny 4 kadeřnické šablony
vizuálně oddělené: hair-01 brass serif · hair-02 clay rose měkká · hair-03 noir ostrá ·
hair-04 violet pop.

Opraveno: kosočtvercové rámy usekávající hlavy → foto karty; křiklavý žlutý pás → violet;
karusel → mřížka; TŘI tmavé sekce za sebou → rytmus; blog na generickém `default` renderoval
u barbershopu kancelářské stock fotky; chyběly recenze i kontaktní formulář; prázdný šedý
box místo mapy (nově se mapa renderuje jen s vyplněným `mapEmbedUrl`, jinak fotka);
navbar vytažen z hera do samostatné sekce; z onepage na multipage.

**NOVÉ v nástrojích:** `_align-tenant-sections.mjs` nově **zakládá chybějící stránky**
(hair-04 měl v DB jen `home`) — u onepage šablon tedy stačí popsat podstránky v manifestu.
POZOR: šablona může mít i test tenanta (`hair-04-test-zz`, id 481) — align jede přes všechny.

## 5f. MALIR-02 — ✅ DONE (2026-07-22)

„Ultramarine & Chalk": chalk `#F5F6FA`, inkoust `#15182B`, ultramarín `#2C49D6`
(hover `#1F35A8`), border `#E1E4EF`, muted `#6B7086`; **Sora + Rubik**. Vědomě NE měděná
(playbook §6 — klempir-01 má copper). Design byl solidní, měnil se hlavně SYSTÉM.

**⚠️ NEJDŮLEŽITĚJŠÍ ZJIŠTĚNÍ BĚHU — obsah tenanta žije na ČTYŘECH místech, ne dvou:**
1. `template_versions.default_demo_content` (ze seedu)
2. `sections.content_overrides`
3. **`sections.settings->'content'`** ← tady přežíval starý brand klonu (31 řádků u malir-02)
4. **`tenant_data_slots`** (brand.name, contact.phone/email/address) ← plní `<title>`, `og:*`,
   `twitter:*` a JSON-LD LocalBusiness. Bez nich zůstane starý brand v `<head>`, i když je
   tělo stránky čisté!
`_align-tenant-sections.mjs` teď maže (3); na (4) je `scripts/_sync-tenant-slots.mjs <key>`.
**Důkaz demo dat dělej vždy na RENDEROVANÉM HTML**, ne v DB:
`curl -s localhost:3015/demo/<slug> | grep -ocE '<reálné jméno>|<reálný telefon>'` → musí být 0.

**Audit slotů napříč rozsahem odhalil další reálně vypadající firmy** (opravit při remasteru):
`lang-01-v2` = „Lingvista akademie“, kurzy@lingvista-akademie.cz, 602 987 543, Nám. Svobody Brno ·
`kids-01-v2` = „Lesní Smečka“, ahoj@lesni-smecka.cz, 775 388 210.

**Další pasti z malir-02:**
- `hero-malir-02-page` používalo 5 podstránek v DB, ale komponenta NEEXISTOVALA (past §0 potvrzena).
- Kontaktní formulář posílal na `/api/contact` místo `/api/demo/<slug>/contact`.
- 0× `var(--color-*)` v 10 komponentách ⇒ mood presety ani Studio color picker nemohly fungovat.
  Tokenizace = mechanická náhrada hexů; POZOR, hero delegoval na komponentu mimo inline blok
  (`HeroMalir02` na ř. ~22974), takže první průchod ho minul a CTA zůstalo oranžové.

## 5g. UCETNI-01 — ✅ DONE (2026-07-22)

„Navy & Gold": paper `#F4F6F9`, inkoust `#0C1B2A`, navy `#17395E` (hover `#0F2942`),
border `#E2E7EE`, muted `#5A6779`; **Plus Jakarta Sans + Inter**. Presety navy/emerald/graphite.

Hotovo: foto karty služeb s cenou místo ikonek v tónovaných čtverečcích · bespoke
`ucetni-01-blog` (generický `default` renderoval CIZÍ demo články a kancelářské stock fotky) ·
`hero-ucetni-01-page` (podstránky používaly homepage hero) · tokenizace 8 komponent ·
WeberoCredit · multipage menu · nové fotky · reference na iniciálová příjmení ·
`template.json.name` byl **„Účetní Služby Králová"** (reálně znějící firma) → „Bilance & Co.".

**Overflow +40 px na 1024 px — VYŘEŠENO.** Příčina nebyla inline šířka: hero i statistiky
používají **flexbox**, takže moje `grid-template-columns: 1fr` pravidlo nemohlo zabrat.
Fix = zvednout vlastní breakpoint komponent z `@media (max-width: 900px)` na `1100px`
(tam už `flex-direction: column` existoval). Poučení: **než píšeš override, zjisti, jestli
je layout flex nebo grid.**
Dále: jantarové přípony čísel (`+`, `%`, `Kč`) měly natvrdo `#FFD87A` ve sdílené
`AnimatedCounter` → `var(--color-primary, …)`; dekorativní růžová PNG „hora"
(`/templates/ucetni-01/grow.png`) odstraněna — tloukla se s navy paletou a §1 blob dekorace zakazuje.

**NOVÁ PAST — tokenizace hexů:** negativní lookbehind `(?<!, )` (chránil fallbacky uvnitř
`var(--x, #hex)`) zároveň PŘESKOČIL hexy v gradientech (`linear-gradient(269deg, #FFFBF1 …`),
takže krémová pozadí a růžové kaňky přežily první průchod. Správně: napřed schovat
`var\(--[a-z-]+,\s*#hex\)` placeholderem, pak nahradit zbytek, pak obnovit.

**NOVÁ PAST — `add_dispatch` u blokových variant:** vkládá řádek ZA kotvu; když je kotva
`if (variant === "x") {`, spadne nový dispatch DOVNITŘ bloku (tsc: „no overlap"). U blokových
kotev vkládej PŘED.

## 5h. KIDS-01 + LANG-01 — ✅ DONE (2026-07-22) · BĚH KOMPLETNÍ

Rozsah byl „vylepšit", ne full redo — obě šablony měly slušný layout, ale tři systémové vady.
Presety: kids forest/sky/sunset · lang indigo/coral/teal. Obě v3.0.0 + tags v3 + WeberoCredit.

**⚠️ NEJZÁKEŘNĚJŠÍ VADA CELÉHO BĚHU — neviditelný obsah:**
Sekce startují na `opacity: 0` a čekají, až jim IntersectionObserver přidá třídu `.vis`.
U kids-01 se observer **nespustil vůbec** (`vis=false` i po plném proscrollování), takže
statistiky, benefity a kontakt byly pro návštěvníka TRVALE NEVIDITELNÉ — jen barevné pásy.
**Konzole přitom mlčela a validate/tsc prošly** ⇒ žádná automatická kontrola to nechytí.
Fix: pojistka `setTimeout(() => setVis(true), 1200)` v každém observer efektu (9 komponent).
Animace musí být bonus, ne podmínka čitelnosti. Kontrola:
```js
[...document.querySelectorAll("section,div")].filter(e => parseFloat(getComputedStyle(e).opacity) < .15 && e.getBoundingClientRect().height > 80).length
```

**PAST V MÉM VLASTNÍM NÁSTROJI:** `_shot-master.mjs` fotil `fullPage` bez scrollování, takže
u šablon se scroll-reveal vracel PRÁZDNÉ barevné bloky → falešně negativní vizuální kontrola.
Nově skript stránku proscrolluje (desktop i mobil) a teprve pak fotí.

**PAST — čeština skloňuje:** hledání residuí na `grep 'Lesní Smečka'` vrátilo 0, ale ve stránce
bylo „Zapište dítě do Lesní Smeč**ky**". Vždy hledej na kmen (`Smeč`, `Lingvist`), ne na 1. pád.
Residua byla ještě ve dvou dalších místech: **`pages.title`** (plní skrytý `<h1>`) a
v **sociálních odkazech** (`facebook.com/lesni-smecka`). Kontrola všech tenantů:
`curl -s localhost:3015/demo/<slug> | grep -ocE '<kmen1>|<kmen2>'` → 0 na v2 i showcase.

Drobné: lang-01 měl v patičce DVA sloupce „Kontakt", druhý prázdný (naplněn na „Škola");
copyright se po přejmenování brandu zdvojil.

## 6b. ZÁVĚREČNÝ SWEEP BĚHU (2026-07-22) — všech 11 řádků §0 je ✅ DONE

Doporučený finální průchod (spustit vždy po dokončení dávky, ne po každé šabloně):
```bash
npx tsc --noEmit                                   # 0
for k in <klíče>; do pnpm validate:template $k; done
for s in <slugy>; do node scripts/_console-check.mjs $s; done   # 0 chyb, 0 overflow
node scripts/_hidden-sweep.mjs <slugy…>            # 0 trvale skrytých bloků
# demo identita — VŽDY na renderovaném HTML, ne v DB, a na KMEN slova:
for s in <slugy>; do curl -s localhost:3015/demo/$s | grep -ocE '<kmen1>|<kmen2>'; done   # 0
```
Výsledek: tsc 0 · validate PASS 7/7 · 0 chyb a 0 overflow na 7 šablonách · 0 skrytých bloků
na 11 tenantech · 0 residuí reálných firem · titulky/og/JSON-LD odpovídají demo identitě.

`_hidden-sweep.mjs` vědomě ignoruje **zavřené overlay menu** (`-ov`/`-overlay`) a **neaktivní
snímky crossfade slideru** (`slide`) — tam je `opacity:0` správně.
