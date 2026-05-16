import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, RefreshCw, ArrowLeft, UserX, UserCheck, Trash2,
  ChevronLeft, ChevronRight, CreditCard, Edit3, MoreVertical, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type AdminUser,
  type AdminUsersResponse,
  type AdminProjectStats,
  fetchAdminProjectStats,
  fetchAdminProjectUsers,
  adminBlockUser,
  adminUnblockUser,
  adminDeleteUser,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string | undefined | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: '2-digit' });
}

function planBadge(user: AdminUser) {
  const blocked = user.role === 'blocked' || user.status === 'blocked';
  if (blocked) return <Badge variant="destructive" className="text-[10px]">Blokován</Badge>;
  const plan = user.subscription?.plan ?? user.plan ?? 'free';
  if (plan !== 'free') return <Badge className="bg-emerald-600 text-white text-[10px]">{plan}</Badge>;
  return <Badge variant="outline" className="text-[10px]">Free</Badge>;
}

function activityText(user: AdminUser): string {
  if (user.testCount != null) return `${user.testCount} testů`;
  if (user.resumeCount != null) return `${user.resumeCount} CV`;
  if (user.feedCount != null) return `${user.feedCount} feedů`;
  if (user.tenantCount != null) return `${user.tenantCount} webů`;
  return '';
}

// ── Mobile user card ──────────────────────────────────────────────────────────

