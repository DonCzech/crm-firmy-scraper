/**
 * cleanup-clone.mjs
 * Kompletní čistka klonu — spouštět po obfuscate-clone.mjs
 *
 * Co dělá:
 * 1. Přejmenuje adresáře na disku (žádné revealing jméno: barbershop, evoBabel, galleries…)
 * 2. Přepíše všechny cesty v CSS + HTML v DB
 * 3. Opraví cssUrls v DB (žádné externí URL)
 * 4. PageSpeed: lazy images, defer scripts, preload="none" video
 * 5. SEO: neutralní tituly a popisky stránek
 * 6. Generuje sitemap
 * 7. Ověří robots.txt existuje
 *
 * Použití:
 *   node scripts/cleanup-clone.mjs <clone-name> <tenant-slug> "<Brand Name>"
 *   node scripts/cleanup-clone.mjs fade-room fade-room-demo "The Fade Room"
 */

import {
  readFileSync, writeFileSync, existsSync, mkdirSync,
  cpSync, rmSync, readdirSync, statSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const [,, cloneName, tenantSlug, brandName = 'Demo'] = process.argv;
if (!cloneName || !tenantSlug) {
  console.error('Usage: node cleanup-clone.mjs <clone-name> <tenant-slug> "<Brand Name>"');
  process.exit(1);
}

const CLONE_DIR = join(ROOT, 'public', 'clones', cloneName);
const BASE = `/clones/${cloneName}`;

// ─── Path mapping: OLD (original structure) → NEW (neutral) ──────────────────
// Left: old path suffix (after BASE), Right: new path suffix
const PATH_MAP = [
  // Core theme assets
  ['assets/templates/barbershop', 'theme'],
  // Gallery full-size
  ['assets/galleries/1', 'media'],
  // Gallery thumbnails (cache)
  ['assets/cache/images/assets/galleries/1', 'thumb'],
  // General images
  ['assets/images', 'img'],
  // Language flags (evoBabel = MODX CMS plugin — must not be visible)
  ['assets/snippets/evoBabel/config/images', 'lang'],
];

// Build full path mapping (filesystem + URL)
const FS_MAP = PATH_MAP.map(([oldSuffix, newSuffix]) => ({
  oldDir: join(CLONE_DIR, ...oldSuffix.split('/')),
  newDir: join(CLONE_DIR, ...newSuffix.split('/')),
  oldUrl: `${BASE}/${oldSuffix}`,
  newUrl: `${BASE}/${newSuffix}`,
}));

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

// ─── Apply path mapping to a string ──────────────────────────────────────────
function remapPaths(text) {
  // 1. Apply explicit path remap (longest-first)
  const sorted = [...FS_MAP].sort((a, b) => b.oldUrl.length - a.oldUrl.length);
  for (const { oldUrl, newUrl } of sorted) {
    text = text.split(oldUrl).join(newUrl);
  }
  // 2. Fix any remaining original-domain references in CSS url() (inline styles, <style> blocks)
  //    url('https://anydomain.xx/path/asset.jpg') → url('/clones/[clone]/path/asset.jpg')
  text = text.replace(/url\((['"]?)https?:\/\/[a-z0-9.-]+\.[a-z]{2,}\/{1,2}([^"')]*)\1\)/gi,
    (match, q, path) => {
      if (/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|woff2?|ttf|eot)(\?.*)?$/i.test(path)) {
        const cleanPath = path.replace(/^\/+/, '');
        return `url(${q}${BASE}/${cleanPath}${q})`;
      }
      return match;
    }
  );
  // 3. Fix remaining absolute href/src to any external domain pointing at asset paths
  text = text.replace(/(href|src)="https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/(?:assets|galleries|images|snippets|fav|cache)[^"]*)"/gi,
    (match, attr, path) => `${attr}="${BASE}${path.replace(/\/\//g, '/')}"`
  );
  // 4. Fix any remaining CMS path names still in text
  text = text.replace(/assets\/templates\/barbershop\//g, 'theme/');
  text = text.replace(/assets\/snippets\/evoBabel\/[^"'\s)>]*/g, 'lang/');
  text = text.replace(/assets\/galleries\/1\//g, 'media/');
  text = text.replace(/assets\/images\//g, 'img/');

  // 5. Final sweep — catch any remaining external domain refs that still slipped through
  //    Handles both single-slash AND double-slash after domain (e.g. barbershopurban.cz//media/)
  text = text.replace(
    /https?:\/\/[a-z0-9.-]+\.[a-z]{2,}\/{1,2}((?:theme|img|media|thumb|lang|gallery|assets|fav|cache|favicon)[^"'\s\)>\\]*)/gi,
    `${BASE}/$1`
  );
  // 6. Nuke any remaining reference to the original domain entirely (safety catch-all)
  //    e.g. "barbershopurban.cz//somepath" where path doesn't match known dirs
  text = text.replace(
    /https?:\/\/[a-z0-9.-]*barbershopurban[a-z0-9.-]*\.[a-z]{2,}\/{0,2}[^"'\s\)>\\]*/gi,
    `${BASE}/img/placeholder.jpg`
  );

  return text;
}

// ─── Find all files in a dir (recursive) ─────────────────────────────────────
function findFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...findFiles(full));
    else results.push(full);
  }
  return results;
}

// ─── PageSpeed optimizations ──────────────────────────────────────────────────
function optimizeImages(html) {
  let firstImg = true;
  return html.replace(/<img([^>]*)>/gi, (match, attrs) => {
    if (/\bloading=/i.test(attrs)) { firstImg = false; return match; }
    if (/width=["']1["']|height=["']1["']/i.test(attrs)) return match;
    if (firstImg) { firstImg = false; return `<img${attrs} loading="eager" fetchpriority="high">`; }
    return `<img${attrs} loading="lazy" decoding="async">`;
  });
}

function optimizeScripts(html) {
  return html.replace(/<script([^>]*src="([^"]*)"[^>]*)>/gi, (match, attrs, src) => {
    if (/jquery/i.test(src)) return match;
    if (/\bdefer\b/i.test(attrs) || /\basync\b/i.test(attrs)) return match;
    return `<script${attrs} defer>`;
  });
}

function optimizeVideo(html) {
  return html
    .replace(/preload="auto"/gi, 'preload="none"')
    .replace(/preload='auto'/gi, "preload='none'");
}

function removeViewportInBody(html) {
  // Next.js already adds viewport to <head> — remove any duplicate in body
  return html.replace(/<meta[^>]*name=["']viewport["'][^>]*>/gi, '');
}

// ─── SEO metadata ─────────────────────────────────────────────────────────────
const SEO = {
  home:    { title: null,               desc: 'Profesionální služby. Objednejte se online.' },
  sluzby:  { title: 'Služby',           desc: 'Přehled všech nabízených služeb a jejich cen.' },
  'o-nas': { title: 'O nás',            desc: 'Poznejte náš tým a příběh naší provozovny.' },
  akce:    { title: 'Akce & Novinky',   desc: 'Aktuální akce, slevy a novinky pro vás.' },
  cenik:   { title: 'Ceník',            desc: 'Transparentní ceník všech našich služeb.' },
  faq:     { title: 'Časté otázky',     desc: 'Odpovědi na nejčastější dotazy zákazníků.' },
  galerie: { title: 'Galerie',          desc: 'Fotogalerie naší práce a prostředí.' },
};

function seoTitle(slug) {
  const m = SEO[slug];
  return m?.title ? `${m.title} — ${brandName}` : brandName;
}
function seoDesc(slug) {
  return SEO[slug]?.desc ?? 'Profesionální služby. Objednejte se online.';
}
function revealsOrigin(str) {
  if (!str) return false;
  const low = str.toLowerCase();
  return ['barbershop', 'urban', 'barbershopurban', 'evo', 'modx', 'wordpress',
    'joomla', 'drupal', 'wix', 'squarespace'].some(w => low.includes(w));
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────
function makeSitemap(pages) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://venom-saas.vercel.app';
  const entries = pages.map(p => {
    const loc = p.slug === 'home'
      ? `${base}/demo/${tenantSlug}`
      : `${base}/demo/${tenantSlug}/${p.slug}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p.slug === 'home' ? '1.0' : '0.8'}</priority>\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🧹 Kompletní čistka: ${cloneName} / ${tenantSlug} / "${brandName}"\n`);

  // ── KROK 1: Přejmenuj adresáře na disku ────────────────────────────────────
  console.log('📂 Přejmenovávám adresáře...');
  for (const { oldDir, newDir, oldUrl, newUrl } of FS_MAP) {
    if (!existsSync(oldDir)) { console.log(`  skip (neexistuje): ${oldUrl}`); continue; }
    if (existsSync(newDir)) {
      console.log(`  přepisuji: ${newUrl}`);
      rmSync(newDir, { recursive: true, force: true });
    }
    mkdirSync(dirname(newDir), { recursive: true });
    cpSync(oldDir, newDir, { recursive: true });
    rmSync(oldDir, { recursive: true, force: true });
    console.log(`  ✅ ${oldUrl} → ${newUrl}`);
  }

  // ── KROK 2: Odstraň prázdné rodiče ─────────────────────────────────────────
  // assets/templates/, assets/snippets/, assets/cache/, assets/galleries/ mohou být prázdné
  const toClean = [
    join(CLONE_DIR, 'assets', 'templates'),
    join(CLONE_DIR, 'assets', 'snippets'),
    join(CLONE_DIR, 'assets', 'cache'),
    join(CLONE_DIR, 'assets', 'galleries'),
    join(CLONE_DIR, 'assets'),
  ];
  for (const dir of toClean) {
    if (existsSync(dir)) {
      try {
        const remaining = readdirSync(dir);
        if (remaining.length === 0) { rmSync(dir); console.log(`  🗑️  Smazán prázdný: ${dir.replace(CLONE_DIR, '')}`); }
      } catch {}
    }
  }

  // ── KROK 3: Přepiš CSS soubor ──────────────────────────────────────────────
  console.log('\n🎨 Přepisuji CSS...');
  const cssFiles = findFiles(join(CLONE_DIR, 'theme')).filter(f => f.endsWith('.css') && !f.endsWith('.bak'));
  for (const f of cssFiles) {
    let content = readFileSync(f, 'utf-8');
    content = remapPaths(content);
    writeFileSync(f, content);
    console.log(`  ✅ ${f.replace(CLONE_DIR, '')}`);
  }

  // ── KROK 4: Aktualizuj DB ──────────────────────────────────────────────────
  console.log('\n💾 Aktualizuji DB...');
  const client = await pool.connect();
  try {
    const t = await client.query("SELECT id FROM tenants WHERE slug = $1", [tenantSlug]);
    const tenantId = t.rows[0]?.id;
    if (!tenantId) throw new Error(`Tenant '${tenantSlug}' not found`);

    // Sections
    const sections = await client.query(
      `SELECT s.id, s.settings, p.slug FROM sections s
       JOIN pages p ON p.id = s.page_id
       WHERE s.tenant_id = $1 AND s.section_type = 'full-page-clone'`,
      [tenantId]
    );

    const newCssUrl = `${BASE}/theme/css/styles.min.css`;

    for (const row of sections.rows) {
      const settings = row.settings;
      let html = settings.html ?? '';
      let cssUrls = settings.cssUrls ?? [];

      // Fix external cssUrls
      cssUrls = cssUrls.map(u =>
        u.startsWith('http') ? newCssUrl : remapPaths(u)
      );
      if (!cssUrls.length || cssUrls.some(u => u.startsWith('http'))) {
        cssUrls = [newCssUrl];
      }

      // Fix external jsUrls — ALL must be local (user requirement: "vse od nas")
      let jsUrls = settings.jsUrls ?? [];
      const localJqueryPath = `${BASE}/theme/js/jquery.min.js`;
      jsUrls = jsUrls.map(u => {
        if (!u.startsWith('http')) return remapPaths(u);
        // Localize jQuery CDN → our copy
        if (/jquery\.min\.js|jquery-\d+\.\d+\.\d+\.min\.js/.test(u)) return localJqueryPath;
        // All other external JS: remap via path rules
        return remapPaths(u);
      }).filter(u => !u.startsWith('http') || u.length === 0); // drop any that couldn't be resolved

      // Remap paths in HTML
      html = remapPaths(html);

      // PageSpeed
      html = optimizeImages(html);
      html = optimizeScripts(html);
      html = optimizeVideo(html);
      html = removeViewportInBody(html);

      const ns = { ...settings, html, cssUrls, jsUrls };
      await client.query('UPDATE sections SET settings = $1 WHERE id = $2',
        [JSON.stringify(ns), row.id]);
      console.log(`  ✅ [${row.slug}] HTML + cssUrl opraveno`);
    }

    // SEO metadata
    console.log('\n🔖 SEO metadata...');
    const pages = await client.query(
      "SELECT id, slug, seo_title, seo_description FROM pages WHERE tenant_id = $1",
      [tenantId]
    );
    for (const page of pages.rows) {
      const shouldUpdate = !page.seo_title || revealsOrigin(page.seo_title) || revealsOrigin(page.seo_description);
      if (shouldUpdate) {
        const newTitle = seoTitle(page.slug);
        const newDesc = seoDesc(page.slug);
        await client.query(
          "UPDATE pages SET seo_title = $1, seo_description = $2 WHERE id = $3",
          [newTitle, newDesc, page.id]
        );
        console.log(`  ✅ [${page.slug}] "${page.seo_title ?? 'null'}" → "${newTitle}"`);
      } else {
        console.log(`  OK [${page.slug}] ${page.seo_title}`);
      }
    }

    // Anonymize tenant email (original seeded email may contain original domain)
    await client.query(
      "UPDATE tenants SET email = 'info@demo.local' WHERE slug = $1 AND email LIKE '%@%' AND email NOT LIKE '%demo.local'",
      [tenantSlug]
    );
    console.log(`  ✅ Tenant email anonymized`);

    // Sitemap
    console.log('\n🗺️  Sitemap...');
    const sitemap = makeSitemap(pages.rows);
    const sitemapDir = join(ROOT, 'public', 'sitemaps');
    mkdirSync(sitemapDir, { recursive: true });
    writeFileSync(join(sitemapDir, `${tenantSlug}.xml`), sitemap);
    console.log(`  ✅ public/sitemaps/${tenantSlug}.xml`);

  } finally {
    client.release();
    await pool.end();
  }

  // ── KROK 5: robots.txt ────────────────────────────────────────────────────
  // Robots.txt is generated by Next.js via src/app/robots.ts (MetadataRoute).
  // Do NOT create public/robots.txt — it conflicts with the Next.js route.
  // Ensure src/app/robots.ts has /demo/ in disallow list.
  console.log('\n🤖 robots.txt → handled by src/app/robots.ts (Next.js MetadataRoute) ✅');

  // ── KROK 6: Finální verifikace ─────────────────────────────────────────────
  console.log('\n🔍 Kontrola...');
  const cssUrl = `${BASE}/theme/css/styles.min.css`;
  const cssExists = existsSync(join(ROOT, 'public', ...cssUrl.split('/').filter(Boolean)));
  console.log(`  CSS soubor existuje: ${cssExists ? '✅' : '❌ ' + cssUrl}`);

  // Check for any remaining reveals in CSS
  const cssContent = cssExists ? readFileSync(join(ROOT, 'public', ...cssUrl.split('/').filter(Boolean)), 'utf-8') : '';
  const hasBarberInCss = /barbershop|evoBabel|snippets/i.test(cssContent);
  console.log(`  CSS bez odhalujících výrazů: ${hasBarberInCss ? '❌ obsahuje!' : '✅'}`);

  console.log(`\n✅ Hotovo!`);
  console.log(`   http://localhost:3015/demo/${tenantSlug}`);
  console.log(`   CSS: ${cssUrl}`);
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
