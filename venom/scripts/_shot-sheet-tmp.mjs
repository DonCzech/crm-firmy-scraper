import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const page = await (await browser.newContext({ viewport: { width: 1560, height: 1200 } })).newPage();
await page.goto("file:///private/tmp/claude-501/-Users-apple-DEV/c4fdac88-6d01-4a44-8c43-e272dca6cfb0/scratchpad/contact-sheet.html", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: "/private/tmp/claude-501/-Users-apple-DEV/c4fdac88-6d01-4a44-8c43-e272dca6cfb0/scratchpad/contact-sheet.png", fullPage: true });
await browser.close(); console.log("done");
