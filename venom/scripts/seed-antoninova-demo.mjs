/**
 * Seed antoninova-demo
 * WordPress + Marco theme + Vegas background slider
 * Fix: Vegas slider has height:0px (set by JS) → CSS override + inline style fix
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'antoninova';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'antoninova-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// Read raw HTML (use raw to get correct structure)
const rawHtml = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home-raw.html`), 'utf8');
log(`Read home-raw.html: ${rawHtml.length} bytes`);

// Split after </head> to avoid JS comment body tag issues
const headEnd = rawHtml.indexOf('</head>');
const afterHead = headEnd > -1 ? rawHtml.slice(headEnd + 7) : rawHtml;
const bodyM = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : afterHead;
log(`Body extracted: ${body.length} bytes`);

// ─── Strip ALL scripts ───────────────────────────────────────────────────────
const scriptsBefore = (body.match(/<script[\s\S]*?<\/script>/gi) || []).length;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
log(`Removed ${scriptsBefore} script tags`);

// ─── Fix Vegas slider height (JS sets height:0px inline) ────────────────────
body = body.replace(/style="height:\s*0px;?"/g, 'style="height: 100vh;"');
log('Fixed vegas-container height (0px → 100vh)');

// ─── Fix Vegas slide inline background-image URLs ────────────────────────────
let bgFixed = 0;
body = body.replace(/background-image:\s*url\(&quot;https?:\/\/(?:www\.)?antoninovopekarstvi\.cz\/wp-content\/uploads\/[^&]*\/([^&"]+)&quot;\)/g,
  (match, fname) => {
    const localPath = `/clones/${SLUG}/img/${fname}`;
    const diskPath = path.join(ROOT, 'public', localPath);
    if (fs.existsSync(diskPath)) { bgFixed++; return `background-image: url('${localPath}')`; }
    // Fallback: use local dark background
    return 'background-image: url(\'/clones/antoninova/img/kazde-rano-zarovky-1920x1080.png\')';
  }
);
// Also handle non-encoded quotes
body = body.replace(/background-image:\s*url\("https?:\/\/(?:www\.)?antoninovopekarstvi\.cz\/wp-content\/uploads\/[^"]*\/([^"]+)"\)/g,
  (match, fname) => {
    const localPath = `/clones/${SLUG}/img/${fname}`;
    const diskPath = path.join(ROOT, 'public', localPath);
    if (fs.existsSync(diskPath)) { bgFixed++; return `background-image: url('${localPath}')`; }
    return `background-image: url('/clones/antoninova/img/kazde-rano-zarovky-1920x1080.png')`;
  }
);
log(`Fixed ${bgFixed} Vegas background-image refs`);

// ─── Fix regular image src URLs ─────────────────────────────────────────────
let imgFixed = 0;
body = body.replace(/src="https?:\/\/(?:www\.)?antoninovopekarstvi\.cz\/wp-content\/uploads\/[^"]*\/([^"?]+)(?:\?[^"]*)?"( |\/|>)/g,
  (match, fname, end) => {
    const localPath = `/clones/${SLUG}/img/${fname}`;
    const diskPath = path.join(ROOT, 'public', localPath);
    if (fs.existsSync(diskPath)) { imgFixed++; return `src="${localPath}"${end}`; }
    return match;
  }
);
log(`Fixed ${imgFixed} img src refs`);

// ─── Fix CSS src URLs (link href) ────────────────────────────────────────────
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`)).sort().map(f => `/clones/${SLUG}/css/${f}`);

// ─── Fix internal links ──────────────────────────────────────────────────────
body = body.replace(/href="https?:\/\/(?:www\.)?antoninovopekarstvi\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="http:\/\/(?:www\.)?antoninovopekarstvi\.cz([^"]*)"/gi, 'href="#"');
body = body.replace(/href="http:\/\/pekarstvi\.albi\.cz[^"]*"/gi, 'href="#"');
body = body.replace(/action="[^"]*antoninovopekarstvi[^"]*"/gi, 'action="#"');

// ─── CMS scrub ───────────────────────────────────────────────────────────────
body = body
  .replace(/Antonín[a-záčďéěíňóřšťúůýž]{1,10}\s+[a-záčďéěíňóřšťúůýž]{1,15}/gi, (m) =>
    m.toLowerCase().includes('kavárna') || m.toLowerCase().includes('kavarna')
      ? 'Demo kavárna' : 'Demo pekařství')
  .replace(/Antoninovo\s+pekarstvi/gi, 'Demo pekarstvi')
  .replace(/antoninovopekarstvi\.cz/gi, 'demo.local')
  .replace(/pekarstvi\.albi\.cz/gi, 'demo.local')
  .replace(/\+420\s*[0-9]{3}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@antoninovopekarstvi\.cz/gi, 'info@demo.local')
  .replace(/www\.antoninovopekarstvi\.cz/gi, 'demo.local');

// ─── Style overrides ─────────────────────────────────────────────────────────
const styleOverride = `<style>
/* === Venom static fixes: pekárna demo === */

