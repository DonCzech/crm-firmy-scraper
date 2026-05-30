import * as cheerio from "cheerio";
import type { ScrapeResult, ScrapedPage } from "./scraper";

export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  headingSizes: string[];
  baseFontSize: string;
}

export interface PageStructure {
  slug: string;
  title: string;
  url: string;
  sections: DetectedSection[];
  seoTitle: string;
  seoDescription: string;
  hasHero: boolean;
  hasGallery: boolean;
  hasTestimonials: boolean;
  hasTeam: boolean;
  hasPricing: boolean;
  hasContact: boolean;
  hasForm: boolean;
  hasMap: boolean;
  hasBooking: boolean;
  hasBlog: boolean;
  hasFAQ: boolean;
  hasOpeningHours: boolean;
}

export interface DetectedSection {
  type: string;
  confidence: number;
  evidence: string[];
  content: {
    headline?: string;
    subheadline?: string;
    cta?: string;
    items?: string[];
    text?: string;
  };
}

export interface AnalysisResult {
  industry: string;
  domain: string;
  url: string;
  siteName: string;
  description: string;
  colorPalette: ColorPalette;
  typography: Typography;
  designTokens: {
    colorPrimary: string;
    colorSecondary: string;
    colorBackground: string;
    colorSurface: string;
    colorText: string;
    colorTextMuted: string;
    colorAccent: string;
    colorBorder: string;
    fontHeading: string;
    fontBody: string;
    borderRadius: string;
    spacing: "compact" | "normal" | "relaxed";
  };
  pages: PageStructure[];
  navigation: string[];
  contactInfo: {
    phones: string[];
    emails: string[];
    addresses: string[];
  };
  openingHours: string[];
  socialLinks: string[];
  schemaOrg: unknown[];
  seo: {
    title: string;
    description: string;
    ogImage: string;
    canonical: string | null;
    hasStructuredData: boolean;
  };
  services: string[];
  pricing: boolean;
  booking: boolean;
  gallery: boolean;
  testimonials: boolean;
  team: boolean;
  blog: boolean;
  faq: boolean;
  map: boolean;
  analyzedAt: string;
}

const SECTION_PATTERNS: Record<
  string,
  { keywords: string[]; htmlPatterns: string[] }
> = {
  hero: {
    keywords: ["hlavní", "hero", "banner", "uvítací", "vítejte", "welcome", "intro"],
    htmlPatterns: ["hero", "banner", "jumbotron", "intro", "splash", "cover"],
  },
  services: {
    keywords: ["služby", "services", "nabídka", "co nabízíme", "what we offer", "čím se zabýváme"],
    htmlPatterns: ["services", "sluzby", "offerings", "what-we-do"],
  },
  pricing: {
    keywords: ["ceník", "ceny", "pricing", "prices", "tarif", "kolik stojí"],
    htmlPatterns: ["pricing", "cenik", "prices", "tarif"],
  },
  gallery: {
    keywords: ["galerie", "gallery", "fotky", "photos", "obrázky", "portfolio"],
    htmlPatterns: ["gallery", "galerie", "portfolio", "photos", "lightbox"],
  },
  testimonials: {
    keywords: ["recenze", "reviews", "reference", "testimonials", "hodnocení", "co říkají"],
    htmlPatterns: ["reviews", "testimonials", "recenze", "reference"],
  },
  team: {
    keywords: ["tým", "team", "o nás", "zaměstnanci", "our team", "náš tým"],
    htmlPatterns: ["team", "tym", "staff", "about", "people"],
  },
  contact: {
    keywords: ["kontakt", "contact", "kde nás najdete", "najděte nás", "napište nám"],
    htmlPatterns: ["contact", "kontakt", "get-in-touch", "reach-us"],
  },
  booking: {
    keywords: ["rezervace", "booking", "objednat", "book now", "termín", "online rezervace"],
    htmlPatterns: ["booking", "reservation", "rezervace", "appointment"],
  },
  faq: {
    keywords: ["faq", "otázky", "questions", "často kladené", "frequently asked"],
    htmlPatterns: ["faq", "questions", "accordion"],
  },
  "opening-hours": {
    keywords: ["otevírací doba", "opening hours", "provozní doba", "kdy jsme otevřeni", "pracovní doba"],
    htmlPatterns: ["hours", "opening", "schedule", "timetable"],
  },
  about: {
    keywords: ["o nás", "about", "příběh", "our story", "kdo jsme", "who we are"],
    htmlPatterns: ["about", "story", "mission", "about-us"],
  },
  blog: {
    keywords: ["blog", "novinky", "news", "aktuality", "články", "posts"],
    htmlPatterns: ["blog", "news", "articles", "posts"],
  },
  map: {
    keywords: ["mapa", "map", "kde nás najdete", "adresa", "location"],
    htmlPatterns: ["map", "google-map", "location", "iframe"],
  },
};

