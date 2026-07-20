import { TemplateDefinition } from "./types";

const SITE_NAME = "The Barber Studio";
const ACCENT = "#C9A84C";
const PHONE = "+420 704 123 456";
const EMAIL = "email@demo.cz";
const ADDRESS = "Náměstí Svobody 5, Brno";

const navLinks = [
  { label: "O nás",   href: "/o-nas" },
  { label: "Služby",  href: "/sluzby" },
  { label: "Galerie", href: "/galerie" },
  { label: "Kontakt", href: "/kontakt" },
];

const navbarContent = {
  siteName: SITE_NAME,
  logoUrl: "/images/logos/demo-barber-logo.svg",
  links: navLinks,
  ctaText: "Rezervovat",
  ctaHref: "#rezervace",
  phone: PHONE,
  address: ADDRESS,
  hoursLabel: "Po–Pá 9:00–20:00 · So 9:00–14:00",
  socials: [
    { icon: "instagram", href: "https://instagram.com/" },
    { icon: "facebook",  href: "https://facebook.com/" },
  ],
  announcementText: "Nová místa k dispozici — rezervujte online ihned",
};

const footerContent = {
  siteName: SITE_NAME,
  tagline: "Autentická péče pro moderního muže",
  links: navLinks,
  phone: PHONE,
  email: EMAIL,
  address: ADDRESS,
  copyright: `© ${new Date().getFullYear()} The Barber Studio. Všechna práva vyhrazena.`,
};

