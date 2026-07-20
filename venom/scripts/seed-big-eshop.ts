/**
 * Mega seed script pro eshop-01-v2 — realistický velký e-shop
 * Spustit: npx tsx scripts/seed-big-eshop.ts
 */

import { Pool } from "pg";
import { readFileSync } from "fs";
import * as path from "path";

// Parse .env.local manually (no dotenv dep)
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TENANT_SLUG = "eshop-01-v2";

// ─── Unsplash placeholder images by category ──────────────────────────────────

function img(keyword: string, idx: number, w = 800, h = 800): string {
  return `https://images.unsplash.com/photo-${keyword}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

// Real Unsplash photo IDs for each category
const PHOTOS: Record<string, string[]> = {
  elektronika: [
    "1505740420928-5e560c06d30e", "1523275335684-37898b6baf30", "1526738549149-8e07eca6c147",
    "1585060544812-6b45742d762f", "1593642632559-0c6d3fc62b89", "1546868871-af0de0c30dbd",
    "1611532736597-de2d4265fba3", "1583394838336-d831d9fc8e93", "1542751110-97427bbecf20",
    "1598986591340-9d09b1196843",
  ],
  obleceni: [
    "1489987707025-afc232f7ea0f", "1434389677669-e08b4cac3105", "1441984904996-e0b6ba687e04",
    "1516762689563-7e32f0d9823a", "1503342217505-b0a15ec515c7", "1551028719-00167b16eac5",
    "1543163521-1bf539c55dd2", "1556905055-8f358a7a47b2", "1618354691373-d851c5c3a990",
    "1558618666-fcd25c85f6aa", "1594938298603-c8148c4dae35", "1591047139829-d91aecb6caea",
  ],
  boty: [
    "1542291026-7eec264c27ff", "1460353581996-a0860dc60b07", "1543508282-6319a3e2621f",
    "1549298916-b41d501d3772", "1595950653106-6c9ebd614d3a", "1608231387042-66d1773070a5",
    "1605348532760-6753d2c43329", "1606107557195-0e29a4b5b4aa",
  ],
  sport: [
    "1517836357463-d25dfeac3438", "1571019614242-c5c5dee9f50a", "1576435728678-68d0fbf94e91",
    "1558618666-fcd25c85f6aa", "1558017487-06bf9f82613a", "1605296867424-35fc25c9212a",
    "1571019613454-1cb2f99b2d8b", "1518611012118-696072aa579a",
  ],
  domacnost: [
    "1556909114-f6e7ad7d3136", "1493663284031-b7e3aefe2f66", "1524758631624-e2822e304c36",
    "1507003211169-0a1dd7228f2d", "1556228720-195a672e8a03", "1583847268964-b28dc8f51f92",
    "1540574163026-643ea20ade25", "1550581190-9c1c48d21d6c",
  ],
  kosmetika: [
    "1571781926291-c477ebfd024b", "1596462502278-27bfdc403348", "1608248543803-ba4f8c70ae0b",
    "1512496015851-a90fb38ba796", "1631729371254-42c2892f0e6e", "1570194065650-d99fb4cb5d77",
    "1556228578-8c89e6adf883", "1611930022073-b7a4ba5fcccd",
  ],
  knihy: [
    "1512820790803-83ca734da794", "1507003211169-0a1dd7228f2d", "1544947950-fa07a98d237f",
    "1543002588-bfa74002ed7e", "1495446815901-a7297e633e8d", "1516979187457-637abb4f9353",
  ],
  zahrada: [
    "1416879595882-3373a0480b5b", "1558618666-fcd25c85f6aa", "1585320806297-9794b3e4eeae",
    "1592150621744-3b62755e33fb", "1416879595882-3373a0480b5b", "1599629954294-5ff13981e200",
  ],
  potraviny: [
    "1553531384-cc64ac80f931", "1543339308-43e59d6b73a6", "1559181567-c3190ca9959b",
    "1517093728432-a75f79942f60", "1509440159596-0249088772ff", "1504674900247-0877df9cc836",
  ],
};

function photoUrl(cat: string, idx: number): string {
  const arr = PHOTOS[cat] ?? PHOTOS.domacnost;
  return `https://images.unsplash.com/photo-${arr[idx % arr.length]}?w=800&h=800&fit=crop&auto=format&q=80`;
}

// ─── Category tree ────────────────────────────────────────────────────────────

interface Cat {
  slug: string;
  name: string;
  sort: number;
  parent?: string;
  image?: string;
  desc?: string;
}

