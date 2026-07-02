import pg from "pg";
import { readFileSync } from "fs";

const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();

// Helper: merge image fields into existing content_overrides
async function merge(id, patch) {
  const r = await c.query("SELECT content_overrides FROM sections WHERE id=$1", [id]);
  const merged = { ...(r.rows[0].content_overrides || {}), ...patch };
  await c.query("UPDATE sections SET content_overrides=$1::jsonb WHERE id=$2", [JSON.stringify(merged), id]);
  console.log(`✓ Merged image fields into id=${id}`);
}

// 3850 hero
await merge(3850, { bgImage: "/images/clinic-02/hero.webp" });
// 3851 about
await merge(3851, { imageUrl: "/images/clinic-02/about.webp" });
// 3852 services — patch existing services array with imageUrl per card
{
  const r = await c.query("SELECT content_overrides FROM sections WHERE id=3852");
  const co = r.rows[0].content_overrides || {};
  const images = [
    "/images/clinic-02/service-botox.webp",
    "/images/clinic-02/service-filler.webp",
    "/images/clinic-02/service-hifu.webp",
  ];
  co.services = (co.services || []).map((s, i) => ({ ...s, imageUrl: images[i] }));
  await c.query("UPDATE sections SET content_overrides=$1::jsonb WHERE id=3852", [JSON.stringify(co)]);
  console.log("✓ Patched services 3852 with imageUrls");
}

await c.end();
console.log("\nDone — images wired into DB.");
