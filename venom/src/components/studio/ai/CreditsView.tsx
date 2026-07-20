"use client";

/**
 * Kreditní view AI Designéru — zůstatek, balíčky (GoPay), ceník režimů a
 * poslední pohyby. Sdílené mezi Studio AIPanelem a fullscreen AI Builderem.
 */

import clsx from "clsx";
import { Loader2, Lock } from "@/components/studio/icons";
import type { CreditsPayload, PackInfo } from "./useAiDesignerChat";

interface Props {
  credits: CreditsPayload | null;
  balance: number | null;
  payingPack: string | null;
  onBuy: (pack: PackInfo) => void;
}

export function CreditsView({ credits, balance, payingPack, onBuy }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-4 text-center">
        <div className="text-[11px] uppercase tracking-wide text-[var(--vs-text-muted)]">Zůstatek</div>
        <div className="mt-1 text-[32px] font-bold leading-none text-[var(--vs-text)]">
          {balance ?? "…"} <span className="text-[15px] font-medium text-[var(--vs-text-muted)]">kreditů</span>
        </div>
      </div>

      <div>
        <div className="mb-2 text-[12px] font-semibold text-[var(--vs-text)]">Dobít kredity</div>
        <div className="flex flex-col gap-2">
          {(credits?.packs ?? []).map((pack) => (
            <button
              key={pack.id}
              type="button"
              disabled={payingPack !== null}
              onClick={() => onBuy(pack)}
              className={clsx(
                "group relative flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                "border-[var(--vs-border)] bg-[var(--vs-surface)] hover:border-violet-500/60 hover:shadow-[0_4px_18px_rgba(124,58,237,0.15)]"
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-semibold text-[var(--vs-text)]">{pack.label}</span>
                  {pack.badge && (
                    <span className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {pack.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-[var(--vs-text-muted)]">{pack.credits} kreditů</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[var(--vs-text)]">{pack.priceCzk} Kč</span>
                {payingPack === pack.id
                  ? <Loader2 className="h-4 w-4 animate-spin text-[var(--vs-text-muted)]" strokeWidth={1.75} />
                  : <span className="rounded-lg bg-[var(--vs-surface-2)] px-2 py-1 text-[11px] font-medium text-[var(--vs-text-muted)] group-hover:bg-violet-600 group-hover:text-white transition-colors">GoPay</span>}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-[var(--vs-text-muted)]">
          <Lock className="h-3 w-3" strokeWidth={1.75} />
          Bezpečná platba kartou přes GoPay. Kredity nikdy nepropadnou.
        </div>
      </div>

      <div>
        <div className="mb-2 text-[12px] font-semibold text-[var(--vs-text)]">Kolik úpravy stojí?</div>
        <p className="mb-2 text-[11px] leading-relaxed text-[var(--vs-text-muted)]">
          Rozsah poznáme automaticky z vašeho požadavku — nic nevybíráte, vždy platíte podle skutečné náročnosti.
        </p>
        <div className="flex flex-col gap-1.5">
          {(credits?.modes ?? []).map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg bg-[var(--vs-surface)] px-3 py-2">
              <div>
                <div className="text-[12.5px] font-medium text-[var(--vs-text)]">{m.label}</div>
                <div className="text-[11px] text-[var(--vs-text-muted)]">{m.hint}</div>
              </div>
              <span className="text-[12.5px] font-semibold text-[var(--vs-text)]">{m.credits} kr.</span>
            </div>
          ))}
        </div>
      </div>

      {(credits?.ledger?.length ?? 0) > 0 && (
        <div>
          <div className="mb-2 text-[12px] font-semibold text-[var(--vs-text)]">Poslední pohyby</div>
          <div className="flex flex-col gap-1">
            {credits!.ledger.slice(0, 8).map((row) => (
              <div key={row.id} className="flex items-center justify-between px-1 py-1 text-[11.5px]">
                <span className="truncate text-[var(--vs-text-muted)]">{row.note ?? row.kind}</span>
                <span className={clsx(
                  "ml-2 shrink-0 font-medium",
                  row.amount > 0 ? "text-emerald-500" : row.amount < 0 ? "text-[var(--vs-text)]" : "text-[var(--vs-text-muted)]"
                )}>
                  {row.amount > 0 ? `+${row.amount}` : row.amount !== 0 ? row.amount : "·"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
