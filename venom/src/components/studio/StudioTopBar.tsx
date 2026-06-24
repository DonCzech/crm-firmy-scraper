"use client";

import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, ExternalLink, ChevronLeft, Folder,
} from "lucide-react";
import clsx from "clsx";
import { useStudio, type StudioBreakpoint } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";
import { GoLiveButton } from "./GoLiveButton";
import { useHotkey } from "./ui";

export function StudioTopBar({ state, onHelp: _onHelp }: { state: StudioState; onHelp: () => void }) {
  const studio = useStudio();

  useHotkey("1", () => studio.setBreakpoint("desktop"));
  useHotkey("2", () => studio.setBreakpoint("tablet"));
  useHotkey("3", () => studio.setBreakpoint("mobile"));
  useHotkey("cmd+z", () => state.canUndo && state.undo());
  useHotkey("cmd+shift+z", () => state.canRedo && state.redo());
  useHotkey("cmd+s", () => { void state.flushSave(); });

  return (
    <header
      className="flex h-[53px] shrink-0 items-center bg-[var(--vs-bg-soft)]"
    >
      {/* Left sidebar zone (275px = 55 rail + 220 panel) — continuous separator to canvas */}
      <div className="w-[275px] shrink-0 flex h-full border-r border-[var(--vs-border)]">
        {/* Rail sub-zone (55px) with inner shadow matching rail */}
        <div
          className="w-[55px] shrink-0 h-full"
          style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.055)" }}
        />
        {/* Panel sub-zone (220px) — Overview back button when panel is open */}
        <div className="flex flex-1 items-center px-3">
          {studio.leftPanel && (
            <button
              type="button"
              onClick={() => studio.setLeftPanel(null)}
              className="flex items-center gap-1.5 text-[13px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] transition-colors duration-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              Zpět
            </button>
          )}
        </div>
      </div>

      {/* Canvas zone — overview + breadcrumb + controls */}
      <div className="flex flex-1 items-center gap-2 px-3 min-w-0">

        {/* Center — breadcrumb + not indexing */}
        <div className="flex flex-1 items-center justify-center gap-2 min-w-0 px-2">
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--vs-text-muted)] min-w-0">
            <Folder className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} />
            <span className="shrink-0">Statické stránky</span>
            <span className="shrink-0 opacity-50">/</span>
            <span className="font-semibold text-[var(--vs-text)] truncate max-w-[154px]">
              {state.page?.title ?? state.page?.slug ?? "Úvod"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-[#ef4444] px-2 py-[3px] text-[11px] font-bold text-white tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            Not indexing
          </span>
        </div>

        {/* Right — breakpoint + undo/redo + external + publish */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center gap-0.5 rounded-md bg-[var(--vs-surface)] p-0.5 ring-1 ring-[var(--vs-border)] mr-1">
            <BPButton bp="desktop" active={studio.breakpoint === "desktop"} onClick={studio.setBreakpoint} label="Desktop (1)">
              <Monitor className="h-4 w-4" strokeWidth={1.75} />
            </BPButton>
            <BPButton bp="tablet" active={studio.breakpoint === "tablet"} onClick={studio.setBreakpoint} label="Tablet (2)">
              <Tablet className="h-4 w-4" strokeWidth={1.75} />
            </BPButton>
            <BPButton bp="mobile" active={studio.breakpoint === "mobile"} onClick={studio.setBreakpoint} label="Mobil (3)">
              <Smartphone className="h-4 w-4" strokeWidth={1.75} />
            </BPButton>
          </div>

          <button
            type="button"
            aria-label="Zpět (⌘Z)"
            title="Zpět (⌘Z)"
            disabled={!state.canUndo}
            onClick={state.undo}
            className="flex h-[31px] w-[31px] items-center justify-center rounded text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 transition-colors duration-100"
          >
            <Undo2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Vpřed (⌘⇧Z)"
            title="Vpřed (⌘⇧Z)"
            disabled={!state.canRedo}
            onClick={state.redo}
            className="flex h-[31px] w-[31px] items-center justify-center rounded text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 transition-colors duration-100"
          >
            <Redo2 className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div className="h-[22px] w-px bg-[var(--vs-border)] mx-1" />

          <a
            href={`/demo/${state.tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Veřejný náhled"
            title="Veřejný náhled"
            className="flex h-[31px] w-[31px] items-center justify-center rounded text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
          </a>

          <div className="h-[22px] w-px bg-[var(--vs-border)] mx-1" />

          <div className="flex items-center" data-tour-id="topbar-publish">
            <GoLiveButton state={state} />
          </div>
        </div>

      </div>
    </header>
  );
}

function BPButton({
  bp, active, onClick, label, children,
}: {
  bp: StudioBreakpoint;
  active: boolean;
  onClick: (b: StudioBreakpoint) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => onClick(bp)}
      className={clsx(
        "flex h-[26px] w-[31px] items-center justify-center rounded transition-[background,color] duration-100",
        active
          ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
          : "text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
      )}
    >
      {children}
    </button>
  );
}
