import { SubscriptionPlans } from '@/components/billing/SubscriptionPlans';
import { Check } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Premium členství' };

const PREMIUM_PERKS = [
  'Neomezené kontaktování inzerentů',
  'Okamžité e-mailové alerty hlídacího psa',
  'Pokročilé filtry vyhledávání',
  'Prioritní zobrazení vašich inzerátů',
  'Přístup ke statistikám vašich inzerátů',
  'Přednostní zákaznická podpora',
];

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <span className="inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700 mb-4">
          Premium profil
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Odemkněte plný potenciál
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          S Premium členstvím máte k dispozici vše bez omezení.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 items-start">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Co získáte s Premium</h2>
          <ul className="space-y-3">
            {PREMIUM_PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <Check size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SubscriptionPlans highlightPremium />
        </div>
      </div>
    </div>
  );
}
