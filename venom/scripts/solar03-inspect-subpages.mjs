import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const p = await c.query("SELECT id, slug, title FROM pages WHERE tenant_id=1055 AND is_homepage=false ORDER BY id");
for (const page of p.rows) {
  const s = await c.query("SELECT id, section_type, section_variant, order_index FROM sections WHERE page_id=$1 ORDER BY order_index", [page.id]);
  console.log(`\n=== Page ${page.id}: /${page.slug} — "${page.title}"`);
  s.rows.forEach(r => console.log(`  [${r.order_index}] id=${r.id} ${r.section_type} → ${r.section_variant}`));
}
await c.end();
