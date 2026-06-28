"use client";

import { useEffect, useState } from "react";
import { Rocket, Check, AlertCircle, Loader2 } from "lucide-react";
import type { StudioState } from "./TenantStudioView";

/**
 * F2 Sprint 1 — "Spustit web" button.
 *
 * Pre-flight: GET /api/demo/<slug>/go-live → {ready, missing[]}.
 * Publish:    POST /api/demo/<slug>/go-live → flip status to 'active'.
 * After publish: button hides (status='active'), site appears in sitemap+robots.
 */
type PreflightState =
  | { phase: "loading" }
  | { phase: "ready" }
  | { phase: "blocked"; missing: string[] }
  | { phase: "published" }
  | { phase: "error"; message: string };

export function GoLiveButton({ state }: { state: StudioState }) {
  const [pf, setPf] = useState<PreflightState>({ phase: "loading" });
  const [publishing, setPublishing] = useState(false);
  const [showMissing, setShowMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/demo/${state.tenant.slug}/go-live`, { cache: "no-store" });
        if (!res.ok) {
          // Unauthorized in non-studio context — silently hide
          if (cancelled) return;
          setPf({ phase: "error", message: `HTTP ${res.status}` });
          return;
        }
        const json = (await res.json()) as {
          isPublished: boolean;
          ready: boolean;
          missing: string[];
        };
        if (cancelled) return;
        if (json.isPublished) setPf({ phase: "published" });
        else if (json.ready)  setPf({ phase: "ready" });
        else                  setPf({ phase: "blocked", missing: json.missing });
      } catch (err) {
        if (!cancelled) setPf({ phase: "error", message: err instanceof Error ? err.message : "Chyba" });
      }
    })();
    return () => { cancelled = true; };
  }, [state.tenant.slug]);

  async function publish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/go-live`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (Array.isArray(json.missing)) {
          setPf({ phase: "blocked", missing: json.missing });
          setShowMissing(true);
        } else {
          setPf({ phase: "error", message: json.error ?? `HTTP ${res.status}` });
        }
        return;
      }
      setPf({ phase: "published" });
    } finally {
      setPublishing(false);
    }
  }

  if (pf.phase === "loading" || pf.phase === "error") return null;
  if (pf.phase === "published") {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-500/15 px-3 text-xs font-medium text-emerald-300">
        <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
        Web je v provozu
      </span>
    );
  }

  const blocked = pf.phase === "blocked";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (blocked ? setShowMissing((v) => !v) : void publish())}
        disabled={publishing}
        // Blocked = icon-only amber alert (the verbose label has moved into
        // the popover, the bar stays compact next to the new Publikovat
        // dropdown). Ready = full "Spustit web" pill with rocket.
        className={
          blocked
            ? `grid h-8 w-8 place-items-center rounded-md bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-colors disabled:opacity-60`
            : `inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors duration-150 disabled:opacity-60`
        }
        aria-label={blocked ? "Před spuštěním vyplň povinné údaje" : "Spustit web do produkce"}
        title={blocked ? "Před spuštěním vyplň povinné údaje" : "Spustit web do produkce"}
      >
        {publishing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : blocked ? (
          <AlertCircle className="h-4 w-4" strokeWidth={2.25} />
        ) : (
          <>
            <Rocket className="h-3.5 w-3.5" strokeWidth={2.25} />
            Spustit web
          </>
        )}
      </button>

      {blocked && showMissing && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-md border border-amber-500/40 bg-[#1a1a1c] p-3 text-[11px] shadow-xl">
          <div className="mb-1.5 font-medium text-amber-300">Před spuštěním webu doplň:</div>
          <ul className="space-y-1 text-[#d4d4d8]">
            {pf.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-400">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setShowMissing(false)}
            className="mt-2 text-[10.5px] text-[#71717a] hover:text-white"
          >
            Zavřít
          </button>
        </div>
      )}
    </div>
  );
}
