/* Full-page screenshoty všech 20 e-shop demo tenantů pro onboarding katalog. */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const NNS = process.argv[2]
  ? process.argv[2].split(",")
  : Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0"));

const browser = await chromium.launch({
  executablePath:
    "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell",
});

for (const nn of NNS) {
  const slug = `eshop-${nn}-v2`;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:3015/demo/${slug}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(1200);
    // Projet stránku kvůli lazy-load obrázkům a animacím (guard: některé
    // šablony mají autonavigaci/carousel, který evaluate context zabije)
    try {
      await page.evaluate(async () => {
        const step = 800;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
    } catch {
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(600);
      await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    }
    await page.waitForTimeout(1500);
    const height = await page.evaluate(() =>
      Math.min(document.body.scrollHeight, 6200)
    );
    const dir = `/Users/apple/DEV/CRM/venom/public/templates/eshop-${nn}/showcase`;
    mkdirSync(dir, { recursive: true });
    await page.screenshot({
      path: `${dir}/onboarding-desktop.jpg`,
      type: "jpeg",
      quality: 72,
      clip: { x: 0, y: 0, width: 1440, height },
    });
    console.log(`OK eshop-${nn} (${height}px)`);
  } catch (e) {
    console.error(`FAIL eshop-${nn}:`, String(e).slice(0, 200));
  }
  await ctx.close();
}
await browser.close();
