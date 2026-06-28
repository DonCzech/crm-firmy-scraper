import { chromium } from 'playwright-core';
import fs from 'node:fs';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'], headless: true,
});
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
});
const page = await context.newPage();

let serverHeader = '', xPoweredBy = '';
page.on('response', resp => {
  if (resp.url().includes('freja.cz') && !resp.url().includes('?')) {
    serverHeader = resp.headers()['server'] || '';
    xPoweredBy = resp.headers()['x-powered-by'] || '';
  }
});

await page.goto('https://freja.cz', { waitUntil: 'networkidle', timeout: 30000 });
console.log('SERVER:', serverHeader, '| X-POWERED-BY:', xPoweredBy);
console.log('TITLE:', await page.title());
console.log('URL:', page.url());

const info = await page.evaluate(() => {
  const html = document.documentElement.outerHTML;
  return {
    cms: {
      wordpress: html.includes('wp-content') || html.includes('wp-includes'),
      wix: html.includes('wixstatic') || html.includes('parastorage'),
      tilda: html.includes('tilda') || html.includes('t-body'),
      shopify: html.includes('shopify') || html.includes('cdn.shopify'),
      nuxt: html.includes('__nuxt') || html.includes('_nuxt/'),
      squarespace: html.includes('squarespace'),
      webflow: html.includes('webflow'),
      next: html.includes('__NEXT_DATA__') || html.includes('_next/'),
    },
    navLinks: [...document.querySelectorAll('nav a, header a, [class*="nav"] a')]
      .map(a => ({ text: a.textContent.trim(), href: a.href }))
      .filter(a => a.text && a.href).slice(0, 15),
    extScripts: [...document.querySelectorAll('script[src]')]
      .map(s => s.src).filter(s => !s.includes(location.hostname)).slice(0, 8),
    extCss: [...document.querySelectorAll('link[rel=stylesheet]')]
      .map(l => l.href).filter(l => !l.includes(location.hostname)).slice(0, 5),
    fonts: [...document.querySelectorAll('link[href*="fonts.google"], link[href*="fonts.gstatic"]')]
      .map(l => l.href).slice(0, 5),
    headings: [...document.querySelectorAll('h1,h2,h3')]
      .map(h => h.textContent.trim().substring(0,60)).slice(0,10),
    imgCount: document.querySelectorAll('img').length,
  };
});

console.log('CMS:', JSON.stringify(info.cms));
console.log('NAV:', info.navLinks.map(l => `${l.text}: ${l.href}`).join(' | '));
console.log('EXT SCRIPTS:', info.extScripts.join('\n  '));
console.log('EXT CSS:', info.extCss.join('\n  '));
console.log('FONTS:', info.fonts.join('\n  '));
console.log('H1/H2/H3:', info.headings.join(' | '));
console.log('IMG COUNT:', info.imgCount);

await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: '/tmp/freja-desktop.png', fullPage: false });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: '/tmp/freja-mobile.png', fullPage: false });
await browser.close();
console.log('Screenshots: /tmp/freja-desktop.png + mobile');
