'use client';

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { fetchDeals } from '@/crm/services/backend';
import { CRM_DEALS_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useLanguage } from '@/localization/language-context';

type BackendDealLite = {
  createdAt: string;
  stage?: string;
  value?: number;
};

const chartConfig = {
  deals: {
    label: 'Deals',
    color: 'var(--color-emerald-600)',
  },
} satisfies ChartConfig;

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
  dealsLabel: string;
  dealsUnit: string;
}

const CustomTooltip = ({ active, payload, dealsLabel, dealsUnit }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-zinc-900 text-white p-3 shadow-lg">
        <div className="text-xs font-medium mb-1">{dealsLabel}</div>
        <div className="text-sm font-semibold">
          {payload[0].value} {dealsUnit}
        </div>
      </div>
    );
  }
  return null;
};

// Period configuration
const PERIODS = {
  day: { key: 'day', label: 'Day' },
  week: { key: 'week', label: 'Week' },
  month: { key: 'month', label: 'Month' },
  year: { key: 'year', label: 'Year' },
} as const;

type PeriodKey = keyof typeof PERIODS;

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toChartData(period: PeriodKey, deals: BackendDealLite[], language: 'cs' | 'en') {
  const now = new Date();
  const parsed = deals
    .map((item) => ({
      createdAt: new Date(item.createdAt),
      stage: item.stage ?? '',
    }))
    .filter((item) => !Number.isNaN(item.createdAt.getTime()));

  if (period === 'day') {
    const bins = [0, 4, 8, 12, 16, 20];
    const today = parsed.filter((item) => sameDay(item.createdAt, now));
    return bins.map((startHour) => ({
      period: formatHour(startHour),
      deals: today.filter((item) => {
        const hour = item.createdAt.getHours();
        return hour >= startHour && hour < startHour + 4;
      }).length,
    }));
  }

  if (period === 'week') {
    const labels = language === 'cs'
      ? ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekStart = startOfWeek(now);
    return labels.map((label, idx) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + idx);
      return {
        period: label,
        deals: parsed.filter((item) => sameDay(item.createdAt, day)).length,
      };
    });
  }

  if (period === 'month') {
    const start = new Date(now);
    start.setDate(now.getDate() - 27);
    start.setHours(0, 0, 0, 0);
    const inWindow = parsed.filter((item) => item.createdAt >= start);
    return [
      { period: language === 'cs' ? 'Týden 1' : 'Week 1', deals: 0 },
      { period: language === 'cs' ? 'Týden 2' : 'Week 2', deals: 0 },
      { period: language === 'cs' ? 'Týden 3' : 'Week 3', deals: 0 },
      { period: language === 'cs' ? 'Týden 4' : 'Week 4', deals: 0 },
    ].map((row, idx) => {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + idx * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return {
        period: row.period,
        deals: inWindow.filter(
          (item) => item.createdAt >= weekStart && item.createdAt < weekEnd,
        ).length,
      };
    });
  }

  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
  return quarterLabels.map((label, idx) => {
    const quarterStartMonth = idx * 3;
    return {
      period: label,
      deals: parsed.filter(
        (item) =>
          item.createdAt.getFullYear() === now.getFullYear() &&
          item.createdAt.getMonth() >= quarterStartMonth &&
          item.createdAt.getMonth() < quarterStartMonth + 3,
      ).length,
    };
  });
}

