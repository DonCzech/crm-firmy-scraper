/**
 * FÁZE 2+3+7 — veterinafenix-demo (WordPress, veterinární klinika)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'veterinafenix';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'veterinafenix-demo';

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
// Pattern: https://www.veterinafenix.cz/wp-content/uploads/YEAR/MONTH/filename.jpg
body = body.replace(/(?:https?:\/\/(?:www\.)?veterinafenix\.cz)?\/wp-content\/uploads\/[^\s"'<>?#]+/gi, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${fname}`; }
  // Try without size suffix (e.g. img-300x200.jpg → img.jpg)
  const base = fname.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  if (localImgs.has(base)) { imgFixed++; return `/clones/${SLUG}/img/${base}`; }
  return `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`;
});

// Fix wp-content theme/plugin assets
body = body.replace(/(?:https?:\/\/(?:www\.)?veterinafenix\.cz)?\/wp-content\/(?:themes|plugins)\/[^\s"'<>?#]+/gi, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${fname}`; }
  return match; // Keep external wp-content refs (CSS/JS handled separately)
});

log(`Fixed ${imgFixed} img refs`);

// Fix external Google/YouTube URLs
body = body.replace(/src="https?:\/\/(?:www\.)?(?:googleapis|gstatic|youtube|ytimg)[^"]+"/gi, 'src=""');
body = body.replace(/<iframe[^>]*googletagmanager[^>]*>[\s\S]*?<\/iframe>/gi, '');

// Fix internal links → #
body = body.replace(/href="https?:\/\/(?:www\.)?veterinafenix\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="\/(?!clones)[^"#][^"]*"/g, 'href="#"');
// Social links
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com[^"]*"/gi, 'href="#"');
// Google maps
body = body.replace(/href="https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google)[^"]*"/gi, 'href="#"');
// Action forms
body = body.replace(/action="[^"]*veterinafenix[^"]*"/gi, 'action="#"');

// CMS brand scrub
body = body
  // Brand name variations
  .replace(/Veterinární\s+klinika\s+Fénix/gi, 'Demo Veterinární Klinika')
  .replace(/veterinární\s+klinika\s+fénix/gi, 'demo veterinární klinika')
  .replace(/Klinika\s+Fénix/gi, 'Demo Klinika')
  .replace(/klinika\s+Fénix/gi, 'Demo Klinika')
  .replace(/Fénix/g, 'Demo')
  .replace(/fénix/g, 'demo')
  .replace(/Fenix/g, 'Demo')
  .replace(/fenix/g, 'demo')
  // Domain
  .replace(/veterinafenix\.cz/gi, 'demo.local')
  // Contact
  .replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@veterinafenix\.cz/gi, 'info@demo.local')
  // Address — keep area general
  .replace(/Velehradská\s+\d+/gi, 'Demo ulice 1')
  .replace(/Praha\s+3/gi, 'Praha')
  // Real staff names (from WhatsApp photo filenames suggest female staff)
  .replace(/MVDr\.\s+\w+\s+\w+/gi, 'MVDr. Demo Lékař')
  .replace(/MVDr\.\s+\w+/gi, 'MVDr. Demo');

// Remove cookie/GDPR bars
body = body.replace(/<[^>]*(?:cookie|Cookie|gdpr|cmplz)[^>]*>[\s\S]{0,3000}?<\/[^>]+>/g, '');

// Remove Complianz (3 blocks pattern from Flatsome feedback)
body = body.replace(/<!--\s*Complianz[\s\S]{0,5000}?Complianz\s*-->/gi, '');

// Style override
const styleOverride = `<style>
/* Venom veterinafenix demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"],[id*="gdpr"],[class*="cmplz"] { display: none !important; }
img[src="data:image/gif"] { display: none !important; }
img[src=""], img[src="data:"] { display: none !important; }
img { max-width: 100%; height: auto; }
iframe:not([src]), iframe[src=""] { display: none !important; }
.flickity-viewport { min-height: 200px; }
</style>`;
body = styleOverride + '\n' + body;

// Audit
const brand = (body.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ')
  .match(/[Ff]énix|[Ff]enix|veterinafenix/g) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brand} extRefs=${extRefs} body=${body.length}B`);

// CSS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`))
  .filter(f => f.endsWith('.css') && !f.includes('www-player'))
  .sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

const ACCESS_TOKEN = 'veterinafenix' + Math.random().toString(36).slice(2, 8);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Veterinární Klinika', 'Veterinární péče o domácí zvířata',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'veterinafenix.cz', cms: 'WordPress' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,'Demo Veterinární Klinika — Péče o domácí zvířata','Ukázka prémiové šablony pro veterinární kliniku.') RETURNING id
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
