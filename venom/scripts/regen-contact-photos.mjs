/**
 * Cíleně generuje contact_photo1.jpg (broken 15KB) + contact_photo3.jpg (missing)
 * pro peak-cut-demo.
 *
 * Spustit: node scripts/regen-contact-photos.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UPLOADS = path.join(ROOT, 'public/clones/peak-cut/wp-content/uploads/2023/07');

const sharp = (await import('sharp')).default;

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function generateViaPollinations({ prompt, width, height }) {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`;
  log(`  URL: ${url.slice(0, 120)}...`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    return Buffer.from(buf);
  } finally {
    clearTimeout(timeout);
  }
}

async function generateBW({ prompt, width, height, dest, maxKB }) {
  log(`\nGeneruji B&W: ${path.basename(dest)} (${width}x${height})`);
  log(`  Prompt: ${prompt.slice(0, 90)}...`);

  const raw = await generateViaPollinations({ prompt, width, height });
  log(`  Raw: ${Math.round(raw.length / 1024)}KB`);

  let compressed = await sharp(raw)
    .resize(width, height, { fit: 'cover' })
    .grayscale()
    .linear(1.1, 10)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  const kb = Math.round(compressed.length / 1024);
  if (maxKB && kb > maxKB) {
    log(`  WARN: ${kb}KB > ${maxKB}KB — re-komprimuji`);
    compressed = await sharp(raw)
      .resize(width, height, { fit: 'cover' })
      .grayscale()
      .linear(1.1, 10)
      .jpeg({ quality: 65, mozjpeg: true })
      .toBuffer();
  }

  fs.writeFileSync(dest, compressed);
  const finalKB = Math.round(compressed.length / 1024);
  log(`  OK: ${finalKB}KB → ${dest}`);

  if (finalKB < 20) {
    log('  CHYBA: soubor příliš malý (<20KB) — zkus znovu!');
    return false;
  }
  return true;
}

async function main() {
  log('=== Regenerace contact_photo1.jpg + contact_photo3.jpg (B&W) ===');

  const tasks = [
    {
      prompt: 'Close-up of professional barber scissors, straight razor and comb arranged on dark leather surface, barbershop tools still life, dramatic side lighting, high contrast, detailed product photography',
      width: 800, height: 800,
      dest: path.join(UPLOADS, 'contact_photo1.jpg'),
      maxKB: 180,
    },
    {
      prompt: 'Portrait of confident professional male barber in his 30s, dark apron, arms crossed, standing in barbershop interior, serious professional expression, bokeh background, studio quality photography',
      width: 800, height: 800,
      dest: path.join(UPLOADS, 'contact_photo3.jpg'),
      maxKB: 180,
    },
  ];

  let ok = 0;
  for (const task of tasks) {
    try {
      const success = await generateBW(task);
      if (success) ok++;
    } catch (e) {
      log(`  ERROR: ${e.message}`);
    }
    // Rate limit pauza
    await new Promise(r => setTimeout(r, 4000));
  }

  log(`\n=== Hotovo: ${ok}/${tasks.length} OK ===`);
  if (ok === tasks.length) {
    log('\nDalší kroky:');
    log('1. node scripts/mirror-peak-cut-assets.mjs --refetch');
    log('2. node scripts/seed-peak-cut-demo.mjs');
    log('3. node scripts/obfuscate-clone.mjs peak-cut peak-cut-demo');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
