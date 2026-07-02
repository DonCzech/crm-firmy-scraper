import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Check,
  CheckCircle2,
  Database,
  Edit2,
  KanbanSquare,
  LayoutList,
  List,
  Plus,
  RefreshCw,
  Search,
  Timer,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Kanban,
  KanbanBoard,
  type KanbanMoveEvent,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { ProjectTableRow } from './components/project-table-row';
import { PmPriority, PmProject, PmProjectStatus } from './types';
import {
  pmCreateProject,
  pmDeleteProject,
  pmFetchProjects,
  pmSeed,
  pmUpdateProject,
} from '../../services/backend';

type ViewMode = 'board' | 'list' | 'table';

const STATUS_OPTIONS: PmProjectStatus[] = ['Backlog', 'Připraveno', 'Aktivní', 'Blokováno', 'Čeká', 'Hotovo'];
const PRIORITY_OPTIONS: PmPriority[] = ['critical', 'high', 'normal', 'low'];
const ALL_FILTER = 'all';

export function PmPortfolioPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [view, setView] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [priorityFilter, setPriorityFilter] = useState(ALL_FILTER);
  const [activeWaveFilter, setActiveWaveFilter] = useState(ALL_FILTER);
  const [boardColumns, setBoardColumns] = useState<Record<string, PmProject[]>>(() => initBoardColumns([]));
  const [createOpen, setCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('Obecné');
  const [newProjectPriority, setNewProjectPriority] = useState<PmPriority>('normal');
  const [newProjectStatus, setNewProjectStatus] = useState<PmProjectStatus>('Backlog');
  const [newProjectBudget, setNewProjectBudget] = useState('6');
  const [newProjectNextStep, setNewProjectNextStep] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pm-projects', search, statusFilter, priorityFilter, activeWaveFilter],
    queryFn: () => pmFetchProjects({
      search: search || undefined,
      status: statusFilter === ALL_FILTER ? undefined : statusFilter,
      priority: priorityFilter === ALL_FILTER ? undefined : priorityFilter,
      activeWave: activeWaveFilter === 'true' ? true : activeWaveFilter === 'false' ? false : undefined,
    }),
  });

  const projects = (data as PmProject[] | undefined) ?? [];

  useEffect(() => {
    if (!data) return;
    setBoardColumns(initBoardColumns(projects));
  }, [data]);

  const seedMutation = useMutation({
    mutationFn: pmSeed,
    onSuccess: data => {
      toast.success(`Seed hotov: ${data.projectCount} projektů, ${data.taskCount} úkolů`);
      qc.invalidateQueries({ queryKey: ['pm-projects'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('(401)')) {
        toast.error('Seed selhal: nejsi přihlášený. Přihlas se znovu.');
        return;
      }
      toast.error(message ? `Seed selhal: ${message}` : 'Seed selhal');
    },
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const trimmedName = newProjectName.trim();
      if (!trimmedName) throw new Error('Název projektu je povinný.');

      return pmCreateProject({
        name: trimmedName,
        category: newProjectCategory.trim() || 'Obecné',
        priority: newProjectPriority,
        status: newProjectStatus,
        weeklyTimeBudget: Math.max(1, Number(newProjectBudget) || 1),
        nextStep: newProjectNextStep.trim() || undefined,
      });
    },
    onSuccess: async (created: { id?: string; name?: string }) => {
      toast.success(`Projekt "${created?.name ?? newProjectName.trim()}" vytvořen`);
      setCreateOpen(false);
      setNewProjectName('');
      setNewProjectCategory('Obecné');
      setNewProjectPriority('normal');
      setNewProjectStatus('Backlog');
      setNewProjectBudget('6');
      setNewProjectNextStep('');
      await qc.invalidateQueries({ queryKey: ['pm-projects'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Vytvoření projektu selhalo.';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pmDeleteProject(id),
    onSuccess: () => {
      toast.success('Projekt smazán');
      qc.invalidateQueries({ queryKey: ['pm-projects'] });
    },
    onError: () => toast.error('Smazání selhalo'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PmProjectStatus }) => pmUpdateProject(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pm-projects'] });
    },
    onError: async (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Uložení statusu selhalo.';
      toast.error(message);
      await qc.invalidateQueries({ queryKey: ['pm-projects'] });
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => pmUpdateProject(id, { name }),
    onSuccess: () => {
      toast.success('Název projektu uložen');
      qc.invalidateQueries({ queryKey: ['pm-projects'] });
    },
    onError: () => toast.error('Uložení názvu projektu selhalo'),
  });

  const activeCount = projects.filter((p) => p.status === 'Aktivní').length;
  const waveCount = projects.filter((p) => p.activeWave).length;
  const doneCount = projects.filter((p) => p.status === 'Hotovo').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.weeklyTimeBudget ?? 0), 0);
  const iqboostProject = projects.find((p) => {
    const haystack = `${p.name} ${p.slug ?? ''} ${p.domain ?? ''}`.toLowerCase();
    return haystack.includes('iqboost');
  });

  const handleBoardMove = ({ event, activeContainer, overContainer }: KanbanMoveEvent) => {
    if (activeContainer === overContainer) return;

    const projectId = String(event.active.id);
    const targetStatus = overContainer as PmProjectStatus;
    if (!STATUS_OPTIONS.includes(targetStatus)) return;

    let movedProject: PmProject | null = null;
    setBoardColumns((prev) => {
      const from = prev[activeContainer] ?? [];
      const to = prev[overContainer] ?? [];
      const index = from.findIndex((p) => p.id === projectId);
      if (index === -1) return prev;

      movedProject = from[index];
      const nextProject = { ...movedProject, status: targetStatus };

      return {
        ...prev,
        [activeContainer]: [...from.slice(0, index), ...from.slice(index + 1)],
        [overContainer]: [nextProject, ...to],
      };
    });

    updateStatusMutation.mutate({ id: projectId, status: targetStatus });
  };

  return (
    <>
      <ContentHeader className="gap-2 flex-wrap">
        <h1 className="inline-flex items-center gap-2 text-sm font-semibold min-w-0">
          <Database className="size-4 text-primary" /> Projekty
        </h1>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto sm:ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
          >
            <RefreshCw className={seedMutation.isPending ? 'animate-spin size-3.5' : 'size-3.5'} />
            Init seed
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" /> Nový projekt
          </Button>
          {iqboostProject && (
            <Button size="sm" onClick={() => navigate(`/core/crm/pm/project/${iqboostProject.id}`)}>
              Otevřít IQboost
            </Button>
          )}
        </div>
      </ContentHeader>

      <Content className="px-3 sm:px-5 pb-6">
        <section className="space-y-4 w-full">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px] w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Hledat v projektech, next step, popisu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full sm:w-40 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>Všechny stavy</SelectItem>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-full sm:w-40 text-sm">
                  <SelectValue placeholder="Priorita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>Všechny priority</SelectItem>
                  {PRIORITY_OPTIONS.map((p) => <SelectItem key={p} value={p}>{priorityLabel(p)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={activeWaveFilter} onValueChange={setActiveWaveFilter}>
                <SelectTrigger className="h-9 w-full sm:w-36 text-sm">
                  <SelectValue placeholder="Vlna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>Vše</SelectItem>
                  <SelectItem value="true">Active wave</SelectItem>
                  <SelectItem value="false">Mimo vlnu</SelectItem>
                </SelectContent>
              </Select>
              <div className="inline-flex items-center rounded-lg border p-1 gap-1 w-full sm:w-auto justify-end">
                <Button type="button" size="sm" variant={view === 'board' ? 'secondary' : 'ghost'} onClick={() => setView('board')}>
                  <KanbanSquare className="size-4" />
                </Button>
                <Button type="button" size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')}>
                  <LayoutList className="size-4" />
                </Button>
                <Button type="button" size="sm" variant={view === 'table' ? 'secondary' : 'ghost'} onClick={() => setView('table')}>
                  <List className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatBox icon={<BarChart3 className="size-4 text-blue-600" />} label="Celkem" value={projects.length} />
              <StatBox icon={<Zap className="size-4 text-emerald-600" />} label="Aktivní vlna" value={waveCount} />
              <StatBox icon={<CheckCircle2 className="size-4 text-violet-600" />} label="Hotovo" value={doneCount} />
              <StatBox icon={<Timer className="size-4 text-amber-600" />} label="Budget / týden" value={`${totalBudget}h`} />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card gap-3">
                <Database className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Žádné projekty nenalezeny.</p>
                <Button size="sm" variant="outline" onClick={() => seedMutation.mutate()}>
                  Inicializovat seed data (15 projektů)
                </Button>
              </div>
            ) : view === 'board' ? (
              <Kanban
                value={boardColumns}
                onValueChange={setBoardColumns}
                getItemValue={(item) => item.id}
                onMove={handleBoardMove}
              >
                <div className="overflow-x-auto pb-1 md:overflow-visible">
                  <KanbanBoard className="grid auto-rows-fr gap-4 grid-flow-col auto-cols-[minmax(80vw,1fr)] md:grid-flow-row md:grid-cols-2 2xl:grid-cols-3 md:auto-cols-auto">
                    {STATUS_OPTIONS.map((status) => (
                      <StatusColumn
                        key={status}
                        status={status}
                        projects={boardColumns[status] ?? []}
                        activeCount={activeCount}
                      />
                    ))}
                  </KanbanBoard>
                </div>
                <KanbanOverlay>
                  <div className="rounded-md bg-muted/60 size-full" />
                </KanbanOverlay>
              </Kanban>
            ) : view === 'list' ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <FreeloRow
                    key={project.id}
                    project={project}
                    onDelete={deleteMutation.mutate}
                    onRename={(id, name) => renameMutation.mutate({ id, name })}
                  />
                ))}
              </div>
            ) : (
              <ProjectTable
                projects={projects}
                onDelete={deleteMutation.mutate}
                onRename={(id, name) => renameMutation.mutate({ id, name })}
              />
            )}
        </section>
      </Content>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nový projekt</DialogTitle>
            <DialogDescription>Vytvoření projektu pro PM modul.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createMutation.mutate();
            }}
          >
            <Input
              placeholder="Název projektu"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
            />
            <Input
              placeholder="Kategorie"
              value={newProjectCategory}
              onChange={(e) => setNewProjectCategory(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={newProjectPriority} onValueChange={(v) => setNewProjectPriority(v as PmPriority)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Priorita" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => <SelectItem key={p} value={p}>{priorityLabel(p)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newProjectStatus} onValueChange={(v) => setNewProjectStatus(v as PmProjectStatus)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={80}
                placeholder="Budget h/týden"
                value={newProjectBudget}
                onChange={(e) => setNewProjectBudget(e.target.value)}
              />
            </div>
            <Input
              placeholder="Next step (volitelné)"
              value={newProjectNextStep}
              onChange={(e) => setNewProjectNextStep(e.target.value)}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Vytvářím...' : 'Vytvořit projekt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatusColumn({ status, projects, activeCount }: { status: PmProjectStatus; projects: PmProject[]; activeCount: number }) {
  return (
    <div className="rounded-xl border bg-card min-h-[320px]">
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{status}</p>
        <Badge variant="outline" className="text-xs">{projects.length}</Badge>
      </div>
      <div className="p-2 space-y-2">
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">Žádné projekty</div>
        ) : (
          projects.map((project) => (
            <BoardProjectCard
              key={project.id}
              project={project}
              activeCount={activeCount}
              onRename={(id, name) => renameMutation.mutate({ id, name })}
            />
          ))
        )}
      </div>
    </div>
  );
}

function BoardProjectCard({
  project,
  activeCount,
  onRename,
}: {
  project: PmProject;
  activeCount: number;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);

  useEffect(() => {
    if (editing) return;
    setDraft(project.name);
  }, [project.name, editing]);

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start gap-2">
        {project.color ? (
          <span className="mt-1 size-2 rounded-full" style={{ backgroundColor: project.color }} />
        ) : (
          <span className="mt-1 size-2 rounded-full bg-muted-foreground/40" />
        )}
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && draft.trim()) {
                    onRename(project.id, draft.trim());
                    setEditing(false);
                  }
                  if (e.key === 'Escape') {
                    setDraft(project.name);
                    setEditing(false);
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => {
                  if (!draft.trim()) return;
                  onRename(project.id, draft.trim());
                  setEditing(false);
                }}
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => {
                  setDraft(project.name);
                  setEditing(false);
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link to={`/core/crm/pm/project/${project.id}`} className="text-sm font-medium truncate block hover:text-primary">
                {project.name}
              </Link>
              <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(true)}>
                <Edit2 className="size-3.5" />
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground line-clamp-2">{project.nextStep || 'Bez definovaného next step'}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{priorityLabel(project.priority)}</span>
        <span>{project.weeklyHours?.actual ?? 0}h / {project.weeklyTimeBudget}h</span>
      </div>
      {project.activeWave && (
        <div className="mt-2 text-[11px] text-emerald-700">Active wave • {activeCount} aktivních projektů</div>
      )}
    </div>
  );
}

