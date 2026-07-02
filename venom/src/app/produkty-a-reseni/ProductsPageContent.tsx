import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { platformPath } from "@/lib/platform-i18n";

export const metadata: Metadata = {
  title: "Produkty a řešení — Webero",
  description:
    "Čtyři produkty, jedna platforma. Webové stránky, landing pages, e-shop a content hub na vysokém standardu, bez vývojářů.",
};

const PRODUCTS_CS = [
  {
    key: "weby",
    title: "Webové stránky",
    perex:
      "Plnohodnotná firemní prezentace s desítkami sekcí, blogem, kontaktními formuláři a vícejazyčnou variantou.",
    bullets: [
      "99+ profi šablon pro každý obor",
      "Vlastní doména a SSL v ceně",
      "Editor v reálném čase přímo na stránce",
      "PageSpeed 95+ z výroby",
    ],
    image: "/templates/peak-cut/showcase/desktop-full.png",
  },
  {
    key: "landing",
    title: "Landing pages",
    perex:
      "Jednostránkové weby pro kampaně, sběr leadů a rychlé otestování nápadu. A/B varianty během minut.",
    bullets: [
      "Připraveno na PPC a remarketing",
      "Pixel, GTM a conversion tracking",
      "Formuláře, kvízy, ankety",
      "Vícekrokový check-out",
    ],
    image: "/templates/barber-03/showcase/desktop-full.png",
  },
  {
    key: "eshop",
    title: "E-shop a katalog",
    perex:
      "Prodávejte fyzické i digitální produkty přímo z webu. Stripe, faktury, sklady a doprava — vše v jednom rozhraní.",
    bullets: [
      "Bez měsíčních poplatků za transakce",
      "Propojení se Zásilkovnou a DPD",
      "Slevové kódy a věrnostní program",
      "Sklad propojený s pokladnou",
    ],
    image: "/templates/barber-04/showcase/desktop-full.png",
  },
  {
    key: "hub",
    title: "Content Hub",
    perex:
      "Blog, kurzy, členská sekce. Vytvářejte obsah, nabízejte ho jednorázově nebo formou předplatného.",
    bullets: [
      "Drip režim pro online kurzy",
      "Plné mediální knihovny obsahu",
      "Stripe + opakované platby",
      "Diskuse a komentáře",
    ],
    image: "/templates/peak-cut/showcase/desktop-full.png",
  },
];

const PRODUCTS_EN = [
  {
    key: "weby",
    title: "Business websites",
    perex:
      "A complete company website with dozens of sections, blog, contact forms, and multilingual versions.",
    bullets: [
      "99+ professional templates for every industry",
      "Custom domain and SSL included",
      "Real-time editor directly on the page",
      "PageSpeed 95+ out of the box",
    ],
    image: "/templates/peak-cut/showcase/desktop-full.png",
  },
  {
    key: "landing",
    title: "Landing pages",
    perex:
      "One-page sites for campaigns, lead capture, and fast idea validation. Create A/B variants in minutes.",
    bullets: [
      "Ready for PPC and remarketing",
      "Pixel, GTM, and conversion tracking",
      "Forms, quizzes, surveys",
      "Multi-step checkout",
    ],
    image: "/templates/barber-03/showcase/desktop-full.png",
  },
  {
    key: "eshop",
    title: "E-shop and catalog",
    perex:
      "Sell physical and digital products directly from your website. Stripe, invoices, stock, and shipping in one interface.",
    bullets: [
      "No monthly transaction fees from us",
      "Carrier integrations ready to connect",
      "Discount codes and loyalty program",
      "Stock connected to checkout",
    ],
    image: "/templates/barber-04/showcase/desktop-full.png",
  },
  {
    key: "hub",
    title: "Content hub",
    perex:
      "Blog, courses, and member areas. Create content and sell it once or as a recurring subscription.",
    bullets: [
      "Drip mode for online courses",
      "Full media libraries for content",
      "Stripe and recurring payments",
      "Discussions and comments",
    ],
    image: "/templates/peak-cut/showcase/desktop-full.png",
  },
];

