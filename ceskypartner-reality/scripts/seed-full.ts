const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const UNSPLASH = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;

const LISTINGS_DATA = [
  // ─── SALE ────────────────────────
  {
    title: "Byt 3+kk, Dejvice",
    slug: "byt-3kk-dejvice",
    deal: "SALE",
    kind: "APARTMENT",
    disposition: "3+kk",
    price: 9850000,
    location: "Praha 6 - Dejvice",
    address: "Evropska 15, Praha 6",
    lat: 50.1003,
    lng: 14.3951,
    area: 78,
    floor: 3,
    floors: 5,
    penb: "C",
    yearBuilt: 2018,
    description: "Moderni byt 3+kk v novostavbe s balkone a garazi. Klidna lokalita, skvela dostupnost metra.",
    amenities: ["Balkon", "Garaz", "Sklep", "Vytah"],
    tags: ["novostavba", "balkon", "garaz"],
    featured: true,
    images: [
      "photo-1560448204-e02f11c3d0e2",
      "photo-1502672260266-1c1ef2d93688",
      "photo-1560185127-6ed189bf02f4",
      "photo-1600596542815-ffad4c1539a9",
    ],
  },
  {
    title: "Rodinny dum, Cernosice",
    slug: "rodinny-dum-cernosice",
    deal: "SALE",
    kind: "HOUSE",
    disposition: "5+1",
    price: 14500000,
    location: "Cernosice",
    address: "Pod Lesem 8, Cernosice",
    lat: 49.9601,
    lng: 14.3245,
    area: 185,
    landArea: 620,
    floors: 2,
    penb: "B",
    yearBuilt: 2015,
    description: "Prostorny rodinny dum v klidne ulici s velkkou zahradou. Garaz pro 2 auta, terasou a krbem.",
    amenities: ["Zahrada", "Garaz", "Krb", "Terasa", "Bazen"],
    tags: ["zahrada", "garaz", "bazen"],
    featured: true,
    images: [
      "photo-1600585154340-be6161a56a0c",
      "photo-1600566753376-12c8ab7c17a4",
      "photo-1600573472556-e636c2acda9e",
      "photo-1600047509807-ba8f99d2cdde",
    ],
  },
  {
    title: "Atelier 1+kk, Holesovice",
    slug: "atelier-1kk-holesovice",
    deal: "SALE",
    kind: "APARTMENT",
    disposition: "1+kk",
    price: 4250000,
    location: "Praha 7 - Holesovice",
    address: "Komunardu 30, Praha 7",
    lat: 50.1053,
    lng: 14.4406,
    area: 38,
    floor: 5,
    floors: 6,
    penb: "B",
    yearBuilt: 2020,
    description: "Kompaktni atelier v top pate s vyhledem na Vltavu. Idealni pro single nebo jako investice.",
    amenities: ["Vytah", "Sklep", "Lodzie"],
    tags: ["novostavba", "vyhledy", "investice"],
    featured: false,
    images: [
      "photo-1522708323590-d24dbb6b0267",
      "photo-1560185893-a55cbc8c57e8",
      "photo-1600210492493-0946911123ea",
    ],
  },
  {
    title: "Byt 4+kk, Smichov",
    slug: "byt-4kk-smichov",
    deal: "SALE",
    kind: "APARTMENT",
    disposition: "4+kk",
    price: 13900000,
    location: "Praha 5 - Smichov",
    address: "Nadrazni 40, Praha 5",
    lat: 50.0694,
    lng: 14.4043,
    area: 112,
    floor: 4,
    floors: 7,
    penb: "B",
    yearBuilt: 2019,
    description: "Velkorysy byt 4+kk v rezidenci na Smichove. Dva balkony, garazove stani, komorou.",
    amenities: ["Balkon", "Garaz", "Komora", "Vytah"],
    tags: ["rezidence", "dva-balkony"],
    featured: true,
    images: [
      "photo-1600607687939-ce8a6c25118c",
      "photo-1600566753190-17f0baa2a6c3",
      "photo-1600585154526-990dced4db0d",
      "photo-1600210491369-e753d80a41f3",
    ],
  },

  // ─── RENT ────────────────────────
  {
    title: "Byt 2+kk, Vinohrady",
    slug: "byt-2kk-vinohrady-pronajem",
    deal: "RENT",
    kind: "APARTMENT",
    disposition: "2+kk",
    price: 28000,
    priceNote: "mesicne + energie",
    location: "Praha 2 - Vinohrady",
    address: "Italska 12, Praha 2",
    lat: 50.0759,
    lng: 14.4378,
    area: 55,
    floor: 2,
    floors: 4,
    penb: "D",
    yearBuilt: 1935,
    description: "Krasny byt v cinzovnim dome na Vinohradech. Zarizen, ihned k nastohovani.",
    amenities: ["Zarizen", "Sklep", "Parkování v ulici"],
    tags: ["zarizen", "vinohrady"],
    featured: false,
    images: [
      "photo-1493809842364-78817add7ffb",
      "photo-1560448075-cbc16bb4af8e",
      "photo-1600121848594-d8644e57abab",
    ],
  },
  {
    title: "Byt 3+1, Letna",
    slug: "byt-3plus1-letna-pronajem",
    deal: "RENT",
    kind: "APARTMENT",
    disposition: "3+1",
    price: 35000,
    priceNote: "mesicne + energie",
    location: "Praha 7 - Letna",
    address: "Milady Horakove 60, Praha 7",
    lat: 50.0998,
    lng: 14.4276,
    area: 82,
    floor: 3,
    floors: 5,
    penb: "C",
    yearBuilt: 1928,
    description: "Prostorny byt po rekonstrukci na Letne. Vysoke stropy, drevene podlahy, blizko parku.",
    amenities: ["Rekonstrukce", "Drevene podlahy", "Sklep"],
    tags: ["rekonstrukce", "letna-park"],
    featured: true,
    images: [
      "photo-1600596542815-ffad4c1539a9",
      "photo-1560185127-6ed189bf02f4",
      "photo-1600210492493-0946911123ea",
      "photo-1560448204-e02f11c3d0e2",
    ],
  },
  {
    title: "Rodinny dum, Klanovice",
    slug: "rodinny-dum-klanovice-pronajem",
    deal: "RENT",
    kind: "HOUSE",
    disposition: "4+1",
    price: 45000,
    priceNote: "mesicne",
    location: "Praha 9 - Klanovice",
    address: "Lesni 22, Klanovice",
    lat: 50.0825,
    lng: 14.6457,
    area: 150,
    landArea: 450,
    floors: 2,
    penb: "B",
    yearBuilt: 2016,
    description: "Moderni rodinny dum s garazii a zahradou v zelene casti Prahy. Klidne bydleni.",
    amenities: ["Zahrada", "Garaz", "Terasa", "Zahradni domek"],
    tags: ["zahrada", "garaz", "klanovice"],
    featured: false,
    images: [
      "photo-1600047509807-ba8f99d2cdde",
      "photo-1600585154340-be6161a56a0c",
      "photo-1600573472556-e636c2acda9e",
    ],
  },
  {
    title: "Loft, Karlin",
    slug: "loft-karlin-pronajem",
    deal: "RENT",
    kind: "APARTMENT",
    disposition: "2+kk",
    price: 32000,
    priceNote: "mesicne + poplatky",
    location: "Praha 8 - Karlin",
    address: "Krizikova 75, Praha 8",
    lat: 50.0921,
    lng: 14.4516,
    area: 68,
    floor: 4,
    floors: 5,
    penb: "B",
    yearBuilt: 2017,
    description: "Designovy loft v Karline s vysokymi stropy a industralnim stylem. Zarizen.",
    amenities: ["Zarizen", "Vytah", "Kolo-stojany"],
    tags: ["loft", "karlin", "design"],
    featured: false,
    images: [
      "photo-1502672260266-1c1ef2d93688",
      "photo-1522708323590-d24dbb6b0267",
      "photo-1560185893-a55cbc8c57e8",
    ],
  },

  // ─── INVESTMENT ──────────────────
  {
    title: "Cinzovni dum, Zizkov",
    slug: "cinzovni-dum-zizkov",
    deal: "INVESTMENT",
    kind: "COMMERCIAL",
    disposition: "12 bytovych jednotek",
    price: 42000000,
    location: "Praha 3 - Zizkov",
    address: "Seifertova 55, Praha 3",
    lat: 50.0876,
    lng: 14.4465,
    area: 780,
    landArea: 320,
    floors: 5,
    penb: "D",
    yearBuilt: 1910,
    description: "Kompletne pronajaty cinzovni dum s 12 byty. Rocni vynos 4.8%. Stabilni najemnici.",
    amenities: ["Dvur", "Sklepy", "Puda k vstavbe"],
    tags: ["cinzak", "4.8% vynos", "plne pronajaty"],
    featured: true,
    images: [
      "photo-1486406146926-c627a92ad1ab",
      "photo-1460317442991-0ec209397118",
      "photo-1600596542815-ffad4c1539a9",
      "photo-1560448204-e02f11c3d0e2",
    ],
  },
  {
    title: "Komercni prostor, Andel",
    slug: "komercni-prostor-andel",
    deal: "INVESTMENT",
    kind: "COMMERCIAL",
    disposition: "obchodni plocha",
    price: 8900000,
    location: "Praha 5 - Andel",
    address: "Stefanikova 18, Praha 5",
    lat: 50.0706,
    lng: 14.4028,
    area: 120,
    floor: 0,
    floors: 1,
    penb: "C",
    yearBuilt: 2005,
    description: "Obchodni prostor v prime ulici u Andela. Dlouhodoby najemce, vynos 5.2%.",
    amenities: ["Vytah na zbozi", "Klimatizace", "Alarm"],
    tags: ["obchod", "5.2% vynos", "andel"],
    featured: true,
    images: [
      "photo-1497366216548-37526070297c",
      "photo-1497366811353-6870744d04b2",
      "photo-1486406146926-c627a92ad1ab",
    ],
  },
  {
    title: "Developersky projekt, Modricany",
    slug: "developersky-projekt-modrany",
    deal: "INVESTMENT",
    kind: "LAND",
    disposition: "pozemek + projekt",
    price: 28000000,
    location: "Praha 12 - Modrany",
    address: "K Vltave, Praha 12",
    lat: 50.0164,
    lng: 14.4183,
    area: 2400,
    landArea: 2400,
    penb: "A",
    description: "Pozemek s pravomocnym uzemnim rozhodnutim pro 24 bytovych jednotek. Stavebni povoleni v priprave.",
    amenities: ["Inzenyrske site", "Uzemni rozhodnuti", "Studie"],
    tags: ["development", "24 bytu", "vltava"],
    featured: false,
    images: [
      "photo-1504307651254-35680f356dfd",
      "photo-1460317442991-0ec209397118",
      "photo-1497366216548-37526070297c",
    ],
  },
  {
    title: "Bytovy dum, Smichov City",
    slug: "bytovy-dum-smichov-city",
    deal: "INVESTMENT",
    kind: "COMMERCIAL",
    disposition: "18 bytovych jednotek",
    price: 65000000,
    location: "Praha 5 - Smichov",
    address: "Kinskeho zahrada, Praha 5",
    lat: 50.0723,
    lng: 14.3987,
    area: 1200,
    floors: 6,
    penb: "B",
    yearBuilt: 2022,
    description: "Novostavba bytoveho domu ve Smichov City. Plna obsazenost, rocni vynos 4.5%.",
    amenities: ["Garaz", "Vytah", "Recepcni sluzba"],
    tags: ["novostavba", "4.5% vynos", "smichov-city"],
    featured: true,
    images: [
      "photo-1486406146926-c627a92ad1ab",
      "photo-1497366811353-6870744d04b2",
      "photo-1600607687939-ce8a6c25118c",
      "photo-1497366216548-37526070297c",
    ],
  },
];

