/** Vizuální ověření nového Add-Section panelu (Doporučené / Ze šablon). */
import { chromium } from "playwright-core";

const SLUG = "builder-od-nuly";
const BASE = "http://localhost:3015";
const TOKEN = process.argv[2];
const OUT = process.argv[3] ?? "/tmp";

const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
await ctx.addCookies([{ name: `webero_access_${SLUG}`, value: TOKEN, url: BASE }]);
const page = await ctx.newPage();

await page.addInitScript(() => { try { localStorage.removeItem("venom-studio.editor-theme"); } catch {} });
await page.goto(`${BASE}/demo/${SLUG}/admin`, { waitUntil: "networkidle", timeout: 90000 });
await page.screenshot({ path: `${OUT}/01-studio.png` });

// Zavři onboarding tour / uvítací modal, pokud blokuje
for (const label of ["Přeskočit", "Přeskočit prohlídku", "Zavřít", "Rozumím", "Začít"]) {
  const b = page.getByRole("button", { name: label }).first();
  if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await page.waitForTimeout(400); }
}
await page.keyboard.press("Escape");
await page.waitForTimeout(500);

// Otevři + Přidat → Sekce
const addBtn = page.locator('[data-tour-id="wix-add-button"]');
await addBtn.click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/02-popover.png` });
await page.getByRole("button", { name: "Sekce", exact: false }).first().click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/03-sections-curated.png`, fullPage: false });

// Přepni na „Ze šablon"
await page.getByRole("button", { name: /Ze šablon/ }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/04-sections-all.png` });

// Kategorie Hlavička
await page.getByRole("button", { name: "Hlavička" }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/05-header-category.png` });

// Prvky tab
await page.getByRole("button", { name: "Prvky", exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/06-elements.png` });

await browser.close();
console.log("screenshots saved to", OUT);
