/**
 * obfuscate-clone.mjs
 * Fáze 3 workflow: obfuskace klonovaného webu
 *
 * - Přejmenuje všechny CSS třídy + HTML ID na deterministic hash
 * - Odstraní komentáře, tracking scripty, meta generátor, data-atributy 3. stran
 * - Přepíše CSS soubory na disku + HTML ve všech full-page-clone sekcích v DB
 *
 * Použití:
 *   node scripts/obfuscate-clone.mjs <clone-name> <tenant-slug>
 *   node scripts/obfuscate-clone.mjs barber-urban barber-urban-demo
 *   node scripts/obfuscate-clone.mjs barber-urban barber-urban-demo --dry-run
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const [,, cloneName, tenantSlug, ...flags] = process.argv;
const DRY_RUN = flags.includes('--dry-run');

if (!cloneName || !tenantSlug) {
  console.error('Usage: node obfuscate-clone.mjs <clone-name> <tenant-slug>');
  process.exit(1);
}

const CLONE_DIR = join(ROOT, 'public', 'clones', cloneName);

// ─── DB ──────────────────────────────────────────────────────────────────────
const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  const env = readFileSync(join(ROOT, '.env.local'), 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k?.trim() && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── Hash function — deterministic, short, looks like CSS module hash ─────────
function classHash(name) {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  // 4-char base36, prefix 'x' (valid CSS class start)
  return 'x' + (h % (36 ** 4)).toString(36).padStart(4, '0');
}

function idHash(name) {
  // Same hash but prefix 'v' — IDs must be unique from classes
  let h = 0xdeadbeef;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return 'v' + (h % (36 ** 4)).toString(36).padStart(4, '0');
}

// ─── Detect if a #token is a CSS color value (not an ID) ─────────────────────
function isColorValue(token) {
  return /^[0-9a-fA-F]{3}$/.test(token) || /^[0-9a-fA-F]{6}$/.test(token);
}

// ─── Find all CSS files in clone dir ─────────────────────────────────────────
function findCssFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...findCssFiles(full));
    else if (entry.endsWith('.css')) results.push(full);
  }
  return results;
}

// ─── File extensions & pseudo-elements that aren't class names ───────────────
const NOT_CLASS = new Set([
  'css','js','mjs','json','html','php','xml',
  'woff','woff2','ttf','eot','otf','svg',
  'jpg','jpeg','png','gif','webp','avif','ico',
  'mp4','webm','ogg','mp3','wav',
  'pdf','zip','tar','gz',
  // CSS pseudo-elements / pseudo-classes caught by \.name pattern
  'before','after','first-child','last-child','nth-child',
  'first-of-type','last-of-type','hover','focus','active','visited',
  'checked','disabled','enabled','placeholder','not','root',
  'important','none','auto','normal','inherit','initial',
]);

// ─── IDs that must NOT be obfuscated (JS looks them up by exact name) ────────
const PRESERVE_IDS = new Set([
  // Tilda structural IDs (tilda-scripts-3.0.min.js calls getElementById on these)
  'allrecords', 't-header', 'tildacopy',
  'js-sbs-anim-trigger-styles', 'sbs-animation-block-overflow', 't396__overflow-styles',
]);

// ─── Class name PREFIXES that must be preserved (Tilda's own JS relies on these) ──
const PRESERVE_PREFIXES = [
  't-', 't_', 'tn-', 't396', 'uc-', 'tsc-',
  // Tilda zero-block elements
  't-body', 't-records', 't-rec',
];

// ─── Classes that must NOT be obfuscated — JS libraries create these dynamically ─
// Slick carousel: slick.min.js creates elements with these class names internally
// If we rename them in CSS, the JS-generated DOM won't get styled.
const PRESERVE_CLASSES = new Set([
  // Slick carousel (slick.min.js)
  'slick-slider','slick-list','slick-track','slick-slide','slick-cloned',
  'slick-arrow','slick-prev','slick-next','slick-dots','slick-active',
  'slick-current','slick-loading','slick-initialized','slick-vertical',
  'slick-disabled','slick-hidden',
  // jQuery UI (if used)
  'ui-widget','ui-dialog','ui-button','ui-icon',
  // Contact Form 7 (wpcf7 classes created by CF7 JS)
  'wpcf7-form','wpcf7-submit','wpcf7-response-output','wpcf7-not-valid',
  'wpcf7-not-valid-tip','wpcf7-spinner','wpcf7-acceptance',
  // WordPress standard JS classes
  'wp-block','wp-image','aligncenter','alignleft','alignright',
  // Normalize / resets — no class names, but safe to list
  // Google Maps (dynamically created by Maps JS API)
  'gm-style','gm-map','pac-container','pac-item',
  // Tilda structural classes used by Tilda JS
  'r','t-records','t-rec','t-body','t-animate','t-active','t-img',
  'mybutton', // Tilda custom button class
]);

// ─── Strip url() blocks to protect them during regex replacement ──────────────
function extractUrls(text) {
  const urls = [];
  const stripped = text.replace(/url\([^)]*\)/g, (match) => {
    urls.push(match);
    return `__URL_${urls.length - 1}__`;
  });
  return { stripped, urls };
}
function restoreUrls(text, urls) {
  return text.replace(/__URL_(\d+)__/g, (_, i) => urls[Number(i)]);
}

// ─── Extract class names from CSS ────────────────────────────────────────────
function extractCssClasses(css) {
  const classes = new Set();
  // Strip url() before extraction to avoid false positives (.woff2, .css, etc.)
  const { stripped } = extractUrls(css);
  const re = /\.([-a-zA-Z_][\w-]*)/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const name = m[1];
    if (/^\d/.test(name)) continue;
    if (NOT_CLASS.has(name.toLowerCase())) continue;
    if (name.length > 60) continue;
    classes.add(name);
  }
  return classes;
}

// ─── Extract class names from HTML class="..." attributes ────────────────────
function extractHtmlClasses(html) {
  const classes = new Set();
  const re = /\bclass="([^"]*)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    for (const cls of m[1].split(/\s+/)) {
      if (!cls || /^\d/.test(cls)) continue;
      if (NOT_CLASS.has(cls.toLowerCase())) continue;
      if (cls.length > 80) continue;
      classes.add(cls);
    }
  }
  return classes;
}

// ─── Extract ID names from HTML (real IDs, not colors) ───────────────────────
function extractHtmlIds(html) {
  const ids = new Set();
  const re = /\bid="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    for (const id of m[1].split(/\s+/)) {
      if (id && !isColorValue(id)) ids.add(id);
    }
  }
  return ids;
}

// ─── Build mapping tables ─────────────────────────────────────────────────────
function buildClassMap(classes) {
  const map = {};
  for (const cls of classes) {
    if (PRESERVE_CLASSES.has(cls)) continue; // keep third-party JS class names intact
    if (PRESERVE_PREFIXES.some(p => cls.startsWith(p))) continue; // keep Tilda structural classes
    map[cls] = classHash(cls);
  }
  return map;
}

function buildIdMap(ids) {
  const map = {};
  for (const id of ids) {
    if (PRESERVE_IDS.has(id)) continue; // keep structural IDs intact
    if (/^rec\d+$/.test(id)) continue; // keep Tilda section IDs (t396_init uses getElementById("rec"+id))
    map[id] = idHash(id);
  }
  return map;
}

// ─── Apply class mapping to CSS ───────────────────────────────────────────────
function obfuscateCss(css, classMap, idMap) {
  // Remove comments (/* ... */)
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Protect url() blocks — don't rename inside paths
  const { stripped, urls } = extractUrls(css);
  let result = stripped;

  // Replace .classname in selectors
  result = result.replace(/\.([-a-zA-Z_][\w-]*)/g, (match, cls) => {
    return classMap[cls] ? '.' + classMap[cls] : match;
  });

  // Replace #id in selectors (but NOT color values)
  result = result.replace(/#([-a-zA-Z_][\w-]*)/g, (match, id) => {
    if (isColorValue(id)) return match;
    return idMap[id] ? '#' + idMap[id] : match;
  });

  // Restore url() blocks
  result = restoreUrls(result, urls);

  return result;
}

