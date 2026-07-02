import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Eye, EyeOff, Pencil, Plus, RotateCcw, Share2, SlidersHorizontal, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardTable } from '../tables/recent-orders';
import { BestSeller } from './components/best-sellers';
import {
  CrmDealsOverviewWidget,
  CrmLeadAnalyticsWidget,
  CrmLeadsKpiWidget,
  CrmPipelineKpiWidget,
  CrmRecentDealsWidget,
  CrmRevenueKpiWidget,
  CrmTasksKpiWidget,
} from './components/crm-widgets';
import { Inventory } from './components/inventory';
import { Orders } from './components/orders';
import { ProductStock } from './components/product-stock';
import {
  ProjectsGlobalKpiWidget,
  ProjectsHeaderWidget,
  ProjectsPerProjectGridWidget,
} from './components/projects-tab-widgets';
import { SalesActivity } from './components/sales-activity';
import {
  fetchDatabaseConnectionsHealth,
  type BackendSharedDashboard,
  type DatabaseConnectionsHealthResponse,
  createSharedDashboard,
  deleteSharedDashboard,
  exportSharedDashboards,
  fetchMe,
  fetchSharedDashboards,
  importSharedDashboards,
  updateSharedDashboard,
} from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_ACTIVE_BOARD_KEY,
  fetchCurrentWeatherByCity,
  getWeatherCityStorageKey,
  writeHeaderWeatherSnapshot,
} from '@/store-inventory/weather/shared-weather';

type BoardId = string;

type WidgetDef = {
  id: string;
  title: string;
  colSpanClass?: string;
  render: (boardId: BoardId) => JSX.Element;
};

type LayoutState = Record<BoardId, { order: string[]; hidden: string[]; deleted?: string[] }>;

type DashboardBoard = {
  id: BoardId;
  label: string;
  system: boolean;
  ownerUserId?: string;
  isOwner?: boolean;
  sharedUserIds?: string[];
  sharedRoles?: string[];
};

const STORAGE_KEY_SYSTEM_LAYOUT = 'core_dashboard_system_layout_v2';
const IMPORT_INPUT_ID = 'dashboard-import-json';

const SYSTEM_BOARDS: DashboardBoard[] = [
  { id: 'inventory', label: 'Inventory', system: true },
  { id: 'products', label: 'Produkty', system: true },
  { id: 'crm', label: 'CRM', system: true },
  { id: 'projects', label: 'Projekty', system: true },
];

const DEFAULT_WIDGETS: Record<string, string[]> = {
  inventory: ['orders', 'inventory', 'best-seller', 'sales-activity', 'product-stock', 'recent-orders'],
  products: ['best-seller', 'product-stock', 'recent-orders'],
  crm: ['crm-kpi-leads', 'crm-kpi-pipeline', 'crm-kpi-revenue', 'crm-kpi-tasks', 'db-health-widget', 'crm-deals-overview', 'crm-lead-analytics', 'crm-recent-deals'],
  projects: ['projects-header', 'projects-kpi', 'projects-grid'],
};

function NotesWidget({ boardId }: { boardId: string }) {
  const key = `core_dashboard_notes_${boardId}`;
  const [value, setValue] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setValue(window.localStorage.getItem(key) || '');
  }, [key]);

  const onChange = (next: string) => {
    setValue(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(key, next);
  };

  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Poznámkový blok</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pište poznámky..."
          className="w-full min-h-[180px] resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
      </CardContent>
    </Card>
  );
}

function DrawingWidget({ boardId }: { boardId: string }) {
  const key = `core_dashboard_drawing_${boardId}`;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(key);
    if (!saved) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = saved;
  }, [key]);

  const getPos = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const save = () => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    window.localStorage.setItem(key, canvas.toDataURL('image/png'));
  };

  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Kreslení</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (typeof window !== 'undefined') window.localStorage.removeItem(key);
            }}
          >
            Vymazat
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={640}
          height={260}
          className="w-full rounded-md border bg-white"
          onMouseDown={(event) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const pos = getPos(event);
            drawingRef.current = true;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
          }}
          onMouseMove={(event) => {
            if (!drawingRef.current) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const pos = getPos(event);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
          }}
          onMouseUp={() => {
            drawingRef.current = false;
            save();
          }}
          onMouseLeave={() => {
            if (drawingRef.current) save();
            drawingRef.current = false;
          }}
        />
      </CardContent>
    </Card>
  );
}

