"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Wallet, TrendingUp, Briefcase } from "lucide-react";
import { useApi } from "@/lib/useApi";

type PayoutData = {
  month: string;
  deals: {
    id: string;
    title: string;
    price: number | null;
    commission: number | null;
    closedAt: string;
    agent: { id: string; name: string } | null;
    listing: { id: string; title: string } | null;
    client: { id: string; name: string } | null;
  }[];
  agents: { agent: { id: string; name: string; avatar: string | null } | null; deals: number; volume: number; commission: number }[];
  totals: { deals: number; volume: number; commission: number };
};

const fmt = (n: number) => n.toLocaleString("cs-CZ") + " Kc";

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("cs-CZ", { month: "long", year: "numeric" });
}

function shiftMonth(key: string, dir: 1 | -1) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + dir, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function UzaverkyPage() {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const { data, loading } = useApi<PayoutData>(`/api/admin/payouts?month=${month}`);

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Uzaverky</h2>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Mesicni vyuctovani provizi makleru z uzavrenych pripadu</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(shiftMonth(month, -1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--a-border)] text-[var(--a-text-3)] transition-all hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]">
            <ChevronLeft size={15} />
          </button>
          <span className="min-w-[150px] text-center text-[13.5px] font-semibold capitalize text-[var(--a-text)]">{monthLabel(month)}</span>
          <button onClick={() => setMonth(shiftMonth(month, 1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--a-border)] text-[var(--a-text-3)] transition-all hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Briefcase, label: "Uzavrene pripady", value: String(data.totals.deals) },
              { icon: TrendingUp, label: "Objem obchodu", value: fmt(data.totals.volume) },
              { icon: Wallet, label: "Provize celkem", value: fmt(data.totals.commission) },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 text-[var(--a-text-3)]">
                  <s.icon size={14} />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em]">{s.label}</span>
                </div>
                <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[var(--a-text)]">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-card overflow-hidden rounded-2xl">
            <h3 className="border-b border-[var(--a-border)] px-5 py-4 text-[14px] font-semibold text-[var(--a-text)]">Souhrn po maklerich</h3>
            {data.agents.length === 0 ? (
              <p className="px-5 py-8 text-center text-[12.5px] text-[var(--a-text-3)]">V tomto mesici nejsou zadne uzavrene pripady</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr className="border-b border-[var(--a-border)]">
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Makler</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Pripady</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Objem</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Provize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--a-border)]">
                  {data.agents.map((a, i) => (
                    <tr key={a.agent?.id || i} className="hover-row transition-colors">
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-[var(--a-text)]">{a.agent?.name || "Neprirazeno"}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] text-[var(--a-text-2)]">{a.deals}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] text-[var(--a-text-2)]">{fmt(a.volume)}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[var(--a-bronze)]">{fmt(a.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {data.deals.length > 0 && (
            <div className="glass-card overflow-hidden rounded-2xl">
              <h3 className="border-b border-[var(--a-border)] px-5 py-4 text-[14px] font-semibold text-[var(--a-text)]">Uzavrene pripady</h3>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-[var(--a-border)]">
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Pripad</th>
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Makler</th>
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Uzavreno</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Cena</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Provize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--a-border)]">
                  {data.deals.map((d) => (
                    <tr key={d.id} className="hover-row transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-[var(--a-text)]">{d.title}</p>
                        {d.listing && <p className="text-[10.5px] text-[var(--a-text-3)]">{d.listing.title}</p>}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[var(--a-text-2)]">{d.agent?.name || "-"}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[var(--a-text-3)]">{new Date(d.closedAt).toLocaleDateString("cs-CZ")}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] text-[var(--a-text-2)]">{d.price ? fmt(d.price) : "-"}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[var(--a-bronze)]">{d.commission ? fmt(d.commission) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
