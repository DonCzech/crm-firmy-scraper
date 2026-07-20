/**
 * Seed jipka-demo — Jazyková škola Jipka (WordPress multisite, mango-jipka theme)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'jipka';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'jipka-demo';

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

// Fix WP img src URLs → local
const localImgs = new Set(fs.readdirSync(path.join(ROOT, `public/clones/${SLUG}/img`)));

function wpToLocal(url) {
  try {
    const noQuery = url.split('?')[0];
    const fname = noQuery.split('/').pop();
    if (localImgs.has(fname)) return `/clones/${SLUG}/img/${fname}`;
    const decoded = decodeURIComponent(fname);
    if (localImgs.has(decoded)) return `/clones/${SLUG}/img/${decoded}`;
    // Also strip size suffix (e.g. logo-300x300.png → logo.png)
    const stripped = fname.replace(/-\d+x\d+(\.[^.]+)$/, '$1');
    if (localImgs.has(stripped)) return `/clones/${SLUG}/img/${stripped}`;
  } catch {}
  return null;
}

let imgFixed = 0;
body = body.replace(/src="(https?:\/\/(?:www\.)?jipka\.cz\/wp-content\/[^"]+)"/g, (match, url) => {
  const local = wpToLocal(url);
  if (local) { imgFixed++; return `src="${local}"`; }
  return `src=""`;
});
body = body.replace(/data-src="(https?:\/\/(?:www\.)?jipka\.cz\/wp-content\/[^"]+)"/g, (match, url) => {
  const local = wpToLocal(url);
  if (local) { imgFixed++; return `src="${local}"`; }
  return `src=""`;
});
body = body.replace(/data-lazy-src="(https?:\/\/(?:www\.)?jipka\.cz\/wp-content\/[^"]+)"/g, (match, url) => {
  const local = wpToLocal(url);
  if (local) { imgFixed++; return `src="${local}"`; }
  return `src=""`;
});
body = body.replace(/srcset="[^"]*jipka\.cz[^"]*"/gi, '');
body = body.replace(/data-srcset="[^"]*jipka\.cz[^"]*"/gi, '');
// Theme dir images (not in uploads)
body = body.replace(/src="(https?:\/\/(?:www\.)?jipka\.cz\/wp-content\/themes\/[^"]+)"/g, (match, url) => {
  const local = wpToLocal(url);
  if (local) { imgFixed++; return `src="${local}"`; }
  return `src=""`;
});
let bgFixed = 0;
body = body.replace(/url\(["']?(https?:\/\/(?:www\.)?jipka\.cz\/wp-content\/[^"')?]+)["']?\)/g, (match, url) => {
  const local = wpToLocal(url);
  if (local) { bgFixed++; return `url('${local}')`; }
  return match;
});
// Fix data-* attrs with jipka.cz URLs
body = body.replace(/data-[a-z-]+="https?:\/\/(?:www\.)?jipka\.cz[^"]*"/gi, '');
// Fix content= meta
body = body.replace(/content="https?:\/\/(?:www\.)?jipka\.cz[^"]*"/gi, 'content=""');
log(`Fixed ${imgFixed} img src + ${bgFixed} bg-image refs`);

// Remove iframes (maps, embeds)
body = body.replace(/<iframe[^>]*(?:maps\.google|google\.com\/maps)[^>]*>[\s\S]*?<\/iframe>/gi, '');
body = body.replace(/<iframe[^>]*(?:youtube|youtu\.be|vimeo)[^>]*>[\s\S]*?<\/iframe>/gi, '');

// Fix links
body = body.replace(/href="https?:\/\/(?:www\.)?jipka\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="https?:\/\/[^"]*jipka\.[^"]*"/gi, 'href="#"');
body = body.replace(/action="[^"]*jipka[^"]*"/gi, 'action="#"');
// Nullify social links
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|twitter|youtube|linkedin)\.com[^"]*"/gi, 'href="#"');
// Nullify partner school links
body = body.replace(/href="https?:\/\/(?:www\.)?(?:eduagroup|topvision|jcl|tutor|digiskills)\.(?:cz|com)[^"]*"/gi, 'href="#"');
// Remove AWS S3 links (newsletter/ecomail form images)
body = body.replace(/src="https?:\/\/[^"]*amazonaws\.com[^"]*"/gi, 'src=""');
body = body.replace(/href="https?:\/\/[^"]*amazonaws\.com[^"]*"/gi, 'href="#"');
body = body.replace(/url\(['"]?https?:\/\/[^'")\s]*amazonaws\.com[^'")\s]*['"]?\)/gi, "url('')");
// Remove jsdelivr CDN link/script tags
body = body.replace(/<link[^>]*cdn\.jsdelivr\.net[^>]*>/gi, '');
body = body.replace(/src="https?:\/\/cdn\.jsdelivr\.net[^"]*"/gi, 'src=""');
// Strip @font-face rules with jipka.cz font URLs in inline styles
body = body.replace(/@font-face\s*\{[^}]*jipka\.cz[^}]*\}/gi, '');
// Strip remaining jipka.cz in inline style background-image
body = body.replace(/url\(['"]?https?:\/\/(?:www\.)?jipka\.cz[^'")\s]+['"]?\)/gi, "url('')");
// Strip any remaining jipka.cz in src/href attrs not caught above
body = body.replace(/(?:src|href|action|data-src)="https?:\/\/(?:www\.)?jipka\.cz[^"]*"/gi, (m) =>
  m.startsWith('src=') || m.startsWith('data-src=') ? 'src=""' : 'href="#"'
);

// CMS scrub
body = body
  .replace(/Jazyková\s+škola\s+Jipka/gi, 'Demo jazyková škola')
  .replace(/jazyková\s+škola\s+jipka/gi, 'Demo jazyková škola')
  .replace(/\bJipka\b/g, 'Demo')
  .replace(/\bJIPKA\b/g, 'DEMO')
  .replace(/jipka\.cz/gi, 'demo.local')
  .replace(/224\s*210\s*422/g, '+420 608 288 777')
  .replace(/\+420\s*[0-9]{3}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@jipka\.cz/gi, 'info@demo.local')
  .replace(/[a-z._+-]+@demo\.local/gi, 'info@demo.local');

// Style overrides
const styleOverride = `<style>
/* Venom jipka demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"],[id*="Cookie"] { display: none !important; }
[class*="cmplz"],[id*="cmplz"] { display: none !important; }
.modal-backdrop, .modal-overlay, .popup-overlay { display: none !important; }
/* Prevent horizontal overflow (Swiper/Elementor without JS) */
html, body { overflow-x: hidden !important; }
.swiper-wrapper { width: 100% !important; transform: none !important; flex-wrap: wrap !important; }
.swiper-slide { width: 100% !important; max-width: 100% !important; }
.swiper-slide:not(:first-child) { display: none !important; }
/* Fix Elementor sections */
.elementor-section, .e-con { max-width: 100vw !important; overflow: hidden !important; }
/* Fix images */
img[src=""] { display: none !important; }
img { max-width: 100%; height: auto; }
/* Hide empty iframes */
iframe:not([src]), iframe[src=""] { display: none !important; }
/* A3 lazy load placeholder */
.a3-lazy-load-placeholder { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

// CSS (filter only .css files)
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`))
  .filter(f => f.endsWith('.css'))
  .sort()
  .map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

// Audit
const brandRefs = (body.match(/\bjipka\.cz/gi) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|gmpg\.org|w3\.org|api\.w\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brandRefs} extRefs=${extRefs} body=${body.length}B`);

// DB
const ACCESS_TOKEN = 'jipka' + Math.random().toString(36).slice(2, 10);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo jazyková škola', 'Jazyková škola Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'jipka.cz', cms: 'WordPress multisite mango-jipka theme' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
  VALUES ($1, 'home', 'Domů', true, 'Demo Jazyková škola — Ukázka šablony', 'Ukázka prémiové šablony pro jazykovou školu.')
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
