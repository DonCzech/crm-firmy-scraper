import { useState } from 'react';
import { Check, Play, X, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PmDailySlot, PmSlotType, PM_SLOT_TYPE_LABELS, formatMinutes } from '../types';

const slotTypeColors: Record<PmSlotType, string> = {
  focus:    'border-l-violet-500 bg-violet-50/50',
  dev:      'border-l-blue-500 bg-blue-50/50',
  qa:       'border-l-orange-400 bg-orange-50/50',
  review:   'border-l-yellow-500 bg-yellow-50/50',
  admin:    'border-l-zinc-400 bg-zinc-50/50',
  operativa:'border-l-sky-500 bg-sky-50/50',
  seo:      'border-l-green-500 bg-green-50/50',
  content:  'border-l-pink-500 bg-pink-50/50',
};

interface DailySlotCardProps {
  slot: PmDailySlot;
  onUpdate?: (id: string, data: Partial<PmDailySlot>) => void;
  onDelete?: (id: string) => void;
}

export function DailySlotCard({ slot, onUpdate, onDelete }: DailySlotCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(slot.resultNote ?? '');
  const [actualMin, setActualMin] = useState(String(slot.actualDuration ?? 0));

  const isDone = slot.status === 'done';
  const isSkipped = slot.status === 'skipped';
  const colors = slotTypeColors[slot.slotType] ?? 'border-l-zinc-300 bg-zinc-50/50';

  const handleDone = () => {
    onUpdate?.(slot.id, {
      status: 'done',
      actualDuration: parseInt(actualMin) || slot.plannedDuration,
      resultNote: note || undefined,
    });
  };

  const handleSkip = () => {
    onUpdate?.(slot.id, { status: 'skipped' });
  };

  return (
    <div
      className={cn(
        'border-l-4 rounded-r-lg border border-l-[5px] p-3 transition-all',
        colors,
        isDone && 'opacity-70',
        isSkipped && 'opacity-40 line-through',
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="text-xs font-mono text-muted-foreground w-20 shrink-0">
          {slot.startTime} – {slot.endTime}
        </div>

        {/* Project + task */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {slot.project?.color && (
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: slot.project.color }}
              />
            )}
            <span className="text-sm font-medium truncate">
              {slot.project?.name ?? <span className="text-muted-foreground italic">Bez projektu</span>}
            </span>
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-background rounded border">
              {PM_SLOT_TYPE_LABELS[slot.slotType]}
            </span>
          </div>
          {slot.task && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">↳ {slot.task.title}</p>
          )}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Clock className="size-3" />
          {formatMinutes(slot.plannedDuration)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!isDone && !isSkipped && (
            <>
              <Button size="icon" variant="ghost" className="size-7" onClick={() => setExpanded(e => !e)}>
                <ChevronDown className={cn('size-3.5 transition-transform', expanded && 'rotate-180')} />
              </Button>
              <Button size="icon" variant="ghost" className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={handleDone}>
                <Check className="size-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="size-7 text-muted-foreground hover:text-red-500" onClick={handleSkip}>
                <X className="size-3.5" />
              </Button>
            </>
          )}
          {isDone && <Check className="size-4 text-emerald-500" />}
          {onDelete && (
            <Button size="icon" variant="ghost" className="size-7 text-muted-foreground hover:text-red-500" onClick={() => onDelete(slot.id)}>
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded form */}
      {expanded && !isDone && !isSkipped && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground w-24">Skutečný čas (min)</label>
            <input
              type="number"
              value={actualMin}
              onChange={e => setActualMin(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-24 bg-background"
              min="0"
              max="480"
            />
          </div>
          <div className="flex items-start gap-3">
            <label className="text-xs text-muted-foreground w-24 mt-1">Poznámka</label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Co bylo hotovo? Jaký je další krok?"
              className="text-sm resize-none h-16"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setExpanded(false)}>Zrušit</Button>
            <Button size="sm" onClick={handleDone}>
              <Check className="size-3.5" /> Dokončit slot
            </Button>
          </div>
        </div>
      )}

      {/* Done result */}
      {isDone && slot.resultNote && (
        <p className="mt-2 text-xs text-muted-foreground border-t pt-2">{slot.resultNote}</p>
      )}
    </div>
  );
}
