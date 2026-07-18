// Jednorázově zapne categoriesSource="commerce" pro navbar sekce eshop tenantů.
// Použití: DATABASE_URL=... node scripts/enable-commerce-megamenu.mjs
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const rows = (await pool.query(
  `SELECT s.id, t.slug
   FROM sections s
   JOIN pages p ON p.id = s.page_id
   JOIN tenants t ON t.id = s.tenant_id
   WHERE s.section_type = 'navbar'
     AND p.is_homepage = true
     AND t.slug LIKE 'eshop-%-v2'
     AND t.slug <> 'eshop-20-v2'
   ORDER BY t.slug`
)).rows;

// Legacy sekce čtou settings.content, v2 sekce template defaults ⊕ content_overrides
// → flag zapisujeme na obě místa (u v2 je settings.content ignorováno a naopak).
const res = await pool.query(
  `UPDATE sections
   SET settings = jsonb_set(
         COALESCE(settings::jsonb, '{}'::jsonb),
         '{content,categoriesSource}',
         '"commerce"'::jsonb,
         true
       ),
       content_overrides = jsonb_set(
         COALESCE(content_overrides::jsonb, '{}'::jsonb),
         '{categoriesSource}',
         '"commerce"'::jsonb,
         true
       )
   WHERE id = ANY($1::int[])
   RETURNING id, content_source`,
  [rows.map((r) => r.id)]
);

const bySource = {};
for (const r of res.rows) bySource[r.content_source ?? "legacy"] = (bySource[r.content_source ?? "legacy"] ?? 0) + 1;
console.log(`updated ${res.rowCount} navbar sections (${JSON.stringify(bySource)}):`, rows.map((r) => r.slug).join(", "));
await pool.end();
