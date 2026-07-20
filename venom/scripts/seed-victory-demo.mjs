import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'victory';
const TENANT_SLUG = 'victory-demo';
const ACCESS_TOKEN = 'victory' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// CSS: get from processed home.html link tags
const homeHtml = fs.readFileSync(`public/clones/${SLUG}/pages/home.html`, 'utf8');
const CSS_URLS = [...homeHtml.matchAll(/href="(\/clones\/victory[^"]+\.css[^"]*)"/gi)].map(m => m[1].split('?')[0]);
const JS_URLS = [
  `/clones/${SLUG}/js/jquery.min.js`,
  `/clones/${SLUG}/js/jquery-migrate.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/js/frontend-modules.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/js/frontend.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/lib/smartmenus/jquery.smartmenus.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/lib/sticky/jquery.sticky.min.js`,
].filter(u => fs.existsSync('public' + u));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',    title: 'Domů',            file: 'home.html',    isHome: true  },
  { slug: 'skupiny', title: 'Skupinové lekce', file: 'skupiny.html', isHome: false },
  { slug: 'kontakt', title: 'Kontakt',          file: 'kontakt.html', isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip GTM noscript
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip external scripts by src
  for (const pat of ['clarity.ms','facebook.net','googletagmanager','google-analytics','cookiebot','complianz','cmplz','s.w.org']) {
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*>(?:[\\s\\S]{0,200}?)?<\\/script>`, 'gi'), '');
  }

  // Strip Complianz cookie divs by id
  for (const id of ['cmplz-cookiebanner-container', 'cmplz-manage-consent', 'cmplz-overlay']) {
    let idx = body.indexOf(`id="${id}"`);
    if (idx < 0) idx = body.indexOf(`id='${id}'`);
    while (idx >= 0) {
      const divStart = body.lastIndexOf('<div', idx);
      let depth = 0, i = divStart;
      while (i < body.length) {
        if (body[i] === '<') {
          if (body.slice(i,i+4) === '<div') { depth++; i+=4; }
          else if (body.slice(i,i+6) === '</div>') { depth--; if(depth===0){i+=6;break;} i+=6; }
          else i++;
        } else i++;
      }
      body = body.slice(0, divStart) + body.slice(i);
      idx = body.indexOf(`id="${id}"`);
    }
  }

  // Strip emoji images
  body = body.replace(/<img[^>]*src="[^"]*s\.w\.org[^"]*"[^>]*>/gi, '');

  // Social links → #
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok)\.com\/[^"]*"/gi, 'href="#"');

  // Brand scrub
  body = body.replace(/Fitness Victory(?!\s*Demo)/g, 'Fitness Victory Demo');
  body = body.replace(/fitnessvictory\.cz/gi, 'demo.local');
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  body = body.replace(/[a-z.]+@fitnessvictory\.cz/gi, 'info@demo.local');

  // Fix wp-content paths not already localized
  body = body.replace(/(?<!\/clones\/victory)\/wp-content\//g, '/clones/victory/wp-content/');

  // Fix Elementor counter widget — counter.js chunk fails (blocked by kill-external)
  // Read data-to-value from each counter element and set its text content
  const counterFix = `<script>(function(){function fix(){document.querySelectorAll('.elementor-counter-number[data-to-value]').forEach(function(el){el.textContent=el.getAttribute('data-to-value');});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fix);}else{fix();}})()</script>`;

  return KILL + '\n' + counterFix + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed victory-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Fitness Victory', 'fitness & wellness',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'fitnessvictory.cz', cms: 'WordPress/Elementor' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}/gi)||[]).filter(u=>!u.includes('demo.local')&&!u.includes('schema.org')&&!u.includes('w3.org')).length;
  const brand = (html.match(/fitnessvictory\.cz/gi)||[]).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext=${ext} brand=${brand}`);
  const pg2 = await pool.query(`INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [tid, p.slug, p.title, p.isHome, `${p.title} — Demo Fitness Victory`, 'Ukázka šablony pro fitness centrum Praha.']);
  await pool.query(`INSERT INTO sections (tenant_id,page_id,section_type,settings,order_index,is_visible) VALUES ($1,$2,'full-page-clone',$3,0,true)`,
    [tid, pg2.rows[0].id, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);
  log(`  ${p.slug} → page ${pg2.rows[0].id} ✅`);
}

await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Published ✅`);
await pool.end();
log(`Done! Token: ${ACCESS_TOKEN}`);
log(`http://localhost:3015/demo/${TENANT_SLUG}`);
