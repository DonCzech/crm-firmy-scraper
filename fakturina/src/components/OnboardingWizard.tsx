"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, ChevronRight, ChevronLeft, Check, Loader2,
  Zap, Package, FileText, CreditCard, Sparkles, ArrowRight, Search
} from "lucide-react";

interface ExistingCompany {
  id: string;
  name: string;
  ico?: string | null;
  dic?: string | null;
  vat_status?: string;
  invoice_prefix?: string;
  invoice_padding?: number;
  invoice_next?: number;
  bank_account?: string | null;
  iban?: string | null;
  swift?: string | null;
  default_currency?: string;
  invoice_footer?: string | null;
  features?: Record<string, boolean> | null;
}

interface Props {
  userName: string;
  existingCompany: ExistingCompany | null;
}

type YearFmt = "full" | "short" | "none";
type PrefixPos = "start" | "end";
type Separator = "-" | "";

function buildPrefix(opts: {
  text: string;
  yearFmt: YearFmt;
  includeMonth: boolean;
  position: PrefixPos;
  separator: Separator;
}): string {
  const { text, yearFmt, includeMonth, position, separator } = opts;
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  const yearPart = yearFmt === "full" ? String(year) : yearFmt === "short" ? String(year).slice(2) : "";
  const monthPart = includeMonth ? month : "";

  const dateParts = [yearPart, monthPart].filter(Boolean);
  const dateSeg = dateParts.join(separator);

  if (!text && !dateSeg) return "";

  if (position === "start") {
    const parts = [text, dateSeg].filter(Boolean);
    return parts.join(separator) + (parts.length ? separator : "");
  } else {
    // prefix at end — date comes first, text at end
    return dateSeg ? dateSeg + separator : "";
  }
}

function buildSuffix(opts: {
  text: string;
  yearFmt: YearFmt;
  includeMonth: boolean;
  position: PrefixPos;
  separator: Separator;
}): string {
  if (opts.position !== "end" || !opts.text) return "";
  return opts.separator + opts.text;
}

function previewNumbers(opts: {
  text: string;
  yearFmt: YearFmt;
  includeMonth: boolean;
  position: PrefixPos;
  separator: Separator;
  padding: number;
  countStart: number;
}): string[] {
  const prefix = buildPrefix(opts);
  const suffix = buildSuffix(opts);
  return [opts.countStart, opts.countStart + 1, opts.countStart + 2].map(
    (n) => prefix + String(n).padStart(opts.padding, "0") + suffix
  );
}

const STEPS = [
  { id: "company", label: "Firma" },
  { id: "features", label: "Funkce" },
  { id: "footer", label: "Patička" },
  { id: "numbering", label: "Číslování" },
  { id: "bank", label: "Účet" },
  { id: "done", label: "Hotovo" },
];

