import { useState } from 'react';
import { useManagedAssigneeOptions } from '@/crm/hooks/use-managed-core-users';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type TaskItem = {
  id: number;
  checked: boolean;
  action: string;
  assignees: { name: string; avatar?: string }[];
  date: string;
  highlight?: boolean;
};

type TaskAssignee = TaskItem['assignees'][number];

type TaskGroup = {
  key: 'today' | 'yesterday' | 'lastWeek';
  label: string;
  tasks: TaskItem[];
};

const TASK_GROUPS: TaskGroup[] = [
  {
    key: 'today',
    label: 'Today',
    tasks: [
      {
        id: 1,
        checked: false,
        action: 'completed project milestone',
        assignees: [{ name: '' }, { name: '' }, { name: '' }],
        date: 'May 14, 2025',
      },
      {
        id: 2,
        checked: true,
        action: 'created new task',
        assignees: [{ name: '' }],
        date: 'July 22, 2025',
        highlight: true,
      },
      {
        id: 3,
        checked: false,
        action: 'Reviewed design mockups',
        assignees: [{ name: '' }, { name: '' }],
        date: 'July 27, 2025',
      },
    ],
  },
  {
    key: 'yesterday',
    label: 'Yesterday',
    tasks: [
      {
        id: 4,
        checked: false,
        action: 'Updated project documentation',
        assignees: [{ name: '' }, { name: '' }, { name: '' }],
        date: 'July 5, 2025',
      },
      {
        id: 5,
        checked: true,
        action: 'Deployed application update',
        assignees: [{ name: '' }],
        date: 'June 30, 2025',
      },
    ],
  },
  {
    key: 'lastWeek',
    label: 'Last week',
    tasks: [
      {
        id: 6,
        checked: false,
        action: 'Launched marketing campaign',
        assignees: [{ name: '' }, { name: '' }],
        date: 'July 25, 2025',
      },
      {
        id: 7,
        checked: true,
        action: 'Completed Sales Deal',
        assignees: [{ name: '' }],
        date: 'June 24, 2025',
      },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function resolveTaskAssignees(
  task: TaskItem,
  managedAssignees: Array<{ name: string; avatar?: string }>,
): TaskAssignee[] {
  const sourceCount = Math.max(1, task.assignees.length);
  if (managedAssignees.length === 0) return task.assignees.slice(0, sourceCount);
  return Array.from({ length: sourceCount }, (_, index) => {
    const mapped = managedAssignees[(task.id + index) % managedAssignees.length];
    return { name: mapped.name, avatar: mapped.avatar };
  });
}

function resolveTaskActor(task: TaskItem, managedAssignees: Array<{ name: string }>): string {
  if (managedAssignees.length === 0) return 'Team';
  return managedAssignees[task.id % managedAssignees.length]?.name || 'Team';
}

function AssigneeBadge({ assignees }: { assignees: TaskAssignee[] }) {
  if (assignees.length > 1) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" size="sm" className="cursor-pointer">
              <Users className="size-3.5" /> {assignees.length} People
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="flex gap-3.5 p-2">
            {assignees.map((assignee, assigneeIndex) => (
              <div key={`${assignee.name}-${assigneeIndex}`} className="flex items-center gap-1">
                <Avatar className="size-4">
                  {assignee.avatar && (
                    <AvatarImage src={toAbsoluteUrl(assignee.avatar)} alt={assignee.name} />
                  )}
                  <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-xs font-medium">{assignee.name}</span>
              </div>
            ))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" size="sm" className="max-w-[150px]">
            <User className="size-3.5" /> <span className="truncate">{assignees[0]?.name || 'Uživatel'}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="flex gap-3.5 p-2">
          <div className="flex items-center gap-2">
            <Avatar className="size-4">
              {assignees[0]?.avatar && (
                <AvatarImage src={toAbsoluteUrl(assignees[0].avatar)} alt={assignees[0].name} />
              )}
              <AvatarFallback>{getInitials(assignees[0]?.name || 'Uživatel')}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{assignees[0]?.name || 'Uživatel'}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TaskRow({
  task,
  actor,
  assignees,
}: {
  task: TaskItem;
  actor: string;
  assignees: TaskAssignee[];
}) {
  return (
    <div
      className={`flex items-center gap-1 ps-6 py-1 ${
        task.highlight ? 'hover:bg-muted/20' : ''
      }`}
    >
      <Checkbox size="sm" className="me-1 mt-[1px]" defaultChecked={task.checked} />
      <Link to="/core/crm/companies" className="max-w-[150px] truncate font-medium hover:text-primary">
        {actor}
      </Link>
      <span className="min-w-0 break-words text-muted-foreground">{task.action}</span>
      <div className="ms-auto flex items-center gap-2">
        <AssigneeBadge assignees={assignees} />
        <Badge
          variant={new Date(task.date) > new Date() ? 'secondary' : 'destructive'}
          appearance="light"
          size="sm"
        >
          <CalendarIcon className={`size-3.5 ${task.checked ? 'opacity-60' : ''}`} />
          {task.date}
        </Badge>
      </div>
    </div>
  );
}

export function CompanyRecordsTasks() {
  const managedAssignees = useManagedAssigneeOptions();
  const [expanded, setExpanded] = useState({
    today: true,
    yesterday: false,
    lastWeek: false,
  });

  return (
    <div className="grid">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Tasks</h2>
        <Button variant="outline" size="sm" className="gap-1">
          + Create task
        </Button>
      </div>

      {TASK_GROUPS.map((group) => (
        <div key={group.key}>
          <button
            className="flex w-full cursor-pointer items-center gap-2 py-2 text-xs font-medium text-muted-foreground"
            onClick={() => setExpanded((prev) => ({ ...prev, [group.key]: !prev[group.key] }))}
            aria-expanded={expanded[group.key]}
          >
            <span className={`transition-transform ${expanded[group.key] ? '' : '-rotate-90'}`}>
              <ChevronDown className="size-4" />
            </span>
            <span>{group.label}</span>
          </button>

          {expanded[group.key] && (
            <div>
              {group.tasks.map((task) => {
                const displayAssignees = resolveTaskAssignees(task, managedAssignees);
                const displayActor = resolveTaskActor(task, managedAssignees);
                return (
                  <TaskRow
                    key={task.id}
                    task={task}
                    actor={displayActor}
                    assignees={displayAssignees}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
