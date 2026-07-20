/**
 * Seed produktového katalogu pro eshop-12-v2 (PACKA — petcenter DNA, chovatelské potřeby).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Fiktivní značky (brand purge): Hafan, Micka, Mlsoun, Čenich, Chlupáč, Zobík, AquaVita, Tlapka Nature, PACKA.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-12-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-12-v2";

const U = (id, w = 900, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

// Všechna ID vizuálně ověřena kontaktními archy (sheet1–3)
const P = {
  kibbleBowl: "1589924691995-400dc9ecc119",
  treatsPink: "1568640347023-a616a30bc3bd",
  boneToy: "1535294435445-d7249524ef2e",
  pugCoat: "1530041539828-114de669390e",
  beagle: "1543466835-00a7907e9de1",
  corgi: "1537151625747-768eb6cf92b2",
  frenchieYellow: "1583337130417-3346a1be7dee",
  pugYellow: "1517849845537-4d257902454a",
  pugPink: "1591768575198-88dac53fbd0a",
  goldenFlower: "1552053831-71594a27632d",
  puppies: "1444212477490-ca407925329e",
  dogBeach: "1587300003388-59208cc962cb",
  dogCatGrass: "1450778869180-41d0601e046e",
  catGreen: "1574158622682-e40e69881006",
  catReach: "1592194996308-7b43878e84a6",
  catDark: "1478098711619-5ab0b478d6e6",
  gingerCat: "1573865526739-10659fec78a5",
  kittenToys: "1516750105099-4b8a83e217ee",
  catYawn: "1574144611937-0df059b5ef3e",
  hamster: "1425082661705-1834bfd09dca",
  hamsterWhite: "1584553421349-3557471bed79",
  guineas: "1548767797-d8c844163c4c",
  parrotGreen: "1552728089-57bdde30beb3",
  finchYellow: "1591198936750-16d8e15edb9e",
  kingfisher: "1444464666168-49d633b86797",
  cardinal: "1520808663317-647b476a81b9",
  macaw: "1452570053594-1b985d6ea890",
  goldfish: "1522069169874-c58ec4b76be5",
  clownfish: "1535591273668-578e31182c4f",
  tangYellow: "1571752726703-5e7d1f6a986d",
  plants: "1520302630591-fd1c66edc19d",
};

const CATEGORIES = [
  { slug: "novinky", name: "Novinky", sort: 0, desc: "Čerstvé přírůstky do nabídky — každý týden něco nového pro vaše mazlíčky.", img: P.puppies },
  { slug: "leto", name: "Léto 2026", sort: 1, desc: "Chladicí podložky, cestovní potřeby a letní hity pro horké dny.", img: P.frenchieYellow },
  { slug: "chladici-podlozky", name: "Chladicí podložky", sort: 0, parent: "leto", img: P.frenchieYellow },
  { slug: "cestovani", name: "Cestovní potřeby", sort: 1, parent: "leto", img: P.dogCatGrass },
  { slug: "bazeny", name: "Bazény pro psy", sort: 2, parent: "leto", img: P.dogBeach },
  { slug: "napajeni", name: "Voda a napáječky", sort: 3, parent: "leto", img: P.goldenFlower },
  { slug: "antiparazitika", name: "Antiparazitika", sort: 4, parent: "leto", img: P.beagle },
  { slug: "slunecni-ochrana", name: "Sluneční ochrana", sort: 5, parent: "leto", img: P.dogBeach },
  { slug: "letni-hracky", name: "Letní hračky", sort: 6, parent: "leto", img: P.boneToy },
  { slug: "letni-pamlsky", name: "Osvěžující pamlsky", sort: 7, parent: "leto", img: P.treatsPink },
  { slug: "psi", name: "Psi", sort: 2, desc: "Vše pro psy — krmivo, pamlsky, hračky, pelíšky i výbava na cesty.", img: P.beagle },
  { slug: "psi-granule", name: "Granule pro psy", sort: 0, parent: "psi", img: P.kibbleBowl },
  { slug: "psi-konzervy", name: "Konzervy a kapsičky", sort: 1, parent: "psi", img: P.kibbleBowl },
  { slug: "psi-pamlsky", name: "Pamlsky a kosti", sort: 2, parent: "psi", img: P.treatsPink },
  { slug: "psi-voditka", name: "Vodítka a obojky", sort: 3, parent: "psi", img: P.corgi },
  { slug: "psi-pelisky", name: "Pelíšky a pelechy", sort: 4, parent: "psi", img: P.beagle },
  { slug: "psi-boudy", name: "Boudy a přepravky", sort: 5, parent: "psi", img: P.pugPink },
  { slug: "psi-hracky", name: "Hračky", sort: 6, parent: "psi", img: P.boneToy },
  { slug: "psi-antiparazitika", name: "Antiparazitika", sort: 7, parent: "psi", img: P.dogBeach },
  { slug: "psi-kosmetika", name: "Kosmetika a hygiena", sort: 8, parent: "psi", img: P.pugCoat },
  { slug: "psi-doplnky", name: "Doplňky stravy", sort: 9, parent: "psi", img: P.goldenFlower },
  { slug: "kocky", name: "Kočky", sort: 3, desc: "Granule, kapsičky, škrabadla i kočkolit — vše pro spokojené kočky.", img: P.catGreen },
  { slug: "kocky-granule", name: "Granule pro kočky", sort: 0, parent: "kocky", img: P.catGreen },
  { slug: "kocky-kapsicky", name: "Kapsičky a konzervy", sort: 1, parent: "kocky", img: P.catReach },
  { slug: "kocky-pamlsky", name: "Pamlsky a tráva", sort: 2, parent: "kocky", img: P.gingerCat },
  { slug: "kocky-kockolit", name: "Kočkolit a steliva", sort: 3, parent: "kocky", img: P.catDark },
  { slug: "kocky-skrabadla", name: "Škrabadla a pelíšky", sort: 4, parent: "kocky", img: P.catYawn },
  { slug: "kocky-prepravky", name: "Přepravky", sort: 5, parent: "kocky", img: P.catReach },
  { slug: "kocky-hracky", name: "Hračky", sort: 6, parent: "kocky", img: P.kittenToys },
  { slug: "kocky-antiparazitika", name: "Antiparazitika", sort: 7, parent: "kocky", img: P.catGreen },
  { slug: "kocky-kosmetika", name: "Kosmetika a hygiena", sort: 8, parent: "kocky", img: P.catDark },
  { slug: "kocky-misky", name: "Misky a krmítka", sort: 9, parent: "kocky", img: P.kibbleBowl },
  { slug: "hlodavci", name: "Hlodavci", sort: 4, desc: "Krmivo, seno, klece a domečky pro morčata, křečky i králíky.", img: P.guineas },
  { slug: "hlodavci-krmivo", name: "Krmivo", sort: 0, parent: "hlodavci", img: P.guineas },
  { slug: "hlodavci-seno", name: "Seno a byliny", sort: 1, parent: "hlodavci", img: P.hamster },
  { slug: "hlodavci-pamlsky", name: "Pamlsky", sort: 2, parent: "hlodavci", img: P.guineas },
  { slug: "hlodavci-steliva", name: "Steliva a podestýlky", sort: 3, parent: "hlodavci", img: P.hamsterWhite },
  { slug: "hlodavci-klece", name: "Klece a přepravky", sort: 4, parent: "hlodavci", img: P.hamster },
  { slug: "hlodavci-domecky", name: "Domečky a hnízda", sort: 5, parent: "hlodavci", img: P.hamsterWhite },
  { slug: "hlodavci-napajecky", name: "Napáječky a misky", sort: 6, parent: "hlodavci", img: P.hamster },
  { slug: "hlodavci-hracky", name: "Hračky a kolotoče", sort: 7, parent: "hlodavci", img: P.hamsterWhite },
  { slug: "hlodavci-kosmetika", name: "Kosmetika", sort: 8, parent: "hlodavci", img: P.guineas },
  { slug: "ptaci", name: "Ptáci", sort: 5, desc: "Zob, klece, bidýlka a hračky pro papoušky i drobné exoty.", img: P.parrotGreen },
  { slug: "ptaci-krmivo", name: "Krmivo a zob", sort: 0, parent: "ptaci", img: P.parrotGreen },
  { slug: "ptaci-klece", name: "Klece a voliéry", sort: 1, parent: "ptaci", img: P.macaw },
  { slug: "ptaci-bidylka", name: "Bidýlka a hřady", sort: 2, parent: "ptaci", img: P.cardinal },
  { slug: "ptaci-napajecky", name: "Napáječky a krmítka", sort: 3, parent: "ptaci", img: P.finchYellow },
  { slug: "ptaci-hracky", name: "Hračky", sort: 4, parent: "ptaci", img: P.macaw },
  { slug: "ptaci-hnizda", name: "Hnízda a budky", sort: 5, parent: "ptaci", img: P.kingfisher },
  { slug: "ptaci-doplnky", name: "Doplňky", sort: 6, parent: "ptaci", img: P.finchYellow },
  { slug: "akva-tera", name: "Akva-Tera", sort: 6, desc: "Akvária, terária, filtrace a krmivo pro ryby i plazy.", img: P.clownfish },
  { slug: "akva-krmivo", name: "Krmivo pro ryby", sort: 0, parent: "akva-tera", img: P.goldfish },
  { slug: "akvaria", name: "Akvária a nádrže", sort: 1, parent: "akva-tera", img: P.clownfish },
  { slug: "filtrace", name: "Filtrace a technika", sort: 2, parent: "akva-tera", img: P.tangYellow },
  { slug: "osvetleni", name: "Osvětlení", sort: 3, parent: "akva-tera", img: P.tangYellow },
  { slug: "dekorace", name: "Dekorace a rostliny", sort: 4, parent: "akva-tera", img: P.plants },
  { slug: "teraria", name: "Terária", sort: 5, parent: "akva-tera", img: P.plants },
  { slug: "krmivo-plazi", name: "Krmivo pro plazy", sort: 6, parent: "akva-tera", img: P.goldfish },
  { slug: "udrzba-vody", name: "Údržba vody", sort: 7, parent: "akva-tera", img: P.clownfish },
  { slug: "akce", name: "Akce", sort: 90, desc: "Slevy a výhodná balení 2+1 — dokud zásoby stačí.", img: P.treatsPink },
];

// price v haléřích; `variants` = [{ t: label, price, compare? }] (balení s různou cenou)
const PRODUCTS = [
  // ── Psi ──
  { slug: "hafan-adult-kureci", title: "Hafan Adult kuřecí granule", subtitle: "Kompletní krmivo pro dospělé psy, 70 % kuřecího masa", cat: "psi-granule", brand: "Hafan", flags: { featured: true }, img: [P.kibbleBowl, P.beagle], optName: "Balení", variants: [{ t: "3 kg", price: 44900 }, { t: "10 kg", price: 119900 }], stock: 32 },
  { slug: "hafan-puppy-classic", title: "Hafan Puppy Classic", subtitle: "Granule pro štěňata všech plemen s DHA pro vývoj mozku", cat: "psi-granule", brand: "Hafan", flags: { new: true, featured: true }, img: [P.puppies], optName: "Balení", variants: [{ t: "3 kg", price: 49900 }, { t: "8 kg", price: 109900 }], stock: 21 },
  { slug: "mlsoun-treninkove-hovezi", title: "Mlsoun tréninkové kostičky hovězí", subtitle: "Měkké pamlsky na tréninky, 94 % masa, 200 g", cat: "psi-pamlsky", brand: "Mlsoun", flags: { featured: true }, img: [P.treatsPink], price: 12900, compare: 15900, stock: 64 },
  { slug: "cenich-aportovaci-kost", title: "Čenich aportovací kost Bounce", subtitle: "Odolná gumová hračka s nepravidelným odskokem", cat: "psi-hracky", brand: "Čenich", flags: { featured: true }, img: [P.boneToy], price: 19900, stock: 45 },
  { slug: "cenich-reflexni-voditko", title: "Čenich reflexní vodítko Runner", subtitle: "Polstrovaná rukojeť, reflexní prošití, délka 2 m", cat: "psi-voditka", brand: "Čenich", img: [P.corgi], price: 34900, compare: 42900, stock: 18 },
  { slug: "packa-pelisek-cloud", title: "PACKA pelíšek Cloud", subtitle: "Paměťová pěna a pratelný potah, velikost M/L", cat: "psi-pelisky", brand: "PACKA", flags: { new: true, featured: true }, img: [P.beagle], optName: "Velikost", variants: [{ t: "M — 70 cm", price: 89900 }, { t: "L — 90 cm", price: 119900 }], stock: 12 },
  { slug: "tlapka-antiparazitni-obojek", title: "Tlapka Nature antiparazitní obojek", subtitle: "Přírodní repelentní obojek, ochrana až 6 měsíců", cat: "psi-antiparazitika", brand: "Tlapka Nature", img: [P.dogBeach], price: 25900, stock: 38 },
  { slug: "packa-plastenka-pro-psy", title: "PACKA pláštěnka pro psy", subtitle: "Voděodolná pláštěnka s kapucí a reflexními prvky", cat: "psi-kosmetika", brand: "PACKA", img: [P.pugCoat], price: 39900, compare: 49900, stock: 15 },
  { slug: "cenich-prepravka-m", title: "Čenich přepravka Comfort M", subtitle: "Schválená pro leteckou přepravu, ventilace ze 4 stran", cat: "psi-boudy", brand: "Čenich", img: [P.pugPink], price: 69900, compare: 79900, stock: 9 },
  { slug: "packa-led-obojek", title: "PACKA LED obojek Night", subtitle: "USB nabíjení, 3 režimy svícení, viditelnost 400 m", cat: "psi-voditka", brand: "PACKA", flags: { new: true }, img: [P.pugYellow], price: 24900, stock: 27 },
  // ── Kočky ──
  { slug: "micka-granule-losos", title: "Micka granule s lososem", subtitle: "Superprémiové krmivo pro dospělé kočky, bez obilovin", cat: "kocky-granule", brand: "Micka", flags: { featured: true }, img: [P.catGreen], optName: "Balení", variants: [{ t: "2 kg", price: 39900 }, { t: "7 kg", price: 99900 }], stock: 28 },
  { slug: "micka-kapsicky-mix", title: "Micka kapsičky masový mix 12×85 g", subtitle: "Kuře, hovězí, krůta a losos ve šťávě", cat: "kocky-kapsicky", brand: "Micka", flags: { featured: true }, img: [P.catReach], price: 18900, compare: 22900, stock: 52 },
  { slug: "mlsoun-malt-pasta", title: "Mlsoun Malt pasta pro kočky", subtitle: "Podporuje vylučování chlupových bezoárů, 100 g", cat: "kocky-pamlsky", brand: "Mlsoun", flags: { new: true, featured: true }, img: [P.gingerCat], price: 14900, stock: 71 },
  { slug: "packa-kockolit-bentonit", title: "PACKA kočkolit bentonitový 10 l", subtitle: "Hrudkující, 99% bezprašnost, svěží vůně", cat: "kocky-kockolit", brand: "PACKA", flags: { featured: true }, img: [P.catDark], price: 21900, stock: 44 },
  { slug: "cenich-skrabadlo-vez", title: "Čenich škrabadlo Věž 120 cm", subtitle: "Sisalové sloupky, 2 pelíšky a závěsná hračka", cat: "kocky-skrabadla", brand: "Čenich", img: [P.catYawn], price: 129900, compare: 159900, stock: 7 },
  { slug: "micka-hracka-pirka", title: "Micka hračka s pírky Flutter", subtitle: "Interaktivní tyčka s vyměnitelnými pírky", cat: "kocky-hracky", brand: "Micka", flags: { new: true }, img: [P.kittenToys], price: 9900, stock: 83 },
  // ── Hlodavci ──
  { slug: "chlupac-krmivo-morcata", title: "Chlupáč krmná směs pro morčata", subtitle: "S vitamínem C a sušenou zeleninou, 1,5 kg", cat: "hlodavci-krmivo", brand: "Chlupáč", flags: { featured: true }, img: [P.guineas], price: 15900, stock: 36 },
  { slug: "chlupac-horske-seno", title: "Chlupáč horské seno 1 kg", subtitle: "Ručně obracené luční seno z podhůří", cat: "hlodavci-seno", brand: "Chlupáč", img: [P.hamster], price: 9900, stock: 58 },
  { slug: "chlupac-domecek-liska", title: "Chlupáč domeček z lísky", subtitle: "Ručně vázaný úkryt z lískových proutků", cat: "hlodavci-domecky", brand: "Chlupáč", flags: { new: true }, img: [P.hamsterWhite], price: 24900, stock: 14 },
  { slug: "mlsoun-hlodavci-mix", title: "Mlsoun pamlsky pro hlodavce", subtitle: "Mix sušeného ovoce a zeleniny bez cukru, 150 g", cat: "hlodavci-pamlsky", brand: "Mlsoun", img: [P.guineas], price: 10900, compare: 13900, stock: 47 },
  // ── Ptáci ──
  { slug: "zobik-zob-andulky", title: "Zobík zob pro andulky 1 kg", subtitle: "Vyvážená směs semen s minerály", cat: "ptaci-krmivo", brand: "Zobík", flags: { featured: true }, img: [P.parrotGreen], price: 11900, stock: 41 },
  { slug: "zobik-prosove-klasy", title: "Zobík prosové klasy 10 ks", subtitle: "Přírodní pamlsek pro drobné exoty", cat: "ptaci-krmivo", brand: "Zobík", img: [P.finchYellow], price: 8900, compare: 10900, stock: 66 },
  { slug: "zobik-bidylka-set", title: "Zobík bidýlka přírodní set", subtitle: "3 bidýlka z nelakovaného dřeva různých průměrů", cat: "ptaci-bidylka", brand: "Zobík", img: [P.cardinal], price: 13900, stock: 29 },
  { slug: "zobik-venkovni-krmitko", title: "Zobík venkovní krmítko Villa", subtitle: "Krmítko z borovice se zásobníkem na 2 kg zobu", cat: "ptaci-doplnky", brand: "Zobík", flags: { new: true }, img: [P.kingfisher], price: 29900, stock: 16 },
  // ── Akva-Tera ──
  { slug: "aquavita-vlockove-krmivo", title: "AquaVita vločkové krmivo 250 ml", subtitle: "Základní krmivo pro všechny akvarijní ryby", cat: "akva-krmivo", brand: "AquaVita", flags: { featured: true }, img: [P.goldfish], price: 12900, stock: 55 },
  { slug: "aquavita-akvarium-start", title: "AquaVita akvárium Start 54 l", subtitle: "Kompletní set s filtrem, osvětlením a topítkem", cat: "akvaria", brand: "AquaVita", img: [P.clownfish], price: 189900, compare: 219900, stock: 6 },
  { slug: "aquavita-filtr-eco", title: "AquaVita filtr ECO 300", subtitle: "Tichý vnitřní filtr pro akvária do 100 l", cat: "filtrace", brand: "AquaVita", img: [P.tangYellow], price: 79900, stock: 13 },
  { slug: "aquavita-rostliny-set", title: "AquaVita dekorační rostliny set", subtitle: "5 nenáročných živých rostlin pro začátečníky", cat: "dekorace", brand: "AquaVita", flags: { new: true }, img: [P.plants], price: 24900, stock: 22 },
  // ── Léto ──
  { slug: "packa-chladici-podlozka-l", title: "PACKA chladicí podložka L", subtitle: "Gelová samochladicí podložka 90×60 cm", cat: "chladici-podlozky", brand: "PACKA", flags: { featured: true }, img: [P.frenchieYellow], price: 44900, compare: 54900, stock: 25 },
  { slug: "packa-cestovni-miska", title: "PACKA cestovní skládací miska", subtitle: "Silikonová miska s karabinou, 500 ml", cat: "cestovani", brand: "PACKA", img: [P.dogCatGrass], price: 14900, stock: 49 },
  { slug: "tlapka-cestovni-napajecka", title: "Tlapka Nature cestovní napáječka", subtitle: "Láhev s výklopnou miskou, 550 ml", cat: "napajeni", brand: "Tlapka Nature", flags: { new: true }, img: [P.goldenFlower], price: 19900, stock: 33 },
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
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, image_url)
       VALUES ($1,$2,$3,$4,$5,true,$6) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, cat.img ? U(cat.img, 200, 200) : null]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }
  for (const cat of CATEGORIES.filter(x => x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, parent_id, image_url)
       VALUES ($1,$2,$3,$4,$5,true,$6,$7) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, catIds.get(cat.parent), cat.img ? U(cat.img, 200, 200) : null]
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
    const variants = p.variants ?? [{ t: "Standard", price: p.price, compare: p.compare }];
    const optName = p.optName ?? "Provedení";
    const hasCompare = p.compare != null || variants.some(v => v.compare != null);
    const desc = `${p.subtitle}. ${p.title} od značky ${p.brand} — pečlivý výběr PACKA pro spokojené mazlíčky. Skladem na prodejnách i e-shopu, doprava zdarma nad 1 299 Kč a vrácení do 30 dní.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.subtitle, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: optName, values: variants.map(v => v.t) }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (hasCompare) await link(pid, "akce");
    if (p.flags?.new) await link(pid, "novinky");

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, U(p.img[i]), `${p.title} — foto ${i + 1}`, i]
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase().slice(0, 24)}-${i}`, v.t,
         JSON.stringify({ [optName]: v.t }), v.price, v.compare ?? p.compare ?? null, p.stock, i === 0, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-12 seed')`,
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
