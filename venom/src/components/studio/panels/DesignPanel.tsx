"use client";

import { ChevronDown, ChevronRight, RotateCcw } from "@/components/studio/icons";
import { useState } from "react";
import { DESIGN_TREE } from "../design/registry";
import { DesignPopup } from "../design/DesignPopup";
import { DesignTokensProvider, useDesignTokens } from "../design/DesignTokensContext";
import type { StudioState } from "../TenantStudioView";

/**
 * Studio → Design panel.
 *
 * Left-side nested menu mirroring `prace/webero-studio/design/*.pdf`:
 * groups (OBECNÉ / LAYOUT / OBSAH / OSTATNÍ) → branches (Hlavička, …) →
 * leaves (Obecné, Hlavní navigace, …). Click a leaf to open the floating
 * popup panel anchored to the right of the menu column.
 */
export function DesignPanel({ state }: { state: StudioState }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ hlavicka: true });
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <DesignTokensProvider state={state}>
      <div className="vs-enter flex h-full flex-col">
        <div className="flex-1 overflow-y-auto vs-scroll">
        {DESIGN_TREE.map(group => (
          <div key={group.label} className="pt-4 pb-1">
            <div className="px-4 pb-1.5 text-[10px] font-bold tracking-[0.10em] text-[var(--vs-text-dim)] uppercase">
              {group.label}
            </div>
            {group.items.map(node => {
              const hasChildren = !!node.children?.length;
              if (!hasChildren) {
                const active = openId === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setOpenId(active ? null : node.id)}
                    className={`flex w-full items-center justify-between px-4 py-[7px] text-[13px] text-left transition-colors duration-100 ${
                      active
                        ? "bg-[var(--vs-surface-2)] text-[var(--vs-text)]"
                        : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
                    }`}
                  >
                    {node.label}
                  </button>
                );
              }
              const isOpen = !!expanded[node.id];
              return (
                <div key={node.id}>
                  <button
                    type="button"
                    onClick={() => toggle(node.id)}
                    className="flex w-full items-center justify-between px-4 py-[7px] text-[13px] text-[var(--vs-text-soft)] text-left transition-colors duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
                    aria-expanded={isOpen}
                  >
                    {node.label}
                    {isOpen
                      ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--vs-text-dim)]" strokeWidth={2} />
                      : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--vs-text-dim)]" strokeWidth={2} />}
                  </button>
                  {isOpen && node.children?.map(leaf => {
                    const active = openId === leaf.id;
                    return (
                      <button
                        key={leaf.id}
                        type="button"
                        onClick={() => setOpenId(active ? null : leaf.id)}
                        className={`flex w-full items-center px-4 py-[6px] pl-7 text-[12.5px] text-left transition-colors duration-100 ${
                          active
                            ? "bg-[var(--vs-surface-2)] text-[var(--vs-text)]"
                            : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]"
                        }`}
                      >
                        {leaf.label}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
          <div className="h-4" />
        </div>
        <ResetAllFooter />
      </div>
      <DesignPopup openId={openId} onClose={() => setOpenId(null)} />
    </DesignTokensProvider>
  );
}

/**
 * Bottom-of-panel button that wipes every persisted design token, reverting
 * the whole site back to its template defaults. Disabled when nothing has
 * been customized yet to avoid accidental "save empty" round-trips.
 */
function ResetAllFooter() {
  const { tokens, resetAll } = useDesignTokens();
  const hasCustom = Object.values(tokens).some(v => v !== null && v !== undefined && v !== "");
  function onClick() {
    if (!hasCustom) return;
    const ok = typeof window !== "undefined"
      ? window.confirm("Vrátit celý design na výchozí hodnoty šablony? Tato akce smaže všechny vlastní úpravy designu.")
      : true;
    if (ok) resetAll();
  }
  return (
    <div className="shrink-0 border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-2">
      <button
        type="button"
        onClick={onClick}
        disabled={!hasCustom}
        title={hasCustom ? "Vrátí celý design na výchozí hodnoty šablony" : "Žádné vlastní úpravy"}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-3 py-2 text-[12px] font-medium text-[var(--vs-text-soft)] transition-colors hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Resetovat celý design
      </button>
    </div>
  );
}
