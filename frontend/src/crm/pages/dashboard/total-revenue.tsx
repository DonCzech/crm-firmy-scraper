import { BarChart2, MoreHorizontal } from 'lucide-react';
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
import { fetchDashboard, fetchDeals } from '@/crm/services/backend';
import { CRM_DEALS_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { useLanguage } from '@/localization/language-context';

export function TotalRevenue() {
  const latestLoadRequestRef = useRef(0);
  const { language } = useLanguage();
  const moneyLocale = 'cs-CZ';
  const t =
    language === 'cs'
      ? {
          title: 'Výnos pipeline',
          settings: 'Nastavení',
          exportData: 'Exportovat data',
          pinToDashboard: 'Připnout na dashboard',
          remove: 'Odebrat',
          currency: 'CZK',
          increasedFromLastMonth: 'nárůst oproti minulému měsíci',
          avgDealValue: 'Průměrná hodnota obchodu:',
          activeDeals: 'Aktivní obchody:',
        }
      : {
          title: 'Pipeline Revenue',
          settings: 'Settings',
          exportData: 'Export Data',
          pinToDashboard: 'Pin to Dashboard',
          remove: 'Remove',
          currency: 'CZK',
          increasedFromLastMonth: 'increased from last month',
          avgDealValue: 'Avg. Deal Value:',
          activeDeals: 'Active Deals:',
        };

  const [revenue, setRevenue] = useState(0);
  const [activeDeals, setActiveDeals] = useState(0);

  const loadMetrics = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const [dashboard, deals] = await Promise.all([
        fetchDashboard(),
        fetchDeals({ limit: 500 }),
      ]);

      if (requestId !== latestLoadRequestRef.current) return;

      const active = (deals?.data ?? []).filter(
        (deal) => deal.stage !== 'won' && deal.stage !== 'lost',
      ).length;

      setRevenue(dashboard?.revenue ?? 0);
      setActiveDeals(active);
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-dashboard-total-revenue',
        message: error instanceof Error ? error.message : 'Failed to load total revenue metrics',
        meta: { operation: 'load_total_revenue_metrics' },
      });
      setRevenue(0);
      setActiveDeals(0);
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    const onRefresh = () => { void loadMetrics(); };
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    };
  }, [loadMetrics]);

  const avgDealValue = useMemo(() => {
    if (!activeDeals) return 0;
    return Math.round(revenue / activeDeals);
  }, [activeDeals, revenue]);

  return (
    <Card className="">
      <CardHeader className="border-0 py-6 min-h-auto">
        <CardTitle className="inline-flex items-center gap-2">
          <BarChart2 className="size-8 text-primary" />
          {t.title}
        </CardTitle>
        <CardToolbar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="dim" size="sm" mode="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem>{t.settings}</DropdownMenuItem>
              <DropdownMenuItem>{t.exportData}</DropdownMenuItem>
              <DropdownMenuItem>{t.pinToDashboard}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">{t.remove}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardToolbar>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-3.5">
        <div className="space-y-3.5">
          {/* Revenue */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-3xl font-bold text-foreground tracking-tight">
              {new Intl.NumberFormat(moneyLocale, {
                style: 'currency',
                currency: 'CZK',
                maximumFractionDigits: 0,
              }).format(revenue)}
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-none">
              {t.currency}
            </span>
          </div>

          {/* Revenue trend */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="success" appearance="light">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="inline-block"
              >
                <path
                  d="M3 5.5L7 9.5L11 5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              +8.7%
            </Badge>
            <span className="text-sm text-muted-foreground">
              {t.increasedFromLastMonth}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="p-2.5 bg-muted/60 flex items-center justify-between rounded-lg">
            <span className="text-sm text-accent-foreground">
              {t.avgDealValue}
            </span>
              <span className="text-base font-semibold text-foreground">
                {new Intl.NumberFormat(moneyLocale, {
                  style: 'currency',
                  currency: 'CZK',
                  maximumFractionDigits: 0,
                }).format(avgDealValue)}
              </span>
          </div>
          <div className="p-2.5 bg-muted/60 flex items-center justify-between rounded-lg">
            <span className="text-sm text-accent-foreground">
              {t.activeDeals}
            </span>
            <span className="text-base font-semibold text-foreground">
              {activeDeals}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
