import { useEffect, useState } from 'react';
import { Database, Download, Plus, RefreshCw } from 'lucide-react';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { useFrontendErrorCount24h } from '@/crm/hooks/use-frontend-error-count-24h';
import { useSensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { ObservabilityBadges } from '@/crm/components/observability-badges';
import { Button } from '@/components/ui/button';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { listBackups, createBackup, downloadBackup, BackupFile } from '../../services/backend';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function BackupPage() {
  const { role, userId, canManageSensitiveActions } = useCurrentUserRole();
  const frontendErrorCount24h = useFrontendErrorCount24h();
  const sensitiveActions24hSummary = useSensitiveActionsSummary24h('backup');
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setBackups(await listBackups());
    } catch (e) {
      logFrontendError({
        area: 'crm-backup-page',
        message: e instanceof Error ? e.message : String(e),
        meta: { operation: 'list_backups' },
      });
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!canManageSensitiveActions) {
      appendSensitiveActionAudit({
        area: 'backup',
        action: 'create_backup',
        result: 'denied',
        actorRole: role,
        actorUserId: userId || undefined,
        message: 'Blocked by role policy',
      });
      setError('Vytvoření zálohy je dostupné pouze pro role admin/manager.');
      return;
    }
    setCreating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = await createBackup();
      if (result.success) {
        appendSensitiveActionAudit({
          area: 'backup',
          action: 'create_backup',
          result: 'success',
          actorRole: role,
          actorUserId: userId || undefined,
          meta: { filename: result.filename ?? null },
        });
        setSuccessMsg(`Záloha vytvořena: ${result.filename}`);
        await load();
      } else {
        appendSensitiveActionAudit({
          area: 'backup',
          action: 'create_backup',
          result: 'error',
          actorRole: role,
          actorUserId: userId || undefined,
          message: result.error ?? 'Backup creation failed',
        });
        setError(result.error ?? 'Záloha selhala');
      }
    } catch (e) {
      logFrontendError({
        area: 'crm-backup-page',
        message: e instanceof Error ? e.message : String(e),
        meta: { operation: 'create_backup' },
      });
      appendSensitiveActionAudit({
        area: 'backup',
        action: 'create_backup',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message: String(e),
      });
      setError(String(e));
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (filename: string) => {
    if (!canManageSensitiveActions) {
      appendSensitiveActionAudit({
        area: 'backup',
        action: 'download_backup',
        result: 'denied',
        actorRole: role,
        actorUserId: userId || undefined,
        message: 'Blocked by role policy',
        meta: { filename },
      });
      setError('Stažení zálohy je dostupné pouze pro role admin/manager.');
      return;
    }
    setDownloading(filename);
    try {
      await downloadBackup(filename);
      appendSensitiveActionAudit({
        area: 'backup',
        action: 'download_backup',
        result: 'success',
        actorRole: role,
        actorUserId: userId || undefined,
        meta: { filename },
      });
    } catch (e) {
      logFrontendError({
        area: 'crm-backup-page',
        message: e instanceof Error ? e.message : String(e),
        meta: { operation: 'download_backup', filename },
      });
      appendSensitiveActionAudit({
        area: 'backup',
        action: 'download_backup',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message: String(e),
        meta: { filename },
      });
      setError(String(e));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <ContentHeader
        title="Zálohy databáze"
        description="Automatické denní zálohy ve 02:00 • maximálně 30 záloh"
        toolbar={
          <div className="flex items-center gap-2">
            <ObservabilityBadges
              role={role}
              frontendErrorCount24h={frontendErrorCount24h}
              sensitiveActions24hSummary={sensitiveActions24hSummary}
            />
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Obnovit
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={creating || !canManageSensitiveActions}
            >
              <Plus className="size-4" />
              {creating ? 'Vytváří se...' : 'Vytvořit zálohu'}
            </Button>
          </div>
        }
      />

      <Content>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Načítám zálohy...
          </div>
        ) : backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Database className="size-10 opacity-30" />
            <p className="text-sm">Žádné zálohy nenalezeny</p>
            <p className="text-xs">Klikněte na "Vytvořit zálohu" pro první zálohu</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Soubor</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Datum</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Velikost</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {backups.map((b, i) => (
                  <tr
                    key={b.filename}
                    className={`border-b border-border last:border-0 ${i === 0 ? 'bg-green-500/5' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {i === 0 && (
                        <span className="inline-block mr-2 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-green-500/15 text-green-700 dark:text-green-400">
                          nejnovější
                        </span>
                      )}
                      {b.filename}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatBytes(b.size)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => handleDownload(b.filename)}
                        disabled={downloading === b.filename || !canManageSensitiveActions}
                        title="Stáhnout zálohu"
                      >
                        <Download className="size-3.5" />
                        {downloading === b.filename ? 'Stahuje...' : 'Stáhnout'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Content>
    </>
  );
}
