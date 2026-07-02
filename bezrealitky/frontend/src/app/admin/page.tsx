'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { AdminListingQueue } from '@/components/admin/AdminListingQueue';
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import { AdminStats } from '@/components/admin/AdminStats';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, List, CreditCard } from 'lucide-react';

type Tab = 'overview' | 'listings' | 'users' | 'billing';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Přehled', icon: <LayoutDashboard size={16} /> },
  { id: 'listings', label: 'Inzeráty ke schválení', icon: <List size={16} /> },
  { id: 'users', label: 'Uživatelé', icon: <Users size={16} /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin panel</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
              tab === t.id
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <AdminStats />}
      {tab === 'listings' && <AdminListingQueue />}
      {tab === 'users' && <AdminUserTable />}
      {tab === 'billing' && <div className="text-gray-400 text-center py-12">Billing přehled – připravujeme</div>}
    </div>
  );
}
