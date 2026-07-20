/**
 * FÁZE 2 — Seed DB pro best-drive-demo
 * Adobe AEM (autoservis řetězec, Continental BestDrive), 4 stránky
 *
 * Spustit: node scripts/seed-bestdrive-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'bestdrive';
const TENANT_SLUG = 'best-drive-demo';
const ACCESS_TOKEN = 'bd' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u,location.href).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/etc.clientlibs/contitrade-aem/clientlibs/base.lc-3147ab27f6d86cacdd5f66dbabf0c6a6-lc.min.css`,
  `/clones/${SLUG}/etc.clientlibs/contitrade-aem/clientlibs/conti-app.lc-CQCj2ldD-71e1223-lc.min.css`,
].filter(u => fs.existsSync(`public${u}`));

const JS_URLS = []; // AEM JS too complex, skip

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
  { slug: 'home',       title: 'Domů',       file: 'home.html',       isHome: true  },
  { slug: 'prodejny',   title: 'Prodejny',   file: 'prodejny.html',   isHome: false },
  { slug: 'akce',       title: 'Akce',       file: 'akce.html',       isHome: false },
  { slug: 'pneuservis', title: 'Pneuservis', file: 'pneuservis.html', isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

  // Strip consent banners
  body = stripDivBlock(body, /<div[^>]*id="(?:cmpwrapper|cmpcontainer|cmp-consent-banner)"/i);
  body = stripDivBlock(body, /<div[^>]*class="[^"]*(?:consent-banner|cookie-banner|cmpwrapper)[^"]*"/i);

  // Strip external partner links
  body = body.replace(/href="https?:\/\/(?:[a-z0-9.-]*\.)?(?:fleetpartner|bestdrive\.ch|accessiway|mczbf)\.[a-z]+\/?[^"]*"/gi, 'href="#"');

  const overrideCss = `<style>
    [class*="cmpwrapper"],[class*="consent-banner"],[class*="cookie-banner"],[id*="cmpwrapper"],[id*="cookiebot"]{display:none!important;visibility:hidden!important}
    body{overflow:auto!important;padding-top:0!important}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed best-drive-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo BestDrive', 'autoservis & pneuservis řetězec',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'bestdrive.cz', cms: 'Adobe AEM' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/bestdrive\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo BestDrive`, 'Ukázka šablony pro autoservis & pneuservis řetězec.']);

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
