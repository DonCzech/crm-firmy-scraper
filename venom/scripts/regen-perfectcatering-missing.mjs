/**
 * Regenerace chybějících AI obrázků perfectcatering — nižší minKB threshold
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'public/clones/perfectcatering/img');

function log(msg) { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }

async function generateViaPollinations({ prompt, width, height }) {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' }, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } finally { clearTimeout(timeout); }
}

async function gen({ prompt, width, height, dest }) {
  const destPath = path.join(IMG_DIR, dest);
  log(`Generuji: ${dest} [${width}x${height}]`);
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const buf = await generateViaPollinations({ prompt, width, height });
      if (buf.length < 15 * 1024) { log(`  RETRY — ${buf.length}B příliš malý`); await new Promise(r=>setTimeout(r,3000)); continue; }
      fs.writeFileSync(destPath, buf);
      log(`  ✅ ${dest} — ${Math.round(buf.length/1024)}KB`);
      return true;
    } catch(e) {
      log(`  FAIL ${attempts}: ${e.message}`);
      if (attempts < 3) await new Promise(r => setTimeout(r, 5000));
    }
  }
  log(`  ❌ SKIP: ${dest}`); return false;
}

const missing = [
  { dest: 'hp_filip_desk.png', prompt: 'professional male head chef in white chef coat, smiling, dark background, studio portrait, catering professional, photorealistic', width: 744, height: 1000 },
  { dest: 'hp_filip_mob.png', prompt: 'professional male head chef in white chef coat, studio portrait, catering professional, photorealistic', width: 400, height: 600 },
  { dest: 'hp_intro.png', prompt: 'elegant fine dining catering event, beautifully decorated banquet table, luxury food, candles, upscale venue interior, wide angle photography', width: 1200, height: 700 },
  { dest: '403c043b6e00e41932b8f30b6e8dda73.png', prompt: 'professional male business portrait, 40s man, dark suit, confident smile, neutral background, headshot', width: 372, height: 500 },
  { dest: 'bb5eeed96112d281b121ef5134edc245.png', prompt: 'professional female business portrait, 35s woman, confident smile, neutral background, headshot', width: 372, height: 500 },
  { dest: '8f0b06561f10b32cac69baf90ecaa2f4.jpg', prompt: 'luxury catering appetizers on dark slate board, fine dining food photography, restaurant quality', width: 800, height: 600 },
  { dest: '8ef01c9122b07ddde97505303bbeb75c.jpg', prompt: 'catering service team at corporate event, staff in white uniforms, elegant banquet setup, professional photography', width: 900, height: 600 },
];

log(`=== Regenerace ${missing.length} chybějících obrázků ===`);
let ok = 0, fail = 0;
for (const img of missing) {
  const success = await gen(img);
  if (success) ok++; else fail++;
  await new Promise(r => setTimeout(r, 2000));
}
log(`=== HOTOVO: ✅ ${ok} / ❌ ${fail} ===`);