function detectSectionsFromPage(page: ScrapedPage): DetectedSection[] {
  const $ = cheerio.load(page.html);
  const detectedSections: DetectedSection[] = [];
  const bodyText = page.text.toLowerCase();

  for (const [sectionType, patterns] of Object.entries(SECTION_PATTERNS)) {
    const evidence: string[] = [];
    let confidence = 0;

    // Check text keywords
    for (const kw of patterns.keywords) {
      if (bodyText.includes(kw.toLowerCase())) {
        evidence.push(`keyword: "${kw}"`);
        confidence += 20;
      }
    }

    // Check HTML classes/IDs
    for (const pat of patterns.htmlPatterns) {
      const found = $(`[class*="${pat}"], [id*="${pat}"]`).length > 0;
      if (found) {
        evidence.push(`html pattern: "${pat}"`);
        confidence += 30;
      }
    }

    // Specific checks
    if (sectionType === "gallery") {
      const imgCount = page.images.length;
      if (imgCount > 5) {
        evidence.push(`${imgCount} images detected`);
        confidence += Math.min(40, imgCount * 3);
      }
    }
    if (sectionType === "contact") {
      if (page.contactInfo.phones.length > 0 || page.contactInfo.emails.length > 0) {
        evidence.push("contact info found");
        confidence += 30;
      }
    }
    if (sectionType === "opening-hours") {
      if (page.openingHours.length > 0) {
        evidence.push("opening hours detected");
        confidence += 50;
      }
    }
    if (sectionType === "testimonials") {
      const reviewPatterns = $("[class*='review'], [class*='testimonial'], [class*='rating']").length;
      if (reviewPatterns > 0) {
        evidence.push(`${reviewPatterns} review elements`);
        confidence += 40;
      }
    }
    if (sectionType === "booking") {
      if ($("[href*='reservations'], [href*='booking'], [href*='rezervace'], [href*='objednat']").length > 0) {
        evidence.push("booking link found");
        confidence += 40;
      }
    }
    if (sectionType === "map") {
      if ($("iframe[src*='google.com/maps'], iframe[src*='maps.google']").length > 0) {
        evidence.push("Google Maps iframe found");
        confidence += 60;
      }
    }
    if (sectionType === "pricing") {
      if (/\d+\s*(?:Kč|CZK|€|,-)/i.test(page.text)) {
        evidence.push("prices detected (Kč/CZK/€)");
        confidence += 40;
      }
    }

    if (confidence >= 20) {
      // Extract sample content
      const headline = page.headings[0]?.text || page.title;
      const items: string[] = [];
      page.headings.slice(1, 5).forEach((h) => items.push(h.text));

      detectedSections.push({
        type: sectionType,
        confidence: Math.min(100, confidence),
        evidence,
        content: {
          headline,
          text: page.text.slice(0, 500),
          items,
        },
      });
    }
  }

  return detectedSections.sort((a, b) => b.confidence - a.confidence);
}

function extractColorsFromCSS(html: string): string[] {
  const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\d+,\s*\d+,\s*\d+\)/g;
  const colors = [...new Set(html.match(colorRegex) ?? [])];
  // Filter out pure white/black
  return colors
    .filter((c) => c !== "#fff" && c !== "#000" && c !== "#ffffff" && c !== "#000000")
    .slice(0, 20);
}

