import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV/c4fdac88-6d01-4a44-8c43-e272dca6cfb0/scratchpad";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 } })).newPage();
await page.goto("http://localhost:3015/demo/eshop-14-v2/kontakt?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 120000 });
await page.screenshot({ path: `${OUT}/es14-kontakt.png` });
await browser.close(); console.log("done");
