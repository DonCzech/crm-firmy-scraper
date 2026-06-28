/**
 * FÁZE 3b — scioles-demo: fix 27 extRefs (Scio group domains + Google)
 */
import pg from 'pg';

const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });
const TENANT_SLUG = 'scioles-demo';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const ten = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, [TENANT_SLUG]);
const tid = ten.rows[0].id;
log(`Tenant: ${tid}`);

const sec = await pool.query(`SELECT id, settings FROM sections WHERE tenant_id=$1 AND section_type='full-page-clone' LIMIT 1`, [tid]);
let settings = sec.rows[0].settings;
let html = settings.html;

const before = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`extRefs before: ${before}`);

// Fix all Scio group affiliate domains
const scioDomains = [
  'studium\\.scio\\.cz',
  'scioskoly\\.cz',
  'www\\.scioskoly\\.cz',
  'stredni\\.scioskola\\.cz',
  'www\\.scioskola\\.cz',
  'scioskola\\.cz',
  'www\\.scioedu\\.cz',
  'scioedu\\.cz',
  'www\\.sciokuchyne\\.cz',
  'sciokuchyne\\.cz',
  'www\\.scioresearch\\.com',
  'scioresearch\\.com',
  'www\\.scio\\.cz',
  'scio\\.cz',
];

for (const domain of scioDomains) {
  const re = new RegExp(`href="https?://${domain}[^"]*"`, 'gi');
  const count = (html.match(re) || []).length;
  if (count > 0) {
    html = html.replace(re, 'href="#"');
    log(`Fixed ${count} refs to ${domain}`);
  }
}

// Fix Google docs/maps links
html = html.replace(/href="https?:\/\/docs\.google\.com[^"]*"/gi, 'href="#"');
html = html.replace(/href="https?:\/\/(?:www\.)?maps\.google[^"]*"/gi, 'href="#"');
html = html.replace(/href="https?:\/\/(?:www\.)?google\.com\/maps[^"]*"/gi, 'href="#"');

// Fix any remaining external hrefs (catchall for leftover external links)
html = html.replace(/href="https?:\/\/(?!demo\.local)[^"]+"/gi, 'href="#"');

// Fix external src= (iframes, etc.)
html = html.replace(/src="https?:\/\/(?!demo\.local)[^"]+"/gi, 'src=""');

const after = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []).length;
log(`extRefs after: ${after}`);

settings = { ...settings, html };
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify(settings), sec.rows[0].id]);
log(`DB updated ✅`);

await pool.end();
log(`Done! extRefs: ${before} → ${after}`);
