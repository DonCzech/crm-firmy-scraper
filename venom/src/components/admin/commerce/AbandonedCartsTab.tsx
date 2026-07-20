"use client";

import { useCallback, useEffect, useState } from "react";
import { api, czk, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

interface AbandonedCart {
  id: number; token: string; email: string | null; item_count: number;
  total_cents: number; reminder_count: number; reminder_sent_at: string | null;
  created_at: string; updated_at: string;
}
interface CartStats { status: string; count: number; total_cents: number }
interface ReminderSettings { after_hours: number; max_reminders: number; coupon_code: string }

export function AbandonedCartsTab({ base, currency }: { base: string; currency: string }) {
  const t = useCommerceTheme();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<CartStats[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>({ after_hours: 2, max_reminders: 3, coupon_code: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const data = await api<{ carts: AbandonedCart[]; stats: CartStats[]; settings?: ReminderSettings }>(`${base}/abandoned-carts`);
      setCarts(data.carts);
      setStats(data.stats);
      if (data.settings) setSettings(data.settings);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function saveSettings() {
    setSavingSettings(true);
    setError(null);
    setSettingsSaved(false);
    try {
      await api(`${base}/abandoned-carts`, {
        method: "POST",
        body: JSON.stringify({ action: "settings", ...settings, after_hours: Number(settings.after_hours), max_reminders: Number(settings.max_reminders) }),
      });
      setSettingsSaved(true);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSavingSettings(false); }
  }

  async function sendReminder(cartId: number) {
    setSendingId(cartId);
    setError(null);
    try {
      await api(`${base}/abandoned-carts`, {
        method: "POST",
        body: JSON.stringify({ action: "send", cart_id: cartId }),
      });
      setSentIds((prev) => new Set(prev).add(cartId));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Odeslání selhalo"); }
    finally { setSendingId(null); }
  }

  const getStat = (status: string) => stats.find((s) => s.status === status) ?? { count: 0, total_cents: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Opuštěné košíky</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">Přehled košíků, které zákazníci nedokončili. Upomínku pošlete jedním klikem — e-mail obsahuje položky, kupón a odkaz na obnovení košíku.</p>
      </div>

      <ErrorBanner message={error} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { key: "abandoned", label: "Opuštěno", color: "text-rose-600", bg: "bg-rose-50" },
          { key: "reminded", label: "Upomínka odeslána", color: "text-amber-600", bg: "bg-amber-50" },
          { key: "recovered", label: "Obnoveno", color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ key, label, color }) => {
          const s = getStat(key);
          return (
            <div key={key} className={`${t.sectionCls} flex flex-col gap-1`}>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
              <span className={`text-[22px] font-bold tabular-nums ${color}`}>{s.count}</span>
              <span className="text-[12px] text-slate-500">{czk(s.total_cents, currency)}</span>
            </div>
          );
        })}
      </div>

      {loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>
      ) : carts.length === 0 ? (
        <div className={t.emptyStateCls}>
          <p className="text-[14px] text-slate-500">Žádné opuštěné košíky k upomenutí. Košík se tu objeví, když zákazník v pokladně vyplní e-mail, ale objednávku nedokončí (po uplynutí nastavené doby).</p>
        </div>
      ) : (
        <div className={t.tableShellCls}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className={t.tableHeadRowCls}>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3 text-center">Položek</th>
                <th className="px-4 py-3 text-right">Hodnota</th>
                <th className="px-4 py-3 text-center">Upomínek</th>
                <th className="px-4 py-3">Posl. upomínka</th>
                <th className="px-4 py-3">Posl. aktivita</th>
                <th className="px-4 py-3 text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((c) => (
                <tr key={c.id} className={t.tableRowCls}>
                  <td className="px-4 py-3 font-medium">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{c.item_count}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{czk(c.total_cents, currency)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      c.reminder_count === 0 ? "bg-slate-100 text-slate-500" :
                      c.reminder_count < 3 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>{c.reminder_count}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-500">{c.reminder_sent_at ? fmtDate(c.reminder_sent_at) : "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-500">{fmtDate(c.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => sendReminder(c.id)}
                      disabled={sendingId === c.id}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                    >
                      {sendingId === c.id ? "Odesílám…" : sentIds.has(c.id) ? "Odesláno ✓ · Poslat znovu" : "Odeslat upomínku"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={t.sectionCls}>
        <h3 className={t.sectionTitleCls}>Nastavení upomínek</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={t.labelCls}>Košík považovat za opuštěný po</label>
            <select
              className={t.inputCls}
              value={String(settings.after_hours)}
              onChange={(e) => setSettings((s) => ({ ...s, after_hours: Number(e.target.value) }))}
            >
              <option value="1">1 hodině</option>
              <option value="2">2 hodinách</option>
              <option value="4">4 hodinách</option>
              <option value="24">24 hodinách</option>
            </select>
          </div>
          <div>
            <label className={t.labelCls}>Max. upomínek na košík</label>
            <select
              className={t.inputCls}
              value={String(settings.max_reminders)}
              onChange={(e) => setSettings((s) => ({ ...s, max_reminders: Number(e.target.value) }))}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div>
            <label className={t.labelCls}>Slevový kupón v e-mailu</label>
            <input
              className={t.inputCls}
              placeholder="COMEBACK10"
              value={settings.coupon_code}
              onChange={(e) => setSettings((s) => ({ ...s, coupon_code: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={saveSettings}
            disabled={savingSettings}
            className="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {savingSettings ? "Ukládám…" : "Uložit nastavení"}
          </button>
          {settingsSaved && <span className="text-[12px] font-semibold text-emerald-600">Uloženo ✓</span>}
        </div>
        <p className={t.noticeCls}>E-mail se zachytává automaticky, jakmile ho zákazník vyplní v pokladně. Kupón z pole výše se vloží do upomínky — nezapomeňte ho založit v sekci Marketing.</p>
      </div>
    </div>
  );
}
