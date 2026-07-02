'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchDeals, fetchTasks } from '@/crm/services/backend';
import { CRM_DEALS_REFRESH_EVENT, CRM_TASKS_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';

export function SalesActivity() {
  const [stats, setStats] = useState({ closed: 0, revenue: 0, conversion: 0, pipelineProgress: 0 });
  const [activity, setActivity] = useState<Array<{ text: string; date: string; color: string }>>([]);

  useEffect(() => {
    const load = () => Promise.all([fetchDeals({ limit: 500 }), fetchTasks({ limit: 500 })])
      .then(([dealsRes, tasksRes]) => {
        const deals = dealsRes?.data ?? [];
        const tasks = tasksRes?.data ?? [];

        const closed = deals.filter(d => d.stage === 'won').length;
        const total = deals.length;
        const revenue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + (d.value ?? 0), 0);
        const conversion = total > 0 ? Math.round((closed / total) * 100) : 0;
        const active = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
        const pipelineProgress = total > 0 ? Math.round(((closed + active * 0.5) / total) * 100) : 0;

        setStats({ closed, revenue, conversion, pipelineProgress });

        // Build activity from recent deals + tasks
        const recentActivity: Array<{ text: string; date: string; color: string }> = [];
        const wonDeals = deals.filter(d => d.stage === 'won').slice(0, 2);
        for (const d of wonDeals) {
          const daysAgo = Math.round((Date.now() - new Date(d.updatedAt ?? d.createdAt).getTime()) / 86400000);
          recentActivity.push({
            text: `Uzavřen deal: ${d.title}`,
            date: daysAgo === 0 ? 'Dnes' : daysAgo === 1 ? 'Včera' : `Před ${daysAgo}d`,
            color: 'text-green-500',
          });
        }
        const doneTasks = tasks.filter(t => t.status === 'done').slice(0, 1);
        for (const t of doneTasks) {
          const daysAgo = Math.round((Date.now() - new Date(t.updatedAt ?? t.dueDate ?? t.createdAt).getTime()) / 86400000);
          recentActivity.push({
            text: `Splněn úkol: ${t.title}`,
            date: daysAgo === 0 ? 'Dnes' : daysAgo === 1 ? 'Včera' : `Před ${daysAgo}d`,
            color: 'text-blue-500',
          });
        }
        setActivity(recentActivity.slice(0, 3));
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-sales-activity',
          message: error instanceof Error ? error.message : 'Failed to load sales activity',
          meta: { operation: 'fetch_deals_tasks_for_activity' },
        });
      });
    void load();
    const onRefresh = () => { void load(); };
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    window.addEventListener(CRM_TASKS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
      window.removeEventListener(CRM_TASKS_REFRESH_EVENT, onRefresh);
    };
  }, []);

  const performance = [
    { label: 'Uzavřené', value: stats.closed.toString(), trend: 0, trendDir: 'up' as const },
    { label: 'Revenue', value: stats.revenue > 0 ? `${(stats.revenue / 1000).toFixed(0)}k` : '0', trend: 0, trendDir: 'up' as const },
    { label: 'Konverze', value: `${stats.conversion}%`, trend: 0, trendDir: stats.conversion >= 30 ? 'up' as const : 'down' as const },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Výkon obchodů</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Performance */}
        <div>
          <div className="font-medium text-sm mb-2.5 text-muted-foreground">Celkový přehled</div>
          <div className="grid grid-cols-3 gap-2">
            {performance.map((item) => (
              <div className="flex flex-col items-start justify-start" key={item.label}>
                <div className="text-xl font-bold text-foreground">{item.value}</div>
                <div className="text-xs text-muted-foreground font-medium mb-1">{item.label}</div>
                <span className={cn('flex items-center gap-0.5 text-xs font-semibold', item.trendDir === 'up' ? 'text-green-500' : 'text-destructive')}>
                  {item.trendDir === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Pipeline */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-medium text-foreground">Pipeline Progress</span>
            <span className="text-xs font-semibold text-foreground">{stats.pipelineProgress}%</span>
          </div>
          <Progress value={stats.pipelineProgress} className="bg-muted" indicatorClassName="bg-blue-500" />
        </div>

        <Separator />

        {/* Recent Activity */}
        <div>
          <div className="font-medium text-sm text-foreground mb-2.5">Nedávná aktivita</div>
          {activity.length === 0 ? (
            <p className="text-xs text-muted-foreground">Žádná nedávná aktivita.</p>
          ) : (
            <ul className="space-y-2">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className={cn('w-3.5 h-3.5 shrink-0', a.color)} />
                    <span className="text-xs text-foreground truncate">{a.text}</span>
                  </span>
                  <Badge variant="secondary" size="sm" className="shrink-0">{a.date}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
