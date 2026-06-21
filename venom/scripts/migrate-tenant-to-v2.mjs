#!/usr/bin/env node
/**
 * F1 — Migrate tenant(s) from legacy section storage to v2 read-through.
 *
 * What it does (per tenant, per section):
 *   1. Looks up template_versions row by tenant.template_id + tenant.template_version
 *   2. Finds matching default section by (type, order_index, fallback type only)
 *   3. Computes sparse override diff (current ≠ default) → sections.content_overrides
 *   4. Extracts known slot values from section content → tenant_data_slots
 *   5. Sets sections.content_source = 'v2' (legacy settings.content stays in place as backup)
 *
 * Flags:
 *   --dry-run         — no writes, just prints diff summary
 *   --tenant <slug>   — migrate one tenant (default: all where content_source IS NULL or 'legacy')
 *   --limit <n>       — cap number of tenants processed (default: unlimited)
 *
 * Usage:
 *   DATABASE_URL=... node scripts/migrate-tenant-to-v2.mjs --tenant arbo-01-v2 --dry-run
 *   DATABASE_URL=... node scripts/migrate-tenant-to-v2.mjs --tenant arbo-01-v2
 *
 * Rollback for a tenant:
 *   UPDATE sections SET content_source = 'legacy' WHERE tenant_id = X;
 *   DELETE FROM tenant_data_slots WHERE tenant_id = X;
 *   -- settings.content was not modified, render reverts to legacy path
 */
