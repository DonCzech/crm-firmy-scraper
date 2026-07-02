"use client";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { generateInvoiceNumber } from "@/lib/invoice-number";

interface Config {
  invoice_prefix: string;
  invoice_number_year_format: string;
  invoice_number_month: boolean;
  invoice_number_position: string;
  invoice_number_volume: number;
  invoice_number_separator: string;
  invoice_next: number;
}

function ToggleGroup({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            value === o.value
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function NumberingForm({ initial }: { initial: Config }) {
  const [cfg, setCfg] = useState<Config>(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof Config) => (val: unknown) =>
    setCfg((c) => ({ ...c, [k]: val }));

  const preview = [1, 2, 9999].map((n) =>
    generateInvoiceNumber({ ...cfg, invoice_next: n })
  );

  async function handleSave() {
    setLoading(true);
    await fetch("/api/settings/numbering", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Náhled číslování</h2>
        <div className="flex flex-col gap-1">
          {preview.map((p, i) => (
            <div
              key={i}
              className={`text-center font-bold rounded-xl border-2 py-3 transition-all ${
                i === 0
                  ? "text-2xl border-indigo-500 text-indigo-700 bg-indigo-50 scale-105"
                  : i === 1
                  ? "text-xl border-slate-200 text-slate-700 bg-white opacity-70"
                  : "text-base border-slate-100 text-slate-400 bg-white opacity-40"
              }`}
            >
              Faktura {p}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-900">Nastavení</h2>

        <div>
          <label className="label">Předpona (prefix)</label>
          <input
            className="input max-w-xs"
            value={cfg.invoice_prefix}
            onChange={(e) => set("invoice_prefix")(e.target.value)}
            placeholder="Např. FA, INV, ..."
            maxLength={10}
          />
          <p className="text-xs text-slate-400 mt-1">Nepovinná — zobrazí se před číslem.</p>
        </div>

        <div>
          <label className="label mb-2 block">Formát roku</label>
          <ToggleGroup
            options={[
              { value: "full", label: "2026" },
              { value: "short", label: "26" },
              { value: "none", label: "Nechci" },
            ]}
            value={cfg.invoice_number_year_format}
            onChange={set("invoice_number_year_format")}
          />
        </div>

        {cfg.invoice_number_year_format !== "none" && (
          <div>
            <label className="label mb-2 block">Číslo měsíce</label>
            <ToggleGroup
              options={[
                { value: "true", label: "Ano" },
                { value: "false", label: "Ne" },
              ]}
              value={String(cfg.invoice_number_month)}
              onChange={(v) => set("invoice_number_month")(v === "true")}
            />
          </div>
        )}

        <div>
          <label className="label mb-2 block">Pořadové číslo</label>
          <ToggleGroup
            options={[
              { value: "start", label: "Na začátku" },
              { value: "end", label: "Na konci" },
            ]}
            value={cfg.invoice_number_position}
            onChange={set("invoice_number_position")}
          />
        </div>

        <div>
          <label className="label mb-2 block">Počet faktur ročně <span className="text-slate-400 font-normal">(určuje počet míst pořadového čísla)</span></label>
          <ToggleGroup
            options={[
              { value: "100", label: "100" },
              { value: "1000", label: "1 000" },
              { value: "10000", label: "10 000" },
              { value: "100000", label: "100 000" },
              { value: "1000000", label: "1 mil." },
            ]}
            value={String(cfg.invoice_number_volume)}
            onChange={(v) => set("invoice_number_volume")(parseInt(v))}
          />
        </div>

        <div>
          <label className="label mb-2 block">Oddělovník</label>
          <ToggleGroup
            options={[
              { value: "-", label: "Pomlčka (–)" },
              { value: "", label: "Není" },
            ]}
            value={cfg.invoice_number_separator}
            onChange={set("invoice_number_separator")}
          />
        </div>

        <div>
          <label className="label">Příští číslo faktury</label>
          <input
            className="input max-w-xs"
            type="number"
            min={1}
            value={cfg.invoice_next}
            onChange={(e) => set("invoice_next")(parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-slate-400 mt-1">Pořadové číslo příští vystavené faktury.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="btn-primary flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saved ? "Uloženo!" : "Uložit nastavení"}
      </button>
    </div>
  );
}
