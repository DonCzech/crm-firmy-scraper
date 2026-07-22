#!/usr/bin/env node
/**
 * Nasměruje rezervační widget všech DEMO tenantů na veřejný demo účet Rezory.
 *
 * Demo weby původně mířily na `http://localhost:3199`, což mimo vývojářský
 * stroj nefunguje (widget zůstal prázdný). Tenhle skript přepíše `apiBaseUrl`
 * na produkční `https://app.rezora.cz` a `providerSlug` na sdílený demo účet,
 * takže rezervace v ukázkách fungují i pro návštěvníky.
 *
 * Skutečné (zákaznické) weby se sem NEZAPOČÍTÁVAJÍ — ty se propojují přes
 * párovací klíč v adminu (`/api/demo/<slug>/rezora-connect`), a poznáme je
 * podle toho, že mají jiný providerSlug než demo placeholder.
 *
 *   node scripts/rezora-point-demos.mjs          # náhled (nic nemění)
 *   node scripts/rezora-point-demos.mjs --apply  # zapíše změny
 */

import pg from "pg";
import { readFileSync } from "fs";

const API = "https://app.rezora.cz";
const DEMO_SLUG = "vyzkousej";
const APPLY = process.argv.includes("--apply");

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const m = env.match(/^DATABASE_URL=(.+)$/m);
  if (!m) throw new Error("DATABASE_URL nenalezen v .env.local");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const pool = new pg.Pool({ connectionString: databaseUrl() });

// Bereme jen sekce, které ještě míří na localhost nebo nemají slug — cizí
// (propojené) účty necháváme být.
const TARGET = `
  section_type = 'rezora-widget'
  AND (
    coalesce(settings->'content'->>'apiBaseUrl', '') LIKE 'http://localhost%'
    OR coalesce(settings->'content'->>'providerSlug', '') IN ('', '${DEMO_SLUG}')
  )
`;

const { rows: before } = await pool.query(`
  SELECT s.id, s.tenant_id, t.slug AS tenant_slug,
         s.settings->'content'->>'apiBaseUrl'   AS api,
         s.settings->'content'->>'providerSlug' AS provider
    FROM sections s JOIN tenants t ON t.id = s.tenant_id
   WHERE ${TARGET}
   ORDER BY t.slug
`);

console.log(`Sekcí k přepnutí: ${before.length}`);
for (const r of before.slice(0, 5)) {
  console.log(`  ${r.tenant_slug.padEnd(28)} ${r.api} / ${r.provider}`);
}
if (before.length > 5) console.log(`  … a dalších ${before.length - 5}`);

if (!APPLY) {
  console.log("\nNáhled — nic nezměněno. Spusť s --apply pro zápis.");
  await pool.end();
  process.exit(0);
}

// POZOR: `jsonb_set(settings, '{content,apiBaseUrl}', …, true)` chybějící objekt
// `content` NEVYTVOŘÍ — create_missing doplní jen poslední klíč cesty, a když
// prostřední úroveň chybí, vrátí se řádek beze změny. Čerstvě naseedované sekce
// takový objekt nemají, takže je předchozí verze skriptu tiše přeskakovala
// (widget pak zůstal bez poskytovatele). Proto `content` nejdřív složíme.
const { rows: updated } = await pool.query(
  `UPDATE sections
      SET settings = coalesce(settings, '{}'::jsonb)
                     || jsonb_build_object('content',
                          coalesce(settings->'content', '{}'::jsonb)
                          || jsonb_build_object('apiBaseUrl', $1::text,
                                                'providerSlug', $2::text)),
          updated_at = now()
    WHERE ${TARGET}
    RETURNING id`,
  [API, DEMO_SLUG]
);

console.log(`\nPřepsáno sekcí: ${updated.length} → ${API} / ${DEMO_SLUG}`);

const { rows: leftover } = await pool.query(`
  SELECT count(*)::int AS c FROM sections
   WHERE section_type = 'rezora-widget'
     AND coalesce(settings->'content'->>'apiBaseUrl', '') LIKE 'http://localhost%'
`);
console.log(`Zbývá na localhostu: ${leftover[0].c}`);

await pool.end();
