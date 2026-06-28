/**
 * Backfill: for every showcase tenant that's missing sub-pages, materialise
 * them from its homepage navbar links. The showcase HOMEPAGE is *never*
 * modified — only new sub-page rows + their cloned sections are inserted.
 *
 * Selection rule for "showcase tenant":
 *  - is the `primary_demo_slug` of some template, OR
 *  - slug ends with `-showcase`, `-demo`, `-v2`
 *
 * Per sub-page seeded:
 *  - copy of homepage navbar (so nav works on the sub-page)
 *  - hero clone with retitled `title` = link label
 *  - one thematic section copied from homepage (services, gallery, contact,
 *    about, faq, promo, team, testimonials, blog-preview — slug-aware)
 *  - copy of homepage footer
 *
 * Idempotent: if a sub-page slug already exists for the tenant, it's skipped
 * entirely (no overwriting). Run multiple times safely.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/backfill-showcase-subpages.mjs
 *   DATABASE_URL=... node scripts/backfill-showcase-subpages.mjs --dry  (preview)
 *   DATABASE_URL=... node scripts/backfill-showcase-subpages.mjs --only barber-03-v2,clean-02-showcase
 */
import pg from "pg";

const DRY = process.argv.includes("--dry");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const onlyList = onlyArg ? onlyArg.slice("--only=".length).split(",") : null;

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

