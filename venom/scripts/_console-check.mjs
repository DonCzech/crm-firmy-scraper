// Usage: node scripts/_console-check.mjs <slug> [subpath] — vypíše pageerror/console.error/warning
import { chromium } from "playwright-core";
const [slug, subpath = ""] = process.argv.slice(2);
const URL = `http://localhost:3015/demo/${slug}${subpath}`;
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const msgs = [];
page.on("pageerror", (e) => msgs.push("PAGEERROR: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") msgs.push(m.type().toUpperCase() + ": " + m.text().slice(0, 300));
});
await page.goto(URL + "?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1500);
// horizontální overflow na klíčových šířkách
for (const w of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(350);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (over > 1) msgs.push(`OVERFLOW @${w}px: +${over}px`);
}
await browser.close();
console.log(msgs.length ? msgs.join("\n") : "ČISTÉ — 0 chyb, 0 overflow");
