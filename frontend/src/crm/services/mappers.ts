import type { Company } from '@/crm/types/company';
import type { Contact } from '@/crm/types/contact';
import type { Deal } from '@/crm/types/deal';
import type { Notes } from '@/crm/types/notes';
import type { Task } from '@/crm/types/task';
import {
  BackendCompany,
  BackendContact,
  BackendDeal,
  BackendNote,
  BackendTask,
  formatPersonName,
} from './backend';

function normalizeText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string' && item.trim().length > 0);
    return typeof first === 'string' ? first : fallback;
  }
  return fallback;
}

function hashToIndex(input: string, max: number): number {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return (Math.abs(hash) % max) + 1;
}

export function avatarFromId(id: string): string {
  return `/media/avatars/300-${hashToIndex(id, 24)}.png`;
}

export function logoFromId(id: string): string {
  return `/media/brand-logos/${hashToIndex(id, 12)}.svg`;
}

export function mapContactToUI(item: BackendContact): Contact {
  const name = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || 'Unknown';
  const city = item.city ?? '';
  const state = item.state ?? '';
  const country = item.country ?? '';

  return {
    id: item.id,
    avatar: avatarFromId(item.id),
    contactType: item.contactType ?? 'lead',
    name,
    email: item.email ?? '',
    phone: item.phone ?? '',
    position: item.title ?? '',
    company: item.company?.name ?? '',
    address: [city, state, country].filter(Boolean).join(', '),
    state,
    city,
    country,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    logo: item.companyId ? logoFromId(item.companyId) : undefined,
  };
}

export function mapCompanyToUI(item: BackendCompany): Company {
  const contactIds = (item.contacts ?? []).map((contact) => contact.id);
  const categoryId = item.industry?.toLowerCase().includes('real')
    ? '9'
    : item.industry?.toLowerCase().includes('fin')
      ? '3'
      : '1';

  return {
    id: item.id,
    logo: logoFromId(item.id),
    name: item.name,
    domain: item.website?.replace(/^https?:\/\//, '') ?? '',
    email: item.email ?? '',
    phone: item.phone ?? '',
    description: item.industry ?? '',
    categoryIds: [categoryId],
    contactIds,
    city: item.city ?? '',
    state: item.state ?? '',
    country: item.country ?? '',
    connectionStrengthId: '3',
    estimatedArrId: '3',
    employeeRangeId: '3',
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    lastContacted: new Date(item.updatedAt).toLocaleDateString('en-US'),
  };
}

export function mapDealToUI(item: BackendDeal): Deal {
  return {
    id: item.id,
    title: item.title,
    content: item.description ?? '',
    companyIds: item.company?.id ? [item.company.id] : [],
    contactIds: item.contact?.id ? [item.contact.id] : [],
    userName: formatPersonName(item.owner ?? item.contact),
    dueAt: new Date(item.expectedCloseDate ?? item.createdAt),
    status:
      item.stage === 'won'
        ? 'completed'
        : item.stage === 'lost'
          ? 'pending'
          : 'in_progress',
    priority:
      (item.probability ?? 0) >= 70
        ? 'high'
        : (item.probability ?? 0) >= 40
          ? 'medium'
          : 'low',
    amount: item.value ?? 0,
    currency: 'CZK',
    avatar: avatarFromId(item.owner?.id ?? item.contact?.id ?? item.id),
    comments: 0,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export function mapTaskToUI(item: BackendTask): Task {
  const assigneeId = item.assignee?.id ?? item.contact?.id;
  const normalizedTitle = normalizeText(item.title, 'Untitled task');
  const normalizedDescription = normalizeText(item.description, '');

  return {
    id: item.id,
    title: normalizedTitle,
    content: normalizedDescription,
    createdBy: formatPersonName(item.assignee),
    dueAt: new Date(item.dueDate ?? item.createdAt),
    status:
      item.status === 'done'
        ? 'completed'
        : item.status === 'in_progress'
          ? 'in_progress'
          : 'pending',
    priority:
      item.priority === 'high' || item.priority === 'medium' || item.priority === 'low'
        ? item.priority
        : 'medium',
    assignedContactIds: assigneeId ? [assigneeId] : [],
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export function mapNoteToUI(item: BackendNote): Notes {
  const normalizedContent = normalizeText(item.content, '');
  const firstLine = normalizedContent.split('\n')[0] ?? 'Note';
  const assigneeId = item.user?.id ?? item.contact?.id;

  return {
    id: item.id,
    title: firstLine.slice(0, 60) || 'Note',
    content: normalizedContent,
    createdBy: formatPersonName(item.user),
    dueAt: new Date(item.updatedAt),
    status: item.isPinned ? 'in_progress' : 'pending',
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    assignedContactIds: assigneeId ? [assigneeId] : [],
    companyIds: item.company?.id ? [item.company.id] : [],
    dealIds: item.deal?.id ? [item.deal.id] : [],
  };
}
