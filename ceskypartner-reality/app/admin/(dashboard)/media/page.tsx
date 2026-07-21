"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Trash2,
  FileVideo,
  Check,
  X,
} from "lucide-react";
import { useApi, apiDelete } from "@/lib/useApi";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  listing: { id: string; title: string } | null;
  blogPost: { id: string; title: string } | null;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const params = new URLSearchParams();
  if (typeFilter !== "ALL") params.set("type", typeFilter);
  if (search) params.set("q", search);

  const { data, loading, refetch } = useApi<MediaItem[]>(`/api/admin/media?${params}`);
  const media = data || [];

  function toggleSelect(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      await fetch("/api/admin/upload", { method: "POST", body: fd });
    }
    setUploading(false);
    refetch();
  }

  async function handleDeleteSelected() {
    if (!confirm(`Smazat ${selected.size} souboru?`)) return;
    for (const id of Array.from(selected)) {
      await apiDelete(`/api/admin/media/${id}`);
    }
    setSelected(new Set());
    refetch();
  }

  function isImage(m: MediaItem) { return m.mimeType.startsWith("image/"); }
  const linkedTo = (m: MediaItem) => m.listing?.title || m.blogPost?.title || null;

  const totalSize = media.reduce((s, m) => s + m.size, 0);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-[32px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">
            {loading ? "-" : media.length}
          </span>
          <span className="text-[14px] text-[var(--a-text-3)]">
            souboru &middot; {formatSize(totalSize)}
          </span>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50"
        >
          {uploading ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0a0a0b] border-t-transparent" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? "Nahravam..." : "Nahrat soubory"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        className={`glass-card flex items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-all duration-300 ${
          dragOver ? "border-[var(--a-bronze)] bg-[var(--a-bronze-glow)]" : "border-[var(--a-border)]"
        }`}
      >
        <div className="text-center">
          <Upload size={24} className={dragOver ? "mx-auto text-[var(--a-bronze)]" : "mx-auto text-[var(--a-text-3)]"} />
          <p className="mt-2 text-[13px] text-[var(--a-text)]">Pretahnete soubory sem</p>
          <p className="mt-1 text-[11px] text-[var(--a-text-3)]">Obrazky auto-konverze do WebP &middot; Video do AV1</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat soubory..."
            className="h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent pl-10 pr-4 text-[12.5px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
          />
        </div>
        <div className="flex gap-1">
          {(["ALL", "image", "video"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-full border px-4 py-2 text-[11.5px] font-semibold transition-all duration-300 ${
                typeFilter === t
                  ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                  : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text-2)]"
              }`}
            >
              {t === "ALL" ? "Vse" : t === "image" ? "Obrazky" : "Video"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 rounded-xl border border-[var(--a-border)] p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`rounded-lg p-1.5 transition-all ${view === "grid" ? "bg-[var(--a-surface-2)] text-[var(--a-text)]" : "text-[var(--a-text-3)] hover:text-[var(--a-text)]"}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-lg p-1.5 transition-all ${view === "list" ? "bg-[var(--a-surface-2)] text-[var(--a-text)]" : "text-[var(--a-text-3)] hover:text-[var(--a-text)]"}`}
          >
            <List size={16} />
          </button>
        </div>

        {selected.size > 0 && (
          <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--a-bronze)]/20 bg-[var(--a-bronze-glow)] px-4 py-2 sm:w-auto">
            <span className="text-[12px] font-semibold text-[var(--a-bronze)]">{selected.size} vybrano</span>
            <button onClick={handleDeleteSelected} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-red-400 hover:text-red-300">
              <Trash2 size={12} /> Smazat
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-[var(--a-text-3)] hover:text-[var(--a-text)]">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      )}

      {/* Grid / List */}
      {!loading && view === "grid" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {media.map((m) => (
            <div
              key={m.id}
              onClick={() => toggleSelect(m.id)}
              className={`glass-card group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${
                selected.has(m.id) ? "ring-2 ring-[var(--a-bronze)]/50" : ""
              }`}
            >
              <div className="relative aspect-square bg-[var(--a-surface-2)]">
                {isImage(m) && m.url ? (
                  <img src={m.url} alt={m.filename} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileVideo size={32} className="text-[var(--a-text-3)]" />
                  </div>
                )}
                {selected.has(m.id) && (
                  <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--a-bronze)] text-[#0a0a0b]">
                    <Check size={13} strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[11.5px] font-semibold text-[var(--a-text)]">{m.filename}</p>
                <p className="mt-0.5 text-[10px] text-[var(--a-text-3)]">
                  {formatSize(m.size)}
                  {m.width && <> &middot; {m.width}x{m.height}</>}
                </p>
                {linkedTo(m) && (
                  <p className="mt-1 truncate text-[10px] text-[var(--a-bronze)]">{linkedTo(m)}</p>
                )}
              </div>
            </div>
          ))}
          {media.length === 0 && (
            <div className="col-span-full py-12 text-center text-[14px] text-[var(--a-text-3)]">
              Zadne soubory
            </div>
          )}
        </div>
      )}

      {!loading && view === "list" && (
        <div className="glass-card overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Soubor</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Typ</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Velikost</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Pouzito v</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--a-border)]">
              {media.map((m) => (
                <tr key={m.id} className="hover-row transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--a-surface-2)]">
                        {isImage(m) && m.url ? (
                          <img src={m.url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center"><FileVideo size={16} className="text-[var(--a-text-3)]" /></div>
                        )}
                      </div>
                      <span className="text-[13px] font-semibold text-[var(--a-text)]">{m.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--a-text-2)]">{m.mimeType}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--a-text-2)]">{formatSize(m.size)}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--a-bronze)]">{linkedTo(m) || "-"}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--a-text-3)]">{new Date(m.createdAt).toLocaleDateString("cs-CZ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
