'use client';

import { useRouter } from 'next/navigation';
import { X, ExternalLink } from 'lucide-react';

interface Props {
  slug: string;
  children: React.ReactNode;
}

export function ListingDrawer({ slug, children }: Props) {
  const router = useRouter();

  return (
    // Full-screen fixed overlay
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">

      {/* Semi-transparent backdrop — click to close */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => router.back()}
        aria-hidden
      />

      {/* Drawer panel */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-slide-in-right overflow-hidden">

        {/* ── Sticky top bar ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-sm px-4 py-3">
          <a
            href={`/inzerat/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition"
          >
            <ExternalLink size={14} />
            Otevřít celou stránku
          </a>

          <button
            onClick={() => router.back()}
            aria-label="Zavřít"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}
