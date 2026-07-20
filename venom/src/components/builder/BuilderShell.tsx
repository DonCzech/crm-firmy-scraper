"use client";

/**
 * AI Builder — „Postavit cokoliv" konverzační stavba webu.
 *
 * Není to samostatná appka ani fullscreen: je to slide-out DRAWER, který
 * vyjíždí zleva vedle railu Studia (/demo/<slug>/admin?builder=1). Živým
 * náhledem je přímo canvas editoru vpravo — po každé aplikované změně se
 * stránka Studia obnoví (URL ?builder=1 drawer zase otevře a vlákno
 * konverzace přežívá v sessionStorage).
 *
 * Bezpečnost: žádná nová AI plocha — všechno jde přes existující
 * /api/demo/<slug>/ai/designer (Zod operace, tenant-scoped, kreditní hold).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  Sparkles, Loader2, Undo2, Check, AlertCircle, ArrowUp, CreditCard, X,
  Layout, Palette, Plus, Rocket,
} from "@/components/studio/icons";
import "@/components/studio/design-tokens.css";
import {
  useAiDesignerChat, type ChatMsg,
} from "@/components/studio/ai/useAiDesignerChat";
import { CreditsView } from "@/components/studio/ai/CreditsView";

// ── Pomocné konstanty ────────────────────────────────────────────────────────

/** Klíč, pod kterým onboarding předává první zadání („brief") do builderu. */
export const builderBriefKey = (slug: string) => `webero-builder-brief:${slug}`;

const QUICK_ACTIONS: Array<{ icon: typeof Plus; label: string; prompt: string }> = [
  { icon: Plus, label: "Přidat stránku", prompt: "Přidej stránku O nás s krátkým představením a fotkou týmu, a odkaz na ni do menu." },
  { icon: Palette, label: "Změnit barvy", prompt: "Navrhni nové barevné schéma celého webu — moderní, profesionální a konzistentní." },
  { icon: Layout, label: "Přeskládat sekce", prompt: "Přeskládej sekce na homepage tak, aby stránka lépe vedla návštěvníka ke kontaktu." },
  { icon: Rocket, label: "Udělat e-shop", prompt: "Udělej z webu e-shop — zapni obchod a vytvoř první 3 produkty odpovídající zaměření webu." },
];

const BUILDING_STATUSES = [
  "Rozmýšlím strukturu a rozvržení…",
  "Píšu texty na míru…",
  "Ladím barvy a typografii…",
  "Skládám sekce dohromady…",
  "Dolaďuju detaily a responzivitu…",
];

// ── Komponenta ───────────────────────────────────────────────────────────────

