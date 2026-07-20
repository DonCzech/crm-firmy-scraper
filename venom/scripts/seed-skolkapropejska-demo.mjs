/**
 * FÁZE 2+3+7 — skolkapropejska-demo (WordPress, hotel pro psy)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'skolkapropejska';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'skolkapropejska-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const rawHtml = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home-raw.html`), 'utf8');
log(`Read home-raw.html: ${rawHtml.length} bytes`);

const headEnd = rawHtml.indexOf('</head>');
const afterHead = headEnd > -1 ? rawHtml.slice(headEnd + 7) : rawHtml;
const bodyM = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : afterHead;
log(`Body: ${body.length} bytes`);

// Strip scripts + noscript
const sc = (body.match(/<script[\s\S]*?<\/script>/gi) || []).length;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
log(`Removed ${sc} scripts`);

// Build local img index
const localImgs = new Set(fs.readdirSync(path.join(ROOT, `public/clones/${SLUG}/img`)));
let imgFixed = 0;

// Fix WordPress wp-content image URLs
body = body.replace(/(?:https?:\/\/(?:www\.)?skolkapropejska\.cz)?\/wp-content\/uploads\/[^\s"'<>?#]+/gi, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${fname}`; }
  const base = fname.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  if (localImgs.has(base)) { imgFixed++; return `/clones/${SLUG}/img/${base}`; }
  return `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`;
});

// Fix wp-content theme/plugin assets
body = body.replace(/(?:https?:\/\/(?:www\.)?skolkapropejska\.cz)?\/wp-content\/(?:themes|plugins)\/[^\s"'<>?#]+\.(jpg|jpeg|png|webp|svg|gif)/gi, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${fname}`; }
  return match;
});

log(`Fixed ${imgFixed} img refs`);

// Fix external Google/YouTube/iframes
body = body.replace(/src="https?:\/\/(?:www\.)?(?:googleapis|gstatic|youtube|ytimg|recaptcha|google\.com\/recaptcha)[^"]+"/gi, 'src=""');
body = body.replace(/<iframe[^>]*googletagmanager[^>]*>[\s\S]*?<\/iframe>/gi, '');
body = body.replace(/<iframe[^>]*recaptcha[^>]*>[\s\S]*?<\/iframe>/gi, '');
body = body.replace(/<div[^>]*grecaptcha[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

// Fix internal links → #
body = body.replace(/href="https?:\/\/(?:www\.)?skolkapropejska\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="\/(?!clones)[^"#][^"]*"/g, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com[^"]*"/gi, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google)[^"]*"/gi, 'href="#"');
body = body.replace(/action="[^"]*skolkapropejska[^"]*"/gi, 'action="#"');

// Remove cookie bars
body = body.replace(/<[^>]*(?:cookie|Cookie|gdpr|cmplz)[^>]*>[\s\S]{0,3000}?<\/[^>]+>/g, '');

// Remove popup/notification bar
body = body.replace(/<[^>]*(?:popup|notification|notice|modal)[^>]*>[\s\S]{0,5000}?<\/[^>]+>/gi, '');

// CMS brand scrub — domain FIRST, then words
body = body
  // Domain first (musí být před generickým replacem)
  .replace(/skolkapropejska\.cz/gi, 'demo.local')
  // Brand name variants
  .replace(/ŠKOLKA PRO PEJSKA/g, 'DEMO HOTEL PRO PSY')
  .replace(/Školka\s+pro\s+pejska/g, 'Demo Hotel pro psy')
  .replace(/školka\s+pro\s+pejska/g, 'demo hotel pro psy')
  // Slug in paths (AFTER domain replace) — musí přijít PŘED generickým replace
  // (slug je 'skolkapropejska' bez mezery, bezpečný)
  // Generic (only after domain+brand above)
  .replace(/skolkapropejska/gi, 'demo-hotel-psi')
  // Contact
  .replace(/\+420\s*605\s*546\s*674/g, '+420 608 288 777')
  .replace(/\+420\s*737\s*398\s*723/g, '+420 608 288 777')
  .replace(/K\s+Vrtilce\s+\d+[^<,]*/gi, 'Demo ulice 1, Praha')
  // IČO
  .replace(/\b\d{8}\b/g, '12345678');

// Fix path corruption after brand scrub
body = body.replaceAll('/clones/demo-hotel-psi/', `/clones/${SLUG}/`);
log(`Path corruption fixed`);

// Style override
const styleOverride = `<style>
/* Venom skolkapropejska demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"],[id*="gdpr"],[class*="cmplz"],
[class*="popup"],[id*="popup"],[class*="modal"],[class*="notification"],
[class*="grecaptcha"],[id*="grecaptcha"] { display: none !important; }
img[src="data:image/gif"] { display: none !important; }
img[src=""], img[src="data:"] { display: none !important; }
img { max-width: 100%; height: auto; }
iframe:not([src]), iframe[src=""] { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

// Audit
const stripped = body.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
const brand = (stripped.match(/[Šš]kolka\s*pro\s*pejska|skolkapropejska\.cz/g) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brand} extRefs=${extRefs} body=${body.length}B`);

// CSS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`))
  .filter(f => f.endsWith('.css')).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

const ACCESS_TOKEN = 'skolkapropejska' + Math.random().toString(36).slice(2, 8);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Hotel pro psy', 'Psí hotel & školka',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'skolkapropejska.cz', cms: 'WordPress' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,'Demo Hotel pro psy — Psí hotel & školka','Ukázka prémiové šablony pro psí hotel a školku.') RETURNING id
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
