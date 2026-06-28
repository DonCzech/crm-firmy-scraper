/**
 * FÁZE 7c — skolapopulo-demo: replace Forbes/media logos with demo SVG inline
 */
import pg from 'pg';
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN tenants t ON s.tenant_id=t.id WHERE t.slug='skolapopulo-demo' LIMIT 1`);
const section = res.rows[0];
let html = section.settings.html;

// Replace Forbes PNG img wrapper with inline SVG
// Find the relative h-20 w-full wrapper containing the Forbes thumbnail
const demoMediaSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect width="200" height="60" fill="none"/><text x="0" y="44" font-family="Georgia, serif" font-size="36" font-weight="bold" letter-spacing="1" fill="#5a5a5a">MÉDIA</text></svg>`;

// Replace the Forbes thumbnail img tag specifically
html = html.replace(
  /<img[^>]*thumbnail_Navrh_bez_nazvu_7_adb1557dd5[^>]*\/?>/gi,
  demoMediaSvg
);

// Also update the alt text references
html = html.replace(/alt="[^"]*Návrh bez[^"]*"/gi, 'alt="Mediální ocenění"');

// Verify Forbes is gone
const forbesCount = (html.match(/Forbes/gi) || []).length;
log(`Forbes remaining: ${forbesCount}`);

const brand = (html.match(/[Pp]opulo/g) || []).length;
const ext = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local|www\.demo\.local))/gi) || []).length;
log(`brand=${brand} | extRefs=${ext}`);

await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify({...section.settings, html}), section.id]);
log('Uloženo ✅');
await pool.end();
log('FÁZE 7c DONE ✅');
