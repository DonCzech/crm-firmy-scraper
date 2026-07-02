"use client";

/**
 * Wix-style "+ Přidat" overlay — single component that owns the floating
 * button, the 3-card popover (Prvky / Sekce / Stránky) and three full
 * panels (Elements, Sections, Pages).
 *
 * Mounted once by StudioShell. Self-contained state; the only outside
 * dependency is `state.addSection(type, variant, insertAtIndex?)`.
 *
 * Visual language follows Wix 1:1 (white surfaces, soft shadows, rounded
 * 16-px cards) on purpose — this is the bar the user explicitly asked
 * for. The host editor remains dark; the panel is a luminous "Add"
 * surface dropped over it (same trick Wix uses).
 *
 * Thumbnails: real Playwright snapshots arrive in the next session. Until
 * then a `VariantPreview` reads the variant's style tags and renders a
 * faithful CSS mock — dark slider, cream split, video bg, etc. — so the
 * grid still feels editorial, not placeholder-grey.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Search, Upload, Sparkles, Image as ImageIcon, FileText, ArrowRight, Layers, Type, MousePointer2, Minus, Square, Shapes } from "lucide-react";
import clsx from "clsx";
import type { StudioState } from "../TenantStudioView";
import {
  LIBRARY_CATEGORIES, PAGE_CATEGORIES, BUILT_IN_PAGES, buildRichLibrary, groupByCategory,
  type CategoryId, type SectionLibraryEntryRich, type StyleTag, type BuiltInPage,
} from "@/sections/categories";
import { setWixAdd, useWixAdd, useWixAddOptions, type WixAddView } from "./wix-add-state";

type Tab = "elements" | "sections" | "pages";

export function WixAddOverlay({ state }: { state: StudioState }) {
  const view = useWixAdd();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (view === "closed") return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setWixAdd(view === "popover" ? "closed" : "popover");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  if (!mounted || view === "closed") return null;

  const tab: Tab | null =
    view === "elements" || view === "sections" || view === "pages" ? view : null;

  return createPortal(
    <>
      {view === "popover" && (
        <ThreeCardPopover
          onPick={(t) => setWixAdd(t)}
          onClose={() => setWixAdd("closed")}
        />
      )}
      {tab && (
        <PanelModal
          tab={tab}
          state={state}
          onSwitch={(t) => setWixAdd(t)}
          onClose={() => setWixAdd("closed")}
        />
      )}
    </>,
    document.body,
  );
}

/* ── 3-card popover (Wix 1:1) ──────────────────────────────────────────── */

