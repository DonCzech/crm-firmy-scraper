"use client";

import { useState, useEffect } from "react";
import { X, Check, ChevronRight } from "lucide-react";
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

  useEffect(() => { saveDone(slug, done); }, [slug, done]);

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
    <div className="fixed bottom-[52px] left-[55px] z-[200] w-[320px] rounded-2xl border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] shadow-[0_8px_40px_rgba(0,0,0,.55)] overflow-hidden vs-enter">
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
            className="h-full rounded-full bg-[#6366f1] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-0.5 px-2 pb-3 pt-2">
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
                    ? "border-[#6366f1] bg-[#6366f1] text-white"
                    : "border-[var(--vs-border-strong)] text-[var(--vs-text-muted)] hover:border-[#6366f1]"
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
                  className="shrink-0 flex items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--vs-accent-hi)] hover:bg-[rgba(129,140,248,0.12)] transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
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
