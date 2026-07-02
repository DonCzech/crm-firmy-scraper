import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Download,
  FolderOpen,
  Settings,
  Loader2,
  FileText,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';

const ALL_CATEGORIES: Record<string, string> = {
  reality: 'Reality',
  auto: 'Auto',
  moto: 'Moto',
  stroje: 'Stroje',
  prace: 'Práce',
  sluzby: 'Služby',
  pc: 'PC',
  mobil: 'Mobil',
  foto: 'Foto',
  elektro: 'Elektro',
  sport: 'Sport',
  hudba: 'Hudba',
  knihy: 'Knihy',
  nabytek: 'Nábytek',
  obleceni: 'Oblečení',
  detske: 'Dětské',
  zvirata: 'Zvířata',
  dum: 'Dům a zahrada',
  ostatni: 'Ostatní',
  vstupenky: 'Vstupenky',
};

interface ScraperStatus {
  running: boolean;
  category?: string;
  progress?: number;
  total?: number;
  scraped?: number;
  error?: string;
}

interface CategoryFile {
  category: string;
  name: string;
  count: number;
  size: string;
  lastModified: string;
}

export function BazosScraperPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [resume, setResume] = useState(true);
  const [status, setStatus] = useState<ScraperStatus>({ running: false });
  const [files, setFiles] = useState<CategoryFile[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  };

  const selectAll = () => {
    setSelectedCategories(Object.keys(ALL_CATEGORIES));
  };

  const selectNone = () => {
    setSelectedCategories([]);
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('cs-CZ');
    setLogs((prev) => [...prev.slice(-200), `[${time}] ${msg}`]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleStart = async () => {
    const cats = selectedCategories.length > 0 ? selectedCategories : Object.keys(ALL_CATEGORIES);
    setStatus({ running: true, category: cats[0], scraped: 0, total: 0 });
    addLog(`Spouštím scraper pro ${cats.length} kategorií: ${cats.join(', ')}`);
    addLog(resume ? 'Režim: pokračování (resume)' : 'Režim: od začátku');

    // Simulace scrapování — v produkci by se volalo backend API
    for (const cat of cats) {
      if (!status.running) break;
      setStatus((prev) => ({ ...prev, category: cat }));
      addLog(`Scrapuji kategorii: ${ALL_CATEGORIES[cat]} (${cat}.bazos.cz)`);

      // Simulace progressu
      const total = Math.floor(Math.random() * 500) + 100;
      for (let i = 0; i <= total; i += 20) {
        await new Promise((r) => setTimeout(r, 50));
        setStatus((prev) => ({
          ...prev,
          progress: Math.round((i / total) * 100),
          scraped: i,
          total,
        }));
      }

      addLog(`Kategorie ${ALL_CATEGORIES[cat]} hotova: ${total} inzerátů`);
      setFiles((prev) => {
        const existing = prev.filter((f) => f.category !== cat);
        return [
          ...existing,
          {
            category: cat,
            name: ALL_CATEGORIES[cat],
            count: total,
            size: `${(total * 0.8).toFixed(0)} KB`,
            lastModified: new Date().toLocaleString('cs-CZ'),
          },
        ];
      });
    }

    setStatus({ running: false });
    addLog('Scraping dokončen');
  };

  const handleStop = () => {
    setStatus({ running: false });
    addLog('Scraper zastaven uživatelem');
  };

  return (
    <>
      <ContentHeader title="Bazoš Scraper" icon={Search} />
      <Content>
        <div className="space-y-6">
          {/* Status card */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold">Stav scraperu</h3>
                {status.running ? (
                  <Badge variant="default" className="bg-blue-500">
                    <Loader2 className="size-3 animate-spin mr-1" />
                    Běží
                  </Badge>
                ) : (
                  <Badge variant="secondary">Zastaven</Badge>
                )}
              </div>
              <div className="flex gap-2">
                {status.running ? (
                  <Button variant="destructive" size="sm" onClick={handleStop}>
                    <Square className="size-4" />
                    Zastavit
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleStart}>
                    <Play className="size-4" />
                    Spustit
                  </Button>
                )}
              </div>
            </div>

            {status.running && status.category && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Kategorie: <strong>{ALL_CATEGORIES[status.category]}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    {status.scraped?.toLocaleString('cs-CZ')}/{status.total?.toLocaleString('cs-CZ')} inzerátů
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${status.progress ?? 0}%` }}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Config card */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="size-4 text-muted-foreground" />
              <h3 className="text-base font-semibold">Konfigurace</h3>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Kategorie</label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll} disabled={status.running}>
                    Vše
                  </Button>
                  <Button variant="ghost" size="sm" onClick={selectNone} disabled={status.running}>
                    Nic
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ALL_CATEGORIES).map(([key, name]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={selectedCategories.includes(key) ? 'default' : 'outline'}
                    onClick={() => toggleCategory(key)}
                    disabled={status.running}
                    className="text-xs"
                  >
                    {name}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {selectedCategories.length === 0
                  ? 'Žádná kategorie nevybrána → scrapují se všechny'
                  : `Vybrány: ${selectedCategories.length} z ${Object.keys(ALL_CATEGORIES).length}`}
              </p>
            </div>

            {/* Resume */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Pokračování (resume)</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={resume ? 'default' : 'outline'}
                  onClick={() => setResume(true)}
                  disabled={status.running}
                >
                  Ano
                </Button>
                <Button
                  size="sm"
                  variant={!resume ? 'default' : 'outline'}
                  onClick={() => setResume(false)}
                  disabled={status.running}
                >
                  Od začátku
                </Button>
              </div>
            </div>
          </Card>

          {/* Output files */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="size-4 text-muted-foreground" />
              <h3 className="text-base font-semibold">Výstupní soubory</h3>
            </div>

            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Zatím žádné soubory. Spusťte scraper pro stažení dat.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Kategorie</th>
                      <th className="pb-2 font-medium">Inzerátů</th>
                      <th className="pb-2 font-medium">Velikost</th>
                      <th className="pb-2 font-medium">Poslední aktualizace</th>
                      <th className="pb-2 font-medium text-right">Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file.category} className="border-b last:border-0">
                        <td className="py-2.5 font-medium">{file.name}</td>
                        <td className="py-2.5">{file.count.toLocaleString('cs-CZ')}</td>
                        <td className="py-2.5 text-muted-foreground">{file.size}</td>
                        <td className="py-2.5 text-muted-foreground">{file.lastModified}</td>
                        <td className="py-2.5 text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="size-3.5" />
                            CSV
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Logs */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <h3 className="text-base font-semibold">Log</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogs([])}
                disabled={status.running}
              >
                Vymazat
              </Button>
            </div>

            <div className="bg-gray-950 text-gray-300 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed">
              {logs.length === 0 ? (
                <span className="text-gray-500">Žádné logy. Spusťte scraper.</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap">
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </Card>
        </div>
      </Content>
    </>
  );
}
