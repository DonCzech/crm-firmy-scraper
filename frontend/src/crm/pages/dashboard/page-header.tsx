import {
  BarChart2,
  CalendarClock,
  Download,
  FileCheck2,
  FileText,
  History,
  Home,
  Info,
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
import { useLanguage } from '@/localization/language-context';
import { ContentHeader } from '../../layout/components/content-header';

export function PageHeader() {
  const { canManageSensitiveActions } = useCurrentUserRole();
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('dashboard');
  const { language } = useLanguage();
  const t =
    language === 'cs'
      ? {
          dashboard: 'Přehled',
          reports: 'Reporty',
          enableNotifications: 'Zapnout upozornění',
          generateReport: 'Vygenerovat report',
          scheduleReport: 'Naplánovat report',
          reportHistory: 'Historie reportů',
          exportCsv: 'Exportovat zobrazení jako CSV',
          exportExcel: 'Exportovat zobrazení jako Excel',
          importCsv: 'Importovat CSV',
          reportsHelp: 'Zjistit více o reportech',
        }
      : {
          dashboard: 'Dashboard',
          reports: 'Reports',
          enableNotifications: 'Enable Notifications',
          generateReport: 'Generate Report',
          scheduleReport: 'Schedule Report',
          reportHistory: 'View Report History',
          exportCsv: 'Export view as CSV',
          exportExcel: 'Export view as Excel',
          importCsv: 'Import CSV',
          reportsHelp: 'Learn more about Reports',
        };

  return (
    <ContentHeader className="space-x-2">
      <h1 className="inline-flex items-center gap-2.5 text-sm font-semibold">
        <Home className="size-4 text-primary" /> {t.dashboard}
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
              {t.reports}
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
              <span>{t.enableNotifications}</span>
              <Switch defaultChecked size="sm" />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Add New User */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <BarChart2 />
              <span>{t.generateReport}</span>
            </DropdownMenuItem>

            {/* Send Invite Email */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <CalendarClock />
              <span>{t.scheduleReport}</span>
            </DropdownMenuItem>

            {/* Set Roles */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <History />
              <span>{t.reportHistory}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Export CSV */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <Download />
              <span>{t.exportCsv}</span>
            </DropdownMenuItem>

            {/* Export Excel */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <Share />
              <span>{t.exportExcel}</span>
            </DropdownMenuItem>

            {/* Import CSV */}
            <DropdownMenuItem className="gap-2" disabled={!canManageSensitiveActions}>
              <FileText />
              <span>{t.importCsv}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Learn */}
            <DropdownMenuItem className="text-muted-foreground">
              <Info />
              <span className="text-sm">{t.reportsHelp}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ContentHeader>
  );
}
