import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'soho';
const TENANT_SLUG = 'soho-demo';
const ACCESS_TOKEN = 'soho' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// CSS: et-cache bundles (Divi)
const CSS_URLS = [];
const etCacheDir = `public/clones/${SLUG}/wp-content/et-cache`;
if (fs.existsSync(etCacheDir)) {
  for (const sub of fs.readdirSync(etCacheDir)) {
    const subPath = `${etCacheDir}/${sub}`;
    if (fs.statSync(subPath).isDirectory()) {
      for (const f of fs.readdirSync(subPath)) {
        if (f.endsWith('.css')) CSS_URLS.push(`/clones/${SLUG}/wp-content/et-cache/${sub}/${f}`);
      }
    }
  }
}
const JS_URLS = [];

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',       title: 'Domů',     file: 'home.html',       isHome: true  },
  { slug: 'price-list', title: 'Ceník',    file: 'price-list.html', isHome: false },
  { slug: 'about-us',   title: 'O salonu', file: 'about-us.html',   isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  const BAD_SRC = ['clarity.ms', 'facebook.net', 'fbevents', 'googletagmanager', 'google-analytics',
    'gstatic.com/recaptcha', 's.w.org', 'cookiebot', 'complianz', 'cmplz',
    'bat.bing.com', 'doubleclick.net', 'smartlook.com', 'popups-for-divi'];
  for (const pat of BAD_SRC) {
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*><\\/script>`, 'gi'), '');
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*>[\\s\\S]{0,500}?<\\/script>`, 'gi'), '');
  }

  // Fix Divi popup row inline style — it has style="display: flex !important;" which beats CSS
  body = body.replace(
    /(<div[^>]*class="[^"]*et-interaction-target-tdqegnns4f[^"]*"[^>]*)style="display:\s*flex\s*!important;"/g,
    '$1style="display:none!important"'
  );

  // Hide Divi popups (popups-for-divi plugin + diviarea overlay)
  const popupHide = `<style>
    .et_pb_section.popup,.da-overlay,.area-outer-wrap,.da-overlay-visible,.popup-for-divi{display:none!important}
    #comment-wrap,#respond,.et_post_meta_wrapper{display:none!important}
    #left-area,#sidebar,.widget-area{display:none!important}
  </style>`;

  body = body.replace(/<noscript><img[^>]*facebook\.com\/tr[^>]*><\/noscript>/gi, '');
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Fix malformed http:/wp-content/ paths (mirror script strips //sohosalon.cz leaving http: prefix)
  body = body.replace(/http:\/wp-content\//g, '/wp-content/');
  body = body.replace(/https:\/wp-content\//g, '/wp-content/');

  // Fix root-relative asset paths → /clones/soho/...
  body = body.replace(/(?<!\/clones\/soho)\/wp-content\/uploads\//g, `/clones/${SLUG}/wp-content/uploads/`);
  body = body.replace(/(?<!\/clones\/soho)\/wp-content\/themes\//g, `/clones/${SLUG}/wp-content/themes/`);
  body = body.replace(/(?<!\/clones\/soho)\/wp-content\/plugins\//g, `/clones/${SLUG}/wp-content/plugins/`);
  body = body.replace(/(?<!\/clones\/soho)\/wp-content\/et-cache\//g, `/clones/${SLUG}/wp-content/et-cache/`);

  // Brand scrub
  body = body.replace(/Soho Nails\s*&(?:amp;)?\s*Spa(?!\s*Demo)/gi, 'Soho Nails & Spa Demo');
  body = body.replace(/sohosalon\.cz/gi, 'demo.local');
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  body = body.replace(/[a-z.]+@sohosalon\.cz/gi, 'info@demo.local');

  return KILL + '\n' + popupHide + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed soho-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Soho Nails & Spa', 'nehtové studio & spa Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'sohosalon.cz', cms: 'WordPress/Divi' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brand = (html.match(/sohosalon\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Soho Nails & Spa`, 'Ukázka šablony pro nehtové studio Praha.']);

  await pool.query(`
    INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
    VALUES ($1, $2, 'full-page-clone', $3, 0, true)
  `, [tid, pg2.rows[0].id, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);
  log(`  ${p.slug} → page ${pg2.rows[0].id} ✅`);
}

await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Published ✅`);
await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
