"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import type { SiteLocale } from "@/lib/locale";

type Stat = {
  value: number;
  decimals?: number;
  suffix: string;
  label: string;
};

const STATS_CS: Stat[] = [
  { value: 15, suffix: "+", label: "let na realitním trhu" },
  { value: 1200, suffix: "+", label: "prodaných nemovitostí" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "průměrné hodnocení klientů" },
  { value: 98, suffix: " %", label: "úspěšnost dokončených prodejů" },
];
const STATS_EN: Stat[] = [
  { value: 15, suffix: "+", label: "years in Czech real estate" },
  { value: 1200, suffix: "+", label: "properties successfully sold" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "average client rating" },
  { value: 98, suffix: "%", label: "completion rate on instructed sales" },
];

function CountUp({ stat, start, locale }: { stat: Stat; start: boolean; locale: SiteLocale }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(stat.value);
      return;
    }
    const duration = 1600;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(stat.value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, stat.value]);

  const formatted = display.toLocaleString(locale === "en" ? "en-GB" : "cs-CZ", {
    minimumFractionDigits: stat.decimals ?? 0,
    maximumFractionDigits: stat.decimals ?? 0,
  });

  return (
    <span className="text-[clamp(2.2rem,3.4vw,3.1rem)] font-semibold leading-none tracking-[-0.02em] text-paper">
      {formatted}
      <span className="text-bronze">{stat.suffix}</span>
    </span>
  );
}

export default function AboutStatement({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const stats = en ? STATS_EN : STATS_CS;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id={en ? "about" : "o-nas"} className="bg-ink text-paper">
      <div className="mx-auto grid max-w-site gap-16 px-6 py-28 md:py-36 lg:grid-cols-[1.15fr_1fr] lg:gap-24 xl:px-10">
        <Reveal>
          <p className="eyebrow text-paper/50">Český Partner</p>
          <h2 className="mt-6 text-[clamp(1.9rem,3.2vw,2.9rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
            {en ? "A property is more than an address. It is a life-shaping decision —" : "Nemovitost je víc než adresa. Je to rozhodnutí na celý život —"}
            <span className="text-bronze">
              {en ? " and we are the partner beside you." : " a my jsme jeho partner."}
            </span>
          </h2>
          <a
            href={en ? "/en/about" : "/o-nas"}
            className="group mt-10 inline-flex items-center gap-2 border border-paper/30 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
          >
            {en ? "Meet our team" : "Poznejte nás"}
            <ArrowUpRight
              size={15}
              strokeWidth={1.8}
              className="text-bronze transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </Reveal>

        <Reveal delay={150}>
          <p className="max-w-md text-[15px] leading-[1.75] text-paper/65">
            {en
              ? "From the first valuation to the handover of the keys, we pair in-depth knowledge of the Czech market with discreet, highly personal service — whether you are selling a family home, looking for somewhere new or building a property portfolio."
              : "Od prvního odhadu po předání klíčů. Spojujeme detailní znalost českého trhu s diskrétním, osobním přístupem — ať prodáváte rodinný dům, hledáte nový domov, nebo stavíte investiční portfolio."}
          </p>
          <div ref={ref} className="mt-12 grid grid-cols-2 gap-x-10 gap-y-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <CountUp stat={stat} start={inView} locale={locale} />
                <p className="mt-3 text-[13px] leading-snug text-paper/55">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
