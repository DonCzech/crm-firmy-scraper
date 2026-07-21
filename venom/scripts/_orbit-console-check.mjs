import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 300)); });
p.on("pageerror", e => errs.push("PAGEERROR: " + String(e).slice(0, 300)));
await p.goto("http://localhost:3015/demo/orbit-01-v2", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(3000);
await p.evaluate(() => window.scrollTo(0, 1600));
await p.waitForTimeout(1200);
const vis = await p.evaluate(() => {
  const c = document.querySelector(".ob01bn-card");
  return c ? { cls: c.className, op: getComputedStyle(c).opacity } : null;
});
console.log("card:", JSON.stringify(vis));
console.log("errors:", JSON.stringify(errs.slice(0, 6), null, 1));
await b.close();
