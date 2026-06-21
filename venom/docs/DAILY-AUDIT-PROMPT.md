# Denní audit šablon — prompt pro Opus (3 šablony/den)

Kopíruj tento prompt do nové konverzace, vyplň `<KEY_A>`, `<KEY_B>`, `<KEY_C>` (3 template keys, viz `src/templates/`). Opus projde každou šablonu, opraví nalezené problémy a nahlásí výsledek.

---

```
Spouštím denní audit těchto 3 šablon Venom Phase 3:
- <KEY_A>
- <KEY_B>
- <KEY_C>

Pracovní adresář: /Users/apple/DEV/CRM/venom

Pro každou šablonu projdi a opravv pořadí:

## 1. Rezidua z originálních referencí
Spusť: `node scripts/detect-residues.mjs --key <KEY> --strict`
Pokud najde wp-content/, wixstatic, googletagmanager, nebo origin-host references → vyřeš:
  - wp-content/ paths v content/cs.json → přejmenuj cesty na /uploads/<KEY>/ nebo /assets/<KEY>/, přesuň fyzické soubory (pokud existují), aktualizuj reference
  - wixstatic.com → stáhni obrázek, ulož lokálně, přepiš URL
  - origin-host references (např. "lesarb.cz" v textu) → nahraď za fiktivní brand
  - tracker scripts (GTM/Pixel/Clarity) → odstraň úplně (nemůžou být v šabloně, jen v tenant analytics)
Cíl: 0 findings ve `--strict` módu.

## 2. Multi-tenant napojení (F1 readiness)
Ověř že šablona je seedlá do DB:
  `node -e "import('pg').then(async pg => { const p = new pg.default.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); const r = await p.query(\"SELECT version, jsonb_array_length(default_sections) AS n FROM template_versions tv JOIN templates t ON t.id=tv.template_id WHERE t.key=\$1\", ['<KEY>']); console.log(r.rows); await p.end(); })"`
Pokud chybí: `node scripts/seed-all-templates.mjs --key <KEY>`

Ověř že má alespoň 1 v2 tenant + že se renderuje:
  `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3015/demo/<KEY>-v2`
Pokud 404 → tenant chybí, použij admin UI nebo `createDemoTenantFromTemplate()` přes admin endpoint.

## 3. Univerzální data slots
V `src/templates/<KEY>/content/cs.json` ověř:
  - Pokud má navbar/footer.phone, email, siteName → změň na `{"$slot": "contact.phone"}`, atd. (podle SLOT_REGISTRY v src/lib/data-slots.ts)
  - Pokud nemá brand.name nebo contact.phone → přidej s sensible defaults
Cíl: brand.name, contact.phone, contact.email → reference přes $slot, ne hardcoded
Pak: `node scripts/seed-all-templates.mjs --key <KEY>` (re-seed do DB)

## 4. SEO + structured data
Otevři `src/templates/<KEY>/template.json` a ověř:
  - `industry` field je vyplněno (mapování na schema.org type v src/lib/tenant-seo.ts)
  - Manifest má `pages[0].seo_title` + `seo_description` (default pro per-tenant override)
  - `pages[0].og_image` (relativní cesta, nebo {"$slot":"seo.ogImage"})

V rendered HTML (přes curl /demo/<KEY>-v2) ověř:
  - <title> obsahuje brand.name + tagline
  - <meta name="description"> není prázdná
  - <meta property="og:image"> má relativní URL k webp
  - JSON-LD script s @type matching INDUSTRY_SCHEMA_TYPE

## 5. Image pipeline
Pro každý <img> nebo background-image v content/cs.json ověř:
  - URL končí .webp NEBO je `{"$slot":"..."}` ref na slot, který má WebP variant
  - alt atributy vyplněné (ne prázdné)
  - velikost match s use-case z src/lib/image-slots.ts:
    * hero/banner → 1920×1080 nebo 1920×720
    * gallery tiles → 500×500 nebo 600×400
    * team portraits → 400×500
    * logos → fit:contain, max 400×120
Pokud .png/.jpg → re-upload přes /api/demo/<KEY>-v2/upload-image s targetWidth/targetHeight z IMAGE_SLOTS

## 6. PageSpeed / Core Web Vitals
Spusť: `curl -s -o /tmp/page.html http://localhost:3015/demo/<KEY>-v2 && wc -c /tmp/page.html`
  - HTML size <120 KB (typický cíl pro server-rendered)
  - Žádný inline `<style>` blok >20 KB (raději externí CSS soubor s revisioning)
  - Žádný `<script>` blok >50 KB inline
  - Všechny `<img>` mají `loading="lazy"` kromě hero (`fetchpriority="high"`)
  - Hero image má explicit width+height attributes (zamezí CLS)

## 7. Studio editovatelnost
Otevři `http://localhost:3015/demo/<KEY>-v2?studio=1` (vyžaduje access cookie z admin login):
  - Klik na každou sekci → musí se zobrazit Inspector panel
  - Text fields editovatelné inline (contentEditable)
  - Image fields klikatelné → uploader dialog
  - Sekce lze přesunout (↑↓), skrýt, duplikovat, smazat
Pokud něco nefunguje: src/components/studio/inspector/ContentInspectorTab.tsx mapuje field schema per section type — doplnit chybějící.

## 8. Akceptační kontrola
- [ ] residue scan: 0 findings
- [ ] seed do DB: ok, default_sections nenulové
- [ ] tenant v2 render: HTTP 200
- [ ] slot refs: brand.name, contact.phone, contact.email
- [ ] SEO: title+description+OG+JSON-LD
- [ ] image pipeline: WebP, lazy, dimensions
- [ ] studio: všechny sekce editovatelné

Pokud cokoli nesplnuje → oprav v souborech a re-seed.
Po dokončení napiš shrnutí 3-5 vět: co se opravilo, co zbývá, screenshoty pokud relevantní.

Nejprve si přečti memory:
- /Users/apple/.claude/projects/-Users-apple-DEV/memory/project_venom_phase3_plan.md
- /Users/apple/.claude/projects/-Users-apple-DEV/memory/project_venom_phase3_f1_design.md
- /Users/apple/.claude/projects/-Users-apple-DEV/memory/feedback_section_by_section.md
```

---

## Tipy
- Spouštěj sekvenčně 3 šablony za den, ne víc — kvalitnější výsledek
- Pokud detektor reziduí najde nový pattern, který v scriptu chybí → přidej do `UNIVERSAL_PATTERNS` v `scripts/detect-residues.mjs`
- Pokud SLOT_REGISTRY potřebuje nový klíč (např. `hours.special_open`) → přidej do `src/lib/data-slots.ts` + rerun seed
- Po opravě každé šablony → `git diff src/templates/<KEY>/` pro review před commitnutím

## Strategie publish na homepage
Po úspěšném 8/8 splnění (viz checklist v sekci 8 promptu):
1. Set `tenants WHERE template_key=<KEY> SET status='active'` (přejde z 'demo' do produkce)
2. Šablona se objeví v sitemap.ts + robots.ts allow
3. Optional: registrovat v homepage katalogu (admin UI nebo seed)
