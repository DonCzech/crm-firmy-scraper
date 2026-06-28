/**
 * Patch 3: Fix gallery mega-photo aspect-ratio
 *
 * Problem: Frame-1.jpg container has grid-column:span 2; aspect-ratio:1
 *          This creates a 2-column-wide SQUARE — huge compared to 1:1 neighbours.
 *          Image is 800x400 (2:1 landscape), so the container should also be 2:1.
 *
 * Fix: Change aspect-ratio from 1 to 2/1 for the span-2 gallery cell.
 */

import fs from "node:fs";
import { Pool } from "pg";

const env = fs.readFileSync(".env.local", "utf8");
const databaseUrl = env
  .split(/\r?\n/)
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length);

if (!databaseUrl) throw new Error("DATABASE_URL missing in .env.local");

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

function patch(html) {
  // The span-2 cell: <div style="overflow:hidden;aspect-ratio:1;grid-column:span 2;">
  // Change aspect-ratio to 2/1 so the 800x400 image isn't cropped to a square
  return html.replace(
    /(<div style="overflow:hidden;aspect-ratio:)1(;grid-column:span 2;">)/,
    "$12/1$2"
  );
}

async function main() {
  const { rows } = await pool.query(
    `SELECT s.id, s.settings
     FROM tenants t
     JOIN pages p ON p.tenant_id = t.id AND p.slug = 'home'
     JOIN sections s ON s.page_id = p.id AND s.tenant_id = t.id
     WHERE t.slug = 'peak-cut-demo' AND s.section_type = 'full-page-clone'
     LIMIT 1`
  );

  if (!rows[0]) throw new Error("peak-cut-demo full-page-clone section not found");

  const section = rows[0];
  const settings = section.settings ?? {};
  const html = settings.html;
  if (typeof html !== "string") throw new Error("settings.html missing");

  const patched = patch(html);

  if (patched === html) {
    console.log("Pattern not found — already patched or HTML structure changed.");
    // Print nearby context for debug
    const idx = html.indexOf("grid-column:span 2");
    if (idx >= 0) console.log("Context:", html.substring(idx - 50, idx + 100));
    return;
  }

  await pool.query(
    `UPDATE sections SET settings = $1::jsonb, updated_at = now() WHERE id = $2`,
    [JSON.stringify({ ...settings, html: patched }), section.id]
  );

  console.log(`Patched span-2 gallery cell: aspect-ratio:1 → 2/1`);
  console.log(`HTML: ${html.length} → ${patched.length} chars`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => pool.end());
