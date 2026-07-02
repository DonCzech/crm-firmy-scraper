import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { MODULES, MODULE_CATEGORIES } from "./_modules";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { localizedPath, platformPath } from "@/lib/platform-i18n";

export const metadata: Metadata = {
  title: "Moduly Webera — Přehled funkcí",
  description:
    "12 modulů, které pokryjí každou potřebu vašeho webu. Články, SEO, e-shop, rezervace, formuláře, analytika, bezpečnost — všechno v jedné platformě.",
};

const CATEGORY_EN: Record<string, string> = {
  Obsah: "Content",
  Marketing: "Marketing",
  "E-commerce": "E-commerce",
  Konverze: "Conversion",
  Výkon: "Performance",
  Infrastruktura: "Infrastructure",
  Bezpečnost: "Security",
  Integrace: "Integrations",
  Editor: "Editor",
  Tým: "Team",
  AI: "AI",
};

const MODULE_EN: Record<string, { title: string; tagline: string; imageAlt: string }> = {
  "clanky-blog": { title: "Articles and blog", tagline: "Publish faster. Write comfortably. Find new readers.", imageAlt: "Article editor in the Webero interface" },
  "seo-viditelnost": { title: "SEO and visibility", tagline: "Rank higher in search without an SEO specialist.", imageAlt: "SEO chart and website performance metrics" },
  "eshop-katalog": { title: "E-shop and catalog", tagline: "Sell from your website from day one. No extra modules.", imageAlt: "Product detail in a Webero e-shop" },
  "rezervace-online": { title: "Online bookings (Rezora)", tagline: "Clients book themselves 24/7 without phone calls.", imageAlt: "Rezora booking calendar" },
  "formulare-leady": { title: "Forms and lead capture", tagline: "Every visitor is a potential client.", imageAlt: "Multi-step form with validation" },
  "media-knihovna": { title: "Media library", tagline: "Galleries, video, and audio without speed compromises.", imageAlt: "Media library in Webero" },
  "rychlost-vykon": { title: "Speed and performance", tagline: "Among the fastest 5% of websites on the internet.", imageAlt: "Website speed dashboard" },
  "predplatne-kurzy": { title: "Subscriptions and courses", tagline: "Sell knowledge repeatedly and automatically.", imageAlt: "Course and subscription interface" },
  "domena-hosting": { title: "Domain and hosting", tagline: "Your domain. Our hosting. EU servers.", imageAlt: "Domain and hosting settings" },
  "analytika-konverze": { title: "Analytics and conversions", tagline: "Measure what actually drives decisions.", imageAlt: "Analytics and conversion dashboard" },
  "zabezpeceni-gdpr": { title: "Security and GDPR", tagline: "Client data stays safe. Compliance without the busywork.", imageAlt: "Security and GDPR settings" },
  "integrace-zapier": { title: "Integrations and Zapier", tagline: "Connected to the tools you already use.", imageAlt: "Integration grid" },
  "live-editor": { title: "Live editor", tagline: "Edit directly on the page. What you see is what you publish.", imageAlt: "Live website editor" },
  "historie-verze": { title: "History and versioning", tagline: "Return to any previous version in a second.", imageAlt: "Version history" },
  "tym-role": { title: "Team and roles", tagline: "Collaborate without chaos. Everyone sees only what they should.", imageAlt: "Team role settings" },
  "newsletter-mailing": { title: "Newsletter and email", tagline: "Send email to thousands of people in one click.", imageAlt: "Newsletter campaign editor" },
  "popup-bannery": { title: "Pop-ups and banners", tagline: "Catch attention at the right moment without annoying people.", imageAlt: "Pop-up editor" },
  "vicejazycne-weby": { title: "Multilingual websites", tagline: "One website, many languages, managed from one admin.", imageAlt: "Language versions in editor" },
  "platby-fakturace": { title: "Payments and invoicing", tagline: "Cards, bank transfer, Apple Pay, and automatic PDF invoices.", imageAlt: "Payments and invoices" },
  "galerie-foto": { title: "Photo galleries", tagline: "Show your photos the way they deserve.", imageAlt: "Photo gallery" },
  "video-streaming": { title: "Video streaming", tagline: "Your own video without a YouTube logo.", imageAlt: "Video streaming player" },
  "mapy-lokace": { title: "Maps and locations", tagline: "Clients find you in five seconds.", imageAlt: "Map and location module" },
  "recenze-rating": { title: "Reviews and ratings", tagline: "Social proof that sells.", imageAlt: "Reviews and rating module" },
  "ai-asistent": { title: "AI content assistant", tagline: "Generate copy, alt tags, and meta descriptions automatically.", imageAlt: "AI assistant" },
  "accessibility-wcag": { title: "Accessibility (WCAG)", tagline: "For every user, including screen readers.", imageAlt: "Accessibility audit" },
  "kontaktni-formular": { title: "Contact forms", tagline: "A lead is one click away.", imageAlt: "Contact form" },
  "ssl-zabezpeceni": { title: "SSL and HTTPS", tagline: "Encrypted connection from the first minute.", imageAlt: "SSL settings" },
  "backup-obnova": { title: "Backups and restore", tagline: "Sleep better. Everything is backed up.", imageAlt: "Backup restore interface" },
  "cookie-banner": { title: "Cookie banner and GDPR", tagline: "Compliance without a lawyer. Done in two minutes.", imageAlt: "Cookie banner settings" },
  "embed-kody": { title: "Embed codes", tagline: "Calendly, YouTube, Spotify, and more without hurting performance.", imageAlt: "Embed code module" },
  "dashboard-statistiky": { title: "Stats dashboard", tagline: "See what works in one clear view.", imageAlt: "Statistics dashboard" },
  "ab-testovani": { title: "A/B testing", tagline: "Test, learn, and win without a developer.", imageAlt: "A/B testing dashboard" },
  "podpora-cesky": { title: "Human support", tagline: "A real person, seven days a week.", imageAlt: "Support chat" },
};

