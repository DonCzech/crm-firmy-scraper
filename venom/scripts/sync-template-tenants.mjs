#!/usr/bin/env node
/**
 * Template update propagation — zajišťuje, že aktualizace šablony (disk →
 * template_versions) se propíše do VŠECH existujících tenantů dané šablony.
 *
 * Jak propagace funguje (v2 read-through pipeline):
 *   - Kód sekcí (React komponenty) se propisuje okamžitě všem — sdílený kód.
 *   - Obsahové defaulty v2 sekcí se čtou za renderu z template_versions
 *     (base ⊕ tenant_data_slots ⊕ content_overrides). Update template_versions
 *     řádku se tedy propíše automaticky — POKUD:
 *       a) tenant.template_version ukazuje na existující template_versions řádek,
 *       b) sekce má content_source='v2' (legacy sekce jsou zamrzlé kopie),
 *       c) pole není přepsáno v tenantových content_overrides (to je správně —
 *          uživatelovy úpravy mají přednost).
 *
 * Tento skript řeší zbývající díry:
 *   1. REPORT (default) — per šablona: kolik tenantů/sekcí je na v2 read-through
 *      cestě, kolik je zamrzlých legacy, kolik tenantů má rozbité/zastaralé
 *      připnutí verze, které sekce z aktuální šablony tenantům chybí.
 *   2. --fix-versions — přepne tenanty připnuté na neexistující/starou verzi na
 *      templates.current_version (obsah řízený overrides zůstává zachován).
 *   3. --add-missing-sections — doplní na homepage tenanta sekce, které v nové
 *      verzi šablony přibyly (vloží se na pozici dle šablony, content_source='v2',
 *      prázdné overrides ⇒ obsah plně řízený šablonou). Sekce typů, které tenant
 *      na homepage už má, se nepřidávají (nelze odlišit "uživatel smazal").
 *
 * Workflow aktualizace šablony:
 *   1. uprav src/templates/<key>/ (+ případně React sekce)
 *   2. node scripts/seed-all-templates.mjs --key <key>     # disk → template_versions
 *   3. node scripts/sync-template-tenants.mjs --key <key>  # report děr
 *   4. node scripts/sync-template-tenants.mjs --key <key> --fix-versions --add-missing-sections
 *   (legacy sekce zmigruje scripts/migrate-tenant-to-v2.mjs)
 *
 * Flags:
 *   --key <templateKey>       jen jedna šablona (default: všechny)
 *   --tenant <slug>           jen jeden tenant
 *   --fix-versions            přepni zastaralá/rozbitá připnutí verzí
 *   --add-missing-sections    doplň nově přidané sekce šablony
 *   --dry-run                 nic nezapisuj, jen vypiš co by se stalo
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-template-tenants.mjs
 *   DATABASE_URL=... node scripts/sync-template-tenants.mjs --key eshop-05 --dry-run --fix-versions
 */
import pg from "pg";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 && i + 1 < args.length ? args[i + 1] : null; };

