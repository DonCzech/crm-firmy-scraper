"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Bell, Play, CheckCircle2 } from "lucide-react";

interface Settings {
  before_due_enabled: boolean;
  due_day_enabled: boolean;
  after_3_days_enabled: boolean;
  after_10_days_enabled: boolean;
  after_20_days_enabled: boolean;
  email_template_before_due?: string;
  email_template_due_day?: string;
  email_template_after_due?: string;
}

const DEFAULT_BEFORE = `Dobrý den,\n\nchtěli jsme vás upozornit, že faktura č. {{number}} je splatná za 3 dny ({{dueDate}}).\n\nCelková částka: {{total}} {{currency}}\n\nDěkujeme za včasnou platbu.`;
const DEFAULT_DUE = `Dobrý den,\n\ndnes je poslední den splatnosti faktury č. {{number}}.\n\nCelková částka: {{total}} {{currency}}\n\nProsíme o uhrazení faktury.`;
const DEFAULT_AFTER = `Dobrý den,\n\ndovolujeme si upozornit, že faktura č. {{number}} je po splatnosti.\n\nCelková částka: {{total}} {{currency}}\n\nProsíme o neprodlené uhrazení faktury.`;

export default function ReminderSettingsForm({ settings, companyId }: {
  settings: Settings | null;
  companyId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    before_due_enabled: settings?.before_due_enabled ?? true,
    due_day_enabled: settings?.due_day_enabled ?? true,
    after_3_days_enabled: settings?.after_3_days_enabled ?? true,
    after_10_days_enabled: settings?.after_10_days_enabled ?? true,
    after_20_days_enabled: settings?.after_20_days_enabled ?? false,
    email_template_before_due: settings?.email_template_before_due ?? DEFAULT_BEFORE,
    email_template_due_day: settings?.email_template_due_day ?? DEFAULT_DUE,
    email_template_after_due: settings?.email_template_after_due ?? DEFAULT_AFTER,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState<{ processed: number } | null>(null);

  const toggle = (k: keyof typeof form) => () =>
    setForm((f) => ({ ...f, [k]: !f[k] }));

  const setText = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function runNow() {
    setRunLoading(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/cron/reminders", {
        headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` },
      });
      const data = await res.json();
      setRunResult({ processed: data.processed ?? 0 });
    } finally {
      setRunLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, companyId }),
      });
      setSuccess(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const reminders = [
    { key: "before_due_enabled" as const, label: "3 dny před splatností", desc: "Jemná připomínka před splatností" },
    { key: "due_day_enabled" as const, label: "V den splatnosti", desc: "Připomínka v den splatnosti" },
    { key: "after_3_days_enabled" as const, label: "3 dny po splatnosti", desc: "První upomínka" },
    { key: "after_10_days_enabled" as const, label: "10 dní po splatnosti", desc: "Důraznější upomínka" },
    { key: "after_20_days_enabled" as const, label: "20 dní po splatnosti", desc: "Poslední výzva" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">Nastavení uloženo</div>}

      <div className="card p-6 space-y-3">
        <h2 className="font-semibold text-slate-900 mb-1">Kdy posílat upomínky</h2>
        {reminders.map(({ key, label, desc }) => (
          <label key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-800">{label}</div>
                <div className="text-xs text-slate-400">{desc}</div>
              </div>
            </div>
            <div
              onClick={toggle(key)}
              className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${form[key] ? "bg-indigo-600" : "bg-slate-200"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${form[key] ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </label>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Šablony e-mailů</h2>
        <p className="text-xs text-slate-400">Dostupné proměnné: {"{{number}}"}, {"{{dueDate}}"}, {"{{total}}"}, {"{{currency}}"}</p>

        <div>
          <label className="label">Před splatností</label>
          <textarea className="input resize-none" rows={4} value={form.email_template_before_due} onChange={setText("email_template_before_due")} />
        </div>
        <div>
          <label className="label">V den splatnosti</label>
          <textarea className="input resize-none" rows={4} value={form.email_template_due_day} onChange={setText("email_template_due_day")} />
        </div>
        <div>
          <label className="label">Po splatnosti</label>
          <textarea className="input resize-none" rows={4} value={form.email_template_after_due} onChange={setText("email_template_after_due")} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Uložit nastavení
        </button>
        <button
          type="button"
          onClick={runNow}
          disabled={runLoading}
          className="btn-secondary flex items-center gap-2 px-4"
          title="Spustit upomínky pro dnešní den ručně"
        >
          {runLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Spustit nyní
        </button>
      </div>

      {runResult !== null && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Odesláno {runResult.processed} upomínek pro dnešní den.
        </div>
      )}
    </form>
  );
}
