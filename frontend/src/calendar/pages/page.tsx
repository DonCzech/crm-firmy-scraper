"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, addHours, format, isToday } from "date-fns";
import { cs } from "date-fns/locale";
import { toast } from "sonner";
import {
  Apple,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  RepeatIcon,
  Settings,
  Trash2,
  Unlink,
  Wifi,
  WifiOff,
} from "lucide-react";
import { EventCalendar } from "@/components/ui/calendar/event-calendar";
import {
  type CalendarEvent,
  type CalendarOption,
  type SidebarTask,
  type StoredRecurringRule,
} from "@/components/ui/calendar/types";
import { useLayout } from "@/calendar/layout/components/context";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  fetchAppleCalendars,
  createActivity,
  connectAppleCalendar,
  disconnectAppleCalendar,
  fetchCalendarSyncStatus,
  deleteActivity,
  fetchActivities,
  fetchDeals,
  fetchMe,
  fetchTasks,
  runCalendarSync,
  setAppleCalendar,
  updateActivity,
  updateDeal,
  updateTask,
  type AppleCalendarOption,
  type BackendActivity,
  type CalendarSyncStatus,
  type BackendDeal,
  type BackendTask,
} from "@/crm/services/backend";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "calendar:recurring";

function loadRules(): StoredRecurringRule[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as StoredRecurringRule[];
  } catch {
    return [];
  }
}

function saveRules(rules: StoredRecurringRule[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rules));
}

// ─── Recurring event expansion ────────────────────────────────────────────────
const EXPAND_START_DAYS = -30;
const EXPAND_END_DAYS = 120;

function expandRecurringRules(rules: StoredRecurringRule[]): CalendarEvent[] {
  const windowStart = addDays(new Date(), EXPAND_START_DAYS);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = addDays(new Date(), EXPAND_END_DAYS);
  const events: CalendarEvent[] = [];

  for (const rule of rules) {
    const exceptions = new Set(rule.exceptions ?? []);
    const ruleEnd = rule.recurrence.endDate ? new Date(rule.recurrence.endDate) : null;

    let current = new Date(windowStart);

    while (current <= windowEnd) {
      if (ruleEnd && current > ruleEnd) break;
      const dateKey = format(current, "yyyy-MM-dd");
      let matches = false;

      if (rule.recurrence.frequency === "weekly") {
        const days = rule.recurrence.daysOfWeek ?? [];
        matches = days.includes(current.getDay());
      } else if (rule.recurrence.frequency === "monthly") {
        matches = current.getDate() === (rule.recurrence.dayOfMonth ?? 1);
      }

      if (matches && !exceptions.has(dateKey)) {
        const start = new Date(current);
        start.setHours(rule.startHour, rule.startMinute, 0, 0);
        const end = new Date(start.getTime() + rule.durationMinutes * 60_000);
        events.push({
          id: `recurring:${rule.id}:${dateKey}`,
          title: rule.title,
          description: rule.description,
          start,
          end,
          allDay: rule.allDay,
          color: rule.color,
          priority: rule.priority,
          calendarId: rule.calendarId,
          location: rule.location,
          recurringId: rule.id,
          recurrence: rule.recurrence,
        });
      }

      current = addDays(current, 1);
    }
  }

  return events;
}

