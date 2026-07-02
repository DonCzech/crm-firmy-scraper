'use client';

import { useMutation } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { START_SUBSCRIPTION } from '@/graphql/mutations';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const PLANS = [
  {
    tier: 'FREE',
    name: 'Základní',
    price: 'Zdarma',
    desc: 'Pro příležitostné prohlížení.',
    features: ['Prohlížení inzerátů', 'Hlídací pes (1)', 'Omezené kontaktování (3×/měs.)'],
    cta: null,
  },
  {
    tier: 'STANDARD',
    name: 'Standard',
    price: '299 Kč/měs.',
    desc: 'Pro aktivní hledání bydlení.',
    features: ['Neomezené kontaktování', 'Hlídací psi (neomezeno)', 'E-mail alerty', 'Historie konverzací'],
    cta: 'Aktivovat Standard',
    highlight: false,
  },
  {
    tier: 'PREMIUM',
    name: 'Premium',
    price: '599 Kč/měs.',
    desc: 'Vše bez kompromisů.',
    features: [
      'Vše ze Standard',
      'Okamžité alerty (push + e-mail)',
      'Pokročilé filtry vyhledávání',
      'Prioritní zobrazení inzerátů',
      'Přístup ke statistikám',
      'Přednostní podpora',
    ],
    cta: 'Aktivovat Premium',
    highlight: true,
  },
];

export function SubscriptionPlans({ highlightPremium = false }: { highlightPremium?: boolean }) {
  const { mutateAsync: startSub, isPending } = useMutation({
    mutationFn: (tier: string) => getClient().request(START_SUBSCRIPTION, { tier }),
    onSuccess: (res: any) => {
      window.location.href = res.startSubscription.checkoutUrl;
    },
    onError: () => toast.error('Chyba při zahájení platby.'),
  });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.tier}
          className={cn(
            'card p-6 flex flex-col',
            (plan.highlight || (highlightPremium && plan.tier === 'PREMIUM'))
              ? 'border-primary-500 ring-2 ring-primary-500'
              : '',
          )}
        >
          {plan.highlight && (
            <span className="self-start mb-3 rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white">
              Nejoblíbenější
            </span>
          )}
          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
          <p className="text-2xl font-black text-primary-700 mt-1 mb-1">{plan.price}</p>
          <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
          <ul className="space-y-2 mb-6 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <Check size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {plan.cta ? (
            <button
              onClick={() => startSub(plan.tier)}
              disabled={isPending}
              className={cn('btn w-full py-2.5', plan.highlight ? 'btn-primary' : 'btn-outline')}
            >
              {plan.cta}
            </button>
          ) : (
            <div className="text-center text-sm text-gray-400 py-2.5">Aktuální plán</div>
          )}
        </div>
      ))}
    </div>
  );
}
