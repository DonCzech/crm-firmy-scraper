"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import type { ModalTemplate } from "./onboarding/OnboardingModal";
import type { PlatformLocale } from "@/lib/platform-i18n";

const OnboardingModal = dynamic(
  () => import("./onboarding/OnboardingModal").then((m) => ({ default: m.OnboardingModal })),
  { ssr: false }
);

const LiveDesktopFrame = dynamic(
  () => import("@/app/ukazka-sablon/[key]/LiveFrames").then((m) => ({ default: m.LiveDesktopFrame })),
  { ssr: false }
);
const LiveMobileFrame = dynamic(
  () => import("@/app/ukazka-sablon/[key]/LiveFrames").then((m) => ({ default: m.LiveMobileFrame })),
  { ssr: false }
);

/* ── Animated count-up for KPI numbers (rAF + IntersectionObserver, no framer-motion) */
function CountUp({ to, suffix = "", duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0" + suffix);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        obs.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - t0) / (duration * 1000), 1);
          const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1;
          setDisplay(Math.round(ease * to) + suffix);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { rootMargin: "-80px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, suffix, duration]);
  return <span ref={ref}>{display}</span>;
}

/* ── Count-up that supports decimals (e.g. 4.9★) ─────────────────────────── */
function CountUpDecimal({ to, duration = 1.6, decimals = 1 }: { to: number; duration?: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState((0).toFixed(decimals));
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        obs.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - t0) / (duration * 1000), 1);
          const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1;
          setDisplay((ease * to).toFixed(decimals));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { rootMargin: "-80px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, decimals, duration]);
  return <span ref={ref}>{display}</span>;
}

/* ── Floating trust badge with entrance + gentle hover float ────────────── */
function FloatingBadge({
  className = "",
  delay = 0,
  iconBg,
  iconColor,
  eyebrowColor,
  label,
  value,
  icon,
}: {
  className?: string;
  delay?: number;
  iconBg: string;
  iconColor: string;
  eyebrowColor: string;
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{ animation: `fadeInBadge 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both` }}
    >
      <div
        className="float-badge flex items-center gap-3 rounded-2xl border border-[#ececec] bg-white p-3 pr-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.30)] backdrop-blur-sm"
        style={{ animation: `floatBadge ${4 + (delay * 6) % 3}s ease-in-out ${delay}s infinite` }}
      >
        <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-[0.14em] ${eyebrowColor}`}>{label}</div>
          <div className="mt-0.5 text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">{value}</div>
        </div>
      </div>
    </div>
  );
}

/* ── PageSpeed badge with animated 90–100 score ─────────────────────────── */
function PageSpeedBadge({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const [score, setScore] = useState(94);
  useEffect(() => {
    const id = setInterval(() => {
      setScore((s) => {
        const next = s + (Math.random() < 0.5 ? -1 : 1) + (Math.random() < 0.5 ? -1 : 1);
        return Math.max(90, Math.min(100, next));
      });
    }, 1300);
    return () => clearInterval(id);
  }, []);

  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className={className}
      style={{ animation: `fadeInBadge 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both` }}
    >
      <div
        className="float-badge flex items-center gap-3 rounded-2xl border border-[#ececec] bg-white p-3 pr-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.30)] backdrop-blur-sm"
        style={{ animation: "floatBadge 5s ease-in-out infinite" }}
      >
        <div className="relative grid h-12 w-12 place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r={radius} fill="none" stroke="#e8fbe8" strokeWidth="3" />
            <circle
              cx="18" cy="18" r={radius} fill="none" stroke="#0cce6b" strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)" }}
            />
          </svg>
          <span className="text-[15px] font-bold tracking-[-0.04em] tabular-nums text-[#0a0a0a]">{score}</span>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0a7a2f]">PageSpeed</div>
          <div className="mt-0.5 text-[12px] font-semibold text-[#0a0a0a]">90–100 · Mobile · Desktop</div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes fadeInBadge {
          from { opacity: 0; transform: translateY(18px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .float-badge { will-change: transform; }
      `}</style>
    </div>
  );
}

/* ── Interactive hotspot — pulsing dot with click-to-reveal mini badge ──── */
type HotspotTone = "green" | "indigo" | "emerald" | "amber" | "rose";

const HOTSPOT_TONES: Record<HotspotTone, { dot: string; ring: string; iconBg: string; iconColor: string; eyebrow: string }> = {
  green:   { dot: "bg-[#22c55e]", ring: "bg-[#22c55e]", iconBg: "bg-[#dcfce7]", iconColor: "text-[#15803d]", eyebrow: "text-[#15803d]" },
  indigo:  { dot: "bg-[#6366f1]", ring: "bg-[#6366f1]", iconBg: "bg-[#eef2ff]", iconColor: "text-[#4338ca]", eyebrow: "text-[#4338ca]" },
  emerald: { dot: "bg-[#10b981]", ring: "bg-[#10b981]", iconBg: "bg-[#d1fae5]", iconColor: "text-[#047857]", eyebrow: "text-[#047857]" },
  amber:   { dot: "bg-[#f59e0b]", ring: "bg-[#f59e0b]", iconBg: "bg-[#fef3c7]", iconColor: "text-[#b45309]", eyebrow: "text-[#b45309]" },
  rose:    { dot: "bg-[#f43f5e]", ring: "bg-[#f43f5e]", iconBg: "bg-[#fce7f3]", iconColor: "text-[#be185d]", eyebrow: "text-[#be185d]" },
};

function Hotspot({
  id, activeId, setActiveId,
  top, left, right, bottom,
  tone, label, value, detail, icon,
  side: tooltipSidePref,
  tooltipWidth = 260,
}: {
  id: string;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  top?: string; left?: string; right?: string; bottom?: string;
  tone: HotspotTone;
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  /** Force tooltip to open to a specific side. Defaults to opposite of dot's anchor. */
  side?: "left" | "right";
  tooltipWidth?: number;
}) {
  const open = activeId === id;
  const t = HOTSPOT_TONES[tone];
  const side = tooltipSidePref ?? (right ? "left" : "right");
  const tooltipPos = side === "right" ? "left-full ml-5" : "right-full mr-5";
  const originX = side === "right" ? "left" : "right";

  return (
    <div className="absolute z-30" style={{ top, left, right, bottom }}>
      <button
        type="button"
        data-hotspot={id}
        onClick={(e) => { e.stopPropagation(); setActiveId(open ? null : id); }}
        aria-label={label}
        aria-expanded={open}
        className="group relative grid h-7 w-7 place-items-center cursor-pointer"
      >
        {/* Subtle breathing aura — single soft pulse */}
        <span
          className="absolute inset-0 rounded-full bg-[#0a0a0a] opacity-0"
          style={{ animation: open ? "none" : "hotspotBreath 2.6s ease-out infinite" }}
        />

        {/* Minimal black circle with white + (rotates to × on open) */}
        <span
          className="relative grid h-[22px] w-[22px] place-items-center rounded-full bg-[#0a0a0a] text-white shadow-[0_4px_12px_rgba(0,0,0,0.30),0_0_0_1px_rgba(255,255,255,0.18)] group-hover:scale-[1.06]"
          style={{
            transform: open ? "rotate(45deg) scale(1.08)" : "rotate(0deg) scale(1)",
            transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${tooltipPos}`}
          style={{
            transformOrigin: `${originX} center`,
            width: `${tooltipWidth}px`,
            animation: "tooltipIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
          data-hotspot-tooltip
        >
            {/* Connector line from dot to tooltip */}
            <span
              className={`absolute top-1/2 h-px w-5 -translate-y-1/2 ${
                side === "right" ? "-left-5 origin-left" : "-right-5 origin-right"
              }`}
              style={{
                background: `linear-gradient(${side === "right" ? "to right" : "to left"}, transparent, rgba(255,255,255,0.4))`,
              }}
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/95 p-4 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.40),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              {/* Subtle gradient sheen */}
              <div
                className="pointer-events-none absolute inset-x-0 -top-px h-[1px]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
              />
              <div className="flex items-start gap-3">
                <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${t.iconBg} ${t.iconColor}`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${t.eyebrow}`}>{label}</div>
                  <div className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">{value}</div>
                </div>
              </div>
              <p className="mt-3 text-[12.5px] leading-[1.55] text-[#4b5563]">{detail}</p>
            </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(-50%) scale(0.88); }
          to   { opacity: 1; transform: translateY(-50%) scale(1); }
        }
        @keyframes hotspotBreath {
          0%   { transform: scale(1);   opacity: 0.55; }
          70%  { transform: scale(2.6); opacity: 0;    }
          100% { transform: scale(2.6); opacity: 0;    }
        }
      `}</style>
    </div>
  );
}

/* ── Reveal word-by-word with mask slide (CSS + IntersectionObserver, no framer-motion) */
function MaskReveal({
  children, delay = 0, className, style,
}: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { rootMargin: "-80px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <span
      ref={ref}
      style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
    >
      <span
        style={{
          display: "inline-block",
          transform: inView ? "translateY(0%)" : "translateY(110%)",
          transition: inView ? `transform 1.0s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s` : "none",
          ...style,
        }}
        className={className}
      >
        {children}
      </span>
    </span>
  );
}

/* ── Filterable templates gallery with category pills ──────────────────── */
interface TemplateItem {
  key: string;
  name: string;
  industry: string;
  category: string;
  src: string;
}

const TEMPLATE_LIST: TemplateItem[] = [
  { key: "barber-03",  name: "barber — 03",  industry: "Barbershop",     category: "Barbershop",     src: "/templates/barber-03/showcase/desktop-full.webp" },
  { key: "tattoo-01",  name: "tattoo — 01",  industry: "Tetování",       category: "Tetování",       src: "/templates/tattoo-01/hero-art.webp" },
  { key: "nails-03",   name: "nails — 03",   industry: "Nehtové studio", category: "Nehtové studio", src: "/templates/nails-03/about-portrait.webp" },
  { key: "reality-01", name: "reality — 01", industry: "Reality",        category: "Reality",        src: "/templates/reality-01/hero-bg.webp" },
  { key: "dental-01",  name: "dental — 01",  industry: "Stomatologie",   category: "Stomatologie",   src: "/templates/dental-01/hero-bg.webp" },
  { key: "peak-cut",   name: "peak — cut",   industry: "Barbershop",     category: "Barbershop",     src: "/templates/peak-cut/showcase/desktop-full.webp" },
  { key: "tattoo-02",  name: "tattoo — 02",  industry: "Tetování",       category: "Tetování",       src: "/templates/tattoo-02/hero-bg.jpg" },
  { key: "nails-02",   name: "nails — 02",   industry: "Nehtové studio", category: "Nehtové studio", src: "/templates/nails-02/gallery/gallery-1.webp" },
  { key: "reality-02", name: "reality — 02", industry: "Reality",        category: "Reality",        src: "/templates/reality-02/hero.jpg" },
  { key: "ortho-02",   name: "ortho — 02",   industry: "Stomatologie",   category: "Stomatologie",   src: "/templates/ortho-02/hero-bg.webp" },
  { key: "barber-04",  name: "barber — 04",  industry: "Barbershop",     category: "Barbershop",     src: "/templates/barber-04/showcase/desktop-full.webp" },
  { key: "solar-03",   name: "solar — 03",   industry: "Fotovoltaika",   category: "Fotovoltaika",   src: "/templates/solar-03/hero.webp" },
  { key: "ananda-01",  name: "ananda — 01",  industry: "Wellness",       category: "Wellness",       src: "/templates/ananda-01/service-2.jpg" },
  { key: "tattoo-03",  name: "tattoo — 03",  industry: "Tetování",       category: "Tetování",       src: "/templates/tattoo-03/gallery-7.jpg" },
  { key: "barber-01",  name: "barber — 01",  industry: "Barbershop",     category: "Barbershop",     src: "/templates/barber-01/preview.webp" },
  { key: "massage-01", name: "massage — 01", industry: "Wellness",       category: "Wellness",       src: "/templates/massage-01/gallery-1.webp" },
  { key: "arch-01",    name: "arch — 01",    industry: "Architektura",   category: "Architektura",   src: "/templates/arch-01/hero-1.webp" },
  { key: "ucetni-04",  name: "ucetni — 04",  industry: "Účetnictví",     category: "Účetnictví",     src: "/templates/ucetni-04/about.webp" },
];

/* Lazy-loads CSS background-image only when the element enters the viewport. */
function LazyBgDiv({
  src,
  className,
  style,
  role,
  "aria-label": ariaLabel,
  children,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  "aria-label"?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoaded(true); obs.disconnect(); }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, backgroundImage: loaded ? `url(${src})` : "none" }}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

