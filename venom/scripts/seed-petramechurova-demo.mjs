/**
 * FÁZE 2 — Seed DB pro petramechurova-demo
 * Weblantis CMS + Bootstrap 5.3, 4 stránky
 */

import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'petramechurova-demo';
const ACCESS_TOKEN = 'petra' + Math.random().toString(36).slice(2, 12);
const CLONE_PATH = '/clones/petramechurova';

const CSS_URLS = [
  `${CLONE_PATH}/storage/creator/45/css/STkxeQf3Mcow5ZjpWehvibmbaoHr36En.css`,
  `${CLONE_PATH}/assets/css/basic.css`,
  `${CLONE_PATH}/assets/css/classes.css`,
  `${CLONE_PATH}/assets/css/animate.css`,
  `${CLONE_PATH}/assets/css/shuffle.css`,
  `${CLONE_PATH}/assets/css/lato-fonts.css`,
  `${CLONE_PATH}/assets/css/slick.min.css`,
];

const JS_URLS = [
  `${CLONE_PATH}/assets/js/kill-cdn.js`,   // PRVNÍ — blokuje CDN font/icon requesty
  `${CLONE_PATH}/assets/js/jquery-3.6.0.js`,
  `${CLONE_PATH}/assets/js/popper.min.js`,
  `${CLONE_PATH}/assets/js/bootstrap-5.3.bundle.min.js`,
  `${CLONE_PATH}/assets/js/wow.js`,
  `${CLONE_PATH}/assets/js/main.js`,
  `${CLONE_PATH}/assets/js/module.js`,
  `${CLONE_PATH}/assets/js/web_json_fill.js`,
  `${CLONE_PATH}/assets/js/gallery.js`,
  `${CLONE_PATH}/assets/js/index.js`,
  `${CLONE_PATH}/assets/js/slick.min.js`,
  // send.js odstraněno — Weblantis booking API
];

const PAGES = [
  { slug: 'home',     title: 'Úvod',     file: 'home.html',     isHome: true  },
  { slug: 'kolekce',  title: 'Kolekce',  file: 'kolekce.html',  isHome: false },
  { slug: 'kontakt',  title: 'Kontakt',  file: 'kontakt.html',  isHome: false },
  { slug: 'oceneni',  title: 'Ocenění',  file: 'oceneni.html',  isHome: false },
];

function log(msg) { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }

async function seed() {
  log('=== Seed petramechurova-demo ===');

  const delRes = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [TENANT_SLUG]);
  if (delRes.rowCount > 0) log(`  Deleted tenant ${delRes.rows[0].id}`);

  const tplRes = await pool.query(`SELECT id FROM templates WHERE key = 'barber' LIMIT 1`);
  if (!tplRes.rows.length) throw new Error('Template barber not found');
  const templateId = tplRes.rows[0].id;

  const tenantRes = await pool.query(`
    INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
    VALUES ($1,$2,$3,$4,$5,'draft',$6,$7)
    RETURNING id
  `, [
    TENANT_SLUG, templateId, 'Demo Hair Salon', 'kadeřnictví',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'petramechurova.cz', cms: 'Weblantis/Bootstrap5' }),
  ]);
  const tenantId = tenantRes.rows[0].id;
  log(`Created tenant id: ${tenantId}, token: ${ACCESS_TOKEN}`);

  for (let i = 0; i < PAGES.length; i++) {
    const p = PAGES[i];
    const htmlPath = path.join(ROOT, `public/clones/petramechurova/pages/${p.file}`);
    if (!fs.existsSync(htmlPath)) { log(`  SKIP: ${htmlPath}`); continue; }
    const html = fs.readFileSync(htmlPath, 'utf-8');
    log(`  Page ${p.slug}: ${html.length} chars`);

    const seoTitle = p.isHome ? 'Demo Hair Salon — Ukázka prémiového kadeřnického webu' : `${p.title} — Demo Hair Salon`;
    const pageRes = await pool.query(`
      INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description, noindex)
      VALUES ($1,$2,$3,$4,'published',$5,$6,true) RETURNING id
    `, [tenantId, p.slug, p.title, p.isHome, seoTitle, 'Ukázka prémiové kadeřnické šablony. Bootstrap 5 design.']);
    const pageId = pageRes.rows[0].id;

    const secRes = await pool.query(`
      INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
      VALUES ($1,$2,'full-page-clone','default',0,true,$3) RETURNING id
    `, [tenantId, pageId, JSON.stringify({ html, cssFiles: CSS_URLS, jsFiles: JS_URLS })]);
    log(`  → page ${pageId}, section ${secRes.rows[0].id}`);
  }

  log(`\n✅ Done!`);
  log(`   Preview: http://localhost:3015/demo/${TENANT_SLUG}`);
  log(`   Token:   ${ACCESS_TOKEN}`);
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
