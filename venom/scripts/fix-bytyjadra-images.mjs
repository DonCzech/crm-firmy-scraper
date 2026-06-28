/**
 * Fix bytyjadra: download missing images, re-process HTML
 */
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://www.bytyjadra.cz';
const OUT = 'public/clones/bytyjadra';

const IMAGES = [
  '/hero/25badge.png',
  '/hero/hero-1.png',
  '/hero/hero-1.webp',
  '/hero/hero-2.png',
  '/hero/hero-2.webp',
  '/hero/hero-3.png',
  '/hero/hero-3.webp',
  '/hero/hero-4.jpg',
  '/logo.png',
];

// Supabase gallery images → save to /clones/bytyjadra/gallery/
const SUPABASE_IMAGES = [
  { url: 'https://fuxyblhiyxgnmmqrfpwr.supabase.co/storage/v1/object/public/media/gallery/rodinny-dum/cover-1773259725447.jpg', local: '/gallery/rodinny-dum.jpg' },
  { url: 'https://fuxyblhiyxgnmmqrfpwr.supabase.co/storage/v1/object/public/media/gallery/rekonstrukce-bytu/cover-1774738914136.jpeg', local: '/gallery/rekonstrukce-bytu.jpg' },
  { url: 'https://fuxyblhiyxgnmmqrfpwr.supabase.co/storage/v1/object/public/media/gallery/rekonstrukce-koupelny-wc-kuchyn/cover-1774740192118.jpeg', local: '/gallery/rekonstrukce-koupelny.jpg' },
  { url: 'https://fuxyblhiyxgnmmqrfpwr.supabase.co/storage/v1/object/public/media/gallery/rekonstrukce-bytoveho-jadra/cover-1775489621371.jpeg', local: '/gallery/rekonstrukce-jadra.jpg' },
  { url: 'https://fuxyblhiyxgnmmqrfpwr.supabase.co/storage/v1/object/public/media/gallery/vystavba-radoveho-rd/cover-1774743757442.jpg', local: '/gallery/vystavba-rd.jpg' },
];

// Download images
for (const imgPath of IMAGES) {
  const dest = `${OUT}${imgPath}`;
  if (fs.existsSync(dest)) { console.log(`SKIP ${imgPath}`); continue; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    const r = await fetch(`${ORIGIN}${imgPath}`);
    if (!r.ok) { console.log(`FAIL ${imgPath}: ${r.status}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`OK   ${imgPath} (${buf.length} bytes)`);
  } catch(e) { console.log(`ERR  ${imgPath}: ${e.message}`); }
}

// Download supabase gallery images
const supabaseMap = new Map();
for (const { url, local } of SUPABASE_IMAGES) {
  const dest = `${OUT}${local}`;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) {
    try {
      const r = await fetch(url);
      if (!r.ok) { console.log(`FAIL ${local}: ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`OK   ${local} (${buf.length} bytes)`);
    } catch(e) { console.log(`ERR  ${local}: ${e.message}`); continue; }
  } else { console.log(`SKIP ${local}`); }
  supabaseMap.set(url, `/clones/bytyjadra${local}`);
}

const LINK_MAP = {
  '/':                  `/demo/bytyjadra-demo`,
  '/reference':         `/demo/bytyjadra-demo/reference`,
  '/poptavka':          `/demo/bytyjadra-demo/poptavka`,
  '/fotogalerie':       `/demo/bytyjadra-demo/galerie`,
  '/cookies':           `/demo/bytyjadra-demo`,
  '/gdpr':              `/demo/bytyjadra-demo`,
  '/obchodni-podminky': `/demo/bytyjadra-demo`,
};

function processHtml(html) {
  // Fix /_next/image?url=https%3A%2F%2F... → local gallery path
  for (const [origUrl, localPath] of supabaseMap) {
    const enc = encodeURIComponent(origUrl);
    html = html.replace(new RegExp(`/_next/image\\?url=${enc.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[^"'\\s]*`, 'gi'), localPath);
  }
  // Fix /_next/image?url=%2F... → direct path
  html = html.replace(/\/_next\/image\?url=(%2F[^&"'\s]+)(?:[&;][^"'\s]*)?/gi, (m, enc) => {
    try { return decodeURIComponent(enc); } catch { return m; }
  });
  // srcset: remove query params from local paths
  html = html.replace(/(\/(?:hero|logo|gallery)[^"'\s]+)\?[^"'\s]*/g, '$1');

  // Strip analytics/tracking
  html = html.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  // Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Internal links
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?bytyjadra\.cz\/[^"]*"/gi, `href="/demo/bytyjadra-demo"`);

  // Brand scrub
  html = html.replace(/bytyjadra\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@bytyjadra\.cz/gi, 'info@demo.local');

  // Maps
  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');
  html = html.replace(/href="https?:\/\/(?:maps\.google|goo\.gl|maps\.app\.goo\.gl)[^"]*"/gi, 'href="#"');

  return html;
}

const PAGES = ['home','reference','poptavka','galerie'];
console.log('\n--- Re-processing HTML ---');
for (const slug of PAGES) {
  const rawFile = `${OUT}/pages/${slug}-raw.html`;
  if (!fs.existsSync(rawFile)) { console.log(`SKIP ${slug} (no raw)`); continue; }
  const raw = fs.readFileSync(rawFile, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|fonts\.gstatic|fonts\.googleapis|appleid\.apple))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/bytyjadra\.cz/gi) || []).length;
  const nextImgLeft = (processed.match(/\/_next\/image\?url=/gi) || []).length;
  console.log(`${slug}: ext=${extLeft} brand=${brandLeft} nextImg=${nextImgLeft}`);
}
console.log('\nFix done ✅');
