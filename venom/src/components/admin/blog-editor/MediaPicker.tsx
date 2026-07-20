"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, UploadCloud, ImageIcon, Loader2 } from "lucide-react";

interface MediaItem {
  id: number;
  url: string;
  filename: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
}

interface Props {
  tenantSlug: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

/** Modal media picker: tenant media library + drag&drop upload. */
export function MediaPicker({ tenantSlug, onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/demo/${tenantSlug}/media?limit=200`);
        if (res.ok) {
          const d = (await res.json()) as { items: MediaItem[] };
          if (!cancelled) setItems(d.items.filter((i) => i.url));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tenantSlug]);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Nahrát lze pouze obrázky.");
        return;
      }
      setUploading(true);
      setError("");
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("responsive", "true");
        const res = await fetch(`/api/demo/${tenantSlug}/upload-image`, { method: "POST", body: fd });
        const d = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !d.url) {
          setError(d.error ?? "Nahrání se nezdařilo");
          return;
        }
        onSelect(d.url);
      } catch {
        setError("Nahrání se nezdařilo");
      } finally {
        setUploading(false);
      }
    },
    [tenantSlug, onSelect]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Výběr obrázku"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon size={18} className="text-violet-600" /> Knihovna médií
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Zavřít">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void upload(file);
            }}
            onClick={() => fileRef.current?.click()}
            className={`mb-5 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = "";
              }}
            />
            {uploading ? (
              <p className="text-sm text-violet-600 font-medium flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Nahrávám a optimalizuji…
              </p>
            ) : (
              <>
                <UploadCloud size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Přetáhněte obrázek sem nebo klikněte</p>
                <p className="text-xs text-gray-400 mt-1">Automaticky se vytvoří WebP + responzivní varianty</p>
              </>
            )}
          </div>

          {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {/* Library grid */}
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Načítám knihovnu…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Knihovna je zatím prázdná.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.url)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-transparent hover:border-violet-500 transition-colors"
                  title={item.filename}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.alt_text ?? item.filename} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/10 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
