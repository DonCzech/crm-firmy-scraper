import { chromium } from "playwright-core";
const url = process.argv[2] ?? "http://localhost:3015/demo/orbit-01-v2";
const out = process.argv[3] ?? "/tmp/orbit-shot.png";
const vw = Number(process.argv[4] ?? 1440), vh = Number(process.argv[5] ?? 900);
const fullPage = process.argv[6] === "full";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: vw, height: vh } });
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
await p.waitForTimeout(1600);
const btn = p.getByRole("button", { name: /accept all|přijmout vše/i }).first();
if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); await p.waitForTimeout(400); }
const scrollTo = Number(process.env.SCROLL ?? 0);
if (scrollTo) { await p.evaluate(y => window.scrollTo(0, y), scrollTo); await p.waitForTimeout(1100); }
await p.waitForTimeout(500);
await p.screenshot({ path: out, fullPage });
console.log("saved", out);
await b.close();
