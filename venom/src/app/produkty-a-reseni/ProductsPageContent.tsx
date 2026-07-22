import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Sparkles, ChevronDown } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { platformPath } from "@/lib/platform-i18n";

/* ────────────────────────────────────────────────────────────────────────
   Products & Solutions — awwwards-grade, deliberately lean.
   Three products: Websites · Custom e-shops · Webero AI Builder.
   Plus the "or we do it for you" custom studio.
   Server component — every motion is pure CSS, no client hooks.
   ──────────────────────────────────────────────────────────────────────── */

const SERIF = "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif";

type Product = { key: string; tag: string; title: string; perex: string; meta: string; image: string };
type FeatureGroup = { title: string; items: string[] };

const FEATURE_GROUPS_CS: FeatureGroup[] = [
  { title: "Obsah a média", items: ["Blog a články", "Mediální knihovna", "Fotogalerie", "Video streaming", "Kurzy a předplatné"] },
  { title: "Prodej", items: ["E-shop a katalog", "Platby a fakturace", "Slevové kódy", "Sklad a varianty"] },
  { title: "Konverze", items: ["Rezervace online", "Formuláře a leady", "Pop-upy a bannery", "Recenze", "Mapy a lokace"] },
  { title: "Marketing", items: ["SEO a viditelnost", "Analytika", "Newsletter", "A/B testování", "Vícejazyčnost"] },
  { title: "Editor a tým", items: ["Live editor", "Historie verzí", "Tým a role", "AI asistent", "Česká podpora"] },
  { title: "Provoz a bezpečnost", items: ["Doména a hosting", "SSL a HTTPS", "Zálohy a obnova", "GDPR a cookies", "Integrace a API"] },
];

const FEATURE_GROUPS_EN: FeatureGroup[] = [
  { title: "Content & media", items: ["Blog & articles", "Media library", "Photo galleries", "Video streaming", "Courses & memberships"] },
  { title: "Selling", items: ["E-shop & catalog", "Payments & invoicing", "Discount codes", "Stock & variants"] },
  { title: "Conversion", items: ["Online booking", "Forms & leads", "Pop-ups & banners", "Reviews", "Maps & locations"] },
  { title: "Marketing", items: ["SEO & visibility", "Analytics", "Newsletter", "A/B testing", "Multilingual"] },
  { title: "Editor & team", items: ["Live editor", "Version history", "Team & roles", "AI assistant", "Czech support"] },
  { title: "Ops & security", items: ["Domain & hosting", "SSL & HTTPS", "Backups & restore", "GDPR & cookies", "Integrations & API"] },
];

const PRODUCTS_CS: Product[] = [
  { key: "weby", tag: "Weby", title: "Webové stránky", perex: "Přes 100 profi šablon pro každý obor. Každou spustíte jako one-page, nebo jako plný multipage web — vyberete si.", meta: "100+ šablon · one-page i multipage", image: "/templates/hotel-01/preview.webp" },
  { key: "eshop", tag: "E-shop", title: "Vlastní e-shopy", perex: "20 profesionálních šablon e-shopu. Platby, sklad, doprava i faktury máte rovnou v ceně.", meta: "20 šablon · vše v jednom", image: "/templates/eshop-08/preview.webp" },
];

const STUDIO_CAPS_CS = ["Weby na míru", "Custom e-commerce", "Web apps & SaaS", "AI & automatizace", "Rezervační systémy", "Mobil & PWA", "API & integrace"];

const PRODUCTS_EN: Product[] = [
  { key: "weby", tag: "Websites", title: "Business websites", perex: "100+ pro templates for every industry. Run any of them as a one-page or a full multi-page site — you choose.", meta: "100+ templates · one-page or multi-page", image: "/templates/hotel-01/preview.webp" },
  { key: "eshop", tag: "E-shop", title: "Custom e-shops", perex: "20 professional store templates. Payments, stock, shipping, and invoices are all included.", meta: "20 templates · all in one", image: "/templates/eshop-08/preview.webp" },
];

const STUDIO_CAPS_EN = ["Bespoke websites", "Custom e-commerce", "Web apps & SaaS", "AI & automation", "Booking systems", "Mobile & PWA", "API & integrations"];

