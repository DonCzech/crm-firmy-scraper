import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FolderKanban,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { DailySlotCard } from './components/daily-slot-card';
import { PriorityBadge } from './components/pm-badge';
import { PmDashboard, PmWeeklyCapacity, currentIsoWeek } from './types';
import { pmDeleteSlot, pmFetchDashboard, pmFetchWeeklyCapacity, pmUpdateSlot } from '../../services/backend';

export function PmDashboardPage() {
  const qc = useQueryClient();
  const week = currentIsoWeek();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['pm-dashboard'],
    queryFn: pmFetchDashboard,
    refetchInterval: 30000,
  });

  const { data: weekCapacities = [] } = useQuery({
    queryKey: ['pm-weekly', week],
    queryFn: () => pmFetchWeeklyCapacity(week),
  });

  const handleSlotUpdate = async (id: string, data: any) => {
    await pmUpdateSlot(id, data);
    qc.invalidateQueries({ queryKey: ['pm-dashboard'] });
  };

  const handleSlotDelete = async (id: string) => {
    await pmDeleteSlot(id);
    qc.invalidateQueries({ queryKey: ['pm-dashboard'] });
  };

  if (isLoading || !dashboard) {
    return (
      <>
        <ContentHeader>
          <h1 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="size-4 text-primary" /> PM Dashboard
          </h1>
        </ContentHeader>
        <Content className="px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </Content>
      </>
    );
  }

  const { stats, todaySlots, projectsWithoutNextStep, upcomingDeadlines } = dashboard as PmDashboard;
  const totalWeekPlanned = (weekCapacities as PmWeeklyCapacity[]).reduce((s, c) => s + c.plannedHours, 0);
  const totalWeekActual = (weekCapacities as PmWeeklyCapacity[]).reduce((s, c) => s + c.actualHours, 0);
  const dayProgress = stats.todayPlannedMinutes > 0
    ? Math.min(100, Math.round((stats.todayActualMinutes / stats.todayPlannedMinutes) * 100))
    : 0;

  return (
    <>
      <ContentHeader className="gap-2">
        <h1 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="size-4 text-primary" /> PM Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <Link to="/core/crm/pm/planner">
            <Button size="sm" variant="outline">
              <CalendarClock className="size-3.5" /> Planner
            </Button>
          </Link>
          <Link to="/core/crm/pm/weekly">
            <Button size="sm" variant="outline">
              <TrendingUp className="size-3.5" /> Weekly
            </Button>
          </Link>
          <Link to="/core/crm/pm">
            <Button size="sm" variant="outline">
              <FolderKanban className="size-3.5" /> Portfolio
            </Button>
          </Link>
        </div>
      </ContentHeader>

      <Content className="px-5 pb-6">
        <div className="space-y-5 w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatBox icon={<FolderKanban className="size-4 text-primary" />} label="Aktivní projekty" value={stats.activeProjects} sub={`${stats.totalProjects} celkem`} />
            <StatBox icon={<Zap className="size-4 text-emerald-600" />} label="Active wave" value={stats.activeWaveProjects} sub="projektů ve vlně" />
            <StatBox icon={<AlertTriangle className="size-4 text-red-600" />} label="Blokované úkoly" value={stats.blockedTasks} sub={`${stats.criticalTasks} kritických`} />
            <StatBox icon={<Clock className="size-4 text-blue-600" />} label="Dnes" value={`${(stats.todayActualMinutes / 60).toFixed(1)}h / ${(stats.todayPlannedMinutes / 60).toFixed(1)}h`} sub={`${dayProgress}% dokončeno`} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarClock className="size-4 text-primary" /> Dnešní sloty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Progress value={dayProgress} className="flex-1 h-2" />
                  <span>{dayProgress}%</span>
                </div>

                {todaySlots.length === 0 ? (
                  <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                    Žádné sloty na dnešek.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todaySlots.map((slot: any) => (
                      <DailySlotCard key={slot.id} slot={slot} onUpdate={handleSlotUpdate} onDelete={handleSlotDelete} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" /> Týden {week}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{totalWeekActual}h odpracováno</span>
                    <span>{totalWeekPlanned}h plánováno</span>
                  </div>
                  <Progress value={totalWeekPlanned > 0 ? Math.min(100, (totalWeekActual / totalWeekPlanned) * 100) : 0} className="h-2" />
                  <div className="space-y-1 mt-2">
                    {(weekCapacities as PmWeeklyCapacity[]).slice(0, 8).map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-xs">
                        {c.project?.color && <span className="size-2 rounded-full" style={{ backgroundColor: c.project.color }} />}
                        <span className="flex-1 truncate text-muted-foreground">{c.project?.name}</span>
                        <span className="font-medium">{c.actualHours}h/{c.plannedHours}h</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {projectsWithoutNextStep.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <Target className="size-4" /> Bez next step
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 pb-4">
                    {projectsWithoutNextStep.slice(0, 6).map((p: any) => (
                      <Link key={p.id} to={`/core/crm/pm/project/${p.id}`} className="flex items-center gap-2 hover:text-primary">
                        <span className="text-xs flex-1 text-muted-foreground">{p.name}</span>
                        <PriorityBadge priority={p.priority as any} />
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {upcomingDeadlines.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                      <CheckCircle2 className="size-4" /> Blížící se deadline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 pb-4">
                    {upcomingDeadlines.slice(0, 6).map((t: any) => (
                      <div key={t.id} className="flex items-center gap-2 text-xs">
                        <span className="flex-1 truncate">{t.title}</span>
                        <span className="text-red-500 shrink-0">{t.deadline ? new Date(t.deadline).toLocaleDateString('cs-CZ') : ''}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Content>
    </>
  );
}

function StatBox({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <p className="text-lg font-semibold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
