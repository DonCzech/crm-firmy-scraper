import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'magic';
const TENANT_SLUG = 'magic-demo';
const ACCESS_TOKEN = 'magic' + Math.random().toString(36).slice(2, 12);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// All wpfc-minified CSS bundles (these ARE the main CSS)
const WPFC_DIR = `public/clones/${SLUG}/wp-content/cache/wpfc-minified`;
const CSS_URLS = [];
for (const sub of fs.readdirSync(WPFC_DIR)) {
  const cssPath = `${WPFC_DIR}/${sub}/id84.css`;
  if (fs.existsSync(cssPath)) CSS_URLS.push(`/clones/${SLUG}/wp-content/cache/wpfc-minified/${sub}/id84.css`);
}

// Key JS: jquery first, then bricks
const JS_URLS = [
  `/clones/${SLUG}/js/jquery.min.js`,
  `/clones/${SLUG}/js/jquery-migrate.min.js`,
  `/clones/${SLUG}/js/bricks.min.js`,
  `/clones/${SLUG}/js/splide.min.js`,
];

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',  title: 'Domů',   file: 'home.html',  isHome: true  },
  { slug: 'cenik', title: 'Ceník',  file: 'cenik.html', isHome: false },
  { slug: 'faq',   title: 'FAQ',    file: 'faq.html',   isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip GTM noscript
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip external scripts by src attribute
  const BAD_SRC = ['clarity.ms', 'facebook.net', 'fbevents', 'googletagmanager', 'google-analytics',
    'gstatic.com/recaptcha', 'youtube.com/player_api', 's.w.org', 'cookiebot', 'complianz',
    'cmplz', 'consentmanager', 'usercentrics'];
  for (const pat of BAD_SRC) {
    const re = new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*><\\/script>`, 'gi');
    body = body.replace(re, '');
    const re2 = new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*>[\\s\\S]{0,300}?<\\/script>`, 'gi');
    body = body.replace(re2, '');
  }

  // Strip cookie consent divs by class
  for (const cls of ['cmplz-', 'cookiebar', 'cookie-banner', 'complianz', 'cc-window', 'cc-overlay']) {
    const re = new RegExp(`<div[^>]*${cls}[^>]*>[\\s\\S]{0,3000}?</div>`, 'gi');
    body = body.replace(re, '');
  }

  // Strip YouTube iframes (safe: src attribute contains youtube)
  body = body.replace(/<iframe[^>]*\bsrc="[^"]*youtube[^"]*"[^>]*><\/iframe>/gi, '');
  body = body.replace(/<iframe[^>]*\bsrc="[^"]*youtube[^"]*"[^>]*\/>/gi, '');

  // Strip Facebook pixel noscript
  body = body.replace(/<noscript><img[^>]*facebook\.com\/tr[^>]*><\/noscript>/gi, '');

  // Strip emoji images
  body = body.replace(/<img[^>]*src="[^"]*s\.w\.org[^"]*"[^>]*>/gi, '');

  // Social links → #
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Brand scrub
  body = body.replace(/Magic\s*Tattoo(?!\s*Demo)/g, 'Magic Tattoo Demo');
  body = body.replace(/magictattoo\.cz/gi, 'demo.local');
  // Phone
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  // Email
  body = body.replace(/[a-z.]+@magictattoo\.cz/gi, 'info@demo.local');

  return KILL + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed magic-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Magic Tattoo', 'tetování Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'magictattoo.cz', cms: 'WordPress/Bricks Builder' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);

  const ext = (html.match(/https?:\/\/(?!(?:demo\.local))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).filter(u => !u.includes('demo.local')).length;
  const brand = (html.match(/magictattoo\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Magic Tattoo`, 'Ukázka šablony pro tetovací studio Praha.']);

  await pool.query(`
    INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
    VALUES ($1, $2, 'full-page-clone', $3, 0, true)
  `, [tid, pg2.rows[0].id, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);

  log(`  ${p.slug} → page ${pg2.rows[0].id} ✅`);
}

await pool.end();
log(`Done! Token: ${ACCESS_TOKEN}`);
log(`http://localhost:3015/demo/${TENANT_SLUG}`);