const CATEGORIES: Cat[] = [
  // Top-level
  { slug: "novinky", name: "Novinky", sort: 0 },
  { slug: "akce", name: "Akce & Výprodej", sort: 1 },
  { slug: "elektronika", name: "Elektronika", sort: 2, desc: "Notebooky, mobily, příslušenství" },
  { slug: "obleceni", name: "Oblečení", sort: 3, desc: "Pánské, dámské, dětské" },
  { slug: "boty", name: "Boty", sort: 4 },
  { slug: "sport", name: "Sport & Outdoor", sort: 5 },
  { slug: "domacnost", name: "Domácnost", sort: 6, desc: "Nábytek, dekorace, osvětlení" },
  { slug: "kosmetika", name: "Kosmetika & Zdraví", sort: 7 },
  { slug: "knihy", name: "Knihy & Papír", sort: 8 },
  { slug: "zahrada", name: "Zahrada", sort: 9 },
  { slug: "potraviny", name: "Potraviny & Nápoje", sort: 10 },
  // Sub-cats: Elektronika
  { slug: "notebooky", name: "Notebooky", sort: 0, parent: "elektronika" },
  { slug: "mobily", name: "Mobilní telefony", sort: 1, parent: "elektronika" },
  { slug: "sluchatka", name: "Sluchátka", sort: 2, parent: "elektronika" },
  { slug: "tablety", name: "Tablety", sort: 3, parent: "elektronika" },
  { slug: "prislusenstvi-el", name: "Příslušenství", sort: 4, parent: "elektronika" },
  { slug: "chytre-hodinky", name: "Chytré hodinky", sort: 5, parent: "elektronika" },
  // Sub-cats: Oblečení
  { slug: "panske", name: "Pánské", sort: 0, parent: "obleceni" },
  { slug: "damske", name: "Dámské", sort: 1, parent: "obleceni" },
  { slug: "detske", name: "Dětské", sort: 2, parent: "obleceni" },
  { slug: "tricka", name: "Trička & Polokošile", sort: 3, parent: "obleceni" },
  { slug: "mikiny", name: "Mikiny & Svetry", sort: 4, parent: "obleceni" },
  { slug: "bundy", name: "Bundy & Kabáty", sort: 5, parent: "obleceni" },
  { slug: "kalhoty", name: "Kalhoty & Džíny", sort: 6, parent: "obleceni" },
  // Sub-cats: Boty
  { slug: "tenisky", name: "Tenisky", sort: 0, parent: "boty" },
  { slug: "polobotky", name: "Polobotky", sort: 1, parent: "boty" },
  { slug: "sandaly", name: "Sandály & Pantofle", sort: 2, parent: "boty" },
  { slug: "zimni-boty", name: "Zimní obuv", sort: 3, parent: "boty" },
  // Sub-cats: Sport
  { slug: "fitness", name: "Fitness & Posilovna", sort: 0, parent: "sport" },
  { slug: "cyklistika", name: "Cyklistika", sort: 1, parent: "sport" },
  { slug: "beh", name: "Běh", sort: 2, parent: "sport" },
  { slug: "outdoor", name: "Outdoor & Turistika", sort: 3, parent: "sport" },
  { slug: "joga", name: "Jóga & Pilates", sort: 4, parent: "sport" },
  // Sub-cats: Domácnost
  { slug: "svicky-vune", name: "Svíčky & Vůně", sort: 0, parent: "domacnost" },
  { slug: "textil", name: "Textil & Povlečení", sort: 1, parent: "domacnost" },
  { slug: "kuchyne", name: "Kuchyně", sort: 2, parent: "domacnost" },
  { slug: "dekorace", name: "Dekorace", sort: 3, parent: "domacnost" },
  { slug: "osvetleni", name: "Osvětlení", sort: 4, parent: "domacnost" },
  // Sub-cats: Kosmetika
  { slug: "pece-o-plet", name: "Péče o pleť", sort: 0, parent: "kosmetika" },
  { slug: "vlasova-kosmetika", name: "Vlasová kosmetika", sort: 1, parent: "kosmetika" },
  { slug: "parfemy", name: "Parfémy", sort: 2, parent: "kosmetika" },
  { slug: "bio-eko", name: "BIO & EKO", sort: 3, parent: "kosmetika" },
  // Sub-cats: Potraviny
  { slug: "kava-caj", name: "Káva & Čaj", sort: 0, parent: "potraviny" },
  { slug: "cokolada", name: "Čokoláda & Sladké", sort: 1, parent: "potraviny" },
  { slug: "vino", name: "Víno & Likéry", sort: 2, parent: "potraviny" },
  { slug: "superpotraviny", name: "Superpotraviny", sort: 3, parent: "potraviny" },
];

// ─── Brands ───────────────────────────────────────────────────────────────────

const BRANDS = [
  "TechPro", "Samsung", "Apple", "Xiaomi", "Lenovo", "Sony", "JBL", "Bose",
  "Nike", "Adidas", "Puma", "New Balance", "Under Armour", "Reebok",
  "The North Face", "Columbia", "Patagonia", "Salomon",
  "L'Oréal", "Nivea", "Rituals", "Clinique", "The Ordinary",
  "IKEA Hack", "Ferm Living", "HAY", "Muuto",
  "Lavazza", "illy", "Harney & Sons", "Lindt", "Valrhona",
  "Moleskine", "Leuchtturm1917",
  "Garmin", "Fitbit", "Suunto",
  "Crocs", "Dr. Martens", "Vans", "Converse",
];

// ─── Product definitions ──────────────────────────────────────────────────────

interface Prod {
  slug: string; title: string; subtitle?: string; desc: string;
  brand: string; cat: string; cats?: string[];
  options?: Array<{ name: string; values: string[] }>;
  variants: Array<{
    sku: string; title?: string; opts?: Record<string, string>;
    price: number; compare?: number; stock: number;
  }>;
  flags?: Record<string, boolean>;
  imgCat?: string;
}