const BLOG_DATA = [
  {
    title: "5 tipu jak zvysit hodnotu nemovitosti pred prodejem",
    slug: "5-tipu-zvysit-hodnotu-nemovitosti",
    excerpt: "Jednoduche a cenove dostupne upravy, ktere mohou zvysit prodejni cenu vasi nemovitosti az o 15%.",
    content: `<h2>1. Prvni dojem rozhoduje</h2><p>Investice do fasady, vstupnich dveri a zahradni upravy se vrati mnohonasobne. Kupujici si delaji nazor behem prvnich 30 sekund.</p><h2>2. Koupelna a kuchyne</h2><p>Nejvetsi navratnost maji rekonstrukce koupelen a kuchyni. Staci i drobne zmeny — nove baterie, osvetleni nebo pracovni deska.</p><h2>3. Home staging</h2><p>Profesionalni home staging zvysi vnimanu hodnotu o 5-15%. Depersonalizace a neutralni barvy pomahaji kupujicim se lepe vcitit.</p><h2>4. Energeticka usporna opatreni</h2><p>Zatepleni, nova okna nebo tepelne cerpadlo nejen snizi naklady, ale take zvysi energeticky stitek nemovitosti.</p><h2>5. Profesionalni fotky a video</h2><p>90% kupujicich zacina hledani online. Kvalitni prezentace s drony a 3D prohlidkami pritahne vice zajemcu.</p>`,
    tags: ["tipy", "prodej", "hodnota"],
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop&q=80",
  },
  {
    title: "Praha vs. regiony: kde se vyplati investovat v roce 2026",
    slug: "praha-vs-regiony-investice-2026",
    excerpt: "Porovnani vynosu, rust cen a rizikovych faktoru pri investovani do nemovitosti v Praze a regionech.",
    content: `<h2>Prazsky trh: stabilita za premii</h2><p>Praha nabizi nizsi vynosy (3-5%), ale vyssi stabilitu a likviditu. Obsazenost bytovych domu presahuje 98%.</p><h2>Regionalni mesta: vyssi vynosy, vyssi riziko</h2><p>Brno, Ostrava a Plzen nabizeji vynosy 5-8%, ale s vetsim rizikem neobsazenosti a pomalejsim rustem cen.</p><h2>Satelitni lokality: zlaty stred?</h2><p>Oblasti jako Ricany, Pruhonice nebo Cernosice kombinuji dostupnejsi ceny s blizkou Prahy. Rust cen zde dosahuje 8-12% rocne.</p><h2>Nase doporuceni</h2><p>Pro konzervativni investory doporucujeme Prahu. Pro ty, kteri hledaji vyssi vynos a jsou ochotni aktivneji spravovat, regionalni mesta nabizi zajimave prilezitosti.</p>`,
    tags: ["investice", "analyza", "2026"],
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop&q=80",
  },
  {
    title: "Pravni minimum: na co si dat pozor pri koupi bytu",
    slug: "pravni-minimum-koupee-bytu",
    excerpt: "Prehled nejcastejsich pravnich pasti pri koupi nemovitosti a jak se jim vyhnout.",
    content: `<h2>Kontrola katastru nemovitosti</h2><p>Proverite list vlastnictvi, vecna bremena, zastavni prava a pripadne exekuce. To je zakladni krok pred jakoukoli koupi.</p><h2>Prohlaseni vlastnika a stanovy SVJ</h2><p>U bytovych jednotek si procte prohlaseni vlastnika a stanovy SVJ. Zjistete vysi fondu oprav a planovane investice.</p><h2>Advokátni uschova</h2><p>Nikdy neprevadjejte penize primo prodavajicimu. Advokátni uschova je jediny bezpecny zpusob prevodu kupni ceny.</p><h2>Energeticky prukaz</h2><p>Prodavajici je ze zakona povinen predlozit prukaz energeticke narocnosti budovy (PENB). Bez nej hrozi pokuta az 100 000 Kc.</p>`,
    tags: ["pravo", "tipy", "koupee"],
    coverImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop&q=80",
  },
  {
    title: "Hypotecni trh 2026: co ocekavat od urovych sazeb",
    slug: "hypotecni-trh-2026-urokove-sazby",
    excerpt: "Analyza aktualniho vyvoje hypotek, prognoza sazeb a doporuceni pro kupujici.",
    content: `<h2>Aktualni stav</h2><p>Prumerna urokova sazba hypotek se v prvnim pololeti 2026 ustálila na 4.2%. To je pokles oproti 5.8% na konci roku 2024.</p><h2>Prognoza</h2><p>Analytici ocekavaji dalsi mirny pokles sazeb na 3.8-4.0% do konce roku. CNB signalizuje mozne snizeni zakladni sazby.</p><h2>Co to znamena pro kupujici</h2><p>Pokles sazby o 0.5% u hypoteky 4 mil. Kc na 25 let znamena usporu priblizne 600 Kc mesicne, tedy 180 000 Kc za celou dobu splaceni.</p><h2>Nase doporuceni</h2><p>Pokud najdete vhodnou nemovitost, necekat. Ceny nemovitosti rostou rychleji nez klesaji uroky. Fixace na 3-5 let je aktualne optimalni.</p>`,
    tags: ["hypoteky", "finance", "2026"],
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&q=80",
  },
  {
    title: "Novostavby vs. stare byty: vyhody a nevyhody",
    slug: "novostavby-vs-stare-byty",
    excerpt: "Detailni srovnani novostaveb a starsich bytu z hlediska ceny, kvality a investicniho potencialu.",
    content: `<h2>Novostavby</h2><p><strong>Vyhody:</strong> Moderni dispozice, nizke naklady na vytapeni (PENB A-B), garazove stani, balkon/terasa standard, zaruka 5 let.</p><p><strong>Nevyhody:</strong> Vyssi cena za m2, casto mensi mistnosti, satelitni lokality, nekdy nizsi kvalita stavby.</p><h2>Stare byty</h2><p><strong>Vyhody:</strong> Sirsi centrum, vysoke stropy, vetsi mistnosti, zavedenä lokalita, casto nizsi cena za m2.</p><p><strong>Nevyhody:</strong> Vyssi naklady na energie, potreba rekonstrukce, stare rozvody, cas omezena parkovani.</p><h2>Verdikt</h2><p>Pro vlastni bydleni doporucujeme zvazit obe moznosti podle lokality. Pro investici vychazi novostavby lepe diky nizsim provoznim nakladum a snadnejsimu pronajmu.</p>`,
    tags: ["srovnani", "novostavby", "rady"],
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=450&fit=crop&q=80",
  },
];

