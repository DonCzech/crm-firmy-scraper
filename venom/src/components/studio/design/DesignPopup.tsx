"use client";

import { Check, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { findById } from "./registry";
import { useDesignTokens } from "./DesignTokensContext";

interface Props {
  openId: string | null;
  onClose: () => void;
}

/**
 * Floating popup that appears to the right of the left panel (rail+menu),
 * matching the spec PDFs. Body is the panel component bound to `openId`
 * from the design registry. Closes on Esc, on backdrop click, or on the
 * "Hotovo" button.
 */
export function DesignPopup({ openId, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { enterDraftMode, commitDraft, revertDraft } = useDesignTokens();
  const prevOpenId = useRef<string | null>(null);

  // Enter draft mode when popup opens; commit if panel switches without explicit close
  useEffect(() => {
    if (openId && openId !== prevOpenId.current) {
      if (prevOpenId.current) commitDraft(); // switching panels — commit previous
      enterDraftMode();
    }
    prevOpenId.current = openId;
  }, [openId, enterDraftMode, commitDraft]);

  function handleCommitClose() { commitDraft(); onClose(); }
  function handleRevertClose() { revertDraft(); onClose(); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!openId) return;
      if (e.key === "Escape") { handleRevertClose(); return; }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { handleCommitClose(); return; }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  if (!openId || !mounted) return null;
  const found = findById(openId);
  if (!found?.panel) return null;
  const Panel = found.panel;

  // Portal to <body> so the popup escapes the 220px left-panel column
  // (overflow-hidden + .vs-enter transform), which would otherwise clip it.
  return createPortal(
    <div data-studio>
      {/* Backdrop — revert on click-outside */}
      <button
        type="button"
        aria-label="Zavřít"
        onClick={handleRevertClose}
        className="fixed inset-0 z-[55] cursor-default bg-transparent"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-label={found.label}
        className="fixed left-[calc(var(--vs-rail-w)+var(--vs-panel-w)+8px)] top-[calc(var(--vs-topbar-h)+8px)] z-[60] flex w-[300px] max-h-[calc(100vh-var(--vs-topbar-h)-24px)] flex-col rounded-xl border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] shadow-[var(--vs-shadow-xl)]"
        style={{ animation: "vs-fade-in var(--vs-dur-3) var(--vs-ease-out)" }}
      >
        <Header label={found.label} onClose={handleRevertClose} />
        <div className="flex-1 overflow-y-auto vs-scroll px-3.5 py-2">
          <Panel />
        </div>
        <Footer onCommit={handleCommitClose} onRevert={handleRevertClose} prefixes={found.prefixes ?? []} panelLabel={found.label} />
      </div>
    </div>,
    document.body
  );
}

function Header({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[var(--vs-border)] px-3.5 py-2.5">
      <span className="rounded bg-[var(--vs-surface-3)] px-1.5 py-0.5 text-[13px] font-semibold text-[var(--vs-text)]">
        {label}
      </span>
      <SaveDot />
      <button
        type="button"
        onClick={onClose}
        className="-mr-1 grid h-6 w-6 place-items-center rounded text-[var(--vs-text-dim)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SaveDot() {
  const { saveState } = useDesignTokens();
  if (saveState === "saving") return <Loader2 className="h-3 w-3 animate-spin text-[var(--vs-info)]" />;
  if (saveState === "saved")  return <Check    className="h-3 w-3 text-[var(--vs-success)]" />;
  if (saveState === "error")  return <span className="h-2 w-2 rounded-full bg-[var(--vs-danger)]" />;
  return <span className="h-2 w-2 rounded-full bg-transparent" />;
}

function Footer({ onCommit, onRevert, prefixes, panelLabel }: { onCommit: () => void; onRevert: () => void; prefixes: string[]; panelLabel: string }) {
  const { reset } = useDesignTokens();
  function onReset() {
    if (!prefixes.length) return;
    const ok = typeof window !== "undefined"
      ? window.confirm(`Vrátit "${panelLabel}" zpět na výchozí hodnoty šablony?`)
      : true;
    if (!ok) return;
    reset(prefixes);
  }
  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-[var(--vs-border)] p-2">
      <button
        type="button"
        onClick={onRevert}
        title="Zahodit změny (Escape)"
        className="h-9 shrink-0 rounded border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-3 text-[11.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
      >
        Zrušit
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={!prefixes.length}
        title="Vrátit na výchozí hodnoty šablony"
        className="h-9 shrink-0 rounded border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-3 text-[11.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Resetovat
      </button>
      <button
        type="button"
        onClick={onCommit}
        title="Uložit změny (⌘Enter)"
        className="h-9 flex-1 rounded bg-[#6366f1] text-[12.5px] font-semibold text-white hover:bg-[#4f46e5]"
      >
        Hotovo
      </button>
    </div>
  );
}
