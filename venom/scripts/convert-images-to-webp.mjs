#!/usr/bin/env node
/**
 * Bulk-convert every PNG/JPG/JPEG under public/ to WebP (sharp).
 *
 * Defaults:
 *   - Preserves originals. Pass --replace to delete the source after a
 *     successful conversion.
 *   - Skips an image if a same-named .webp already exists and is newer.
 *   - Quality 82 (visually lossless for photographs at typical hero sizes).
 *
 * Why we don't just rely on next/image:
 *   - 90+ templates ship hardcoded <img src=".../foo.jpg">, not <Image>,
 *     because variant components are designed to be portable and AVIF/WebP
 *     pipelines don't reach raw <img>. Pre-converting halves storage and
 *     payload for the 2500+ template assets.
 *
 * Usage:
 *   node scripts/convert-images-to-webp.mjs                     # additive (safe)
 *   node scripts/convert-images-to-webp.mjs --replace           # delete originals
 *   node scripts/convert-images-to-webp.mjs --dir public/assets # restrict scope
 *   QUALITY=88 node scripts/convert-images-to-webp.mjs
 */

import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const argv = new Set(process.argv.slice(2));
const REPLACE = argv.has("--replace");
const dirArg = process.argv.find(a => a.startsWith("--dir="));
const ROOT = dirArg ? join(REPO_ROOT, dirArg.slice("--dir=".length)) : join(REPO_ROOT, "public");
const QUALITY = Number(process.env.QUALITY || 82);

// Paths we never touch — third-party clones we mirror verbatim for parity
// testing, and the section-thumbs directory the other script owns.
const SKIP_DIRS = new Set([
  join(REPO_ROOT, "public/clones"),       // 1:1 mirrors of source sites
  join(REPO_ROOT, "public/section-thumbs"), // already webp
]);

const EXT_RE = /\.(png|jpe?g)$/i;

async function walk(dir, out = []) {
  if (SKIP_DIRS.has(dir)) return out;
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else if (e.isFile() && EXT_RE.test(e.name)) out.push(full);
  }
  return out;
}

async function isStaler(src, webp) {
  try {
    const [a, b] = await Promise.all([stat(src), stat(webp)]);
    return a.mtimeMs > b.mtimeMs;
  } catch {
    return true; // webp doesn't exist
  }
}

async function main() {
  console.log(`▸ Scanning ${ROOT} for PNG/JPG/JPEG…`);
  const files = await walk(ROOT);
  console.log(`▸ Found ${files.length} candidates (replace=${REPLACE}, quality=${QUALITY})`);

  // Modest concurrency — sharp is CPU-bound; libvips already uses internal
  // threads. 4 parallel decodes on a typical laptop saturates without
  // thrashing.
  const CONCURRENCY = 4;
  let i = 0, ok = 0, skip = 0, fail = 0, savedBytes = 0;

  async function worker() {
    while (i < files.length) {
      const idx = i++;
      const src = files[idx];
      const webp = src.replace(EXT_RE, ".webp");
      try {
        if (!(await isStaler(src, webp))) { skip++; continue; }

        await sharp(src, { failOn: "none" })
          .rotate()                     // honour EXIF orientation
          .webp({ quality: QUALITY, effort: 4 })
          .toFile(webp);

        const [srcStat, dstStat] = await Promise.all([stat(src), stat(webp)]);
        savedBytes += Math.max(0, srcStat.size - dstStat.size);

        if (REPLACE) await unlink(src);
        ok++;

        if ((ok + fail) % 50 === 0) {
          const mb = (savedBytes / 1024 / 1024).toFixed(1);
          console.log(`  [${idx + 1}/${files.length}] ok=${ok} skip=${skip} fail=${fail} saved≈${mb} MB`);
        }
      } catch (err) {
        fail++;
        console.warn(`  ✗ ${src}: ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const mb = (savedBytes / 1024 / 1024).toFixed(1);
  console.log(`\n✓ Done. converted=${ok}, skipped(fresh)=${skip}, failed=${fail}`);
  console.log(`  Bytes saved: ≈${mb} MB${REPLACE ? "  (originals deleted)" : "  (originals kept — re-run with --replace to remove)"}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch(err => { console.error(err); process.exit(1); });
