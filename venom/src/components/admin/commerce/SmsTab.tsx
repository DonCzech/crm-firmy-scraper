"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

/** Modul „SMS upozornění“ — outbox SMS zpráv posílaných triggery objednávek. */

interface SmsRow {
  id: number; order_id: number | null; order_number: string | null;
  to_phone: string; message: string; trigger: string; status: string;
  sent_at: string | null; created_at: string;
}
interface SmsStats { total: number; last30d: number; by_trigger: { trigger: string; count: number }[] }

const TRIGGER_LABELS: Record<string, string> = {
  confirmed: "Potvrzeno",
  processing: "Připravuje se",
  shipped: "Odesláno",
  completed: "Doručeno",
  cancelled: "Storno",
  paid: "Platba přijata",
};

export function SmsTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [messages, setMessages] = useState<SmsRow[]>([]);
  const [stats, setStats] = useState<SmsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ messages: SmsRow[]; stats: SmsStats }>(`${base}/sms`);
      setMessages(data.messages);
      setStats(data.stats);
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>SMS upozornění</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">
          SMS se odesílají automaticky při změně stavu objednávky (potvrzeno, odesláno, doručeno, storno) a při přijetí platby.
          Podmínkou je telefon u objednávky.
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${t.sectionCls} !p-4`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Celkem odesláno</div>
          <div className="mt-1 text-[24px] font-bold tabular-nums text-slate-900">{stats?.total ?? "…"}</div>
        </div>
        <div className={`${t.sectionCls} !p-4`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Posledních 30 dní</div>
          <div className="mt-1 text-[24px] font-bold tabular-nums text-slate-900">{stats?.last30d ?? "…"}</div>
        </div>
        <div className={`${t.sectionCls} !p-4`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Nejčastější trigger</div>
          <div className="mt-1 text-[16px] font-bold text-slate-900">
            {stats?.by_trigger[0] ? `${TRIGGER_LABELS[stats.by_trigger[0].trigger] ?? stats.by_trigger[0].trigger} (${stats.by_trigger[0].count}×)` : "—"}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>
      ) : messages.length === 0 ? (
        <p className={`${t.sectionCls} py-10 text-center text-[13.5px] text-slate-400`}>
          Zatím žádné SMS — změňte stav objednávky s vyplněným telefonem a zpráva se objeví zde.
        </p>
      ) : (
        <div className={`${t.sectionCls} overflow-x-auto !p-0`}>
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <th className="px-4 py-3">Objednávka</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Trigger</th>
                <th className="px-4 py-3">Zpráva</th>
                <th className="px-4 py-3">Odesláno</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 last:border-0 align-top">
                  <td className="px-4 py-3 font-semibold text-slate-900">{m.order_number ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{m.to_phone}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-600">
                      {TRIGGER_LABELS[m.trigger] ?? m.trigger}
                    </span>
                  </td>
                  <td className="max-w-[380px] px-4 py-3 text-slate-600">{m.message}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(m.sent_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
