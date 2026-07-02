'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KanbanSquare } from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '@/crm/services/backend';
import { CRM_DEALS_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const STAGE_LABELS: Record<string, string> = {
  new: 'Nový lead',
  qualified: 'Osloven',
  proposal: 'Zájem',
  negotiation: 'Jednání',
  won: 'Vyhráno',
  lost: 'Zrušeno',
};

const STAGE_COLORS: Record<string, string> = {
  new: '#94a3b8',
  qualified: '#38bdf8',
  proposal: '#a78bfa',
  negotiation: '#fb923c',
  won: '#34d399',
  lost: '#f87171',
};

const STAGE_ORDER = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { stage: string; fill: string } }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
        <p className="font-medium">{label}</p>
        <p>{payload[0].value} dealů</p>
      </div>
    );
  }
  return null;
}

export function PipelineFunnel() {
  const latestLoadRequestRef = useRef(0);
  const [data, setData] = useState<{ stage: string; label: string; count: number; fill: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFunnel = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    try {
      const dashboard = await fetchDashboard();
      if (requestId !== latestLoadRequestRef.current) return;
      const byStage = dashboard?.dealsByStage ?? {};
      const chartData = STAGE_ORDER.map((stage) => ({
        stage,
        label: STAGE_LABELS[stage] ?? stage,
        count: byStage[stage] ?? 0,
        fill: STAGE_COLORS[stage] ?? '#6b7280',
      }));
      setData(chartData);
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-dashboard-pipeline-funnel',
        message: error instanceof Error ? error.message : 'Failed to load pipeline funnel',
        meta: { operation: 'fetch_dashboard' },
      });
      setData([]);
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFunnel();
  }, [loadFunnel]);

  useEffect(() => {
    const onRefresh = () => { void loadFunnel(); };
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    };
  }, [loadFunnel]);

  return (
    <Card className="h-full">
      <CardHeader className="border-0 pb-1">
        <CardHeading className="flex items-center gap-2.5 space-y-0">
          <div className="flex items-center justify-center size-10 rounded-full bg-muted/80">
            <KanbanSquare className="size-5" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <CardTitle className="text-base font-semibold leading-none">Pipeline</CardTitle>
            <p className="text-sm text-muted-foreground">Rozložení dealů podle fáze</p>
          </div>
        </CardHeading>
        <CardToolbar>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/core/crm/pipeline">Zobrazit →</Link>
          </Button>
        </CardToolbar>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
            Načítám...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.stage} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
