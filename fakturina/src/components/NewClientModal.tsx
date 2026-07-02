"use client";
import { useState, useEffect, useRef } from "react";
import { X, Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react";

interface Client {
  id: string;
  name: string;
  ico?: string;
  dic?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  email?: string;
}

interface Props {
  onClose: () => void;
  onCreated: (client: Client) => void;
}

export default function NewClientModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: "",
    ico: "",
    dic: "",
    email: "",
    address: "",
    city: "",
    zip: "",
  });
  const [loading, setLoading] = useState(false);
  const [aresLoading, setAresLoading] = useState(false);
  const [aresStatus, setAresStatus] = useState<"idle" | "ok" | "notfound">("idle");
  const [error, setError] = useState("");
  const aresAbortRef = useRef<AbortController | null>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Auto-lookup ARES when IČ has exactly 8 digits
  useEffect(() => {
    const ic = form.ico.replace(/\s/g, "");
    if (ic.length !== 8 || !/^\d{8}$/.test(ic)) {
      setAresStatus("idle");
      return;
    }

    aresAbortRef.current?.abort();
    const controller = new AbortController();
    aresAbortRef.current = controller;

    setAresLoading(true);
    setAresStatus("idle");

    fetch(`/api/ares?ico=${encodeURIComponent(ic)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("notfound");
        return res.json();
      })
      .then((data) => {
        setForm((f) => ({
          ...f,
          name: data.name || f.name,
          dic: data.dic || f.dic,
          address: data.address || f.address,
          city: data.city || f.city,
          zip: data.zip || f.zip,
        }));
        setAresStatus("ok");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setAresStatus("notfound");
      })
      .finally(() => {
        if (!controller.signal.aborted) setAresLoading(false);
      });

    return () => controller.abort();
  }, [form.ico]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Chyba při ukládání");
        return;
      }
      onCreated(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-slate-900 text-sm">Nový klient</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>
          )}

          {/* IČ — auto ARES */}
          <div>
            <label className="label">IČ</label>
            <div className="relative">
              <input
                className="input pr-8"
                value={form.ico}
                onChange={set("ico")}
                placeholder="12345678 — po zadání se vyplní automaticky"
                maxLength={8}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {aresLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                {!aresLoading && aresStatus === "ok" && <CheckCircle className="w-4 h-4 text-green-500" />}
                {!aresLoading && aresStatus === "notfound" && <AlertCircle className="w-4 h-4 text-amber-400" />}
              </div>
            </div>
            {aresStatus === "ok" && <p className="text-xs text-green-600 mt-1">Údaje vyplněny z ARES</p>}
            {aresStatus === "notfound" && <p className="text-xs text-amber-500 mt-1">Firma v ARES nenalezena — vyplňte ručně</p>}
          </div>

          {/* Název + DIČ */}
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="label">Název / jméno *</label>
              <input className="input" value={form.name} onChange={set("name")} required placeholder="Firma s.r.o." />
            </div>
            <div>
              <label className="label">DIČ</label>
              <input className="input" value={form.dic} onChange={set("dic")} placeholder="CZ12345678" />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" value={form.email} onChange={set("email")} placeholder="info@firma.cz" />
            </div>
          </div>

          {/* Adresa */}
          <div>
            <label className="label">Ulice a číslo</label>
            <input className="input" value={form.address} onChange={set("address")} placeholder="Ulice 1" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Město</label>
              <input className="input" value={form.city} onChange={set("city")} placeholder="Praha" />
            </div>
            <div>
              <label className="label">PSČ</label>
              <input className="input" value={form.zip} onChange={set("zip")} placeholder="11000" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Zrušit</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Uložit a vybrat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
