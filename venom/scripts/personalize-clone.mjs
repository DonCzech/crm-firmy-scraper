/**
 * personalize-clone.mjs
 * Fáze 6 — Personalizace: texty, logo, AI fotografie.
 *
 * Co dělá:
 * 1. Nahradí všechny texty (název, adresa, telefon, copyright) za brand texty
 * 2. Vytvoří SVG logo a vloží ho jako inline <img>
 * 3. Vygeneruje nové fotografie přes OpenAI gpt-image-1
 * 4. Nahradí stávající fotky v HTML novými AI-generovanými
 * 5. Opraví broken image paths (assets/cache → thumb)
 * 6. Aktualizuje DB
 *
 * Použití:
 *   node scripts/personalize-clone.mjs <clone-name> <tenant-slug>
 *   node scripts/personalize-clone.mjs fade-room fade-room-demo
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const [,, cloneName, tenantSlug] = process.argv;
if (!cloneName || !tenantSlug) {
  console.error('Usage: node personalize-clone.mjs <clone-name> <tenant-slug>');
  process.exit(1);
}

// Load env
const env = readFileSync(join(ROOT, '.env.local'), 'utf-8');
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k?.trim() && v.length) process.env[k.trim()] = v.join('=').trim().replace(/^"(.*)"$/, '$1');
}

const CLONE_DIR = join(ROOT, 'public', 'clones', cloneName);
const BASE = `/clones/${cloneName}`;

// ─── Brand data ───────────────────────────────────────────────────────────────
const BRAND = {
  name:        'The Fade Room',
  name_cs:     'The Fade Room',
  tagline:     'Nejlepší barbershop v Praze',
  address:     'Korunní 47, Praha 2, 120 00',
  phone:       '+420 702 456 789',
  phone_raw:   '702456789',
  email:       'info@thefaderoom.cz',
  hours_week:  'Po - Pá: 09:00 - 20:00',
  hours_sat:   'So: 09:00 - 18:00',
  hours_sun:   'Ne: 10:00 - 16:00',
  hours_full:  'Po - Pá: 09:00 - 20:00, So: 09:00 - 18:00, Ne: 10:00 - 16:00',
  instagram:   'https://www.instagram.com/thefaderoom/',
  year_since:  '2020',
  copyright:   '2020',
};

// ─── Text replacements (order matters — longest/most-specific first) ──────────
const TEXT_REPLACEMENTS = [
  // Copyright & credits — remove "Design Online Studio" watermark
  [/Tvorba\s+web[uů]\s+Design\s+Online\s+Studio/gi, ''],
  [/Design\s+Online\s+Studio/gi, ''],

  // Original brand name variants
  [/Barbershop\s*«\s*Urban\s*»/gi, BRAND.name],
  [/barbershop\s+URBAN/gi, BRAND.name],
  [/Barbershop\s+Urban/gi, BRAND.name],
  [/barbershopu\s+URBAN/gi, BRAND.name],
  [/URBAN\s+barbershop/gi, BRAND.name],

  // Address
  [/Hartigova\s+151\/24,\s*Praha\s*3,\s*130\s*00/gi, BRAND.address],
  [/Hartigova\s+151\/24/gi, 'Korunní 47'],
  [/Praha\s+3,\s*130\s*00/gi, 'Praha 2, 120 00'],

  // Phone
  [/\+420\s*773\s*096\s*906/g, BRAND.phone],
  [/773\s*096\s*906/g, '702 456 789'],
  [/tel:773096906/g, `tel:${BRAND.phone_raw}`],

  // Hours
  [/Po\s*-\s*Pá:\s*09:00\s*-\s*19:00,\s*So:\s*10:00\s*-\s*19:00,\s*Ne:\s*10:00\s*-\s*19:00/gi, BRAND.hours_full],
  [/Po\s*-\s*Pá:\s*09:00\s*-\s*19:00/gi, BRAND.hours_week],
  [/So:\s*10:00\s*-\s*19:00/gi, BRAND.hours_sat],
  [/Ne:\s*10:00\s*-\s*19:00/gi, BRAND.hours_sun],

  // Copyright year / brand
  [/©\s*Barbershop\s*«?\s*Urban\s*»?/gi, `© ${BRAND.name}`],
  [/2019\s*[-–]\s*2026/g, `${BRAND.copyright} – 2026`],
  [/2019\s*2026/g, `${BRAND.copyright} 2026`],

  // Alt text and aria labels
  [/Barbershop\s+Urban\s+Prague/gi, BRAND.name],
  [/alt="[^"]*[Uu]rban[^"]*"/g, `alt="${BRAND.name}"`],

  // FAQ references
  [/webov[yý]ch\s+str[aá]nk[aá]ch\s+barbershopu\s+URBAN/gi, `webových stránkách ${BRAND.name}`],
  [/na\s+č[ií]sle\s+\+420\s*773\s*096\s*906/gi, `na čísle ${BRAND.phone}`],

  // Generic "URBAN" standalone (careful — only in visible text context, not CSS)
  // Only replace when surrounded by spaces/punctuation (not in URLs or class names)
  [/(?<=[\s"'>])URBAN(?=[\s"'<,.])/g, BRAND.name],
];

// ─── Fix broken image paths ───────────────────────────────────────────────────
// home page still has assets/cache/images/media/* → should be /thumb/*
function fixBrokenPaths(html) {
  // assets/cache/images/media/FILENAME → thumb/FILENAME (path-based)
  html = html.replace(
    /\/clones\/[^/]+\/assets\/cache\/images\/media\//g,
    `${BASE}/thumb/`
  );
  // Also fix any remaining assets/cache references generically
  html = html.replace(
    /\/clones\/[^/]+\/assets\/cache\/images\/[^/]+\//g,
    `${BASE}/thumb/`
  );
  return html;
}

// ─── Apply text replacements ──────────────────────────────────────────────────
function applyTextReplacements(html) {
  for (const [pattern, replacement] of TEXT_REPLACEMENTS) {
    html = html.replace(pattern, replacement);
  }
  return html;
}

// ─── SVG Logo ─────────────────────────────────────────────────────────────────
function generateLogo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" width="220" height="80">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#c9a96e"/>
      <stop offset="100%" style="stop-color:#a07840"/>
    </linearGradient>
  </defs>
  <!-- Scissors icon -->
  <g transform="translate(8,18)" fill="none" stroke="url(#g1)" stroke-width="1.8" stroke-linecap="round">
    <circle cx="7" cy="7" r="5.5"/>
    <circle cx="7" cy="33" r="5.5"/>
    <line x1="11.5" y1="4" x2="32" y2="28"/>
    <line x1="11.5" y1="36" x2="32" y2="12"/>
  </g>
  <!-- THE FADE ROOM text -->
  <text x="52" y="30" font-family="Georgia, serif" font-size="11" font-weight="700" letter-spacing="3" fill="url(#g1)">THE FADE</text>
  <text x="52" y="48" font-family="Georgia, serif" font-size="18" font-weight="700" letter-spacing="2" fill="#1a1a1a">ROOM</text>
  <!-- Tagline -->
  <line x1="52" y1="56" x2="210" y2="56" stroke="url(#g1)" stroke-width="0.8"/>
  <text x="52" y="67" font-family="Georgia, serif" font-size="7.5" letter-spacing="2.5" fill="#888">PREMIUM BARBERSHOP</text>
</svg>`;
}

// ─── Replace logo in HTML ─────────────────────────────────────────────────────
function replaceLogo(html) {
  const logoSvgPath = `${BASE}/theme/img/logo.svg`;
  // Replace <img src="...logo-1.png"...> with SVG img
  html = html.replace(
    /<img([^>]*?)src="[^"]*logo[^"]*\.png"([^>]*?)>/gi,
    (match, pre, post) => {
      // Keep width/height but update src and alt
      return `<img${pre}src="${logoSvgPath}" width="200" height="73" alt="${BRAND.name}"${post}>`;
    }
  );
  return html;
}

// ─── Download helper ──────────────────────────────────────────────────────────
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = createWriteStream(dest);
    proto.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', reject);
  });
}

// ─── OpenAI image generation ──────────────────────────────────────────────────
async function generateImage(openai, prompt, filename, size = '1792x1024') {
  console.log(`  🎨 Generuji: ${filename}`);
  console.log(`     Prompt: ${prompt.substring(0, 80)}...`);

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
      // gpt-image-1 returns base64
      const buf = Buffer.from(imageData.b64_json, 'base64');
      writeFileSync(destPath, buf);
      console.log(`     ✅ Uloženo (base64): ${filename}`);
    } else if (imageData.url) {
      await downloadFile(imageData.url, destPath);
      console.log(`     ✅ Staženo: ${filename}`);
    }
    return `${BASE}/${filename}`;
  } catch (err) {
    console.error(`     ❌ Chyba: ${err.message}`);
    return null;
  }
}

// ─── Image prompts ────────────────────────────────────────────────────────────
// All prompts are for "The Fade Room" — a premium Prague barbershop
const IMAGE_JOBS = [
  {
    filename: 'img/hero.jpg',
    size: '1536x1024',
    prompt: 'Premium barbershop interior, warm golden lighting, dark walls with wood accents, leather barber chairs, large mirrors, very professional and upscale atmosphere, Czech Republic Prague style, cinematic photograph, high-end salon, no text, no people',
  },
  {
    filename: 'img/hero-mob.jpg',
    size: '1024x1536',
    prompt: 'Premium barbershop interior portrait orientation, warm golden lighting, dark walls, leather barber chairs, professional atmosphere, cinematic photograph, no text, no people',
  },
  {
    filename: 'media/fade-01.jpg',
    size: '1024x1024',
    prompt: 'Professional barber giving a man a stylish fade haircut, close-up of the cut, sharp clippers, clean fade gradient, professional barbershop setting, warm light, photorealistic',
  },
  {
    filename: 'media/fade-02.jpg',
    size: '1024x1024',
    prompt: 'Handsome man with a fresh skin fade haircut, side profile, barbershop background, sharp clean lines, professional grooming, photorealistic portrait',
  },
  {
    filename: 'media/fade-03.jpg',
    size: '1024x1024',
    prompt: 'Barber trimming and shaping a man\'s beard with scissors, close detail shot, premium barbershop, warm professional lighting, photorealistic',
  },
  {
    filename: 'media/fade-04.jpg',
    size: '1024x1024',
    prompt: 'Man with perfectly styled pompadour haircut and trimmed beard, sitting in leather barber chair, premium barbershop setting, photorealistic portrait',
  },
  {
    filename: 'media/fade-05.jpg',
    size: '1024x1024',
    prompt: 'Close-up of professional barber tools on marble shelf — straight razor, comb, scissors, pomade jar, warm barbershop light, product still life photography',
  },
  {
    filename: 'media/fade-06.jpg',
    size: '1024x1024',
    prompt: 'Two barbers working in a modern premium barbershop, busy salon interior, multiple stations, warm lighting, professional atmosphere, wide shot photography',
  },
  {
    filename: 'media/fade-07.jpg',
    size: '1024x1024',
    prompt: 'Man receiving hot towel shave, barber applying warm foam, luxury grooming experience, premium barbershop, cinematic warm lighting, photorealistic',
  },
  {
    filename: 'media/fade-08.jpg',
    size: '1024x1024',
    prompt: 'Before and after split — left: ungroomed hair, right: perfect short fade haircut, clean professional styling, photorealistic comparison portrait',
  },
  // Thumbnails (300x300)
  {
    filename: 'thumb/gallery-01.jpg',
    size: '1024x1024',
    prompt: 'Man with perfect mid fade haircut, looking at camera, barbershop backdrop, square format portrait, photorealistic',
  },
  {
    filename: 'thumb/gallery-02.jpg',
    size: '1024x1024',
    prompt: 'Clean skin fade haircut detail, back of head, sharp lines, square format, professional barbershop photography',
  },
  {
    filename: 'thumb/gallery-03.jpg',
    size: '1024x1024',
    prompt: 'Bearded man with textured crop haircut, natural smile, square portrait, premium barbershop background',
  },
  {
    filename: 'thumb/gallery-04.jpg',
    size: '1024x1024',
    prompt: 'Man with slicked back undercut, sharp side part, square portrait, professional barbershop styling',
  },
  {
    filename: 'thumb/gallery-05.jpg',
    size: '1024x1024',
    prompt: 'Young man with buzz cut and shaped beard, square portrait, barbershop setting, professional photography',
  },
  {
    filename: 'thumb/gallery-06.jpg',
    size: '1024x1024',
    prompt: 'Barber styling man\'s hair with pomade, action shot, square format, warm barbershop lighting',
  },
  {
    filename: 'thumb/gallery-07.jpg',
    size: '1024x1024',
    prompt: 'Man with classic taper fade, clean neckline, side view, square portrait, premium barbershop',
  },
  {
    filename: 'thumb/gallery-08.jpg',
    size: '1024x1024',
    prompt: 'Premium barbershop interior corner detail, leather chair, vintage mirror, square composition',
  },
  // Promo/akce images
  {
    filename: 'img/akce/promo-1.jpg',
    size: '1536x1024',
    prompt: 'Premium barbershop promotional image, stylish man with fresh haircut holding a whiskey glass, dark luxury atmosphere, warm amber light, cinematic, no text',
  },
  {
    filename: 'img/akce/promo-2.jpg',
    size: '1536x1024',
    prompt: 'Birthday special barbershop promotion concept, elegant man being groomed, festive subtle background bokeh, luxury atmosphere, cinematic warm light, no text',
  },
];

// ─── Update HTML to use new images ───────────────────────────────────────────
function replaceImagesInHtml(html, generatedImages) {
  // Replace hero images (background-image in style)
  if (generatedImages['img/hero.jpg']) {
    html = html.replace(/url\(['"']?\/clones\/[^/]+\/img\/img-top\.jpg['"']?\)/g,
      `url('${generatedImages['img/hero.jpg']}')`);
  }
  if (generatedImages['img/hero-mob.jpg']) {
    html = html.replace(/url\(['"']?\/clones\/[^/]+\/img\/img-top-mob\.jpg['"']?\)/g,
      `url('${generatedImages['img/hero-mob.jpg']}')`);
  }

  // Replace promo/akce images
  if (generatedImages['img/akce/promo-1.jpg']) {
    html = html.replace(/url\(['"']?\/clones\/[^/]+\/img\/akce\/img-akce-2\.jpg['"']?\)/g,
      `url('${generatedImages['img/akce/promo-1.jpg']}')`);
  }
  if (generatedImages['img/akce/promo-2.jpg']) {
    html = html.replace(/url\(['"']?\/clones\/[^/]+\/img\/akce\/img-akce-3\.jpg['"']?\)/g,
      `url('${generatedImages['img/akce/promo-2.jpg']}')`);
  }

  // Replace gallery/media images — map old filenames to new gallery images
  const OLD_MEDIA = [
    'img_4890', 'img_4868', 'img_4880', 'img_4925-2',
    'img_4883-2', 'img_4885', 'img_4835-2', 'img_4982',
    'img_5053-2', 'img_5112', 'cu3a0504',
  ];
  const NEW_GALLERY = [
    'media/fade-01.jpg', 'media/fade-02.jpg', 'media/fade-03.jpg',
    'media/fade-04.jpg', 'media/fade-05.jpg', 'media/fade-06.jpg',
    'media/fade-07.jpg', 'media/fade-08.jpg',
    'media/fade-01.jpg', 'media/fade-02.jpg', 'media/fade-03.jpg',
  ];
  const NEW_THUMBS = [
    'thumb/gallery-01.jpg', 'thumb/gallery-02.jpg', 'thumb/gallery-03.jpg',
    'thumb/gallery-04.jpg', 'thumb/gallery-05.jpg', 'thumb/gallery-06.jpg',
    'thumb/gallery-07.jpg', 'thumb/gallery-08.jpg',
    'thumb/gallery-01.jpg', 'thumb/gallery-02.jpg', 'thumb/gallery-03.jpg',
  ];

  OLD_MEDIA.forEach((oldName, i) => {
    const newMedia = generatedImages[NEW_GALLERY[i]];
    const newThumb = generatedImages[NEW_THUMBS[i]];
    if (newMedia) {
      html = html.replace(
        new RegExp(`url\\(['"']?/clones/[^/]+/(?:media|assets/cache/images/media)/${oldName}[^'"\\)]*['"']?\\)`, 'g'),
        `url('${newMedia}')`
      );
    }
    if (newThumb) {
      html = html.replace(
        new RegExp(`url\\(['"']?/clones/[^/]+/thumb/${oldName}[^'"\\)]*['"']?\\)`, 'g'),
        `url('${newThumb}')`
      );
    }
  });

  return html;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🎨 Personalizace: ${cloneName} / ${tenantSlug}\n`);

  // ── KROK 1: Logo SVG ────────────────────────────────────────────────────────
  console.log('🖊️  Generuji logo SVG...');
  const logoSvg = generateLogo();
  const logoPath = join(CLONE_DIR, 'theme', 'img', 'logo.svg');
  writeFileSync(logoPath, logoSvg);
  console.log(`  ✅ Logo: public/clones/${cloneName}/theme/img/logo.svg`);

  // ── KROK 2: OpenAI images ───────────────────────────────────────────────────
  const OpenAI = (await import('/Users/apple/DEV/CRM/convee-app/node_modules/openai/index.js')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log(`\n📸 Generuji fotografie (${IMAGE_JOBS.length} obrázků přes gpt-image-1)...\n`);
  const generatedImages = {};

  for (const job of IMAGE_JOBS) {
    const localPath = await generateImage(openai, job.prompt, job.filename, job.size);
    if (localPath) generatedImages[job.filename] = localPath;
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ Vygenerováno: ${Object.keys(generatedImages).length}/${IMAGE_JOBS.length} obrázků`);

  // ── KROK 3: Update DB HTML ──────────────────────────────────────────────────
  const { Pool } = pg;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const t = await client.query("SELECT id FROM tenants WHERE slug = $1", [tenantSlug]);
    const tenantId = t.rows[0]?.id;
    if (!tenantId) throw new Error(`Tenant '${tenantSlug}' not found`);

    const sections = await client.query(
      `SELECT s.id, s.settings, p.slug FROM sections s
       JOIN pages p ON p.id = s.page_id
       WHERE s.tenant_id = $1 AND s.section_type = 'full-page-clone'`,
      [tenantId]
    );

    for (const row of sections.rows) {
      let html = row.settings.html ?? '';

      // Text replacements
      html = applyTextReplacements(html);

      // Logo replacement
      html = replaceLogo(html);

      // Fix broken image paths
      html = fixBrokenPaths(html);

      // Replace images with AI-generated ones
      html = replaceImagesInHtml(html, generatedImages);

      const ns = { ...row.settings, html };
      await client.query('UPDATE sections SET settings = $1 WHERE id = $2',
        [JSON.stringify(ns), row.id]);
      console.log(`  ✅ [${row.slug}] DB aktualizováno`);
    }

  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\n🎉 Personalizace dokončena!`);
  console.log(`   http://localhost:3015/demo/${tenantSlug}`);
  console.log(`   Vygenerované obrázky: ${Object.keys(generatedImages).length}`);
  console.log(`   Logo: /clones/${cloneName}/theme/img/logo.svg`);
}

main().catch(e => { console.error('FAILED:', e.message); console.error(e.stack); process.exit(1); });
