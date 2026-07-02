'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { MY_WATCHDOGS } from '@/graphql/queries';
import { CREATE_WATCHDOG, DELETE_WATCHDOG } from '@/graphql/mutations';
import { WatchdogForm } from '@/components/watchdog/WatchdogForm';
import { WatchdogList } from '@/components/watchdog/WatchdogList';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

export default function WatchdogPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['watchdogs'],
    queryFn: () => getClient().request(MY_WATCHDOGS),
  });

  const { mutateAsync: createWatchdog, isPending } = useMutation({
    mutationFn: (input: any) => getClient().request(CREATE_WATCHDOG, { input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchdogs'] });
      toast.success('Hlídací pes byl přidán.');
    },
    onError: () => toast.error('Nepodařilo se přidat hlídacího psa.'),
  });

  const { mutateAsync: deleteWatchdog } = useMutation({
    mutationFn: (id: string) => getClient().request(DELETE_WATCHDOG, { id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchdogs'] });
      toast.success('Hlídací pes byl odstraněn.');
    },
  });

  const watchdogs = (data as any)?.myWatchdogs ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Bell className="text-primary-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hlídací pes</h1>
          <p className="text-sm text-gray-500">Nastavte kritéria a my vás upozorníme na nové inzeráty.</p>
        </div>
      </div>

      <div className="card mb-8 p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Přidat nový hlídací pes</h2>
        <WatchdogForm onSubmit={createWatchdog} isLoading={isPending} />
      </div>

      <div>
        <h2 className="mb-4 font-semibold text-gray-900">Moji hlídací psi ({watchdogs.length})</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="card h-16 animate-pulse bg-gray-100" />)}
          </div>
        ) : (
          <WatchdogList watchdogs={watchdogs} onDelete={deleteWatchdog} />
        )}
      </div>
    </div>
  );
}