const COPY = {
  cs: {
    meta: "Moduly Webera",
    heroMuted: "Nula pluginů.",
    intro: `${MODULES.length} připravených modulů ve ${MODULE_CATEGORIES.length} kategoriích. Každý modul je hotová funkční jednotka — připravená, otestovaná, propojená s ostatními. Žádné stahování, žádné konflikty, žádné placení za pluginy.`,
    tryFree: "Vyzkoušet zdarma",
    showPricing: "Zobrazit ceník",
    categoriesLine: `${MODULE_CATEGORIES.length} kategorií · ${MODULES.length} modulů`,
    chooseModule: "Vyberte si modul a podívejte se detailněji.",
    moreAbout: "Více o modulu",
    simplePrice: "Jednoduchá cena",
    allModules: "Všechny moduly",
    onePrice: "v jedné ceně.",
    ctaText: "Žádné limity podle plánu, žádné platby za moduly navíc. Vše, co tu vidíte, máte od prvního dne.",
    chooseDesign: "Vybrat design",
  },
  en: {
    meta: "Webero modules",
    heroMuted: "Zero plugins.",
    intro: `${MODULES.length} ready-made modules across ${MODULE_CATEGORIES.length} categories. Every module is a functional building block: prepared, tested, and connected with the rest. No downloads, no conflicts, no plugin bills.`,
    tryFree: "Try for free",
    showPricing: "View pricing",
    categoriesLine: `${MODULE_CATEGORIES.length} categories · ${MODULES.length} modules`,
    chooseModule: "Choose a module and explore the details.",
    moreAbout: "More about this module",
    simplePrice: "Simple pricing",
    allModules: "All modules",
    onePrice: "in one price.",
    ctaText: "No plan-based module limits, no extra payments for add-ons. Everything you see here is available from day one.",
    chooseDesign: "Choose a design",
  },
} as const;

