import type { BadgeProps } from '@/components/ui/badge';

export const NOTE_PRIORITY_VALUES = ['high', 'medium', 'low'] as const;
export const NOTE_STATUS_VALUES = ['pending', 'in_progress', 'completed'] as const;

export type NotePriorityValue = (typeof NOTE_PRIORITY_VALUES)[number];
export type NoteStatusValue = (typeof NOTE_STATUS_VALUES)[number];

type NoteMetaOption<T extends string> = {
  value: T;
  label: string;
  state: string;
};

export const NOTE_PRIORITY_OPTIONS: NoteMetaOption<NotePriorityValue>[] = [
  { value: 'high', label: 'High', state: 'bg-red-500' },
  { value: 'medium', label: 'Medium', state: 'bg-yellow-500' },
  { value: 'low', label: 'Low', state: 'bg-green-500' },
];

export const NOTE_STATUS_OPTIONS: NoteMetaOption<NoteStatusValue>[] = [
  { value: 'pending', label: 'Pending', state: 'bg-yellow-500' },
  { value: 'in_progress', label: 'In Progress', state: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', state: 'bg-green-500' },
];

const NOTE_PRIORITY_BADGE_VARIANTS: Record<NotePriorityValue, BadgeProps['variant']> = {
  high: 'destructive',
  medium: 'warning',
  low: 'secondary',
};

const NOTE_STATUS_BADGE_VARIANTS: Record<NoteStatusValue, BadgeProps['variant']> = {
  pending: 'secondary',
  in_progress: 'info',
  completed: 'success',
};

export function getNotePriorityBadgeVariant(priority: NotePriorityValue): BadgeProps['variant'] {
  return NOTE_PRIORITY_BADGE_VARIANTS[priority];
}

export function getNoteStatusBadgeVariant(status: NoteStatusValue): BadgeProps['variant'] {
  return NOTE_STATUS_BADGE_VARIANTS[status];
}
