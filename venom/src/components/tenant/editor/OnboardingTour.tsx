"use client";

import { useEffect, useState } from "react";
import { Sparkles, X, ChevronRight, ChevronLeft, Check } from "lucide-react";

/**
 * Interactive first-run tour. Highlights five key surfaces in the editor and
 * AdminConsole with anchored tooltips. State persists in localStorage so a
 * tenant only sees it once; "Spustit znovu" entry in the dock more-menu can
 * re-trigger it later (not wired yet).
 */
export interface TourStep {
  /** CSS selector to anchor the tooltip on. Falls back to the centered hero
      card when the element isn't on screen (e.g. AdminConsole is closed). */
  selector: string;
  /** Optional fallback selector to try if primary not visible. */
  fallback?: string;
  title: string;
  body: string;
  cta?: string;
}

const STORAGE_KEY = "webero-tour-completed-v1";

const STEPS: TourStep[] = [
  {
    selector: "[data-tour='pageswitcher']",
    fallback: "[data-tour='dock']",
    title: "Stránky webu",
    body: "Tady přepínáš úvodní stránku a podstránky. Klikni na chevron a uvidíš všechny stránky tenantu.",
  },
  {
    selector: "[data-tour='builder']",
    title: "Builder",
    body: "Otevře boční panel s pořadím sekcí. Můžeš tu sekce přesouvat, mazat, přepínat varianty a přidávat nové.",
  },
  {
    selector: "[data-tour='administrace']",
    title: "Administrace",
    body: "Vše ostatní — stránky, vzhled, AI builder, blog, zprávy, SEO, doména, zálohy. Wix-class kontrolní centrum.",
  },
  {
    selector: "[data-tour='nahled']",
    title: "Veřejný náhled",
    body: "Otevře web v novém okně tak, jak ho uvidí návštěvníci. Bez admin overlay.",
  },
  {
    selector: "[data-tour='save']",
    title: "Auto-save",
    body: "Změny se ukládají automaticky. Klikni ⌘S nebo na tlačítko pro ruční uložení. Historie změn je v Administraci → Verze.",
  },
];

export function OnboardingTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  useEffect(() => { if (open) setStep(0); }, [open]);

  useEffect(() => {
    if (!open) return;
    const current = STEPS[step];
    function measure() {
      const el = (document.querySelector(current.selector) ??
        (current.fallback ? document.querySelector(current.fallback) : null)) as HTMLElement | null;
      setAnchor(el ? el.getBoundingClientRect() : null);
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step]);

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const pad = 8;
  const tipWidth = Math.min(320, typeof window !== "undefined" ? window.innerWidth - 24 : 320);
  // Position the tooltip below the anchor if there's room, otherwise above.
  let tipTop = 60, tipLeft = 12;
  let arrowDir: "up" | "down" | "none" = "none";
  if (anchor) {
    const below = anchor.bottom + pad + 12;
    const above = anchor.top - pad - 200;
    const vh = window.innerHeight;
    if (below + 200 < vh) {
      tipTop = below;
      arrowDir = "up";
    } else {
      tipTop = Math.max(12, above);
      arrowDir = "down";
    }
    tipLeft = Math.max(12, Math.min(window.innerWidth - tipWidth - 12, anchor.left + anchor.width / 2 - tipWidth / 2));
  } else {
    // Center fallback
    tipTop = (typeof window !== "undefined" ? window.innerHeight : 600) / 2 - 100;
    tipLeft = (typeof window !== "undefined" ? window.innerWidth : 360) / 2 - tipWidth / 2;
  }

  function complete() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100001]"
      style={{ fontFamily: "var(--vs-font-sans, Inter, sans-serif)" }}
      role="dialog"
      aria-modal
      aria-label="Onboarding"
    >
      {/* Backdrop with cut-out spotlight */}
      <svg className="absolute inset-0 h-full w-full pointer-events-auto" onClick={complete}>
        <defs>
          <mask id="vs-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {anchor && (
              <rect
                x={anchor.left - pad}
                y={anchor.top - pad}
                width={anchor.width + pad * 2}
                height={anchor.height + pad * 2}
                rx={10}
                ry={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(2,6,23,0.62)" mask="url(#vs-tour-mask)" />
      </svg>

      {/* Highlight ring around the anchor */}
      {anchor && (
        <div
          aria-hidden
          className="pointer-events-none fixed"
          style={{
            top: anchor.top - pad,
            left: anchor.left - pad,
            width: anchor.width + pad * 2,
            height: anchor.height + pad * 2,
            borderRadius: 10,
            boxShadow: "0 0 0 2px rgba(129,140,248,0.85), 0 0 0 6px rgba(129,140,248,0.25), 0 18px 44px rgba(99,102,241,0.45)",
            animation: "vs-tour-pulse 1800ms ease-in-out infinite",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="pointer-events-auto fixed rounded-xl bg-white shadow-[0_24px_60px_rgba(2,6,23,0.40),0_0_0_1px_rgba(2,6,23,0.06)]"
        style={{ top: tipTop, left: tipLeft, width: tipWidth }}
      >
        {arrowDir === "up" && (
          <div aria-hidden className="absolute -top-2 left-1/2 -translate-x-1/2"
            style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "8px solid white" }}
          />
        )}
        {arrowDir === "down" && (
          <div aria-hidden className="absolute -bottom-2 left-1/2 -translate-x-1/2"
            style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid white" }}
          />
        )}
        <div className="flex items-start gap-2.5 p-4">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-[0_4px_14px_rgba(99,102,241,0.40)]"
            style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13.5px] font-semibold tracking-tight text-slate-900">{current.title}</h3>
              <button
                type="button"
                onClick={complete}
                aria-label="Zavřít tour"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{current.body}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-medium text-slate-400">
                {step + 1} / {STEPS.length}
              </span>
              <div className="flex items-center gap-1.5">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Zpět
                  </button>
                )}
                {!isLast ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                    className="inline-flex h-7 items-center gap-1 rounded-md bg-indigo-600 px-2.5 text-[11px] font-semibold text-white hover:bg-indigo-700"
                  >
                    Dál
                    <ChevronRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={complete}
                    className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-500"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                    Hotovo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes vs-tour-pulse {
        0%, 100% { box-shadow: 0 0 0 2px rgba(129,140,248,0.85), 0 0 0 6px rgba(129,140,248,0.25), 0 18px 44px rgba(99,102,241,0.45); }
        50%      { box-shadow: 0 0 0 2px rgba(129,140,248,0.95), 0 0 0 10px rgba(129,140,248,0.18), 0 18px 44px rgba(99,102,241,0.60); }
      }`}</style>
    </div>
  );
}

/** Hook to auto-show the tour on first run.
 *
 * Currently DISABLED — the auto-trigger covered the dock with a full-screen
 * overlay and a 600 ms re-measure interval that the user experienced as
 * constant flicker + dead clicks. Users can launch the tour manually later
 * via dock more-menu (TODO). Until then we never auto-show.
 */
export function useOnboardingTour() {
  const [open, setOpen] = useState(false);
  return { open, close: () => setOpen(false), restart: () => setOpen(true) };
}