const SOLUTIONS_CS = [
  {
    title: "Více klientů z webu",
    desc: "Zjednodušte cestu návštěvníka, použijte chytré konverzní prvky a sledujte, kolik se vám vrací.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Funkční design",
    desc: "Krásný a hlavně funkční design, který návštěvníky vede k akci. Žádné ozdoby bez účelu.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
      </svg>
    ),
  },
  {
    title: "Vyšší rychlost webu",
    desc: "Patříte mezi 5 % nejrychlejších webů na internetu. Lighthouse 95+ je standard, ne výjimka.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
      </svg>
    ),
  },
  {
    title: "Bezpečnost na úrovni bank",
    desc: "SSL, automatické zálohy, DDoS ochrana a šifrování dat. Bezpečnost klientů bez kompromisů.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 6v6c0 5.5 3.8 10.6 8 11 4.2-.4 8-5.5 8-11V6l-8-4z" />
      </svg>
    ),
  },
  {
    title: "Snadná správa obsahu",
    desc: "Aktualizujete web v reálném čase přímo na stránce. Bez agentur, bez programátorů, bez schvalovaček.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    ),
  },
  {
    title: "Integrace a automatizace",
    desc: "Stripe, Google, Meta, Mailchimp, Webhooks i Zapier. Propojte web s nástroji, které už používáte.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

const SOLUTIONS_EN = [
  { title: "More clients from your site", desc: "Make the visitor journey simpler, use smart conversion elements, and see what brings revenue back.", icon: SOLUTIONS_CS[0]!.icon },
  { title: "Design that works", desc: "Beautiful, but above all functional design that leads visitors toward action. No decoration without a job.", icon: SOLUTIONS_CS[1]!.icon },
  { title: "Higher website speed", desc: "Join the fastest 5% of websites. Lighthouse 95+ is the baseline, not an exception.", icon: SOLUTIONS_CS[2]!.icon },
  { title: "Bank-grade security", desc: "SSL, automatic backups, DDoS protection, and encrypted data. Client security without compromise.", icon: SOLUTIONS_CS[3]!.icon },
  { title: "Easy content management", desc: "Update your website in real time directly on the page. No agencies, no developers, no approval loops.", icon: SOLUTIONS_CS[4]!.icon },
  { title: "Integrations and automation", desc: "Stripe, Google, Meta, Mailchimp, webhooks, and Zapier. Connect your site with tools you already use.", icon: SOLUTIONS_CS[5]!.icon },
];

const COPY = {
  cs: {
    eyebrow: "Produkty a řešení",
    titleA: "Tisíce potřeb.",
    titleB: "Jedno solidní řešení.",
    intro: "Webero přináší 4 produkty pod jednou střechou — abyste si vystačili s jednou platformou, jedním účtem a jednou cenou. Bez pluginů, bez extra modulů.",
    explore: "Prozkoumat šablony",
    principles: "Principy a řešení",
    whatCanDo: "Co všechno Webero zvládne?",
    pillars: "Šest pilířů, na kterých stojí každý web spuštěný na Weberu. Bez ohledu na obor.",
    ctaTitle: "Vyzkoušejte všechny produkty",
    ctaMuted: "14 dní zdarma.",
    ctaText: "Bez platební karty, bez závazku. Po 14 dnech si vyberete plán nebo skončíte — nikdy vám nic nestrhneme.",
    chooseDesign: "Vybrat design",
    pricing: "Ceník",
  },
  en: {
    eyebrow: "Products and solutions",
    titleA: "Thousands of needs.",
    titleB: "One solid solution.",
    intro: "Webero brings 4 products under one roof, so you can run everything from one platform, one account, and one price. No plugins, no extra modules.",
    explore: "Explore templates",
    principles: "Principles and solutions",
    whatCanDo: "What can Webero handle?",
    pillars: "Six pillars behind every website launched on Webero, no matter the industry.",
    ctaTitle: "Try every product",
    ctaMuted: "free for 14 days.",
    ctaText: "No credit card, no commitment. After 14 days, choose a plan or stop. We will never charge you automatically.",
    chooseDesign: "Choose a design",
    pricing: "Pricing",
  },
} as const;

export function ProductsPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const copy = COPY[locale];
  const products = locale === "en" ? PRODUCTS_EN : PRODUCTS_CS;
  const solutions = locale === "en" ? SOLUTIONS_EN : SOLUTIONS_CS;

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <PlatformHeader forceSolid locale={locale} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white pt-[120px] lg:pt-[140px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
             style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.10), transparent 70%)" }} />
        <div className="relative mx-auto max-w-[1180px] px-6 pb-20 lg:px-10 lg:pb-32">
          <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
            {copy.eyebrow}
          </p>
          <h1 className="font-sans font-semibold tracking-[-0.03em]"
              style={{ fontSize: "clamp(40px, 5.5vw, 78px)", lineHeight: "1.02" }}>
            {copy.titleA}<br />
            <span className="text-[#9ca3af]">{copy.titleB}</span>
          </h1>
          <p className="mt-7 max-w-[640px] text-[17px] leading-[1.6] text-[#4b5563]">
            {copy.intro}
          </p>
        </div>
      </section>

      {/* Products — alternating split blocks */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-10 lg:py-32 space-y-24 lg:space-y-32">
          {products.map((p, i) => (
            <article key={p.key} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                    0{i + 1}
                  </span>
                </div>
                <h2 className="font-sans font-semibold tracking-[-0.025em]"
                    style={{ fontSize: "clamp(30px, 3.5vw, 44px)", lineHeight: "1.08" }}>
                  {p.title}
                </h2>
                <p className="mt-5 max-w-[480px] text-[16px] leading-[1.6] text-[#4b5563]">
                  {p.perex}
                </p>
                <ul className="mt-8 space-y-3">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[14.5px] text-[#0a0a0a]">
                      <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#22c55e]/10 text-[#15803d]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href={platformPath("/vybrat-design", locale)} className="mt-9 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#6366f1] transition hover:text-[#4338ca]">
                  {copy.explore} <ArrowRight size={14} />
                </Link>
              </div>

              <div className={`relative overflow-hidden rounded-2xl bg-[#0a0a0a] p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] lg:p-8 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover object-top" loading="lazy" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Solutions grid */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-[1180px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto mb-14 max-w-[760px] text-center lg:mb-20">
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
              {copy.principles}
            </p>
            <h2 className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: "1.05" }}>
              {copy.whatCanDo}
            </h2>
            <p className="mt-5 text-[16px] leading-[1.65] text-[#4b5563]">
              {copy.pillars}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {solutions.map((s) => (
              <div key={s.title} className="rounded-2xl border border-[#ececec] bg-white p-7 transition hover:-translate-y-0.5 hover:border-[#0a0a0a]/20 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.12)]">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#6366f1]/10 text-[#6366f1]">
                  {s.icon}
                </div>
                <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.015em] text-[#0a0a0a]">{s.title}</h3>
                <p className="mt-2.5 text-[14px] leading-[1.6] text-[#4b5563]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-32">
          <h2 className="mx-auto max-w-[720px] font-sans font-semibold tracking-[-0.025em]"
              style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: "1.05" }}>
            {copy.ctaTitle}<br /><span className="text-white/55">{copy.ctaMuted}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[15.5px] leading-[1.65] text-white/65">
            {copy.ctaText}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={platformPath("/vybrat-design", locale)} className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              {copy.chooseDesign} <ArrowRight size={16} />
            </Link>
            <Link href={platformPath("/cenik", locale)} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:border-white/40 hover:bg-white/5">
              {copy.pricing}
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
