// Usage: node scripts/_shot-studio.mjs <slug> <token> <outPrefix>
import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/8e7241b1-e9c0-4afd-a9d1-2820c22ee3ee/scratchpad";
const [slug, token, prefix] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
await ctx.addCookies([{ name: `webero_access_${slug}`, value: token, domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 200)); });
await page.goto(`http://localhost:3015/demo/${slug}/studio?ts=${Date.now()}`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/${prefix}-studio.png` });
console.log("errors:", errors.length ? errors.slice(0, 10) : "none");
await browser.close();
