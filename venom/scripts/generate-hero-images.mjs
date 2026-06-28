/**
 * generate-hero-images.mjs — dogeneruje hero a promo obrázky (large format)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLONE_DIR = join(ROOT, 'public', 'clones', 'fade-room');
const BASE = '/clones/fade-room';

const env = readFileSync(join(ROOT, '.env.local'), 'utf-8');
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k?.trim() && v.length) process.env[k.trim()] = v.join('=').trim().replace(/^"(.*)"$/, '$1');
}

const HERO_JOBS = [
  {
    filename: 'img/hero.jpg',
    size: '1536x1024',
    prompt: 'Premium barbershop interior, warm golden lighting, dark walls with wood accents, leather barber chairs, large mirrors, very professional and upscale atmosphere, Prague Czech Republic style, cinematic photograph, high-end salon, no text, no people',
  },
  {
    filename: 'img/hero-mob.jpg',
    size: '1024x1536',
    prompt: 'Premium barbershop interior portrait orientation, warm golden lighting, dark wood walls, leather barber chairs, professional upscale atmosphere, cinematic photograph, no text, no people',
  },
  {
    filename: 'img/akce/promo-1.jpg',
    size: '1536x1024',
    prompt: 'Premium barbershop promotional image, stylish Czech man with fresh fade haircut holding a glass of whiskey, dark luxury atmosphere, warm amber light, cinematic photography, no text overlay',
  },
  {
    filename: 'img/akce/promo-2.jpg',
    size: '1536x1024',
    prompt: 'Birthday celebration at a premium barbershop, elegant man being groomed, subtle golden bokeh background, luxury atmosphere, cinematic warm light photography, no text',
  },
];

async function generateImage(openai, prompt, filename, size) {
  console.log(`  🎨 ${filename} [${size}]`);
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
      quality: 'high',
    });
    const imageData = response.data[0];
    const destPath = join(CLONE_DIR, filename);
    mkdirSync(dirname(destPath), { recursive: true });
    if (imageData.b64_json) {
      writeFileSync(destPath, Buffer.from(imageData.b64_json, 'base64'));
      console.log(`     ✅ OK`);
    }
    return `${BASE}/${filename}`;
  } catch (err) {
    console.error(`     ❌ ${err.message}`);
    return null;
  }
}

async function main() {
  const OpenAI = (await import('/Users/apple/DEV/CRM/convee-app/node_modules/openai/index.js')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log('\n📸 Generuji hero + promo obrázky...\n');
  const generated = {};
  for (const job of HERO_JOBS) {
    const path = await generateImage(openai, job.prompt, job.filename, job.size);
    if (path) generated[job.filename] = path;
    await new Promise(r => setTimeout(r, 500));
  }

  // Update DB
  const { Pool } = pg;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const t = await client.query("SELECT id FROM tenants WHERE slug = 'fade-room-demo'");
    const tenantId = t.rows[0].id;
    const sections = await client.query(
      "SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON p.id=s.page_id WHERE s.tenant_id=$1 AND s.section_type='full-page-clone'",
      [tenantId]
    );
    for (const row of sections.rows) {
      let html = row.settings.html ?? '';
      if (generated['img/hero.jpg'])
        html = html.replace(/url\(['"']?\/clones\/fade-room\/img\/(?:hero|img-top)\.jpg['"']?\)/g, `url('${generated['img/hero.jpg']}')`);
      if (generated['img/hero-mob.jpg'])
        html = html.replace(/url\(['"']?\/clones\/fade-room\/img\/(?:hero-mob|img-top-mob)\.jpg['"']?\)/g, `url('${generated['img/hero-mob.jpg']}')`);
      if (generated['img/akce/promo-1.jpg'])
        html = html.replace(/url\(['"']?\/clones\/fade-room\/img\/akce\/(?:promo-1|img-akce-2)\.jpg['"']?\)/g, `url('${generated['img/akce/promo-1.jpg']}')`);
      if (generated['img/akce/promo-2.jpg'])
        html = html.replace(/url\(['"']?\/clones\/fade-room\/img\/akce\/(?:promo-2|img-akce-3)\.jpg['"']?\)/g, `url('${generated['img/akce/promo-2.jpg']}')`);
      const ns = { ...row.settings, html };
      await client.query('UPDATE sections SET settings=$1 WHERE id=$2', [JSON.stringify(ns), row.id]);
      console.log(`  ✅ DB [${row.slug}]`);
    }
  } finally {
    client.release();
    await pool.end();
  }
  console.log('\n✅ Hotovo!');
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
