/**
 * FÁZE 2 — Seed DB pro hybernska-demo
 * Shoptet CMS (restaurace), 4 stránky
 *
 * Spustit: node scripts/seed-hybernska-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'hybernska';
const TENANT_SLUG = 'hybernska-demo';
const ACCESS_TOKEN = 'hybernska' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/cdn/prj/dist/master/cms/templates/frontend_templates/shared/css/font-face/poppins.css`,
  `/clones/${SLUG}/cdn/prj/dist/master/shop/dist/font-shoptet-12.css.d637f40c301981789c16.css`,
  `/clones/${SLUG}/cdn/prj/dist/master/shop/dist/main-12.less.4a5bd0366cf44a81f44f.css`,
  `/clones/${SLUG}/cdn/prj/dist/master/shop/dist/mobile-header-v1-12.less.4aab4161dc148faca991.css`,
  `/clones/${SLUG}/user/documents/css/mmenu.css`,
  `/clones/${SLUG}/user/documents/css/tgthr.css`,
].filter(u => fs.existsSync(`public${u}`));

// Shoptet JS excluded entirely: makes AJAX calls, has syntax issues with stub env
// CSS handles all visual rendering; jQuery only for basic DOM
const JS_URLS = [
  `/clones/${SLUG}/cdn/prj/dist/master/cms/libs/jquery/jquery-1.11.3.min.js`,
].filter(u => fs.existsSync(`public${u}`));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',  title: 'Domů',   file: 'home.html',  isHome: true  },
  { slug: 'o-nas', title: 'O nás',  file: 'o-nas.html', isHome: false },
  { slug: 'menu',  title: 'Menu',   file: 'menu.html',  isHome: false },
  { slug: 'akce',  title: 'Akce',   file: 'akce.html',  isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip ALL external <script src> — blocking network reqs + prevents duplicates with jsUrls
  body = body.replace(/<script[^>]*src="https?:\/\/[^"]*"[^>]*><\/script>/gi, '');
  // Strip all local <script src> too — jsUrls handles load order correctly
  body = body.replace(/<script[^>]+src="\/clones\/[^"]*"[^>]*><\/script>/gi, '');

  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  // Strip remaining inline tracking/init scripts
  body = body.replace(/<script[^>]*>[\s\S]{0,500}?(?:gtag|dataLayer|fbq|_hjSettings)[\s\S]{0,500}?<\/script>/gi, '');

  // Cookie bar (Shoptet)
  body = body.replace(/<div[^>]*id="cookies[^"]*"[^>]*>[\s\S]{0,2000}?<\/div>/gi, '');

  // Shoptet stubs — prevent JS init errors from missing Shoptet internals
  const shoptetStubs = `<script>
    window.Shoptet=window.Shoptet||{};
    window.Shoptet.processTrackingContainer=function(){};
    window.ShoptetTracking=window.ShoptetTracking||{};
    window.ShoptetTracking.processTrackingContainer=function(){};
    window._=window._||{create:function(){return{}},throttle:function(f){return f},debounce:function(f){return f},each:function(){},extend:function(a,b){return Object.assign(a||{},b||{})},bind:function(f,c){return f.bind(c)}};
    // Block Shoptet AJAX fragments that 404 in demo
    document.addEventListener('DOMContentLoaded',function(){
      if(window.jQuery){
        jQuery.ajaxSetup({beforeSend:function(xhr,settings){
          var u=settings.url||'';
          if(u==='/allcat'||u==='/footer'||u.match(/^\/(allcat|footer|header)(\?|$)/)){
            xhr.abort();return false;
          }
        }});
      }
    });
  </script>`;

  // Fix hero: replace external menubot.cz background with local downloaded image
  body = body.replace(
    /id="showtimeMaster"[^>]*style="[^"]*menubot\.cz[^"]*"/gi,
    `id="showtimeMaster" style="display:block!important;background:linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.35)),url('/clones/${SLUG}/cdn/hero-bg.jpg') center center/cover;min-height:580px;position:relative"`
  );
  // Also fix any remaining menubot.cz background-image inline styles
  body = body.replace(/url\(&quot;https:\/\/www\.menubot\.cz[^&]*&quot;\)/gi,
    `url('/clones/${SLUG}/cdn/hero-bg.jpg')`);
  body = body.replace(/url\("https:\/\/www\.menubot\.cz[^"]*"\)/gi,
    `url('/clones/${SLUG}/cdn/hero-bg.jpg')`);

  // Make Bootstrap carousel visible (hidden by default without JS)
  body = body.replace(/<div class="wide-carousel" style="display: none !important;">/gi,
    `<div class="wide-carousel" style="display:block!important;">`);
  // Activate first carousel item
  body = body.replace(/<div class="carousel-inner"[^>]*>(\s*)<div class="item active">/gi,
    (m) => m); // already active — keep as is

  const overrideCss = `<style>
    #cookies,#cookie-bar,.cookie-bar,#shoptet-cookie-bar,.shoptet-cookie-bar,
    [class*="siteCookies"],[class*="cookie-bar"],[class*="gdpr"]{display:none!important}
    .shoptet-logo,.shoptet-badge,#shoptetLogo{display:none!important}
    /* Hero height + text positioning */
    #showtimeMaster{min-height:580px!important;display:flex!important;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:0 60px 60px}
    #showtimeMaster h1{color:#fff!important;font-size:clamp(28px,4vw,52px)!important;text-shadow:0 2px 12px rgba(0,0,0,.7)!important;margin:0 0 16px}
    #showtimeMaster h1 a{color:inherit!important;text-decoration:none!important}
    #showtimeMaster .book{background:#b8860b;color:#fff!important;padding:12px 28px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-decoration:none!important;border-radius:3px}
    /* Carousel image sizing */
    .wide-carousel .slidein img{width:100%!important;height:580px!important;object-fit:cover!important}
    .wide-carousel .carousel-inner{min-height:580px!important}
  </style>`;

  return KILL + '\n' + shoptetStubs + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed hybernska-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Hybernská Demo', 'restaurace & kavárna Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'restauracehybernska.cz', cms: 'Shoptet' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/restauracehybernska\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Hybernská`, 'Ukázka šablony pro restauraci Praha.']);

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
