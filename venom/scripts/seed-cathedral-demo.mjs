/**
 * FÁZE 2 — Seed DB pro cathedral-cafe-demo
 * Custom Stimulus + Swup app (Vite assets), 4 stránky
 *
 * Spustit: node scripts/seed-cathedral-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'cathedral';
const TENANT_SLUG = 'cathedral-cafe-demo';
const ACCESS_TOKEN = 'cathedral' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/assets/main-Cimn3TmN.css`,
].filter(u => fs.existsSync(`public${u}`));

const JS_URLS = [
  `/clones/${SLUG}/assets/main-Cj43SWo7.js`,
].filter(u => fs.existsSync(`public${u}`));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',      title: 'Domů',     file: 'home.html',      isHome: true  },
  { slug: 'nase-menu', title: 'Menu',     file: 'nase-menu.html', isHome: false },
  { slug: 'galerie',   title: 'Galerie',  file: 'galerie.html',   isHome: false },
  { slug: 'kontakt',   title: 'Kontakt',  file: 'kontakt.html',   isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip tracking
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip external partner links (newlogic, qasima, kudyznudy, p-a-g)
  body = body.replace(/href="https?:\/\/(?:[a-z0-9-]+\.)?(?:newlogic|qasima|kudyznudy|p-a-g)\.[a-z]+\/?[^"]*"/gi, 'href="#"');

  // Strip language switcher (CZ/EN/DE/PL flags) — KILL blocks CDN flags anyway
  body = body.replace(/<div[^>]*data-controller="[^"]*lang[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  body = body.replace(/<ul[^>]*class="[^"]*lang[^"]*"[^>]*>[\s\S]*?<\/ul>/gi, '');

  // Strip cookie banner div
  body = body.replace(/<div[^>]*data-controller="[^"]*cookie[^"]*"[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  // Replace flag CDN images with empty div (KILL blocks them anyway)
  body = body.replace(/<img[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/flag-icons[^"]*"[^>]*\/?>/gi, '');

  // CSS override
  const overrideCss = `<style>
    /* Hide cookie/lang banners */
    [data-controller*="cookie"],[data-controller*="lang-switch"]{display:none!important}
    /* Hero slider visibility — sometimes hidden by JS */
    [data-controller*="hero"]{opacity:1!important;visibility:visible!important}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed cathedral-cafe-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Cathedral Café', 'kavárna & restaurace Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'cathedralcafe.cz', cms: 'Custom Stimulus + Swup' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/cathedralcafe\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Cathedral Café`, 'Ukázka šablony pro kavárnu a restauraci v Praze.']);

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
