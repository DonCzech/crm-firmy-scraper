# Venom Šablon Redesign Playbook

> **Cíl:** Vylepšit grafiku 90 šablon na luxe/Wix-level kvalitu. **VYLEPŠUJEME, NEMĚNÍME.** Vycházíme ze současného designu šablony (theme.json, template.json spec, existing sekce) a jen ho povyšujeme na maximum krásy. Playbook popisuje POSTUP a TECHNICKÉ patterns.

---

## ⚠️ KLÍČOVÉ PRAVIDLO — POUZE VYKRÁŠLUJEŠ, NESTAVÍŠ ZNOVA (2026-07-01, POVINNÉ)

**Šablonu jen VYLEPŠUJEŠ na maximum krásy — NEDĚLÁŠ novou.**

Vycházíš ze **současného designu šablony** (theme.json paleta, typography, template.json description a industry) a **jen jej zdokonaluješ**, aby byla nádherná. Nevymýšlíš nový vizuální charakter, nepitchuješ alternativní palety/fonty proti tomu co je v theme.json. Pokud šablona má být "tmavá luxe s gold", zůstane tmavá luxe s gold — jen povýšená na Awwwards úroveň.

**Pravidlo "šablony musí být maximálně odlišné mezi sebou" je ZRUŠENO.** Podobnost mezi šablonami je OK (několik dark-luxe-gold šablon vedle sebe je OK, pokud tak vypadají v originále). Cíl je krása KAŽDÉ jednotlivé šablony, ne diverzita portfolia.

- ✅ **Zachovej strukturu** — stejné sekce ve stejném pořadí, stejný layout logic (grid, sidebar, hero position), stejný počet karet/services/USP bodů, stejné section boundaries.
- ✅ **Zachovej industry character** — pokud je to funkční DJ web s vasdj.cz DNA, zůstává funkční DJ web (jen ve verzi která vypadá jako z Awwwards). Nepředěláváš barber-01 na kavárnu.
- ✅ **Zachovej information architecture** — stejný obsah typu (7 USP zůstává 7 USP, 4×2 services zůstává 4×2 services), jen texty rewritnuté per Krok 2c a vizuál povýšený.
- 🚀 **Povyšuješ**: typografii, paletu (do luxe verze stejného směru), spacing, hover animace, decorative motivy, obrázky (Unsplash WebP), micro-interakce, mobile polish. Cílem je **"stejná šablona, jen o třídu krásnější a prémiovější"**.
- ❌ **NEPŘIDÁVEJ nové sekce** které nejsou v původním template.json (nepřidávej testimonials do dj-01 protože ho ta šablona schválně skipuje).
- ❌ **NEODSTRAŇUJ sekce** které tam jsou.
- ❌ **NEMĚŇ industry vibe** — brutalist industrial DJ nemá být najednou romantic serif.

**Test:** Když někdo porovná před/po, musí říct *"to je ta samá šablona, jen mnohem krásnější"* — NE *"to je úplně jiná šablona"*.

Vizuální direkce (Krok 0) tedy říká: **jak povýšit existující charakter na luxe verzi téhož**, ne jak vymyslet nový charakter.

---

## 1. Klíčové architektonické gotchas (Read me first!)

### 1.1 `templates/{key}/skin.css` se NIKAM nenačítá
Soubor `src/templates/barber-01/skin.css` je **orphan** — žádný import. Reálná template-specific CSS pravidla jsou natvrdo v [`src/app/globals.css`](../src/app/globals.css) v sekci `/* ── {key} skin ── */`.

**Důsledek:** Když přidáváš nové hover animace nebo CSS classes, zapisuj je do `globals.css`, ne do template skin.css.

### 1.2 Subpage route MUSÍ volat `resolveAllSections` (FIXNUTO 2026-06-28)
Před opravou: `/demo/[tenantSlug]/[slug]/page.tsx` předával raw `pageSections` do `TenantPublicView` bez merge content_overrides. **Důsledek:** Veškeré DB úpravy přes content_overrides byly na podstránkách ignorovány.

**Pokud se setkáš s "DB úprava se neaplikuje na podstránce"** → zkontroluj že tato oprava drží:
```ts
const rawSections = await getPageSections(tenant.id, tenantPage.id);
const pageSections = await resolveAllSections(tenant, rawSections);
```

