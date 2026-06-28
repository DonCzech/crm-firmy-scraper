# TENANT_DEPLOYMENT_FLOW.md

**Status:** Standard v1
**Datum:** 2026-05-23

---

## 1. Doménový model

```
Tenant
  ├─ id (uuid)
  ├─ slug (unique, kebab-case)        # primární identifikátor v URL
  ├─ templateKey + templateVersion
  ├─ status: trial | active | suspended | archived
  ├─ plan: starter | pro | business
  ├─ ownerUserId
  └─ createdAt

TenantDomain
  ├─ tenantId
  ├─ domain (www.example.cz)
  ├─ verified: bool
  ├─ sslStatus: pending | issued | expired
  └─ isPrimary

Page
  ├─ tenantId
  ├─ slug
  ├─ isHomepage
  ├─ status: draft | published
  ├─ publishedRevisionId
  └─ draftRevisionId

PageRevision
  ├─ pageId
  ├─ revisionId (monotonic int)
  ├─ sectionsSnapshot (JSONB)
  ├─ authorUserId
  └─ createdAt

Section
  ├─ pageId
  ├─ orderIndex
  ├─ type, variant
  ├─ contentRef          # cesta do template content
  ├─ overrides (JSONB)   # JSON Patch
  ├─ hidden: bool
  └─ revisionId

Media (popsáno v IMAGE_PIPELINE_STANDARD)
```

---

## 2. Provisioning flow

```
1. User signup
   POST /api/account/signup → User + Tenant (slug = email-derived)

2. Template selection
   POST /api/tenant/:id/template { templateKey }
   → tenantFactory.createDemoTenantFromTemplate
       ├─ seed pages dle template.json
       ├─ seed sections (status=draft, hidden=false)
       ├─ copy default content do tenant_content
       └─ enqueue: image asset import (logo placeholder, hero placeholder)

3. Tenant je live na: https://app.webero.cz/demo/{slug}
   Editor: https://app.webero.cz/demo/{slug}/admin
```

Provisioning je **idempotentní** (re-run nezpůsobí duplicity).

---

## 3. Draft / Published model

```
                  ┌──────────────────────────────┐
                  │  editor (always edits draft) │
                  └────────────┬─────────────────┘
                               │ publish
                               ▼
              ┌────────────────────────────────────┐
              │ snapshot draft → publishedRevision │
              └────────────────┬───────────────────┘
                               ▼
        published rendering (CDN-cacheable, ISR revalidate)
```

### Pravidla

- **Editor vždy edituje `draft`.** Publikovaná verze je read-only snapshot.
- `GET /demo/:slug` (public) → renderuje `publishedRevision`. Pokud žádná, vrací 503 „Tenant not yet published".
- `GET /demo/:slug?preview=<token>` → renderuje `draftRevision`. Token validní 1 h, vázán na admin user.
- `POST /api/pages/:id/publish` → atomicky:
  1. `INSERT page_revisions (snapshot = current draft)`
  2. `UPDATE pages SET publishedRevisionId = new`
  3. CDN purge `/demo/:slug/**`
  4. Audit log.
- `POST /api/pages/:id/revert` → vrátí draft na hodnotu published.
- `GET /api/pages/:id/revisions` → seznam (paginated, max 100 zpět).

---

## 4. Custom domain flow

```
1. User: Settings → Domains → "Add domain" → example.cz
2. UI ukáže DNS instrukce:
     A     @     76.76.21.x      (Vercel/edge IP)
     CNAME www   cname.webero.cz
3. POST /api/tenant/:id/domains { domain }
   → status: pending_dns
4. Worker (cron 5 min) volá:
     - DNS query (resolveA, resolveCname)
     - HTTP challenge → vlastní /.well-known/webero-verify
     - úspěch → status: dns_ok
5. ACME issuance (Let's Encrypt) přes edge:
     - status: ssl_pending → ssl_issued
6. Routing: edge middleware mapuje Host → tenantId, rewrite na /demo/:slug/...
```

DNS / SSL stav je vidět real-time v UI (SSE channel `/api/domains/:id/events`).

---

## 5. Multi-tenant isolation

Každý request prochází `resolveTenant()` middleware:

```ts
function resolveTenant(req): TenantContext {
  // 1) custom domain header
  const host = req.headers.host;
  const byDomain = db.tenantDomains.findByDomain(host);
  if (byDomain) return loadTenant(byDomain.tenantId);

  // 2) slug v cestě (/demo/:slug)
  const slug = req.url.match(/^\/demo\/([^/]+)/)?.[1];
  if (slug) return loadTenantBySlug(slug);

  // 3) platform admin
  return null;
}
```

Veškeré DB queries pak povinně filtrují `WHERE tenant_id = $ctx.id`. Enforced přes:
- Row-Level Security v PostgreSQL (`SET LOCAL app.tenant_id = ...` v transakci).
- Code review checklistem.
- Lint rule (custom): `query()` bez `tenant_id` v WHERE → warning.

---

## 6. Settings vrstva

`tenant_settings` JSONB tabulka, validovaná Zodem:

```json
{
  "branding": {
    "logoUrl": "...",
    "faviconUrl": "...",
    "ogImageUrl": "..."
  },
  "seo": {
    "titleTemplate": "%s | Café U Vlny",
    "defaultDescription": "...",
    "robots": "index,follow",
    "googleSiteVerification": "..."
  },
  "analytics": {
    "ga4MeasurementId": "G-...",
    "plausibleDomain": "...",
    "cookieConsent": "required" | "optional" | "off"
  },
  "contact": {
    "email": "...",
    "phone": "...",
    "address": { ... }
  },
  "integrations": {
    "smtp": { ... },
    "stripe": { ... }
  }
}
```

