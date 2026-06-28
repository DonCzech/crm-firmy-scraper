"use client";

import { useState } from "react";
import { SettingsLayout } from "./SettingsLayout";
import { EmptyState, Input } from "./ui";
import { Search, Trash2 } from "lucide-react";

export interface HttpHeader {
  id: number;
  name: string;
  value: string;
  created_at: string;
}

interface Props {
  tenantSlug: string;
  initialHeaders: HttpHeader[];
}

export function HttpHeadersSettings({ tenantSlug, initialHeaders }: Props) {
  const [headers, setHeaders] = useState<HttpHeader[]>(initialHeaders);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = headers.filter((h) => {
    const q = search.toLowerCase();
    return !q || h.name.toLowerCase().includes(q) || h.value.toLowerCase().includes(q);
  });

  async function handleCreate() {
    if (!newName.trim() || !newValue.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/http-headers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), value: newValue.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { id: number };
        setHeaders((prev) => [
          { id: data.id, name: newName.trim(), value: newValue.trim(), created_at: new Date().toISOString() },
          ...prev,
        ]);
        setNewName(""); setNewValue(""); setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Smazat HTTP hlavičku?")) return;
    const res = await fetch(`/api/demo/${tenantSlug}/http-headers/${id}`, { method: "DELETE" });
    if (res.ok) setHeaders((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <SettingsLayout
      tenantSlug={tenantSlug}
      activeItem="HTTP Hlavičky"
      title="HTTP Hlavičky"
      actionButton={
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
        >
          Nový záznam
        </button>
      }
    >
      {headers.length === 0 && !showForm ? (
        <EmptyState onNew={() => setShowForm(true)} />
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#52525b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat…"
                className="w-full rounded-lg border border-white/[0.1] bg-[#1a1a1d] pl-9 pr-3 py-2 text-[13px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#111113] overflow-hidden">
            {showForm && (
              <div className="border-b border-white/[0.06] p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Input value={newName} onChange={setNewName} placeholder="Název hlavičky (např. X-Frame-Options)" />
                  <Input value={newValue} onChange={setNewValue} placeholder="Hodnota (např. DENY)" />
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={saving}
                    className="shrink-0 rounded-lg bg-[#2563eb] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                  >
                    {saving ? "Ukládám…" : "Uložit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="shrink-0 rounded-lg border border-white/[0.1] bg-transparent px-3 py-2 text-[12px] text-[#a1a1aa] hover:bg-white/[0.04]"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            )}
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["NÁZEV", "HODNOTA", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.08em] text-[#52525b] uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-10 text-center text-[13px] text-[#71717a]">Žádné záznamy</td></tr>
                ) : (
                  filtered.map((h) => (
                    <tr key={h.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] last:border-0">
                      <td className="px-4 py-3 text-white font-medium font-mono text-[11px]">{h.name}</td>
                      <td className="px-4 py-3 text-[#a1a1aa] font-mono text-[11px] max-w-xs truncate">{h.value}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(h.id)}
                          className="text-[#52525b] hover:text-red-400 transition-colors"
                          title="Smazat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
