#!/usr/bin/env node
/**
 * Seed bakery-02 master tenant (slug: bakery-02-v2).
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'bakery-02-v2';
const EMAIL = 'demo@bakery-02.test';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const del1 = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id, slug`, [SLUG]);
  console.log(`✓ cleanup: removed ${del1.rowCount} previous tenants with slug=${SLUG}`);
  const del2 = await pool.query(
    `DELETE FROM tenants WHERE email=$1 AND slug LIKE 'demo-%' RETURNING id, slug`,
    [EMAIL]
  );
  if (del2.rowCount > 0) console.log(`✓ cleanup: removed ${del2.rowCount} stray tenants for ${EMAIL}`);

  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl, Referer: baseUrl + '/' },
    body: JSON.stringify({ email: EMAIL, templateKey: 'bakery-02', industry: 'bakery', slug: SLUG }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { console.error(`✗ onboarding ${res.status}:`, body); process.exit(1); }
  console.log(`✓ bakery-02 tenant created`);
  console.log(`  preview: ${baseUrl}${body.previewUrl ?? '/demo/' + body.slug}`);
  console.log(`  editor:  ${baseUrl}${body.editorUrl}`);
  await pool.end();
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