export function BuilderShell({
  slug,
  projectName,
  onClose,
}: {
  slug: string;
  projectName: string;
  /** Zavření draweru — stav webu je vždy čerstvý (apply = reload stránky). */
  onClose: () => void;
}) {
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [reloading, setReloading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const briefSentRef = useRef(false);

  const {
    messages, input, setInput, loading, undoing, credits, balance,
    minPrice, maxPrice, insufficient, lowBalance, payingPack,
    send, undo, buy,
  } = useAiDesignerChat({
    slug,
    // Živý náhled = canvas Studia vpravo: po aplikaci změn (i undo) se celá
    // stránka obnoví s čerstvými sekcemi. ?builder=1 v URL drawer zase otevře
    // a konverzace pokračuje (sessionStorage vlákno).
    onApplied: () => {
      setReloading(true);
      window.dispatchEvent(new CustomEvent("venom-studio:toast", {
        detail: { text: "Změny aplikovány — obnovuji náhled…" },
      }));
      setTimeout(() => window.location.reload(), 900);
    },
    onInsufficientCredits: () => setCreditsOpen(true),
    topupReturnTo: "builder",
  });

  const busy = loading || reloading;

  // Zavření draweru — během stavby blokujeme (in-flight request by se ztratil).
  const close = useCallback(() => {
    if (busy) return;
    onClose();
  }, [busy, onClose]);

  // Escape: nejdřív kreditní overlay, pak drawer. Ignorujeme Escape z inputů
  // mimo drawer (např. inline editace textu v canvasu vedle).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const t = e.target as HTMLElement | null;
      const insideDrawer = !!(t && rootRef.current?.contains(t));
      if (!insideDrawer && t?.closest('input,textarea,[contenteditable="true"]')) return;
      if (creditsOpen) { setCreditsOpen(false); return; }
      close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [creditsOpen, close]);

  // První zpráva: onboarding uložil zadání do sessionStorage — pošleme ho
  // automaticky jako první prompt (komplexní build zdarma z welcome bonusu).
  useEffect(() => {
    if (briefSentRef.current) return;
    briefSentRef.current = true;
    let brief: string | null = null;
    try {
      brief = sessionStorage.getItem(builderBriefKey(slug));
      if (brief) sessionStorage.removeItem(builderBriefKey(slug));
    } catch { /* noop */ }
    if (brief && messages.length === 0) void send(brief);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rotující stavové hlášky během stavby
  useEffect(() => {
    if (!loading) { setStatusIdx(0); return; }
    const t = setInterval(() => setStatusIdx((i) => (i + 1) % BUILDING_STATUSES.length), 4000);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const empty = messages.length === 0;

  return (
    <div
      ref={rootRef}
      className="vs-drawer-enter absolute inset-y-0 left-0 z-[85] flex w-full flex-col border-r border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] text-[var(--vs-text)] shadow-[16px_0_48px_rgba(15,10,40,0.18),inset_0_1px_0_var(--vs-chrome-highlight)] sm:left-[55px] sm:w-[400px] sm:max-w-[calc(100vw-120px)]"
    >

      {/* ══ Hlavička draweru ══ */}
      <header className="relative shrink-0 border-b border-[var(--vs-border)]">
        <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(120%_140%_at_0%_0%,rgba(139,92,246,0.16),transparent_60%)]" />
        <div className="relative flex items-center gap-2.5 px-3.5 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_4px_14px_rgba(124,58,237,0.35)]">
            <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold leading-tight">{projectName}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--vs-text-muted)]">
              {loading ? (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
                  </span>
                  AI staví…
                </>
              ) : (
                <>AI Builder</>
              )}
            </div>
          </div>

          {/* Kredity */}
          <button
            type="button"
            onClick={() => setCreditsOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--vs-border)] bg-[var(--vs-surface)] px-2.5 py-1.5 text-[12px] font-medium hover:border-[var(--vs-border-strong)] transition-colors"
            title="Kredity a dobití"
          >
            <CreditCard className="h-3.5 w-3.5 text-[var(--vs-text-muted)]" strokeWidth={1.75} />
            {balance === null ? "…" : `${balance} kr.`}
          </button>

          {/* Zavřít — konverzace zůstane uložená */}
          <button
            type="button"
            onClick={close}
            disabled={busy}
            title={busy ? "AI právě staví — počkejte na dokončení" : "Zavřít AI Builder (Esc)"}
            aria-label="Zavřít AI Builder"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--vs-text-muted)] transition-colors hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-40"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* ══ Konverzace ══ */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto vs-scroll px-4 py-4">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_8px_30px_rgba(124,58,237,0.4)]">
              <Sparkles className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[15px] font-semibold">Postavíme cokoliv</div>
              <p className="mx-auto mt-1 max-w-[300px] text-[12.5px] leading-relaxed text-[var(--vs-text-muted)]">
                Popište, co chcete — web, e-shop, prezentaci. Změny uvidíte
                rovnou v náhledu vedle a vše jde vrátit zpět.
              </p>
            </div>
            <div className="flex w-full flex-col gap-1.5">
              {[
                "Postav mi web pro půjčovnu lodí s ceníkem a rezervačním formulářem",
                "Vytvoř e-shop s ručně šitými batohy — 3 produkty na start",
                "Portfolio pro fotografku — galerie, o mně, kontakt",
              ].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => send(ex)}
                  className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] px-3 py-2.5 text-left text-[12px] text-[var(--vs-text-muted)] hover:border-violet-500/50 hover:text-[var(--vs-text)] transition-colors"
                >
                  „{ex}“
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg: ChatMsg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="ml-10 self-end rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-indigo-600 px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div
                  key={msg.id}
                  className={clsx(
                    "mr-6 self-start rounded-2xl rounded-bl-md border px-3.5 py-2.5 text-[13px] leading-relaxed",
                    msg.error
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-[var(--vs-border)] bg-[var(--vs-surface)]"
                  )}
                >
                  {msg.error && <AlertCircle className="mb-1 h-4 w-4 text-red-400" strokeWidth={1.75} />}
                  <div className={clsx(msg.undone && "line-through opacity-50")}>{msg.text}</div>
                  {(msg.applied ?? 0) > 0 && !msg.undone && (
                    <div className="mt-2 flex items-center gap-2 border-t border-[var(--vs-border)] pt-2">
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-500">
                        <Check className="h-3 w-3" strokeWidth={2} /> {msg.applied} změn
                      </span>
                      {typeof msg.credits === "number" && (
                        <span className="text-[10.5px] text-[var(--vs-text-muted)]">−{msg.credits} kr.</span>
                      )}
                      {msg.requestId && (
                        <button
                          type="button"
                          onClick={() => undo(msg)}
                          disabled={undoing !== null || reloading}
                          className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
                        >
                          {undoing === msg.requestId
                            ? <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
                            : <Undo2 className="h-3 w-3" strokeWidth={2} />}
                          Vrátit
                        </button>
                      )}
                    </div>
                  )}
                  {msg.undone && (
                    <div className="mt-1.5 text-[10.5px] font-medium text-[var(--vs-text-muted)]">Změna vrácena</div>
                  )}
                </div>
              )
            )}
            {loading && (
              <div className="mr-6 flex items-center gap-2.5 self-start rounded-2xl rounded-bl-md border border-[var(--vs-border)] bg-[var(--vs-surface)] px-3.5 py-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
                <span className="text-[12.5px] text-[var(--vs-text-muted)]">{BUILDING_STATUSES[statusIdx]}</span>
              </div>
            )}
            {reloading && (
              <div className="mr-6 flex items-center gap-2.5 self-start rounded-2xl rounded-bl-md border border-emerald-500/25 bg-emerald-500/5 px-3.5 py-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" strokeWidth={2} />
                <span className="text-[12.5px] text-[var(--vs-text-muted)]">Obnovuji náhled s novým vzhledem…</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ Rychlé akce + composer ══ */}
      <div className="shrink-0 border-t border-[var(--vs-border)] p-3">
        {!empty && !busy && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={() => setInput(qa.prompt)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--vs-border)] bg-[var(--vs-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--vs-text-muted)] hover:border-violet-500/50 hover:text-[var(--vs-text)] transition-colors"
              >
                <qa.icon className="h-3 w-3" strokeWidth={1.75} />
                {qa.label}
              </button>
            ))}
          </div>
        )}

        {lowBalance && (
          <button
            type="button"
            onClick={() => setCreditsOpen(true)}
            className="mb-2 flex w-full items-center gap-2 rounded-lg bg-[var(--vs-surface)] px-3 py-1.5 text-left text-[11px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Zbývá {balance} kr. — na větší úpravy (až {maxPrice} kr.) nemusí stačit. Dobít →
          </button>
        )}
        {insufficient && (
          <button
            type="button"
            onClick={() => setCreditsOpen(true)}
            className="mb-2 flex w-full items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-left text-[11.5px] hover:border-amber-500/70 transition-colors"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={1.75} />
            Došly vám kredity — klikněte pro dobití a pokračujte ve stavbě.
          </button>
        )}

        <div className="flex items-end gap-2 rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-2 focus-within:border-violet-500/60 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); }
            }}
            placeholder={empty ? "Popište, co chcete postavit…" : "Co upravíme dál?"}
            rows={2}
            disabled={busy}
            className="max-h-[140px] flex-1 resize-none bg-transparent px-1.5 py-1 text-[13px] leading-relaxed placeholder-[var(--vs-text-muted)] outline-none"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={busy || !input.trim() || insufficient}
            className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
              busy || !input.trim() || insufficient
                ? "bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)]"
                : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:brightness-110"
            )}
            aria-label="Odeslat"
          >
            {busy
              ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              : <ArrowUp className="h-4 w-4" strokeWidth={2} />}
          </button>
        </div>
        <div className="mt-1.5 text-center text-[10px] text-[var(--vs-text-muted)]">
          Powered by Claude · cena dle rozsahu {minPrice}–{maxPrice} kr. · každou změnu lze vrátit
        </div>
      </div>

      {/* ══ Kredity — overlay přes drawer ══ */}
      {creditsOpen && (
        <div className="absolute inset-0 z-[210] flex items-center justify-center bg-black/50 p-4" onClick={() => setCreditsOpen(false)}>
          <div
            className="vs-chrome-card max-h-[85vh] w-full max-w-[360px] overflow-y-auto vs-scroll rounded-2xl border p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[14px] font-semibold">Kredity</div>
              <button
                type="button"
                onClick={() => setCreditsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
                aria-label="Zavřít"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <CreditsView credits={credits} balance={balance} payingPack={payingPack} onBuy={buy} />
          </div>
        </div>
      )}
    </div>
  );
}
