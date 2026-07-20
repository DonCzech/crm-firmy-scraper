"use client";

import { useCallback, useEffect, useState } from "react";
import { api, czk, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

/** Modul „Velkoobchod (B2B)" — schvalování a správa velkoobchodních partnerů. */

interface Partner {
  id: number;
  email: string;
  company: string;
  ico: string | null;
  dic: string | null;
  phone: string | null;
  note: string | null;
  discount_pct: number;
  status: string;
  created_at: string;
  orders_count: number;
  orders_total_cents: number;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Čeká na schválení", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Schváleno", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Zamítnuto", cls: "bg-rose-100 text-rose-600" },
};

export function WholesaleTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: "", email: "", ico: "", pct: "10" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ partners: Partner[] }>(`${base}/wholesale`);
      setPartners(data.partners);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function post(body: object) {
    setBusy(true);
    setError(null);
    try {
      await api(`${base}/wholesale`, { method: "POST", body: JSON.stringify(body) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Akce selhala");
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    const pct = Math.min(60, Math.max(0, parseFloat(form.pct) || 0));
    await post({ action: "create", email: form.email.trim(), company: form.company.trim(), ico: form.ico.trim() || undefined, discount_pct: pct });
    setForm({ company: "", email: "", ico: "", pct: "10" });
    setShowForm(false);
  }

  const pending = partners.filter((p) => p.status === "pending");
  const approved = partners.filter((p) => p.status === "approved");
  const totalRevenue = approved.reduce((s, p) => s + Number(p.orders_total_cents), 0);

  const inputCls = t.design === "studio"
    ? "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[13px] text-white outline-none focus:border-white/40"
    : "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none focus:border-neutral-400";
  const mut = t.design === "studio" ? "text-white/50" : "text-neutral-500";

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={t.sectionCls}>
          <div className={`text-[12px] font-semibold ${mut}`}>Schválení partneři</div>
          <div className="mt-1 text-[26px] font-extrabold">{approved.length}</div>
        </div>
        <div className={t.sectionCls}>
          <div className={`text-[12px] font-semibold ${mut}`}>Žádosti ke schválení</div>
          <div className={`mt-1 text-[26px] font-extrabold ${pending.length ? "text-amber-500" : ""}`}>{pending.length}</div>
        </div>
        <div className={t.sectionCls}>
          <div className={`text-[12px] font-semibold ${mut}`}>Obrat B2B partnerů</div>
          <div className="mt-1 text-[26px] font-extrabold">{czk(totalRevenue)}</div>
        </div>
      </div>

      <section className={t.sectionCls}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold">Velkoobchodní partneři</h3>
            <p className={`mt-1 text-[12.5px] ${mut}`}>
              Schválenému partnerovi se sleva uplatní automaticky na každou objednávku s jeho e-mailem.
              Registrační formulář: <code className="text-[11.5px]">/obchod/velkoobchod</code>
            </p>
          </div>
          <button type="button" className={t.btnPrimary} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Zavřít" : "+ Přidat partnera"}
          </button>
        </div>

        {showForm && (
          <div className={`mt-4 flex flex-wrap items-end gap-3 rounded-xl border p-4 ${t.design === "studio" ? "border-white/10 bg-white/5" : "border-neutral-200 bg-neutral-50/60"}`}>
            <label className="flex flex-col gap-1 text-[12px] font-semibold">Firma
              <input className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Firma s.r.o." />
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold">E-mail
              <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nakup@firma.cz" />
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold">IČO
              <input className={`${inputCls} w-28`} value={form.ico} onChange={(e) => setForm({ ...form, ico: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold">Sleva %
              <input className={`${inputCls} w-20`} type="number" min={0} max={60} value={form.pct} onChange={(e) => setForm({ ...form, pct: e.target.value })} />
            </label>
            <button type="button" className={t.btnPrimary} disabled={busy || form.company.trim().length < 2 || !form.email.includes("@")} onClick={create}>
              {busy ? "Ukládám…" : "Vytvořit (rovnou schválený)"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="mt-3 text-[13px] opacity-60">Načítám…</p>
        ) : partners.length === 0 ? (
          <p className="mt-3 text-[13px] opacity-60">Zatím žádní partneři. Zákazníci se mohou registrovat na stránce Velkoobchod.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className={`text-[11px] uppercase tracking-wide ${mut}`}>
                  <th className="pb-2 pr-3">Firma</th>
                  <th className="pb-2 pr-3">E-mail</th>
                  <th className="pb-2 pr-3">IČO</th>
                  <th className="pb-2 pr-3">Sleva</th>
                  <th className="pb-2 pr-3">Stav</th>
                  <th className="pb-2 pr-3">Objednávky</th>
                  <th className="pb-2 pr-3">Registrace</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className={t.design === "studio" ? "divide-y divide-white/8" : "divide-y divide-neutral-100"}>
                {partners.map((p) => {
                  const st = STATUS_LABELS[p.status] ?? STATUS_LABELS.pending;
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold">{p.company}</div>
                        {p.note && <div className={`max-w-[260px] truncate text-[11.5px] ${mut}`} title={p.note}>{p.note}</div>}
                      </td>
                      <td className="py-2.5 pr-3">{p.email}</td>
                      <td className="py-2.5 pr-3">{p.ico ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <input
                          className={`${inputCls} w-16 py-1 text-center`}
                          type="number" min={0} max={60} defaultValue={p.discount_pct}
                          disabled={busy}
                          onBlur={(e) => {
                            const v = Math.min(60, Math.max(0, parseFloat(e.target.value) || 0));
                            if (v !== p.discount_pct) post({ action: "update", id: p.id, discount_pct: v });
                          }}
                        /> %
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="py-2.5 pr-3">
                        {p.orders_count > 0 ? `${p.orders_count}× · ${czk(Number(p.orders_total_cents))}` : "—"}
                      </td>
                      <td className={`py-2.5 pr-3 text-[12px] ${mut}`}>{fmtDate(p.created_at)}</td>
                      <td className="py-2.5">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          {p.status !== "approved" && (
                            <button type="button" className={t.btnGhost} disabled={busy}
                              onClick={() => post({ action: "update", id: p.id, status: "approved" })}>Schválit</button>
                          )}
                          {p.status === "pending" && (
                            <button type="button" className="text-[12.5px] font-semibold text-rose-500 hover:underline" disabled={busy}
                              onClick={() => post({ action: "update", id: p.id, status: "rejected" })}>Zamítnout</button>
                          )}
                          {p.status === "approved" && (
                            <button type="button" className={t.btnGhost} disabled={busy}
                              onClick={() => post({ action: "update", id: p.id, status: "rejected" })}>Pozastavit</button>
                          )}
                          <button type="button" className="text-[12.5px] font-semibold text-rose-500 hover:underline" disabled={busy}
                            onClick={() => { if (window.confirm("Opravdu smazat partnera?")) post({ action: "delete", id: p.id }); }}>Smazat</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
