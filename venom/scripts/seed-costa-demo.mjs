/**
 * FÁZE 2 — Seed DB pro costa-coffee-demo
 * WordPress custom theme, 4 stránky
 *
 * Spustit: node scripts/seed-costa-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'costa';
const TENANT_SLUG = 'costa-coffee-demo';
const ACCESS_TOKEN = 'costa' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/src/themes/template/build/global.min.css`,
  `/clones/${SLUG}/src/themes/template/build/fancybox.min.css`,
].filter(u => fs.existsSync(`public${u}`));

// jQuery loaded inline at top of body (see patchHtml) — exclude from jsUrls
const JS_URLS = [
  `/clones/${SLUG}/src/themes/template/build/global.min.js`,
].filter(u => fs.existsSync(`public${u}`));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',     title: 'Domů',     file: 'home.html',     isHome: true  },
  { slug: 'nabidka',  title: 'Nabídka',  file: 'nabidka.html',  isHome: false },
  { slug: 'kavarny',  title: 'Kavárny',  file: 'kavarny.html',  isHome: false },
  { slug: 'historie', title: 'Historie', file: 'historie.html', isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip tracking scripts
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|lagardere|smartform|stats\.query|consent\.lagardere)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip Cookiebot consent UI
  body = body.replace(/<div[^>]*(?:CybotCookiebot|cookie-consent|consent-banner)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');
  body = body.replace(/<script[^>]*Cookiebot[^>]*><\/script>/gi, '');

  // Fix absolute URLs
  body = body.replace(/https?:\/\/(?:www\.)?costa-coffee\.cz\/src\//gi, `/clones/${SLUG}/src/`);
  body = body.replace(/https?:\/\/(?:www\.)?costa-coffee\.cz\/wp-content\//gi, `/clones/${SLUG}/wp-content/`);
  body = body.replace(/https?:\/\/(?:www\.)?demo\.local(\/[^"'> ]*)/gi, '$1');

  // WordPress globals stub (referenced by inline scripts, hooks.min.js stripped)
  const wpStub = `<script>
    window.wp=window.wp||{};
    window.wp.i18n=window.wp.i18n||{setLocaleData:function(){},__:function(s){return s},sprintf:function(s){return s}};
    window.wp.hooks=window.wp.hooks||{addAction:function(){},addFilter:function(){},doAction:function(){},applyFilters:function(a,b){return b}};
    window.wp.element=window.wp.element||{createElement:function(){return null}};
    window.wp.data=window.wp.data||{dispatch:function(){return {}},select:function(){return {}}};
    window.wp.apiFetch=window.wp.apiFetch||function(){return Promise.resolve({})};
  </script>`;

  // CSS override
  const overrideCss = `<style>
    /* Hide cookie banners */
    [class*="CybotCookiebot"],[class*="cookie-consent"],[class*="consent-banner"],
    [id*="CybotCookiebot"],[id*="cookie-banner"]{display:none!important}
    /* Ensure body scrollable */
    body{overflow:auto!important}
    /* Hide WP admin bar */
    #wpadminbar{display:none!important}
    html{margin-top:0!important}
  </style>`;

  // Load jQuery inline at top of body — inline scripts in body depend on it
  const jqueryInline = `<script src="/clones/${SLUG}/src/themes/template/build/jquery.min.js"></script>`;

  return KILL + '\n' + wpStub + '\n' + overrideCss + '\n' + inlineStyles + '\n' + jqueryInline + '\n' + body;
}

log('=== Seed costa-coffee-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Costa Coffee', 'kavárenský řetězec',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'costa-coffee.cz', cms: 'WordPress custom theme' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/costa-coffee\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Costa Coffee`, 'Ukázka šablony pro kavárenský řetězec.']);

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
