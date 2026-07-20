/**
 * FÁZE 2 — Seed perfectcatering-demo
 * Nuxt.js SSR, single-page (anchor nav), catering firma
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG        = 'perfectcatering';
const TENANT_SLUG = 'perfectcatering-demo';
const ACCESS_TOKEN = 'pcat' + Math.random().toString(36).slice(2, 13);

// CSS: all files, fonts first
const CSS_ALL = fs.readdirSync(`public/clones/${SLUG}/css`).sort();
const CSS_URLS = [
  `/clones/${SLUG}/fonts/fonts.css`,
  ...CSS_ALL.map(f => `/clones/${SLUG}/css/${f}`),
];

// JS: only kill-external.js (no Nuxt runtime — prevents hydration errors)
const JS_URLS = [
  `/clones/${SLUG}/js/kill-external.js`,
];

console.log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

function extractAndPatch(rawHtml) {
  const bodyM = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyM ? bodyM[1] : rawHtml;

  // The HTML was already processed by mirror script — just do minimal extras
  // Remove any leftover teleports/cmp divs that Nuxt runtime would inject
  body = body
    .replace(/<div[^>]*id="cmp-[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="teleports"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="nprogress"[^>]*>[\s\S]*?<\/div>/gi, '');

  return body;
}

log('=== Seed perfectcatering-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
const templateId = tpl.rows[0]?.id ?? 2;

const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [
  TENANT_SLUG, templateId,
  'Demo Catering Praha', 'catering & gastronomie',
  'info@demo.local', ACCESS_TOKEN,
  JSON.stringify({ cloneSource: 'perfectcatering.cz', cms: 'Nuxt.js SSR' }),
]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

// Single page — homepage only (single-page site with anchor nav)
const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/home.html`);
if (!fs.existsSync(htmlPath)) throw new Error(`home.html not found at ${htmlPath}`);

const rawHtml = fs.readFileSync(htmlPath, 'utf8');
const html = extractAndPatch(rawHtml);
log(`home.html: ${rawHtml.length} → ${html.length} bytes`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,$2,$3)
  ON CONFLICT (tenant_id,slug) DO UPDATE SET title='Domů',is_homepage=true
  RETURNING id
`, [
  tid,
  'Demo Catering — Ukázka šablony pro cateringovou firmu',
  'Prémiová webová šablona pro cateringovou firmu. Galerie jídel, přehled služeb, tým a kontaktní formulář.',
]);
const pageId = pg2.rows[0].id;

await pool.query(`
  INSERT INTO sections (tenant_id,page_id,section_type,settings,order_index,is_visible)
  VALUES ($1,$2,'full-page-clone',$3,0,true)
  ON CONFLICT DO NOTHING
`, [tid, pageId, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);

log(`Page ${pageId} → section ✅`);

// Publish
await pool.query(`UPDATE tenants SET lifecycle_status='published' WHERE id=$1`, [tid]);
log(`Tenant ${tid} published ✅`);

await pool.end();
log(`=== HOTOVO ===`);
log(`URL: http://localhost:3015/demo/${TENANT_SLUG}`);
log(`Token: ${ACCESS_TOKEN}`);
