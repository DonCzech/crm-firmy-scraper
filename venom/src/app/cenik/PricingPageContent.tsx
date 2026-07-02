import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check, X } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { platformPath } from "@/lib/platform-i18n";

export const metadata: Metadata = {
  title: "Ceník — Webero",
  description:
    "Transparentní ceník bez skrytých poplatků. Standard od 500 Kč/měsíc, E-shop od 890 Kč/měsíc. 14 dní zdarma, bez platební karty.",
};

interface Plan {
  key: string;
  badge?: string;
  badgeTone?: "muted" | "accent";
  name: string;
  tagline: string;
  price: string;
  priceSuffix: string;
  priceNote: string;
  cta: string;
  ctaHref: string;
  highlight?: boolean;
  comingSoon?: boolean;
  bullets: string[];
}

const PLANS: Plan[] = [
  {
    key: "standard",
    name: "Standard",
    tagline: "Web na úrovni těch nejlepších. Pro firmy, řemeslníky, služby.",
    price: "500",
    priceSuffix: "Kč / měsíc",
    priceNote: "bez DPH · za 1 web · bez závazku",
    cta: "Začít 14 dní zdarma",
    ctaHref: "/vybrat-design",
    highlight: true,
    bullets: [
      "99+ profi šablon pro každý obor",
      "Live editor v reálném čase",
      "Vlastní doména a SSL v ceně",
      "PageSpeed 95+ z výroby",
      "SEO meta + JSON-LD schema",
      "Multi-jazykové varianty",
      "Newsletter & lead capture",
      "GDPR cookie banner",
      "Česká podpora 7 dní v týdnu",
    ],
  },
  {
    key: "eshop",
    badge: "Brzy",
    badgeTone: "accent",
    name: "E-shop",
    tagline: "Plnohodnotný e-shop bez transakční provize. Pro online prodej.",
    price: "890",
    priceSuffix: "Kč / měsíc",
    priceNote: "vše ze Standardu + e-shop modul",
    cta: "Předregistrovat se",
    ctaHref: "mailto:hello@webero.co?subject=Předregistrace%20E-shop%20plánu",
    comingSoon: true,
    bullets: [
      "Vše ze Standardu",
      "Stripe, PayPal, GoPay v ceně",
      "Apple Pay & Google Pay",
      "Sklad, varianty, slevové kódy",
      "PDF faktury + číselné řady",
      "Zásilkovna a DPD na klik",
      "Předplatné a opakované platby",
      "Bez naší transakční provize",
      "Export pro POHODA a Money S3",
    ],
  },
  {
    key: "custom",
    badge: "Pro agentury & enterprise",
    badgeTone: "muted",
    name: "Custom",
    tagline: "Unikátní design, dedikovaná péče, multi-tenant pro agentury.",
    price: "Na míru",
    priceSuffix: "",
    priceNote: "individuální nabídka podle rozsahu",
    cta: "Domluvit schůzku",
    ctaHref: "mailto:obchod@webero.co?subject=Custom%20plán",
    bullets: [
      "Unikátní design šitý na míru",
      "Multi-tenant pro 10+ webů",
      "Dedikovaný account manager",
      "SLA 99,99% s garancí náhrady",
      "Migrace z předchozího řešení",
      "SSO (SAML, Google Workspace)",
      "Onboarding tým + školení",
      "Prioritní pipeline pro feature requests",
      "Vlastní právní rámec & NDA",
    ],
  },
];

interface CompareSection {
  category: string;
  rows: { label: string; standard: string | true | false; eshop: string | true | false; custom: string | true | false }[];
}

