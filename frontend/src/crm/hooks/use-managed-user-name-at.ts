import { useCallback } from 'react';
import { useManagedCoreUsers } from '@/crm/hooks/use-managed-core-users';
import { resolveManagedUserDisplayName } from '@/crm/services/managed-users';

export function useManagedUserNameAt(fallback = 'Uživatel') {
  const managedUsers = useManagedCoreUsers();

  return useCallback(
    (index: number): string => {
      if (managedUsers.length === 0) return fallback;
      const safeIndex = Number.isFinite(index) ? Math.abs(Math.trunc(index)) : 0;
      return resolveManagedUserDisplayName(managedUsers[safeIndex % managedUsers.length]);
    },
    [fallback, managedUsers],
  );
}
