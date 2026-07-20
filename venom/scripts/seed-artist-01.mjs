#!/usr/bin/env node
/**
 * Seed artist-01 master tenant (slug: artist-01-demo).
 * Template: artist-01 — Viktorie Lánská (osobní web zpěvačky, granát #9b1c31 + ivory + Cormorant)
 */
import pg from 'pg';
import { readFileSync } from 'fs';

const DB_URL = process.env.DATABASE_URL
  || readFileSync('.env.local', 'utf-8').match(/DATABASE_URL=(.+)/)[1].trim();
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'artist-01-demo';
const EMAIL = 'demo@artist-01.test';
const TEMPLATE_KEY = 'artist-01';
const INDUSTRY = 'artist';

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
      'X-Forwarded-For': '10.88.33.9',
    },
    body: JSON.stringify({
      name: 'Viktorie Lánská',
      email: EMAIL,
      templateKey: TEMPLATE_KEY,
      industry: INDUSTRY,
      slug: SLUG,
      password: 'demo-artist-01',
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
