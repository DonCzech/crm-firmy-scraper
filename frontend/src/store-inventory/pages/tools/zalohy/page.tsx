import { useEffect, useState } from 'react';
import { Database, Download, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createBackup, downloadBackup, listBackups, type BackupFile } from '@/crm/services/backend';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BackupsPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listBackups();
      setBackups(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Načtení záloh selhalo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBackups();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createBackup();
      if (!result.success) {
        setError(result.error || 'Vytvoření zálohy selhalo.');
        return;
      }
      setSuccess(`Záloha vytvořena: ${result.filename}`);
      await loadBackups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vytvoření zálohy selhalo.');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (filename: string) => {
    setDownloading(filename);
    setError(null);
    try {
      await downloadBackup(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stažení zálohy selhalo.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4 px-4 pb-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="size-4 text-primary" />
              Zálohy
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Záloha pouze CRM (frontend + backend) s možností stažení.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadBackups} disabled={loading}>
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Obnovit
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              <Plus className="size-4" />
              {creating ? 'Vytvářím...' : 'Vytvořit zálohu'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Načítám zálohy...</div>
          ) : backups.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Žádné zálohy nenalezeny.</div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Soubor</th>
                      <th className="px-3 py-2 text-left font-medium">Datum</th>
                      <th className="px-3 py-2 text-right font-medium">Velikost</th>
                      <th className="px-3 py-2 text-right font-medium">Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.filename} className="border-t border-border/60">
                        <td className="px-3 py-2 font-mono text-xs">{backup.filename}</td>
                        <td className="px-3 py-2 text-muted-foreground">{formatDate(backup.createdAt)}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{formatBytes(backup.size)}</td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleDownload(backup.filename)}
                            disabled={downloading === backup.filename}
                          >
                            <Download className="size-3.5" />
                            {downloading === backup.filename ? 'Stahuji...' : 'Stáhnout'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
