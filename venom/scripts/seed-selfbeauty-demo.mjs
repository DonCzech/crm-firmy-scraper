/**
 * FÁZE 2 — Seed DB pro selfbeauty-demo
 * WIX Thunderbolt / rendered snapshot, 5 stránek
 */

import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'selfbeauty-demo';
const ACCESS_TOKEN = 'selfb' + Math.random().toString(36).slice(2, 12);
const CLONE_PATH = '/clones/selfbeauty';

const PAGES = [
  { slug: 'home',            title: 'Domů',             file: 'home-raw.html',            isHome: true  },
  { slug: 'cenik-barber',    title: 'Ceník Barbershop', file: 'cenik-barber-raw.html',    isHome: false },
  { slug: 'cenik-manikura',  title: 'Ceník Manikúra',   file: 'cenik-manikura-raw.html',  isHome: false },
  { slug: 'cenik-kosmetika', title: 'Ceník Kosmetika',  file: 'cenik-kosmetika-raw.html', isHome: false },
  { slug: 'darkovy-poukaz',  title: 'Dárkový poukaz',   file: 'darkovy-poukaz-raw.html',  isHome: false },
];

function log(msg) { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }

// Wix image URL → local path
function rewriteWixImages(html) {
  return html.replace(
    /https:\/\/static\.wixstatic\.com\/media\/([^"' )\n/]+(?:~|%7E)mv2\.[a-zA-Z]{2,4})[^"' )\n]*/gi,
    (match, id) => {
      const localName = id.replace(/%7E/gi, '~').replace(/[~%]/g, '_');
      return `/clones/selfbeauty/img/${localName}`;
    }
  );
}

// Rewrite internal links
function rewriteLinks(html) {
  const linkMap = {
    'selfbeautystudio.com/cenik-barber-shop': '/demo/selfbeauty-demo/cenik-barber',
    'selfbeautystudio.com/cenik-manikura-a-pedikura': '/demo/selfbeauty-demo/cenik-manikura',
    'selfbeautystudio.com/cenik-kosmetika': '/demo/selfbeauty-demo/cenik-kosmetika',
    'selfbeautystudio.com/darkovy-poukaz': '/demo/selfbeauty-demo/darkovy-poukaz',
    'selfbeautystudio.com/rezervace': '#rezervace',
    'selfbeautystudio.com/blog': '#',
    'selfbeautystudio.com/dom%C5%AF': '/demo/selfbeauty-demo',
    'selfbeautystudio.com/domů': '/demo/selfbeauty-demo',
    'selfbeautystudio.com': '/demo/selfbeauty-demo',
  };
  for (const [from, to] of Object.entries(linkMap)) {
    html = html.replace(
      new RegExp(`https?://(?:www\\.)?${from.replace(/\./g, '\\.')}/?(?=[\"' >])`, 'g'), to
    );
  }
  return html;
}

/**
 * Parse raw Wix HTML document into parts for ClonedSiteRenderer:
 * - cssUrls: local /clones/ stylesheet hrefs from <head>
 * - html: <body> content with inline <style> blocks, images rewritten, scripts stripped
 */
function parseWixDocument(rawHtml) {
  let m;

  // 1. Extract CSS link hrefs from <head> (local paths from already-processed files)
  // We'll re-extract from the raw file by looking at what CSS refs exist
  // After mirror+css scripts, CSS was already rewritten to /clones/selfbeauty/css/...
  // But raw HTML still has parastorage URLs. We need the processed file's CSS links.
  // Strategy: use the processed HTML for CSS URLs, raw for body content extraction.
  const cssUrls = [];

  // 2. Extract all <style> blocks from entire document (both head and body)
  const inlineStyles = [];
  const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi;
  while ((m = styleRegex.exec(rawHtml)) !== null) {
    const attrs = m[1];
    // Skip Wix-specific data-styled-components or server-only styles
    inlineStyles.push(`<style${attrs}>${m[2]}</style>`);
  }

  // 3. Extract body content
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : '';
  if (!bodyContent) {
    // Fallback: try to get everything after </head>
    const headEndIdx = rawHtml.indexOf('</head>');
    bodyContent = headEndIdx >= 0 ? rawHtml.slice(headEndIdx + 7) : rawHtml;
    // Strip trailing </html>
    bodyContent = bodyContent.replace(/<\/html>\s*$/, '');
  }

  // 4. Strip ALL script tags (Wix JS won't work offline)
  bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
  let styles = inlineStyles.join('\n');
  styles = styles.replace(/<script[\s\S]*?<\/script>/gi, '');

  // 5. Rewrite wixstatic image URLs → local
  bodyContent = rewriteWixImages(bodyContent);
  styles = rewriteWixImages(styles);

  // 6. Rewrite internal links
  bodyContent = rewriteLinks(bodyContent);

  // 7. Strip Usercentrics cookie aside
  bodyContent = bodyContent.replace(/<aside[^>]*usercentrics[^>]*>[\s\S]*?<\/aside>/gi, '');

  // 8. Strip language selector elements
  bodyContent = bodyContent.replace(/<[^>]+data-testid="languageSwitcher"[^>]*>[\s\S]*?<\/(?:div|nav|li|ul)>/gi, '');

  const html = styles + '\n' + bodyContent;
  return { cssUrls, html };
}

async function seed() {
  log('=== Seed selfbeauty-demo (WIX) ===');

  // Delete existing tenant
  const delRes = await pool.query(`DELETE FROM tenants WHERE slug = $1 RETURNING id`, [TENANT_SLUG]);
  if (delRes.rowCount > 0) log(`  Deleted tenant ${delRes.rows[0].id}`);

  const tplRes = await pool.query(`SELECT id FROM templates WHERE key = 'wellness' LIMIT 1`);
  if (!tplRes.rows.length) throw new Error('Template wellness not found');
  const templateId = tplRes.rows[0].id;

  const tenantRes = await pool.query(`
    INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
    VALUES ($1,$2,$3,$4,$5,'draft',$6,$7)
    RETURNING id
  `, [
    TENANT_SLUG, templateId, 'Demo Beauty Studio', 'kadeřnictví & kosmetika',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'selfbeautystudio.com', cms: 'WIX Thunderbolt', pages: PAGES.length }),
  ]);
  const tenantId = tenantRes.rows[0].id;
  log(`Created tenant id: ${tenantId}, token: ${ACCESS_TOKEN}`);

  for (let i = 0; i < PAGES.length; i++) {
    const p = PAGES[i];
    const htmlPath = path.join(ROOT, `public/clones/selfbeauty/pages/${p.file}`);
    if (!fs.existsSync(htmlPath)) { log(`  SKIP missing: ${htmlPath}`); continue; }

    const rawHtml = fs.readFileSync(htmlPath, 'utf8');
    const { cssUrls, html } = parseWixDocument(rawHtml);

    log(`  Page ${p.slug}: ${rawHtml.length} bytes raw → ${html.length} bytes body | css:${cssUrls.length}`);

    // Create page (use actual column names: is_homepage, seo_title, seo_description)
    const pageRes = await pool.query(`
      INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (tenant_id, slug) DO UPDATE
        SET title=$3, is_homepage=$4, seo_title=$5, seo_description=$6
      RETURNING id
    `, [
      tenantId, p.slug, p.title, p.isHome,
      `${p.title} — Demo Beauty Studio`,
      'Ukázka šablony pro beauty & wellness studio. Demo verze.',
    ]);
    const pageId = pageRes.rows[0].id;

    // Create full-page-clone section (actual schema: section_type, settings, order_index)
    await pool.query(`
      INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
      VALUES ($1, $2, 'full-page-clone', $3, 0, true)
      ON CONFLICT DO NOTHING
    `, [
      tenantId,
      pageId,
      JSON.stringify({ html, cssUrls, jsUrls: [] }),
    ]);

    log(`  Page ${p.slug} → pageId:${pageId} ✅`);
  }

  await pool.end();
  log(`\nDone! access_token: ${ACCESS_TOKEN}`);
  log(`URL: http://localhost:3015/demo/${TENANT_SLUG}`);
  log(`Admin: http://localhost:3015/demo/${TENANT_SLUG}/admin`);
}

seed().catch(e => { console.error(e); process.exit(1); });
