import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
  headless: true,
});

const context = await browser.newContext({ locale: 'cs-CZ' });
const page = await context.newPage();

const extRequests = [];
const failedReqs = [];
const consoleErrors = [];

page.on('request', req => {
  const url = req.url();
  if (!url.startsWith('http://localhost') && !url.startsWith('data:'))
    extRequests.push(url);
});
page.on('requestfailed', req => failedReqs.push(`${req.failure()?.errorText} ${req.url()}`));
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

await page.goto('http://localhost:3015/demo/perfectcatering-demo', { waitUntil: 'networkidle', timeout: 30000 });

await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: '/tmp/pc-demo-desktop.png', fullPage: false });
await page.screenshot({ path: '/tmp/pc-demo-full.png', fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: '/tmp/pc-demo-mobile.png', fullPage: false });

console.log(`External requests: ${extRequests.length}`);
if (extRequests.length) console.log(extRequests.map(u => '  ' + u).join('\n'));
console.log(`Failed requests: ${failedReqs.length}`);
if (failedReqs.length) console.log(failedReqs.slice(0,5).join('\n'));
console.log(`Console errors: ${consoleErrors.length}`);
if (consoleErrors.length) console.log(consoleErrors.slice(0,5).join('\n'));

// Brand check
const html = await page.content();
const brandRefs = (html.match(/perfectcatering\.cz/gi) || []).length;
const trackingRefs = (html.match(/consentmanager|googletagmanager|linkedin\.com\/collect|snap\.licdn/gi) || []).length;
console.log(`Brand refs: ${brandRefs}`);
console.log(`Tracking refs: ${trackingRefs}`);

await browser.close();
console.log('Screenshots: /tmp/pc-demo-desktop.png + mobile');
