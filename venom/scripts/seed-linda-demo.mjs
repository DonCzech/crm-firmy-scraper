import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'linda';
const TENANT_SLUG = 'linda-demo';
const ACCESS_TOKEN = 'linda' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// CSS: wpfc-minified bundles (main CSS) + elementor post CSS
const CSS_URLS = [];
const wpfcDir = `public/clones/${SLUG}/wp-content/cache/wpfc-minified`;
if (fs.existsSync(wpfcDir)) {
  for (const sub of fs.readdirSync(wpfcDir)) {
    for (const f of fs.readdirSync(`${wpfcDir}/${sub}`)) {
      if (f.endsWith('.css')) CSS_URLS.push(`/clones/${SLUG}/wp-content/cache/wpfc-minified/${sub}/${f}`);
    }
  }
}
const elDir = `public/clones/${SLUG}/wp-content/uploads/elementor/css`;
if (fs.existsSync(elDir)) {
  for (const f of fs.readdirSync(elDir)) {
    if (f.endsWith('.css')) CSS_URLS.push(`/clones/${SLUG}/wp-content/uploads/elementor/css/${f}`);
  }
}
// Add regular css files (Hello Elementor theme, etc.)
CSS_URLS.push(...fs.readdirSync(`public/clones/${SLUG}/css`)
  .filter(f => !f.includes('cmplz') && !f.includes('cookie') && !f.includes('complianz'))
  .map(f => `/clones/${SLUG}/css/${f}`));

const JS_URLS = [
  `/clones/${SLUG}/js/jquery.min.js`,
  `/clones/${SLUG}/js/frontend-modules.min.js`,
  `/clones/${SLUG}/js/frontend.min.js`,
  `/clones/${SLUG}/js/hello-frontend.min.js`,
  `/clones/${SLUG}/js/webpack-pro.runtime.min.js`,
  `/clones/${SLUG}/js/nav-menu.a23fbd67486c5bedf26c.bundle.min.js`,
  `/clones/${SLUG}/js/jquery.sticky.min.js`,
].filter(u => fs.existsSync('public' + u));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',     title: 'Domů',    file: 'home.html',     isHome: true  },
  { slug: 'problemy', title: 'Problémy', file: 'problemy.html', isHome: false },
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
    'trustindex.io', 'buttonizer.io', 'isportsystem', 'simpleshop'];
  for (const pat of BAD_SRC) {
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*><\\/script>`, 'gi'), '');
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*>[\\s\\S]{0,300}?<\\/script>`, 'gi'), '');
  }

  // Strip Complianz banner
  for (const id of ['cmplz-cookiebanner', 'cmplz-overlay', 'cc-nb', 'cookie-notice', 'cn-notice', 'cmplz-manage-consent']) {
    let start = body.indexOf(`id="${id}"`);
    if (start < 0) start = body.indexOf(`class="${id}`);
    while (start >= 0) {
      const divStart = body.lastIndexOf('<div', start);
      if (divStart < 0) break;
      let depth = 0, i = divStart;
      while (i < body.length) {
        if (body[i] === '<') {
          if (body.slice(i, i+4) === '<div') { depth++; i += 4; }
          else if (body.slice(i, i+6) === '</div>') { depth--; if (depth === 0) { i += 6; break; } i += 6; }
          else i++;
        } else i++;
      }
      body = body.slice(0, divStart) + body.slice(i);
      start = body.indexOf(`id="${id}"`);
      if (start < 0) start = body.indexOf(`class="${id}`);
    }
  }

  body = body.replace(/<iframe[^>]*\bsrc="[^"]*youtube[^"]*"[^>]*><\/iframe>/gi, '');
  body = body.replace(/<noscript><img[^>]*facebook\.com\/tr[^>]*><\/noscript>/gi, '');
  // Fix protocol-relative URLs — wpfc-minified links left over in head inline scripts
  body = body.replace(/(?:https?:)?\/\/lindasikorova\.com\/wp-content\/cache\/wpfc-minified\//gi,
    `/clones/${SLUG}/wp-content/cache/wpfc-minified/`);
  // Strip FontAwesome CDN link (icon fonts served locally via CSS)
  body = body.replace(/<link[^>]*cdnjs\.cloudflare\.com[^>]*>/gi, '');
  body = body.replace(/<img[^>]*src="[^"]*s\.w\.org[^"]*"[^>]*>/gi, '');
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Fix root-relative WP paths → /clones/linda/...
  body = body.replace(/(?<!\/clones\/linda)\/wp-content\/uploads\//g, '/clones/linda/wp-content/uploads/');
  body = body.replace(/(?<!\/clones\/linda)\/wp-content\/themes\//g, '/clones/linda/wp-content/themes/');

  // Brand scrub — Linda Sikorová
  body = body.replace(/Linda Sikorová(?!\s*Demo)/g, 'Linda Sikorová Demo');
  body = body.replace(/lindasikorova\.com/gi, 'demo.local');
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  body = body.replace(/[a-z.]+@lindasikorova\.com/gi, 'info@demo.local');

  return KILL + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed linda-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Linda Sikorová', 'osobní trenérka & fyzioterapie',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'lindasikorova.com', cms: 'WordPress/Elementor' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext=${ext}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Linda Sikorová`, 'Ukázka šablony pro osobního trenéra Praha.']);

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
