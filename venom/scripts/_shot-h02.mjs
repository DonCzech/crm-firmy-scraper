// Usage: node scripts/_shot-master.mjs <slug> <outPrefix> [path]
import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/6f95b1f2-1941-40e9-9800-bc8a7ffc209c/scratchpad";
const [slug, prefix, subpath = ""] = process.argv.slice(2);
const URL = `http://localhost:3015/demo/${slug}${subpath}`;
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(URL + "?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/${prefix}-desktop.png`, fullPage: true });
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const mp = await mob.newPage();
await mp.goto(URL + "?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await mp.waitForTimeout(1200);
await mp.screenshot({ path: `${OUT}/${prefix}-mobile.png`, fullPage: true });
await browser.close();
console.log("done", URL);
