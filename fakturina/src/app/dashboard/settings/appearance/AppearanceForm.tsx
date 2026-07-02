"use client";
import { useState, useRef } from "react";
import { Loader2, Check, Upload, X, QrCode, Palette } from "lucide-react";

const TEMPLATES = [
  { value: "modern", label: "Modern", accent: "#4f46e5", lines: ["━━━━━━━━━━", "▬▬▬▬▬▬", "▬▬▬▬▬▬▬▬"] },
  { value: "classic", label: "Classic", accent: "#1e293b", lines: ["══════════", "▬▬▬▬▬▬", "▬▬▬▬▬▬▬▬"] },
  { value: "minimal", label: "Minimal", accent: "#64748b", lines: ["──────────", "▬▬▬▬▬▬", "▬▬▬▬▬▬▬▬"] },
  { value: "bold", label: "Bold", accent: "#0f172a", lines: ["██████████", "▬▬▬▬▬▬", "▬▬▬▬▬▬▬▬"] },
  { value: "soft", label: "Soft", accent: "#8b5cf6", lines: ["━━━━━━━━━━", "▬▬▬▬▬▬", "▬▬▬▬▬▬▬▬"] },
  { value: "vivid", label: "Vivid", accent: "#06b6d4", lines: ["━━━━━━━━━━", "▬▬▬▬▬▬", "▬▬▬▬▬▬▬▬"] },
];

const LANGUAGES = [
  { value: "cs", label: "Čeština" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "sk", label: "Slovenčina" },
];

interface Config {
  invoice_template: string;
  invoice_color: string;
  invoice_spacing: string;
  invoice_footer: string;
  logo_url: string | null;
  stamp_url: string | null;
  show_qr_payment: boolean;
  default_language: string;
}

function ImageUploadBox({
  label, hint, value, onRemove, onUpload,
}: {
  label: string; hint: string; value: string | null;
  onRemove: () => void; onUpload: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", label === "Logo" ? "logo" : "stamp");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      onUpload(url);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="label">{label}</label>
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-20 rounded-xl border border-slate-200 object-contain bg-slate-50 p-2" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-slate-400 hover:text-indigo-600"
        >
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 mb-2" />}
          <span className="text-sm font-medium">Nahrát {label.toLowerCase()}</span>
          <span className="text-xs mt-0.5">{hint}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function AppearanceForm({ initial }: { initial: Config }) {
  const [cfg, setCfg] = useState<Config>(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof Config) => (val: unknown) =>
    setCfg((c) => ({ ...c, [k]: val }));

  const selectedTemplate = TEMPLATES.find((t) => t.value === cfg.invoice_template) ?? TEMPLATES[0];

  async function handleSave() {
    setLoading(true);
    await fetch("/api/settings/appearance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-5">
      {/* Template picker */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Šablona faktury</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("invoice_template")(t.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                cfg.invoice_template === t.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="w-full space-y-1">
                <div className="h-1 rounded w-full" style={{ backgroundColor: cfg.invoice_template === t.value ? cfg.invoice_color : t.accent }} />
                {t.lines.map((l, i) => (
                  <div key={i} className="h-1.5 bg-slate-200 rounded" style={{ width: i === 0 ? "100%" : i === 1 ? "70%" : "85%" }} />
                ))}
              </div>
              <span className="text-xs font-medium text-slate-600">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color + spacing */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-900">Barva a rozložení</h2>

        <div>
          <label className="label flex items-center gap-2"><Palette className="w-4 h-4" /> Barva faktury</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              value={cfg.invoice_color}
              onChange={(e) => set("invoice_color")(e.target.value)}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
            />
            <input
              className="input max-w-[140px] font-mono"
              value={cfg.invoice_color}
              onChange={(e) => set("invoice_color")(e.target.value)}
              placeholder="#4f46e5"
            />
            <div className="flex gap-2">
              {["#4f46e5", "#059669", "#dc2626", "#d97706", "#0891b2", "#7c3aed", "#1e293b"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("invoice_color")(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${cfg.invoice_color === c ? "border-slate-700 scale-110" : "border-white shadow"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="label mb-2 block">Řádkování</label>
          <div className="flex gap-2">
            {[
              { value: "spacious", label: "Vzdušné" },
              { value: "compact", label: "Kompaktní" },
            ].map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set("invoice_spacing")(o.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  cfg.invoice_spacing === o.value
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logo + stamp */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-900">Logo a razítko</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <ImageUploadBox
            label="Logo"
            hint="JPG, PNG, GIF · max 5 MB · 420×140 px"
            value={cfg.logo_url}
            onRemove={() => set("logo_url")(null)}
            onUpload={(url) => set("logo_url")(url)}
          />
          <ImageUploadBox
            label="Razítko a podpis"
            hint="JPG, PNG, GIF · max 5 MB · 420×210 px"
            value={cfg.stamp_url}
            onRemove={() => set("stamp_url")(null)}
            onUpload={(url) => set("stamp_url")(url)}
          />
        </div>
      </div>

      {/* Footer + QR + Language */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-900">Obsah faktury</h2>

        <div>
          <label className="label">Patička faktury</label>
          <textarea
            className="input resize-none"
            rows={3}
            value={cfg.invoice_footer}
            onChange={(e) => set("invoice_footer")(e.target.value)}
            placeholder="Společnost je zapsána v obchodním rejstříku..."
          />
          <p className="text-xs text-slate-400 mt-1">Zobrazí se pod každou fakturou. Ze zákona musíte uvést údaje o zápisu do rejstříku (platí pro s.r.o. a a.s.).</p>
        </div>

        <div>
          <label className="label">Výchozí jazyk faktur</label>
          <select
            className="input max-w-xs"
            value={cfg.default_language}
            onChange={(e) => set("default_language")(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set("show_qr_payment")(!cfg.show_qr_payment)}
            className={`relative w-10 h-6 rounded-full transition-colors ${cfg.show_qr_payment ? "bg-indigo-600" : "bg-slate-200"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cfg.show_qr_payment ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">QR platba na faktuře</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="btn-primary flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saved ? "Uloženo!" : "Uložit vzhled"}
      </button>
    </div>
  );
}
