import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await p.addInitScript(() => { try { localStorage.setItem('venom_cookie_consent','accepted'); } catch(e){} });
await p.goto('http://localhost:3015/cs?onboarding=eshop', { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForTimeout(9000);
await p.locator('button[aria-label]').filter({ has: p.locator('img') }).first().click();
await p.waitForTimeout(6000);
console.log(await p.evaluate(() => {
  const f = document.querySelector('.fixed.inset-0.z-20 iframe');
  const img = document.querySelector('.fixed.inset-0.z-20 img');
  return { hasIframe: !!f, iframeSrc: f && f.getAttribute('src'), hasImg: !!img, imgSrc: img && img.getAttribute('src') };
}));
await b.close();
