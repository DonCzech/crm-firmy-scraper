import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'yesvisage';
const TENANT_SLUG = 'yesvisage-demo';
const ACCESS_TOKEN = 'yesvisage' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  `/clones/${SLUG}/app/themes/ipress/build/css/style.min.css`,
];
if (fs.existsSync(`public/clones/${SLUG}/css/search-forms.min.css`)) {
  CSS_URLS.push(`/clones/${SLUG}/css/search-forms.min.css`);
}

// No JS — the site's scripts.min.js causes rendering issues (re-initializes Splide carousel)
// CSS overrides make the static carousel visible instead
const JS_URLS = [];

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',    title: 'Domů',   file: 'home.html',    isHome: true  },
  { slug: 'cenik',   title: 'Ceník',  file: 'cenik.html',   isHome: false },
  { slug: 'kontakt', title: 'Kontakt', file: 'kontakt.html', isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  const BAD_SRC = ['clarity.ms', 'facebook.net', 'fbevents', 'googletagmanager', 'google-analytics',
    'gstatic.com/recaptcha', 's.w.org', 'cookiebot', 'complianz', 'cmplz',
    'bat.bing.com', 'adform.net', 'seznam.cz/js/rc', 'smartlook.com',
    'doubleclick.net', 'manychat.com', 'mccdn.me'];
  for (const pat of BAD_SRC) {
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*><\\/script>`, 'gi'), '');
    body = body.replace(new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*>[\\s\\S]{0,500}?<\\/script>`, 'gi'), '');
  }

  // Strip the site's own cookie widget JS (all references — src attr and inline init)
  body = body.replace(/<script[^>]*cookies-widget[^>]*><\/script>/gi, '');
  body = body.replace(/<script[^>]*\/app\/themes\/ipress\/cookies-widget[^>]*><\/script>/gi, '');
  body = body.replace(/<script[^>]*ajax[^>]*><\/script>/gi, '');

  // Strip SearchWP admin CSS links (not needed for frontend)
  body = body.replace(/<link[^>]*searchwp[^>]*>/gi, '');

  // Strip Google Fonts (fallback to system fonts)
  body = body.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');

  // Strip cookie banner div by class
  for (const cls of ['cookie-widget', 'cookies-widget', 'cookie-consent', 'cookie-bar']) {
    const re = new RegExp(`<div[^>]*${cls}[^>]*>[\\s\\S]{0,3000}?<\\/div>`, 'gi');
    body = body.replace(re, '');
  }

  // Strip newsletter popup (shown by JS timer)
  body = body.replace(/<div[^>]*id="js-NewsletterFancybox"[^>]*>[\s\S]{0,5000}?<\/div>\s*<\/div>/gi, '');
  // Strip fancybox promo popup (popup-promo inside fancybox__content)
  body = body.replace(/<div[^>]*fancybox__container[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');
  body = body.replace(/<div[^>]*fancybox-placeholder[^>]*>[\s\S]{0,200}?<\/div>/gi, '');
  // Strip aside-message floating promo sidebar
  body = body.replace(/<div[^>]*aside-message[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');
  // Strip top promo message bar (seasonal campaign carousel) — depth-count nested divs
  {
    const marker = 'splide--message';
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

  body = body.replace(/<iframe[^>]*\bsrc="[^"]*youtube[^"]*"[^>]*><\/iframe>/gi, '');
  body = body.replace(/<noscript><img[^>]*facebook\.com\/tr[^>]*><\/noscript>/gi, '');
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Fix root-relative asset paths (Playwright preserves them as-is, not in imgMap)
  // Use negative lookbehind so already-localized paths aren't double-prefixed
  body = body.replace(/(?<!\/clones\/yesvisage)\/app\/uploads\//g, '/clones/yesvisage/app/uploads/');
  // Broad ipress theme rewrite (build/, cookies-widget/, etc.)
  body = body.replace(/(?<!\/clones\/yesvisage)\/app\/themes\/ipress\//g, '/clones/yesvisage/app/themes/ipress/');

  // Brand scrub
  body = body.replace(/Yes Visage(?!\s*Demo)/g, 'Yes Visage Demo');
  body = body.replace(/yesvisage\.cz/gi, 'demo.local');
  body = body.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  body = body.replace(/[a-z.]+@yesvisage\.cz/gi, 'info@demo.local');

  // Fix internal links to point to demo routes
  body = body.replace(/https?:\/\/(?:www\.)?yesvisage\.cz\/cenik/gi, '/demo/yesvisage-demo/cenik');
  body = body.replace(/https?:\/\/(?:www\.)?yesvisage\.cz\/kontakt/gi, '/demo/yesvisage-demo/kontakt');
  body = body.replace(/https?:\/\/(?:www\.)?yesvisage\.cz\/?(?=["'])/gi, '/demo/yesvisage-demo');

  // CSS overrides
  const splideFixCss = `<style>
    /* Hide all popups & overlays */
    .fancybox__container,.fancybox-placeholder,.aside-message,.popup-promo,
    .cookie-widget,.cookies-widget,.cookies-bar,.cookie-consent-bar,
    [class*="cookie"],[id*="cookie"]{display:none!important}
    /* Hide top promo message bar (seasonal campaign) */
    .message.splide--message,.message{display:none!important}
    /* Splide carousel — show first slide without JS init */
    .splide--fade>.splide__track>.splide__list>.splide__slide{opacity:0;position:absolute;top:0;left:0;width:100%}
    .splide--fade>.splide__track>.splide__list>.splide__slide:first-child,
    .splide--fade>.splide__track>.splide__list>.splide__slide.is-active{opacity:1!important;z-index:1!important;position:relative}
    .splide__slide.is-active{opacity:1!important;z-index:1!important}
    /* Hero carousel height */
    .hero__carousel{min-height:600px}
    .hero__carousel-item,.hero__carousel-item-bg{min-height:600px}
    @media(max-width:768px){.hero__carousel,.hero__carousel-item,.hero__carousel-item-bg{min-height:420px}}
    /* Reduce dark overlay so images show */
    .hero .hero__carousel-item-bg:before{opacity:0.5!important}
    /* infoIcon in cookies widget — ignore these 404s */
    img[src*="infoIcon"]{display:none!important}
    /* iPress animate class: opacity:0 until JS fires — force visible without JS */
    .animate{opacity:1!important;transform:none!important}
    /* Notification bar at top — strip it */
    .site-header-promo,.header-promo{display:none!important}
  </style>`;

  return KILL + '\n' + splideFixCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed yesvisage-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Yes Visage', 'kosmetická klinika Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'yesvisage.cz', cms: 'WordPress/ipress theme' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brand = (html.match(/yesvisage\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Yes Visage`, 'Ukázka šablony pro kosmetickou kliniku Praha.']);

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