### 1.3 Section component reads `section.settings.content` (resolved)
[`SectionRenderer.tsx:17`](../src/components/tenant/SectionRenderer.tsx#L17) čte `section.settings?.content`. Resolver merguje template_defaults + slot refs + content_overrides DO `settings.content`. Komponenta tedy vždy dostává finální merged content.

**Editor compat:** Komponenty musí používat `GenericEditableText`/`GenericEditableImage` s `sectionId` a `field` props — to je nezávislé na obsahu.

### 1.4 Unique constraint na sections (page_id, order_index)
Při insertu nové sekce s `order=0` NEJDŘÍV bumpni ostatní `+ 100`, vlož, pak renumber `0..N`.

---

## 2. Workflow pro každou šablonu

### Krok 0 — Pochop charakter šablony
Než cokoliv napíšeš, zjisti:
- **Industry**: kavárna / holičství / instalatér / kosmetika / hotel / autoškola / atd.
- **Klientela**: luxe / mid-tier / budget / family / corporate / lifestyle
- **Theme.json**: paleta, fonty, radius, spacing personality
- **Original showcase**: jak vypadá živá demo verze (URL šablony na localhost / webero.co)
- **Sections**: kolik a jaké sekce má

Z toho odvoď **vizuální direkci** — barva, typo styl, dekorativní motivy, hover feel, tempo animací, "vibe".

**Příklady různého směru:**
- **barber-01 (Dark Luxury)** → tmavé `#0a0a0a` + studené gold + Montserrat + nůžkové motivy + ostré ostré 2px radius + cinematic hover (lift 8px)
- **barber-02 (Holičství Atelier)** → krémové `#f9f7f5` + warm beige + Libre Baskerville serif + editorial feel + tradiční řemeslo
- **kavárna** → teplé hnědé + handwritten accent + vlnité motivy + slow soft animace
- **instalatér** → modré technical + bold sans + ikonky nástrojů + výrazné CTA
- **floristka** → pastel + organic shapes + script font + jemné fade hover

**KAŽDÁ ŠABLONA JE JINÁ.** Nepoužívej barber-01 patterns (gold scissors, "Klasika & precizní řemeslo" eyebrow) jako šablonu pro všechny.

### Krok 1 — Sekce po sekci
Per [feedback_section_by_section](../../.claude/projects/-Users-apple-DEV/memory/feedback_section_by_section.md): **jdi sekci po sekci, zastav po každé, počkej na OK**.

Pořadí: navbar → hero → ostatní sekce v pořadí dle šablony → footer.

### Krok 2 — Co musíš dodat v KAŽDÉ sekci
Bez ohledu na vizuální direkci, **každá sekce musí mít**:

✅ **Hover animace** — interactive prvky (karty, linky, tlačítka, obrázky, inputy) reagují na hover  
✅ **Mobile responsive** — funguje na všech viewport sizes, hlavně 320-767px  
✅ **`data-template="{key}"`** na top-level `<section>` — pro CSS scope  
✅ **Editor compat** — `GenericEditableText` / `GenericEditableImage` s `sectionId` + `field`  
✅ **Smooth transitions** — `cubic-bezier` easing, NE step  
✅ **Smysluplnou strukturu** — eyebrow / title / subtitle / obsah / CTA hierarchii  
✅ **Editor function audit** — viz Krok 2b — než hlásíš "sekce hotová", ověř že VŠECHNY editor funkce na ní fungují  

### Krok 2b — ⚡ EDITOR FUNCTION AUDIT (per sekce, povinné před "OK")

**Pravidlo (2026-06-30):** Než zastavíš sekci na user OK, projeď ji ve Studiu (`/demo/{tenant}/admin`) a ověř že editor funkce fungují. Pokud něco nefunguje → **opravit hned v rámci té sekce**, NE odkládat na konec. Tímhle tempem ladíme šablonu **i** editor zároveň → žádný velký retro-audit potom.

**Checklist per sekce** (~30 sekund):

1. ✅ **Inline text edit** — klikni na 3-5 random textů (title, eyebrow, body, button label, footer copy). Aktivuje se editor? Změny se uloží do DB (refresh stránku, drží to)?
2. ✅ **Image upload/replace** — klikni na obrázek (hero bg, gallery cell, team portrét, icon). Otevře se image picker? Upload funguje? Alt text editovatelný?
3. ✅ **Section settings panel** — otevři pravý panel (variant switch, palette, layout props, color overrides). Změny se aplikují live? Persistuje to v DB?
4. ✅ **Variant switching** — pokud sekce má variants (např. `gallery-universal` skin/palette), přepnutí ve Studiu funguje a sekce se re-renderuje korektně?
5. ✅ **Drag/reorder** (jen pokud relevantní pro list-type sekce — services, FAQ, testimonials) — `GenericSortableList`, reorder funguje?
6. ✅ **Live preview refresh** — změny ve Studiu se okamžitě projeví v preview pane (NEvyžaduje hard refresh)?

**Pokud něco nejede:**
- Zaloguj přesně co (např. "image upload v gallery vrací 500", "variant switch nezmění layout")
- **Opravit hned** — root cause v komponentě / Studio infrastructure / DB schemě
- Po fixu znovu ověř → pak teprve zastav s user OK

**Co reportovat užvateli při zastavení sekce:**
```
✅ Sekce {název} — vizuální redesign hotov
✅ Editor functions: inline text / image / settings / variants ✓
   (nebo: opraveno X, Y při auditu)
```

Tohle dělá retroaktivní QA zbytečným — každá hotová sekce je už finálně otestovaná.

### Krok 2c — ✍️ PŘEPIS TEXTŮ + 🖼️ UNSPLASH OBRÁZKY (per sekce, povinné, NEW 2026-07-01)

**Pravidlo (platí pro KAŽDOU šablonu, KAŽDOU sekci):**

1. ✍️ **Veškeré texty přepiš na něco jiného** — nikdy nenech původní demo copy (i kdyby "seděl"). Každá sekce dostane **nový, unikátní obsah** který zapadá do vizuální direkce šablony (industry + klientela + vibe). Týká se: eyebrow, title, subtitle, body copy, button labels, list items, testimonial texty, FAQ Q&A, service popisy, team bio, footer copy — VŠE. Důvod: portfolio 90 šablon = 90 unikátních copy stories, žádné duplicity mezi šablonami ani proti původnímu demu.

2. 🖼️ **Veškeré obrázky stáhni z Unsplash a převeď na WebP** — nikdy nenech původní demo obrázky ani placeholdery. Pro každý image slot v sekci (hero bg, gallery cells, team portréty, service images, about photos, testimonial avatary, background textury):
   ```bash
   # 1) Najdi vhodný Unsplash obrázek per charakter šablony
   curl -sL "https://images.unsplash.com/photo-{id}?w=1920&q=88" -o /tmp/src.jpg
   # 2) Převod na WebP
   cwebp -q 88 -m 6 /tmp/src.jpg -o public/templates/{key}/{name}.webp
   # Hero / lossless variant:
   cwebp -lossless /tmp/src.jpg -o public/templates/{key}/hero-bg.webp
   # AVIF pro moderni browsery (volitelné):
   avifenc /tmp/src.jpg public/templates/{key}/{name}.avif
   ```
   Ulož do `public/templates/{key}/` a reference v `content_overrides` v DB. **NIKDY** nenech `images.unsplash.com/...` remote URL v produkci (LCP + CDN závislost).

3. **Konzistence charakteru** — texty i obrázky musí ladit s vizuální direkcí (pokud je to "luxury dark barber", nechoď na "friendly family cafe" fotky ani copy). Klientela + vibe = filtr pro výběr.

4. **Kdy to dělat:** hned při redesignu sekce, PŘED editor audit (Krok 2b). Editor audit pak ověřuje že nové texty/obrázky jde editovat inline.

**Report při zastavení sekce (rozšíření z Krok 2b):**
```
✅ Sekce {název} — vizuální redesign hotov
✅ Texty přepsány (nový copy, ne demo)
✅ Obrázky Unsplash → WebP v public/templates/{key}/
✅ Editor functions ověřeny
```

Animace si vymýšlej podle charakteru šablony. **Příklady patternů, NE preskripce**:
- Karty: lift / tilt / glow / border slide / bg shift / icon rotate
- Obrázky: zoom / parallax / grayscale → color / blur off / overlay reveal
- Linky: underline slide / color shift / arrow nudge
- Tlačítka: shimmer / lift / bg fill / icon move / glow ring
- Inputy: border glow / label float / underline slide

### Krok 3 — Hover animace patří do `globals.css`
- Sekce `/* ── {key} skin ── */` v [globals.css](../src/app/globals.css).
- Cíli přes `[data-template="{key}"] .{class}:hover { ... }`.
- Tím nezasáhneš ostatní šablony.

### Krok 4 — Conditional header (pro sekce co se objevují i na podstránce)
Pokud má šablona podstránky (O nás / Služby / atd.) a sekce se objeví na podstránce kde je už page banner, použij conditional header pattern:

```ts
const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
const titleRaw    = (content as Record<string,unknown>).title;
const subtitleRaw = (content as Record<string,unknown>).subtitle;
const eyebrow  = eyebrowRaw  === undefined ? "Default" : String(eyebrowRaw);
const title    = titleRaw    === undefined ? "Default" : String(titleRaw);
const subtitle = subtitleRaw === undefined ? "Default" : String(subtitleRaw);
const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
```

Empty string z DB skryje element, undefined použije default → na podstránce nastavíš v DB empty stringy a header se nezobrazí.

### Krok 5 — Podstránky (pokud šablona má více pages)
- Hero přepni na **slim banner variant** (`hero-{key}-page` pattern) — ~280-360px banner s breadcrumb + page title.
- Vyprázdni eyebrow/title/subtitle na content sekcích pomocí DB scriptu.
- Test: žádné duplicitní H1/H2 mezi banner a content sekcí!

### Krok 6 — Webero credit v patičce
- Importuj `WeberoCredit` do footer variantu šablony.
- `<WeberoCredit />` v bottom row vpravo dole.
- Cíl: každý hotový web = 1 backlink na webero.co (SEO posílení).

### Krok 7 — Reálné fotky (kde dává smysl)
- Stáhni z **Unsplash** (free license): `curl images.unsplash.com/photo-{ID}?w=900&q=85`
- Konvertuj na **WebP**: `cwebp -q 88 -m 6 img.jpg -o img.webp` (lossy q=82-88 pro fotky, lossless pro hero)
- AVIF parallel: `avifenc --lossless` nebo `--min 28 --max 32`
- Adresář: `public/images/{key}/` (hero, gallery) + `public/images/{key}/team/` (portréty)

### Krok 8 — DB scripts
Tenant content_overrides úpravy přes Node.js + pg:
```js
import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync(".env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url }); await c.connect();
// UPDATE sections SET content_overrides=$1::jsonb WHERE id=$2
await c.end();
```

### Krok 9b — 🎯 ONE-PAGE template pattern (NEW 2026-06-30, viz barber-05/peak-cut)

Některé šablony nemají smysl rozdělovat na podstránky — jsou ONE-PAGE: všechny sekce na homepage + navbar = anchor scroll menu. Použij když:
- malé/single-service podniky (barber, kavárna, fitness studio) bez bohatého obsahu typu blog/portfolio
- obsah by se na podstránkách opakoval (kontakt na /kontakt = kontakt sekce na home)
- uživatel řekne "udělej z toho one-page"

**Recipe (cca 5 minut po dokončení 8 sekcí):**

1. **Section IDs** — každá sekce má `id="<anchor>"` na top `<section>` (hero, services, gallery, about, reference, kontakt). U gallery-universal a sdílených komponent přidej id pokud chybí.

2. **Navbar links → anchors:**
   ```js
   const navAnchors = [
     { href: "#services", label: "Služby" },
     { href: "#gallery",  label: "Galerie" },
     { href: "#about",    label: "O nás" },
     { href: "#reference",label: "Reference" },
     { href: "#kontakt",  label: "Kontakt" },
   ];
   // UPDATE sections SET content_overrides = jsonb_set(..., '{links}', $1::jsonb) WHERE id=<navbar>
   ```

3. **Cross-section CTA hrefs → anchors:**
   - Hero secondaryHref `#about`, primary `#kontakt`
   - About ctaHref `#reference` (nebo `#kontakt`)
   - Services footerCtaHref `#kontakt`
   - Footer links = stejné jako navbar

4. **Smooth scroll CSS** (do globals.css peak-cut skin sekce):
   ```css
   html:has([data-template="<key>"]) {
     scroll-behavior: smooth;
     scroll-padding-top: 80px;  /* offset pro fixed navbar */
   }
   @media (prefers-reduced-motion: reduce) {
     html:has([data-template="<key>"]) { scroll-behavior: auto; }
   }
   ```

5. **DELETE subpages from DB:**
   ```js
   const subs = await c.query("SELECT id FROM pages WHERE tenant_id=$1 AND slug != 'home'", [tenantId]);
   const ids = subs.rows.map(r => r.id);
   await c.query("DELETE FROM sections WHERE page_id = ANY($1::int[])", [ids]);
   await c.query("DELETE FROM pages WHERE id = ANY($1::int[])", [ids]);
   ```
   Pozor: smaž taky u parent/clone tenantů (peak-cut-showcase parent = peak-cut-v2 — obě cleanup).

6. **template.json:**
   - Přidej `"isOnePage": true` flag
   - `pages` array má jen `home`
   - Aktualizuj description ("ONE-PAGE")

7. **Studio default ukáže jen jednu stránku** (homepage) — Studio čte pages z DB, takže když subpages neexistují, page list je prázdný/jen home. Žádná Studio code change není potřeba.

**Anti-pattern:** Nemíchat ONE-PAGE a subpages. Pokud má šablona BLOG / PORTFOLIO / SHOP — NE one-page. Pokud má jen service portfolio info — one-page je čistější.

### Krok 9 — ⚠️ PODSTRÁNKY (NEZAPOMÍNAT!)

**Šablona má obvykle 5-8 podstránek v DB** (i když template.json definuje jen `home`). Najdi je:
```sql
SELECT id, slug, title FROM pages WHERE tenant_id = $1 ORDER BY id;
```

**Pro každou podstránku:**

A) **Vytvoř slim banner hero variant** `hero-{key}-page` — ~320-400px:
   - breadcrumb "Domů / Stránka" + Libre/serif H1 + decorative rule (diamond/dot/whatever charakter)
   - sepia/grayscale/brightness filter na bg image (subdued mood, NE fullscreen)
   - dual hairlines top/bottom konzistentní s ostatními sekcemi
   - data-template + editor fields: title, breadcrumb, breadcrumbHref, backgroundImage

