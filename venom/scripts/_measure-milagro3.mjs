import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
await page.goto("https://www.milagro.cz/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3500);
const data = await page.evaluate(() => {
  const cs = el => getComputedStyle(el);
  const r = el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const out = {};
  // find OBJEVIT button
  const btn = [...document.querySelectorAll("a,button")].find(e => e.textContent.trim().toUpperCase() === "OBJEVIT");
  if (btn) out.btn = { rect: r(btn), bg: cs(btn).backgroundColor, color: cs(btn).color, fs: cs(btn).fontSize, fw: cs(btn).fontWeight, ls: cs(btn).letterSpacing, pad: cs(btn).padding, radius: cs(btn).borderRadius };
  // caption "NOVÁ KOLEKCE"
  const cap = [...document.querySelectorAll("h1,h2,h3,p,span,div")].filter(e => e.children.length <= 2 && /NOVÁ KOLEKCE/i.test(e.textContent) && e.textContent.trim().length < 40).map(e => ({ tag: e.tagName, t: e.textContent.trim(), fs: cs(e).fontSize, fw: cs(e).fontWeight, ff: cs(e).fontFamily.slice(0, 40), rect: r(e) }));
  out.captions = cap.slice(0, 4);
  // hero container: find images in first section area
  const imgs = [...document.querySelectorAll("img,picture, [style*='background-image']")].map(e => ({ tag: e.tagName, rect: r(e), src: (e.src || "").slice(-50) })).filter(o => o.rect.y > 180 && o.rect.y < 800 && o.rect.w > 150);
  out.heroImgs = imgs.slice(0, 10);
  // swiper/slider wrapper
  const sw = document.querySelector(".swiper, [class*='slider'], [class*='hero']");
  if (sw) out.heroWrap = { cls: (sw.className||'').toString().slice(0,80), rect: r(sw) };
  return out;
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
