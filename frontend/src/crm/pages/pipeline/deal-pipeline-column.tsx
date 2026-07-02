'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
} from '@/components/ui/kanban';
import type { BackendDeal, BackendDealNextAction } from '@/crm/services/backend';
import { DealPipelineCard } from './deal-pipeline-card';

export const PIPELINE_STAGES: Record<string, { label: string; color: string }> = {
  new:          { label: 'Nový lead',  color: 'bg-slate-100 dark:bg-slate-800' },
  qualified:    { label: 'Osloven',    color: 'bg-sky-50 dark:bg-sky-950' },
  proposal:     { label: 'Zájem',      color: 'bg-violet-50 dark:bg-violet-950' },
  negotiation:  { label: 'Jednání',    color: 'bg-orange-50 dark:bg-orange-950' },
  won:          { label: 'Vyhráno',    color: 'bg-emerald-50 dark:bg-emerald-950' },
  lost:         { label: 'Zrušeno',    color: 'bg-rose-50 dark:bg-rose-950' },
};

function formatCzk(value: number) {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
}

interface DealPipelineColumnProps {
  value: string;
  deals: BackendDeal[];
  nextActionsByDealId?: Record<string, BackendDealNextAction>;
  onEditDeal?: (deal: BackendDeal) => void;
}

export function DealPipelineColumn({ value, deals, nextActionsByDealId, onEditDeal }: DealPipelineColumnProps) {
  const stage = PIPELINE_STAGES[value] ?? { label: value, color: '' };
  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <KanbanColumn
      value={value}
      className={`rounded-md border p-2.5 shadow-xs ${stage.color}`}
    >
      <div className="flex items-center justify-between mb-2.5 gap-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{stage.label}</span>
            <Badge variant="secondary" className="text-xs">{deals.length}</Badge>
          </div>
          {totalValue > 0 && (
            <span className="text-[11px] text-muted-foreground">{formatCzk(totalValue)}</span>
          )}
        </div>
        <KanbanColumnHandle asChild>
          <Button variant="dim" size="sm" mode="icon">
            <GripVertical />
          </Button>
        </KanbanColumnHandle>
      </div>

      <KanbanColumnContent value={value} className="flex flex-col gap-2 p-0.5">
        {deals.map((deal) => (
          <DealPipelineCard
            key={deal.id}
            deal={deal}
            nextAction={nextActionsByDealId?.[deal.id]}
            asHandle
            onEdit={onEditDeal}
          />
        ))}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}
