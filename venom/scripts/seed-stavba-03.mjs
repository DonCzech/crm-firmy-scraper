#!/usr/bin/env node
/**
 * seed-stavba-03.mjs — přímý DB seed pro stavba-03-v2 tenant (bypass API)
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;

const SLUG = 'stavba-03-v2';
const EMAIL = 'demo@stavba-03.test';
const TEMPLATE_KEY = 'stavba-03';
const INDUSTRY = 'stavba';

// ── Load template files ───────────────────────────────────────────────────────
const tDir = join(ROOT, 'src', 'templates', TEMPLATE_KEY);
const manifest = JSON.parse(readFileSync(join(tDir, 'template.json'), 'utf8'));
const theme    = JSON.parse(readFileSync(join(tDir, 'theme.json'), 'utf8'));
const rawContent = JSON.parse(readFileSync(join(tDir, 'content', 'cs.json'), 'utf8'));

function placeholderImage(width, height, label = 'Přidat obrázek') {
  const safe = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fontSize = Math.max(14, Math.min(28, Math.round(Math.min(width, height) / 14)));
  const plusSize = Math.round(Math.min(width, height) / 5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f0eeea"/><rect x="1" y="1" width="${width-2}" height="${height-2}" fill="none" stroke="#c8c4be" stroke-width="2" stroke-dasharray="8 8"/><g fill="#7a766f"><circle cx="${width/2}" cy="${height/2-fontSize*1.6}" r="${plusSize/2}" fill="#e6e2dc"/><rect x="${width/2-plusSize/6}" y="${height/2-fontSize*1.6-plusSize/3}" width="${plusSize/3}" height="${plusSize*2/3}" fill="#7a766f"/><rect x="${width/2-plusSize/3}" y="${height/2-fontSize*1.6-plusSize/6}" width="${plusSize*2/3}" height="${plusSize/3}" fill="#7a766f"/><text x="50%" y="${height/2+fontSize*0.2}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="600">${safe}</text><text x="50%" y="${height/2+fontSize*1.6}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${Math.round(fontSize*0.75)}" opacity="0.7">${width} × ${height} px</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function resolvePlaceholders(input) {
  if (input && typeof input === 'object' && Array.isArray(input.__placeholder)) {
    const [w, h, label] = input.__placeholder;
    return placeholderImage(w, h, label);
  }
  if (Array.isArray(input)) return input.map(resolvePlaceholders);
  if (input && typeof input === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(input)) out[k] = resolvePlaceholders(v);
    return out;
  }
  return input;
}

const spacingMap = { compact: 'compact', normal: 'normal', spacious: 'relaxed', editorial: 'relaxed' };
const designTokens = {
  colorPrimary:    theme.colors.primary,
  colorSecondary:  theme.colors.secondary,
  colorBackground: theme.colors.background,
  colorSurface:    theme.colors.surface,
  colorText:       theme.colors.text,
  colorTextMuted:  theme.colors.textMuted,
  colorAccent:     theme.colors.accent,
  colorBorder:     theme.colors.border,
  fontHeading:     theme.typography.fontHeading,
  fontBody:        theme.typography.fontBody,
  borderRadius:    theme.radius.pill,
  spacing:         spacingMap[theme.spacing.personality] ?? 'normal',
};

function lookupRef(content, ref) {
  if (!ref) return {};
  const parts = ref.split('.');
  let cur = content;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return {};
  }
  return (cur && typeof cur === 'object' ? cur : {});
}

const content = resolvePlaceholders(rawContent);
const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // cleanup
    const del = await client.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [SLUG]);
    console.log(`✓ cleanup: removed ${del.rowCount} tenants with slug=${SLUG}`);

    // upsert template
    await client.query(
      `INSERT INTO templates (key, name, industry, current_version, status)
       VALUES ($1,$2,$3,$4,'active')
       ON CONFLICT (key) DO UPDATE SET name=$2, industry=$3, current_version=$4, updated_at=now()`,
      [TEMPLATE_KEY, manifest.name, INDUSTRY, manifest.version]
    );
    const tplRow = await client.query('SELECT id FROM templates WHERE key=$1', [TEMPLATE_KEY]);
    const templateId = tplRow.rows[0].id;

    // create tenant
    const accessToken = randomBytes(24).toString('hex');
    const tenantRes = await client.query(
      `INSERT INTO tenants (slug, email, template_id, template_version, industry, status, active_modules, plan, access_token)
       VALUES ($1,$2,$3,$4,$5,'demo',$6,'free',$7) RETURNING id`,
      [SLUG, EMAIL, templateId, manifest.version, INDUSTRY, ['gallery','testimonials','forms'], accessToken]
    );
    const tenantId = tenantRes.rows[0].id;
    console.log(`✓ Tenant created: ${SLUG} (id=${tenantId})`);

    // homepage
    const homepage = manifest.pages.find(p => p.isHomepage) ?? manifest.pages[0];
    const homeRes = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status) VALUES ($1,'home',$2,true,'published') RETURNING id`,
      [tenantId, content.navbar?.siteName ?? manifest.name]
    );
    const homeId = homeRes.rows[0].id;

    for (let i = 0; i < homepage.sections.length; i++) {
      const s = homepage.sections[i];
      const sc = s.contentRef ? lookupRef(content, s.contentRef) : {};
      await client.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
         VALUES ($1,$2,$3,$4,$5,true,$6)`,
        [tenantId, homeId, s.type, s.variant, i, JSON.stringify({ content: sc, designTokens })]
      );
    }
    console.log(`✓ Homepage seeded: ${homepage.sections.length} sections`);

    // subpages
    const subpages = manifest.pages.filter(p => !p.isHomepage);
    for (const page of subpages) {
      const pageRes = await client.query(
        `INSERT INTO pages (tenant_id, slug, title, is_homepage, status) VALUES ($1,$2,$3,false,'published') RETURNING id`,
        [tenantId, page.slug, page.title ?? page.slug]
      );
      const pageId = pageRes.rows[0].id;
      for (let i = 0; i < page.sections.length; i++) {
        const s = page.sections[i];
        const sc = s.contentRef ? lookupRef(content, s.contentRef) : {};
        await client.query(
          `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
           VALUES ($1,$2,$3,$4,$5,true,$6)`,
          [tenantId, pageId, s.type, s.variant, i, JSON.stringify({ content: sc, designTokens })]
        );
      }
      console.log(`  ✓ Page '${page.slug}': ${page.sections.length} sections`);
    }

    // modules
    for (const m of ['gallery','testimonials','forms']) {
      await client.query(
        `INSERT INTO tenant_modules (tenant_id, module_key, enabled) VALUES ($1,$2,true) ON CONFLICT DO NOTHING`,
        [tenantId, m]
      );
    }

    await client.query('COMMIT');
    console.log(`\n✅ stavba-03-v2 vytvořen!`);
    console.log(`  preview: http://localhost:3015/demo/${SLUG}`);
    console.log(`  editor:  http://localhost:3015/demo/${SLUG}/admin`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error('✗', e.message); process.exit(1); });
