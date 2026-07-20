/**
 * FÁZE 2 — Seed DB pro ambi-bistro-demo
 * Astro SSG + Contember CMS (restaurace Ambiente), 4 stránky
 *
 * Spustit: node scripts/seed-ambi-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'ambi';
const TENANT_SLUG = 'ambi-bistro-demo';
const ACCESS_TOKEN = 'ambi' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// All 4 pages use the same CSS files
const CSS_URLS = [
  `/clones/${SLUG}/_astro/_page_.cMaIwc_o.css`,
  `/clones/${SLUG}/_astro/_page_.DxuIuBcF.css`,
  `/clones/${SLUG}/_astro/_page_.CIWZKZp1.css`,
  `/clones/${SLUG}/_astro/_page_.CHWh3Jzq.css`,
].filter(u => fs.existsSync(`public${u}`));

// Astro JS is ES modules — skip (static HTML renders fully server-side)
const JS_URLS = [];

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',             title: 'Domů',          file: 'home.html',            isHome: true  },
  { slug: 'nase-podniky',     title: 'Naše podniky',  file: 'nase-podniky.html',    isHome: false },
  { slug: 'pribeh-ambiente',  title: 'Příběh',        file: 'pribeh-ambiente.html', isHome: false },
  { slug: 'kontakty',         title: 'Kontakty',      file: 'kontakty.html',        isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch?.[1] || '';

  // Extract inline <style> blocks from head
  const inlineStyles = [...headContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip remaining GTM/tracking scripts
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics|_hjSettings)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<script[^>]*src="https?:\/\/connect\.facebook\.net[^"]*"[^>]*><\/script>/gi, '');

  // Strip cookie consent dialogs
  body = body.replace(/<div[^>]*(?:cookie|consent|gdpr|cookiehub)[^>]*>[\s\S]{0,5000}?<\/div>\s*(?=<div|<\/)/gi, '');

  // Fix any remaining absolute paths
  body = body.replace(/https?:\/\/(?:www\.)?ambi\.cz(\/[^"'> ]*)/gi, '$1');

  // CSS override: Astro islands hydration visibility
  const overrideCss = `<style>
    [data-astro-cid]{opacity:1!important;visibility:visible!important}
    a[href="#rezervace"]{cursor:pointer}
  </style>`;

  // Font preload links — paths already rewritten by mirror script, inject as-is
  const fontPreloads = [...headContent.matchAll(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>/gi)]
    .map(m => m[0])
    .join('\n');

  return KILL + '\n' + overrideCss + '\n' + fontPreloads + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed ambi-bistro-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Ambiente Bistro', 'restaurace & gastronomie Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'ambi.cz', cms: 'Astro SSG + Contember CMS' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/ambi\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Ambiente`, 'Ukázka šablony pro restauraci a gastronomii Praha.']);

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