// ─── Strip tracking and 3rd party scripts from HTML ──────────────────────────
const TRACKING_PATTERNS = [
  // Google Tag Manager
  /<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager -->/gi,
  /<!-- Google Tag Manager \(noscript\)[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/gi,
  /<script[^>]*googletagmanager[^>]*>[\s\S]*?<\/script>/gi,
  /<noscript[^>]*>[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/gi,
  // Google Analytics
  /<script[^>]*google-analytics[^>]*>[\s\S]*?<\/script>/gi,
  /<script>\s*(?:window\.dataLayer|gtag\(|ga\(|_gaq)[\s\S]*?<\/script>/gi,
  // Facebook Pixel
  /<script[^>]*>[\s\S]*?fbq\([\s\S]*?<\/script>/gi,
  /<noscript[^>]*>[\s\S]*?facebook\.com\/tr[\s\S]*?<\/noscript>/gi,
  // Hotjar
  /<script[^>]*>[\s\S]*?hjSiteSettings[\s\S]*?<\/script>/gi,
  // Yandex Metrika
  /<!-- Yandex\.Metrika counter -->[\s\S]*?<!-- \/Yandex\.Metrika counter -->/gi,
  /<script[^>]*>[\s\S]*?mc\.yandex[\s\S]*?<\/script>/gi,
  // Alteg / yclients booking
  /<script[^>]*alteg\.io[^>]*><\/script>/gi,
  /<script[^>]*yclients[^>]*><\/script>/gi,
  /<script>\s*var yWidgetSettings[\s\S]*?<\/script>/gi,
  /<script>\s*window\.addEventListener\('message'[\s\S]*?<\/script>/gi,
  // Elfsight widgets
  /<script[^>]*elfsight[^>]*defer[^>]*><\/script>/gi,
  /<div class="elfsight-app[^"]*"[^>]*><\/div>/gi,
  // Any script loading from external tracking domains
  /<script[^>]*(?:mc\.yandex|metrika|pixel\.facebook|connect\.facebook|hotjar\.com|clarity\.ms|tawk\.to|intercom\.io|crisp\.chat|tidio\.com)[^>]*>[\s\S]*?<\/script>/gi,
];

function stripTracking(html) {
  for (const pattern of TRACKING_PATTERNS) {
    html = html.replace(pattern, '<!-- removed -->');
  }
  return html;
}

// ─── Remove HTML comments (except conditional comments for IE) ─────────────
function stripComments(html) {
  // Keep <!--[if ...]> conditional comments, remove rest
  return html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
}

// ─── Remove generator/powered-by meta tags ───────────────────────────────────
function stripMetaGenerator(html) {
  html = html.replace(/<meta[^>]*name=["']generator["'][^>]*>/gi, '');
  html = html.replace(/<meta[^>]*content=["'][^"']*(?:WordPress|Joomla|Drupal|ModX|MODX|Wix|Squarespace|Webflow)[^"']*["'][^>]*>/gi, '');
  return html;
}

// ─── Remove 3rd party data attributes ────────────────────────────────────────
function stripThirdPartyDataAttrs(html) {
  // data-toggle, data-dismiss etc are Bootstrap — keep those
  // Remove data attributes specific to 3rd party tools
  html = html.replace(/\s+data-vc-[\w-]+="[^"]*"/g, '');
  html = html.replace(/\s+data-elementor-[\w-]+="[^"]*"/g, '');
  html = html.replace(/\s+data-yandex-[\w-]+="[^"]*"/g, '');
  return html;
}

// ─── Apply class mapping to HTML ─────────────────────────────────────────────
function obfuscateHtmlClasses(html, classMap) {
  // Replace class="..." attribute values
  html = html.replace(/\bclass="([^"]*)"/g, (match, classes) => {
    const replaced = classes.split(/\s+/).map(c => classMap[c] || c).join(' ');
    return `class="${replaced}"`;
  });
  // Replace class='...' single-quoted variant
  html = html.replace(/\bclass='([^']*)'/g, (match, classes) => {
    const replaced = classes.split(/\s+/).map(c => classMap[c] || c).join(' ');
    return `class='${replaced}'`;
  });
  return html;
}

// ─── Apply ID mapping to HTML ─────────────────────────────────────────────────
function obfuscateHtmlIds(html, idMap) {
  if (Object.keys(idMap).length === 0) return html;

  // Replace id="..." attributes
  html = html.replace(/\bid="([^"]*)"/g, (match, id) => {
    return `id="${idMap[id] || id}"`;
  });
  // Replace href="#id" anchor links
  html = html.replace(/href="#([^"]+)"/g, (match, id) => {
    return `href="#${idMap[id] || id}"`;
  });
  // Replace data-target="#id" (Bootstrap modals/tabs)
  html = html.replace(/data-target="#([^"]+)"/g, (match, id) => {
    return `data-target="#${idMap[id] || id}"`;
  });
  // Replace data-bs-target="#id"
  html = html.replace(/data-bs-target="#([^"]+)"/g, (match, id) => {
    return `data-bs-target="#${idMap[id] || id}"`;
  });
  // Replace aria-controls="id"
  html = html.replace(/aria-controls="([^"]+)"/g, (match, id) => {
    return `aria-controls="${idMap[id] || id}"`;
  });
  // Replace aria-labelledby="id"
  html = html.replace(/aria-labelledby="([^"]+)"/g, (match, id) => {
    return `aria-labelledby="${idMap[id] || id}"`;
  });
  // Replace for="id" labels
  html = html.replace(/\bfor="([^"]+)"/g, (match, id) => {
    return `for="${idMap[id] || id}"`;
  });

  return html;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔀 Obfuskace klonu: ${cloneName} / tenant: ${tenantSlug}${DRY_RUN ? ' [DRY RUN]' : ''}\n`);

  // ── Step 1: Read all CSS files ─────────────────────────────────────────────
  const cssFiles = findCssFiles(CLONE_DIR);
  console.log(`📂 Nalezeno ${cssFiles.length} CSS souborů v ${CLONE_DIR}`);

  const allCssClasses = new Set();
  const cssContents = {};
  for (const f of cssFiles) {
    const content = readFileSync(f, 'utf-8');
    cssContents[f] = content;
    for (const cls of extractCssClasses(content)) allCssClasses.add(cls);
  }
  console.log(`🎨 Nalezeno ${allCssClasses.size} unikátních CSS tříd`);

  // ── Step 2: Read all HTML from DB ─────────────────────────────────────────
  const client = await pool.connect();
  let tenantId, sections;
  try {
    const t = await client.query("SELECT id FROM tenants WHERE slug = $1", [tenantSlug]);
    tenantId = t.rows[0]?.id;
    if (!tenantId) throw new Error(`Tenant '${tenantSlug}' not found`);

    const s = await client.query(
      "SELECT s.id, s.page_id, p.slug, s.settings FROM sections s JOIN pages p ON p.id = s.page_id WHERE s.tenant_id = $1 AND s.section_type = 'full-page-clone' ORDER BY p.slug",
      [tenantId]
    );
    sections = s.rows;
    console.log(`📄 Nalezeno ${sections.length} full-page-clone sekcí v DB`);

    // Collect IDs and HTML-only classes from all pages
    const allIds = new Set();
    const allHtmlClasses = new Set();
    for (const section of sections) {
      const html = section.settings?.html ?? '';
      for (const id of extractHtmlIds(html)) allIds.add(id);
      for (const cls of extractHtmlClasses(html)) allHtmlClasses.add(cls);
    }
    // Merge HTML-only classes into the CSS class set
    for (const cls of allHtmlClasses) allCssClasses.add(cls);
    console.log(`🔖 Nalezeno ${allIds.size} HTML ID atributů, ${allHtmlClasses.size} HTML-only tříd`);

    // ── Step 3: Build mapping tables ──────────────────────────────────────────
    const classMap = buildClassMap(allCssClasses);
    const idMap = buildIdMap(allIds);

    // Check for collisions (extremely unlikely with FNV hash but let's verify)
    const classValues = Object.values(classMap);
    const idValues = Object.values(idMap);
    const classDupes = classValues.length - new Set(classValues).size;
    const idDupes = idValues.length - new Set(idValues).size;
    if (classDupes > 0) console.warn(`  ⚠️  ${classDupes} kolizí v class mapě — zkontroluj`);
    if (idDupes > 0) console.warn(`  ⚠️  ${idDupes} kolizí v ID mapě — zkontroluj`);

    console.log(`\n✅ Mapping: ${Object.keys(classMap).length} tříd, ${Object.keys(idMap).length} ID`);

    // Example output
    const sample = Object.entries(classMap).slice(0, 5);
    console.log('  Ukázka tříd:', sample.map(([k, v]) => `${k}→${v}`).join(', '));

    // ── Step 4: Rewrite CSS files ──────────────────────────────────────────────
    console.log('\n📝 Přepisuji CSS...');
    for (const [filePath, content] of Object.entries(cssContents)) {
      const obfuscated = obfuscateCss(content, classMap, idMap);
      if (!DRY_RUN) writeFileSync(filePath, obfuscated);
      const reduction = Math.round((1 - obfuscated.length / content.length) * 100);
      console.log(`  ✅ ${filePath.replace(CLONE_DIR, '')} (${content.length} → ${obfuscated.length} chars, -${reduction}% komentáře)`);
    }

    // ── Step 5: Process HTML for each page ────────────────────────────────────
    console.log('\n📝 Přepisuji HTML v DB...');
    for (const section of sections) {
      let html = section.settings?.html ?? '';
      const before = html.length;

      // Order matters: strip first (removes scripts), then obfuscate classes/IDs
      html = stripTracking(html);
      html = stripComments(html);
      html = stripMetaGenerator(html);
      html = stripThirdPartyDataAttrs(html);
      html = obfuscateHtmlClasses(html, classMap);
      html = obfuscateHtmlIds(html, idMap);

      const after = html.length;
      console.log(`  [${section.slug}] ${before} → ${after} chars`);

      if (!DRY_RUN) {
        const newSettings = { ...section.settings, html };
        await client.query(
          'UPDATE sections SET settings = $1 WHERE id = $2',
          [JSON.stringify(newSettings), section.id]
        );
      }
    }

    // ── Step 6: Save mapping to file for audit ─────────────────────────────────
    const mappingLog = {
      cloneName,
      tenantSlug,
      timestamp: new Date().toISOString(),
      classCount: Object.keys(classMap).length,
      idCount: Object.keys(idMap).length,
      classMap,
      idMap,
    };
    const logPath = join(ROOT, `template-lab/obfuscation-maps/${cloneName}.json`);
    if (!DRY_RUN) {
      import('fs').then(({ mkdirSync }) => {
        mkdirSync(dirname(logPath), { recursive: true });
        writeFileSync(logPath, JSON.stringify(mappingLog, null, 2));
      });
    }
    console.log(`\n📋 Mapping uložen do: template-lab/obfuscation-maps/${cloneName}.json`);

    console.log(`\n✅ Hotovo! Zkontroluj: http://localhost:3015/demo/${tenantSlug}`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
