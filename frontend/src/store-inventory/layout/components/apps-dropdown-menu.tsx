import { ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutPanelLeft, ToggleRight } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

interface DropdownAppsItem {
  logo: string;
  title: string;
  description: string;
  path: string;
  enabledByDefault?: boolean;
}

export function AppsDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const storageKey = 'core_apps_enabled_v1';
  const sidebarOrderStorageKey = 'core_sidebar_order_v1';
  const items: DropdownAppsItem[] = [
    {
      logo: 'google-webdev.svg',
      title: 'Dashboard',
      description: 'Hlavní přehled',
      path: '/core/dashboard',
      enabledByDefault: true,
    },
    {
      logo: 'jira.svg',
      title: 'CRM',
      description: 'Leady, firmy, úkoly',
      path: '/core/crm/dashboard',
      enabledByDefault: true,
    },
    {
      logo: 'google-webdev.svg',
      title: 'Scrappery',
      description: 'Inzeráty a firmy.cz',
      path: '/core/tools/scrappery',
      enabledByDefault: true,
    },
    {
      logo: 'gitlab.svg',
      title: 'Finance',
      description: 'Náklady a příjmy',
      path: '/core/crm/naklady',
      enabledByDefault: true,
    },
    {
      logo: 'evernote.svg',
      title: 'Plánovač',
      description: 'Denní plán',
      path: '/core/crm/planovac',
      enabledByDefault: true,
    },
    {
      logo: 'evernote.svg',
      title: 'Objednávky',
      description: 'Správa objednávek',
      path: '/core/order-list',
      enabledByDefault: true,
    },
    {
      logo: 'gitlab.svg',
      title: 'Zákazníci',
      description: 'Seznam zákazníků',
      path: '/core/customer-list',
      enabledByDefault: true,
    },
    {
      logo: 'jira.svg',
      title: 'Produkty',
      description: 'Katalog produktů',
      path: '/core/product-list',
      enabledByDefault: true,
    },
    {
      logo: 'google-webdev.svg',
      title: 'Sklad',
      description: 'Správa skladu',
      path: '/core/all-stock',
      enabledByDefault: true,
    },
    {
      logo: 'jira.svg',
      title: 'Kategorie',
      description: 'Správa kategorií',
      path: '/core/category-list',
      enabledByDefault: true,
    },
    {
      logo: 'gitlab.svg',
      title: 'Úkoly',
      description: 'Správa úkolů',
      path: '/core/todo/today',
      enabledByDefault: true,
    },
    {
      logo: 'google-webdev.svg',
      title: 'Marketing',
      description: 'Google Ads velín',
      path: '/core/marketing',
      enabledByDefault: true,
    },
    {
      logo: 'google-webdev.svg',
      title: 'Konkurence',
      description: 'Monitoring reklam konkurence',
      path: '/core/marketing?tab=competitor',
      enabledByDefault: true,
    },
    {
      logo: 'inferno.svg',
      title: 'Nástroje',
      description: 'Volné domény',
      path: '/core/tools/free-domains',
      enabledByDefault: true,
    },
    {
      logo: 'inferno.svg',
      title: 'Cron monitoring',
      description: 'Audit běhů cronů',
      path: '/core/tools/cron',
      enabledByDefault: true,
    },
    {
      logo: 'google-webdev.svg',
      title: 'Mail',
      description: 'E-mail klient',
      path: '/core/mail/inbox',
      enabledByDefault: false,
    },
    {
      logo: 'evernote.svg',
      title: 'AI Chat',
      description: 'Asistent',
      path: '/core/ai/chat',
      enabledByDefault: false,
    },
    {
      logo: 'gitlab.svg',
      title: 'Kalendář',
      description: 'Plánování',
      path: '/core/calendar/page',
      enabledByDefault: false,
    },
    {
      logo: 'jira.svg',
      title: 'Projekty',
      description: 'Analytics projekty',
      path: '/core/projects',
      enabledByDefault: false,
    },
  ];

  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') {
      return Object.fromEntries(items.map((item) => [item.path, Boolean(item.enabledByDefault)]));
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      return Object.fromEntries(
        items.map((item) => [item.path, typeof parsed[item.path] === 'boolean' ? parsed[item.path] : Boolean(item.enabledByDefault)]),
      );
    } catch {
      return Object.fromEntries(items.map((item) => [item.path, Boolean(item.enabledByDefault)]));
    }
  });

  const orderedItems = useMemo(() => items, [items]);

  const enabledCount = useMemo(
    () => Object.values(enabledMap).filter(Boolean).length,
    [enabledMap],
  );

  const toggleApp = (path: string, value: boolean) => {
    setEnabledMap((prev) => {
      const next = { ...prev, [path]: value };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        window.dispatchEvent(
          new CustomEvent('core-apps:changed', { detail: next }),
        );
      }
      return next;
    });
  };

  const resetSidebarOrder = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(sidebarOrderStorageKey);
    window.dispatchEvent(new CustomEvent('core-sidebar-order:reset'));
  };

  const enableAllApps = () => {
    setEnabledMap(() => {
      const next = Object.fromEntries(items.map((item) => [item.path, true]));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('core-apps:changed', { detail: next }));
      }
      return next;
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-[325px] p-0 overflow-hidden z-[70]" side="bottom" align="end">
        <div className="flex items-center justify-between gap-2.5 text-xs text-secondary-foreground font-medium px-5 py-3 border-b border-b-border">
          <span>Aplikace</span>
          <div className="flex items-center gap-1">
            <span>Aplikace {enabledCount}/{items.length}</span>
            <button
              type="button"
              onClick={resetSidebarOrder}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-secondary-foreground hover:text-primary hover:bg-muted transition-colors"
              title="Reset levého panelu (pořadí sidebaru)"
              aria-label="Reset levého panelu (pořadí sidebaru)"
            >
              <LayoutPanelLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={enableAllApps}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-secondary-foreground hover:text-primary hover:bg-muted transition-colors"
              title="Zapnout všechny aplikace v pravém menu"
              aria-label="Zapnout všechny aplikace v pravém menu"
            >
              <ToggleRight className="size-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
          {orderedItems.map((item) => (
            <div
              key={item.path}
              className={`flex items-center justify-between flex-wrap gap-2 px-5 py-3.5 transition-opacity ${
                enabledMap[item.path] === false ? 'opacity-45' : 'opacity-100'
              }`}
            >
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center justify-center shrink-0 rounded-full bg-accent/60 border border-border size-10">
                  <img
                    src={toAbsoluteUrl(`/media/brand-logos/${item.logo}`)}
                    className="size-6"
                    alt={item.title}
                  />
                </div>

                <div className="flex flex-col">
                  <Link
                    to={item.path}
                    className="text-sm font-semibold text-mono hover:text-primary-active"
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs font-medium text-secondary-foreground">
                    {item.description}
                  </span>
                </div>
              </div>
              <Switch
                checked={Boolean(enabledMap[item.path])}
                onCheckedChange={(checked) => toggleApp(item.path, checked)}
                size="sm"
              />
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
