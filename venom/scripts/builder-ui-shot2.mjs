/** Ověření light theme: „Kam vložit?" popover + stock ilustrace + vložení. */
import { chromium } from "playwright-core";
import { readFileSync } from "fs";
import pg from "pg";

const SLUG = "builder-od-nuly";
const BASE = "http://localhost:3015";
const TOKEN = process.argv[2];
const OUT = process.argv[3] ?? "/tmp";

const env = readFileSync("/Users/apple/DEV/CRM/venom/.env.local", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^"|"$/g, "");
const db = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await db.connect();
const tenant = (await db.query("SELECT id FROM tenants WHERE slug=$1", [SLUG])).rows[0];

const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
await ctx.addCookies([{ name: `webero_access_${SLUG}`, value: TOKEN, url: BASE }]);
const page = await ctx.newPage();
await page.addInitScript(() => { try { localStorage.removeItem("venom-studio.editor-theme"); } catch {} });

await page.goto(`${BASE}/demo/${SLUG}/admin`, { waitUntil: "networkidle", timeout: 90000 });
for (const label of ["Přeskočit", "Zavřít", "Rozumím"]) {
  const b = page.getByRole("button", { name: label }).first();
  if (await b.isVisible().catch(() => false)) await b.click().catch(() => {});
}
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// „Kam vložit?" — klik na quick-add kartu v levém panelu (LayersPanel)
const heroCard = page.locator('button[aria-label="Hero"]').first();
if (await heroCard.isVisible().catch(() => false)) {
  await heroCard.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/07-kam-vlozit-light.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
} else {
  console.log("hero quick-add karta nenalezena — přeskakuji");
}

// Stock ilustrace: otevři Prvky → Stock, screenshot, vlož jednu
const ffBefore = Number((await db.query("SELECT count(*) c FROM sections WHERE tenant_id=$1 AND section_type='freeform'", [tenant.id])).rows[0].c);
await page.locator('[data-tour-id="wix-add-button"]').click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Prvky" }).first().click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Stock" }).first().click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/08-stock-illustrations.png` });
await page.getByRole("button", { name: /Týmová práce/ }).first().click();
await page.waitForTimeout(2500);
const ffAfter = Number((await db.query("SELECT count(*) c FROM sections WHERE tenant_id=$1 AND section_type='freeform'", [tenant.id])).rows[0].c);
const row = (await db.query("SELECT settings FROM sections WHERE tenant_id=$1 AND section_type='freeform' ORDER BY id DESC LIMIT 1", [tenant.id])).rows[0];
const el = row?.settings?.content?.elements?.[0];
console.log(`${ffAfter === ffBefore + 1 && el?.type === "image" && String(el?.src).includes("undraw") ? "✅" : "❌"} stock illustration insert: ${ffBefore}→${ffAfter}, el=${el?.type}, src=${el?.src}`);

await page.screenshot({ path: `${OUT}/09-after-insert.png` });
await browser.close();
await db.end();
console.log("done");
