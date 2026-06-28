"use client";

import { useState } from "react";
import clsx from "clsx";
import { SettingsLayout } from "./SettingsLayout";
import { Search } from "lucide-react";

export interface AuditEntry {
  id: number;
  action: string;
  actor_email: string | null;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  ip_address: string | null;
}

interface Props {
  tenantSlug: string;
  entries: AuditEntry[];
}

const TABS = ["Všechny", "Obecné", "Sociální sítě", "API", "Úkoly", "Překladač", "AI", "Chyby"];

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " + d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function ActivitySettings({ tenantSlug, entries }: Props) {
  const [activeTab, setActiveTab] = useState("Všechny");
  const [search, setSearch] = useState("");

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    return !q || (e.action?.toLowerCase().includes(q) || e.actor_email?.toLowerCase().includes(q) || e.target_type?.toLowerCase().includes(q));
  });

  return (
    <SettingsLayout
      tenantSlug={tenantSlug}
      activeItem="Záznam aktivity"
      title="Záznam aktivity"
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/[0.06] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "shrink-0 px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-blue-500 text-white"
                : "border-transparent text-[#71717a] hover:text-[#a1a1aa]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#52525b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat v záznamu…"
            className="w-full rounded-lg border border-white/[0.1] bg-[#1a1a1d] pl-9 pr-3 py-2 text-[13px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111113] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["DATUM", "AKCE", "MODEL", "UŽIVATEL", "ROLE", "ZAŘÍZENÍ", "DETAILS", "IP"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.08em] text-[#52525b] uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[13px] text-[#71717a]">
                    Žádné záznamy
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                    <td className="px-4 py-3 text-[#71717a] whitespace-nowrap">{formatDate(entry.created_at)}</td>
                    <td className="px-4 py-3 text-white font-medium">{entry.action}</td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{entry.target_type ?? "—"}</td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{entry.actor_email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">admin</span>
                    </td>
                    <td className="px-4 py-3 text-[#71717a]">—</td>
                    <td className="px-4 py-3 text-[#a1a1aa]">
                      {entry.target_id ? (
                        <span className="font-mono text-[11px]">#{entry.target_id}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#71717a] font-mono text-[11px]">{entry.ip_address ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsLayout>
  );
}
