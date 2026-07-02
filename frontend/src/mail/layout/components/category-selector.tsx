'use client';

import * as React from 'react';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import {
  getSelectedMailCategories,
  MAIL_CATEGORY_IDS,
  setSelectedMailCategories,
  type MailCategoryId,
} from '../../utils/category-selection';

type Checked = DropdownMenuCheckboxItemProps['checked'];

type Category = {
  id: string;
  label: string;
  defaultChecked?: boolean;
};

const MAIL_CATEGORIES: Category[] = [
  { id: 'primary', label: 'Primary', defaultChecked: true },
  { id: 'social', label: 'Social', defaultChecked: true },
  { id: 'promotions', label: 'Promotions', defaultChecked: true },
  { id: 'updates', label: 'Updates', defaultChecked: true },
  { id: 'forums', label: 'Forums', defaultChecked: true },
  { id: 'shopping', label: 'Shopping', defaultChecked: true },
  { id: 'travel', label: 'Travel', defaultChecked: true },
  { id: 'finance', label: 'Finance', defaultChecked: true },
  { id: 'newsletters', label: 'Newsletters', defaultChecked: true },
  { id: 'spam', label: 'Spam', defaultChecked: true },
];

function useCategoryState() {
  const [checkedMap, setCheckedMap] = React.useState<Record<string, Checked>>(
    () => {
      const selected = new Set(getSelectedMailCategories());
      return MAIL_CATEGORIES.reduce<Record<string, Checked>>((acc, c) => {
        acc[c.id] = selected.has(c.id as MailCategoryId);
        return acc;
      }, {});
    },
  );

  React.useEffect(() => {
    const selected = MAIL_CATEGORY_IDS.filter((id) => Boolean(checkedMap[id]));
    setSelectedMailCategories(selected);
  }, [checkedMap]);

  React.useEffect(() => {
    const onExternalChange = (event: Event) => {
      const detail = (event as CustomEvent<{ categories?: MailCategoryId[] }>).detail;
      const selected = new Set((detail?.categories ?? []).map((item) => String(item).toLowerCase()));
      setCheckedMap(() =>
        MAIL_CATEGORIES.reduce<Record<string, Checked>>((acc, c) => {
          acc[c.id] = selected.has(c.id);
          return acc;
        }, {}),
      );
    };
    window.addEventListener('mailCategoriesChanged', onExternalChange);
    return () => {
      window.removeEventListener('mailCategoriesChanged', onExternalChange);
    };
  }, []);

  const handleCheckedChange = (id: string) => (value: Checked) => {
    setCheckedMap((prev) => ({ ...prev, [id]: value }));
  };

  return { checkedMap, handleCheckedChange };
}

export function CategorySelector({ inline = false }: { inline?: boolean }) {
  const { checkedMap, handleCheckedChange } = useCategoryState();

  if (inline) {
    return (
      <div className="rounded-md border bg-background px-2 py-1.5">
        <div className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Filter className="size-3.5" />
          Categories
        </div>
        <div className="grid grid-cols-2 gap-1">
          {MAIL_CATEGORIES.map((cat) => {
            const checked = Boolean(checkedMap[cat.id]);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCheckedChange(cat.id)(!checked)}
                className={cn(
                  'flex items-center justify-between rounded px-2 py-1 text-xs text-left transition-colors',
                  checked ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
                )}
              >
                <span>{cat.label}</span>
                {checked && <Check className="size-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground">
          Categories
          <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MAIL_CATEGORIES.map((cat) => (
          <DropdownMenuCheckboxItem
            key={cat.id}
            checked={checkedMap[cat.id]}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={handleCheckedChange(cat.id)}
          >
            {cat.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
