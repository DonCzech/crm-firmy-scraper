/**
 * FÁZE 7 — ovocnysvetozor-demo
 */
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON s.page_id=p.id JOIN tenants t ON p.tenant_id=t.id WHERE t.slug='ovocnysvetozor-demo' AND s.section_type='full-page-clone' LIMIT 1`);
if (!res.rowCount) { log('ERROR'); process.exit(1); }
const section = res.rows[0];
let html = section.settings.html;
log(`Sekce ${section.id}: ${html.length} bytes`);

// ─── SVG logo ─────────────────────────────────────────────────────────────────
const svgLogo = `<svg width="160" height="60" viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg" aria-label="Demo Cukrárna">
  <circle cx="28" cy="30" r="22" fill="#e30613"/>
  <text x="28" y="35" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>
  <text x="58" y="26" font-family="Georgia,serif" font-size="15" font-weight="bold" fill="#2a2a2a">Demo</text>
  <text x="58" y="43" font-family="Arial,sans-serif" font-size="10" fill="#666" letter-spacing="2">CUKRÁRNA</text>
  <text x="115" y="12" font-family="Arial,sans-serif" font-size="7" fill="rgba(0,0,0,0.3)">ŠABLONA</text>
</svg>`;

let logoReplaced = 0;
html = html.replace(/<img[^>]+id="ovocny-svetozor-logo"[^>]*>/gi, () => { logoReplaced++; return svgLogo; });
html = html.replace(/<img[^>]+src="\/clones\/ovocnysvetozor\/img\/(?:logo|ovocny-svetozor)[^"]*"[^>]*>/gi, () => { logoReplaced++; return svgLogo; });
log(`Logo nahrazeno: ${logoReplaced}x`);

// ─── Brand scrub ─────────────────────────────────────────────────────────────
html = html
  .replace(/Ovocný\s+světozor/gi, 'Demo cukrárna')
  .replace(/Ovocného\s+světozoru/gi, 'Demo cukrárny')
  .replace(/Ovocném\s+světozoru/gi, 'Demo cukrárně')
  .replace(/světozor/gi, 'demo')
  .replace(/Světozor/g, 'Demo')
  .replace(/ovocnysvetozor\.cz/gi, 'demo.local');

const brandLeft = (html.match(/[Ss]větozor/g) || []).length;
log(`Brand zbývá: ${brandLeft}`);

// ─── O nás text — nahradit reálnou historii demo textem ───────────────────────
html = html.replace(
  /[^<]*(?:pasáži|Václavského|náměstí|provozovn|cukráren|pekárnou|výrobnou)[^<]*/gi,
  'Naše cukrárna nabízí tradiční české dezerty, čerstvé pečivo a domácí zmrzlinu. Každý den pečeme s láskou a z lokálních surovin.'
);
// Také rok 1996
html = html.replace(/v\s+(?:roce\s*)?(?:199[0-9]|200[0-9])\s*/gi, 'od roku 2010 ');
html = html.replace(/\b199[0-9]\b/g, '2010');
html = html.replace(/více\s+než\s+dvaceti\s+let/gi, 'více než 15 let');
html = html.replace(/14\s+cukráren/gi, '5 cukráren');

// ─── Google Maps — odstraň iframe a tile imgs ──────────────────────────────────
html = html.replace(/<img[^>]*maps\.googleapis\.com[^>]*>/gi, '');
html = html.replace(/<img[^>]*maps\.gstatic\.com[^>]*>/gi, '');
html = html.replace(/<iframe[^>]*(?:maps\.google|google\.com\/maps)[^>]*>[\s\S]*?<\/iframe>/gi, '');
html = html.replace(/href="https?:\/\/maps\.google\.com[^"]*"/gi, 'href="#"');
html = html.replace(/href="https?:\/\/www\.google\.com\/maps[^"]*"/gi, 'href="#"');
html = html.replace(/href="https?:\/\/(?:cs-cz\.)?facebook\.com[^"]*"/gi, 'href="#"');
html = html.replace(/href="https?:\/\/(?:www\.)?instagram\.com[^"]*"/gi, 'href="#"');
html = html.replace(/href="https?:\/\/(?:www\.)?youtube\.com[^"]*"/gi, 'href="#"');

// ─── www.demo.local → interní linky OK ───────────────────────────────────────
// Tyto jsou href="#" nebo podobné, necháme

// ─── Audit ────────────────────────────────────────────────────────────────────
const extLeft = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local|www\.demo\.local))/gi) || []).length;
log(`ExtRefs zbývá: ${extLeft}`);

// ─── Uložit ───────────────────────────────────────────────────────────────────
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify({ ...section.settings, html }), section.id]);
log(`Uloženo ✅ (${html.length} bytes)`);
await pool.end();
log('FÁZE 7 OVOCNYSVETOZOR DONE ✅');
