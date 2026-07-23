import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { platformPath } from "@/lib/platform-i18n";

/* ────────────────────────────────────────────────────────────────────────
   Pricing — awwwards-grade, deliberately lean.
   Three plans, a compact add-on row, a short FAQ. Nothing crammed.
   ──────────────────────────────────────────────────────────────────────── */

const SERIF = "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif";

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

const PLANS_CS: Plan[] = [
  {
    key: "weby", name: "Weby", tagline: "Web na špičkové úrovni.",
    price: "500", priceSuffix: "Kč / měsíc", priceNote: "za 1 web, bez DPH", cta: "Začít zdarma", ctaHref: "/vybrat-design", highlight: true,
    bullets: ["100+ profi šablon", "Live editor na stránce", "Doména, SSL a hosting v ceně"],
  },
  {
    key: "eshopy", badge: "0 % provize", name: "E-shopy", tagline: "Prodávejte bez provize.",
    price: "od 440", priceSuffix: "Kč / měsíc", priceNote: "vše z Webů v ceně", cta: "Vyzkoušet zdarma", ctaHref: "/vybrat-design",
    bullets: ["Vše z plánu Weby", "Katalog, platby i doprava", "0 % provize z prodejů"],
  },
  {
    key: "custom", name: "Na míru", tagline: "Postavíme cokoliv.",
    price: "Individuální", priceSuffix: "", priceNote: "Kalkulace do 24 hodin", cta: "Poptat projekt", ctaHref: "/kontakt",
    bullets: ["Design i funkce na míru", "Aplikace, SaaS, cokoliv", "Přednostní podpora"],
  },
];

const PLANS_EN: Plan[] = [
  {
    key: "weby", name: "Websites", tagline: "A top-tier website.",
    price: "500", priceSuffix: "CZK / month", priceNote: "per site, excl. VAT", cta: "Start free", ctaHref: "/vybrat-design", highlight: true,
    bullets: ["100+ professional templates", "Live on-page editor", "Domain, SSL & hosting included"],
  },
  {
    key: "eshopy", badge: "0% commission", name: "E-shops", tagline: "Sell with zero commission.",
    price: "from 440", priceSuffix: "CZK / month", priceNote: "includes Websites", cta: "Try for free", ctaHref: "/vybrat-design",
    bullets: ["Everything in Websites", "Catalog, payments & shipping", "0% commission on sales"],
  },
  {
    key: "custom", name: "Custom", tagline: "We build anything.",
    price: "On request", priceSuffix: "", priceNote: "quote within 24h", cta: "Request a project", ctaHref: "/kontakt",
    bullets: ["Design & features to spec", "Apps, SaaS, anything", "Priority support"],
  },
];

type Tier = { name: string; price: string; suffix: string; limit: string; popular?: boolean };

const ESHOP_TIERS_CS: Tier[] = [
  { name: "Free", price: "0", suffix: "Kč", limit: "do 10 produktů" },
  { name: "Basic", price: "440", suffix: "Kč / měs", limit: "do 100 produktů" },
  { name: "Business", price: "1 490", suffix: "Kč / měs", limit: "do 1 000 produktů", popular: true },
  { name: "Profi", price: "2 490", suffix: "Kč / měs", limit: "do 5 000 produktů" },
  { name: "Enterprise", price: "4 690", suffix: "Kč / měs", limit: "do 50 000 produktů" },
];
const ESHOP_TIERS_EN: Tier[] = [
  { name: "Free", price: "0", suffix: "CZK", limit: "up to 10 products" },
  { name: "Basic", price: "440", suffix: "CZK / mo", limit: "up to 100 products" },
  { name: "Business", price: "1 490", suffix: "CZK / mo", limit: "up to 1 000 products", popular: true },
  { name: "Profi", price: "2 490", suffix: "CZK / mo", limit: "up to 5 000 products" },
  { name: "Enterprise", price: "4 690", suffix: "CZK / mo", limit: "up to 50 000 products" },
];

const ADDONS_CS = [
  { name: "Rezervace (Rezora)", price: "+200 Kč/měs" },
  { name: "Chytré vyhledávání", price: "+300 Kč/měs" },
  { name: "Vlastní kód", price: "v ceně" },
  { name: "Každý další web", price: "−30 %" },
];
const ADDONS_EN = [
  { name: "Online booking (Rezora)", price: "+200 CZK/mo" },
  { name: "Smart search", price: "+300 CZK/mo" },
  { name: "Custom code", price: "included" },
  { name: "Each extra site", price: "-30%" },
];

