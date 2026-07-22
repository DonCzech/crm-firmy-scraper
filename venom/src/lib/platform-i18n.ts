export type PlatformLocale = "cs" | "en";

export const DEFAULT_LOCALE: PlatformLocale = "cs";

export const LOCALES: PlatformLocale[] = ["cs", "en"];

export function isPlatformLocale(value: string | undefined): value is PlatformLocale {
  return value === "cs" || value === "en";
}

export function localizedPath(path: string, locale: PlatformLocale) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const withoutLocale = cleanPath.replace(/^\/(cs|en)(?=\/|$)/, "") || "/";
  if (withoutLocale === "/") return locale === "cs" ? "/cs" : "/";
  if (locale === DEFAULT_LOCALE) return withoutLocale;
  return `/${locale}${withoutLocale}`;
}

const PLATFORM_ROUTES: Record<string, Record<PlatformLocale, string>> = {
  "/produkty-a-reseni": { cs: "/produkty-a-reseni", en: "/en/products-and-solutions" },
  "/products-and-solutions": { cs: "/produkty-a-reseni", en: "/en/products-and-solutions" },
  "/prehled-funkci": { cs: "/prehled-funkci", en: "/en/features" },
  "/features": { cs: "/prehled-funkci", en: "/en/features" },
  "/vybrat-design": { cs: "/vybrat-design", en: "/en/choose-design" },
  "/choose-design": { cs: "/vybrat-design", en: "/en/choose-design" },
  "/cenik": { cs: "/cenik", en: "/en/pricing" },
  "/pricing": { cs: "/cenik", en: "/en/pricing" },
  "/kontakt": { cs: "/kontakt", en: "/en/contact" },
  "/contact": { cs: "/kontakt", en: "/en/contact" },
  "/admin/login": { cs: "/admin/login", en: "/en/admin/login" },
};

export function platformPath(path: string, locale: PlatformLocale) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const withoutLocale = cleanPath.replace(/^\/(cs|en)(?=\/|$)/, "") || "/";
  if (withoutLocale === "/") return locale === "cs" ? "/cs" : "/";
  return PLATFORM_ROUTES[withoutLocale]?.[locale] ?? localizedPath(withoutLocale, locale);
}

export const platformCopy = {
  cs: {
    nav: {
      products: "PRODUKTY A ŘEŠENÍ",
      features: "PŘEHLED FUNKCÍ",
      designs: "VYBRAT DESIGN",
      pricing: "CENÍK",
      contactNav: "KONTAKT",
      login: "Přihlásit",
      tryFree: "Vyzkoušet zdarma",
      openMenu: "Otevřít menu",
      close: "Zavřít",
      language: "Jazyk",
      czech: "Čeština",
      english: "English",
    },
    footer: {
      newsletterTitle: "Tipy pro lepší web.",
      newsletterText: "Nové šablony, design a UX tipy. 1× měsíčně, žádný spam, odhlášení 1 klikem.",
      newsletterPlaceholder: "vas@email.cz",
      newsletterSubmit: "Odeslat",
      newsletterLoading: "Posílám...",
      newsletterSuccessTitle: "Hotovo!",
      newsletterSuccessText: "Šablony posíláme na váš e-mail.",
      newsletterError: "Něco se nepovedlo. Zkuste to znovu.",
      brandText: "Profesionální weby bez programátora. Šablony, editor, hosting - vše v jednom.",
      product: "Produkt",
      templates: "Šablony",
      features: "Funkce",
      pricing: "Ceník",
      references: "Reference",
      company: "Společnost",
      about: "O Weberu",
      careers: "Kariéra",
      contact: "Kontakt",
      blog: "Blog",
      contactTitle: "Kontakt",
      hours: "Po-Pá 9:00-17:00",
      status: "Stav systému",
      systemsOk: "Všechny systémy běží",
      euHosting: "Hosting v EU",
      terms: "Obchodní podmínky",
      privacy: "Ochrana údajů",
    },
  },
  en: {
    nav: {
      products: "PRODUCTS",
      features: "FEATURES",
      designs: "CHOOSE DESIGN",
      pricing: "PRICING",
      contactNav: "CONTACT",
      login: "Log in",
      tryFree: "Try for free",
      openMenu: "Open menu",
      close: "Close",
      language: "Language",
      czech: "Czech",
      english: "English",
    },
    footer: {
      newsletterTitle: "Tips for a better website.",
      newsletterText: "New templates, design and UX tips. Once a month, no spam, unsubscribe in one click.",
      newsletterPlaceholder: "you@example.com",
      newsletterSubmit: "Send",
      newsletterLoading: "Sending...",
      newsletterSuccessTitle: "Done!",
      newsletterSuccessText: "We are sending the templates to your email.",
      newsletterError: "Something went wrong. Please try again.",
      brandText: "Professional websites without a developer. Templates, editor, hosting - all in one place.",
      product: "Product",
      templates: "Templates",
      features: "Features",
      pricing: "Pricing",
      references: "Reviews",
      company: "Company",
      about: "About Webero",
      careers: "Careers",
      contact: "Contact",
      blog: "Blog",
      contactTitle: "Contact",
      hours: "Mon-Fri 9:00-17:00",
      status: "System status",
      systemsOk: "All systems operational",
      euHosting: "EU hosting",
      terms: "Terms",
      privacy: "Privacy",
    },
  },
} as const;
