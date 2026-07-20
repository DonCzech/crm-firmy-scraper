#!/usr/bin/env node
/**
 * sync-showcase.mjs <master-template-key>
 *
 * Synchronizuje strukturální změny z master tenantu (`<key>-v2`) do všech
 * jeho showcase children (tenants s parent_tenant_id = master.id).
 *
 * Co propaguje (master → children):
 *   - order_index    (přeskupení sekcí v Studiu)
 *   - section_variant (změna varianty)
 *   - is_visible    (hide/show)
 *   - INSERT nových sekcí (master přidal sekci)
 *   - DELETE chybějících sekcí (master smazal sekci — child sekce na stejné
 *     pozici se smaže, POKUD child v ní nemá content override)
 *   - settings.designTokens (theme změny)
 *   - settings.content KLÍČE, které child NEPŘEPSAL (overrides chrání uploady)
 *
 * Co NEPROPAGUJE (child overrides → nedotčené):
 *   - settings.content polí, kde child se liší od baseline master snapshotu
 *
 * Detekce overridů:
 *   Při onboardu child = identický s master → baseline (uloženo v tenants.last_synced_snapshot JSONB)
 *   Při sync: porovnám child aktuální content vs baseline. Pole kde se liší =
 *   override → zachová se. Ostatní pole se přepíší z master.
 *
 * Použití:
 *   pnpm sync:showcase barber-03
 *   node scripts/sync-showcase.mjs barber-03
 */
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;

const templateKey = process.argv[2];
if (!templateKey) {
  console.error('Usage: node scripts/sync-showcase.mjs <template-key>  (např. barber-03)');
  process.exit(2);
}
const MASTER_SLUG = `${templateKey}-v2`;

const pool = new pg.Pool({ connectionString: DB_URL });

// ── helpers ───────────────────────────────────────────────────────────────────
function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

/** Hluboké procházení rozdílů — vrátí Set dot-paths, kde child se liší od baseline */
function diffPaths(baseline, current, prefix = '', acc = new Set()) {
  if (isObj(baseline) && isObj(current)) {
    const keys = new Set([...Object.keys(baseline), ...Object.keys(current)]);
    for (const k of keys) {
      const path = prefix ? `${prefix}.${k}` : k;
      diffPaths(baseline[k], current[k], path, acc);
    }
  } else if (Array.isArray(baseline) && Array.isArray(current)) {
    const len = Math.max(baseline.length, current.length);
    for (let i = 0; i < len; i++) {
      diffPaths(baseline[i], current[i], `${prefix}.${i}`, acc);
    }
  } else if (JSON.stringify(baseline) !== JSON.stringify(current)) {
    acc.add(prefix);
  }
  return acc;
}

