"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { INVOICE_TEMPLATES } from "@/lib/invoice-pdf";

interface Company {
  name?: string;
  ico?: string;
  dic?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  bank_account?: string;
  iban?: string;
  swift?: string;
  logo_url?: string;
  vat_status?: string;
  default_currency?: string;
  default_due_days?: number;
  invoice_template?: string;
  invoice_prefix?: string;
  invoice_color?: string;
  invoice_footer?: string;
  invoice_note_before?: string;
}

export default function CompanySettingsForm({ company }: { company?: Company | null }) {
  const router = useRouter();
  const isNew = !company;

  const [form, setForm] = useState({
    name: company?.name ?? "",
    ico: company?.ico ?? "",
    dic: company?.dic ?? "",
    address: company?.address ?? "",
    city: company?.city ?? "",
    zip: company?.zip ?? "",
    country: company?.country ?? "CZ",
    bankAccount: company?.bank_account ?? "",
    iban: company?.iban ?? "",
    swift: company?.swift ?? "",
    logoUrl: company?.logo_url ?? "",
    vatStatus: company?.vat_status ?? "non_vat",
    defaultCurrency: company?.default_currency ?? "CZK",
    defaultDueDays: String(company?.default_due_days ?? 14),
    invoicePrefix: company?.invoice_prefix ?? "FA",
    invoiceTemplate: company?.invoice_template ?? "modern",
    invoiceColor: company?.invoice_color ?? "#4f46e5",
    invoiceFooter: company?.invoice_footer ?? "",
    invoiceNoteBefore: company?.invoice_note_before ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [aresLoading, setAresLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function lookupAres() {
    if (!form.ico) return;
    setAresLoading(true);
    try {
      const res = await fetch(`/api/ares?ico=${encodeURIComponent(form.ico)}`);
      if (!res.ok) { setError("Firma v ARES nenalezena"); return; }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        name: data.name || f.name,
        dic: data.dic || f.dic,
        address: data.address || f.address,
        city: data.city || f.city,
        zip: data.zip || f.zip,
      }));
    } finally {
      setAresLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/company", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          defaultDueDays: parseInt(form.defaultDueDays),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Chyba při ukládání");
        return;
      }
      setSuccess(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">Uloženo</div>}

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Identifikace</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">IČ</label>
            <input className="input" value={form.ico} onChange={set("ico")} placeholder="12345678" />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={lookupAres} disabled={aresLoading} className="btn-secondary flex items-center gap-2 h-[42px]">
              {aresLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              ARES
            </button>
          </div>
        </div>

        <div>
          <label className="label">Název firmy *</label>
          <input className="input" value={form.name} onChange={set("name")} required placeholder="Moje firma s.r.o." />
        </div>

        <div>
          <label className="label">DIČ</label>
          <input className="input" value={form.dic} onChange={set("dic")} placeholder="CZ12345678" />
        </div>

        <div>
          <label className="label">Plátce DPH</label>
          <select className="input" value={form.vatStatus} onChange={set("vatStatus")}>
            <option value="non_vat">Neplátce DPH</option>
            <option value="vat_payer">Plátce DPH</option>
            <option value="identified_person">Identifikovaná osoba</option>
          </select>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Adresa</h2>
        <div>
          <label className="label">Ulice a číslo</label>
          <input className="input" value={form.address} onChange={set("address")} placeholder="Ulice 1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Město</label>
            <input className="input" value={form.city} onChange={set("city")} placeholder="Praha" />
          </div>
          <div>
            <label className="label">PSČ</label>
            <input className="input" value={form.zip} onChange={set("zip")} placeholder="11000" />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Bankovní účet</h2>
        <div>
          <label className="label">Číslo účtu</label>
          <input className="input" value={form.bankAccount} onChange={set("bankAccount")} placeholder="123456789/0300" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">IBAN</label>
            <input className="input" value={form.iban} onChange={set("iban")} placeholder="CZ65 0800 0000 1920 0014 5399" />
          </div>
          <div>
            <label className="label">SWIFT/BIC</label>
            <input className="input" value={form.swift} onChange={set("swift")} placeholder="GIBACZPX" />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Výchozí nastavení</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Výchozí měna</label>
            <select className="input" value={form.defaultCurrency} onChange={set("defaultCurrency")}>
              <option>CZK</option>
              <option>EUR</option>
            </select>
          </div>
          <div>
            <label className="label">Splatnost (dny)</label>
            <input className="input" type="number" min={1} max={365} value={form.defaultDueDays} onChange={set("defaultDueDays")} />
          </div>
        </div>
        <div>
          <label className="label">Číselná řada faktur</label>
          <input className="input" value={form.invoicePrefix} onChange={set("invoicePrefix")} placeholder="FA" maxLength={10} />
          <p className="text-xs text-slate-400 mt-1">Faktury budou číslované např. FA0001, FA0002...</p>
        </div>
        <div>
          <label className="label">URL loga (nepovinné)</label>
          <input className="input" value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://..." type="url" />
        </div>

        <div>
          <label className="label">Šablona faktury</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {INVOICE_TEMPLATES.map((t) => (
              <label
                key={t.id}
                className={`cursor-pointer border-2 rounded-xl p-3 flex items-start gap-3 transition-colors ${
                  form.invoiceTemplate === t.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="invoiceTemplate"
                  value={t.id}
                  checked={form.invoiceTemplate === t.id}
                  onChange={set("invoiceTemplate")}
                  className="mt-0.5 accent-indigo-600"
                />
                <div>
                  <div className={`text-sm font-semibold ${form.invoiceTemplate === t.id ? "text-indigo-700" : "text-slate-800"}`}>
                    {t.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Barva šablony</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              value={form.invoiceColor}
              onChange={set("invoiceColor")}
              className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
            />
            <input
              className="input flex-1"
              value={form.invoiceColor}
              onChange={set("invoiceColor")}
              placeholder="#4f46e5"
              maxLength={7}
            />
            <div className="w-10 h-10 rounded-lg border border-slate-200 shrink-0" style={{ backgroundColor: form.invoiceColor }} />
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {["#4f46e5","#2563eb","#7c3aed","#c2410c","#059669","#dc2626","#0284c7","#333333"].map(c => (
              <button key={c} type="button" onClick={() => setForm(f => ({ ...f, invoiceColor: c }))}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${form.invoiceColor === c ? "border-slate-800 scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Patička faktury</label>
          <textarea className="input resize-none" rows={2} value={form.invoiceFooter} onChange={set("invoiceFooter")}
            placeholder="Faktura byla vystavena elektronicky a je platná bez razítka a podpisu." />
          <p className="text-xs text-slate-400 mt-1">Zobrazí se v patičce každé faktury.</p>
        </div>

        <div>
          <label className="label">Věta před položkami (nepovinné)</label>
          <textarea className="input resize-none" rows={2} value={form.invoiceNoteBefore} onChange={set("invoiceNoteBefore")}
            placeholder="Dobrý den, fakturujeme vám následující položky..." />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isNew ? "Vytvořit firmu" : "Uložit nastavení"}
      </button>
    </form>
  );
}
