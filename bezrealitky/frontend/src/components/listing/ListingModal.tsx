'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { GET_LISTING } from '@/graphql/queries';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { ListingModalContent } from './ListingModalContent';

interface Props {
  slug: string;
  onClose: () => void;
}

export function ListingModal({ slug, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['listing-modal', slug],
    queryFn: () => getClient().request(GET_LISTING, { slug }),
    staleTime: 2 * 60 * 1000,
  });

  const listing = (data as any)?.listing;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />

      {/* ── 1250 × 800 px dialog box ── */}
      <div className="relative z-10 flex w-[1250px] h-[800px] flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">

        {/* ── Header ── */}
        <div className="flex flex-shrink-0 items-center justify-between bg-white px-6 py-3 border-b border-gray-100">
          <a
            href={`/inzerat/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-primary-600 transition"
          >
            <ExternalLink size={13} />
            Otevřít celou stránku
          </a>
          <button
            onClick={onClose}
            aria-label="Zavřít"
            className="rounded-full w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 size={40} className="animate-spin text-primary-400" />
            </div>
          )}
          {listing && <ListingModalContent listing={listing} />}
          {!isLoading && !listing && (
            <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
              Inzerát se nepodařilo načíst.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
