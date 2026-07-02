"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { StudioState } from "../TenantStudioView";

/**
 * Studio Design tokens — flexible per-tenant key/value store.
 *
 * Tokens are persisted via `POST /api/demo/<slug>/design-tokens`, which mirrors
 * the merged object into every section's `settings.designTokens` so the public
 * render and the in-editor canvas both pick changes up immediately.
 *
 * The 11 brand tokens (colorPrimary, fontHeading, …) are strictly validated.
 * Extended keys used by the Design panel (header.padding.h, typography.baseSize,
 * …) are stored as free-form strings/numbers/booleans.
 */
type TokenValue = string | number | boolean | null;

interface Ctx {
  tokens: Record<string, TokenValue>;
  loading: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  get: <T extends TokenValue = string>(key: string, fallback: T) => T;
  set: (patch: Record<string, TokenValue>) => void;
  /**
   * Clear every token whose key matches any of the given prefixes (entries
   * ending with "." prefix-match, bare entries exact-match). Reverts the
   * affected panel back to the template's built-in defaults.
   */
  reset: (prefixes: string[]) => void;
  /** Clear every persisted token — reverts the whole site to template defaults. */
  resetAll: () => void;
  /** Start draft mode — snapshot current tokens. Changes are live on canvas but not saved. */
  enterDraftMode: () => void;
  /** Persist draft changes to server and exit draft mode. */
  commitDraft: () => void;
  /** Discard draft changes, restore snapshot, and exit draft mode. */
  revertDraft: () => void;
  isDraft: boolean;
}

const TokensCtx = createContext<Ctx | null>(null);

export function DesignTokensProvider({
  state,
  children,
}: {
  state: StudioState;
  children: ReactNode;
}) {
  const tenantSlug = state.tenant.slug;
  // Initialize from the section the editor already loaded — this guarantees
  // the in-canvas tokens (state.sections[0].settings.designTokens) and the
  // panel's UI start in sync without a roundtrip.
  const initialTokens = useMemo(() => {
    const fromSection = (state.sections[0]?.settings as { designTokens?: Record<string, TokenValue> } | undefined)?.designTokens;
    return fromSection ?? {};
  }, [state.sections]);
  const [tokens, setTokens] = useState<Record<string, TokenValue>>(initialTokens);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<Ctx["saveState"]>("idle");
  const pendingRef = useRef<Record<string, TokenValue>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraftRef = useRef(false);
  const [isDraft, setIsDraft] = useState(false);
  /** Snapshot of tokens at the moment enterDraftMode() was called. */
  const draftSnapshotRef = useRef<Record<string, TokenValue> | null>(null);
  // Stable ref to updateSectionLocal so callbacks don't rebuild on every render.
  const updateLocalRef = useRef(state.updateSectionLocal);
  updateLocalRef.current = state.updateSectionLocal;
  const sectionsRef = useRef(state.sections);
  sectionsRef.current = state.sections;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/demo/${tenantSlug}/design-tokens`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { tokens: Record<string, TokenValue> };
        if (cancelled) return;
        // Merge API result with local initial — local wins on conflict so we
        // don't clobber unsaved edits during the initial load roundtrip.
        setTokens(prev => ({ ...(json.tokens ?? {}), ...prev }));
      } catch {
        /* keep initialTokens */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tenantSlug]);

  const flush = useCallback(async () => {
    const patch = pendingRef.current;
    pendingRef.current = {};
    if (Object.keys(patch).length === 0) return;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/design-tokens`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaveState("saved");
      setTimeout(() => setSaveState(s => (s === "saved" ? "idle" : s)), 1200);
    } catch {
      setSaveState("error");
    }
  }, [tenantSlug]);

  const set = useCallback((patch: Record<string, TokenValue>) => {
    setTokens(prev => {
      const next = { ...prev, ...patch };
      // Immediate canvas update — always, even in draft mode (live preview).
      const sections = sectionsRef.current;
      for (const s of sections) {
        const currentSettings = (s.settings ?? {}) as Record<string, unknown>;
        const newSettings = { ...currentSettings, designTokens: next };
        updateLocalRef.current(s.id, { settings: newSettings });
      }
      return next;
    });
    // In draft mode: accumulate pending but do NOT start save timer.
    // Server save happens only on commitDraft().
    pendingRef.current = { ...pendingRef.current, ...patch };
    if (!isDraftRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { void flush(); }, 500);
    }
  }, [flush]);

  const reset = useCallback((prefixes: string[]) => {
    if (!prefixes.length) return;
    const matches = (k: string) =>
      prefixes.some(p => (p.endsWith(".") ? k.startsWith(p) : k === p));
    const patch: Record<string, TokenValue> = {};
    for (const k of Object.keys(tokens)) {
      if (matches(k)) patch[k] = null;
    }
    if (Object.keys(patch).length === 0) return;
    set(patch);
  }, [tokens, set]);

  const resetAll = useCallback(() => {
    const patch: Record<string, TokenValue> = {};
    for (const k of Object.keys(tokens)) patch[k] = null;
    if (Object.keys(patch).length === 0) return;
    set(patch);
  }, [tokens, set]);

  const enterDraftMode = useCallback(() => {
    isDraftRef.current = true;
    setIsDraft(true);
    draftSnapshotRef.current = { ...tokens };
    pendingRef.current = {};
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  // tokens intentionally omitted — snapshot is taken once at call time
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitDraft = useCallback(() => {
    isDraftRef.current = false;
    setIsDraft(false);
    draftSnapshotRef.current = null;
    // Flush everything accumulated during draft mode
    void flush();
  }, [flush]);

  const revertDraft = useCallback(() => {
    const snap = draftSnapshotRef.current;
    isDraftRef.current = false;
    setIsDraft(false);
    draftSnapshotRef.current = null;
    pendingRef.current = {};
    if (!snap) return;
    // Restore snapshot to state and canvas
    setTokens(snap);
    const sections = sectionsRef.current;
    for (const s of sections) {
      const currentSettings = (s.settings ?? {}) as Record<string, unknown>;
      updateLocalRef.current(s.id, { settings: { ...currentSettings, designTokens: snap } });
    }
  }, []);

  const value = useMemo<Ctx>(() => ({
    tokens,
    loading,
    saveState,
    isDraft,
    get: <T extends TokenValue = string>(key: string, fallback: T) => {
      const v = tokens[key];
      return (v === undefined || v === null ? fallback : (v as T));
    },
    set,
    reset,
    resetAll,
    enterDraftMode,
    commitDraft,
    revertDraft,
  }), [tokens, loading, saveState, isDraft, set, reset, resetAll, enterDraftMode, commitDraft, revertDraft]);

  return <TokensCtx.Provider value={value}>{children}</TokensCtx.Provider>;
}

export function useDesignTokens() {
  const ctx = useContext(TokensCtx);
  if (!ctx) throw new Error("useDesignTokens must be used inside <DesignTokensProvider>");
  return ctx;
}
