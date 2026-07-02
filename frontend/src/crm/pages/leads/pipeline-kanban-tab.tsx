'use client';

import * as React from 'react';
import { Building2, Home, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { Button } from '@/components/ui/button';
import {
  Kanban,
  KanbanBoard,
  type KanbanMoveEvent,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { fetchDeals, updateDeal, deleteDeal, type BackendDeal } from '@/crm/services/backend';
import { CRM_DEALS_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import { DealPipelineColumn, PIPELINE_STAGES } from '../pipeline/deal-pipeline-column';
import { NewDealDialog } from '../pipeline/new-deal-dialog';

const STAGE_KEYS = Object.keys(PIPELINE_STAGES);

type SourceFilter = 'all' | 'reality' | 'firmy' | 'manual';

function getDealSource(deal: BackendDeal): 'reality' | 'firmy' | 'manual' {
  const desc = (deal.description ?? '').toLowerCase();
  if (desc.includes('[zdroj:reality]') || desc.includes('sreality')) return 'reality';
  if (desc.includes('[zdroj:firmy]') || desc.includes('firmy.cz')) return 'firmy';
  return 'manual';
}

export function PipelineKanbanTab() {
  const latestLoadRequestRef = React.useRef(0);
  const { role, userId, canDelete } = useCurrentUserRole();
  const [allDeals, setAllDeals] = React.useState<BackendDeal[]>([]);
  const [columns, setColumns] = React.useState<Record<string, BackendDeal[]>>(() =>
    Object.fromEntries(STAGE_KEYS.map((k) => [k, []])),
  );
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);
  const [sourceFilter, setSourceFilter] = React.useState<SourceFilter>('all');

  const loadDeals = React.useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    try {
      const res = await fetchDeals({ limit: 500 });
      if (requestId !== latestLoadRequestRef.current) return;
      setAllDeals(res?.data ?? []);
    } catch (err) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-pipeline-kanban-tab',
        message: err instanceof Error ? err.message : 'Failed to load pipeline kanban deals',
        meta: { operation: 'fetch_deals_pipeline_kanban_tab' },
      });
      toast.error(err instanceof Error ? err.message : 'Načtení pipeline selhalo.');
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadDeals();
  }, [loadDeals]);

  React.useEffect(() => {
    const onRefresh = () => { void loadDeals(); };
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    };
  }, [loadDeals]);

  React.useEffect(() => {
    const filtered =
      sourceFilter === 'all'
        ? allDeals
        : allDeals.filter((d) => getDealSource(d) === sourceFilter);

    const grouped = Object.fromEntries(STAGE_KEYS.map((k) => [k, [] as BackendDeal[]]));
    for (const deal of filtered) {
      const stage = deal.stage ?? 'new';
      if (grouped[stage]) {
        grouped[stage].push(deal);
      } else {
        grouped['new'].push(deal);
      }
    }
    setColumns(grouped);
  }, [allDeals, sourceFilter]);

  const handleDeleteAll = async () => {
    if (!canDelete) {
      const message = 'Smazání celé pipeline je dostupné pouze pro role admin/manager.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_pipeline_all',
        result: 'denied',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
      });
      return;
    }
    if (!window.confirm(`Opravdu smazat všech ${allDeals.length} záznamů z pipeline? Tuto akci nelze vrátit.`)) return;
    setDeleting(true);
    const toastId = toast.loading(`Mažu pipeline (0 / ${allDeals.length})...`);
    let done = 0;
    let failed = 0;
    for (const deal of allDeals) {
      try {
        await deleteDeal(deal.id);
      } catch (error) {
        failed += 1;
        logFrontendError({
          area: 'crm-pipeline-kanban-tab',
          message: error instanceof Error ? error.message : 'Failed to delete deal during bulk pipeline delete',
          meta: { dealId: deal.id, operation: 'bulk_delete_pipeline_deal' },
        });
      }
      done++;
      if (done % 20 === 0) toast.loading(`Mažu pipeline (${done} / ${allDeals.length})...`, { id: toastId });
    }
    if (failed > 0) {
      toast.warning(`Pipeline vymazána částečně: ${done - failed}/${done} smazáno, ${failed} selhalo.`, { id: toastId });
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_pipeline_all',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message: `Pipeline vymazána částečně: ${done - failed}/${done} smazáno, ${failed} selhalo.`,
        meta: { done, failed },
      });
    } else {
      toast.success(`Pipeline vymazána (${done} záznamů).`, { id: toastId });
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'delete_pipeline_all',
        result: 'success',
        actorRole: role,
        actorUserId: userId || undefined,
        meta: { done, failed: 0 },
      });
    }
    dispatchCrmEvent(CRM_DEALS_REFRESH_EVENT);
    setDeleting(false);
    void loadDeals();
  };

  const handleKanbanMove = ({ event, activeContainer, overContainer }: KanbanMoveEvent) => {
    if (activeContainer === overContainer) return;
    const dealId = String(event.active.id);
    const targetStage = overContainer as string;
    if (!STAGE_KEYS.includes(targetStage)) return;

    setAllDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d)),
    );

    void updateDeal(dealId, { stage: targetStage })
      .then(() => {
        dispatchCrmEvent(CRM_DEALS_REFRESH_EVENT);
        toast.success(`Přesunuto do: ${PIPELINE_STAGES[targetStage]?.label ?? targetStage}`);
        appendSensitiveActionAudit({
          area: 'leads',
          action: 'move_pipeline_card',
          result: 'success',
          actorRole: role,
        actorUserId: userId || undefined,
          meta: { dealId, targetStage },
        });
      })
      .catch(async (err) => {
        const message = err instanceof Error ? err.message : 'Uložení změny selhalo.';
        logFrontendError({
          area: 'crm-pipeline-kanban-tab',
          message,
          meta: { dealId, targetStage, operation: 'update_deal_stage_pipeline_kanban_tab' },
        });
        appendSensitiveActionAudit({
          area: 'leads',
          action: 'move_pipeline_card',
          result: 'error',
          actorRole: role,
        actorUserId: userId || undefined,
          message,
          meta: { dealId, targetStage },
        });
        toast.error(message);
        await loadDeals();
      });
  };

  const totalDeals = Object.values(columns).reduce((a, b) => a + b.length, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 px-5 py-2">
        <span className="text-sm text-muted-foreground">{totalDeals} leadů v pipeline</span>
        <div className="flex items-center gap-2">
          {allDeals.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive gap-1"
              onClick={() => void handleDeleteAll()}
              disabled={deleting || loading || !canDelete}
            >
              <Trash2 className="size-3.5" />
              {deleting ? 'Mažu...' : 'Smazat vše'}
            </Button>
          )}
          <ToggleGroup
            type="single"
            value={sourceFilter}
            onValueChange={(v) => v && setSourceFilter(v as SourceFilter)}
            variant="outline"
            size="sm"
            className="shadow-none!"
          >
            <ToggleGroupItem value="all" className="text-xs px-3">Vše</ToggleGroupItem>
            <ToggleGroupItem value="reality" className="text-xs px-3 gap-1">
              <Home className="size-3" /> Reality
            </ToggleGroupItem>
            <ToggleGroupItem value="firmy" className="text-xs px-3 gap-1">
              <Building2 className="size-3" /> Firmy
            </ToggleGroupItem>
            <ToggleGroupItem value="manual" className="text-xs px-3">Manuální</ToggleGroupItem>
          </ToggleGroup>

          <Button
            variant="outline"
            size="sm"
            mode="icon"
            onClick={() => void loadDeals()}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <NewDealDialog onCreated={loadDeals} />
        </div>
      </div>

      <div className="px-5 pb-4 overflow-x-auto">
        {loading ? (
          <div className="text-sm text-muted-foreground py-8">Načítám pipeline...</div>
        ) : (
          <Kanban
            value={columns}
            onValueChange={setColumns}
            onMove={handleKanbanMove}
            getItemValue={(item: BackendDeal) => item.id}
          >
            <KanbanBoard
              className="grid auto-rows-fr gap-3"
              style={{ gridTemplateColumns: `repeat(${STAGE_KEYS.length}, minmax(220px, 1fr))` }}
            >
              {STAGE_KEYS.map((stageKey) => (
                <DealPipelineColumn
                  key={stageKey}
                  value={stageKey}
                  deals={columns[stageKey] ?? []}
                />
              ))}
            </KanbanBoard>
            <KanbanOverlay>
              <div className="rounded-md bg-muted/60 size-full" />
            </KanbanOverlay>
          </Kanban>
        )}
      </div>
    </div>
  );
}
