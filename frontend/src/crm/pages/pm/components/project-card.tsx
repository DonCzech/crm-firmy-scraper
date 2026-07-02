import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PmProject, formatMinutes } from '../types';
import { PriorityBadge, StatusBadge, ActiveWaveDot } from './pm-badge';

interface ProjectCardProps {
  project: PmProject;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const taskCount = project._count?.tasks ?? 0;
  const weeklyActual = project.weeklyHours?.actual ?? 0;
  const weeklyPlanned = project.weeklyTimeBudget;

  const weekProgress = weeklyPlanned > 0
    ? Math.min(100, Math.round((weeklyActual / weeklyPlanned) * 100))
    : 0;

  return (
    <Card
      className={cn(
        'group relative hover:shadow-md transition-shadow border',
        project.activeWave && 'ring-1 ring-emerald-200',
        className,
      )}
    >
      {/* Color stripe */}
      {project.color && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: project.color }}
        />
      )}

      <CardContent className="pl-5 pr-4 py-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={project.priority} />
              <StatusBadge status={project.status} />
              <ActiveWaveDot active={project.activeWave} />
            </div>
            <Link
              to={`/core/crm/pm/project/${project.id}`}
              className="text-sm font-semibold text-foreground hover:text-primary truncate mt-0.5 block"
            >
              {project.name}
            </Link>
            {project.category && (
              <p className="text-xs text-muted-foreground">{project.category}</p>
            )}
          </div>
          <Link
            to={`/core/crm/pm/project/${project.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Next step */}
        {project.nextStep && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Target className="size-3 mt-0.5 shrink-0 text-primary" />
            <span className="line-clamp-2">{project.nextStep}</span>
          </div>
        )}

        {/* Footer metrics */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="size-3" />
              {taskCount} úkolů
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {weeklyActual}h / {weeklyPlanned}h tento týden
            </span>
          </div>
        </div>

        {/* Weekly progress bar */}
        {weeklyPlanned > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Týdenní kapacita</span>
              <span>{weekProgress}%</span>
            </div>
            <Progress value={weekProgress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
