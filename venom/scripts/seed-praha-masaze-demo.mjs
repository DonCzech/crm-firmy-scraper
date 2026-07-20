/**
 * FÁZE 2 — Seed DB pro praha-masaze-demo
 * WordPress + GeneratePress — 3 stránky: home, cenik, rezervace
 *
 * Spustit: node scripts/seed-praha-masaze-demo.mjs
 */

import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'praha-masaze-demo';
const ACCESS_TOKEN = 'masaze' + Math.random().toString(36).slice(2, 10);
const CLONE_PATH = '/clones/praha-masaze';

const CSS_URLS = [`${CLONE_PATH}/fonts/fonts.css`];
const JS_URLS = [
  `${CLONE_PATH}/js/jquery.min.js`,
  `${CLONE_PATH}/js/jquery-migrate.min.js`,
  `${CLONE_PATH}/js/gp-menu.min.js`,
  `${CLONE_PATH}/js/main.js`,
];

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function seed() {
  log('=== Seed praha-masaze-demo ===');

  const pages = [
    {
      htmlPath: '/tmp/praha-masaze-home.html',
      slug: 'home',
      title: 'Demo Masáže — Masážní terapie',
      isHomepage: true,
      seoTitle: 'Demo Masáže — Ukázka šablony wellness',
      seoDesc: 'Ukázka šablony masáže a wellness pro Venom SaaS. Klasická, sportovní, thajská masáž.',
      navLabel: 'Domů',
    },
    {
      htmlPath: '/tmp/praha-masaze-cenik.html',
      slug: 'cenik',
      title: 'Ceník masáží',
      isHomepage: false,
      seoTitle: 'Ceník masáží — Praha Masáže Demo',
      seoDesc: 'Ceník masáží a wellness procedur. Klasická relaxační od 500 Kč.',
      navLabel: 'Ceník',
    },
    {
      htmlPath: '/tmp/praha-masaze-rezervace.html',
      slug: 'rezervace',
      title: 'Rezervace masáže',
      isHomepage: false,
      seoTitle: 'Rezervace masáže — Praha Masáže Demo',
      seoDesc: 'Online rezervace masáže. Vyplňte formulář a my vás kontaktujeme.',
      navLabel: 'Rezervace',
    },
  ];

  // Validate HTML files
  for (const p of pages) {
    if (!fs.existsSync(p.htmlPath)) {
      throw new Error(`HTML not found: ${p.htmlPath}. Run mirror-praha-masaze-assets.mjs first.`);
    }
  }

  // Delete existing tenant (CASCADE)
  log('Deleting existing tenant if present...');
  const delRes = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [TENANT_SLUG]);
  if (delRes.rowCount > 0) log(`  Deleted tenant id: ${delRes.rows[0].id}`);

  // Find wellness template
  const tplRes = await pool.query(`SELECT id FROM templates WHERE key = 'wellness' LIMIT 1`);
  if (!tplRes.rows.length) throw new Error('Template wellness not found in DB');
  const templateId = tplRes.rows[0].id;
  log(`Using template id: ${templateId} (wellness)`);

  // Create tenant
  const tenantRes = await pool.query(
    `INSERT INTO tenants (slug, template_id, industry, status, email, access_token)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [TENANT_SLUG, templateId, 'wellness', 'demo', 'info@demo.local', ACCESS_TOKEN]
  );
  const tenantId = tenantRes.rows[0].id;
  log(`Created tenant id: ${tenantId}`);

  // Create pages
  for (const p of pages) {
    const html = fs.readFileSync(p.htmlPath, 'utf-8');
    log(`\nPage: ${p.slug} (${(html.length / 1024).toFixed(0)}KB)`);

    const pageRes = await pool.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [tenantId, p.slug, p.title, p.isHomepage, 'published', p.seoTitle, p.seoDesc]
    );
    const pageId = pageRes.rows[0].id;
    log(`  Created page id: ${pageId}`);

    const settings = { html, cssUrls: CSS_URLS, jsUrls: JS_URLS };

    const secRes = await pool.query(
      `INSERT INTO sections
         (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [tenantId, pageId, 'full-page-clone', 'default', 0, true, JSON.stringify(settings)]
    );
    log(`  Created section id: ${secRes.rows[0].id}`);
  }

  await pool.end();

  log('\n=== HOTOVO ===');
  log(`Tenant slug: ${TENANT_SLUG}`);
  log(`Token:       ${ACCESS_TOKEN}`);
  log(`Demo URL:    http://localhost:3015/demo/${TENANT_SLUG}`);
  log(`Admin URL:   http://localhost:3015/demo/${TENANT_SLUG}/admin`);
  log(`Login URL:   http://localhost:3015/demo/${TENANT_SLUG}/login`);
  log(`\nCookie inject:`);
  log(`  name:  venom_access_${TENANT_SLUG}`);
  log(`  value: ${ACCESS_TOKEN}`);
}

seed().catch(e => { console.error(e); process.exit(1); });
