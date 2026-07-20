/**
 * Seed freja-demo v3
 * - Fix //demo.local/cdn/shop/* image paths → local /clones/freja/img/*
 * - Inject missing Freja logo (stripped by mirror regex bug)
 * - CMS fixes: brand names, addresses, IČO
 * - Hide JS-dependent elements
 * - Update DB body-only + cssUrls + jsUrls
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'freja';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const html = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home.html`), 'utf8');
console.log(`Read home.html: ${html.length} bytes`);

// Extract body only
const bodyM = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : html;
console.log(`Body extracted: ${body.length} bytes`);

// ─── Fix //demo.local/cdn/shop/files/ → /clones/freja/img/ ────────────────
let imgFixed = 0;
body = body.replace(
  /\/\/demo\.local\/cdn\/shop\/(?:files|collections)\/([^"'?&\s,]+)(?:\?[^"'\s,)>]*)?/g,
  (match, fname) => {
    const cleanFname = decodeURIComponent(fname).replace(/%[0-9a-f]{2}/gi, '_');
    const localPath = `/clones/${SLUG}/img/${cleanFname}`;
    const diskPath = path.join(ROOT, 'public', localPath);
    if (fs.existsSync(diskPath)) {
      imgFixed++;
      return localPath;
    }
    console.warn(`  MISSING local img: ${fname}`);
    return match;
  }
);
console.log(`Fixed ${imgFixed} //demo.local image refs`);

// ─── Fix remaining freja.cz domain refs in img src ────────────────────────
body = body.replace(/\/\/freja\.cz\/cdn\/shop\/(files|collections)\/([^"'?&\s,]+)(?:\?[^"'\s,)>]*)?/g,
  (match, dir, fname) => {
    const localPath = `/clones/${SLUG}/img/${fname}`;
    const diskPath = path.join(ROOT, 'public', localPath);
    if (fs.existsSync(diskPath)) return localPath;
    return match;
  }
);

// ─── Clean up orphaned header-drawer fragments ──────────────────────────────
// Mirror regex removes opening <header-drawer> but leaves orphaned content
// until </header-drawer>. Remove everything between <header class="header...">
// and <div class="header__heading"> (the orphaned drawer remnants).
body = body.replace(
  /(<header\s[^>]*class="header[^"]*"[^>]*>)[\s\S]*?(<div\s+class="header__heading">)/,
  '$1\n$2'
);
// Also remove orphaned </header-drawer> closing tag
body = body.replace(/<\/header-drawer>/g, '');
console.log('Orphaned drawer fragments removed ✅');

// ─── Fix Freja logo src (mirror brand-replace damages filename) ─────────────
if (body.includes('header__heading')) {
  // Replace any "Demo Freja_d.png" or "Freja_d.png" → local path
  body = body.replace(/src="[^"]*(?:Demo\s+)?Freja_d\.png[^"]*"/g, 'src="/clones/freja/img/Freja_d.png"');
  body = body.replace(/srcset="[^"]*(?:Demo\s+)?Freja_d\.png[^"]*"/g, '');
  console.log('Logo src fixed ✅');
} else {
  console.log('Logo missing — injecting header__heading...');
  const logoHtml = `<div class="header__heading">
  <a href="#" class="header__heading-link link link--text focus-inset">
    <div class="header__heading-logo-wrapper">
      <img src="/clones/freja/img/Freja_d.png" alt="Demo Květinářství" class="header__heading-logo motion-reduce" width="170" height="75" loading="eager">
    </div>
  </a>
</div>`;
  body = body.replace('<nav class="header__inline-menu">', logoHtml + '\n<nav class="header__inline-menu">');
  console.log('Logo injected ✅');
}

// ─── CMS fixes ─────────────────────────────────────────────────────────────

// Brand: bare Freja → Demo Freja (skip if already prefixed by "Demo ")
body = body.replace(/(?<!Demo\s)\bFreja\b/g, 'Demo Freja');

// Addresses
body = body
  .replace(/Podbělohorská\s+\d+[^<,]{0,40}/gi, 'Demo ulice 12, Praha 2')
  .replace(/Burešova\s+\d+[^<,]{0,30}/gi, 'Demo ulice 12, Praha 8')
  .replace(/Biskupcova\s+\d+[^<,]{0,30}/gi, 'Demo ulice 34, Praha 3')
  .replace(/\b182\s*00\b/g, '120 00')
  .replace(/\b130\s*00\b/g, '120 00')
  .replace(/Praha\s+5\b/gi, 'Praha 2');

// IČO
body = body.replace(/IČO[:\s]*\d{6,}/gi, 'IČO: 00000000');

// Social handles
body = body.replace(/@kvetiny_my_angel/g, '@demo.kvetiny');

// ─── Style overrides ────────────────────────────────────────────────────────
const styleOverride = `<style>
/* Venom: hide Shopify dynamic elements */
cart-drawer, cart-notification, .shopify-section--cart,
[id*="shopify-challenge"], [class*="shopify-challenge"],
.cookie-bar, .cookie-banner, #cookie-consent,
.shopify-pc__banner { display: none !important; }
/* Hide slider prev/next buttons (require JS to work) */
.slider-buttons { display: none !important; }
/* Hide quantity selectors and add-to-cart (static page, no cart) */
.quantity, .product-form__buttons, variant-selects, variant-radios { display: none !important; }
/* Constrain icon SVGs without explicit dimensions */
.svg-wrapper svg { overflow: visible; }
/* Ensure slideshow image is visible */
.slideshow__media img, .banner__media img { opacity: 1 !important; }
/* Product grid: force grid layout without JS slider */
.grid.product-grid { display: grid !important; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
@media (max-width: 989px) { .grid.product-grid { grid-template-columns: repeat(2, 1fr); } }
/* Card images: ensure ratio container renders */
.card__inner.ratio { position: relative; }
.card__inner.ratio .card__media { position: absolute; inset: 0; overflow: hidden; }
.card__inner.ratio .card__media img { width: 100%; height: 100%; object-fit: cover; }
/* Header logo */
.header__heading { display: flex; align-items: center; }
.header__heading-logo { max-height: 60px; width: auto; }
</style>`;
body = styleOverride + '\n' + body;

// ─── Remove inline CSS link tags (cssUrls array handles CSS in head) ─────────
const linksBefore = (body.match(/<link[^>]+(?:stylesheet|\.css)[^>]*>/gi) || []).length;
body = body.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '');
body = body.replace(/<link[^>]*href=["'][^"']*\.css[^"']*["'][^>]*>/gi, '');
console.log(`Removed ${linksBefore} inline CSS link tags`);

// ─── Audit ─────────────────────────────────────────────────────────────────
const demoLocalRem = (body.match(/\/\/demo\.local/g) || []).length;
const extRefs = (body.match(/https?:\/\/(?!(?:schema\.org|w3\.org))/g) || []).length;
const brandRefs = (body.match(/\bFreja(?!\s*(Demo|Kv[ěe]tin|k[ěe]tin))/g) || []).length;
console.log(`Audit: demo.local=${demoLocalRem} extRefs=${extRefs} brandRefs=${brandRefs}`);

// ─── CSS/JS ─────────────────────────────────────────────────────────────────
const allCss = fs.readdirSync(path.join(ROOT, `${OUT}/css`)).sort().map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

// ─── Update DB ──────────────────────────────────────────────────────────────
const r = await pool.query(`
  SELECT s.id FROM sections s
  JOIN pages p ON s.page_id=p.id
  JOIN tenants t ON p.tenant_id=t.id
  WHERE t.slug='freja-demo' LIMIT 1
`);
const secId = r.rows[0].id;
await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [
  JSON.stringify({ html: body, cssUrls: allCss, jsUrls: JS }),
  secId,
]);
console.log(`DB updated: body=${body.length}B cssUrls=${allCss.length} jsUrls=${JS.length} secId=${secId} ✅`);

await pool.end();
console.log('=== HOTOVO ===');
