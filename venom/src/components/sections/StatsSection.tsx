"use client";

import { useEffect, useRef, useState } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";

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
