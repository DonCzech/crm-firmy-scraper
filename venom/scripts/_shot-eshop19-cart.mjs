import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/7ec14c67-ee68-443c-861e-34e686cfd306/scratchpad";
const B = "http://localhost:3015/demo/eshop-19-v2";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
// přidat produkt do košíku z detailu
await page.goto(B + "/obchod/kvadrit-prickovka-p2-500-100?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 120000 });
await page.click(".es19d-buy");
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/es19-cart-drawer.png` });
// stránka košíku
await page.goto(B + "/obchod/kosik?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/es19-cart.png`, fullPage: true });
await browser.close(); console.log("done");
