import { useEffect, useState } from 'react';
import { AlertTriangle, KanbanSquare, Settings2, Target } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ObservabilityBadges } from '@/crm/components/observability-badges';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useFrontendErrorCount24h } from '@/crm/hooks/use-frontend-error-count-24h';
import { useSensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Content } from '../../layout/components/content';
import {
  CRM_LEADS_DUPLICATES_COUNT_EVENT,
  CRM_LEADS_DUPLICATES_OPEN_EVENT,
  LEADS_DUPLICATES_COUNT_STORAGE_KEY,
  LEADS_DUPLICATES_OPEN_STORAGE_KEY,
  LeadListTab,
} from './lead-list-tab';
import { LeadPageHeader } from './lead-page-header';
import { PipelineKanbanTab } from './pipeline-kanban-tab';

export function LeadsPage() {
  const [duplicatesCount, setDuplicatesCount] = useState(0);
  const [duplicatesOpen, setDuplicatesOpen] = useState(false);
  const { role } = useCurrentUserRole();
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('leads');

  useEffect(() => {
    try {
      setDuplicatesCount(Number(localStorage.getItem(LEADS_DUPLICATES_COUNT_STORAGE_KEY) || '0'));
      setDuplicatesOpen(localStorage.getItem(LEADS_DUPLICATES_OPEN_STORAGE_KEY) === '1');
    } catch {
      setDuplicatesCount(0);
      setDuplicatesOpen(false);
    }

    const onCountChange = (event: Event) => {
      const nextCount = Number((event as CustomEvent<number>).detail || 0);
      setDuplicatesCount(nextCount);
    };
    const onOpenChange = (event: Event) => {
      const nextOpen = Boolean((event as CustomEvent<boolean>).detail);
      setDuplicatesOpen(nextOpen);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === LEADS_DUPLICATES_COUNT_STORAGE_KEY) {
        setDuplicatesCount(Number(event.newValue || '0'));
      }
      if (event.key === LEADS_DUPLICATES_OPEN_STORAGE_KEY) {
        setDuplicatesOpen(event.newValue === '1');
      }
    };

    window.addEventListener(CRM_LEADS_DUPLICATES_COUNT_EVENT, onCountChange);
    window.addEventListener(CRM_LEADS_DUPLICATES_OPEN_EVENT, onOpenChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CRM_LEADS_DUPLICATES_COUNT_EVENT, onCountChange);
      window.removeEventListener(CRM_LEADS_DUPLICATES_OPEN_EVENT, onOpenChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggleDuplicates = () => {
    const nextOpen = !duplicatesOpen;
    setDuplicatesOpen(nextOpen);
    try {
      localStorage.setItem(LEADS_DUPLICATES_OPEN_STORAGE_KEY, nextOpen ? '1' : '0');
    } catch {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent(CRM_LEADS_DUPLICATES_OPEN_EVENT, {
        detail: nextOpen,
      }),
    );
  };

  return (
    <>
      <LeadPageHeader />
      <Content className="py-0">
        <div className="flex grow">
          <Tabs defaultValue="leads" className="grow min-w-0 text-sm">
            <div className="flex min-w-0 items-center justify-between gap-3 px-5">
              <div className="min-w-0 overflow-x-auto">
                <TabsList
                  variant="line"
                  className="w-max shrink-0 gap-6 bg-transparent px-0 [&_button]:border-b [&_button_svg]:size-4 [&_button]:text-secondary-foreground"
                >
                  <TabsTrigger value="pipeline">
                    <KanbanSquare /> Pipeline
                  </TabsTrigger>
                  <TabsTrigger value="leads">
                    <Target /> Leady
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7">
                      <Settings2 className="size-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto space-y-2 p-2">
                    <button
                      type="button"
                      onClick={toggleDuplicates}
                      className={
                        duplicatesCount > 0
                          ? 'inline-flex w-full items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100'
                          : 'inline-flex w-full items-center justify-between px-1 py-1 text-xs text-foreground'
                      }
                    >
                      <span>{`Duplicity (${duplicatesCount})`}</span>
                      {duplicatesCount > 0 ? <AlertTriangle className="size-3.5" /> : null}
                    </button>
                    <ObservabilityBadges
                      frontendErrorCount24h={frontendErrorCount24h}
                      sensitiveActions24hSummary={sensitiveActions24hSummary}
                      compact
                      role={role}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="mt-4">
              <TabsContent value="pipeline">
                <PipelineKanbanTab />
              </TabsContent>
              <TabsContent value="leads">
                <LeadListTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Content>
      <Outlet />
    </>
  );
}
