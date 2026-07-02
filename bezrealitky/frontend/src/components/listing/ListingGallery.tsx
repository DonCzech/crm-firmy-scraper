'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Media { id: string; url: string; isCover: boolean }

export function ListingGallery({ media }: { media: Media[] }) {
  const [ref, api] = useEmblaCarousel({ loop: true });

  if (!media?.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-gray-100 text-5xl text-gray-300">🏠</div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl" ref={ref}>
      <div className="flex">
        {media.map((m) => (
          <div key={m.id} className="relative min-w-full h-72 md:h-96">
            <Image src={m.url} alt="Fotografie inzerátu" fill className="object-cover" sizes="800px" />
          </div>
        ))}
      </div>
      {media.length > 1 && (
        <>
          <button
            onClick={() => api?.scrollPrev()}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white transition"
          >
            <ChevronRight size={20} />
          </button>
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
            1 / {media.length}
          </span>
        </>
      )}
    </div>
  );
}
