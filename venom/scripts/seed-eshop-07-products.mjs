/**
 * Seed produktového katalogu pro eshop-07-v2 (Néroli parfumerie — kosmetika-zdravi DNA).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-07-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-07-v2";

// Lokální WebP assety (public/templates/eshop-07/*.webp, 1000×1000)
const U = (name) => `/templates/eshop-07/${name}.webp`;

const P = {
  gold: "gold",                 // zlatý flakon
  darkBottles: "oil-wood",      // olejíček (náhrada za brandované tmavé lahve)
  vials: "vials",               // čiré viály s jantarovou tekutinou
  amber: "amber",               // jantarová lahvička s kapátkem
  oilWood: "oil-wood",          // olejíček na dřevě s eukalyptem
  cream: "cream",               // krém/serum scéna
  skincareSet: "skincare-set",  // set pleťové péče
  whiteBottles: "white-bottles",// bílé lahve vlasová péče
  brushes: "brushes",           // štětce make-up
  makeupFlat: "makeup-flat",    // makeup flatlay s květy
  hair: "hair",                 // vlasová scéna
  bath: "bath",                 // vana / koupel
  gift: "gift",                 // dárek s růžovou mašlí
};

const CATEGORIES = [
  { slug: "vune", name: "Vůně", sort: 0, desc: "Autorské kompozice od malých parfémových domů i osvědčená klasika." },
  { slug: "vune-pro-ni", name: "Vůně pro ni", sort: 0, parent: "vune" },
  { slug: "vune-pro-nej", name: "Vůně pro něj", sort: 1, parent: "vune" },
  { slug: "vune-bez-hranic", name: "Vůně bez hranic", sort: 2, parent: "vune" },
  { slug: "parfemove-vody", name: "Parfémové vody", sort: 3, parent: "vune" },
  { slug: "toaletni-vody", name: "Toaletní vody", sort: 4, parent: "vune" },
  { slug: "vzorky-a-miniatury", name: "Vzorky a miniatury", sort: 5, parent: "vune" },
  { slug: "make-up", name: "Make-up", sort: 1, desc: "Dekorativní kosmetika pro denní i večerní líčení." },
  { slug: "rty", name: "Rty", sort: 0, parent: "make-up" },
  { slug: "oci-a-oboci", name: "Oči a obočí", sort: 1, parent: "make-up" },
  { slug: "nastroje", name: "Nástroje a doplňky", sort: 2, parent: "make-up" },
  { slug: "vlasova-pece", name: "Vlasová péče", sort: 2, desc: "Salonní péče pro každý typ vlasů." },
  { slug: "telo-a-koupel", name: "Tělo a koupel", sort: 3, desc: "Rituály, po kterých se budete cítit skvěle." },
  { slug: "pletova-pece", name: "Pleťová péče", sort: 4, desc: "Aktivní látky v promyšlených recepturách." },
  { slug: "aktivni-sera", name: "Aktivní séra", sort: 0, parent: "pletova-pece" },
  { slug: "darky", name: "Dárky", sort: 5, desc: "Dárková balení připravíme za vás — s mašlí a vzkazem." },
  { slug: "niche-kolekce", name: "Niche kolekce", sort: 6, desc: "Vzácné kompozice, které jinde neseženete." },
  { slug: "doplnkove-sluzby", name: "Doplňkové služby", sort: 99, hidden: true },
];

// price = haléře za 50 ml (default variantu); 30 ml ×0.72, 100 ml ×1.75
const ml30 = (p) => Math.round((p * 0.72) / 100) * 100;
const ml100 = (p) => Math.round((p * 1.75) / 100) * 100;
const PRODUCTS = [
  // Vůně pro ni
  { slug: "maison-noe-fleur-blanche", title: "Fleur Blanche parfémová voda", subtitle: "Parfémová voda pro ženy", cat: "vune-pro-ni", brand: "Maison Noé", price: 89000, stock: 34, flags: { featured: true }, img: [P.gold, P.vials] },
  { slug: "nordic-bloom-aurora", title: "Aurora parfémová voda", subtitle: "Parfémová voda pro ženy", cat: "vune-pro-ni", brand: "Nordic Bloom", price: 74000, compare: 82000, stock: 28, flags: { featured: true }, img: [P.vials, P.gold], volumes: ["50 ml"] },
  { slug: "velvetier-rose-poudre", title: "Rose Poudrée parfémová voda", subtitle: "Pudrová růže s pižmem", cat: "vune-pro-ni", brand: "Velvetier", price: 96000, stock: 21, flags: { new: true }, img: [P.gold, P.oilWood] },
  { slug: "sillage-petale", title: "Pétale toaletní voda", subtitle: "Toaletní voda pro ženy", cat: "toaletni-vody", brand: "SILLAGE", price: 52000, compare: 61000, stock: 42, img: [P.vials, P.oilWood], volumes: ["50 ml"] },
  // Vůně pro něj
  { slug: "sillage-noir-intense", title: "Noir Intense parfémová voda", subtitle: "Parfémová voda pro muže", cat: "vune-pro-nej", brand: "SILLAGE", price: 68000, stock: 39, flags: { featured: true }, img: [P.darkBottles, P.vials] },
  { slug: "maison-noe-cedre-fume", title: "Cèdre Fumé toaletní voda", subtitle: "Kouřový cedr a vetiver", cat: "vune-pro-nej", brand: "Maison Noé", price: 59000, compare: 69000, stock: 31, flags: { featured: true }, img: [P.darkBottles, P.amber], volumes: ["50 ml"] },
  { slug: "nordic-bloom-fjord", title: "Fjord toaletní voda", subtitle: "Toaletní voda pro muže", cat: "vune-pro-nej", brand: "Nordic Bloom", price: 48000, stock: 55, flags: { new: true }, img: [P.vials, P.darkBottles] },
  // Unisex / niche
  { slug: "atelier-9-oud-imperial", title: "Oud Impérial parfémový extrakt", subtitle: "Extrait de Parfum unisex", cat: "niche-kolekce", brand: "ATELIER № 9", price: 189000, stock: 12, flags: { featured: true }, img: [P.darkBottles, P.amber] },
  { slug: "rosa-arabia-ambre-nuit", title: "Ambre Nuit parfémový olej", subtitle: "Parfémový olej unisex", cat: "niche-kolekce", brand: "ROSA ARABIA", price: 112000, stock: 18, flags: { featured: true }, img: [P.amber, P.oilWood], volumes: ["10 ml", "30 ml"] },
  { slug: "rosa-arabia-santal-royal", title: "Santal Royal parfémová voda", subtitle: "Parfémová voda unisex", cat: "vune-bez-hranic", brand: "ROSA ARABIA", price: 98000, compare: 115000, stock: 16, img: [P.darkBottles, P.gold], volumes: ["50 ml"] },
  { slug: "atelier-9-vetiver-sel", title: "Vétiver & Sel parfémová voda", subtitle: "Parfémová voda unisex", cat: "vune-bez-hranic", brand: "ATELIER № 9", price: 132000, stock: 14, flags: { new: true }, img: [P.vials, P.darkBottles] },
  { slug: "velvetier-discovery-set", title: "Discovery set 6× 2 ml", subtitle: "Objevná sada vzorků", cat: "vzorky-a-miniatury", brand: "Velvetier", price: 39000, stock: 60, flags: { featured: true, new: true }, img: [P.vials, P.gift], volumes: ["6× 2 ml"] },
  // Pleťová péče
  { slug: "velvetier-serum-c", title: "Rozjasňující sérum s vitaminem C", subtitle: "Aktivní sérum 15 %", cat: "aktivni-sera", brand: "Velvetier", price: 64000, compare: 74000, stock: 44, flags: { featured: true }, img: [P.cream, P.skincareSet], volumes: ["30 ml"] },
  { slug: "nordic-bloom-hydra-krem", title: "Hydratační krém 72 h", subtitle: "Denní i noční péče", cat: "pletova-pece", brand: "Nordic Bloom", price: 52000, stock: 58, img: [P.skincareSet, P.cream], volumes: ["50 ml"] },
  { slug: "velvetier-nocni-elixir", title: "Noční obnovující elixír", subtitle: "S retinalem a squalanem", cat: "aktivni-sera", brand: "Velvetier", price: 89000, stock: 26, flags: { new: true }, img: [P.amber, P.cream], volumes: ["30 ml"] },
  // Make-up
  { slug: "sillage-rtenka-velours", title: "Sametová rtěnka Velours", subtitle: "Dlouhotrvající matný finiš", cat: "rty", brand: "SILLAGE", price: 34000, compare: 39000, stock: 72, img: [P.makeupFlat, P.brushes], volumes: ["3,5 g"] },
  { slug: "sillage-rasenka-volume", title: "Objemová řasenka Grand Volume", subtitle: "Intenzivní černá", cat: "oci-a-oboci", brand: "SILLAGE", price: 29000, stock: 85, flags: { new: true }, img: [P.brushes, P.makeupFlat], volumes: ["9 ml"] },
  { slug: "velvetier-stetce-set", title: "Sada štětců Essentials 8 ks", subtitle: "Vegan syntetická vlákna", cat: "nastroje", brand: "Velvetier", price: 79000, compare: 94000, stock: 33, flags: { featured: true }, img: [P.brushes, P.makeupFlat], volumes: ["8 ks"] },
  // Vlasy
  { slug: "nordic-bloom-sampon-repair", title: "Obnovující šampon Repair", subtitle: "Pro poškozené vlasy", cat: "vlasova-pece", brand: "Nordic Bloom", price: 38000, stock: 66, img: [P.whiteBottles, P.hair], volumes: ["250 ml", "500 ml"] },
  { slug: "nordic-bloom-maska-keratin", title: "Hloubková maska s keratinem", subtitle: "Intenzivní regenerace", cat: "vlasova-pece", brand: "Nordic Bloom", price: 45000, compare: 52000, stock: 38, img: [P.hair, P.whiteBottles], volumes: ["200 ml"] },
  { slug: "velvetier-vlasovy-olej", title: "Hedvábný olej na vlasy", subtitle: "Lesk bez zatížení", cat: "vlasova-pece", brand: "Velvetier", price: 56000, stock: 29, flags: { new: true }, img: [P.oilWood, P.hair], volumes: ["50 ml"] },
  // Tělo
  { slug: "maison-noe-sprchovy-olej", title: "Sprchový olej Néroli", subtitle: "Vyživující mytí s vůní neroli", cat: "telo-a-koupel", brand: "Maison Noé", price: 42000, stock: 51, flags: { featured: true }, img: [P.bath, P.oilWood], volumes: ["200 ml"] },
  { slug: "nordic-bloom-telove-mleko", title: "Tělové mléko Cloud", subtitle: "Lehká hydratace na každý den", cat: "telo-a-koupel", brand: "Nordic Bloom", price: 36000, compare: 42000, stock: 47, img: [P.whiteBottles, P.bath], volumes: ["300 ml"] },
  // Dárky
  { slug: "darkova-sada-signature", title: "Dárková sada Signature", subtitle: "Parfémová voda 50 ml + sprchový olej", cat: "darky", brand: "Maison Noé", price: 119000, stock: 22, flags: { featured: true }, img: [P.gift, P.gold], volumes: ["Sada"] },
  { slug: "darkovy-poukaz-1000", title: "Dárkový poukaz 1 000 Kč", subtitle: "Elektronicky i v obálce s mašlí", cat: "darky", brand: "Néroli", price: 100000, stock: 999, img: [P.gift], volumes: ["Poukaz"] },
  // Doplňkové služby
  { slug: "sluzba-darkove-baleni", title: "Dárkové balení s mašlí", subtitle: "Hedvábný papír, mašle a vzkaz", cat: "doplnkove-sluzby", brand: "Néroli", price: 4900, stock: 9999, img: [P.gift], volumes: ["Služba"] },
  { slug: "sluzba-prednostni-expedice", title: "Přednostní expedice", subtitle: "Váš balíček přeskočí frontu", cat: "doplnkove-sluzby", brand: "Néroli", price: 3900, stock: 9999, img: [], volumes: ["Služba"] },
];

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  const tRes = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
  if (!tRes.rows.length) throw new Error(`Tenant ${TENANT_SLUG} not found`);
  const tenantId = tRes.rows[0].id;

  await client.query("BEGIN");
  for (const tbl of ["stock_movements", "product_images", "product_category_links", "product_variants", "products", "product_categories"]) {
    await client.query(`DELETE FROM ${tbl} WHERE tenant_id = $1`, [tenantId]);
  }

  const catIds = new Map();
  for (const cat of CATEGORIES.filter(x => !x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, !cat.hidden]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }
  for (const cat of CATEGORIES.filter(x => x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, parent_id)
       VALUES ($1,$2,$3,$4,$5,true,$6) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, catIds.get(cat.parent)]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }

  let pc = 0, vc = 0;
  for (const p of PRODUCTS) {
    const volumes = p.volumes ?? ["30 ml", "50 ml", "100 ml"];
    const desc = `${p.subtitle}. ${p.title} značky ${p.brand} — originální zboží od autorizovaného distributora. Skladem u nás v Praze, expedujeme do 24 hodin.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.subtitle, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: "Objem", values: volumes }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await client.query(
      `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [tenantId, pid, catIds.get(p.cat)]
    );
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) {
      await client.query(
        `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [tenantId, pid, catIds.get(parent)]
      );
    }

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, U(p.img[i]), `${p.title} — foto ${i + 1}`, i]
      );
    }

    const defaultIdx = volumes.length === 3 ? 1 : 0;
    for (let i = 0; i < volumes.length; i++) {
      const price = volumes.length === 3 ? [ml30(p.price), p.price, ml100(p.price)][i] : p.price;
      const compare = p.compare
        ? (volumes.length === 3 ? [ml30(p.compare), p.compare, ml100(p.compare)][i] : p.compare)
        : null;
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase().slice(0, 14)}-${i}`, volumes[i],
         JSON.stringify({ "Objem": volumes[i] }), price, compare, p.stock, i === defaultIdx, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-07 seed')`,
        [tenantId, vr.rows[0].id, p.stock, p.stock]
      );
    }
  }

  await client.query("COMMIT");
  console.log(`✅ ${TENANT_SLUG}: ${catIds.size} kategorií, ${pc} produktů, ${vc} variant`);
} catch (e) {
  await client.query("ROLLBACK");
  console.error("❌", e.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
