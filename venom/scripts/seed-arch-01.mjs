#!/usr/bin/env node
/**
 * Seed arch-01 master tenant (slug: arch-01-demo).
 * Template: arch-01 — Demo Arch (černý #000000, Helvetica Neue)
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'arch-01-demo';
const EMAIL = 'demo@arch-01.test';
const TEMPLATE_KEY = 'arch-01';
const INDUSTRY = 'arch';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id, slug`, [SLUG]);
  console.log(`✓ cleanup: removed ${del.rowCount} previous tenants with slug=${SLUG}`);

  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseUrl,
      Referer: baseUrl + '/',
      'X-Forwarded-For': '10.88.33.5',
    },
    body: JSON.stringify({
      businessName: 'Demo Arch',
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
  await pool.end();
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
