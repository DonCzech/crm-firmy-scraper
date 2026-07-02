'use client';

import { useMutation } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { START_SUBSCRIPTION } from '@/graphql/mutations';
import { X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function PaywallModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync: startSub, isPending } = useMutation({
    mutationFn: (tier: string) => getClient().request(START_SUBSCRIPTION, { tier }),
    onSuccess: (res: any) => {
      window.location.href = res.startSubscription.checkoutUrl;
    },
    onError: () => toast.error('Chyba při zahájení platby.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative card max-w-md w-full p-8 text-center">
        <button onClick={onClose} className="absolute right-4 top-4 btn-ghost p-1"><X size={20} /></button>
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary-100 p-4">
            <Lock size={28} className="text-primary-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Aktivujte členství</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Pro kontaktování inzerentů a odesílání zpráv je potřeba aktivní členství Standard nebo Premium.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => startSub('STANDARD')}
            disabled={isPending}
            className="btn-outline py-3 font-medium"
          >
            Standard – neomezené reakce
          </button>
          <button
            onClick={() => startSub('PREMIUM')}
            disabled={isPending}
            className="btn-primary py-3 font-medium"
          >
            Premium – prioritní přístup + pokročilé filtry
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          <a href="/cenik" className="underline">Zobrazit celý ceník</a>
        </p>
      </div>
    </div>
  );
}
