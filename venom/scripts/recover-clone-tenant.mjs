#!/usr/bin/env node
// scripts/recover-clone-tenant.mjs <original-slug>
//
// Obnoví zkažený clone tenant: smaže všechny sekce a vloží jednu `full-page-clone`
// sekci, která odkazuje na public/clones/<slug>/index.html.
//
// SPOUŠTĚT JEN PO POTVRZENÍ UŽIVATELE. Operace je destruktivní pro sekce daného
// tenantu (sloupec `sections.tenant_id`). Použij --dry-run pro preview.
//
// Použití:
//   node scripts/recover-clone-tenant.mjs the-barber --dry-run
//   node scripts/recover-clone-tenant.mjs the-barber                 # provede
//   node scripts/recover-clone-tenant.mjs the-barber fade-room       # batch

import { Pool } from "pg";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const slugs = args.filter((a) => !a.startsWith("--"));

if (slugs.length === 0) {
  console.error("Usage: node scripts/recover-clone-tenant.mjs <slug> [<slug>...] [--dry-run]");
  process.exit(2);
}

// Načti DATABASE_URL z .env.local
const envPath = join(ROOT, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL nenastaveno");
  process.exit(2);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function recover(slug) {
  const tenantSlug = `${slug}-demo`;
  const cloneDir = join(ROOT, "public/clones", slug);
  const indexHtml = join(cloneDir, "index.html");

  if (!existsSync(indexHtml)) {
    console.log(`✗ ${slug}: chybí ${indexHtml} — recovery není možná`);
    return false;
  }

  const tenant = await pool.query("SELECT id, slug FROM tenants WHERE slug = $1", [tenantSlug]);
  if (tenant.rows.length === 0) {
    console.log(`✗ ${slug}: tenant ${tenantSlug} neexistuje v DB`);
    return false;
  }
  const tenantId = tenant.rows[0].id;

  const before = await pool.query(
    "SELECT section_type FROM sections WHERE tenant_id = $1 ORDER BY id",
    [tenantId]
  );
  console.log(`\n${slug}  (tenant_id=${tenantId})`);
  console.log(`  Aktuální sekce: ${before.rows.map((r) => r.section_type).join(", ") || "(žádné)"}`);

  if (dryRun) {
    console.log(`  DRY-RUN: smazal bych ${before.rows.length} sekcí a vložil 1× full-page-clone`);
    return true;
  }

  await pool.query("BEGIN");
  try {
    await pool.query("DELETE FROM sections WHERE tenant_id = $1", [tenantId]);
    await pool.query(
      `INSERT INTO sections (tenant_id, section_type, content)
       VALUES ($1, 'full-page-clone', $2::jsonb)`,
      [tenantId, JSON.stringify({ cloneSlug: slug, source: `public/clones/${slug}/index.html` })]
    );
    await pool.query("COMMIT");
    console.log(`  ✓ Obnoveno`);
    return true;
  } catch (e) {
    await pool.query("ROLLBACK");
    console.log(`  ✗ FAIL: ${e.message}`);
    return false;
  }
}

let ok = 0;
for (const slug of slugs) {
  if (await recover(slug)) ok++;
}
console.log(`\n${ok}/${slugs.length} obnoveno${dryRun ? " (DRY-RUN)" : ""}`);
await pool.end();
