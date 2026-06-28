#!/usr/bin/env node
// scripts/snap-engine.mjs <engine-slug> [section-index]
//
// Playwright snapshot engine tenantu (/demo/<engine-slug>-v2).
// Bez section-index: full-page + všechny sekce.
// S section-index: jen ta sekce + full-page (rychlejší iterace).
//
// Výstup: template-lab/audits/<engine-slug>/section-<i>/engine-{1440,375}.png
//      a template-lab/audits/<engine-slug>/screenshots/engine-{1440,375}.png

import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const slug = process.argv[2];
const sectionArg = process.argv[3];
if (!slug) {
  console.error("Usage: node scripts/snap-engine.mjs <engine-slug> [section-index]");
  process.exit(2);
}

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const BASE_URL = process.env.VENOM_BASE_URL || "http://localhost:3015";
const url = `${BASE_URL}/demo/${slug}-v2`;
console.log(`▶ Snap engine: ${url}`);

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  for (const vw of [1440, 375]) {
    const ctx = await browser.newContext({
      viewport: { width: vw, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(800);
    // Scroll through page to measure all sections (handles lazy-render + below-fold sections)
    await page.evaluate(async () => {
      const totalH = document.documentElement.scrollHeight;
      const step = window.innerHeight;
      for (let y = 0; y <= totalH; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);

    const fullDir = join(ROOT, "template-lab/audits", slug, "screenshots");
    await mkdir(fullDir, { recursive: true });
    const fullPath = join(fullDir, `engine-${vw}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`  ✓ ${fullPath}`);

    const handles = await page.$$("header, nav, [data-section-index], section, footer");
    let auto = 0;
    for (const h of handles) {
      const info = await h.evaluate((el) => {
        if (el.tagName.toLowerCase() === "nav" && el.closest("header")) return null;
        const r = el.getBoundingClientRect();
        if (r.height < 40) return null;
        return {
          idx: el.getAttribute("data-section-index"),
          name:
            el.getAttribute("data-section-name") ||
            el.tagName.toLowerCase() +
              (el.id ? `#${el.id}` : el.className ? `.${(el.className + "").split(" ")[0]}` : ""),
        };
      });
      if (!info) continue;
      auto++;
      const i = info.idx ? Number(info.idx) : auto;
      if (sectionArg && i !== Number(sectionArg)) continue;
      const secDir = join(ROOT, "template-lab/audits", slug, `section-${i}`);
      await mkdir(secDir, { recursive: true });
      const path_ = join(secDir, `engine-${vw}.png`);
      try {
        await h.scrollIntoViewIfNeeded();
        await page.waitForTimeout(120);
        await h.screenshot({ path: path_ });
        console.log(`    ✓ section ${i} (${info.name}) → ${path_}`);
      } catch (e) {
        console.warn(`    ⚠ section ${i} screenshot failed: ${e.message.slice(0, 100)}`);
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log("✅ Engine snapshot DONE");