// ─── Default templates ────────────────────────────────────────────────────────
const DEFAULT_TEMPLATES: Omit<StoredRecurringRule, "id" | "exceptions">[] = [
  {
    title: "Vysávání",
    color: "emerald",
    priority: "low",
    allDay: true,
    startHour: 10, startMinute: 0, durationMinutes: 60,
    recurrence: { frequency: "weekly", daysOfWeek: [1] },
  },
  {
    title: "Praní",
    color: "sky",
    priority: "low",
    allDay: true,
    startHour: 9, startMinute: 0, durationMinutes: 120,
    recurrence: { frequency: "weekly", daysOfWeek: [1] },
  },
  {
    title: "Myčka",
    color: "sky",
    priority: "low",
    allDay: true,
    startHour: 10, startMinute: 0, durationMinutes: 60,
    recurrence: { frequency: "weekly", daysOfWeek: [1] },
  },
  {
    title: "Mytí podlahy",
    color: "emerald",
    priority: "low",
    allDay: true,
    startHour: 11, startMinute: 0, durationMinutes: 60,
    recurrence: { frequency: "weekly", daysOfWeek: [1] },
  },
  {
    title: "BJJ Trénink",
    color: "violet",
    priority: "medium",
    allDay: false,
    startHour: 17, startMinute: 30, durationMinutes: 90,
    location: "BJJ Gym",
    recurrence: { frequency: "weekly", daysOfWeek: [1, 3] },
  },
  {
    title: "Paušál O2",
    color: "amber",
    priority: "high",
    allDay: true,
    startHour: 9, startMinute: 0, durationMinutes: 60,
    description: "Zaplatit měsíční paušál O2",
    recurrence: { frequency: "monthly", dayOfMonth: 30 },
  },
];

const WEEKDAY_NAMES = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];

function ruleLabel(rule: StoredRecurringRule): string {
  const r = rule.recurrence;
  if (r.frequency === "weekly" && r.daysOfWeek?.length) {
    return r.daysOfWeek.map((d) => WEEKDAY_NAMES[d]).join(", ");
  }
  if (r.frequency === "monthly") return `Každého ${r.dayOfMonth}. v měsíci`;
  return "Opakující se";
}

// ─── Backend event mapping ────────────────────────────────────────────────────
type EventSource = "task" | "deal" | "activity";

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  call: "emerald",
  meeting: "sky",
  email: "orange",
  note: "violet",
  task: "amber",
  calendar: "emerald",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  call: "Hovor",
  meeting: "Schůzka",
  email: "Email",
  note: "Poznámka",
  task: "Úkol",
};

