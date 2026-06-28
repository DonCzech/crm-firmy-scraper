/**
 * FÁZE 7 — antoninova-demo
 * - SVG logo (bílá + modrá varianta)
 * - Brand scrub (Antonínovo, antoninovopekarstvi)
 * - Wolt/Bolt/FB/IG linky → #
 * - Wolt text → demo delivery text
 */
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });
function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON s.page_id=p.id JOIN tenants t ON p.tenant_id=t.id WHERE t.slug='antoninova-demo' AND s.section_type='full-page-clone' LIMIT 1`);
if (!res.rowCount) { log('ERROR'); process.exit(1); }
const section = res.rows[0];
let html = section.settings.html;
log(`Sekce ${section.id}: ${html.length} bytes`);

// ─── SVG loga ────────────────────────────────────────────────────────────────
const svgWhite = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-label="Demo pekařství">
  <circle cx="24" cy="24" r="22" fill="none" stroke="#ffffff" stroke-width="2"/>
  <text x="24" y="30" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>
</svg>`;
const svgBlue = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-label="Demo pekařství">
  <circle cx="24" cy="24" r="22" fill="none" stroke="#212e60" stroke-width="2"/>
  <text x="24" y="30" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="#212e60" text-anchor="middle">D</text>
</svg>`;
const svgFooter = `<svg width="120" height="48" viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="20" fill="none" stroke="#212e60" stroke-width="2"/>
  <text x="24" y="30" font-family="Georgia,serif" font-size="16" font-weight="bold" fill="#212e60" text-anchor="middle">D</text>
  <text x="52" y="20" font-family="Georgia,serif" font-size="11" fill="#212e60">Demo</text>
  <text x="52" y="34" font-family="Arial,sans-serif" font-size="9" fill="#555" letter-spacing="1">pekařství</text>
</svg>`;

html = html.replace(/<img[^>]+AP_Symbol_2_RGB_bila\.png[^>]*>/g, svgWhite);
html = html.replace(/<img[^>]+AP_Symbol_2_RGB_modra\.png[^>]*>/g, svgBlue);
html = html.replace(/<img[^>]+ap-logo-paticka\.png[^>]*>/g, svgFooter);
log('Loga nahrazena ✅');

// ─── Brand scrub ─────────────────────────────────────────────────────────────
html = html
  .replace(/Antonínov[oa]\s+pekařstv[íi]/gi, 'Demo pekařství')
  .replace(/Antonínov[oa]\s+pekáren[^<]{0,20}/gi, 'Demo pekárna')
  .replace(/Antonínov[oa]/gi, 'Demo')
  .replace(/antoninovopekarstvi\.cz/gi, 'demo.local')
  .replace(/pekarstvi\.albi\.cz/gi, 'demo.local');

const brandLeft = (html.match(/[Aa]ntonín(?!ova\s+ulice)/g) || []).length;
log(`Brand zbývá: ${brandLeft}`);

// ─── Wolt / Bolt linky → # ───────────────────────────────────────────────────
html = html.replace(/href="https?:\/\/(?:www\.)?wolt\.com[^"]*"/gi, 'href="#"');
html = html.replace(/href="https?:\/\/food\.bolt\.eu[^"]*"/gi, 'href="#"');
html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram)\.com[^"]*"/gi, 'href="#"');

// ─── Wolt/Bolt URL v textu (ne v href) → odstraň ────────────────────────────
html = html.replace(/wolt\.com|food\.bolt\.eu/gi, 'demo.local');

// ─── Wolt & Bolt logo — zachovat obrázek ale nahradit texty ──────────────────
// Sekce nadpis
html = html.replace(/Demo\s+pekařství\s+na\s+Wolt\s+a\s+Bolt\s+Food/gi, 'Demo pekařství na rozvozových službách');

// ─── Audit ────────────────────────────────────────────────────────────────────
const extLeft = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local|www\.demo\.local))/gi) || []).length;
log(`ExtRefs zbývá: ${extLeft}`);

// ─── Uložit ────────────────────────────────────────────────────────────────────
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify({...section.settings, html}), section.id]);
log(`Uloženo ✅ (${html.length} bytes)`);
await pool.end();
log('FÁZE 7 ANTONINOVA DONE ✅');
