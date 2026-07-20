import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { platformPath } from "@/lib/platform-i18n";

export const metadata: Metadata = {
  title: "Ceník — Webero",
  description:
    "Transparentní ceník bez skrytých poplatků. Weby od 500 Kč/měsíc, e-shopy od 890 Kč/měsíc, úpravy na míru. 14 dní zdarma, bez platební karty.",
};

interface Plan {
  key: string;
  badge?: string;
  name: string;
  tagline: string;
  price: string;
  priceSuffix: string;
  priceNote: string;
  cta: string;
  ctaHref: string;
  highlight?: boolean;
  bullets: string[];
}

const PLANS: Plan[] = [
  {
    key: "weby",
    name: "Weby",
    tagline: "Prezentační web na úrovni těch nejlepších. Pro firmy, řemeslníky a služby.",
    price: "500",
    priceSuffix: "Kč / měsíc",
    priceNote: "bez DPH · za 1 web · bez závazku",
    cta: "Začít 14 dní zdarma",
    ctaHref: "/vybrat-design",
    highlight: true,
    bullets: [
      "100+ profi šablon pro každý obor",
      "Live editor — úpravy přímo na stránce",
      "Podstránky, galerie a kontaktní formuláře",
      "Vlastní doména a SSL v ceně",
      "EU hosting s PageSpeed 90+",
      "SEO, sitemap a strukturovaná data",
      "GDPR cookie lišta v ceně",
      "Česká podpora, která odpovídá",
    ],
  },
  {
    key: "eshopy",
    badge: "0 % provize z prodeje",
    name: "E-shopy",
    tagline: "Plnohodnotný e-shop bez transakční provize. Prodávejte první den.",
    price: "890",
    priceSuffix: "Kč / měsíc",
    priceNote: "bez DPH · vše z plánu Weby v ceně",
    cta: "Vyzkoušet e-shop zdarma",
    ctaHref: "/vybrat-design",
    bullets: [
      "Vše z plánu Weby",
      "Katalog produktů, varianty a sklad",
      "Košík a pokladna laděné na konverze",
      "Platby kartou, Apple Pay a Google Pay",
      "Doprava: Zásilkovna, DPD, osobní odběr",
      "Slevové kódy a akční ceny",
      "Faktury v PDF a přehled objednávek",
      "Žádná provize z vašich prodejů",
    ],
  },
  {
    key: "custom",
    badge: "Designéři a vývojáři Webera",
    name: "Custom úpravy",
    tagline: "Šablona je start, ne strop. Upravíme design i funkce přesně podle vás.",
    price: "Na míru",
    priceSuffix: "",
    priceNote: "individuální nabídka podle rozsahu",
    cta: "Domluvit konzultaci",
    ctaHref: "mailto:obchod@webero.co?subject=Custom%20úpravy",
    bullets: [
      "Úprava šablony na míru vaší značce",
      "Vlastní sekce a funkce navíc",
      "Napojení na rezervace, CRM či feedy",
      "Migrace obsahu ze starého webu",
      "Texty a grafika od našich designérů",
      "Multi-tenant správa pro agentury",
      "Přednostní podpora",
    ],
  },
];

