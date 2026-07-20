import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/69c38aa9-7e6d-44b8-915f-a5d3c5ffe760/scratchpad/dedoles";
const BASE = "http://localhost:3015/demo/eshop-20-v2";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

// Add items
await page.goto(BASE + "/obchod?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.evaluate(async () => {
  const api = "/api/demo/eshop-20-v2/shop";
  await fetch(`${api}/cart/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variant_id: 4293, qty: 1 }) });
  await fetch(`${api}/cart/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variant_id: 4296, qty: 2 }) });
});

// Desktop checkout
await page.goto(BASE + "/obchod/pokladna?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/es20-checkout-desktop.png`, fullPage: true });

// Mobile
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/es20-checkout-mobile.png`, fullPage: true });

await browser.close();
console.log("done");
