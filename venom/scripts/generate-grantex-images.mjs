/**
 * FÁZE 6 — grantex-demo: náhrada brand fotek AI
 */
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import pg from 'pg';

const IMG_DIR = 'public/clones/grantex/img';
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
  log(`Generating ${fname}...`);
  for (let i = 1; i <= 3; i++) {
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      if (size < 10000) throw new Error(`Too small: ${size}B`);
      log(`  ✅ ${fname} (${size}B)`); return true;
    } catch (e) {
      log(`  ⚠️ attempt ${i}/3: ${e.message}`);
      if (i < 3) await new Promise(r => setTimeout(r, 1500));
    }
  }
  log(`  ❌ FAILED: ${fname}`); return false;
}

// Delete brand images before generating
const toDelete = [
  'gx-logo-green-190x46.webp', 'GX-1-homepage.webp',
  'heineken.png', 'bosal-1.png',
  'loga-reference-9-1.png', 'loga-reference-15.png', 'loga-reference-2.png',
  'logo-jipka.svg', 'logo_sukl.svg',
  'EET2-rnpbi8e7m7qmnznwmf46hnu5lq1hsq5itkw2q0soys.webp',
];
for (const f of toDelete) {
  const p = path.join(IMG_DIR, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); log(`Deleted ${f}`); }
}

log('=== AI generation ===');
const tasks = [
  ['GX-1-homepage.webp', 'modern professional financial advisory office, team of consultants around conference table, city view through windows, no brand text, photorealistic', 1200, 600, 501],
  ['loga-reference-9-1.png', 'grid of 9 generic company logo placeholders, minimal flat design, various colors blue green grey, white background, no real brand names', 600, 400, 502],
  ['loga-reference-15.png', 'grid of 15 generic company logo placeholders, minimal flat icons, corporate colors, white background, no real brand names', 600, 400, 503],
  ['loga-reference-2.png', 'two generic enterprise company logos side by side, minimal flat design, dark and light variant, white background, no text', 400, 200, 504],
  ['EET2-rnpbi8e7m7qmnznwmf46hnu5lq1hsq5itkw2q0soys.webp', 'modern electronic cash register receipt system illustration, digital finance interface, clean flat design, green and white, no brand text', 600, 400, 505],
];

let ok = 0, fail = 0;
for (const [f, p, w, h, s] of tasks) {
  if (await gen(f, p, w, h, s)) ok++; else fail++;
  await new Promise(r => setTimeout(r, 800));
}
log(`=== AI done: ${ok} OK, ${fail} failed ===`);

// === SVG inline patches for small logos ===
log('=== SVG inline patches ===');
const pool = new pg.Pool({ connectionString: DB_URL });
const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON p.id=s.page_id JOIN tenants t ON t.id=p.tenant_id WHERE t.slug='grantex-demo' AND s.section_type='full-page-clone' LIMIT 1`);
const { id, settings } = res.rows[0];
let html = settings.html;

// Main logo (GX logo green)
const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="46" viewBox="0 0 190 46" style="vertical-align:middle">
  <rect width="190" height="46" rx="4" fill="#1a3a2a"/>
  <text x="20" y="30" fill="#4ade80" font-family="Arial,sans-serif" font-size="22" font-weight="bold">DEMO</text>
  <text x="100" y="30" fill="#ffffff" font-family="Arial,sans-serif" font-size="14">Poradce</text>
</svg>`;
html = html.replace(/<img[^>]+src="[^"]*gx-logo-green[^"]*"[^>]*>/gi, svgLogo);

// Client logos - generic colored squares
const clientLogos = {
  'heineken.png': `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><rect width="120" height="60" rx="4" fill="#1a7a2a"/><text x="60" y="35" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="11" font-weight="bold">KLIENT A</text></svg>`,
  'bosal-1.png': `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><rect width="120" height="60" rx="4" fill="#1a3a6a"/><text x="60" y="35" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="11" font-weight="bold">KLIENT B</text></svg>`,
  'logo-jipka.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="50" viewBox="0 0 140 50"><rect width="140" height="50" rx="4" fill="#6a1a3a"/><text x="70" y="30" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="11" font-weight="bold">KLIENT C</text></svg>`,
  'logo_sukl.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="50" viewBox="0 0 140 50"><rect width="140" height="50" rx="4" fill="#3a3a6a"/><text x="70" y="30" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="11" font-weight="bold">KLIENT D</text></svg>`,
};

for (const [fname, svgHtml] of Object.entries(clientLogos)) {
  const escaped = fname.replace('.', '\\.');
  const re = new RegExp(`<img[^>]+src="[^"]*${escaped}[^"]*"[^>]*>`, 'gi');
  const count = (html.match(re) || []).length;
  html = html.replace(re, svgHtml);
  log(`  Patched ${fname}: ${count} refs`);
}

settings.html = html;
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify(settings), id]);

const extRefs = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []);
const stripped = html.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
const brand = (stripped.match(/\bGrantex\b|\bgrantex\.cz\b/gi) || []);
log(`Final audit: brand=${brand.length} extRefs=${extRefs.length}`);
await pool.end();
log('=== All patches done ===');
