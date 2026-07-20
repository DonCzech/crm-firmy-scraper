import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/69c38aa9-7e6d-44b8-915f-a5d3c5ffe760/scratchpad/dedoles";
const BASE = "http://localhost:3015/demo/eshop-20-v2";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
const page = await ctx.newPage();

await page.goto(BASE + "/obchod?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.evaluate(async () => {
  await fetch("/api/demo/eshop-20-v2/shop/cart/items", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant_id: 4293, qty: 2 }),
  });
});
await page.goto(BASE + "/obchod/pokladna?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1200);
await page.locator("text=Accept all").first().click().catch(() => {});

await page.fill('input[placeholder="E-mail"]', "email@demo.cz");
await page.fill('input[placeholder="Křestní jméno"]', "Tereza");
await page.fill('input[placeholder="Příjmení"]', "Veselá");
await page.fill('input[placeholder="Adresa"]', "Vykukova 12");
await page.fill('input[placeholder="PSČ"]', "11000");
await page.fill('input[placeholder="Město"]', "Praha");
await page.fill('input[placeholder="Telefon"]', "+420704123456");
// dobírka + kurýr
await page.locator("text=Kurýr na adresu").first().click();
await page.locator("text=Platba na dobírku").first().click();
await page.waitForTimeout(300);
// souhlas
await page.locator('input[type="checkbox"]').first().check();
await page.screenshot({ path: `${OUT}/es20-order-filled.png`, fullPage: false });
// submit
await page.locator('button[type="submit"]').click();
await page.waitForURL("**/objednavka/**", { timeout: 30000 }).catch(async () => {
  console.log("no redirect, url:", page.url());
});
await page.waitForTimeout(2000);
console.log("final url:", page.url());
await page.screenshot({ path: `${OUT}/es20-order-done.png`, fullPage: true });
await browser.close();
console.log("done");
