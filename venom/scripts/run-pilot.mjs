/**
 * Template Intelligence Lab — Pilot runner
 * Runs scraping + analysis + template generation directly as Node.js script
 */

import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const FETCH_OPTS = {
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "cs,en;q=0.9",
    Connection: "keep-alive",
  },
  signal: AbortSignal.timeout(15000),
};

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
  const logPath = path.join(ROOT, "template-lab/system/progress-log.md");
  fs.appendFileSync(logPath, `\n### [${ts}] ${msg}`);
}

function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function updateWorkflow(update) {
  const statePath = path.join(ROOT, "template-lab/system/workflow-state.json");
  let state = {};
  try { state = JSON.parse(fs.readFileSync(statePath, "utf-8")); } catch {}
  state = { ...state, ...update, updatedAt: new Date().toISOString() };
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function updateJob(job) {
  const jobsPath = path.join(ROOT, "template-lab/system/jobs.json");
  let jobs = [];
  try { jobs = JSON.parse(fs.readFileSync(jobsPath, "utf-8")); } catch {}
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx >= 0) jobs[idx] = { ...jobs[idx], ...job, updatedAt: new Date().toISOString() };
  else jobs.unshift(job);
  fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2));
}

async function scrapePage(url) {
  log(`  Scraping: ${url}`);
  try {
    const res = await fetch(url, FETCH_OPTS);
    if (!res.ok) { log(`  -> HTTP ${res.status}`); return null; }
    const html = await res.text();
    const $ = cheerio.load(html);

    $("script:not([type='application/ld+json']), style, noscript, iframe").remove();

    const title = $("title").text().trim() || $("h1").first().text().trim();
    const description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";

    const headings = [];
    $("h1,h2,h3,h4").each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push({ tag: el.tagName, text: text.slice(0, 200) });
    });

    const navigation = [];
    $("nav a, header a, .menu a, .nav a").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 60) navigation.push(text);
    });

    const links = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        try {
          const resolved = new URL(href, url).href;
          if (new URL(resolved).hostname === new URL(url).hostname) links.push(resolved);
        } catch {}
      }
    });

    const images = [];
    $("img[src]").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src) {
        try { images.push(new URL(src, url).href); } catch {}
      }
    });

    const socialLinks = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (/facebook|instagram|twitter|linkedin|youtube|tiktok/i.test(href)) socialLinks.push(href);
    });

    const ogData = {};
    $("meta[property^='og:']").each((_, el) => {
      const prop = ($(el).attr("property") || "").replace("og:", "");
      const content = $(el).attr("content") || "";
      if (prop) ogData[prop] = content;
    });

    const schemaOrg = [];
    $("script[type='application/ld+json']").each((_, el) => {
      try { schemaOrg.push(JSON.parse($(el).html() || "{}")); } catch {}
    });

    const bodyText = $.root().text().replace(/\s+/g, " ").trim().slice(0, 8000);

    // Extract phones
    const phones = [...new Set((bodyText.match(/(?:\+420\s?)?(?:\d{3}\s?\d{3}\s?\d{3})/g) || []))].slice(0, 3);
    const emails = [...new Set((bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []))].slice(0, 3);

    // Opening hours patterns
    const hourMatches = bodyText.match(/(?:po|út|st|čt|pá|so|ne)[a-záéíóúůýčšžřďťň\s,–-]*\d{1,2}[.:]\d{2}/gi) || [];
    const openingHours = [...new Set(hourMatches)].slice(0, 6);

    const sections = [];
    $("section, article, .section, main > div").each((_, el) => {
      const cls = $(el).attr("class") || $(el).attr("id") || "";
      if (cls) sections.push(cls.slice(0, 100));
    });

    const hasMap = $("iframe[src*='google.com/maps']").length > 0 || bodyText.toLowerCase().includes("mapa");
    const hasPricing = /\d+\s*(?:Kč|CZK|€|,-)/i.test(bodyText);
    const hasBooking = /rezervace|booking|objednat|appointment/i.test(bodyText);
    const hasGallery = images.length > 5 || /galerie|gallery/i.test(bodyText);
    const hasTestimonials = /recenze|reviews|testimonials|hodnocení/i.test(bodyText);
    const hasTeam = /tým|team|o nás/i.test(bodyText);
    const hasFAQ = /faq|časté dotazy|otázky/i.test(bodyText);

    return {
      url,
      title,
      description,
      html: html.slice(0, 150000),
      text: bodyText,
      links: [...new Set(links)].slice(0, 40),
      images: [...new Set(images)].slice(0, 20),
      headings: headings.slice(0, 20),
      navigation: [...new Set(navigation)].slice(0, 15),
      sections: [...new Set(sections)].slice(0, 20),
      socialLinks: [...new Set(socialLinks)].slice(0, 5),
      ogData,
      schemaOrg,
      contactInfo: { phones, emails, addresses: [] },
      openingHours,
      hasMap, hasPricing, hasBooking, hasGallery, hasTestimonials, hasTeam, hasFAQ,
      loadedAt: new Date().toISOString(),
    };
  } catch (err) {
    log(`  -> Error: ${err.message}`);
    return null;
  }
}

