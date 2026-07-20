/**
 * FÁZE 2 — Seed DB pro fyziovsem-demo
 * WordPress + OceanWP + Elementor Pro, 4 stránky
 *
 * Spustit: node scripts/seed-fyziovsem-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'fyziovsem';
const TENANT_SLUG = 'fyziovsem-demo';
const ACCESS_TOKEN = 'fyziovsem' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// CSS: shared across all pages
const CSS_URLS = [
  // OceanWP theme
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/fonts/fontawesome/css/all.min.css`,
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/css/third/simple-line-icons.min.css`,
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/css/style.min.css`,
  // Elementor core
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/frontend.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-image.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-heading.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-icon-list.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-icon-box.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-image-box.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-social-icons.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-video.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-divider.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/widget-spacer.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/conditionals/apple-webkit.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/css/conditionals/e-swiper.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/font-awesome/css/fontawesome.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/font-awesome/css/solid.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/font-awesome/css/brands.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInUp.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/animations/styles/e-animation-pop.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/animations/styles/e-animation-grow.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css`,
  // Elementor Pro
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/css/widget-nav-menu.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/css/widget-slides.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/css/widget-posts.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/css/widget-form.min.css`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/css/modules/motion-fx.min.css`,
  // Elementor post CSS (all pages combined)
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-8.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-10.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-40.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-274.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-406.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-609.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-805.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-5946.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-5950.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-5953.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/css/post-5956.css`,
  // Google Fonts (locally hosted by Elementor)
  `/clones/${SLUG}/wp-content/uploads/elementor/google-fonts/css/roboto.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/google-fonts/css/robotoslab.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/google-fonts/css/opensans.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/google-fonts/css/montserrat.css`,
  `/clones/${SLUG}/wp-content/uploads/elementor/google-fonts/css/opensanshebrew.css`,
].filter(u => fs.existsSync(`public${u}`));

// JS: jQuery + OceanWP + Elementor stack
const JS_URLS = [
  `/clones/${SLUG}/wp-includes/js/jquery/jquery.min.js`,
  `/clones/${SLUG}/wp-includes/js/jquery/jquery-migrate.min.js`,
  `/clones/${SLUG}/wp-includes/js/imagesloaded.min.js`,
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/js/theme.min.js`,
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/js/drop-down-mobile-menu.min.js`,
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/js/vendors/flickity.pkgd.min.js`,
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/js/ow-slider.min.js`,
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/js/scroll-effect.min.js`,
  `/clones/${SLUG}/wp-content/themes/oceanwp/assets/js/scroll-top.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/js/frontend-modules.min.js`,
  `/clones/${SLUG}/wp-includes/js/jquery/ui/core.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/js/frontend.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/lib/smartmenus/jquery.smartmenus.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min.js`,
  `/clones/${SLUG}/wp-includes/js/dist/hooks.min.js`,
  `/clones/${SLUG}/wp-includes/js/dist/i18n.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/js/frontend.min.js`,
  `/clones/${SLUG}/wp-content/plugins/elementor-pro/assets/js/elements-handlers.min.js`,
].filter(u => fs.existsSync(`public${u}`));

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',   title: 'Domů',    file: 'home.html',   isHome: true  },
  { slug: 'o-nas',  title: 'O nás',   file: 'o-nas.html',  isHome: false },
  { slug: 'sluzby', title: 'Služby',  file: 'sluzby.html', isHome: false },
  { slug: 'cenik',  title: 'Ceník',   file: 'cenik.html',  isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip remaining tracking/cookie scripts
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|complianz|cmplz|cookieblocker|cookiebot)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip Complianz cookie banner divs (depth-count)
  for (const marker of ['cmplz-cookiebanner', 'cmplz-overlay', 'cmplz-manage-consent', 'cc-nb']) {
    let start = body.indexOf(`id="${marker}"`);
    if (start < 0) start = body.indexOf(`class="${marker}`);
    while (start >= 0) {
      const divStart = body.lastIndexOf('<div', start);
      if (divStart < 0) break;
      let depth = 0, i = divStart;
      while (i < body.length) {
        if (body.slice(i, i + 4) === '<div') { depth++; i += 4; }
        else if (body.slice(i, i + 6) === '</div>') { depth--; if (depth === 0) { i += 6; break; } i += 6; }
        else i++;
      }
      body = body.slice(0, divStart) + body.slice(i);
      start = body.indexOf(`id="${marker}"`);
      if (start < 0) start = body.indexOf(`class="${marker}`);
    }
  }

  // Fix absolute http://www.fyziovsem.cz URLs not caught by origin strip
  body = body.replace(/https?:\/\/(?:www\.)?fyziovsem\.cz\/wp-content\//gi, '/clones/fyziovsem/wp-content/');
  body = body.replace(/https?:\/\/(?:www\.)?fyziovsem\.cz\/wp-includes\//gi, '/clones/fyziovsem/wp-includes/');
  // Fix JSON-encoded absolute demo.local URLs (Elementor config: https:\/\/demo.local\/ → /clones/fyziovsem/)
  body = body.replace(/https:\\\/\\\/(?:www\.)?demo\.local\\\//g, '/clones/fyziovsem/');
  // Fix plain absolute demo.local URLs → root-relative
  body = body.replace(/https?:\/\/(?:www\.)?demo\.local\/wp-content\//gi, '/clones/fyziovsem/wp-content/');
  body = body.replace(/https?:\/\/(?:www\.)?demo\.local\/wp-includes\//gi, '/clones/fyziovsem/wp-includes/');
  body = body.replace(/https?:\/\/(?:www\.)?demo\.local(\/[^"'> ]*)/gi, '$1');

  // Strip video embed (local mp4 not mirrored fully — hide rather than 404)
  body = body.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');

  // CSS override: fix Elementor animate + Flickity initial visibility
  const overrideCss = `<style>
    /* Strip cookie banner */
    .cmplz-cookiebanner,.cmplz-overlay,.cmplz-manage-consent,[class*="cmplz-"]{display:none!important}
    /* Elementor animate: force visible without JS */
    .elementor-invisible,.animated{opacity:1!important;transform:none!important;visibility:visible!important}
    /* Flickity: show first slide statically */
    .flickity-slider>.slide:first-child,.flickity-slider>.elementor-slide:first-child{position:relative!important;left:0!important;transform:none!important}
    .flickity-viewport{height:auto!important}
    /* Video section: hide if no video */
    .elementor-widget-video.elementor-widget-empty{display:none}
  </style>`;

  return KILL + '\n' + overrideCss + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed fyziovsem-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Fyzio Všem', 'fyzioterapie & rehabilitace Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'fyziovsem.cz', cms: 'WordPress/OceanWP+Elementor' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brand = (html.match(/fyziovsem\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Fyzio Všem`, 'Ukázka šablony pro fyzioterapeutické centrum Praha.']);

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
