import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchProblemDomainImportLogs,
  fetchProblemDomainImportRuns,
  fetchProblemDomainsOptions,
  importProblemDomains,
  updateProblemDomainNegativeDefinition,
} from '@/crm/services/backend';
import { ProblemDomainsModuleNav } from './module-nav';

export function ProblemDomainsImportPage() {
  const [jsonText, setJsonText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [selectedRunId, setSelectedRunId] = useState('');
  const [runs, setRuns] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [opts, setOpts] = useState<any>(null);
  const [negativeDefinition, setNegativeDefinition] = useState<'rating1' | 'rating1_2'>('rating1');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const [runsRes, options] = await Promise.all([
        fetchProblemDomainImportRuns(1, 30),
        fetchProblemDomainsOptions(),
      ]);
      setRuns(runsRes.data || []);
      setOpts(options);
      setNegativeDefinition(options.negativeDefinition || 'rating1');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se načíst import centrum');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const doImport = async () => {
    setRunning(true);
    try {
      setError(null);
      const jsonRows = jsonText.trim() ? JSON.parse(jsonText) : undefined;
      await importProblemDomains({ csvText: csvText.trim() || undefined, jsonRows });
      setJsonText('');
      setCsvText('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import selhal');
    } finally {
      setRunning(false);
    }
  };

  const loadRunLogs = async (runId: string) => {
    setSelectedRunId(runId);
    const res = await fetchProblemDomainImportLogs(runId, 1, 500);
    setLogs(res.data || []);
  };

  const saveNegativeDefinition = async () => {
    try {
      setError(null);
      await updateProblemDomainNegativeDefinition(negativeDefinition);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Uložení nastavení selhalo');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Import / Update centrum</h1>
        <p className="text-sm text-muted-foreground">Ruční import CSV/JSON, update Trustpilot dat, logy běhů a chyb.</p>
      </div>

      <ProblemDomainsModuleNav />

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Aktualizace Trustpilot dat</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              Aktualizace se spouští pouze z dashboardu modulu přes tlačítko <strong>Nahrát / aktualizovat data</strong>.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Negativní recenze:</span>
              <Select value={negativeDefinition} onValueChange={(v) => setNegativeDefinition(v as 'rating1' | 'rating1_2')}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating1">Pouze 1★</SelectItem>
                  <SelectItem value="rating1_2">1★ + 2★</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => void saveNegativeDefinition()}>Uložit</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Import CSV / JSON</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={4} placeholder="CSV: domain,categoryId,subcategoryId,businessModelTags,trustpilotUrl,notes" />
            <Textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={6} placeholder='JSON array: [{"domain":"...","categoryId":"..."}]' />
            <Button onClick={() => void doImport()} disabled={running}>Importovat data</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Log import runů</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {runs.map((run) => (
              <button
                type="button"
                key={run.id}
                onClick={() => void loadRunLogs(run.id)}
                className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <div className="font-medium">{new Date(run.startedAt).toLocaleString('cs-CZ')} | {run.status}</div>
                <div className="text-xs text-muted-foreground">total: {run.totalDomains} | synced: {run.syncedCount} | errors: {run.errorCount}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Log vybraného běhu {selectedRunId ? `(${selectedRunId})` : ''}</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[480px] overflow-auto">
            {logs.map((log) => (
              <div key={log.id} className="rounded-md border px-3 py-2 text-sm">
                <div className="font-medium">{log.status} | {log.domain || '-'}</div>
                <div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString('cs-CZ')}</div>
                <div className="text-xs">{log.message}</div>
                {log.details ? <pre className="mt-1 whitespace-pre-wrap text-[11px] text-muted-foreground">{log.details}</pre> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Statistika posledního běhu</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Poslední běhy najdeš v logu výše. Modul podporuje retry, rate limiting, statusy `synced/pending/error/no-source` a připravený provider layer pro budoucí datové zdroje.
        </CardContent>
      </Card>
    </div>
  );
}
