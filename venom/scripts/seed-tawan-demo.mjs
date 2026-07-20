import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'tawan';
const TENANT_SLUG = 'tawan-demo';
const ACCESS_TOKEN = 'tawan' + Math.random().toString(36).slice(2, 11);

const CSS_URLS = [
  `/clones/${SLUG}/sites/default/files/css/css_0qt5IFFJLUJvgYP4HwfCRWJCjFFWcBV2RDDd2Jz-_0k.css`,
  `/clones/${SLUG}/sites/default/files/css/css_Zii9lMIONbcVnTAoUqv5rUlypnN_NbHgRFLUR5iyQ94.css`,
  `/clones/${SLUG}/sites/default/files/css/css_FP7nYDeYm7XL-V28ZefU8T8pLQRQGkGv9k8Kt5wnaVE.css`,
  `/clones/${SLUG}/css/aos.css`,
  `/clones/${SLUG}/css/selectize.css`,
].filter(u => fs.existsSync('public' + u));

const JS_URLS = [
  `/clones/${SLUG}/js/js_36AmUJGmxQdGMBFl8HljBCsNg4tVY2oAjz-WuAtkwWk.js`,
  `/clones/${SLUG}/js/js_Z1X_zXA40t8jKeqOUKWZ5fEoddnPAh-Pog-sBgkY8_w.js`,
  `/clones/${SLUG}/js/js_dAxcr5tLpfzVGUK9DoaAQhZdToVPWXm31ol_UzqemD8.js`,
  `/clones/${SLUG}/js/js_xnGlrawGddq4lWCNvvUKUuxCaJokRSqqp7pZKr7OZgM.js`,
  `/clones/${SLUG}/js/owl.carousel.js`,
  `/clones/${SLUG}/js/jquery.paroller.min.js`,
  `/clones/${SLUG}/js/aos.js`,
].filter(u => fs.existsSync('public' + u));

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

console.log('CSS:', CSS_URLS.length, '| JS:', JS_URLS.length);

const PAGES = [
  { slug: 'home',    title: 'Domů',              file: 'home.html',    isHome: true  },
  { slug: 'masaze',  title: 'Masáže',             file: 'masaze.html',  isHome: false },
  { slug: 'cenik',   title: 'Ceník',              file: 'cenik.html',   isHome: false },
  { slug: 'voucher', title: 'Dárkové poukazy',    file: 'voucher.html', isHome: false },
];

function extractBody(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip tracking + Cookiebot
  body = body.replace(/<script[^>]*(?:cookiebot|Cookiebot|googletagmanager|gtag|hotjar)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<div[^>]*(?:CybotCookiebot|cookiebot)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  // Strip language switcher (CZ/EN)
  body = body.replace(/<li[^>]*(?:lang|language)[^>]*>[\s\S]*?<\/li>/gi, '');

  // Social links → #
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok)\.com\/[^"]*"/gi, 'href="#"');

  // Reservation external link → #
  body = body.replace(/href="https?:\/\/libero-pub\.hoteltime[^"]*"/gi, 'href="#rezervace"');

  // Brand scrub BEFORE path rewrites so filenames stay intact
  // Exclude TAWAN- (filename) or TAWAN followed by space+Demo/masáže/masaze
  body = body.replace(/TAWAN(?!\s*Demo|\s*masáže|\s*masaze|-|_)/g, 'TAWAN Demo');
  body = body.replace(/tawan\.cz/gi, 'demo.local');
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  body = body.replace(/[a-z.]+@tawan\.cz/gi, 'info@demo.local');

  // Strip ?itok=... Drupal image cache query params (static files don't have them)
  body = body.replace(/(\/sites\/default\/files\/[^"'\s?]+)\?itok=[^"'\s]*/g, '$1');

  // Fix root-relative Drupal paths → /clones/tawan/...
  body = body.replace(/(?<!\/clones\/tawan)\/sites\/default\/files\//g, '/clones/tawan/sites/default/files/');

  // Fix root-relative theme paths → /clones/tawan/themes/...
  body = body.replace(/(?<!\/clones\/tawan)\/themes\/custom\/awesome\//g, '/clones/tawan/themes/custom/awesome/');

  // Flatten theme img subdirs → /clones/tawan/img/
  body = body.replace(/\/clones\/tawan\/themes\/custom\/awesome\/src\/img\/icons\//g, '/clones/tawan/img/');
  body = body.replace(/\/clones\/tawan\/themes\/custom\/awesome\/src\/img\/bg\//g, '/clones/tawan/img/');
  body = body.replace(/\/clones\/tawan\/themes\/custom\/awesome\/src\/img\//g, '/clones/tawan/img/');

  // Strip Drupal-loaded JS <script src> tags (JS already covered by jsUrls)
  body = body.replace(/<script[^>]*src="[^"]*\/sites\/default\/files\/js\/[^"]*"[^>]*><\/script>/gi, '');

  return KILL + '\n' + inlineStyles + '\n' + body;
}

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

log('=== Seed tawan-demo (Drupal) ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Tawan Masáže', 'thajské masáže & wellness',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'tawan.cz', cms: 'Drupal/custom-awesome-theme' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (let i = 0; i < PAGES.length; i++) {
  const p = PAGES[i];
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP missing: ${p.file}`); continue; }

  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = extractBody(rawHtml);
  log(`${p.slug}: ${rawHtml.length} → ${html.length}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tenant_id,slug) DO UPDATE
    SET title=$3,is_homepage=$4,seo_title=$5,seo_description=$6 RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Tawan Masáže`, 'Ukázka šablony pro thajský masážní salon. Demo verze.']);
  const pid = pg2.rows[0].id;

  await pool.query(`
    INSERT INTO sections (tenant_id,page_id,section_type,settings,order_index,is_visible)
    VALUES ($1,$2,'full-page-clone',$3,0,true) ON CONFLICT DO NOTHING
  `, [tid, pid, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);
  log(`  ${p.slug} → page ${pid} ✅`);
}

await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Published ✅`);
await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
