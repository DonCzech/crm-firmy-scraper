# LEGACY AUDIT — peak-cut + cafe-01 (Studio compat upgrade)

**Datum:** 2026-05-29
**Cíl:** Obě šablony vznikly před zavedením pravidel (`docs/MASTER_TEMPLATE_QUEUE.md` + `docs/FAZE_C_PROMPT.md` + skeleton/validator režim). Tento audit vyjmenovává **co je třeba doplnit**, aby byly **plně kompatibilní se Studio** (rozdělení na sekce, posouvání, edit, validátor PASS). Žádné přepracovávání designu — pouze metadata + slug konvence + validátorové škrty.

---

## A. ARCHITEKTURA (oba templaty)

### A1. Chybí `skeleton` field v `template.json`
- **peak-cut**: chybí `"skeleton": "service-personal"`
- **cafe-01**: chybí `"skeleton": "gastro"`
- Důsledek: validátor padá s "Skeleton 'service-personal' — chybí sekce: …" protože implicitně dopočítá skeleton dle industry, ale nemá `skippedSections[]`.

### A2. Chybí `skippedSections[]` a `extraSections[]`
- Validátor vyžaduje deklaraci vynechaných pozic skeletonu (pos + name + reason).
- **peak-cut** ⇒ skip: Pricing (5), Team (7), Booking/CTA (9), FAQ (11).
- **cafe-01** ⇒ skip: Menu (4), Gallery (5), Locations (7), Testimonials (8), Events (9), FAQ (10).

### A3. Chybí `sectionOrderNote`
- Není kritické pro validátor, ale standard po 2026-05-27 vyžaduje text odůvodnění pokud se pořadí liší od skeletonu.

### A4. Inkonzistentní slug naming engine tenantu (legacy)
Před 2026-05-27 ještě nebyla konvence `-v2` pro master.

| Template | Aktuální master slug v DB | Očekávané dle standardu | Status |
|----------|---------------------------|--------------------------|--------|
| peak-cut | `barber-01` (id 339 je `peak-cut-demo` — clone, NIKOLI master!) | `peak-cut-v2` | ⚠️ Master pravděpodobně `barber-01` (legacy); `peak-cut-v2` neexistuje |
| cafe-01  | **chybí master** — `cafe-01-v2` ani `cafe-01` neexistuje | `cafe-01-v2` | ❌ Master tenant chybí úplně |

### A5. Showcase mají špatný `parent_tenant_id`
DB stav:
```
peak-cut-showcase  → parent_tenant_id = 339 = peak-cut-demo (CLONE, ne master!)
cafe-01-showcase   → parent_tenant_id = 328 = cafe-01-demo  (CLONE, ne master!)
```
Showcase má **mířit na master engine tenant**, ne na clone. Toto byl bug při původním seed:showcase před zavedením přísnější konvence.

---

## B. peak-cut (Peak Cut — Minimal White, industry `barber`)

### B1. Manifest gaps (`src/templates/peak-cut/template.json`)
- ❌ `skeleton` (doplnit: `"service-personal"`)
- ❌ `skippedSections[]`: Pricing (services už obsahuje ceny ve variantě `pricing-rows`), Team, Booking/CTA, FAQ
- ❌ `sectionOrderNote` (volitelné — pořadí kopíruje skeleton)
- ❌ `description` (rozšířit pro `/preview-2` kartu)

### B2. Strana sekcí — VŠECHNY OK pro Studio
Sekce homepage v `template.json:pages[0].sections[]`:
```
navbar (default) · hero (hero-full-bleed) · about (two-col) · services (pricing-rows)
· gallery (default) · testimonials (default) · contact (default) · footer (light)
```
- Každá je samostatný řádek → tenant-factory vytvoří 8 nezávislých `page_sections` řádků
- Každá má `contentRef` → resolvuje z `content/cs.json` top-level klíčů `navbar/hero/about/services/gallery/testimonials/contact/footer`
- Sekce typu jsou v `SECTION_RENDERERS` (`src/sections/registry.ts`) → renderovatelné
- Varianty existují v `SECTION_VARIANTS` (`src/sections/variants.ts`):
  - `default` (navbar/gallery/testimonials/contact) → catch-all fallback ✅
  - `hero-full-bleed` → `HeroSection.tsx:170` ✅
  - `two-col` → `AboutSection.tsx:156` ✅
  - `pricing-rows` → `ServicesSection.tsx:396` ✅
  - `hero-centered` → catch-all default v `HeroSection.tsx` (řádek 559 komentář) ✅
  - `light` (footer) → `FooterSection.tsx:587` ✅

