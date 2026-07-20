/**
 * FÁZE 7 — Demo obsah freja-demo
 * - SVG logo místo Freja_d.png / Freja_w_x320.png
 * - Nahradit "Freja" → "Demo Květinářství"
 * - Odstranit Google Maps, Google Review buttony
 * - Opravit ceny (±15%)
 */
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`
  SELECT s.id, s.settings FROM sections s
  JOIN pages p ON s.page_id=p.id
  JOIN tenants t ON p.tenant_id=t.id
  WHERE t.slug='freja-demo' AND s.section_type='full-page-clone' LIMIT 1
`);
if (!res.rowCount) { log('ERROR: sekce nenalezena'); process.exit(1); }
const section = res.rows[0];
let html = section.settings.html;
log(`Načtena sekce ${section.id}: ${html.length} bytes`);

// ─── SVG logo (světlé + tmavé varianty) ─────────────────────────────────────
const svgLogoDark = `<svg width="170" height="50" viewBox="0 0 170 50" xmlns="http://www.w3.org/2000/svg" aria-label="Demo Květinářství">
  <text x="8" y="32" font-family="Georgia,serif" font-size="24" font-style="italic" fill="#2a1a0a" letter-spacing="1">Demo</text>
  <text x="8" y="46" font-family="Arial,sans-serif" font-size="10" fill="#888" letter-spacing="4">KVĚTINÁŘSTVÍ</text>
  <text x="135" y="12" font-family="Arial,sans-serif" font-size="7" fill="rgba(0,0,0,0.3)">ŠABLONA</text>
</svg>`;

const svgLogoWhite = `<svg width="170" height="50" viewBox="0 0 170 50" xmlns="http://www.w3.org/2000/svg" aria-label="Demo Květinářství">
  <text x="8" y="32" font-family="Georgia,serif" font-size="24" font-style="italic" fill="#ffffff" letter-spacing="1">Demo</text>
  <text x="8" y="46" font-family="Arial,sans-serif" font-size="10" fill="rgba(255,255,255,0.7)" letter-spacing="4">KVĚTINÁŘSTVÍ</text>
  <text x="135" y="12" font-family="Arial,sans-serif" font-size="7" fill="rgba(255,255,255,0.3)">ŠABLONA</text>
</svg>`;

// Nahraď img loga SVG
let logoReplaced = 0;
html = html.replace(/<img[^>]+src="\/clones\/freja\/img\/Freja_d\.png"[^>]*>/gi, () => { logoReplaced++; return svgLogoDark; });
html = html.replace(/<img[^>]+src="\/clones\/freja\/img\/Freja_w_x320\.png"[^>]*>/gi, () => { logoReplaced++; return svgLogoWhite; });
// Shopify logo v patičce (a[href] s freja.cz nebo shopify)
html = html.replace(/<img[^>]+shopify[^>]*>/gi, '');
log(`Logo nahrazeno: ${logoReplaced}x`);

// ─── Brand scrub ─────────────────────────────────────────────────────────────
html = html
  .replace(/\bFreja\b(?!\s+(?:Šablona|Demo))/g, 'Demo Květinářství')
  .replace(/freja\.cz/gi, 'demo.local')
  .replace(/Demo Květinářství Demo Květinářství/g, 'Demo Květinářství');

const frejaLeft = (html.match(/\bFreja\b/g) || []).length;
log(`Zbývající "Freja": ${frejaLeft}`);

// ─── Google Maps — nahradit statickou mapou placeholder ──────────────────────
// Odstraň Gmaps API script tagy (už vyčištěno), skryj map element CSS
html = html.replace(/<div[^>]*class="[^"]*google-map[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
// Skryj map sekci přes inline CSS pokud zůstala
html = html.replace(/(<div[^>]*id="map[^"]*"[^>]*>)/gi, '$1<div style="display:none">');

// ─── Google Review buttony → odstranit ───────────────────────────────────────
html = html.replace(/<a[^>]+(?:google\.com\/maps|napsat-recenz[^"]*)[^>]*>[\s\S]*?<\/a>/gi, '');
html = html.replace(/<button[^>]*>[^<]*(?:recenz[^<]*Google|Google[^<]*recenz)[^<]*<\/button>/gi, '');

// ─── Shopify footer branding ──────────────────────────────────────────────────
html = html.replace(/<a[^>]+shopify\.com[^>]*>[\s\S]*?<\/a>/gi, '');
html = html.replace(/Provozováno\s+na\s+Shopify/gi, '');
html = html.replace(/\bShopify\b/g, '');

// ─── Ceny — přehodit ±15% od originálních ────────────────────────────────────
// Shopify ceny jsou ve formátu "X&nbsp;XXX Kč" nebo "X XXX Kč"
let priceCount = 0;
html = html.replace(/(\d[\s ]?\d{3})\s*(?:Kč|CZK)/g, (match, num) => {
  const price = parseInt(num.replace(/\s| /g, ''));
  const adjusted = Math.round(price * (0.85 + Math.random() * 0.3) / 100) * 100;
  priceCount++;
  return `${adjusted.toLocaleString('cs-CZ')} Kč`;
});
// Malé ceny
html = html.replace(/(\d{3})\s*Kč/g, (match, num) => {
  const price = parseInt(num);
  if (price < 100) return match;
  const adjusted = Math.round(price * (0.85 + Math.random() * 0.3) / 100) * 100;
  priceCount++;
  return `${adjusted} Kč`;
});
log(`Ceny upraveny: ${priceCount}x`);

// ─── Alt texty obrázků — nahradit reálná jména ───────────────────────────────
html = html.replace(/alt="[^"]*[Ff]reja[^"]*"/g, 'alt="Demo Květinářství kytice"');

// ─── Ověření ─────────────────────────────────────────────────────────────────
const googleLeft = (html.match(/google\.(com|maps)/gi) || []).length;
log(`Google refs zbývá: ${googleLeft}`);
const extRefs = (html.match(/https?:\/\/(?!(?:schema\.org|w3\.org|www\.w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`Ext refs: ${extRefs}`);

// ─── Uložit do DB ─────────────────────────────────────────────────────────────
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify({ ...section.settings, html }), section.id]);
log(`Sekce ${section.id} uložena ✅ (${html.length} bytes)`);
await pool.end();
log('FÁZE 7 FREJA DONE ✅');
