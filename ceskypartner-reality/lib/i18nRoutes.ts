import { allEnglishLocalPages } from "./localSeoEn";

const STATIC_CS_TO_EN: Record<string, string> = {
  "/": "/en",
  "/nabidka/vse": "/en/properties/all",
  "/nabidka/prodej": "/en/properties/for-sale",
  "/nabidka/pronajem": "/en/properties/to-let",
  "/nabidka/investicni": "/en/properties/investment",
  "/o-nas": "/en/about",
  "/sluzby": "/en/services",
  "/kontakt": "/en/contact",
  "/odhad-nemovitosti": "/en/valuation",
  "/prodano": "/en/sold",
  "/makleri": "/en/agents",
  "/blog": "/en/journal",
  "/ochrana-osobnich-udaju": "/en/privacy",
  "/odhlasit": "/en/unsubscribe",
};

const STATIC_EN_TO_CS = Object.fromEntries(
  Object.entries(STATIC_CS_TO_EN).map(([cs, en]) => [en, cs])
);

export function toEnglishPath(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) return pathname;
  if (STATIC_CS_TO_EN[pathname]) return STATIC_CS_TO_EN[pathname];
  if (pathname.startsWith("/nemovitost/")) {
    return pathname.replace("/nemovitost/", "/en/property/");
  }
  if (pathname.startsWith("/makleri/")) {
    return pathname.replace("/makleri/", "/en/agents/");
  }
  if (pathname.startsWith("/blog/")) {
    // Články bez ověřeného anglického protějšku nesmí vést na neexistující
    // nebo významově jinou URL. Přepínač proto bezpečně otevře EN archiv.
    return "/en/journal";
  }
  if (pathname.startsWith("/nemovitosti/")) {
    const czechSlug = pathname.slice("/nemovitosti/".length);
    const page = allEnglishLocalPages().find((item) => item.czechSlug === czechSlug);
    return page ? `/en/real-estate/${page.slug}` : "/en/properties/all";
  }
  return "/en";
}

export function toCzechPath(pathname: string): string {
  if (!pathname.startsWith("/en")) return pathname;
  if (STATIC_EN_TO_CS[pathname]) return STATIC_EN_TO_CS[pathname];
  if (pathname.startsWith("/en/property/")) {
    return pathname.replace("/en/property/", "/nemovitost/");
  }
  if (pathname.startsWith("/en/agents/")) {
    return pathname.replace("/en/agents/", "/makleri/");
  }
  if (pathname.startsWith("/en/journal/")) {
    return "/blog";
  }
  if (pathname.startsWith("/en/real-estate/")) {
    const englishSlug = pathname.slice("/en/real-estate/".length);
    const page = allEnglishLocalPages().find((item) => item.slug === englishSlug);
    return page ? `/nemovitosti/${page.czechSlug}` : "/nabidka/vse";
  }
  return "/";
}

export const EN_CATEGORY_TO_DEAL = {
  all: undefined,
  "for-sale": "SALE",
  "to-let": "RENT",
  investment: "INVESTMENT",
} as const;

export const DEAL_TO_EN_CATEGORY: Record<string, string> = {
  SALE: "for-sale",
  RENT: "to-let",
  INVESTMENT: "investment",
};
