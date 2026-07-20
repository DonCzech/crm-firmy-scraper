/**
 * FÁZE 2 — Seed DB pro hairsalon-no1-demo
 * WordPress + Flatsome theme, 5 stránek
 *
 * Spustit: node scripts/seed-hairsalon-no1-demo.mjs
 */

import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'hairsalon-no1-demo';
const ACCESS_TOKEN = 'no1hair' + Math.random().toString(36).slice(2, 12);
const CLONE_PATH = '/clones/hairsalon-no1';

const CSS_URLS = [
  `${CLONE_PATH}/wp-content/themes/flatsome/assets/css/flatsome.css`,
  `${CLONE_PATH}/wp-content/themes/flatsome-child/style.css`,
  `${CLONE_PATH}/wp-content/plugins/wp-google-places-review-slider/public/css/wprev-public_combine.css`,
  `${CLONE_PATH}/wp-content/tablepress-combined.min.css`,
];

const JS_URLS = [
  `${CLONE_PATH}/kill-cmplz.js`,  // PRVNÍ — blokuje Complianz/PUM před načtením
  `${CLONE_PATH}/wp-includes/js/jquery/jquery.min.js`,
  `${CLONE_PATH}/wp-includes/js/jquery/jquery-migrate.min.js`,
  `${CLONE_PATH}/wp-includes/js/hoverIntent.min.js`,
  `${CLONE_PATH}/wp-includes/js/dist/hooks.min.js`,
  `${CLONE_PATH}/wp-content/themes/flatsome/assets/js/flatsome.js`,
  `${CLONE_PATH}/wp-content/themes/flatsome/assets/js/chunk.slider.js`,
];

const PAGES = [
  { slug: 'home',     title: 'Úvod',    file: 'home.html',    isHome: true  },
  { slug: 'salon',    title: 'Salon',   file: 'salon.html',   isHome: false },
  { slug: 'tym',      title: 'Tým',     file: 'tym.html',     isHome: false },
  { slug: 'galerie',  title: 'Galerie', file: 'galerie.html', isHome: false },
  { slug: 'kariera',  title: 'Kariéra', file: 'kariera.html', isHome: false },
];

function log(msg) { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }

async function seed() {
  log('=== Seed hairsalon-no1-demo ===');

  // Smazat existujícího tenanta
  log('Deleting existing tenant if present...');
  const delRes = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [TENANT_SLUG]);
  if (delRes.rowCount > 0) log(`  Deleted tenant ${delRes.rows[0].id}`);

  // Najít barber template
  const tplRes = await pool.query(`SELECT id FROM templates WHERE key = 'barber' LIMIT 1`);
  if (!tplRes.rows.length) throw new Error('Template barber not found in DB');
  const templateId = tplRes.rows[0].id;
  log(`Using template id: ${templateId} (barber)`);

  // Vytvořit tenant
  const tenantRes = await pool.query(`
    INSERT INTO tenants (
      slug, template_id, business_name, industry,
      email, lifecycle_status, access_token, analytics_config
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING id
  `, [
    TENANT_SLUG,
    templateId,
    'Demo Hair Salon',
    'kadeřnictví',
    'info@demo.local',
    'draft',
    ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'hairsalon-no1.cz', cms: 'WordPress/Flatsome' }),
  ]);
  const tenantId = tenantRes.rows[0].id;
  log(`Created tenant id: ${tenantId}, token: ${ACCESS_TOKEN}`);

  // Vytvořit stránky + sekce
  for (let i = 0; i < PAGES.length; i++) {
    const p = PAGES[i];
    const htmlPath = path.join(ROOT, `public/clones/hairsalon-no1/pages/${p.file}`);

    if (!fs.existsSync(htmlPath)) {
      log(`  SKIP: ${htmlPath} not found`);
      continue;
    }
    const raw = fs.readFileSync(htmlPath, 'utf-8');
    // Patch: strip @font-face blocks with absolute /home/www/ server paths
    // (brand-scrubbed from hairsalon-no1.cz → demo.local, fonts not locally available)
    const html = raw.replace(/@font-face\s*\{[\s\S]*?\/home\/www\/[\s\S]*?\}/gi, '');
    log(`  Page ${p.slug}: HTML ${raw.length}→${html.length} chars`);

    // Vytvořit page
    const seoTitle = p.isHome ? 'Demo Hair Salon — Ukázka kadeřnického webu' : `${p.title} — Demo Hair Salon`;
    const seoDesc = 'Ukázka šablony pro kadeřnický salon. WordPress/Flatsome design.';
    const pageRes = await pool.query(`
      INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description, noindex)
      VALUES ($1,$2,$3,$4,'published',$5,$6,true)
      RETURNING id
    `, [tenantId, p.slug, p.title, p.isHome, seoTitle, seoDesc]);
    const pageId = pageRes.rows[0].id;

    // Vytvořit full-page-clone sekci
    const secRes = await pool.query(`
      INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
      VALUES ($1,$2,'full-page-clone','default',0,true,$3)
      RETURNING id
    `, [tenantId, pageId, JSON.stringify({
      html,
      cssFiles: CSS_URLS,
      jsFiles: JS_URLS,
    })]);
    log(`  → page ${pageId}, section ${secRes.rows[0].id}`);
  }

  log(`\n✅ Done!`);
  log(`   Preview: http://localhost:3015/demo/${TENANT_SLUG}`);
  log(`   Admin:   http://localhost:3015/demo/${TENANT_SLUG}/admin`);
  log(`   Token:   ${ACCESS_TOKEN}`);

  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
