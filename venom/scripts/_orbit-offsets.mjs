import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] ?? "http://localhost:3015/demo/orbit-01-v2", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(2000);
const offs = await p.evaluate(() => {
  const out = {};
  for (const sel of ["ob01hero","ob01st","ob01bn","ob01uc","ob01wf","ob01ig","ob01sec","ob01cs","ob01pr","ob01ts","ob01fq","ob01ct","ob01ft"]) {
    const el = document.querySelector("." + sel);
    if (el) out[sel] = Math.round(el.getBoundingClientRect().top + window.scrollY);
  }
  return out;
});
console.log(JSON.stringify(offs));
await b.close();