function toDateOrNull(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function encodeEventId(source: EventSource, entityId: string): string {
  return `${source}:${entityId}`;
}

function decodeEventId(eventId: string): { source: EventSource; id: string } | null {
  const [source, ...rest] = eventId.split(":");
  const id = rest.join(":");
  if (!id) return null;
  if (source === "task" || source === "deal" || source === "activity") {
    return { source, id };
  }
  return null;
}

function mapTaskEvent(task: BackendTask): CalendarEvent | null {
  const due = toDateOrNull(task.dueDate);
  if (!due) return null;
  return {
    id: encodeEventId("task", task.id),
    title: task.title,
    description: task.description ?? "",
    start: due,
    end: addHours(due, 1),
    color: "sky",
    location: "Todo",
  };
}

function mapDealEvent(deal: BackendDeal): CalendarEvent | null {
  const expected = toDateOrNull(deal.expectedCloseDate);
  if (!expected) return null;
  return {
    id: encodeEventId("deal", deal.id),
    title: deal.title,
    description: deal.description ?? "",
    start: expected,
    end: expected,
    allDay: true,
    color: "amber",
    location: deal.company?.name ?? "CRM",
  };
}

function mapActivityEvent(activity: BackendActivity): CalendarEvent {
  const fallback = toDateOrNull(activity.startDate) ?? toDateOrNull(activity.createdAt) ?? new Date();
  const end = toDateOrNull(activity.endDate) ?? addHours(fallback, 1);

  const contactName = activity.contact
    ? `${activity.contact.firstName ?? ""} ${activity.contact.lastName ?? ""}`.trim()
    : "";

  const title = contactName ? `${activity.subject} — ${contactName}` : activity.subject;

  const descParts = [activity.description, activity.outcome ? `Výsledek: ${activity.outcome}` : ""].filter(Boolean);

  const typeLabel = ACTIVITY_TYPE_LABELS[activity.type ?? ""];
  const color = ACTIVITY_TYPE_COLORS[activity.type ?? "calendar"] ?? "emerald";

  return {
    id: encodeEventId("activity", activity.id),
    title,
    description: descParts.join("\n"),
    start: fallback,
    end,
    allDay: false,
    color,
    location: activity.location ?? (typeLabel ? `CRM · ${typeLabel}` : "CRM"),
  };
}

const eventColorDot: Record<string, string> = {
  sky: "bg-sky-500", amber: "bg-amber-500", violet: "bg-violet-500",
  rose: "bg-rose-500", emerald: "bg-emerald-500", orange: "bg-orange-500",
};

// ─── Today's Overview Panel ───────────────────────────────────────────────────
export function TodayOverview({
  events,
  syncStatus,
  syncBusy,
  onSync,
  onOpenSettings,
}: {
  events: CalendarEvent[];
  syncStatus: CalendarSyncStatus | null;
  syncBusy: boolean;
  onSync: () => void;
  onOpenSettings: () => void;
}) {
  const todayLabel = format(new Date(), "EEEE d. MMMM yyyy", { locale: cs });

  const todayEvents = useMemo(
    () =>
      events
        .filter((e) => isToday(e.start) || isToday(e.end))
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [events],
  );

  return (
    <div className="mb-4 rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Dnes</span>
          <span className="text-xs text-muted-foreground capitalize">{todayLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus?.connected ? (
            <button
              type="button"
              onClick={onSync}
              disabled={syncBusy}
              title="Synchronizovat s Apple Calendar"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${syncBusy ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{syncStatus.calendarName ?? "Apple Calendar"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Apple nepřipojen</span>
            </span>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Nastavení kalendáře"
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-2">
        {todayEvents.length === 0 ? (
          <div className="py-3 text-xs text-muted-foreground text-center">
            Dnes nemáš žádné události
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {todayEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 py-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${eventColorDot[event.color ?? "sky"] ?? "bg-sky-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate flex items-center gap-1">
                    {event.recurringId && <RepeatIcon className="w-3 h-3 text-muted-foreground shrink-0" />}
                    {event.title.replace(/^\[(TODO|CRM Deal)\]\s*/, "")}
                  </div>
                  {event.location && !["Todo"].includes(event.location) && (
                    <div className="text-xs text-muted-foreground truncate">{event.location}</div>
                  )}
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {event.allDay ? (
                    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">celý den</span>
                  ) : event.id.startsWith("task:") ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-sky-500" />
                      <span>úkol</span>
                    </span>
                  ) : (
                    <span>{format(event.start, "H:mm")}–{format(event.end, "H:mm")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {syncStatus?.lastSyncAt && (
        <div className="px-4 py-1.5 border-t bg-muted/20 text-[10px] text-muted-foreground flex justify-between">
          <span>
            Poslední sync: {new Date(syncStatus.lastSyncAt).toLocaleString("cs-CZ")}
            {syncStatus.trackedEvents ? ` · ${syncStatus.trackedEvents} událostí` : ""}
          </span>
          {syncStatus.lastError && (
            <span className="text-rose-500 truncate max-w-[50%]">{syncStatus.lastError}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Templates section in Settings ───────────────────────────────────────────
function TemplatesSection({
  rules,
  onAdd,
  onDelete,
}: {
  rules: StoredRecurringRule[];
  onAdd: (rule: Omit<StoredRecurringRule, "id" | "exceptions">) => void;
  onDelete: (id: string) => void;
}) {
  const COLOR_DOT: Record<string, string> = {
    sky: "bg-sky-500", amber: "bg-amber-500", violet: "bg-violet-500",
    rose: "bg-rose-500", emerald: "bg-emerald-500", orange: "bg-orange-500",
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden mt-4">
      <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/20">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <RepeatIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Šablony &amp; Opakující se události</div>
          <div className="text-xs text-muted-foreground">Automaticky generované opakující se události</div>
        </div>
      </div>

      {/* Active rules */}
      {rules.length > 0 ? (
        <div className="divide-y">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-3 px-5 py-3">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${COLOR_DOT[rule.color ?? "sky"] ?? "bg-sky-500"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{rule.title}</div>
                <div className="text-xs text-muted-foreground">{ruleLabel(rule)}</div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {rule.allDay ? "celý den" : `${String(rule.startHour).padStart(2,"0")}:${String(rule.startMinute).padStart(2,"0")}`}
              </div>
              <button
                type="button"
                onClick={() => onDelete(rule.id)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors"
                title="Smazat pravidlo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-6 text-sm text-muted-foreground text-center">
          Žádné opakující se události. Přidej šablony níže nebo vytvoř událost s opakováním.
        </div>
      )}

      {/* Default templates */}
      <div className="px-5 py-4 border-t bg-muted/10">
        <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Přidat výchozí šablony
        </div>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_TEMPLATES.map((tmpl) => {
            const alreadyAdded = rules.some((r) => r.title === tmpl.title);
            return (
              <button
                key={tmpl.title}
                type="button"
                disabled={alreadyAdded}
                onClick={() => onAdd(tmpl)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className={`w-2 h-2 rounded-full ${COLOR_DOT[tmpl.color ?? "sky"]}`} />
                {tmpl.title}
                {alreadyAdded && <span className="text-muted-foreground">(přidáno)</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function CalendarSettings({
  syncStatus, syncBusy,
  appleId, appSpecificPassword, calendarUrl,
  availableCalendars, selectedCalendarUrl,
  recurringRules,
  onAppleIdChange, onPasswordChange, onCalendarUrlChange, onSelectedCalendarChange,
  onConnect, onDisconnect, onApplyCalendar, onSync,
  onAddRecurringRule, onDeleteRecurringRule,
  onBack,
}: {
  syncStatus: CalendarSyncStatus | null;
  syncBusy: boolean;
  appleId: string;
  appSpecificPassword: string;
  calendarUrl: string;
  availableCalendars: AppleCalendarOption[];
  selectedCalendarUrl: string;
  recurringRules: StoredRecurringRule[];
  onAppleIdChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onCalendarUrlChange: (v: string) => void;
  onSelectedCalendarChange: (v: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onApplyCalendar: () => void;
  onSync: () => void;
  onAddRecurringRule: (rule: Omit<StoredRecurringRule, "id" | "exceptions">) => void;
  onDeleteRecurringRule: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="container-fluid py-5 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět
        </button>
        <h1 className="text-base font-semibold">Nastavení kalendáře</h1>
      </div>

      {/* Apple Calendar Sync */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/20">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
            <Apple className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Apple Kalendář</div>
            <div className="text-xs text-muted-foreground">Obousměrná synchronizace CRM s iCloud</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {syncStatus?.connected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Připojeno</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Nepřipojeno</span>
              </>
            )}
          </div>
        </div>

        {syncStatus?.connected && syncStatus.calendarName && (
          <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-b flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">{syncStatus.calendarName}</span>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {syncStatus.lastSyncAt
                ? `Sync: ${new Date(syncStatus.lastSyncAt).toLocaleString("cs-CZ")}`
                : "Dosud nesynchronizováno"}
              {syncStatus.trackedEvents ? ` · ${syncStatus.trackedEvents} událostí` : ""}
            </div>
          </div>
        )}

        <div className="px-5 py-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Apple ID</div>
              <input
                value={appleId}
                onChange={(e) => onAppleIdChange(e.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-muted disabled:text-muted-foreground"
                placeholder="name@icloud.com"
                disabled={Boolean(syncStatus?.connected)}
              />
            </label>
            {syncStatus?.connected ? (
              <label className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Stav přihlášení</div>
                <input
                  value="Apple účet je připojen"
                  readOnly
                  className="h-9 w-full rounded-lg border bg-muted px-3 text-sm text-muted-foreground"
                />
              </label>
            ) : (
              <label className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">App-Specific Password</div>
                <input
                  type="password"
                  value={appSpecificPassword}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                />
              </label>
            )}
          </div>
          <label className="space-y-1 block">
            <div className="text-xs font-medium text-muted-foreground">URL kalendáře (volitelné)</div>
            <input
              value={calendarUrl}
              onChange={(e) => onCalendarUrlChange(e.target.value)}
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-muted disabled:text-muted-foreground"
              placeholder="https://caldav.icloud.com/..."
              disabled={Boolean(syncStatus?.connected)}
            />
          </label>
          {syncStatus?.connected && availableCalendars.length > 0 && (
            <div className="flex gap-2 items-end">
              <label className="space-y-1 flex-1">
                <div className="text-xs font-medium text-muted-foreground">Vybraný iCloud kalendář</div>
                <select
                  value={selectedCalendarUrl}
                  onChange={(e) => onSelectedCalendarChange(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Vyber kalendář...</option>
                  {availableCalendars.map((cal) => (
                    <option key={cal.url} value={cal.url}>{cal.name}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={onApplyCalendar}
                disabled={!selectedCalendarUrl || syncBusy}
                className="h-9 px-3 rounded-lg border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Použít
              </button>
            </div>
          )}
        </div>

        {syncStatus?.lastError && (
          <div className="px-5 py-2 bg-rose-50 dark:bg-rose-950/30 border-t text-xs text-rose-600 dark:text-rose-400">
            Chyba: {syncStatus.lastError}
          </div>
        )}

        <div className="px-5 py-3 border-t bg-muted/10 flex flex-wrap gap-2">
          {!syncStatus?.connected && (
            <button
              type="button"
              onClick={onConnect}
              disabled={syncBusy}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Apple className="w-3.5 h-3.5" />
              Připojit Apple Kalendář
            </button>
          )}
          <button
            type="button"
            onClick={onSync}
            disabled={!syncStatus?.connected || syncBusy}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncBusy ? "animate-spin" : ""}`} />
            Synchronizovat nyní
          </button>
          <button
            type="button"
            onClick={onDisconnect}
            disabled={!syncStatus?.connected || syncBusy}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 ml-auto"
          >
            <Unlink className="w-3.5 h-3.5" />
            Odpojit
          </button>
        </div>
      </div>

      {/* Templates & Recurring */}
      <TemplatesSection
        rules={recurringRules}
        onAdd={onAddRecurringRule}
        onDelete={onDeleteRecurringRule}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CalendarPage() {
  const { activeCalendarView, setCalendarView } = useLayout();
  const isMobile = useIsMobile();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [sidebarTasks, setSidebarTasks] = useState<SidebarTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [appleId, setAppleId] = useState("");
  const [appSpecificPassword, setAppSpecificPassword] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [availableCalendars, setAvailableCalendars] = useState<AppleCalendarOption[]>([]);
  const [selectedCalendarUrl, setSelectedCalendarUrl] = useState("");
  const [recurringRules, setRecurringRules] = useState<StoredRecurringRule[]>(() => loadRules());

  // Calendar options (for EventDialog) – all available Apple calendars when connected
  const calendarOptions = useMemo<CalendarOption[]>(() => {
    if (!syncStatus?.connected) return [];
    if (availableCalendars.length > 0) {
      return availableCalendars.map((cal) => ({
        id: cal.url,
        name: cal.name,
        color: "sky" as const,
      }));
    }
    // Fallback: at least show the currently selected calendar by name
    if (syncStatus.calendarName) {
      return [{ id: "icloud", name: syncStatus.calendarName, color: "sky" as const }];
    }
    return [];
  }, [syncStatus, availableCalendars]);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasksResponse, dealsResponse, activitiesResponse, me] = await Promise.all([
        fetchTasks({ limit: 500 }),
        fetchDeals({ limit: 500 }),
        fetchActivities({ limit: 500 }),
        fetchMe(),
      ]);
      setCurrentUserId(me?.id ?? null);
      // Tasks go into the sidebar; only show them as calendar events if they have a dueDate
      setSidebarTasks(
        tasksResponse.data.map((t): SidebarTask => ({
          id: t.id,
          title: t.title,
          description: t.description,
          dueDate: t.dueDate,
          priority: (t.priority as SidebarTask["priority"]) ?? undefined,
          status: t.status,
          contactName: t.contact
            ? `${t.contact.firstName ?? ""} ${t.contact.lastName ?? ""}`.trim() || undefined
            : undefined,
        }))
      );
      const mapped = [
        // Tasks with dueDate still appear in the calendar grid as markers
        ...tasksResponse.data.map(mapTaskEvent).filter((e): e is CalendarEvent => e !== null),
        ...dealsResponse.data.map(mapDealEvent).filter((e): e is CalendarEvent => e !== null),
        ...activitiesResponse.data.map(mapActivityEvent),
      ];
      setEvents(mapped);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Načtení kalendáře selhalo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSyncStatus = useCallback(async () => {
    try {
      const status = await fetchCalendarSyncStatus();
      setSyncStatus(status);
      setAppleId(status.appleId ?? "");
      setCalendarUrl(status.calendarUrl ?? "");
      setSelectedCalendarUrl(status.calendarUrl ?? "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Načtení Apple sync stavu selhalo.");
    }
  }, []);

  const loadAppleCalendars = useCallback(async () => {
    try {
      const response = await fetchAppleCalendars();
      setAvailableCalendars(response.calendars ?? []);
      if (response.selectedCalendarUrl) setSelectedCalendarUrl(response.selectedCalendarUrl);
    } catch (err) {
      setAvailableCalendars([]);
      toast.error(err instanceof Error ? err.message : "Načtení seznamu iCloud kalendářů selhalo.");
    }
  }, []);

  useEffect(() => {
    void loadEvents();
    void loadSyncStatus();
  }, [loadEvents, loadSyncStatus]);

  useEffect(() => {
    if (syncStatus?.connected) void loadAppleCalendars();
  }, [syncStatus?.connected, loadAppleCalendars]);

  const runSyncAndRefresh = useCallback(async () => {
    setSyncBusy(true);
    try {
      await runCalendarSync();
      await Promise.all([loadEvents(), loadSyncStatus()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Synchronizace kalendáře selhala.");
    } finally {
      setSyncBusy(false);
    }
  }, [loadEvents, loadSyncStatus]);

  // ── Recurring rules management ──
  const handleAddRecurringRule = useCallback((tmpl: Omit<StoredRecurringRule, "id" | "exceptions">) => {
    const newRule: StoredRecurringRule = {
      ...tmpl,
      id: Math.random().toString(36).slice(2),
      exceptions: [],
    };
    setRecurringRules((prev) => {
      const updated = [...prev, newRule];
      saveRules(updated);
      return updated;
    });
    toast.success(`Šablona "${newRule.title}" přidána`);
  }, []);

  const handleDeleteRecurringRule = useCallback((id: string) => {
    setRecurringRules((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveRules(updated);
      return updated;
    });
  }, []);

  const handleDeleteRecurringException = useCallback((eventId: string) => {
    // eventId format: recurring:ruleId:YYYY-MM-DD
    const parts = eventId.split(":");
    if (parts.length < 3) return;
    const [, ruleId, dateKey] = parts;
    setRecurringRules((prev) => {
      const updated = prev.map((r) =>
        r.id === ruleId
          ? { ...r, exceptions: [...(r.exceptions ?? []), dateKey] }
          : r
      );
      saveRules(updated);
      return updated;
    });
  }, []);

  const handleUpdateRecurringRule = useCallback((ruleId: string, event: CalendarEvent) => {
    setRecurringRules((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== ruleId) return r;
        const startH = event.start.getHours();
        const startM = event.start.getMinutes();
        const durationMs = event.end.getTime() - event.start.getTime();
        return {
          ...r,
          title: event.title,
          description: event.description,
          color: event.color,
          priority: event.priority,
          location: event.location,
          calendarId: event.calendarId,
          allDay: event.allDay ?? false,
          startHour: startH,
          startMinute: startM,
          durationMinutes: Math.max(15, Math.round(durationMs / 60_000)),
          ...(event.recurrence ? { recurrence: event.recurrence } : {}),
        };
      });
      saveRules(updated);
      return updated;
    });
  }, []);

  // ── Event handlers ──
  const handleEventAdd = (event: CalendarEvent) => {
    // If event has recurrence → save as recurring rule
    if (event.recurrence) {
      const [startH, startM] = event.start
        ? [event.start.getHours(), event.start.getMinutes()]
        : [9, 0];
      const durationMs = event.end.getTime() - event.start.getTime();
      const newRule: StoredRecurringRule = {
        id: Math.random().toString(36).slice(2),
        title: event.title,
        description: event.description,
        color: event.color,
        priority: event.priority,
        location: event.location,
        calendarId: event.calendarId,
        allDay: event.allDay ?? false,
        startHour: startH,
        startMinute: startM,
        durationMinutes: Math.max(15, Math.round(durationMs / 60_000)),
        recurrence: event.recurrence,
        exceptions: [],
      };
      setRecurringRules((prev) => {
        const updated = [...prev, newRule];
        saveRules(updated);
        return updated;
      });
      toast.success(`Opakující se událost "${event.title}" uložena`);
      return;
    }

    // Otherwise → create activity in backend
    void (async () => {
      if (!currentUserId) {
        toast.error("Chybí přihlášený uživatel.");
        return;
      }
      try {
        await createActivity({
          type: "calendar",
          subject: event.title?.trim() || "New event",
          description: event.description,
          startDate: event.start.toISOString(),
          endDate: event.end.toISOString(),
          location: event.location,
          userId: currentUserId,
          isCompleted: false,
        });
        // If connected: sync immediately (runSyncAndRefresh includes loadEvents).
        // Otherwise just reload events.
        if (syncStatus?.connected) void runSyncAndRefresh();
        else await loadEvents();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Uložení události selhalo.");
      }
    })();
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    // Recurring instance → update the rule
    if (updatedEvent.recurringId) {
      handleUpdateRecurringRule(updatedEvent.recurringId, updatedEvent);
      toast.success("Opakující se události aktualizovány");
      return;
    }

    void (async () => {
      const parsed = decodeEventId(updatedEvent.id);
      if (!parsed) return;
      try {
        if (parsed.source === "task") {
          await updateTask(parsed.id, {
            title: updatedEvent.title.replace(/^\[TODO\]\s*/, ""),
            description: updatedEvent.description,
            dueDate: updatedEvent.start.toISOString(),
          });
        } else if (parsed.source === "deal") {
          await updateDeal(parsed.id, {
            title: updatedEvent.title.replace(/^\[CRM Deal\]\s*/, ""),
            description: updatedEvent.description,
            expectedCloseDate: updatedEvent.start.toISOString(),
          });
        } else {
          await updateActivity(parsed.id, {
            subject: updatedEvent.title,
            description: updatedEvent.description,
            startDate: updatedEvent.start.toISOString(),
            endDate: updatedEvent.end.toISOString(),
            location: updatedEvent.location,
          });
        }
        setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
        if (syncStatus?.connected) void runSyncAndRefresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Aktualizace události selhala.");
        await loadEvents();
      }
    })();
  };

  const handleEventDelete = (eventId: string) => {
    // Recurring instance → add exception
    if (eventId.startsWith("recurring:")) {
      handleDeleteRecurringException(eventId);
      return;
    }

    void (async () => {
      const parsed = decodeEventId(eventId);
      if (!parsed) return;
      try {
        if (parsed.source !== "activity") {
          toast.error("Mazat lze pouze události vytvořené v kalendáři.");
          await loadEvents();
          return;
        }
        await deleteActivity(parsed.id);
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (syncStatus?.connected) void runSyncAndRefresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Smazání události selhalo.");
      }
    })();
  };

  const handleConnectApple = () => {
    void (async () => {
      setSyncBusy(true);
      try {
        if (!appleId.trim() || !appSpecificPassword.trim()) {
          toast.error("Vyplň Apple ID a app-specific password.");
          return;
        }
        await connectAppleCalendar({
          appleId: appleId.trim(),
          appSpecificPassword: appSpecificPassword.trim(),
          calendarUrl: calendarUrl.trim() || undefined,
        });
        setAppSpecificPassword("");
        await Promise.all([loadEvents(), loadSyncStatus(), loadAppleCalendars()]);
        toast.success("Apple kalendář je připojený a synchronizovaný.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Připojení Apple kalendáře selhalo.");
      } finally {
        setSyncBusy(false);
      }
    })();
  };

  const handleDisconnectApple = () => {
    void (async () => {
      setSyncBusy(true);
      try {
        await disconnectAppleCalendar();
        await loadSyncStatus();
        setAvailableCalendars([]);
        toast.success("Apple kalendář byl odpojen.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Odpojení Apple kalendáře selhalo.");
      } finally {
        setSyncBusy(false);
      }
    })();
  };

  const handleApplySelectedCalendar = () => {
    void (async () => {
      if (!selectedCalendarUrl) { toast.error("Vyber kalendář."); return; }
      setSyncBusy(true);
      try {
        await setAppleCalendar(selectedCalendarUrl);
        await Promise.all([loadEvents(), loadSyncStatus(), loadAppleCalendars()]);
        toast.success("Kalendář byl přepnutý.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Přepnutí kalendáře selhalo.");
      } finally {
        setSyncBusy(false);
      }
    })();
  };

  // ── Sidebar task handlers (must be before any conditional returns) ──
  const handleSidebarTaskDrop = useCallback(async (task: SidebarTask, start: Date) => {
    setSidebarTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, dueDate: start.toISOString() } : t))
    );
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === encodeEventId("task", task.id)) {
          return { ...e, start, end: addHours(start, 1) };
        }
        return e;
      })
    );
    try {
      await updateTask(task.id, { dueDate: start.toISOString() });
      toast.success(`Úkol "${task.title}" naplánován na ${start.toLocaleString("cs-CZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodařilo se aktualizovat úkol");
      await loadEvents();
    }
  }, [loadEvents]);

  const handleSidebarTaskToggle = useCallback(async (taskId: string) => {
    const task = sidebarTasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === "done" ? "todo" : "done";
    setSidebarTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await updateTask(taskId, { status: newStatus });
    } catch {
      setSidebarTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)));
    }
  }, [sidebarTasks]);

  // Merge backend events + expanded recurring events
  const allEvents = useMemo(() => {
    const recurringEvents = expandRecurringRules(recurringRules);
    const sorted = [...events, ...recurringEvents].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
    return sorted;
  }, [events, recurringRules]);

  if (isLoading) {
    return (
      <div className="container-fluid py-5">
        <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground animate-pulse">
          Načítám kalendář...
        </div>
      </div>
    );
  }

  // ── Settings View ──
  if (activeCalendarView === "settings") {
    return (
      <CalendarSettings
        syncStatus={syncStatus}
        syncBusy={syncBusy}
        appleId={appleId}
        appSpecificPassword={appSpecificPassword}
        calendarUrl={calendarUrl}
        availableCalendars={availableCalendars}
        selectedCalendarUrl={selectedCalendarUrl}
        recurringRules={recurringRules}
        onAppleIdChange={setAppleId}
        onPasswordChange={setAppSpecificPassword}
        onCalendarUrlChange={setCalendarUrl}
        onSelectedCalendarChange={setSelectedCalendarUrl}
        onConnect={handleConnectApple}
        onDisconnect={handleDisconnectApple}
        onApplyCalendar={handleApplySelectedCalendar}
        onSync={() => void runSyncAndRefresh()}
        onAddRecurringRule={handleAddRecurringRule}
        onDeleteRecurringRule={handleDeleteRecurringRule}
        onBack={() => setCalendarView("calendar")}
      />
    );
  }

  // ── Calendar View ──
  return (
    <div className="container-fluid py-5">
      <EventCalendar
        events={allEvents}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        availableCalendars={calendarOptions}
        syncBusy={syncBusy}
        syncConnected={Boolean(syncStatus?.connected)}
        sidebarTasks={sidebarTasks}
        onSidebarTaskDrop={(task, start) => void handleSidebarTaskDrop(task, start)}
        onSidebarTaskToggle={(id) => void handleSidebarTaskToggle(id)}
        initialView="month"
      />
    </div>
  );
}
