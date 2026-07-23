export interface NavItem {
  label: string;
  href: string;
  dropdown?: { label: string; href: string }[];
}

export interface Testimonial {
  name: string;
  text: string;
  emoji: string;
}

export interface ManifestCard {
  image: string;
  mobileImage?: string;
  badge: string;
  mobileBadge?: string;
  title: string;
  text: string;
  btnText: string;
  btnHref: string;
}

export interface PickACardGameCard {
  id: string;
  title: string;
  concepts: string;
  message: string;
  gradient: string;
  symbol: string;
  image: string;
  mobileImage?: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  name: string;
  href: string;
}

export type BlockType = "heading" | "text" | "image" | "button" | "banner" | "newsletter" | "spacer" | "hero-section" | "cards-grid" | "two-col" | "faq" | "contact-form" | "donation-qr";

export interface PageBlock {
  id: string;
  type: BlockType;
  content?: string;
  align?: "left" | "center" | "right";
  level?: "h1" | "h2" | "h3" | "h4";
  color?: string;
  fontSize?: number;
  src?: string;
  mobileSrc?: string;
  alt?: string;
  width?: string;
  href?: string;
  bgColor?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  bgImage?: string;
  mobileBgImage?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  body?: string;
  height?: number;
  // hero-section
  heroBgImage?: string;
  mobileHeroBgImage?: string;
  heroOverlay?: string; // rgba color
  // cards-grid
  sectionTitle?: string;
  cards?: Array<{ image: string; mobileImage?: string; title: string; text: string; btnText: string; btnHref: string }>;
  // faq
  faqTitle?: string;
  faqSubtitle?: string;
  faqItems?: Array<{ id: string; q: string; a: string }>;
  // two-col
  imageLeft?: boolean;
  twoColImage?: string;
  mobileTwoColImage?: string;
  twoColTitle?: string;
  twoColText?: string;
  twoColBtnText?: string;
  twoColBtnHref?: string;
  // donation-qr
  qrEyebrow?: string;
  qrTitle?: string;
  qrText?: string;
  qrPayload?: string;
  qrAccountLabel?: string;
  qrAccountNumber?: string;
  qrBankCode?: string;
  qrVariableSymbol?: string;
  qrMessage?: string;
  qrNote?: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  blocks: PageBlock[];
}

export interface RouteRedirect {
  id: string;
  from: string;
  to: string;
  target?: string;
  createdAt?: string;
}

export interface SiteSettings {
  accentColor: string;
  logoUrl: string;
  mobileLogoUrl?: string;
  metaTitle: string;
  metaDescription: string;
  customCss: string;
}

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  weight: number;
  isLoss: boolean;
  coupon: string;
}

export type WheelShowFrequency = "once_per_day" | "every_visit" | "once_per_session";
export type WheelDisplayStyle = "popup" | "side_tab" | "embedded";

export interface WheelOfFortuneConfig {
  enabled: boolean;
  showFrequency: WheelShowFrequency;
  displayStyle: WheelDisplayStyle;
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  spinButtonText: string;
  privacyText: string;
  winTitle: string;
  winText: string;
  lossTitle: string;
  lossText: string;
  segments: WheelSegment[];
}

export interface MoonWidgetConfig {
  aria: string;
  close: string;
  illumination: string;
  phases: Record<string, { label: string; description: string }>;
  stages: Record<string, string>;
}

export interface AboutPageSection {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroMobileImage?: string;
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

export type PricingRow = { label: string; price: string };
export type TwoColItem = { label: string; text: string };
export type ServiceSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  rows?: PricingRow[];
  twoCol?: TwoColItem[];
  price?: string;
};

export type ServiceItem = {
  id: string;
  symbol: string;
  emoji: string;
  color: string;
  title: string;
  teaser: string;
  lead: string;
  body?: string;
  sections: ServiceSection[];
  cta: { label: string; href: string };
};

export interface ServicesContent {
  homeEyebrow: string;
  homeTitle: string;
  homeSubtitle: string;
  homeCardLinkText: string;
  pageHeroEyebrow: string;
  pageHeroTitle: string;
  pageHeroText: string;
  pageHeroButtonText: string;
  pageHeroButtonHref: string;
  pageIntroIcon: string;
  pageIntroTitle: string;
  pageIntroText: string;
  pageGridTitle: string;
  pageGridSubtitle: string;
  pageTileLinkText: string;
  pageWhyTitle: string;
  pageWhyText1: string;
  pageWhyText2: string;
  pageWhyButtonText: string;
  pageWhyButtonHref: string;
  pageSpecificIcon: string;
  pageSpecificTitle: string;
  pageSpecificText1: string;
  pageSpecificText2: string;
  pageConsultIcon: string;
  pageConsultTitle: string;
  pageConsultText: string;
  pageConsultButtonText: string;
  pageConsultButtonHref: string;
  items: ServiceItem[];
}

