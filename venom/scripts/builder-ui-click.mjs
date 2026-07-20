/** Klikací test: vložení kurátorované sekce + prvku, sběr console chyb. */
import { chromium } from "playwright-core";
import { readFileSync } from "fs";
import pg from "pg";

const SLUG = "builder-od-nuly";
const BASE = "http://localhost:3015";
const TOKEN = process.argv[2];

const env = readFileSync("/Users/apple/DEV/CRM/venom/.env.local", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^"|"$/g, "");
const db = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await db.connect();
const tenant = (await db.query("SELECT id FROM tenants WHERE slug=$1", [SLUG])).rows[0];
const count = async (type) =>
  Number((await db.query("SELECT count(*) c FROM sections WHERE tenant_id=$1 AND section_type=$2", [tenant.id, type])).rows[0].c);

const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
await ctx.addCookies([{ name: `webero_access_${SLUG}`, value: TOKEN, url: BASE }]);
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 300)));

await page.goto(`${BASE}/demo/${SLUG}/admin`, { waitUntil: "networkidle", timeout: 90000 });
for (const label of ["Přeskočit", "Zavřít", "Rozumím"]) {
  const b = page.getByRole("button", { name: label }).first();
  if (await b.isVisible().catch(() => false)) await b.click().catch(() => {});
}
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// ── vložení kurátorované sekce (hero default) ───────────────────────────────
const heroBefore = await count("hero");
await page.locator('[data-tour-id="wix-add-button"]').click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Sekce" }).first().click();
await page.waitForTimeout(1000);
await page.getByRole("button", { name: /Banner s textem a tlačítkem/ }).first().click();
await page.waitForTimeout(2500);
const heroAfter = await count("hero");
console.log(`${heroAfter === heroBefore + 1 ? "✅" : "❌"} curated click insert: hero ${heroBefore} → ${heroAfter}`);

// ── vložení prvku (Nadpis → freeform seed) ──────────────────────────────────
const ffBefore = await count("freeform");
await page.locator('[data-tour-id="wix-add-button"]').click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Prvky" }).first().click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: /^Nadpis$/ }).first().click().catch(async () => {
  await page.locator("button", { hasText: "Nadpis" }).first().click();
});
await page.waitForTimeout(2500);
const ffAfter = await count("freeform");
const ffRow = (await db.query(
  "SELECT settings FROM sections WHERE tenant_id=$1 AND section_type='freeform' ORDER BY id DESC LIMIT 1", [tenant.id],
)).rows[0];
const seeded = ffRow && ffRow.settings?.content?.elements?.[0]?.type === "heading";
console.log(`${ffAfter === ffBefore + 1 && seeded ? "✅" : "❌"} element click seeds freeform: ${ffBefore} → ${ffAfter}, first el: ${ffRow?.settings?.content?.elements?.[0]?.type}`);

console.log("console errors:", errors.length ? errors.slice(0, 6) : "none");
await browser.close();
await db.end();