const COMPARE: CompareSection[] = [
  {
    category: "Editor a obsah",
    rows: [
      { label: "Live editor v reálném čase",         standard: true,  eshop: true,  custom: true },
      { label: "Počet šablon",                        standard: "99+", eshop: "99+", custom: "99+ vlastní" },
      { label: "Historie a verzování",                standard: true,  eshop: true,  custom: true },
      { label: "Tým a role",                          standard: "až 3",eshop: "až 10", custom: "neomezeně" },
      { label: "Multi-jazyk",                         standard: true,  eshop: true,  custom: true },
      { label: "AI asistent pro obsah",               standard: "100K tokenů", eshop: "500K tokenů", custom: "neomezeně" },
    ],
  },
  {
    category: "E-commerce",
    rows: [
      { label: "Stripe a PayPal",                     standard: false, eshop: true,  custom: true },
      { label: "Sklad a varianty",                    standard: false, eshop: true,  custom: true },
      { label: "Apple Pay / Google Pay",              standard: false, eshop: true,  custom: true },
      { label: "Předplatné a opakované platby",       standard: false, eshop: true,  custom: true },
      { label: "PDF faktury (POHODA, Money S3)",      standard: false, eshop: true,  custom: true },
      { label: "Zásilkovna / DPD integrace",          standard: false, eshop: true,  custom: true },
      { label: "Transakční provize Webera",           standard: "—",   eshop: "0 %", custom: "0 %" },
    ],
  },
  {
    category: "Výkon a SEO",
    rows: [
      { label: "PageSpeed 95+",                       standard: true,  eshop: true,  custom: true },
      { label: "Edge cache (270+ měst)",              standard: true,  eshop: true,  custom: true },
      { label: "AVIF/WebP optimalizace",              standard: true,  eshop: true,  custom: true },
      { label: "SEO meta + JSON-LD",                  standard: true,  eshop: true,  custom: true },
      { label: "Sitemap a robots.txt",                standard: true,  eshop: true,  custom: true },
      { label: "A/B testování stránek",               standard: "1 aktivní", eshop: "5 aktivních", custom: "neomezeně" },
    ],
  },
  {
    category: "Infrastruktura",
    rows: [
      { label: "Vlastní doména a SSL",                standard: true,  eshop: true,  custom: true },
      { label: "EU hosting (Praha, Frankfurt)",       standard: true,  eshop: true,  custom: true },
      { label: "Denní zálohy + 30 dní historie",      standard: true,  eshop: true,  custom: "+ point-in-time" },
      { label: "DDoS ochrana (Cloudflare)",           standard: true,  eshop: true,  custom: "Enterprise" },
      { label: "SLA garance uptime",                  standard: "99,9 %", eshop: "99,9 %", custom: "99,99 %" },
    ],
  },
  {
    category: "Podpora",
    rows: [
      { label: "Česká podpora 7 dní v týdnu",         standard: true,  eshop: true,  custom: true },
      { label: "Response time",                        standard: "do 4h", eshop: "do 2h", custom: "do 30 min" },
      { label: "Onboarding session",                   standard: "30 min", eshop: "60 min", custom: "celodenní" },
      { label: "Dedikovaný account manager",           standard: false, eshop: false, custom: true },
      { label: "Telefonní podpora",                    standard: false, eshop: true,  custom: true },
    ],
  },
];

const ADDONS = [
  {
    name: "Rezora — rezervace online",
    price: "+200 Kč / měs",
    desc: "Rezervační systém s napojením na Google Kalendář, SMS notifikace, platba zálohou. Pro barbery, kliniky, autoškoly.",
  },
  {
    name: "Premium video streaming",
    price: "+150 Kč / měs",
    desc: "Vlastní video bez YouTube logo. Adaptivní HLS streaming, 4K kvalita, captions, analytics view rate.",
  },
  {
    name: "AI asistent Pro",
    price: "+390 Kč / měs",
    desc: "1M tokenů měsíčně namísto základních 100K. Pro intenzivní využití generování obsahu a překladů.",
  },
  {
    name: "Vícenásobný web",
    price: "−30 % od 2. webu",
    desc: "Sleva 30 % pro každý další web na stejném účtu. Ideální pro agentury, řetězce a multi-brand firmy.",
  },
];

