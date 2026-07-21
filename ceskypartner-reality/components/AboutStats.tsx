"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteLocale } from "@/lib/locale";

type Stat = {
  value: number;
  decimals?: number;
  suffix: string;
  label: string;
};

const STATS: Stat[] = [
  { value: 15, suffix: "+", label: "let na realitnim trhu" },
  { value: 1200, suffix: "+", label: "prodanych nemovitosti" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "prumerne hodnoceni klientu" },
  { value: 98, suffix: " %", label: "uspesnost dokoncenych prodeju" },
];
const STATS_EN: Stat[] = [
  { value: 15, suffix: "+", label: "years in Czech real estate" },
  { value: 1200, suffix: "+", label: "properties successfully sold" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "average client rating" },
  { value: 98, suffix: "%", label: "successful completion rate" },
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

export default function AboutStats({ locale = "cs" }: { locale?: SiteLocale }) {
  const stats = locale === "en" ? STATS_EN : STATS;
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
    <div ref={ref} className="grid grid-cols-2 gap-x-10 gap-y-12 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <CountUp stat={stat} start={inView} locale={locale} />
          <p className="mt-3 text-[13px] leading-snug text-paper/55">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
