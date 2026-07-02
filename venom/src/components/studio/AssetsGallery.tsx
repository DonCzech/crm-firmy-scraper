"use client";

import {
  useState, useEffect, useRef, useCallback, useId,
  type DragEvent, type ChangeEvent,
} from "react";
import {
  FolderPlus, ChevronDown, Search, Upload, X, Check, Info,
  Loader2, Folder, Trash2, ArrowRight, LayoutGrid, List, AlertCircle,
} from "@/components/studio/icons";
import clsx from "clsx";
import type { StudioState } from "./TenantStudioView";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaItem {
  id: number;
  url: string;
  filename: string;
  width: number | null;
  height: number | null;
  mime_type: string;
  size_bytes: number | null;
  alt_text: string | null;
  created_at: string;
}

interface UserFolder {
  id: string;
  name: string;
  itemIds: number[];
}

type SortBy = "date_desc" | "date_asc" | "name_asc" | "name_desc";
type Layout = "grid" | "list";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} kB`;
}

function truncate(str: string, max = 28): string {
  if (str.length <= max) return str;
  const ext = str.lastIndexOf(".");
  if (ext > 0) {
    const name = str.slice(0, ext);
    const extension = str.slice(ext);
    const keep = max - extension.length - 3;
    return keep > 0 ? name.slice(0, keep) + "..." + extension : str.slice(0, max - 3) + "...";
  }
  return str.slice(0, max - 3) + "...";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        checked ? "bg-[var(--vs-accent-solid)]" : "bg-[#3f3f46]"
      )}
    >
      <span className={clsx(
        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        checked ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  );
}

// ─── Možnosti dropdown ────────────────────────────────────────────────────────

function MoznostiDropdown({
  sortBy, setSortBy, layout, setLayout, convertWebP, setConvertWebP, onClose,
}: {
  sortBy: SortBy; setSortBy: (v: SortBy) => void;
  layout: Layout; setLayout: (v: Layout) => void;
  convertWebP: boolean; setConvertWebP: (v: boolean) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-2 w-[min(360px,calc(100vw-24px))] rounded-2xl border border-[#2a2a2e] bg-[var(--vs-surface)] shadow-2xl p-6 z-50">
      <h3 className="text-[15px] font-semibold text-white mb-5">Možnosti</h3>

      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] text-[var(--vs-text-muted)]">Seřadit podle</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="rounded-lg border border-[#3f3f46] bg-[#1a1a1d] px-3 py-1.5 text-[12px] text-white focus:outline-none focus:border-[var(--vs-accent)] transition-colors"
        >
          <option value="date_desc">Datum nahrání ↓</option>
          <option value="date_asc">Datum nahrání ↑</option>
          <option value="name_asc">Název A–Z</option>
          <option value="name_desc">Název Z–A</option>
        </select>
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="text-[13px] text-[var(--vs-text-muted)]">Rozložení</span>
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value as Layout)}
          className="rounded-lg border border-[#3f3f46] bg-[#1a1a1d] px-3 py-1.5 text-[12px] text-white focus:outline-none focus:border-[var(--vs-accent)] transition-colors"
        >
          <option value="grid">Mřížka</option>
          <option value="list">Seznam</option>
        </select>
      </div>

      <div className="border-t border-[#2a2a2e] pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[var(--vs-text-soft)]">Převést obrázky do WebP</p>
            <p className="text-[12px] text-[var(--vs-text-dim)] mt-1 leading-relaxed">
              Nahrané JPG nebo PNG obrázky budou automaticky převedené do WebP
            </p>
          </div>
          <Toggle checked={convertWebP} onChange={setConvertWebP} />
        </div>
      </div>
    </div>
  );
}

// ─── Upload tile ──────────────────────────────────────────────────────────────

function UploadTile({
  uploading, dragOver,
  onDragOver, onDragLeave, onDrop, onClick,
}: {
  uploading: boolean; dragOver: boolean;
  onDragOver: () => void; onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={clsx(
        "relative flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-all duration-150 aspect-square",
        dragOver
          ? "border-2 border-[var(--vs-accent)] bg-[var(--vs-accent-bg)]"
          : "border-2 border-dashed border-[#2c2c30] hover:border-[#3d3d42] hover:bg-white/[0.02]"
      )}
    >
      {uploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-[var(--vs-accent)]" />
      ) : (
        <>
          <div className={clsx(
            "flex items-center justify-center w-[72px] h-[72px] rounded-full border-2 border-dashed transition-colors",
            dragOver ? "border-[var(--vs-accent)]" : "border-[var(--vs-accent-ring)]"
          )}>
            <Upload className="h-7 w-7 text-[var(--vs-accent)]" strokeWidth={1.5} />
          </div>
          <p className="text-[10.5px] font-bold tracking-[0.15em] text-[var(--vs-text-dim)] uppercase">
            Nahrát soubor
          </p>
        </>
      )}
    </div>
  );
}

// ─── Media tile (grid) ────────────────────────────────────────────────────────

function MediaTile({
  item, selected, dragging,
  onSelect, onInfo, onDragStart, onDragEnd,
}: {
  item: MediaItem; selected: boolean; dragging: boolean;
  onSelect: () => void; onInfo: () => void;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const isSvg = item.mime_type === "image/svg+xml";
  const isImage = item.mime_type.startsWith("image/");

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={clsx(
        "group relative flex flex-col gap-1.5 cursor-grab active:cursor-grabbing",
        dragging && "opacity-40 scale-95 transition-all"
      )}
    >
      {/* Thumbnail */}
      <div className={clsx(
        "relative rounded-xl overflow-hidden aspect-square transition-all duration-150",
        isSvg ? "bg-[#1a1a1d]" : "bg-[#1a1a1d]",
        selected ? "ring-2 ring-[var(--vs-accent)] ring-offset-2 ring-offset-[#0c0c0e]" : "hover:ring-1 hover:ring-white/20"
      )}>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.filename}
            className="h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--vs-text-muted)] text-[11px]">
            {item.mime_type}
          </div>
        )}

        {/* Selection circle */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={clsx(
            "absolute top-2 left-2 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-150",
            selected
              ? "bg-[var(--vs-accent-solid)] border-[var(--vs-accent)] opacity-100"
              : "bg-black/40 border-white/50 opacity-0 group-hover:opacity-100"
          )}
        >
          {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </button>

        {/* Info button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onInfo(); }}
          className="absolute bottom-2 right-2 flex items-center justify-center w-[18px] h-[18px] rounded bg-black/60 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          title="Informace"
        >
          i
        </button>

        {/* WebP badge */}
        {item.mime_type === "image/webp" && (
          <div className="absolute top-2 right-2 rounded bg-emerald-500/80 px-1 py-0.5 text-[8px] font-bold text-white tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
            WebP
          </div>
        )}
      </div>

      {/* Info below */}
      <p className="text-[12px] text-[var(--vs-text-soft)] leading-tight truncate px-0.5" title={item.filename}>
        {truncate(item.filename)}
      </p>
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[10.5px] text-[var(--vs-text-dim)] leading-tight">
          {formatSize(item.size_bytes)}
          {item.width && item.height ? ` ${item.width} × ${item.height}` : ""}
        </p>
      </div>
    </div>
  );
}

// ─── Media row (list view) ────────────────────────────────────────────────────

function MediaRow({
  item, selected, onSelect, onInfo,
}: {
  item: MediaItem; selected: boolean; onSelect: () => void; onInfo: () => void;
}) {
  return (
    <div className={clsx(
      "group flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors duration-100",
      selected ? "bg-[var(--vs-accent-bg)]" : "hover:bg-white/[0.04]"
    )}>
      <button
        type="button"
        onClick={onSelect}
        className={clsx(
          "flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 transition-colors",
          selected ? "bg-[var(--vs-accent-solid)] border-[var(--vs-accent)]" : "border-[var(--vs-text-dim)] hover:border-white"
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </button>
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1d] shrink-0">
        {item.mime_type.startsWith("image/") && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>
      <p className="flex-1 text-[13px] text-[var(--vs-text-soft)] truncate">{item.filename}</p>
      <p className="text-[11px] text-[var(--vs-text-dim)] shrink-0 w-24 text-right">{formatSize(item.size_bytes)}</p>
      <p className="text-[11px] text-[var(--vs-text-dim)] shrink-0 w-28 text-right">
        {item.width && item.height ? `${item.width} × ${item.height}` : "—"}
      </p>
      <p className="text-[11px] text-[var(--vs-text-dim)] shrink-0 w-28 text-right">
        {new Date(item.created_at).toLocaleDateString("cs-CZ")}
      </p>
      <button type="button" onClick={onInfo} className="text-[var(--vs-text-dim)] hover:text-white transition-colors shrink-0">
        <Info className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Info lightbox ────────────────────────────────────────────────────────────

function InfoPopup({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyUrl() {
    void navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-5xl mx-4 rounded-2xl overflow-hidden border border-[#2a2a2e] shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        {/* Large image */}
        <div className="flex-1 bg-[#0a0a0b] flex items-center justify-center min-h-[400px]">
          {item.mime_type.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.filename}
              className="max-w-full max-h-[85vh] object-contain"
              style={{ display: "block" }}
            />
          ) : (
            <div className="text-[var(--vs-text-dim)] text-sm">{item.mime_type}</div>
          )}
        </div>

        {/* Right side info panel */}
        <div className="w-72 shrink-0 bg-[var(--vs-surface)] border-l border-[#2a2a2e] flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-[#2a2a2e]">
            <p className="text-[13px] font-semibold text-white break-all leading-snug">{item.filename}</p>
            {item.alt_text && (
              <p className="mt-1 text-[11px] text-[var(--vs-text-dim)]">{item.alt_text}</p>
            )}
          </div>

          <div className="p-5 space-y-4 flex-1">
            <InfoRow label="Rozměry" value={item.width && item.height ? `${item.width} × ${item.height} px` : "—"} />
            <InfoRow label="Velikost" value={formatSize(item.size_bytes) || "—"} />
            <InfoRow label="Formát" value={item.mime_type.split("/")[1]?.toUpperCase() ?? "—"} />
            <InfoRow label="Nahráno" value={new Date(item.created_at).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })} />
          </div>

          <div className="p-5 border-t border-[#2a2a2e]">
            <p className="text-[11px] text-[var(--vs-text-dim)] mb-2">URL souboru</p>
            <div className="rounded-xl bg-[#1a1a1d] p-3 mb-3">
              <p className="text-[11px] text-[var(--vs-text-muted)] font-mono break-all leading-relaxed">{item.url}</p>
            </div>
            <button
              type="button"
              onClick={copyUrl}
              className={clsx(
                "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-colors",
                copied
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-[var(--vs-accent-solid)] hover:bg-[var(--vs-accent-solid-hi)] text-white"
              )}
            >
              {copied ? (
                <><Check className="h-4 w-4" strokeWidth={2.5} /> Zkopírováno</>
              ) : (
                <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Kopírovat URL</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[var(--vs-text-dim)] mb-0.5 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-[13px] text-[var(--vs-text-soft)]">{value}</p>
    </div>
  );
}

// ─── Action bar (shown when items selected) ───────────────────────────────────

function SelectionBar({
  count, folders, onMoveToFolder, onDelete, onClearSelection,
}: {
  count: number;
  folders: UserFolder[];
  onMoveToFolder: (folderId: string) => void;
  onDelete: () => void;
  onClearSelection: () => void;
}) {
  const [movePanelOpen, setMovePanelOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-[var(--vs-accent-bg)] border-b border-[var(--vs-accent-ring)]">
      <span className="text-[13px] font-medium text-[var(--vs-accent-hi)]">{count} vybraných</span>
      <div className="flex-1" />

      {/* Move to folder */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMovePanelOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-[#3f3f46] bg-[#1a1a1d] px-3 py-1.5 text-[12px] text-[var(--vs-text-muted)] hover:text-white transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" /> Přesunout do složky
        </button>
        {movePanelOpen && (
          <div className="absolute top-full right-0 mt-1 w-[200px] rounded-xl border border-[#2a2a2e] bg-[var(--vs-surface)] shadow-xl p-2 z-50">
            {folders.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-[var(--vs-text-dim)]">Žádné složky</p>
            ) : (
              folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { onMoveToFolder(f.id); setMovePanelOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[var(--vs-text-muted)] hover:bg-white/[0.05] hover:text-white transition-colors"
                >
                  <Folder className="h-3.5 w-3.5" /> {f.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-500/20 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" /> Smazat
      </button>

      {/* Clear */}
      <button
        type="button"
        onClick={onClearSelection}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--vs-text-dim)] hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main AssetsGallery ───────────────────────────────────────────────────────

export function AssetsGallery({ state, onClose }: { state: StudioState; onClose: () => void }) {
  const slug = state.tenant.slug;
  const fileInputId = useId();

  // Data
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const seededRef = useRef(false);

  // UI state
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  // Možnosti
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const [layout, setLayout] = useState<Layout>("grid");
  const [convertWebP, setConvertWebP] = useState(true);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggingItemIds, setDraggingItemIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Info popup
  const [infoItem, setInfoItem] = useState<MediaItem | null>(null);

  // Drag-to-folder
  const [folderDragOver, setFolderDragOver] = useState<string | null>(null);

  // Load media
  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/api/demo/${slug}/media`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json() as { items?: MediaItem[] };
        setItems(Array.isArray(data.items) ? data.items : []);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  }, [slug]);

  useEffect(() => { void reload(); }, [reload]);

  // Auto-seed sample images on first open (server skips if already has media)
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    fetch(`/api/demo/${slug}/media/seed`, { method: "POST" })
      .then((r) => r.ok ? reload() : null)
      .catch(() => void 0);
  }, [slug, reload]);

  // Focus folder input when creating
  useEffect(() => {
    if (creatingFolder) newFolderInputRef.current?.focus();
  }, [creatingFolder]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ─── Upload ───────────────────────────────────────────────────────────────

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (!convertWebP) fd.append("skip_webp", "1");
      const res = await fetch(`/api/demo/${slug}/upload-image`, { method: "POST", body: fd });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      await reload();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload selhal");
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onFileDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  // ─── Selection ────────────────────────────────────────────────────────────

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function clearSelection() { setSelectedIds(new Set()); }

  // ─── Folders ──────────────────────────────────────────────────────────────

  function confirmFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    setFolders((prev) => [...prev, { id: crypto.randomUUID(), name, itemIds: [] }]);
    setNewFolderName("");
    setCreatingFolder(false);
  }

  function moveSelectedToFolder(folderId: string) {
    setFolders((prev) => prev.map((f) =>
      f.id === folderId
        ? { ...f, itemIds: [...new Set([...f.itemIds, ...selectedIds])] }
        : f
    ));
    clearSelection();
  }

  function handleFolderDrop(e: DragEvent<HTMLButtonElement>, folderId: string) {
    e.preventDefault();
    setFolderDragOver(null);
    if (draggingItemIds.size > 0) {
      setFolders((prev) => prev.map((f) =>
        f.id === folderId
          ? { ...f, itemIds: [...new Set([...f.itemIds, ...draggingItemIds])] }
          : f
      ));
      setDraggingItemIds(new Set());
      clearSelection();
    }
  }

  // ─── Filtering + sorting ──────────────────────────────────────────────────

  const activeFolderObj = folders.find((f) => f.id === activeFolder) ?? null;

  const filtered = (items ?? [])
    .filter((item) => {
      if (activeFolder === "uncategorized") {
        const inAnyFolder = folders.some((f) => f.itemIds.includes(item.id));
        if (inAnyFolder) return false;
      } else if (activeFolderObj) {
        if (!activeFolderObj.itemIds.includes(item.id)) return false;
      }
      if (!search) return true;
      return item.filename.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_desc": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date_asc": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name_asc": return a.filename.localeCompare(b.filename);
        case "name_desc": return b.filename.localeCompare(a.filename);
      }
    });

  const totalCount = items?.length ?? 0;
  const shownCount = filtered.length;

  // ─── Delete selected ──────────────────────────────────────────────────────

  async function deleteSelected() {
    if (!window.confirm(`Opravdu smazat ${selectedIds.size} souborů?`)) return;
    await Promise.all(
      [...selectedIds].map((id) =>
        fetch(`/api/demo/${slug}/media/${id}`, { method: "DELETE" }).catch(() => null)
      )
    );
    clearSelection();
    await reload();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex max-[760px]:flex-col bg-[#0c0c0e] text-white" style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>

      {/* ── Left: Folders ── */}
      <div className="w-[220px] shrink-0 border-r border-white/[0.07] flex flex-col bg-[#0f0f11] max-[760px]:w-full max-[760px]:max-h-[150px] max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:border-white/[0.07]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.05]">
          <span className="text-[14px] font-semibold text-white">Složky</span>
          <button
            type="button"
            title="Nová složka"
            onClick={() => { setCreatingFolder(true); setNewFolderName(""); }}
            className="text-[var(--vs-text-dim)] hover:text-white transition-colors rounded-lg p-1 hover:bg-white/[0.06]"
          >
            <FolderPlus className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 max-[760px]:flex max-[760px]:overflow-x-auto max-[760px]:overflow-y-hidden max-[760px]:px-2">
          {/* Vše */}
          <button
            type="button"
            onClick={() => setActiveFolder(null)}
            className={clsx(
              "w-full text-left flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors rounded-none max-[760px]:w-auto max-[760px]:shrink-0 max-[760px]:rounded-xl",
              activeFolder === null
                ? "text-white font-medium bg-white/[0.06]"
                : "text-[var(--vs-text-muted)] hover:text-white hover:bg-white/[0.03]"
            )}
          >
            Vše
            {totalCount > 0 && (
              <span className="ml-auto text-[11px] text-[var(--vs-text-dim)]">{totalCount}</span>
            )}
          </button>

          {/* Nezařazené */}
          <button
            type="button"
            onClick={() => setActiveFolder("uncategorized")}
            className={clsx(
              "w-full text-left flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors max-[760px]:w-auto max-[760px]:shrink-0 max-[760px]:rounded-xl",
              activeFolder === "uncategorized"
                ? "text-white font-medium bg-white/[0.06]"
                : "text-[var(--vs-text-muted)] hover:text-white hover:bg-white/[0.03]"
            )}
          >
            Nezařazené
          </button>

          {/* User folders */}
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              draggable={false}
              onDragOver={(e) => { e.preventDefault(); setFolderDragOver(f.id); }}
              onDragLeave={() => setFolderDragOver(null)}
              onDrop={(e) => handleFolderDrop(e, f.id)}
              onClick={() => setActiveFolder(f.id)}
              className={clsx(
                "w-full text-left flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors max-[760px]:w-auto max-[760px]:shrink-0 max-[760px]:rounded-xl",
                activeFolder === f.id
                  ? "text-white font-medium bg-white/[0.06]"
                  : "text-[var(--vs-text-muted)] hover:text-white hover:bg-white/[0.03]",
                folderDragOver === f.id && "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] !border-l-2 border-[var(--vs-accent)]"
              )}
            >
              <Folder className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{f.name}</span>
              {f.itemIds.length > 0 && (
                <span className="ml-auto text-[11px] text-[var(--vs-text-dim)]">{f.itemIds.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* New folder inline input */}
        {creatingFolder && (
          <div className="px-3 pb-3 pt-1 border-t border-white/[0.05]">
            <div className="flex items-center gap-1.5">
              <input
                ref={newFolderInputRef}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmFolder();
                  if (e.key === "Escape") setCreatingFolder(false);
                }}
                placeholder="název složky"
                className="flex-1 min-w-0 rounded-lg border border-[#3f3f46] bg-[#1a1a1d] px-2.5 py-1.5 text-[12px] text-white placeholder-[var(--vs-text-dim)] focus:border-[var(--vs-accent)] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={confirmFolder}
                className="flex items-center justify-center h-7 w-7 rounded-lg bg-[var(--vs-accent-solid)] hover:bg-[var(--vs-accent-solid-hi)] transition-colors shrink-0"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Main content ── */}
      <div className="flex min-h-0 flex-1 min-w-0 flex-col">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.07] bg-[#0f0f11] shrink-0 max-[760px]:flex-wrap max-[760px]:gap-2 max-[760px]:px-3">
          {/* Možnosti */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOptionsOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-[#3f3f46] bg-[#1a1a1d] px-3.5 py-2 text-[13px] text-[var(--vs-text-muted)] hover:text-white hover:border-[var(--vs-text-dim)] transition-colors"
            >
              Možnosti <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            {optionsOpen && (
              <MoznostiDropdown
                sortBy={sortBy} setSortBy={setSortBy}
                layout={layout} setLayout={setLayout}
                convertWebP={convertWebP} setConvertWebP={setConvertWebP}
                onClose={() => setOptionsOpen(false)}
              />
            )}
          </div>

          {/* Search */}
          <div className="relative w-[340px] max-[760px]:order-3 max-[760px]:w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vs-text-dim)] pointer-events-none" strokeWidth={1.75} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat v galerii"
              className="w-full rounded-xl border border-[#3f3f46] bg-[#1a1a1d] pl-9 pr-4 py-2 text-[13px] text-white placeholder-[var(--vs-text-dim)] focus:border-[var(--vs-text-dim)] focus:outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vs-text-dim)] hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1" />

          {/* Layout toggle */}
          <div className="flex items-center rounded-xl border border-[#3f3f46] bg-[#1a1a1d] p-1">
            <button
              type="button"
              onClick={() => setLayout("grid")}
              className={clsx("flex items-center justify-center w-7 h-7 rounded-lg transition-colors", layout === "grid" ? "bg-white/[0.1] text-white" : "text-[var(--vs-text-dim)] hover:text-white")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayout("list")}
              className={clsx("flex items-center justify-center w-7 h-7 rounded-lg transition-colors", layout === "list" ? "bg-white/[0.1] text-white" : "text-[var(--vs-text-dim)] hover:text-white")}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-[var(--vs-accent-solid)] hover:bg-[var(--vs-accent-solid-hi)] active:bg-[var(--vs-accent-solid)] px-4 py-2 text-[13px] font-semibold text-white transition-colors shadow-[var(--vs-glow-accent)]"
          >
            <Upload className="h-4 w-4" strokeWidth={2} />
            Nahrát
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--vs-text-dim)] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Selection action bar */}
        {selectedIds.size > 0 && (
          <SelectionBar
            count={selectedIds.size}
            folders={folders}
            onMoveToFolder={moveSelectedToFolder}
            onDelete={() => void deleteSelected()}
            onClearSelection={clearSelection}
          />
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-[13px] text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {/* Grid / List content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {items === null ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--vs-text-dim)]">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-[13px]">Načítám galerii…</p>
            </div>
          ) : layout === "grid" ? (
            <div className="p-5">
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))" }}>
                {/* Upload tile - always first */}
                <UploadTile
                  uploading={uploading}
                  dragOver={dragOver}
                  onDragOver={() => setDragOver(true)}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                />

                {/* Media tiles */}
                {filtered.map((item) => (
                  <MediaTile
                    key={item.id}
                    item={item}
                    selected={selectedIds.has(item.id)}
                    dragging={draggingItemIds.has(item.id)}
                    onSelect={() => toggleSelect(item.id)}
                    onInfo={() => setInfoItem(item)}
                    onDragStart={(e) => {
                      const ids = selectedIds.has(item.id) ? selectedIds : new Set([item.id]);
                      setDraggingItemIds(ids);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggingItemIds(new Set())}
                  />
                ))}
              </div>

              {filtered.length === 0 && items.length > 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--vs-text-dim)]">
                  <Search className="h-8 w-8 mb-3 opacity-50" />
                  <p className="text-[13px]">Žádné soubory neodpovídají vyhledávání</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto p-5 max-[760px]:p-3">
              {/* List header */}
              <div className="flex items-center gap-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--vs-text-dim)] border-b border-white/[0.05] mb-1">
                <div className="w-5 shrink-0" />
                <div className="w-10 shrink-0" />
                <div className="flex-1">Název</div>
                <div className="w-24 text-right">Velikost</div>
                <div className="w-28 text-right">Rozměry</div>
                <div className="w-28 text-right">Datum</div>
                <div className="w-8" />
              </div>

              {/* Upload row in list mode */}
              <div
                className="flex items-center gap-4 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#2c2c30] hover:border-[var(--vs-accent-ring)] cursor-pointer transition-colors mb-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-5 shrink-0" />
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1d] flex items-center justify-center shrink-0">
                  <Upload className="h-4 w-4 text-[var(--vs-accent)]" />
                </div>
                <span className="text-[12px] font-bold tracking-widest text-[var(--vs-text-dim)] uppercase">Nahrát soubor</span>
              </div>

              {filtered.map((item) => (
                <MediaRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onSelect={() => toggleSelect(item.id)}
                  onInfo={() => setInfoItem(item)}
                />
              ))}

              {filtered.length === 0 && items.length > 0 && (
                <div className="py-16 text-center text-[13px] text-[var(--vs-text-dim)]">
                  Žádné soubory neodpovídají vyhledávání
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="shrink-0 flex items-center gap-3 border-t border-white/[0.07] px-5 py-2 bg-[#0f0f11] max-[760px]:px-3">
          <p className="text-[11.5px] text-[var(--vs-text-dim)]">
            {items === null ? "…" : `${shownCount} ${shownCount === 1 ? "soubor" : shownCount < 5 ? "soubory" : "souborů"}`}
            {shownCount !== totalCount && ` z ${totalCount}`}
          </p>
          {selectedIds.size > 0 && (
            <p className="text-[11.5px] text-[var(--vs-accent)]">{selectedIds.size} vybraných</p>
          )}
          <div className="flex-1" />
          {convertWebP && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-500/80">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Auto WebP
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        id={fileInputId}
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        multiple
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(e.target.files ?? []);
          void Promise.all(files.map((f) => uploadFile(f)));
          e.target.value = "";
        }}
      />

      {/* Info popup */}
      {infoItem && <InfoPopup item={infoItem} onClose={() => setInfoItem(null)} />}
    </div>
  );
}
