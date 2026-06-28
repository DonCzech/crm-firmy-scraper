import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { MODULES, MODULE_CATEGORIES } from "./_modules";

export const metadata: Metadata = {
  title: "Moduly Webera — Přehled funkcí",
  description:
    "12 modulů, které pokryjí každou potřebu vašeho webu. Články, SEO, e-shop, rezervace, formuláře, analytika, bezpečnost — všechno v jedné platformě.",
};

export default function FeaturesHubPage() {
  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <PlatformHeader forceSolid />

      {/* Hero — split layout with photo right */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white pt-[120px] lg:pt-[140px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.10), transparent 70%)" }}
        />
        <div className="relative mx-auto grid max-w-[1180px] gap-12 px-6 pb-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-28">
          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
              Moduly Webera
            </p>
            <h1
              className="font-sans font-semibold tracking-[-0.03em]"
              style={{ fontSize: "clamp(40px, 5.5vw, 78px)", lineHeight: "1.02" }}
            >
              {MODULES.length}+ modulů.<br />
              <span className="text-[#9ca3af]">Nula pluginů.</span>
            </h1>
            <p className="mt-7 max-w-[520px] text-[17px] leading-[1.6] text-[#4b5563]">
              {MODULES.length} připravených modulů ve {MODULE_CATEGORIES.length} kategoriích. Každý modul je hotová funkční jednotka — připravená,
              otestovaná, propojená s ostatními. Žádné stahování, žádné konflikty, žádné placení za pluginy.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/vybrat-design" className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#111]">
                Vyzkoušet zdarma <ArrowRight size={15} />
              </Link>
              <Link href="/cenik" className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a]">
                Zobrazit ceník
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
                {MODULE_CATEGORIES.length} kategorií · {MODULES.length} modulů
              </p>
              <h2
                className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: "1.08" }}
              >
                Vyberte si modul a podívejte se detailněji.
              </h2>
            </div>
            <div className="hidden flex-wrap gap-2 lg:flex">
              {MODULE_CATEGORIES.map((c) => (
                <span key={c} className="rounded-full border border-[#e5e7eb] bg-[#fafafa] px-3 py-1 text-[12px] font-medium text-[#4b5563]">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {MODULES.map((m) => (
              <Link
                key={m.slug}
                href={`/prehled-funkci/${m.slug}`}
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
                    Více o modulu <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
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
            Jednoduchá cena
          </p>
          <h2
            className="mx-auto max-w-[720px] font-sans font-semibold tracking-[-0.03em] text-[#0a0a0a]"
            style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: "1.05" }}
          >
            Všechny moduly<br />
            <span className="text-[#9ca3af]">v jedné ceně.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[15.5px] leading-[1.65] text-[#555]">
            Žádné limity podle plánu, žádné platby za moduly navíc. Vše, co tu vidíte, máte od prvního dne.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/cenik"
              className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:bg-[#222]"
            >
              Zobrazit ceník <ArrowRight size={16} />
            </Link>
            <Link
              href="/vybrat-design"
              className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a]/30"
            >
              Vybrat design
            </Link>
          </div>
        </div>
      </section>

      <PlatformFooter />
    </main>
  );
}
