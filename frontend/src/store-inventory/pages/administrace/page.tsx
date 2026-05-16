import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Users, CreditCard, TrendingUp, Wifi, WifiOff,
  RefreshCw, Search, ChevronRight, Brain, FileText, Zap, Server,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type AdminProjectStats,
  fetchAdminAllStats,
  adminSearchAllUsers,
  type AdminUser,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number | undefined | null): string {
  if (n == null) return '—';
  return n.toLocaleString('cs-CZ');
}

function fmtCurrency(n: number | undefined | null): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

// ── Aggregate stat card ───────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3">
      <div className="rounded-lg p-2 shrink-0" style={{ backgroundColor: `${color}20` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{label}</p>
        <p className="text-base sm:text-xl font-bold truncate">{value}</p>
      </div>
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick }: {
  project: AdminProjectStats; onClick: () => void;
}) {
  const s = project.stats;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/40 active:bg-muted/40 transition-all group"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg shrink-0"
          style={{ backgroundColor: project.color }}
        >
          {project.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{project.name}</p>
          <p className="text-xs text-muted-foreground truncate">{project.domain}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {project.online ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <Wifi className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
              <WifiOff className="w-3 h-3" /> Off
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Stats row */}
      {project.online && s ? (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
          <div className="text-center">
            <p className="text-sm sm:text-base font-bold">{fmt(s.totalUsers)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Uživatelů</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-sm sm:text-base font-bold">
              {fmt(s.activeSubscriptions ?? s.activeTenants ?? s.paidTenants)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {s.activeTenants != null ? 'Aktivních' : 'Předplatitelů'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-base font-bold">
              {s.mrr ? fmtCurrency(s.mrr) : '—'}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">MRR</p>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-border text-center text-xs text-muted-foreground">
          {project.online ? 'Načítám…' : 'Nedostupný'}
        </div>
      )}
    </button>
  );
}

// ── Search result row ─────────────────────────────────────────────────────────

function SearchResultRow({ user, onClick }: { user: AdminUser; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent active:bg-accent text-left"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: user.projectColor ?? '#6366f1' }}
      >
        {user.email.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{user.email}</p>
        <p className="text-xs text-muted-foreground truncate">
          {user.projectIcon} {user.projectName}
        </p>
      </div>
      <Badge variant="outline" className="shrink-0 text-[10px] px-1.5">
        {user.plan ?? 'free'}
      </Badge>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AdministracePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminProjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAllStats();
      setStats(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      toast.error('Nelze načíst statistiky');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await adminSearchAllUsers(search);
        setSearchResults(res.slice(0, 15));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totals = stats.reduce(
    (acc, p) => {
      if (p.stats) {
        acc.users += p.stats.totalUsers ?? 0;
        acc.subs += p.stats.activeSubscriptions ?? p.stats.activeTenants ?? p.stats.paidTenants ?? 0;
        acc.mrr += p.stats.mrr ?? 0;
      }
      acc.online += p.online ? 1 : 0;
      return acc;
    },
    { users: 0, subs: 0, mrr: 0, online: 0 }
  );

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold leading-tight">Centrální Administrace</h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            Správa všech projektů · {lastRefresh.toLocaleTimeString('cs-CZ')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5 shrink-0">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Obnovit</span>
        </Button>
      </div>

      {/* Global search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Hledat uživatele napříč projekty…"
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {searching && (
          <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {searchResults.length > 0 && search.length >= 2 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
            <div className="px-3 py-1.5 border-b bg-muted/40">
              <p className="text-[11px] text-muted-foreground">{searchResults.length} výsledků</p>
            </div>
            <div className="max-h-60 overflow-y-auto overscroll-contain divide-y divide-border">
              {searchResults.map((u) => (
                <SearchResultRow
                  key={`${u.projectId}-${u.id}`}
                  user={u}
                  onClick={() => {
                    setSearch('');
                    setSearchResults([]);
                    navigate(`/core/administrace/projects/${u.projectId}/users/${u.id}`);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Aggregate stats — 2 col on mobile, 4 col on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <StatCard icon={<Globe className="w-4 h-4" />} label="Projektů online" value={`${totals.online} / ${stats.length}`} color="#6366f1" />
        <StatCard icon={<Users className="w-4 h-4" />} label="Celkem uživatelů" value={fmt(totals.users)} color="#0ea5e9" />
        <StatCard icon={<CreditCard className="w-4 h-4" />} label="Předplatitelé" value={fmt(totals.subs)} color="#10b981" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Celkem MRR" value={fmtCurrency(totals.mrr)} color="#f59e0b" />
      </div>

      {/* Projects */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Projekty</p>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.map((p) => (
              <ProjectCard key={p.projectId} project={p} onClick={() => navigate(`/core/administrace/projects/${p.projectId}/users`)} />
            ))}
          </div>
        )}
      </div>

      {/* Quick links — horizontal scroll on mobile */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Rychlý přístup</p>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible">
          {stats.map((p) => (
            <button
              key={p.projectId}
              onClick={() => navigate(`/core/administrace/projects/${p.projectId}/users`)}
              className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg hover:border-primary/40 active:bg-muted/40 transition-colors text-left shrink-0 min-w-[140px] sm:min-w-0"
            >
              <span className="text-xl shrink-0">{p.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">Uživatelé →</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
