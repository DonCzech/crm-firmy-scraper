import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/8d3ce491-cf60-4c06-81bc-72505aca8558/scratchpad";
const [slug, token] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
await ctx.addCookies([{ name: `webero_access_${slug}`, value: token, domain: "localhost", path: "/" }]);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
await page.goto(`http://localhost:3015/demo/${slug}/studio?ts=${Date.now()}`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(1500);
// dismiss onboarding
const skip = page.getByText("Přeskočit", { exact: true }).first();
if (await skip.isVisible().catch(() => false)) { await skip.click(); await page.waitForTimeout(600); }
// open Design panel
await page.getByLabel("Design", { exact: true }).first().click().catch(async () => {
  await page.locator('[data-tour="rail-design"], [aria-label="Design"]').first().click();
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/mood-1-panel.png` });
// click Mint preset
const mint = page.getByText("Mint", { exact: true }).first();
await mint.click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/mood-2-mint.png` });
console.log("errors:", errors.length ? errors : "none");
await browser.close();
