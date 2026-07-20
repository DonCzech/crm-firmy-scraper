/**
 * FÁZE 2 — Seed DB pro perfect-smile-demo
 * Custom PHP CMS (ortodontická klinika), 4 stránky
 *
 * Spustit: node scripts/seed-perfectsmile-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'perfectsmile';
const TENANT_SLUG = 'perfect-smile-demo';
const ACCESS_TOKEN = 'ps' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/assets/frontend/perfect-smilecz/css/style.css`,
].filter(u => fs.existsSync(`public${u}`));

const JS_URLS = []; // jsminBottom makes ajax calls

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',      title: 'Domů',      file: 'home.html',      isHome: true  },
  { slug: 'sluzby',    title: 'Služby',    file: 'sluzby.html',    isHome: false },
  { slug: 'reference', title: 'Reference', file: 'reference.html', isHome: false },
  { slug: 'kontakty',  title: 'Kontakty',  file: 'kontakty.html',  isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  body = body.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics|facebook)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip cookie consent (this CMS uses its own cookie banner)
  body = body.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr-banner|cookies-popup|cookies-bar)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');
  // Broader strip if above doesn't work — find "Tento web využívá cookies" and strip parent div
  body = body.replace(/<div[^>]*>\s*(?:Tento web|This web)[^<]*(?:cookie|soubor)[^<]{0,200}<[^>]*>[\s\S]{0,5000}?<\/div>\s*<\/div>/gi, '');

  // Strip xdent booking → #objednani
  body = body.replace(/href="https?:\/\/perfect-smile\.xdent\.cz[^"]*"/gi, 'href="#objednani"');
  // Strip nearest.cz + ebrana.cz
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:najbrt|ebrana)\.cz[^"]*"/gi, 'href="#"');

  // Fix root-relative /assets/ paths
  body = body.replace(/(["'\s\(=,])\/assets\//g, `$1/clones/${SLUG}/assets/`);

  const cookieRemove = '';

  const overrideCss = `<style>
    [class*="cookie-banner"],[class*="cookie-consent"],[class*="gdpr"],[id*="cookie-bar"],
    [id="js_essentials_cookies"],[id*="consent"]{display:none!important}
    /* Hide cookie form/section that has no class — find by fixed bottom positioning */
    div[style*="position: fixed"][style*="bottom"],div[style*="position:fixed"][style*="bottom"]{display:none!important}
    body{overflow:auto!important}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + cookieRemove + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed perfect-smile-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Perfect Smile', 'ortodontická klinika Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'perfect-smile.cz', cms: 'Custom PHP CMS' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/perfect-smile\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Perfect Smile`, 'Ukázka šablony pro ortodontickou kliniku.']);

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
