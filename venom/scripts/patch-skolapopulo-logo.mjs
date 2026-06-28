/**
 * FÁZE 7d — Replace header/footer inline SVG logos with demo text
 */
import pg from 'pg';
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });
function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN tenants t ON s.tenant_id=t.id WHERE t.slug='skolapopulo-demo' LIMIT 1`);
const section = res.rows[0];
let html = section.settings.html;

// Header logo: 136x28 white fill → replace with "Demo Akademie" white text
const headerLogoNew = `<svg width="136" height="28" fill="none" viewBox="0 0 136 28" xmlns="http://www.w3.org/2000/svg"><text x="2" y="22" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">Demo</text><text x="68" y="22" font-family="Arial, sans-serif" font-size="20" font-weight="300" fill="#ffffff">Akademie</text></svg>`;

const headerLogoStart = '<svg width="136" height="28" fill="none" viewBox="0 0 178 36"';
const headerLogoEnd = '</svg>';
const hi = html.indexOf(headerLogoStart);
if (hi >= 0) {
  const he = html.indexOf(headerLogoEnd, hi) + headerLogoEnd.length;
  html = html.slice(0, hi) + headerLogoNew + html.slice(he);
  log('Header logo replaced ✅');
} else {
  log('Header logo NOT found ⚠');
}

// Footer logo: 170x35 → replace
const footerLogoNew = `<svg width="170" height="35" fill="none" viewBox="0 0 170 35" xmlns="http://www.w3.org/2000/svg"><text x="2" y="27" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff">Demo</text><text x="82" y="27" font-family="Arial, sans-serif" font-size="24" font-weight="300" fill="#ffffff">Akademie</text></svg>`;

const footerLogoStart = '<svg width="170" height="35" fill="none" viewBox="';
const fi = html.indexOf(footerLogoStart);
if (fi >= 0) {
  const fe = html.indexOf(headerLogoEnd, fi) + headerLogoEnd.length;
  html = html.slice(0, fi) + footerLogoNew + html.slice(fe);
  log('Footer logo replaced ✅');
} else {
  log('Footer logo NOT found ⚠');
}

const brand = (html.match(/[Pp]opulo/g) || []).length;
const ext = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local|www\.demo\.local))/gi) || []).length;
log(`brand=${brand} | extRefs=${ext}`);

await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify({...section.settings, html}), section.id]);
log('Uloženo ✅');
await pool.end();
log('FÁZE 7d DONE ✅');
