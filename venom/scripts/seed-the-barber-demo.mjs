/**
 * FÁZE 2 — Seed DB pro the-barber-demo
 * Vytvoří tenant + stránku + full-page-clone sekci.
 *
 * Spustit: node scripts/seed-the-barber-demo.mjs
 */

import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'the-barber-demo';
const ACCESS_TOKEN = 'barber' + Math.random().toString(36).slice(2, 12);
const CLONE_PATH = '/clones/the-barber';

const CSS_URLS = [
  `${CLONE_PATH}/fonts/fonts.css`,
  `${CLONE_PATH}/css/style.css`,
];
const JS_URLS = [];

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function seed() {
  log('=== Seed the-barber-demo ===');

  const htmlPath = '/tmp/the-barber-home.html';
  if (!fs.existsSync(htmlPath)) {
    throw new Error('HTML not found: /tmp/the-barber-home.html. Run mirror-the-barber-assets.mjs first.');
  }
  const html = fs.readFileSync(htmlPath, 'utf-8');
  log(`HTML loaded: ${html.length} chars`);

  // Delete existing tenant (CASCADE removes pages + sections)
  log('Deleting existing tenant if present...');
  const delRes = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [TENANT_SLUG]);
  if (delRes.rowCount > 0) log(`  Deleted tenant ${delRes.rows[0].id}`);

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
      'The Barber — Holičství Praha',
      true,
      'published',
      'The Barber — Holičství a barbershop Praha',
      'Profesionální holičství v Praze. Střihy, holení a péče o vousy. Rezervujte online.',
    ]
  );
  const pageId = pageRes.rows[0].id;
  log(`Created page id: ${pageId} (home)`);

  // Create full-page-clone section
  const settings = { html, cssUrls: CSS_URLS, jsUrls: JS_URLS };

  await pool.query(
    `INSERT INTO sections
       (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [tenantId, pageId, 'full-page-clone', 'default', 0, true, JSON.stringify(settings)]
  );
  log('Created full-page-clone section');

  await pool.end();

  log('\n=== HOTOVO ===');
  log(`Demo URL:  http://localhost:3015/demo/the-barber-demo`);
  log(`Cookie:    venom_access_the-barber-demo=${ACCESS_TOKEN}`);
}

seed().catch(e => { console.error(e); process.exit(1); });
