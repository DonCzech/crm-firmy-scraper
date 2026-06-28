/**
 * FÁZE 7b — scioles-demo: inline SVG for failed logos + IČO fix
 */
import pg from 'pg';

const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'scioles-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const ten = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, [TENANT_SLUG]);
const tid = ten.rows[0].id;
const sec = await pool.query(`SELECT id, settings FROM sections WHERE tenant_id=$1 AND section_type='full-page-clone' LIMIT 1`, [tid]);
let settings = sec.rows[0].settings;
let html = settings.html;

// Forest/tree SVG logo for les-logo-obrys.png (outline style, matches "Les" theme)
const lesLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="489" height="175" viewBox="0 0 489 175"><g fill="none" stroke="#2d6a2d" stroke-width="3"><polygon points="244,10 200,70 218,70 185,120 202,120 160,165 328,165 286,120 303,120 270,70 288,70" stroke-linejoin="round"/><rect x="225" y="130" width="38" height="35" rx="2"/></g><text x="244" y="155" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#2d6a2d" letter-spacing="4">LES &amp; PŘÍRODA</text></svg>`;

// Replace les-logo-obrys.png img tags with inline SVG
let lesFixed = 0;
html = html.replace(/<img[^>]*src="[^"]*les-logo-obrys\.png"[^>]*\/?>/gi, () => {
  lesFixed++;
  return lesLogoSvg;
});
log(`les-logo-obrys.png → inline SVG: ${lesFixed} replacements`);

// Simple text logo for scio_rgb_male.png
const scioLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" rx="4" fill="#2d5a27"/><text x="60" y="27" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="2">KROUŽKY</text></svg>`;

let scioFixed = 0;
html = html.replace(/<img[^>]*src="[^"]*scio_rgb_male\.png"[^>]*\/?>/gi, () => {
  scioFixed++;
  return scioLogoSvg;
});
log(`scio_rgb_male.png → inline SVG: ${scioFixed} replacements`);

// Fix IČO 10779442 → 12345678
const icoFixed = (html.match(/10779442/g)||[]).length;
html = html.replace(/10779442/g, '12345678');
log(`IČO 10779442 → 12345678: ${icoFixed} occurrences`);

// Also fix URL-encoded logo files that still have literal %C3%AD etc. in img src
// (they were renamed on disk but HTML might still reference old encoded names)
html = html.replace(/src="\/clones\/scioles\/img\/les-logo-st%C3%AD%C5%BCen\.png"/gi,
  'src="/clones/scioles/img/les-logo-stín.png"');
html = html.replace(/src="\/clones\/scioles\/img\/les-logo-st%C3%ADn\.png"/gi,
  'src="/clones/scioles/img/les-logo-stín.png"');
html = html.replace(/src="\/clones\/scioles\/img\/odr%C3%A1%C5%BEky-intro-st%C3%ADn\.png"/gi,
  'src="/clones/scioles/img/odrážky-intro-stín.png"');

// Audit
const brand = (html.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').match(/[Ss]cio[Ll]es|scioles\.cz/gi)||[]).length;
const ext = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi)||[]).length;
log(`Final audit: brand=${brand} extRefs=${ext}`);

settings = { ...settings, html };
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify(settings), sec.rows[0].id]);
log(`DB updated ✅`);
await pool.end();
