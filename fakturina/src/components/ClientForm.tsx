"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface Client {
  id?: string;
  name?: string;
  ico?: string;
  dic?: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
}

export default function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: client?.name ?? "",
    ico: client?.ico ?? "",
    dic: client?.dic ?? "",
    email: client?.email ?? "",
    address: client?.address ?? "",
    city: client?.city ?? "",
    zip: client?.zip ?? "",
    country: client?.country ?? "CZ",
  });
  const [loading, setLoading] = useState(false);
  const [aresLoading, setAresLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
    try {
      const url = client?.id ? `/api/clients/${client.id}` : "/api/clients";
      const method = client?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Chyba při ukládání");
        return;
      }
      router.push("/dashboard/clients");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!client?.id || !confirm("Opravdu archivovat klienta?")) return;
    await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    router.push("/dashboard/clients");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="label">IČ</label>
          <input className="input" value={form.ico} onChange={set("ico")} placeholder="12345678" />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={lookupAres}
            disabled={aresLoading}
            className="btn-secondary flex items-center gap-2 h-[42px]"
          >
            {aresLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            ARES
          </button>
        </div>
      </div>

      <div>
        <label className="label">Název *</label>
        <input className="input" value={form.name} onChange={set("name")} required placeholder="Firma s.r.o." />
      </div>

      <div>
        <label className="label">DIČ</label>
        <input className="input" value={form.dic} onChange={set("dic")} placeholder="CZ12345678" />
      </div>

      <div>
        <label className="label">E-mail</label>
        <input className="input" type="email" value={form.email} onChange={set("email")} placeholder="faktura@firma.cz" />
      </div>

      <div>
        <label className="label">Adresa</label>
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

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {client?.id ? "Uložit změny" : "Vytvořit klienta"}
        </button>
        {client?.id && (
          <button type="button" onClick={handleDelete} className="btn-danger">
            Archivovat
          </button>
        )}
      </div>
    </form>
  );
}
