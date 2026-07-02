'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { ADMIN_APPROVE, ADMIN_REJECT } from '@/graphql/mutations';
import { formatPrice, formatDate } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const PENDING_LISTINGS = gql`
  query PendingListings {
    pendingListings {
      id title price city offerType estateType createdAt
      owner { email profile { firstName lastName } }
      media { url isCover }
    }
  }
`;

export function AdminListingQueue() {
  const qc = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pending-listings'],
    queryFn: () => getClient().request(PENDING_LISTINGS),
  });

  const { mutateAsync: approve } = useMutation({
    mutationFn: (id: string) => getClient().request(ADMIN_APPROVE, { id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-listings'] }); toast.success('Inzerát schválen.'); },
  });

  const { mutateAsync: reject } = useMutation({
    mutationFn: ({ id, reason }: any) => getClient().request(ADMIN_REJECT, { id, reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-listings'] }); toast.success('Inzerát zamítnut.'); setRejectId(null); setReason(''); },
  });

  const listings = (data as any)?.pendingListings ?? [];

  if (isLoading) return <div className="text-gray-400">Načítám...</div>;
  if (!listings.length) return <div className="card py-12 text-center text-gray-400">Žádné inzeráty ke schválení.</div>;

  return (
    <div className="space-y-4">
      {listings.map((l: any) => (
        <div key={l.id} className="card p-5 flex gap-4">
          <div className="w-20 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            {l.media?.[0]?.url && <img src={l.media[0].url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm line-clamp-1">{l.title}</p>
            <p className="text-xs text-gray-500">{l.city} · {formatPrice(l.price)} · {formatDate(l.createdAt)}</p>
            <p className="text-xs text-gray-400">{l.owner?.email}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => approve(l.id)} className="btn text-green-600 hover:bg-green-50 p-2">
              <CheckCircle size={20} />
            </button>
            <button onClick={() => setRejectId(l.id)} className="btn text-red-500 hover:bg-red-50 p-2">
              <XCircle size={20} />
            </button>
          </div>
        </div>
      ))}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectId(null)} />
          <div className="relative card p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-3">Důvod zamítnutí</h3>
            <textarea className="input min-h-[80px] mb-4" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Popište důvod zamítnutí..." />
            <div className="flex gap-2">
              <button onClick={() => setRejectId(null)} className="btn-outline flex-1">Zrušit</button>
              <button onClick={() => reject({ id: rejectId, reason })} disabled={!reason.trim()} className="btn-primary flex-1">Zamítnout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