function FreeloRow({
  project,
  onDelete,
  onRename,
}: {
  project: PmProject;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);

  useEffect(() => {
    if (editing) return;
    setDraft(project.name);
  }, [project.name, editing]);

  return (
    <div className="rounded-xl border bg-card p-3 flex flex-wrap items-start gap-2 sm:gap-3">
      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: project.color || '#cbd5e1' }} />
      <div className="min-w-0 flex-1 w-full sm:w-auto">
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draft.trim()) {
                  onRename(project.id, draft.trim());
                  setEditing(false);
                }
                if (e.key === 'Escape') {
                  setDraft(project.name);
                  setEditing(false);
                }
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={() => {
                if (!draft.trim()) return;
                onRename(project.id, draft.trim());
                setEditing(false);
              }}
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={() => {
                setDraft(project.name);
                setEditing(false);
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Link to={`/core/crm/pm/project/${project.id}`} className="text-sm font-medium truncate block hover:text-primary">
              {project.name}
            </Link>
            <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(true)}>
              <Edit2 className="size-3.5" />
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground truncate">{project.nextStep || 'Bez next step'}</p>
      </div>
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto sm:ml-auto">
        <Badge variant="outline" className="text-xs">{project.status}</Badge>
        <Badge variant="outline" className="text-xs">{priorityLabel(project.priority)}</Badge>
        <span className="text-xs text-muted-foreground">{project._count?.tasks ?? 0} úkolů</span>
        <span className="text-xs text-muted-foreground">{project.weeklyHours?.actual ?? 0}h/{project.weeklyTimeBudget}h</span>
        <Button size="sm" variant="ghost" onClick={() => onDelete(project.id)}>Smazat</Button>
      </div>
    </div>
  );
}

function ProjectTable({
  projects,
  onDelete,
  onRename,
}: {
  projects: PmProject[];
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  return (
    <div className="border rounded-xl overflow-x-auto bg-card">
      <table className="w-full min-w-[740px] text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left py-2 px-4 font-medium text-muted-foreground text-xs">Projekt</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Status</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Priorita</th>
            <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Další krok</th>
            <th className="text-right py-2 px-3 font-medium text-muted-foreground text-xs">Týden</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <ProjectTableRow key={p.id} project={p} odd={i % 2 === 0} onDelete={onDelete} onRename={onRename} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function priorityLabel(priority?: string) {
  if (priority === 'critical') return 'Kritická';
  if (priority === 'high') return 'Vysoká';
  if (priority === 'low') return 'Nízká';
  return 'Normální';
}

function initBoardColumns(projects: PmProject[]): Record<string, PmProject[]> {
  const base = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as Record<string, PmProject[]>);

  projects.forEach((project) => {
    const key = STATUS_OPTIONS.includes(project.status as PmProjectStatus) ? project.status : 'Backlog';
    base[key].push(project);
  });

  return base;
}
