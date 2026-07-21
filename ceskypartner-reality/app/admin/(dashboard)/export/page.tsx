"use client";

import { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  XCircle,
  Zap,
  Plus,
  Trash2,
  Building2,
} from "lucide-react";
import { useApi, apiPost, apiDelete } from "@/lib/useApi";
import { PORTALS, PORTAL_CATEGORY_LABELS, type PortalCategory } from "@/lib/portals";

type PortalExport = {
  id: string;
  portal: string;
  status: string;
  externalId: string | null;
  errorLog: string | null;
  lastSyncAt: string | null;
  lastAttemptAt: string | null;
  verifiedAt: string | null;
  remoteUrl: string | null;
  remoteStatus: string | null;
  listing: { id: string; title: string; status: string; location: string };
};

type PortalConnection = {
  portal: string;
  implemented: boolean;
  configured: boolean;
  reachable: boolean;
  version?: string;
  message: string;
};

type Listing = {
  id: string;
  title: string;
  status: string;
  location: string;
};

type PortalSummary = {
  portal: string;
  name: string;
  url: string;
  category: PortalCategory;
  note?: string;
  exportable: boolean;
  synced: number;
  pending: number;
  errors: number;
  lastSync: string | null;
  exports: PortalExport[];
};

const PORTAL_META: Record<string, { name: string; url: string; category: PortalCategory; note?: string; exportable: boolean }> =
  Object.fromEntries(PORTALS.map((p) => [p.key, { name: p.name, url: p.url, category: p.category, note: p.note, exportable: p.exportable !== false }]));

const STATUS_ICON: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
  SYNCED: { icon: CheckCircle2, className: "text-emerald-400", label: "Ověřeno na portálu" },
  PENDING: { icon: Clock, className: "text-amber-400", label: "Čeká na ověření" },
  UNVERIFIED: { icon: AlertCircle, className: "text-amber-400", label: "Historický neověřený stav" },
  ERROR: { icon: XCircle, className: "text-red-400", label: "Chyba exportu" },
  REMOVED: { icon: XCircle, className: "text-[var(--a-text-3)]", label: "Odebráno" },
};

function effectiveStatus(exp: PortalExport): string {
  return exp.status === "SYNCED" && !exp.verifiedAt ? "UNVERIFIED" : exp.status;
}

function buildPortalSummaries(exports: PortalExport[]): PortalSummary[] {
  return Object.keys(PORTAL_META).map((key) => {
    const meta = PORTAL_META[key];
    const portalExports = exports.filter((e) => e.portal === key);
    const synced = portalExports.filter((e) => effectiveStatus(e) === "SYNCED").length;
    const pending = portalExports.filter((e) => ["PENDING", "UNVERIFIED"].includes(effectiveStatus(e))).length;
    const errors = portalExports.filter((e) => e.status === "ERROR").length;
    const syncDates = portalExports.filter((e) => e.lastSyncAt).map((e) => new Date(e.lastSyncAt!).getTime());
    const lastSync = syncDates.length ? new Date(Math.max(...syncDates)).toISOString() : null;
    return { portal: key, name: meta.name, url: meta.url, category: meta.category, note: meta.note, exportable: meta.exportable, synced, pending, errors, lastSync, exports: portalExports };
  });
}