export function DealsOverview() {
  const latestLoadRequestRef = useRef(0);
  const { language } = useLanguage();
  const t = useMemo(
    () =>
      language === 'cs'
        ? {
            title: 'Přehled obchodů',
            dealsLabel: 'Obchody:',
            dealsUnit: 'obchodů',
            day: 'Den',
            week: 'Týden',
            month: 'Měsíc',
            year: 'Rok',
            closedDeals: 'Uzavřené obchody',
            pipelineValue: 'Hodnota pipeline',
            conversionRate: 'Míra konverze',
            total: 'celkem',
            bucket: 'koš',
          }
        : {
            title: 'Deals Overview',
            dealsLabel: 'Deals:',
            dealsUnit: 'deals',
            day: 'Day',
            week: 'Week',
            month: 'Month',
            year: 'Year',
            closedDeals: 'Closed Deals',
            pipelineValue: 'Pipeline Value',
            conversionRate: 'Conversion Rate',
            total: 'total',
            bucket: 'bucket',
          },
    [language],
  );

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('day');
  const [backendDeals, setBackendDeals] = useState<BackendDealLite[]>([]);

  const loadDeals = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const response = await fetchDeals({ limit: 1000 });
      if (requestId !== latestLoadRequestRef.current) return;
      setBackendDeals(
        (response?.data ?? []).map((item) => ({
          createdAt: item.createdAt,
          stage: item.stage ?? '',
          value: item.value ?? 0,
        })),
      );
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-dashboard-deals-overview',
        message: error instanceof Error ? error.message : 'Failed to load deals overview data',
        meta: { operation: 'load_deals_overview' },
      });
      setBackendDeals([]);
    }
  }, []);

  useEffect(() => {
    void loadDeals();
  }, [loadDeals]);

  useEffect(() => {
    const onRefresh = () => { void loadDeals(); };
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    };
  }, [loadDeals]);

  const currentData = useMemo(
    () => toChartData(selectedPeriod, backendDeals, language),
    [selectedPeriod, backendDeals, language],
  );

  const stats = useMemo(() => {
    const total = backendDeals.length;
    const closed = backendDeals.filter((item) => item.stage === 'won').length;
    const pipelineValue = backendDeals
      .filter((item) => item.stage !== 'won' && item.stage !== 'lost')
      .reduce((sum, item) => sum + (item.value ?? 0), 0);
    const conversion = total > 0 ? Math.round((closed / total) * 100) : 0;
    const periodTotal = currentData.reduce((sum, item) => sum + item.deals, 0);
    const avgPerBucket =
      currentData.length > 0 ? Math.round(periodTotal / currentData.length) : 0;

    return [
      {
        id: 'closed',
        label: t.closedDeals,
        value: closed.toString(),
        change: `${avgPerBucket}/${t.bucket}`,
        changeType: 'positive',
        icon: CheckCircle,
      },
      {
        id: 'pipeline',
        label: t.pipelineValue,
        value:
          language === 'cs'
            ? `${(pipelineValue / 1_000_000).toFixed(1)} mil. Kč`
            : `${(pipelineValue / 1_000_000).toFixed(1)}M CZK`,
        change: `${total} ${t.total}`,
        changeType: 'positive',
        icon: Clock,
      },
      {
        id: 'conversion',
        label: t.conversionRate,
        value: `${conversion}%`,
        change: `${closed}/${total || 0}`,
        changeType: 'positive',
        icon: TrendingUp,
      },
    ] as const;
  }, [backendDeals, currentData, language, t]);

  return (
    <Card className="">
      <CardHeader className="min-h-auto py-6 border-0">
        <CardTitle className="text-xl font-semibold">{t.title}</CardTitle>
        <CardToolbar>
          <ToggleGroup
            type="single"
            value={selectedPeriod}
            variant="outline"
            onValueChange={(value) =>
              value && setSelectedPeriod(value as PeriodKey)
            }
            className=""
          >
            {Object.values(PERIODS).map((period) => (
              <ToggleGroupItem
                key={period.key}
                value={period.key}
                className="px-3.5 first:rounded-s-full! last:rounded-e-full!"
              >
                {period.key === 'day'
                  ? t.day
                  : period.key === 'week'
                    ? t.week
                    : period.key === 'month'
                      ? t.month
                      : t.year}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardToolbar>
      </CardHeader>

      <CardContent className="px-0">
        {/* Statistics Blocks */}
        <div className="flex items-center flex-wrap px-6 gap-10 mb-10">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Fragment key={stat.id}>
                <div className="h-10 w-px bg-border hidden lg:block first:hidden" />
                <div key={stat.id} className="flex items-center gap-3">
                  <div className="flex items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/60 border border-muted-foreground/10">
                        <IconComponent className="w-4.5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-0.5">
                          {stat.label}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {stat.value}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              stat.changeType === 'positive'
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            }`}
                          >
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        {/* Chart */}
        <div className="px-3.5 h-[250px] w-full">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full overflow-visible [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
          >
            <AreaChart
              data={currentData}
              margin={{
                top: 15,
                right: 10,
                left: 10,
                bottom: 15,
              }}
              style={{ overflow: 'visible' }}
            >
              {/* SVG Pattern for chart area */}
              <defs>
                {/* Grid pattern */}
                <pattern
                  id="gridPattern"
                  x="0"
                  y="0"
                  width="20"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="var(--input)"
                    strokeWidth="0.5"
                    strokeOpacity="1"
                  />
                </pattern>

                {/* Area gradient fill */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartConfig.deals.color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartConfig.deals.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>

                {/* Shadow filters for dots */}
                <filter
                  id="dotShadow"
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                >
                  <feDropShadow
                    dx="2"
                    dy="2"
                    stdDeviation="3"
                    floodColor="rgba(0,0,0,0.4)"
                  />
                </filter>
                <filter
                  id="activeDotShadow"
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                >
                  <feDropShadow
                    dx="3"
                    dy="3"
                    stdDeviation="4"
                    floodColor="rgba(0,0,0,0.5)"
                  />
                </filter>
              </defs>

              {/* Background pattern for chart area only */}
              <rect
                x="60px"
                y="-20px"
                width="calc(100% - 75px)"
                height="calc(100% - 10px)"
                fill="url(#gridPattern)"
                style={{ pointerEvents: 'none' }}
              />

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={8}
                interval={0}
                includeHidden={true}
              />

              <YAxis
                hide={true}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value} ${t.dealsUnit}`}
                tickMargin={8}
                domain={[0, 'dataMax']}
                ticks={[0]}
              />

              <ChartTooltip
                content={<CustomTooltip dealsLabel={t.dealsLabel} dealsUnit={t.dealsUnit} />}
                cursor={{
                  stroke: chartConfig.deals.color,
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                }}
              />

              <Area
                type="monotone"
                dataKey="deals"
                stroke={chartConfig.deals.color}
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  // Show dots only for specific periods based on selected time range
                  const showDot =
                    (selectedPeriod === 'day' &&
                      (payload.period === '08:00' ||
                        payload.period === '16:00')) ||
                    (selectedPeriod === 'week' &&
                      (payload.period === (language === 'cs' ? 'Čt' : 'Thu') ||
                        payload.period === (language === 'cs' ? 'So' : 'Sat'))) ||
                    (selectedPeriod === 'month' &&
                      payload.period === (language === 'cs' ? 'Týden 2' : 'Week 2')) ||
                    (selectedPeriod === 'year' && payload.period === 'Q2');

                  if (showDot) {
                    return (
                      <circle
                        key={`dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={chartConfig.deals.color}
                        stroke="white"
                        strokeWidth={2}
                        filter="url(#dotShadow)"
                      />
                    );
                  }
                  return <g key={`dot-${cx}-${cy}`} />; // Return empty group for other points
                }}
                activeDot={{
                  r: 6,
                  fill: chartConfig.deals.color,
                  stroke: 'white',
                  strokeWidth: 2,
                  filter: 'url(#dotShadow)',
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