function slugify(input) {
  if (!input) return "";
  return input.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const SKIP_SLUGS = new Set(["home", "homepage", "uvod", "index"]);

function slugToTopics(slug) {
  const n = slug.toLowerCase();
  if (/^(sluzby|sluzba|services|service|lekce|nase-sluzby|nabidka)$/.test(n)) return ["services", "pricing", "promo"];
  if (/^(cenik|ceny|pricing|price-list)$/.test(n))                              return ["pricing", "services"];
  if (/^(galerie|gallery|fotky|portfolio|projekty|realizace)$/.test(n))         return ["gallery"];
  if (/^(kontakt|kontakty|contact|napiste-nam|kde-jsme)$/.test(n))              return ["contact", "opening-hours"];
  if (/^(o-nas|onas|o-mne|about|o-spolecnosti|atelier)$/.test(n))               return ["about", "stats"];
  if (/^(faq|otazky|caste-otazky)$/.test(n))                                    return ["faq", "testimonials"];
  if (/^(akce|promo|nabidka-akci|specialni-nabidka)$/.test(n))                  return ["promo", "services"];
  if (/^(tym|team|nas-tym|architekti)$/.test(n))                                return ["team", "about"];
  if (/^(reference|recenze|testimonials|hodnoceni)$/.test(n))                   return ["testimonials"];
  if (/^(blog|novinky|clanky|aktuality)$/.test(n))                              return ["blog-preview"];
  return [];
}

// ── Find showcase tenants ───────────────────────────────────────────────────
const showcases = (await client.query(`
  WITH primary_demos AS (
    SELECT primary_demo_slug AS slug FROM templates WHERE primary_demo_slug IS NOT NULL
  )
  SELECT DISTINCT t.id, t.slug, t.industry
  FROM tenants t
  WHERE t.status != 'suspended'
    AND (
      t.slug IN (SELECT slug FROM primary_demos)
      OR t.slug LIKE '%-showcase'
      OR t.slug LIKE '%-demo'
      OR t.slug LIKE '%-v2'
    )
  ORDER BY t.slug
`)).rows;

const filtered = onlyList ? showcases.filter((t) => onlyList.includes(t.slug)) : showcases;
console.log(`Found ${showcases.length} showcase tenants (processing ${filtered.length}${DRY ? " — DRY RUN" : ""}).\n`);

let totalCreated = 0;
let totalSkipped = 0;

for (const tenant of filtered) {
  const homeRow = (await client.query(
    "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
    [tenant.id]
  )).rows[0];
  if (!homeRow) { console.log(`SKIP ${tenant.slug} — no homepage`); continue; }
  const homepageId = homeRow.id;

  // Existing sub-page slugs (we never overwrite — if exists, skip).
  const existing = (await client.query(
    "SELECT slug FROM pages WHERE tenant_id = $1",
    [tenant.id]
  )).rows.map((r) => r.slug);
  const taken = new Set(existing);

  // Navbar links on homepage.
  const navRow = (await client.query(
    `SELECT id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source
     FROM sections WHERE tenant_id = $1 AND page_id = $2 AND section_type = 'navbar'
     ORDER BY order_index LIMIT 1`,
    [tenant.id, homepageId]
  )).rows[0];
  if (!navRow) { console.log(`SKIP ${tenant.slug} — no navbar on homepage`); continue; }
  const links = navRow.settings?.content?.links ?? [];
  if (!Array.isArray(links) || links.length === 0) { console.log(`SKIP ${tenant.slug} — navbar has no links`); continue; }

  const heroRow = (await client.query(
    `SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 AND section_type = 'hero' ORDER BY order_index LIMIT 1`,
    [tenant.id, homepageId]
  )).rows[0];
  const footerRow = (await client.query(
    `SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 AND section_type = 'footer' ORDER BY order_index LIMIT 1`,
    [tenant.id, homepageId]
  )).rows[0];
  const homeSections = (await client.query(
    `SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index`,
    [tenant.id, homepageId]
  )).rows;
  const findHome = (type) => homeSections.find((s) => s.section_type === type) ?? null;

  const created = [];
  const skipped = [];

  for (const link of links) {
    const rawHref = String(link.href ?? "").trim();
    const label = String(link.label ?? "").trim();
    if (!rawHref || !label) continue;
    if (/^(https?:|mailto:|tel:|sms:)/i.test(rawHref)) continue;
    if (rawHref === "/" || rawHref === "#" || rawHref === "#/") continue;
    const stripped = rawHref.replace(/^[#/]+/, "").split(/[?#/]/)[0];
    const slug = slugify(stripped || label);
    if (!slug || SKIP_SLUGS.has(slug)) continue;
    if (taken.has(slug)) { skipped.push(slug); continue; }
    taken.add(slug);

    if (DRY) {
      created.push(slug);
      continue;
    }

    // Begin a tiny transaction per sub-page so a partial failure doesn't
    // leave orphaned half-built pages.
    await client.query("BEGIN");
    try {
      const sub = (await client.query(
        `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
         VALUES ($1, $2, $3, false, 'published', $4, $5)
         RETURNING id`,
        [tenant.id, slug, label, label, null]
      )).rows[0];

      let order = 0;
      async function cloneInto(src, overrideContent) {
        const settings = src.settings ?? {};
        const merged = overrideContent
          ? { ...settings, content: { ...(settings.content ?? {}), ...overrideContent } }
          : settings;
        await client.query(
          `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [tenant.id, sub.id, src.section_type, src.section_variant, order++, src.is_visible ?? true, merged, src.content_overrides ?? {}, src.content_source ?? null]
        );
      }

      // navbar → hero retitled → thematic → footer
      await cloneInto(navRow);
      if (heroRow) await cloneInto(heroRow, { title: label, subtitle: "" });
      for (const topic of slugToTopics(slug)) {
        const themed = findHome(topic);
        if (themed) { await cloneInto(themed); break; }
      }
      if (footerRow) await cloneInto(footerRow);

      await client.query("COMMIT");
      created.push(slug);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  FAIL ${tenant.slug}/${slug}: ${err.message}`);
    }
  }

  totalCreated += created.length;
  totalSkipped += skipped.length;
  const status = created.length === 0 && skipped.length === 0
    ? "no new sub-pages"
    : `${created.length ? `+${created.join(", ")}` : ""}${skipped.length ? ` (skipped existing: ${skipped.join(", ")})` : ""}`;
  console.log(`${DRY ? "DRY " : ""}${tenant.slug.padEnd(34)} ${status}`);
}

console.log(`\nTotal created: ${totalCreated}, total skipped (already existed): ${totalSkipped}`);
await client.end();
