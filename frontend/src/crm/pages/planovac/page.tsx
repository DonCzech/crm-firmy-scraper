/**
 * Plánovač — chytrý denní scheduler (Motion / Alfred styl)
 *
 * Načítá úkoly z backendu + události z kalendáře, zjistí volné sloty
 * v každém dni a automaticky rozmístí nevyřízené úkoly do nejbližšího
 * volného okna podle priority a termínu.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  RefreshCw, Check, CheckCircle2, ChevronDown,
  CalendarDays, Clock, AlertCircle, Settings2,
  X, SkipForward, Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { fetchTasks, fetchActivities, updateTask } from '@/crm/services/backend';
import type { BackendTask, BackendActivity } from '@/crm/services/backend';
import type { StoredRecurringRule } from '@/components/ui/calendar/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlannerConfig {
  workStart: number;   // hod: začátek pracovní doby
  workEnd: number;     // hod: konec pracovní doby
  workDays: number[];  // 0=Ne … 6=So
  lunchStart: number;
  lunchDuration: number;
  sleepStart: number;
  sleepEnd: number;
  taskPadding: number; // min mezera mezi úkoly
}

interface ScheduledSlot {
  id: string;
  startMin: number;
  endMin: number;
  type: 'task' | 'event' | 'free';
  title: string;
  subtitle?: string;
  priority?: string;
  color: string;
  isFixed: boolean;
  taskId?: string;
  activityId?: string;
}

interface ScheduleResult {
  days: Record<string, ScheduledSlot[]>;   // YYYY-MM-DD → sloty
  unscheduled: BackendTask[];               // Nevešlo se do 7 dnů
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONFIG_KEY   = 'planner-config';
const DONE_KEY     = 'planner-done-ids';
const SKIP_KEY     = 'planner-skip-today';
const CALENDAR_KEY = 'calendar:recurring';

const DEFAULT_CONFIG: PlannerConfig = {
  workStart: 9, workEnd: 17,
  workDays: [1, 2, 3, 4, 5],
  lunchStart: 12, lunchDuration: 60,
  sleepStart: 23, sleepEnd: 7,
  taskPadding: 5,
};

const DAYS_FULL = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
const DAYS_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
const MONTHS = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];

const PRIORITY_ICON: Record<string, string>   = { urgent:'🔴', high:'🟠', medium:'🟡', low:'🟢' };
const PRIORITY_COLOR: Record<string, string>  = { urgent:'#ef4444', high:'#f97316', medium:'#eab308', low:'#22c55e' };
const PRIORITY_DUR: Record<string, number>    = { urgent:90, high:60, medium:45, low:30 };
const PRIORITY_ORDER: Record<string, number>  = { urgent:0, high:1, medium:2, low:3 };
const CLOSED_TASK_STATUSES = new Set(['done', 'completed', 'cancelled', 'canceled', 'closed']);

const CAL_COLOR: Record<string, string> = {
  sky:'#0ea5e9', amber:'#f59e0b', violet:'#8b5cf6',
  rose:'#f43f5e', emerald:'#10b981', orange:'#f97316',
};
const ACT_COLOR: Record<string, string> = {
  call:'#10b981', meeting:'#0ea5e9', email:'#f97316',
  note:'#8b5cf6', task:'#f59e0b', calendar:'#10b981',
};

const NAV_TABS = [
  { path: '/core/crm/planovac',       label: '📅 Dnes',       key: 'dnes'     },
  { path: '/core/crm/planovac/tyden', label: '📆 Plán 7 dní', key: 'tyden'    },
  { path: '/core/crm/planovac/cile',  label: '📋 Fronta',     key: 'backlog'  },
  { path: '/core/crm/planovac/radce', label: '⚙️ Nastavení',  key: 'settings' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadJSON<T>(key: string, fb: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fb; } catch { return fb; }
}
function saveJSON(key: string, v: unknown) { localStorage.setItem(key, JSON.stringify(v)); }

function minToTime(m: number): string {
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}
function isoDate(d: Date): string { return d.toISOString().slice(0, 10); }
function addDays(d: Date, n: number): Date { const nd = new Date(d); nd.setDate(d.getDate() + n); return nd; }
function nowMin(): number { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

function taskDur(t: BackendTask): number { return PRIORITY_DUR[t.priority ?? ''] ?? 45; }
function taskColor(t: BackendTask): string { return PRIORITY_COLOR[t.priority ?? ''] ?? '#6366f1'; }
function isTaskClosed(status?: string): boolean {
  return CLOSED_TASK_STATUSES.has(String(status ?? '').trim().toLowerCase());
}

function sortTasks(tasks: BackendTask[]): BackendTask[] {
  const now = Date.now();
  return [...tasks].sort((a, b) => {
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    const ao = ad < now, bo = bd < now;
    if (ao !== bo) return ao ? -1 : 1;
    if (ad !== bd) return ad - bd;
    return (PRIORITY_ORDER[a.priority ?? ''] ?? 4) - (PRIORITY_ORDER[b.priority ?? ''] ?? 4);
  });
}

// ─── Core scheduling engine ───────────────────────────────────────────────────

function buildWeekSchedule(
  tasks: BackendTask[],
  activities: BackendActivity[],
  rules: StoredRecurringRule[],
  config: PlannerConfig,
  doneIds: Set<string>,
  skipTodayIds: Set<string>,
  daysAhead = 7,
): ScheduleResult {
  const days: Record<string, ScheduledSlot[]> = {};
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Task queue: pending, not done, sorted by urgency
  let queue = sortTasks(
    tasks.filter(t => !isTaskClosed(t.status) && !doneIds.has(t.id))
  );

  for (let d = 0; d < daysAhead; d++) {
    const date = addDays(today, d);
    const dateKey = isoDate(date);
    const dow = date.getDay();
    const isWork = config.workDays.includes(dow);
    const slots: ScheduledSlot[] = [];

    // ── 1. Fixed events from calendar activities ──
    activities.forEach(a => {
      if (!a.startDate) return;
      const sd = new Date(a.startDate);
      if (isoDate(sd) !== dateKey) return;
      const ed = a.endDate ? new Date(a.endDate) : new Date(sd.getTime() + 3_600_000);
      const startMin = sd.getHours() * 60 + sd.getMinutes();
      const endMin   = ed.getHours() * 60 + ed.getMinutes();
      slots.push({
        id: `act-${a.id}`,
        startMin, endMin,
        type: 'event',
        title: a.subject,
        subtitle: a.type ? `CRM · ${a.type}` : 'Kalendář',
        color: ACT_COLOR[a.type ?? ''] ?? '#6366f1',
        isFixed: true,
        activityId: a.id,
      });
    });

    // ── 2. Recurring calendar rules ──
    rules.forEach(r => {
      if (r.recurrence.frequency === 'weekly' && !r.recurrence.daysOfWeek?.includes(dow)) return;
      if (r.exceptions?.includes(dateKey)) return;
      const startMin = r.startHour * 60 + r.startMinute;
      slots.push({
        id: `rec-${r.id}-${dateKey}`,
        startMin,
        endMin: startMin + r.durationMinutes,
        type: 'event',
        title: r.title,
        subtitle: 'Opakující se',
        color: CAL_COLOR[r.color ?? ''] ?? '#6366f1',
        isFixed: true,
      });
    });

    // ── 3. Build occupancy map ──
    const occ = new Array<boolean>(1440).fill(false);
    const mark = (s: number, dur: number) => {
      for (let i = Math.max(0,s); i < Math.min(s+dur, 1440); i++) occ[i] = true;
    };

    // Sleep
    const ss = config.sleepStart * 60, se = config.sleepEnd * 60;
    if (ss >= se) { mark(ss, 1440-ss); mark(0, se); } else { mark(ss, se-ss); }

    // Work + lunch (blocks for scheduling purposes)
    if (!isWork) {
      // Non-work day: only sleep is hard-blocked, but don't schedule in sleep hours
    } else {
      mark(config.workStart * 60, (config.workEnd - config.workStart) * 60);
      mark(config.lunchStart * 60, config.lunchDuration);
    }

    // Fixed events
    slots.forEach(s => mark(s.startMin, s.endMin - s.startMin));

    // ── 4. Find productive free windows ──
    // On work days: within work hours (excl. lunch)
    // On off days: 9:00–20:00 (free scheduling)
    const prodStart = isWork ? config.workStart * 60 : 9 * 60;
    const prodEnd   = isWork ? config.workEnd * 60   : 20 * 60;

    const freeWindows: Array<{ s: number; e: number }> = [];
    let fStart = -1;

    // On work days, reconstruct free time from work hours minus lunch minus events
    // Re-scan only in productive range
    const workOcc = new Array<boolean>(1440).fill(false);
    const markWork = (s: number, dur: number) => {
      for (let i = Math.max(0,s); i < Math.min(s+dur, 1440); i++) workOcc[i] = true;
    };

    // Block sleep in work scan
    if (ss >= se) { markWork(ss, 1440-ss); markWork(0, se); } else { markWork(ss, se-ss); }

    // Block lunch on work days
    if (isWork) markWork(config.lunchStart * 60, config.lunchDuration);

    // Block fixed events
    slots.forEach(s => markWork(s.startMin, s.endMin - s.startMin));

    for (let i = prodStart; i <= prodEnd; i++) {
      const blocked = i < 1440 && workOcc[i];
      if (!blocked && fStart === -1) fStart = i;
      else if ((blocked || i === prodEnd) && fStart !== -1) {
        if (i - fStart >= 30) freeWindows.push({ s: fStart, e: i });
        fStart = -1;
      }
    }

    // ── 5. Schedule tasks into free windows ──
    const MAX_TASK_MIN = 6 * 60; // max 6h of tasks per day
    let scheduledToday = 0;

    for (const fw of freeWindows) {
      let cursor = fw.s;

      while (queue.length > 0 && cursor + 30 <= fw.e && scheduledToday < MAX_TASK_MIN) {
        const task = queue[0];

        // On today (d===0): skip tasks in skipTodayIds
        if (d === 0 && skipTodayIds.has(task.id)) {
          queue = queue.slice(1);
          continue;
        }

        // Don't schedule past the due date (for future days)
        if (task.dueDate && d > 0) {
          const dueDay = isoDate(new Date(task.dueDate));
          if (dateKey > dueDay) {
            queue = queue.slice(1);
            continue;
          }
        }

        const dur = Math.min(taskDur(task), fw.e - cursor);
        if (dur < 30) break;

        slots.push({
          id: `task-${task.id}-${dateKey}`,
          startMin: cursor,
          endMin: cursor + dur,
          type: 'task',
          title: task.title,
          subtitle: task.dueDate
            ? `Termín: ${new Date(task.dueDate).toLocaleDateString('cs-CZ')}`
            : undefined,
          priority: task.priority,
          color: taskColor(task),
          isFixed: false,
          taskId: task.id,
        });

        cursor += dur + config.taskPadding;
        scheduledToday += dur;
        queue = queue.filter(t => t.id !== task.id);
      }
    }

    slots.sort((a, b) => a.startMin - b.startMin);
    days[dateKey] = slots;
  }

  return { days, unscheduled: queue };
}

// ─── SlotCard ─────────────────────────────────────────────────────────────────

function SlotCard({
  slot, isDone, isNow, onDone, onSkip,
}: {
  slot: ScheduledSlot;
  isDone?: boolean;
  isNow?: boolean;
  onDone?: (id: string) => void;
  onSkip?: (id: string) => void;
}) {
  if (slot.type === 'free') {
    const mins = slot.endMin - slot.startMin;
    return (
      <div className="flex items-center gap-3 py-1 px-3 text-xs text-muted-foreground select-none">
        <span className="w-12 text-right shrink-0 tabular-nums">{minToTime(slot.startMin)}</span>
        <div className="flex-1 border-t border-dashed border-muted-foreground/25" />
        <span className="shrink-0">{mins >= 60 ? `${(mins/60).toFixed(1)}h` : `${mins}min`} volno</span>
      </div>
    );
  }

  const dur = slot.endMin - slot.startMin;
  const isTask = slot.type === 'task';
  const icon = slot.priority ? PRIORITY_ICON[slot.priority] : '📅';

  return (
    <div
      className={`relative flex items-start gap-3 px-3 py-3 rounded-xl border transition-all group
        ${isDone ? 'opacity-40 bg-muted/20' : isNow ? 'bg-primary/5 border-primary/40 shadow-sm' : 'bg-background hover:shadow-sm hover:border-border/80'}
      `}
      style={{ borderLeft: `4px solid ${slot.color}` }}
    >
      {isNow && (
        <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}

      {/* Time column */}
      <div className="text-xs text-muted-foreground w-12 shrink-0 pt-0.5 text-right tabular-nums leading-tight">
        <div>{minToTime(slot.startMin)}</div>
        <div className="opacity-60">–{minToTime(slot.endMin)}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          <span className="text-sm shrink-0 mt-0.5">{icon}</span>
          <p className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-muted-foreground' : ''}`}>
            {slot.title}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 ml-6">
          {dur}min
          {slot.subtitle && <span className="ml-1.5 opacity-70">· {slot.subtitle}</span>}
          {!isTask && <span className="ml-1.5 opacity-50">· 📅</span>}
        </p>
      </div>

      {/* Actions */}
      {isTask && !isDone && (
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost"
            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Hotovo" onClick={() => onDone?.(slot.taskId!)}>
            <Check className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Přeskočit dnes → přesunout na zítra" onClick={() => onSkip?.(slot.taskId!)}>
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
      {isDone && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
    </div>
  );
}

// ─── Day Schedule View ────────────────────────────────────────────────────────

function DayScheduleView({
  slots, config, isWorkDay, doneIds, onDone, onSkip,
}: {
  slots: ScheduledSlot[];
  config: PlannerConfig;
  isWorkDay: boolean;
  doneIds: Set<string>;
  onDone: (id: string) => void;
  onSkip: (id: string) => void;
}) {
  const now = nowMin();
  const prodStart = isWorkDay ? config.workStart * 60 : 8 * 60;
  const prodEnd   = isWorkDay ? config.workEnd * 60   : 20 * 60;

  // Filter to productive hours + build display list with free gaps
  const visible = slots.filter(s => s.startMin < prodEnd && s.endMin > prodStart);
  const display: ScheduledSlot[] = [];
  let cursor = prodStart;

  for (const slot of visible) {
    const from = Math.max(slot.startMin, prodStart);
    if (from > cursor + 29) {
      display.push({
        id: `free-${cursor}`, startMin: cursor, endMin: from,
        type: 'free', title: '', color: '#94a3b8', isFixed: true,
      });
    }
    display.push(slot);
    cursor = Math.max(cursor, slot.endMin);
  }

  if (cursor < prodEnd - 29) {
    display.push({
      id: 'free-end', startMin: cursor, endMin: prodEnd,
      type: 'free', title: '', color: '#94a3b8', isFixed: true,
    });
  }

  if (display.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <CalendarDays className="w-10 h-10 mx-auto mb-4 opacity-25" />
        <p className="text-sm font-medium">Dnes nemáš žádné naplánované aktivity</p>
        <p className="text-xs mt-1">Přidej úkoly v TODO modulu nebo klikni na „Přeplánovat"</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {display.map(slot => (
        <SlotCard
          key={slot.id}
          slot={slot}
          isDone={slot.taskId ? doneIds.has(slot.taskId) : false}
          isNow={slot.startMin <= now && now < slot.endMin}
          onDone={onDone}
          onSkip={onSkip}
        />
      ))}
    </div>
  );
}

