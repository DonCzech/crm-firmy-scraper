/**
 * Fix perfectcatering + freja: body-only HTML, cssUrls for CSS, jsUrls for JS
 * ClonedSiteRenderer uses dangerouslySetInnerHTML — full HTML with <head> causes
 * CSS links to land inside a child <head> element of the div, not the document head.
 * Body-only + cssUrls is the correct approach (React hoists cssUrls to document head).
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

function extractBody(fullHtml) {
  const m = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1].trim() : fullHtml;
}

// ─── PERFECTCATERING ─────────────────────────────────────────────────────────
{
  let fullHtml = fs.readFileSync(path.join(ROOT, 'public/clones/perfectcatering/pages/home.html'), 'utf8');
  let body = extractBody(fullHtml);

  // Prepend style overrides (mobile menu closed, scroll-reveal visible, swiper fix)
  const styleOverride = `<style>
/* Venom: hide consent overlay */
#cmp-main, .cmpbox, [id^="cmp-"], .cmp-overlay,
[class*="consent"], [id*="consent"] { display: none !important; }
/* Close mobile menu by default (Nuxt hydration opens it without Vue state) */
.c-main-menu { transform: translateX(-100%) !important; pointer-events: none !important; opacity: 0 !important; }
/* Show scroll-reveal elements immediately */
.o-scroll--hidden { opacity: 1 !important; transform: none !important; transition: none !important; }
/* Normalize swiper coverflow (captured mid-rotation) */
.swiper-slide { transform: none !important; opacity: 1 !important; }
.swiper-slide-active { z-index: 2 !important; }
</style>`;

  body = styleOverride + '\n' + body;

  const CSS = [
    '/clones/perfectcatering/fonts/fonts.css',
    '/clones/perfectcatering/css/entry.tv3aUegN.css',
    '/clones/perfectcatering/css/LayoutOverlay.DoC_9bmE.css',
    '/clones/perfectcatering/css/swiper-vue.Bs3d9ZnH.css',
    '/clones/perfectcatering/css/index.DyVCfqEt.css',
    '/clones/perfectcatering/css/HomepageOurWork.DarhoQYJ.css',
    '/clones/perfectcatering/css/default.BONAyE2F.css',
    '/clones/perfectcatering/css/LayoutFooter.CyuopMa0.css',
    '/clones/perfectcatering/css/index.D0FxNzf8.css',
    '/clones/perfectcatering/css/index.pi13xmKO.css',
    '/clones/perfectcatering/css/dark-header.Yk_eeriY.css',
  ];

  const JS = [
    '/clones/perfectcatering/js/kill-external.js',
    '/clones/perfectcatering/js/lGpdQipz.js',
    '/clones/perfectcatering/js/Dg4CONWt.js',
    '/clones/perfectcatering/js/Bu6C1Oq0.js',
    '/clones/perfectcatering/js/B-zutJaK.js',
    '/clones/perfectcatering/js/CFIMC17t.js',
    '/clones/perfectcatering/js/DKCsSyge.js',
    '/clones/perfectcatering/js/C8knssVm.js',
    '/clones/perfectcatering/js/D7QDGN_t.js',
    '/clones/perfectcatering/js/Dy3kXblp.js',
    '/clones/perfectcatering/js/CYy0Ym0-.js',
    '/clones/perfectcatering/js/DGXQjzHz.js',
    '/clones/perfectcatering/js/C1DmMxWt.js',
    '/clones/perfectcatering/js/CweO2bkm.js',
  ];

  const r = await pool.query(`SELECT s.id FROM sections s JOIN pages p ON s.page_id=p.id JOIN tenants t ON p.tenant_id=t.id WHERE t.slug='perfectcatering-demo' LIMIT 1`);
  await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [
    JSON.stringify({ html: body, cssUrls: CSS, jsUrls: JS }),
    r.rows[0].id,
  ]);
  console.log(`perfectcatering: body=${body.length}B cssUrls=${CSS.length} jsUrls=${JS.length} ✅`);
}

// ─── FREJA ───────────────────────────────────────────────────────────────────
{
  let fullHtml = fs.readFileSync(path.join(ROOT, 'public/clones/freja/pages/home.html'), 'utf8');
  let body = extractBody(fullHtml);

  // Venom overrides at top of body
  const styleOverride = `<style>
/* Venom: hide Shopify dynamic elements */
cart-drawer, cart-notification, .shopify-section--cart,
[id*="shopify"], [class*="shopify-challenge"],
.cookie-bar, .cookie-banner, #cookie-consent { display: none !important; }
</style>`;
  body = styleOverride + '\n' + body;

  // All 50 CSS files
  const cssFiles = fs.readdirSync(path.join(ROOT, 'public/clones/freja/css')).sort();
  const CSS = cssFiles.map(f => `/clones/freja/css/${f}`);
  const JS = ['/clones/freja/js/kill-external.js'];

  const r = await pool.query(`SELECT s.id FROM sections s JOIN pages p ON s.page_id=p.id JOIN tenants t ON p.tenant_id=t.id WHERE t.slug='freja-demo' LIMIT 1`);
  await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [
    JSON.stringify({ html: body, cssUrls: CSS, jsUrls: JS }),
    r.rows[0].id,
  ]);
  console.log(`freja: body=${body.length}B cssUrls=${CSS.length} jsUrls=${JS.length} ✅`);
}

await pool.end();
console.log('=== HOTOVO ===');
