export type CalendarView = "month" | "week" | "day" | "agenda"

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange"

export type EventPriority = "low" | "medium" | "high" | "urgent"

export type RecurrenceFrequency = "weekly" | "monthly"

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  /** For weekly: 0=Sun, 1=Mon, …, 6=Sat – multiple days allowed */
  daysOfWeek?: number[]
  /** For monthly: which day of the month (1-31) */
  dayOfMonth?: number
  /** Stop generating occurrences after this ISO date string */
  endDate?: string
}

export interface CalendarOption {
  id: string
  name: string
  color?: EventColor
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: EventColor
  location?: string
  priority?: EventPriority
  calendarId?: string
  /** Set on new events to make them recurring (stored in localStorage, not backend) */
  recurrence?: RecurrenceRule
  /** Present on auto-generated recurring instances; equals the rule's id */
  recurringId?: string
}

// ─── Sidebar task (passed from CRM into the calendar sidebar) ───────────────
export interface SidebarTask {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority?: EventPriority
  status?: string
  contactName?: string
}

// ─── Stored recurring rule (persisted in localStorage) ──────────────────────
export interface StoredRecurringRule {
  id: string
  title: string
  description?: string
  color?: EventColor
  priority?: EventPriority
  location?: string
  calendarId?: string
  allDay: boolean
  startHour: number
  startMinute: number
  durationMinutes: number
  recurrence: RecurrenceRule
  /** ISO date strings (YYYY-MM-DD) of occurrences that were individually deleted */
  exceptions?: string[]
}
