import { useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowUp,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit2,
  Flag,
  GripVertical,
  KanbanSquare,
  Layers,
  List,
  NotebookPen,
  Paperclip,
  Plus,
  Table2,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  type KanbanMoveEvent,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { TaskRow } from './components/task-row';
import { ActiveWaveDot, PriorityBadge, StatusBadge } from './components/pm-badge';
import { PmArea, PmMilestone, PmPriority, PmProject, PmTask, PmTaskStatus, formatMinutes } from './types';
import {
  pmCreateArea,
  pmCreateTask,
  pmDeleteArea,
  pmDeleteTask,
  pmFetchProject,
  pmReorderTasks,
  pmUpdateProject,
  pmUpdateArea,
  pmUpdateTask,
} from '../../services/backend';

type TaskFilter = 'all' | 'open' | 'done' | 'blocked';
type TaskView = 'list' | 'board';
type TodoStyleView = 'columns' | 'rows' | 'table' | 'timeline' | 'calendar' | 'notes';
type TodoStyleColumn = PmTaskStatus;

const TASK_BOARD_STATUSES: PmTaskStatus[] = ['Backlog', 'Připraveno', 'Aktivní', 'Blokováno', 'Čeká', 'Hotovo'];
const TODO_DEFAULT_COLUMNS: PmTaskStatus[] = ['Backlog', 'Připraveno', 'Aktivní', 'Hotovo'];
const DOMAIN_AREA_PREFIX = 'Doména:';
const DOMAIN_SECTION_NAMES = [
  'Google',
  'SEO',
  'Analytics a Tracking',
  'Reklamní platformy mimo Google',
  'Technický výkon',
  'Právní a compliance',
  'Bezpečnost',
  'Obsah a konverze',
  'Monitoring a údržba',
];

type TaskSubtask = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  parentId?: string | null;
};

type TaskComment = {
  id: string;
  text: string;
  createdAt: string;
};

type TaskAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type TaskDetailForm = {
  title: string;
  description: string;
  status: PmTaskStatus;
  priority: PmPriority;
  deadline: string;
  estimatedDuration: string;
  actualDuration: string;
  blockedReason: string;
  nextStep: string;
  definitionOfDone: string;
  tags: string;
};

type PmTaskMeta = {
  dependencyIds: string[];
};

type PmAutomationConfig = {
  autoSetActualOnDone: boolean;
  autoPriorityOnBlocked: boolean;
  autoAssignOnActive: boolean;
  defaultAssignee: string;
  defaultTag: string;
};

type QuickTaskTemplate = {
  id: string;
  name: string;
  tasks: string[];
};

const TASK_META_COMMENT_ID = '__pm_meta__';
const TASK_META_PREFIX = '__pm_meta__:';
const DEFAULT_AUTOMATION_CONFIG: PmAutomationConfig = {
  autoSetActualOnDone: true,
  autoPriorityOnBlocked: true,
  autoAssignOnActive: false,
  defaultAssignee: '',
  defaultTag: '',
};

const DEFAULT_QUICK_TASK_TEMPLATES: QuickTaskTemplate[] = [
  {
    id: 'tpl-initial-backlog-domains',
    name: 'Backlog domény - základ',
    tasks: [
      'ochrana-prijmu.cz',
      'cv-editor.com',
      'Online-odhad.cz',
      'IQ-boost.com',
      'zivotni-pojisteni.com',
      'ceskypartner.cz',
      'asteralight.cz',
      'onlinekram.cz',
      'convee.co',
      'kontrola-pojistky.cz',
      'pojisteni-invalidity.cz',
      'kaukulacka-pojisteni.cz',
      'convee.co',
    ],
  },
];

