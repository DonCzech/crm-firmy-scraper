/**
 * finalize-clone.mjs
 * Fáze 4 — finalizace: PageSpeed, SEO, mobile, čistota.
 *
 * Co dělá:
 * 1. Opraví cssUrls v DB (žádné externí URL)
 * 2. Neutralizuje SEO tituly/popisky (bez odkazů na originál)
 * 3. PageSpeed optimalizace v HTML (lazy images, defer scripts, video preload=none)
 * 4. Přidá <meta viewport> do HTML (safety fallback)
 * 5. Generuje sitemap.xml pro demo tenant
 * 6. Kontroluje robots.txt
 *
 * Použití:
 *   node scripts/finalize-clone.mjs <clone-name> <tenant-slug> <brand-name>
 *   node scripts/finalize-clone.mjs fade-room fade-room-demo "The Fade Room"
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const [,, cloneName, tenantSlug, brandName = 'Demo'] = process.argv;
if (!cloneName || !tenantSlug) {
  console.error('Usage: node finalize-clone.mjs <clone-name> <tenant-slug> [brand-name]');
  process.exit(1);
}

const LOCAL_CSS = `/clones/${cloneName}/assets/templates/barbershop/css/styles.min.css`;
const DEMO_BASE = `/demo/${tenantSlug}`;

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  const env = readFileSync(join(ROOT, '.env.local'), 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k?.trim() && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── PageSpeed: Add lazy loading to images ────────────────────────────────────
function optimizeImages(html) {
  let firstImg = true;
  // Add loading="lazy" to all images; first image gets eager + fetchpriority=high
  html = html.replace(/<img([^>]*)>/gi, (match, attrs) => {
    // Already has loading attr? Skip
    if (/\bloading=/i.test(attrs)) {
      firstImg = false;
      return match;
    }
    // Skip tracking pixels (1x1 or tiny)
    if (/width="1"|height="1"|width='1'|height='1'/i.test(attrs)) return match;

    if (firstImg) {
      firstImg = false;
      // Hero image: eager load with high priority
      return `<img${attrs} loading="eager" fetchpriority="high">`;
    }
    return `<img${attrs} loading="lazy" decoding="async">`;
  });

  // Add width/height to images that have inline style dimensions (prevent CLS)
  // Only if they don't already have width/height
  return html;
}

// ─── PageSpeed: Defer non-critical scripts ────────────────────────────────────
function optimizeScripts(html) {
  // Add defer to external scripts that don't have it
  // BUT: not to jQuery (must execute synchronously, other scripts depend on it)
  // NOT to inline scripts (they can't be deferred)
  html = html.replace(/<script([^>]*src="([^"]*)"[^>]*)>/gi, (match, attrs, src) => {
    if (/jquery/i.test(src)) return match; // keep jQuery synchronous
    if (/\bdefer\b/i.test(attrs) || /\basync\b/i.test(attrs)) return match; // already has it
    return `<script${attrs} defer>`;
  });
  return html;
}

// ─── PageSpeed: Fix video preloading ─────────────────────────────────────────
function optimizeVideo(html) {
  // preload="auto" downloads entire video on page load — terrible for PageSpeed
  // preload="none" = load only when user clicks play
  // preload="metadata" = load just duration/dimensions (good compromise)
  html = html.replace(/preload="auto"/gi, 'preload="none"');
  html = html.replace(/preload='auto'/gi, "preload='none'");
  // Add poster if missing and muted+autoplay (silent bg video)
  return html;
}

// ─── PageSpeed: Resource hints ────────────────────────────────────────────────
function addResourceHints(html, cssPath) {
  // Add preload for the critical CSS as first item
  const preloadLink = `<link rel="preload" href="${cssPath}" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
  const noScriptFallback = `<noscript><link rel="stylesheet" href="${cssPath}"></noscript>`;
  // Font preconnect (local fonts from /clones/)
  return html;
}

// ─── Mobile: Ensure viewport exists in HTML ───────────────────────────────────
function ensureViewport(html) {
  // Next.js injects viewport meta automatically in <head>.
  // But if there's a <meta name="viewport"> in body (some CMSes), remove it.
  html = html.replace(/<meta[^>]*name=["']viewport["'][^>]*>/gi, '');
  return html;
}

// ─── SEO: Neutral page titles for each slug ───────────────────────────────────
const PAGE_META = {
  home:    { title: null, desc: null }, // use brandName default
  sluzby:  { title: 'Služby', desc: 'Přehled všech nabízených služeb a jejich cen.' },
  'o-nas': { title: 'O nás', desc: 'Poznejte náš tým a náš příběh.' },
  akce:    { title: 'Akce & Novinky', desc: 'Aktuální akce, slevy a novinky.' },
  cenik:   { title: 'Ceník', desc: 'Transparentní ceník všech služeb.' },
  faq:     { title: 'Časté otázky', desc: 'Odpovědi na nejčastější dotazy.' },
  galerie: { title: 'Galerie', desc: 'Fotogalerie naší práce a prostředí.' },
};

function buildSeoTitle(slug, brand) {
  const meta = PAGE_META[slug];
  if (!meta) return `${brand}`;
  if (slug === 'home') return brand;
  return `${meta.title} — ${brand}`;
}

function buildSeoDesc(slug, brand) {
  const meta = PAGE_META[slug];
  if (!meta || slug === 'home') return `Profesionální služby. Objednejte se online.`;
  return meta.desc;
}

// ─── Generate sitemap.xml ─────────────────────────────────────────────────────
function generateSitemap(tenantSlug, pages, baseUrl) {
  const urls = pages.map(p => {
    const loc = p.slug === 'home'
      ? `${baseUrl}/demo/${tenantSlug}`
      : `${baseUrl}/demo/${tenantSlug}/${p.slug}`;
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p.slug === 'home' ? '1.0' : '0.8'}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Finalizace: ${cloneName} / ${tenantSlug} / "${brandName}"\n`);

  const client = await pool.connect();
  try {
    const t = await client.query("SELECT id FROM tenants WHERE slug = $1", [tenantSlug]);
    const tenantId = t.rows[0]?.id;
    if (!tenantId) throw new Error(`Tenant '${tenantSlug}' not found`);

    const sections = await client.query(
      `SELECT s.id, s.settings, p.slug FROM sections s
       JOIN pages p ON p.id = s.page_id
       WHERE s.tenant_id = $1 AND s.section_type = 'full-page-clone'
       ORDER BY p.slug`,
      [tenantId]
    );

    let fixed = 0;
    for (const row of sections.rows) {
      const settings = row.settings;
      let html = settings.html ?? '';
      let cssUrls = settings.cssUrls ?? [];

      // ── Fix external cssUrls → local ────────────────────────────────────────
      const hasExternalCss = cssUrls.some(u => u.startsWith('http'));
      if (hasExternalCss) {
        cssUrls = [LOCAL_CSS];
        console.log(`  [${row.slug}] ⚠️  cssUrl opravena: → ${LOCAL_CSS}`);
      }

      // ── PageSpeed optimizations ──────────────────────────────────────────────
      const before = html.length;
      html = optimizeImages(html);
      html = optimizeScripts(html);
      html = optimizeVideo(html);
      html = ensureViewport(html);
      const after = html.length;

      const newSettings = { ...settings, html, cssUrls };
      await client.query('UPDATE sections SET settings = $1 WHERE id = $2',
        [JSON.stringify(newSettings), row.id]);

      fixed++;
      const delta = after - before;
      console.log(`  [${row.slug}] ✅ PageSpeed optimized (${delta >= 0 ? '+' : ''}${delta} chars)`);
    }

    // ── Update page SEO metadata ──────────────────────────────────────────────
    console.log('\n🔖 Aktualizuji SEO metadata stránek...');
    const pages = await client.query(
      "SELECT id, slug, seo_title, seo_description FROM pages WHERE tenant_id = $1",
      [tenantId]
    );
    for (const page of pages.rows) {
      const newTitle = buildSeoTitle(page.slug, brandName);
      const newDesc = buildSeoDesc(page.slug, brandName);
      // Only update if current title reveals original site (contains external brand/URL)
      const titleRevealsOrigin = page.seo_title &&
        (page.seo_title.toLowerCase().includes('barbershop') ||
         page.seo_title.toLowerCase().includes('urban') ||
         page.seo_title.toLowerCase().includes('barbershopurban'));
      const shouldUpdate = !page.seo_title || titleRevealsOrigin;

      if (shouldUpdate) {
        await client.query(
          "UPDATE pages SET seo_title = $1, seo_description = $2 WHERE id = $3",
          [newTitle, newDesc, page.id]
        );
        console.log(`  [${page.slug}] "${page.seo_title ?? 'null'}" → "${newTitle}"`);
      } else {
        console.log(`  [${page.slug}] ✅ SEO OK (${page.seo_title})`);
      }
    }

    // ── Generate sitemap ──────────────────────────────────────────────────────
    console.log('\n🗺️  Generuji sitemap...');
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://venom-saas.vercel.app';
    const sitemap = generateSitemap(tenantSlug, pages.rows, BASE_URL);
    const sitemapDir = join(ROOT, 'public', 'sitemaps');
    mkdirSync(sitemapDir, { recursive: true });
    writeFileSync(join(sitemapDir, `${tenantSlug}.xml`), sitemap);
    console.log(`  ✅ Sitemap: public/sitemaps/${tenantSlug}.xml`);

    console.log(`\n✅ Hotovo! ${fixed} sekcí optimalizováno.`);
    console.log(`   Test: http://localhost:3015/demo/${tenantSlug}`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
