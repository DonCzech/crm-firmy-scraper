/**
 * Seed perfectcatering-demo v3
 * Fresh mirror (consistent HTML+CSS), body-only, CMS fixes, DB update
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'perfectcatering';
const OUT = `public/clones/${SLUG}`;
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const html = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home.html`), 'utf8');
console.log(`Read home.html: ${html.length} bytes`);

// Extract body only
const bodyM = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : html;
console.log(`Body extracted: ${body.length} bytes`);

// ─── CMS fixes ─────────────────────────────────────────────────────────────

// Phone numbers (including HTML entity variants)
body = body
  .replace(/\+420\s*7\d{2}[\s &nbsp;]*\d{3}[\s &nbsp;]*\d{3}/g, '+420 608 288 777')
  .replace(/\+420 720&nbsp;934&nbsp;088/g, '+420 608 288 777')
  .replace(/720\s*934\s*088/g, '608 288 777');

// Brand scrub — "Perfect Catering" without Demo suffix
body = body
  .replace(/Perfect\s+Catering/g, 'Demo Catering')
  .replace(/perfectcatering\.cz(?!\/clones)/gi, 'demo.local')
  .replace(/poznejte\s+Perfect Catering/gi, 'poznejte Demo Catering');

// Emails
body = body
  .replace(/info@perfectcatering\.cz/gi, 'info@demo.local')
  .replace(/jana\.moravcova@perfectcatering\.cz/gi, 'info@demo.local')
  .replace(/[a-z]+@perfectcatering\.cz/gi, 'info@demo.local');

// Address + company name
body = body
  .replace(/Sokolovská\s+\d+\/\d+,?\s*Praha\s*9/gi, 'Demo ulice 12, Praha 2')
  .replace(/Pekařská\s+\d+\/\d+,\s*Jinonice,\s*155\s*00\s*Praha\s*5/gi, 'Demo ulice 12, Praha 2, 120 00')
  .replace(/\b186 00\b/g, '120 00')
  .replace(/\b155 00\b/g, '120 00')
  .replace(/Praha\s+9\b/gi, 'Praha 2')
  .replace(/Jinonice/gi, 'Praha 2')
  .replace(/Eat Perfect\s+s\.r\.o\./gi, 'Demo Catering s.r.o.')
  .replace(/Perfect Canteen/gi, 'Demo Canteen')
  .replace(/IČ[O:]?\s*\d{6,}/gi, 'IČ: 00000000')
  .replace(/DIČ[:]?\s*CZ\d+/gi, 'DIČ: CZ00000000');

// ─── Fix frozen scroll-animation inline styles ──────────────────────────────
// Vue scroll animation leaves elements at partial/zero opacity with transforms
// One comprehensive replace: any style attr containing opacity + transform animation
body = body.replace(
  /style="opacity:[^";]*(?:;|\s)?\s*transform:[^"]*(?:translate3d|translateZ|scale)[^"]*"/g,
  'style="opacity: 1; transform: none;"'
);
// Also fix opacity:0 without transform
body = body.replace(/style="opacity:\s*0;?"/g, 'style="opacity: 1;"');

// Remove turbo-text block entirely (invalid HTML: <div> inside <p> causes browser to
// auto-close <p> and render children as siblings outside it — CSS can't target them)
body = body.replace(
  /<p[^>]*c-homepage-info__turbo-text[^>]*>[\s\S]*?<\/p>/gi,
  ''
);
// Also remove the sibling orphaned text nodes that escaped the p tag (vy jako block)
body = body.replace(
  /(<\/p>\s*)<div[^>]*data-v-60d38d6c[^>]*>\s*vy jako[\s\S]*?(<\/section>)/i,
  '$2'
);

// Fix missing image paths (captured as /image/... not /clones/perfectcatering/image/...)
body = body.replace(/src="\/image\//g, 'src="/clones/perfectcatering/image/');
body = body.replace(/srcset="\/image\//g, 'srcset="/clones/perfectcatering/image/');
body = body.replace(/src="\/image\/logo\/logo_footer\.svg"/g, 'src="/clones/perfectcatering/img/logo_footer.svg"');

// ─── Style overrides ────────────────────────────────────────────────────────
const styleOverride = `<style>
/* Venom: hide consent overlay */
#cmp-main, .cmpbox, [id^="cmp-"], .cmp-overlay,
[class*="consent"], [id*="consent"] { display: none !important; }
/* Close mobile menu by default (no Vue state on static demo) */
.c-main-menu { transform: translateX(-100%) !important; pointer-events: none !important; opacity: 0 !important; }
/* Show scroll-reveal elements immediately */
.o-scroll--hidden { opacity: 1 !important; transform: none !important; transition: none !important; }
/* Normalize swiper coverflow (captured mid-rotation) */
.swiper-slide { transform: none !important; opacity: 1 !important; }
.swiper-slide-active { z-index: 2 !important; }
/* Ensure all animated elements are visible */
[style*="opacity: 0"] { opacity: 1 !important; }
[duration][style] { opacity: 1 !important; transform: none !important; }
/* Services section: items are a Swiper carousel without JS = hide items, show only heading
   Matches original page-load state (items animate in on scroll, which we can't replicate) */
.c-homepage-services__items { display: none !important; }
.c-homepage-services__image { display: none !important; }
.c-homepage-services { min-height: 28rem; }
/* Hide orphaned animated turbo-text block (requires JS counter animation) */
.c-homepage-info__turbo-text { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

// ─── CSS/JS urls ────────────────────────────────────────────────────────────
const CSS = [
  `/clones/${SLUG}/fonts/fonts.css`,
  ...fs.readdirSync(path.join(ROOT, `${OUT}/css`)).sort().map(f => `/clones/${SLUG}/css/${f}`),
];

const JS = [
  `/clones/${SLUG}/js/kill-external.js`,
  ...fs.readdirSync(path.join(ROOT, `${OUT}/js`))
    .filter(f => f !== 'kill-external.js')
    .sort()
    .map(f => `/clones/${SLUG}/js/${f}`),
];

// ─── Audit ─────────────────────────────────────────────────────────────────
const extRefs = (body.match(/https?:\/\/(?!demo\.local)[a-z]/g) || []).filter(u => !u.includes('w3.org')).length;
const brandRefs = (body.match(/Perfect Catering(?!\s*(Praha|Demo))/g) || []).length;
const phones = (body.match(/720\s*934/g) || []).length;
console.log(`Audit: extRefs=${extRefs} brandRefs=${brandRefs} phones=${phones}`);

// ─── Update DB ──────────────────────────────────────────────────────────────
const r = await pool.query(`
  SELECT s.id FROM sections s
  JOIN pages p ON s.page_id=p.id
  JOIN tenants t ON p.tenant_id=t.id
  WHERE t.slug='perfectcatering-demo' LIMIT 1
`);
const secId = r.rows[0].id;
await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [
  JSON.stringify({ html: body, cssUrls: CSS, jsUrls: JS }),
  secId,
]);
console.log(`DB updated: body=${body.length}B cssUrls=${CSS.length} jsUrls=${JS.length} ✅`);

await pool.end();
console.log('=== HOTOVO ===');