B) **DB switch všech subpage hero sekcí** na nový slim variant + nastav titulek + breadcrumb:
   ```js
   UPDATE sections SET section_variant='hero-{key}-page',
     content_overrides = jsonb_set(content_overrides, '{title}', '"Page Name"')
     || '{"breadcrumb":"Domů","breadcrumbHref":"/"}'::jsonb
   WHERE section_type='hero' AND page_id IN (...subpages);
   ```

C) **Empty duplicate content section headers** na podstránkách (showHeader conditional pattern):
   ```js
   // Na každé subpage pro každou content section (NE hero/navbar/footer):
   ov.eyebrow = ''; ov.title = ''; ov.subtitle = '';
   if (section_type === 'pricing') { ov.rightTitle = ''; ov.leftTitle = ''; }
   ```

D) **Naplň obsah na typed pages** (ne jen empty banner):
   - `/onas` → about section content (eyebrow, title, lead, body, image, year, values)
   - `/faq` → FAQ section content (Q&A items). Pokud subpage má testimonials/jinou wrong section, **změň section_type přes DB** (`section_type='faq', section_variant='barber-dark'`)
   - `/galerie` → gallery + (volitelně) use `gallery-universal` variant
   - `/kontakt` → contact form + opening hours + map
   - `/akce` → promo cards
   - `/sluzby`, `/cenik` → pricing section
   - Bez obsahu zůstanou jen banner + footer = nesmysl

