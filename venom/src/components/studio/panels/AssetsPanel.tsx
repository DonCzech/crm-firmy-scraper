"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Image as ImageIcon, Upload, Loader2, Search, Copy, Check } from "lucide-react";
import type { StudioState } from "../TenantStudioView";

/**
 * F2 Sprint 3 — AssetsPanel with image-slots upload UI.
 *
 * Lists tenant media + per-slot upload. Slot dropdown selects target dimensions
 * for resize + WebP conversion. Uploaded URL copy-to-clipboard for paste into
 * Inspector fields.
 */
interface MediaItem {
  url: string;
  width?: number;
  height?: number;
  filename?: string;
  size_bytes?: number;
}

interface SlotMeta {
  key: string;
  width: number;
  height: number;
  label: string;
  fit: "cover" | "contain";
}

// Mirrors src/lib/image-slots.ts — kept compact for UI display
const SLOTS: SlotMeta[] = [
  { key: "hero-fullscreen",       width: 1920, height: 1080, label: "Hero 16:9",        fit: "cover" },
  { key: "hero-banner",           width: 1920, height: 720,  label: "Hero ultra-wide",  fit: "cover" },
  { key: "hero-slide",            width: 1920, height: 900,  label: "Hero slide",       fit: "cover" },
  { key: "gallery-tile-square",   width: 500,  height: 500,  label: "Galerie 1:1",      fit: "cover" },
  { key: "gallery-tile-3x2",      width: 600,  height: 400,  label: "Galerie 3:2",      fit: "cover" },
  { key: "gallery-tile-4x3",      width: 800,  height: 600,  label: "Galerie 4:3",      fit: "cover" },
  { key: "gallery-portrait",      width: 600,  height: 900,  label: "Portrét 2:3",      fit: "cover" },
  { key: "gallery-lightbox",      width: 1600, height: 1200, label: "Lightbox full",    fit: "contain" },
  { key: "service-card",          width: 600,  height: 400,  label: "Service karta",    fit: "cover" },
  { key: "service-icon",          width: 200,  height: 200,  label: "Service ikona",    fit: "contain" },
  { key: "team-portrait",         width: 400,  height: 500,  label: "Tým portrét",      fit: "cover" },
  { key: "team-thumb",            width: 200,  height: 200,  label: "Tým thumb",        fit: "cover" },
  { key: "logo-horizontal",       width: 400,  height: 120,  label: "Logo horizontal",  fit: "contain" },
  { key: "logo-square",           width: 240,  height: 240,  label: "Logo čtvercové",   fit: "contain" },
  { key: "favicon",               width: 512,  height: 512,  label: "Favicon",          fit: "cover" },
  { key: "blog-featured",         width: 1200, height: 630,  label: "Blog featured",    fit: "cover" },
  { key: "blog-card",             width: 600,  height: 400,  label: "Blog karta",       fit: "cover" },
  { key: "og-image",              width: 1200, height: 630,  label: "OG image",         fit: "cover" },
  { key: "section-bg",            width: 1920, height: 1080, label: "Pozadí sekce",     fit: "cover" },
  { key: "cta-bg",                width: 1920, height: 600,  label: "CTA pozadí",       fit: "cover" },
  { key: "testimonial-avatar",    width: 120,  height: 120,  label: "Avatar reference", fit: "cover" },
  { key: "partner-logo",          width: 240,  height: 120,  label: "Partner logo",     fit: "contain" },
];

export function AssetsPanel({ state }: { state: StudioState }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [filter, setFilter] = useState("");
  const [slot, setSlot] = useState<string>("hero-fullscreen");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/media`, { cache: "no-store" });
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data.items) ? (data.items as MediaItem[]) : []);
    } catch {
      setItems([]);
    }
  }, [state.tenant.slug]);

  useEffect(() => { void reload(); }, [reload]);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Nahraj prosím obrázek (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Soubor je příliš velký (max 10 MB).");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", slot);
      const res = await fetch(`/api/demo/${state.tenant.slug}/upload-image`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      await reload();
      // Auto-copy uploaded URL
      if (json.url) {
        try { await navigator.clipboard.writeText(json.url); setCopiedUrl(json.url); } catch {}
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload selhal");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl((u) => (u === url ? null : u)), 1500);
    } catch {}
  }

  const slotMeta = SLOTS.find((s) => s.key === slot) ?? SLOTS[0];
  const filtered = items?.filter((it) => !filter || it.url.toLowerCase().includes(filter.toLowerCase()) || (it.filename ?? "").toLowerCase().includes(filter.toLowerCase())) ?? null;

  return (
    <div className="flex h-full flex-col">
      {/* Slot selector + dropzone */}
      <div className="shrink-0 border-b border-[#27272a] p-2">
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#a1a1aa]">
          Typ obrázku
        </label>
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="mb-2 h-7 w-full rounded border border-[#27272a] bg-[#0f0f10] px-2 text-[11px] text-white focus:border-blue-500 focus:outline-none"
        >
          {SLOTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label} ({s.width}×{s.height})
            </option>
          ))}
        </select>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed py-4 text-[10.5px] transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-500/10 text-blue-300"
              : "border-[#3f3f46] text-[#71717a] hover:border-blue-500/50 hover:text-white"
          }`}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /><span>Nahrávám…</span></>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Přetáhni nebo klikni</span>
              <span className="text-[9.5px] text-[#52525b]">
                Konverze: WebP {slotMeta.width}×{slotMeta.height} {slotMeta.fit}
              </span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadFile(f);
          }}
          className="hidden"
        />

        {error && (
          <div className="mt-1.5 rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-300">{error}</div>
        )}
      </div>

      {/* Search */}
      <div className="shrink-0 border-b border-[#27272a] p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#52525b]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Hledat…"
            className="w-full rounded border border-[#27272a] bg-[#0f0f10] py-1 pl-6 pr-2 text-[11px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {filtered === null ? (
          <div className="p-3 text-[11px] text-[#71717a]">Načítám…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1c] text-[#52525b]">
              <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="text-[11px] font-medium text-[#d4d4d8]">
              {items?.length === 0 ? "Žádné obrázky" : "Nic nenalezeno"}
            </div>
            <p className="mt-1 max-w-[200px] text-[10.5px] leading-relaxed text-[#71717a]">
              {items?.length === 0
                ? "Nahraj první obrázek pomocí pole nahoře."
                : "Zkus jiné vyhledávání."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 p-2">
            {filtered.map((it, idx) => (
              <div key={idx} className="group relative aspect-square overflow-hidden rounded-md border border-[#27272a] bg-[#1a1a1c]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => copyUrl(it.url)}
                  className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
                  title="Kopírovat URL"
                >
                  {copiedUrl === it.url ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-300">
                      <Check className="h-3 w-3" /> Zkopírováno
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-white">
                      <Copy className="h-3 w-3" /> Kopírovat URL
                    </span>
                  )}
                </button>
                {(it.width || it.height) && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1 text-[9px] text-white opacity-0 group-hover:opacity-100">
                    {it.width}×{it.height}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#27272a] px-3 py-1.5 text-[10.5px] text-[#52525b]">
        {filtered === null ? "…" : `${filtered.length} ${filtered.length === 1 ? "obrázek" : filtered.length < 5 ? "obrázky" : "obrázků"}`}
      </div>
    </div>
  );
}
