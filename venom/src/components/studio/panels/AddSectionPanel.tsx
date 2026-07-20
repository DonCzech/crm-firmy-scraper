"use client";

import type React from "react";
import type { StudioState } from "../TenantStudioView";
import { setWixAdd } from "./wix-add-state";
import { buildRichLibrary } from "@/sections/categories";

/* ── Inline SVG icons ────────────────────────────────────────────────────── */

function IcoHero() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="22" height="20" rx="2" />
      <line x1="8" y1="11" x2="20" y2="11" />
      <line x1="10" y1="15" x2="18" y2="15" />
      <rect x="11" y="18" width="6" height="3" rx="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcoAbout() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="8" x2="13" y2="8" />
      <line x1="4" y1="12" x2="13" y2="12" />
      <line x1="4" y1="16" x2="11" y2="16" />
      <rect x="16" y="7" width="9" height="12" rx="1.5" />
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
function IcoContact() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="22" height="16" rx="2" />
      <path d="M3 8l11 8 11-8" />
    </svg>
  );
}
function IcoCta() {
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
      <text x="2" y="22" fontSize="22" fontFamily="Georgia,serif" fontWeight="700" opacity="0.85">&ldquo;</text>
      <text x="14" y="22" fontSize="22" fontFamily="Georgia,serif" fontWeight="700" opacity="0.85">&rdquo;</text>
    </svg>
  );
}
function IcoFaq() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="22" height="5" rx="1.5" />
      <rect x="3" y="13" width="22" height="5" rx="1.5" />
      <rect x="3" y="21" width="22" height="5" rx="1.5" />
      <path d="M22 7.5l-2 2-2-2" />
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
function IcoBlog() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="20" height="20" rx="2" />
      <line x1="8" y1="10" x2="20" y2="10" />
      <line x1="8" y1="14" x2="20" y2="14" />
      <line x1="8" y1="18" x2="15" y2="18" />
    </svg>
  );
}
function IcoHours() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="14" r="10" />
      <path d="M14 8v6l4 3" />
    </svg>
  );
}
function IcoCanvas() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="22" height="22" rx="2" strokeDasharray="4 3" />
      <circle cx="10" cy="11" r="2.5" />
      <rect x="15" y="15" width="7" height="5" rx="1" />
    </svg>
  );
}
function IcoEmbed() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 8l-6 6 6 6M18 8l6 6-6 6" />
    </svg>
  );
}
function IcoServices() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="6" height="6" rx="1.5" />
      <rect x="11" y="5" width="6" height="6" rx="1.5" />
      <rect x="19" y="5" width="6" height="6" rx="1.5" />
      <line x1="4" y1="16" x2="24" y2="16" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

/* ── Element definitions — každá položka mapuje na REÁLNÝ section type ──── */

export interface Elem {
  sectionType: string;
  variant?: string;
  label: string;
  Icon: React.FC;
}

const OBSAH: Elem[] = [
  { sectionType: "hero",          variant: "default",           label: "Hero",       Icon: IcoHero },
  { sectionType: "about",         variant: "two-col",           label: "Text + foto", Icon: IcoAbout },
  { sectionType: "services",      variant: "cards-grid",        label: "Služby",     Icon: IcoServices },
  { sectionType: "gallery",       variant: "gallery-universal", label: "Galerie",    Icon: IcoGallery },
  { sectionType: "testimonials",  variant: "default",           label: "Recenze",    Icon: IcoQuote },
  { sectionType: "faq",           variant: "default",           label: "FAQ",        Icon: IcoFaq },
];

const KONVERZE: Elem[] = [
  { sectionType: "cta",           variant: "default",      label: "Výzva k akci", Icon: IcoCta },
  { sectionType: "pricing",       variant: "pricing-list", label: "Ceník",        Icon: IcoPricing },
  { sectionType: "contact",       variant: "default",      label: "Kontakt",      Icon: IcoContact },
  { sectionType: "map",           variant: "default",      label: "Mapa",         Icon: IcoMap },
  { sectionType: "opening-hours", variant: "default",      label: "Otevírací doba", Icon: IcoHours },
];

const DALSI: Elem[] = [
  { sectionType: "team",         variant: "cards-grid", label: "Tým",          Icon: IcoTeam },
  { sectionType: "stats",        variant: "default",    label: "Statistiky",   Icon: IcoStats },
  { sectionType: "blog-preview", variant: "default",    label: "Blog",         Icon: IcoBlog },
  { sectionType: "freeform",     variant: "default",    label: "Volné plátno", Icon: IcoCanvas },
  { sectionType: "embed",        variant: "default",    label: "HTML / embed", Icon: IcoEmbed },
];

export const GROUPS: Array<{ title: string; items: Elem[] }> = [
  { title: "OBSAH",    items: OBSAH },
  { title: "KONVERZE", items: KONVERZE },
  { title: "DALŠÍ",    items: DALSI },
];

const VARIANT_COUNTS = buildRichLibrary().reduce<Record<string, number>>((counts, entry) => {
  counts[entry.type] = (counts[entry.type] ?? 0) + 1;
  return counts;
}, {});

export function getVariantCount(sectionType: string): number {
  return VARIANT_COUNTS[sectionType] ?? 1;
}

export function AddSectionPanel(_: { state: StudioState }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto vs-scroll">
      {/* Launcher — plná knihovna v overlay */}
      <div className="px-3 pt-4">
        <button
          type="button"
          onClick={() => setWixAdd("sections")}
          className="vs-grad-accent flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[12.5px] font-semibold text-white shadow-[var(--vs-glow-brand)] transition-opacity hover:opacity-90"
        >
          Otevřít knihovnu sekcí
        </button>
        <p className="mt-2 px-1 text-[11px] leading-snug text-[var(--vs-text-dim)]">
          Doporučené bloky, varianty ze šablon i vaše uložené sekce.
        </p>
      </div>

      {/* Typ sekce → otevře vizuální výběr všech dostupných variant. */}
      {GROUPS.map((group) => (
        <div key={group.title} className="px-3 pt-4 pb-2">
          <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-[var(--vs-text-dim)] uppercase px-1">
            {group.title}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {group.items.map((item, i) => (
              <button
                key={`${item.sectionType}-${item.label}-${i}`}
                type="button"
                onClick={() => setWixAdd("sections", { filterType: item.sectionType })}
                className="vs-section-type-card group relative flex flex-col items-center gap-2 rounded-xl border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2 py-4 transition-[border-color,background,box-shadow,transform] duration-150 hover:border-[var(--vs-accent-ring)] hover:bg-[var(--vs-surface-2)] hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-[var(--vs-accent-ring)] focus:ring-offset-1 focus:ring-offset-[var(--vs-bg-soft)]"
                aria-label={`${item.label} – vybrat z ${getVariantCount(item.sectionType)} variant`}
              >
                <span className="absolute right-2 top-2 rounded-full bg-[var(--vs-accent-bg)] px-1.5 py-0.5 text-[9.5px] font-bold text-[var(--vs-accent-hi)]">
                  {getVariantCount(item.sectionType)}×
                </span>
                <span className="text-[var(--vs-text-muted)] transition-colors duration-100 group-hover:text-[var(--vs-text-soft)]">
                  <item.Icon />
                </span>
                <span className="text-[11.5px] font-medium text-[var(--vs-text-muted)] group-hover:text-[var(--vs-text-soft)] leading-none transition-colors duration-100">
                  {item.label}
                </span>
                <span className="text-[9.5px] text-[var(--vs-text-dim)]">Vybrat vzhled</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="h-4" />
    </div>
  );
}