E) **⚠️ ANTI-FLASH: section bg + opacity:0 reveal pattern**
   - **NIKDY nedávej `*-reveal` class s `opacity:0` přímo na `<section>` wrapper.** Při SSR se sekce vyrendruje neviditelná, body bg (default white) prosvítá → bílý flash na refresh!
   - Reveal class patří POUZE na inner elementy (header div, grid div, karty). Sekce musí být vždy visible immediately.
   - Pokud potřebuješ wrapper-level fade-in, použij `animation: ... both` s delay (CSS animation `forwards` na inner elementech) — section sama vždy `opacity:1`.

F) **⚠️ KEYFRAMES PATŘÍ DO `globals.css` — NE inline v komponentě!**
   - Inline `<style>{`@keyframes ...`}</style>` v komponentě se renderuje **JEN když je komponenta na stránce**.
   - Pokud `.section-A-reveal` (opacity:0 → animation s keyframe definovaným inline v Section B) je použit na podstránce kde **Section B nerenderuje** → keyframe chybí → animation se aplikuje na neexistující keyframe → opacity zůstane 0 → **veškerý obsah je neviditelný** (jako prázdná tmavá expanze pod headerem!).
   - **Vždy keyframes do `globals.css`** (sekce `/* ── {key} skin ── */`). Pak jsou dostupné napříč všemi podstránkami nezávisle na tom, která sekce je vykreslena.
   - **Konkrétní bug 2026-06-29 (b03):** `b03TFadeUp` byl jen v TestimonialsSection inline → na /onas (kde testimonials nebyla) zmizel veškerý about+team+cta content. Fix: keyframes do globals.css.

