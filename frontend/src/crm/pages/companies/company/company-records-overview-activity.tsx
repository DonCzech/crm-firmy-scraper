import * as React from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { useManagedUserNameAt } from '@/crm/hooks/use-managed-user-name-at';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CompanyRecordsOverviewActivity() {
  const [isActivityOpen, setIsActivityOpen] = React.useState(true);
  const userNameAt = useManagedUserNameAt();
  const items = [
    {
      id: 'overview-activity-1',
      userIndex: 0,
      avatarSrc: '/media/avatars/300-1.png',
      action: 'changed',
      targetLabel: 'Project Status',
      when: '5 days ago',
    },
    {
      id: 'overview-activity-2',
      userIndex: 1,
      avatarSrc: null,
      action: 'added',
      targetLabel: 'Meeting Notes',
      when: '3 days ago',
    },
    {
      id: 'overview-activity-3',
      userIndex: 2,
      avatarSrc: '/media/avatars/300-3.png',
      action: 'added',
      targetLabel: 'Task Update',
      when: '1 day ago',
    },
  ] as const;

  return (
    <Collapsible
      className="space-y-2 relative"
      open={isActivityOpen}
      onOpenChange={setIsActivityOpen}
    >
      <div className="flex items-center justify-between gap-2.5">
        <CollapsibleTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-sm text-semibold [&:not(:hover)[data-state=open]]:bg-transparent hover:bg-accent ps-1.5"
          >
            <Activity />
            Activity
            <ChevronRight className="[[data-state=open]_&]:rotate-90" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <Tabs
          defaultValue="today"
          className="text-sm text-muted-foreground end-0 top-0 absolute z-1"
        >
          <TabsList
            variant="button"
            size="xs"
            className="[&_button]:text-muted-foreground"
          >
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="shadow-none">
          <CardContent className="space-y-3 p-3.5">
            <ul className="flex flex-col gap-2.5">
              {items.map((item) => (
                <li key={item.id} className="flex min-w-0 items-center gap-1.5 text-sm">
                  <Avatar className="size-6">
                    {item.avatarSrc ? (
                      <AvatarImage
                        src={toAbsoluteUrl(item.avatarSrc)}
                        alt={userNameAt(item.userIndex)}
                      />
                    ) : null}
                    <AvatarFallback>{userNameAt(item.userIndex).slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <Link
                      to="/core/crm/companies"
                      className="max-w-[130px] truncate font-medium text-foreground hover:text-primary"
                    >
                      {userNameAt(item.userIndex)}
                    </Link>
                    <span className="shrink-0 text-muted-foreground">{item.action}</span>
                    <Link
                      to="/core/crm/companies"
                      className="truncate text-mono font-medium hover:text-primary"
                    >
                      {item.targetLabel}
                    </Link>
                  </div>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{item.when}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-start">
              <Button mode="link" underline="solid" asChild>
                <Link to="/core/crm/companies">View all</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
