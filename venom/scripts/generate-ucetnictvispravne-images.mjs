/**
 * FÁZE 6 — ucetnictvispravne-demo: náhrada brand fotek AI
 */
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import path from 'node:path';

const IMG_DIR = 'public/clones/ucetnictvispravne/img';
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

const toDelete = [
  'zacnete-s-nami-removebg-preview-300x300.png',
  'vital-fitness.jpg',
  'prazsky-biatlonovy-klub.jpg',
  'tidos.jpg',
  'red-soft.jpg',
  'cled.jpg',
  'cleaning-support.jpg',
  'ctverec.jpg',
  'it4.jpg',
  'image0-scaled.jpeg',
  'image1-scaled.jpeg',
  'image2-scaled.jpeg',
];
for (const f of toDelete) {
  const p = path.join(IMG_DIR, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); log(`Deleted ${f}`); }
}

log('=== AI generation ===');
const tasks = [
  ['zacnete-s-nami-removebg-preview-300x300.png', 'friendly accountant woman smiling with thumbs up, office background, professional business portrait, no text, photorealistic', 300, 300, 401],
  ['vital-fitness.jpg', 'simple fitness gym company logo mark, dumbbells icon, blue and white, minimal flat design, white background, no text', 200, 100, 402],
  ['prazsky-biatlonovy-klub.jpg', 'sports club logo mark, athlete silhouette with target, clean minimal flat design, dark blue, white background, no text', 200, 100, 403],
  ['tidos.jpg', 'technology software company logo mark, circuit board icon, teal and navy, minimal flat design, white background, no text', 200, 100, 404],
  ['red-soft.jpg', 'software development company logo mark, code brackets icon, red and dark, minimal flat design, white background, no text', 200, 100, 405],
  ['cled.jpg', 'LED lighting company logo mark, light bulb icon, yellow and dark, minimal flat design, white background, no text', 200, 100, 406],
  ['cleaning-support.jpg', 'professional cleaning company logo mark, mop and bucket icon, clean blue and white, minimal flat design, white background, no text', 200, 100, 407],
  ['ctverec.jpg', 'abstract geometric square logo mark, modern corporate design, navy blue, white background, no text', 150, 150, 408],
  ['it4.jpg', 'IT services company logo mark, computer and gear icon, dark grey and blue, minimal flat design, white background, no text', 200, 100, 409],
  ['image0-scaled.jpeg', 'professional female accountant at desk with laptop, documents and calculator, modern office, business attire, photorealistic, no brand text', 800, 600, 410],
  ['image1-scaled.jpeg', 'modern accounting office interior, team of professionals working together, meeting room, bright space, photorealistic, no brand signs', 800, 600, 411],
  ['image2-scaled.jpeg', 'professional male accountant reviewing financial documents and charts, desk lamp, focused work, office background, photorealistic, no brand text', 800, 600, 412],
];

let ok = 0, fail = 0;
for (const [f, p, w, h, s] of tasks) {
  if (await gen(f, p, w, h, s)) ok++; else fail++;
  await new Promise(r => setTimeout(r, 800));
}
log(`=== Done: ${ok} OK, ${fail} failed ===`);
