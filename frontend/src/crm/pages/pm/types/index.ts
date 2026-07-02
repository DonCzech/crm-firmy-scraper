// ============================================================
// PROJECT MANAGEMENT MODULE — TYPE DEFINITIONS
// ============================================================

export type PmPriority = 'low' | 'normal' | 'high' | 'critical';

export type PmProjectStatus =
  | 'Backlog'
  | 'Připraveno'
  | 'Aktivní'
  | 'Blokováno'
  | 'Čeká'
  | 'Hotovo';

export type PmTaskStatus =
  | 'Backlog'
  | 'Připraveno'
  | 'Aktivní'
  | 'Blokováno'
  | 'Čeká'
  | 'Hotovo'
  | 'Archiv';

export type PmSlotType =
  | 'focus'
  | 'operativa'
  | 'admin'
  | 'review'
  | 'qa'
  | 'seo'
  | 'content'
  | 'dev';

export type PmSlotStatus = 'planned' | 'in_progress' | 'done' | 'skipped';

export type PmMilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface PmProject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  status: PmProjectStatus;
  priority: PmPriority;
  phase?: string;
  activeWave: boolean;
  weeklyTimeBudget: number;
  nextStep?: string;
  mainGoal?: string;
  monetizationType?: string;
  color?: string;
  domain?: string;
  ownerId?: string;
  startDate?: string;
  targetDate?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  areas?: PmArea[];
  milestones?: PmMilestone[];
  weeklyCapacities?: PmWeeklyCapacity[];
  _count?: { tasks: number; worklogs: number; dailySlots?: number };
  weeklyHours?: { planned: number; actual: number };
}

export interface PmArea {
  id: string;
  name: string;
  description?: string;
  order: number;
  status: string;
  projectId: string;
  tasks?: PmTask[];
  createdAt: string;
  updatedAt: string;
}

export interface PmTask {
  id: string;
  title: string;
  description?: string;
  status: PmTaskStatus;
  priority: PmPriority;
  estimatedDuration?: number; // minutes
  actualDuration?: number;    // minutes
  deadline?: string;
  nextStep?: string;
  definitionOfDone?: string;
  assignedTo?: string;
  tags?: string;
  subtasks?: Array<{ id: string; title: string; done: boolean; createdAt: string; parentId?: string | null }>;
  comments?: Array<{ id: string; text: string; createdAt: string }>;
  attachments?: Array<{ id: string; name: string; size: number; type: string; url: string; createdAt?: string }>;
  order: number;
  blockedReason?: string;
  projectId: string;
  areaId?: string;
  milestoneId?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  project?: { id: string; name: string; color?: string };
  area?: { id: string; name: string };
  milestone?: { id: string; name: string };
  worklogs?: PmWorklog[];
}

export interface PmMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  status: PmMilestoneStatus;
  progress: number;
  projectId: string;
  tasks?: { id: string; title: string; status: PmTaskStatus }[];
  createdAt: string;
  updatedAt: string;
}

export interface PmDailySlot {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  plannedDuration: number; // minutes
  actualDuration: number;  // minutes
  slotType: PmSlotType;
  resultNote?: string;
  status: PmSlotStatus;
  projectId?: string;
  taskId?: string;
  project?: { id: string; name: string; color?: string; priority?: string };
  task?: { id: string; title: string; status?: string; estimatedDuration?: number };
  createdAt: string;
  updatedAt: string;
}

export interface PmWorklog {
  id: string;
  date: string;
  duration: number; // minutes
  note?: string;
  slotId?: string;
  projectId: string;
  taskId?: string;
  project?: { id: string; name: string; color?: string };
  task?: { id: string; title: string };
  createdAt: string;
  updatedAt: string;
}

export interface PmWeeklyCapacity {
  id: string;
  week: string;
  plannedHours: number;
  actualHours: number;
  projectId: string;
  project?: { id: string; name: string; color?: string; priority?: string; activeWave?: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface PmDaySummary {
  date: string;
  slots: PmDailySlot[];
  summary: {
    totalPlanned: number;
    totalActual: number;
    freeMinutes: number;
    overloaded: boolean;
    byProject: { projectId: string; name: string; color?: string | null; planned: number; actual: number }[];
  };
}

export interface PmDashboard {
  stats: {
    totalProjects: number;
    activeProjects: number;
    activeWaveProjects: number;
    blockedTasks: number;
    criticalTasks: number;
    todayPlannedMinutes: number;
    todayActualMinutes: number;
  };
  todaySlots: PmDailySlot[];
  weekCapacities: PmWeeklyCapacity[];
  projectsWithoutNextStep: { id: string; name: string; priority: string }[];
  upcomingDeadlines: (PmTask & { project: { id: string; name: string; color?: string } })[];
}

// Utility
export const PM_PRIORITY_LABELS: Record<PmPriority, string> = {
  low: 'Nízká',
  normal: 'Normální',
  high: 'Vysoká',
  critical: 'Kritická',
};

export const PM_STATUS_LABELS: Record<PmProjectStatus, string> = {
  Backlog: 'Backlog',
  Připraveno: 'Připraveno',
  Aktivní: 'Aktivní',
  Blokováno: 'Blokováno',
  Čeká: 'Čeká',
  Hotovo: 'Hotovo',
};

export const PM_TASK_STATUS_LABELS: Record<PmTaskStatus, string> = {
  Backlog: 'Backlog',
  Připraveno: 'Připraveno',
  Aktivní: 'Aktivní',
  Blokováno: 'Blokováno',
  Čeká: 'Čeká',
  Hotovo: 'Hotovo',
  Archiv: 'Archiv',
};

export const PM_SLOT_TYPE_LABELS: Record<PmSlotType, string> = {
  focus: 'Focus',
  operativa: 'Operativa',
  admin: 'Admin',
  review: 'Review',
  qa: 'QA',
  seo: 'SEO',
  content: 'Content',
  dev: 'Dev',
};

export const ESTIMATED_DURATION_PRESETS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
];

export function formatMinutes(minutes: number): string {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function currentIsoWeek(): string {
  const date = new Date();
  const thursday = new Date(date);
  thursday.setDate(thursday.getDate() - ((thursday.getDay() + 6) % 7) + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const weekNum = Math.ceil(((thursday.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7);
  return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

export function isoWeekMonday(week: string): Date {
  const [year, w] = week.split('-W');
  const yearNum = parseInt(year);
  const weekNum = parseInt(w);
  const jan4 = new Date(yearNum, 0, 4);
  const firstMondayOffset = (jan4.getDay() + 6) % 7;
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - firstMondayOffset);
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
  return monday;
}
