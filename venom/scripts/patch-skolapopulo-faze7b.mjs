/**
 * FÁZE 7b — skolapopulo-demo: fix alt texts, media logos in DB
 */
import pg from 'pg';
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN tenants t ON s.tenant_id=t.id WHERE t.slug='skolapopulo-demo' LIMIT 1`);
const section = res.rows[0];
let html = section.settings.html;

// Fix alt texts containing Populo/Skola
html = html.replace(/alt="[^"]*[Ss]kola[^"]*[Pp]opulo[^"]*"/gi, 'alt="Demo studenti"');
html = html.replace(/alt="[Ss]kola-?[Pp]opulo[^"]*"/gi, 'alt="Demo studenti"');
html = html.replace(/alt="Š?kola\s+[Pp]opulo[^"]*"/gi, 'alt="Demo doučování"');
// Specific leftover alts
html = html.replace(/alt="SP_3_2023[^"]*"/gi, 'alt="Studenti na kurzu"');
html = html.replace(/alt="DSC_0[^"]*"/gi, 'alt="Výuka doučování"');
html = html.replace(/alt="commendation-nova[^"]*"/gi, 'alt="Mediální ocenění"');
html = html.replace(/alt="czechcrunch[^"]*"/gi, 'alt="Mediální ocenění"');
html = html.replace(/alt="populo-intro[^"]*"/gi, 'alt="Demo doučování"');
html = html.replace(/alt="populo\.[^"]*"/gi, 'alt="Demo logo"');
// Any remaining alt with Populo
html = html.replace(/alt="([^"]*)[Pp]opulo([^"]*)"/g, (_, a, b) =>
  `alt="${(a + 'Demo' + b).trim()}"`
);

const brand = (html.match(/[Pp]opulo/g) || []).length;
const ext = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local|www\.demo\.local))/gi) || []).length;
log(`After fix: brand=${brand} | extRefs=${ext}`);

await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify({...section.settings, html}), section.id]);
log('Uloženo ✅');
await pool.end();
log('FÁZE 7b DONE ✅');
