import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/69c38aa9-7e6d-44b8-915f-a5d3c5ffe760/scratchpad/dedoles";
const BASE = "http://localhost:3015/demo/eshop-20-v2";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

// 1) Add two products via detail page quick flow: use API from page context (shares cookies)
await page.goto(BASE + "/obchod?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
const added = await page.evaluate(async () => {
  const api = "/api/demo/eshop-20-v2/shop";
  const results = [];
  for (const [variantId, qty] of [[4293, 1], [4296, 2]]) {
    const res = await fetch(`${api}/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variantId, qty }),
    });
    results.push({ variantId, status: res.status });
  }
  return results;
});
console.log(JSON.stringify(added));

// 2) Cart page desktop
await page.goto(BASE + "/obchod/kosik?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}/es20-cart-desktop.png`, fullPage: true });

// 3) Mobile
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/es20-cart-mobile.png`, fullPage: true });

await browser.close();
console.log("done");