const PLANS_EN: Plan[] = [
  {
    key: "weby",
    name: "Websites",
    tagline: "A presentation website on par with the best. For businesses, trades, and services.",
    price: "500",
    priceSuffix: "CZK / month",
    priceNote: "excl. VAT · per website · no commitment",
    cta: "Start 14 days free",
    ctaHref: "/vybrat-design",
    highlight: true,
    bullets: [
      "100+ professional templates for every industry",
      "Live editor — edit directly on the page",
      "Subpages, galleries, and contact forms",
      "Custom domain and SSL included",
      "EU hosting with PageSpeed 90+",
      "SEO, sitemap, and structured data",
      "GDPR cookie banner included",
      "Human support that actually replies",
    ],
  },
  {
    key: "eshopy",
    badge: "0% sales commission",
    name: "E-shops",
    tagline: "A full e-shop without transaction commission. Start selling on day one.",
    price: "890",
    priceSuffix: "CZK / month",
    priceNote: "excl. VAT · everything in Websites included",
    cta: "Try an e-shop for free",
    ctaHref: "/vybrat-design",
    bullets: [
      "Everything in the Websites plan",
      "Product catalog, variants, and stock",
      "Cart and checkout tuned for conversion",
      "Card payments, Apple Pay, and Google Pay",
      "Shipping carriers and personal pickup",
      "Discount codes and sale prices",
      "PDF invoices and order overview",
      "No commission on your sales",
    ],
  },
  {
    key: "custom",
    badge: "Webero designers & developers",
    name: "Custom work",
    tagline: "A template is the start, not the ceiling. We tailor design and features to you.",
    price: "Custom",
    priceSuffix: "",
    priceNote: "individual offer based on scope",
    cta: "Book a consultation",
    ctaHref: "mailto:obchod@webero.co?subject=Custom%20work",
    bullets: [
      "Template tailored to your brand",
      "Custom sections and extra features",
      "Integrations: bookings, CRM, or feeds",
      "Content migration from your old website",
      "Copy and graphics by our designers",
      "Multi-tenant management for agencies",
      "Priority support",
    ],
  },
];

const ADDONS = [
  {
    name: "Rezora — rezervace online",
    price: "+200 Kč / měs",
    desc: "Rezervační systém s kalendářem pro tým, online platbami a SMS notifikacemi. Pro barbery, kliniky i autoškoly.",
  },
  {
    name: "Chytré vyhledávání",
    price: "+300 Kč / měs",
    desc: "Našeptávač s tolerancí překlepů a okamžitými výsledky. Zákazníci najdou produkt dřív, než dopíšou název.",
  },
  {
    name: "Vlastní kód",
    price: "v ceně",
    desc: "Vložte vlastní CSS, JavaScript nebo měřicí kódy. Analytika, chat widget či pixel bez čekání na nás.",
  },
  {
    name: "Vícenásobný web",
    price: "−30 % od 2. webu",
    desc: "Sleva 30 % pro každý další web na stejném účtu. Ideální pro agentury, řetězce a multi-brand firmy.",
  },
];

const ADDONS_EN = [
  { name: "Rezora — online bookings", price: "+200 CZK / month", desc: "Booking system with a team calendar, online payments, and SMS notifications. For barbers, clinics, and driving schools." },
  { name: "Smart search", price: "+300 CZK / month", desc: "Typo-tolerant autocomplete with instant results. Customers find the product before they finish typing." },
  { name: "Custom code", price: "included", desc: "Insert your own CSS, JavaScript, or tracking codes. Analytics, chat widget, or pixel without waiting for us." },
  { name: "Multiple websites", price: "-30% from the 2nd site", desc: "30% discount for every additional website on the same account. Ideal for agencies, chains, and multi-brand companies." },
];

const FAQ = [
  { q: "Co se stane po 14 dnech zkušebního období?",
    a: "Nic — pokud aktivně nezadáte platební údaje. Žádné automatické strhávání. Pokud chcete pokračovat, vyberete si plán a vše běží dál. Pokud ne, web zůstane v archivu 30 dní pro případ, že byste si to rozmysleli." },
  { q: "Jsou transakce v e-shopu zpoplatněné?",
    a: "Od nás ne, neúčtujeme si žádné procento z prodeje. Platí jen běžné poplatky platební brány (např. Stripe 1,4 % + 6 Kč u EU karet)." },
  { q: "Jak fungují Custom úpravy?",
    a: "Napíšete nám, co potřebujete — úpravu designu, novou funkci nebo napojení na externí systém. Do 2 pracovních dnů dostanete konkrétní nabídku s cenou a termínem. Platíte jednorázově za úpravu, měsíční tarif se nemění." },
  { q: "Můžu kdykoliv přejít z plánu na plán?",
    a: "Ano, oboustranně. Upgrade z Webů na E-shopy je okamžitý. Downgrade platí od konce aktuálního období. Bez sankcí." },
  { q: "Můžu si stáhnout obsah, kdybych skončil?",
    a: "Ano. Plný export obsahu (texty, obrázky, struktura) ve standardních formátech kdykoliv. Doména je vždy vaše — nikdy ji nedržíme." },
  { q: "Co když potřebuju více webů?",
    a: "Každý další web na stejném účtu má 30 % slevu. Pro agentury a multi-brand firmy nabízíme multi-tenant správu v rámci Custom úprav." },
  { q: "Patří mi obsah a doména?",
    a: "Plně. Veškerý obsah a doména jsou vždy vaše. Webero je nájem za platformu, ne za vlastnictví. Bez vendor lock-inu." },
  { q: "Můžu Webero používat jen na 1 měsíc?",
    a: "Ano. Plán je měsíční, zrušíte kdykoliv jedním klikem. Žádné minimální období, žádné storno poplatky." },
];

