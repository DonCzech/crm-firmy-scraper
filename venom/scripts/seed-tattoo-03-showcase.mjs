#!/usr/bin/env node
// Direct seed tattoo-03-showcase (bez onboarding API)
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;

const MASTER_SLUG  = 'tattoo-03-demo';
const SHOWCASE_SLUG = 'tattoo-03-showcase';
const EMAIL = 'showcase@tattoo-03.test';
const TEMPLATE_KEY = 'tattoo-03';
const INDUSTRY = 'tattoo';

const templateDir = join(ROOT, 'src', 'templates', TEMPLATE_KEY);
const manifest = JSON.parse(readFileSync(join(templateDir, 'template.json'), 'utf8'));
const theme = JSON.parse(readFileSync(join(templateDir, 'theme.json'), 'utf8'));
const contentPath = manifest.content?.default ?? './content/cs.json';
const rawContent = JSON.parse(readFileSync(join(templateDir, contentPath), 'utf8'));

function themeToTokens(t) {
  const spacingMap = { compact: 'compact', normal: 'normal', spacious: 'relaxed', editorial: 'relaxed' };
  return {
    colorPrimary:    t.colors.primary,
    colorSecondary:  t.colors.secondary,
    colorBackground: t.colors.background,
    colorSurface:    t.colors.surface,
    colorText:       t.colors.text,
    colorTextMuted:  t.colors.textMuted,
    colorAccent:     t.colors.accent,
    colorBorder:     t.colors.border,
    fontHeading:     t.typography.fontHeading,
    fontBody:        t.typography.fontBody,
    borderRadius:    t.radius.pill,
    spacing:         spacingMap[t.spacing.personality] ?? 'normal',
  };
}

function lookupRef(content, ref) {
  if (!ref) return {};
  const parts = ref.split('.');
  let cur = content;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return {};
  }
  return (cur && typeof cur === 'object' ? cur : {});
}

const { Pool } = pg;
const pool = new Pool({ connectionString: DB_URL });
const designTokens = themeToTokens(theme);
const accessToken = randomBytes(24).toString('hex');

const client = await pool.connect();
try {
  await client.query('BEGIN');

  // Get master tenant id
  const masterRes = await client.query('SELECT id FROM tenants WHERE slug=$1', [MASTER_SLUG]);
  if (masterRes.rowCount === 0) {
    throw new Error(`Master tenant ${MASTER_SLUG} not found — run seed-tattoo-03-direct.mjs first`);
  }
  const masterId = masterRes.rows[0].id;
  console.log(`✓ master found: id=${masterId}`);

  // Cleanup showcase
  const del = await client.query('DELETE FROM tenants WHERE slug=$1 RETURNING id', [SHOWCASE_SLUG]);
  console.log(`✓ cleanup: removed ${del.rowCount} old showcase tenants`);

  // Upsert template record
  await client.query(
    `INSERT INTO templates (key, name, industry, current_version, status)
     VALUES ($1, $2, $3, $4, 'active')
     ON CONFLICT (key) DO UPDATE SET name=$2, industry=$3, current_version=$4, updated_at=now()`,
    [manifest.key, manifest.name, manifest.industry, manifest.version]
  );
  const tplRow = await client.query('SELECT id FROM templates WHERE key=$1', [TEMPLATE_KEY]);
  const templateId = tplRow.rows[0].id;

  // Create showcase tenant
  const tenantRes = await client.query(
    `INSERT INTO tenants (slug, email, template_id, template_version, industry, status, active_modules, plan, access_token, parent_tenant_id, showcase_kind)
     VALUES ($1, $2, $3, $4, $5, 'demo', $6, 'free', $7, $8, 'filled') RETURNING id`,
    [SHOWCASE_SLUG, EMAIL, templateId, manifest.version, INDUSTRY, ['gallery', 'testimonials', 'forms'], accessToken, masterId]
  );
  const tenantId = tenantRes.rows[0].id;
  console.log(`✓ showcase tenant created: id=${tenantId}`);

  // Homepage
  const homepage = manifest.pages.find(p => p.isHomepage) ?? manifest.pages[0];
  const siteName = rawContent.navbar?.siteName ?? 'Demo Magic Tattoo Studio (Showcase)';
  const homePageRes = await client.query(
    `INSERT INTO pages (tenant_id, slug, title, is_homepage, status) VALUES ($1, 'home', $2, true, 'published') RETURNING id`,
    [tenantId, siteName]
  );
  const homePageId = homePageRes.rows[0].id;

  // Sections
  for (let i = 0; i < homepage.sections.length; i++) {
    const s = homepage.sections[i];
    const sectionContent = lookupRef(rawContent, s.contentRef) || rawContent[s.type] || {};
    await client.query(
      `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
       VALUES ($1, $2, $3, $4, $5, true, $6)`,
      [tenantId, homePageId, s.type, s.variant, i, JSON.stringify({ content: sectionContent, designTokens })]
    );
    console.log(`  ✓ section ${i}: ${s.type}@${s.variant}`);
  }

  // Tenant modules
  for (const moduleKey of ['gallery', 'testimonials', 'forms']) {
    await client.query(
      `INSERT INTO tenant_modules (tenant_id, module_key, enabled) VALUES ($1, $2, true) ON CONFLICT DO NOTHING`,
      [tenantId, moduleKey]
    );
  }

  await client.query('COMMIT');
  console.log(`\n✅ tattoo-03-showcase seeded`);
  console.log(`   master:   http://localhost:3015/demo/${MASTER_SLUG}`);
  console.log(`   showcase: http://localhost:3015/demo/${SHOWCASE_SLUG}`);
  console.log(`   studio:   http://localhost:3015/demo/${SHOWCASE_SLUG}/studio`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌ Rollback:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
