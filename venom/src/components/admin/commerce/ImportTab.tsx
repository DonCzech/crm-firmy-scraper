"use client";

import { useState } from "react";
import { useCommerceTheme } from "./shared";

type Step = "source" | "upload" | "mapping" | "preview" | "done";

const SOURCES = [
  { key: "shoptet", label: "Shoptet", desc: "Import z CSV/XML exportu Shoptetu", icon: "S" },
  { key: "csv", label: "CSV soubor", desc: "Univerzální CSV import (produkty, kategorie)", icon: "C" },
  { key: "xml", label: "XML feed", desc: "Import z XML feedu (Heureka, Zboží.cz formát)", icon: "X" },
];

export function ImportTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [step, setStep] = useState<Step>("source");
  const [source, setSource] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Import produktů</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">Importujte produkty z jiné platformy nebo CSV/XML souboru.</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {(["source", "upload", "mapping", "preview", "done"] as const).map((s, i) => {
          const labels = ["Zdroj", "Nahrání", "Mapování", "Náhled", "Hotovo"];
          const active = s === step;
          const done = ["source", "upload", "mapping", "preview", "done"].indexOf(step) > i;
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px w-6 ${done ? "bg-emerald-400" : t.design === "studio" ? "bg-white/15" : "bg-slate-200"}`} />}
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                done ? "bg-emerald-500 text-white" : active
                  ? t.design === "studio" ? "bg-violet-500 text-white" : "bg-indigo-600 text-white"
                  : t.design === "studio" ? "bg-white/10 text-slate-400" : "bg-slate-100 text-slate-400"
              }`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[12px] font-semibold hidden sm:inline ${active ? (t.design === "studio" ? "text-white" : "text-slate-900") : "text-slate-400"}`}>
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Source */}
      {step === "source" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {SOURCES.map((s) => (
            <button key={s.key} onClick={() => { setSource(s.key); setStep("upload"); }}
              className={`${t.sectionCls} text-left transition hover:scale-[1.02] ${t.metricActionCls}`}>
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-[18px] font-black ${
                t.design === "studio" ? "bg-violet-500/20 text-violet-300" : t.design === "glass" ? "bg-lime-100 text-lime-700" : "bg-indigo-50 text-indigo-600"
              }`}>
                {s.icon}
              </div>
              <h3 className={`text-[14px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>{s.label}</h3>
              <p className="mt-1 text-[12.5px] text-slate-500">{s.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Upload */}
      {step === "upload" && (
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>Nahrát soubor ({source === "shoptet" ? "Shoptet export" : source?.toUpperCase()})</h3>
          <div className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-10 ${
            t.design === "studio" ? "border-white/15 bg-white/[0.03]" : "border-slate-200 bg-slate-50"
          }`}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-[14px] text-slate-500">Přetáhněte soubor sem nebo klikněte pro výběr</p>
            <input type="file" accept=".csv,.xml,.xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-[13px]" />
            {file && <p className="text-[13px] font-medium text-emerald-600">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setStep("source")} className={t.btnGhost}>← Zpět</button>
            <button onClick={() => setStep("mapping")} disabled={!file} className={t.btnPrimary}>Pokračovat →</button>
          </div>
        </div>
      )}

      {/* Step 3: Mapping */}
      {step === "mapping" && (
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>Mapování sloupců</h3>
          <p className="mb-4 text-[13px] text-slate-500">Přiřaďte sloupce z vašeho souboru k polím v e-shopu.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Název produktu", "Cena", "SKU", "Kategorie", "Popis", "Obrázek URL", "Sklad", "Varianta"].map((field) => (
              <div key={field}>
                <label className={t.labelCls}>{field}</label>
                <select className={t.inputCls}>
                  <option>— automaticky —</option>
                  <option>Sloupec A</option>
                  <option>Sloupec B</option>
                  <option>Sloupec C</option>
                </select>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setStep("upload")} className={t.btnGhost}>← Zpět</button>
            <button onClick={() => setStep("preview")} className={t.btnPrimary}>Pokračovat →</button>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === "preview" && (
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>Náhled importu</h3>
          <div className={`mb-4 rounded-lg p-4 ${t.design === "studio" ? "bg-white/[0.06]" : "bg-slate-50"}`}>
            <div className="flex gap-8 text-[13px]">
              <span>Produkty k importu: <strong>—</strong></span>
              <span>Nové kategorie: <strong>—</strong></span>
              <span>Duplicity: <strong>—</strong></span>
            </div>
          </div>
          <p className={t.noticeCls}>Funkce importu bude dostupná v příští aktualizaci. Připravte si export soubor z vaší platformy.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setStep("mapping")} className={t.btnGhost}>← Zpět</button>
            <button onClick={() => { setImporting(true); setTimeout(() => { setImporting(false); setResult({ imported: 0, skipped: 0, errors: ["Import bude dostupný v další verzi."] }); setStep("done"); }, 1500); }}
              disabled={importing} className={t.btnPrimary}>
              {importing ? "Importuji…" : "Spustit import"}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Done */}
      {step === "done" && result && (
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>Výsledek importu</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={`rounded-lg p-4 text-center ${t.design === "studio" ? "bg-emerald-500/15" : "bg-emerald-50"}`}>
              <div className="text-[24px] font-bold text-emerald-600">{result.imported}</div>
              <div className="text-[12px] text-slate-500">Importováno</div>
            </div>
            <div className={`rounded-lg p-4 text-center ${t.design === "studio" ? "bg-amber-500/15" : "bg-amber-50"}`}>
              <div className="text-[24px] font-bold text-amber-600">{result.skipped}</div>
              <div className="text-[12px] text-slate-500">Přeskočeno</div>
            </div>
            <div className={`rounded-lg p-4 text-center ${t.design === "studio" ? "bg-rose-500/15" : "bg-rose-50"}`}>
              <div className="text-[24px] font-bold text-rose-600">{result.errors.length}</div>
              <div className="text-[12px] text-slate-500">Chyb</div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3 space-y-1">
              {result.errors.map((e, i) => (
                <p key={i} className="text-[12.5px] text-rose-600">{e}</p>
              ))}
            </div>
          )}
          <div className="mt-4">
            <button onClick={() => { setStep("source"); setFile(null); setResult(null); }} className={t.btnGhost}>Nový import</button>
          </div>
        </div>
      )}
    </div>
  );
}
