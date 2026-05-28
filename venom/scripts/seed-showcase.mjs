#!/usr/bin/env node
/**
 * seed-showcase.mjs <template-key>
 *
 * Generický seed pro showcase child tenant libovolné šablony.
 *   - Master slug:    `<key>-v2`
 *   - Showcase slug:  `<key>-showcase`
 *   - parent_tenant_id = master tenant id
 *   - showcase_kind  = "filled"
 *
 * Uživatel pak vyplní obrázky/texty přes Studio.
 * Sync změn master → showcase: `pnpm sync:showcase <key>`.
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';

const key = process.argv[2];
if (!key) {
  console.error('Usage: node scripts/seed-showcase.mjs <template-key>  (např. barber-02)');
  process.exit(2);
}
const MASTER_SLUG = `${key}-v2`;
const SHOWCASE_SLUG = `${key}-showcase`;
const EMAIL = `showcase@${key}.test`;

// Mapování template-key → industry (fallback "barber")
const INDUSTRY_MAP = {
  'barber-01': 'barber',
  'barber-02': 'barber',
  'barber-03': 'barber',
  'cafe-01': 'cafe',
  'peak-cut': 'barber',
};
const INDUSTRY = INDUSTRY_MAP[key] || 'barber';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  // master může mít slug `<key>-v2` (engine v2) NEBO `<key>-demo` (legacy) NEBO `<key>` (legacy)
  const masterRes = await pool.query(
    `SELECT id, slug FROM tenants WHERE slug = ANY($1::text[]) ORDER BY
       CASE slug WHEN $2 THEN 1 WHEN $3 THEN 2 ELSE 3 END LIMIT 1`,
    [[`${key}-v2`, `${key}-demo`, key], `${key}-v2`, `${key}-demo`]
  );
  if (masterRes.rowCount === 0) {
    console.error(`✗ master tenant pro ${key} neexistuje (zkoušel jsem ${key}-v2, ${key}-demo, ${key})`);
    console.error(`  → nejdřív seed master: pnpm node scripts/seed-${key}.mjs`);
    process.exit(1);
  }
  const masterId = masterRes.rows[0].id;
  const masterSlug = masterRes.rows[0].slug;
  console.log(`▶ Seeding showcase pro ${key} (master: ${masterSlug}, id=${masterId})`);

  await pool.query(`DELETE FROM tenants WHERE slug=$1`, [SHOWCASE_SLUG]);
  console.log(`✓ cleanup showcase slug ${SHOWCASE_SLUG}`);

  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseUrl,
      Referer: baseUrl + '/',
      'X-Forwarded-For': '10.0.0.' + Math.floor(Math.random() * 250),
    },
    body: JSON.stringify({ email: EMAIL, templateKey: key, industry: INDUSTRY, slug: SHOWCASE_SLUG }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`✗ onboarding ${res.status}:`, body);
    process.exit(1);
  }
  console.log(`✓ showcase tenant created: id=${body.tenantId}, slug=${body.slug}`);

  await pool.query(
    `UPDATE tenants SET parent_tenant_id=$1, showcase_kind='filled' WHERE slug=$2`,
    [masterId, SHOWCASE_SLUG]
  );
  console.log(`✓ linked parent_tenant_id=${masterId}, showcase_kind=filled`);

  console.log(`\n  master:    ${baseUrl}/demo/${masterSlug}`);
  console.log(`  showcase:  ${baseUrl}/demo/${SHOWCASE_SLUG}`);
  console.log(`  editor:    ${baseUrl}/demo/${SHOWCASE_SLUG}/admin`);
  console.log(`  sync cmd:  pnpm sync:showcase ${key}`);

  await pool.end();
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