function TemplatesGallery({ onOpen, locale = "cs" }: { onOpen: (tpl?: { key: string; name: string }) => void; locale?: PlatformLocale }) {
  const router = useRouter();
  const allLabel = locale === "en" ? "All" : "Vše";
  const categoryLabels: Record<string, string> = locale === "en"
    ? {
        "Barbershop": "Barbershop",
        "Tetování": "Tattoo",
        "Nehtové studio": "Nail studio",
        "Reality": "Real estate",
        "Stomatologie": "Dental",
        "Wellness": "Wellness",
        "Fotovoltaika": "Solar",
        "Architektura": "Architecture",
        "Účetnictví": "Accounting",
      }
    : {};
  const industryLabel = (value: string) => categoryLabels[value] ?? value;
  const [category, setCategory] = useState<string>("Vše");

  const catOrder = ["Barbershop", "Tetování", "Nehtové studio", "Reality", "Stomatologie", "Wellness", "Fotovoltaika", "Architektura", "Účetnictví"];
  const catCounts = TEMPLATE_LIST.reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + 1; return acc; }, {});
  const categories = [
    { label: "Vše", displayLabel: allLabel, count: TEMPLATE_LIST.length },
    ...catOrder.filter(c => catCounts[c]).map(c => ({ label: c, displayLabel: industryLabel(c), count: catCounts[c] })),
  ];

  const filtered = category === "Vše"
    ? TEMPLATE_LIST
    : TEMPLATE_LIST.filter(t => t.category === category);

  return (
    <>
      {/* Category pills */}
      <Reveal delay={0.1} className="mb-12 flex flex-wrap justify-center gap-2">
        {categories.map((c) => {
          const active = category === c.label;
          return (
            <button
              key={c.label}
              onClick={() => setCategory(c.label)}
              className={
                active
                  ? "inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-5 py-2 text-[13px] font-semibold text-white"
                  : "inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-5 py-2 text-[13px] font-medium text-[#374151] transition hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
              }
            >
              {c.displayLabel}
              <span
                className={
                  active
                    ? "rounded-full bg-white/15 px-1.5 py-0.5 text-[10.5px] font-bold"
                    : "rounded-full bg-[#f3f4f6] px-1.5 py-0.5 text-[10.5px] font-bold text-[#888]"
                }
              >
                {c.count}
              </span>
            </button>
          );
        })}
      </Reveal>

      {/* Cards grid — horizontal scroll on mobile, grid on sm+ */}
      <div className="flex gap-5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none lg:grid-cols-3 lg:gap-6">
        {filtered.map((t, i) => (
          <Reveal
            key={t.key}
            as="article"
            delay={i * 0.04}
            className="group cursor-pointer snap-start shrink-0 w-[78vw] sm:w-auto"
          >
            <div onClick={() => router.push(`/ukazka-sablon/${t.key}`)}>
              {/* Image with scroll-on-hover */}
              <LazyBgDiv
                src={t.src}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#fafafa] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] transition-[background-position,box-shadow] duration-[5000ms] ease-linear group-hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.18)] group-hover:[background-position:0%_100%]"
                style={{
                  backgroundSize: "100% auto",
                  backgroundPosition: "0% 0%",
                  backgroundRepeat: "no-repeat",
                  transitionDuration: "5000ms, 300ms",
                }}
                role="img"
                aria-label={t.name}
              >
                <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#0a0a0a]/85 via-[#0a0a0a]/0 to-[#0a0a0a]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="pointer-events-auto flex w-full items-center justify-center gap-2 p-4 sm:p-5">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/ukazka-sablon/${t.key}`); }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[12.5px] font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:px-5"
                    >
                      {locale === "en" ? "View preview" : "Zobrazit náhled"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpen({ key: t.key, name: t.name }); }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-[#0a0a0a] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] transition hover:bg-white/95 sm:px-5"
                    >
                      {locale === "en" ? "Start free" : "Začít zdarma"}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </LazyBgDiv>
              {/* Caption — name first, then industry */}
              <div className="mt-5">
                <div className="text-[17px] font-bold tracking-[-0.01em] text-[#0a0a0a]">{t.name}</div>
                <div className="mt-1 text-[13.5px] text-[#6b7280]">{industryLabel(t.industry)}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-[#e5e5e5] bg-[#fafafa] py-16 text-center">
          <p className="text-[14.5px] text-[#666]">
            {locale === "en"
              ? `We do not have a template for "${industryLabel(category)}" yet, but we are working on it.`
              : `Pro kategorii „${category}" zatím nemáme šablonu, ale pracujeme na tom.`}
          </p>
          <button
            onClick={() => setCategory("Vše")}
            className="mt-4 text-[13px] font-semibold text-[#6366f1] hover:underline"
          >
            {locale === "en" ? "Show all templates →" : "Zobrazit všechny šablony →"}
          </button>
        </div>
      )}
    </>
  );
}

/* ── Sticky CTA bar that fades in after hero ────────────────────────────── */
function StickyCTA({ onOpen, locale = "cs" }: { onOpen: () => void; locale?: PlatformLocale }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    function onScroll() {
      // Show after user scrolls past 100vh (= hero section)
      const heroHeight = window.innerHeight;
      setShow(window.scrollY > heroHeight * 0.85);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-4 pb-3 lg:px-8 lg:pb-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a]/95 px-5 py-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.50)] backdrop-blur md:px-7">
          <div className="hidden text-white md:block">
            <div className="text-[14.5px] font-semibold">{locale === "en" ? "A professional website in 5 minutes" : "Profesionální web za 5 minut"}</div>
            <div className="text-[12.5px] text-white/60">{locale === "en" ? "No credit card · Cancel anytime" : "Bez kreditní karty · Zrušíte kdykoli"}</div>
          </div>
          <div className="flex flex-1 items-center gap-2 md:flex-initial md:gap-3">
            <button
              onClick={onOpen}
              className="flex-1 rounded-full bg-[#22c55e] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#16a34a] md:flex-initial md:px-7"
            >
              {locale === "en" ? "Try for free" : "Vyzkoušet zdarma"}
            </button>
            <a
              href="#sablony"
              className="hidden rounded-full border border-white/20 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:border-white/50 sm:inline-block md:inline-block"
            >
              {locale === "en" ? "Templates" : "Šablony"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FAQ accordion ──────────────────────────────────────────────────────── */
function FAQSection({ locale = "cs" }: { locale?: PlatformLocale }) {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = locale === "en" ? [
    {
      q: "How does the 14-day trial work?",
      a: "You create a demo without a credit card. For 14 days you can test it, edit it, and show it to clients. If it is not right for you, you pay nothing. If it is, click Activate and add your billing details.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, with one click in the admin. No notice periods and no penalties. If you cancel mid-month, you only pay for the remaining days and nothing more next month.",
    },
    {
      q: "Is Webero really no-code?",
      a: "Yes, completely. Click text or an image directly on the page, edit it, and the system saves the change. No code, no backend, no HTML templates to touch.",
    },
    {
      q: "Can I connect my own domain?",
      a: "Of course. Add your domain in the admin, we will show you how to point DNS at your registrar, and the SSL certificate is handled automatically.",
    },
    {
      q: "How fast is the hosting?",
      a: "Your website runs on EU infrastructure with CDN coverage across Europe. The average PageSpeed score is 99/100 and pages load in about 1.2 seconds.",
    },
    {
      q: "What if I stop liking my template?",
      a: "You can switch templates anytime. Your content, photos, and contact details move over; only the design changes. No lost data.",
    },
    {
      q: "Will you help me set it up?",
      a: "Yes. We provide support by email and phone on business days. When your site is created, we can walk you through the demo, show you how editing works, and help connect your domain.",
    },
    {
      q: "What is Rezora and who needs it?",
      a: "Rezora is our booking system: team calendar, online payments, and SMS notifications. It suits services, salons, clinics, and wellness businesses. It costs 200 CZK/month on top of the base plan and is optional.",
    },
  ] : [
    {
      q: "Jak funguje 14denní zkušební doba?",
      a: "Vytvoříš si demo bez kreditní karty. Můžeš ho 14 dní zkoušet, upravovat, ukazovat klientům. Pokud ti to nesedne, prostě nic neplatíš. Pokud ano, klikneš na 'Aktivovat' a doplníš platební údaje.",
    },
    {
      q: "Mohu kdykoli zrušit?",
      a: "Ano, kdykoliv jedním klikem v administraci. Žádné výpovědní lhůty, žádné penále. Pokud zrušíš v polovině měsíce, doplatíš pouze zbylé dny a další měsíc už nic.",
    },
    {
      q: "Je Webero opravdu bez programování?",
      a: "Ano, kompletně. Klikneš na text nebo obrázek přímo ve stránce, upravíš ho, a systém změnu uloží. Žádný kód, žádný backend, žádné šablony k editaci v HTML.",
    },
    {
      q: "Můžu připojit vlastní doménu?",
      a: "Samozřejmě. V administraci stačí přidat doménu (např. mojefirma.cz), my ti řekneme jak nasměrovat DNS u tvého registrátora a SSL certifikát vyřídíme automaticky.",
    },
    {
      q: "Jak rychlý je hosting?",
      a: "Tvůj web běží na infrastruktuře v EU (Praha + Frankfurt) s CDN po celé Evropě. PageSpeed score je v průměru 99/100 a stránka se načte do 1.2 sekundy.",
    },
    {
      q: "Co když se mi šablona přestane líbit?",
      a: "Šablonu můžeš změnit kdykoliv. Tvůj obsah (texty, fotky, kontakt) se přenese, jen se obalí novým designem. Žádné ztracené data.",
    },
    {
      q: "Pomůžete mi s nastavením?",
      a: "Ano, máme českou podporu (e-mail i telefon, pracovní dny 9-17). Při založení webu projedeme s tebou demo, ukážeme jak měnit obsah, a pomůžeme s napojením domény.",
    },
    {
      q: "Co je Rezora a kdo ji potřebuje?",
      a: "Rezora je náš rezervační systém — kalendář pro tým, online platby, SMS notifikace. Hodí se pro služby, salóny, kliniky, wellness. Stojí 200 Kč/měs navíc k základnímu plánu. Není povinná.",
    },
  ];

  return (
    <section className="relative bg-[#fafafa]">
      <div className="mx-auto max-w-[1280px] px-6 py-28 lg:px-10 lg:py-36">

        <div className="mx-auto mb-16 max-w-[820px] text-center">
          <p
            className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]"
            style={{ letterSpacing: "0.16em" }}
          >
            {locale === "en" ? "FAQ" : "Časté otázky"}
          </p>
          <h2
            className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
            style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
          >
            {locale === "en" ? "Need to know more?" : "Něco vás zajímá?"}
          </h2>
        </div>

        <div className="mx-auto max-w-[820px]">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.04}>
              <div className="border-b border-[#ececec]">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#6366f1]"
                  aria-expanded={open === i}
                >
                  <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                    {faq.q}
                  </span>
                  <span
                    className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-[#e5e5e5] transition-all duration-300 ${
                      open === i ? "rotate-45 border-[#0a0a0a] bg-[#0a0a0a] text-white" : "text-[#0a0a0a]"
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-all duration-400 ease-out"
                  style={{
                    gridTemplateRows: open === i ? "1fr" : "0fr",
                    opacity: open === i ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-10 text-[15px] leading-[1.7] text-[#555]">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom — link to contact */}
        <Reveal delay={0.4} className="mx-auto mt-12 max-w-[820px] text-center">
          <p className="text-[14.5px] text-[#666]">
            {locale === "en" ? "Did not find the answer?" : "Nenašli jste odpověď?"}{" "}
            <a href="mailto:podpora@webero.co" className="font-semibold text-[#6366f1] hover:underline">
              {locale === "en" ? "Email us" : "Napište nám"}
            </a>{" "}
            {locale === "en" ? "or call" : "nebo zavolejte"}{" "}
            <a href="tel:+420776123456" className="font-semibold text-[#0a0a0a] hover:underline">
              +420 776 123 456
            </a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Minimal Apple-style pricing — one card, beautiful and simple ─────── */
function PricingSection({ onOpen, locale = "cs" }: { onOpen: () => void; locale?: PlatformLocale }) {
  const [annual, setAnnual] = useState(false);

  const features = locale === "en" ? [
    "99+ professional templates",
    "No-code live editor",
    "Custom domain + SSL",
    "EU hosting + CDN",
    "SEO basics + sitemap",
    "Human support",
  ] : [
    "99+ profesionálních šablon",
    "Live editor bez kódu",
    "Vlastní doména + SSL",
    "Hosting v EU + CDN",
    "SEO základ + sitemap",
    "Česká podpora",
  ];

  const comparisonRows = locale === "en" ? [
    { label: "Price", webero: "500 CZK/mo", wix: "600-1,200 CZK/mo", agency: "30,000+ CZK" },
    { label: "Launch time", webero: "5 minutes", wix: "30+ minutes", agency: "4-8 weeks" },
    { label: "Industry templates", webero: "99+ ✓", wix: "Generic", agency: "Custom (extra)" },
    { label: "Live editor", webero: "Click and edit", wix: "Drag & drop", agency: "None" },
    { label: "PageSpeed 90+", webero: "✓ out of the box", wix: "Usually no", agency: "Variable" },
    { label: "Support", webero: "✓", wix: "English docs", agency: "✓" },
    { label: "No vendor lock-in", webero: "✓", wix: "Lock-in", agency: "✓ but costly" },
  ] : [
    { label: "Cena",                webero: "500 Kč/měs",      wix: "600–1 200 Kč/měs",  agency: "30 000+ Kč" },
    { label: "Spuštění webu",        webero: "5 minut",         wix: "30+ minut",          agency: "4–8 týdnů" },
    { label: "Šablony pro váš obor", webero: "99+ ✓",          wix: "Univerzální",        agency: "Custom (extra)" },
    { label: "Live editor",          webero: "Klikni a uprav",  wix: "Drag & drop",        agency: "Žádný" },
    { label: "PageSpeed 90+",        webero: "✓ z krabice",     wix: "Zpravidla ne",       agency: "Variabilní" },
    { label: "Česká podpora",        webero: "✓",                wix: "EN/anglicky",        agency: "✓" },
    { label: "Bez vendor lock-in",   webero: "✓",                wix: "Lock-in",            agency: "✓ ale drahé" },
  ];

  return (
    <>
      {/* Section header */}
      <div className="mx-auto mb-16 max-w-[820px] text-center lg:mb-20">
        <p
          className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]"
          style={{ letterSpacing: "0.18em" }}
        >
          {locale === "en" ? "Pricing · Comparison" : "Ceník · Srovnání"}
        </p>
        <h2
          className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
          style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
        >
          {locale === "en" ? "One price." : "Jedna cena."}<br />
          <span className="text-[#9ca3af]">{locale === "en" ? "Everything included." : "Vše v ceně."}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] text-[#555]">
          {locale === "en"
            ? "No surprises. No upgrade maze. No hidden fees. Here is how Webero compares with the usual alternatives."
            : "Žádné překvapení. Žádné upgrady. Žádné skryté poplatky. Vedle vám ukazujeme, jak Webero stojí proti běžným alternativám."}
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#e5e5e5] bg-white p-1 shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-all ${
              !annual ? "bg-[#0a0a0a] text-white shadow-sm" : "text-[#555] hover:text-[#0a0a0a]"
            }`}
          >
            {locale === "en" ? "Monthly" : "Měsíčně"}
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold transition-all ${
              annual ? "bg-[#0a0a0a] text-white shadow-sm" : "text-[#555] hover:text-[#0a0a0a]"
            }`}
          >
            {locale === "en" ? "Yearly" : "Ročně"}
            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold transition-colors ${
              annual ? "bg-[#22c55e]/20 text-[#16a34a]" : "bg-[#f0fdf4] text-[#16a34a]"
            }`}>
              {locale === "en" ? "-2 months free" : "−2 měsíce zdarma"}
            </span>
          </button>
        </div>
      </div>

      {/* Split layout — Pricing card LEFT, Comparison table RIGHT */}
      <div className="mx-auto grid max-w-[1180px] items-start gap-8 lg:grid-cols-[460px_1fr] lg:gap-12">

        {/* ─────────── LEFT — pricing card ─────────── */}
        <div className="relative lg:sticky lg:top-[100px]">
          {/* Outer glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 -z-0 rounded-[40px] opacity-70"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 50%, rgba(99,102,241,0.20), transparent 70%)",
              filter: "blur(28px)",
            }}
          />

          <article className="relative overflow-hidden rounded-[28px] bg-[#0a0a0a] p-8 text-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] md:p-10">
            {/* Inner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.20), transparent 70%)",
              }}
            />

            <div className="relative">
              {/* Plan label */}
              <div className="mb-7 flex items-center justify-center">
                <span
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase text-white backdrop-blur"
                  style={{ letterSpacing: "0.14em" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                  {locale === "en" ? "Full plan" : "Plný plán"}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline justify-center gap-2">
                <span
                  className="font-sans font-bold tracking-[-0.05em] text-white"
                  style={{ fontSize: "clamp(72px, 9vw, 120px)", lineHeight: "0.85" }}
                >
                  {annual ? "417" : "500"}
                </span>
                <span className="text-[32px] font-semibold text-white">{locale === "en" ? "CZK" : "Kč"}</span>
              </div>
              <p className="mt-2 text-center text-[14.5px] text-white/55">
                {annual
                  ? (locale === "en" ? "per month · billed yearly (5,000 CZK) · excl. VAT" : "měsíčně · fakturováno ročně (5 000 Kč) · bez DPH")
                  : (locale === "en" ? "per month · excl. VAT" : "měsíčně · bez DPH")}
              </p>
              {annual && (
                <p className="mt-1 text-center text-[12.5px] font-semibold text-[#4ade80]">
                  {locale === "en" ? "Save 1,000 CZK per year" : "Ušetříte 1 000 Kč ročně"}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={onOpen}
                className="mt-8 block w-full rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0a0a0a] shadow-[0_8px_40px_rgba(255,255,255,0.12)] transition hover:bg-white/92 active:scale-[0.99]"
              >
                {locale === "en" ? "Try free for 14 days" : "Vyzkoušet zdarma 14 dní"}
              </button>
              <p className="mt-3 text-center text-[12.5px] text-white/55">
                {locale === "en" ? "No credit card · Cancel anytime" : "Bez kreditní karty · Zrušíte kdykoli"}
              </p>

              {/* Hairline divider */}
              <div className="my-8 h-px bg-white/10" />

              {/* Features */}
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[14px] text-white/90">
                    <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Add-on Rezora chip */}
              <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-white/85">
                <span>{locale === "en" ? "+ Rezora bookings" : "+ Rezora rezervace"}</span>
                <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-white">
                  {locale === "en" ? "+200 CZK" : "+200 Kč"}
                </span>
              </div>

              {/* Trust badges */}
              <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-white/10 pt-6 text-[12px] text-white/65">
                {[
                  { icon: "M12 2L4 6v6c0 4.5 3.4 8.6 8 9 4.6-.4 8-4.5 8-9V6l-8-4z M9 12l2 2 4-4", label: locale === "en" ? "SSL encryption" : "SSL šifrování" },
                  { icon: "M3 21V10l9-6 9 6v11M9 21v-7h6v7", label: locale === "en" ? "EU hosting" : "Hosting v EU" },
                  { icon: "M12 2L4 6v6c0 4.5 3.4 8.6 8 9 4.6-.4 8-4.5 8-9V6l-8-4z", label: "GDPR compliant" },
                  { icon: "M22 11.5a8.5 8.5 0 11-3.5-6.9M22 4l-8.5 8.5L10 9", label: locale === "en" ? "Human support" : "Česká podpora" },
                ].map((b) => (
                  <span key={b.label} className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[#22c55e]">
                      <path d={b.icon} />
                    </svg>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* ─────────── RIGHT — comparison table ─────────── */}
        <div>
          <div className="mb-6">
            <p
              className="mb-2 text-[11.5px] font-semibold uppercase text-[#6366f1]"
              style={{ letterSpacing: "0.18em" }}
            >
              {locale === "en" ? "Comparison" : "Srovnání"}
            </p>
            <h3
              className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontSize: "clamp(22px, 2.4vw, 30px)", lineHeight: "1.15" }}
            >
              {locale === "en" ? "Webero vs the other routes." : "Webero vs ostatní cesty."}
            </h3>
            <p className="mt-2 text-[14px] text-[#666]">
              {locale === "en" ? "The same essentials. A fraction of the price. No weeks of waiting." : "Stejné funkce. Zlomek ceny. Bez týdnů čekání."}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Desktop header row */}
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-[#ececec] bg-gradient-to-b from-[#fafafa] to-white sm:grid">
              <div className="p-4 text-[11px] font-bold uppercase text-[#888]" style={{ letterSpacing: "0.14em" }}>
                {locale === "en" ? "What you need" : "Co řešíte"}
              </div>
              <div className="relative border-l border-[#ececec] p-4 text-center">
                <div className="absolute left-1/2 top-0 h-[3px] w-[60%] -translate-x-1/2 rounded-b bg-[#6366f1]" />
                <div className="text-[11px] font-bold uppercase text-[#6366f1]" style={{ letterSpacing: "0.14em" }}>
                  Webero
                </div>
                <div className="mt-1 text-[12px] font-semibold text-[#0a0a0a]">{locale === "en" ? "Recommended" : "Doporučeno"}</div>
              </div>
              <div className="border-l border-[#ececec] p-4 text-center">
                <div className="text-[11px] font-bold uppercase text-[#888]" style={{ letterSpacing: "0.14em" }}>
                  Wix / Webflow
                </div>
                <div className="mt-1 text-[12px] text-[#666]">SaaS</div>
              </div>
              <div className="border-l border-[#ececec] p-4 text-center">
                <div className="text-[11px] font-bold uppercase text-[#888]" style={{ letterSpacing: "0.14em" }}>
                  {locale === "en" ? "Agency" : "Agentura"}
                </div>
                <div className="mt-1 text-[12px] text-[#666]">Custom</div>
              </div>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-1 gap-2 p-4 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:gap-0 sm:p-0 ${
                  i > 0 ? "border-t border-[#ececec]" : ""
                }`}
              >
                <div className="text-[13.5px] font-semibold text-[#0a0a0a] sm:p-4">{row.label}</div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#16a34a] sm:justify-center sm:border-l sm:border-[#ececec] sm:bg-[#22c55e]/[0.025] sm:p-4">
                  <span className="text-[10.5px] font-bold uppercase text-[#888] sm:hidden">Webero:</span>
                  {row.webero}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#666] sm:justify-center sm:border-l sm:border-[#ececec] sm:p-4">
                  <span className="text-[10.5px] font-bold uppercase text-[#888] sm:hidden">Wix/Webflow:</span>
                  {row.wix}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#666] sm:justify-center sm:border-l sm:border-[#ececec] sm:p-4">
                  <span className="text-[10.5px] font-bold uppercase text-[#888] sm:hidden">{locale === "en" ? "Agency:" : "Agentura:"}</span>
                  {row.agency}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[12px] text-[#888]">
            {locale === "en"
              ? "Competitor pricing as of 06/2026, converted to CZK. Actual offers may vary."
              : "Ceny konkurence k 06/2026, převedeny do CZK. Reálné nabídky se mohou lišit."}
          </p>
        </div>
      </div>
    </>
  );
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  city: string;
  photo: string;
  rating: number;
  date: string;
  verified?: boolean;
}

const TESTIMONIALS: Testimonial[] = [
  { rating: 5, quote: "Built my site over a weekend. The agency I talked to wanted $4,000 and 2 months — I got something more professional for a fraction of the price.", name: "Liam O'Connor", role: "Barbershop owner", city: "Dublin, IE", photo: "https://i.pravatar.cc/200?img=12", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Por fin algo que funciona de verdad. Los clientes empezaron a reservar solos a través de la web — yo solo subo fotos y actualizo los precios.", name: "Sofía Martín", role: "Esteticista", city: "Madrid, ES", photo: "https://i.pravatar.cc/200?img=49", date: "hace 1 mes", verified: true },
  { rating: 5, quote: "Ich bin Steuerberater und habe nie Code geschrieben. Webero versprach Klicken und Bearbeiten — und genau so ist es. Die Seite war noch am selben Nachmittag live.", name: "Andreas Berger", role: "Steuerberater", city: "Vienna, AT", photo: "https://i.pravatar.cc/200?img=33", date: "vor 3 Wochen", verified: true },
  { rating: 5, quote: "Przesiadłem się z Wix po pół roku. Czas ładowania skrócony o połowę, mobilna w końcu używalna, SEO z zera do prawdziwego ruchu organicznego.", name: "Mateusz Kowalski", role: "Stolarz", city: "Kraków, PL", photo: "https://i.pravatar.cc/200?img=68", date: "miesiąc temu", verified: true },
  { rating: 4, quote: "Les templates sont superbes, l'éditeur est réactif. Seul bémol — les polices personnalisées manquent encore. J'espère qu'ils les sortiront bientôt.", name: "Camille Laurent", role: "Fleuriste", city: "Lyon, FR", photo: "https://i.pravatar.cc/200?img=47", date: "il y a 2 mois", verified: true },
  { rating: 5, quote: "20 € al mese è un regalo. Prima pagavo 200 €/anno per l'hosting più 1.200 € all'agenzia. Ora costa meno e funziona meglio.", name: "Marco Ricci", role: "Autoscuola", city: "Milan, IT", photo: "https://i.pravatar.cc/200?img=53", date: "3 settimane fa", verified: true },
  { rating: 2, quote: "Rough start — couldn't connect my GoDaddy domain and waited nearly 3 days for support. Fine after they sorted it, but the launch delay was frustrating.", name: "James Whitfield", role: "Electrician", city: "Manchester, UK", photo: "https://i.pravatar.cc/200?img=15", date: "6 weeks ago" },
  { rating: 5, quote: "Perfekt für unsere Pension. Buchungsanfragen landen sofort in meiner Mail und auf dem Handy. Meine Frau pflegt die Seite selbst — fragt mich nie mehr.", name: "Lukas Hoffmann", role: "Pensionsbetreiber", city: "Salzburg, AT", photo: "https://i.pravatar.cc/200?img=60", date: "vor 1 Monat", verified: true },
  { rating: 5, quote: "Mă temeam că va arăta ca un alt site ieftin de template. Nu arată deloc așa. Arată ca o lucrare de agenție de 7.000 $, sincer.", name: "Elena Popescu", role: "Cosmetolog", city: "Bucharest, RO", photo: "https://i.pravatar.cc/200?img=44", date: "acum 2 săptămâni", verified: true },
  { rating: 3, quote: "Die Tierarzt-Vorlage war gut, aber eine Vermittlungs-Galerie fehlte. Ich musste mich mit einer normalen Galerie behelfen. Funktioniert — aber nicht ganz das, was ich wollte.", name: "Daniel Fischer", role: "Tierarzt", city: "Hamburg, DE", photo: "https://i.pravatar.cc/200?img=8", date: "vor 1 Monat" },
  { rating: 5, quote: "Drie microsites gelanceerd voor verschillende filialen. Elk een andere look, allemaal vanuit één account beheerd. Bespaart me uren per week.", name: "Anna Janssen", role: "Marketing manager", city: "Amsterdam, NL", photo: "https://i.pravatar.cc/200?img=20", date: "3 weken geleden", verified: true },
  { rating: 4, quote: "Paid for itself inside a month. 14 leads in the first 3 weeks, two turned into $5K+ jobs. The site is profit from here on out.", name: "Henrik Larsen", role: "Construction firm", city: "Copenhagen, DK", photo: "https://i.pravatar.cc/200?img=11", date: "5 weeks ago", verified: true },
  { rating: 5, quote: "Adoro che non ci sia lock-in. Il mio dominio rimane mio, posso esportare i contenuti in qualsiasi momento. Non sembra una trappola come altri strumenti.", name: "Isabella Romano", role: "Insegnante di lingue", city: "Florence, IT", photo: "https://i.pravatar.cc/200?img=32", date: "2 mesi fa", verified: true },
  { rating: 5, quote: "PageSpeed 98 sans que j'aie rien fait. C'était 42 avant. Google m'a mieux référencé et les visites organiques ont vraiment décollé.", name: "Charlotte Dubois", role: "Pâtissière", city: "Paris, FR", photo: "https://i.pravatar.cc/200?img=29", date: "il y a 1 mois", verified: true },
  { rating: 4, quote: "Muchas plantillas, pero necesito más variantes para restaurantes de delivery. Perfecto para un restaurante clásico, menos para comida para llevar.", name: "Diego Sánchez", role: "Propietario de bistró", city: "Barcelona, ES", photo: "https://i.pravatar.cc/200?img=58", date: "hace 3 semanas", verified: true },
  { rating: 5, quote: "Support replies fast, in plain English, and actually solves things. Not just docs links. Rare for a SaaS these days.", name: "Emma Thompson", role: "Music school owner", city: "Bristol, UK", photo: "https://i.pravatar.cc/200?img=25", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Migrated our dental practice site in one evening. Patients can request appointments straight from the homepage now — bookings up 38%.", name: "Dr. Nora Lindqvist", role: "Dentist", city: "Stockholm, SE", photo: "https://i.pravatar.cc/200?img=5", date: "1 month ago", verified: true },
  { rating: 5, quote: "The mobile editor is a game changer. I updated the menu on the train ride to work. Five years on WordPress and I never did that.", name: "Yannis Papadopoulos", role: "Restaurant owner", city: "Athens, GR", photo: "https://i.pravatar.cc/200?img=14", date: "3 weeks ago", verified: true },
  { rating: 4, quote: "Solid product, just wish the analytics dashboard were deeper. Right now I export to GA4. Otherwise zero complaints.", name: "Tara Williams", role: "Boutique owner", city: "Toronto, CA", photo: "https://i.pravatar.cc/200?img=23", date: "2 months ago", verified: true },
  { rating: 5, quote: "Presunul som 4 klientske stránky zo Squarespace na Webero. Všetky rýchlejšie, čistejšie, polovičné mesačné náklady. Klienti sú spokojnejší ako ja.", name: "Filip Novák", role: "Freelance dizajnér", city: "Bratislava, SK", photo: "https://i.pravatar.cc/200?img=51", date: "pred 6 týždňami", verified: true },
  { rating: 5, quote: "I'm 64 and built it myself. Didn't call my nephew once. That's the real test of any web tool, isn't it.", name: "Margaret Sullivan", role: "Pottery studio owner", city: "Cork, IE", photo: "https://i.pravatar.cc/200?img=10", date: "1 month ago", verified: true },
  { rating: 3, quote: "Templates look great but the photography library is limited. I had to source my own stock photos. Not a deal-breaker, just an extra step.", name: "Robert Kovač", role: "Real estate agent", city: "Zagreb, HR", photo: "https://i.pravatar.cc/200?img=3", date: "2 months ago" },
  { rating: 5, quote: "A integração com o Stripe foram 2 cliques. Recebi pagamentos no mesmo dia em que lancei. Da ideia à primeira receita em menos de 48 horas.", name: "Júlia Fernandes", role: "Criadora de cursos", city: "Lisbon, PT", photo: "https://i.pravatar.cc/200?img=24", date: "há 3 semanas", verified: true },
  { rating: 5, quote: "Honestly thought it was too good to be true at this price. Six months in, still no surprises. No upsells, no upgrades pushed.", name: "Aleksander Nilsen", role: "Photographer", city: "Oslo, NO", photo: "https://i.pravatar.cc/200?img=52", date: "1 month ago", verified: true },
  { rating: 4, quote: "Il supporto multilingua funziona, ma l'UX di modifica per le traduzioni potrebbe essere più fluida. A parte questo — lo uso per 3 dei miei siti.", name: "Beatrice Costa", role: "Agenzia di viaggi", city: "Naples, IT", photo: "https://i.pravatar.cc/200?img=36", date: "5 settimane fa", verified: true },
  { rating: 5, quote: "Our previous developer ghosted us mid-project. Found Webero through a Reddit thread, had a full new site live in 4 days.", name: "Connor McLean", role: "Gym owner", city: "Glasgow, UK", photo: "https://i.pravatar.cc/200?img=65", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Ich habe damit ein Nebenprojekt gestartet, ohne meinen Hauptjob aufzugeben. Die ganze Website abends in zwei Wochen aufgebaut.", name: "Hanna Müller", role: "Side-project Gründerin", city: "Berlin, DE", photo: "https://i.pravatar.cc/200?img=16", date: "vor 3 Wochen", verified: true },
  { rating: 2, quote: "Superbe dans la démo, mais je n'ai pas pu renouveler le SSL de mon domaine sans contacter le support. Deux fois. J'espère qu'ils automatisent ça.", name: "Frédéric Moreau", role: "Consultant", city: "Brussels, BE", photo: "https://i.pravatar.cc/200?img=64", date: "il y a 2 mois" },
  { rating: 5, quote: "I run a tattoo studio and the gallery template is genuinely well-designed. Customers spend twice as long browsing now.", name: "Mia Andersson", role: "Tattoo artist", city: "Gothenburg, SE", photo: "https://i.pravatar.cc/200?img=45", date: "4 weeks ago", verified: true },
  { rating: 5, quote: "The accessibility defaults are excellent. Passed our nonprofit's WCAG audit on the first try. That alone saved us thousands.", name: "David Cohen", role: "Nonprofit director", city: "Tel Aviv, IL", photo: "https://i.pravatar.cc/200?img=66", date: "1 month ago", verified: true },
  { rating: 4, quote: "Wish there was a built-in scheduling/calendar block. Using Calendly embed for now. Works, but native would be nicer.", name: "Olivia Brooks", role: "Wellness coach", city: "Melbourne, AU", photo: "https://i.pravatar.cc/200?img=21", date: "6 weeks ago", verified: true },
  { rating: 5, quote: "Přišel jsem z Webflow. Webero má 90 % designové síly za 10 % křivky učení. Pro mé potřeby je to ideální poměr.", name: "Tomáš Kubík", role: "Indie product founder", city: "Prague, CZ", photo: "https://i.pravatar.cc/200?img=54", date: "před 3 týdny", verified: true },
  { rating: 5, quote: "Set this up for my dad's plumbing business. He calls me whenever something needs changing — and now I can tell him to do it himself. Wins all around.", name: "Sienna Walker", role: "Daughter of a plumber", city: "Auckland, NZ", photo: "https://i.pravatar.cc/200?img=48", date: "1 month ago", verified: true },
  { rating: 5, quote: "Image optimization is doing the work I used to pay a developer for. Every photo I upload comes out looking sharp and loading fast.", name: "Niko Virtanen", role: "Wedding photographer", city: "Helsinki, FI", photo: "https://i.pravatar.cc/200?img=69", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Came for the price, stayed for the quality. The fact that a sub-$30/month tool produces this quality of output is genuinely impressive.", name: "Rachel Goldberg", role: "Boutique hotel owner", city: "Tel Aviv, IL", photo: "https://i.pravatar.cc/200?img=26", date: "5 weeks ago", verified: true },
  { rating: 4, quote: "Onboarding jest świetny, ale dokumentacja pomocy mogłaby być bardziej szczegółowa. Większość odkryłem klikając — co jest OK, ale mogłoby być szybciej.", name: "Adam Kowalewski", role: "Copywriter", city: "Warsaw, PL", photo: "https://i.pravatar.cc/200?img=57", date: "2 miesiące temu", verified: true },
  { rating: 5, quote: "Ik beheer een regionale bloemistenketen. Vijf locaties, vijf websites, één login. Het team werkt openingstijden bij op alle sites in minder dan een minuut.", name: "Sophie van der Berg", role: "Bloemenwinkelketen", city: "Rotterdam, NL", photo: "https://i.pravatar.cc/200?img=30", date: "1 maand geleden", verified: true },
  { rating: 5, quote: "First SaaS in years where I didn't feel like I was being upsold every screen. You pay, you get the product. Refreshing.", name: "Michael O'Brien", role: "Pub owner", city: "Belfast, UK", photo: "https://i.pravatar.cc/200?img=67", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Le glisser-déposer pour réorganiser les sections, c'est le genre de finition qu'on ne trouve que dans les outils d'entreprise coûteux. Un sentiment premium dès la première minute.", name: "Léa Bernard", role: "Studio de yoga", city: "Nice, FR", photo: "https://i.pravatar.cc/200?img=38", date: "il y a 2 semaines", verified: true },
  { rating: 5, quote: "Loaded my old WordPress export and rebuilt the whole thing in a day. Pages that used to take 4s now load in under a second.", name: "Viktor Petrov", role: "Travel blogger", city: "Sofia, BG", photo: "https://i.pravatar.cc/200?img=70", date: "3 weeks ago", verified: true },
  { rating: 4, quote: "Booking flow could use more customization, but for a $20 tool I genuinely can't complain. Already replaced 3 paid plugins.", name: "Ingrid Halvorsen", role: "Spa owner", city: "Bergen, NO", photo: "https://i.pravatar.cc/200?img=41", date: "1 month ago", verified: true },
  { rating: 5, quote: "I onboarded my whole team in 15 minutes. Even our least technical person was editing pages before lunch.", name: "Patrick Murphy", role: "Operations manager", city: "Limerick, IE", photo: "https://i.pravatar.cc/200?img=7", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Mehrsprachige Versionen in EN/DE/FR an einem Abend eingerichtet. Die Übersetzer lieben den Nebeneinanderansatz im Editor.", name: "Clara Hofer", role: "Hotelmanagerin", city: "Innsbruck, AT", photo: "https://i.pravatar.cc/200?img=43", date: "vor 5 Wochen", verified: true },
  { rating: 3, quote: "Form spam filter let through a wave of bot submissions last month. They fixed it within a week but it cost me an annoying weekend.", name: "Theodor Sandström", role: "Coach", city: "Malmö, SE", photo: "https://i.pravatar.cc/200?img=63", date: "6 weeks ago" },
  { rating: 5, quote: "Migrated from a custom-coded site I'd been paying $400/month to maintain. Now I spend the difference on actual marketing.", name: "Aiden Walsh", role: "Roofing contractor", city: "Cardiff, UK", photo: "https://i.pravatar.cc/200?img=59", date: "1 month ago", verified: true },
  { rating: 5, quote: "Cookie-Banner und DSGVO-Konformität direkt integriert. Ich musste keinen einzigen Gedanken daran verschwenden. Als deutsches Unternehmen ist das enorm.", name: "Maximilian Wagner", role: "Rechtsanwalt", city: "Munich, DE", photo: "https://i.pravatar.cc/200?img=17", date: "vor 3 Wochen", verified: true },
  { rating: 5, quote: "Started as a side experiment for a hobby project. Now it's my actual business. The site held up at 20K visits/day without breaking a sweat.", name: "Zara Khan", role: "Indie maker", city: "London, UK", photo: "https://i.pravatar.cc/200?img=39", date: "2 months ago", verified: true },
  { rating: 4, quote: "Het prijsvergelijkingstabel is uitstekend, maar ik wil graag kolommen kunnen nesten. Opgelost met een workaround — niet het einde van de wereld.", name: "Pieter de Vries", role: "SaaS-oprichter", city: "Eindhoven, NL", photo: "https://i.pravatar.cc/200?img=62", date: "4 weken geleden", verified: true },
  { rating: 5, quote: "Built a portfolio site for myself and got 3 inbound clients in the first month. The design templates clearly attract serious leads.", name: "Aurora Lindgren", role: "Brand designer", city: "Reykjavík, IS", photo: "https://i.pravatar.cc/200?img=35", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "We replaced 7 standalone microsites with Webero. Saved $11K/year in subscriptions and the brand finally looks consistent everywhere.", name: "Ravi Sharma", role: "Marketing director", city: "Dublin, IE", photo: "https://i.pravatar.cc/200?img=18", date: "1 month ago", verified: true },
  { rating: 5, quote: "Ich bin Legastheniker und die meisten Builder sind für mich eine Herausforderung — zu viel Text-UI. Weberos Icon-first-Ansatz hat den Unterschied gemacht.", name: "Tobias Engel", role: "Bäckereibesitzer", city: "Zurich, CH", photo: "https://i.pravatar.cc/200?img=56", date: "vor 2 Wochen", verified: true },
  { rating: 2, quote: "Image uploader was buggy with HEIC files from my iPhone for about 2 weeks. Fixed now, but I lost a launch deadline because of it.", name: "Greta Lindholm", role: "Wedding planner", city: "Tallinn, EE", photo: "https://i.pravatar.cc/200?img=46", date: "2 months ago" },
  { rating: 5, quote: "Poder pré-visualizar cada alteração no telemóvel antes de publicar é tudo. Chega de pânico com 'como é que isto fica no Android'.", name: "Bruno Ferreira", role: "Proprietário de café", city: "Porto, PT", photo: "https://i.pravatar.cc/200?img=55", date: "há 3 semanas", verified: true },
  { rating: 5, quote: "Ho usato Squarespace, Wix, Webflow, Framer e le pagine Shopify. Webero è il primo con cui non ho dovuto lottare con l'editor.", name: "Lucia Esposito", role: "Consulente e-commerce", city: "Rome, IT", photo: "https://i.pravatar.cc/200?img=27", date: "1 mese fa", verified: true },
  { rating: 5, quote: "Naše agentura nyní staví všechny SMB weby na Weberu místo WordPressu. Rychlejší dodání, méně tiketů od klientů, spokojenější zákazníci.", name: "Jakub Šťastný", role: "Majitel agentury", city: "Prague, CZ", photo: "https://i.pravatar.cc/200?img=50", date: "před 5 týdny", verified: true },
  { rating: 4, quote: "Form notifications could come with more context — right now I get 'new submission' and have to log in. Email digest would be ideal.", name: "Nina Berisha", role: "Therapist", city: "Pristina, XK", photo: "https://i.pravatar.cc/200?img=42", date: "1 month ago", verified: true },
  { rating: 5, quote: "Eine vier Jahre alte Drupal-Installation ersetzt. Das Migrationstool hat 380 Seiten verarbeitet, ohne dass ich es ständig überwachen musste.", name: "Stefan Müller", role: "Verleger", city: "Frankfurt, DE", photo: "https://i.pravatar.cc/200?img=19", date: "vor 3 Wochen", verified: true },
  { rating: 5, quote: "Customer-facing booking form converts at 14% — almost double what my old custom form was doing. Form UX matters more than I thought.", name: "Aoife Byrne", role: "Hairdresser", city: "Galway, IE", photo: "https://i.pravatar.cc/200?img=31", date: "1 month ago", verified: true },
  { rating: 5, quote: "A integração de webhooks me permitiu conectar ao nosso CRM interno em 20 minutos. Sem middleware, sem Zapier, só chamadas API limpas.", name: "Gabriel Costa", role: "CTO", city: "São Paulo, BR", photo: "https://i.pravatar.cc/200?img=22", date: "há 4 semanas", verified: true },
  { rating: 5, quote: "Bought it for my therapy practice. Patients book directly, fill intake forms, and pay deposits — all without me touching anything.", name: "Dr. Ananya Iyer", role: "Therapist", city: "Bangalore, IN", photo: "https://i.pravatar.cc/200?img=28", date: "1 month ago", verified: true },
  { rating: 3, quote: "Templates lean heavily 'modern minimal'. For my vintage record shop I wanted something more textured — had to heavily customize.", name: "Ezra Klein", role: "Record shop owner", city: "Brooklyn, US", photo: "https://i.pravatar.cc/200?img=4", date: "2 months ago" },
  { rating: 5, quote: "Construí el sitio, configuré Stripe y recibí mi primer pago internacional en 6 horas. Es un récord para cualquier producto que he usado.", name: "Joaquín Vega", role: "Instructor online", city: "Mexico City, MX", photo: "https://i.pravatar.cc/200?img=2", date: "hace 3 semanas", verified: true },
  { rating: 5, quote: "Der Domain-Transfer war problemlos. Die Dokumentation hat mich durch jede Registrar-Eigenheit geführt — sogar Namecheap, das notorisch schwierig ist.", name: "Lina Schneider", role: "Coach", city: "Cologne, DE", photo: "https://i.pravatar.cc/200?img=37", date: "vor 2 Wochen", verified: true },
  { rating: 5, quote: "Built two sites: one for my construction company, one for my wife's bakery. Both look custom, neither cost me a developer fee.", name: "Yusuf Yıldız", role: "Builder", city: "Istanbul, TR", photo: "https://i.pravatar.cc/200?img=61", date: "4 weeks ago", verified: true },
  { rating: 4, quote: "Wyszukiwarka na mojej stronie dokumentacji działa dobrze, ale mogłaby mieć lepsze dopasowanie rozmyte. Drobne zastrzeżenie w skądinąd świetnym produkcie.", name: "Marta Lewandowska", role: "Technical writer", city: "Gdańsk, PL", photo: "https://i.pravatar.cc/200?img=34", date: "6 tygodni temu", verified: true },
  { rating: 5, quote: "Die automatisch generierte Sitemap und das JSON-LD-Schema haben meine SEO-Position in 8 Wochen von Seite 3 auf Seite 1 für 4 Keywords gehoben.", name: "Kai Becker", role: "KFZ-Meister", city: "Stuttgart, DE", photo: "https://i.pravatar.cc/200?img=13", date: "vor 1 Monat", verified: true },
  { rating: 5, quote: "Honestly the cleanest admin UI I've used in years. No fake gamification, no badges, no 'unlock pro' popups. Just the tools.", name: "Elin Karlsson", role: "Studio owner", city: "Uppsala, SE", photo: "https://i.pravatar.cc/200?img=40", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Bei einem anderen SaaS habe ich beim Kündigen die Hälfte meiner Daten verloren. Webero lässt mich alles exportieren — Inhalte, Bilder, sogar Formulare — als ZIP.", name: "Ben Schwartz", role: "Unternehmensberater", city: "Vienna, AT", photo: "https://i.pravatar.cc/200?img=6", date: "vor 2 Monaten", verified: true },
  { rating: 5, quote: "Switched mid-product from a competitor. Customer support helped me migrate manually because the import didn't catch one section type.", name: "Ksenia Volkova", role: "Designer", city: "Riga, LV", photo: "https://i.pravatar.cc/200?img=9", date: "5 weeks ago", verified: true },
  { rating: 4, quote: "Los colores de marca se propagan por todo el sitio, lo cual es genial, pero me gustaría poder sobreescribirlos en una sección. Con CSS hay workaround, pero nativo sería más limpio.", name: "Mateo Ortiz", role: "Arquitecto", city: "Valencia, ES", photo: "https://i.pravatar.cc/200?img=1", date: "hace 1 mes", verified: true },
  { rating: 5, quote: "Got a call from a designer friend asking 'who built your site?' Told them me. They didn't believe me until I showed them the editor.", name: "Hana Kobayashi", role: "Tea house owner", city: "Kyoto, JP", photo: "https://i.pravatar.cc/200?img=26", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Der Einrichtungsassistent hat von Anfang an verstanden, dass ich ein technischer Laie bin. Keine herablassenden Tipps — nur klare Schritte nach vorne.", name: "Florian Klein", role: "Optiker", city: "Linz, AT", photo: "https://i.pravatar.cc/200?img=11", date: "vor 2 Wochen", verified: true },
  { rating: 5, quote: "Site speed jumped from PageSpeed 51 to 96 the day we migrated. Our Google Ads quality score went up and CPC dropped 18%.", name: "Brendan O'Sullivan", role: "Digital marketer", city: "Edinburgh, UK", photo: "https://i.pravatar.cc/200?img=65", date: "1 month ago", verified: true },
  { rating: 5, quote: "Built our nonprofit donation page with Stripe integration in 90 minutes. Raised €4,200 the first weekend.", name: "Saoirse Doyle", role: "Charity director", city: "Cork, IE", photo: "https://i.pravatar.cc/200?img=20", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Ho valutato 8 piattaforme per il lancio della nostra catena di ristoranti. Webero ha vinto per velocità, design e per il fatto che il team risponde davvero al telefono.", name: "Lorenzo Ferraro", role: "Gruppo ristorativo", city: "Bologna, IT", photo: "https://i.pravatar.cc/200?img=51", date: "4 settimane fa", verified: true },
  { rating: 4, quote: "Animations are tasteful by default — most builders go overboard. Wish there were a couple more presets but what's there is high quality.", name: "Petra Horvat", role: "Wellness coach", city: "Ljubljana, SI", photo: "https://i.pravatar.cc/200?img=44", date: "5 weeks ago", verified: true },
  { rating: 5, quote: "Pay-once-a-month-and-forget reliability. Site has been live for 11 months, zero downtime, zero maintenance from me.", name: "Niamh Kennedy", role: "Ceramicist", city: "Sligo, IE", photo: "https://i.pravatar.cc/200?img=47", date: "2 months ago", verified: true },
  { rating: 5, quote: "Ho mostrato l'editor a mia madre di 70 anni che voleva un sito per il suo club di lavoro a maglia. L'ha pubblicato in un pomeriggio.", name: "Antonio Russo", role: "Organizzatore di club", city: "Palermo, IT", photo: "https://i.pravatar.cc/200?img=14", date: "1 mese fa", verified: true },
  { rating: 5, quote: "O melhor onboarding que já vi num SaaS. Passo a passo mas nunca condescendente. Pareceu um designer sénior a guiar-me.", name: "Cecilia Almeida", role: "Arquiteta", city: "Lisbon, PT", photo: "https://i.pravatar.cc/200?img=32", date: "há 3 semanas", verified: true },
  { rating: 5, quote: "Our agency switched 14 client sites in one quarter. Net savings: €38K/year across the portfolio. Clients had zero complaints.", name: "Ivan Marković", role: "Agency owner", city: "Belgrade, RS", photo: "https://i.pravatar.cc/200?img=33", date: "6 weeks ago", verified: true },
  { rating: 4, quote: "I'd love a native Instagram feed block. The workaround works but a first-party version with caching would be killer for image-heavy brands.", name: "Mila Petković", role: "Influencer", city: "Skopje, MK", photo: "https://i.pravatar.cc/200?img=49", date: "1 month ago", verified: true },
  { rating: 5, quote: "Live preview while editing — what you see is genuinely what you publish. No 'looks different in preview' weirdness like with some competitors.", name: "Hugo Lindqvist", role: "Brewmaster", city: "Helsinki, FI", photo: "https://i.pravatar.cc/200?img=68", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Switched from a hand-coded site I built in 2019. The new one is faster, more accessible, and I don't have to remember how my own JS works.", name: "Sara Engström", role: "Indie dev", city: "Linköping, SE", photo: "https://i.pravatar.cc/200?img=23", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Ceny jsou přímočaré. Žádná falešná 'od X' čísla, žádná skrytá vyšší úroveň. 500 Kč/měsíc — to je to, co platíte. Osvěžující.", name: "Lukáš Polák", role: "Indie founder", city: "Brno, CZ", photo: "https://i.pravatar.cc/200?img=54", date: "před 1 měsícem", verified: true },
  { rating: 5, quote: "Genuinely thoughtful product. Every option I looked for was either there or had an obvious workaround. Rarely happens.", name: "Astrid Møller", role: "Coach", city: "Aarhus, DK", photo: "https://i.pravatar.cc/200?img=36", date: "3 weeks ago", verified: true },
  { rating: 3, quote: "Couldn't find a way to A/B test landing pages natively. Had to hack it with two pages and analytics. Would love a built-in solution.", name: "Ronan Phillips", role: "Growth marketer", city: "Brighton, UK", photo: "https://i.pravatar.cc/200?img=57", date: "1 month ago" },
  { rating: 5, quote: "Six months in. Site has paid for itself 50x over. The math is no longer interesting — I just keep using it because it works.", name: "Aida Hadžić", role: "Restaurant owner", city: "Sarajevo, BA", photo: "https://i.pravatar.cc/200?img=45", date: "2 months ago", verified: true },
  { rating: 5, quote: "Tengo una microcervecería. Cada semana actualizamos eventos y la lista de grifos — ambos se reflejan en el sitio en segundos. Antes le llevaba 2 días a mi desarrollador.", name: "Iván Romero", role: "Cervecería artesanal", city: "Bilbao, ES", photo: "https://i.pravatar.cc/200?img=64", date: "hace 4 semanas", verified: true },
  { rating: 5, quote: "Ich changelog pôsobí, akoby ho písali ľudia, ktorí produkt skutočne používajú. Každé vydanie opravuje práve tie veci, ktoré ma ticho trápili.", name: "Tomáš Varga", role: "Product manager", city: "Košice, SK", photo: "https://i.pravatar.cc/200?img=53", date: "pred 3 týždňami", verified: true },
  { rating: 5, quote: "I run a 9-location chain of dental clinics. Webero handles all sites with shared branding and per-location overrides. Beautifully architected.", name: "Dr. Mehmet Demir", role: "Clinic group owner", city: "Ankara, TR", photo: "https://i.pravatar.cc/200?img=12", date: "5 weeks ago", verified: true },
  { rating: 4, quote: "Injectarea de cod personalizat este permisă, ceea ce apreciez — adaug un mic fragment de analiză. Aș vrea doar să fie per pagină, nu doar la nivel de site.", name: "Tania Volkov", role: "Analist", city: "Bucharest, RO", photo: "https://i.pravatar.cc/200?img=29", date: "acum 6 săptămâni", verified: true },
  { rating: 5, quote: "Ich bin Notar — mein Beruf erfordert absolute Zuverlässigkeit. Die Seite läuft seit einem Jahr. Kein einziger Ausfall während der Geschäftszeiten.", name: "Walter Hoffmann", role: "Notar", city: "Graz, AT", photo: "https://i.pravatar.cc/200?img=8", date: "vor 2 Monaten", verified: true },
  { rating: 5, quote: "Formulare unterstützen Datei-Uploads, bedingte Felder, mehrere Schritte — alles, wofür ich früher einen Form-Builder für 40 $/Monat brauchte, ist bereits integriert.", name: "Brigitte Müller", role: "HR-Beraterin", city: "Bern, CH", photo: "https://i.pravatar.cc/200?img=25", date: "vor 3 Wochen", verified: true },
  { rating: 5, quote: "Email-based magic-link login for clients to view private project pages is a feature I didn't know I needed until I had it.", name: "Vesna Antić", role: "Project manager", city: "Novi Sad, RS", photo: "https://i.pravatar.cc/200?img=30", date: "1 month ago", verified: true },
  { rating: 5, quote: "Corrigi um erro de digitação pelo telemóvel durante uma reunião com cliente e recarreguei a página à frente deles. A expressão na cara deles valeu a assinatura.", name: "Adriana Câmara", role: "Advogada", city: "Porto, PT", photo: "https://i.pravatar.cc/200?img=43", date: "há 3 semanas", verified: true },
  { rating: 5, quote: "Mein Unternehmen läuft in einem kleinen Bergdorf in der Schweiz. Webero ist das seltene Tool, das nicht davon ausgeht, ich sei im Silicon Valley.", name: "Ueli Aebischer", role: "Bergführer", city: "Grindelwald, CH", photo: "https://i.pravatar.cc/200?img=15", date: "vor 4 Wochen", verified: true },
  { rating: 5, quote: "Switched our membership site from MemberSpace + WP. Webero's native gating saves us €120/month and works more reliably.", name: "Linnea Bergström", role: "Course creator", city: "Stockholm, SE", photo: "https://i.pravatar.cc/200?img=21", date: "5 weeks ago", verified: true },
];

function TestimonialCard({ t, locale = "cs" }: { t: Testimonial; locale?: PlatformLocale }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-[#ececec] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7 lg:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-0.5">
          {[0,1,2,3,4].map((s) => (
            <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill={s < t.rating ? "#f59e0b" : "#e5e5e5"}>
              <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
            </svg>
          ))}
        </div>
        {t.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-[10.5px] font-medium text-[#15803d]">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <path d="M5 12l5 5L20 7"/>
            </svg>
            {locale === "en" ? "Verified" : "Ověřeno"}
          </span>
        )}
      </div>
      <p className="mb-6 flex-1 text-[14.5px] leading-[1.6] text-[#1f2937] sm:text-[15px]">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3 border-t border-[#f1f1f1] pt-4">
        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.photo} alt={t.name} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold text-[#0a0a0a]">{t.name}</div>
          <div className="truncate text-[11.5px] text-[#666]">{t.role} · {t.city}</div>
        </div>
        <div className="hidden text-[10.5px] text-[#999] sm:block">{t.date}</div>
      </div>
    </article>
  );
}

function TestimonialsSlider({ locale = "cs" }: { locale?: PlatformLocale }) {
  const testimonials = locale === "en"
    ? TESTIMONIALS.filter((t) => /^[\x00-\x7F]+$/.test(`${t.quote} ${t.role} ${t.date}`))
    : TESTIMONIALS;
  const total = testimonials.length;
  const [perView, setPerView] = useState(1);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / perView));

  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [page, pageCount]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setPage((p) => (p + 1) % pageCount), 7000);
    return () => clearInterval(id);
  }, [paused, pageCount]);

  const go = (dir: -1 | 1) => setPage((p) => (p + dir + pageCount) % pageCount);

  const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / total).toFixed(1);
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: testimonials.filter((t) => t.rating === r).length,
    pct: (testimonials.filter((t) => t.rating === r).length / total) * 100,
  }));

  return (
    <div className="py-24 lg:py-36">
      <div className="mx-auto mb-12 max-w-[1280px] px-6 lg:mb-16 lg:px-10">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.16em" }}>
              {locale === "en" ? "Reviews" : "Recenze"}
            </p>
            <h2 className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]" style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}>
              {locale === "en" ? "What our customers say." : "Co říkají naši zákazníci."}
            </h2>
            <p className="mt-5 max-w-[560px] text-[15.5px] leading-[1.65] text-[#555]">
              {locale === "en"
                ? `${total}+ verified reviews from real users across Europe, the UK, and beyond. Nothing cherry-picked, nothing airbrushed.`
                : `${total}+ ověřených recenzí od skutečných uživatelů z celé Evropy, Velké Británie a dalších zemí. Nic nefiltrováno, nic nevybíráno.`}
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-[#ececec] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:p-6 lg:min-w-[380px]">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-baseline gap-1">
                <span className="text-[40px] font-semibold leading-none text-[#0a0a0a] sm:text-[44px]">{avgRating}</span>
                <span className="text-[14px] text-[#888]">/ 5</span>
              </div>
              <div className="mt-2 flex gap-0.5">
                {[0,1,2,3,4].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                    <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
                  </svg>
                ))}
              </div>
              <div className="mt-1.5 text-[11.5px] text-[#888]">{total} {locale === "en" ? "reviews" : "recenzí"}</div>
            </div>
            <div className="hidden h-16 w-px bg-[#ececec] sm:block" />
            <div className="flex-1 space-y-1">
              {ratingCounts.map((r) => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="w-3 text-[11px] font-medium text-[#666]">{r.stars}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" className="flex-shrink-0">
                    <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
                  </svg>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#f1f1f1]">
                    <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-[11px] tabular-nums text-[#888]">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div
        className="mx-auto max-w-[1280px] px-6 lg:px-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {Array.from({ length: pageCount }).map((_, pi) => (
              <div
                key={pi}
                className="grid w-full flex-shrink-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
                aria-hidden={pi !== page}
              >
                {testimonials.slice(pi * perView, pi * perView + perView).map((t) => (
                  <TestimonialCard key={t.name + t.date + pi} t={t} locale={locale} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center sm:justify-end">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={locale === "en" ? "Previous" : "Předchozí"}
              className="grid h-12 w-12 place-items-center rounded-full border border-[#e5e5e5] bg-white text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-x-0.5 hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
            >
              <ChevronLeft size={20} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={locale === "en" ? "Next" : "Další"}
              className="grid h-12 w-12 place-items-center rounded-full border border-[#e5e5e5] bg-white text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:translate-x-0.5 hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
            >
              <ChevronRight size={20} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reveal wrapper — now a static passthrough (animations stripped for
       premium feel). Hero text still animates via inline motion.div,
       and CountUp/CountUpDecimal handle their own scroll-triggered animation. */
function Reveal({
  children, className, style, as = "div",
}: {
  children: React.ReactNode;
  delay?: number; y?: number; duration?: number;
  className?: string; style?: React.CSSProperties;
  as?: "div" | "section" | "article" | "li" | "span" | "p" | "h2" | "h3";
}) {
  switch (as) {
    case "section":  return <section className={className} style={style}>{children}</section>;
    case "article":  return <article className={className} style={style}>{children}</article>;
    case "li":       return <li className={className} style={style}>{children}</li>;
    case "span":     return <span className={className} style={style}>{children}</span>;
    case "p":        return <p className={className} style={style}>{children}</p>;
    case "h2":       return <h2 className={className} style={style}>{children}</h2>;
    case "h3":       return <h3 className={className} style={style}>{children}</h3>;
    default:         return <div className={className} style={style}>{children}</div>;
  }
}

export interface CatalogTemplate {
  key: string;
  name: string;
  industry: string;
  previewPath: string | null;
  demoUrl: string | null;
}

const steps = [
  {
    title: "Vyberete šablonu",
    text: "Začnete hotovým webem pro konkrétní obor, ne prázdnou stránkou.",
  },
  {
    title: "Systém vytvoří demo",
    text: "Dostanete vlastní URL, náhled webu a přístup do administrace.",
  },
  {
    title: "Upravíte web kliknutím",
    text: "Texty, logo i obrázky měníte přímo ve stránce přes live editor.",
  },
];

/* ── Carousel slides ─────────────────────────────────────────────────────── */
interface Slide {
  key: string;
  src: string;
  src800: string;
}

const SLIDES: Slide[] = [
  { key: "arch-01",    src: "/templates/arch-01/hero-1.webp",       src800: "/templates/arch-01/hero-1-800.webp"      },
  { key: "clinic-02",  src: "/templates/clinic-02/hero-bg.webp",    src800: "/templates/clinic-02/hero-bg-800.webp"   },
  { key: "dental-01",  src: "/templates/dental-01/hero-bg.webp",    src800: "/templates/dental-01/hero-bg-800.webp"   },
  { key: "reality-01", src: "/templates/reality-01/hero-bg.webp",   src800: "/templates/reality-01/hero-bg-800.webp"  },
  { key: "solar-03",   src: "/templates/solar-03/hero.webp",        src800: "/templates/solar-03/hero-800.webp"       },
];

/**
 * Squarespace-style angled carousel (cloned 1:1 from squarespace.com source).
 * Transforms taken directly from their `angled-carousel__card` inline styles:
 *   pos  0  → translate(0,0) scale(1) rotate(0)               opacity 1
 *   pos ±1 → translateX(±(100% + 20px)) translateY(5%)        scale(0.88) rotate(±2deg)
 *   pos ±2 → translateX(±200%)         translateY(10%)        scale(0.80) rotate(±4deg)  opacity 0
 */
function Carousel3D({ onOpen: _onOpen, locale = "cs" }: { onOpen: () => void; locale?: PlatformLocale }) {
  void _onOpen; /* kept for API compat; clicks now navigate to detail page */
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragMovedRef = useRef(0);
  const n = SLIDES.length;

  /* Tracks slides that were just adjacent (|p|=1) and are exiting to |p|=2.
     We keep their <img> mounted for 1.2s so the CSS exit transition plays fully. */
  const [exitingSlides, setExitingSlides] = useState<Set<number>>(new Set());
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIdxRef = useRef(idx);

  /* Always-on autoplay — resets timer after each manual slide change */
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % n), 5500);
    return () => clearInterval(t);
  }, [n, idx]);

  /* When idx changes, keep <img> mounted for slides exiting to |p|=2 until CSS transition finishes */
  useEffect(() => {
    const prevIdx = prevIdxRef.current;
    prevIdxRef.current = idx;
    const exiting = new Set<number>();
    for (let i = 0; i < n; i++) {
      let oldP = ((i - prevIdx) % n + n) % n;
      if (oldP > Math.floor(n / 2)) oldP -= n;
      let newP = ((i - idx) % n + n) % n;
      if (newP > Math.floor(n / 2)) newP -= n;
      if (Math.abs(oldP) <= 1 && Math.abs(newP) >= 2) exiting.add(i);
    }
    if (exiting.size > 0) {
      setExitingSlides(exiting);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => setExitingSlides(new Set()), 1200);
    }
    return () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current); };
  }, [idx, n]);

  function next() { setIdx(i => (i + 1) % n); }
  function prev() { setIdx(i => (i - 1 + n) % n); }

  /* Drag-to-scrub: mouse + touch */
  function onDragStart(clientX: number) {
    dragStartX.current = clientX;
    dragMovedRef.current = 0;
    setIsDragging(true);
  }
  function onDragMove(clientX: number) {
    if (dragStartX.current === null) return;
    dragMovedRef.current = clientX - dragStartX.current;
  }
  function onDragEnd() {
    if (dragStartX.current === null) return;
    const dx = dragMovedRef.current;
    const threshold = 60; // px to count as swipe
    if (dx <= -threshold) next();
    else if (dx >= threshold) prev();
    dragStartX.current = null;
    dragMovedRef.current = 0;
    setIsDragging(false);
  }
  function handleCardClick(e: React.MouseEvent, slideKey: string) {
    if (Math.abs(dragMovedRef.current) > 8) {
      e.preventDefault(); e.stopPropagation();
      return;
    }
    router.push(`/ukazka-sablon/${slideKey}`);
  }

  function relPos(i: number) {
    let p = ((i - idx) % n + n) % n;
    if (p > Math.floor(n / 2)) p -= n;
    return p;
  }

  function cardTransform(p: number): { transform: string; opacity: number; zIndex: number } {
    if (p === 0)  return { transform: "translateX(0) translateY(0) scale(1) rotate(0deg)",                            opacity: 1,    zIndex: 30 };
    if (p === -1) return { transform: "translateX(calc(-100% - 20px)) translateY(5%) scale(0.88) rotate(-2deg)",      opacity: 1,    zIndex: 20 };
    if (p ===  1) return { transform: "translateX(calc(100% + 20px))  translateY(5%) scale(0.88) rotate( 2deg)",      opacity: 1,    zIndex: 20 };
    if (p === -2) return { transform: "translateX(-200%)              translateY(10%) scale(0.8)  rotate(-4deg)",     opacity: 0,    zIndex: 10 };
    if (p ===  2) return { transform: "translateX( 200%)              translateY(10%) scale(0.8)  rotate( 4deg)",     opacity: 0,    zIndex: 10 };
    /* fully off-screen */
    return p < 0
      ? { transform: "translateX(-200%) translateY(10%) scale(0.8) rotate(-4deg)", opacity: 0, zIndex: 0 }
      : { transform: "translateX( 200%) translateY(10%) scale(0.8) rotate( 4deg)", opacity: 0, zIndex: 0 };
  }

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: "1180px" }}>
      {/* Stage — bigger on mobile so center card is dominant; smaller on desktop to fit MBA 13" */}
      <div
        className="relative mx-auto w-[78vw] max-w-[540px] select-none sm:w-[60vw] md:w-[48vw] lg:w-[42vw]"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "pan-y",
        }}
        onMouseDown={(e) => { onDragStart(e.clientX); }}
        onMouseMove={(e) => isDragging && onDragMove(e.clientX)}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={(e) => { onDragStart(e.touches[0].clientX); }}
        onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
        onTouchEnd={onDragEnd}
      >
        <div className="relative w-full" style={{ aspectRatio: "16 / 10" }}>
          {SLIDES.map((slide, i) => {
            const p = relPos(i);
            const { transform, opacity, zIndex } = cardTransform(p);
            const isActive = p === 0;
            return (
              <div
                key={i}
                className="absolute inset-0 overflow-hidden rounded-[4px]"
                style={{
                  transform,
                  opacity,
                  zIndex,
                  transition: isDragging
                    ? "none"
                    : "transform 1.1s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.8s ease",
                  boxShadow: isActive
                    ? "0 30px 70px rgba(0,0,0,0.55)"
                    : "0 14px 40px rgba(0,0,0,0.45)",
                  willChange: "transform, opacity",
                }}
                onClick={(e) => handleCardClick(e, slide.key)}
              >
                {/* Render img for active+adjacent slides, plus slides in exit animation */}
                {(Math.abs(p) <= 1 || exitingSlides.has(i)) && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={slide.src800}
                    srcSet={`${slide.src800} 800w, ${slide.src} 1200w`}
                    sizes="(max-width: 768px) 80vw, 42vw"
                    alt={locale === "en" ? "Website template preview" : "Šablona webu — náhled"}
                    className="h-full w-full object-cover"
                    draggable={false}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                  />
                )}
                {/* Dimming overlay for inactive cards */}
                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ background: "rgba(0,0,0,0.35)", opacity: isActive ? 0 : 1 }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next — big invisible zones over the side cards */}
      <button
        aria-label={locale === "en" ? "Previous" : "Předchozí"}
        onClick={prev}
        className="group absolute left-0 top-0 z-40 hidden h-full w-[26%] cursor-pointer items-center justify-start pl-6 sm:flex"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/0 text-white/0 transition group-hover:bg-white/15 group-hover:text-white">
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </button>
      <button
        aria-label={locale === "en" ? "Next" : "Další"}
        onClick={next}
        className="group absolute right-0 top-0 z-40 hidden h-full w-[26%] cursor-pointer items-center justify-end pr-6 sm:flex"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/0 text-white/0 transition group-hover:bg-white/15 group-hover:text-white">
          <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </button>

      {/* Dot indicators */}
      <div className="mt-5 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`${locale === "en" ? "Template" : "Šablona"} ${i + 1}`}
            onClick={() => setIdx(i)}
            className="h-[4px] rounded-full transition-all duration-300"
            style={{
              width: i === idx ? "22px" : "5px",
              background: i === idx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface Props {
  locale?: PlatformLocale;
  approvedTemplates?: CatalogTemplate[];
  heroDesktopDemoUrl?: string | null;
  heroMobileDemoUrl?: string | null;
}

const INDUSTRY_LABELS: Record<string, string> = {
  cafe: "Kavárna", bakery: "Pekárna", restaurant: "Restaurace", barber: "Barbershop",
  hairdresser: "Kadeřnictví", wellness: "Wellness", beauty: "Beauty", nails: "Nehtové studio",
  fitness: "Fitness", physio: "Fyzioterapie", dentist: "Stomatologie", lawyer: "Advokát",
  realEstate: "Reality", auto: "Autoservis", cleaning: "Úklid", construction: "Stavebnictví",
  florist: "Květinářství", catering: "Catering", hotel: "Hotel", events: "Eventy",
  tattoo: "Tetování", veterinary: "Veterinář", clinic: "Beauty klinika", accounting: "Účetnictví",
  finance: "Finance", architecture: "Architektura", solar: "Fotovoltaika", photographer: "Foto",
  dj: "DJ", education: "Vzdělávání", pets: "Mazlíčci",
};

export function SaasLanding({ locale = "cs", approvedTemplates = [], heroDesktopDemoUrl = null, heroMobileDemoUrl = null }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<{ key: string; name: string } | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Inject video sources after page load — keeps LCP fast, video starts ASAP */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function start() {
      if (!video) return;
      const isMobile = window.innerWidth < 768;
      const webmSrc = isMobile ? "/hero-video-mobile.webm" : "/hero-video.webm";
      const mp4Src  = isMobile ? "/hero-video-mobile.mp4"  : "/hero-video.mp4";
      const s1 = document.createElement("source"); s1.src = webmSrc; s1.type = "video/webm";
      const s2 = document.createElement("source"); s2.src = mp4Src;  s2.type = "video/mp4";
      video.appendChild(s1);
      video.appendChild(s2);
      video.load();
      video.play().catch(() => {});
    }
    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
      return () => window.removeEventListener("load", start);
    }
  }, []);

  useEffect(() => {
    if (!activeHotspot) return;
    function handler(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-hotspot]") || t.closest("[data-hotspot-tooltip]")) return;
      setActiveHotspot(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveHotspot(null);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeHotspot]);

  function openModal(tpl?: { key: string; name: string }) {
    setActiveTemplate(tpl ?? null);
    setShowModal(true);
  }

  const en = locale === "en";

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* HERO — Squarespace-style: video bg + text + 3D carousel inside  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section
        id="start"
        className="relative overflow-hidden bg-[#0a0a0a]"
      >
        {/* Video — sources injected by JS after window load; dark bg shows until video plays */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          poster="/hero-poster.webp"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)]" />

        {/* Content stack — sized to fit MacBook Air 13" (≈800px) without scroll */}
        <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pb-6 pt-[88px] sm:px-6 sm:pt-[96px] lg:px-8">

          {/* Hero text + CTA */}
          <div className="mx-auto mb-7 max-w-[900px] text-center sm:mb-8">
            <h1
              className="font-sans font-bold"
              style={{
                fontSize: "clamp(48px, 5.5vw, 76px)",
                lineHeight: "1.08",
                letterSpacing: "-0.025em",
                color: "#ffffff",
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
              }}
            >
              <MaskReveal delay={0.05}>{en ? "Professional" : "Profesionální"}&nbsp;</MaskReveal>
              <MaskReveal delay={0.13}>{en ? "website" : "web"}</MaskReveal>
              <br />
              <MaskReveal delay={0.21}>{en ? "without" : "bez"}&nbsp;</MaskReveal>
              <MaskReveal delay={0.27}>{en ? "a developer." : "programátora."}</MaskReveal>
            </h1>

            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                onClick={() => openModal()}
                className="inline-flex h-[48px] items-center justify-center rounded-full bg-white px-10 text-[15px] font-semibold text-[#111] shadow-[0_4px_30px_rgba(0,0,0,0.35)] transition duration-200 hover:bg-white/95 hover:shadow-[0_8px_40px_rgba(0,0,0,0.45)] active:scale-[0.97]"
              >
                {en ? "Try for free" : "Vyzkoušet zdarma"}
              </button>
              <p className="text-[13px] text-white/65">
                {en ? "Start free. No credit card." : "Začít zdarma. Bez kreditní karty."}
              </p>
            </div>
          </div>

          {/* Angled carousel — inside the hero, on the video bg */}
          <div className="w-full">
            <Carousel3D locale={locale} onOpen={() => openModal()} />
          </div>

          <p className="mt-5 text-center text-[13.5px] text-white/55">
            {en ? "Join thousands of business owners building their websites with Webero." : "Připojte se k tisícům podnikatelů, kteří tvoří web na Weberu."}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CLIENT LOGOS — slim trust strip just under hero                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10 lg:py-16">
          <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c4c9d4]">
            {en ? "Websites built with Webero" : "Weby na Weberu"}
          </p>
          <div className="client-logos flex flex-wrap items-center justify-center gap-x-12 gap-y-8 text-[#9ca3af] sm:gap-x-16 lg:justify-between lg:gap-x-8">

            <div className="client-logo flex items-center gap-3" aria-label="Banka Creditas">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#9ca3af] text-[19px] font-bold text-white">C</span>
              <span className="text-[13px] font-bold leading-[1.05] tracking-[0.04em]">BANKA<br />CREDITAS</span>
            </div>

            <span className="client-logo text-[22.5px] font-normal tracking-[-0.01em]" aria-label="Studio Najbrt">Studio Najbrt</span>

            <span className="client-logo text-[32.5px] font-black leading-none tracking-[0.04em]" style={{ fontFamily: "Georgia, serif" }} aria-label="IBM">IBM</span>

            <span className="client-logo inline-flex items-baseline" aria-label="TEDx Prague">
              <span className="text-[25px] font-black tracking-tight">TED</span>
              <span className="-translate-y-1 text-[14px] font-bold">x</span>
              <span className="text-[25px] font-normal tracking-tight">Prague</span>
            </span>

            <span className="client-logo text-[22.5px] font-black tracking-[-0.02em]" aria-label="Skanska">SKANSKA</span>

            <div className="client-logo text-center leading-[1.05]" aria-label="Grandhotel Pupp Carlsbad">
              <div className="text-[9.5px] font-medium tracking-[0.32em]">GRANDHOTEL</div>
              <div className="text-[25px] font-light tracking-[0.04em]" style={{ fontFamily: "Georgia, serif" }}>PUPP</div>
              <div className="text-[8px] tracking-[0.4em] text-[#b8bcc4]">CARLSBAD</div>
            </div>

          </div>
        </div>
        <style jsx>{`
          .client-logos .client-logo { transition: color 0.35s ease, transform 0.35s ease, opacity 0.35s ease; cursor: default; }
          .client-logos:hover .client-logo { opacity: 0.4; }
          .client-logos .client-logo:hover { color: #0a0a0a; opacity: 1; transform: translateY(-2px); }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* §1  FEATURES — Light section with big product visual + 3 cards   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#fafafa]">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-28">

          {/* Header — animations disabled */}
          <div className="mx-auto mb-20 max-w-[820px] text-center">
            <p
              className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]"
              style={{ letterSpacing: "0.16em" }}
            >
              {en ? "All in one" : "Vše v jednom"}
            </p>
            <h2
              className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
            >
              {en ? "A website that feels like your business." : "Web jako vlastní byznys."}<br />
              <span className="text-[#9ca3af]">{en ? "No compromises." : "Bez kompromisů."}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] text-[#555]">
              {en
                ? "Templates, editor, hosting, SEO, and support. Everything for one fair price, without a developer or an agency."
                : "Šablony, editor, hosting, SEO i česká podpora. Všechno za jednu férovou cenu — bez programátora a bez agentury."}
            </p>
          </div>

          {/* Big product visual — Apple Studio Display + iPhone side-by-side */}
          <Reveal delay={0.15} className="relative mx-auto mb-16 max-w-[1320px]">
            <div className="relative mx-auto flex flex-col items-center justify-center gap-8 pb-2 sm:flex-row sm:items-end sm:gap-8 md:gap-10">

              {/* ───── Apple Studio Display with live iframe + interactive hotspots ───── */}
              <div className="relative hidden w-full flex-1 max-w-[1040px] sm:block">
                <LiveDesktopFrame demoUrl={heroDesktopDemoUrl} maxWidth={1040} compact />

                <Hotspot
                  id="pagespeed" activeId={activeHotspot} setActiveId={setActiveHotspot}
                  top="38%" right="-32px"
                  side="left"
                  tone="green"
                  label={en ? "Speed & SEO" : "Rychlost & SEO"}
                  value="PageSpeed 90–100"
                  detail={en ? "Edge cache in 270+ cities, AVIF/WebP optimization, automatic sitemap, and JSON-LD. Built to be easy for Google to index." : "Edge cache ve 270+ městech, AVIF/WebP optimalizace, auto sitemap a JSON-LD. Google vás bude rád indexovat."}
                  icon={(
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
                    </svg>
                  )}
                />
              </div>

              {/* ───── iPhone with live mobile-viewport iframe + hotspots ───── */}
              <div className="relative flex-shrink-0">
                <LiveMobileFrame demoUrl={heroMobileDemoUrl} />

                <div className="hidden sm:block">
                <Hotspot
                  id="mobile-first" activeId={activeHotspot} setActiveId={setActiveHotspot}
                  top="42%" right="-34px"
                  side="left"
                  tooltipWidth={240}
                  tone="indigo"
                  label="Mobile-first"
                  value={en ? "Perfect in your pocket" : "Perfektní i v kapse"}
                  detail={en ? "Every template is optimized for mobile. Tap-to-call, native sharing, and no horizontal scroll." : "Každá šablona je optimalizovaná pro mobil. Tap-to-call, native share, žádný horizontální scroll."}
                  icon={(
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="3" width="12" height="18" rx="2" />
                      <path d="M11 18h2" />
                    </svg>
                  )}
                />
                </div>
              </div>

            </div>
          </Reveal>

          {/* ── Unified bento grid: 3 feature cards + 4 stat cards ── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12">

            {/* ── Feature cards — span 4 cols each on 12-col grid ── */}
            {[
              {
                eyebrow: "Editor",
                stat: "100%",
                title: en ? "Click and edit." : "Klikni a uprav.",
                desc: en ? "No backend, no templates in code. You work directly on the page." : "Žádný backend, žádné šablony v kódu. Pracujete přímo na stránce.",
                accent: "#6366f1",
                glow: "rgba(99,102,241,0.14)",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                ),
              },
              {
                eyebrow: en ? "Templates" : "Šablony",
                stat: "99+",
                title: en ? "Pro templates." : "Profi šablon.",
                desc: en ? "Pick an industry and get a ready-made website with content. Add your business name and you are close." : "Vyberete obor, dostanete hotový web s obsahem. Stačí dopsat název firmy.",
                accent: "#0ea5e9",
                glow: "rgba(14,165,233,0.14)",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                ),
              },
              {
                eyebrow: en ? "Performance" : "Výkon",
                stat: "99/100",
                title: "PageSpeed.",
                desc: en ? "EU hosting, automatic image optimization, and SEO. No configuration needed." : "EU hosting, automatická optimalizace obrázků a SEO. Bez konfigurace.",
                accent: "#10b981",
                glow: "rgba(16,185,129,0.14)",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
                  </svg>
                ),
              },
            ].map((f, i) => (
              <Reveal
                key={f.eyebrow}
                delay={0.2 + i * 0.08}
                as="article"
                className="group relative col-span-2 overflow-hidden rounded-2xl border border-[#e8e8ef] bg-white p-6 sm:col-span-1 sm:p-8 lg:col-span-4 transition-all duration-500 ease-out hover:-translate-y-[4px] hover:shadow-[0_24px_56px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)]"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: `radial-gradient(ellipse 100% 70% at 10% -10%, ${f.glow}, transparent 60%)` }}
                />
                {/* Icon + label */}
                <div className="relative mb-5 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${f.accent} 0%, ${f.accent}bb 100%)`, boxShadow: `0 4px 14px ${f.glow}` }}
                  >
                    {f.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: f.accent }}>{f.eyebrow}</span>
                </div>
                {/* Big stat */}
                <div
                  className="relative mb-2 font-bold leading-none tracking-[-0.045em] text-[#0a0a0a]"
                  style={{ fontSize: "clamp(36px, 4.5vw, 60px)" }}
                >
                  {f.stat}
                </div>
                <h3 className="relative text-[17px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">{f.title}</h3>
                <p className="relative mt-2.5 text-[13.5px] leading-[1.7] text-[#6b7280]">{f.desc}</p>
                {/* Bottom line */}
                <div
                  className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 ease-out group-hover:w-full"
                  style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }}
                />
              </Reveal>
            ))}

            {/* ── Stat cards — span 3 cols each on 12-col grid ── */}
            {[
              { value: 500, suffix: "+",    label: en ? "Active websites" : "Aktivních webů", sub: en ? "Across the Czech Republic" : "Po celé ČR", decimals: 0 },
              { value: 99,  suffix: "/100", label: "PageSpeed",          sub: "Google Lighthouse",       decimals: 0 },
              { value: 4.9, suffix: "★",   label: en ? "Client rating" : "Hodnocení klientů", sub: en ? "Average from 200+ reviews" : "Průměr ze 200+ recenzí", decimals: 1 },
              { value: 5,   suffix: " min", label: en ? "Demo launch" : "Spuštění demo", sub: en ? "From template to website" : "Od šablony po web", decimals: 0 },
            ].map((s, i) => (
              <Reveal
                key={s.label}
                delay={0.38 + i * 0.07}
                as="div"
                className="group col-span-1 flex flex-col justify-between rounded-2xl border border-[#e8e8ef] bg-white p-5 sm:p-7 transition-all duration-400 lg:col-span-3 hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]"
              >
                <div
                  className="mb-3 font-bold leading-none tracking-[-0.04em] text-[#0a0a0a]"
                  style={{ fontSize: "clamp(26px, 3.5vw, 46px)" }}
                >
                  {s.decimals === 1 ? (
                    <span><CountUpDecimal to={s.value} duration={1.8} decimals={1} />{s.suffix}</span>
                  ) : (
                    <CountUp to={s.value} suffix={s.suffix} duration={1.8} />
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#0a0a0a]">{s.label}</div>
                  <div className="mt-0.5 text-[12.5px] text-[#9ca3af]">{s.sub}</div>
                </div>
              </Reveal>
            ))}

          </div>
        </div>
      </section>



      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* §2  PRODUKTY — Dark, 2x2 grid of product categories              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="jak-to-funguje" className="relative overflow-hidden bg-[#0a0a0a] text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.10), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1280px] px-6 py-24 lg:px-10 lg:py-32">

          <div className="mx-auto mb-14 max-w-[820px] lg:mb-20">
            <p
              className="mb-5 text-[12px] font-semibold uppercase text-[#a5b4fc]"
              style={{ letterSpacing: "0.16em" }}
            >
              {en ? "Webero products" : "Produkty Webero"}
            </p>
            <h2
              className="font-sans font-semibold tracking-[-0.025em] text-white"
              style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
            >
              {en ? "Thousands of needs." : "Tisíce potřeb."}<br />
              <span className="text-white/55">{en ? "One solid solution." : "Jedno solidní řešení."}</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">

            {/* Webové stránky */}
            <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] transition-colors hover:border-white/25">
              <div className="p-8 lg:p-10">
                <h3 className="font-sans font-semibold tracking-[-0.02em] text-white" style={{ fontSize: "clamp(26px, 2.2vw, 34px)", lineHeight: "1.1" }}>
                  {en ? "Websites" : "Webové stránky"}
                </h3>
                <p className="mt-4 max-w-[460px] text-[15px] leading-[1.65] text-white/65">
                  {en
                    ? "A complete business website with dozens of sections, a blog, and contact forms. Built to look and feel like serious web work."
                    : "Plnohodnotná firemní prezentace s desítkami sekcí, blogem a kontaktními formuláři. Patří k nejlépe zpracovaným webům na internetu."}
                </p>
              </div>
              <div className="relative mt-auto h-[280px] overflow-hidden px-6 sm:h-[320px] lg:h-[380px] lg:px-10">
                <div className="absolute right-6 top-6 h-[230px] w-[78%] overflow-hidden rounded-t-xl border border-white/10 bg-[#141414] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:h-[260px] lg:right-10 lg:h-[290px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/templates/peak-cut/showcase/desktop-hero.webp" alt="Premium web — Peak Cut" className="h-full w-full object-cover object-top" loading="lazy" />
                </div>
                <div className="absolute -bottom-2 left-6 h-[170px] w-[62%] overflow-hidden rounded-t-xl border border-white/10 bg-[#141414] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:h-[190px] lg:left-10 lg:h-[210px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/templates/barber-03/showcase/desktop-hero.webp" alt="Premium web — Barber 03" className="h-full w-full object-cover object-top" loading="lazy" />
                </div>
              </div>
            </article>

            {/* Landing pages */}
            <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] transition-colors hover:border-white/25">
              <div className="p-8 lg:p-10">
                <h3 className="font-sans font-semibold tracking-[-0.02em] text-white" style={{ fontSize: "clamp(26px, 2.2vw, 34px)", lineHeight: "1.1" }}>
                  Landing pages
                </h3>
                <p className="mt-4 max-w-[460px] text-[15px] leading-[1.65] text-white/65">
                  {en
                    ? "One-page websites for campaigns, lead capture, and fast conversion. Strong performance, clean design, and A/B variants in minutes."
                    : "Jednostránkové weby pro kampaně, sbírání leadů a rychlou konverzi. Vysoký výkon, čistý design, A/B varianty během minut."}
                </p>
              </div>
              <div className="relative mt-auto flex h-[280px] items-end justify-center overflow-hidden sm:h-[320px] lg:h-[380px]">
                <div className="relative z-10 h-[260px] w-[150px] overflow-hidden rounded-t-[26px] border border-white/15 bg-[#141414] p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] sm:h-[300px] sm:w-[170px] lg:h-[360px] lg:w-[200px]">
                  <div className="absolute left-1/2 top-1 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/10" />
                  <div className="h-full w-full overflow-hidden rounded-t-[20px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/templates/barber-03/showcase/mobile-hero.webp" alt={en ? "Mobile landing page" : "Mobilní landing"} className="h-full w-full object-cover object-top" loading="lazy" />
                  </div>
                </div>
                <div className="absolute -right-4 bottom-6 hidden h-[230px] w-[140px] -rotate-[8deg] overflow-hidden rounded-t-[22px] border border-white/15 bg-[#141414] p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:block lg:h-[280px] lg:w-[160px]">
                  <div className="h-full w-full overflow-hidden rounded-t-[16px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/templates/peak-cut/showcase/mobile-hero.webp" alt={en ? "Mobile landing page variant" : "Mobilní landing varianta"} className="h-full w-full object-cover object-top" loading="lazy" />
                  </div>
                </div>
              </div>
            </article>

            {/* E-shop a katalog */}
            <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] transition-colors hover:border-white/25">
              <div className="p-8 lg:p-10">
                <h3 className="font-sans font-semibold tracking-[-0.02em] text-white" style={{ fontSize: "clamp(26px, 2.2vw, 34px)", lineHeight: "1.1" }}>
                  {en ? "E-shop and catalog" : "E-shop a katalog"}
                </h3>
                <p className="mt-4 max-w-[460px] text-[15px] leading-[1.65] text-white/65">
                  {en
                    ? "Sell products and services directly from your site. Stripe, invoices, inventory, and delivery in one interface without plugins."
                    : "Prodávejte produkty i služby přímo z webu. Stripe, faktury, sklady a doprava — vše v jednom rozhraní bez pluginů."}
                </p>
              </div>
              <div className="relative mt-auto h-[280px] overflow-hidden px-6 sm:h-[320px] lg:h-[360px] lg:px-10">
                <div className="absolute inset-x-6 -bottom-2 h-[240px] overflow-hidden rounded-t-xl border border-white/10 bg-[#0f0f0f] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:h-[280px] lg:inset-x-10 lg:h-[320px]">
                  <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#141414] px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="ml-2 h-3 flex-1 rounded bg-white/[0.06]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
                    {["peak-cut/showcase/section-1.png","peak-cut/showcase/section-2.png","peak-cut/showcase/section-3.png","barber-03/showcase/section-1.png","barber-03/showcase/section-2.png","barber-03/showcase/section-3.png"].map((src, i) => (
                      <div key={i} className="overflow-hidden rounded-md border border-white/10 bg-[#141414]">
                        <div className="aspect-[4/3] w-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/templates/${src}`} alt={`${en ? "Product" : "Produkt"} ${i+1}`} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <div className="space-y-1 p-1.5">
                          <div className="h-1.5 w-3/4 rounded bg-white/15" />
                          <div className="h-1.5 w-1/2 rounded bg-[#a5b4fc]/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Content Hub */}
            <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] transition-colors hover:border-white/25">
              <div className="p-8 lg:p-10">
                <h3 className="font-sans font-semibold tracking-[-0.02em] text-white" style={{ fontSize: "clamp(26px, 2.2vw, 34px)", lineHeight: "1.1" }}>
                  Content Hub
                </h3>
                <p className="mt-4 max-w-[460px] text-[15px] leading-[1.65] text-white/65">
                  {en
                    ? "Blog, courses, and member areas. Create content and sell it as one-off access or a subscription. No developers."
                    : "Blog, kurzy, členská sekce. Vytvářejte obsah, nabízejte ho jednorázově nebo formou předplatného. Bez vývojářů."}
                </p>
              </div>
              <div className="relative mt-auto h-[280px] overflow-hidden px-6 sm:h-[320px] lg:h-[360px] lg:px-10">
                <div className="absolute inset-x-6 -bottom-2 h-[240px] overflow-hidden rounded-t-xl border border-white/10 bg-[#0f0f0f] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:h-[280px] lg:inset-x-10 lg:h-[320px]">
                  <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#141414] px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                  </div>
                  <div className="space-y-2.5 p-4 sm:space-y-3 sm:p-5">
                    {["peak-cut/showcase/section-4.png","barber-03/showcase/section-4.png","peak-cut/showcase/section-2.png"].map((src, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#141414] p-2 sm:gap-4 sm:p-3">
                        <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-md sm:h-16 sm:w-24">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/templates/${src}`} alt={`${en ? "Article" : "Článek"} ${i+1}`} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="h-1.5 w-12 rounded bg-[#a5b4fc]/40" />
                          <div className="h-2 w-full rounded bg-white/20" />
                          <div className="h-1.5 w-2/3 rounded bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* §3  TEMPLATES — Light gallery with browser-chrome cards          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="sablony" className="relative bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-28 lg:px-10 lg:py-36">

          {/* Header — animations disabled */}
          <div className="mx-auto mb-12 max-w-[820px] text-center">
            <p
              className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]"
              style={{ letterSpacing: "0.16em" }}
            >
              {en ? "Templates" : "Šablony"}
            </p>
            <h2
              className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
            >
              99+ {en ? "templates." : "šablon."}<br />
              <span className="text-[#9ca3af]">{en ? "For every industry." : "Pro každý obor."}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] text-[#555]">
              {en
                ? "Every template includes a homepage, subpages, images, and copy. Add your business name and publish."
                : "Každá šablona má homepage, podstránky, obrázky i texty. Stačí dopsat název firmy a publikovat."}
            </p>
          </div>

          <TemplatesGallery locale={locale} onOpen={(tpl) => openModal(tpl)} />

          {/* Bottom CTA */}
          <Reveal delay={0.3} className="mt-14 flex flex-col items-center gap-4">
            <a
              href="/ukazka-sablon"
              className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:bg-[#1a1a1a]"
            >
              {en ? "Browse all 99+ templates" : "Prohlédnout všech 99+ šablon"}
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="text-[13px] text-[#888]">{en ? "We add 2-3 new templates every month." : "Pravidelně přidáváme 2–3 nové šablony každý měsíc."}</p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* §3.5  TESTIMONIALS — Real customer quotes for social proof       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="reference" className="relative bg-[#fafafa]">
        <TestimonialsSlider locale={locale} />
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* §4.5  FAQ — Accordion with common questions                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <FAQSection locale={locale} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* §5  FINAL CTA — Split layout with device mockup                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#000]">
        {/* Decorative gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 80% at 100% 50%, rgba(99,102,241,0.22), transparent 70%), radial-gradient(40% 60% at 0% 50%, rgba(167,139,250,0.12), transparent 70%)",
          }}
        />
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-[1280px] px-6 py-28 lg:px-10 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">

            {/* LEFT — Headline + CTA (no animations on text — always white) */}
            <div>
              <p
                className="mb-6 text-[12px] font-semibold uppercase text-white"
                style={{ letterSpacing: "0.18em" }}
              >
                {en ? "Start today" : "Začněte ještě dnes"}
              </p>

              <h2
                className="font-sans font-bold text-white"
                style={{
                  fontSize: "clamp(40px, 6vw, 78px)",
                  lineHeight: "1.0",
                  letterSpacing: "-0.035em",
                  color: "#ffffff",
                }}
              >
                {en ? "Launch your" : "Spusťte svůj"}<br />
                {en ? "website now." : "web teď."}
              </h2>

              <Reveal delay={0.45} className="mt-7">
                <p className="max-w-[460px] text-[16.5px] leading-[1.65] text-white">
                  {en
                    ? "Start a demo, explore it, edit it, and decide only after you have seen it. No credit card, no developer."
                    : "Spusťte demo, projděte ho, upravte si ho — a teprve potom se rozhodněte. Bez kreditní karty, bez programátora."}
                </p>
              </Reveal>

              <Reveal delay={0.6} className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={() => openModal()}
                  className="inline-flex h-[58px] items-center justify-center rounded-full bg-[#22c55e] px-12 text-[16px] font-semibold text-white shadow-[0_8px_40px_rgba(34,197,94,0.35)] transition hover:bg-[#16a34a] hover:shadow-[0_12px_50px_rgba(34,197,94,0.50)] active:scale-[0.97]"
                >
                  {en ? "Try for free" : "Vyzkoušet zdarma"}
                </button>
                <a
                  href="#sablony"
                  className="text-[14.5px] font-semibold text-white transition hover:text-white/80"
                >
                  {en ? "Browse templates →" : "Prohlédnout šablony →"}
                </a>
              </Reveal>

              <Reveal delay={0.75} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white">
                <span className="flex items-center gap-1.5">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12l5 5L20 7"/></svg>
                  </span>
                  {en ? "No credit card" : "Bez kreditní karty"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12l5 5L20 7"/></svg>
                  </span>
                  {en ? "No commitment" : "Bez závazku"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12l5 5L20 7"/></svg>
                  </span>
                  {en ? "Cancel anytime" : "Zrušíte kdykoli"}
                </span>
              </Reveal>
            </div>

            {/* RIGHT — Device showcase: tilted MacBook with "Publikováno" badge */}
            <Reveal delay={0.3} className="relative">
              {/* Tilted MacBook */}
              <div
                className="relative mx-auto"
                style={{ maxWidth: "500px", transform: "perspective(1400px) rotateY(-8deg) rotateX(4deg)" }}
              >
                <div
                  className="relative rounded-[14px_14px_3px_3px] bg-[#1a1a1a] p-[10px]"
                  style={{ boxShadow: "0 60px 120px -30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)" }}
                >
                  <div className="absolute left-1/2 top-[4px] z-10 -translate-x-1/2">
                    <div className="h-[6px] w-[50px] rounded-b-[5px] bg-[#0a0a0a]" />
                  </div>
                  <div className="overflow-hidden rounded-[4px] bg-white">
                    <div className="flex items-center gap-1.5 border-b border-[#ececec] bg-[#f7f7f7] px-2.5 py-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                      <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                      <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                      <div className="mx-auto rounded bg-white px-2 py-0.5 text-[9px] text-[#666] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                        vasfirma.webero.co
                      </div>
                    </div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/templates/clinic-02/hero-bg.webp" alt={en ? "Beauty clinic website preview" : "Náhled webu beauty kliniky"} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
                {/* base */}
                <div className="relative mx-auto" style={{ width: "108%" }}>
                  <div className="mx-auto h-[10px] rounded-b-[10px] bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]" />
                </div>
              </div>

              {/* Floating "Publikováno" badge */}
              <div
                className="absolute -top-3 right-4 rounded-2xl border border-white/15 bg-[#0a0a0a]/90 p-3.5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] backdrop-blur md:right-0"
                style={{ minWidth: "190px" }}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#22c55e] text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#22c55e]">{en ? "Published" : "Publikováno"}</div>
                    <div className="text-[12.5px] font-semibold text-white">{en ? "3 seconds ago" : "Před 3 sekundami"}</div>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      <StickyCTA locale={locale} onOpen={() => openModal()} />

      {showModal && (
        <OnboardingModal
          locale={locale}
          onClose={() => { setShowModal(false); setActiveTemplate(null); }}
          initialTemplate={activeTemplate?.key}
          templateName={activeTemplate?.name}
          catalogTemplates={approvedTemplates.length > 0
            ? approvedTemplates.map((t): ModalTemplate => ({
                key: t.key,
                name: t.name,
                previewImage: t.previewPath ?? undefined,
                demoUrl: t.demoUrl ?? undefined,
              }))
            : undefined}
        />
      )}
    </>
  );
}
