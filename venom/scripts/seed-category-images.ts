/**
 * Přiřadí Unsplash obrázky kategoriím eshop-01-v2 (pro mega menu + homepage).
 * Spustit: npx tsx scripts/seed-category-images.ts
 */

import { Pool } from "pg";
import { readFileSync } from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TENANT_SLUG = "eshop-01-v2";

function u(id: string, w = 600, h = 600): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

// slug → Unsplash photo id
const IMAGES: Record<string, string> = {
  // Top-level
  "novinky": "1441986300917-64674bd600d8",
  "akce": "1607083206968-13611e3d76db",
  "elektronika": "1498049794561-7780e7231661",
  "obleceni": "1441984904996-e0b6ba687e04",
  "boty": "1549298916-b41d501d3772",
  "sport": "1517836357463-d25dfeac3438",
  "domacnost": "1556228453-efd6c1ff04f6",
  "kosmetika": "1596462502278-27bfdc403348",
  "knihy": "1512820790803-83ca734da794",
  "zahrada": "1416879595882-3373a0480b5b",
  "potraviny": "1506617564039-2f3b650b7010",
  // Elektronika sub
  "notebooky": "1496181133206-80ce9b88a853",
  "mobily": "1511707171634-5f897ff02aa9",
  "sluchatka": "1505740420928-5e560c06d30e",
  "tablety": "1544244015-0df4b3ffc6b0",
  "prislusenstvi-el": "1625723044792-44de16ccb4e9",
  "chytre-hodinky": "1523275335684-37898b6baf30",
  // Oblečení sub
  "panske": "1516257984-b1b4d707412e",
  "damske": "1483985988355-763728e1935b",
  "detske": "1519238263530-99bdd11df2ea",
  "tricka": "1521572163474-6864f9cf17ab",
  "mikiny": "1556821840-3a63f95609a7",
  "bundy": "1551028719-00167b16eac5",
  "kalhoty": "1541099649105-f69ad21f3246",
  // Boty sub
  "tenisky": "1542291026-7eec264c27ff",
  "polobotky": "1614252369475-531eba835eb1",
  "sandaly": "1603487742131-4160ec999306",
  "zimni-boty": "1520639888713-7851133b1ed0",
  // Sport sub
  "fitness": "1571019614242-c5c5dee9f50a",
  "cyklistika": "1485965120184-e220f721d03e",
  "beh": "1476480862126-209bfaa8edc8",
  "outdoor": "1551632811-561732d1e306",
  "joga": "1544367567-0f2fcb009e0b",
  // Domácnost sub
  "svicky-vune": "1602874801006-e26c4c5b5e8a",
  "textil": "1522771739844-6a9f6d5f14af",
  "kuchyne": "1556909114-f6e7ad7d3136",
  "dekorace": "1513519245088-0e12902e35ca",
  "osvetleni": "1507473885765-e6ed057f782c",
  // Kosmetika sub
  "pece-o-plet": "1570194065650-d99fb4cb5d77",
  "vlasova-kosmetika": "1527799820374-dcf8d9d4a388",
  "parfemy": "1541643600914-78b084683601",
  "bio-eko": "1556228578-8c89e6adf883",
  // Potraviny sub
  "kava-caj": "1509042239860-f550ce710b93",
  "cokolada": "1549007994-cb92caebd54b",
  "vino": "1510812431401-41d2bd2722f3",
  "superpotraviny": "1490645935967-10de6ba17061",
};

async function run() {
  const client = await pool.connect();
  try {
    const t = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
    if (!t.rows.length) { console.error("Tenant not found"); return; }
    const tenantId = t.rows[0].id;

    let updated = 0;
    for (const [slug, photoId] of Object.entries(IMAGES)) {
      const res = await client.query(
        `UPDATE product_categories SET image_url = $1 WHERE tenant_id = $2 AND slug = $3 RETURNING id`,
        [u(photoId), tenantId, slug]
      );
      if (res.rows.length) updated++;
      else console.warn(`  ! kategorie nenalezena: ${slug}`);
    }
    console.log(`Updated ${updated}/${Object.keys(IMAGES).length} categories`);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
