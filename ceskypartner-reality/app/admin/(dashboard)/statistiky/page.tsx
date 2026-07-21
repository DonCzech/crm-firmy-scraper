"use client";

import { Building2, Briefcase, Inbox, ClipboardList, Share2 } from "lucide-react";
import { useApi } from "@/lib/useApi";

type Stats = {
  listingsByStatus: { status: string; _count: number }[];
  listingsByKind: { kind: string; _count: number }[];
  listingsByDeal: { deal: string; _count: number }[];
  dealsByStage: { stage: string; _count: number; _sum: { price: number | null; commission: number | null } }[];
  exportsByStatus: { status: string; _count: number }[];
  months: { key: string; label: string; contacts: number; deals: number; commission: number }[];
  demandsActive: number;
  tasksOpen: number;
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Koncept", ACTIVE: "Aktivni", RESERVED: "Rezervace", SOLD: "Prodano", RENTED: "Pronajato", ARCHIVED: "Archiv",
};
const KIND_LABELS: Record<string, string> = { APARTMENT: "Byty", HOUSE: "Domy", LAND: "Pozemky", COMMERCIAL: "Komercni" };
const DEAL_LABELS: Record<string, string> = { SALE: "Prodej", RENT: "Pronajem", INVESTMENT: "Investice" };
const STAGE_LABELS: Record<string, string> = {
  LEAD: "Lead", VIEWING: "Prohlidky", OFFER: "Nabidka", RESERVATION: "Rezervace", CONTRACT: "Smlouva", CLOSED: "Uzavreno", LOST: "Ztraceno",
};
const EXPORT_LABELS: Record<string, string> = { SYNCED: "Synchronizovano", PENDING: "Ceka", ERROR: "Chyba", REMOVED: "Odebrano" };

function BarList({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-[13px] font-semibold text-[var(--a-text)]">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-[11.5px]">
              <span className="text-[var(--a-text-2)]">{r.label}</span>
              <span className="font-semibold text-[var(--a-text)]">{r.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--a-surface-2)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43]"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-[12px] text-[var(--a-text-3)]">Zadna data</p>}
      </div>
    </div>
  );
}

export default function StatistikyPage() {
  const { data, loading } = useApi<Stats>("/api/admin/stats");

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
      </div>
    );
  }

  const totalListings = data.listingsByStatus.reduce((s, r) => s + r._count, 0);
  const activeListings = data.listingsByStatus.find((r) => r.status === "ACTIVE")?._count || 0;
  const openDeals = data.dealsByStage.filter((r) => !["CLOSED", "LOST"].includes(r.stage)).reduce((s, r) => s + r._count, 0);
  const closedCommission = data.dealsByStage.find((r) => r.stage === "CLOSED")?._sum.commission || 0;
  const syncedExports = data.exportsByStatus.find((r) => r.status === "SYNCED")?._count || 0;
  const maxMonth = Math.max(1, ...data.months.map((m) => Math.max(m.contacts, m.deals)));

  const tiles = [
    { icon: Building2, label: "Nemovitosti (aktivni / celkem)", value: `${activeListings} / ${totalListings}` },
    { icon: Briefcase, label: "Otevrene pripady", value: String(openDeals) },
    { icon: Inbox, label: "Aktivni poptavky", value: String(data.demandsActive) },
    { icon: ClipboardList, label: "Otevrene ukoly", value: String(data.tasksOpen) },
    { icon: Share2, label: "Exporty na portalech", value: String(syncedExports) },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div>
        <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Statistiky</h2>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Vykonnost kancelare — nemovitosti, obchod, poptavky a exporty</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[var(--a-text-3)]">
              <t.icon size={13} />
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em]">{t.label}</span>
            </div>
            <p className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[var(--a-text)]">{t.value}</p>
          </div>
        ))}
      </div>

      {/* Vyvoj po mesicich */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--a-text)]">Poptavky a pripady za poslednich 6 mesicu</h3>
          <div className="flex items-center gap-4 text-[10.5px] text-[var(--a-text-3)]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--a-bronze)]" /> Poptavky</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-400/70" /> Pripady</span>
          </div>
        </div>
        <div className="mt-5 flex h-40 items-end gap-3">
          {data.months.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-32 w-full items-end justify-center gap-1">
                <div
                  className="w-1/3 max-w-[26px] rounded-t bg-[var(--a-bronze)]"
                  style={{ height: `${(m.contacts / maxMonth) * 100}%`, minHeight: m.contacts > 0 ? 4 : 0 }}
                  title={`${m.contacts} poptavek`}
                />
                <div
                  className="w-1/3 max-w-[26px] rounded-t bg-emerald-400/70"
                  style={{ height: `${(m.deals / maxMonth) * 100}%`, minHeight: m.deals > 0 ? 4 : 0 }}
                  title={`${m.deals} pripadu`}
                />
              </div>
              <span className="text-[10px] capitalize text-[var(--a-text-3)]">{m.label}</span>
              {m.commission > 0 && <span className="text-[9px] text-emerald-400">{m.commission.toLocaleString("cs-CZ")} Kc</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BarList title="Nemovitosti podle stavu" rows={data.listingsByStatus.map((r) => ({ label: STATUS_LABELS[r.status] || r.status, value: r._count }))} />
        <BarList title="Nemovitosti podle typu" rows={data.listingsByKind.map((r) => ({ label: KIND_LABELS[r.kind] || r.kind, value: r._count }))} />
        <BarList title="Pripady podle faze" rows={data.dealsByStage.map((r) => ({ label: STAGE_LABELS[r.stage] || r.stage, value: r._count }))} />
        <BarList title="Exporty podle stavu" rows={data.exportsByStatus.map((r) => ({ label: EXPORT_LABELS[r.status] || r.status, value: r._count }))} />
      </div>
    </div>
  );
}
