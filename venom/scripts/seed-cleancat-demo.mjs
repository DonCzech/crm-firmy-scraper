/**
 * FÁZE 2+3+7 — cleancat-demo (Custom CMS, úklidová firma)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'cleancat';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'cleancat-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const rawHtml = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home-raw.html`), 'utf8');
log(`Read home-raw.html: ${rawHtml.length} bytes`);

const headEnd = rawHtml.indexOf('</head>');
const afterHead = headEnd > -1 ? rawHtml.slice(headEnd + 7) : rawHtml;
const bodyM = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : afterHead;
log(`Body: ${body.length} bytes`);

const sc = (body.match(/<script[\s\S]*?<\/script>/gi) || []).length;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
log(`Removed ${sc} scripts`);

const localImgs = new Set(fs.readdirSync(path.join(ROOT, `public/clones/${SLUG}/img`)));
let imgFixed = 0;

// Custom CMS frontend paths
body = body.replace(/(?:https?:\/\/(?:www\.)?cleancat\.cz)?\/(?:frontend\/images|images|uploads|assets|files)\/[^\s"'<>?#]+\.(jpg|jpeg|png|webp|svg|gif|ico)/gi, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${fname}`; }
  const base = fname.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  if (localImgs.has(base)) { imgFixed++; return `/clones/${SLUG}/img/${base}`; }
  return `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`;
});

log(`Fixed ${imgFixed} img refs`);

// Replace the CleanCat inline SVG logo with a generic one
const genericLogoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 217 84.277" width="180"><rect width="217" height="84" rx="6" fill="#0a4a3a"/><text x="108" y="42" text-anchor="middle" fill="#69be28" font-family="Arial,sans-serif" font-size="28" font-weight="bold">DEMO</text><text x="108" y="68" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="18">Clean</text></svg>';
body = body.replace(/<svg[^>]*viewBox="0 0 217 84\.277"[^>]*>[\s\S]*?<\/svg>/gi, genericLogoSvg);

// External
body = body.replace(/src="https?:\/\/(?:www\.)?(?:googleapis|gstatic|youtube|ytimg|maps\.google|fonts\.gstatic|fonts\.googleapis)[^"]+"/gi, 'src=""');
body = body.replace(/<iframe[^>]*google[^>]*>[\s\S]*?<\/iframe>/gi, '');

body = body.replace(/href="https?:\/\/(?:www\.)?cleancat\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="\/(?!clones)[^"#][^"]*"/g, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com[^"]*"/gi, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google)[^"]*"/gi, 'href="#"');

body = body.replace(/<[^>]*(?:cookie|Cookie|gdpr|cmplz)[^>]*>[\s\S]{0,3000}?<\/[^>]+>/g, '');
body = body.replace(/<[^>]*(?:popup|notification|notice|modal)[^>]*>[\s\S]{0,5000}?<\/[^>]+>/gi, '');

// Brand scrub — domain FIRST
body = body
  .replace(/cleancat\.cz/gi, 'demo.local')
  // Brand
  .replace(/CLEANCAT/g, 'DEMO CLEAN')
  .replace(/CleanCat/g, 'Demo Clean')
  .replace(/Cleancat/g, 'Demo Clean')
  .replace(/cleancat/g, 'demo-clean')
  .replace(/\bHPF\b/g, 'DC')
  // Phone
  .replace(/\+420\s*596\s*134\s*922/g, '+420 608 288 777')
  .replace(/\+420596134922/g, '+420 608 288 777')
  .replace(/\+420\s*731\s*747\s*645/g, '+420 608 288 777')
  .replace(/\+420731747645/g, '+420 608 288 777')
  // Email
  .replace(/info@(?:cleancat|demo-clean)\.(?:cz|local)/gi, 'info@demo.local')
  // IČO (none specific found)
  .replace(/\b\d{8}\b/g, '12345678');

body = body.replaceAll(`/clones/demo-clean/`, `/clones/${SLUG}/`);
log(`Brand scrub done`);

const styleOverride = `<style>
/* Venom cleancat demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"],[id*="gdpr"],[class*="cmplz"],
[class*="popup"],[id*="popup"],[class*="modal"],[class*="notification"] { display: none !important; }
img[src="data:image/gif"] { display: none !important; }
img[src=""], img[src="data:"] { display: none !important; }
img { max-width: 100%; height: auto; }
iframe:not([src]), iframe[src=""] { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

const stripped = body.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
const brand = (stripped.match(/CleanCat|cleancat\.cz|CLEANCAT/gi) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brand} extRefs=${extRefs} body=${body.length}B`);

const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`))
  .filter(f => f.endsWith('.css')).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

const ACCESS_TOKEN = 'cleancat' + Math.random().toString(36).slice(2, 8);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Clean', 'Úklidová firma & mytí oken',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'cleancat.cz', cms: 'Custom CMS' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,'Demo Clean — Úklidová firma','Ukázka šablony pro úklidovou firmu.') RETURNING id
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
