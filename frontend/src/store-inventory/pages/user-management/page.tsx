import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Shield, ShieldCheck, UserPlus, UserRound, UserX } from 'lucide-react';
import { toast } from 'sonner';
import {
  type BackendModulesOverview,
  fetchMe,
  fetchModulesOverview,
  registerWithCredentials,
  toggleAllModulesEnabled,
  toggleModuleEnabled,
} from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type UserRole = 'admin' | 'manager' | 'agent';
type PermissionKey = 'orders' | 'products' | 'customers' | 'crm' | 'reports' | 'settings';

type ManagedUser = {
  id: string;
  backendUserId?: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: PermissionKey[];
  createdAt: string;
};

const STORAGE_KEY = 'core_user_roles_v2';
const APPS_STORAGE_KEY = 'core_apps_enabled_v1';
const CORE_USERS_CHANGED_EVENT = 'core-users:changed';

const roleLabel: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Správce',
  agent: 'Uživatel',
};

const permissionOptions: Array<{ key: PermissionKey; label: string }> = [
  { key: 'orders', label: 'Objednávky' },
  { key: 'products', label: 'Produkty' },
  { key: 'customers', label: 'Zákazníci' },
  { key: 'crm', label: 'CRM' },
  { key: 'reports', label: 'Reporty' },
  { key: 'settings', label: 'Nastavení' },
];

function readUsers(): ManagedUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ManagedUser[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.email && item?.id);
  } catch {
    return [];
  }
}

