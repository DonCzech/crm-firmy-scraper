"use client";

import { useState } from "react";
import clsx from "clsx";
import { SettingsLayout } from "./SettingsLayout";
import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

function initials(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

type Notice = { kind: "ok" | "err"; text: string } | null;

export function UserAccessSettings({ tenant }: Props) {
  const [activeTab, setActiveTab] = useState("Všechny");
  const [ownerEmail, setOwnerEmail] = useState(tenant.email);

  // Change-email form
  const [newEmail, setNewEmail] = useState("");
  const [emailPwd, setEmailPwd] = useState("");
  const [emailNotice, setEmailNotice] = useState<Notice>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  // Change-password form
  const [curPwd, setCurPwd] = useState("");
  const [nextPwd, setNextPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdNotice, setPwdNotice] = useState<Notice>(null);
  const [pwdBusy, setPwdBusy] = useState(false);

  function handleInvite() {
    alert("Funkce brzy k dispozici");
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailNotice(null);
    setEmailBusy(true);
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/account`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, currentPassword: emailPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Změna se nezdařila.");
      setOwnerEmail(data.email);
      setNewEmail("");
      setEmailPwd("");
      setEmailNotice({ kind: "ok", text: "E-mail byl změněn." });
    } catch (err) {
      setEmailNotice({ kind: "err", text: err instanceof Error ? err.message : "Chyba." });
    } finally {
      setEmailBusy(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdNotice(null);
    if (nextPwd.length < 6) {
      setPwdNotice({ kind: "err", text: "Nové heslo musí mít alespoň 6 znaků." });
      return;
    }
    if (nextPwd !== confirmPwd) {
      setPwdNotice({ kind: "err", text: "Nová hesla se neshodují." });
      return;
    }
    setPwdBusy(true);
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/account`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: nextPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Změna se nezdařila.");
      setCurPwd("");
      setNextPwd("");
      setConfirmPwd("");
      setPwdNotice({ kind: "ok", text: "Heslo bylo změněno." });
    } catch (err) {
      setPwdNotice({ kind: "err", text: err instanceof Error ? err.message : "Chyba." });
    } finally {
      setPwdBusy(false);
    }
  }

  return (
    <SettingsLayout
      tenantSlug={tenant.slug}
      activeItem="Uživatelské přístupy"
      title="Uživatelské přístupy"
      actionButton={
        <button
          type="button"
          onClick={handleInvite}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
        >
          Pozvat uživatele
        </button>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/[0.06]">
        {["Všechny", "Čekající pozvánky"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-blue-500 text-white"
                : "border-transparent text-[#71717a] hover:text-[#a1a1aa]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-[#111113] overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["UŽIVATEL", "LOGIN", "2FA", "ROLE", "STAV POZVÁNKY"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.08em] text-[#52525b] uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {initials(ownerEmail)}
                  </div>
                  <span className="text-white text-[13px]">{ownerEmail}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[#a1a1aa]">{ownerEmail}</td>
              <td className="px-4 py-3 text-[#52525b]">—</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 mr-1">admin</span>
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">owner</span>
              </td>
              <td className="px-4 py-3 text-[#52525b]">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Přihlašovací údaje ─────────────────────────────────────────────── */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {/* Change e-mail */}
        <form onSubmit={submitEmail} className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
          <h3 className="text-white text-[14px] font-semibold mb-1">Přihlašovací e-mail</h3>
          <p className="text-[#71717a] text-[12px] mb-4">Aktuální: <span className="text-[#a1a1aa]">{ownerEmail}</span></p>
          <label className="block text-[11px] font-medium text-[#a1a1aa] mb-1">Nový e-mail</label>
          <input
            type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required
            className="w-full mb-3 rounded-lg bg-[#0a0a0b] border border-white/[0.08] px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
            placeholder="novy@email.cz"
          />
          <label className="block text-[11px] font-medium text-[#a1a1aa] mb-1">Současné heslo</label>
          <input
            type="password" value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} required autoComplete="current-password"
            className="w-full mb-4 rounded-lg bg-[#0a0a0b] border border-white/[0.08] px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
          />
          {emailNotice && (
            <p className={clsx("text-[12px] mb-3", emailNotice.kind === "ok" ? "text-emerald-400" : "text-red-400")}>{emailNotice.text}</p>
          )}
          <button type="submit" disabled={emailBusy} className="rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50">
            {emailBusy ? "Ukládám…" : "Změnit e-mail"}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={submitPassword} className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
          <h3 className="text-white text-[14px] font-semibold mb-4">Změna hesla</h3>
          <label className="block text-[11px] font-medium text-[#a1a1aa] mb-1">Současné heslo</label>
          <input
            type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} required autoComplete="current-password"
            className="w-full mb-3 rounded-lg bg-[#0a0a0b] border border-white/[0.08] px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
          />
          <label className="block text-[11px] font-medium text-[#a1a1aa] mb-1">Nové heslo</label>
          <input
            type="password" value={nextPwd} onChange={(e) => setNextPwd(e.target.value)} required autoComplete="new-password"
            className="w-full mb-3 rounded-lg bg-[#0a0a0b] border border-white/[0.08] px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
          />
          <label className="block text-[11px] font-medium text-[#a1a1aa] mb-1">Nové heslo znovu</label>
          <input
            type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required autoComplete="new-password"
            className="w-full mb-4 rounded-lg bg-[#0a0a0b] border border-white/[0.08] px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
          />
          {pwdNotice && (
            <p className={clsx("text-[12px] mb-3", pwdNotice.kind === "ok" ? "text-emerald-400" : "text-red-400")}>{pwdNotice.text}</p>
          )}
          <button type="submit" disabled={pwdBusy} className="rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50">
            {pwdBusy ? "Ukládám…" : "Změnit heslo"}
          </button>
        </form>
      </div>
    </SettingsLayout>
  );
}
