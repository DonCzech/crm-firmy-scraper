'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface Media { id?: string; url: string; isCover?: boolean }

export function ListingPhotoGrid({
  media,
  gridHeight = 'h-[480px]',
  rounded = true,
}: {
  media: Media[];
  gridHeight?: string;
  rounded?: boolean;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Cover image first
  const sorted = [...(media ?? [])].sort((a, b) =>
    a.isCover ? -1 : b.isCover ? 1 : 0,
  );

  const prev = useCallback(() =>
    setLightboxIdx((i) => (i !== null ? (i - 1 + sorted.length) % sorted.length : 0)),
    [sorted.length],
  );
  const next = useCallback(() =>
    setLightboxIdx((i) => (i !== null ? (i + 1) % sorted.length : 0)),
    [sorted.length],
  );

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightboxIdx(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, prev, next]);

  if (!sorted.length) {
    return (
      <div className="h-[480px] flex items-center justify-center rounded-xl bg-gray-100 text-6xl text-gray-300">
        🏠
      </div>
    );
  }

  const [main, ...rest] = sorted;
  const sideA = rest[0];
  const sideB = rest[1];
  const totalCount = sorted.length;

  return (
    <>
      {/* Zillow-style grid: big left, 2 stacked right */}
      <div className={`grid grid-cols-2 gap-2 overflow-hidden ${rounded ? 'rounded-xl' : ''} ${gridHeight}`}>
        {/* Main image */}
        <div
          className="relative cursor-pointer bg-gray-100 col-span-1 row-span-2"
          onClick={() => setLightboxIdx(0)}
        >
          <Image
            src={main.url}
            alt="Hlavní fotografie"
            fill
            priority
            className="object-cover hover:brightness-95 transition"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Side image A */}
        {sideA ? (
          <div
            className="relative cursor-pointer bg-gray-100"
            onClick={() => setLightboxIdx(1)}
          >
            <Image
              src={sideA.url}
              alt="Fotografie"
              fill
              className="object-cover hover:brightness-95 transition"
              sizes="(max-width: 768px) 0, 25vw"
            />
          </div>
        ) : (
          <div className="bg-gray-100" />
        )}

        {/* Side image B + "All photos" overlay */}
        {sideB ? (
          <div
            className="relative cursor-pointer bg-gray-100"
            onClick={() => setLightboxIdx(2)}
          >
            <Image
              src={sideB.url}
              alt="Fotografie"
              fill
              className="object-cover hover:brightness-95 transition"
              sizes="(max-width: 768px) 0, 25vw"
            />
            {totalCount > 3 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(0); }}
                className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-white font-semibold text-sm hover:bg-black/60 transition"
              >
                <Camera size={18} />
                Všechny fotografie ({totalCount})
              </button>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 flex items-center justify-center text-gray-300 text-3xl">🏠</div>
        )}
      </div>

      {/* "All photos" button when only 1–2 side images shown */}
      {totalCount > 3 && (
        <button
          onClick={() => setLightboxIdx(0)}
          className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition"
        >
          <Camera size={14} /> Zobrazit všechny fotografie ({totalCount})
        </button>
      )}

      {/* ── Lightbox ── above modal z-index */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 text-white flex-shrink-0">
            <span className="text-sm font-medium">
              {lightboxIdx + 1} / {totalCount}
            </span>
            <button
              onClick={() => setLightboxIdx(null)}
              className="rounded-full p-2 hover:bg-white/10 transition"
              aria-label="Zavřít"
            >
              <X size={24} />
            </button>
          </div>

          {/* Main image */}
          <div className="relative flex-1 flex items-center justify-center px-16 min-h-0">
            <Image
              src={sorted[lightboxIdx].url}
              alt="Fotografie"
              fill
              className="object-contain"
              sizes="100vw"
            />
            <button
              onClick={prev}
              className="absolute left-3 z-10 rounded-full bg-white/10 p-3 hover:bg-white/25 transition text-white"
              aria-label="Předchozí"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 z-10 rounded-full bg-white/10 p-3 hover:bg-white/25 transition text-white"
              aria-label="Další"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 p-4 overflow-x-auto justify-center flex-shrink-0">
            {sorted.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIdx(idx)}
                className={`relative flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition ${
                  idx === lightboxIdx
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
