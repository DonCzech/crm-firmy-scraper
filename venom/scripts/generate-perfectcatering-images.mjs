/**
 * FÁZE 6 — AI obrázky pro perfectcatering-demo
 * Nahrazuje originální fotografie (chef, tým, jídlo) AI-generovanými.
 * Model: Pollinations.ai (Flux, zdarma)
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
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`;
  log(`  → Pollinations: ${prompt.slice(0, 70)}... [${width}x${height}]`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(timeout);
  }
}

async function gen({ prompt, width, height, dest, minKB = 20 }) {
  const destPath = path.join(IMG_DIR, dest);
  log(`Generuji: ${dest}`);
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const buf = await generateViaPollinations({ prompt, width, height });
      if (buf.length < minKB * 1024) {
        log(`  RETRY — příliš malý (${buf.length}B < ${minKB}KB)`);
        continue;
      }
      fs.writeFileSync(destPath, buf);
      log(`  ✅ ${dest} — ${Math.round(buf.length/1024)}KB`);
      return true;
    } catch(e) {
      log(`  FAIL attempt ${attempts}: ${e.message}`);
      if (attempts < 3) await new Promise(r => setTimeout(r, 5000));
    }
  }
  log(`  ❌ SKIP: ${dest}`);
  return false;
}

// ─── DEFINICE OBRÁZKŮ ────────────────────────────────────────────────────────

const images = [
  // Hero chef portrait — desktop (velký portrét šéfkuchaře)
  {
    dest: 'hp_filip_desk.png',
    prompt: 'professional male chef in white chef coat and toque, smiling confidently, standing in modern restaurant kitchen, studio photography, clean white background, high quality, photorealistic',
    width: 744, height: 1000, minKB: 80,
  },
  // Hero chef portrait — mobile
  {
    dest: 'hp_filip_mob.png',
    prompt: 'professional male chef in white chef coat and toque, smiling confidently, studio portrait photography, clean light background, high quality, photorealistic',
    width: 400, height: 600, minKB: 60,
  },
  // Hero intro background
  {
    dest: 'hp_intro.png',
    prompt: 'elegant catering event setup, long banquet table with fine dining, luxury food presentation, candles, dark atmospheric restaurant, premium catering service, wide angle',
    width: 1536, height: 900, minKB: 100,
  },
  // Team: Filip (CEO)
  {
    dest: '403c043b6e00e41932b8f30b6e8dda73.png',
    prompt: 'professional male portrait, business casual, confident smile, 40s, dark hair, neutral gray background, high quality headshot photography',
    width: 372, height: 500, minKB: 50,
  },
  // Team: Petra
  {
    dest: 'bb5eeed96112d281b121ef5134edc245.png',
    prompt: 'professional female portrait, business attire, friendly smile, 35s, brown hair, neutral gray background, high quality headshot photography',
    width: 372, height: 500, minKB: 50,
  },
  // Food gallery images — catering style
  {
    dest: '8f0b06561f10b32cac69baf90ecaa2f4.jpg',
    prompt: 'luxury catering food plating, elegant appetizers on slate board, fine dining, dark background, professional food photography',
    width: 800, height: 600, minKB: 60,
  },
  {
    dest: 'e5c3ede47e8b7d74689d7adec1155ab3.jpg',
    prompt: 'wedding catering buffet table, elegant food display, flowers decoration, luxury event catering, professional photography',
    width: 900, height: 600, minKB: 80,
  },
  {
    dest: '6eb44a7a7e3da692f80ca86436144fbe.jpg',
    prompt: 'professional chef preparing elegant dishes in commercial kitchen, catering service, action shot, dramatic lighting',
    width: 900, height: 600, minKB: 80,
  },
  {
    dest: '03c2e73d2ebd3cd0c9ed25516c544713.jpg',
    prompt: 'luxury corporate catering event, elegant food stations, guests at premium dinner party, upscale venue',
    width: 800, height: 600, minKB: 70,
  },
  {
    dest: 'bbb64d35079f0e8532bfa7489bc3add0.jpg',
    prompt: 'gourmet appetizer canapes selection, elegant catering food platter, fine dining starters, dark background',
    width: 800, height: 600, minKB: 60,
  },
  {
    dest: '9566751f278dea83b263cb0b1716f594.jpg',
    prompt: 'beautifully plated main course, restaurant quality, catering service, fine dining meat dish with vegetables',
    width: 800, height: 600, minKB: 70,
  },
  {
    dest: '4d90572f9dcd999820224de4bcd6edb6.jpg',
    prompt: 'elegant dessert table at catering event, wedding cakes, macarons, luxury sweet display',
    width: 800, height: 600, minKB: 60,
  },
  {
    dest: '8ef01c9122b07ddde97505303bbeb75c.jpg',
    prompt: 'catering team in white uniforms serving food at corporate event, professional service, elegant venue',
    width: 900, height: 600, minKB: 80,
  },
  {
    dest: 'b487ae40875b5b2fe1567f15c51b1726.jpg',
    prompt: 'luxury cocktail reception catering, drinks and finger food, elegant party, chandeliers, premium event',
    width: 900, height: 600, minKB: 80,
  },
  {
    dest: 'cc3d14f3691fa6058785d78b25639e40.jpg',
    prompt: 'fresh local ingredients flat lay, vegetables and herbs on wooden board, catering kitchen, farm to table',
    width: 800, height: 600, minKB: 60,
  },
];

// ─── GENEROVÁNÍ ─────────────────────────────────────────────────────────────

log('=== FÁZE 6: AI obrázky perfectcatering-demo ===');
log(`Celkem obrázků: ${images.length}`);

let ok = 0, fail = 0;
for (const img of images) {
  const success = await gen(img);
  if (success) ok++; else fail++;
  // Rate limit — Pollinations.ai neblokuje, ale buď slušní
  await new Promise(r => setTimeout(r, 2000));
}

log(`=== HOTOVO: ✅ ${ok} / ❌ ${fail} ===`);
if (fail > 0) log('WARN: Některé obrázky selhaly — zkontroluj a regeneruj manuálně');