const FAQ = [
  { q: "Co se stane po 14 dnech zkušebního období?",
    a: "Nic — pokud aktivně nezadáte platební údaje. Žádné automatické strhávání. Pokud chcete pokračovat, vyberete si plán a vše běží dál. Pokud ne, web zůstane v archivu 30 dní pro případ, že byste si to rozmysleli." },
  { q: "Můžu si stáhnout obsah, kdybych skončil?",
    a: "Ano. Plný export obsahu (texty, obrázky, struktura) ve standardních formátech kdykoliv. Doména je vždy vaše — nikdy ji nedržíme." },
  { q: "Jsou transakce v e-shopu zpoplatněné?",
    a: "Od nás ne, neúčtujeme si žádné procento z prodeje. Platí jen běžné poplatky platebního gateway (Stripe 1,4 % + 6 Kč u EU karet)." },
  { q: "Kdy bude E-shop plán dostupný?",
    a: "E-shop modul je v aktivním vývoji a plánujeme spuštění během příštích týdnů. Předregistrujte se e-mailem a dáme vědět jako prvním + dostanete 30 % slevu na první 3 měsíce." },
  { q: "Můžu kdykoliv přejít z plánu na plán?",
    a: "Ano, oboustranně. Upgrade na E-shop je okamžitý. Downgrade na konci aktuálního období. Bez sankcí." },
  { q: "Co když potřebuju více webů?",
    a: "Každý další web na stejném účtu má 30 % slevu. Pro agentury a multi-brand firmy nabízíme Custom plán s plnou multi-tenant správou." },
  { q: "Patří mi obsah a doména?",
    a: "Plně. Veškerý obsah a doména jsou vždy vaše. Webero je nájem za platformu, ne za vlastnictví. Bez vendor lock-inu." },
  { q: "Můžu Webero používat jen na 1 měsíc?",
    a: "Ano. Plán je měsíční, zrušíte kdykoliv jedním klikem. Žádné minimální období, žádné storno poplatky." },
];

const PLANS_EN: Plan[] = [
  {
    key: "standard",
    name: "Standard",
    tagline: "A high-end website for businesses, trades, and services.",
    price: "500",
    priceSuffix: "CZK / month",
    priceNote: "excl. VAT · per website · no commitment",
    cta: "Start 14 days free",
    ctaHref: "/vybrat-design",
    highlight: true,
    bullets: [
      "99+ professional templates for every industry",
      "Real-time live editor",
      "Custom domain and SSL included",
      "PageSpeed 95+ out of the box",
      "SEO meta and JSON-LD schema",
      "Multilingual versions",
      "Newsletter and lead capture",
      "GDPR cookie banner",
      "Human support 7 days a week",
    ],
  },
  {
    key: "eshop",
    badge: "Soon",
    badgeTone: "accent",
    name: "E-shop",
    tagline: "A full e-shop without our transaction commission. For online sales.",
    price: "890",
    priceSuffix: "CZK / month",
    priceNote: "everything in Standard + e-shop module",
    cta: "Pre-register",
    ctaHref: "mailto:hello@webero.co?subject=E-shop%20plan%20pre-registration",
    comingSoon: true,
    bullets: [
      "Everything in Standard",
      "Stripe, PayPal, and GoPay included",
      "Apple Pay and Google Pay",
      "Stock, variants, discount codes",
      "PDF invoices and numbering",
      "Carrier integrations in one click",
      "Subscriptions and recurring payments",
      "No transaction commission from us",
      "Accounting exports",
    ],
  },
  {
    key: "custom",
    badge: "For agencies and enterprise",
    badgeTone: "muted",
    name: "Custom",
    tagline: "Unique design, dedicated care, and multi-tenant setup for agencies.",
    price: "Custom",
    priceSuffix: "",
    priceNote: "individual offer based on scope",
    cta: "Book a meeting",
    ctaHref: "mailto:obchod@webero.co?subject=Custom%20plan",
    bullets: [
      "Unique tailor-made design",
      "Multi-tenant setup for 10+ websites",
      "Dedicated account manager",
      "SLA 99.99% with compensation guarantee",
      "Migration from your current solution",
      "SSO (SAML, Google Workspace)",
      "Onboarding team and training",
      "Priority feature request pipeline",
      "Custom legal framework and NDA",
    ],
  },
];

