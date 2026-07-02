import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchDatabaseConnectionsHealth,
  type DatabaseConnectionHealth,
  type DatabaseConnectionsHealthResponse,
} from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

function statusLabel(status: DatabaseConnectionHealth['status']) {
  if (status === 'ok') return 'OK';
  if (status === 'unstable') return 'Nestabilní';
  if (status === 'missing') return 'Chybí';
  return 'Nedostupná';
}

function statusClass(status: DatabaseConnectionHealth['status']) {
  if (status === 'ok') return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
  if (status === 'unstable') return 'bg-amber-500/10 text-amber-700 border-amber-300';
  if (status === 'missing') return 'bg-amber-500/10 text-amber-700 border-amber-300';
  return 'bg-red-500/10 text-red-700 border-red-300';
}

export function DatabaseControlPage() {
  const [data, setData] = useState<DatabaseConnectionsHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetchDatabaseConnectionsHealth();
      setData(response);
    } catch (err) {
      logFrontendError(err, { scope: 'database-control:load' });
      setError(err instanceof Error ? err.message : 'Nepodařilo se načíst stav databází.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => {
      void load(true);
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => {
      const rank = (status: DatabaseConnectionHealth['status']) =>
        status === 'ok' ? 2 : status === 'missing' ? 1 : 0;
      return rank(a.status) - rank(b.status);
    });
  }, [data?.items]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4" />
                Kontrola databází
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Přehled napojení modulů na databáze a jejich dostupnosti.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void load(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Obnovit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 pt-0">
          <Badge variant="outline">Celkem: {data?.total ?? 0}</Badge>
          <Badge variant="outline" className="border-emerald-300 text-emerald-700">
            OK: {data?.okCount ?? 0}
          </Badge>
          <Badge variant="outline" className="border-amber-300 text-amber-700">
            Nestabilní: {data?.unstableCount ?? 0}
          </Badge>
          <Badge variant="outline" className="border-red-300 text-red-700">
            Chyba: {data?.downCount ?? 0}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Poslední kontrola:{' '}
            {data?.checkedAt ? new Date(data.checkedAt).toLocaleString('cs-CZ') : '—'}
          </span>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="py-6 text-sm text-red-600">{error}</CardContent>
        </Card>
      ) : null}

      {loading && !data ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">Načítám stavy databází…</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {sortedItems.map((item) => (
          <Card key={item.key} className="border">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{item.project}</p>
                  <p className="text-xs text-muted-foreground">{item.module}</p>
                </div>
                <Badge variant="outline" className={statusClass(item.status)}>
                  {statusLabel(item.status)}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Env: {item.sourceEnv || '—'}</p>
                <p>Host: {item.connection.host || '—'}</p>
                <p>DB: {item.connection.database || '—'}</p>
                <p>Schema: {item.connection.schema || '—'}</p>
                <p>Odezva: {item.latencyMs == null ? '—' : `${item.latencyMs} ms`}</p>
              </div>

              {item.error ? <p className="text-xs text-red-600">{item.error}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
