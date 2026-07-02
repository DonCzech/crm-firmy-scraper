'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchContacts, fetchOrders } from '@/crm/services/backend';
import { CRM_CONTACTS_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';

type PeriodKey = '7d' | '30d' | '90d' | '12m';

type Point = { period: string; sales: number; views: number };

const PERIODS: Record<PeriodKey, { key: PeriodKey; label: string }> = {
  '7d': { key: '7d', label: 'Last 7 days' },
  '30d': { key: '30d', label: 'Last 30 days' },
  '90d': { key: '90d', label: 'Last 90 days' },
  '12m': { key: '12m', label: 'Last 12 months' },
};

const ChartLabel = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-1 h-3 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-muted-foreground">{label}</span>
  </div>
);

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toSeries(period: PeriodKey, orders: Array<{ orderDate: string; total: number }>, leads: Array<{ createdAt: string }>): Point[] {
  const now = new Date();
  const parsedOrders = orders
    .map((o) => ({ at: new Date(o.orderDate), total: Number(o.total ?? 0) }))
    .filter((o) => !Number.isNaN(o.at.getTime()));
  const parsedLeads = leads
    .map((l) => new Date(l.createdAt))
    .filter((d) => !Number.isNaN(d.getTime()));

  if (period === '7d') {
    return Array.from({ length: 7 }, (_, i) => {
      const day = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i)));
      const next = new Date(day); next.setDate(day.getDate() + 1);
      return {
        period: day.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }),
        sales: parsedOrders.filter((o) => o.at >= day && o.at < next).reduce((s, o) => s + o.total, 0),
        views: parsedLeads.filter((d) => d >= day && d < next).length,
      };
    });
  }

  if (period === '30d') {
    return Array.from({ length: 5 }, (_, i) => {
      const weekStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (34 - i * 7)));
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
      return {
        period: `W${i + 1}`,
        sales: parsedOrders.filter((o) => o.at >= weekStart && o.at < weekEnd).reduce((s, o) => s + o.total, 0),
        views: parsedLeads.filter((d) => d >= weekStart && d < weekEnd).length,
      };
    });
  }

  if (period === '90d') {
    return Array.from({ length: 3 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      return {
        period: monthDate.toLocaleDateString('cs-CZ', { month: 'short' }),
        sales: parsedOrders
          .filter((o) => o.at.getMonth() === month && o.at.getFullYear() === year)
          .reduce((s, o) => s + o.total, 0),
        views: parsedLeads.filter((d) => d.getMonth() === month && d.getFullYear() === year).length,
      };
    });
  }

  return ['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
    return {
      period: q,
      sales: parsedOrders
        .filter((o) => o.at.getFullYear() === now.getFullYear() && Math.floor(o.at.getMonth() / 3) === i)
        .reduce((s, o) => s + o.total, 0),
      views: parsedLeads.filter((d) => d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === i).length,
    };
  });
}

export function ProductStock() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('30d');
  const [orders, setOrders] = useState<Array<{ orderDate: string; total: number }>>([]);
  const [leads, setLeads] = useState<Array<{ createdAt: string }>>([]);

  useEffect(() => {
    const load = () => Promise.all([fetchOrders({ limit: 1000 }), fetchContacts({ limit: 1000 })])
      .then(([ordersRes, contactsRes]) => {
        setOrders((ordersRes?.data ?? []).map((o) => ({ orderDate: o.orderDate, total: o.total ?? 0 })));
        setLeads(
          (contactsRes?.data ?? [])
            .filter((c) => (c.contactType ?? 'lead') === 'lead')
            .map((c) => ({ createdAt: c.createdAt })),
        );
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-product-stock',
          message: error instanceof Error ? error.message : 'Failed to load product stock widget data',
          meta: { operation: 'fetch_orders_contacts_product_stock_widget' },
        });
        setOrders([]);
        setLeads([]);
      });
    void load();
    const onRefresh = () => { void load(); };
    window.addEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    };
  }, []);

  const currentData = useMemo(() => toSeries(selectedPeriod, orders, leads), [selectedPeriod, orders, leads]);

  const totalSales = currentData.reduce((sum, item) => sum + item.sales, 0);
  const totalViews = currentData.reduce((sum, item) => sum + item.views, 0);

  const salesChange = 0;
  const viewsChange = 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          Sales Activity
        </CardTitle>

        <CardToolbar>
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.values(PERIODS).map((period) => (
                <SelectItem key={period.key} value={period.key}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardToolbar>
      </CardHeader>

      <CardContent className="px-2 py-6">
        <div className="flex items-center flex-wrap gap-3.5 md:gap-10 px-5 pt-6 mb-8 text-sm">
          <div className="flex items-center gap-3.5">
            <ChartLabel label="Sales" color="#f59e0b" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalSales.toLocaleString('cs-CZ')} Kč</span>
              <Badge variant={salesChange >= 0 ? 'success' : 'destructive'} appearance="light">
                {salesChange >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {Math.abs(salesChange)}%
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <ChartLabel label="Leads" color="#8b5cf6" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalViews.toLocaleString('cs-CZ')}</span>
              <Badge variant={viewsChange >= 0 ? 'success' : 'destructive'} appearance="light">
                {viewsChange >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {Math.abs(viewsChange)}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={currentData}
              margin={{
                top: 30,
                right: 5,
                left: 5,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 12"
                stroke="hsl(var(--muted))"
                strokeOpacity={1}
                horizontal={true}
                vertical={false}
              />

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={10}
              />

              <YAxis
                yAxisId="sales"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`}
                tickMargin={10}
              />
              <YAxis
                yAxisId="views"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={8}
              />

              <Tooltip />

              <Line
                yAxisId="sales"
                type="linear"
                dataKey="sales"
                stroke="#f59e0b"
                strokeWidth={1}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#f59e0b',
                  strokeWidth: 0,
                }}
              />

              <Line
                yAxisId="views"
                type="linear"
                dataKey="views"
                stroke="#8b5cf6"
                strokeWidth={1}
                strokeDasharray="8 4"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#8b5cf6',
                  strokeWidth: 0,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
