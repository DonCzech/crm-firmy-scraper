import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Coins, Target } from 'lucide-react';
import { fetchContacts, fetchDeals, fetchTasks } from '@/crm/services/backend';
import {
  CRM_CONTACTS_REFRESH_EVENT,
  CRM_DEALS_REFRESH_EVENT,
  CRM_TASKS_REFRESH_EVENT,
} from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { DealsOverview } from '@/crm/pages/dashboard/deals-overview';
import { LeadAnalytics } from '@/crm/pages/dashboard/lead-analytics';
import { RecentDeals } from '@/crm/pages/dashboard/recent-deals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AiNextBestActionWidget } from './ai-next-best-action';

export function CrmLeadsKpiWidget() {
  const [count, setCount] = useState(0);
  const loadCount = useCallback(() => {
    fetchContacts({ limit: 1000, contactType: 'lead' })
      .then((r) => setCount(r?.meta?.total ?? r?.data?.length ?? 0))
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-crm-widget',
          message: error instanceof Error ? error.message : 'Failed to load leads KPI',
          meta: { operation: 'fetch_contacts_leads_kpi' },
        });
        setCount(0);
      });
  }, []);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  useEffect(() => {
    const onRefresh = () => loadCount();
    window.addEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    };
  }, [loadCount]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Target className="size-4" /> Leady celkem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-semibold">{count.toLocaleString('cs-CZ')}</div>
      </CardContent>
    </Card>
  );
}

export function CrmNextBestActionWidget() {
  return <AiNextBestActionWidget />;
}

export function CrmPipelineKpiWidget() {
  const [count, setCount] = useState(0);
  const loadCount = useCallback(() => {
    fetchDeals({ limit: 1000 })
      .then((r) => {
        const items = r?.data ?? [];
        setCount(items.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length);
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-crm-widget',
          message: error instanceof Error ? error.message : 'Failed to load pipeline KPI',
          meta: { operation: 'fetch_deals_pipeline_kpi' },
        });
        setCount(0);
      });
  }, []);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  useEffect(() => {
    const onRefresh = () => loadCount();
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    };
  }, [loadCount]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Activity className="size-4" /> V pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-semibold">{count.toLocaleString('cs-CZ')}</div>
      </CardContent>
    </Card>
  );
}

export function CrmRevenueKpiWidget() {
  const [revenue, setRevenue] = useState(0);
  const loadRevenue = useCallback(() => {
    fetchDeals({ limit: 1000 })
      .then((r) => {
        const won = (r?.data ?? []).filter((d) => d.stage === 'won');
        setRevenue(won.reduce((sum, d) => sum + (d.value ?? 0), 0));
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-crm-widget',
          message: error instanceof Error ? error.message : 'Failed to load revenue KPI',
          meta: { operation: 'fetch_deals_revenue_kpi' },
        });
        setRevenue(0);
      });
  }, []);

  useEffect(() => {
    loadRevenue();
  }, [loadRevenue]);

  useEffect(() => {
    const onRefresh = () => loadRevenue();
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    };
  }, [loadRevenue]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Coins className="size-4" /> Vyhráno</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-semibold">
          {revenue.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
        </div>
      </CardContent>
    </Card>
  );
}

export function CrmTasksKpiWidget() {
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const loadTasks = useCallback(() => {
    fetchTasks({ limit: 1000 })
      .then((r) => {
        const tasks = r?.data ?? [];
        setTotal(tasks.length);
        setDone(tasks.filter((t) => t.status === 'done').length);
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-crm-widget',
          message: error instanceof Error ? error.message : 'Failed to load tasks KPI',
          meta: { operation: 'fetch_tasks_done_kpi' },
        });
        setDone(0);
        setTotal(0);
      });
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const onRefresh = () => loadTasks();
    window.addEventListener(CRM_TASKS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_TASKS_REFRESH_EVENT, onRefresh);
    };
  }, [loadTasks]);
  const pct = useMemo(() => (total > 0 ? Math.round((done / total) * 100) : 0), [done, total]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="size-4" /> Úkoly dokončeno</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-semibold">{done}/{total}</div>
        <div className="text-xs text-muted-foreground">{pct}%</div>
      </CardContent>
    </Card>
  );
}

export function CrmDealsOverviewWidget() {
  return <DealsOverview />;
}

export function CrmLeadAnalyticsWidget() {
  return <LeadAnalytics />;
}

export function CrmRecentDealsWidget() {
  return <RecentDeals />;
}
