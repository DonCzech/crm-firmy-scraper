/**
 * FÁZE 7c — scioles-demo: replace les-logo-stín.png with neutral SVG
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

// Count references
const before = (html.match(/les-logo-st[^"'\s]*/gi)||[]).length;
log(`les-logo-stín refs before: ${before}`);

// Replace les-logo-stín.png → les-logo-demo.svg
html = html.replace(/les-logo-st(?:%C3%ADn|ín|in)\.png/gi, 'les-logo-demo.svg');

// Also replace any URL-encoded variants
html = html.replace(/les-logo-st%C3%AD%C5%BCen\.png/gi, 'les-logo-demo.svg');

const after = (html.match(/les-logo-st[^"'\s]*/gi)||[]).length;
const demoRefs = (html.match(/les-logo-demo\.svg/gi)||[]).length;
log(`After: les-logo-stín refs=${after}, les-logo-demo.svg refs=${demoRefs}`);

// Final brand/ext audit
const stripped = html.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
const brand = (stripped.match(/[Ss]cio[Ll]es|scioles\.cz/gi)||[]).length;
const ext = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi)||[]).length;
log(`Final audit: brand=${brand} extRefs=${ext}`);

settings = { ...settings, html };
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify(settings), sec.rows[0].id]);
log(`DB updated ✅`);
await pool.end();
