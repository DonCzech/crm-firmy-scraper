import { TemplateDefinition } from "./types";

export const wellnessTemplate: TemplateDefinition = {
  key: "wellness",
  name: "Wellness & Masáže",
  industry: "wellness",
  version: "1.0.0",

  designTokens: {
    colorPrimary: "#7B9E87",
    colorSecondary: "#4A4A4A",
    colorBackground: "#FAFAF7",
    colorSurface: "#F0EDE8",
    colorText: "#2C2C2C",
    colorTextMuted: "#6B6B6B",
    colorAccent: "#C4956A",
    colorBorder: "#E0D9D0",
    fontHeading: "Cormorant Garamond, serif",
    fontBody: "Lato, sans-serif",
    borderRadius: "12px",
    spacing: "relaxed",
  },

  defaultSections: [
    { type: "navbar",       variant: "default",          order: 0,  visible: true },
    { type: "hero",         variant: "hero-split-image", order: 1,  visible: true },
    { type: "about",        variant: "two-col",          order: 2,  visible: true },
    { type: "services",     variant: "cards-grid",       order: 3,  visible: true },
    { type: "gallery",      variant: "grid",             order: 4,  visible: true },
    { type: "testimonials", variant: "static-cards",     order: 5,  visible: true },
    { type: "faq",          variant: "accordion",        order: 6,  visible: true },
    { type: "rezora-cta",   variant: "soft",             order: 7,  visible: true },
    { type: "contact",      variant: "default",          order: 8,  visible: true },
    { type: "footer",       variant: "default",          order: 9,  visible: true },
  ],

  pages: [
    {
      slug: "o-nas",
      title: "O studiu",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Wellness Studio Klára", logoUrl: "/images/logos/demo-wellness-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "Procedury", href: "/procedury" }, { label: "Galerie", href: "/galerie" }, { label: "FAQ", href: "/faq" }, { label: "Kontakt", href: "/kontakt" }],
          ctaText: "Zarezervovat", ctaHref: "/kontakt",
        } },
        { type: "hero", variant: "hero-split-image", order: 1, visible: true, content: {
          title: "Místo pro\nskutečný odpočinek.", subtitle: "Demo podstránka ukazuje příběh wellness studia, atmosféru a důvěru.",
          ctaText: "Vybrat proceduru", ctaHref: "/procedury", backgroundImage: "/images/template-gallery/wellness-05-relax-massage-full-1920x1080.webp",
        } },
        { type: "about", variant: "two-col", order: 2, visible: true, content: {
          title: "Klidný prostor pro tělo i mysl",
          body: "Tato stránka je fiktivní demo obsah pro wellness šablonu. Ukazuje, jak popsat studio, přístup terapeutů a atmosféru tak, aby web působil hotově a důvěryhodně.",
          highlight: "Obsah je připravený pro rychlou výměnu za skutečný text klienta.",
          image: "/images/template-gallery/wellness-01-spa-room-full-1920x1080.webp",
        } },
        { type: "footer", variant: "default", order: 3, visible: true, content: {
          siteName: "Wellness Studio Klára", tagline: "Prostor pro vaši duši i tělo",
          links: [{ label: "Procedury", href: "/procedury" }, { label: "Galerie", href: "/galerie" }, { label: "Kontakt", href: "/kontakt" }],
          phone: "+420 776 456 789", email: "info@wellness-klara.cz", address: "Mánesova 15, Praha 2",
        } },
      ],
    },
    {
      slug: "procedury",
      title: "Procedury",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Wellness Studio Klára", logoUrl: "/images/logos/demo-wellness-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "O nás", href: "/o-nas" }, { label: "Galerie", href: "/galerie" }, { label: "FAQ", href: "/faq" }, { label: "Kontakt", href: "/kontakt" }],
          ctaText: "Zarezervovat", ctaHref: "/kontakt",
        } },
        { type: "services", variant: "cards-grid", order: 1, visible: true, content: {
          title: "Vyberte si proceduru",
          services: [
            { name: "Relaxační masáž", description: "Jemná celotělová masáž pro uvolnění stresu.", price: "890 Kč" },
            { name: "Terapeutická masáž", description: "Cílená práce se zády, šíjí a svalovým napětím.", price: "990 Kč" },
            { name: "Horké kameny", description: "Hluboká relaxace s lávovými kameny.", price: "1 300 Kč" },
            { name: "Balíček pro dva", description: "Společný odpočinek jako dárek nebo zážitek.", price: "1 750 Kč" },
          ],
        } },
        { type: "rezora-cta", variant: "soft", order: 2, visible: true, content: {
          title: "Najděte si čas pro sebe", subtitle: "Rezervace je v demo režimu připravená jako kontaktní výzva.", ctaText: "Přejít na kontakt", ctaHref: "/kontakt",
        } },
        { type: "footer", variant: "default", order: 3, visible: true, content: {
          siteName: "Wellness Studio Klára", tagline: "Prostor pro vaši duši i tělo",
          links: [{ label: "O nás", href: "/o-nas" }, { label: "Galerie", href: "/galerie" }, { label: "FAQ", href: "/faq" }],
          phone: "+420 776 456 789", email: "info@wellness-klara.cz", address: "Mánesova 15, Praha 2",
        } },
      ],
    },
    {
      slug: "galerie",
      title: "Galerie",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Wellness Studio Klára", logoUrl: "/images/logos/demo-wellness-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "O nás", href: "/o-nas" }, { label: "Procedury", href: "/procedury" }, { label: "Kontakt", href: "/kontakt" }],
          ctaText: "Zarezervovat", ctaHref: "/kontakt",
        } },
        { type: "gallery", variant: "grid", order: 1, visible: true, content: {
          title: "Prostor studia",
          images: [
            { url: "/images/template-gallery/wellness-01-spa-room-thumb-331x331.webp", fullUrl: "/images/template-gallery/wellness-01-spa-room-full-1920x1080.webp", alt: "Relaxační místnost" },
            { url: "/images/template-gallery/wellness-02-massage-back-thumb-331x331.webp", fullUrl: "/images/template-gallery/wellness-02-massage-back-full-1920x1080.webp", alt: "Masáž zad" },
            { url: "/images/template-gallery/wellness-03-wellness-procedure-thumb-331x331.webp", fullUrl: "/images/template-gallery/wellness-03-wellness-procedure-full-1920x1080.webp", alt: "Wellness procedura" },
            { url: "/images/template-gallery/wellness-06-body-care-thumb-331x331.webp", fullUrl: "/images/template-gallery/wellness-06-body-care-full-1920x1080.webp", alt: "Péče o tělo" },
          ],
        } },
        { type: "footer", variant: "default", order: 2, visible: true, content: {
          siteName: "Wellness Studio Klára", tagline: "Prostor pro vaši duši i tělo",
          links: [{ label: "O nás", href: "/o-nas" }, { label: "Procedury", href: "/procedury" }, { label: "Kontakt", href: "/kontakt" }],
          phone: "+420 776 456 789", email: "info@wellness-klara.cz", address: "Mánesova 15, Praha 2",
        } },
      ],
    },
    {
      slug: "faq",
      title: "FAQ",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Wellness Studio Klára", logoUrl: "/images/logos/demo-wellness-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "Procedury", href: "/procedury" }, { label: "Galerie", href: "/galerie" }, { label: "Kontakt", href: "/kontakt" }],
          ctaText: "Zarezervovat", ctaHref: "/kontakt",
        } },
        { type: "faq", variant: "accordion", order: 1, visible: true, content: {
          title: "Časté dotazy",
          faq: [
            { question: "Jak se připravit na masáž?", answer: "Přijďte pár minut předem, nejezte těžké jídlo a po proceduře pijte vodu." },
            { question: "Lze koupit dárkový poukaz?", answer: "Ano, demo stránka počítá i s prodejem poukazů nebo dárkových balíčků." },
            { question: "Jak zrušit rezervaci?", answer: "Ukázkově lze storno řešit přes telefon, e-mail nebo rezervační systém." },
          ],
        } },
        { type: "footer", variant: "default", order: 2, visible: true, content: {
          siteName: "Wellness Studio Klára", tagline: "Prostor pro vaši duši i tělo",
          links: [{ label: "O nás", href: "/o-nas" }, { label: "Procedury", href: "/procedury" }, { label: "Kontakt", href: "/kontakt" }],
          phone: "+420 776 456 789", email: "info@wellness-klara.cz", address: "Mánesova 15, Praha 2",
        } },
      ],
    },
    {
      slug: "kontakt",
      title: "Kontakt",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Wellness Studio Klára", logoUrl: "/images/logos/demo-wellness-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "O nás", href: "/o-nas" }, { label: "Procedury", href: "/procedury" }, { label: "Galerie", href: "/galerie" }],
          ctaText: "Zarezervovat", ctaHref: "/kontakt",
        } },
        { type: "contact", variant: "default", order: 1, visible: true, content: {
          title: "Kontakt a rezervace", address: "Mánesova 15, Praha 2", phone: "+420 776 456 789", email: "info@wellness-klara.cz",
          nameLabel: "Jméno", emailLabel: "E-mail", phoneLabel: "Telefon", messageLabel: "Zpráva", submitText: "Odeslat dotaz",
        } },
        { type: "footer", variant: "default", order: 2, visible: true, content: {
          siteName: "Wellness Studio Klára", tagline: "Prostor pro vaši duši i tělo",
          links: [{ label: "O nás", href: "/o-nas" }, { label: "Procedury", href: "/procedury" }, { label: "FAQ", href: "/faq" }],
          phone: "+420 776 456 789", email: "info@wellness-klara.cz", address: "Mánesova 15, Praha 2",
        } },
      ],
    },
  ],

  demoContent: {
    siteName: "Wellness Studio Klára",
    tagline: "Prostor pro vaši duši i tělo",
    description: "Profesionální masáže, wellness procedury a relaxační terapie.",

    navbar: {
      siteName: "Wellness Studio Klára",
      logoUrl: "/images/logos/demo-wellness-logo.svg",
      links: [
        { label: "O nás", href: "/o-nas" },
        { label: "Procedury", href: "/procedury" },
        { label: "Galerie", href: "/galerie" },
        { label: "FAQ", href: "/faq" },
        { label: "Kontakt", href: "/kontakt" },
      ],
      ctaText: "Zarezervovat",
      ctaHref: "#rezervace",
    },

    hero: {
      title: "Najděte\nsvůj klid.",
      subtitle: "Profesionální wellness studio v Praze. Masáže, terapie a péče o tělo i mysl na jednom místě.",
      ctaText: "Zarezervovat proceduru",
      ctaHref: "#rezervace",
      backgroundImage:
        "/images/template-gallery/wellness-05-relax-massage-full-1920x1080.webp",
    },

    about: {
      title: "Péče o tělo\ni mysl",
      body: "Wellness Studio Klára vzniklo z přesvědčení, že každý člověk potřebuje prostor pro skutečný odpočinek. Za 8 let praxe jsme vytvořili místo, kde se čas zastaví a vy se soustředíte jen na sebe. Naše terapeutky prošly profesionálním školením v Česku i zahraničí.",
      highlight: "Více než 2 000 spokojených klientů. Vracejí se znovu a znovu.",
      image:
        "/images/template-gallery/wellness-02-massage-back-full-1920x1080.webp",
    },

    services: {
      services: [
        { name: "Relaxační masáž", description: "Celotělová masáž pro uvolnění stresu a napětí v těle.", price: "890 Kč", duration: "60 min" },
        { name: "Lymfatická masáž", description: "Detoxikace organismu a podpora imunity jemnou technikou.", price: "1 100 Kč", duration: "75 min" },
        { name: "Horké kameny", description: "Hluboká relaxace s lávovými kameny na klíčové body těla.", price: "1 300 Kč", duration: "90 min" },
        { name: "Terapeutická masáž", description: "Cílená práce s napětím, bolestí zad a šíje.", price: "990 Kč", duration: "60 min" },
        { name: "Aromaterapie", description: "Masáž s esenciálními oleji pro hlubokou relaxaci těla i mysli.", price: "1 050 Kč", duration: "70 min" },
        { name: "Balíček pro dva", description: "Párová masáž — ideální dárek nebo společný zážitek.", price: "1 750 Kč", duration: "60 min" },
      ],
    },

    gallery: {
      title: "Naše studio",
      images: [
        {
          url: "/images/template-gallery/wellness-01-spa-room-thumb-331x331.webp",
          fullUrl: "/images/template-gallery/wellness-01-spa-room-full-1920x1080.webp",
          alt: "Relaxační prostředí",
        },
        {
          url: "/images/template-gallery/wellness-02-massage-back-thumb-331x331.webp",
          fullUrl: "/images/template-gallery/wellness-02-massage-back-full-1920x1080.webp",
          alt: "Masáž zad",
        },
        {
          url: "/images/template-gallery/wellness-03-wellness-procedure-thumb-331x331.webp",
          fullUrl: "/images/template-gallery/wellness-03-wellness-procedure-full-1920x1080.webp",
          alt: "Wellness procedura",
        },
        {
          url: "/images/template-gallery/wellness-04-studio-bath-thumb-331x331.webp",
          fullUrl: "/images/template-gallery/wellness-04-studio-bath-full-1920x1080.webp",
          alt: "Prostředí studia",
        },
        {
          url: "/images/template-gallery/wellness-05-relax-massage-thumb-331x331.webp",
          fullUrl: "/images/template-gallery/wellness-05-relax-massage-full-1920x1080.webp",
          alt: "Relaxační masáž",
        },
        {
          url: "/images/template-gallery/wellness-06-body-care-thumb-331x331.webp",
          fullUrl: "/images/template-gallery/wellness-06-body-care-full-1920x1080.webp",
          alt: "Péče o tělo",
        },
      ],
    },

    testimonials: {
      testimonials: [
        { name: "Jana M.", text: "Absolutní klid a pohoda. Terapeutka přesně věděla, kde mám napětí. Vracím se každý měsíc.", rating: 5 },
        { name: "Lucie K.", text: "Profesionální přístup, nádherné prostředí a masáž, která trvá ještě hodiny po odchodu. Doporučuji!", rating: 5 },
        { name: "Eva T.", text: "Horké kameny byly úžasné. Nikdy jsem takhle neodpočívala. Balíček pro dva s přítelem byl perfektní tip.", rating: 5 },
        { name: "Petra B.", text: "Lymfatická masáž mi pomohla s otoky. Výsledky jsou vidět. Klára ví, co dělá. Skvělá.", rating: 5 },
      ],
    },

    faq: {
      faq: [
        { question: "Jak se připravit na masáž?", answer: "Doporučujeme přijít 5–10 minut před termínem. Nejíst těžká jídla 2 hodiny před procedurou a vzít si pohodlné oblečení. Po masáži pijte dostatek vody." },
        { question: "Mohu přijít s bolestí zad?", answer: "Ano, informujte nás předem o svém stavu. Naše terapeutky proceduru přizpůsobí vašim potřebám. V akutní fázi bolesti doporučujeme nejprve konzultaci s lékařem." },
        { question: "Jak dlouho dopředu se rezervuje?", answer: "Ideálně 2–3 dny předem. V případě urgentní potřeby se nám ozvěte telefonicky — aktuální volné termíny uvidíte online." },
        { question: "Vydáváte dárkové poukazy?", answer: "Ano! Dárkový poukaz vydáme na jakoukoli proceduru nebo libovolnou částku. Platnost je 6 měsíců. Objednejte osobně nebo emailem." },
        { question: "Jak rušit rezervaci?", answer: "Rezervaci lze zrušit nejpozději 24 hodin před termínem bez poplatku. Pozdější zrušení nebo nedostavení se je zpoplatněno 50 % hodnoty procedury." },
      ],
    },

    "rezora-cta": {
      title: "Nechte se hýčkat",
      subtitle: "Vyberte si termín, který vám vyhovuje. Rezervace online nebo telefonicky — vždy bez závazků.",
      ctaText: "Zarezervovat proceduru",
      ctaHref: "#kontakt",
      bookingEnabled: false,
    },

    contact: {
      address: "Mánesova 15, Praha 2",
      phone: "+420 776 456 789",
      email: "info@wellness-klara.cz",
    },

    footer: {
      siteName: "Wellness Studio Klára",
      tagline: "Prostor pro vaši duši i tělo",
      links: [
        { label: "O nás", href: "/o-nas" },
        { label: "Procedury", href: "/procedury" },
        { label: "FAQ", href: "/faq" },
        { label: "Kontakt", href: "/kontakt" },
      ],
      phone: "+420 776 456 789",
      email: "info@wellness-klara.cz",
      address: "Mánesova 15, Praha 2",
    },

    seo: {
      title: "Wellness Studio Klára Praha | Masáže a relaxace",
      description: "Profesionální masáže a wellness procedury v Praze 2. Reservujte online.",
      localBusiness: {
        type: "HealthAndBeautyBusiness",
        city: "Praha",
        region: "Hlavní město Praha",
      },
    },
  },
};
