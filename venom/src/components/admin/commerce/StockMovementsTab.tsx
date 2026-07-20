"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

interface StockMovement {
  id: number; variant_id: number; product_title: string; variant_label: string;
  sku: string | null; delta: number; qty_after: number; reason: string;
  actor_email: string | null; created_at: string;
}

const REASONS: Record<string, string> = {
  manual: "Ruční úprava", order: "Objednávka", return: "Vrácení",
  restock: "Naskladnění", correction: "Korekce", import: "Import",
};

export function StockMovementsTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ movements: StockMovement[]; total: number }>(
        `${base}/stock-movements?page=${page}&perPage=${perPage}`
      );
      setMovements(data.movements);
      setTotal(data.total);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Skladové pohyby</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">Kompletní historie změn skladových zásob — příjem, výdej, korekce.</p>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>
      ) : movements.length === 0 ? (
        <div className={t.emptyStateCls}>
          <p className="text-[14px] text-slate-500">Zatím žádné skladové pohyby.</p>
        </div>
      ) : (
        <>
          <div className={t.tableShellCls}>
            <table className="w-full text-[13px]">
              <thead>
                <tr className={t.tableHeadRowCls}>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Produkt</th>
                  <th className="px-4 py-3">Varianta</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-center">Změna</th>
                  <th className="px-4 py-3 text-center">Stav po</th>
                  <th className="px-4 py-3">Důvod</th>
                  <th className="px-4 py-3">Kdo</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className={t.tableRowCls}>
                    <td className="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap">{fmtDate(m.created_at)}</td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{m.product_title}</td>
                    <td className="px-4 py-3 text-slate-500">{m.variant_label || "Výchozí"}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{m.sku ?? "—"}</td>
                    <td className="px-4 py-3 text-center font-bold tabular-nums">
                      <span className={m.delta > 0 ? "text-emerald-600" : m.delta < 0 ? "text-rose-600" : "text-slate-500"}>
                        {m.delta > 0 ? `+${m.delta}` : m.delta}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums font-semibold">{m.qty_after}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {REASONS[m.reason] ?? m.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-slate-500">{m.actor_email ?? "systém"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-slate-500">
                Stránka {page} z {totalPages} ({total} záznamů)
              </span>
              <div className="flex gap-1.5">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={t.btnGhost}>Předchozí</button>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={t.btnGhost}>Další</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
