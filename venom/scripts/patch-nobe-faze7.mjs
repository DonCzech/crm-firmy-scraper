/**
 * FÁZE 7 — nobe-demo
 * - Nahradit reálná jména instruktorů demo jmény
 * - Opravit Krakovka/MILAN wp-content URL → lokální
 * - Logo audit
 */
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });
function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON s.page_id=p.id JOIN tenants t ON p.tenant_id=t.id WHERE t.slug='nobe-demo' AND s.section_type='full-page-clone' LIMIT 1`);
if (!res.rowCount) { log('ERROR'); process.exit(1); }
const section = res.rows[0];
let html = section.settings.html;
log(`Sekce ${section.id}: ${html.length} bytes`);

// ─── Jména instruktorů → demo jména ─────────────────────────────────────────
const nameMap = {
  'HONZA VITOUS': 'JAN NOVÁK',
  'HONZA-VITOUS': 'JAN-NOVÁK',
  'Honza Vitouše': 'Jana Nováka',
  'MILOSLAV VITOUS': 'MILOSLAV KOVÁŘ',
  'MILOSLAV-VITOUS': 'MILOSLAV-KOVÁŘ',
  'koci-radovan': 'demo-instructor1',
  'Radovan Koci': 'Radek Demo',
  'RADOVAN': 'RADEK',
  'Krakovka Michal': 'Michal Demo',
  'Krakovka-Michal': 'Demo-Michal',
  'MILAN PLAčKO': 'MILAN NOVOTNÝ',
  'MILAN-PLAčKO': 'MILAN-NOVOTNÝ',
  'MILAN PLAC': 'MILAN NOVOTNÝ',
};

for (const [real, demo] of Object.entries(nameMap)) {
  html = html.split(real).join(demo);
}

// Case-insensitive pro zbývající
html = html.replace(/\bVitous\b/g, 'Kovář');
html = html.replace(/\bKrakovka\b/g, 'Demo');
html = html.replace(/Miloslav\s+Vitouš\w*/gi, 'Miloslav Kovář');

log('Jména nahrazena');

// ─── Oprav Krakovka + MILAN wp-content URL → lokální ─────────────────────────
html = html.replace(
  /src="https?:\/\/(?:www\.)?(?:nobe|demo)\.(?:cz|local)\/wp-content\/uploads\/[^"]*\/(Krakovka[^"?]+)(?:\?[^"]*)?"(\s)/g,
  'src="/clones/nobe/img/$1"$2'
);
html = html.replace(
  /src="https?:\/\/(?:www\.)?(?:nobe|demo)\.(?:cz|local)\/wp-content\/uploads\/[^"]*\/(MILAN[^"?]+)(?:\?[^"]*)?"(\s)/g,
  'src="/clones/nobe/img/$1"$2'
);
html = html.replace(
  /src="https?:\/\/(?:www\.)?(?:nobe|demo)\.(?:cz|local)\/wp-content\/uploads\/[^"]*\/(IMG_[^"?]+)(?:\?[^"]*)?"(\s)/g,
  'src="/clones/nobe/img/$1"$2'
);

// Odstraň srcset s demo.local
html = html.replace(/srcset="[^"]*(?:nobe|demo)\.(?:cz|local)[^"]*"/gi, '');

// ─── FB/IG social linky → # ───────────────────────────────────────────────────
html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|twitter)\.com[^"]*"/gi, 'href="#"');

// ─── Google recenze badge → nahradit demo textem ─────────────────────────────
// hodnoceni.svg je Google badge — skryjeme alt text
html = html.replace(/alt="Recenze autoškoly"/gi, 'alt="Demo recenze"');

// ─── Audit ─────────────────────────────────────────────────────────────────────
const realNamesLeft = (html.match(/\b(?:VITOUS|Krakovka|PLAC)/g) || []).length;
const extLeft = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local|www\.demo\.local))/gi) || []).length;
log(`Real names zbývá: ${realNamesLeft} | ExtRefs: ${extLeft}`);

await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify({...section.settings, html}), section.id]);
log(`Uloženo ✅ (${html.length} bytes)`);
await pool.end();
log('FÁZE 7 NOBE DONE ✅');
