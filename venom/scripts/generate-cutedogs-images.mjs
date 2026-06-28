/**
 * FÁZE 6 — cutedogs-demo: náhrada brand fotek AI
 */
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import path from 'node:path';

const IMG_DIR = 'public/clones/cutedogs/img';
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

const toDelete = ['Cutedogs.jpg','instagram_01.jpg','instagram_04.jpg','instagram_05.jpg','instagram_07.jpg','instagram_09.jpg'];
for (const f of toDelete) {
  const p = path.join(IMG_DIR, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); log(`Deleted ${f}`); }
}

log('=== AI generation ===');
const tasks = [
  ['Cutedogs.jpg', 'modern premium pet grooming salon storefront exterior, elegant dark signage, no text visible, city street, photorealistic', 800, 800, 101],
  ['instagram_01.jpg', 'premium dog food bags on shelf in pet store, no brand text visible, clean white background, product photography', 600, 600, 201],
  ['instagram_04.jpg', 'elegant dark business cards for pet salon on white table, golden paw print design, no text visible, flat lay', 600, 600, 202],
  ['instagram_05.jpg', 'clean modern pet salon interior, white walls, grooming table, soft lighting, no brand signs, photorealistic', 600, 600, 203],
  ['instagram_07.jpg', 'premium pet beauty salon interior, reception desk, shelves with pet products, elegant dark and gold decor, photorealistic', 800, 800, 204],
  ['instagram_09.jpg', 'friendly female pet groomer smiling, dark uniform, holding small dog, salon background, professional portrait, photorealistic', 600, 800, 205],
];

let ok = 0, fail = 0;
for (const [f, p, w, h, s] of tasks) {
  if (await gen(f, p, w, h, s)) ok++; else fail++;
  await new Promise(r => setTimeout(r, 800));
}
log(`=== Done: ${ok} OK, ${fail} failed ===`);
