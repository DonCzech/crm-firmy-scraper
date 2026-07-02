import { SubscriptionPlans } from '@/components/billing/SubscriptionPlans';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ceník' };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Ceník členství</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Zvolte plán, který odpovídá vašim potřebám. Placení probíhá bezpečně přes Stripe.
        </p>
      </div>
      <SubscriptionPlans />

      {/* Listing add-ons */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Doplňky k inzerátu</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: 'Topování', desc: 'Inzerát se zobrazí na první pozici ve výsledcích.', price: '299 Kč / 7 dní', type: 'TOP' },
            { name: 'Prodloužení', desc: 'Prodloužení platnosti inzerátu o 30 dní.', price: '199 Kč / 30 dní', type: 'EXTEND' },
            { name: 'Zvýraznění', desc: 'Inzerát bude vizuálně zvýrazněn v seznamu.', price: '149 Kč / 14 dní', type: 'HIGHLIGHT' },
          ].map((addon) => (
            <div key={addon.type} className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{addon.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{addon.desc}</p>
              <p className="text-lg font-bold text-primary-700">{addon.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
