import { chromium } from "/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs";
const b = await chromium.launch();
const out = "/private/tmp/claude-501/-Users-apple-DEV-CRM/4a00ae5a-b11c-461e-b4a9-9748d2b4fba7/scratchpad";

async function dismissCookies(p) {
  try { await p.getByText("Accept all", { exact: true }).click({ timeout: 3000 }); await p.waitForTimeout(400); } catch {}
}

const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
await p.goto("http://localhost:3015/demo/eshop-16-v2", { waitUntil: "load", timeout: 90000 });
await p.waitForTimeout(2500);
await dismissCookies(p);
const sec = p.locator('[data-variant="eshop-16-products"]');
await sec.scrollIntoViewIfNeeded();
await p.waitForTimeout(1200);
await sec.screenshot({ path: `${out}/es16-products-desktop.png` });

// quick-add test: klik na + u první karty, pak screenshot headeru (badge košíku)
await p.locator(".es16p-add").first().click();
await p.waitForTimeout(1500);
await sec.screenshot({ path: `${out}/es16-products-added.png` });
await p.screenshot({ path: `${out}/es16-page-top.png`, clip: { x: 0, y: 0, width: 1600, height: 240 } });

const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://localhost:3015/demo/eshop-16-v2", { waitUntil: "load", timeout: 90000 });
await m.waitForTimeout(2500);
await dismissCookies(m);
const msec = m.locator('[data-variant="eshop-16-products"]');
await msec.scrollIntoViewIfNeeded();
await m.waitForTimeout(1000);
await msec.screenshot({ path: `${out}/es16-products-mobile.png` });

await b.close();
console.log("done");
