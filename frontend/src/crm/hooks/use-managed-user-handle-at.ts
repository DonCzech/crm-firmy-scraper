import { useCallback } from 'react';
import { useManagedUserNameAt } from '@/crm/hooks/use-managed-user-name-at';

export function useManagedUserHandleAt(fallback = '@uzivatel') {
  const userNameAt = useManagedUserNameAt('Uživatel');

  return useCallback(
    (index: number): string => {
      const base = userNameAt(index)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9._-]/g, '')
        .replace(/[._-]{2,}/g, '.')
        .replace(/^[._-]+|[._-]+$/g, '')
        .slice(0, 18);
      return base ? `@${base}` : fallback;
    },
    [fallback, userNameAt],
  );
}
