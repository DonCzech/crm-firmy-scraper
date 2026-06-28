"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Save, Loader2, Mail, FileText, Globe, Image as ImageIcon, ShieldCheck,
  Clock, History, Trash2, RotateCcw, MailOpen, MailCheck, ExternalLink,
  Plus, Home, Pencil, Check, X, FileStack, LayoutTemplate, AlertTriangle,
  PanelTop, PanelBottom, Palette, Type, Search, Sparkles, ChevronDown,
} from "lucide-react";
import "../../studio/design-tokens.css";

/* ============================================================================
   Native drawer panels — replace the iframe placeholder for SEO, Zprávy, Verze
   and Audit drawers. Each component fetches its own data, supports inline
   editing/actions and persists via the existing tenant API endpoints. All
   use the shared cinematic dark tokens for visual consistency.
   ============================================================================ */

// ── SEO panel — per-page title/description/OG image/noindex form ──────────
interface SeoPage {
  id: number;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  noindex: boolean;
}

export function SeoPanel({ tenantSlug }: { tenantSlug: string }) {
  const [pages, setPages] = useState<SeoPage[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/pages`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as { pages: SeoPage[] };
        setPages(json.pages);
        setActiveId(json.pages[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Načtení selhalo");
      }
    })();
  }, [tenantSlug]);

  const active = pages?.find(p => p.id === activeId) ?? null;

  function updateActive(patch: Partial<SeoPage>) {
    if (!active) return;
    setPages(prev => prev?.map(p => p.id === active.id ? { ...p, ...patch } : p) ?? null);
  }

  const save = useCallback(async () => {
    if (!pages) return;
    setSaveState("saving");
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/seo`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pages: pages.map(p => ({
            id: p.id,
            seo_title: p.seo_title || null,
            seo_description: p.seo_description || null,
            og_image: p.og_image || null,
            noindex: p.noindex,
          })),
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setSaveState("saved");
      setTimeout(() => setSaveState(s => s === "saved" ? "idle" : s), 1500);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Uložení selhalo");
    }
  }, [pages, tenantSlug]);

  if (error && !pages) {
    return <ErrorState message={error} />;
  }
  if (!pages) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page selector */}
      <div className="shrink-0 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] p-2 vs-scroll overflow-x-auto">
        <div className="flex gap-1">
          {pages.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(p.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium tracking-tight transition-[background,color] duration-100 ${
                activeId === p.id
                  ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
                  : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
              }`}
            >
              <FileText className="h-3 w-3" strokeWidth={1.75} />
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto vs-scroll p-4 space-y-4">
        {active && (
          <>
            <SeoScoreCard tenantSlug={tenantSlug} pageId={active.id} />
            <FormField
              label="SEO title"
              icon={<Globe className="h-3 w-3" />}
              hint="50–60 znaků, viditelné v Google výsledcích"
            >
              <input
                type="text"
                value={active.seo_title ?? ""}
                onChange={e => updateActive({ seo_title: e.target.value })}
                placeholder={active.title}
                maxLength={200}
                className="vs-input"
              />
              <CounterHint value={(active.seo_title ?? "").length} target={60} />
            </FormField>

            <FormField
              label="Meta description"
              icon={<FileText className="h-3 w-3" />}
              hint="120–160 znaků, podporuje CTR"
            >
              <textarea
                value={active.seo_description ?? ""}
                onChange={e => updateActive({ seo_description: e.target.value })}
                placeholder="Popis stránky, co návštěvník dostane…"
                maxLength={300}
                rows={3}
                className="vs-input resize-none"
              />
              <CounterHint value={(active.seo_description ?? "").length} target={160} />
            </FormField>

            <FormField
              label="Open Graph obrázek"
              icon={<ImageIcon className="h-3 w-3" />}
              hint="1200×630 px, formát JPG/PNG/WebP"
            >
              <input
                type="url"
                value={active.og_image ?? ""}
                onChange={e => updateActive({ og_image: e.target.value })}
                placeholder="/assets/<key>/og-image.webp"
                className="vs-input"
              />
              {active.og_image && (
                <div className="mt-2 overflow-hidden rounded-md border border-[var(--vs-border-strong)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={active.og_image} alt="OG preview" className="block aspect-[1.91/1] w-full object-cover" />
                </div>
              )}
            </FormField>

            <FormField
              label="Indexace"
              icon={<ShieldCheck className="h-3 w-3" />}
              hint="Pokud zaškrtnuto, vyhledávače stránku ignorují"
            >
              <label className="flex items-center gap-2 rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!active.noindex}
                  onChange={e => updateActive({ noindex: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[var(--vs-accent)]"
                />
                <span className="text-[11.5px] text-[var(--vs-text-soft)]">Skrýt před vyhledávači (noindex)</span>
              </label>
            </FormField>

            <PreviewCard
              title={active.seo_title || active.title}
              description={active.seo_description || "Popis stránky, který se objeví ve výsledcích vyhledávání."}
              host={`webero.co/demo/${tenantSlug}`}
              path={active.slug === "home" ? "" : `/${active.slug}`}
            />
          </>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-2.5">
        <SaveStatusInline state={saveState} />
        <button
          type="button"
          onClick={save}
          disabled={saveState === "saving"}
          className="vs-grad-accent inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-semibold tracking-tight text-white disabled:opacity-60"
        >
          {saveState === "saving" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Uložit
        </button>
      </div>
      <style>{`
        .vs-input {
          width: 100%;
          background: var(--vs-bg-soft);
          border: 1px solid var(--vs-border-strong);
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 12.5px;
          color: var(--vs-text);
          outline: none;
          transition: border-color 100ms, box-shadow 150ms;
        }
        .vs-input::placeholder { color: var(--vs-text-dim); }
        .vs-input:focus {
          border-color: var(--vs-accent);
          box-shadow: 0 0 0 3px var(--vs-accent-bg);
        }
      `}</style>
    </div>
  );
}

// ── Messages panel — incoming contact form submissions ─────────────────────
interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export function MessagesPanel({ tenantSlug }: { tenantSlug: string }) {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "replied">("all");
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(true); // mobile master/detail toggle

  const reload = useCallback(async () => {
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/contact`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json() as { messages: ContactMessage[] };
      setMessages(json.messages ?? []);
      if (json.messages?.[0]) setActiveId((id) => id ?? json.messages[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Načtení selhalo");
    }
  }, [tenantSlug]);

  useEffect(() => { void reload(); }, [reload]);

  async function setStatus(id: number, status: ContactMessage["status"]) {
    setBusy(true);
    try {
      await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await reload();
    } finally { setBusy(false); }
  }

  async function remove(id: number) {
    if (!window.confirm("Smazat tuto zprávu?")) return;
    setBusy(true);
    try {
      await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (activeId === id) setActiveId(null);
      await reload();
    } finally { setBusy(false); }
  }

  function exportCsv() {
    if (!messages || messages.length === 0) return;
    const header = ["Datum", "Jméno", "E-mail", "Telefon", "Status", "Zpráva"];
    const rows = messages.map((m) => [
      new Date(m.created_at).toLocaleString("cs"),
      m.name,
      m.email,
      m.phone ?? "",
      m.status,
      m.message.replace(/"/g, '""'),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((c) => `"${c}"`).join(","))
      .join("\n");
    const bom = "﻿"; // for Excel UTF-8 recognition
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webero-zpravy-${tenantSlug}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (error && !messages) return <ErrorState message={error} />;
  if (!messages) return <LoadingState />;

  const counts = {
    all: messages.length,
    new: messages.filter((m) => m.status === "new").length,
    read: messages.filter((m) => m.status === "read").length,
    replied: messages.filter((m) => m.status === "replied").length,
  };

  const q = search.trim().toLowerCase();
  const filtered = messages.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q) ||
      (m.phone ?? "").toLowerCase().includes(q)
    );
  });

  const active = filtered.find((m) => m.id === activeId) ?? filtered[0];

  if (messages.length === 0) {
    return (
      <EmptyState
        Icon={Mail}
        title="Žádné zprávy"
        description="Když někdo odešle kontaktní formulář, zpráva se objeví tady."
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat ve zprávách…"
              className="block w-full rounded-md border border-[var(--vs-border-strong)] bg-white py-1.5 pl-8 pr-2.5 text-[11.5px] text-[var(--vs-text)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            title="Stáhnout CSV"
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-white px-2.5 text-[11px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {([
            ["all", "Vše", counts.all],
            ["new", "Nové", counts.new],
            ["read", "Přečtené", counts.read],
            ["replied", "Odpovězeno", counts.replied],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`inline-flex h-7 items-center rounded-full px-2.5 text-[10.5px] font-semibold transition-colors ${
                filter === key
                  ? "bg-slate-900 text-white"
                  : "border border-[var(--vs-border-strong)] bg-white text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
              }`}
            >
              {label}
              <span className={`ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9.5px] ${
                filter === key ? "bg-white/20" : "bg-slate-100 text-slate-600"
              }`}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Master-detail layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* List — full width on mobile when detail not shown */}
        <div className={`flex w-full shrink-0 flex-col overflow-y-auto border-[var(--vs-border)] bg-[var(--vs-bg-soft)] sm:w-56 sm:border-r ${
          showList ? "flex" : "hidden sm:flex"
        }`}>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-[11.5px] text-[var(--vs-text-muted)]">
              Žádné zprávy pro tento filtr
            </p>
          ) : filtered.map((m) => {
            const isActive = active && m.id === active.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => { setActiveId(m.id); setShowList(false); }}
                className={`group flex flex-col gap-0.5 border-b border-[var(--vs-border)] px-2.5 py-2 text-left transition-colors ${
                  isActive ? "bg-[var(--vs-surface-2)]" : "hover:bg-[var(--vs-surface-2)]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {m.status === "new" && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--vs-accent-hi)]" />}
                  <span className="truncate text-[12px] font-medium text-[var(--vs-text)]">{m.name || m.email}</span>
                </div>
                <span className="truncate text-[10.5px] text-[var(--vs-text-muted)]">{m.message.slice(0, 38)}…</span>
                <span className="text-[10px] text-[var(--vs-text-dim)]">{new Date(m.created_at).toLocaleString("cs", { dateStyle: "short", timeStyle: "short" })}</span>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        {active && (
          <div className={`flex-1 flex-col overflow-y-auto p-3 sm:p-4 ${showList ? "hidden sm:flex" : "flex"}`}>
            <button
              type="button"
              onClick={() => setShowList(true)}
              className="mb-2 inline-flex h-7 items-center gap-1 self-start rounded-md text-[11px] font-medium text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] sm:hidden"
            >
              ← Zpět na seznam
            </button>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-[14px] font-semibold tracking-tight text-[var(--vs-text)]">{active.name}</h3>
                  {active.status === "new" && <span className="rounded-full bg-[var(--vs-accent-bg)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--vs-accent-hi)]">nová</span>}
                  {active.status === "read" && <span className="rounded-full bg-[var(--vs-surface-2)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--vs-text-muted)]">přečtená</span>}
                  {active.status === "replied" && <span className="rounded-full bg-[var(--vs-success-bg)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--vs-success)]">odpovězeno</span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[var(--vs-text-muted)]">
                  <a href={`mailto:${active.email}`} className="hover:text-[var(--vs-accent-hi)]">{active.email}</a>
                  {active.phone && <a href={`tel:${active.phone}`} className="hover:text-[var(--vs-accent-hi)]">{active.phone}</a>}
                  <span>{new Date(active.created_at).toLocaleString("cs")}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 whitespace-pre-wrap rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] p-3 text-[12.5px] leading-relaxed text-[var(--vs-text-soft)]">
              {active.message}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {active.status === "new" && (
                  <ActionBtn onClick={() => setStatus(active.id, "read")} disabled={busy}>
                    <MailOpen className="h-3 w-3" strokeWidth={2} />
                    Označit přečtené
                  </ActionBtn>
                )}
                {active.status !== "replied" && (
                  <ActionBtn onClick={() => setStatus(active.id, "replied")} disabled={busy} variant="success">
                    <MailCheck className="h-3 w-3" strokeWidth={2} />
                    Odpovězeno
                  </ActionBtn>
                )}
                <ActionBtn onClick={() => remove(active.id)} disabled={busy} variant="danger">
                  <Trash2 className="h-3 w-3" strokeWidth={2} />
                  Smazat
                </ActionBtn>
              </div>
              <a
                href={`mailto:${active.email}?subject=Re:%20${encodeURIComponent("Vaše zpráva")}`}
                className="vs-grad-accent inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-semibold text-white"
              >
                <Mail className="h-3 w-3" />
                Odpovědět
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Revisions panel — historic snapshots with restore ──────────────────────
interface Revision {
  id: number;
  page_id: number;
  page_title?: string;
  created_at: string;
  created_by?: string | null;
  section_count?: number;
}

export function RevisionsPanel({ tenantSlug }: { tenantSlug: string }) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/revisions`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as { revisions: Revision[] };
        setRevisions(json.revisions ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Načtení selhalo");
      }
    })();
  }, [tenantSlug]);

  async function restore(id: number) {
    if (!window.confirm("Obnovit tuto verzi? Aktuální stav se přepíše.")) return;
    setBusyId(id);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/revisions/${id}/restore`, { method: "POST" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Obnovení selhalo");
    } finally { setBusyId(null); }
  }

  if (error && !revisions) return <ErrorState message={error} />;
  if (!revisions) return <LoadingState />;
  if (revisions.length === 0) {
    return (
      <EmptyState
        Icon={History}
        title="Žádné verze"
        description="Verze se ukládají automaticky před každou významnou změnou."
      />
    );
  }

  // Group revisions by page so the timeline reads as "this page's history".
  const byPage = revisions.reduce<Record<string, Revision[]>>((acc, r) => {
    const key = r.page_title ?? `Stránka #${r.page_id}`;
    (acc[key] ??= []).push(r);
    return acc;
  }, {});

  function formatAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60_000) return "před chvílí";
    if (ms < 3_600_000) return `před ${Math.floor(ms / 60_000)} min`;
    if (ms < 86_400_000) return `před ${Math.floor(ms / 3_600_000)} h`;
    if (ms < 7 * 86_400_000) return `před ${Math.floor(ms / 86_400_000)} dny`;
    return new Date(iso).toLocaleDateString("cs");
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-5 p-3 sm:p-5">
        {Object.entries(byPage).map(([pageTitle, list]) => (
          <div key={pageTitle}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--vs-text)]">
                <FileText className="h-3.5 w-3.5 text-[var(--vs-text-muted)]" strokeWidth={1.75} />
                {pageTitle}
              </h4>
              <span className="text-[10.5px] text-[var(--vs-text-muted)]">{list.length} verz{list.length === 1 ? "e" : list.length < 5 ? "e" : "í"}</span>
            </div>

            <div className="relative">
              {/* vertical timeline rail */}
              <div className="absolute bottom-2 left-[15px] top-2 w-px bg-gradient-to-b from-indigo-200 via-[var(--vs-border)] to-transparent" aria-hidden />

              <ol className="space-y-2">
                {list.map((r, idx) => {
                  const prev = list[idx + 1];
                  const delta = prev && typeof r.section_count === "number" && typeof prev.section_count === "number"
                    ? r.section_count - prev.section_count
                    : 0;
                  return (
                    <li key={r.id} className="relative pl-9">
                      {/* dot */}
                      <span
                        aria-hidden
                        className={`absolute left-2.5 top-3 inline-block h-2 w-2 rounded-full ring-4 ${
                          idx === 0
                            ? "bg-indigo-500 ring-indigo-100"
                            : "bg-white ring-[var(--vs-border)]"
                        } shadow-[0_0_0_1px_rgba(99,102,241,0.45)]`}
                      />
                      <div className={`group relative overflow-hidden rounded-lg border bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
                        idx === 0 ? "border-indigo-200 ring-1 ring-inset ring-indigo-100" : "border-[var(--vs-border)]"
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11.5px] font-semibold text-[var(--vs-text)]">{formatAgo(r.created_at)}</span>
                              {idx === 0 && (
                                <span className="inline-flex h-4 items-center rounded-full bg-indigo-50 px-1.5 text-[9.5px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-200">
                                  Aktuální
                                </span>
                              )}
                              {delta > 0 && (
                                <span className="inline-flex h-4 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 text-[9.5px] font-semibold text-emerald-700">
                                  +{delta} sekc{delta === 1 ? "e" : delta < 5 ? "e" : "í"}
                                </span>
                              )}
                              {delta < 0 && (
                                <span className="inline-flex h-4 items-center gap-0.5 rounded-full bg-rose-50 px-1.5 text-[9.5px] font-semibold text-rose-700">
                                  {delta} sekc{Math.abs(delta) === 1 ? "e" : Math.abs(delta) < 5 ? "e" : "í"}
                                </span>
                              )}
                              {delta === 0 && idx !== 0 && (
                                <span className="inline-flex h-4 items-center rounded-full bg-slate-100 px-1.5 text-[9.5px] font-semibold text-slate-600">
                                  Obsah upraven
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[10px] text-[var(--vs-text-muted)]">
                              {new Date(r.created_at).toLocaleString("cs")}
                              {r.created_by && <> · {r.created_by}</>}
                              {typeof r.section_count === "number" && <> · celkem {r.section_count} sekcí</>}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void restore(r.id)}
                            disabled={idx === 0 || busyId === r.id}
                            title={idx === 0 ? "Aktuální verze" : "Obnovit tuto verzi"}
                            className="inline-flex h-8 sm:h-7 w-8 sm:w-auto shrink-0 items-center justify-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-white sm:px-2.5 text-[10.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30"
                          >
                            {busyId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                            <span className="hidden sm:inline">{idx === 0 ? "Aktivní" : "Obnovit"}</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Audit panel — chronological action log ────────────────────────────────
interface AuditEvent {
  id: number;
  action: string;
  target_type: string | null;
  target_id: string | null;
  actor_email: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger" }> = {
  section_updated:               { label: "Sekce upravena",   tone: "accent" },
  section_overrides_reset:       { label: "Reset sekce",      tone: "warning" },
  sections_saved:                { label: "Uloženo",          tone: "success" },
  section_deleted:               { label: "Sekce smazána",    tone: "danger" },
  data_slots_updated:            { label: "Brand data",       tone: "accent" },
  data_slot_deleted:             { label: "Slot smazán",      tone: "warning" },
  page_created:                  { label: "Stránka přidána",  tone: "success" },
  page_updated:                  { label: "Stránka upravena", tone: "accent" },
  page_deleted:                  { label: "Stránka smazána",  tone: "danger" },
  tenant_published_to_homepage:  { label: "Web spuštěn",      tone: "success" },
  tenant_changed_template:       { label: "Změna designu",    tone: "accent" },
  media_uploaded:                { label: "Obrázek nahrán",   tone: "neutral" },
};

export function AuditPanel({ tenantSlug }: { tenantSlug: string }) {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/audit`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as { events: AuditEvent[] };
        setEvents(json.events ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Načtení selhalo");
      }
    })();
  }, [tenantSlug]);

  if (error && !events) return <ErrorState message={error} />;
  if (!events) return <LoadingState />;
  if (events.length === 0) {
    return (
      <EmptyState
        Icon={ShieldCheck}
        title="Zatím žádné záznamy"
        description="Každá změna ve studiu se sem zapíše s časem a autorem."
      />
    );
  }

  return (
    <div className="overflow-y-auto vs-scroll">
      <ol className="relative px-3 py-3">
        {/* Vertical timeline line */}
        <span aria-hidden className="absolute left-[19px] top-3 bottom-3 w-px bg-[var(--vs-border)]" />
        {events.map((e) => {
          const meta = ACTION_LABELS[e.action] ?? { label: e.action, tone: "neutral" as const };
          return (
            <li key={e.id} className="relative mb-3 pl-9">
              <span
                className="absolute left-[14px] top-1.5 h-2.5 w-2.5 rounded-full"
                style={{
                  background:
                    meta.tone === "accent" ? "var(--vs-accent-hi)" :
                    meta.tone === "success" ? "var(--vs-success)" :
                    meta.tone === "warning" ? "var(--vs-warning)" :
                    meta.tone === "danger" ? "var(--vs-danger)" :
                    "var(--vs-text-dim)",
                  boxShadow: "0 0 0 2px var(--vs-bg)",
                }}
              />
              <div className="rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-medium text-[var(--vs-text)]">{meta.label}</span>
                  <span className="text-[10px] text-[var(--vs-text-dim)]">{new Date(e.created_at).toLocaleString("cs")}</span>
                </div>
                {(e.target_type || e.actor_email) && (
                  <div className="mt-1 text-[10.5px] text-[var(--vs-text-muted)]">
                    {e.target_type && <code className="rounded bg-[var(--vs-surface-2)] px-1 py-px text-[10px]">{e.target_type}{e.target_id ? `#${e.target_id}` : ""}</code>}
                    {e.actor_email && <> · {e.actor_email}</>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Building blocks ────────────────────────────────────────────────────────
function FormField({
  label, icon, hint, children,
}: { label: string; icon?: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
        {icon}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10.5px] text-[var(--vs-text-dim)]">{hint}</p>}
    </div>
  );
}

function CounterHint({ value, target }: { value: number; target: number }) {
  const over = value > target;
  return (
    <p className={`mt-1 text-[10px] ${over ? "text-[var(--vs-warning)]" : "text-[var(--vs-text-dim)]"}`}>
      {value}/{target} znaků {over && "(příliš dlouhé)"}
    </p>
  );
}

function PreviewCard({
  title, description, host, path,
}: { title: string; description: string; host: string; path: string }) {
  return (
    <div className="mt-2 rounded-md border border-[var(--vs-border-strong)] bg-white/95 p-3 shadow-[var(--vs-shadow-md)]">
      <div className="text-[10.5px] text-emerald-700 tracking-tight">{host}{path}</div>
      <div className="mt-0.5 text-[15px] font-medium leading-snug text-blue-700">{title}</div>
      <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-gray-700">{description}</div>
      <p className="mt-1.5 text-[9.5px] uppercase tracking-wider text-gray-400">Náhled v Google</p>
    </div>
  );
}

function SaveStatusInline({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "saving") return <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--vs-warning)]"><Loader2 className="h-3 w-3 animate-spin" /> Ukládám…</span>;
  if (state === "saved")  return <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--vs-success)]"><Save className="h-3 w-3" /> Uloženo</span>;
  if (state === "error")  return <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--vs-danger)]">Chyba ukládání</span>;
  return <span className="text-[10.5px] text-[var(--vs-text-dim)]">Změny se neukládají automaticky.</span>;
}

function ActionBtn({
  children, onClick, disabled, variant = "default",
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "default" | "success" | "danger" }) {
  const base = "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-[background,color] duration-100";
  const variants = {
    default: "border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]",
    success: "bg-[var(--vs-success-bg)] text-[var(--vs-success)] ring-1 ring-inset ring-[rgba(52,211,153,0.30)] hover:bg-[rgba(52,211,153,0.18)]",
    danger:  "bg-[var(--vs-danger-bg)]  text-[var(--vs-danger)]  ring-1 ring-inset ring-[rgba(248,113,113,0.30)] hover:bg-[rgba(248,113,113,0.18)]",
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} disabled:opacity-50`}>
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center text-[12px] text-[var(--vs-text-muted)]">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Načítám…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-[12px] text-[var(--vs-danger)]">{message}</p>
    </div>
  );
}

function EmptyState({
  Icon, title, description,
}: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vs-surface)] ring-1 ring-[var(--vs-border-strong)] shadow-[var(--vs-shadow-md)]">
        <Icon className="h-5 w-5 text-[var(--vs-text-muted)]" strokeWidth={1.5} />
      </div>
      <h4 className="text-[13px] font-semibold text-[var(--vs-text)]">{title}</h4>
      <p className="mt-1.5 max-w-[260px] text-[11.5px] leading-snug text-[var(--vs-text-muted)]">{description}</p>
    </div>
  );
}

/* ============================================================================
   PagesPanel — list, create, rename, publish/unpublish and delete pages.
   Backend already exists at /api/demo/<slug>/pages (GET, POST) and
   /api/demo/<slug>/pages/<id> (PATCH, DELETE).
   ============================================================================ */

interface PagesPageRow {
  id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  noindex: boolean | null;
  updated_at: string;
  sections_count: number;
}

interface MenuLink { label: string; href: string }
interface MenuState { navbar: MenuLink[]; footer: MenuLink[] }

export function PagesPanel({ tenantSlug }: { tenantSlug: string }) {
  const [pages, setPages] = useState<PagesPageRow[] | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const load = useCallback(async () => {
    try {
      const [pagesRes, menuRes] = await Promise.all([
        fetch(`/api/demo/${tenantSlug}/pages`, { cache: "no-store" }),
        fetch(`/api/demo/${tenantSlug}/menu`, { cache: "no-store" }),
      ]);
      if (!pagesRes.ok) throw new Error(`HTTP ${pagesRes.status}`);
      const pagesJson = await pagesRes.json() as { pages: PagesPageRow[] };
      setPages(pagesJson.pages);
      if (menuRes.ok) {
        const menuJson = await menuRes.json() as MenuState;
        setMenu({ navbar: menuJson.navbar ?? [], footer: menuJson.footer ?? [] });
      } else {
        setMenu({ navbar: [], footer: [] });
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, [tenantSlug]);

  useEffect(() => { load(); }, [load]);

  function pageHref(p: PagesPageRow) {
    return p.is_homepage ? "/" : `/${p.slug}`;
  }

  function isInMenu(p: PagesPageRow, location: "navbar" | "footer") {
    if (!menu) return false;
    const target = pageHref(p);
    return menu[location].some(l => l.href === target);
  }

  async function handleToggleMenu(p: PagesPageRow, location: "navbar" | "footer") {
    if (!menu) return;
    const href = pageHref(p);
    const present = isInMenu(p, location);
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/menu`, {
        method: present ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(
          present ? { location, href } : { location, href, label: p.title }
        ),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { alert(json.error ?? `Chyba ${r.status}`); return; }
      await load();
    } finally { setBusy(false); }
  }

  function slugify(s: string) {
    return s
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  async function handleCreate() {
    if (!newTitle.trim()) { alert("Vyplňte název stránky"); return; }
    const slug = (newSlug.trim() || slugify(newTitle)).trim();
    if (!slug) { alert("Neplatný URL"); return; }
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title: newTitle.trim(), slug }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { alert(json.error ?? `Chyba ${r.status}`); return; }
      setCreating(false);
      setNewTitle(""); setNewSlug("");
      await load();
    } finally { setBusy(false); }
  }

  async function handleSaveEdit(id: number, isHomepage: boolean) {
    const payload: Record<string, string> = { title: editTitle.trim() };
    if (!isHomepage && editSlug.trim()) payload.slug = editSlug.trim();
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { alert(json.error ?? `Chyba ${r.status}`); return; }
      setEditingId(null);
      await load();
    } finally { setBusy(false); }
  }

  async function handleTogglePublish(p: PagesPageRow) {
    if (p.is_homepage) return;
    const next = p.status === "published" ? "draft" : "published";
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/pages/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: next }),
      });
      if (!r.ok) {
        const json = await r.json().catch(() => ({}));
        alert(json.error ?? `Chyba ${r.status}`);
        return;
      }
      await load();
    } finally { setBusy(false); }
  }

  async function handleTranslate(p: PagesPageRow) {
    const locales = [
      ["en", "English"], ["de", "Deutsch"], ["sk", "Slovenčina"],
      ["pl", "Polski"], ["uk", "Українська"], ["es", "Español"],
      ["fr", "Français"], ["it", "Italiano"],
    ] as const;
    const choice = window.prompt(
      `Přeložit „${p.title}" do jazyka:\n\n` +
        locales.map(([k, label], i) => `${i + 1}. ${label} (${k})`).join("\n") +
        `\n\nNapiš kód jazyka (en/de/sk/pl/uk/es/fr/it):`,
      "en"
    );
    if (!choice) return;
    const locale = choice.trim().toLowerCase();
    if (!locales.some(([k]) => k === locale)) {
      alert("Neplatný kód jazyka.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/pages/${p.id}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ locale }),
      });
      const json = await r.json().catch(() => ({}));
      if (r.status === 409) {
        alert(`Stránka „${json.targetSlug}" už existuje. Otevři ji nebo smaž a zkus znovu.`);
        return;
      }
      if (!r.ok) { alert(json.error ?? `Chyba ${r.status}`); return; }
      alert(`✅ Přeloženo do ${locale.toUpperCase()}!\n\nNová stránka: /${json.targetSlug}\nPřeloženo řetězců: ${json.stringsTranslated}`);
      await load();
    } finally { setBusy(false); }
  }

  async function handleClear(p: PagesPageRow) {
    const msg = `Vyčistit stránku „${p.title}"?\n\n• Všechny sekce kromě hlavičky a patičky se smažou.\n• Předchozí stav se uloží do Verze — můžeš se k němu vrátit.\n\nPokračovat?`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/pages/${p.id}/clear`, {
        method: "POST",
        credentials: "same-origin",
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { alert(json.error ?? `Chyba ${r.status}`); return; }
      alert(`Vyčištěno — odstraněno ${json.removed} sekcí.`);
      await load();
    } finally { setBusy(false); }
  }

  async function handleDelete(p: PagesPageRow) {
    if (p.is_homepage) return;
    if (!window.confirm(`Smazat stránku „${p.title}" (${p.slug})?\n\nSekce stránky budou nenávratně smazány.`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/pages/${p.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!r.ok) {
        const json = await r.json().catch(() => ({}));
        alert(json.error ?? `Chyba ${r.status}`);
        return;
      }
      await load();
    } finally { setBusy(false); }
  }

  if (error) return <ErrorState message={error} />;
  if (!pages) return <LoadingState />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">Stránky webu</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">{pages.length} {pages.length === 1 ? "stránka" : pages.length < 5 ? "stránky" : "stránek"} — úvodní chráněná</p>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(99,102,241,0.30)] hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            <span className="hidden sm:inline">Nová stránka</span>
            <span className="sm:hidden">Nová</span>
          </button>
        )}
      </div>

      {creating && (
        <div className="border-b border-[var(--vs-border)] bg-white px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Název stránky">
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlug) setNewSlug(slugify(e.target.value));
                }}
                placeholder="O nás"
                className="block w-full rounded-md border border-[var(--vs-border-strong)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--vs-text)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </FormField>
            <FormField label="URL (slug)" hint="Použij jen malá písmena, čísla a pomlčky">
              <div className="flex items-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-white px-2.5 py-1.5 text-[12px]">
                <span className="text-[var(--vs-text-dim)]">/</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(slugify(e.target.value))}
                  placeholder="o-nas"
                  className="flex-1 bg-transparent text-[var(--vs-text)] focus:outline-none"
                />
              </div>
            </FormField>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { setCreating(false); setNewTitle(""); setNewSlug(""); }}
              className="inline-flex h-7 items-center rounded-md px-2.5 text-[11.5px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)]"
            >Zrušit</button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy}
              className="inline-flex h-7 items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 text-[11.5px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Vytvořit
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="hidden sm:block overflow-hidden rounded-lg border border-[var(--vs-border)] bg-white">
          <table className="w-full text-[12px]">
            <thead className="bg-[var(--vs-bg-soft)] text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--vs-text-muted)]">
              <tr>
                <th className="px-3 py-2">Stránka</th>
                <th className="px-3 py-2">URL</th>
                <th className="px-3 py-2 text-center">Sekce</th>
                <th className="px-3 py-2">Stav</th>
                <th className="px-3 py-2 text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => {
                const editing = editingId === p.id;
                return (
                  <tr key={p.id} className="border-t border-[var(--vs-border)]">
                    <td className="px-3 py-2.5">
                      {editing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded border border-[var(--vs-border-strong)] bg-white px-2 py-1 text-[12px] text-[var(--vs-text)] focus:border-indigo-400 focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {p.is_homepage && <Home className="h-3.5 w-3.5 text-indigo-500" strokeWidth={2} />}
                          <span className="font-medium text-[var(--vs-text)]">{p.title}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {editing && !p.is_homepage ? (
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(slugify(e.target.value))}
                          className="w-full rounded border border-[var(--vs-border-strong)] bg-white px-2 py-1 font-mono text-[11.5px] text-[var(--vs-text)] focus:border-indigo-400 focus:outline-none"
                        />
                      ) : (
                        <code className="font-mono text-[11.5px] text-[var(--vs-text-soft)]">
                          /{p.is_homepage ? "" : p.slug}
                        </code>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[var(--vs-text-soft)]">{p.sections_count}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider ${
                        p.status === "published"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                      }`}>
                        {p.status === "published" ? "Publikováno" : "Koncept"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {editing ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(p.id, p.is_homepage)}
                            disabled={busy}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                            title="Uložit"
                          ><Check className="h-3 w-3" /></button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)]"
                            title="Zrušit"
                          ><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={`/demo/${tenantSlug}${p.is_homepage ? "" : "/" + p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-indigo-600"
                            title="Otevřít stránku v novém okně"
                          ><ExternalLink className="h-3 w-3" /></a>
                          <button
                            type="button"
                            onClick={() => handleToggleMenu(p, "navbar")}
                            disabled={busy}
                            title={isInMenu(p, "navbar") ? "Odebrat z hlavičky" : "Přidat do hlavičky"}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md disabled:opacity-50 ${
                              isInMenu(p, "navbar")
                                ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100"
                                : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
                            }`}
                          ><PanelTop className="h-3 w-3" /></button>
                          <button
                            type="button"
                            onClick={() => handleToggleMenu(p, "footer")}
                            disabled={busy}
                            title={isInMenu(p, "footer") ? "Odebrat z patičky" : "Přidat do patičky"}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md disabled:opacity-50 ${
                              isInMenu(p, "footer")
                                ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100"
                                : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
                            }`}
                          ><PanelBottom className="h-3 w-3" /></button>
                          <button
                            type="button"
                            onClick={() => { setEditingId(p.id); setEditTitle(p.title); setEditSlug(p.slug); }}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
                            title="Přejmenovat"
                          ><Pencil className="h-3 w-3" /></button>
                          <button
                            type="button"
                            onClick={() => handleClear(p)}
                            disabled={busy || p.sections_count <= 2}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-amber-600 hover:bg-amber-50 disabled:opacity-30"
                            title="Vyčistit obsah (zachovat hlavičku + patičku)"
                          ><RotateCcw className="h-3 w-3" /></button>
                          <button
                            type="button"
                            onClick={() => handleTranslate(p)}
                            disabled={busy}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-indigo-600 hover:bg-indigo-50 disabled:opacity-30"
                            title="Přeložit do jiného jazyka (AI)"
                          ><Globe className="h-3 w-3" /></button>
                          {!p.is_homepage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(p)}
                                disabled={busy}
                                className="inline-flex h-6 items-center rounded-md px-2 text-[10.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-50"
                                title={p.status === "published" ? "Změnit na koncept" : "Publikovat"}
                              >{p.status === "published" ? "Skrýt" : "Publikovat"}</button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p)}
                                disabled={busy}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                                title="Smazat"
                              ><Trash2 className="h-3 w-3" /></button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="space-y-2 sm:hidden">
          {pages.map((p) => (
            <div key={p.id} className="rounded-lg border border-[var(--vs-border)] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {p.is_homepage && <Home className="h-3.5 w-3.5 shrink-0 text-indigo-500" strokeWidth={2} />}
                    <span className="truncate text-[13.5px] font-semibold text-[var(--vs-text)]">{p.title}</span>
                  </div>
                  <code className="block truncate font-mono text-[11px] text-[var(--vs-text-soft)]">
                    /{p.is_homepage ? "" : p.slug}
                  </code>
                </div>
                <span className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider ${
                  p.status === "published"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                }`}>
                  {p.status === "published" ? "Publik." : "Konc."}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-[var(--vs-text-muted)]">
                <span>{p.sections_count} {p.sections_count === 1 ? "sekce" : p.sections_count < 5 ? "sekce" : "sekcí"}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1">
                <a
                  href={`/demo/${tenantSlug}${p.is_homepage ? "" : "/" + p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-white px-2.5 text-[11px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
                >
                  <ExternalLink className="h-3 w-3" />
                  Otevřít
                </a>
                <button
                  type="button"
                  onClick={() => handleToggleMenu(p, "navbar")}
                  disabled={busy}
                  className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-medium disabled:opacity-50 ${
                    isInMenu(p, "navbar")
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                      : "border border-[var(--vs-border-strong)] bg-white text-[var(--vs-text-soft)]"
                  }`}
                >
                  <PanelTop className="h-3 w-3" />
                  Hlavička
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMenu(p, "footer")}
                  disabled={busy}
                  className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-medium disabled:opacity-50 ${
                    isInMenu(p, "footer")
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                      : "border border-[var(--vs-border-strong)] bg-white text-[var(--vs-text-soft)]"
                  }`}
                >
                  <PanelBottom className="h-3 w-3" />
                  Patička
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingId(p.id); setEditTitle(p.title); setEditSlug(p.slug); }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--vs-border-strong)] bg-white text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)]"
                  title="Přejmenovat"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleClear(p)}
                  disabled={busy || p.sections_count <= 2}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-30"
                  title="Vyčistit obsah"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTranslate(p)}
                  disabled={busy}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-30"
                  title="Přeložit AI"
                >
                  <Globe className="h-3 w-3" />
                </button>
                {!p.is_homepage && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(p)}
                      disabled={busy}
                      className="inline-flex h-8 items-center rounded-md border border-[var(--vs-border-strong)] bg-white px-2 text-[11px] font-medium text-[var(--vs-text-soft)] disabled:opacity-50"
                    >
                      {p.status === "published" ? "Skrýt" : "Publik."}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      disabled={busy}
                      className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                      title="Smazat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 text-[10.5px] text-[var(--vs-text-dim)]">
          <p>Po vytvoření je nová stránka prázdná — sekce přidáš v Page Builderu po otevření stránky v editoru.</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1"><ExternalLink className="h-2.5 w-2.5" /> otevřít stránku</span>
            <span className="inline-flex items-center gap-1"><PanelTop className="h-2.5 w-2.5" /> hlavička</span>
            <span className="inline-flex items-center gap-1"><PanelBottom className="h-2.5 w-2.5" /> patička</span>
            <span className="inline-flex items-center gap-1"><Pencil className="h-2.5 w-2.5" /> přejmenovat</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   TemplatePanel — show current template/version + grid of available templates
   from /api/template-lab/catalog. Swap via POST /api/demo/<slug>/change-template.
   ============================================================================ */

