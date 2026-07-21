// hair-02 V3 — DB propagace (REMASTER_PLAYBOOK §2.8) pro VŠECHNY tenanty šablony.
// Reset content_overrides (residua z klonu hairsalon-no1) + designTokens „Blush & Clay".
// Spouštěj po seed + sync:  export $(grep -E '^DATABASE_URL=' .env.local|head -1) && node scripts/hair02-db.mjs
import { Client } from "pg";

const TOKENS = {
  colorPrimary: "#C0685C",
  colorSecondary: "#3B2B27",
  colorAccent: "#9E5147",
  colorBackground: "#FBF6F3",
  colorSurface: "#FFFFFF",
  colorText: "#2A211E",
  colorTextMuted: "#7C6B64",
  colorBorder: "#EADDD6",
  fontHeading: "'Newsreader', Georgia, serif",
  fontBody: "'Schibsted Grotesk', sans-serif",
  borderRadius: "20px",
  spacing: "spacious",
};

const KEEP_OVERRIDES = ["hero-hair-02-page"]; // podstránkové hero: overrides drží platné titulky

const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

const { rows: tenants } = await c.query(
  `SELECT id, slug FROM tenants WHERE template_id = (SELECT template_id FROM tenants WHERE slug = 'hair-02-demo') ORDER BY id`
);
console.log("tenanti šablony hair-02:", tenants.map((t) => `${t.id}/${t.slug}`).join(", "));

for (const t of tenants) {
  const r1 = await c.query(
    `UPDATE sections SET content_overrides = '{}'::jsonb
       WHERE tenant_id = $1 AND section_variant <> ALL($2::text[]) AND content_overrides <> '{}'::jsonb`,
    [t.id, KEEP_OVERRIDES]
  );
  const r2 = await c.query(
    `UPDATE sections SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{designTokens}', $2::jsonb)
       WHERE tenant_id = $1`,
    [t.id, JSON.stringify(TOKENS)]
  );
  console.log(`  ${t.slug}: overrides reset ${r1.rowCount}, designTokens ${r2.rowCount}`);
}

await c.end();
console.log("hotovo — nezapomeň: touch src/lib/section-resolver.ts (5min template cache)");
