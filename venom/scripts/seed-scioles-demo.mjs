/**
 * FÁZE 2+3+7 — scioles-demo (ASP.NET CMS, dobrodružné kroužky)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'scioles';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'scioles-demo';

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

// Build local img index (decoded and raw names)
const localImgs = new Set(fs.readdirSync(path.join(ROOT, `public/clones/${SLUG}/img`)));
// Also map URL-decoded names to encoded filenames
const decodedToEncoded = new Map();
for (const f of localImgs) {
  const decoded = decodeURIComponent(f);
  if (decoded !== f) decodedToEncoded.set(decoded, f);
}

let imgFixed = 0;

// Fix /media/HASH/filename.ext?... → /clones/scioles/img/filename.ext
body = body.replace(/(?:https:\/\/www\.scioles\.cz)?\/media\/[a-z0-9]+\/([^"'\s?&>]+)(?:\?[^"'>\s]*)?\b/g, (match, rawFilename) => {
  // rawFilename may be URL-encoded: stín → st%C3%ADn
  const decodedName = decodeURIComponent(rawFilename).split('/').pop().split('?')[0];
  const encodedName = decodedName.split('/').pop();
  // Try decoded name first
  if (localImgs.has(decodedName)) { imgFixed++; return `/clones/${SLUG}/img/${decodedName}`; }
  // Try raw (encoded) name
  if (localImgs.has(encodedName)) { imgFixed++; return `/clones/${SLUG}/img/${encodedName}`; }
  // Try with encoding
  const reencoded = encodeURIComponent(decodedName).replace(/%2F/g,'/');
  if (localImgs.has(reencoded)) { imgFixed++; return `/clones/${SLUG}/img/${reencoded}`; }
  return `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`;
});

log(`Fixed ${imgFixed} img refs`);

// Fix external Google/YouTube URLs in src
body = body.replace(/src="https?:\/\/(?:www\.)?(?:googleapis|gstatic|youtube|ytimg)[^"]+"/gi, 'src=""');
// Remove Google Analytics iframes
body = body.replace(/<iframe[^>]*googletagmanager[^>]*>[\s\S]*?<\/iframe>/gi, '');

// Fix internal links
body = body.replace(/href="https?:\/\/(?:www\.)?scioles\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="\/(?!clones)[^"#][^"]*"/g, 'href="#"');
// Social
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com[^"]*"/gi, 'href="#"');
// Action forms
body = body.replace(/action="[^"]*scioles[^"]*"/gi, 'action="#"');

// CMS brand scrub
body = body
  .replace(/ScioLes/g, 'Demo Kroužky')
  .replace(/Scioles/g, 'Demo kroužky')
  .replace(/scioles/g, 'demo-krouzky')
  .replace(/SCIOLES/g, 'DEMO KROUŽKY')
  .replace(/Scio\s+Les/gi, 'Demo Kroužky')
  .replace(/scioles\.cz/gi, 'demo.local')
  .replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@scioles\.cz/gi, 'info@demo.local')
  .replace(/[a-z._+-]+@scio\.cz/gi, 'info@demo.local')
  // Specific names / real persons
  .replace(/Martin\s+Havlíček/gi, 'Demo Lektor')
  .replace(/Havlíček\w*/gi, 'Demo');

// Remove cookie bar
body = body.replace(/<[^>]*(?:cookie|Cookie|gdpr)[^>]*>[\s\S]{0,2000}?<\/[^>]+>/g, '');

// Style override
const styleOverride = `<style>
/* Venom scioles demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"],[id*="gdpr"] { display: none !important; }
img[src="data:image/gif"] { display: none !important; }
img[src=""], img[src="data:"] { display: none !important; }
img { max-width: 100%; height: auto; }
iframe:not([src]), iframe[src=""] { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

// Audit
const brand = (body.match(/[Ss]cio[Ll]es|scioles/g) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brand} extRefs=${extRefs} body=${body.length}B`);

// CSS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`))
  .filter(f => f.endsWith('.css') && !f.includes('www-player'))
  .sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

const ACCESS_TOKEN = 'scioles' + Math.random().toString(36).slice(2, 8);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Kroužky', 'Dobrodružné kroužky pro děti',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'scioles.cz', cms: 'ASP.NET CMS' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,'Demo Kroužky — Dobrodružné kroužky pro děti','Ukázka prémiové šablony pro dobrodružné kroužky pro děti.') RETURNING id
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
