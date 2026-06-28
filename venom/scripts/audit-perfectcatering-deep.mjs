import { chromium } from 'playwright-core';
import fs from 'node:fs';

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

// Collect all network requests
const allRequests = [];
page.on('response', (resp) => {
  allRequests.push({ url: resp.url(), ct: resp.headers()['content-type'] || '', status: resp.status() });
});

await page.goto('https://www.perfectcatering.cz', { waitUntil: 'networkidle', timeout: 30000 });

// Full page screenshot
await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: '/tmp/perfectcatering-full.png', fullPage: true });

// Get full HTML
const html = await page.content();
fs.writeFileSync('/tmp/perfectcatering-home.html', html);

// Extract info
const info = await page.evaluate(() => {
  // Sections
  const sections = [...document.querySelectorAll('section, [id], [class*="section"], [class*="block"]')]
    .map(el => ({tag: el.tagName, id: el.id, className: el.className?.toString?.()?.substring?.(0, 60) || '' }))
    .filter(el => el.id || el.className)
    .slice(0, 30);
  
  // All images including background
  const allImgs = [...document.querySelectorAll('img')].map(i => ({src: i.src, alt: i.alt, width: i.naturalWidth}));
  
  // Fonts from style sheets
  const fontFaces = [];
  try {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            fontFaces.push(rule.cssText.substring(0, 200));
          }
        }
      } catch(e) {}
    }
  } catch(e) {}
  
  // Page headings
  const headings = [...document.querySelectorAll('h1, h2, h3')].map(h => ({tag: h.tagName, text: h.textContent.trim().substring(0, 80)})).slice(0, 20);
  
  return { sections, allImgs, fontFaces: fontFaces.slice(0, 10), headings };
});

console.log('SECTIONS:');
info.sections.forEach(s => console.log(` - ${s.tag}#${s.id} .${s.className}`));

console.log('\nHEADINGS:');
info.headings.forEach(h => console.log(` ${h.tag}: ${h.text}`));

console.log('\nFONT FACES:', info.fontFaces.slice(0, 5).join('\n'));

console.log('\nALL IMAGES:', info.allImgs.slice(0, 20).map(i => `${i.src.substring(0, 100)} [${i.width}px]`).join('\n'));

// External requests
const extReqs = allRequests.filter(r => !r.url.includes('perfectcatering.cz') && !r.url.includes('localhost'));
console.log('\nEXTERNAL REQUESTS:', extReqs.slice(0, 20).map(r => `${r.status} ${r.url.substring(0, 100)}`).join('\n'));

// CDN image requests
const cdnImgs = allRequests.filter(r => r.url.includes('digitaloceanspaces.com'));
console.log('\nDIGITALOCEAN CDN IMAGES:', cdnImgs.length, 'items');
cdnImgs.forEach(r => console.log(' ', r.url.split('/').slice(-1)[0]));

console.log('\nHTML SIZE:', html.length, 'bytes');
console.log('Saved to /tmp/perfectcatering-home.html');

await browser.close();
