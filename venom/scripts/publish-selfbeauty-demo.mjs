import pg from 'pg';
import { chromium } from 'playwright-core';
import fs from 'fs';
import sharp from 'sharp';

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });
const SLUG = 'selfbeauty-demo';

// 1. Set lifecycle_status = 'published'
const r = await pool.query(`UPDATE tenants SET lifecycle_status = 'published', updated_at = NOW() WHERE slug = $1 RETURNING id`, [SLUG]);
if (!r.rowCount) throw new Error('Tenant not found');
console.log(`lifecycle_status = published ✅ (tenant id: ${r.rows[0].id})`);
await pool.end();

// 2. Take preview screenshot → sharp resize → JPG
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`http://localhost:3015/demo/${SLUG}`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
const screenshotBuf = await page.screenshot({ fullPage: false });
await browser.close();

// Resize to 1280×800 JPG quality 80
const previewPath = `public/preview-${SLUG}.jpg`;
await sharp(screenshotBuf)
  .resize(1280, 800, { fit: 'cover' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(previewPath);

const size = fs.statSync(previewPath).size;
console.log(`Preview: ${previewPath} — ${Math.round(size/1024)}KB ✅`);
console.log('\nFÁZE 11 done. Add card to /preview page manually:');
console.log(`{ name: 'Demo Beauty Studio', slug: '${SLUG}', category: 'beauty & wellness', img: '/preview-${SLUG}.jpg' }`);
