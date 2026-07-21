"use client";

import {
  Building2,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useApi } from "@/lib/useApi";

type DashboardData = {
  kpi: { activeListings: number; totalContacts: number; newContacts: number };
  leads?: { nemovitost: number; hypoteka: number; odhad: number; hlidaciPes: number; newsletter: number; ostatni: number };
  recentListings: { id: string; title: string; status: string; price: number; location: string; deal: string; images: { url: string }[] }[];
  portalStats: { portal: string; synced: number; errors: number; pending: number }[];
  recentActivity: { id: string; title: string; status: string; updatedAt: string }[];
};

const PORTAL_NAMES: Record<string, string> = {
  SREALITY: "Sreality.cz",
  BEZREALITKY: "Bezrealitky.cz",
  REALITY_CZ: "Reality.cz",
  REALITY_IDNES: "Reality iDNES",
};

const STATUS_ICON: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  ACTIVE: { icon: CheckCircle2, color: "text-emerald-400" },
  DRAFT: { icon: Clock, color: "text-[var(--a-text-3)]" },
  RESERVED: { icon: AlertCircle, color: "text-amber-400" },
};

function formatPrice(price: number, deal: string) {
  const f = new Intl.NumberFormat("cs-CZ").format(price);
  return deal === "RENT" ? `${f} Kc/mes.` : `${f} Kc`;
}

export default function DashboardPage() {
  const { data, loading } = useApi<DashboardData>("/api/admin/dashboard");

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Aktivni inzeraty",
      value: data.kpi.activeListings,
      icon: Building2,
      gradient: "from-[var(--a-bronze)] to-[#8a6d43]",
      glow: "shadow-[0_8px_40px_-8px_rgba(196,162,101,0.3)]",
    },
    {
      label: "Celkem poptavek",
      value: data.kpi.totalContacts,
      icon: MessageSquare,
      gradient: "from-blue-500 to-blue-700",
      glow: "shadow-[0_8px_40px_-8px_rgba(59,130,246,0.3)]",
    },
    {
      label: "Novych poptavek",
      value: data.kpi.newContacts,
      icon: Zap,
      gradient: "from-emerald-500 to-emerald-700",
      glow: "shadow-[0_8px_40px_-8px_rgba(16,185,129,0.25)]",
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Welcome banner */}
      <div className="glass-card relative overflow-hidden rounded-2xl p-8">
        <div className="shimmer absolute inset-0 rounded-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--a-bronze)]" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--a-text-3)]">Prehled</span>
            </div>
            <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">
              Dobry den, Admin
            </h2>
            <p className="mt-1 text-[14px] text-[var(--a-text-2)]">
              Mate {data.kpi.newContacts} {data.kpi.newContacts === 1 ? "novou poptavku" : "novych poptavek"}.
            </p>
          </div>
          <div className="hidden gap-3 sm:flex">
            <Link
              href="/admin/nemovitosti/novy"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-3 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl"
            >
              <Plus size={14} /> Novy inzerat
            </Link>
            <Link
              href="/admin/poptavky"
              className="flex items-center gap-2 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] px-5 py-3 text-[12px] font-semibold text-[var(--a-text)] transition-all duration-300 hover:border-[var(--a-border-hover)]"
            >
              <Zap size={14} /> Poptavky
            </Link>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        {kpiCards.map((kpi, i) => (
          <div
            key={kpi.label}
            className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:border-[var(--a-border-hover)] fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.glow} transition-shadow duration-500 group-hover:shadow-xl`}>
              <kpi.icon size={18} className="text-white" />
            </div>
            <p className="mt-5 text-[36px] font-semibold leading-none tracking-[-0.03em] text-[var(--a-text)]">
              {kpi.value}
            </p>
            <p className="mt-1 text-[12px] text-[var(--a-text-3)]">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Leady za 30 dní podle typu */}
      {data.leads && (
        <div className="glass-card rounded-2xl p-6">
          <p className="text-[13px] font-semibold text-[var(--a-text)]">Leady za poslednich 30 dni</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {([
              ["Zajem o nemovitost", data.leads.nemovitost],
              ["Hypoteka", data.leads.hypoteka],
              ["Odhad ceny", data.leads.odhad],
              ["Hlidaci pes", data.leads.hlidaciPes],
              ["Newsletter", data.leads.newsletter],
              ["Ostatni", data.leads.ostatni],
            ] as [string, number][]).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[var(--a-border)] px-4 py-3.5">
                <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-[var(--a-text)]">{value}</p>
                <p className="mt-1.5 text-[11px] text-[var(--a-text-3)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-5">
        {/* Top nemovitosti */}
        <div className="glass-card rounded-2xl p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[var(--a-text)]">Posledni nemovitosti</h3>
            <Link
              href="/admin/nemovitosti"
              className="flex items-center gap-1 text-[11px] text-[var(--a-bronze)] transition-colors hover:text-[var(--a-text)]"
            >
              Vse <Eye size={11} />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {data.recentListings.slice(0, 5).map((l) => (
              <div
                key={l.id}
                className="group/row flex items-center gap-4 rounded-xl p-2.5 transition-all duration-300 hover-row"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--a-surface-2)]">
                  {l.images?.[0]?.url ? (
                    <img src={l.images[0].url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover/row:scale-110" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Building2 size={16} className="text-[var(--a-text-3)]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[var(--a-text)]">{l.title}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--a-text-3)]">{l.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[var(--a-bronze)]">{formatPrice(l.price, l.deal)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivita */}
        <div className="glass-card rounded-2xl p-6 xl:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[var(--a-text)]">Posledni aktivita</h3>
          </div>
          <div className="mt-5 space-y-1">
            {data.recentActivity.map((a) => {
              const si = STATUS_ICON[a.status] || STATUS_ICON.DRAFT;
              const Icon = si.icon;
              return (
                <div
                  key={a.id}
                  className="group/act flex items-start gap-4 rounded-xl px-3 py-3.5 transition-all duration-300 hover-row"
                >
                  <div className={`mt-0.5 shrink-0 ${si.color}`}>
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] font-semibold text-[var(--a-text)]">{a.title}</span>
                    <span className="ml-2 text-[12px] text-[var(--a-text-2)]">{a.status}</span>
                  </div>
                  <span className="shrink-0 text-[10.5px] text-[var(--a-text-3)]">
                    {new Date(a.updatedAt).toLocaleDateString("cs-CZ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Portaly */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--a-text)]">Portaly</h3>
          <Link
            href="/admin/export"
            className="flex items-center gap-1.5 rounded-lg border border-[var(--a-border)] px-3 py-1.5 text-[11px] text-[var(--a-text-2)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"
          >
            Spravovat <ArrowRight size={11} />
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.portalStats.map((p) => {
            const hasData = p.synced + p.errors + p.pending > 0;
            return (
              <div
                key={p.portal}
                className="flex items-center gap-4 rounded-xl border border-[var(--a-border)] px-4 py-3.5 transition-all duration-300 hover:border-[var(--a-border-hover)] hover-row"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${
                  !hasData ? "bg-[var(--a-text-3)]"
                  : p.errors > 0 ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                  : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-[var(--a-text)]">{PORTAL_NAMES[p.portal] || p.portal}</p>
                  <p className="text-[10.5px] text-[var(--a-text-3)]">
                    {hasData ? `${p.synced} synchronizovano` : "Neaktivni"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
