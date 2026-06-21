"use client";

import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Check, Eye, HelpCircle, Palette, Save,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useStudio, type StudioBreakpoint } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";
import { GoLiveButton } from "./GoLiveButton";
import { ChangeTemplateModal } from "./ChangeTemplateModal";
import { Button, IconButton, Tooltip, Pill, useHotkey } from "./ui";

export function StudioTopBar({ state, onHelp }: { state: StudioState; onHelp: () => void }) {
  const studio = useStudio();
  const [showChangeTemplate, setShowChangeTemplate] = useState(false);

  useHotkey("1", () => studio.setBreakpoint("desktop"));
  useHotkey("2", () => studio.setBreakpoint("tablet"));
  useHotkey("3", () => studio.setBreakpoint("mobile"));
  useHotkey("cmd+z", () => state.canUndo && state.undo());
  useHotkey("cmd+shift+z", () => state.canRedo && state.redo());
  useHotkey("cmd+s", () => { void state.flushSave(); });

  return (
    <header className="flex h-[var(--vs-topbar-h)] shrink-0 items-center justify-between border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3.5">
      {/* Left — brand + tenant */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-md py-1.5 pl-1 pr-2">
          <div className="vs-grad-accent flex h-8 w-8 items-center justify-center rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset,0_8px_18px_rgba(99,102,241,0.40)]">
            <span className="text-[12px] font-bold text-white tracking-tight">W</span>
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-[var(--vs-text)]">Webero</div>
            <div className="text-[9.5px] text-[var(--vs-text-muted)] uppercase tracking-[var(--vs-tracking-wider)]">Studio</div>
          </div>
        </div>
        <div className="h-6 w-px bg-[var(--vs-border)]" />
        <div className="flex items-center gap-1.5">
          <Pill tone="neutral">tenant</Pill>
          <span className="text-[12.5px] font-medium tracking-tight text-[var(--vs-text-soft)]">{state.tenant.slug}</span>
        </div>
      </div>

      {/* Center — viewport switcher + undo/redo */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 rounded-md bg-[var(--vs-surface)] p-0.5 ring-1 ring-[var(--vs-border)]">
          <BPButton bp="desktop" active={studio.breakpoint === "desktop"} onClick={studio.setBreakpoint} label="Desktop">
            <Monitor className="h-3.5 w-3.5" strokeWidth={1.75} />
          </BPButton>
          <BPButton bp="tablet" active={studio.breakpoint === "tablet"} onClick={studio.setBreakpoint} label="Tablet">
            <Tablet className="h-3.5 w-3.5" strokeWidth={1.75} />
          </BPButton>
          <BPButton bp="mobile" active={studio.breakpoint === "mobile"} onClick={studio.setBreakpoint} label="Mobile">
            <Smartphone className="h-3.5 w-3.5" strokeWidth={1.75} />
          </BPButton>
        </div>
        <div className="h-5 w-px bg-[var(--vs-border)] mx-1" />
        <Tooltip label={<span className="flex items-center gap-2">Zpět <kbd className="font-mono text-[9.5px] text-[var(--vs-text-muted)]">⌘Z</kbd></span>}>
          <IconButton size="sm" label="Zpět" disabled={!state.canUndo} onClick={state.undo}>
            <Undo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
        <Tooltip label={<span className="flex items-center gap-2">Vpřed <kbd className="font-mono text-[9.5px] text-[var(--vs-text-muted)]">⌘⇧Z</kbd></span>}>
          <IconButton size="sm" label="Vpřed" disabled={!state.canRedo} onClick={state.redo}>
            <Redo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">
        <SaveStatusPill status={state.saveStatus} />
        <Tooltip label="Změnit šablonu (kontakt zůstane)">
          <Button variant="ghost" size="sm" onClick={() => setShowChangeTemplate(true)} iconLeft={<Palette className="h-3.5 w-3.5" strokeWidth={1.75} />}>
            Změnit design
          </Button>
        </Tooltip>
        <Tooltip label={<span className="flex items-center gap-2">Nápověda <kbd className="font-mono text-[9.5px] text-[var(--vs-text-muted)]">?</kbd></span>}>
          <IconButton size="sm" label="Nápověda" onClick={onHelp}>
            <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
          </IconButton>
        </Tooltip>
        <Tooltip label="Veřejný náhled">
          <a
            href={`/demo/${state.tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium text-[var(--vs-text-soft)] transition-colors duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
            aria-label="Náhled"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            Náhled
          </a>
        </Tooltip>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => state.flushSave()}
          iconLeft={<Save className="h-3.5 w-3.5" strokeWidth={1.75} />}
        >
          Uložit
        </Button>
        <div data-tour-id="topbar-publish">
          <GoLiveButton state={state} />
        </div>
      </div>

      {showChangeTemplate && (
        <ChangeTemplateModal state={state} onClose={() => setShowChangeTemplate(false)} />
      )}
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
        "flex h-6 w-7 items-center justify-center rounded transition-[background,color] duration-100",
        active
          ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
          : "text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
      )}
    >
      {children}
    </button>
  );
}

function SaveStatusPill({ status }: { status: StudioState["saveStatus"] }) {
  if (status === "saving") {
    return (
      <Pill tone="warning" size="sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--vs-warning)]" />
        Ukládám…
      </Pill>
    );
  }
  if (status === "saved") {
    return (
      <Pill tone="success" size="sm">
        <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
        Uloženo
      </Pill>
    );
  }
  if (status === "error") {
    return (
      <Pill tone="danger" size="sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--vs-danger)]" />
        Offline
      </Pill>
    );
  }
  return null;
}
