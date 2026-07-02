"use client";
import { useState } from "react";
import { Plus, Trash2, Star, Loader2, Check, RefreshCw, KeyRound, Landmark } from "lucide-react";

interface BankAccount {
  id: string; name: string; bank_account?: string; iban?: string; swift?: string;
  currency: string; is_default: boolean;
}

interface BankConnection {
  id: string;
  bank_account_id: string;
  provider: "fio" | "airbank";
  name: string;
  last_sync_at?: number | null;
  active: boolean;
  bank_account_name?: string;
  bank_account?: string;
  currency?: string;
}

export default function BankAccountsManager({
  initialAccounts,
  initialConnections,
}: {
  initialAccounts: BankAccount[];
  initialConnections: BankConnection[];
}) {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
  const [connections, setConnections] = useState<BankConnection[]>(initialConnections);
  const [showForm, setShowForm] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", bank_account: "", iban: "", swift: "", currency: "CZK", is_default: false,
  });
  const [connectionForm, setConnectionForm] = useState({
    bankAccountId: initialAccounts[0]?.id ?? "",
    provider: "fio" as "fio" | "airbank",
    name: "Fio API",
    token: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleAdd() {
    setLoading(true);
    const res = await fetch("/api/settings/bank-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const acc = await res.json();
      setAccounts((prev) => {
        const list = form.is_default ? prev.map((a) => ({ ...a, is_default: false })) : prev;
        return [...list, acc];
      });
      setForm({ name: "", bank_account: "", iban: "", swift: "", currency: "CZK", is_default: false });
      setShowForm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Smazat tento účet?")) return;
    await fetch(`/api/settings/bank-accounts?id=${id}`, { method: "DELETE" });
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setConnections((prev) => prev.filter((c) => c.bank_account_id !== id));
  }

  async function handleAddConnection() {
    setConnectionLoading(true);
    setMessage(null);
    const res = await fetch("/api/bank-connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(connectionForm),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const account = accounts.find((item) => item.id === connectionForm.bankAccountId);
      setConnections((prev) => [{
        ...data,
        bank_account_name: account?.name,
        bank_account: account?.bank_account,
        currency: account?.currency,
      }, ...prev]);
      setConnectionForm((prev) => ({ ...prev, token: "" }));
      setShowConnectionForm(false);
      setMessage("Bankovní napojení bylo uložené.");
    } else {
      setMessage(data.error ?? "Bankovní napojení se nepodařilo uložit.");
    }
    setConnectionLoading(false);
  }

  async function handleDeleteConnection(id: string) {
    if (!confirm("Smazat bankovní napojení? Uložené transakce zůstanou v historii.")) return;
    await fetch(`/api/bank-connections?id=${id}`, { method: "DELETE" });
    setConnections((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSync(id: string) {
    setSyncingId(id);
    setMessage(null);
    const res = await fetch("/api/bank-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: id }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const result = data.results?.[0];
      setMessage(result?.ok
        ? `Synchronizace hotová: staženo ${result.fetched}, nových ${result.inserted}, spárováno ${result.matched}.`
        : result?.error ?? "Synchronizace skončila chybou.");
      setConnections((prev) => prev.map((item) => item.id === id ? { ...item, last_sync_at: Math.floor(Date.now() / 1000) } : item));
    } else {
      setMessage(data.error ?? "Synchronizace se nepodařila.");
    }
    setSyncingId(null);
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="card p-4 text-sm text-slate-700">{message}</div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Účty na fakturách</h2>
        </div>
      {accounts.length === 0 && !showForm && (
        <div className="card p-10 text-center">
          <p className="text-slate-400 text-sm mb-4">Žádné bankovní účty. Přidejte první.</p>
        </div>
      )}

      {accounts.map((acc) => (
        <div key={acc.id} className="card p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{acc.name}</span>
              {acc.is_default && (
                <span className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg font-medium">
                  <Star className="w-3 h-3" /> Výchozí
                </span>
              )}
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{acc.currency}</span>
            </div>
            {acc.bank_account && <div className="text-sm text-slate-500 mt-0.5">{acc.bank_account}</div>}
            {acc.iban && <div className="text-xs text-slate-400 font-mono">IBAN: {acc.iban}</div>}
          </div>
          <button onClick={() => handleDelete(acc.id)} className="text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {showForm ? (
        <div className="card p-5 space-y-4 border-2 border-indigo-200">
          <h3 className="font-semibold text-slate-900">Nový bankovní účet</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Název (popis)</label>
              <input className="input" value={form.name} onChange={set("name")} placeholder="Např. Hlavní CZK účet" />
            </div>
            <div>
              <label className="label">Číslo účtu</label>
              <input className="input" value={form.bank_account} onChange={set("bank_account")} placeholder="1234567890/0100" />
            </div>
            <div>
              <label className="label">Měna</label>
              <select className="input" value={form.currency} onChange={set("currency")}>
                <option>CZK</option><option>EUR</option><option>USD</option><option>GBP</option>
              </select>
            </div>
            <div>
              <label className="label">IBAN</label>
              <input className="input font-mono" value={form.iban} onChange={set("iban")} placeholder="CZ65 0800 0000 ..." />
            </div>
            <div>
              <label className="label">SWIFT/BIC</label>
              <input className="input font-mono" value={form.swift} onChange={set("swift")} placeholder="GIBACZPX" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default}
              onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              className="w-4 h-4 rounded" />
            <span className="text-sm text-slate-700">Nastavit jako výchozí účet</span>
          </label>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.name || loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              Přidat účet
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Zrušit</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Přidat bankovní účet
        </button>
      )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Automatické párování plateb</h2>
          </div>
          <button
            onClick={() => setShowConnectionForm(true)}
            disabled={accounts.length === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Napojit banku
          </button>
        </div>

        {connections.length === 0 && (
          <div className="card p-5 text-sm text-slate-500">
            Přidejte Fio API token. Příchozí platby se potom spárují podle variabilního symbolu, částky a měny.
          </div>
        )}

        {connections.map((connection) => (
          <div key={connection.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{connection.name}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg uppercase">{connection.provider}</span>
                {!connection.active && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-lg">Vypnuto</span>}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                {connection.bank_account_name ?? "Bankovní účet"} {connection.bank_account ? `· ${connection.bank_account}` : ""}
              </div>
              <div className="text-xs text-slate-400">
                Poslední synchronizace: {connection.last_sync_at ? new Date(connection.last_sync_at * 1000).toLocaleString("cs-CZ") : "zatím nikdy"}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSync(connection.id)}
                disabled={syncingId === connection.id}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {syncingId === connection.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Synchronizovat
              </button>
              <button onClick={() => handleDeleteConnection(connection.id)} className="btn-secondary">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {showConnectionForm && (
          <div className="card p-5 space-y-4 border-2 border-indigo-200">
            <h3 className="font-semibold text-slate-900">Nové bankovní napojení</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Účet</label>
                <select
                  className="input"
                  value={connectionForm.bankAccountId}
                  onChange={(e) => setConnectionForm((prev) => ({ ...prev, bankAccountId: e.target.value }))}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Banka</label>
                <select
                  className="input"
                  value={connectionForm.provider}
                  onChange={(e) => setConnectionForm((prev) => ({ ...prev, provider: e.target.value as "fio" | "airbank" }))}
                >
                  <option value="fio">Fio API</option>
                  <option value="airbank">Air Bank PSD2</option>
                </select>
              </div>
              <div>
                <label className="label">Název napojení</label>
                <input
                  className="input"
                  value={connectionForm.name}
                  onChange={(e) => setConnectionForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">API token</label>
                <input
                  className="input font-mono"
                  type="password"
                  value={connectionForm.token}
                  onChange={(e) => setConnectionForm((prev) => ({ ...prev, token: e.target.value }))}
                  placeholder="Fio token"
                />
              </div>
            </div>
            {connectionForm.provider === "airbank" && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Air Bank vyžaduje PSD2 registraci aplikace, certifikáty a OAuth souhlas. Pro automatické párování teď použijte Fio API token.
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAddConnection}
                disabled={!connectionForm.bankAccountId || !connectionForm.name || !connectionForm.token || connectionLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {connectionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Uložit napojení
              </button>
              <button onClick={() => setShowConnectionForm(false)} className="btn-secondary">Zrušit</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
