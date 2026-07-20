/**
 * WebP lokalizace obrázků pro eshop-06 (Ořeškárna).
 * Stáhne všechny images.unsplash.com URL z content/cs.json + product_images
 * tenanta eshop-06-v2 jako WebP do public/templates/eshop-06/ a přepíše odkazy.
 * Idempotentní. Usage: DATABASE_URL=... node scripts/localize-eshop-06-images.mjs
 */
import pg from "pg";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUB_DIR = join(ROOT, "public", "templates", "eshop-06");
const PUB_URL = "/templates/eshop-06";
const CS_PATH = join(ROOT, "src", "templates", "eshop-06", "content", "cs.json");
const TENANT_SLUG = "eshop-06-v2";

mkdirSync(PUB_DIR, { recursive: true });

const URL_RE = /https:\/\/images\.unsplash\.com\/photo-[^"'\s)]+/g;

function localName(url) {
  const u = new URL(url);
  const id = u.pathname.replace("/photo-", "");
  const w = u.searchParams.get("w") ?? "0";
  const h = u.searchParams.get("h") ?? "0";
  return `u${id}-${w}x${h}.webp`;
}

async function download(url, name) {
  const dest = join(PUB_DIR, name);
  if (existsSync(dest)) return true;
  const u = new URL(url);
  u.searchParams.set("fm", "webp");
  u.searchParams.set("q", "75");
  const res = await fetch(u.toString());
  if (!res.ok) { console.warn(`⚠️  ${res.status} ${url}`); return false; }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  console.log(`↓ ${name} (${Math.round(buf.length / 1024)} kB)`);
  return true;
}

// 1) cs.json
let cs = readFileSync(CS_PATH, "utf8");
const csUrls = [...new Set(cs.match(URL_RE) ?? [])];
let csOk = 0;
for (const url of csUrls) {
  const name = localName(url);
  if (await download(url, name)) {
    cs = cs.split(url).join(`${PUB_URL}/${name}`);
    csOk++;
  }
}
writeFileSync(CS_PATH, cs);
console.log(`✓ cs.json: ${csOk}/${csUrls.length} obrázků lokalizováno`);

// 2) product_images v DB
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  const t = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
  const tenantId = t.rows[0].id;
  const rows = await client.query(
    "SELECT id, url FROM product_images WHERE tenant_id = $1 AND url LIKE 'https://images.unsplash.com/%'",
    [tenantId]
  );
  let dbOk = 0;
  for (const r of rows.rows) {
    const name = localName(r.url);
    if (await download(r.url, name)) {
      await client.query("UPDATE product_images SET url = $1 WHERE id = $2", [`${PUB_URL}/${name}`, r.id]);
      dbOk++;
    }
  }
  console.log(`✓ product_images: ${dbOk}/${rows.rows.length} přepsáno`);
} finally {
  client.release();
  await pool.end();
}
console.log("✅ Hotovo");