export const barberTemplate: TemplateDefinition = {
  key: "barber-01",
  name: "Barber — Dark Luxury",
  industry: "barber",
  version: "1.0.0",

  designTokens: {
    colorPrimary: ACCENT,
    colorSecondary: "#1A1A1A",
    colorBackground: "#111111",
    colorSurface: "#1E1E1E",
    colorText: "#F5F5F5",
    colorTextMuted: "#A0A0A0",
    colorAccent: ACCENT,
    colorBorder: "#2A2A2A",
    fontHeading: "Montserrat, sans-serif",
    fontBody: "Inter, sans-serif",
    borderRadius: "4px",
    spacing: "normal",
  },

  defaultSections: [
    { type: "navbar",        variant: "barber-dark",    order: 0,  visible: true },
    { type: "hero",          variant: "hero-luxury-dark", order: 1, visible: true },
    { type: "services",      variant: "pricing-list",   order: 2,  visible: true },
    { type: "gallery",       variant: "masonry",        order: 3,  visible: true },
    { type: "testimonials",  variant: "slider",         order: 4,  visible: true },
    { type: "team",          variant: "cards-grid",     order: 5,  visible: true },
    { type: "rezora-cta",    variant: "barber-dark",    order: 6,  visible: true },
    { type: "opening-hours", variant: "default",        order: 7,  visible: true },
    { type: "faq",           variant: "default",        order: 8,  visible: true },
    { type: "contact",       variant: "default",        order: 9,  visible: true },
    { type: "footer",        variant: "barber-dark",    order: 10, visible: true },
  ],

  pages: [
    {
      slug: "o-nas",
      title: "O nás",
      seoTitle: "O barbershopu | The Barber Studio Brno",
      seoDescription: "Poznejte tým a příběh studia The Barber v Brně.",
      sections: [
        { type: "navbar", variant: "barber-dark",    order: 0, visible: true, content: navbarContent },
        { type: "hero",   variant: "hero-centered",  order: 1, visible: true, content: {
          title: "Řemeslo,\nkteré je cítit.",
          subtitle: "Příběh barbershopu, tým a naše filozofie péče.",
        }},
        { type: "about", variant: "two-col", order: 2, visible: true, content: {
          title: "Barbershop s duší řemesla",
          body: "The Barber Studio vzniklo v roce 2018 s jednoduchou myšlenkou — vrátit holení a střihy do rukou opravdových mistrů. Náš tým absolvoval výcviky v Londýně a Amsterdamu. Každá návštěva je pro nás příležitostí ukázat, co znamená skutečná péče o muže.",
          image: "/images/template-gallery/barber-02-salon-chair-full-1920x1080.webp",
          values: [
            { icon: "✂", title: "Přesnost",  text: "Každý střih je promyšlený do posledního detailu." },
            { icon: "⚔", title: "Tradice",   text: "Holení britvou, teplý ručník a pečující rituál." },
            { icon: "★", title: "Zážitek",   text: "Klidné prostředí, kde se cítíte jako doma." },
          ],
        }},
        { type: "team",   variant: "cards-grid", order: 3, visible: true, content: {
          title: "Tým barbershopu",
          subtitle: "Každý z nás žije tímto řemeslem",
          members: [
            { name: "Lukáš Horák",  role: "Head Barber & Majitel",   bio: "12 let za nůžkami, certifikát London Barber Academy.", image: "/images/barber-01/team/barber-1.webp" },
            { name: "Ondřej Blaha", role: "Senior Barber",            bio: "Specialista na fade střihy a kreativní linky, 7 let praxe.", image: "/images/barber-01/team/barber-2.webp" },
            { name: "Radek Tůma",   role: "Barber & Grooming Expert", bio: "Milovník klasického holení a precizní péče o vousy.", image: "/images/barber-01/team/barber-3.webp" },
          ],
        }},
        { type: "footer", variant: "barber-dark", order: 4, visible: true, content: footerContent },
      ],
    },
    {
      slug: "sluzby",
      title: "Služby",
      seoTitle: "Ceník a služby | The Barber Studio Brno",
      seoDescription: "Ceník: fade střihy, holení britvou, úprava vousů. Rezervujte online.",
      sections: [
        { type: "navbar",   variant: "barber-dark",  order: 0, visible: true, content: navbarContent },
        { type: "hero",     variant: "hero-centered", order: 1, visible: true, content: {
          title: "Naše služby a ceník",
          subtitle: "Jasné ceny, precizní provedení.",
        }},
        { type: "services", variant: "pricing-list", order: 2, visible: true, content: {
          title: "Služby a ceník",
          services: [
            { name: "Klasický střih",    description: "Konzultace, střih, mytí a finální styling.",             price: "420 Kč",   duration: "40 min" },
            { name: "Holení britvou",    description: "Příprava kůže, holení britva + zklidňující balzám.",     price: "380 Kč",   duration: "35 min" },
            { name: "Fade & Design",     description: "Přesný fade střih s volitelnou designovou linkou.",      price: "490 Kč",   duration: "50 min" },
            { name: "Úprava vousů",      description: "Tvarování, střih a styling s voskem.",                   price: "280 Kč",   duration: "20 min" },
            { name: "Kompletní balíček", description: "Střih + holení + vousy + styling — vše v jednom.",       price: "820 Kč",   duration: "100 min" },
            { name: "Juniorský střih",   description: "Střih pro kluky do 16 let.",                             price: "260 Kč",   duration: "30 min" },
          ],
        }},
        { type: "faq", variant: "default", order: 3, visible: true, content: {
          title: "Časté dotazy",
          faq: [
            { question: "Musím se objednat předem?",          answer: "Doporučujeme to — barber se pak může plně připravit a věnovat vám čas." },
            { question: "Lze upravit rozsah služby na místě?", answer: "Ano. Před každou návštěvou proběhne krátká konzultace." },
            { question: "Máte dárkové poukazy?",               answer: "Ano. Vydáváme je online i přímo v barbershopu — ideální dárek pro muže." },
          ],
        }},
        { type: "footer", variant: "barber-dark", order: 4, visible: true, content: footerContent },
      ],
    },
    {
      slug: "galerie",
      title: "Galerie",
      seoTitle: "Galerie | The Barber Studio Brno",
      seoDescription: "Fotogalerie prací barbershopu. Fade střihy, holení, úprava vousů.",
      sections: [
        { type: "navbar",  variant: "barber-dark",  order: 0, visible: true, content: navbarContent },
        { type: "hero",    variant: "hero-centered", order: 1, visible: true, content: {
          title: "Galerie prací",
          subtitle: "Ukázky střihů a práce našeho týmu.",
        }},
        { type: "gallery", variant: "masonry",      order: 2, visible: true, content: {
          title: "Naše práce",
          images: [
            { url: "/images/template-gallery/barber-01-cut-detail-thumb-331x331.webp",    fullUrl: "/images/template-gallery/barber-01-cut-detail-full-1920x1080.webp",    alt: "Precizní fade střih" },
            { url: "/images/template-gallery/barber-02-salon-chair-thumb-331x331.webp",   fullUrl: "/images/template-gallery/barber-02-salon-chair-full-1920x1080.webp",   alt: "The Barber Studio ve svém živlu" },
            { url: "/images/template-gallery/barber-03-haircut-back-thumb-331x331.webp",  fullUrl: "/images/template-gallery/barber-03-haircut-back-full-1920x1080.webp",  alt: "Klasický střih zezadu" },
            { url: "/images/template-gallery/barber-04-beard-trim-thumb-331x331.webp",    fullUrl: "/images/template-gallery/barber-04-beard-trim-full-1920x1080.webp",    alt: "Úprava vousů" },
            { url: "/images/barber-01/hero.webp", fullUrl: "/images/barber-01/hero.webp", alt: "Atmosféra studia" },
            { url: "/images/template-gallery/barber-06-barber-chair-thumb-331x331.webp",  fullUrl: "/images/template-gallery/barber-06-barber-chair-full-1920x1080.webp",  alt: "Barberské křeslo" },
          ],
        }},
        { type: "footer", variant: "barber-dark", order: 3, visible: true, content: footerContent },
      ],
    },
    {
      slug: "kontakt",
      title: "Kontakt",
      seoTitle: "Kontakt a rezervace | The Barber Studio Brno",
      seoDescription: "Kontaktujte nás nebo rezervujte termín online. Náměstí Svobody 5, Brno.",
      sections: [
        { type: "navbar",        variant: "barber-dark", order: 0, visible: true, content: navbarContent },
        { type: "opening-hours", variant: "default",     order: 1, visible: true, content: {
          title: "Otevírací doba",
          openingHours: [
            { day: "Úterý – Pátek",    hours: "10:00 – 19:00" },
            { day: "Sobota",            hours: "9:00 – 15:00" },
            { day: "Neděle – Pondělí", hours: "Zavřeno" },
          ],
        }},
        { type: "contact", variant: "default", order: 2, visible: true, content: {
          title: "Přijďte nebo napište",
          address: ADDRESS,
          phone: PHONE,
          email: EMAIL,
          nameLabel: "Jméno", emailLabel: "E-mail", phoneLabel: "Telefon",
          messageLabel: "Zpráva", submitText: "Odeslat",
        }},
        { type: "footer", variant: "barber-dark", order: 3, visible: true, content: footerContent },
      ],
    },
  ],

  demoContent: {
    siteName: SITE_NAME,
    tagline: "Autentická péče pro moderního muže",
    description: "The Barber Studio v srdci Brna. Fade střihy, holení britvou, úprava vousů.",

    navbar: navbarContent,

    hero: {
      eyebrow: "Brno · Od roku 2014",
      title: "Autentický\nbarbershop.",
      subtitle: "Přijďte zažít řemeslo, které vytváří sebedůvěru. The Barber Studio v srdci Brna.",
      ctaText: "Rezervovat termín",
      ctaHref: "#rezervace",
      ctaSecondaryText: "Prohlédnout ceník",
      ctaSecondaryHref: "#sluzby",
      backgroundImage: "/images/barber-01/hero.webp",
    },

    services: {
      eyebrow: "Klasika & precizní řemeslo",
      title: "Ceník služeb",
      subtitle: "Každý zákrok provádíme s důrazem na detail, čisté linie a péči o váš osobní styl. Ceny jsou konečné, bez skrytých poplatků.",
      footnote: "Ceny jsou orientační — finální cena závisí na délce vlasů a vousů. Rezervace minimálně 24h předem.",
      services: [
        { name: "Klasický střih",    description: "Konzultace, střih, mytí a finální styling.",             price: "420 Kč",   duration: "40 min" },
        { name: "Holení britvou",    description: "Příprava kůže, holení britva + zklidňující balzám.",     price: "380 Kč",   duration: "35 min" },
        { name: "Fade & Design",     description: "Přesný fade střih s volitelnou designovou linkou.",      price: "490 Kč",   duration: "50 min" },
        { name: "Úprava vousů",      description: "Tvarování, střih a styling s voskem.",                   price: "280 Kč",   duration: "20 min" },
        { name: "Kompletní balíček", description: "Střih + holení + vousy + styling — vše v jednom.",       price: "820 Kč",   duration: "100 min" },
        { name: "Juniorský střih",   description: "Střih pro kluky do 16 let.",                             price: "260 Kč",   duration: "30 min" },
      ],
    },

    gallery: {
      title: "Naše práce",
      images: [
        { url: "/images/template-gallery/barber-01-cut-detail-thumb-331x331.webp",    fullUrl: "/images/template-gallery/barber-01-cut-detail-full-1920x1080.webp",    alt: "Precizní fade střih" },
        { url: "/images/template-gallery/barber-02-salon-chair-thumb-331x331.webp",   fullUrl: "/images/template-gallery/barber-02-salon-chair-full-1920x1080.webp",   alt: "The Barber Studio ve svém živlu" },
        { url: "/images/template-gallery/barber-03-haircut-back-thumb-331x331.webp",  fullUrl: "/images/template-gallery/barber-03-haircut-back-full-1920x1080.webp",  alt: "Klasický střih zezadu" },
        { url: "/images/template-gallery/barber-04-beard-trim-thumb-331x331.webp",    fullUrl: "/images/template-gallery/barber-04-beard-trim-full-1920x1080.webp",    alt: "Úprava vousů" },
        { url: "/images/barber-01/hero.webp", fullUrl: "/images/barber-01/hero.webp", alt: "Atmosféra studia" },
        { url: "/images/template-gallery/barber-06-barber-chair-thumb-331x331.webp",  fullUrl: "/images/template-gallery/barber-06-barber-chair-full-1920x1080.webp",  alt: "Barberské křeslo" },
      ],
    },

    testimonials: {
      title: "Co říkají klienti",
      testimonials: [
        { name: "Radim V.",  text: "Konečně barber, který chápe, co chci. Lukáš odvede vždy precizní práci a člověk odchází jako nový.", rating: 5 },
        { name: "Jiří S.",   text: "Fade střihy od Ondřeje jsou prostě jiná liga. Chodím pravidelně každé tři týdny.", rating: 5 },
        { name: "Martin B.", text: "Holení britvou je tady rituál. Klidná atmosféra, teplý ručník — opravdový luxus pro muže.", rating: 5 },
        { name: "Petr O.",   text: "The Barber Studio je nejlepší barbershop v Brně. Přátelský tým, skvělé výsledky pokaždé.", rating: 5 },
      ],
    },

    team: {
      title: "Náš tým",
      subtitle: "Každý z nás žije tímto řemeslem",
      members: [
        { name: "Lukáš Horák",  role: "Head Barber & Majitel",   bio: "12 let za nůžkami, certifikát London Barber Academy.", image: "/images/barber-01/team/barber-1.webp" },
        { name: "Ondřej Blaha", role: "Senior Barber",            bio: "Specialista na fade střihy a kreativní linky, 7 let praxe.", image: "/images/barber-01/team/barber-2.webp" },
        { name: "Radek Tůma",   role: "Barber & Grooming Expert", bio: "Milovník klasického holení a precizní péče o vousy.", image: "/images/barber-01/team/barber-3.webp" },
      ],
    },

    "rezora-cta": {
      title: "Domluvte si termín ještě dnes",
      subtitle: "Zvolte barber, čas a službu. Rezervace online za 60 vteřin.",
      ctaText: "Rezervovat termín",
      ctaHref: "#kontakt",
      bookingEnabled: false,
    },

    "opening-hours": {
      title: "Otevírací doba",
      openingHours: [
        { day: "Úterý – Pátek",    hours: "10:00 – 19:00" },
        { day: "Sobota",            hours: "9:00 – 15:00" },
        { day: "Neděle – Pondělí", hours: "Zavřeno" },
      ],
    },

    faq: {
      title: "Časté dotazy",
      faq: [
        { question: "Jak si rezervuji termín?",         answer: "Online přes rezervační formulář nebo telefonicky. Reagujeme do hodiny." },
        { question: "Je rezervace povinná?",             answer: "Doporučujeme ji — zaručíte si preferovaného barbera a přesný čas." },
        { question: "Co dělat, pokud přijdu poprvé?",   answer: "Přijďte klidně bez přípravy. Barber vás nejprve vyslechne a navrhne optimální střih." },
        { question: "Přijímáte platbu kartou?",          answer: "Ano, hotově i kartou. Na místě nabízíme i Apple Pay a Google Pay." },
        { question: "Kde se barbershop nachází?",        answer: "Náměstí Svobody 5, Brno — přímo v centru, 3 min od Hlavního nádraží." },
      ],
    },

    contact: {
      title: "Přijďte nebo napište",
      address: ADDRESS,
      phone: PHONE,
      email: EMAIL,
      nameLabel: "Jméno",
      emailLabel: "E-mail",
      phoneLabel: "Telefon",
      messageLabel: "Zpráva",
      submitText: "Odeslat",
    },

    footer: footerContent,

    seo: {
      title: "The Barber Studio Brno | Fade střihy a holení britvou",
      description: "The Barber Studio v Brně. Fade střihy, holení britvou, úprava vousů. Rezervujte online.",
      localBusiness: {
        type: "HairSalon",
        name: SITE_NAME,
        phone: PHONE,
        email: EMAIL,
        address: { street: "Náměstí Svobody 5", city: "Brno", postalCode: "60200", country: "CZ" },
        geo: { lat: 49.1951, lng: 16.6068 },
        priceRange: "CZK 260–820",
        openingHours: [
          "Tu-Fr 10:00-19:00",
          "Sa 09:00-15:00",
        ],
      },
    },
  },
};