export interface CrystalBallContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  ariaLabel: string;
  inputPlaceholder: string;
  buttonText: string;
  loadingText: string;
  consultLead: string;
  consultLinkText: string;
  answers: string[];
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
  };
  newsletter: {
    title: string;
    body: string;
    buttonText: string;
    image: string;
    mobileImage?: string;
  };
  about: {
    title: string;
    body1: string;
    body2: string;
    buttonText: string;
    buttonHref: string;
    imageTop: string;
    mobileImageTop?: string;
    imageBottom: string;
    mobileImageBottom?: string;
  };
  testimonials: {
    sectionTitle: string;
    items: Testimonial[];
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
    mobileImage?: string;
    gameTitle: string;
    gameIntro: string;
    gameInstructions: string;
    revealLabel: string;
    cardBackGradient: string;
    cards: PickACardGameCard[];
  };
  oracle: {
    title: string;
    body: string;
    /** Zůstává kvůli starým záznamům v DB — sekce se dnes renderuje jako obrázek. */
    youtubeUrl: string;
    image: string;
    mobileImage: string;
  };
  crystalBall: CrystalBallContent;
  footer: {
    newsletterTitle: string;
    copyright: string;
    footerLinks: FooterLink[];
    socialLinks: SocialLink[];
  };
  aboutPage: AboutPageSection;
  servicesContent: ServicesContent;
  pages: CustomPage[];
  routeRedirects: RouteRedirect[];
  siteSettings: SiteSettings;
  wheelOfFortune: WheelOfFortuneConfig;
  moonWidget: MoonWidgetConfig;
}

export const SITE = "https://www.asteralight.cz";

