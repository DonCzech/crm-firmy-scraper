/**
 * Fix perfectcatering-demo v2
 * - Replace phone numbers, brand refs
 * - Add o-scroll--hidden override (show elements immediately)
 * - Store FULL HTML (with head CSS+JS links), cssUrls=[], jsUrls=[]
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Read current home.html (full HTML with head)
let html = fs.readFileSync(path.join(ROOT, 'public/clones/perfectcatering/pages/home.html'), 'utf8');
console.log(`Original HTML: ${html.length} bytes`);

// 1. Fix phone numbers
html = html
  .replace(/href="tel:\+420720[^"]*"/gi, 'href="tel:+420608288777"')
  .replace(/\+420\s*720[\s ]*934[\s ]*088/g, '+420 608 288 777')
  .replace(/\+420720[\s ]*934[\s ]*088/g, '+420 608 288 777');

// 2. Fix remaining Perfect Catering brand refs (without Demo)
html = html
  .replace(/Perfect Catering(?!\s*Praha|\s*Demo)/g, 'Demo Catering')
  .replace(/perfectcatering\.cz(?!\/clones)/gi, 'demo.local');

// 3. Override o-scroll--hidden: make elements visible immediately (no scroll trigger needed in demo)
html = html.replace(
  '/* Venom: hide consent overlay */',
  `/* Venom: hide consent overlay */
    /* Show scroll-reveal elements immediately in demo */
    .o-scroll--hidden { opacity: 1 !important; transform: none !important; transition: none !important; }
    /* Fix swiper coverflow scale on static capture */
    .swiper-slide { transform: none !important; z-index: 1 !important; opacity: 1 !important; }
    .swiper-slide-active { z-index: 2 !important; }`
);

// 4. Save updated file
fs.writeFileSync(path.join(ROOT, 'public/clones/perfectcatering/pages/home.html'), html);
console.log(`Updated HTML: ${html.length} bytes`);

// Audit
const phones  = (html.match(/\+420\s*72\d/g) || []).length;
const brand   = (html.match(/Perfect Catering(?!\s*Praha|\s*Demo)/g) || []).length;
const domain  = (html.match(/perfectcatering\.cz(?!\/clones)/gi) || []).length;
const hidden  = (html.match(/o-scroll--hidden/g) || []).length;
console.log(`After fix: phones=${phones} brand=${brand} domain=${domain} o-scroll-hidden=${hidden}`);

// 5. Update DB: full HTML, cssUrls=[], jsUrls=[]
const r = await pool.query(`
  SELECT s.id FROM sections s
  JOIN pages p ON s.page_id=p.id
  JOIN tenants t ON p.tenant_id=t.id
  WHERE t.slug='perfectcatering-demo' LIMIT 1
`);
const secId = r.rows[0].id;
console.log(`Section ID: ${secId}`);

const settings = {
  html,
  cssUrls: [],
  jsUrls: [],
};

await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [JSON.stringify(settings), secId]);
console.log(`DB updated ✅ — full HTML ${html.length} bytes, cssUrls=[], jsUrls=[]`);

await pool.end();
console.log('=== HOTOVO ===');
