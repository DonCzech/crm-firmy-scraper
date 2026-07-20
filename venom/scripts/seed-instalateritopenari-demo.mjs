/**
 * Seed instalateritopenari-demo — WordPress + Elementor + W3 Total Cache
 * Run: node -e "import('/Users/apple/DEV/CRM/venom/scripts/seed-instalateritopenari-demo.mjs')"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'instalateritopenari';
const TENANT_SLUG = 'instalateritopenari-demo';
const ACCESS_TOKEN = 'instalater' + Math.random().toString(36).slice(2, 8);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// Extract CSS/JS URLs from the home.html link/script tags
function extractUrls(html, type) {
  const urls = [];
  const seenUrls = new Set();
  const clonePrefix = `/clones/${SLUG}/`;
  if (type === 'css') {
    const re = /href="(\/clones\/[^"]*\.css)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      if (!seenUrls.has(m[1])) { seenUrls.add(m[1]); urls.push(m[1]); }
    }
  } else {
    const re = /src="(\/clones\/[^"]*\.js)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      if (!seenUrls.has(m[1])) { seenUrls.add(m[1]); urls.push(m[1]); }
    }
  }
  return urls;
}

const homeHtml = fs.readFileSync(path.join(ROOT, `public/clones/${SLUG}/pages/home.html`), 'utf8');
const CSS_URLS = extractUrls(homeHtml, 'css');
const JS_URLS = extractUrls(homeHtml, 'js');
log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',      title: 'Domů',      file: 'home.html',      isHome: true  },
  { slug: 'sluzby',    title: 'Služby',    file: 'sluzby.html',    isHome: false },
  { slug: 'reference', title: 'Reference', file: 'reference.html', isHome: false },
  { slug: 'kontakt',   title: 'Kontakt',   file: 'kontakt.html',   isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  body = body.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents|smartsupp|seznam)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<noscript>[\s\S]*?(?:facebook\.com\/tr)[\s\S]*?<\/noscript>/gi, '');
  body = body.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr|cmplz|CybotCookiebot|complianz)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');
  body = body.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');

  const overrideCss = `<style>
    [class*="cmplz"],[class*="cookie-banner"],[id*="cmplz"],[id*="CybotCookiebot"],[class*="complianz"]{display:none!important;visibility:hidden!important}
    body{overflow:auto!important}
    #wpadminbar{display:none!important}
    html{margin-top:0!important}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed instalateritopenari-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Instalatéři a Topenáři', 'instalatérství Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'instalateritopenari.cz', cms: 'WordPress Astra + Elementor + W3 Total Cache' })]);
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
      `${p.title} — Demo Instalatéři a Topenáři`, 'Ukázka šablony pro instalatérství Praha.']);

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
