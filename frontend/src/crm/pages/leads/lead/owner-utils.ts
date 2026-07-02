import type { ManagedAssigneeOption } from '@/crm/services/managed-users';
import { isOpaqueIdentifier, sanitizeHumanLabel } from '@/crm/utils/identity-label';

function sanitizeOwnerLabel(value: string): string {
  return sanitizeHumanLabel(value, 'Neznámý uživatel');
}

export function getLeadOwnerOptions(users: ManagedAssigneeOption[]): ManagedAssigneeOption[] {
  const deduped = new Map<string, ManagedAssigneeOption>();
  for (const user of users) {
    const id = (user.id || '').trim();
    const name = sanitizeOwnerLabel((user.name || '').trim());
    if (!id || !name || name === 'Neznámý uživatel') continue;
    if (!deduped.has(id)) {
      deduped.set(id, { ...user, id, name });
    }
  }
  return Array.from(deduped.values());
}

export function normalizeLeadOwnerValue(
  ownerValue: string | undefined | null,
  users: ManagedAssigneeOption[],
): string {
  const value = (ownerValue ?? '').trim();
  if (!value) return '';
  const normalizedValue = value.toLowerCase();
  if (
    normalizedValue === '__none__' ||
    normalizedValue === 'none' ||
    normalizedValue === 'null' ||
    normalizedValue === 'undefined'
  ) {
    return '';
  }

  const byId = users.find((user) => user.id === value);
  if (byId) return byId.id;

  const byName = users.find((user) => user.name.trim().toLowerCase() === normalizedValue);
  if (byName) return byName.id;

  if (isOpaqueIdentifier(value)) return '';
  return value;
}

export function normalizeLeadOwnerForSave(
  ownerValue: string | undefined | null,
  users: ManagedAssigneeOption[],
): string {
  const normalized = normalizeLeadOwnerValue(ownerValue, users);
  if (!normalized) return '';
  const byId = users.find((user) => user.id === normalized);
  return byId?.id || '';
}

export function resolveLeadOwnerLabel(
  ownerValue: string | undefined | null,
  users: ManagedAssigneeOption[],
): string {
  const normalized = normalizeLeadOwnerValue(ownerValue, users);
  if (!normalized) return '';
  const byId = users.find((user) => user.id === normalized);
  if (byId) return sanitizeOwnerLabel(byId.name);
  const byName = users.find((user) => user.name.trim().toLowerCase() === normalized.toLowerCase());
  if (byName) return sanitizeOwnerLabel(byName.name);
  return '';
}