function WeatherWidget({ boardId }: { boardId: string }) {
  const key = getWeatherCityStorageKey(boardId);
  const [city, setCity] = useState('Praha');
  const [label, setLabel] = useState('—');
  const [temp, setTemp] = useState<number | null>(null);
  const [wind, setWind] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (targetCity: string) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchCurrentWeatherByCity(targetCity);
      setTemp(weather.temp);
      setWind(weather.wind);
      setLabel(weather.label);
      if (typeof window !== 'undefined') window.localStorage.setItem(key, targetCity);
      writeHeaderWeatherSnapshot(weather);
      window.dispatchEvent(new CustomEvent('coreWeatherUpdated', { detail: weather }));
    } catch {
      setError('Nepodařilo se načíst počasí.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(key) || 'Praha';
    setCity(saved);
    void load(saved);
  }, [key]);

  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Počasí</CardTitle>
          <Button variant="outline" size="sm" onClick={() => void load(city)} disabled={loading}>
            Obnovit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            value={city}
            onChange={(e) => {
              const nextCity = e.target.value;
              setCity(nextCity);
              window.dispatchEvent(new CustomEvent('coreWeatherCityChanged', { detail: { city: nextCity } }));
            }}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            placeholder="Město"
          />
          <Button size="sm" onClick={() => void load(city)} disabled={loading}>
            Načíst
          </Button>
        </div>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-md border p-2">
              <p className="text-xs text-muted-foreground">Stav</p>
              <p className="font-medium">{label}</p>
            </div>
            <div className="rounded-md border p-2">
              <p className="text-xs text-muted-foreground">Teplota</p>
              <p className="font-medium">{temp == null ? '—' : `${temp} °C`}</p>
            </div>
            <div className="rounded-md border p-2">
              <p className="text-xs text-muted-foreground">Vítr</p>
              <p className="font-medium">{wind == null ? '—' : `${wind} km/h`}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClockWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Hodiny</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">{now.toLocaleDateString('cs-CZ')}</p>
          <p className="text-2xl font-semibold">{now.toLocaleTimeString('cs-CZ')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DatabaseHealthWidget() {
  const [data, setData] = useState<DatabaseConnectionsHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const payload = await fetchDatabaseConnectionsHealth();
      setData(payload);
    } catch (error) {
      logFrontendError(error, { scope: 'dashboard:db-health' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => {
      void load(true);
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const failed = (data?.items || []).filter((item) => item.status !== 'ok');
  const summary = data ? `${data.okCount}/${data.total} OK` : '—';

  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Kontrola databází</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Stav</p>
          <p className="text-xl font-semibold">{loading && !data ? 'Načítám…' : summary}</p>
        </div>
        {failed.length > 0 ? (
          <div className="space-y-1">
            {failed.slice(0, 3).map((item) => (
              <p key={item.key} className="text-xs text-red-600">
                {item.project}: {item.error || 'Nedostupná'}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-700">Všechny databáze jsou dostupné.</p>
        )}
        <p className="text-xs text-muted-foreground">
          {data?.checkedAt ? `Kontrola: ${new Date(data.checkedAt).toLocaleTimeString('cs-CZ')}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}

const WIDGETS: Record<string, WidgetDef> = {
  orders: { id: 'orders', title: 'Objednávky', render: () => <Orders /> },
  inventory: { id: 'inventory', title: 'Sklad', render: () => <Inventory /> },
  'best-seller': { id: 'best-seller', title: 'Nejprodávanější', render: () => <BestSeller /> },
  'sales-activity': { id: 'sales-activity', title: 'Prodejní aktivita', render: () => <SalesActivity /> },
  'product-stock': { id: 'product-stock', title: 'Stav zásob', colSpanClass: 'lg:col-span-2', render: () => <ProductStock /> },
  'recent-orders': { id: 'recent-orders', title: 'Poslední objednávky', colSpanClass: 'lg:col-span-3', render: () => <DashboardTable /> },
  'crm-kpi-leads': { id: 'crm-kpi-leads', title: 'CRM - Leady', render: () => <CrmLeadsKpiWidget /> },
  'crm-kpi-pipeline': { id: 'crm-kpi-pipeline', title: 'CRM - Pipeline', render: () => <CrmPipelineKpiWidget /> },
  'crm-kpi-revenue': { id: 'crm-kpi-revenue', title: 'CRM - Výnos', render: () => <CrmRevenueKpiWidget /> },
  'crm-kpi-tasks': { id: 'crm-kpi-tasks', title: 'CRM - Úkoly', render: () => <CrmTasksKpiWidget /> },
  'db-health-widget': { id: 'db-health-widget', title: 'Kontrola databází', render: () => <DatabaseHealthWidget /> },
  'crm-deals-overview': { id: 'crm-deals-overview', title: 'CRM - Přehled obchodů', colSpanClass: 'lg:col-span-3', render: () => <CrmDealsOverviewWidget /> },
  'crm-lead-analytics': { id: 'crm-lead-analytics', title: 'CRM - Analytika leadů', render: () => <CrmLeadAnalyticsWidget /> },
  'crm-recent-deals': { id: 'crm-recent-deals', title: 'CRM - Poslední obchody', colSpanClass: 'lg:col-span-4', render: () => <CrmRecentDealsWidget /> },
  'projects-header': { id: 'projects-header', title: 'Projekty - Hlavička', colSpanClass: 'lg:col-span-3', render: () => <ProjectsHeaderWidget /> },
  'projects-kpi': { id: 'projects-kpi', title: 'Projekty - KPI', colSpanClass: 'lg:col-span-3', render: () => <ProjectsGlobalKpiWidget /> },
  'projects-grid': { id: 'projects-grid', title: 'Projekty - Přehled', colSpanClass: 'lg:col-span-3', render: () => <ProjectsPerProjectGridWidget /> },
  'notes-board': { id: 'notes-board', title: 'Poznámkový blok', colSpanClass: 'lg:col-span-2', render: (boardId) => <NotesWidget boardId={boardId} /> },
  'drawing-board': { id: 'drawing-board', title: 'Kreslení', colSpanClass: 'lg:col-span-2', render: (boardId) => <DrawingWidget boardId={boardId} /> },
  'weather-widget': { id: 'weather-widget', title: 'Počasí', render: (boardId) => <WeatherWidget boardId={boardId} /> },
  'clock-widget': { id: 'clock-widget', title: 'Hodiny', render: () => <ClockWidget /> },
};

function getBoardGridClass(boardId: string) {
  return boardId === 'crm' ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
}

function normalizeSystemLayout(input: LayoutState): LayoutState {
  const allIds = Object.keys(WIDGETS);
  const next: LayoutState = {};
  for (const board of SYSTEM_BOARDS) {
    const defaults = DEFAULT_WIDGETS[board.id] || [];
    const hasSavedData = input?.[board.id] !== undefined;
    const order = (input?.[board.id]?.order || []).filter((id) => allIds.includes(id));
    const hidden = (input?.[board.id]?.hidden || []).filter((id) => allIds.includes(id));
    const deleted = (input?.[board.id]?.deleted || []).filter((id) => allIds.includes(id));
    // Only add default widgets on first visit (no saved data). If user has saved state, trust it completely.
    const missing = hasSavedData ? [] : defaults.filter((id) => !order.includes(id));
    next[board.id] = { order: [...order, ...missing], hidden, deleted };
  }
  return next;
}

export function Dashboard() {
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [sharedBoards, setSharedBoards] = useState<BackendSharedDashboard[]>([]);
  const [activeBoard, setActiveBoard] = useState<BoardId>('crm');
  const [showManager, setShowManager] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ id: string; side: 'top' | 'bottom' | 'left' | 'right' } | null>(null);
  const [layout, setLayout] = useState<LayoutState>(() => {
    if (typeof window === 'undefined') return normalizeSystemLayout({} as LayoutState);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SYSTEM_LAYOUT);
      if (!raw) return normalizeSystemLayout({} as LayoutState);
      return normalizeSystemLayout(JSON.parse(raw) as LayoutState);
    } catch {
      return normalizeSystemLayout({} as LayoutState);
    }
  });
  const [shareUserIdsInput, setShareUserIdsInput] = useState('');
  const [shareRoles, setShareRoles] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DASHBOARD_ACTIVE_BOARD_KEY, activeBoard);
    const city = window.localStorage.getItem(getWeatherCityStorageKey(activeBoard)) || 'Praha';
    window.dispatchEvent(new CustomEvent('coreWeatherCityChanged', { detail: { city } }));
  }, [activeBoard]);

  const boards = useMemo<DashboardBoard[]>(() => {
    const custom: DashboardBoard[] = sharedBoards.map((board) => ({
      id: board.id,
      label: board.name,
      system: false,
      ownerUserId: board.ownerUserId,
      isOwner: board.isOwner,
      sharedUserIds: board.sharedUserIds,
      sharedRoles: board.sharedRoles,
    }));
    return [...SYSTEM_BOARDS, ...custom];
  }, [sharedBoards]);

  const activeBoardMeta = boards.find((b) => b.id === activeBoard);
  const isActiveBoardEditable = Boolean(
    activeBoardMeta && (!activeBoardMeta.system && (activeBoardMeta.isOwner || currentUserRole.toLowerCase() === 'admin')),
  );

  const loadSharedBoards = async () => {
    try {
      const response = await fetchSharedDashboards();
      setSharedBoards(response.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nepodařilo se načíst nástěnky.';
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchMe()
      .then((me) => {
        setCurrentUserId(me.id || '');
        setCurrentUserRole(me.role || '');
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-page',
          message: error instanceof Error ? error.message : 'Failed to resolve current user for dashboard',
          meta: { operation: 'fetch_me_dashboard_page' },
        });
        setCurrentUserId('');
        setCurrentUserRole('');
      });
    void loadSharedBoards();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const systemOnly: LayoutState = {};
    for (const board of SYSTEM_BOARDS) {
      systemOnly[board.id] = layout[board.id] || { order: [], hidden: [] };
    }
    window.localStorage.setItem(STORAGE_KEY_SYSTEM_LAYOUT, JSON.stringify(systemOnly));
  }, [layout]);

  useEffect(() => {
    if (boards.some((b) => b.id === activeBoard)) return;
    setActiveBoard('crm');
  }, [activeBoard, boards]);

  useEffect(() => {
    const board = sharedBoards.find((b) => b.id === activeBoard);
    if (!board) {
      const current = layout[activeBoard];
      const defaults = DEFAULT_WIDGETS[activeBoard] || [];
      if (!current) {
        setLayout((prev) => ({ ...prev, [activeBoard]: { order: [...defaults], hidden: [] } }));
      }
      return;
    }
    setLayout((prev) => ({
      ...prev,
      [board.id]: {
        order: board.widgetsOrder || [],
        hidden: board.widgetsHidden || [],
      },
    }));
    setShareUserIdsInput((board.sharedUserIds || []).join(', '));
    setShareRoles(board.sharedRoles || []);
  }, [activeBoard, sharedBoards]);

  const ensureBoardLayout = (boardId: string, prev: LayoutState): LayoutState => {
    if (prev[boardId]) return prev;
    const defaults = DEFAULT_WIDGETS[boardId] || [];
    return { ...prev, [boardId]: { order: [...defaults], hidden: [] } };
  };

  const persistBoardIfShared = async (boardId: string, nextState: { order: string[]; hidden: string[] }) => {
    const board = sharedBoards.find((item) => item.id === boardId);
    if (!board) return;
    if (!(board.isOwner || currentUserRole.toLowerCase() === 'admin')) return;
    try {
      await updateSharedDashboard(boardId, {
        widgetsOrder: nextState.order,
        widgetsHidden: nextState.hidden,
      });
    } catch {
      toast.error('Nepodařilo se uložit změnu nástěnky na server.');
    }
  };

  const orderedWidgets = useMemo(() => {
    const state = layout[activeBoard] || { order: [], hidden: [] };
    return state.order.map((id) => WIDGETS[id]).filter(Boolean);
  }, [activeBoard, layout]);

  const visibleWidgets = useMemo(() => {
    const hidden = new Set(layout[activeBoard]?.hidden || []);
    return orderedWidgets.filter((widget) => !hidden.has(widget.id));
  }, [activeBoard, layout, orderedWidgets]);

  const hiddenWidgets = useMemo(() => {
    const hidden = new Set(layout[activeBoard]?.hidden || []);
    return orderedWidgets.filter((widget) => hidden.has(widget.id));
  }, [activeBoard, layout, orderedWidgets]);

  const availableWidgets = useMemo(() => {
    const current = new Set(layout[activeBoard]?.order || []);
    return Object.values(WIDGETS).filter((widget) => !current.has(widget.id));
  }, [activeBoard, layout]);

  const setBoardState = (boardId: string, updater: (state: { order: string[]; hidden: string[]; deleted?: string[] }) => { order: string[]; hidden: string[]; deleted?: string[] }) => {
    setLayout((prev) => {
      const next = ensureBoardLayout(boardId, prev);
      const nextState = updater(next[boardId]);
      void persistBoardIfShared(boardId, nextState);
      return { ...next, [boardId]: nextState };
    });
  };

  const toggleWidget = (boardId: string, widgetId: string, enabled: boolean) => {
    setBoardState(boardId, (state) => {
      const hidden = state.hidden.filter((id) => id !== widgetId);
      return { ...state, hidden: enabled ? hidden : [...hidden, widgetId] };
    });
  };

  const moveWidgetToPosition = (boardId: string, fromId: string, toId: string, position: 'before' | 'after') => {
    setBoardState(boardId, (state) => {
      const order = [...state.order];
      const fromIndex = order.indexOf(fromId);
      const toIndex = order.indexOf(toId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return state;
      order.splice(fromIndex, 1);
      let insertIndex = toIndex + (position === 'after' ? 1 : 0);
      if (fromIndex < insertIndex) insertIndex -= 1;
      order.splice(insertIndex, 0, fromId);
      return { ...state, order };
    });
  };

  const addWidget = (boardId: string, widgetId: string) => {
    setBoardState(boardId, (state) => {
      if (state.order.includes(widgetId)) return state;
      return {
        order: [...state.order, widgetId],
        hidden: state.hidden.filter((id) => id !== widgetId),
        deleted: (state.deleted || []).filter((id) => id !== widgetId),
      };
    });
  };

  const removeWidget = (boardId: string, widgetId: string) => {
    setBoardState(boardId, (state) => ({
      order: state.order.filter((id) => id !== widgetId),
      hidden: state.hidden.filter((id) => id !== widgetId),
      deleted: [...(state.deleted || []), widgetId],
    }));
  };

  const resetBoard = (boardId: string) => {
    const defaults = DEFAULT_WIDGETS[boardId] || ['notes-board', 'weather-widget', 'clock-widget'];
    setBoardState(boardId, () => ({ order: [...defaults], hidden: [] }));
  };

  const createBoard = async () => {
    const name = (window.prompt('Název nové nástěnky') || '').trim();
    if (!name) return;
    try {
      const created = await createSharedDashboard({
        name,
        widgetsOrder: ['notes-board', 'weather-widget', 'clock-widget'],
        widgetsHidden: [],
      });
      setSharedBoards((prev) => [created, ...prev]);
      setActiveBoard(created.id);
      setShowManager(true);
      toast.success('Nástěnka vytvořena.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Vytvoření nástěnky selhalo.';
      toast.error(message);
    }
  };

  const renameBoard = async () => {
    if (!activeBoardMeta || activeBoardMeta.system) return;
    const name = (window.prompt('Nový název nástěnky', activeBoardMeta.label) || '').trim();
    if (!name) return;
    try {
      const updated = await updateSharedDashboard(activeBoardMeta.id, { name });
      setSharedBoards((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      toast.success('Název nástěnky uložen.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Přejmenování selhalo.';
      toast.error(message);
    }
  };

  const saveSharing = async () => {
    if (!activeBoardMeta || activeBoardMeta.system) return;
    const users = shareUserIdsInput
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    try {
      const updated = await updateSharedDashboard(activeBoardMeta.id, {
        sharedUserIds: users,
        sharedRoles: shareRoles,
      });
      setSharedBoards((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      toast.success('Sdílení uloženo.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Uložení sdílení selhalo.';
      toast.error(message);
    }
  };

  const deleteBoard = async () => {
    if (!activeBoardMeta || activeBoardMeta.system) return;
    if (!window.confirm('Opravdu smazat tuto nástěnku?')) return;
    try {
      await deleteSharedDashboard(activeBoardMeta.id);
      setSharedBoards((prev) => prev.filter((item) => item.id !== activeBoardMeta.id));
      setActiveBoard('crm');
      toast.success('Nástěnka smazána.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mazání nástěnky selhalo.';
      toast.error(message);
    }
  };

  const exportBoards = async () => {
    try {
      const exported = await exportSharedDashboards();
      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `core-dashboards-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export selhal.';
      toast.error(message);
    }
  };

  const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { dashboards?: BackendSharedDashboard[] };
      const dashboards = Array.isArray(parsed?.dashboards) ? parsed.dashboards : [];
      const imported = await importSharedDashboards({
        dashboards: dashboards.map((item) => ({
          name: item.name,
          widgetsOrder: item.widgetsOrder,
          widgetsHidden: item.widgetsHidden,
          sharedUserIds: item.sharedUserIds,
          sharedRoles: item.sharedRoles,
        })),
        replaceOwned: false,
      });
      toast.success(`Importováno: ${imported.imported} nástěnek.`);
      await loadSharedBoards();
    } catch {
      toast.error('Import JSON selhal.');
    } finally {
      event.target.value = '';
    }
  };

  const getDropSide = (event: DragEvent<HTMLDivElement>): 'top' | 'bottom' | 'left' | 'right' => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
    return dy < 0 ? 'top' : 'bottom';
  };

  const renderGrid = (boardId: string) => (
    <div className={cn('grid min-w-0 gap-3 sm:gap-5 lg:gap-7.5 items-stretch', getBoardGridClass(boardId))}>
      {visibleWidgets.map((widget) => (
        <div
          key={widget.id}
          draggable
          onDragStart={(event) => {
            setDraggedWidgetId(widget.id);
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', widget.id);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            const from = draggedWidgetId || event.dataTransfer.getData('text/plain');
            if (!from || from === widget.id) {
              setDropIndicator(null);
              return;
            }
            setDropIndicator({ id: widget.id, side: getDropSide(event) });
          }}
          onDrop={(event) => {
            event.preventDefault();
            const from = draggedWidgetId || event.dataTransfer.getData('text/plain');
            const side = dropIndicator?.id === widget.id ? dropIndicator.side : 'top';
            moveWidgetToPosition(boardId, from, widget.id, side === 'left' || side === 'top' ? 'before' : 'after');
            setDraggedWidgetId(null);
            setDropIndicator(null);
          }}
          onDragEnd={() => {
            setDraggedWidgetId(null);
            setDropIndicator(null);
          }}
          className={cn(
            'relative max-w-full min-w-0 cursor-grab active:cursor-grabbing rounded-xl text-sm sm:text-base [&_.text-3xl]:text-2xl sm:[&_.text-3xl]:text-3xl [&_.text-2xl]:text-xl sm:[&_.text-2xl]:text-2xl',
            widget.colSpanClass || 'lg:col-span-1',
            draggedWidgetId === widget.id && 'opacity-70 shadow-xl ring-1 ring-primary/30',
          )}
        >
          {dropIndicator?.id === widget.id && dropIndicator.side === 'top' && <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary/80" />}
          {dropIndicator?.id === widget.id && dropIndicator.side === 'bottom' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/80" />}
          {dropIndicator?.id === widget.id && dropIndicator.side === 'left' && <div className="absolute top-0 -left-1 bottom-0 w-0.5 bg-primary/80" />}
          {dropIndicator?.id === widget.id && dropIndicator.side === 'right' && <div className="absolute top-0 -right-1 bottom-0 w-0.5 bg-primary/80" />}
          {widget.render(boardId)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container-fluid">
      <Tabs value={activeBoard} onValueChange={setActiveBoard} className="w-full">
        <div className="mb-5 flex min-w-0 items-center justify-between gap-2">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <TabsList
              variant="button"
              shape="pill"
              size="xs"
              className="w-max flex-nowrap justify-start gap-1 bg-transparent p-0"
            >
              {boards.map((board) => (
                <TabsTrigger
                  key={board.id}
                  value={board.id}
                  className="px-2.5 py-1 text-xs"
                >
                  {board.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <input id={IMPORT_INPUT_ID} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
            <Button variant="outline" size="sm" onClick={createBoard}>
              <Plus className="size-4" />
              Přidat nástěnku
            </Button>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowManager((v) => !v)}>
              <SlidersHorizontal className="size-4" />
              Správa panelů
            </Button>
            {isActiveBoardEditable && (
              <>
                <Button variant="outline" size="sm" onClick={renameBoard}>
                  <Pencil className="size-4" />
                  Přejmenovat
                </Button>
                <Button variant="outline" size="sm" onClick={deleteBoard}>
                  <Trash2 className="size-4" />
                  Smazat nástěnku
                </Button>
              </>
            )}
          </div>
        </div>

        {showManager && (
          <Card className="mb-5">
            <CardHeader className="py-3">
              <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <CardTitle className="min-w-0 truncate text-sm">Nástěnka: {activeBoardMeta?.label || activeBoard}</CardTitle>
                <div className="justify-self-end flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportBoards}>
                    <Download className="size-4" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(IMPORT_INPUT_ID)?.click()}
                  >
                    <Upload className="size-4" />
                    Import
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => resetBoard(activeBoard)}>
                    <RotateCcw className="size-4" />
                    Reset pořadí
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeBoardMeta?.system && (
                <div className="rounded-md border p-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Share2 className="size-4" />
                    Sdílení nástěnky
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Sdílet s uživateli (ID oddělená čárkou)</label>
                    <input
                      value={shareUserIdsInput}
                      onChange={(e) => setShareUserIdsInput(e.target.value)}
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                      placeholder={currentUserId ? `např. ${currentUserId}` : 'user-id-1, user-id-2'}
                      disabled={!isActiveBoardEditable}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Sdílet podle role</label>
                    <div className="flex items-center gap-2">
                      {['admin', 'manager', 'agent'].map((role) => (
                        <label key={role} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={shareRoles.includes(role)}
                            onChange={(e) => {
                              setShareRoles((prev) =>
                                e.target.checked ? Array.from(new Set([...prev, role])) : prev.filter((r) => r !== role),
                              );
                            }}
                            disabled={!isActiveBoardEditable}
                          />
                          {role}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={saveSharing} disabled={!isActiveBoardEditable}>
                    Uložit sdílení
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {visibleWidgets.map((widget) => (
                  <div key={widget.id} className="flex min-w-0 items-center justify-between gap-2 rounded-md border p-2">
                    <span className="truncate text-sm">{widget.title}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleWidget(activeBoard, widget.id, false)}>
                        <Eye className="size-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeWidget(activeBoard, widget.id)}>
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {hiddenWidgets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Skryté panely</p>
                  {hiddenWidgets.map((widget) => (
                    <div key={widget.id} className="flex min-w-0 items-center justify-between gap-2 rounded-md border p-2 opacity-60">
                      <span className="truncate text-sm">{widget.title}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleWidget(activeBoard, widget.id, true)}>
                          <EyeOff className="size-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeWidget(activeBoard, widget.id)}>
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Dostupné moduly</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableWidgets.map((widget) => (
                    <div key={widget.id} className="flex min-w-0 items-center justify-between gap-2 rounded-md border p-2">
                      <span className="truncate text-sm">{widget.title}</span>
                      <Button size="sm" variant="outline" onClick={() => addWidget(activeBoard, widget.id)}>
                        Přidat
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {boards.map((board) => (
          <TabsContent key={board.id} value={board.id} className="mt-0 min-w-0">
            {renderGrid(board.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
