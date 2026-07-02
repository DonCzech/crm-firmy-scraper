'use client';

import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { Users, List, CheckCircle, CreditCard } from 'lucide-react';

const ADMIN_STATS = gql`query AdminStats { adminStats { users listings activeListings paidSubscriptions } }`;

export function AdminStats() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getClient().request(ADMIN_STATS),
  });

  const stats = (data as any)?.adminStats;

  const cards = [
    { label: 'Uživatelé', value: stats?.users, icon: <Users size={20} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Celkem inzerátů', value: stats?.listings, icon: <List size={20} className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Aktivní inzeráty', value: stats?.activeListings, icon: <CheckCircle size={20} className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Platící uživatelé', value: stats?.paidSubscriptions, icon: <CreditCard size={20} className="text-primary-500" />, bg: 'bg-primary-50' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5">
          <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
            {c.icon}
          </div>
          <p className="text-2xl font-bold text-gray-900">{c.value ?? '—'}</p>
          <p className="text-sm text-gray-500">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