### Krok 10 — Memory zápis
Po dokončení šablony zapiš `project_venom_{key}.md` do memory s checkboxy:
- ✅ N/N sekcí (home)
- ✅ M/M podstránek (slim banner + content)
- ✅ Mobile responsive
- ✅ Hover animace všude
- ✅ Editor compat
- ✅ Webero credit
- ✅ Anti-flash (žádné opacity:0 na section wrapperech)
- Krátký popis **unikátního vizuálního charakteru** šablony (paleta, font, motivy)

---

## 3. Pre-close checklist (kontrola před zavřením šablony)

- [ ] Všechny sekce mají `data-template="{key}"` na top `<section>`.
- [ ] Conditional header pattern (`showHeader` flag) na sekcích co se objevují i na podstránce.
- [ ] Podstránky používají slim banner hero, žádné duplicitní H1/H2 vs banner.
- [ ] Vlastní hover animace na všech interactive elementech (karty, linky, tlačítka, obrázky, inputy).
- [ ] Vychází z původního charakteru šablony (theme.json / template.json) — jen povýšeno, ne přeskočeno na jiný vibe.
- [ ] Mobile responsive (320-767px viewport).
- [ ] `<WeberoCredit />` v patičce vpravo dole.
- [ ] Hero/galerie fotky převedené na WebP (q=82-88, lossless pro hero).
- [ ] Editor compat: všechny texty/obrázky `GenericEditableText`/`GenericEditableImage` s `sectionId` + `field` props.
- [ ] Scroll-down anchor: section `id="..."` + `getElementById` v hero button.
- [ ] DB úpravy přes Node.js + pg script.
- [ ] Memory zápis s popisem unikátního charakteru.
- [ ] **PODSTRÁNKY** — najdi všechny v DB, vytvoř slim banner variant, switch hero, empty duplicate headers, naplň content na typed pages (/onas, /faq, /kontakt, atd.).
- [ ] **Anti-flash check** — žádné `*-reveal` class s `opacity:0` na `<section>` wrapperech. Reveal POUZE na inner elementech.
- [ ] **Keyframes v globals.css** — všechny `@keyframes` šablony do `globals.css` (NE inline v komponentě). Jinak na podstránkách kde sekce nerenderuje keyframe chybí → animation neselže ale opacity zůstane 0 → invisible content.
- [ ] **Unified Gallery** — pokud má šablona gallery section, zvaž použití `gallery-universal` variant s vhodným `skin` + `palette` (viz §10).
- [ ] ⚠️ **100% EDITOVATELNOST** — projeď KAŽDÝ TEXT v šabloně přes `/demo/{tenant}/admin` a OVĚŘ že každý kus textu (eyebrow čísla "01/02/03", section labels "O nás / V číslech / Rezervace", helper texty "nebo zavolejte", footer copy "Všechna práva vyhrazena", breadcrumb, atd.) je klikatelný a editovatelný. **ŽÁDNÝ hardcoded string v JSX není akceptovatelný.** Viz §11.
- [ ] ⚡ **EDITOR FUNCTION AUDIT** (per sekce) — viz Krok 2b. Inline edit, image upload, settings panel, variant switch, drag/reorder, live preview refresh — vše fungovalo na každé sekci v průběhu redesignu. Pokud něco nešlo → opraveno v rámci té sekce (NE odloženo).

---

## 11. ⚠️ KRITICKÉ — 100% editovatelnost přes Studio

**Pravidlo:** Každý viditelný text v šabloně MUSÍ být obalen `<GenericEditableText sectionId field value tag>` — jinak ho uživatel nemůže kliknout/editovat ve Studiu.

**Tahle chyba se opakovala** napříč barber-01/02/03/04 — hardcoded "01", "02", "ESTD. 2014 · BRNO", "nebo zavolejte", "Všechna práva vyhrazena" atd. Uživatel pak nemůže nic upravit přes admin, což je core promise produktu.

### ⚡ MYŠLENÍ BĚHEM TVORBY — ne až na konci

**Otáčí logiku z "napsat hardcoded a později retroaktivně fixnout" na "psát rovnou editovatelně".** Retroaktivní fix je 10× pomalejší (hledat → identifikovat sekci → najít kontext → wrap → DB update → verify) než správně napsat poprvé (přidej `field` jméno a wrap, 5 sekund).

**Pravidlo pro Opus při psaní každého JSX tagu:**

