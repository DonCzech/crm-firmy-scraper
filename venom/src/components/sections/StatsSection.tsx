"use client";

import { useEffect, useRef, useState } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
}

type StatItem = { value?: string | number; label?: string; icon?: string };

export function StatsSection({ content, variant, sectionId }: Props) {
  const title = String(content.title ?? "");
  const lead = String(content.lead ?? "");
  const items = ((content.items as StatItem[]) ?? []).slice(0, 8);

  if (variant === "florist-01-stats") return <StatsFlorist01 content={content} sectionId={sectionId} />;
  if (variant === "sweet-01-usp") return <StatsSweet01 content={content} sectionId={sectionId} />;

  if (variant === "barber-stats-counter-4col") {
    return (
      <StatsBarber04
        title={title}
        lead={lead}
        items={items}
        sectionId={sectionId}
      />
    );
  }

  if (variant === "fitness-02-stats-bar") {
    return <StatsFitness02 items={items} sectionId={sectionId} />;
  }

  if (variant === "reality-05-stats") {
    return <StatsReality05 content={content} items={items} sectionId={sectionId} />;
  }
  if (variant === "lawyer-01-stats") {
    return <StatsLawyer01 items={items} sectionId={sectionId} />;
  }

  if (variant === "stavba-03-stats") {
    return <StatsStavba03 content={content} sectionId={sectionId} />;
  }

  if (variant === "catering-01-partners") {
    return <StatsCatering01Partners content={content} sectionId={sectionId} />;
  }

  if (variant === "catering-01-timeline") {
    return <StatsCatering01Timeline content={content} sectionId={sectionId} />;
  }
  if (variant === "autoskola-01-stats") {
    return <StatsAutoskola01 content={content} sectionId={sectionId} />;
  }
  if (variant === "lang-01-stats") {
    return <StatsLang01 content={content} sectionId={sectionId} />;
  }
  if (variant === "edu-01-stats") {
    return <StatsEdu01 content={content} sectionId={sectionId} />;
  }
  if (variant === "kids-01-stats") return <StatsKids01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-01-stats") return <StatsUcetni01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-03-stats") return <StatsUcetni03 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-02-stats") return <StatsUcetni02 content={content} sectionId={sectionId} />;
  if (variant === "solar-01-stats") return <StatsSolar01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-04-stats") return <StatsUcetni04 content={content} sectionId={sectionId} />;
  if (variant === "klima-01-stats")  return <StatsKlima01  content={content} sectionId={sectionId} />;
  if (variant === "solar-03-stats")  return <StatsSolar03  content={content} sectionId={sectionId} />;
  if (variant === "clean-02-stats")  return <StatsClean02  content={content} sectionId={sectionId} />;
  if (variant === "hotel-02-features") return <StatsHotel02Features content={content} sectionId={sectionId} />;
  if (variant === "events-01-stats")   return <StatsEvents01        content={content} sectionId={sectionId} />;

  // default — generic centered 4-col with bold numbers
  return (
    <section className="py-16 px-6" style={{ backgroundColor: "var(--color-surface, #f4f6f7)" }}>
      <div className="max-w-5xl mx-auto text-center">
        {title && (
          <h2
            className="uppercase mb-6"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 300, fontSize: "clamp(22px, 2.2vw, 34px)", color: "var(--color-primary)" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10">
          {items.map((it, i) => (
            <div key={i}>
              <div style={{ fontSize: 48, fontWeight: 700, color: "var(--color-text)" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(it.value ?? "")} tag="span" />
              </div>
              <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--color-text-muted)" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(it.label ?? "")} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBarber04({
  title,
  lead,
  items,
  sectionId,
}: {
  title: string;
  lead: string;
  items: StatItem[];
  sectionId: number;
}) {
  return (
    <section
      className="relative"
      style={{ padding: "80px 24px", backgroundColor: "#f4f6f7" }}
      data-template="barber-04"
    >
      <div className="max-w-[1180px] mx-auto text-center">
        {title && (
          <h2
            className="uppercase"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 300,
              fontSize: "clamp(22px, 2.2vw, 34px)",
              letterSpacing: 0,
              color: "#d5b981",
              margin: "0 auto 14px",
              lineHeight: 1.2,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        )}
        <div
          aria-hidden
          className="mx-auto"
          style={{ width: 60, height: 2, backgroundColor: "#d5b981", opacity: 0.7, margin: "0 auto 24px" }}
        />
        {lead && (
          <p
            style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(13px, 1vw, 15px)",
              color: "#666",
              maxWidth: 720,
              margin: "0 auto 56px",
              lineHeight: 1.75,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-2">
          {items.map((it, i) => (
            <StatBarber04Item key={`stat-${i}`} item={it} sectionId={sectionId} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatBarber04Item({ item, sectionId, idx }: { item: StatItem; sectionId: number; idx: number }) {
  const target = parseNumber(String(item.value ?? "0"));
  const suffix = String(item.value ?? "").replace(/[0-9 .,\s]/g, "");
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || target <= 0) {
      setCount(target);
      return;
    }
    const el = ref.current;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const dur = 1600;
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        setCount(Math.round(target * eased));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && start());
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const formatted = target > 0 ? count.toLocaleString("cs-CZ") : String(item.value ?? "");

  return (
    <div ref={ref} className="flex flex-col items-center">
      <StatIcon name={item.icon} />
      <div
        style={{
          fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
          fontWeight: 400,
          fontSize: "clamp(40px, 4vw, 64px)",
          lineHeight: 1,
          color: "#1a1a1a",
          marginTop: 14,
        }}
      >
        {formatted}
        {suffix && <span style={{ color: "#d5b981" }}>{suffix}</span>}
      </div>
      <div
        className="uppercase"
        style={{
          fontFamily: "'Lato',Helvetica,Arial,sans-serif",
          fontSize: 11,
          letterSpacing: 2,
          color: "#999",
          marginTop: 8,
        }}
      >
        <GenericEditableText sectionId={sectionId} field={`items.${idx}.label`} value={String(item.label ?? "")} tag="span" />
      </div>
    </div>
  );
}

function parseNumber(v: string): number {
  const n = Number(v.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function StatIcon({ name }: { name?: string }) {
  const p = {
    width: 40,
    height: 40,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#d5b981",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "users":
      return (
        <svg {...p}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "scissors":
      return (
        <svg {...p}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...p}>
          <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
          <path d="M19 14l.7 2.1L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.9L19 14z" />
        </svg>
      );
    case "shop":
      return (
        <svg {...p}>
          <path d="M3 9l2-5h14l2 5" />
          <path d="M3 9v11h18V9" />
          <path d="M9 22V12h6v10" />
        </svg>
      );
    default:
      return null;
  }
}

// ── fitness-02-stats-bar ──────────────────────────────────────────────────────
// 4-col horizontal bar — 1:1 fitnessvictory.cz
// Black bg, Archivo Black big white numbers + pink suffix + muted label
// Pink dashed divider between columns
// ─────────────────────────────────────────────────────────────────────────────
type Fitness02StatItem = { number?: string | number; suffix?: string; label?: string };

function StatsFitness02({ items, sectionId }: { items: Fitness02StatItem[]; sectionId: number }) {
  const ACCENT = "#FF5500";
  const FONT_H = "'Archivo Black', sans-serif";
  const FONT_B = "'Montserrat', sans-serif";

  const stats = items as Fitness02StatItem[];

  return (
    <section
      style={{
        backgroundColor: "#000000",
        borderTop: "1px solid rgba(255,85,0,0.2)",
        borderBottom: "1px solid rgba(255,85,0,0.2)",
        padding: "60px 0",
        fontFamily: FONT_B,
      }}
      data-template="fitness-02"
    >
      <div
        className="f02-stats-grid"
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
          gap: 0,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "0 24px",
              borderRight: i < stats.length - 1 ? "1px solid rgba(255,85,0,0.25)" : "none",
            }}
          >
            <div
              style={{
                fontFamily: FONT_H,
                fontSize: "clamp(48px, 6vw, 72px)",
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              <GenericEditableText sectionId={sectionId} field={`items.${i}.number`} value={String(s.number ?? "")} tag="span" />
              {s.suffix && (
                <span style={{ color: ACCENT, fontSize: "0.75em" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.suffix`} value={String(s.suffix)} tag="span" />
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: FONT_B,
                fontSize: 15,
                fontWeight: 400,
                color: "#C3C3C3",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(s.label ?? "")} tag="span" />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .f02-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 40px 0 !important;
          }
          .f02-stats-grid > div {
            border-right: none !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── reality-05-stats ──────────────────────────────────────────────────────────
// Ref: ondrejkucera.com — sekce s počítadly
// Tmavý #1c1c1c bg s bg-image + rgba(0,0,0,0.72) overlay
// 3-col: velké zlaté (#CFA968) číslo + suffix | bílý popisek
// border-right 1px rgba(255,255,255,0.12) mezi sloupci
// ─────────────────────────────────────────────────────────────────────────────
type StatItem05 = StatItem & { suffix?: string };

function StatsReality05({ content, items: rawItems, sectionId }: { content: Record<string, unknown>; items: StatItem[]; sectionId: number }) {
  const items = rawItems as StatItem05[];
  const bgImage = String(content.bgImage ?? "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&h=600&fit=crop&q=80");

  const GOLD  = "#CFA968";
  const WHITE = "#ffffff";
  const SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  // Animovaný counter (pouze pro display, nezávislý na editaci)
  const [counts, setCounts] = useState<number[]>(items.map(() => 0));
  const ref = useRef<HTMLElement | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          items.forEach((item, i) => {
            const target = parseInt(String(item.value ?? "0").replace(/\D/g, ""), 10) || 0;
            const duration = 1600;
            const steps = 40;
            let step = 0;
            const interval = setInterval(() => {
              step++;
              const progress = step / steps;
              const eased = 1 - Math.pow(1 - progress, 3);
              setCounts(prev => { const next = [...prev]; next[i] = Math.round(eased * target); return next; });
              if (step >= steps) clearInterval(interval);
            }, duration / steps);
          });
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [items]);

  return (
    <section
      ref={ref}
      style={{ position: "relative", overflow: "hidden", backgroundColor: "#1c1c1c" }}
      data-r05-stats
    >
      {/* BG foto — editovatelné přes GenericEditableImage */}
      <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt="" className="absolute inset-0 z-0" style={{ position: "absolute" }}>
        <img src={bgImage} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </GenericEditableImage>
      {/* pointerEvents none: kliky prochází na GenericEditableImage pod ním */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.72)", zIndex: 1, pointerEvents: "none" }} />

      {/* Grid */}
      <div
        style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "72px clamp(20px,5vw,60px)", display: "grid", gridTemplateColumns: `repeat(${items.length || 3}, 1fr)` }}
        className="r05-stats-grid"
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "24px 16px",
              borderRight: i < items.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
            }}
          >
            <div style={{ fontFamily: SANS, fontSize: "clamp(40px,5vw,64px)", fontWeight: 700, color: GOLD, lineHeight: 1, marginBottom: 12 }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(item.value ?? "")} tag="span" />
              {item.suffix && (
                <GenericEditableText sectionId={sectionId} field={`items.${i}.suffix`} value={String(item.suffix)} tag="span" style={{ fontSize: "clamp(24px,3vw,38px)", color: GOLD }} />
              )}
            </div>
            <GenericEditableText
              sectionId={sectionId} field={`items.${i}.label`} value={String(item.label ?? "")} tag="p"
              style={{ fontFamily: SANS, fontSize: 15, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.4 }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .r05-stats-grid { grid-template-columns: 1fr !important; }
          .r05-stats-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.12); }
          .r05-stats-grid > div:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}

// ── lawyer-01-stats ───────────────────────────────────────────────────────────
// Karmínový pás (#a70336), 4 čísla vedle sebe (200+/5000+/12/110+),
// bílé hodnoty Raleway bold, bílé popisky, svislé oddělovače rgba
// ─────────────────────────────────────────────────────────────────────────────
function StatsLawyer01({ items, sectionId }: { items: Array<{ value: string; label: string }>; sectionId: number }) {
  const CRIMSON = "#a70336";
  const WHITE   = "#ffffff";
  const FONT    = "'Source Sans 3','Source Sans Pro','Raleway','Helvetica Neue',Arial,sans-serif";

  const defaultItems = [
    { value: "200+",   label: "právníků a daňových poradců" },
    { value: "5 000+", label: "klientů" },
    { value: "12",     label: "jazyků" },
    { value: "110+",   label: "zemí" },
  ];
  const data = items.length > 0 ? items : defaultItems;

  return (
    <section style={{ backgroundColor: CRIMSON, padding: "0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div className="l01-stats-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
          {data.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "52px 32px",
                textAlign: "center",
                borderRight: i < data.length - 1 ? "1px solid rgba(255,255,255,0.2)" : "none",
              }}
            >
              <div style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                color: WHITE,
                lineHeight: 1,
                marginBottom: 10,
                letterSpacing: "-0.01em",
              }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(item.value)} tag="span" />
              </div>
              <div style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                color: "rgba(255,255,255,0.82)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                lineHeight: 1.4,
              }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label)} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .l01-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .l01-stats-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.15); }
          .l01-stats-grid > div:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}

// ── stavba-03-stats ───────────────────────────────────────────────────────────
// 3-col USP karty pod hero — bílé bg, oranžová číslo/ikona, tmavý titulek, šedý popis
// ─────────────────────────────────────────────────────────────────────────────
function StatsStavba03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#fa7d19";
  const DARK   = "#1b1a1a";
  const GRAY   = "#666666";
  const FONT   = "'Roboto', sans-serif";

  const usps = (content.usps as Array<{ icon: string; title: string; description: string }>) ?? [];

  const icons: Record<string, JSX.Element> = {
    shield: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    users:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    tool:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    check:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>,
    home:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    star:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  };

  return (
    <section style={{ backgroundColor: "#fff", fontFamily: FONT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
        <div className="stavba03-usps-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(usps.length, 3)}, 1fr)`, gap: 32 }}>
          {usps.map((usp, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, padding: "32px 28px", backgroundColor: "#f9f9f9", borderTop: `3px solid ${ORANGE}` }}>
              <div style={{ color: ORANGE, display: "flex" }}>
                {icons[usp.icon] ?? icons.check}
              </div>
              <div style={{ fontFamily: FONT, fontSize: "1.05rem", fontWeight: 700, color: DARK, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`usps.${i}.title`} value={usp.title} tag="span" />
              </div>
              <div style={{ fontFamily: FONT, fontSize: "0.9rem", color: GRAY, lineHeight: 1.65 }}>
                <GenericEditableText sectionId={sectionId} field={`usps.${i}.description`} value={usp.description} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .stavba03-usps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── catering-01-partners ──────────────────────────────────────────────────────
// Marquee pás s klientskými jmény — nekonečný CSS scroll
// ─────────────────────────────────────────────────────────────────────────────
function StatsCatering01Partners({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#1c373a";
  const CREAM = "#fefff1";
  const GOLD  = "#baae8c";
  const SERIF = "'Libre Baskerville', Georgia, serif";
  const SANS  = "'Source Sans 3', 'Source Sans Pro', sans-serif";

  const heading = String(content.heading ?? "Důvěřují nám");
  const items = (content.items as Array<{ name: string }>) ?? [];

  return (
    <section
      data-variant="catering-01-partners"
      style={{ background: CREAM, padding: "4rem 0 4.4rem", overflow: "hidden" }}
    >
      <style>{`
        @keyframes c01pmarquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .c01p-track { display: flex; align-items: center; width: max-content; animation: c01pmarquee 28s linear infinite; will-change: transform; }
        .c01p-track:hover { animation-play-state: paused; }
        .c01p-name { font-family: ${SERIF}; font-size: 1.5rem; font-weight: 400; font-style: italic; color: ${TEAL}; letter-spacing: .04em; text-transform: uppercase; opacity: .65; padding: 0 2.8rem; white-space: nowrap; transition: opacity .2s; cursor: default; }
        .c01p-name:hover { opacity: 1; }
        .c01p-dot { color: ${GOLD}; font-size: .9rem; flex-shrink: 0; opacity: .8; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: "2.8rem" }}>
        <span style={{ fontFamily: SANS, fontSize: "1.05rem", fontWeight: 700, letterSpacing: ".45rem", textTransform: "uppercase", color: GOLD }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </span>
      </div>

      <div style={{ overflow: "hidden" }}>
        <div className="c01p-track">
          {/* first set — editable */}
          {items.map((item, i) => (
            <span key={`a-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
              <span className="c01p-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </span>
              <span className="c01p-dot" aria-hidden="true">◆</span>
            </span>
          ))}
          {/* duplicate for seamless loop — aria-hidden */}
          <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center" }}>
            {items.map((item, i) => (
              <span key={`b-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
                <span className="c01p-name">{item.name}</span>
                <span className="c01p-dot">◆</span>
              </span>
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}

// ── catering-01-timeline ──────────────────────────────────────────────────────
// Horizontální timeline milníků firmy od 2004
// ─────────────────────────────────────────────────────────────────────────────
function StatsCatering01Timeline({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#1c373a";
  const CREAM = "#fefff1";
  const GOLD  = "#baae8c";
  const SURF  = "#eae6db";
  const SERIF = "'Libre Baskerville', Georgia, serif";
  const SANS  = "'Source Sans 3', 'Source Sans Pro', sans-serif";

  const heading = String(content.heading ?? "Náš příběh");
  const items = (content.items as Array<{ year: string; text: string }>) ?? [];

  return (
    <section
      data-variant="catering-01-timeline"
      style={{ background: TEAL, padding: "7rem 0 8rem", overflow: "hidden" }}
    >
      <style>{`
        .c01tl-wrap { max-width: calc(100% - 3.2rem); margin: 0 auto; }
        .c01tl-head { text-align: center; margin-bottom: 5.6rem; }
        .c01tl-kicker { font-family: ${SANS}; font-size: 1.05rem; font-weight: 700; letter-spacing: .45rem; text-transform: uppercase; color: ${GOLD}; display: block; margin-bottom: 1.2rem; }
        .c01tl-title { font-family: ${SERIF}; font-size: 3.6rem; line-height: 4.4rem; font-weight: 300; font-style: italic; color: ${CREAM}; margin: 0; text-transform: uppercase; }
        .c01tl-scroll { overflow-x: auto; padding-bottom: 2rem; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .c01tl-scroll::-webkit-scrollbar { display: none; }
        .c01tl-track { display: flex; align-items: flex-start; gap: 0; min-width: max-content; position: relative; padding-top: 2rem; }
        .c01tl-track::before { content: ""; position: absolute; top: 2.3rem; left: 0; right: 0; height: .1rem; background: rgba(186,174,140,.3); }
        .c01tl-item { display: flex; flex-direction: column; align-items: flex-start; padding: 0 3.2rem 0 0; min-width: 26rem; max-width: 30rem; position: relative; }
        .c01tl-dot { width: 1rem; height: 1rem; border-radius: 50%; background: ${GOLD}; border: .2rem solid ${TEAL}; outline: .1rem solid ${GOLD}; flex-shrink: 0; margin-bottom: 2rem; position: relative; z-index: 1; }
        .c01tl-year { font-family: ${SANS}; font-size: 1.1rem; font-weight: 800; letter-spacing: .3rem; color: ${GOLD}; margin-bottom: .8rem; }
        .c01tl-text { font-family: ${SANS}; font-size: 1.4rem; line-height: 2.1rem; color: ${SURF}; font-weight: 400; }
        @media(min-width: 1025px) {
          .c01tl-wrap { max-width: calc(100% - 6.4rem); }
          .c01tl-title { font-size: 4.8rem; line-height: 5.6rem; }
          .c01tl-scroll { overflow-x: visible; }
          .c01tl-track { min-width: unset; }
          .c01tl-item { min-width: 0; flex: 1; }
        }
      `}</style>

      <div className="c01tl-wrap">
        <div className="c01tl-head">
          <span className="c01tl-kicker">milníky</span>
          <h2 className="c01tl-title">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>
        <div className="c01tl-scroll">
          <div className="c01tl-track">
            {items.map((item, i) => (
              <div key={i} className="c01tl-item">
                <div className="c01tl-dot" aria-hidden="true" />
                <div className="c01tl-year">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.year`} value={item.year} tag="span" />
                </div>
                <div className="c01tl-text">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── florist-01-stats ─────────────────────────────────────────────────────────
// 1:1 freja.cz trust bar: 4-col grid, icon #8b9fdb stroke, bold label + muted sub
function StatsFlorist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ARIMO = "Arimo, Arial, sans-serif";
  const ICON_COLOR = "#1c1f28";
  const LABEL_COLOR = "#1c1f28";
  const SUB_COLOR = "#6b7085";

  interface Item { icon?: string; title?: string; subtitle?: string; }
  const items = (content.items as Item[]) ?? [];

  const IconSvg = ({ name }: { name?: string }) => {
    const props = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: ICON_COLOR, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
    switch (name) {
      case "truck":
        return <svg {...props}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
      case "store":
        return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
      case "star":
        return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
      case "camera":
        return <svg {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
      case "clock":
        return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
      default:
        return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    }
  };

  return (
    <section style={{ background: "#ffffff", fontFamily: ARIMO }}>
      <style>{`
        .f01-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; align-items: start; }
        .f01-stats-item { display: flex; align-items: center; gap: 12px; justify-content: center; }
        @media (max-width: 749px) {
          .f01-stats-grid { grid-template-columns: repeat(2,1fr); gap: 20px 16px; }
          .f01-stats-item { justify-content: flex-start; }
        }
        @media (max-width: 374px) {
          .f01-stats-grid { grid-template-columns: 1fr; gap: 16px; }
          .f01-stats-item { justify-content: center; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 3rem 24px" }}>
        <div className="f01-stats-grid">
          {items.map((item, i) => (
            <div key={i} className="f01-stats-item">
              <div style={{ color: ICON_COLOR, flexShrink: 0, display: "flex", alignItems: "center" }}>
                <IconSvg name={item.icon} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: LABEL_COLOR }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
                </span>
                <span style={{ fontSize: 12, lineHeight: 1.3, color: SUB_COLOR }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.subtitle`} value={item.subtitle ?? ""} tag="span" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── sweet-01-usp ──────────────────────────────────────────────────────────────
// Ref: ovocnysvetozor.cz — 3-col feature-top strip
// White #fefefe bg; red SVG icons 64px; dark H3; gray #9a9a9a body
// ─────────────────────────────────────────────────────────────────────────────
function StatsSweet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items = ((content.items as Array<{ icon?: string; title?: string; body?: string }>) ?? []).slice(0, 3);

  const BG   = "#fefefe";
  const RED  = "#E2001A";
  const DARK = "#0a0a0a";
  const GRAY = "#9a9a9a";
  const FONT = "'Roboto', 'Helvetica Neue', Arial, sans-serif";

  const icons: Record<string, JSX.Element> = {
    bake: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 8C24 8 14 16 14 26c0 6 3 11 8 14v8h20v-8c5-3 8-8 8-14C50 16 40 8 32 8Z" stroke={RED} strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M22 48h20M24 54h16" stroke={RED} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="26" r="5" fill={RED} opacity="0.2"/>
        <circle cx="32" cy="26" r="2.5" fill={RED}/>
      </svg>
    ),
    fresh: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 56C32 56 12 40 12 26a20 20 0 0140 0C52 40 32 56 32 56Z" stroke={RED} strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M32 56V30" stroke={RED} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M32 38l-8-8M32 44l8-8" stroke={RED} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="26" r="4" fill={RED} opacity="0.15"/>
      </svg>
    ),
    clock: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" stroke={RED} strokeWidth="2.5"/>
        <path d="M32 18v14l8 6" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="32" r="2.5" fill={RED}/>
      </svg>
    ),
  };

  const defaultItems = [
    { icon: "bake",  title: "Pečeme si sami",         body: "Od roku 2010 máme vlastní pekárnu. Připravujeme v ní všechny naše korpusy klasickým domácím způsobem." },
    { icon: "fresh", title: "Jen čerstvé suroviny",   body: "U všech produktů dbáme na čerstvost i původ surovin. Žádné náhražky u nás nemají místo." },
    { icon: "clock", title: "Otevřeno 7 dní v týdnu", body: "Po celé Praze máme pobočky otevřené od pondělí do neděle. Chuť na sladké nepočká." },
  ];

  const rows = items.length > 0 ? items : defaultItems;

  return (
    <section id={String(sectionId)} style={{ backgroundColor: BG, fontFamily: FONT, padding: "48px 0", borderBottom: "1px solid #e8e8e8" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 4vw, 60px)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
        {rows.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16,
              padding: "24px 32px",
              borderRight: i < rows.length - 1 ? "1px solid #e8e8e8" : "none",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {icons[item.icon ?? ""] ?? icons.bake}
            </div>
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontFamily: FONT, fontSize: "1.15rem", fontWeight: 700, color: DARK, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
              </h3>
              <p style={{ margin: 0, fontFamily: FONT, fontSize: "0.9rem", color: GRAY, lineHeight: 1.6 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.body`} value={item.body ?? ""} tag="span" />
              </p>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 700px) {
          #${sectionId} > div { grid-template-columns: 1fr !important; }
          #${sectionId} > div > div { border-right: none !important; border-bottom: 1px solid #e8e8e8; }
          #${sectionId} > div > div:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}

// ─── autoskola-01 Stats — mřížka poboček na oranžovém pozadí ─────────────────
function StatsAutoskola01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading = String(content.heading ?? "Kde nás najdete");
  const subheading = String(content.subheading ?? "Působíme ve 14 městech po celé České republice.");
  const items = ((content.items as { value?: string; label?: string }[]) ?? []);

  const ORANGE = "#f16823";
  const FONT = "'Roboto', sans-serif";

  return (
    <section id={String(sectionId)} style={{ backgroundColor: ORANGE, padding: "72px clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#fff", margin: "0 0 10px", letterSpacing: "0.02em" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
        <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)", color: "rgba(255,255,255,0.85)", margin: "0 0 52px" }}>
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.12)", padding: "28px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "background 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.22)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.12)"; }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1rem, 1.8vw, 1.15rem)", color: "#fff", letterSpacing: "0.02em" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(item.value ?? "")} tag="span" />
              </span>
              <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.72)", letterSpacing: "0.04em" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label ?? "")} tag="span" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── lang-01-stats ─────────────────────────────────────────────────────────────
// Redesign s animací:
// - Dark #1a1a2e bg, červená #e63946 top border 3px
// - 4-col grid s vertikálními oddělovači
// - Count-up animace čísel při vstupu do viewportu (IntersectionObserver)
// - Fade+slide-up pro každý sloupec (stagger 100ms)
// ─────────────────────────────────────────────────────────────────────────────
function StatsLang01({ content, sectionId }: { content: Record<string, unknown>; sectionId: string }) {
  const items = (content.items as Array<{ value: string; label: string }>) ?? [
    { value: "35 let", label: "Na trhu" },
    { value: "9",      label: "Jazyků" },
    { value: "12 000+",label: "Studentů ročně" },
    { value: "⭐ 4.9", label: "Hodnocení Google" },
  ];

  const FONT = "'Inter', -apple-system, sans-serif";
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState<number[]>(items.map(() => 0));

  // Parse numeric part from value string e.g. "12 000+" → 12000, "35 let" → 35, "4.9" → 4.9
  const parseNum = (val: string): number | null => {
    const cleaned = val.replace(/\s/g, "").replace(",", ".");
    const match = cleaned.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  };

  // Build display string from animated count + original suffix
  const buildDisplay = (item: { value: string }, animCount: number): string => {
    const num = parseNum(item.value);
    if (num === null) return item.value; // emoji / non-numeric — show as-is
    const val = item.value;
    // reconstruct: prefix (emoji/letters before digits) + animated number + suffix
    const prefixMatch = val.match(/^([^0-9]*)/);
    const suffixMatch = val.match(/[\d.,\s]+(.*)$/);
    const prefix = prefixMatch ? prefixMatch[1] : "";
    const suffix = suffixMatch ? suffixMatch[1] : "";
    // format number same way as original (keep spaces as thousands sep if original had them)
    const hasSpace = /\d\s\d/.test(val.replace(/\s+/g, " "));
    let numStr: string;
    if (Number.isInteger(num) && Number.isInteger(animCount)) {
      numStr = hasSpace ? animCount.toLocaleString("cs-CZ") : String(animCount);
    } else {
      numStr = animCount.toFixed(1);
    }
    return prefix + numStr + suffix;
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
        // animate each numeric value
        items.forEach((item, idx) => {
          const target = parseNum(item.value);
          if (target === null) return;
          const duration = 1400;
          const steps = 60;
          const interval = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Number.isInteger(target)
              ? Math.round(target * ease)
              : Math.round(target * ease * 10) / 10;
            setCounts(prev => { const next = [...prev]; next[idx] = current; return next; });
            if (step >= steps) clearInterval(timer);
          }, interval);
        });
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        .lang01stats{padding:51px 34px;background:#1a1a2e;font-family:${FONT};border-top:3px solid #e63946;}
        .lang01stats-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);text-align:center;}
        .lang01stats-col{padding:0 17px;border-right:1px solid rgba(255,255,255,0.08);opacity:0;transform:translateY(20px);transition:opacity 0.55s ease,transform 0.55s ease;}
        .lang01stats-col:last-child{border-right:none;}
        .lang01stats-col.visible{opacity:1;transform:translateY(0);}
        .lang01stats-num{font-size:44px;font-weight:800;color:#e63946;letter-spacing:-1.5px;line-height:1;}
        .lang01stats-lbl{font-size:10px;color:#a0a0b0;margin-top:9px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;}
        @media(max-width:700px){
          .lang01stats-inner{grid-template-columns:repeat(2,1fr);row-gap:30px;}
          .lang01stats-col{border-right:none;padding:0 8px;}
          .lang01stats-col:nth-child(1),.lang01stats-col:nth-child(2){border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:24px;}
          .lang01stats{padding:37px 16px;}
          .lang01stats-num{font-size:32px;}
        }
      `}</style>
      <section className="lang01stats" ref={sectionRef} data-template="lang-01">
        <div className="lang01stats-inner">
          {items.map((item, i) => {
            const num = parseNum(item.value);
            const display = num !== null && visible ? buildDisplay(item, counts[i]) : item.value;
            return (
              <div
                key={i}
                className={`lang01stats-col${visible ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <div className="lang01stats-num">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={display} tag="span" />
                </div>
                <div className="lang01stats-lbl">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label)} tag="span" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ── edu-01-stats ──────────────────────────────────────────────────────────────
// Navy gradient bg, 4 čítače ve spreadu, dekorativní kruhy.
// Každý stat: velké bílé číslo + šedý popisek. Bez animací JS.
// ─────────────────────────────────────────────────────────────────────────────
function StatsEdu01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number | string }) {
  const NAVY = "#132339";
  const BLUE = "#0059df";
  const FONT = "'Libre Franklin', Arial, sans-serif";

  const heading = String(content.heading ?? "Demo Akademie v číslech");
  const items   = (content.items as Array<{ value: string; label: string }>) ?? [
    { value: "34 000+", label: "spokojených studentů" },
    { value: "1 300+",  label: "aktivních lektorů" },
    { value: "96 %",    label: "úspěšnost u zkoušek" },
    { value: "10+",     label: "let zkušeností" },
  ];

  return (
    <>
      <style>{`
        .edu01st{position:relative;background:linear-gradient(135deg,${NAVY} 0%,#0d1b2e 100%);padding:88px 40px;font-family:${FONT};overflow:hidden;}
        .edu01st::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;border-radius:50%;border:70px solid rgba(0,89,223,0.08);pointer-events:none;}
        .edu01st::after{content:'';position:absolute;bottom:-80px;left:-80px;width:300px;height:300px;border-radius:50%;border:50px solid rgba(0,89,223,0.06);pointer-events:none;}
        .edu01st-inner{position:relative;z-index:1;max-width:1280px;margin:0 auto;}
        .edu01st-head{text-align:center;margin-bottom:56px;}
        .edu01st-head h2{font-family:${FONT};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#fff;margin:0;letter-spacing:-0.04em;}
        .edu01st-head h2 span{color:${BLUE};}
        .edu01st-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;}
        .edu01st-item{padding:40px 24px;text-align:center;position:relative;}
        .edu01st-item:not(:last-child)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:rgba(255,255,255,0.1);}
        .edu01st-val{font-family:${FONT};font-size:clamp(2.4rem,5vw,3.8rem);font-weight:800;color:#fff;line-height:1;margin-bottom:10px;letter-spacing:-0.04em;}
        .edu01st-val span{color:${BLUE};}
        .edu01st-lbl{font-size:clamp(13px,1.2vw,15px);color:rgba(255,255,255,0.55);font-weight:500;line-height:1.4;}
        @media(max-width:768px){
          .edu01st-grid{grid-template-columns:1fr 1fr;gap:0;}
          .edu01st-item:nth-child(odd)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:rgba(255,255,255,0.1);}
          .edu01st-item:not(:last-child)::after{display:none;}
          .edu01st-item{padding:32px 16px;}
          .edu01st{padding:64px 24px;}
        }
      `}</style>

      <section id={String(sectionId)} className="edu01st" data-template="edu-01-stats">
        <div className="edu01st-inner">
          <div className="edu01st-head">
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
          <div className="edu01st-grid">
            {items.map((item, i) => (
              <div key={i} className="edu01st-item">
                <div className="edu01st-val">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={item.value} tag="span" />
                </div>
                <div className="edu01st-lbl">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={item.label} tag="span" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── kids-01-stats ────────────────────────────────────────────────────── */
function StatsKids01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading = String((content as any).heading ?? "Jak to u nás funguje");
  const items   = ((content as any).items as Array<{
    imageUrl?: string; title: string; subtitle?: string; features?: string[];
  }>) ?? [];

  const sRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = sRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const DARK  = "#1a2a1a";
  const GREEN = "#2d7a4d";
  const LGREEN= "#baeb92";
  const FONT  = "'Gotham Rounded', 'Nunito', 'Trebuchet MS', sans-serif";

  return (
    <section
      ref={sRef}
      id={`section-${sectionId}`}
      style={{ background: "#f8fcf8", padding: "80px 24px 96px", fontFamily: FONT }}
    >
      <style>{`
        .k01stats-heading {
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .k01stats-heading.vis { opacity: 1; transform: translateY(0); }
        .k01stats-card {
          opacity: 0; transform: translateY(32px);
          transition: opacity 0.5s ease, transform 0.5s ease;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        .k01stats-card.vis { opacity: 1; transform: translateY(0); }
        .k01stats-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 10px 32px rgba(45,122,77,0.18) !important;
        }
        .k01stats-img-wrap {
          overflow: hidden;
          height: 200px;
        }
        .k01stats-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .k01stats-card:hover .k01stats-img-wrap img {
          transform: scale(1.06);
        }
        .k01stats-body { padding: 24px 24px 28px; }
        .k01stats-title {
          color: ${GREEN};
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0 0 4px;
        }
        .k01stats-subtitle {
          color: ${DARK};
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 14px;
        }
        .k01stats-feat {
          color: #555;
          font-size: 0.88rem;
          line-height: 1.7;
          padding-left: 0;
          list-style: none;
          margin: 0;
        }
        .k01stats-feat li::before {
          content: "✓ ";
          color: ${GREEN};
          font-weight: 700;
        }
        @media (max-width: 768px) {
          .k01stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className={`k01stats-heading${vis ? " vis" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ color: DARK, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        <div
          className="k01stats-grid"
          style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length || 3, 3)}, 1fr)`, gap: "28px" }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className={`k01stats-card${vis ? " vis" : ""}`}
              style={{ transitionDelay: vis ? `${i * 130}ms` : "0ms" }}
            >
              {item.imageUrl && (
                <div className="k01stats-img-wrap">
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.imageUrl`} src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                    <img src={item.imageUrl} alt={item.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </GenericEditableImage>
                </div>
              )}
              <div className="k01stats-body">
                <p className="k01stats-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </p>
                {item.subtitle && (
                  <p className="k01stats-subtitle">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.subtitle`} value={item.subtitle} tag="span" />
                  </p>
                )}
                {item.features && item.features.length > 0 && (
                  <ul className="k01stats-feat">
                    {item.features.map((f, j) => (
                      <li key={j}>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.features.${j}`} value={f} tag="span" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ucetni-03-stats ───────────────────────────────────────────────────────────
// gpf.cz style: #f8f8f8 bg, 3 numbers with animated count-up
// Each stat: large dark green number + green top-border accent + muted label
// ── ucetni-02-stats ──────────────────────────────────────────────────────────
// Inspired by original grantex.cz counter:
// - Very light surface (#f4f7f5) bg
// - 3 centered columns with gold vertical separator lines
// - Small overline pretext, large green animated number, Montserrat 500 50px
// - Small label below; count-up animation on intersection
// ─────────────────────────────────────────────────────────────────────────────
const STATS_UCN02_PRETEXTS = ["přidejte se k", "let", "zkušených"];

function StatsUcetni02CountItem({ item, idx, sectionId }: {
  item: { value?: string; label?: string };
  idx: number;
  sectionId: number;
}) {
  const GREEN  = "#004835";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const raw = String(item.value ?? "");
  const numStr = raw.replace(/[^0-9]/g, "");
  const target  = parseInt(numStr, 10) || 0;
  const suffix  = raw.replace(/[0-9\s]/g, "");
  const pretext = STATS_UCN02_PRETEXTS[idx] ?? "";

  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || target <= 0) return;
    let started = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started) return;
      started = true;
      io.disconnect();
      const dur = 1400;
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        setCount(Math.round(target * eased));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const formatted = target > 0
    ? count.toLocaleString("cs-CZ").replace(/ /g, " ")
    : raw;

  return (
    <div ref={ref} style={{ textAlign: "center", padding: "0 40px" }}>
      {pretext && (
        <div style={{
          fontFamily: FONT_H,
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "1px",
          color: "#7a9590",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}>
          {pretext}
        </div>
      )}
      <div style={{
        fontFamily: FONT_H,
        fontSize: "clamp(38px, 4vw, 50px)",
        fontWeight: 500,
        color: GREEN,
        lineHeight: 1,
        marginBottom: "14px",
      }}>
        {formatted}{suffix}
      </div>
      <div style={{
        fontFamily: FONT_H,
        fontSize: "15px",
        fontWeight: 500,
        color: "#2d4a42",
        lineHeight: 1.4,
      }}>
        <GenericEditableText sectionId={sectionId} field={`items.${idx}.label`} value={String(item.label ?? "")} tag="span" />
      </div>
    </div>
  );
}

function StatsUcetni02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD = "#bca160";

  const rawItems = (content.items as Array<{ value?: string; label?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { value: "1 600+", label: "spokojených klientů" },
    { value: "10+",    label: "let na trhu" },
    { value: "80+",    label: "zkušených specialistů" },
  ];

  return (
    <>
      <style>{`
        .ucn02stats-wrap {
          background: #f4f7f5;
          padding: 72px 24px;
        }
        .ucn02stats-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          align-items: center;
        }
        .ucn02stats-col { position: relative; }
        .ucn02stats-divider {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 80px;
          width: 1px;
          background: ${GOLD};
          opacity: 0.5;
        }
        @media (max-width: 700px) {
          .ucn02stats-wrap { padding: 48px 20px; }
          .ucn02stats-grid { grid-template-columns: 1fr; gap: 32px; }
          .ucn02stats-divider { display: none; }
        }
        @media (max-width: 960px) and (min-width: 701px) {
          .ucn02stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
      <section className="ucn02stats-wrap" data-template="ucetni-02-stats">
        <div className="ucn02stats-grid">
          {items.map((item, i) => (
            <div key={i} className="ucn02stats-col">
              {i > 0 && <span className="ucn02stats-divider" aria-hidden />}
              <StatsUcetni02CountItem item={item} idx={i} sectionId={sectionId} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function StatsUcetni03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "#002000";
  const GREEN = "#8ec63f";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const rawItems = (content.items as Array<{ value?: string; label?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { value: "1 800",   label: "hypotečních poradců" },
    { value: "161 mld", label: "Kč sjednaných hypoték" },
    { value: "20+",     label: "let zkušeností" },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .ucn03stats-section {
          background: #f8f8f8;
          padding: 64px 40px;
          font-family: ${FONT_B};
        }
        .ucn03stats-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }
        .ucn03stats-item {
          border-top: 3px solid ${GREEN};
          padding-top: 28px;
          text-align: left;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ucn03stats-item.visible {
          opacity: 1;
          transform: none;
        }
        .ucn03stats-item:nth-child(2) { transition-delay: 0.12s; }
        .ucn03stats-item:nth-child(3) { transition-delay: 0.24s; }
        .ucn03stats-value {
          font-family: ${FONT_H};
          font-size: clamp(2.4rem, 4vw, 3.5rem);
          font-weight: 800;
          color: ${DARK};
          line-height: 1;
          margin-bottom: 10px;
        }
        .ucn03stats-label {
          font-size: 1rem;
          color: #737b79;
          line-height: 1.4;
        }
        @media (max-width: 700px) {
          .ucn03stats-section { padding: 48px 20px; }
          .ucn03stats-inner { grid-template-columns: 1fr; gap: 28px; }
          .ucn03stats-item { text-align: center; }
        }
      `}</style>

      <section className="ucn03stats-section" data-template="ucetni-03-stats" ref={ref}>
        <div className="ucn03stats-inner">
          {items.map((item, i) => (
            <div key={i} className={`ucn03stats-item${visible ? " visible" : ""}`}>
              <div className="ucn03stats-value">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(item.value ?? "")} tag="span" />
              </div>
              <div className="ucn03stats-label">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label ?? "")} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ─── ucetni-01-stats ─────────────────────────────────────────────────────────
function parseStatValue(raw: string): { num: number; prefix: string; suffix: string } {
  const match = raw.match(/^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/);
  if (!match) return { num: 0, prefix: "", suffix: raw };
  return { num: parseInt(match[2].replace(",", ""), 10), prefix: match[1], suffix: match[3] };
}

function AnimatedCounter({ value, label, sectionId, index, font, dark, muted, triggered }: {
  value: string; label: string; sectionId: number; index: number;
  font: string; dark: string; muted: string; triggered: boolean;
}) {
  const { num, prefix, suffix } = parseStatValue(value);
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!triggered || num === 0) { setDisplay(num); return; }
    const duration = 1600;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * num));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [triggered, num]);

  return (
    <div className="uc01stats-item">
      <div className="uc01stats-value">
        {prefix}<span style={{ color: dark }}>{display}</span><span style={{ color: "#FFD87A" }}>{suffix}</span>
      </div>
      <div className="uc01stats-label">
        <GenericEditableText sectionId={sectionId} field={`items.${index}.label`} value={label} tag="span" />
      </div>
    </div>
  );
}

function StatsUcetni01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "#202124";
  const MUTED = "#515151";
  const FONT  = "'Space Grotesk', 'Inter', Arial, sans-serif";

  const title = String(content.title ?? "Fakta, která nás definují");
  const body  = String(content.body  ?? "Oslavujeme klíčové momenty, které formovaly naši cestu k přesnosti a spolehlivosti v oblasti účetnictví a financí.");
  const items = (content.items as Array<{ value: string; label: string }>) ?? [];

  const [triggered, setTriggered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="stats" ref={sectionRef} style={{ backgroundColor: "#ffffff", padding: "80px 20px 100px", fontFamily: FONT }}>
      <style>{`
        .uc01stats-inner {
          max-width: 1170px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 60px;
        }
        .uc01stats-left { flex: 0 0 50%; min-width: 0; }
        .uc01stats-right { flex: 0 0 50%; min-width: 0; padding-left: 90px; }
        .uc01stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background-image: url('/templates/ucetni-01/stats-bg.png');
          background-position: center center;
          background-repeat: no-repeat;
          background-size: cover;
          border-radius: 8px;
          padding: 40px 32px;
        }
        .uc01stats-item { padding: 24px 16px; }
        .uc01stats-item:nth-child(1),
        .uc01stats-item:nth-child(2) { border-bottom: 1px solid rgba(32,33,36,0.1); }
        .uc01stats-value {
          font-size: 3rem; font-weight: 700; line-height: 1em;
          margin-bottom: 10px; font-family: ${FONT};
          display: flex; align-items: baseline; gap: 0;
        }
        .uc01stats-label {
          font-size: 1.125rem; font-weight: 400;
          color: ${MUTED}; line-height: 1.3em; font-family: ${FONT};
        }
        @media (max-width: 900px) {
          .uc01stats-inner { flex-direction: column; gap: 40px; }
          .uc01stats-left, .uc01stats-right { flex: none; width: 100%; }
          .uc01stats-right { padding-left: 0; }
          .uc01stats-value { font-size: 2rem; }
        }
        @media (max-width: 600px) {
          .uc01stats-grid { padding: 24px 16px; }
          .uc01stats-item { padding: 16px 8px; }
          .uc01stats-value { font-size: 1.6rem; }
          .uc01stats-label { font-size: 0.9rem; }
        }
      `}</style>
      <div className="uc01stats-inner">
        <div className="uc01stats-left">
          <img src="/templates/ucetni-01/grow.png" alt="" loading="lazy" width={184} height={93} style={{ marginBottom: 24, display: "block" }} />
          <h2 style={{ fontFamily: FONT, fontSize: "3rem", fontWeight: 400, color: DARK, margin: "0 0 20px", lineHeight: 1.2 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT, fontSize: "1rem", color: MUTED, margin: 0, lineHeight: 1.6 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        </div>
        <div className="uc01stats-right">
          <div className="uc01stats-grid">
            {items.slice(0, 4).map((item, i) => (
              <AnimatedCounter
                key={i}
                value={item.value}
                label={item.label}
                sectionId={sectionId}
                index={i}
                font={FONT}
                dark={DARK}
                muted={MUTED}
                triggered={triggered}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── solar-01-stats ────────────────────────────────────────────────────────────
function StatsSolar01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items = ((content.items as Array<{ value: string; label: string }>) ?? []).slice(0, 4);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const CSS = `
    .ss01{background:#071c28;padding:56px 40px;font-family:'Inter',-apple-system,sans-serif;}
    .ss01-inner{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;}
    .ss01-item{background:#0d2a3a;padding:36px 28px;text-align:center;transition:background 0.2s;}
    .ss01-item:hover{background:#112f42;}
    .ss01-val{font-size:clamp(2rem,3.5vw,2.8rem);font-weight:800;letter-spacing:-1px;color:#ff7a00;line-height:1;margin-bottom:8px;}
    .ss01-lbl{font-size:13px;color:rgba(255,255,255,0.6);font-weight:500;text-transform:uppercase;letter-spacing:0.5px;}
    .ss01-line{width:28px;height:2px;background:rgba(255,122,0,0.4);margin:10px auto 0;border-radius:2px;}
    @media(max-width:700px){
      .ss01{padding:40px 20px;}
      .ss01-inner{grid-template-columns:repeat(2,1fr);}
    }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div className="ss01" ref={ref} data-template="solar-01">
        <div className="ss01-inner" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s" }}>
          {items.map((it, i) => (
            <div className="ss01-item" key={i}>
              <div className="ss01-val">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={it.value ?? ""} tag="span" />
              </div>
              <div className="ss01-lbl">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={it.label ?? ""} tag="span" />
              </div>
              <div className="ss01-line" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ucetni-04-stats ──────────────────────────────────────────────────────────
// 1:1 bcas.cz why section + count-up animace + fade/slide-up stagger
// bg: #FBF6EE (cream), value 30px #171F22, label 0.875em #486A72
// ─────────────────────────────────────────────────────────────────────────────
function StatsUcetni04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY  = "#003366";
  const MUTED = "#486A72";
  const BG    = "#FBF6EE";
  const DARK  = "#171F22";
  const FONT  = "'Plus Jakarta Sans', Arial, 'Helvetica Neue', sans-serif";

  const heading  = String(content.heading ?? "Naše zkušenosti pracují pro vás");
  const rawItems = Array.isArray(content.items) ? content.items as Array<{ value?: string; label?: string }> : [];
  const items    = rawItems.length > 0 ? rawItems : [
    { value: "30 000+", label: "klientů ročně" },
    { value: "790+",    label: "poradců po celé ČR" },
    { value: "20",      label: "let na trhu" },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible]   = useState(false);
  const [counts,  setCounts]    = useState<number[]>(items.map(() => 0));

  const parseNum = (val: string): number | null => {
    const m = val.replace(/\s/g, "").match(/[\d.]+/);
    return m ? parseFloat(m[0]) : null;
  };

  const buildDisplay = (val: string, animated: number): string => {
    const num = parseNum(val);
    if (num === null) return val;
    const prefix = val.match(/^([^0-9]*)/)?.[1] ?? "";
    const suffix = val.match(/[\d.,\s]+(.*)$/)?.[1] ?? "";
    const hasSpace = /\d\s\d/.test(val);
    const numStr = Number.isInteger(num) && Number.isInteger(animated)
      ? (hasSpace ? animated.toLocaleString("cs-CZ") : String(animated))
      : animated.toFixed(1);
    return prefix + numStr + suffix;
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      obs.disconnect();
      items.forEach((item, idx) => {
        const target = parseNum(String(item.value ?? ""));
        if (target === null) return;
        const duration = 1600;
        const steps    = 60;
        let step       = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const eased    = 1 - Math.pow(1 - progress, 3);
          const current  = Number.isInteger(target)
            ? Math.round(eased * target)
            : parseFloat((eased * target).toFixed(1));
          setCounts(prev => { const n = [...prev]; n[idx] = current; return n; });
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      });
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        .ucn04stats { background: ${BG}; font-family: ${FONT}; }
        .ucn04stats-inner {
          max-width: 1296px;
          margin: 0 auto;
          padding: 0 24px clamp(56px,4vw,64px);
        }
        .ucn04stats-heading {
          font-size: clamp(13px,1.1vw,15px);
          font-weight: 600;
          color: ${NAVY};
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-align: center;
          padding-top: clamp(40px,4vw,56px);
          padding-bottom: clamp(24px,3vw,36px);
          margin: 0;
        }
        .ucn04stats-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-flow: row wrap;
          justify-content: space-evenly;
          gap: 2rem 1em;
        }
        .ucn04stats-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 14.5em;
          gap: 8px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ucn04stats-item.ucn04stats-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .ucn04stats-value {
          font-size: 30px;
          font-weight: 600;
          color: ${DARK};
          letter-spacing: -0.025em;
          line-height: 1.2;
          font-variant-numeric: tabular-nums;
        }
        .ucn04stats-label {
          font-size: 0.875em;
          color: ${MUTED};
          line-height: 1.35;
        }
        @media (max-width: 600px) {
          .ucn04stats-list { justify-content: center; }
          .ucn04stats-value { font-size: 26px; }
        }
      `}</style>
      <section ref={sectionRef} className="ucn04stats" data-template="ucetni-04-stats">
        <div className="ucn04stats-inner">
          {heading && (
            <p className="ucn04stats-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </p>
          )}
          <ul className="ucn04stats-list">
            {items.map((item, i) => {
              const val  = String(item.value ?? "");
              const disp = visible ? buildDisplay(val, counts[i]) : val;
              return (
                <li
                  key={i}
                  className={`ucn04stats-item${visible ? " ucn04stats-visible" : ""}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <strong className="ucn04stats-value">{disp}</strong>
                  <span className="ucn04stats-label">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label ?? "")} tag="span" />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}

// ── klima-01-stats ────────────────────────────────────────────────────────────
// 1:1 pragoclima.cz: navy bg, 3 položky na střed, count-up + slide-in animace
// ─────────────────────────────────────────────────────────────────────────────
function StatsKlima01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items = ((content.items as Array<{ value?: string; label?: string }>) ?? []);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const NAVY = "#182545";
  const RED  = "#e30016";
  const FONT = "'Outfit', -apple-system, sans-serif";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Parsuje "3 000+" → { num: 3000, prefix: "", suffix: "+" } */
  function parse(raw: string) {
    const clean = raw.replace(/\s/g, "");
    const m = clean.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
    if (!m) return { num: 0, prefix: "", suffix: raw };
    return { num: parseInt(m[2], 10), prefix: m[1], suffix: m[3] };
  }

  /* Hook: count-up čísla od 0 za 1.4s */
  function useCount(target: number, run: boolean, delay = 0) {
    const [val, setVal] = useState(0);
    useEffect(() => {
      if (!run) return;
      const start = performance.now() + delay;
      const dur = 1400;
      let raf: number;
      const tick = (now: number) => {
        const elapsed = Math.max(0, now - start);
        const t = Math.min(elapsed / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(ease * target));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [run, target, delay]);
    return val;
  }

  const parsed = items.map(it => parse(String(it.value ?? "")));
  const c0 = useCount(parsed[0]?.num ?? 0, visible, 0);
  const c1 = useCount(parsed[1]?.num ?? 0, visible, 120);
  const c2 = useCount(parsed[2]?.num ?? 0, visible, 240);
  const counts = [c0, c1, c2];

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .klima-stats-row { flex-direction: column !important; gap: 0 !important; }
        .klima-stats-item { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.15) !important; padding: 32px 24px !important; }
        .klima-stats-item:last-child { border-bottom: none !important; }
      }
    `}</style>
    <section
      ref={ref}
      style={{ backgroundColor: NAVY, padding: "56px 24px", fontFamily: FONT }}
      data-template="klima-01"
    >
      <div className="klima-stats-row" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        {items.map((item, i) => {
          const { prefix, suffix, num } = parsed[i] ?? { num: 0, prefix: "", suffix: "" };
          const display = num > 0
            ? `${prefix}${visible ? counts[i].toLocaleString("cs-CZ") : "0"}${suffix}`
            : String(item.value ?? "");
          return (
            <div
              key={i}
              className="klima-stats-item"
              style={{
                flex: 1, textAlign: "center", padding: "0 32px",
                borderRight: i < items.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${i * 120}ms, transform 0.6s ease ${i * 120}ms`,
              }}
            >
              <div style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", fontWeight: 700, color: RED, lineHeight: 1.1, marginBottom: 12 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(item.value ?? "")} tag="span">
                  {display}
                </GenericEditableText>
              </div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.5, maxWidth: 220, margin: "0 auto" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label ?? "")} tag="span" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
    </>
  );
}

// ── solar-03-stats ────────────────────────────────────────────────────────────
function StatsSolar03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT_M = "'Montserrat', 'Inter', sans-serif";
  const ORANGE = "#ff8b00";
  const DARK   = "#222222";
  const GRAY   = "#575757";

  type Stat = { value?: string; description?: string };
  const title = String(content.title ?? "Jsme ac heating");
  const stats: Stat[] = Array.isArray(content.stats) ? (content.stats as Stat[]) : [];

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .s03stats-grid { grid-template-columns: 1fr !important; }
          .s03stats-item { border-right: none !important; border-bottom: 1px solid #d8d8d8; padding: 24px 16px !important; }
          .s03stats-item:last-child { border-bottom: none !important; }
        }
      `}</style>
      <section style={{ background: "#f3f5f6", padding: "64px 0 72px" }} data-template="solar-03">
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontFamily: FONT_M, fontWeight: 800, fontSize: "clamp(18px,2vw,26px)", color: DARK, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 48px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="s03stats-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 0 }}>
            {stats.map((stat, i) => (
              <div key={i} className="s03stats-item" style={{ textAlign: "center", padding: "0 32px", borderRight: i < stats.length - 1 ? "1px solid #d8d8d8" : "none" }}>
                <div style={{ fontFamily: FONT_M, fontWeight: 800, fontSize: "clamp(22px,2.4vw,32px)", color: ORANGE, lineHeight: 1.2, marginBottom: 12 }}>
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={String(stat.value ?? "")} tag="span" />
                </div>
                <p style={{ fontSize: 14, color: GRAY, margin: 0, lineHeight: 1.6 }}>
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.description`} value={String(stat.description ?? "")} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── clean-02-stats stub (logo trust-strip) ─────────────────────────────────
function StatsClean02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY = "#0e0e53";
  const BLUE = "#019dff";
  const title = String(content.title ?? "Mezi naše spokojené zákazníky patří 40+ firem a 40+ SVJ");

  const LOGOS = [
    { src: "/clones/modryzralok/cdn/681cae1c20d29c335e1c5296_neeco.webp",              alt: "Neeco" },
    { src: "/clones/modryzralok/cdn/681cae1c20d29c335e1c5293_rezidence_ostrovni.webp", alt: "Rezidence Ostrovní" },
    { src: "/clones/modryzralok/cdn/681cae1c843b20affee73c79_prazsky_inovacni_institut.webp", alt: "Pražský inovační institut" },
    { src: "/clones/modryzralok/cdn/681cae1b7f06e8c199a80fc9_mavericks.webp",          alt: "Mavericks" },
    { src: "/clones/modryzralok/cdn/681cae1bdcb797cdee4230eb_marinov_partners.webp",   alt: "Marinov Partners" },
    { src: "/clones/modryzralok/cdn/681cae1b3f8047121580dcf9_epico.svg",               alt: "Epico" },
    { src: "/clones/modryzralok/cdn/681cae1b1b0a5a67e1c78249_semtex.webp",            alt: "Semtex" },
    { src: "/clones/modryzralok/cdn/681cae1b25fcbe847140c5fd_luchter_a_luchterova.webp", alt: "Luchter & Luchterová" },
    { src: "/clones/modryzralok/cdn/681cae1b4ff9148c562c47b5_datasentics.webp",        alt: "Datasentics" },
    { src: "/clones/modryzralok/cdn/681cae1b174454af7d6d85a1_ebsco.svg",              alt: "EBSCO" },
    { src: "/clones/modryzralok/cdn/681cae1b9e808d9501e75e05_nfpk.svg",               alt: "NFPK" },
    { src: "/clones/modryzralok/cdn/681cae1bcceed0bfc512074b_Logo_Praha.svg",          alt: "Praha" },
    { src: "/clones/modryzralok/cdn/6980de5f0ac51c789eac79a1_modryzralok-eurocz.png", alt: "Euro CZ" },
    { src: "/clones/modryzralok/cdn/6980de5f9878e93a1738015e_modryzralok-metro-p-500.png", alt: "Metro" },
  ];

  return (
    <>
      <style>{`
        .c02s-section {
          background: #fff;
          border-top: 1px solid #dfecff;
          border-bottom: 1px solid #dfecff;
          padding: 3.5rem 0 3.75rem;
          font-family: 'Onest', sans-serif;
          overflow: hidden;
        }
        .c02s-title {
          text-align: center;
          font-size: 1.05rem; font-weight: 500;
          color: ${NAVY}; margin: 0 auto 2.5rem;
          max-width: 40rem; padding: 0 1.5rem;
          line-height: 1.5;
        }
        .c02s-title strong { color: ${BLUE}; font-weight: 700; }

        /* marquee strip */
        .c02s-track-wrap {
          position: relative; overflow: hidden;
        }
        /* fade edges */
        .c02s-track-wrap::before,
        .c02s-track-wrap::after {
          content: '';
          position: absolute; top: 0; bottom: 0; width: 8rem; z-index: 2;
          pointer-events: none;
        }
        .c02s-track-wrap::before { left: 0;  background: linear-gradient(to right,  #fff, transparent); }
        .c02s-track-wrap::after  { right: 0; background: linear-gradient(to left, #fff, transparent); }

        .c02s-track {
          display: flex; gap: 3.5rem; align-items: center;
          width: max-content;
          animation: c02s-scroll 30s linear infinite;
        }
        .c02s-track:hover { animation-play-state: paused; }
        @keyframes c02s-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .c02s-logo {
          height: 2rem; width: auto; max-width: 130px;
          object-fit: contain;
          filter: grayscale(100%); opacity: 0.55;
          transition: filter 0.3s, opacity 0.3s;
          flex-shrink: 0;
        }
        .c02s-logo:hover { filter: grayscale(0%); opacity: 1; }
        @media(max-width:600px) { .c02s-section { padding: 2.5rem 0 2.75rem; } .c02s-title { font-size: .95rem; } }
      `}</style>

      <section className="c02s-section" id={`section-${sectionId}`} data-template="clean-02-stats">
        <p className="c02s-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </p>

        <div className="c02s-track-wrap">
          {/* duplicated list for seamless loop */}
          <div className="c02s-track">
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <img key={i} src={l.src} alt={l.alt} className="c02s-logo" loading="lazy" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── hotel-02-features ─────────────────────────────────────────────────────────
function StatsHotel02Features({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c      = (content ?? {}) as Record<string, any>;
  const eyebrow = c.eyebrow ?? "Proč si pobyt u nás skvěle užijete?";
  const title   = c.title   ?? "Nejvýhodnější je rezervace pobytu přímo na našem webu";
  const items: { number: string; title: string; description: string }[] = Array.isArray(c.items) ? c.items : [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@300;400;500;600&display=swap" />
      <style>{`        .h02feat {
          background: #f7f8f9;
          padding: clamp(70px,9vw,110px) clamp(20px,5vw,80px);
          font-family: 'Montserrat', sans-serif;
        }
        .h02feat-header {
          text-align: center; max-width: 760px; margin: 0 auto clamp(48px,6vw,72px);
        }
        .h02feat-eyebrow {
          font-size: 10px; font-weight: 500; letter-spacing: 0.28em;
          text-transform: uppercase; color: #96A1AC; margin: 0 0 16px; display: block;
        }
        .h02feat-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(26px, 3vw, 42px); font-weight: 300;
          color: #1a2332; line-height: 1.2; margin: 0;
        }
        .h02feat-grid {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 28px;
        }
        .h02feat-card {
          background: #fff;
          box-shadow: 0 4px 24px rgba(26,35,50,0.07);
          padding: clamp(28px,3.5vw,48px) clamp(24px,3vw,44px);
          display: flex; gap: 28px; align-items: flex-start;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .h02feat-card:hover {
          box-shadow: 0 8px 36px rgba(26,35,50,0.12);
          transform: translateY(-3px);
        }
        .h02feat-num {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(48px,5vw,72px); font-weight: 300; line-height: 1;
          color: #e8eaec; flex-shrink: 0; user-select: none;
          min-width: 60px;
        }
        .h02feat-body { flex: 1; min-width: 0; }
        .h02feat-card-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(18px,1.8vw,24px); font-weight: 400;
          color: #1a2332; margin: 0 0 12px; line-height: 1.25;
        }
        .h02feat-card-desc {
          font-size: 14px; line-height: 1.8; color: #6b7280;
          font-weight: 300; margin: 0;
        }
        @media (max-width: 700px) {
          .h02feat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="h02feat" data-template="hotel-02-features">
        <div className="h02feat-header">
          <span className="h02feat-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="h02feat-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        <div className="h02feat-grid">
          {items.map((item, i) => (
            <div className="h02feat-card" key={i}>
              <span className="h02feat-num">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.number`} value={item.number ?? `0${i + 1}`} tag="span" />
              </span>
              <div className="h02feat-body">
                <h3 className="h02feat-card-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p className="h02feat-card-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── events-01-stats ───────────────────────────────────────────────────────────
function Ev01StatCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const interval = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * ease));
            if (step >= steps) { clearInterval(timer); setCount(target); }
          }, interval);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function StatsEvents01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD = "#d4b896";
  const items = (content.items as Array<{ value: string; suffix?: string; label: string }>) ?? [];
  return (
    <>
      <style>{`
        .ev01stat { padding: 80px 40px; background: #181818; color: #fff; text-align: center; }
        .ev01stat-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 40px; }
        .ev01stat-num { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(40px, 5vw, 56px); font-weight: 300; color: ${GOLD}; line-height: 1; }
        .ev01stat-lbl { font-family: 'Inter', sans-serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-top: 8px; }
        @media (max-width: 768px) { .ev01stat { padding: 60px 24px; } }
        @media (max-width: 600px) { .ev01stat-inner { grid-template-columns: repeat(2,1fr); gap: 32px; } }
        @media (max-width: 400px) { .ev01stat-inner { grid-template-columns: 1fr; gap: 28px; } }
      `}</style>
      <section className="ev01stat" data-template="events-01-stats">
        <div className="ev01stat-inner">
          {items.map((item, i) => {
            const numericTarget = parseInt(item.value, 10);
            const isNumeric = !isNaN(numericTarget);
            return (
              <div key={i}>
                <div className="ev01stat-num">
                  {isNumeric ? (
                    <Ev01StatCounter target={numericTarget} suffix={item.suffix ?? ""} />
                  ) : (
                    <>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={item.value} tag="span">{item.value}</GenericEditableText>
                      {item.suffix && <span>{item.suffix}</span>}
                    </>
                  )}
                </div>
                <div className="ev01stat-lbl">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={item.label} tag="span">{item.label}</GenericEditableText>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
