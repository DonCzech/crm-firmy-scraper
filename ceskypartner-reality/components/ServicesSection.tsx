import { ArrowUpRight, Home, KeyRound, TrendingUp } from "lucide-react";
import Reveal from "./Reveal";
import type { SiteLocale } from "@/lib/locale";

const SERVICES_CS = [
  {
    icon: Home,
    title: "Prodej nemovitosti",
    text: "Odhad tržní ceny zdarma, profesionální prezentace včetně fotografií a videa, kompletní právní servis až po předání.",
    cta: "Chci prodat",
  },
  {
    icon: KeyRound,
    title: "Pronájem a správa",
    text: "Prověření nájemníci, nájemní smlouvy bez slabých míst a kompletní správa nemovitosti, když jste daleko.",
    cta: "Chci pronajmout",
  },
  {
    icon: TrendingUp,
    title: "Investiční poradenství",
    text: "Výnosové analýzy, off-market příležitosti a dlouhodobá strategie budování realitního portfolia.",
    cta: "Chci investovat",
  },
];

const SERVICES_EN = [
  {
    icon: Home,
    title: "Selling your property",
    text: "A complimentary market valuation, editorial-quality photography and video, considered marketing and complete legal support through to handover.",
    cta: "I want to sell",
  },
  {
    icon: KeyRound,
    title: "Lettings and management",
    text: "Carefully vetted tenants, robust tenancy agreements and attentive property management, wherever in the world you happen to be.",
    cta: "I want to let",
  },
  {
    icon: TrendingUp,
    title: "Property investment",
    text: "Clear yield analysis, discreet off-market opportunities and a long-term strategy for building a resilient property portfolio.",
    cta: "I want to invest",
  },
];

export default function ServicesSection({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const services = en ? SERVICES_EN : SERVICES_CS;
  return (
    <section id={en ? "services" : "sluzby"} className="bg-paper">
      <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
        <Reveal>
          <p className="eyebrow text-muted">{en ? "Our services" : "Služby"}</p>
          <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
            {en ? "Expertise at every stage" : "S čím pomůžeme"}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 100}>
              <a
                href={en ? "/en/contact" : "#kontakt"}
                className="group flex h-full flex-col border border-line bg-paper p-9 transition-all duration-500 ease-luxe hover:-translate-y-1 hover:border-bronze"
              >
                <service.icon size={26} strokeWidth={1.3} className="text-bronze-deep" />
                <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.01em]">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-[14.5px] leading-[1.7] text-muted">
                  {service.text}
                </p>
                <span className="mt-8 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em]">
                  {service.cta}
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
  );
}