const FAQ_EN = [
  { q: "What happens after the 14-day trial?", a: "Nothing unless you actively add payment details. There are no automatic charges. If you want to continue, choose a plan and everything keeps running. If not, your site stays archived for 30 days in case you change your mind." },
  { q: "Are e-shop transactions charged by Webero?", a: "No. We do not take a percentage from sales. You only pay the standard payment gateway fees (e.g. Stripe 1.4% + 6 CZK for EU cards)." },
  { q: "How does custom work operate?", a: "Tell us what you need — a design tweak, a new feature, or an integration. Within 2 business days you get a concrete offer with price and timeline. You pay once for the work; your monthly plan stays the same." },
  { q: "Can I switch plans later?", a: "Yes, both ways. Upgrading from Websites to E-shops is immediate. Downgrades apply at the end of the current period. No penalties." },
  { q: "Can I export my content if I leave?", a: "Yes. You can export your content, images, and structure in standard formats at any time. The domain is always yours." },
  { q: "What if I need more websites?", a: "Every additional website on the same account gets a 30% discount. For agencies and multi-brand companies we offer multi-tenant management as part of custom work." },
  { q: "Do I own my content and domain?", a: "Fully. Your content and domain are yours. Webero is a platform subscription, not ownership lock-in." },
  { q: "Can I use Webero for only one month?", a: "Yes. Plans are monthly and you can cancel anytime in one click. No minimum period, no cancellation fees." },
];

