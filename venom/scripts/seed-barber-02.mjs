#!/usr/bin/env node
/**
 * Seed barber-02 engine tenant — slug `barber-02-v2`.
 * Postupuje stejně jako seed-barber-01.mjs: cleanup + onboarding API call.
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'barber-02-v2';
const EMAIL = 'demo@barber-02.test';
const TEMPLATE_KEY = 'barber-02';
const INDUSTRY = 'barber';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id, slug`, [SLUG]);
  console.log(`✓ cleanup: removed ${del.rowCount} previous tenants with slug=${SLUG}`);
  const del2 = await pool.query(
    `DELETE FROM tenants WHERE email=$1 AND slug LIKE 'demo-%' RETURNING id, slug`,
    [EMAIL]
  );
  if (del2.rowCount > 0) console.log(`✓ cleanup: removed ${del2.rowCount} stray tenants for ${EMAIL}`);

  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl, Referer: baseUrl + '/' },
    body: JSON.stringify({ email: EMAIL, templateKey: TEMPLATE_KEY, industry: INDUSTRY, slug: SLUG }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { console.error(`✗ onboarding ${res.status}:`, body); process.exit(1); }
  console.log(`✓ ${TEMPLATE_KEY} tenant created`);
  console.log(`  preview: ${baseUrl}${body.previewUrl ?? '/demo/' + body.slug}`);
  console.log(`  editor:  ${baseUrl}${body.editorUrl ?? '/demo/' + body.slug + '/studio'}`);
  await pool.end();
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
