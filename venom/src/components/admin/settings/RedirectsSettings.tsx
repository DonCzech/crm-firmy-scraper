"use client";

import { useState } from "react";
import clsx from "clsx";
import { SettingsLayout } from "./SettingsLayout";
import { EmptyState, Input } from "./ui";
import { Trash2 } from "lucide-react";

export interface Redirect {
  id: number;
  from_path: string;
  to_path: string;
  status_code: number;
  created_at: string;
}

interface Props {
  tenantSlug: string;
  initialRedirects: Redirect[];
}

export function RedirectsSettings({ tenantSlug, initialRedirects }: Props) {
  const [redirects, setRedirects] = useState<Redirect[]>(initialRedirects);
  const [showForm, setShowForm] = useState(false);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState<301 | 302 | 307 | 308>(301);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!fromPath.trim() || !toPath.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/redirects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_path: fromPath.trim(), to_path: toPath.trim(), status_code: statusCode }),
      });
      if (res.ok) {
        const data = await res.json() as { id: number };
        setRedirects((prev) => [
          { id: data.id, from_path: fromPath.trim(), to_path: toPath.trim(), status_code: statusCode, created_at: new Date().toISOString() },
          ...prev,
        ]);
        setFromPath(""); setToPath(""); setStatusCode(301); setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Smazat přesměrování?")) return;
    const res = await fetch(`/api/demo/${tenantSlug}/redirects/${id}`, { method: "DELETE" });
    if (res.ok) setRedirects((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <SettingsLayout
      tenantSlug={tenantSlug}
      activeItem="Přesměrování"
      title="Přesměrování"
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
      {redirects.length === 0 && !showForm ? (
        <EmptyState onNew={() => setShowForm(true)} />
      ) : (
        <div className="rounded-xl border border-white/[0.07] bg-[#111113] overflow-hidden">
          {showForm && (
            <div className="border-b border-white/[0.06] p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <Input value={fromPath} onChange={setFromPath} placeholder="Z cesty (např. /stara-stranka)" />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <Input value={toPath} onChange={setToPath} placeholder="Na cestu (např. /nova-stranka)" />
                </div>
                <select
                  value={statusCode}
                  onChange={(e) => setStatusCode(Number(e.target.value) as 301 | 302 | 307 | 308)}
                  className="rounded-lg border border-white/[0.1] bg-[#1a1a1d] px-3 py-2 text-[13px] text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={301}>301 — Trvalé</option>
                  <option value={302}>302 — Dočasné</option>
                  <option value={307}>307 — Dočasné (metoda)</option>
                  <option value={308}>308 — Trvalé (metoda)</option>
                </select>
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
                {["Z CESTY", "NA CESTU", "KÓD", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.08em] text-[#52525b] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {redirects.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[#71717a]">Žádné záznamy</td></tr>
              ) : (
                redirects.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] last:border-0">
                    <td className="px-4 py-3 font-mono text-[11px] text-[#a1a1aa]">{r.from_path}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#a1a1aa]">{r.to_path}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        r.status_code === 301 ? "bg-green-500/10 text-green-400" :
                        r.status_code === 302 ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-blue-500/10 text-blue-400"
                      )}>
                        {r.status_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
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
      )}
    </SettingsLayout>
  );
}
