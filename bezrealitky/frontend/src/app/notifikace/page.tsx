'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { MY_NOTIFICATIONS } from '@/graphql/queries';
import { MARK_ALL_READ, MARK_NOTIFICATIONS_READ } from '@/graphql/mutations';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, string> = {
  WATCHDOG_MATCH: '🔔',
  NEW_MESSAGE: '✉️',
  LISTING_APPROVED: '✅',
  LISTING_REJECTED: '❌',
  SUBSCRIPTION_RENEWED: '💳',
  SUBSCRIPTION_EXPIRING: '⚠️',
  BOOST_EXPIRING: '📢',
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getClient().request(MY_NOTIFICATIONS, {}),
  });

  const { mutateAsync: markAllRead } = useMutation({
    mutationFn: () => getClient().request(MARK_ALL_READ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Vše označeno jako přečtené.'); },
  });

  const notifications = (data as any)?.myNotifications ?? [];
  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="text-primary-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Notifikace</h1>
          {unread > 0 && (
            <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllRead()} className="btn-ghost text-sm gap-1">
            <CheckCheck size={16} /> Vše přečteno
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card h-16 animate-pulse bg-gray-100" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p>Žádné notifikace</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id} className={cn('card p-4 flex gap-4', !n.read && 'border-primary-200 bg-primary-50')}>
              <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                <p className="text-sm text-gray-600">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
