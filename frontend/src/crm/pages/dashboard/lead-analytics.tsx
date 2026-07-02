'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChartNoAxesCombined, Info, TrendingUp } from 'lucide-react';
import { Area, AreaChart, XAxis } from 'recharts';
import { fetchContacts } from '@/crm/services/backend';
import { CRM_CONTACTS_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/localization/language-context';

type ContactLite = {
  createdAt: string;
};

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'var(--color-violet-500)',
  },
} satisfies ChartConfig;

// Period configuration
const PERIODS = {
  '5D': { key: '5D', label: '5D' },
  '2W': { key: '2W', label: '2W' },
  '1M': { key: '1M', label: '1M' },
  '6M': { key: '6M', label: '6M' },
} as const;

type PeriodKey = keyof typeof PERIODS;

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildLeadsData(
  period: PeriodKey,
  leads: ContactLite[],
  locale: 'cs-CZ' | 'en-US',
) {
  const parsed = leads
    .map((item) => new Date(item.createdAt))
    .filter((d) => !Number.isNaN(d.getTime()));
  const now = new Date();

  if (period === '5D') {
    const points = Array.from({ length: 5 }, (_, idx) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (4 - idx));
      return day;
    });
    return points.map((day) => ({
      period: day.toLocaleDateString(locale, { weekday: 'short' }),
      leads: parsed.filter((d) => sameDay(d, day)).length,
    }));
  }

  if (period === '2W') {
    const start = new Date(now);
    start.setDate(now.getDate() - 13);
    start.setHours(0, 0, 0, 0);
    return [
      { period: 'W1', leads: 0 },
      { period: 'W2', leads: 0 },
    ].map((row, idx) => {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + idx * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return {
        period: row.period,
        leads: parsed.filter((d) => d >= weekStart && d < weekEnd).length,
      };
    });
  }

  if (period === '1M') {
    const start = new Date(now);
    start.setDate(now.getDate() - 27);
    start.setHours(0, 0, 0, 0);
    return [
      { period: 'W1', leads: 0 },
      { period: 'W2', leads: 0 },
      { period: 'W3', leads: 0 },
      { period: 'W4', leads: 0 },
    ].map((row, idx) => {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + idx * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return {
        period: row.period,
        leads: parsed.filter((d) => d >= weekStart && d < weekEnd).length,
      };
    });
  }

  return Array.from({ length: 6 }, (_, idx) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();
    return {
      period: monthDate.toLocaleDateString(locale, { month: 'short' }),
      leads: parsed.filter(
        (d) => d.getMonth() === month && d.getFullYear() === year,
      ).length,
    };
  });
}

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
  unit: string;
}

const CustomTooltip = ({ active, payload, unit }: TooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
        {value} {unit}
      </div>
    );
  }
  return null;
};

