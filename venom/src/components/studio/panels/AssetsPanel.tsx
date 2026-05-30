"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import type { StudioState } from "../TenantStudioView";

interface MediaItem { url: string; width?: number; height?: number }

export function AssetsPanel({ state }: { state: StudioState }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/demo/${state.tenant.slug}/media`)
      .then(r => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled) return;
        if (data && Array.isArray(data.items)) setItems(data.items as MediaItem[]);
        else setItems([]);
      })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [state.tenant.slug]);

  if (items === null) {
    return <div className="p-3 text-xs text-[#71717a]">Načítám…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1c] text-[#52525b]">
          <ImageIcon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="text-xs font-medium text-[#d4d4d8]">Žádné obrázky</div>
        <p className="mt-1 text-[11px] leading-relaxed text-[#71717a]">
          Obrázky nahrané přes editor se zde zobrazí.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 p-2">
      {items.map((it, idx) => (
        <div
          key={idx}
          className="group relative aspect-square overflow-hidden rounded-md border border-[#27272a] bg-[#1a1a1c]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.url} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}
