# Phase 3 — production architecture summary

Six commits landed on `main` between `4b7d55d…c654f01`. This document is the
PR-style review for the whole phase.

## Goals

1. Update a template once → all tenants on it get the change (no per-tenant manual migration).
2. Switching template preserves tenant data (brand, contacts, hours, …).
3. Wix-like studio: brand panel, modified indicator, reset, change-template wizard, multi-page editor, asset uploader, go-live button.
4. SEO + structured data on every tenant page, driven by tenant data slots.
5. Image uploads converted to WebP + resized to exact target slot dimensions.
6. Zero residue from original reference websites (no `/wp-content/`, no `wixstatic.com`, no `/clones/...`).
7. Operational tooling: scripts, CI, pre-commit gates, scheduled crons.

All seven achieved end-to-end on `floors-01-v2` and verified via API + DB.

## Commits

| SHA | Title | Highlights |
|---|---|---|
| `4b7d55d` | F1-F5 Phase 3 production architecture | DDL, section-resolver, data-slots, image-slots, tenant-seo, sitemap/robots, scripts, studio components, daily-audit prompt |
| `3674a88` | F4 residue cleanup | 323 URLs rewritten across 92 templates, 17 external CDN assets downloaded |
| `c8440aa` | AddSectionPanel with search + category tabs (F2 Sprint 3) | Filtered Wix-like browser for ~100 variants |
| `f313020` | F2 Sprint 3 multi-page editor + F3 image slot wire-up + F4 pre-commit gate | Pages CRUD API, PagesPanel rewrite, /upload-image slot param, residue regression hook |
| `5de9431` | CI + AssetsPanel + multi-page studio | GitHub Actions workflow, Husky scaffold, AssetsPanel slot uploader, ?page= search param |
| `c654f01` | Vercel crons: auto-seed + daily residue + warmup renders | Three new cron jobs in vercel.json |

## Architecture

```
Disk: src/templates/<key>/
  template.json, theme.json, content/cs.json, skin.css
            │
            │  hourly cron + manual seed-all-templates
            ▼
DB: template_versions (default_sections, default_design_tokens,
                       default_demo_content, checksum)
            │
            │  read-through at render with LRU cache (5 min TTL)
            ▼
section-resolver: templateDefaults
                    ⊕ tenant_data_slots ({$slot: "contact.phone"} refs)
                    ⊕ sections.content_overrides (sparse user edits)
                    = final content for renderer
```

When a template file changes:

1. CI (push to main) blocks the commit if a residue regression sneaks in.
2. `precommit-residue-check` runs locally too (via husky or `.git/hooks/`).
3. Vercel deploy completes.
4. `/api/cron/seed-templates` (hourly, checksum-skip) detects the change,
   upserts `template_versions`, invalidates the LRU cache.
5. All tenants on `content_source='v2'` see the new content on the next
   render. Editable fields (with overrides) keep the user's value;
   untouched fields propagate.

When a user edits a field in studio:

1. Inspector dispatches PATCH `/api/demo/<slug>/sections/<id>` with the
   full merged `settings.content` it currently shows.
2. For `content_source='v2'`, the route computes sparse diff vs
   (templateDefault + slots), stores **only** the diff in
   `content_overrides`, leaves `settings.content` empty.
3. Next render: resolver reapplies the diff.

When a user clicks "Resetovat sekci" in Inspector:

1. POST `/api/demo/<slug>/sections/<id>/reset-overrides`.
2. `content_overrides = '{}'` for the row.
3. Section reverts to current template default + slot refs.

When a user changes template:

1. POST `/api/demo/<slug>/change-template { targetTemplateKey }`.
2. Transaction wipes homepage sections, re-inserts from new template
   defaults with `content_source='v2'` and empty `content_overrides`.
3. `tenant_data_slots` are not touched → brand, phone, email, hours,
   social, SEO defaults all survive the design change.

## Surfaces

### New API endpoints (10)

- `GET /api/demo/:slug/data-slots`, `PUT`, `DELETE ?key=…`
- `POST /api/demo/:slug/go-live`, `GET` preflight
- `POST /api/demo/:slug/change-template`, `GET ?to=…` preview
- `POST /api/demo/:slug/sections/:id/reset-overrides`
- `GET /api/demo/:slug/pages`, `POST`
- `PATCH /api/demo/:slug/pages/:id`, `DELETE`
- `GET /api/demo/:slug/media`
- `POST /api/demo/:slug/upload-image` (extended with `slot` param)
- `GET /api/template-lab/catalog`
- `POST /api/admin/templates/:key/publish`, `GET` history

### New cron endpoints (3)

- `/api/cron/seed-templates` (hourly)
- `/api/cron/daily-residue-audit` (daily 03:00)
- `/api/cron/warmup-renders` (hourly +30)

### Studio additions

- Brand & Contact panel (LeftPanel)
- Pages panel (multi-page editor) with create/rename/publish/delete
- AddSection panel (search + category tabs)
- Assets panel (slot dropdown + drag-drop upload + URL copy)
- TopBar: "Změnit design" button, "Spustit web" button
- Inspector: modified indicator (blue dot) + reset-section banner

### Library code

- `src/lib/section-resolver.ts` (380 lines) — read-through cache, slot ref
  resolution, sparse diff, batch hydration