const COPY = {
  cs: {
    hero: {
      eyebrow: "Produkty a řešení",
      badge: "Udělejte si to sami — nebo to necháte na nás",
      titleA: "Umíme postavit",
      titleEm: "úplně cokoliv.",
      sub: "Web, e-shop, nebo web od AI. Postavte si to sami na platformě Webero, nebo nám zadejte prémiový projekt na míru. Vše pod jednou střechou.",
      ctaPrimary: "Spustit zdarma",
      ctaSecondary: "Nezávazně poptat projekt",
    },
    products: { eyebrow: "Platforma", title: "Tři produkty. Jedna střecha.", sub: "Jeden účet, jedna cena, jedno rozhraní.", cta: "Prozkoumat" },
    features: { eyebrow: "Vše v jedné platformě", title: "Jeden účet. A v něm úplně všechno.", sub: "Přes 30 funkcí zabudovaných napřímo — žádné pluginy, žádné příplatky. Ať už si stavíte sami, nebo to necháte na nás.", cta: "Prohlédnout všechny funkce" },
    ai: {
      badge: "Produkt 03 · Webero AI Builder",
      titleA: "Popište firmu.",
      titleEm: "Web se postaví sám.",
      sub: "Napište, co děláte — a AI Builder složí kompletní web: stránky, sekce, texty i obrázky. Vše hned upravíte v živém editoru.",
      prompt: "Jsme rodinná kavárna v centru Brna. Chceme moderní web s menu, fotkami a rezervací stolu.",
      steps: ["Rozumím zadání", "Skládám 8 sekcí", "Generuji texty a fotky", "Web je připravený"],
      cta: "Vyzkoušet AI Builder",
    },
    studio: {
      eyebrow: "Nebo to necháte na nás",
      titleA: "Za hranicí šablon.",
      titleEm: "Když to běží v prohlížeči, postavíme to.",
      sub: "Potřebujete něco, co žádná šablona neumí? Stavíme prémiové weby, e-shopy a aplikace na míru — bez stropu složitosti.",
      cta: "Probrat váš projekt",
    },
    stats: [
      { v: "100+", l: "šablon webů" },
      { v: "20", l: "šablon e-shopů" },
      { v: "14 dní", l: "zdarma, bez karty" },
      { v: "∞", l: "rozsah na míru" },
    ],
    finalCta: {
      titleA: "Začněte zdarma,",
      titleEm: "nebo začněte projekt.",
      sub: "14 dní zdarma, bez karty a bez závazku. Nebo nám napište, co potřebujete postavit — ozveme se do 24 hodin.",
      primary: "Spustit zdarma",
      secondary: "Poptat na míru",
      pricing: "Ceník",
    },
  },
  en: {
    hero: {
      eyebrow: "Products & solutions",
      badge: "Do it yourself — or leave it to us",
      titleA: "We can build",
      titleEm: "absolutely anything.",
      sub: "A website, an e-shop, or a site built by AI. Build it yourself on the Webero platform, or hand us a premium custom project. All under one roof.",
      ctaPrimary: "Start for free",
      ctaSecondary: "Discuss a project",
    },
    products: { eyebrow: "The platform", title: "Three products. One roof.", sub: "One account, one price, one interface.", cta: "Explore" },
    features: { eyebrow: "Everything in one platform", title: "One account. Everything in it.", sub: "30+ features built right in — no plugins, no add-on fees. Whether you build it yourself or leave it to us.", cta: "See all features" },
    ai: {
      badge: "Product 03 · Webero AI Builder",
      titleA: "Describe your business.",
      titleEm: "The site builds itself.",
      sub: "Type what you do — and the AI Builder assembles a full website: pages, sections, copy, and images. Tweak everything instantly in the live editor.",
      prompt: "We're a family café in the city center. We want a modern site with a menu, photos, and table booking.",
      steps: ["Understanding the brief", "Assembling 8 sections", "Generating copy & photos", "Your site is ready"],
      cta: "Try the AI Builder",
    },
    studio: {
      eyebrow: "Or leave it to us",
      titleA: "Beyond templates.",
      titleEm: "If it runs in a browser, we build it.",
      sub: "Need something no template can do? We build premium bespoke websites, shops, and apps — no ceiling on complexity.",
      cta: "Talk about your project",
    },
    stats: [
      { v: "100+", l: "website templates" },
      { v: "20", l: "e-shop templates" },
      { v: "14 days", l: "free, no card" },
      { v: "∞", l: "custom scope" },
    ],
    finalCta: {
      titleA: "Start for free,",
      titleEm: "or start a project.",
      sub: "14 days free, no card and no commitment. Or just tell us what you need built — we reply within 24 hours.",
      primary: "Start for free",
      secondary: "Request custom work",
      pricing: "Pricing",
    },
  },
} as const;

