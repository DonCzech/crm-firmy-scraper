"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ErrorBanner, useCommerceTheme } from "./shared";

interface LoyaltyStats {
  total_accounts: number;
  points_in_circulation: number;
  tiers: { bronze: number; silver: number; gold: number; platinum: number };
}

const TIERS: Array<{ key: keyof LoyaltyStats["tiers"]; label: string; color: string; threshold: string }> = [
  { key: "bronze", label: "Bronze", color: "#CD7F32", threshold: "0" },
  { key: "silver", label: "Silver", color: "#C0C0C0", threshold: "500" },
  { key: "gold", label: "Gold", color: "#FFD700", threshold: "2 000" },
  { key: "platinum", label: "Platinum", color: "#E5E4E2", threshold: "5 000" },
];

export function LoyaltyTab({ base, currency }: { base: string; currency: string }) {
  const t = useCommerceTheme();
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<LoyaltyStats>(`${base}/loyalty/stats`);
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Naciteni selhalo");
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  const tierTotal = stats ? stats.tiers.bronze + stats.tiers.silver + stats.tiers.gold + stats.tiers.platinum : 0;

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Vernostni program</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">Prehled vernostniho programu a rozlozeni zakazniku v tierech.</p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Nacitam statistiky...</p>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={t.cardCls}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Celkem uctu</div>
              <div className={`mt-2 text-[28px] font-bold tabular-nums ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>
                {stats.total_accounts.toLocaleString("cs-CZ")}
              </div>
            </div>
            <div className={t.cardCls}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Body v obehu</div>
              <div className={`mt-2 text-[28px] font-bold tabular-nums ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>
                {stats.points_in_circulation.toLocaleString("cs-CZ")}
              </div>
            </div>
            <div className={t.cardCls}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aktivnich tieru</div>
              <div className={`mt-2 text-[28px] font-bold tabular-nums ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>
                {tierTotal.toLocaleString("cs-CZ")}
              </div>
            </div>
          </div>

          <div className={t.sectionCls}>
            <h3 className={t.sectionTitleCls}>Rozlozeni tieru</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TIERS.map((tier) => {
                const count = stats.tiers[tier.key];
                const pct = tierTotal > 0 ? Math.round((count / tierTotal) * 100) : 0;
                return (
                  <div key={tier.key} className={`${t.cardCls} relative overflow-hidden`}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold"
                        style={{ backgroundColor: tier.color, color: tier.key === "gold" || tier.key === "platinum" ? "#1a1a1a" : "#fff" }}
                      >
                        {tier.label[0]}
                      </span>
                      <div>
                        <div className={`text-[13px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>{tier.label}</div>
                        <div className="text-[11px] text-slate-400">od {tier.threshold} bodu</div>
                      </div>
                    </div>
                    <div className={`text-[22px] font-bold tabular-nums ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>
                      {count.toLocaleString("cs-CZ")}
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/60 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: tier.color }} />
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 tabular-nums">{pct} %</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      <div className={t.sectionCls}>
        <h3 className={t.sectionTitleCls}>Pravidla programu</h3>
        <div className="space-y-3 text-[13px]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={t.cardCls}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ziskavani bodu</div>
              <p className={`${t.design === "studio" ? "text-slate-300" : "text-slate-600"}`}>
                Za kazdou utracenou <strong>1 Kc</strong> zakaznik ziska <strong>1 bod</strong>.
                Body se prictou po dokonceni objednavky.
              </p>
            </div>
            <div className={t.cardCls}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Uplatneni bodu</div>
              <p className={`${t.design === "studio" ? "text-slate-300" : "text-slate-600"}`}>
                Body lze uplatnit jako slevu na dalsi nakup.
                Zakaznik si zvolí kolik bodu chce vyuzit pri checkoutu.
              </p>
            </div>
          </div>
          <div className={t.cardCls}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Urovne (tiery)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase text-slate-400 border-b border-slate-200">
                    <th className="px-2 py-1.5 font-semibold">Tier</th>
                    <th className="px-2 py-1.5 font-semibold text-right">Prah (body)</th>
                    <th className="px-2 py-1.5 font-semibold">Vyhody</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Bronze", color: "#CD7F32", pts: "0", perks: "Zakladni sbirani bodu" },
                    { label: "Silver", color: "#C0C0C0", pts: "500", perks: "2x body, prednostni podpora" },
                    { label: "Gold", color: "#FFD700", pts: "2 000", perks: "3x body, exkluzivni nabidky" },
                    { label: "Platinum", color: "#E5E4E2", pts: "5 000", perks: "5x body, VIP pristup, doprava zdarma" },
                  ].map((r) => (
                    <tr key={r.label} className="border-t border-slate-100">
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                          <span className={`font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>{r.label}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-slate-600">{r.pts}</td>
                      <td className="px-2 py-2 text-slate-500">{r.perks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