1. Než napíšeš jakýkoli viditelný text v JSX (`>Něco<`), polož si otázku: *"Mohl by uživatel chtít tohle někdy přepsat?"*
2. Pokud ANO (skoro vždy): **napiš to rovnou jako `<GenericEditableText>`** s rozumným default fallback. NIKDY ne `>Foo<` jako "pak to dofixnu".
3. Field jména: krátké, popisné, unikátní v rámci sekce (`eyebrowNum`, `phoneCalloutLabel`, `serviceColumnLabel`, `legalText`, `hoursLabel`, `addressLabel`, `scrollLabel`, `badgeYear`).
4. Default text dej do JSX (`value={String(content.foo ?? "Defaultní text")}`) — DB content_overrides může být prázdné.

**Boilerplate šablona pro každý nový text v JSX:**
```tsx
// Bez ohledu jestli je to label, helper, eyebrow, copyright, breadcrumb, button text:
<GenericEditableText
  sectionId={sectionId}
  field="UNIKATNI_FIELD_NAME"
  value={String((content as Record<string, unknown>).UNIKATNI_FIELD_NAME ?? "Defaultní text")}
  tag="span"  // nebo "p", "h2", atd. dle potřeby
  style={...}  // styles inline jdou jako prop
/>
```

**Časté gotchas:**
- ❌ Helper prefix typu `"nebo zavolejte"` před telefonem — vypadá jako fixed text, ale uživatel ho chce přepsat ("zavolejte přímo", "rezervujte telefonicky")
- ❌ Section eyebrow numbery `"01"`, `"02"`, `"03"` — vypadají decorative, ale uživatel může chtít přečíslovat / smazat / přidat
- ❌ Footer `"Všechna práva vyhrazena"` — drobné, ale uživatel chce právní text vlastní
- ❌ Form labels `"Telefon"`, `"E-mail"`, `"Předmět"`, `"Zpráva"` — uživatel chce vlastní pojmenování
- ❌ Empty-state placeholders `"Mapa — vlož embed"` — OK když zobrazené v admin debugu, ale lépe wrap jako safeguard
- ❌ Badge texty `"Est. 2018"`, `"Brno, Česká republika"` — adresa/rok se mění per tenant
- ❌ Table headers `"Služba"`, `"Cena"` — pricing tabulky uživatel rád přejmenovává
- ❌ Footer column titles `"Kontakt"`, `"Navigace"`, `"Otevírací doba"` — typický 3-col footer header

### ⚡ CLOSEOUT TEST — povinný před DONE (1 příkaz, ~5 sekund)

Spusť tento Python audit script — najde HARDCODED text v JSX `<...>texty</...>` napříč všemi `data-template="{key}"` sekcemi šablony. Output musí být **prázdný** (jen `&ldquo;` / `&rdquo;` decorative entities jsou OK).

```bash
TPL="barber-04"  # ← nahraď klíčem šablony
cd /Users/apple/DEV/CRM/venom/src/components/sections
for f in *.tsx; do
  python3 -c "
import re
with open('$f') as fp: lines = fp.readlines()
ranges = [i for i, line in enumerate(lines) if re.search(r'data-template=\"$TPL\"', line)]
for idx in ranges:
    end = min(idx + 280, len(lines))
    for j in range(idx, end):
        line = lines[j]
        if 'GenericEditableText' in line or 'aria-label' in line or 'aria-hidden' in line: continue
        if 'fontFamily' in line or 'className' in line.strip()[:20] or '<svg' in line: continue
        for m in re.finditer(r'>([^<{>]+?)<', line):
            t = m.group(1).strip()
            if not t or len(t) < 3 or t in ('+','-','/','·','–','—'): continue
            if not re.search(r'[a-zA-ZáčďěíňóřšťúůýžÁČĎĚÍŇÓŘŠŤÚŮÝŽ]', t): continue
            if t.startswith('&') and t.endswith(';'): continue
            print(f'$f:{j+1}: {t!r}')
"
done | sort -u
```

**Pokud má výstup řádky → musíš každý fixnout. Pokud prázdno → editovatelnost OK.**

**Pak ještě manuální spot-check ve Studiu:** otevři `http://localhost:3002/demo/{tenant}/admin`, klikni na ~5 random textů na home + 2 na podstránce. Pokud aktivují editor → DONE. Tento manuální check chytí edge cases co Python audit nepokryl (např. text uvnitř `value=""` props které renderují jako placeholdery, nebo texty mimo `data-template` region kvůli wrapper komponentě).

### Co je TYPICKY hardcoded (a tedy špatně):

