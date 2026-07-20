#!/usr/bin/env node
/**
 * Seed rekonstrukce-01 master tenant (slug: rekonstrukce-01-v2).
 * Template: rekonstrukce-01 — "Demo Byty Jádra" warm professional rekonstrukce/stavba.
 *
 * Přebudováno z původního full-page-clone tenantu `bytyjadra-demo`, který slouží
 * jako showcase (primary_demo_slug). Onboarding naklonuje jeho home + 3 podstránky
 * do nového propojeného master tenantu rekonstrukce-01-v2 (template_id → rekonstrukce-01).
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3000';
const SLUG = 'rekonstrukce-01-v2';
const EMAIL = 'demo@rekonstrukce-01.test';
const TEMPLATE_KEY = 'rekonstrukce-01';
const INDUSTRY = 'rekonstrukce';
const SHOWCASE_SLUG = 'bytyjadra-demo';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  // 0. Ensure the fully-built showcase tenant is registered as this template's
  //    primary_demo_slug so onboarding clones its home + subpages 1:1.
  const tpl = await pool.query(
    `UPDATE templates SET primary_demo_slug = $1, updated_at = now() WHERE key = $2 RETURNING id`,
    [SHOWCASE_SLUG, TEMPLATE_KEY]
  );
  if (!tpl.rowCount) { console.error(`✗ template ${TEMPLATE_KEY} not found in DB`); process.exit(1); }
  console.log(`✓ primary_demo_slug=${SHOWCASE_SLUG} set for ${TEMPLATE_KEY} (template id ${tpl.rows[0].id})`);

  // 1. Idempotent cleanup of any previous master tenant.
  const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id, slug`, [SLUG]);
  console.log(`✓ cleanup: removed ${del.rowCount} previous tenants with slug=${SLUG}`);

  // 2. Onboard a fresh master tenant — clones sections from the showcase.
  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseUrl,
      Referer: baseUrl + '/',
      'X-Forwarded-For': '10.88.33.7',
    },
    body: JSON.stringify({
      businessName: 'Demo Byty Jádra',
      email: EMAIL,
      templateKey: TEMPLATE_KEY,
      industry: INDUSTRY,
      slug: SLUG,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { console.error(`✗ onboarding ${res.status}:`, JSON.stringify(body)); process.exit(1); }
  console.log(`✓ ${TEMPLATE_KEY} tenant created — slug: ${SLUG}`);
  console.log(`  preview: ${baseUrl}${body.previewUrl ?? '/demo/' + SLUG}`);
  console.log(`  editor:  ${baseUrl}${body.editorUrl ?? '/demo/' + SLUG + '/admin'}`);

  // 3. Report section counts for confidence.
  const cnt = await pool.query(
    `SELECT p.slug, count(s.id) AS n
       FROM pages p LEFT JOIN sections s ON s.page_id = p.id
       JOIN tenants t ON t.id = p.tenant_id
      WHERE t.slug = $1 GROUP BY p.slug ORDER BY p.slug`,
    [SLUG]
  );
  console.log('  pages/sections:', cnt.rows.map(r => `${r.slug}(${r.n})`).join(' '));
  await pool.end();
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
