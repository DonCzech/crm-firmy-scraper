"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Home,
  TreePine,
  Store,
  LayoutGrid,
  LayoutList,
  Image as ImageIcon,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useApi, apiDelete, apiPost } from "@/lib/useApi";

type Listing = {
  id: string;
  title: string;
  slug: string;
  status: string;
  deal: string;
  kind: string;
  disposition: string | null;
  price: number;
  location: string;
  area: number | null;
  featured: boolean;
  createdAt: string;
  publishedAt: string | null;
  agent: { id: string; name: string; avatar: string | null } | null;
  images: { url: string }[];
  portalExports: { portal: string; status: string }[];
  _count: { contacts: number };
};

type ListingsResponse = {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
};

const STATUS_MAP: Record<string, { label: string; dot: string; bg: string }> = {
  DRAFT: { label: "Koncept", dot: "bg-[var(--a-text-3)]", bg: "bg-[var(--a-surface)] text-[var(--a-text-2)]" },
  ACTIVE: { label: "Aktivni", dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]", bg: "bg-emerald-500/10 text-emerald-400" },
  RESERVED: { label: "Rezervace", dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]", bg: "bg-amber-500/10 text-amber-400" },
  SOLD: { label: "Prodano", dot: "bg-blue-400", bg: "bg-blue-500/10 text-blue-400" },
  RENTED: { label: "Pronajato", dot: "bg-violet-400", bg: "bg-violet-500/10 text-violet-400" },
  ARCHIVED: { label: "Archiv", dot: "bg-[var(--a-text-3)]", bg: "bg-[var(--a-surface)] text-[var(--a-text-3)]" },
};

const DEAL_MAP: Record<string, string> = { SALE: "Prodej", RENT: "Pronajem", INVESTMENT: "Investice" };
const KIND_MAP: Record<string, { icon: typeof Building2; label: string }> = {
  APARTMENT: { icon: Building2, label: "Byt" },
  HOUSE: { icon: Home, label: "Dum" },
  LAND: { icon: TreePine, label: "Pozemek" },
  COMMERCIAL: { icon: Store, label: "Komercni" },
};

function formatPrice(price: number, deal: string) {
  const f = new Intl.NumberFormat("cs-CZ").format(price);
  return deal === "RENT" ? `${f} Kc/mes.` : `${f} Kc`;
}

type ViewMode = "table" | "grid";

