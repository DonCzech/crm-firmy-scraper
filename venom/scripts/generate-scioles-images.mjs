/**
 * FÁZE 6 — scioles-demo: AI image replacement via Pollinations.ai
 * Theme: dobrodružné kroužky pro děti (adventure clubs for children)
 */
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import path from 'node:path';

const IMG_DIR = 'public/clones/scioles/img';

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

function download(url, destPath, retries = 3) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return download(res.headers.location, destPath, retries).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (e) => { file.close(); try { fs.unlinkSync(destPath); } catch {} reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function gen(fname, prompt, width, height, seed) {
  const destPath = path.join(IMG_DIR, fname);
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
  log(`Generating ${fname} (${width}x${height})...`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await download(url, destPath);
      const size = fs.statSync(destPath).size;
      if (size < 10000) throw new Error(`Too small: ${size}B`);
      log(`  ✅ ${fname} (${size}B)`);
      return true;
    } catch (e) {
      log(`  ⚠️ attempt ${attempt}/3 failed: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 1500));
    }
  }
  log(`  ❌ FAILED: ${fname}`);
  return false;
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Delete originals first
const toDelete = [
  '1.jpg', '2.jpg', '4.jpg', '5.jpg', '9.jpg', '10.jpg', '11.jpg',
  'martin-foto.jpg',
  'ae3f7c95-80f8-4422-9024-b9a0d8c4a379_1_105_c.jpeg',
  'db56d7b4-1cc2-47bf-857b-c2ac1a72e8ec_1_105_c.jpeg',
  'this.jpeg',
  'scioles-intro-8.jpg', 'scioles-intro-9.jpg', 'scioles-intro-18.jpg',
  'scioles-intro-23.jpg', 'scioles-intro-24.jpg', 'scioles-intro-25.jpg',
  'sddefault.webp',
  'scio_rgb_male.png',
  'les-logo-obrys.png',
];

for (const f of toDelete) {
  const p = path.join(IMG_DIR, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); log(`Deleted ${f}`); }
}

log('=== Starting AI image generation ===');

const tasks = [
  // Hero/main section photos — children outdoor adventure activities
  ['1.jpg', 'group of happy czech children doing outdoor adventure activities in nature forest, summer, action photo, photorealistic', 1200, 800, 101],
  ['2.jpg', 'children playing outdoor team games in forest clearing, summer camp activities, czech kids ages 8-12, photorealistic', 1200, 800, 102],
  ['4.jpg', 'kids on rope course adventure park, outdoor activities, group of children climbing, natural light, photorealistic', 1200, 800, 104],
  ['5.jpg', 'children building campfire outdoors, nature adventure club, group activity, smiling kids, photorealistic', 1200, 800, 105],

  // Thumbnail photos
  ['9.jpg', 'small group of children orienteering in forest, adventure club activity, summer, photorealistic', 600, 400, 109],
  ['10.jpg', 'kids doing archery outdoor activity, adventure sports for children, natural setting, photorealistic', 600, 400, 110],
  ['11.jpg', 'children canoeing kayaking on river, water sports adventure club, summer, photorealistic', 600, 400, 111],

  // Instructor photo
  ['martin-foto.jpg', 'friendly male outdoor education instructor smiling portrait, casual shirt, natural background, professional headshot, photorealistic', 400, 500, 201],

  // Large feature photos
  ['ae3f7c95-80f8-4422-9024-b9a0d8c4a379_1_105_c.jpeg', 'children doing outdoor survival skills workshop in forest, group learning, adventure education, photorealistic', 1400, 900, 301],
  ['db56d7b4-1cc2-47bf-857b-c2ac1a72e8ec_1_105_c.jpeg', 'kids on nature hike through forest trail, backpacks, adventure club group activity, photorealistic', 1400, 900, 302],
  ['this.jpeg', 'outdoor adventure camp for children, wide shot of activities in forest clearing, summer, photorealistic', 1400, 900, 303],

  // Intro carousel photos
  ['scioles-intro-8.jpg', 'children at outdoor nature camp doing activities, smiling, adventure education, photorealistic', 800, 500, 401],
  ['scioles-intro-9.jpg', 'kids exploring forest path with guide, adventure club excursion, photorealistic', 800, 500, 402],
  ['scioles-intro-18.jpg', 'children learning outdoor cooking on campfire, nature skills, group activity, photorealistic', 800, 500, 403],
  ['scioles-intro-23.jpg', 'kids doing team building rope activity outdoors, adventure sports, summer, photorealistic', 800, 500, 404],
  ['scioles-intro-24.jpg', 'children stargazing night camp activity, telescope outdoors, adventure education, photorealistic', 800, 500, 405],
  ['scioles-intro-25.jpg', 'group of kids doing nature art crafts outdoors, adventure club workshop, summer, photorealistic', 800, 500, 406],

  // YouTube thumbnail replacement — nature/forest visual
  ['sddefault.webp', 'cinematic forest adventure landscape with children silhouettes, golden hour light, outdoor activities', 640, 480, 501],

  // Logo replacement — generic tree/nature emblem
  ['les-logo-obrys.png', 'minimal clean vector tree logo outline silhouette, forest emblem, single color, white background', 600, 200, 601],
];

// Scio logo replacement — create inline SVG instead of downloading
const scioSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" rx="4" fill="#2d5a27"/><text x="60" y="27" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ffffff" letter-spacing="1">KROUŽKY</text></svg>`;
fs.writeFileSync(path.join(IMG_DIR, 'scio_rgb_male.png.svg'), scioSvg);
// Also write as PNG-named SVG (rename trick: browsers load by content-type from server, but for static files we need actual image)
// Instead just generate a simple colored PNG placeholder via pollinations
tasks.push(['scio_rgb_male.png', 'simple green rectangle logo with text KROUZKY, minimal flat design, white background', 200, 60, 701]);

let ok = 0, fail = 0;
for (const [fname, prompt, w, h, seed] of tasks) {
  const success = await gen(fname, prompt, w, h, seed);
  if (success) ok++; else fail++;
  await delay(800);
}

// Cleanup temp svg
try { fs.unlinkSync(path.join(IMG_DIR, 'scio_rgb_male.png.svg')); } catch {}

log(`=== Done: ${ok} OK, ${fail} failed ===`);
