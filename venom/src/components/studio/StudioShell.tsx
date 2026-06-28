"use client";

import { useState, useRef, useEffect } from "react";
import { useStudio } from "./StudioContext";
import { StudioTopBar } from "./StudioTopBar";
import { StudioLeftRail } from "./StudioLeftRail";
import { StudioLeftPanel } from "./StudioLeftPanel";
import { StudioRightPanel } from "./StudioRightPanel";
import { StudioCanvas } from "./StudioCanvas";
import { StudioSettingsCanvas } from "./StudioSettingsCanvas";
import { StudioModulesCanvas } from "./StudioModulesCanvas";
import { StudioArticlesCanvas } from "./StudioArticlesCanvas";
import { AssetsGallery } from "./AssetsGallery";
import { ImageFloatingPanel } from "./ImageFloatingPanel";
import { KeyboardShortcutsOverlay } from "./KeyboardShortcuts";
import { OnboardingTour } from "./OnboardingTour";
import { useHotkey } from "./ui";
import "./design-tokens.css";
import type { StudioState } from "./TenantStudioView";

export function StudioShell({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [helpOpen, setHelpOpen] = useState(false);

  // Right panel drag state — null = anchored to right edge, {x,y} = freely floating
  const rpDrag = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const [rpPos, setRpPos] = useState<{ x: number; y: number } | null>(null);

  // Reset to anchored position when section selection changes
  useEffect(() => { setRpPos(null); }, [studio.selectedSectionId]);

  function startRpDrag(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button,input,select,textarea,a")) return;
    const startX = rpPos?.x ?? Math.max(0, window.innerWidth - 264);
    const startY = rpPos?.y ?? 44;
    rpDrag.current = { mx: e.clientX, my: e.clientY, px: startX, py: startY };
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      if (!rpDrag.current) return;
      setRpPos({
        x: Math.max(0, Math.min(window.innerWidth - 264, rpDrag.current.px + ev.clientX - rpDrag.current.mx)),
        y: Math.max(44, Math.min(window.innerHeight - 120, rpDrag.current.py + ev.clientY - rpDrag.current.my)),
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", () => {
      rpDrag.current = null;
      window.removeEventListener("pointermove", move);
    }, { once: true });
  }

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

      <div className="relative flex flex-1 min-h-0">
        {/* Rail — always 55px, icons only, never moves */}
        <StudioLeftRail />

        {/* Panel — scrollable, only the rail stays fixed */}
        <div className="w-[220px] shrink-0 flex flex-col bg-[var(--vs-bg-soft)] border-r border-[var(--vs-border)] overflow-hidden">
          <StudioLeftPanel state={state} />
        </div>

        {/* Canvas — always flex-1, never shrinks. Shows settings overlay when a settings view is active. */}
        <div data-tour-id="canvas" className="flex-1 min-w-0 bg-[var(--vs-bg-soft)]">
          {studio.settingsView
            ? <StudioSettingsCanvas state={state} />
            : studio.leftPanel === "modules"
            ? <StudioModulesCanvas state={state} />
            : studio.leftPanel === "articles"
            ? <StudioArticlesCanvas state={state} />
            : <StudioCanvas state={state} />
          }
        </div>

        {/* Right inspector panel — anchored right OR freely draggable when moved */}
        {studio.rightPanel && !rpPos && (
          <div className="absolute right-0 top-0 bottom-0 w-[260px] z-[50] border-l border-[var(--vs-border)] bg-[var(--vs-bg-soft)] overflow-hidden shadow-[-4px_0_16px_rgba(0,0,0,.25)]">
            <StudioRightPanel state={state} onStartDrag={startRpDrag} />
          </div>
        )}
      </div>

      {/* Floating right panel (detached after first drag) */}
      {studio.rightPanel && rpPos && (
        <div
          className="fixed z-[150] flex flex-col w-[260px] rounded-xl border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] shadow-[0_8px_40px_rgba(0,0,0,.5)] overflow-hidden"
          style={{ left: rpPos.x, top: rpPos.y, maxHeight: `calc(100vh - ${rpPos.y + 16}px)` }}
        >
          <StudioRightPanel state={state} onStartDrag={startRpDrag} isFloating />
        </div>
      )}

      {/* Trial banner */}
      <TrialBanner />

      <KeyboardShortcutsOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      <OnboardingTour tenantSlug={state.tenant.slug} />

      {studio.assetsOpen && (
        <AssetsGallery state={state} onClose={() => studio.setAssetsOpen(false)} />
      )}

      {/* Floating image inspector — rendered as portal inside shell */}
      {studio.imagePanel && <ImageFloatingPanel state={state} />}
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
