import { useState } from 'react';
import { Check, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PmTask, formatMinutes } from '../types';
import { PriorityBadge, StatusBadge } from './pm-badge';

interface TaskRowProps {
  task: PmTask;
  onStatusChange?: (id: string, status: string) => void;
  onSelect?: (task: PmTask) => void;
  showProject?: boolean;
}

export function TaskRow({ task, onStatusChange, onSelect, showProject }: TaskRowProps) {
  const isDone = task.status === 'Hotovo' || task.status === 'Archiv';
  const isBlocked = task.status === 'Blokováno';
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !isDone;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 rounded-lg transition-colors group cursor-pointer',
        isDone && 'opacity-60',
      )}
      onClick={() => onSelect?.(task)}
    >
      {/* Done toggle */}
      <button
        className={cn(
          'size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          isDone
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-zinc-300 hover:border-emerald-400',
        )}
        onClick={e => {
          e.stopPropagation();
          onStatusChange?.(task.id, isDone ? 'Aktivní' : 'Hotovo');
        }}
      >
        {isDone && <Check className="size-3" />}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isBlocked && <AlertTriangle className="size-3.5 text-red-500 shrink-0" />}
          <span className={cn('text-sm truncate', isDone && 'line-through text-muted-foreground')}>
            {task.title}
          </span>
        </div>
        {showProject && task.project && (
          <p className="text-xs text-muted-foreground mt-0.5">{task.project.name}</p>
        )}
        {task.blockedReason && isBlocked && (
          <p className="text-xs text-red-500 mt-0.5">{task.blockedReason}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.estimatedDuration && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" /> {formatMinutes(task.estimatedDuration)}
          </span>
        )}
        {task.deadline && (
          <span className={cn('text-xs', isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
            {new Date(task.deadline).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
          </span>
        )}
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>

      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
    </div>
  );
}
