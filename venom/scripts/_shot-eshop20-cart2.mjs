import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/69c38aa9-7e6d-44b8-915f-a5d3c5ffe760/scratchpad/dedoles";
const BASE = "http://localhost:3015/demo/eshop-20-v2";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

await page.goto(BASE + "/obchod?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.evaluate(async () => {
  await fetch("/api/demo/eshop-20-v2/shop/cart/items", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant_id: 4293, qty: 1 }),
  });
});
await page.goto(BASE + "/obchod/kosik?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1500);
// zavřít cookie lištu, ať nepřekáží
await page.locator("text=Accept all").first().click().catch(() => {});
await page.waitForTimeout(400);
// toggle první doplňkové služby
await page.locator("text=Prioritní vychystání").first().click();
await page.waitForTimeout(1500);
// slevový kód
await page.fill('input[placeholder*="Slevový"]', "VYKUK");
await page.locator("button", { hasText: "Uplatnit" }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/es20-cart-interact.png`, fullPage: false, clip: { x: 900, y: 200, width: 700, height: 800 } });
await browser.close();
console.log("done");
