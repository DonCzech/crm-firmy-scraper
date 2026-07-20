/**
 * FÁZE 2 — Seed DB pro cafe-savoy-demo
 * Astro SSG + Contember CMS (Café Savoy / Ambiente), 3 stránky
 *
 * Spustit: node scripts/seed-cafesavoy-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'cafesavoy';
const TENANT_SLUG = 'cafe-savoy-demo';
const ACCESS_TOKEN = 'cafesavoy' + Math.random().toString(36).slice(2, 10);

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// Cafesavoy CSS files (auto-detected from _astro/)
const CSS_URLS = [
  `/clones/${SLUG}/_astro/_page_.BXYBGCHR.css`,
  `/clones/${SLUG}/_astro/_page_.DCZ6HdWf.css`,
  `/clones/${SLUG}/_astro/_page_.DGuEgMha.css`,
  `/clones/${SLUG}/_astro/_page_.Do7kTF71.css`,
  `/clones/${SLUG}/_astro/_slug_.CaOKB8xM.css`,
].filter(u => fs.existsSync(`public${u}`));

// Astro JS is ES modules — skip (static HTML renders fully server-side)
const JS_URLS = [];

log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',       title: 'Domů',      file: 'home.html',      isHome: true  },
  { slug: 'menu',       title: 'Menu',      file: 'menu.html',      isHome: false },
  { slug: 'rezervace',  title: 'Rezervace', file: 'rezervace.html', isHome: false },
];

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch?.[1] || '';

  // Extract inline <style> blocks from head
  const inlineStyles = [...headContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip remaining GTM/tracking scripts
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics|_hjSettings)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<script[^>]*src="https?:\/\/connect\.facebook\.net[^"]*"[^>]*><\/script>/gi, '');

  // Strip cookie consent dialogs
  body = body.replace(/<div[^>]*(?:cookie|consent|gdpr|cookiehub)[^>]*>[\s\S]{0,5000}?<\/div>\s*(?=<div|<\/)/gi, '');

  // Fix any remaining absolute paths
  body = body.replace(/https?:\/\/(?:www\.|cafesavoy\.)?ambi\.cz(\/[^"'> ]*)/gi, '$1');

  // CSS override: force ALL Astro scroll-reveal & animation-hidden elements visible
  // These classes have opacity:0;visibility:hidden as initial state, revealed by JS intersection observers
  const overrideCss = `<style>
    [data-astro-cid]{opacity:1!important;visibility:visible!important}
    a[href="#rezervace"]{cursor:pointer}
    /* Force all Astro obfuscated animation-hidden classes visible */
    ._1L6Gs,._3EVaT,._3U8bo,._address_12b30_24,._backgroundImage_1o96p_58,
    ._branchAddresses_12b30_28,._button_12b30_32,._content_1o96p_5,._content_rucsj_32,
    ._controlsNext_7glcn_66,._controlsPrevious_7glcn_53,._desktopPattern_444v4_11,
    ._details_9kond_47,._errorMessage_nx352_48,._fork_1r0ud_19,
    ._headerBackground_1gryz_36,._headerBackground_qycn5_45,
    ._image3_xhhbz_142,._imageText_kssy2_69,._image_1cfbt_11,._image_1iq00_26,
    ._image_1o96p_25,._image_3vnji_155,._image_br3ur_28,._image_n1ivx_20,
    ._image_wvmwz_11,._image_yw389_1,._input_rqfi4_11,
    ._isHidden_10ovv_1,._isHidden_17p66_30,._isHidden_19wf0_9,._isHidden_1a7xt_11,
    ._isHidden_1lf50_59,._isHidden_1ta1j_38,._isHidden_7glcn_61,._isHidden_zwbdj_54,
    ._is_hidden_1ol1d_17,._item_9smdr_87,._knife_1fp1r_1,._list_1xaht_9,
    ._logoHover_1y47m_12,._logoHover_2fgl7_7,._logoWrapper_xtk75_11,
    ._mapImage_1cfbt_62,._mascot3_1q4o1_9,._neon_wvmwz_31,
    ._pattern_928fl_13,._pattern_w1hvw_17,
    ._practitionerPlaceholder_13d6k_174,._practitionerPlaceholder_1sg5e_123,
    ._scatteredImage_4trnn_134,._sectionTitleBox_1m69g_137,
    ._socials_1ht38_60,._socials_1n2q1_1,._socials_bqa5q_35,
    ._textContent_1cfbt_106,._textOnLeft_n1ivx_34,._textWrapper_1k936_1,
    ._text_12b30_16,._text_n1ivx_5,._text_wvmwz_21,
    ._title_12b30_16,._title_tm165_1,
    ._wrapperNaseMaso_1w5tf_1,._wrapper_1qwzr_1,._wrapper_22csz_1,
    ._wrapper_9hj4e_1,._wrapper_i8bb3_7,._wrapper_p2hko_1,
    ._wrapper_re3x3_1,._wrapper_yfkm8_2,._isFaded_wvmwz_177,
    ._searchIcon_9kond_8,._isHomePage_1fet5_35 {
      opacity: 1 !important;
      visibility: visible !important;
      transform: none !important;
      transition: none !important;
    }
  </style>`;

  // JS: remove inline opacity:0 and visibility:hidden — Astro islands set these as inline styles
  // CSS !important cannot override inline styles, so JS must clear them
  const revealJs = `<script>
  (function(){
    function revealInline(){
      document.querySelectorAll('[style]').forEach(function(el){
        var s=el.style;
        if(s.opacity==='0'||s.opacity==='0.0'||s.visibility==='hidden'){
          s.removeProperty('opacity');
          s.removeProperty('visibility');
          s.removeProperty('transform');
        }
      });
    }
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',function(){revealInline();setTimeout(revealInline,300);setTimeout(revealInline,800);});
    } else {
      revealInline();setTimeout(revealInline,300);setTimeout(revealInline,800);
    }
  })();
  </script>`;

  // Font preload links — paths already rewritten by mirror script, inject as-is
  const fontPreloads = [...headContent.matchAll(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>/gi)]
    .map(m => m[0])
    .join('\n');

  return KILL + '\n' + overrideCss + '\n' + revealJs + '\n' + fontPreloads + '\n' + inlineStyles + '\n' + body;
}

log('=== Seed cafe-savoy-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');
const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Café Savoy', 'kavárna & restaurace Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'cafesavoy.ambi.cz', cms: 'Astro SSG + Contember CMS' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);
  const ext = (html.match(/src="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]+"/gi) || []).length;
  const brand = (html.match(/cafesavoy\.ambi\.cz|(?<!demo\.)ambi\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext_src=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Café Savoy`, 'Ukázka šablony pro kavárnu a restauraci v Praze.']);

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
