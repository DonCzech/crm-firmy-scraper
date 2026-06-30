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
import { CommandPalette } from "./CommandPalette";
import { NotificationsPanel } from "./NotificationsPanel";
import { HelpPanel } from "./HelpPanel";
import { WixAddOverlay } from "./panels/WixAddOverlay";
import { WixAddButton } from "./panels/WixAddButton";
import { SetupChecklist } from "./SetupChecklist";
import { AIPanel } from "./AIPanel";
import { useHotkey } from "./ui";
import "./design-tokens.css";
import type { StudioState } from "./TenantStudioView";

function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < bp);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [bp]);
  return mobile;
}

export function StudioShell({ state }: { state: StudioState }) {
  const studio = useStudio();
  const { sidebarOpen } = studio;
  const isMobile = useIsMobile();

  // Right panel drag — desktop only
  const rpDrag = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const [rpPos, setRpPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => { setRpPos(null); }, [studio.selectedSectionId]);

  function startRpDrag(e: React.PointerEvent) {
    if (isMobile) return;
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

  useHotkey("?",      () => studio.setShortcutsOpen(true));
  useHotkey("cmd+k",  () => studio.setCommandPaletteOpen(true));
  useHotkey("P",      () => studio.setLeftPanel(studio.leftPanel === "pages"   ? null : "pages"));
  useHotkey("D",      () => studio.setLeftPanel(studio.leftPanel === "design"  ? null : "design"));
  useHotkey("M",      () => studio.setLeftPanel(studio.leftPanel === "modules" ? null : "modules"));
  useHotkey("L",      () => studio.setLeftPanel(studio.leftPanel === "layers"  ? null : "layers"));
  useHotkey("A",      () => studio.setLeftPanel(studio.leftPanel === "add"     ? null : "add"));
  useHotkey("B",      () => studio.setLeftPanel(studio.leftPanel === "brand"   ? null : "brand"));

  return (
    <div
      data-studio
      className="fixed inset-0 flex flex-col bg-[var(--vs-bg-soft)]"
      onKeyDown={(e) => { if (e.key === "Escape") studio.setSelection(null); }}
    >
      <StudioTopBar state={state} onHelp={() => studio.setShortcutsOpen(true)} isMobile={isMobile} />
      {!isMobile && <SecondaryActionBar />}
      <SaveErrorBanner state={state} />

      <div className="relative flex flex-1 min-h-0">
        {/* Rail — always 55px */}
        <StudioLeftRail />

        {/* Left panel — desktop: inline (pushes canvas); mobile: overlay drawer */}
        {sidebarOpen && (
          <>
            {isMobile && (
              <div
                className="absolute inset-0 z-[70] bg-black/40"
                onClick={studio.toggleSidebar}
              />
            )}
            <div
              className="flex flex-col bg-[var(--vs-bg-soft)] border-r border-[var(--vs-border)] overflow-x-hidden"
              style={
                isMobile
                  ? { position: "absolute", left: 55, top: 0, bottom: 0, width: 280, zIndex: 75 }
                  : { width: 220, flexShrink: 0 }
              }
            >
              <StudioLeftPanel state={state} />
            </div>
          </>
        )}

        {/* Canvas */}
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

        {/* Right inspector — mobile: bottom sheet; desktop: side panel */}
        {studio.rightPanel && !rpPos && (
          isMobile ? (
            <div
              className="absolute bottom-0 left-0 right-0 z-[60] border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)] overflow-hidden shadow-[0_-4px_20px_rgba(0,0,0,.4)] vs-enter"
              style={{ height: "52vh" }}
            >
              {/* Mobile drag handle */}
              <div className="flex justify-center py-2">
                <div className="h-1 w-10 rounded-full bg-[var(--vs-border-strong)]" />
              </div>
              <div className="h-[calc(100%-24px)] overflow-y-auto overflow-x-hidden">
                <StudioRightPanel state={state} onStartDrag={startRpDrag} />
              </div>
            </div>
          ) : (
            <div className="absolute right-0 top-0 bottom-0 w-[260px] z-[50] border-l border-[var(--vs-border)] bg-[var(--vs-bg-soft)] overflow-hidden shadow-[-4px_0_16px_rgba(0,0,0,.25)]">
              <StudioRightPanel state={state} onStartDrag={startRpDrag} />
            </div>
          )
        )}
      </div>

      {/* Floating right panel — desktop only */}
      {studio.rightPanel && rpPos && !isMobile && (
        <div
          className="fixed z-[150] flex flex-col w-[260px] rounded-xl border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] shadow-[0_8px_40px_rgba(0,0,0,.5)] overflow-hidden"
          style={{ left: rpPos.x, top: rpPos.y, maxHeight: `calc(100vh - ${rpPos.y + 16}px)` }}
        >
          <StudioRightPanel state={state} onStartDrag={startRpDrag} isFloating />
        </div>
      )}

      {/* Trial banner — desktop only */}
      {!isMobile && <TrialBanner sidebarOpen={sidebarOpen} />}

      <KeyboardShortcutsOverlay open={studio.shortcutsOpen} onClose={() => studio.setShortcutsOpen(false)} />
      <CommandPalette state={state} />
      <NotificationsPanel />
      <HelpPanel />
      <OnboardingTour tenantSlug={state.tenant.slug} />

      {studio.assetsOpen && (
        <AssetsGallery state={state} onClose={() => studio.setAssetsOpen(false)} />
      )}

      {studio.imagePanel && <ImageFloatingPanel state={state} />}

      {!isMobile && <WixAddOverlay state={state} />}

      {studio.checklistOpen && !isMobile && <SetupChecklist state={state} />}
      {studio.aiPanelOpen && !isMobile && <AIPanel state={state} />}
    </div>
  );
}

/**
 * Wix-style secondary action row. Sits between the dark top bar and the
 * canvas. Houses the brand-aligned equivalents of Wix's
 * "Ask Aria / Change Layout / Replace Background" cluster. We keep our
 * dark surface but mimic the airy spacing and pill divider pattern.
 */
function SecondaryActionBar() {
  const studio = useStudio();
  return (
    <div className="shrink-0 grid h-[42px] grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3">
      {/* Left: primary +Add button (Wix-style) */}
      <div className="flex items-center justify-start">
        <WixAddButton />
      </div>
      {/* Center: secondary actions */}
      <div className="flex items-center gap-1 justify-center">
        <button
          type="button"
          title="AI návrhy a opravy textů"
          onClick={() => studio.setAiPanelOpen(!studio.aiPanelOpen)}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors ${studio.aiPanelOpen ? "bg-[rgba(167,139,250,0.15)] text-[#a78bfa]" : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"}`}
        >
          <span className="text-[#a78bfa]">✨</span>
          <span>Pomocník AI</span>
        </button>
        <span className="mx-1 h-3.5 w-px bg-[var(--vs-border)]" />
        <button
          type="button"
          title="Vyměnit layout aktuální sekce"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
        >
          <span>▢▢</span>
          <span>Změnit rozložení</span>
        </button>
        <span className="mx-1 h-3.5 w-px bg-[var(--vs-border)]" />
        <button
          type="button"
          title="Změnit pozadí sekce"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
        >
          <span>○</span>
          <span>Pozadí</span>
        </button>
      </div>
      {/* Right: reserved for breakpoint/zoom mirrors if needed later */}
      <div />
    </div>
  );
}

function TrialBanner({ sidebarOpen }: { sidebarOpen: boolean }) {
  return (
    <div className="shrink-0 flex border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
      <div style={{ width: sidebarOpen ? 275 : 55, transition: "width 0.2s ease-in-out" }} className="shrink-0 border-r border-[var(--vs-border)]" />
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
