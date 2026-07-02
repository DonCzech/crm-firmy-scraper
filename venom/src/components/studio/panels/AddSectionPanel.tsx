"use client";

import type React from "react";
import type { StudioState } from "../TenantStudioView";

/* ── Inline SVG icons — exact shapes from solidpixels reference ─────────── */

function IcoText() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h18M14 7v14M10 21h8" />
    </svg>
  );
}
function IcoImage() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="22" height="16" rx="2" />
      <path d="M3 18l5-5 4 4 4-4 9 7" />
      <circle cx="9" cy="11" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcoGallery() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
      <rect x="15" y="3" width="10" height="10" rx="1.5" />
      <rect x="3" y="15" width="10" height="10" rx="1.5" />
      <rect x="15" y="15" width="10" height="10" rx="1.5" />
    </svg>
  );
}
function IcoMap() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4C10.13 4 7 7.13 7 11c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="14" cy="11" r="2.5" />
    </svg>
  );
}
function IcoVideo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="14" r="11" />
      <polygon points="11,9 21,14 11,19" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcoButton() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="20" height="8" rx="4" />
      <line x1="10" y1="14" x2="18" y2="14" />
    </svg>
  );
}
function IcoQuote() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
      <text x="2" y="22" fontSize="22" fontFamily="Georgia,serif" fontWeight="700" opacity="0.85">"</text>
      <text x="14" y="22" fontSize="22" fontFamily="Georgia,serif" fontWeight="700" opacity="0.85">"</text>
    </svg>
  );
}
function IcoSpacer() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="6" x2="24" y2="6" />
      <line x1="4" y1="22" x2="24" y2="22" />
      <line x1="14" y1="9" x2="14" y2="19" strokeDasharray="2 2" />
      <path d="M11 11l3-3 3 3M11 17l3 3 3-3" />
    </svg>
  );
}
function IcoDivider() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="14" x2="24" y2="14" />
    </svg>
  );
}
function IcoBox() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="22" height="6" rx="1.5" />
      <rect x="3" y="17" width="22" height="6" rx="1.5" />
    </svg>
  );
}
function IcoLayout() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="9" height="22" rx="1.5" />
      <rect x="16" y="3" width="9" height="10" rx="1.5" />
      <rect x="16" y="17" width="9" height="8" rx="1.5" />
    </svg>
  );
}
function IcoAccordion() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="22" height="5" rx="1.5" />
      <rect x="3" y="13" width="22" height="5" rx="1.5" />
      <rect x="3" y="21" width="22" height="5" rx="1.5" />
      <path d="M22 7.5l-2 2-2-2" />
    </svg>
  );
}
function IcoTabs() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h8V7H3v5zM11 12h14v12H3V12" />
    </svg>
  );
}
function IcoPricing() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="22" height="18" rx="2" />
      <line x1="3" y1="11" x2="25" y2="11" />
      <line x1="14" y1="5" x2="14" y2="23" />
    </svg>
  );
}
function IcoTeam() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="4" />
      <circle cx="20" cy="10" r="4" />
      <path d="M3 24c0-4.4 3.1-8 7-8h8c3.9 0 7 3.6 7 8" />
    </svg>
  );
}
function IcoStats() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V14h5v8M12 22V8h5v14M20 22V4h5v18" />
    </svg>
  );
}

/* ── Element definitions ─────────────────────────────────────────────────── */

export interface Elem {
  sectionType: string;
  variant?: string;
  label: string;
  Icon: React.FC;
}

const ZAKLADNI: Elem[] = [
  { sectionType: "hero",         label: "Text",         Icon: IcoText },
  { sectionType: "gallery",      label: "Obrázek",      Icon: IcoImage },
  { sectionType: "gallery",      variant: "grid", label: "Galerie", Icon: IcoGallery },
  { sectionType: "map",          label: "Mapa",         Icon: IcoMap },
  { sectionType: "hero",         variant: "video", label: "Video", Icon: IcoVideo },
  { sectionType: "cta",          label: "Tlačítko",     Icon: IcoButton },
  { sectionType: "testimonials", label: "Citace",       Icon: IcoQuote },
  { sectionType: "promo",        label: "Mezera",       Icon: IcoSpacer },
  { sectionType: "stats",        label: "Dělící čára",  Icon: IcoDivider },
];

const LAYOUT: Elem[] = [
  { sectionType: "about",     label: "Box",       Icon: IcoBox },
  { sectionType: "services",  label: "Layout",    Icon: IcoLayout },
  { sectionType: "faq",       label: "Harmonika", Icon: IcoAccordion },
  { sectionType: "pricing",   label: "Záložky",   Icon: IcoTabs },
];

const POKROCILE: Elem[] = [
  { sectionType: "pricing",      label: "Ceník",      Icon: IcoPricing },
  { sectionType: "team",         label: "Tým",        Icon: IcoTeam },
  { sectionType: "stats",        label: "Statistiky", Icon: IcoStats },
  { sectionType: "contact",      label: "Kontakt",    Icon: IcoMap },
  { sectionType: "testimonials", label: "Recenze",    Icon: IcoQuote },
  { sectionType: "blog-preview", label: "Blog",       Icon: IcoText },
];

export const GROUPS: Array<{ title: string; items: Elem[] }> = [
  { title: "ZÁKLADNÍ",  items: ZAKLADNI },
  { title: "LAYOUT",    items: LAYOUT },
  { title: "POKROČILÉ", items: POKROCILE },
];

export function AddSectionPanel({ state }: { state: StudioState }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto vs-scroll">
      {GROUPS.map((group) => (
        <div key={group.title} className="px-3 pt-4 pb-2">
          {/* Category header */}
          <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-[var(--vs-text-dim)] uppercase px-1">
            {group.title}
          </p>

          {/* 2-column icon grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {group.items.map((item, i) => (
              <button
                key={`${item.sectionType}-${item.label}-${i}`}
                type="button"
                onClick={() => void state.addSection(item.sectionType, item.variant ?? "default")}
                className="group flex flex-col items-center gap-2 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2 py-4 transition-[border-color,background] duration-100 hover:border-[rgba(129,140,248,0.45)] hover:bg-[var(--vs-surface-2)] focus:outline-none focus:ring-2 focus:ring-[rgba(129,140,248,0.4)] focus:ring-offset-1 focus:ring-offset-[var(--vs-bg-soft)]"
                aria-label={item.label}
              >
                <span className="text-[var(--vs-text-muted)] transition-colors duration-100 group-hover:text-[var(--vs-text-soft)]">
                  <item.Icon />
                </span>
                <span className="text-[11.5px] font-medium text-[var(--vs-text-muted)] group-hover:text-[var(--vs-text-soft)] leading-none transition-colors duration-100">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="h-4" />
    </div>
  );
}
