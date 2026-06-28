"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, X, Monitor, Smartphone } from "lucide-react";
import type { ModalTemplate } from "@/components/onboarding/OnboardingModal";

const OnboardingModal = dynamic(
  () => import("@/components/onboarding/OnboardingModal").then((m) => ({ default: m.OnboardingModal })),
  { ssr: false },
);

// ── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({
  template,
  onClose,
  onStartFree,
}: {
  template: DesignTemplate;
  onClose: () => void;
  onStartFree: (t: DesignTemplate) => void;
}) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [loaded, setLoaded] = useState(false);
  // true only on actual mobile phones (narrow touch screens)
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const demoUrl = template.demoSlug ? `/demo/${template.demoSlug}` : null;

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 640px)");
    if (narrow.matches) { setIsMobileDevice(true); setView("mobile"); }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  useEffect(() => { setLoaded(false); }, [view]);

  // Mobile: fullscreen identical to onboarding preview
  if (isMobileDevice) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-white">
        {/* Top bar — same as onboarding */}
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#e5e5e5] bg-white px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#374151]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Zpět
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold text-[#0a0a0a]">{template.name}</div>
          </div>
          <button
            type="button"
            onClick={() => { onClose(); onStartFree(template); }}
            className="flex-shrink-0 rounded-full bg-[#6366f1] px-4 py-2 text-[12.5px] font-semibold text-white"
          >
            Použít →
          </button>
        </div>
        {/* Fullscreen iframe */}
        <div className="flex-1 overflow-hidden">
          {demoUrl ? (
            <iframe src={demoUrl} style={{ width: "100%", height: "100%", border: 0, display: "block" }} title={`Náhled ${template.name}`} />
          ) : (
            <div className="h-full overflow-y-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={template.preview} alt={template.name} className="w-full object-cover object-top" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop: full modal with toggle
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-[#111] px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-white">{template.name}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/60">{template.industry}</span>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white/8 p-1">
          <button onClick={() => setView("desktop")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${view === "desktop" ? "bg-white text-[#0a0a0a] shadow" : "text-white/60 hover:text-white"}`}>
            <Monitor size={13} /> Desktop
          </button>
          <button onClick={() => setView("mobile")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${view === "mobile" ? "bg-white text-[#0a0a0a] shadow" : "text-white/60 hover:text-white"}`}>
            <Smartphone size={13} /> Mobil
          </button>
        </div>
        <div className="flex items-center gap-3">
          {demoUrl && (
            <button onClick={() => { onClose(); onStartFree(template); }} className="inline-flex items-center gap-1.5 rounded-full bg-[#6366f1] px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#4f46e5]">
              Začít zdarma <ArrowRight size={12} />
            </button>
          )}
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4 lg:p-8">
        {demoUrl ? (
          view === "desktop" ? (
            <div className="flex h-full max-h-[720px] w-full max-w-[1200px] flex-col overflow-hidden rounded-xl shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
              <div className="flex flex-shrink-0 items-center gap-2 bg-[#2a2a2a] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="mx-auto flex h-6 w-full max-w-[400px] items-center justify-center rounded-md bg-[#1a1a1a] px-3">
                  <span className="truncate text-[11px] text-white/40">webero.co/{template.slug}</span>
                </div>
              </div>
              <div className="relative flex-1 bg-white">
                {!loaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#fafafa]">
                    <svg className="animate-spin text-[#6366f1]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <iframe src={demoUrl} className="h-full w-full border-0" onLoad={() => setLoaded(true)} title={`Náhled ${template.name}`} />
              </div>
            </div>
          ) : (
            <div className="relative flex-shrink-0 overflow-hidden rounded-[38px] bg-[#1a1a1a] shadow-[0_32px_80px_rgba(0,0,0,0.8)]" style={{ width: 256, height: 512, border: "8px solid #2a2a2a" }}>
              <div className="absolute left-1/2 top-0 z-10 h-5 w-20 -translate-x-1/2 rounded-b-2xl bg-[#1a1a1a]" />
              <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 pt-1 text-[9px] font-semibold text-white/70">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <svg width="11" height="7" viewBox="0 0 17 12" fill="currentColor"><rect x="0" y="4" width="3" height="8" rx="1" opacity="0.4"/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1" opacity="0.6"/><rect x="9" y="0.5" width="3" height="11.5" rx="1" opacity="0.8"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
                  <svg width="13" height="7" viewBox="0 0 24 12" fill="currentColor"><rect x="0" y="0" width="20" height="12" rx="3" opacity="0.3"/><rect x="1" y="1" width="14" height="10" rx="2"/><path d="M21 4v4a2 2 0 000-4z" opacity="0.4"/></svg>
                </div>
              </div>
              {!loaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#fafafa]">
                  <svg className="animate-spin text-[#6366f1]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              <iframe src={demoUrl} style={{ width: 390, height: 806, transform: `scale(${240 / 390})`, transformOrigin: "top left", border: 0 }} onLoad={() => setLoaded(true)} title={`Mobilní náhled ${template.name}`} />
              <div className="absolute bottom-1.5 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-white/30" />
            </div>
          )
        ) : (
          <div className="flex h-full max-h-[700px] w-full max-w-[900px] flex-col items-center justify-center overflow-hidden rounded-xl bg-[#1a1a1a] shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={template.preview} alt={template.name} className="max-h-full w-full object-contain object-top" />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex flex-shrink-0 items-center justify-center gap-3 border-t border-white/10 bg-[#111] px-5 py-4">
        <Link href={`/ukazka-sablon/${template.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:border-white/40 hover:bg-white/5">
          Celý náhled
        </Link>
        <button onClick={() => { onClose(); onStartFree(template); }} className="inline-flex items-center gap-2 rounded-full bg-[#6366f1] px-6 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#4f46e5]">
          Začít zdarma s touto šablonou <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Design Card ───────────────────────────────────────────────────────────────

function DesignCard({ t, onPreview, onStartFree }: { t: DesignTemplate; onPreview: (t: DesignTemplate) => void; onStartFree: (t: DesignTemplate) => void }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scrollPx, setScrollPx] = useState(0);
  const [duration, setDuration] = useState(2400);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    function recompute() {
      const wrap = wrapRef.current;
      const img = imgRef.current;
      if (!wrap || !img) return;
      const wW = wrap.clientWidth;
      const wH = wrap.clientHeight;
      const nW = img.naturalWidth;
      const nH = img.naturalHeight;
      if (!wW || !wH || !nW || !nH) return;
      const renderedH = (nH / nW) * wW;
      const dist = Math.max(0, renderedH - wH);
      setScrollPx(dist);
      const speed = 280;
      setDuration(Math.max(2400, Math.min(5000, Math.round((dist / speed) * 1000))));
    }
    if (imgRef.current?.complete) recompute();
    else imgRef.current?.addEventListener("load", recompute, { once: true });
    const ro = new ResizeObserver(recompute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  function startScroll() {
    const el = imgRef.current;
    if (!el || scrollPx <= 0) return;
    el.style.transitionDuration = `${duration}ms`;
    el.style.transitionTimingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";
    el.style.transform = `translateY(-${scrollPx}px)`;
  }
  function resetScroll() {
    const el = imgRef.current;
    if (!el) return;
    el.style.transitionDuration = "900ms";
    el.style.transitionTimingFunction = "cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "translateY(0)";
  }

  return (
    <div className="block">
      <div
        ref={wrapRef}
        onMouseEnter={() => { setHovered(true); startScroll(); }}
        onMouseLeave={() => { setHovered(false); resetScroll(); }}
        onClick={() => router.push(`/ukazka-sablon/${t.slug}`)}
        className="relative aspect-[391/333] w-full cursor-pointer overflow-hidden rounded-lg bg-[#fafafa] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300"
        style={{ boxShadow: hovered ? "0 40px 80px -25px rgba(0,0,0,0.25)" : undefined }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={t.preview}
          alt={t.name}
          className="absolute left-0 top-0 block w-full will-change-transform"
          style={{
            height: "auto",
            minHeight: "100%",
            objectFit: "cover",
            objectPosition: "top",
            transform: "translateY(0)",
            transitionProperty: "transform",
            transitionDuration: `${duration}ms`,
          }}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-[#0a0a0a]/80 via-[#0a0a0a]/0 to-[#0a0a0a]/0 transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <div className="pointer-events-auto flex w-full items-center justify-center gap-2 p-4 sm:p-5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPreview(t); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[12.5px] font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:px-5"
            >
              <Monitor size={12} /> Náhled
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onStartFree(t); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-[#0a0a0a] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] transition hover:bg-white/95 sm:px-5"
            >
              Začít zdarma
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
      <Link href={`/ukazka-sablon/${t.slug}`} className="mt-6 block">
        <div className="text-[22px] font-bold tracking-[-0.015em] transition" style={{ color: hovered ? "#374151" : "#0a0a0a" }}>{t.name}</div>
        <div className="mt-1.5 text-[15px] text-[#6b7280]">{t.industry}</div>
      </Link>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DesignTemplate {
  slug: string;
  name: string;
  industry: string;
  preview: string;
  demoSlug: string | null;
}

interface Category {
  label: string;
  prefixes: string[];
}

interface Props {
  templates: DesignTemplate[];
  categories: Category[];
}

function matchesCategory(t: DesignTemplate, cat: Category) {
  if (cat.prefixes.length === 0) return true;
  return cat.prefixes.some((p) => t.slug === p || t.slug.startsWith(`${p}-`) || t.slug.startsWith(`${p}0`));
}

// ── Main Gallery ──────────────────────────────────────────────────────────────

export function DesignGallery({ templates, categories }: Props) {
  const [active, setActive] = useState<string>("Vše");
  const [query, setQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<DesignTemplate | null>(null);
  const [onboardingTemplate, setOnboardingTemplate] = useState<ModalTemplate | null>(null);

  function handleStartFree(t: DesignTemplate) {
    setOnboardingTemplate({
      key: t.slug,
      name: t.name,
      industry: t.industry,
      previewImage: t.preview,
      demoUrl: t.demoSlug ? `/demo/${t.demoSlug}` : undefined,
    });
  }

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of categories) {
      map[c.label] = templates.filter((t) => matchesCategory(t, c)).length;
    }
    return map;
  }, [templates, categories]);

  const filtered = useMemo(() => {
    const cat = categories.find((c) => c.label === active) || categories[0];
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (!matchesCategory(t, cat)) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.industry.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
    });
  }, [templates, categories, active, query]);

  return (
    <>
      {/* Onboarding modal — opens directly with pre-selected template */}
      {onboardingTemplate && (
        <OnboardingModal
          initialTemplate={onboardingTemplate.key}
          templateName={onboardingTemplate.name}
          onClose={() => setOnboardingTemplate(null)}
        />
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} onStartFree={handleStartFree} />
      )}

      {/* Sticky filter bar */}
      <div className="sticky top-[64px] z-30 -mx-6 mb-10 border-y border-[#ececec] bg-white/95 px-6 py-4 backdrop-blur-md lg:top-[72px] lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const isActive = c.label === active;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setActive(c.label)}
                  className={
                    isActive
                      ? "inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-4 py-2 text-[12.5px] font-semibold text-white"
                      : "inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-4 py-2 text-[12.5px] font-medium text-[#374151] transition hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
                  }
                >
                  {c.label}
                  <span
                    className={
                      isActive
                        ? "rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold"
                        : "rounded-full bg-[#f3f4f6] px-1.5 py-0.5 text-[10px] font-bold text-[#888]"
                    }
                  >
                    {counts[c.label] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-[280px]">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat obor nebo koncept…"
              className="w-full rounded-full border border-[#e5e5e5] bg-white py-2.5 pl-9 pr-4 text-[13px] text-[#0a0a0a] placeholder:text-[#9ca3af] focus:border-[#0a0a0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="mb-8 text-[13px] text-[#6b7280]">
        Zobrazeno <span className="font-semibold text-[#0a0a0a]">{filtered.length}</span> z {templates.length} designů
        {active !== "Vše" && <> v kategorii <span className="font-semibold text-[#0a0a0a]">{active}</span></>}
        {query && <> · hledání „<span className="font-semibold text-[#0a0a0a]">{query}</span>"</>}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e5] bg-[#fafafa] py-20 text-center">
          <p className="text-[15px] text-[#666]">V této kategorii nic není.</p>
          <button onClick={() => { setActive("Vše"); setQuery(""); }} className="mt-3 text-[13px] font-semibold text-[#6366f1] hover:underline">
            Zobrazit všechny designy →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-10">
          {filtered.map((t) => (
            <DesignCard key={t.slug} t={t} onPreview={setPreviewTemplate} onStartFree={handleStartFree} />
          ))}
        </div>
      )}
    </>
  );
}
