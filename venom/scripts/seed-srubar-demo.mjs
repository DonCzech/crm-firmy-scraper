/**
 * FÁZE 2 — Seed DB pro jan-srubar-demo
 * Next.js SSR on Vercel (realitní makléř), 4 stránky
 *
 * Spustit: node scripts/seed-srubar-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'srubar';
const TENANT_SLUG = 'jan-srubar-demo';
const ACCESS_TOKEN = 'srubar' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [];
const cssDir = `public/clones/${SLUG}/_next/static/chunks`;
if (fs.existsSync(cssDir)) {
  for (const f of fs.readdirSync(cssDir)) {
    if (f.endsWith('.css')) CSS_URLS.push(`/clones/${SLUG}/_next/static/chunks/${f}`);
  }
}
const JS_URLS = [];
log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

function stripDivBlock(html, startMatch) {
  const startIdx = html.search(startMatch);
  if (startIdx === -1) return html;
  let depth = 0;
  const re = /<\/?div[^>]*>/gi;
  re.lastIndex = startIdx;
  let m;
  while ((m = re.exec(html))) {
    if (m[0][1] === '/') {
      depth--;
      if (depth === 0) return html.substring(0, startIdx) + html.substring(m.index + m[0].length);
    } else depth++;
  }
  return html;
}

const PAGES = [
  { slug: 'home',    title: 'Domů',     file: 'home.html',    isHome: true  },
  { slug: 'o-mne',   title: 'O mně',    file: 'o-mne.html',   isHome: false },
  { slug: 'sluzby',  title: 'Služby',   file: 'sluzby.html',  isHome: false },
  { slug: 'kontakt', title: 'Kontakt',  file: 'kontakt.html', isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

  body = stripDivBlock(body, /<div[^>]*id="(?:usercentrics-root|CybotCookiebotDialog|didomi-host|didomi-popup|onetrust-consent-sdk)"/i);
  body = stripDivBlock(body, /<div[^>]*class="[^"]*(?:usercentrics|cookiebot|didomi-popup|didomi-notice|onetrust)[^"]*"/i);

  // Strip eurobydleni links + whatsapp + facebook
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:eurobydleni|wa\.me|connect\.facebook|facebook|maps\.app\.goo)[^"]*"/gi, 'href="#"');

  const overrideCss = `<style>
    [id*="usercentrics"],[id*="Cookiebot"],[id*="Cybot"],[id*="didomi"],[id*="onetrust"],
    [class*="usercentrics"],[class*="Cookiebot"],[class*="Cybot"],[class*="didomi"],[class*="onetrust"]{display:none!important;visibility:hidden!important}
    body{overflow:auto!important;padding-top:0!important}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed jan-srubar-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Jan Šrubař', 'realitní makléř Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'jansrubar.cz', cms: 'Next.js SSR on Vercel' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/jansrubar\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Jan Šrubař`, 'Ukázka šablony pro realitního makléře.']);

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
