"use client";

import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Check, Eye, HelpCircle, ChevronDown, Palette,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useStudio, type StudioBreakpoint } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";
import { GoLiveButton } from "./GoLiveButton";
import { ChangeTemplateModal } from "./ChangeTemplateModal";

export function StudioTopBar({ state, onHelp }: { state: StudioState; onHelp: () => void }) {
  const studio = useStudio();
  const [showChangeTemplate, setShowChangeTemplate] = useState(false);
  return (
    <div className="flex h-14 items-center justify-between border-b border-[#27272a] bg-[#0f0f10] px-3">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-[11px] font-bold text-white">W</div>
          <span className="text-sm font-semibold tracking-tight text-white">Webero</span>
        </div>
        <div className="h-5 w-px bg-[#27272a]" />
        <button className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[#d4d4d8] transition-colors duration-150 hover:bg-[#27272a]">
          <span className="truncate max-w-[180px]">{state.tenant.slug}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#71717a]" />
        </button>
      </div>

      {/* Center */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-md bg-[#1a1a1c] p-0.5">
          <BPButton bp="desktop" active={studio.breakpoint === "desktop"} onClick={studio.setBreakpoint} label="Desktop (1)">
            <Monitor className="h-4 w-4" strokeWidth={1.75} />
          </BPButton>
          <BPButton bp="tablet" active={studio.breakpoint === "tablet"} onClick={studio.setBreakpoint} label="Tablet (2)">
            <Tablet className="h-4 w-4" strokeWidth={1.75} />
          </BPButton>
          <BPButton bp="mobile" active={studio.breakpoint === "mobile"} onClick={studio.setBreakpoint} label="Mobile (3)">
            <Smartphone className="h-4 w-4" strokeWidth={1.75} />
          </BPButton>
        </div>
        <div className="h-5 w-px bg-[#27272a]" />
        <IconBtn label="Zpět (Cmd+Z)" disabled={!state.canUndo} onClick={state.undo}>
          <Undo2 className="h-4 w-4" strokeWidth={1.75} />
        </IconBtn>
        <IconBtn label="Vpřed (Cmd+Shift+Z)" disabled={!state.canRedo} onClick={state.redo}>
          <Redo2 className="h-4 w-4" strokeWidth={1.75} />
        </IconBtn>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <SaveStatusPill status={state.saveStatus} />
        <button
          type="button"
          onClick={() => setShowChangeTemplate(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-[#d4d4d8] transition-colors duration-150 hover:bg-[#27272a]"
          title="Změnit šablonu (kontaktní údaje zůstanou)"
        >
          <Palette className="h-4 w-4" strokeWidth={1.75} />
          Změnit design
        </button>
        <IconBtn label="Nápověda (?)" onClick={onHelp}>
          <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
        </IconBtn>
        <a
          href={`/demo/${state.tenant.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-[#d4d4d8] transition-colors duration-150 hover:bg-[#27272a]"
          aria-label="Náhled"
          title="Náhled v novém okně"
        >
          <Eye className="h-4 w-4" strokeWidth={1.75} />
          Náhled
        </a>
        <button
          className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-500"
          aria-label="Uložit změny"
          title="Uložit změny"
          onClick={() => state.flushSave()}
        >
          Uložit
        </button>
        <GoLiveButton state={state} />
      </div>

      {showChangeTemplate && (
        <ChangeTemplateModal state={state} onClose={() => setShowChangeTemplate(false)} />
      )}
    </div>
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
        "flex h-7 w-8 items-center justify-center rounded transition-colors duration-150",
        active ? "bg-[#2a2a2d] text-white" : "text-[#a1a1aa] hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function IconBtn({
  children, label, onClick, disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#a1a1aa] transition-colors duration-150 hover:bg-[#27272a] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function SaveStatusPill({ status }: { status: StudioState["saveStatus"] }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        Ukládám…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
        <Check className="h-3 w-3" strokeWidth={2.25} />
        Uloženo
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Offline
      </span>
    );
  }
  return null;
}