interface CatalogItem {
  key: string;
  name: string;
  industry: string;
  primaryColor: string;
  screenshot: string | null;
}

interface TenantTemplateInfo {
  templateKey: string | null;
  templateName: string | null;
  templateVersion: string | null;
}

export function TemplatePanel({ tenantSlug }: { tenantSlug: string }) {
  const [catalog, setCatalog] = useState<CatalogItem[] | null>(null);
  const [current, setCurrent] = useState<TenantTemplateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [swapping, setSwapping] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cat, info] = await Promise.all([
        fetch("/api/template-lab/catalog", { cache: "no-store" }).then(r => r.ok ? r.json() : Promise.reject(new Error(`Katalog HTTP ${r.status}`))),
        fetch(`/api/demo/${tenantSlug}/tenant-info`, { cache: "no-store" }).then(r => r.ok ? r.json() : null),
      ]);
      setCatalog((cat as { templates: CatalogItem[] }).templates);
      const t = (info as { tenant?: { templateKey?: string | null; templateName?: string | null; templateVersion?: string | null } } | null)?.tenant;
      setCurrent({
        templateKey: t?.templateKey ?? null,
        templateName: t?.templateName ?? null,
        templateVersion: t?.templateVersion ?? null,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }, [tenantSlug]);

  useEffect(() => { load(); }, [load]);

  async function handleSwap(target: CatalogItem) {
    if (current?.templateKey === target.key) return;
    const msg = `Vyměnit šablonu za „${target.name}"?\n\n` +
      "• Sekce úvodní stránky se přebudují podle nové šablony (obsah konkrétních sekcí se ztratí).\n" +
      "• Brand, kontakt, otvírací doba, soc. sítě a SEO zůstanou zachovány.\n" +
      "• Blog, média a domény zůstanou zachovány.\n\n" +
      "Pokračovat?";
    if (!window.confirm(msg)) return;
    setSwapping(target.key);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/change-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ targetTemplateKey: target.key, confirm: true }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { alert(json.error ?? `Chyba ${r.status}`); setSwapping(null); return; }
      window.location.reload();
    } catch (e) {
      alert(`Změna selhala: ${(e as Error).message}`);
      setSwapping(null);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!catalog || !current) return <LoadingState />;

  const industries = Array.from(new Set(catalog.map(c => c.industry))).sort();
  const q = filter.trim().toLowerCase();
  const filtered = catalog.filter(c =>
    (!industryFilter || c.industry === industryFilter) &&
    (!q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.key.toLowerCase().includes(q))
  );

  return (
    <div className="flex h-full flex-col">
      {/* Current template banner */}
      <div className="border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-5 py-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]"
            style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
          >
            <LayoutTemplate className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--vs-text-muted)]">Aktuální šablona</p>
            <h3 className="mt-0.5 text-[14px] font-semibold text-[var(--vs-text)]">
              {current.templateName ?? current.templateKey ?? "Neznámá"}
            </h3>
            <p className="text-[11.5px] text-[var(--vs-text-soft)]">
              <code className="font-mono">{current.templateKey ?? "—"}</code>
              {current.templateVersion && <> · verze {current.templateVersion}</>}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <p>
            Změna šablony přebuduje sekce úvodní stránky. Brand, kontakt, soc. sítě,
            blog a média zůstanou zachovány. <strong>Obsah individuálních sekcí (texty, obrázky) se ztratí.</strong>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--vs-border)] bg-white px-5 py-3">
        <div className="relative flex-1 min-w-[180px]">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Hledat šablonu…"
            className="block w-full rounded-md border border-[var(--vs-border-strong)] bg-white px-3 py-1.5 text-[12px] text-[var(--vs-text)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button
          type="button"
          onClick={() => setIndustryFilter(null)}
          className={`inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-medium ${
            industryFilter === null
              ? "bg-slate-900 text-white"
              : "border border-[var(--vs-border-strong)] bg-white text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
          }`}
        >Vše ({catalog.length})</button>
        {industries.map(ind => (
          <button
            key={ind}
            type="button"
            onClick={() => setIndustryFilter(ind === industryFilter ? null : ind)}
            className={`inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-medium ${
              industryFilter === ind
                ? "bg-slate-900 text-white"
                : "border border-[var(--vs-border-strong)] bg-white text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
            }`}
          >{ind}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {filtered.length === 0 ? (
          <EmptyState Icon={LayoutTemplate} title="Žádná šablona" description="Pro zvolený filtr nejsou k dispozici žádné šablony." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(tpl => {
              const isCurrent = tpl.key === current.templateKey;
              const isSwapping = swapping === tpl.key;
              return (
                <div
                  key={tpl.key}
                  className={`group relative overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all ${
                    isCurrent ? "border-indigo-400 ring-2 ring-indigo-100" : "border-[var(--vs-border)] hover:border-[var(--vs-border-strong)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                  }`}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-[var(--vs-surface-2)]">
                    {tpl.screenshot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tpl.screenshot} alt={tpl.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ background: tpl.primaryColor }}>
                        <LayoutTemplate className="h-8 w-8 text-white/80" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate text-[13px] font-semibold text-[var(--vs-text)]">{tpl.name}</h4>
                      <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-2 text-[10px] font-medium uppercase tracking-wider text-slate-600">
                        {tpl.industry}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[10.5px] text-[var(--vs-text-dim)]">{tpl.key}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <a
                        href={`/template-preview/${tpl.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-white px-2.5 text-[11px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
                      >
                        <ExternalLink className="h-3 w-3" strokeWidth={2} />
                        Náhled
                      </a>
                      {isCurrent ? (
                        <span className="inline-flex h-7 items-center gap-1 rounded-md bg-indigo-50 px-2.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                          Aktivní
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSwap(tpl)}
                          disabled={!!swapping}
                          className="inline-flex h-7 items-center gap-1 rounded-md bg-slate-900 px-2.5 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          {isSwapping ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" strokeWidth={2.5} />}
                          {isSwapping ? "Měním…" : "Vyměnit"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


/* ============================================================================
   DesignPanel — global brand tokens (colors, fonts, radius) with a live
   preview card. Saves go to POST /api/demo/<slug>/design-tokens which
   mirrors the tokens to every section's settings.designTokens.
   ============================================================================ */

interface DesignTokens {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  colorTextMuted: string;
  colorBorder: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
}

const FONT_OPTIONS = [
  { label: "Inter (Modern)", value: "Inter, sans-serif" },
  { label: "Poppins (Friendly)", value: "Poppins, sans-serif" },
  { label: "Montserrat (Bold)", value: "Montserrat, sans-serif" },
  { label: "Playfair Display (Editorial)", value: "\"Playfair Display\", serif" },
  { label: "Cormorant Garamond (Luxury)", value: "\"Cormorant Garamond\", serif" },
  { label: "Lora (Classic)", value: "Lora, serif" },
  { label: "DM Sans (Clean)", value: "\"DM Sans\", sans-serif" },
  { label: "Figtree (Tech)", value: "Figtree, sans-serif" },
  { label: "Cinzel (Heritage)", value: "Cinzel, serif" },
  { label: "Josefin Sans (Soft)", value: "\"Josefin Sans\", sans-serif" },
];

const RADIUS_OPTIONS = [
  { label: "0 (Ostrý)", value: "0px" },
  { label: "4 px", value: "4px" },
  { label: "8 px", value: "8px" },
  { label: "12 px", value: "12px" },
  { label: "16 px (Soft)", value: "16px" },
  { label: "24 px (Pill)", value: "24px" },
];

export function DesignPanel({ tenantSlug }: { tenantSlug: string }) {
  const [tokens, setTokens] = useState<DesignTokens | null>(null);
  const [savedTokens, setSavedTokens] = useState<DesignTokens | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/design-tokens`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as { tokens: DesignTokens };
        setTokens(json.tokens);
        setSavedTokens(json.tokens);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [tenantSlug]);

  function update<K extends keyof DesignTokens>(key: K, value: DesignTokens[K]) {
    setTokens((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  const dirty = !!tokens && !!savedTokens && JSON.stringify(tokens) !== JSON.stringify(savedTokens);

  async function save() {
    if (!tokens) return;
    setSaveState("saving");
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/design-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(tokens),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { setSaveState("error"); alert(json.error ?? `Chyba ${r.status}`); return; }
      setSavedTokens(tokens);
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => s === "saved" ? "idle" : s), 1800);
    } catch (e) {
      setSaveState("error");
      alert(`Uložení selhalo: ${(e as Error).message}`);
    }
  }

  function reset() {
    if (savedTokens) setTokens(savedTokens);
  }

  if (error) return <ErrorState message={error} />;
  if (!tokens) return <LoadingState />;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">Vzhled webu</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">Barvy, fonty a tvar rohu — změna se projeví na celém webu</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {dirty && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-8 items-center rounded-md border border-[var(--vs-border-strong)] bg-white px-2.5 text-[11.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
            >Vrátit</button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saveState === "saving"}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(99,102,241,0.30)] hover:bg-indigo-700 disabled:opacity-50"
          >
            {saveState === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saveState === "saved" ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{saveState === "saving" ? "Ukládám…" : saveState === "saved" ? "Uloženo" : "Uložit na web"}</span>
            <span className="sm:hidden">{saveState === "saving" ? "Ukládám" : saveState === "saved" ? "Hotovo" : "Uložit"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-5 p-3 sm:p-5 lg:grid-cols-[1fr_360px]">
          {/* Controls */}
          <div className="space-y-5">
            <Section title="Barvy značky" icon={<Palette className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-1 gap-2.5 xs:grid-cols-2 sm:grid-cols-2 sm:gap-3">
                <ColorRow label="Primární" value={tokens.colorPrimary} onChange={(v) => update("colorPrimary", v)} hint="Hlavní akce, CTA" />
                <ColorRow label="Akcent" value={tokens.colorAccent} onChange={(v) => update("colorAccent", v)} hint="Zvýraznění, odkazy" />
                <ColorRow label="Pozadí" value={tokens.colorBackground} onChange={(v) => update("colorBackground", v)} hint="Hlavní pozadí stránky" />
                <ColorRow label="Plocha" value={tokens.colorSurface} onChange={(v) => update("colorSurface", v)} hint="Karty, sekce" />
                <ColorRow label="Text" value={tokens.colorText} onChange={(v) => update("colorText", v)} hint="Tělo textu" />
                <ColorRow label="Text ztlumený" value={tokens.colorTextMuted} onChange={(v) => update("colorTextMuted", v)} hint="Sekundární text" />
                <ColorRow label="Sekundární" value={tokens.colorSecondary} onChange={(v) => update("colorSecondary", v)} hint="Hovery, varianty" />
                <ColorRow label="Okraje" value={tokens.colorBorder} onChange={(v) => update("colorBorder", v)} hint="Borders, dividery" />
              </div>
            </Section>

            <Section title="Typografie" icon={<Type className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FontRow label="Nadpisy" value={tokens.fontHeading} onChange={(v) => update("fontHeading", v)} sample="Salon Aria" />
                <FontRow label="Tělo textu" value={tokens.fontBody} onChange={(v) => update("fontBody", v)} sample="Profesionální péče o vlasy v centru Prahy." />
              </div>
            </Section>

            <Section title="Tvar prvků" icon={<LayoutTemplate className="h-3.5 w-3.5" />}>
              <div className="flex flex-wrap gap-1.5">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update("borderRadius", r.value)}
                    className={`inline-flex h-9 items-center rounded-md border px-3 text-[11.5px] font-medium transition-colors ${
                      tokens.borderRadius === r.value
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-[var(--vs-border-strong)] bg-white text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
                    }`}
                    style={{ borderRadius: r.value === "0px" ? 6 : Math.min(parseInt(r.value, 10), 12) }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Live preview */}
          <DesignPreview tokens={tokens} sticky />
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--vs-border)] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <h4 className="mb-3 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

function ColorRow({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="flex items-center gap-2.5 rounded-lg border border-[var(--vs-border)] bg-white p-2 hover:bg-[var(--vs-surface-2)]">
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-inset ring-[var(--vs-border-strong)]">
        <input
          type="color"
          value={value.length === 7 ? value : "#6366f1"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11.5px] font-semibold text-[var(--vs-text)]">{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full bg-transparent font-mono text-[10.5px] text-[var(--vs-text-soft)] focus:outline-none"
        />
        {hint && <span className="block truncate text-[10px] text-[var(--vs-text-dim)]">{hint}</span>}
      </span>
    </label>
  );
}

function FontRow({ label, value, onChange, sample }: { label: string; value: string; onChange: (v: string) => void; sample: string }) {
  const known = FONT_OPTIONS.some((f) => f.value === value);
  return (
    <div className="rounded-lg border border-[var(--vs-border)] bg-white p-2.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--vs-text-muted)]">{label}</div>
      <select
        value={known ? value : "__custom"}
        onChange={(e) => { if (e.target.value !== "__custom") onChange(e.target.value); }}
        className="mt-1.5 block w-full rounded-md border border-[var(--vs-border-strong)] bg-white px-2 py-1.5 text-[11.5px] text-[var(--vs-text)] focus:border-indigo-400 focus:outline-none"
      >
        {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        {!known && <option value="__custom">Vlastní…</option>}
      </select>
      <div
        className="mt-2 line-clamp-2 rounded border border-dashed border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2 py-1.5 text-[14px] text-[var(--vs-text)]"
        style={{ fontFamily: value }}
      >
        {sample}
      </div>
    </div>
  );
}

function DesignPreview({ tokens, sticky }: { tokens: DesignTokens; sticky?: boolean }) {
  return (
    <div className={sticky ? "lg:sticky lg:top-3" : ""}>
      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--vs-text-muted)]">
        Živý náhled
      </div>
      <div
        className="overflow-hidden rounded-xl border shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
        style={{
          borderColor: tokens.colorBorder,
          background: tokens.colorBackground,
          color: tokens.colorText,
          fontFamily: tokens.fontBody,
        }}
      >
        {/* mini navbar */}
        <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: tokens.colorBorder, background: tokens.colorSurface }}>
          <span className="text-[11px] font-semibold tracking-tight" style={{ fontFamily: tokens.fontHeading }}>SALON ARIA</span>
          <span className="text-[9px]" style={{ color: tokens.colorTextMuted }}>ÚVOD · SLUŽBY · KONTAKT</span>
        </div>
        {/* hero */}
        <div className="px-4 py-5">
          <h2 className="text-[20px] font-semibold leading-tight tracking-tight" style={{ fontFamily: tokens.fontHeading }}>
            Profesionální péče o vlasy
          </h2>
          <p className="mt-1.5 text-[11.5px]" style={{ color: tokens.colorTextMuted }}>
            Salon Aria nabízí špičkové stylistky a moderní techniky stříhání.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex h-8 items-center px-3 text-[11px] font-semibold text-white"
            style={{
              background: tokens.colorPrimary,
              borderRadius: tokens.borderRadius,
            }}
          >Rezervovat termín</button>
        </div>
        {/* cards */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          {["Stříhání", "Barvení"].map((s) => (
            <div
              key={s}
              className="border px-3 py-2.5"
              style={{
                borderColor: tokens.colorBorder,
                background: tokens.colorSurface,
                borderRadius: tokens.borderRadius,
              }}
            >
              <div className="text-[11.5px] font-semibold" style={{ fontFamily: tokens.fontHeading }}>{s}</div>
              <div className="mt-0.5 text-[10px]" style={{ color: tokens.colorAccent }}>od 590 Kč</div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[10.5px] text-[var(--vs-text-dim)]">
        Náhled používá tvé nové tokeny lokálně. Klikni „Uložit na web" pro propsání do živé stránky.
      </p>
    </div>
  );
}



/* ============================================================================
   SeoScoreCard — Yoast-style weighted health badge with expandable checklist.
   Pulls deterministic checks from /api/demo/<slug>/seo-score?pageId=<id>.
   ============================================================================ */

interface SeoCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  weight: number;
  hint: string;
}

interface SeoScore {
  score: number;
  checks: SeoCheck[];
  stats: { sections: number; images: number; imagesMissingAlt: number; titleLen: number; descLen: number };
}

function SeoScoreCard({ tenantSlug, pageId }: { tenantSlug: string; pageId: number }) {
  const [data, setData] = useState<SeoScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/seo-score?pageId=${pageId}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as SeoScore;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => { cancelled = true; };
  }, [tenantSlug, pageId]);

  if (error) {
    return <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">SEO skóre: {error}</div>;
  }
  if (!data) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-[var(--vs-border)] bg-white px-3 py-2 text-[11px] text-[var(--vs-text-muted)]">
        <Loader2 className="h-3 w-3 animate-spin" /> Vyhodnocuji SEO…
      </div>
    );
  }

  const tone =
    data.score >= 85 ? { ring: "ring-emerald-200", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", arc: "#10b981", label: "Skvělé" } :
    data.score >= 60 ? { ring: "ring-amber-200", chip: "bg-amber-50 text-amber-700 ring-amber-200", arc: "#f59e0b", label: "Lze vylepšit" } :
                       { ring: "ring-rose-200", chip: "bg-rose-50 text-rose-700 ring-rose-200", arc: "#ef4444", label: "Vyžaduje pozornost" };

  const failed = data.checks.filter((c) => c.status === "fail");
  const warned = data.checks.filter((c) => c.status === "warn");
  const passed = data.checks.filter((c) => c.status === "pass");

  // SVG arc — half-circle gauge
  const radius = 32;
  const circ = Math.PI * radius;
  const offset = circ - (circ * data.score) / 100;

  return (
    <div className={`rounded-xl border ring-1 ring-inset ${tone.ring} bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}>
      <div className="flex items-start gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 80 48" className="absolute inset-0 h-full w-full">
            <path d="M8 40 A 32 32 0 0 1 72 40" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
            <path
              d="M8 40 A 32 32 0 0 1 72 40"
              fill="none"
              stroke={tone.arc}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.18,0.89,0.32,1)" }}
            />
          </svg>
          <div className="relative -mb-2 text-center leading-none">
            <div className="text-[18px] font-bold text-[var(--vs-text)]">{data.score}</div>
            <div className="text-[8px] font-semibold uppercase tracking-widest text-[var(--vs-text-muted)]">SCORE</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${tone.chip}`}>
              {tone.label}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--vs-text-soft)]">
            {failed.length > 0 ? <span className="font-semibold text-rose-700">{failed.length} chyb</span> : "Žádné kritické chyby"}
            {warned.length > 0 && <> · <span className="text-amber-700">{warned.length} vylepšení</span></>}
            {" · "}
            <span className="text-emerald-700">{passed.length}/{data.checks.length} v pořádku</span>
          </p>
          <button
            type="button"
            onClick={() => setExpanded((x) => !x)}
            className="mt-1 inline-flex h-6 items-center gap-1 text-[10.5px] font-medium text-indigo-600 hover:text-indigo-700"
          >
            {expanded ? "Skrýt detail" : "Zobrazit všechny kontroly"}
            <RotateCcw className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2} />
          </button>
        </div>
      </div>

      {expanded && (
        <ul className="mt-3 space-y-1.5">
          {data.checks.map((c) => (
            <li key={c.id} className="flex items-start gap-2 rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2">
              <span
                aria-hidden
                className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white ${
                  c.status === "pass" ? "bg-emerald-500" : c.status === "warn" ? "bg-amber-500" : "bg-rose-500"
                }`}
              >
                {c.status === "pass" ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : c.status === "warn" ? <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} /> : <X className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-semibold text-[var(--vs-text)]">{c.label}</span>
                  <span className="shrink-0 text-[9px] font-mono text-[var(--vs-text-dim)]">w{c.weight}</span>
                </div>
                <p className="mt-0.5 text-[10.5px] leading-snug text-[var(--vs-text-soft)]">{c.hint}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


/* ============================================================================
   AiTextPanel — Claude-powered Czech copywriter. Pick the kind of text
   (hero / about / service / …), describe the business and tone, get 3
   variants you can copy. Uses POST /api/demo/<slug>/ai/generate.
   ============================================================================ */

type AiKind =
  | "hero-headline" | "hero-subhead" | "cta"
  | "about" | "service" | "testimonial" | "faq" | "freeform";

type AiTone = "luxury" | "friendly" | "professional" | "playful" | "minimal";

const AI_KINDS: Array<{ key: AiKind; label: string; desc: string }> = [
  { key: "hero-headline", label: "Hero titulek", desc: "Hlavní výrazný nadpis (max 8 slov)" },
  { key: "hero-subhead",  label: "Hero podtitulek", desc: "Doprovodný text pod titulek" },
  { key: "cta",           label: "CTA tlačítko", desc: "Krátký text k akci (1-3 slova)" },
  { key: "about",         label: "O nás", desc: "Krátký odstavec o firmě" },
  { key: "service",       label: "Popis služby", desc: "Co konkrétně děláte" },
  { key: "testimonial",   label: "Recenze", desc: "Věrohodný citát klienta" },
  { key: "faq",           label: "FAQ", desc: "Otázka a odpověď" },
  { key: "freeform",      label: "Vlastní zadání", desc: "Pop si zadáte v Hint pole" },
];

const AI_TONES: Array<{ key: AiTone; label: string }> = [
  { key: "professional", label: "Profesionální" },
  { key: "friendly",     label: "Přátelský" },
  { key: "luxury",       label: "Luxusní" },
  { key: "playful",      label: "Hravý" },
  { key: "minimal",      label: "Minimal" },
];

export function AiTextPanel({ tenantSlug, businessName }: { tenantSlug: string; businessName?: string | null }) {
  const [kind, setKind] = useState<AiKind>("hero-headline");
  const [tone, setTone] = useState<AiTone>("professional");
  const [business, setBusiness] = useState(businessName ?? "");
  const [hint, setHint] = useState("");
  const [variants, setVariants] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => { if (businessName) setBusiness(businessName); }, [businessName]);

  async function generate() {
    if (!business.trim()) { alert("Vyplň název firmy"); return; }
    setLoading(true);
    setError(null);
    setVariants(null);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ kind, tone, business: business.trim(), hint: hint.trim() || undefined, count: 3 }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { setError(json.hint || json.error || `Chyba ${r.status}`); return; }
      setVariants((json.variants as string[]) ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  }

  async function copy(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((i) => i === idx ? null : i), 1400);
    } catch { /* ignore */ }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">AI copywriter</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">Claude ti napíše český text — vyber typ, klikni Generovat</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
        {/* Kind */}
        <div>
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">Co chceš napsat</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {AI_KINDS.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setKind(k.key)}
                title={k.desc}
                className={`flex flex-col items-start gap-0.5 rounded-lg border p-2 text-left transition-colors ${
                  kind === k.key
                    ? "border-indigo-400 bg-indigo-50 ring-1 ring-inset ring-indigo-200"
                    : "border-[var(--vs-border)] bg-white hover:border-[var(--vs-border-strong)]"
                }`}
              >
                <span className="text-[11.5px] font-semibold text-[var(--vs-text)]">{k.label}</span>
                <span className="line-clamp-2 text-[10px] text-[var(--vs-text-muted)]">{k.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Business + tone */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Název firmy / projektu">
            <input
              type="text"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Salon Aria"
              className="vs-input"
            />
          </FormField>
          <FormField label="Tón komunikace">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as AiTone)}
              className="vs-input"
            >
              {AI_TONES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Doplňující kontext (volitelný)" hint="Cílovka, produkt, lokalita…">
          <textarea
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Salon v centru Prahy, klientela 30-50 let, specializace na barvení balayage."
            rows={3}
            className="vs-input resize-none"
          />
        </FormField>

        <button
          type="button"
          onClick={generate}
          disabled={loading || !business.trim()}
          className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.32)] transition-transform hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" strokeWidth={2.25} />}
          {loading ? "Generuji…" : "Generovat 3 varianty"}
        </button>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
            {error}
          </div>
        )}

        {variants && variants.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">Varianty</p>
            {variants.map((v, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-[var(--vs-border)] bg-white p-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">
                  {i + 1}
                </span>
                <p className="flex-1 text-[12.5px] leading-relaxed text-[var(--vs-text)]">{v}</p>
                <button
                  type="button"
                  onClick={() => copy(v, i)}
                  className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-white px-2 text-[10.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
                  title="Kopírovat"
                >
                  {copiedIdx === i ? <Check className="h-3 w-3 text-emerald-600" /> : <FileText className="h-3 w-3" />}
                  {copiedIdx === i ? "Zkopírováno" : "Kopírovat"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ============================================================================
   StockImagesPanel — searches Unsplash via our proxied endpoint, lets the
   user pick a photo and either copy the URL or download to the tenant
   media folder (POST /api/demo/<slug>/upload-image?url=…).
   ============================================================================ */

interface StockPhoto {
  id: string;
  alt: string;
  thumb: string;
  regular: string;
  author: { name: string; url: string };
  sourceUrl: string;
  width: number;
  height: number;
}

export function StockImagesPanel({ tenantSlug }: { tenantSlug: string }) {
  const [q, setQ] = useState("");
  const [photos, setPhotos] = useState<StockPhoto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setPhotos(null);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/stock-images?q=${encodeURIComponent(q.trim())}`, { cache: "no-store" });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { setError(json.error || `Chyba ${r.status}`); return; }
      setPhotos(json.photos ?? []);
      setSource(json.source ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  }

  async function copyUrl(p: StockPhoto) {
    try {
      await navigator.clipboard.writeText(p.regular);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId((id) => id === p.id ? null : id), 1400);
    } catch { /* ignore */ }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">Stock obrázky</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">Hledej na Unsplash — kopíruj URL nebo stáhni do média</p>
        </div>
      </div>

      <form onSubmit={search} className="shrink-0 border-b border-[var(--vs-border)] bg-white px-3 py-3 sm:px-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hledat: hair salon, beauty, modern interior…"
              autoFocus
              className="block w-full rounded-md border border-[var(--vs-border-strong)] bg-white py-2 pl-9 pr-3 text-[12.5px] text-[var(--vs-text)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !q.trim()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 text-[12px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            Hledat
          </button>
        </div>
        {source === "picsum-fallback" && (
          <p className="mt-2 text-[10.5px] text-[var(--vs-text-dim)]">
            ⚠️ Bez UNSPLASH_ACCESS_KEY — používám Lorem Picsum jako placeholder. Pro reálné fotky doplň klíč v .env.local.
          </p>
        )}
      </form>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">{error}</div>}
        {photos === null && !error && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <ImageIcon className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold text-[var(--vs-text)]">Začni hledáním</p>
            <p className="mt-1 max-w-xs text-[11.5px] text-[var(--vs-text-muted)]">Napiš co potřebuješ — třeba „kavárna" nebo „flowers wedding"</p>
          </div>
        )}
        {photos !== null && photos.length === 0 && !loading && (
          <p className="py-10 text-center text-[12px] text-[var(--vs-text-muted)]">Žádné výsledky pro „{q}"</p>
        )}
        {photos && photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((p) => (
              <div key={p.id} className="group relative overflow-hidden rounded-lg border border-[var(--vs-border)] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.thumb}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <a
                    href={p.author.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-[10px] font-medium text-white/90 hover:text-white"
                    title={`Autor: ${p.author.name}`}
                  >{p.author.name}</a>
                  <button
                    type="button"
                    onClick={() => copyUrl(p)}
                    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-white/95 px-2 text-[10.5px] font-semibold text-slate-900 hover:bg-white"
                  >
                    {copiedId === p.id ? <Check className="h-3 w-3 text-emerald-600" /> : <FileText className="h-3 w-3" />}
                    {copiedId === p.id ? "OK" : "URL"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ============================================================================
   DomainWizardPanel — add a custom domain, get DNS records to copy, and
   trigger a verification check that polls dns.resolveTxt() server-side.
   ============================================================================ */

interface DomainDnsRecord {
  name: string;
  type: string;
  value: string;
  ttl: number;
  purpose: string;
}

interface TenantDomain {
  id: number;
  domain: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  instructions: DomainDnsRecord[];
}

export function DomainWizardPanel({ tenantSlug }: { tenantSlug: string }) {
  const [domains, setDomains] = useState<TenantDomain[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyDetail, setVerifyDetail] = useState<Record<number, string>>({});
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/domains`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json() as { domains: TenantDomain[] };
      setDomains(json.domains);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [tenantSlug]);

  useEffect(() => { load(); }, [load]);

  async function addDomain() {
    if (!input.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ domain: input.trim() }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { alert(json.error ?? `Chyba ${r.status}`); return; }
      setAdding(false);
      setInput("");
      await load();
    } finally { setBusy(false); }
  }

  async function verify(d: TenantDomain) {
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/domains`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: d.id }),
      });
      const json = await r.json().catch(() => ({}));
      setVerifyDetail((v) => ({ ...v, [d.id]: json.detail || (json.verified ? "Ověřeno" : "Neověřeno") }));
      if (json.verified) await load();
    } finally { setBusy(false); }
  }

  async function remove(d: TenantDomain) {
    if (!window.confirm(`Odstranit doménu „${d.domain}"?\n\nWeb na ní přestane být dostupný.`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/domains?id=${d.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error ?? `Chyba ${r.status}`); return; }
      await load();
    } finally { setBusy(false); }
  }

  async function copyCell(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCell(key);
      setTimeout(() => setCopiedCell((k) => k === key ? null : k), 1200);
    } catch { /* ignore */ }
  }

  if (error) return <ErrorState message={error} />;
  if (!domains) return <LoadingState />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">Vlastní doména</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">Připoj svou doménu místo /demo/{tenantSlug}</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-[12px] font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            <span className="hidden sm:inline">Přidat doménu</span>
            <span className="sm:hidden">Přidat</span>
          </button>
        )}
      </div>

      {adding && (
        <div className="border-b border-[var(--vs-border)] bg-white px-3 py-4 sm:px-5">
          <FormField label="Doména" hint="Bez https://, např. salonaria.cz">
            <input
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ""))}
              placeholder="salonaria.cz"
              className="vs-input"
            />
          </FormField>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { setAdding(false); setInput(""); }}
              className="inline-flex h-7 items-center rounded-md px-2.5 text-[11.5px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)]"
            >Zrušit</button>
            <button
              type="button"
              onClick={addDomain}
              disabled={busy || !input.trim()}
              className="inline-flex h-7 items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 text-[11.5px] font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Přidat
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
        {domains.length === 0 && !adding && (
          <EmptyState
            Icon={Globe}
            title="Žádná vlastní doména"
            description={`Klikni „Přidat doménu" a postupně tě provedu nastavením DNS.`}
          />
        )}
        {domains.map((d) => (
          <div key={d.id} className="overflow-hidden rounded-xl border border-[var(--vs-border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  <span className="truncate text-[13px] font-semibold text-[var(--vs-text)]">{d.domain}</span>
                  <span className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${
                    d.verified
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200"
                  }`}>
                    {d.verified ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <Clock className="h-2.5 w-2.5" />}
                    {d.verified ? "Ověřeno" : "Čeká"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:shrink-0">
                {!d.verified && (
                  <button
                    type="button"
                    onClick={() => verify(d)}
                    disabled={busy}
                    className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md bg-slate-900 px-2.5 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:flex-none"
                  >
                    {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                    <span className="hidden sm:inline">Zkontrolovat DNS</span>
                    <span className="sm:hidden">Zkontrolovat</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(d)}
                  disabled={busy}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                  title="Odebrat"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {verifyDetail[d.id] && (
              <div className={`px-3.5 py-2 text-[11px] ${d.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {verifyDetail[d.id]}
              </div>
            )}

            <div className="px-3.5 py-3">
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">
                DNS záznamy
              </p>
              <p className="mb-3 text-[11.5px] leading-relaxed text-[var(--vs-text-soft)]">
                Přihlas se u registrátora (Wedos, Forpsi, Cloudflare…) a vytvoř tyto DNS záznamy.
                Propagace trvá obvykle 1–24 hodin.
              </p>
              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-[var(--vs-border)] text-left text-[10px] uppercase tracking-wider text-[var(--vs-text-muted)]">
                      <th className="pb-1.5 pr-3">Typ</th>
                      <th className="pb-1.5 pr-3">Název</th>
                      <th className="pb-1.5 pr-3">Hodnota</th>
                      <th className="pb-1.5 pr-3">TTL</th>
                      <th className="pb-1.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.instructions.map((rec, i) => {
                      const cellKey = `${d.id}-${i}`;
                      return (
                        <tr key={i} className="border-b border-[var(--vs-border)] last:border-0">
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] font-semibold text-indigo-700">{rec.type}</td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-[var(--vs-text)]">{rec.name}</td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-[var(--vs-text)]">
                            <code className="block max-w-[260px] truncate" title={rec.value}>{rec.value}</code>
                          </td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-[var(--vs-text-soft)]">{rec.ttl}</td>
                          <td className="py-1.5">
                            <button
                              type="button"
                              onClick={() => copyCell(cellKey, rec.value)}
                              className="inline-flex h-6 items-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-white px-2 text-[10px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
                            >
                              {copiedCell === cellKey ? <Check className="h-3 w-3 text-emerald-600" /> : <FileText className="h-3 w-3" />}
                              {copiedCell === cellKey ? "OK" : "Kopírovat"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="space-y-2 sm:hidden">
                {d.instructions.map((rec, i) => {
                  const cellKey = `${d.id}-${i}`;
                  return (
                    <div key={i} className="rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-5 items-center rounded-md bg-indigo-50 px-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-200">
                            {rec.type}
                          </span>
                          <span className="text-[10.5px] text-[var(--vs-text-muted)]">TTL {rec.ttl}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyCell(cellKey, rec.value)}
                          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-white px-2 text-[11px] font-medium text-[var(--vs-text-soft)]"
                        >
                          {copiedCell === cellKey ? <Check className="h-3 w-3 text-emerald-600" /> : <FileText className="h-3 w-3" />}
                          {copiedCell === cellKey ? "OK" : "Kopírovat"}
                        </button>
                      </div>
                      <div className="mt-1.5">
                        <div className="text-[9.5px] font-semibold uppercase tracking-wider text-[var(--vs-text-muted)]">Název</div>
                        <code className="block font-mono text-[11px] text-[var(--vs-text)]">{rec.name}</code>
                      </div>
                      <div className="mt-1">
                        <div className="text-[9.5px] font-semibold uppercase tracking-wider text-[var(--vs-text-muted)]">Hodnota</div>
                        <code className="block break-all font-mono text-[11px] text-[var(--vs-text)]">{rec.value}</code>
                      </div>
                      <p className="mt-1 text-[10px] text-[var(--vs-text-dim)]">{rec.purpose}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ============================================================================
   BackupPanel — manual export (download JSON) + restore (upload JSON).
   Pre-restore snapshots go into page_revisions so a botched restore can
   still be rolled back from the Verze panel.
   ============================================================================ */

export function BackupPanel({ tenantSlug }: { tenantSlug: string }) {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [result, setResult] = useState<{ pages: number; sections: number; slots: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/backup`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `webero-backup-${tenantSlug}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally { setDownloading(false); }
  }

  async function handleFile(file: File) {
    if (!file) return;
    if (!window.confirm(`Obnovit web ze zálohy „${file.name}"?\n\nAktuální stránky, sekce a brand data se přepíšou. Předchozí verze se uloží do Verze.`)) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setRestoring(true);
    setError(null);
    setResult(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const r = await fetch(`/api/demo/${tenantSlug}/backup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(json),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setError(data.error ?? `Chyba ${r.status}`); return; }
      setResult({
        pages: data.restoredPages ?? 0,
        sections: data.restoredSections ?? 0,
        slots: data.restoredSlots ?? 0,
      });
      setTimeout(() => window.location.reload(), 2200);
    } catch (e) {
      setError(`Soubor není platná záloha: ${(e as Error).message}`);
    } finally {
      setRestoring(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">Záloha &amp; obnovení</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">Stáhni všechen obsah jako JSON nebo nahraj zálohu zpět</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
        {/* Export card */}
        <div className="rounded-xl border border-[var(--vs-border)] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)" }}
            >
              <ExternalLink className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13.5px] font-semibold text-[var(--vs-text)]">Stáhnout zálohu</h4>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--vs-text-soft)]">
                Vytvoří JSON soubor s úvodní stránkou, podstránkami, všemi sekcemi,
                brand daty (kontakt, hodiny, social) a design tokens. Hodí se před
                velkou změnou nebo když chceš mít offline kopii.
              </p>
              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12px] font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.30)] hover:bg-emerald-500 disabled:opacity-50"
              >
                {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {downloading ? "Připravuji…" : "Stáhnout JSON"}
              </button>
            </div>
          </div>
        </div>

        {/* Restore card */}
        <div className="rounded-xl border border-[var(--vs-border)] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
            >
              <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13.5px] font-semibold text-[var(--vs-text)]">Obnovit ze zálohy</h4>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--vs-text-soft)]">
                Nahraj dříve stažený JSON. Aktuální obsah se přepíše,
                ale předchozí stav se nejdřív uloží do <strong>Verze</strong>, takže
                se k němu můžeš vrátit.
              </p>
              <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <p>
                  Obnovení smaže aktuální <strong>stránky, sekce a brand data</strong>.
                  Blog články, média a domény zůstanou zachovány.
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="application/json,.json"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={restoring}
                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md bg-slate-900 px-3.5 text-[12px] font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {restoring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                {restoring ? "Obnovuji…" : "Vybrat JSON soubor"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
            {error}
          </div>
        )}
        {result && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-800">
            ✅ Obnoveno: {result.pages} stránek, {result.sections} sekcí, {result.slots} brand slotů. Web se za chvíli znovu načte.
          </div>
        )}
      </div>
    </div>
  );
}


/* ============================================================================
   AnalyticsPanel — native replacement for the /admin/analytics iframe.
   Reads GTM/GA4/FB Pixel + Search Console config from /analytics GET,
   PUTs changes back, and renders a 30-day activity sparkline derived from
   audit_log so the user has some visualization of editing cadence even
   before real per-page-view tracking lands.
   ============================================================================ */

interface AnalyticsState {
  config: { gtm_id?: string; ga4_id?: string; fb_pixel_id?: string };
  searchConsole: string | null;
  activity: Array<{ day: string; count: number; action: string }>;
}

export function AnalyticsPanel({ tenantSlug }: { tenantSlug: string }) {
  const [data, setData] = useState<AnalyticsState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gtm, setGtm] = useState("");
  const [ga4, setGa4] = useState("");
  const [pixel, setPixel] = useState("");
  const [gsc, setGsc] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/analytics`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as AnalyticsState;
        setData(json);
        setGtm(json.config.gtm_id ?? "");
        setGa4(json.config.ga4_id ?? "");
        setPixel(json.config.fb_pixel_id ?? "");
        setGsc(json.searchConsole ?? "");
      } catch (e) { setError((e as Error).message); }
    })();
  }, [tenantSlug]);

  async function save() {
    setSaveState("saving");
    try {
      const body = {
        gtm_id: gtm.trim() || null,
        ga4_id: ga4.trim() || null,
        fb_pixel_id: pixel.trim() || null,
        search_console_verification: gsc.trim() || null,
      };
      const r = await fetch(`/api/demo/${tenantSlug}/analytics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { setSaveState("error"); alert(json.error ?? `Chyba ${r.status}`); return; }
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => s === "saved" ? "idle" : s), 1800);
    } catch (e) {
      setSaveState("error");
      alert((e as Error).message);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  // Roll up activity into 30 daily totals (any action counts)
  const days: Array<{ day: string; count: number }> = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const sum = data.activity.filter((a) => a.day === key).reduce((acc, a) => acc + a.count, 0);
    days.push({ day: key, count: sum });
  }
  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const totalEdits = days.reduce((a, d) => a + d.count, 0);
  const avgPerDay = (totalEdits / 30).toFixed(1);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">Analytics &amp; měření</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">GTM, GA4, Facebook Pixel, Search Console</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saveState === "saving"}
          title={saveState === "saving" ? "Ukládám…" : "Uložit nastavení"}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 sm:px-3 text-[12px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saveState === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saveState === "saved" ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{saveState === "saving" ? "Ukládám" : saveState === "saved" ? "Uloženo" : "Uložit"}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
        {/* 30-day activity */}
        <div className="rounded-xl border border-[var(--vs-border)] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">Aktivita za 30 dní</h4>
              <p className="text-[11px] text-[var(--vs-text-soft)]">Editorské změny v auditu (proxy do té doby, než nasadíme tracking pageview)</p>
            </div>
            <div className="text-right">
              <div className="text-[22px] font-bold leading-none text-[var(--vs-text)]">{totalEdits}</div>
              <div className="text-[10px] text-[var(--vs-text-muted)]">{avgPerDay} / den</div>
            </div>
          </div>
          <div className="mt-3 flex h-20 items-end gap-[2px]">
            {days.map((d) => {
              const h = Math.max(4, (d.count / maxCount) * 100);
              return (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.count} změn`}
                  className="group relative flex-1 rounded-sm bg-gradient-to-t from-indigo-400 to-indigo-200 transition-colors hover:from-indigo-600 hover:to-indigo-400"
                  style={{ height: `${h}%`, minHeight: 4 }}
                >
                  {d.count > 0 && (
                    <span className="pointer-events-none absolute -top-5 left-1/2 hidden -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[9.5px] text-white group-hover:block">
                      {d.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[9.5px] text-[var(--vs-text-dim)]">
            <span>{days[0].day}</span>
            <span>{days[days.length - 1].day}</span>
          </div>
        </div>

        {/* Tracking IDs */}
        <div className="rounded-xl border border-[var(--vs-border)] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h4 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">Tracking ID</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Google Tag Manager" hint="Formát: GTM-XXXXXXX">
              <input
                type="text"
                value={gtm}
                onChange={(e) => setGtm(e.target.value.toUpperCase())}
                placeholder="GTM-XXXXXXX"
                className="vs-input font-mono"
              />
              {gtm && <TrackingStatus ok={/^GTM-[A-Z0-9]+$/.test(gtm.trim())} />}
            </FormField>
            <FormField label="Google Analytics 4" hint="Formát: G-XXXXXXXXXX">
              <input
                type="text"
                value={ga4}
                onChange={(e) => setGa4(e.target.value.toUpperCase())}
                placeholder="G-XXXXXXXXXX"
                className="vs-input font-mono"
              />
              {ga4 && <TrackingStatus ok={/^G-[A-Z0-9]+$/.test(ga4.trim())} />}
            </FormField>
            <FormField label="Facebook Pixel" hint="Numerické ID, např. 1234567890">
              <input
                type="text"
                value={pixel}
                onChange={(e) => setPixel(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="1234567890"
                className="vs-input font-mono"
              />
              {pixel && <TrackingStatus ok={/^\d+$/.test(pixel.trim())} />}
            </FormField>
            <FormField label="Search Console (TXT)" hint="Verification token z Google Search Console">
              <input
                type="text"
                value={gsc}
                onChange={(e) => setGsc(e.target.value)}
                placeholder="google-site-verification=…"
                className="vs-input font-mono"
              />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingStatus({ ok }: { ok: boolean }) {
  return (
    <p className={`mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold ${ok ? "text-emerald-700" : "text-rose-700"}`}>
      {ok ? <Check className="h-3 w-3" strokeWidth={2.5} /> : <X className="h-3 w-3" strokeWidth={2.5} />}
      {ok ? "Validní formát" : "Neplatný formát"}
    </p>
  );
}


/* ============================================================================
   AiBuilderPanel — flagship "fill my whole site with AI" wizard.
   3 steps: brief → review plan → apply. Calls POST /ai/build-site with
   action="preview" to get the plan, then action="apply" to commit.
   ============================================================================ */

const INDUSTRY_OPTIONS = [
  "kavárna", "restaurace", "hotel", "kadeřnictví", "kosmetika", "nehtové studio",
  "fitness studio", "yoga", "masáže", "autoškola", "jazyková škola", "školka",
  "veterinář", "hotel pro psy", "stavební firma", "elektrikář", "instalatér",
  "malíř pokojů", "úklidová firma", "květinářství", "cukrárna", "pekárna",
  "catering", "fotograf", "DJ", "videoprodukce", "architekt", "účetní",
  "solární panely", "klimatizace", "podlahy", "klempíř", "zahradní design",
  "dezinfekce", "chata k pronájmu", "ostatní",
];

const TONE_OPTIONS = [
  { key: "professional", label: "Profesionální", icon: "💼" },
  { key: "friendly",     label: "Přátelský",     icon: "🤝" },
  { key: "luxury",       label: "Luxusní",       icon: "✨" },
  { key: "playful",      label: "Hravý",         icon: "🎈" },
  { key: "minimal",      label: "Minimal",       icon: "○" },
] as const;

interface BuildPlanPreview {
  hero?: { title?: string; subtitle?: string; ctaPrimary?: string };
  about?: { title?: string; paragraph?: string; bullets?: string[] };
  services?: { title?: string; items?: Array<{ title?: string; description?: string }> };
  faq?: { items?: Array<{ question?: string; answer?: string }> };
  cta?: { title?: string; button?: string };
  testimonials?: { items?: Array<{ quote?: string; author?: string }> };
  [k: string]: unknown;
}

export function AiBuilderPanel({ tenantSlug, businessName }: { tenantSlug: string; businessName?: string | null }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [business, setBusiness] = useState(businessName ?? "");
  const [industry, setIndustry] = useState("kavárna");
  const [tagline, setTagline] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<typeof TONE_OPTIONS[number]["key"]>("professional");
  const [services, setServices] = useState<string[]>([""]);
  const [plan, setPlan] = useState<BuildPlanPreview | null>(null);
  const [sectionTypes, setSectionTypes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  useEffect(() => { if (businessName) setBusiness(businessName); }, [businessName]);

  async function generatePreview() {
    if (!business.trim()) { alert("Vyplň název firmy"); return; }
    setBusy(true); setError(null); setPlan(null);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/ai/build-site`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          business: business.trim(),
          industry,
          tagline: tagline.trim() || undefined,
          audience: audience.trim() || undefined,
          tone,
          services: services.map((s) => s.trim()).filter(Boolean),
          action: "preview",
        }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { setError(json.error ?? `Chyba ${r.status}`); return; }
      setPlan(json.plan ?? null);
      setSectionTypes(json.sectionTypes ?? []);
      setStep(1);
    } finally { setBusy(false); }
  }

  async function applyPlan() {
    if (!plan) return;
    if (!window.confirm("Použít vygenerovaný obsah na web?\n\nAktuální texty se přepíšou. Předchozí stav se uloží do Verze, takže se k němu můžeš vrátit.")) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/ai/build-site`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          business: business.trim(),
          industry,
          tagline: tagline.trim() || undefined,
          audience: audience.trim() || undefined,
          tone,
          services: services.map((s) => s.trim()).filter(Boolean),
          action: "apply",
        }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { setError(json.error ?? `Chyba ${r.status}`); return; }
      setAppliedCount(json.appliedCount ?? 0);
      setStep(2);
      setTimeout(() => window.location.reload(), 2200);
    } finally { setBusy(false); }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">AI website builder</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">Claude napíše obsah celého webu — popíšeš firmu, dostaneš hotový text</p>
        </div>
        <Steps step={step} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {/* Step 0 — brief */}
        {step === 0 && (
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <p className="text-[12px] leading-relaxed text-indigo-900">
                  Popiš svou firmu — AI vygeneruje český obsah pro každou sekci úvodní stránky.
                  Aktuálně máš <strong>{sectionTypes.length || "několik"}</strong> sekcí, kterým mohu vyplnit texty.
                </p>
              </div>
            </div>

            <FormField label="Název firmy / projektu *">
              <input
                type="text"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="Salon Aria"
                className="vs-input"
                autoFocus
              />
            </FormField>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Obor">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="vs-input"
                >
                  {INDUSTRY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </FormField>
              <FormField label="Tón komunikace">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as typeof tone)}
                  className="vs-input"
                >
                  {TONE_OPTIONS.map((t) => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
                </select>
              </FormField>
            </div>

            <FormField label="Motto / tagline" hint="Volitelné — krátký slogan firmy">
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Profesionální péče s osobním přístupem"
                className="vs-input"
              />
            </FormField>

            <FormField label="Cílová skupina" hint="Volitelné — komu sloužíte">
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Ženy 30-55 let v centru Prahy"
                className="vs-input"
              />
            </FormField>

            <div>
              <label className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
                Hlavní služby / produkty
              </label>
              <div className="space-y-1.5">
                {services.map((s, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => setServices((arr) => arr.map((x, idx) => idx === i ? e.target.value : x))}
                      placeholder={`Služba ${i + 1}`}
                      className="vs-input"
                    />
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setServices((arr) => arr.filter((_, idx) => idx !== i))}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50"
                        title="Smazat"
                      ><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                ))}
                {services.length < 8 && (
                  <button
                    type="button"
                    onClick={() => setServices((arr) => [...arr, ""])}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-[var(--vs-border-strong)] bg-white px-2.5 text-[11px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
                  >
                    <Plus className="h-3 w-3" />
                    Další služba
                  </button>
                )}
              </div>
              <p className="mt-1 text-[10.5px] text-[var(--vs-text-dim)]">Volitelné — pomáhá AI lépe trefit obsah</p>
            </div>

            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={generatePreview}
              disabled={busy || !business.trim()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.32)] transition-transform hover:scale-[1.01] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" strokeWidth={2.25} />}
              {busy ? "Generuji…" : "Vygenerovat obsah celého webu"}
            </button>
          </div>
        )}

        {/* Step 1 — review */}
        {step === 1 && plan && (
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2.5} />
                <p className="text-[12px] leading-relaxed text-emerald-900">
                  Návrh je hotový. Prohlédni si texty, a pokud sedí, klikni „Použít na web".
                </p>
              </div>
            </div>

            <PlanPreview plan={plan} />

            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--vs-border-strong)] bg-white px-4 text-[12.5px] font-semibold text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
              >
                Upravit zadání
              </button>
              <button
                type="button"
                onClick={generatePreview}
                disabled={busy}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--vs-border-strong)] bg-white px-4 text-[12.5px] font-semibold text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Zkusit znovu
              </button>
              <button
                type="button"
                onClick={applyPlan}
                disabled={busy}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[12.5px] font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.30)] hover:bg-emerald-500 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" strokeWidth={2.25} />}
                {busy ? "Aplikuji…" : "Použít na web"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — done */}
        {step === 2 && (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-[0_10px_30px_rgba(16,185,129,0.30)]"
              style={{ background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)" }}
            >
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <h3 className="text-[22px] font-semibold tracking-tight text-[var(--vs-text)]">Hotovo!</h3>
            <p className="mt-1 text-[13px] text-[var(--vs-text-soft)]">
              Aplikováno na <strong>{appliedCount}</strong> sekcí. Stránka se za chvíli načte.
            </p>
            <Loader2 className="mt-4 h-5 w-5 animate-spin text-indigo-500" />
          </div>
        )}
      </div>
    </div>
  );
}

function Steps({ step }: { step: 0 | 1 | 2 }) {
  const items = ["Zadání", "Náhled", "Hotovo"];
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {items.map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
            i < step ? "bg-emerald-500 text-white" :
            i === step ? "bg-indigo-600 text-white" :
            "bg-slate-200 text-slate-500"
          }`}>{i + 1}</span>
          <span className={`text-[10.5px] font-medium ${i === step ? "text-[var(--vs-text)]" : "text-[var(--vs-text-muted)]"}`}>{label}</span>
          {i < items.length - 1 && <ChevronDown className="h-3 w-3 -rotate-90 text-slate-300" />}
        </div>
      ))}
    </div>
  );
}

function PlanPreview({ plan }: { plan: BuildPlanPreview }) {
  return (
    <div className="space-y-3">
      {plan.hero && (
        <PlanBlock title="Hero">
          {plan.hero.title && <p className="text-[18px] font-bold leading-tight text-[var(--vs-text)]">{plan.hero.title}</p>}
          {plan.hero.subtitle && <p className="mt-1.5 text-[13px] text-[var(--vs-text-soft)]">{plan.hero.subtitle}</p>}
          {plan.hero.ctaPrimary && (
            <span className="mt-2 inline-flex h-7 items-center rounded-md bg-indigo-600 px-3 text-[11.5px] font-semibold text-white">
              {plan.hero.ctaPrimary}
            </span>
          )}
        </PlanBlock>
      )}
      {plan.about && (
        <PlanBlock title="O nás">
          {plan.about.title && <p className="text-[14px] font-semibold text-[var(--vs-text)]">{plan.about.title}</p>}
          {plan.about.paragraph && <p className="mt-1 text-[12px] leading-relaxed text-[var(--vs-text-soft)]">{plan.about.paragraph}</p>}
          {plan.about.bullets && (
            <ul className="mt-2 space-y-1 text-[11.5px] text-[var(--vs-text-soft)]">
              {plan.about.bullets.map((b, i) => <li key={i} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />{b}</li>)}
            </ul>
          )}
        </PlanBlock>
      )}
      {plan.services && (
        <PlanBlock title="Služby">
          {plan.services.title && <p className="text-[14px] font-semibold text-[var(--vs-text)]">{plan.services.title}</p>}
          {plan.services.items && (
            <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {plan.services.items.map((s, i) => (
                <div key={i} className="rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] p-2">
                  <p className="text-[11.5px] font-semibold text-[var(--vs-text)]">{s.title}</p>
                  <p className="mt-0.5 text-[10.5px] text-[var(--vs-text-soft)]">{s.description}</p>
                </div>
              ))}
            </div>
          )}
        </PlanBlock>
      )}
      {plan.faq?.items && (
        <PlanBlock title="FAQ">
          <ul className="space-y-1.5 text-[11.5px]">
            {plan.faq.items.map((q, i) => (
              <li key={i}>
                <p className="font-semibold text-[var(--vs-text)]">{q.question}</p>
                <p className="text-[var(--vs-text-soft)]">{q.answer}</p>
              </li>
            ))}
          </ul>
        </PlanBlock>
      )}
      {plan.testimonials?.items && (
        <PlanBlock title="Recenze">
          <div className="space-y-1.5">
            {plan.testimonials.items.map((t, i) => (
              <blockquote key={i} className="rounded-md border-l-2 border-indigo-400 bg-indigo-50 px-2.5 py-1.5">
                <p className="text-[11.5px] italic text-[var(--vs-text-soft)]">„{t.quote}"</p>
                {t.author && <p className="mt-0.5 text-[10px] font-semibold text-[var(--vs-text-muted)]">— {t.author}</p>}
              </blockquote>
            ))}
          </div>
        </PlanBlock>
      )}
      {plan.cta && (
        <PlanBlock title="Závěrečné CTA">
          {plan.cta.title && <p className="text-[14px] font-semibold text-[var(--vs-text)]">{plan.cta.title}</p>}
          {plan.cta.button && (
            <span className="mt-1.5 inline-flex h-7 items-center rounded-md bg-indigo-600 px-3 text-[11.5px] font-semibold text-white">
              {plan.cta.button}
            </span>
          )}
        </PlanBlock>
      )}
    </div>
  );
}

function PlanBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--vs-border)] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-2 inline-flex h-5 items-center rounded-full bg-slate-100 px-2 text-[9.5px] font-bold uppercase tracking-[0.10em] text-slate-700">
        {title}
      </div>
      {children}
    </div>
  );
}


/* ============================================================================
   PerformancePanel — Lighthouse-style audit for pre-publish health check.
   Probes image weights, alt coverage, broken links, mobile breakpoints
   via /api/demo/<slug>/perf-score and renders a half-gauge score + checklist.
   ============================================================================ */

interface PerfCheckRow {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  weight: number;
  hint: string;
}

interface PerfData {
  page: { id: number; slug: string; title: string; isHomepage: boolean };
  score: number;
  checks: PerfCheckRow[];
  stats: {
    sections: number; images: number; imagesProbed: number; heavyImages: number;
    totalImageBytes: number; brokenLinks: number; externalLinks: number; totalChars: number;
  };
}

interface PerfPage {
  id: number; slug: string; title: string; is_homepage: boolean;
}

export function PerformancePanel({ tenantSlug }: { tenantSlug: string }) {
  const [pages, setPages] = useState<PerfPage[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [data, setData] = useState<PerfData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/pages`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as { pages: PerfPage[] };
        setPages(json.pages);
        if (json.pages.length > 0) setActiveId(json.pages[0].id);
      } catch (e) { setError((e as Error).message); }
    })();
  }, [tenantSlug]);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    setData(null);
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/perf-score?pageId=${activeId}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as PerfData;
        setData(json);
      } catch (e) { setError((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, [tenantSlug, activeId]);

  if (error && !pages) return <ErrorState message={error} />;
  if (!pages) return <LoadingState />;
  if (pages.length === 0) {
    return <EmptyState Icon={ShieldCheck} title="Žádné stránky" description="Přidej stránku, abys mohl spustit audit." />;
  }

  const tone = data
    ? data.score >= 85 ? { arc: "#10b981", label: "Skvělé", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
    : data.score >= 60 ? { arc: "#f59e0b", label: "Lze vylepšit", chip: "bg-amber-50 text-amber-700 ring-amber-200" }
    :                    { arc: "#ef4444", label: "Vyžaduje pozornost", chip: "bg-rose-50 text-rose-700 ring-rose-200" }
    : { arc: "#94a3b8", label: "", chip: "" };

  const failed = data?.checks.filter((c) => c.status === "fail") ?? [];
  const warned = data?.checks.filter((c) => c.status === "warn") ?? [];
  const passed = data?.checks.filter((c) => c.status === "pass") ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">Výkonnostní audit</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">Statický rozbor obrázků, odkazů a struktury — spusť před publishingem</p>
        </div>
        <select
          value={activeId ?? ""}
          onChange={(e) => setActiveId(parseInt(e.target.value, 10))}
          className="vs-input max-w-[200px]"
        >
          {pages.map((p) => <option key={p.id} value={p.id}>{p.is_homepage ? "🏠 " : ""}{p.title}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {loading && (
          <div className="flex items-center gap-2 rounded-md border border-[var(--vs-border)] bg-white px-3 py-2 text-[11.5px] text-[var(--vs-text-muted)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Měřím (probes mohou trvat 5-15 sekund)…
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Score card */}
            <div className="rounded-xl border border-[var(--vs-border)] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 80 48" className="absolute inset-0 h-full w-full">
                    <path d="M8 40 A 32 32 0 0 1 72 40" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                    <path
                      d="M8 40 A 32 32 0 0 1 72 40"
                      fill="none"
                      stroke={tone.arc}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={Math.PI * 32}
                      strokeDashoffset={Math.PI * 32 - (Math.PI * 32 * data.score) / 100}
                      style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.18,0.89,0.32,1)" }}
                    />
                  </svg>
                  <div className="relative -mb-2 text-center leading-none">
                    <div className="text-[22px] font-bold text-[var(--vs-text)]">{data.score}</div>
                    <div className="text-[8.5px] font-semibold uppercase tracking-widest text-[var(--vs-text-muted)]">SCORE</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${tone.chip}`}>
                    {tone.label}
                  </span>
                  <p className="mt-1 text-[12px] text-[var(--vs-text-soft)]">
                    {failed.length > 0 && <><span className="font-semibold text-rose-700">{failed.length} kritických problémů</span> · </>}
                    {warned.length > 0 && <><span className="text-amber-700">{warned.length} vylepšení</span> · </>}
                    <span className="text-emerald-700">{passed.length}/{data.checks.length} v pořádku</span>
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10.5px] text-[var(--vs-text-muted)] sm:grid-cols-4">
                    <Stat label="Sekcí" value={String(data.stats.sections)} />
                    <Stat label="Obrázků" value={String(data.stats.images)} />
                    <Stat label="Velikost obr." value={`${(data.stats.totalImageBytes / 1024).toFixed(0)} KB`} />
                    <Stat label="Externích odkazů" value={String(data.stats.externalLinks)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Check list */}
            <ul className="space-y-1.5">
              {data.checks.map((c) => (
                <li key={c.id} className="flex items-start gap-2 rounded-md border border-[var(--vs-border)] bg-white px-2.5 py-2">
                  <span
                    aria-hidden
                    className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white ${
                      c.status === "pass" ? "bg-emerald-500" : c.status === "warn" ? "bg-amber-500" : "bg-rose-500"
                    }`}
                  >
                    {c.status === "pass" ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : c.status === "warn" ? <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} /> : <X className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11.5px] font-semibold text-[var(--vs-text)]">{c.label}</span>
                      <span className="shrink-0 text-[9.5px] font-mono text-[var(--vs-text-dim)]">w{c.weight}</span>
                    </div>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-[var(--vs-text-soft)]">{c.hint}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-2 py-1">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-[11.5px] font-bold text-[var(--vs-text)]">{value}</div>
    </div>
  );
}


/* ============================================================================
   LogoGeneratorPanel — programmatic SVG logo composer. Picks layout +
   icon glyph + colors + font; renders live and offers SVG copy + PNG +
   favicon download (32×32 + 192×192). All client-side, no API calls.
   ============================================================================ */

type LogoLayout = "icon-left" | "icon-top" | "icon-only" | "text-only" | "badge";

const LOGO_LAYOUTS: Array<{ key: LogoLayout; label: string }> = [
  { key: "icon-left", label: "Ikona vlevo" },
  { key: "icon-top",  label: "Ikona nad" },
  { key: "badge",     label: "Odznak (kruh)" },
  { key: "icon-only", label: "Jen ikona" },
  { key: "text-only", label: "Jen text" },
];

/** Minimal in-house glyph library. Each is an SVG `<path d="..." />` string
    designed for a 24×24 viewBox so they compose well at any size. */
const LOGO_GLYPHS: Array<{ key: string; label: string; d: string }> = [
  { key: "sparkles", label: "Hvězda", d: "M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z M19 14l.9 2.4L22 17l-2.1.6L19 20l-.9-2.4L16 17l2.1-.6z M5 14l.7 1.8L7.5 16.5 5.7 17 5 18.8 4.3 17 2.5 16.5 4.3 15.8z" },
  { key: "leaf",     label: "List",   d: "M5 17C5 10 9 5 19 5c0 10-5 14-14 14-1.5 0-2.5-.7-2.5-2zm3-2c4-1 7-4 8-8" },
  { key: "heart",    label: "Srdce",  d: "M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" },
  { key: "compass",  label: "Kompas", d: "M12 22a10 10 0 110-20 10 10 0 010 20zm0-3l3-7-7 3z" },
  { key: "diamond",  label: "Diamant", d: "M6 3h12l3 5-9 13L3 8z M9 8h6" },
  { key: "wave",     label: "Vlna",   d: "M3 12c2 0 3-3 5-3s3 6 5 6 4-6 6-6 2 3 3 3 M3 7c2 0 3-3 5-3s3 6 5 6 4-6 6-6 2 3 3 3" },
  { key: "flame",    label: "Plamen", d: "M13 2C9 6 7 8 7 12a5 5 0 1010 0c0-3-2-4-4-10zm-2 14a3 3 0 003-3" },
  { key: "anchor",   label: "Kotva",  d: "M12 4a2 2 0 110 4 2 2 0 010-4zm0 4v14m-6-4c1 3 4 4 6 4s5-1 6-4m-12 0H4m14 0h2" },
  { key: "hexagon",  label: "Šestiúhel.", d: "M12 2l9 5v10l-9 5-9-5V7z" },
  { key: "scissors", label: "Nůžky",  d: "M6 4l11 11m-11 5l11-11M6 7a3 3 0 100-6 3 3 0 000 6zm0 16a3 3 0 100-6 3 3 0 000 6z" },
  { key: "coffee",   label: "Káva",   d: "M5 8h12v6a5 5 0 01-5 5H10a5 5 0 01-5-5V8zm12 2h2a2 2 0 110 4h-2 M8 3v3m4-3v3" },
  { key: "house",    label: "Dům",    d: "M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-7H10v7H6a2 2 0 01-2-2v-9z" },
];

const LOGO_FONTS = [
  { key: "Inter, sans-serif",          label: "Inter (Modern)" },
  { key: "'Poppins', sans-serif",      label: "Poppins (Soft)" },
  { key: "'Playfair Display', serif",  label: "Playfair (Editorial)" },
  { key: "'Cormorant Garamond', serif", label: "Cormorant (Luxury)" },
  { key: "'DM Sans', sans-serif",      label: "DM Sans (Tech)" },
  { key: "'Cinzel', serif",            label: "Cinzel (Heritage)" },
];

interface LogoState {
  text: string;
  tagline: string;
  layout: LogoLayout;
  glyph: string;
  colorPrimary: string;
  colorAccent: string;
  colorBackground: string;
  font: string;
  fontWeight: number;
}

function renderLogoSvg(s: LogoState, size = 256): string {
  const glyph = LOGO_GLYPHS.find((g) => g.key === s.glyph) ?? LOGO_GLYPHS[0];
  const padding = 24;
  const iconBoxes: Record<LogoLayout, { x: number; y: number; size: number }> = {
    "icon-left":  { x: padding, y: size / 2 - 28, size: 56 },
    "icon-top":   { x: size / 2 - 32, y: padding, size: 64 },
    "icon-only":  { x: size / 2 - 80, y: size / 2 - 80, size: 160 },
    "text-only":  { x: 0, y: 0, size: 0 },
    "badge":      { x: size / 2 - 28, y: 40, size: 56 },
  };
  const ib = iconBoxes[s.layout];
  const textY: Record<LogoLayout, number> = {
    "icon-left": size / 2 + 10,
    "icon-top":  size - padding - 28,
    "icon-only": -1000,
    "text-only": size / 2 + 8,
    "badge":     size - 56,
  };
  const textAnchor: Record<LogoLayout, string> = {
    "icon-left": "start", "icon-top": "middle", "icon-only": "middle", "text-only": "middle", "badge": "middle",
  };
  const textX: Record<LogoLayout, number> = {
    "icon-left": padding + ib.size + 16,
    "icon-top":  size / 2,
    "icon-only": size / 2,
    "text-only": size / 2,
    "badge":     size / 2,
  };

  const taglineY = textY[s.layout] + 22;

  const iconSvg = s.layout === "text-only"
    ? ""
    : `<g transform="translate(${ib.x},${ib.y}) scale(${ib.size / 24})">
        <path d="${glyph.d}" fill="none" stroke="${s.colorAccent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;

  const badgeCircle = s.layout === "badge"
    ? `<circle cx="${size / 2}" cy="${size / 2 - 16}" r="${size / 2 - padding}" fill="none" stroke="${s.colorAccent}" stroke-width="3"/>`
    : "";

  const tagline = s.tagline
    ? `<text x="${textX[s.layout]}" y="${taglineY}" text-anchor="${textAnchor[s.layout]}" font-family="${s.font.replace(/"/g, "'")}" font-size="11" font-weight="400" fill="${s.colorPrimary}" opacity="0.65" letter-spacing="2">${escapeXml(s.tagline.toUpperCase())}</text>`
    : "";

  const text = s.layout !== "icon-only"
    ? `<text x="${textX[s.layout]}" y="${textY[s.layout]}" text-anchor="${textAnchor[s.layout]}" font-family="${s.font.replace(/"/g, "'")}" font-size="${s.layout === "icon-left" ? 32 : 28}" font-weight="${s.fontWeight}" fill="${s.colorPrimary}">${escapeXml(s.text)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${s.colorBackground}"/>
    ${badgeCircle}
    ${iconSvg}
    ${text}
    ${tagline}
  </svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] ?? c));
}

async function svgToPng(svg: string, size: number): Promise<Blob> {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.drawImage(img, 0, 0, size, size);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function LogoGeneratorPanel({ tenantSlug, businessName }: { tenantSlug: string; businessName?: string | null }) {
  const [state, setState] = useState<LogoState>({
    text: businessName ?? "Salon Aria",
    tagline: "",
    layout: "icon-left",
    glyph: "sparkles",
    colorPrimary: "#0f172a",
    colorAccent: "#6366f1",
    colorBackground: "#ffffff",
    font: "Inter, sans-serif",
    fontWeight: 700,
  });
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { if (businessName) setState((s) => ({ ...s, text: businessName })); }, [businessName]);

  const svg = renderLogoSvg(state, 256);
  const svgFavicon = renderLogoSvg(state, 32);

  async function copySvg() {
    try {
      await navigator.clipboard.writeText(svg);
      setBusy("copied");
      setTimeout(() => setBusy((b) => b === "copied" ? null : b), 1400);
    } catch { /* ignore */ }
  }
  async function downloadSvg() {
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${tenantSlug}-logo.svg`);
  }
  async function downloadPng(size: number, suffix: string) {
    setBusy(`png-${size}`);
    try {
      const blob = await svgToPng(renderLogoSvg(state, size), size);
      downloadBlob(blob, `${tenantSlug}-logo-${suffix}.png`);
    } catch (e) { alert(`PNG export selhal: ${(e as Error).message}`); }
    finally { setBusy(null); }
  }
  async function downloadFavicon() {
    setBusy("favicon");
    try {
      const blob = await svgToPng(svgFavicon, 32);
      downloadBlob(blob, `${tenantSlug}-favicon-32.png`);
    } catch (e) { alert(`Favicon export selhal: ${(e as Error).message}`); }
    finally { setBusy(null); }
  }

  function update<K extends keyof LogoState>(k: K, v: LogoState[K]) {
    setState((s) => ({ ...s, [k]: v }));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--vs-text)]">Logo generátor</h3>
          <p className="truncate text-[11px] text-[var(--vs-text-muted)]">SVG logo + PNG + favicon — vše lokálně v prohlížeči</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-5 p-3 sm:p-5 lg:grid-cols-[1fr_360px]">
          {/* Controls */}
          <div className="space-y-4">
            <FormField label="Název firmy">
              <input
                type="text"
                value={state.text}
                onChange={(e) => update("text", e.target.value)}
                placeholder="Salon Aria"
                className="vs-input"
              />
            </FormField>
            <FormField label="Tagline (volitelný)">
              <input
                type="text"
                value={state.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="Hair & Beauty Studio"
                className="vs-input"
              />
            </FormField>

            <div>
              <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">Rozložení</p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                {LOGO_LAYOUTS.map((l) => (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => update("layout", l.key)}
                    className={`rounded-md border px-2 py-1.5 text-[10.5px] font-medium transition-colors ${
                      state.layout === l.key
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-[var(--vs-border-strong)] bg-white text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
                    }`}
                  >{l.label}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">Ikona</p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                {LOGO_GLYPHS.map((g) => {
                  const active = state.glyph === g.key;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => update("glyph", g.key)}
                      title={g.label}
                      className={`flex flex-col items-center gap-0.5 rounded-md border px-1 py-1.5 transition-colors ${
                        active
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-[var(--vs-border-strong)] bg-white hover:bg-[var(--vs-surface-2)]"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path d={g.d} fill="none" stroke={active ? "#4338ca" : "var(--vs-text-soft)"} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className={`truncate text-[9px] ${active ? "text-indigo-700" : "text-[var(--vs-text-muted)]"}`}>{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <ColorRow label="Text" value={state.colorPrimary} onChange={(v) => update("colorPrimary", v)} />
              <ColorRow label="Akcent" value={state.colorAccent} onChange={(v) => update("colorAccent", v)} />
              <ColorRow label="Pozadí" value={state.colorBackground} onChange={(v) => update("colorBackground", v)} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Font">
                <select
                  value={state.font}
                  onChange={(e) => update("font", e.target.value)}
                  className="vs-input"
                  style={{ fontFamily: state.font }}
                >
                  {LOGO_FONTS.map((f) => <option key={f.key} value={f.key} style={{ fontFamily: f.key }}>{f.label}</option>)}
                </select>
              </FormField>
              <FormField label="Tučnost">
                <select
                  value={state.fontWeight}
                  onChange={(e) => update("fontWeight", parseInt(e.target.value, 10))}
                  className="vs-input"
                >
                  <option value={300}>Light</option>
                  <option value={400}>Regular</option>
                  <option value={500}>Medium</option>
                  <option value={600}>Semibold</option>
                  <option value={700}>Bold</option>
                  <option value={800}>Extra Bold</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Preview + downloads */}
          <div className="lg:sticky lg:top-3">
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">Náhled</p>
            <div
              className="overflow-hidden rounded-xl border border-[var(--vs-border)] shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-[var(--vs-border)] bg-white p-1.5">
                <div
                  className="mx-auto overflow-hidden rounded-sm"
                  style={{ width: 32, height: 32 }}
                  dangerouslySetInnerHTML={{ __html: svgFavicon }}
                />
                <div className="mt-0.5 text-[9.5px] text-[var(--vs-text-muted)]">32 px</div>
              </div>
              <div className="rounded-md border border-[var(--vs-border)] bg-white p-1.5">
                <div
                  className="mx-auto overflow-hidden rounded-sm"
                  style={{ width: 48, height: 48 }}
                  dangerouslySetInnerHTML={{ __html: renderLogoSvg(state, 48) }}
                />
                <div className="mt-0.5 text-[9.5px] text-[var(--vs-text-muted)]">48 px</div>
              </div>
              <div className="rounded-md border border-[var(--vs-border)] bg-white p-1.5">
                <div
                  className="mx-auto overflow-hidden rounded-sm"
                  style={{ width: 64, height: 64 }}
                  dangerouslySetInnerHTML={{ __html: renderLogoSvg(state, 64) }}
                />
                <div className="mt-0.5 text-[9.5px] text-[var(--vs-text-muted)]">64 px</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copySvg}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[var(--vs-border-strong)] bg-white px-2.5 text-[11.5px] font-semibold text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
              >
                {busy === "copied" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <FileText className="h-3.5 w-3.5" />}
                {busy === "copied" ? "Zkopírováno" : "Kopírovat SVG"}
              </button>
              <button
                type="button"
                onClick={downloadSvg}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[var(--vs-border-strong)] bg-white px-2.5 text-[11.5px] font-semibold text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
              >
                <Save className="h-3.5 w-3.5" />
                SVG
              </button>
              <button
                type="button"
                onClick={() => downloadPng(512, "512")}
                disabled={busy === "png-512"}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-2.5 text-[11.5px] font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {busy === "png-512" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                PNG 512
              </button>
              <button
                type="button"
                onClick={downloadFavicon}
                disabled={busy === "favicon"}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-2.5 text-[11.5px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {busy === "favicon" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Favicon
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[var(--vs-text-dim)]">
              SVG je vektor — škáluje do libovolné velikosti bez ztráty kvality. PNG hodit do médií.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
