import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, UserX, UserCheck, CreditCard,
  Trash2, Mail, Calendar, Edit3, Save, X, Check, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type AdminUser,
  fetchAdminUser,
  adminBlockUser,
  adminUnblockUser,
  adminUpdateUser,
  adminSetSubscription,
  adminCancelSubscription,
  adminDeleteUser,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtDateShort(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('cs-CZ');
}

const PLAN_OPTIONS = ['free', 'basic', 'pro', 'premium', 'enterprise'];
const STATUS_OPTIONS = ['active', 'cancelled', 'trialing', 'past_due'];
const ROLE_OPTIONS = [
  { value: 'USER', label: 'Uživatel' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'user', label: 'Uživatel' },
  { value: 'admin', label: 'Admin' },
];

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditUserForm({ user, projectId, onSave, onCancel }: {
  user: AdminUser; projectId: string; onSave: () => void; onCancel: () => void;
}) {
  const [name, setName] = useState(user.name ?? '');
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateUser(projectId, user.id, { name, email, role });
      toast.success('Uloženo');
      onSave();
    } catch { toast.error('Uložení selhalo'); }
    finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Edit3 className="w-4 h-4" /> Upravit uživatele
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Jméno</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">E-mail</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-1">
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Uložit
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel} className="gap-1.5">
            <X className="w-3.5 h-3.5" /> Zrušit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Subscription form ─────────────────────────────────────────────────────────

