import { Award, ChevronRight, Clock3, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";
import ValuationForm from "@/components/ValuationForm";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { SiteLocale } from "@/lib/locale";

const COPY = {
  cs: {
    home: "Úvod",
    breadcrumb: "Odhad ceny nemovitosti",
    eyebrow: "Pro majitele",
    title: "Za kolik prodáte svou nemovitost?",
    description:
      "Vyplňte pár údajů a do 24 hodin dostanete odhad tržní ceny od makléře, který vaši lokalitu skutečně zná. Zdarma, nezávazně a bez obcházení — pracujeme výhradně v exkluzivním zastoupení.",
    benefits: [
      ["Do 24 hodin", "Orientační odhad vám zavolá makléř specializovaný na vaši lokalitu — žádný robot."],
      ["Z reálných prodejů", "Vycházíme z cen skutečně uzavřených obchodů v okolí, ne z inzertních přání."],
      ["Zdarma a nezávazně", "Odhad vás k ničemu nezavazuje. Rozhodnutí, co dál, je jen na vás."],
    ],
    sold: "Podívejte se, co jsme už prodali",
    soldHref: "/prodano",
    path: "/odhad-nemovitosti",
  },
  en: {
    home: "Home",
    breadcrumb: "Property valuation",
    eyebrow: "For property owners",
    title: "What could your property sell for?",
    description:
      "Tell us a few essentials and, within 24 hours, a specialist who genuinely knows your area will provide an informed view of its market value. Complimentary, without obligation and handled personally from the outset.",
    benefits: [
      ["Within 24 hours", "A local property specialist will call you with an initial valuation — never an automated estimate."],
      ["Based on completed sales", "We assess genuine nearby transactions and current demand, not optimistic asking prices."],
      ["Complimentary and without obligation", "The valuation costs nothing and does not commit you to selling. The next decision remains entirely yours."],
    ],
    sold: "See properties we have already sold",
    soldHref: "/en/sold",
    path: "/en/valuation",
  },
} as const;

const ICONS = [Clock3, Award, ShieldCheck];

export default function ValuationPageContent({ locale = "cs" }: { locale?: SiteLocale }) {
  const copy = COPY[locale];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: copy.home, path: locale === "en" ? "/en" : "/" },
          { name: copy.breadcrumb, path: copy.path },
        ])}
      />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label={locale === "en" ? "Breadcrumb" : "Drobečková navigace"} className="flex items-center gap-2 text-[12.5px] text-muted">
            <a href={locale === "en" ? "/en" : "/"} className="transition-colors hover:text-ink">{copy.home}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{copy.breadcrumb}</span>
          </nav>

          <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_520px] lg:gap-20">
            <div>
              <Reveal>
                <p className="eyebrow text-bronze-deep">{copy.eyebrow}</p>
                <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                  {copy.title}
                </h1>
                <p className="mt-5 max-w-xl text-[15.5px] leading-[1.7] text-muted">{copy.description}</p>
              </Reveal>
              <div className="mt-12 space-y-8">
                {copy.benefits.map(([title, text], i) => {
                  const Icon = ICONS[i];
                  return (
                    <Reveal key={title} delay={i * 80}>
                      <div className="flex gap-5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-line text-bronze">
                          <Icon size={20} strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="text-[16px] font-semibold tracking-[-0.01em]">{title}</p>
                          <p className="mt-1.5 max-w-md text-[14px] leading-[1.7] text-muted">{text}</p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
              <Reveal className="mt-12">
                <a
                  href={copy.soldHref}
                  className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-bronze-deep underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {copy.sold}
                </a>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <ValuationForm locale={locale} />
            </Reveal>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
