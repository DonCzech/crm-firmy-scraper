/**
 * FÁZE 6 — AI obrázky nobe-demo (autoškola)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG = path.join(__dirname, '..', 'public/clones/nobe/img');
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

// Instruktoři — headshots
await gen('HONZA-VITOUS.jpg', 'professional male driving instructor portrait, 40s, friendly smile, casual professional attire, neutral gray background, headshot photography', 600, 800);
await gen('MILOSLAV-VITOUS.png', 'professional male instructor portrait, 50s, confident smile, polo shirt, neutral background, headshot', 600, 800);
await gen('koci-radovan.png', 'professional male driving instructor portrait, 45s, friendly, casual smart attire, neutral background, headshot', 600, 800);
await gen('Krakovka-Michal-768x1025.png', 'professional male instructor portrait, 35s, smiling, orange polo, white background, headshot', 768, 1025);
await gen('MILAN-PLAC%CB%87KO.jpg', 'professional male instructor portrait, 50s, friendly smile, dark jacket, neutral background, headshot', 600, 800);
await gen('IMG_4635-2-683x1024.jpg', 'professional female driving instructor portrait, 30s, friendly smile, casual attire, neutral background, headshot', 683, 1024);
await gen('IMG_2493.png', 'professional male driving school instructor, uniform, confident, outdoor city background, portrait', 600, 800);

// Maskot — přátelská koza/zvíře pro autoškolu
await gen('zebra_ukazujici.png', 'cute friendly cartoon goat mascot character pointing, orange and white colors, driving school theme, isolated on white background, vector illustration style', 400, 500);

// Sekce obrázky
await gen('750_kolaz.jpg', 'driving school students in classroom, instructor teaching traffic rules, modern classroom setting, group learning', 750, 500);
await gen('DSC_6631-1-450x275.jpg', 'students celebrating after passing driving test, happy group outdoors, car visible, sunny day', 450, 275);

log('=== FÁZE 6 NOBE HOTOVO ===');
