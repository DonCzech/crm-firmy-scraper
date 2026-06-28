/**
 * Generuje gallery-01 až gallery-12 pro the-barber-demo
 * 400x400px, B&W styl
 * Spustit: node scripts/generate-the-barber-gallery.mjs
 */

import fs from 'fs';
import https from 'https';
import sharp from 'sharp';
import path from 'path';

const DEST = '/Users/apple/DEV/CRM/venom/public/clones/the-barber/img';

const IMAGES = [
  { file: 'gallery-01.jpg', prompt: 'Close-up of professional barber scissors and straight razor on dark marble surface, barbershop tools, moody lighting, black and white photography' },
  { file: 'gallery-02.jpg', prompt: 'Barber giving precise haircut to male client, side profile view, barbershop interior, professional grooming, black and white photo' },
  { file: 'gallery-03.jpg', prompt: 'Vintage leather barber chair in elegant barbershop, dark wood interior, classic style, black and white photography' },
  { file: 'gallery-04.jpg', prompt: 'Stylish barbershop interior with exposed brick wall, leather chairs, warm atmosphere, no people, black and white' },
  { file: 'gallery-05.jpg', prompt: 'Barber tools flatlay: combs, scissors, razor, pomade jar arranged on dark surface, top view, black and white' },
  { file: 'gallery-06.jpg', prompt: 'Close-up of barber trimming and shaping beard with precision, professional grooming, black and white portrait' },
  { file: 'gallery-07.jpg', prompt: 'Male barber with tattoos and apron holding scissors, confident pose, barbershop background, black and white' },
  { file: 'gallery-08.jpg', prompt: 'Hot towel shave preparation, barber applying shaving cream on male client face, close-up, black and white' },
  { file: 'gallery-09.jpg', prompt: 'Professional barber concentrating on haircut, focused expression, bokeh background, black and white portrait' },
  { file: 'gallery-10.jpg', prompt: 'Detail of freshly cut mens hair, fade haircut texture close-up, black and white macro photography' },
  { file: 'gallery-11.jpg', prompt: 'Barbershop waiting area with leather sofa, vintage mirrors, plants, cozy atmosphere, black and white' },
  { file: 'gallery-12.jpg', prompt: 'Straight razor and shaving brush on wooden shelf, barbershop accessories, dramatic lighting, black and white' },
];

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 120000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateBW({ prompt, dest, size = 400, seed, attempt = 1 }) {
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${size}&height=${size}&seed=${seed}&model=flux&nologo=true&enhance=true`;
  log(`  URL: ${url.slice(0, 100)}...`);

  let raw;
  try {
    raw = await fetchBuffer(url);
  } catch (e) {
    if (attempt < 5) {
      log(`  Fetch error: ${e.message}, čekám 20s...`);
      await sleep(20000);
      return generateBW({ prompt, dest, size, seed: seed + 1, attempt: attempt + 1 });
    }
    throw e;
  }
  log(`  Raw: ${Math.round(raw.length / 1024)}KB`);

  // detect JSON error (rate limit / queue full)
  if (raw.length < 5000) {
    const text = raw.toString('utf-8');
    if (text.includes('"error"') || text.includes('Queue full') || text.includes('Too Many')) {
      if (attempt < 6) {
        log(`  Rate limit / queue full, čekám 30s (attempt ${attempt})...`);
        await sleep(30000);
        return generateBW({ prompt, dest, size, seed: seed + 1, attempt: attempt + 1 });
      }
      throw new Error('Rate limit exceeded after retries');
    }
    if (attempt < 4) {
      log(`  Too small (${raw.length}B), retry ${attempt + 1}...`);
      await sleep(15000);
      return generateBW({ prompt, dest, size, seed: seed + 1, attempt: attempt + 1 });
    }
    throw new Error('Image too small after retries');
  }

  const out = await sharp(raw)
    .resize(size, size, { fit: 'cover' })
    .grayscale()
    .linear(1.1, 10)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(dest, out);
  log(`  OK: ${Math.round(out.length / 1024)}KB → ${dest}`);
}

async function main() {
  log('=== Generace gallery-01 až gallery-12 (B&W 400x400) ===');

  // Skip already generated images
  const SKIP_EXISTING = true;
  let ok = 0, fail = 0;
  for (let i = 0; i < IMAGES.length; i++) {
    const { file, prompt } = IMAGES[i];
    const dest = path.join(DEST, file);
    if (SKIP_EXISTING && fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      log(`\nPřeskakuji ${file} (existuje, ${Math.round(fs.statSync(dest).size/1024)}KB)`);
      ok++;
      continue;
    }
    log(`\nGeneruji ${file} (${i + 1}/${IMAGES.length})`);
    log(`  Prompt: ${prompt.slice(0, 80)}...`);

    try {
      await generateBW({ prompt, dest, size: 400, seed: 100 + i * 7 });
      ok++;
    } catch (e) {
      log(`  CHYBA: ${e.message}`);
      fail++;
    }

    // pause between requests — avoid queue full
    if (i < IMAGES.length - 1) await sleep(12000);
  }

  log(`\n=== Hotovo: ${ok}/${IMAGES.length} OK${fail ? `, ${fail} CHYB` : ''} ===`);
  if (ok === IMAGES.length) {
    log('\nDalší kroky:');
    log('1. node scripts/seed-the-barber-demo.mjs   (re-seed s live HTML)');
    log('2. node scripts/obfuscate-clone.mjs the-barber the-barber-demo');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
