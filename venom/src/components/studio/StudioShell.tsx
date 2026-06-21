"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useStudio } from "./StudioContext";
import { StudioTopBar } from "./StudioTopBar";
import { StudioLeftRail } from "./StudioLeftRail";
import { StudioLeftPanel } from "./StudioLeftPanel";
import { StudioCanvas } from "./StudioCanvas";
import { StudioRightPanel } from "./StudioRightPanel";
import { KeyboardShortcutsOverlay } from "./KeyboardShortcuts";
import { OnboardingTour } from "./OnboardingTour";
import { useHotkey } from "./ui";
import "./design-tokens.css";
import type { StudioState } from "./TenantStudioView";

export function StudioShell({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [helpOpen, setHelpOpen] = useState(false);

  useHotkey("?", () => setHelpOpen(true));
  useHotkey("L", () => studio.setLeftPanel(studio.leftPanel === "layers" ? null : "layers"));
  useHotkey("A", () => studio.setLeftPanel(studio.leftPanel === "add" ? null : "add"));
  useHotkey("P", () => studio.setLeftPanel(studio.leftPanel === "pages" ? null : "pages"));
  useHotkey("I", () => studio.setLeftPanel(studio.leftPanel === "assets" ? null : "assets"));
  useHotkey("B", () => studio.setLeftPanel(studio.leftPanel === "brand" ? null : "brand"));

  return (
    <div
      data-studio
      className="fixed inset-0 flex flex-col"
      onKeyDown={(e) => {
        if (e.key === "Escape") studio.setSelection(null);
      }}
    >
      <StudioTopBar state={state} onHelp={() => setHelpOpen(true)} />
      <SaveErrorBanner state={state} />
      <div className="flex flex-1 min-h-0">
        <StudioLeftRail />
        <AnimatePresence initial={false}>
          {studio.leftPanel && (
            <motion.div
              key={studio.leftPanel}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 296, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.18, 0.89, 0.32, 1] }}
              className="overflow-hidden border-r border-[var(--vs-border)] bg-[var(--vs-surface)]"
            >
              <div className="w-[296px] h-full">
                <StudioLeftPanel state={state} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div data-tour-id="canvas" className="flex-1 min-w-0 bg-[var(--vs-bg)]">
          <StudioCanvas state={state} />
        </div>
        <AnimatePresence initial={false}>
          {studio.rightPanel && (
            <motion.div
              data-tour-id="inspector"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 332, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.18, 0.89, 0.32, 1] }}
              className="overflow-hidden border-l border-[var(--vs-border)] bg-[var(--vs-surface)]"
            >
              <div className="w-[332px] h-full">
                <StudioRightPanel state={state} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <KeyboardShortcutsOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      <OnboardingTour tenantSlug={state.tenant.slug} />
    </div>
  );
}

function SaveErrorBanner({ state }: { state: StudioState }) {
  if (!state.saveError) return null;
  return (
    <div className="vs-enter border-b border-[rgba(248,113,113,0.30)] bg-[var(--vs-danger-bg)] px-4 py-2.5 text-[12.5px] text-[var(--vs-danger)]">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(248,113,113,0.20)] font-bold">!</span>
        <div className="min-w-0 flex-1">
          <div className="font-medium">Změny se neuložily do databáze.</div>
          <div className="truncate font-mono text-[10.5px] opacity-80">{state.saveError}</div>
        </div>
        <button
          onClick={state.dismissSaveError}
          className="shrink-0 rounded px-2 py-1 text-[11px] hover:bg-[rgba(248,113,113,0.15)]"
          type="button"
        >
          Zavřít
        </button>
      </div>
    </div>
  );
}
