/**
 * FÁZE 6 — AI obrázky pro freja-demo (květinářství)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'public/clones/freja/img');

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

async function pollinations(prompt, w, h) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${Math.floor(Math.random()*999999)}&model=flux&nologo=true`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 120000);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/*' }, signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  } finally { clearTimeout(t); }
}

async function gen(dest, prompt, w, h) {
  const destPath = path.join(IMG, dest);
  log(`→ ${dest} [${w}x${h}]`);
  for (let i = 0; i < 3; i++) {
    try {
      const buf = await pollinations(prompt, w, h);
      if (buf.length < 15000) { log(`  retry (${buf.length}B)`); await new Promise(r => setTimeout(r, 3000)); continue; }
      fs.writeFileSync(destPath, buf);
      log(`  ✅ ${Math.round(buf.length/1024)}KB`);
      return;
    } catch(e) { log(`  fail ${i+1}: ${e.message}`); await new Promise(r => setTimeout(r, 4000)); }
  }
  log(`  ❌ SKIP`);
}

// Hero + sekce
await gen('upturned-colorful-flower-heads-on-slender-green-stalks_2000x.jpg',
  'beautiful colorful flower bouquets arrangement, white background, elegant florist studio, peonies roses ranunculus, soft light', 2000, 1200);
await gen('img-flowers.jpg',
  'elegant white flower bouquet, peonies and roses, minimalist white background, florist shop, soft natural light', 900, 600);
await gen('img-spring.jpg',
  'spring flower bouquet with tulips and daffodils, pastel colors, light background, floral arrangement, photorealistic', 900, 600);

// Kategorie navigace
await gen('mono.jpg',
  'single stem flower, white rose on white background, minimalist florist photography, elegant', 600, 400);
await gen('gifts.jpg',
  'flower gift box arrangement, beautiful wrapped bouquet, gift presentation, florist, white background', 600, 400);
await gen('bestseller.jpg',
  'premium flower bouquet bestseller, roses peonies, elegant wrapping, white background, top product', 600, 400);

// Produktové fotky — kytice s lidmi
await gen('IMG-233271.jpg',
  'woman holding beautiful flower bouquet roses pink white, lifestyle photography, natural background, florist', 800, 1000);
await gen('IMG-233276.jpg',
  'elegant flower bouquet red roses wrapped in craft paper, white background, product photography', 800, 1000);
await gen('IMG-247221.jpg',
  'person holding mixed flower bouquet colorful, outdoor natural light, florist lifestyle photo', 800, 1000);
await gen('IMG-247226.jpg',
  'premium bouquet with peonies and greenery, held by hands, white background, product photo', 800, 1000);
await gen('IMG_11343.jpg',
  'beautiful flower arrangement in vase, roses carnations, natural light, home decor florist', 800, 800);
await gen('IMG_11346.jpg',
  'spring bouquet tulips and anemones, pastel colors, minimal white background, product photography', 800, 800);
await gen('IMG_1190.jpg',
  'luxury rose bouquet in pink white, elegant wrapping, gift, premium flower shop', 800, 1000);
await gen('IMG_1192.jpg',
  'fresh mixed flower bouquet with eucalyptus, garden style, natural background, florist', 800, 1000);
await gen('IMG_1627.jpg',
  'romantic red rose bouquet, classic arrangement, white background, Valentine style', 800, 1000);
await gen('IMG_1633.jpg',
  'seasonal flower arrangement with wildflowers, rustic style, natural light, florist', 800, 800);
await gen('IMG_5871.jpg',
  'colorful flower bouquet assortment, sunflowers dahlias roses, vibrant, market style', 800, 800);
await gen('IMG_5875.jpg',
  'white peony bouquet premium, minimal white background, luxury florist, soft light', 800, 1000);
await gen('IMG_762.jpg',
  'small flower arrangement gift, cute bouquet, white and pink, simple clean background', 600, 600);
await gen('IMG_767.jpg',
  'hand holding flower bouquet from below, overhead shot, petals visible, beautiful arrangement', 800, 800);
await gen('amy-shamblen-qdPnQuGeuwU-unsplash.jpg',
  'woman in light dress holding large colorful flower bouquet, smiling, outdoor, spring, lifestyle', 1000, 800);
await gen('photo1707134778.jpg',
  'flower shop interior, display of bouquets, bright airy space, modern florist store', 800, 600);
await gen('photo1707134778_1_c0c08764-da07-4df8-84e7-b9a26ed81125.jpg',
  'florist arranging flowers in shop, professional, bright interior, bouquets on display', 800, 600);

log('=== FÁZE 6 FREJA HOTOVO ===');