export const DEFAULT_CONTENT: SiteContent = {
  header: {
    navItems: [
      { label: "O mně", href: "/o-mne" },
      { label: "Služby", href: "/sluzby" },
      { label: "Konzultace", href: "/konzultace" },
      { label: "E-shop", href: `${SITE}/shop/` },
      { label: "Kniha", href: "/kniha" },
      { label: "FAQ", href: "/navody" },
      { label: "Vyber kartu", href: "/pick-a-card" },
      { label: "Jak poděkovat", href: "/jak-podekovat" },
    ],
    logoHref: SITE,
    signInHref: `${SITE}/login/`,
  },
  hero: {
    title: "Objev svůj klid s Asterou",
    subtitle: "Prostor, energie i vnitřní nastavení se mohou znovu nadechnout.",
    ctaText: "O mně",
    ctaHref: "#o-astere",
    backgroundImage: "/uploads/astera-upload-1777542736772-d2souok25x7.png",
    mobileImage: "/uploads/astera-upload-1777542736772-d2souok25x7.png",
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
    image: "/images/astera-with-computer.jpg",
    mobileImage: "",
  },
  about: {
    title: "O Asteře",
    body1: "Astera je průvodkyně pro chvíle, kdy domov, práce nebo vnitřní prostor potřebují znovu nadechnout. Spojuje citlivou intuici s praktickým, klidným přístupem a pomáhá lidem vracet do jejich prostoru lehkost, bezpečí a jasnější energii.",
    body2: "Její práce stojí na respektu, etice a individuálním vnímání každého místa i člověka. Nehledá rychlé efekty, ale skutečnou harmonii: takovou, kterou můžete cítit v každodenním životě a dál o ni pečovat vlastními silami.",
    buttonText: "Více o mně",
    buttonHref: "/about",
    imageTop: "/images/astera-about-home.png",
    mobileImageTop: "",
    imageBottom: "",
    mobileImageBottom: "",
  },
  testimonials: {
    sectionTitle: "Co o mně říkají",
    items: [
      { name: "Tereza K.", emoji: "🌙", text: "Konzultace s Asterou mi otevřela oči. Konečně jsem pochopila, proč opakuji stejné vzorce ve vztazích. Přesné, laskavé a hluboce pravdivé." },
      { name: "Markéta V.", emoji: "✨", text: "Numerologický rozbor byl neuvěřitelně přesný. Astera mi pomohla pochopit mé životní číslo a nasměrovat energii tam, kam patří." },
      { name: "Jana H.", emoji: "🔮", text: "Výklad karet byl tak přesný, až mi naskočila husí kůže. Astera má vzácný dar — mluví přímo k duši, bez zbytečných obalů." },
      { name: "Lucie M.", emoji: "🌸", text: "Po konzultaci jsem konečně přijala rozhodnutí, které jsem odkládala celý rok. Cítila jsem se bezpečně a pochopena." },
      { name: "Petra Š.", emoji: "💫", text: "Astera propojuje intuici s praktickými radami. Nejen že mi řekla, co vidí — pomohla mi i pochopit, co s tím dělat." },
    ],
  },
  manifest: {
    sectionTitle: "Vyber si, co právě potřebuješ",
    cards: [
      {
        image: "/images/vyber-si-kartu.png",
        badge: "",
        title: "Vyber si kartu",
        text: "Zastav se, nadechni se a vyber si intuitivní kartu dne. Krátký vzkaz ti pomůže naladit se na další krok a vlastní vnitřní hlas.",
        btnText: "Vybrat kartu",
        btnHref: "/pick-a-card",
      },
      {
        image: "/images/kniha-astera.png",
        badge: "/images/new-book-icon.png",
        title: "Kniha a inspirace",
        text: "Praktické vedení pro chvíle, kdy chcete lépe porozumět sobě, svým záměrům a tomu, co ve svém životě opravdu tvoříte.",
        btnText: "Zjistit více",
        btnHref: `${SITE}/art-of-manifesting/`,
      },
      {
        image: "/images/408x410-OracleSecretsWebinar-Event-Promo.jpg",
        badge: "/images/Live-Event.png",
        title: "Akce a setkání",
        text: "Živé i online akce pro ty, kdo chtějí zažít jasnější vedení, zklidnění a podporu v bezpečném prostoru.",
        btnText: "Rezervovat místo",
        btnHref: `${SITE}/events/`,
      },
    ],
  },
  pickacard: {
    title: "Vyber si kartu",
    body: "Zastav se, nadechni se a nech intuici vybrat kartu, která s tebou právě teď nejvíc rezonuje. Krátké vedení ti může pomoci pojmenovat další krok.",
    buttonText: "Vybrat kartu",
    buttonHref: `${SITE}/pick-a-card/`,
    image: "/images/astera-pick-card.png",
    mobileImage: "",
    gameTitle: "Vyberte si svojí kartu",
    gameIntro: "Karty jsou starodávným nástrojem duchovního vedení. Položte si v duchu otázku, projděte kartami a vyberte tu, která vás osloví. Karta vám poskytne vhled do dalšího kroku.",
    gameInstructions: "Posuňte kartami nebo klikněte na šipky. Pak kliknutím vyberte svou kartu.",
    revealLabel: "Vaše karta pro dnešek",
    cardBackGradient: "linear-gradient(135deg, #f5b8c8 0%, #c9a4d4 50%, #f5d4a8 100%)",
    cards: [
      { id: "1", title: "Milost v chaosu", concepts: "milost, volba, přijetí složitostí", message: "I uprostřed bouře je v tobě klidné místo. Dovol si tam vstoupit a naslouchat.", gradient: "linear-gradient(135deg, #7c3bb2 0%, #c9a84c 100%)", symbol: "✦", image: "" },
      { id: "2", title: "Nová cesta", concepts: "začátek, odvaha, důvěra", message: "Před tebou se otevírá nová stezka. Udělej první krok, i když nevidíš celou cestu.", gradient: "linear-gradient(135deg, #c9a84c 0%, #f5e9c8 100%)", symbol: "☽", image: "" },
      { id: "3", title: "Hluboké uzdravení", concepts: "léčení, soucit, péče", message: "Tvé tělo i duše vědí, jak se uzdravit. Dej jim čas a něžnou pozornost.", gradient: "linear-gradient(135deg, #6ab7a8 0%, #c9e8df 100%)", symbol: "❋", image: "" },
      { id: "4", title: "Strážce moudrosti", concepts: "intuice, vedení, vnitřní hlas", message: "Odpověď, kterou hledáš venku, již znáš uvnitř. Ztiš se a naslouchej.", gradient: "linear-gradient(135deg, #2d4a6e 0%, #7c9bbf 100%)", symbol: "✧", image: "" },
      { id: "5", title: "Tanec hojnosti", concepts: "hojnost, vděčnost, otevření", message: "Vesmír ti chce dát víc, než si dovedeš představit. Otevři dlaně k přijetí.", gradient: "linear-gradient(135deg, #d4814a 0%, #f5d4a8 100%)", symbol: "✺", image: "" },
      { id: "6", title: "Tichý hlas", concepts: "ticho, kontemplace, vhled", message: "Ne každá odpověď přichází slovy. Někdy je největší pravda v tichu.", gradient: "linear-gradient(135deg, #4a4063 0%, #9b8fb5 100%)", symbol: "◯", image: "" },
      { id: "7", title: "Plamen vášně", concepts: "tvoření, oheň, akce", message: "Tvá vášeň je posvátná. Nedovol nikomu, aby ji utlumil — naopak ji rozdmýchej.", gradient: "linear-gradient(135deg, #b2384a 0%, #f5a89b 100%)", symbol: "✸", image: "" },
      { id: "8", title: "Měsíční brána", concepts: "cykly, ženská energie, plynutí", message: "Vše má svůj čas — odliv i příliv. Důvěřuj rytmu, ve kterém právě jsi.", gradient: "linear-gradient(135deg, #3a5f8a 0%, #c5d8e8 100%)", symbol: "☾", image: "" },
      { id: "9", title: "Strom kořenů", concepts: "stabilita, uzemnění, předkové", message: "Tvé kořeny sahají hluboko. Stůj pevně a vítr tě jen posílí.", gradient: "linear-gradient(135deg, #5a4a2e 0%, #c9a84c 100%)", symbol: "⚘", image: "" },
      { id: "10", title: "Křídla svobody", concepts: "svoboda, nadhled, odpoutání", message: "To, co tě svazovalo, již nemá moc. Rozpřáhni křídla — patří ti celé nebe.", gradient: "linear-gradient(135deg, #87a9c9 0%, #e8f1f8 100%)", symbol: "✶", image: "" },
      { id: "11", title: "Setkání duší", concepts: "spojení, láska, rezonance", message: "Ten správný člověk přichází ve správný čas. Buď tím, kým jsi — to je tvůj magnet.", gradient: "linear-gradient(135deg, #b35a8a 0%, #f5c5d8 100%)", symbol: "♡", image: "" },
      { id: "12", title: "Hvězdná setba", concepts: "vize, manifestace, sen", message: "Sen, který nosíš v srdci, není náhoda. Zalévej ho denně malými činy.", gradient: "linear-gradient(135deg, #1a1f4a 0%, #c9a84c 100%)", symbol: "✦", image: "" },
      { id: "13", title: "Křišťálové zrcadlo", concepts: "pravda, sebevidění, jasnost", message: "Podívej se na sebe laskavě a bez přikrášlení. To, co uvidíš, tě neodsoudí — osvobodí tě.", gradient: "linear-gradient(135deg, #d7f0f2 0%, #8aaec4 100%)", symbol: "◇", image: "" },
      { id: "14", title: "Zlatý práh", concepts: "přechod, rozhodnutí, připravenost", message: "Stojíš na prahu změny. Nemusíš spěchat, stačí vědomě projít dveřmi, které se otevírají.", gradient: "linear-gradient(135deg, #8f5f1f 0%, #f1c76a 100%)", symbol: "⌁", image: "" },
      { id: "15", title: "Studna klidu", concepts: "ztišení, obnova, vnitřní zdroj", message: "Když se svět zdá příliš hlasitý, vrať se k vlastnímu prameni. Ticho tě znovu naplní.", gradient: "linear-gradient(135deg, #23495b 0%, #9cc9c3 100%)", symbol: "◌", image: "" },
      { id: "16", title: "Jiskra záměru", concepts: "záměr, tvoření, první krok", message: "Tvůj záměr už má sílu. Dej mu tvar jedním konkrétním krokem ještě dnes.", gradient: "linear-gradient(135deg, #69306d 0%, #f0a45d 100%)", symbol: "✹", image: "" },
      { id: "17", title: "Hebká hranice", concepts: "hranice, péče, sebeúcta", message: "Říct ne může být nejněžnější způsob, jak říct ano sobě. Tvoje energie si zaslouží ochranu.", gradient: "linear-gradient(135deg, #875c74 0%, #f4c7c3 100%)", symbol: "⌒", image: "" },
      { id: "18", title: "Koruna odvahy", concepts: "síla, důstojnost, rozhodnost", message: "Nemusíš čekat, až si budeš jistá. Odvaha se rodí ve chvíli, kdy jednáš i s třesoucím se srdcem.", gradient: "linear-gradient(135deg, #51306b 0%, #d4a84f 100%)", symbol: "♔", image: "" },
      { id: "19", title: "Řeka proměny", concepts: "plynutí, změna, uvolnění", message: "To, co odchází, netlač zpět ke břehu. Proud tě nese k prostoru, kde budeš dýchat volněji.", gradient: "linear-gradient(135deg, #256078 0%, #86d1c5 100%)", symbol: "≈", image: "" },
      { id: "20", title: "Lucerna předků", concepts: "kořeny, podpora, dědictví", message: "Nejdeš sama. Za tebou stojí síla těch, kteří přežili, milovali a předali ti světlo.", gradient: "linear-gradient(135deg, #3f2f27 0%, #c68f55 100%)", symbol: "✺", image: "" },
      { id: "21", title: "Růžový kompas", concepts: "srdce, směr, jemné vedení", message: "Správný směr nemusí být nejhlasitější. Poznáš ho podle toho, že se u něj tvé tělo trochu uvolní.", gradient: "linear-gradient(135deg, #9f5f83 0%, #f2c4d6 100%)", symbol: "⌖", image: "" },
      { id: "22", title: "Oko intuice", concepts: "vhled, signály, důvěra", message: "Všímáš si správných znamení. Přestaň je zpochybňovat jen proto, že přišla tiše.", gradient: "linear-gradient(135deg, #1f2f62 0%, #8a78c9 100%)", symbol: "◉", image: "" },
      { id: "23", title: "Zahrada trpělivosti", concepts: "růst, čas, péče", message: "Ne všechno, co roste, je hned vidět. Pečuj o své semínko a nech mu jeho posvátný čas.", gradient: "linear-gradient(135deg, #3f6d4e 0%, #c5d89b 100%)", symbol: "✿", image: "" },
      { id: "24", title: "Dveře radosti", concepts: "lehkost, potěšení, otevření", message: "Radost není odměna až po práci. Je to energie, která ti pomůže projít dál.", gradient: "linear-gradient(135deg, #c27a44 0%, #f4d27f 100%)", symbol: "☼", image: "" },
      { id: "25", title: "Sametová noc", concepts: "odpočinek, sny, nevědomí", message: "Odpověď může přijít až ve chvíli, kdy přestaneš tlačit. Dovol noci, aby za tebe něco poskládala.", gradient: "linear-gradient(135deg, #161b3f 0%, #6d5d96 100%)", symbol: "☽", image: "" },
      { id: "26", title: "Bílý plamen", concepts: "očista, pravdivost, nový začátek", message: "Nech shořet to, co už neodpovídá tvé pravdě. Po očistě zůstane jen to, co má sílu žít.", gradient: "linear-gradient(135deg, #f7f3e8 0%, #d6b76a 100%)", symbol: "♢", image: "" },
      { id: "27", title: "Most důvěry", concepts: "důvěra, spojení, překlenutí", message: "Nemusíš znát celý plán. Stačí udělat krok na most, který se ukáže pod tvýma nohama.", gradient: "linear-gradient(135deg, #4f6f8f 0%, #c6b6d8 100%)", symbol: "⌇", image: "" },
      { id: "28", title: "Medové slunce", concepts: "vitalita, vděčnost, obnova sil", message: "Tvá energie se vrací skrze malé radosti. Dnes si dovol něco, co tě zahřeje zevnitř.", gradient: "linear-gradient(135deg, #b85c3c 0%, #f3c86f 100%)", symbol: "✷", image: "" },
      { id: "29", title: "Tajemství hlubin", concepts: "stín, hloubka, přijetí", message: "To, čeho se bojíš podívat, nemusí být nepřítel. Možná je to část tebe, která čeká na objetí.", gradient: "linear-gradient(135deg, #12343f 0%, #5b7890 100%)", symbol: "◆", image: "" },
      { id: "30", title: "Vědomý návrat", concepts: "návrat k sobě, integrace, klid", message: "Všechno, co hledáš, tě nakonec vede zpět k sobě. Vrať se domů do vlastního dechu.", gradient: "linear-gradient(135deg, #6d4d7d 0%, #d9c7a3 100%)", symbol: "◎", image: "" },
    ],
  },
  oracle: {
    title: "Měsíční intuitivní vhled",
    body: "Krátké vedení pro období, kdy potřebujete víc klidu, jasnosti a důvěry v další krok.",
    youtubeUrl: "https://www.youtube.com/embed/UcJoLcwuMP4",
    image: "/images/oracle-video-thumb.jpg",
    mobileImage: "",
  },
  crystalBall: {
    eyebrow: "Křišťálová koule",
    title: "Zeptej se křišťálové koule",
    subtitle: "Nech křišťálovou kouli odhalit, co si teď žádá tvou pozornost…",
    image: "/images/crystal-ball-astera.png",
    mobileImage: "/images/crystal-ball-astera.png",
    ariaLabel: "Klikni na kouli",
    inputPlaceholder: "Napiš svou otázku…",
    buttonText: "Zeptat se koule",
    loadingText: "Koule naslouchá…",
    consultLead: "Cítíš, že v poselství je něco víc?",
    consultLinkText: "Konzultace ti pomůže porozumět tomu do hloubky.",
    answers: [
      "Záři mezi správnými lidmi.",
      "Buď k sobě laskavá.",
      "Naslouchej své intuici.",
      "Malé změny pomohou.",
      "Ukliď své finance.",
      "Přehodnoť své vztahy.",
      "Dopřej mysli klid.",
      "Zpomal a odpočívej.",
      "Otevři staré otázky.",
      "Všímej si znamení.",
      "Následuj svá přání.",
      "Pusť staré věci.",
    ],
  },
  footer: {
    newsletterTitle: "Získej jemné vedení a novinky od Astery.",
    copyright: "© 2026 Astera Light. Všechna práva vyhrazena.",
    footerLinks: [
      { label: "Ochrana osobních údajů", href: `${SITE}/privacy-policy/` },
      { label: "Obchodní podmínky", href: `${SITE}/terms-of-use/` },
      { label: "Reklamace a vrácení", href: `${SITE}/returns/` },
      { label: "Platební podmínky", href: `${SITE}/payment-plan-terms/` },
      { label: "Podmínky členství", href: `${SITE}/membership-terms/` },
    ],
    socialLinks: [
      { name: "Facebook", href: "https://www.facebook.com/asteralight" },
      { name: "Instagram", href: "https://www.instagram.com/asteralight/" },
      { name: "YouTube", href: "https://www.youtube.com/@asteralight" },
      { name: "Pinterest", href: "https://www.pinterest.com/asteralight/" },
      { name: "TikTok", href: "https://www.tiktok.com/@asteralight" },
      { name: "LinkedIn", href: "https://www.linkedin.com/in/asteralight" },
    ],
  },
  moonWidget: {
    aria: "Fáze měsíce",
    close: "Zavřít",
    illumination: "osvětlení",
    phases: {
      "New Moon": { label: "Nový měsíc", description: "Měsíc není viditelný. Čas nových záměrů, začátků a otevírání nových kapitol." },
      "Waxing Crescent": { label: "Dorůstající srpek", description: "Světlo pomalu přibývá. Ideální čas pro plánování, budování a první kroky." },
      "First Quarter": { label: "První čtvrtina", description: "Polovina cesty k úplňku. Čas rozhodnutí a překonávání překážek." },
      "Waxing Gibbous": { label: "Dorůstající měsíc", description: "Energie a světlo narůstají. Záměry se rozvíjejí, dochází k pokroku." },
      "Full Moon": { label: "Úplněk", description: "Měsíc svítí v plné síle. Vrchol energie, vyvrcholení a osvícení." },
      "Waning Gibbous": { label: "Ubývající měsíc", description: "Světlo začíná ubývat. Čas vděčnosti, sdílení a reflexe." },
      "Third Quarter": { label: "Poslední čtvrtina", description: "Čas uvolnění a odpouštění. Zbavte se toho, co již neslouží." },
      "Last Quarter": { label: "Poslední čtvrtina", description: "Čas uvolnění a odpouštění. Zbavte se toho, co již neslouží." },
      "Waning Crescent": { label: "Ubývající srpek", description: "Příprava na nový cyklus. Odpočinek, introspekce a odevzdání." },
    },
    stages: {
      Waxing: "dorůstající",
      Waning: "ubývající",
    },
  },
  aboutPage: {
    heroTitle: "About Astera-Light",
    heroSubtitle: "Intuitivní průvodkyně pro klid, energii a harmonii prostoru.",
    heroImage: "/images/astera-home-top.png",
    heroMobileImage: "",
    bio1: "Astera-Light provází lidi chvílemi, kdy jejich domov, pracovní prostor nebo vnitřní nastavení potřebují znovu klid, lehkost a jasnost.",
    bio2: "Její práce propojuje citlivou intuici s praktickým přístupem. Věnuje se očistě prostor, energetické harmonizaci a jednoduchým postupům, které si klienti mohou dlouhodobě osvojit.",
    bio3: "Každý prostor vnímá individuálně a s respektem. Důraz klade na etiku, bezpečí a výsledek, který podporuje každodenní život, ne jen krátkodobý efekt.",
    quoteText: "You are not a human being having a spiritual experience. You are a spiritual being having a human experience.",
    quoteAuthor: "— Astera-Light",
    ctaTitle: "Chcete začít?",
    ctaText: "Vyberte si službu, která vám pomůže vrátit do prostoru i života více klidu.",
    ctaButtonText: "Zobrazit služby",
    ctaButtonHref: `${SITE}/courses/`,
    statsItems: [
      { number: "1:1", label: "Individuální přístup" },
      { number: "100%", label: "Etická práce" },
      { number: "Online", label: "Konzultace" },
      { number: "CZ", label: "Český obsah" },
    ],
  },
  servicesContent: {
    homeEyebrow: "✦ ✦ ✦",
    homeTitle: "Vyberte službu, která vás oslovuje",
    homeSubtitle: "✦   Každá cesta je jedinečná   ✦",
    homeCardLinkText: "Zjistit více",
    pageHeroEyebrow: "✦   Astera · Individuální přístup   ✦",
    pageHeroTitle: "Nabídka služeb",
    pageHeroText: "Prostor pro hlubokou práci, která vám pomůže zorientovat se v životě, uvolnit to, co vás brzdí, a znovu se napojit na sebe.",
    pageHeroButtonText: "Rezervovat termín",
    pageHeroButtonHref: "https://app.rezora.cz/book/astera",
    pageIntroIcon: "🌟",
    pageIntroTitle: "Najděte odpovědi, klid a směr",
    pageIntroText: "Pracuji individuálně, citlivě a s důrazem na kvalitu – každé setkání i služba je jedinečná. Součástí služeb není jen samotná práce, ale i zaškolení a poradenství. Naučím vás jednoduché a účinné způsoby vhodné speciálně pro vás, šité přesně na míru, a tak mě budete potřebovat jen ve výjimečných situacích!",
    pageGridTitle: "Vyberte službu, která vás oslovuje",
    pageGridSubtitle: "✦   Každá cesta je jedinečná   ✦",
    pageTileLinkText: "Zjistit více →",
    pageWhyTitle: "Proč pracovat se mnou",
    pageWhyText1: "Každé setkání i každá vytvořená věc vychází z individuálního přístupu, hlubokého vnímání a respektu k vaší situaci.",
    pageWhyText2: "Nejde o univerzální řešení, ale o cílenou práci, která má skutečný dopad. Pokud cítíte, že je čas něco změnit, uvolnit nebo pochopit, ráda vás tímto procesem provedu.",
    pageWhyButtonText: "Rezervovat termín",
    pageWhyButtonHref: "https://app.rezora.cz/book/astera",
    pageSpecificIcon: "🕊️",
    pageSpecificTitle: "Specifické případy",
    pageSpecificText1: "Pracuji také s prostory, kde došlo k úmrtí, zejména po dlouhé a náročné nemoci. V takových místech může přetrvávat energetická stopa spojená s bolestí či vyčerpáním.",
    pageSpecificText2: "Po ošetření prostoru je možné jej znovu plnohodnotně obývat, pronajmout nebo prodat — s pocitem klidu a jistoty.",
    pageConsultIcon: "💜",
    pageConsultTitle: "Nemáte jistotu nebo rozpočet?",
    pageConsultText: "Pokud si nejste jistí, zda je nějaká služba pro vás vhodná, nebo aktuálně nemáte možnost ji využít, nabízím také individuální konzultace kde vyhodnotíme co zrovna potřebujete pro zlepšení kvality života, pocitu naplněnosti a klidu.",
    pageConsultButtonText: "Rezervovat termín",
    pageConsultButtonHref: "https://app.rezora.cz/book/astera",
    items: [
      {
        id: "karty", symbol: "☽", emoji: "🃏", color: "#9b6fd4",
        title: "Výklad karet",
        teaser: "Získejte jasnější pohled na to, co se právě děje – i kam vaše cesta směřuje.",
        lead: "Hledáte odpovědi, směr nebo ujištění v důležité životní situaci? Výklad karet vám pomůže nahlédnout pod povrch a získat jasnější pohled na to, co se právě děje – i kam vaše cesta směřuje.",
        body: "Vstupte do prostoru, kde se zastavuje čas a odpovědi přicházejí v pravý okamžik.",
        sections: [
          { heading: "Jak probíhá výklad", paragraphs: ["Výklad karet je hluboký a osobní proces. Každé sezení je zcela individuální a věnuji se pouze omezenému počtu klientů, aby byla zachována maximální kvalita a hloubka práce.", "Pracuji především s Tarotem, doplňkově využívám orákula, cikánské karty, runy a další nástroje."] },
          { heading: "Formy výkladu", rows: [{ label: "Online živě (60–90 minut)", price: "3 600 Kč" }, { label: "Videozpráva (soukromý odkaz na YouTube)", price: "2 600 Kč" }, { label: "Textová zpráva nebo e-mail včetně fotografií", price: "1 200 Kč" }] },
          { heading: "Osobní setkání v Praze", paragraphs: ["Pro hlubší a intenzivnější práci nabízím také osobní setkání (60–180 minut).", "Toto sezení je určeno pouze pro stávající klienty, kteří již mají zkušenost s online výkladem. Kombinuje výklad, poradenství, channeling, mediumství a energetickou harmonizaci."], rows: [{ label: "Cena osobního setkání", price: "5 900 Kč" }] },
        ],
        cta: { label: "Rezervovat termín", href: "https://app.rezora.cz/book/astera" },
      },
      {
        id: "ocista", symbol: "✦", emoji: "🏠", color: "#5a9e7c",
        title: "Očista prostor",
        teaser: "Navracím do domovů a pracovních prostor klid, lehkost a pocit bezpečí.",
        lead: "Pomáhám navracet do domovů i pracovních prostor klid, lehkost a pocit bezpečí. Očista přináší rovnováhu a uvolnění tam, kde se hromadí napětí nebo stagnace.",
        sections: [
          { heading: "Kdy je očista vhodná", list: ["při stěhování", "po náročných životních obdobích", "při dlouhodobé nemoci v prostoru", "při pocitu neklidu, napětí nebo nevysvětlitelných jevů"] },
          { heading: "Ceník (orientační)", paragraphs: ["Očistu provádím individuálně, s respektem k prostoru i jeho obyvatelům."], rows: [{ label: "Garsonka a 1+kk", price: "3 900 – 4 900 Kč" }, { label: "2+kk a byty do 50 m²", price: "5 900 – 7 900 Kč" }, { label: "3+kk až 5+kk do 120 m²", price: "8 900 – 13 900 Kč" }, { label: "Rodinné domy a samostatné objekty", price: "14 900 – 29 900 Kč" }, { label: "Průvodce samostatnou očistou (e-shop)", price: "1 290 Kč" }] },
        ],
        cta: { label: "Rezervovat termín", href: "https://app.rezora.cz/book/astera" },
      },
      {
        id: "amulety", symbol: "⊕", emoji: "✨", color: "#c08040",
        title: "Amulety a talismany",
        teaser: "Osobní předmět nositelem záměru, energie a vědomé práce na vaší cestě.",
        lead: "Osobní amulet nebo talisman je víc než jen předmět. Je nositelem záměru, energie a vědomé práce, která vás provází na vaší cestě.",
        body: "Každý kus vzniká individuálně, v napojení na vaši energii a konkrétní záměr.",
        sections: [
          { heading: "Rozdíl mezi amuletem a talismanem", twoCol: [{ label: "Amulet", text: "Chrání, vytváří štít a ochrannou bariéru. Pomáhá odpuzovat nežádoucí vlivy, situace, energie nebo konkrétní osoby. Omezuje to, co vás oslabuje nebo narušuje vaši rovnováhu." }, { label: "Talisman", text: "Posiluje to, co chcete ve svém životě rozvíjet. Přitahuje žádoucí energii, příležitosti a lidi. Podporuje vaše záměry, zvyšuje šance a zesiluje to, po čem toužíte." }] },
          { heading: "Možnosti využití", list: ["ochrana a posílení", "přitažení příležitostí", "podpora vztahů nebo přivolání partnera", "ochrana před toxickým prostředím", "důležité životní momenty (zkoušky, cesty apod.)"] },
          { heading: "Jak probíhá spolupráce", paragraphs: ["Součástí procesu je úvodní konzultace, během které společně ujasníme váš záměr a směr tvorby.", "Cena konzultace se následně odečítá z celkové ceny."], rows: [{ label: "Amulet / talisman na míru", price: "4 400 – 19 900 Kč" }] },
        ],
        cta: { label: "Rezervovat termín", href: "https://app.rezora.cz/book/astera" },
      },
      {
        id: "medium", symbol: "☆", emoji: "🌙", color: "#5878c0",
        title: "Mediumní výklady",
        teaser: "Pomáhám najít klid, pochopení a uzavření tam, kde zůstávají nevyřčené věci.",
        lead: "Neuzavřené vztahy nebo ztráta blízkého člověka mohou zůstávat hluboko v nás. Mediumní výklad vám může pomoci najít klid, pochopení i uzavření.",
        body: "Zprostředkovávám komunikaci a vhledy, které vám pomohou uvolnit emoce, dořešit nevyřčené a posunout se dál.",
        sections: [{ rows: [{ label: "Video, online setkání nebo osobně v Praze", price: "3 600 Kč" }] }],
        cta: { label: "Rezervovat termín", href: "https://app.rezora.cz/book/astera" },
      },
      {
        id: "energo", symbol: "◈", emoji: "💫", color: "#a84a80",
        title: "Energetická očista člověka",
        teaser: "Hluboká práce obnovující vnitřní rovnováhu a uvolňující to, co již neslouží.",
        lead: "Jemná, ale hluboká práce, která obnovuje vnitřní rovnováhu a uvolňuje to, co již neslouží.",
        body: "Energetická očista probíhá na dálku a zasahuje pět úrovní bytí – fyzickou, emoční, mentální i další jemnohmotné vrstvy. Výsledkem bývá pocit úlevy, větší lehkosti a návratu k sobě.",
        sections: [{ rows: [{ label: "Individuální sezení na dálku", price: "3 300 Kč" }] }],
        cta: { label: "Rezervovat termín", href: "https://app.rezora.cz/book/astera" },
      },
      {
        id: "na-miru", symbol: "✧", emoji: "🔮", color: "#7c6ad4",
        title: "Služby na míru",
        teaser: "Individuální kombinace vedení, výkladu a energetické práce podle toho, co právě potřebujete.",
        lead: "Někdy se situace nevejde do jedné konkrétní služby. Společně pojmenujeme, co právě řešíte, a navrhnu citlivý postup šitý na míru vašemu záměru, prostoru i aktuální energii.",
        body: "Služba může propojit konzultaci, výklad, očistu, práci se záměrem nebo doporučení dalších kroků podle vaší konkrétní situace.",
        sections: [
          { heading: "Kdy je vhodná", list: ["když si nejste jistí, jakou službu zvolit", "pokud se téma dotýká více oblastí najednou", "když potřebujete individuální plán nebo citlivé nasměrování", "při specifické životní situaci, která vyžaduje osobní přístup"] },
          { heading: "Cena a rozsah", paragraphs: ["Rozsah i forma se domlouvají individuálně podle tématu, hloubky práce a časové náročnosti."], rows: [{ label: "Individuální návrh služby", price: "dle domluvy" }] },
        ],
        cta: { label: "Rezervovat termín", href: "https://app.rezora.cz/book/astera" },
      },
    ],
  },
  pages: [],
  routeRedirects: [],
  siteSettings: {
    accentColor: "#7c3bb2",
    logoUrl: "/images/astera-logo.png",
    mobileLogoUrl: "",
    metaTitle: "Astera Light",
    metaDescription: "Experience Your Magic with Astera-Light",
    customCss: "",
  },
  wheelOfFortune: {
    enabled: true,
    showFrequency: "once_per_day" as WheelShowFrequency,
    displayStyle: "popup" as WheelDisplayStyle,
    title: "Otočte kolem štěstí!",
    subtitle: "Zadejte e-mail a zkuste štěstí – třeba právě dnes vyhrajete!",
    emailPlaceholder: "vas@email.cz",
    spinButtonText: "Točit kolem!",
    privacyText: "Váš e-mail bude použit pouze pro zaslání výhry.",
    winTitle: "Gratulujeme!",
    winText: "Vaše výhra byla odeslána na zadaný e-mail.",
    lossTitle: "Hvězdy se ještě nesrovnaly…",
    lossText: "Ale dáváme vám ještě jednu šanci. Třeba právě teď je váš okamžik.",
    segments: [
      { id: "1", label: "10% sleva", color: "#7c3bb2", weight: 2, isLoss: false, coupon: "SLEVA10" },
      { id: "2", label: "Výklad zdarma", color: "#c9a84c", weight: 1, isLoss: false, coupon: "VYKLAD" },
      { id: "3", label: "Příště štěstí", color: "#4a2880", weight: 3, isLoss: true, coupon: "" },
      { id: "4", label: "15% sleva", color: "#a84a80", weight: 2, isLoss: false, coupon: "SLEVA15" },
      { id: "5", label: "E-book zdarma", color: "#5878c0", weight: 1, isLoss: false, coupon: "EBOOK" },
      { id: "6", label: "Příště štěstí", color: "#3d2060", weight: 3, isLoss: true, coupon: "" },
      { id: "7", label: "20% sleva", color: "#c08040", weight: 1, isLoss: false, coupon: "SLEVA20" },
      { id: "8", label: "Konzultace -50%", color: "#7c6ad4", weight: 1, isLoss: false, coupon: "KONZULTACE50" },
    ],
  },
};
