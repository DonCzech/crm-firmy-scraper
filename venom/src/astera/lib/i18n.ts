import { SiteContent, DEFAULT_CONTENT } from "./content-types";

export type Lang = "cs" | "en" | "ua";

export interface LangMeta {
  code: Lang;
  label: string;
  flag: string;
  hrefLang: string;
}

export const LANGUAGES: LangMeta[] = [
  { code: "cs", label: "Čeština",    flag: "🇨🇿", hrefLang: "cs-CZ" },
  { code: "en", label: "English",    flag: "🇬🇧", hrefLang: "en-GB" },
  { code: "ua", label: "Українська", flag: "🇺🇦", hrefLang: "uk-UA" },
];

export const LOCALIZED_ROUTES = [
  { id: "about", slugs: { cs: "o-mne", en: "about", ua: "pro-mene" } },
  { id: "services", slugs: { cs: "sluzby", en: "services", ua: "posluhy" } },
  { id: "consultation", slugs: { cs: "konzultace", en: "consultation", ua: "konsultatsiya" } },
  { id: "shop", slugs: { cs: "e-shop", en: "shop", ua: "e-shop" } },
  { id: "book", slugs: { cs: "kniha", en: "book", ua: "knyha" } },
  { id: "faq", slugs: { cs: "navody", en: "faq", ua: "faq" } },
  { id: "events", slugs: { cs: "akce", en: "events", ua: "podiyi" } },
  { id: "thanks", slugs: { cs: "jak-podekovat", en: "how-to-thank", ua: "yak-podyakuvaty" } },
  { id: "pick-a-card",      slugs: { cs: "pick-a-card",              en: "pick-a-card",      ua: "vyber-kartu" } },
  { id: "help-center",     slugs: { cs: "napoveda",                 en: "help-center",      ua: "dopomoha" } },
  { id: "contact",         slugs: { cs: "kontakt",                  en: "contact",          ua: "kontakt" } },
  { id: "privacy-policy",  slugs: { cs: "ochrana-osobnich-udaju",   en: "privacy-policy",   ua: "privacy-policy" } },
  { id: "terms-of-use",    slugs: { cs: "obchodni-podminky",        en: "terms-of-use",     ua: "terms-of-use" } },
  { id: "returns",         slugs: { cs: "reklamace",                en: "returns",          ua: "returns" } },
  { id: "payment-terms",   slugs: { cs: "platebni-podminky",        en: "payment-terms",    ua: "payment-terms" } },
  { id: "membership-terms",slugs: { cs: "podminky-clenstvi",        en: "membership-terms", ua: "membership-terms" } },
] as const;

/** Detect language from a pathname like "/en/about" → "en" */
export function detectLang(pathname: string): Lang {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/ua" || pathname.startsWith("/ua/")) return "ua";
  if (pathname === "/cs" || pathname.startsWith("/cs/")) return "cs";
  return "cs";
}

/** Strip the language prefix from a pathname, returning the base path */
export function stripLangPrefix(pathname: string): string {
  if (pathname === "/index" || pathname === "/index.html") return "/";
  if (pathname === "/en" || pathname === "/ua" || pathname === "/cs") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  if (pathname.startsWith("/ua/")) return pathname.slice(3);
  if (pathname.startsWith("/cs/")) return pathname.slice(3);
  return pathname;
}

/** Add a language prefix to a base pathname */
export function addLangPrefix(pathname: string, lang: Lang): string {
  const base = stripLangPrefix(pathname);
  if (lang === "cs") return base === "/" ? "/cs" : `/cs${base}`;
  if (lang === "en") return base === "/" ? "/en" : `/en${base}`;
  if (lang === "ua") return base === "/" ? "/ua" : `/ua${base}`;
  return base;
}

export function localizePath(pathname: string, lang: Lang): string {
  const stripped = stripLangPrefix(pathname).split(/[?#]/)[0] || "/";
  // Next.js prerender quirk: bare-root routes can surface as "/index" in usePathname()
  const base = stripped === "/index" || stripped === "/index.html" ? "/" : stripped;
  if (base === "/") return addLangPrefix("/", lang);

  const parts = base.replace(/^\/+/, "").split("/");
  const first = parts[0];
  const route = LOCALIZED_ROUTES.find(item =>
    Object.values(item.slugs).includes(first as never)
  );

  if (!route) return addLangPrefix(base, lang);

  const translated = route.slugs[lang];
  const rest = parts.slice(1).join("/");
  return addLangPrefix(`/${translated}${rest ? `/${rest}` : ""}`, lang);
}

function splitPathSuffix(pathname: string) {
  const hashIndex = pathname.indexOf("#");
  const queryIndex = pathname.indexOf("?");
  const indexes = [hashIndex, queryIndex].filter(i => i >= 0);
  const suffixIndex = indexes.length > 0 ? Math.min(...indexes) : -1;
  if (suffixIndex < 0) return { path: pathname, suffix: "" };
  return {
    path: pathname.slice(0, suffixIndex),
    suffix: pathname.slice(suffixIndex),
  };
}

function internalPathFromHref(href: string): { path: string; fromAbsoluteUrl: boolean } | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  if (/^(mailto|tel|sms|javascript):/i.test(trimmed)) return null;
  if (trimmed.startsWith("/")) return { path: trimmed, fromAbsoluteUrl: false };

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "asteralight.cz") return null;
    return { path: `${url.pathname}${url.search}${url.hash}`, fromAbsoluteUrl: true };
  } catch {
    return null;
  }
}

function hasKnownLocalizedRoute(pathname: string): boolean {
  const { path } = splitPathSuffix(pathname);
  const parts = path.replace(/^\/+/, "").split("/").filter(Boolean);
  const first = parts[0];
  return LOCALIZED_ROUTES.some(item => Object.values(item.slugs).includes(first as never));
}

export function localizeHref(href: string | undefined, lang: Lang): string {
  if (!href) return href || "";
  const internal = internalPathFromHref(href);
  if (!internal) return href;
  if (internal.fromAbsoluteUrl && !hasKnownLocalizedRoute(internal.path)) return href;

  const { path, suffix } = splitPathSuffix(internal.path);
  const cleanPath = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return `${localizePath(cleanPath || "/", lang)}${suffix}`;
}