export default function ExportPage() {
  const [activePortal, setActivePortal] = useState("SREALITY");
  const [activeCategory, setActiveCategory] = useState<PortalCategory | "all">("major");
  const [syncing, setSyncing] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [addPortal, setAddPortal] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const { data, loading, refetch } = useApi<PortalExport[]>("/api/admin/portal-exports");
  const { data: listingsData } = useApi<{ listings: Listing[] }>("/api/admin/listings?status=ACTIVE&limit=50");
  const { data: connection } = useApi<PortalConnection>(
    activePortal ? `/api/admin/portal-connections/${activePortal}` : null,
  );

  const portals = buildPortalSummaries(data || []);
  const portal = portals.find((p) => p.portal === activePortal) || portals[0];

  async function handleSync(exportId: string) {
    setSyncing(exportId);
    setNotice(null);
    const { data: result, error } = await apiPost<{ success: boolean; message: string }>(
      `/api/admin/portal-exports/${exportId}/sync`,
      {},
    );
    setNotice({
      ok: !!result?.success,
      text: error || result?.message || "Synchronizace skončila bez odpovědi.",
    });
    setSyncing(null);
    refetch();
  }

  async function handleSyncAll() {
    if (!connection?.implemented || !connection.configured) {
      setNotice({
        ok: false,
        text: connection?.message || "Portál nemá aktivní a nakonfigurovaný konektor.",
      });
      return;
    }
    setSyncing("all");
    setNotice(null);
    let successful = 0;
    const messages: string[] = [];
    for (const exp of portal?.exports || []) {
      const { data: result, error } = await apiPost<{ success: boolean; message: string }>(
        `/api/admin/portal-exports/${exp.id}/sync`,
        {},
      );
      if (result?.success) successful++;
      if (error || result?.message) messages.push(error || result!.message);
    }
    const total = portal?.exports.length || 0;
    setNotice({
      ok: total > 0 && successful === total,
      text: total
        ? `Ověřeno ${successful} z ${total} exportů.${successful === total ? "" : ` ${messages[0] || ""}`}`
        : "Na portálu nejsou žádné exporty.",
    });
    setSyncing(null);
    refetch();
  }

  async function handleRemove(exportId: string) {
    if (!confirm("Opravdu odebrat tento export?")) return;
    await apiDelete(`/api/admin/portal-exports/${exportId}`);
    refetch();
  }

  async function handleAddExport(listingId: string) {
    const p = addPortal || activePortal;
    const { error } = await apiPost("/api/admin/portal-exports", { portal: p, listingId });
    if (error) alert(error);
    else refetch();
    setAddModal(false);
  }

  const existingListingIds = new Set(portal?.exports.map((e) => e.listing.id) || []);
  const availableListings = (listingsData?.listings || []).filter((l) => !existingListingIds.has(l.id));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Export na portaly</h2>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Synchronizace inzeratu s realitnimi portaly</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setAddPortal(activePortal); setAddModal(true); }}
            disabled={!portal?.exportable}
            className="flex items-center gap-2 rounded-xl border border-[var(--a-border)] px-4 py-2.5 text-[12px] font-semibold text-[var(--a-text-2)] transition-all hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"
          >
            <Plus size={14} /> Pridat inzerat
          </button>
          <button
            onClick={handleSyncAll}
            disabled={syncing === "all" || !connection?.implemented || !connection.configured}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing === "all" ? "animate-spin" : ""} />
            {syncing === "all" ? "Synchronizuji..." : "Synchronizovat vse"}
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-[12.5px] ${
            notice.ok
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/20 bg-amber-500/10 text-amber-300"
          }`}
        >
          {notice.text}
        </div>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      )}

      {!loading && (
        <>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            {([["all", "Vse"], ...Object.entries(PORTAL_CATEGORY_LABELS)] as [PortalCategory | "all", string][]).map(([cat, label]) => {
              const count = cat === "all" ? portals.length : portals.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full border px-4 py-1.5 text-[11.5px] font-semibold transition-all duration-300 ${
                    activeCategory === cat
                      ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                      : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"
                  }`}
                >
                  {label} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Portal cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {portals
              .filter((p) => activeCategory === "all" || p.category === activeCategory)
              .map((p) => {
                const hasData = p.synced + p.pending + p.errors > 0;
                return (
                  <button
                    key={p.portal}
                    type="button"
                    onClick={() => setActivePortal(p.portal)}
                    className={`glass-card rounded-2xl p-4 text-left transition-all duration-300 ${
                      activePortal === p.portal ? "ring-1 ring-[var(--a-bronze)]/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-[var(--a-text)]">{p.name}</span>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${
                        !hasData ? "bg-[var(--a-text-3)]"
                          : p.errors > 0 ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
                          : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      }`} />
                    </div>
                    <div className="mt-2.5 flex gap-3 text-[11px]">
                      <span className="text-emerald-400">{p.synced} sync</span>
                      {p.pending > 0 && <span className="text-amber-400">{p.pending} ceka</span>}
                      {p.errors > 0 && <span className="text-red-400">{p.errors} chyb</span>}
                      {!hasData && <span className="text-[var(--a-text-3)]">Neaktivni</span>}
                    </div>
                    {p.note && <p className="mt-1.5 truncate text-[10px] text-[var(--a-text-3)]">{p.note}</p>}
                  </button>
                );
              })}
          </div>

          {/* Portal detail */}
          {portal && (
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-[18px] font-semibold text-[var(--a-text)]">{portal.name}</h2>
                  <a href={portal.url} target="_blank" rel="noreferrer" className="text-[12px] text-[var(--a-bronze)] hover:underline">
                    {portal.url} <ExternalLink size={10} className="inline" />
                  </a>
                  {connection?.version && (
                    <span className="rounded-lg border border-[var(--a-border)] px-2.5 py-1 font-mono text-[10.5px] text-[var(--a-text-2)]">
                      API {connection.version}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setAddPortal(activePortal); setAddModal(true); }}
                    disabled={!portal.exportable}
                    className="flex items-center gap-2 rounded-xl border border-[var(--a-border)] px-4 py-2 text-[12px] font-semibold text-[var(--a-text-2)] transition-all hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"
                  >
                    <Plus size={14} /> Pridat
                  </button>
                  <button
                    onClick={handleSyncAll}
                    disabled={!!syncing || !connection?.implemented || !connection.configured}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-4 py-2 text-[12px] font-semibold text-[#0a0a0b] transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    <Zap size={14} /> Sync ted
                  </button>
                </div>
              </div>

              {connection && (
                <div
                  className={`mt-5 rounded-xl border px-4 py-3 text-[12px] ${
                    connection.implemented && connection.configured && connection.reachable
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : connection.implemented && connection.reachable
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                        : "border-red-500/20 bg-red-500/10 text-red-300"
                  }`}
                >
                  <span className="font-semibold">
                    {connection.implemented ? "Reálný konektor" : "Bez konektoru"}:
                  </span>{" "}
                  {connection.message}
                </div>
              )}

              {portal.exports.length > 0 ? (
                <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--a-border)]">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="border-b border-[var(--a-border)]">
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Nemovitost</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Status</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">ID na portalu</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Posledni sync</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Poznamka</th>
                        <th className="w-24 px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--a-border)]">
                      {portal.exports.map((exp) => {
                        const status = effectiveStatus(exp);
                        const si = STATUS_ICON[status] || STATUS_ICON.PENDING;
                        const Icon = si.icon;
                        return (
                          <tr key={exp.id} className="hover-row transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-[13px] font-semibold text-[var(--a-text)]">{exp.listing.title}</p>
                              <p className="text-[10.5px] text-[var(--a-text-3)]">{exp.listing.location}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`flex items-center gap-1.5 text-[12px] ${si.className}`}>
                                <Icon size={14} />
                                {si.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[12px] text-[var(--a-text-2)]">
                              {exp.remoteUrl ? (
                                <a
                                  href={exp.remoteUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[var(--a-bronze)] hover:underline"
                                >
                                  {exp.externalId || "Otevřít"} <ExternalLink size={9} className="inline" />
                                </a>
                              ) : (
                                exp.externalId || "-"
                              )}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-[var(--a-text-3)]">
                              {exp.verifiedAt
                                ? new Date(exp.verifiedAt).toLocaleString("cs-CZ")
                                : exp.lastAttemptAt
                                  ? `Pokus ${new Date(exp.lastAttemptAt).toLocaleString("cs-CZ")}`
                                  : "-"}
                            </td>
                            <td className="px-4 py-3 text-[12px] text-[var(--a-text-3)]">
                              <span className={exp.errorLog ? "text-red-400" : ""}>
                                {exp.errorLog || exp.remoteStatus || ""}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleSync(exp.id)}
                                  disabled={syncing === exp.id || syncing === "all"}
                                  className="flex h-7 items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 text-[10.5px] font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                                  title="Odeslat a ověřit na portálu"
                                >
                                  <RefreshCw size={11} className={syncing === exp.id ? "animate-spin" : ""} /> Ověřit
                                </button>
                                <button
                                  onClick={() => handleRemove(exp.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-red-500/10 hover:text-red-400"
                                  title="Odebrat"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--a-border)] py-12 text-center">
                  <AlertCircle size={24} className="text-[var(--a-text-3)]" />
                  <p className="mt-3 text-[14px] font-semibold text-[var(--a-text)]">Zadne exporty</p>
                  <p className="mt-1 text-[12px] text-[var(--a-text-3)]">Na tomto portalu zatim nejsou zadne inzeraty</p>
                  <button
                    onClick={() => { setAddPortal(activePortal); setAddModal(true); }}
                    disabled={!portal.exportable}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b]"
                  >
                    <Plus size={14} /> Pridat prvni inzerat
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add export modal */}
      {addModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setAddModal(false)} />
          <div className="fixed inset-x-4 top-[20%] z-50 mx-auto max-w-[480px] rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)] p-6 shadow-2xl">
            <h3 className="text-[17px] font-semibold text-[var(--a-text)]">Pridat inzerat na {PORTAL_META[addPortal]?.name || addPortal}</h3>
            <p className="mt-1 text-[12px] text-[var(--a-text-3)]">Vyberte nemovitost pro export</p>

            {availableListings.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-[var(--a-border)] py-8 text-center text-[13px] text-[var(--a-text-3)]">
                Vsechny aktivni nemovitosti uz jsou na tomto portalu
              </div>
            ) : (
              <div className="mt-4 max-h-[300px] space-y-1.5 overflow-y-auto">
                {availableListings.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleAddExport(l.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-[var(--a-surface-2)]"
                  >
                    <Building2 size={16} className="shrink-0 text-[var(--a-bronze)]" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--a-text)]">{l.title}</p>
                      <p className="text-[11px] text-[var(--a-text-3)]">{l.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setAddModal(false)}
                className="rounded-xl border border-[var(--a-border)] px-5 py-2.5 text-[12px] font-semibold text-[var(--a-text-2)] transition-all hover:border-[var(--a-border-hover)]"
              >
                Zavrit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
