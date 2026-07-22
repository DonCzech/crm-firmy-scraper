/**
 * Dofotí chybějící celostránkové náhledy šablon do
 * public/templates/<key>/showcase/desktop-full.webp (zdroj pro onboarding picker
 * i /vybrat-design). Spouštět proti běžícímu dev serveru na :3015.
 *
 *   node scripts/_shot-onboarding-full.mjs eshop-11 eshop-14 ...
 */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import { join } from "node:path";

const EXEC = "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const BASE = process.env.BASE_URL ?? "http://localhost:3015";
const keys = process.argv.slice(2);
if (!keys.length) { console.error("usage: node scripts/_shot-onboarding-full.mjs <key>..."); process.exit(1); }

const browser = await chromium.launch({ executablePath: EXEC });
for (const key of keys) {
  const dir = join(process.cwd(), "public", "templates", key, "showcase");
  await mkdir(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  try {
    await page.goto(`${BASE}/demo/${key}-v2`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(3500);
    /* lazy obrázky: proscrollovat a vrátit se nahoru (guard kvůli šablonám s autonavigací) */
    try {
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < Math.min(document.body.scrollHeight, 6000); y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 260));
        }
        window.scrollTo(0, 0);
      });
    } catch { /* autonavigace — snímek bereme i tak */ }
    await page.waitForTimeout(1800);
    /* strop výšky, ať karty nemají absurdně dlouhý scroll a soubor zůstane malý */
    await page.evaluate(() => { document.documentElement.style.setProperty("overflow", "hidden"); });
    const h = Math.min(await page.evaluate(() => document.body.scrollHeight), 5200);
    await page.setViewportSize({ width: 1440, height: h });
    await page.waitForTimeout(900);
    const png = await page.screenshot({ type: "png" });
    await sharp(png).webp({ quality: 76 }).toFile(join(dir, "desktop-full.webp"));
    console.log("OK", key, "1440x" + h);
  } catch (err) {
    console.error("FAIL", key, err.message);
  } finally {
    await page.close();
  }
}
await browser.close();
