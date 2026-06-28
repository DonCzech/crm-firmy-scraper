/**
 * FÁZE 6 — AI obrázky pro praha-masaze-demo
 * Pollinations.ai (Flux model) — zdarma, bez API klíče
 * Sharp pro kompresi
 *
 * Spustit: node scripts/generate-praha-masaze-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'public/clones/praha-masaze/img');
const CLONE_PATH = '/clones/praha-masaze';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

// Obrázky k vygenerování + nové lokální názvy
const IMAGES = [
  {
    file: 'hero.jpg',
    prompt: 'luxury massage therapy studio interior, soft warm lighting, white linen massage table, candles, zen minimalist aesthetic, premium wellness center, Prague, photorealistic',
    width: 1280, height: 854,
    replaces: '2026--02--250866ee-3e29-4830-80c7-7e68a6571b64-1024x683.png',
  },
  {
    file: 'hero-full.jpg',
    prompt: 'relaxing massage room with candles and essential oils, warm ambient lighting, professional massage table with white towels, wellness spa interior, photorealistic',
    width: 1536, height: 1024,
    replaces: '2026--02--250866ee-3e29-4830-80c7-7e68a6571b64.png',
  },
  {
    file: 'service-klasicka.jpg',
    prompt: 'professional massage therapist working on clients back, classic relaxation massage, spa setting, soft lighting, peaceful atmosphere, photorealistic',
    width: 1024, height: 683,
    replaces: '2026--02--a5466b94-fb28-4a38-9ea7-f0ec5ce92b83-1024x683.jpg',
  },
  {
    file: 'service-sportovni.jpg',
    prompt: 'sports massage therapy on athletes leg, deep tissue massage, professional physiotherapy room, bright clean environment, photorealistic',
    width: 1024, height: 683,
    replaces: '2026--02--57864c29-644a-4248-87b1-8bc848518527-1024x683.jpg',
  },
  {
    file: 'service-thajska.jpg',
    prompt: 'thai massage therapy session, stretching massage technique, traditional thai massage room, warm colors, candles, photorealistic',
    width: 1024, height: 683,
    replaces: '2026--02--8f0d2845-5d3c-487d-bd8f-22e45c5204a4-1024x683.jpg',
  },
  {
    file: 'service-senzorická.jpg',
    prompt: 'sensory massage with hot stones and essential oils, relaxing spa treatment, warm ambient light, professional wellness center, photorealistic',
    width: 600, height: 400,
    replaces: '2026--05--senzoricka_masaz-600x400.png',
  },
  {
    file: 'therapist.jpg',
    prompt: 'professional wellness massage therapist in white uniform, warm professional portrait, no face visible, hands preparing massage oils, spa environment, photorealistic',
    width: 683, height: 1024,
    replaces: '2026--02--fc683be2-37c4-4f44-82a6-2fa514836c5e-683x1024.jpg',
  },
];

async function downloadImage(url, destPath) {
  if (existsSync(destPath)) { log(`  SKIP (exists): ${path.basename(destPath)}`); return true; }
  log(`  GET: ${url.slice(0, 100)}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) { log(`  WARN: ${res.status}`); return false; }
    const buf = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buf));
    log(`  OK: ${path.basename(destPath)} (${(buf.byteLength / 1024).toFixed(0)}KB)`);
    return true;
  } catch (e) { log(`  ERR: ${e.message}`); return false; }
}

async function generateImages() {
  log('-- Generování AI obrázků (Pollinations.ai) --');
  mkdirSync(IMG_DIR, { recursive: true });

  for (const img of IMAGES) {
    const destPath = path.join(IMG_DIR, img.file);
    const encoded = encodeURIComponent(img.prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${img.width}&height=${img.height}&model=flux&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;
    await downloadImage(url, destPath);
    // Brief pause between requests
    await new Promise(r => setTimeout(r, 1500));
  }
}

async function compressWithSharp() {
  log('\n-- Komprese via sharp --');
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    log('  sharp not available, skipping compression');
    return;
  }
  for (const img of IMAGES) {
    const src = path.join(IMG_DIR, img.file);
    if (!existsSync(src)) { log(`  SKIP (missing): ${img.file}`); continue; }
    const origSize = fs.statSync(src).size;
    const tmpPath = src + '.tmp';
    try {
      await sharp(src).jpeg({ quality: 82, mozjpeg: true }).toFile(tmpPath);
      const newSize = fs.statSync(tmpPath).size;
      fs.renameSync(tmpPath, src);
      log(`  ${img.file}: ${(origSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${Math.round((1-newSize/origSize)*100)}% úspora)`);
    } catch (e) {
      log(`  ERR compress ${img.file}: ${e.message}`);
      if (existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  }
}

function updateHtmlMapping() {
  log('\n-- Aktualizace HTML map (old filename → new AI filename) --');
  // Update the mapping in the HTML files — replace old filenames with new AI filenames
  const htmlFiles = [
    '/tmp/praha-masaze-home.html',
    '/tmp/praha-masaze-cenik.html',
  ];
  for (const htmlPath of htmlFiles) {
    if (!existsSync(htmlPath)) { log(`  SKIP (missing): ${htmlPath}`); continue; }
    let html = fs.readFileSync(htmlPath, 'utf-8');
    let changes = 0;
    for (const img of IMAGES) {
      if (!img.replaces) continue;
      // The local path in HTML uses -- instead of /
      const oldLocal = `${CLONE_PATH}/img/${img.replaces}`;
      const newLocal = `${CLONE_PATH}/img/${img.file}`;
      if (html.includes(oldLocal)) {
        html = html.split(oldLocal).join(newLocal);
        changes++;
      }
    }
    fs.writeFileSync(htmlPath, html, 'utf-8');
    log(`  ${path.basename(htmlPath)}: ${changes} nahrazení`);
  }
}

async function main() {
  log('=== FÁZE 6: AI obrázky pro praha-masaze-demo ===');

  await generateImages();
  await compressWithSharp();
  updateHtmlMapping();

  log('\n=== FÁZE 6 HOTOVA ===');
  log('Obrázky: ' + IMG_DIR);
  log('\nDalší kroky:');
  log('1. node scripts/seed-praha-masaze-demo.mjs  (re-seed s novými obrázky)');
  log('2. Ověřit: http://localhost:3015/demo/praha-masaze-demo');
}

main().catch(e => { console.error(e); process.exit(1); });
