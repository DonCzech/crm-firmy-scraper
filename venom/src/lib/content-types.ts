export interface NavItem {
  label: string;
  href: string;
  dropdown?: { label: string; href: string }[];
}

export interface ManifestCard {
  image: string;
  badge: string;
  title: string;
  text: string;
  btnText: string;
  btnHref: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  name: string;
  href: string;
}

export type BlockType = "heading" | "text" | "image" | "button" | "banner" | "newsletter" | "spacer" | "hero-section" | "cards-grid" | "two-col";

export interface PageBlock {
  id: string;
  type: BlockType;
  content?: string;
  align?: "left" | "center" | "right";
  level?: "h1" | "h2" | "h3" | "h4";
  color?: string;
  fontSize?: number;
  src?: string;
  alt?: string;
  width?: string;
  href?: string;
  bgColor?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  bgImage?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  body?: string;
  height?: number;
  // hero-section
  heroBgImage?: string;
  heroOverlay?: string; // rgba color
  // cards-grid
  sectionTitle?: string;
  cards?: Array<{ image: string; title: string; text: string; btnText: string; btnHref: string }>;
  // two-col
  imageLeft?: boolean;
  twoColImage?: string;
  twoColTitle?: string;
  twoColText?: string;
  twoColBtnText?: string;
  twoColBtnHref?: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  blocks: PageBlock[];
}

export interface SiteSettings {
  accentColor: string;
  logoUrl: string;
  metaTitle: string;
  metaDescription: string;
  customCss: string;
}

export interface AboutPageSection {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  bio1: string;
  bio2: string;
  bio3: string;
  quoteText: string;
  quoteAuthor: string;
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonHref: string;
  statsItems: { number: string; label: string }[];
}

export interface SiteContent {
  header: {
    navItems: NavItem[];
    logoHref: string;
    signInHref: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    backgroundImage: string;
    mobileImage: string;
    titleColor?: string;
    subtitleColor?: string;
    panelBackground?: string;
    primaryButtonBg?: string;
    primaryButtonColor?: string;
    secondaryButtonText?: string;
    secondaryButtonHref?: string;
  };
  newsletter: {
    title: string;
    body: string;
    buttonText: string;
    image: string;
  };
  about: {
    title: string;
    body1: string;
    body2: string;
    buttonText: string;
    buttonHref: string;
    imageTop: string;
    imageBottom: string;
  };
  manifest: {
    sectionTitle: string;
    cards: ManifestCard[];
  };
  pickacard: {
    title: string;
    body: string;
    buttonText: string;
    buttonHref: string;
    image: string;
  };
  oracle: {
    title: string;
    body: string;
    youtubeUrl: string;
    thumbnailImage?: string;
  };
  featuredIn: {
    title: string;
    brands: string[];
  };
  footer: {
    newsletterTitle: string;
    copyright: string;
    helpLabel?: string;
    contactLabel?: string;
    footerLinks: FooterLink[];
    socialLinks: SocialLink[];
  };
  aboutPage: AboutPageSection;
  pages: CustomPage[];
  siteSettings: SiteSettings;
}

export const SITE = "";

