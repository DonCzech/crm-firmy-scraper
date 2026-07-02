import { useMemo } from 'react';
import { useManagedAssigneeOptions } from '@/crm/hooks/use-managed-core-users';

type ManagedAssigneeIdentity = {
  name: string;
  email: string;
};

export function useManagedAssigneeMap() {
  const managedAssigneeOptions = useManagedAssigneeOptions();

  return useMemo(() => {
    const map = new Map<string, ManagedAssigneeIdentity>();
    for (const option of managedAssigneeOptions) {
      map.set(option.id, {
        name: option.name,
        email: option.email,
      });
    }
    return map;
  }, [managedAssigneeOptions]);
}
