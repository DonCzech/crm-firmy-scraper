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

export function UserAccessSettings({ tenant }: Props) {
  const [activeTab, setActiveTab] = useState("Všechny");

  function handleInvite() {
    alert("Funkce brzy k dispozici");
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
                    {initials(tenant.email)}
                  </div>
                  <span className="text-white text-[13px]">{tenant.email}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[#a1a1aa]">{tenant.email}</td>
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
    </SettingsLayout>
  );
}
