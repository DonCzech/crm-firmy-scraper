/**
 * generate-the-barber-main-images.mjs
 * Generates the 3 main images for the-barber-demo (were 0 bytes)
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import sharp from '/Users/apple/DEV/CRM/venom/node_modules/sharp/lib/index.js';

const OUT_DIR = '/Users/apple/DEV/CRM/venom/public/clones/the-barber/img';

const IMAGES = [
  {
    file: 'hero.jpg',
    prompt: 'luxury barbershop interior dark moody atmosphere, barber chair vintage leather, dim lighting, bokeh, cinematic composition, professional photography',
    width: 1920, height: 1080, seed: 42, bw: true,
  },
  {
    file: 'about.jpg',
    prompt: 'professional barber cutting hair, close up portrait, barbershop setting, focused craftsman, warm light, shallow depth of field, editorial photography',
    width: 900, height: 675, seed: 77, bw: true,
  },
  {
    file: 'pricing-bg.jpg',
    prompt: 'barbershop tools vintage razor comb scissors arrangement flat lay, dark leather background, moody noir atmosphere, top view',
    width: 1920, height: 1080, seed: 123, bw: true,
  },
];

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    https.get(url, (res) => {
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, attempts = 6) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const buf = await downloadImage(url);
      // Detect JSON error response
      const str = buf.toString('utf8', 0, 100);
      if (str.startsWith('{') || str.startsWith('[') || str.includes('"error"')) {
        console.log(`  Attempt ${i}: API error — ${str.substring(0, 80)}, waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
        continue;
      }
      if (buf.length < 5000) {
        console.log(`  Attempt ${i}: Too small (${buf.length} bytes), waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      return buf;
    } catch(e) {
      console.log(`  Attempt ${i}: ${e.message}, waiting 15s...`);
      await new Promise(r => setTimeout(r, 15000));
    }
  }
  throw new Error('Max retries exceeded');
}

async function generate(img) {
  const dest = path.join(OUT_DIR, img.file);
  console.log(`\n→ Generating ${img.file} (${img.width}×${img.height})...`);

  const encoded = encodeURIComponent(img.prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${img.width}&height=${img.height}&seed=${img.seed}&model=flux&nologo=true&enhance=true`;
  console.log('  URL:', url.substring(0, 100) + '...');

  const raw = await fetchWithRetry(url);
  console.log(`  Downloaded ${raw.length} bytes`);

  let pipeline = sharp(raw);
  if (img.bw) pipeline = pipeline.grayscale().linear(1.1, 10);
  await pipeline.jpeg({ quality: 88, progressive: true }).toFile(dest);

  const stat = fs.statSync(dest);
  console.log(`  ✅ Saved ${img.file} (${stat.size} bytes)`);
}

async function main() {
  for (const img of IMAGES) {
    await generate(img);
    if (img !== IMAGES[IMAGES.length - 1]) {
      console.log('  Waiting 12s before next request...');
      await new Promise(r => setTimeout(r, 12000));
    }
  }
  console.log('\n✅ All main images generated!');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
