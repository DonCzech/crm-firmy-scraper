"use client";

import { useState } from "react";
import clsx from "clsx";
import { SettingsLayout } from "./SettingsLayout";
import { EmptyState, Input } from "./ui";
import { Search, Trash2 } from "lucide-react";

export interface CssClass {
  id: number;
  name: string;
  css_class: string;
  description: string | null;
  created_at: string;
}

interface Props {
  tenantSlug: string;
  initialClasses: CssClass[];
}

export function CssClassesSettings({ tenantSlug, initialClasses }: Props) {
  const [classes, setClasses] = useState<CssClass[]>(initialClasses);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = classes.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.css_class.toLowerCase().includes(q);
  });

  async function handleCreate() {
    if (!newName.trim() || !newClass.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/css-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), css_class: newClass.trim(), description: newDesc.trim() || undefined }),
      });
      if (res.ok) {
        const data = await res.json() as { id: number };
        setClasses((prev) => [
          { id: data.id, name: newName.trim(), css_class: newClass.trim(), description: newDesc.trim() || null, created_at: new Date().toISOString() },
          ...prev,
        ]);
        setNewName(""); setNewClass(""); setNewDesc(""); setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Smazat CSS třídu?")) return;
    const res = await fetch(`/api/demo/${tenantSlug}/css-classes/${id}`, { method: "DELETE" });
    if (res.ok) setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <SettingsLayout
      tenantSlug={tenantSlug}
      activeItem="CSS třídy"
      title="CSS třídy"
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
      {classes.length === 0 && !showForm ? (
        <EmptyState onNew={() => setShowForm(true)} />
      ) : (
        <div>
          {/* Search */}
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
            {/* New form row */}
            {showForm && (
              <div className="border-b border-white/[0.06] p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Input value={newName} onChange={setNewName} placeholder="Název" />
                  <Input value={newClass} onChange={setNewClass} placeholder="CSS třída" />
                  <Input value={newDesc} onChange={setNewDesc} placeholder="Popis (volitelné)" />
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
                  {["NÁZEV", "CSS TŘÍDA", "POPIS", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.08em] text-[#52525b] uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px] text-[#71717a]">Žádné záznamy</td></tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] last:border-0">
                      <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#a1a1aa]">{c.css_class}</td>
                      <td className="px-4 py-3 text-[#71717a]">{c.description ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
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
