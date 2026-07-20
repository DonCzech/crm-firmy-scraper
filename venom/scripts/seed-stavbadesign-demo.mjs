/**
 * Seed stavbadesign-demo — WordPress Bedrock + Tailwind v4
 * Run: node scripts/seed-stavbadesign-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'stavbadesign';
const TENANT_SLUG = 'stavbadesign-demo';
const ACCESS_TOKEN = 'stavba' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// CSS: hlavní plugin.css (Tailwind + theme), číslovane chunky
const CSS_BUILD_DIR = `public/clones/${SLUG}/app/themes/stavbadesign/build`;
const CSS_URLS = [
  `/clones/${SLUG}/app/themes/stavbadesign/build/plugin.css`,
  ...fs.readdirSync(CSS_BUILD_DIR)
    .filter(f => /^\d+\.css$/.test(f))
    .sort()
    .map(f => `/clones/${SLUG}/app/themes/stavbadesign/build/${f}`),
];

// JS: Bedrock/Gutenberg JS + theme build JS
const JS_BUILD_DIR = `public/clones/${SLUG}/app/themes/stavbadesign/build`;
const JS_URLS = fs.readdirSync(JS_BUILD_DIR)
  .filter(f => f.endsWith('.js') && !/gtm|analytics|hotjar|cookiebot/.test(f))
  .sort()
  .map(f => `/clones/${SLUG}/app/themes/stavbadesign/build/${f}`);

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

  // Strip external scripts
  body = body.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents|seznam|bat\.bing)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr|CybotCookiebot)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');

  // Strip WP emoji
  body = body.replace(/<img[^>]*alt="([^"]*)"[^>]*src="https?:\/\/s\.w\.org\/[^"]*"[^>]*\/?>/gi, '$1');
  body = body.replace(/<img[^>]*src="https?:\/\/s\.w\.org\/[^"]*"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '$1');

  // YouTube iframes → placeholder
  body = body.replace(/<iframe[^>]*src="https?:\/\/www\.youtube\.com\/embed\/[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#111;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;color:#555;font-size:1rem">▶ Video</div>');

  const overrideCss = `<style>
    [class*="cmplz"],[class*="cookie-banner"],[id*="cmplz"],[id*="CybotCookiebot"]{display:none!important;visibility:hidden!important}
    body{overflow:auto!important}
    #wpadminbar{display:none!important}
    html{margin-top:0!important}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed stavbadesign-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Stavba Design', 'stavební firma Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'stavbadesign.cz', cms: 'WordPress Bedrock + Tailwind v4 + Vite' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Stavba Design`, 'Ukázka šablony pro stavební firmu Praha.']);

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
