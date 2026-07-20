/**
 * FÁZE 2 — Seed DB pro zrno-zrnko-demo
 * Webnode 2 CMS (pekárna & kavárna Praha Nusle), 4 stránky
 *
 * Spustit: node scripts/seed-zrnozrnko-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'zrnozrnko';
const TENANT_SLUG = 'zrno-zrnko-demo';
const ACCESS_TOKEN = 'zrnko' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/cdn1/files/0r/0rk/0rklmm.css`,
  `/clones/${SLUG}/cdn1/files/2u/2uq/2uqmi8.css`,
  `/clones/${SLUG}/cdn1/files/0k/0k1/0k1ucs.css`,
  `/clones/${SLUG}/cdn1/files/0o/0on/0onzbj.css`,
  `/clones/${SLUG}/cdn1/files/1j/1jo/1jorv9.css`,
  `/clones/${SLUG}/cdn1/files/48/48g/48gira.css`,
  `/clones/${SLUG}/cdn1/files/2m/2m8/2m8msc.css`,
  `/clones/${SLUG}/cdn1/files/2b/2b9/2b9a9p.css`,
  `/clones/${SLUG}/cdn1/files/34/34q/34qmjb.css`,
].filter(u => fs.existsSync(`public${u}`));

const JS_URLS = [
  `/clones/${SLUG}/cdn1/client.fe/js.compiled/lang.cz.0e4d422db27b5ab8.js`,
  `/clones/${SLUG}/cdn1/client.fe/js.compiled/compiled.multi.284da6a7756aab79.js`,
  `/clones/${SLUG}/cdn1/files/2y/2yn/2yn6bm.js`,
].filter(u => fs.existsSync(`public${u}`));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',    title: 'Domů',    file: 'home.html',    isHome: true  },
  { slug: 'o-nas',   title: 'O nás',   file: 'o-nas.html',   isHome: false },
  { slug: 'pekarna', title: 'Pekárna', file: 'pekarna.html', isHome: false },
  { slug: 'kava',    title: 'Káva',    file: 'kava.html',    isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch?.[1] || '';
  const inlineStyles = [...headContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip tracking scripts
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics|chimpstatic|events\.webnode)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<script[^>]*mcjs[^>]*>[\s\S]*?<\/script>/gi, '');
  // Strip Mailchimp popup embed (causes CSP violation)
  body = body.replace(/<script[^>]*mailchimp\.com[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*downloads\.mailchimp[^>]*><\/script>/gi, '');
  body = body.replace(/<link[^>]*mailchimp[^>]*>/gi, '');
  // Replace YouTube iframes with placeholder (CSP blocks them)
  body = body.replace(/<iframe[^>]*(?:youtube\.com|youtu\.be)[^>]*><\/iframe>/gi, '<div style="background:#000;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px">Video</div>');

  // Strip cookie banners
  body = body.replace(/<div[^>]*(?:cookie|consent|gdpr)[^>]*>[\s\S]{0,5000}?<\/div>\s*(?=<div|<\/)/gi, '');

  // Fix faceup.com link (whistleblower — map to #)
  body = body.replace(/href="https?:\/\/faceup\.com\/[^"]*"/gi, 'href="#"');

  // Fix remaining preconnect / external link hrefs to faceup
  body = body.replace(/href="https?:\/\/(?:fonts\.googleapis|fonts\.gstatic)[^"]*"/gi, 'href="#"');

  // CSS override for Webnode layout
  const overrideCss = `<style>
    /* Webnode cookie consent override */
    [class*="wnd-cookie"],[class*="wnd-consent"],[class*="wnd-gdpr"]{display:none!important}
    /* Ensure sections visible */
    .s{visibility:visible!important;opacity:1!important}
    /* Remove empty inline scripts noise */
    noscript{display:none}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed zrno-zrnko-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Zrno Zrnko', 'pekárna & kavárna Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'zrnozrnko.cz', cms: 'Webnode 2' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/zrnozrnko\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Zrno Zrnko`, 'Ukázka šablony pro pekárnu a kavárnu v Praze.']);

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
