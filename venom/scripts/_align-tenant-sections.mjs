// Srovná sekce VŠECH tenantů dané šablony podle template.json (REMASTER_PLAYBOOK §2.8).
// Řeší: přepnutí section_variant, pořadí sekcí, chybějící/přebývající sekce,
// reset content_overrides (residua z klonů) a designTokens z theme.json.
//
// Usage: export $(grep -E '^DATABASE_URL=' .env.local|head -1) \
//        && node scripts/_align-tenant-sections.mjs <templateKey> [--keep-overrides <variant,variant>] [--dry]
//
// POZOR: (page_id, order_index) má UNIQUE ⇒ přeuspořádání dvoufázově přes +1000 offset.
import { Client } from "pg";
import fs from "fs";
import path from "path";

const [key, ...rest] = process.argv.slice(2);
if (!key) throw new Error("chybí <templateKey>");
const dry = rest.includes("--dry");
const keepIdx = rest.indexOf("--keep-overrides");
const KEEP = keepIdx >= 0 ? (rest[keepIdx + 1] ?? "").split(",").filter(Boolean) : [];

const dir = path.join(process.cwd(), "src/templates", key);
const tpl = JSON.parse(fs.readFileSync(path.join(dir, "template.json"), "utf8"));
const theme = JSON.parse(fs.readFileSync(path.join(dir, "theme.json"), "utf8"));

const TOKENS = {
  colorPrimary: theme.colors.primary,
  colorSecondary: theme.colors.secondary,
  colorAccent: theme.colors.accent,
  colorBackground: theme.colors.background,
  colorSurface: theme.colors.surface,
  colorText: theme.colors.text,
  colorTextMuted: theme.colors.textMuted,
  colorBorder: theme.colors.border,
  fontHeading: theme.typography.fontHeading,
  fontBody: theme.typography.fontBody,
  borderRadius: theme.radius?.lg ?? "12px",
  spacing: theme.spacing?.personality ?? "comfortable",
};

const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

const { rows: tenants } = await c.query(
  `SELECT t.id, t.slug FROM tenants t
     JOIN templates tp ON tp.id = t.template_id
    WHERE tp.key = $1 ORDER BY t.id`,
  [key]
);
if (!tenants.length) throw new Error(`žádní tenanti pro šablonu ${key}`);
console.log(`šablona ${key} → tenanti: ${tenants.map((t) => `${t.id}/${t.slug}`).join(", ")}`);

for (const t of tenants) {
  console.log(`\n── ${t.slug} (${t.id})`);
  for (const page of tpl.pages) {
    const { rows: prows } = await c.query(
      `SELECT id FROM pages WHERE tenant_id = $1 AND slug = $2`,
      [t.id, page.slug]
    );
    let pageId = prows[0]?.id;
    if (!pageId) {
      if (dry) { console.log(`   + stránka ${page.slug} by se založila`); continue; }
      const ins = await c.query(
        `INSERT INTO pages (tenant_id, slug, title, is_homepage, status)
         VALUES ($1, $2, $3, $4, 'published') RETURNING id`,
        [t.id, page.slug, page.title ?? page.slug, !!page.isHomepage]
      );
      pageId = ins.rows[0].id;
      console.log(`   + založena stránka ${page.slug} (id ${pageId})`);
    }
    const { rows: existing } = await c.query(
      `SELECT id, section_type, section_variant, order_index FROM sections
        WHERE page_id = $1 ORDER BY order_index`,
      [pageId]
    );

    // spáruj podle typu v pořadí výskytu
    const pool = new Map();
    for (const s of existing) {
      if (!pool.has(s.section_type)) pool.set(s.section_type, []);
      pool.get(s.section_type).push(s);
    }
    const plan = [];
    for (const want of page.sections) {
      const bucket = pool.get(want.type) ?? [];
      const match = bucket.shift();
      plan.push({ want, existing: match ?? null });
    }
    const leftovers = [...pool.values()].flat();

    if (dry) {
      console.log(`   ${page.slug}: ${plan.length} sekcí (${plan.filter((p) => !p.existing).length} nových, ${leftovers.length} navíc)`);
      continue;
    }

    // fáze 1 — uvolni order_index (UNIQUE past)
    await c.query(`UPDATE sections SET order_index = order_index + 1000 WHERE page_id = $1`, [pageId]);

    // fáze 2 — nastav cílový stav
    let created = 0;
    for (let i = 0; i < plan.length; i++) {
      const { want, existing: ex } = plan[i];
      if (ex) {
        await c.query(
          `UPDATE sections SET section_variant = $1, order_index = $2, is_visible = true, updated_at = now()
             WHERE id = $3`,
          [want.variant ?? "default", i, ex.id]
        );
      } else {
        await c.query(
          `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source)
           VALUES ($1, $2, $3, $4, $5, true, '{}'::jsonb, '{}'::jsonb, 'v2')`,
          [t.id, pageId, want.type, want.variant ?? "default", i]
        );
        created++;
      }
    }
    for (const l of leftovers) {
      await c.query(`DELETE FROM sections WHERE id = $1`, [l.id]);
    }
    console.log(`   ${page.slug}: ${plan.length} sekcí srovnáno (+${created} nových, −${leftovers.length} navíc)`);
  }

  // reset overrides (kromě chráněných variant) + designTokens
  const r1 = dry
    ? { rowCount: 0 }
    : await c.query(
        `UPDATE sections SET content_overrides = '{}'::jsonb
           WHERE tenant_id = $1 AND content_overrides <> '{}'::jsonb AND section_variant <> ALL($2::text[])`,
        [t.id, KEEP]
      );
  // POZOR: obsah žije i v settings->'content' (třetí úložiště vedle content_overrides
  // a template_versions.default_demo_content) — u malir-02 tam přežíval starý brand klonu.
  const r3 = dry
    ? { rowCount: 0 }
    : await c.query(
        `UPDATE sections SET settings = settings - 'content'
           WHERE tenant_id = $1 AND settings ? 'content'`,
        [t.id]
      );
  const r2 = dry
    ? { rowCount: 0 }
    : await c.query(
        `UPDATE sections SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{designTokens}', $2::jsonb)
           WHERE tenant_id = $1`,
        [t.id, JSON.stringify(TOKENS)]
      );
  console.log(`   overrides reset: ${r1.rowCount}, settings.content smazáno: ${r3.rowCount}, designTokens: ${r2.rowCount}`);
}

await c.end();
console.log("\nhotovo — spusť: touch src/lib/section-resolver.ts (5min template cache)");
