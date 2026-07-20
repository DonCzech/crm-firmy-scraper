#!/usr/bin/env node
/**
 * Direct DB seed for instala-01 — bypasses /api/onboarding route.
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';

const SLUG         = 'instala-01-v2';
const EMAIL        = 'demo@instala-01.test';
const TEMPLATE_KEY = 'instala-01';
const INDUSTRY     = 'instala';

const TEMPLATES_ROOT = join(process.cwd(), 'src', 'templates');

function lookupRef(content, ref) {
  if (!ref) return {};
  const parts = ref.split('.');
  let cur = content;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return {};
  }
  return (cur && typeof cur === 'object') ? cur : {};
}

function themeToDesignTokens(theme) {
  return {
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
    spacing:         ({ compact:'compact', normal:'normal', spacious:'relaxed', editorial:'relaxed' })[theme.spacing.personality] ?? 'normal',
  };
}

function buildTemplate(manifest, theme, content) {
  const designTokens = themeToDesignTokens(theme);
  const homepage = manifest.pages.find(p => p.isHomepage) ?? manifest.pages[0];
  const defaultSections = homepage.sections.map((s, i) => ({
    type:     s.type,
    variant:  s.variant,
    order:    i,
    visible:  !s.hidden,
    anchorId: s.anchorId,
    content:  s.contentRef ? lookupRef(content, s.contentRef) : undefined,
  }));
  const pagesContent = (content.pages ?? {});
  const subPages = manifest.pages
    .filter(p => p !== homepage)
    .map(page => {
      const pc = pagesContent[page.slug] ?? {};
      return {
        slug:           page.slug,
        title:          page.title ?? page.slug,
        seoTitle:       typeof pc.seoTitle === 'string'       ? pc.seoTitle       : undefined,
        seoDescription: typeof pc.seoDescription === 'string' ? pc.seoDescription : undefined,
        sections: page.sections.map((s, i) => ({
          type:     s.type,
          variant:  s.variant,
          order:    i,
          visible:  !s.hidden,
          anchorId: s.anchorId,
          content:  lookupRef(content, s.contentRef),
        })),
      };
    });
  return { key: manifest.key, name: manifest.name, industry: manifest.industry, version: manifest.version, designTokens, defaultSections, pages: subPages, demoContent: content };
}

async function insertPageSections(client, tenantId, pageId, sections, designTokens, demoContent) {
  for (const section of sections) {
    const sectionContent = section.content ?? demoContent[section.type] ?? {};
    await client.query(
      `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tenantId, pageId, section.type, section.variant, section.order, section.visible,
       JSON.stringify({ content: sectionContent, designTokens, anchorId: section.anchorId })]
    );
  }
}

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const dir     = join(TEMPLATES_ROOT, TEMPLATE_KEY);
  const manifest = JSON.parse(readFileSync(join(dir, 'template.json'), 'utf8'));
  const theme    = JSON.parse(readFileSync(join(dir, 'theme.json'),    'utf8'));
  const contentRel = manifest.content?.default ?? './content/cs.json';
  const content  = JSON.parse(readFileSync(join(dir, contentRel.replace('./', '')), 'utf8'));

  const tpl = buildTemplate(manifest, theme, content);
  console.log(`✓ loaded template: ${tpl.key} v${tpl.version}`);

  const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [SLUG]);
  console.log(`✓ cleanup: removed ${del.rowCount} previous tenants`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO templates (key, name, industry, current_version, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (key) DO UPDATE SET name=$2, industry=$3, current_version=$4, updated_at=now()`,
      [tpl.key, tpl.name, tpl.industry, tpl.version]
    );
    const tplRow = await client.query(`SELECT id FROM templates WHERE key=$1`, [TEMPLATE_KEY]);
    const templateId = tplRow.rows[0].id;

    await client.query(
      `INSERT INTO template_versions (template_id, version, default_sections, default_design_tokens, default_demo_content)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (template_id, version) DO UPDATE SET
         default_sections=EXCLUDED.default_sections,
         default_design_tokens=EXCLUDED.default_design_tokens,
         default_demo_content=EXCLUDED.default_demo_content`,
      [templateId, tpl.version, JSON.stringify(tpl.defaultSections), JSON.stringify(tpl.designTokens), JSON.stringify(tpl.demoContent)]
    );

    const accessToken = randomBytes(24).toString('hex');
    const tenantRes = await client.query(
      `INSERT INTO tenants (slug, email, template_id, template_version, industry, status, active_modules, plan, access_token)
       VALUES ($1, $2, $3, $4, $5, 'demo', $6, 'free', $7)
       RETURNING id`,
      [SLUG, EMAIL, templateId, tpl.version, INDUSTRY, ['gallery','testimonials','forms'], accessToken]
    );
    const tenantId = tenantRes.rows[0].id;

    const pageRes = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status)
       VALUES ($1, 'home', $2, true, 'published')
       RETURNING id`,
      [tenantId, 'Demo Instalatéři Praha']
    );
    const pageId = pageRes.rows[0].id;
    await insertPageSections(client, tenantId, pageId, tpl.defaultSections, tpl.designTokens, tpl.demoContent);

    for (const page of tpl.pages ?? []) {
      const subRes = await client.query(
        `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
         VALUES ($1, $2, $3, false, 'published', $4, $5)
         RETURNING id`,
        [tenantId, page.slug, page.title, page.seoTitle ?? null, page.seoDescription ?? null]
      );
      await insertPageSections(client, tenantId, subRes.rows[0].id, page.sections, tpl.designTokens, tpl.demoContent);
    }

    for (const mod of ['gallery','testimonials','forms']) {
      await client.query(
        `INSERT INTO tenant_modules (tenant_id, module_key, enabled) VALUES ($1, $2, true)
         ON CONFLICT (tenant_id, module_key) DO NOTHING`,
        [tenantId, mod]
      );
    }

    await client.query('COMMIT');
    console.log(`✓ tenant created — id: ${tenantId}, slug: ${SLUG}`);
    console.log(`  preview: ${baseUrl}/demo/${SLUG}`);
    console.log(`  editor:  ${baseUrl}/demo/${SLUG}/admin`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error('✗', e); process.exit(1); });
