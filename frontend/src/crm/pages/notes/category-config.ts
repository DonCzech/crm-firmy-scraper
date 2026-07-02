export type NoteCategoryVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive'
  | 'outline';

export interface NoteCategoryOption {
  value: string;
  label: string;
  state: string;
}

export const NOTE_CATEGORY_OPTIONS: NoteCategoryOption[] = [
  { value: 'client', label: 'Client', state: 'bg-blue-500' },
  { value: 'kickoff', label: 'Kickoff', state: 'bg-blue-500' },
  { value: 'prospect', label: 'Prospect', state: 'bg-yellow-500' },
  { value: 'sales', label: 'Sales', state: 'bg-green-500' },
  { value: 'maintenance', label: 'Maintenance', state: 'bg-gray-500' },
  { value: 'crm', label: 'CRM', state: 'bg-gray-500' },
  { value: 'proposal', label: 'Proposal', state: 'bg-yellow-500' },
  { value: 'urgent', label: 'Urgent', state: 'bg-red-500' },
  { value: 'team', label: 'Team', state: 'bg-blue-500' },
  { value: 'sync', label: 'Sync', state: 'bg-green-500' },
  { value: 'feedback', label: 'Feedback', state: 'bg-yellow-500' },
  { value: 'presentation', label: 'Presentation', state: 'bg-blue-500' },
  { value: 'daily', label: 'Daily', state: 'bg-blue-500' },
];

const NOTE_CATEGORY_VARIANTS: Record<string, NoteCategoryVariant> = {
  client: 'primary',
  daily: 'info',
  team: 'warning',
  presentation: 'destructive',
  code: 'secondary',
  review: 'warning',
  maintenance: 'destructive',
  backup: 'info',
  report: 'secondary',
  weekly: 'success',
  prospect: 'info',
  sales: 'primary',
  crm: 'warning',
  proposal: 'destructive',
  urgent: 'destructive',
};

export function getNoteCategoryVariant(categoryId: string): NoteCategoryVariant {
  return NOTE_CATEGORY_VARIANTS[categoryId] ?? 'success';
}
