import * as cheerio from "cheerio";

export interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  html: string;
  text: string;
  links: string[];
  images: string[];
  headings: { tag: string; text: string }[];
  navigation: string[];
  sections: string[];
  forms: { action?: string; fields: string[] }[];
  contactInfo: {
    phones: string[];
    emails: string[];
    addresses: string[];
  };
  openingHours: string[];
  socialLinks: string[];
  ogData: Record<string, string>;
  schemaOrg: unknown[];
  canonicalUrl: string | null;
  loadedAt: string;
}

export interface ScrapeResult {
  domain: string;
  homeUrl: string;
  pages: ScrapedPage[];
  navigation: string[];
  allLinks: string[];
  scrapedAt: string;
  error?: string;
}

const FETCH_OPTS: RequestInit = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "cs,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    Connection: "keep-alive",
  },
  signal: AbortSignal.timeout(15000),
};

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function resolveUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function isSameDomain(base: string, url: string): boolean {
  try {
    const baseDomain = new URL(base).hostname;
    const urlDomain = new URL(url).hostname;
    return urlDomain === baseDomain || urlDomain.endsWith("." + baseDomain);
  } catch {
    return false;
  }
}

function extractPhones(text: string): string[] {
  const phoneRegex =
    /(?:\+420\s?)?(?:\d{3}\s?\d{3}\s?\d{3}|\d{3}-\d{3}-\d{3})/g;
  return [...new Set(text.match(phoneRegex) ?? [])].slice(0, 5);
}

function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return [...new Set(text.match(emailRegex) ?? [])].slice(0, 5);
}

function extractOpeningHours(text: string): string[] {
  const patterns = [
    /(?:po|út|st|čt|pá|so|ne|pon|úte|stř|čtv|pát|sob|ned)[a-záéíóúůýčšžřďťň\s,–-]*\d{1,2}[.:]\d{2}/gi,
    /\d{1,2}[.:]\d{2}\s*[-–]\s*\d{1,2}[.:]\d{2}/g,
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^.]{0,30}\d{1,2}[.:]\d{2}/gi,
  ];
  const results: string[] = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) results.push(...m);
  }
  return [...new Set(results)].slice(0, 10);
}

async function scrapePage(url: string): Promise<ScrapedPage | null> {
  try {
    const res = await fetch(url, FETCH_OPTS);
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $("script:not([type='application/ld+json']), style, noscript, iframe, [hidden], .hidden").remove();

    const title = $("title").text().trim() || $("h1").first().text().trim();
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    const headings: { tag: string; text: string }[] = [];
    $("h1,h2,h3,h4").each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push({ tag: el.tagName, text: text.slice(0, 200) });
    });

    const navigation: string[] = [];
    $("nav a, header a, .menu a, .nav a, .navigation a, #menu a").each(
      (_, el) => {
        const text = $(el).text().trim();
        if (text && text.length < 60) navigation.push(text);
      }
    );

    const links: string[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        const resolved = resolveUrl(url, href);
        if (resolved && isSameDomain(url, resolved)) links.push(resolved);
      }
    });

    const images: string[] = [];
    $("img[src]").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src) {
        const resolved = resolveUrl(url, src);
        if (resolved) images.push(resolved);
      }
    });

    const forms: { action?: string; fields: string[] }[] = [];
    $("form").each((_, form) => {
      const fields: string[] = [];
      $(form)
        .find("input,textarea,select")
        .each((__, field) => {
          const name =
            $(field).attr("name") ||
            $(field).attr("placeholder") ||
            $(field).attr("type") ||
            "";
          if (name) fields.push(name);
        });
      forms.push({ action: $(form).attr("action"), fields });
    });

    const socialLinks: string[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (
        /facebook|instagram|twitter|linkedin|youtube|tiktok/i.test(href)
      ) {
        socialLinks.push(href);
      }
    });

    const ogData: Record<string, string> = {};
    $("meta[property^='og:']").each((_, el) => {
      const prop = $(el).attr("property")?.replace("og:", "") || "";
      const content = $(el).attr("content") || "";
      if (prop) ogData[prop] = content;
    });

    const schemaOrg: unknown[] = [];
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const parsed = JSON.parse($(el).html() || "{}");
        schemaOrg.push(parsed);
      } catch {}
    });

    const canonicalUrl =
      $('link[rel="canonical"]').attr("href") || null;

    const bodyText = $.root().text().replace(/\s+/g, " ").trim();

    const sectionElements: string[] = [];
    $("section, article, .section, [class*='section'], [id*='section'], main > div > div").each(
      (_, el) => {
        const classes = $(el).attr("class") || $(el).attr("id") || "";
        if (classes) sectionElements.push(classes.slice(0, 100));
      }
    );

    return {
      url,
      title,
      description,
      html: html.slice(0, 200000),
      text: bodyText.slice(0, 10000),
      links: [...new Set(links)].slice(0, 50),
      images: [...new Set(images)].slice(0, 30),
      headings: headings.slice(0, 30),
      navigation: [...new Set(navigation)].slice(0, 20),
      sections: [...new Set(sectionElements)].slice(0, 30),
      forms,
      contactInfo: {
        phones: extractPhones(bodyText),
        emails: extractEmails(bodyText),
        addresses: [],
      },
      openingHours: extractOpeningHours(bodyText),
      socialLinks: [...new Set(socialLinks)].slice(0, 10),
      ogData,
      schemaOrg,
      canonicalUrl,
      loadedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[scraper] Error scraping ${url}:`, err);
    return null;
  }
}

export async function scrapeWebsite(homeUrl: string): Promise<ScrapeResult> {
  const domain = extractDomain(homeUrl);
  const result: ScrapeResult = {
    domain,
    homeUrl,
    pages: [],
    navigation: [],
    allLinks: [],
    scrapedAt: new Date().toISOString(),
  };

  try {
    const homePage = await scrapePage(homeUrl);
    if (!homePage) {
      result.error = "Failed to scrape homepage";
      return result;
    }
    result.pages.push(homePage);
    result.navigation = homePage.navigation;

    // Collect unique subpage URLs to scrape (max 6 subpages)
    const toScrape = new Set<string>();
    for (const link of homePage.links) {
      if (
        isSameDomain(homeUrl, link) &&
        link !== homeUrl &&
        !link.includes("#") &&
        !link.includes("?") &&
        !link.match(/\.(pdf|jpg|png|gif|zip|doc|docx)$/i)
      ) {
        toScrape.add(link);
      }
    }

    // Also check nav links specifically
    for (const navItem of homePage.navigation) {
      const resolved = resolveUrl(homeUrl, navItem);
      if (resolved && isSameDomain(homeUrl, resolved)) {
        toScrape.add(resolved);
      }
    }

    const subpages = [...toScrape].slice(0, 6);
    for (const url of subpages) {
      const page = await scrapePage(url);
      if (page) {
        result.pages.push(page);
        await new Promise((r) => setTimeout(r, 500)); // polite delay
      }
    }

    result.allLinks = [...new Set(result.pages.flatMap((p) => p.links))];
  } catch (err) {
    result.error = String(err);
  }

  return result;
}