async function scrapeWebsite(homeUrl) {
  const domain = new URL(homeUrl).hostname;
  const pages = [];

  const home = await scrapePage(homeUrl);
  if (!home) return { domain, homeUrl, pages, error: "Failed to load homepage" };
  pages.push(home);

  // Scrape up to 4 subpages from nav links
  const toScrape = new Set();
  for (const link of home.links) {
    try {
      const u = new URL(link);
      if (u.hostname === domain && !link.includes("#") && !link.match(/\.(pdf|jpg|png|gif|zip)$/i)) {
        toScrape.add(link);
      }
    } catch {}
  }

  let scraped = 0;
  for (const url of toScrape) {
    if (scraped >= 4) break;
    if (url === homeUrl) continue;
    await new Promise(r => setTimeout(r, 800));
    const page = await scrapePage(url);
    if (page) { pages.push(page); scraped++; }
  }

  return { domain, homeUrl, pages, scrapedAt: new Date().toISOString() };
}

function extractColors(html) {
  const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\d+,\s*\d+,\s*\d+\)/g;
  return [...new Set(html.match(colorRegex) || [])]
    .filter(c => !["#fff", "#000", "#ffffff", "#000000"].includes(c))
    .slice(0, 15);
}

function extractFonts(html) {
  const fonts = [];
  const re = /font-family:\s*['"]?([^;'"]+)['"]?/gi;
  let m;
  while ((m = re.exec(html)) !== null) fonts.push(m[1].split(",")[0].trim().replace(/['"]/g, ""));
  const googleRe = /fonts\.googleapis\.com\/css.*?family=([^&"']+)/gi;
  while ((m = googleRe.exec(html)) !== null) fonts.push(decodeURIComponent(m[1].split(":")[0].replace(/\+/g, " ")));
  return [...new Set(fonts)].slice(0, 5);
}

function generateTemplate(analysis, pages) {
  const domain = analysis.domain.replace(/^www\./, "");
  const domainShort = domain.split(".")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const slug = `barber-${domainShort}`;

  const homePage = pages[0];
  const allHTML = pages.map(p => p.html).join(" ");
  const colors = extractColors(allHTML);
  const fonts = extractFonts(allHTML);

  // Barber-specific design tokens (dark luxury theme)
  const designTokens = {
    colorPrimary: colors[0] || "#C9A96E",
    colorSecondary: colors[1] || "#1a1a1a",
    colorBackground: "#111111",
    colorSurface: "#1E1E1E",
    colorText: "#F5F5F5",
    colorTextMuted: "#A0A0A0",
    colorAccent: "#C9A96E",
    colorBorder: "#333333",
    fontHeading: fonts.find(f => !/mono|code/i.test(f)) || "Playfair Display",
    fontBody: fonts[1] || "Inter",
    borderRadius: "0.25rem",
    spacing: "normal",
  };

  const sections = [];
  let order = 0;

  // Navbar
  sections.push({
    type: "navbar", variant: "default", order: order++, visible: true,
    settings: {
      logo: homePage.title || domain,
      links: homePage.navigation.slice(0, 6).map(label => ({ label, href: `#${label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}` })),
      cta: { text: "Rezervovat", href: "#rezervace" },
      designTokens,
    }
  });

  // Hero
  sections.push({
    type: "hero", variant: "default", order: order++, visible: true,
    settings: {
      title: homePage.headings[0]?.text || homePage.title || "Profesionální Barber Studio",
      subtitle: homePage.description || "Přijďte zažít tu nejlepší péči v Praze",
      cta: { primary: { text: "Rezervovat online", href: "#rezervace" }, secondary: { text: "Ceník", href: "#cenik" } },
      backgroundImage: homePage.images[0] || "",
      overlay: true, designTokens,
    }
  });

  // Services
  const serviceItems = homePage.headings.filter(h => h.tag === "h3" || h.tag === "h2").slice(1, 7);
  sections.push({
    type: "services", variant: "grid", order: order++, visible: true,
    settings: {
      title: "Naše Služby",
      subtitle: "Profesionální péče pro každého",
      items: serviceItems.length > 0 ? serviceItems.map((h, i) => ({
        id: `s${i}`, title: h.text, description: "Profesionální barbering na nejvyšší úrovni.", icon: "scissors", price: "",
      })) : [
        { id: "s1", title: "Střih vlasů", description: "Klasický nebo moderní střih podle vašeho stylu.", icon: "scissors", price: "od 350 Kč" },
        { id: "s2", title: "Holení břitvou", description: "Tradiční holení s teplým ručníkem.", icon: "blade", price: "od 450 Kč" },
        { id: "s3", title: "Úprava vousů", description: "Precizní tvarování a úprava vousů.", icon: "beard", price: "od 250 Kč" },
        { id: "s4", title: "Kompletní servis", description: "Střih + holení + styling v jednom.", icon: "star", price: "od 699 Kč" },
      ],
      designTokens,
    }
  });

  // Pricing (if detected or forced for barber)
  sections.push({
    type: "pricing", variant: "table", order: order++, visible: true,
    settings: {
      title: "Ceník",
      subtitle: "Transparentní ceny bez skrytých poplatků",
      currency: "Kč",
      items: [
        { id: "p1", name: "Střih vlasů", price: "350", unit: "od", description: "" },
        { id: "p2", name: "Střih + Vousy", price: "550", unit: "od", description: "" },
        { id: "p3", name: "Holení břitvou", price: "450", unit: "od", description: "" },
        { id: "p4", name: "Úprava vousů", price: "250", unit: "od", description: "" },
        { id: "p5", name: "Kompletní servis", price: "699", unit: "od", description: "Střih + holení + styling" },
        { id: "p6", name: "Dětský střih", price: "250", unit: "od", description: "Do 12 let" },
      ],
      designTokens,
    }
  });

  // Gallery
  if (homePage.hasGallery || homePage.images.length > 3) {
    sections.push({
      type: "gallery", variant: "masonry", order: order++, visible: true,
      settings: {
        title: "Galerie",
        subtitle: "Naše práce mluví za nás",
        images: homePage.images.slice(0, 8).map((src, i) => ({ id: `g${i}`, src, alt: `Práce ${i+1}` })),
        designTokens,
      }
    });
  }

  // Team
  sections.push({
    type: "team", variant: "cards", order: order++, visible: true,
    settings: {
      title: "Náš Tým",
      subtitle: "Mistři svého řemesla",
      members: [
        { id: "m1", name: "Milan Novák", role: "Master Barber", bio: "15 let zkušeností v barberskills.", photo: "" },
        { id: "m2", name: "Jakub Procházka", role: "Senior Barber", bio: "Specialista na holení břitvou.", photo: "" },
        { id: "m3", name: "Ondřej Šimánek", role: "Barber", bio: "Milovník klasického barberstyle.", photo: "" },
      ],
      designTokens,
    }
  });

  // Testimonials
  if (homePage.hasTestimonials) {
    sections.push({
      type: "testimonials", variant: "carousel", order: order++, visible: true,
      settings: {
        title: "Co říkají zákazníci",
        reviews: [
          { id: "r1", author: "Martin K.", rating: 5, text: "Nejlepší barber v Praze! Profesionální přístup a skvělý výsledek.", date: "2025-03-15" },
          { id: "r2", author: "Tomáš V.", rating: 5, text: "Vždy odcházím spokojený. Určitě doporučuji!", date: "2025-02-28" },
          { id: "r3", author: "Pavel M.", rating: 5, text: "Příjemné prostředí, precizní práce. Má oblíbená barbershop.", date: "2025-04-01" },
        ],
        designTokens,
      }
    });
  }

  // Opening hours
  sections.push({
    type: "opening-hours", variant: "default", order: order++, visible: true,
    settings: {
      title: "Otevírací Doba",
      hours: homePage.openingHours.length > 0
        ? homePage.openingHours.map((h, i) => ({ day: h, time: "" }))
        : [
          { day: "Pondělí – Pátek", time: "9:00 – 19:00" },
          { day: "Sobota", time: "9:00 – 16:00" },
          { day: "Neděle", time: "Zavřeno" },
        ],
      designTokens,
    }
  });

  // Booking CTA
  if (homePage.hasBooking) {
    sections.push({
      type: "rezora-cta", variant: "default", order: order++, visible: true,
      settings: {
        title: "Rezervujte si termín online",
        subtitle: "Rychlá rezervace bez telefonování",
        buttonText: "Rezervovat nyní",
        designTokens,
      }
    });
  }

  // FAQ
  sections.push({
    type: "faq", variant: "accordion", order: order++, visible: true,
    settings: {
      title: "Časté dotazy",
      items: [
        { q: "Jak si rezervuji termín?", a: "Termín lze rezervovat online přes náš systém, telefonicky nebo osobně v barbershopu." },
        { q: "Jak dlouho trvá návštěva?", a: "Střih vlasů trvá přibližně 30–45 minut, kompletní servis 60–90 minut." },
        { q: "Přijímáte platby kartou?", a: "Ano, přijímáme hotovost i platby kartou." },
        { q: "Potřebuji se předem objednat?", a: "Doporučujeme rezervaci předem, ale přijímáme i klienty bez objednání, pokud je volná kapacita." },
      ],
      designTokens,
    }
  });

  // Contact
  sections.push({
    type: "contact", variant: "split", order: order++, visible: true,
    settings: {
      title: "Kontakt",
      subtitle: "Rádi vás uvítáme",
      phone: homePage.contactInfo.phones[0] || "+420 000 000 000",
      email: homePage.contactInfo.emails[0] || "info@barbershop.cz",
      address: "Praha, Česká republika",
      openingHours: "Po–Pá: 9:00–19:00 | So: 9:00–16:00",
      socialLinks: homePage.socialLinks,
      form: { enabled: true, fields: ["name", "email", "phone", "message"] },
      map: { enabled: homePage.hasMap, lat: 50.0755, lng: 14.4378 },
      designTokens,
    }
  });

  // Footer
  sections.push({
    type: "footer", variant: "default", order: order++, visible: true,
    settings: {
      logo: homePage.title || domain,
      tagline: "Profesionální barbershop v Praze",
      links: homePage.navigation.slice(0, 5).map(label => ({ label, href: `#${label.toLowerCase()}` })),
      socialLinks: homePage.socialLinks,
      copyright: `© ${new Date().getFullYear()} ${homePage.title || domain}. Všechna práva vyhrazena.`,
      designTokens,
    }
  });

  return {
    slug,
    name: `Barber Shop — ${homePage.title || domain}`,
    industry: "barber",
    sourceUrl: analysis.homeUrl,
    definition: {
      key: slug,
      name: `Barber Shop — ${homePage.title || domain}`,
      industry: "barber",
      version: "1.0.0",
      designTokens,
      defaultSections: sections.map(s => ({ type: s.type, variant: s.variant, order: s.order, visible: s.visible })),
      pages: [{
        slug: "home", title: "Domů",
        seoTitle: homePage.title || "Barbershop — Praha",
        seoDescription: homePage.description || "Profesionální barber studio v Praze.",
        sections: sections.map(s => ({ ...s, content: s.settings })),
      }],
      demoContent: Object.fromEntries(sections.map(s => [s.type, s.settings])),
    },
    pagesData: [{
      slug: "home", title: "Domů",
      seoTitle: homePage.title || "Barbershop Praha",
      seoDescription: homePage.description,
      isHomepage: true,
      sections,
    }],
    generatedAt: new Date().toISOString(),
  };
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

const TARGET_URL = "https://barbershopurban.cz";
const INDUSTRY = "barber";
const DOMAIN = new URL(TARGET_URL).hostname.replace(/^www\./, "");

const job = {
  id: `job-${Date.now()}`,
  url: TARGET_URL,
  industry: INDUSTRY,
  status: "analyzing",
  stage: "starting",
  error: null,
  log: [`[${new Date().toISOString()}] Pilot job started`],
  templateSlug: null,
  startedAt: new Date().toISOString(),
  completedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

updateJob(job);
updateWorkflow({
  currentIndustry: INDUSTRY,
  currentWebsite: TARGET_URL,
  currentStage: "scraping",
  status: "analyzing",
  startedAt: new Date().toISOString(),
});

log(`🚀 Starting pilot analysis: ${TARGET_URL}`);

try {
  // Step 1: Scrape
  log(`📡 KROK 1: Scraping ${TARGET_URL}...`);
  job.stage = "scraping";
  updateJob(job);

  const scrapeResult = await scrapeWebsite(TARGET_URL);
  log(`✅ Scraped ${scrapeResult.pages.length} pages`);
  job.log.push(`Scraped ${scrapeResult.pages.length} pages`);

  // Save research
  const researchDir = path.join(ROOT, "template-lab/research", INDUSTRY, DOMAIN);
  fs.mkdirSync(researchDir, { recursive: true });

  const pagesData = scrapeResult.pages.map(p => ({
    url: p.url, title: p.title, description: p.description,
    navigation: p.navigation, headings: p.headings, sections: p.sections,
    contactInfo: p.contactInfo, openingHours: p.openingHours,
    socialLinks: p.socialLinks, ogData: p.ogData, schemaOrg: p.schemaOrg,
    hasMap: p.hasMap, hasPricing: p.hasPricing, hasBooking: p.hasBooking,
    hasGallery: p.hasGallery, imageCount: p.images.length,
    loadedAt: p.loadedAt,
  }));

  saveJson(path.join(researchDir, "pages.json"), pagesData);

  // Analysis summary
  const analysis = {
    industry: INDUSTRY,
    domain: DOMAIN,
    homeUrl: TARGET_URL,
    siteName: scrapeResult.pages[0]?.title || DOMAIN,
    description: scrapeResult.pages[0]?.description || "",
    pages: scrapeResult.pages.map(p => ({
      url: p.url, title: p.title,
      hasHero: true,
      hasGallery: p.hasGallery,
      hasTestimonials: p.hasTestimonials,
      hasTeam: p.hasTeam,
      hasPricing: p.hasPricing,
      hasContact: true,
      hasMap: p.hasMap,
      hasBooking: p.hasBooking,
      hasFAQ: p.hasFAQ,
    })),
    navigation: scrapeResult.pages[0]?.navigation || [],
    contactInfo: scrapeResult.pages[0]?.contactInfo || { phones: [], emails: [], addresses: [] },
    openingHours: scrapeResult.pages.flatMap(p => p.openingHours),
    socialLinks: [...new Set(scrapeResult.pages.flatMap(p => p.socialLinks))],
    schemaOrg: scrapeResult.pages.flatMap(p => p.schemaOrg),
    analyzedAt: new Date().toISOString(),
  };

  saveJson(path.join(researchDir, "analysis.json"), analysis);
  log(`📊 Analysis saved to ${researchDir}/analysis.json`);

  // Step 2: Screenshots
  log(`📸 KROK 2: Screenshots...`);
  job.stage = "screenshots";
  updateJob(job);

  const screenshotDir = path.join(researchDir, "screenshots");
  fs.mkdirSync(screenshotDir, { recursive: true });

  const screenshots = { desktop: null, mobile: null };
  try {
    const { chromium } = await import("playwright-core");
    const chromePaths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
    const executablePath = chromePaths.find(p => { try { return fs.existsSync(p); } catch { return false; } });

    if (executablePath) {
      log(`  Using Chrome: ${executablePath}`);
      const browser = await chromium.launch({
        executablePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      // Desktop
      const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const deskPage = await deskCtx.newPage();
      await deskPage.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
      await deskPage.waitForTimeout(2000);
      const deskPath = path.join(screenshotDir, "desktop.png");
      await deskPage.screenshot({ path: deskPath, fullPage: true });
      await deskCtx.close();
      screenshots.desktop = deskPath;
      log(`  Desktop screenshot: ${deskPath}`);

      // Mobile
      const mobCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" });
      const mobPage = await mobCtx.newPage();
      await mobPage.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
      await mobPage.waitForTimeout(1500);
      const mobPath = path.join(screenshotDir, "mobile.png");
      await mobPage.screenshot({ path: mobPath, fullPage: true });
      await mobCtx.close();
      screenshots.mobile = mobPath;
      log(`  Mobile screenshot: ${mobPath}`);

      await browser.close();
    } else {
      log(`  ⚠️ Chrome not found, skipping screenshots`);
    }
  } catch (err) {
    log(`  ⚠️ Screenshot error: ${err.message}`);
  }

  // Step 3: Generate template
  log(`🎨 KROK 3: Generating template...`);
  job.stage = "generating";
  updateJob(job);

  const generated = generateTemplate(analysis, scrapeResult.pages);

  const generatedDir = path.join(ROOT, "template-lab/generated", INDUSTRY, generated.slug);
  fs.mkdirSync(generatedDir, { recursive: true });
  saveJson(path.join(generatedDir, "template.json"), generated);
  log(`✅ Template saved: ${generatedDir}/template.json`);
  log(`   Slug: ${generated.slug}`);
  log(`   Name: ${generated.name}`);
  log(`   Sections: ${generated.pagesData[0].sections.length}`);

  // Step 4: Update state
  job.status = "ready-for-review";
  job.stage = "ready_for_review";
  job.templateSlug = generated.slug;
  job.completedAt = new Date().toISOString();
  updateJob(job);

  updateWorkflow({
    currentStage: "ready_for_review",
    status: "ready-for-review",
    lastCompletedStep: "template_generated",
    nextStep: "waiting_for_manual_review",
    requiresHumanApproval: true,
    generatedFiles: [path.join(generatedDir, "template.json")],
  });

  // Add to review queue
  const reviewPath = path.join(ROOT, "template-lab/system/review-queue.json");
  let reviewQueue = [];
  try { reviewQueue = JSON.parse(fs.readFileSync(reviewPath, "utf-8")); } catch {}
  reviewQueue.push({
    jobId: job.id,
    templateSlug: generated.slug,
    templateName: generated.name,
    industry: INDUSTRY,
    sourceUrl: TARGET_URL,
    addedAt: new Date().toISOString(),
    status: "pending",
    notes: "",
    screenshotDesktop: screenshots.desktop,
    screenshotMobile: screenshots.mobile,
  });
  fs.writeFileSync(reviewPath, JSON.stringify(reviewQueue, null, 2));

  log(`\n🎉 PILOT DOKONČEN!`);
  log(`   Template: ${generated.slug}`);
  log(`   Uloženo: ${generatedDir}/template.json`);
  log(`   Status: ČEKÁ NA MANUÁLNÍ SCHVÁLENÍ`);
  log(`\n   → Otevřete admin na http://localhost:3015/admin/template-lab`);
  log(`   → Zkontrolujte šablonu a schvalte ji`);

  // Summary
  const summary = {
    status: "ready-for-review",
    templateSlug: generated.slug,
    templateName: generated.name,
    sourceUrl: TARGET_URL,
    screenshotDesktop: screenshots.desktop,
    screenshotMobile: screenshots.mobile,
    generatedAt: generated.generatedAt,
    pagesScraped: scrapeResult.pages.length,
    sectionsGenerated: generated.pagesData[0].sections.length,
    files: {
      template: path.join(generatedDir, "template.json"),
      research: path.join(researchDir, "analysis.json"),
      pages: path.join(researchDir, "pages.json"),
    },
  };
  saveJson(path.join(generatedDir, "summary.json"), summary);

  console.log("\n" + "=".repeat(60));
  console.log("✅ PILOT HOTOV — barbershopurban.cz");
  console.log("=".repeat(60));
  console.log("Slug:", generated.slug);
  console.log("Sekce:", generated.pagesData[0].sections.map(s => s.type).join(", "));
  console.log("Files:");
  console.log("  Template:", path.join(generatedDir, "template.json"));
  console.log("  Research:", path.join(researchDir, "analysis.json"));
  if (screenshots.desktop) console.log("  Screenshot Desktop:", screenshots.desktop);
  if (screenshots.mobile) console.log("  Screenshot Mobile:", screenshots.mobile);
  console.log("\n→ Status: ČEKÁ NA SCHVÁLENÍ");
  console.log("→ Admin: http://localhost:3015/admin/template-lab");
  console.log("=".repeat(60));

} catch (err) {
  log(`❌ FATAL ERROR: ${err.message}\n${err.stack}`);
  job.status = "failed";
  job.error = err.message;
  updateJob(job);
  updateWorkflow({ status: "failed", currentStage: "failed" });
  console.error("Fatal error:", err);
  process.exit(1);
}
