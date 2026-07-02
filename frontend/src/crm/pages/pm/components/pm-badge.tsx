import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PmPriority, PmProjectStatus, PmTaskStatus } from '../types';

const priorityConfig: Record<PmPriority, { label: string; className: string }> = {
  critical: { label: 'Kritická', className: 'bg-red-100 text-red-700 border-red-200' },
  high:     { label: 'Vysoká',   className: 'bg-orange-100 text-orange-700 border-orange-200' },
  normal:   { label: 'Normální', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  low:      { label: 'Nízká',    className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  Backlog:    { label: 'Backlog',    className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
  Připraveno: { label: 'Připraveno', className: 'bg-sky-100 text-sky-700 border-sky-200' },
  Aktivní:    { label: 'Aktivní',    className: 'bg-green-100 text-green-700 border-green-200' },
  Blokováno:  { label: 'Blokováno', className: 'bg-red-100 text-red-700 border-red-200' },
  Čeká:       { label: 'Čeká',       className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  Hotovo:     { label: 'Hotovo',     className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Archiv:     { label: 'Archiv',     className: 'bg-zinc-100 text-zinc-400 border-zinc-200' },
};

export function PriorityBadge({ priority, className }: { priority: PmPriority; className?: string }) {
  const cfg = priorityConfig[priority] ?? priorityConfig.normal;
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </Badge>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-zinc-100 text-zinc-500' };
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </Badge>
  );
}

export function ActiveWaveDot({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Wave
    </span>
  );
}