export default function NemovitostiPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dealFilter, setDealFilter] = useState("ALL");
  const [kindFilter, setKindFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "20");
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (dealFilter !== "ALL") params.set("deal", dealFilter);
  if (kindFilter !== "ALL") params.set("kind", kindFilter);
  if (search) params.set("q", search);

  const { data, loading, refetch } = useApi<ListingsResponse>(`/api/admin/listings?${params}`);

  async function handleDuplicate(id: string) {
    const { error } = await apiPost(`/api/admin/listings/${id}/duplicate`, {});
    if (!error) refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat tuto nemovitost?")) return;
    const { error } = await apiDelete(`/api/admin/listings/${id}`);
    if (!error) refetch();
  }

  const listings = data?.listings || [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-[32px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">
            {data?.total ?? "-"}
          </span>
          <span className="text-[14px] text-[var(--a-text-3)]">nemovitosti</span>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex overflow-hidden rounded-xl border border-[var(--a-border)]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex h-9 w-9 items-center justify-center transition-all ${viewMode === "table" ? "bg-[var(--a-surface-2)] text-[var(--a-text)]" : "text-[var(--a-text-3)] hover:text-[var(--a-text-2)]"}`}
              title="Tabulka"
            >
              <LayoutList size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex h-9 w-9 items-center justify-center border-l border-[var(--a-border)] transition-all ${viewMode === "grid" ? "bg-[var(--a-surface-2)] text-[var(--a-text)]" : "text-[var(--a-text-3)] hover:text-[var(--a-text-2)]"}`}
              title="Karty"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
          <Link
            href="/admin/nemovitosti/novy"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl"
          >
            <Plus size={14} /> Novy inzerat
          </Link>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["ALL", "ACTIVE", "DRAFT", "RESERVED", "SOLD", "RENTED", "ARCHIVED"].map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[11.5px] font-semibold transition-all duration-300 ${
                active
                  ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                  : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text-2)]"
              }`}
            >
              {s !== "ALL" && STATUS_MAP[s] && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_MAP[s].dot}`} />}
              {s === "ALL" ? "Vse" : STATUS_MAP[s]?.label || s}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Hledat nemovitosti..."
            className="h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent pl-10 pr-4 text-[12.5px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
          />
        </div>
        <select
          value={dealFilter}
          onChange={(e) => { setDealFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] px-4 text-[12.5px] text-[var(--a-text)] outline-none"
        >
          <option value="ALL">Vse typy</option>
          <option value="SALE">Prodej</option>
          <option value="RENT">Pronajem</option>
          <option value="INVESTMENT">Investice</option>
        </select>
        <select
          value={kindFilter}
          onChange={(e) => { setKindFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] px-4 text-[12.5px] text-[var(--a-text)] outline-none"
        >
          <option value="ALL">Vse druhy</option>
          <option value="APARTMENT">Byty</option>
          <option value="HOUSE">Domy</option>
          <option value="LAND">Pozemky</option>
          <option value="COMMERCIAL">Komercni</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && viewMode === "table" && (
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--a-border)]">
                  <th className="min-w-[380px] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Nemovitost</th>
                  <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Status</th>
                  <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Typ</th>
                  <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Cena</th>
                  <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Makler</th>
                  <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Foto</th>
                  <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Portaly</th>
                  <th className="w-12 px-4 py-4" />
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const kind = KIND_MAP[listing.kind] || KIND_MAP.APARTMENT;
                  const KindIcon = kind.icon;
                  const st = STATUS_MAP[listing.status] || STATUS_MAP.DRAFT;
                  const imgCount = listing.images?.length || 0;
                  return (
                    <tr key={listing.id} className="group border-b border-[var(--a-border)] transition-colors duration-200 hover-row">
                      <td className="px-5 py-3">
                        <Link href={`/admin/nemovitosti/${listing.id}`} className="flex items-center gap-4">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--a-surface-2)]">
                            {listing.images?.[0]?.url ? (
                              <img src={listing.images[0].url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImageIcon size={18} className="text-[var(--a-text-3)]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13.5px] font-semibold text-[var(--a-text)] transition-colors group-hover:text-[var(--a-bronze)]">
                              {listing.title}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--a-text-3)]">
                              <MapPin size={10} className="text-[var(--a-bronze)]" />
                              {listing.location}
                              {listing.disposition && <span className="text-[var(--a-text-3)]">&middot; {listing.disposition}</span>}
                              {listing.area && <span className="text-[var(--a-text-3)]">&middot; {listing.area} m&sup2;</span>}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--a-text-3)]">
                              <KindIcon size={9} />
                              {kind.label} &middot; {DEAL_MAP[listing.deal] || listing.deal}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${st.bg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[var(--a-text-2)]">{DEAL_MAP[listing.deal] || listing.deal}</td>
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-[var(--a-text)]">
                        {formatPrice(listing.price, listing.deal)}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[var(--a-text-2)]">
                        <div className="flex items-center gap-2">
                          {listing.agent?.avatar && (
                            <img src={listing.agent.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                          )}
                          {listing.agent?.name || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-[11px] text-[var(--a-text-3)]">
                          <ImageIcon size={11} />
                          {imgCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {listing.portalExports?.map((pe) => (
                            <span
                              key={pe.portal}
                              className={`flex h-5 items-center rounded-md px-1.5 text-[8px] font-semibold uppercase tracking-wider ${
                                pe.status === "SYNCED"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : pe.status === "ERROR"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {pe.portal.slice(0, 2)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a
                            href={`/nemovitost/${listing.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Zobrazit na webu"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--a-text-3)] opacity-0 transition-all hover:text-[var(--a-bronze)] group-hover:opacity-100"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <ContextMenu
                            id={listing.id}
                            slug={listing.slug}
                            open={contextMenu === listing.id}
                            onToggle={() => setContextMenu(contextMenu === listing.id ? null : listing.id)}
                            onClose={() => setContextMenu(null)}
                            onDelete={() => { setContextMenu(null); handleDelete(listing.id); }}
                            onDuplicate={() => { setContextMenu(null); handleDuplicate(listing.id); }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {listings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-[14px] text-[var(--a-text-3)]">
                      Zadne nemovitosti
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination data={data} page={page} setPage={setPage} />
        </div>
      )}

      {/* GRID / CARD VIEW */}
      {!loading && viewMode === "grid" && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => {
              const kind = KIND_MAP[listing.kind] || KIND_MAP.APARTMENT;
              const KindIcon = kind.icon;
              const st = STATUS_MAP[listing.status] || STATUS_MAP.DRAFT;
              const imgCount = listing.images?.length || 0;
              return (
                <div
                  key={listing.id}
                  className="glass-card group overflow-hidden rounded-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <Link href={`/admin/nemovitosti/${listing.id}`} className="relative block aspect-[16/10] overflow-hidden bg-[var(--a-surface-2)]">
                    {listing.images?.[0]?.url ? (
                      <img src={listing.images[0].url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon size={32} className="text-[var(--a-text-3)]" />
                      </div>
                    )}
                    <span className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${st.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    {imgCount > 0 && (
                      <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                        <ImageIcon size={10} /> {imgCount}
                      </span>
                    )}
                    <div className="absolute right-3 top-3">
                      <ContextMenu
                        id={listing.id}
                        slug={listing.slug}
                        open={contextMenu === listing.id}
                        onToggle={() => setContextMenu(contextMenu === listing.id ? null : listing.id)}
                        onClose={() => setContextMenu(null)}
                        onDelete={() => { setContextMenu(null); handleDelete(listing.id); }}
                          onDuplicate={() => { setContextMenu(null); handleDuplicate(listing.id); }}
                        variant="overlay"
                      />
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <Link href={`/admin/nemovitosti/${listing.id}`} className="block">
                      <h3 className="text-[14px] font-semibold leading-snug text-[var(--a-text)] transition-colors group-hover:text-[var(--a-bronze)]">
                        {listing.title}
                      </h3>
                    </Link>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--a-text-3)]">
                      <MapPin size={11} className="text-[var(--a-bronze)]" />
                      {listing.location}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {listing.disposition && (
                        <span className="rounded-md bg-[var(--a-surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--a-text-3)]">
                          {listing.disposition}
                        </span>
                      )}
                      {listing.area && (
                        <span className="rounded-md bg-[var(--a-surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--a-text-3)]">
                          {listing.area} m&sup2;
                        </span>
                      )}
                      <span className="rounded-md bg-[var(--a-surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--a-text-3)]">
                        <KindIcon size={9} className="mr-1 inline" />{kind.label}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--a-border)] pt-3">
                      <span className="text-[13px] font-semibold text-[var(--a-bronze)]">
                        {formatPrice(listing.price, listing.deal)}
                      </span>
                      <span className="text-[10px] text-[var(--a-text-3)]">
                        {DEAL_MAP[listing.deal] || listing.deal}
                      </span>
                    </div>

                    {(listing.agent || listing._count?.contacts > 0) && (
                      <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-[var(--a-text-3)]">
                        <span className="flex items-center gap-1.5">
                          {listing.agent?.avatar && (
                            <img src={listing.agent.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                          )}
                          {listing.agent?.name || ""}
                        </span>
                        {listing._count?.contacts > 0 && (
                          <span>{listing._count.contacts} poptav{listing._count.contacts === 1 ? "ka" : listing._count.contacts < 5 ? "ky" : "ek"}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {listings.length === 0 && (
              <div className="col-span-full py-12 text-center text-[14px] text-[var(--a-text-3)]">
                Zadne nemovitosti
              </div>
            )}
          </div>

          {data && data.pages > 1 && (
            <div className="glass-card rounded-2xl">
              <Pagination data={data} page={page} setPage={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ContextMenu({ id, slug, open, onToggle, onClose, onDelete, onDuplicate, variant = "default" }: {
  id: string;
  slug?: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  variant?: "default" | "overlay";
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
          variant === "overlay"
            ? "bg-black/50 text-white opacity-0 backdrop-blur-sm hover:bg-black/70 group-hover:opacity-100"
            : "text-[var(--a-text-3)] opacity-0 hover:text-[var(--a-text)] group-hover:opacity-100"
        }`}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] py-1 shadow-2xl backdrop-blur-xl">
            <Link
              href={`/admin/nemovitosti/${id}`}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] text-[var(--a-text-2)] hover-row hover:text-[var(--a-text)]"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
              <Pencil size={13} /> Upravit
            </Link>
            {slug && (
              <a
                href={`/nemovitost/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] text-[var(--a-text-2)] hover-row hover:text-[var(--a-text)]"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
              >
                <ExternalLink size={13} /> Zobrazit na webu
              </a>
            )}
            {onDuplicate && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDuplicate(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] text-[var(--a-text-2)] hover-row hover:text-[var(--a-text)]"
              >
                <Copy size={13} /> Duplikovat
              </button>
            )}
            <div className="my-1 border-t border-[var(--a-border)]" />
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] text-red-400 hover:bg-red-500/[0.06]"
            >
              <Trash2 size={13} /> Smazat
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Pagination({ data, page, setPage }: { data: ListingsResponse | null; page: number; setPage: (p: number) => void }) {
  if (!data || data.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[var(--a-border)] px-5 py-3.5">
      <p className="text-[11px] text-[var(--a-text-3)]">{data.total} zaznamu</p>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] hover-row disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-all ${
              p === page ? "bg-[var(--a-surface-2)] text-[var(--a-text)]" : "text-[var(--a-text-3)] hover-row"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= data.pages}
          onClick={() => setPage(page + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] hover-row disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
