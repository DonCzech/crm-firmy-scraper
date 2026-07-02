const STORAGE_KEY = 'mail_selected_categories';

export const MAIL_CATEGORY_IDS = [
  'primary',
  'social',
  'promotions',
  'updates',
  'forums',
  'shopping',
  'travel',
  'finance',
  'newsletters',
  'spam',
] as const;

export type MailCategoryId = (typeof MAIL_CATEGORY_IDS)[number];

const DEFAULT_SELECTED: MailCategoryId[] = [...MAIL_CATEGORY_IDS];

export function getSelectedMailCategories(): MailCategoryId[] {
  if (typeof window === 'undefined') return DEFAULT_SELECTED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SELECTED;
    const parsed = JSON.parse(raw) as string[];
    const normalized = (Array.isArray(parsed) ? parsed : [])
      .map((item) => String(item).toLowerCase())
      .filter((item): item is MailCategoryId => MAIL_CATEGORY_IDS.includes(item as MailCategoryId));
    return normalized.length > 0 ? normalized : DEFAULT_SELECTED;
  } catch {
    return DEFAULT_SELECTED;
  }
}

export function setSelectedMailCategories(categories: MailCategoryId[]): void {
  const normalized = categories.filter((item) => MAIL_CATEGORY_IDS.includes(item));
  const next = normalized.length > 0 ? normalized : DEFAULT_SELECTED;
  const current = getSelectedMailCategories();
  const unchanged =
    current.length === next.length && current.every((item, index) => item === next[index]);

  if (unchanged) return;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
    window.dispatchEvent(
      new CustomEvent('mailCategoriesChanged', {
        detail: { categories: next },
      }),
    );
  }
}
