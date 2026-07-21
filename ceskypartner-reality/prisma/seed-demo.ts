import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("Admin user not found, run seed.ts first");

  // Agent
  const agent = await prisma.user.upsert({
    where: { email: "eva.s@ceskypartner.cz" },
    update: {},
    create: {
      email: "eva.s@ceskypartner.cz",
      name: "Eva Svobodova",
      passwordHash: admin.passwordHash,
      role: "AGENT",
      phone: "+420 608 222 333",
    },
  });

  console.log("+ Agent:", agent.name);

  // Listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: "Penthouse s terasou, Vinohrady",
        slug: "penthouse-vinohrady",
        status: "ACTIVE",
        deal: "SALE",
        kind: "APARTMENT",
        disposition: "4+kk",
        price: 18500000,
        location: "Praha 2",
        address: "Korunni 42",
        lat: 50.0755,
        lng: 14.4378,
        area: 142,
        floor: 5,
        floors: 5,
        penb: "B",
        yearBuilt: 2022,
        ownership: "PERSONAL",
        condition: "NEW_BUILD",
        construction: "BRICK",
        description: "Luxusni penthouse s panoramatickou terasou a vyhledem na Prahu. Designovy interiér, podlahove topeni, klimatizace. Garazove stani v cene.",
        amenities: ["Terasa", "Klimatizace", "Podlahove topeni", "Garaz", "Vytah", "Smart Home"],
        tags: ["Exkluzivni", "Top nabidka"],
        featured: true,
        agentId: admin.id,
        publishedAt: new Date("2026-06-15"),
      },
    }),
    prisma.listing.create({
      data: {
        title: "Vila s bazenem, Sarka",
        slug: "vila-sarka",
        status: "ACTIVE",
        deal: "SALE",
        kind: "HOUSE",
        disposition: "6+1",
        price: 42000000,
        location: "Praha 6",
        address: "Sarkova 18",
        lat: 50.0988,
        lng: 14.3567,
        area: 380,
        landArea: 1200,
        floors: 2,
        penb: "A",
        yearBuilt: 2020,
        condition: "NEW_BUILD",
        construction: "BRICK",
        description: "Moderni vila v klidne lokalite Sarky. Vyhrivany bazen, zahrada s automatickym zavlahovanim, dvojgaraz. Prestizni adresa.",
        amenities: ["Bazen", "Zahrada", "Garaz", "Klimatizace", "Alarm", "Kamera", "Smart Home", "Sauna"],
        tags: ["Exkluzivni"],
        featured: true,
        agentId: agent.id,
        publishedAt: new Date("2026-06-10"),
      },
    }),
    prisma.listing.create({
      data: {
        title: "Loftovy byt, Karlin",
        slug: "loft-karlin",
        status: "RESERVED",
        deal: "SALE",
        kind: "APARTMENT",
        disposition: "3+kk",
        price: 12900000,
        location: "Praha 8",
        area: 98,
        floor: 3,
        floors: 4,
        penb: "C",
        yearBuilt: 2018,
        description: "Atypicky loftovy byt v revitalizovanem industrialnim objektu. Vysoke stropy, velka okna, cihlove steny.",
        amenities: ["Balkon", "Vytah", "Sklep"],
        tags: [],
        agentId: admin.id,
        publishedAt: new Date("2026-05-28"),
      },
    }),
    prisma.listing.create({
      data: {
        title: "Mezonet, Mala Strana",
        slug: "mezonet-mala-strana",
        status: "ACTIVE",
        deal: "RENT",
        kind: "APARTMENT",
        disposition: "3+kk",
        price: 45000,
        location: "Praha 1",
        area: 110,
        floor: 2,
        floors: 3,
        penb: "D",
        ownership: "PERSONAL",
        condition: "VERY_GOOD",
        construction: "BRICK",
        description: "Mezonetovy byt v historickem dome na Male Strane. Idealni pro expaty. Plne zarizeny.",
        amenities: ["Balkon", "Vytah"],
        agentId: agent.id,
        publishedAt: new Date("2026-06-20"),
      },
    }),
    prisma.listing.create({
      data: {
        title: "Rodinny dum, Pruhonice",
        slug: "rodinny-dum-pruhonice",
        status: "DRAFT",
        deal: "SALE",
        kind: "HOUSE",
        disposition: "5+1",
        price: 28500000,
        location: "Praha-vychod",
        area: 220,
        landArea: 800,
        floors: 2,
        yearBuilt: 2024,
        description: "Novostavba rodinneho domu v Pruhonicich. Dispozice 5+1, garaz pro 2 auta, zahrada.",
        amenities: ["Zahrada", "Garaz", "Podlahove topeni", "Alarm"],
        tags: ["Novostavba"],
        agentId: admin.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "Stavebni pozemek, Ricany",
        slug: "pozemek-ricany",
        status: "ACTIVE",
        deal: "SALE",
        kind: "LAND",
        price: 5200000,
        location: "Praha-vychod",
        landArea: 1200,
        description: "Rovinatý stavebni pozemek v klidne casti Rican. Vsechny site na hranici pozemku. Uzemni plan - bydleni.",
        amenities: [],
        agentId: agent.id,
        publishedAt: new Date("2026-06-25"),
      },
    }),
  ]);

  console.log(`+ ${listings.length} nemovitosti`);

  // Blog posts
  const posts = await Promise.all([
    prisma.blogPost.create({
      data: {
        title: "Trendy na prazskem realitnim trhu 2026",
        slug: "trendy-praha-2026",
        excerpt: "Analyza aktualniho vyvoje cen nemovitosti v Praze a predikce pro druhou polovinu roku 2026.",
        content: "<h2>Vyvoj cen v prvnim pololeti</h2><p>Prazsky realitni trh zaznamenal v prvnim pololeti 2026 mirny rust cen, ktery se pohyboval okolo 5-7% mezironne. Nejvetsi zajem je tradične o byty 2+kk a 3+kk v sirsim centru.</p><h2>Predikce na druhe pololeti</h2><p>Ocekavame pokracovani mirneho rustu, podporeneho stabilnimi urokovymi sazbami a omezenou nabidkou novych bytu.</p>",
        status: "PUBLISHED",
        tags: ["trh", "analyza", "Praha"],
        authorId: admin.id,
        publishedAt: new Date("2026-07-01"),
      },
    }),
    prisma.blogPost.create({
      data: {
        title: "Jak pripravit nemovitost na prodej",
        slug: "priprava-nemovitosti-prodej",
        excerpt: "Kompletni pruvodce home stagingem a pripravou nemovitosti pro maximalni prodejni cenu.",
        content: "<h2>Proc je home staging dulezity</h2><p>Profesionalne pripravena nemovitost se proda az o 30% rychleji a za 5-10% vyssi cenu nez nepripravena.</p><h2>5 zakladnich kroku</h2><ol><li>Deklutter - zbavte se nepotrebnych veci</li><li>Opravy - opravte drobne zavady</li><li>Malba - neutralni barvy</li><li>Osvetleni - svetle prostory</li><li>Fotografie - profesionalni foceni</li></ol>",
        status: "PUBLISHED",
        tags: ["prodej", "home staging", "tipy"],
        authorId: agent.id,
        publishedAt: new Date("2026-06-20"),
      },
    }),
    prisma.blogPost.create({
      data: {
        title: "Investice do nemovitosti: pruvodce",
        slug: "investice-nemovitosti-pruvodce",
        excerpt: "Vsechno co potrebujete vedet o investovani do nemovitosti v CR.",
        content: "<h2>Proc investovat do nemovitosti</h2><p>Nemovitosti patri mezi nejstabilnejsi investice s dlouhodobym zhodnocenim. V CR rostou ceny nemovitosti prumerne o 5-8% rocne.</p>",
        status: "DRAFT",
        tags: ["investice", "pruvodce"],
        authorId: admin.id,
      },
    }),
  ]);

  console.log(`+ ${posts.length} blog clanku`);

  // Contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        name: "Jan Novotny",
        email: "jan.novotny@email.cz",
        phone: "+420 777 111 222",
        message: "Dobry den, mam zajem o prohlidku penthousu na Vinohradech. Kdy by to bylo mozne?",
        status: "NEW",
        listingId: listings[0].id,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Marie Kralova",
        email: "marie.kr@seznam.cz",
        phone: "+420 608 333 444",
        message: "Prosim o vice informaci k vile v Sarce. Zajima me moznost financovani.",
        status: "IN_PROGRESS",
        listingId: listings[1].id,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Lucie Hajkova",
        email: "lucie.h@gmail.com",
        phone: "+420 773 888 999",
        message: "Chci prodat byt 2+1 v Dejvicich. Muzete mi dat odhad ceny?",
        status: "NEW",
      },
    }),
  ]);

  // Notes
  await prisma.contactNote.create({
    data: {
      content: "Volala jsem pani Kralove, domluvena prohlidka na 12.7.",
      contactId: contacts[1].id,
      authorId: agent.id,
    },
  });

  console.log(`+ ${contacts.length} poptavek`);

  // Portal exports
  await Promise.all([
    prisma.portalExport.create({
      data: {
        portal: "SREALITY",
        status: "SYNCED",
        externalId: "SR-284619",
        listingId: listings[0].id,
        lastSyncAt: new Date(),
      },
    }),
    prisma.portalExport.create({
      data: {
        portal: "BEZREALITKY",
        status: "SYNCED",
        externalId: "BR-91284",
        listingId: listings[0].id,
        lastSyncAt: new Date(),
      },
    }),
    prisma.portalExport.create({
      data: {
        portal: "SREALITY",
        status: "SYNCED",
        externalId: "SR-284502",
        listingId: listings[1].id,
        lastSyncAt: new Date(),
      },
    }),
    prisma.portalExport.create({
      data: {
        portal: "BEZREALITKY",
        status: "ERROR",
        errorLog: "Chybi povinne pole: energeticky stitek",
        listingId: listings[3].id,
      },
    }),
  ]);

  console.log("+ Portal exporty");

  // Settings
  await Promise.all([
    prisma.setting.upsert({
      where: { key: "company_name" },
      update: {},
      create: { key: "company_name", value: "Cesky Partner s.r.o." },
    }),
    prisma.setting.upsert({
      where: { key: "company_email" },
      update: {},
      create: { key: "company_email", value: "info@ceskypartner.cz" },
    }),
    prisma.setting.upsert({
      where: { key: "company_phone" },
      update: {},
      create: { key: "company_phone", value: "+420 224 000 111" },
    }),
    prisma.setting.upsert({
      where: { key: "company_address" },
      update: {},
      create: { key: "company_address", value: "Parizska 28, Praha 1" },
    }),
    prisma.setting.upsert({
      where: { key: "meta_title" },
      update: {},
      create: { key: "meta_title", value: "Cesky Partner | Realitni kancelar" },
    }),
    prisma.setting.upsert({
      where: { key: "meta_description" },
      update: {},
      create: { key: "meta_description", value: "Premiove nemovitosti v Ceske republice." },
    }),
  ]);

  console.log("+ Nastaveni");
  console.log("\nDone! Demo data naplnena.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
