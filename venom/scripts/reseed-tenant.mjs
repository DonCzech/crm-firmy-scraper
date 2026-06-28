/**
 * Reseed an existing tenant from a JSON-based template.
 * Usage: node scripts/reseed-tenant.mjs <tenant-slug> <template-key>
 * Example: node scripts/reseed-tenant.mjs fade-room-demo fade-room
 */
import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const [, , tenantSlug, templateKey] = process.argv;
if (!tenantSlug || !templateKey) {
  console.error("Usage: node scripts/reseed-tenant.mjs <tenant-slug> <template-key>");
  process.exit(1);
}

// ── Load template files ───────────────────────────────────────────────────────
const templateDir = join(ROOT, "src", "templates", templateKey);
const manifest = JSON.parse(readFileSync(join(templateDir, "template.json"), "utf8"));
const theme = JSON.parse(readFileSync(join(templateDir, "theme.json"), "utf8"));
const contentPath = manifest.content?.default ?? "./content/cs.json";
const rawContent = JSON.parse(readFileSync(join(templateDir, contentPath), "utf8"));

// ── Placeholder image generator ───────────────────────────────────────────────
function placeholderImage(width, height, label = "Přidat obrázek") {
  const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fontSize = Math.max(14, Math.min(28, Math.round(Math.min(width, height) / 14)));
  const plusSize = Math.round(Math.min(width, height) / 5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice"><rect width="${width}" height="${height}" fill="#f0eeea"/><rect x="1" y="1" width="${width-2}" height="${height-2}" fill="none" stroke="#c8c4be" stroke-width="2" stroke-dasharray="8 8"/><g fill="#7a766f"><circle cx="${width/2}" cy="${height/2-fontSize*1.6}" r="${plusSize/2}" fill="#e6e2dc"/><rect x="${width/2-plusSize/6}" y="${height/2-fontSize*1.6-plusSize/3}" width="${plusSize/3}" height="${plusSize*2/3}" fill="#7a766f"/><rect x="${width/2-plusSize/3}" y="${height/2-fontSize*1.6-plusSize/6}" width="${plusSize*2/3}" height="${plusSize/3}" fill="#7a766f"/><text x="50%" y="${height/2+fontSize*0.2}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="600">${safe}</text><text x="50%" y="${height/2+fontSize*1.6}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${Math.round(fontSize*0.75)}" opacity="0.7">${width} × ${height} px</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function resolvePlaceholders(input) {
  if (input && typeof input === "object" && Array.isArray(input.__placeholder)) {
    const [w, h, label] = input.__placeholder;
    return placeholderImage(w, h, label);
  }
  if (Array.isArray(input)) return input.map(resolvePlaceholders);
  if (input && typeof input === "object") {
    const out = {};
    for (const [k, v] of Object.entries(input)) out[k] = resolvePlaceholders(v);
    return out;
  }
  return input;
}

// ── Theme → DesignTokens ──────────────────────────────────────────────────────
function themeToTokens(theme) {
  const spacingMap = { compact: "compact", normal: "normal", spacious: "relaxed", editorial: "relaxed" };
  return {
    colorPrimary:    theme.colors.primary,
    colorSecondary:  theme.colors.secondary,
    colorBackground: theme.colors.background,
    colorSurface:    theme.colors.surface,
    colorText:       theme.colors.text,
    colorTextMuted:  theme.colors.textMuted,
    colorAccent:     theme.colors.accent,
    colorBorder:     theme.colors.border,
    fontHeading:     theme.typography.fontHeading,
    fontBody:        theme.typography.fontBody,
    borderRadius:    theme.radius.pill,
    spacing:         spacingMap[theme.spacing.personality] ?? "normal",
  };
}

// ── Content lookup by dot-path ────────────────────────────────────────────────
function lookupRef(content, ref) {
  if (!ref) return {};
  const parts = ref.split(".");
  let cur = content;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return {};
  }
  return (cur && typeof cur === "object" ? cur : {});
}

// ── Main ──────────────────────────────────────────────────────────────────────
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const content = resolvePlaceholders(rawContent);
const designTokens = themeToTokens(theme);

const client = await pool.connect();
try {
  await client.query("BEGIN");

  // 1. Get tenant
  const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = $1", [tenantSlug]);
  if (!tenantRes.rows.length) throw new Error(`Tenant '${tenantSlug}' not found`);
  const tenantId = tenantRes.rows[0].id;
  console.log(`✓ Tenant: ${tenantSlug} (id=${tenantId})`);

  // 2. Delete all existing pages and sections
  const pagesRes = await client.query("SELECT id FROM pages WHERE tenant_id = $1", [tenantId]);
  for (const page of pagesRes.rows) {
    await client.query("DELETE FROM sections WHERE page_id = $1", [page.id]);
  }
  await client.query("DELETE FROM pages WHERE tenant_id = $1", [tenantId]);
  console.log(`✓ Deleted ${pagesRes.rows.length} old page(s) and all sections`);

  // 3. Find homepage in manifest
  const homepage = manifest.pages.find(p => p.isHomepage) ?? manifest.pages[0];
  const siteName = content.siteName ?? tenantSlug;

  // 4. Create homepage
  const homePageRes = await client.query(
    `INSERT INTO pages (tenant_id, slug, title, is_homepage, status) VALUES ($1, 'home', $2, true, 'published') RETURNING id`,
    [tenantId, siteName]
  );
  const homePageId = homePageRes.rows[0].id;

  // 5. Seed homepage sections
  for (let i = 0; i < homepage.sections.length; i++) {
    const s = homepage.sections[i];
    const sectionContent = lookupRef(content, s.contentRef) || content[s.type] || {};
    await client.query(
      `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
       VALUES ($1, $2, $3, $4, $5, true, $6)`,
      [tenantId, homePageId, s.type, s.variant, i, JSON.stringify({ content: sectionContent, designTokens })]
    );
  }
  console.log(`✓ Seeded homepage with ${homepage.sections.length} sections`);

  // 6. Create subpages
  const subpages = manifest.pages.filter(p => p !== homepage);
  for (const page of subpages) {
    const pageRes = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status) VALUES ($1, $2, $3, false, 'published') RETURNING id`,
      [tenantId, page.slug, page.title ?? page.slug]
    );
    const pageId = pageRes.rows[0].id;
    for (let i = 0; i < page.sections.length; i++) {
      const s = page.sections[i];
      const sectionContent = lookupRef(content, s.contentRef) || content[s.type] || {};
      await client.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
         VALUES ($1, $2, $3, $4, $5, true, $6)`,
        [tenantId, pageId, s.type, s.variant, i, JSON.stringify({ content: sectionContent, designTokens })]
      );
    }
    console.log(`✓ Seeded subpage '${page.slug}' with ${page.sections.length} sections`);
  }

  await client.query("COMMIT");
  console.log(`\n✅ fade-room-demo re-seeded from template '${templateKey}'`);
  console.log(`   → http://localhost:3015/demo/${tenantSlug}`);
  console.log(`   → http://localhost:3015/demo/${tenantSlug}/studio`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("❌ Rollback:", err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
