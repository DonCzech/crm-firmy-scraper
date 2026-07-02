import pg from "pg";
import { readFileSync } from "fs";

const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();

// AURÉLIE Clinic — premium estetická dermatologie & medicínská kosmetika
// Tenant: clinic-02-v2 (id 525), home page_id 1385

const updates = [
  // ── 3849 navbar ──
  {
    id: 3849,
    content: {
      siteName: "AURÉLIE",
      siteTagline: "CLINIC",
      phone: "+420 234 567 890",
      ctaHref: "/kontakt",
      igHref: "https://instagram.com/aurelie.clinic",
      fbHref: "https://facebook.com/aurelie.clinic",
      links: [
        { label: "ZÁKROKY", href: "/sluzby" },
        { label: "O KLINICE", href: "/o-nas" },
        { label: "CENÍK", href: "/sluzby" },
        { label: "BLOG", href: "/o-nas" },
        { label: "KONTAKT", href: "/kontakt" },
      ],
    },
  },

  // ── 3850 hero clinic-02-hero ──
  {
    id: 3850,
    content: {
      title: "PŘIROZENÁ KRÁSA V RUKOU ŠPIČKOVÝCH LÉKAŘŮ",
      tagline:
        "Zvýrazněte svůj osobitý charakter a každý den se probouzejte s pocitem, že vypadáte přesně tak, jak se cítíte. Kombinujeme nejnovější medicínskou estetiku se vkusem a citem pro detail.",
      ctaText: "Online rezervace",
      ctaHref: "/kontakt",
    },
  },

  // ── 3851 about clinic-02-about ──
  {
    id: 3851,
    content: {
      kicker: "Klinika s tradicí od roku 2008",
      title: "Estetická medicína bez kompromisů",
      body:
        "Aurélie Clinic je rodinná klinika estetické dermatologie v centru Prahy, kterou založila MUDr. Marie Hladíková se svým týmem. Specializujeme se na zákroky, které respektují vaši přirozenost — nikdy nepřetváříme, jen umně zvýrazňujeme. Pracujeme výhradně s certifikovanými preparáty Allergan, Galderma a Merz a investujeme do nejmodernějších přístrojů (Ultraformer III, Fotona SP Dynamis, M22).",
      ctaText: "Více o klinice",
      ctaHref: "/o-nas",
      features: [
        "Tým 6 atestovaných dermatologů a plastických chirurgů",
        "Pouze originální preparáty Allergan, Galderma, Merz",
        "Bezplatná vstupní konzultace s lékařem (45 minut)",
        "Diskrétní VIP zóna a soukromý vchod ze dvora",
        "Více než 18 000 spokojených klientů",
        "Garance vrácení peněz při neuspokojivém výsledku",
      ],
    },
  },

  // ── 3852 services clinic-02-services ──
  {
    id: 3852,
    content: {
      kicker: "Naše nejvyhledávanější zákroky",
      title: "Oblíbená ošetření",
      services: [
        {
          name: "Botulotoxin proti vráskám",
          description:
            "Jemné a přirozené uhlazení mimických vrásek na čele, mezi obočím a kolem očí. Originální Botox® od Allergan, výsledek nastupuje do 5 dnů a vydrží 4–6 měsíců.",
          price: "od 3 900 Kč",
          ctaText: "Více info",
          ctaHref: "/sluzby",
        },
        {
          name: "Výplně rtů a tváří",
          description:
            "Modelace rtů, vyplnění nosoretních rýh a obnova ztracených objemů kyselinou hyaluronovou Juvéderm Vycross®. Výsledek je viditelný okamžitě a vydrží 9–12 měsíců.",
          price: "od 6 900 Kč",
          ctaText: "Více info",
          ctaHref: "/sluzby",
        },
        {
          name: "Ultraformer HIFU lifting",
          description:
            "Neinvazivní lifting obličeje, krku a dekoltu fokusovaným ultrazvukem. Jediné ošetření zpevní pleť na 12 měsíců dopředu — bez jehly, bez rekonvalescence.",
          price: "od 14 900 Kč",
          ctaText: "Více info",
          ctaHref: "/sluzby",
        },
      ],
    },
  },

  // ── 3853 promo clinic-02-promo ──
  {
    id: 3853,
    content: {
      kicker: "Nezávazná konzultace",
      title: "Vstupní konzultace ZDARMA",
      message:
        "Nevíte, který zákrok je ten pravý? Rezervujte si 45 minut s naším lékařem zdarma. Probereme spolu vaše přání, prohlédneme pleť pomocí Visia analýzy a sestavíme plán ošetření na míru — bez závazku a bez nátlaku.",
      detail:
        "Konzultace zahrnuje VISIA SkinAnalysis (3D analýza pleti), individuální doporučení a cenovou kalkulaci. Pokud se rozhodnete pro zákrok do 30 dnů, hodnotu konzultace 1 500 Kč vám odečteme z ceny.",
      ctaText: "Rezervovat konzultaci",
      ctaHref: "/kontakt",
    },
  },

  // ── 3854 testimonials clinic-02-testimonials ──
  {
    id: 3854,
    content: {
      kicker: "5,0 hvězdiček na Google a 4,9 na Heureka",
      title: "Co o nás říkají klientky",
      googleRating: "5.0",
      googleCount: "482 recenzí",
      testimonials: [
        {
          text:
            "Po doporučení kamarádky jsem šla na konzultaci a okamžitě jsem věděla, že jsem na správném místě. Doktorka Hladíková mi nic nevnucovala, naopak mě od některých zákroků odrazovala. Výsledek? Vypadám odpočatě, ne jinak. Přesně tak, jak jsem chtěla.",
          author: "Tereza K.",
          role: "Botox + výplň nosoretních rýh",
          rating: 5,
        },
        {
          text:
            "Mám za sebou tři ošetření Ultraformerem a rozdíl je neuvěřitelný. Pleť je pevnější, ovál obličeje výraznější. Personál je profesionální, čeká se maximálně 5 minut a všechno proběhne přesně podle plánu. Doporučuji všem nad 35.",
          author: "Markéta P.",
          role: "Ultraformer HIFU lifting",
          rating: 5,
        },
        {
          text:
            "Bála jsem se botoxu roky. Aurélie mi ho udělala tak přirozeně, že si nikdo nevšiml, jen mi všichni říkali, že vypadám odpočatě. Cena odpovídá kvalitě, prostředí je krásné a paní recepční je naprostý anděl. Jdu zase za půl roku.",
          author: "Jana M.",
          role: "Botulotoxin čelo a oči",
          rating: 5,
        },
      ],
    },
  },

  // ── 3855 cta clinic-02-cta ──
  {
    id: 3855,
    content: {
      kicker: "Newsletter Aurélie",
      title: "Sleva 10 % na první ošetření",
      message:
        "Přihlaste se k odběru novinek a získáte voucher na 10% slevu na první zákrok do hodnoty 5 000 Kč. Plus jednou měsíčně dostanete tipy našich lékařů, exkluzivní akce a pozvánky na uzavřené eventy.",
      ctaText: "Přihlásit k odběru",
      ctaHref: "/kontakt",
      inputPlaceholder: "Vaše e-mailová adresa",
    },
  },

  // ── 3856 contact clinic-02-contact ──
  {
    id: 3856,
    content: {
      kicker: "Jsme tu pro vás",
      title: "Kontaktujte nás",
      address: "Vinohradská 2828/151, 130 00 Praha 3 — Vinohrady",
      phone: "+420 234 567 890",
      email: "info@aurelie-clinic.cz",
      hours: [
        { days: "Pondělí – Pátek", time: "8:00 – 20:00" },
        { days: "Sobota", time: "9:00 – 14:00" },
        { days: "Neděle", time: "zavřeno" },
      ],
      ctaText: "Zavolat nyní",
    },
  },

  // ── 3857 footer clinic-02-footer ──
  {
    id: 3857,
    content: {
      siteName: "AURÉLIE CLINIC",
      tagline: "Klinika estetické dermatologie & medicínské kosmetiky v centru Prahy.",
      address: "Vinohradská 2828/151, 130 00 Praha 3",
      phone: "+420 234 567 890",
      email: "info@aurelie-clinic.cz",
      hours: [
        { days: "Po – Pá", time: "8:00 – 20:00" },
        { days: "Sobota", time: "9:00 – 14:00" },
      ],
      facebook: "https://facebook.com/aurelie.clinic",
      instagram: "https://instagram.com/aurelie.clinic",
      links: [
        { label: "Zákroky", href: "/sluzby" },
        { label: "O klinice", href: "/o-nas" },
        { label: "Ceník", href: "/sluzby" },
        { label: "Kontakt", href: "/kontakt" },
      ],
      copyright: "© 2026 Aurélie Clinic s.r.o. Všechna práva vyhrazena.",
    },
  },
];

for (const u of updates) {
  await c.query(
    "UPDATE sections SET content_overrides = $1::jsonb WHERE id = $2",
    [JSON.stringify(u.content), u.id]
  );
  console.log(`✓ Updated section id=${u.id}`);
}

await c.end();
console.log("\nDone — clinic-02-v2 home content rewritten as AURÉLIE Clinic.");
