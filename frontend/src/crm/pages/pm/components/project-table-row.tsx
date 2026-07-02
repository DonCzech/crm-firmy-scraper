import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Edit2, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PmProject } from '../types';
import { PriorityBadge, StatusBadge, ActiveWaveDot } from './pm-badge';

interface ProjectTableRowProps {
  project: PmProject;
  odd?: boolean;
  onDelete?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
}

export function ProjectTableRow({ project, odd, onDelete, onRename }: ProjectTableRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);

  useEffect(() => {
    if (editing) return;
    setDraft(project.name);
  }, [project.name, editing]);

  return (
    <tr className={cn('border-b last:border-0 group', odd && 'bg-muted/20')}>
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2">
          {project.color && (
            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
          )}
          {editing ? (
            <div className="flex items-center gap-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-8 text-xs w-56"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && draft.trim() && onRename) {
                    onRename(project.id, draft.trim());
                    setEditing(false);
                  }
                  if (e.key === 'Escape') {
                    setDraft(project.name);
                    setEditing(false);
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => {
                  if (!draft.trim() || !onRename) return;
                  onRename(project.id, draft.trim());
                  setEditing(false);
                }}
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => {
                  setDraft(project.name);
                  setEditing(false);
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                to={`/core/crm/pm/project/${project.id}`}
                className="font-medium text-foreground hover:text-primary truncate max-w-[200px]"
              >
                {project.name}
              </Link>
              {onRename && (
                <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(true)}>
                  <Edit2 className="size-3.5" />
                </Button>
              )}
            </div>
          )}
          <ActiveWaveDot active={project.activeWave} />
        </div>
        <p className="text-xs text-muted-foreground pl-4">{project.category}</p>
      </td>
      <td className="py-2.5 px-3">
        <StatusBadge status={project.status} />
      </td>
      <td className="py-2.5 px-3">
        <PriorityBadge priority={project.priority} />
      </td>
      <td className="py-2.5 px-3 hidden md:table-cell">
        <p className="text-xs text-muted-foreground truncate max-w-[240px]">
          {project.nextStep ?? <span className="text-red-400 italic">Chybí next step!</span>}
        </p>
      </td>
      <td className="py-2.5 px-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">
            {project.weeklyHours?.actual ?? 0}h / {project.weeklyTimeBudget}h
          </span>
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
