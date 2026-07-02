import * as React from 'react';
import {
  Calendar,
  ChevronRight,
  ListTodo,
  Plus,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';
import { useManagedUserHandleAt } from '@/crm/hooks/use-managed-user-handle-at';
import { useManagedUserNameAt } from '@/crm/hooks/use-managed-user-name-at';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function CompanyRecordsOverviewTasks() {
  const [isTasksOpen, setIsTasksOpen] = React.useState(true);
  const userNameAt = useManagedUserNameAt();
  const userHandleAt = useManagedUserHandleAt();
  const items = [
    {
      id: 'overview-task-1',
      checked: false,
      actorIndex: 0,
      action: 'completed a task',
      assigneeIndexes: [0, 1],
      dateLabel: 'May 14, 2025',
      dateVariant: 'destructive' as const,
      dateIconClassName: 'size-3.5',
    },
    {
      id: 'overview-task-2',
      checked: true,
      actorIndex: 1,
      action: 'added new task',
      assigneeIndexes: [2],
      dateLabel: 'July 27, 2025',
      dateVariant: 'secondary' as const,
      dateIconClassName: 'size-3.5 opacity-60',
    },
  ];

  return (
    <Collapsible
      className="space-y-2 mb-5"
      open={isTasksOpen}
      onOpenChange={setIsTasksOpen}
    >
      <div className="flex items-center justify-between gap-2.5">
        <CollapsibleTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-sm text-semibold [&:not(:hover)[data-state=open]]:bg-transparent hover:bg-accent ps-1.5"
          >
            <ListTodo />
            Tasks
            <ChevronRight className="[[data-state=open]_&]:rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="sm" mode="icon">
                <Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Add task</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CollapsibleContent>
        <Card className="shadow-none">
          <CardContent className="space-y-4 p-3.5">
            <ul className="flex flex-col gap-2.5">
              {items.map((item) => (
                <li key={item.id} className="flex min-w-0 items-center gap-1 text-sm">
                  <Checkbox size="sm" className="mt-[1px] me-1" defaultChecked={item.checked} />
                  <Link to="/core/crm/companies" className="truncate font-medium hover:text-primary">
                    {userHandleAt(item.actorIndex)}
                  </Link>
                  <span className="shrink-0 text-muted-foreground">{item.action}</span>
                  <div className="ms-auto flex min-w-0 items-center gap-2">
                    {item.assigneeIndexes.length > 1 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" size="sm" className="cursor-pointer">
                              <Users className="size-3.5" /> {item.assigneeIndexes.length} People
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="flex max-w-[260px] flex-wrap gap-2 p-2">
                            {item.assigneeIndexes.map((assigneeIndex) => (
                              <div key={`${item.id}-${assigneeIndex}`} className="flex min-w-0 items-center gap-1">
                                <Avatar className="size-4">
                                  <AvatarImage
                                    src={toAbsoluteUrl(`/media/avatars/300-${(assigneeIndex % 8) + 1}.png`)}
                                    alt={userNameAt(assigneeIndex)}
                                  />
                                  <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <span className="max-w-[100px] truncate text-xs font-medium">
                                  {userNameAt(assigneeIndex)}
                                </span>
                              </div>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="secondary" size="sm" className="max-w-[150px]">
                        <User className="size-3.5 shrink-0" />
                        <span className="truncate">{userNameAt(item.assigneeIndexes[0])}</span>
                      </Badge>
                    )}
                    <Badge variant={item.dateVariant} size="sm" appearance="light">
                      <Calendar className={item.dateIconClassName} /> {item.dateLabel}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
