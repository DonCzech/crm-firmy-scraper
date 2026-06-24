"use client";

import { useState } from "react";
import { useStudio } from "./StudioContext";
import { StudioTopBar } from "./StudioTopBar";
import { StudioLeftRail } from "./StudioLeftRail";
import { StudioLeftPanel } from "./StudioLeftPanel";
import { StudioCanvas } from "./StudioCanvas";
import { KeyboardShortcutsOverlay } from "./KeyboardShortcuts";
import { OnboardingTour } from "./OnboardingTour";
import { useHotkey } from "./ui";
import "./design-tokens.css";
import type { StudioState } from "./TenantStudioView";

export function StudioShell({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [helpOpen, setHelpOpen] = useState(false);

  useHotkey("?", () => setHelpOpen(true));
  useHotkey("P", () => studio.setLeftPanel(studio.leftPanel === "pages"    ? null : "pages"));
  useHotkey("D", () => studio.setLeftPanel(studio.leftPanel === "design"   ? null : "design"));
  useHotkey("M", () => studio.setLeftPanel(studio.leftPanel === "modules"  ? null : "modules"));
  useHotkey("L", () => studio.setLeftPanel(studio.leftPanel === "layers"   ? null : "layers"));
  useHotkey("A", () => studio.setLeftPanel(studio.leftPanel === "add"      ? null : "add"));
  useHotkey("B", () => studio.setLeftPanel(studio.leftPanel === "brand"    ? null : "brand"));

  return (
    <div
      data-studio
      className="fixed inset-0 flex flex-col bg-[var(--vs-bg-soft)]"
      onKeyDown={(e) => {
        if (e.key === "Escape") studio.setSelection(null);
      }}
    >
      <StudioTopBar state={state} onHelp={() => setHelpOpen(true)} />
      <SaveErrorBanner state={state} />

      <div className="flex flex-1 min-h-0">
        {/* Rail — always 55px, icons only, never moves */}
        <StudioLeftRail />

        {/* Panel — always visible flex sibling, shows Overview or specific panel */}
        <div className="w-[220px] shrink-0 bg-[var(--vs-bg-soft)] border-r border-[var(--vs-border)] overflow-hidden">
          <StudioLeftPanel state={state} />
        </div>

        {/* Canvas — always flex-1, never shrinks, template goes to right edge */}
        <div data-tour-id="canvas" className="flex-1 min-w-0 bg-[var(--vs-bg-soft)]">
          <StudioCanvas state={state} />
        </div>
      </div>

      {/* Trial banner */}
      <TrialBanner />

      <KeyboardShortcutsOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      <OnboardingTour tenantSlug={state.tenant.slug} />
    </div>
  );
}

function TrialBanner() {
  return (
    <div className="shrink-0 flex border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
      {/* Sidebar spacer — extends the separator line through the footer */}
      <div className="w-[275px] shrink-0 border-r border-[var(--vs-border)]" />
      {/* Content lives in the canvas column only */}
      <div className="flex flex-1 items-center justify-center gap-4 px-4 py-2.5">
        <span className="text-[12px] text-[var(--vs-text-muted)] text-center">
          Vaše bezplatná zkušební verze končí za <strong className="text-[var(--vs-text-soft)]">15 dní</strong>.
          Upgrade na některý z našich plánů vám umožní naplno využít potenciál vašich webových stránek.
        </span>
        <button
          type="button"
          className="shrink-0 rounded-md bg-[#2563eb] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors duration-100"
        >
          Předplatit plán
        </button>
      </div>
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
