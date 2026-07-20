"use client";

import { useState } from "react";

/** Modul „Velkoobchod (B2B)" — registrační formulář partnera. */
export function WholesaleForm({ tenantSlug }: { tenantSlug: string }) {
  const [form, setForm] = useState({ company: "", email: "", ico: "", dic: "", phone: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/wholesale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company,
          email: form.email,
          ico: form.ico || undefined,
          dic: form.dic || undefined,
          phone: form.phone || undefined,
          note: form.note || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Odeslání se nepodařilo");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Odeslání se nepodařilo");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="text-[28px]">✅</div>
        <h2 className="mt-2 text-[18px] font-extrabold text-emerald-800">Žádost odeslána</h2>
        <p className="mt-1 text-[14px] text-emerald-700">
          Děkujeme za zájem o velkoobchodní spolupráci. Žádost posoudíme a ozveme se vám na uvedený e-mail.
          Po schválení se velkoobchodní sleva uplatní automaticky na objednávky s vaším e-mailem.
        </p>
      </div>
    );
  }

  const input = "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[14px] text-neutral-900 outline-none transition focus:border-neutral-400";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold text-neutral-700">
          Název firmy *
          <input className={input} required minLength={2} value={form.company} onChange={set("company")} placeholder="Firma s.r.o." />
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold text-neutral-700">
          Kontaktní e-mail *
          <input className={input} required type="email" value={form.email} onChange={set("email")} placeholder="nakup@firma.cz" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold text-neutral-700">
          IČO
          <input className={input} value={form.ico} onChange={set("ico")} placeholder="12345678" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold text-neutral-700">
          DIČ
          <input className={input} value={form.dic} onChange={set("dic")} placeholder="CZ12345678" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold text-neutral-700 sm:col-span-2">
          Telefon
          <input className={input} value={form.phone} onChange={set("phone")} placeholder="+420 777 123 456" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold text-neutral-700 sm:col-span-2">
          Co byste chtěli odebírat?
          <textarea className={`${input} min-h-[90px] resize-y`} value={form.note} onChange={set("note")}
            placeholder="Sortiment, předpokládané objemy, frekvence objednávek…" />
        </label>
      </div>
      <button type="submit" disabled={busy}
        className="mt-5 rounded-full bg-neutral-950 px-7 py-3 text-[14px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60">
        {busy ? "Odesílám…" : "Odeslat žádost o velkoobchod"}
      </button>
    </form>
  );
}
