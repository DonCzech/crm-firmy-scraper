/**
 * FÁZE 6+7 — gpf-demo: AI images + inline SVG patches pro bankovní logy
 */
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import pg from 'pg';

const IMG_DIR = 'public/clones/gpf/img';
const DB_URL = process.env.DATABASE_URL;
function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 35000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlinkSync(destPath);
        return download(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { file.close(); fs.unlinkSync(destPath); return reject(new Error(`HTTP ${res.statusCode}`)); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', e => { file.close(); try { fs.unlinkSync(destPath); } catch {} reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function gen(fname, prompt, w, h, seed) {
  const dest = path.join(IMG_DIR, fname);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&model=flux&nologo=true`;
  log(`Gen ${fname}...`);
  for (let i = 1; i <= 3; i++) {
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      if (size < 10000) throw new Error(`Too small: ${size}B`);
      log(`  ✅ ${fname} (${size}B)`); return true;
    } catch (e) {
      log(`  ⚠️ ${i}/3: ${e.message}`);
      if (i < 3) await new Promise(r => setTimeout(r, 1500));
    }
  }
  log(`  ❌ FAILED: ${fname}`); return false;
}

// Delete files to be replaced
const toDelete = [
  'ask-1.D30vtPVJ.jpg', 'ask-2.BREcFwVY.jpg',
  'services-cover.CXKL3GrI.jpg', 'hp_faq.CUeLYsPC.jpg',
  'main-cover-mobile.eMUre2r6.png',
];
for (const f of toDelete) {
  const p = path.join(IMG_DIR, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); log(`Deleted ${f}`); }
}

log('=== AI generation ===');
const tasks = [
  ['ask-1.D30vtPVJ.jpg', 'professional female financial advisor smiling at desk, laptop and documents, modern office, business attire, no brand text, photorealistic', 600, 500, 601],
  ['ask-2.BREcFwVY.jpg', 'happy young couple with mortgage advisor in modern office, reviewing home purchase documents, bright interior, no brand text, photorealistic', 800, 600, 602],
  ['services-cover.CXKL3GrI.jpg', 'modern residential houses neighborhood, sunny day, green lawn, new construction homes, aerial perspective, no brand text, photorealistic', 1200, 600, 603],
  ['hp_faq.CUeLYsPC.jpg', 'professional financial consultation meeting, advisor explaining mortgage documents to couple, modern office, no brand text, photorealistic', 700, 500, 604],
  ['main-cover-mobile.eMUre2r6.png', 'modern house with blue sky, family standing in front, sunny day, dream home concept, no brand text, photorealistic', 800, 600, 605],
];

let ok = 0, fail = 0;
for (const [f, p, w, h, s] of tasks) {
  if (await gen(f, p, w, h, s)) ok++; else fail++;
  await new Promise(r => setTimeout(r, 800));
}
log(`AI done: ${ok} OK, ${fail} failed`);

// === DB inline SVG patches for bank logos and main logo ===
log('=== SVG patches ===');
const pool = new pg.Pool({ connectionString: DB_URL });
const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON p.id=s.page_id JOIN tenants t ON t.id=p.tenant_id WHERE t.slug='gpf-demo' AND s.section_type='full-page-clone' LIMIT 1`);
const { id, settings } = res.rows[0];
let html = settings.html;

// Main logo (dark)
const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40" style="vertical-align:middle">
  <rect width="160" height="40" rx="4" fill="#0a2540"/>
  <circle cx="20" cy="20" r="10" fill="#3b82f6"/>
  <text x="38" y="26" fill="white" font-family="Arial,sans-serif" font-size="14" font-weight="bold">Demo Finance</text>
</svg>`;
const svgLogoWhite = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40" style="vertical-align:middle">
  <circle cx="20" cy="20" r="10" fill="white" opacity="0.9"/>
  <text x="38" y="26" fill="white" font-family="Arial,sans-serif" font-size="14" font-weight="bold">Demo Finance</text>
</svg>`;

html = html.replace(/<img[^>]+src="[^"]*logo\.C11Q3nDQ\.svg[^"]*"[^>]*>/gi, svgLogo);
html = html.replace(/<img[^>]+src="[^"]*logo-white\.DgpjpApP\.svg[^"]*"[^>]*>/gi, svgLogoWhite);

// Bank partner logos — generic colored badges
const bankLogos = [
  ['artesa.CRgeicDD.svg', '#1a4a7a', 'ARTESA'],
  ['ceska-sporitelna.BEibhia4.svg', '#006600', 'ČS'],
  ['cofidis.B63GlMHx.svg', '#cc0000', 'COFIDIS'],
  ['csob-hypotecni-banka.CIqM-8oW.svg', '#003366', 'ČSOB HYPO'],
  ['csob-leasing.CP38lqFJ.svg', '#003366', 'ČSOB LEASING'],
  ['inbank.DozZ7_NJ.svg', '#ff6600', 'INBANK'],
  ['mbank.gEVLkVsa.png', '#cc0000', 'MBANK'],
  ['modra-pyramida.BDPncsJ8.svg', '#1a3a7a', 'MODRÁ PYRAMIDA'],
  ['partners-banka.BAAkUc5n.svg', '#2a6a2a', 'PARTNERS'],
  ['raiffeisen-stavebni-sporitelna.C3bmgqxz.png', '#cc0000', 'RAIFFEISEN SS'],
  ['raiffeisenbank.XdtYWa0P.png', '#cc0000', 'RAIFFEISENBANK'],
  ['stavebni-sporitelna-cs.BurKGYem.svg', '#006600', 'SS ČS'],
  ['unicredit.I_OUBdS5.svg', '#cc0000', 'UNICREDIT'],
  ['essox.1uuTpwPc.png', '#ff6600', 'ESSOX'],
];

for (const [fname, color, label] of bankLogos) {
  const svgBank = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="50" viewBox="0 0 140 50"><rect width="140" height="50" rx="4" fill="${color}"/><text x="70" y="31" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="11" font-weight="bold">${label}</text></svg>`;
  const escaped = fname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<img[^>]+src="[^"]*${escaped}[^"]*"[^>]*>`, 'gi');
  const count = (html.match(re) || []).length;
  if (count > 0) { html = html.replace(re, svgBank); log(`  Patched ${fname}: ${count}x`); }
}

settings.html = html;
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify(settings), id]);

const extRefs = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []);
const stripped = html.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
const brand = (stripped.match(/Gepard\s*Finance|gepardfinance|gpf\.cz/gi) || []);
log(`Final audit: brand=${brand.length} extRefs=${extRefs.length}`);
await pool.end();
log('=== Done ===');
