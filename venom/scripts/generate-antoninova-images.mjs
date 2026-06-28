/**
 * FÁZE 6 — AI obrázky antoninova-demo (pekárna, WordPress Marco theme)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG = path.join(__dirname, '..', 'public/clones/antoninova/img');

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

// ─── Hero Vegas slider backgrounds ──────────────────────────────────────────
await gen('kazde-rano-zarovky-1920x1080.png',
  'cozy artisan bakery interior with vintage Edison bulb lights hanging from ceiling, dark moody atmosphere, warm golden light, wooden furniture, bread on shelves, professional photography',
  1920, 1080);
await gen('chleba-1920x1080.png',
  'fresh artisan bread loaves on wooden table in bakery, golden crust, rustic background, dark moody atmosphere, professional food photography',
  1920, 1080);

// ─── Pojďte dál mosaic — jídlo a kavárna ────────────────────────────────────
await gen('kava-1024x584.png',
  'premium coffee latte art in ceramic cup, artisan bakery cafe, warm morning light, wooden table, cozy atmosphere',
  1024, 584);
await gen('kulajda-1024x683.png',
  'traditional Czech soup in bowl with cream and mushrooms, rustic presentation, bakery cafe menu item, professional food photography',
  1024, 683);
await gen('pekar-svetly-maly-1024x887.png',
  'professional baker in white apron holding fresh bread loaf, smiling, bright bakery interior, natural light, photorealistic',
  1024, 887);
await gen('rodinka-svetla-1024x666.png',
  'happy family with children at bakery cafe table, breakfast scene, warm light, Czech pastry, lifestyle photography',
  1024, 666);

// ─── Pobočky — exteriéry ─────────────────────────────────────────────────────
await gen('pekarstvi-nam-miru.jpg',
  'artisan bakery storefront in Prague street corner, modern branding, display window with bread, city morning',
  900, 600);
await gen('laubova.jpg',
  'cozy neighborhood bakery entrance in Prague residential street, warm window light, fresh bread display',
  900, 600);
await gen('ap-smichov.jpg',
  'modern bakery shop interior view from street, large glass window, Prague Smichov district, morning light',
  900, 600);
await gen('bubenec.jpg',
  'artisan bakery in Prague Bubenec neighborhood, boutique bakery storefront, elegant signage',
  900, 600);
await gen('pekarstvi-stross.jpg',
  'bakery cafe corner location in Prague, outdoor seating area, people enjoying coffee, morning scene',
  900, 600);
await gen('ap-karlin.jpg',
  'modern artisan bakery Prague Karlin, industrial interior design, exposed brick, fresh pastries on display',
  900, 600);
await gen('vrsovice.jpg',
  'small artisan bakery in Prague Vrsovice, local neighborhood shop, fresh bread in window, cozy atmosphere',
  900, 600);

log('=== FÁZE 6 ANTONINOVA HOTOVO ===');
