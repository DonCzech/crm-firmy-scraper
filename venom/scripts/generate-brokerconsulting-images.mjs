/**
 * FÁZE 6+7 — brokerconsulting-demo: AI images + inline SVG patches + path fix
 */
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import pg from 'pg';

const IMG_DIR = 'public/clones/brokerconsulting/img';
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

// Replace real people photos and brand images
const toDelete = [
  'Dana Morávková.jpg', 'Antonio Šoposki.png', 'Marek Singer.png', 'pirk.jpeg',
  'Konzultanti.webp', 'HP - Finance, Reality.webp', '¨Franšíza.webp', 'DIP.jpg',
];
for (const f of toDelete) {
  const p = path.join(IMG_DIR, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); log(`Deleted ${f}`); }
}

log('=== AI generation ===');
const tasks = [
  ['Dana Morávková.jpg', 'professional female business ambassador in elegant attire, smiling confidently, neutral background, business portrait, no brand text, photorealistic', 600, 800, 701],
  ['Antonio Šoposki.png', 'professional male financial executive in suit, confident smile, neutral background, business portrait, no brand text, photorealistic', 600, 800, 702],
  ['Marek Singer.png', 'professional senior male executive in business attire, friendly smile, neutral background, portrait, no brand text, photorealistic', 600, 800, 703],
  ['pirk.jpeg', 'professional male consultant in business suit, confident pose, modern office background, portrait, no brand text, photorealistic', 600, 800, 704],
  ['Konzultanti.webp', 'team of professional financial consultants in modern office, diverse group of advisors, business attire, no brand signs, photorealistic', 1200, 600, 705],
  ['HP - Finance, Reality.webp', 'modern banking and real estate consultation concept, hands with documents and tablet, charts and house keys, no brand text, photorealistic', 1200, 600, 706],
  ['¨Franšíza.webp', 'modern business franchise concept illustration, handshake with city skyline background, professional, no brand text, photorealistic', 1200, 600, 707],
  ['DIP.jpg', 'modern investment portfolio analysis on tablet screen, financial charts and graphs, professional office setting, no brand text, photorealistic', 800, 600, 708],
];

let ok = 0, fail = 0;
for (const [f, p, w, h, s] of tasks) {
  if (await gen(f, p, w, h, s)) ok++; else fail++;
  await new Promise(r => setTimeout(r, 800));
}
log(`AI done: ${ok} OK, ${fail} failed`);

// === DB patches ===
log('=== DB patches ===');
const pool = new pg.Pool({ connectionString: DB_URL });
const res = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON p.id=s.page_id JOIN tenants t ON t.id=p.tenant_id WHERE t.slug='brokerconsulting-demo' AND s.section_type='full-page-clone' LIMIT 1`);
const { id, settings } = res.rows[0];
let html = settings.html;

// Fix `/img/logo.svg` and `/img/...` direct references (header logo path)
let imgPathFixed = 0;
html = html.replace(/src="\/img\/([^"]+)"/g, (match, fname) => {
  imgPathFixed++;
  return `src="/clones/brokerconsulting/img/${fname}"`;
});
log(`Path fix /img/ → /clones/.../img/: ${imgPathFixed}`);

// Replace main logo with inline SVG
const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="50" viewBox="0 0 180 50" style="vertical-align:middle">
  <rect width="180" height="50" rx="4" fill="#003366"/>
  <text x="20" y="32" fill="white" font-family="Arial,sans-serif" font-size="18" font-weight="bold">DEMO</text>
  <text x="85" y="32" fill="#d4a96e" font-family="Arial,sans-serif" font-size="14">poradce</text>
</svg>`;
html = html.replace(/<img[^>]+src="[^"]*\blogo\.svg[^"]*"[^>]*>/gi, svgLogo);

// Replace sister-brand logos
const sisterLogos = [
  ['BC_logo_slog_barevnetecky.svg', '#003366', 'DEMO'],
  ['BC-Real.svg', '#660033', 'DEMO REALITY'],
  ['Broker-Development.svg', '#336600', 'DEMO DEV'],
  ['Moneco-investicni-spolecnost.svg', '#003366', 'DEMO INVEST'],
  ['Moneco.svg', '#003366', 'DEMO INVEST'],
  ['procredia-bez-sloganu.svg', '#660066', 'DEMO KREDIT'],
  ['prodomia.svg', '#006666', 'DEMO REALITY'],
  ['ABC.svg', '#666633', 'DEMO ABC'],
  ['Dobry-skutek.svg', '#cc3300', 'DEMO CHARITA'],
  ['feedyou_logo_red.png', '#cc0000', 'DEMO CHAT'],
  ['dve loga vedle sebe.jpg', '#003366', 'DEMO LOGA'],
];

for (const [fname, color, label] of sisterLogos) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50"><rect width="160" height="50" rx="4" fill="${color}"/><text x="80" y="31" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="11" font-weight="bold">${label}</text></svg>`;
  const escaped = fname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Handle both encoded and decoded versions in src
  const re = new RegExp(`<img[^>]+src="[^"]*(${escaped}|${encodeURIComponent(fname).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[^"]*"[^>]*>`, 'gi');
  const count = (html.match(re) || []).length;
  if (count > 0) { html = html.replace(re, svg); log(`  Patched ${fname}: ${count}x`); }
}

settings.html = html;
await pool.query(`UPDATE sections SET settings=$1 WHERE id=$2`, [JSON.stringify(settings), id]);

const extRefs = (html.match(/https?:\/\/(?!(?:schema\.org|www\.w3\.org|w3\.org|gmpg\.org|demo\.local))/gi) || []);
const stripped = html.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
const brand = (stripped.match(/Broker\s*Consulting|bcas\.cz|brokerconsulting/gi) || []);
log(`Final audit: brand=${brand.length} extRefs=${extRefs.length}`);
await pool.end();
log('=== Done ===');
