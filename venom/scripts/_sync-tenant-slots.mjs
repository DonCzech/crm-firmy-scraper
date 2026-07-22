// Srovná `tenant_data_slots` (brand.name, contact.*) s demo identitou šablony.
// Tyto sloty plní SEO metadata (<title>, og:*, twitter:*) a JSON-LD LocalBusiness —
// jsou to ČTVRTÉ úložiště obsahu vedle content_overrides, settings.content
// a template_versions.default_demo_content. Bez nich zůstane v <head> starý brand z klonu.
//
// Usage: export $(grep -E '^DATABASE_URL=' .env.local|head -1) && node scripts/_sync-tenant-slots.mjs <templateKey>
import { Client } from "pg";
import fs from "fs";
import path from "path";

const key = process.argv[2];
if (!key) throw new Error("chybí <templateKey>");

const dir = path.join(process.cwd(), "src/templates", key);
const tpl = JSON.parse(fs.readFileSync(path.join(dir, "template.json"), "utf8"));
const cs = JSON.parse(fs.readFileSync(path.join(dir, "content/cs.json"), "utf8"));

const pick = (...paths) => {
  for (const p of paths) {
    const v = p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), cs);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
};

const SLOTS = {
  "brand.name": tpl.name ?? pick("navbar.siteName", "footer.siteName"),
  "contact.phone": pick("footer.phone", "contact.phone", "contact-location.phone", "navbar.phone"),
  "contact.email": pick("footer.email", "contact.email", "contact-location.email"),
  "contact.address": pick("footer.address", "contact.address", "contact-location.address"),
};

const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const { rows: tenants } = await c.query(
  `SELECT t.id, t.slug FROM tenants t JOIN templates tp ON tp.id = t.template_id WHERE tp.key = $1 ORDER BY t.id`,
  [key]
);
console.log(`šablona ${key} → ${tenants.length} tenantů`);
console.log("  cílové sloty:", JSON.stringify(SLOTS, null, 0));

for (const t of tenants) {
  const changed = [];
  for (const [slot, value] of Object.entries(SLOTS)) {
    if (!value) continue;
    const { rows } = await c.query(
      `SELECT value::text AS v FROM tenant_data_slots WHERE tenant_id = $1 AND slot_key = $2`,
      [t.id, slot]
    );
    const next = JSON.stringify(value);
    if (rows[0]?.v === next) continue;
    if (rows.length) {
      await c.query(`UPDATE tenant_data_slots SET value = $3::jsonb WHERE tenant_id = $1 AND slot_key = $2`, [t.id, slot, next]);
    } else {
      await c.query(`INSERT INTO tenant_data_slots (tenant_id, slot_key, value) VALUES ($1, $2, $3::jsonb)`, [t.id, slot, next]);
    }
    changed.push(`${slot}=${value}`);
  }
  console.log(`  ${t.slug}: ${changed.length ? changed.join(", ") : "beze změny"}`);
}
await c.end();
console.log("hotovo — touch src/lib/section-resolver.ts");
