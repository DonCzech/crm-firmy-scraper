/**
 * Seed ovocnysvetozor-demo
 * Joomla + Gantry 5 — cukrárna chain Praha
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'ovocnysvetozor';
const TENANT_SLUG = 'ovocnysvetozor-demo';
const ACCESS_TOKEN = 'svetozor' + Math.random().toString(36).slice(2, 10);

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = fs.existsSync(`public/clones/${SLUG}/css`)
  ? fs.readdirSync(`public/clones/${SLUG}/css`).filter(f => f.endsWith('.css')).sort().map(f => `/clones/${SLUG}/css/${f}`)
  : [];
const JS_URLS = [`/clones/${SLUG}/js/kill-external.js`];

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

function patchHtml(rawHtml) {
  const bodyM = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyM ? bodyM[1] : rawHtml;

  // Strip tracking scripts
  body = body
    .replace(/<script[^>]*(?:googletagmanager|gtag|analytics|cookiebot|hotjar)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/gi, '');

  // Hide cookie consent
  body = body.replace(/<div[^>]*(?:cookie|gdpr|consent)[^>]*>[\s\S]{0,5000}?<\/div>/gi, (m) => {
    if (m.length > 200) return '';
    return m;
  });

  // Fix image paths: /images/ → /clones/ovocnysvetozor/img/
  body = body.replace(/src="\/images\/([^"?]+)(?:\?[^"]*)?">/g, 'src="/clones/ovocnysvetozor/img/$1">');
  body = body.replace(/url\(["']?\/images\/([^"')?]+)["']?\)/g, "url('/clones/ovocnysvetozor/img/$1')");

  // Fix CSS paths in inline styles
  body = body.replace(/\/templates\/g5_hydrogen\/[^"'\s]*/g, (m) => {
    const fname = path.basename(m.split('?')[0]);
    return `/clones/${SLUG}/css/${fname}`;
  });
  body = body.replace(/\/media\/gantry5\/[^"'\s]*/g, (m) => {
    const fname = path.basename(m.split('?')[0]);
    const cssPath = `public/clones/${SLUG}/css/${fname}`;
    if (fs.existsSync(cssPath)) return `/clones/${SLUG}/css/${fname}`;
    return m;
  });

  // CMS / brand scrub
  body = body
    .replace(/Ovocný\s+Světozor/g, 'Demo Světozor')
    .replace(/ovocnysvetozor\.cz/gi, 'demo.local')
    .replace(/\+420\s*[0-9]{3}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}/g, '+420 608 288 777')
    .replace(/[a-z._+-]+@ovocnysvetozor\.cz/gi, 'info@demo.local');

  // Remove internal links
  body = body.replace(/href="https?:\/\/(?:www\.)?ovocnysvetozor\.cz([^"]*)"(?!.*clones)/gi, 'href="#"');

  // Remove map section (requires Google Maps API)
  body = body.replace(/<section[^>]*(?:kde-nas|mapa|map)[^>]*>[\s\S]{0,15000}?<\/section>/gi, (m) => {
    if (m.length > 1000) return '<!-- map section removed -->';
    return m;
  });

  // Style overrides
  const styleOverride = `<style>
/* Venom: hide Joomla dynamic elements */
.cookie-consent, #cookie-law-info-bar, [class*="cookie"], [id*="cookie"],
.popup-overlay, .modal, .modal-backdrop { display: none !important; }
/* Fix images that didn't load */
img { max-width: 100%; height: auto; }
</style>`;

  return styleOverride + '\n' + body;
}

log('=== Seed ovocnysvetozor-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Světozor', 'cukrárna Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'ovocnysvetozor.cz', cms: 'Joomla Gantry5' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/home.html`);
if (!fs.existsSync(htmlPath)) { log('MISSING home.html — run mirror first'); process.exit(1); }
const rawHtml = fs.readFileSync(htmlPath, 'utf8');
const html = patchHtml(rawHtml);
const ext = (html.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
const brand = (html.match(/ovocnysvetozor\.cz/gi) || []).length;
log(`home.html: ${rawHtml.length}→${html.length} | ext=${ext} brand=${brand}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
  VALUES ($1, 'home', 'Domů', true, 'Demo Světozor — Ukázka šablony', 'Ukázka šablony pro cukrárnu.')
  RETURNING id
`, [tid]);

await pool.query(`
  INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
  VALUES ($1, $2, 'full-page-clone', $3, 0, true)
`, [tid, pg2.rows[0].id, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);
log(`  home → page ${pg2.rows[0].id} ✅`);

await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Published ✅`);
await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
