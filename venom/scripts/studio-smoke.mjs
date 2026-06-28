#!/usr/bin/env node
// scripts/studio-smoke.mjs <tenant-slug>
//
// Black-box runtime test studio editoru. Validátor (validate-template.mjs)
// zachytí strukturální chyby, ale ne reálné bugy jako "studio Add Section
// nepřidá sekci" nebo "reload smaže změny". Tohle to zachytí.
//
// Použití:
//   pnpm dev   # v jiném terminálu, na portu 3015
//   node scripts/studio-smoke.mjs peak-cut-demo
//
// Volitelné env vars:
//   BASE_URL       (default http://localhost:3015)
//   ACCESS_TOKEN   tenant access_token, jinak skript zkusí načíst z DB
//   HEADED=1       neskrývat browser (debug)
//   KEEP_OPEN=1    nechat browser otevřený po dokončení
//
// Co testuje:
//   1) /demo/<slug>/studio se otevře (nepřesměruje na login)
//   2) StudioShell + canvas + AddSectionPanel jsou v DOM
//   3) Canvas má alespoň jednu sekci ([data-section-frame])
//   4) Klik na první Add Section button → počet sekcí ++ (v UI)
//   5) Reload → přidaná sekce přežila (persistence)
//
// Exit codes: 0 OK, 1 FAIL, 2 setup error

import { chromium } from "playwright-core";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const slug = process.argv[2];
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3015";
const HEADED = process.env.HEADED === "1";
const KEEP_OPEN = process.env.KEEP_OPEN === "1";

if (!slug) {
  console.error("Usage: node scripts/studio-smoke.mjs <tenant-slug>");
  console.error("Example: node scripts/studio-smoke.mjs peak-cut-demo");
  process.exit(2);
}

const RED = "\x1b[31m", YEL = "\x1b[33m", GRN = "\x1b[32m", DIM = "\x1b[2m", RST = "\x1b[0m";
const log = (m) => console.log(`  ${DIM}·${RST} ${m}`);
const ok = (m) => console.log(`  ${GRN}✓${RST} ${m}`);
const fail = (m) => console.log(`  ${RED}✗${RST} ${m}`);
const warn = (m) => console.log(`  ${YEL}⚠${RST} ${m}`);

// ── 1. Resolve ACCESS_TOKEN ───────────────────────────────────────────────────
async function resolveAccessToken() {
  if (process.env.ACCESS_TOKEN) return process.env.ACCESS_TOKEN;

  // Try to read .env for DATABASE_URL and query Postgres
  const envPath = join(ROOT, ".env.local");
  let databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl && existsSync(envPath)) {
    const env = readFileSync(envPath, "utf8");
    const m = env.match(/^DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/m);
    if (m) databaseUrl = m[1];
  }
  if (!databaseUrl) {
    console.error(`${RED}✗${RST} Nemohu zjistit access_token. Nastav ACCESS_TOKEN env var nebo DATABASE_URL v .env.local.`);
    process.exit(2);
  }

  try {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    const res = await client.query("SELECT access_token FROM tenants WHERE slug = $1 LIMIT 1", [slug]);
    await client.end();
    if (res.rows.length === 0) {
      console.error(`${RED}✗${RST} Tenant "${slug}" v DB neexistuje. Nejdřív seed (např. /api/admin/seed-${slug.replace(/-demo$/, "")}).`);
      process.exit(2);
    }
    return res.rows[0].access_token;
  } catch (e) {
    console.error(`${RED}✗${RST} DB lookup failed: ${e.message}`);
    process.exit(2);
  }
}

// ── 2. Resolve system Chrome (playwright-core nestahuje browsery) ────────────
function findChrome() {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  for (const p of candidates) if (existsSync(p)) return p;
  try {
    return execSync("which google-chrome chromium chrome 2>/dev/null | head -1", { encoding: "utf8" }).trim() || null;
  } catch { return null; }
}

// ── 3. Run ─────────────────────────────────────────────────────────────────────
const errors = [];
const record = (label, fn) => fn().then(() => ok(label)).catch((e) => { fail(`${label} — ${e.message}`); errors.push(label); });

