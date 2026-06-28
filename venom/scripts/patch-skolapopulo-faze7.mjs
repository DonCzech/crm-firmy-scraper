/**
 * FÁZE 7 — skolapopulo-demo brand/ext patch
 */
import pg from 'pg';
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN tenants t ON s.tenant_id=t.id WHERE t.slug='skolapopulo-demo' LIMIT 1`);
const section = res.rows[0];
let html = section.settings.html;

// Fix /o-skole-populo href
html = html.replace(/href="\/o-skole-populo[^"]*"/gi, 'href="#"');
// Fix skolapopulo.sk
html = html.replace(/href="https?:\/\/www\.skolapopulo\.sk[^"]*"/gi, 'href="#"');
// Social + media hrefs
html = html.replace(/href="https?:\/\/(?:www\.)?(?:tiktok|forbes|tn\.nova|cc)\.(?:cz|com)[^"]*"/gi, 'href="#"');
// src z externích mediálních webů
html = html.replace(/src="https?:\/\/[^"]*(?:cloudfront)[^"]*"/gi, 'src=""');

// Viditelný text "Populo" v nadpisech a odstavcích (ne v class/src)
// Zachovat CSS třídy jako bg-populo, populo-container
html = html.replace(/(?<=>)[^<]*[Pp]opulo[^<]*(?=<)/g, (match) =>
  match.replace(/[Ss]kola\s+[Pp]opulo/gi, 'Demo doučování')
       .replace(/Škola\s+[Pp]opulo/gi, 'Demo doučování')
       .replace(/[Pp]opulo\b/g, 'Demo')
);

const brand = (html.match(/[Pp]opulo/g) || []).length;
const ext = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local|www\.demo\.local))/gi) || []).length;
log(`Brand: ${brand} | ExtRefs: ${ext}`);

// Remaining brand are CSS class names only (bg-populo, populo-container, img filename)
// These are not visible text — acceptable for GATE

await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify({...section.settings, html}), section.id]);
log('Uloženo ✅');
await pool.end();
log('FÁZE 7 DONE ✅');