export function localizeHtmlHrefs(html: string, lang: Lang): string {
  return html.replace(/\bhref=(["'])(.*?)\1/gi, (_match, quote: string, href: string) => {
    return `href=${quote}${localizeHref(href, lang)}${quote}`;
  });
}

export function resolveLocalizedPageSlug(slug: string, lang: Lang): string[] {
  const route = LOCALIZED_ROUTES.find(item => item.slugs[lang] === slug);
  if (!route) return [slug];

  const fallbacks = [slug, route.slugs.cs];
  return Array.from(new Set(fallbacks));
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH DEFAULT CONTENT
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_EN_CONTENT: SiteContent = {
  ...DEFAULT_CONTENT,
  header: {
    ...DEFAULT_CONTENT.header,
    navItems: [
      { label: "About me",     href: "/en/about" },
      { label: "Services",     href: "/en/services" },
      { label: "Consultation", href: "/en/consultation" },
      { label: "E-shop",       href: "https://www.asteralight.cz/shop/" },
      { label: "Book",         href: "/en/book" },
      { label: "FAQ",          href: "/en/faq" },
      { label: "How to thank", href: "/en/how-to-thank" },
      { label: "Pick a card",  href: "/en/pick-a-card" },
    ],
  },
  hero: {
    ...DEFAULT_CONTENT.hero,
    title: "Discover Your Calm with Astera",
    subtitle: "Your space, energy and inner setting can breathe again.",
    ctaText: "About me",
  },
  newsletter: {
    ...DEFAULT_CONTENT.newsletter,
    title: "Subscribe to the newsletter",
    body: "Once a month I'll send useful tips, gentle guidance and practical guides for harmony at home and in your inner space. No spam — only content that matters.",
    buttonText: "Subscribe",
  },
  moonWidget: {
    aria: "Moon phase",
    close: "Close",
    illumination: "illumination",
    phases: {
      "New Moon": { label: "New Moon", description: "The Moon is not visible. A time for new intentions, beginnings and opening new chapters." },
      "Waxing Crescent": { label: "Waxing Crescent", description: "The light slowly grows. An ideal time for planning, building and first steps." },
      "First Quarter": { label: "First Quarter", description: "Halfway to the full moon. A time for decisions and overcoming obstacles." },
      "Waxing Gibbous": { label: "Waxing Gibbous", description: "Energy and light are increasing. Intentions develop and progress begins to show." },
      "Full Moon": { label: "Full Moon", description: "The Moon shines at full strength. A peak of energy, culmination and illumination." },
      "Waning Gibbous": { label: "Waning Gibbous", description: "The light begins to fade. A time for gratitude, sharing and reflection." },
      "Third Quarter": { label: "Last Quarter", description: "A time for release and forgiveness. Let go of what no longer serves you." },
      "Last Quarter": { label: "Last Quarter", description: "A time for release and forgiveness. Let go of what no longer serves you." },
      "Waning Crescent": { label: "Waning Crescent", description: "Preparation for a new cycle. Rest, introspection and surrender." },
    },
    stages: {
      Waxing: "waxing",
      Waning: "waning",
    },
  },
  about: {
    ...DEFAULT_CONTENT.about,
    title: "About Astera",
    body1: "Astera is a guide for those moments when your home, work or inner space needs to breathe again. She combines sensitive intuition with a practical, calm approach and helps people restore lightness, safety and clearer energy to their space.",
    body2: "Her work is grounded in respect, ethics and an individual perception of each place and person. She doesn't seek quick effects, but real harmony — the kind you can feel in everyday life and continue nurturing on your own.",
    buttonText: "More about me",
  },
  testimonials: {
    ...DEFAULT_CONTENT.testimonials,
    sectionTitle: "What people say about me",
  },
  manifest: {
    sectionTitle: "Choose what you need right now",
    cards: [
      {
        ...DEFAULT_CONTENT.manifest.cards[0],
        title: "Choose a card",
        text: "Stop, breathe and choose an intuitive card of the day. A short message will help you tune into your next step and your own inner voice.",
        btnText: "Choose a card",
      },
      {
        ...DEFAULT_CONTENT.manifest.cards[1],
        title: "Book & inspiration",
        text: "Practical guidance for moments when you want to better understand yourself, your intentions and what you're truly creating in your life.",
        btnText: "Find out more",
      },
      {
        ...DEFAULT_CONTENT.manifest.cards[2],
        title: "Events & gatherings",
        text: "Live and online events for those who want to experience clearer guidance, calm and support in a safe space.",
        btnText: "Reserve a spot",
      },
    ],
  },
  pickacard: {
    ...DEFAULT_CONTENT.pickacard,
    title: "Choose a card",
    body: "Stop, breathe and let your intuition choose the card that resonates with you most right now. A short guidance can help you name your next step.",
    buttonText: "Choose a card",
    gameTitle: "Choose your card",
    gameIntro: "Cards are an ancient tool of spiritual guidance. Hold your question in mind, browse the cards and choose the one that calls to you. The card will offer insight into your next step.",
    gameInstructions: "Swipe through the cards or click the arrows. Then click to choose your card.",
    revealLabel: "Your card for today",
    cards: [
      { id: "1",  title: "Grace in Chaos",        concepts: "grace, choice, embracing complexity",    message: "Even in the middle of the storm there is a calm place within you. Allow yourself to enter it and listen.",                                         gradient: "linear-gradient(135deg, #7c3bb2 0%, #c9a84c 100%)", symbol: "✦", image: "" },
      { id: "2",  title: "New Path",               concepts: "beginning, courage, trust",               message: "A new path opens before you. Take the first step, even if you cannot see the whole road.",                                                       gradient: "linear-gradient(135deg, #c9a84c 0%, #f5e9c8 100%)", symbol: "☽", image: "" },
      { id: "3",  title: "Deep Healing",           concepts: "healing, compassion, care",               message: "Your body and soul know how to heal. Give them time and gentle attention.",                                                                       gradient: "linear-gradient(135deg, #6ab7a8 0%, #c9e8df 100%)", symbol: "❋", image: "" },
      { id: "4",  title: "Guardian of Wisdom",     concepts: "intuition, guidance, inner voice",        message: "The answer you seek outside is already known within. Quiet yourself and listen.",                                                                  gradient: "linear-gradient(135deg, #2d4a6e 0%, #7c9bbf 100%)", symbol: "✧", image: "" },
      { id: "5",  title: "Dance of Abundance",     concepts: "abundance, gratitude, openness",          message: "The universe wants to give you more than you can imagine. Open your palms to receive.",                                                            gradient: "linear-gradient(135deg, #d4814a 0%, #f5d4a8 100%)", symbol: "✺", image: "" },
      { id: "6",  title: "Quiet Voice",            concepts: "silence, contemplation, insight",         message: "Not every answer comes in words. Sometimes the greatest truth lives in silence.",                                                                  gradient: "linear-gradient(135deg, #4a4063 0%, #9b8fb5 100%)", symbol: "◯", image: "" },
      { id: "7",  title: "Flame of Passion",       concepts: "creation, fire, action",                  message: "Your passion is sacred. Don't let anyone dim it — fan it instead.",                                                                               gradient: "linear-gradient(135deg, #b2384a 0%, #f5a89b 100%)", symbol: "✸", image: "" },
      { id: "8",  title: "Moon Gate",              concepts: "cycles, feminine energy, flow",           message: "Everything has its time — ebb and flow. Trust the rhythm you are in right now.",                                                                   gradient: "linear-gradient(135deg, #3a5f8a 0%, #c5d8e8 100%)", symbol: "☾", image: "" },
      { id: "9",  title: "Tree of Roots",          concepts: "stability, grounding, ancestors",         message: "Your roots run deep. Stand firm and the wind will only make you stronger.",                                                                        gradient: "linear-gradient(135deg, #5a4a2e 0%, #c9a84c 100%)", symbol: "⚘", image: "" },
      { id: "10", title: "Wings of Freedom",       concepts: "freedom, perspective, release",           message: "What once bound you no longer has power. Spread your wings — the whole sky is yours.",                                                             gradient: "linear-gradient(135deg, #87a9c9 0%, #e8f1f8 100%)", symbol: "✶", image: "" },
      { id: "11", title: "Souls Meeting",          concepts: "connection, love, resonance",             message: "The right person comes at the right time. Be who you are — that is your magnet.",                                                                  gradient: "linear-gradient(135deg, #b35a8a 0%, #f5c5d8 100%)", symbol: "♡", image: "" },
      { id: "12", title: "Starry Seeding",         concepts: "vision, manifestation, dream",            message: "The dream you carry in your heart is no coincidence. Water it daily with small actions.",                                                           gradient: "linear-gradient(135deg, #1a1f4a 0%, #c9a84c 100%)", symbol: "✦", image: "" },
      { id: "13", title: "Crystal Mirror",         concepts: "truth, self-seeing, clarity",             message: "Look at yourself with kindness and without illusion. What you see won't judge you — it will free you.",                                             gradient: "linear-gradient(135deg, #d7f0f2 0%, #8aaec4 100%)", symbol: "◇", image: "" },
      { id: "14", title: "Golden Threshold",       concepts: "transition, decision, readiness",         message: "You stand on the threshold of change. There is no need to rush — simply walk consciously through the doors that are opening.",                       gradient: "linear-gradient(135deg, #8f5f1f 0%, #f1c76a 100%)", symbol: "⌁", image: "" },
      { id: "15", title: "Well of Stillness",      concepts: "quieting, restoration, inner source",     message: "When the world feels too loud, return to your own spring. Silence will fill you again.",                                                             gradient: "linear-gradient(135deg, #23495b 0%, #9cc9c3 100%)", symbol: "◌", image: "" },
      { id: "16", title: "Spark of Intention",     concepts: "intention, creation, first step",         message: "Your intention already has power. Give it shape with one concrete step today.",                                                                      gradient: "linear-gradient(135deg, #69306d 0%, #f0a45d 100%)", symbol: "✹", image: "" },
      { id: "17", title: "Soft Boundary",          concepts: "boundaries, care, self-respect",          message: "Saying no can be the gentlest way of saying yes to yourself. Your energy deserves protection.",                                                     gradient: "linear-gradient(135deg, #875c74 0%, #f4c7c3 100%)", symbol: "⌒", image: "" },
      { id: "18", title: "Crown of Courage",       concepts: "strength, dignity, decisiveness",         message: "You don't need to wait until you're certain. Courage is born the moment you act with a trembling heart.",                                           gradient: "linear-gradient(135deg, #51306b 0%, #d4a84f 100%)", symbol: "♔", image: "" },
      { id: "19", title: "River of Change",        concepts: "flow, change, release",                   message: "Don't push back what is leaving. The current is carrying you to a place where you will breathe more freely.",                                       gradient: "linear-gradient(135deg, #256078 0%, #86d1c5 100%)", symbol: "≈", image: "" },
      { id: "20", title: "Ancestors' Lantern",     concepts: "roots, support, heritage",                message: "You are not alone. Behind you stands the strength of those who survived, loved and passed on their light to you.",                                   gradient: "linear-gradient(135deg, #3f2f27 0%, #c68f55 100%)", symbol: "✺", image: "" },
      { id: "21", title: "Rose Compass",           concepts: "heart, direction, gentle guidance",       message: "The right direction need not be the loudest. You'll recognise it by the slight relaxation in your body.",                                            gradient: "linear-gradient(135deg, #9f5f83 0%, #f2c4d6 100%)", symbol: "⌖", image: "" },
      { id: "22", title: "Eye of Intuition",       concepts: "insight, signals, trust",                 message: "You are noticing the right signs. Stop second-guessing them just because they came quietly.",                                                        gradient: "linear-gradient(135deg, #1f2f62 0%, #8a78c9 100%)", symbol: "◉", image: "" },
      { id: "23", title: "Garden of Patience",     concepts: "growth, time, care",                      message: "Not everything that grows is visible right away. Tend your seed and allow it its sacred time.",                                                      gradient: "linear-gradient(135deg, #3f6d4e 0%, #c5d89b 100%)", symbol: "✿", image: "" },
      { id: "24", title: "Doors of Joy",           concepts: "lightness, pleasure, openness",           message: "Joy is not a reward after work. It is the energy that will help you move forward.",                                                                  gradient: "linear-gradient(135deg, #c27a44 0%, #f4d27f 100%)", symbol: "☼", image: "" },
      { id: "25", title: "Velvet Night",           concepts: "rest, dreams, the unconscious",           message: "The answer may come only when you stop pushing. Allow the night to piece something together for you.",                                               gradient: "linear-gradient(135deg, #161b3f 0%, #6d5d96 100%)", symbol: "☽", image: "" },
      { id: "26", title: "White Flame",            concepts: "cleansing, truthfulness, new beginning",  message: "Let burn what no longer matches your truth. After the cleansing, only what has the strength to live will remain.",                                   gradient: "linear-gradient(135deg, #f7f3e8 0%, #d6b76a 100%)", symbol: "♢", image: "" },
      { id: "27", title: "Bridge of Trust",        concepts: "trust, connection, bridging",             message: "You don't need to know the whole plan. Just take a step onto the bridge that reveals itself beneath your feet.",                                     gradient: "linear-gradient(135deg, #4f6f8f 0%, #c6b6d8 100%)", symbol: "⌇", image: "" },
      { id: "28", title: "Honey Sun",              concepts: "vitality, gratitude, renewal of energy",  message: "Your energy returns through small joys. Allow yourself something today that warms you from within.",                                                  gradient: "linear-gradient(135deg, #b85c3c 0%, #f3c86f 100%)", symbol: "✷", image: "" },
      { id: "29", title: "Secret of the Depths",  concepts: "shadow, depth, acceptance",               message: "What you fear to look at need not be an enemy. Perhaps it is a part of you that is waiting to be embraced.",                                        gradient: "linear-gradient(135deg, #12343f 0%, #5b7890 100%)", symbol: "◆", image: "" },
      { id: "30", title: "Conscious Return",       concepts: "return to self, integration, calm",       message: "Everything you seek ultimately leads you back to yourself. Come home to your own breath.",                                                            gradient: "linear-gradient(135deg, #6d4d7d 0%, #d9c7a3 100%)", symbol: "◎", image: "" },
    ],
  },
  crystalBall: {
    ...DEFAULT_CONTENT.crystalBall,
    eyebrow: "Crystal Ball",
    title: "Ask the crystal ball",
    subtitle: "Let the crystal ball reveal what is asking for your attention right now…",
    ariaLabel: "Click the crystal ball",
    inputPlaceholder: "Type your question…",
    buttonText: "Ask the crystal ball",
    loadingText: "The crystal ball is listening…",
    consultLead: "Do you feel there is more in this message?",
    consultLinkText: "A consultation can help you understand it more deeply.",
    answers: [
      "Shine among the right people.",
      "Be kind to yourself.",
      "Listen to your intuition.",
      "Small changes will help.",
      "Bring order to your finances.",
      "Reassess your relationships.",
      "Give your mind some peace.",
      "Slow down and rest.",
      "Revisit old questions.",
      "Notice the signs.",
      "Follow your desires.",
      "Let go of old things.",
    ],
  },
  oracle: {
    ...DEFAULT_CONTENT.oracle,
    title: "Monthly Intuitive Insight",
    body: "Short guidance for periods when you need more calm, clarity and trust in your next step.",
  },
  footer: {
    ...DEFAULT_CONTENT.footer,
    newsletterTitle: "Receive gentle guidance and news from Astera.",
    copyright: "© 2026 Astera Light. All rights reserved.",
    footerLinks: [
      { label: "Privacy Policy",    href: "https://www.asteralight.cz/privacy-policy/" },
      { label: "Terms of Use",      href: "https://www.asteralight.cz/terms-of-use/" },
      { label: "Returns & Refunds", href: "https://www.asteralight.cz/returns/" },
      { label: "Payment Terms",     href: "https://www.asteralight.cz/payment-plan-terms/" },
      { label: "Membership Terms",  href: "https://www.asteralight.cz/membership-terms/" },
    ],
  },
  aboutPage: {
    ...DEFAULT_CONTENT.aboutPage,
    heroTitle: "About Astera Light",
    heroSubtitle: "Intuitive guide for calm, energy and the harmony of your space.",
    bio1: "Astera Light accompanies people through moments when their home, work space or inner setting needs calm, lightness and clarity again.",
    bio2: "Her work unites sensitive intuition with a practical approach. She focuses on space cleansing, energetic harmonisation and simple methods that clients can adopt long-term.",
    bio3: "She perceives every space individually and with respect. Her emphasis is on ethics, safety and a result that supports everyday life, not just a short-term effect.",
    quoteText: "You are not a human being having a spiritual experience. You are a spiritual being having a human experience.",
    quoteAuthor: "— Astera Light",
    ctaTitle: "Ready to begin?",
    ctaText: "Choose the service that will help you return more calm to your space and life.",
    ctaButtonText: "View services",
    statsItems: [
      { number: "1:1",    label: "Individual approach" },
      { number: "100%",   label: "Ethical work" },
      { number: "Online", label: "Consultations" },
      { number: "EN",     label: "English content" },
    ],
  },
  servicesContent: {
    ...DEFAULT_CONTENT.servicesContent,
    homeEyebrow: "✦ ✦ ✦",
    homeTitle: "Choose the service that speaks to you",
    homeSubtitle: "✦   Every journey is unique   ✦",
    homeCardLinkText: "Find out more",
    pageHeroEyebrow: "✦   Astera · Individual approach   ✦",
    pageHeroTitle: "Services",
    pageHeroText: "A space for deep work that helps you find your bearings, release what holds you back and reconnect with yourself.",
    pageHeroButtonText: "Book a session",
    pageIntroTitle: "Find answers, calm and direction",
    pageIntroText: "I work individually, sensitively and with an emphasis on quality — every session and service is unique. The service includes not only the work itself but also guidance and advice. I will teach you simple and effective methods tailored specifically for you, so you will only need me in exceptional situations!",
    pageGridTitle: "Choose the service that speaks to you",
    pageGridSubtitle: "✦   Every journey is unique   ✦",
    pageTileLinkText: "Find out more →",
    pageWhyTitle: "Why work with me",
    pageWhyText1: "Every session and every piece of work I create comes from an individual approach, deep perception and respect for your situation.",
    pageWhyText2: "This is not a one-size-fits-all solution, but targeted work with a real impact. If you feel it's time to change, release or understand something, I'd be glad to guide you through that process.",
    pageWhyButtonText: "Book a session",
    pageSpecificTitle: "Specific cases",
    pageSpecificText1: "I also work with spaces where a death has occurred, especially after a long and difficult illness. In such places an energetic imprint connected with pain or exhaustion may remain.",
    pageSpecificText2: "After treating the space it is possible to fully inhabit it again, rent it out or sell it — with a sense of calm and certainty.",
    pageConsultTitle: "Unsure or on a budget?",
    pageConsultText: "If you're not sure which service suits you, or currently can't afford one, I also offer individual consultations where we assess exactly what you need to improve your quality of life, sense of fulfilment and calm.",
    pageConsultButtonText: "Book a session",
    items: DEFAULT_CONTENT.servicesContent.items.map(item => {
      const map: Record<string, Partial<typeof item>> = {
        karty: {
          title: "Card Reading",
          teaser: "Gain a clearer view of what is happening right now — and where your path is heading.",
          lead: "Looking for answers, direction or reassurance in an important life situation? A card reading will help you see beneath the surface and gain a clearer view of what is happening now — and where your path is heading.",
          body: "Enter a space where time slows and answers arrive at just the right moment.",
          sections: [
            { heading: "How a reading works", paragraphs: ["A card reading is a deep and personal process. Each session is entirely individual and I work with a limited number of clients to preserve the highest quality and depth.", "I primarily use Tarot, complemented by oracle cards, gypsy cards, runes and other tools."] },
            { heading: "Reading formats", rows: [{ label: "Online live (60–90 minutes)", price: "CZK 3 600" }, { label: "Video message (private YouTube link)", price: "CZK 2 600" }, { label: "Written message or email with photos", price: "CZK 1 200" }] },
            { heading: "In-person session in Prague", paragraphs: ["For deeper, more intensive work I also offer in-person sessions (60–180 minutes).", "This session is available to existing clients who have already experienced an online reading. It combines reading, counselling, channelling, mediumship and energetic harmonisation."], rows: [{ label: "In-person session", price: "CZK 5 900" }] },
          ],
          cta: { label: "Book a session", href: "https://app.rezora.cz/book/astera" },
        },
        ocista: {
          title: "Space Cleansing",
          teaser: "I restore calm, lightness and a sense of safety to homes and workspaces.",
          lead: "I help restore calm, lightness and a sense of safety to homes and workspaces. Cleansing brings balance and release wherever tension or stagnation has accumulated.",
          sections: [
            { heading: "When is cleansing appropriate", list: ["when moving house", "after a difficult period of life", "after a long illness in the space", "when experiencing restlessness, tension or unexplained phenomena"] },
            { heading: "Pricing (indicative)", paragraphs: ["I carry out each cleansing individually, with respect for the space and its inhabitants."], rows: [{ label: "Studio flat", price: "CZK 3 900 – 4 900" }, { label: "1–2 bedroom flat up to 50 m²", price: "CZK 5 900 – 7 900" }, { label: "2–3 bedroom flat up to 120 m²", price: "CZK 8 900 – 13 900" }, { label: "Houses and independent buildings", price: "CZK 14 900 – 29 900" }, { label: "Self-cleansing guide (e-shop)", price: "CZK 1 290" }] },
          ],
          cta: { label: "Book a session", href: "https://app.rezora.cz/book/astera" },
        },
        amulety: {
          title: "Amulets & Talismans",
          teaser: "A personal object as a carrier of intention, energy and conscious work on your path.",
          lead: "A personal amulet or talisman is more than just an object. It is a carrier of intention, energy and conscious work that accompanies you on your journey.",
          body: "Each piece is created individually, in alignment with your energy and specific intention.",
          sections: [
            { heading: "The difference between an amulet and a talisman", twoCol: [{ label: "Amulet", text: "Protects, creates a shield and a protective barrier. Helps repel unwanted influences, situations, energies or specific people. Limits what weakens you or disrupts your balance." }, { label: "Talisman", text: "Strengthens what you want to develop in your life. Attracts desired energy, opportunities and people. Supports your intentions, increases your chances and amplifies what you desire." }] },
            { heading: "Possible uses", list: ["protection and empowerment", "attracting opportunities", "supporting relationships or attracting a partner", "protection from a toxic environment", "important life moments (exams, travel, etc.)"] },
            { heading: "How the collaboration works", paragraphs: ["The process begins with an introductory consultation during which we clarify your intention and direction.", "The cost of the consultation is then deducted from the overall price."], rows: [{ label: "Custom amulet / talisman", price: "CZK 4 400 – 19 900" }] },
          ],
          cta: { label: "Book a session", href: "https://app.rezora.cz/book/astera" },
        },
        medium: {
          title: "Mediumship Readings",
          teaser: "I help find calm, understanding and closure where unspoken things remain.",
          lead: "Unresolved relationships or the loss of a loved one can stay deep within us. A mediumship reading can help you find calm, understanding and closure.",
          body: "I facilitate communication and insights that help you release emotions, resolve the unspoken and move forward.",
          sections: [{ rows: [{ label: "Video, online session or in-person in Prague", price: "CZK 3 600" }] }],
          cta: { label: "Book a session", href: "https://app.rezora.cz/book/astera" },
        },
        energo: {
          title: "Energetic Cleansing of a Person",
          teaser: "Deep work that restores inner balance and releases what no longer serves.",
          lead: "Gentle yet deep work that restores inner balance and releases what no longer serves.",
          body: "The energetic cleansing takes place remotely and works across five levels of being — physical, emotional, mental and further subtle layers. The result is often a sense of relief, greater lightness and a return to oneself.",
          sections: [{ rows: [{ label: "Individual remote session", price: "CZK 3 300" }] }],
          cta: { label: "Book a session", href: "https://app.rezora.cz/book/astera" },
        },
        "na-miru": {
          title: "Bespoke Services",
          teaser: "An individual combination of guidance, reading and energetic work tailored to what you need right now.",
          lead: "Sometimes a situation doesn't fit neatly into one specific service. Together we will name what you are dealing with and I will suggest a sensitive approach tailored to your intention, space and current energy.",
          body: "The service can combine consultation, reading, cleansing, work with intention or recommendations for next steps based on your specific situation.",
          sections: [
            { heading: "When is it suitable", list: ["when you're not sure which service to choose", "when the topic touches several areas at once", "when you need an individual plan or sensitive direction", "in a specific life situation requiring a personal approach"] },
            { heading: "Price and scope", paragraphs: ["The scope and form are agreed individually according to the topic, depth of work and time required."], rows: [{ label: "Individual service design", price: "by agreement" }] },
          ],
          cta: { label: "Book a session", href: "https://app.rezora.cz/book/astera" },
        },
      };
      return { ...item, ...(map[item.id] ?? {}) };
    }),
  },
  wheelOfFortune: {
    ...DEFAULT_CONTENT.wheelOfFortune,
    title: "Spin the wheel of fortune!",
    subtitle: "Enter your email and try your luck — maybe today is your lucky day!",
    emailPlaceholder: "your@email.com",
    spinButtonText: "Spin the wheel!",
    privacyText: "Your email will only be used to send you your prize.",
    winTitle: "Congratulations!",
    winText: "Your prize has been sent to the email address provided.",
    lossTitle: "The stars haven't aligned yet…",
    lossText: "But we're giving you one more chance. Perhaps right now is your moment.",
    segments: [
      { id: "1", label: "10% off",         color: "#7c3bb2", weight: 2, isLoss: false, coupon: "SLEVA10" },
      { id: "2", label: "Free reading",    color: "#c9a84c", weight: 1, isLoss: false, coupon: "VYKLAD" },
      { id: "3", label: "Better luck next time", color: "#4a2880", weight: 3, isLoss: true,  coupon: "" },
      { id: "4", label: "15% off",         color: "#a84a80", weight: 2, isLoss: false, coupon: "SLEVA15" },
      { id: "5", label: "Free e-book",     color: "#5878c0", weight: 1, isLoss: false, coupon: "EBOOK" },
      { id: "6", label: "Better luck next time", color: "#3d2060", weight: 3, isLoss: true,  coupon: "" },
      { id: "7", label: "20% off",         color: "#c08040", weight: 1, isLoss: false, coupon: "SLEVA20" },
      { id: "8", label: "Consultation -50%", color: "#7c6ad4", weight: 1, isLoss: false, coupon: "KONZULTACE50" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// UKRAINIAN DEFAULT CONTENT
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_UK_CONTENT: SiteContent = {
  ...DEFAULT_CONTENT,
  header: {
    ...DEFAULT_CONTENT.header,
    navItems: [
      { label: "Про мене",     href: "/ua/pro-mene" },
      { label: "Послуги",      href: "/ua/posluhy" },
      { label: "Консультація", href: "/ua/konsultatsiya" },
      { label: "Е-магазин",    href: "https://www.asteralight.cz/shop/" },
      { label: "Книга",        href: "/ua/knyha" },
      { label: "FAQ",            href: "/ua/faq" },
      { label: "Як подякувати",  href: "/ua/yak-podyakuvaty" },
      { label: "Вибери картку",  href: "/ua/vyber-kartu" },
    ],
  },
  hero: {
    ...DEFAULT_CONTENT.hero,
    title: "Знайдіть свій спокій разом з Астерою",
    subtitle: "Ваш простір, енергія та внутрішній стан можуть знову зітхнути вільно.",
    ctaText: "Про мене",
  },
  newsletter: {
    ...DEFAULT_CONTENT.newsletter,
    title: "Підписатися на розсилку",
    body: "Раз на місяць надішлю корисні поради, м'яке керівництво та практичні матеріали для гармонії дому й внутрішнього простору. Без спаму — лише змістовний контент.",
    buttonText: "Підписатися",
  },
  moonWidget: {
    aria: "Фаза місяця",
    close: "Закрити",
    illumination: "освітлення",
    phases: {
      "New Moon": { label: "Новий місяць", description: "Місяць не видно. Час нових намірів, початків і відкриття нових розділів." },
      "Waxing Crescent": { label: "Зростаючий серп", description: "Світло повільно зростає. Ідеальний час для планування, побудови та перших кроків." },
      "First Quarter": { label: "Перша чверть", description: "Половина шляху до повні. Час рішень і подолання перешкод." },
      "Waxing Gibbous": { label: "Зростаючий місяць", description: "Енергія та світло зростають. Наміри розвиваються, з'являється прогрес." },
      "Full Moon": { label: "Повня", description: "Місяць сяє на повну силу. Пік енергії, завершення та осяяння." },
      "Waning Gibbous": { label: "Спадний місяць", description: "Світло починає спадати. Час вдячності, ділення досвідом і рефлексії." },
      "Third Quarter": { label: "Остання чверть", description: "Час відпускання і прощення. Позбудьтеся того, що більше не служить вам." },
      "Last Quarter": { label: "Остання чверть", description: "Час відпускання і прощення. Позбудьтеся того, що більше не служить вам." },
      "Waning Crescent": { label: "Спадний серп", description: "Підготовка до нового циклу. Відпочинок, самоаналіз і прийняття." },
    },
    stages: {
      Waxing: "зростаючий",
      Waning: "спадний",
    },
  },
  about: {
    ...DEFAULT_CONTENT.about,
    title: "Про Астеру",
    body1: "Астера — провідник для тих моментів, коли ваш дім, робота чи внутрішній простір потребує нового подиху. Вона поєднує чутливу інтуїцію з практичним, спокійним підходом та допомагає людям повернути легкість, безпеку і ясну енергію у свій простір.",
    body2: "Її робота ґрунтується на повазі, етиці та індивідуальному сприйнятті кожного місця та людини. Вона не шукає швидких ефектів, а справжньої гармонії — такої, яку можна відчути в повсякденному житті й надалі плекати власними силами.",
    buttonText: "Більше про мене",
  },
  testimonials: {
    ...DEFAULT_CONTENT.testimonials,
    sectionTitle: "Що про мене кажуть",
  },
  manifest: {
    sectionTitle: "Оберіть те, що вам зараз потрібно",
    cards: [
      {
        ...DEFAULT_CONTENT.manifest.cards[0],
        title: "Обрати карту",
        text: "Зупиніться, вдихніть і оберіть інтуїтивну карту дня. Коротке послання допоможе налаштуватися на наступний крок і власний внутрішній голос.",
        btnText: "Обрати карту",
      },
      {
        ...DEFAULT_CONTENT.manifest.cards[1],
        title: "Книга та натхнення",
        text: "Практичне керівництво для моментів, коли ви хочете краще зрозуміти себе, свої наміри та те, що ви справді створюєте у своєму житті.",
        btnText: "Дізнатися більше",
      },
      {
        ...DEFAULT_CONTENT.manifest.cards[2],
        title: "Заходи та зустрічі",
        text: "Живі та онлайн-заходи для тих, хто хоче відчути ясніше керівництво, спокій і підтримку в безпечному просторі.",
        btnText: "Забронювати місце",
      },
    ],
  },
  pickacard: {
    ...DEFAULT_CONTENT.pickacard,
    title: "Обрати карту",
    body: "Зупиніться, вдихніть і дозвольте інтуїції обрати карту, яка найбільше резонує з вами прямо зараз. Коротке керівництво допоможе назвати наступний крок.",
    buttonText: "Обрати карту",
    gameTitle: "Оберіть свою карту",
    gameIntro: "Карти — стародавній інструмент духовного керівництва. Сформулюйте питання подумки, перегляньте карти і виберіть ту, що вас покличе. Карта дасть вам уявлення про наступний крок.",
    gameInstructions: "Гортайте карти або натискайте стрілки. Потім натисніть, щоб обрати свою карту.",
    revealLabel: "Ваша карта на сьогодні",
    cards: [
      { id: "1",  title: "Благодать у хаосі",        concepts: "благодать, вибір, прийняття складності",   message: "Навіть у центрі бурі є в тобі тихе місце. Дозволь собі увійти туди і прислухатися.",                                          gradient: "linear-gradient(135deg, #7c3bb2 0%, #c9a84c 100%)", symbol: "✦", image: "" },
      { id: "2",  title: "Нова стежина",               concepts: "початок, сміливість, довіра",              message: "Перед тобою відкривається нова стежка. Зроби перший крок, навіть якщо не бачиш усього шляху.",                               gradient: "linear-gradient(135deg, #c9a84c 0%, #f5e9c8 100%)", symbol: "☽", image: "" },
      { id: "3",  title: "Глибоке зцілення",           concepts: "зцілення, співчуття, турбота",             message: "Твоє тіло й душа знають, як зцілитися. Дай їм час і ніжну увагу.",                                                          gradient: "linear-gradient(135deg, #6ab7a8 0%, #c9e8df 100%)", symbol: "❋", image: "" },
      { id: "4",  title: "Страж мудрості",             concepts: "інтуїція, керівництво, внутрішній голос",  message: "Відповідь, яку ти шукаєш зовні, вже відома всередині. Затихни і прислухайся.",                                              gradient: "linear-gradient(135deg, #2d4a6e 0%, #7c9bbf 100%)", symbol: "✧", image: "" },
      { id: "5",  title: "Танець достатку",             concepts: "достаток, вдячність, відкритість",         message: "Всесвіт хоче дати тобі більше, ніж ти можеш уявити. Відкрий долоні, щоб отримати.",                                          gradient: "linear-gradient(135deg, #d4814a 0%, #f5d4a8 100%)", symbol: "✺", image: "" },
      { id: "6",  title: "Тихий голос",                 concepts: "тиша, споглядання, осяяння",               message: "Не кожна відповідь приходить словами. Іноді найбільша правда живе в тиші.",                                                  gradient: "linear-gradient(135deg, #4a4063 0%, #9b8fb5 100%)", symbol: "◯", image: "" },
      { id: "7",  title: "Полум'я пристрасті",          concepts: "творення, вогонь, дія",                    message: "Твоя пристрасть священна. Не дозволяй нікому її пригасити — навпаки, роздмухуй.",                                           gradient: "linear-gradient(135deg, #b2384a 0%, #f5a89b 100%)", symbol: "✸", image: "" },
      { id: "8",  title: "Місячна брама",               concepts: "цикли, жіноча енергія, плин",              message: "Все має свій час — відплив і приплив. Довіряй ритму, в якому ти зараз перебуваєш.",                                          gradient: "linear-gradient(135deg, #3a5f8a 0%, #c5d8e8 100%)", symbol: "☾", image: "" },
      { id: "9",  title: "Дерево коренів",              concepts: "стабільність, заземлення, предки",         message: "Твоє коріння сягає глибоко. Стій міцно, і вітер лише зробить тебе сильнішою.",                                              gradient: "linear-gradient(135deg, #5a4a2e 0%, #c9a84c 100%)", symbol: "⚘", image: "" },
      { id: "10", title: "Крила свободи",               concepts: "свобода, перспектива, звільнення",         message: "Те, що тебе сковувало, більше не має сили. Розправ крила — все небо твоє.",                                                  gradient: "linear-gradient(135deg, #87a9c9 0%, #e8f1f8 100%)", symbol: "✶", image: "" },
      { id: "11", title: "Зустріч душ",                 concepts: "зв'язок, кохання, резонанс",               message: "Правильна людина приходить у правильний час. Будь собою — це твій магніт.",                                                  gradient: "linear-gradient(135deg, #b35a8a 0%, #f5c5d8 100%)", symbol: "♡", image: "" },
      { id: "12", title: "Зоряний посів",               concepts: "бачення, маніфестація, мрія",              message: "Мрія, яку ти носиш у серці, не є випадковістю. Поливай її щодня маленькими діями.",                                          gradient: "linear-gradient(135deg, #1a1f4a 0%, #c9a84c 100%)", symbol: "✦", image: "" },
      { id: "13", title: "Кришталеве дзеркало",         concepts: "правда, самопізнання, ясність",            message: "Подивися на себе з добротою і без прикрас. Те, що ти побачиш, не засудить тебе — звільнить.",                                gradient: "linear-gradient(135deg, #d7f0f2 0%, #8aaec4 100%)", symbol: "◇", image: "" },
      { id: "14", title: "Золотий поріг",               concepts: "перехід, рішення, готовність",             message: "Ти стоїш на порозі змін. Не треба поспішати — просто усвідомлено пройди крізь двері, що відчиняються.",                       gradient: "linear-gradient(135deg, #8f5f1f 0%, #f1c76a 100%)", symbol: "⌁", image: "" },
      { id: "15", title: "Криниця спокою",              concepts: "затишшя, відновлення, внутрішнє джерело",  message: "Коли світ здається надто гучним, повернись до власного джерела. Тиша наповнить тебе знову.",                                  gradient: "linear-gradient(135deg, #23495b 0%, #9cc9c3 100%)", symbol: "◌", image: "" },
      { id: "16", title: "Іскра наміру",                concepts: "намір, творення, перший крок",             message: "Твій намір вже має силу. Дай йому форму одним конкретним кроком сьогодні.",                                                  gradient: "linear-gradient(135deg, #69306d 0%, #f0a45d 100%)", symbol: "✹", image: "" },
      { id: "17", title: "М'який кордон",               concepts: "кордони, турбота, самоповага",             message: "Сказати «ні» може бути найніжнішим способом сказати «так» собі. Твоя енергія заслуговує на захист.",                         gradient: "linear-gradient(135deg, #875c74 0%, #f4c7c3 100%)", symbol: "⌒", image: "" },
      { id: "18", title: "Корона сміливості",           concepts: "сила, гідність, рішучість",               message: "Не треба чекати впевненості. Сміливість народжується в момент, коли діяєш навіть з тремтячим серцем.",                        gradient: "linear-gradient(135deg, #51306b 0%, #d4a84f 100%)", symbol: "♔", image: "" },
      { id: "19", title: "Ріка змін",                   concepts: "плин, зміни, звільнення",                  message: "Не штовхай назад те, що відходить. Течія несе тебе до простору, де ти дихатимеш вільніше.",                                  gradient: "linear-gradient(135deg, #256078 0%, #86d1c5 100%)", symbol: "≈", image: "" },
      { id: "20", title: "Ліхтар предків",              concepts: "коріння, підтримка, спадщина",             message: "Ти не одна. За тобою стоїть сила тих, хто вижив, кохав і передав тобі своє світло.",                                         gradient: "linear-gradient(135deg, #3f2f27 0%, #c68f55 100%)", symbol: "✺", image: "" },
      { id: "21", title: "Рожевий компас",              concepts: "серце, напрям, м'яке керівництво",         message: "Правильний напрям не обов'язково найгучніший. Пізнаєш його по тому, що тіло трохи розслаблюється.",                          gradient: "linear-gradient(135deg, #9f5f83 0%, #f2c4d6 100%)", symbol: "⌖", image: "" },
      { id: "22", title: "Око інтуїції",                concepts: "осяяння, сигнали, довіра",                 message: "Ти помічаєш правильні знаки. Перестань сумніватися в них лише тому, що вони прийшли тихо.",                                 gradient: "linear-gradient(135deg, #1f2f62 0%, #8a78c9 100%)", symbol: "◉", image: "" },
      { id: "23", title: "Сад терпіння",                concepts: "зростання, час, турбота",                  message: "Не все, що росте, одразу видно. Доглядай своє зернятко і дай йому його священний час.",                                      gradient: "linear-gradient(135deg, #3f6d4e 0%, #c5d89b 100%)", symbol: "✿", image: "" },
      { id: "24", title: "Двері радості",               concepts: "легкість, задоволення, відкритість",       message: "Радість — не нагорода після роботи. Це енергія, яка допомагає тобі рухатися далі.",                                          gradient: "linear-gradient(135deg, #c27a44 0%, #f4d27f 100%)", symbol: "☼", image: "" },
      { id: "25", title: "Оксамитова ніч",              concepts: "відпочинок, сни, підсвідоме",              message: "Відповідь може прийти лише тоді, коли ти перестанеш тиснути. Дозволь ночі скласти щось за тебе.",                          gradient: "linear-gradient(135deg, #161b3f 0%, #6d5d96 100%)", symbol: "☽", image: "" },
      { id: "26", title: "Білий вогонь",                concepts: "очищення, правдивість, новий початок",     message: "Нехай згорить те, що вже не відповідає твоїй правді. Після очищення залишиться лише те, що має силу жити.",                  gradient: "linear-gradient(135deg, #f7f3e8 0%, #d6b76a 100%)", symbol: "♢", image: "" },
      { id: "27", title: "Міст довіри",                 concepts: "довіра, зв'язок, подолання",               message: "Тобі не треба знати весь план. Достатньо зробити крок на міст, що з'являється під ногами.",                                  gradient: "linear-gradient(135deg, #4f6f8f 0%, #c6b6d8 100%)", symbol: "⌇", image: "" },
      { id: "28", title: "Медове сонце",                concepts: "життєвість, вдячність, відновлення сил",   message: "Твоя енергія повертається через маленькі радощі. Дозволь собі сьогодні щось, що гріє зсередини.",                            gradient: "linear-gradient(135deg, #b85c3c 0%, #f3c86f 100%)", symbol: "✷", image: "" },
      { id: "29", title: "Таємниця глибин",             concepts: "тінь, глибина, прийняття",                 message: "Те, чого ти боїшся подивитися, не обов'язково є ворогом. Можливо, це частина тебе, яка чекає обійм.",                       gradient: "linear-gradient(135deg, #12343f 0%, #5b7890 100%)", symbol: "◆", image: "" },
      { id: "30", title: "Свідоме повернення",          concepts: "повернення до себе, інтеграція, спокій",   message: "Все, що ти шукаєш, зрештою веде тебе назад до себе. Повертайся додому у власному подиху.",                                   gradient: "linear-gradient(135deg, #6d4d7d 0%, #d9c7a3 100%)", symbol: "◎", image: "" },
    ],
  },
  crystalBall: {
    ...DEFAULT_CONTENT.crystalBall,
    eyebrow: "Кришталева куля",
    title: "Запитай кришталеву кулю",
    subtitle: "Нехай кришталева куля відкриє, що зараз потребує твоєї уваги…",
    ariaLabel: "Натисніть на кришталеву кулю",
    inputPlaceholder: "Напишіть своє запитання…",
    buttonText: "Запитати кулю",
    loadingText: "Куля слухає…",
    consultLead: "Відчуваєш, що в цьому посланні є щось більше?",
    consultLinkText: "Консультація допоможе зрозуміти це глибше.",
    answers: [
      "Сяй серед правильних людей.",
      "Будь доброю до себе.",
      "Слухай свою інтуїцію.",
      "Маленькі зміни допоможуть.",
      "Наведи лад у фінансах.",
      "Переосмисли свої стосунки.",
      "Дай розуму спокій.",
      "Сповільнися і відпочинь.",
      "Повернися до старих питань.",
      "Помічай знаки.",
      "Йди за своїми бажаннями.",
      "Відпусти старе.",
    ],
  },
  oracle: {
    ...DEFAULT_CONTENT.oracle,
    title: "Місячне інтуїтивне осяяння",
    body: "Коротке керівництво для тих часів, коли вам потрібно більше спокою, ясності й довіри до наступного кроку.",
  },
  footer: {
    ...DEFAULT_CONTENT.footer,
    newsletterTitle: "Отримуйте м'яке керівництво та новини від Астери.",
    copyright: "© 2026 Astera Light. Усі права захищені.",
    footerLinks: [
      { label: "Політика конфіденційності", href: "https://www.asteralight.cz/privacy-policy/" },
      { label: "Умови використання",        href: "https://www.asteralight.cz/terms-of-use/" },
      { label: "Повернення товарів",         href: "https://www.asteralight.cz/returns/" },
      { label: "Умови оплати",              href: "https://www.asteralight.cz/payment-plan-terms/" },
      { label: "Умови членства",            href: "https://www.asteralight.cz/membership-terms/" },
    ],
  },
  aboutPage: {
    ...DEFAULT_CONTENT.aboutPage,
    heroTitle: "Про Astera Light",
    heroSubtitle: "Інтуїтивний провідник для спокою, енергії та гармонії простору.",
    bio1: "Astera Light супроводжує людей у моменти, коли їхній дім, робочий простір або внутрішній стан потребують знову спокою, легкості та ясності.",
    bio2: "Її робота поєднує чутливу інтуїцію з практичним підходом. Вона займається очищенням просторів, енергетичною гармонізацією та простими методами, які клієнти можуть засвоїти надовго.",
    bio3: "Кожен простір вона сприймає індивідуально і з повагою. Акцент робить на етиці, безпеці та результаті, що підтримує повсякденне життя, а не лише короткостроковий ефект.",
    quoteText: "You are not a human being having a spiritual experience. You are a spiritual being having a human experience.",
    quoteAuthor: "— Astera-Light",
    ctaTitle: "Готові почати?",
    ctaText: "Оберіть послугу, яка допоможе вам повернути більше спокою у свій простір і життя.",
    ctaButtonText: "Переглянути послуги",
    statsItems: [
      { number: "1:1",    label: "Індивідуальний підхід" },
      { number: "100%",   label: "Етична робота" },
      { number: "Online", label: "Консультації" },
      { number: "UK",     label: "Українська" },
    ],
  },
  servicesContent: {
    ...DEFAULT_CONTENT.servicesContent,
    homeEyebrow: "✦ ✦ ✦",
    homeTitle: "Оберіть послугу, яка вас приваблює",
    homeSubtitle: "✦   Кожен шлях унікальний   ✦",
    homeCardLinkText: "Дізнатися більше",
    pageHeroEyebrow: "✦   Астера · Індивідуальний підхід   ✦",
    pageHeroTitle: "Послуги",
    pageHeroText: "Простір для глибокої роботи, яка допоможе вам зорієнтуватися в житті, звільнити те, що вас стримує, і знову з'єднатися із собою.",
    pageHeroButtonText: "Записатися",
    pageIntroTitle: "Знайдіть відповіді, спокій і напрям",
    pageIntroText: "Я працюю індивідуально, чутливо і з акцентом на якість — кожна зустріч і послуга унікальні. Послуга включає не лише саму роботу, а й навчання й поради. Я навчу вас простих і ефективних методів, розроблених спеціально для вас, тому ви будете потребувати мене лише у виняткових ситуаціях!",
    pageGridTitle: "Оберіть послугу, яка вас приваблює",
    pageGridSubtitle: "✦   Кожен шлях унікальний   ✦",
    pageTileLinkText: "Дізнатися більше →",
    pageWhyTitle: "Чому варто працювати зі мною",
    pageWhyText1: "Кожна зустріч і кожна створена річ виходить з індивідуального підходу, глибокого сприйняття і поваги до вашої ситуації.",
    pageWhyText2: "Це не універсальне рішення, а цілеспрямована робота, яка має реальний вплив. Якщо ви відчуваєте, що настав час щось змінити, звільнити або зрозуміти, я з радістю проведу вас через цей процес.",
    pageWhyButtonText: "Записатися",
    pageSpecificTitle: "Специфічні випадки",
    pageSpecificText1: "Я також працюю з просторами, де сталась смерть, особливо після тривалої і важкої хвороби. У таких місцях може залишатися енергетичний слід, пов'язаний з болем чи виснаженням.",
    pageSpecificText2: "Після лікування простору його знову можна повноцінно заселити, здати в оренду або продати — з відчуттям спокою та впевненості.",
    pageConsultTitle: "Не впевнені або обмежені в бюджеті?",
    pageConsultText: "Якщо ви не впевнені, яка послуга вам підходить, або наразі не маєте змоги нею скористатися, я також пропоную індивідуальні консультації, під час яких ми визначимо, що вам зараз потрібно для покращення якості життя, відчуття наповненості та спокою.",
    pageConsultButtonText: "Записатися",
    items: DEFAULT_CONTENT.servicesContent.items.map(item => {
      const map: Record<string, Partial<typeof item>> = {
        karty: {
          title: "Читання карт",
          teaser: "Отримайте ясніший погляд на те, що відбувається зараз, і куди веде ваш шлях.",
          lead: "Шукаєте відповіді, напрям або підтвердження у важливій життєвій ситуації? Читання карт допоможе зазирнути під поверхню і отримати ясніший погляд.",
          body: "Увійдіть у простір, де час сповільнюється, а відповіді приходять у потрібний момент.",
          sections: [
            { heading: "Як проходить читання", paragraphs: ["Читання карт — це глибокий і особистий процес. Кожна сесія повністю індивідуальна, і я працюю з обмеженою кількістю клієнтів для збереження якості.", "Я переважно використовую Таро, доповнюючи оракулами, циганськими картами, рунами та іншими інструментами."] },
            { heading: "Формати читання", rows: [{ label: "Онлайн наживо (60–90 хвилин)", price: "3 600 крон" }, { label: "Відеоповідомлення (приватне посилання)", price: "2 600 крон" }, { label: "Текстове повідомлення або email з фото", price: "1 200 крон" }] },
            { heading: "Особиста зустріч у Празі", paragraphs: ["Для глибшої роботи пропоную також особисті зустрічі (60–180 хвилин).", "Ця сесія призначена лише для постійних клієнтів, які вже мали досвід онлайн-читання."], rows: [{ label: "Особиста сесія", price: "5 900 крон" }] },
          ],
          cta: { label: "Записатися", href: "https://app.rezora.cz/book/astera" },
        },
        ocista: {
          title: "Очищення простору",
          teaser: "Повертаю у будинки та робочі простори спокій, легкість і відчуття безпеки.",
          lead: "Допомагаю повернути у будинки та робочі простори спокій, легкість і відчуття безпеки. Очищення приносить рівновагу та звільнення там, де накопичилося напруження або застій.",
          sections: [
            { heading: "Коли підходить очищення", list: ["при переїзді", "після важких життєвих періодів", "після тривалої хвороби в просторі", "при відчутті неспокою, напруження або незрозумілих явищ"] },
            { heading: "Ціни (орієнтовні)", paragraphs: ["Очищення проводжу індивідуально, з повагою до простору та його мешканців."], rows: [{ label: "Студія та однокімнатна", price: "3 900 – 4 900 крон" }, { label: "2-кімнатна до 50 м²", price: "5 900 – 7 900 крон" }, { label: "3-5-кімнатна до 120 м²", price: "8 900 – 13 900 крон" }, { label: "Будинки та окремі об'єкти", price: "14 900 – 29 900 крон" }, { label: "Посібник з самостійного очищення (е-магазин)", price: "1 290 крон" }] },
          ],
          cta: { label: "Записатися", href: "https://app.rezora.cz/book/astera" },
        },
        amulety: {
          title: "Амулети та талісмани",
          teaser: "Особистий предмет як носій наміру, енергії та свідомої роботи на вашому шляху.",
          lead: "Особистий амулет або талісман — це більше ніж просто предмет. Це носій наміру, енергії та свідомої роботи, яка супроводжує вас на вашому шляху.",
          body: "Кожен виріб створюється індивідуально, в налаштуванні на вашу енергію та конкретний намір.",
          sections: [
            { heading: "Різниця між амулетом і талісманом", twoCol: [{ label: "Амулет", text: "Захищає, створює щит і захисний бар'єр. Допомагає відштовхувати небажані впливи, ситуації, енергії або конкретних людей. Обмежує те, що послаблює вас або порушує вашу рівновагу." }, { label: "Талісман", text: "Підсилює те, що ви хочете розвивати у своєму житті. Притягує бажану енергію, можливості та людей. Підтримує ваші наміри, збільшує шанси та посилює те, чого ви прагнете." }] },
            { heading: "Можливості використання", list: ["захист і зміцнення", "залучення можливостей", "підтримка стосунків або притягнення партнера", "захист від токсичного середовища", "важливі життєві моменти (іспити, подорожі тощо)"] },
            { heading: "Як проходить співпраця", paragraphs: ["Процес починається з вступної консультації, під час якої ми з'ясовуємо ваш намір і напрям.", "Вартість консультації потім вираховується із загальної ціни."], rows: [{ label: "Амулет / талісман на замовлення", price: "4 400 – 19 900 крон" }] },
          ],
          cta: { label: "Записатися", href: "https://app.rezora.cz/book/astera" },
        },
        medium: {
          title: "Медіумічні читання",
          teaser: "Допомагаю знайти спокій, розуміння та завершеність там, де залишаються невимовлені речі.",
          lead: "Незавершені стосунки або втрата близької людини можуть залишатися глибоко в нас. Медіумічне читання може допомогти вам знайти спокій, розуміння та завершеність.",
          body: "Я полегшую комунікацію та надаю прозріння, які допоможуть вам відпустити емоції, вирішити невимовлене і рухатися далі.",
          sections: [{ rows: [{ label: "Відео, онлайн-зустріч або особисто у Празі", price: "3 600 крон" }] }],
          cta: { label: "Записатися", href: "https://app.rezora.cz/book/astera" },
        },
        energo: {
          title: "Енергетичне очищення людини",
          teaser: "Глибока робота, що відновлює внутрішню рівновагу і звільняє те, що більше не служить.",
          lead: "М'яка, але глибока робота, яка відновлює внутрішню рівновагу і звільняє те, що більше не служить.",
          body: "Енергетичне очищення проходить дистанційно і впливає на п'ять рівнів буття — фізичний, емоційний, ментальний та інші тонкі шари. Результатом зазвичай є відчуття полегшення, більшої легкості та повернення до себе.",
          sections: [{ rows: [{ label: "Індивідуальна дистанційна сесія", price: "3 300 крон" }] }],
          cta: { label: "Записатися", href: "https://app.rezora.cz/book/astera" },
        },
        "na-miru": {
          title: "Послуги на замовлення",
          teaser: "Індивідуальна комбінація керівництва, читання та енергетичної роботи відповідно до ваших потреб.",
          lead: "Іноді ситуація не вкладається в одну конкретну послугу. Разом ми визначимо, що ви зараз вирішуєте, і я запропоную чутливий підхід, розроблений під ваш намір, простір і поточну енергію.",
          body: "Послуга може поєднувати консультацію, читання, очищення, роботу з наміром або рекомендації наступних кроків відповідно до вашої конкретної ситуації.",
          sections: [
            { heading: "Коли підходить", list: ["коли ви не впевнені, яку послугу обрати", "якщо тема торкається кількох сфер одночасно", "коли вам потрібен індивідуальний план або чутливий напрям", "у специфічній життєвій ситуації, що вимагає особистого підходу"] },
            { heading: "Ціна та обсяг", paragraphs: ["Обсяг і форма узгоджуються індивідуально залежно від теми, глибини роботи та часових витрат."], rows: [{ label: "Індивідуальна розробка послуги", price: "за домовленістю" }] },
          ],
          cta: { label: "Записатися", href: "https://app.rezora.cz/book/astera" },
        },
      };
      return { ...item, ...(map[item.id] ?? {}) };
    }),
  },
  wheelOfFortune: {
    ...DEFAULT_CONTENT.wheelOfFortune,
    title: "Покрутіть колесо фортуни!",
    subtitle: "Введіть email і спробуйте удачу — може, сьогодні ваш день!",
    emailPlaceholder: "ваш@email.ua",
    spinButtonText: "Крутити колесо!",
    privacyText: "Ваш email буде використано лише для відправки виграшу.",
    winTitle: "Вітаємо!",
    winText: "Ваш виграш надіслано на вказану адресу email.",
    lossTitle: "Зірки ще не вишикувалися…",
    lossText: "Але ми даємо вам ще один шанс. Можливо, саме зараз ваш момент.",
    segments: [
      { id: "1", label: "Знижка 10%",        color: "#7c3bb2", weight: 2, isLoss: false, coupon: "SLEVA10" },
      { id: "2", label: "Читання безкоштовно", color: "#c9a84c", weight: 1, isLoss: false, coupon: "VYKLAD" },
      { id: "3", label: "Наступного разу",    color: "#4a2880", weight: 3, isLoss: true,  coupon: "" },
      { id: "4", label: "Знижка 15%",        color: "#a84a80", weight: 2, isLoss: false, coupon: "SLEVA15" },
      { id: "5", label: "E-книга безкоштовно", color: "#5878c0", weight: 1, isLoss: false, coupon: "EBOOK" },
      { id: "6", label: "Наступного разу",    color: "#3d2060", weight: 3, isLoss: true,  coupon: "" },
      { id: "7", label: "Знижка 20%",        color: "#c08040", weight: 1, isLoss: false, coupon: "SLEVA20" },
      { id: "8", label: "Консультація -50%", color: "#7c6ad4", weight: 1, isLoss: false, coupon: "KONZULTACE50" },
    ],
  },
};

/** Return the default content object for a given lang */
export function getDefaultContent(lang: Lang): SiteContent {
  if (lang === "en") return DEFAULT_EN_CONTENT;
  if (lang === "ua") return DEFAULT_UK_CONTENT;
  return DEFAULT_CONTENT;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI STRINGS — hardcoded UI text translated per language
// ─────────────────────────────────────────────────────────────────────────────

export interface UiStrings {
  helpCenter: string;
  writeToMe: string;
  namePlaceholder: string;
  subscribeButton: string;
  loading: string;
  close: string;
  openWheel: string;
  scrollToServices: string;
  scrollLeft: string;
  scrollRight: string;
  closeCard: string;
  wheelTabLabel: string;
  wheelTryLuck: string;
  wheelSpinDesc: string;
  wheelWhatToWin: string;
  wheelYourPrize: string;
  wheelEnterEmail: string;
  wheelSending: string;
  wheelSendPrize: string;
  wheelPrizeSent: string;
  wheelAnotherChance: string;
  wheelSpinAgain: string;
}

export const UI_STRINGS: Record<Lang, UiStrings> = {
  cs: {
    helpCenter: "Centrum pomoci",
    writeToMe: "Napište mi",
    namePlaceholder: "Jméno",
    subscribeButton: "Přihlásit se",
    loading: "Načítám…",
    close: "Zavřít",
    openWheel: "Otevřít kolo štěstí",
    scrollToServices: "Posunout na výběr služeb",
    scrollLeft: "Posunout vlevo",
    scrollRight: "Posunout vpravo",
    closeCard: "Zavřít kartu",
    wheelTabLabel: "Kolo štěstí",
    wheelTryLuck: "Zkuste štěstí!",
    wheelSpinDesc: "Otočte kolem a zjistěte, jakou výhodu jste získali. Nic neplatíte, točíte zadarmo!",
    wheelWhatToWin: "Co lze vyhrát",
    wheelYourPrize: "Vaše výhra",
    wheelEnterEmail: "Zadejte e-mail a výhru vám okamžitě odešleme:",
    wheelSending: "Odesílám…",
    wheelSendPrize: "Odeslat výhru →",
    wheelPrizeSent: "Výhra odeslána!",
    wheelAnotherChance: "Ještě jedna šance je na cestě k vám ✦",
    wheelSpinAgain: "Točit znovu",
  },
  en: {
    helpCenter: "Help Center",
    writeToMe: "Contact me",
    namePlaceholder: "Name",
    subscribeButton: "Subscribe",
    loading: "Loading…",
    close: "Close",
    openWheel: "Open the wheel of fortune",
    scrollToServices: "Scroll to service selection",
    scrollLeft: "Scroll left",
    scrollRight: "Scroll right",
    closeCard: "Close card",
    wheelTabLabel: "Wheel of Fortune",
    wheelTryLuck: "Try your luck!",
    wheelSpinDesc: "Spin the wheel and discover what reward you've won. It's completely free!",
    wheelWhatToWin: "What's up for grabs",
    wheelYourPrize: "Your prize",
    wheelEnterEmail: "Enter your email and we'll send your prize right away:",
    wheelSending: "Sending…",
    wheelSendPrize: "Send my prize →",
    wheelPrizeSent: "Prize sent!",
    wheelAnotherChance: "Another chance is on its way to you ✦",
    wheelSpinAgain: "Spin again",
  },
  ua: {
    helpCenter: "Центр допомоги",
    writeToMe: "Написати мені",
    namePlaceholder: "Ім'я",
    subscribeButton: "Підписатися",
    loading: "Завантаження…",
    close: "Закрити",
    openWheel: "Відкрити колесо фортуни",
    scrollToServices: "Перейти до вибору послуг",
    scrollLeft: "Прокрутити вліво",
    scrollRight: "Прокрутити вправо",
    closeCard: "Закрити картку",
    wheelTabLabel: "Колесо фортуни",
    wheelTryLuck: "Спробуйте удачу!",
    wheelSpinDesc: "Покрутіть колесо і дізнайтеся, яку перевагу ви отримали. Безкоштовно!",
    wheelWhatToWin: "Що можна виграти",
    wheelYourPrize: "Ваш виграш",
    wheelEnterEmail: "Введіть e-mail і ми одразу надішлемо ваш виграш:",
    wheelSending: "Надсилаю…",
    wheelSendPrize: "Надіслати виграш →",
    wheelPrizeSent: "Виграш надіслано!",
    wheelAnotherChance: "Ще один шанс вже на шляху до вас ✦",
    wheelSpinAgain: "Крутити знову",
  },
};
