#!/usr/bin/env node
/**
 * Přesměruje rezervační tlačítko v menu z kotvy `#rezervace` na samostatnou
 * podstránku `/rezervace`.
 *
 * Dotýká se JEN navbarů, jejichž CTA už dnes míří na booking kotvu (#rezervace)
 * u tenantů, kteří mají rezora-widget. Kontaktní a jiná tlačítka (#kontakt,
 * /kontakt, /lekce…) zůstávají beze změny. Na multipage webech pak tlačítko
 * vede na stránku /rezervace, na onepage se `/rezervace` sám zresolvuje zpět na
 * kotvu domovské stránky — obojí funguje.
 *
 *   node scripts/rezora-cta-to-page.mjs           # náhled
 *   node scripts/rezora-cta-to-page.mjs --apply   # zápis
 *   node scripts/rezora-cta-to-page.mjs --revert  # zpět na #rezervace
 */

import pg from "pg";
import { readFileSync } from "fs";

const APPLY = process.argv.includes("--apply");
const REVERT = process.argv.includes("--revert");
const FROM = REVERT ? "/rezervace" : "#rezervace";
const TO = REVERT ? "#rezervace" : "/rezervace";

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  return env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^["']|["']$/g, "");
}
const pool = new pg.Pool({ connectionString: databaseUrl() });

const WHERE = `
  s.section_type = 'navbar'
  AND s.settings->'content'->>'ctaHref' = $1
  AND EXISTS (
    SELECT 1 FROM sections w
     WHERE w.tenant_id = s.tenant_id AND w.section_type = 'rezora-widget'
  )
`;

const { rows: hits } = await pool.query(
  `SELECT s.id, t.slug FROM sections s JOIN tenants t ON t.id = s.tenant_id WHERE ${WHERE} ORDER BY t.slug`,
  [FROM]
);
console.log(`Navbar CTA '${FROM}' → '${TO}': ${hits.length} sekcí`);
for (const h of hits.slice(0, 6)) console.log(`  ${h.slug}  (#${h.id})`);
if (hits.length > 6) console.log(`  … a dalších ${hits.length - 6}`);

if (!APPLY && !REVERT) {
  console.log("\nNáhled — nic nezměněno. --apply zapíše, --revert vrátí zpět.");
  await pool.end();
  process.exit(0);
}

const { rows: upd } = await pool.query(
  `UPDATE sections s
      SET settings = jsonb_set(settings, '{content,ctaHref}', to_jsonb($2::text), true),
          updated_at = now()
     FROM tenants t
    WHERE t.id = s.tenant_id AND ${WHERE}
    RETURNING s.id`,
  [FROM, TO]
);
console.log(`\nUpraveno: ${upd.length} navbarů → CTA nyní '${TO}'`);
await pool.end();
