import pg from "pg";
import { readFileSync } from "fs";

const env = readFileSync("/Users/apple/DEV/CRM/venom/.env.local", "utf-8");
const url = env.match(/DATABASE_URL=(.+)/)?.[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();

const t = await c.query("SELECT id, slug FROM tenants WHERE slug = $1", ["barber-01"]);
const tid = t.rows[0].id;

const s = await c.query(
  "SELECT id, section_type, section_variant, content_source, content_overrides FROM sections WHERE tenant_id=$1 AND section_type='hero' ORDER BY order_index",
  [tid]
);
console.log("hero sections:", s.rows.map(r => ({ id: r.id, variant: r.section_variant, source: r.content_source, ovBg: r.content_overrides?.backgroundImage })));

const NEW_BG = "/images/barber-01/hero.webp";
for (const row of s.rows) {
  const ov = row.content_overrides || {};
  ov.backgroundImage = NEW_BG;
  ov.eyebrow = ov.eyebrow ?? "Brno · Od roku 2014";
  ov.ctaSecondaryText = ov.ctaSecondaryText ?? "Prohlédnout ceník";
  ov.ctaSecondaryHref = ov.ctaSecondaryHref ?? "#sluzby";
  await c.query("UPDATE sections SET content_overrides=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(ov), row.id]);
  console.log("updated hero section", row.id);
}

const n = await c.query("SELECT id, content_overrides FROM sections WHERE tenant_id=$1 AND section_type='navbar' ORDER BY order_index", [tid]);
for (const row of n.rows) {
  const ov = row.content_overrides || {};
  ov.address = ov.address ?? "Náměstí Svobody 5, Brno";
  ov.hoursLabel = ov.hoursLabel ?? "Po–Pá 9:00–20:00 · So 9:00–14:00";
  ov.socials = ov.socials ?? [{ icon: "instagram", href: "https://instagram.com/" }, { icon: "facebook", href: "https://facebook.com/" }];
  await c.query("UPDATE sections SET content_overrides=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(ov), row.id]);
  console.log("updated navbar section", row.id);
}

await c.end();
console.log("done");