function UserCard({
  user,
  projectId,
  onBlock,
  onDelete,
  onView,
  onEdit,
  onSub,
  loading,
}: {
  user: AdminUser;
  projectId: string;
  onBlock: () => void;
  onDelete: () => void;
  onView: () => void;
  onEdit: () => void;
  onSub: () => void;
  loading: boolean;
}) {
  const isBlocked = user.role === 'blocked' || user.status === 'blocked';

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 flex items-start gap-3">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
        {user.email.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{user.email}</p>
        {user.name && <p className="text-xs text-muted-foreground truncate">{user.name}</p>}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {planBadge(user)}
          <span className="text-[10px] text-muted-foreground">{fmtDate(user.createdAt)}</span>
          {activityText(user) && (
            <span className="text-[10px] text-muted-foreground">· {activityText(user)}</span>
          )}
        </div>
      </div>

      {/* Action menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading} className="h-8 w-8 shrink-0">
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MoreVertical className="w-3.5 h-3.5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={onView}>
            <Eye className="w-3.5 h-3.5 mr-2" /> Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit3 className="w-3.5 h-3.5 mr-2" /> Upravit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSub}>
            <CreditCard className="w-3.5 h-3.5 mr-2" /> Předplatné
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onBlock}>
            {isBlocked
              ? <><UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" /><span className="text-emerald-600">Odblokovat</span></>
              : <><UserX className="w-3.5 h-3.5 mr-2 text-amber-600" /><span className="text-amber-600">Blokovat</span></>
            }
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Smazat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Desktop table row ─────────────────────────────────────────────────────────

function UserTableRow({
  user,
  projectId,
  onBlock,
  onDelete,
  onView,
  onEdit,
  onSub,
  loading,
}: {
  user: AdminUser;
  projectId: string;
  onBlock: () => void;
  onDelete: () => void;
  onView: () => void;
  onEdit: () => void;
  onSub: () => void;
  loading: boolean;
}) {
  const isBlocked = user.role === 'blocked' || user.status === 'blocked';

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium">{user.email}</p>
          {user.name && <p className="text-xs text-muted-foreground">{user.name}</p>}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{user.role}</span>
      </td>
      <td className="px-4 py-3">{planBadge(user)}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(user.createdAt)}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{activityText(user)}</td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={loading} className="h-7 w-7">
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MoreVertical className="w-3.5 h-3.5" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onView}><Eye className="w-4 h-4 mr-2" /> Detail</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}><Edit3 className="w-4 h-4 mr-2" /> Upravit</DropdownMenuItem>
            <DropdownMenuItem onClick={onSub}><CreditCard className="w-4 h-4 mr-2" /> Předplatné</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onBlock}>
              {isBlocked
                ? <><UserCheck className="w-4 h-4 mr-2 text-emerald-600" /><span className="text-emerald-600">Odblokovat</span></>
                : <><UserX className="w-4 h-4 mr-2 text-amber-600" /><span className="text-amber-600">Blokovat</span></>
              }
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Smazat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectUsersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [projectInfo, setProjectInfo] = useState<AdminProjectStats | null>(null);
  const [usersData, setUsersData] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const LIMIT = 20;

  const loadUsers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [info, users] = await Promise.all([
        fetchAdminProjectStats(projectId),
        fetchAdminProjectUsers(projectId, { page, limit: LIMIT, search, role: roleFilter || undefined }),
      ]);
      setProjectInfo(info as unknown as AdminProjectStats);
      setUsersData(users);
    } catch (err: any) {
      toast.error('Chyba: ' + (err?.message ?? 'Neznámá'));
    } finally {
      setLoading(false);
    }
  }, [projectId, page, search, roleFilter]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const handleBlock = async (user: AdminUser) => {
    if (!projectId) return;
    setActionLoading(user.id);
    try {
      const isBlocked = user.role === 'blocked' || user.status === 'blocked';
      if (isBlocked) {
        await adminUnblockUser(projectId, user.id);
        toast.success('Odblokováno');
      } else {
        await adminBlockUser(projectId, user.id);
        toast.success('Blokováno');
      }
      await loadUsers();
    } catch { toast.error('Akce se nezdařila'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!projectId || !deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      await adminDeleteUser(projectId, deleteTarget.id);
      toast.success('Smazáno');
      setDeleteTarget(null);
      await loadUsers();
    } catch { toast.error('Smazání se nezdařilo'); }
    finally { setActionLoading(null); }
  };

  const totalPages = usersData ? Math.ceil(usersData.total / LIMIT) : 1;
  const project = projectInfo as any;
  const users = usersData?.users ?? [];

  const userActions = (user: AdminUser) => ({
    onView: () => navigate(`/core/administrace/projects/${projectId}/users/${user.id}`),
    onEdit: () => navigate(`/core/administrace/projects/${projectId}/users/${user.id}/edit`),
    onSub: () => navigate(`/core/administrace/projects/${projectId}/users/${user.id}/subscription`),
    onBlock: () => handleBlock(user),
    onDelete: () => setDeleteTarget(user),
    loading: actionLoading === user.id,
  });

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate('/core/administrace')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          {project?.icon && <span className="text-xl">{project.icon}</span>}
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate">{project?.name ?? projectId}</h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">{project?.domain}</p>
          </div>
        </div>
      </div>

      {/* Stats chips — horizontal scroll on mobile */}
      {project?.stats && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: 'Uživatelů', value: project.stats.totalUsers },
            { label: 'Předplatitelů', value: project.stats.activeSubscriptions ?? project.stats.activeTenants ?? project.stats.paidTenants },
            { label: 'MRR', value: project.stats.mrr != null ? `$${project.stats.mrr}` : null },
            { label: 'Nových/měsíc', value: project.stats.newUsersMonth },
            { label: 'Testů', value: project.stats.totalTests },
            { label: 'CV/Feedů', value: project.stats.totalResumes ?? project.stats.totalFeeds },
          ].filter((s) => s.value != null).map((s) => (
            <div key={s.label} className="shrink-0 bg-card border border-border rounded-lg px-3 py-2 text-center min-w-[80px]">
              <p className="text-sm font-bold">
                {typeof s.value === 'number' ? s.value.toLocaleString('cs-CZ') : s.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Hledat…"
            className="pl-9 h-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-2 text-xs sm:text-sm shrink-0"
        >
          <option value="">Všechny</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super</option>
        </select>
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* MOBILE: card list */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Žádní uživatelé</div>
        ) : (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              projectId={projectId!}
              {...userActions(user)}
            />
          ))
        )}
      </div>

      {/* DESKTOP: table */}
      <div className="hidden sm:block bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Uživatel</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Plán</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Registrován</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Aktivita</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    Žádní uživatelé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    projectId={projectId!}
                    {...userActions(user)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData && usersData.total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, usersData.total)} z {usersData.total.toLocaleString('cs-CZ')}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs px-2">{page} / {totalPages}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile pagination */}
      {usersData && usersData.total > LIMIT && (
        <div className="sm:hidden flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, usersData.total)} z {usersData.total.toLocaleString('cs-CZ')}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs px-2">{page}/{totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="mx-4 rounded-xl sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat uživatele?</AlertDialogTitle>
            <AlertDialogDescription>
              Nevratná akce. Smaže <strong>{deleteTarget?.email}</strong> a veškerá data z <strong>{projectId}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
