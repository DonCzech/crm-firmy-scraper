import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV/c4fdac88-6d01-4a44-8c43-e272dca6cfb0/scratchpad";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 }, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" });
const page = await ctx.newPage();
await page.goto("https://www.marimex.cz/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);
// zkusit zavřít cookies
for (const sel of ['button:has-text("Přijmout vše")', 'button:has-text("Souhlasím")', 'button:has-text("Rozumím")', '#onetrust-accept-btn-handler']) {
  try { await page.click(sel, { timeout: 2500 }); break; } catch {}
}
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/marimex-header.png` });
// hover na první kategorii v menu
for (const sel of ['nav >> text=Bazény', 'header >> text=Bazény', 'text=Bazény']) {
  try { await page.hover(sel, { timeout: 3000 }); break; } catch {}
}
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/marimex-menu.png` });
await browser.close(); console.log("done");
