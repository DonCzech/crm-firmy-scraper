import { TemplateDefinition } from "./types";

export const lawyerTemplate: TemplateDefinition = {
  key: "lawyer",
  name: "Advokát & Poradce",
  industry: "legal",
  version: "1.0.0",

  designTokens: {
    colorPrimary: "#1B3A6B",
    colorSecondary: "#2C2C2C",
    colorBackground: "#FFFFFF",
    colorSurface: "#F4F6F9",
    colorText: "#1A1A1A",
    colorTextMuted: "#5A5A5A",
    colorAccent: "#C8A96E",
    colorBorder: "#DDE1E7",
    fontHeading: "Merriweather, serif",
    fontBody: "Source Sans Pro, sans-serif",
    borderRadius: "4px",
    spacing: "normal",
  },

  defaultSections: [
    { type: "navbar",       variant: "default",       order: 0,  visible: true },
    { type: "hero",         variant: "hero-centered", order: 1,  visible: true },
    { type: "about",        variant: "professional",  order: 2,  visible: true },
    { type: "services",     variant: "icon-grid",     order: 3,  visible: true },
    { type: "testimonials", variant: "static-cards",  order: 4,  visible: true },
    { type: "faq",          variant: "accordion",     order: 5,  visible: true },
    { type: "cta",          variant: "consultation",  order: 6,  visible: true },
    { type: "contact",      variant: "form-split",    order: 7,  visible: true },
    { type: "footer",       variant: "default",       order: 8,  visible: true },
  ],

  pages: [
    {
      slug: "o-mne",
      title: "O mně",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Mgr. Novák — Advokát", logoUrl: "/images/logos/demo-lawyer-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "Specializace", href: "/specializace" }, { label: "Reference", href: "/reference" }, { label: "Kontakt", href: "/kontakt" }],
          ctaText: "Sjednat konzultaci", ctaHref: "/kontakt",
        } },
        { type: "hero", variant: "hero-centered", order: 1, visible: true, content: {
          title: "Zkušenost,\nkterá chrání vaše zájmy.", subtitle: "Demo podstránka představuje advokáta, odbornost a způsob spolupráce.",
          ctaText: "Domluvit konzultaci", ctaHref: "/kontakt", backgroundImage: "/images/template-previews/lawyer-hero-1440x900.webp",
        } },
        { type: "about", variant: "professional", order: 2, visible: true, content: {
          title: "Mgr. Jan Novák — advokát",
          body: "Tento obsah je fiktivní demo pro právní šablonu. Stránka ukazuje, jak srozumitelně prezentovat praxi, specializaci a důvěryhodnost bez zbytečného právního žargonu.",
          image: "/images/lawyer-about-800x600.webp",
          values: [
            { icon: "⚖️", title: "Odbornost", text: "Jasná právní analýza a konkrétní další postup." },
            { icon: "🤝", title: "Důvěra", text: "Transparentní komunikace od první konzultace." },
            { icon: "⏱️", title: "Dostupnost", text: "Rychlá reakce u urgentních záležitostí." },
          ],
        } },
        { type: "footer", variant: "default", order: 3, visible: true, content: {
          siteName: "Mgr. Jan Novák — Advokát", tagline: "Profesionální právní poradenství v Praze",
          links: [{ label: "Specializace", href: "/specializace" }, { label: "Reference", href: "/reference" }, { label: "Kontakt", href: "/kontakt" }],
          phone: "+420 775 987 654", email: "novak@advokat-novak.cz", address: "Politických vězňů 12, Praha 1",
        } },
      ],
    },
    {
      slug: "specializace",
      title: "Specializace",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Mgr. Novák — Advokát", logoUrl: "/images/logos/demo-lawyer-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "O mně", href: "/o-mne" }, { label: "Reference", href: "/reference" }, { label: "Kontakt", href: "/kontakt" }],
          ctaText: "Sjednat konzultaci", ctaHref: "/kontakt",
        } },
        { type: "services", variant: "icon-grid", order: 1, visible: true, content: {
          title: "Právní specializace",
          services: [
            { name: "Obchodní právo", description: "Smlouvy, firmy, pohledávky a obchodní spory.", icon: "briefcase" },
            { name: "Pracovní právo", description: "Výpovědi, smlouvy, dohody a spory na pracovišti.", icon: "users" },
            { name: "Rodinné právo", description: "Rozvody, péče o děti a vypořádání majetku.", icon: "home" },
            { name: "Nemovitosti", description: "Kupní smlouvy, pronájmy a kontrola dokumentace.", icon: "building" },
          ],
        } },
        { type: "faq", variant: "accordion", order: 2, visible: true, content: {
          title: "Jak spolupráce probíhá",
          faq: [
            { question: "Co přinést na první konzultaci?", answer: "Připravte smlouvy, komunikaci, rozhodnutí a krátký popis cíle." },
            { question: "Lze řešit věci online?", answer: "Ano, demo šablona počítá s osobní i online konzultací." },
          ],
        } },
        { type: "footer", variant: "default", order: 3, visible: true, content: {
          siteName: "Mgr. Jan Novák — Advokát", tagline: "Profesionální právní poradenství v Praze",
          links: [{ label: "O mně", href: "/o-mne" }, { label: "Reference", href: "/reference" }, { label: "Kontakt", href: "/kontakt" }],
          phone: "+420 775 987 654", email: "novak@advokat-novak.cz", address: "Politických vězňů 12, Praha 1",
        } },
      ],
    },
    {
      slug: "reference",
      title: "Reference",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Mgr. Novák — Advokát", logoUrl: "/images/logos/demo-lawyer-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "O mně", href: "/o-mne" }, { label: "Specializace", href: "/specializace" }, { label: "Kontakt", href: "/kontakt" }],
          ctaText: "Sjednat konzultaci", ctaHref: "/kontakt",
        } },
        { type: "testimonials", variant: "static-cards", order: 1, visible: true, content: {
          title: "Reference klientů",
          testimonials: [
            { name: "Roman B.", text: "Srozumitelná komunikace a rychlý postup u obchodního sporu.", rating: 5 },
            { name: "Petra V.", text: "Konečně právník, který vysvětlí možnosti jednoduše a konkrétně.", rating: 5 },
            { name: "Jakub S.", text: "Pracovněprávní problém se podařilo vyřešit bez zbytečných průtahů.", rating: 5 },
          ],
        } },
        { type: "cta", variant: "consultation", order: 2, visible: true, content: {
          title: "Potřebujete právní názor?", subtitle: "Krátká konzultace pomůže určit rizika a další postup.", ctaText: "Sjednat konzultaci", ctaHref: "/kontakt",
        } },
        { type: "footer", variant: "default", order: 3, visible: true, content: {
          siteName: "Mgr. Jan Novák — Advokát", tagline: "Profesionální právní poradenství v Praze",
          links: [{ label: "O mně", href: "/o-mne" }, { label: "Specializace", href: "/specializace" }, { label: "Kontakt", href: "/kontakt" }],
          phone: "+420 775 987 654", email: "novak@advokat-novak.cz", address: "Politických vězňů 12, Praha 1",
        } },
      ],
    },
    {
      slug: "kontakt",
      title: "Kontakt",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: {
          siteName: "Mgr. Novák — Advokát", logoUrl: "/images/logos/demo-lawyer-logo.svg",
          links: [{ label: "Domů", href: "/" }, { label: "O mně", href: "/o-mne" }, { label: "Specializace", href: "/specializace" }, { label: "Reference", href: "/reference" }],
          ctaText: "Sjednat konzultaci", ctaHref: "/kontakt",
        } },
        { type: "contact", variant: "form-split", order: 1, visible: true, content: {
          title: "Kontaktujte kancelář", address: "Politických vězňů 12, Praha 1", phone: "+420 775 987 654", email: "novak@advokat-novak.cz",
          nameLabel: "Jméno", emailLabel: "E-mail", phoneLabel: "Telefon", messageLabel: "Popis situace", submitText: "Odeslat dotaz",
        } },
        { type: "footer", variant: "default", order: 2, visible: true, content: {
          siteName: "Mgr. Jan Novák — Advokát", tagline: "Profesionální právní poradenství v Praze",
          links: [{ label: "O mně", href: "/o-mne" }, { label: "Specializace", href: "/specializace" }, { label: "Reference", href: "/reference" }],
          phone: "+420 775 987 654", email: "novak@advokat-novak.cz", address: "Politických vězňů 12, Praha 1",
        } },
      ],
    },
  ],

  demoContent: {
    siteName: "Mgr. Jan Novák — Advokát",
    tagline: "Profesionální právní poradenství",
    description: "Zkušený advokát specializovaný na obchodní, pracovní a rodinné právo.",

    navbar: {
      siteName: "Mgr. Novák — Advokát",
      logoUrl: "/images/logos/demo-lawyer-logo.svg",
      links: [
        { label: "O mně", href: "/o-mne" },
        { label: "Specializace", href: "/specializace" },
        { label: "Reference", href: "/reference" },
        { label: "Kontakt", href: "/kontakt" },
      ],
      ctaText: "Sjednat konzultaci",
      ctaHref: "#kontakt",
    },

    hero: {
      title: "Právní pomoc,\nna které záleží.",
      subtitle: "Profesionální advokátní kancelář v Praze. Obchodní, pracovní a rodinné právo. 12 let zkušeností.",
      ctaText: "Sjednat konzultaci",
      ctaHref: "#kontakt",
      backgroundImage:
        "/images/template-previews/lawyer-hero-1440x900.webp",
    },

    about: {
      title: "Mgr. Jan Novák\n— Váš advokát",
      body: "Advokacii se věnuji více než 12 let. Pracoval jsem v přední pražské advokátní kanceláři, než jsem se rozhodl poskytovat klientům individuálnější přístup. Každý případ řeším osobně — s maximálním nasazením a transparentní komunikací od prvního kontaktu.",
      image: "/images/lawyer-about-800x600.webp",
      values: [
        { icon: "⚖️", title: "Odbornost", text: "12 let praxe v obchodním, pracovním a rodinném právu." },
        { icon: "🤝", title: "Důvěra", text: "Transparentní honoráře, jasná komunikace, žádná překvapení." },
        { icon: "⏱️", title: "Dostupnost", text: "Reagujeme do 24 hodin. Urgentní věci řešíme ihned." },
      ],
    },

    services: {
      services: [
        { name: "Obchodní právo", description: "Smlouvy, zakládání a přeměny firem, vymáhání pohledávek a obchodní spory.", icon: "briefcase" },
        { name: "Pracovní právo", description: "Pracovní smlouvy, výpovědi, DPP/DPČ, spory se zaměstnavatelem či zaměstnancem.", icon: "users" },
        { name: "Rodinné právo", description: "Rozvody, úprava péče o děti, výživné a majetkové vypořádání manželů.", icon: "home" },
        { name: "Nemovitosti", description: "Kupní smlouvy, převody nemovitostí, věcná břemena a pronájem.", icon: "building" },
      ],
    },

    testimonials: {
      testimonials: [
        { name: "Roman B.", text: "Skvělý advokát. Náš firemní spor vyřešil rychle, profesionálně a za rozumné peníze. Vřele doporučuji každému, kdo hledá spolehlivého právníka.", rating: 5 },
        { name: "Petra V.", text: "Precizní práce, vždy dostupný, výborná komunikace. Konečně advokát, který vše vysvětlí srozumitelně a bez zbytečného právního žargonu.", rating: 5 },
        { name: "Jakub S.", text: "Pomohl mi s pracovněprávním sporem — výsledek předčil očekávání. Profesionál ve všech směrech. Neváhám ho doporučit přátelům i rodině.", rating: 5 },
      ],
    },

    faq: {
      faq: [
        { question: "Jak probíhá první konzultace?", answer: "První konzultace trvá 30–60 minut. Probereme váš případ, zodpovíme dotazy a navrhneme konkrétní postup. Konzultace je zpoplatněna dle platné hodinové sazby." },
        { question: "Jak účtujete honoráře?", answer: "Pracujeme na hodinové sazbě nebo smluvním paušálu — vždy dohodnutém předem. Klient ví, kolik zaplatí, ještě než začneme. Transparentnost je pro nás základ." },
        { question: "Jak rychle mi odpovíte?", answer: "Na urgentní záležitosti reagujeme do 24 hodin. Standardní dotazy zodpovíme do 2 pracovních dnů. Vždy budeme proaktivně informovat o průběhu věci." },
        { question: "Pracujete i mimo Prahu?", answer: "Ano, zastupujeme klienty po celé České republice. Osobní schůzky probíhají v Praze nebo dle dohody. Mnoho věcí lze efektivně vyřídit online nebo telefonicky." },
        { question: "Jaké dokumenty přinést na první schůzku?", answer: "Přineste vše, co se k vašemu případu vztahuje — smlouvy, korespondenci, rozhodnutí soudů. Čím více informací, tím přesnější bude naše analýza a doporučení." },
      ],
    },

    cta: {
      title: "Řešíte právní problém?",
      subtitle: "Neztrácejte čas. Včasná konzultace s advokátem vám může ušetřit roky sporů a nemalé peníze.",
      ctaText: "Sjednat konzultaci",
      ctaHref: "#kontakt",
    },

    contact: {
      address: "Politických vězňů 12, Praha 1",
      phone: "+420 775 987 654",
      email: "novak@advokat-novak.cz",
    },

    footer: {
      siteName: "Mgr. Jan Novák — Advokát",
      tagline: "Profesionální právní poradenství v Praze",
      links: [
        { label: "O mně", href: "/o-mne" },
        { label: "Specializace", href: "/specializace" },
        { label: "Reference", href: "/reference" },
        { label: "Kontakt", href: "/kontakt" },
      ],
      phone: "+420 775 987 654",
      email: "novak@advokat-novak.cz",
      address: "Politických vězňů 12, Praha 1",
    },

    seo: {
      title: "Advokát Praha | Mgr. Jan Novák — Obchodní a pracovní právo",
      description: "Zkušený advokát v Praze. Obchodní, pracovní a rodinné právo. Sjednejte konzultaci.",
      localBusiness: {
        type: "LegalService",
        city: "Praha",
        region: "Hlavní město Praha",
      },
    },
  },
};