Theme overrides (per-tenant tweak fontu, primary color) jdou do `tenant_theme_overrides` a aplikují se na top template `theme.json`.

---

## 7. Asset isolation

Storage path: `tenants/{tenantId}/img/...`. Žádné cross-tenant URL.
Signed URLs s 1h TTL pro private assety (faktury, draft preview obrazy).

---

## 8. Deployment lifecycle

| Fáze | Akce |
|------|------|
| **Create** | provisioning (§2) |
| **Edit** | editor mění draft, autosave |
| **Publish** | snapshot draft → published, CDN purge |
| **Preview** | tokenizovaný draft URL pro sdílení (1h) |
| **Domain attach** | DNS+SSL flow (§4) |
| **Suspend** | `status = suspended`, public route → 503 maintenance page |
| **Archive** | soft delete, retention 30 dní |
| **Delete** | hard delete, kaskáda + storage purge job |

---

## 9. Backup & restore

- Denní pg_dump → S3, retention 30 dní.
- Per-tenant export: `GET /api/tenant/:id/export` → ZIP (pages.json, sections.json, media manifest).
- Restore: `POST /api/tenant/:id/restore` (admin only, mimo standardní UI).

---

## 10. CI/CD pro engine

- PR proti `main` → preview deploy (Vercel) na URL `pr-{N}.webero.cz`.
- E2E (Playwright) proti preview deployment: smoke + editor flow + publish flow.
- Merge na `main` → produkce + automatic DB migrations.
- Tenant data **nikdy** v repo. Migrace bezpečné (additive only; destructive musí jet ručně).

---

## 11. Observability

- Sentry (errors, performance) per tenant tag.
- Plausible (zero-PII analytics) pro platform usage.
- Audit log v PostgreSQL `audit_events` — všechny mutace s tenantId, userId, action, payload diff.
- Health endpoint `/api/health` → DB + storage + queue.

---

## 12. Anti-patterns

| ❌ | ✅ |
|---|---|
| Editor edituje přímo „live" verzi | Draft/published separace |
| Custom domain manuálně do nginx | Automatizovaný DNS+ACME flow |
| Tenant queries bez `tenant_id` filter | RLS + lint enforcement |
| Hard delete při „smazat web" | Soft delete + retention window |
| Migrace beze zpětné kompatibility | Additive only v `main`, destructive ručně |

---

## 📋 FRONTA ŠABLON & DEMO DATA — POVINNÉ PRO KAŽDOU PŘEVÁDĚNOU ŠABLONU

> Tato sekce je **závazná** pro každého agenta (Sonnet), který převádí šablonu na MASTER ENGINE.

**Fronta:** [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md) — jediný zdroj pravdy, která šablona je další.
- **Vstup:** [/preview](http://localhost:3015/preview) (91 legacy scrapů, `src/app/preview/page.tsx`).
- **Výstup:** [/preview-2](http://localhost:3015/preview-2) — auto-discovery z `src/templates/<slug>/template.json`.
- **Pořadí:** ber **první `TODO`** v tabulce (viz [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md#fronta-šablon-91)). Nepřeskakuj.
- **Kontinuita:** před FÁZÍ A si přečti README.md poslední `DONE` šablony v `src/templates/`, abys navázal na zavedené varianty sdílených sekcí.
- **Prompty Sonneta:** [FAZE_A_PROMPT.md](./FAZE_A_PROMPT.md) (analýza) + [FAZE_B_PROMPT.md](./FAZE_B_PROMPT.md) (implementace) (FÁZE A = analýza, FÁZE B = implementace).

### Demo logo — POVINNÉ
- ❌ NESMÍ zůstat originální logo.
- ✅ Vygeneruj **demo logo** (SVG inline nebo `public/templates/<slug>/logo.svg`) s demo názvem (viz sloupec "Demo název" v queue) a barvami z `theme.json`.

### Demo kontakty — POVINNÉ (jednotná tabulka)
| Pole | Hodnota |
|------|---------|
| Email | `email@demo.cz` (případně `info@demo.cz`, `rezervace@demo.cz`) |
| Telefon | `704 123 456` (formát `+420 704 123 456`); druhé číslo `704 654 321` |
| Adresa | `Ukázková 123, 110 00 Praha 1` |
| Web | `https://demo.cz` |
| Sociální | `facebook.com/demo`, `instagram.com/demo` |
| IČO | `12345678` |
| Provozní doba | `Po–Pá 9:00–18:00, So 9:00–14:00` |

### Grep audit před `DONE`
Šablona není hotová, dokud tyto greppy neprojdou na **0** výsledků v `src/templates/<slug>/`:
- `grep -r '@<originální-doména>' src/templates/<slug>/` → 0
- `grep -r '<reálný-název-firmy>' src/templates/<slug>/` → 0 (vyjma README "Zdrojový web")
- Jakékoliv telefonní číslo `\+?420 ?\d{3} ?\d{3} ?\d{3}` MIMO `704 123 456` / `704 654 321` → 0

Po úspěšné FÁZI B aktualizuj v [MASTER_TEMPLATE_QUEUE.md](./MASTER_TEMPLATE_QUEUE.md) řádek `TODO → DONE` + datum a ověř, že se šablona zobrazila v [/preview-2](http://localhost:3015/preview-2).

