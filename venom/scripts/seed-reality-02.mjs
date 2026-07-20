#!/usr/bin/env node
/**
 * Seed reality-02 master tenant (fixed slug: reality-02-v2).
 * - Removes previous reality-02-v2 tenant
 * - POSTs onboarding with templateKey=reality-02
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'reality-02-v2';
const EMAIL = 'demo@reality-02.test';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const del1 = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id, slug`, [SLUG]);
  console.log(`✓ cleanup: removed ${del1.rowCount} previous tenants with slug=${SLUG}`);
  const del2 = await pool.query(
    `DELETE FROM tenants WHERE email=$1 AND slug LIKE 'demo-%' RETURNING id, slug`,
    [EMAIL]
  );
  if (del2.rowCount > 0) console.log(`✓ cleanup: removed ${del2.rowCount} stray tenants for ${EMAIL}`);

  const fakeIp = `10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl, Referer: baseUrl + '/', 'x-forwarded-for': fakeIp },
    body: JSON.stringify({ email: EMAIL, templateKey: 'reality-02', industry: 'reality', slug: SLUG }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Onboarding failed ${res.status}: ${text}`);
  }
  const data = await res.json();
  console.log(`✓ created tenant: ${data.slug ?? SLUG}`);
  console.log(`  Preview: ${baseUrl}/demo/${data.slug ?? SLUG}`);
  console.log(`  Preview-2: ${baseUrl}/preview-2`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => pool.end());
