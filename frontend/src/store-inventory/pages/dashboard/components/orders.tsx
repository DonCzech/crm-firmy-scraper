'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { fetchOrders } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

interface IOrdersProps {
  className?: string;
}

type OrdersTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

function groupByPeriod(orders: Array<{ orderDate: string; total: number }>, period: string) {
  const now = new Date();

  if (period === '1H') {
    return Array.from({ length: 9 }, (_, h) => ({
      name: `${h.toString().padStart(2, '0')}:00`,
      value: orders.filter(o => {
        const d = new Date(o.orderDate);
        return d.toDateString() === now.toDateString() && d.getHours() === h;
      }).reduce((s, o) => s + o.total, 0),
    }));
  }
  if (period === '1D') {
    const labels = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    return labels.map((label, idx) => {
      const day = new Date(weekStart); day.setDate(weekStart.getDate() + idx);
      const next = new Date(day); next.setDate(day.getDate() + 1);
      return { name: label, value: orders.filter(o => { const d = new Date(o.orderDate); return d >= day && d < next; }).reduce((s, o) => s + o.total, 0) };
    });
  }
  if (period === '14D') {
    return Array.from({ length: 14 }, (_, i) => {
      const day = new Date(now); day.setDate(now.getDate() - (13 - i)); day.setHours(0, 0, 0, 0);
      const next = new Date(day); next.setDate(day.getDate() + 1);
      return { name: day.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }), value: orders.filter(o => { const d = new Date(o.orderDate); return d >= day && d < next; }).reduce((s, o) => s + o.total, 0) };
    });
  }
  if (period === '1M') {
    const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
    return months.map((label, idx) => ({ name: label, value: orders.filter(o => { const d = new Date(o.orderDate); return d.getMonth() === idx && d.getFullYear() === now.getFullYear(); }).reduce((s, o) => s + o.total, 0) }));
  }
  // 3M, 1Y, All — quarterly
  return ['Q1', 'Q2', 'Q3', 'Q4'].map((label, idx) => ({ name: label, value: orders.filter(o => { const d = new Date(o.orderDate); return Math.floor(d.getMonth() / 3) === idx && d.getFullYear() === now.getFullYear(); }).reduce((s, o) => s + o.total, 0) }));
}

const Orders = ({ className }: IOrdersProps) => {
  const [activePeriod, setActivePeriod] = useState('14D');
  const [allOrders, setAllOrders] = useState<Array<{ orderDate: string; total: number }>>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders({ limit: 500 })
      .then(res => {
        const data = res?.data ?? [];
        const mapped = data.map(o => ({ orderDate: o.orderDate, total: o.total ?? 0 }));
        setAllOrders(mapped);
        setTotalRevenue(mapped.reduce((s, o) => s + o.total, 0));
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-orders',
          message: error instanceof Error ? error.message : 'Failed to load orders widget data',
          meta: { operation: 'fetch_orders_widget' },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = groupByPeriod(allOrders, activePeriod);

  const customTooltip = ({ active, payload, label }: OrdersTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="flex flex-col gap-2 p-3.5 bg-background border border-border rounded-lg shadow-lg">
          <div className="font-medium text-sm text-secondary-foreground">{label}</div>
          <div className="font-semibold text-base">{(payload[0].value as number).toLocaleString('cs-CZ')} Kč</div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Objednávky</CardTitle>
        <Button mode="link" underline="solid" asChild>
          <Link to="/core/crm/orders">Vše</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-2 p-0 lg:pt-7.5 pt-5">
        <div>
          <ToggleGroup type="single" variant="outline" value={activePeriod} onValueChange={(v) => { if (v) setActivePeriod(v); }} className="grid grid-cols-7 mb-6 mx-5 lg:mx-7.5">
            {['1H', '1D', '14D', '1M', '3M', '1Y', 'All'].map((p) => (
              <ToggleGroupItem className="h-[28px]" key={p} value={p}>{p}</ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="flex items-center gap-2.5 px-5 lg:px-7.5 mb-1.5">
            {loading ? (
              <div className="h-9 w-36 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <span className="text-3xl font-semibold text-foreground">
                  {totalRevenue.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                </span>
                <Badge size="sm" variant="success" appearance="light">celkem</Badge>
              </>
            )}
          </div>
        </div>
        <div className="h-48 w-full px-0 mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <defs>
                <linearGradient id="orderGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="var(--border)" horizontal={true} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)', textAnchor: 'middle' }} />
              <YAxis hide domain={[0, 'dataMax + 100']} />
              <Tooltip content={customTooltip} />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#orderGradient2)" strokeWidth={3} dot={false}
                activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export { Orders, type IOrdersProps };
