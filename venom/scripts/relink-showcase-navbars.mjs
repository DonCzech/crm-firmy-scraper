/**
 * For every showcase tenant with materialised sub-pages, rewrite navbar links
 * from `#anchor` to `/slug` whenever a sub-page with that slug actually
 * exists. The header menu then routes to the real sub-page instead of
 * scrolling to a (often-missing) section on the homepage.
 *
 * Rules:
 *  - Only navbar sections are touched. Other anchor links (CTAs, in-page
 *    scrolls inside sections) are left alone.
 *  - `/` (Úvod / Home) is preserved as-is.
 *  - External links (http, mailto, tel) are skipped.
 *  - If the anchor doesn't match any existing sub-page slug for this tenant,
 *    the link is left unchanged.
 *  - Idempotent: running again is a no-op.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/relink-showcase-navbars.mjs
 *   DATABASE_URL=... node scripts/relink-showcase-navbars.mjs --dry
 */
import pg from "pg";

const DRY = process.argv.includes("--dry");

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

function slugify(input) {
  if (!input) return "";
  return input.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// All tenants that look like showcase/demo/v2 + any tenant referenced as a
// template's primary demo. We process every tenant rather than filtering by
// status so user-created demos also benefit from the routing fix.
const tenants = (await c.query(`
  SELECT id, slug FROM tenants WHERE status != 'suspended' ORDER BY slug
`)).rows;

let totalRewrites = 0;
let totalSections = 0;
let tenantsTouched = 0;

for (const t of tenants) {
  // All slugs this tenant exposes (we'll only rewrite anchors that match).
  const slugs = new Set(
    (await c.query("SELECT slug FROM pages WHERE tenant_id = $1", [t.id])).rows.map((r) => r.slug)
  );
  if (slugs.size <= 1) continue; // no sub-pages, nothing to relink

  // Every navbar section on this tenant (one per page, so we rewrite them all).
  const navs = (await c.query(
    `SELECT s.id, s.settings, s.content_overrides, s.content_source,
            s.section_type, s.order_index,
            t.template_id, t.template_version
     FROM sections s
     JOIN tenants t ON s.tenant_id = t.id
     WHERE t.id = $1 AND s.section_type = 'navbar'`,
    [t.id]
  )).rows;
  if (!navs.length) continue;

  // Template default sections — needed to know what the v2 renderer sees
  // when no override is set. We cache by (template_id, version).
  async function getTemplateDefaultNav(templateId, version) {
    const r = await c.query(
      `SELECT default_sections FROM template_versions
       WHERE template_id = $1 AND version = $2 LIMIT 1`,
      [templateId, version]
    );
    const def = r.rows[0]?.default_sections;
    if (!Array.isArray(def)) return null;
    return def.find((s) => s.type === "navbar") ?? null;
  }

  let tenantChanges = 0;
  for (const nav of navs) {
    const settings = nav.settings ?? {};
    const overrides = nav.content_overrides ?? {};
    const v2 = nav.content_source === "v2";

    // Source-of-truth for the *currently rendered* nav links:
    //  - v2 with overrides.links → overrides wins
    //  - v2 without override     → template default's links
    //  - legacy                  → settings.content.links
    let links = null;
    if (v2) {
      if (Array.isArray(overrides.links) && overrides.links.length) {
        links = overrides.links;
      } else {
        const def = await getTemplateDefaultNav(nav.template_id, nav.template_version);
        if (def?.content?.links && Array.isArray(def.content.links)) links = def.content.links;
      }
    } else if (Array.isArray(settings?.content?.links)) {
      links = settings.content.links;
    }
    if (!links) continue;

    let changed = false;
    const next = links.map((link) => {
      const href = String(link.href ?? "");
      // Only rewrite anchor-shaped hrefs (skip /, /paths, externals).
      if (!href.startsWith("#")) return link;
      if (href === "#" || href === "#/") return link;
      const anchor = href.slice(1); // drop the '#'
      // Direct match on stored slug?
      let target = slugify(anchor);
      if (!slugs.has(target)) {
        // Try the label as a fallback (some navbar entries label says "O nás"
        // → anchor "#onas" → page slug "o-nas").
        const labelSlug = slugify(String(link.label ?? ""));
        if (labelSlug && slugs.has(labelSlug)) target = labelSlug;
        else return link;
      }
      if (!target) return link;
      changed = true;
      return { ...link, href: `/${target}` };
    });

    if (changed) {
      tenantChanges++;
      totalRewrites += next.filter((l, i) => l.href !== links[i].href).length;
      totalSections++;
      if (!DRY) {
        if (v2) {
          // Write to content_overrides so v2 renderer picks up the new links.
          const newOverrides = { ...overrides, links: next };
          await c.query(
            `UPDATE sections SET content_overrides = $1, updated_at = NOW() WHERE id = $2`,
            [newOverrides, nav.id]
          );
        } else {
          // Legacy: settings.content.links is the source of truth.
          const newSettings = { ...settings, content: { ...(settings.content ?? {}), links: next } };
          await c.query(
            `UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`,
            [newSettings, nav.id]
          );
        }
      }
    }
  }

  if (tenantChanges) {
    tenantsTouched++;
    console.log(`${DRY ? "DRY " : ""}${t.slug.padEnd(34)} ${tenantChanges} navbar(s) updated`);
  }
}

console.log(`\n${DRY ? "DRY RUN — " : ""}rewrote ${totalRewrites} links across ${totalSections} navbar sections in ${tenantsTouched} tenants.`);
await c.end();
