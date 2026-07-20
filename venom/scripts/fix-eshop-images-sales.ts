/**
 * Fix: (1) nahradí rozbité Unsplash fotky ověřenými ID (HEAD check),
 *      (2) přidá compare_at ceny + sale flag dalším produktům, ať má sekce slev obsah.
 */
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

// Kandidáti na náhradu — první, který vrátí 200, vyhrává.
const CATEGORY_FIX: Record<string, string[]> = {
  dekorace: ["photo-1493809842364-78817add7ffb", "photo-1522708323590-d24dbb6b0267", "photo-1416879595882-3373a0480b5b"],
  fitness: ["photo-1534438327276-14e5300c3a48", "photo-1583454110551-21f2fa2afe61", "photo-1517836357463-d25dfeac3438"],
  "pece-o-plet": ["photo-1556228720-195a672e8a03", "photo-1570172619644-dfd03ed5d881", "photo-1571781926291-c477ebfd024b"],
  "svicky-vune": ["photo-1602523961358-f9f03dd557db", "photo-1603006905003-be475563bc59", "photo-1608181831718-c9ffd8728e94"],
};

const PRODUCT_FIX: Record<string, string[]> = {
  "batoh-turisticky-40l": ["photo-1553062407-98eeb64c6a62", "photo-1622260614153-03223fb72052"],
  "bezecke-boty-ultraboost": ["photo-1542291026-7eec264c27ff", "photo-1595950653106-6c9ebd614d3a"],
  "bose-qc-ultra-earbuds": ["photo-1590658268037-6bf12165a8df", "photo-1606220945770-b5b6c2c55bf1"],
  "dekoracni-vaza-sklo": ["photo-1578500494198-246f612d3b3d", "photo-1493809842364-78817add7ffb", "photo-1522708323590-d24dbb6b0267"],
  "dziny-slim-fit": ["photo-1541099649105-f69ad21f3246", "photo-1542272604-787c3835535d"],
  "hydratacni-krem-50ml": ["photo-1620916566398-39f1143ab7be", "photo-1556228720-195a672e8a03"],
  "ipad-air-m2": ["photo-1544244015-0df4b3ffc6b0", "photo-1561154464-82e9adf32764"],
  "jbl-flip-6": ["photo-1608043152269-423dbba4e7e1", "photo-1589003077984-894e133dabab"],
  "kettlebell-litina-16kg": ["photo-1517344884509-a0c97ec11bcc", "photo-1526506118085-60ce8714f8c5", "photo-1534438327276-14e5300c3a48"],
  "lenovo-tab-p12": ["photo-1561154464-82e9adf32764", "photo-1544244015-0df4b3ffc6b0"],
  "lnene-povleceni-set": ["photo-1522771739844-6a9f6d5f14af", "photo-1584100936595-c0654b55a2e2", "photo-1631049307264-da0ec9d70304"],
  "pleotva-maska-kolagen": ["photo-1596755389378-c31d21fd1273", "photo-1570172619644-dfd03ed5d881", "photo-1556228720-195a672e8a03"],
  "polo-kosile-pique": ["photo-1586363104862-3a5e2ab60d99", "photo-1521572163474-6864f9cf17ab"],
  "salomon-x-ultra-4-gtx": ["photo-1520639888713-7851133b1ed0", "photo-1606107557195-0e29a4b5b4aa"],
  "smart-zavlaha-wifi": ["photo-1563911302283-d2bc129e7570", "photo-1416879595882-3373a0480b5b", "photo-1585320806297-9794b3e4eeae"],
  "sony-wh-1000xm5": ["photo-1618366712010-f4ae9c647dcb", "photo-1505740420928-5e560c06d30e"],
  "tricko-oversized-premium": ["photo-1521572163474-6864f9cf17ab", "photo-1576566588028-4147f3842f27"],
  "usb-c-hub-7v1": ["photo-1625723044792-44de16ccb4e9", "photo-1587145820266-a5951ee6f620", "photo-1618410320928-25228d811631"],
  "vino-prosecco-doc": ["photo-1510812431401-41d2bd2722f3", "photo-1547595628-c61a29f496f0"],
  "zahradni-nuzky-bypass": ["photo-1589923188900-85dae523342b", "photo-1585320806297-9794b3e4eeae", "photo-1466692476868-aef1dfb1e735"],
  "zimni-bunda-parka": ["photo-1544923246-77307dd654cb", "photo-1539533018447-63fcce2678e3", "photo-1548126032-079a0fb0099d"],
  "zrnkova-kava-ethiopia": ["photo-1559056199-641a0ac8b55e", "photo-1447933601403-0c6688de566e"],
};

