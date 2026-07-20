import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV/549cb32d-9054-4959-9215-619b49a6d840/scratchpad";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1470, height: 1050 } });
const page = await ctx.newPage();
for (const [slug, f] of [["kontakt","kontakt"],["o-nas","onas"],["doprava","doprava"]]) {
  await page.goto(`http://localhost:3015/demo/eshop-13-v2/${slug}?ts=` + Date.now(), { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(4000);
  const btn = page.getByRole("button", { name: /Přijmout vše|Accept all/ }).first();
  if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); await page.waitForTimeout(300); }
  await page.screenshot({ path: `${OUT}/es13-page-${f}.png` });
}
await browser.close(); console.log("done");
