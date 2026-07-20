/**
 * FÁZE 2 — Seed DB pro lacasa-latina-demo
 * WordPress + WPBakery + Webox theme, 4 stránky
 *
 * Spustit: node scripts/seed-lacasalatina-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'lacasalatina';
const TENANT_SLUG = 'lacasa-latina-demo';
const ACCESS_TOKEN = 'lacasa' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const CSS_URLS = [
  // Webox theme base
  `/clones/${SLUG}/wp-content/themes/webox/css/build/style.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/grid-system.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/responsive.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/skin-material.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/header/header-layout-menu-left-aligned.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/off-canvas/core.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/off-canvas/slide-out-right-material.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/elements/element-fancy-box.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/elements/element-team-member.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/plugins/jquery.fancybox.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/build/plugins/select2.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/font-awesome-legacy.min.css`,
  `/clones/${SLUG}/wp-content/themes/webox/css/webox-dynamic-styles.css`,
  // WordPress plugins
  `/clones/${SLUG}/wp-content/plugins/js_composer_webox/assets/css/js_composer.min.css`,
  `/clones/${SLUG}/wp-content/plugins/webox-portfolio/css/portfolio.css`,
  `/clones/${SLUG}/wp-content/plugins/contact-form-7/includes/css/styles.css`,
  `/clones/${SLUG}/wp-content/plugins/popup-builder/public/css/theme.css`,
].filter(u => fs.existsSync(`public${u}`));

// jQuery loaded inline at top of body (see patchHtml) — exclude from jsUrls
const JS_URLS = [
  `/clones/${SLUG}/wp-content/themes/webox/js/build/third-party/anime.min.js`,
  `/clones/${SLUG}/wp-content/themes/webox/js/build/third-party/jquery.easing.min.js`,
  `/clones/${SLUG}/wp-content/themes/webox/js/build/third-party/hoverintent.min.js`,
  `/clones/${SLUG}/wp-content/plugins/webox-core/js/third-party/touchswipe.min.js`,
  `/clones/${SLUG}/wp-content/themes/webox/js/build/priority.js`,
  `/clones/${SLUG}/wp-content/themes/webox/js/build/init.js`,
  `/clones/${SLUG}/wp-content/plugins/webox-portfolio/js/third-party/imagesLoaded.min.js`,
  `/clones/${SLUG}/wp-content/plugins/webox-portfolio/js/third-party/isotope.min.js`,
  `/clones/${SLUG}/wp-content/plugins/webox-portfolio/js/webox-portfolio.js`,
  `/clones/${SLUG}/wp-content/plugins/js_composer_webox/assets/js/dist/js_composer_front.min.js`,
].filter(u => fs.existsSync(`public${u}`));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',     title: 'Domů',      file: 'home.html',     isHome: true  },
  { slug: 'o-nas',    title: 'O nás',     file: 'o-nas.html',    isHome: false },
  { slug: 'menu',     title: 'Menu',      file: 'menu.html',     isHome: false },
  { slug: 'galerie',  title: 'Galerie',   file: 'galerie.html',  isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip remaining tracking
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|cookielaw|cmplz|cookieblocker)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<script[^>]*src="https?:\/\/(?:connect\.facebook|static\.xx\.fbcdn)[^"]*"[^>]*><\/script>/gi, '');

  // Strip popup-builder popups (these load dynamically and can cover content)
  body = body.replace(/<div[^>]*sgpb-popup[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  body = body.replace(/<div[^>]*id="sgpb[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Strip remaining cookie banners
  body = body.replace(/<div[^>]*(?:cookie-notice|cn-notice|cmplz-|cli-bar|cookieconsent)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  // Fix absolute URLs that may have leaked through
  body = body.replace(/https?:\/\/(?:www\.)?lacasalatina\.cz\/wp-content\//gi, `/clones/${SLUG}/wp-content/`);
  body = body.replace(/https?:\/\/(?:www\.)?lacasalatina\.cz\/wp-includes\//gi, `/clones/${SLUG}/wp-includes/`);
  body = body.replace(/https?:\/\/(?:www\.)?demo\.local\/wp-content\//gi, `/clones/${SLUG}/wp-content/`);
  body = body.replace(/https?:\/\/(?:www\.)?demo\.local\/wp-includes\//gi, `/clones/${SLUG}/wp-includes/`);
  body = body.replace(/https?:\/\/(?:www\.)?demo\.local(\/[^"'> ]*)/gi, '$1');
  // JSON-encoded demo.local URLs
  body = body.replace(/https:\\\/\\\/(?:www\.)?demo\.local\\\//g, `/clones/${SLUG}/`);

  // CSS override for popup + cookie bar + WPBakery defaults
  const overrideCss = `<style>
    /* Hide popup-builder popups & cookie consent */
    [class*="sgpb-popup"],[id*="sgpb-popup"],
    [class*="cookie-notice"],[class*="cn-notice"],[class*="cmplz-"],
    [class*="cookieconsent"]{display:none!important}
    /* Ensure body scrollable */
    body{overflow:auto!important}
    /* WPBakery row reveal */
    .vc_row{visibility:visible!important;opacity:1!important}
  </style>`;

  // Load jQuery synchronously BEFORE any inline scripts in body that depend on it
  const jqueryInline = `<script src="/clones/${SLUG}/wp-includes/js/jquery/jquery.min.js"></script>
<script src="/clones/${SLUG}/wp-includes/js/jquery/jquery-migrate.min.js"></script>
<script>window.monkey_theme_info=window.monkey_theme_info||{ajaxurl:'/',themepath:'/clones/${SLUG}/wp-content/themes/webox',i18n:{}};</script>`;

  return KILL + '\n' + overrideCss + '\n' + jqueryInline + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed lacasa-latina-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo La Casa Latina', 'restaurace latino fusion Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'lacasalatina.cz', cms: 'WordPress + WPBakery + Webox' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/lacasalatina\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo La Casa Latina`, 'Ukázka šablony pro latinoamerickou restauraci v Praze.']);

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