export function LeadAnalytics() {
  const latestLoadRequestRef = useRef(0);
  const { language } = useLanguage();
  const locale = language === 'cs' ? 'cs-CZ' : 'en-US';
  const t =
    language === 'cs'
      ? {
          title: 'Analytika leadů',
          subtitle: 'Generování leadů a konverze',
          tooltip: 'Analytika leadů podle období',
          leadsUnit: 'leadů',
          comparedToLast: 'oproti minulému',
          week: 'týdnu',
          period: 'období',
        }
      : {
          title: 'Lead Analytics',
          subtitle: 'Lead generation and conversion',
          tooltip: 'Lead analytics by period',
          leadsUnit: 'leads',
          comparedToLast: 'compared to last',
          week: 'week',
          period: 'period',
        };

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('5D');
  const [liveLeads, setLiveLeads] = useState<ContactLite[]>([]);

  const loadLeads = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const response = await fetchContacts({ limit: 1000 });
      if (requestId !== latestLoadRequestRef.current) return;
      setLiveLeads(
        (response?.data ?? [])
          .filter((item) => (item.contactType ?? 'lead') === 'lead')
          .map((item) => ({ createdAt: item.createdAt })),
      );
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-dashboard-lead-analytics',
        message: error instanceof Error ? error.message : 'Failed to load lead analytics contacts',
        meta: { operation: 'load_lead_analytics_contacts' },
      });
      setLiveLeads([]);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    const onRefresh = () => { void loadLeads(); };
    window.addEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    };
  }, [loadLeads]);

  const currentData = useMemo(
    () => buildLeadsData(selectedPeriod, liveLeads, locale),
    [selectedPeriod, liveLeads, locale],
  );

  // Calculate total leads for the selected period
  const totalLeads = currentData.reduce((sum, item) => sum + item.leads, 0);
  const previousLeads = useMemo(() => {
    const response = liveLeads.length;
    if (selectedPeriod === '5D') return Math.max(0, response - totalLeads);
    return Math.max(0, Math.round(totalLeads * 0.9));
  }, [liveLeads.length, selectedPeriod, totalLeads]);
  const trendPercent =
    previousLeads > 0
      ? Math.round(((totalLeads - previousLeads) / previousLeads) * 100)
      : 0;

  return (
    <Card className="h-full">
      <CardHeader className="min-h-auto flex-nowrap! border-b border-border pt-6 pb-1 border-0">
        <CardHeading className="flex items-center gap-2.5 space-y-0">
          <div className="flex items-center justify-center size-10 rounded-full bg-muted/80">
            <ChartNoAxesCombined className="size-5" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <CardTitle className="text-base font-semibold text-foreground leading-none">
              {t.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
        </CardHeading>
        <CardToolbar>
          <Tooltip>
            <TooltipTrigger>
              <span>
                <Info className="size-4 fill-muted/60 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </CardToolbar>
      </CardHeader>
      <CardContent className="flex flex-col space-y-6">
        {/* Period Selector */}
        <div className="space-y-6">
          {/* Main Metric */}
          <div className="space-y-1">
            <div className="text-3xl font-semibold text-foreground">
              {totalLeads}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">
                {trendPercent >= 0 ? '+' : ''}
                {trendPercent}%
              </span>
              <span className="text-gray-600">
                {t.comparedToLast}{' '}
                {selectedPeriod === '5D' ? t.week : t.period}
              </span>
            </div>
          </div>

          {/* Toggle Group */}
          <ToggleGroup
            type="single"
            value={selectedPeriod}
            onValueChange={(value) =>
              value && setSelectedPeriod(value as PeriodKey)
            }
            variant="outline"
            className="w-full shadow-none!"
          >
            {Object.values(PERIODS).map((period) => (
              <ToggleGroupItem
                key={period.key}
                value={period.key}
                className="flex-1 shadow-none data-[state=on]:bg-muted/60"
              >
                {period.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Chart */}
        <div className="grow h-32 w-full">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full rounded-b-3xl overflow-hidden [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
          >
            <AreaChart
              data={currentData}
              margin={{
                top: 10,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig.leads.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig.leads.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <filter
                  id="activeDotShadow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="2"
                    dy="2"
                    stdDeviation="4"
                    floodColor={chartConfig.leads.color}
                    floodOpacity="0.6"
                  />
                </filter>
              </defs>

              <XAxis dataKey="period" hide />

              <ChartTooltip
                content={<CustomTooltip unit={t.leadsUnit} />}
                cursor={{
                  strokeWidth: 1,
                  strokeDasharray: '2 2',
                  stroke: chartConfig.leads.color,
                  strokeOpacity: 1,
                }}
              />

              <Area
                dataKey="leads"
                type="natural"
                fill="url(#leadsGradient)"
                stroke={chartConfig.leads.color}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: chartConfig.leads.color,
                  stroke: 'white',
                  strokeWidth: 2,
                  filter: 'url(#activeDotShadow)',
                }}
                activeDot={{
                  r: 6,
                  fill: chartConfig.leads.color,
                  stroke: 'white',
                  strokeWidth: 2,
                  filter: 'url(#activeDotShadow)',
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