(async () => {
  console.log(`${DIM}Slug:${RST}     ${slug}`);
  console.log(`${DIM}Base URL:${RST} ${BASE_URL}`);

  const accessToken = await resolveAccessToken();
  log(`access_token = ${accessToken?.slice(0, 8)}…`);

  const chromePath = findChrome();
  if (!chromePath) {
    console.error(`${RED}✗${RST} Nenalezen Chrome/Chromium binary.`);
    process.exit(2);
  }
  log(`chrome = ${chromePath}`);

  const browser = await chromium.launch({ executablePath: chromePath, headless: !HEADED });
  const ctx = await browser.newContext();

  const baseHost = new URL(BASE_URL).hostname;
  await ctx.addCookies([{
    name: `venom_access_${slug}`,
    value: accessToken,
    domain: baseHost,
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  }]);

  const page = await ctx.newPage();
  page.on("pageerror", (e) => warn(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (u.includes("/_next/") || u.endsWith(".map")) return;
    warn(`requestfailed: ${u} — ${r.failure()?.errorText}`);
  });

  const url = `${BASE_URL}/demo/${slug}/studio`;
  console.log("");
  console.log(`${DIM}Navigating to:${RST} ${url}`);
  const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });

  // Auth check
  if (page.url().includes("/login")) {
    fail(`Redirected to login — access_token cookie didn't stick. Got ${resp?.status()} → ${page.url()}`);
    await browser.close();
    process.exit(1);
  }
  ok(`Studio loaded (HTTP ${resp?.status()})`);

  // Wait for studio shell
  await record("StudioShell rendered", async () => {
    await page.waitForSelector("[data-section-frame], main", { timeout: 10_000 });
  });

  // Count initial sections
  let initialCount = 0;
  await record("Canvas has at least one section", async () => {
    initialCount = await page.$$eval("[data-section-frame]", (els) => els.length);
    if (initialCount === 0) throw new Error("0 sections rendered on canvas");
    log(`initial sections: ${initialCount}`);
  });

  // Open Add Section panel — look for the rail button
  await record("AddSection panel reachable", async () => {
    // Try clicking a left-rail item that opens Add Section
    const addBtn = await page.$('button[aria-label^="Přidat"], [data-panel="add-section"]');
    if (!addBtn) {
      // try opening via left rail icons
      const rail = await page.$$('button, a');
      // best-effort: find a button whose aria-label or title hints at "Přidat sekci"
      for (const b of rail) {
        const al = (await b.getAttribute("aria-label")) ?? "";
        if (/sekc|section/i.test(al)) { await b.click().catch(() => {}); break; }
      }
    }
    // Now verify some Přidat <X> buttons exist
    await page.waitForSelector('button[aria-label^="Přidat"]', { timeout: 5_000 });
  });

  // Click first Add button
  let afterAddCount = initialCount;
  await record("Click Add Section → section count increases", async () => {
    const addButtons = await page.$$('button[aria-label^="Přidat"]');
    if (addButtons.length === 0) throw new Error("No Přidat buttons in AddSection panel");
    log(`library entries available: ${addButtons.length}`);
    await addButtons[0].click();
    // Wait for canvas to grow
    await page.waitForFunction(
      (expected) => document.querySelectorAll("[data-section-frame]").length > expected,
      initialCount,
      { timeout: 5_000 }
    );
    afterAddCount = await page.$$eval("[data-section-frame]", (els) => els.length);
    if (afterAddCount !== initialCount + 1) throw new Error(`expected ${initialCount + 1} sections, got ${afterAddCount}`);
  });

  // Wait for auto-save and reload
  await record("Persistence — reload preserves new section", async () => {
    await page.waitForTimeout(2000); // let auto-save flush
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-section-frame]", { timeout: 10_000 });
    const persistedCount = await page.$$eval("[data-section-frame]", (els) => els.length);
    if (persistedCount < afterAddCount) {
      throw new Error(`after reload only ${persistedCount} sections, expected ${afterAddCount} — auto-save broken`);
    }
    log(`after reload: ${persistedCount} sections (was ${afterAddCount} pre-reload)`);
  });

  if (!KEEP_OPEN) await browser.close();

  console.log("");
  if (errors.length > 0) {
    console.log(`${RED}FAIL${RST} — ${errors.length} check(s) failed: ${errors.join(", ")}`);
    process.exit(1);
  }
  console.log(`${GRN}✓ PASS${RST} — studio pro "${slug}" prošel smoke testem.`);
  process.exit(0);
})().catch((e) => {
  console.error(`${RED}✗${RST} fatal: ${e.message}`);
  console.error(e.stack);
  process.exit(2);
});
