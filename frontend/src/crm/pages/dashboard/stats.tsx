import {
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  Pin,
  Settings,
  Share2,
  Trash,
  TriangleAlert,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { fetchCompanies, fetchDashboard } from '@/crm/services/backend';
import {
  CRM_COMPANIES_REFRESH_EVENT,
  CRM_CONTACTS_REFRESH_EVENT,
  CRM_DEALS_REFRESH_EVENT,
} from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { useLanguage } from '@/localization/language-context';

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}

export function Stats() {
  const latestLoadRequestRef = useRef(0);
  const { language } = useLanguage();
  const t = useMemo(
    () =>
      language === 'cs'
        ? {
            totalContacts: 'Celkem leadů',
            activeDeals: 'V pipeline',
            pipelineValue: 'Vyhráno',
            companies: 'Firmy',
            settings: 'Nastavení',
            addAlert: 'Přidat upozornění',
            pinToDashboard: 'Připnout na dashboard',
            share: 'Sdílet',
            remove: 'Odebrat',
            vsLastMonth: 'Oproti minulému měsíci:',
          }
        : {
            totalContacts: 'Total Leads',
            activeDeals: 'In Pipeline',
            pipelineValue: 'Won Deals',
            companies: 'Companies',
            settings: 'Settings',
            addAlert: 'Add Alert',
            pinToDashboard: 'Pin to Dashboard',
            share: 'Share',
            remove: 'Remove',
            vsLastMonth: 'Vs last month:',
          },
    [language],
  );

  const [dashboardTotals, setDashboardTotals] = useState({
    totalContacts: 0,
    totalDeals: 0,
    inPipeline: 0,
    wonDeals: 0,
    revenue: 0,
    companies: 0,
  });

  const loadStats = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const [dashboard, companies] = await Promise.all([
        fetchDashboard(),
        fetchCompanies({ limit: 1 }),
      ]);

      if (requestId !== latestLoadRequestRef.current) return;

      const byStage = dashboard?.dealsByStage ?? {};
      const inPipeline =
        (byStage['new'] ?? 0) +
        (byStage['qualified'] ?? 0) +
        (byStage['proposal'] ?? 0) +
        (byStage['negotiation'] ?? 0);

      setDashboardTotals({
        totalContacts: dashboard?.totalContacts ?? 0,
        totalDeals: dashboard?.totalDeals ?? 0,
        inPipeline,
        wonDeals: byStage['won'] ?? 0,
        revenue: dashboard?.revenue ?? 0,
        companies: companies?.meta?.total ?? companies?.data?.length ?? 0,
      });
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-dashboard-stats',
        message: error instanceof Error ? error.message : 'Failed to load dashboard stats',
        meta: { operation: 'load_dashboard_stats' },
      });
      // keep zeros on error
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    const onRefresh = () => { void loadStats(); };
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    window.addEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    window.addEventListener(CRM_COMPANIES_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
      window.removeEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
      window.removeEventListener(CRM_COMPANIES_REFRESH_EVENT, onRefresh);
    };
  }, [loadStats]);

  const stats = useMemo(
    () => [
      {
        title: t.totalContacts,
        value: dashboardTotals.totalContacts,
        delta: 0,
        lastMonth: dashboardTotals.totalContacts,
        positive: true,
        prefix: '',
        suffix: '',
      },
      {
        title: t.activeDeals,
        value: dashboardTotals.inPipeline,
        delta: 0,
        lastMonth: dashboardTotals.inPipeline,
        positive: true,
        prefix: '',
        suffix: '',
      },
      {
        title: t.pipelineValue,
        value: dashboardTotals.wonDeals,
        delta: 0,
        lastMonth: dashboardTotals.wonDeals,
        positive: true,
        prefix: '',
        suffix: '',
      },
      {
        title: t.companies,
        value: dashboardTotals.companies,
        delta: 0,
        lastMonth: dashboardTotals.companies,
        positive: true,
        prefix: '',
        suffix: '',
      },
    ],
    [dashboardTotals, t],
  );

  return (
    <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="border-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {stat.title}
            </CardTitle>
            <CardToolbar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="dim"
                    size="sm"
                    mode="icon"
                    className="-me-1.5"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                  <DropdownMenuItem>
                    <Settings />
                    {t.settings}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TriangleAlert /> {t.addAlert}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pin /> {t.pinToDashboard}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 /> {t.share}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <Trash />
                    {t.remove}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardToolbar>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-medium text-foreground tracking-tight">
                {stat.format
                  ? stat.format(stat.value)
                  : stat.prefix + formatNumber(stat.value) + stat.suffix}
              </span>
              <Badge
                variant={stat.positive ? 'success' : 'destructive'}
                appearance="light"
              >
                {stat.delta > 0 ? <ArrowUp /> : <ArrowDown />}
                {stat.delta}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2 border-t pt-2.5">
              {t.vsLastMonth}{' '}
              <span className="font-medium text-foreground">
                {stat.lastFormat
                  ? stat.lastFormat(stat.lastMonth)
                  : stat.prefix + formatNumber(stat.lastMonth) + stat.suffix}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
