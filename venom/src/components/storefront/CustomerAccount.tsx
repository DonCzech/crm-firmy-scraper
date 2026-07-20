"use client";

import { useCallback, useEffect, useState } from "react";

type View = "login" | "register" | "forgot" | "profile" | "orders" | "addresses";

interface Order {
  id: number; order_number: string; status: string; payment_status: string;
  total_cents: number; currency: string; placed_at: string; item_count: number;
}

interface OrderDetail extends Order {
  subtotal_cents: number; discount_cents: number; shipping_cents: number;
  shipping_method: string | null; payment_method: string | null; customer_note: string | null;
  shipping_address: { name?: string; street?: string; city?: string; zip?: string; country?: string; phone?: string };
  items: Array<{
    id: number; title: string; variant_title: string | null; qty: number;
    unit_price_cents: number; total_cents: number; image_url: string | null; product_slug: string | null;
  }>;
}

function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

interface Address {
  id: number; kind: string; name: string | null;
  street: string | null; city: string | null; zip: string | null;
  country: string; phone: string | null; is_default: boolean;
}

interface Profile {
  id: number; email: string; first_name: string | null; last_name: string | null; phone: string | null;
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function fmtDate(d: string) {
  // Postgres "2026-07-10 23:42:30.75+00" → ISO, jinak Safari vrátí Invalid Date
  const iso = d.includes("T") ? d : d.replace(" ", "T").replace(/\+00$/, "+00:00");
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Čeká na platbu", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Přijatá", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  paid: { label: "Zaplaceno", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  processing: { label: "Zpracovává se", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped: { label: "Odesláno", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  completed: { label: "Doručeno", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  delivered: { label: "Doručeno", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Stornováno", cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

async function api<T = any>(url: string, opts?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("webero_customer_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...opts, headers: { ...headers, ...opts?.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chyba");
  return data;
}

const BENEFITS = [
  { title: "Přehled objednávek", desc: "Historie i aktuální stav zásilek na jednom místě" },
  { title: "Rychlejší nákup", desc: "Uložené adresy — pokladna na pár kliknutí" },
  { title: "Oblíbené produkty", desc: "Srdíčka se vám neztratí ani po zavření prohlížeče" },
];

export function CustomerAccount({ tenantSlug }: { tenantSlug: string }) {
  const authBase = `/api/demo/${tenantSlug}/shop/customer/auth`;
  const profileBase = `/api/demo/${tenantSlug}/shop/customer/profile`;
  const addressBase = `/api/demo/${tenantSlug}/shop/customer/addresses`;

  const [view, setView] = useState<View>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderDetail>>({});
  const [orderLoading, setOrderLoading] = useState<number | null>(null);

  const [addrForm, setAddrForm] = useState({ name: "", street: "", city: "", zip: "", country: "CZ", phone: "", is_default: false });
  const [editAddrId, setEditAddrId] = useState<number | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("webero_customer_token");
    if (token && token !== "undefined") {
      setIsLoggedIn(true);
      setView("profile");
    } else if (token) {
      localStorage.removeItem("webero_customer_token");
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const data = await api(`${profileBase}`);
      setProfile(data.profile);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        localStorage.removeItem("webero_customer_token");
        setIsLoggedIn(false);
        setView("login");
      }
    }
  }, [profileBase]);

  const loadOrders = useCallback(async () => {
    try {
      const data = await api(`${profileBase}?section=orders`);
      setOrders(data.items ?? data.orders ?? []);
    } catch { /* ignore */ }
  }, [profileBase]);

  const loadAddresses = useCallback(async () => {
    try {
      const data = await api(`${addressBase}`);
      setAddresses(data.addresses ?? []);
    } catch { /* ignore */ }
  }, [addressBase]);

  useEffect(() => {
    if (isLoggedIn) {
      loadProfile();
      loadOrders();
      loadAddresses();
    }
  }, [isLoggedIn, loadProfile, loadOrders, loadAddresses]);

  async function toggleOrder(id: number) {
    if (openOrderId === id) { setOpenOrderId(null); return; }
    setOpenOrderId(id);
    if (!orderDetails[id]) {
      setOrderLoading(id);
      try {
        const data = await api(`${profileBase}?section=order&id=${id}`);
        setOrderDetails((d) => ({ ...d, [id]: data.order }));
      } catch { /* ignore */ }
      finally { setOrderLoading(null); }
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api(authBase, {
        method: "POST",
        body: JSON.stringify({ action: "login", email, password }),
      });
      if (!data.token) throw new Error("Přihlášení selhalo, zkuste to prosím znovu.");
      localStorage.setItem("webero_customer_token", data.token);
      setIsLoggedIn(true);
      setView("profile");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api(authBase, {
        method: "POST",
        body: JSON.stringify({ action: "register", email, password, first_name: firstName, last_name: lastName, phone }),
      });
      setSuccess("Registrace proběhla úspěšně. Nyní se můžete přihlásit.");
      setView("login");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api(authBase, {
        method: "POST",
        body: JSON.stringify({ action: "forgot_password", email }),
      });
      setSuccess("Pokud účet existuje, odeslali jsme vám e-mail s pokyny k obnovení hesla.");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api(profileBase, {
        method: "PATCH",
        body: JSON.stringify({ first_name: firstName, last_name: lastName, phone }),
      });
      setProfile(data.profile);
      setSuccess("Profil uložen.");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const body = editAddrId ? { ...addrForm, id: editAddrId } : addrForm;
      await api(addressBase, { method: "POST", body: JSON.stringify(body) });
      setShowAddrForm(false);
      setEditAddrId(null);
      loadAddresses();
    } catch (err: any) { setError(err.message); }
  }

  async function handleDeleteAddress(id: number) {
    if (!confirm("Smazat tuto adresu?")) return;
    try {
      await api(`${addressBase}?id=${id}`, { method: "DELETE" });
      loadAddresses();
    } catch (err: any) { setError(err.message); }
  }

  function logout() {
    localStorage.removeItem("webero_customer_token");
    setIsLoggedIn(false);
    setProfile(null);
    setOrders([]);
    setAddresses([]);
    setView("login");
  }

  useEffect(() => {
    if (profile && view === "profile") {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile, view]);

  const inputCls = "h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[14px] text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5";
  const btnCls = "h-11 rounded-lg bg-gradient-to-b from-[#26b854] to-[#1d9a44] px-6 text-[14px] font-bold text-white shadow-[0_2px_10px_rgba(29,154,68,0.35)] transition hover:from-[#2cc75c] hover:to-[#21a94b] disabled:opacity-50";
  const ghostCls = "h-11 rounded-lg border border-neutral-200 px-5 text-[13.5px] font-semibold text-neutral-600 transition hover:bg-neutral-50";
  const labelCls = "mb-1 block text-[12px] font-semibold text-neutral-600";

  if (!isLoggedIn) {
    const authTitle = view === "login" ? "Přihlášení" : view === "register" ? "Registrace" : "Obnovení hesla";
    return (
      <div className="mx-auto max-w-[460px]">
        {/* Formulář */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-8">
          <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950">{authTitle}</h2>

          {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</div>}
          {success && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">{success}</div>}

          {view === "login" && (
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div><label className={labelCls}>E-mail</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" /></div>
              <div><label className={labelCls}>Heslo</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} autoComplete="current-password" /></div>
              <button type="submit" disabled={loading} className={`${btnCls} w-full`}>{loading ? "Přihlašuji…" : "Přihlásit se"}</button>
              <div className="flex items-center justify-between pt-1 text-[13px]">
                <button type="button" onClick={() => { setView("forgot"); setError(null); setSuccess(null); }} className="font-medium text-neutral-500 transition hover:text-neutral-950">Zapomenuté heslo?</button>
                <button type="button" onClick={() => { setView("register"); setError(null); setSuccess(null); }} className="font-bold text-neutral-950 underline underline-offset-2 hover:text-[#1d9a44]">Registrovat se</button>
              </div>
            </form>
          )}

          {view === "register" && (
            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className={labelCls}>Jméno</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} autoComplete="given-name" /></div>
                <div><label className={labelCls}>Příjmení</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} autoComplete="family-name" /></div>
              </div>
              <div><label className={labelCls}>E-mail</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" /></div>
              <div><label className={labelCls}>Heslo</label><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} autoComplete="new-password" /></div>
              <div><label className={labelCls}>Telefon</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} autoComplete="tel" placeholder="+420" /></div>
              <button type="submit" disabled={loading} className={`${btnCls} w-full`}>{loading ? "Registruji…" : "Vytvořit účet"}</button>
              <p className="pt-1 text-center text-[13px] text-neutral-500">
                Už máte účet?{" "}
                <button type="button" onClick={() => { setView("login"); setError(null); }} className="font-bold text-neutral-950 underline underline-offset-2 hover:text-[#1d9a44]">Přihlaste se</button>
              </p>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgot} className="mt-5 space-y-4">
              <p className="text-[13.5px] text-neutral-500">Zadejte e-mail, na který je účet registrovaný, a pošleme vám pokyny k obnovení hesla.</p>
              <div><label className={labelCls}>E-mail</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" /></div>
              <button type="submit" disabled={loading} className={`${btnCls} w-full`}>{loading ? "Odesílám…" : "Odeslat pokyny"}</button>
              <p className="pt-1 text-center">
                <button type="button" onClick={() => { setView("login"); setError(null); setSuccess(null); }} className="text-[13px] font-medium text-neutral-500 transition hover:text-neutral-950">← Zpět na přihlášení</button>
              </p>
            </form>
          )}
        </div>

        {/* Benefity */}
        <ul className="mt-6 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1d9a44]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              </span>
              <span className="text-[13px] text-neutral-500"><span className="font-bold text-neutral-800">{b.title}</span> — {b.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const navItems: Array<{ key: View; label: string; icon: React.ReactNode }> = [
    { key: "profile", label: "Profil", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg> },
    { key: "orders", label: "Objednávky", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg> },
    { key: "addresses", label: "Adresy", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></svg> },
  ];

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.email || "";

  return (
    <div>
      {/* Hlavička účtu */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2cc75c] via-[#1d9a44] to-[#137a35] text-[17px] font-extrabold text-white shadow-[0_2px_10px_rgba(29,154,68,0.35)]">
            {(displayName || "?").charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-[17px] font-extrabold tracking-tight text-neutral-950">{displayName}</p>
            {profile?.email && displayName !== profile.email && <p className="text-[12.5px] text-neutral-400">{profile.email}</p>}
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          Odhlásit se
        </button>
      </div>

      {/* Navigace */}
      <div className="mb-6 flex gap-1.5 border-b border-neutral-100 pb-0">
        {navItems.map((n) => (
          <button key={n.key} onClick={() => { setView(n.key); setError(null); setSuccess(null); }}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-[13.5px] font-bold transition ${
              view === n.key ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-950"
            }`}>
            {n.icon}
            {n.label}
            {n.key === "orders" && orders.length > 0 && <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10.5px] font-bold text-neutral-500">{orders.length}</span>}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">{success}</div>}

      {view === "profile" && profile && (
        <form onSubmit={handleUpdateProfile} className="max-w-lg space-y-4 rounded-2xl border border-neutral-100 bg-white p-6">
          <h2 className="text-[16px] font-extrabold tracking-tight text-neutral-950">Můj profil</h2>
          <div><label className={labelCls}>E-mail</label><input value={profile.email} disabled className={`${inputCls} bg-neutral-50 text-neutral-500`} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={labelCls}>Jméno</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Příjmení</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Telefon</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></div>
          <button type="submit" disabled={loading} className={btnCls}>{loading ? "Ukládám…" : "Uložit změny"}</button>
        </form>
      )}

      {view === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-neutral-100 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>
              </span>
              <p className="mt-4 text-[15px] font-bold text-neutral-950">Zatím nemáte žádné objednávky</p>
              <p className="mt-1 text-[13px] text-neutral-400">Až si něco objednáte, najdete to tady.</p>
            </div>
          ) : (
            orders.map((o) => {
              const st = o.status === "pending" && o.payment_status === "paid"
                ? STATUS_MAP.paid
                : STATUS_MAP[o.status] ?? { label: o.status, cls: "bg-neutral-100 text-neutral-500 border-neutral-200" };
              const open = openOrderId === o.id;
              const detail = orderDetails[o.id];
              return (
                <div key={o.id} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white transition hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                  <button type="button" onClick={() => toggleOrder(o.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left sm:p-5">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>
                      </span>
                      <div>
                        <p className="text-[14.5px] font-extrabold tracking-tight text-neutral-950">#{o.order_number}</p>
                        <p className="mt-0.5 text-[12px] text-neutral-400">{fmtDate(o.placed_at)} · {o.item_count} {plural(o.item_count, "položka", "položky", "položek")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${st.cls}`}>{st.label}</span>
                      <span className="text-[15px] font-extrabold tabular-nums text-neutral-950">{czk(o.total_cents, o.currency)}</span>
                      <svg className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-neutral-100 bg-neutral-50/60 px-4 py-4 sm:px-5">
                      {orderLoading === o.id && !detail ? (
                        <div className="flex justify-center py-6">
                          <svg className="animate-spin text-neutral-300" width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                        </div>
                      ) : detail ? (
                        <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                          <div>
                            <ul className="space-y-2.5">
                              {detail.items.map((it) => (
                                <li key={it.id} className="flex items-center gap-3">
                                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-white">
                                    {it.image_url && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={it.image_url} alt="" className="h-full w-full object-cover" />
                                    )}
                                  </div>
                                  <span className="min-w-0 flex-1">
                                    {it.product_slug ? (
                                      <a href={`/demo/${tenantSlug}/obchod/${it.product_slug}`} className="line-clamp-1 text-[13.5px] font-semibold text-neutral-950 hover:underline">{it.title}</a>
                                    ) : (
                                      <span className="line-clamp-1 text-[13.5px] font-semibold text-neutral-950">{it.title}</span>
                                    )}
                                    <span className="text-[12px] text-neutral-400">{it.variant_title ? `${it.variant_title} · ` : ""}{it.qty} × {czk(it.unit_price_cents, detail.currency)}</span>
                                  </span>
                                  <span className="text-[13.5px] font-bold tabular-nums text-neutral-950">{czk(it.total_cents, detail.currency)}</span>
                                </li>
                              ))}
                            </ul>
                            <dl className="mt-4 space-y-1.5 border-t border-neutral-200/70 pt-3 text-[12.5px]">
                              <div className="flex justify-between"><dt className="text-neutral-500">Mezisoučet</dt><dd className="font-semibold tabular-nums text-neutral-900">{czk(detail.subtotal_cents, detail.currency)}</dd></div>
                              {detail.discount_cents > 0 && (
                                <div className="flex justify-between"><dt className="text-neutral-500">Sleva</dt><dd className="font-semibold tabular-nums text-emerald-600">−{czk(detail.discount_cents, detail.currency)}</dd></div>
                              )}
                              <div className="flex justify-between"><dt className="text-neutral-500">Doprava a platba</dt><dd className={`font-semibold tabular-nums ${detail.shipping_cents === 0 ? "text-emerald-600" : "text-neutral-900"}`}>{detail.shipping_cents === 0 ? "Zdarma" : czk(detail.shipping_cents, detail.currency)}</dd></div>
                              <div className="flex justify-between pt-1"><dt className="font-bold text-neutral-950">Celkem</dt><dd className="text-[14px] font-extrabold tabular-nums text-neutral-950">{czk(detail.total_cents, detail.currency)}</dd></div>
                            </dl>
                          </div>
                          <div className="space-y-3 text-[12.5px]">
                            {(detail.shipping_address?.name || detail.shipping_address?.street) && (
                              <div className="rounded-xl border border-neutral-100 bg-white p-3.5">
                                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-neutral-400">Doručovací adresa</p>
                                {detail.shipping_address.name && <p className="font-semibold text-neutral-900">{detail.shipping_address.name}</p>}
                                {detail.shipping_address.street && <p className="text-neutral-500">{detail.shipping_address.street}</p>}
                                {(detail.shipping_address.zip || detail.shipping_address.city) && <p className="text-neutral-500">{detail.shipping_address.zip} {detail.shipping_address.city}</p>}
                              </div>
                            )}
                            {(detail.shipping_method || detail.payment_method) && (
                              <div className="rounded-xl border border-neutral-100 bg-white p-3.5">
                                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-neutral-400">Doprava a platba</p>
                                {detail.shipping_method && <p className="text-neutral-700">{detail.shipping_method}</p>}
                                {detail.payment_method && <p className="text-neutral-700">{detail.payment_method}</p>}
                              </div>
                            )}
                            {detail.customer_note && (
                              <div className="rounded-xl border border-neutral-100 bg-white p-3.5">
                                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-neutral-400">Poznámka</p>
                                <p className="text-neutral-700">{detail.customer_note}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="py-4 text-center text-[13px] text-neutral-400">Detail objednávky se nepodařilo načíst.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {view === "addresses" && (
        <div className="space-y-4">
          {!showAddrForm && (
            <div className="flex justify-end">
              <button onClick={() => {
                setAddrForm({ name: [firstName, lastName].filter(Boolean).join(" "), street: "", city: "", zip: "", country: "CZ", phone: phone, is_default: false });
                setEditAddrId(null);
                setShowAddrForm(true);
              }} className={btnCls}>+ Nová adresa</button>
            </div>
          )}

          {showAddrForm && (
            <form onSubmit={handleSaveAddress} className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6">
              <h3 className="text-[16px] font-extrabold tracking-tight text-neutral-950">{editAddrId ? "Upravit adresu" : "Nová adresa"}</h3>
              <div><label className={labelCls}>Jméno a příjmení</label><input value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} className={inputCls} required /></div>
              <div><label className={labelCls}>Ulice a č.p.</label><input value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} className={inputCls} required /></div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><label className={labelCls}>Město</label><input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className={inputCls} required /></div>
                <div><label className={labelCls}>PSČ</label><input value={addrForm.zip} onChange={(e) => setAddrForm({ ...addrForm, zip: e.target.value })} className={inputCls} required /></div>
                <div><label className={labelCls}>Země</label>
                  <select value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} className={inputCls}>
                    <option value="CZ">Česká republika</option>
                    <option value="SK">Slovensko</option>
                  </select>
                </div>
              </div>
              <div className="sm:max-w-[50%]">
                <label className={labelCls}>Telefon</label><input type="tel" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} className={inputCls} />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={addrForm.is_default} onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })} className="h-4 w-4 rounded border-neutral-300 accent-[#1d9a44]" />
                <span className="text-[13px] font-semibold text-neutral-700">Výchozí adresa</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" className={btnCls}>Uložit adresu</button>
                <button type="button" onClick={() => { setShowAddrForm(false); setEditAddrId(null); }} className={ghostCls}>Zrušit</button>
              </div>
            </form>
          )}

          {addresses.length === 0 && !showAddrForm ? (
            <div className="flex flex-col items-center rounded-2xl border border-neutral-100 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></svg>
              </span>
              <p className="mt-4 text-[15px] font-bold text-neutral-950">Nemáte uložené žádné adresy</p>
              <p className="mt-1 text-[13px] text-neutral-400">Uložená adresa zrychlí každou další objednávku.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <div key={a.id} className="rounded-2xl border border-neutral-100 bg-white p-5 transition hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        <span className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-500">{a.kind === "billing" ? "Fakturační" : "Doručovací"}</span>
                        {a.is_default && <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">Výchozí</span>}
                      </div>
                      <p className="text-[14px] font-bold text-neutral-950">{a.name}</p>
                      <p className="mt-0.5 text-[13px] text-neutral-500">{a.street}</p>
                      <p className="text-[13px] text-neutral-500">{a.zip} {a.city}, {a.country}</p>
                      {a.phone && <p className="mt-0.5 text-[12px] text-neutral-400">{a.phone}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => {
                        setAddrForm({ name: a.name ?? "", street: a.street ?? "", city: a.city ?? "", zip: a.zip ?? "", country: a.country, phone: a.phone ?? "", is_default: a.is_default });
                        setEditAddrId(a.id);
                        setShowAddrForm(true);
                      }} className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950">Upravit</button>
                      <button onClick={() => handleDeleteAddress(a.id)} className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600">Smazat</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
