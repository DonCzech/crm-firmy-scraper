'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { formatDate } from '@/lib/utils';
import { Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { gql as g } from 'graphql-request';

const LIST_USERS = gql`
  query ListUsers {
    adminListUsers { id email role createdAt profile { firstName lastName } subscription { tier status } }
  }
`;

const BAN_USER = gql`mutation BanUser($userId: String!) { adminBanUser(userId: $userId) }`;

export function AdminUserTable() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getClient().request(LIST_USERS),
  });

  const { mutateAsync: banUser } = useMutation({
    mutationFn: (userId: string) => getClient().request(BAN_USER, { userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Uživatel byl deaktivován.'); },
  });

  const users = (data as any)?.adminListUsers ?? [];

  if (isLoading) return <div className="text-gray-400">Načítám...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
            <th className="pb-2 pr-4">E-mail</th>
            <th className="pb-2 pr-4">Jméno</th>
            <th className="pb-2 pr-4">Role</th>
            <th className="pb-2 pr-4">Členství</th>
            <th className="pb-2 pr-4">Registrace</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="py-2 pr-4 font-mono text-xs">{u.email}</td>
              <td className="py-2 pr-4">{u.profile?.firstName} {u.profile?.lastName}</td>
              <td className="py-2 pr-4">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {u.role}
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.subscription?.tier === 'PREMIUM' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                  {u.subscription?.tier ?? 'FREE'}
                </span>
              </td>
              <td className="py-2 pr-4 text-gray-500">{formatDate(u.createdAt)}</td>
              <td className="py-2">
                <button onClick={() => banUser(u.id)} className="btn-ghost p-1 text-red-400 hover:text-red-600">
                  <Ban size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