export const DEFAULT_CONTENT: SiteContent = {
  header: {
    navItems: [
      { label: "O mně", href: "/about" },
      { label: "Služby", href: "/sluzby" },
      { label: "Konzultace", href: "/konzultace" },
      { label: "E-shop", href: "/shop/" },
      { label: "Kniha", href: "/kniha" },
      { label: "Návody", href: "/navody" },
      { label: "Akce", href: "/events/" },
      { label: "Jak poděkovat", href: "/jak-podekovat" },
    ],
    logoHref: "/",
    signInHref: "/login/",
  },
  hero: {
    title: "Demo web pro kreativní studio",
    subtitle: "Prostor, energie i vnitřní nastavení se mohou znovu nadechnout.",
    ctaText: "O mně",
    ctaHref: "#o-studiu",
    backgroundImage: "/api/demo-placeholder?w=1787&h=880&label=Hero&tone=pearl",
    mobileImage: "/api/demo-placeholder?w=1787&h=880&label=Hero&tone=pearl",
    titleColor: "#1f1f1f",
    subtitleColor: "#2d2530",
    panelBackground: "rgba(255, 255, 255, 0.52)",
    primaryButtonBg: "#7c3bb2",
    primaryButtonColor: "#ffffff",
  },
  newsletter: {
    title: "Přihlas se k odběru newsletteru",
    body: "Jednou měsíčně pošlu užitečné tipy, jemné vedení a praktické návody pro harmonii domova i vnitřního prostoru. Žádný spam, jen obsah, který má smysl.",
    buttonText: "Přihlásit se",
    image: "/api/demo-placeholder?w=1428&h=1102&label=Newsletter&tone=sage",
  },
  about: {
    title: "O studiu",
    body1: "Astera je průvodkyně pro chvíle, kdy domov, práce nebo vnitřní prostor potřebují znovu nadechnout. Spojuje citlivou intuici s praktickým, klidným přístupem a pomáhá lidem vracet do jejich prostoru lehkost, bezpečí a jasnější energii.",
    body2: "Její práce stojí na respektu, etice a individuálním vnímání každého místa i člověka. Nehledá rychlé efekty, ale skutečnou harmonii: takovou, kterou můžete cítit v každodenním životě a dál o ni pečovat vlastními silami.",
    buttonText: "Více o mně",
    buttonHref: "/about",
    imageTop: "/api/demo-placeholder?w=579&h=816&label=Portrait&tone=rose",
    imageBottom: "",
  },
  manifest: {
    sectionTitle: "Vyber si, co právě potřebuješ",
    cards: [
      {
        image: "/api/demo-placeholder?w=1080&h=1080&label=Product&tone=pearl",
        badge: "/images/new-book-icon-240x240.webp",
        title: "Kniha a inspirace",
        text: "Praktické vedení pro chvíle, kdy chcete lépe porozumět sobě, svým záměrům a tomu, co ve svém životě opravdu tvoříte.",
        btnText: "Zjistit více",
        btnHref: "/art-of-manifesting/",
      },
      {
        image: "/api/demo-placeholder?w=408&h=410&label=Event&tone=sage",
        badge: "/images/Live-Event-240x240.webp",
        title: "Akce a setkání",
        text: "Živé i online akce pro ty, kdo chtějí zažít jasnější vedení, zklidnění a podporu v bezpečném prostoru.",
        btnText: "Rezervovat místo",
        btnHref: "/oracle-secrets/",
      },
      {
        image: "/api/demo-placeholder?w=408&h=410&label=Membership&tone=lavender",
        badge: "/images/Membership-240x240.webp",
        title: "Členství Oracle Circle",
        text: "Členský prostor pro práci s kartami, intuicí a pravidelnou inspirací. Vhodné pro každého, kdo chce svou praxi rozvíjet s lehkostí.",
        btnText: "Vstoupit",
        btnHref: "/membership/",
      },
    ],
  },
  pickacard: {
    title: "Vyber si kartu",
    body: "Zastav se, nadechni se a nech intuici vybrat kartu, která s tebou právě teď nejvíc rezonuje. Krátké vedení ti může pomoci pojmenovat další krok.",
    buttonText: "Vybrat kartu",
    buttonHref: "/pick-a-card/",
    image: "/api/demo-placeholder?w=579&h=816&label=Feature&tone=rose",
  },
  oracle: {
    title: "Měsíční intuitivní vhled",
    body: "Krátké vedení pro období, kdy potřebujete víc klidu, jasnosti a důvěry v další krok.",
    youtubeUrl: "https://www.youtube.com/embed/UcJoLcwuMP4",
  },
  featuredIn: {
    title: "Objevilo se v médiích",
    brands: [
      "Česká televize",
      "Forbes Česko",
      "Seznam Zprávy",
      "Radiožurnál",
      "iDNES.cz",
      "DVTV",
      "Elle Czech",
      "Ženy.cz",
    ],
  },
  footer: {
    newsletterTitle: "Získejte novinky a demo inspiraci ze studia.",
    copyright: "© 2026 Petra Studio. Všechna práva vyhrazena.",
    helpLabel: "Centrum pomoci",
    contactLabel: "Napište mi",
    footerLinks: [
      { label: "Ochrana osobních údajů", href: "/privacy-policy/" },
      { label: "Obchodní podmínky", href: "/terms-of-use/" },
      { label: "Reklamace a vrácení", href: "/returns/" },
      { label: "Platební podmínky", href: "/payment-plan-terms/" },
      { label: "Podmínky členství", href: "/membership-terms/" },
    ],
    socialLinks: [
      { name: "Facebook", href: "#" },
      { name: "Instagram", href: "#" },
      { name: "YouTube", href: "#" },
      { name: "Pinterest", href: "#" },
      { name: "TikTok", href: "#" },
      { name: "LinkedIn", href: "#" },
    ],
  },
  aboutPage: {
    heroTitle: "O demo studiu",
    heroSubtitle: "Intuitivní průvodkyně pro klid, energii a harmonii prostoru.",
    heroImage: "/api/demo-placeholder?w=1787&h=880&label=About&tone=pearl",
    bio1: "Astera-Light provází lidi chvílemi, kdy jejich domov, pracovní prostor nebo vnitřní nastavení potřebují znovu klid, lehkost a jasnost.",
    bio2: "Její práce propojuje citlivou intuici s praktickým přístupem. Věnuje se očistě prostor, energetické harmonizaci a jednoduchým postupům, které si klienti mohou dlouhodobě osvojit.",
    bio3: "Každý prostor vnímá individuálně a s respektem. Důraz klade na etiku, bezpečí a výsledek, který podporuje každodenní život, ne jen krátkodobý efekt.",
    quoteText: "You are not a human being having a spiritual experience. You are a spiritual being having a human experience.",
    quoteAuthor: "Petra",
    ctaTitle: "Chcete začít?",
    ctaText: "Vyberte si službu, která vám pomůže vrátit do prostoru i života více klidu.",
    ctaButtonText: "Zobrazit služby",
    ctaButtonHref: "/sluzby/",
    statsItems: [
      { number: "1:1", label: "Individuální přístup" },
      { number: "100%", label: "Etická práce" },
      { number: "Online", label: "Konzultace" },
      { number: "CZ", label: "Český obsah" },
    ],
  },
  pages: [],
  siteSettings: {
    accentColor: "#7c3bb2",
    logoUrl: "/demo-assets/petra-logo.svg",
    metaTitle: "Petra Studio",
    metaDescription: "Ukázkový web pro kreativní a konzultační studio.",
    customCss: "",
  },
};