function ThreeCardPopover({
  onPick, onClose,
}: { onPick: (t: Tab) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Anchor to the +Add button so we follow its position whether it lives
  // in SecondaryActionBar, the top bar, or elsewhere.
  const [pos, setPos] = useState<{ left: number; top: number }>(() => ({ left: 80, top: 100 }));

  useEffect(() => {
    function place() {
      const anchor = document.querySelector<HTMLElement>('[data-tour-id="wix-add-button"]');
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      setPos({ left: r.left, top: r.bottom + 8 });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return;
      const t = e.target as HTMLElement;
      if (t.closest('[data-tour-id="wix-add-button"]')) return;
      onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const cards: Array<{ id: Tab; label: string; preview: React.ReactNode }> = [
    { id: "elements", label: "Prvky",   preview: <PreviewElements /> },
    { id: "sections", label: "Sekce",   preview: <PreviewSections /> },
    { id: "pages",    label: "Stránky", preview: <PreviewPages /> },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[10001] flex flex-col gap-2"
      style={{ left: pos.left, top: pos.top }}
    >
      {cards.map((c, i) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onPick(c.id)}
          className={clsx(
            "group flex items-center gap-3 rounded-xl bg-white pl-2 pr-5 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.32)]",
            "hover:shadow-[0_14px_40px_rgba(0,0,0,0.38)] hover:-translate-y-px transition-all duration-150",
            "w-[212px] text-left ring-1 ring-black/5",
          )}
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="h-[42px] w-[60px] shrink-0 rounded-lg overflow-hidden ring-1 ring-[#e5e7eb] bg-[#f9fafb] flex items-center justify-center">
            {c.preview}
          </div>
          <span className="text-[14px] font-semibold text-[#111827]">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

function PreviewElements() {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
      <rect x="2" y="3" width="14" height="6" rx="1.5" fill="#a78bfa" />
      <rect x="2" y="12" width="20" height="3" rx="1" fill="#cbd5e1" />
      <rect x="2" y="18" width="16" height="3" rx="1" fill="#cbd5e1" />
      <rect x="24" y="3" width="14" height="22" rx="2" fill="#fde68a" />
    </svg>
  );
}
function PreviewSections() {
  return (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
      <rect x="2" y="2" width="44" height="8" rx="1.5" fill="#1f2937" />
      <rect x="2" y="12" width="20" height="14" rx="1.5" fill="#e5e7eb" />
      <rect x="24" y="12" width="22" height="14" rx="1.5" fill="#fca5a5" />
    </svg>
  );
}
function PreviewPages() {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
      <rect x="2" y="2" width="22" height="24" rx="1.5" fill="#e5e7eb" />
      <rect x="16" y="6" width="22" height="20" rx="1.5" fill="#fde68a" stroke="#fff" strokeWidth="1" />
      <rect x="30" y="9" width="6" height="2" rx="0.5" fill="#92400e" />
    </svg>
  );
}

/* ── Big panel modal (shared shell) ────────────────────────────────────── */

function PanelModal({
  tab, state, onSwitch, onClose,
}: {
  tab: Tab;
  state: StudioState;
  onSwitch: (t: Tab) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal
      aria-label={tab === "elements" ? "Přidat prvek" : tab === "sections" ? "Přidat sekci" : "Přidat stránku"}
      className="fixed inset-0 z-[10002] flex items-stretch p-0"
    >
      <div className="absolute inset-0" style={{ background: "rgba(8,10,14,0.55)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <div
        className="relative ml-[55px] my-[14px] flex w-[1080px] max-w-[calc(100vw-90px)] max-h-[calc(100vh-28px)] flex-col rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ marginTop: 70 }}
      >
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-[#f1f5f9] px-6 py-4">
          <div className="flex items-center gap-2">
            {(["elements", "sections", "pages"] as Tab[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onSwitch(t)}
                className={clsx(
                  "rounded-lg px-3.5 py-1.5 text-[15px] font-semibold transition-colors",
                  tab === t
                    ? "bg-[#111827] text-white"
                    : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]",
                )}
              >
                {t === "elements" ? "Prvky" : t === "sections" ? "Sekce" : "Stránky"}
              </button>
            ))}
            <ReplaceModeBadge />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3f3f46] hover:text-[#18181b]"
            >
              <Sparkles size={14} strokeWidth={2} />
              Vygenerovat AI
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zavřít"
              className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {tab === "elements" && <ElementsPanel state={state} onClose={onClose} />}
          {tab === "sections" && <SectionsPanel state={state} onClose={onClose} />}
          {tab === "pages"    && <PagesPanel    state={state} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

function ReplaceModeBadge() {
  const opts = useWixAddOptions();
  if (typeof opts.replaceSectionId !== "number") return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-1 text-[11px] font-semibold text-[#92400e]">
      Změnit rozložení sekce
    </span>
  );
}

/* ── Sections panel (the main attraction) ──────────────────────────────── */

function SectionsPanel({ state, onClose }: { state: StudioState; onClose: () => void }) {
  const opts = useWixAddOptions();
  const replaceMode = typeof opts.replaceSectionId === "number";
  const lib = useMemo(() => buildRichLibrary(), []);
  const grouped = useMemo(() => groupByCategory(lib), [lib]);

  // In replace mode, lock the category to the matching type's home category
  // so the user can only browse compatible variants. We resolve the
  // section's type → CategoryId by scanning LIBRARY_CATEGORIES.
  const initialCat: CategoryId = useMemo(() => {
    if (!opts.filterType) return "welcome";
    const found = LIBRARY_CATEGORIES.find(c => c.sectionTypes.includes(opts.filterType!));
    return found?.id ?? "welcome";
  }, [opts.filterType]);

  const [cat, setCat] = useState<CategoryId>(initialCat);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<StyleTag | null>(null);

  const tenantIndustry = (state.tenant as { industry?: string }).industry || "*";

  const list = useMemo(() => {
    let items = grouped[cat] ?? [];
    if (opts.filterType) items = items.filter(e => e.type === opts.filterType);
    if (tag) items = items.filter(e => e.tags.includes(tag));
    const f = q.trim().toLowerCase();
    if (f) items = items.filter(e =>
      e.displayName.toLowerCase().includes(f) ||
      e.description.toLowerCase().includes(f) ||
      e.family.toLowerCase().includes(f),
    );
    return [...items].sort((a, b) => {
      const aRel = a.industries.includes(tenantIndustry) ? 0 : a.industries.includes("*") ? 1 : 2;
      const bRel = b.industries.includes(tenantIndustry) ? 0 : b.industries.includes("*") ? 1 : 2;
      return aRel - bRel;
    });
  }, [grouped, cat, q, tag, tenantIndustry, opts.filterType]);

  // Tag chips available in current category
  const tagsAvailable = useMemo(() => {
    const set = new Set<StyleTag>();
    for (const e of grouped[cat] ?? []) for (const t of e.tags) set.add(t);
    return [...set];
  }, [grouped, cat]);

  async function add(entry: SectionLibraryEntryRich) {
    if (replaceMode && opts.replaceSectionId) {
      // Swap variant in-place — preserves id, layout, content overrides
      try {
        const res = await fetch(`/api/demo/${state.tenant.slug}/sections/${opts.replaceSectionId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ section_variant: entry.variant }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        // Reload to pick up the new variant render. Full page reload because
        // the rendered section components are dynamic imports keyed by
        // variant, and live swapping would need a Section state refresh.
        onClose();
        window.location.reload();
      } catch (e) {
        console.error("replace variant failed", e);
      }
      return;
    }
    await state.addSection(entry.type, entry.variant);
    onClose();
  }

  return (
    <>
      {/* Left sidebar — categories */}
      <aside className="w-[230px] shrink-0 border-r border-[#f1f5f9] bg-[#fafbfc] overflow-y-auto">
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={async () => { await state.addSection("freeform", "default"); onClose(); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-semibold text-[#3f3f46] hover:bg-[#f4f4f5]"
          >
            <Plus size={15} strokeWidth={2.25} />
            Prázdná sekce
          </button>
        </div>
        <nav className="px-2 pb-4">
          {LIBRARY_CATEGORIES.map(c => {
            const count = grouped[c.id]?.length ?? 0;
            if (count === 0) return null;
            const active = c.id === cat;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCat(c.id); setTag(null); }}
                className={clsx(
                  "flex w-full items-center justify-between rounded-lg px-3 py-[7px] text-left text-[14px] transition-colors",
                  active ? "bg-[#111827] text-white" : "text-[#334155] hover:bg-[#f1f5f9]",
                )}
              >
                <span className="font-medium">{c.label}</span>
                <span className={clsx("text-[11px]", active ? "text-white/60" : "text-[#94a3b8]")}>{count}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Right side — search + tag chips + grid */}
      <section className="flex flex-1 min-w-0 flex-col">
        <div className="flex items-center gap-3 border-b border-[#f1f5f9] px-6 py-3">
          <div className="relative flex-1 max-w-[420px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Hledat sekce…"
              className="w-full rounded-lg border border-[#e2e8f0] bg-white pl-9 pr-3 py-2 text-[13.5px] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#3f3f46] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {tagsAvailable.slice(0, 8).map(t => {
              const on = tag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(on ? null : t)}
                  className={clsx(
                    "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors whitespace-nowrap",
                    on
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#cbd5e1]",
                  )}
                >
                  {TAG_LABELS[t] ?? t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {list.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {list.map(entry => (
                <VariantCard key={`${entry.type}-${entry.variant}`} entry={entry} onClick={() => void add(entry)} />
              ))}
            </div>
          )}
          <div className="h-6" />
        </div>
      </section>
    </>
  );
}

const TAG_LABELS: Record<string, string> = {
  light: "Světlé", dark: "Tmavé", cream: "Krémové",
  split: "Split", centered: "Centrované", fullbleed: "Fullbleed",
  slider: "Slider", video: "Video", image: "Obrázek",
  minimal: "Minimal", luxury: "Luxus",
};

function VariantCard({
  entry, onClick,
}: { entry: SectionLibraryEntryRich; onClick: () => void }) {
  // Try real Playwright-generated thumbnail first; fall back to CSS mock
  // if the file doesn't exist yet (generator hasn't been run for this
  // variant). Both layers occupy the same box so loading is jank-free.
  const [imgFailed, setImgFailed] = useState(false);
  const thumbUrl = `/section-thumbs/${entry.type}/${entry.variant}.webp`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col text-left rounded-xl border border-[#e5e7eb] bg-white overflow-hidden hover:border-[#3f3f46] hover:shadow-[0_10px_30px_rgba(63,63,70,0.15)] transition-all duration-150"
    >
      <div className="aspect-[16/10] w-full overflow-hidden">
        {imgFailed ? (
          <VariantPreview entry={entry} />
        ) : (
          <img
            src={thumbUrl}
            alt={entry.displayName}
            loading="lazy"
            className="h-full w-full object-cover object-top"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <div className="px-3 py-2.5 border-t border-[#f1f5f9]">
        <p className="text-[13px] font-semibold text-[#0f172a] truncate">{entry.displayName}</p>
        <p className="mt-0.5 text-[11px] text-[#64748b] truncate">
          {entry.family !== "generic" ? entry.family : entry.industries.filter(i => i !== "*").join(", ") || "univerzální"}
        </p>
      </div>
    </button>
  );
}

/* CSS mock thumbnail — reads tags + family + type and draws a plausible
   layout. Better than gradient placeholder until real screenshots ship. */
function VariantPreview({ entry }: { entry: SectionLibraryEntryRich }) {
  const dark    = entry.tags.includes("dark");
  const cream   = entry.tags.includes("cream");
  const slider  = entry.tags.includes("slider");
  const video   = entry.tags.includes("video");
  const split   = entry.tags.includes("split") || /split|2-col|two-col/.test(entry.variant);
  const center  = entry.tags.includes("centered");

  const bg = dark ? "#0f172a" : cream ? "#f6efe9" : "#f8fafc";
  const fg = dark ? "#ffffff" : "#0f172a";
  const accent = dark ? "#d4a96e" : "#2563eb";

  // Hero / fullbleed
  if (entry.type === "hero") {
    return (
      <div className="relative h-full w-full" style={{ background: bg }}>
        {/* fake image / video bg */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: video
              ? `linear-gradient(135deg, #1f2937, #0f172a)`
              : dark
                ? `linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 100%), radial-gradient(circle at 30% 40%, #334155, #0f172a)`
                : `linear-gradient(135deg, #fce7f3, #e0e7ff)`,
          }}
        />
        {slider && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="block h-1 w-3 rounded-full" style={{ background: i === 0 ? accent : "rgba(255,255,255,0.5)" }} />
            ))}
          </div>
        )}
        <div className={clsx("absolute inset-0 flex flex-col gap-1.5 p-4", center ? "items-center justify-center text-center" : split ? "items-start justify-center" : "items-start justify-end")}>
          <span className="block h-[6px] w-[42%] rounded" style={{ background: fg, opacity: 0.92 }} />
          <span className="block h-[4px] w-[58%] rounded" style={{ background: fg, opacity: 0.78 }} />
          <span className="mt-1 inline-block h-[10px] w-[60px] rounded-full" style={{ background: accent }} />
        </div>
        {split && (
          <div aria-hidden className="absolute right-0 top-0 bottom-0 w-[44%]" style={{ background: dark ? "#1f2937" : "#fde68a" }} />
        )}
      </div>
    );
  }

  // Pricing, Services, Gallery, Team — grid card mocks
  if (entry.type === "gallery") {
    return (
      <div className="grid h-full w-full grid-cols-3 gap-1 p-2" style={{ background: bg }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded" style={{ background: i % 2 === 0 ? "#cbd5e1" : "#fbcfe8" }} />
        ))}
      </div>
    );
  }
  if (entry.type === "pricing" || entry.type === "services") {
    return (
      <div className="flex h-full w-full items-stretch gap-2 p-3" style={{ background: bg }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex flex-1 flex-col gap-1.5 rounded-lg p-2" style={{ background: dark ? "#1e293b" : "white", boxShadow: dark ? "none" : "0 1px 2px rgba(0,0,0,0.04)" }}>
            <span className="block h-[5px] w-[60%] rounded" style={{ background: fg, opacity: 0.85 }} />
            <span className="block h-[3px] w-[80%] rounded" style={{ background: fg, opacity: 0.4 }} />
            <span className="block h-[3px] w-[70%] rounded" style={{ background: fg, opacity: 0.4 }} />
            <span className="mt-auto inline-block h-[8px] w-[60%] rounded-full" style={{ background: accent }} />
          </div>
        ))}
      </div>
    );
  }
  if (entry.type === "testimonials") {
    return (
      <div className="flex h-full w-full items-center gap-2 p-3" style={{ background: bg }}>
        {[0, 1].map(i => (
          <div key={i} className="flex flex-1 flex-col gap-1 rounded-lg p-2" style={{ background: dark ? "#1e293b" : "white" }}>
            <span className="text-[14px] font-serif" style={{ color: accent }}>"</span>
            <span className="block h-[3px] w-full rounded" style={{ background: fg, opacity: 0.35 }} />
            <span className="block h-[3px] w-[80%] rounded" style={{ background: fg, opacity: 0.35 }} />
            <div className="mt-1 flex items-center gap-1.5">
              <span className="block h-3 w-3 rounded-full" style={{ background: "#cbd5e1" }} />
              <span className="block h-[3px] w-[40%] rounded" style={{ background: fg, opacity: 0.55 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (entry.type === "team") {
    return (
      <div className="grid h-full w-full grid-cols-3 gap-2 p-3" style={{ background: bg }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex flex-col gap-1">
            <div className="aspect-square rounded-lg" style={{ background: "#cbd5e1" }} />
            <span className="block h-[3px] w-[80%] rounded" style={{ background: fg, opacity: 0.55 }} />
          </div>
        ))}
      </div>
    );
  }
  if (entry.type === "stats") {
    return (
      <div className="grid h-full w-full grid-cols-4 gap-2 p-3" style={{ background: bg }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-1 justify-center">
            <span className="block h-[10px] w-[28px] rounded" style={{ background: accent }} />
            <span className="block h-[3px] w-[60%] rounded" style={{ background: fg, opacity: 0.45 }} />
          </div>
        ))}
      </div>
    );
  }
  if (entry.type === "faq") {
    return (
      <div className="flex h-full w-full flex-col gap-1.5 p-3" style={{ background: bg }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center justify-between rounded-md px-2 py-1.5" style={{ background: dark ? "#1e293b" : "white" }}>
            <span className="block h-[3px] w-[60%] rounded" style={{ background: fg, opacity: 0.6 }} />
            <span className="text-[10px]" style={{ color: fg, opacity: 0.5 }}>+</span>
          </div>
        ))}
      </div>
    );
  }
  if (entry.type === "cta" || entry.type === "rezora-cta" || entry.type === "promo") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4" style={{ background: bg }}>
        <span className="block h-[5px] w-[55%] rounded" style={{ background: fg, opacity: 0.85 }} />
        <span className="block h-[3px] w-[70%] rounded" style={{ background: fg, opacity: 0.5 }} />
        <span className="mt-1 inline-block h-[12px] w-[80px] rounded-full" style={{ background: accent }} />
      </div>
    );
  }
  if (entry.type === "contact" || entry.type === "map" || entry.type === "opening-hours") {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-2 p-3" style={{ background: bg }}>
        <div className="flex flex-col gap-1.5 rounded-md p-2" style={{ background: dark ? "#1e293b" : "white" }}>
          <span className="block h-[6px] w-[2px] rounded" style={{ background: fg, opacity: 0.5 }} />
          <span className="block h-[6px] w-full rounded" style={{ background: "#e2e8f0" }} />
          <span className="block h-[6px] w-full rounded" style={{ background: "#e2e8f0" }} />
          <span className="mt-auto inline-block h-[10px] w-[50%] rounded-full" style={{ background: accent }} />
        </div>
        <div className="rounded-md" style={{ background: "linear-gradient(135deg, #a7f3d0, #93c5fd)" }} />
      </div>
    );
  }
  if (entry.type === "about") {
    return (
      <div className={clsx("flex h-full w-full p-3 gap-3", split ? "" : "flex-col")} style={{ background: bg }}>
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="block h-[5px] w-[40%] rounded" style={{ background: fg, opacity: 0.85 }} />
          <span className="block h-[3px] w-[90%] rounded" style={{ background: fg, opacity: 0.4 }} />
          <span className="block h-[3px] w-[78%] rounded" style={{ background: fg, opacity: 0.4 }} />
          <span className="block h-[3px] w-[60%] rounded" style={{ background: fg, opacity: 0.4 }} />
        </div>
        <div className={clsx("rounded-lg", split ? "w-[44%]" : "h-[40%]")} style={{ background: "#cbd5e1" }} />
      </div>
    );
  }
  // generic fallback
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: bg, color: fg }}>
      <span className="text-[11px] opacity-60">{entry.type}</span>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex h-[300px] items-center justify-center text-[13px] text-[#94a3b8]">
      Žádné sekce v této kategorii neodpovídají filtru.
    </div>
  );
}

