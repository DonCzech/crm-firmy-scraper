/**
 * Fáze 2 — Seed tenanta peak-cut-demo do DB
 * Single-page clone z barbershop-buddy.cz
 *
 * Spustit: node scripts/seed-peak-cut-demo.mjs
 */

import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'peak-cut-demo';
const CLONE_PATH = '/clones/peak-cut';
const ACCESS_TOKEN = 'peak' + Math.random().toString(36).slice(2, 12);

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

const CSS_URLS = [
  `${CLONE_PATH}/fonts/fonts.css`,
  `${CLONE_PATH}/wp-content/themes/buddy/_assets/module/normalize/normalize.css`,
  `${CLONE_PATH}/cdn/slick/slick.css`,
  `${CLONE_PATH}/wp-content/themes/buddy/style.css`,
];

// JS loaded inline via bundle.min.js (which wraps jQuery + slick + custom logic)
// We inject jQuery first, then slick, then bundle
const JS_URLS = [
  `${CLONE_PATH}/wp-includes/js/jquery/jquery.min.js`,
  `${CLONE_PATH}/wp-includes/js/jquery/jquery-migrate.min.js`,
  `${CLONE_PATH}/cdn/slick/slick.min.js`,
  `${CLONE_PATH}/wp-content/themes/buddy/_assets/js/bundle.min.js`,
];

async function seed() {
  log('=== Seed peak-cut-demo ===');

  // Read processed HTML
  const htmlPath = '/tmp/peak-cut-home.html';
  if (!fs.existsSync(htmlPath)) {
    throw new Error('HTML not found. Run mirror-peak-cut-assets.mjs first.');
  }
  const html = fs.readFileSync(htmlPath, 'utf-8');
  log(`HTML loaded: ${html.length} chars`);

  // ── Delete existing tenant (CASCADE removes pages + sections) ──────────────
  log('Deleting existing tenant if present...');
  const delRes = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [TENANT_SLUG]);
  if (delRes.rowCount > 0) log(`  Deleted tenant ${delRes.rows[0].id}`);

  // ── Find template id for 'barber' ──────────────────────────────────────────
  const tplRes = await pool.query(`SELECT id FROM templates WHERE key = 'barber' LIMIT 1`);
  if (!tplRes.rows.length) throw new Error('Template barber not found in DB');
  const templateId = tplRes.rows[0].id;
  log(`Using template id: ${templateId} (barber)`);

  // ── Create tenant ──────────────────────────────────────────────────────────
  const tenantRes = await pool.query(
    `INSERT INTO tenants (slug, template_id, industry, status, email, access_token)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      TENANT_SLUG,
      templateId,
      'barber',
      'demo',
      'info@demo.local',
      ACCESS_TOKEN,
    ]
  );
  const tenantId = tenantRes.rows[0].id;
  log(`Created tenant id: ${tenantId}`);

  log(`Access token set in tenants.access_token`);

  // ── Create homepage ────────────────────────────────────────────────────────
  const pageRes = await pool.query(
    `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      tenantId,
      'home',
      'Peak Cut Barbershop — Pánské střihy Praha',
      true,
      'published',
      'Peak Cut Barbershop — Pánské střihy Praha',
      'Profesionální pánské střihy, úprava vousů a holení v Praze. Rezervujte online.',
    ]
  );
  const pageId = pageRes.rows[0].id;
  log(`Created page id: ${pageId} (home)`);

  // ── Create full-page-clone section ────────────────────────────────────────
  const settings = {
    html,
    cssUrls: CSS_URLS,
    jsUrls: JS_URLS,
  };

  await pool.query(
    `INSERT INTO sections
       (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      tenantId,
      pageId,
      'full-page-clone',
      'default',
      0,
      true,
      JSON.stringify(settings),
    ]
  );
  log(`Created full-page-clone section`);

  log('');
  log('=== HOTOVO ===');
  log(`Demo URL:  http://localhost:3015/demo/${TENANT_SLUG}`);
  log(`Admin URL: http://localhost:3015/demo/${TENANT_SLUG}/admin`);
  log(`Cookie:    venom_access_${TENANT_SLUG}=${ACCESS_TOKEN}`);

  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
