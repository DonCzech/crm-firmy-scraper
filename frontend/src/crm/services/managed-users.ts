import { isOpaqueIdentifier } from '@/crm/utils/identity-label';

export type ManagedUserRole = 'admin' | 'manager' | 'agent' | string;

export interface ManagedCoreUser {
  id: string;
  name: string;
  email: string;
  role: ManagedUserRole;
  backendUserId?: string;
}

export interface ManagedAssigneeOption {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export const CORE_USERS_STORAGE_KEY = 'core_user_roles_v2';
export const CORE_USERS_CHANGED_EVENT = 'core-users:changed';

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function looksLikeDemoOrSystemUser(name: string, email: string, role: string): boolean {
  const normalizedName = name.toLowerCase();
  const normalizedEmail = email.toLowerCase();
  const normalizedRole = role.toLowerCase();
  const localPart = normalizedEmail.split('@')[0] || '';
  const domainPart = normalizedEmail.split('@')[1] || '';

  if (
    normalizedRole.includes('demo') ||
    normalizedRole.includes('test') ||
    normalizedRole.includes('seed') ||
    normalizedRole.includes('bot') ||
    normalizedRole.includes('system')
  ) {
    return true;
  }

  if (
    normalizedName.includes('demo') ||
    normalizedName.includes('test ') ||
    normalizedName.startsWith('test') ||
    normalizedName.includes('sample') ||
    normalizedName.includes('seed')
  ) {
    return true;
  }

  if (
    localPart.includes('demo') ||
    localPart.includes('test') ||
    localPart.includes('sample') ||
    localPart.includes('seed') ||
    domainPart === 'example.com' ||
    domainPart.endsWith('.example')
  ) {
    return true;
  }

  return false;
}

export function readManagedCoreUsers(): ManagedCoreUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CORE_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<ManagedCoreUser>>;
    if (!Array.isArray(parsed)) return [];
    const deduped = new Map<string, ManagedCoreUser>();
    for (const item of parsed) {
      const id = normalizeText(item?.id);
      const email = normalizeText(item?.email);
      if (!id || !email || !email.includes('@')) continue;
      const role = normalizeText(item?.role) || 'agent';
      const name = normalizeText(item?.name) || email;
      if (looksLikeDemoOrSystemUser(name, email, role)) continue;
      const backendUserId = normalizeText(item?.backendUserId) || undefined;
      const assigneeId = backendUserId || id;
      if (!deduped.has(assigneeId)) {
        deduped.set(assigneeId, { id, name, email, role, backendUserId });
      }
    }
    return Array.from(deduped.values());
  } catch {
    return [];
  }
}

export function resolveManagedUserAssigneeId(user: ManagedCoreUser): string {
  return user.backendUserId || user.id;
}

export function resolveManagedUserDisplayName(user: Pick<ManagedCoreUser, 'id' | 'name' | 'email' | 'backendUserId'>): string {
  const rawName = String(user.name || '').trim();
  if (rawName && !isOpaqueIdentifier(rawName)) return rawName;
  const rawEmail = String(user.email || '').trim();
  if (rawEmail.includes('@')) return rawEmail.split('@')[0];
  return 'Uživatel';
}

export function mapManagedUsersToAssigneeOptions(users: ManagedCoreUser[]): ManagedAssigneeOption[] {
  const deduped = new Map<string, ManagedAssigneeOption>();
  for (const user of users) {
    const assigneeId = resolveManagedUserAssigneeId(user);
    if (!assigneeId) continue;
    if (!deduped.has(assigneeId)) {
      deduped.set(assigneeId, {
        id: assigneeId,
        name: resolveManagedUserDisplayName(user),
        email: user.email,
        avatar: '',
      });
    }
  }
  return Array.from(deduped.values());
}
