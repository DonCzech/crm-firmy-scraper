import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'tribo';
const TENANT_SLUG = 'tribo-demo';
const ACCESS_TOKEN = 'tribo' + Math.random().toString(36).slice(2, 11);

const CSS_URLS = [`/clones/${SLUG}/css/cached.1776726191.3845918116.core.css`];
const JS_URLS = [
  `/clones/${SLUG}/js/cached.1778578777.3746200156.core.js`,
  `/clones/${SLUG}/js/cached.1756215626.900273133.module.js`,
  `/clones/${SLUG}/js/cached.1778578777.3084430484.app.js`,
  `/clones/${SLUG}/js/cached.app.init.js`,
];

const PAGES = [
  { slug: 'home',    title: 'Domů',    file: 'home.html',    isHome: true  },
  { slug: 'tattoo',  title: 'Tattoo',  file: 'tattoo.html',  isHome: false },
  { slug: 'cenik',   title: 'Ceník',   file: 'cenik.html',   isHome: false },
  { slug: 'kontakt', title: 'Kontakt', file: 'kontakt.html', isHome: false },
];

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function extractBody(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|facebook\.net|cookiebot)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]+src="[^"]*(?:tribo\.cz\/assets)[^"]*"[^>]*><\/script>/gi, '');
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:instagram|facebook|youtube)\.com\/[^"]*"/gi, 'href="#"');

  // Rewrite /files/responsive/.../filename → /clones/tribo/img/filename (keep only local img)
  body = body.replace(/srcset="[^"]*"/gi, (match) => {
    // Find any local /clones/tribo/img/ entry to use as single src
    const local = match.match(/\/clones\/tribo\/img\/([^\s"]+)/);
    if (local) return `srcset="/clones/tribo/img/${local[1]}"`;
    // Otherwise extract filename from /files/responsive/.../filename and point to local img
    const fname = match.match(/\/files\/responsive\/\d+\/\d+\/([^\s"]+)/);
    if (fname) return `srcset="/clones/tribo/img/${fname[1]}"`;
    return match;
  });
  // Also rewrite remaining absolute tribo.cz file URLs in src attributes
  body = body.replace(/src="https?:\/\/(?:www\.)?tribo\.cz\/files\/[^/]+\/[^/]+\/[^/]+\/([^"]+)"/gi,
    (m, fname) => `src="/clones/tribo/img/${fname}"`);
  // Rewrite root-relative /files/responsive paths
  body = body.replace(/src="\/files\/responsive\/\d+\/\d+\/([^"]+)"/gi,
    (m, fname) => `src="/clones/tribo/img/${fname}"`);

  // Brand scrub
  body = body.replace(/TRIBO(?!\s*Demo|\s*studio|\s*tattoo|\s*piercing)/g, 'TRIBO Demo');
  body = body.replace(/tribo\.cz(?!\s)/gi, 'demo.local');
  body = body.replace(/[a-z.]+@tribo\.cz/gi, 'info@demo.local');
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  return KILL + '\n' + inlineStyles + '\n' + body;
}

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

log('=== Seed tribo-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo TRIBO Studio', 'tetování & piercing',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'tribo.cz', cms: 'Custom PHP CMS' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (let i = 0; i < PAGES.length; i++) {
  const p = PAGES[i];
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = extractBody(rawHtml);
  log(`${p.slug}: ${rawHtml.length}→${html.length}`);
  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
    VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tenant_id,slug) DO UPDATE
    SET title=$3,is_homepage=$4 RETURNING id
  `, [tid, p.slug, p.title, p.isHome, `${p.title} — Demo TRIBO Studio`, 'Ukázka šablony pro tetovací studio. Demo verze.']);
  await pool.query(`
    INSERT INTO sections (tenant_id,page_id,section_type,settings,order_index,is_visible)
    VALUES ($1,$2,'full-page-clone',$3,0,true) ON CONFLICT DO NOTHING
  `, [tid, pg2.rows[0].id, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);
  log(`  ${p.slug} → ${pg2.rows[0].id} ✅`);
}

await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Published ✅`);
await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
