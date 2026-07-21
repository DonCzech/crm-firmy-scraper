"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, ClipboardList } from "lucide-react";
import { useApi, apiPost, apiPatch, apiDelete } from "@/lib/useApi";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string; avatar: string | null } | null;
  deal: { id: string; title: string } | null;
  person: { id: string; name: string } | null;
  listing: { id: string; title: string } | null;
};

const COLUMNS: { key: string; label: string; accent: string }[] = [
  { key: "TODO", label: "K vyrizeni", accent: "text-[var(--a-text-3)]" },
  { key: "IN_PROGRESS", label: "Probiha", accent: "text-blue-400" },
  { key: "WAITING", label: "Ceka", accent: "text-amber-400" },
  { key: "DONE", label: "Hotovo", accent: "text-emerald-400" },
];

const PRIORITY_MAP: Record<string, { label: string; className: string }> = {
  LOW: { label: "Nizka", className: "bg-[var(--a-surface-2)] text-[var(--a-text-3)]" },
  NORMAL: { label: "Bezna", className: "bg-blue-500/10 text-blue-400" },
  HIGH: { label: "Vysoka", className: "bg-amber-500/10 text-amber-400" },
  URGENT: { label: "Urgentni", className: "bg-red-500/10 text-red-400" },
};

const inputClass = "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";
const selectClass = "h-10 w-full cursor-pointer appearance-none rounded-xl border border-[var(--a-border)] bg-transparent px-4 pr-10 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 focus:border-[var(--a-bronze)]/30";

const EMPTY_FORM = { title: "", description: "", status: "TODO", priority: "NORMAL", dueDate: "" };

export default function PlanovaniPage() {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useApi<Task[]>("/api/admin/tasks");
  const tasks = data || [];

  function openNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModal(true);
  }

  function openEdit(t: Task) {
    setEditId(t.id);
    setForm({
      title: t.title, description: t.description || "", status: t.status, priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { alert("Vyplnte nazev ukolu"); return; }
    setSaving(true);
    const { error } = editId
      ? await apiPatch(`/api/admin/tasks/${editId}`, form)
      : await apiPost("/api/admin/tasks", form);
    setSaving(false);
    if (error) { alert("Chyba: " + error); return; }
    setModal(false);
    refetch();
  }

  async function moveTask(t: Task, dir: 1 | -1) {
    const idx = COLUMNS.findIndex((c) => c.key === t.status);
    const next = COLUMNS[idx + dir];
    if (!next) return;
    await apiPatch(`/api/admin/tasks/${t.id}`, { status: next.key });
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat ukol?")) return;
    await apiDelete(`/api/admin/tasks/${id}`);
    refetch();
  }

  const isOverdue = (t: Task) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < new Date();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Planovani</h2>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Kanbanova tabule ukolu tymu</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl"
        >
          <Plus size={14} /> Novy ukol
        </button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${col.accent}`}>{col.label}</span>
                  <span className="text-[11px] text-[var(--a-text-3)]">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((t) => {
                    const pr = PRIORITY_MAP[t.priority] || PRIORITY_MAP.NORMAL;
                    return (
                      <div key={t.id} className="glass-card group rounded-xl p-3">
                        <button type="button" onClick={() => openEdit(t)} className="block w-full text-left">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[12.5px] font-semibold leading-snug text-[var(--a-text)]">{t.title}</p>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${pr.className}`}>{pr.label}</span>
                          </div>
                          {t.description && <p className="mt-1 line-clamp-2 text-[11px] text-[var(--a-text-3)]">{t.description}</p>}
                          {(t.deal || t.listing || t.person) && (
                            <p className="mt-1.5 truncate text-[10px] text-[var(--a-text-2)]">
                              {t.deal?.title || t.listing?.title || t.person?.name}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between text-[10.5px]">
                            <span className={`flex items-center gap-1 ${isOverdue(t) ? "text-red-400" : "text-[var(--a-text-3)]"}`}>
                              {t.dueDate && <><CalendarDays size={10} /> {new Date(t.dueDate).toLocaleDateString("cs-CZ")}</>}
                            </span>
                            <span className="text-[var(--a-text-3)]">{t.assignee?.name || ""}</span>
                          </div>
                        </button>
                        <div className="mt-2 flex items-center justify-between border-t border-[var(--a-border)] pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => moveTask(t, -1)} disabled={col.key === "TODO"} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--a-text-3)] transition-colors hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)] disabled:opacity-30">
                            <ChevronLeft size={13} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--a-text-3)] transition-colors hover:bg-red-500/10 hover:text-red-400">
                            <Trash2 size={11} />
                          </button>
                          <button onClick={() => moveTask(t, 1)} disabled={col.key === "DONE"} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--a-text-3)] transition-colors hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)] disabled:opacity-30">
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-[var(--a-border)]">
                      <ClipboardList size={14} className="text-[var(--a-text-3)] opacity-40" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="fixed inset-x-4 top-[12%] z-50 mx-auto max-w-[480px] rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)] p-6 shadow-2xl">
            <h3 className="text-[17px] font-semibold text-[var(--a-text)]">{editId ? "Upravit ukol" : "Novy ukol"}</h3>
            <div className="mt-5 space-y-4">
              <input type="text" className={inputClass} placeholder="Nazev ukolu *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea
                rows={3}
                className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
                placeholder="Popis..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative">
                  <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
                <div className="relative">
                  <select className={selectClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
                <input type="date" className={inputClass} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="rounded-xl border border-[var(--a-border)] px-5 py-2.5 text-[12px] font-semibold text-[var(--a-text-2)] transition-all hover:border-[var(--a-border-hover)]">
                Zrusit
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] transition-all hover:shadow-lg disabled:opacity-50">
                {saving ? "Ukladam..." : "Ulozit"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
