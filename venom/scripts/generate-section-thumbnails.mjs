#!/usr/bin/env node
/**
 * Generate WebP thumbnails for every section variant in SECTION_VARIANTS.
 * Output: public/section-thumbs/{type}/{variant}.webp (800x500, quality 78).
 *
 * Usage:
 *   1. Start dev server in another terminal:   npm run dev          (default :3000 or :3002)
 *   2. Run this script:                        npm run thumbs       (defaults to :3002)
 *      or:                                     PORT=3000 node scripts/generate-section-thumbnails.mjs
 *      or single type:                         TYPE=hero node scripts/generate-section-thumbnails.mjs
 *
 * Why a long-running script and not a build-time hook?
 *  - 785 variants × ~3s each = ~40 min cold. Re-running for one type
 *    is a daily reality; keeping it explicit is friendlier than baking
 *    it into `next build`.
 *  - Each variant ships its own webfonts and lazy-loaded images. We
 *    must wait for network idle, not just DOMContentLoaded, otherwise
 *    half the shots are Times-New-Roman fallbacks.
 *
 * The companion preview route is at /studio/preview/section?type=&variant=
 * (server component that wraps SectionRenderer in isolation).
 */

import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdir, access, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUT_DIR   = join(REPO_ROOT, "public", "section-thumbs");
const PORT      = process.env.PORT || "3002";
const BASE      = `http://localhost:${PORT}`;
const TYPE_ONLY = process.env.TYPE || null;            // restrict to one section type
const FORCE     = process.env.FORCE === "1";           // overwrite existing thumbnails
const VIEWPORT  = { width: 1280, height: 800 };
const SHOT_SIZE = { width: 800, height: 500 };

/* ── Load SECTION_VARIANTS ────────────────────────────────────────────── */

// Primary: fetch from /api/studio/thumb-variants (dev server must be running).
// This is reliable — no TypeScript parsing or tsx required.
// Fallback: regex parse of the .ts source (vanilla checkout, no tsx).
async function loadVariants() {
  // Try the API endpoint first (requires dev server already running — which
  // we check below anyway, so this is always available when the script runs).
  try {
    const res = await fetch(`${BASE}/api/studio/thumb-variants`);
    if (res.ok) {
      const list = await res.json();
      // Convert flat [{type, variant}] to {type: [{key}]} for compat
      const out = {};
      for (const { type, variant } of list) {
        (out[type] ??= []).push({ key: variant });
      }
      return out;
    }
  } catch { /* fall through to regex */ }

  const { readFile } = await import("node:fs/promises");
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const srcPath = join(REPO_ROOT, "src/sections/variants.ts");

  // Try tsx (if installed as devDep)
  try {
    require("tsx/cjs");
     
    const mod = require(srcPath);
    return mod.SECTION_VARIANTS;
  } catch { /* fall through */ }

  // Regex extraction — keys are quoted ASCII slugs grouped under type buckets.
  const src = await readFile(srcPath, "utf8");
  const out = {};
  const typeRe = /^\s+([a-z][a-z-]*):\s*\[/gm;
  const keyRe  = /key:\s*"([^"]+)"/g;
  const types = [...src.matchAll(typeRe)];
  for (let i = 0; i < types.length; i++) {
    const type = types[i][1];
    const start = types[i].index + types[i][0].length;
    const end = i + 1 < types.length ? types[i + 1].index : src.length;
    const block = src.slice(start, end);
    const keys = [...block.matchAll(keyRe)].map(m => m[1]);
    out[type] = keys.map(k => ({ key: k }));
  }
  return out;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function pingServer() {
  try {
    const res = await fetch(BASE, { method: "HEAD" });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

/* ── Main ─────────────────────────────────────────────────────────────── */

async function main() {
  if (!(await pingServer())) {
    console.error(`✗ Dev server is not reachable at ${BASE}.`);
    console.error(`  Start it first:  npm run dev   (default port 3002)`);
    process.exit(1);
  }

  const variants = await loadVariants();
  const queue = [];
  for (const [type, list] of Object.entries(variants)) {
    if (TYPE_ONLY && type !== TYPE_ONLY) continue;
    for (const v of list) queue.push({ type, variant: v.key });
  }
  console.log(`▸ Total variants: ${queue.length}${TYPE_ONLY ? ` (type=${TYPE_ONLY})` : ""}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  // Block heavy assets that don't change the visual outcome
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (/\.(woff2?|ttf|otf)$/i.test(url)) return route.continue();
    if (/google-analytics|gtag|fbevents|hotjar/.test(url)) return route.abort();
    return route.continue();
  });

  let ok = 0, skip = 0, fail = 0;
  for (let i = 0; i < queue.length; i++) {
    const { type, variant } = queue[i];
    const outDir = join(OUT_DIR, type);
    const outFile = join(outDir, `${variant}.webp`);
    if (!FORCE && (await exists(outFile))) { skip++; continue; }
    await mkdir(outDir, { recursive: true });

    const url = `${BASE}/studio/preview/section?type=${encodeURIComponent(type)}&variant=${encodeURIComponent(variant)}`;
    try {
      // domcontentloaded + fixed settle = robust for autoplay/video heroes
      // that never reach networkidle. Fonts/images that arrive later are
      // captured by the 1500ms wait below.
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25_000 });
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      await page.waitForTimeout(1500);

      // Navbar/footer variants are typically position:fixed and report 0
      // height in isolation. Force a min-height on the preview wrapper so
      // we always have something to clip.
      if (type === "navbar" || type === "footer") {
        await page.evaluate(() => {
          const el = document.querySelector('[data-section-preview]');
          if (el) (el).style.minHeight = "120px";
        });
        await page.waitForTimeout(150);
      }

      const handle = await page.$('[data-section-preview] section, [data-section-preview] header, [data-section-preview] footer, [data-section-preview] nav, [data-section-preview]');
      if (!handle) throw new Error("section element not found");

      const box = await handle.boundingBox();
      if (!box || box.height < 8) throw new Error("zero-height bounding box");
      // Playwright 1.59 only supports png/jpeg. We screenshot as a PNG
      // buffer, then pipe through sharp to produce the WebP we actually
      // want. The clip width matches the viewport so all thumbnails
      // share the same aspect ratio.
      const pngBuf = await page.screenshot({
        type: "png",
        clip: {
          x: 0,
          y: box.y,
          width: VIEWPORT.width,
          height: Math.min(box.height, SHOT_SIZE.height * (VIEWPORT.width / SHOT_SIZE.width)),
        },
      });
      const webpBuf = await sharp(pngBuf)
        .resize(SHOT_SIZE.width, SHOT_SIZE.height, { fit: "cover", position: "top" })
        .webp({ quality: 78, effort: 4 })
        .toBuffer();
      await writeFile(outFile, webpBuf);
      ok++;
      if (ok % 10 === 0 || i === queue.length - 1) {
        console.log(`  [${i + 1}/${queue.length}] ${type}/${variant} — ok=${ok} skip=${skip} fail=${fail}`);
      }
    } catch (err) {
      fail++;
      console.warn(`  ✗ ${type}/${variant}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\n✓ Done. ok=${ok}, skipped(existing)=${skip}, failed=${fail}`);
  console.log(`  Output: ${OUT_DIR}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch(err => { console.error(err); process.exit(1); });
