/**
 * Seed produktového katalogu pro eshop-16-v2 (Spížka — online supermarket).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Demo data: vlastní značky, ceny ±15–30 % od zadání, subtitle = gramáž • jednotková cena.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-16-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-16-v2";

const U = (id, w = 800, h = 800) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=75`;

const CATEGORIES = [
  { slug: "novinky", name: "Novinky", sort: 90, desc: "Čerstvě naskladněné novinky ve Spížce." },
  { slug: "akcni-tyden", name: "Akční týden", sort: 91, desc: "Týdenní slevy — jen dokud jsou skladem." },
  { slug: "zachran-jidlo", name: "Zachraň jídlo", sort: 92, desc: "Potraviny s blížící se spotřebou za zlomek ceny." },
  { slug: "zvyhodnene", name: "Zvýhodněné", sort: 93, desc: "Multikup a trvale výhodné ceny." },
  { slug: "multikup", name: "Multikup", sort: 94, desc: "Množstevní slevy — nakoupíte více, zaplatíte méně." },

  { slug: "ovoce-a-zelenina", name: "Ovoce a zelenina", sort: 1, desc: "Denní závozy jako z farmářského trhu." , img: U("photo-1610832958506-aa56368176cf", 400, 400) },
  { slug: "zelenina", name: "Zelenina", sort: 0, parent: "ovoce-a-zelenina" , img: U("photo-1587411768638-ec71f8e33b78", 400, 400) },
  { slug: "ovoce", name: "Ovoce", sort: 1, parent: "ovoce-a-zelenina" , img: U("photo-1571771894821-ce9b6c11b08e", 400, 400) },

  { slug: "pekarna-a-cukrarna", name: "Pekárna a cukrárna", sort: 2, desc: "Pečeme každé ráno, vozíme ještě teplé." , img: U("photo-1509440159596-0249088772ff", 400, 400) },
  { slug: "cerstve-pecivo", name: "Čerstvé pečivo", sort: 0, parent: "pekarna-a-cukrarna" , img: U("photo-1549931319-a545dcf3bc73", 400, 400) },
  { slug: "chleb", name: "Chléb", sort: 1, parent: "pekarna-a-cukrarna" , img: U("photo-1509440159596-0249088772ff", 400, 400) },
  { slug: "sladke-pecivo", name: "Sladké pečivo", sort: 2, parent: "pekarna-a-cukrarna" , img: U("photo-1551024601-bec78aea704b", 400, 400) },

  { slug: "maso-a-ryby", name: "Maso a ryby", sort: 3, desc: "Čerstvé maso od českých řezníků a ryby na ledu." , img: U("photo-1607623814075-e51df1bdc82f", 400, 400) },
  { slug: "kureci-maso", name: "Kuřecí maso", sort: 0, parent: "maso-a-ryby" , img: U("photo-1604503468506-a8da13d82791", 400, 400) },
  { slug: "veprove-maso", name: "Vepřové maso", sort: 1, parent: "maso-a-ryby" },
  { slug: "mlete-maso", name: "Mleté maso", sort: 2, parent: "maso-a-ryby" , img: U("photo-1603048297172-c92544798d5a", 400, 400) },
  { slug: "ryby-a-morske-plody", name: "Ryby a mořské plody", sort: 3, parent: "maso-a-ryby" , img: U("photo-1519708227418-c8fd9a32b7a2", 400, 400) },

  { slug: "uzeniny-a-lahudky", name: "Uzeniny a lahůdky", sort: 4, desc: "Šunky, salámy a lahůdky z pultu." , img: U("photo-1542901031-ec5eeb518e83", 400, 400) },
  { slug: "sunky", name: "Šunky", sort: 0, parent: "uzeniny-a-lahudky" , img: U("photo-1541529086526-db283c563270", 400, 400) },
  { slug: "salamy", name: "Salámy", sort: 1, parent: "uzeniny-a-lahudky" , img: U("photo-1542901031-ec5eeb518e83", 400, 400) },
  { slug: "parky-a-klobasy", name: "Párky a klobásy", sort: 2, parent: "uzeniny-a-lahudky" , img: U("photo-1612392061787-2d078b3e573c", 400, 400) },

  { slug: "mlecne-a-chlazene", name: "Mléčné a chlazené", sort: 5, desc: "Mléko, sýry a jogurty z českých mlékáren." , img: U("photo-1628088062854-d1870b4553da", 400, 400) },
  { slug: "mleko", name: "Mléko", sort: 0, parent: "mlecne-a-chlazene" , img: U("photo-1550583724-b2692b85b150", 400, 400) },
  { slug: "syry", name: "Sýry", sort: 1, parent: "mlecne-a-chlazene" , img: U("photo-1628088062854-d1870b4553da", 400, 400) },
  { slug: "jogurty", name: "Jogurty", sort: 2, parent: "mlecne-a-chlazene" , img: U("photo-1488477181946-6428a0291777", 400, 400) },
  { slug: "maslo-a-tuky", name: "Máslo a tuky", sort: 3, parent: "mlecne-a-chlazene" , img: U("photo-1589985270826-4b7bb135bc9d", 400, 400) },
  { slug: "vejce", name: "Vejce", sort: 4, parent: "mlecne-a-chlazene" , img: U("photo-1506976785307-8732e854ad03", 400, 400) },

  { slug: "trvanlive", name: "Trvanlivé", sort: 6, desc: "Zásoby do spížky — těstoviny, rýže, konzervy i sladkosti." , img: U("photo-1518843875459-f738682238a6", 400, 400) },
  { slug: "testoviny-a-ryze", name: "Těstoviny a rýže", sort: 0, parent: "trvanlive" , img: U("photo-1551462147-ff29053bfc14", 400, 400) },
  { slug: "snidane-a-cerealie", name: "Snídaně a cereálie", sort: 1, parent: "trvanlive" , img: U("photo-1517686469429-8bdb88b9f907", 400, 400) },
  { slug: "sladkosti", name: "Sladkosti", sort: 2, parent: "trvanlive" , img: U("photo-1471943311424-646960669fbc", 400, 400) },

  { slug: "mrazene", name: "Mražené", sort: 7, desc: "Zmrzliny, zelenina i hotová jídla z mrazáku." , img: U("photo-1476887334197-56adbf254e1a", 400, 400) },
  { slug: "zmrzliny", name: "Zmrzliny", sort: 0, parent: "mrazene" , img: U("photo-1497034825429-c343d7c6a68f", 400, 400) },
  { slug: "mrazena-zelenina", name: "Mražená zelenina", sort: 1, parent: "mrazene" , img: U("photo-1576045057995-568f588f82fb", 400, 400) },

  { slug: "napoje", name: "Nápoje", sort: 8, desc: "Vody, džusy, káva i něco k večeru." , img: U("photo-1544145945-f90425340c7e", 400, 400) },
  { slug: "voda", name: "Voda", sort: 0, parent: "napoje" , img: U("photo-1548839140-29a749e1cf4d", 400, 400) },
  { slug: "limonady-a-dzusy", name: "Limonády a džusy", sort: 1, parent: "napoje" , img: U("photo-1600271886742-f049cd451bba", 400, 400) },
  { slug: "kava-a-caj", name: "Káva a čaj", sort: 2, parent: "napoje" , img: U("photo-1447933601403-0c6688de566e", 400, 400) },

  { slug: "drogerie-a-kosmetika", name: "Drogerie a kosmetika", sort: 9, desc: "Úklid, prádlo a péče o tělo." , img: U("photo-1583947215259-38e31be8751f", 400, 400) },
  { slug: "praci-prostredky", name: "Prací prostředky", sort: 0, parent: "drogerie-a-kosmetika" , img: U("photo-1583947215259-38e31be8751f", 400, 400) },
  { slug: "papirove-zbozi", name: "Papírové zboží", sort: 1, parent: "drogerie-a-kosmetika" , img: U("photo-1584556812952-905ffd0c611a", 400, 400) },

  { slug: "pro-deti", name: "Pro děti", sort: 10, desc: "Výživa a hygiena pro nejmenší." , img: U("photo-1515488042361-ee00e0ddd4e4", 400, 400) },
  { slug: "kojenecka-vyziva", name: "Kojenecká výživa", sort: 0, parent: "pro-deti" , img: U("photo-1515488042361-ee00e0ddd4e4", 400, 400) },

  { slug: "domacnost-a-zahrada", name: "Domácnost a zahrada", sort: 11, desc: "Kuchyňské a domácí potřeby." , img: U("photo-1556911220-bff31c812dba", 400, 400) },
  { slug: "kuchynske-potreby", name: "Kuchyňské potřeby", sort: 0, parent: "domacnost-a-zahrada" , img: U("photo-1556911220-bff31c812dba", 400, 400) },
];

// price v haléřích; sub = gramáž • jednotková cena; pm = "Srovnaná cena"
const PRODUCTS = [
  // ── Ovoce a zelenina ──
  { slug: "banan-1ks", title: "Banán, 1 ks", sub: "cca 190 g • 39,90 Kč/kg", cat: "ovoce", brand: "Farma Luka", price: 790, stock: 120, flags: { featured: true, priceMatch: true }, img: U("photo-1571771894821-ce9b6c11b08e") },
  { slug: "rajcata-cherry-vanicka", title: "Rajčata cherry oválná, vanička", sub: "250 g • 239,60 Kč/kg", cat: "zelenina", brand: "Farma Luka", price: 5990, compare: 7490, stock: 48, flags: { featured: true }, img: U("photo-1592924357228-91a4daadcfea") },
  { slug: "paprika-cervena-vanicka", title: "Paprika červená kapie, vanička", sub: "500 g • 79,80 Kč/kg", cat: "zelenina", brand: "Farma Luka", price: 3990, compare: 5490, stock: 56, flags: { featured: true }, img: U("photo-1563565375-f3fdfdbefa83") },
  { slug: "brambory-rane-sit", title: "Brambory konzumní rané prané, síť", sub: "2 kg • 12,45 Kč/kg", cat: "zelenina", brand: "Statek Vrbno", price: 2490, stock: 80, flags: { new: true, priceMatch: true }, img: U("photo-1518977676601-b53f82aba655") },
  { slug: "cibule-zluta-sit", title: "Cibule žlutá, síť", sub: "1 kg • 17,90 Kč/kg", cat: "zelenina", brand: "Statek Vrbno", price: 1790, stock: 95, flags: { priceMatch: true }, img: U("photo-1508747703725-719777637510") },
  { slug: "avokado-ready-to-eat", title: "Avokádo Hass \"Ready to Eat\", 1 ks", sub: "cca 170 g • 193,50 Kč/kg", cat: "ovoce", brand: "Farma Luka", price: 3290, stock: 40, flags: { featured: true }, img: U("photo-1523049673857-eb18f1d7b578") },
  { slug: "jahody-vanicka", title: "Jahody, vanička", sub: "500 g • 179,80 Kč/kg", cat: "ovoce", brand: "Farma Luka", price: 8990, compare: 11990, stock: 30, flags: { featured: true }, img: U("photo-1464965911861-746a04b4bca6") },
  { slug: "hrozny-bile-bezsemenne", title: "Hrozny bílé bezsemenné, vanička", sub: "500 g • 99,80 Kč/kg", cat: "ovoce", brand: "Farma Luka", price: 4990, compare: 6490, stock: 35, img: U("photo-1537640538966-79f369143f8f") },
  { slug: "okurka-hadovka", title: "Okurka hadovka, 1 ks", sub: "cca 300 g • 43,00 Kč/kg", cat: "zelenina", brand: "Farma Luka", price: 1290, stock: 85, flags: { new: true }, img: U("photo-1587411768638-ec71f8e33b78") },
  { slug: "rajce-salatove-1ks", title: "Rajče salátové, 1 ks", sub: "cca 180 g • 49,40 Kč/kg", cat: "zelenina", brand: "Farma Luka", price: 890, stock: 90, flags: { new: true }, img: U("photo-1571680322279-a226e6a4cc2a") },
  // ── Pekárna ──
  { slug: "rohlik-cerstvy", title: "Rohlík pšeničný", sub: "43 g • 58,10 Kč/kg", cat: "cerstve-pecivo", brand: "Pekárna Zrno", price: 250, stock: 300, flags: { featured: true, priceMatch: true }, img: U("photo-1549931319-a545dcf3bc73") },
  { slug: "chleb-kvaskovy", title: "Chléb kváskový krájený", sub: "500 g • 109,80 Kč/kg", cat: "chleb", brand: "Pekárna Zrno", price: 5490, stock: 60, flags: { featured: true }, img: U("photo-1509440159596-0249088772ff") },
  { slug: "bageta-francouzska", title: "Bageta francouzská střední", sub: "120 g • 107,50 Kč/kg", cat: "cerstve-pecivo", brand: "Pekárna Zrno", price: 1290, stock: 90, img: U("photo-1568471173242-461f0a730452") },
  { slug: "croissant-maslovy", title: "Croissant máslový", sub: "60 g • 415,00 Kč/kg", cat: "sladke-pecivo", brand: "Pekárna Zrno", price: 2490, compare: 2990, stock: 70, flags: { new: true }, img: U("photo-1555507036-ab1f4038808a") },
  { slug: "donut-jahodovy", title: "Donut s jahodovou polevou", sub: "56 g • 283,90 Kč/kg", cat: "sladke-pecivo", brand: "Pekárna Zrno", price: 1590, compare: 1990, stock: 55, img: U("photo-1551024601-bec78aea704b") },
  // ── Maso a ryby ──
  { slug: "kureci-prsa-farmarska", title: "Kuřecí prsní řízek farmářský", sub: "cca 500 g • 259,80 Kč/kg", cat: "kureci-maso", brand: "Řeznictví Dub", price: 12990, stock: 26, flags: { featured: true }, img: U("photo-1604503468506-a8da13d82791") },
  { slug: "hovezi-mlete-maso", title: "Hovězí mleté maso", sub: "cca 500 g • 209,80 Kč/kg", cat: "mlete-maso", brand: "Řeznictví Dub", price: 10490, compare: 13990, stock: 22, flags: { featured: true }, img: U("photo-1603048297172-c92544798d5a") },
  { slug: "losos-filet-kuze", title: "Losos filet s kůží", sub: "cca 250 g • 759,60 Kč/kg", cat: "ryby-a-morske-plody", brand: "Rybárna Sever", price: 18990, stock: 14, img: U("photo-1519708227418-c8fd9a32b7a2") },
  { slug: "veprova-panenka", title: "Vepřová panenka bez řetízku", sub: "cca 630 g • 190,30 Kč/kg", cat: "veprove-maso", brand: "Řeznictví Dub", price: 11990, compare: 15990, stock: 18, flags: { featured: true }, img: U("photo-1607623814075-e51df1bdc82f") },
  // ── Uzeniny ──
  { slug: "sunka-nejvyssi-jakosti", title: "Šunka nejvyšší jakosti (93 % masa)", sub: "100 g • 429,00 Kč/kg", cat: "sunky", brand: "Řeznictví Dub", price: 4290, stock: 44, flags: { multikup: { qty: 2, price: 3790 }, featured: true, priceMatch: true }, img: U("photo-1541529086526-db283c563270") },
  { slug: "salam-gurmansky", title: "Salám gurmánský výběrový", sub: "100 g • 369,00 Kč/kg", cat: "salamy", brand: "Řeznictví Dub", price: 3690, stock: 38, img: U("photo-1542901031-ec5eeb518e83") },
  { slug: "parky-videnske", title: "Párky vídeňské", sub: "300 g • 183,00 Kč/kg", cat: "parky-a-klobasy", brand: "Řeznictví Dub", price: 5490, compare: 6990, stock: 32, flags: { multikup: { qty: 2, price: 4790 } }, img: U("photo-1612392061787-2d078b3e573c") },
  // ── Mléčné ──
  { slug: "mleko-polotucne-1l", title: "Mléko trvanlivé polotučné (1,5 %)", sub: "1 l • 22,90 Kč/l", cat: "mleko", brand: "Mlékárna Habřina", price: 2290, stock: 150, flags: { multikup: { qty: 6, price: 1990 }, featured: true, priceMatch: true }, img: U("photo-1550583724-b2692b85b150") },
  { slug: "maslo-ceske-250g", title: "Máslo české", sub: "250 g • 199,60 Kč/kg", cat: "maslo-a-tuky", brand: "Mlékárna Habřina", price: 4990, compare: 5990, stock: 65, flags: { featured: true }, img: U("photo-1589985270826-4b7bb135bc9d") },
  { slug: "eidam-platky-30", title: "Eidam 30 % plátky", sub: "100 g • 129,00 Kč/kg", cat: "syry", brand: "Mlékárna Habřina", price: 1290, compare: 1890, stock: 88, img: U("photo-1486297678162-eb2a19b0a32d") },
  { slug: "jogurt-bily-kremovy", title: "Jogurt bílý krémový", sub: "150 g • 99,30 Kč/kg", cat: "jogurty", brand: "Mlékárna Habřina", price: 1490, stock: 110, flags: { multikup: { qty: 4, price: 1190 }, priceMatch: true }, img: U("photo-1488477181946-6428a0291777") },
  { slug: "mozzarella-v-nalevu", title: "Mozzarella v nálevu", sub: "100 g • 269,00 Kč/kg", cat: "syry", brand: "Mlékárna Habřina", price: 2690, stock: 52, img: U("photo-1628088062854-d1870b4553da") },
  { slug: "vejce-podestylkova-10", title: "Vejce z podestýlky, 10 ks", sub: "10 ks • 5,49 Kč/ks", cat: "vejce", brand: "Statek Vrbno", price: 5490, stock: 74, flags: { featured: true }, img: U("photo-1506976785307-8732e854ad03") },
  // ── Trvanlivé ──
  { slug: "testoviny-penne-500g", title: "Těstoviny penne semolinové", sub: "500 g • 53,80 Kč/kg", cat: "testoviny-a-ryze", brand: "Spížka Výběr", price: 2690, stock: 96, flags: { multikup: { qty: 3, price: 2290 } }, img: U("photo-1551462147-ff29053bfc14") },
  { slug: "ryze-jasminova-1kg", title: "Rýže jasmínová", sub: "1 kg • 44,90 Kč/kg", cat: "testoviny-a-ryze", brand: "Spížka Výběr", price: 4490, stock: 82, img: U("photo-1586201375761-83865001e31c") },
  { slug: "med-kvetovy-500g", title: "Med květový pastovaný", sub: "500 g • 259,80 Kč/kg", cat: "sladkosti", brand: "Včelařství Roj", price: 12990, stock: 28, flags: { new: true }, img: U("photo-1471943311424-646960669fbc") },
  { slug: "musli-orechove-750g", title: "Müsli ořechové zapékané", sub: "750 g • 93,20 Kč/kg", cat: "snidane-a-cerealie", brand: "Spížka Výběr", price: 6990, compare: 8990, stock: 46, img: U("photo-1517686469429-8bdb88b9f907") },
  // ── Mražené ──
  { slug: "zmrzlina-vanilkova-900ml", title: "Zmrzlina vanilková ve vaničce", sub: "900 ml • 88,80 Kč/l", cat: "zmrzliny", brand: "Mlékárna Habřina", price: 7990, stock: 34, flags: { multikup: { qty: 2, price: 6990 } }, img: U("photo-1497034825429-c343d7c6a68f") },
  { slug: "spenat-listovy-mrazeny", title: "Špenát listový mražený", sub: "400 g • 82,25 Kč/kg", cat: "mrazena-zelenina", brand: "Spížka Výběr", price: 3290, compare: 4490, stock: 58, img: U("photo-1576045057995-568f588f82fb") },
  // ── Nápoje ──
  { slug: "voda-perliva-6pack", title: "Voda perlivá, 6× 1,5 l", sub: "9 l • 6,66 Kč/l", cat: "voda", brand: "Pramen Hora", price: 5990, stock: 64, flags: { multikup: { qty: 2, price: 5290 }, priceMatch: true }, img: U("photo-1548839140-29a749e1cf4d") },
  { slug: "dzus-pomerancovy-1l", title: "Džus pomerančový 100 %", sub: "1 l • 39,90 Kč/l", cat: "limonady-a-dzusy", brand: "Pramen Hora", price: 3990, stock: 71, img: U("photo-1600271886742-f049cd451bba") },
  { slug: "kava-zrnkova-500g", title: "Káva zrnková směs arabica", sub: "500 g • 379,80 Kč/kg", cat: "kava-a-caj", brand: "Pražírna Vlna", price: 18990, compare: 23990, stock: 25, flags: { featured: true }, img: U("photo-1447933601403-0c6688de566e") },
  { slug: "ledovy-caj-citron-mata", title: "Ledový čaj citron & máta", sub: "0,5 l • 49,80 Kč/l", cat: "limonady-a-dzusy", brand: "Pramen Hora", price: 2490, stock: 60, flags: { new: true }, img: U("photo-1556679343-c7306c1976bc") },
  // ── Drogerie ──
  { slug: "toaletni-papir-8roli", title: "Toaletní papír 3vrstvý, 8 rolí", sub: "8 rolí • 11,24 Kč/role", cat: "papirove-zbozi", brand: "Čistota+", price: 8990, stock: 90, flags: { multikup: { qty: 2, price: 7990 }, priceMatch: true }, img: U("photo-1584556812952-905ffd0c611a") },
  { slug: "praci-gel-color-3l", title: "Prací gel Color, 60 dávek", sub: "3 l • 66,63 Kč/l", cat: "praci-prostredky", brand: "Čistota+", price: 19990, compare: 25990, stock: 42, img: U("photo-1583947215259-38e31be8751f") },
  // ── Pro děti ──
  { slug: "kase-ryzova-detska", title: "Dětská kaše rýžová nemléčná", sub: "300 g • 166,30 Kč/kg", cat: "kojenecka-vyziva", brand: "Dětko", price: 4990, compare: 6790, stock: 36, img: U("photo-1515488042361-ee00e0ddd4e4") },
  // ── Domácnost ──
  { slug: "uterky-kuchynske-2role", title: "Kuchyňské utěrky, 2 role", sub: "2 role • 17,45 Kč/role", cat: "kuchynske-potreby", brand: "Domov & Co", price: 3490, stock: 68, img: U("photo-1556911220-bff31c812dba") },
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
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, cat.img ?? null]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }
  for (const cat of CATEGORIES.filter(x => x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, parent_id, image_url)
       VALUES ($1,$2,$3,$4,$5,true,$6,$7) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, catIds.get(cat.parent), cat.img ?? null]
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
    const desc = `${p.title} (${p.sub}). Vybíráme denně čerstvé zboží od prověřených dodavatelů — doručíme dnes už od 14:00, minimální nákup 699 Kč a záruka spokojenosti, jinak vracíme peníze.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.sub, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: "Balení", values: ["Standard"] }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (p.compare) await link(pid, "akcni-tyden");
    if (p.flags?.new) await link(pid, "novinky");
    if (p.flags?.priceMatch) await link(pid, "zvyhodnene");
    if (p.flags?.multikup) await link(pid, "multikup");

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
       VALUES ($1,$2,$3,$4,'import','eshop-16 seed')`,
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
