'use client';

import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { MENU_SIDEBAR } from '@/store-inventory/config/app.config';
import { MenuConfig, MenuItem } from '@/store-inventory/config/types';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const APPS_STORAGE_KEY = 'core_apps_enabled_v1';
const SIDEBAR_ORDER_STORAGE_KEY = 'core_sidebar_order_v1';
const APP_VISIBILITY_RULES: Array<{ prefix: string; key: string }> = [
  { prefix: '/core/dashboard', key: '/core/dashboard' },
  { prefix: '/core/crm/dashboard', key: '/core/crm/dashboard' },
  { prefix: '/core/crm/contacts', key: '/core/crm/dashboard' },
  { prefix: '/core/crm/leads', key: '/core/crm/dashboard' },
  { prefix: '/core/crm/pipeline', key: '/core/crm/dashboard' },
  { prefix: '/core/crm/companies', key: '/core/crm/dashboard' },
  { prefix: '/core/crm/deals', key: '/core/crm/dashboard' },
  { prefix: '/core/crm/tasks', key: '/core/crm/dashboard' },
  { prefix: '/core/crm/notes', key: '/core/crm/dashboard' },
  { prefix: '/core/crm/pm', key: '/core/crm/pm' },
  { prefix: '/core/crm/pm/dashboard', key: '/core/crm/pm' },
  { prefix: '/core/crm/pm/project', key: '/core/crm/pm' },
  { prefix: '/core/crm/pm/planner', key: '/core/crm/pm' },
  { prefix: '/core/crm/pm/weekly', key: '/core/crm/pm' },
  { prefix: '/core/tools/scrappery', key: '/core/tools/scrappery' },
  { prefix: '/core/tools/kontrola-databaze', key: '/core/tools/free-domains' },
  { prefix: '/core/tools/monitoring-domen', key: '/core/tools/free-domains' },
  { prefix: '/core/tools/cron', key: '/core/tools/cron' },
  { prefix: '/core/crm/reality', key: '/core/tools/scrappery' },
  { prefix: '/core/crm/firmy', key: '/core/tools/scrappery' },
  { prefix: '/core/crm/naklady', key: '/core/crm/naklady' },
  { prefix: '/core/crm/planovac', key: '/core/crm/planovac' },
  { prefix: '/core/mail', key: '/core/mail/inbox' },
  { prefix: '/core/ai', key: '/core/ai/chat' },
  { prefix: '/core/calendar', key: '/core/calendar/page' },
  { prefix: '/core/todo', key: '/core/todo/today' },
  { prefix: '/core/marketing', key: '/core/marketing' },
  { prefix: '/core/all-stock', key: '/core/all-stock' },
  { prefix: '/core/current-stock', key: '/core/all-stock' },
  { prefix: '/core/inbound-stock', key: '/core/all-stock' },
  { prefix: '/core/outbound-stock', key: '/core/all-stock' },
  { prefix: '/core/stock-planner', key: '/core/all-stock' },
  { prefix: '/core/per-product-stock', key: '/core/all-stock' },
  { prefix: '/core/track-shipping', key: '/core/all-stock' },
  { prefix: '/core/create-shipping-label', key: '/core/all-stock' },
  { prefix: '/core/category-list', key: '/core/category-list' },
  { prefix: '/core/category-details', key: '/core/category-list' },
  { prefix: '/core/create-category', key: '/core/category-list' },
  { prefix: '/core/edit-category', key: '/core/category-list' },
  { prefix: '/core/order', key: '/core/order-list' },
  { prefix: '/core/customer', key: '/core/customer-list' },
  { prefix: '/core/product', key: '/core/product-list' },
  { prefix: '/core/create-product', key: '/core/product-list' },
  { prefix: '/core/edit-product', key: '/core/product-list' },
  { prefix: '/core/manage-variants', key: '/core/product-list' },
  { prefix: '/core/projects', key: '/core/projects' },
  { prefix: '/core/tools', key: '/core/tools/free-domains' },
  { prefix: '/core/contracts', key: '/core/tools/free-domains' },
  { prefix: '/core/helpdesk', key: '/core/tools/free-domains' },
  { prefix: '/core/automation', key: '/core/tools/free-domains' },
  { prefix: '/core/governance', key: '/core/tools/free-domains' },
  { prefix: '/core/user-management', key: '/core/tools/free-domains' },
  { prefix: '/core/problem-domains', key: '/core/tools/free-domains' },
];

