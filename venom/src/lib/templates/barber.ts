import { TemplateDefinition } from "./types";

const SITE_NAME = "Váš Barber Studio";
const ACCENT = "#C9A84C";

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
};

const footerContent = {
  siteName: SITE_NAME,
  tagline: "Prémiové barbershop služby ve vašem městě",
  links: navLinks,
  phone: "+420 777 123 456",
  email: "demo@demo.cz",
  address: "Václavské náměstí 1, Praha 1",
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
      title: "O studiu",
      seoTitle: "O studiu | Barber Studio Praha",
      seoDescription: "Poznejte tým a příběh Barber Studia Praha.",
      sections: [
        { type: "navbar", variant: "barber-dark",    order: 0, visible: true, content: navbarContent },
        { type: "hero",   variant: "hero-centered",  order: 1, visible: true, content: {
          title: "Řemeslo,\nkteré je vidět.",
          subtitle: "Příběh studia, tým a filozofie péče.",
        }},
        { type: "about", variant: "two-col", order: 2, visible: true, content: {
          title: "Barber studio s jasným stylem",
          body: "Barber Studio Praha vzniklo z vášně pro řemeslo a lásky ke klasickému holení. Náš tým prošel školeními v Londýně, Barceloně i New Yorku. Každý klient odchází s jistotou, že jeho střih byl vytvořen s maximální pečlivostí.",
          image: "/images/template-gallery/barber-02-salon-chair-full-1920x1080.webp",
          values: [
            { icon: "✂", title: "Precizní střih", text: "Každý střih má jasný tvar a propracované dokončení." },
            { icon: "⚔", title: "Tradiční holení", text: "Holení břitvou, horký ručník a klidná péče." },
            { icon: "★", title: "Prémiový zážitek", text: "Studio působí jako místo, kam se chce člověk vracet." },
          ],
        }},
        { type: "team",   variant: "cards-grid", order: 3, visible: true, content: {
          title: "Tým studia",
          subtitle: "Zkušení barbeři s vášní pro řemeslo",
          members: [
            { name: "Tomáš Krejčí", role: "Master Barber & Zakladatel", bio: "15 let zkušeností, školení v Londýně a Barceloně.", image: "" },
            { name: "David Novák",  role: "Senior Barber",               bio: "Specialista na tradiční holení břitvou, 8 let praxe.", image: "" },
            { name: "Marek Šimánek", role: "Barber & Stylista",          bio: "Expert na moderní střihy a men's grooming.", image: "" },
          ],
        }},
        { type: "footer", variant: "barber-dark", order: 4, visible: true, content: footerContent },
      ],
    },
    {
      slug: "sluzby",
      title: "Služby",
      seoTitle: "Ceník a služby | Barber Studio Praha",
      seoDescription: "Ceník: střihy, holení, úprava vousů. Rezervujte online.",
      sections: [
        { type: "navbar",   variant: "barber-dark",  order: 0, visible: true, content: navbarContent },
        { type: "hero",     variant: "hero-centered", order: 1, visible: true, content: {
          title: "Ceník služeb",
          subtitle: "Transparentní ceny, prémiová péče.",
        }},
        { type: "services", variant: "pricing-list", order: 2, visible: true, content: {
          title: "Služby a ceník",
          services: [
            { name: "Střih vlasů",      description: "Konzultace, střih, mytí a finální styling.", price: "450 Kč",   duration: "45 min" },
            { name: "Holení břitvou",   description: "Tradiční holení s horkým ručníkem.",         price: "350 Kč",   duration: "30 min" },
            { name: "Úprava vousů",     description: "Tvarování, střih a styling vousů.",           price: "300 Kč",   duration: "25 min" },
            { name: "Kompletní péče",   description: "Střih + holení + styling — premium balíček.", price: "750 Kč",   duration: "90 min" },
            { name: "Dětský střih",     description: "Střih pro klienty do 15 let.",                price: "280 Kč",   duration: "30 min" },
            { name: "Barvení + střih",  description: "Profesionální barvení nebo melíry + střih.",  price: "1 200 Kč", duration: "120 min" },
          ],
        }},
        { type: "faq", variant: "default", order: 3, visible: true, content: {
          title: "Časté dotazy",
          faq: [
            { question: "Musím se objednat předem?",    answer: "Doporučujeme rezervaci online — barber pak ví, kdy vás očekávat a připraví se." },
            { question: "Lze upravit službu na místě?", answer: "Ano. Před začátkem proběhne konzultace a rozsah se přizpůsobí." },
            { question: "Přijímáte dárkové poukazy?",   answer: "Ano. Poukazy vydáváme ve studiu i online." },
          ],
        }},
        { type: "footer", variant: "barber-dark", order: 4, visible: true, content: footerContent },
      ],
    },
    {
      slug: "galerie",
      title: "Galerie",
      seoTitle: "Galerie | Barber Studio Praha",
      seoDescription: "Fotogalerie prací barber studia. Střihy, holení, styling.",
      sections: [
        { type: "navbar",  variant: "barber-dark",  order: 0, visible: true, content: navbarContent },
        { type: "hero",    variant: "hero-centered", order: 1, visible: true, content: {
          title: "Galerie",
          subtitle: "Výsledky mluví za vše.",
        }},
        { type: "gallery", variant: "masonry",      order: 2, visible: true, content: {
          title: "Naše práce",
          images: [
            { url: "/images/template-gallery/barber-01-cut-detail-thumb-331x331.webp",    fullUrl: "/images/template-gallery/barber-01-cut-detail-full-1920x1080.webp",    alt: "Profesionální střih vlasů" },
            { url: "/images/template-gallery/barber-02-salon-chair-thumb-331x331.webp",   fullUrl: "/images/template-gallery/barber-02-salon-chair-full-1920x1080.webp",   alt: "Barber při práci" },
            { url: "/images/template-gallery/barber-03-haircut-back-thumb-331x331.webp",  fullUrl: "/images/template-gallery/barber-03-haircut-back-full-1920x1080.webp",  alt: "Úprava střihu" },
            { url: "/images/template-gallery/barber-04-beard-trim-thumb-331x331.webp",    fullUrl: "/images/template-gallery/barber-04-beard-trim-full-1920x1080.webp",    alt: "Interiér studia" },
            { url: "/images/template-gallery/barber-05-barber-lights-thumb-331x331.webp", fullUrl: "/images/template-gallery/barber-05-barber-lights-full-1920x1080.webp", alt: "Světla studia" },
            { url: "/images/template-gallery/barber-06-barber-chair-thumb-331x331.webp",  fullUrl: "/images/template-gallery/barber-06-barber-chair-full-1920x1080.webp",  alt: "Barber křeslo" },
          ],
        }},
        { type: "footer", variant: "barber-dark", order: 3, visible: true, content: footerContent },
      ],
    },
    {
      slug: "kontakt",
      title: "Kontakt",
      seoTitle: "Kontakt a rezervace | Barber Studio Praha",
      seoDescription: "Kontaktujte nás nebo rezervujte termín online. Václavské náměstí 1, Praha 1.",
      sections: [
        { type: "navbar",        variant: "barber-dark", order: 0, visible: true, content: navbarContent },
        { type: "opening-hours", variant: "default",     order: 1, visible: true, content: {
          title: "Otevírací doba",
          openingHours: [
            { day: "Pondělí – Pátek", hours: "9:00 – 20:00" },
            { day: "Sobota",          hours: "9:00 – 16:00" },
            { day: "Neděle",          hours: "Zavřeno" },
          ],
        }},
        { type: "contact", variant: "default", order: 2, visible: true, content: {
          title: "Rezervace a dotazy",
          address: "Václavské náměstí 1, Praha 1",
          phone: "+420 777 123 456",
          email: "demo@demo.cz",
          nameLabel: "Jméno", emailLabel: "E-mail", phoneLabel: "Telefon",
          messageLabel: "Zpráva", submitText: "Odeslat",
        }},
        { type: "footer", variant: "barber-dark", order: 3, visible: true, content: footerContent },
      ],
    },
  ],

  demoContent: {
    siteName: SITE_NAME,
    tagline: "Profesionální péče o váš styl",
    description: "Luxusní barber shop v srdci Prahy. Střihy, holení, úprava vousů.",

    navbar: navbarContent,

    hero: {
      title: "Váš styl,\nnáš um.",
      subtitle: "Luxusní barber studio v srdci Prahy. Přijďte zažít péči, která mění den.",
      ctaText: "Rezervovat termín",
      ctaHref: "#rezervace",
      backgroundImage: "/images/template-previews/barber-hero-1440x900.webp",
    },

    services: {
      title: "Ceník služeb",
      services: [
        { name: "Střih vlasů",     description: "Profesionální střih přizpůsobený vašemu stylu",    price: "450 Kč",   duration: "45 min" },
        { name: "Holení břitvou",  description: "Tradiční holení s horkým ručníkem",                price: "350 Kč",   duration: "30 min" },
        { name: "Úprava vousů",    description: "Tvarování, střih a styling vousů",                  price: "300 Kč",   duration: "25 min" },
        { name: "Kompletní péče",  description: "Střih + holení + vousy — premium balíček",          price: "750 Kč",   duration: "90 min" },
        { name: "Dětský střih",    description: "Střih pro nejmenší klienty do 15 let",              price: "280 Kč",   duration: "30 min" },
        { name: "Barvení + střih", description: "Profesionální barvení nebo melíry + střih",         price: "1 200 Kč", duration: "120 min" },
      ],
    },

    gallery: {
      title: "Naše práce",
      images: [
        { url: "/images/template-gallery/barber-01-cut-detail-thumb-331x331.webp",    fullUrl: "/images/template-gallery/barber-01-cut-detail-full-1920x1080.webp",    alt: "Profesionální střih vlasů" },
        { url: "/images/template-gallery/barber-02-salon-chair-thumb-331x331.webp",   fullUrl: "/images/template-gallery/barber-02-salon-chair-full-1920x1080.webp",   alt: "Barber při práci" },
        { url: "/images/template-gallery/barber-03-haircut-back-thumb-331x331.webp",  fullUrl: "/images/template-gallery/barber-03-haircut-back-full-1920x1080.webp",  alt: "Úprava střihu" },
        { url: "/images/template-gallery/barber-04-beard-trim-thumb-331x331.webp",    fullUrl: "/images/template-gallery/barber-04-beard-trim-full-1920x1080.webp",    alt: "Interiér studia" },
        { url: "/images/template-gallery/barber-05-barber-lights-thumb-331x331.webp", fullUrl: "/images/template-gallery/barber-05-barber-lights-full-1920x1080.webp", alt: "Světla studia" },
        { url: "/images/template-gallery/barber-06-barber-chair-thumb-331x331.webp",  fullUrl: "/images/template-gallery/barber-06-barber-chair-full-1920x1080.webp",  alt: "Barber křeslo" },
      ],
    },

    testimonials: {
      title: "Co říkají klienti",
      testimonials: [
        { name: "Tomáš N.",  text: "Nejlepší barber v Praze. Přesně ví, co chci — výsledek je vždy dokonalý.", rating: 5 },
        { name: "Martin K.", text: "Skvělá atmosféra, profesionální přístup, precizní práce. Konečně barber, kterému věřím.", rating: 5 },
        { name: "Pavel H.",  text: "Holení břitvou je tady zážitek sám o sobě. Teplý ručník, masáž — naprostá dokonalost.", rating: 5 },
        { name: "Jakub R.",  text: "2 roky jsem hledal dobrého barbera. Tady jsem doma. Chodím každý měsíc.", rating: 5 },
      ],
    },

    team: {
      title: "Náš tým",
      subtitle: "Zkušení barbeři s vášní pro řemeslo",
      members: [
        { name: "Tomáš Krejčí",  role: "Master Barber & Zakladatel", bio: "15 let zkušeností, školení v Londýně a Barceloně.", image: "" },
        { name: "David Novák",   role: "Senior Barber",               bio: "Specialista na tradiční holení břitvou, 8 let praxe.", image: "" },
        { name: "Marek Šimánek", role: "Barber & Stylista",           bio: "Expert na moderní střihy a men's grooming trendy.", image: "" },
      ],
    },

    "rezora-cta": {
      title: "Rezervujte si termín online",
      subtitle: "Vyberte si čas, který vám vyhovuje. Rezervace trvá jen minutu.",
      ctaText: "Rezervovat online",
      ctaHref: "#kontakt",
      bookingEnabled: false,
    },

    "opening-hours": {
      title: "Otevírací doba",
      openingHours: [
        { day: "Pondělí – Pátek", hours: "9:00 – 20:00" },
        { day: "Sobota",          hours: "9:00 – 16:00" },
        { day: "Neděle",          hours: "Zavřeno" },
      ],
    },

    faq: {
      title: "Časté dotazy",
      faq: [
        { question: "Je nutná rezervace?",            answer: "Doporučujeme rezervaci, aby byl váš barber dostupný v čas dle vašich preferencí." },
        { question: "Jak se objednat?",               answer: "Online přes formulář na webu, nebo telefonicky na +420 777 123 456." },
        { question: "Nabízíte dárkové poukazy?",      answer: "Ano, poukazy vydáváme online i ve studiu." },
        { question: "Platíte kartou?",                answer: "Ano, přijímáme všechny karty i mobilní platby." },
        { question: "Kde se studio nachází?",         answer: "Václavské náměstí 1, Praha 1 — 2 min od metra Muzeum." },
      ],
    },

    contact: {
      title: "Rezervace a dotazy",
      address: "Václavské náměstí 1, Praha 1",
      phone: "+420 777 123 456",
      email: "demo@demo.cz",
      nameLabel: "Jméno",
      emailLabel: "E-mail",
      phoneLabel: "Telefon",
      messageLabel: "Zpráva",
      submitText: "Odeslat rezervaci",
    },

    footer: footerContent,

    seo: {
      title: "Barber Studio Praha | Profesionální střihy a holení",
      description: "Luxusní barber shop v Praze. Střihy, holení břitvou, úprava vousů. Rezervujte online.",
      localBusiness: {
        type: "HairSalon",
        name: SITE_NAME,
        phone: "+420 777 123 456",
        email: "demo@demo.cz",
        address: { street: "Václavské náměstí 1", city: "Praha", postalCode: "11000", country: "CZ" },
        geo: { lat: 50.0816, lng: 14.4277 },
        priceRange: "CZK 280–1200",
        openingHours: [
          "Mo-Fr 09:00-20:00",
          "Sa 09:00-16:00",
        ],
      },
    },
  },
};
