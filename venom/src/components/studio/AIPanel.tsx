"use client";

import { useState } from "react";
import { X, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useStudio } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";

type Mode = "professional" | "shorten" | "cta" | "translate-en" | "friendlier" | "expand";

interface ModeOption {
  id: Mode;
  label: string;
  emoji: string;
  hint: string;
}

const MODES: ModeOption[] = [
  { id: "professional", label: "Profesionálněji",  emoji: "💼", hint: "Přepíše text formálněji a přesvědčivěji" },
  { id: "shorten",      label: "Zkrátit",           emoji: "✂️",  hint: "Zkrátí text na polovinu" },
  { id: "cta",          label: "Navrhni CTA",       emoji: "⚡",  hint: "3 varianty výzvy k akci" },
  { id: "translate-en", label: "Přeložit EN",       emoji: "🌐", hint: "Přeloží do angličtiny" },
  { id: "friendlier",   label: "Přátelštěji",       emoji: "😊", hint: "Méně formální tón" },
  { id: "expand",       label: "Rozšířit",           emoji: "📝", hint: "Přidá 1-2 věty navíc" },
];

export function AIPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<Mode>("professional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleRewrite() {
    if (!inputText.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/ai/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, mode }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Chyba"); return; }
      setResult(data.result ?? "");
    } catch {
      setError("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="fixed bottom-[52px] right-[20px] z-[200] w-[360px] rounded-2xl border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] shadow-[0_8px_40px_rgba(0,0,0,.55)] overflow-hidden vs-enter flex flex-col max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--vs-border)] px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#a78bfa]" strokeWidth={1.75} />
          <span className="text-[13.5px] font-semibold text-[var(--vs-text)]">Pomocník AI</span>
        </div>
        <button
          type="button"
          onClick={() => studio.setAiPanelOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4 overflow-y-auto vs-scroll">
        {/* Input */}
        <div>
          <label className="block text-[11.5px] font-medium text-[var(--vs-text-muted)] mb-1.5">
            Váš text
          </label>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Vložte text, který chcete upravit…"
            rows={4}
            className="w-full rounded-xl bg-[var(--vs-surface)] border border-[var(--vs-border)] px-3 py-2.5 text-[13px] text-[var(--vs-text)] placeholder-[var(--vs-text-muted)] outline-none focus:border-[#6366f1] resize-none transition-colors"
          />
        </div>

        {/* Mode selection */}
        <div>
          <label className="block text-[11.5px] font-medium text-[var(--vs-text-muted)] mb-1.5">
            Co chcete udělat?
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {MODES.map(m => (
              <button
                key={m.id}
                type="button"
                title={m.hint}
                onClick={() => setMode(m.id)}
                className={clsx(
                  "flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-[11.5px] font-medium transition-all",
                  mode === m.id
                    ? "border-[#6366f1] bg-[rgba(129,140,248,0.12)] text-[var(--vs-accent-hi)]"
                    : "border-[var(--vs-border)] text-[var(--vs-text-muted)] hover:border-[var(--vs-border-strong)] hover:text-[var(--vs-text)]"
                )}
              >
                <span className="text-base leading-none">{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Run button */}
        <button
          type="button"
          onClick={handleRewrite}
          disabled={loading || !inputText.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#4338ca] disabled:opacity-40 transition-colors"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generuji…</>
          ) : (
            <><Sparkles className="h-4 w-4" />Upravit text</>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.25)] px-3 py-2.5 text-[12.5px] text-red-400">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl bg-[var(--vs-surface)] border border-[var(--vs-border)] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--vs-border)]">
              <span className="text-[11.5px] font-medium text-[var(--vs-text-muted)]">Výsledek</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
                {copied ? "Zkopírováno" : "Kopírovat"}
              </button>
            </div>
            <div className="px-3 py-2.5 text-[13px] text-[var(--vs-text)] leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
