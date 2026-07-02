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
import { ReorderSectionsModal } from "./panels/ReorderSectionsModal";
import { ArrowUpDown } from "lucide-react";
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
  const [reorderOpen, setReorderOpen] = useState(false);

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
      {!isMobile && <SecondaryActionBar state={state} onOpenReorder={() => setReorderOpen(true)} />}
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
        <div data-tour-id="canvas" className="flex-1 min-w-0 vs-canvas-bg">
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
              className="vs-glass vs-enter absolute bottom-0 left-0 right-0 z-[60] rounded-t-2xl border-t border-[var(--vs-border-strong)] overflow-hidden shadow-[0_-12px_40px_rgba(0,0,0,.55)]"
              style={{ height: "52vh" }}
            >
              {/* Mobile drag handle */}
              <div className="flex justify-center py-2">
                <div className="h-1 w-10 rounded-full bg-[var(--vs-text-disabled)]" />
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
          className="vs-glass fixed z-[150] flex flex-col w-[260px] rounded-xl border border-[var(--vs-border-strong)] shadow-[var(--vs-shadow-xl)] overflow-hidden"
          style={{ left: rpPos.x, top: rpPos.y, maxHeight: `calc(100vh - ${rpPos.y + 16}px)` }}
        >
          <StudioRightPanel state={state} onStartDrag={startRpDrag} isFloating />
        </div>
      )}

      {/* Trial banner — desktop only */}
      {!isMobile && <TrialBanner sidebarOpen={sidebarOpen} state={state} />}

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
      {!isMobile && <ReorderSectionsModal open={reorderOpen} onClose={() => setReorderOpen(false)} state={state} />}

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
function SecondaryActionBar({ state, onOpenReorder }: { state: StudioState; onOpenReorder: () => void }) {
  const studio = useStudio();
  const hasSections = state.sections.length > 0;

  return (
    <div className="shrink-0 flex h-[42px] items-center justify-center gap-1 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3">
      <WixAddButton />
      <span className="mx-2 h-3.5 w-px bg-[var(--vs-border)]" />

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
        title={hasSections ? "Drag-and-drop přeuspořádání sekcí na stránce" : "Stránka nemá žádné sekce"}
        onClick={onOpenReorder}
        disabled={!hasSections}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors ${hasSections ? "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]" : "text-[var(--vs-text-dim)] opacity-50 cursor-not-allowed"}`}
      >
        <ArrowUpDown size={14} strokeWidth={1.8} />
        <span>Změnit pořadí</span>
      </button>
    </div>
  );
}

function TrialBanner({ sidebarOpen, state }: { sidebarOpen: boolean; state: StudioState }) {
  const studio = useStudio();
  const [sub, setSub] = useState<{ status: string; days_remaining: number | null } | null>(null);

  useEffect(() => {
    fetch(`/api/billing/gopay/status?tenantSlug=${encodeURIComponent(state.tenant.slug)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.subscription) setSub(d.subscription); })
      .catch(() => {});
  }, [state.tenant.slug]);

  // Hide banner if paid/active
  if (sub?.status === "active") return null;

  const days = sub?.days_remaining ?? null;
  const expired = days !== null && days <= 0;
  const urgent = days !== null && days <= 7 && days > 0;

  function goToBilling() {
    studio.setLeftPanel("settings");
    studio.setSettingsView("billing");
  }

  return (
    <div className="shrink-0 flex border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
      <div style={{ width: sidebarOpen ? 275 : 55, transition: "width 0.2s ease-in-out" }} className="shrink-0 border-r border-[var(--vs-border)]" />
      <div className="flex flex-1 items-center justify-center gap-4 px-4 py-2.5">
        <span className="text-[12px] text-[var(--vs-text-muted)] text-center">
          {expired
            ? <><strong className="text-red-400">Zkušební verze vypršela.</strong> Web je pozastaven. Aktivujte předplatné pro obnovu.</>
            : days !== null
            ? <>Zkušební verze: zbývá <strong className={urgent ? "text-amber-400" : "text-[var(--vs-text-soft)]"}>{days} {days === 1 ? "den" : days < 5 ? "dny" : "dní"}</strong>. Upgrade pro plný přístup.</>
            : <>Bezplatná zkušební verze. Upgrade pro plný přístup.</>
          }
        </span>
        <button
          type="button"
          onClick={goToBilling}
          className="vs-grad-accent shrink-0 rounded-md px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-[var(--vs-glow-brand)] transition-[box-shadow] duration-100"
        >
          Předplatit · 499 Kč/měs.
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