const DRY_RUN = flag("--dry-run");
const FIX_VERSIONS = flag("--fix-versions");
const ADD_MISSING = flag("--add-missing-sections");
const ONLY_KEY = opt("--key");
const ONLY_TENANT = opt("--tenant");

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL env var required");
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  console.log(`[sync-tenants] dry-run=${DRY_RUN} fix-versions=${FIX_VERSIONS} add-missing=${ADD_MISSING} key=${ONLY_KEY ?? "(all)"} tenant=${ONLY_TENANT ?? "(all)"}\n`);

  const tplParams = [];
  let tplWhere = "1=1";
  if (ONLY_KEY) { tplParams.push(ONLY_KEY); tplWhere = `t.key = $${tplParams.length}`; }
  const templates = (await pool.query(
    `SELECT t.id, t.key, t.kind, t.current_version,
            (SELECT tv.default_sections FROM template_versions tv
              WHERE tv.template_id = t.id AND tv.version = t.current_version) AS default_sections
       FROM templates t WHERE ${tplWhere} ORDER BY t.key`,
    tplParams
  )).rows;

  const totals = { tenants: 0, repinned: 0, sectionsAdded: 0, legacySections: 0, v2Sections: 0 };

  for (const tpl of templates) {
    const defaults = Array.isArray(tpl.default_sections) ? tpl.default_sections : [];
    const tenParams = [tpl.id];
    let tenWhere = "tn.template_id = $1";
    if (ONLY_TENANT) { tenParams.push(ONLY_TENANT); tenWhere += ` AND tn.slug = $${tenParams.length}`; }
    const tenants = (await pool.query(
      `SELECT tn.id, tn.slug, tn.template_version,
              EXISTS (SELECT 1 FROM template_versions tv
                       WHERE tv.template_id = tn.template_id AND tv.version = tn.template_version) AS pin_ok
         FROM tenants tn WHERE ${tenWhere} ORDER BY tn.id`,
      tenParams
    )).rows;
    if (!tenants.length) continue;

    if (!defaults.length) {
      console.log(`⚠ ${tpl.key}: template_versions řádek pro current_version=${tpl.current_version} chybí nebo je prázdný — nejdřív spusť seed-all-templates.mjs --key ${tpl.key}`);
    }

    console.log(`── ${tpl.key} (${tpl.kind ?? "website"}, current ${tpl.current_version}) — ${tenants.length} tenantů`);
    totals.tenants += tenants.length;

    for (const tn of tenants) {
      const notes = [];

      // 1. Version pin
      const stale = tn.template_version !== tpl.current_version;
      if (!tn.pin_ok || stale) {
        notes.push(`pin ${tn.template_version}${tn.pin_ok ? "" : " (řádek neexistuje!)"} → ${tpl.current_version}${FIX_VERSIONS ? "" : " [--fix-versions]"}`);
        if (FIX_VERSIONS && !DRY_RUN) {
          await pool.query("UPDATE tenants SET template_version = $1, updated_at = now() WHERE id = $2", [tpl.current_version, tn.id]);
          await pool.query(
            "INSERT INTO audit_log (tenant_id, action, target_type, target_id, details) VALUES ($1, 'template_version_repinned', 'tenant', $2, $3)",
            [tn.id, String(tn.id), JSON.stringify({ from: tn.template_version, to: tpl.current_version, script: "sync-template-tenants" })]
          ).catch(() => {});
          totals.repinned++;
        } else if (FIX_VERSIONS) totals.repinned++;
      }

      // 2. Sekce homepage: legacy/v2 poměr + chybějící typy z nové šablony
      const home = (await pool.query(
        "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1", [tn.id]
      )).rows[0];
      if (!home) { console.log(`   ✗ ${tn.slug}: nemá homepage`); continue; }

      const secs = (await pool.query(
        "SELECT id, section_type, order_index, COALESCE(content_source,'legacy') AS src FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index",
        [tn.id, home.id]
      )).rows;
      const legacy = secs.filter((s) => s.src !== "v2").length;
      totals.legacySections += legacy;
      totals.v2Sections += secs.length - legacy;
      if (legacy > 0) notes.push(`${legacy}/${secs.length} sekcí legacy (zamrzlé — migrate-tenant-to-v2.mjs --tenant ${tn.slug})`);

      const haveTypes = new Set(secs.map((s) => s.section_type));
      // Klonované weby (full-page-clone) nerendrují šablonové sekce — nedoplňovat.
      const missing = haveTypes.has("full-page-clone")
        ? []
        : defaults.filter((d) => d.visible !== false && !haveTypes.has(d.type));
      if (missing.length) {
        notes.push(`chybí sekce: ${missing.map((m) => m.type).join(", ")}${ADD_MISSING ? " → doplňuji" : " [--add-missing-sections]"}`);
        if (ADD_MISSING && !DRY_RUN) {
          // Přečíslování order_index přes bezpečný offset, pak vložení na pozici dle šablony.
          await pool.query("BEGIN");
          try {
            const merged = [...secs.map((s) => ({ existing: s.id, type: s.section_type, order: s.order_index }))];
            for (const m of missing) {
              // vlož za nejbližší existující sekci, která je v šabloně před ní
              const before = defaults.filter((d) => d.order < m.order && haveTypes.has(d.type)).pop();
              const idx = before ? merged.findIndex((x) => x.type === before.type) + 1 : merged.length;
              merged.splice(idx, 0, { existing: null, def: m, type: m.type });
            }
            await pool.query("UPDATE sections SET order_index = order_index + 1000 WHERE tenant_id = $1 AND page_id = $2", [tn.id, home.id]);
            for (let i = 0; i < merged.length; i++) {
              const item = merged[i];
              if (item.existing) {
                await pool.query("UPDATE sections SET order_index = $1 WHERE id = $2", [i, item.existing]);
              } else {
                await pool.query(
                  `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source)
                   VALUES ($1, $2, $3, $4, $5, true, '{}', '{}', 'v2')`,
                  [tn.id, home.id, item.def.type, item.def.variant ?? "default", i]
                );
                totals.sectionsAdded++;
              }
            }
            await pool.query(
              "INSERT INTO audit_log (tenant_id, action, target_type, target_id, details) VALUES ($1, 'template_sections_added', 'page', $2, $3)",
              [tn.id, String(home.id), JSON.stringify({ added: missing.map((m) => m.type), script: "sync-template-tenants" })]
            ).catch(() => {});
            await pool.query("COMMIT");
          } catch (err) {
            await pool.query("ROLLBACK");
            notes.push(`✗ vložení selhalo: ${err.message}`);
          }
        }
      }

      if (notes.length) console.log(`   · ${tn.slug}: ${notes.join(" | ")}`);
    }
  }

  console.log(`\n[sync-tenants] HOTOVO${DRY_RUN ? " (DRY-RUN, nic nezapsáno)" : ""}`);
  console.log(`  tenantů zkontrolováno: ${totals.tenants}`);
  console.log(`  sekce v2 (aktualizovatelné): ${totals.v2Sections}, legacy (zamrzlé): ${totals.legacySections}`);
  console.log(`  přepnutá připnutí verzí: ${totals.repinned}, doplněné sekce: ${totals.sectionsAdded}`);
  console.log(`\n  Pozn.: změny se na webech projeví do ~10 min (ISR revalidate 300 s + 5min template cache).`);
  await pool.end();
}

main().catch((e) => { console.error(e); pool.end(); process.exit(1); });