// ─── Week Plan View ───────────────────────────────────────────────────────────

function WeekPlanView({
  result, config, todayKey, doneIds, onDone,
}: {
  result: ScheduleResult;
  config: PlannerConfig;
  todayKey: string;
  doneIds: Set<string>;
  onDone: (id: string) => void;
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [expanded, setExpanded] = useState<string | null>(todayKey);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i);
    const dk = isoDate(d);
    const slots = result.days[dk] ?? [];
    const tasks = slots.filter(s => s.type === 'task');
    const events = slots.filter(s => s.type === 'event');
    const done = tasks.filter(s => s.taskId && doneIds.has(s.taskId)).length;
    return { date: d, dateKey: dk, dow: d.getDay(), slots, tasks, events, done };
  });

  return (
    <div className="space-y-2">
      {days.map(({ date, dateKey, dow, slots, tasks, events, done }) => {
        const isToday = dateKey === todayKey;
        const isOpen = expanded === dateKey;
        const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
        const isWorkDay = config.workDays.includes(dow);

        return (
          <div key={dateKey}
            className={`border rounded-xl overflow-hidden transition-shadow ${isToday ? 'border-primary shadow-sm' : ''} ${isOpen ? 'shadow-sm' : ''}`}>

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                ${isOpen ? 'bg-muted/30' : 'bg-background hover:bg-muted/15'}`}
              onClick={() => setExpanded(isOpen ? null : dateKey)}
            >
              {/* Date */}
              <div className="w-28 shrink-0">
                <div className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                  {isToday ? '📍 Dnes' : DAYS_SHORT[dow]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {date.getDate()}. {date.getMonth() + 1}. · {isWorkDay ? 'pracovní' : 'volno'}
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-1 flex-wrap">
                {tasks.length > 0 && (
                  <Badge variant={pct === 100 ? 'default' : 'outline'} className="text-xs">
                    {done}/{tasks.length} úkolů
                  </Badge>
                )}
                {events.length > 0 && (
                  <Badge variant="outline" className="text-xs border-sky-300 text-sky-700 bg-sky-50">
                    {events.length} {events.length === 1 ? 'událost' : 'událostí'}
                  </Badge>
                )}
                {tasks.length === 0 && events.length === 0 && (
                  <span className="text-xs text-muted-foreground">Volný den ☀️</span>
                )}
              </div>

              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="w-20 shrink-0">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all bg-green-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-2 border-t space-y-1">
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    Žádné naplánované aktivity.
                  </p>
                ) : (
                  slots.map(s => (
                    <SlotCard key={s.id} slot={s}
                      isDone={s.taskId ? doneIds.has(s.taskId) : false}
                      onDone={onDone} />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Backlog View ─────────────────────────────────────────────────────────────

function BacklogView({
  tasks, doneIds, onDone,
}: {
  tasks: BackendTask[];
  doneIds: Set<string>;
  onDone: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-4 opacity-25 text-green-500" />
        <p className="text-sm font-semibold text-green-700">Skvěle! Všechno je naplánováno</p>
        <p className="text-xs mt-1">Žádné úkoly nečekají ve frontě.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900">{tasks.length} úkolů nevešlo do 7denního plánu</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Budou automaticky přiřazeny do dalších dnů jak se vytvářejí volné sloty.
            Označ dokončené úkoly pro uvolnění kapacity.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {tasks.map(t => {
          const slot: ScheduledSlot = {
            id: `bl-${t.id}`, startMin: 0, endMin: taskDur(t),
            type: 'task', title: t.title,
            subtitle: t.dueDate ? `Termín: ${new Date(t.dueDate).toLocaleDateString('cs-CZ')}` : 'Bez termínu',
            priority: t.priority, color: taskColor(t),
            isFixed: false, taskId: t.id,
          };
          return (
            <SlotCard key={t.id} slot={slot}
              isDone={doneIds.has(t.id)}
              onDone={onDone} />
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel({ config, onSave }: { config: PlannerConfig; onSave: (c: PlannerConfig) => void }) {
  const [local, setLocal] = useState<PlannerConfig>(config);
  const upd = (k: keyof PlannerConfig, v: number | number[]) => setLocal(p => ({ ...p, [k]: v }));
  const toggleDay = (d: number) =>
    upd('workDays', local.workDays.includes(d) ? local.workDays.filter(x => x !== d) : [...local.workDays, d]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Settings2 className="w-4 h-4" /> Nastavení plánovače
        </p>
        <p className="text-xs text-muted-foreground">
          Tyto údaje ovlivňují výpočet volných slotů pro automatické plánování.
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            ['workStart', 'Práce od (hod)'],
            ['workEnd', 'Práce do (hod)'],
            ['lunchStart', 'Oběd od (hod)'],
            ['lunchDuration', 'Délka oběda (min)'],
            ['sleepStart', 'Spánek od (hod)'],
            ['sleepEnd', 'Spánek do (hod)'],
            ['taskPadding', 'Mezera mezi úkoly (min)'],
          ] as [keyof PlannerConfig, string][]).map(([k, label]) => (
            <div key={k}>
              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
              <Input type="number" min={0} max={k === 'lunchDuration' || k === 'taskPadding' ? 180 : 23}
                value={local[k] as number}
                onChange={e => upd(k, +e.target.value)}
                className="h-8 text-sm" />
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-2">Pracovní dny</label>
          <div className="flex gap-2 flex-wrap">
            {[1,2,3,4,5,6,0].map(d => (
              <button key={d} onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors
                  ${local.workDays.includes(d)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'}`}>
                {DAYS_SHORT[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={() => onSave(local)}>
            <Check className="w-4 h-4 mr-1.5" /> Uložit nastavení
          </Button>
          <p className="text-xs text-muted-foreground self-center">
            Po uložení se plán automaticky přepočítá.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main PlannerPage ─────────────────────────────────────────────────────────

export function PlannerPage() {
  const location = useLocation();
  const activeTab = location.pathname.includes('/tyden') ? 'tyden'
    : location.pathname.includes('/cile')  ? 'backlog'
    : location.pathname.includes('/radce') ? 'settings'
    : 'dnes';

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayKey = isoDate(today);

  const [config,      setConfig]      = useState<PlannerConfig>(() => loadJSON(CONFIG_KEY, DEFAULT_CONFIG));
  const [tasks,       setTasks]       = useState<BackendTask[]>([]);
  const [activities,  setActivities]  = useState<BackendActivity[]>([]);
  const [rules]                       = useState<StoredRecurringRule[]>(() => loadJSON(CALENDAR_KEY, []));
  const [doneIds,     setDoneIds]     = useState<Set<string>>(() => new Set(loadJSON<string[]>(DONE_KEY, [])));
  const [skipToday,   setSkipToday]   = useState<Set<string>>(() => new Set(loadJSON<string[]>(SKIP_KEY, [])));
  const [loading,     setLoading]     = useState(true);
  const [showConfig,  setShowConfig]  = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, a] = await Promise.all([
        fetchTasks({ limit: 500 }),
        fetchActivities({ limit: 500 }),
      ]);
      setTasks(t.data ?? []);
      setActivities(a.data ?? []);
    } catch {
      toast.error('Chyba při načítání dat z CRM');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear skipToday each day on mount
  useEffect(() => {
    const lastSkipDay = localStorage.getItem('planner-skip-day');
    if (lastSkipDay !== todayKey) {
      localStorage.setItem('planner-skip-day', todayKey);
      setSkipToday(new Set());
      saveJSON(SKIP_KEY, []);
    }
    loadData();
  }, [loadData, todayKey]);

  const result = useMemo(
    () => buildWeekSchedule(tasks, activities, rules, config, doneIds, skipToday),
    [tasks, activities, rules, config, doneIds, skipToday],
  );

  const todaySlots  = result.days[todayKey] ?? [];
  const todayTasks  = todaySlots.filter(s => s.type === 'task');
  const todayDone   = todayTasks.filter(s => s.taskId && doneIds.has(s.taskId)).length;
  const todayEvents = todaySlots.filter(s => s.type === 'event');
  const isWorkDay   = config.workDays.includes(today.getDay());

  const handleDone = useCallback(async (taskId: string) => {
    if (!taskId) {
      toast.error('Neplatné ID úkolu.');
      return;
    }

    // Optimistic UI update for immediate feedback in planner.
    setDoneIds(prev => {
      const next = new Set(prev);
      next.add(taskId);
      saveJSON(DONE_KEY, [...next]);
      return next;
    });

    try {
      const updatedAfterDone = await updateTask(taskId, { status: 'done' });
      const statusAfterDone = updatedAfterDone?.status;
      if (!isTaskClosed(statusAfterDone)) {
        // Fallback for environments that still use "completed" semantics.
        await updateTask(taskId, { status: 'completed' as never });
      }
      await loadData();
      toast.success('✅ Úkol dokončen!');
    } catch {
      // Keep local done flag so task does not return in planner view.
      toast.error('Úkol lokálně označen jako hotový, ale backend update selhal');
    }
  }, [loadData]);

  const handleSkip = useCallback((taskId: string) => {
    setSkipToday(prev => {
      const next = new Set(prev);
      next.add(taskId);
      saveJSON(SKIP_KEY, [...next]);
      return next;
    });
    toast.success('⏭ Úkol přesunut na zítra');
  }, []);

  const handleSaveConfig = (c: PlannerConfig) => {
    setConfig(c);
    saveJSON(CONFIG_KEY, c);
    toast.success('Nastavení uloženo — přepočítávám plán');
  };

  const pendingCount = tasks.filter(
    t => !isTaskClosed(t.status) && !doneIds.has(t.id)
  ).length;

  return (
    <>
      <ContentHeader>
        <div className="flex items-center gap-3">
          <CalendarDays className="size-4 text-primary" />
          <h1 className="text-sm font-semibold">Plánovač</h1>
          {!loading && (
            <Badge variant="outline" className="text-xs">
              {todayDone}/{todayTasks.length} dnes · {pendingCount} celkem
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Přeplánovat
          </Button>
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            {NAV_TABS.map(t => (
              <Link key={t.key} to={t.path}
                className={`px-3 py-1.5 text-sm font-medium transition-colors
                  ${activeTab === t.key ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </ContentHeader>

      <Content className="block py-5 px-4 max-w-3xl">

        {/* ── DNES ── */}
        {activeTab === 'dnes' && (
          <div className="space-y-4">

            {/* Day header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {DAYS_FULL[today.getDay()]}, {today.getDate()}. {MONTHS[today.getMonth()]} {today.getFullYear()}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{isWorkDay ? '💼 Pracovní den' : '☀️ Volný den'}</span>
                  {todayEvents.length > 0 && <span>· {todayEvents.length} událostí z kalendáře</span>}
                  {todayTasks.length > 0 && (
                    <span className={todayDone === todayTasks.length ? 'text-green-600 font-medium' : ''}>
                      · {todayDone}/{todayTasks.length} úkolů
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setShowConfig(v => !v)}>
                  <Settings2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Progress */}
            {todayTasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Dnešní pokrok</span>
                  <span>{Math.round((todayDone / todayTasks.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(todayDone / todayTasks.length) * 100}%` }} />
                </div>
              </div>
            )}

            {showConfig && (
              <div className="relative">
                <button onClick={() => setShowConfig(false)}
                  className="absolute right-3 top-3 z-10 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
                <SettingsPanel config={config} onSave={c => { handleSaveConfig(c); setShowConfig(false); }} />
              </div>
            )}

            {/* Current time banner */}
            {!loading && todaySlots.length > 0 && (() => {
              const now = nowMin();
              const current = todaySlots.find(s => s.startMin <= now && now < s.endMin);
              if (!current) return null;
              return (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="font-medium">Právě nyní ({minToTime(now)}):</span>
                  <span>{current.type === 'event' ? '📅' : PRIORITY_ICON[current.priority ?? ''] ?? '⚪'} {current.title}</span>
                  <span className="text-muted-foreground ml-auto">do {minToTime(current.endMin)}</span>
                </div>
              );
            })()}

            {/* Schedule */}
            {loading ? (
              <div className="text-center py-16 text-muted-foreground">
                <RefreshCw className="w-7 h-7 mx-auto animate-spin opacity-30 mb-4" />
                <p className="text-sm">Načítám úkoly a kalendář…</p>
              </div>
            ) : (
              <DayScheduleView
                slots={todaySlots}
                config={config}
                isWorkDay={isWorkDay}
                doneIds={doneIds}
                onDone={handleDone}
                onSkip={handleSkip}
              />
            )}

            {/* Tip */}
            {!loading && result.unscheduled.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                <Inbox className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {result.unscheduled.length} dalších úkolů čeká ve frontě — viz záložka „Fronta"
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── PLÁN 7 DNÍ ── */}
        {activeTab === 'tyden' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Plán na 7 dní</h2>
              <p className="text-sm text-muted-foreground">
                {pendingCount} nevyřízených úkolů · {result.unscheduled.length} ve frontě
              </p>
            </div>
            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-7 h-7 mx-auto animate-spin opacity-30" />
              </div>
            ) : (
              <WeekPlanView
                result={result}
                config={config}
                todayKey={todayKey}
                doneIds={doneIds}
                onDone={handleDone}
              />
            )}
          </div>
        )}

        {/* ── FRONTA ── */}
        {activeTab === 'backlog' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Fronta úkolů</h2>
              {result.unscheduled.length > 0 && (
                <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                  {result.unscheduled.length} nevyřízeno
                </Badge>
              )}
            </div>
            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-7 h-7 mx-auto animate-spin opacity-30" />
              </div>
            ) : (
              <BacklogView tasks={result.unscheduled} doneIds={doneIds} onDone={handleDone} />
            )}
          </div>
        )}

        {/* ── NASTAVENÍ ── */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold">Nastavení plánovače</h2>
            <SettingsPanel config={config} onSave={handleSaveConfig} />

            <Card>
              <CardHeader className="pb-2 pt-4 px-5">
                <p className="text-sm font-semibold">Data & Integrace</p>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">CRM Úkoly</p>
                    <p className="text-xs text-muted-foreground">{tasks.length} načtených · {pendingCount} nevyřízených</p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">Připojeno</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Kalendář (aktivity)</p>
                    <p className="text-xs text-muted-foreground">{activities.length} načtených událostí</p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">Připojeno</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Opakující se události</p>
                    <p className="text-xs text-muted-foreground">{rules.length} pravidel z localStorage</p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">Připojeno</Badge>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    Plán se přepočítává automaticky při každém načtení stránky.
                    Úkoly označené jako „hotovo" jsou odesílány do CRM backendu.
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                  Načíst znovu
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </Content>
    </>
  );
}
