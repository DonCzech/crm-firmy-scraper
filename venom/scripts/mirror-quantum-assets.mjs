/**
 * Mirror quantumreality.cz — WordPress (realitní kancelář Praha)
 * Run: node scripts/mirror-quantum-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'quantum';
const ORIGIN = 'https://www.quantumreality.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',                     url: '/' },
  { slug: 'realitni-kancelar-praha',  url: '/realitni-kancelar-praha/' },
  { slug: 'kontakty',                 url: '/kontakty/centrala/' },
  { slug: 'hypotecni-centrum',        url: '/hypotecni-centrum/' },
];

const assetMap = new Map();
fs.mkdirSync(`${OUT}/pages`, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});

for (const p of PAGES) {
  console.log(`\n=== ${p.slug} ===`);
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'cs-CZ',
  });
  const page = await context.newPage();

  page.on('response', async (resp) => {
    const url = resp.url();
    if (!url.startsWith(ORIGIN)) return;
    const ct = resp.headers()['content-type'] || '';
    const rel = url.replace(ORIGIN, '').split('?')[0];
    const ext = path.extname(rel).toLowerCase();
    const isCss  = ct.includes('css') || ext === '.css';
    const isJs   = ct.includes('javascript') || ext === '.js';
    const isImg  = ct.includes('image') || ['.jpg','.jpeg','.png','.webp','.gif','.svg','.ico','.avif'].includes(ext);
    const isFont = ct.includes('font') || ['.woff','.woff2','.ttf','.otf','.eot'].includes(ext);
    if (!isCss && !isJs && !isImg && !isFont) return;
    const base = path.basename(rel);
    if (isJs && /gtm|analytics|pixel|hotjar|cookiebot|gtag/.test(base)) return;
    try {
      const dest = `${OUT}${rel}`;
      if (!fs.existsSync(dest)) {
        const body = await resp.body();
        if (body.length < 4) return;
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, body);
      }
      assetMap.set(url, `/clones/${SLUG}${rel}`);
      assetMap.set(url.split('?')[0], `/clones/${SLUG}${rel}`);
    } catch {}
  });

  try {
    await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
  } catch(e) { console.log('  timeout, continuing:', e.message.substring(0,40)); }
  try { await page.click('[class*="cookie"] button, [id*="cookie"] button, button[class*="accept"], button[class*="souhlas"]', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal assets: ${assetMap.size}`);

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, fn);
    else fn(full);
  }
}
function fixCss(content) {
  let css = content;
  for (const [orig, local] of assetMap) css = css.replaceAll(orig, local);
  return css;
}
walk(`${OUT}/wp-content`, (fp) => {
  if (!fp.endsWith('.css')) return;
  fs.writeFileSync(fp, fixCss(fs.readFileSync(fp, 'utf8')));
});

const LINK_MAP = {
  '/':                          `/demo/quantum-reality-demo`,
  '/realitni-kancelar-praha/':  `/demo/quantum-reality-demo/realitni-kancelar-praha`,
  '/kontakty/centrala/':        `/demo/quantum-reality-demo/kontakty`,
  '/hypotecni-centrum/':        `/demo/quantum-reality-demo/hypotecni-centrum`,
  '/nemovitosti/':              `/demo/quantum-reality-demo`,
  '/blog/':                     `/demo/quantum-reality-demo`,
  '/kariera/':                  `/demo/quantum-reality-demo`,
  '/reference/':                `/demo/quantum-reality-demo`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(/(\/clones\/quantum\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|seznam\.cz)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  html = html.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr-banner|cookieconsent)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');

  // Strip blog post links, nemovitost detail links → home
  html = html.replace(/href="\/blog\/[^"]*"/gi, `href="/demo/quantum-reality-demo"`);
  html = html.replace(/href="\/nemovitosti\/[^"]*"/gi, `href="/demo/quantum-reality-demo"`);

  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?quantumreality\.cz\/[^"]*"/gi, `href="/demo/quantum-reality-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?quantumreality\.cz"/gi, `href="/demo/quantum-reality-demo"`);

  // Brand scrub
  html = html.replace(/QUANTUM\s+REALITY(?!\s*DEMO)/g, 'QUANTUM REALITY DEMO');
  html = html.replace(/Quantum\s+Reality(?!\s*Demo)/g, 'Quantum Reality Demo');
  html = html.replace(/quantumreality\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@quantumreality\.cz/gi, 'info@demo.local');

  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');
  html = html.replace(/href="https?:\/\/(?:maps\.google|maps\.app\.goo\.gl|goo\.gl|www\.google\.[a-z]+\/maps)[^"]*"/gi, 'href="#"');

  html = html.replace(/href="[^"]*wp-(?:admin|login)[^"]*"/gi, 'href="#"');
  html = html.replace(/<link[^>]*wp-json[^>]*>/gi, '');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:|fonts\.gstatic|fonts\.googleapis))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/quantumreality\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}
console.log('\nMirror done ✅');
