/** Audit: najdi 404 obrázky v kategoriích a produktech tenanta eshop-01-v2. */
import { Pool } from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(__dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TENANT_ID = 1275;

async function check(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  const cats = await pool.query(
    `SELECT id, slug, name, image_url FROM product_categories WHERE tenant_id=$1 AND image_url IS NOT NULL`,
    [TENANT_ID]
  );
  const imgs = await pool.query(
    `SELECT pi.id, pi.url, p.slug AS product_slug, p.title
     FROM product_images pi JOIN products p ON p.id = pi.product_id
     WHERE p.tenant_id=$1`,
    [TENANT_ID]
  );

  console.log(`Kategorie s obrázkem: ${cats.rows.length}, produktové obrázky: ${imgs.rows.length}`);

  const broken: string[] = [];
  const batch = async <T>(rows: T[], fn: (r: T) => Promise<void>) => {
    for (let i = 0; i < rows.length; i += 10) {
      await Promise.all(rows.slice(i, i + 10).map(fn));
    }
  };

  await batch(cats.rows, async (r) => {
    const s = await check(r.image_url);
    if (s !== 200) {
      broken.push(`CAT ${r.slug} (${s}): ${r.image_url}`);
    }
  });
  await batch(imgs.rows, async (r) => {
    const s = await check(r.url);
    if (s !== 200) {
      broken.push(`IMG ${r.product_slug} #${r.id} (${s}): ${r.url}`);
    }
  });

  console.log(`\nRozbité: ${broken.length}`);
  broken.sort().forEach((b) => console.log(b));

  // Sale products (compare_at > price)
  const sale = await pool.query(
    `SELECT p.slug, MIN(pv.price_cents) AS pmin, MAX(pv.compare_at_price_cents) AS cmax
     FROM products p JOIN product_variants pv ON pv.product_id = p.id
     WHERE p.tenant_id=$1 AND p.status='active'
     GROUP BY p.id
     HAVING MAX(pv.compare_at_price_cents) > MIN(pv.price_cents)`,
    [TENANT_ID]
  );
  console.log(`\nProdukty se slevou (compare_at > price): ${sale.rows.length}`);
  sale.rows.forEach((r) => console.log(`  ${r.slug}: ${r.pmin} → compare ${r.cmax}`));

  const flagged = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE flags->>'sale' = 'true') AS sale,
            COUNT(*) FILTER (WHERE flags->>'new' = 'true') AS new,
            COUNT(*) FILTER (WHERE flags->>'featured' = 'true') AS featured
     FROM products WHERE tenant_id=$1 AND status='active'`,
    [TENANT_ID]
  );
  console.log(`Flagy:`, flagged.rows[0]);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