const PRODUCTS: Prod[] = [
  // ── ELEKTRONIKA ──────────────────────────────────────────────────
  { slug: "macbook-air-m3", title: "MacBook Air M3 15\"", subtitle: "Apple Silicon, 16 GB RAM", desc: "Nejtenčí notebook na světě s čipem Apple M3. 15,3\" Liquid Retina displej, 18 hodin výdrže baterie, tichý bezventilátorový design.", brand: "Apple", cat: "notebooky", cats: ["elektronika", "novinky"],
    options: [{ name: "Úložiště", values: ["256 GB", "512 GB", "1 TB"] }, { name: "Barva", values: ["Půlnočně černá", "Hvězdně stříbrná", "Vesmírně šedá"] }],
    variants: [
      { sku: "MBA-M3-256-BLK", title: "256 GB / Půlnočně černá", opts: { Úložiště: "256 GB", Barva: "Půlnočně černá" }, price: 3699900, stock: 12 },
      { sku: "MBA-M3-512-BLK", title: "512 GB / Půlnočně černá", opts: { Úložiště: "512 GB", Barva: "Půlnočně černá" }, price: 4499900, stock: 8 },
      { sku: "MBA-M3-1TB-SLV", title: "1 TB / Hvězdně stříbrná", opts: { Úložiště: "1 TB", Barva: "Hvězdně stříbrná" }, price: 5299900, stock: 5 },
      { sku: "MBA-M3-512-GRY", title: "512 GB / Vesmírně šedá", opts: { Úložiště: "512 GB", Barva: "Vesmírně šedá" }, price: 4499900, stock: 10 },
    ], flags: { featured: true, new: true }, imgCat: "elektronika" },
  { slug: "samsung-galaxy-s24-ultra", title: "Samsung Galaxy S24 Ultra", subtitle: "AI telefon s S Pen", desc: "Titanový rám, 200MP kamera s AI vylepšeními, 6,8\" Dynamic AMOLED 2X displej, S Pen v balení. Nejchytřejší Galaxy.", brand: "Samsung", cat: "mobily", cats: ["elektronika", "novinky"],
    options: [{ name: "Paměť", values: ["256 GB", "512 GB"] }, { name: "Barva", values: ["Titan černá", "Titan šedá", "Titan fialová"] }],
    variants: [
      { sku: "S24U-256-BLK", title: "256 GB / Titan černá", opts: { Paměť: "256 GB", Barva: "Titan černá" }, price: 3399900, stock: 20 },
      { sku: "S24U-512-BLK", title: "512 GB / Titan černá", opts: { Paměť: "512 GB", Barva: "Titan černá" }, price: 3899900, stock: 15 },
      { sku: "S24U-256-GRY", title: "256 GB / Titan šedá", opts: { Paměť: "256 GB", Barva: "Titan šedá" }, price: 3399900, stock: 18 },
      { sku: "S24U-256-PRP", title: "256 GB / Titan fialová", opts: { Paměť: "256 GB", Barva: "Titan fialová" }, price: 3399900, stock: 10 },
    ], flags: { featured: true }, imgCat: "elektronika" },
  { slug: "sony-wh-1000xm5", title: "Sony WH-1000XM5", subtitle: "Bezdrátová sluchátka s ANC", desc: "Nejlepší aktivní potlačení hluku v oboru. 30 hodin výdrže, multipoint připojení, LDAC kodek pro Hi-Res audio.", brand: "Sony", cat: "sluchatka", cats: ["elektronika"],
    options: [{ name: "Barva", values: ["Černá", "Stříbrná", "Modrá"] }],
    variants: [
      { sku: "WH5-BLK", title: "Černá", opts: { Barva: "Černá" }, price: 899900, stock: 35 },
      { sku: "WH5-SLV", title: "Stříbrná", opts: { Barva: "Stříbrná" }, price: 899900, stock: 28 },
      { sku: "WH5-BLU", title: "Modrá", opts: { Barva: "Modrá" }, price: 929900, compare: 999900, stock: 12 },
    ], imgCat: "elektronika" },
  { slug: "jbl-flip-6", title: "JBL Flip 6", subtitle: "Přenosný BT reproduktor IP67", desc: "Voděodolný přenosný reproduktor s hlasitým a čistým JBL Pro Sound. 12 hodin přehrávání, PartyBoost pro párování.", brand: "JBL", cat: "sluchatka", cats: ["elektronika"],
    options: [{ name: "Barva", values: ["Černá", "Červená", "Modrá", "Zelená"] }],
    variants: [
      { sku: "FLIP6-BLK", title: "Černá", opts: { Barva: "Černá" }, price: 349900, stock: 40 },
      { sku: "FLIP6-RED", title: "Červená", opts: { Barva: "Červená" }, price: 349900, stock: 25 },
      { sku: "FLIP6-BLU", title: "Modrá", opts: { Barva: "Modrá" }, price: 349900, stock: 30 },
      { sku: "FLIP6-GRN", title: "Zelená", opts: { Barva: "Zelená" }, price: 349900, stock: 15 },
    ], flags: { sale: true }, imgCat: "elektronika" },
  { slug: "ipad-air-m2", title: "iPad Air M2", subtitle: "11\" Liquid Retina", desc: "Čip M2 s 8jádrovým CPU, 10jádrovým GPU. Kompatibilní s Apple Pencil Pro a Magic Keyboard.", brand: "Apple", cat: "tablety", cats: ["elektronika"],
    options: [{ name: "Úložiště", values: ["128 GB", "256 GB", "512 GB"] }],
    variants: [
      { sku: "IPAD-AIR-128", title: "128 GB", opts: { Úložiště: "128 GB" }, price: 1899900, stock: 22 },
      { sku: "IPAD-AIR-256", title: "256 GB", opts: { Úložiště: "256 GB" }, price: 2199900, stock: 15 },
      { sku: "IPAD-AIR-512", title: "512 GB", opts: { Úložiště: "512 GB" }, price: 2799900, stock: 8 },
    ], imgCat: "elektronika" },
  { slug: "garmin-venu-3", title: "Garmin Venu 3", subtitle: "GPS hodinky s AMOLED", desc: "Jasný AMOLED displej, pokročilé zdravotní metriky, 14 dní výdrže baterie, integrovaný reproduktor a mikrofon.", brand: "Garmin", cat: "chytre-hodinky", cats: ["elektronika", "sport"],
    variants: [{ sku: "VENU3-BLK", price: 1249900, stock: 18 }], imgCat: "elektronika" },
  { slug: "xiaomi-14-ultra", title: "Xiaomi 14 Ultra", subtitle: "Leica optika, Snapdragon 8 Gen 3", desc: "Profesionální Leica Summilux objektivy, 1\" snímač, Snapdragon 8 Gen 3, 120W nabíjení.", brand: "Xiaomi", cat: "mobily", cats: ["elektronika"],
    options: [{ name: "Barva", values: ["Černá", "Bílá"] }],
    variants: [
      { sku: "X14U-BLK", title: "Černá", opts: { Barva: "Černá" }, price: 2999900, stock: 14 },
      { sku: "X14U-WHT", title: "Bílá", opts: { Barva: "Bílá" }, price: 2999900, stock: 10 },
    ], flags: { new: true }, imgCat: "elektronika" },
  { slug: "lenovo-tab-p12", title: "Lenovo Tab P12", subtitle: "12,7\" 3K displej", desc: "Obří 12,7\" displej s 3K rozlišením, 4 JBL reproduktory s Dolby Atmos, stylus v balení.", brand: "Lenovo", cat: "tablety", cats: ["elektronika"],
    variants: [{ sku: "TABP12", price: 999900, stock: 20 }], imgCat: "elektronika" },
  { slug: "bose-qc-ultra-earbuds", title: "Bose QuietComfort Ultra Earbuds", subtitle: "Prostorový zvuk Immersive Audio", desc: "Nejlepší noise-cancelling pecky od Bose. CustomTune zvuk, prostorový Immersive Audio, 6h + 18h pouzdro.", brand: "Bose", cat: "sluchatka", cats: ["elektronika"],
    options: [{ name: "Barva", values: ["Černá", "Bílá"] }],
    variants: [
      { sku: "BQCUE-BLK", title: "Černá", opts: { Barva: "Černá" }, price: 799900, stock: 22 },
      { sku: "BQCUE-WHT", title: "Bílá", opts: { Barva: "Bílá" }, price: 799900, stock: 16 },
    ], imgCat: "elektronika" },
  { slug: "usb-c-hub-7v1", title: "USB-C Hub 7v1", subtitle: "HDMI 4K + 100W PD", desc: "7-in-1 USB-C hub: HDMI 4K@60Hz, 2× USB-A 3.0, USB-C data, 100W PD pass-through, SD + microSD.", brand: "TechPro", cat: "prislusenstvi-el", cats: ["elektronika"],
    variants: [{ sku: "HUBC7", price: 149900, stock: 55 }], imgCat: "elektronika" },

  // ── OBLEČENÍ ────────────────────────────────────────────────────
  { slug: "tricko-oversized-premium", title: "Tričko Oversized Premium", subtitle: "280g organická bavlna", desc: "Heavy-weight oversized tričko ze 100% organické česané bavlny. Drop shoulders, ribbed neckline.", brand: "Nike", cat: "tricka", cats: ["obleceni", "panske"],
    options: [{ name: "Barva", values: ["Černá", "Bílá", "Béžová", "Olivová"] }, { name: "Velikost", values: ["S", "M", "L", "XL", "XXL"] }],
    variants: [
      { sku: "TOP-BLK-S", title: "Černá / S", opts: { Barva: "Černá", Velikost: "S" }, price: 129900, stock: 30 },
      { sku: "TOP-BLK-M", title: "Černá / M", opts: { Barva: "Černá", Velikost: "M" }, price: 129900, stock: 45 },
      { sku: "TOP-BLK-L", title: "Černá / L", opts: { Barva: "Černá", Velikost: "L" }, price: 129900, stock: 40 },
      { sku: "TOP-WHT-M", title: "Bílá / M", opts: { Barva: "Bílá", Velikost: "M" }, price: 129900, stock: 35 },
      { sku: "TOP-BEZ-L", title: "Béžová / L", opts: { Barva: "Béžová", Velikost: "L" }, price: 129900, stock: 20 },
      { sku: "TOP-OLV-XL", title: "Olivová / XL", opts: { Barva: "Olivová", Velikost: "XL" }, price: 129900, stock: 15 },
    ], flags: { featured: true }, imgCat: "obleceni" },
  { slug: "mikina-zip-tech-fleece", title: "Mikina Tech Fleece Full-Zip", subtitle: "Nike Tech Fleece™", desc: "Ikonická Nike Tech Fleece mikina s celorozepínacím zipem. Lehký hřejivý fleece, moderní slim fit.", brand: "Nike", cat: "mikiny", cats: ["obleceni", "panske"],
    options: [{ name: "Barva", values: ["Černá", "Šedá", "Navy"] }, { name: "Velikost", values: ["S", "M", "L", "XL"] }],
    variants: [
      { sku: "TF-BLK-M", title: "Černá / M", opts: { Barva: "Černá", Velikost: "M" }, price: 289900, stock: 20 },
      { sku: "TF-BLK-L", title: "Černá / L", opts: { Barva: "Černá", Velikost: "L" }, price: 289900, stock: 18 },
      { sku: "TF-GRY-M", title: "Šedá / M", opts: { Barva: "Šedá", Velikost: "M" }, price: 289900, stock: 15 },
      { sku: "TF-NVY-L", title: "Navy / L", opts: { Barva: "Navy", Velikost: "L" }, price: 289900, stock: 12 },
    ], imgCat: "obleceni" },
  { slug: "damske-saty-midi", title: "Dámské šaty Midi Wrap", subtitle: "Viskóza, zavinovací střih", desc: "Elegantní zavinovací midi šaty z lehké viskózy. Volánkový lem, V-výstřih, vázačka v pase.", brand: "Puma", cat: "damske", cats: ["obleceni"],
    options: [{ name: "Barva", values: ["Černá", "Vínová", "Zelená"] }, { name: "Velikost", values: ["XS", "S", "M", "L"] }],
    variants: [
      { sku: "SATY-BLK-S", title: "Černá / S", opts: { Barva: "Černá", Velikost: "S" }, price: 179900, stock: 14 },
      { sku: "SATY-VIN-M", title: "Vínová / M", opts: { Barva: "Vínová", Velikost: "M" }, price: 179900, stock: 10 },
      { sku: "SATY-ZEL-L", title: "Zelená / L", opts: { Barva: "Zelená", Velikost: "L" }, price: 179900, stock: 8 },
    ], imgCat: "obleceni" },
  { slug: "dziny-slim-fit", title: "Džíny Slim Fit Stretch", subtitle: "98% bavlna, 2% elastan", desc: "Klasické slim fit džíny s lehkým strečem pro maximální komfort. 5kapsový střih, zip, tmavě modré praní.", brand: "Adidas", cat: "kalhoty", cats: ["obleceni", "panske"],
    options: [{ name: "Velikost", values: ["30/32", "32/32", "32/34", "34/32", "34/34", "36/34"] }],
    variants: [
      { sku: "DZIN-3032", title: "30/32", opts: { Velikost: "30/32" }, price: 219900, stock: 12 },
      { sku: "DZIN-3232", title: "32/32", opts: { Velikost: "32/32" }, price: 219900, stock: 20 },
      { sku: "DZIN-3234", title: "32/34", opts: { Velikost: "32/34" }, price: 219900, stock: 15 },
      { sku: "DZIN-3432", title: "34/32", opts: { Velikost: "34/32" }, price: 219900, stock: 18 },
    ], imgCat: "obleceni" },
  { slug: "zimni-bunda-parka", title: "Zimní parka s kapucí", subtitle: "Voděodolná, -20°C", desc: "Teplá zimní parka s odepínací kapucí a syntetickou izolací. Voděodolný povrch, fleecová podšívka, reflexní detaily.", brand: "The North Face", cat: "bundy", cats: ["obleceni", "panske"],
    options: [{ name: "Barva", values: ["Černá", "Khaki"] }, { name: "Velikost", values: ["M", "L", "XL"] }],
    variants: [
      { sku: "PRKA-BLK-M", title: "Černá / M", opts: { Barva: "Černá", Velikost: "M" }, price: 589900, compare: 699900, stock: 8 },
      { sku: "PRKA-BLK-L", title: "Černá / L", opts: { Barva: "Černá", Velikost: "L" }, price: 589900, compare: 699900, stock: 6 },
      { sku: "PRKA-KHK-L", title: "Khaki / L", opts: { Barva: "Khaki", Velikost: "L" }, price: 589900, compare: 699900, stock: 5 },
    ], flags: { sale: true }, imgCat: "obleceni" },
  { slug: "detske-tricko-dinosaurus", title: "Dětské tričko Dinosaurus", subtitle: "Bio bavlna, potisk", desc: "Veselé dětské tričko s potiskem dinosaura. 100% bio bavlna, příjemná na dotek, Oeko-Tex® certifikace.", brand: "Puma", cat: "detske", cats: ["obleceni"],
    options: [{ name: "Velikost", values: ["104", "116", "128", "140"] }],
    variants: [
      { sku: "DT-104", title: "104", opts: { Velikost: "104" }, price: 49900, stock: 30 },
      { sku: "DT-116", title: "116", opts: { Velikost: "116" }, price: 49900, stock: 25 },
      { sku: "DT-128", title: "128", opts: { Velikost: "128" }, price: 49900, stock: 20 },
      { sku: "DT-140", title: "140", opts: { Velikost: "140" }, price: 49900, stock: 18 },
    ], imgCat: "obleceni" },
  { slug: "polo-kosile-pique", title: "Polo košile piqué", subtitle: "Slim fit, 100% bavlna", desc: "Klasická polo košile z bavlněného piqué materiálu. Dvouknoflikový rozparek, vyšité logo na hrudi.", brand: "Adidas", cat: "tricka", cats: ["obleceni", "panske"],
    options: [{ name: "Barva", values: ["Bílá", "Navy", "Vínová"] }, { name: "Velikost", values: ["S", "M", "L", "XL"] }],
    variants: [
      { sku: "POLO-WHT-M", title: "Bílá / M", opts: { Barva: "Bílá", Velikost: "M" }, price: 169900, stock: 22 },
      { sku: "POLO-NVY-L", title: "Navy / L", opts: { Barva: "Navy", Velikost: "L" }, price: 169900, stock: 18 },
      { sku: "POLO-VIN-M", title: "Vínová / M", opts: { Barva: "Vínová", Velikost: "M" }, price: 169900, stock: 12 },
    ], imgCat: "obleceni" },

  // ── BOTY ────────────────────────────────────────────────────────
  { slug: "nike-air-max-90", title: "Nike Air Max 90", subtitle: "Klasika od roku 1990", desc: "Legendární silueta s viditelnými Air polštáři. Prémiová kůže a síťovina, pěnová mezipodešev.", brand: "Nike", cat: "tenisky", cats: ["boty"],
    options: [{ name: "Barva", values: ["Bílá/Šedá", "Černá/Červená", "Triple Black"] }, { name: "Velikost", values: ["40", "41", "42", "43", "44", "45"] }],
    variants: [
      { sku: "AM90-WG-42", title: "Bílá/Šedá / 42", opts: { Barva: "Bílá/Šedá", Velikost: "42" }, price: 389900, stock: 10 },
      { sku: "AM90-WG-43", title: "Bílá/Šedá / 43", opts: { Barva: "Bílá/Šedá", Velikost: "43" }, price: 389900, stock: 12 },
      { sku: "AM90-BR-42", title: "Černá/Červená / 42", opts: { Barva: "Černá/Červená", Velikost: "42" }, price: 389900, stock: 8 },
      { sku: "AM90-TB-44", title: "Triple Black / 44", opts: { Barva: "Triple Black", Velikost: "44" }, price: 389900, stock: 6 },
    ], flags: { featured: true }, imgCat: "boty" },
  { slug: "converse-chuck-70", title: "Converse Chuck 70 Hi", subtitle: "Premium canvas, vintage sole", desc: "Vylepšená verze klasických Chuck Taylor s premium plátnem, polstrovanou stélkou a vintage žlutavou podrážkou.", brand: "Converse", cat: "tenisky", cats: ["boty"],
    options: [{ name: "Barva", values: ["Černá", "Bílá", "Parchment"] }, { name: "Velikost", values: ["38", "39", "40", "41", "42", "43", "44"] }],
    variants: [
      { sku: "C70-BLK-41", title: "Černá / 41", opts: { Barva: "Černá", Velikost: "41" }, price: 239900, stock: 15 },
      { sku: "C70-WHT-42", title: "Bílá / 42", opts: { Barva: "Bílá", Velikost: "42" }, price: 239900, stock: 18 },
      { sku: "C70-PRC-40", title: "Parchment / 40", opts: { Barva: "Parchment", Velikost: "40" }, price: 239900, stock: 10 },
    ], imgCat: "boty" },
  { slug: "dr-martens-1460", title: "Dr. Martens 1460", subtitle: "8-eye boot, Smooth leather", desc: "Ikonické 8-dirkové boty z hladké kůže. Žlutá stehová podešev, AirWair™ pata, Goodyear welt.", brand: "Dr. Martens", cat: "polobotky", cats: ["boty"],
    options: [{ name: "Velikost", values: ["39", "40", "41", "42", "43", "44"] }],
    variants: [
      { sku: "DM1460-40", title: "40", opts: { Velikost: "40" }, price: 529900, stock: 8 },
      { sku: "DM1460-42", title: "42", opts: { Velikost: "42" }, price: 529900, stock: 10 },
      { sku: "DM1460-44", title: "44", opts: { Velikost: "44" }, price: 529900, stock: 6 },
    ], imgCat: "boty" },
  { slug: "salomon-x-ultra-4-gtx", title: "Salomon X Ultra 4 GTX", subtitle: "Gore-Tex, Contragrip", desc: "Prémiová treková obuv s Gore-Tex membránou. Advanced Chassis™ pro stabilitu, Contragrip MA podrážka.", brand: "Salomon", cat: "zimni-boty", cats: ["boty", "outdoor"],
    options: [{ name: "Velikost", values: ["41", "42", "43", "44", "45"] }],
    variants: [
      { sku: "SXUG-42", title: "42", opts: { Velikost: "42" }, price: 449900, stock: 12 },
      { sku: "SXUG-43", title: "43", opts: { Velikost: "43" }, price: 449900, stock: 15 },
      { sku: "SXUG-44", title: "44", opts: { Velikost: "44" }, price: 449900, stock: 10 },
    ], imgCat: "boty" },

  // ── SPORT ───────────────────────────────────────────────────────
  { slug: "kettlebell-litina-16kg", title: "Kettlebell litinový 16 kg", subtitle: "Odolný vinyl coating", desc: "Profesionální kettlebell z jednoho kusu litiny s vinyl coatingem. Široký úchop, rovné dno pro stabilitu.", brand: "Under Armour", cat: "fitness", cats: ["sport"],
    options: [{ name: "Hmotnost", values: ["8 kg", "12 kg", "16 kg", "24 kg"] }],
    variants: [
      { sku: "KB-8", title: "8 kg", opts: { Hmotnost: "8 kg" }, price: 89900, stock: 20 },
      { sku: "KB-12", title: "12 kg", opts: { Hmotnost: "12 kg" }, price: 119900, stock: 18 },
      { sku: "KB-16", title: "16 kg", opts: { Hmotnost: "16 kg" }, price: 149900, stock: 25 },
      { sku: "KB-24", title: "24 kg", opts: { Hmotnost: "24 kg" }, price: 199900, stock: 12 },
    ], imgCat: "sport" },
  { slug: "jogamatka-tpe-6mm", title: "Jóga podložka TPE 6 mm", subtitle: "Protiskluzová, ekologická", desc: "Ekologická TPE jóga podložka se dvěma strukturovanými povrchy. Protiskluzová i za mokra, 183 × 61 cm.", brand: "Reebok", cat: "joga", cats: ["sport"],
    options: [{ name: "Barva", values: ["Šedá/Růžová", "Modrá/Tyrkysová", "Černá"] }],
    variants: [
      { sku: "JOGA-GR", title: "Šedá/Růžová", opts: { Barva: "Šedá/Růžová" }, price: 89900, stock: 30 },
      { sku: "JOGA-BT", title: "Modrá/Tyrkysová", opts: { Barva: "Modrá/Tyrkysová" }, price: 89900, stock: 25 },
      { sku: "JOGA-BLK", title: "Černá", opts: { Barva: "Černá" }, price: 89900, stock: 35 },
    ], imgCat: "sport" },
  { slug: "cyklo-dres-letni", title: "Cyklistický dres Pro", subtitle: "Prodyšný, 3 zadní kapsy", desc: "Závodní cyklo dres z Italian fabrics. Full-zip, 3 zadní kapsy, silikonový lem proti posouvání.", brand: "Patagonia", cat: "cyklistika", cats: ["sport"],
    options: [{ name: "Velikost", values: ["S", "M", "L", "XL"] }],
    variants: [
      { sku: "CD-S", title: "S", opts: { Velikost: "S" }, price: 249900, stock: 10 },
      { sku: "CD-M", title: "M", opts: { Velikost: "M" }, price: 249900, stock: 15 },
      { sku: "CD-L", title: "L", opts: { Velikost: "L" }, price: 249900, stock: 12 },
    ], imgCat: "sport" },
  { slug: "bezecke-boty-ultraboost", title: "Adidas Ultraboost 24", subtitle: "BOOST a LEP podešev", desc: "Legendární běžecké boty s technologií BOOST pro maximální energetický návrat. Continental™ gumová podrážka.", brand: "Adidas", cat: "beh", cats: ["sport", "boty"],
    options: [{ name: "Barva", values: ["Core Black", "Cloud White"] }, { name: "Velikost", values: ["41", "42", "43", "44", "45"] }],
    variants: [
      { sku: "UB24-BLK-42", title: "Core Black / 42", opts: { Barva: "Core Black", Velikost: "42" }, price: 499900, stock: 14 },
      { sku: "UB24-BLK-43", title: "Core Black / 43", opts: { Barva: "Core Black", Velikost: "43" }, price: 499900, stock: 12 },
      { sku: "UB24-WHT-42", title: "Cloud White / 42", opts: { Barva: "Cloud White", Velikost: "42" }, price: 499900, stock: 10 },
    ], imgCat: "sport" },
  { slug: "batoh-turisticky-40l", title: "Turistický batoh 40L", subtitle: "Větraná záda, pláštěnka", desc: "Lehký turistický batoh s ventilovaným zádovým systémem. Integrovaná pláštěnka, boční přístupy, hydro kompatibilní.", brand: "Columbia", cat: "outdoor", cats: ["sport"],
    variants: [{ sku: "BTH40", price: 329900, stock: 18 }], imgCat: "sport" },
  { slug: "suunto-9-peak-pro", title: "Suunto 9 Peak Pro", subtitle: "Titanové pouzdro, 40h GPS", desc: "Ultra-lehké titanové pouzdro, 40 hodin GPS, 300+ sportovních režimů, barometrický výškoměr.", brand: "Suunto", cat: "chytre-hodinky", cats: ["sport", "elektronika"],
    variants: [{ sku: "S9PP", price: 1499900, stock: 7 }], flags: { new: true }, imgCat: "sport" },

  // ── DOMÁCNOST ───────────────────────────────────────────────────
  { slug: "svicka-sojova-amber", title: "Svíčka Amber & Sandalwood", subtitle: "Sójový vosk, 55h", desc: "Ručně litá svíčka ze sójového vosku v keramickém kalíšku. Dřevěný knot, tóny ambry, santalového dřeva a pačuli.", brand: "Rituals", cat: "svicky-vune", cats: ["domacnost"],
    options: [{ name: "Velikost", values: ["180 g", "350 g"] }],
    variants: [
      { sku: "SAS-180", title: "180 g", opts: { Velikost: "180 g" }, price: 59900, stock: 40 },
      { sku: "SAS-350", title: "350 g", opts: { Velikost: "350 g" }, price: 99900, stock: 28 },
    ], imgCat: "domacnost" },
  { slug: "lnene-povleceni-set", title: "Lněné povlečení set", subtitle: "100% praný len, OEKO-TEX", desc: "Luxusní povlečení z praného lnu — měkne s každým praním. Set: přikrývka 200×220 + 2× polštář 70×90.", brand: "HAY", cat: "textil", cats: ["domacnost"],
    options: [{ name: "Barva", values: ["Přírodní", "Šedá", "Pudrová"] }],
    variants: [
      { sku: "LN-NAT", title: "Přírodní", opts: { Barva: "Přírodní" }, price: 389900, stock: 10 },
      { sku: "LN-GRY", title: "Šedá", opts: { Barva: "Šedá" }, price: 389900, stock: 8 },
      { sku: "LN-PNK", title: "Pudrová", opts: { Barva: "Pudrová" }, price: 389900, stock: 6 },
    ], imgCat: "domacnost" },
  { slug: "french-press-skleneny", title: "French Press 1L", subtitle: "Borosilikátové sklo, nerez", desc: "Elegantní french press z borosilikátového skla s nerezovým rámem a dvojitým filtrem. Objem 1 litr.", brand: "Ferm Living", cat: "kuchyne", cats: ["domacnost"],
    variants: [{ sku: "FP-1L", price: 79900, stock: 35 }], imgCat: "domacnost" },
  { slug: "stolni-lampa-led", title: "Stolní lampa LED Touch", subtitle: "Stmívatelná, 3 barvy světla", desc: "Minimalistická LED stolní lampa s dotykovým ovládáním. 3 teploty světla, 5 stupňů jasu, USB nabíjení.", brand: "Muuto", cat: "osvetleni", cats: ["domacnost"],
    variants: [{ sku: "LAMP-WHT", price: 149900, stock: 20 }], imgCat: "domacnost" },
  { slug: "keramicky-difuzer", title: "Keramický aroma difuzér", subtitle: "Ultrazvukový, LED podsvícení", desc: "Tichý ultrazvukový difuzér s keramickým povrchem. 300ml nádržka, časovač, měnící se LED podsvícení.", brand: "Rituals", cat: "svicky-vune", cats: ["domacnost"],
    variants: [{ sku: "ADIF-300", price: 129900, stock: 22 }], imgCat: "domacnost" },
  { slug: "dekoracni-vaza-sklo", title: "Dekorační váza Bubble", subtitle: "Ruční výroba, recyklované sklo", desc: "Ručně foukaná váza z recyklovaného skla s organickým tvarem. Výška 25 cm, ideální pro suché květiny.", brand: "Ferm Living", cat: "dekorace", cats: ["domacnost"],
    options: [{ name: "Barva", values: ["Čirá", "Kouřová", "Jantarová"] }],
    variants: [
      { sku: "VZ-CLR", title: "Čirá", opts: { Barva: "Čirá" }, price: 89900, stock: 12 },
      { sku: "VZ-SMK", title: "Kouřová", opts: { Barva: "Kouřová" }, price: 89900, stock: 10 },
      { sku: "VZ-AMB", title: "Jantarová", opts: { Barva: "Jantarová" }, price: 89900, stock: 8 },
    ], imgCat: "domacnost" },

  // ── KOSMETIKA ───────────────────────────────────────────────────
  { slug: "serum-vitamin-c", title: "Sérum Vitamin C 20%", subtitle: "Rozjasňující, anti-aging", desc: "Vysoce koncentrované sérum s 20% čistého L-askorbátu, kyselinou ferulovou a vitamínem E. Rozjasňuje, chrání před UV poškozením.", brand: "The Ordinary", cat: "pece-o-plet", cats: ["kosmetika", "novinky"],
    variants: [{ sku: "SVC-30", price: 69900, stock: 45 }], flags: { new: true }, imgCat: "kosmetika" },
  { slug: "hydratacni-krem-50ml", title: "Hydratační krém 72h", subtitle: "S kyselinou hyaluronovou", desc: "Intenzivní hydratační krém s 3 typy kyseliny hyaluronové pro 72hodinovou hydrataci. Dermatologicky testováno.", brand: "Clinique", cat: "pece-o-plet", cats: ["kosmetika"],
    variants: [{ sku: "HK-50", price: 119900, stock: 30 }], imgCat: "kosmetika" },
  { slug: "sampon-bezsulfatovy", title: "Šampon Repair & Shine", subtitle: "Bez sulfátů a parabenů", desc: "Šetrný bezšufátový šampon s arganovým olejem a keratinem. Opravuje poškozené vlasy, dodává lesk.", brand: "L'Oréal", cat: "vlasova-kosmetika", cats: ["kosmetika"],
    variants: [{ sku: "SMP-400", price: 44900, stock: 50 }], imgCat: "kosmetika" },
  { slug: "parfem-acqua-di-gio", title: "Parfém Acqua Essence", subtitle: "EDT 100 ml", desc: "Svěží aromatická vůně s tóny bergamotu, jasmínu a cedrového dřeva. Elegantní flakon, 100 ml.", brand: "Rituals", cat: "parfemy", cats: ["kosmetika"],
    variants: [{ sku: "AQE-100", price: 199900, stock: 18 }], imgCat: "kosmetika" },
  { slug: "bio-olej-jojobovy", title: "BIO jojobový olej 100 ml", subtitle: "Certifikovaný, lisovaný za studena", desc: "100% čistý bio jojobový olej lisovaný za studena. Univerzální péče o pleť, vlasy i nehty. ECOCERT certifikace.", brand: "The Ordinary", cat: "bio-eko", cats: ["kosmetika"],
    variants: [{ sku: "JOJ-100", price: 34900, stock: 40 }], imgCat: "kosmetika" },
  { slug: "pleotva-maska-kolagen", title: "Pleťová maska Kolagen", subtitle: "Hydrogel, 1 ks", desc: "Luxusní hydrogelová pleťová maska s mořským kolagenem a zlatými částicemi. Okamžitý lifting efekt, 20 min.", brand: "Nivea", cat: "pece-o-plet", cats: ["kosmetika"],
    variants: [{ sku: "MASK-KOL", price: 14900, stock: 60 }], flags: { sale: true }, imgCat: "kosmetika" },

  // ── KNIHY ───────────────────────────────────────────────────────
  { slug: "zapisnik-a5-teckovany", title: "Zápisník A5 tečkovaný", subtitle: "160 stran, 120g papír", desc: "Prémiový zápisník A5 s tečkovanými stránkami z 120g papíru (fountain pen friendly). Tvrdé desky, záložka, gumička.", brand: "Leuchtturm1917", cat: "knihy", cats: ["knihy"],
    options: [{ name: "Barva", values: ["Černá", "Navy", "Burgundy", "Sage"] }],
    variants: [
      { sku: "ZAP-BLK", title: "Černá", opts: { Barva: "Černá" }, price: 64900, stock: 30 },
      { sku: "ZAP-NVY", title: "Navy", opts: { Barva: "Navy" }, price: 64900, stock: 25 },
      { sku: "ZAP-BRG", title: "Burgundy", opts: { Barva: "Burgundy" }, price: 64900, stock: 18 },
      { sku: "ZAP-SGE", title: "Sage", opts: { Barva: "Sage" }, price: 64900, stock: 15 },
    ], imgCat: "knihy" },
  { slug: "moleskine-classic-l", title: "Moleskine Classic L", subtitle: "Linkovaný, 240 stran", desc: "Ikonický Moleskine v rozměru Large (13×21 cm). Linkovaný, ivory papír 70g, expandovatelná kapsa vzadu.", brand: "Moleskine", cat: "knihy",
    variants: [{ sku: "MOL-L", price: 54900, stock: 35 }], imgCat: "knihy" },

  // ── ZAHRADA ────────────────────────────────────────────────────
  { slug: "zahradni-nuzky-bypass", title: "Zahradní nůžky Bypass", subtitle: "Kované, ergonomické", desc: "Profesionální bypass nůžky s kovanými čepelemi. Ergonomická rukojeť s protiskluzovým povrchem, max. průměr 25 mm.", brand: "Garmin", cat: "zahrada",
    variants: [{ sku: "NUZK-BP", price: 89900, stock: 25 }], imgCat: "zahrada" },
  { slug: "smart-zavlaha-wifi", title: "Smart zavlažovací systém WiFi", subtitle: "6 zón, app control", desc: "Inteligentní zavlažovací řadič s WiFi. 6 nezávislých zón, plánování v aplikaci, integrace s počasím.", brand: "TechPro", cat: "zahrada",
    variants: [{ sku: "ZAVL-6Z", price: 349900, stock: 10 }], flags: { new: true }, imgCat: "zahrada" },

  // ── POTRAVINY ──────────────────────────────────────────────────
  { slug: "zrnkova-kava-ethiopia", title: "Zrnková káva Ethiopia Yirgacheffe", subtitle: "Single origin, 250 g", desc: "Specialty káva z etiopského regionu Yirgacheffe. Citrusové a květinové tóny, jemná kyselost, střední pražení.", brand: "Lavazza", cat: "kava-caj", cats: ["potraviny"],
    options: [{ name: "Hmotnost", values: ["250 g", "500 g", "1 kg"] }],
    variants: [
      { sku: "KV-ETH-250", title: "250 g", opts: { Hmotnost: "250 g" }, price: 29900, stock: 50 },
      { sku: "KV-ETH-500", title: "500 g", opts: { Hmotnost: "500 g" }, price: 54900, stock: 35 },
      { sku: "KV-ETH-1KG", title: "1 kg", opts: { Hmotnost: "1 kg" }, price: 99900, stock: 20 },
    ], imgCat: "potraviny" },
  { slug: "caj-matcha-ceremonial", title: "Matcha Ceremonial Grade", subtitle: "Bio, 30 g tin", desc: "Prémiová japonská matcha ceremonial grade z regionu Uji. Jemně mletá na kamenném mlýnku, zářivě zelená.", brand: "Harney & Sons", cat: "kava-caj", cats: ["potraviny"],
    variants: [{ sku: "MCH-30", price: 69900, stock: 25 }], imgCat: "potraviny" },
  { slug: "cokolada-70-peru", title: "Čokoláda 70% Peru", subtitle: "Single origin, bean-to-bar", desc: "Bean-to-bar čokoláda z peruánských kakaových bobů Criollo. 70% kakaa, tóny červeného ovoce a ořechů.", brand: "Valrhona", cat: "cokolada", cats: ["potraviny"],
    options: [{ name: "Varianta", values: ["70% Hořká", "85% Extra hořká", "Mléčná 45%"] }],
    variants: [
      { sku: "COK-70", title: "70% Hořká", opts: { Varianta: "70% Hořká" }, price: 19900, stock: 40 },
      { sku: "COK-85", title: "85% Extra hořká", opts: { Varianta: "85% Extra hořká" }, price: 22900, stock: 30 },
      { sku: "COK-45M", title: "Mléčná 45%", opts: { Varianta: "Mléčná 45%" }, price: 18900, stock: 35 },
    ], imgCat: "potraviny" },
  { slug: "vino-prosecco-doc", title: "Prosecco DOC Extra Dry", subtitle: "Itálie, 0.75 l", desc: "Svěží italské Prosecco s jemnými bublinkami. Tóny zeleného jablka, hrušky a bílých květů. Skvělé solo i jako základ koktejlů.", brand: "illy", cat: "vino", cats: ["potraviny"],
    variants: [{ sku: "PROS-075", price: 34900, stock: 40 }], imgCat: "potraviny" },
  { slug: "chia-seminka-bio", title: "Chia semínka BIO 500g", subtitle: "Raw, z Mexika", desc: "100% bio chia semínka z Mexika. Bohaté na omega-3, vlákninu a proteiny. Skvělé do smoothie, pudingů a pečení.", brand: "Lavazza", cat: "superpotraviny", cats: ["potraviny"],
    variants: [{ sku: "CHIA-500", price: 19900, stock: 60 }], imgCat: "potraviny" },
  { slug: "protein-bar-box-12", title: "Proteinová tyčinka box 12ks", subtitle: "20g proteinu, bez cukru", desc: "Box 12 proteinových tyčinek s 20g proteinu. Bez přidaného cukru, slaný karamel + čokoláda.", brand: "Under Armour", cat: "superpotraviny", cats: ["potraviny", "sport"],
    variants: [{ sku: "PBAR-12", price: 59900, stock: 35 }], imgCat: "potraviny" },
];

