import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
await page.goto("https://www.milagro.cz/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);
const data = await page.evaluate(() => {
  const out = {};
  const vw = window.innerWidth;
  const cs = el => el ? getComputedStyle(el) : null;
  const r = el => el ? el.getBoundingClientRect() : null;
  // logo
  const logo = document.querySelector("header a[href='/'], header img, header svg") || document.querySelector("header a");
  // header rows
  const header = document.querySelector("header");
  out.header = header ? { rect: r(header), bg: cs(header).backgroundColor } : null;
  // announcement bar = first element with pink bg
  const all = [...document.querySelectorAll("body *")].slice(0, 400);
  const pink = all.find(el => { const b = cs(el).backgroundColor; return b && b.startsWith("rgb(255") && r(el).width > vw*0.9 && r(el).height < 80 && r(el).height > 20; });
  out.announcement = pink ? { bg: cs(pink).backgroundColor, h: r(pink).height, fs: cs(pink).fontSize } : null;
  // search input
  const inp = document.querySelector("header input[type='text'], header input[type='search'], input[placeholder*='hled' i]");
  if (inp) out.search = { rect: r(inp), radius: cs(inp).borderRadius, bg: cs(inp).backgroundColor, fs: cs(inp).fontSize, pad: cs(inp).padding, border: cs(inp).border, h: r(inp).height };
  // nav link
  const nav = [...document.querySelectorAll("header a")].find(a => a.textContent.trim() === "Prsteny");
  if (nav) out.navLink = { rect: r(nav), fs: cs(nav).fontSize, fw: cs(nav).fontWeight, ff: cs(nav).fontFamily.slice(0,60), ls: cs(nav).letterSpacing, color: cs(nav).color };
  // wordmark
  const wm = [...document.querySelectorAll("header *")].find(el => el.textContent.trim() === "MILAGRO" && el.children.length === 0);
  if (wm) out.wordmark = { fs: cs(wm).fontSize, fw: cs(wm).fontWeight, ff: cs(wm).fontFamily.slice(0,60), ls: cs(wm).letterSpacing, rect: r(wm) };
  else {
    const img = document.querySelector("header img");
    if (img) out.wordmarkImg = { src: img.src, rect: r(img) };
  }
  // container: parent of nav link chain widths
  if (nav) {
    let el = nav, chain = [];
    while (el && el !== document.body) { const rr = r(el); chain.push({ tag: el.tagName, cls: (el.className||"").toString().slice(0,80), w: Math.round(rr.width), x: Math.round(rr.x), pad: cs(el).padding }); el = el.parentElement; }
    out.chain = chain.slice(0, 8);
  }
  // horizontal line under menu
  const hr = all.find(el => { const s = cs(el); const rr = r(el); return rr.y > 100 && rr.y < 320 && rr.height < 3 && rr.width > 800 && (s.borderBottomWidth === "1px" || s.backgroundColor.includes("rgb(2") ); });
  // find border-bottom on nav row
  const navRow = nav ? nav.closest("div,nav") : null;
  out.phone = (() => { const a = [...document.querySelectorAll("header a[href^='tel']")][0]; return a ? { fs: cs(a).fontSize, fw: cs(a).fontWeight, text: a.textContent.trim().slice(0,40) } : null; })();
  return out;
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
