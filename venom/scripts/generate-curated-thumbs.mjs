#!/usr/bin/env node
/**
 * Doplnění thumbnailů pro kurátorované varianty (src/sections/curated.ts),
 * které nejsou v SECTION_VARIANTS a hlavní generátor je proto přeskočí.
 * Stejné parametry jako generate-section-thumbnails.mjs (800×500 WebP q78).
 *
 * Usage: PORT=3015 node scripts/generate-curated-thumbs.mjs
 */
import { chromium } from "playwright-core";
import sharp from "sharp";
import { readFile, mkdir, access, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = process.env.PORT || "3015";
const BASE = `http://localhost:${PORT}`;
const FORCE = process.env.FORCE === "1";
const ONLY = process.env.ONLY || null; // "type/variant,type/variant"
const EXECUTABLE = "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell";

const src = await readFile(join(ROOT, "src/sections/curated.ts"), "utf8");
const TENANT_PIN = { "gallery/gallery-universal": "photo-01-demo", "faq/accordion": "demo-wellness" };
const entries = [...src.matchAll(/type: "([^"]+)", variant: "([^"]+)"/g)].map((m) => ({ type: m[1], variant: m[2] }));

const todo = [];
for (const e of entries) {
  const out = join(ROOT, "public/section-thumbs", e.type, `${e.variant}.webp`);
  const exists = await access(out).then(() => true, () => false);
  if (ONLY && !ONLY.split(",").includes(`${e.type}/${e.variant}`)) continue;
  if (!exists || FORCE) todo.push({ ...e, out });
}
console.log(`curated: ${entries.length}, to generate: ${todo.length}`);
if (!todo.length) process.exit(0);

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();

for (const t of todo) {
  const pin = TENANT_PIN[`${t.type}/${t.variant}`];
  const url = `${BASE}/studio/preview/section?type=${encodeURIComponent(t.type)}&variant=${encodeURIComponent(t.variant)}${pin ? `&tenant=${pin}` : ""}`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
    // lazy-load + reveal-on-scroll: projeď stránku dolů a zpět
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1400);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 800 } });
    const webp = await sharp(png).resize(800, 500, { fit: "cover", position: "top" }).webp({ quality: 78 }).toBuffer();
    await mkdir(dirname(t.out), { recursive: true });
    await writeFile(t.out, webp);
    console.log(`✅ ${t.type}/${t.variant}`);
  } catch (e) {
    console.log(`❌ ${t.type}/${t.variant}: ${String(e).slice(0, 120)}`);
  }
}
await browser.close();