/* ── Elements panel (scaffold matching Wix Add Elements layout) ────────── */

type ElementCategory = "all" | "text" | "button" | "image" | "shape" | "stock";

interface ElementSpec {
  id: string;
  label: string;
  category: Exclude<ElementCategory, "all">;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  preview: React.ReactNode;
  /** Overlay element to push into the freeform layer (next session: wire). */
  freeform: { type: "heading" | "text" | "button" | "image" | "divider" | "shape" | "icon"; props?: Record<string, unknown> };
}

// Curated free stock illustrations from undraw.co (MIT-license, no attribution).
// These URLs are stable CDN paths.
const STOCK_ILLUSTRATIONS = [
  { id: "team",     label: "Tým",         url: "https://undraw.co/api/illustrations/team-collaboration" },
  { id: "growth",   label: "Růst",        url: "https://undraw.co/api/illustrations/growth-analytics" },
  { id: "design",   label: "Design",      url: "https://undraw.co/api/illustrations/design-process" },
  { id: "happy",    label: "Spokojenost", url: "https://undraw.co/api/illustrations/happy-feeling" },
  { id: "support",  label: "Podpora",     url: "https://undraw.co/api/illustrations/customer-support" },
  { id: "deal",     label: "Dohoda",      url: "https://undraw.co/api/illustrations/business-deal" },
];