const COMPARE_EN: CompareSection[] = [
  {
    category: "Editor and content",
    rows: [
      { label: "Real-time live editor", standard: true, eshop: true, custom: true },
      { label: "Number of templates", standard: "99+", eshop: "99+", custom: "99+ custom" },
      { label: "History and versioning", standard: true, eshop: true, custom: true },
      { label: "Team and roles", standard: "up to 3", eshop: "up to 10", custom: "unlimited" },
      { label: "Multilingual websites", standard: true, eshop: true, custom: true },
      { label: "AI content assistant", standard: "100K tokens", eshop: "500K tokens", custom: "unlimited" },
    ],
  },
  {
    category: "E-commerce",
    rows: [
      { label: "Stripe and PayPal", standard: false, eshop: true, custom: true },
      { label: "Stock and variants", standard: false, eshop: true, custom: true },
      { label: "Apple Pay / Google Pay", standard: false, eshop: true, custom: true },
      { label: "Subscriptions and recurring payments", standard: false, eshop: true, custom: true },
      { label: "PDF invoices", standard: false, eshop: true, custom: true },
      { label: "Carrier integrations", standard: false, eshop: true, custom: true },
      { label: "Webero transaction commission", standard: "—", eshop: "0%", custom: "0%" },
    ],
  },
  {
    category: "Performance and SEO",
    rows: [
      { label: "PageSpeed 95+", standard: true, eshop: true, custom: true },
      { label: "Edge cache (270+ cities)", standard: true, eshop: true, custom: true },
      { label: "AVIF/WebP optimization", standard: true, eshop: true, custom: true },
      { label: "SEO meta + JSON-LD", standard: true, eshop: true, custom: true },
      { label: "Sitemap and robots.txt", standard: true, eshop: true, custom: true },
      { label: "Page A/B testing", standard: "1 active", eshop: "5 active", custom: "unlimited" },
    ],
  },
  {
    category: "Infrastructure",
    rows: [
      { label: "Custom domain and SSL", standard: true, eshop: true, custom: true },
      { label: "EU hosting", standard: true, eshop: true, custom: true },
      { label: "Daily backups + 30-day history", standard: true, eshop: true, custom: "+ point-in-time" },
      { label: "DDoS protection", standard: true, eshop: true, custom: "Enterprise" },
      { label: "Uptime SLA", standard: "99.9%", eshop: "99.9%", custom: "99.99%" },
    ],
  },
  {
    category: "Support",
    rows: [
      { label: "Human support 7 days a week", standard: true, eshop: true, custom: true },
      { label: "Response time", standard: "within 4h", eshop: "within 2h", custom: "within 30 min" },
      { label: "Onboarding session", standard: "30 min", eshop: "60 min", custom: "full day" },
      { label: "Dedicated account manager", standard: false, eshop: false, custom: true },
      { label: "Phone support", standard: false, eshop: true, custom: true },
    ],
  },
];

const ADDONS_EN = [
  { name: "Rezora — online bookings", price: "+200 CZK / month", desc: "Booking system connected to Google Calendar, SMS notifications, and deposit payments. For barbers, clinics, and driving schools." },
  { name: "Premium video streaming", price: "+150 CZK / month", desc: "Your own video without YouTube branding. Adaptive HLS streaming, 4K quality, captions, and view-rate analytics." },
  { name: "AI assistant Pro", price: "+390 CZK / month", desc: "1M tokens monthly instead of the base 100K. For intensive content generation and localization." },
  { name: "Multiple websites", price: "-30% from the 2nd site", desc: "30% discount for every additional website on the same account. Ideal for agencies, chains, and multi-brand companies." },
];

const FAQ_EN = [
  { q: "What happens after the 14-day trial?", a: "Nothing unless you actively add payment details. There are no automatic charges. If you want to continue, choose a plan and everything keeps running. If not, your site stays archived for 30 days in case you change your mind." },
  { q: "Can I export my content if I leave?", a: "Yes. You can export your content, images, and structure in standard formats at any time. The domain is always yours." },
  { q: "Are e-shop transactions charged by Webero?", a: "No. We do not take a percentage from sales. You only pay the standard payment gateway fees." },
  { q: "When will the E-shop plan be available?", a: "The e-shop module is in active development. Pre-register by email and we will notify you first, including an early adopter discount." },
  { q: "Can I switch plans later?", a: "Yes, both ways. Upgrade is immediate. Downgrade applies at the end of the current period. No penalties." },
  { q: "What if I need more websites?", a: "Every additional website on the same account gets a 30% discount. For agencies and multi-brand companies we offer a Custom plan with full multi-tenant management." },
  { q: "Do I own my content and domain?", a: "Fully. Your content and domain are yours. Webero is a platform subscription, not ownership lock-in." },
  { q: "Can I use Webero for only one month?", a: "Yes. Plans are monthly and you can cancel anytime in one click. No minimum period, no cancellation fees." },
];