const FAQ_CS = [
  { q: "Co se stane po 14 dnech zdarma?", a: "Nic — dokud aktivně nezadáte platební údaje. Žádné automatické strhávání. Buď si vyberete plán, nebo skončíte. Web pak zůstane 30 dní v archivu." },
  { q: "Berete si provizi z prodejů v e-shopu?", a: "Ne, ani korunu. Platíte jen běžné poplatky platební brány (např. Stripe 1,4 % + 6 Kč u EU karet)." },
  { q: "Jak funguje řešení na míru?", a: "Napíšete nám přes kontaktní formulář, co potřebujete. Do 24 hodin dostanete konkrétní nabídku s cenou i termínem." },
  { q: "Můžu kdykoliv přejít mezi plány?", a: "Ano, oběma směry. Upgrade je okamžitý, downgrade platí od konce období. Bez sankcí a bez storno poplatků." },
  { q: "Patří mi obsah a doména?", a: "Plně. Obsah i doména jsou vždy vaše, kdykoliv je vyexportujete. Žádný vendor lock-in." },
  { q: "Můžu Webero zrušit kdykoliv?", a: "Ano, jedním klikem. Plán je měsíční, žádné minimální období." },
];
const FAQ_EN = [
  { q: "What happens after the 14 free days?", a: "Nothing — unless you actively add payment details. No automatic charges. You either pick a plan or stop. Your site then stays archived for 30 days." },
  { q: "Do you take a commission on e-shop sales?", a: "No, not a cent. You only pay the standard payment gateway fees (e.g. Stripe 1.4% + 6 CZK for EU cards)." },
  { q: "How does custom work operate?", a: "Send us what you need via the contact form. Within 24 hours you get a concrete offer with price and timeline." },
  { q: "Can I switch plans anytime?", a: "Yes, both ways. Upgrades are instant, downgrades apply at the end of the period. No penalties, no cancellation fees." },
  { q: "Do I own my content and domain?", a: "Fully. Content and domain are always yours, exportable anytime. No vendor lock-in." },
  { q: "Can I cancel anytime?", a: "Yes, in one click. Plans are monthly with no minimum period." },
];

const COPY = {
  cs: {
    eyebrow: "Ceník",
    titleA: "Jednoduchá cena.",
    titleEm: "Žádná překvapení.",
    sub: "Web, e-shop, nebo řešení na míru. 14 dní zdarma, bez platební karty. Zrušíte kdykoliv jedním klikem.",
    strip: "Bez závazku · Bez karty · Zrušíte kdykoliv",
    popular: "Nejoblíbenější",
    addonsTitle: "Volitelné doplňky",
    addonsSub: "Aktivujete jedním klikem. Platíte jen za to, co využíváte.",
    faqEyebrow: "Časté dotazy",
    faqTitle: "Než se zeptáte.",
    finalTitle: "Spusťte web za 5 minut.",
    finalEm: "Platit budete až za 14 dní.",
    finalSub: "Bez karty, bez automatického strhávání. Když nepřesvědčíme, prostě skončíte.",
    primary: "Vybrat design",
    secondary: "Poptat na míru",
  },
  en: {
    eyebrow: "Pricing",
    titleA: "Simple pricing.",
    titleEm: "No surprises.",
    sub: "A website, an e-shop, or custom work. 14 days free, no credit card. Cancel anytime in one click.",
    strip: "No commitment · No card · Cancel anytime",
    popular: "Most popular",
    addonsTitle: "Optional add-ons",
    addonsSub: "Activate in one click. Pay only for what you use.",
    faqEyebrow: "FAQ",
    faqTitle: "Before you ask.",
    finalTitle: "Launch a site in 5 minutes.",
    finalEm: "Pay only after 14 days.",
    finalSub: "No card, no automatic charging. If we don't convince you, simply stop.",
    primary: "Choose a design",
    secondary: "Request custom work",
  },
} as const;

