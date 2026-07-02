'use client';

import * as React from 'react';
import { Building2, Calendar, Home, Pencil, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KanbanItem, KanbanItemHandle } from '@/components/ui/kanban';
import type { BackendDeal, BackendDealNextAction } from '@/crm/services/backend';

export type DealSource = 'reality' | 'firmy' | 'manual';

export interface PipelineDeal extends BackendDeal {
  source?: DealSource;
}

function getSource(deal: BackendDeal): DealSource {
  const desc = (deal.description ?? '').toLowerCase();
  if (desc.includes('[zdroj:reality]') || desc.includes('sreality')) return 'reality';
  if (desc.includes('[zdroj:firmy]') || desc.includes('firmy.cz')) return 'firmy';
  return 'manual';
}

function formatCzk(value: number | undefined | null) {
  if (!value) return null;
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
}

function getDaysSinceUpdate(deal: BackendDeal): number {
  const ref = deal.updatedAt ?? deal.createdAt;
  if (!ref) return 0;
  const diffMs = Date.now() - new Date(ref).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function RottingIndicator({ days }: { days: number }) {
  if (days < 7) return null;
  const isUrgent = days >= 14;
  return (
    <span
      title={`Žádná aktivita ${days} dní`}
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
        isUrgent
          ? 'bg-destructive/10 text-destructive'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      <span className="text-[9px]">⏱</span> {days}d
    </span>
  );
}

interface DealPipelineCardProps {
  deal: BackendDeal;
  nextAction?: BackendDealNextAction;
  asHandle?: boolean;
  onEdit?: (deal: BackendDeal) => void;
}

export function DealPipelineCard({ deal, nextAction, asHandle, onEdit }: DealPipelineCardProps) {
  const source = getSource(deal);
  const contactName = deal.contact
    ? `${deal.contact.firstName ?? ''} ${deal.contact.lastName ?? ''}`.trim()
    : null;
  const daysSince = getDaysSinceUpdate(deal);

  const cardContent = (
    <div className={`rounded-md border bg-card p-3 shadow-xs space-y-2 ${daysSince >= 14 ? 'border-destructive/30' : daysSince >= 7 ? 'border-amber-300/60' : ''}`}>
      <div className="flex items-start justify-between gap-1">
        <span className="font-medium text-sm line-clamp-2 leading-snug">{deal.title}</span>
        <div className="flex items-center gap-1 shrink-0">
          <RottingIndicator days={daysSince} />
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              mode="icon"
              className="size-6"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(deal);
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {contactName && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="size-3 shrink-0" />
          <span className="line-clamp-1">{contactName}</span>
        </div>
      )}

      {deal.value ? (
        <div className="text-sm font-semibold text-foreground">{formatCzk(deal.value)}</div>
      ) : null}

      {nextAction && (
        <div
          className={`rounded-md px-2 py-1 text-[11px] leading-snug ${
            nextAction.priority === 'high'
              ? 'bg-destructive/10 text-destructive'
              : nextAction.priority === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-muted text-muted-foreground'
          }`}
          title={nextAction.reason}
        >
          <span className="font-semibold">{nextAction.label}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-1 pt-0.5">
        {source === 'reality' && (
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 text-amber-700 border-amber-300 bg-amber-50">
            <Home className="size-3" /> Reality
          </Badge>
        )}
        {source === 'firmy' && (
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 text-blue-700 border-blue-300 bg-blue-50">
            <Building2 className="size-3" /> Firmy
          </Badge>
        )}
        {source === 'manual' && (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            Manuální
          </Badge>
        )}

        {deal.expectedCloseDate && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
            <Calendar className="size-3" />
            {new Date(deal.expectedCloseDate).toLocaleDateString('cs-CZ', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <KanbanItem value={deal.id}>
      {asHandle ? <KanbanItemHandle>{cardContent}</KanbanItemHandle> : cardContent}
    </KanbanItem>
  );
}
