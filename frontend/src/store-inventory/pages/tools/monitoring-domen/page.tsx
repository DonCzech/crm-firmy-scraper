import { useEffect, useMemo, useState } from 'react';
import { Activity, Plus, RefreshCw, Siren } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createDomainMonitorTarget,
  fetchDomainMonitorIncidents,
  fetchDomainMonitorTargets,
  runDomainMonitorCheckNow,
  runDomainMonitorCheckOne,
  updateDomainMonitorTarget,
  type DomainMonitorIncident,
  type DomainMonitorTarget,
} from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

function targetStatusClass(status: DomainMonitorTarget['lastStatus']) {
  if (status === 'up') return 'border-emerald-300 text-emerald-700';
  if (status === 'down') return 'border-red-300 text-red-700';
  return 'border-slate-300 text-slate-600';
}

export function DomainMonitoringPage() {
  const [targets, setTargets] = useState<DomainMonitorTarget[]>([]);
  const [incidents, setIncidents] = useState<DomainMonitorIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newInterval, setNewInterval] = useState('60');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [t, i] = await Promise.all([fetchDomainMonitorTargets(), fetchDomainMonitorIncidents(200)]);
      setTargets(Array.isArray(t) ? t : []);
      setIncidents(Array.isArray(i) ? i : []);
    } catch (error) {
      logFrontendError(error, { scope: 'domain-monitor:load' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => void load(true), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const summary = useMemo(() => {
    const up = targets.filter((t) => t.lastStatus === 'up').length;
    const down = targets.filter((t) => t.lastStatus === 'down').length;
    const unknown = targets.length - up - down;
    return { up, down, unknown, total: targets.length };
  }, [targets]);

  const addTarget = async () => {
    const domain = newDomain.trim();
    if (!domain) return;
    setSaving(true);
    try {
      await createDomainMonitorTarget({
        domain,
        project: newProject.trim() || undefined,
        checkIntervalSec: Number(newInterval) || 60,
      });
      setNewDomain('');
      setNewProject('');
      setNewInterval('60');
      await load(true);
    } catch (error) {
      logFrontendError(error, { scope: 'domain-monitor:add' });
    } finally {
      setSaving(false);
    }
  };

  const toggleTarget = async (target: DomainMonitorTarget) => {
    try {
      await updateDomainMonitorTarget(target.id, { isActive: !target.isActive });
      await load(true);
    } catch (error) {
      logFrontendError(error, { scope: 'domain-monitor:toggle' });
    }
  };

  const checkOne = async (target: DomainMonitorTarget) => {
    try {
      await runDomainMonitorCheckOne(target.id);
      await load(true);
    } catch (error) {
      logFrontendError(error, { scope: 'domain-monitor:check-one' });
    }
  };

  const checkAll = async () => {
    setRefreshing(true);
    try {
      await runDomainMonitorCheckNow();
      await load(true);
    } catch (error) {
      logFrontendError(error, { scope: 'domain-monitor:check-all' });
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Monitoring domén
              </CardTitle>
              <p className="text-sm text-muted-foreground">Kontrola dostupnosti všech vašich domén + log incidentů.</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => void checkAll()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Zkontrolovat vše
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          <Badge variant="outline">Celkem: {summary.total}</Badge>
          <Badge variant="outline" className="border-emerald-300 text-emerald-700">Online: {summary.up}</Badge>
          <Badge variant="outline" className="border-red-300 text-red-700">Výpadek: {summary.down}</Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-700">Neznámý: {summary.unknown}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Přidat doménu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="např. www.core.ceskypartner.cz"
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary md:col-span-2"
            />
            <input
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Projekt"
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2">
              <input
                value={newInterval}
                onChange={(e) => setNewInterval(e.target.value)}
                placeholder="Sekundy"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
              <Button className="gap-2" onClick={() => void addTarget()} disabled={saving}>
                <Plus className="h-4 w-4" />
                Přidat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Domény</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && targets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : null}
          {targets.map((target) => (
            <div key={target.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
              <div className="min-w-[220px] flex-1">
                <p className="text-sm font-semibold">{target.domain}</p>
                <p className="text-xs text-muted-foreground">
                  {target.project || 'Bez projektu'} • interval {target.checkIntervalSec}s • poslední kontrola{' '}
                  {target.lastCheckedAt ? new Date(target.lastCheckedAt).toLocaleString('cs-CZ') : '—'}
                </p>
                {target.lastError ? <p className="text-xs text-red-600">{target.lastError}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={targetStatusClass(target.lastStatus)}>
                  {target.lastStatus.toUpperCase()}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => void checkOne(target)}>Check</Button>
                <Button variant="outline" size="sm" onClick={() => void toggleTarget(target)}>
                  {target.isActive ? 'Vypnout' : 'Zapnout'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Siren className="h-4 w-4" />
            Incident log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zatím bez incidentů.</p>
          ) : (
            incidents.map((incident) => (
              <div key={incident.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{incident.domain}</p>
                  <Badge
                    variant="outline"
                    className={incident.eventType === 'outage' ? 'border-red-300 text-red-700' : 'border-emerald-300 text-emerald-700'}
                  >
                    {incident.eventType === 'outage' ? 'Výpadek' : 'Obnoveno'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(incident.checkedAt).toLocaleString('cs-CZ')} • {incident.project || 'Bez projektu'} • HTTP{' '}
                  {incident.httpStatus ?? '—'} • {incident.latencyMs ?? '—'} ms
                </p>
                {incident.error ? <p className="text-xs text-red-600">{incident.error}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
