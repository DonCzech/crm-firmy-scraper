import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CircleCheck, CircleX, Loader2, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  addMailAccount,
  fetchMailAccounts,
  testMailAccountConnection,
  updateMailAccount,
  type BackendMailAccount,
} from '../../services/backend';
import { getSelectedMailAccountEmail, setSelectedMailAccountEmail } from '../../utils/account-selection';

type Props = {
  triggerClassName?: string;
  label?: string;
  trigger?: ReactNode;
};

const NEW_ACCOUNT_VALUE = '__new__';

export function AccountSettingsDialog({ triggerClassName, label, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [accounts, setAccounts] = useState<BackendMailAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(NEW_ACCOUNT_VALUE);
  const [connectionType, setConnectionType] = useState<'imap' | 'pop3'>('imap');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [imapSecure, setImapSecure] = useState(true);
  const [imapUsername, setImapUsername] = useState('');
  const [imapPassword, setImapPassword] = useState('');

  const [pop3Host, setPop3Host] = useState('');
  const [pop3Port, setPop3Port] = useState('995');
  const [pop3Secure, setPop3Secure] = useState(true);
  const [pop3Username, setPop3Username] = useState('');
  const [pop3Password, setPop3Password] = useState('');

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  const isEditingExisting = selectedAccountId !== NEW_ACCOUNT_VALUE;
  const selectedAccount = useMemo(
    () => accounts.find((item) => item.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );

  const resetForm = () => {
    setConnectionType('imap');
    setName('');
    setEmail('');
    setAvatar('');
    setImapHost('');
    setImapPort('993');
    setImapSecure(true);
    setImapUsername('');
    setImapPassword('');
    setPop3Host('');
    setPop3Port('995');
    setPop3Secure(true);
    setPop3Username('');
    setPop3Password('');
    setSmtpHost('');
    setSmtpPort('587');
    setSmtpSecure(false);
    setSmtpUsername('');
    setSmtpPassword('');
  };

  const applyAccountToForm = useCallback((account: BackendMailAccount | null) => {
    if (!account) {
      resetForm();
      return;
    }
    setName(account.name || '');
    setEmail(account.email || '');
    setAvatar(account.avatar || '');

    const hasPop3 = Boolean(account.pop3Host || account.pop3Username || account.pop3Password);
    const nextType: 'imap' | 'pop3' = hasPop3 ? 'pop3' : 'imap';
    setConnectionType(nextType);

    setImapHost(account.imapHost || '');
    setImapPort(account.imapPort ? String(account.imapPort) : '993');
    setImapSecure(account.imapSecure ?? true);
    setImapUsername(account.imapUsername || '');
    setImapPassword(account.imapPassword || '');

    setPop3Host(account.pop3Host || '');
    setPop3Port(account.pop3Port ? String(account.pop3Port) : '995');
    setPop3Secure(account.pop3Secure ?? true);
    setPop3Username(account.pop3Username || '');
    setPop3Password(account.pop3Password || '');

    setSmtpHost(account.smtpHost || '');
    setSmtpPort(account.smtpPort ? String(account.smtpPort) : '587');
    setSmtpSecure(account.smtpSecure ?? false);
    setSmtpUsername(account.smtpUsername || '');
    setSmtpPassword(account.smtpPassword || '');
  }, []);

  const loadAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const rows = await fetchMailAccounts();
      const nextAccounts = Array.isArray(rows) ? rows : [];
      setAccounts(nextAccounts);

      const selectedEmail = getSelectedMailAccountEmail();
      const preferred = selectedEmail
        ? nextAccounts.find((item) => item.email.toLowerCase() === selectedEmail.toLowerCase())
        : null;
      const fallback = preferred ?? nextAccounts[0] ?? null;
      if (fallback) {
        setSelectedAccountId(fallback.id);
        applyAccountToForm(fallback);
      } else {
        setSelectedAccountId(NEW_ACCOUNT_VALUE);
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Načtení účtů selhalo.');
    } finally {
      setLoadingAccounts(false);
    }
  }, [applyAccountToForm]);

  useEffect(() => {
    if (!open) return;
    void loadAccounts();
  }, [loadAccounts, open]);

  const onSelectAccount = (value: string) => {
    setSelectedAccountId(value);
    if (value === NEW_ACCOUNT_VALUE) {
      resetForm();
      return;
    }
    const account = accounts.find((item) => item.id === value) ?? null;
    applyAccountToForm(account);
  };

  const onSave = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Zadejte platný e-mail.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
        avatar: avatar.trim() || undefined,
        imapHost: connectionType === 'imap' ? imapHost.trim() || undefined : undefined,
        imapPort: connectionType === 'imap' ? Number(imapPort) || undefined : undefined,
        imapSecure: connectionType === 'imap' ? imapSecure : undefined,
        imapUsername: connectionType === 'imap' ? imapUsername.trim() || undefined : undefined,
        imapPassword: connectionType === 'imap' ? imapPassword || undefined : undefined,
        pop3Host: connectionType === 'pop3' ? pop3Host.trim() || undefined : undefined,
        pop3Port: connectionType === 'pop3' ? Number(pop3Port) || undefined : undefined,
        pop3Secure: connectionType === 'pop3' ? pop3Secure : undefined,
        pop3Username: connectionType === 'pop3' ? pop3Username.trim() || undefined : undefined,
        pop3Password: connectionType === 'pop3' ? pop3Password || undefined : undefined,
        smtpHost: smtpHost.trim() || undefined,
        smtpPort: Number(smtpPort) || undefined,
        smtpSecure,
        smtpUsername: smtpUsername.trim() || undefined,
        smtpPassword: smtpPassword || undefined,
      };

      const saved = isEditingExisting && selectedAccount
        ? await updateMailAccount(selectedAccount.id, payload)
        : await addMailAccount(payload);

      setSelectedMailAccountEmail(saved.email);
      window.dispatchEvent(new CustomEvent('mailAccountsChanged'));
      window.dispatchEvent(new CustomEvent('mailRefresh'));
      toast.success(isEditingExisting ? 'Nastavení účtu bylo uloženo.' : 'E-mail účet byl přidán.');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Uložení účtu selhalo.');
    } finally {
      setSaving(false);
    }
  };

  const onTestConnection = async () => {
    if (!selectedAccount?.id) {
      toast.error('Nejprve ulož účet, potom lze testovat spojení.');
      return;
    }
    setTestingConnection(true);
    try {
      const result = await testMailAccountConnection(selectedAccount.id);
      const inboundLabel = result.inbound.protocol.toUpperCase();
      if (!result.inbound.ok) {
        toast.error(`${inboundLabel}: ${result.inbound.message}`);
      } else {
        toast.success(`${inboundLabel}: připojení je v pořádku.`);
      }
      if (!result.smtp.ok) {
        toast.error(`SMTP: ${result.smtp.message}`);
      } else {
        toast.success('SMTP: připojení je v pořádku.');
      }
      if (!result.ok) {
        toast.error('Test spojení odhalil chybu. Zkontroluj heslo/host/port/secure.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Test spojení selhal.');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (label ? (
          <Button variant="ghost" className={triggerClassName} title="Správa e-mailových účtů">
            <Plus />
            <span className="ps-1.5">{label}</span>
          </Button>
        ) : (
          <Button variant="ghost" mode="icon" className={triggerClassName} title="Správa e-mailových účtů">
            <Settings />
          </Button>
        ))}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditingExisting ? 'Nastavení e-mailového účtu' : 'Nový e-mail účet'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-auto pr-1">
          <div className="space-y-2 md:col-span-2">
            <Label>Spravovaný účet</Label>
            <Select value={selectedAccountId} onValueChange={onSelectAccount} disabled={loadingAccounts}>
              <SelectTrigger>
                <SelectValue placeholder={loadingAccounts ? 'Načítám účty...' : 'Vyber účet'} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.email}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_ACCOUNT_VALUE}>+ Přidat nový účet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Název</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Např. Obchod" />
          </div>
          <div className="space-y-2">
            <Label>E-mail adresa</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@firma.cz"
              disabled={isEditingExisting}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Avatar URL (volitelné)</Label>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Typ připojení</Label>
            <div className="inline-flex rounded-md border p-1 gap-1 w-fit">
              <Button
                type="button"
                size="sm"
                variant={connectionType === 'imap' ? 'default' : 'ghost'}
                onClick={() => setConnectionType('imap')}
              >
                IMAP
              </Button>
              <Button
                type="button"
                size="sm"
                variant={connectionType === 'pop3' ? 'default' : 'ghost'}
                onClick={() => setConnectionType('pop3')}
              >
                POP3
              </Button>
            </div>
          </div>

          {connectionType === 'imap' ? (
            <>
              <div className="md:col-span-2 font-medium text-sm pt-2">IMAP</div>
              <div className="space-y-2">
                <Label>IMAP host</Label>
                <Input value={imapHost} onChange={(e) => setImapHost(e.target.value)} placeholder="imap.seznam.cz" />
              </div>
              <div className="space-y-2">
                <Label>IMAP port</Label>
                <Input value={imapPort} onChange={(e) => setImapPort(e.target.value)} placeholder="993" />
              </div>
              <div className="space-y-2">
                <Label>IMAP uživatel</Label>
                <Input value={imapUsername} onChange={(e) => setImapUsername(e.target.value)} placeholder="info@firma.cz" />
              </div>
              <div className="space-y-2">
                <Label>IMAP heslo</Label>
                <Input type="password" value={imapPassword} onChange={(e) => setImapPassword(e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">IMAP secure (SSL/TLS)</span>
                <Switch checked={imapSecure} onCheckedChange={(v) => setImapSecure(Boolean(v))} />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2 font-medium text-sm pt-2">POP3</div>
              <div className="space-y-2">
                <Label>POP3 host</Label>
                <Input value={pop3Host} onChange={(e) => setPop3Host(e.target.value)} placeholder="pop3.seznam.cz" />
              </div>
              <div className="space-y-2">
                <Label>POP3 port</Label>
                <Input value={pop3Port} onChange={(e) => setPop3Port(e.target.value)} placeholder="995" />
              </div>
              <div className="space-y-2">
                <Label>POP3 uživatel</Label>
                <Input value={pop3Username} onChange={(e) => setPop3Username(e.target.value)} placeholder="info@firma.cz" />
              </div>
              <div className="space-y-2">
                <Label>POP3 heslo</Label>
                <Input type="password" value={pop3Password} onChange={(e) => setPop3Password(e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">POP3 secure (SSL/TLS)</span>
                <Switch checked={pop3Secure} onCheckedChange={(v) => setPop3Secure(Boolean(v))} />
              </div>
            </>
          )}

          <div className="md:col-span-2 font-medium text-sm pt-2">SMTP (vždy povinné)</div>
          <div className="space-y-2">
            <Label>SMTP host</Label>
            <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.seznam.cz" />
          </div>
          <div className="space-y-2">
            <Label>SMTP port</Label>
            <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
          </div>
          <div className="space-y-2">
            <Label>SMTP uživatel</Label>
            <Input value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} placeholder="info@firma.cz" />
          </div>
          <div className="space-y-2">
            <Label>SMTP heslo</Label>
            <Input type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-md border p-3">
            <span className="text-sm">SMTP secure (SSL/TLS)</span>
            <Switch checked={smtpSecure} onCheckedChange={(v) => setSmtpSecure(Boolean(v))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => void onTestConnection()}
            disabled={saving || loadingAccounts || testingConnection || !isEditingExisting}
          >
            {testingConnection ? <Loader2 className="animate-spin" /> : <CircleCheck />}
            Test spojení
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving || testingConnection}>
            <CircleX />
            Zrušit
          </Button>
          <Button onClick={() => void onSave()} disabled={saving || loadingAccounts || testingConnection}>
            {saving ? <Loader2 className="animate-spin" /> : <CircleCheck />}
            {isEditingExisting ? 'Uložit změny' : 'Uložit účet'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