export function ProductsPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const c = COPY[locale];
  const products = locale === "en" ? PRODUCTS_EN : PRODUCTS_CS;
  const studioCaps = locale === "en" ? STUDIO_CAPS_EN : STUDIO_CAPS_CS;
  const featureGroups = locale === "en" ? FEATURE_GROUPS_EN : FEATURE_GROUPS_CS;
  const contactHref = platformPath("/kontakt", locale);
  const featuresHref = platformPath("/prehled-funkci", locale);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#0a0a0a]">
      <style>{`
        @keyframes webero-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes webero-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes webero-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        @keyframes webero-bounce { 0%,100% { transform: translateY(0); opacity: .55; } 50% { transform: translateY(6px); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { *[style*="webero-"] { animation: none !important; } }
      `}</style>

      <PlatformHeader forceSolid locale={locale} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#151633] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.5]"
             style={{ background: "radial-gradient(60% 55% at 50% -5%, rgba(99,102,241,0.42), transparent 62%), radial-gradient(45% 45% at 88% 8%, rgba(139,92,246,0.30), transparent 60%)" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
             style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(70% 60% at 50% 20%, #000, transparent 80%)", WebkitMaskImage: "radial-gradient(70% 60% at 50% 20%, #000, transparent 80%)" }} />

        <div className="relative mx-auto max-w-[1180px] px-6 pt-[132px] pb-16 lg:px-10 lg:pt-[168px] lg:pb-24">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm"
               style={{ animation: "webero-rise .6s ease both" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#818cf8]" style={{ animation: "webero-pulse 2s ease-in-out infinite" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6366f1]" />
            </span>
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/70">{c.hero.badge}</span>
          </div>

          <p className="mt-9 text-[12px] font-semibold uppercase text-[#a5b4fc]" style={{ letterSpacing: "0.22em", animation: "webero-rise .6s ease .05s both" }}>
            {c.hero.eyebrow}
          </p>

          <h1 className="mt-5 max-w-[16ch] font-sans font-semibold tracking-[-0.035em] text-white"
              style={{ fontSize: "clamp(46px, 7.4vw, 108px)", lineHeight: "0.96", animation: "webero-rise .7s ease .1s both" }}>
            {c.hero.titleA}{" "}
            <span className="italic" style={{ fontFamily: SERIF, fontWeight: 400, color: "#c7d2fe" }}>
              {c.hero.titleEm}
            </span>
          </h1>

          <p className="mt-8 max-w-[600px] text-[17px] leading-[1.62] text-white/70 lg:text-[18.5px]"
             style={{ animation: "webero-rise .7s ease .18s both" }}>
            {c.hero.sub}
          </p>

          <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animation: "webero-rise .7s ease .26s both" }}>
            <Link href={platformPath("/vybrat-design", locale)}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              {c.hero.ctaPrimary}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href={contactHref}
               className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[15px] font-semibold text-white transition hover:border-white/45 hover:bg-white/5">
              {c.hero.ctaSecondary}
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* scroll-down indicator */}
        <a href="#produkty" aria-label="Scroll" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition hover:text-white/80 lg:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Scroll</span>
          <ChevronDown size={18} style={{ animation: "webero-bounce 1.8s ease-in-out infinite" }} />
        </a>
      </section>

      {/* ── PRODUCTS 01–02 (Websites + E-shops) ──────────────────────────── */}
      <section id="produkty" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-[1180px] px-6 pt-20 lg:px-10 lg:pt-28">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-[560px]">
              <p className="mb-4 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.2em" }}>{c.products.eyebrow}</p>
              <h2 className="font-sans font-semibold tracking-[-0.03em]" style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: "1.04" }}>{c.products.title}</h2>
            </div>
            <p className="text-[15.5px] leading-[1.5] text-[#4b5563] sm:pb-2">{c.products.sub}</p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6">
            {products.map((p, i) => (
              <Link key={p.key} href={platformPath("/vybrat-design", locale)}
                    className="group flex flex-col overflow-hidden rounded-[24px] border border-[#ececec] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#0a0a0a]/15 hover:shadow-[0_28px_56px_-28px_rgba(0,0,0,0.22)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0a]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]" loading="lazy" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#0a0a0a] backdrop-blur">{p.tag}</span>
                  <span className="absolute right-4 top-4 text-[13px] font-bold tabular-nums text-white/75">0{i + 1}</span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-[23px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">{p.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-[1.55] text-[#4b5563]">{p.perex}</p>
                  <div className="mt-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
                    {p.meta}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#6366f1] transition group-hover:text-[#4338ca]">
                    {c.products.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT 03 — AI BUILDER SPOTLIGHT ────────────────────────────── */}
      <section className="relative mt-20 overflow-hidden bg-[#151633] text-white lg:mt-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.55]"
             style={{ background: "radial-gradient(48% 50% at 78% 30%, rgba(139,92,246,0.34), transparent 62%), radial-gradient(42% 46% at 12% 78%, rgba(99,102,241,0.30), transparent 60%)" }} />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-32">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5">
              <Sparkles size={13} className="text-[#c4b5fd]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">{c.ai.badge}</span>
            </div>
            <h2 className="mt-7 font-sans font-semibold tracking-[-0.03em] text-white" style={{ fontSize: "clamp(32px, 4.2vw, 58px)", lineHeight: "1.02" }}>
              {c.ai.titleA}<br />
              <span className="italic" style={{ fontFamily: SERIF, fontWeight: 400, color: "#ddd6fe" }}>{c.ai.titleEm}</span>
            </h2>
            <p className="mt-7 max-w-[500px] text-[16.5px] leading-[1.6] text-white/70">{c.ai.sub}</p>
            <Link href={platformPath("/vybrat-design", locale)}
                  className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              {c.ai.cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="relative" style={{ animation: "webero-float 7s ease-in-out infinite" }}>
            <div className="rounded-[22px] border border-white/12 bg-[#0d0d10]/90 p-3 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="flex items-center gap-1.5 px-2.5 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 truncate text-[11px] text-white/45">webero.co · AI Builder</span>
              </div>
              <div className="rounded-[16px] bg-[#0a0a0a] p-4">
                <div className="ml-auto max-w-[86%] rounded-2xl rounded-tr-sm bg-[#6366f1] px-4 py-3 text-[13px] leading-[1.5] text-white">
                  {c.ai.prompt}
                </div>
                <div className="mt-4 space-y-2.5">
                  {c.ai.steps.map((s, i) => {
                    const done = i < c.ai.steps.length - 1;
                    return (
                      <div key={s} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
                        <span className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full ${done ? "bg-[#22c55e]/20 text-[#4ade80]" : "bg-[#6366f1]/25 text-[#a5b4fc]"}`}>
                          {done ? <Check size={11} strokeWidth={3} /> : <Sparkles size={11} />}
                        </span>
                        <span className="text-[12.5px] text-white/85">{s}</span>
                        {!done && <span className="ml-auto flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/50" style={{ animation: "webero-pulse 1.2s ease-in-out infinite" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-white/50" style={{ animation: "webero-pulse 1.2s ease-in-out .2s infinite" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-white/50" style={{ animation: "webero-pulse 1.2s ease-in-out .4s infinite" }} />
                        </span>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <div className="flex h-8 items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3">
                    <span className="h-2 w-14 rounded-full bg-white/15" />
                    <span className="h-2 w-10 rounded-full bg-white/10" />
                    <span className="ml-auto h-4 w-12 rounded-md bg-[#6366f1]/50" />
                  </div>
                  <div className="space-y-2.5 bg-gradient-to-b from-white/[0.04] to-transparent p-4">
                    <span className="block h-3 w-2/3 rounded-full bg-white/15" />
                    <span className="block h-2 w-1/2 rounded-full bg-white/10" />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <span className="h-12 rounded-lg bg-white/8" />
                      <span className="h-12 rounded-lg bg-white/8" />
                      <span className="h-12 rounded-lg bg-white/8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVERYTHING INCLUDED — unified feature set ────────────────────── */}
      <section className="border-y border-[#ececec] bg-[#fafafa]">
        <div className="mx-auto max-w-[1180px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-[640px]">
              <p className="mb-4 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.2em" }}>{c.features.eyebrow}</p>
              <h2 className="font-sans font-semibold tracking-[-0.03em] text-[#0a0a0a]" style={{ fontSize: "clamp(28px, 3.8vw, 50px)", lineHeight: "1.05" }}>{c.features.title}</h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-[#4b5563]">{c.features.sub}</p>
            </div>
            <Link href={featuresHref} className="group inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-[#0a0a0a] px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] transition hover:bg-[#0a0a0a] hover:text-white">
              {c.features.cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[24px] border border-[#ececec] bg-[#ececec] sm:grid-cols-2 lg:grid-cols-3">
            {featureGroups.map((g) => (
              <div key={g.title} className="bg-white p-7">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#6366f1]">{g.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {g.items.map((it) => (
                    <li key={it} className="flex items-center gap-2.5 text-[14.5px] text-[#0a0a0a]">
                      <span className="grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-[#22c55e]/12 text-[#15803d]">
                        <Check size={10} strokeWidth={3.2} />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOM STUDIO — "or we do it for you" ────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-32">
          <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.2em" }}>{c.studio.eyebrow}</p>
          <h2 className="mx-auto max-w-[18ch] font-sans font-semibold tracking-[-0.03em] text-[#0a0a0a]" style={{ fontSize: "clamp(32px, 4.6vw, 60px)", lineHeight: "1.03" }}>
            {c.studio.titleA}{" "}
            <span className="italic text-[#6366f1]" style={{ fontFamily: SERIF, fontWeight: 400 }}>{c.studio.titleEm}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] text-[16.5px] leading-[1.6] text-[#4b5563]">{c.studio.sub}</p>

          <div className="mx-auto mt-10 flex max-w-[780px] flex-wrap justify-center gap-2.5">
            {studioCaps.map((cap) => (
              <span key={cap} className="rounded-full border border-[#e5e7eb] bg-[#fafafa] py-2 text-[14px] font-medium text-[#0a0a0a]" style={{ paddingLeft: 18, paddingRight: 18 }}>
                {cap}
              </span>
            ))}
          </div>

          <Link href={contactHref} className="group mt-11 inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-8 py-4 text-[15px] font-semibold text-white transition hover:bg-[#0a0a0a]/85">
            {c.studio.cta} <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────────── */}
      <section className="border-y border-[#ececec] bg-[#fafafa]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 divide-x divide-[#ececec] px-6 lg:grid-cols-4 lg:px-10">
          {c.stats.map((s) => (
            <div key={s.l} className="px-4 py-11 text-center lg:py-14">
              <div className="font-sans font-semibold tracking-[-0.04em] text-[#0a0a0a]" style={{ fontSize: "clamp(36px, 4.2vw, 56px)", lineHeight: "1" }}>{s.v}</div>
              <div className="mt-2.5 text-[12.5px] font-medium uppercase tracking-[0.12em] text-[#6b7280]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#151633] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60"
             style={{ background: "radial-gradient(50% 60% at 50% 100%, rgba(99,102,241,0.4), transparent 62%)" }} />
        <div className="relative mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-36">
          <h2 className="mx-auto max-w-[820px] font-sans font-semibold tracking-[-0.03em] text-white" style={{ fontSize: "clamp(34px, 4.6vw, 64px)", lineHeight: "1.02" }}>
            {c.finalCta.titleA}<br />
            <span className="italic" style={{ fontFamily: SERIF, fontWeight: 400, color: "#c7d2fe" }}>{c.finalCta.titleEm}</span>
          </h2>
          <p className="mx-auto mt-7 max-w-[540px] text-[16px] leading-[1.6] text-white/70">{c.finalCta.sub}</p>
          <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={platformPath("/vybrat-design", locale)} className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              {c.finalCta.primary} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href={contactHref} className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-[15px] font-semibold text-white transition hover:border-white/45 hover:bg-white/5">
              {c.finalCta.secondary} <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="mt-8">
            <Link href={platformPath("/cenik", locale)} className="text-[13.5px] font-medium text-white/55 underline-offset-4 transition hover:text-white/85 hover:underline">
              {c.finalCta.pricing}
            </Link>
          </div>
        </div>
      </section>

      <PlatformFooter locale={locale} />
    </main>
  );
}

export default function ProductsPage() {
  return <ProductsPageContent locale="cs" />;
}
