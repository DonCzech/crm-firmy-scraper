import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url }); await c.connect();
const t = await c.query("SELECT id FROM tenants WHERE slug='barber-01'");
const tid = t.rows[0].id;
const s = await c.query("SELECT id, content_overrides FROM sections WHERE tenant_id=$1 AND section_type='gallery'", [tid]);
for (const row of s.rows) {
  const ov = row.content_overrides || {};
  ov.eyebrow  = ov.eyebrow  ?? "Naše portfolio";
  ov.subtitle = ov.subtitle ?? "Vyberte si z naší galerie střihů, holení a finálního stylingu — každá fotka je skutečný klient ze studia v Brně.";
  await c.query("UPDATE sections SET content_overrides=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(ov), row.id]);
  console.log("updated gallery", row.id);
}
await c.end();
