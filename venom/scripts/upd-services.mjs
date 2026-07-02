import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url }); await c.connect();
const t = await c.query("SELECT id FROM tenants WHERE slug='barber-01'");
const tid = t.rows[0].id;
const s = await c.query("SELECT id, section_variant, content_overrides FROM sections WHERE tenant_id=$1 AND section_type='services'", [tid]);
for (const row of s.rows) {
  const ov = row.content_overrides || {};
  ov.eyebrow  = ov.eyebrow  ?? "Klasika & precizní řemeslo";
  ov.subtitle = ov.subtitle ?? "Každý zákrok provádíme s důrazem na detail, čisté linie a péči o váš osobní styl. Ceny jsou konečné, bez skrytých poplatků.";
  ov.footnote = ov.footnote ?? "Ceny jsou orientační — finální cena závisí na délce vlasů a vousů. Rezervace minimálně 24h předem.";
  ov.ctaText  = ov.ctaText  ?? "Rezervovat termín";
  ov.ctaHref  = ov.ctaHref  ?? "#rezervace";
  await c.query("UPDATE sections SET content_overrides=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(ov), row.id]);
  console.log("updated section", row.id, row.section_variant);
}
await c.end();
