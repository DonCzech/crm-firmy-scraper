import { useMemo } from 'react';
import { useCompanyContacts } from '@/crm/hooks/use-company-contacts';
import {
  BellPlus,
  CalendarCheck,
  CalendarSync,
  CircleX,
  Clock,
  EllipsisVertical,
  Flag,
  Handshake,
  LayoutDashboard,
  MapPin,
  MessageSquareText,
  Phone,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router';
import { useCurrentCompany } from '@/crm/hooks/use-current-company';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CompanyRecordsOverviewHighlights() {
  const { company } = useCurrentCompany();
  const { contactsById } = useCompanyContacts();
  const connectionActions = [
    { id: 'message', label: 'Message', Icon: MessageSquareText },
    { id: 'call', label: 'Call', Icon: Phone },
    { id: 'meeting', label: 'Schedule Meeting', Icon: CalendarCheck },
  ] as const;
  const appointmentActions = [
    { id: 'reschedule', label: 'Reschedule', Icon: CalendarSync },
    { id: 'invite', label: 'Invite Participants', Icon: UserPlus },
    { id: 'reminder', label: 'Send Reminder', Icon: BellPlus },
  ] as const;
  const appointmentFacts = [
    { id: 'type', label: 'On-site Estimation', Icon: Flag },
    { id: 'location', label: '456 Square Avenue, NY', Icon: MapPin, truncate: true },
  ] as const;
  const connectionStrength = useMemo(() => {
    const strengthId = company?.connectionStrengthId || '';
    if (strengthId === '1') return { name: 'Low', color: 'bg-red-500' };
    if (strengthId === '2') return { name: 'Medium', color: 'bg-amber-500' };
    if (strengthId === '3') return { name: 'High', color: 'bg-green-500' };
    return { name: 'Not specified', color: 'bg-muted' };
  }, [company?.connectionStrengthId]);
  const primaryContactName = useMemo(() => {
    const firstContactId = company?.contactIds?.[0];
    if (!firstContactId) return 'Nepřiřazeno';
    return contactsById.get(firstContactId)?.name || 'Nepřiřazeno';
  }, [company?.contactIds, contactsById]);

  return (
    <div className="space-y-3.5">
      <h3 className="ms-1 flex items-center gap-1.5 text-sm font-semibold">
        <LayoutDashboard className="size-3.5 opacity-60" />
        Highlights
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Payment */}
        <Card className="w-full min-w-0 shadow-none md:w-72">
          <CardHeader className="p-2.5 py-0 min-h-10 border-0">
            <CardTitle className="text-2sm font-normal">
              Connection Strength
            </CardTitle>
            <CardToolbar>
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Button variant="ghost" size="sm" mode="icon">
                    <EllipsisVertical className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom">
                  {connectionActions.map((action) => (
                    <DropdownMenuItem key={action.id}>
                      <action.Icon className="size-3.5" />
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardToolbar>
          </CardHeader>
          <CardContent className="px-2.5 pb-2.5 pt-1 space-y-2">
            <div className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  'rounded-full size-2 mx-0.5',
                  connectionStrength?.color,
                )}
              ></span>
              <span className={cn('font-semibold text-foreground')}>
                {connectionStrength?.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Handshake className="size-3.5 text-muted-foreground shrink-0" />
              <Link
                to="/core/crm/companies"
                className="max-w-[180px] truncate font-medium text-foreground hover:text-primary"
                title={primaryContactName}
              >
                {primaryContactName}
              </Link>
            </div>
          </CardContent>
        </Card>
        {/* Last Interaction */}
        <Card className="w-full min-w-0 shadow-none md:w-72">
          <CardHeader className="p-2.5 py-0 min-h-10 border-0">
            <CardTitle className="text-2sm font-normal">Appointments</CardTitle>
            <CardToolbar>
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Button variant="ghost" size="sm" mode="icon">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom">
                  {appointmentActions.map((action) => (
                    <DropdownMenuItem key={action.id}>
                      <action.Icon className="size-3.5" />
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <CircleX className="size-3.5" />
                    <span>Cancel</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardToolbar>
          </CardHeader>
          <CardContent className="px-2.5 pb-2.5 pt-1 space-y-2">
            <div className="space-y-1">
              {appointmentFacts.map((fact) => (
                <div key={fact.id} className="flex items-center gap-2">
                  <fact.Icon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className={cn('font-medium', fact.truncate ? 'max-w-[180px] truncate' : undefined)}>
                    {fact.label}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-muted-foreground shrink-0" />
                <Badge size="sm" variant="success" appearance="light" className="max-w-[170px]">
                  14:30 AM - 15:30 AM
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
