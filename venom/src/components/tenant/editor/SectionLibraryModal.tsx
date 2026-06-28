"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Search, Plus, Sparkles } from "lucide-react";
import { buildSectionLibrary } from "@/sections/variants";
import { SECTION_TYPE_LABELS } from "@/sections/labels";
import "../../studio/design-tokens.css";

/**
 * Premium fullscreen section picker — opens directly on top of the canvas so
 * adding a section is a single click instead of "Builder → sidebar → +
 * Přidat sekci". Same library data as the PageBuilder side panel but
 * presented as a 3-column gallery with bigger preview chips.
 */

const SECTION_LIBRARY = buildSectionLibrary().filter(
  (e) => e.type !== "navbar" && e.type !== "footer" && e.type !== "full-page-clone" && e.type !== "astera-home"
);

const TYPE_LABEL: Record<string, string> = {
  hero: "Hero", services: "Služby", pricing: "Ceník", testimonials: "Recenze",
  gallery: "Galerie", contact: "Kontakt", "opening-hours": "Otevírací doba",
  faq: "FAQ", cta: "CTA", team: "Tým", about: "O nás", "blog-preview": "Blog",
  map: "Mapa", promo: "Promo", stats: "Statistiky", products: "Produkty",
  embed: "HTML/Embed", freeform: "Volné plátno",
};

const TYPE_ORDER = [
  "freeform",
  "hero", "about", "services", "pricing", "gallery", "testimonials",
  "team", "stats", "cta", "promo", "faq", "blog-preview",
  "contact", "opening-hours", "map", "products", "embed",
];

export interface SectionLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string, variant: string) => void;
}

export function SectionLibraryModal({ open, onClose, onAdd }: SectionLibraryModalProps) {
  const [filter, setFilter] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => { if (open) { setFilter(""); setActiveType(null); } }, [open]);

  const groupedTypes = useMemo(() => {
    const set = new Set(SECTION_LIBRARY.map(e => e.type));
    return TYPE_ORDER.filter(t => set.has(t)).concat([...set].filter(t => !TYPE_ORDER.includes(t)));
  }, []);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return SECTION_LIBRARY.filter(e => {
      if (activeType && e.type !== activeType) return false;
      if (!f) return true;
      return e.label.toLowerCase().includes(f) || e.description.toLowerCase().includes(f) || e.variant.toLowerCase().includes(f);
    });
  }, [filter, activeType]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Přidat sekci"
      className="fixed inset-0 z-[100000] flex items-stretch justify-center p-0 sm:items-center sm:p-4 lg:p-6"
      style={{ fontFamily: "var(--vs-font-sans, Inter, sans-serif)" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(2,6,23,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
        onClick={onClose}
      />

      <div
        className="relative flex h-full w-full max-h-none max-w-[1180px] flex-col overflow-hidden rounded-none bg-white sm:max-h-[92vh] sm:rounded-2xl"
        style={{
          boxShadow: "0 36px 72px rgba(2,6,23,0.32), 0 18px 32px rgba(2,6,23,0.16), 0 0 0 1px rgba(2,6,23,0.05)",
          animation: "vs-libmodal-in 320ms cubic-bezier(0.18,0.89,0.32,1)",
        }}
      >
        <style>{`@keyframes vs-libmodal-in {
          from { transform: translateY(10px) scale(0.985); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }`}</style>

        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_8px_22px_rgba(99,102,241,0.32)]"
              style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
            >
              <Sparkles className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">Přidat sekci</h2>
              <p className="text-[11.5px] text-slate-500">
                {SECTION_LIBRARY.length} variant · vyber, klikni — sekce se vloží před patičku
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít (Esc)"
            title="Zavřít (Esc)"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </header>

        {/* Search + chips */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Hledat sekci podle názvu, popisu nebo varianty…"
              autoFocus
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={activeType === null} onClick={() => setActiveType(null)}>Vše ({SECTION_LIBRARY.length})</Chip>
            {groupedTypes.map(t => {
              const count = SECTION_LIBRARY.filter(e => e.type === t).length;
              return (
                <Chip key={t} active={activeType === t} onClick={() => setActiveType(t === activeType ? null : t)}>
                  {TYPE_LABEL[t] ?? SECTION_TYPE_LABELS[t] ?? t} · {count}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-5">
          {filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
              <p className="text-[13px] font-medium text-slate-700">Nic nenalezeno</p>
              <p className="mt-1 text-[11.5px] text-slate-500">Zkus jiné klíčové slovo nebo kategorii.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(item => (
                <button
                  key={`${item.type}-${item.variant}`}
                  type="button"
                  onClick={() => onAdd(item.type, item.variant)}
                  className="group relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_18px_44px_rgba(15,23,42,0.10)]"
                  title={item.description}
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                      {TYPE_LABEL[item.type] ?? SECTION_TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </span>
                  </div>
                  <div className="text-[13.5px] font-semibold leading-tight tracking-tight text-slate-900">
                    {item.label}
                  </div>
                  <div className="line-clamp-3 text-[11.5px] leading-relaxed text-slate-500">
                    {item.description}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    {item.variant}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 py-2.5 text-[11px] text-slate-500">
          <span>{filtered.length} variant{filtered.length === 1 ? "a" : filtered.length < 5 ? "y" : ""}</span>
          <span><kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> zavřít</span>
        </footer>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-medium transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
