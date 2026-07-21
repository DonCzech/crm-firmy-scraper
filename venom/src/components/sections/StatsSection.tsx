"use client";
import type { JSX } from "react";

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

export function StatsSection({ content, variant, sectionId, isAdmin }: Props) {
  const title = String(content.title ?? "");
  const lead = String(content.lead ?? "");
  const items = ((content.items as StatItem[]) ?? []).slice(0, 8);

  if (variant === "proof-01-stats") return <StatsProof01 content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "florist-01-stats") return <StatsFlorist01 content={content} sectionId={sectionId} />;
  if (variant === "sweet-01-usp") return <StatsSweet01 content={content} sectionId={sectionId} />;
  if (variant === "rekonstrukce-01-usp") return <StatsRekonstrukce01Usp content={content} sectionId={sectionId} />;

  if (variant === "barber-stats-counter-4col") {
    const showHeader = (content as Record<string, unknown>).showHeader !== false;
    const eyebrowNum = String((content as Record<string, unknown>).eyebrowNum ?? "03");
    const eyebrow = String((content as Record<string, unknown>).eyebrow ?? "V číslech");
    return (
      <StatsBarber04
        title={title}
        lead={lead}
        items={items}
        sectionId={sectionId}
        showHeader={showHeader}
        eyebrowNum={eyebrowNum}
        eyebrow={eyebrow}
      />
    );
  }

  if (variant === "fitness-02-stats-bar") {
    return <StatsFitness02 items={items} sectionId={sectionId} isAdmin={isAdmin} />;
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
  if (variant === "autoservis-03-stats") return <StatsAutoservis03  content={content} sectionId={sectionId} />;

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
  showHeader = true,
  eyebrowNum = "03",
  eyebrow = "V číslech",
}: {
  title: string;
  lead: string;
  items: StatItem[];
  sectionId: number;
  showHeader?: boolean;
  eyebrowNum?: string;
  eyebrow?: string;
}) {
  return (
    <section
      className="relative"
      style={{ padding: "clamp(80px, 10vw, 120px) 24px", backgroundColor: "#0a0806" }}
      data-template="barber-04"
    >
      <div className="max-w-[1280px] mx-auto text-center">
        {showHeader && (<>
        {/* Industrial numbered eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
            fontFamily: "'Lato',Helvetica,Arial,sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.32em",
            color: "#d5b981",
            textTransform: "uppercase",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="eyebrowNum" value={eyebrowNum} tag="span" style={{ fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif", fontWeight: 400, letterSpacing: "0.10em", fontSize: 14 }} />
          <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </div>

        {title && (
          <h2
            className="uppercase"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 52px)",
              letterSpacing: "0.03em",
              color: "#fff",
              margin: "0 auto 20px",
              lineHeight: 1.1,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        )}
        <div
          aria-hidden
          style={{
            width: 180,
            height: 1,
            margin: "0 auto 32px",
            background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.85) 50%, transparent 100%)",
          }}
        />
        {lead && (
          <p
            style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(14px, 1.05vw, 16px)",
              color: "rgba(255,255,255,0.65)",
              maxWidth: 680,
              margin: "0 auto 72px",
              lineHeight: 1.75,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>
        )}
        </>)}

        <div
          className="b04-stats-grid grid grid-cols-2 md:grid-cols-4 mt-4"
          style={{ position: "relative" }}
        >
          {items.map((it, i) => (
            <StatBarber04Item
              key={`stat-${i}`}
              item={it}
              sectionId={sectionId}
              idx={i}
              total={items.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatBarber04Item({ item, sectionId, idx, total }: { item: StatItem; sectionId: number; idx: number; total: number }) {
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
      const dur = 1800;
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
  const isLast = idx === total - 1;
  const showDividerDesktop = !isLast;
  // On mobile (2-col): show divider on items 0 and 2 (right side), not 1 and 3
  const showDividerMobile = idx % 2 === 0;

  return (
    <div
      ref={ref}
      className="b04-stat-item flex flex-col items-center relative"
      style={{ padding: "20px 24px" }}
    >
      {/* Vertical hairline divider (industrial) — gold fade gradient */}
      {showDividerDesktop && (
        <span
          aria-hidden
          className="hidden md:block"
          style={{
            position: "absolute", right: 0, top: "15%", bottom: "15%", width: 1,
            background: "linear-gradient(180deg, transparent 0%, rgba(213,185,129,.28) 50%, transparent 100%)",
          }}
        />
      )}
      {showDividerMobile && (
        <span
          aria-hidden
          className="md:hidden"
          style={{
            position: "absolute", right: 0, top: "15%", bottom: "15%", width: 1,
            background: "linear-gradient(180deg, transparent 0%, rgba(213,185,129,.22) 50%, transparent 100%)",
          }}
        />
      )}

      <div
        className="b04-stat-number"
        style={{
          fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
          fontWeight: 400,
          fontSize: "clamp(64px, 7.5vw, 116px)",
          lineHeight: 0.95,
          color: "#fff",
          letterSpacing: "0.02em",
          transition: "transform .35s cubic-bezier(.4,0,.2,1), color .25s ease",
        }}
      >
        {formatted}
        {suffix && <span style={{ color: "#d5b981" }}>{suffix}</span>}
      </div>
      {/* Gold hairline accent under number */}
      <span
        aria-hidden
        style={{
          display: "block",
          width: 32, height: 1,
          background: "#d5b981",
          opacity: 0.55,
          margin: "18px 0 14px",
          transition: "width .35s cubic-bezier(.4,0,.2,1), opacity .25s ease",
        }}
        className="b04-stat-rule"
      />
      <div
        className="uppercase b04-stat-label"
        style={{
          fontFamily: "'Lato',Helvetica,Arial,sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.24em",
          color: "rgba(255,255,255,0.62)",
          transition: "color .25s ease",
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

function StatsFitness02({ items, sectionId, isAdmin }: { items: Fitness02StatItem[]; sectionId: number; isAdmin: boolean }) {
  const ACCENT = "#FF5500";
  const FONT_H = "'Archivo Black', sans-serif";
  const FONT_B = "'Montserrat', sans-serif";

  const stats = items as Fitness02StatItem[];

  // Count-up animation — non-admin only, on scroll into view
  const [counts, setCounts] = useState<number[]>(() => stats.map(s => {
    const n = parseInt(String(s.number ?? "0").replace(/\D/g, ""), 10) || 0;
    return isAdmin ? n : 0;
  }));
  const ref = useRef<HTMLElement | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (isAdmin) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          stats.forEach((item, i) => {
            const target = parseInt(String(item.number ?? "0").replace(/\D/g, ""), 10) || 0;
            const duration = 1800;
            const steps = 48;
            let step = 0;
            const iv = setInterval(() => {
              step++;
              const progress = step / steps;
              const eased = 1 - Math.pow(1 - progress, 3);
              setCounts(prev => { const next = [...prev]; next[i] = Math.round(eased * target); return next; });
              if (step >= steps) clearInterval(iv);
            }, duration / steps);
          });
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [stats, isAdmin]);

  return (
    <section
      ref={ref}
      className="fitness02-stats"
      style={{
        backgroundColor: "#000000",
        borderTop: "1px solid rgba(255,85,0,0.25)",
        borderBottom: "1px solid rgba(255,85,0,0.25)",
        padding: "88px 0",
        fontFamily: FONT_B,
        position: "relative",
        overflow: "hidden",
      }}
      data-template="fitness-02"
      data-section="fitness-02-stats"
    >
      {/* Subtle grain */}
      <div aria-hidden="true" className="fitness02-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, mixBlendMode: "overlay" }} />

      <div
        className="fitness02-stats-grid"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
          gap: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {stats.map((s, i) => {
          const num = String(s.number ?? "");
          const isNumeric = /^\d/.test(num);
          const displayed = isNumeric && !isAdmin ? String(counts[i] ?? 0) : num;
          const indexLabel = String(i + 1).padStart(2, "0");
          return (
            <div
              key={i}
              className="fitness02-stat-card"
              style={{
                textAlign: "center",
                padding: "0 32px",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,85,0,0.28)" : "none",
                position: "relative",
              }}
            >
              {/* Small orange index marker */}
              <div
                className="fitness02-stat-index"
                style={{
                  fontFamily: FONT_H,
                  fontSize: 11,
                  letterSpacing: "0.32em",
                  color: ACCENT,
                  marginBottom: 20,
                }}
                aria-hidden="true"
              >
                {indexLabel}
              </div>

              <div
                className="fitness02-stat-number"
                style={{
                  fontFamily: FONT_H,
                  fontSize: "clamp(56px, 7vw, 88px)",
                  color: "#FFFFFF",
                  lineHeight: 1,
                  marginBottom: 14,
                  letterSpacing: "-0.02em",
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 2,
                }}
              >
                {isAdmin ? (
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.number`} value={num} tag="span" />
                ) : (
                  <span aria-label={num}>{displayed}</span>
                )}
                {s.suffix && (
                  <span style={{ color: ACCENT, fontSize: "0.6em" }}>
                    {isAdmin ? (
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.suffix`} value={String(s.suffix)} tag="span" />
                    ) : (
                      String(s.suffix)
                    )}
                  </span>
                )}
              </div>

              {/* Hairline under number */}
              <div
                className="fitness02-stat-rule"
                aria-hidden="true"
                style={{ width: 32, height: 2, background: ACCENT, margin: "0 auto 18px", transition: "width 0.45s cubic-bezier(0.22,0.61,0.36,1)" }}
              />

              <div
                style={{
                  fontFamily: FONT_B,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#C3C3C3",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(s.label ?? "")} tag="span" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── reality-05-stats ──────────────────────────────────────────────────────────
// Ref: ondrejkucera.com — sekce s počítadly
// Tmavý #1c1c1c bg s bg-image + rgba(0,0,0,0.72) overlay
// ── reality-05-stats ──────────────────────────────────────────────────────────
type StatItem05 = StatItem & { suffix?: string };

function StatsReality05({ content, items: rawItems, sectionId }: { content: Record<string, unknown>; items: StatItem[]; sectionId: number }) {
  const items = rawItems as StatItem05[];
  const bgImage = String(content.bgImage ?? "/templates/reality-05/stats-bg.webp");

  const GOLD  = "#CFA968";
  const WHITE = "#ffffff";
  const SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

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
            const duration = 1800;
            const steps = 50;
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
      id="statistiky"
      data-template="reality-05"
      style={{ position: "relative", overflow: "hidden", backgroundColor: "#0a0a0a" }}
    >
      {/* BG image */}
      <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt="" style={{ position: "absolute", inset: 0 }}>
        <img src={bgImage} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </GenericEditableImage>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.65) 100%)", zIndex: 1, pointerEvents: "none" }} />

      {/* Top gold hairline */}
      <div style={{ position: "relative", zIndex: 2, width: 60, height: 2, backgroundColor: GOLD, margin: "0 auto", opacity: 0.5, marginTop: 0 }} />

      {/* Grid */}
      <div
        className="r05-stats-grid"
        style={{
          position: "relative", zIndex: 2,
          maxWidth: 1100, margin: "0 auto",
          padding: "64px clamp(20px,5vw,60px) 72px",
          display: "grid",
          gridTemplateColumns: `repeat(${items.length || 3}, 1fr)`,
          gap: 0,
        }}
      >
        {items.map((item, i) => {
          const target = parseInt(String(item.value ?? "0").replace(/\D/g, ""), 10) || 0;
          const displayVal = triggered.current || counts[i] > 0 ? counts[i] : target;
          return (
            <div
              key={i}
              className="r05-stat-cell"
              style={{
                textAlign: "center",
                padding: "28px 20px",
                borderRight: i < items.length - 1 ? "1px solid rgba(207,169,104,0.15)" : "none",
                transition: "transform 0.3s",
              }}
            >
              <div style={{
                fontFamily: SANS, fontSize: "clamp(42px,5.5vw,68px)", fontWeight: 700,
                color: GOLD, lineHeight: 1, marginBottom: 8, letterSpacing: "-0.02em",
              }}>
                <span>{displayVal}</span>
                {item.suffix && (
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.suffix`} value={String(item.suffix)} tag="span"
                    style={{ fontSize: "clamp(26px,3vw,40px)", color: GOLD, fontWeight: 600 }}
                  />
                )}
              </div>
              {/* Gold dot separator */}
              <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: GOLD, margin: "12px auto 14px", opacity: 0.5 }} />
              <GenericEditableText
                sectionId={sectionId} field={`items.${i}.label`} value={String(item.label ?? "")} tag="p"
                style={{
                  fontFamily: SANS, fontSize: 13, fontWeight: 600,
                  color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.4,
                  letterSpacing: "0.08em", textTransform: "uppercase" as const,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom gold hairline */}
      <div style={{ position: "relative", zIndex: 2, width: 60, height: 2, backgroundColor: GOLD, margin: "0 auto", opacity: 0.5, marginBottom: 0 }} />
    </section>
  );
}

// ── lawyer-01-stats ───────────────────────────────────────────────────────────
// Karmínový pás (#a70336), 4 čísla vedle sebe (200+/5000+/12/110+),
// bílé hodnoty Raleway bold, bílé popisky, svislé oddělovače rgba
// ─────────────────────────────────────────────────────────────────────────────
function StatsLawyer01({ items, sectionId }: { items: Array<{ value?: string | number; label?: string; icon?: string }>; sectionId: number }) {
  const CRIMSON = "#a70336";
  const WHITE   = "#ffffff";
  const WORDFONT = "'Raleway','Montserrat','Helvetica Neue',Arial,sans-serif";
  const BODYFONT = "'Open Sans','Source Sans 3','Helvetica Neue',Arial,sans-serif";

  const defaultItems = [
    { value: "200+",   label: "právníků a daňových poradců" },
    { value: "5 000+", label: "klientů" },
    { value: "12",     label: "jazyků" },
    { value: "110+",   label: "zemí" },
  ];
  const data = items.length > 0 ? items : defaultItems;

  const gridRef = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section data-template="lawyer-01" style={{ position: "relative", background: `linear-gradient(135deg, ${CRIMSON} 0%, #8b022c 100%)`, padding: "0", overflow: "hidden" }}>
      <style>{`
        .l01stats-item{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);}
        .l01stats-on .l01stats-item{opacity:1;transform:translateY(0);}
        .l01stats-num{position:relative;display:inline-block;transition:transform .3s ease;}
        .l01stats-num::after{content:"";position:absolute;left:50%;bottom:-12px;transform:translateX(-50%) scaleX(0);width:38px;height:2px;background:rgba(255,255,255,.75);transition:transform .4s cubic-bezier(.4,0,.2,1);}
        .l01stats-item:hover .l01stats-num{transform:translateY(-3px);}
        .l01stats-item:hover .l01stats-num::after{transform:translateX(-50%) scaleX(1);}
        @media (max-width: 640px) {
          .l01-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .l01-stats-grid > div { border-right: none !important; }
          .l01-stats-grid > div:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.18) !important; }
          .l01-stats-grid > div:nth-child(-n+2) { border-bottom: 1px solid rgba(255,255,255,0.18); }
        }
      `}</style>

      {/* Decorative scales-of-justice watermark */}
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: "absolute", right: "-40px", top: "50%", transform: "translateY(-50%)", width: 320, height: 320, pointerEvents: "none" }}>
        <path d="M12 3v18M7 21h10M12 6l-7 2 3 5a3 3 0 0 1-6 0l3-5M12 6l7 2-3 5a3 3 0 0 0 6 0l-3-5"/>
      </svg>

      {/* Top & bottom hairlines */}
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.22)" }} />
      <span aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.14)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div ref={gridRef} className={`l01-stats-grid${vis ? " l01stats-on" : ""}`} style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
          {data.map((item, i) => (
            <div
              key={i}
              className="l01stats-item"
              style={{
                padding: "clamp(44px,5vw,60px) 32px",
                textAlign: "center",
                borderRight: i < data.length - 1 ? "1px solid rgba(255,255,255,0.18)" : "none",
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <div className="l01stats-num" style={{
                fontFamily: WORDFONT,
                fontWeight: 800,
                fontSize: "clamp(2.4rem, 4.2vw, 3.7rem)",
                color: WHITE,
                lineHeight: 1,
                marginBottom: 22,
                letterSpacing: "-0.02em",
              }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(item.value)} tag="span" />
              </div>
              <div style={{
                fontFamily: BODYFONT,
                fontWeight: 500,
                fontSize: "clamp(0.78rem, 1vw, 0.9rem)",
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                lineHeight: 1.45,
              }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label)} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </div>
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
    <section style={{ backgroundColor: "#fff", fontFamily: FONT }} data-template="stavba-03">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 32px" }}>
        <div className="stavba03-usps-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(usps.length, 3)}, 1fr)`, gap: 28 }}>
          {usps.map((usp, i) => (
            <div key={i} className="st03-usp-card" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, padding: "40px 30px 34px", backgroundColor: "#fff", border: "1px solid #ededed", overflow: "hidden" }}>
              <span className="st03-usp-bar" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, height: 3, width: "100%", background: ORANGE, transform: "scaleX(1)", transformOrigin: "left center" }} />
              <span className="st03-usp-badge" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 62, height: 62, borderRadius: "50%", backgroundColor: "rgba(250,125,25,0.10)", color: ORANGE }}>
                {icons[usp.icon] ?? icons.check}
              </span>
              <div style={{ fontFamily: FONT, fontSize: "1.1rem", fontWeight: 700, color: DARK, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field={`usps.${i}.title`} value={usp.title} tag="span" />
              </div>
              <div style={{ fontFamily: FONT, fontSize: "0.92rem", color: GRAY, lineHeight: 1.68 }}>
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
// Nordic Minimal Gastro: thin stone-border strip, marquee brand names
// Inter uppercase, muted → hover full opacity, terracotta dot separators
// ─────────────────────────────────────────────────────────────────────────────
function StatsCatering01Partners({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN  = "#2d4a3e";
  const TERRA  = "#c4755b";
  const WARM   = "#f8f5f0";
  const STONE  = "#e8e2d8";
  const SANS   = "'Inter', system-ui, sans-serif";

  const heading = String(content.heading ?? "Věří nám přední značky");
  const items = (content.items as Array<{ name: string }>) ?? [];

  return (
    <section
      data-template="catering-01"
      data-variant="catering-01-partners"
      style={{ background: WARM, borderTop: `1px solid ${STONE}`, borderBottom: `1px solid ${STONE}`, padding: "2.8rem 0", overflow: "hidden" }}
    >
      <style>{`
        @keyframes ct1marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .ct1p-head{text-align:center;margin-bottom:1.8rem}
        .ct1p-label{font-family:${SANS};font-size:.65rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${TERRA}}
        .ct1p-track{display:flex;align-items:center;width:max-content;animation:ct1marquee 32s linear infinite;will-change:transform}
        .ct1p-track:hover{animation-play-state:paused}
        .ct1p-name{font-family:${SANS};font-size:.82rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${GREEN};opacity:.4;padding:0 2rem;white-space:nowrap;transition:opacity .25s;cursor:default}
        .ct1p-name:hover{opacity:1}
        .ct1p-sep{width:4px;height:4px;border-radius:50%;background:${TERRA};opacity:.5;flex-shrink:0}
      `}</style>

      <div className="ct1p-head">
        <span className="ct1p-label">
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </span>
      </div>

      <div style={{ overflow: "hidden" }}>
        <div className="ct1p-track">
          {items.map((item, i) => (
            <span key={`a-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
              <span className="ct1p-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </span>
              <span className="ct1p-sep" aria-hidden="true" />
            </span>
          ))}
          <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center" }}>
            {items.map((item, i) => (
              <span key={`b-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
                <span className="ct1p-name">{item.name}</span>
                <span className="ct1p-sep" />
              </span>
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}

// ── catering-01-timeline ──────────────────────────────────────────────────────
// Nordic Minimal Gastro:
// - Warm-white bg, vertical timeline on mobile, horizontal on desktop
// - Fraunces year numbers, Inter body text
// - Terracotta dot + connecting stone line
// ─────────────────────────────────────────────────────────────────────────────
function StatsCatering01Timeline({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN  = "#2d4a3e";
  const TERRA  = "#c4755b";
  const WARM   = "#f8f5f0";
  const STONE  = "#e8e2d8";
  const SERIF  = "'Fraunces', Georgia, serif";
  const SANS   = "'Inter', system-ui, sans-serif";

  const heading = String(content.heading ?? "Náš příběh");
  const items = (content.items as Array<{ year: string; text: string }>) ?? [];

  return (
    <section
      data-template="catering-01"
      data-variant="catering-01-timeline"
      style={{ background: WARM, padding: "6rem 0 7rem", overflow: "hidden" }}
    >
      <style>{`
        .ct1tl-wrap{max-width:1200px;margin:0 auto;padding:0 1.5rem}
        .ct1tl-head{text-align:center;margin-bottom:4rem}
        .ct1tl-kicker{font-family:${SANS};font-size:.65rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${TERRA};margin-bottom:1rem}
        .ct1tl-h{font-family:${SERIF};font-weight:300;font-style:italic;font-size:clamp(1.8rem,3.5vw,2.8rem);color:${GREEN};margin:0;letter-spacing:-.01em}
        .ct1tl-list{position:relative;padding-left:2.5rem}
        .ct1tl-list::before{content:'';position:absolute;left:.45rem;top:0;bottom:0;width:1px;background:${STONE}}
        .ct1tl-item{position:relative;padding-bottom:2.5rem}
        .ct1tl-item:last-child{padding-bottom:0}
        .ct1tl-dot{position:absolute;left:-2.5rem;top:.15rem;width:12px;height:12px;border-radius:50%;background:${TERRA};border:2px solid ${WARM};outline:1px solid ${STONE};z-index:1;transition:transform .3s,background .3s}
        .ct1tl-item:hover .ct1tl-dot{transform:scale(1.4);background:${GREEN}}
        .ct1tl-year{font-family:${SERIF};font-size:1.6rem;font-weight:400;color:${TERRA};margin:0 0 .5rem;line-height:1}
        .ct1tl-text{font-family:${SANS};font-size:.9rem;line-height:1.7;color:#555;margin:0;max-width:36rem}
        @media(min-width:1024px){
          .ct1tl-list{display:grid;grid-template-columns:repeat(${items.length},1fr);gap:2rem;padding-left:0}
          .ct1tl-list::before{left:0;right:0;top:.35rem;bottom:auto;width:auto;height:1px}
          .ct1tl-item{padding-bottom:0;padding-top:2rem}
          .ct1tl-dot{left:0;top:-6px;position:absolute}
          .ct1tl-item:hover .ct1tl-dot{transform:scale(1.4)}
          .ct1tl-year{font-size:1.4rem}
        }
      `}</style>

      <div className="ct1tl-wrap">
        <div className="ct1tl-head">
          <div className="ct1tl-kicker">milníky</div>
          <h2 className="ct1tl-h">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        <div className="ct1tl-list">
          {items.map((item, i) => (
            <div key={i} className="ct1tl-item">
              <div className="ct1tl-dot" aria-hidden="true" />
              <div className="ct1tl-year">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.year`} value={item.year} tag="span" />
              </div>
              <div className="ct1tl-text">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── florist-01-stats ─────────────────────────────────────────────────────────
// Botanical Atelier Editorial luxe trust bar:
// - Warm ivory section s Georgia italic centered header + Inter tracked eyebrow
// - 4 karty odděleny olive-gold vertical hairlines
// - Custom botanické line-art ikony (truck-with-sprig, atelier-window, star-in-leaf, polaroid)
// - Karty: velké Georgia italic číslo/nadpis + Inter subtitle
// - Hover: karta ivory→sage-tint, ikona moss color + subtle rotate, hairline pod nadpisem expand
function StatsFlorist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const MOSS   = "#2f4a3a";
  const SAGE   = "#5c8a6a";
  const IVORY  = "#faf7f2";
  const INK    = "#2a1a0a";
  const INK70  = "rgba(42,26,10,0.72)";
  const GOLD   = "#c9b78a";
  const GEORGIA = "Georgia, 'Times New Roman', serif";
  const INTER   = "Inter, system-ui, sans-serif";

  interface Item { icon?: string; title?: string; subtitle?: string; }
  const rawItems = (content.items as Item[]) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { icon: "truck",   title: "Doručení ještě dnes",     subtitle: "Objednejte do 15:00" },
    { icon: "atelier", title: "Ateliér v centru Brna",   subtitle: "Veveří · Královo Pole · Žabovřesky" },
    { icon: "star",    title: "4,9 na Google",            subtitle: "220+ ověřených recenzí" },
    { icon: "camera",  title: "Foto před doručením",     subtitle: "Vždy vidíte, co dostane obdarovaný" },
  ];

  const heading   = String(content.heading   ?? "Náš slib — vždy čerstvé, vždy včas.");
  const eyebrow   = String(content.eyebrow   ?? "PROČ PRÁVĚ PETALA");
  const kicker    = String(content.kicker    ?? "01 · zážitek");

  const Icon = ({ name }: { name?: string }) => {
    const base = { width: 44, height: 44, viewBox: "0 0 48 48", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
    switch (name) {
      case "truck": // dodávka + kytice
        return <svg {...base}>
          <rect x="4" y="20" width="22" height="14" rx="1"/>
          <path d="M26 25h9l5 5v4h-14z"/>
          <circle cx="12" cy="36" r="3"/>
          <circle cx="34" cy="36" r="3"/>
          <path d="M15 20V13M15 13c-2 0-4-1.5-4-4M15 13c2 0 4-1.5 4-4M15 13c-1-1-3-2-5-2M15 13c1-1 3-2 5-2"/>
        </svg>;
      case "atelier": // ateliérové okno se sprig
        return <svg {...base}>
          <rect x="6" y="8" width="36" height="30" rx="1"/>
          <path d="M6 23h36M24 8v30"/>
          <path d="M24 42v3M18 45h12"/>
          <path d="M14 18v-2M20 16v-2M28 16v-2M34 18v-2"/>
        </svg>;
      case "star": // hvězda uvnitř listu
        return <svg {...base}>
          <path d="M24 6C14 6 6 14 6 24s8 18 18 18c8 0 12-4 14-10"/>
          <path d="M24 6c6 4 10 10 10 18 0 6-2 10-4 12"/>
          <polygon points="24,18 26.5,23 32,24 28,28 29,33.5 24,30.5 19,33.5 20,28 16,24 21.5,23"/>
        </svg>;
      case "camera": // polaroid s kvítkem
        return <svg {...base}>
          <rect x="6" y="12" width="36" height="28" rx="1"/>
          <rect x="10" y="16" width="28" height="18"/>
          <circle cx="24" cy="25" r="4"/>
          <path d="M24 21v-2M24 30v-2M20 25h-2M30 25h-2"/>
          <circle cx="35" cy="18" r="1" fill="currentColor"/>
        </svg>;
      default:
        return <svg {...base}><circle cx="24" cy="24" r="14"/></svg>;
    }
  };

  return (
    <section data-template="florist-01" className="f01stats" style={{ background: IVORY, fontFamily: INTER, padding: "88px 24px 96px" }}>
      <style>{`
        .f01stats-inner { max-width: 1240px; margin: 0 auto; }
        .f01stats-head { text-align:center; margin-bottom: 56px; display:flex; flex-direction:column; align-items:center; gap:14px; }
        .f01stats-eye { display:inline-flex; align-items:center; gap:14px; font-family:${INTER}; font-weight:500; font-size:11px; letter-spacing:0.34em; text-transform:uppercase; color:${MOSS}; }
        .f01stats-eye i { width:26px; height:1px; background:${GOLD}; display:inline-block; }
        .f01stats-eye em { color:${GOLD}; font-style:normal; font-size:10px; }
        .f01stats-h { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:clamp(28px, 3.2vw, 40px); line-height:1.15; color:${INK}; margin:0; letter-spacing:-0.01em; max-width:720px; }
        .f01stats-kick { font-family:${GEORGIA}; font-style:italic; font-size:13px; color:${INK70}; letter-spacing:0.06em; }

        .f01stats-grid { display:grid; grid-template-columns: repeat(4, 1fr); align-items:stretch; border-top:1px solid ${GOLD}; border-bottom:1px solid ${GOLD}; }
        .f01stats-card { position:relative; padding: 42px 30px 42px; display:flex; flex-direction:column; align-items:flex-start; gap:20px;
          background:${IVORY}; color:${INK}; transition: background 0.4s ease, color 0.4s ease; }
        .f01stats-card + .f01stats-card::before { content:""; position:absolute; left:0; top:20%; bottom:20%; width:1px; background:${GOLD}; opacity:0.6; }
        .f01stats-icon { color:${MOSS}; transition: color 0.4s ease, transform 0.6s cubic-bezier(.6,.05,.35,1); }
        .f01stats-num { font-family:${GEORGIA}; font-style:italic; font-size:14px; color:${GOLD}; letter-spacing:0.08em; }
        .f01stats-title { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:22px; line-height:1.25; color:${INK}; margin:0; letter-spacing:-0.005em; position:relative; padding-bottom:12px; }
        .f01stats-title::after { content:""; position:absolute; left:0; bottom:0; width:22px; height:1px; background:${GOLD}; transition: width 0.5s cubic-bezier(.6,.05,.35,1); }
        .f01stats-sub { font-family:${INTER}; font-weight:300; font-size:13.5px; line-height:1.6; color:${INK70}; margin:0; }
        .f01stats-card:hover { background: rgba(92,138,106,0.06); }
        .f01stats-card:hover .f01stats-icon { color:${SAGE}; transform: rotate(-4deg); }
        .f01stats-card:hover .f01stats-title::after { width:64px; background:${MOSS}; }

        @media(max-width:960px){ .f01stats-grid { grid-template-columns: repeat(2, 1fr); } .f01stats-card:nth-child(3)::before { display:none; } .f01stats-card:nth-child(3), .f01stats-card:nth-child(4) { border-top:1px solid ${GOLD}; } }
        @media(max-width:560px){
          .f01stats { padding: 60px 20px 68px; }
          .f01stats-grid { grid-template-columns: 1fr; }
          .f01stats-card::before { display:none !important; }
          .f01stats-card + .f01stats-card { border-top:1px solid ${GOLD}; }
          .f01stats-h { font-size: 26px; }
        }
      `}</style>

      <div className="f01stats-inner">
        <header className="f01stats-head">
          <span className="f01stats-eye">
            <i /><em>✿</em>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            <em>✿</em><i />
          </span>
          <h2 className="f01stats-h">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <span className="f01stats-kick">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </span>
        </header>

        <div className="f01stats-grid">
          {items.map((item, i) => (
            <article key={i} className="f01stats-card">
              <span className="f01stats-icon"><Icon name={item.icon} /></span>
              <span className="f01stats-num">0{i + 1}</span>
              <h3 className="f01stats-title">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
              </h3>
              <p className="f01stats-sub">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.subtitle`} value={item.subtitle ?? ""} tag="span" />
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── sweet-01-usp ──────────────────────────────────────────────────────────────
// Parisian Pâtisserie Boutique — 3-col trust strip
// Cocoa #2b1810 bg, gold #c8a568 line SVG icons, Fraunces italic titles, Inter body
// Cherry red accent dot, scalloped gold dividers between columns
// ─────────────────────────────────────────────────────────────────────────────
function StatsSweet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items = ((content.items as Array<{ icon?: string; title?: string; body?: string }>) ?? []).slice(0, 3);

  const COCOA  = "#2b1810";
  const CREAM  = "#fdf6ee";
  const GOLD   = "#c8a568";
  const RED    = "#E2001A";
  const FONT_D = "'Fraunces', 'Playfair Display', Georgia, serif";
  const FONT_B = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const icons: Record<string, JSX.Element> = {
    bake: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke={GOLD} strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>
        <path d="M16 32c0-2 2-6 8-6s8 4 8 6" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 32h16v3a2 2 0 01-2 2H18a2 2 0 01-2-2v-3z" stroke={GOLD} strokeWidth="1.5"/>
        <path d="M20 26v-4M24 26v-6M28 26v-4" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M18 16c2-3 4-5 6-5s4 2 6 5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        <circle cx="24" cy="14" r="1.5" fill={RED}/>
      </svg>
    ),
    fresh: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke={GOLD} strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>
        <path d="M24 38V22" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 22c-3-4-8-6-12-4 2 8 8 14 12 16" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 22c3-4 8-6 12-4-2 8-8 14-12 16" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="15" r="1.5" fill={RED}/>
      </svg>
    ),
    clock: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke={GOLD} strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>
        <circle cx="24" cy="24" r="14" stroke={GOLD} strokeWidth="1.5"/>
        <path d="M24 16v8l5.5 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="24" r="2" fill={RED}/>
      </svg>
    ),
  };

  const defaultItems = [
    { icon: "bake",  title: "Vlastní výroba denně",   body: "Každé ráno pečeme čerstvě od základu. Žádné polotovary, žádné kompromisy." },
    { icon: "fresh", title: "Lokální ingredience",    body: "Spolupracujeme s farmáři z okolí. Máslo, vejce i ovoce pocházejí od prověřených dodavatelů." },
    { icon: "clock", title: "Otevřeno každý den",     body: "Sedm dní v týdnu, od rána do večera. Protože chuť na dobrý zákusek nepočká." },
  ];

  const rows = items.length > 0 ? items : defaultItems;

  return (
    <section data-template="sweet-01" style={{ backgroundColor: COCOA, fontFamily: FONT_B, padding: "64px 0", position: "relative", overflow: "hidden" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,400;1,9..144,500&family=Inter:wght@400;500&display=swap" />
      <style>{`
        .sw01-usp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; max-width: 1200px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .sw01-usp-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 28px 36px; position: relative; }
        .sw01-usp-card:not(:last-child)::after {
          content: ""; position: absolute; right: 0; top: 20%; height: 60%;
          width: 1px; background: repeating-linear-gradient(to bottom, ${GOLD}44, ${GOLD}44 4px, transparent 4px, transparent 8px);
        }
        .sw01-usp-icon { margin-bottom: 20px; transition: transform 0.5s cubic-bezier(.4,0,.2,1); }
        .sw01-usp-card:hover .sw01-usp-icon { transform: scale(1.12) rotate(-4deg); }
        .sw01-usp-title { font-family: ${FONT_D}; font-style: italic; font-weight: 500; font-size: 20px; color: ${CREAM}; margin: 0 0 12px; letter-spacing: -0.01em; line-height: 1.25; }
        .sw01-usp-body { font-family: ${FONT_B}; font-weight: 400; font-size: 14px; line-height: 1.7; color: rgba(253,246,238,0.62); margin: 0; }
        @media(max-width: 700px) {
          .sw01-usp-grid { grid-template-columns: 1fr; max-width: 420px; }
          .sw01-usp-card:not(:last-child)::after { display: none; }
          .sw01-usp-card:not(:last-child) { border-bottom: 1px dashed ${GOLD}33; }
          .sw01-usp-card { padding: 28px 20px; }
        }
      `}</style>

      {/* Scalloped top edge */}
      <svg aria-hidden viewBox="0 0 1320 8" preserveAspectRatio="none" style={{ position: "absolute", top: -1, left: 0, right: 0, width: "100%", height: 8, pointerEvents: "none" }}>
        <path d="M0 8 Q 12.5 0 25 8 T 50 8 T 75 8 T 100 8 T 125 8 T 150 8 T 175 8 T 200 8 T 225 8 T 250 8 T 275 8 T 300 8 T 325 8 T 350 8 T 375 8 T 400 8 T 425 8 T 450 8 T 475 8 T 500 8 T 525 8 T 550 8 T 575 8 T 600 8 T 625 8 T 650 8 T 675 8 T 700 8 T 725 8 T 750 8 T 775 8 T 800 8 T 825 8 T 850 8 T 875 8 T 900 8 T 925 8 T 950 8 T 975 8 T 1000 8 T 1025 8 T 1050 8 T 1075 8 T 1100 8 T 1125 8 T 1150 8 T 1175 8 T 1200 8 T 1225 8 T 1250 8 T 1275 8 T 1300 8 T 1320 8" fill={COCOA} stroke="none" />
      </svg>

      <div className="sw01-usp-grid">
        {rows.map((item, i) => (
          <div key={i} className="sw01-usp-card">
            <div className="sw01-usp-icon">
              {icons[item.icon ?? ""] ?? icons.bake}
            </div>
            <h3 className="sw01-usp-title">
              <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
            </h3>
            <p className="sw01-usp-body">
              <GenericEditableText sectionId={sectionId} field={`items.${i}.body`} value={item.body ?? ""} tag="span" />
            </p>
          </div>
        ))}
      </div>

      {/* Scalloped bottom edge */}
      <svg aria-hidden viewBox="0 0 1320 8" preserveAspectRatio="none" style={{ position: "absolute", bottom: -1, left: 0, right: 0, width: "100%", height: 8, pointerEvents: "none" }}>
        <path d="M0 0 Q 12.5 8 25 0 T 50 0 T 75 0 T 100 0 T 125 0 T 150 0 T 175 0 T 200 0 T 225 0 T 250 0 T 275 0 T 300 0 T 325 0 T 350 0 T 375 0 T 400 0 T 425 0 T 450 0 T 475 0 T 500 0 T 525 0 T 550 0 T 575 0 T 600 0 T 625 0 T 650 0 T 675 0 T 700 0 T 725 0 T 750 0 T 775 0 T 800 0 T 825 0 T 850 0 T 875 0 T 900 0 T 925 0 T 950 0 T 975 0 T 1000 0 T 1025 0 T 1050 0 T 1075 0 T 1100 0 T 1125 0 T 1150 0 T 1175 0 T 1200 0 T 1225 0 T 1250 0 T 1275 0 T 1300 0 T 1320 0" fill={COCOA} stroke="none" />
      </svg>
    </section>
  );
}

// ─── autoskola-01 Stats — Road Editorial Motion pobočky grid ─────────────────
// Midnight ink bg, 4×2 grid s location pin badges, dashed road-lane separators,
// JBM Mono city names, yellow pin pulse dot, orange dashed eyebrow
// ─────────────────────────────────────────────────────────────────────────────
function StatsAutoskola01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading = String(content.heading ?? "Naše pobočky");
  const subheading = String(content.subheading ?? "Jsme blízko vám — působíme v 8 moravských a středočeských městech.");
  const items = ((content.items as { value?: string; label?: string }[]) ?? []);

  const INK    = "#0f172a";
  const BONE   = "#fafaf7";
  const ORANGE = "#f16823";
  const YELLOW = "#ffce00";
  const SLATE  = "#94a3b8";
  const FONT_D = "'Space Grotesk', 'Inter', sans-serif";
  const FONT_B = "'Inter Tight', 'Inter', sans-serif";

  return (
    <section data-template="autoskola-01" id={String(sectionId)} style={{ backgroundColor: INK, padding: "80px clamp(24px, 6vw, 80px)", position: "relative" }}>
      {/* Dashed road-lane top border */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, borderTop: `2px dashed ${ORANGE}40` }} aria-hidden="true" />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ width: 32, height: 0, borderTop: `2px dashed ${ORANGE}` }} aria-hidden="true" />
            <span style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: ORANGE }}>Lokality</span>
            <span style={{ width: 32, height: 0, borderTop: `2px dashed ${ORANGE}` }} aria-hidden="true" />
          </div>
          <h2 style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: BONE, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT_B, fontWeight: 400, fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)", color: SLATE, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
        </div>

        {/* 4-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {items.map((item, i) => (
            <div key={i} className="as01-stat-card"
              style={{ position: "relative", backgroundColor: `${BONE}08`, border: `1px solid ${SLATE}15`, padding: "28px 20px", display: "flex", alignItems: "center", gap: 16, transition: "background-color 0.25s, border-color 0.25s, transform 0.25s" }}>
              {/* Pin icon with pulse */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div className="as01-pin-pulse" style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `2px solid ${ORANGE}30` }} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: "clamp(1rem, 1.6vw, 1.15rem)", color: BONE, letterSpacing: "0.02em" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(item.value ?? "")} tag="span" />
                </span>
                <span style={{ fontFamily: FONT_B, fontWeight: 400, fontSize: 12, color: SLATE, letterSpacing: "0.04em" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label ?? "")} tag="span" />
                </span>
              </div>
              {/* Yellow corner bracket — top right */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ position: "absolute", top: 8, right: 8, opacity: 0.3 }}>
                <path d="M16 0 H10 M16 0 V6" stroke={YELLOW} strokeWidth="1.5"/>
              </svg>
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
function StatsLang01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
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
function StatsEdu01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY = "#132339";
  const BLUE = "#0059df";
  const FONT = "'Libre Franklin', Arial, sans-serif";

  const eyebrow       = String(content.eyebrow       ?? "Čísla, která mluví");
  const heading       = String(content.heading       ?? "Naše výsledky");
  const headingAccent = String(content.headingAccent ?? "v číslech");
  const items   = (content.items as Array<{ value: string; label: string }>) ?? [
    { value: "12 000+", label: "spokojených studentů" },
    { value: "850+",    label: "prověřených lektorů" },
    { value: "94 %",    label: "úspěšnost u přijímaček" },
    { value: "12",      label: "let zkušeností" },
  ];

  const gridRef = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .edu01st{position:relative;background:linear-gradient(135deg,${NAVY} 0%,#0d1b2e 100%);padding:88px 40px;font-family:${FONT};overflow:hidden;}
        .edu01st::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;border-radius:50%;border:70px solid rgba(0,89,223,0.08);pointer-events:none;}
        .edu01st::after{content:'';position:absolute;bottom:-80px;left:-80px;width:300px;height:300px;border-radius:50%;border:50px solid rgba(0,89,223,0.06);pointer-events:none;}
        .edu01st-mesh{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:52px 52px;mask-image:radial-gradient(ellipse 60% 70% at 50% 40%,#000,transparent 78%);pointer-events:none;}
        .edu01st-inner{position:relative;z-index:1;max-width:1280px;margin:0 auto;}
        .edu01st-head{text-align:center;margin-bottom:56px;}
        .edu01st-eyebrow{display:inline-flex;align-items:center;gap:10px;color:${BLUE};font-size:12px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;margin-bottom:14px;}
        .edu01st-eyebrow::before,.edu01st-eyebrow::after{content:'';width:24px;height:1.5px;background:${BLUE};opacity:.55;}
        .edu01st-head h2{font-family:${FONT};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#fff;margin:0;letter-spacing:-0.04em;}
        .edu01st-accent{color:${BLUE};}
        .edu01st-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;}
        .edu01st-item{padding:40px 24px;text-align:center;position:relative;opacity:0;transform:translateY(24px) scale(.96);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1);}
        .edu01st-item.in{opacity:1;transform:translateY(0) scale(1);}
        .edu01st-item:not(:last-child)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:rgba(255,255,255,0.1);}
        .edu01st-val{font-family:${FONT};font-size:clamp(2.4rem,5vw,3.8rem);font-weight:800;color:#fff;line-height:1;margin-bottom:12px;letter-spacing:-0.04em;transition:color .3s ease,transform .3s ease;}
        .edu01st-val span{color:${BLUE};}
        .edu01st-item:hover .edu01st-val{color:${BLUE};transform:translateY(-3px);}
        .edu01st-bar{width:0;height:3px;border-radius:3px;background:${BLUE};margin:0 auto 12px;transition:width .5s cubic-bezier(.2,.7,.2,1);}
        .edu01st-item.in .edu01st-bar{width:34px;}
        .edu01st-item:hover .edu01st-bar{width:52px;}
        .edu01st-lbl{font-size:clamp(13px,1.2vw,15px);color:rgba(255,255,255,0.55);font-weight:500;line-height:1.4;}
        @media(max-width:768px){
          .edu01st-grid{grid-template-columns:1fr 1fr;gap:0;}
          .edu01st-item:nth-child(odd)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:rgba(255,255,255,0.1);}
          .edu01st-item:not(:last-child)::after{display:none;}
          .edu01st-item{padding:32px 16px;}
          .edu01st{padding:64px 24px;}
        }
        @media(prefers-reduced-motion:reduce){.edu01st-item{opacity:1!important;transform:none!important;}}
      `}</style>

      <section id={String(sectionId)} className="edu01st" data-template="edu-01-stats">
        <span className="edu01st-mesh" aria-hidden="true" />
        <div className="edu01st-inner">
          <div className="edu01st-head">
            <span className="edu01st-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              {" "}<span className="edu01st-accent"><GenericEditableText sectionId={sectionId} field="headingAccent" value={headingAccent} tag="span" /></span>
            </h2>
          </div>
          <div className="edu01st-grid" ref={gridRef}>
            {items.map((item, i) => (
              <div key={i} className={`edu01st-item${vis ? " in" : ""}`} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="edu01st-val">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={item.value} tag="span" />
                </div>
                <div className="edu01st-bar" aria-hidden="true" />
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
function StatsUcetni02CountItem({ item, idx, sectionId }: {
  item: { value?: string; label?: string; pretext?: string };
  idx: number;
  sectionId: number;
}) {
  const GREEN  = "#004835";
  const GOLD   = "#bca160";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const raw = String(item.value ?? "");
  const numStr = raw.replace(/[^0-9]/g, "");
  const target  = parseInt(numStr, 10) || 0;
  const suffix  = raw.replace(/[0-9\s]/g, "");

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
      const dur = 1600;
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
    <div ref={ref} className="ucn02stats-item" style={{ animationDelay: `${idx * 0.12}s` }}>
      <span className="ucn02stats-mark" aria-hidden="true" />
      <div className="ucn02stats-num" style={{ fontFamily: FONT_H, color: GREEN }}>
        {formatted}<span style={{ color: GOLD }}>{suffix}</span>
      </div>
      <div className="ucn02stats-label" style={{ fontFamily: FONT_H }}>
        <GenericEditableText sectionId={sectionId} field={`items.${idx}.label`} value={String(item.label ?? "")} tag="span" />
      </div>
    </div>
  );
}

function StatsUcetni02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN  = "#004835";
  const GOLD   = "#bca160";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const rawItems = (content.items as Array<{ value?: string; label?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { value: "2 200+", label: "spokojených klientů" },
    { value: "15+",    label: "let na trhu" },
    { value: "120+",   label: "zkušených specialistů" },
  ];

  // conditional header (hidden on subpages via empty-string overrides)
  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const eyebrow = eyebrowRaw === undefined ? "GreenTax v číslech" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Výsledky, které mluví za nás" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());

  return (
    <>
      <style>{`
        .ucn02stats-wrap {
          background: linear-gradient(180deg, #f7faf8 0%, #eef3f0 100%);
          padding: 84px 24px;
          position: relative;
        }
        .ucn02stats-wrap::before {
          content: "";
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 64px; height: 3px;
          background: ${GOLD};
        }
        .ucn02stats-head {
          max-width: 760px;
          margin: 0 auto 52px;
          text-align: center;
        }
        .ucn02stats-eyebrow {
          font-family: ${FONT_H};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${GOLD};
          display: block;
          margin-bottom: 14px;
        }
        .ucn02stats-title {
          font-family: ${FONT_H};
          font-size: clamp(26px, 3vw, 36px);
          font-weight: 700;
          color: ${GREEN};
          margin: 0;
          letter-spacing: -0.4px;
        }
        .ucn02stats-grid {
          max-width: 1080px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          align-items: stretch;
        }
        .ucn02stats-col { position: relative; }
        .ucn02stats-divider {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 96px;
          width: 1px;
          background: linear-gradient(180deg, transparent, ${GOLD}, transparent);
          opacity: 0.55;
        }
        .ucn02stats-item {
          text-align: center;
          padding: 8px 40px;
          animation: ucn02Up 0.7s cubic-bezier(.22,.61,.36,1) both;
          transition: transform 0.35s cubic-bezier(.4,0,.2,1);
        }
        .ucn02stats-item:hover { transform: translateY(-6px); }
        .ucn02stats-mark {
          display: block;
          width: 26px; height: 2px;
          background: ${GOLD};
          margin: 0 auto 20px;
          transition: width 0.35s ease;
        }
        .ucn02stats-item:hover .ucn02stats-mark { width: 46px; }
        .ucn02stats-num {
          font-size: clamp(42px, 4.4vw, 58px);
          font-weight: 800;
          line-height: 1;
          margin-bottom: 14px;
          letter-spacing: -1px;
        }
        .ucn02stats-label {
          font-size: 15px;
          font-weight: 600;
          color: #2d4a42;
          line-height: 1.4;
          letter-spacing: 0.2px;
        }
        @media (max-width: 700px) {
          .ucn02stats-wrap { padding: 56px 20px; }
          .ucn02stats-head { margin-bottom: 36px; }
          .ucn02stats-grid { grid-template-columns: 1fr; gap: 36px; }
          .ucn02stats-divider { display: none; }
        }
      `}</style>
      <section className="ucn02stats-wrap" data-template="ucetni-02-stats">
        {showHeader && (
          <div className="ucn02stats-head">
            {eyebrow.trim() && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="ucn02stats-eyebrow" />
            )}
            {title.trim() && (
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ucn02stats-title" />
            )}
          </div>
        )}
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

function StatsUcetni03CountItem({ item, idx, sectionId, triggered }: {
  item: { value?: string; label?: string };
  idx: number;
  sectionId: number;
  triggered: boolean;
}) {
  const DARK   = "#002000";
  const GREEN  = "#8ec63f";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const raw    = String(item.value ?? "");
  const numStr = raw.replace(/[^0-9]/g, "");
  const target = parseInt(numStr, 10) || 0;
  const suffix = raw.replace(/[0-9\s]/g, "").trim();

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggered || target <= 0) return;
    const dur = 1800;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setCount(Math.round(target * eased));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [triggered, target]);

  const formatted = target > 0 ? count.toLocaleString("cs-CZ").replace(/ /g, " ") : raw;

  return (
    <div className="ucn03stats-item" style={{ transitionDelay: `${idx * 0.14}s`, animationDelay: `${idx * 0.14}s` }}>
      <div className="ucn03stats-accent" aria-hidden="true" />
      <div className="ucn03stats-value" style={{ fontFamily: FONT_H, color: DARK }}>
        {formatted}{suffix && <span style={{ color: GREEN }}>{suffix}</span>}
      </div>
      <div className="ucn03stats-label">
        <GenericEditableText sectionId={sectionId} field={`items.${idx}.label`} value={String(item.label ?? "")} tag="span" />
      </div>
    </div>
  );
}

function StatsUcetni03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN  = "#8ec63f";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const rawItems = (content.items as Array<{ value?: string; label?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { value: "2 400",   label: "certifikovaných poradců" },
    { value: "84 mld",  label: "Kč sjednaných hypoték ročně" },
    { value: "15+",     label: "let na hypotečním trhu" },
  ];

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Klíčová čísla" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Výsledky, které mluví za nás" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const ref = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .ucn03stats-section {
          position: relative;
          background: linear-gradient(180deg, #f9faf9 0%, #f1f4f1 100%);
          padding: 80px 40px;
          font-family: ${FONT_B};
          overflow: hidden;
        }
        .ucn03stats-section::before {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, ${GREEN}, transparent);
          opacity: 0.35;
        }
        .ucn03stats-head {
          max-width: 700px;
          margin: 0 auto 52px;
          text-align: center;
        }
        .ucn03stats-eyebrow {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${GREEN};
          margin-bottom: 14px;
        }
        .ucn03stats-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(24px, 3vw, 34px);
          font-weight: 700;
          color: #002000;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .ucn03stats-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(${items.length}, 1fr);
          gap: 0;
        }
        .ucn03stats-item {
          position: relative;
          text-align: center;
          padding: 32px 24px 24px;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(.22,.68,0,1);
        }
        .ucn03stats-section.triggered .ucn03stats-item {
          opacity: 1;
          transform: none;
        }
        .ucn03stats-item::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 60px;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(142,198,63,0.5), transparent);
        }
        .ucn03stats-item:last-child::after { display: none; }
        .ucn03stats-accent {
          width: 32px; height: 3px;
          background: ${GREEN};
          margin: 0 auto 20px;
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(.22,.68,0,1);
        }
        .ucn03stats-item:hover .ucn03stats-accent { width: 56px; }
        .ucn03stats-item:hover { transform: translateY(-4px); }
        .ucn03stats-value {
          font-size: clamp(2.4rem, 4vw, 3.5rem);
          font-weight: 800;
          line-height: 1;
          margin-bottom: 10px;
          letter-spacing: -1px;
        }
        .ucn03stats-label {
          font-size: 0.95rem;
          color: #737b79;
          line-height: 1.45;
        }
        @media (max-width: 700px) {
          .ucn03stats-section { padding: 56px 20px; }
          .ucn03stats-head { margin-bottom: 36px; }
          .ucn03stats-inner { grid-template-columns: 1fr; gap: 8px; }
          .ucn03stats-item::after { display: none; }
        }
      `}</style>

      <section className={`ucn03stats-section${triggered ? " triggered" : ""}`} data-template="ucetni-03-stats" ref={ref}>
        {showHeader && (
          <div className="ucn03stats-head">
            {eyebrow.trim() && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="ucn03stats-eyebrow" />
            )}
            {title.trim() && (
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ucn03stats-title" />
            )}
          </div>
        )}
        <div className="ucn03stats-inner">
          {items.map((item, i) => (
            <StatsUcetni03CountItem key={i} item={item} idx={i} sectionId={sectionId} triggered={triggered} />
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
// solar-01 — Light editorial stats grid.
// Optional eyebrow/title/subtitle header (conditional showHeader).
// 4 stat items in bordered card grid: icon + gradient number (count-up)
// + label + optional description + hairline rule.
// IntersectionObserver-driven count-up animation (1.6s easeOut, admin=static).
// Top gradient rule appears on hover per item.
// ─────────────────────────────────────────────────────────────────────────────
function StatsSolar01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { value?: string; label?: string; desc?: string; icon?: string };
  const rawItems = ((content.items as Item[]) ?? []).slice(0, 4);
  const items: Item[] = rawItems.length > 0 ? rawItems : [
    { value: "3 800+", label: "Instalací", desc: "Realizovaných FV systémů", icon: "panels" },
    { value: "12 dní", label: "Doba montáže", desc: "Od podpisu po zapojení", icon: "clock" },
    { value: "30 let", label: "Životnost", desc: "Panely s garancí výkonu", icon: "shield" },
    { value: "4.8 ★", label: "Google hodnocení", desc: "Ze 3 800+ recenzí", icon: "star" },
  ];

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow     = eyebrowRaw  === undefined ? "Čísla za nás mluví" : String(eyebrowRaw);
  const title       = titleRaw    === undefined ? "Zkušenosti, na které se můžete spolehnout" : String(titleRaw);
  const subtitle    = subtitleRaw === undefined ? "Přes deset let realizujeme fotovoltaické systémy po celé České republice. Tisíce spokojených klientů, garantovaná kvalita panelů a nulové starosti s administrativou." : String(subtitleRaw);
  const showHeader  = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const sectionRef = useRef<HTMLElement>(null);
  // Default visible=true so SSR/first-paint shows content immediately.
  // IntersectionObserver still triggers count-up animation on scroll into view.
  const [visible, setVisible] = useState(true);
  const [countStarted, setCountStarted] = useState(false);
  const [counts, setCounts] = useState<number[]>(items.map(() => 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setCountStarted(true); obs.disconnect(); }
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!countStarted) return;
    const targets = items.map(it => {
      const val = String(it.value ?? "");
      const m = val.replace(/\s/g, "").match(/[\d.]+/);
      return m ? parseFloat(m[0]) : null;
    });
    const start = performance.now();
    const duration = 1600;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCounts(targets.map(t => t === null ? 0 : t * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countStarted]);

  const formatDisplay = (raw: string, animated: number): string => {
    const m = raw.replace(/\s/g, "").match(/([\d.]+)(.*)$/);
    if (!m) return raw;
    const num = parseFloat(m[0]);
    if (isNaN(num)) return raw;
    // Preserve decimals if original had them
    const decimals = (m[1].split(".")[1] ?? "").length;
    const formattedNum = animated.toLocaleString("cs-CZ", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    // Rebuild: prefix (before number) + formatted + suffix (after number)
    const rawTrimmed = raw.replace(/\s/g, "");
    const numStart = rawTrimmed.search(/[\d]/);
    const prefix = numStart > 0 ? raw.slice(0, raw.search(/[\d]/)) : "";
    const suffix = m[2] ? (raw.includes(" " + m[2].trim()) ? " " : "") + m[2].trim() : "";
    return `${prefix}${formattedNum}${suffix}`;
  };

  const iconFor = (key?: string) => {
    switch (key) {
      case "panels":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="6" width="18" height="12" rx="1"/>
            <line x1="9" y1="6" x2="9" y2="18"/>
            <line x1="15" y1="6" x2="15" y2="18"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
          </svg>
        );
      case "clock":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        );
      case "shield":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        );
      case "star":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"/>
          </svg>
        );
    }
  };

  return (
    <section
      className="s01st"
      data-template="solar-01"
      data-visible={visible ? "true" : "false"}
      ref={sectionRef}
    >
      <div className="s01st-bg-grid" aria-hidden="true" />
      <div className="s01st-inner">
        {showHeader && (
          <div className="s01st-head">
            {eyebrow.trim() && (
              <span className="s01st-eyebrow">
                <span className="s01st-eyebrow-dot" />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="s01st-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p className="s01st-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="s01st-grid" role="group" aria-label="Klíčové statistiky společnosti">
          {items.map((it, i) => {
            const rawVal = String(it.value ?? "");
            const displayed = countStarted && counts[i] > 0 ? formatDisplay(rawVal, counts[i]) : rawVal;
            return (
              <div className="s01st-item" key={i}>
                <span className="s01st-icon">{iconFor(it.icon)}</span>
                <div className="s01st-val" aria-label={rawVal}>
                  <GenericEditableText
                    sectionId={sectionId}
                    field={`items.${i}.value`}
                    value={displayed}
                    tag="span"
                  />
                </div>
                <div className="s01st-lbl">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={it.label ?? ""} tag="span" />
                </div>
                {(it.desc && String(it.desc).trim()) ? (
                  <p className="s01st-desc">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.desc`} value={it.desc} tag="span" />
                  </p>
                ) : null}
                <div className="s01st-rule" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── ucetni-04-stats ──────────────────────────────────────────────────────────
// „Prosperita Finance" — stats pás LUXE. Světlý surface band, velká navy count-up
// čísla se zlatým accentem, gold hairline dividery, hover lift + accent grow.
// navy #1B3A6B + gold #C8923A + Inter. Count-up (1600ms) + IntersectionObserver.
// ─────────────────────────────────────────────────────────────────────────────
function StatsUcetni04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY  = "#1B3A6B";
  const GOLD  = "#C8923A";
  const MUTED = "#6b7280";
  const FONT  = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const headingRaw  = (content as Record<string, unknown>).heading;
  const eyebrow = eyebrowRaw === undefined ? "V číslech" : String(eyebrowRaw);
  const heading = headingRaw === undefined ? "Čísla, která hovoří za nás" : String(headingRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim());
  const rawItems = Array.isArray(content.items) ? content.items as Array<{ value?: string; label?: string }> : [];
  const items    = rawItems.length > 0 ? rawItems : [
    { value: "12 400+", label: "spokojených klientů" },
    { value: "340+",    label: "certifikovaných poradců" },
    { value: "15",      label: "let zkušeností" },
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
        .ucn04stats { position: relative; background: linear-gradient(180deg, #ffffff, #F5F7FB); font-family: ${FONT}; overflow: hidden; }
        .ucn04stats::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,146,58,0.4), transparent); }
        .ucn04stats-inner { max-width: 1200px; margin: 0 auto; padding: clamp(56px,7vw,88px) 24px clamp(56px,7vw,88px); }
        .ucn04stats-head { text-align: center; margin-bottom: clamp(40px,5vw,56px); }
        .ucn04stats-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-size: 12.5px; font-weight: 700;
          letter-spacing: .16em; text-transform: uppercase; color: ${GOLD}; margin-bottom: 14px; }
        .ucn04stats-eyebrow::before, .ucn04stats-eyebrow::after { content: ""; width: 24px; height: 1px; background: rgba(200,146,58,0.5); }
        .ucn04stats-title { font-family: ${FONT}; font-size: clamp(24px,3vw,38px); font-weight: 800; color: ${NAVY}; letter-spacing: -0.025em; line-height: 1.15; margin: 0; }
        .ucn04stats-list {
          list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr);
          border: 1px solid #e6eaf1; border-radius: 20px; background: #fff; overflow: hidden;
          box-shadow: 0 24px 60px -30px rgba(20,41,77,0.28);
        }
        .ucn04stats-item {
          position: relative; display: flex; flex-direction: column; align-items: center; text-align: center;
          padding: clamp(38px,4.5vw,54px) 28px; gap: 12px;
          opacity: 0; transform: translateY(22px); transition: opacity .6s ease, transform .6s ease, background .35s;
        }
        .ucn04stats-item:not(:last-child)::after { content: ""; position: absolute; top: 26%; bottom: 26%; right: 0; width: 1px;
          background: linear-gradient(180deg, transparent, #e6eaf1 30%, #e6eaf1 70%, transparent); }
        .ucn04stats-item.ucn04stats-visible { opacity: 1; transform: translateY(0); }
        .ucn04stats-item:hover { background: linear-gradient(180deg, #fff, #FAF7F1); }
        .ucn04stats-mark { width: 46px; height: 3px; border-radius: 3px; background: ${GOLD}; margin-bottom: 4px;
          transition: width .4s cubic-bezier(.34,1.4,.5,1); }
        .ucn04stats-item:hover .ucn04stats-mark { width: 68px; }
        .ucn04stats-value {
          font-size: clamp(38px,4.6vw,56px); font-weight: 800; color: ${NAVY};
          letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums;
        }
        .ucn04stats-label { font-size: 15px; color: ${MUTED}; line-height: 1.4; font-weight: 500; }
        @media (max-width: 720px) {
          .ucn04stats-list { grid-template-columns: 1fr; }
          .ucn04stats-item:not(:last-child)::after { top: auto; bottom: 0; left: 22%; right: 22%; width: auto; height: 1px;
            background: linear-gradient(90deg, transparent, #e6eaf1 30%, #e6eaf1 70%, transparent); }
        }
      `}</style>
      <section ref={sectionRef} className="ucn04stats" data-template="ucetni-04-stats" id="cisla">
        <div className="ucn04stats-inner">
          {showHeader && (
            <div className="ucn04stats-head">
              {eyebrow.trim() && (
                <span className="ucn04stats-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </span>
              )}
              {heading.trim() && (
                <h2 className="ucn04stats-title">
                  <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
                </h2>
              )}
            </div>
          )}
          <ul className="ucn04stats-list">
            {items.map((item, i) => {
              const val  = String(item.value ?? "");
              const disp = visible ? buildDisplay(val, counts[i]) : val;
              return (
                <li
                  key={i}
                  className={`ucn04stats-item${visible ? " ucn04stats-visible" : ""}`}
                  style={{ transitionDelay: `${i * 130}ms` }}
                >
                  <span className="ucn04stats-mark" aria-hidden="true" />
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
function StatsKlima01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items = ((content.items as Array<{ value?: string; label?: string }>) ?? []);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function parse(raw: string) {
    const clean = raw.replace(/\s/g, "");
    const m = clean.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
    if (!m) return { num: 0, prefix: "", suffix: raw };
    return { num: parseInt(m[2], 10), prefix: m[1], suffix: m[3] };
  }

  function useCount(target: number, run: boolean, delay = 0) {
    const [val, setVal] = useState(0);
    useEffect(() => {
      if (!run) return;
      const start = performance.now() + delay;
      const dur = 1600;
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
  const c1 = useCount(parsed[1]?.num ?? 0, visible, 150);
  const c2 = useCount(parsed[2]?.num ?? 0, visible, 300);
  const counts = [c0, c1, c2];

  return (
    <section ref={ref} className="kl01-stats" data-template="klima-01">
      <div className="kl01-stats-grid">
        {items.map((item, i) => {
          const { prefix, suffix, num } = parsed[i] ?? { num: 0, prefix: "", suffix: "" };
          const display = num > 0
            ? `${prefix}${visible ? counts[i].toLocaleString("cs-CZ") : "0"}${suffix}`
            : String(item.value ?? "");
          return (
            <div key={i} className="kl01-stats-item" style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.7s ease ${i * 150}ms, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${i * 150}ms`,
            }}>
              <span className="kl01-stats-rule" aria-hidden="true" />
              <div className="kl01-stats-val">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(item.value ?? "")} tag="span">
                  {display}
                </GenericEditableText>
              </div>
              <div className="kl01-stats-label">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(item.label ?? "")} tag="span" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── solar-03-stats ────────────────────────────────────────────────────────────
function StatsSolar03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Stat = { value?: string; label?: string; description?: string; icon?: string };
  const eyebrow  = String(content.eyebrow  ?? "SolarPro v číslech");
  const title    = String(content.title    ?? "Dvě dekády tichého závazku");
  const subtitle = String(content.subtitle ?? "Nechte mluvit fakta. Naše čísla nejsou marketing — jsou to reálné projekty, spokojení majitelé a technologie vyráběná v Jihočeském kraji.");
  const stats: Stat[] = Array.isArray(content.stats) ? (content.stats as Stat[]) : [];

  const iconMap: Record<string, JSX.Element> = {
    trophy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v4a6 6 0 0 1-12 0V4z"/><path d="M6 4H3v2a3 3 0 0 0 3 3M18 4h3v2a3 3 0 0 1-3 3M9 20h6M12 14v6"/></svg>,
    house:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-9z"/></svg>,
    factory:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V10l6 4V10l6 4V6l6 4v11H3z"/><path d="M7 21v-3M12 21v-3M17 21v-3"/></svg>,
    check:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
    bolt:   <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>,
  };

  return (
    <section className="s03st-section" data-template="solar-03" id="cisla">
      <div className="s03st-bg-grid" aria-hidden="true" />
      <div className="s03st-inner">
        <div className="s03st-header">
          <div className="s03st-eyebrow">
            <span className="s03st-eyebrow-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </div>
          <h2 className="s03st-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="s03st-sub-lead">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="s03st-grid" data-count={stats.length}>
          {stats.map((stat, i) => {
            const iconKey = String(stat.icon ?? "");
            const iconEl = iconMap[iconKey] ?? iconMap.bolt;
            return (
              <article className="s03st-card" key={i}>
                <span className="s03st-card-topline" aria-hidden="true" />
                <span className="s03st-icon" aria-hidden="true">{iconEl}</span>
                <div className="s03st-value">
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={String(stat.value ?? "")} tag="span" />
                </div>
                <div className="s03st-label">
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={String(stat.label ?? "")} tag="span" />
                </div>
                <p className="s03st-desc">
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.description`} value={String(stat.description ?? "")} tag="span" />
                </p>
                <svg className="s03st-corner" width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                  <path d="M28 12V2H18" stroke="#ff8b00" strokeWidth="1.6" strokeLinecap="square"/>
                </svg>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── clean-02-stats (trust-strip) ──────────────────────────────────────────────
// Arctic Editorial: bílý pás s labelem vlevo a marquee textových wordmarků
// demo klientů (žádná cizí loga). `clients` = pole stringů, editovatelné.
function StatsClean02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title = String(content.title ?? "Uklízíme pro 40+ firem a bytových domů v Praze");
  const DEFAULT_CLIENTS = ["NORDIA OFFICE", "Atelier Sedm", "SVJ Vltavská 12", "PRAGMA advisory", "Kancelář 21", "SVJ Zelený dvůr", "Vektra Group", "Studio Náplavka"];
  const raw = Array.isArray(content.clients) ? (content.clients as unknown[]) : [];
  const clients = raw.length
    ? raw.map((x) => (typeof x === "string" ? x : String((x as Record<string, unknown>)?.name ?? ""))).filter(Boolean)
    : DEFAULT_CLIENTS;

  return (
    <>
      <style>{`
        .c02s-section {
          background: #fff;
          border-top: 1px solid #E2E8F1;
          border-bottom: 1px solid #E2E8F1;
          font-family: 'Onest', sans-serif;
          overflow: hidden;
        }
        .c02s-inner {
          max-width: 76rem; margin: 0 auto; padding: 1.5rem clamp(1.25rem, 4vw, 2.5rem);
          display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 2.5rem;
        }
        .c02s-title {
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #5B6577; margin: 0; max-width: 15rem; line-height: 1.5;
        }
        .c02s-track-wrap { position: relative; overflow: hidden; }
        .c02s-track-wrap::before,
        .c02s-track-wrap::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 6rem; z-index: 2; pointer-events: none;
        }
        .c02s-track-wrap::before { left: 0;  background: linear-gradient(to right, #fff, transparent); }
        .c02s-track-wrap::after  { right: 0; background: linear-gradient(to left,  #fff, transparent); }
        .c02s-track {
          display: flex; gap: 3.2rem; align-items: center; width: max-content;
          animation: c02s-scroll 36s linear infinite;
        }
        .c02s-track:hover { animation-play-state: paused; }
        @keyframes c02s-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .c02s-mark {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em;
          color: #98A4B8; white-space: nowrap; flex-shrink: 0;
          display: inline-flex; align-items: center; gap: 3.2rem;
          transition: color 0.3s;
        }
        .c02s-mark::after { content: ""; width: 5px; height: 5px; border-radius: 50%; background: #D6DEEA; }
        .c02s-mark:hover { color: #0B1526; }
        @media (max-width: 760px) {
          .c02s-inner { grid-template-columns: 1fr; gap: 1.1rem; padding-top: 1.3rem; padding-bottom: 1.3rem; }
          .c02s-title { max-width: none; }
        }
        @media (prefers-reduced-motion: reduce) { .c02s-track { animation: none; flex-wrap: wrap; } }
      `}</style>

      <section className="c02s-section" id={`section-${sectionId}`} data-template="clean-02-stats">
        <div className="c02s-inner">
          <p className="c02s-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </p>
          <div className="c02s-track-wrap">
            <div className="c02s-track">
              {[...clients, ...clients].map((name, i) => (
                <span key={i} className="c02s-mark">
                  {i < clients.length ? (
                    <GenericEditableText sectionId={sectionId} field={`clients.${i}`} value={name} tag="span" />
                  ) : (
                    name
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── hotel-02-features ─────────────────────────────────────────────────────────
function StatsHotel02Features({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c      = (content ?? {}) as Record<string, any>;
  const showHeader = c.showHeader !== false;
  const eyebrow = c.eyebrow ?? "Proč rezervovat přímo u nás?";
  const title   = c.title   ?? "Nejlepší ceny a benefity získáte rezervací na našem webu";
  const subtitle = c.subtitle ?? "Čtyři důvody, proč mít pobyt přímo od nás — bez prostředníků a bez skrytých poplatků.";
  const items: { number: string; title: string; description: string; icon?: string }[] = Array.isArray(c.items) ? c.items : [];

  const iconFor = (i: number) => {
    switch (i) {
      case 0: return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>);
      case 1: return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14l2.5 2.5L16 11"/></svg>);
      case 2: return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 7c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/></svg>);
      case 3: return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4 3.5-7 8-7s8 3 8 7"/></svg>);
      default: return null;
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" />
      <style>{`        .h02feat {
          position: relative;
          background: #f7f8f9;
          padding: clamp(80px,10vw,130px) clamp(20px,5vw,80px);
          font-family: 'Montserrat', sans-serif;
          overflow: hidden;
        }
        .h02feat::before {
          content: ""; position: absolute; top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 1px; height: 120px; background: linear-gradient(to bottom, transparent, #96A1AC);
        }
        .h02feat-header {
          text-align: center; max-width: 780px; margin: 0 auto clamp(56px,6vw,84px);
        }
        .h02feat-eyebrow {
          display: inline-flex; align-items: center; gap: 16px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.32em;
          text-transform: uppercase; color: #5B7A8E; margin: 0 0 20px;
        }
        .h02feat-eyebrow::before,
        .h02feat-eyebrow::after {
          content: ""; width: 34px; height: 1px; background: #5B7A8E;
        }
        .h02feat-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(30px, 3.4vw, 48px); font-weight: 400; font-style: italic;
          color: #1a2332; line-height: 1.12; letter-spacing: -0.005em;
          margin: 0 0 20px;
        }
        .h02feat-subtitle {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px; font-weight: 400; color: #6b7280; line-height: 1.7;
          margin: 0 auto; max-width: 620px;
        }
        .h02feat-grid {
          max-width: 1180px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
          background: #fff;
          box-shadow: 0 30px 80px -40px rgba(15,22,34,0.20);
        }
        .h02feat-card {
          position: relative;
          padding: clamp(36px,3.5vw,52px) clamp(30px,3.2vw,48px);
          display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: flex-start;
          border-right: 1px solid rgba(150,161,172,0.22);
          border-bottom: 1px solid rgba(150,161,172,0.22);
          transition: background 0.4s cubic-bezier(.22,.68,0,1);
          overflow: hidden;
        }
        .h02feat-card:nth-child(even) { border-right: none; }
        .h02feat-card:nth-last-child(-n+2) { border-bottom: none; }
        .h02feat-card::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; background: #96A1AC;
          transform: scaleY(0); transform-origin: top;
          transition: transform 0.5s cubic-bezier(.22,.68,0,1);
        }
        .h02feat-card:hover { background: #fbfcfd; }
        .h02feat-card:hover::before { transform: scaleY(1); }

        .h02feat-numwrap {
          position: relative; display: flex; flex-direction: column; align-items: center; gap: 14px;
          min-width: 78px;
        }
        .h02feat-num {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(52px,5.4vw,78px); font-weight: 500; font-style: italic; line-height: 1;
          color: #96A1AC; opacity: 0.35;
          user-select: none; transition: opacity 0.4s, color 0.4s;
        }
        .h02feat-card:hover .h02feat-num { opacity: 1; color: #5B7A8E; }
        .h02feat-icon {
          width: 38px; height: 38px; color: #5B7A8E;
          transition: transform 0.5s cubic-bezier(.22,.68,0,1);
        }
        .h02feat-card:hover .h02feat-icon { transform: rotate(-6deg) scale(1.08); }
        .h02feat-icon svg { width: 100%; height: 100%; }

        .h02feat-body { flex: 1; min-width: 0; }
        .h02feat-card-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(20px,2vw,26px); font-weight: 500;
          color: #1a2332; margin: 0 0 14px; line-height: 1.25;
          letter-spacing: -0.005em;
        }
        .h02feat-card-desc {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px; line-height: 1.85; color: #6b7280;
          font-weight: 400; margin: 0;
        }

        @media (max-width: 800px) {
          .h02feat-grid { grid-template-columns: 1fr; }
          .h02feat-card { border-right: none; }
          .h02feat-card:nth-child(even) { border-right: none; }
          .h02feat-card:nth-last-child(-n+2) { border-bottom: 1px solid rgba(150,161,172,0.22); }
          .h02feat-card:last-child { border-bottom: none; }
        }
        @media (max-width: 480px) {
          .h02feat-card { grid-template-columns: 1fr; gap: 20px; }
          .h02feat-numwrap { flex-direction: row; gap: 20px; }
        }
      `}</style>

      <section className="h02feat" id="benefity" data-template="hotel-02-features">
        {showHeader && (
          <div className="h02feat-header">
            <span className="h02feat-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2 className="h02feat-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="h02feat-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        <div className="h02feat-grid">
          {items.map((item, i) => (
            <div className="h02feat-card" key={i}>
              <div className="h02feat-numwrap">
                <span className="h02feat-num">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.number`} value={item.number ?? `0${i + 1}`} tag="span" />
                </span>
                <span className="h02feat-icon" aria-hidden="true">{iconFor(i)}</span>
              </div>
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

// Count-up value pro autoservis-03 — parsuje "15+", "3 000+", "4.8★", "24h"
function A03StatValue({ value }: { value: string }) {
  const m = value.match(/^(\D*)([\d][\d\s.,]*)(\D*)$/);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(m ? m[1] + "0" + m[3] : value);

  useEffect(() => {
    if (!m) { setDisplay(value); return; }
    const prefix = m[1];
    const suffix = m[3];
    const numStr = m[2].trim();
    const hasSpace = /\s/.test(numStr);
    const clean = numStr.replace(/\s/g, "").replace(",", ".");
    const decimals = clean.includes(".") ? clean.split(".")[1].length : 0;
    const target = parseFloat(clean);
    const fmt = (n: number) => {
      let s = decimals ? n.toFixed(decimals) : String(Math.round(n));
      if (hasSpace) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return prefix + s + suffix;
    };
    const el = ref.current;
    if (!el) return;
    let done = false;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || done) return;
      done = true;
      const dur = 1500, steps = 48, iv = dur / steps;
      let step = 0;
      const t = setInterval(() => {
        step++;
        const p = step / steps;
        const ease = 1 - Math.pow(1 - p, 3);
        setDisplay(fmt(target * ease));
        if (step >= steps) { clearInterval(t); setDisplay(fmt(target)); }
      }, iv);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{display}</span>;
}

function StatsAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items = (content.items as Array<{ value: string; label: string }>) ?? [];
  return (
    <section id="statistiky" className="as03stat" data-template="autoservis-03">
      {/* orange radial glow */}
      <style>{`        .as03stat { padding: 56px 40px; background: #111827; border-top: 1px solid rgba(249,115,22,.15); border-bottom: 1px solid rgba(249,115,22,.15); }
        .as03stat-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 0; }
        .as03stat-item { text-align: center; padding: 0 24px; border-right: 1px solid rgba(249,115,22,.2); }
        .as03stat-item:last-child { border-right: none; }
        .as03stat-num { font-family: 'Inter', sans-serif; font-size: clamp(36px, 4vw, 52px); font-weight: 800; color: #f97316; line-height: 1; letter-spacing: -1px; }
        .as03stat-lbl { font-family: 'Inter', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #9ca3af; margin-top: 8px; }
        @media (max-width: 768px) { .as03stat { padding: 40px 24px; } .as03stat-inner { grid-template-columns: repeat(2,1fr); gap: 32px; } .as03stat-item { border-right: none; padding: 0; } }
        @media (max-width: 400px) { .as03stat-inner { grid-template-columns: 1fr; } }
      
        .as03stat { position: relative; overflow: hidden; }
        .as03stat-glow { position: absolute; top: -240px; left: 50%; transform: translateX(-50%); width: 720px; height: 520px; background: radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 65%); pointer-events: none; }
        .as03stat-item { position: relative; }
        .as03stat-tick { display: block; width: 26px; height: 3px; margin: 0 auto 14px; background: linear-gradient(to right,#f97316,#c2410c); border-radius: 2px; }
      `}</style>
      <div aria-hidden="true" className="as03stat-glow" />
      <div className="as03stat-inner">
        {items.map((item, i) => (
          <div key={i} className="as03stat-item">
            <span aria-hidden="true" className="as03stat-tick" />
            <div className="as03stat-num">
              <A03StatValue value={String(item.value)} />
              {/* skrytý editovatelný zdroj hodnoty */}
              <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={item.value} tag="span" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }} />
            </div>
            <div className="as03stat-lbl">
              <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={item.label} tag="span" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsEvents01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD = "#d4b896";
  const showHeader = content.showHeader !== false;
  const eyebrow    = String(content.eyebrow  ?? "V číslech");
  const title      = String(content.title    ?? "");
  const items      = (content.items as Array<{ value: string; suffix?: string; label: string }>) ?? [];

  return (
    <>
      <style>{`
        .ev01stat {
          position: relative;
          padding: 110px 40px 110px;
          background: linear-gradient(180deg, #181818 0%, #141414 100%);
          color: #fff;
          text-align: center;
          overflow: hidden;
        }
        .ev01stat::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.16) 50%, transparent 100%);
        }
        .ev01stat::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.16) 50%, transparent 100%);
        }
        .ev01stat-inner { max-width: 1240px; margin: 0 auto; position: relative; z-index: 1; }
        .ev01stat-head { margin-bottom: 70px; }
        .ev01stat-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          color: ${GOLD};
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 22px;
        }
        .ev01stat-eyebrow::before,
        .ev01stat-eyebrow::after {
          content: "";
          display: block;
          width: 44px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${GOLD} 100%);
        }
        .ev01stat-eyebrow::after {
          background: linear-gradient(90deg, ${GOLD} 0%, transparent 100%);
        }
        .ev01stat-h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 400;
          color: #fff;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.2;
          font-style: italic;
        }
        .ev01stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          align-items: stretch;
        }
        .ev01stat-item {
          position: relative;
          padding: 24px 20px;
          opacity: 0;
          transform: translateY(16px);
          animation: ev01statReveal 1s cubic-bezier(.32,.72,0,1) forwards;
        }
        .ev01stat-item:nth-child(1) { animation-delay: 0.15s; }
        .ev01stat-item:nth-child(2) { animation-delay: 0.3s;  }
        .ev01stat-item:nth-child(3) { animation-delay: 0.45s; }
        .ev01stat-item:nth-child(4) { animation-delay: 0.6s;  }
        .ev01stat-item + .ev01stat-item::before {
          content: "";
          position: absolute;
          left: -10px;
          top: 22%;
          bottom: 22%;
          width: 1px;
          background: linear-gradient(180deg, transparent 0%, rgba(212,184,150,0.28) 50%, transparent 100%);
        }
        @keyframes ev01statReveal { to { opacity: 1; transform: translateY(0); } }
        .ev01stat-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: clamp(56px, 7vw, 96px);
          font-weight: 400;
          color: ${GOLD};
          line-height: 1;
          letter-spacing: -0.02em;
          display: inline-flex;
          align-items: baseline;
        }
        .ev01stat-suffix {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 0.55em;
          margin-left: 2px;
          color: ${GOLD};
          opacity: 0.8;
        }
        .ev01stat-rule {
          display: block;
          width: 40px;
          height: 1px;
          background: rgba(212,184,150,0.35);
          margin: 22px auto 20px;
        }
        .ev01stat-lbl {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.68);
        }
        @media (max-width: 768px) {
          .ev01stat { padding: 80px 24px 80px; }
          .ev01stat-head { margin-bottom: 50px; }
          .ev01stat-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .ev01stat-item + .ev01stat-item::before { display: none; }
        }
        @media (max-width: 400px) {
          .ev01stat-grid { grid-template-columns: 1fr; gap: 28px; }
        }
      `}</style>
      <section className="ev01stat" data-template="events-01-stats">
        <div className="ev01stat-inner">
          {showHeader && (eyebrow || title) && (
            <div className="ev01stat-head">
              {eyebrow && (
                <div className="ev01stat-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">{eyebrow}</GenericEditableText>
                </div>
              )}
              {title && (
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
                  <h2 className="ev01stat-h2">{title}</h2>
                </GenericEditableText>
              )}
            </div>
          )}
          <div className="ev01stat-grid">
            {items.map((item, i) => {
              const numericTarget = parseInt(item.value, 10);
              const isNumeric = !isNaN(numericTarget);
              return (
                <div key={i} className="ev01stat-item">
                  <div className="ev01stat-num">
                    {isNumeric ? (
                      <>
                        <Ev01StatCounter target={numericTarget} suffix="" />
                        {item.suffix && <span className="ev01stat-suffix">{item.suffix}</span>}
                      </>
                    ) : (
                      <>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={item.value} tag="span">{item.value}</GenericEditableText>
                        {item.suffix && <span className="ev01stat-suffix">{item.suffix}</span>}
                      </>
                    )}
                  </div>
                  <span className="ev01stat-rule" aria-hidden="true" />
                  <div className="ev01stat-lbl">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={item.label} tag="span">{item.label}</GenericEditableText>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ── rekonstrukce-01-usp ───────────────────────────────────────────────────────
// 3-pilíř USP pás pod hero: ambrová icon dlaždice + title + text, hover lift.
// ──────────────────────────────────────────────────────────────────────────────
function StatsRekonstrukce01Usp({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const AMBER = "#C2622B";
  const AMBER2 = "#A24E1F";
  const DARK  = "#1F1B17";
  const MUTED = "#7A7066";
  const BG    = "#FAF7F2";
  const CREAM = "#F2ECE3";
  const FONT  = "'Inter', sans-serif";

  type UspItem = { icon?: string; title?: string; text?: string };
  const items: UspItem[] = (content.items as UspItem[]) ?? [
    { icon: "award",  title: "Dlouholeté zkušenosti", text: "Více než 25 let praxe v oblasti rekonstrukcí bytů a bytových jader." },
    { icon: "shield", title: "Profesionální servis",   text: "Garantujeme vysoký standard práce a dodržení dohodnutých termínů." },
    { icon: "layers", title: "Ověřené materiály",      text: "Používáme pouze prověřené materiály od spolehlivých dodavatelů." },
  ];

  const Icon = ({ name }: { name: string }) => {
    const p = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
    if (name === "award") return (<svg {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>);
    if (name === "shield") return (<svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>);
    if (name === "layers") return (<svg {...p}><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m6.08 9.5-3.48 1.6a1 1 0 0 0 0 1.81l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.48-1.59"/></svg>);
    return (<svg {...p}><circle cx="12" cy="12" r="9"/></svg>);
  };

  return (
    <section style={{ backgroundColor: BG, fontFamily: FONT, padding: "clamp(56px,8vw,88px) 0", position: "relative", opacity: 1 }} data-template="rekonstrukce-01">
      <style>{`
        .rk01usp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1180px;margin:0 auto;padding:0 32px;}
        .rk01usp-card{position:relative;background:#fff;border:1px solid ${CREAM};border-radius:18px;padding:34px 30px;box-shadow:0 2px 14px rgba(60,40,20,.05);transition:transform .28s cubic-bezier(.2,.7,.2,1),box-shadow .28s ease,border-color .28s ease;overflow:hidden;}
        .rk01usp-card::before{content:"";position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,${AMBER},${AMBER2});transform:scaleX(0);transform-origin:left;transition:transform .3s cubic-bezier(.4,0,.2,1);}
        .rk01usp-card:hover{transform:translateY(-6px);box-shadow:0 22px 50px rgba(60,40,20,.12);border-color:rgba(194,98,43,.28);}
        .rk01usp-card:hover::before{transform:scaleX(1);}
        .rk01usp-ic{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:linear-gradient(140deg,rgba(194,98,43,.14),rgba(162,78,31,.1));color:${AMBER2};margin-bottom:20px;transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .3s ease,color .3s ease;}
        .rk01usp-card:hover .rk01usp-ic{transform:scale(1.08) rotate(-5deg);background:linear-gradient(140deg,${AMBER},${AMBER2});color:#fff;}
        @media(max-width:860px){.rk01usp-grid{grid-template-columns:1fr;gap:16px;}}
      `}</style>
      <div className="rk01usp-grid">
        {items.map((it, i) => (
          <div key={i} className="rk01usp-card">
            <span className="rk01usp-ic"><Icon name={String(it.icon ?? "layers")} /></span>
            <h3 style={{ color: DARK, fontSize: "1.18rem", fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(it.title ?? "")} tag="span" />
            </h3>
            <p style={{ color: MUTED, fontSize: "0.94rem", lineHeight: 1.65, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={String(it.text ?? "")} tag="span" />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══ PROOF (proof-01) — trust band (count-up čísla + certifikace) ═══════════════
// Count-up jen na veřejném webu; ve Studiu zůstává editovatelný text.
function Pf01CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const m = value.match(/^([\d\s ]+(?:,\d+)?)([\s\S]*)$/);
    if (!m) { setDisplay(value); return; }
    const numStr = m[1].trim();
    const suffix = m[2] ?? "";
    const target = parseFloat(numStr.replace(/[\s ]/g, "").replace(",", "."));
    if (!isFinite(target)) { setDisplay(value); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplay(value); return; }
    const el = ref.current;
    if (!el) return;
    const decimals = numStr.includes(",") ? (numStr.split(",")[1] ?? "").length : 0;
    const fmtN = (v: number) => v.toLocaleString("cs-CZ", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    let raf = 0;
    let started = false;
    setDisplay(fmtN(0) + suffix);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started) return;
      started = true;
      io.disconnect();
      const t0 = performance.now();
      const dur = 1200;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        if (p < 1) { setDisplay(fmtN(target * eased) + suffix); raf = requestAnimationFrame(tick); }
        else setDisplay(value);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [value]);
  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{display}</span>;
}

function StatsProof01({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const items = (content.items as Array<{ value?: string; label?: string }> | undefined) ?? [];
  const rawBadges = content.badges as string[] | undefined;
  const badges = rawBadges && rawBadges.length ? rawBadges : [];
  const badgesLabel = String(content.badgesLabel ?? "Certifikace a záruky");
  return (
    <>
      <style>{`
        .pf01st { --pf-accent:#E85A48; --pf-ink:#1B3A5C; --pf-muted:#6A6E78; --pf-border:rgba(255,255,255,.14);
          background:#0C1622; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:#fff;
          padding:clamp(44px,6vw,72px) clamp(20px,5vw,48px); }
        .pf01st-inner { max-width:1280px; margin:0 auto; display:grid; grid-template-columns:1.3fr 1fr; gap:clamp(28px,5vw,64px); align-items:center; }
        .pf01st-nums { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:clamp(20px,3vw,40px); }
        .pf01st-num { border-top:2px solid var(--pf-accent); padding-top:16px; }
        .pf01st-num b { display:block; font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(2.2rem,4.4vw,3.4rem); font-weight:800; letter-spacing:-.03em; line-height:1; color:#fff; }
        .pf01st-num span { display:block; font-size:.88rem; color:rgba(255,255,255,.62); margin-top:8px; line-height:1.35; }
        .pf01st-badges { border-left:1px solid var(--pf-border); padding-left:clamp(20px,3vw,40px); }
        .pf01st-badges-lbl { font-size:.74rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.55); margin:0 0 14px; }
        .pf01st-chips { display:flex; flex-wrap:wrap; gap:9px; }
        .pf01st-chip { display:inline-flex; align-items:center; gap:7px; padding:8px 13px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.16); border-radius:999px; font-size:.85rem; font-weight:600; color:#fff; }
        .pf01st-chip svg { color:var(--pf-accent); flex-shrink:0; }
        @media (max-width:820px){ .pf01st-inner{ grid-template-columns:1fr; } .pf01st-badges{ border-left:none; border-top:1px solid var(--pf-border); padding-left:0; padding-top:24px; } }
      `}</style>
      <section className="pf01st" data-template="proof-01">
        <div className="pf01st-inner">
          <div className="pf01st-nums">
            {items.map((it, i) => (
              <div key={i} className="pf01st-num">
                <b>
                  {isAdmin
                    ? <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(it.value ?? "")} tag="span" />
                    : <Pf01CountUp value={String(it.value ?? "")} />}
                </b>
                <span><GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(it.label ?? "")} tag="span" /></span>
              </div>
            ))}
          </div>
          {badges.length > 0 && (
            <div className="pf01st-badges">
              <p className="pf01st-badges-lbl"><GenericEditableText sectionId={sectionId} field="badgesLabel" value={badgesLabel} tag="span" /></p>
              <div className="pf01st-chips">
                {badges.map((b, i) => (
                  <span key={i} className="pf01st-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                    <GenericEditableText sectionId={sectionId} field={`badges.${i}`} value={b} tag="span" />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
