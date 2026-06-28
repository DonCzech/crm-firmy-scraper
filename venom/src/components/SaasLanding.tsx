"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import type { ModalTemplate } from "./onboarding/OnboardingModal";

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
  { key: "barber-03",  name: "barber — 03",  industry: "Barbershop",     category: "Krása",   src: "/templates/barber-03/showcase/desktop-full.webp" },
  { key: "peak-cut",   name: "peak — cut",   industry: "Barbershop",     category: "Krása",   src: "/templates/peak-cut/showcase/desktop-full.webp" },
  { key: "barber-04",  name: "barber — 04",  industry: "Barbershop",     category: "Krása",   src: "/templates/barber-04/showcase/desktop-full.webp" },
  { key: "arch-01",    name: "arch — 01",    industry: "Architektura",   category: "Design",  src: "/templates/arch-01/hero-1.webp" },
  { key: "clinic-02",  name: "clinic — 02",  industry: "Beauty klinika", category: "Krása",   src: "/templates/clinic-02/hero-bg.webp" },
  { key: "dental-01",  name: "dental — 01",  industry: "Stomatologie",   category: "Zdraví",  src: "/templates/dental-01/hero-bg.webp" },
  { key: "reality-01", name: "reality — 01", industry: "Reality",        category: "Reality", src: "/templates/reality-01/hero-bg.webp" },
  { key: "solar-03",   name: "solar — 03",   industry: "Fotovoltaika",   category: "Řemeslo", src: "/templates/solar-03/hero.webp" },
  { key: "malir-02",   name: "malir — 02",   industry: "Řemeslo",        category: "Řemeslo", src: "/templates/malir-02/hero-1.webp" },
  { key: "barber-01",  name: "barber — 01",  industry: "Barbershop",     category: "Krása",   src: "/templates/barber-01/preview.webp" },
  { key: "tattoo-01",  name: "tattoo — 01",  industry: "Tetování",       category: "Krása",   src: "/templates/tattoo-01/hero-art.webp" },
  { key: "nails-03",   name: "nails — 03",   industry: "Nehtové studio", category: "Krása",   src: "/templates/nails-03/hero-bg.webp" },
  { key: "ortho-02",   name: "ortho — 02",   industry: "Ortodoncie",     category: "Zdraví",  src: "/templates/ortho-02/hero-bg.webp" },
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

