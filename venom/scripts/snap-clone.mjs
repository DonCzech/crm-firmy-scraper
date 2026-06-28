#!/usr/bin/env node
// scripts/snap-clone.mjs <original-slug>
//
// Playwright snapshot clone tenantu (/demo/<slug>-demo) ve 2 viewportech.
// Výstup: template-lab/audits/<slug>/screenshots/clone-{1440,375}.png
//                                            + clone-section-<i>-{1440,375}.png
//
// Per-section screenshot: detekuje sekce přes <section data-section-index="N">
// nebo přes pořadí <section> elementů (heuristika). Pokud template nemá
// data-section-index, ulož jen full-page a sekce bude muset Sonnet vyříznout.

import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/snap-clone.mjs <original-slug>");
  process.exit(2);
}

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const BASE_URL = process.env.VENOM_BASE_URL || "http://localhost:3015";
const outDir = join(ROOT, "template-lab/audits", slug, "screenshots");
await mkdir(outDir, { recursive: true });

const url = `${BASE_URL}/demo/${slug}-demo`;
console.log(`▶ Snap clone: ${url}`);

// Najdi systémový Chrome (playwright-core neinstaluje browser sám)
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
});

try {
  for (const vw of [1440, 375]) {
    const ctx = await browser.newContext({
      viewport: { width: vw, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(800); // animace / lazy load
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

    // Full page
    const fullPath = join(outDir, `clone-${vw}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`  ✓ ${fullPath}`);

    // Per-section (data-section-index priority, fallback na <section>)
    // Detect + screenshot via element handles (avoids Playwright clip coords issues).
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
      const path_ = join(outDir, `clone-section-${i}-${vw}.png`);
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

console.log("✅ Clone snapshot DONE");