function SubscriptionForm({ user, projectId, onSave }: {
  user: AdminUser; projectId: string; onSave: () => void;
}) {
  const [plan, setPlan] = useState(user.subscription?.plan ?? 'basic');
  const [status, setStatus] = useState(user.subscription?.status ?? 'active');
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSetSubscription(projectId, user.id, { plan, status });
      toast.success('Předplatné nastaveno');
      onSave();
    } catch { toast.error('Selhalo'); }
    finally { setSaving(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await adminCancelSubscription(projectId, user.id);
      toast.success('Předplatné zrušeno');
      onSave();
    } catch { toast.error('Selhalo'); }
    finally { setCancelling(false); }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Předplatné
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {user.subscription && (
          <div className="p-2.5 bg-muted rounded-lg text-xs space-y-1">
            <p><span className="text-muted-foreground">Plán:</span> <strong>{user.subscription.plan}</strong></p>
            <p><span className="text-muted-foreground">Status:</span> <strong>{user.subscription.status}</strong></p>
            {user.subscription.stripeCurrentPeriodEnd && (
              <p><span className="text-muted-foreground">Platnost do:</span> {fmtDate(user.subscription.stripeCurrentPeriodEnd)}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Plán</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Nastavit
          </Button>
          {user.subscription && (
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelling}
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
              {cancelling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              Zrušit předplatné
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function UserDetailPage() {
  const { projectId, userId } = useParams<{ projectId: string; userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId || !userId) return;
    setLoading(true);
    try {
      const u = await fetchAdminUser(projectId, userId);
      setUser(u);
    } catch (err: any) {
      toast.error('Nelze načíst uživatele');
    } finally { setLoading(false); }
  }, [projectId, userId]);

  useEffect(() => { void load(); }, [load]);

  const handleBlock = async () => {
    if (!projectId || !userId || !user) return;
    setActionLoading(true);
    try {
      const isBlocked = user.role === 'blocked' || user.status === 'blocked';
      if (isBlocked) { await adminUnblockUser(projectId, userId); toast.success('Odblokováno'); }
      else { await adminBlockUser(projectId, userId); toast.success('Blokováno'); }
      await load();
    } catch { toast.error('Selhalo'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!projectId || !userId) return;
    setActionLoading(true);
    try {
      await adminDeleteUser(projectId, userId);
      toast.success('Smazáno');
      navigate(`/core/administrace/projects/${projectId}/users`);
    } catch { toast.error('Selhalo'); }
    finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6 space-y-3 max-w-2xl mx-auto">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-36 rounded-xl bg-muted animate-pulse" />
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Uživatel nenalezen</p>
      </div>
    );
  }

  const isBlocked = user.role === 'blocked' || user.status === 'blocked';
  const userData = user as any;

  return (
    <div className="p-3 sm:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
          onClick={() => navigate(`/core/administrace/projects/${projectId}/users`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-bold truncate">{user.email}</h1>
          <p className="text-[11px] text-muted-foreground">{projectId}</p>
        </div>
      </div>

      {/* User card */}
      <Card>
        <CardContent className="pt-4 pb-4">
          {/* Avatar + info */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-sm sm:text-base truncate">{user.name || user.email.split('@')[0]}</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>{fmtDate(user.createdAt)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="secondary" className="text-[10px]">{user.role}</Badge>
                {isBlocked
                  ? <Badge variant="destructive" className="text-[10px]">Blokován</Badge>
                  : user.subscription?.status === 'active'
                    ? <Badge className="bg-emerald-600 text-white text-[10px]">{user.subscription.plan}</Badge>
                    : <Badge variant="outline" className="text-[10px]">Free</Badge>
                }
              </div>
            </div>
          </div>

          {/* Quick stats */}
          {(user.testCount != null || user.resumeCount != null || user.feedCount != null || user.tenantCount != null) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border">
              {[
                { label: 'Testů', value: user.testCount },
                { label: 'CV', value: user.resumeCount },
                { label: 'Feedů', value: user.feedCount },
                { label: 'Webů', value: user.tenantCount },
              ].filter((s) => s.value != null).map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-base font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons — 2x2 grid on mobile */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto"
          onClick={() => { setShowEdit(!showEdit); setShowSub(false); }}>
          <Edit3 className="w-3.5 h-3.5" /> {showEdit ? 'Zavřít' : 'Upravit'}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto"
          onClick={() => { setShowSub(!showSub); setShowEdit(false); }}>
          <CreditCard className="w-3.5 h-3.5" /> {showSub ? 'Zavřít' : 'Předplatné'}
        </Button>
        <Button
          variant={isBlocked ? 'default' : 'outline'} size="sm"
          onClick={handleBlock} disabled={actionLoading}
          className={`gap-1.5 w-full sm:w-auto ${isBlocked ? '' : 'text-amber-600 border-amber-200 hover:bg-amber-50'}`}
        >
          {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            : isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
          {isBlocked ? 'Odblokovat' : 'Blokovat'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDeleteDialog(true)}
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto">
          <Trash2 className="w-3.5 h-3.5" /> Smazat
        </Button>
      </div>

      {/* Edit form */}
      {showEdit && (
        <EditUserForm user={user} projectId={projectId!}
          onSave={() => { setShowEdit(false); void load(); }}
          onCancel={() => setShowEdit(false)} />
      )}

      {/* Subscription form */}
      {showSub && (
        <SubscriptionForm user={user} projectId={projectId!}
          onSave={() => { setShowSub(false); void load(); }} />
      )}

      {/* Current subscription info */}
      {user.subscription && !showSub && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Aktuální předplatné
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground">Plán</p>
                <p className="font-medium capitalize">{user.subscription.plan}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Status</p>
                <p className="font-medium">{user.subscription.status}</p>
              </div>
              {user.subscription.stripeCurrentPeriodEnd && (
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground">Platnost do</p>
                  <p className="font-medium">{fmtDate(user.subscription.stripeCurrentPeriodEnd)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test results */}
      {userData.testResults?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Výsledky testů</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {userData.testResults.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <span className="text-sm truncate">{t.testType}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {t.score != null && <span className="text-sm font-bold">{t.score}</span>}
                  <span className="text-[10px] text-muted-foreground">{fmtDateShort(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resumes */}
      {userData.resumes?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">CV dokumenty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {userData.resumes.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <span className="text-sm truncate">{r.name}</span>
                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">{r.template}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Feeds */}
      {userData.feeds?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Feedy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {userData.feeds.map((f: any) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <span className="text-sm truncate">{f.name}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{f.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tenants */}
      {userData.tenants?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weby / Tenanti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {userData.tenants.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.slug}</p>
                  {t.template_name && <p className="text-[10px] text-muted-foreground">{t.template_name}</p>}
                </div>
                <Badge variant={t.status === 'active' ? 'outline' : 'secondary'} className="text-[10px] shrink-0 ml-2">
                  {t.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payments */}
      {userData.payments?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Platby</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {userData.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.description ?? p.type ?? 'Platba'}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtDateShort(p.createdAt ?? p.created_at)}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm font-bold">
                    {p.amount != null ? `${(p.amount / 100).toFixed(0)} ${p.currency ?? 'CZK'}` : '—'}
                  </p>
                  <Badge variant={p.status === 'paid' ? 'outline' : 'secondary'} className="text-[10px]">
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Delete dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="mx-4 rounded-xl sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat uživatele?</AlertDialogTitle>
            <AlertDialogDescription>
              Nevratná akce. Smaže <strong>{user.email}</strong> a veškerá data.
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
