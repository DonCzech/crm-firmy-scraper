"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, ChevronRight } from "@/components/studio/icons";
import clsx from "clsx";
import { useStudio } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";

interface ChecklistStep {
  id: string;
  label: string;
  description: string;
  action: string;
  panel?: string;
}

const STEPS: ChecklistStep[] = [
  {
    id: "logo",
    label: "Přidat logo firmy",
    description: "Nahrajte logo, které se zobrazí v navigaci vašeho webu.",
    action: "Otevřít brand",
    panel: "brand",
  },
  {
    id: "contact",
    label: "Vyplnit kontaktní údaje",
    description: "Adresa, telefon a e-mail pro kontaktní sekce a patičku.",
    action: "Nastavení",
    panel: undefined,
  },
  {
    id: "texts",
    label: "Upravit texty na stránce",
    description: "Klikněte na libovolný text v náhledu a upravte ho přímo.",
    action: "Přejít na sekce",
    panel: "layers",
  },
  {
    id: "photos",
    label: "Nahrát fotografie",
    description: "Přidejte vlastní fotky do galerií a hero sekcí.",
    action: "Galerie obrázků",
    panel: undefined,
  },
  {
    id: "publish",
    label: "Publikovat web",
    description: "Až budete spokojeni, klikněte na tlačítko Publikovat.",
    action: "Hotovo",
    panel: undefined,
  },
];

function storageKey(tenantSlug: string) {
  return `webero-checklist:${tenantSlug}`;
}

function loadDone(tenantSlug: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(tenantSlug));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveDone(tenantSlug: string, done: Set<string>) {
  try {
    localStorage.setItem(storageKey(tenantSlug), JSON.stringify([...done]));
  } catch {}
}

export function SetupChecklist({ state }: { state: StudioState }) {
  const studio = useStudio();
  const slug = state.tenant.slug;
  const [done, setDone] = useState<Set<string>>(() => loadDone(slug));
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { saveDone(slug, done); }, [slug, done]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) studio.setChecklistOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") studio.setChecklistOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [studio]);

  function toggle(id: string) {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleAction(step: ChecklistStep) {
    if (step.panel) {
      studio.setLeftPanel(step.panel as Parameters<typeof studio.setLeftPanel>[0]);
      studio.setChecklistOpen(false);
    } else if (step.id === "photos") {
      studio.setAssetsOpen(true);
      studio.setChecklistOpen(false);
    } else if (step.id === "publish") {
      // Mark done and close
      toggle(step.id);
    } else if (step.id === "contact") {
      studio.setLeftPanel("design");
      studio.setChecklistOpen(false);
    }
  }

  const completedCount = STEPS.filter(s => done.has(s.id)).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div
      ref={panelRef}
      className="vs-overlay-panel fixed bottom-3 left-3 right-3 z-[200] max-h-[calc(100vh-24px)] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(18,18,20,0.76)] shadow-[0_18px_58px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl vs-enter sm:bottom-[52px] sm:left-[64px] sm:right-auto sm:w-[340px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--vs-border)] px-4 py-3">
        <div>
          <div className="text-[13.5px] font-semibold text-[var(--vs-text)]">Nastavení webu</div>
          <div className="text-[11.5px] text-[var(--vs-text-muted)] mt-0.5">
            {completedCount} / {STEPS.length} kroků dokončeno
          </div>
        </div>
        <button
          type="button"
          aria-label="Zavřít"
          onClick={() => studio.setChecklistOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="h-1.5 w-full rounded-full bg-[var(--vs-surface)]">
          <div
            className="h-full rounded-full bg-[var(--vs-accent)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex max-h-[calc(100vh-128px)] flex-col gap-0.5 overflow-y-auto px-2 pb-3 pt-2 vs-scroll sm:max-h-none">
        {STEPS.map((step, i) => {
          const isDone = done.has(step.id);
          return (
            <div
              key={step.id}
              className={clsx(
                "group flex items-start gap-3 rounded-xl p-3 transition-colors",
                isDone ? "opacity-60" : "hover:bg-[var(--vs-surface-2)]"
              )}
            >
              {/* Step number / checkmark */}
              <button
                type="button"
                onClick={() => toggle(step.id)}
                className={clsx(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isDone
                    ? "border-[var(--vs-accent)] bg-[var(--vs-accent)] text-[var(--vs-text)]"
                    : "border-[var(--vs-border-strong)] text-[var(--vs-text-muted)] hover:border-[var(--vs-accent)]"
                )}
                aria-label={isDone ? "Označit jako nedokončeno" : "Označit jako dokončeno"}
              >
                {isDone
                  ? <Check className="h-3 w-3" strokeWidth={3} />
                  : <span className="text-[10px] font-bold">{i + 1}</span>
                }
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={clsx(
                  "text-[13px] font-medium",
                  isDone ? "line-through text-[var(--vs-text-muted)]" : "text-[var(--vs-text)]"
                )}>
                  {step.label}
                </div>
                {!isDone && (
                  <div className="text-[11.5px] text-[var(--vs-text-muted)] mt-0.5 leading-relaxed">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Action button */}
              {!isDone && (
                <button
                  type="button"
                  onClick={() => handleAction(step)}
                  className="flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--vs-accent-hi)] opacity-100 transition-colors hover:bg-[rgba(212,212,216,0.12)] sm:opacity-0 sm:group-hover:opacity-100"
                >
                  {step.action}
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* All done footer */}
      {completedCount === STEPS.length && (
        <div className="border-t border-[var(--vs-border)] bg-[rgba(34,197,94,0.08)] px-4 py-3 text-center text-[12.5px] text-emerald-400 font-medium">
          Skvělá práce! Web je připraven k publikování. 🎉
        </div>
      )}
    </div>
  );
}