const ELEMENTS: ElementSpec[] = [
  { id: "heading", label: "Nadpis", category: "text", Icon: Type,
    preview: <span className="font-serif text-[28px] font-bold text-[#0f172a]">Heading</span>,
    freeform: { type: "heading", props: { text: "Váš nadpis", fontSize: 48 } } },
  { id: "paragraph", label: "Odstavec", category: "text", Icon: FileText,
    preview: <span className="text-[12px] text-[#475569] leading-tight">Krátký odstavec textu, lorem ipsum dolor sit amet.</span>,
    freeform: { type: "text", props: { text: "Krátký odstavec textu…", fontSize: 16 } } },
  { id: "quote", label: "Citace", category: "text", Icon: Type,
    preview: <span className="font-serif italic text-[16px] text-[#0f172a]">&ldquo;Vynikající.&rdquo;</span>,
    freeform: { type: "text", props: { text: "Citace zákazníka", fontStyle: "italic", fontSize: 22 } } },
  { id: "button-filled", label: "Tlačítko", category: "button", Icon: MousePointer2,
    preview: <span className="rounded-lg bg-[#0f172a] px-4 py-1.5 text-[12px] font-semibold text-white">Tlačítko</span>,
    freeform: { type: "button", props: { text: "Tlačítko", variant: "filled" } } },
  { id: "button-outline", label: "Outline tlačítko", category: "button", Icon: Square,
    preview: <span className="rounded-lg border-2 border-[#0f172a] px-4 py-1.5 text-[12px] font-semibold text-[#0f172a]">Tlačítko</span>,
    freeform: { type: "button", props: { text: "Tlačítko", variant: "outline" } } },
  { id: "button-pill", label: "Pill tlačítko", category: "button", Icon: MousePointer2,
    preview: <span className="rounded-full bg-[#6366f1] px-4 py-1.5 text-[12px] font-semibold text-white">Akce</span>,
    freeform: { type: "button", props: { text: "Akce", shape: "pill" } } },
  { id: "image", label: "Obrázek", category: "image", Icon: ImageIcon,
    preview: <div className="h-[34px] w-[44px] rounded bg-gradient-to-br from-[#fde68a] to-[#f472b6]" />,
    freeform: { type: "image", props: { src: "" } } },
  { id: "divider", label: "Oddělovač", category: "shape", Icon: Minus,
    preview: <div className="h-[2px] w-[44px] bg-[#0f172a]" />,
    freeform: { type: "divider" } },
  { id: "shape-square", label: "Čtverec", category: "shape", Icon: Square,
    preview: <div className="h-[28px] w-[28px] rounded bg-[#0f172a]" />,
    freeform: { type: "shape", props: { shape: "square", color: "#0f172a" } } },
  { id: "shape-circle", label: "Kruh", category: "shape", Icon: Shapes,
    preview: <div className="h-[28px] w-[28px] rounded-full bg-[#6366f1]" />,
    freeform: { type: "shape", props: { shape: "circle", color: "#3b82f6" } } },
];

