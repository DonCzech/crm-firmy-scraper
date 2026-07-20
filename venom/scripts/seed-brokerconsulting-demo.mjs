/**
 * FÁZE 2+3+7 — brokerconsulting-demo (Custom CMS NETservis, finanční poradce — Broker Consulting)
 * POZOR: brokerconsulting.cz → bcas.cz (redirect)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'brokerconsulting';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'brokerconsulting-demo';

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

// Build local img index (already decoded)
const localImgs = new Set(fs.readdirSync(path.join(ROOT, `public/clones/${SLUG}/img`)));
let imgFixed = 0;

// Fix bcas.cz/file/... image URLs (custom CMS path pattern)
body = body.replace(/(?:https?:\/\/(?:www\.)?bcas\.cz)?\/file\/[a-f0-9]+\/\d+\/[^\s"'<>?#]+/gi, (match) => {
  const fname = decodeURIComponent(match.split('/').pop().split('?')[0]);
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${encodeURIComponent(fname)}`; }
  return `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`;
});

// Fix images/ paths
body = body.replace(/(?:https?:\/\/(?:www\.)?bcas\.cz)?\/(?:images?|assets|file)\/[^\s"'<>?#]+\.(jpg|jpeg|png|webp|svg|gif|ico)/gi, (match) => {
  const fname = decodeURIComponent(match.split('/').pop().split('?')[0]);
  if (localImgs.has(fname)) { imgFixed++; return `/clones/${SLUG}/img/${encodeURIComponent(fname)}`; }
  return match;
});

log(`Fixed ${imgFixed} img refs`);

// Fix external Google/YouTube/iframes
body = body.replace(/src="https?:\/\/(?:www\.)?(?:googleapis|gstatic|youtube|ytimg|maps\.google|fonts\.gstatic|fonts\.googleapis)[^"]+"/gi, 'src=""');
body = body.replace(/<iframe[^>]*google[^>]*>[\s\S]*?<\/iframe>/gi, '');

// Fix internal links → #
body = body.replace(/href="https?:\/\/(?:www\.)?(?:brokerconsulting|bcas)\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="\/(?!clones)[^"#][^"]*"/g, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com[^"]*"/gi, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google)[^"]*"/gi, 'href="#"');

// Remove cookie bars + popups
body = body.replace(/<[^>]*(?:cookie|Cookie|gdpr|cmplz)[^>]*>[\s\S]{0,3000}?<\/[^>]+>/g, '');
body = body.replace(/<[^>]*(?:popup|notification|notice|modal)[^>]*>[\s\S]{0,5000}?<\/[^>]+>/gi, '');

// CMS brand scrub — domain FIRST
body = body
  // Domains
  .replace(/bcas\.cz/gi, 'demo.local')
  .replace(/brokerconsulting\.cz/gi, 'demo.local')
  // Brand variants
  .replace(/Broker\s+Consulting/g, 'Demo Finanční Poradce')
  .replace(/BROKER\s+CONSULTING/g, 'DEMO FINANČNÍ PORADCE')
  .replace(/brokerconsulting/gi, 'demo-financni')
  // Sister brands (real Czech companies) → generic placeholders
  .replace(/Moneco\s+investiční\s+společnost/gi, 'Demo Investice')
  .replace(/Moneco/g, 'Demo Investice')
  .replace(/MONECO/g, 'DEMO INVESTICE')
  .replace(/Procredia/gi, 'Demo Kredit')
  .replace(/PROCREDIA/g, 'DEMO KREDIT')
  .replace(/Prodomia/gi, 'Demo Reality')
  .replace(/PRODOMIA/g, 'DEMO REALITY')
  .replace(/BC[\s-]?Real/g, 'Demo Reality')
  .replace(/Broker[\s-]?Development/g, 'Demo Development')
  .replace(/BC\s*logo/gi, 'Demo logo')
  // Real persons (celebs ambassadors)
  .replace(/Dana\s+Morávková/g, 'Jana Nováková')
  .replace(/Antonio\s+Šoposki/g, 'Antonín Novák')
  .replace(/Marek\s+Singer/g, 'Martin Svoboda')
  // FeedYou (chatbot vendor) → Demo Chat
  .replace(/feedyou/gi, 'demo-chat')
  .replace(/FeedYou/g, 'DemoChat')
  // NETservis (developer attribution)
  .replace(/NETservis[\s.]*[a-z]*\.[a-z]+\.?\s*o?\.?/gi, 'Demo Web Studio')
  .replace(/NETservis/g, 'Demo Web Studio')
  // Email + phone (no phones found, but emails likely)
  .replace(/[a-z._-]+@(?:brokerconsulting|bcas|demo\.local)\.(?:cz|com|local)/gi, 'info@demo.local')
  // IČO: 25221736
  .replace(/\b25221736\b/g, '12345678');

// Slug 'brokerconsulting' was in image paths — fix if needed
body = body.replaceAll(`/clones/demo-financni/`, `/clones/${SLUG}/`);
log(`Brand scrub done`);

// Style override
const styleOverride = `<style>
/* Venom brokerconsulting demo */
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
const brand = (stripped.match(/Broker\s*Consulting|bcas\.cz|brokerconsulting/gi) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brand} extRefs=${extRefs} body=${body.length}B`);

// CSS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`))
  .filter(f => f.endsWith('.css')).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

const ACCESS_TOKEN = 'broker' + Math.random().toString(36).slice(2, 8);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Finanční Poradce', 'Finanční poradenství & investice',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'bcas.cz (brokerconsulting.cz redirect)', cms: 'Custom NETservis' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,'Demo Finanční Poradce — Finance & investice','Ukázka šablony pro finančního poradce.') RETURNING id
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
