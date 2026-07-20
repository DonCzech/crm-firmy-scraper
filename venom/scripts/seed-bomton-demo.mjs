import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'bomton';
const TENANT_SLUG = 'bomton-demo';
const ACCESS_TOKEN = 'bomton' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// CSS from mirror (Wix embeds CSS in HTML, but also downloads CSS files)
const CSS_URLS = fs.existsSync(`public/clones/${SLUG}/css`)
  ? fs.readdirSync(`public/clones/${SLUG}/css`)
      .filter(f => f.endsWith('.css'))
      .map(f => `/clones/${SLUG}/css/${f}`)
  : [];
const JS_URLS = []; // Wix JS is external — kill-external handles it

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

// Rewrite remaining wixstatic.com URLs to local imgs based on hash ID
function rewriteWixImages(html) {
  return html.replace(
    /https?:\/\/static\.wixstatic\.com\/media\/([a-zA-Z0-9_]+(?:~|%7E)mv2\.[a-zA-Z0-9]{2,5})[^"'\s)>]*/gi,
    (match, id) => {
      const localName = id.replace(/%7E/gi, '~').replace(/~/g, '_');
      const localPath = `/clones/${SLUG}/img/${localName}`;
      // Check if file exists
      if (fs.existsSync(`public${localPath}`)) return localPath;
      // Download if possible - for now just return the local path (may 404 but won't break layout)
      return localPath;
    }
  );
}

const PAGES = [
  { slug: 'home',      title: 'Domů',     file: 'home.html',      isHome: true  },
  { slug: 'o-klinice', title: 'O klinice', file: 'o-klinice.html', isHome: false },
];

function patchHtml(rawHtml) {
  // Extract all <style> blocks
  const allStyles = [...rawHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip all external script src= (tracking/analytics/Wix specific)
  const BAD_SRC = ['googletagmanager', 'google-analytics', 'facebook.net', 'fbevents',
    'clarity.ms', 'wix.com', 'd70shl7vidtft', 'cloudfront.net', 'doubleclick',
    'smartlook', 'hotjar', 'tawk.to'];
  for (const pat of BAD_SRC) {
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*><\\/script>`, 'gi'), '');
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*>[\\s\\S]{0,500}?<\\/script>`, 'gi'), '');
  }
  
  // Strip Wix Email Campaign popup (ec_form_5-... outer div)
  {
    const marker = 'id="ec_form_5-';
    const idx = body.indexOf(marker);
    if (idx >= 0) {
      const divStart = body.lastIndexOf('<div', idx);
      if (divStart >= 0) {
        let depth = 0, i = divStart;
        while (i < body.length) {
          if (body.slice(i, i + 4).toLowerCase() === '<div') { depth++; i += 4; }
          else if (body.slice(i, i + 5).toLowerCase() === '</div') { depth--; if (depth === 0) { i += 6; break; } i += 5; }
          else i++;
        }
        body = body.slice(0, divStart) + body.slice(i);
      }
    }
  }

  // Strip GTM noscript
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<noscript><img[^>]*facebook\.com\/tr[^>]*><\/noscript>/gi, '');

  // Rewrite remaining wixstatic URLs to local
  body = rewriteWixImages(body);

  // Fix bomtonclinic links
  body = body.replace(/https?:\/\/(?:www\.)?bomtonclinic\.cz\/o-klinice/gi, '/demo/bomton-demo/o-klinice');
  body = body.replace(/https?:\/\/(?:www\.)?bomtonclinic\.cz\/?(?=[\"'])/gi, '/demo/bomton-demo');

  // Brand scrub
  body = body.replace(/Bomton Clinic(?!\s*Demo)/gi, 'Bomton Clinic Demo');
  body = body.replace(/bomtonclinic\.cz/gi, 'demo.local');
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  body = body.replace(/[a-z.]+@bomtonclinic\.cz/gi, 'info@demo.local');
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok)\.com\/[^"]*"/gi, 'href="#"');

  const wowFix = `<script>(function(){function fix(){document.querySelectorAll('wow-image[data-image-info]').forEach(function(el){try{var i=JSON.parse(el.getAttribute('data-image-info'));var d=i.imageData||{};var u=d.uri;if(!u)return;var isSmall=(d.width||9999)<500;var n=u.replace(/~/g,'_');var src='/clones/bomton/img/'+n;var isLQIP=i.isLQIP||false;var imgs=el.querySelectorAll('img');imgs.forEach(function(img){img.src=src;img.style.filter='none';if(isLQIP&&!isSmall){img.style.objectFit='cover';img.style.width='100%';img.style.height='100%';img.removeAttribute('width');img.removeAttribute('height');}});if(!isSmall){el.querySelectorAll('source').forEach(function(s){s.parentNode&&s.parentNode.removeChild(s);});};}catch(e){}});} if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fix);}else{fix();}})()</script>`;

  return KILL + '\n' + wowFix + '\n' + allStyles + '\n' + body;
}

log('=== Seed bomton-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Bomton Clinic', 'kosmetická klinika Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'bomtonclinic.cz', cms: 'Wix Thunderbolt' })]);
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
      `${p.title} — Demo Bomton Clinic`, 'Ukázka šablony pro kosmetickou kliniku Praha.']);

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
