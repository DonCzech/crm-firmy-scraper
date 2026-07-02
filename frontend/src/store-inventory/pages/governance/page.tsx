import { useEffect, useState } from 'react';
import { Download, FileText, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  downloadPlatformEntityCsv,
  fetchPlatformAuditLogs,
  type PlatformAuditLog,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EXPORT_ENTITIES: Array<{
  key: 'orders' | 'deals' | 'contacts' | 'companies' | 'tickets' | 'workflows';
  label: string;
}> = [
  { key: 'orders', label: 'Orders' },
  { key: 'deals', label: 'Deals' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'companies', label: 'Companies' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'workflows', label: 'Workflows' },
];

export function GovernancePage() {
  const [loading, setLoading] = useState(false);
  const [exportingEntity, setExportingEntity] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>([]);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const rows = await fetchPlatformAuditLogs(150);
      setAuditLogs(Array.isArray(rows) ? rows : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Načtení audit logů selhalo.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAudit();
  }, []);

  const onExport = async (
    entity: 'orders' | 'deals' | 'contacts' | 'companies' | 'tickets' | 'workflows',
  ) => {
    setExportingEntity(entity);
    try {
      const blob = await downloadPlatformEntityCsv(entity);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${entity}-export.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`Export ${entity} byl stažen.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Export ${entity} selhal.`;
      toast.error(message);
    } finally {
      setExportingEntity(null);
    }
  };

  return (
    <div className="container-fluid space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Governance</h1>
          <p className="text-sm text-muted-foreground">Audit logy a governance exporty dat.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => void loadAudit()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Obnovit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV Export</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {EXPORT_ENTITIES.map((entity) => (
            <Button
              key={entity.key}
              type="button"
              variant="outline"
              className="gap-2"
              disabled={exportingEntity !== null}
              onClick={() => void onExport(entity.key)}
            >
              {exportingEntity === entity.key ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {entity.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Logs ({auditLogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {auditLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground">Žádné audit záznamy.</div>
          ) : (
            auditLogs.slice(0, 100).map((log) => (
              <div key={log.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <div className="font-medium">{log.action || 'action'}</div>
                  <Badge variant={log.success === 0 || log.success === false ? 'destructive' : 'secondary'}>
                    {log.success === 0 || log.success === false ? 'error' : 'ok'}
                  </Badge>
                  {log.method && <Badge variant="outline">{log.method}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {log.path || 'n/a'} • status {log.response_status ?? 'n/a'} • {log.created_at || 'n/a'}
                </div>
                {log.error_message && (
                  <div className="mt-1 text-xs text-destructive flex items-center gap-1">
                    <ShieldCheck className="size-3.5" />
                    {log.error_message}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
