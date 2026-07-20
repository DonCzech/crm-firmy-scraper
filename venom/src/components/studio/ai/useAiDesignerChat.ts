"use client";

/**
 * Sdílená logika AI Designér chatu — jeden zdroj pravdy pro Studio AIPanel
 * i fullscreen AI Builder (/demo/<slug>/builder).
 *
 * Hook drží vlákno konverzace (sessionStorage, sdílené mezi Studiem a
 * Builderem), kreditní peněženku, odesílání požadavků, undo per zpráva a
 * dobíjení přes GoPay. UI vrstvy se liší jen v tom, co se stane po aplikaci
 * změn (`onApplied`) — Studio reloadne celou stránku, Builder jen iframe.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ── Typy ─────────────────────────────────────────────────────────────────────

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  requestId?: number;
  applied?: number;
  credits?: number;
  error?: boolean;
  undone?: boolean;
}

export interface ModeInfo { id: string; label: string; credits: number; hint: string }
export interface PackInfo { id: string; label: string; credits: number; priceCzk: number; badge?: string }
export interface LedgerRow { id: number; kind: string; amount: number; note: string | null; created_at: string }

export interface CreditsPayload {
  balance: number;
  packs: PackInfo[];
  modes: ModeInfo[];
  ledger: LedgerRow[];
}

export interface UseAiDesignerChatOptions {
  slug: string;
  /** Po úspěšné aplikaci změn nebo undo (Studio: reload stránky, Builder: reload iframe). */
  onApplied: (messages: ChatMsg[]) => void;
  /** Došly kredity — UI má přepnout na kreditní view. */
  onInsufficientCredits?: () => void;
  /** Před přesměrováním na GoPay bránu (uložení UI stavu). */
  onBeforeTopupRedirect?: () => void;
  /** Kam má GoPay vrátit uživatele po dobití. */
  topupReturnTo?: "studio" | "builder";
}

const threadKey = (slug: string) => `webero-ai-designer-thread:${slug}`;

export function loadThread(slug: string): ChatMsg[] {
  try {
    const raw = sessionStorage.getItem(threadKey(slug));
    return raw ? (JSON.parse(raw) as ChatMsg[]) : [];
  } catch { return []; }
}