### B3. Editovatelnost (Studio compat)
Spočítané `GenericEditableText/Image` výskyty per komponenta (≥ 1 = editovatelné):
- `HeroSection` 40 calls · `AboutSection` 27 · `ServicesSection` 37 · `GallerySection` 8 · `TestimonialsSection` 13 · `ContactSection` 10 · `FooterSection` 62

→ **Všech 8 sekcí peak-cut homepage je editovatelných.** Subpage sekce taktéž (sdílí stejné komponenty).

### B4. Studio ops (duplicate / delete / reorder / hide)
Tato pravidla jsou implementována v Studio shell, nikoliv per-section. Pokud Studio shell funguje pro barber-04, funguje pro peak-cut (sdílený engine).

### B5. Doporučené content keys (per validátor)
- `navbar.logoUrl` — v `peak-cut/content/cs.json` možná chybí (audit nemá ověřeno)
- `gallery.images[].url` — ověřit, že `gallery` má `images[]`
- `hero.title` — povinný (auto-warning pokud chybí)

### B6. Subpages (peak-cut)
Definované 3 subpages: `o-nas`, `galerie`, `kontakt`. Strukturálně OK (každá page má vlastní sections[] + contentRef přes `pages.<slug>.…`).

### B7. Tenant seed
Chybí `scripts/seed-peak-cut.mjs` (analogie `seed-barber-04.mjs`) na vytvoření `peak-cut-v2` (master engine tenant). Bez něj `/preview-2` nemůže ukázat aktuální peak-cut engine.

### B8. Showcase
- `peak-cut-showcase` (id existuje) má **vadný `parent_tenant_id` = 339** (ukazuje na clone). Po vytvoření `peak-cut-v2` (master id) je nutné updatovat `parent_tenant_id` v DB.

---

## C. cafe-01 (Cafe — Vlna kávy, industry `cafe`)

### C1. Manifest gaps (`src/templates/cafe-01/template.json`)
- ❌ `skeleton` (doplnit: `"gastro"`)
- ❌ `skippedSections[]`: Menu (4 — homepage nemá ceník, je na `/nabidka/`), Gallery (5), Locations (7 — adresy v `kavarny`), Testimonials (8), Events (9), FAQ (10)
- ❌ `extraSections[]`: deklarovat `blog-preview` jako `pos: ?, name: "Blog preview", reason: "originál costa-coffee má karuselový blok článků v hero/about místo gastro-menu"`
- ❌ `sectionOrderNote`

### C2. Sekce homepage
```
navbar (default) · hero (hero-cafe-wave) · about (cafe-loyalty-tilted)
· blog-preview (cafe-filled-cards) · cta (cafe-magazine) · footer (default)
```
- Každá samostatný řádek → 6 `page_sections` řádků
- `contentRef` resolvované z top-level klíčů
- Sekce + varianty existují:
  - `hero-cafe-wave` → `HeroSection.tsx:107` ✅
  - `cafe-loyalty-tilted` → `AboutSection.tsx:24` ✅
  - `cafe-filled-cards` → `BlogPreviewSection.tsx:36` ✅
  - `cafe-magazine` → `CtaSection.tsx:150` ✅
  - `default` (navbar/footer) → fallback ✅

### C3. Editovatelnost
- `BlogPreviewSection` nebyl auditován počtem `GenericEditable` calls — ověřit.
- Jinak komponenty `Hero/About/Cta/Navbar/Footer` mají editable wiring (viz B3).

### C4. Studio ops
Stejně jako peak-cut — shared Studio shell, funguje pro barber-04, funguje pro cafe-01.

### C5. Subpages (cafe-01)
Definované 4 subpages: `kavarny`, `nabidka`, `o-nas`, navíc 1 chybí v auditu (z `head -60` viděno 3 — manifest má víc, ověřit). Každá má vlastní sections[] s contentRef přes `pages.<slug>.…`.

### C6. Variant `contact:split` — ověřit
`pages.kavarny` používá `contact:split`. V `ContactSection.tsx` se nenašel explicit `variant === "split"` — pravděpodobně fallback. Doporučení: ověřit ve `variants.ts` katalogu, jinak validátor (`(type, variant)` check) selže.

### C7. Tenant seed
Chybí `scripts/seed-cafe-01.mjs`. Master tenant `cafe-01-v2` neexistuje. **Nutné založit.**

