import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
  headless: true,
});

const page = await (await browser.newContext()).newPage();
const failed = [];
page.on('response', resp => { if (resp.status() === 404) failed.push(resp.url()); });

await page.goto('http://localhost:3015/demo/perfectcatering-demo', { waitUntil: 'networkidle', timeout: 30000 });
console.log('404 URLs:');
failed.forEach(u => console.log(' ', u));
await browser.close();
