import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
  headless: true,
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
});
const page = await context.newPage();

// Detect CMS from response headers
let serverHeader = '';
let xPoweredBy = '';
page.on('response', (resp) => {
  if (resp.url() === 'https://www.perfectcatering.cz/' || resp.url() === 'https://www.perfectcatering.cz') {
    serverHeader = resp.headers()['server'] || '';
    xPoweredBy = resp.headers()['x-powered-by'] || '';
    const setCookie = resp.headers()['set-cookie'] || '';
    console.log('SERVER:', serverHeader);
    console.log('X-POWERED-BY:', xPoweredBy);
    console.log('SET-COOKIE:', setCookie.substring(0, 200));
  }
});

await page.goto('https://www.perfectcatering.cz', { waitUntil: 'networkidle', timeout: 30000 });

const title = await page.title();
console.log('TITLE:', title);
console.log('FINAL URL:', page.url());

const info = await page.evaluate(() => {
  // CMS detection
  const html = document.documentElement.outerHTML;
  const cms = {
    wordpress: html.includes('wp-content') || html.includes('wp-includes'),
    wix: html.includes('wixstatic') || html.includes('parastorage'),
    tilda: html.includes('tilda') || html.includes('t-body'),
    squarespace: html.includes('squarespace'),
    webflow: html.includes('webflow'),
    laravel: html.includes('laravel') || !!document.querySelector('meta[name="csrf-token"]'),
    shopify: html.includes('shopify'),
  };
  
  // Nav links
  const navLinks = [...document.querySelectorAll('nav a, header a')].map(a => ({text: a.textContent.trim(), href: a.href})).filter(a => a.text && a.href).slice(0, 20);
  
  // External scripts
  const scripts = [...document.querySelectorAll('script[src]')].map(s => s.src).filter(s => !s.includes(window.location.hostname));
  
  // External CSS
  const csss = [...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.href).filter(l => !l.includes(window.location.hostname));
  
  // Google Fonts
  const fonts = [...document.querySelectorAll('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"]')].map(l => l.href);
  
  // Images
  const imgs = [...document.querySelectorAll('img')].map(i => i.src).filter(Boolean).slice(0, 20);
  
  // Page type  
  const isMultiPage = document.querySelectorAll('a[href*="' + window.location.pathname + '"]').length < 3;
  
  return { cms, navLinks, scripts: scripts.slice(0, 10), csss: csss.slice(0, 10), fonts, imgs, isMultiPage };
});

console.log('CMS FLAGS:', JSON.stringify(info.cms, null, 2));
console.log('NAV LINKS:', JSON.stringify(info.navLinks, null, 2));
console.log('EXT SCRIPTS:', info.scripts.join('\n'));
console.log('EXT CSS:', info.csss.join('\n'));
console.log('FONTS:', info.fonts.join('\n'));
console.log('FIRST IMGS:', info.imgs.slice(0, 10).join('\n'));

// Screenshots
await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: '/tmp/perfectcatering-desktop.png', fullPage: false });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: '/tmp/perfectcatering-mobile.png', fullPage: false });

await browser.close();
console.log('\nSCREENSHOTS: /tmp/perfectcatering-desktop.png + mobile');
