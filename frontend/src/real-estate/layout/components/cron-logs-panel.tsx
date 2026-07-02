import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// Typy
// ─────────────────────────────────────────────

interface CronLogCategory {
  label: string;
  scraped: number;
  created: number;
  updated: number;
  errors: number;
}

interface CronLog {
  id: string;
  job: string;
  status: 'success' | 'error';
  durationMs: number;
  scraped: number;
  created: number;
  updated: number;
  errors: number;
  detail: string | null;
  createdAt: string;
}

// ─────────────────────────────────────────────
// API helper
// ─────────────────────────────────────────────

const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE = (envApiUrl?.length ? envApiUrl : 'https://backend-jet-seven-94.vercel.app/api').replace(/\/+$/, '');

function getToken(): string | null {
  for (const key of ['crm_access_token', 'accessToken', 'token', 'auth_token']) {
    const t = localStorage.getItem(key);
    if (t) return t;
  }
  return null;
}

async function fetchLogs(): Promise<CronLog[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/cron/logs?limit=20`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<CronLog[]>;
}

// ─────────────────────────────────────────────
// Subkomponenty
// ─────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function LogRow({ log }: { log: CronLog }) {
  const [expanded, setExpanded] = React.useState(false);
  const categories: CronLogCategory[] = log.detail ? JSON.parse(log.detail) : [];

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        log.status === 'error' ? 'border-red-200' : 'border-border',
      )}
    >
      {/* Hlavní řádek */}
      <button
        onClick={() => categories.length > 0 && setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
      >
        {log.status === 'success'
          ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          : <XCircle className="w-4 h-4 text-red-500 shrink-0" />
        }

        <span className="text-sm text-muted-foreground w-36 shrink-0">
          {formatDate(log.createdAt)}
        </span>

        <div className="flex gap-2 flex-wrap flex-1">
          <Badge variant="secondary" className="text-xs">
            {log.scraped} zkontrolováno
          </Badge>
          {log.updated > 0 && (
            <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
              {log.updated} aktualizováno
            </Badge>
          )}
          {log.errors > 0 && (
            <Badge variant="destructive" className="text-xs">
              {log.errors} chyb
            </Badge>
          )}
        </div>

        <span className="text-xs text-muted-foreground shrink-0">
          {formatDuration(log.durationMs)}
        </span>
      </button>

      {/* Detail per kategorie */}
      {expanded && categories.length > 0 && (
        <div className="border-t bg-muted/30 px-4 py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left pb-1">Kategorie</th>
                <th className="text-right pb-1">Zkontrolováno</th>
                <th className="text-right pb-1">Aktualizováno</th>
                <th className="text-right pb-1">Chyby</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.label} className="border-t border-border/50">
                  <td className="py-1">{cat.label}</td>
                  <td className="text-right">{cat.scraped}</td>
                  <td className="text-right text-blue-600">{cat.updated}</td>
                  <td className="text-right text-red-500">{cat.errors || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Hlavní komponenta — tlačítko + dialog
// ─────────────────────────────────────────────

export function CronLogsPanel() {
  const [open, setOpen] = React.useState(false);
  const [logs, setLogs] = React.useState<CronLog[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLogs();
      setLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chyba načítání');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="Cron logy scraperu"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Activity className="opacity-100" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Cron logy — Sreality update
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={load}
              disabled={loading}
              title="Obnovit"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </DialogHeader>

          <p className="text-xs text-muted-foreground -mt-2">
            Cron běží každý den v 7:00 UTC — kontroluje ceny a stavy existujících inzerátů.
          </p>

          <div className="flex-1 overflow-auto space-y-2 mt-2">
            {loading && logs.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">Načítám...</p>
            )}

            {error && (
              <p className="text-center text-red-500 py-8 text-sm">{error}</p>
            )}

            {!loading && !error && logs.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Žádné logy — cron ještě neproběhl.
              </p>
            )}

            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