export function FeaturesHubPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const copy = COPY[locale];
  const modules = MODULES.map((m) => locale === "en" && MODULE_EN[m.slug] ? { ...m, ...MODULE_EN[m.slug], category: CATEGORY_EN[m.category] ?? m.category } : m);
  const categories = locale === "en" ? MODULE_CATEGORIES.map((c) => CATEGORY_EN[c] ?? c) : MODULE_CATEGORIES;

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <PlatformHeader forceSolid locale={locale} />

      {/* Hero — split layout with photo right */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white pt-[120px] lg:pt-[140px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.10), transparent 70%)" }}
        />
        <div className="relative mx-auto grid max-w-[1180px] gap-12 px-6 pb-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-28">
          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
              {copy.meta}
            </p>
            <h1
              className="font-sans font-semibold tracking-[-0.03em]"
              style={{ fontSize: "clamp(40px, 5.5vw, 78px)", lineHeight: "1.02" }}
            >
              {MODULES.length}+ {locale === "en" ? "modules" : "modulů"}.<br />
              <span className="text-[#9ca3af]">{copy.heroMuted}</span>
            </h1>
            <p className="mt-7 max-w-[520px] text-[17px] leading-[1.6] text-[#4b5563]">
              {copy.intro}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={platformPath("/vybrat-design", locale)} className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#111]">
                {copy.tryFree} <ArrowRight size={15} />
              </Link>
              <Link href={platformPath("/cenik", locale)} className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a]">
                {copy.showPricing}
              </Link>
            </div>
          </div>

          {/* Hero collage — three layered screenshots */}
          <div className="relative h-[380px] sm:h-[460px] lg:h-[520px]">
            <div className="absolute right-0 top-0 h-[60%] w-[78%] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/templates/peak-cut/showcase/desktop-hero.png" alt="Náhled webu Peak Cut" className="h-full w-full object-cover object-top" loading="lazy" />
            </div>
            <div className="absolute bottom-0 left-0 h-[55%] w-[62%] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.30)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/templates/barber-03/showcase/desktop-hero.png" alt="Náhled webu Barber 03" className="h-full w-full object-cover object-top" loading="lazy" />
            </div>
            <div className="absolute -bottom-4 right-6 h-[45%] w-[28%] overflow-hidden rounded-[24px] border border-[#e5e7eb] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.30)] sm:right-12 lg:right-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/templates/barber-03/showcase/mobile-hero.png" alt="Mobilní náhled" className="h-full w-full object-cover object-top" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-4 text-[11.5px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
                {copy.categoriesLine}
              </p>
              <h2
                className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: "1.08" }}
              >
                {copy.chooseModule}
              </h2>
            </div>
            <div className="hidden flex-wrap gap-2 lg:flex">
              {categories.map((c) => (
                <span key={c} className="rounded-full border border-[#e5e7eb] bg-[#fafafa] px-3 py-1 text-[12px] font-medium text-[#4b5563]">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {modules.map((m) => (
              <Link
                key={m.slug}
                href={localizedPath(`/prehled-funkci/${m.slug}`, locale)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#0a0a0a]/20 hover:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.18)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#fafafa]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image}
                    alt={m.imageAlt}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6366f1] backdrop-blur-sm">
                      {m.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6 lg:p-7">
                  <h3 className="text-[20px] font-semibold tracking-[-0.015em] text-[#0a0a0a]">{m.title}</h3>
                  <p className="mt-2.5 flex-1 text-[14px] leading-[1.6] text-[#4b5563]">{m.tagline}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6366f1] transition group-hover:text-[#4338ca]">
                    {copy.moreAbout} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 80% at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-32">
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6366f1]">
            {copy.simplePrice}
          </p>
          <h2
            className="mx-auto max-w-[720px] font-sans font-semibold tracking-[-0.03em] text-[#0a0a0a]"
            style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: "1.05" }}
          >
            {copy.allModules}<br />
            <span className="text-[#9ca3af]">{copy.onePrice}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[15.5px] leading-[1.65] text-[#555]">
            {copy.ctaText}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={platformPath("/cenik", locale)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:bg-[#222]"
            >
              {copy.showPricing} <ArrowRight size={16} />
            </Link>
            <Link
              href={platformPath("/vybrat-design", locale)}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a]/30"
            >
              {copy.chooseDesign}
            </Link>
          </div>
        </div>
      </section>

      <PlatformFooter locale={locale} />
    </main>
  );
}

export default function FeaturesHubPage() {
  return <FeaturesHubPageContent locale="cs" />;
}
