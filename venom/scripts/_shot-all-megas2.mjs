import { chromium } from "playwright-core";
const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/9008465e-77fd-41fe-b161-a929adf6154b/scratchpad";
const SEL = {
  "01": 'header nav button, header nav a',
  "02": 'button[aria-haspopup="true"]',
  "03": 'a.es03-menu-link',
  "04": 'a.es04-menu-link',
  "05": '.es05-nav-item',
  "06": '.es06-nav-item',
  "07": '.es07-nav-item',
  "08": '.es08-nav-btn',
  "09": '.es09-nav-item',
  "10": '.es10-nav-item',
  "11": '.es11-nav-item',
  "12": 'header nav a[class*="cat"], header nav a',
  "13": '.es13-cat, header nav a',
  "14": '.es14-tab',
  "15": '.es15-cat',
  "16": 'header button, header [class*="cat-btn"]',
  "17": '.es17-navtab',
  "18": '.es18-navtab, header button',
  "19": 'header nav a, header nav button',
  "20": 'header nav a, header nav button',
};
const only = process.argv[2] ? process.argv[2].split(",") : Object.keys(SEL);
const browser = await chromium.launch({ executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const panelVisible = (page) => page.evaluate(() => {
  const els = document.querySelectorAll('[class*="mega"],[class*="panel"]');
  for (const el of els) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width > 500 && r.height > 150 && cs.visibility !== "hidden" && r.top > 40 && r.top < 400) return true;
  }
  return false;
});
for (const nn of only) {
  const slug = `eshop-${nn}-v2`;
  const page = await (await browser.newContext({ viewport: { width: 1600, height: 950 } })).newPage();
  try {
    await page.goto(`http://localhost:3015/demo/${slug}?ts=${Date.now()}`, { waitUntil: "networkidle", timeout: 120000 });
    const loc = page.locator(SEL[nn]);
    const n = Math.min(await loc.count(), 10);
    let opened = false;
    for (let k = 0; k < n && !opened; k++) {
      try {
        await loc.nth(k).hover({ timeout: 2500 });
        await page.waitForTimeout(500);
        opened = await panelVisible(page);
      } catch {}
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/mega-${nn}.png` });
    console.log(nn, opened ? "OPEN" : "no-panel");
  } catch (e) { console.log(nn, "FAIL", String(e).slice(0, 100)); }
  await page.context().close();
}
await browser.close();