function ElementsPanel({ state, onClose }: { state: StudioState; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ElementCategory>("all");

  const filtered = useMemo(() => {
    let list = ELEMENTS;
    if (cat !== "all" && cat !== "stock") list = list.filter(e => e.category === cat);
    const f = q.trim().toLowerCase();
    if (f) list = list.filter(e => e.label.toLowerCase().includes(f));
    return list;
  }, [q, cat]);

  // For now elements are persisted as freeform sections — we push a fresh
  // freeform section onto the page (overlay editing in next session).
  async function addElement(spec: ElementSpec) {
    await state.addSection("freeform", "default");
    // The freeform section auto-mounts an empty canvas. Wiring the element
    // factory to seed an initial element type is a follow-up — for now the
    // user gets a blank freeform canvas to drop the element manually.
    void spec; // ack
    onClose();
  }

  const sidebar: Array<{ id: ElementCategory; label: string; Icon: typeof Layers }> = [
    { id: "all",    label: "Vše",       Icon: Layers },
    { id: "text",   label: "Text",      Icon: Type },
    { id: "button", label: "Tlačítka",  Icon: MousePointer2 },
    { id: "image",  label: "Obrázky",   Icon: ImageIcon },
    { id: "shape",  label: "Tvary",     Icon: Shapes },
    { id: "stock",  label: "Stock",     Icon: Sparkles },
  ];

  return (
    <>
      <aside className="w-[80px] shrink-0 border-r border-[#f1f5f9] bg-[#fafbfc] flex flex-col items-center gap-1 py-3">
        {sidebar.map(it => {
          const active = cat === it.id;
          return (
            <button
              key={it.id}
              type="button"
              title={it.label}
              onClick={() => setCat(it.id)}
              className={clsx(
                "flex h-14 w-[60px] flex-col items-center justify-center gap-1 rounded-lg text-[10.5px] font-medium transition-colors",
                active ? "bg-[#111827] text-white" : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]",
              )}
            >
              <it.Icon size={17} strokeWidth={1.6} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </aside>

      <section className="flex flex-1 min-w-0 flex-col">
        <div className="flex items-center gap-3 border-b border-[#f1f5f9] px-6 py-3">
          <div className="relative flex-1 max-w-[420px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Hledat prvky…"
              className="w-full rounded-lg border border-[#e2e8f0] bg-white pl-9 pr-3 py-2 text-[13.5px] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#3f3f46] focus:outline-none"
            />
          </div>
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#0f172a] hover:border-[#cbd5e1]">
            <Upload size={14} strokeWidth={2} />
            Nahrát soubor
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {cat !== "stock" && (
            <div className="grid grid-cols-3 gap-4">
              <BigTile label="Nahrát médium"        Icon={Upload}    accent="#a78bfa" />
              <BigTile label="Vygenerovat obrázek"  Icon={ImageIcon} accent="#f472b6" />
              <BigTile label="Vygenerovat prvek AI" Icon={Sparkles}  accent="#fbbf24" />
            </div>
          )}

          {cat !== "stock" && (
            <Section title="Prvky v duchu značky">
              <div className="grid grid-cols-4 gap-3">
                {filtered.map(spec => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => void addElement(spec)}
                    className="group flex aspect-[4/3] flex-col rounded-xl border border-[#e5e7eb] bg-white p-3 text-left hover:border-[#3f3f46] hover:shadow-[0_8px_24px_rgba(63,63,70,0.12)] transition-all"
                  >
                    <div className="flex flex-1 items-center justify-center">{spec.preview}</div>
                    <span className="text-[11.5px] font-semibold text-[#0f172a] truncate">{spec.label}</span>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {(cat === "all" || cat === "stock") && (
            <Section title="Stock ilustrace (zdarma, undraw.co)">
              <div className="grid grid-cols-3 gap-4">
                {STOCK_ILLUSTRATIONS.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => void state.addSection("gallery", "default").then(onClose)}
                    className="group flex flex-col rounded-xl border border-[#e5e7eb] bg-white overflow-hidden hover:border-[#3f3f46] hover:shadow-[0_8px_24px_rgba(63,63,70,0.12)] transition-all"
                  >
                    <div className="aspect-[16/10] bg-gradient-to-br from-[#fef3c7] via-[#fce7f3] to-[#dbeafe] flex items-center justify-center">
                      <Sparkles size={28} strokeWidth={1.4} className="text-[#475569]" />
                    </div>
                    <div className="px-3 py-2 border-t border-[#f1f5f9]">
                      <p className="text-[12.5px] font-semibold text-[#0f172a]">{s.label}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-[#94a3b8]">
                Plné napojení undraw.co API + drag-to-canvas — naplánováno do Sprintu 7. Tlačítka výše zatím vloží prázdnou galerii pro přidání obrázku.
              </p>
            </Section>
          )}
        </div>
      </section>
    </>
  );
}

function BigTile({ label, Icon, accent }: { label: string; Icon: typeof Upload; accent: string }) {
  return (
    <button type="button" className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-left hover:border-[#3f3f46] hover:bg-[#f4f4f5] transition-colors">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ background: accent }}>
        <Icon size={16} strokeWidth={2} />
      </span>
      <span className="text-[13px] font-semibold text-[#0f172a]">{label}</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#0f172a]">{title}</h3>
        <button type="button" className="flex items-center gap-1 text-[12px] font-semibold text-[#3f3f46] hover:text-[#18181b]">
          Zobrazit vše <ArrowRight size={12} strokeWidth={2.25} />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ── Pages panel (scaffold) ────────────────────────────────────────────── */

function PagesPanel({ state, onClose }: { state: StudioState; onClose: () => void }) {
  const [cat, setCat] = useState<string>("home");
  const [q, setQ] = useState("");
  const active = PAGE_CATEGORIES.find(c => c.id === cat)!;

  // Count pages per category so empty buckets are hidden
  const byCat = useMemo(() => {
    const out: Record<string, BuiltInPage[]> = {};
    for (const c of PAGE_CATEGORIES) out[c.id] = [];
    for (const p of BUILT_IN_PAGES) {
      if (out[p.category]) out[p.category].push(p);
    }
    return out;
  }, []);

  const filtered = useMemo(() => {
    const list = byCat[cat] ?? [];
    const f = q.trim().toLowerCase();
    if (!f) return list;
    return list.filter(p =>
      p.familyLabel.toLowerCase().includes(f) ||
      p.family.toLowerCase().includes(f) ||
      p.label.toLowerCase().includes(f) ||
      (p.industry ?? "").toLowerCase().includes(f),
    );
  }, [byCat, cat, q]);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Slugify Czech title for URL — strips diacritics, lower-cases, dashes only.
  function slugify(s: string): string {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  async function addWholePage(p: BuiltInPage) {
    // Create a brand-new page on the tenant — NOT inject sections into the
    // current page. The new page is wired into the navbar of every existing
    // page automatically. After creation we navigate to it so the user sees
    // what they just made.
    setErrMsg(null);
    setBusyId(p.id);
    const baseSlug = p.slug === "home" ? slugify(p.label) || "stranka" : p.slug;
    let slug = baseSlug;
    let suffix = 2;
    // Naive client-side de-dupe by trial: server returns 409 if dup, then we
    // append -2, -3, etc. Keeps the round-trip simple without an extra GET.
    try {
      while (true) {
        const res = await fetch(`/api/demo/${state.tenant.slug}/pages/from-template`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            slug,
            title: p.label,
            sections: p.sections,
            addToNav: true,
          }),
        });
        if (res.status === 409 && suffix < 20) {
          slug = `${baseSlug}-${suffix++}`;
          continue;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
        onClose();
        // Navigate to the freshly created page so the user lands on what
        // they just added. Full reload — studio state is page-scoped.
        window.location.href = `/demo/${state.tenant.slug}/admin/${encodeURIComponent(json.slug)}`;
        return;
      }
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Vytvoření stránky selhalo");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <aside className="w-[230px] shrink-0 border-r border-[#f1f5f9] bg-[#fafbfc] overflow-y-auto">
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={async () => { await state.addSection("hero", "default"); onClose(); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-semibold text-[#3f3f46] hover:bg-[#f4f4f5]"
          >
            <Plus size={15} strokeWidth={2.25} />
            Prázdná stránka
          </button>
        </div>
        <nav className="px-2 pb-4">
          {PAGE_CATEGORIES.map(c => {
            const count = byCat[c.id]?.length ?? 0;
            if (count === 0) return null;
            const isActive = c.id === cat;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={clsx(
                  "flex w-full items-center justify-between rounded-lg px-3 py-[7px] text-left text-[14px] transition-colors",
                  isActive ? "bg-[#111827] text-white" : "text-[#334155] hover:bg-[#f1f5f9]",
                )}
              >
                <span className="font-medium">{c.label}</span>
                <span className={clsx("text-[11px]", isActive ? "text-white/60" : "text-[#94a3b8]")}>{count}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="flex flex-1 min-w-0 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-[#f1f5f9] px-6 py-3">
          <div>
            <h3 className="text-[15px] font-semibold text-[#0f172a]">{active.label}</h3>
            <p className="mt-0.5 text-[12.5px] text-[#64748b]">{active.description}</p>
          </div>
          <div className="relative w-[260px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Hledat šablonu…"
              className="w-full rounded-lg border border-[#e2e8f0] bg-white pl-9 pr-3 py-2 text-[13.5px] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#3f3f46] focus:outline-none"
            />
          </div>
        </div>

        {errMsg && (
          <div className="border-b border-[#fecaca] bg-[#fef2f2] px-6 py-2 text-[12.5px] text-[#b91c1c]">
            {errMsg}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {filtered.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-[13px] text-[#94a3b8]">
              Žádná stránka v této kategorii neodpovídá hledání.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {filtered.map(p => (
                <PageCard
                  key={p.id}
                  page={p}
                  busy={busyId === p.id}
                  onClick={() => void addWholePage(p)}
                />
              ))}
            </div>
          )}
          <div className="h-6" />
          <p className="text-[11.5px] text-[#94a3b8]">
            Kliknutí vytvoří novou samostatnou stránku na vašem webu a automaticky ji přidá do hlavní navigace.
          </p>
        </div>
      </section>
    </>
  );
}

function PageCard({ page, onClick, busy }: { page: BuiltInPage; onClick: () => void; busy: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumbUrl = `/section-thumbs/${page.thumbHint.type}/${page.thumbHint.variant}.webp`;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={clsx(
        "group flex flex-col text-left rounded-xl border border-[#e5e7eb] bg-white overflow-hidden transition-all",
        busy ? "opacity-60 cursor-wait" : "hover:border-[#3f3f46] hover:shadow-[0_10px_30px_rgba(63,63,70,0.15)]",
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#f8fafc]">
        {imgFailed ? (
          <div className="flex h-full flex-col gap-1.5 p-4 bg-gradient-to-br from-[#f1f5f9] to-[#e0e7ff]">
            {page.sections.slice(0, 6).map((s, i) => (
              <div key={i} className="rounded bg-white/80 shadow-sm" style={{ height: `${[26, 12, 10, 16, 12, 10][i] || 8}%` }} />
            ))}
          </div>
        ) : (
          <img
            src={thumbUrl}
            alt={page.familyLabel}
            loading="lazy"
            className="h-full w-full object-cover object-top"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <div className="px-3 py-2.5 border-t border-[#f1f5f9]">
        <p className="text-[13px] font-semibold text-[#0f172a] truncate">{page.familyLabel}</p>
        <p className="mt-0.5 text-[11px] text-[#64748b] truncate">
          {page.label} · {page.sections.length} sekcí
          {page.industry && <> · {page.industry}</>}
        </p>
      </div>
    </button>
  );
}
