/**
 * FÁZE 6 — veterinafenix-demo: AI image replacement
 * Theme: veterinární klinika (veterinary clinic) — dogs, cats, small animals
 */
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import path from 'node:path';

const IMG_DIR = 'public/clones/veterinafenix/img';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

function download(url, destPath, retries = 3) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 35000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlinkSync(destPath);
        return download(res.headers.location, destPath, retries).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { file.close(); fs.unlinkSync(destPath); return reject(new Error(`HTTP ${res.statusCode}`)); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (e) => { file.close(); try { fs.unlinkSync(destPath); } catch {} reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function gen(fname, prompt, width, height, seed) {
  const destPath = path.join(IMG_DIR, fname);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
  log(`Generating ${fname} (${width}x${height})...`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await download(url, destPath);
      const size = fs.statSync(destPath).size;
      if (size < 10000) throw new Error(`Too small: ${size}B`);
      log(`  ✅ ${fname} (${size}B)`);
      return true;
    } catch (e) {
      log(`  ⚠️ attempt ${attempt}/3: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 1500));
    }
  }
  log(`  ❌ FAILED: ${fname}`);
  return false;
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Delete originals — only real person photos
const toDelete = [
  'IMG-20260209-WA0000.jpg',
  'IMG-20260209-WA0003.jpg',
  'IMG-20260209-WA0003-200x300.jpg',
  '2.jpg', '2-1.jpg', '2-214x300.jpg',
  '5.jpg', '5-1.jpg', '5-214x300.jpg',
  'logo.jpg',
];
for (const f of toDelete) {
  const p = path.join(IMG_DIR, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); log(`Deleted ${f}`); }
}

log('=== Starting AI image generation ===');

const tasks = [
  // Staff photos (female vet with animals)
  ['IMG-20260209-WA0000.jpg', 'friendly female veterinarian in colorful scrubs holding a cat, smiling, white background, professional headshot, photorealistic', 600, 900, 101],
  ['IMG-20260209-WA0003.jpg', 'friendly female veterinarian smiling at camera, colorful animal-print scrubs, holding puppy, studio lighting, photorealistic', 600, 900, 102],
  ['IMG-20260209-WA0003-200x300.jpg', 'female vet technician in scrubs smiling portrait, clinic background, photorealistic', 200, 300, 103],

  // Hero slider photos (animals with decorative letters PSI, KOČKY, SAVCI)
  ['2.jpg', 'beautiful golden retriever and border collie dogs together, white studio background, professional pet photography', 1400, 900, 201],
  ['2-1.jpg', 'group of happy dogs different breeds posing, white background, professional pet photography', 1400, 900, 202],
  ['2-214x300.jpg', 'cute puppy portrait on white background, professional pet photo', 214, 300, 203],
  ['5.jpg', 'cute rabbit and hamster together on white background, professional small animal photography', 1400, 900, 301],
  ['5-1.jpg', 'guinea pig and rabbit in cozy setting, white studio background, professional pet photography', 1400, 900, 302],
  ['5-214x300.jpg', 'cute rabbit portrait white background, professional photo', 214, 300, 303],
];

let ok = 0, fail = 0;
for (const [fname, prompt, w, h, seed] of tasks) {
  const success = await gen(fname, prompt, w, h, seed);
  if (success) ok++; else fail++;
  await delay(800);
}

log(`=== Done: ${ok} OK, ${fail} failed ===`);
