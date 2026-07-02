import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { DailySlotCard } from './components/daily-slot-card';
import { PmDailySlot, PM_SLOT_TYPE_LABELS, PmSlotType, todayString } from './types';
import {
  pmApplyDayTemplate,
  pmCreateSlot,
  pmDeleteSlot,
  pmFetchDay,
  pmFetchProjects,
  pmUpdateSlot,
} from '../../services/backend';

const NO_PROJECT = 'no-project';

function dateOffset(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function PmPlannerPage() {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayString());

  const { data: dayData, isLoading } = useQuery({
    queryKey: ['pm-day', date],
    queryFn: () => pmFetchDay(date),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['pm-projects-simple'],
    queryFn: () => pmFetchProjects({ status: 'Aktivní' }),
  });

  const applyTemplate = useMutation({
    mutationFn: () => pmApplyDayTemplate(date),
    onSuccess: () => {
      toast.success('Šablona aplikována');
      qc.invalidateQueries({ queryKey: ['pm-day', date] });
    },
  });

  const createSlot = useMutation({
    mutationFn: (data: any) => pmCreateSlot(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pm-day', date] }),
  });

  const updateSlot = async (id: string, data: any) => {
    await pmUpdateSlot(id, data);
    qc.invalidateQueries({ queryKey: ['pm-day', date] });
    qc.invalidateQueries({ queryKey: ['pm-dashboard'] });
  };

  const deleteSlot = async (id: string) => {
    await pmDeleteSlot(id);
    qc.invalidateQueries({ queryKey: ['pm-day', date] });
  };

  const slots: PmDailySlot[] = dayData?.slots ?? [];
  const summary = dayData?.summary;
  const overloaded = summary?.overloaded;
  const dateLabel = new Date(date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
  const dayProgress = summary?.totalPlanned ? Math.min(100, Math.round((summary.totalActual / summary.totalPlanned) * 100)) : 0;

  return (
    <>
      <ContentHeader className="gap-2">
        <h1 className="text-sm font-semibold flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" /> Denní Planner
        </h1>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="size-8" onClick={() => setDate(dateOffset(date, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <button className="text-sm font-medium capitalize hover:text-primary" onClick={() => setDate(todayString())}>
            {dateLabel}
          </button>
          <Button size="icon" variant="ghost" className="size-8" onClick={() => setDate(dateOffset(date, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => applyTemplate.mutate()} disabled={applyTemplate.isPending || slots.length > 0}>
            <Sparkles className="size-3.5" /> Šablona
          </Button>
          <QuickAddSlot projects={projects as any[]} onAdd={(data) => createSlot.mutate({ ...data, date })} />
        </div>
      </ContentHeader>

      <Content className="px-5 pb-6">
        <div className="space-y-4 w-full">
          {summary && (
            <Card className={overloaded ? 'border-red-300 bg-red-50/60' : ''}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <span className="font-medium flex items-center gap-1.5">
                    {overloaded && <AlertTriangle className="size-4 text-red-500" />}
                    {(summary.totalPlanned / 60).toFixed(1)}h plán
                  </span>
                  <span className="text-muted-foreground">{(summary.totalActual / 60).toFixed(1)}h odpracováno</span>
                  <span className="text-emerald-600">{(summary.freeMinutes / 60).toFixed(1)}h volno</span>
                  <div className="ml-auto min-w-[200px]">
                    <Progress value={dayProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Timeline slotů</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 rounded bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-14 text-sm text-muted-foreground border rounded-lg">
                    Žádné sloty na tento den.
                  </div>
                ) : (
                  <div className="space-y-2 max-w-4xl">
                    {slots.map((slot) => (
                      <DailySlotCard key={slot.id} slot={slot} onUpdate={updateSlot} onDelete={deleteSlot} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rozpad dle projektu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {summary?.byProject?.length ? (
                  summary.byProject.map((p: any) => (
                    <div key={p.projectId} className="rounded border p-2 text-xs">
                      <div className="flex items-center gap-2">
                        {p.color && <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />}
                        <span className="font-medium truncate">{p.name}</span>
                      </div>
                      <div className="mt-1 text-muted-foreground">{(p.planned / 60).toFixed(1)}h plán</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Zatím bez alokace na projekty.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Content>
    </>
  );
}

function QuickAddSlot({
  projects,
  onAdd,
}: {
  projects: any[];
  onAdd: (data: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState(NO_PROJECT);
  const [slotType, setSlotType] = useState<PmSlotType>('focus');
  const [duration, setDuration] = useState('60');
  const [startTime, setStartTime] = useState('09:00');

  const handleAdd = () => {
    const dur = parseInt(duration);
    const [h, m] = startTime.split(':').map(Number);
    const endTotal = h * 60 + m + dur;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    onAdd({
      projectId: projectId === NO_PROJECT ? undefined : projectId,
      slotType,
      plannedDuration: dur,
      startTime,
      endTime,
      status: 'planned',
    });
    setOpen(false);
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" /> Přidat slot
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-1.5 shadow-sm">
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border rounded px-1.5 py-0.5 text-xs w-20 bg-background" />
      <Select value={slotType} onValueChange={(v) => setSlotType(v as PmSlotType)}>
        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.entries(PM_SLOT_TYPE_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={projectId} onValueChange={setProjectId}>
        <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="Projekt" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_PROJECT}>Bez projektu</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="border rounded px-1.5 py-0.5 text-xs w-16 bg-background" min="15" max="480" step="15" />
      <span className="text-xs text-muted-foreground">min</span>
      <Button size="sm" className="h-7" onClick={handleAdd}>OK</Button>
      <Button size="sm" variant="ghost" className="h-7" onClick={() => setOpen(false)}>×</Button>
    </div>
  );
}
