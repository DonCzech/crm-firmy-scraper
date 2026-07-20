/**
 * FÁZE 2 — Seed DB pro studio-jarka-demo
 * Tilda CMS — CSS/JS z static.tildacdn.net (lokalizováno)
 *
 * Spustit: node scripts/seed-studio-jarka-demo.mjs
 */

import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'studio-jarka-demo';
const ACCESS_TOKEN = 'stujarka' + Math.random().toString(36).slice(2, 10);
const CLONE_PATH = '/clones/studio-jarka';

const CSS_URLS = [
  `${CLONE_PATH}/fonts.css`,
  `${CLONE_PATH}/css/tilda-grid-3.0.min.css`,
  `${CLONE_PATH}/css/tilda-blocks.min.css`,
  `${CLONE_PATH}/css/tilda-animation-2.0.min.css`,
  `${CLONE_PATH}/css/tilda-slds-1.4.min.css`,
  `${CLONE_PATH}/css/tilda-menu-widgeticons-1.0.min.css`,
];

const JS_URLS = [
  `${CLONE_PATH}/js/tilda-polyfill-1.0.min.js`,
  `${CLONE_PATH}/js/jquery-1.10.2.min.js`,
  `${CLONE_PATH}/js/tilda-scripts-3.0.min.js`,
  `${CLONE_PATH}/js/tilda-blocks.min.js`,
  `${CLONE_PATH}/js/tilda-lazyload-1.0.min.js`,
  `${CLONE_PATH}/js/tilda-animation-2.0.min.js`,
  `${CLONE_PATH}/js/tilda-zero-1.1.min.js`,
  `${CLONE_PATH}/js/tilda-slds-1.4.min.js`,
  `${CLONE_PATH}/js/hammer.min.js`,
  `${CLONE_PATH}/js/tilda-menu-1.0.min.js`,
  `${CLONE_PATH}/js/tilda-menu-widgeticons-1.0.min.js`,
  `${CLONE_PATH}/js/tilda-animation-sbs-1.0.min.js`,
  `${CLONE_PATH}/js/tilda-zero-scale-1.0.min.js`,
  `${CLONE_PATH}/js/tilda-skiplink-1.0.min.js`,
  `${CLONE_PATH}/js/tilda-events-1.0.min.js`,
  `${CLONE_PATH}/js/tilda-zero-init.js`,
  `${CLONE_PATH}/js/sj-slider.js`,
];

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function seed() {
  log('=== Seed studio-jarka-demo ===');

  const htmlPath = '/tmp/studio-jarka-home.html';
  if (!fs.existsSync(htmlPath)) {
    throw new Error('HTML not found. Run mirror-studio-jarka-assets.mjs first.');
  }
  const html = fs.readFileSync(htmlPath, 'utf-8');
  log(`HTML loaded: ${(html.length / 1024).toFixed(0)}KB`);

  log('Deleting existing tenant if present...');
  const delRes = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [TENANT_SLUG]);
  if (delRes.rowCount > 0) log(`  Deleted tenant id: ${delRes.rows[0].id}`);

  const tplRes = await pool.query(`SELECT id FROM templates WHERE key = 'barber' LIMIT 1`);
  if (!tplRes.rows.length) throw new Error('Template barber not found in DB');
  const templateId = tplRes.rows[0].id;
  log(`Using template id: ${templateId}`);

  const tenantRes = await pool.query(
    `INSERT INTO tenants (slug, template_id, industry, status, email, access_token)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [TENANT_SLUG, templateId, 'hair_salon', 'demo', 'info@demo.local', ACCESS_TOKEN]
  );
  const tenantId = tenantRes.rows[0].id;
  log(`Created tenant id: ${tenantId}`);

  const pageRes = await pool.query(
    `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      tenantId,
      'home',
      'Demo Hair Salon — Praha 1',
      true,
      'published',
      'Demo Hair Salon — Ukázka šablony kadeřnický salon',
      'Demo šablona kadeřnický salon pro Venom SaaS. Profesionální kadeřnictví, barvení, manikúra.',
    ]
  );
  const pageId = pageRes.rows[0].id;
  log(`Created page id: ${pageId} (home)`);

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
