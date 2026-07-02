import pg from "pg";
import { readFileSync } from "fs";

const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();

const TENANT_ID = 525;

const slots = {
  "brand.name": "Aurélie Clinic",
  "brand.tagline": "Estetická dermatologie & medicínská kosmetika v centru Prahy",
  "brand.logoUrl": "/templates/clinic-02/logo.svg",
  "contact.address": "Vinohradská 2828/151",
  "contact.city": "130 00 Praha 3",
  "contact.zip": "130 00",
  "contact.phone": "+420 234 567 890",
  "contact.email": "info@aurelie-clinic.cz",
  "social.facebook": "https://facebook.com/aurelie.clinic",
  "social.instagram": "https://instagram.com/aurelie.clinic",
  "seo.defaultTitle": "Aurélie Clinic — Estetická dermatologie Praha",
  "seo.defaultDescription":
    "Prémiová klinika estetické dermatologie v centru Prahy. Botox, výplně, Ultraformer HIFU lifting. Vstupní konzultace s lékařem zdarma. Tým 6 atestovaných dermatologů, originální preparáty Allergan, Galderma a Merz.",
};

for (const [key, value] of Object.entries(slots)) {
  await c.query(
    `INSERT INTO tenant_data_slots (tenant_id, slot_key, value, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (tenant_id, slot_key)
     DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [TENANT_ID, key, JSON.stringify(value)]
  );
  console.log(`✓ ${key}`);
}

await c.end();
console.log("\nDone — slots updated for tenant 525.");
