/**
 * Seed produktového katalogu pro eshop-15-v2 (Apatyka — online lékárna, pilulka DNA).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Demo data: vlastní značky (Vitala, NutraVia, Dermia, Apolen, SportFuel, Čistota+, BabyVia),
 * ceny demo, subtitle = balení • jednotková cena. Kategorie sladěné s navbar mega menu.
 * flags: { featured } = Vybrali jsme pro vás, { pro: cents } = cena s Apatyka PRO, { cashback } = badge.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-15-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-15-v2";

const U = (id, w = 800, h = 800) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=75`;

const CATEGORIES = [
  { slug: "dle-cile", name: "Dle cíle", sort: 90, desc: "Vyberte podle toho, co chcete zlepšit." },
  { slug: "akce-a-slevy", name: "Akce a slevy", sort: 91, desc: "Zvýhodněné ceny — jen dokud jsou skladem." },

  { slug: "doplnky-stravy", name: "Doplňky stravy", sort: 1, desc: "Vitamíny, minerály a doplňky s NutraRatingem." },
  { slug: "vitaminy-mineraly", name: "Vitamíny, minerály a elektrolyty", sort: 0, parent: "doplnky-stravy" },
  { slug: "imunita", name: "Imunita a obranyschopnost", sort: 1, parent: "doplnky-stravy" },
  { slug: "spanek-stres", name: "Spánek, stres a podpora nálady", sort: 2, parent: "doplnky-stravy" },
  { slug: "kosti-a-klouby", name: "Kosti a klouby", sort: 3, parent: "doplnky-stravy" },
  { slug: "plet-vlasy", name: "Pleť, vlasy a anti-aging", sort: 4, parent: "doplnky-stravy" },
  { slug: "zazivani", name: "Zažívání a zdravá střeva", sort: 5, parent: "doplnky-stravy" },

  { slug: "zdravi-a-leky", name: "Zdraví a léky", sort: 2, desc: "Léky bez předpisu a zdravotnické potřeby." },
  { slug: "leky-bez-predpisu", name: "Léky bez předpisu", sort: 0, parent: "zdravi-a-leky" },
  { slug: "zdravotnicke-potreby", name: "Zdravotnické potřeby", sort: 1, parent: "zdravi-a-leky" },
  { slug: "oci-a-zrak", name: "Oči a zrak", sort: 2, parent: "zdravi-a-leky" },
  { slug: "ustni-hygiena", name: "Ústní hygiena", sort: 3, parent: "zdravi-a-leky" },

  { slug: "kosmetika", name: "Kosmetika", sort: 3, desc: "Dermokosmetika a péče doporučená lékárníky." },
  { slug: "dermokosmetika", name: "Dermokosmetika", sort: 0, parent: "kosmetika" },
  { slug: "opalovani", name: "Opalování", sort: 1, parent: "kosmetika" },
  { slug: "vlasova-pece", name: "Vlasová péče", sort: 2, parent: "kosmetika" },
  { slug: "pece-o-telo", name: "Péče o tělo", sort: 3, parent: "kosmetika" },

  { slug: "sport", name: "Sport", sort: 4, desc: "Sportovní výživa a regenerace." },
  { slug: "sportovni-vyziva", name: "Sportovní výživa", sort: 0, parent: "sport" },
  { slug: "hydratace", name: "Hydratace", sort: 1, parent: "sport" },

  { slug: "elektronika", name: "Elektronika", sort: 5, desc: "Zdravotní přístroje a chytrá zařízení." },
  { slug: "zdravotni-pristroje", name: "Zdravotní přístroje", sort: 0, parent: "elektronika" },
  { slug: "chytra-zarizeni", name: "Chytrá zařízení", sort: 1, parent: "elektronika" },

  { slug: "drogerie", name: "Drogerie", sort: 6, desc: "Praní, úklid a hygiena pro celou domácnost." },
  { slug: "prani", name: "Praní", sort: 0, parent: "drogerie" },
  { slug: "papirove-zbozi", name: "Papírové zboží", sort: 1, parent: "drogerie" },
  { slug: "hygiena", name: "Hygiena", sort: 2, parent: "drogerie" },

  { slug: "mama-a-dite", name: "Máma a dítě", sort: 7, desc: "Výživa, plenky a péče pro nejmenší." },

  { slug: "vitala", name: "Vitala", sort: 8, desc: "Privátní značka Apatyky — čisté složení, vyrobeno v Česku." },
];

// price v haléřích; sub = balení • jednotková cena; pro = cena s Apatyka PRO (haléře)
const PRODUCTS = [
  // ── Doplňky stravy ──
  { slug: "horcik-bisglycinat-b6-180", title: "Hořčík Bisglycinát + B6, 180 kapslí", sub: "180 kapslí • 3,05 Kč/kapsle", cat: "spanek-stres", brand: "Vitala", price: 54900, pro: 43900, stock: 64, flags: { featured: true, rating: "A+" }, img: U("photo-1471864190281-a93a3070b6de") },
  { slug: "vitamin-d3-2000-90", title: "Vitamin D3 2000 IU, 90 tobolek", sub: "90 tobolek • 2,88 Kč/tobolka", cat: "imunita", brand: "Vitala", price: 25900, stock: 88, flags: { featured: true, rating: "A" }, img: U("photo-1584308666744-24d5c474f2ae") },
  { slug: "vitamin-c-liposomalni-500", title: "Liposomální vitamin C 500 mg, 60 kapslí", sub: "60 kapslí • 5,82 Kč/kapsle", cat: "imunita", brand: "NutraVia", price: 34900, compare: 42900, stock: 46, flags: { featured: true, rating: "A" }, img: U("photo-1587854692152-cbe660dbde88") },
  { slug: "kolagen-peptidy-300g", title: "Kolagen peptidy s vitaminem C, 300 g", sub: "300 g • 2,00 Kč/g", cat: "plet-vlasy", brand: "Vitala", price: 59900, pro: 47900, stock: 38, flags: { featured: true, rating: "A+" }, img: U("photo-1607619056574-7b8d3ee536b2") },
  { slug: "melatonin-sprej-30ml", title: "Melatonin sprej s levandulí, 30 ml", sub: "30 ml • 7,30 Kč/ml", cat: "spanek-stres", brand: "NutraVia", price: 21900, stock: 52, flags: { rating: "B" }, img: U("photo-1631549916768-4119b2e5f926") },
  { slug: "probiotika-komplex-30", title: "Probiotika komplex 20 mld. CFU, 30 kapslí", sub: "30 kapslí • 12,97 Kč/kapsle", cat: "zazivani", brand: "NutraVia", price: 38900, compare: 46900, stock: 44, flags: { featured: true, rating: "A" }, img: U("photo-1550572017-edd951b55104") },
  { slug: "glukosamin-chondroitin-90", title: "Glukosamin + chondroitin FORTE, 90 tablet", sub: "90 tablet • 4,88 Kč/tableta", cat: "kosti-a-klouby", brand: "Vitala", price: 43900, stock: 30, flags: { rating: "A" }, img: U("photo-1626716493137-b67fe9501e76") },
  { slug: "omega3-rybi-olej-120", title: "Omega-3 rybí olej 1000 mg, 120 tobolek", sub: "120 tobolek • 2,74 Kč/tobolka", cat: "vitaminy-mineraly", brand: "Vitala", price: 32900, pro: 26900, stock: 58, flags: { rating: "A+" }, img: U("photo-1587854692152-cbe660dbde88") },
  { slug: "b-komplex-forte-100", title: "B-komplex FORTE, 100 tablet", sub: "100 tablet • 2,29 Kč/tableta", cat: "vitaminy-mineraly", brand: "Vitala", price: 22900, compare: 27900, stock: 66, flags: { rating: "A" }, img: U("photo-1628771065518-0d82f1938462") },
  // ── Zdraví a léky ──
  { slug: "apolen-500-24", title: "Apolen 500 mg, 24 tablet", sub: "24 tablet • 2,87 Kč/tableta", cat: "leky-bez-predpisu", brand: "Apolen", price: 6900, stock: 140, flags: { featured: true, cashback: true }, img: U("photo-1584017911766-d451b3d0e843") },
  { slug: "ibunex-rapid-400-30", title: "Ibunex Rapid 400 mg, 30 měkkých tobolek", sub: "30 tobolek • 4,30 Kč/tobolka", cat: "leky-bez-predpisu", brand: "Apolen", price: 12900, stock: 96, flags: { featured: true }, img: U("photo-1550572017-4fcdbb59cc32") },
  { slug: "nosni-sprej-morska-voda", title: "Nosní sprej s mořskou vodou, 120 ml", sub: "120 ml • 1,33 Kč/ml", cat: "leky-bez-predpisu", brand: "Apolen", price: 15900, stock: 74, img: U("photo-1585435557343-3b092031a831") },
  { slug: "teplomer-bezkontaktni", title: "Bezkontaktní infračervený teploměr", sub: "1 ks • měření za 1 s", cat: "zdravotni-pristroje", brand: "MediTech", price: 79900, compare: 99900, stock: 22, img: U("photo-1576091160550-2173dba999ef") },
  { slug: "tlakomer-pazni-smart", title: "Pažní tlakoměr s Bluetooth", sub: "1 ks • paměť 2× 120 měření", cat: "zdravotni-pristroje", brand: "MediTech", price: 129900, pro: 109900, stock: 18, flags: { featured: true }, img: U("photo-1615486511484-92e172cc4fe0") },
  { slug: "ocni-kapky-hydratacni", title: "Hydratační oční kapky s HA, 10 ml", sub: "10 ml • 19,90 Kč/ml", cat: "oci-a-zrak", brand: "Dermia", price: 19900, stock: 58, img: U("photo-1512069772995-ec65ed45afd6") },
  { slug: "zubni-pasta-whitening", title: "Bělicí zubní pasta s fluoridem, 75 ml", sub: "75 ml • 1,59 Kč/ml", cat: "ustni-hygiena", brand: "Dermia", price: 11900, stock: 102, flags: { cashback: true }, img: U("photo-1607613009820-a29f7bb81c04") },
  // ── Kosmetika ──
  { slug: "spf50-opalovaci-mleko", title: "Opalovací mléko SPF 50+, 200 ml", sub: "200 ml • 2,25 Kč/ml", cat: "opalovani", brand: "Dermia", price: 44900, compare: 54900, stock: 40, flags: { featured: true }, img: U("photo-1526947425960-945c6e72858f") },
  { slug: "hyaluronove-serum-30ml", title: "Hyaluronové sérum 2 %, 30 ml", sub: "30 ml • 18,30 Kč/ml", cat: "dermokosmetika", brand: "Dermia", price: 54900, pro: 43900, stock: 34, flags: { featured: true }, img: U("photo-1620916566398-39f1143ab7be") },
  { slug: "atopicky-krem-100ml", title: "Krém pro atopickou pokožku, 100 ml", sub: "100 ml • 3,29 Kč/ml", cat: "dermokosmetika", brand: "Dermia", price: 32900, stock: 48, img: U("photo-1608248543803-ba4f8c70ae0b") },
  { slug: "kofeinovy-sampon-250ml", title: "Kofeinový šampon proti padání vlasů, 250 ml", sub: "250 ml • 1,00 Kč/ml", cat: "vlasova-pece", brand: "Dermia", price: 24900, stock: 62, img: U("photo-1522335789203-aabd1fc54bc9") },
  { slug: "micelarni-voda-400ml", title: "Micelární voda pro citlivou pleť, 400 ml", sub: "400 ml • 0,62 Kč/ml", cat: "dermokosmetika", brand: "Dermia", price: 24900, stock: 56, img: U("photo-1556228720-195a672e8a03") },
  { slug: "spf50-detsky-sprej", title: "Dětský opalovací sprej SPF 50+, 150 ml", sub: "150 ml • 2,53 Kč/ml", cat: "opalovani", brand: "Dermia", price: 37900, compare: 44900, stock: 32, flags: { cashback: true }, img: U("photo-1571781926291-c477ebfd024b") },
  { slug: "po-opalovani-panthenol", title: "Panthenol pěna po opalování 10 %, 150 ml", sub: "150 ml • 1,66 Kč/ml", cat: "opalovani", brand: "Dermia", price: 24900, stock: 44, img: U("photo-1616740540792-3daec604777d") },
  { slug: "telove-mleko-hydratacni", title: "Hydratační tělové mléko s ureou, 400 ml", sub: "400 ml • 0,55 Kč/ml", cat: "pece-o-telo", brand: "Dermia", price: 21900, stock: 68, img: U("photo-1594381898411-846e7d193883") },
  // ── Sport ──
  { slug: "syrovatokovy-protein-1kg", title: "Syrovátkový protein vanilka, 1 kg", sub: "1 kg • 0,65 Kč/g", cat: "sportovni-vyziva", brand: "SportFuel", price: 64900, compare: 79900, stock: 28, img: U("photo-1593095948071-474c5cc2989d") },
  { slug: "elektrolyty-sumive-20", title: "Elektrolyty šumivé tablety citron, 20 ks", sub: "20 tablet • 9,45 Kč/tableta", cat: "hydratace", brand: "SportFuel", price: 18900, stock: 76, flags: { featured: true, rating: "A" }, img: U("photo-1622480916113-9000ac49b79d") },
  { slug: "kreatin-monohydrat-500g", title: "Kreatin monohydrát, 500 g", sub: "500 g • 0,80 Kč/g", cat: "sportovni-vyziva", brand: "SportFuel", price: 39900, stock: 42, img: U("photo-1595348020949-87cdfbb44174") },
  { slug: "iontovy-napoj-koncentrat-1l", title: "Iontový nápoj koncentrát citron, 1 l", sub: "1 l • na 20 l nápoje", cat: "hydratace", brand: "SportFuel", price: 22900, compare: 27900, stock: 54, img: U("photo-1600172454520-134a542a2255") },
  { slug: "hydratacni-tablety-mix-40", title: "Hydratační tablety mix příchutí, 40 ks", sub: "40 tablet • 6,23 Kč/tableta", cat: "hydratace", brand: "SportFuel", price: 24900, stock: 60, flags: { rating: "A" }, img: U("photo-1631729371254-42c2892f0e6e") },
  { slug: "proteinove-tycinky-12ks", title: "Proteinové tyčinky čokoláda, 12× 60 g", sub: "720 g • 24,08 Kč/ks", cat: "sportovni-vyziva", brand: "SportFuel", price: 28900, pro: 23900, stock: 48, img: U("photo-1517836357463-d25dfeac3438") },
  // ── Elektronika ──
  { slug: "chytre-hodinky-fit", title: "Chytré hodinky s měřením tepu a SpO₂", sub: "1 ks • výdrž 14 dní", cat: "chytra-zarizeni", brand: "MediTech", price: 189900, compare: 229900, stock: 15, img: U("photo-1523275335684-37898b6baf30") },
  // ── Drogerie ──
  { slug: "praci-gel-sensitive-3l", title: "Prací gel Sensitive, 60 dávek", sub: "3 l • 4,65 Kč/dávka", cat: "prani", brand: "Čistota+", price: 27900, compare: 34900, stock: 50, flags: { cashback: true }, img: U("photo-1610557892470-55d9e80c0bce") },
  { slug: "toaletni-papir-3v-8", title: "Toaletní papír 3vrstvý, 8 rolí", sub: "8 rolí • 16,13 Kč/role", cat: "papirove-zbozi", brand: "Čistota+", price: 12900, stock: 84, img: U("photo-1584556812952-905ffd0c611a") },
  { slug: "dezinfekcni-gel-500ml", title: "Dezinfekční gel na ruce, 500 ml", sub: "500 ml • 0,32 Kč/ml", cat: "hygiena", brand: "Čistota+", price: 15900, stock: 92, img: U("photo-1584483766114-2cea6facdf57") },
  // ── Máma a dítě ──
  { slug: "plenky-vel4-82ks", title: "Dětské plenky vel. 4 (9–14 kg), 82 ks", sub: "82 ks • 6,70 Kč/ks", cat: "mama-a-dite", brand: "BabyVia", price: 54900, stock: 36, img: U("photo-1515488042361-ee00e0ddd4e4") },
  { slug: "kojenecke-mleko-2-800g", title: "Pokračovací kojenecké mléko 2, 800 g", sub: "800 g • 0,94 Kč/g", cat: "mama-a-dite", brand: "BabyVia", price: 74900, stock: 26, img: U("photo-1590080876351-941da357bde6") },
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
       VALUES ($1,$2,$3,$4,$5,true) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort]
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

  const link = async (pid, slug) => {
    if (!catIds.has(slug)) return;
    await client.query(
      `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [tenantId, pid, catIds.get(slug)]
    );
  };

  let pc = 0, vc = 0;
  for (const p of PRODUCTS) {
    const desc = `${p.title} (${p.sub}). Sortiment online lékárny Apatyka — ověřená kvalita s NutraRatingem, doprava zdarma s Apatyka PRO a doručení už zítra od 07:00.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.sub, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: "Balení", values: ["Standard"] }]), JSON.stringify(p.flags ? { ...p.flags, ...(p.pro ? { pro: p.pro } : {}) } : (p.pro ? { pro: p.pro } : {}))]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (p.compare) await link(pid, "akce-a-slevy");
    if (p.brand === "Vitala") await link(pid, "vitala");

    await client.query(
      `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,0)`,
      [tenantId, pid, p.img, p.title]
    );

    const vr = await client.query(
      `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
       VALUES ($1,$2,$3,'Standard',$4,$5,$6,$7,true,0) RETURNING id`,
      [tenantId, pid, `${p.slug.toUpperCase()}-0`, JSON.stringify({ "Balení": "Standard" }), p.price, p.compare ?? null, p.stock]
    );
    vc++;
    await client.query(
      `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
       VALUES ($1,$2,$3,$4,'import','eshop-15 seed')`,
      [tenantId, vr.rows[0].id, p.stock, p.stock]
    );
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
