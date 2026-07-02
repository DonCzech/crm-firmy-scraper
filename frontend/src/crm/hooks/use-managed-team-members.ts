import { useMemo } from 'react';
import { useManagedCoreUsers } from '@/crm/hooks/use-managed-core-users';
import { resolveManagedUserAssigneeId, resolveManagedUserDisplayName } from '@/crm/services/managed-users';

export type ManagedTeamMember = {
  assigneeId: string;
  name: string;
  email: string;
  roleLabel: string;
  initial: string;
};

function toRoleLabel(role: string | undefined): string {
  const normalized = String(role || 'agent').trim().toLowerCase();
  if (!normalized) return 'Agent';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function useManagedTeamMembers(): ManagedTeamMember[] {
  const managedUsers = useManagedCoreUsers();

  return useMemo(() => {
    const deduped = new Map<string, ManagedTeamMember>();
    for (const user of managedUsers) {
      const assigneeId = resolveManagedUserAssigneeId(user);
      if (!assigneeId || deduped.has(assigneeId)) continue;
      const name = resolveManagedUserDisplayName(user);
      deduped.set(assigneeId, {
        assigneeId,
        name,
        email: user.email,
        roleLabel: toRoleLabel(user.role),
        initial: name.charAt(0).toUpperCase(),
      });
    }
    return Array.from(deduped.values());
  }, [managedUsers]);
}