export function PmDetailPage() {
  const { id, taskId: routeTaskId, subtaskId: routeSubtaskId } = useParams<{ id: string; taskId?: string; subtaskId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [taskView, setTaskView] = useState<TaskView>('list');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [boardColumns, setBoardColumns] = useState<Record<string, PmTask[]>>(() => initTaskBoard([]));
  const [todoStyleView, setTodoStyleView] = useState<TodoStyleView>('columns');
  const [todoStyleSearch, setTodoStyleSearch] = useState('');
  const [todoStyleStatusFilter, setTodoStyleStatusFilter] = useState<'all' | PmTaskStatus>('all');
  const [todoStyleAssigneeFilter, setTodoStyleAssigneeFilter] = useState('all');
  const [todoStyleAreaFilter, setTodoStyleAreaFilter] = useState('all');
  const [todoStyleActiveColumns, setTodoStyleActiveColumns] = useState<PmTaskStatus[]>(TODO_DEFAULT_COLUMNS);
  const [todoColumnsHydrated, setTodoColumnsHydrated] = useState(false);
  const [quickTaskTemplates, setQuickTaskTemplates] = useState<QuickTaskTemplate[]>(DEFAULT_QUICK_TASK_TEMPLATES);
  const [quickTemplatesHydrated, setQuickTemplatesHydrated] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [todoStyleColumnLabels, setTodoStyleColumnLabels] = useState<Record<PmTaskStatus, string>>(
    () =>
      TASK_BOARD_STATUSES.reduce((acc, status) => {
        acc[status] = status;
        return acc;
      }, {} as Record<PmTaskStatus, string>),
  );
  const [todoLabelsHydrated, setTodoLabelsHydrated] = useState(false);
  const [todoStyleColumns, setTodoStyleColumns] = useState<Record<TodoStyleColumn, PmTask[]>>(() =>
    initTodoStyleBoard([], undefined, TODO_DEFAULT_COLUMNS),
  );
  const [domainTodoView, setDomainTodoView] = useState<TodoStyleView>('columns');
  const [domainTodoSearch, setDomainTodoSearch] = useState('');
  const [domainTodoStatusFilter, setDomainTodoStatusFilter] = useState<'all' | PmTaskStatus>('all');
  const [domainTodoAssigneeFilter, setDomainTodoAssigneeFilter] = useState('all');
  const [domainTodoAreaFilter, setDomainTodoAreaFilter] = useState('all');
  const [domainTodoActiveColumns, setDomainTodoActiveColumns] = useState<PmTaskStatus[]>(TODO_DEFAULT_COLUMNS);
  const [domainTodoColumns, setDomainTodoColumns] = useState<Record<TodoStyleColumn, PmTask[]>>(() =>
    initTodoStyleBoard([], undefined, TODO_DEFAULT_COLUMNS),
  );
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<PmTask | null>(null);
  const [activeTaskMeta, setActiveTaskMeta] = useState<PmTaskMeta>({ dependencyIds: [] });
  const [automationConfig, setAutomationConfig] = useState<PmAutomationConfig>(DEFAULT_AUTOMATION_CONFIG);
  const [assigneeCapacityHours, setAssigneeCapacityHours] = useState<Record<string, number>>({});
  const [taskDetailForm, setTaskDetailForm] = useState<TaskDetailForm>(() => createTaskDetailForm());
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [focusModeEnabled, setFocusModeEnabled] = useState(true);
  const [projectNoteDraft, setProjectNoteDraft] = useState('');
  const [focusSubtaskDraft, setFocusSubtaskDraft] = useState('');
  const [taskInstructionDraft, setTaskInstructionDraft] = useState('');
  const [taskInstructionLastSaved, setTaskInstructionLastSaved] = useState('');
  const [taskInstructionSaving, setTaskInstructionSaving] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [focusDragItem, setFocusDragItem] = useState<{ type: 'section' | 'task'; id: string } | null>(null);
  const [focusDropSectionId, setFocusDropSectionId] = useState<string | null>(null);
  const [focusDropTaskId, setFocusDropTaskId] = useState<string | null>(null);
  const [focusDropTopLevelBeforeId, setFocusDropTopLevelBeforeId] = useState<string | null>(null);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskAreaId, setQuickTaskAreaId] = useState('');
  const [automationExpanded, setAutomationExpanded] = useState(false);
  const [workloadExpanded, setWorkloadExpanded] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [detailAutosaveState, setDetailAutosaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const detailAutosaveKeyRef = useRef('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['pm-project', id],
    queryFn: () => pmFetchProject(id!),
    enabled: !!id,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['pm-project', id] });

  const updateProject = useMutation({
    mutationFn: (data: any) => pmUpdateProject(id!, data),
    onSuccess: () => {
      refresh();
      toast.success('Projekt uložen');
    },
    onError: () => toast.error('Uložení projektu selhalo'),
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) => pmUpdateTask(taskId, data),
    onSuccess: refresh,
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Uložení úkolu selhalo')),
  });

  const createTask = useMutation({
    mutationFn: (data: any) => pmCreateTask({ ...data, projectId: id }),
    onSuccess: refresh,
    onError: () => toast.error('Vytvoření úkolu selhalo'),
  });

  const deleteTask = useMutation({
    mutationFn: (taskId: string) => pmDeleteTask(taskId),
    onSuccess: refresh,
    onError: () => toast.error('Smazání úkolu selhalo'),
  });

  const createArea = useMutation({
    mutationFn: (data: any) => pmCreateArea(data),
    onSuccess: refresh,
    onError: () => toast.error('Vytvoření oblasti selhalo'),
  });

  const updateArea = useMutation({
    mutationFn: ({ areaId, data }: { areaId: string; data: any }) => pmUpdateArea(areaId, data),
    onSuccess: () => {
      refresh();
      toast.success('Poznámka sekce uložena');
    },
    onError: () => toast.error('Uložení poznámky sekce selhalo'),
  });

  const deleteArea = useMutation({
    mutationFn: (areaId: string) => pmDeleteArea(areaId),
    onSuccess: refresh,
    onError: () => toast.error('Smazání oblasti selhalo'),
  });

  const p = (project as PmProject & { areas: Array<PmArea & { tasks?: PmTask[] }>; milestones: PmMilestone[] } | undefined) ?? null;
  const allTasks = useMemo(() => (p?.areas ?? []).flatMap((a) => a.tasks ?? []), [p]);
  const activeDomain = (searchParams.get('domain') ?? '').trim();
  const domainModeEnabled = Boolean(activeDomain);
  const domainNames = useMemo(() => {
    const templateDomains = quickTaskTemplates
      .find((tpl) => tpl.name.trim().toLocaleLowerCase('cs-CZ') === 'backlog domény - základ')
      ?.tasks ?? [];
    const fromSeo = (p?.areas ?? [])
      .filter((area) => area.name === 'SEO')
      .flatMap((area) => area.tasks ?? [])
      .map((task) => task.title);
    const fromDomainAreas = (p?.areas ?? [])
      .map((area) => parseDomainAreaName(area.name)?.domain ?? '')
      .filter(Boolean);

    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const raw of [...templateDomains, ...fromSeo, ...fromDomainAreas]) {
      const value = raw.trim();
      if (!value || !isDomainLikeTitle(value)) continue;
      const key = value.toLocaleLowerCase('cs-CZ');
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push(value);
    }
    return ordered;
  }, [quickTaskTemplates, p?.areas]);

  useEffect(() => {
    if (!activeDomain) return;
    const exists = domainNames.some((domain) => domain.toLocaleLowerCase('cs-CZ') === activeDomain.toLocaleLowerCase('cs-CZ'));
    if (exists) return;
    const next = new URLSearchParams(searchParams);
    next.delete('domain');
    setSearchParams(next);
  }, [activeDomain, domainNames, searchParams, setSearchParams]);

  useEffect(() => {
    if (activeDomain) return;
    if (domainNames.length === 0) return;
    const next = new URLSearchParams(searchParams);
    next.set('domain', domainNames[0]);
    setSearchParams(next);
  }, [activeDomain, domainNames, searchParams, setSearchParams]);

  const domainAreas = useMemo(() => {
    if (!activeDomain) return [] as Array<PmArea & { domainSection: string }>;
    const list = (p?.areas ?? [])
      .map((area) => ({ area, parsed: parseDomainAreaName(area.name) }))
      .filter((item): item is { area: PmArea & { tasks?: PmTask[] }; parsed: { domain: string; section: string } } =>
        Boolean(item.parsed && item.parsed.domain.toLocaleLowerCase('cs-CZ') === activeDomain.toLocaleLowerCase('cs-CZ')),
      )
      .map((item) => ({ ...item.area, domainSection: item.parsed.section }))
      .sort(
        (a, b) =>
          DOMAIN_SECTION_NAMES.indexOf(a.domainSection) - DOMAIN_SECTION_NAMES.indexOf(b.domainSection),
      );
    return list;
  }, [activeDomain, p?.areas]);

  const domainAreaIdSet = useMemo(() => new Set(domainAreas.map((area) => area.id)), [domainAreas]);
  const domainTasks = useMemo(
    () => allTasks.filter((task) => task.areaId && domainAreaIdSet.has(task.areaId)),
    [allTasks, domainAreaIdSet],
  );
  const scopedAreas = domainModeEnabled ? domainAreas : (p?.areas ?? []);
  const scopedTasks = domainModeEnabled ? domainTasks : allTasks;
  const doneTasks = scopedTasks.filter((t) => t.status === 'Hotovo' || t.status === 'Archiv').length;
  const blockedTasks = scopedTasks.filter((t) => t.status === 'Blokováno').length;
  const progressPct = scopedTasks.length > 0 ? Math.round((doneTasks / scopedTasks.length) * 100) : 0;
  const templateTasks = useMemo(
    () =>
      allTasks
        .filter((task) => task.title.startsWith('[TPL] ') || (task.tags ?? '').includes('[TPL:online-project-v1]'))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allTasks],
  );
  const isTemplateProject = templateTasks.length > 0;
  const doneTemplateTasks = templateTasks.filter((task) => task.status === 'Hotovo' || task.status === 'Archiv').length;
  const focusProgressPct = templateTasks.length > 0 ? Math.round((doneTemplateTasks / templateTasks.length) * 100) : 0;
  const isTaskDetailRoute = Boolean(routeTaskId);
  const isSubtaskDetailRoute = Boolean(routeSubtaskId);
  const selectedTemplateTaskId = routeTaskId ?? searchParams.get('taskId');
  const currentTemplateTask = useMemo(
    () =>
      (selectedTemplateTaskId
        ? templateTasks.find((task) => task.id === selectedTemplateTaskId)
        : null)
      ?? templateTasks.find((task) => !['Hotovo', 'Archiv'].includes(task.status))
      ?? templateTasks[templateTasks.length - 1]
      ?? null,
    [templateTasks, selectedTemplateTaskId],
  );
  const currentTemplateTaskIndex = useMemo(
    () => (currentTemplateTask ? templateTasks.findIndex((task) => task.id === currentTemplateTask.id) : -1),
    [currentTemplateTask, templateTasks],
  );
  const currentTemplateTaskName = currentTemplateTask?.title.replace('[TPL] ', '').trim() ?? '';
  const currentTemplateTaskOrdinal =
    currentTemplateTaskIndex >= 0 && templateTasks.length > 0
      ? `${currentTemplateTaskIndex + 1}/${templateTasks.length}`
      : null;
  const currentAiResultFieldLabel = currentTemplateTask
    ? `Výsledek Úkol ${currentTemplateTaskOrdinal}: ${currentTemplateTaskName || 'Bez názvu'} - ${p?.name ?? 'Projekt'}`
    : 'Výsledek Úkolu - Projekt';
  const currentTaskPageUrl = id ? `http://localhost:5173/core/crm/pm/project/${id}` : '';
  const currentTaskDetailPageUrl = id && currentTemplateTask ? `http://localhost:5173/core/crm/pm/project/${id}/task/${currentTemplateTask.id}` : '';
  const currentTaskDeepLink = currentTaskDetailPageUrl || (currentTaskPageUrl && currentTemplateTask ? `${currentTaskPageUrl}?taskId=${currentTemplateTask.id}` : currentTaskPageUrl);
  const currentTemplateSubtasks = normalizeSubtasks(currentTemplateTask?.subtasks);
  const currentDetailSubtask = routeSubtaskId
    ? currentTemplateSubtasks.find((item) => item.id === routeSubtaskId) ?? null
    : null;

  const switchDomainPage = (domain: string) => {
    const next = new URLSearchParams(searchParams);
    const value = domain.trim();
    if (value) next.set('domain', value);
    else next.delete('domain');
    setSearchParams(next);
  };

  useEffect(() => {
    if (!quickTaskOpen) return;
    if (quickTaskAreaId) return;
    const firstAreaId = scopedAreas[0]?.id;
    if (firstAreaId) setQuickTaskAreaId(firstAreaId);
  }, [quickTaskOpen, quickTaskAreaId, scopedAreas]);

  useEffect(() => {
    if (!quickTaskAreaId) return;
    const exists = scopedAreas.some((area) => area.id === quickTaskAreaId);
    if (!exists) setQuickTaskAreaId('');
  }, [quickTaskAreaId, scopedAreas]);
  const currentTemplateTopLevelSubtasks = useMemo(
    () => currentTemplateSubtasks.filter((item) => !item.parentId),
    [currentTemplateSubtasks],
  );
  const activeTemplateSubtaskIndex = useMemo(
    () => currentTemplateSubtasks.findIndex((item) => !item.done),
    [currentTemplateSubtasks],
  );
  const activeTemplateSubtask = activeTemplateSubtaskIndex >= 0 ? currentTemplateSubtasks[activeTemplateSubtaskIndex] : null;
  const showStructurePresetButton = useMemo(() => {
    if (!currentTemplateTask) return false;
    const title = currentTemplateTask.title.toLowerCase();
    return title.includes('2/28') || title.includes('rozcestnik') || title.includes('rozcestník');
  }, [currentTemplateTask]);
  const competitorExamples = useMemo(() => {
    const domain = (p?.domain ?? '').toLowerCase();
    const name = (p?.name ?? '').toLowerCase();
    const haystack = `${domain} ${name}`;

    if (haystack.includes('iq')) {
      return ['myiq.com', 'my-iq.com', 'test-iq.org', 'iqtestfoundation.org'];
    }
    if (haystack.includes('pojist') || haystack.includes('insurance') || haystack.includes('poji')) {
      return ['allianz.cz', 'kooperativa.cz', 'generaliceska.cz', 'cpp.cz'];
    }
    if (haystack.includes('realit') || haystack.includes('reality')) {
      return ['sreality.cz', 'bezrealitky.cz', 'reality.idnes.cz', 'realitymorava.cz'];
    }
    if (haystack.includes('cv') || haystack.includes('resume')) {
      return ['zety.com', 'novoresume.com', 'enhancv.com', 'kickresume.com'];
    }
    return [];
  }, [p?.domain, p?.name]);

  const currentTaskChatPrompt = useMemo(() => {
    if (!currentTemplateTask) return '';
    const subtasksText = currentTemplateSubtasks.length
      ? currentTemplateSubtasks.map((item, index) => `${index + 1}. ${item.title}${item.done ? ' [HOTOVO]' : ''}`).join('\n')
      : '1. Projdi zadání a navrhni konkrétní postup.';
    const taskTitleLower = currentTemplateTask.title.toLowerCase();
    const isCompetitorDiscoveryTask = taskTitleLower.includes('najdi 5 konkurenčních webů');
    const isCompetitorHubTask =
      taskTitleLower.includes('rozcestnik stranek konkurence') || taskTitleLower.includes('porovnani s nasim webem');
    const isCompetitionAudit = taskTitleLower.includes('audit konkurence');
    const isCompetitionAnalysis = taskTitleLower.includes('analýza konkurence') || taskTitleLower.includes('konkuren');
    const inCompetitionFlow = isCompetitionAudit || isCompetitionAnalysis || isCompetitorDiscoveryTask || isCompetitorHubTask;
    const competitorHint = competitorExamples.length
      ? `Prioritní konkurenti pro start (ověř relevanci): ${competitorExamples.join(', ')}.`
      : 'Prioritní konkurenty odvoď podle stejného use-casu a stejného typu obsahu.';
    const activeSubtaskText = activeTemplateSubtask
      ? `Aktivní podúkol: ${activeTemplateSubtask.title}`
      : 'Aktivní podúkol: všechny podúkoly tohoto úkolu jsou hotové.';
    const projectLiveUrl = p?.domain ? `https://${p.domain}` : 'https://{domena-projektu.tld}';

    return [
      `Jsi senior web konzultant. Pomoz mi dokončit úkol v projektu ${p?.name ?? 'Online projekt'} (${p?.domain ?? 'bez domény'}).`,
      `Úkol: ${currentTemplateTask.title.replace('[TPL] ', '').trim()}`,
      '',
      activeSubtaskText,
      '',
      'Podúkoly:',
      subtasksText,
      '',
      'KROK 1 (POVINNÝ):',
      `- Nejprve připrav BLOK PRO POLE "${currentAiResultFieldLabel}" bez jakéhokoliv textu před ním.`,
      `- Tento první blok je určen k okamžitému vložení do pole "${currentAiResultFieldLabel}" na cílové URL.`,
      '',
      'Pravidla:',
      '- Výstup musí být praktický a použitelný bez dalších úprav.',
      `- Vždy vrať první blok přesně jako text k vložení do pole: "${currentAiResultFieldLabel}".`,
      `- Výstup patří pouze do pole "${currentAiResultFieldLabel}" na této stránce úkolu.`,
      currentTaskDeepLink
        ? `- Cílová URL úkolu (unikátní): ${currentTaskDeepLink}`
        : '- Cílová URL úkolu (unikátní): /core/crm/pm/project/{projectId}?taskId={taskId}',
      currentTemplateTask ? `- ID aktivního úkolu: ${currentTemplateTask.id}` : '- ID aktivního úkolu: N/A',
      `- Akce po odpovědi: vlož první blok přímo do pole "${currentAiResultFieldLabel}" (taskId: ${currentTemplateTask?.id ?? 'N/A'}).`,
      '- U auditu konkurence používej jen konkurenci se stejným use-casem; ne obecné nerelevantní brandy.',
      isCompetitorDiscoveryTask
        ? '- První blok musí obsahovat přesně 5 řádků (5 konkurentů), každý řádek: https://domena.tld — pozitivní recenze: X | negativní recenze: Y.'
        : '- Pokud úkol není o výběru 5 konkurentů, nevypisuj Trustpilot recenze.',
      isCompetitorDiscoveryTask
        ? '- Pozitivní = 4★+5★, negativní = 1★+2★, data pouze z Trustpilot.'
        : '- Pro porovnání webové struktury použij pouze veřejně dostupné stránky konkurence a ostrý web projektu.',
      inCompetitionFlow ? `- ${competitorHint}` : '- Pokud úkol není o konkurenci, vynech sekci konkurence a drž se zadání úkolu.',
      isCompetitorHubTask
        ? `- Pro náš web vždy používej ostrou doménu ${projectLiveUrl} (nikdy localhost).`
        : '- Použij doménu projektu podle zadání.',
      isCompetitorHubTask
        ? '- Postup: projdi 5 konkurentů jeden po druhém, u každého sepiš hlavní stránky + klíčové podstránky (vše jako klikací URL).'
        : '- U podúkolu 1 vrať pouze seznam 5 konkurenčních webů v přesném formátu.',
      isCompetitorHubTask
        ? '- Poté sepiš kompletní seznam všech stránek našeho webu (vše jako klikací URL).'
        : '- Zachovej stručný seznam pro další kroky.',
      isCompetitorHubTask
        ? '- Porovnání vrať ve dvou sekcích: "🟢 Máme" (stránky, které na našem webu existují) a "🔴 Chybí" (jen stránky navíc u konkurence).'
        : '- Pokud nejde o rozcestník, vynech sekce 🟢/🔴.',
      isCompetitorHubTask
        ? '- U každé chybějící stránky přidej prioritu (kritická/vysoká/střední) a krátké zdůvodnění.'
        : '- Prioritu uváděj jen pokud to zadání vyžaduje.',
      '',
      'Požadovaný výstup:',
      isCompetitorHubTask
        ? `1) BLOK PRO POLE "${currentAiResultFieldLabel}" (plain text):`
          + '\n- Sekce A: Rozcestník konkurence (5 domén, u každé seznam URL stránek).'
          + '\n- Sekce B: Kompletní seznam všech stránek našeho webu.'
          + '\n- Sekce C: Porovnání 🟢 Máme / 🔴 Chybí (jen stránky navíc u konkurence) + priority.'
        : `1) BLOK PRO POLE "${currentAiResultFieldLabel}" (plain text, připravený k okamžitému vložení; u konkurence přesně 5 řádků).`,
      '2) Krátký audit aktuálního stavu.',
      '3) Přesné opravy krok za krokem.',
      '4) Kontrolní checklist před označením jako hotovo.',
      isCompetitorHubTask
        ? '5) Vrať přehled po doménách: počet nalezených stránek konkurence vs počet stránek našeho webu.'
        : '5) Pokud jde o audit konkurence: vrať min. 5 relevantních webů, URL webu, URL Trustpilot a pořadí dle počtu negativních recenzí (1★+2★) od nejvyššího.',
    ].join('\n');
  }, [
    activeTemplateSubtask,
    activeTemplateSubtaskIndex,
    competitorExamples,
    currentAiResultFieldLabel,
    currentTaskDeepLink,
    currentTaskPageUrl,
    currentTemplateTaskName,
    currentTemplateSubtasks,
    currentTemplateTask,
    id,
    p?.domain,
    p?.name,
  ]);

  const filteredTasks = useMemo(() => {
    const byArea = areaFilter === 'all' ? scopedTasks : scopedTasks.filter((t) => t.areaId === areaFilter);
    if (taskFilter === 'open') return byArea.filter((t) => !['Hotovo', 'Archiv'].includes(t.status));
    if (taskFilter === 'done') return byArea.filter((t) => ['Hotovo', 'Archiv'].includes(t.status));
    if (taskFilter === 'blocked') return byArea.filter((t) => t.status === 'Blokováno');
    return byArea;
  }, [scopedTasks, taskFilter, areaFilter]);

  const visibleAreas = useMemo(() => {
    if (areaFilter === 'all') return scopedAreas;
    return scopedAreas.filter((area) => area.id === areaFilter);
  }, [scopedAreas, areaFilter]);

  useEffect(() => {
    if (areaFilter === 'all') return;
    const exists = scopedAreas.some((area) => area.id === areaFilter);
    if (!exists) setAreaFilter('all');
  }, [scopedAreas, areaFilter]);

  const assigneeWorkload = useMemo(() => {
    const map = new Map<string, { estimated: number; actual: number; open: number; done: number }>();
    for (const task of scopedTasks) {
      const assignee = (task.assignedTo ?? '').trim() || 'Nepřiřazeno';
      const prev = map.get(assignee) ?? { estimated: 0, actual: 0, open: 0, done: 0 };
      prev.estimated += task.estimatedDuration ?? 0;
      prev.actual += task.actualDuration ?? 0;
      if (task.status === 'Hotovo' || task.status === 'Archiv') prev.done += 1;
      else prev.open += 1;
      map.set(assignee, prev);
    }
    return Array.from(map.entries())
      .map(([assignee, totals]) => ({ assignee, ...totals }))
      .sort((a, b) => a.assignee.localeCompare(b.assignee, 'cs'));
  }, [scopedTasks]);

  const boardSignature = useMemo(
    () => filteredTasks.map((t) => `${t.id}:${t.status}:${t.priority}`).join('|'),
    [filteredTasks],
  );

  useEffect(() => {
    setBoardColumns(initTaskBoard(filteredTasks));
  }, [boardSignature]);

  const todoStyleSignature = useMemo(
    () => allTasks.map((t) => `${t.id}:${t.status}:${t.priority}:${t.title}:${t.description ?? ''}`).join('|'),
    [allTasks],
  );

  useEffect(() => {
    setTodoStyleColumns(
      initTodoStyleBoard(allTasks, {
        search: todoStyleSearch,
        status: todoStyleStatusFilter,
        assignee: todoStyleAssigneeFilter,
        areaId: todoStyleAreaFilter,
      }, todoStyleActiveColumns),
    );
  }, [todoStyleSignature, todoStyleSearch, todoStyleStatusFilter, todoStyleAssigneeFilter, todoStyleAreaFilter, todoStyleActiveColumns]);

  const domainTodoSignature = useMemo(
    () => domainTasks.map((t) => `${t.id}:${t.status}:${t.priority}:${t.title}:${t.description ?? ''}`).join('|'),
    [domainTasks],
  );

  useEffect(() => {
    setDomainTodoColumns(
      initTodoStyleBoard(domainTasks, {
        search: domainTodoSearch,
        status: domainTodoStatusFilter,
        assignee: domainTodoAssigneeFilter,
        areaId: domainTodoAreaFilter,
      }, domainTodoActiveColumns),
    );
  }, [
    domainTodoSignature,
    domainTasks,
    domainTodoSearch,
    domainTodoStatusFilter,
    domainTodoAssigneeFilter,
    domainTodoAreaFilter,
    domainTodoActiveColumns,
  ]);

  useEffect(() => {
    if (domainTodoAreaFilter === 'all') return;
    const exists = domainAreas.some((area) => area.id === domainTodoAreaFilter);
    if (!exists) setDomainTodoAreaFilter('all');
  }, [domainAreas, domainTodoAreaFilter]);

  useEffect(() => {
    const valid = new Set(filteredTasks.map((t) => t.id));
    setSelectedTaskIds((prev) => {
      const next = prev.filter((taskId) => valid.has(taskId));
      if (next.length === prev.length && next.every((taskId, idx) => taskId === prev[idx])) {
        return prev;
      }
      return next;
    });
  }, [filteredTasks]);

  useEffect(() => {
    setTaskDetailForm(createTaskDetailForm(activeTask));
    setSubtaskDraft('');
    setCommentDraft('');
    setSubtasks(normalizeSubtasks(activeTask?.subtasks));
    setComments(normalizeComments(activeTask?.comments));
    setActiveTaskMeta(extractTaskMeta(activeTask?.comments));
    setAttachments(normalizeAttachments(activeTask?.attachments));
    setDetailAutosaveState('idle');
    detailAutosaveKeyRef.current = '';
  }, [activeTask]);

  useEffect(() => {
    if (!activeTask || !taskDetailOpen) return;
    const currentPayload = buildTaskDetailPayload(createTaskDetailForm(activeTask), activeTask.title);
    const nextPayload = buildTaskDetailPayload(taskDetailForm, activeTask.title);
    if (JSON.stringify(currentPayload) === JSON.stringify(nextPayload)) return;

    const merged = applyAutomationRules(activeTask, nextPayload, automationConfig);
    const mergedKey = JSON.stringify(merged);
    if (detailAutosaveKeyRef.current === mergedKey) return;

    setDetailAutosaveState('saving');
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        await pmUpdateTask(activeTask.id, merged);
        if (cancelled) return;
        detailAutosaveKeyRef.current = mergedKey;
        setActiveTask((prev) => (prev && prev.id === activeTask.id ? { ...prev, ...merged, deadline: merged.deadline ?? undefined } : prev));
        setDetailAutosaveState('saved');
      } catch (error) {
        if (cancelled) return;
        setDetailAutosaveState('idle');
        toast.error(getApiErrorMessage(error, 'Průběžné uložení úkolu selhalo'));
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeTask, taskDetailOpen, taskDetailForm, automationConfig]);

  useEffect(() => {
    if (!id) return;
    const key = `pm-automation:${id}`;
    const raw = localStorage.getItem(key);
    const parsed = safeParseJson<PmAutomationConfig>(raw);
    if (parsed) {
      setAutomationConfig({
        ...DEFAULT_AUTOMATION_CONFIG,
        ...parsed,
      });
      return;
    }
    setAutomationConfig(DEFAULT_AUTOMATION_CONFIG);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`pm-automation:${id}`, JSON.stringify(automationConfig));
  }, [id, automationConfig]);

  useEffect(() => {
    if (!id) return;
    const key = `pm-assignee-capacity:${id}`;
    const raw = localStorage.getItem(key);
    const parsed = safeParseJson<Record<string, number>>(raw);
    setAssigneeCapacityHours(parsed ?? {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`pm-assignee-capacity:${id}`, JSON.stringify(assigneeCapacityHours));
  }, [id, assigneeCapacityHours]);

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`pm-focus-mode:${id}`);
    if (raw === 'off') {
      setFocusModeEnabled(false);
      return;
    }
    setFocusModeEnabled(true);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`pm-focus-mode:${id}`, focusModeEnabled ? 'on' : 'off');
  }, [id, focusModeEnabled]);

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`pm-todo-columns:${id}`);
    const parsed = safeParseJson<string[]>(raw);
    const allowed = new Set(TASK_BOARD_STATUSES);
    const next = (parsed ?? [])
      .filter((item): item is PmTaskStatus => allowed.has(item as PmTaskStatus));
    setTodoStyleActiveColumns(next.length > 0 ? next : TODO_DEFAULT_COLUMNS);
    setTodoColumnsHydrated(true);
  }, [id]);

  useEffect(() => {
    if (!id || !todoColumnsHydrated) return;
    localStorage.setItem(`pm-todo-columns:${id}`, JSON.stringify(todoStyleActiveColumns));
  }, [id, todoStyleActiveColumns, todoColumnsHydrated]);

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`pm-todo-column-labels:${id}`);
    const parsed = safeParseJson<Record<string, string>>(raw);
    if (parsed) {
      setTodoStyleColumnLabels((prev) => {
        const next = { ...prev };
        for (const status of TASK_BOARD_STATUSES) {
          const val = parsed[status];
          if (typeof val === 'string' && val.trim()) next[status] = val.trim();
        }
        return next;
      });
    }
    setTodoLabelsHydrated(true);
  }, [id]);

  useEffect(() => {
    if (!id || !todoLabelsHydrated) return;
    localStorage.setItem(`pm-todo-column-labels:${id}`, JSON.stringify(todoStyleColumnLabels));
  }, [id, todoStyleColumnLabels, todoLabelsHydrated]);

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`pm-quick-templates:${id}`);
    const parsed = safeParseJson<QuickTaskTemplate[]>(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed
        .filter((tpl) => tpl && typeof tpl.id === 'string' && typeof tpl.name === 'string' && Array.isArray(tpl.tasks))
        .map((tpl) => ({
          id: tpl.id,
          name: tpl.name.trim() || 'Bez názvu',
          tasks: tpl.tasks
            .map((task) => (typeof task === 'string' ? task.trim() : ''))
            .filter(Boolean),
        }));
      setQuickTaskTemplates(sanitized.length > 0 ? sanitized : DEFAULT_QUICK_TASK_TEMPLATES);
    } else {
      setQuickTaskTemplates(DEFAULT_QUICK_TASK_TEMPLATES);
    }
    setQuickTemplatesHydrated(true);
  }, [id]);

  useEffect(() => {
    if (!id || !quickTemplatesHydrated) return;
    localStorage.setItem(`pm-quick-templates:${id}`, JSON.stringify(quickTaskTemplates));
  }, [id, quickTemplatesHydrated, quickTaskTemplates]);

  useEffect(() => {
    setProjectNoteDraft(currentTemplateTask?.nextStep ?? '');
  }, [currentTemplateTask?.id, currentTemplateTask?.nextStep]);

  useEffect(() => {
    setFocusSubtaskDraft('');
  }, [currentTemplateTask?.id]);

  useEffect(() => {
    if (!isTaskDetailRoute) return;
    setTaskInstructionDraft('');
    setTaskInstructionLastSaved('');
    setTaskInstructionSaving('idle');
  }, [isTaskDetailRoute, currentTemplateTask?.id]);

  useEffect(() => {
    if (!isTaskDetailRoute || !currentTemplateTask) return;
    if (taskInstructionDraft === taskInstructionLastSaved) return;
    const timer = window.setTimeout(() => {
      setTaskInstructionSaving('saving');
      updateTask.mutate(
        {
          taskId: currentTemplateTask.id,
          data: { description: taskInstructionDraft },
        },
        {
          onSuccess: () => {
            setTaskInstructionLastSaved(taskInstructionDraft);
            setTaskInstructionSaving('saved');
          },
          onError: () => setTaskInstructionSaving('idle'),
        },
      );
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isTaskDetailRoute, currentTemplateTask, taskInstructionDraft, taskInstructionLastSaved, updateTask]);

  useEffect(() => {
    if (!isTaskDetailRoute) return;
    window.scrollTo(0, 0);
  }, [isTaskDetailRoute, routeTaskId, routeSubtaskId]);

  const findTaskById = (taskId: string) => allTasks.find((task) => task.id === taskId);

  const applyTaskUpdate = (taskId: string, data: Record<string, unknown>) => {
    const currentTask = findTaskById(taskId) ?? (activeTask?.id === taskId ? activeTask : null);
    const payload = applyAutomationRules(currentTask, data, automationConfig);
    updateTask.mutate({ taskId, data: payload });
  };

  const copyCurrentPrompt = async () => {
    if (!currentTaskChatPrompt) return;
    try {
      await navigator.clipboard.writeText(currentTaskChatPrompt);
      toast.success('Prompt zkopírován');
    } catch {
      toast.error('Kopírování selhalo');
    }
  };

  const saveProjectNotes = () => {
    if (!currentTemplateTask) return;
    updateTask.mutate(
      { taskId: currentTemplateTask.id, data: { nextStep: projectNoteDraft.trim() } },
      { onSuccess: () => toast.success('Výsledek analýzy AI uložen') },
    );
  };

  const completeCurrentTemplateTask = () => {
    if (!currentTemplateTask) return;
    updateTask.mutate(
      {
        taskId: currentTemplateTask.id,
        data: {
          status: 'Hotovo',
          nextStep: projectNoteDraft.trim(),
          resultUrl: currentTaskDeepLink || undefined,
          resultFieldLabel: currentAiResultFieldLabel,
        },
      },
      { onSuccess: () => toast.success('Úkol dokončen. Odemykám další.') },
    );
  };

  const goToTemplateTask = (taskId: string) => {
    if (isTaskDetailRoute) {
      navigate(`/core/crm/pm/project/${id}/task/${taskId}`);
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.set('taskId', taskId);
    setSearchParams(next);
  };

  const goToCurrentTemplateSubtask = (subtaskId: string) => {
    if (!id || !currentTemplateTask) return;
    navigate(`/core/crm/pm/project/${id}/task/${currentTemplateTask.id}/subtask/${subtaskId}`);
  };

  const saveCurrentTemplateSubtasks = (next: TaskSubtask[]) => {
    if (!currentTemplateTask) return;
    updateTask.mutate(
      { taskId: currentTemplateTask.id, data: { subtasks: next } },
      { onSuccess: () => toast.success('Manuální úkoly uloženy') },
    );
  };

  const addCurrentTemplateSubtask = () => {
    if (!currentTemplateTask || !focusSubtaskDraft.trim()) return;
    const targetSectionId = isTaskDetailRoute && routeSubtaskId
      ? routeSubtaskId
      : currentTemplateTopLevelSubtasks[0]?.id;
    if (!targetSectionId) {
      toast.error('Nejdřív přidej sekci nebo vyber úkol');
      return;
    }
    const item: TaskSubtask = {
      id: crypto.randomUUID(),
      title: focusSubtaskDraft.trim(),
      done: false,
      createdAt: new Date().toISOString(),
      parentId: targetSectionId,
    };
    saveCurrentTemplateSubtasks([...currentTemplateSubtasks, item]);
    setFocusSubtaskDraft('');
  };

  const addCurrentTemplatePrimaryTask = () => {
    if (!currentTemplateTask || !focusSubtaskDraft.trim()) return;
    const item: TaskSubtask = {
      id: crypto.randomUUID(),
      title: focusSubtaskDraft.trim(),
      done: false,
      createdAt: new Date().toISOString(),
      parentId: null,
    };
    saveCurrentTemplateSubtasks([...currentTemplateSubtasks, item]);
    setFocusSubtaskDraft('');
  };

  const addCurrentTemplateSubtaskLevel2 = (parentId: string) => {
    if (!currentTemplateTask) return;
    const title = window.prompt('Název podúkolu');
    if (!title || !title.trim()) return;
    const item: TaskSubtask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      done: false,
      createdAt: new Date().toISOString(),
      parentId,
    };
    saveCurrentTemplateSubtasks([...currentTemplateSubtasks, item]);
  };

  const addCurrentTemplateSection = () => {
    if (!currentTemplateTask) return;
    const title = window.prompt('Název sekce');
    if (!title || !title.trim()) return;
    const item: TaskSubtask = {
      id: crypto.randomUUID(),
      title: `[SEKCE] ${title.trim()}`,
      done: false,
      createdAt: new Date().toISOString(),
      parentId: null,
    };
    saveCurrentTemplateSubtasks([...currentTemplateSubtasks, item]);
  };

  const promoteCurrentTemplateSubtaskToTopLevel = (subtaskId: string) => {
    if (!currentTemplateTask) return;
    const block = collectSubtaskBlock(currentTemplateSubtasks, subtaskId);
    if (block.length === 0) return;
    const root = block[0];
    if (!root.parentId) return;
    const blockIds = new Set(block.map((item) => item.id));
    const remainder = currentTemplateSubtasks.filter((item) => !blockIds.has(item.id));
    const movedRoot: TaskSubtask = { ...root, parentId: null };
    const movedBlock = [movedRoot, ...block.slice(1)];
    const next = [...remainder, ...movedBlock];
    saveCurrentTemplateSubtasks(next);
  };

  const editCurrentTemplateSubtask = (subtaskId: string) => {
    if (!currentTemplateTask) return;
    const current = currentTemplateSubtasks.find((item) => item.id === subtaskId);
    if (!current) return;
    const nextTitle = window.prompt('Upravit název úkolu', current.title);
    if (!nextTitle || !nextTitle.trim()) return;
    const next = currentTemplateSubtasks.map((item) =>
      item.id === subtaskId ? { ...item, title: nextTitle.trim() } : item,
    );
    saveCurrentTemplateSubtasks(next);
  };

  const toggleCurrentTemplateSubtask = (subtaskId: string, done: boolean) => {
    if (!currentTemplateTask) return;
    const descendants = getCurrentTemplateSubtaskDescendantIds(subtaskId);
    const next = currentTemplateSubtasks.map((item) => {
      if (item.id === subtaskId) return { ...item, done };
      if (descendants.has(item.id)) return { ...item, done };
      return item;
    });
    saveCurrentTemplateSubtasks(next);
  };

  const deleteCurrentTemplateSubtask = (subtaskId: string) => {
    if (!currentTemplateTask) return;
    const descendants = getCurrentTemplateSubtaskDescendantIds(subtaskId);
    const next = currentTemplateSubtasks.filter((item) => item.id !== subtaskId && !descendants.has(item.id));
    saveCurrentTemplateSubtasks(next);
  };

  const generateTask2WebsiteStructureSubtasks = () => {
    if (!currentTemplateTask) return;
    const shouldReplace = currentTemplateSubtasks.length > 0
      ? window.confirm('Nahradit existující manuální úkoly doporučenou strukturou?')
      : true;
    if (!shouldReplace) return;
    saveCurrentTemplateSubtasks(buildWebsiteStructureSubtasks());
  };

  const getCurrentTemplateSubtaskChildren = (parentId: string) =>
    currentTemplateSubtasks.filter((item) => item.parentId === parentId);

  const getCurrentTemplateSubtaskDescendantIds = (rootId: string) => {
    const descendants = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of currentTemplateSubtasks) {
        if (!item.parentId) continue;
        if (item.parentId === rootId || descendants.has(item.parentId)) {
          if (!descendants.has(item.id)) {
            descendants.add(item.id);
            changed = true;
          }
        }
      }
    }
    return descendants;
  };

  const collectSubtaskBlock = (items: TaskSubtask[], rootId: string): TaskSubtask[] => {
    const descendants = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of items) {
        if (!item.parentId) continue;
        if (item.parentId === rootId || descendants.has(item.parentId)) {
          if (!descendants.has(item.id)) {
            descendants.add(item.id);
            changed = true;
          }
        }
      }
    }
    return items.filter((item) => item.id === rootId || descendants.has(item.id));
  };

  const hasAncestorInSet = (itemsById: Map<string, TaskSubtask>, itemId: string, ancestors: Set<string>) => {
    let cursor = itemsById.get(itemId);
    while (cursor?.parentId) {
      if (ancestors.has(cursor.parentId)) return true;
      cursor = itemsById.get(cursor.parentId);
    }
    return false;
  };

  const getSectionDescendantsOrdered = (items: TaskSubtask[], sectionId: string) => {
    const itemsById = new Map(items.map((item) => [item.id, item]));
    const sectionSet = new Set([sectionId]);
    return items.filter((item) => item.id !== sectionId && hasAncestorInSet(itemsById, item.id, sectionSet));
  };

  const moveSectionBeforeSection = (dragSectionId: string, overSectionId: string) => {
    if (!currentTemplateTask || dragSectionId === overSectionId) return;
    const sections = currentTemplateTopLevelSubtasks;
    const fromIndex = sections.findIndex((item) => item.id === dragSectionId);
    const toIndex = sections.findIndex((item) => item.id === overSectionId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    const nextSections = [...sections];
    const [moved] = nextSections.splice(fromIndex, 1);
    nextSections.splice(toIndex, 0, moved);
    const next = nextSections.flatMap((section) => [section, ...getSectionDescendantsOrdered(currentTemplateSubtasks, section.id)]);
    saveCurrentTemplateSubtasks(next);
  };

  const moveTaskToSection = (taskId: string, sectionId: string) => {
    if (!currentTemplateTask) return;
    const block = collectSubtaskBlock(currentTemplateSubtasks, taskId);
    if (block.length === 0) return;
    const blockIds = new Set(block.map((item) => item.id));
    const remainder = currentTemplateSubtasks.filter((item) => !blockIds.has(item.id));
    const root = block[0];
    const movedRoot: TaskSubtask = { ...root, parentId: sectionId };
    const movedBlock = [movedRoot, ...block.slice(1)];
    const sectionIndex = remainder.findIndex((item) => item.id === sectionId);
    if (sectionIndex < 0) return;
    const itemsById = new Map(remainder.map((item) => [item.id, item]));
    let insertIndex = sectionIndex + 1;
    while (insertIndex < remainder.length && hasAncestorInSet(itemsById, remainder[insertIndex].id, new Set([sectionId]))) {
      insertIndex += 1;
    }
    const next = [...remainder.slice(0, insertIndex), ...movedBlock, ...remainder.slice(insertIndex)];
    saveCurrentTemplateSubtasks(next);
  };

  const moveTaskUnderTask = (dragTaskId: string, targetTaskId: string) => {
    if (!currentTemplateTask || dragTaskId === targetTaskId) return;
    const dragBlock = collectSubtaskBlock(currentTemplateSubtasks, dragTaskId);
    if (dragBlock.length === 0) return;
    const dragBlockIds = new Set(dragBlock.map((item) => item.id));
    if (dragBlockIds.has(targetTaskId)) return;
    const targetTask = currentTemplateSubtasks.find((item) => item.id === targetTaskId);
    if (!targetTask) return;
    const remainder = currentTemplateSubtasks.filter((item) => !dragBlockIds.has(item.id));
    const movedRoot: TaskSubtask = { ...dragBlock[0], parentId: targetTaskId };
    const movedBlock = [movedRoot, ...dragBlock.slice(1)];
    const targetIndex = remainder.findIndex((item) => item.id === targetTaskId);
    if (targetIndex < 0) return;
    const descendants = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of remainder) {
        if (!item.parentId) continue;
        if (item.parentId === targetTaskId || descendants.has(item.parentId)) {
          if (!descendants.has(item.id)) {
            descendants.add(item.id);
            changed = true;
          }
        }
      }
    }
    let insertIndex = targetIndex + 1;
    while (insertIndex < remainder.length && (descendants.has(remainder[insertIndex].id) || remainder[insertIndex].id === targetTaskId)) {
      insertIndex += 1;
    }
    const next = [...remainder.slice(0, insertIndex), ...movedBlock, ...remainder.slice(insertIndex)];
    saveCurrentTemplateSubtasks(next);
  };

  const moveTaskToTopLevelBefore = (dragTaskId: string, beforeTopLevelId: string | null) => {
    if (!currentTemplateTask) return;
    const dragBlock = collectSubtaskBlock(currentTemplateSubtasks, dragTaskId);
    if (dragBlock.length === 0) return;
    const dragBlockIds = new Set(dragBlock.map((item) => item.id));
    if (beforeTopLevelId && dragBlockIds.has(beforeTopLevelId)) return;
    const remainder = currentTemplateSubtasks.filter((item) => !dragBlockIds.has(item.id));
    const movedRoot: TaskSubtask = { ...dragBlock[0], parentId: null };
    const movedBlock = [movedRoot, ...dragBlock.slice(1)];
    const insertIndex = beforeTopLevelId ? remainder.findIndex((item) => item.id === beforeTopLevelId) : remainder.length;
    if (beforeTopLevelId && insertIndex < 0) return;
    const next = [...remainder.slice(0, insertIndex), ...movedBlock, ...remainder.slice(insertIndex)];
    saveCurrentTemplateSubtasks(next);
  };

  const clearFocusDragState = () => {
    setFocusDragItem(null);
    setFocusDropSectionId(null);
    setFocusDropTaskId(null);
    setFocusDropTopLevelBeforeId(null);
  };

  const onSectionDragStart = (sectionId: string) => {
    setFocusDragItem({ type: 'section', id: sectionId });
  };

  const onTaskDragStart = (taskId: string) => {
    setFocusDragItem({ type: 'task', id: taskId });
  };

  const onSectionDragOver = (event: ReactDragEvent, sectionId: string) => {
    if (!focusDragItem) return;
    event.preventDefault();
    setFocusDropTaskId(null);
    setFocusDropSectionId(sectionId);
  };

  const onTaskDragOver = (event: ReactDragEvent, taskId: string) => {
    if (!focusDragItem || focusDragItem.type !== 'task') return;
    event.preventDefault();
    setFocusDropSectionId(null);
    setFocusDropTopLevelBeforeId(null);
    setFocusDropTaskId(taskId);
  };

  const onTopLevelDropZoneOver = (event: ReactDragEvent, beforeTopLevelId: string | null) => {
    if (!focusDragItem || focusDragItem.type !== 'task') return;
    event.preventDefault();
    setFocusDropSectionId(null);
    setFocusDropTaskId(null);
    setFocusDropTopLevelBeforeId(beforeTopLevelId);
  };

  const onSectionDrop = (event: ReactDragEvent, sectionId: string) => {
    event.preventDefault();
    if (!focusDragItem) return;
    if (focusDragItem.type === 'section') {
      moveSectionBeforeSection(focusDragItem.id, sectionId);
      clearFocusDragState();
      return;
    }
    moveTaskToSection(focusDragItem.id, sectionId);
    clearFocusDragState();
  };

  const onTaskDrop = (event: ReactDragEvent, taskId: string) => {
    event.preventDefault();
    if (!focusDragItem || focusDragItem.type !== 'task') return;
    moveTaskUnderTask(focusDragItem.id, taskId);
    clearFocusDragState();
  };

  const onTopLevelDropZoneDrop = (event: ReactDragEvent, beforeTopLevelId: string | null) => {
    event.preventDefault();
    if (!focusDragItem || focusDragItem.type !== 'task') return;
    moveTaskToTopLevelBefore(focusDragItem.id, beforeTopLevelId === '__end__' ? null : beforeTopLevelId);
    clearFocusDragState();
  };

  const renderSubtaskBranch = (node: TaskSubtask, depth = 0): JSX.Element => {
    const children = getCurrentTemplateSubtaskChildren(node.id);
    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 rounded-md border border-dashed p-2 ${focusDropTaskId === node.id ? 'bg-primary/5 border-primary/40' : ''}`}
          style={{ marginLeft: `${Math.max(4, depth * 16)}px` }}
          onDragOver={(event) => onTaskDragOver(event, node.id)}
          onDrop={(event) => onTaskDrop(event, node.id)}
        >
          <div draggable onDragStart={() => onTaskDragStart(node.id)} onDragEnd={clearFocusDragState}>
            <GripVertical className="size-4 text-muted-foreground shrink-0 cursor-grab" />
          </div>
          <Checkbox checked={node.done} onCheckedChange={(checked) => toggleCurrentTemplateSubtask(node.id, Boolean(checked))} />
          <button
            type="button"
            onClick={() => goToCurrentTemplateSubtask(node.id)}
            className={`text-sm flex-1 text-left hover:underline ${node.done ? 'line-through text-muted-foreground' : ''}`}
          >
            {cleanSubtaskTitleForDisplay(node.title)}
          </button>
          {node.parentId && (
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={() => promoteCurrentTemplateSubtaskToTopLevel(node.id)}
              title="Převést na hlavní úkol"
            >
              <ArrowUp className="size-3.5" />
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 w-7 px-0" onClick={() => addCurrentTemplateSubtaskLevel2(node.id)}>
            +
          </Button>
          <Button size="icon" variant="ghost" className="size-7" onClick={() => editCurrentTemplateSubtask(node.id)}>
            <Edit2 className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7" onClick={() => deleteCurrentTemplateSubtask(node.id)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
        {children.map((child) => renderSubtaskBranch(child, depth + 1))}
      </div>
    );
  };

  if (isLoading || !p) {
    return (
      <>
        <ContentHeader>
          <Link to="/core/crm/pm" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Projekty
          </Link>
        </ContentHeader>
        <Content className="px-5">
          <div className="space-y-4 w-full">
            <div className="h-8 bg-muted animate-pulse rounded w-64" />
            <div className="h-40 bg-muted animate-pulse rounded" />
          </div>
        </Content>
      </>
    );
  }

  const isSectionSubtask = (title: string) => /^\[SEKCE\]\s*/i.test(title);

  if (isTemplateProject && focusModeEnabled) {
    if (isTaskDetailRoute) {
      const backToTaskList = currentTemplateTask
        ? `/core/crm/pm/project/${id}?taskId=${currentTemplateTask.id}`
        : `/core/crm/pm/project/${id}`;
      const detailBranchIds = routeSubtaskId ? getCurrentTemplateSubtaskDescendantIds(routeSubtaskId) : null;
      if (detailBranchIds && routeSubtaskId) detailBranchIds.add(routeSubtaskId);
      const detailSubtasksCount = detailBranchIds
        ? currentTemplateSubtasks.filter((item) => detailBranchIds.has(item.id)).length
        : currentTemplateSubtasks.length;
      return (
        <>
          <ContentHeader className="gap-3">
            <Link to="/core/crm/pm" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Projekty
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-sm font-semibold flex items-center gap-2 min-w-0">
              {p.color && <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />}
              <span className="truncate">{p.name}</span>
            </h1>
          </ContentHeader>

          <Content className="px-5 pb-6">
            <div className="max-w-6xl mx-auto space-y-4">
              <Link to={backToTaskList} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" /> Zpět do seznamu úkolů
              </Link>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{currentTemplateTask?.title.replace('[TPL] ', '').trim() || 'Detail úkolu'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">CO MÁŠ UDĚLAT</p>
                      <span className="text-xs text-muted-foreground">
                        {taskInstructionSaving === 'saving' ? 'Autosave...' : taskInstructionSaving === 'saved' ? 'Uloženo' : ''}
                      </span>
                    </div>
                    <Textarea
                      value={taskInstructionDraft}
                      onChange={(event) => {
                        setTaskInstructionDraft(event.target.value);
                        setTaskInstructionSaving('idle');
                      }}
                      className="min-h-40"
                      autoFocus
                      placeholder="Vlož sem zadání pro tento detail úkolu..."
                    />
                  </div>

                  <div className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Manuální úkoly pro tuto stránku</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{detailSubtasksCount}</Badge>
                        {!routeSubtaskId && (
                          <>
                            <Button size="sm" variant="outline" className="h-7" onClick={addCurrentTemplateSection}>
                              <Plus className="size-3.5" /> Přidat sekci
                            </Button>
                            {showStructurePresetButton && (
                              <Button size="sm" variant="outline" className="h-7" onClick={generateTask2WebsiteStructureSubtasks}>
                                Předvyplnit sekce
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={focusSubtaskDraft}
                        onChange={(e) => setFocusSubtaskDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addCurrentTemplateSubtask();
                        }}
                        className="h-9 rounded border px-2.5 text-sm bg-background w-full"
                        placeholder="Napiš nový manuální úkol pro tento krok..."
                      />
                      <Button size="sm" className="h-9 shrink-0" onClick={addCurrentTemplateSubtask}>
                        <Plus className="size-3.5" /> Přidat úkol
                      </Button>
                      <Button size="sm" variant="outline" className="h-9 shrink-0" onClick={addCurrentTemplatePrimaryTask}>
                        Přidat hlavní úkol
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {currentTemplateSubtasks.length === 0 && (
                        <p className="text-xs text-muted-foreground">Zatím bez manuálních úkolů pro tento krok.</p>
                      )}
                      {routeSubtaskId ? (
                        currentDetailSubtask ? (
                          renderSubtaskBranch(currentDetailSubtask)
                        ) : (
                          <p className="text-xs text-muted-foreground">Vybraný úkol nebyl nalezen.</p>
                        )
                      ) : (
                        <>
                          {currentTemplateTopLevelSubtasks.map((item) => (
                            <div key={item.id}>
                              <div
                                className={`h-2 rounded-sm transition-colors ${focusDropTopLevelBeforeId === item.id ? 'bg-blue-500/70' : 'bg-transparent'}`}
                                onDragOver={(event) => onTopLevelDropZoneOver(event, item.id)}
                                onDrop={(event) => onTopLevelDropZoneDrop(event, item.id)}
                              />
                              {isSectionSubtask(item.title) ? (
                                <div className="space-y-2 pt-3 first:pt-0">
                                  <div className="border-t" />
                                  <div
                                    className={`flex items-center gap-2 rounded-md px-2.5 py-2 ${focusDropSectionId === item.id ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/30'}`}
                                    onDragOver={(event) => onSectionDragOver(event, item.id)}
                                    onDrop={(event) => onSectionDrop(event, item.id)}
                                  >
                                    <div draggable onDragStart={() => onSectionDragStart(item.id)} onDragEnd={clearFocusDragState}>
                                      <GripVertical className="size-4 text-muted-foreground shrink-0 cursor-grab" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground/90 flex-1">
                                      {item.title.replace(/^\[SEKCE\]\s*/i, '')}
                                    </span>
                                    <Button size="icon" variant="ghost" className="size-7" onClick={() => editCurrentTemplateSubtask(item.id)}>
                                      <Edit2 className="size-3.5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="size-7" onClick={() => deleteCurrentTemplateSubtask(item.id)}>
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                  {getCurrentTemplateSubtaskChildren(item.id).map((child) => renderSubtaskBranch(child))}
                                </div>
                              ) : (
                                <div className="pt-3 first:pt-0">
                                  {renderSubtaskBranch(item)}
                                </div>
                              )}
                            </div>
                          ))}
                          <div
                            className={`h-2 rounded-sm transition-colors ${focusDropTopLevelBeforeId === '__end__' ? 'bg-blue-500/70' : 'bg-transparent'}`}
                            onDragOver={(event) => onTopLevelDropZoneOver(event, '__end__')}
                            onDrop={(event) => onTopLevelDropZoneDrop(event, '__end__')}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Content>
        </>
      );
    }

    return (
      <>
        <ContentHeader className="gap-3">
          <Link to="/core/crm/pm" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Projekty
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-sm font-semibold flex items-center gap-2 min-w-0">
            {p.color && <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />}
            <span className="truncate">{p.name}</span>
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {isTaskDetailRoute && currentTemplateTask && (
              <Link to={`/core/crm/pm/project/${id}?taskId=${currentTemplateTask.id}`}>
                <Button variant="outline" size="sm">Zpět na workflow</Button>
              </Link>
            )}
            <Badge variant="outline">{doneTemplateTasks}/{templateTasks.length} hotovo</Badge>
            <Button variant="outline" size="sm" onClick={() => setFocusModeEnabled(false)}>
              Zobrazit plný PM
            </Button>
          </div>
        </ContentHeader>

        <Content className="px-5 pb-6">
          <div className={`max-w-6xl mx-auto grid grid-cols-1 ${isTaskDetailRoute ? '' : 'lg:grid-cols-[260px_1fr]'} gap-4`}>
            {!isTaskDetailRoute && (
            <aside className="rounded-xl border bg-card p-3 h-fit lg:sticky lg:top-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Milníky</p>
              <div className="relative mt-3 pl-6 space-y-1.5">
                <div className="absolute left-[11px] top-1 bottom-1 w-px bg-border" />
                {templateTasks.map((task, index) => {
                  const taskName = task.title.replace('[TPL] ', '').trim();
                  const isCurrent = task.id === currentTemplateTask?.id;
                  const isDoneByStatus = task.status === 'Hotovo' || task.status === 'Archiv';
                  const isDone = isDoneByStatus || (currentTemplateTaskIndex >= 0 && index < currentTemplateTaskIndex);
                  const dotClass = isCurrent
                    ? 'bg-primary ring-2 ring-primary/20 border-primary'
                    : isDone
                      ? 'bg-zinc-400 border-zinc-400'
                      : 'bg-background border-muted-foreground/40';
                  const rowClass = isCurrent
                    ? 'border-primary/30 bg-primary/5'
                    : isDone
                      ? 'border-muted bg-muted/20'
                      : 'border-muted/70 hover:bg-muted/30';

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => goToTemplateTask(task.id)}
                      className={`relative w-full text-left rounded-md border px-2.5 py-2 transition-colors ${rowClass}`}
                    >
                      <span className={`absolute -left-[19px] top-3 size-2.5 rounded-full border ${dotClass}`} />
                      <p className={`text-[11px] font-semibold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                        Úkol {index + 1}/{templateTasks.length}
                      </p>
                      <p className={`text-xs leading-snug ${isDone && !isCurrent ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {taskName || 'Bez názvu'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </aside>
            )}

            <div className="space-y-4">
              {!isTaskDetailRoute && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Progress (2h denně)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Postup workflow</span>
                      <span>{focusProgressPct}%</span>
                    </div>
                    <Progress value={focusProgressPct} className="h-2" />
                  </CardContent>
                </Card>
              )}

              {!currentTemplateTask ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    Všechny úkoly jsou dokončené.
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{currentTemplateTask.title.replace('[TPL] ', '').trim()}</CardTitle>
                      {!isTaskDetailRoute && (
                        <Link to={`/core/crm/pm/project/${id}/task/${currentTemplateTask.id}`}>
                          <Button size="sm" variant="outline">Detail úkolu</Button>
                        </Link>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!isTaskDetailRoute && isSubtaskDetailRoute && currentDetailSubtask && (
                      <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Detail vybraného úkolu</p>
                        <p className="text-sm font-medium">{cleanSubtaskTitleForDisplay(currentDetailSubtask.title)}</p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => addCurrentTemplateSubtaskLevel2(currentDetailSubtask.id)}>
                            + Přidat podúkol
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => editCurrentTemplateSubtask(currentDetailSubtask.id)}>
                            <Edit2 className="size-3.5" /> Upravit
                          </Button>
                        </div>
                      </div>
                    )}

                    {!isTaskDetailRoute && (
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Co máš udělat</p>
                        <p className="text-sm whitespace-pre-wrap">{currentTemplateTask.description}</p>
                      </div>
                    )}

                    <div className="rounded-lg border p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Manuální úkoly pro tuto stránku</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{currentTemplateSubtasks.length}</Badge>
                          <Button size="sm" variant="outline" className="h-7" onClick={addCurrentTemplateSection}>
                            <Plus className="size-3.5" /> Přidat sekci
                          </Button>
                          {showStructurePresetButton && (
                            <Button size="sm" variant="outline" className="h-7" onClick={generateTask2WebsiteStructureSubtasks}>
                              Předvyplnit sekce
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          value={focusSubtaskDraft}
                          onChange={(e) => setFocusSubtaskDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addCurrentTemplateSubtask();
                          }}
                          className="h-9 rounded border px-2.5 text-sm bg-background w-full"
                          placeholder="Napiš nový manuální úkol pro tento krok..."
                        />
                      <Button size="sm" className="h-9 shrink-0" onClick={addCurrentTemplateSubtask}>
                        <Plus className="size-3.5" /> Přidat úkol
                      </Button>
                      <Button size="sm" variant="outline" className="h-9 shrink-0" onClick={addCurrentTemplatePrimaryTask}>
                        Přidat hlavní úkol
                      </Button>
                    </div>
                    <div className="space-y-2">
                        {currentTemplateSubtasks.length === 0 && (
                          <p className="text-xs text-muted-foreground">Zatím bez manuálních úkolů pro tento krok.</p>
                        )}
                        {currentTemplateTopLevelSubtasks.map((item) => (
                          <div key={item.id}>
                            <div
                              className={`h-2 rounded-sm transition-colors ${focusDropTopLevelBeforeId === item.id ? 'bg-blue-500/70' : 'bg-transparent'}`}
                              onDragOver={(event) => onTopLevelDropZoneOver(event, item.id)}
                              onDrop={(event) => onTopLevelDropZoneDrop(event, item.id)}
                            />
                            {isSectionSubtask(item.title) ? (
                              <div className="space-y-2 pt-3 first:pt-0">
                                <div className="border-t" />
                                <div
                                  className={`flex items-center gap-2 rounded-md px-2.5 py-2 ${focusDropSectionId === item.id ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/30'}`}
                                  onDragOver={(event) => onSectionDragOver(event, item.id)}
                                  onDrop={(event) => onSectionDrop(event, item.id)}
                                >
                                  <div draggable onDragStart={() => onSectionDragStart(item.id)} onDragEnd={clearFocusDragState}>
                                    <GripVertical className="size-4 text-muted-foreground shrink-0 cursor-grab" />
                                  </div>
                                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground/90 flex-1">
                                    {item.title.replace(/^\[SEKCE\]\s*/i, '')}
                                  </span>
                                  <Button size="icon" variant="ghost" className="size-7" onClick={() => editCurrentTemplateSubtask(item.id)}>
                                    <Edit2 className="size-3.5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="size-7" onClick={() => deleteCurrentTemplateSubtask(item.id)}>
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                                {getCurrentTemplateSubtaskChildren(item.id).map((child) => renderSubtaskBranch(child))}
                              </div>
                            ) : (
                              <div className="pt-3 first:pt-0">
                                {renderSubtaskBranch(item)}
                              </div>
                            )}
                          </div>
                        ))}
                        <div
                          className={`h-2 rounded-sm transition-colors ${focusDropTopLevelBeforeId === '__end__' ? 'bg-blue-500/70' : 'bg-transparent'}`}
                          onDragOver={(event) => onTopLevelDropZoneOver(event, '__end__')}
                          onDrop={(event) => onTopLevelDropZoneDrop(event, '__end__')}
                        />
                      </div>
                    </div>

                    {!isTaskDetailRoute && (
                      <>
                        <div className="rounded-lg border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Copy/Paste zadání pro ChatGPT</p>
                            <Button size="sm" variant="outline" onClick={copyCurrentPrompt}>
                              <Copy className="size-3.5" /> Kopírovat
                            </Button>
                          </div>
                          <Textarea value={currentTaskChatPrompt} readOnly className="min-h-40 text-xs" />
                        </div>

                        <div className="rounded-lg border p-3 space-y-2">
                          <p className="text-sm font-semibold">{currentAiResultFieldLabel}</p>
                          <Textarea
                            value={projectNoteDraft}
                            onChange={(e) => setProjectNoteDraft(e.target.value)}
                            className="min-h-28"
                            placeholder={`Sem vlož výsledek pro pole "${currentAiResultFieldLabel}". Např. seznam relevantní konkurence v požadovaném formátu.`}
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={saveProjectNotes}>
                              Uložit poznámky
                            </Button>
                            <Button size="sm" onClick={completeCurrentTemplateTask} disabled={updateTask.isPending}>
                              <Check className="size-3.5" /> Dokončit úkol a odemknout další
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Content>
      </>
    );
  }

  const selectedCount = selectedTaskIds.length;
  const allVisibleSelected = filteredTasks.length > 0 && selectedCount === filteredTasks.length;

  const toggleTaskSelected = (taskId: string, checked: boolean) => {
    setSelectedTaskIds((prev) => {
      if (checked) return prev.includes(taskId) ? prev : [...prev, taskId];
      return prev.filter((id) => id !== taskId);
    });
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelectedTaskIds([]);
      return;
    }
    setSelectedTaskIds(filteredTasks.map((t) => t.id));
  };

  const runBulkStatus = async (status: PmTaskStatus) => {
    if (selectedTaskIds.length === 0) return;
    await Promise.all(selectedTaskIds.map((taskId) => pmUpdateTask(taskId, applyAutomationRules(findTaskById(taskId), { status }, automationConfig))));
    toast.success(`Status změněn u ${selectedTaskIds.length} úkolů`);
    setSelectedTaskIds([]);
    await refresh();
  };

  const runBulkPriority = async (priority: PmPriority) => {
    if (selectedTaskIds.length === 0) return;
    await Promise.all(selectedTaskIds.map((taskId) => pmUpdateTask(taskId, { priority })));
    toast.success(`Priorita změněna u ${selectedTaskIds.length} úkolů`);
    setSelectedTaskIds([]);
    await refresh();
  };

  const runBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    await Promise.all(selectedTaskIds.map((taskId) => pmDeleteTask(taskId)));
    toast.success(`Smazáno ${selectedTaskIds.length} úkolů`);
    setSelectedTaskIds([]);
    await refresh();
  };

  const handleBoardMove = ({ event, activeContainer, overContainer }: KanbanMoveEvent) => {
    if (activeContainer === overContainer) return;
    const taskId = String(event.active.id);
    const nextStatus = overContainer as PmTaskStatus;
    if (!TASK_BOARD_STATUSES.includes(nextStatus)) return;

    let nextColumnsSnapshot: Record<string, PmTask[]> | null = null;
    setBoardColumns((prev) => {
      const from = prev[activeContainer] ?? [];
      const to = prev[overContainer] ?? [];
      const idx = from.findIndex((task) => task.id === taskId);
      if (idx === -1) return prev;
      const moved = { ...from[idx], status: nextStatus };
      const next = {
        ...prev,
        [activeContainer]: [...from.slice(0, idx), ...from.slice(idx + 1)],
        [overContainer]: [moved, ...to],
      };
      nextColumnsSnapshot = next;
      return next;
    });

    applyTaskUpdate(taskId, { status: nextStatus });
    if (nextColumnsSnapshot) {
      const ordered = TASK_BOARD_STATUSES.flatMap((status) => nextColumnsSnapshot?.[status] ?? []);
      const payload = ordered.map((task, index) => ({ id: task.id, order: index }));
      pmReorderTasks(payload).catch(() => {});
    }
  };

  const handleTodoStyleMove = ({ event, activeContainer, overContainer }: KanbanMoveEvent) => {
    if (activeContainer === overContainer) return;
    const taskId = String(event.active.id);
    const nextColumn = overContainer as PmTaskStatus;
    if (!todoStyleActiveColumns.includes(nextColumn)) return;

    const nextStatus = nextColumn;
    let nextColumnsSnapshot: Record<TodoStyleColumn, PmTask[]> | null = null;
    setTodoStyleColumns((prev) => {
      const from = prev[activeContainer as PmTaskStatus] ?? [];
      const to = prev[nextColumn] ?? [];
      const idx = from.findIndex((task) => task.id === taskId);
      if (idx === -1) return prev;
      const moved = { ...from[idx], status: nextStatus };
      const next = {
        ...prev,
        [activeContainer as PmTaskStatus]: [...from.slice(0, idx), ...from.slice(idx + 1)],
        [nextColumn]: [moved, ...to],
      };
      nextColumnsSnapshot = next;
      return next;
    });

    applyTaskUpdate(taskId, { status: nextStatus });
    if (nextColumnsSnapshot) {
      const ordered = todoStyleActiveColumns.flatMap((column) => nextColumnsSnapshot?.[column] ?? []);
      const payload = ordered.map((task, index) => ({ id: task.id, order: index }));
      pmReorderTasks(payload).catch(() => {});
    }
  };

  const handleDomainTodoMove = ({ event, activeContainer, overContainer }: KanbanMoveEvent) => {
    if (activeContainer === overContainer) return;
    const taskId = String(event.active.id);
    const nextColumn = overContainer as PmTaskStatus;
    if (!domainTodoActiveColumns.includes(nextColumn)) return;

    const nextStatus = nextColumn;
    let nextColumnsSnapshot: Record<TodoStyleColumn, PmTask[]> | null = null;
    setDomainTodoColumns((prev) => {
      const from = prev[activeContainer as PmTaskStatus] ?? [];
      const to = prev[nextColumn] ?? [];
      const idx = from.findIndex((task) => task.id === taskId);
      if (idx === -1) return prev;
      const moved = { ...from[idx], status: nextStatus };
      const next = {
        ...prev,
        [activeContainer as PmTaskStatus]: [...from.slice(0, idx), ...from.slice(idx + 1)],
        [nextColumn]: [moved, ...to],
      };
      nextColumnsSnapshot = next;
      return next;
    });

    applyTaskUpdate(taskId, { status: nextStatus });
    if (nextColumnsSnapshot) {
      const ordered = domainTodoActiveColumns.flatMap((column) => nextColumnsSnapshot?.[column] ?? []);
      const payload = ordered.map((task, index) => ({ id: task.id, order: index }));
      pmReorderTasks(payload).catch(() => {});
    }
  };

  const openTaskDetail = (task: PmTask) => {
    setActiveTask(task);
    setTaskDetailOpen(true);
  };

  const submitQuickTask = () => {
    const titles = quickTaskTitle
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (titles.length === 0) {
      toast.error('Zadej alespoň jeden název úkolu.');
      return;
    }
    if (!quickTaskAreaId) {
      toast.error('Vyber oblast pro úkol.');
      return;
    }

    Promise.all(
      titles.map((title) => createTask.mutateAsync({ areaId: quickTaskAreaId, title, status: 'Backlog', priority: 'normal' })),
    )
      .then(() => {
        setQuickTaskOpen(false);
        setQuickTaskTitle('');
        toast.success(titles.length === 1 ? 'Úkol vytvořen' : `Vytvořeno ${titles.length} úkolů`);
      })
      .catch(() => toast.error('Vytvoření úkolů selhalo'));
  };

  const persistTaskMeta = (next: {
    subtasks?: TaskSubtask[];
    comments?: TaskComment[];
    attachments?: TaskAttachment[];
    taskMeta?: PmTaskMeta;
  }) => {
    if (!activeTask) return;
    const payload: Record<string, unknown> = { ...next };
    delete payload.taskMeta;
    if (next.comments || next.taskMeta) {
      const visibleComments = next.comments ?? comments;
      const meta = next.taskMeta ?? activeTaskMeta;
      payload.comments = composeCommentsWithMeta(visibleComments, meta);
    }
    updateTask.mutate(
      { taskId: activeTask.id, data: payload },
      {
        onSuccess: () => {
          if (next.taskMeta) setActiveTaskMeta(next.taskMeta);
          setActiveTask((prev) => (prev ? { ...prev, ...payload } : prev));
        },
      },
    );
  };

  const addSubtask = () => {
    if (!activeTask || !subtaskDraft.trim()) return;
    const item: TaskSubtask = {
      id: crypto.randomUUID(),
      title: subtaskDraft.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    const next = [...subtasks, item];
    setSubtasks(next);
    persistTaskMeta({ subtasks: next });
    setSubtaskDraft('');
  };

  const toggleSubtask = (subtaskId: string, done: boolean) => {
    if (!activeTask) return;
    const next = subtasks.map((item) => (item.id === subtaskId ? { ...item, done } : item));
    setSubtasks(next);
    persistTaskMeta({ subtasks: next });
  };

  const deleteSubtask = (subtaskId: string) => {
    if (!activeTask) return;
    const next = subtasks.filter((item) => item.id !== subtaskId);
    setSubtasks(next);
    persistTaskMeta({ subtasks: next });
  };

  const addComment = () => {
    if (!activeTask || !commentDraft.trim()) return;
    const item: TaskComment = {
      id: crypto.randomUUID(),
      text: commentDraft.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...comments];
    setComments(next);
    persistTaskMeta({ comments: next });
    setCommentDraft('');
  };

  const updateTaskDependencies = (dependencyIds: string[]) => {
    const unique = Array.from(new Set(dependencyIds.filter((value) => value && value !== activeTask?.id)));
    persistTaskMeta({ taskMeta: { dependencyIds: unique } });
    toast.success('Závislosti úkolu aktualizovány');
  };

  const addAttachments = async (files: FileList | null) => {
    if (!activeTask || !files || files.length === 0) return;
    const created: TaskAttachment[] = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: await readFileAsDataUrl(file),
        createdAt: new Date().toISOString(),
      })),
    );
    const next = [...attachments, ...created];
    setAttachments(next);
    persistTaskMeta({ attachments: next });
  };

  const removeAttachment = (attachmentId: string) => {
    if (!activeTask) return;
    const next = attachments.filter((attachment) => attachment.id !== attachmentId);
    setAttachments(next);
    persistTaskMeta({ attachments: next });
  };

  const applyQuickTemplate = async (templateId: string, targetAreaId: string) => {
    const template = quickTaskTemplates.find((item) => item.id === templateId);
    if (!template) return;
    if (!id) return;
    const areaId = targetAreaId;
    if (!areaId) {
      toast.error('Projekt nemá žádnou oblast. Nejprve vytvoř oblast.');
      return;
    }
    const status = todoStyleActiveColumns[0] ?? 'Backlog';
    const titles = template.tasks.map((task) => task.trim()).filter(Boolean);
    if (titles.length === 0) {
      toast.error('Vybraná šablona neobsahuje žádné úkoly.');
      return;
    }
    const existingInArea = new Set(
      allTasks
        .filter((task) => task.areaId === areaId)
        .map((task) => task.title.trim().toLocaleLowerCase('cs-CZ'))
        .filter(Boolean),
    );
    const uniqueTitles: string[] = [];
    const seenInBatch = new Set<string>();
    for (const title of titles) {
      const key = title.toLocaleLowerCase('cs-CZ');
      if (existingInArea.has(key)) continue;
      if (seenInBatch.has(key)) continue;
      seenInBatch.add(key);
      uniqueTitles.push(title);
    }
    if (uniqueTitles.length === 0) {
      toast('Šablona už je v této oblasti vložená, duplicity jsem přeskočil.');
      return;
    }
    try {
      setApplyingTemplate(true);
      await Promise.all(
        uniqueTitles.map((title) =>
          pmCreateTask({
            projectId: id,
            areaId,
            title,
            status,
            priority: 'normal',
          }),
        ),
      );
      const skipped = titles.length - uniqueTitles.length;
      if (skipped > 0) {
        toast.success(`Vloženo ${uniqueTitles.length} úkolů, ${skipped} duplicit přeskočeno`);
      } else {
        toast.success(`Vloženo ${uniqueTitles.length} úkolů ze šablony`);
      }
      await refresh();
    } catch {
      toast.error('Vložení šablony selhalo');
    } finally {
      setApplyingTemplate(false);
    }
  };

  return (
    <>
      <ContentHeader className="gap-2 flex-wrap">
        <Link to="/core/crm/pm" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Projekty
        </Link>
        <span className="text-muted-foreground hidden sm:inline">/</span>
        <h1 className="text-sm font-semibold flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
          {p.color && <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />}
          <span className="truncate">{p.name}</span>
        </h1>
        <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
          {isTemplateProject && !focusModeEnabled && (
            <Button variant="outline" size="sm" onClick={() => setFocusModeEnabled(true)}>
              Focus režim
            </Button>
          )}
          <ActiveWaveDot active={p.activeWave} />
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={() => setSidebarExpanded((prev) => !prev)}
            title={sidebarExpanded ? 'Sbalit sidebar' : 'Rozbalit sidebar'}
          >
            {sidebarExpanded ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>
      </ContentHeader>

      <Content className="px-3 sm:px-5 pb-6">
        <div className={`grid grid-cols-1 ${sidebarExpanded ? 'xl:grid-cols-[1fr_320px]' : ''} gap-5 w-full`}>
          <section className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <TaskCounter label="Úkoly" value={scopedTasks.length} />
                <TaskCounter label="Hotovo" value={doneTasks} tone="done" />
                <TaskCounter label="Blokováno" value={blockedTasks} tone="blocked" />
                <div className="w-full sm:w-auto sm:ml-auto min-w-[140px]">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Postup</span>
                    <span>{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-1.5" />
                </div>
              </div>
            </div>

            <TodoStyleTasksSection
              view={domainModeEnabled ? domainTodoView : todoStyleView}
              onViewChange={domainModeEnabled ? setDomainTodoView : setTodoStyleView}
              search={domainModeEnabled ? domainTodoSearch : todoStyleSearch}
              onSearchChange={domainModeEnabled ? setDomainTodoSearch : setTodoStyleSearch}
              statusFilter={domainModeEnabled ? domainTodoStatusFilter : todoStyleStatusFilter}
              onStatusFilterChange={domainModeEnabled ? setDomainTodoStatusFilter : setTodoStyleStatusFilter}
              assigneeFilter={domainModeEnabled ? domainTodoAssigneeFilter : todoStyleAssigneeFilter}
              onAssigneeFilterChange={domainModeEnabled ? setDomainTodoAssigneeFilter : setTodoStyleAssigneeFilter}
              areaFilter={domainModeEnabled ? domainTodoAreaFilter : todoStyleAreaFilter}
              onAreaFilterChange={domainModeEnabled ? setDomainTodoAreaFilter : setTodoStyleAreaFilter}
              areas={scopedAreas}
              activeColumns={domainModeEnabled ? domainTodoActiveColumns : todoStyleActiveColumns}
              onAddColumn={(status) => {
                const setColumns = domainModeEnabled ? setDomainTodoActiveColumns : setTodoStyleActiveColumns;
                const setBoard = domainModeEnabled ? setDomainTodoColumns : setTodoStyleColumns;
                setColumns((prev) => {
                  const next = prev.includes(status) ? prev : [...prev, status];
                  setBoard((current) => ensureTodoColumns(current, next));
                  return next;
                });
              }}
              onRemoveColumn={(status) => {
                const setColumns = domainModeEnabled ? setDomainTodoActiveColumns : setTodoStyleActiveColumns;
                const setBoard = domainModeEnabled ? setDomainTodoColumns : setTodoStyleColumns;
                setColumns((prev) => {
                  const next = prev.filter((s) => s !== status);
                  setBoard((current) => ensureTodoColumns(current, next.length > 0 ? next : prev));
                  return next.length > 0 ? next : prev;
                });
              }}
              onMoveColumn={(fromIndex, toIndex) => {
                const setColumns = domainModeEnabled ? setDomainTodoActiveColumns : setTodoStyleActiveColumns;
                setColumns((prev) => {
                  if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) return prev;
                  const next = [...prev];
                  const [moved] = next.splice(fromIndex, 1);
                  next.splice(toIndex, 0, moved);
                  return next;
                });
              }}
              columnLabels={todoStyleColumnLabels}
              onColumnLabelChange={(status, label) => {
                setTodoStyleColumnLabels((prev) => {
                  const next = { ...prev, [status]: label };
                  if (id) {
                    localStorage.setItem(`pm-todo-column-labels:${id}`, JSON.stringify(next));
                  }
                  return next;
                });
              }}
              templates={quickTaskTemplates}
              onTemplatesChange={setQuickTaskTemplates}
              onApplyTemplate={applyQuickTemplate}
              applyingTemplate={applyingTemplate}
              onSaveAreaNote={(areaId, note) => updateArea.mutate({ areaId, data: { description: note } })}
              isSavingAreaNote={updateArea.isPending}
              columns={domainModeEnabled ? domainTodoColumns : todoStyleColumns}
              onColumnsChange={domainModeEnabled ? setDomainTodoColumns : setTodoStyleColumns}
              tasks={scopedTasks}
              onMove={domainModeEnabled ? handleDomainTodoMove : handleTodoStyleMove}
              onTaskStatusChange={(taskId, status) => applyTaskUpdate(taskId, { status })}
              onTaskDelete={(taskId) => deleteTask.mutate(taskId)}
              onTaskOpen={openTaskDetail}
              domainNames={domainNames}
              selectedDomain={activeDomain}
              onDomainChange={switchDomainPage}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">Automatizace projektu (Asana-style)</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setAutomationExpanded((prev) => !prev)}
                    >
                      {automationExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                      {automationExpanded ? 'Skrýt' : 'Zobrazit'}
                    </Button>
                  </div>
                </CardHeader>
                {automationExpanded && (
                  <CardContent className="space-y-3 text-sm">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={automationConfig.autoSetActualOnDone}
                        onCheckedChange={(v) => setAutomationConfig((prev) => ({ ...prev, autoSetActualOnDone: Boolean(v) }))}
                      />
                      Po dokončení doplnit skutečný čas z odhadu (když chybí)
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={automationConfig.autoPriorityOnBlocked}
                        onCheckedChange={(v) => setAutomationConfig((prev) => ({ ...prev, autoPriorityOnBlocked: Boolean(v) }))}
                      />
                      Při statusu Blokováno automaticky nastavit prioritu Vysoká
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={automationConfig.autoAssignOnActive}
                        onCheckedChange={(v) => setAutomationConfig((prev) => ({ ...prev, autoAssignOnActive: Boolean(v) }))}
                      />
                      Při statusu Aktivní přiřadit default řešitele a štítek
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        value={automationConfig.defaultAssignee}
                        onChange={(e) => setAutomationConfig((prev) => ({ ...prev, defaultAssignee: e.target.value }))}
                        placeholder="Default řešitel (jméno)"
                        className="h-9 rounded border px-3 text-sm bg-background"
                      />
                      <input
                        value={automationConfig.defaultTag}
                        onChange={(e) => setAutomationConfig((prev) => ({ ...prev, defaultTag: e.target.value }))}
                        placeholder="Default štítek"
                        className="h-9 rounded border px-3 text-sm bg-background"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">Workload řešitelů</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setWorkloadExpanded((prev) => !prev)}
                    >
                      {workloadExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                      {workloadExpanded ? 'Skrýt' : 'Zobrazit'}
                    </Button>
                  </div>
                </CardHeader>
                {workloadExpanded && (
                  <CardContent className="space-y-2">
                    {assigneeWorkload.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Zatím bez úkolů.</p>
                    ) : (
                      assigneeWorkload.map((row) => {
                        const capacityHours = assigneeCapacityHours[row.assignee] ?? 0;
                        const plannedHours = Math.round((row.estimated / 60) * 10) / 10;
                        const loadPct = capacityHours > 0 ? Math.round((plannedHours / capacityHours) * 100) : 0;
                        return (
                          <div key={row.assignee} className="rounded-lg border p-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium flex-1 truncate">{row.assignee}</p>
                              <Badge variant="outline" className="text-xs">{row.open} open / {row.done} done</Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Plán: {formatMinutes(row.estimated)}</span>
                              <span>Skutečnost: {formatMinutes(row.actual)}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={capacityHours || ''}
                                onChange={(e) => {
                                  const next = Number(e.target.value);
                                  setAssigneeCapacityHours((prev) => ({
                                    ...prev,
                                    [row.assignee]: Number.isFinite(next) && next > 0 ? next : 0,
                                  }));
                                }}
                                placeholder="Kapacita h/týden"
                                className="h-8 rounded border px-2 text-xs bg-background w-36"
                              />
                              <span className={`text-xs ${loadPct > 100 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                Vytížení: {capacityHours > 0 ? `${loadPct}%` : '—'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                )}
              </Card>
            </div>

            <Tabs defaultValue="tasks" className="w-full">
              <TabsList variant="line" className="gap-2 bg-transparent border-b [&_button]:border-b [&_button_svg]:size-4 px-0 overflow-x-auto whitespace-nowrap no-scrollbar">
                <TabsTrigger value="tasks"><CheckSquare /> Úkoly</TabsTrigger>
                <TabsTrigger value="areas"><Layers /> Oblasti</TabsTrigger>
                <TabsTrigger value="milestones"><Flag /> Milestones</TabsTrigger>
                <TabsTrigger value="overview"><Target /> Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="pt-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <FilterChip active={taskFilter === 'all'} onClick={() => setTaskFilter('all')} label="Vše" />
                  <FilterChip active={taskFilter === 'open'} onClick={() => setTaskFilter('open')} label="Otevřené" />
                  <FilterChip active={taskFilter === 'blocked'} onClick={() => setTaskFilter('blocked')} label="Blokované" />
                  <FilterChip active={taskFilter === 'done'} onClick={() => setTaskFilter('done')} label="Hotové" />

                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className="h-8 rounded border bg-background px-2 text-xs w-full sm:w-auto"
                  >
                    <option value="all">Všechny oblasti</option>
                    {scopedAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>

                  <Button size="sm" variant="outline" onClick={() => setQuickTaskOpen(true)} className="w-full sm:w-auto">
                    <Plus className="size-3.5" /> Nový úkol
                  </Button>

                  <div className="ml-auto inline-flex items-center rounded-lg border p-1 gap-1 w-full sm:w-auto justify-end">
                    <Button size="sm" variant={taskView === 'list' ? 'secondary' : 'ghost'} onClick={() => setTaskView('list')}>
                      <List className="size-4" />
                    </Button>
                    <Button size="sm" variant={taskView === 'board' ? 'secondary' : 'ghost'} onClick={() => setTaskView('board')}>
                      <KanbanSquare className="size-4" />
                    </Button>
                  </div>
                </div>

                <BulkBar
                  selectedCount={selectedCount}
                  allVisibleSelected={allVisibleSelected}
                  onToggleAll={toggleAllVisible}
                  onStatus={runBulkStatus}
                  onPriority={runBulkPriority}
                  onDelete={runBulkDelete}
                />

                {taskView === 'board' ? (
                  <Kanban
                    value={boardColumns}
                    onValueChange={setBoardColumns}
                    getItemValue={(item) => item.id}
                    onMove={handleBoardMove}
                  >
                    <div className="overflow-x-auto pb-1 md:overflow-visible">
                      <KanbanBoard className="grid auto-rows-fr gap-4 grid-flow-col auto-cols-[minmax(80vw,1fr)] md:grid-flow-row md:grid-cols-2 2xl:grid-cols-3 md:auto-cols-auto">
                        {TASK_BOARD_STATUSES.map((status) => (
                          <KanbanColumn key={status} value={status}>
                            <div className="rounded-xl border bg-card min-h-[220px]">
                              <div className={`px-3 py-2 border-b flex items-center justify-between ${kanbanHeaderTone(status)}`}>
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">{status}</span>
                                <Badge variant="outline" className="text-xs">{(boardColumns[status] ?? []).length}</Badge>
                              </div>
                              <KanbanColumnContent value={status} className="p-2">
                                {(boardColumns[status] ?? []).map((task) => (
                                  <KanbanItem key={task.id} value={task.id}>
                                    <BoardTaskCard
                                      task={task}
                                      selected={selectedTaskIds.includes(task.id)}
                                      onSelect={(checked) => toggleTaskSelected(task.id, checked)}
                                      onStatusChange={(nextStatus) => applyTaskUpdate(task.id, { status: nextStatus })}
                                      onOpenDetail={openTaskDetail}
                                    />
                                  </KanbanItem>
                                ))}
                              </KanbanColumnContent>
                            </div>
                          </KanbanColumn>
                        ))}
                      </KanbanBoard>
                    </div>
                    <KanbanOverlay>
                      <div className="rounded-md bg-muted/60 size-full" />
                    </KanbanOverlay>
                  </Kanban>
                ) : (
                  <div className="space-y-4">
                    {visibleAreas.length === 0 && (
                      <div className="text-xs text-muted-foreground rounded border border-dashed p-3">
                        Pro vybraný filtr oblasti nejsou dostupné žádné sekce.
                      </div>
                    )}
                    {visibleAreas.map((area) => (
                      <AreaTasksCard
                        key={area.id}
                        area={area}
                        tasks={filteredTasks.filter((t) => t.areaId === area.id)}
                        selectedTaskIds={selectedTaskIds}
                        onSelectTask={toggleTaskSelected}
                        onAddTask={(title) => createTask.mutate({ areaId: area.id, title, status: 'Backlog', priority: 'normal' })}
                        onTaskStatusChange={(taskId, status) => applyTaskUpdate(taskId, { status })}
                        onTaskDelete={(taskId) => deleteTask.mutate(taskId)}
                        onTaskOpen={openTaskDetail}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="areas" className="pt-4">
                <AreasPanel
                  areas={scopedAreas}
                  onAddArea={(name) => createArea.mutate({ name, projectId: id, order: p.areas?.length ?? 0 })}
                  onDeleteArea={(areaId) => deleteArea.mutate(areaId)}
                />
              </TabsContent>

              <TabsContent value="milestones" className="pt-4">
                <MilestonesPanel milestones={p.milestones ?? []} />
              </TabsContent>

              <TabsContent value="overview" className="pt-4">
                <OverviewPanel project={p} />
              </TabsContent>
            </Tabs>
          </section>

          {sidebarExpanded ? (
            <aside className="xl:sticky xl:top-4 h-fit">
              <div className="space-y-4">
                <NextStepCard project={p} onSave={(nextStep) => updateProject.mutate({ nextStep })} />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Projekt Info</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2 text-xs">
                <InfoRow label="Status" value={p.status} />
                <InfoRow label="Priorita" value={priorityLabel(p.priority)} />
                <InfoRow label="Budget" value={`${p.weeklyTimeBudget}h / týden`} />
                {p.domain && <InfoRow label="Doména" value={p.domain} />}
                {p.category && <InfoRow label="Kategorie" value={p.category} />}
                {p.phase && <InfoRow label="Fáze" value={p.phase} />}
              </CardContent>
            </Card>

                {(p.description || p.mainGoal) && (
                  <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Poznámky projektu</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Poznámka</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.description || 'Bez poznámky'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Výsledek / Revize</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.mainGoal || 'Bez revize'}</p>
                  </div>
                </CardContent>
                  </Card>
                )}
              </div>
            </aside>
          ) : null}
        </div>
      </Content>
      <Dialog open={quickTaskOpen} onOpenChange={setQuickTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nový úkol</DialogTitle>
            <DialogDescription>Vytvoření nového úkolu do vybrané oblasti projektu.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Textarea
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitQuickTask();
              }}
              placeholder="Název úkolu (jeden na řádek)"
              className="min-h-28"
            />
            <p className="text-xs text-muted-foreground">Vlož více úkolů přes copy/paste. Každý řádek = jeden úkol.</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Oblast</p>
              <select
                value={quickTaskAreaId}
                onChange={(e) => setQuickTaskAreaId(e.target.value)}
                className="h-9 rounded border px-2 text-sm bg-background w-full"
              >
                <option value="">Vyber oblast</option>
                {scopedAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            {scopedAreas.length === 0 && (
              <p className="text-xs text-amber-600">
                Projekt nemá žádnou oblast. Nejprve ji přidej v záložce Oblasti.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setQuickTaskOpen(false)}>
                Zrušit
              </Button>
              <Button
                type="button"
                onClick={submitQuickTask}
                disabled={createTask.isPending || scopedAreas.length === 0}
              >
                {createTask.isPending ? 'Vytvářím...' : 'Vytvořit úkol'}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
      <Dialog
        open={taskDetailOpen}
        onOpenChange={(open) => {
          setTaskDetailOpen(open);
          if (!open) setActiveTask(null);
        }}
      >
        <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl p-0 overflow-hidden">
          <DialogHeader>
            <div className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-start gap-3">
                <div>
                  <DialogTitle>{activeTask?.title ?? 'Detail úkolu'}</DialogTitle>
                </div>
              </div>
            </div>
          </DialogHeader>
          {activeTask && (
            <DialogBody className="grid grid-cols-1 xl:grid-cols-[1fr_320px] max-h-[85vh] overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-5 border-r">
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Popis úkolu</p>
                  <Textarea
                    value={taskDetailForm.description}
                    onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-56 sm:min-h-112"
                    placeholder="Napiš detail zadání, kontext a cíle..."
                  />
                </div>

                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Podúkoly</p>
                    <Badge variant="outline">{subtasks.length}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={subtaskDraft}
                      onChange={(e) => setSubtaskDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addSubtask();
                      }}
                      placeholder="Přidat podúkol..."
                      className="h-9 rounded border px-3 text-sm bg-background flex-1"
                    />
                    <Button size="sm" className="h-9" onClick={addSubtask}>
                      <Plus className="size-3.5" /> Přidat
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {subtasks.length === 0 && <p className="text-xs text-muted-foreground">Zatím bez podúkolů.</p>}
                    {subtasks.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 rounded-lg border px-2.5 py-2">
                        <Checkbox checked={item.done} onCheckedChange={(v) => toggleSubtask(item.id, Boolean(v))} />
                        <span className={`text-sm flex-1 ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.title}</span>
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => deleteSubtask(item.id)}>
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Soubory</p>
                    <label className="inline-flex items-center gap-1.5 text-xs text-primary cursor-pointer">
                      <Paperclip className="size-3.5" /> Přiložit
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          void addAttachments(e.target.files);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    {attachments.length === 0 && <p className="text-xs text-muted-foreground">Zatím bez souborů.</p>}
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 rounded-lg border px-2.5 py-2">
                        <Paperclip className="size-3.5 text-muted-foreground" />
                        <a href={attachment.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex-1 truncate">
                          {attachment.name}
                        </a>
                        <span className="text-[11px] text-muted-foreground">{formatFileSize(attachment.size)}</span>
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => removeAttachment(attachment.id)}>
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border p-4 space-y-3">
                  <p className="text-sm font-semibold">Komentáře</p>
                  <Textarea
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    className="min-h-24"
                    placeholder="Přidej komentář k úkolu..."
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={addComment}>
                      <Plus className="size-3.5" /> Uložit komentář
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {comments.length === 0 && <p className="text-xs text-muted-foreground">Zatím bez komentářů.</p>}
                    {comments.map((item) => (
                      <div key={item.id} className="rounded-lg border p-3">
                        <p className="text-sm whitespace-pre-wrap">{item.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleString('cs-CZ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="p-4 sm:p-6 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vlastnosti</p>
                  <span className="text-[11px] text-muted-foreground">
                    {detailAutosaveState === 'saving' ? 'Ukládám…' : detailAutosaveState === 'saved' ? 'Uloženo' : '—'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Název</label>
                  <input
                    value={taskDetailForm.title}
                    onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-9 rounded border px-2.5 text-sm bg-background w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TASK_BOARD_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setTaskDetailForm((prev) => ({ ...prev, status }))}
                        className={`h-7 text-xs rounded border ${taskDetailForm.status === status ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                      >
                        {todoStyleColumnLabels[status] ?? status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Priorita</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['low', 'normal', 'high', 'critical'] as PmPriority[]).map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setTaskDetailForm((prev) => ({ ...prev, priority }))}
                        className={`h-7 text-xs rounded border ${taskDetailForm.priority === priority ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                      >
                        {priorityLabel(priority)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Termín</label>
                  <input
                    type="date"
                    value={taskDetailForm.deadline}
                    onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="h-9 rounded border px-2.5 text-sm bg-background w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Odhad (min)</label>
                    <input
                      value={taskDetailForm.estimatedDuration}
                      onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, estimatedDuration: e.target.value }))}
                      className="h-9 rounded border px-2.5 text-sm bg-background w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Skutečnost (min)</label>
                    <input
                      value={taskDetailForm.actualDuration}
                      onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, actualDuration: e.target.value }))}
                      className="h-9 rounded border px-2.5 text-sm bg-background w-full"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Důvod blokace</label>
                  <Textarea
                    value={taskDetailForm.blockedReason}
                    onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, blockedReason: e.target.value }))}
                    className="min-h-16"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Next step</label>
                  <Textarea
                    value={taskDetailForm.nextStep}
                    onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, nextStep: e.target.value }))}
                    className="min-h-16"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Definition of done</label>
                  <Textarea
                    value={taskDetailForm.definitionOfDone}
                    onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, definitionOfDone: e.target.value }))}
                    className="min-h-16"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Tagy</label>
                  <input
                    value={taskDetailForm.tags}
                    onChange={(e) => setTaskDetailForm((prev) => ({ ...prev, tags: e.target.value }))}
                    className="h-9 rounded border px-2.5 text-sm bg-background w-full"
                    placeholder="seo, obsah, ux..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Závislosti úkolu</label>
                  <div className="rounded-lg border bg-background p-2 max-h-44 overflow-y-auto space-y-1.5">
                    {allTasks
                      .filter((task) => task.id !== activeTask.id)
                      .slice(0, 80)
                      .map((task) => (
                        <label key={task.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={activeTaskMeta.dependencyIds.includes(task.id)}
                            onCheckedChange={(v) => {
                              const checked = Boolean(v);
                              if (checked) {
                                updateTaskDependencies([...activeTaskMeta.dependencyIds, task.id]);
                              } else {
                                updateTaskDependencies(activeTaskMeta.dependencyIds.filter((id) => id !== task.id));
                              }
                            }}
                          />
                          <span className="text-xs truncate">{task.title}</span>
                        </label>
                      ))}
                    {allTasks.length <= 1 && <p className="text-xs text-muted-foreground">Žádné další úkoly v projektu.</p>}
                  </div>
                  {activeTaskMeta.dependencyIds.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Blokováno {activeTaskMeta.dependencyIds.length} úkoly.
                    </p>
                  )}
                </div>

                <div className="pt-2 space-y-1.5 text-xs">
                  <InfoRow label="Projekt" value={activeTask.project?.name ?? p.name} />
                  <InfoRow label="Oblast" value={activeTask.area?.name ?? '—'} />
                  <InfoRow label="Milestone" value={activeTask.milestone?.name ?? '—'} />
                  <InfoRow label="Vytvořeno" value={new Date(activeTask.createdAt).toLocaleDateString('cs-CZ')} />
                </div>

              </aside>
            </DialogBody>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function TodoStyleTasksSection({
  view,
  onViewChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  areaFilter,
  onAreaFilterChange,
  areas,
  activeColumns,
  onAddColumn,
  onRemoveColumn,
  onMoveColumn,
  columnLabels,
  onColumnLabelChange,
  templates,
  onTemplatesChange,
  onApplyTemplate,
  applyingTemplate,
  onSaveAreaNote,
  isSavingAreaNote,
  columns,
  onColumnsChange,
  tasks,
  onMove,
  onTaskStatusChange,
  onTaskDelete,
  onTaskOpen,
  domainNames,
  selectedDomain,
  onDomainChange,
}: {
  view: TodoStyleView;
  onViewChange: (next: TodoStyleView) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | PmTaskStatus;
  onStatusFilterChange: (value: 'all' | PmTaskStatus) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  areaFilter: string;
  onAreaFilterChange: (value: string) => void;
  areas: PmArea[];
  activeColumns: PmTaskStatus[];
  onAddColumn: (status: PmTaskStatus) => void;
  onRemoveColumn: (status: PmTaskStatus) => void;
  onMoveColumn: (fromIndex: number, toIndex: number) => void;
  columnLabels: Record<PmTaskStatus, string>;
  onColumnLabelChange: (status: PmTaskStatus, label: string) => void;
  templates: QuickTaskTemplate[];
  onTemplatesChange: (next: QuickTaskTemplate[]) => void;
  onApplyTemplate: (templateId: string, areaId: string) => void;
  applyingTemplate: boolean;
  onSaveAreaNote: (areaId: string, note: string) => void;
  isSavingAreaNote: boolean;
  columns: Record<TodoStyleColumn, PmTask[]>;
  onColumnsChange: (next: Record<TodoStyleColumn, PmTask[]>) => void;
  tasks: PmTask[];
  onMove: (event: KanbanMoveEvent) => void;
  onTaskStatusChange: (taskId: string, status: PmTaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskOpen: (task: PmTask) => void;
  domainNames: string[];
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
}) {
  const query = search.trim().toLowerCase();
  const assigneeOptions = useMemo(() => {
    const all = new Set<string>();
    for (const task of tasks) {
      const value = (task.assignedTo ?? '').trim();
      if (value) all.add(value);
    }
    return Array.from(all).sort((a, b) => a.localeCompare(b, 'cs'));
  }, [tasks]);

  const areaOptions = useMemo(() => {
    const all = new Map<string, string>();
    for (const area of areas ?? []) {
      if (!area?.id) continue;
      all.set(area.id, area.name?.trim() || 'Neznámá sekce');
    }
    for (const task of tasks) {
      if (!task.areaId) continue;
      if (all.has(task.areaId)) continue;
      const nameFromTask = task.area?.name?.trim();
      all.set(task.areaId, nameFromTask || 'Neznámá sekce');
    }
    return Array.from(all.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  }, [areas, tasks]);

  const addableColumns = useMemo(
    () => TASK_BOARD_STATUSES.filter((status) => !activeColumns.includes(status)),
    [activeColumns],
  );
  const lastActiveColumn = activeColumns[activeColumns.length - 1] ?? null;
  const columnTitleSizeClass = (label: string) => {
    const len = label.trim().length;
    if (len > 22) return 'text-[9px]';
    if (len > 16) return 'text-[10px]';
    return 'text-[11px]';
  };
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateNameDraft, setTemplateNameDraft] = useState('');
  const [templateTasksDraft, setTemplateTasksDraft] = useState('');

  useEffect(() => {
    if (!templates.length) {
      setSelectedTemplateId('');
      setTemplateNameDraft('');
      setTemplateTasksDraft('');
      return;
    }
    const exists = templates.some((tpl) => tpl.id === selectedTemplateId);
    const targetId = exists ? selectedTemplateId : templates[0].id;
    const target = templates.find((tpl) => tpl.id === targetId) ?? templates[0];
    setSelectedTemplateId(target.id);
    setTemplateNameDraft(target.name);
    setTemplateTasksDraft(target.tasks.join('\n'));
  }, [templates, selectedTemplateId]);
  const [editingColumn, setEditingColumn] = useState<PmTaskStatus | null>(null);
  const [editingLabelDraft, setEditingLabelDraft] = useState('');

  const selectedAreaId = areaFilter !== 'all' ? areaFilter : (areaOptions[0]?.id ?? '');
  const selectedArea = useMemo(
    () => (selectedAreaId ? areas.find((area) => area.id === selectedAreaId) ?? null : null),
    [areas, selectedAreaId],
  );
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    if (view !== 'notes') return;
    if (areaFilter !== 'all') return;
    if (!areas?.length) return;
    onAreaFilterChange(areas[0].id);
  }, [view, areaFilter, areas, onAreaFilterChange]);

  useEffect(() => {
    setNoteDraft(selectedArea?.description ?? '');
  }, [selectedArea?.id, selectedArea?.description]);

  const normalizedColumns = useMemo(
    () => ensureTodoColumns(columns, activeColumns),
    [columns, activeColumns],
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (statusFilter !== 'all' && task.status !== statusFilter) return false;
        if (assigneeFilter !== 'all' && (task.assignedTo ?? '') !== assigneeFilter) return false;
        if (areaFilter !== 'all' && task.areaId !== areaFilter) return false;
        if (!query) return true;
        return task.title.toLowerCase().includes(query) || (task.description ?? '').toLowerCase().includes(query);
      }),
    [tasks, query, statusFilter, assigneeFilter, areaFilter],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap sm:inline-flex items-center rounded-lg border p-1 gap-1">
            <Button size="sm" variant={view === 'columns' ? 'secondary' : 'ghost'} onClick={() => onViewChange('columns')}>
              <KanbanSquare className="size-4" />
            </Button>
            <Button size="sm" variant={view === 'rows' ? 'secondary' : 'ghost'} onClick={() => onViewChange('rows')}>
              <List className="size-4" />
            </Button>
            <Button size="sm" variant={view === 'table' ? 'secondary' : 'ghost'} onClick={() => onViewChange('table')}>
              <Table2 className="size-4" />
            </Button>
            <Button size="sm" variant={view === 'timeline' ? 'secondary' : 'ghost'} onClick={() => onViewChange('timeline')}>
              <span className="hidden sm:inline">Timeline</span>
              <span className="sm:hidden text-xs">Time</span>
            </Button>
            <Button size="sm" variant={view === 'calendar' ? 'secondary' : 'ghost'} onClick={() => onViewChange('calendar')}>
              <span className="hidden sm:inline">Kalendář</span>
              <span className="sm:hidden text-xs">Kal</span>
            </Button>
            <Button size="sm" variant={templateOpen ? 'secondary' : 'ghost'} onClick={() => setTemplateOpen((prev) => !prev)}>
              <Layers className="size-4" />
            </Button>
            <Button
              size="sm"
              variant={view === 'notes' ? 'secondary' : 'ghost'}
              onClick={() => onViewChange(view === 'notes' ? 'columns' : 'notes')}
            >
              <NotebookPen className="size-4" />
            </Button>
            <select
              value={selectedDomain}
              onChange={(e) => onDomainChange(e.target.value)}
              className="h-8 rounded border px-2 text-xs bg-background min-w-[140px] w-full sm:w-auto sm:min-w-[180px]"
              title="Přepnout doménový workspace"
            >
              {domainNames.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
        </div>
        {templateOpen && (
          <div className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="h-9 rounded-lg border px-3 text-sm bg-background min-w-[220px]"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={() => selectedTemplateId && selectedAreaId && onApplyTemplate(selectedTemplateId, selectedAreaId)}
                disabled={!selectedTemplateId || !selectedAreaId || applyingTemplate}
              >
                {applyingTemplate ? 'Vkládám...' : 'Vložit do 1. sloupce'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const id = crypto.randomUUID();
                  const nextTemplate: QuickTaskTemplate = { id, name: 'Nová šablona', tasks: [] };
                  onTemplatesChange([...templates, nextTemplate]);
                  setSelectedTemplateId(id);
                }}
              >
                <Plus className="size-3.5" /> Nová šablona
              </Button>
            </div>
            <input
              value={templateNameDraft}
              onChange={(e) => setTemplateNameDraft(e.target.value)}
              className="h-9 rounded-lg border px-3 text-sm bg-background w-full"
              placeholder="Název šablony"
            />
            <Textarea
              value={templateTasksDraft}
              onChange={(e) => setTemplateTasksDraft(e.target.value)}
              className="min-h-36"
              placeholder="Jeden úkol na řádek"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  if (!selectedTemplateId) return;
                  const nextName = templateNameDraft.trim() || 'Bez názvu';
                  const nextTasks = templateTasksDraft
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean);
                  onTemplatesChange(
                    templates.map((tpl) =>
                      tpl.id === selectedTemplateId
                        ? { ...tpl, name: nextName, tasks: nextTasks }
                        : tpl,
                    ),
                  );
                  setTemplateNameDraft(nextName);
                  setTemplateTasksDraft(nextTasks.join('\n'));
                }}
              >
                Uložit šablonu
              </Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Hledat úkoly..."
            className="h-9 rounded-lg border px-3 text-sm bg-background"
          />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | PmTaskStatus)}
            className="h-9 rounded-lg border px-3 text-sm bg-background"
          >
            <option value="all">Všechny statusy</option>
            {TASK_BOARD_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
            <option value="Archiv">Archiv</option>
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => onAssigneeFilterChange(e.target.value)}
            className="h-9 rounded-lg border px-3 text-sm bg-background"
          >
            <option value="all">Všichni řešitelé</option>
            {assigneeOptions.map((assignee) => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
          <select
            value={areaFilter}
            onChange={(e) => onAreaFilterChange(e.target.value)}
            className="h-9 rounded-lg border px-3 text-sm bg-background"
          >
            <option value="all">Všechny sekce</option>
            {areaOptions.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {view === 'rows' ? (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div key={task.id} className="group relative rounded-lg border border-transparent hover:border-border">
                <TaskRow
                  task={task}
                  onStatusChange={(taskId, status) => onTaskStatusChange(taskId, status as PmTaskStatus)}
                  onSelect={onTaskOpen}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-7 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskDelete(task.id);
                  }}
                  title="Smazat úkol"
                >
                  <Trash2 className="size-3.5 text-red-500" />
                </Button>
              </div>
            ))}
            {filteredTasks.length === 0 && <p className="text-sm text-muted-foreground">Žádné úkoly.</p>}
          </div>
        ) : view === 'table' ? (
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Název</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Priorita</th>
                  <th className="text-left px-3 py-2 font-medium">Termín</th>
                  <th className="text-right px-3 py-2 font-medium">Akce</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-t hover:bg-muted/30 cursor-pointer"
                    onClick={() => onTaskOpen(task)}
                  >
                    <td className="px-3 py-2">{task.title}</td>
                    <td className="px-3 py-2">{task.status}</td>
                    <td className="px-3 py-2">{priorityLabel(task.priority)}</td>
                    <td className="px-3 py-2">{task.deadline ? new Date(task.deadline).toLocaleDateString('cs-CZ') : '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskDelete(task.id);
                        }}
                        title="Smazat úkol"
                      >
                        <Trash2 className="size-3.5 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Žádné úkoly.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : view === 'timeline' ? (
          <TimelineView tasks={filteredTasks} onTaskOpen={onTaskOpen} />
        ) : view === 'calendar' ? (
          <CalendarTaskView tasks={filteredTasks} onTaskOpen={onTaskOpen} />
        ) : view === 'notes' ? (
          <div className="space-y-3">
            {(areas ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Projekt zatím nemá žádné sekce.</p>
            ) : !selectedArea ? (
              <p className="text-sm text-muted-foreground">Vyber sekci ve filtru „Všechny sekce“.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Poznámka pro sekci: {selectedArea.name}</p>
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  className="min-h-40"
                  placeholder="Napiš poznámku pro tuto sekci..."
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => selectedArea && onSaveAreaNote(selectedArea.id, noteDraft.trim())}
                    disabled={!selectedArea || isSavingAreaNote}
                  >
                    {isSavingAreaNote ? 'Ukládám...' : 'Uložit poznámku'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Kanban
            value={normalizedColumns}
            onValueChange={(next) => onColumnsChange(ensureTodoColumns(next, activeColumns))}
            getItemValue={(item) => item.id}
            onMove={onMove}
          >
            <div className="overflow-x-auto pb-1 md:overflow-visible">
              <KanbanBoard
                className="grid w-full gap-3 grid-flow-col auto-cols-[minmax(78vw,1fr)] md:grid-flow-row md:auto-cols-auto md:[grid-template-columns:repeat(var(--kanban-column-count),minmax(0,1fr))]"
                style={{ ['--kanban-column-count' as string]: String(Math.max(activeColumns.length, 1)) }}
              >
              {activeColumns.map((column) => (
                <KanbanColumn key={column} value={column} className="min-w-0">
                  <div className="rounded-xl border bg-card min-h-[220px]">
                    <div className={`group/kanban-column-header px-3 py-2 border-b grid grid-cols-[1fr_auto] items-start gap-1.5 ${kanbanHeaderTone(column)}`}>
                      {editingColumn === column ? (
                        <div className="flex items-center gap-1 w-full">
                          <input
                            value={editingLabelDraft}
                            onChange={(e) => setEditingLabelDraft(e.target.value)}
                            className="h-7 w-full max-w-[150px] rounded border px-2 text-xs bg-background"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-4 p-0"
                            onClick={() => {
                              const idx = activeColumns.indexOf(column);
                              if (idx <= 0) return;
                              onMoveColumn(idx, idx - 1);
                            }}
                            disabled={activeColumns.indexOf(column) <= 0}
                            title="Posunout sloupec doleva"
                          >
                            <ChevronLeft className="size-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-4 p-0"
                            onClick={() => {
                              const idx = activeColumns.indexOf(column);
                              if (idx < 0 || idx >= activeColumns.length - 1) return;
                              onMoveColumn(idx, idx + 1);
                            }}
                            disabled={activeColumns.indexOf(column) < 0 || activeColumns.indexOf(column) >= activeColumns.length - 1}
                            title="Posunout sloupec doprava"
                          >
                            <ChevronRight className="size-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              const next = editingLabelDraft.trim() || column;
                              onColumnLabelChange(column, next);
                              setEditingColumn(null);
                            }}
                          >
                            Uložit
                          </Button>
                          <Badge variant="outline" className="h-4 min-w-4 px-1 text-[9px] leading-none">{(normalizedColumns[column] ?? []).length}</Badge>
                        </div>
                      ) : (
                        <div className="min-w-0 pr-1">
                          <span
                            className={`block font-semibold uppercase tracking-wide text-slate-700 whitespace-nowrap overflow-hidden text-clip leading-none ${columnTitleSizeClass(columnLabels[column] ?? column)}`}
                          >
                            {columnLabels[column] ?? column}
                          </span>
                        </div>
                      )}
                      {editingColumn !== column && (
                        <div className="justify-self-end self-start shrink-0 flex items-center gap-0.5 opacity-0 transition-opacity group-hover/kanban-column-header:opacity-100">
                          <Badge variant="outline" className="h-4 min-w-4 px-1 text-[9px] leading-none">{(normalizedColumns[column] ?? []).length}</Badge>
                          {!TODO_DEFAULT_COLUMNS.includes(column) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-4 p-0"
                              onClick={() => onRemoveColumn(column)}
                              title="Smazat sloupec"
                            >
                              <X className="size-3" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-4 p-0"
                            onClick={() => {
                              setEditingColumn(column);
                              setEditingLabelDraft(columnLabels[column] ?? column);
                            }}
                            title="Upravit název sloupce"
                          >
                            <Edit2 className="size-3" />
                          </Button>
                          {column === lastActiveColumn && addableColumns.length > 0 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-4 p-0"
                              onClick={() => onAddColumn(addableColumns[0])}
                              title="Přidat další sloupec"
                            >
                              <Plus className="size-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <KanbanColumnContent value={column} className="p-2">
                      {(normalizedColumns[column] ?? []).map((task) => (
                        <KanbanItem key={task.id} value={task.id}>
                          <div
                            className="group relative rounded-lg border bg-background p-2 pl-8 cursor-pointer"
                            onClick={() => onTaskOpen(task)}
                          >
                            <KanbanItemHandle asChild>
                              <button
                                type="button"
                                className="absolute left-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground cursor-grab active:cursor-grabbing touch-none select-none"
                                onClick={(e) => e.stopPropagation()}
                                title="Chytit a přesunout"
                              >
                                <GripVertical className="size-3.5" />
                              </button>
                            </KanbanItemHandle>
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute right-2 top-2 size-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskDelete(task.id);
                              }}
                              title="Smazat úkol"
                            >
                              <Trash2 className="size-3.5 text-red-500" />
                            </Button>
                          </div>
                        </KanbanItem>
                      ))}
                    </KanbanColumnContent>
                  </div>
                </KanbanColumn>
              ))}
              </KanbanBoard>
            </div>
            <KanbanOverlay>
              <div className="rounded-md bg-muted/60 size-full" />
            </KanbanOverlay>
          </Kanban>
        )}
      </CardContent>
    </Card>
  );
}

