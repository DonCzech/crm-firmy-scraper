import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'celebrate';
const TENANT_SLUG = 'celebrate-demo';
const ACCESS_TOKEN = 'celebrate' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = fs.existsSync(`public/clones/${SLUG}/css`)
  ? fs.readdirSync(`public/clones/${SLUG}/css`)
      .filter(f => !f.includes('.js') && !f.includes('.jpg') && !f.includes('.png'))
      .map(f => `/clones/${SLUG}/css/${f}`)
  : [];
const JS_URLS = [];

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',     title: 'Domů',    file: 'home.html',     isHome: true  },
  { slug: 'manikura', title: 'Manikúra', file: 'manikura.html', isHome: false },
  { slug: 'onas',     title: 'O nás',   file: 'onas.html',     isHome: false },
];

function rewriteWixImages(html) {
  return html.replace(
    /https?:\/\/static\.wixstatic\.com\/media\/([a-zA-Z0-9_]+(?:~|%7E)mv2\.[a-zA-Z0-9]{2,5})[^"'\s)>]*/gi,
    (match, id) => {
      const localName = id.replace(/%7E/gi, '~').replace(/~/g, '_');
      const localPath = `/clones/${SLUG}/img/${localName}`;
      if (fs.existsSync(`public${localPath}`)) return localPath;
      return localPath;
    }
  );
}

function patchHtml(rawHtml) {
  const allStyles = [...rawHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  const BAD_SRC = ['googletagmanager', 'google-analytics', 'facebook.net', 'fbevents',
    'clarity.ms', 'wix.com', 'cloudfront.net', 'doubleclick', 'smartlook', 'hotjar', 'tawk.to'];
  for (const pat of BAD_SRC) {
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*><\\/script>`, 'gi'), '');
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*>[\\s\\S]{0,500}?<\\/script>`, 'gi'), '');
  }

  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<noscript><img[^>]*facebook\.com\/tr[^>]*><\/noscript>/gi, '');
  body = rewriteWixImages(body);

  // Fix internal links
  body = body.replace(/https?:\/\/(?:www\.)?celebratesalon\.cz\/manikura/gi, '/demo/celebrate-demo/manikura');
  body = body.replace(/https?:\/\/(?:www\.)?celebratesalon\.cz\/onas/gi, '/demo/celebrate-demo/onas');
  body = body.replace(/https?:\/\/(?:www\.)?celebratesalon\.cz\/?(?=[\"'])/gi, '/demo/celebrate-demo');

  // Brand scrub
  body = body.replace(/Celebrate Salon(?!\s*Demo)/gi, 'Celebrate Salon Demo');
  body = body.replace(/celebratesalon\.cz/gi, 'demo.local');
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  body = body.replace(/[a-z.]+@celebratesalon\.cz/gi, 'info@demo.local');
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok)\.com\/[^"]*"/gi, 'href="#"');

  // Inline fix for wow-image img srcs that still point to tiny placeholders
  const wowFix = `<script>(function(){function fix(){document.querySelectorAll('wow-image[data-image-info]').forEach(function(el){try{var i=JSON.parse(el.getAttribute('data-image-info'));var d=i.imageData||{};var u=d.uri;if(!u)return;var isSmall=(d.width||9999)<500;var n=u.replace(/~/g,'_');var src='/clones/celebrate/img/'+n;var isLQIP=i.isLQIP||false;var imgs=el.querySelectorAll('img');imgs.forEach(function(img){img.src=src;img.style.filter='none';if(isLQIP&&!isSmall){img.style.objectFit='cover';img.style.width='100%';img.style.height='100%';img.removeAttribute('width');img.removeAttribute('height');}});if(!isSmall){el.querySelectorAll('source').forEach(function(s){s.parentNode&&s.parentNode.removeChild(s);});};}catch(e){}});} if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fix);}else{fix();}})()</script>`;

  return KILL + '\n' + wowFix + '\n' + allStyles + '\n' + body;
}

log('=== Seed celebrate-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Celebrate Salon', 'nehtové studio Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'celebratesalon.cz', cms: 'Wix Thunderbolt' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const wix = (html.match(/wixstatic\.com/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext=${ext} wix=${wix}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Celebrate Salon`, 'Ukázka šablony pro nehtové studio Praha.']);

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