### C8. Showcase
- `cafe-01-showcase` (id 328 = `cafe-01-demo` clone!) má **vadný `parent_tenant_id`**. Po vytvoření `cafe-01-v2` updatovat.

---

## D. PLÁN OPRAV (minimalisticky — žádné překreslování designu)

### D1. peak-cut
1. **template.json**:
   - přidat `"skeleton": "service-personal"`
   - přidat `"skippedSections": [...]` (4 položky)
   - rozšířit `description`
   - sjednotit `version` semantiku (zachovat 1.0.0)
2. **scripts/seed-peak-cut.mjs** — analogicky `seed-barber-04.mjs`, slug `peak-cut-v2`
3. **DB migrace** — po seedu nového master tenantu:
   ```sql
   UPDATE tenants SET parent_tenant_id = (SELECT id FROM tenants WHERE slug='peak-cut-v2')
   WHERE slug='peak-cut-showcase';
   ```
   (jen pokud user zachová stávající showcase — alternativně smazat + re-seed `pnpm seed:showcase peak-cut`)
4. **api/onboarding** enum — `peak-cut` už je povolený, OK
5. **validátor** — re-run `pnpm validate:template peak-cut` → PASS

### D2. cafe-01
1. **template.json**:
   - přidat `"skeleton": "gastro"`
   - přidat `"skippedSections": [...]` (6 položek)
   - přidat `"extraSections": [{ "name": "Blog preview", "type": "blog-preview", "variant": "cafe-filled-cards", "reason": "originál má karuselový blok místo menu — zachováno pro paritu s costa-coffee scrape" }]`
   - rozšířit `description`
   - ověřit `contact:split` v `variants.ts` → případně doplnit
2. **scripts/seed-cafe-01.mjs** — analogicky
3. **DB migrace** — viz D1.3
4. **validátor** — re-run

### D3. Žádné design změny
- Vizuální layout, fonty, barvy, sekce **ZŮSTÁVAJÍ NEDOTČENÉ**.
- Pouze metadata + seed scripts + DB linking. Studio compat **už funguje** (variants existují, GenericEditable je v komponentách, sekce jsou samostatné records v DB).

---

## E. ŠTÍTKY (souhrn před implementací)

| Položka | peak-cut | cafe-01 |
|---------|----------|---------|
| `template.json` skeleton + skippedSections + extraSections | ❌ chybí | ❌ chybí |
| `template.json` description / sectionOrderNote | ⚠️ stručné | ⚠️ stručné |
| `content/cs.json` strukturálně OK | ✅ | ✅ |
| Variants existují v `variants.ts` | ✅ | ⚠️ `contact:split` ověřit |
| Variants existují v `Section.tsx` | ✅ | ✅ |
| `GenericEditable` wiring | ✅ | ⚠️ blog-preview ověřit |
| Master tenant (`<slug>-v2`) | ❌ chybí (legacy `barber-01`) | ❌ chybí |
| `seed-<slug>.mjs` script | ❌ chybí | ❌ chybí |
| Showcase `parent_tenant_id` správný | ❌ ukazuje na clone | ❌ ukazuje na clone |
| `pnpm validate:template <slug>` PASS | ❌ FAIL (skeleton missing) | ❌ FAIL (skeleton missing) |
| Studio ops fungují (shared shell) | ✅ teoreticky ano | ✅ teoreticky ano |

---

## F. Doporučený postup implementace (po schválení auditu)

1. **template.json** edit oba (10 min každý)
2. **`scripts/seed-peak-cut.mjs` + `scripts/seed-cafe-01.mjs`** (5 min každý)
3. **Spustit `pnpm validate:template peak-cut`** + `cafe-01` → PASS
4. **Spustit seed scripts** → master `peak-cut-v2` + `cafe-01-v2` v DB
5. **DB migrace showcase parent_tenant_id** (1 SQL update na každou šablonu)
6. **`/preview-2` ověřit** → obě karty správně linkují na master + showcase
7. **`/demo/peak-cut-v2/studio`** + `/demo/cafe-01-v2/studio` → klik test základních ops
8. **Update `MASTER_TEMPLATE_QUEUE.md`** — zachovat DONE status, ale doplnit poznámku „studio-compat upgrade 2026-05-29"

**Žádné nové sekce, žádné nové komponenty, žádné nové variants** (kromě případně `contact:split` katalogu).

## Status
`READY_FOR_FIX` — po schválení auditu provedu D1–D2 + D3 + ověření.
