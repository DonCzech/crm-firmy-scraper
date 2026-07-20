/**
 * Seed produktového katalogu pro eshop-10-v2 (BOTIQ — footshop DNA, tenisky a streetwear).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-10-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-10-v2";

const U = (id, w = 900, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const P = {
  nikeRed: "1542291026-7eec264c27ff",
  nikeWhiteAir: "1549298916-b41d501d3772",
  nikeBlack: "1600269452121-4f2416e55c28",
  nikeYellow: "1562183241-b937e95585b6",
  nikeColor: "1460353581641-37baddab0fa2",
  nikeBlazer: "1543508282-6319a3e2621f",
  nikeCortez: "1514989940723-e8e51635b782",
  nikeSwoosh: "1551107696-a4b0c5a0d9a2",
  jordanMid: "1608667508764-33cf0726b13a",
  jordanRed: "1491553895911-0055eca6402d",
  jordanShelf: "1603808033192-082d6919d3e1",
  jordanBlack: "1608256246200-53e635b5b65f",
  adidasWhite: "1605348532760-6753d2c43329",
  whitePair: "1595950653106-6c9ebd614d3a",
  whiteMinimal: "1620138546344-7b2c38516edf",
  walking: "1552346154-21d32810aba3",
  onFeet: "1600185365926-3a2ce3cdb9eb",
  nbBrown: "1608231387042-66d1773070a5",
  asicsBlue: "1606107557195-0e29a4b5b4aa",
  pumaYellow: "1560769629-975ec94e6a86",
  redShot: "1560343090-f0409e92791a",
  converse: "1595341888016-a392ef81b7de",
  vansSkate: "1579338559194-a162d19bf842",
  trail: "1533681904393-9ab6eee7e408",
  track: "1539185441755-769473a23570",
  bootsBrown: "1494496195158-c3becb4f2475",
  bootsHike: "1520639888713-7851133b1ed0",
  sole: "1525966222134-fcfa99b8ae77",
  shoesLife: "1465453869711-7e174808ace9",
  sneakDark: "1512374382149-233c42b6a83b",
  hoodieBack: "1556821840-3a63f95609a7",
  hoodieStreet: "1523398002811-999ca8dec234",
  teeWhite: "1521572163474-6864f9cf17ab",
  teeHang: "1503341455253-b2e723bb3dbb",
  jacket: "1591047139829-d91aecb6caea",
  backpack: "1553062407-98eeb64c6a62",
  cap: "1588850561407-ed78c282e89b",
  beanie: "1575428652377-a2d80e2277fc",
  socks: "1586350977771-b3b0abd50c82",
  skateboard: "1517438476312-10d79c077509",
  street: "1519415943484-9fa1873496d4",
  birk: "1603487742131-4160ec999306",
  platformSandal: "1562273138-f46be4ebdf33",
  aj1Royal: "1603787081207-362bcef7c144",
  adidasNmd: "1518002171953-a080ee817e1f",
  whiteCourt: "1587563871167-1ee9c731aefb",
  ankleBoots: "1531310197839-ccf54634509e",
  courtStones: "1603808033176-9d134e6f2c74",
  prophere: "1520256862855-398228c41684",
  chuckCream: "1556048219-bb6978360b84",
  rainCare: "1465479423260-c4afc24172c6",
};

const CATEGORIES = [
  { slug: "novinky", name: "Novinky", sort: 0, desc: "Čerstvé dropy — každý týden nové modely, které nesmíš minout.", img: P.aj1Royal },
  { slug: "boty", name: "Boty", sort: 1, desc: "Tenisky, běžecká obuv, boots i pantofle — kurátorovaný výběr BOTIQ.", img: P.nikeBlack },
  { slug: "tenisky", name: "Tenisky", sort: 0, parent: "boty", img: P.nikeBlack },
  { slug: "bezecka-obuv", name: "Běžecká obuv", sort: 1, parent: "boty", img: P.nikeRed },
  { slug: "boots", name: "Boots & outdoor", sort: 2, parent: "boty", img: P.bootsHike },
  { slug: "sandaly-pantofle", name: "Sandály a pantofle", sort: 3, parent: "boty", img: P.birk },
  { slug: "skate-obuv", name: "Skate obuv", sort: 4, parent: "boty", img: P.sole },
  { slug: "retro-klasiky", name: "Retro klasiky", sort: 5, parent: "boty", img: P.nikeCortez },
  { slug: "obleceni", name: "Oblečení", sort: 2, desc: "Streetwear od hlavy k patě — mikiny, trička, bundy.", img: P.hoodieBack },
  { slug: "mikiny", name: "Mikiny", sort: 0, parent: "obleceni", img: P.hoodieBack },
  { slug: "tricka", name: "Trička", sort: 1, parent: "obleceni", img: P.teeWhite },
  { slug: "bundy", name: "Bundy", sort: 2, parent: "obleceni", img: P.jacket },
  { slug: "doplnky", name: "Doplňky", sort: 3, desc: "Batohy, kšiltovky, ponožky a péče o boty.", img: P.backpack },
  { slug: "batohy", name: "Batohy a tašky", sort: 0, parent: "doplnky", img: P.backpack },
  { slug: "ksiltovky", name: "Kšiltovky", sort: 1, parent: "doplnky", img: P.cap },
  { slug: "ponozky", name: "Ponožky", sort: 2, parent: "doplnky", img: P.socks },
  { slug: "skate", name: "Skate", sort: 3, parent: "doplnky", img: P.skateboard },
  { slug: "pece-o-boty", name: "Péče o boty", sort: 4, parent: "doplnky", img: P.rainCare },
  { slug: "znacky", name: "Značky", sort: 4, desc: "Nike, adidas Originals, New Balance, Jordan, Converse, Salomon a další.", img: P.whiteMinimal },
  { slug: "nike", name: "Nike", sort: 0, parent: "znacky", img: P.whiteMinimal },
  { slug: "adidas", name: "adidas Originals", sort: 1, parent: "znacky", img: P.adidasNmd },
  { slug: "new-balance", name: "New Balance", sort: 2, parent: "znacky", img: P.shoesLife },
  { slug: "jordan", name: "Jordan", sort: 3, parent: "znacky", img: P.aj1Royal },
  { slug: "converse", name: "Converse", sort: 4, parent: "znacky", img: P.chuckCream },
  { slug: "salomon", name: "Salomon", sort: 5, parent: "znacky", img: P.converse },
  { slug: "vyprodej", name: "Výprodej", sort: 90, desc: "Slevy až 60 % na vybrané modely. Jen dokud je skladem tvoje velikost.", img: P.nikeCortez },
  { slug: "muzi", name: "Muži", sort: 91, img: P.teeWhite },
  { slug: "zeny", name: "Ženy", sort: 92, img: P.platformSandal },
  { slug: "deti", name: "Děti", sort: 93, img: P.chuckCream },
];

const SHOE_SIZES = ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"];
const SHOE_SIZES_W = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40"];
const APPAREL = ["S", "M", "L", "XL"];

// price v haléřích; boty mají varianty velikostí (stejná cena napříč velikostmi)
const PRODUCTS = [
  // ── Tenisky / lifestyle ──
  { slug: "nike-air-force-1-07-white", title: "Nike Air Force 1 '07 White", subtitle: "Ikona z roku 1982 — celokožený svršek, Air tlumení", cat: "tenisky", brand: "nike", genders: ["muzi", "zeny"], price: 289900, stock: 24, flags: { featured: true }, img: [P.nikeBlack, P.sneakDark], sizes: SHOE_SIZES },
  { slug: "nike-af1-luxe-pecan", title: "Nike Air Force 1 Luxe Pecan", subtitle: "Prémiová tumbled kůže v ořechovém tónu", cat: "tenisky", brand: "nike", genders: ["muzi"], price: 359900, stock: 9, flags: { new: true }, img: [P.nikeWhiteAir], sizes: SHOE_SIZES },
  { slug: "nike-af1-lv8-utility", title: "Nike Air Force 1 LV8 Utility Black", subtitle: "Techový AF1 s utility popruhem a Swooshem navíc", cat: "tenisky", brand: "nike", genders: ["muzi"], price: 319900, compare: 349900, stock: 11, img: [P.nikeBlazer], sizes: SHOE_SIZES },
  { slug: "nike-air-max-sc", title: "Nike Air Max SC White/Orange", subtitle: "Lehký everyday model s viditelným Air oknem", cat: "tenisky", brand: "nike", genders: ["muzi", "zeny"], price: 219900, compare: 329900, stock: 19, img: [P.onFeet], sizes: SHOE_SIZES },
  { slug: "nike-af1-react", title: "Nike Air Force 1 React White", subtitle: "Klasická silueta s React pěnou navíc", cat: "tenisky", brand: "nike", genders: ["muzi"], price: 299900, compare: 339900, stock: 8, img: [P.vansSkate], sizes: SHOE_SIZES },
  { slug: "nike-af1-shadow-pastel", title: "Nike AF1 Shadow Pastel W", subtitle: "Dvojité panely v pastelových tónech", cat: "tenisky", brand: "nike", genders: ["zeny"], price: 309900, stock: 13, flags: { featured: true, new: true }, img: [P.whitePair], sizes: SHOE_SIZES_W },
  { slug: "nike-kyrie-flytrap", title: "Nike Kyrie Flytrap Black", subtitle: "Basketbalová přilnavost do ulice i na palubovku", cat: "tenisky", brand: "nike", genders: ["muzi"], price: 249900, compare: 449900, stock: 10, img: [P.adidasWhite], sizes: SHOE_SIZES },
  { slug: "adidas-nmd-r1-grey", title: "adidas NMD_R1 Grey Two", subtitle: "BOOST tlumení a soft-knit svršek", cat: "tenisky", brand: "adidas", genders: ["muzi", "zeny"], price: 329900, stock: 15, flags: { featured: true }, img: [P.adidasNmd], sizes: SHOE_SIZES },
  { slug: "adidas-prophere-teal", title: "adidas Originals Prophere Teal", subtitle: "Chunky silueta z archivu, výrazná podešev", cat: "tenisky", brand: "adidas", genders: ["muzi"], price: 279900, compare: 459900, stock: 7, img: [P.prophere], sizes: SHOE_SIZES },
  { slug: "new-balance-574-core", title: "New Balance 574 Core White", subtitle: "ENCAP tlumení, semiš + mesh — ikona pohody", cat: "tenisky", brand: "new-balance", genders: ["muzi", "zeny"], price: 269900, stock: 18, flags: { featured: true }, img: [P.shoesLife], sizes: SHOE_SIZES },
  { slug: "new-balance-990v5-pink", title: "New Balance 990v5 Pink W", subtitle: "Made in USA runner v pudrové růžové", cat: "tenisky", brand: "new-balance", genders: ["zeny"], price: 489900, stock: 6, flags: { featured: true, new: true }, img: [P.nikeSwoosh], sizes: SHOE_SIZES_W },
  { slug: "puma-rs-x-soft", title: "Puma RS-X Soft W", subtitle: "Chunky RS tlumení v pastelovém provedení", cat: "tenisky", brand: "nike", genders: ["zeny"], price: 249900, compare: 499900, stock: 12, img: [P.jordanMid], sizes: SHOE_SIZES_W, brandName: "Puma" },
  { slug: "puma-palermo-cream", title: "Puma Palermo Moda Cream", subtitle: "Terasový styl s kontrastními tkaničkami", cat: "tenisky", brand: "nike", genders: ["zeny"], price: 229900, compare: 259900, stock: 14, img: [P.pumaYellow], sizes: SHOE_SIZES_W, brandName: "Puma" },
  { slug: "autry-medalist-low", title: "Autry Medalist Low Cream", subtitle: "Italský vintage tenis, prémiová kůže", cat: "tenisky", brand: "nike", genders: ["muzi", "zeny"], price: 449900, stock: 5, flags: { new: true }, img: [P.courtStones, P.jordanShelf], sizes: SHOE_SIZES, brandName: "Autry" },
  { slug: "reebok-club-c-85", title: "Reebok Club C 85 White", subtitle: "Minimalistický tenisový styl, jemná kůže", cat: "tenisky", brand: "adidas", genders: ["zeny", "muzi"], price: 219900, compare: 239900, stock: 20, img: [P.nbBrown, P.whiteCourt], sizes: SHOE_SIZES, brandName: "Reebok" },
  { slug: "adidas-nmd-s1-black", title: "adidas NMD_S1 Core Black", subtitle: "Minimalistický knit s BOOST podešví", cat: "tenisky", brand: "adidas", genders: ["muzi"], price: 389900, compare: 439900, stock: 6, img: [P.jordanRed], sizes: SHOE_SIZES },
  // ── Jordan ──
  { slug: "air-jordan-1-mid-gym-red", title: "Air Jordan 1 Mid Gym Red", subtitle: "Legenda z osmdesátek v chicagské barevnosti", cat: "tenisky", brand: "jordan", genders: ["muzi"], price: 379900, stock: 9, flags: { featured: true }, img: [P.walking], sizes: SHOE_SIZES },
  { slug: "air-jordan-1-high-royal", title: "Air Jordan 1 Retro High OG Royal", subtitle: "Drop týdne — OG barevnost z roku 1985", cat: "tenisky", brand: "jordan", genders: ["muzi", "zeny"], price: 469900, stock: 4, flags: { featured: true, new: true }, img: [P.aj1Royal], sizes: SHOE_SIZES },
  // ── Retro klasiky ──
  { slug: "nike-air-max-90-multicolor", title: "Nike Air Max 90 SE Multicolor", subtitle: "Ikona z roku 1990 v odvážných barvách", cat: "retro-klasiky", brand: "nike", genders: ["muzi"], price: 349900, compare: 389900, stock: 8, img: [P.nikeCortez, P.whiteMinimal], sizes: SHOE_SIZES },
  { slug: "nike-air-max-90-navy", title: "Nike Air Max 90 Navy/Gold", subtitle: "Viditelný Air a prémiový mix materiálů", cat: "retro-klasiky", brand: "nike", genders: ["muzi", "zeny"], price: 349900, stock: 12, flags: { featured: true }, img: [P.whiteMinimal, P.nikeCortez], sizes: SHOE_SIZES },
  { slug: "converse-chuck-70-hi", title: "Converse Chuck 70 Hi Vintage", subtitle: "Vylepšená klasika — vyšší podešev, prémiové plátno", cat: "retro-klasiky", brand: "converse", genders: ["muzi", "zeny", "deti"], price: 219900, compare: 249900, stock: 25, img: [P.bootsBrown, P.chuckCream], sizes: SHOE_SIZES },
  { slug: "converse-chuck-parchment", title: "Converse Chuck Taylor All Star Parchment", subtitle: "Krémová klasika, která jde ke všemu", cat: "retro-klasiky", brand: "converse", genders: ["zeny", "deti"], price: 179900, stock: 30, img: [P.chuckCream], sizes: SHOE_SIZES_W },
  // ── Běžecká obuv ──
  { slug: "nike-pegasus-41-crimson", title: "Nike Pegasus 41 Crimson", subtitle: "ReactX pěna, Zoom Air — denní tréninky", cat: "bezecka-obuv", brand: "nike", genders: ["muzi", "zeny"], price: 329900, compare: 359900, stock: 15, flags: { featured: true }, img: [P.nikeRed], sizes: SHOE_SIZES },
  { slug: "nike-free-rn-5", title: "Nike Free RN 5.0", subtitle: "Pocit bosé nohy, maximální flexibilita", cat: "bezecka-obuv", brand: "nike", genders: ["muzi", "zeny"], price: 259900, stock: 17, img: [P.nikeColor], sizes: SHOE_SIZES },
  { slug: "nike-flyknit-trainer-grey", title: "Nike Flyknit Trainer Grey", subtitle: "Ponožkový střih, ultralehký knit svršek", cat: "bezecka-obuv", brand: "nike", genders: ["muzi"], price: 279900, compare: 649900, stock: 9, img: [P.nikeYellow], sizes: SHOE_SIZES },
  { slug: "nike-superrep-go-volt", title: "Nike SuperRep Go Volt", subtitle: "Volt edice — energie do každého tréninku", cat: "bezecka-obuv", brand: "nike", genders: ["muzi", "zeny"], price: 289900, stock: 14, flags: { featured: true, new: true }, img: [P.asicsBlue], sizes: SHOE_SIZES },
  { slug: "salomon-xt-wings-2", title: "Salomon XT-Wings 2 Grey", subtitle: "Trailová technologie do města — Quicklace, Contagrip", cat: "bezecka-obuv", brand: "salomon", genders: ["muzi", "zeny"], price: 429900, stock: 7, flags: { featured: true, new: true }, img: [P.converse], sizes: SHOE_SIZES },
  { slug: "new-balance-247-olive", title: "New Balance 247 Olive", subtitle: "REVlite podešev, 24/7 komfort", cat: "bezecka-obuv", brand: "new-balance", genders: ["muzi"], price: 239900, compare: 279900, stock: 11, img: [P.track], sizes: SHOE_SIZES },
  // ── Boots & sandály & skate ──
  { slug: "dr-martens-1460-crazy-horse", title: "Dr. Martens 1460 Crazy Horse", subtitle: "8dírková ikona v hnědé olejované kůži", cat: "boots", brand: "converse", genders: ["muzi", "zeny"], price: 469900, stock: 10, img: [P.jordanBlack], sizes: SHOE_SIZES, brandName: "Dr. Martens" },
  { slug: "timberland-6-premium", title: "Timberland 6-Inch Premium Wheat", subtitle: "Voděodolný nubuk, prémiové šněrování", cat: "boots", brand: "converse", genders: ["muzi"], price: 519900, compare: 569900, stock: 6, img: [P.bootsHike], sizes: SHOE_SIZES, brandName: "Timberland" },
  { slug: "botiq-heritage-boot-w", title: "BOTIQ Heritage Boot W Cognac", subtitle: "Kotníkové boty z hladké kůže, blokový podpatek", cat: "boots", brand: "converse", genders: ["zeny"], price: 389900, compare: 449900, stock: 8, img: [P.ankleBoots], sizes: SHOE_SIZES_W, brandName: "BOTIQ" },
  { slug: "birkenstock-arizona-taupe", title: "Birkenstock Arizona Taupe", subtitle: "Korkové lůžko, semišový svršek — ikona pohodlí", cat: "sandaly-pantofle", brand: "converse", genders: ["muzi", "zeny"], price: 259900, stock: 16, flags: { featured: true }, img: [P.birk], sizes: SHOE_SIZES, brandName: "Birkenstock" },
  { slug: "buffalo-platform-sandal", title: "Buffalo Platform Sandal Burgundy", subtitle: "Devadesátková platforma, vínová kůže", cat: "sandaly-pantofle", brand: "converse", genders: ["zeny"], price: 219900, compare: 259900, stock: 9, img: [P.platformSandal], sizes: SHOE_SIZES_W, brandName: "Buffalo" },
  { slug: "vans-old-skool-port", title: "Vans Old Skool Port Royale", subtitle: "Skate klasika s jazz stripe ve vínové", cat: "skate-obuv", brand: "converse", genders: ["muzi", "zeny", "deti"], price: 199900, stock: 27, flags: { featured: true }, img: [P.sole, P.skateboard], sizes: SHOE_SIZES, brandName: "Vans" },
  // ── Oblečení ──
  { slug: "botiq-essential-hoodie", title: "BOTIQ Essential Hoodie Grey", subtitle: "Těžká 420g bavlna, oversized střih, vyšité logo", cat: "mikiny", brand: "nike", genders: ["muzi", "zeny"], price: 189900, stock: 22, flags: { featured: true, new: true }, img: [P.hoodieBack], sizes: APPAREL, brandName: "BOTIQ" },
  { slug: "champion-reverse-weave", title: "Champion Reverse Weave Hoodie", subtitle: "Legendární gramáž, nesráží se", cat: "mikiny", brand: "nike", genders: ["muzi"], price: 219900, compare: 259900, stock: 13, img: [P.hoodieStreet], sizes: APPAREL, brandName: "Champion" },
  { slug: "botiq-logo-tee-white", title: "BOTIQ Logo Tee White", subtitle: "Organická bavlna 220g, sítotisk", cat: "tricka", brand: "nike", genders: ["muzi", "zeny"], price: 79900, stock: 40, flags: { new: true }, img: [P.teeWhite], sizes: APPAREL, brandName: "BOTIQ" },
  { slug: "botiq-bones-tee-black", title: "BOTIQ Bones Tee Black", subtitle: "Grafický potisk, boxy střih", cat: "tricka", brand: "nike", genders: ["muzi", "deti"], price: 89900, compare: 99900, stock: 28, img: [P.teeHang], sizes: APPAREL, brandName: "BOTIQ" },
  { slug: "alpha-ma1-dusty-pink", title: "Alpha Industries MA-1 Dusty Pink", subtitle: "Original flight jacket v pudrovém tónu", cat: "bundy", brand: "adidas", genders: ["zeny", "muzi"], price: 429900, compare: 479900, stock: 8, img: [P.jacket], sizes: APPAREL, brandName: "Alpha Industries" },
  // ── Doplňky ──
  { slug: "eastpak-padded-pakr", title: "Eastpak Padded Pak'r Black", subtitle: "24 l, doživotní záruka, polstrovaná záda", cat: "batohy", brand: "converse", genders: ["muzi", "zeny", "deti"], price: 129900, stock: 26, img: [P.backpack], brandName: "Eastpak" },
  { slug: "new-era-trucker-white", title: "New Era 9Forty Trucker White", subtitle: "Síťovaná záda, nastavitelný snapback", cat: "ksiltovky", brand: "new-balance", genders: ["muzi", "zeny"], price: 74900, compare: 84900, stock: 32, img: [P.cap], brandName: "New Era" },
  { slug: "botiq-dad-cap-sand", title: "BOTIQ Dad Cap Sand", subtitle: "Seprané plátno, vyšitá grafika", cat: "ksiltovky", brand: "nike", genders: ["muzi", "zeny"], price: 64900, stock: 28, flags: { featured: true }, img: [P.beanie], brandName: "BOTIQ" },
  { slug: "botiq-crew-socks-lips", title: "BOTIQ Crew Socks Lips 2-pack", subtitle: "Česaná bavlna, celoplošný potisk", cat: "ponozky", brand: "nike", genders: ["muzi", "zeny"], price: 39900, compare: 44900, stock: 60, img: [P.socks], sizes: ["38–42", "42–46"], brandName: "BOTIQ" },
  { slug: "botiq-team-deck", title: "BOTIQ Team Deck 8.25\"", subtitle: "7vrstvý kanadský javor, limitovaná grafika", cat: "skate", brand: "converse", genders: ["muzi", "deti"], price: 149900, stock: 12, flags: { new: true }, img: [P.skateboard], brandName: "BOTIQ" },
  { slug: "crep-protect-sprej", title: "Crep Protect impregnační sprej", subtitle: "Neviditelný štít proti vodě a skvrnám, 200 ml", cat: "pece-o-boty", brand: "nike", genders: ["muzi", "zeny", "deti"], price: 37900, stock: 50, img: [P.rainCare], brandName: "Crep Protect" },
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
    const variants = p.sizes ?? ["Standard"];
    const optName = p.sizes ? "Velikost" : "Provedení";
    const brandName = p.brandName ?? { nike: "Nike", adidas: "adidas Originals", "new-balance": "New Balance", jordan: "Jordan", converse: "Converse", salomon: "Salomon" }[p.brand] ?? p.brand;
    const desc = `${p.subtitle}. ${p.title} od značky ${brandName} — kurátorovaný výběr BOTIQ. Ověřený originál, doprava zdarma nad 2 500 Kč a vrácení do 30 dní. Objednej dnes, zítra vyrážíš v novém.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.subtitle, desc, brandName, catIds.get(p.cat),
       JSON.stringify([{ name: optName, values: variants }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (!p.brandName) await link(pid, p.brand); // brandName override = značka bez vlastní kategorie
    for (const g of p.genders ?? []) await link(pid, g);
    if (p.compare) await link(pid, "vyprodej");
    if (p.flags?.new) await link(pid, "novinky");

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, U(p.img[i]), `${p.title} — foto ${i + 1}`, i]
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase()}-${i}`, variants[i],
         JSON.stringify({ [optName]: variants[i] }), p.price, p.compare ?? null, p.stock, i === 0, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-10 seed')`,
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
