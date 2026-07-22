import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { platformPath } from "@/lib/platform-i18n";
import { CATEGORIES, getDesignTemplates } from "@/lib/templates/design-catalog";
import { DesignGallery } from "./DesignGallery";

export const metadata: Metadata = {
  title: "Vybrat design — Webero",
  description:
    "Kompletní katalog šablon. Začněte konceptem webu místo prázdné stránky — 100+ designů pro každý obor, plně editovatelné.",
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

const COPY = {
  cs: {
    eyebrow: "Webové koncepty",
    title: "Přivítejte webové koncepty.",
    muted: "Změnit v nich můžete vše.",
    intro: "Jsou kombinací designu, obsahu a funkcí pro daný obor. Představují nejlepší startovní bod pro váš web — vyberte si oborový pohled a spusťte ho za 5 minut.",
    ctaTitle: "Nenašli jste obor?",
    ctaMuted: "Přidáváme každý den.",
    ctaText: "Napište nám, jaký koncept vám chybí — připravíme ho přednostně. Mezitím můžete kterýkoliv z existujících designů přizpůsobit svému oboru.",
    suggest: "Navrhnout obor",
    pricing: "Zobrazit ceník",
  },
  en: {
    eyebrow: "Website concepts",
    title: "Meet website concepts.",
    muted: "You can change everything.",
    intro: "They combine design, content, and features for a specific industry. Pick a starting point for your business and launch it in five minutes.",
    ctaTitle: "Did not find your industry?",
    ctaMuted: "We add new concepts every day.",
    ctaText: "Tell us which concept is missing and we will prioritize it. Until then, any existing design can be adapted to your industry.",
    suggest: "Suggest an industry",
    pricing: "View pricing",
  },
} as const;

export async function PickDesignPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const templates = await getDesignTemplates();
  const copy = COPY[locale];

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <PlatformHeader forceSolid locale={locale} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white pt-[120px] lg:pt-[140px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.10), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1280px] px-6 pb-12 lg:px-10 lg:pb-16">
          <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
            {copy.eyebrow}
          </p>
          <h1
            className="font-sans font-semibold tracking-[-0.03em]"
            style={{ fontSize: "clamp(40px, 5.5vw, 78px)", lineHeight: "1.02" }}
          >
            {copy.title}<br />
            <span className="text-[#4b5563]">{copy.muted}</span>
          </h1>
          <p className="mt-7 max-w-[640px] text-[17px] leading-[1.6] text-[#4b5563]">
            {copy.intro}
          </p>
        </div>
      </section>

      {/* Gallery with client-side filter */}
      <section className="overflow-x-clip bg-white">
        <div className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
          <DesignGallery templates={templates} categories={CATEGORIES} locale={locale} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-32">
          <h2
            className="mx-auto max-w-[720px] font-sans font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: "1.05" }}
          >
            {copy.ctaTitle}<br /><span className="text-white/55">{copy.ctaMuted}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[15.5px] leading-[1.65] text-white/65">
            {copy.ctaText}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="mailto:napady@webero.co" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              {copy.suggest} <ArrowRight size={16} />
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

export default async function PickDesignPage() {
  return <PickDesignPageContent locale="cs" />;
}
