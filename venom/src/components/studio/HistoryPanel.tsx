"use client";

/**
 * Historie verzí (Wix-style Site History) — drawer zprava.
 *
 * Zdroj dat: page_revisions (GET/POST /api/demo/[slug]/revisions, restore přes
 * existující POST /api/demo/[slug]/revisions/[id]/restore). Snapshoty vznikají:
 *  - automaticky před každým batch zápisem sekcí (PUT /sections),
 *  - periodicky při editaci (TenantStudioView, à 10 min),
 *  - ručně tlačítkem „Uložit verzi" tady.
 * Obnovení nejdřív uloží aktuální stav jako novou revizi (dělá restore route).
 */

import { useCallback, useEffect, useState } from "react";
import { X, History, Check, Loader2, RotateCcw, Plus } from "@/components/studio/icons";
import { useStudio } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";

interface RevisionRow {
  id: number;
  created_at: string;
  created_by: string | null;
  section_count: number;
}

const CREATED_BY_LABELS: Record<string, string> = {
  manual: "Ruční uložení",
  auto: "Automatické uložení",
  "restore-pre-snapshot": "Před obnovením",
  "pre-clear": "Před vyčištěním",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "právě teď";
  if (min < 60) return `před ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `před ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "včera";
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function HistoryPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [revisions, setRevisions] = useState<RevisionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [snapshotDone, setSnapshotDone] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/revisions?pageId=${state.page.id}`, { cache: "no-store" });
      const data = (await res.json()) as { revisions?: RevisionRow[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRevisions(data.revisions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepodařilo se načíst historii");
    } finally {
      setLoading(false);
    }
  }, [state.tenant.slug, state.page.id]);

  useEffect(() => {
    if (studio.historyPanelOpen) void load();
  }, [studio.historyPanelOpen, load]);

  useEffect(() => {
    if (!studio.historyPanelOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") studio.setHistoryPanelOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio]);

  async function saveSnapshot() {
    setSavingSnapshot(true);
    setError(null);
    try {
      // Nejdřív flush rozpracovaných editů, ať snapshot obsahuje aktuální stav
      await state.flushSave();
      const res = await fetch(`/api/demo/${state.tenant.slug}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: state.page.id, label: "manual" }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setSnapshotDone(true);
      setTimeout(() => setSnapshotDone(false), 2000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Uložení verze selhalo");
    } finally {
      setSavingSnapshot(false);
    }
  }

  async function restore(id: number) {
    setRestoringId(id);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/revisions/${id}/restore`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      // Sekce se změnily pod nohama — plný reload je nejbezpečnější sync
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Obnovení selhalo");
      setRestoringId(null);
    }
  }

  if (!studio.historyPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none vs-enter">
      <div
        className="absolute inset-0 pointer-events-auto bg-black/30"
        onClick={() => studio.setHistoryPanelOpen(false)}
      />

      {/* Drawer zprava */}
      <div
        className="pointer-events-auto absolute right-0 top-0 bottom-0 flex w-full max-w-[380px] flex-col bg-[var(--vs-surface)] border-l border-[var(--vs-surface-2)] shadow-[-4px_0_32px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--vs-surface-2)]">
          <div className="flex items-center gap-2.5">
            <History className="h-[18px] w-[18px] text-[var(--vs-accent-hi)]" weight="duotone" />
            <div>
              <p className="text-[15px] font-bold tracking-tight text-[var(--vs-text)] leading-tight">Historie verzí</p>
              <p className="text-[11px] text-[var(--vs-text-muted)]">{state.page?.title ?? state.page?.slug ?? "Stránka"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => studio.setHistoryPanelOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--vs-text-dim)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-muted)] transition-colors"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Save current version */}
        <div className="px-5 py-3 border-b border-[var(--vs-surface-2)]">
          <button
            type="button"
            onClick={() => void saveSnapshot()}
            disabled={savingSnapshot}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_6px_18px_rgba(var(--vs-cta-rgb),0.3)] transition-[filter] hover:brightness-110 disabled:opacity-60"
            style={{ background: "var(--vs-cta-grad)" }}
          >
            {savingSnapshot ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : snapshotDone ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {snapshotDone ? "Verze uložena" : "Uložit aktuální verzi"}
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 rounded-lg bg-[var(--vs-danger-bg)] px-3 py-2 text-[12px] text-[var(--vs-danger)]">
            {error}
          </div>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto vs-scroll px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--vs-text-dim)]" />
            </div>
          ) : revisions.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[var(--vs-text-dim)]">
              Zatím žádné uložené verze. Verze vznikají automaticky při úpravách,
              nebo je ulož ručně tlačítkem výše.
            </p>
          ) : (
            <ol className="relative space-y-1 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--vs-border-strong)]">
              {revisions.map((rev, idx) => (
                <li key={rev.id} className="group relative pl-6 py-2">
                  <span
                    className={`absolute left-[3px] top-[15px] h-[9px] w-[9px] rounded-full ring-2 ring-[var(--vs-surface)] ${idx === 0 ? "bg-[var(--vs-accent-hi)]" : "bg-[var(--vs-border-strong)]"}`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--vs-text)] leading-tight">
                        {relativeTime(rev.created_at)}
                        {idx === 0 && <span className="ml-2 rounded-full bg-[var(--vs-accent-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--vs-accent-hi)]">nejnovější</span>}
                      </p>
                      <p className="text-[11px] text-[var(--vs-text-dim)]">
                        {CREATED_BY_LABELS[rev.created_by ?? ""] ?? "Před úpravou"} · {rev.section_count} sekcí
                      </p>
                    </div>
                    {confirmId === rev.id ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void restore(rev.id)}
                          disabled={restoringId !== null}
                          className="rounded-md bg-[var(--vs-danger)] px-2 py-1 text-[11px] font-semibold text-[var(--vs-text)] hover:brightness-110 disabled:opacity-60"
                        >
                          {restoringId === rev.id ? "Obnovuji…" : "Opravdu obnovit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="rounded-md px-1.5 py-1 text-[11px] text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)]"
                        >
                          Zrušit
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(rev.id)}
                        className="flex shrink-0 items-center gap-1 rounded-md border border-[var(--vs-border-strong)] px-2 py-1 text-[11px] font-medium text-[var(--vs-text-muted)] opacity-0 transition-opacity hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] group-hover:opacity-100 focus:opacity-100"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Obnovit
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-[var(--vs-surface-2)]">
          <p className="text-[11px] leading-relaxed text-[var(--vs-text-dim)]">
            Před každým obnovením se aktuální stav automaticky uloží jako nová verze —
            o nic nepřijdeš.
          </p>
        </div>
      </div>
    </div>
  );
}
