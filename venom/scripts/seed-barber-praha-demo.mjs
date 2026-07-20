/**
 * FÁZE 2 — Seed DB pro barber-praha-demo
 * WordPress + Divi — CSS je inline v HTML, et-cache CSS linkováno lokálně.
 *
 * Spustit: node scripts/seed-barber-praha-demo.mjs
 */

import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'barber-praha-demo';
const ACCESS_TOKEN = 'bpraha' + Math.random().toString(36).slice(2, 10);
const CLONE_PATH = '/clones/barber-praha';

// Divi CSS is already inline in HTML — fonts.css is the only external needed
const CSS_URLS = [
  `${CLONE_PATH}/fonts.css`,
];
const JS_URLS = [];

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function seed() {
  log('=== Seed barber-praha-demo ===');

  const htmlPath = '/tmp/barber-praha-home.html';
  if (!fs.existsSync(htmlPath)) {
    throw new Error('HTML not found. Run mirror-barber-praha-assets.mjs first.');
  }
  const html = fs.readFileSync(htmlPath, 'utf-8');
  log(`HTML loaded: ${(html.length / 1024).toFixed(0)}KB`);

  // Delete existing tenant (CASCADE removes pages + sections)
  log('Deleting existing tenant if present...');
  const delRes = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [TENANT_SLUG]);
  if (delRes.rowCount > 0) log(`  Deleted tenant id: ${delRes.rows[0].id}`);

  // Find template id for 'barber'
  const tplRes = await pool.query(`SELECT id FROM templates WHERE key = 'barber' LIMIT 1`);
  if (!tplRes.rows.length) throw new Error('Template barber not found in DB');
  const templateId = tplRes.rows[0].id;
  log(`Using template id: ${templateId} (barber)`);

  // Create tenant
  const tenantRes = await pool.query(
    `INSERT INTO tenants (slug, template_id, industry, status, email, access_token)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [TENANT_SLUG, templateId, 'barber', 'demo', 'info@demo.local', ACCESS_TOKEN]
  );
  const tenantId = tenantRes.rows[0].id;
  log(`Created tenant id: ${tenantId}`);

  // Create homepage
  const pageRes = await pool.query(
    `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      tenantId,
      'home',
      'Barber Praha — Barbershop Praha',
      true,
      'published',
      'Barber Praha — Ukázka šablony barbershop',
      'Demo šablona barbershop pro Venom SaaS. Střihy, holení a péče o vousy. Moderní design.',
    ]
  );
  const pageId = pageRes.rows[0].id;
  log(`Created page id: ${pageId} (home)`);

  // Create full-page-clone section
  const settings = { html, cssUrls: CSS_URLS, jsUrls: JS_URLS };

  const sectionRes = await pool.query(
    `INSERT INTO sections
       (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [tenantId, pageId, 'full-page-clone', 'default', 0, true, JSON.stringify(settings)]
  );
  const sectionId = sectionRes.rows[0].id;
  log(`Created full-page-clone section id: ${sectionId}`);

  await pool.end();

  log('\n=== HOTOVO ===');
  log(`Tenant ID:  ${tenantId}`);
  log(`Section ID: ${sectionId}`);
  log(`Token:      ${ACCESS_TOKEN}`);
  log(`Demo URL:   http://localhost:3015/demo/${TENANT_SLUG}`);
  log(`Admin URL:  http://localhost:3015/demo/${TENANT_SLUG}/admin`);
  log(`Login URL:  http://localhost:3015/demo/${TENANT_SLUG}/login`);
  log(`\nCookie inject (Playwright):`);
  log(`  name: venom_access_${TENANT_SLUG}`);
  log(`  value: ${ACCESS_TOKEN}`);
}

seed().catch(e => { console.error(e); process.exit(1); });
