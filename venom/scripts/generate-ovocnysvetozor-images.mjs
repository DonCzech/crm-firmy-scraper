/**
 * FÁZE 6 — AI obrázky ovocnysvetozor-demo (cukrárna)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG = path.join(__dirname, '..', 'public/clones/ovocnysvetozor/img');

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

async function gen(dest, prompt, w, h) {
  const destPath = path.join(IMG, dest);
  log(`→ ${dest} [${w}x${h}]`);
  for (let i = 0; i < 3; i++) {
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${Math.floor(Math.random()*999999)}&model=flux&nologo=true`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 120000);
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/*' }, signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 15000) { log(`  retry (${buf.length}B)`); await new Promise(r=>setTimeout(r,3000)); continue; }
      fs.writeFileSync(destPath, buf);
      log(`  ✅ ${Math.round(buf.length/1024)}KB`);
      return;
    } catch(e) { log(`  fail ${i+1}: ${e.message}`); await new Promise(r=>setTimeout(r,4000)); }
  }
  log(`  ❌ SKIP`);
}

// Hero + sekce
await gen('showcase.jpg', 'beautiful colorful desserts display in modern pastry shop, cakes macarons fruit tarts, vibrant red decoration, professional food photography', 1400, 800);
await gen('ochutnejte.jpg', 'assorted Czech pastry and cake selection, colorful sweets display, bakery shop, vibrant red background accent', 900, 600);

// Produkty
await gen('freshe_v1.jpg', 'fresh fruit smoothie bowl with berries and granola, colorful healthy dessert, white background, top view photography', 800, 800);
await gen('karamel_v4.jpg', 'premium caramel cake slice with golden caramel drizzle, elegant patisserie plating, dark background', 800, 800);
await gen('sklenicka_v1.jpg', 'artisan dessert in glass jar, layered tiramisu or parfait, colorful garnish, professional food styling', 600, 800);
await gen('tocena_v1.jpg', 'soft serve ice cream cone with colorful toppings, vibrant background, summer treat, food photography', 600, 800);
await gen('box_sklenicka.jpg', 'gift box with premium desserts and sweets, elegant packaging, pastry shop presentation', 800, 600);
await gen('chlebicky_v1.jpg', 'traditional Czech open sandwiches chlebicky, colorful toppings, catering presentation, elegant', 900, 600);
await gen('usetrete_v3.jpg', 'loyalty card and discount voucher for pastry shop, colorful graphic design, sweets and cake icons', 800, 600);

// Limonáda promo
await gen('Web_PM_limonady_2400x2400_082025.jpg', 'homemade lemonade with fresh fruits and mint, colorful summer drinks, red background, refreshing', 900, 900);

// Prodejna / exteriér
await gen('Vodickova3.jpg', 'modern pastry shop storefront in Prague city center, red branding, display window with cakes, street level', 1000, 700);

// Rozvoz
await gen('rozvoz_maly.jpg', 'food delivery scooter with logo box, city street, modern urban delivery service', 400, 300);

log('=== FÁZE 6 OVOCNYSVETOZOR HOTOVO ===');