function persistUsers(users: ManagedUser[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent(CORE_USERS_CHANGED_EVENT, { detail: users }));
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const cleaned = fullName.trim();
  if (!cleaned) return { firstName: '', lastName: '' };
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

export function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>(() => readUsers());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [permissions, setPermissions] = useState<PermissionKey[]>(['crm', 'customers']);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [modulesOverview, setModulesOverview] = useState<BackendModulesOverview | null>(null);
  const [modulesLoading, setModulesLoading] = useState(false);

  const isAdmin = currentUserRole.toLowerCase() === 'admin';

  const syncModuleStateToSidebar = (moduleId: string, enabled: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const current = window.localStorage.getItem(APPS_STORAGE_KEY);
      const parsed = current ? (JSON.parse(current) as Record<string, boolean>) : {};
      const next = { ...parsed, [moduleId]: enabled };
      window.localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('core-apps:changed', { detail: next }));
    } catch {
      // ignore localstorage sync errors
    }
  };

  const loadModulesOverview = async () => {
    setModulesLoading(true);
    try {
      const response = await fetchModulesOverview();
      setModulesOverview(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nepodařilo se načíst přehled modulů.';
      toast.error(message);
    } finally {
      setModulesLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchMe()
      .then((me) => {
        if (!mounted) return;
        setCurrentUserRole(me?.role ?? '');
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-user-management',
          message: error instanceof Error ? error.message : 'Failed to fetch current user in user management',
          meta: { operation: 'fetch_me' },
        });
        if (mounted) setCurrentUserRole('');
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void loadModulesOverview();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setInterval(() => {
      void loadModulesOverview();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [isAdmin]);

  const counts = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.role === 'admin').length,
      manager: users.filter((u) => u.role === 'manager').length,
      agent: users.filter((u) => u.role === 'agent').length,
    };
  }, [users]);

  const upsertUsers = (next: ManagedUser[]) => {
    setUsers(next);
    persistUsers(next);
  };

  const onTogglePermission = (key: PermissionKey, checked: boolean) => {
    setPermissions((prev) => {
      if (checked) return prev.includes(key) ? prev : [...prev, key];
      return prev.filter((item) => item !== key);
    });
  };

  const onAddUser = async (event: FormEvent) => {
    event.preventDefault();

    if (!isAdmin) {
      toast.error('Pouze admin může přidávat nové účty.');
      return;
    }

    const safeName = name.trim();
    const safeEmail = email.trim().toLowerCase();
    const safePassword = password.trim();

    if (!safeName || !safeEmail) {
      toast.error('Vyplň jméno i e-mail.');
      return;
    }
    if (!safeEmail.includes('@')) {
      toast.error('Neplatný e-mail.');
      return;
    }
    if (safePassword.length < 6) {
      toast.error('Heslo musí mít alespoň 6 znaků.');
      return;
    }
    if (safePassword !== passwordConfirm.trim()) {
      toast.error('Hesla se neshodují.');
      return;
    }
    if (users.some((u) => u.email === safeEmail)) {
      toast.error('Uživatel už existuje v lokálním přehledu.');
      return;
    }

    const { firstName, lastName } = splitName(safeName);
    if (!firstName || !lastName) {
      toast.error('Zadej jméno i příjmení.');
      return;
    }

    setIsSubmitting(true);
    try {
      const registration = await registerWithCredentials({
        email: safeEmail,
        password: safePassword,
        firstName,
        lastName,
        role,
      });

      const next: ManagedUser[] = [
        {
          id: registration?.user?.id || crypto.randomUUID(),
          backendUserId: registration?.user?.id || undefined,
          name: safeName,
          email: safeEmail,
          role,
          permissions,
          createdAt: new Date().toISOString(),
        },
        ...users,
      ];
      upsertUsers(next);

      setName('');
      setEmail('');
      setRole('manager');
      setPermissions(['crm', 'customers']);
      setPassword('');
      setPasswordConfirm('');
      toast.success('Uživatel vytvořen. Může se přihlásit.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Vytvoření uživatele selhalo.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChangeRole = (id: string, nextRole: UserRole) => {
    if (!isAdmin) return;
    const next = users.map((user) => (user.id === id ? { ...user, role: nextRole } : user));
    upsertUsers(next);
  };

  const onDelete = (id: string) => {
    if (!isAdmin) return;
    const next = users.filter((user) => user.id !== id);
    upsertUsers(next);
    toast.success('Uživatel odebrán z lokálního přehledu.');
  };

  const onToggleModule = async (moduleId: string, current: boolean) => {
    const next = !current;
    try {
      await toggleModuleEnabled(moduleId, next);
      syncModuleStateToSidebar(moduleId, next);
      setModulesOverview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((item) =>
            item.id === moduleId
              ? {
                ...item,
                isEnabled: next,
                runtimeStatus: next ? (item.runtimeStatus === 'chyba' ? 'chyba' : 'bezi') : 'vypnuto',
              }
              : item,
          ),
          totals: {
            ...prev.totals,
            enabled: prev.modules.filter((m) => (m.id === moduleId ? next : m.isEnabled)).length,
            disabled: prev.modules.filter((m) => !(m.id === moduleId ? next : m.isEnabled)).length,
          },
        };
      });
      toast.success(`Modul byl ${next ? 'zapnut' : 'vypnut'}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Změna stavu modulu selhala.';
      toast.error(message);
    }
  };

  const onToggleAllModules = async (enabled: boolean) => {
    try {
      await toggleAllModulesEnabled(enabled);
      if (modulesOverview) {
        for (const module of modulesOverview.modules) {
          syncModuleStateToSidebar(module.id, enabled);
        }
      }
      await loadModulesOverview();
      toast.success(enabled ? 'Všechny moduly zapnuty.' : 'Všechny moduly vypnuty.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hromadná změna modulů selhala.';
      toast.error(message);
    }
  };

  if (authLoading) {
    return (
      <div className="container-fluid">
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">Ověřuji oprávnění...</CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container-fluid">
        <Card>
          <CardHeader>
            <CardTitle>Správa uživatelů a rolí</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Přístup má pouze role admin.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid space-y-5">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Přehled modulů a modelů</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void onToggleAllModules(true)} disabled={modulesLoading}>
              Zapnout vše
            </Button>
            <Button variant="outline" size="sm" onClick={() => void onToggleAllModules(false)} disabled={modulesLoading}>
              Vypnout vše
            </Button>
            <Button variant="outline" size="sm" onClick={() => void loadModulesOverview()} disabled={modulesLoading}>
              {modulesLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Obnovit stav
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {modulesOverview ? (
            <>
              <p className="text-xs text-muted-foreground">
                Automatická obnova: každých 15 s | Poslední kontrola:{' '}
                {new Date(modulesOverview.checkedAt).toLocaleString('cs-CZ')}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
                <Badge variant="outline" className="justify-start p-2">Moduly: {modulesOverview.totals.modules}</Badge>
                <Badge variant="outline" className="justify-start p-2">Zapnuto: {modulesOverview.totals.enabled}</Badge>
                <Badge variant="outline" className="justify-start p-2">Běží: {modulesOverview.totals.running}</Badge>
                <Badge variant="outline" className="justify-start p-2">Chyba: {modulesOverview.totals.errors}</Badge>
                <Badge variant="outline" className="justify-start p-2">Vypnuto: {modulesOverview.totals.disabled}</Badge>
                <Badge variant="outline" className="justify-start p-2">Modely: {modulesOverview.totals.prismaModels}</Badge>
              </div>

              <div className="space-y-2">
                {modulesOverview.modules.map((item) => (
                  <div key={item.id} className="border rounded-md p-3 flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.path}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <Badge variant="outline" size="sm">
                          Stav: {item.runtimeStatus === 'bezi' ? 'Běží' : item.runtimeStatus === 'vypnuto' ? 'Vypnuto' : 'Chyba'}
                        </Badge>
                        <Badge variant="outline" size="sm">Modelů: {item.models.length}</Badge>
                        <Badge variant="outline" size="sm">API: {item.health?.api?.status === 'error' ? 'Chyba' : 'OK'}</Badge>
                        <Badge variant="outline" size="sm">DB: {item.health?.db?.status === 'error' ? 'Chyba' : 'OK'}</Badge>
                      </div>
                      {item.health?.lastError ? (
                        <div className="text-xs text-red-600">
                          Poslední chyba: {item.health.lastError.message} ({new Date(item.health.lastError.createdAt).toLocaleString('cs-CZ')})
                        </div>
                      ) : null}
                    </div>
                    <Switch checked={item.isEnabled} onCheckedChange={() => void onToggleModule(item.id, item.isEnabled)} />
                  </div>
                ))}
              </div>

              <div className="border rounded-md">
                <div className="px-3 py-2 border-b text-sm font-medium">Všechny modely (Prisma)</div>
                <div className="max-h-72 overflow-auto divide-y">
                  {modulesOverview.models.map((model) => (
                    <div key={model.model} className="px-3 py-2 flex items-center justify-between gap-2 text-sm">
                      <span className="font-mono">{model.model}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">
                          {model.status === 'ok' ? 'OK' : 'Chyba'}
                        </Badge>
                        <span className="text-muted-foreground">{model.count ?? '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {modulesLoading ? 'Načítám přehled modulů...' : 'Přehled zatím není načtený.'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Správa uživatelů a rolí</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Badge variant="outline" className="justify-start gap-1.5 p-2"><UserRound className="size-4" /> Celkem: {counts.total}</Badge>
          <Badge variant="outline" className="justify-start gap-1.5 p-2"><ShieldCheck className="size-4" /> Admin: {counts.admin}</Badge>
          <Badge variant="outline" className="justify-start gap-1.5 p-2"><Shield className="size-4" /> Správce: {counts.manager}</Badge>
          <Badge variant="outline" className="justify-start gap-1.5 p-2"><UserRound className="size-4" /> Uživatel: {counts.agent}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Přidat uživatele</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddUser} className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Jméno a příjmení</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jan Novák" />
            </div>
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jan@firma.cz" />
            </div>
            <div className="space-y-1">
              <Label>Heslo</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 znaků" />
            </div>
            <div className="space-y-1">
              <Label>Potvrdit heslo</Label>
              <Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Zopakuj heslo" />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Správce</SelectItem>
                  <SelectItem value="agent">Uživatel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Oprávnění</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {permissionOptions.map((option) => (
                  <label key={option.key} className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm">
                    <Checkbox
                      checked={permissions.includes(option.key)}
                      onCheckedChange={(checked) => onTogglePermission(option.key, Boolean(checked))}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                <UserPlus className="size-4" />
                {isSubmitting ? 'Vytvářím účet...' : 'Přidat'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seznam uživatelů</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zatím není přidaný žádný uživatel.</p>
          ) : (
            users.map((item) => (
              <div key={item.id} className="grid md:grid-cols-5 gap-2 items-center border rounded-md p-3">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground truncate">{item.email}</div>
                <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('cs-CZ')}</div>
                <div className="space-y-2">
                  <Select value={item.role} onValueChange={(value) => onChangeRole(item.id, value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue>{roleLabel[item.role]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Správce</SelectItem>
                      <SelectItem value="agent">Uživatel</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {item.permissions?.length
                      ? item.permissions.map((permission) => (
                        <Badge key={`${item.id}-${permission}`} variant="outline" size="sm">
                          {permissionOptions.find((option) => option.key === permission)?.label ?? permission}
                        </Badge>
                      ))
                      : <span className="text-xs text-muted-foreground">Bez oprávnění</span>}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                    <UserX className="size-4" />
                    Odebrat
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
