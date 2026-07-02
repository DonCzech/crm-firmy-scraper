import { useEffect, useMemo, useState } from 'react';
import {
  CORE_USERS_CHANGED_EVENT,
  CORE_USERS_STORAGE_KEY,
  ManagedCoreUser,
  mapManagedUsersToAssigneeOptions,
  ManagedAssigneeOption,
  readManagedCoreUsers,
} from '@/crm/services/managed-users';

export function useManagedCoreUsers(): ManagedCoreUser[] {
  const [managedUsers, setManagedUsers] = useState<ManagedCoreUser[]>(() => readManagedCoreUsers());

  useEffect(() => {
    const refreshUsers = () => setManagedUsers(readManagedCoreUsers());
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== CORE_USERS_STORAGE_KEY) return;
      refreshUsers();
    };
    refreshUsers();
    window.addEventListener(CORE_USERS_CHANGED_EVENT, refreshUsers);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CORE_USERS_CHANGED_EVENT, refreshUsers);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return managedUsers;
}

export function useManagedAssigneeOptions(): ManagedAssigneeOption[] {
  const managedUsers = useManagedCoreUsers();
  return useMemo(() => mapManagedUsersToAssigneeOptions(managedUsers), [managedUsers]);
}
