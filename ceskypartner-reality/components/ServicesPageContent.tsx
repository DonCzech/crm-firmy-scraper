import type { Metadata } from "next";
import {
  ArrowUpRight,
  Banknote,
  BarChart3,
  Building2,
  Camera,
  ChevronRight,
  FileCheck2,
  Handshake,
  Home,
  KeyRound,
  Scale,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import type { SiteLocale } from "@/lib/locale";

const HERO_SERVICES = [
  {
    icon: Home,
    title: "Prodej nemovitosti",
    text: "Odhad trzni ceny zdarma, profesionalni prezentace vcetne fotografii a videa, kompletni pravni servis az po predani.",
    href: "/kontakt",
    cta: "Chci prodat",
  },
  {
    icon: KeyRound,
    title: "Pronajem a sprava",
    text: "Provereni najemnici, najemni smlouvy bez slabych mist a kompletni sprava nemovitosti, kdyz jste daleko.",
    href: "/kontakt",
    cta: "Chci pronajmout",
  },
  {
    icon: TrendingUp,
    title: "Investicni poradenstvi",
    text: "Vynosove analyzy, off-market prilezitosti a dlouhodoba strategie budovani realitniho portfolia.",
    href: "/kontakt",
    cta: "Chci investovat",
  },
];
const HERO_SERVICES_EN = [
  { icon: Home, title: "Property sales", text: "Complimentary market valuation, exceptional presentation and complete legal support through to handover.", href: "/en/contact", cta: "I want to sell" },
  { icon: KeyRound, title: "Lettings and management", text: "Carefully screened tenants, robust tenancy agreements and complete management when you are away.", href: "/en/contact", cta: "I want to let" },
  { icon: TrendingUp, title: "Investment advisory", text: "Yield analysis, off-market opportunities and a long-term strategy for building a property portfolio.", href: "/en/contact", cta: "I want to invest" },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Konzultace zdarma",
    text: "Sejdeme se, zjistime vase potreby a moznosti. Pripravime odhad trzni ceny a navrhneme strategii.",
  },
  {
    num: "02",
    title: "Priprava a prezentace",
    text: "Profesionalni fotky, video, 3D prohlidka, homestaging. Vytvorime inzerat, ktery prodava.",
  },
  {
    num: "03",
    title: "Marketing a prodej",
    text: "Cileny online marketing, inzerce na vsech portálech, osloveni nasi databaze kupujicich.",
  },
  {
    num: "04",
    title: "Pravni servis a predani",
    text: "Kupni smlouva, advokátni úschova, katastr, dane. Predame klice a vy mate klid.",
  },
];
const PROCESS_STEPS_EN = [
  { num: "01", title: "Complimentary consultation", text: "We establish your priorities, assess the property and recommend a clear strategy." },
  { num: "02", title: "Preparation and presentation", text: "Photography, film, 3D tour and considered staging create a presentation that earns attention." },
  { num: "03", title: "Marketing and negotiation", text: "Purposeful digital marketing, leading property portals and direct access to our buyer network." },
  { num: "04", title: "Legal work and completion", text: "Contracts, escrow, Land Registry and handover are managed as one coordinated process." },
];

const DETAIL_SERVICES = [
  {
    icon: Search,
    title: "Odhad trzni ceny",
    text: "Presny odhad na zaklade srovnatelnych prodejú, trendú a nasich zkusenosti s lokalnim trhem.",
  },
  {
    icon: Camera,
    title: "Profesionalni foto & video",
    text: "Dronove zabery, 3D prohlidky Matterport, virtualni homestaging — vasemu inzeratu dáme tvár.",
  },
  {
    icon: Scale,
    title: "Pravni servis",
    text: "Smlouvy, advokátni úschova, katastální úkony. Spolupracujeme s overenymi advokáty.",
  },
  {
    icon: Banknote,
    title: "Financování a hypotéky",
    text: "Nezávislé porovnání nabídek bank, vyřízení hypotéky se zvýhodněnými podmínkami díky naší síti.",
  },
  {
    icon: Building2,
    title: "Správa nemovitostí",
    text: "Údržba, komunikace s nájemníky, výběr nájemného, pravidelný reporting — my se staráme, vy inkasujete.",
  },
  {
    icon: FileCheck2,
    title: "Due diligence",
    text: "Kompletní prověrka nemovitosti: právní stav, věcná břemena, technický stav, energetický průkaz.",
  },
  {
    icon: BarChart3,
    title: "Tržní analýzy",
    text: "Data-driven přístup. Sledujeme trendy, cenové mapy a výnosnost — vaše investice má oporu v datech.",
  },
  {
    icon: Users,
    title: "Osobní makléř",
    text: "Dedikovaný makléř, který zná vaši situaci a provází vás celým procesem. Žádné call centrum.",
  },
];
const DETAIL_SERVICES_EN = [
  { icon: Search, title: "Market valuation", text: "Evidence-led pricing based on comparable transactions, current demand and first-hand local knowledge." },
  { icon: Camera, title: "Photography and film", text: "Architectural photography, drone work, 3D tours and virtual staging tailored to the property." },
  { icon: Scale, title: "Legal support", text: "Contracts, escrow and Land Registry matters handled with proven property lawyers." },
  { icon: Banknote, title: "Mortgages and financing", text: "Independent comparison of lenders and a financing structure suited to the transaction." },
  { icon: Building2, title: "Property management", text: "Maintenance, tenant communication, rent collection and clear reporting for owners at home or abroad." },
  { icon: FileCheck2, title: "Due diligence", text: "Legal title, easements, technical condition and energy documentation reviewed before commitment." },
  { icon: BarChart3, title: "Market intelligence", text: "Pricing evidence, demand trends and yield analysis that make decisions more defensible." },
  { icon: Users, title: "Dedicated agent", text: "One accountable adviser who understands your position and remains with you throughout." },
];