async function main() {
  // Find the admin user for agent/author
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    console.error("No ADMIN user found! Run the app first to create one.");
    process.exit(1);
  }
  console.log("Using admin:", admin.name, admin.id);

  // Also fix existing listings: set DRAFT/RESERVED to ACTIVE
  const fixed = await prisma.listing.updateMany({
    where: { status: { in: ["DRAFT", "RESERVED"] } },
    data: { status: "ACTIVE", publishedAt: new Date() },
  });
  console.log(`Fixed ${fixed.count} existing listings to ACTIVE`);

  // Also set existing Mezonet to featured
  await prisma.listing.updateMany({
    where: { slug: "mezonet-mala-strana" },
    data: { featured: true },
  });

  // Create new listings
  for (const data of LISTINGS_DATA) {
    const existing = await prisma.listing.findUnique({ where: { slug: data.slug } });
    if (existing) {
      console.log(`  SKIP (exists): ${data.title}`);
      continue;
    }

    const { images, ...listingData } = data;

    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        status: "ACTIVE",
        publishedAt: new Date(Date.now() - Math.random() * 30 * 86400000),
        agentId: admin.id,
      },
    });

    // Add images
    for (let i = 0; i < images.length; i++) {
      await prisma.media.create({
        data: {
          url: UNSPLASH(images[i]),
          key: `seed/${data.slug}/${i}`,
          filename: `${data.slug}-${i}.jpg`,
          mimeType: "image/jpeg",
          size: 150000 + Math.floor(Math.random() * 100000),
          width: 1200,
          height: 800,
          alt: data.title,
          order: i,
          listingId: listing.id,
        },
      });
    }

    console.log(`  + ${data.deal} ${data.kind}: ${data.title} (${images.length} imgs)`);
  }

  // Create blog posts
  for (const data of BLOG_DATA) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
    if (existing) {
      console.log(`  SKIP blog (exists): ${data.title}`);
      continue;
    }

    await prisma.blogPost.create({
      data: {
        ...data,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - Math.random() * 60 * 86400000),
        authorId: admin.id,
      },
    });
    console.log(`  + BLOG: ${data.title}`);
  }

  // Also publish existing DRAFT blog
  await prisma.blogPost.updateMany({
    where: { status: "DRAFT" },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  // Summary
  const counts = {
    sale: await prisma.listing.count({ where: { status: "ACTIVE", deal: "SALE" } }),
    rent: await prisma.listing.count({ where: { status: "ACTIVE", deal: "RENT" } }),
    investment: await prisma.listing.count({ where: { status: "ACTIVE", deal: "INVESTMENT" } }),
    blogs: await prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    images: await prisma.media.count(),
  };
  console.log("\n=== SUMMARY ===");
  console.log(`SALE: ${counts.sale} | RENT: ${counts.rent} | INVESTMENT: ${counts.investment}`);
  console.log(`BLOGS: ${counts.blogs} | IMAGES: ${counts.images}`);

  await prisma.$disconnect();
}

main().catch(console.error);
