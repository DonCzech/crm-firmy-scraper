"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export interface TrialStatus {
  sub_status: string;
  days_remaining: number;
  trial_ends_at: string | null;
}

/**
 * Small countdown chip rendered inside EditorDock. Polls the subscription
 * endpoint once on mount (no caching — pricing decisions update quickly).
 * Three visual states based on remaining trial days:
 *   • > 7 days  → indigo "Zkušební · N dní"
 *   • ≤ 7 days  → amber  "Zkušební · N dní" + warning glyph
 *   • 0 days    → rose   "Zkušebka skončila"
 *
 * Hidden entirely when subscription is "active" (paid).
 */
export function useTrialStatus(tenantSlug: string): TrialStatus | null {
  const [status, setStatus] = useState<TrialStatus | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/demo/${tenantSlug}/subscription`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        setStatus({
          sub_status: d.sub_status ?? "trial",
          days_remaining: d.days_remaining ?? 0,
          trial_ends_at: d.trial_ends_at ?? null,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [tenantSlug]);
  return status;
}

export function TrialChip({ status }: { status: TrialStatus | null }) {
  if (!status) return null;
  if (status.sub_status === "active") return null;
  const days = status.days_remaining;
  const expired = days <= 0;
  const urgent = days <= 7 && days > 0;

  const palette = expired
    ? { bg: "rgba(244,63,94,0.18)", ring: "rgba(244,63,94,0.45)", fg: "#fda4af" }
    : urgent
      ? { bg: "rgba(245,158,11,0.18)", ring: "rgba(245,158,11,0.45)", fg: "#fcd34d" }
      : { bg: "rgba(129,140,248,0.16)", ring: "rgba(129,140,248,0.40)", fg: "#c7d2fe" };

  const label = expired
    ? "Zkušebka skončila"
    : `Zkušební · ${days} ${days === 1 ? "den" : days < 5 ? "dny" : "dní"}`;

  return (
    <a
      href="/account/billing"
      title={expired
        ? "Zkušební doba skončila — aktivujte předplatné"
        : `Zbývá ${days} dní zdarma. Klik pro aktivaci.`}
      className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[10.5px] font-semibold ring-1 ring-inset transition-transform hover:scale-[1.03]"
      style={{ background: palette.bg, color: palette.fg, boxShadow: `inset 0 0 0 1px ${palette.ring}` }}
    >
      {expired ? <AlertTriangle className="h-3 w-3" strokeWidth={2.25} /> : <Clock className="h-3 w-3" strokeWidth={2} />}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{expired ? "0" : days}</span>
    </a>
  );
}