// ─── Seed runner ──────────────────────────────────────────────────────────────

async function run() {
  const client = await pool.connect();
  try {
    // Get tenant
    const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
    if (!tenantRes.rows.length) { console.error(`Tenant ${TENANT_SLUG} not found`); return; }
    const tenantId = tenantRes.rows[0].id;
    console.log(`Tenant: ${TENANT_SLUG} (id=${tenantId})`);

    // Clear existing products and categories
    await client.query("BEGIN");
    await client.query("DELETE FROM stock_movements WHERE tenant_id = $1", [tenantId]);
    await client.query("DELETE FROM product_images WHERE tenant_id = $1", [tenantId]);
    await client.query("DELETE FROM product_category_links WHERE tenant_id = $1", [tenantId]);
    await client.query("DELETE FROM product_variants WHERE tenant_id = $1", [tenantId]);
    await client.query("DELETE FROM products WHERE tenant_id = $1", [tenantId]);
    await client.query("DELETE FROM product_categories WHERE tenant_id = $1", [tenantId]);
    console.log("Cleared existing catalog");

    // Create categories
    const catIds = new Map<string, number>();
    // First pass: top-level
    for (const cat of CATEGORIES.filter(c => !c.parent)) {
      const res = await client.query(
        `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, image_url)
         VALUES ($1, $2, $3, $4, $5, true, $6) RETURNING id`,
        [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, null]
      );
      catIds.set(cat.slug, res.rows[0].id);
    }
    // Second pass: sub-categories
    for (const cat of CATEGORIES.filter(c => c.parent)) {
      const parentId = catIds.get(cat.parent!);
      const res = await client.query(
        `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, parent_id, image_url)
         VALUES ($1, $2, $3, $4, $5, true, $6, $7) RETURNING id`,
        [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, parentId ?? null, null]
      );
      catIds.set(cat.slug, res.rows[0].id);
    }
    console.log(`Created ${catIds.size} categories`);

    // Create products
    let productCount = 0;
    let variantCount = 0;
    let imgIdx = 0;

    for (const p of PRODUCTS) {
      const primaryCatId = catIds.get(p.cat) ?? null;
      const pRes = await client.query(
        `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9) RETURNING id`,
        [tenantId, p.slug, p.title, p.subtitle ?? null, p.desc, p.brand, primaryCatId,
         JSON.stringify(p.options ?? []), JSON.stringify(p.flags ?? {})]
      );
      const productId = pRes.rows[0].id;
      productCount++;

      // Category links
      const allCats = new Set<string>([p.cat, ...(p.cats ?? [])]);
      for (const catSlug of allCats) {
        const catId = catIds.get(catSlug);
        if (catId) {
          await client.query(
            `INSERT INTO product_category_links (tenant_id, product_id, category_id)
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [tenantId, productId, catId]
          );
        }
      }

      // Images (2 per product from Unsplash)
      const imgCategory = p.imgCat ?? p.cat;
      for (let i = 0; i < 2; i++) {
        await client.query(
          `INSERT INTO product_images (tenant_id, product_id, url, alt, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [tenantId, productId, photoUrl(imgCategory, imgIdx + i), `${p.title} — foto ${i + 1}`, i]
        );
      }
      imgIdx += 2;

      // Variants
      for (let i = 0; i < p.variants.length; i++) {
        const v = p.variants[i];
        const vRes = await client.query(
          `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
          [tenantId, productId, v.sku, v.title ?? null, JSON.stringify(v.opts ?? {}),
           v.price, v.compare ?? null, v.stock, i === 0, i]
        );
        variantCount++;
        await client.query(
          `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
           VALUES ($1, $2, $3, $4, 'import', 'Big eshop seed')`,
          [tenantId, vRes.rows[0].id, v.stock, v.stock]
        );
      }
    }

    await client.query("COMMIT");
    console.log(`\nDone! Created:`);
    console.log(`  ${catIds.size} categories (${CATEGORIES.filter(c => !c.parent).length} top-level + ${CATEGORIES.filter(c => c.parent).length} sub-categories)`);
    console.log(`  ${productCount} products`);
    console.log(`  ${variantCount} variants`);
    console.log(`  ${productCount * 2} images`);
    console.log(`  ${BRANDS.length} unique brands`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
