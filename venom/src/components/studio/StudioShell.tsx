"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useStudio } from "./StudioContext";
import { StudioTopBar } from "./StudioTopBar";
import { StudioLeftRail } from "./StudioLeftRail";
import { StudioLeftPanel } from "./StudioLeftPanel";
import { StudioCanvas } from "./StudioCanvas";
import { StudioRightPanel } from "./StudioRightPanel";
import type { StudioState } from "./TenantStudioView";

export function StudioShell({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#0a0a0b] text-[#e4e4e7]"
      style={{ fontFeatureSettings: "'cv11', 'ss01'" }}
      onKeyDown={(e) => {
        if (e.key === "?" && !(e.target as HTMLElement)?.isContentEditable) {
          setHelpOpen(true);
        }
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
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden border-r border-[#27272a] bg-[#141416]"
            >
              <div className="w-[280px] h-full">
                <StudioLeftPanel state={state} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 min-w-0 bg-[#1a1a1c]">
          <StudioCanvas state={state} />
        </div>
        <AnimatePresence initial={false}>
          {studio.rightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden border-l border-[#27272a] bg-[#141416]"
            >
              <div className="w-[320px] h-full">
                <StudioRightPanel state={state} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

function SaveErrorBanner({ state }: { state: StudioState }) {
  if (!state.saveError) return null;
  return (
    <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-300">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 font-bold text-red-300">!</span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-red-200">Změny se neuložily do databáze.</div>
          <div className="truncate font-mono text-[11px] text-red-300/80">{state.saveError}</div>
        </div>
        <button
          onClick={state.dismissSaveError}
          className="shrink-0 rounded px-2 py-1 text-[11px] text-red-200 hover:bg-red-500/15"
          type="button"
        >
          Zavřít
        </button>
      </div>
    </div>
  );
}

function HelpOverlay({ onClose }: { onClose: () => void }) {
  const rows: Array<[string, string]> = [
    ["Cmd/Ctrl + Z", "Zpět"],
    ["Cmd/Ctrl + Shift + Z", "Vpřed"],
    ["Cmd/Ctrl + S", "Uložit"],
    ["1 / 2 / 3", "Desktop / Tablet / Mobile"],
    ["?", "Nápověda"],
    ["Esc", "Zrušit výběr"],
  ];
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[420px] rounded-xl border border-[#27272a] bg-[#141416] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Klávesové zkratky</h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-xs text-[#a1a1aa] hover:bg-[#27272a]"
          >
            Esc
          </button>
        </div>
        <div className="space-y-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-md bg-[#1a1a1c] px-3 py-2">
              <kbd className="font-mono text-xs text-[#e4e4e7]">{k}</kbd>
              <span className="text-xs text-[#a1a1aa]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