export function saveThread(slug: string, msgs: ChatMsg[]) {
  try { sessionStorage.setItem(threadKey(slug), JSON.stringify(msgs.slice(-40))); } catch { /* noop */ }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAiDesignerChat({
  slug,
  onApplied,
  onInsufficientCredits,
  onBeforeTopupRedirect,
  topupReturnTo = "studio",
}: UseAiDesignerChatOptions) {
  const [messages, setMessages] = useState<ChatMsg[]>(() => loadThread(slug));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [undoing, setUndoing] = useState<number | null>(null);
  const [credits, setCredits] = useState<CreditsPayload | null>(null);
  const [payingPack, setPayingPack] = useState<string | null>(null);

  // callbacky v refech, ať send/undo nemění identitu kvůli inline funkcím z UI
  const onAppliedRef = useRef(onApplied);
  onAppliedRef.current = onApplied;
  const onInsufficientRef = useRef(onInsufficientCredits);
  onInsufficientRef.current = onInsufficientCredits;
  const onBeforeTopupRef = useRef(onBeforeTopupRedirect);
  onBeforeTopupRef.current = onBeforeTopupRedirect;

  const balance = credits?.balance ?? null;
  // cena se určuje automaticky (5–30 kr.) — tvrdý blok jen když nestačí ani na nejlevnější úpravu
  const minPrice = useMemo(
    () => Math.min(...(credits?.modes.map((m) => m.credits) ?? [5])),
    [credits]
  );
  const maxPrice = useMemo(
    () => Math.max(...(credits?.modes.map((m) => m.credits) ?? [30])),
    [credits]
  );
  const insufficient = balance !== null && balance < minPrice;
  const lowBalance = balance !== null && !insufficient && balance < maxPrice;

  const refreshCredits = useCallback(async () => {
    try {
      const res = await fetch(`/api/demo/${slug}/ai/designer/credits`);
      if (res.ok) setCredits((await res.json()) as CreditsPayload);
    } catch { /* noop */ }
  }, [slug]);

  useEffect(() => { void refreshCredits(); }, [refreshCredits]);

  // Návrat z GoPay brány (?ai_credits=success|pending|error)
  useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("ai_credits");
    if (!status) return;
    const bought = url.searchParams.get("credits");
    const note: ChatMsg = {
      id: `sys-${Date.now()}`,
      role: "assistant",
      text:
        status === "success"
          ? `Kredity dobity — připsáno ${bought ?? ""} kreditů. Můžeme tvořit dál! ✨`
          : status === "pending"
            ? "Platba se ještě zpracovává. Kredity se připíšou automaticky po potvrzení."
            : "Platba se nepodařila. Zkuste to prosím znovu.",
      error: status === "error",
    };
    setMessages((prev) => { const next = [...prev, note]; saveThread(slug, next); return next; });
    url.searchParams.delete("ai_credits");
    url.searchParams.delete("credits");
    window.history.replaceState(null, "", url.toString());
  }, [slug]);

  const send = useCallback(async (promptOverride?: string) => {
    const prompt = (promptOverride ?? "").trim();
    if (!prompt || loading) return;

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", text: prompt };
    let withUser: ChatMsg[] = [];
    setMessages((prev) => {
      withUser = [...prev, userMsg];
      saveThread(slug, withUser);
      return withUser;
    });
    setInput("");
    setLoading(true);

    try {
      const history = withUser
        .filter((m) => !m.error)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await fetch(`/api/demo/${slug}/ai/designer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history: history.slice(0, -1) }),
      });
      const data = await res.json() as {
        requestId?: number; summary?: string; applied?: number; creditsCharged?: number;
        balance?: number; error?: string; message?: string;
      };

      if (!res.ok) {
        const isCredits = data.error === "insufficient_credits";
        const errMsg: ChatMsg = {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: isCredits
            ? "Na tuhle úpravu už nezbývá dost kreditů. Dobijte si balíček a pokračujeme."
            : (data.message ?? "Něco se pokazilo. Kredity vám byly vráceny — zkuste to prosím znovu."),
          error: true,
        };
        const next = [...withUser, errMsg];
        setMessages(next);
        saveThread(slug, next);
        if (typeof data.balance === "number") setCredits((c) => (c ? { ...c, balance: data.balance! } : c));
        if (isCredits) onInsufficientRef.current?.();
        return;
      }

      const okMsg: ChatMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: data.summary ?? "Hotovo.",
        requestId: data.requestId,
        applied: data.applied,
        credits: data.creditsCharged,
      };
      const next = [...withUser, okMsg];
      setMessages(next);
      saveThread(slug, next);
      if (typeof data.balance === "number") setCredits((c) => (c ? { ...c, balance: data.balance! } : c));

      if ((data.applied ?? 0) > 0) {
        onAppliedRef.current(next);
      }
    } catch {
      const errMsg: ChatMsg = {
        id: `a-${Date.now()}`, role: "assistant",
        text: "Síťová chyba — kredity byly vráceny. Zkuste to prosím znovu.", error: true,
      };
      const next = [...withUser, errMsg];
      setMessages(next);
      saveThread(slug, next);
    } finally {
      setLoading(false);
    }
  }, [slug, loading]);

  const undo = useCallback(async (msg: ChatMsg) => {
    if (!msg.requestId || undoing) return;
    setUndoing(msg.requestId);
    try {
      const res = await fetch(`/api/demo/${slug}/ai/designer/undo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: msg.requestId }),
      });
      if (res.ok) {
        let next: ChatMsg[] = [];
        setMessages((prev) => {
          next = prev.map((m) => (m.id === msg.id ? { ...m, undone: true } : m));
          saveThread(slug, next);
          return next;
        });
        onAppliedRef.current(next);
      }
    } finally {
      setUndoing(null);
    }
  }, [slug, undoing]);

  const buy = useCallback(async (pack: PackInfo) => {
    if (payingPack) return;
    setPayingPack(pack.id);
    try {
      const res = await fetch(`/api/demo/${slug}/ai/designer/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: pack.id, returnTo: topupReturnTo }),
      });
      const data = await res.json() as { url?: string };
      if (res.ok && data.url) {
        setMessages((prev) => { saveThread(slug, prev); return prev; });
        onBeforeTopupRef.current?.();
        window.location.href = data.url;
        return;
      }
    } catch { /* noop */ }
    setPayingPack(null);
  }, [slug, payingPack, topupReturnTo]);

  /** Přidá systémovou (assistant) zprávu bez volání AI — uvítání, poznámky. */
  const appendMessage = useCallback((msg: ChatMsg) => {
    setMessages((prev) => { const next = [...prev, msg]; saveThread(slug, next); return next; });
  }, [slug]);

  return {
    messages,
    input, setInput,
    loading,
    undoing,
    credits,
    balance,
    minPrice, maxPrice,
    insufficient, lowBalance,
    payingPack,
    refreshCredits,
    send,
    undo,
    buy,
    appendMessage,
  };
}
