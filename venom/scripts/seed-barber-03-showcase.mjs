#!/usr/bin/env node
/**
 * Seed barber-03 showcase tenant — slug `barber-03-showcase`.
 *
 * Vytvoří showcase tenant jako child master tenantu `barber-03-v2`:
 *   - parent_tenant_id = master tenant id
 *   - showcase_kind = "filled"
 *   - kopíruje master sekce 1:1 (stejný start jako master)
 *
 * Uživatel pak vyplní obrázky a texty přes Studio.
 * Pro propagaci master → showcase použij `pnpm sync:showcase barber-03`.
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const MASTER_SLUG = 'barber-03-v2';
const SHOWCASE_SLUG = 'barber-03-showcase';
const EMAIL = 'showcase@barber-03.test';
const TEMPLATE_KEY = 'barber-03';
const INDUSTRY = 'barber';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const master = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, [MASTER_SLUG]);
  if (master.rowCount === 0) {
    console.error(`✗ master tenant ${MASTER_SLUG} neexistuje — nejdřív seed master (pnpm node scripts/seed-barber-03.mjs)`);
    process.exit(1);
  }
  const masterId = master.rows[0].id;

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
    body: JSON.stringify({ email: EMAIL, templateKey: TEMPLATE_KEY, industry: INDUSTRY, slug: SHOWCASE_SLUG }),
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

  console.log(`\n  master:    ${baseUrl}/demo/${MASTER_SLUG}`);
  console.log(`  showcase:  ${baseUrl}/demo/${SHOWCASE_SLUG}`);
  console.log(`  editor:    ${baseUrl}/demo/${SHOWCASE_SLUG}/admin`);
  console.log(`  sync cmd:  pnpm sync:showcase barber-03`);

  await pool.end();
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
