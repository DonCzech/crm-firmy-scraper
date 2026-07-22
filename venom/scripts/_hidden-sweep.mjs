// Sweep: hledá TRVALE neviditelný obsah (opacity<0.15 po plném proscrollování).
// Vzniklo po nálezu u kids-01, kde scroll-reveal nikdy nespustil a tři sekce byly
// pro návštěvníka neviditelné, přestože konzole i validate mlčely.
import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
for (const slug of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:3015/demo/${slug}?ts=${Date.now()}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(1600);
  const n = await p.evaluate(() => [...document.querySelectorAll("section, div")]
    .filter(el => {
      if (parseFloat(getComputedStyle(el).opacity) >= 0.15) return false;
      if (el.getBoundingClientRect().height <= 80) return false;
      // záměrně skryté: zavřené overlay menu a neaktivní snímky crossfade slideru
      const c = (el.className || "").toString();
      if (/-(ov|overlay)\b/.test(c) || /slide/.test(c)) return false;
      return true;
    }).length);
  console.log(`${slug.padEnd(20)} skrytých bloků: ${n}${n ? "  ← PROVĚŘIT" : ""}`);
  await p.close();
}
await b.close();
