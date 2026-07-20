/**
 * Seed corleone-demo — Pizzeria/Ristorante Praha
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'corleone';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'corleone-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const rawHtml = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home-raw.html`), 'utf8');
log(`Read home-raw.html: ${rawHtml.length} bytes`);

// Split after </head>
const headEnd = rawHtml.indexOf('</head>');
const afterHead = headEnd > -1 ? rawHtml.slice(headEnd + 7) : rawHtml;
const bodyM = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : afterHead;
log(`Body extracted: ${body.length} bytes`);

// Strip scripts + noscript
const scriptsBefore = (body.match(/<script[\s\S]*?<\/script>/gi) || []).length;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
log(`Removed ${scriptsBefore} script tags`);

// Rewrite Wix CDN image URLs — last path segment = local filename
function wixToLocal(url) {
  try {
    const noQuery = url.split('?')[0];
    const segments = noQuery.split('/');
    const rawFname = segments[segments.length - 1];
    // Try encoded first (as saved), then decoded
    for (const fn of [rawFname, decodeURIComponent(rawFname)]) {
      const localPath = `/clones/${SLUG}/img/${fn}`;
      if (fs.existsSync(path.join(ROOT, 'public', localPath))) return localPath;
    }
    // Also try just the hash filename (first media segment)
    const mediaIdx = segments.findIndex(s => s === 'media');
    if (mediaIdx > -1 && segments[mediaIdx+1]) {
      const hashFname = segments[mediaIdx+1];
      const localPath = `/clones/${SLUG}/img/${hashFname}`;
      if (fs.existsSync(path.join(ROOT, 'public', localPath))) return localPath;
    }
  } catch {}
  return null;
}

let imgFixed = 0;
// Fix src="..." Wix CDN URLs
body = body.replace(/src="(https?:\/\/static\.wixstatic\.com\/[^"]+)"/g, (match, url) => {
  const local = wixToLocal(url);
  if (local) { imgFixed++; return `src="${local}"`; }
  return match;
});
// Fix data-src (lazy load)
body = body.replace(/data-src="(https?:\/\/static\.wixstatic\.com\/[^"]+)"/g, (match, url) => {
  const local = wixToLocal(url);
  if (local) { imgFixed++; return `src="${local}"`; }
  return `src=""`;
});
// Remove srcset (Wix-specific, not needed)
body = body.replace(/srcset="[^"]*static\.wixstatic\.com[^"]*"/gi, '');
// Fix background-image inline styles
let bgFixed = 0;
body = body.replace(/url\(["']?(https?:\/\/static\.wixstatic\.com\/[^"')?]+)["']?\)/g, (match, url) => {
  const local = wixToLocal(url);
  if (local) { bgFixed++; return `url('${local}')`; }
  return match;
});
log(`Fixed ${imgFixed} img src + ${bgFixed} background-image refs`);

// Fix internal links
body = body.replace(/href="https?:\/\/(?:www\.)?corleone\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/action="[^"]*corleone[^"]*"/gi, 'action="#"');

// CMS scrub — add Demo prefix, replace contacts
body = body
  .replace(/(?<!Demo\s)\bCorleone\b/g, 'Demo Corleone')
  .replace(/corleone\.cz/gi, 'demo.local')
  .replace(/\+420\s*[0-9]{3}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@corleone\.cz/gi, 'info@demo.local')
  .replace(/[a-z._+-]+@demo\.local/gi, 'info@demo.local');

// Style overrides
const styleOverride = `<style>
/* Venom corleone demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"],[id*="Cookie"] { display: none !important; }
.modal-backdrop, .modal-overlay { display: none !important; }
/* Fix images */
img { max-width: 100%; height: auto; }
/* Hide empty iframes */
iframe:not([src]) { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

// CSS / JS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`)).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

// Audit
const brandRefs = (body.match(/(?<!Demo\s)\bCorleone\b/g) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|w3\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brandRefs} extRefs=${extRefs} body=${body.length}B`);

// DB
const ACCESS_TOKEN = 'corleone' + Math.random().toString(36).slice(2, 10);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Corleone', 'Pizzeria / Ristorante Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'corleone.cz' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
  VALUES ($1, 'home', 'Domů', true, 'Demo Corleone — Ukázka šablony', 'Ukázka prémiové šablony pro restauraci.')
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
