/**
 * FÁZE 7 — Demo texty pro perfectcatering-demo
 * - Nahradit reálná jména demo jmény
 * - Inline SVG logo místo originálního PNG
 * - Oprava timeline textů
 */
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'perfectcatering-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`
  SELECT s.id, s.settings
  FROM sections s
  JOIN pages p ON s.page_id = p.id
  JOIN tenants t ON p.tenant_id = t.id
  WHERE t.slug = $1 AND s.section_type = 'full-page-clone'
  LIMIT 1
`, [TENANT_SLUG]);

if (!res.rowCount) { log('ERROR: sekce nenalezena'); process.exit(1); }
const section = res.rows[0];
let html = section.settings.html;
const originalLen = html.length;

// ─── FÁZE 7a: Jména → demo jména ─────────────────────────────────────────────
// Filip Sajler → Martin Novák (CEO/founder)
html = html
  .replace(/Ing\.\s*Filip\s*Sajer/g, 'Ing. Martin Novák')
  .replace(/Ing\.\s*Filip\s*Sajler/g, 'Ing. Martin Novák')
  .replace(/Filip\s*Sajer\b/g, 'Martin Novák')
  .replace(/Filip\s*Sajler\b/g, 'Martin Novák')
  .replace(/Filip\s*Sajlera\b/g, 'Martina Nováka')
  .replace(/Filip\s*Sajlerem\b/g, 'Martinem Novákem');

// Petra Kubešová / Kalošová → Petra Horáková
html = html
  .replace(/Petra\s*Kubešová/g, 'Petra Horáková')
  .replace(/Petra\s*Kalošová/g, 'Petra Horáková')
  .replace(/Petry\s*Kubešové/g, 'Petry Horákové');

// Ondřej Lovětínský → Tomáš Brůžek
html = html
  .replace(/Ondřej\s*Lovětínský/g, 'Tomáš Brůžek')
  .replace(/Ondřeje\s*Lovětínského/g, 'Tomáše Brůžka');

log('Jména nahrazena');

// ─── FÁZE 7b: Timeline texty ──────────────────────────────────────────────────
html = html
  .replace(/Demo Canteen by\s*(?:Filip\s*Sajler|Martin\s*Novák)/g, 'Demo Canteen')
  .replace(/Demo Canteen by\s*Filip/g, 'Demo Canteen');

log('Timeline texty opraveny');

// ─── FÁZE 7c: SVG logo — nahradit originální logo ─────────────────────────────
// Najdi a nahraď logo obrázky v nav/header inline SVG logem
const svgLogo = `<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" aria-label="Demo Catering">
  <rect width="120" height="40" fill="none"/>
  <text x="4" y="22" font-family="Georgia,serif" font-size="14" font-weight="bold" fill="#ffffff" letter-spacing="2">DEMO</text>
  <text x="4" y="35" font-family="Georgia,serif" font-size="10" fill="#aaaaaa" letter-spacing="3">CATERING</text>
  <text x="85" y="10" font-family="Arial,sans-serif" font-size="7" fill="rgba(255,255,255,0.4)">ŠABLONA</text>
</svg>`;

// Nahraď logo SVG soubory v img tagu v header/nav oblasti
// Logo je pravděpodobně .svg soubor v nav
let logoReplaced = 0;
// Najdi img tagy s SVG logo soubory v header oblasti
html = html.replace(/<img[^>]+src="\/clones\/perfectcatering\/img\/[^"]+\.svg"[^>]*alt="[^"]*[Ll]ogo[^"]*"[^>]*>/g, (match) => {
  logoReplaced++;
  return svgLogo;
});
// Také nahraď podle class (logo-img apod)
html = html.replace(/<img[^>]+(?:class|id)="[^"]*logo[^"]*"[^>]*src="\/clones\/perfectcatering[^"]*"[^>]*>/gi, (match) => {
  logoReplaced++;
  return svgLogo;
});
log(`Logo nahrazeno: ${logoReplaced}x`);

// ─── FÁZE 7d: Hero subtitle ────────────────────────────────────────────────────
// "fine-dining servis" nebo podobný popis → demo text
html = html.replace(
  /lokální a pečlivě vybrané suroviny/gi,
  'Ukázka šablony pro cateringovou společnost'
);

// ─── FÁZE 7e: Ověření ─────────────────────────────────────────────────────────
const remainingRealNames = (html.match(/\b(?:Sajer|Sajler|Kubešová|Kalošová|Lovětínský)/g) || []);
log(`Zbývající reálná jména: ${remainingRealNames.length} — ${[...new Set(remainingRealNames)].join(', ') || 'NONE'}`);

// ─── DB UPDATE ────────────────────────────────────────────────────────────────
const newSettings = { ...section.settings, html };
await pool.query(`UPDATE sections SET settings = $1 WHERE id = $2`, [JSON.stringify(newSettings), section.id]);
log(`Sekce ${section.id} aktualizována: ${originalLen} → ${html.length} bytes`);

await pool.end();
log('FÁZE 7 DONE ✅');
