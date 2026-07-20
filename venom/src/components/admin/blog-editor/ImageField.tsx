"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FolderOpen, Link2, X, Loader2 } from "lucide-react";
import { MediaPicker } from "./MediaPicker";

interface Props {
  tenantSlug: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Compact renders a smaller preview (for in-block images) */
  compact?: boolean;
}

/** Image input with drag&drop upload, media library and manual URL entry. */
export function ImageField({ tenantSlug, value, onChange, label, compact }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
        onChange(d.url);
      } catch {
        setError("Nahrání se nezdařilo");
      } finally {
        setUploading(false);
      }
    },
    [tenantSlug, onChange]
  );

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>}

      {value ? (
        <div className={`relative rounded-xl overflow-hidden bg-gray-100 group ${compact ? "h-32" : "h-44"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-gray-800 hover:bg-gray-100 flex items-center gap-1.5"
            >
              <UploadCloud size={13} /> Nahradit
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-gray-800 hover:bg-gray-100 flex items-center gap-1.5"
            >
              <FolderOpen size={13} /> Knihovna
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
            >
              <X size={13} /> Odebrat
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
          className={`border-2 border-dashed rounded-xl text-center transition-colors ${compact ? "p-4" : "p-6"} ${
            dragOver ? "border-violet-500 bg-violet-50" : "border-gray-200"
          }`}
        >
          {uploading ? (
            <p className="text-sm text-violet-600 font-medium flex items-center justify-center gap-2">
              <Loader2 size={15} className="animate-spin" /> Nahrávám…
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-2">Přetáhněte obrázek sem, nebo</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 flex items-center gap-1.5"
                >
                  <UploadCloud size={13} /> Nahrát
                </button>
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <FolderOpen size={13} /> Knihovna
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrl(!showUrl)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <Link2 size={13} /> URL
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showUrl && !value && (
        <input
          type="url"
          placeholder="https://…"
          className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) { onChange(v); setShowUrl(false); }
            }
          }}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v) { onChange(v); setShowUrl(false); }
          }}
        />
      )}

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

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

      {showPicker && (
        <MediaPicker
          tenantSlug={tenantSlug}
          onClose={() => setShowPicker(false)}
          onSelect={(url) => { onChange(url); setShowPicker(false); }}
        />
      )}
    </div>
  );
}