// Produkty, kterým přidáme slevu (compare_at = price * faktor) + sale flag.
const NEW_SALES: Record<string, number> = {
  "bezecke-boty-ultraboost": 1.3,
  "jbl-flip-6": 1.25,
  "ipad-air-m2": 1.15,
  "dziny-slim-fit": 1.4,
  "kettlebell-litina-16kg": 1.3,
  "hydratacni-krem-50ml": 1.35,
  "batoh-turisticky-40l": 1.25,
  "lnene-povleceni-set": 1.3,
  "usb-c-hub-7v1": 1.45,
  "zrnkova-kava-ethiopia": 1.2,
};

const ok = new Map<string, boolean>();
async function alive(url: string): Promise<boolean> {
  if (ok.has(url)) return ok.get(url)!;
  try {
    const res = await fetch(url, { method: "HEAD" });
    ok.set(url, res.status === 200);
  } catch {
    ok.set(url, false);
  }
  return ok.get(url)!;
}

async function pick(candidates: string[], size: string): Promise<string | null> {
  for (const id of candidates) {
    const url = `https://images.unsplash.com/${id}?${size}&fit=crop&auto=format&q=80`;
    if (await alive(url)) return url;
  }
  return null;
}

async function main() {
  // 1) Kategorie
  for (const [slug, candidates] of Object.entries(CATEGORY_FIX)) {
    const url = await pick(candidates, "w=600&h=600");
    if (!url) { console.log(`❌ CAT ${slug}: žádný kandidát nežije`); continue; }
    await pool.query(
      `UPDATE product_categories SET image_url=$1 WHERE tenant_id=$2 AND slug=$3`,
      [url, TENANT_ID, slug]
    );
    console.log(`✅ CAT ${slug} → ${url}`);
  }

  // 2) Produktové obrázky — nahradíme jen ty rozbité (HEAD != 200)
  for (const [slug, candidates] of Object.entries(PRODUCT_FIX)) {
    const rows = (await pool.query(
      `SELECT pi.id, pi.url FROM product_images pi
       JOIN products p ON p.id = pi.product_id
       WHERE p.tenant_id=$1 AND p.slug=$2 ORDER BY pi.position`,
      [TENANT_ID, slug]
    )).rows;
    for (const r of rows) {
      if (await alive(r.url)) continue;
      const url = await pick(candidates, "w=800&h=800");
      if (!url) { console.log(`❌ IMG ${slug} #${r.id}: žádný kandidát nežije`); continue; }
      await pool.query(`UPDATE product_images SET url=$1 WHERE id=$2`, [url, r.id]);
      console.log(`✅ IMG ${slug} #${r.id} → ${url}`);
    }
  }

  // 3) Slevy
  for (const [slug, factor] of Object.entries(NEW_SALES)) {
    const res = await pool.query(
      `UPDATE product_variants pv
       SET compare_at_price_cents = ROUND(pv.price_cents * $1::numeric / 100.0) * 100
       FROM products p
       WHERE pv.product_id = p.id AND p.tenant_id=$2 AND p.slug=$3
         AND (pv.compare_at_price_cents IS NULL OR pv.compare_at_price_cents <= pv.price_cents)`,
      [factor, TENANT_ID, slug]
    );
    await pool.query(
      `UPDATE products SET flags = COALESCE(flags,'{}'::jsonb) || '{"sale":true}'::jsonb
       WHERE tenant_id=$1 AND slug=$2`,
      [TENANT_ID, slug]
    );
    console.log(`💰 SALE ${slug}: ${res.rowCount} variant, faktor ${factor}`);
  }

  await pool.end();
  console.log("\nHotovo.");
}

main().catch((e) => { console.error(e); process.exit(1); });
