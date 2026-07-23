"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MOON_DATA } from "@/astera/lib/moon-data";
import { useContent } from "@/astera/context/ContentContext";
import type { Lang } from "@/astera/lib/i18n";
import { DEFAULT_CONTENT } from "@/astera/lib/content-types";

const MOON_LOCALES: Record<Lang, string> = {
  cs: "cs-CZ",
  en: "en-GB",
  ua: "uk-UA",
};

function todayKey() {
  const n = new Date();
  return `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
}

function fallbackImg(date: Date): string {
  const known = new Date("2000-01-06T18:14:00Z");
  const cycle = 29.53058867;
  const age = (((date.getTime()-known.getTime())/86400000)%cycle+cycle)%cycle;
  const map = [0,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1];
  return `${map[Math.round((age/cycle)*16)%16]}.png`;
}

function buildMoonDay(lang: Lang) {
  const now = new Date();
  const key = todayKey();
  const entry = MOON_DATA[key] ?? { img: fallbackImg(now), phase: "Waxing Gibbous", stage: "Waxing", illumination: 50 };
  const label = new Intl.DateTimeFormat(MOON_LOCALES[lang], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  return { entry, label };
}

interface Props {
  /** height of the surrounding header — used to vertically centre the widget */
  headerHeight: number;
}

export default function MoonWidget({ headerHeight }: Props) {
  const { content, currentLang } = useContent();
  const [open, setOpen] = useState(false);
  // Calculate synchronously — moon phase is the same all day, no hydration mismatch
  const { entry: moonDay, label: dateLabel } = buildMoonDay(currentLang);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey   = (e: KeyboardEvent) => e.key==="Escape" && setOpen(false);
    const onClick = (e: MouseEvent)    => { if (popupRef.current && !popupRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  const moonContent = content.moonWidget ?? DEFAULT_CONTENT.moonWidget;
  const phaseText = moonContent.phases?.[moonDay.phase];
  const phaseLabel = phaseText?.label || moonDay.phase;
  const desc       = phaseText?.description || "";
  const stageLabel = moonContent.stages?.[moonDay.stage] || moonDay.stage;
  const imgBase = moonDay.img.replace(/\.[^.]+$/, "");
  const imgSrc  = `/optimized/images/moon-phases/${imgBase}.webp`;

  return (
    <>
      {/* ── Nav item ──────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label={moonContent.aria}
        style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "0 12px",
          height: `${headerHeight}px`,
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "14px", fontWeight: 500, color: "#1f1f1f",
          whiteSpace: "nowrap",
          transition: "color 0.2s",
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#7c3bb2")}
        onMouseLeave={e => (e.currentTarget.style.color = "#1f1f1f")}
      >
        <Image
          src={imgSrc} alt={phaseLabel}
          width={20} height={20}
          style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          unoptimized
        />
        <span className="moon-widget-text">{phaseLabel}</span>
      </button>

      {/* ── Popup ─────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            ref={popupRef}
            style={{
              backgroundColor: "#0f0f1a",
              borderRadius: "18px",
              padding: "36px 32px 32px",
              width: "min(340px, 90vw)",
              display: "flex", flexDirection: "column", alignItems: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.65)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label={moonContent.close}
              style={{
                position: "absolute", top: "14px", right: "16px",
                background: "none", border: "none", cursor: "pointer",
                color: "#d4c9a8", opacity: 0.4, fontSize: "22px", lineHeight: 1, padding: "4px",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.4")}
            >×</button>

            <div style={{ marginBottom: "22px" }}>
              <Image src={imgSrc} alt={phaseLabel} width={180} height={180}
                style={{ borderRadius: "50%", objectFit: "cover" }} unoptimized />
            </div>

            <p style={{ color: "#9b8e72", fontSize: "11px", letterSpacing: "0.1em",
              fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", marginBottom: "6px" }}>
              {dateLabel}
            </p>

            <h2 style={{ color: "#f0e4c0", fontSize: "22px",
              fontFamily: "'Playfair Display', serif", marginBottom: "5px", textAlign: "center" }}>
              {phaseLabel}
            </h2>

            <p style={{ color: "#9b8e72", fontSize: "12px",
              fontFamily: "'Poppins', sans-serif", marginBottom: "18px" }}>
              {moonContent.illumination} {moonDay.illumination}&nbsp;% · {stageLabel}
            </p>

            <div style={{ width: "40px", height: "1px", backgroundColor: "#2a2a40", marginBottom: "18px" }} />

            <p style={{ color: "#c4b99a", fontSize: "13px", lineHeight: "1.75",
              fontFamily: "'Poppins', sans-serif", textAlign: "center" }}>
              {desc}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