export default function OnboardingWizard({ userName, existingCompany }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(existingCompany ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 0 — Company
  const [compName, setCompName] = useState(existingCompany?.name ?? "");
  const [ico, setIco] = useState(existingCompany?.ico ?? "");
  const [dic, setDic] = useState(existingCompany?.dic ?? "");
  const [vatStatus, setVatStatus] = useState(existingCompany?.vat_status ?? "non_vat");
  const [aresLoading, setAresLoading] = useState(false);
  const [aresFound, setAresFound] = useState(false);

  // Step 1 — Features
  const [features, setFeatures] = useState({
    expenses: existingCompany?.features?.expenses ?? false,
    inventory: existingCompany?.features?.inventory ?? false,
    offers: existingCompany?.features?.offers ?? false,
  });

  // Step 2 — Footer
  const [footer, setFooter] = useState(existingCompany?.invoice_footer ?? "");

  // Step 3 — Numbering
  const [numPrefix, setNumPrefix] = useState(() => {
    const p = existingCompany?.invoice_prefix ?? "FA";
    // Strip any trailing separator/year to get just the text part
    return p.replace(/[-_]?\d{2,4}[-_]?\d{0,2}[-_]?$/, "").replace(/[-_]$/, "") || "FA";
  });
  const [yearFmt, setYearFmt] = useState<YearFmt>("full");
  const [includeMonth, setIncludeMonth] = useState(false);
  const [prefixPos, setPrefixPos] = useState<PrefixPos>("start");
  const [separator, setSeparator] = useState<Separator>("-");
  const [countStart, setCountStart] = useState(existingCompany?.invoice_next ?? 1000);
  const padding = String(countStart).length;

  // Step 4 — Bank
  const [bankAccount, setBankAccount] = useState(existingCompany?.bank_account ?? "");
  const [iban, setIban] = useState(existingCompany?.iban ?? "");
  const [swift, setSwift] = useState(existingCompany?.swift ?? "");
  const [currency, setCurrency] = useState(existingCompany?.default_currency ?? "CZK");

  const lookupAres = useCallback(async (icoVal: string) => {
    if (icoVal.length !== 8) return;
    setAresLoading(true);
    setAresFound(false);
    try {
      const res = await fetch(`/api/ares?ico=${icoVal}`);
      if (res.ok) {
        const data = await res.json();
        if (data.name) {
          setCompName(data.name);
          setDic(data.dic ?? "");
          setAresFound(true);
        }
      }
    } finally {
      setAresLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ico.length === 8) lookupAres(ico);
  }, [ico, lookupAres]);

  async function saveCompany() {
    setLoading(true);
    setError("");
    try {
      const method = existingCompany ? "PUT" : "POST";
      const res = await fetch("/api/company", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: compName,
          ico: ico || undefined,
          dic: dic || undefined,
          vatStatus,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Chyba při ukládání");
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function saveFeatures() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: compName, features }),
      });
      if (!res.ok) { setError("Chyba při ukládání"); return false; }
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function saveFooter() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: compName, invoiceFooter: footer }),
      });
      if (!res.ok) { setError("Chyba při ukládání"); return false; }
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function saveNumbering() {
    setLoading(true);
    setError("");
    try {
      const computedPrefix = buildPrefix({ text: numPrefix, yearFmt, includeMonth, position: prefixPos, separator });
      const computedSuffix = buildSuffix({ text: numPrefix, yearFmt, includeMonth, position: prefixPos, separator });
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: compName,
          invoicePrefix: computedPrefix,
          invoicePadding: padding,
          invoiceNext: countStart,
          // store suffix in invoice_note_before for now — actually we need a new field
          // For simplicity store full format as prefix only (suffix not yet supported)
          invoiceSuffix: computedSuffix || undefined,
        }),
      });
      if (!res.ok) { setError("Chyba při ukládání"); return false; }
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function saveBank(skip = false) {
    if (skip) { setStep(5); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: compName,
          bankAccount: bankAccount || undefined,
          iban: iban || undefined,
          swift: swift || undefined,
          defaultCurrency: currency,
        }),
      });
      if (!res.ok) { setError("Chyba při ukládání"); return false; }
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function finishOnboarding() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: compName, onboarded: true }),
      });
      if (!res.ok) { setError("Chyba při dokončení"); return; }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    setError("");
    let ok = true;
    if (step === 0) ok = await saveCompany() ?? false;
    if (step === 1) ok = await saveFeatures() ?? false;
    if (step === 2) ok = await saveFooter() ?? false;
    if (step === 3) ok = await saveNumbering() ?? false;
    if (step === 4) { ok = await saveBank() ?? false; }
    if (ok) setStep((s) => s + 1);
  }

  const previews = previewNumbers({ text: numPrefix, yearFmt, includeMonth, position: prefixPos, separator, padding, countStart });

  const progressPct = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Fakturina</span>
          </div>
          <span className="text-sm text-slate-500">Vítejte, {userName}</span>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step
                      ? "bg-indigo-600 text-white"
                      : i === step
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 ${i < step ? "bg-indigo-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {/* Step 0: Company */}
          {step === 0 && (
            <div className="card p-8 space-y-6">
              <div>
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Prvotní nastavení</h1>
                <p className="text-slate-500 mt-1">Zadejte základní údaje o vaší firmě.</p>
              </div>

              <div>
                <label className="label">IČO</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    value={ico}
                    onChange={(e) => setIco(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="12345678"
                    maxLength={8}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {aresLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : aresFound ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : ico.length === 8 ? (
                      <Search className="w-4 h-4 text-slate-400" />
                    ) : null}
                  </div>
                </div>
                {aresFound && (
                  <p className="text-xs text-green-600 mt-1">Firma nalezena v ARESu ✓</p>
                )}
              </div>

              <div>
                <label className="label">Název firmy *</label>
                <input
                  className="input"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="Vaše s.r.o."
                  required
                />
              </div>

              <div>
                <label className="label">DIČ (pokud jste plátce DPH)</label>
                <input
                  className="input"
                  value={dic}
                  onChange={(e) => setDic(e.target.value)}
                  placeholder="CZ12345678"
                />
              </div>

              <div>
                <label className="label">Vztah k DPH</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { value: "non_vat", label: "Neplátce DPH" },
                    { value: "identified_person", label: "Identif. osoba" },
                    { value: "vat_payer", label: "Plátce DPH" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setVatStatus(opt.value)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                        vatStatus === opt.value
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={loading || !compName.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Uložit a pokračovat <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Features */}
          {step === 1 && (
            <div className="card p-8 space-y-6">
              <div>
                <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-violet-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Používané funkce</h1>
                <p className="text-slate-500 mt-1">Přizpůsobte aplikaci svým potřebám. Funkce lze kdykoli změnit.</p>
              </div>

              <div className="space-y-4">
                <FeatureToggle
                  icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
                  bg="bg-emerald-50"
                  title="Evidujete náklady?"
                  desc="Sledujte výdaje a náklady firmy."
                  checked={features.expenses}
                  onChange={(v) => setFeatures((f) => ({ ...f, expenses: v }))}
                />
                <FeatureToggle
                  icon={<Package className="w-5 h-5 text-blue-600" />}
                  bg="bg-blue-50"
                  title="Používáte sklad nebo ceník?"
                  desc="Evidujte produkty a jejich ceny."
                  checked={features.inventory}
                  onChange={(v) => setFeatures((f) => ({ ...f, inventory: v }))}
                />
                <FeatureToggle
                  icon={<FileText className="w-5 h-5 text-amber-600" />}
                  bg="bg-amber-50"
                  title="Děláte nabídky nebo obchodní případy?"
                  desc="Vytvářejte cenové nabídky pro zákazníky."
                  checked={features.offers}
                  onChange={(v) => setFeatures((f) => ({ ...f, offers: v }))}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="btn-secondary flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Zpět
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Uložit a pokračovat <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Footer */}
          {step === 2 && (
            <div className="card p-8 space-y-6">
              <div>
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-slate-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Patička faktury</h1>
                <p className="text-slate-500 mt-1">Text, který se zobrazí v dolní části každé faktury.</p>
              </div>

              <div>
                <label className="label">Text patičky</label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  placeholder="Např.: Společnost je zapsána v obchodním rejstříku vedeném Krajským soudem v Praze, oddíl C, vložka 123456."
                />
                <p className="text-xs text-slate-400 mt-1">Nepovinné. Typicky obsahuje zápis v OR, provozní podmínky apod.</p>
              </div>

              {/* Mini invoice preview */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Náhled patičky</div>
                <div className="border-t border-dashed border-slate-300 pt-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {footer || <span className="italic text-slate-300">Zde se zobrazí váš text patičky…</span>}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Zpět
                </button>
                <button onClick={handleNext} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Uložit a pokračovat <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Numbering */}
          {step === 3 && (
            <div className="card p-8 space-y-6">
              <div>
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Číslování faktur</h1>
                <p className="text-slate-500 mt-1">Nastavte formát číslování faktur.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Prefix (text)</label>
                  <input
                    className="input"
                    value={numPrefix}
                    onChange={(e) => setNumPrefix(e.target.value.slice(0, 10))}
                    placeholder="FA"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="label">Formát roku</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([["full", "2026"], ["short", "26"], ["none", "Nechci"]] as [YearFmt, string][]).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setYearFmt(v)}
                        className={`py-2 rounded-xl text-sm font-medium border transition-colors ${yearFmt === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Zahrnout měsíc</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([true, false] as const).map((v) => (
                      <button key={String(v)} type="button" onClick={() => setIncludeMonth(v)}
                        className={`py-2 rounded-xl text-sm font-medium border transition-colors ${includeMonth === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"}`}>
                        {v ? "Ano" : "Ne"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Pozice prefixu</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([["start", "Na začátku"], ["end", "Na konci"]] as [PrefixPos, string][]).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setPrefixPos(v)}
                        className={`py-2 rounded-xl text-sm font-medium border transition-colors ${prefixPos === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Oddělovač</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["-", ""] as Separator[]).map((v) => (
                      <button key={v || "none"} type="button" onClick={() => setSeparator(v)}
                        className={`py-2 rounded-xl text-sm font-medium border transition-colors ${separator === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"}`}>
                        {v === "-" ? "Pomlčka ( - )" : "Žádný"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Kde začít s číslováním</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 1000, 10000, 100000, 1000000].map((v) => (
                      <button key={v} type="button" onClick={() => setCountStart(v)}
                        className={`py-2 rounded-xl text-sm font-medium border transition-colors ${countStart === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"}`}>
                        {v >= 1000000 ? "1 mil." : v.toLocaleString("cs-CZ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-3">Náhled číslování</p>
                {previews.map((n, i) => (
                  <div key={i} className="bg-white rounded-lg px-4 py-2.5 font-mono text-sm font-bold text-slate-900 border border-indigo-100">
                    {n}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Zpět
                </button>
                <button onClick={handleNext} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Uložit a pokračovat <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Bank */}
          {step === 4 && (
            <div className="card p-8 space-y-6">
              <div>
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Bankovní účet</h1>
                <p className="text-slate-500 mt-1">Údaje budou uvedeny na fakturách pro platbu.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                <strong>TIP:</strong> Pokud si chcete aplikaci nejprve prohlédnout, klidně tento krok přeskočte.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="label">Číslo účtu</label>
                  <input className="input" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="123456789/0800" />
                </div>
                <div>
                  <label className="label">IBAN</label>
                  <input className="input" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="CZ65 0800 0000 0000 0000 0000" />
                </div>
                <div>
                  <label className="label">SWIFT / BIC</label>
                  <input className="input" value={swift} onChange={(e) => setSwift(e.target.value)} placeholder="GIBACZPX" />
                </div>
                <div>
                  <label className="label">Výchozí měna</label>
                  <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="CZK">CZK — Česká koruna</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Zpět
                </button>
                <button
                  type="button"
                  onClick={() => { saveBank(true); setStep(5); }}
                  className="btn-secondary px-4"
                >
                  Přeskočit
                </button>
                <button onClick={handleNext} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Uložit a pokračovat <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Done / Trial */}
          {step === 5 && (
            <div className="card p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">Všechny funkce na 30 dnů zdarma</h1>
                <p className="text-slate-500 mt-2">Vyzkoušejte všechny prémiové funkce bez závazků. Zrušení kdykoli.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  "Neomezené faktury",
                  "Automatické upomínky",
                  "Pravidelné faktury",
                  "Statistiky a přehledy",
                  "PDF ke stažení",
                  "Emailové odesílání",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={finishOnboarding}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Vyzkoušet všechny funkce
                </button>
                <button
                  type="button"
                  onClick={finishOnboarding}
                  disabled={loading}
                  className="w-full text-sm text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 py-2"
                >
                  Možná později <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FeatureToggle({
  icon, bg, title, desc, checked, onChange,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
        checked ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 text-sm">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
      </div>
      <div
        className={`w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${
            checked ? "translate-x-5.5 ml-0.5" : "translate-x-0.5"
          }`}
          style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }}
        />
      </div>
    </div>
  );
}
