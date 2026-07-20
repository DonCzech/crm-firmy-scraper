// Showcase screenshoty pro onboarding katalog eshop-13 (LUNELA).
// Spouštět ze scripts/: node _shot-eshop13-showcase.mjs
import { chromium } from "playwright-core";
import { execSync } from "node:child_process";
import fs from "node:fs";

const EXE = "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const BASE = "http://localhost:3015/demo/eshop-13-v2";
const OUT = "/Users/apple/DEV/CRM/venom/public/templates/eshop-13/showcase";
fs.mkdirSync(OUT, { recursive: true });

async function dismissOverlays(page) {
  const btn = page.getByRole("button", { name: /Přijmout vše|Accept all/ }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click().catch(() => {});
    await page.waitForTimeout(400);
  }
}

const browser = await chromium.launch({ executablePath: EXE });

async function shoot(viewport, file, { fullPage = false, clipHeight = null } = {}) {
  const page = await browser.newPage({ viewport });
  await page.goto(BASE + "?ts=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(4000);
  await dismissOverlays(page);
  await page.waitForTimeout(800);
  const png = `${OUT}/_tmp.png`;
  if (clipHeight) {
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: viewport.width, height: clipHeight } });
  } else {
    await page.screenshot({ path: png, fullPage });
  }
  execSync(`cwebp -q 82 "${png}" -o "${OUT}/${file}" 2>/dev/null || sips -s format webp "${png}" --out "${OUT}/${file}"`);
  fs.rmSync(png, { force: true });
  await page.close();
  console.log("✓", file);
}

await shoot({ width: 1440, height: 960 }, "desktop-hero.webp", { clipHeight: 960 });
await shoot({ width: 1440, height: 960 }, "desktop-full.webp", { fullPage: true });
await shoot({ width: 390, height: 844 }, "mobile-hero.webp", { clipHeight: 844 });

await browser.close();
console.log("done");