export function PricingPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const c = COPY[locale];
  const plans = locale === "en" ? PLANS_EN : PLANS_CS;
  const addons = locale === "en" ? ADDONS_EN : ADDONS_CS;
  const faq = locale === "en" ? FAQ_EN : FAQ_CS;
  const contactHref = platformPath("/kontakt", locale);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#0a0a0a]">
      <PlatformHeader forceSolid locale={locale} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#151633] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.9]"
             style={{ background: "radial-gradient(58% 55% at 50% -8%, rgba(129,140,248,0.55), transparent 60%), radial-gradient(50% 52% at 86% 0%, rgba(167,139,250,0.45), transparent 60%), radial-gradient(48% 58% at 6% 26%, rgba(56,189,248,0.28), transparent 62%)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(199,210,254,0.5), transparent)" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
             style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(70% 60% at 50% 15%, #000, transparent 80%)", WebkitMaskImage: "radial-gradient(70% 60% at 50% 15%, #000, transparent 80%)" }} />
        <div className="relative mx-auto max-w-[1180px] px-6 pt-[130px] pb-16 text-center lg:px-10 lg:pt-[160px] lg:pb-20">
          <p className="mb-5 text-[12px] font-semibold uppercase text-[#a5b4fc]" style={{ letterSpacing: "0.22em" }}>{c.eyebrow}</p>
          <h1 className="mx-auto max-w-[16ch] font-sans font-semibold tracking-[-0.035em] text-white"
              style={{ fontSize: "clamp(42px, 6vw, 88px)", lineHeight: "0.98" }}>
            {c.titleA}<br />
            <span className="italic" style={{ fontFamily: SERIF, fontWeight: 400, color: "#c7d2fe" }}>{c.titleEm}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[560px] text-[16.5px] leading-[1.6] text-white/70">{c.sub}</p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12.5px] font-medium text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
            {c.strip}
          </div>
        </div>
      </section>

      {/* ── PLANS ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Soft brand canvas — violet crown + a grid that fades into the page */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(99,102,241,0.06), transparent 72%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg,#6366f1 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(72% 50% at 50% 0%, #000, transparent 76%)",
            WebkitMaskImage: "radial-gradient(72% 50% at 50% 0%, #000, transparent 76%)",
          }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 pt-16 pb-14 lg:px-10 lg:pt-20 lg:pb-16">
          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            {plans.map((p) => {
              const featured = !!p.highlight;
              const href = p.ctaHref === "/kontakt" ? contactHref : platformPath(p.ctaHref, locale);

              const badge = featured ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6366f1]/12 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#4338ca]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" /> {c.popular}
                </span>
              ) : p.badge ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10b981]/12 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#047857]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> {p.badge}
                </span>
              ) : null;

              const card = (
                <div
                  className={featured
                    ? "relative flex h-full w-full flex-col overflow-hidden rounded-[26px] p-8 lg:p-9"
                    : "group relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-[#ececec] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-[#6366f1]/25 hover:shadow-[0_28px_56px_-28px_rgba(0,0,0,0.18)] lg:p-9"}
                  style={featured ? { background: "linear-gradient(180deg,#ffffff 0%,#f5f3ff 100%)" } : undefined}
                >
                  {featured && (
                    <div
                      className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-70 blur-3xl"
                      style={{ background: "radial-gradient(circle, rgba(129,140,248,0.32), transparent 70%)" }}
                    />
                  )}

                  <div className="relative flex min-h-[24px] items-center gap-2">{badge}</div>

                  <h2
                    className="relative mt-6 font-sans font-semibold tracking-[-0.02em] text-[#0a0a0a]"
                    style={{ fontSize: "clamp(24px, 2.6vw, 30px)", lineHeight: "1.1" }}
                  >
                    {p.name}
                  </h2>
                  <p className="relative mt-2.5 text-[14px] leading-[1.5] text-[#6b7280]">{p.tagline}</p>

                  {(() => {
                    // Split an optional "from"/"od" prefix; render word-prices (Custom) smaller so
                    // nothing overflows and all three columns keep an aligned baseline.
                    const m = p.price.match(/^(from|od)\s+(.+)$/i);
                    const prefix = m ? m[1] : null;
                    const main = m ? m[2] : p.price;
                    const isWord = !/\d/.test(main);
                    const size = isWord ? "clamp(28px, 3vw, 40px)" : "clamp(44px, 5.2vw, 64px)";
                    return (
                      <div className="relative mt-7 flex min-h-[92px] flex-col justify-end">
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          {prefix && <span className="text-[15px] font-medium text-[#9ca3af]">{prefix}</span>}
                          <span
                            className="whitespace-nowrap font-sans font-semibold tracking-[-0.03em]"
                            style={featured
                              ? { fontSize: size, lineHeight: "0.95", background: "linear-gradient(135deg,#6366f1,#818cf8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
                              : { fontSize: size, lineHeight: "0.95", color: "#0a0a0a" }}
                          >
                            {main}
                          </span>
                          {p.priceSuffix && <span className="text-[14px] font-medium text-[#9ca3af]">{p.priceSuffix}</span>}
                        </div>
                        <p className="mt-2 text-[12.5px] text-[#9ca3af]">{p.priceNote}</p>
                      </div>
                    );
                  })()}

                  <Link
                    href={href}
                    className={featured
                      ? "group/cta relative mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-semibold text-white shadow-[0_16px_36px_-14px_rgba(99,102,241,0.7)] transition hover:brightness-[1.08]"
                      : "relative mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-[#0a0a0a] bg-white px-6 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:bg-[#0a0a0a] hover:text-white"}
                    style={featured ? { background: "linear-gradient(135deg,#6366f1,#818cf8)" } : undefined}
                  >
                    {p.cta} <ArrowRight size={15} className={featured ? "transition-transform group-hover/cta:translate-x-0.5" : ""} />
                  </Link>

                  <ul className="relative mt-8 space-y-3 border-t border-[#ececec] pt-7">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-[14px] text-[#1f2937]">
                        <span
                          className={featured
                            ? "mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#6366f1]/12 text-[#4338ca]"
                            : "mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#22c55e]/12 text-[#15803d]"}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );

              return featured ? (
                <div
                  key={p.key}
                  className="relative h-full rounded-[27.5px] p-[1.5px]"
                  style={{ background: "linear-gradient(160deg,#c4b5fd,#818cf8 48%,#a5b4fc)", boxShadow: "0 44px 90px -42px rgba(99,102,241,0.55)" }}
                >
                  {card}
                </div>
              ) : (
                <div key={p.key} className="h-full">{card}</div>
              );
            })}
          </div>

          {/* Compact add-on row */}
          <div
            className="relative mt-8 overflow-hidden rounded-[22px] border border-[#ececec] px-6 py-6 lg:px-8"
            style={{ background: "linear-gradient(180deg,#fafafa 0%,#f5f4ff 100%)" }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#0a0a0a]">{c.addonsTitle}</h3>
                <p className="mt-1 text-[13px] text-[#6b7280]">{c.addonsSub}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {addons.map((a) => (
                  <span
                    key={a.name}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-2 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:border-[#6366f1]/40"
                  >
                    {a.name} <span className="text-[#6366f1]">{a.price}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-[#ececec] bg-white">
        <div className="mx-auto max-w-[820px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="mb-12 text-center">
            <p className="mb-4 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>{c.faqEyebrow}</p>
            <h2 className="font-sans font-semibold tracking-[-0.03em]" style={{ fontSize: "clamp(30px, 4vw, 50px)", lineHeight: "1.05" }}>{c.faqTitle}</h2>
          </div>
          <div className="divide-y divide-[#f1f1f1] overflow-hidden rounded-[24px] border border-[#ececec] bg-white">
            {faq.map((f) => (
              <details key={f.q} className="group px-6 py-5 sm:px-8">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-[#374151] transition-colors group-open:text-[#0a0a0a] group-hover:text-[#0a0a0a] sm:text-[16px]">{f.q}</h3>
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-[#e5e7eb] text-[#0a0a0a] transition-all duration-300 group-open:rotate-45 group-open:border-[#0a0a0a] group-open:bg-[#0a0a0a] group-open:text-white">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <p className="mt-4 pr-12 text-[14.5px] leading-[1.7] text-[#555]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#151633] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60"
             style={{ background: "radial-gradient(50% 60% at 50% 100%, rgba(99,102,241,0.4), transparent 62%)" }} />
        <div className="relative mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-32">
          <h2 className="mx-auto max-w-[760px] font-sans font-semibold tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(32px, 4.4vw, 60px)", lineHeight: "1.03" }}>
            {c.finalTitle}<br />
            <span className="italic" style={{ fontFamily: SERIF, fontWeight: 400, color: "#c7d2fe" }}>{c.finalEm}</span>
          </h2>
          <p className="mx-auto mt-7 max-w-[540px] text-[16px] leading-[1.6] text-white/70">{c.finalSub}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={platformPath("/vybrat-design", locale)} className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              {c.primary} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href={contactHref} className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-[15px] font-semibold text-white transition hover:border-white/45 hover:bg-white/5">
              {c.secondary} <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
