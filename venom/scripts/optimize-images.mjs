/**
 * optimize-images.mjs — komprimuje AI-generované obrázky pro PageSpeed
 * Cíl: hero < 300KB, media < 200KB, thumbs < 80KB
 */
import { readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const [,, cloneName = 'fade-room'] = process.argv;
const CLONE_DIR = join(ROOT, 'public', 'clones', cloneName);

// Dynamic import of sharp (CJS module)
const sharp = (await import('sharp')).default;

const JOBS = [
  // Hero — landscape, large
  { dir: 'img', pattern: /hero.*\.jpg$/, width: 1440, quality: 82 },
  { dir: 'img', pattern: /hero-mob.*\.jpg$/, width: 768, quality: 80 },
  // Promo/akce
  { dir: 'img/akce', pattern: /\.jpg$/, width: 1440, quality: 80 },
  // Original hero backup
  { dir: 'img', pattern: /img-top.*\.jpg$/, width: 1440, quality: 75 },
  // Gallery full size
  { dir: 'media', pattern: /\.jpg$/, width: 900, quality: 78 },
  // Thumbnails
  { dir: 'thumb', pattern: /\.jpg$/, width: 400, quality: 72 },
];

let totalBefore = 0, totalAfter = 0, count = 0;

async function optimizeDir(dir, pattern, width, quality) {
  const fullDir = join(CLONE_DIR, dir);
  let files;
  try { files = readdirSync(fullDir); } catch { return; }

  for (const file of files) {
    if (!pattern.test(file)) continue;
    const filePath = join(fullDir, file);
    const stat = statSync(filePath);
    totalBefore += stat.size;

    try {
      // Read → resize → compress → overwrite
      const buf = await sharp(filePath)
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toBuffer();

      const { writeFileSync } = await import('fs');
      writeFileSync(filePath, buf);
      totalAfter += buf.length;
      count++;

      const ratio = Math.round((1 - buf.length / stat.size) * 100);
      const kb = Math.round(buf.length / 1024);
      console.log(`  ✅ ${dir}/${file}: ${Math.round(stat.size/1024)}KB → ${kb}KB (-${ratio}%)`);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
      totalAfter += stat.size;
    }
  }
}

console.log(`\n🗜️  Optimalizace obrázků: public/clones/${cloneName}\n`);

for (const job of JOBS) {
  await optimizeDir(job.dir, job.pattern, job.width, job.quality);
}

const savedKB = Math.round((totalBefore - totalAfter) / 1024);
const savedPct = Math.round((1 - totalAfter / totalBefore) * 100);
console.log(`\n✅ ${count} souborů | Ušetřeno: ${savedKB}KB (${savedPct}%)`);
console.log(`   Před: ${Math.round(totalBefore/1024)}KB → Po: ${Math.round(totalAfter/1024)}KB`);
