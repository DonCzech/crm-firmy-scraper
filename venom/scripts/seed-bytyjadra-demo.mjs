/**
 * Seed bytyjadra-demo — Next.js site
 * Run: node -e "import('/Users/apple/DEV/CRM/venom/scripts/seed-bytyjadra-demo.mjs')"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'bytyjadra';
const TENANT_SLUG = 'bytyjadra-demo';
const ACCESS_TOKEN = 'bytyjadra' + Math.random().toString(36).slice(2, 8);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CHUNKS_DIR = path.join(ROOT, `public/clones/${SLUG}/_next/static/chunks`);
const CSS_URLS = fs.existsSync(CHUNKS_DIR)
  ? fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.css')).map(f => `/clones/${SLUG}/_next/static/chunks/${f}`)
  : [];

const JS_URLS = fs.existsSync(CHUNKS_DIR)
  ? fs.readdirSync(CHUNKS_DIR)
      .filter(f => f.endsWith('.js') && !/gtm|analytics|hotjar|cookiebot/.test(f))
      .sort()
      .map(f => `/clones/${SLUG}/_next/static/chunks/${f}`)
  : [];

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

  // Rewrite /_next/ paths to /clones/SLUG/_next/
  body = body.replace(/\/_next\//g, `/clones/${SLUG}/_next/`);

  // Fix /_next/image?url= — decode to static path or blank
  body = body.replace(/\/clones\/bytyjadra\/_next\/image\?url=([^&"'\s]+)[^"'\s]*/g, (m, encoded) => {
    try {
      const decoded = decodeURIComponent(encoded);
      // Check if static file exists
      const localPath = path.join(ROOT, 'public/clones', SLUG, decoded.replace(/^\//, ''));
      if (fs.existsSync(localPath)) return `/clones/${SLUG}${decoded}`;
    } catch {}
    return m; // keep as-is, KILL script will block external requests
  });

  // External scripts
  body = body.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents|smartsupp)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<noscript>[\s\S]*?(?:facebook\.com\/tr)[\s\S]*?<\/noscript>/gi, '');
  body = body.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr|cmplz|CybotCookiebot)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');

  // Maps
  body = body.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');

  const overrideCss = `<style>
    [class*="cmplz"],[class*="cookie-banner"],[id*="cmplz"],[id*="CybotCookiebot"]{display:none!important;visibility:hidden!important}
    body{overflow:auto!important}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed bytyjadra-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Byty Jadra', 'rekonstrukce bytů Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'bytyjadra.cz', cms: 'Next.js' })]);
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
      `${p.title} — Demo Byty Jadra`, 'Ukázka šablony pro rekonstrukce bytů Praha.']);

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
