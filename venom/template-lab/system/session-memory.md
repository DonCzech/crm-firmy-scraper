# Template Intelligence Lab — Session Memory

> **Pokud otevřeš nové okno VS Code a napíšeš "pokračuj" — přečti tento soubor jako první.**

## AKTUÁLNÍ STAV

- **Fáze:** Pilot — barbershopurban.cz
- **Status:** Čeká na zpracování
- **Další krok:** Spusť analýzu přes `/api/template-lab/analyze` POST s `{ url: "https://barbershopurban.cz" }`
- **Čeká na schválení:** nic

## ARCHITEKTURA PROJEKTU

### Framework
- Next.js 16.2.2, App Router, TypeScript, Tailwind CSS 4
- PostgreSQL (Neon), Vercel Blob
- Port: 3015

### Klíčové cesty
- Šablony: `/src/lib/templates/` — statické TypeScript definice
- Live editor: `/src/components/tenant/TenantEditorView.tsx`
- DB schema: `/src/lib/db.ts`
- Tenant public: `/demo/[tenantSlug]/`
- Admin: `/demo/[tenantSlug]/admin/`
- Platform admin: `/admin/`

### Template Intelligence Lab
- Systémové soubory: `/template-lab/system/`
- Research data: `/template-lab/research/{industry}/{domain}/`
- Generated templates: `/template-lab/generated/{industry}/{templateSlug}/`
- API: `/src/app/api/template-lab/`
- Admin UI: `/src/app/admin/template-lab/`

## WORKFLOW PRAVIDLA

1. Zpracovávej jeden web po druhém
2. Po každém webu počkej na manuální schválení
3. Teprve po schválení pokračuj dál
4. Nikdy nezačínej znovu od začátku pokud existuje workflow-state.json

## NAMING CONVENTIONS

- Template slug: `{industry}-{descriptiveName}` (např. `barber-urban`, `wellness-ananda`)
- Editable IDs: `{section}.{field}` (např. `hero.title`, `services.items`)
- DB tabulky: `template_lab_*` prefix

## DATABÁZOVÉ VAZBY

Nové tabulky template labu:
- `template_lab_sources` — seznam webů k analýze
- `template_lab_jobs` — analytic jobs (stav, logy)
- `template_lab_snapshots` — raw scraped data
- `template_lab_design_tokens` — extrahované design tokeny
- `template_lab_generated` — vygenerované šablony (stav: draft/review/approved/published)
- `template_lab_publish_log` — log publikací

## LIVE EDITOR CONVENTIONS

Každý element šablony musí mít:
```html
data-editable-id="{section}.{field}"
data-editable-type="text|image|richtext|link|button|color|gallery|pricing|services|reviews|contact"
```

Typy editovatelnosti v live editoru:
- `text` — jednoduchý text
- `richtext` — HTML obsah
- `image` — obrázek (upload/replace)
- `link` — URL + text
- `button` — CTA button (text + href + style)
- `color` — barva (hex)
- `gallery` — galerie obrázků (repeater)
- `pricing` — ceník (repeater)
- `services` — seznam služeb (repeater)
- `reviews` — recenze (repeater)
- `contact` — kontaktní blok
- `section-visibility` — viditelnost sekce

## KNOWN ISSUES
- Žádné zatím

## TODO
- [ ] Pilot: barbershopurban.cz scraping
- [ ] Generování Venom šablony
- [ ] Admin UI v `/admin/template-lab`

## PENDING REVIEWS
- Žádné zatím

## PERFORMANCE TARGETS
- Lighthouse Desktop: 100/100
- Lighthouse Mobile: 95-100
- SEO: 100
- Best Practices: 100
- Accessibility: 95+
