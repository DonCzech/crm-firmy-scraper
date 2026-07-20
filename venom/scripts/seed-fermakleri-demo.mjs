/**
 * FÁZE 2 — Seed DB pro fer-makleri-demo
 * Custom PHP (realitní kancelář), 4 stránky
 *
 * Spustit: node scripts/seed-fermakleri-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'fermakleri';
const TENANT_SLUG = 'fer-makleri-demo';
const ACCESS_TOKEN = 'fer' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/v2/css/bootstrap.min.css`,
  `/clones/${SLUG}/v2/css/font-awesome.min.css`,
  `/clones/${SLUG}/v2/css/style.min.css`,
  `/clones/${SLUG}/v2/css/home-newfunnel.min.css`,
  `/clones/${SLUG}/v2/css/star-rating-svg.css`,
].filter(u => fs.existsSync(`public${u}`));

const JS_URLS = [
  `/clones/${SLUG}/v2/js/jquery.min.js`,
];

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',        title: 'Domů',        file: 'home.html',        isHome: true  },
  { slug: 'o-nas',       title: 'O nás',       file: 'o-nas.html',       isHome: false },
  { slug: 'kontakt',     title: 'Kontakt',     file: 'kontakt.html',     isHome: false },
  { slug: 'pro-maklere', title: 'Pro makléře', file: 'pro-maklere.html', isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip remaining tracking + ALL external scripts (CSP would block them anyway)
  body = body.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|clarity|smartlook|seznam|twitter|maps\.googleapis|unpkg|jsdelivr)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip cookie banners
  body = body.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr-banner|cookieconsent)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  const overrideCss = `<style>
    [class*="cookie-banner"],[class*="cookie-consent"],[class*="gdpr"],[id*="cookie-bar"]{display:none!important}
    body{overflow:auto!important}
  </style>`;

  // jQuery inline before any inline scripts depending on it
  const jqueryInline = `<script src="/clones/${SLUG}/v2/js/jquery.min.js"></script>`;

  return KILL + '\n' + overrideCss + '\n' + jqueryInline + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed fer-makleri-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo FER Makléři', 'realitní kancelář — síť makléřů',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'fermakleri.cz', cms: 'Custom PHP' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/fermakleri\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo FER Makléři`, 'Ukázka šablony pro realitní kancelář se sítí makléřů.']);

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
