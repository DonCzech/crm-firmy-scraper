import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
await page.goto("https://www.milagro.cz/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
  const cs = el => getComputedStyle(el);
  const r = el => el.getBoundingClientRect();
  const out = {};
  const inp = document.querySelector("input[placeholder*='hled' i]");
  let el = inp, chain = [];
  for (let i=0;i<4 && el;i++){ const b=cs(el); const rr=r(el); chain.push({tag:el.tagName, cls:(el.className||'').toString().slice(0,70), bg:b.backgroundColor, radius:b.borderRadius, h:Math.round(rr.height), w:Math.round(rr.width), x:Math.round(rr.x)}); el=el.parentElement; }
  out.searchChain = chain;
  // search icon
  const btn = inp.closest("div").querySelector("button, svg");
  if (btn) out.searchBtn = { tag: btn.tagName, rect: r(btn), cls:(btn.getAttribute('class')||'').slice(0,60) };
  // nav links positions
  const links = [...document.querySelectorAll(".megamenu__item-link")].slice(0,10).map(a=>({t:a.textContent.trim().slice(0,15), x:Math.round(r(a).x), w:Math.round(r(a).width)}));
  out.links = links;
  // announcement inner text el
  const ann = [...document.querySelectorAll("body *")].find(e=>e.textContent.trim().startsWith("Doprava ZDARMA") && e.children.length<4);
  if (ann) out.ann = { fs: cs(ann).fontSize, ff: cs(ann).fontFamily.slice(0,40), h: Math.round(r(ann).height) };
  // icons right (heart etc.)
  const hearts = [...document.querySelectorAll("header a,header button")].map(e=>({aria:(e.getAttribute('aria-label')||e.getAttribute('title')||'').slice(0,20), x:Math.round(r(e).x), w:Math.round(r(e).width)})).filter(o=>o.x>1000);
  out.rightIcons = hearts.slice(0,8);
  // phone spans
  const tel = document.querySelector("header a[href^='tel']");
  if (tel) out.phoneSpans = [...tel.querySelectorAll("*")].slice(0,4).map(s=>({t:s.textContent.trim().slice(0,25), fs:cs(s).fontSize, fw:cs(s).fontWeight}));
  // avatar in header
  const av = [...document.querySelectorAll("header img")].map(i=>({src:i.src.slice(-40), w:Math.round(r(i).width), h:Math.round(r(i).height), radius:cs(i).borderRadius}));
  out.headerImgs = av;
  return out;
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