import pg from "pg";

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
};
const DRY_RUN = flag("--dry-run");
const TENANT_SLUG = opt("--tenant");
const FILTER = opt("--filter"); // SQL LIKE pattern, e.g. '%-v2'
const LIMIT = parseInt(opt("--limit") ?? "0", 10);

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL env var required");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── Legacy path → slot key mapping (mirrors src/lib/data-slots.ts SLOT_REGISTRY) ─
// Path form: "{section_type}.{field_path_inside_content}"
const LEGACY_PATH_TO_SLOT = {
  "navbar.siteName":   "brand.name",
  "footer.siteName":   "brand.name",
  "navbar.tagline":    "brand.tagline",
  "navbar.logoUrl":    "brand.logoUrl",
  "footer.logoUrl":    "brand.logoUrl",
  "navbar.phone":      "contact.phone",
  "footer.phone":      "contact.phone",
  "contact.phone":     "contact.phone",
  "navbar.email":      "contact.email",
  "footer.email":      "contact.email",
  "contact.email":     "contact.email",
  "contact.address":   "contact.address",
  "footer.address":    "contact.address",
  "contact.city":      "contact.city",
  "contact.zip":       "contact.zip",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

function sparseDiff(current, base, prefix = "") {
  // Returns object containing only fields where current ≠ base.
  if (!isPlainObject(current) || !isPlainObject(base)) {
    // Primitive or array comparison
    return JSON.stringify(current) === JSON.stringify(base) ? undefined : current;
  }
  const result = {};
  let hasDiff = false;
  const keys = new Set([...Object.keys(current), ...Object.keys(base)]);
  for (const k of keys) {
    const cur = current[k];
    const bas = base[k];
    if (isPlainObject(cur) && isPlainObject(bas)) {
      const sub = sparseDiff(cur, bas, `${prefix}${k}.`);
      if (sub !== undefined) { result[k] = sub; hasDiff = true; }
    } else if (JSON.stringify(cur) !== JSON.stringify(bas)) {
      result[k] = cur;
      hasDiff = true;
    }
  }
  return hasDiff ? result : undefined;
}

function extractSlotsFromContent(sectionType, content) {
  // Returns array of { key, value } for known slot mappings.
  const out = [];
  if (!isPlainObject(content)) return out;
  for (const [field, value] of Object.entries(content)) {
    const legacyPath = `${sectionType}.${field}`;
    const slotKey = LEGACY_PATH_TO_SLOT[legacyPath];
    if (slotKey && value !== null && value !== undefined && value !== "") {
      out.push({ key: slotKey, value });
    }
  }
  return out;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[migrate-v2] DRY_RUN=${DRY_RUN} tenant=${TENANT_SLUG ?? "(all eligible)"} limit=${LIMIT || "∞"}`);

  // Pick tenants
  let tenantsRes;
  if (TENANT_SLUG) {
    tenantsRes = await pool.query("SELECT id, slug, template_id, template_version FROM tenants WHERE slug = $1", [TENANT_SLUG]);
  } else {
    const params = [];
    let where = "(s.content_source IS NULL OR s.content_source = 'legacy')";
    if (FILTER) {
      params.push(FILTER);
      where += ` AND t.slug LIKE $${params.length}`;
    }
    // Always exclude tenants whose sections include legacy clone/astera renderers —
    // those have no template_versions match and would break.
    tenantsRes = await pool.query(
      `SELECT DISTINCT t.id, t.slug, t.template_id, t.template_version
         FROM tenants t
         JOIN sections s ON s.tenant_id = t.id
        WHERE ${where}
          AND NOT EXISTS (
            SELECT 1 FROM sections s2
             WHERE s2.tenant_id = t.id
               AND s2.section_type IN ('full-page-clone', 'astera-home')
          )
        ORDER BY t.id
        ${LIMIT > 0 ? `LIMIT ${LIMIT}` : ""}`,
      params
    );
  }
  if (tenantsRes.rows.length === 0) {
    console.log("[migrate-v2] no tenants to migrate.");
    await pool.end();
    return;
  }

  let totalSections = 0, totalOverrides = 0, totalSlots = 0, skipped = 0;

  for (const tenant of tenantsRes.rows) {
    console.log(`\n── tenant #${tenant.id} (${tenant.slug}) ──────────────────`);

    const tpl = await pool.query(
      `SELECT tv.default_sections, t.key AS template_key
         FROM template_versions tv
         JOIN templates t ON t.id = tv.template_id
        WHERE t.id = $1 AND tv.version = $2`,
      [tenant.template_id, tenant.template_version]
    );
    if (tpl.rows.length === 0) {
      console.log(`  ⚠️  no template_versions row for template_id=${tenant.template_id} version=${tenant.template_version} — skip`);
      skipped++;
      continue;
    }
    const defaultSections = tpl.rows[0].default_sections ?? [];
    console.log(`  template=${tpl.rows[0].template_key} version=${tenant.template_version} default_sections=${defaultSections.length}`);

    const sectionsRes = await pool.query(
      "SELECT id, section_type, section_variant, order_index, settings FROM sections WHERE tenant_id = $1 ORDER BY order_index",
      [tenant.id]
    );

    const slotsToUpsert = new Map(); // dedupe by key — first non-empty wins

    for (const section of sectionsRes.rows) {
      totalSections++;
      const currentContent = section.settings?.content ?? {};
      const sectionDefault =
        defaultSections.find((d) => d.type === section.section_type && d.order === section.order_index)
        ?? defaultSections.find((d) => d.type === section.section_type);

      if (!sectionDefault) {
        console.log(`    section #${section.id} type=${section.section_type} order=${section.order_index} — NO DEFAULT (will stay legacy)`);
        continue;
      }

      const overrides = sparseDiff(currentContent, sectionDefault.content ?? {}) ?? {};
      const slots = extractSlotsFromContent(section.section_type, currentContent);

      if (DRY_RUN) {
        const overrideKeys = Object.keys(overrides);
        console.log(`    section #${section.id} type=${section.section_type} → overrides:[${overrideKeys.join(",")}] slots:[${slots.map((s) => s.key).join(",")}]`);
      } else {
        await pool.query(
          "UPDATE sections SET content_overrides = $1::jsonb, content_source = 'v2' WHERE id = $2",
          [JSON.stringify(overrides), section.id]
        );
      }
      totalOverrides += Object.keys(overrides).length;

      for (const s of slots) {
        if (!slotsToUpsert.has(s.key)) slotsToUpsert.set(s.key, s.value);
      }
    }

    if (!DRY_RUN) {
      for (const [slotKey, value] of slotsToUpsert.entries()) {
        await pool.query(
          `INSERT INTO tenant_data_slots (tenant_id, slot_key, value, updated_at)
           VALUES ($1, $2, $3::jsonb, now())
           ON CONFLICT (tenant_id, slot_key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
          [tenant.id, slotKey, JSON.stringify(value)]
        );
      }
      console.log(`  ✓ migrated: ${sectionsRes.rows.length} sections, ${slotsToUpsert.size} slots`);
    } else {
      console.log(`  [DRY-RUN] would migrate ${sectionsRes.rows.length} sections + ${slotsToUpsert.size} unique slots`);
    }
    totalSlots += slotsToUpsert.size;
  }

  console.log(`\n[migrate-v2] DONE. tenants=${tenantsRes.rows.length - skipped}/${tenantsRes.rows.length} sections=${totalSections} overrides_fields=${totalOverrides} slot_writes=${totalSlots}${DRY_RUN ? " (DRY-RUN, no writes)" : ""}`);
  await pool.end();
}

main().catch((err) => { console.error(err); pool.end(); process.exit(1); });