function readAppsMap(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(APPS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getMenuItemKey(item: MenuItem): string {
  if (item.path && item.path.trim()) return item.path.trim();
  if (item.title && item.title.trim()) return `title:${item.title.trim()}`;
  if (item.heading && item.heading.trim()) return `heading:${item.heading.trim()}`;
  return 'unknown-item';
}

function readSidebarOrder(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SIDEBAR_ORDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  } catch {
    return [];
  }
}

function isPathVisible(path: string, appMap: Record<string, boolean>): boolean {
  const normalized = (path || '').trim();
  if (!normalized) return true;
  const matchedRule = APP_VISIBILITY_RULES
    .filter((rule) => normalized === rule.prefix || normalized.startsWith(rule.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!matchedRule) return true;
  const enabled = appMap[matchedRule.key];
  return enabled !== false;
}

function filterByApps(items: MenuConfig, appMap: Record<string, boolean>): MenuConfig {
  const result: MenuConfig = [];
  for (const item of items) {
    if (item.heading) {
      result.push(item);
      continue;
    }

    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    if (hasChildren) {
      const filteredChildren = filterByApps(item.children || [], appMap);
      if (filteredChildren.length > 0) {
        result.push({ ...item, children: filteredChildren });
      } else if (item.path && isPathVisible(item.path, appMap)) {
        result.push({ ...item, children: [] });
      }
      continue;
    }

    if (!item.path || isPathVisible(item.path, appMap)) {
      result.push(item);
    }
  }
  return result;
}

export function SidebarMenu() {
  const { pathname } = useLocation();
  const [appsMap, setAppsMap] = useState<Record<string, boolean>>(() => readAppsMap());
  const [menuOrder, setMenuOrder] = useState<string[]>(() => readSidebarOrder());
  const [draggedItemKey, setDraggedItemKey] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ key: string; position: 'before' | 'after' } | null>(null);

  useEffect(() => {
    const update = () => setAppsMap(readAppsMap());
    const updateSidebarOrder = () => setMenuOrder(readSidebarOrder());
    window.addEventListener('core-apps:changed', update);
    window.addEventListener('core-sidebar-order:reset', updateSidebarOrder);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('core-apps:changed', update);
      window.removeEventListener('core-sidebar-order:reset', updateSidebarOrder);
      window.removeEventListener('storage', update);
    };
  }, []);

  const visibleMenu = useMemo(() => filterByApps(MENU_SIDEBAR, appsMap), [appsMap]);
  const orderedVisibleMenu = useMemo(() => {
    const orderIndex = new Map(menuOrder.map((key, index) => [key, index]));
    return visibleMenu
      .map((item, index) => ({ item, index, key: getMenuItemKey(item) }))
      .sort((a, b) => {
        const ai = orderIndex.has(a.key) ? (orderIndex.get(a.key) as number) : Number.MAX_SAFE_INTEGER;
        const bi = orderIndex.has(b.key) ? (orderIndex.get(b.key) as number) : Number.MAX_SAFE_INTEGER;
        if (ai !== bi) return ai - bi;
        return a.index - b.index;
      })
      .map((entry) => entry.item);
  }, [visibleMenu, menuOrder]);

  useEffect(() => {
    const visibleKeys = orderedVisibleMenu
      .filter((item) => !item.heading)
      .map((item) => getMenuItemKey(item));
    setMenuOrder((prev) => {
      const compactPrev = prev.filter((key) => visibleKeys.includes(key));
      const missing = visibleKeys.filter((key) => !compactPrev.includes(key));
      const next = [...compactPrev, ...missing];
      const isSame =
        prev.length === next.length && prev.every((value, index) => value === next[index]);
      if (isSame) return prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_ORDER_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, [orderedVisibleMenu]);

  const moveSidebarItem = useCallback((fromKey: string, toKey: string, position: 'before' | 'after' = 'before') => {
    if (!fromKey || !toKey || fromKey === toKey) return;
    setMenuOrder((prev) => {
      const base = prev.length > 0 ? [...prev] : orderedVisibleMenu.filter((item) => !item.heading).map((item) => getMenuItemKey(item));
      const fromIndex = base.indexOf(fromKey);
      const toIndex = base.indexOf(toKey);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const next = [...base];
      next.splice(fromIndex, 1);
      let insertIndex = toIndex + (position === 'after' ? 1 : 0);
      if (fromIndex < insertIndex) insertIndex -= 1;
      next.splice(insertIndex, 0, fromKey);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_ORDER_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, [orderedVisibleMenu]);

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path: string): boolean => {
      // Exact match
      if (path === pathname) {
        return true;
      }
      
      // Don't match root path
      if (path === '/core') {
        return false;
      }
      
      // For paths longer than 1 character, check if pathname starts with path
      // but ensure it's followed by a slash or end of string to avoid partial matches
      if (path.length > 1) {
        const pathWithSlash = path + '/';
        return pathname.startsWith(pathWithSlash) || pathname === path;
      }
      
      return false;
    },
    [pathname],
  );

  // Global classNames for consistent styling
  const classNames: AccordionMenuClassNames = {
    root: 'lg:ps-1 space-y-3',
    group: 'gap-px',
    label:
      'uppercase text-xs font-medium text-muted-foreground/70 pt-2.25 pb-px',
    separator: '',
    item: 'h-8 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium',
    sub: '',
    subTrigger:
      'h-8 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium',
    subContent: 'py-0',
    indicator: '',
  };

  const buildMenu = (items: MenuConfig): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      if (item.heading) {
        return buildMenuHeading(item, index);
      } else {
        const itemKey = getMenuItemKey(item);
        const content = item.disabled
          ? buildMenuItemRootDisabled(item, index)
          : buildMenuItemRoot(item, index);
        return (
          <div
            key={`dnd-${itemKey}-${index}`}
            draggable
            onDragStart={(event) => {
              setDraggedItemKey(itemKey);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', itemKey);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              const fromKey = draggedItemKey || event.dataTransfer.getData('text/plain');
              if (!fromKey || fromKey === itemKey) {
                setDropIndicator(null);
                return;
              }
              const rect = event.currentTarget.getBoundingClientRect();
              const position: 'before' | 'after' =
                event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
              setDropIndicator((prev) => {
                if (prev?.key === itemKey && prev.position === position) return prev;
                return { key: itemKey, position };
              });
            }}
            onDrop={(event) => {
              event.preventDefault();
              const fromKey = draggedItemKey || event.dataTransfer.getData('text/plain');
              const position =
                dropIndicator?.key === itemKey ? dropIndicator.position : 'before';
              moveSidebarItem(fromKey, itemKey, position);
              setDraggedItemKey(null);
              setDropIndicator(null);
            }}
            onDragEnd={() => {
              setDraggedItemKey(null);
              setDropIndicator(null);
            }}
            className={cn('relative cursor-grab active:cursor-grabbing', draggedItemKey === itemKey && 'opacity-60')}
            title="Přetáhněte pro změnu pořadí"
          >
            {dropIndicator?.key === itemKey && dropIndicator.position === 'before' && (
              <div className="absolute -top-1 left-0 right-0 h-0.5 rounded bg-primary/80" />
            )}
            {content}
            {dropIndicator?.key === itemKey && dropIndicator.position === 'after' && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded bg-primary/80" />
            )}
          </div>
        );
      }
    });
  };

  const buildMenuItemRoot = (item: MenuItem, index: number): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className="text-sm font-medium">
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title">{item.title}</span>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `root-${index}`}
            className="ps-6"
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(item.children, 1)}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className="text-sm font-medium"
        >
          <Link
            to={item.path || '#'}
            className="flex items-center grow gap-2"
          >
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title">{item.title}</span>
          </Link>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemRootDisabled = (
    item: MenuItem,
    index: number,
  ): JSX.Element => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-${index}`}
        className="text-sm font-medium pointer-events-none"
      >
        {item.icon && <item.icon data-slot="accordion-menu-icon" />}
        <span data-slot="accordion-menu-title">{item.title}</span>
        {item.disabled && (
          <Badge variant="secondary" size="sm" className="ms-auto">
            Coding now
          </Badge>
        )}
      </AccordionMenuItem>
    );
  };

  const buildMenuItemChildren = (
    items: MenuConfig,
    level: number = 0,
  ): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      if (item.disabled) {
        return buildMenuItemChildDisabled(item, index, level);
      } else {
        return buildMenuItemChild(item, index, level);
      }
    });
  };

  const buildMenuItemChild = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub
          key={index}
          value={item.path || `child-${level}-${index}`}
        >
          <AccordionMenuSubTrigger className="text-[13px]">
            {item.collapse ? (
              <span className="text-muted-foreground">
                <span className="hidden [[data-state=open]>span>&]:inline">
                  {item.collapseTitle}
                </span>
                <span className="inline [[data-state=open]>span>&]:hidden">
                  {item.expandTitle}
                </span>
              </span>
            ) : (
              item.title
            )}
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `child-${level}-${index}`}
            className={cn(
              'ps-4',
              !item.collapse && 'relative',
              !item.collapse && (level > 0 ? '' : ''),
            )}
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(
                item.children,
                item.collapse ? level : level + 1,
              )}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className="text-[13px]"
        >
          <Link to={item.path || '#'}>{item.title}</Link>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemChildDisabled = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-child-${level}-${index}`}
        className="text-[13px] pointer-events-none"
      >
        <span data-slot="accordion-menu-title">{item.title}</span>
        {item.disabled && (
          <Badge variant="secondary" size="sm" className="ms-auto">
            Coding now
          </Badge>
        )}
      </AccordionMenuItem>
    );
  };

  const buildMenuHeading = (item: MenuItem, index: number): JSX.Element => {
    return <AccordionMenuLabel key={index}>{item.heading}</AccordionMenuLabel>;
  };

  return (
    <ScrollArea className="flex grow shrink-0 py-5 px-5 lg:h-[calc(100vh-5.5rem)]">
      <AccordionMenu
        selectedValue={pathname}
        matchPath={matchPath}
        type="single"
        collapsible
        classNames={classNames}
      >
        {buildMenu(orderedVisibleMenu)}
      </AccordionMenu>
    </ScrollArea>
  );
}
