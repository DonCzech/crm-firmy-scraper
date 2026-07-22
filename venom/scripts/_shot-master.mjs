// Usage: node scripts/_shot-master.mjs <slug> <outPrefix> [path]
import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/8e7241b1-e9c0-4afd-a9d1-2820c22ee3ee/scratchpad";
const [slug, prefix, subpath = ""] = process.argv.slice(2);

async function autoScroll(pg) {
  await pg.evaluate(async () => {
    const step = 400;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
    window.scrollTo(0, 0);
  });
  await pg.waitForTimeout(900);
}
const URL = `http://localhost:3015/demo/${slug}${subpath}`;
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(URL + "?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1200);
// POZOR: šablony se scroll-reveal (IntersectionObserver) mají obsah opacity:0, dokud
// nevstoupí do viewportu. Bez proscrollování vyfotí fullPage prázdné barevné bloky.
await autoScroll(page);
await page.screenshot({ path: `${OUT}/${prefix}-desktop.png`, fullPage: true });
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const mp = await mob.newPage();
await mp.goto(URL + "?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await mp.waitForTimeout(1200);
await autoScroll(mp);
await mp.screenshot({ path: `${OUT}/${prefix}-mobile.png`, fullPage: true });
await browser.close();
console.log("done", URL);
