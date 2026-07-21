#!/usr/bin/env node
// signal-01 browser QA: overflow @ 5 viewports, console errors, key interactions, screenshots.
// Vzor: scripts/proof01-qa.mjs. Spouštět 2× (contact API rate-limit — §2.7 playbooku).
import { chromium } from "playwright-core";

const BASE = "http://localhost:3015";
const HOME = `${BASE}/demo/signal-01-v2`;
const VIEWPORTS = [
  { w: 320, h: 700 }, { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1024, h: 768 }, { w: 1440, h: 900 },
];
const PAGES = ["", "/reseni", "/case-studies", "/o-firme", "/kontakt", "/case-studies/kyberneticka-odolnost-fintech-platformy"];

const results = [];
const consoleErrors = [];

const browser = await chromium.launch({ channel: "chrome" });
try {
  // ── 1. Overflow check: every page × every viewport ──────────────────────────
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`[${vp.w}px] ${m.text().slice(0, 200)}`); });
    page.on("pageerror", (e) => consoleErrors.push(`[${vp.w}px pageerror] ${String(e).slice(0, 200)}`));
    for (const p of PAGES) {
      await page.goto(HOME + p, { waitUntil: "networkidle", timeout: 60000 });
      const overflow = await page.evaluate(() => {
        const d = document.documentElement;
        return { sw: d.scrollWidth, cw: d.clientWidth };
      });
      const over = overflow.sw > overflow.cw + 1;
      results.push(`${over ? "FAIL" : "ok"} overflow ${vp.w}px ${p || "/"} (scroll ${overflow.sw} vs client ${overflow.cw})`);
    }
    await ctx.close();
  }

  // ── 2. Interactions @ desktop ───────────────────────────────────────────────
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`[ix] ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => consoleErrors.push(`[ix pageerror] ${String(e).slice(0, 200)}`));
  await page.goto(HOME, { waitUntil: "networkidle", timeout: 60000 });
  try { await page.getByText("Accept all").click({ timeout: 2500 }); } catch {}

  // hero role switcher: click 2nd role, check metric + first benefit change
  const metric1 = await page.locator(".sg01sel-metric-val > b").innerText();
  const benefit1 = await page.locator(".sg01sel-benefit").first().innerText();
  await page.locator(".sg01sel-role").nth(1).click();
  await page.waitForTimeout(450);
  const metric2 = await page.locator(".sg01sel-metric-val > b").innerText();
  const benefit2 = await page.locator(".sg01sel-benefit").first().innerText();
  results.push(`${metric1 !== metric2 ? "ok" : "FAIL"} hero role switch metric (${metric1} → ${metric2})`);
  results.push(`${benefit1 !== benefit2 ? "ok" : "FAIL"} hero role switch benefits`);

  // role radio a11y: aria-checked moves
  const checked = await page.locator('.sg01sel-role[aria-checked="true"]').innerText();
  results.push(`${checked && metric2 ? "ok" : "FAIL"} hero role aria-checked on active (${checked.trim()})`);

  // cases card links to CMS detail
  const caseHref = await page.locator(".sg01cs-card").first().getAttribute("href");
  results.push(`${caseHref && caseHref.includes("/case-studies/") ? "ok" : "FAIL"} case card links to CMS detail (${caseHref})`);

  // FAQ accordion: click 2nd question opens it
  const q2 = page.locator(".sg01fq-q").nth(1);
  await q2.scrollIntoViewIfNeeded();
  await q2.click();
  await page.waitForTimeout(400);
  const open2 = await page.locator(".sg01fq-item").nth(1).getAttribute("data-open");
  results.push(`${open2 === "true" ? "ok" : "FAIL"} FAQ accordion opens`);

  // contact form: validation prevents submit without consent
  await page.locator(".sg01ct-submit").scrollIntoViewIfNeeded();
  await page.fill(".sg01ct-card input[name=name]", "QA Test");
  await page.fill(".sg01ct-card input[name=company]", "QA s.r.o.");
  await page.fill(".sg01ct-card input[name=email]", "qa@test.cz");
  await page.selectOption(".sg01ct-card select[name=topic]", { index: 1 });
  await page.fill(".sg01ct-card textarea[name=message]", "QA testovací poptávka — diagnostika nákladů.");
  await page.locator(".sg01ct-submit").click();
  await page.waitForTimeout(500);
  const err = await page.locator(".sg01ct-err").count();
  results.push(`${err > 0 ? "ok" : "FAIL"} contact form blocks submit without consent (error shown)`);
  // with consent → success or server error state (both are handled states)
  await page.locator(".sg01ct-consent input").check();
  await page.locator(".sg01ct-submit").click();
  await page.waitForTimeout(6000);
  const success = await page.locator(".sg01ct-success").count();
  const err2 = await page.locator(".sg01ct-err").count();
  results.push(`${success > 0 ? "ok (success state)" : err2 > 0 ? "ok (error state shown)" : "FAIL"} contact form submit → handled state`);

  // stats count-up rendered non-zero
  await page.goto(HOME, { waitUntil: "networkidle" });
  await page.locator(".sg01st-num").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const statVal = await page.locator(".sg01st-num b").first().innerText();
  results.push(`${statVal.trim().startsWith("0") ? "FAIL" : "ok"} stats count-up settled ("${statVal.trim()}")`);

  // desktop screenshot for preview
  await page.goto(HOME, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "src/templates/signal-01/preview.png", clip: { x: 0, y: 0, width: 1200, height: 800 } });
  results.push("ok preview.png saved (1200x800)");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: "/tmp/signal01-desktop-full.png", fullPage: true });

  // mobile: sticky CTA bar visible + drawer
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mpage = await mctx.newPage();
  await mpage.goto(HOME, { waitUntil: "networkidle", timeout: 60000 });
  try { await mpage.getByText("Accept all").click({ timeout: 2500 }); } catch {}
  const barVisible = await mpage.locator(".sg01nav-mobar").isVisible();
  results.push(`${barVisible ? "ok" : "FAIL"} sticky mobile CTA bar visible @390`);
  await mpage.locator(".sg01nav-burger").click();
  await mpage.waitForTimeout(400);
  const drawerOpen = await mpage.locator(".sg01nav-drawer").getAttribute("data-open");
  results.push(`${drawerOpen === "true" ? "ok" : "FAIL"} mobile drawer opens`);
  await mpage.keyboard.press("Escape");
  await mpage.waitForTimeout(300);
  const drawerClosed = await mpage.locator(".sg01nav-drawer").getAttribute("data-open");
  results.push(`${drawerClosed === "false" ? "ok" : "FAIL"} mobile drawer closes on Esc`);
  await mpage.screenshot({ path: "/tmp/signal01-mobile-full.png", fullPage: true });
  await mctx.close();
  await ctx.close();
} finally {
  await browser.close();
}

console.log("\n===== RESULTS =====");
for (const r of results) console.log(r);
console.log(`\nconsole errors: ${consoleErrors.length}`);
for (const e of [...new Set(consoleErrors)].slice(0, 10)) console.log("  " + e);
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILURES"}`);
process.exit(fails === 0 ? 0 : 1);