const PRICING_COPY = {
  cs: {
    eyebrow: "Ceník",
    title: "Transparentní cena.",
    muted: "Žádná překvapení.",
    intro: "Web, e-shop, nebo úpravy na míru. Upgradujete kdykoli, bez sankcí. 14 dní zdarma, bez platební karty.",
    strip: "Bez závazku · Bez platební karty · Zrušíte kdykoli",
    popular: "Nejoblíbenější",
    addons: "Volitelné doplňky",
    addonsTitle: "Když potřebujete víc.",
    addonsText: "Specifické moduly aktivujete kdykoliv jedním klikem. Zaplatíte jen za to, co opravdu využíváte.",
    trust: [
      { t: "Bez závazku", d: "Zrušíte kdykoli jedním klikem" },
      { t: "EU hosting", d: "Praha, Frankfurt, Amsterdam" },
      { t: "0 % provize", d: "Z prodejů si nebereme nic" },
      { t: "Česká podpora", d: "Pracovní dny 9:00–17:00, lidsky" },
    ],
    faqEyebrow: "Časté dotazy",
    faqTitle: "Než položíte další otázku.",
    finalTitle: "Spustit web za 5 minut.",
    finalMuted: "Platit budete za 14 dní.",
    finalText: "Bez platební karty. Bez automatického strhávání. Pokud Webero nepřesvědčí, prostě skončíte.",
    chooseDesign: "Vybrat design",
    features: "Přehled funkcí",
  },
  en: {
    eyebrow: "Pricing",
    title: "Transparent pricing.",
    muted: "No surprises.",
    intro: "A website, an e-shop, or custom work. Upgrade anytime without penalties. 14 days free, no credit card required.",
    strip: "No commitment · No credit card · Cancel anytime",
    popular: "Most popular",
    addons: "Optional add-ons",
    addonsTitle: "When you need more.",
    addonsText: "Activate specific modules anytime in one click. Pay only for what you actually use.",
    trust: [
      { t: "No commitment", d: "Cancel anytime in one click" },
      { t: "EU hosting", d: "Prague, Frankfurt, Amsterdam" },
      { t: "0% commission", d: "We take nothing from your sales" },
      { t: "Human support", d: "Business days 9:00–17:00" },
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Before you ask another question.",
    finalTitle: "Launch a site in 5 minutes.",
    finalMuted: "Pay after 14 days.",
    finalText: "No credit card. No automatic charging. If Webero does not convince you, simply stop.",
    chooseDesign: "Choose a design",
    features: "Features",
  },
} as const;

export function PricingPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const copy = PRICING_COPY[locale];
  const plans = locale === "en" ? PLANS_EN : PLANS;
  const addons = locale === "en" ? ADDONS_EN : ADDONS;
  const faq = locale === "en" ? FAQ_EN : FAQ;

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <PlatformHeader forceSolid locale={locale} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white pt-[120px] lg:pt-[140px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
             style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.12), transparent 70%)" }} />
        <div className="relative mx-auto max-w-[1180px] px-6 pb-16 text-center lg:px-10 lg:pb-20">
          <p className="mb-4 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.16em" }}>
            {copy.eyebrow}
          </p>
          <h1 className="mx-auto max-w-[900px] font-sans font-semibold tracking-[-0.03em]"
              style={{ fontSize: "clamp(40px, 5.5vw, 78px)", lineHeight: "1.02" }}>
            {copy.title}<br />
            <span className="text-[#9ca3af]">{copy.muted}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[17px] leading-[1.6] text-[#4b5563]">
            {copy.intro}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-[12.5px] font-medium text-[#374151]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            {copy.strip}
          </div>
        </div>
      </section>

      {/* Plans — 3 cards */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-6 pb-20 lg:px-10 lg:pb-28">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-7">
            {plans.map((p) => {
              const isDark = p.highlight;
              return (
                <div
                  key={p.key}
                  className={
                    isDark
                      ? "relative flex flex-col overflow-hidden rounded-3xl bg-[#0a0a0a] p-8 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.30)] lg:p-10"
                      : "relative flex flex-col overflow-hidden rounded-3xl border border-[#ececec] bg-white p-8 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.16)] lg:p-10"
                  }
                >
                  {isDark && (
                    <div className="pointer-events-none absolute -right-12 -top-12 h-[280px] w-[280px] rounded-full"
                         style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.40), transparent)" }} />
                  )}

                  <div className="relative flex min-h-[26px] items-center gap-2">
                    {p.highlight && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                        {copy.popular}
                      </span>
                    )}
                    {p.badge && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6366f1]/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#4338ca]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <h2 className={`relative mt-6 font-sans font-semibold tracking-[-0.02em] ${isDark ? "text-white" : "text-[#0a0a0a]"}`}
                      style={{ fontSize: "clamp(26px, 2.8vw, 34px)", lineHeight: "1.1" }}>
                    {p.name}
                  </h2>
                  <p className={`relative mt-3 text-[14.5px] leading-[1.55] ${isDark ? "text-white/70" : "text-[#6b7280]"}`}>
                    {p.tagline}
                  </p>

                  <div className="relative mt-8">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-sans font-semibold tracking-[-0.03em] ${isDark ? "text-white" : "text-[#0a0a0a]"}`}
                            style={{ fontSize: "clamp(52px, 6vw, 76px)", lineHeight: "0.95" }}>
                        {p.price}
                      </span>
                      {p.priceSuffix && (
                        <span className={`text-[14px] font-medium ${isDark ? "text-white/55" : "text-[#9ca3af]"}`}>
                          {p.priceSuffix}
                        </span>
                      )}
                    </div>
                    <p className={`mt-2 text-[12.5px] ${isDark ? "text-white/45" : "text-[#9ca3af]"}`}>
                      {p.priceNote}
                    </p>
                  </div>

                  <Link
                    href={p.ctaHref.startsWith("/") ? platformPath(p.ctaHref, locale) : p.ctaHref}
                    className={
                      isDark
                        ? "relative mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] transition hover:bg-white/90"
                        : "relative mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-[#0a0a0a] bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] transition hover:bg-[#0a0a0a] hover:text-white"
                    }
                  >
                    {p.cta} <ArrowRight size={15} />
                  </Link>

                  <ul className={`relative mt-8 space-y-3 border-t ${isDark ? "border-white/10" : "border-[#ececec]"} pt-7`}>
                    {p.bullets.map((b) => (
                      <li key={b} className={`flex items-start gap-3 text-[13.5px] ${isDark ? "text-white/85" : "text-[#1f2937]"}`}>
                        <span className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full ${isDark ? "bg-[#22c55e]/15 text-[#86efac]" : "bg-[#22c55e]/12 text-[#15803d]"}`}>
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="mb-12 max-w-[680px] lg:mb-16">
            <p className="mb-4 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.16em" }}>
              {copy.addons}
            </p>
            <h2 className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: "1.05" }}>
              {copy.addonsTitle}
            </h2>
            <p className="mt-5 max-w-[560px] text-[15.5px] leading-[1.65] text-[#4b5563]">
              {copy.addonsText}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
            {addons.map((a) => (
              <div key={a.name} className="rounded-2xl border border-[#ececec] bg-white p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0a0a0a]/15 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.12)]">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[18px] font-semibold tracking-[-0.015em] text-[#0a0a0a]">{a.name}</h3>
                  <span className="flex-shrink-0 text-[13px] font-semibold text-[#6366f1]">{a.price}</span>
                </div>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#4b5563]">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[#ececec] bg-white">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-7 px-6 py-12 sm:grid-cols-4 lg:gap-x-12 lg:px-10">
          {copy.trust.map((x) => (
            <div key={x.t} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#22c55e]/12 text-[#15803d]">
                  <Check size={11} strokeWidth={3} />
                </span>
                <div className="text-[13.5px] font-semibold text-[#0a0a0a]">{x.t}</div>
              </div>
              <div className="ml-7 text-[12.5px] text-[#6b7280]">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-[860px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="mb-12 text-center lg:mb-16">
            <p className="mb-4 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.16em" }}>
              {copy.faqEyebrow}
            </p>
            <h2 className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: "1.05" }}>
              {copy.faqTitle}
            </h2>
          </div>
          <div className="divide-y divide-[#f1f1f1] overflow-hidden rounded-3xl border border-[#ececec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {faq.map((f) => (
              <details key={f.q} className="group px-6 py-5 sm:px-8">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-[#374151] transition-colors group-open:text-[#0a0a0a] group-hover:text-[#0a0a0a] sm:text-[16px]">{f.q}</h3>
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-[#e5e7eb] text-[#0a0a0a] transition-all duration-300 group-open:rotate-45 group-open:border-[#0a0a0a] group-open:bg-[#0a0a0a] group-open:text-white">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 pr-14 text-[14.5px] leading-[1.7] text-[#555]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 80% at 50% 0%, rgba(99,102,241,0.18), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 py-20 text-center lg:px-10 lg:py-28">
          <h2 className="mx-auto max-w-[760px] font-sans font-semibold tracking-[-0.025em] text-white"
              style={{ fontSize: "clamp(34px, 4.5vw, 60px)", lineHeight: "1.04" }}>
            {copy.finalTitle}<br /><span className="text-[#a5b4fc]">{copy.finalMuted}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] text-white/75">
            {copy.finalText}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={platformPath("/vybrat-design", locale)} className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              {copy.chooseDesign} <ArrowRight size={16} />
            </Link>
            <Link href={platformPath("/prehled-funkci", locale)} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:border-white/40 hover:bg-white/5">
              {copy.features}
            </Link>
          </div>
        </div>
      </section>

      <PlatformFooter locale={locale} />
    </main>
  );
}

export default function PricingPage() {
  return <PricingPageContent locale="cs" />;
}
