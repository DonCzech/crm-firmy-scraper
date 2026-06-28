/**
 * Stáhne Google Fonts (Oswald + Overpass) lokálně a vytvoří fonts.css
 * Output: public/clones/peak-cut/fonts/
 *         public/clones/peak-cut/fonts/fonts.css
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(__dirname, '../public/clones/peak-cut/fonts');
const CLONE_PATH = '/clones/peak-cut';

fs.mkdirSync(FONTS_DIR, { recursive: true });

const FONT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/css,*/*;q=0.1',
};

async function fetchCss(url) {
  const res = await fetch(url, { headers: FONT_HEADERS });
  return res.text();
}

async function downloadFont(url, dest) {
  if (fs.existsSync(dest)) { console.log('  SKIP:', path.basename(dest)); return; }
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
  console.log('  OK:', path.basename(dest), `(${buf.byteLength}b)`);
}

async function main() {
  console.log('=== Lokalizace Google Fonts ===');

  // Fetch CSS pro oba fonty najednou
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Oswald:wght@200;400;600&family=Overpass:wght@400;500&display=swap';
  const rawCss = await fetchCss(cssUrl);
  console.log('Fetched font CSS, length:', rawCss.length);

  // Parsovat všechny @font-face bloky
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
  const urlRegex = /src:\s*url\(([^)]+)\)\s*format\(['"]([^'"]+)['"]\)/g;
  const familyRegex = /font-family:\s*['"]?([^;'"]+)['"]?;/;
  const weightRegex = /font-weight:\s*(\d+)/;
  const styleRegex = /font-style:\s*([^;]+);/;

  const fontFaces = [];
  let match;
  while ((match = fontFaceRegex.exec(rawCss)) !== null) {
    const block = match[1];
    const family = familyRegex.exec(block)?.[1]?.trim().replace(/['"]/g, '');
    const weight = weightRegex.exec(block)?.[1];
    const style = styleRegex.exec(block)?.[1]?.trim() || 'normal';

    // Najít woff2 URL
    let woff2Url = null;
    const srcBlock = block.match(/src:[^;]+/)?.[0] || '';
    const woff2Match = srcBlock.match(/url\(([^)]+)\)\s*format\(['"]woff2['"]\)/);
    if (woff2Match) woff2Url = woff2Match[1].replace(/['"]/g, '');

    if (family && weight && woff2Url) {
      const filename = `${family.replace(/\s+/g, '')}-${weight}${style !== 'normal' ? '-' + style : ''}.woff2`;
      fontFaces.push({ family, weight, style, woff2Url, filename });
    }
  }

  console.log(`\nNalezeno ${fontFaces.length} @font-face bloků`);

  // Stáhnout fonty
  for (const f of fontFaces) {
    const dest = path.join(FONTS_DIR, f.filename);
    console.log(`Stahuji ${f.family} ${f.weight}...`);
    await downloadFont(f.woff2Url, dest);
  }

  // Vygenerovat lokální fonts.css
  const css = fontFaces.map(f => `@font-face {
  font-family: '${f.family}';
  font-style: ${f.style};
  font-weight: ${f.weight};
  font-display: swap;
  src: url('${CLONE_PATH}/fonts/${f.filename}') format('woff2');
}`).join('\n\n');

  const cssPath = path.join(FONTS_DIR, 'fonts.css');
  fs.writeFileSync(cssPath, css, 'utf-8');
  console.log(`\nFonts CSS uložen: ${cssPath}`);
  console.log(`Lokální CSS URL: ${CLONE_PATH}/fonts/fonts.css`);
  console.log('\n=== HOTOVO ===');
  console.log('Přidat do cssUrls v seed skriptu:');
  console.log(`  '${CLONE_PATH}/fonts/fonts.css'`);
}

main().catch(e => { console.error(e); process.exit(1); });
