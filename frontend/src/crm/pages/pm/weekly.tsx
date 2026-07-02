import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { PriorityBadge } from './components/pm-badge';
import { PmWeeklyCapacity, currentIsoWeek, isoWeekMonday } from './types';
import { pmFetchProjects, pmFetchWeeklyCapacity, pmUpsertWeeklyCapacity } from '../../services/backend';

function offsetWeek(week: string, delta: number): string {
  const [year, w] = week.split('-W');
  const num = parseInt(w, 10) + delta;
  const y = parseInt(year, 10);
  if (num < 1) return `${y - 1}-W52`;
  if (num > 52) return `${y + 1}-W01`;
  return `${y}-W${String(num).padStart(2, '0')}`;
}

export function PmWeeklyPage() {
  const qc = useQueryClient();
  const [week, setWeek] = useState(currentIsoWeek());

  const {
    data: capacities = [],
    isLoading,
    isError: capacitiesError,
    error: capacitiesErrorValue,
  } = useQuery({
    queryKey: ['pm-weekly', week],
    queryFn: () => pmFetchWeeklyCapacity(week),
    throwOnError: false,
  });

  const {
    data: projects = [],
    isError: projectsError,
    error: projectsErrorValue,
  } = useQuery({
    queryKey: ['pm-projects-simple'],
    queryFn: () => pmFetchProjects(),
    throwOnError: false,
  });

  const upsert = useMutation({
    mutationFn: (data: any) => pmUpsertWeeklyCapacity(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pm-weekly', week] }),
  });

  const toNumber = (value: unknown) => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const allCapacities = (capacities as PmWeeklyCapacity[]).map((c) => ({
    ...c,
    plannedHours: toNumber(c.plannedHours),
    actualHours: toNumber(c.actualHours),
  }));

  const totalPlanned = allCapacities.reduce((s, c) => s + c.plannedHours, 0);
  const totalActual = allCapacities.reduce((s, c) => s + c.actualHours, 0);
  const totalCapacity = 40;

  const hasQueryError = capacitiesError || projectsError;
  const queryErrorMessage = String(
    capacitiesErrorValue instanceof Error
      ? capacitiesErrorValue.message
      : projectsErrorValue instanceof Error
        ? projectsErrorValue.message
        : '',
  );

  const monday = isoWeekMonday(week);
  const weekLabel = monday.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  const existingProjectIds = new Set(allCapacities.map((c) => c.projectId));
  const unallocatedProjects = (projects as any[]).filter((p) => !existingProjectIds.has(p.id) && p.status !== 'Hotovo');

  return (
    <>
      <ContentHeader className="gap-2">
        <h1 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" /> Weekly Capacity
        </h1>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="size-8" onClick={() => setWeek(offsetWeek(week, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <button className="text-sm font-medium hover:text-primary" onClick={() => setWeek(currentIsoWeek())}>
            {week} - {weekLabel}
          </button>
          <Button size="icon" variant="ghost" className="size-8" onClick={() => setWeek(offsetWeek(week, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </ContentHeader>

      <Content className="px-5 pb-6">
        <div className="space-y-4 w-full">
          {hasQueryError && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-red-600">Nepodařilo se načíst PM data.</p>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {queryErrorMessage || 'Zkontroluj backend API na localhost:3001.'}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatBox label="Kapacita" value={`${totalCapacity}h`} sub="8h x 5 dní" />
            <StatBox label="Naplánováno" value={`${totalPlanned.toFixed(1)}h`} sub={`${Math.round((totalPlanned / totalCapacity) * 100)}%`} />
            <StatBox label="Odpracováno" value={`${totalActual.toFixed(1)}h`} sub={`Odchylka ${(totalActual - totalPlanned).toFixed(1)}h`} />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Alokace hodin / projekt</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Projekt</th>
                      <th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground w-28">Plán</th>
                      <th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground w-28">Skutečnost</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Progress</th>
                      <th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground w-20">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td colSpan={5} className="py-3 px-4"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                        </tr>
                      ))
                    ) : (
                      allCapacities.map((c, i) => {
                        const pct = c.plannedHours > 0 ? Math.min(100, (c.actualHours / c.plannedHours) * 100) : 0;
                        const diff = c.actualHours - c.plannedHours;
                        return (
                          <tr key={c.id} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                {c.project?.color && <span className="size-2 rounded-full" style={{ backgroundColor: c.project.color }} />}
                                <span className="font-medium truncate max-w-[220px]">{c.project?.name}</span>
                                {c.project?.priority && <PriorityBadge priority={c.project.priority as any} />}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                className="border rounded px-2 py-0.5 text-sm w-16 text-center bg-background"
                                value={c.plannedHours}
                                min="0"
                                max="40"
                                step="0.5"
                                onChange={(e) => upsert.mutate({ week, projectId: c.projectId, plannedHours: parseFloat(e.target.value) || 0 })}
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                className="border rounded px-2 py-0.5 text-sm w-16 text-center bg-background"
                                value={c.actualHours}
                                min="0"
                                max="40"
                                step="0.5"
                                onChange={(e) => upsert.mutate({ week, projectId: c.projectId, actualHours: parseFloat(e.target.value) || 0 })}
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="flex-1 h-2" />
                                <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(pct)}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`text-xs font-medium ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)}h
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {unallocatedProjects.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Přidat projekt do týdne:</p>
                  <div className="flex flex-wrap gap-2">
                    {unallocatedProjects.slice(0, 12).map((p: any) => (
                      <button
                        key={p.id}
                        className="text-xs px-2 py-1 border rounded-md hover:bg-muted transition-colors"
                        onClick={() => upsert.mutate({ week, projectId: p.id, plannedHours: 0 })}
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Content>
    </>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