const GUARANTEES = [
  { title: "Transparentní provize", text: "Jasná a férová odměna dohodnutá předem. Žádné skryté poplatky." },
  { title: "Garance spokojenosti", text: "Nejste spokojeni? Kdykoli můžete spolupráci ukončit bez sankcí." },
  { title: "Pojištění odpovědnosti", text: "Pojištění profesní odpovědnosti do 50 mil. Kč pro váš klid." },
  { title: "GDPR & diskrétnost", text: "Vaše údaje chráníme. NDA u prémiových nemovitostí je standard." },
];
const GUARANTEES_EN = [
  { title: "Transparent fee", text: "A clear and fair fee agreed in advance, with no hidden charges." },
  { title: "Client-first commitment", text: "Clear expectations, direct communication and accountability throughout." },
  { title: "Professional indemnity", text: "Professional indemnity cover of up to CZK 50 million." },
  { title: "Privacy and discretion", text: "Your information is protected; NDAs are standard for sensitive instructions." },
];

export default function ServicesPageContent({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const heroServices = en ? HERO_SERVICES_EN : HERO_SERVICES;
  const processSteps = en ? PROCESS_STEPS_EN : PROCESS_STEPS;
  const detailServices = en ? DETAIL_SERVICES_EN : DETAIL_SERVICES;
  const guarantees = en ? GUARANTEES_EN : GUARANTEES;
  return (
    <>
      <Header variant="solid" locale={locale} />

      <main className="pt-16">
        {/* Breadcrumbs + Heading */}
        <section className="bg-paper">
          <div className="mx-auto max-w-site px-6 pb-0 pt-10 xl:px-10">
            <nav
              aria-label={en ? "Breadcrumb" : "Drobeckova navigace"}
              className="flex items-center gap-2 text-[12.5px] text-muted"
            >
              <a href={en ? "/en" : "/"} className="transition-colors hover:text-ink">
                {en ? "Home" : "Uvod"}
              </a>
              <ChevronRight size={13} strokeWidth={1.5} />
              <span className="text-ink">{en ? "Services" : "Sluzby"}</span>
            </nav>

            <Reveal className="mt-10 max-w-3xl pb-20">
              <p className="eyebrow text-bronze-deep">{en ? "Our services" : "Nase sluzby"}</p>
              <h1 className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
                {en ? "Complete property expertise —" : "Kompletni servis pro vasi nemovitost —"}
                <span className="text-bronze">{en ? " from valuation to completion." : " od odhadu po predani klicu."}</span>
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.75] text-muted">
                {en ? "We combine local market knowledge, rigorous execution and personal responsibility to make complex property decisions feel considered and controlled." : "Nechte to na nas. Kombinujeme znalost mistniho trhu s modernimí nastroji a osobním pristupem, ktery z kazdeho obchodu dela prijetmny zazitek."}
              </p>
            </Reveal>
          </div>
        </section>

        {/* 3 Core Services */}
        <section className="border-t border-line bg-stone/50">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <div className="grid gap-6 md:grid-cols-3">
              {heroServices.map((s, i) => (
                <Reveal key={s.title} delay={i * 100}>
                  <a
                    href={s.href}
                    className="group flex h-full flex-col border border-line bg-paper p-10 transition-all duration-500 ease-luxe hover:-translate-y-1 hover:border-bronze hover:shadow-[0_8px_30px_rgba(169,136,90,0.08)]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center border border-line transition-colors duration-300 group-hover:border-bronze group-hover:bg-bronze/5">
                      <s.icon size={26} strokeWidth={1.2} className="text-bronze-deep" />
                    </div>
                    <h3 className="mt-7 text-[22px] font-semibold tracking-[-0.01em]">
                      {s.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[14.5px] leading-[1.75] text-muted">
                      {s.text}
                    </p>
                    <span className="mt-8 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em]">
                      {s.cta}
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.8}
                        className="text-bronze transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-site px-6 py-28 md:py-36 xl:px-10">
            <Reveal>
              <p className="eyebrow text-paper/50">{en ? "How it works" : "Jak to funguje"}</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3.2vw,2.9rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {en ? "From first conversation to handover" : "Od prvniho hovoru k predani klicu"}
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-4">
              {processSteps.map((step, i) => (
                <Reveal key={step.num} delay={i * 80}>
                  <div className="flex h-full flex-col bg-ink p-8 md:p-10">
                    <span className="text-[clamp(2.5rem,4vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-bronze/30">
                      {step.num}
                    </span>
                    <h3 className="mt-5 text-[18px] font-semibold">{step.title}</h3>
                    <p className="mt-3 flex-1 text-[14px] leading-[1.7] text-paper/60">
                      {step.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Detail Services Grid */}
        <section className="bg-paper">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <Reveal>
              <p className="eyebrow text-muted">{en ? "Complete service" : "Kompletni portfolio"}</p>
              <h2 className="mt-4 max-w-xl text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {en ? "Everything coordinated under one roof" : "Vsechno pod jednou strechou"}
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {detailServices.map((s, i) => (
                <Reveal key={s.title} delay={i * 60}>
                  <div className="group border border-line p-8 transition-all duration-500 ease-luxe hover:border-bronze/40">
                    <s.icon
                      size={22}
                      strokeWidth={1.3}
                      className="text-bronze-deep transition-transform duration-300 group-hover:scale-110"
                    />
                    <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.01em]">
                      {s.title}
                    </h3>
                    <p className="mt-2.5 text-[13.5px] leading-[1.7] text-muted">
                      {s.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="border-t border-line bg-stone/40">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
              <Reveal>
                <p className="eyebrow text-bronze-deep">{en ? "Our commitment" : "Garance"}</p>
                <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                  {en ? "Why clients choose us" : "Proc prave my"}
                </h2>
                <p className="mt-5 text-[15px] leading-[1.75] text-muted">
                  {en ? "Fifteen years in the market, more than 1,200 completed transactions and a reputation earned through delivery." : "15 let na trhu, 1 200+ uspesnych obchodu a pristup, ktery si neziskate reklamou — ale vysledky."}
                </p>
                <a
                  href={en ? "/en/contact" : "/kontakt"}
                  className="group mt-8 inline-flex items-center gap-2 border border-ink px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
                >
                  {en ? "Arrange a meeting" : "Domluvit schuzku"}
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.8}
                    className="text-bronze transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </Reveal>

              <div className="grid gap-6 sm:grid-cols-2">
                {guarantees.map((g, i) => (
                  <Reveal key={g.title} delay={i * 80}>
                    <div className="flex gap-4 border border-line bg-paper p-7">
                      <ShieldCheck
                        size={20}
                        strokeWidth={1.3}
                        className="mt-0.5 shrink-0 text-bronze"
                      />
                      <div>
                        <h3 className="text-[15px] font-semibold">{g.title}</h3>
                        <p className="mt-1.5 text-[13.5px] leading-[1.65] text-muted">
                          {g.text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-site px-6 py-24 text-center md:py-32 xl:px-10">
            <Reveal>
              <p className="eyebrow text-paper/50">{en ? "Next step" : "Dalsi krok"}</p>
              <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {en ? "Ready for a considered conversation?" : "Pripraveni poradit se s odborníky?"}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.75] text-paper/60">
                {en ? "Your first consultation is complimentary and without obligation. Tell us what you are considering." : "Konzultace je zdarma a bez zavazku. Kontaktujte nas a zjistete, co muzeme udelat pro vasi nemovitost."}
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href={en ? "/en/contact" : "/kontakt"}
                  className="inline-flex h-14 items-center gap-2 bg-bronze px-10 text-[13px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-bronze-deep hover:text-paper"
                >
                  {en ? "Contact us" : "Kontaktujte nas"}
                  <ArrowUpRight size={15} strokeWidth={1.8} />
                </a>
                <a
                  href="tel:+420224000111"
                  className="inline-flex h-14 items-center border border-paper/30 px-10 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
                >
                  +420 224 000 111
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
