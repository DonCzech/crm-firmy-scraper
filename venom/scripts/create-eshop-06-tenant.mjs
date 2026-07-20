/**
 * Create tenant eshop-06-v2 for the eshop-06 (Svetplodu.cz DNA) template.
 * Idempotent: reuses existing tenant, re-seeds pages/sections from manifest.
 * Usage: node scripts/create-eshop-06-tenant.mjs
 */
import pg from "pg";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TEMPLATE_KEY = "eshop-06";
const TENANT_SLUG = "eshop-06-v2";
const SHOP_NAME = "Ořeškárna";

const dir = join(ROOT, "src", "templates", TEMPLATE_KEY);
const manifest = JSON.parse(readFileSync(join(dir, "template.json"), "utf8"));
const theme = JSON.parse(readFileSync(join(dir, "theme.json"), "utf8"));
const content = JSON.parse(readFileSync(join(dir, manifest.content?.default ?? "./content/cs.json"), "utf8"));

const designTokens = {
  colorPrimary: theme.colors.primary,
  colorSecondary: theme.colors.secondary,
  colorBackground: theme.colors.background,
  colorSurface: theme.colors.surface,
  colorText: theme.colors.text,
  colorTextMuted: theme.colors.textMuted,
  colorAccent: theme.colors.accent,
  colorBorder: theme.colors.border,
  fontHeading: theme.typography.fontHeading,
  fontBody: theme.typography.fontBody,
  borderRadius: "3px",
  spacing: "normal",
};

const CORE_MODULES = [
  "commerce-core", "commerce-products", "commerce-orders",
  "commerce-checkout", "commerce-payments", "commerce-shipping", "commerce-feeds",
];

function lookupRef(obj, ref) {
  if (!ref) return {};
  let cur = obj;
  for (const p of ref.split(".")) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return {};
  }
  return cur && typeof cur === "object" ? cur : {};
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const tplRes = await client.query("SELECT id FROM templates WHERE key = $1", [TEMPLATE_KEY]);
  if (!tplRes.rows.length) throw new Error(`Template '${TEMPLATE_KEY}' not seeded — run seed-all-templates first`);
  const templateId = tplRes.rows[0].id;

  let tenantId;
  const existing = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
  if (existing.rows.length) {
    tenantId = existing.rows[0].id;
    console.log(`✓ Tenant exists: ${TENANT_SLUG} (id=${tenantId})`);
  } else {
    const accessToken = randomBytes(24).toString("hex");
    const res = await client.query(
      `INSERT INTO tenants (slug, email, template_id, template_version, industry, status, active_modules, plan, access_token, tenant_kind, site_mode)
       VALUES ($1, $2, $3, $4, 'eshop', 'demo', $5, 'free', $6, 'commerce', 'multipage')
       RETURNING id, access_token`,
      [TENANT_SLUG, "demo@webero.cz", templateId, manifest.version, ["gallery", "testimonials", "forms"], accessToken]
    );
    tenantId = res.rows[0].id;
    console.log(`✓ Tenant created: ${TENANT_SLUG} (id=${tenantId}), access_token=${res.rows[0].access_token}`);
  }

  await client.query(
    `INSERT INTO shops (tenant_id, name, order_number_prefix) VALUES ($1, $2, 'OBJ')
     ON CONFLICT (tenant_id) DO UPDATE SET name = EXCLUDED.name, updated_at = now()`,
    [tenantId, SHOP_NAME]
  );
  for (const m of CORE_MODULES) {
    await client.query(
      `INSERT INTO tenant_modules (tenant_id, module_key, enabled) VALUES ($1, $2, true)
       ON CONFLICT (tenant_id, module_key) DO UPDATE SET enabled = true, updated_at = now()`,
      [tenantId, m]
    );
  }
  console.log(`✓ Shop '${SHOP_NAME}' + ${CORE_MODULES.length} core modules`);

  // Re-seed pages + sections from manifest
  const pagesRes = await client.query("SELECT id FROM pages WHERE tenant_id = $1", [tenantId]);
  for (const p of pagesRes.rows) await client.query("DELETE FROM sections WHERE page_id = $1", [p.id]);
  await client.query("DELETE FROM pages WHERE tenant_id = $1", [tenantId]);

  for (const page of manifest.pages) {
    const pageRes = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, $2, $3, $4, 'published', $5, $6) RETURNING id`,
      [
        tenantId,
        page.isHomepage ? "home" : page.slug,
        page.isHomepage ? (content.siteName ?? TENANT_SLUG) : (page.title ?? page.slug),
        !!page.isHomepage,
        page.isHomepage ? (content.seo?.title ?? null) : null,
        page.isHomepage ? (content.seo?.description ?? null) : null,
      ]
    );
    for (let i = 0; i < page.sections.length; i++) {
      const s = page.sections[i];
      const sectionContent = lookupRef(content, s.contentRef);
      const settings = { content: sectionContent, designTokens };
      if (s.anchorId) settings.anchorId = s.anchorId;
      const contentSource = page.isHomepage ? "v2" : "legacy";
      await client.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_source)
         VALUES ($1, $2, $3, $4, $5, true, $6, $7)`,
        [tenantId, pageRes.rows[0].id, s.type, s.variant, i, JSON.stringify(settings), contentSource]
      );
    }
    console.log(`✓ Page '${page.slug}' — ${page.sections.length} sections`);
  }

  await client.query("COMMIT");
  console.log(`\n✅ ${TENANT_SLUG} ready → http://localhost:3015/demo/${TENANT_SLUG}`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("❌ Rollback:", err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
