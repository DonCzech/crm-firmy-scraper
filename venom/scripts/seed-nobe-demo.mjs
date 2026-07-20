/**
 * Seed nobe-demo — Autoškola NOBE (WordPress, custom simonet theme)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'nobe';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'nobe-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const rawHtml = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home-raw.html`), 'utf8');
log(`Read home-raw.html: ${rawHtml.length} bytes`);

// Split after </head> to avoid JS comment body tag issues
const headEnd = rawHtml.indexOf('</head>');
const afterHead = headEnd > -1 ? rawHtml.slice(headEnd + 7) : rawHtml;
const bodyM = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : afterHead;
log(`Body extracted: ${body.length} bytes`);

// Strip all scripts + noscript
const scriptsBefore = (body.match(/<script[\s\S]*?<\/script>/gi) || []).length;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
log(`Removed ${scriptsBefore} script tags`);

// Fix WP img src URLs → local
const localImgs = new Set(fs.readdirSync(path.join(ROOT, `public/clones/${SLUG}/img`)));

function wpToLocal(url) {
  try {
    const noQuery = url.split('?')[0];
    const fname = noQuery.split('/').pop();
    if (localImgs.has(fname)) return `/clones/${SLUG}/img/${fname}`;
    const decoded = decodeURIComponent(fname);
    if (localImgs.has(decoded)) return `/clones/${SLUG}/img/${decoded}`;
  } catch {}
  return null;
}

let imgFixed = 0;
body = body.replace(/src="(https?:\/\/(?:www\.)?nobe\.cz\/wp-content\/[^"]+)"/g, (match, url) => {
  const local = wpToLocal(url);
  if (local) { imgFixed++; return `src="${local}"`; }
  return match;
});
body = body.replace(/data-src="(https?:\/\/(?:www\.)?nobe\.cz\/wp-content\/[^"]+)"/g, (match, url) => {
  const local = wpToLocal(url);
  if (local) { imgFixed++; return `src="${local}"`; }
  return `src=""`;
});
// Fix srcset
body = body.replace(/srcset="[^"]*nobe\.cz[^"]*"/gi, '');
// Fix background-image inline
let bgFixed = 0;
body = body.replace(/url\(["']?(https?:\/\/(?:www\.)?nobe\.cz\/wp-content\/[^"')?]+)["']?\)/g, (match, url) => {
  const local = wpToLocal(url);
  if (local) { bgFixed++; return `url('${local}')`; }
  return match;
});
// Fix data-thumb, data-image (MetaSlider lazy load)
body = body.replace(/data-thumb="https?:\/\/(?:www\.)?nobe\.cz\/wp-content\/([^"]+)"/g, (match, path) => {
  const fname = path.split('/').pop().split('?')[0];
  return localImgs.has(fname) ? `data-thumb="/clones/${SLUG}/img/${fname}"` : 'data-thumb=""';
});
body = body.replace(/data-image="https?:\/\/(?:www\.)?nobe\.cz\/wp-content\/([^"]+)"/g, (match, path) => {
  const fname = path.split('/').pop().split('?')[0];
  return localImgs.has(fname) ? `data-image="/clones/${SLUG}/img/${fname}"` : 'data-image=""';
});
// Strip all remaining nobe.cz in data-* attributes
body = body.replace(/data-[a-z-]+="https?:\/\/(?:www\.)?nobe\.cz[^"]*"/gi, '');
// Fix content= meta (og, twitter)
body = body.replace(/content="https?:\/\/(?:www\.)?nobe\.cz[^"]*"/gi, 'content=""');
// Remove vimeo iframes
body = body.replace(/<iframe[^>]*player\.vimeo\.com[^>]*>[\s\S]*?<\/iframe>/gi, '');
body = body.replace(/<iframe[^>]*(?:youtube\.com|youtu\.be)[^>]*>[\s\S]*?<\/iframe>/gi, '');
// Nullify social footer links (keep text, remove href target)
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|twitter|youtube|linkedin)\.com[^"]*"/gi, 'href="#"');
// Partner / theme links
body = body.replace(/href="https?:\/\/(?:nobe\.moje-autoskola|www\.autoskola-testy|simonet)\.(?:cz|com)[^"]*"/gi, 'href="#"');
log(`Fixed ${imgFixed} img src + ${bgFixed} bg-image refs`);

// Fix internal links
body = body.replace(/href="https?:\/\/(?:www\.)?nobe\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/action="[^"]*nobe[^"]*"/gi, 'action="#"');

// CMS scrub — nobe.cz in text/URLs
body = body
  .replace(/Autoškola\s+NOBE/g, 'Demo autoškola')
  .replace(/autoškola\s+NOBE/gi, 'Demo autoškola')
  .replace(/\bNOBE\b/g, 'DEMO')
  .replace(/nobe\.cz/gi, 'demo.local')
  .replace(/nobe\.moje-autoskola\.cz/gi, 'demo.local')
  .replace(/\+420\s*[0-9]{3}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@nobe\.cz/gi, 'info@demo.local')
  .replace(/[a-z._+-]+@demo\.local/gi, 'info@demo.local');

// Style overrides
const styleOverride = `<style>
/* Venom nobe demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"],[id*="Cookie"] { display: none !important; }
.modal-backdrop, .modal-overlay, .popup-overlay { display: none !important; }
/* Fix images */
img { max-width: 100%; height: auto; }
/* Hide empty iframes */
iframe:not([src]), iframe[src=""] { display: none !important; }
/* MetaSlider fix */
.metaslider .flexslider { margin: 0; }
/* Header logo fix */
.site-header .logo img { max-height: 65px; width: auto; }
</style>`;
body = styleOverride + '\n' + body;

// CSS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`))
  .filter(f => f.endsWith('.css'))
  .sort()
  .map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

// Audit
const brandRefs = (body.match(/\bNOBE\b/g) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|w3\.org|www\.w3\.org|gmpg\.org|api\.w\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brandRefs} extRefs=${extRefs} body=${body.length}B`);

// DB
const ACCESS_TOKEN = 'nobe' + Math.random().toString(36).slice(2, 10);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo autoškola', 'Autoškola Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'nobe.cz', cms: 'WordPress simonet theme' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
  VALUES ($1, 'home', 'Domů', true, 'Demo Autoškola — Ukázka šablony', 'Ukázka prémiové šablony pro autoškolu.')
  RETURNING id
`, [tid]);

await pool.query(`
  INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
  VALUES ($1, $2, 'full-page-clone', $3, 0, true)
`, [tid, pg2.rows[0].id, JSON.stringify({ html: body, cssUrls: allCss, jsUrls: JS })]);
log(`home → page ${pg2.rows[0].id} ✅`);

await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Published ✅`);
await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
