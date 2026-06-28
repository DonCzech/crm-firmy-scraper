"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Calendar, Plus, CheckCircle2, AlertTriangle, Clock, ChevronRight,
  Search, RefreshCw, ExternalLink, Camera, Loader2,
} from "lucide-react";

interface TemplateRow {
  id: number;
  key: string;
  name: string;
  industry: string;
  current_version: string;
  status: string;
  review_status: "pending" | "reviewed" | "approved" | "blocked";
  review_notes: string | null;
  reviewed_at: string | null;
  reviewer_email: string | null;
  assigned_date: string | null;
  review_checklist: Record<string, unknown> | null;
  last_perf_score: number | null;
  last_perf_at: string | null;
  last_residue_count: number | null;
  last_residue_at: string | null;
  v2_tenant_count: number;
}

interface Stats {
  pending: number;
  reviewed: number;
  approved: number;
  blocked: number;
  total: number;
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

export function TemplateQueueClient() {
  const [view, setView] = useState<"today" | "backlog" | "approved">("today");
  const [items, setItems] = useState<TemplateRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [date, setDate] = useState(todayISO());
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (view === "today")    params.set("date", date);
      if (view === "backlog")  params.set("all", "1");
      if (view === "approved") params.set("status", "approved");
      const res = await fetch(`/api/admin/template-queue?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) { window.location.href = "/admin/login?next=/admin/template-queue"; return; }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setItems(json.items ?? []);
      setStats(json.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [view, date]);

  useEffect(() => { void reload(); }, [reload]);

  async function backfillScreenshots(mode: "missing" | "all") {
    if (mode === "all" && !confirm("Přegenerovat náhledy pro VŠECHNY schválené šablony? Bude to trvat několik minut.")) return;
    setBackfilling(true);
    setBackfillMsg(null);
    try {
      const res = await fetch("/api/admin/template-queue/backfill-screenshots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setBackfillMsg(`Hotovo: ${json.success}/${json.processed} OK${json.failed.length ? ` · selhalo ${json.failed.length}` : ""}`);
      await reload();
    } catch (err) {
      setBackfillMsg(`Chyba: ${err instanceof Error ? err.message : "neznámá"}`);
    } finally {
      setBackfilling(false);
    }
  }

  async function assignToday() {
    setAssigning(true);
    setAssignMsg(null);
    try {
      const res = await fetch("/api/admin/template-queue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date, count: 3 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      await reload();
      if (json.assigned > 0) {
        setAssignMsg(`✓ Přiřazeno ${json.assigned} šablon. Auto-fix + Studio audit běží na pozadí (~1–2 min) — výsledky se objeví po otevření šablony.`);
        setTimeout(() => setAssignMsg(null), 12000);
      } else {
        setAssignMsg(json.reason === "already assigned" ? "Šablony na dnes jsou již přiřazeny." : "Žádné čekající šablony.");
        setTimeout(() => setAssignMsg(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Přiřazení selhalo");
    } finally {
      setAssigning(false);
    }
  }

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return items;
    return items.filter((r) => r.key.includes(f) || r.name.toLowerCase().includes(f) || r.industry.includes(f));
  }, [items, filter]);

  return (
    <div className="min-h-screen bg-white px-6 py-5 text-gray-900">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Review fronta šablon</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Denní QA workflow — 3 šablony / den, kontrola obsahu, obrázků, editoru a perf.
          </p>
        </div>
        <button
          onClick={reload}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Obnovit
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Čeká"      value={stats.pending}  color="amber"  Icon={Clock} />
          <StatCard label="V review"  value={stats.reviewed} color="blue"   Icon={Calendar} />
          <StatCard label="Schváleno" value={stats.approved} color="emerald" Icon={CheckCircle2} />
          <StatCard label="Blokováno" value={stats.blocked}  color="red"    Icon={AlertTriangle} />
          <StatCard label="Celkem"    value={stats.total}    color="gray"   Icon={Calendar} />
        </div>
      )}

      {/* Tabs + filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-gray-200 pb-3">
        <div className="flex gap-1 rounded-md bg-gray-100 p-0.5">
          <Tab active={view === "today"} onClick={() => setView("today")}>Dnes ({stats?.reviewed ?? 0})</Tab>
          <Tab active={view === "backlog"} onClick={() => setView("backlog")}>Backlog</Tab>
          <Tab active={view === "approved"} onClick={() => setView("approved")}>Schválené ({stats?.approved ?? 0})</Tab>
        </div>

        {view === "today" && (
          <>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={assignToday}
              disabled={assigning}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {assigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {assigning ? "Přiřazuji + spouštím auto-fix…" : "Auto-přiřadit 3"}
            </button>
            {assignMsg && (
              <span className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-[11px] text-indigo-700">
                {assignMsg}
              </span>
            )}
          </>
        )}

        {(view === "backlog" || view === "approved") && (
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Hledat (key, name, industry)…"
              className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-7 pr-2 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {view === "approved" && (
          <div className="ml-auto flex items-center gap-2">
            {backfillMsg && <span className="text-[11px] text-gray-500">{backfillMsg}</span>}
            <button
              onClick={() => backfillScreenshots("missing")}
              disabled={backfilling}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
              title="Vygenerovat preview.png + showcase shots pro šablony, které je nemají"
            >
              {backfilling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              Doplnit chybějící náhledy
            </button>
            <button
              onClick={() => backfillScreenshots("all")}
              disabled={backfilling}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              title="Přegenerovat všechny náhledy (i ty existující)"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Vše znovu
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">Načítám…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 px-6 py-10 text-center">
          {view === "today" && (
            <>
              <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                Žádné šablony přiřazené na {date}.
                Klikni na <strong className="text-gray-900">Auto-přiřadit 3</strong> pro dnešní review.
              </p>
            </>
          )}
          {view !== "today" && (
            <p className="text-sm text-gray-500">Žádné šablony neodpovídají filtru.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((row) => (
            <TemplateRow key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, color, Icon,
}: { label: string; value: number; color: "amber" | "blue" | "emerald" | "red" | "gray"; Icon: React.ComponentType<{ className?: string }> }) {
  const colors = {
    amber:   "border-amber-200 bg-amber-50 text-amber-800",
    blue:    "border-blue-200 bg-blue-50 text-blue-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red:     "border-red-200 bg-red-50 text-red-800",
    gray:    "border-gray-200 bg-gray-50 text-gray-800",
  };
  return (
    <div className={`flex items-center gap-2.5 rounded-md border px-3 py-2 ${colors[color]}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10.5px] uppercase tracking-wide opacity-80">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function Tab({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: TemplateRow["review_status"] }) {
  const map = {
    pending:  { label: "Čeká",       color: "border-amber-300 bg-amber-50 text-amber-800" },
    reviewed: { label: "V review",   color: "border-blue-300 bg-blue-50 text-blue-800" },
    approved: { label: "Schváleno",  color: "border-emerald-300 bg-emerald-50 text-emerald-800" },
    blocked:  { label: "Blokováno",  color: "border-red-300 bg-red-50 text-red-800" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${s.color}`}>
      {s.label}
    </span>
  );
}

function TemplateRow({ row }: { row: TemplateRow }) {
  const perfColor =
    row.last_perf_score == null ? "text-gray-400"
    : row.last_perf_score >= 90 ? "text-emerald-600"
    : row.last_perf_score >= 70 ? "text-amber-600"
    : "text-red-600";

  return (
    <Link
      href={`/admin/template-queue/${row.key}`}
      className="group flex items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2.5 shadow-sm transition-colors hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow"
    >
      <div
        className="h-10 w-16 shrink-0 rounded bg-cover bg-center bg-gray-100"
        style={{ backgroundImage: `url(/templates/${row.key}/preview.png)` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-gray-900">{row.name}</span>
          <StatusPill status={row.review_status} />
        </div>
        <div className="mt-0.5 text-[11px] text-gray-500">
          <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px] text-gray-700">{row.key}</code>
          {" · "}{row.industry}
          {row.v2_tenant_count > 0 && (
            <span className="ml-1.5 text-emerald-700">· {row.v2_tenant_count} v2 tenants</span>
          )}
        </div>
      </div>
      <div className="hidden gap-3 text-[10.5px] sm:flex">
        <div className="text-right">
          <div className="text-gray-400">Perf</div>
          <div className={`font-mono font-bold ${perfColor}`}>
            {row.last_perf_score ?? "—"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400">Rezidua</div>
          <div className={`font-mono font-bold ${
            row.last_residue_count == null ? "text-gray-400" :
            row.last_residue_count === 0 ? "text-emerald-600" : "text-red-600"
          }`}>
            {row.last_residue_count ?? "—"}
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
    </Link>
  );
}
