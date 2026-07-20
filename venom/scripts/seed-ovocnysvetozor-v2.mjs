/**
 * Seed ovocnysvetozor-demo v2
 * Fixes:
 * - Body extraction: split on </head> to avoid matching <body> inside JS comment
 * - Strip ALL <script> tags (Joomla jQuery not needed for static)
 * - Remove Google Maps (id="branches-mapa")
 * - Fix /images/ → local /clones/ovocnysvetozor/img/
 * - CMS scrub
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'ovocnysvetozor';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const rawHtml = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home-raw.html`), 'utf8');
log(`Read home-raw.html: ${rawHtml.length} bytes`);

// ─── CRITICAL: Split AFTER </head> to avoid matching <body> inside JS comments ──
const headEnd = rawHtml.indexOf('</head>');
if (headEnd === -1) { log('ERROR: </head> not found'); process.exit(1); }
const afterHead = rawHtml.slice(headEnd + 7); // 7 = length of '</head>'
log(`After </head>: ${afterHead.length} bytes`);

// Now extract body
const bodyM = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : afterHead;
log(`Body extracted: ${body.length} bytes`);

// ─── Strip ALL <script> tags (static page, no jQuery needed) ───────────────
const scriptsBefore = (body.match(/<script[\s\S]*?<\/script>/gi) || []).length;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
log(`Removed ${scriptsBefore} script tags`);

// ─── Remove noscript/GTM ────────────────────────────────────────────────────
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

// ─── Map: DO NOT remove DOM (breaks closing tags) — CSS hides it ───────────
// Just remove orphaned Google Maps API script URLs still in body
body = body.replace(/<iframe[^>]*google\.com\/maps[^>]*>[\s\S]*?<\/iframe>/gi, '');
log(`Map: CSS-only hide (DOM preserved to keep tag balance)`);

// ─── Fix image paths: /images/ → /clones/ovocnysvetozor/img/ ────────────────
let imgFixed = 0;
body = body.replace(/src="\/images\/([^"?#]+)(?:[?#][^"]*)?"/g, (match, fname) => {
  const localPath = `/clones/${SLUG}/img/${path.basename(fname)}`;
  const diskPath = path.join(ROOT, 'public', localPath);
  if (fs.existsSync(diskPath)) { imgFixed++; return `src="${localPath}"`; }
  return match;
});
log(`Fixed ${imgFixed} /images/ refs`);

// Fix url() in inline styles
body = body.replace(/url\(["']?\/images\/([^"')?]+)["']?\)/g, (match, fname) => {
  const localPath = `/clones/${SLUG}/img/${path.basename(fname)}`;
  const diskPath = path.join(ROOT, 'public', localPath);
  if (fs.existsSync(diskPath)) return `url('${localPath}')`;
  return match;
});

// ─── Fix CSS template paths ──────────────────────────────────────────────────
// Inline style tags with template paths
body = body.replace(/href="\/templates\/g5_hydrogen\/[^"?]*(?:\?[^"]*)?">/g, (m) => {
  const fname = path.basename(m.split('?')[0].replace('href="', '').replace('">', ''));
  const localPath = `/clones/${SLUG}/css/${fname}`;
  const diskPath = path.join(ROOT, 'public', localPath);
  if (fs.existsSync(diskPath)) return `href="${localPath}">`;
  return m;
});

// ─── Fix internal links → # ─────────────────────────────────────────────────
body = body.replace(/href="https?:\/\/(?:www\.)?ovocnysvetozor\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="\/(?!clones)([^"#]*)"/g, 'href="#"');
body = body.replace(/action="\/[^"]*"/g, 'action="#"');

// ─── CMS scrub ───────────────────────────────────────────────────────────────
body = body
  .replace(/Ovocný\s+Světozor/g, 'Demo Světozor')
  .replace(/Ovocny\s+Svetozor/gi, 'Demo Svetozor')
  .replace(/ovocnysvetozor\.cz/gi, 'demo.local')
  .replace(/\+420\s*[0-9]{3}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@ovocnysvetozor\.cz/gi, 'info@demo.local')
  .replace(/[a-z._+-]+@demo\.local/gi, 'info@demo.local'); // normalize

// ─── Remove web-integrator.cz credit link ────────────────────────────────────
body = body.replace(/<a[^>]*web-integrator\.cz[^>]*>[\s\S]*?<\/a>/gi, '');

// ─── Cookie consent CSS hide ─────────────────────────────────────────────────
const styleOverride = `<style>
/* Venom: hide Joomla dynamic elements */
#cookie-law-info-bar, .cookie-consent, [class*="cookie"], [id*="cookie"],
.popup-overlay, .modal, .modal-backdrop, #g-offcanvas { display: none !important; }
/* Hide the entire map block (Google Maps API required) — DOM preserved for tag balance */
#feature.feature-main { display: none !important; }
/* Hide empty blog/cookie sections */
#g-main, #g-main-top { display: none !important; }
/* Remove extra margin from feature-article section */
#g-navigation #feature-article .g-content-array { margin-top: 0 !important; }
/* Fix overflow */
#g-page-surround { overflow: hidden; }
/* Images */
img { max-width: 100%; height: auto; }
/* Hide login block */
#login { display: none !important; }
/* Navigation g-block borders */
.g-block.size-100 img { display: block; }
</style>`;
body = styleOverride + '\n' + body;

// ─── CSS / JS ─────────────────────────────────────────────────────────────────
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`)).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

// ─── Audit ───────────────────────────────────────────────────────────────────
const brandRefs = (body.match(/ovocnysvetozor\.cz/gi) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|w3\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brandRefs} extRefs=${extRefs} body=${body.length}B`);

// ─── Update DB ───────────────────────────────────────────────────────────────
const r = await pool.query(`
  SELECT s.id FROM sections s
  JOIN pages p ON s.page_id=p.id
  JOIN tenants t ON p.tenant_id=t.id
  WHERE t.slug='ovocnysvetozor-demo' LIMIT 1
`);
if (!r.rows.length) { log('ERROR: section not found — run v1 seed first'); process.exit(1); }
const secId = r.rows[0].id;

await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [
  JSON.stringify({ html: body, cssUrls: allCss, jsUrls: JS }),
  secId,
]);
log(`DB updated: body=${body.length}B cssUrls=${allCss.length} jsUrls=${JS.length} secId=${secId} ✅`);

await pool.end();
log('=== HOTOVO === http://localhost:3015/demo/ovocnysvetozor-demo');