function TimelineView({ tasks, onTaskOpen }: { tasks: PmTask[]; onTaskOpen: (task: PmTask) => void }) {
  const list = useMemo(
    () =>
      tasks
        .filter((task) => task.deadline)
        .sort((a, b) => (new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime())),
    [tasks],
  );

  const start = useMemo(() => {
    const now = startOfDay(new Date());
    const minDeadline = list.length > 0 ? startOfDay(new Date(list[0].deadline as string)) : now;
    return minDeadline < now ? minDeadline : now;
  }, [list]);

  const end = useMemo(() => {
    if (list.length === 0) return addDays(start, 30);
    const max = startOfDay(new Date(list[list.length - 1].deadline as string));
    const padded = addDays(max, 7);
    return padded > addDays(start, 30) ? padded : addDays(start, 30);
  }, [list, start]);

  const span = Math.max(1, diffDays(start, end));

  if (list.length === 0) {
    return <p className="text-sm text-muted-foreground">Timeline vyžaduje úkoly s termínem.</p>;
  }

  return (
    <div className="space-y-2">
      {list.map((task) => {
        const due = startOfDay(new Date(task.deadline as string));
        const startOffset = Math.max(0, diffDays(start, addDays(due, -3)));
        const widthDays = 4;
        const leftPct = (startOffset / span) * 100;
        const widthPct = Math.max((widthDays / span) * 100, 3);
        return (
          <button
            key={task.id}
            type="button"
            onClick={() => onTaskOpen(task)}
            className="w-full rounded-lg border p-2 text-left hover:bg-muted/30"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium truncate">{task.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(task.deadline as string).toLocaleDateString('cs-CZ')}
              </span>
            </div>
            <div className="h-2 rounded bg-muted relative overflow-hidden">
              <span
                className="absolute top-0 h-full rounded bg-primary/80"
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CalendarTaskView({ tasks, onTaskOpen }: { tasks: PmTask[]; onTaskOpen: (task: PmTask) => void }) {
  const current = new Date();
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dueMap = useMemo(() => {
    const map = new Map<string, PmTask[]>();
    for (const task of tasks) {
      if (!task.deadline) continue;
      const key = new Date(task.deadline).toISOString().slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(task);
      map.set(key, arr);
    }
    return map;
  }, [tasks]);

  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    const d = new Date(year, month, -firstWeekday + i + 1);
    cells.push({ iso: d.toISOString().slice(0, 10), day: d.getDate(), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dt = new Date(year, month, d);
    cells.push({ iso: dt.toISOString().slice(0, 10), day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const d = new Date(year, month, daysInMonth + (cells.length % 7) + 1);
    cells.push({ iso: d.toISOString().slice(0, 10), day: d.getDate(), inMonth: false });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {current.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
      </p>
      <div className="grid grid-cols-7 gap-2">
        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((label) => (
          <div key={label} className="text-[11px] text-muted-foreground font-medium px-1">{label}</div>
        ))}
        {cells.map((cell) => {
          const tasksInDay = dueMap.get(cell.iso) ?? [];
          return (
            <div key={cell.iso} className={`rounded border p-1 min-h-20 ${cell.inMonth ? 'bg-background' : 'bg-muted/20'}`}>
              <p className={`text-[11px] ${cell.inMonth ? 'text-foreground' : 'text-muted-foreground'}`}>{cell.day}</p>
              <div className="space-y-1 mt-1">
                {tasksInDay.slice(0, 2).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onTaskOpen(task)}
                    className="block w-full truncate rounded bg-primary/10 text-primary text-[10px] px-1 py-0.5 text-left"
                  >
                    {task.title}
                  </button>
                ))}
                {tasksInDay.length > 2 && (
                  <p className="text-[10px] text-muted-foreground">+{tasksInDay.length - 2} další</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BulkBar({
  selectedCount,
  allVisibleSelected,
  onToggleAll,
  onStatus,
  onPriority,
  onDelete,
}: {
  selectedCount: number;
  allVisibleSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  onStatus: (status: PmTaskStatus) => void;
  onPriority: (priority: PmPriority) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-2 mb-4 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 pr-2 border-r">
        <Checkbox checked={allVisibleSelected} onCheckedChange={(v) => onToggleAll(Boolean(v))} />
        <span className="text-xs text-muted-foreground">Vybráno: {selectedCount}</span>
      </div>

      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={selectedCount === 0} onClick={() => onStatus('Aktivní')}>Aktivní</Button>
      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={selectedCount === 0} onClick={() => onStatus('Blokováno')}>Blokováno</Button>
      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={selectedCount === 0} onClick={() => onStatus('Hotovo')}>Hotovo</Button>
      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={selectedCount === 0} onClick={() => onPriority('high')}>Priorita Vysoká</Button>
      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={selectedCount === 0} onClick={() => onPriority('normal')}>Priorita Normální</Button>
      <Button size="sm" variant="destructive" className="h-7 text-xs ml-auto" disabled={selectedCount === 0} onClick={onDelete}>
        <Trash2 className="size-3.5" /> Smazat
      </Button>
    </div>
  );
}

function BoardTaskCard({
  task,
  selected,
  onSelect,
  onStatusChange,
  onOpenDetail,
}: {
  task: PmTask;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (status: PmTaskStatus) => void;
  onOpenDetail: (task: PmTask) => void;
}) {
  return (
    <div className="rounded-lg border bg-background p-2 cursor-pointer" onClick={() => onOpenDetail(task)}>
      <div className="flex items-start gap-2">
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelect(Boolean(v))}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{task.title}</p>
          <p className="text-xs text-muted-foreground truncate">{task.status} • {priorityLabel(task.priority)}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 flex-wrap">
        {TASK_BOARD_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(s);
            }}
            className={`text-[10px] px-1.5 py-0.5 rounded border ${task.status === s ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskCounter({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'done' | 'blocked' }) {
  const toneClass = tone === 'done' ? 'text-emerald-600' : tone === 'blocked' ? 'text-red-600' : 'text-foreground';
  return (
    <div className="rounded-lg border px-3 py-1.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
    >
      {label}
    </button>
  );
}

function AreaTasksCard({
  area,
  tasks,
  selectedTaskIds,
  onSelectTask,
  onAddTask,
  onTaskStatusChange,
  onTaskDelete,
  onTaskOpen,
}: {
  area: PmArea;
  tasks: PmTask[];
  selectedTaskIds: string[];
  onSelectTask: (taskId: string, checked: boolean) => void;
  onAddTask: (title: string) => void;
  onTaskStatusChange: (taskId: string, status: PmTaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskOpen: (task: PmTask) => void;
}) {
  const [newTask, setNewTask] = useState('');

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <CardTitle className="text-sm">{area.name}</CardTitle>
          <Badge variant="outline" className="text-xs">{tasks.length}</Badge>
          <div className="ml-auto flex items-center gap-2">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nový úkol..."
              className="h-7 w-44 rounded border px-2 text-xs bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTask.trim()) {
                  onAddTask(newTask.trim());
                  setNewTask('');
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                if (!newTask.trim()) return;
                onAddTask(newTask.trim());
                setNewTask('');
              }}
            >
              <Plus className="size-3.5" /> Přidat
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-1">
        {tasks.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">Žádné úkoly v této oblasti.</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="group relative rounded-lg border border-transparent hover:border-border">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <Checkbox checked={selectedTaskIds.includes(task.id)} onCheckedChange={(v) => onSelectTask(task.id, Boolean(v))} />
              </div>
              <div className="pl-8">
                <TaskRow
                  task={task}
                  onStatusChange={(taskId, status) => onTaskStatusChange(taskId, status as PmTaskStatus)}
                  onSelect={onTaskOpen}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-7 opacity-0 group-hover:opacity-100"
                onClick={() => onTaskDelete(task.id)}
              >
                <Trash2 className="size-3.5 text-red-500" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function AreasPanel({
  areas,
  onAddArea,
  onDeleteArea,
}: {
  areas: PmArea[];
  onAddArea: (name: string) => void;
  onDeleteArea: (areaId: string) => void;
}) {
  const [name, setName] = useState('');

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Název oblasti"
          className="h-8 rounded border px-2 text-sm bg-background flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              onAddArea(name.trim());
              setName('');
            }
          }}
        />
        <Button
          size="sm"
          onClick={() => {
            if (!name.trim()) return;
            onAddArea(name.trim());
            setName('');
          }}
        >
          <Plus className="size-3.5" /> Přidat oblast
        </Button>
      </div>

      {areas.map((area) => (
        <div key={area.id} className="rounded-lg border bg-card px-3 py-2 flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <span className="text-sm flex-1">{area.name}</span>
          <Badge variant="outline" className="text-xs">{(area.tasks as any[])?.length ?? 0} úkolů</Badge>
          <Button size="icon" variant="ghost" className="size-7" onClick={() => onDeleteArea(area.id)}>
            <X className="size-3.5 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function MilestonesPanel({ milestones }: { milestones: PmMilestone[] }) {
  return (
    <div className="space-y-3 max-w-2xl">
      {milestones.length === 0 && <p className="text-sm text-muted-foreground">Žádné milestones.</p>}

      {milestones.map((ms) => {
        const taskCount = ms.tasks?.length ?? 0;
        const doneCount = ms.tasks?.filter((t) => t.status === 'Hotovo' || t.status === 'Archiv').length ?? 0;
        const pct = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : ms.progress;

        return (
          <Card key={ms.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="size-4 text-primary" />
                <span className="text-sm font-medium">{ms.name}</span>
                <Badge variant="outline" className="text-xs">{ms.status}</Badge>
                {ms.dueDate && <span className="text-xs text-muted-foreground ml-auto">{new Date(ms.dueDate).toLocaleDateString('cs-CZ')}</span>}
              </div>
              <div className="flex items-center gap-2">
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function OverviewPanel({ project }: { project: PmProject }) {
  const fields = useMemo(
    () => [
      { label: 'Kategorie', value: project.category },
      { label: 'Monetizace', value: project.monetizationType },
      { label: 'Fáze', value: project.phase },
      { label: 'Hlavní cíl', value: project.mainGoal },
      { label: 'Týdenní budget', value: project.weeklyTimeBudget ? `${project.weeklyTimeBudget}h` : undefined },
      { label: 'Doména', value: project.domain },
      { label: 'Start', value: project.startDate ? new Date(project.startDate).toLocaleDateString('cs-CZ') : undefined },
      { label: 'Cílový termín', value: project.targetDate ? new Date(project.targetDate).toLocaleDateString('cs-CZ') : undefined },
    ],
    [project],
  );

  return (
    <Card className="max-w-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Základní informace</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <dl className="space-y-2">
          {fields.filter((f) => f.value).map((f) => (
            <div key={f.label} className="flex gap-3">
              <dt className="text-xs text-muted-foreground w-32 shrink-0">{f.label}</dt>
              <dd className="text-xs text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function NextStepCard({ project, onSave }: { project: PmProject; onSave: (nextStep: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(project.nextStep ?? '');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="size-4 text-primary" /> Next Step
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {editing ? (
          <div className="space-y-2">
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} className="h-24 text-sm" />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => { onSave(value); setEditing(false); }}>
                <Check className="size-3.5" /> Uložit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X className="size-3.5" /> Zrušit
              </Button>
            </div>
          </div>
        ) : (
          <div className="group flex items-start gap-2">
            <p className="text-sm flex-1 text-muted-foreground whitespace-pre-wrap">{project.nextStep || 'Není definován next step'}</p>
            <Button size="icon" variant="ghost" className="size-7 opacity-0 group-hover:opacity-100" onClick={() => setEditing(true)}>
              <Edit2 className="size-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function priorityLabel(priority?: string) {
  if (priority === 'critical') return 'Kritická';
  if (priority === 'high') return 'Vysoká';
  if (priority === 'low') return 'Nízká';
  return 'Normální';
}

function kanbanHeaderTone(status: PmTaskStatus): string {
  if (status === 'Backlog') return 'bg-slate-100 border-slate-200';
  if (status === 'Připraveno') return 'bg-blue-100 border-blue-200';
  if (status === 'Aktivní') return 'bg-amber-100 border-amber-200';
  if (status === 'Blokováno') return 'bg-rose-100 border-rose-200';
  if (status === 'Čeká') return 'bg-violet-100 border-violet-200';
  if (status === 'Hotovo') return 'bg-emerald-100 border-emerald-200';
  return 'bg-muted/40 border-border';
}

function isDomainLikeTitle(value: string): boolean {
  const v = value.trim();
  if (!v || v.includes(' ')) return false;
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v);
}

function parseDomainAreaName(name: string): { domain: string; section: string } | null {
  const raw = name.trim();
  if (!raw.startsWith(`${DOMAIN_AREA_PREFIX} `)) return null;
  const payload = raw.slice(`${DOMAIN_AREA_PREFIX} `.length);
  const [domainPart, ...rest] = payload.split(' / ');
  const domain = domainPart?.trim() ?? '';
  const section = rest.join(' / ').trim();
  if (!domain || !section) return null;
  return { domain, section };
}

function initTodoStyleBoard(
  tasks: PmTask[],
  filters?: { search?: string; status?: 'all' | PmTaskStatus; assignee?: string; areaId?: string },
  activeColumns: PmTaskStatus[] = TODO_DEFAULT_COLUMNS,
): Record<TodoStyleColumn, PmTask[]> {
  const query = (filters?.search ?? '').trim().toLowerCase();
  const statusFilter = filters?.status ?? 'all';
  const assigneeFilter = filters?.assignee ?? 'all';
  const areaFilter = filters?.areaId ?? 'all';
  const columns = activeColumns.reduce((acc, column) => {
    acc[column] = [];
    return acc;
  }, {} as Record<TodoStyleColumn, PmTask[]>);

  for (const task of tasks) {
    if (statusFilter !== 'all' && task.status !== statusFilter) continue;
    if (assigneeFilter !== 'all' && (task.assignedTo ?? '') !== assigneeFilter) continue;
    if (areaFilter !== 'all' && task.areaId !== areaFilter) continue;
    if (
      query &&
      !task.title.toLowerCase().includes(query) &&
      !(task.description ?? '').toLowerCase().includes(query)
    ) {
      continue;
    }
    const target = activeColumns.includes(task.status) ? task.status : activeColumns[0];
    if (!target) continue;
    columns[target].push(task);
  }

  return columns;
}

function ensureTodoColumns(
  columns: Record<TodoStyleColumn, PmTask[]>,
  activeColumns: PmTaskStatus[],
): Record<TodoStyleColumn, PmTask[]> {
  const next = { ...columns } as Record<TodoStyleColumn, PmTask[]>;
  for (const status of activeColumns) {
    if (!Array.isArray(next[status])) next[status] = [];
  }
  return next;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86400000);
}

function createTaskDetailForm(task?: PmTask | null): TaskDetailForm {
  if (!task) {
    return {
      title: '',
      description: '',
      status: 'Backlog',
      priority: 'normal',
      deadline: '',
      estimatedDuration: '',
      actualDuration: '',
      blockedReason: '',
      nextStep: '',
      definitionOfDone: '',
      tags: '',
    };
  }

  return {
    title: task.title ?? '',
    description: task.description ?? '',
    status: task.status ?? 'Backlog',
    priority: task.priority ?? 'normal',
    deadline: toDateInput(task.deadline),
    estimatedDuration: task.estimatedDuration ? String(task.estimatedDuration) : '',
    actualDuration: task.actualDuration ? String(task.actualDuration) : '',
    blockedReason: task.blockedReason ?? '',
    nextStep: task.nextStep ?? '',
    definitionOfDone: task.definitionOfDone ?? '',
    tags: task.tags ?? '',
  };
}

function buildTaskDetailPayload(form: TaskDetailForm, fallbackTitle: string): Record<string, unknown> {
  return {
    title: form.title.trim() || fallbackTitle,
    status: form.status,
    priority: form.priority,
    description: form.description.trim(),
    blockedReason: form.blockedReason.trim(),
    nextStep: form.nextStep.trim(),
    definitionOfDone: form.definitionOfDone.trim(),
    tags: form.tags.trim(),
    ...buildOptional('deadline', toIsoDeadline(form.deadline)),
    ...buildOptional('estimatedDuration', parseMinutesInput(form.estimatedDuration)),
    ...buildOptional('actualDuration', parseMinutesInput(form.actualDuration)),
  };
}

function toDateInput(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function toIsoDeadline(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function parseMinutesInput(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return Math.round(num);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildOptional<T>(key: string, value: T | undefined): Record<string, T> | Record<string, never> {
  if (value === undefined) return {};
  return { [key]: value } as Record<string, T>;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function extractTaskMeta(value: unknown): PmTaskMeta {
  if (!Array.isArray(value)) return { dependencyIds: [] };
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (row.id !== TASK_META_COMMENT_ID || typeof row.text !== 'string') continue;
    if (!row.text.startsWith(TASK_META_PREFIX)) continue;
    const payload = safeParseJson<{ dependencyIds?: unknown }>(row.text.slice(TASK_META_PREFIX.length));
    if (!payload || !Array.isArray(payload.dependencyIds)) return { dependencyIds: [] };
    const dependencyIds = payload.dependencyIds.filter((id): id is string => typeof id === 'string');
    return { dependencyIds };
  }
  return { dependencyIds: [] };
}

function composeCommentsWithMeta(comments: TaskComment[], meta: PmTaskMeta): Array<{ id: string; text: string; createdAt: string }> {
  const visible = comments
    .filter((item) => item.id !== TASK_META_COMMENT_ID && !item.text.startsWith(TASK_META_PREFIX))
    .map((item) => ({ id: item.id, text: item.text, createdAt: item.createdAt }));
  if (meta.dependencyIds.length === 0) return visible;
  return [
    ...visible,
    {
      id: TASK_META_COMMENT_ID,
      text: `${TASK_META_PREFIX}${JSON.stringify({ dependencyIds: meta.dependencyIds })}`,
      createdAt: new Date().toISOString(),
    },
  ];
}

function applyAutomationRules(
  currentTask: PmTask | null,
  data: Record<string, unknown>,
  cfg: PmAutomationConfig,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };
  const nextStatus = typeof out.status === 'string' ? out.status : undefined;

  if (nextStatus === 'Hotovo' && cfg.autoSetActualOnDone) {
    const actual = Number(out.actualDuration ?? currentTask?.actualDuration ?? 0);
    if (!Number.isFinite(actual) || actual <= 0) {
      const estimated = Number(out.estimatedDuration ?? currentTask?.estimatedDuration ?? 0);
      if (Number.isFinite(estimated) && estimated > 0) out.actualDuration = Math.round(estimated);
    }
  }

  if (nextStatus === 'Blokováno' && cfg.autoPriorityOnBlocked) {
    out.priority = 'high';
  }

  if (nextStatus === 'Aktivní' && cfg.autoAssignOnActive) {
    if (cfg.defaultAssignee.trim().length > 0) {
      const assigned = `${out.assignedTo ?? currentTask?.assignedTo ?? ''}`.trim();
      if (!assigned) out.assignedTo = cfg.defaultAssignee.trim();
    }
    if (cfg.defaultTag.trim().length > 0) {
      const existing = `${out.tags ?? currentTask?.tags ?? ''}`
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      if (!existing.includes(cfg.defaultTag.trim())) existing.push(cfg.defaultTag.trim());
      out.tags = existing.join(', ');
    }
  }

  return out;
}

function buildWebsiteStructureSubtasks(): TaskSubtask[] {
  const now = new Date().toISOString();
  const createParent = (title: string): TaskSubtask => ({
    id: crypto.randomUUID(),
    title,
    done: false,
    createdAt: now,
    parentId: null,
  });
  const createChild = (parentId: string, title: string): TaskSubtask => ({
    id: crypto.randomUUID(),
    title,
    done: false,
    createdAt: now,
    parentId,
  });

  const mainPages = createParent('[SEKCE] Hlavní stránky');
  const funnel = createParent('[SEKCE] Funnel');

  return [
    mainPages,
    createChild(mainPages.id, 'Homepage'),
    createChild(mainPages.id, 'Homepage - O nás'),
    createChild(mainPages.id, 'Homepage - Kontakt'),
    createChild(mainPages.id, 'Homepage - Help / FAQ'),
    createChild(mainPages.id, 'Homepage - Pricing'),
    createChild(mainPages.id, 'Homepage - Přihlášení'),
    createChild(mainPages.id, 'Homepage - Registrace'),
    createChild(mainPages.id, 'Homepage - Profil účtu'),
    createChild(mainPages.id, 'Homepage - Historie výsledků'),
    createChild(mainPages.id, 'Homepage - Předplatné a billing'),
    createChild(mainPages.id, 'Homepage - Blog / edukace'),
    createChild(mainPages.id, 'Homepage - Reviews / Testimonials'),
    createChild(mainPages.id, 'Homepage - Přehled typů testů'),
    createChild(mainPages.id, 'Homepage - Detail metodiky / validace testu'),
    createChild(mainPages.id, 'Homepage - Partnerský program'),
    createChild(mainPages.id, 'Homepage - Terms'),
    createChild(mainPages.id, 'Homepage - Privacy'),
    createChild(mainPages.id, 'Homepage - Cookies'),
    createChild(mainPages.id, 'Homepage - Refund / Cancellation'),
    funnel,
    createChild(funnel.id, 'Test landing'),
    createChild(funnel.id, 'Výsledek testu – teaser'),
    createChild(funnel.id, 'Checkout'),
    createChild(funnel.id, 'Stav platby success'),
    createChild(funnel.id, 'Stav platby cancel/fail'),
    createChild(funnel.id, 'Billing portal redirect'),
  ];
}

function cleanSubtaskTitleForDisplay(title: string): string {
  return title
    .replace(/\s*\(\/[^)]*\)\s*$/i, '')
    .trim();
}

function normalizeSubtasks(value: unknown): TaskSubtask[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.id !== 'string' || typeof row.title !== 'string') return null;
      return {
        id: row.id,
        title: row.title,
        done: Boolean(row.done),
        createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date().toISOString(),
        parentId: typeof row.parentId === 'string' ? row.parentId : null,
      };
    })
    .filter(Boolean) as TaskSubtask[];
}

function normalizeComments(value: unknown): TaskComment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.id !== 'string' || typeof row.text !== 'string') return null;
      if (row.id === TASK_META_COMMENT_ID || row.text.startsWith(TASK_META_PREFIX)) return null;
      return {
        id: row.id,
        text: row.text,
        createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date().toISOString(),
      };
    })
    .filter(Boolean) as TaskComment[];
}

function normalizeAttachments(value: unknown): TaskAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.id !== 'string' || typeof row.name !== 'string' || typeof row.url !== 'string') return null;
      return {
        id: row.id,
        name: row.name,
        size: typeof row.size === 'number' ? row.size : 0,
        type: typeof row.type === 'string' ? row.type : 'application/octet-stream',
        url: row.url,
        createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date().toISOString(),
      };
    })
    .filter(Boolean) as TaskAttachment[];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Nepodařilo se načíst soubor'));
    reader.readAsDataURL(file);
  });
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function initTaskBoard(tasks: PmTask[]): Record<string, PmTask[]> {
  const base = TASK_BOARD_STATUSES.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as Record<string, PmTask[]>);

  tasks.forEach((task) => {
    const key = TASK_BOARD_STATUSES.includes(task.status) ? task.status : 'Backlog';
    base[key].push(task);
  });

  return base;
}
