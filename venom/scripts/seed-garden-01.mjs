#!/usr/bin/env node
/**
 * Seed garden-01 master tenant (slug: garden-01-demo).
 * Template: garden-01 — Demo Gerberra (zelená #6a961f, zlatá #bcba63, tmavý #202714)
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'garden-01-demo';
const EMAIL = 'demo@garden-01.test';
const TEMPLATE_KEY = 'garden-01';
const INDUSTRY = 'garden';

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
      businessName: 'Demo Gerberra',
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
