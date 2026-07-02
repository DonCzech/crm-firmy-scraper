'use client';

import * as React from 'react';
import { AlertTriangle, Building2, Download, Home, KanbanSquare, RefreshCw, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Kanban,
  KanbanBoard,
  type KanbanMoveEvent,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  fetchDeals,
  fetchDealsForecast,
  fetchDealNextActions,
  saveDealsForecastGoals,
  fetchDealsMissingFollowUp,
  updateDeal,
  type BackendDeal,
  type BackendDealNextAction,
  type BackendDealsForecast,
} from '@/crm/services/backend';
import { CRM_DEALS_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { Content } from '../../layout/components/content';
import { DealPipelineColumn, PIPELINE_STAGES } from './deal-pipeline-column';
import { NewDealDialog } from './new-deal-dialog';

const STAGE_KEYS = Object.keys(PIPELINE_STAGES);

type SourceFilter =
  | 'all'
  | 'reality'
  | 'firmy'
  | 'manual'
  | 'missing_follow_up'
  | 'next_action_high'
  | 'next_action_medium'
  | 'next_action_low';

function getDealSource(deal: BackendDeal): 'reality' | 'firmy' | 'manual' {
  const desc = (deal.description ?? '').toLowerCase();
  if (desc.includes('[zdroj:reality]') || desc.includes('sreality')) return 'reality';
  if (desc.includes('[zdroj:firmy]') || desc.includes('firmy.cz')) return 'firmy';
  return 'manual';
}

function formatCzk(value: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function csvEscape(value: string): string {
  if (!value) return '""';
  return `"${value.replaceAll('"', '""')}"`;
}

const WON_REASONS = [
  'Cena',
  'Kvalita servisu',
  'Doporučení',
  'Rychlost jednání',
  'Produkt vyhovoval',
  'Jiný důvod',
];

const LOST_REASONS = [
  'Příliš vysoká cena',
  'Vybral konkurenci',
  'Klient neodpovídá',
  'Nereálné požadavky',
  'Projekt zrušen',
  'Jiný důvod',
];

interface WonLostDialogProps {
  open: boolean;
  stage: 'won' | 'lost';
  onConfirm: (reason: string, note: string) => void;
  onCancel: () => void;
}

function WonLostDialog({ open, stage, onConfirm, onCancel }: WonLostDialogProps) {
  const [reason, setReason] = React.useState('');
  const [note, setNote] = React.useState('');
  const reasons = stage === 'won' ? WON_REASONS : LOST_REASONS;

  React.useEffect(() => {
    if (open) { setReason(''); setNote(''); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage === 'won' ? '🎉 Deal vyhráno!' : '❌ Deal zrušen'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm">{stage === 'won' ? 'Důvod výhry' : 'Důvod zrušení'}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="— Vyberte důvod —" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Poznámka (volitelná)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Doplňte kontext..."
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Zrušit</Button>
          <Button
            variant={stage === 'won' ? 'mono' : 'destructive'}
            disabled={!reason}
            onClick={() => onConfirm(reason, note)}
          >
            Potvrdit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PipelinePage() {
  const latestLoadRequestRef = React.useRef(0);
  const [allDeals, setAllDeals] = React.useState<BackendDeal[]>([]);
  const [columns, setColumns] = React.useState<Record<string, BackendDeal[]>>(() =>
    Object.fromEntries(STAGE_KEYS.map((k) => [k, []])),
  );
  const [loading, setLoading] = React.useState(true);
  const [sourceFilter, setSourceFilter] = React.useState<SourceFilter>('all');
  const [missingFollowUpIds, setMissingFollowUpIds] = React.useState<Set<string>>(new Set());
  const [forecastPeriod, setForecastPeriod] = React.useState<'7d' | '30d' | '90d'>('30d');
  const [forecast, setForecast] = React.useState<BackendDealsForecast | null>(null);
  const [nextActionsByDealId, setNextActionsByDealId] = React.useState<Record<string, BackendDealNextAction>>({});
  const [goalMonthly, setGoalMonthly] = React.useState<string>('');
  const [goalQuarterly, setGoalQuarterly] = React.useState<string>('');
  const [savingGoals, setSavingGoals] = React.useState(false);

  // Won/Lost dialog state
  const [wonLostDialog, setWonLostDialog] = React.useState<{
    dealId: string;
    stage: 'won' | 'lost';
  } | null>(null);
  // Pending move that waits for dialog confirmation
  const pendingMoveRef = React.useRef<{ dealId: string; stage: string } | null>(null);

  const loadDeals = React.useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    try {
      const [res, missing, fc, nextActions] = await Promise.all([
        fetchDeals({ limit: 500 }),
        fetchDealsMissingFollowUp(),
        fetchDealsForecast(forecastPeriod),
        fetchDealNextActions(500),
      ]);
      if (requestId !== latestLoadRequestRef.current) return;
      setAllDeals(res?.data ?? []);
      setMissingFollowUpIds(new Set((missing?.data ?? []).map((d) => d.id)));
      setForecast(fc);
      setNextActionsByDealId(
        Object.fromEntries((nextActions?.data ?? []).map((row) => [row.dealId, row])),
      );
      setGoalMonthly(String(fc?.goals?.monthlyTarget ?? 0));
      setGoalQuarterly(String(fc?.goals?.quarterlyTarget ?? 0));
    } catch (err) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-pipeline-page',
        message: err instanceof Error ? err.message : 'Failed to load pipeline deals',
        meta: { operation: 'fetch_deals_pipeline_page' },
      });
      toast.error(err instanceof Error ? err.message : 'Načtení pipeline selhalo.');
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, [forecastPeriod]);

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

  // Re-group deals into columns whenever allDeals or filter changes
  React.useEffect(() => {
    const filtered =
      sourceFilter === 'all'
        ? allDeals
        : sourceFilter === 'next_action_high'
          ? allDeals.filter((d) => nextActionsByDealId[d.id]?.priority === 'high')
        : sourceFilter === 'next_action_medium'
          ? allDeals.filter((d) => nextActionsByDealId[d.id]?.priority === 'medium')
        : sourceFilter === 'next_action_low'
          ? allDeals.filter((d) => nextActionsByDealId[d.id]?.priority === 'low')
        : sourceFilter === 'missing_follow_up'
          ? allDeals.filter((d) => missingFollowUpIds.has(d.id))
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
  }, [allDeals, sourceFilter, missingFollowUpIds, nextActionsByDealId]);

  const handleKanbanChange = (next: Record<string, BackendDeal[]>) => {
    if (!next || typeof next !== 'object') return;
    setColumns(next);
  };

  const applyMove = (dealId: string, targetStage: string, reason?: string, note?: string) => {
    setAllDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d)),
    );

    const payload: Parameters<typeof updateDeal>[1] = { stage: targetStage };
    if (reason) {
      payload.description = `[${targetStage.toUpperCase()}] Důvod: ${reason}${note ? ` — ${note}` : ''}`;
    }

    void updateDeal(dealId, payload)
      .then(() => {
        dispatchCrmEvent(CRM_DEALS_REFRESH_EVENT);
        void loadDeals();
        toast.success(`Přesunuto do: ${PIPELINE_STAGES[targetStage]?.label ?? targetStage}`);
      })
      .catch(async (err) => {
        logFrontendError({
          area: 'crm-pipeline-page',
          message: err instanceof Error ? err.message : 'Failed to update deal stage in pipeline page',
          meta: { dealId, targetStage, operation: 'update_deal_stage_pipeline_page' },
        });
        toast.error(err instanceof Error ? err.message : 'Uložení změny selhalo.');
        await loadDeals();
      });
  };

  const handleKanbanMove = ({ event, activeContainer, overContainer }: KanbanMoveEvent) => {
    if (activeContainer === overContainer) return;
    const dealId = String(event.active.id);
    const targetStage = overContainer as string;
    if (!STAGE_KEYS.includes(targetStage)) return;

    if (targetStage === 'won' || targetStage === 'lost') {
      pendingMoveRef.current = { dealId, stage: targetStage };
      setWonLostDialog({ dealId, stage: targetStage });
      return;
    }

    applyMove(dealId, targetStage);
  };

  const handleWonLostConfirm = (reason: string, note: string) => {
    const pending = pendingMoveRef.current;
    if (!pending) return;
    applyMove(pending.dealId, pending.stage, reason, note);
    pendingMoveRef.current = null;
    setWonLostDialog(null);
  };

  const handleWonLostCancel = () => {
    // Revert optimistic update — reload deals
    pendingMoveRef.current = null;
    setWonLostDialog(null);
    void loadDeals();
  };

  const totalDeals = Object.values(columns).reduce((a, b) => a + b.length, 0);
  const visibleDeals = React.useMemo(() => Object.values(columns).flat(), [columns]);
  const nextActionStats = React.useMemo(() => {
    const stats = { high: 0, medium: 0, low: 0 };
    for (const action of Object.values(nextActionsByDealId)) {
      if (action.priority === 'high') stats.high += 1;
      else if (action.priority === 'medium') stats.medium += 1;
      else stats.low += 1;
    }
    return stats;
  }, [nextActionsByDealId]);

  const handleSaveGoals = async () => {
    const monthlyTarget = Number(goalMonthly || 0);
    const quarterlyTarget = Number(goalQuarterly || 0);
    setSavingGoals(true);
    try {
      await saveDealsForecastGoals({
        monthlyTarget: Number.isFinite(monthlyTarget) ? Math.max(0, monthlyTarget) : 0,
        quarterlyTarget: Number.isFinite(quarterlyTarget) ? Math.max(0, quarterlyTarget) : 0,
      });
      await loadDeals();
      toast.success('Forecast cíle byly uloženy.');
    } catch (error) {
      logFrontendError({
        area: 'crm-pipeline-page',
        message: error instanceof Error ? error.message : 'Failed to save forecast goals',
        meta: { operation: 'save_forecast_goals' },
      });
      toast.error(error instanceof Error ? error.message : 'Uložení cílů selhalo.');
    } finally {
      setSavingGoals(false);
    }
  };

  const handleExportNextActionsCsv = () => {
    try {
      const header = [
        'Deal ID',
        'Deal',
        'Stage',
        'Value',
        'Expected Close',
        'Recommendation Priority',
        'Recommendation Label',
        'Recommendation Reason',
      ];
      const rows = visibleDeals
        .filter((deal) => Boolean(nextActionsByDealId[deal.id]))
        .map((deal) => {
          const nextAction = nextActionsByDealId[deal.id];
          return [
            deal.id,
            deal.title ?? '',
            deal.stage ?? '',
            String(deal.value ?? ''),
            deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString() : '',
            nextAction?.priority ?? '',
            nextAction?.label ?? '',
            nextAction?.reason ?? '',
          ];
        });
      const content = [header, ...rows]
        .map((line) => line.map((cell) => csvEscape(String(cell))).join(','))
        .join('\n');
      const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pipeline-next-actions-${stamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exportováno ${rows.length} doporučení.`);
    } catch (error) {
      logFrontendError({
        area: 'crm-pipeline-page',
        message: error instanceof Error ? error.message : 'Failed to export next actions csv',
        meta: { operation: 'export_next_actions_csv' },
      });
      toast.error(error instanceof Error ? error.message : 'Export doporučení selhal.');
    }
  };

  const handleCopyNextActionsSummary = async () => {
    const summary = [
      `Pipeline summary (${new Date().toLocaleString('cs-CZ')})`,
      `Visible deals: ${visibleDeals.length}`,
      `Next Actions HIGH: ${nextActionStats.high}`,
      `Next Actions MEDIUM: ${nextActionStats.medium}`,
      `Next Actions LOW: ${nextActionStats.low}`,
      `Current filter: ${sourceFilter}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Souhrn doporučení byl zkopírován.');
    } catch (error) {
      logFrontendError({
        area: 'crm-pipeline-page',
        message: error instanceof Error ? error.message : 'Failed to copy next actions summary',
        meta: { operation: 'copy_next_actions_summary' },
      });
      toast.error(error instanceof Error ? error.message : 'Kopírování souhrnu selhalo.');
    }
  };

  return (
    <>
      <div className="border-b bg-background px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <KanbanSquare className="size-5 text-muted-foreground" />
          <span className="font-semibold text-base">Pipeline</span>
          <span className="text-sm text-muted-foreground">({totalDeals} leadů)</span>
        </div>

        <div className="flex items-center gap-3">
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

          <Button variant="outline" size="sm" mode="icon" onClick={() => void loadDeals()} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" mode="icon" title="Forecast nastavení">
                <Settings2 className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[760px] max-w-[95vw] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup
                  type="single"
                  value={forecastPeriod}
                  onValueChange={(v) => v && setForecastPeriod(v as '7d' | '30d' | '90d')}
                  variant="outline"
                  size="sm"
                  className="shadow-none!"
                >
                  <ToggleGroupItem value="7d" className="text-xs px-3">Forecast 7d</ToggleGroupItem>
                  <ToggleGroupItem value="30d" className="text-xs px-3">Forecast 30d</ToggleGroupItem>
                  <ToggleGroupItem value="90d" className="text-xs px-3">Forecast 90d</ToggleGroupItem>
                </ToggleGroup>

                <div className="text-xs rounded-md border bg-background px-2.5 py-1.5">
                  Open: <span className="font-semibold">{formatCzk(forecast?.summary.totalOpenValue ?? 0)}</span>
                </div>
                <div className="text-xs rounded-md border bg-background px-2.5 py-1.5">
                  Weighted: <span className="font-semibold">{formatCzk(forecast?.summary.weightedForecast ?? 0)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSourceFilter((prev) => (prev === 'missing_follow_up' ? 'all' : 'missing_follow_up'))}
                  className={`text-xs rounded-md border px-2.5 py-1.5 ${
                    sourceFilter === 'missing_follow_up'
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'bg-background'
                  }`}
                >
                  Bez follow-up: <span className="font-semibold">{missingFollowUpIds.size}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter((prev) => (prev === 'next_action_high' ? 'all' : 'next_action_high'))}
                  className={`text-xs rounded-md border px-2.5 py-1.5 ${
                    sourceFilter === 'next_action_high'
                      ? 'border-destructive/40 bg-destructive/10 text-destructive'
                      : 'bg-background'
                  }`}
                >
                  Akce HIGH: <span className="font-semibold">{nextActionStats.high}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter((prev) => (prev === 'next_action_medium' ? 'all' : 'next_action_medium'))}
                  className={`text-xs rounded-md border px-2.5 py-1.5 ${
                    sourceFilter === 'next_action_medium'
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'bg-background'
                  }`}
                >
                  Akce MEDIUM: <span className="font-semibold">{nextActionStats.medium}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceFilter((prev) => (prev === 'next_action_low' ? 'all' : 'next_action_low'))}
                  className={`text-xs rounded-md border px-2.5 py-1.5 ${
                    sourceFilter === 'next_action_low'
                      ? 'border-muted-foreground/30 bg-muted text-foreground'
                      : 'bg-background'
                  }`}
                >
                  Akce LOW: <span className="font-semibold">{nextActionStats.low}</span>
                </button>
                <div className="text-xs rounded-md border bg-background px-2.5 py-1.5">
                  Won ({forecastPeriod}): <span className="font-semibold">{formatCzk(forecast?.summary.wonValueInPeriod ?? 0)}</span>
                </div>
                <div className="text-xs rounded-md border bg-background px-2.5 py-1.5">
                  Měsíc cíl/progress: <span className="font-semibold">{formatCzk(forecast?.goals.monthlyTarget ?? 0)} / {forecast?.progress.monthlyPct ?? 0}%</span>
                </div>
                <div className="text-xs rounded-md border bg-background px-2.5 py-1.5">
                  Kvartál cíl/progress: <span className="font-semibold">{formatCzk(forecast?.goals.quarterlyTarget ?? 0)} / {forecast?.progress.quarterlyPct ?? 0}%</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
                  <Input
                    value={goalMonthly}
                    onChange={(e) => setGoalMonthly(e.target.value)}
                    inputMode="numeric"
                    className="h-7 w-28 text-xs"
                    placeholder="Měsíční cíl"
                  />
                  <Input
                    value={goalQuarterly}
                    onChange={(e) => setGoalQuarterly(e.target.value)}
                    inputMode="numeric"
                    className="h-7 w-28 text-xs"
                    placeholder="Kvartální cíl"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => void handleSaveGoals()}
                    disabled={savingGoals}
                  >
                    {savingGoals ? 'Ukládám…' : 'Uložit cíle'}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={handleExportNextActionsCsv}>
            <Download className="size-4" /> Export Next Actions CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => void handleCopyNextActionsSummary()}>
            Kopírovat summary
          </Button>

          <NewDealDialog onCreated={loadDeals} />
        </div>
      </div>

      <Content className="py-4">
        <div className="w-full px-5 pb-4 overflow-x-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground py-8">Načítám pipeline...</div>
          ) : (
            <Kanban
              value={columns}
              onValueChange={handleKanbanChange}
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
                    nextActionsByDealId={nextActionsByDealId}
                    onEditDeal={() => {/* future edit dialog */}}
                  />
                ))}
              </KanbanBoard>
              <KanbanOverlay>
                <div className="rounded-md bg-muted/60 size-full" />
              </KanbanOverlay>
            </Kanban>
          )}
        </div>
      </Content>

      {wonLostDialog && (
        <WonLostDialog
          open={true}
          stage={wonLostDialog.stage}
          onConfirm={handleWonLostConfirm}
          onCancel={handleWonLostCancel}
        />
      )}
    </>
  );
}
