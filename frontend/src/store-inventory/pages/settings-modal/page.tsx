import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Lock, Save, Trash2, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMe, updateMyProfile } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';
import {
  addMailAccount,
  deleteMailAccount,
  fetchMailAccounts,
  type BackendMailAccount,
} from '@/mail/services/backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toAbsoluteUrl } from '@/lib/helpers';

const AVATARS = [
  '/media/avatars/300-1.png',
  '/media/avatars/300-2.png',
  '/media/avatars/300-3.png',
  '/media/avatars/300-4.png',
  '/media/avatars/300-5.png',
  '/media/avatars/300-6.png',
  '/media/avatars/300-7.png',
  '/media/avatars/300-8.png',
  '/media/avatars/300-9.png',
];

function initials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}`.trim() || 'U';
}

export function SettingsModal() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarCustom, setAvatarCustom] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mailAccounts, setMailAccounts] = useState<BackendMailAccount[]>([]);
  const [mailAddress, setMailAddress] = useState('');
  const [loadingMailAccounts, setLoadingMailAccounts] = useState(false);
  const [savingMailAddress, setSavingMailAddress] = useState(false);
  const [deletingMailAccountId, setDeletingMailAccountId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchMe()
      .then((me) => {
        if (!active || !me) return;
        setFirstName(me.firstName ?? '');
        setLastName(me.lastName ?? '');
        setEmail(me.email ?? '');
        setRole(me.role ?? '');
        setAvatar(me.avatar ?? '');
        setAvatarCustom(me.avatar ?? '');
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-settings-modal',
          message: error instanceof Error ? error.message : 'Failed to load account settings',
          meta: { operation: 'fetch_me_settings_modal' },
        });
        toast.error('Nepodařilo se načíst nastavení účtu.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadMailAccounts = async () => {
    setLoadingMailAccounts(true);
    try {
      const rows = await fetchMailAccounts();
      setMailAccounts(Array.isArray(rows) ? rows : []);
    } catch (error) {
      logFrontendError({
        area: 'store-settings-modal',
        message: error instanceof Error ? error.message : 'Failed to load mail accounts',
        meta: { operation: 'fetch_mail_accounts_settings_modal' },
      });
      toast.error('Nepodařilo se načíst e-mailové adresy.');
    } finally {
      setLoadingMailAccounts(false);
    }
  };

  useEffect(() => {
    void loadMailAccounts();
  }, []);

  const avatarPreview = useMemo(() => {
    if (!avatar) return toAbsoluteUrl('/media/avatars/300-2.png');
    if (avatar.startsWith('/media/')) return toAbsoluteUrl(avatar);
    return avatar;
  }, [avatar]);

  const onSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Vyplň jméno i příjmení.');
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatar: avatar.trim() || undefined,
      });
      setFirstName(updated.firstName ?? '');
      setLastName(updated.lastName ?? '');
      setAvatar(updated.avatar ?? '');
      setAvatarCustom(updated.avatar ?? '');
      toast.success('Profil byl uložen.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Uložení profilu selhalo.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentPassword.trim()) {
      toast.error('Zadej současné heslo.');
      return;
    }
    if (newPassword.trim().length < 6) {
      toast.error('Nové heslo musí mít alespoň 6 znaků.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Nová hesla se neshodují.');
      return;
    }
    setSavingPassword(true);
    try {
      await updateMyProfile({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Heslo bylo změněno.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Změna hesla selhala.');
    } finally {
      setSavingPassword(false);
    }
  };

  const onAddMailAddress = async (event: FormEvent) => {
    event.preventDefault();
    const email = mailAddress.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Zadej platnou e-mailovou adresu.');
      return;
    }
    setSavingMailAddress(true);
    try {
      await addMailAccount({
        email,
        name: email.split('@')[0] || 'Mailbox',
      });
      setMailAddress('');
      await loadMailAccounts();
      window.dispatchEvent(new CustomEvent('mailAccountsChanged'));
      window.dispatchEvent(new CustomEvent('mailRefresh'));
      toast.success('E-mailová adresa byla přidána.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Přidání adresy selhalo.');
    } finally {
      setSavingMailAddress(false);
    }
  };

  const onRemoveMailAddress = async (id: string) => {
    setDeletingMailAccountId(id);
    try {
      await deleteMailAccount(id);
      await loadMailAccounts();
      window.dispatchEvent(new CustomEvent('mailAccountsChanged'));
      window.dispatchEvent(new CustomEvent('mailRefresh'));
      toast.success('E-mailová adresa byla odstraněna.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Odstranění adresy selhalo.');
    } finally {
      setDeletingMailAccountId(null);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">Načítám nastavení účtu...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle2 className="size-5" />
            Nastavení účtu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSaveProfile}>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Jméno</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Příjmení</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>E-mail</Label>
                <Input value={email} disabled />
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Input value={role} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avatar účtu</Label>
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarImage src={avatarPreview} alt="avatar" />
                  <AvatarFallback>{initials(firstName, lastName)}</AvatarFallback>
                </Avatar>
                <div className="text-sm text-muted-foreground">
                  Vyber avatar pro tento účet. Každý účet má vlastní avatar.
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {AVATARS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatar(item)}
                    className={`rounded-md border p-1 ${avatar === item ? 'border-primary ring-1 ring-primary/40' : 'border-border'}`}
                  >
                    <img src={toAbsoluteUrl(item)} alt={item} className="h-12 w-full rounded object-cover" />
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <Label>Vlastní URL avataru (volitelné)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="https://..."
                    value={avatarCustom}
                    onChange={(e) => setAvatarCustom(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAvatar(avatarCustom.trim())}
                  >
                    Použít
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={savingProfile}>
              <Save className="size-4" />
              {savingProfile ? 'Ukládám...' : 'Uložit profil'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Změna hesla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3 max-w-xl" onSubmit={onSavePassword}>
            <div className="space-y-1">
              <Label>Současné heslo</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Nové heslo</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Potvrdit nové heslo</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={savingPassword}>
              <Save className="size-4" />
              {savingPassword ? 'Ukládám...' : 'Změnit heslo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>E-mailové adresy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex gap-2" onSubmit={onAddMailAddress}>
            <Input
              placeholder="group@email.cz"
              value={mailAddress}
              onChange={(event) => setMailAddress(event.target.value)}
            />
            <Button type="submit" disabled={savingMailAddress}>
              {savingMailAddress ? 'Přidávám...' : 'Přidat'}
            </Button>
          </form>

          {loadingMailAccounts ? (
            <div className="text-sm text-muted-foreground">Načítám adresy...</div>
          ) : mailAccounts.length === 0 ? (
            <div className="text-sm text-muted-foreground">Zatím není přidaná žádná adresa.</div>
          ) : (
            <div className="space-y-2">
              {mailAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{account.email}</div>
                    <div className="text-xs text-muted-foreground truncate">{account.name}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deletingMailAccountId === account.id}
                    onClick={() => void onRemoveMailAddress(account.id)}
                  >
                    <Trash2 className="size-4" />
                    {deletingMailAccountId === account.id ? 'Mažu...' : 'Smazat'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