function extractFontsFromHTML(html: string): string[] {
  const fontRegex = /font-family:\s*['"]?([^;'"]+)['"]?/gi;
  const googleFontRegex = /fonts\.googleapis\.com\/css.*?family=([^&"']+)/gi;
  const fonts: string[] = [];

  let m: RegExpExecArray | null;
  while ((m = fontRegex.exec(html)) !== null) {
    fonts.push(m[1].split(",")[0].trim().replace(/['"]/g, ""));
  }
  while ((m = googleFontRegex.exec(html)) !== null) {
    fonts.push(decodeURIComponent(m[1].split(":")[0].replace(/\+/g, " ")));
  }

  return [...new Set(fonts)].slice(0, 10);
}

function guessDesignTokens(
  colors: string[],
  fonts: string[],
  industry: string
): AnalysisResult["designTokens"] {
  const industryDefaults: Record<string, Partial<AnalysisResult["designTokens"]>> = {
    barber: {
      colorPrimary: "#C9A96E",
      colorSecondary: "#1a1a1a",
      colorBackground: "#111111",
      colorSurface: "#1E1E1E",
      colorText: "#F5F5F5",
      colorTextMuted: "#A0A0A0",
      colorAccent: "#C9A96E",
      colorBorder: "#333333",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      borderRadius: "0.25rem",
      spacing: "normal",
    },
    wellness: {
      colorPrimary: "#7C9E87",
      colorSecondary: "#F5EFE6",
      colorBackground: "#FAFAF8",
      colorSurface: "#FFFFFF",
      colorText: "#2D2D2D",
      colorTextMuted: "#6B7280",
      colorAccent: "#C9A96E",
      colorBorder: "#E5E7EB",
      fontHeading: "Cormorant Garamond",
      fontBody: "Lato",
      borderRadius: "0.5rem",
      spacing: "relaxed",
    },
    restaurant: {
      colorPrimary: "#8B1A1A",
      colorSecondary: "#F5E6D0",
      colorBackground: "#FEFEF8",
      colorSurface: "#FFFFFF",
      colorText: "#1F1F1F",
      colorTextMuted: "#6B7280",
      colorAccent: "#C9A96E",
      colorBorder: "#E5E7EB",
      fontHeading: "Playfair Display",
      fontBody: "Source Sans Pro",
      borderRadius: "0.375rem",
      spacing: "normal",
    },
    lawyer: {
      colorPrimary: "#1B3A5C",
      colorSecondary: "#C9A96E",
      colorBackground: "#F8F9FA",
      colorSurface: "#FFFFFF",
      colorText: "#1F2937",
      colorTextMuted: "#6B7280",
      colorAccent: "#C9A96E",
      colorBorder: "#E5E7EB",
      fontHeading: "Merriweather",
      fontBody: "Open Sans",
      borderRadius: "0.25rem",
      spacing: "normal",
    },
    fitness: {
      colorPrimary: "#E53E3E",
      colorSecondary: "#1A1A1A",
      colorBackground: "#111111",
      colorSurface: "#1E1E1E",
      colorText: "#F5F5F5",
      colorTextMuted: "#9CA3AF",
      colorAccent: "#FBBF24",
      colorBorder: "#333333",
      fontHeading: "Oswald",
      fontBody: "Roboto",
      borderRadius: "0.25rem",
      spacing: "compact",
    },
    dentist: {
      colorPrimary: "#0EA5E9",
      colorSecondary: "#F0F9FF",
      colorBackground: "#F8FAFC",
      colorSurface: "#FFFFFF",
      colorText: "#1E293B",
      colorTextMuted: "#64748B",
      colorAccent: "#0EA5E9",
      colorBorder: "#E2E8F0",
      fontHeading: "Poppins",
      fontBody: "Nunito",
      borderRadius: "0.5rem",
      spacing: "normal",
    },
  };

  const defaults = industryDefaults[industry] ?? {
    colorPrimary: colors[0] || "#2563EB",
    colorSecondary: colors[1] || "#1E293B",
    colorBackground: "#FFFFFF",
    colorSurface: "#F8FAFC",
    colorText: "#1E293B",
    colorTextMuted: "#64748B",
    colorAccent: colors[0] || "#2563EB",
    colorBorder: "#E2E8F0",
    fontHeading: fonts[0] || "Inter",
    fontBody: fonts[1] || fonts[0] || "Inter",
    borderRadius: "0.375rem",
    spacing: "normal" as const,
  };

  // Override with detected values if available
  if (colors[0]) defaults.colorPrimary = colors[0];
  if (colors[1]) defaults.colorSecondary = colors[1];
  if (fonts[0]) defaults.fontHeading = fonts[0];
  if (fonts[1]) defaults.fontBody = fonts[1];

  return {
    colorPrimary: defaults.colorPrimary!,
    colorSecondary: defaults.colorSecondary!,
    colorBackground: defaults.colorBackground!,
    colorSurface: defaults.colorSurface!,
    colorText: defaults.colorText!,
    colorTextMuted: defaults.colorTextMuted!,
    colorAccent: defaults.colorAccent!,
    colorBorder: defaults.colorBorder!,
    fontHeading: defaults.fontHeading!,
    fontBody: defaults.fontBody!,
    borderRadius: defaults.borderRadius!,
    spacing: (defaults.spacing || "normal") as "compact" | "normal" | "relaxed",
  };
}

export function analyzeScrapeResult(
  result: ScrapeResult,
  industry: string
): AnalysisResult {
  const homePage = result.pages[0];

  const allHTML = result.pages.map((p) => p.html).join(" ");
  const colors = extractColorsFromCSS(allHTML);
  const fonts = extractFontsFromHTML(allHTML);

  const designTokens = guessDesignTokens(colors, fonts, industry);

  const pageStructures: PageStructure[] = result.pages.map((page) => {
    const sections = detectSectionsFromPage(page);
    const sectionTypes = sections.map((s) => s.type);
    return {
      slug: page.url === result.homeUrl ? "home" : new URL(page.url).pathname.replace(/\//g, "-").replace(/^-|-$/g, "") || "page",
      title: page.title,
      url: page.url,
      sections,
      seoTitle: page.title,
      seoDescription: page.description,
      hasHero: sectionTypes.includes("hero") || page.url === result.homeUrl,
      hasGallery: sectionTypes.includes("gallery"),
      hasTestimonials: sectionTypes.includes("testimonials"),
      hasTeam: sectionTypes.includes("team"),
      hasPricing: sectionTypes.includes("pricing"),
      hasContact: sectionTypes.includes("contact"),
      hasForm: page.forms.length > 0,
      hasMap: sectionTypes.includes("map"),
      hasBooking: sectionTypes.includes("booking"),
      hasBlog: sectionTypes.includes("blog"),
      hasFAQ: sectionTypes.includes("faq"),
      hasOpeningHours: sectionTypes.includes("opening-hours"),
    };
  });

  const allSectionTypes = new Set(pageStructures.flatMap((p) => p.sections.map((s) => s.type)));

  const services: string[] = [];
  for (const page of result.pages) {
    for (const heading of page.headings) {
      if (heading.tag === "h3" || heading.tag === "h4") {
        services.push(heading.text);
      }
    }
  }

  return {
    industry,
    domain: result.domain,
    url: result.homeUrl,
    siteName: homePage?.title || result.domain,
    description: homePage?.description || "",
    colorPalette: {
      primary: designTokens.colorPrimary,
      secondary: designTokens.colorSecondary,
      background: designTokens.colorBackground,
      text: designTokens.colorText,
      accent: designTokens.colorAccent,
    },
    typography: {
      headingFont: designTokens.fontHeading,
      bodyFont: designTokens.fontBody,
      headingSizes: ["2.5rem", "1.875rem", "1.25rem"],
      baseFontSize: "1rem",
    },
    designTokens,
    pages: pageStructures,
    navigation: result.navigation,
    contactInfo: homePage?.contactInfo || { phones: [], emails: [], addresses: [] },
    openingHours: result.pages.flatMap((p) => p.openingHours),
    socialLinks: result.pages.flatMap((p) => p.socialLinks),
    schemaOrg: result.pages.flatMap((p) => p.schemaOrg),
    seo: {
      title: homePage?.title || "",
      description: homePage?.description || "",
      ogImage: homePage?.ogData?.image || "",
      canonical: homePage?.canonicalUrl || null,
      hasStructuredData: result.pages.some((p) => p.schemaOrg.length > 0),
    },
    services: [...new Set(services)].slice(0, 20),
    pricing: allSectionTypes.has("pricing"),
    booking: allSectionTypes.has("booking"),
    gallery: allSectionTypes.has("gallery"),
    testimonials: allSectionTypes.has("testimonials"),
    team: allSectionTypes.has("team"),
    blog: allSectionTypes.has("blog"),
    faq: allSectionTypes.has("faq"),
    map: allSectionTypes.has("map"),
    analyzedAt: new Date().toISOString(),
  };
}