const PRICING_COPY = {
  cs: {
    eyebrow: "Ceník",
    title: "Transparentní cena.",
    muted: "Žádná překvapení.",
    intro: "Vyberte si plán podle toho, co potřebujete dnes. Upgradujete kdykoli, bez sankcí. 14 dní zdarma, bez platební karty.",
    strip: "Bez závazku · Bez platební karty · Zrušíte kdykoli",
    popular: "Nejoblíbenější",
    compare: "Srovnání plánů",
    detail: "Vše do detailu.",
    detailText: "Co všechno v každém plánu dostanete. Bez vyjímek, bez hvězdiček v patičce.",
    feature: "Funkce",
    addons: "Volitelné doplňky",
    addonsTitle: "Když potřebujete víc.",
    addonsText: "Specifické moduly aktivujete kdykoliv jedním klikem. Zaplatíte jen za to, co opravdu využíváte.",
    trust: [
      { t: "Bez závazku", d: "Zrušíte kdykoli jedním klikem" },
      { t: "EU hosting", d: "Praha, Frankfurt, Amsterdam" },
      { t: "0 % provize", d: "Stripe & PayPal bez naší marže" },
      { t: "Česká podpora", d: "7 dní v týdnu, lidsky" },
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
    intro: "Choose the plan you need today. Upgrade anytime without penalties. 14 days free, no credit card required.",
    strip: "No commitment · No credit card · Cancel anytime",
    popular: "Most popular",
    compare: "Plan comparison",
    detail: "Every detail covered.",
    detailText: "See exactly what each plan includes. No exceptions, no tiny footnotes.",
    feature: "Feature",
    addons: "Optional add-ons",
    addonsTitle: "When you need more.",
    addonsText: "Activate specific modules anytime in one click. Pay only for what you actually use.",
    trust: [
      { t: "No commitment", d: "Cancel anytime in one click" },
      { t: "EU hosting", d: "Prague, Frankfurt, Amsterdam" },
      { t: "0% commission", d: "Stripe and PayPal without our markup" },
      { t: "Human support", d: "7 days a week, no runaround" },
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

function PriceCell({ v, accent }: { v: string | true | false; accent?: boolean }) {
  if (v === true) {
    return (
      <span className={`grid h-6 w-6 place-items-center rounded-full ${accent ? "bg-[#6366f1]/15 text-[#4338ca]" : "bg-[#22c55e]/12 text-[#15803d]"}`}>
        <Check size={13} strokeWidth={3} />
      </span>
    );
  }
  if (v === false) {
    return (
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f3f4f6] text-[#9ca3af]">
        <X size={12} strokeWidth={2.5} />
      </span>
    );
  }
  return <span className={`text-[13px] font-medium ${accent ? "text-[#4338ca]" : "text-[#374151]"}`}>{v}</span>;
}

export function PricingPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const copy = PRICING_COPY[locale];
  const plans = locale === "en" ? PLANS_EN : PLANS;
  const compare = locale === "en" ? COMPARE_EN : COMPARE;
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
          <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
            {copy.eyebrow}
          </p>
          <h1 className="mx-auto max-w-[900px] font-sans font-semibold tracking-[-0.03em]"
              style={{ fontSize: "clamp(40px, 5.5vw, 78px)", lineHeight: "1.02" }}>
            {copy.title}<br />
            <span className="text-[#9ca3af]">{copy.muted}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[640px] text-[17px] leading-[1.6] text-[#4b5563]">
            {copy.intro}
          </p>
          <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-[12.5px] font-medium text-[#374151]">
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
                      : "relative flex flex-col overflow-hidden rounded-3xl border border-[#ececec] bg-white p-8 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] lg:p-10"
                  }
                >
                  {isDark && (
                    <div className="pointer-events-none absolute -right-12 -top-12 h-[280px] w-[280px] rounded-full"
                         style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.40), transparent)" }} />
                  )}

                  <div className="relative flex items-center gap-2">
                    {p.badge && (
                      <span className={
                        p.badgeTone === "accent"
                          ? "inline-flex items-center gap-1.5 rounded-full bg-[#6366f1]/12 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#4338ca]"
                          : isDark
                            ? "inline-flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/80"
                            : "inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]"
                      }>
                        {p.badgeTone === "accent" && <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />}
                        {p.badge}
                      </span>
                    )}
                    {p.highlight && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                        {copy.popular}
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
                        : p.comingSoon
                          ? "relative mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/8 px-6 py-3 text-[14px] font-semibold text-[#4338ca] transition hover:border-[#6366f1]/60 hover:bg-[#6366f1]/12"
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

      {/* Comparison table */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto mb-14 max-w-[820px] text-center lg:mb-20">
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
              {copy.compare}
            </p>
            <h2 className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: "1.05" }}>
              {copy.detail}
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.65] text-[#4b5563]">
              {copy.detailText}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white">
            {/* Table header (non-sticky to avoid platform header overlap) */}
            <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 border-b border-[#ececec] bg-[#fafafa] px-6 py-5 md:grid lg:px-8">
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">{copy.feature}</div>
              <div className="text-center text-[14px] font-bold tracking-[-0.01em] text-[#0a0a0a]">Standard</div>
              <div className="text-center text-[14px] font-bold tracking-[-0.01em] text-[#4338ca]">E-shop</div>
              <div className="text-center text-[14px] font-bold tracking-[-0.01em] text-[#0a0a0a]">Custom</div>
            </div>

            {compare.map((sec) => (
              <div key={sec.category}>
                <div className="border-b border-t border-[#ececec] bg-[#fafafa] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280] lg:px-8">
                  {sec.category}
                </div>
                {sec.rows.map((r) => (
                  <div key={r.label} className="grid grid-cols-[1fr_auto] gap-y-2 border-b border-[#f3f4f6] px-6 py-4 last:border-b-0 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:items-center md:gap-2 lg:px-8">
                    <div className="text-[14px] text-[#0a0a0a] md:font-medium">{r.label}</div>
                    <div className="hidden justify-center md:flex"><PriceCell v={r.standard} /></div>
                    <div className="hidden justify-center md:flex"><PriceCell v={r.eshop} accent /></div>
                    <div className="hidden justify-center md:flex"><PriceCell v={r.custom} /></div>
                    {/* Mobile stacked values */}
                    <div className="col-span-2 grid grid-cols-3 gap-2 pt-2 md:hidden">
                      <div className="flex flex-col items-center gap-1 rounded-lg bg-[#fafafa] p-2 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Standard</span>
                        <PriceCell v={r.standard} />
                      </div>
                      <div className="flex flex-col items-center gap-1 rounded-lg bg-[#6366f1]/[0.04] p-2 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4338ca]">E-shop</span>
                        <PriceCell v={r.eshop} accent />
                      </div>
                      <div className="flex flex-col items-center gap-1 rounded-lg bg-[#fafafa] p-2 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Custom</span>
                        <PriceCell v={r.custom} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="mb-14 max-w-[680px]">
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
              {copy.addons}
            </p>
            <h2 className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: "1.08" }}>
              {copy.addonsTitle}
            </h2>
            <p className="mt-5 text-[16px] leading-[1.65] text-[#4b5563]">
              {copy.addonsText}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
            {addons.map((a) => (
              <div key={a.name} className="rounded-2xl border border-[#ececec] bg-white p-7 transition hover:-translate-y-0.5 hover:border-[#0a0a0a]/15 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.12)]">
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
      <section className="border-y border-[#ececec] bg-[#fafafa]">
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
        <div className="mx-auto max-w-[860px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="mb-12 text-center">
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
              {copy.faqEyebrow}
            </p>
            <h2 className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: "1.08" }}>
              {copy.faqTitle}
            </h2>
          </div>
          <div className="divide-y divide-[#ececec] border-y border-[#ececec]">
            {faq.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">{f.q}</h3>
                  <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-[#e5e7eb] text-[#6b7280] transition group-open:rotate-45 group-open:border-[#0a0a0a] group-open:text-[#0a0a0a]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-[14.5px] leading-[1.65] text-[#4b5563]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-32">
          <h2 className="mx-auto max-w-[760px] font-sans font-semibold tracking-[-0.025em] text-white"
              style={{ fontSize: "clamp(34px, 4.5vw, 60px)", lineHeight: "1.04" }}>
            {copy.finalTitle}<br /><span className="text-[#a5b4fc]">{copy.finalMuted}</span>
          </h2>
          <p className="mx-auto mt-7 max-w-[560px] text-[17px] leading-[1.6] text-white/90">
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