/* 1. Hide the duplicate .navigation-top (JS clones it to #fixed-nav) */
.navigation-top { display: none !important; }

/* 2. #fixed-nav: fixed at viewport bottom, transparent (matches original) */
#fixed-nav {
  position: fixed !important;
  bottom: 0 !important;
  top: auto !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: auto !important;
  z-index: 200 !important;
  background: rgba(33,46,96,0.85) !important;
}
#fixed-nav .nav-logo img { max-height: 80px !important; width: auto; }

/* 3. Hero: full viewport height */
.homepage {
  min-height: 100vh !important;
  overflow: hidden !important;
  position: relative !important;
}

/* 4. Vegas slider container: full height */
.home-slider-container {
  width: 100% !important;
  height: 100vh !important;
  min-height: 600px !important;
  overflow: hidden !important;
  position: relative !important;
}

/* 5. Vegas slides: show first, hide rest */
.vegas-slide {
  position: absolute !important;
  inset: 0 !important;
  opacity: 1 !important;
}
.vegas-slide:not(:first-child) { display: none !important; }
.vegas-slide-inner {
  position: absolute !important;
  inset: 0 !important;
  background-size: cover !important;
  background-position: center center !important;
}
/* Hide JS metadata */
.vegas-wrapper, .vegas-timer { display: none !important; }

/* 6. Slider text overlay (centered in hero) */
.home-slider-text {
  position: absolute !important;
  top: 50% !important;
  left: 0 !important;
  right: 0 !important;
  transform: translateY(-60%) !important;
  z-index: 20 !important;
  text-align: center !important;
}
.slider-text { display: none !important; }
.slider-text.slide-active { display: block !important; }

/* 7. Dark overlay on hero */
.home-overlay {
  position: absolute !important;
  inset: 0 !important;
  z-index: 5 !important;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%) !important;
}

/* 8. Misc hides */
.home-slider-arrows, .home-slider-pagination { display: none !important; }
.mobile-navbar-overlay, .info-mobile-overlay, .homepage-mobile-overlay { display: none !important; }
[class*="cookie"], [id*="cookie"] { display: none !important; }
#sb_instagram, #sbi_images, .sbi-load-btn { display: none !important; }

/* 9. Bottom padding for fixed nav */
body { padding-bottom: 120px; }

/* Fix images */
img { max-width: 100%; height: auto; }
</style>`;
body = styleOverride + '\n' + body;

// ─── Audit ───────────────────────────────────────────────────────────────────
const brandRefs = (body.match(/antoninovopekarstvi\.cz/gi) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|w3\.org|demo\.local))/gi) || []).length;
log(`Audit: brand=${brandRefs} extRefs=${extRefs} body=${body.length}B`);

// ─── DB: Create tenant + page + section ─────────────────────────────────────
const ACCESS_TOKEN = 'antoninova' + Math.random().toString(36).slice(2, 10);
log(`=== Seed ${TENANT_SLUG} ===`);

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo pekárenství', 'Pekárna Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'antoninovopekarstvi.cz', cms: 'WordPress Marco theme Vegas slider' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

const JS = [`/clones/${SLUG}/js/kill-external.js`];
const pg2 = await pool.query(`
  INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
  VALUES ($1, 'home', 'Domů', true, 'Demo Pekárenství — Ukázka šablony', 'Ukázka prémiové šablony pro pekárnu.')
  RETURNING id
`, [tid]);

await pool.query(`
  INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
  VALUES ($1, $2, 'full-page-clone', $3, 0, true)
`, [tid, pg2.rows[0].id, JSON.stringify({ html: body, cssUrls: allCss, jsUrls: JS })]);
log(`home → page ${pg2.rows[0].id} ✅`);

await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Published ✅`);
await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
