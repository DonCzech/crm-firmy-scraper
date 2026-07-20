/**
 * FÁZE 2+3+7 — skolapopulo-demo (doučování, Next.js SSR)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'skolapopulo';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'skolapopulo-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const rawHtml = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home-raw.html`), 'utf8');
log(`Read home-raw.html: ${rawHtml.length} bytes`);

const headEnd = rawHtml.indexOf('</head>');
const afterHead = headEnd > -1 ? rawHtml.slice(headEnd + 7) : rawHtml;
const bodyM = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : afterHead;
log(`Body: ${body.length} bytes`);

// Strip scripts
const sc = (body.match(/<script[\s\S]*?<\/script>/gi) || []).length;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
log(`Removed ${sc} scripts`);

// Fix Next.js image URLs → local
const localImgs = new Set(fs.readdirSync(path.join(ROOT, `public/clones/${SLUG}/img`)));
let imgFixed = 0;

body = body.replace(/src="(\/_next\/image\?url=([^"&]+)[^"]*)"/g, (match, fullUrl, encodedUrl) => {
  try {
    const actualUrl = decodeURIComponent(encodedUrl);
    const fname = actualUrl.split('/').pop().split('?')[0];
    if (localImgs.has(fname)) { imgFixed++; return `src="/clones/${SLUG}/img/${fname}"`; }
  } catch {}
  return `src=""`;
});

// Fix direct CloudFront URLs
body = body.replace(/src="https:\/\/dsid9yk0txf29\.cloudfront\.net\/([^"?]+)(?:\?[^"]*)?"/g, (match, path_) => {
  const fname = path_.split('/').pop();
  if (localImgs.has(fname)) { imgFixed++; return `src="/clones/${SLUG}/img/${fname}"`; }
  return `src=""`;
});
log(`Fixed ${imgFixed} img refs`);

// Fix srcsets
body = body.replace(/srcset="[^"]*(?:_next\/image|cloudfront)[^"]*"/gi, '');

// Fix internal links
body = body.replace(/href="https?:\/\/(?:www\.)?skolapopulo\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/action="[^"]*skolapopulo[^"]*"/gi, 'action="#"');
// Social
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com[^"]*"/gi, 'href="#"');

// CMS scrub
body = body
  .replace(/Škola\s+Populo/g, 'Demo doučování')
  .replace(/školy\s+Populo/gi, 'Demo doučování')
  .replace(/školou\s+Populo/gi, 'Demo doučováním')
  .replace(/Populo\b/g, 'Demo')
  .replace(/POPULO\b/g, 'DEMO')
  .replace(/skolapopulo\.cz/gi, 'demo.local')
  .replace(/\+420\s*730\s*701\s*601/g, '+420 608 288 777')
  .replace(/\+420730701601/g, '+420608288777')
  .replace(/[a-z._+-]+@skolapopulo\.cz/gi, 'info@demo.local')
  .replace(/[a-z._+-]+@demo\.local/gi, 'info@demo.local');

// SEO fix — noindex
const styleOverride = `<style>
/* Venom skolapopulo demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"] { display: none !important; }
img[src=""] { display: none !important; }
img { max-width: 100%; height: auto; }
iframe:not([src]), iframe[src=""] { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

// Audit
const brand = (body.match(/[Pp]opulo/g) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local|www\.demo\.local))/gi) || []).length;
log(`Audit: brand=${brand} extRefs=${extRefs} body=${body.length}B`);

// CSS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`)).filter(f=>f.endsWith('.css')).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

// DB
const ACCESS_TOKEN = 'skolapopulo' + Math.random().toString(36).slice(2, 8);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo doučování', 'Doučování & jazykové kurzy',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'skolapopulo.cz', cms: 'Next.js SSR' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,'Demo Doučování — Ukázka šablony','Ukázka prémiové šablony pro doučování.') RETURNING id
`, [tid]);

await pool.query(`
  INSERT INTO sections (tenant_id,page_id,section_type,settings,order_index,is_visible)
  VALUES ($1,$2,'full-page-clone',$3,0,true)
`, [tid, pg2.rows[0].id, JSON.stringify({ html: body, cssUrls: allCss, jsUrls: JS })]);
log(`page ${pg2.rows[0].id} ✅`);

await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Published ✅`);
await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
