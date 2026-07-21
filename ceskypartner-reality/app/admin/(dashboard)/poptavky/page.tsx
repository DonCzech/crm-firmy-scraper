"use client";

import { useState } from "react";
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Phone,
  Mail,
  Building2,
  Send,
  User,
} from "lucide-react";
import { useApi, apiPost, apiPatch } from "@/lib/useApi";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
  listing: { id: string; title: string } | null;
  notes: { id: string; content: string; createdAt: string; author: { id: string; name: string } }[];
  _count: { notes: number };
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof MessageSquare; dot: string; bg: string }> = {
  NEW: { label: "Novy", icon: AlertCircle, dot: "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.5)]", bg: "bg-blue-500/10 text-blue-400" },
  IN_PROGRESS: { label: "Resime", icon: Clock, dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]", bg: "bg-amber-500/10 text-amber-400" },
  RESOLVED: { label: "Vyreseno", icon: CheckCircle2, dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]", bg: "bg-emerald-500/10 text-emerald-400" },
  ARCHIVED: { label: "Archiv", icon: Archive, dot: "bg-[var(--a-text-3)]", bg: "bg-[var(--a-surface)] text-[var(--a-text-3)]" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `pred ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `pred ${hours} hod`;
  const days = Math.floor(hours / 24);
  return `pred ${days} dny`;
}

export default function PoptavkyPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const params = new URLSearchParams();
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (search) params.set("q", search);

  const { data, loading, refetch } = useApi<Contact[]>(`/api/admin/contacts?${params}`);
  const contacts = data || [];
  const newCount = contacts.filter((c) => c.status === "NEW").length;
  const active = contacts.find((c) => c.id === activeId);

  async function addNote() {
    if (!activeId || !noteText.trim()) return;
    setSaving(true);
    const { error } = await apiPost(`/api/admin/contacts/${activeId}/notes`, { content: noteText });
    if (!error) {
      setNoteText("");
      refetch();
    }
    setSaving(false);
  }

  async function changeStatus(id: string, status: string) {
    await apiPatch(`/api/admin/contacts/${id}`, { status });
    refetch();
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex items-baseline gap-3">
        <span className="text-[32px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">
          {loading ? "-" : newCount}
        </span>
        <span className="text-[14px] text-[var(--a-text-3)]">novych poptavek</span>
      </div>

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          {/* Seznam */}
          <div className="space-y-4">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat poptavky..."
                className="h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent pl-10 pr-4 text-[12.5px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1">
              {["ALL", "NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                    statusFilter === s
                      ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                      : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text-2)]"
                  }`}
                >
                  {s !== "ALL" && STATUS_CONFIG[s] && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />}
                  {s === "ALL" ? "Vse" : STATUS_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {contacts.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.NEW;
                const StatusIcon = cfg.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`glass-card w-full rounded-2xl p-4 text-left transition-all duration-300 ${
                      activeId === c.id ? "ring-1 ring-[var(--a-bronze)]/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={14} className={cfg.bg.split(" ").pop()} />
                        <span className="text-[14px] font-semibold text-[var(--a-text)]">{c.name}</span>
                      </div>
                      <span className={`flex items-center gap-1.5 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${cfg.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[var(--a-text-2)]">{c.message}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10.5px] text-[var(--a-text-3)]">
                      <span>{timeAgo(c.createdAt)}</span>
                      {c.listing && (
                        <span className="flex items-center gap-1 text-[var(--a-bronze)]">
                          <Building2 size={10} /> {c.listing.title}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
              {contacts.length === 0 && (
                <p className="py-8 text-center text-[13px] text-[var(--a-text-3)]">Zadne poptavky</p>
              )}
            </div>
          </div>

          {/* Detail */}
          {active ? (
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[20px] font-semibold text-[var(--a-text)]">{active.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-[12.5px]">
                    <a href={`mailto:${active.email}`} className="flex items-center gap-1 text-[var(--a-bronze)] hover:underline">
                      <Mail size={13} /> {active.email}
                    </a>
                    {active.phone && (
                      <a href={`tel:${active.phone}`} className="flex items-center gap-1 text-[var(--a-bronze)] hover:underline">
                        <Phone size={13} /> {active.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {["NEW", "IN_PROGRESS", "RESOLVED"].map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        onClick={() => changeStatus(active.id, s)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                          active.status === s
                            ? "border-[var(--a-bronze)]/30 " + cfg.bg
                            : "border-[var(--a-border)] text-[var(--a-text-3)] hover:text-[var(--a-text-2)]"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {active.listing && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-4 py-3 text-[13px]">
                  <Building2 size={15} className="text-[var(--a-bronze)]" />
                  <span className="font-semibold text-[var(--a-text)]">{active.listing.title}</span>
                </div>
              )}

              <div className="mt-5 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Zprava</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--a-text)]">{active.message}</p>
                <p className="mt-2 text-[11px] text-[var(--a-text-3)]">{timeAgo(active.createdAt)}</p>
              </div>

              {/* Poznamky */}
              <div className="mt-6">
                <h3 className="mb-3 text-[13px] font-semibold text-[var(--a-text)]">
                  Poznamky ({active.notes.length})
                </h3>
                {active.notes.length > 0 ? (
                  <div className="space-y-3">
                    {active.notes.map((n) => (
                      <div key={n.id} className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] p-3">
                        <div className="flex items-center gap-2 text-[11px] text-[var(--a-text-3)]">
                          <User size={11} />
                          <span className="font-semibold">{n.author.name}</span>
                          <span>&middot;</span>
                          <span>{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="mt-1.5 text-[13px] text-[var(--a-text)]">{n.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[var(--a-text-3)]">Zatim zadne poznamky</p>
                )}

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addNote()}
                    placeholder="Pridat poznamku..."
                    className="h-10 flex-1 rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
                  />
                  <button
                    onClick={addNote}
                    disabled={saving || !noteText.trim()}
                    className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-4 text-[12px] font-semibold text-[#0a0a0b] transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                  >
                    <Send size={13} /> Pridat
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card flex items-center justify-center rounded-2xl p-12 text-center">
              <div>
                <MessageSquare size={32} className="mx-auto text-[var(--a-text-3)]" />
                <p className="mt-4 text-[14px] text-[var(--a-text-2)]">Vyberte poptavku ze seznamu</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
