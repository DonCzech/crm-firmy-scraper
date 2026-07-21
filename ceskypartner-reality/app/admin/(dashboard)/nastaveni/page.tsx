"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Mail,
  Globe,
  Shield,
  Save,
  Plus,
  Pencil,
  Trash2,
  Key,
  X,
  Loader2,
} from "lucide-react";
import { useApi, apiPost, apiPatch, apiDelete } from "@/lib/useApi";

const TABS = [
  { id: "company", label: "Firma", icon: Building2 },
  { id: "users", label: "Uzivatele", icon: Users },
  { id: "seo", label: "SEO", icon: Globe },
  { id: "email", label: "E-mail / SMTP", icon: Mail },
  { id: "security", label: "Zabezpeceni", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

type UserItem = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  createdAt: string;
  _count: { listings: number; blogPosts: number };
};

const inputClass = "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">{label}</label>
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card w-full max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[var(--a-text)]">{title}</h3>
          <button onClick={onClose} className="text-[var(--a-text-3)] hover:text-[var(--a-text)]"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function NastaveniPage() {
  const [activeTab, setActiveTab] = useState<TabId>("company");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<UserItem | null>(null);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpResult, setSmtpResult] = useState<string | null>(null);

  // New user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("AGENT");
  const [newPhone, setNewPhone] = useState("");

  // Password change
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const { data: settingsData, loading: settingsLoading } = useApi<Record<string, string>>("/api/admin/settings");
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useApi<UserItem[]>("/api/admin/users");

  useEffect(() => {
    if (settingsData) setSettings(settingsData);
  }, [settingsData]);

  function updateSetting(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  }

  async function handleAddUser() {
    if (!newName || !newEmail || !newPassword) { alert("Vyplnte jmeno, email a heslo"); return; }
    setSaving(true);
    const { error } = await apiPost("/api/admin/users", {
      name: newName, email: newEmail, password: newPassword, role: newRole, phone: newPhone || undefined,
    });
    setSaving(false);
    if (error) { alert(error); return; }
    setShowAddUser(false);
    setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("AGENT"); setNewPhone("");
    refetchUsers();
  }

  async function handleEditUser() {
    if (!showEditUser) return;
    setSaving(true);
    const body: any = { name: showEditUser.name, email: showEditUser.email, role: showEditUser.role, phone: showEditUser.phone };
    await apiPatch(`/api/admin/users/${showEditUser.id}`, body);
    setSaving(false);
    setShowEditUser(null);
    refetchUsers();
  }

  async function deleteUser(id: string) {
    if (!confirm("Opravdu smazat tohoto uzivatele?")) return;
    await apiDelete(`/api/admin/users/${id}`);
    refetchUsers();
  }

  async function changePassword() {
    if (!newPw || newPw !== confirmPw) { setPwMsg("Hesla se neshoduji"); return; }
    if (newPw.length < 6) { setPwMsg("Heslo musi mit alespon 6 znaku"); return; }
    setPwMsg(null);
    setSaving(true);
    const { error } = await apiPatch("/api/admin/users/me/password", { oldPassword: oldPw, newPassword: newPw });
    setSaving(false);
    if (error) { setPwMsg(error); return; }
    setPwMsg("Heslo zmeneno");
    setOldPw(""); setNewPw(""); setConfirmPw("");
  }

  async function testSmtp() {
    setSmtpTesting(true);
    setSmtpResult(null);
    try {
      const res = await fetch("/api/admin/test-smtp", { method: "POST" });
      const data = await res.json();
      setSmtpResult(res.ok ? "Testovaci e-mail odeslan" : data.error || "Chyba pri odesilani");
    } catch {
      setSmtpResult("SMTP neni nakonfigurovan");
    }
    setSmtpTesting(false);
  }

  const users = usersData || [];

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Nastaveni</h2>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] transition-all duration-300 ${activeTab === t.id ? "bg-[var(--a-bronze-glow)] font-semibold text-[var(--a-bronze)]" : "text-[var(--a-text-3)] hover:text-[var(--a-text-2)]"}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        <div className="glass-card rounded-2xl p-6">
          {settingsLoading && activeTab !== "users" && activeTab !== "security" && (
            <div className="flex h-32 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--a-bronze)]" /></div>
          )}

          {activeTab === "company" && !settingsLoading && (
            <div className="space-y-5">
              <h3 className="text-[16px] font-semibold text-[var(--a-text)]">Firemni udaje</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nazev firmy"><input type="text" className={inputClass} value={settings.company_name || ""} onChange={(e) => updateSetting("company_name", e.target.value)} /></Field>
                <Field label="ICO"><input type="text" className={inputClass} value={settings.company_ico || ""} onChange={(e) => updateSetting("company_ico", e.target.value)} /></Field>
                <Field label="Telefon"><input type="tel" className={inputClass} value={settings.company_phone || ""} onChange={(e) => updateSetting("company_phone", e.target.value)} /></Field>
                <Field label="E-mail"><input type="email" className={inputClass} value={settings.company_email || ""} onChange={(e) => updateSetting("company_email", e.target.value)} /></Field>
                <Field label="Adresa"><input type="text" className={inputClass} value={settings.company_address || ""} onChange={(e) => updateSetting("company_address", e.target.value)} /></Field>
                <Field label="Web"><input type="url" className={inputClass} value={settings.company_web || ""} onChange={(e) => updateSetting("company_web", e.target.value)} /></Field>
              </div>
              <Field label="Popis firmy">
                <textarea rows={4} className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30" value={settings.company_description || ""} onChange={(e) => updateSetting("company_description", e.target.value)} />
              </Field>
              <div className="rounded-xl border border-[var(--a-border)] p-4">
                <label className="flex cursor-pointer items-start justify-between gap-4">
                  <span>
                    <span className="block text-[13px] font-semibold text-[var(--a-text)]">Vodoznak na fotografiich inzeratu</span>
                    <span className="mt-1 block text-[12px] text-[var(--a-text-3)]">Logo Cesky Partner se vypali primo do nove nahranych fotek inzeratu a zobrazi se i v galerii na webu. Drive nahrane fotky zustanou beze zmeny. Vychozi stav: vypnuto.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.watermark_enabled === "1"}
                    onChange={(e) => updateSetting("watermark_enabled", e.target.checked ? "1" : "0")}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--a-bronze)]"
                  />
                </label>
              </div>
              <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saving ? "Ukladam..." : "Ulozit zmeny"}
              </button>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-[var(--a-text)]">Uzivatele</h3>
                <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-4 py-2 text-[12px] font-semibold text-[#0a0a0b] transition-all duration-300 hover:shadow-lg">
                  <Plus size={13} /> Pridat uzivatele
                </button>
              </div>

              {usersLoading ? (
                <div className="flex h-24 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--a-bronze)]" /></div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--a-border)]">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-[var(--a-border)]">
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Uzivatel</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Role</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">E-mail</th>
                        <th className="w-20 px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--a-border)]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover-row transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--a-bronze)] to-[#8a6d43] text-[10px] font-semibold text-[#0a0a0b]">
                                {u.name?.split(" ").map((w) => w[0]).join("").slice(0, 2) || "?"}
                              </div>
                              <span className="text-[13px] font-semibold text-[var(--a-text)]">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${u.role === "ADMIN" ? "bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "bg-[var(--a-surface-2)] text-[var(--a-text-3)]"}`}>
                              {u.role === "ADMIN" ? "Administrator" : "Makler"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12.5px] text-[var(--a-text-2)]">{u.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setShowEditUser({ ...u })} className="rounded-lg p-1.5 text-[var(--a-text-3)] hover:text-[var(--a-text)]"><Pencil size={13} /></button>
                              <button onClick={() => deleteUser(u.id)} className="rounded-lg p-1.5 text-[var(--a-text-3)] hover:text-red-400"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "seo" && !settingsLoading && (
            <div className="space-y-5">
              <h3 className="text-[16px] font-semibold text-[var(--a-text)]">SEO nastaveni</h3>
              <div className="space-y-4">
                <Field label="Meta title (vychozi)"><input type="text" className={inputClass} value={settings.meta_title || ""} onChange={(e) => updateSetting("meta_title", e.target.value)} /></Field>
                <Field label="Meta description (vychozi)">
                  <textarea rows={3} className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30" value={settings.meta_description || ""} onChange={(e) => updateSetting("meta_description", e.target.value)} />
                </Field>
                <Field label="OG Image URL"><input type="url" className={inputClass} value={settings.og_image || ""} onChange={(e) => updateSetting("og_image", e.target.value)} /></Field>
                <Field label="Google Analytics ID"><input type="text" className={inputClass} value={settings.ga_id || ""} onChange={(e) => updateSetting("ga_id", e.target.value)} /></Field>
                <Field label="Plausible analytika — domena (napr. ceskypartner.cz; prazdne = vypnuto)"><input type="text" className={inputClass} value={settings.plausible_domain || ""} onChange={(e) => updateSetting("plausible_domain", e.target.value)} /></Field>
              </div>
              <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saving ? "Ukladam..." : "Ulozit"}
              </button>
            </div>
          )}

          {activeTab === "email" && !settingsLoading && (
            <div className="space-y-5">
              <h3 className="text-[16px] font-semibold text-[var(--a-text)]">SMTP konfigurace</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="SMTP server"><input type="text" className={inputClass} value={settings.smtp_host || ""} onChange={(e) => updateSetting("smtp_host", e.target.value)} placeholder="smtp.gmail.com" /></Field>
                <Field label="Port"><input type="number" className={inputClass} value={settings.smtp_port || ""} onChange={(e) => updateSetting("smtp_port", e.target.value)} placeholder="587" /></Field>
                <Field label="Uzivatel"><input type="text" className={inputClass} value={settings.smtp_user || ""} onChange={(e) => updateSetting("smtp_user", e.target.value)} placeholder="noreply@ceskypartner.cz" /></Field>
                <Field label="Heslo"><input type="password" className={inputClass} value={settings.smtp_pass || ""} onChange={(e) => updateSetting("smtp_pass", e.target.value)} placeholder="........" /></Field>
              </div>
              <div className="flex gap-2">
                <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saving ? "Ukladam..." : "Ulozit"}
                </button>
                <button onClick={testSmtp} disabled={smtpTesting} className="flex items-center gap-2 rounded-xl border border-[var(--a-border)] px-5 py-2.5 text-[12px] font-semibold text-[var(--a-text-2)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)] disabled:opacity-50">
                  {smtpTesting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Odeslat testovaci e-mail
                </button>
              </div>
              {smtpResult && <p className={`text-[12px] ${smtpResult.includes("odeslan") ? "text-emerald-400" : "text-red-400"}`}>{smtpResult}</p>}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              <h3 className="text-[16px] font-semibold text-[var(--a-text)]">Zmena hesla</h3>
              <div className="space-y-3">
                <input type="password" className={inputClass} placeholder="Stavajici heslo" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
                <input type="password" className={inputClass} placeholder="Nove heslo" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                <input type="password" className={inputClass} placeholder="Potvrzeni noveho hesla" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
              </div>
              {pwMsg && <p className={`text-[12px] ${pwMsg.includes("zmeneno") ? "text-emerald-400" : "text-red-400"}`}>{pwMsg}</p>}
              <button onClick={changePassword} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Zmenit heslo
              </button>

              <div className="mt-6 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-4">
                <div className="flex items-start gap-3">
                  <Key size={16} className="mt-0.5 shrink-0 text-[var(--a-bronze)]" />
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--a-text)]">API klice</p>
                    <p className="mt-1 text-[12px] text-[var(--a-text-2)]">Klice pro napojeni externich systemu (Sreality API, R2 storage apod.)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add user modal */}
      <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="Pridat uzivatele">
        <div className="space-y-4">
          <Field label="Jmeno"><input type="text" className={inputClass} value={newName} onChange={(e) => setNewName(e.target.value)} /></Field>
          <Field label="E-mail"><input type="email" className={inputClass} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></Field>
          <Field label="Heslo"><input type="password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></Field>
          <Field label="Telefon"><input type="tel" className={inputClass} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></Field>
          <Field label="Role">
            <div className="flex gap-2">
              <button onClick={() => setNewRole("AGENT")} className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-all ${newRole === "AGENT" ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "border-[var(--a-border)] text-[var(--a-text-3)]"}`}>Makler</button>
              <button onClick={() => setNewRole("ADMIN")} className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-all ${newRole === "ADMIN" ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "border-[var(--a-border)] text-[var(--a-text-3)]"}`}>Administrator</button>
            </div>
          </Field>
          <button onClick={handleAddUser} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] transition-all duration-300 hover:shadow-lg disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {saving ? "Vytvarim..." : "Vytvorit uzivatele"}
          </button>
        </div>
      </Modal>

      {/* Edit user modal */}
      <Modal open={!!showEditUser} onClose={() => setShowEditUser(null)} title="Upravit uzivatele">
        {showEditUser && (
          <div className="space-y-4">
            <Field label="Jmeno"><input type="text" className={inputClass} value={showEditUser.name} onChange={(e) => setShowEditUser({ ...showEditUser, name: e.target.value })} /></Field>
            <Field label="E-mail"><input type="email" className={inputClass} value={showEditUser.email} onChange={(e) => setShowEditUser({ ...showEditUser, email: e.target.value })} /></Field>
            <Field label="Telefon"><input type="tel" className={inputClass} value={showEditUser.phone || ""} onChange={(e) => setShowEditUser({ ...showEditUser, phone: e.target.value })} /></Field>
            <Field label="Role">
              <div className="flex gap-2">
                <button onClick={() => setShowEditUser({ ...showEditUser, role: "AGENT" })} className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-all ${showEditUser.role === "AGENT" ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "border-[var(--a-border)] text-[var(--a-text-3)]"}`}>Makler</button>
                <button onClick={() => setShowEditUser({ ...showEditUser, role: "ADMIN" })} className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-all ${showEditUser.role === "ADMIN" ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "border-[var(--a-border)] text-[var(--a-text-3)]"}`}>Administrator</button>
              </div>
            </Field>
            <button onClick={handleEditUser} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] transition-all duration-300 hover:shadow-lg disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saving ? "Ukladam..." : "Ulozit zmeny"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