- **Industrial numbered eyebrows** (`"01"`, `"02"`, `"03"`...) — vypadají decorative, ale uživatel je chce přepsat na vlastní pořadí/text. → 2 fieldy: `eyebrowNum` + `eyebrow` (nebo `eyebrowText`)
- **Section label texty** (`"O nás"`, `"V číslech"`, `"Rezervace"`, `"Ohlasy zákazníků"`) — i když je defaultní v JSX, MUSÍ být `<GenericEditableText field="eyebrow" value="O nás" ...>`
- **Helper prefixes** (`"nebo zavolejte"`, `"Otevírací doba"`, `"Najdete nás"`) — typicky před tel/email/adresou — VŠECHNY editovatelné
- **Footer legal copy** (`"Všechna práva vyhrazena"`, `"Vyrobil tým..."`) → editable `legalText` field
- **Breadcrumb separators** (`"/"`, `"›"`) — separator může zůstat hardcoded (dekorativní, ale label/href musí být editovatelné fieldy `breadcrumb` + `breadcrumbHref`
- **Form button labels** (`"Odeslat zprávu"`, `"Souhlasím s..."`) — editable `submitLabel` field

### Co MŮŽE zůstat hardcoded:

- Dynamické čísla generované z dat (např. `{idx+1}` ve slide counteru — to není text, to je výpočet)
- Pure decorative separators (SVG ikony, hairlines, dots)
- ARIA labely (`aria-label="Menu"`) — screen reader text, ne UI
- `alt` atributy na rozhodnutí (často editovatelné přes `GenericEditableImage` alt prop)

### Pattern pro eyebrow:

```tsx
// ❌ ŠPATNĚ:
<div>
  <span style={{ fontFamily: "Bebas Neue", ... }}>02</span>
  <span>O nás</span>
</div>

// ✅ SPRÁVNĚ:
<div>
  <GenericEditableText sectionId={sectionId} field="eyebrowNum" value="02" tag="span" style={...} />
  <GenericEditableText sectionId={sectionId} field="eyebrow" value="O nás" tag="span" />
</div>
```

### Pattern pro helper prefix (CTA "nebo zavolejte"):

```tsx
// ❌ ŠPATNĚ:
<span>nebo zavolejte</span>
<a href={`tel:${phone}`}>{phone}</a>

// ✅ SPRÁVNĚ:
<GenericEditableText sectionId={sectionId} field="phoneCalloutLabel" value="nebo zavolejte" tag="span" />
<a href={`tel:${phone.replace(/\s/g, "")}`}>
  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
</a>
```

### Pattern pro footer legal:

```tsx
// ❌ ŠPATNĚ:
<p>© {year} {siteName} · Všechna práva vyhrazena</p>

// ✅ SPRÁVNĚ:
<p>© {year} <GenericEditableText sectionId field="siteName" value={siteName} tag="span" /> · <GenericEditableText sectionId field="legalText" value="Všechna práva vyhrazena" tag="span" /></p>
```

### Closeout test — POVINNÉ před uzavřením šablony:

1. Otevři `http://localhost:3002/demo/{tenant}/admin`
2. Pro každou sekci na home + KAŽDÉ podstránce:
   - Klikni na **každý** viditelný text
   - Pokud kliknutí neaktivuje editor (žádný outline / žádný cursor: text) → text je hardcoded → FIX
3. Tento test je BLOCKER pro pre-close. Bez něj šablona není DONE.

### Pokud najdeš hardcoded:

1. Přidej do komponenty `field` prop s defaultní hodnotou v JSX defaults nebo content lookup
2. Obal v `<GenericEditableText sectionId={sectionId} field="..." value="..." tag="span" />`
3. Použij **unikátní field name** (žádné kolize s ostatními sekcemi — `eyebrowNum`, `legalText`, `phoneCalloutLabel`, atd.)

---

## 4. Globálně sdílené komponenty (k re-use across všech šablon)

### `<WeberoCredit />` — [src/components/WeberoCredit.tsx](../src/components/WeberoCredit.tsx)
Footer credit s UTM linkem na webero.co. Importuj do každého footer variantu.

```tsx
import { WeberoCredit } from "@/components/WeberoCredit";
// V patičce dole vpravo:
<WeberoCredit />
```

Link: `https://webero.co/?utm_source=footer&utm_medium=link&utm_campaign=created_by_webero`  
Hover styly v globals.css (`.bc-webero-credit:hover` — funguje globálně, není scoped na barber-01).

### `GenericEditableText` / `GenericEditableImage` / `GenericSortableList` / `BackgroundEditableImage`
Editor compat wrappers — vždy je použij místo plain `<span>`/`<img>` pro editovatelný obsah ve studiu.

---

## 10. Unified Gallery — `gallery-universal` variant

Místo psaní vlastní gallery sekce pro každou ze 90 šablon → použij **sdílenou univerzální komponentu**:

**Použití v template.json nebo DB:**
```json
{ "type": "gallery", "variant": "gallery-universal" }
```

**Content overrides:**
```js
{
  skin: "tiles" | "wall" | "bento" | "mosaic" | "editorial" | "slider",
  palette: "auto" | "cream-light" | "warm-dark" | "mono-light" | "mono-dark",
  accent: "#c8a96e",            // optional — override gold accent
  eyebrow: "Naše portfolio",     // optional, conditional header
  title: "Vybrané práce",        // optional
  subtitle: "...",               // optional
  images: [{ url, fullUrl, alt }]
}
```

**6 skinů:**
- `tiles` — uniform čtvercová grid 3-col (default), 12px gap
- `wall` — dense edge-to-edge 4-col photo wall, 4px gap (pro photo-heavy showcase)
- `bento` — asymmetric: první 2×2 hero + wide rows mixed
- `mosaic` — multi-aspect ratio (1:1, 3:4, 4:3) s dense flow
- `editorial` — alternating large-image-with-side-caption rows (magazine feel)
- `slider` — horizontal scroll snap s gold scrollbar

**5 palette modes** (driving CSS variables a cursor color):
- `auto` (default) — cream bg, dark text, gold accent
- `cream-light` — krémové pozadí, dark editorial
- `warm-dark` — warm dark bg + warm gold (atelier feel)
- `mono-light` — minimalist white/black
- `mono-dark` — minimalist dark, no gold

**Vše zahrnuto out-of-the-box:**
- Sdílený lightbox s prev/next/counter "01 / 06" + caption + keyboard nav (ESC/←/→) + backdrop-blur
- Custom luxe SVG kurzor (gold expand-corners) **adaptivní podle palette**
- Hover: image zoom 1.06 + filter brightness/saturate reveal + gold corner brackets slide-in + gradient overlay s caption slide-up
- Mobile responsive (všechny skiny mají breakpoints 900/520px)
- Editor compat (všechny stávající `images[]` fieldy preserved + nové optional)

**Soubor:** [src/components/sections/GallerySection.tsx](../src/components/sections/GallerySection.tsx) — funkce `GalleryUniversal`
**CSS:** [src/app/globals.css](../src/app/globals.css) — sekce `/* UNIVERSAL GALLERY */`

**Doporučení:** Pokud nová šablona má gallery sekci a její vizuál fit do jednoho ze 6 skinů → použij `gallery-universal`. Šetří **70-80% času** + konzistentní UX napříč šablonami. Vlastní gallery variant píš jen pokud charakter šablony vyžaduje něco fundamentálně jiného.

---

## 5. Tipy pro vizuální VARIETU napříč 90 šablonami

### 5.1 Paleta — myšlení mimo "luxe gold dark"
- **Earthy**: terracotta + olive + cream
- **Coastal**: dusty blue + sand + white
- **Forest**: deep green + ochre + bone
- **Urban**: charcoal + electric accent
- **Pastel**: blush + mint + lavender
- **Mono**: black/white + 1 accent
- **High-tech**: cyan + navy + lime accent
- **Vintage**: sepia + cream + brick red

### 5.2 Typografie — různé hlasy
- **Editorial luxe**: Libre Baskerville, Playfair Display, Cormorant Garamond
- **Industrial**: Bebas Neue, Anton, Oswald
- **Modern minimal**: Inter, Manrope, DM Sans
- **Friendly**: Poppins, Quicksand, Nunito
- **Handwritten accent**: Caveat, Pacifico, Dancing Script
- **Tech**: JetBrains Mono, Space Grotesk
- **Classic**: Georgia, Lora, Source Serif

### 5.3 Decorative motivy — IND USTRY-specifické, NE univerzální
- Holičství → nůžky, břitva, monogram brackets
- Kavárna → kávová zrna, kruhové ornamenty, vlnky
- Floristka → listy, květinové siluety, organic shapes
- Instalatér → trubky, šrouby, ikonky nářadí
- Hotel → klíče, ornamentální rámečky, art deco
- IT/SaaS → grid lines, čipové vzory, code brackets
- Yoga/Wellness → mandala, lotus, soft circles

### 5.4 Hover feel — různá tempa
- **Snappy** (200ms ease-out): modern tech, urban
- **Smooth** (350ms cubic-bezier): premium retail, luxury
- **Slow elegant** (600ms ease-in-out): editorial, hotel, gallery
- **Bouncy** (cubic-bezier overshoot): kids, food, friendly brands
- **Subtle fade** (250ms opacity): minimalist, professional

### 5.5 Layout patterns — různé struktury
- Centered classic vs. asymmetric editorial vs. magazine grid vs. masonry
- Symetrické 2-col vs. 60/40 split vs. overlapping cards vs. broken grid
- Full-bleed vs. boxed container vs. side rail
- Stacked vs. carousel vs. tabs vs. accordion

---

## 6. Co Webero credit dělá pro SEO

**Strategie:** Každá ze 90 hotových šablon → každý zákazník co si web objedná → footer link na webero.co.

- `rel="noopener"` — NE `nofollow` (chceme link juice)
- UTM tracking → měřitelnost
- `target="_blank"` → neztratí návštěvníka šablony
- Subtle ale viditelné — vpravo dole, ne agresivně

Long-term: 100+ webů × stálý backlink → vysoký domain authority pro webero.co.

---

## 7. Co se za tento playbook NEpovažuje

**❌ Re-použití barber-01 vizuálních patternů na jiných šablonách:**
- Eyebrow s 2 gold hairlines po stranách
- Scissors watermark (industry-specific!)
- Gold corner brackets kolem loga
- Specifické barvy `#C9A84C` apod.
- "Klasika & precizní řemeslo" / "Brno · Od roku 2014" copy patterns

**✅ Co se re-používá:**
- Architektonické fixy (subpage resolveAllSections)
- Pattern conditional header (technický, nezávislý na vizuálu)
- Editor compat wrappers
- WeberoCredit komponenta
- DB scripts pattern
- Image konverze workflow (cwebp / avifenc)
- Memory zápis pattern

---

## 8. Refaktor uvažování — checklist před každou sekcí

Ptej se sám sebe:
1. **Co dělá tato šablona unikátní?** Jaká je její target audience?
2. **Co by udělalo nebýt obvyklého?** (kavárna nemusí mít hnědou, holičství nemusí mít nůžky)
3. **Jaký vizuální tah by zákazníka přesvědčil že je to "wow"?** (asymmetry, parallax, subtle motion, type contrast, white space)
4. **Hover: co by zaujalo bez toho aby to bylo otravné?**
5. **Mobile: jak se chová na 375px?**

---

*Doc updated: 2026-06-29 · Author: Claude + ucet1001@email.cz*
*Předchozí verze docs psaná jako "use barber-01 patterns everywhere" byla chybná — nahrazeno tímto.*
