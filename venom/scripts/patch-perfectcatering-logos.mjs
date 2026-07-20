/**
 * FÁZE 7 — Nahrazení partner log a footer loga demo SVG
 * Reálné brandy (Porsche, T-Mobile, Sazka, ...) → generické demo loga
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

const res = await pool.query(`
  SELECT s.id, s.settings FROM sections s
  JOIN pages p ON s.page_id = p.id
  JOIN tenants t ON p.tenant_id = t.id
  WHERE t.slug = 'perfectcatering-demo' AND s.section_type = 'full-page-clone' LIMIT 1
`);
if (!res.rowCount) { log('ERROR'); process.exit(1); }
const section = res.rows[0];
let html = section.settings.html;

// ─── Generické demo SVG logo (používáme pro každého partnera) ─────────────────
function demoLogoSvg(name, w = 120, h = 40) {
  const shortName = name.slice(0, 10).toUpperCase();
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" rx="3" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="${w/2}" y="${h*0.65}" font-family="Arial,sans-serif" font-size="${Math.min(12, h*0.35)}" fill="rgba(255,255,255,0.5)" text-anchor="middle">${shortName}</text>
  </svg>`;
}

// ─── Mapa: alt text → demo jméno ─────────────────────────────────────────────
const partnerMap = {
  'KKCG': 'DEMO GROUP',
  'Moneta': 'DEMO BANK',
  'Sazka': 'DEMO GAMES',
  'Penta': 'DEMO INVEST',
  'J&T Banka': 'JT DEMO',
  'J&amp;T Banka': 'JT DEMO',
  'J&amp;T banka': 'JT DEMO',
  'Avast': 'DEMO TECH',
  'Biocev': 'DEMO BIO',
  'BTL': 'BTL DEMO',
  'Hopi': 'HOPI DEMO',
  'Porsche': 'AUTO DEMO',
  'RollsRoyce': 'LUXURY CAR',
  'Volvo': 'NORDIC CAR',
  'Rockaway': 'ROCK DEMO',
  'Dvořáková Praha': 'DV STUDIO',
  'Kärcher': 'CLEAN DEMO',
  'Gen': 'GEN DEMO',
  'Nápad roku': 'AWARD DEMO',
  'T-Mobile': 'TELCO DEMO',
  'LR Studio': 'LR DEMO',
  'FOX Hunter': 'FOX DEMO',
};

// ─── Nahraď každý SVG partner logo ────────────────────────────────────────────
let replaced = 0;
html = html.replace(/<img[^>]+src="\/clones\/perfectcatering\/img\/[^"]+\.svg"[^>]*alt="([^"]+)"[^>]*>/g, (match, alt) => {
  const decodedAlt = alt.replace(/&amp;/g, '&');
  const demoName = partnerMap[alt] || partnerMap[decodedAlt] || `DEMO CO`;
  replaced++;
  return demoLogoSvg(demoName, 120, 40);
});
log(`Partner loga nahrazena: ${replaced}x`);

// ─── Footer logo ─────────────────────────────────────────────────────────────
const footerLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 64" width="180" height="44">
  <text x="10" y="36" font-family="Georgia,serif" font-size="20" font-weight="bold" fill="#ffffff" letter-spacing="2">DEMO</text>
  <text x="10" y="56" font-family="Georgia,serif" font-size="14" fill="#aaaaaa" letter-spacing="4">CATERING</text>
  <text x="130" y="14" font-family="Arial,sans-serif" font-size="8" fill="rgba(255,255,255,0.3)">ŠABLONA</text>
</svg>`;

html = html.replace(
  /<img[^>]+src="\/clones\/perfectcatering\/image\/logo\/logo_footer\.svg"[^>]*>/gi,
  footerLogo
);
log('Footer logo nahrazeno');

// ─── Ověření: žádné reálné brand alts ────────────────────────────────────────
const realBrands = ['Porsche', 'T-Mobile', 'Sazka', 'Moneta', 'Avast', 'Volvo', 'RollsRoyce'];
const remaining = realBrands.filter(b => html.includes(b));
log(`Zbývající reálné brandy: ${remaining.length === 0 ? 'NONE ✅' : remaining.join(', ')}`);

// ─── DB save ─────────────────────────────────────────────────────────────────
await pool.query(`UPDATE sections SET settings = $1 WHERE id = $2`, [
  JSON.stringify({ ...section.settings, html }), section.id
]);
log(`Sekce ${section.id} uložena ✅`);
await pool.end();
log('FÁZE 7 partner loga DONE ✅');
