/**
 * FÁZE 2 — Seed DB pro usmev-neboli-demo
 * WordPress + Astra + Elementor (dentální hygienistka), 3 stránky
 *
 * Spustit: node scripts/seed-usmevneboli-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'usmev';
const TENANT_SLUG = 'usmev-neboli-demo';
const ACCESS_TOKEN = 'usmev' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [];
// Astra theme + Elementor post CSS
const cssDir = `public/clones/${SLUG}/wp-content/uploads/elementor/css`;
if (fs.existsSync(cssDir)) {
  for (const f of fs.readdirSync(cssDir)) {
    if (f.endsWith('.css')) CSS_URLS.push(`/clones/${SLUG}/wp-content/uploads/elementor/css/${f}`);
  }
}
const mainCss = [`/clones/${SLUG}/wp-content/themes/astra/assets/css/minified/main.min.css`,
                 `/clones/${SLUG}/wp-includes/css/dist/block-library/style.min.css`];
for (const u of mainCss) { if (fs.existsSync(`public${u}`)) CSS_URLS.unshift(u); }

const JS_URLS = [
  `/clones/${SLUG}/wp-includes/js/jquery/jquery.min.js`,
  `/clones/${SLUG}/wp-includes/js/jquery/jquery-migrate.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/js/frontend.min.js`,
  `/clones/${SLUG}/wp-content/themes/astra/assets/js/minified/frontend.min.js`,
].filter(u => fs.existsSync(`public${u}`));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

function stripDivBlock(html, startMatch) {
  const startIdx = html.search(startMatch);
  if (startIdx === -1) return html;
  let depth = 0;
  const re = /<\/?div[^>]*>/gi;
  re.lastIndex = startIdx;
  let m;
  while ((m = re.exec(html))) {
    if (m[0][1] === '/') { depth--; if (depth === 0) return html.substring(0, startIdx) + html.substring(m.index + m[0].length); }
    else depth++;
  }
  return html;
}

const PAGES = [
  { slug: 'home',   title: 'Domů',         file: 'home.html',   isHome: true  },
  { slug: 'beleni', title: 'Bělení zubů',  file: 'beleni.html', isHome: false },
  { slug: 'blog',   title: 'Blog',         file: 'blog.html',   isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  body = body.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|complianz|cookiebot|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  // Strip ALL complianz-gdpr plugin elements (SVG icons render huge without JS scope)
  body = stripDivBlock(body, /<div[^>]*class="[^"]*cmplz-cookiebanner[^"]*"/i);
  body = stripDivBlock(body, /<div[^>]*id="cmplz-cookiebanner[^"]*"/i);
  // Remove any orphan complianz divs with depth tracking
  let prevLen = -1;
  while (prevLen !== body.length) {
    prevLen = body.length;
    body = body.replace(/<div[^>]*(?:cmplz-|complianz)[^>]*>[\s\S]{0,12000}?<\/div>/gi, '');
  }
  // Strip complianz plugin scripts/styles in body
  body = body.replace(/<script[^>]*complianz[^>]*>[\s\S]*?<\/script>/gi, '');
  // Strip ALL SVG elements from cookie/consent areas
  body = body.replace(/<svg[^>]*>[\s\S]{0,2000}?<\/svg>/gi, (m) => {
    // Only strip large inline SVGs (likely UI icons from plugins)
    if (m.length > 500) return '';
    return m;
  });

  const overrideCss = `<style>
    [class*="cmplz"],[class*="cookie-banner"],[id*="cmplz"]{display:none!important;visibility:hidden!important}
    body{overflow:auto!important;padding-top:0!important}
    #wpadminbar{display:none!important}
    html{margin-top:0!important}
  </style>`;

  const jqueryInline = `<script src="/clones/${SLUG}/wp-includes/js/jquery/jquery.min.js"></script>
<script>window.elementorFrontendConfig=window.elementorFrontendConfig||{environmentMode:{isBuilder:false},i18n:{},settings:{page:{},editorPreferences:{}}};window.wp=window.wp||{hooks:{addAction:function(){},doAction:function(){},applyFilters:function(a,b){return b},addFilter:function(){}}};</script>`;

  return KILL + '\n' + overrideCss + '\n' + jqueryInline + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed usmev-neboli-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Úsměv Nebolí', 'dentální hygienistka Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'usmevneboli.cz', cms: 'WordPress + Astra + Elementor' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/usmevneboli\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Úsměv Nebolí`, 'Ukázka šablony pro dentální hygienistku.']);

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
