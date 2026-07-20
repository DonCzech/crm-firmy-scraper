/**
 * FÁZE 2+3+7 — honeygrebovka-demo (Wix Thunderbolt, soukromá školka)
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'honeygrebovka';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'honeygrebovka-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const rawHtml = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home-raw.html`), 'utf8');
log(`Read home-raw.html: ${rawHtml.length} bytes`);

// Split at </head>
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

// Fix Wix image URLs → local
// Pattern: https://static.wixstatic.com/media/HASH~mv2.jpg/v1/fill/.../HASH~mv2.jpg
// → /clones/skolapopulo/img/HASH~mv2.jpg
const localImgs = new Set(fs.readdirSync(path.join(ROOT, `public/clones/${SLUG}/img`)));
let imgFixed = 0;

// Fix wixstatic.com/media URLs with CDN transforms
body = body.replace(/https:\/\/static\.wixstatic\.com\/media\/([^"'\s>]+)/g, (match, imgPath) => {
  // imgPath could be "HASH~mv2.jpg" or "HASH~mv2.jpg/v1/fill/.../HASH~mv2.jpg"
  const baseName = imgPath.split('/')[0].split('?')[0];
  if (localImgs.has(baseName)) {
    imgFixed++;
    return `/clones/${SLUG}/img/${baseName}`;
  }
  return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; // 1px transparent
});

// Fix parastorage URLs
body = body.replace(/https:\/\/static\.parastorage\.com\/[^"'\s>]+\.(png|jpg|ico|cur)/g, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (localImgs.has(fname)) return `/clones/${SLUG}/img/${fname}`;
  return '';
});

log(`Fixed ${imgFixed} img refs`);

// Fix internal links → #
body = body.replace(/href="https?:\/\/(?:www\.)?honeygrebovka\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="https?:\/\/(?:www\.)?honeybunny\.cz([^"]*)"/gi, 'href="#"');
// Social links
body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com[^"]*"/gi, 'href="#"');
// Google maps
body = body.replace(/href="https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google)[^"]*"/gi, 'href="#"');
// Action forms
body = body.replace(/action="[^"]*(?:honeygrebovka|honeybunny|wix)[^"]*"/gi, 'action="#"');

// CMS brand scrub
body = body
  .replace(/Honey\s+Bunny/gi, 'Demo Školka')
  .replace(/HoneyBunny/gi, 'DemoŠkolka')
  .replace(/Honey\s+Grebovka/gi, 'Demo Školka')
  .replace(/honeygrebovka\.cz/gi, 'demo.local')
  .replace(/honeybunny\.cz/gi, 'demo.local')
  .replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@honeygrebovka\.cz/gi, 'info@demo.local')
  .replace(/[a-z._+-]+@honeybunny\.cz/gi, 'info@demo.local');

// SEO + cookie override
const styleOverride = `<style>
/* Venom honeygrebovka demo */
[class*="cookie"],[id*="cookie"],[class*="Cookie"] { display: none !important; }
img[src="data:image/gif"] { display: none !important; }
img[src=""] { display: none !important; }
img { max-width: 100%; height: auto; }
iframe:not([src]), iframe[src=""] { display: none !important; }
/* Wix Thunderbolt layout fixes — static mode */
[data-mesh-id], [id^="comp-"] { position: relative !important; }
</style>`;
body = styleOverride + '\n' + body;

// Audit
const brand = (body.match(/Honey\s*Bunny|honey\w*grebovka/gi) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brand} extRefs=${extRefs} body=${body.length}B`);

// CSS — only local CSS
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`)).filter(f=>f.endsWith('.css')).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

// DB
const ACCESS_TOKEN = 'honeygrebovka' + Math.random().toString(36).slice(2, 8);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Školka', 'Soukromá školka & předškolní vzdělávání',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'honeygrebovka.cz', cms: 'Wix Thunderbolt' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}`);

const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
  VALUES ($1,'home','Domů',true,'Demo Školka — Ukázka šablony','Ukázka prémiové šablony pro soukromou školku.') RETURNING id
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
