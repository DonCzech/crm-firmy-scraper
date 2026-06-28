/**
 * FÁZE 6 — skolkapropejska-demo: náhrada brand fotek AI
 */
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import path from 'node:path';

const IMG_DIR = 'public/clones/skolkapropejska/img';
function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 35000 }, (res) => {
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
      log(`  ✅ ${fname} (${size}B)`);
      return true;
    } catch (e) {
      log(`  ⚠️ attempt ${i}/3: ${e.message}`);
      if (i < 3) await new Promise(r => setTimeout(r, 1500));
    }
  }
  log(`  ❌ FAILED: ${fname}`); return false;
}

// Delete brand images before generating
const toDelete = ['logo.png', 'hlavicka-novinka-cannadog-360x270.jpg', 'hlavicka-novinka-darkovy-poukaz-360x270.jpg', 'hlavicka-novinka-pravidla-360x270.jpg', 'insta-chip.png'];
for (const f of toDelete) {
  const p = path.join(IMG_DIR, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); log(`Deleted ${f}`); }
}

log('=== AI generation ===');
const tasks = [
  ['logo.png', 'modern dog hotel and daycare logo, simple paw print icon with house shape, dark green color on white background, clean minimal design, no text', 300, 150, 301],
  ['hlavicka-novinka-cannadog-360x270.jpg', 'premium natural dog treats on wooden table, herbs and CBD hemp leaves, healthy pet food photography, no brand text visible', 360, 270, 302],
  ['hlavicka-novinka-darkovy-poukaz-360x270.jpg', 'elegant gift card voucher for pet hotel, golden envelope with ribbon, dark green accent, no text visible, flat lay photography', 360, 270, 303],
  ['hlavicka-novinka-pravidla-360x270.jpg', 'cozy modern dog hotel reception area, happy dogs and staff, welcoming interior, no brand signs visible, photorealistic', 360, 270, 304],
  ['insta-chip.png', 'simple social media follow badge icon, camera icon with green circle, minimal flat design, white background, no text', 120, 40, 305],
];

let ok = 0, fail = 0;
for (const [f, p, w, h, s] of tasks) {
  if (await gen(f, p, w, h, s)) ok++; else fail++;
  await new Promise(r => setTimeout(r, 800));
}
log(`=== Done: ${ok} OK, ${fail} failed ===`);