/** Aplikuje master content na child, kromě polí v `overridePaths` (= child uchová) */
function mergePreservingOverrides(master, child, overridePaths, prefix = '') {
  if (Array.isArray(master)) {
    // For arrays: take master length, replace items unless overridden at index level
    const out = [];
    for (let i = 0; i < master.length; i++) {
      const path = `${prefix}.${i}`;
      const childItem = Array.isArray(child) ? child[i] : undefined;
      if (childItem !== undefined && [...overridePaths].some((p) => p.startsWith(path))) {
        out.push(mergePreservingOverrides(master[i], childItem, overridePaths, path));
      } else {
        out.push(master[i]);
      }
    }
    return out;
  }
  if (isObj(master)) {
    const out = {};
    for (const k of Object.keys(master)) {
      const path = prefix ? `${prefix}.${k}` : k;
      const childVal = isObj(child) ? child[k] : undefined;
      const isExactOverride = overridePaths.has(path);
      const hasNestedOverride = [...overridePaths].some((p) => p.startsWith(path + '.'));
      if (isExactOverride) {
        out[k] = childVal !== undefined ? childVal : master[k];
      } else if (hasNestedOverride && childVal !== undefined) {
        out[k] = mergePreservingOverrides(master[k], childVal, overridePaths, path);
      } else {
        out[k] = master[k];
      }
    }
    // Preserve child-only keys that are overrides
    if (isObj(child)) {
      for (const k of Object.keys(child)) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (!(k in master) && overridePaths.has(path)) out[k] = child[k];
      }
    }
    return out;
  }
  return master;
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`▶ Sync showcase children of ${MASTER_SLUG}`);

  const master = await pool.query(
    `SELECT id, slug FROM tenants WHERE slug=$1`,
    [MASTER_SLUG]
  );
  if (master.rowCount === 0) {
    console.error(`✗ master tenant ${MASTER_SLUG} neexistuje`);
    process.exit(1);
  }
  const masterId = master.rows[0].id;

  const children = await pool.query(
    `SELECT id, slug FROM tenants WHERE parent_tenant_id=$1`,
    [masterId]
  );
  if (children.rowCount === 0) {
    console.log(`(žádné showcase children pro ${MASTER_SLUG} — nic k sync)`);
    await pool.end();
    return;
  }
  console.log(`  ${children.rowCount} child(en):`, children.rows.map((c) => c.slug).join(', '));

  // Master sekce — source of truth
  const masterPages = await pool.query(
    `SELECT id, slug FROM pages WHERE tenant_id=$1 AND is_homepage=TRUE ORDER BY id`,
    [masterId]
  );
  const masterHomeId = masterPages.rows[0]?.id;
  if (!masterHomeId) {
    console.error(`✗ master tenant ${MASTER_SLUG} nemá homepage`);
    process.exit(1);
  }
  const masterSecs = await pool.query(
    `SELECT id, section_type, section_variant, order_index, is_visible, settings
     FROM sections WHERE tenant_id=$1 AND page_id=$2 ORDER BY order_index ASC`,
    [masterId, masterHomeId]
  );

  for (const child of children.rows) {
    console.log(`\n— Sync → ${child.slug} (id=${child.id})`);
    const childPages = await pool.query(
      `SELECT id FROM pages WHERE tenant_id=$1 AND is_homepage=TRUE ORDER BY id`,
      [child.id]
    );
    const childHomeId = childPages.rows[0]?.id;
    if (!childHomeId) {
      console.log(`  ⚠ child nemá homepage — skip`);
      continue;
    }

    const childSecs = await pool.query(
      `SELECT id, section_type, section_variant, order_index, is_visible, settings
       FROM sections WHERE tenant_id=$1 AND page_id=$2 ORDER BY order_index ASC`,
      [child.id, childHomeId]
    );

    // Pairing master vs child by order_index slot.
    // Strategy: walk master order, find matching child (by order_index OR by type
    // if order_index drifted), apply merge.
    const childByOrder = new Map(childSecs.rows.map((s) => [s.order_index, s]));
    const usedChildIds = new Set();
    let inserted = 0, updated = 0, kept = 0;

    for (const m of masterSecs.rows) {
      let c = childByOrder.get(m.order_index);
      if (!c || c.section_type !== m.section_type) {
        // Fallback: find by type among unused
        c = childSecs.rows.find(
          (x) => x.section_type === m.section_type && !usedChildIds.has(x.id)
        );
      }
      if (c) {
        usedChildIds.add(c.id);
        // Detect content overrides using baseline snapshot
        const baseline = (c.settings && c.settings.last_master_baseline) || null;
        const masterContent = (m.settings && m.settings.content) || {};
        const childContent = (c.settings && c.settings.content) || {};
        let mergedContent = masterContent;
        if (baseline) {
          const overridePaths = diffPaths(baseline, childContent);
          mergedContent = mergePreservingOverrides(masterContent, childContent, overridePaths);
        }
        const newSettings = {
          ...m.settings,
          content: mergedContent,
          last_master_baseline: masterContent,
        };
        await pool.query(
          `UPDATE sections SET section_variant=$1, order_index=$2, is_visible=$3, settings=$4
           WHERE id=$5`,
          [m.section_variant, m.order_index, m.is_visible, newSettings, c.id]
        );
        updated++;
      } else {
        // Insert new section into child mirroring master
        const newSettings = { ...m.settings, last_master_baseline: m.settings?.content || {} };
        await pool.query(
          `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [child.id, childHomeId, m.section_type, m.section_variant, m.order_index, m.is_visible, newSettings]
        );
        inserted++;
      }
    }

    // Delete child sections that don't exist in master (and have no content override)
    let deleted = 0;
    for (const c of childSecs.rows) {
      if (usedChildIds.has(c.id)) continue;
      const baseline = (c.settings && c.settings.last_master_baseline) || null;
      const childContent = (c.settings && c.settings.content) || {};
      const hasOverride = baseline ? diffPaths(baseline, childContent).size > 0 : false;
      if (hasOverride) {
        console.log(`  ⚠ child sekce id=${c.id} (${c.section_type}) má content override — ZACHOVÁNA (master ji smazal, ale ty máš vlastní data)`);
        kept++;
      } else {
        await pool.query(`DELETE FROM sections WHERE id=$1`, [c.id]);
        deleted++;
      }
    }

    console.log(`  ✓ inserted=${inserted}, updated=${updated}, deleted=${deleted}, kept(override)=${kept}`);
  }

  await pool.end();
  console.log(`\n✅ Sync DONE`);
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
