/**
 * Regenerace všech obrázků pro onboarding modal.
 *
 *   node scripts/shot-onboarding-assets.mjs cards    → 3 obrázky karet kroku volby
 *   node scripts/shot-onboarding-assets.mjs eshops   → 20 náhledů e-shopů do gridu šablon
 *   node scripts/shot-onboarding-assets.mjs          → obojí
 *
 * Vyžaduje běžící dev server na :3015. Pro kartu AI Builderu se čte access token
 * tenanta z DB (builder je za přihlášením).
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import pg from "pg";

const EXE = "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const BASE = "http://localhost:3015";
const PUB = "/Users/apple/DEV/CRM/venom/public";
const AI_TENANT = "restaurant-01-v2";

const what = process.argv[2] ?? "all";

async function dismissCookies(page) {
  for (const t of ["Accept all", "Přijmout vše"]) {
    const el = page.locator(`button:has-text("${t}")`).first();
    if (await el.count()) { await el.click().catch(() => {}); break; }
  }
}

/** Karty kroku volby: Web (hair-01), E-shop (eshop-04), AI Builder (reálný builder). */
async function shootCards() {
  const browser = await chromium.launch({ executablePath: EXE });

  for (const [slug, out] of [
    ["hair-01-v2", "onboarding-card-web.jpg"],
    ["eshop-04-v2", "onboarding-card-eshop.jpg"],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/demo/${slug}`, { waitUntil: "load", timeout: 60000 });
    await p.waitForTimeout(1500);
    await dismissCookies(p);
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${PUB}/images/${out}`, type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: 1280, height: 800 } });
    await ctx.close();
    console.log("OK", out);
  }

  // AI Builder — potřebuje per-tenant access cookie
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query("SELECT access_token FROM tenants WHERE slug = $1", [AI_TENANT]);
  await client.end();
  const token = rows[0]?.access_token;
  if (!token) throw new Error(`Tenant ${AI_TENANT} nemá access_token`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addCookies([{ name: `webero_access_${AI_TENANT}`, value: token, domain: "localhost", path: "/", sameSite: "Lax" }]);
  const p = await ctx.newPage();
  await p.goto(`${BASE}/demo/${AI_TENANT}/admin?builder=1`, { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(6500); // kompilace + render náhledu
  // ořez nad spodní trial lištou
  await p.screenshot({ path: `${PUB}/images/onboarding-card-ai.jpg`, type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: 1440, height: 815 } });
  await ctx.close();
  console.log("OK onboarding-card-ai.jpg");

  await browser.close();
}

/** Náhledy 20 e-shopů do gridu šablon (viz lib/templates/onboarding-catalog.ts). */
async function shootEshops() {
  const browser = await chromium.launch({ executablePath: EXE });
  for (let i = 1; i <= 20; i++) {
    const nn = String(i).padStart(2, "0");
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    try {
      await p.goto(`${BASE}/demo/eshop-${nn}-v2`, { waitUntil: "load", timeout: 60000 });
      await p.waitForTimeout(1200);
      // projet stránku kvůli lazy-load (některé šablony ruší evaluate kontext)
      try {
        await p.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 800) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo(0, 0);
        });
      } catch {
        await p.mouse.wheel(0, 4000);
        await p.waitForTimeout(600);
        await p.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
      }
      await p.waitForTimeout(1500);
      const height = await p.evaluate(() => Math.min(document.body.scrollHeight, 6200));
      const dir = `${PUB}/templates/eshop-${nn}/showcase`;
      mkdirSync(dir, { recursive: true });
      await p.screenshot({ path: `${dir}/onboarding-desktop.jpg`, type: "jpeg", quality: 72, clip: { x: 0, y: 0, width: 1440, height } });
      console.log(`OK eshop-${nn} (${height}px)`);
    } catch (e) {
      console.error(`FAIL eshop-${nn}:`, String(e).slice(0, 160));
    }
    await ctx.close();
  }
  await browser.close();
}

if (what === "cards" || what === "all") await shootCards();
if (what === "eshops" || what === "all") await shootEshops();
