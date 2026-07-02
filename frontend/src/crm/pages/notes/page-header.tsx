import { useState } from 'react';
import {
  BarChart2,
  CalendarClock,
  Download,
  FileCheck2,
  FileText,
  GalleryVerticalEnd,
  History,
  Info,
  Plus,
  Share,
} from 'lucide-react';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useFrontendErrorCount24h } from '@/crm/hooks/use-frontend-error-count-24h';
import { useSensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';
import { ObservabilityBadges } from '@/crm/components/observability-badges';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { ContentHeader } from '../../layout/components/content-header';
import { NewNoteSheet } from './new-notes-sheet';

export function PageHeader() {
  const { canManageSensitiveActions } = useCurrentUserRole();
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('notes');
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);

  const onNoteSheetOpenChange = (open: boolean) => {
    setNoteSheetOpen(open);
  };

  return (
    <ContentHeader className="space-x-2">
      <h1 className="inline-flex items-center gap-2.5 text-sm font-semibold">
        <GalleryVerticalEnd className="size-4 text-primary" /> Notes
      </h1>

      <div className="flex items-center gap-2.5">
        <ObservabilityBadges
          frontendErrorCount24h={frontendErrorCount24h}
          sensitiveActions24hSummary={sensitiveActions24hSummary}
          compact
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <FileCheck2 />
              Reports
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[230px]">
            {/* Notifications Toggle */}
            <DropdownMenuItem
              className="justify-between text-muted-foreground"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <span>Enable Notifications</span>
              <Switch defaultChecked size="sm" />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Add New User */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <BarChart2 />
              <span>Generate Report</span>
            </DropdownMenuItem>

            {/* Send Invite Email */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <CalendarClock />
              <span>Schedule Report</span>
            </DropdownMenuItem>

            {/* Set Roles */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <History />
              <span>View Report History</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Export CSV */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <Download />
              <span>Export view as CSV</span>
            </DropdownMenuItem>

            {/* Export Excel */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <Share />
              <span>Export view as Excel</span>
            </DropdownMenuItem>

            {/* Import CSV */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <FileText />
              <span>Import CSV</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Learn */}
            <DropdownMenuItem className="text-muted-foreground">
              <Info />
              <span className="text-sm">Learn more about Reports</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={() => setNoteSheetOpen(true)}>
          <Plus /> New Note
        </Button>
        <NewNoteSheet
          open={noteSheetOpen}
          onOpenChange={onNoteSheetOpenChange}
        />
      </div>
    </ContentHeader>
  );
}
