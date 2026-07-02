'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { TOGGLE_FAVORITE } from '@/graphql/mutations';
import { Heart, Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function ListingFavoriteShare({ listingId }: { listingId: string }) {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const { mutate: toggleFav, isPending } = useMutation({
    mutationFn: () => getClient().request(TOGGLE_FAVORITE, { listingId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      setSaved((v) => !v);
      toast.success(saved ? 'Odebráno z oblíbených' : 'Uloženo do oblíbených');
    },
    onError: () => toast.error('Nepodařilo se uložit do oblíbených.'),
  });

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: document.title });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        toast.error('Nepodařilo se zkopírovat odkaz.');
      }
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => toggleFav()}
        disabled={isPending}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
          saved
            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'
        }`}
      >
        <Heart size={16} className={saved ? 'fill-red-500 text-red-500' : ''} />
        {saved ? 'Uloženo' : 'Uložit'}
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 transition"
      >
        {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
        {copied ? 'Zkopírováno!' : 'Sdílet'}
      </button>
    </div>
  );
}
