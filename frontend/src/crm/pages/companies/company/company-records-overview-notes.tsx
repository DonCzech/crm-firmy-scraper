import * as React from 'react';
import { ChevronRight, GalleryVerticalEnd, Plus } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function CompanyRecordsOverviewNotes() {
  const [isNotesOpen, setIsNotesOpen] = React.useState(true);
  const userNameAt = useManagedUserNameAt();
  const items = [
    {
      id: 'overview-note-1',
      userIndex: 0,
      avatarSrc: '/media/avatars/300-12.png',
      title: 'Untitled note',
      description: 'This note has no content',
      when: '13 days ago',
    },
    {
      id: 'overview-note-2',
      userIndex: 1,
      avatarSrc: null,
      title: 'Project Update',
      description: 'Updated project timeline and milestones',
      when: '10 days ago',
    },
    {
      id: 'overview-note-3',
      userIndex: 2,
      avatarSrc: '/media/avatars/300-5.png',
      title: 'Team Meeting',
      description: 'Discussed team performance and goals',
      when: '8 days ago',
    },
  ] as const;

  return (
    <Collapsible
      className="space-y-2"
      open={isNotesOpen}
      onOpenChange={setIsNotesOpen}
    >
      <div className="flex items-center justify-between gap-2.5">
        <CollapsibleTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-sm text-semibold [&:not(:hover)[data-state=open]]:bg-transparent hover:bg-accent ps-1.5"
          >
            <GalleryVerticalEnd />
            Notes
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
            <TooltipContent side="top">Add note</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CollapsibleContent>
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
                  <Link
                    to="/core/crm/companies"
                    className="w-[100px] shrink-0 truncate font-medium text-foreground hover:text-primary"
                  >
                    {userNameAt(item.userIndex)}
                  </Link>
                  <Link to="/core/crm/companies" className="truncate font-medium hover:text-primary">
                    {item.title}
                  </Link>
                  <span className="truncate text-muted-foreground">{item.description}</span>
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
