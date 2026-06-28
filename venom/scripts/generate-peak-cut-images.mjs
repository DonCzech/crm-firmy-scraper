/**
 * FÁZE 6 — AI generování obrázků pro peak-cut-demo
 * Nahrazuje originální fotografie z barbershop-buddy.cz AI-generovanými.
 *
 * Model: Pollinations.ai (Flux/SDXL) — zdarma, bez API klíče
 * Záloha: gpt-image-1 přes OPENAI_API_KEY (pokud billing dostupný)
 *
 * Spustit: node scripts/generate-peak-cut-images.mjs
 *
 * Výstup: přepíše soubory v public/clones/peak-cut/wp-content/uploads/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UPLOADS = path.join(ROOT, 'public/clones/peak-cut/wp-content/uploads');

// Sharp pro kompresi
const sharp = (await import('sharp')).default;

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

/**
 * Generuje obrázek přes Pollinations.ai (Flux model, zcela zdarma, bez API klíče).
 * Pollinations vrací JPEG/PNG přímo jako binary response.
 */
async function generateViaPollinations({ prompt, width, height }) {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`;

  log(`  Pollinations URL: ${url.slice(0, 100)}...`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VenomBot/1.0)',
        'Accept': 'image/*',
      },
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Záloha: OpenAI gpt-image-1 (pokud OPENAI_API_KEY je nastaven a billing ok)
 */
async function generateViaOpenAI({ prompt, size }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const OPENAI_PATH = '/Users/apple/DEV/CRM/convee-app/node_modules/openai/index.js';
  const { default: OpenAI } = await import(OPENAI_PATH);
  const openai = new OpenAI({ apiKey });

  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt,
    size,
    quality: 'high',
  });

  const b64 = response.data[0].b64_json;
  return Buffer.from(b64, 'base64');
}

async function generateImage({ prompt, width, height, openaiSize, destPath, maxKB, bw = false }) {
  log(`Generuji: ${path.basename(destPath)} (${width}x${height})${bw ? ' [B&W]' : ''}`);
  log(`  Prompt: ${prompt.slice(0, 80)}...`);

  let raw;

  // Zkus OpenAI nejprve (pokud billing dostupný)
  if (process.env.OPENAI_API_KEY) {
    try {
      log('  Zkouším OpenAI gpt-image-1...');
      raw = await generateViaOpenAI({ prompt, size: openaiSize });
      log('  OpenAI OK');
    } catch (e) {
      log(`  OpenAI failed (${e.message}), přepínám na Pollinations.ai...`);
      raw = null;
    }
  }

  // Fallback na Pollinations.ai
  if (!raw) {
    log('  Pollinations.ai (Flux)...');
    raw = await generateViaPollinations({ prompt, width, height });
    log(`  Pollinations OK (${Math.round(raw.length / 1024)}KB raw)`);
  }

  // Komprimovat přes sharp
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const ext = path.extname(destPath).toLowerCase();

  // Base sharp pipeline
  let pipeline = sharp(raw).resize(width, height, { fit: 'cover' });
  if (bw) {
    pipeline = pipeline.grayscale().linear(1.1, 10);
  }

  let compressed;
  if (ext === '.jpg' || ext === '.jpeg') {
    compressed = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } else if (ext === '.png') {
    compressed = await pipeline.png({ compressionLevel: 8 }).toBuffer();
  } else {
    compressed = raw;
  }

  const finalKB = Math.round(compressed.length / 1024);
  if (maxKB && finalKB > maxKB) {
    log(`  WARN: ${finalKB}KB > limit ${maxKB}KB — re-komprimuji agresivněji`);
    let p2 = sharp(raw).resize(width, height, { fit: 'cover' });
    if (bw) p2 = p2.grayscale().linear(1.1, 10);
    if (ext === '.jpg' || ext === '.jpeg') {
      compressed = await p2.jpeg({ quality: 65, mozjpeg: true }).toBuffer();
    } else if (ext === '.png') {
      compressed = await p2.png({ compressionLevel: 9 }).toBuffer();
    }
  }

  fs.writeFileSync(destPath, compressed);
  log(`  OK: ${Math.round(compressed.length / 1024)}KB → ${destPath}`);
}

async function main() {
  log('=== FÁZE 6: AI generování obrázků pro peak-cut-demo ===');
  log('Provider: Pollinations.ai (Flux) — fallback OpenAI gpt-image-1\n');

  const images = [
    // ── HERO (desktop) ─────────────────────────────────────────────────────
    {
      prompt: 'Professional barbershop interior, male barber in dark apron cutting client hair with scissors, dramatic side lighting, dark moody atmosphere, photorealistic, no text, no logos, wide cinematic composition, high quality photography',
      width: 1536, height: 1024,
      openaiSize: '1536x1024',
      dest: '2023/07/Frame-1.jpg',
      maxKB: 350,
      bw: true,
    },
    // ── HERO (mobile) ──────────────────────────────────────────────────────
    {
      prompt: 'Professional male barber in dark apron, confident portrait, barbershop interior background with warm bokeh lights, dark moody style, photorealistic, no text, no logos, vertical portrait composition',
      width: 1024, height: 1536,
      openaiSize: '1024x1536',
      dest: '2023/08/Mobile-1.jpg',
      maxKB: 350,
      bw: true,
    },
    // ── ABOUT ──────────────────────────────────────────────────────────────
    {
      prompt: 'Modern barbershop interior, vintage barber chair, brick wall, barbershop tools on shelf, warm ambient lighting, no people, photorealistic interior photography',
      width: 1024, height: 1024,
      openaiSize: '1024x1024',
      dest: '2023/07/about_image.jpg',
      maxKB: 220,
    },
    // ── CONTACT US (hlavní sekce) ──────────────────────────────────────────
    {
      prompt: 'Smiling professional male barber in uniform at reception desk of modern barbershop, friendly welcoming expression, clean interior background, photorealistic portrait',
      width: 1024, height: 1024,
      openaiSize: '1024x1024',
      dest: '2023/07/contact-us_image.jpg',
      maxKB: 220,
    },
    // ── CONTACTS 1 ─────────────────────────────────────────────────────────
    {
      prompt: 'Exterior facade of a modern upscale barbershop at night, neon sign glow, inviting entrance, urban street photography, photorealistic',
      width: 1024, height: 1024,
      openaiSize: '1024x1024',
      dest: '2023/07/contacts_image1.jpg',
      maxKB: 220,
    },
    // ── CONTACTS 2 ─────────────────────────────────────────────────────────
    {
      prompt: 'Premium barbershop interior with leather barber chairs and mirrors, professional barbershop tools, clean elegant style, warm lighting, no people, photorealistic',
      width: 1024, height: 1024,
      openaiSize: '1024x1024',
      dest: '2023/07/contacts_image2.jpg',
      maxKB: 220,
    },
    // ── CONTACT B&W FOTO 1 — nůžky / nástroje ─────────────────────────────
    {
      prompt: 'Close-up of professional barber scissors, straight razor and comb on leather surface, barbershop tools still life, moody lighting, high contrast, professional product photography',
      width: 800, height: 800,
      openaiSize: '1024x1024',
      dest: '2023/07/contact_photo1.jpg',
      maxKB: 180,
      bw: true,
    },
    // ── CONTACT B&W FOTO 2 — křeslo (již existuje 55KB, přeskočit) ─────────
    // contact_photo2.jpg — OK, nepřegenerovávat
    // ── CONTACT B&W FOTO 3 — portrét barbera ──────────────────────────────
    {
      prompt: 'Portrait of a confident male barber in his 30s, wearing dark apron, arms crossed, standing in barbershop, serious professional expression, shallow depth of field, studio quality',
      width: 800, height: 800,
      openaiSize: '1024x1024',
      dest: '2023/07/contact_photo3.jpg',
      maxKB: 180,
      bw: true,
    },
  ];

  let success = 0;
  let failed = 0;

  for (const img of images) {
    const destPath = path.join(UPLOADS, img.dest);
    try {
      await generateImage({
        prompt: img.prompt,
        width: img.width,
        height: img.height,
        openaiSize: img.openaiSize,
        destPath,
        maxKB: img.maxKB,
        bw: img.bw || false,
      });
      success++;
      // Pauza mezi requesty (Pollinations rate limit)
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      log(`  ERROR: ${e.message}`);
      failed++;
    }
  }

  log(`\n=== AI obrázky: ${success} OK, ${failed} failed ===`);
  if (success > 0) {
    log('Spusť seed: node scripts/seed-peak-cut-demo.mjs');
    log('Pak obfuskaci: node scripts/obfuscate-clone.mjs peak-cut peak-cut-demo');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
