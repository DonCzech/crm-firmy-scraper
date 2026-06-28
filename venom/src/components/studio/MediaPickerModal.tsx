"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Upload, Trash2, FolderOpen } from "lucide-react";

interface MediaItem {
  id: number;
  url: string;
  filename: string;
  alt_text: string | null;
  folder: string | null;
}

const DEMO_FOLDER = "Demo obrázky";

export function MediaPickerModal({
  tenantSlug,
  onPick,
  onClose,
}: {
  tenantSlug: string;
  onPick: (url: string, alt: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    fetch(`/api/demo/${tenantSlug}/media`)
      .then((r) => r.json())
      .then((d: { items?: MediaItem[] }) => {
        const all = d.items ?? [];
        setItems(all);
        // Default to "Moje soubory" if there are non-demo files, otherwise show all
        const hasOwn = all.some((i) => i.folder !== DEMO_FOLDER);
        setActiveFolder(hasOwn ? "own" : "demo");
      })
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tenantSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const demoItems = items.filter((i) => i.folder === DEMO_FOLDER);
  const ownItems  = items.filter((i) => i.folder !== DEMO_FOLDER);
  const visible   = activeFolder === "demo" ? demoItems : ownItems;

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("targetWidth", "1920");
      fd.append("targetHeight", "1080");
      const res = await fetch(`/api/demo/${tenantSlug}/upload-image`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = (await res.json()) as { url?: string; filename?: string };
        if (data.url) {
          // Pick immediately
          onPick(data.url, data.filename ?? file.name);
          onClose();
          return;
        }
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
    // If we get here, upload failed — reload media anyway
    load();
  }

  async function deleteFolder(folder: string) {
    if (!confirm(`Smazat všechny obrázky ve složce "${folder}"?`)) return;
    setDeletingFolder(true);
    try {
      await fetch(`/api/demo/${tenantSlug}/media?folder=${encodeURIComponent(folder)}`, { method: "DELETE" });
      load();
    } finally {
      setDeletingFolder(false);
    }
  }

  const folders = [
    ...(ownItems.length > 0  ? [{ key: "own",  label: "Moje soubory", count: ownItems.length }] : []),
    ...(demoItems.length > 0 ? [{ key: "demo", label: DEMO_FOLDER,    count: demoItems.length, isDemoFolder: true }] : []),
  ];

  return createPortal(
    <div
      data-studio
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-[min(720px,95vw)] max-h-[80vh] rounded-2xl border border-[#2a2a2e] bg-[#141416] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#27272a] px-5 py-3.5">
          <span className="text-[14px] font-semibold text-white">Vybrat obrázek</span>
          <div className="flex items-center gap-3">
            {/* Upload button */}
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" strokeWidth={2} />
              {uploading ? "Nahrávám…" : "Nahrát"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={onClose}
              className="text-[#71717a] hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Folder tabs */}
        {folders.length > 1 && (
          <div className="flex shrink-0 gap-1 border-b border-[#27272a] px-5 pt-3 pb-0">
            {folders.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFolder(f.key)}
                className={`relative flex items-center gap-1.5 px-3 pb-2.5 text-[12.5px] font-medium transition-colors ${
                  activeFolder === f.key
                    ? "text-white"
                    : "text-[#71717a] hover:text-[#a1a1aa]"
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                {f.label}
                <span className="text-[10px] text-[#52525b]">({f.count})</span>
                {activeFolder === f.key && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-t bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-[#71717a] text-[13px]">
              Načítám…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col h-40 items-center justify-center gap-3 text-center">
              <p className="text-[#71717a] text-[13px]">Žádná média</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600/80 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" strokeWidth={2} />
                Nahrát první obrázek
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-[#71717a] text-[13px]">
              Tato složka je prázdná
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onPick(item.url, item.alt_text ?? item.filename); onClose(); }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-[#27272a] hover:border-blue-500 transition-colors"
                >
                  <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Folder actions footer (only for Demo folder) */}
        {folders.find((f) => f.key === activeFolder && f.isDemoFolder) && demoItems.length > 0 && (
          <div className="shrink-0 border-t border-[#27272a] px-5 py-3 flex items-center justify-between">
            <span className="text-[11.5px] text-[#52525b]">
              Demonstrační obrázky lze hromadně smazat
            </span>
            <button
              type="button"
              disabled={deletingFolder}
              onClick={() => void deleteFolder(DEMO_FOLDER)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              {deletingFolder ? "Mažu…" : "Smazat složku"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
