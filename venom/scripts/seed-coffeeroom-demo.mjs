/**
 * FÁZE 2 — Seed DB pro coffee-room-demo
 * Webflow CMS, 4 stránky
 *
 * Spustit: node scripts/seed-coffeeroom-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'coffeeroom';
const TENANT_SLUG = 'coffee-room-demo';
const ACCESS_TOKEN = 'coffeeroom' + Math.random().toString(36).slice(2, 10);

// Custom KILL: also stubs /.wf_graphql/ Webflow commerce endpoints (404s)
const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return u && u.indexOf('/.wf_graphql/')>=0;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu)||uu.indexOf('/.wf_graphql/')>=0)return Promise.resolve(new Response('{}',{status:200,headers:{'content-type':'application/json'}}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))||String(u).indexOf('/.wf_graphql/')>=0){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/cdn/67cc82f0c6e15f8db05a46c0/css/coffee-room-8ff439-e9e61a58a80852868f89.webflow.shared.13509edeb.css`,
].filter(u => fs.existsSync(`public${u}`));

// jQuery inline (loaded inside patchHtml) — Webflow JS depends on $
// Commerce schunk (e811546bf3a257b0) excluded — calls /.wf_graphql endpoints
const JS_URLS = [
  `/clones/${SLUG}/cdn/67cc82f0c6e15f8db05a46c0/js/webflow.schunk.74913c4b4b4ccfa6.js`,
  `/clones/${SLUG}/cdn/67cc82f0c6e15f8db05a46c0/js/webflow.ba154e36.52ef508ffe770ec3.js`,
].filter(u => fs.existsSync(`public${u}`));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',      title: 'Domů',     file: 'home.html',      isHome: true  },
  { slug: 'coffeebar', title: 'Menu',     file: 'coffeebar.html', isHome: false },
  { slug: 'contact',   title: 'Kontakt',  file: 'contact.html',   isHome: false },
  { slug: 'products',  title: 'Obchod',   file: 'products.html',  isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip remaining tracking
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  // Strip ajax.googleapis webfont loader (CSP blocked + uses google.com)
  body = body.replace(/<script[^>]*ajax\.googleapis\.com\/ajax\/libs\/webfont[^>]*><\/script>/gi, '');
  // Strip inline webfont loader call
  body = body.replace(/WebFont\.load\(\{[\s\S]*?\}\);?/gi, '');

  // Strip Webflow commerce cart wrapper (triggers /.wf_graphql/csrf 404s)
  body = body.replace(/<div[^>]*data-node-type="commerce-cart-wrapper"[^>]*>[\s\S]*?(?=<div(?![^>]*data-node-type="commerce)|<\/body)/gi, '');
  // Strip x-wf-template (commerce templates that are never used)
  body = body.replace(/<script[^>]*type="text\/x-wf-template"[^>]*>[\s\S]*?<\/script>/gi, '');

  // JS: remove inline opacity:0 from Webflow animation elements (data-w-id with opacity:0)
  // Same approach as cafesavoy — JS triggers reveal on scroll/load
  const revealJs = `<script>
  (function(){
    function reveal(){
      document.querySelectorAll('[style*="opacity:0"],[style*="opacity: 0"]').forEach(function(el){
        el.style.removeProperty('opacity');
      });
    }
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',function(){reveal();setTimeout(reveal,300);setTimeout(reveal,1000);});
    } else { reveal();setTimeout(reveal,300);setTimeout(reveal,1000); }
  })();
  </script>`;

  // jQuery inline at top of body — Webflow JS depends on it
  const jqueryInline = `<script src="/clones/${SLUG}/cdn/jquery-3.5.1.min.js"></script>`;

  // CSS override
  const overrideCss = `<style>
    /* Force Webflow scroll-reveal elements visible */
    [data-w-id]{opacity:1!important}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + jqueryInline + '\n' + revealJs + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed coffee-room-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Coffee Room', 'specialty kavárna Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'coffeeroom.cz', cms: 'Webflow' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/coffeeroom\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Coffee Room`, 'Ukázka šablony pro specialty kavárnu v Praze.']);

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