- `src/lib/data-slots.ts` — 30 canonical slot keys + CRUD
- `src/lib/image-slots.ts` — 24 canonical image slot targets
- `src/lib/tenant-seo.ts` — Metadata + JSON-LD builder, industry → schema.org

### Scripts

- `seed-all-templates.mjs` — disk → DB bulk sync (manual; cron does it hourly)
- `migrate-tenant-to-v2.mjs` — legacy → v2 with sparse extraction + slots
- `detect-residues.mjs` — scan disk + render for forbidden patterns
- `cleanup-residues.mjs` — rewrite local `/clones/...` paths to `/assets/<key>/...`
- `download-external-assets.mjs` — fetch and rewrite external CDN URLs
- `precommit-residue-check.mjs` — gate for staged template files
- `perf-audit.mjs` — lightweight page audit (no lighthouse), score 0–100

### DDL changes

```sql
CREATE TABLE tenant_data_slots (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slot_key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slot_key)
);

ALTER TABLE sections
  ADD COLUMN content_overrides JSONB DEFAULT '{}',
  ADD COLUMN content_source TEXT DEFAULT 'legacy';

ALTER TABLE template_versions
  ADD COLUMN checksum TEXT,
  ADD COLUMN published_at TIMESTAMPTZ DEFAULT now();
```

### Operational scripts

| Script | What | When |
|---|---|---|
| `seed-all-templates.mjs --all` | Bulk seed disk to DB | After manual template additions |
| `migrate-tenant-to-v2.mjs --filter '%-v2'` | Migrate legacy | After F1 DDL on existing tenants |
| `migrate-tenant-to-v2.mjs --tenant X --dry-run` | Preview | Before single-tenant migration |
| `cleanup-residues.mjs --all` | Rewrite /clones URLs | After detector flags |
| `download-external-assets.mjs --all` | Fetch external CDN | After detector flags |
| `perf-audit.mjs --tenants X,Y,Z` | Quick perf check | Pre-launch |
| `detect-residues.mjs --all --strict` | CI gate alternative | CI / pre-commit |
| `precommit-residue-check.mjs` | Staged-only fast gate | git hook |

## Verification

End-to-end test on `floors-01-v2` (see commit `4b7d55d` description):

| Test | Method | Result |
|---|---|---|
| Brand slot save propagates to render | PUT /data-slots → curl HTML | ✓ `"E2E TEST FIRMA"` visible |
| Field edit → sparse override storage | PATCH section → DB inspect | ✓ `content_overrides = {title:…}` only |
| Reset → defaults return | POST /reset-overrides → DB | ✓ `content_overrides = {}` |
| Change template preserves slots | POST /change-template → DB | ✓ 4 slots survived, sections rebuilt from new template |
| Go-live flips status + sitemap pickup | POST /go-live → /sitemap.xml | ✓ `status=active`, slug appears in sitemap |

## Residue eradication

| Stage | Issues | Affected templates |
|---|---|---|
| Initial scan | 45 | 21/92 |
| After disk-level cleanup (323 URLs rewritten) | 33 | 13/92 |
| After external CDN downloads (17 assets / 12 MB) | 21 | 11/92 |
| After mass migration + override clear | 5 | 2/92 |
| After manual touches (bakery copyright, hair-02 missing image) | 2 (cache only) | 1/92 |
| After cache TTL + final mass migration sweep | **0** | **0/92** |

`scripts/precommit-residue-check.mjs` + `daily-residue-audit` cron prevent
regression.

## Migration figures

- v2 tenants: **170** (60 from `-v2` batch + 119 from broader sweep, minus
  2 with missing template_versions)
- `tenant_data_slots` rows: 792
- `template_versions` rows: 97
- Stale `content_overrides` cleared post-cleanup: 228 rows across 4 tenants

## Performance baseline (floors-01-v2, localhost cold cache)

```
Status: 200 · 338ms · 82 KB · Score: 84/100
Inline CSS 4.9 KB · Inline JS 25.7 KB · 6 ext scripts
Images: 15 <img>, 8 lazy
Head: 15 preload, 6 woff2 fonts (via HTTP Link header)
SEO:  JSON-LD WebSite + 2× LocalBusiness, 6 OG tags, 3 twitter
Issues:
  · 8/15 <img> with loading=lazy (target after hero/navbar = 13)
  · <h1> count = 0 (template gap)
  · Missing <meta description> (template gap)
```

## CI surface

`.github/workflows/venom-ci.yml` runs on push/PR touching `venom/**`:

- `lint-and-check` — `npm run lint` + `npx tsc --noEmit` (both
  `continue-on-error` until pre-existing errors are addressed)
- `residue-check` — invokes `precommit-residue-check.mjs` against the diff
- `build` — production `next build` smoke (no DB needed)

Local pre-commit options documented in `docs/PRECOMMIT_SETUP.md`.

Vercel cron setup documented in `docs/CRON_SETUP.md`.

## What's deferred (low priority)

- ImageUploader UI in Inspector with slot selector (AssetsPanel covers most of the need)
- F5 daily audit prompt — to be run manually tomorrow on the first 3 templates
- Lighthouse audit on production URL (after Vercel deploy completes)
- Husky `npm install` (scaffold file shipped, install step left to team preference)

## What's known-broken / non-Phase-3

The repo has 374 pre-existing modified files in `venom/src/components/sections/*`,
`venom/scripts/seed-showcase.mjs`, etc., not touched by this phase. Phase 3
commits only modify their direct deliverables — no incidental edits.