function TemplatesGallery({ onOpen }: { onOpen: (tpl?: { key: string; name: string }) => void }) {
  const router = useRouter();
  const [category, setCategory] = useState<string>("Vše");

  const categories = [
    { label: "Vše",      count: TEMPLATE_LIST.length },
    { label: "Krása",    count: TEMPLATE_LIST.filter(t => t.category === "Krása").length },
    { label: "Zdraví",   count: TEMPLATE_LIST.filter(t => t.category === "Zdraví").length },
    { label: "Řemeslo",  count: TEMPLATE_LIST.filter(t => t.category === "Řemeslo").length },
    { label: "Reality",  count: TEMPLATE_LIST.filter(t => t.category === "Reality").length },
    { label: "Design",   count: TEMPLATE_LIST.filter(t => t.category === "Design").length },
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
              {c.label}
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

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {filtered.map((t, i) => (
          <Reveal
            key={t.key}
            as="article"
            delay={i * 0.04}
            className="group cursor-pointer"
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
                      Zobrazit náhled
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpen({ key: t.key, name: t.name }); }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-[#0a0a0a] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] transition hover:bg-white/95 sm:px-5"
                    >
                      Začít zdarma
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </LazyBgDiv>
              {/* Caption — name first, then industry */}
              <div className="mt-5">
                <div className="text-[17px] font-bold tracking-[-0.01em] text-[#0a0a0a]">{t.name}</div>
                <div className="mt-1 text-[13.5px] text-[#6b7280]">{t.industry}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-[#e5e5e5] bg-[#fafafa] py-16 text-center">
          <p className="text-[14.5px] text-[#666]">Pro kategorii „{category}" zatím nemáme šablonu, ale pracujeme na tom.</p>
          <button
            onClick={() => setCategory("Vše")}
            className="mt-4 text-[13px] font-semibold text-[#6366f1] hover:underline"
          >
            Zobrazit všechny šablony →
          </button>
        </div>
      )}
    </>
  );
}

/* ── Sticky CTA bar that fades in after hero ────────────────────────────── */
function StickyCTA({ onOpen }: { onOpen: () => void }) {
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
            <div className="text-[14.5px] font-semibold">Profesionální web za 5 minut</div>
            <div className="text-[12.5px] text-white/60">Bez kreditní karty · Zrušíte kdykoli</div>
          </div>
          <div className="flex flex-1 items-center gap-2 md:flex-initial md:gap-3">
            <button
              onClick={onOpen}
              className="flex-1 rounded-full bg-[#22c55e] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#16a34a] md:flex-initial md:px-7"
            >
              Vyzkoušet zdarma
            </button>
            <a
              href="#sablony"
              className="hidden rounded-full border border-white/20 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:border-white/50 sm:inline-block md:inline-block"
            >
              Šablony
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FAQ accordion ──────────────────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: "Je Webero opravdu bez programování?",
      a: "Ano, kompletně. Klikneš na text nebo obrázek přímo ve stránce, upravíš ho, a systém změnu uloží. Žádný kód, žádný backend, žádné šablony k editaci v HTML.",
    },
    {
      q: "Můžu připojit vlastní doménu?",
      a: "Samozřejmě. V administraci stačí přidat doménu (např. mojefirma.cz), my ti řekneme jak nasměrovat DNS u tvého registrátora a SSL certifikát vyřídíme automaticky.",
    },
    {
      q: "Co když se mi šablona přestane líbit?",
      a: "Šablonu můžeš změnit kdykoliv. Tvůj obsah (texty, fotky, kontakt) se přenese, jen se obalí novým designem. Žádné ztracené data.",
    },
    {
      q: "Jak funguje 14denní zkušební doba?",
      a: "Vytvoříš si demo bez kreditní karty. Můžeš ho 14 dní zkoušet, upravovat, ukazovat klientům. Pokud ti to nesedne, prostě nic neplatíš. Pokud ano, klikneš na 'Aktivovat' a doplníš platební údaje.",
    },
    {
      q: "Co je Rezora a kdo ji potřebuje?",
      a: "Rezora je náš rezervační systém — kalendář pro tým, online platby, SMS notifikace. Hodí se pro služby, salóny, kliniky, wellness. Stojí 200 Kč/měs navíc k základnímu plánu. Není povinná.",
    },
    {
      q: "Mohu kdykoli zrušit?",
      a: "Ano, kdykoliv jedním klikem v administraci. Žádné výpovědní lhůty, žádné penále. Pokud zrušíš v polovině měsíce, doplatíš pouze zbylé dny a další měsíc už nic.",
    },
    {
      q: "Jak rychlý je hosting?",
      a: "Tvůj web běží na infrastruktuře v EU (Praha + Frankfurt) s CDN po celé Evropě. PageSpeed score je v průměru 99/100 a stránka se načte do 1.2 sekundy.",
    },
    {
      q: "Pomůžete mi s nastavením?",
      a: "Ano, máme českou podporu (e-mail i telefon, pracovní dny 9-17). Při založení webu projedeme s tebou demo, ukážeme jak měnit obsah, a pomůžeme s napojením domény.",
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
            Časté otázky
          </p>
          <h2
            className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
            style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
          >
            Něco vás zajímá?
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
            Nenašli jste odpověď?{" "}
            <a href="mailto:podpora@webero.co" className="font-semibold text-[#6366f1] hover:underline">
              Napište nám
            </a>{" "}
            nebo zavolejte{" "}
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
function PricingSection({ onOpen }: { onOpen: () => void }) {
  const features = [
    "99+ profesionálních šablon",
    "Live editor bez kódu",
    "Vlastní doména + SSL",
    "Hosting v EU + CDN",
    "SEO základ + sitemap",
    "Česká podpora",
  ];

  const comparisonRows = [
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
          Ceník · Srovnání
        </p>
        <h2
          className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
          style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
        >
          Jedna cena.<br />
          <span className="text-[#9ca3af]">Vše v ceně.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] text-[#555]">
          Žádné překvapení. Žádné upgrady. Žádné skryté poplatky.
          Vedle vám ukazujeme, jak Webero stojí proti běžným alternativám.
        </p>
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
                  Plný plán
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline justify-center gap-2">
                <span
                  className="font-sans font-bold tracking-[-0.05em] text-white"
                  style={{ fontSize: "clamp(72px, 9vw, 120px)", lineHeight: "0.85" }}
                >
                  500
                </span>
                <span className="text-[32px] font-semibold text-white">Kč</span>
              </div>
              <p className="mt-2 text-center text-[14.5px] text-white/55">
                měsíčně · bez DPH
              </p>

              {/* CTA */}
              <button
                onClick={onOpen}
                className="mt-8 block w-full rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0a0a0a] shadow-[0_8px_40px_rgba(255,255,255,0.12)] transition hover:bg-white/92 active:scale-[0.99]"
              >
                Vyzkoušet zdarma 14 dní
              </button>
              <p className="mt-3 text-center text-[12.5px] text-white/55">
                Bez kreditní karty · Zrušíte kdykoli
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
                <span>+ Rezora rezervace</span>
                <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-white">
                  +200 Kč
                </span>
              </div>

              {/* Trust badges */}
              <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-white/10 pt-6 text-[12px] text-white/65">
                {[
                  { icon: "M12 2L4 6v6c0 4.5 3.4 8.6 8 9 4.6-.4 8-4.5 8-9V6l-8-4z M9 12l2 2 4-4", label: "SSL šifrování" },
                  { icon: "M3 21V10l9-6 9 6v11M9 21v-7h6v7", label: "Hosting v EU" },
                  { icon: "M12 2L4 6v6c0 4.5 3.4 8.6 8 9 4.6-.4 8-4.5 8-9V6l-8-4z", label: "GDPR compliant" },
                  { icon: "M22 11.5a8.5 8.5 0 11-3.5-6.9M22 4l-8.5 8.5L10 9", label: "Česká podpora" },
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
              Srovnání
            </p>
            <h3
              className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontSize: "clamp(22px, 2.4vw, 30px)", lineHeight: "1.15" }}
            >
              Webero vs ostatní cesty.
            </h3>
            <p className="mt-2 text-[14px] text-[#666]">
              Stejné funkce. Zlomek ceny. Bez týdnů čekání.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Desktop header row */}
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-[#ececec] bg-gradient-to-b from-[#fafafa] to-white sm:grid">
              <div className="p-4 text-[11px] font-bold uppercase text-[#888]" style={{ letterSpacing: "0.14em" }}>
                Co řešíte
              </div>
              <div className="relative border-l border-[#ececec] p-4 text-center">
                <div className="absolute left-1/2 top-0 h-[3px] w-[60%] -translate-x-1/2 rounded-b bg-[#6366f1]" />
                <div className="text-[11px] font-bold uppercase text-[#6366f1]" style={{ letterSpacing: "0.14em" }}>
                  Webero
                </div>
                <div className="mt-1 text-[12px] font-semibold text-[#0a0a0a]">Doporučeno</div>
              </div>
              <div className="border-l border-[#ececec] p-4 text-center">
                <div className="text-[11px] font-bold uppercase text-[#888]" style={{ letterSpacing: "0.14em" }}>
                  Wix / Webflow
                </div>
                <div className="mt-1 text-[12px] text-[#666]">SaaS</div>
              </div>
              <div className="border-l border-[#ececec] p-4 text-center">
                <div className="text-[11px] font-bold uppercase text-[#888]" style={{ letterSpacing: "0.14em" }}>
                  Agentura
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
                  <span className="text-[10.5px] font-bold uppercase text-[#888] sm:hidden">Agentura:</span>
                  {row.agency}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[12px] text-[#888]">
            Ceny konkurence k 06/2026, převedeny do CZK. Reálné nabídky se mohou lišit.
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
  { rating: 5, quote: "Finally something that actually works. Clients started booking through the site on their own — I just upload photos and update prices.", name: "Sofía Martín", role: "Esthetician", city: "Madrid, ES", photo: "https://i.pravatar.cc/200?img=49", date: "1 month ago", verified: true },
  { rating: 5, quote: "I'm an accountant, never touched code in my life. Webero said click and edit — and that's exactly what it is. Site went live the same afternoon.", name: "Andreas Berger", role: "Tax advisor", city: "Vienna, AT", photo: "https://i.pravatar.cc/200?img=33", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Switched from Wix after half a year. Load time cut in half, mobile is finally usable, SEO went from nothing to actual organic traffic.", name: "Mateusz Kowalski", role: "Carpenter", city: "Kraków, PL", photo: "https://i.pravatar.cc/200?img=68", date: "1 month ago", verified: true },
  { rating: 4, quote: "Templates are gorgeous, editor is snappy. Only minus — some advanced bits (custom fonts) aren't there yet. Hope they ship it soon.", name: "Camille Laurent", role: "Florist", city: "Lyon, FR", photo: "https://i.pravatar.cc/200?img=47", date: "2 months ago", verified: true },
  { rating: 5, quote: "$20 a month feels like a steal. I used to pay $200/year for hosting plus $1,200 to an agency. Now it's cheaper and better.", name: "Marco Ricci", role: "Driving school owner", city: "Milan, IT", photo: "https://i.pravatar.cc/200?img=53", date: "3 weeks ago", verified: true },
  { rating: 2, quote: "Rough start — couldn't connect my GoDaddy domain and waited nearly 3 days for support. Fine after they sorted it, but the launch delay was frustrating.", name: "James Whitfield", role: "Electrician", city: "Manchester, UK", photo: "https://i.pravatar.cc/200?img=15", date: "6 weeks ago" },
  { rating: 5, quote: "Perfect for our guesthouse. Booking inquiries hit my email and phone instantly. My wife edits the site herself without ever asking me.", name: "Lukas Hoffmann", role: "Guesthouse owner", city: "Salzburg, AT", photo: "https://i.pravatar.cc/200?img=60", date: "1 month ago", verified: true },
  { rating: 5, quote: "I was worried it would look like another cheap template site. It doesn't. Looks like a $7K agency build, honestly.", name: "Elena Popescu", role: "Cosmetologist", city: "Bucharest, RO", photo: "https://i.pravatar.cc/200?img=44", date: "2 weeks ago", verified: true },
  { rating: 3, quote: "The vet template was nice, but I needed an adoption gallery and it wasn't there. Had to make do with a regular gallery. Works — just not what I wanted.", name: "Daniel Fischer", role: "Veterinarian", city: "Hamburg, DE", photo: "https://i.pravatar.cc/200?img=8", date: "1 month ago" },
  { rating: 5, quote: "Launched 3 microsites for different branches. Each one a different look, all managed from one account. Saves me hours every week.", name: "Anna Janssen", role: "Marketing manager", city: "Amsterdam, NL", photo: "https://i.pravatar.cc/200?img=20", date: "3 weeks ago", verified: true },
  { rating: 4, quote: "Paid for itself inside a month. 14 leads in the first 3 weeks, two turned into $5K+ jobs. The site is profit from here on out.", name: "Henrik Larsen", role: "Construction firm", city: "Copenhagen, DK", photo: "https://i.pravatar.cc/200?img=11", date: "5 weeks ago", verified: true },
  { rating: 5, quote: "I love that there's no lock-in. My domain stays mine, I can export my content any time. Doesn't feel like a trap.", name: "Isabella Romano", role: "Language tutor", city: "Florence, IT", photo: "https://i.pravatar.cc/200?img=32", date: "2 months ago", verified: true },
  { rating: 5, quote: "PageSpeed 98 without me lifting a finger. It was 42 before. Google started ranking me higher and organic visits actually picked up.", name: "Charlotte Dubois", role: "Pastry chef", city: "Paris, FR", photo: "https://i.pravatar.cc/200?img=29", date: "1 month ago", verified: true },
  { rating: 4, quote: "Plenty of templates, but I want more variants for delivery-focused restaurants. Great for a classic restaurant, less so for a takeaway spot.", name: "Diego Sánchez", role: "Bistro owner", city: "Barcelona, ES", photo: "https://i.pravatar.cc/200?img=58", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Support replies fast, in plain English, and actually solves things. Not just docs links. Rare for a SaaS these days.", name: "Emma Thompson", role: "Music school owner", city: "Bristol, UK", photo: "https://i.pravatar.cc/200?img=25", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Migrated our dental practice site in one evening. Patients can request appointments straight from the homepage now — bookings up 38%.", name: "Dr. Nora Lindqvist", role: "Dentist", city: "Stockholm, SE", photo: "https://i.pravatar.cc/200?img=5", date: "1 month ago", verified: true },
  { rating: 5, quote: "The mobile editor is a game changer. I updated the menu on the train ride to work. Five years on WordPress and I never did that.", name: "Yannis Papadopoulos", role: "Restaurant owner", city: "Athens, GR", photo: "https://i.pravatar.cc/200?img=14", date: "3 weeks ago", verified: true },
  { rating: 4, quote: "Solid product, just wish the analytics dashboard were deeper. Right now I export to GA4. Otherwise zero complaints.", name: "Tara Williams", role: "Boutique owner", city: "Toronto, CA", photo: "https://i.pravatar.cc/200?img=23", date: "2 months ago", verified: true },
  { rating: 5, quote: "Switched 4 client sites from Squarespace to Webero. All faster, cleaner, half the monthly cost. Clients are happier than I am.", name: "Filip Novák", role: "Freelance designer", city: "Bratislava, SK", photo: "https://i.pravatar.cc/200?img=51", date: "6 weeks ago", verified: true },
  { rating: 5, quote: "I'm 64 and built it myself. Didn't call my nephew once. That's the real test of any web tool, isn't it.", name: "Margaret Sullivan", role: "Pottery studio owner", city: "Cork, IE", photo: "https://i.pravatar.cc/200?img=10", date: "1 month ago", verified: true },
  { rating: 3, quote: "Templates look great but the photography library is limited. I had to source my own stock photos. Not a deal-breaker, just an extra step.", name: "Robert Kovač", role: "Real estate agent", city: "Zagreb, HR", photo: "https://i.pravatar.cc/200?img=3", date: "2 months ago" },
  { rating: 5, quote: "Stripe integration was 2 clicks. Took payments the same day I launched. From idea to first revenue in under 48 hours.", name: "Júlia Fernandes", role: "Online course creator", city: "Lisbon, PT", photo: "https://i.pravatar.cc/200?img=24", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Honestly thought it was too good to be true at this price. Six months in, still no surprises. No upsells, no upgrades pushed.", name: "Aleksander Nilsen", role: "Photographer", city: "Oslo, NO", photo: "https://i.pravatar.cc/200?img=52", date: "1 month ago", verified: true },
  { rating: 4, quote: "Multi-language support works but the editing UX for translations could be smoother. Other than that — using it for 3 of my sites now.", name: "Beatrice Costa", role: "Travel agency", city: "Naples, IT", photo: "https://i.pravatar.cc/200?img=36", date: "5 weeks ago", verified: true },
  { rating: 5, quote: "Our previous developer ghosted us mid-project. Found Webero through a Reddit thread, had a full new site live in 4 days.", name: "Connor McLean", role: "Gym owner", city: "Glasgow, UK", photo: "https://i.pravatar.cc/200?img=65", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Used it to launch a side business while keeping my full-time job. Built the entire site during evenings over two weeks.", name: "Hanna Müller", role: "Side-project founder", city: "Berlin, DE", photo: "https://i.pravatar.cc/200?img=16", date: "3 weeks ago", verified: true },
  { rating: 2, quote: "Looked beautiful in the demo but I couldn't get my custom domain SSL to renew without contacting support. Twice. Hope they automate that.", name: "Frédéric Moreau", role: "Consultant", city: "Brussels, BE", photo: "https://i.pravatar.cc/200?img=64", date: "2 months ago" },
  { rating: 5, quote: "I run a tattoo studio and the gallery template is genuinely well-designed. Customers spend twice as long browsing now.", name: "Mia Andersson", role: "Tattoo artist", city: "Gothenburg, SE", photo: "https://i.pravatar.cc/200?img=45", date: "4 weeks ago", verified: true },
  { rating: 5, quote: "The accessibility defaults are excellent. Passed our nonprofit's WCAG audit on the first try. That alone saved us thousands.", name: "David Cohen", role: "Nonprofit director", city: "Tel Aviv, IL", photo: "https://i.pravatar.cc/200?img=66", date: "1 month ago", verified: true },
  { rating: 4, quote: "Wish there was a built-in scheduling/calendar block. Using Calendly embed for now. Works, but native would be nicer.", name: "Olivia Brooks", role: "Wellness coach", city: "Melbourne, AU", photo: "https://i.pravatar.cc/200?img=21", date: "6 weeks ago", verified: true },
  { rating: 5, quote: "Came from Webflow. Webero is 90% of the design power with 10% of the learning curve. For my use case that's the perfect trade.", name: "Tomáš Kubík", role: "Indie product founder", city: "Prague, CZ", photo: "https://i.pravatar.cc/200?img=54", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Set this up for my dad's plumbing business. He calls me whenever something needs changing — and now I can tell him to do it himself. Wins all around.", name: "Sienna Walker", role: "Daughter of a plumber", city: "Auckland, NZ", photo: "https://i.pravatar.cc/200?img=48", date: "1 month ago", verified: true },
  { rating: 5, quote: "Image optimization is doing the work I used to pay a developer for. Every photo I upload comes out looking sharp and loading fast.", name: "Niko Virtanen", role: "Wedding photographer", city: "Helsinki, FI", photo: "https://i.pravatar.cc/200?img=69", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Came for the price, stayed for the quality. The fact that a sub-$30/month tool produces this quality of output is genuinely impressive.", name: "Rachel Goldberg", role: "Boutique hotel owner", city: "Tel Aviv, IL", photo: "https://i.pravatar.cc/200?img=26", date: "5 weeks ago", verified: true },
  { rating: 4, quote: "Onboarding is great but the help docs could be more detailed. I figured most things out by clicking around — which is fine but could be faster.", name: "Adam Kowalewski", role: "Freelance copywriter", city: "Warsaw, PL", photo: "https://i.pravatar.cc/200?img=57", date: "2 months ago", verified: true },
  { rating: 5, quote: "I run a regional florist chain. Five locations, five sites, one editor login. Operations team can update opening hours across all in under a minute.", name: "Sophie van der Berg", role: "Florist chain owner", city: "Rotterdam, NL", photo: "https://i.pravatar.cc/200?img=30", date: "1 month ago", verified: true },
  { rating: 5, quote: "First SaaS in years where I didn't feel like I was being upsold every screen. You pay, you get the product. Refreshing.", name: "Michael O'Brien", role: "Pub owner", city: "Belfast, UK", photo: "https://i.pravatar.cc/200?img=67", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "The drag-to-reorder sections is the kind of polish you only see in expensive enterprise tools. Felt premium from minute one.", name: "Léa Bernard", role: "Yoga studio owner", city: "Nice, FR", photo: "https://i.pravatar.cc/200?img=38", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Loaded my old WordPress export and rebuilt the whole thing in a day. Pages that used to take 4s now load in under a second.", name: "Viktor Petrov", role: "Travel blogger", city: "Sofia, BG", photo: "https://i.pravatar.cc/200?img=70", date: "3 weeks ago", verified: true },
  { rating: 4, quote: "Booking flow could use more customization, but for a $20 tool I genuinely can't complain. Already replaced 3 paid plugins.", name: "Ingrid Halvorsen", role: "Spa owner", city: "Bergen, NO", photo: "https://i.pravatar.cc/200?img=41", date: "1 month ago", verified: true },
  { rating: 5, quote: "I onboarded my whole team in 15 minutes. Even our least technical person was editing pages before lunch.", name: "Patrick Murphy", role: "Operations manager", city: "Limerick, IE", photo: "https://i.pravatar.cc/200?img=7", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Set up multilingual versions in EN/DE/FR in one evening. Translators love the side-by-side editor.", name: "Clara Hofer", role: "Hotel manager", city: "Innsbruck, AT", photo: "https://i.pravatar.cc/200?img=43", date: "5 weeks ago", verified: true },
  { rating: 3, quote: "Form spam filter let through a wave of bot submissions last month. They fixed it within a week but it cost me an annoying weekend.", name: "Theodor Sandström", role: "Coach", city: "Malmö, SE", photo: "https://i.pravatar.cc/200?img=63", date: "6 weeks ago" },
  { rating: 5, quote: "Migrated from a custom-coded site I'd been paying $400/month to maintain. Now I spend the difference on actual marketing.", name: "Aiden Walsh", role: "Roofing contractor", city: "Cardiff, UK", photo: "https://i.pravatar.cc/200?img=59", date: "1 month ago", verified: true },
  { rating: 5, quote: "Cookie banner and GDPR compliance built in. I didn't have to think about it once. As a German business that's huge.", name: "Maximilian Wagner", role: "Lawyer", city: "Munich, DE", photo: "https://i.pravatar.cc/200?img=17", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Started as a side experiment for a hobby project. Now it's my actual business. The site held up at 20K visits/day without breaking a sweat.", name: "Zara Khan", role: "Indie maker", city: "London, UK", photo: "https://i.pravatar.cc/200?img=39", date: "2 months ago", verified: true },
  { rating: 4, quote: "Pricing comparison table block is excellent but I wish I could nest columns. Solved it with a workaround, not the end of the world.", name: "Pieter de Vries", role: "SaaS founder", city: "Eindhoven, NL", photo: "https://i.pravatar.cc/200?img=62", date: "4 weeks ago", verified: true },
  { rating: 5, quote: "Built a portfolio site for myself and got 3 inbound clients in the first month. The design templates clearly attract serious leads.", name: "Aurora Lindgren", role: "Brand designer", city: "Reykjavík, IS", photo: "https://i.pravatar.cc/200?img=35", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "We replaced 7 standalone microsites with Webero. Saved $11K/year in subscriptions and the brand finally looks consistent everywhere.", name: "Ravi Sharma", role: "Marketing director", city: "Dublin, IE", photo: "https://i.pravatar.cc/200?img=18", date: "1 month ago", verified: true },
  { rating: 5, quote: "I'm dyslexic and most builders are hostile to that — too much text-heavy UI. Webero's icon-first approach made the difference.", name: "Tobias Engel", role: "Bakery owner", city: "Zurich, CH", photo: "https://i.pravatar.cc/200?img=56", date: "2 weeks ago", verified: true },
  { rating: 2, quote: "Image uploader was buggy with HEIC files from my iPhone for about 2 weeks. Fixed now, but I lost a launch deadline because of it.", name: "Greta Lindholm", role: "Wedding planner", city: "Tallinn, EE", photo: "https://i.pravatar.cc/200?img=46", date: "2 months ago" },
  { rating: 5, quote: "The fact that I can preview every change on mobile before publishing is everything. No more 'how does this look on Android' panic.", name: "Bruno Ferreira", role: "Café owner", city: "Porto, PT", photo: "https://i.pravatar.cc/200?img=55", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "I've used Squarespace, Wix, Webflow, Framer, and Shopify pages. Webero is the first one where I didn't fight the editor.", name: "Lucia Esposito", role: "E-commerce consultant", city: "Rome, IT", photo: "https://i.pravatar.cc/200?img=27", date: "1 month ago", verified: true },
  { rating: 5, quote: "Our agency now builds all SMB sites on Webero instead of WordPress. Faster delivery, fewer support tickets, happier clients.", name: "Jakub Stastny", role: "Agency owner", city: "Prague, CZ", photo: "https://i.pravatar.cc/200?img=50", date: "5 weeks ago", verified: true },
  { rating: 4, quote: "Form notifications could come with more context — right now I get 'new submission' and have to log in. Email digest would be ideal.", name: "Nina Berisha", role: "Therapist", city: "Pristina, XK", photo: "https://i.pravatar.cc/200?img=42", date: "1 month ago", verified: true },
  { rating: 5, quote: "Replaced a 4-year-old Drupal install. The migration tool handled 380 pages without me babysitting it.", name: "Stefan Müller", role: "Publisher", city: "Frankfurt, DE", photo: "https://i.pravatar.cc/200?img=19", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Customer-facing booking form converts at 14% — almost double what my old custom form was doing. Form UX matters more than I thought.", name: "Aoife Byrne", role: "Hairdresser", city: "Galway, IE", photo: "https://i.pravatar.cc/200?img=31", date: "1 month ago", verified: true },
  { rating: 5, quote: "Webhooks integration meant I connected to our internal CRM in 20 minutes. No middleware, no Zapier, just clean API calls.", name: "Gabriel Costa", role: "CTO", city: "São Paulo, BR", photo: "https://i.pravatar.cc/200?img=22", date: "4 weeks ago", verified: true },
  { rating: 5, quote: "Bought it for my therapy practice. Patients book directly, fill intake forms, and pay deposits — all without me touching anything.", name: "Dr. Ananya Iyer", role: "Therapist", city: "Bangalore, IN", photo: "https://i.pravatar.cc/200?img=28", date: "1 month ago", verified: true },
  { rating: 3, quote: "Templates lean heavily 'modern minimal'. For my vintage record shop I wanted something more textured — had to heavily customize.", name: "Ezra Klein", role: "Record shop owner", city: "Brooklyn, US", photo: "https://i.pravatar.cc/200?img=4", date: "2 months ago" },
  { rating: 5, quote: "Built the site, set up Stripe, took my first international payment within 6 hours. That's a record for any product I've used.", name: "Joaquín Vega", role: "Online instructor", city: "Mexico City, MX", photo: "https://i.pravatar.cc/200?img=2", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Domain transfer was painless. Documentation walked me through every registrar quirk. Even Namecheap, which is notoriously finicky.", name: "Lina Schneider", role: "Coach", city: "Cologne, DE", photo: "https://i.pravatar.cc/200?img=37", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Built two sites: one for my construction company, one for my wife's bakery. Both look custom, neither cost me a developer fee.", name: "Yusuf Yıldız", role: "Builder", city: "Istanbul, TR", photo: "https://i.pravatar.cc/200?img=61", date: "4 weeks ago", verified: true },
  { rating: 4, quote: "Search functionality on my docs site works well but could use better fuzzy matching. Small gripe in an otherwise excellent product.", name: "Marta Lewandowska", role: "Technical writer", city: "Gdańsk, PL", photo: "https://i.pravatar.cc/200?img=34", date: "6 weeks ago", verified: true },
  { rating: 5, quote: "The auto-generated sitemap and JSON-LD schema boosted my SEO position from page 3 to page 1 for 4 keywords in 8 weeks.", name: "Kai Becker", role: "Mechanic", city: "Stuttgart, DE", photo: "https://i.pravatar.cc/200?img=13", date: "1 month ago", verified: true },
  { rating: 5, quote: "Honestly the cleanest admin UI I've used in years. No fake gamification, no badges, no 'unlock pro' popups. Just the tools.", name: "Elin Karlsson", role: "Studio owner", city: "Uppsala, SE", photo: "https://i.pravatar.cc/200?img=40", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "When I cancelled a different SaaS, I lost half my data. Webero lets me export everything — content, images, even forms — as a zip.", name: "Ben Schwartz", role: "Consultant", city: "Vienna, AT", photo: "https://i.pravatar.cc/200?img=6", date: "2 months ago", verified: true },
  { rating: 5, quote: "Switched mid-product from a competitor. Customer support helped me migrate manually because the import didn't catch one section type.", name: "Ksenia Volkova", role: "Designer", city: "Riga, LV", photo: "https://i.pravatar.cc/200?img=9", date: "5 weeks ago", verified: true },
  { rating: 4, quote: "Brand colors propagate site-wide which is great, but I want one section to override. There's a workaround with CSS but native would be cleaner.", name: "Mateo Ortiz", role: "Architect", city: "Valencia, ES", photo: "https://i.pravatar.cc/200?img=1", date: "1 month ago", verified: true },
  { rating: 5, quote: "Got a call from a designer friend asking 'who built your site?' Told them me. They didn't believe me until I showed them the editor.", name: "Hana Kobayashi", role: "Tea house owner", city: "Kyoto, JP", photo: "https://i.pravatar.cc/200?img=26", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Setup wizard understood I was a non-technical user from question one. No condescending 'helpful tips' — just clear paths forward.", name: "Florian Klein", role: "Optician", city: "Linz, AT", photo: "https://i.pravatar.cc/200?img=11", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Site speed jumped from PageSpeed 51 to 96 the day we migrated. Our Google Ads quality score went up and CPC dropped 18%.", name: "Brendan O'Sullivan", role: "Digital marketer", city: "Edinburgh, UK", photo: "https://i.pravatar.cc/200?img=65", date: "1 month ago", verified: true },
  { rating: 5, quote: "Built our nonprofit donation page with Stripe integration in 90 minutes. Raised €4,200 the first weekend.", name: "Saoirse Doyle", role: "Charity director", city: "Cork, IE", photo: "https://i.pravatar.cc/200?img=20", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "I evaluated 8 platforms for our restaurant chain rollout. Webero won on speed, design, and the fact that the team actually picks up the phone.", name: "Lorenzo Ferraro", role: "Restaurant group", city: "Bologna, IT", photo: "https://i.pravatar.cc/200?img=51", date: "4 weeks ago", verified: true },
  { rating: 4, quote: "Animations are tasteful by default — most builders go overboard. Wish there were a couple more presets but what's there is high quality.", name: "Petra Horvat", role: "Wellness coach", city: "Ljubljana, SI", photo: "https://i.pravatar.cc/200?img=44", date: "5 weeks ago", verified: true },
  { rating: 5, quote: "Pay-once-a-month-and-forget reliability. Site has been live for 11 months, zero downtime, zero maintenance from me.", name: "Niamh Kennedy", role: "Ceramicist", city: "Sligo, IE", photo: "https://i.pravatar.cc/200?img=47", date: "2 months ago", verified: true },
  { rating: 5, quote: "Showed the editor to my 70-year-old mother who wanted a site for her knitting club. She had it published in an afternoon.", name: "Antonio Russo", role: "Knitting club organizer", city: "Palermo, IT", photo: "https://i.pravatar.cc/200?img=14", date: "1 month ago", verified: true },
  { rating: 5, quote: "Best onboarding I've seen in any SaaS. Step-by-step but never patronizing. Felt like a senior designer guiding me.", name: "Cecilia Almeida", role: "Architect", city: "Lisbon, PT", photo: "https://i.pravatar.cc/200?img=32", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Our agency switched 14 client sites in one quarter. Net savings: €38K/year across the portfolio. Clients had zero complaints.", name: "Ivan Marković", role: "Agency owner", city: "Belgrade, RS", photo: "https://i.pravatar.cc/200?img=33", date: "6 weeks ago", verified: true },
  { rating: 4, quote: "I'd love a native Instagram feed block. The workaround works but a first-party version with caching would be killer for image-heavy brands.", name: "Mila Petković", role: "Influencer", city: "Skopje, MK", photo: "https://i.pravatar.cc/200?img=49", date: "1 month ago", verified: true },
  { rating: 5, quote: "Live preview while editing — what you see is genuinely what you publish. No 'looks different in preview' weirdness like with some competitors.", name: "Hugo Lindqvist", role: "Brewmaster", city: "Helsinki, FI", photo: "https://i.pravatar.cc/200?img=68", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Switched from a hand-coded site I built in 2019. The new one is faster, more accessible, and I don't have to remember how my own JS works.", name: "Sara Engström", role: "Indie dev", city: "Linköping, SE", photo: "https://i.pravatar.cc/200?img=23", date: "2 weeks ago", verified: true },
  { rating: 5, quote: "Pricing is honest. No 'starting at' fake numbers, no hidden tier above. €20/month, that's what you pay. Refreshing.", name: "Lukáš Polák", role: "Indie founder", city: "Brno, CZ", photo: "https://i.pravatar.cc/200?img=54", date: "1 month ago", verified: true },
  { rating: 5, quote: "Genuinely thoughtful product. Every option I looked for was either there or had an obvious workaround. Rarely happens.", name: "Astrid Møller", role: "Coach", city: "Aarhus, DK", photo: "https://i.pravatar.cc/200?img=36", date: "3 weeks ago", verified: true },
  { rating: 3, quote: "Couldn't find a way to A/B test landing pages natively. Had to hack it with two pages and analytics. Would love a built-in solution.", name: "Ronan Phillips", role: "Growth marketer", city: "Brighton, UK", photo: "https://i.pravatar.cc/200?img=57", date: "1 month ago" },
  { rating: 5, quote: "Six months in. Site has paid for itself 50x over. The math is no longer interesting — I just keep using it because it works.", name: "Aida Hadžić", role: "Restaurant owner", city: "Sarajevo, BA", photo: "https://i.pravatar.cc/200?img=45", date: "2 months ago", verified: true },
  { rating: 5, quote: "I run a craft brewery. We have weekly events and a rotating tap list — both update across the site in seconds. Used to take my old dev 2 days.", name: "Iván Romero", role: "Brewery owner", city: "Bilbao, ES", photo: "https://i.pravatar.cc/200?img=64", date: "4 weeks ago", verified: true },
  { rating: 5, quote: "Their changelog reads like one written by people who actually use the product. Every release fixes things I'd been low-key annoyed about.", name: "Tomáš Varga", role: "Product manager", city: "Košice, SK", photo: "https://i.pravatar.cc/200?img=53", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "I run a 9-location chain of dental clinics. Webero handles all sites with shared branding and per-location overrides. Beautifully architected.", name: "Dr. Mehmet Demir", role: "Clinic group owner", city: "Ankara, TR", photo: "https://i.pravatar.cc/200?img=12", date: "5 weeks ago", verified: true },
  { rating: 4, quote: "Custom code injection is allowed which I appreciate — I add a tiny analytics snippet. Just wish it were per-page rather than site-wide only.", name: "Tania Volkov", role: "Analyst", city: "Bucharest, RO", photo: "https://i.pravatar.cc/200?img=29", date: "6 weeks ago", verified: true },
  { rating: 5, quote: "I'm a notary and my profession requires extreme reliability. The site has been live a year — never once gone down during business hours.", name: "Walter Hoffmann", role: "Notary", city: "Graz, AT", photo: "https://i.pravatar.cc/200?img=8", date: "2 months ago", verified: true },
  { rating: 5, quote: "Forms support file uploads, conditional fields, multi-step — everything I used to need a $40/month form builder for is built in.", name: "Brigitte Müller", role: "HR consultant", city: "Bern, CH", photo: "https://i.pravatar.cc/200?img=25", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "Email-based magic-link login for clients to view private project pages is a feature I didn't know I needed until I had it.", name: "Vesna Antić", role: "Project manager", city: "Novi Sad, RS", photo: "https://i.pravatar.cc/200?img=30", date: "1 month ago", verified: true },
  { rating: 5, quote: "Edited a typo from my phone during a client meeting and refreshed the page in front of them. The look on their face. Worth the subscription alone.", name: "Adriana Câmara", role: "Lawyer", city: "Porto, PT", photo: "https://i.pravatar.cc/200?img=43", date: "3 weeks ago", verified: true },
  { rating: 5, quote: "My business runs out of a small mountain town in Switzerland. Webero is the rare tool that doesn't assume I'm in San Francisco.", name: "Ueli Aebischer", role: "Adventure guide", city: "Grindelwald, CH", photo: "https://i.pravatar.cc/200?img=15", date: "4 weeks ago", verified: true },
  { rating: 5, quote: "Switched our membership site from MemberSpace + WP. Webero's native gating saves us €120/month and works more reliably.", name: "Linnea Bergström", role: "Course creator", city: "Stockholm, SE", photo: "https://i.pravatar.cc/200?img=21", date: "5 weeks ago", verified: true },
];

function TestimonialCard({ t }: { t: Testimonial }) {
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
            Verified
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

function TestimonialsSlider() {
  const total = TESTIMONIALS.length;
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

  const avgRating = (TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / total).toFixed(1);
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: TESTIMONIALS.filter((t) => t.rating === r).length,
    pct: (TESTIMONIALS.filter((t) => t.rating === r).length / total) * 100,
  }));

  return (
    <div className="py-24 lg:py-36">
      <div className="mx-auto mb-12 max-w-[1280px] px-6 lg:mb-16 lg:px-10">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.16em" }}>
              Reviews
            </p>
            <h2 className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]" style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}>
              What our customers say.
            </h2>
            <p className="mt-5 max-w-[560px] text-[15.5px] leading-[1.65] text-[#555]">
              {total}+ verified reviews from real users across Europe, the UK, and beyond. Nothing filtered, nothing cherry-picked.
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
              <div className="mt-1.5 text-[11.5px] text-[#888]">{total} reviews</div>
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
                {TESTIMONIALS.slice(pi * perView, pi * perView + perView).map((t) => (
                  <TestimonialCard key={t.name + t.date + pi} t={t} />
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
              aria-label="Previous"
              className="grid h-12 w-12 place-items-center rounded-full border border-[#e5e5e5] bg-white text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-x-0.5 hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
            >
              <ChevronLeft size={20} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
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
function Carousel3D({ onOpen: _onOpen }: { onOpen: () => void }) {
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
                    alt="Šablona webu — náhled"
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
        aria-label="Předchozí"
        onClick={prev}
        className="group absolute left-0 top-0 z-40 hidden h-full w-[26%] cursor-pointer items-center justify-start pl-6 sm:flex"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/0 text-white/0 transition group-hover:bg-white/15 group-hover:text-white">
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </button>
      <button
        aria-label="Další"
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
            aria-label={`Šablona ${i + 1}`}
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

export function SaasLanding({ approvedTemplates = [], heroDesktopDemoUrl = null, heroMobileDemoUrl = null }: Props) {
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
                fontSize: "clamp(30px, 3.4vw, 48px)",
                lineHeight: "1.08",
                letterSpacing: "-0.025em",
                color: "#ffffff",
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
              }}
            >
              <MaskReveal delay={0.05}>Profesionální&nbsp;</MaskReveal>
              <MaskReveal delay={0.13}>web</MaskReveal>
              <br />
              <MaskReveal delay={0.21}>bez&nbsp;</MaskReveal>
              <MaskReveal delay={0.27}>programátora.</MaskReveal>
            </h1>

            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                onClick={() => openModal()}
                className="inline-flex h-[48px] items-center justify-center rounded-full bg-white px-10 text-[15px] font-semibold text-[#111] shadow-[0_4px_30px_rgba(0,0,0,0.35)] transition duration-200 hover:bg-white/95 hover:shadow-[0_8px_40px_rgba(0,0,0,0.45)] active:scale-[0.97]"
              >
                Vyzkoušet zdarma
              </button>
              <p className="text-[13px] text-white/65">
                Začít zdarma. Bez kreditní karty.
              </p>
            </div>
          </div>

          {/* Angled carousel — inside the hero, on the video bg */}
          <div className="w-full">
            <Carousel3D onOpen={() => openModal()} />
          </div>

          <p className="mt-5 text-center text-[13.5px] text-white/55">
            Připojte se k tisícům podnikatelů, kteří tvoří web na Weberu.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CLIENT LOGOS — slim trust strip just under hero                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10 lg:py-16">
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
              Vše v jednom
            </p>
            <h2
              className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
            >
              Web jako vlastní byznys.<br />
              <span className="text-[#9ca3af]">Bez kompromisů.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] text-[#555]">
              Šablony, editor, hosting, SEO i česká podpora.
              Všechno za jednu férovou cenu — bez programátora a bez agentury.
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
                  label="Rychlost & SEO"
                  value="PageSpeed 90–100"
                  detail="Edge cache ve 270+ městech, AVIF/WebP optimalizace, auto sitemap a JSON-LD. Google vás bude rád indexovat."
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
                  value="Perfektní i v kapse"
                  detail="Každá šablona je optimalizovaná pro mobil. Tap-to-call, native share, žádný horizontální scroll."
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
                title: "Klikni a uprav.",
                desc: "Žádný backend, žádné šablony v kódu. Pracujete přímo na stránce.",
                accent: "#6366f1",
                glow: "rgba(99,102,241,0.14)",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                ),
              },
              {
                eyebrow: "Šablony",
                stat: "99+",
                title: "Profi šablon.",
                desc: "Vyberete obor, dostanete hotový web s obsahem. Stačí dopsat název firmy.",
                accent: "#0ea5e9",
                glow: "rgba(14,165,233,0.14)",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                ),
              },
              {
                eyebrow: "Výkon",
                stat: "99/100",
                title: "PageSpeed.",
                desc: "EU hosting, automatická optimalizace obrázků a SEO. Bez konfigurace.",
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
              { value: 500, suffix: "+",    label: "Aktivních webů",    sub: "Po celé ČR",              decimals: 0 },
              { value: 99,  suffix: "/100", label: "PageSpeed",          sub: "Google Lighthouse",       decimals: 0 },
              { value: 4.9, suffix: "★",   label: "Hodnocení klientů",  sub: "Průměr ze 200+ recenzí",  decimals: 1 },
              { value: 5,   suffix: " min", label: "Spuštění demo",      sub: "Od šablony po web",       decimals: 0 },
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
              Produkty Webero
            </p>
            <h2
              className="font-sans font-semibold tracking-[-0.025em] text-white"
              style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
            >
              Tisíce potřeb.<br />
              <span className="text-white/55">Jedno solidní řešení.</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">

            {/* Webové stránky */}
            <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] transition-colors hover:border-white/25">
              <div className="p-8 lg:p-10">
                <h3 className="font-sans font-semibold tracking-[-0.02em] text-white" style={{ fontSize: "clamp(26px, 2.2vw, 34px)", lineHeight: "1.1" }}>
                  Webové stránky
                </h3>
                <p className="mt-4 max-w-[460px] text-[15px] leading-[1.65] text-white/65">
                  Plnohodnotná firemní prezentace s desítkami sekcí, blogem a kontaktními formuláři. Patří k nejlépe zpracovaným webům na internetu.
                </p>
                <a href="#sablony" className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#a5b4fc] transition hover:text-white">
                  Více <ArrowRight size={14} />
                </a>
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
                  Jednostránkové weby pro kampaně, sbírání leadů a rychlou konverzi. Vysoký výkon, čistý design, A/B varianty během minut.
                </p>
                <a href="#sablony" className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#a5b4fc] transition hover:text-white">
                  Více <ArrowRight size={14} />
                </a>
              </div>
              <div className="relative mt-auto flex h-[280px] items-end justify-center overflow-hidden sm:h-[320px] lg:h-[380px]">
                <div className="relative z-10 h-[260px] w-[150px] overflow-hidden rounded-t-[26px] border border-white/15 bg-[#141414] p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] sm:h-[300px] sm:w-[170px] lg:h-[360px] lg:w-[200px]">
                  <div className="absolute left-1/2 top-1 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/10" />
                  <div className="h-full w-full overflow-hidden rounded-t-[20px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/templates/barber-03/showcase/mobile-hero.webp" alt="Mobilní landing" className="h-full w-full object-cover object-top" loading="lazy" />
                  </div>
                </div>
                <div className="absolute -right-4 bottom-6 hidden h-[230px] w-[140px] -rotate-[8deg] overflow-hidden rounded-t-[22px] border border-white/15 bg-[#141414] p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:block lg:h-[280px] lg:w-[160px]">
                  <div className="h-full w-full overflow-hidden rounded-t-[16px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/templates/peak-cut/showcase/mobile-hero.webp" alt="Mobilní landing varianta" className="h-full w-full object-cover object-top" loading="lazy" />
                  </div>
                </div>
              </div>
            </article>

            {/* E-shop a katalog */}
            <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] transition-colors hover:border-white/25">
              <div className="p-8 lg:p-10">
                <h3 className="font-sans font-semibold tracking-[-0.02em] text-white" style={{ fontSize: "clamp(26px, 2.2vw, 34px)", lineHeight: "1.1" }}>
                  E-shop a katalog
                </h3>
                <p className="mt-4 max-w-[460px] text-[15px] leading-[1.65] text-white/65">
                  Prodávejte produkty i služby přímo z webu. Stripe, faktury, sklady a doprava — vše v jednom rozhraní bez pluginů.
                </p>
                <a href="#sablony" className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#a5b4fc] transition hover:text-white">
                  Více <ArrowRight size={14} />
                </a>
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
                          <img src={`/templates/${src}`} alt={`Produkt ${i+1}`} className="h-full w-full object-cover" loading="lazy" />
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
                  Blog, kurzy, členská sekce. Vytvářejte obsah, nabízejte ho jednorázově nebo formou předplatného. Bez vývojářů.
                </p>
                <a href="#sablony" className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#a5b4fc] transition hover:text-white">
                  Více <ArrowRight size={14} />
                </a>
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
                          <img src={`/templates/${src}`} alt={`Článek ${i+1}`} className="h-full w-full object-cover" loading="lazy" />
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
              Šablony
            </p>
            <h2
              className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: "1.05" }}
            >
              99+ šablon.<br />
              <span className="text-[#9ca3af]">Pro každý obor.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-[1.65] text-[#555]">
              Každá šablona má homepage, podstránky, obrázky i texty.
              Stačí dopsat název firmy a publikovat.
            </p>
          </div>

          <TemplatesGallery onOpen={(tpl) => openModal(tpl)} />

          {/* Bottom CTA */}
          <Reveal delay={0.3} className="mt-14 flex flex-col items-center gap-4">
            <a
              href="/ukazka-sablon"
              className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:bg-[#1a1a1a]"
            >
              Prohlédnout všech 99+ šablon
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="text-[13px] text-[#888]">Pravidelně přidáváme 2–3 nové šablony každý měsíc.</p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* §3.5  TESTIMONIALS — Real customer quotes for social proof       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="reference" className="relative bg-[#fafafa]">
        <TestimonialsSlider />
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* §4.5  FAQ — Accordion with common questions                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <FAQSection />

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
                Začněte ještě dnes
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
                Spusťte svůj<br />
                web teď.
              </h2>

              <Reveal delay={0.45} className="mt-7">
                <p className="max-w-[460px] text-[16.5px] leading-[1.65] text-white">
                  Spusťte demo, projděte ho, upravte si ho — a teprve potom se rozhodněte.
                  Bez kreditní karty, bez programátora.
                </p>
              </Reveal>

              <Reveal delay={0.6} className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={() => openModal()}
                  className="inline-flex h-[58px] items-center justify-center rounded-full bg-[#22c55e] px-12 text-[16px] font-semibold text-white shadow-[0_8px_40px_rgba(34,197,94,0.35)] transition hover:bg-[#16a34a] hover:shadow-[0_12px_50px_rgba(34,197,94,0.50)] active:scale-[0.97]"
                >
                  Vyzkoušet zdarma
                </button>
                <a
                  href="#sablony"
                  className="text-[14.5px] font-semibold text-white transition hover:text-white/80"
                >
                  Prohlédnout šablony →
                </a>
              </Reveal>

              <Reveal delay={0.75} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white">
                <span className="flex items-center gap-1.5">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12l5 5L20 7"/></svg>
                  </span>
                  Bez kreditní karty
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12l5 5L20 7"/></svg>
                  </span>
                  Bez závazku
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12l5 5L20 7"/></svg>
                  </span>
                  Zrušíte kdykoli
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
                      <img src="/templates/clinic-02/hero-bg.webp" alt="Náhled webu beauty kliniky" loading="lazy" className="h-full w-full object-cover" />
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
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#22c55e]">Publikováno</div>
                    <div className="text-[12.5px] font-semibold text-white">Před 3 sekundami</div>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      <StickyCTA onOpen={() => openModal()} />

      {showModal && (
        <OnboardingModal
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
