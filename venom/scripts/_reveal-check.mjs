import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] + "?ts=" + Date.now(), { waitUntil: "networkidle", timeout: 90000 });
await p.waitForTimeout(1000);
console.log("PŘED scrollem:", await p.evaluate(() => {
  const hidden = [...document.querySelectorAll("section, div")].filter(el => {
    const cs = getComputedStyle(el);
    return parseFloat(cs.opacity) < 0.15 && el.getBoundingClientRect().height > 80;
  });
  return `${hidden.length} prvků s opacity<0.15`;
}));
await p.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
  window.scrollTo(0, 0);
});
await p.waitForTimeout(1200);
console.log("PO scrollu:  ", await p.evaluate(() => {
  const hidden = [...document.querySelectorAll("section, div")].filter(el => {
    const cs = getComputedStyle(el);
    return parseFloat(cs.opacity) < 0.15 && el.getBoundingClientRect().height > 80;
  });
  return `${hidden.length} prvků s opacity<0.15`;
}));
await b.close();
