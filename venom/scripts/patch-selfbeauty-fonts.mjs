/**
 * Patch selfbeauty-demo sections:
 * - Strip all @font-face rules that reference parastorage URLs
 * - Add local Fahkwang font CSS URL
 * - Fix language switcher flags
 * - Fix sloppyframe reference
 * - Strip language switcher HTML
 */
import pg from 'pg';

const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'selfbeauty-demo';
const LOCAL_FONT_CSS = '/clones/selfbeauty/fonts/fahkwang-local.css';

function patchHtml(html) {
  // 1. Strip @font-face blocks that reference parastorage
  // These are in <style> blocks - we need to remove the specific @font-face rules
  html = html.replace(
    /@font-face\s*\{[^}]*url\(['"]?(?:https?:)?\/\/static\.parastorage\.com[^}]*\}(\s*)/g, ''
  );

  // 2. Strip language switcher flags images
  html = html.replace(/<img[^>]*linguist-flags[^>]*>/gi, '');
  html = html.replace(/srcset="[^"]*linguist-flags[^"]*"\s*/gi, '');
  html = html.replace(/src="[^"]*linguist-flags[^"]*"/gi, 'src=""');

  // 3. Fix sloppyframe: replace remaining parastorage sloppyframe reference
  html = html.replace(
    /https?:\/\/static\.parastorage\.com\/services\/editor-elements-library[^"' )]*sloppyframe[^"' )"]*/g,
    '/clones/selfbeauty/img/sloppyframe.png'
  );

  // 4. Strip remaining parastorage font-cache url() refs in src attributes
  html = html.replace(/url\(['"]?(?:https?:)?\/\/static\.parastorage\.com\/tag-bundler[^'")]+['"]?\)/g, '');

  // 5. Strip Wix chat and cookie sidebar
  html = html.replace(/<div[^>]*id="[^"]*wix-chat[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<aside[^>]*id="[^"]*usercentrics[^"]*"[^>]*>[\s\S]*?<\/aside>/gi, '');

  // 6. Strip language selector dropdown
  html = html.replace(/<[a-z]+[^>]+data-testid="languageSwitcher"[^>]*>[\s\S]{0,5000}?<\/(?:div|nav|ul|li)>/gi, '');

  return html;
}

async function patch() {
  console.log('=== Patching selfbeauty-demo fonts + cleanup ===');

  const tenantRes = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, [TENANT_SLUG]);
  if (!tenantRes.rows.length) throw new Error(`Tenant ${TENANT_SLUG} not found`);
  const tenantId = tenantRes.rows[0].id;

  const sectionsRes = await pool.query(`
    SELECT s.id, s.settings, p.slug as page_slug
    FROM sections s
    JOIN pages p ON s.page_id = p.id
    WHERE s.tenant_id = $1 AND s.section_type = 'full-page-clone'
    ORDER BY s.id
  `, [tenantId]);

  console.log(`Found ${sectionsRes.rows.length} sections`);

  for (const row of sectionsRes.rows) {
    const settings = row.settings;
    const origLen = settings.html?.length || 0;

    const patchedHtml = patchHtml(settings.html || '');

    // Add local font CSS to cssUrls
    const cssUrls = [...new Set([LOCAL_FONT_CSS, ...(settings.cssUrls || [])])];

    await pool.query(`
      UPDATE sections SET settings = $1, updated_at = NOW()
      WHERE id = $2
    `, [
      JSON.stringify({ ...settings, html: patchedHtml, cssUrls }),
      row.id,
    ]);

    const remaining = (patchedHtml.match(/static\.parastorage\.com\/tag-bundler[^"' )]+/g) || []).length;
    console.log(`  ${row.page_slug}: ${origLen} → ${patchedHtml.length} bytes | parastorage font refs remaining: ${remaining}`);
  }

  await pool.end();
  console.log('Done ✅');
}

patch().catch(e => { console.error(e); process.exit(1); });
