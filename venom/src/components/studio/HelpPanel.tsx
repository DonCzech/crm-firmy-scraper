"use client";

import { useEffect, useRef } from "react";
import { X, Pencil, Plus, Palette, Rocket, Sparkles, Images, Keyboard, RefreshCw } from "@/components/studio/icons";
import { useStudio } from "./StudioContext";

const FEATURES = [
  {
    Icon: Pencil,
    title: "Upravit obsah stránky",
    desc: "Klikni na libovolnou sekci na plátně a uprav text, obrázky nebo tlačítka přímo na místě.",
  },
  {
    Icon: Plus,
    title: "Přidat sekci nebo stránku",
    desc: "Tlačítko + Přidat nahoře otevře knihovnu sekcí, prvků i hotových stránek. Sekce jde přetáhnout rovnou na plátno.",
  },
  {
    Icon: Palette,
    title: "Změnit barvy a branding",
    desc: "Sekce Design ti umožní nastavit primární barvu, font a logo, které se promítnou do celého webu.",
  },
  {
    Icon: Sparkles,
    title: "Pomocník AI",
    desc: "Vylepší, zkrátí nebo přeloží texty. Najdeš ho v liště nad plátnem.",
  },
  {
    Icon: Images,
    title: "Obrázky a soubory",
    desc: "Panel Soubory drží všechna tvá média — nahrávej přetažením, ořezávej a používej napříč webem.",
  },
  {
    Icon: Rocket,
    title: "Publikovat změny",
    desc: "Až budeš spokojený, klikni na tlačítko Publikovat nahoře vpravo a změny se okamžitě zobrazí návštěvníkům.",
  },
];

export function HelpPanel({ tenantSlug }: { tenantSlug?: string }) {
  const studio = useStudio();
  const panelRef = useRef<HTMLDivElement>(null);

  function restartTour() {
    if (tenantSlug) localStorage.removeItem(`webero-studio-onboarding-done:${tenantSlug}`);
    studio.setHelpPanelOpen(false);
    window.location.reload();
  }

  useEffect(() => {
    if (!studio.helpPanelOpen) return;
    function onDown(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) studio.setHelpPanelOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") studio.setHelpPanelOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [studio.helpPanelOpen, studio]);

  if (!studio.helpPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none vs-enter">
      <div
        className="absolute inset-0 pointer-events-auto bg-black/30"
        onClick={() => studio.setHelpPanelOpen(false)}
      />

      {/* Drawer — slides in from right */}
      <div
        ref={panelRef}
        className="pointer-events-auto absolute right-0 top-0 bottom-0 left-0 flex flex-col bg-[var(--vs-surface)] border-l border-[var(--vs-surface-2)] shadow-[-4px_0_32px_rgba(0,0,0,0.5)]"
        style={{ left: "max(0px, calc(100vw - 360px))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--vs-surface-2)]">
          <span className="text-[17px] font-black tracking-tight text-[var(--vs-text)]">Nápověda</span>
          <button
            type="button"
            onClick={() => studio.setHelpPanelOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto vs-scroll px-5 py-5">
          <p className="text-[13px] leading-relaxed text-[var(--vs-text-muted)] mb-6">
            Vítej ve Webero Studiu! Tady ti v rychlosti ukážeme nejdůležitější funkce, které ti pomohou rozjet web co nejrychleji.
          </p>

          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--vs-text-muted)] mb-3">
            Představení základních funkcí
          </p>

          <ul className="space-y-3">
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-[var(--vs-surface-2)] p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--vs-border-strong)] text-[var(--vs-accent-hi)]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--vs-text)] mb-0.5">{title}</p>
                  <p className="text-[12px] leading-snug text-[var(--vs-text-muted)]">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--vs-surface-2)] space-y-2">
          <button
            type="button"
            onClick={() => { studio.setHelpPanelOpen(false); studio.setShortcutsOpen(true); }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--vs-border-strong)] py-2 text-[13px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
          >
            <Keyboard className="h-3.5 w-3.5" strokeWidth={1.75} />
            Klávesové zkratky
          </button>
          <button
            type="button"
            onClick={restartTour}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--vs-border-strong)] py-2 text-[13px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Spustit průvodce znovu
          </button>
        </div>
      </div>
    </div>
  );
}
