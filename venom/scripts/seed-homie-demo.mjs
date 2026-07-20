import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'homie';
const TENANT_SLUG = 'homie-demo';
const ACCESS_TOKEN = 'homie' + Math.random().toString(36).slice(2, 11);

// Build CSS list from available files, excluding cookie-law (removed)
const CSS_FILES = fs.readdirSync(`public/clones/${SLUG}/css`).filter(f =>
  !f.includes('cookie-law') && !f.includes('bookly') && !f.includes('customer-profile') &&
  !f.includes('intlTel') && !f.includes('ladda') && !f.includes('picker')
);
const CSS_URLS = CSS_FILES.map(f => `/clones/${SLUG}/css/${f}`);

// Key JS files
const JS_INCLUDE = ['jquery.min.js', 'bootstrap.min.js', 'bootstrap.bundle.min.js', 'main.js', 'front.js',
  'index.js', '5777.js', 'owlcarousel.init.js', 'swiper.min.js', 'swiper-bundle.min.js'];
const JS_FILES = fs.readdirSync(`public/clones/${SLUG}/js`).filter(f =>
  JS_INCLUDE.some(inc => f.endsWith(inc)) && !f.includes('cookielaw') && !f.includes('bookly')
);
const JS_URLS = JS_FILES.map(f => `/clones/${SLUG}/js/${f}`);

console.log('CSS:', CSS_URLS.length, '| JS:', JS_URLS.length);

const PAGES = [
  { slug: 'home',     title: 'Domů',     file: 'home.html',     isHome: true  },
  { slug: 'piercing', title: 'Piercing', file: 'piercing.html', isHome: false },
  { slug: 'faq',      title: 'FAQ',      file: 'faq.html',      isHome: false },
];

function extractAndPatch(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip tracking + cookie law scripts + bookio reservation
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookielaw|cookie-law|cookie_law|bookio)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]+src="[^"]*(?:homietattoo\.cz\/wp-content|wp-includes)[^"]*"[^>]*><\/script>/gi, '');

  // Strip cookie bar HTML
  body = body.replace(/<div[^>]*(?:cookie-law-info|cli-bar)[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

  // Strip booking widget iframe
  body = body.replace(/<div[^>]*(?:bookly|bookio|booking-widget)[^>]*>[\s\S]{0,2000}?<\/div>/gi, '');

  // Social links → #
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok)\.com\/[^"]*"/gi, 'href="#"');

  // Fix root-relative WP paths → /clones/homie/...
  body = body.replace(/(?<!\/clones\/homie)\/wp-content\/uploads\//g, '/clones/homie/wp-content/uploads/');

  // Phone
  body = body.replace(/\+420\s*777\s*926\s*123/g, '+420 608 288 777');
  // Email
  body = body.replace(/[a-z.]+@homietattoo\.cz/gi, 'info@demo.local');
  // Brand
  body = body.replace(/Homie Tattoo(?!\s*Demo)/g, 'Homie Tattoo Demo');
  body = body.replace(/homietattoo\.cz/gi, 'demo.local');
  // Address
  body = body.replace(/Panská\s+\d+\/\d+[^<,]{0,30}Praha\s*\d*/gi, 'Demo ulice 12, Praha 1');

  return inlineStyles + '\n' + body;
}

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

log('=== Seed homie-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Homie Tattoo', 'tetování & piercing',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'homietattoo.cz', cms: 'WordPress/custom-theme' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (let i = 0; i < PAGES.length; i++) {
  const p = PAGES[i];
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = extractAndPatch(rawHtml);
  log(`${p.slug}: ${rawHtml.length}→${html.length}`);
  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
    VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tenant_id,slug) DO UPDATE
    SET title=$3,is_homepage=$4 RETURNING id
  `, [tid, p.slug, p.title, p.isHome, `${p.title} — Demo Homie Tattoo`, 'Ukázka šablony pro tetovací studio Praha.']);
  await pool.query(`
    INSERT INTO sections (tenant_id,page_id,section_type,settings,order_index,is_visible)
    VALUES ($1,$2,'full-page-clone',$3,0,true) ON CONFLICT DO NOTHING
  `, [tid, pg2.rows[0].id, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);
  log(`  ${p.slug} → ${pg2.rows[0].id} ✅`);
}

await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
