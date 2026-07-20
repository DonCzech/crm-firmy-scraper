/**
 * FÁZE 2+3+7 — ucetnictvispravne-demo (WordPress + Elementor, účetní firma)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'ucetnictvispravne';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'ucetnictvispravne-demo';

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
body = body.replace(/(?:https?:\/\/(?:www\.)?ucetnictvispravne\.cz)?\/wp-content\/uploads\/[^\s"'<>?#]+/gi, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${fname}`; }
  const base = fname.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  if (localImgs.has(base)) { imgFixed++; return `/clones/${SLUG}/img/${base}`; }
  return `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`;
});

// Fix wp-content theme/plugin assets
body = body.replace(/(?:https?:\/\/(?:www\.)?ucetnictvispravne\.cz)?\/wp-content\/(?:themes|plugins)\/[^\s"'<>?#]+\.(jpg|jpeg|png|webp|svg|gif)/gi, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${fname}`; }
  return match;
});

log(`Fixed ${imgFixed} img refs`);

// Fix external Google/YouTube/iframes
body = body.replace(/src="https?:\/\/(?:www\.)?(?:googleapis|gstatic|youtube|ytimg|calendly)[^"]+"/gi, 'src=""');
body = body.replace(/<iframe[^>]*googletagmanager[^>]*>[\s\S]*?<\/iframe>/gi, '');
body = body.replace(/<iframe[^>]*calendly[^>]*>[\s\S]*?<\/iframe>/gi, '');

// Fix internal links → #
body = body.replace(/href="https?:\/\/(?:www\.)?ucetnictvispravne\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="\/(?!clones)[^"#][^"]*"/g, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com[^"]*"/gi, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google|calendly\.com)[^"]*"/gi, 'href="#"');
body = body.replace(/action="[^"]*ucetnictvispravne[^"]*"/gi, 'action="#"');

// Remove cookie bars + popups
body = body.replace(/<[^>]*(?:cookie|Cookie|gdpr|cmplz)[^>]*>[\s\S]{0,3000}?<\/[^>]+>/g, '');
body = body.replace(/<[^>]*(?:popup|notification|notice|modal)[^>]*>[\s\S]{0,5000}?<\/[^>]+>/gi, '');

// CMS brand scrub — domain FIRST (before word replace)
body = body
  // Domain first
  .replace(/ucetnictvispravne\.cz/gi, 'demo.local')
  // Brand name as a unit (must be before generics)
  .replace(/Účetnictví\s+správně/g, 'Demo Účetnictví')
  .replace(/účetnictví\s+správně/g, 'demo účetnictví')
  .replace(/ÚČETNICTVÍ\s+SPRÁVNĚ/g, 'DEMO ÚČETNICTVÍ')
  // Slug generic (after domain above)
  .replace(/ucetnictvispravne/gi, 'demo-ucetnictvi')
  // Contact
  .replace(/\+420\s*777\s*660\s*408/g, '+420 608 288 777')
  .replace(/info@(?:ucetnictvispravne|demo-ucetnictvi)\.(?:cz|local)/gi, 'info@demo.local')
  // IČO
  .replace(/\b27184544\b/g, '12345678')
  .replace(/\b\d{8}\b/g, '12345678');

// Fix path corruption after brand scrub
body = body.replaceAll(`/clones/demo-ucetnictvi/`, `/clones/${SLUG}/`);
log(`Path corruption fixed`);

// Style override
const styleOverride = `<style>
/* Venom ucetnictvispravne demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"],[id*="gdpr"],[class*="cmplz"],
[class*="popup"],[id*="popup"],[class*="modal"],[class*="notification"] { display: none !important; }
img[src="data:image/gif"] { display: none !important; }
img[src=""], img[src="data:"] { display: none !important; }
img { max-width: 100%; height: auto; }
iframe:not([src]), iframe[src=""] { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

// Audit
const stripped = body.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
const brand = (stripped.match(/Účetnictví\s+správně|ucetnictvispravne\.cz/g) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brand} extRefs=${extRefs} body=${body.length}B`);

// CSS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`))
  .filter(f => f.endsWith('.css')).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

const ACCESS_TOKEN = 'ucetnictvispravne' + Math.random().toString(36).slice(2, 8);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Účetnictví', 'Účetní firma & daňové poradenství',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'ucetnictvispravne.cz', cms: 'WordPress+Elementor' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,'Demo Účetnictví — Účetní firma & daňové poradenství','Ukázka prémiové šablony pro účetní firmu.') RETURNING id
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
