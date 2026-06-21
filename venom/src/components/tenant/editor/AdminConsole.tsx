"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X, Sparkles, FileText, MessageSquare, BarChart3, Globe, Puzzle,
  History, ShieldCheck, User, ArrowRight, ChevronRight, Mail,
  Eye, Clock, CheckCircle2, AlertTriangle, Loader2, Search,
  Rocket, ExternalLink,
} from "lucide-react";
import {
  SeoPanel, MessagesPanel, RevisionsPanel, AuditPanel,
} from "./EditorDrawerPanels";
import "../../studio/design-tokens.css";

/**
 * Unified Admin Console — fullscreen overlay that puts every non-builder
 * tool (Obsah, Růst, Správa, Účet) under one roof. Replaces the legacy
 * eight-link pill bar and the categorised "⋯" overflow menu with one
 * coherent product surface: branded left sidebar, sticky header, flat
 * navigation, and a content frame that hosts whichever module is active.
 *
 * Default landing view is an Overview dashboard with at-a-glance cards
 * for each module and tenant health. Click any card or sidebar item to
 * dive in. The four modules with native React panels (SEO, Messages,
 * Revisions, Audit) render inline; the remaining three (Blog, Analytics,
 * Modules) embed the existing fullscreen admin pages in a fitted iframe
 * so they keep working while their native rewrite catches up.
 */

export type AdminView =
  | "overview" | "blog" | "messages" | "seo" | "analytics"
  | "modules" | "revisions" | "audit" | "account";

interface NavItem {
  key: AdminView;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  native?: boolean;
  external?: boolean;
}

const NAV: NavItem[] = [
  { key: "overview",  label: "Přehled",    hint: "Souhrn za poslední dny",     Icon: Sparkles,    native: true },
  { key: "blog",      label: "Blog",       hint: "Články a kategorie",         Icon: FileText },
  { key: "messages",  label: "Zprávy",     hint: "Z formulářů",                Icon: MessageSquare, native: true },
  { key: "seo",       label: "SEO",        hint: "Title, popis, sitemap",      Icon: Globe,       native: true },
  { key: "analytics", label: "Analytics",  hint: "Návštěvy a konverze",        Icon: BarChart3 },
  { key: "modules",   label: "Moduly",     hint: "Rezervace, e-shop, formuláře", Icon: Puzzle },
  { key: "revisions", label: "Verze",      hint: "Historie a obnovení",        Icon: History,     native: true },
  { key: "audit",     label: "Audit",      hint: "Záznamy úprav",              Icon: ShieldCheck, native: true },
  { key: "account",   label: "Můj účet",   hint: "Profil a předplatné",        Icon: User,        external: true },
];

export interface AdminConsoleProps {
  open: boolean;
  initialView?: AdminView;
  tenantSlug: string;
  tenantBusinessName?: string | null;
  onClose: () => void;
}

export function AdminConsole({ open, initialView = "overview", tenantSlug, tenantBusinessName, onClose }: AdminConsoleProps) {
  const [view, setView] = useState<AdminView>(initialView);

  useEffect(() => { if (open) setView(initialView); }, [open, initialView]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const activeItem = NAV.find(n => n.key === view) ?? NAV[0];

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Administrace"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
      style={{ fontFamily: "var(--vs-font-sans, Inter, sans-serif)" }}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(2,6,23,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
        onClick={onClose}
      />

      <div
        className="relative flex h-full w-full max-h-[96vh] max-w-[1280px] overflow-hidden rounded-2xl"
        style={{
          background: "#ffffff",
          boxShadow: "0 36px 72px rgba(2,6,23,0.30), 0 18px 32px rgba(2,6,23,0.16), 0 0 0 1px rgba(2,6,23,0.05)",
          animation: "vs-admin-in 360ms cubic-bezier(0.18,0.89,0.32,1)",
        }}
      >
        <style>{`@keyframes vs-admin-in {
          from { transform: translateY(12px) scale(0.985); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }`}</style>

        {/* Sidebar */}
        <Sidebar
          view={view}
          onView={setView}
          tenantSlug={tenantSlug}
          tenantBusinessName={tenantBusinessName}
        />

        {/* Main area */}
        <main className="flex h-full min-w-0 flex-1 flex-col bg-[#f8fafc]">
          {/* Top header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-5 backdrop-blur">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <span>Administrace</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-slate-900">{activeItem.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href={`/demo/${tenantSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-3 w-3" strokeWidth={1.75} />
                Veřejný náhled
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[11.5px] font-semibold text-white hover:bg-slate-800"
                title="Zpět do editoru (Esc)"
              >
                <ArrowRight className="h-3 w-3 rotate-180" strokeWidth={2.25} />
                Zpět do editoru
              </button>
            </div>
          </header>

          {/* Content frame */}
          <div className="flex-1 overflow-y-auto">
            {view === "overview"  && <OverviewView tenantSlug={tenantSlug} onView={setView} />}
            {view === "blog"      && <IframeView    tenantSlug={tenantSlug} path="/admin/blog"      title="Blog" />}
            {view === "messages"  && <NativeView    title="Zprávy"><MessagesPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "seo"       && <NativeView    title="SEO"><SeoPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "analytics" && <IframeView    tenantSlug={tenantSlug} path="/admin/analytics" title="Analytics" />}
            {view === "modules"   && <IframeView    tenantSlug={tenantSlug} path="/admin/modules"   title="Moduly" />}
            {view === "revisions" && <NativeView    title="Verze"><RevisionsPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "audit"     && <NativeView    title="Audit"><AuditPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "account"   && <AccountExternal />}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  view, onView, tenantSlug, tenantBusinessName,
}: {
  view: AdminView;
  onView: (v: AdminView) => void;
  tenantSlug: string;
  tenantBusinessName?: string | null;
}) {
  return (
    <aside
      className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 sm:flex"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg shadow-[0_8px_18px_rgba(99,102,241,0.30)]"
          style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
        >
          <span className="text-[13px] font-bold text-white">W</span>
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[13px] font-semibold text-slate-900">
            {tenantBusinessName ?? "Administrace"}
          </div>
          <div className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {tenantSlug}
          </div>
        </div>
      </div>

      {/* Search (decorative for now, becomes command palette later) */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Hledat…"
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-[12px] text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {NAV.map(item => {
          const active = view === item.key;
          const Icon = item.Icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onView(item.key)}
              className={`group mt-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-100 ${
                active
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-[0_4px_10px_rgba(99,102,241,0.35)]"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2.25 : 1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium">{item.label}</div>
                <div className={`truncate text-[10.5px] ${active ? "text-indigo-600/80" : "text-slate-500"}`}>
                  {item.hint}
                </div>
              </div>
              {item.external && <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-3 py-2.5 text-[10px] text-slate-400">
        Esc — zpět do editoru
      </div>
    </aside>
  );
}

/* ============================================================================
   Overview — landing dashboard with summary cards. Loads in parallel
   independent endpoints and degrades gracefully when an endpoint fails.
   ============================================================================ */

interface OverviewMetrics {
  unread_messages: number | null;
  total_messages: number | null;
  pending_blog_posts: number | null;
  published_blog_posts: number | null;
  last_seo_change_at: string | null;
  pages: number | null;
  active_modules: number | null;
  recent_audit: number | null;
  perf_score: number | null;
}

function OverviewView({
  tenantSlug, onView,
}: { tenantSlug: string; onView: (v: AdminView) => void }) {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Pull lightweight summaries from existing endpoints in parallel
      const safe = async <T,>(p: Promise<T>): Promise<T | null> => p.catch(() => null);
      const [messages, blog, pages, audit] = await Promise.all([
        safe(fetch(`/api/demo/${tenantSlug}/contact`, { cache: "no-store" }).then(r => r.ok ? r.json() : null)),
        safe(fetch(`/api/demo/${tenantSlug}/blog`, { cache: "no-store" }).then(r => r.ok ? r.json() : null)),
        safe(fetch(`/api/demo/${tenantSlug}/pages`, { cache: "no-store" }).then(r => r.ok ? r.json() : null)),
        safe(fetch(`/api/demo/${tenantSlug}/audit`, { cache: "no-store" }).then(r => r.ok ? r.json() : null)),
      ]);
      if (cancelled) return;

      const msgs = (messages as { messages?: Array<{ status: string }> } | null)?.messages ?? [];
      const posts = (blog as { posts?: Array<{ status: string }> } | null)?.posts ?? [];
      const auditEvents = (audit as { events?: Array<unknown> } | null)?.events ?? [];

      setMetrics({
        unread_messages: msgs.filter(m => m.status === "new").length,
        total_messages: msgs.length,
        pending_blog_posts: posts.filter(p => p.status === "draft" || p.status === "scheduled").length,
        published_blog_posts: posts.filter(p => p.status === "published").length,
        last_seo_change_at: null,
        pages: (pages as { pages?: unknown[] } | null)?.pages?.length ?? null,
        active_modules: null,
        recent_audit: auditEvents.length,
        perf_score: null,
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tenantSlug]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      {/* Hero */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">
            Vítejte zpět
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Vše, co váš web potřebuje, na jednom místě.
          </p>
        </div>
        <a
          href={`/demo/${tenantSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
        >
          <Rocket className="h-3.5 w-3.5" strokeWidth={1.75} />
          Otevřít web v novém okně
        </a>
      </header>

      {/* Metric cards */}
      <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Nepřečtené zprávy"
          value={metrics?.unread_messages}
          total={metrics?.total_messages}
          tone={metrics?.unread_messages && metrics.unread_messages > 0 ? "accent" : "neutral"}
          Icon={Mail}
          onClick={() => onView("messages")}
          loading={loading}
        />
        <MetricCard
          label="Publikované články"
          value={metrics?.published_blog_posts}
          total={(metrics?.published_blog_posts ?? 0) + (metrics?.pending_blog_posts ?? 0)}
          tone="neutral"
          Icon={FileText}
          onClick={() => onView("blog")}
          loading={loading}
        />
        <MetricCard
          label="Stránky webu"
          value={metrics?.pages}
          tone="neutral"
          Icon={Globe}
          onClick={() => onView("seo")}
          loading={loading}
        />
        <MetricCard
          label="Záznamy v auditu"
          value={metrics?.recent_audit}
          tone="neutral"
          Icon={ShieldCheck}
          onClick={() => onView("audit")}
          loading={loading}
        />
      </section>

      {/* Module shortcut grid — flat single rail, no clinical category headers */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Co byste rádi udělali?</h2>
          <span className="text-[10.5px] text-slate-400 uppercase tracking-wider">Klikněte pro otevření</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {NAV.filter(n => n.key !== "overview").map(item => (
            <ModuleCard key={item.key} item={item} onClick={() => onView(item.key)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label, value, total, tone, Icon, onClick, loading,
}: {
  label: string;
  value: number | null | undefined;
  total?: number | null;
  tone: "neutral" | "accent" | "success" | "warning";
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: () => void;
  loading: boolean;
}) {
  const toneClass = {
    neutral: "bg-white border-slate-200 hover:border-slate-300",
    accent:  "bg-indigo-50/60 border-indigo-200 hover:border-indigo-300",
    success: "bg-emerald-50/60 border-emerald-200 hover:border-emerald-300",
    warning: "bg-amber-50/60 border-amber-200 hover:border-amber-300",
  }[tone];
  const valueTone = {
    neutral: "text-slate-900",
    accent:  "text-indigo-700",
    success: "text-emerald-700",
    warning: "text-amber-700",
  }[tone];
  const iconBg = {
    neutral: "bg-slate-100 text-slate-600",
    accent:  "bg-indigo-100 text-indigo-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-start gap-2 rounded-xl border px-3.5 py-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] ${toneClass}`}
    >
      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${iconBg}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </div>
      <div className={`text-[24px] font-bold leading-none ${valueTone}`}>
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          : value === null || value === undefined
            ? "—"
            : value
        }
        {typeof total === "number" && (value ?? 0) > 0 && (
          <span className="ml-1 text-[12px] font-medium text-slate-400">/ {total}</span>
        )}
      </div>
      <div className="text-[11.5px] font-medium text-slate-600">{label}</div>
    </button>
  );
}

function ModuleCard({
  item, onClick,
}: { item: NavItem; onClick: () => void }) {
  const Icon = item.Icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-[1px] hover:border-indigo-300 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-semibold text-slate-900">{item.label}</div>
        <div className="truncate text-[10.5px] text-slate-500">{item.hint}</div>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-indigo-600" strokeWidth={2} />
    </button>
  );
}

/* ============================================================================
   View wrappers
   ============================================================================ */

function NativeView({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto h-full max-w-4xl px-5 py-5 sm:px-8 sm:py-8">
      <div
        data-studio
        className="relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        style={{
          // Light theme overrides for nested data-studio primitives
          "--vs-bg":            "#ffffff",
          "--vs-bg-soft":       "#f8fafc",
          "--vs-surface":       "#ffffff",
          "--vs-surface-2":     "#f1f5f9",
          "--vs-surface-3":     "#e2e8f0",
          "--vs-border":        "#e5e7eb",
          "--vs-border-strong": "#cbd5e1",
          "--vs-text":          "#0f172a",
          "--vs-text-soft":     "#334155",
          "--vs-text-muted":    "#64748b",
          "--vs-text-dim":      "#94a3b8",
          background: "#ffffff",
          color: "#0f172a",
        } as React.CSSProperties}
      >
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">{title} · živá data</div>
    </div>
  );
}

function IframeView({
  tenantSlug, path, title,
}: { tenantSlug: string; path: string; title: string }) {
  const [ready, setReady] = useState(false);
  const url = `/demo/${tenantSlug}${path}`;
  return (
    <div className="mx-auto h-full max-w-6xl p-3 sm:p-6">
      <div className="relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white text-[12px] text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítám {title}…
          </div>
        )}
        <iframe
          src={url}
          title={title}
          onLoad={() => setReady(true)}
          className="block h-full w-full border-0"
          style={{ background: "white" }}
        />
      </div>
    </div>
  );
}

function AccountExternal() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-[0_8px_24px_rgba(99,102,241,0.20)]">
        <User className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">Můj účet</h2>
      <p className="mt-1.5 text-[13px] text-slate-500">
        Profil, předplatné a fakturace se otevírají v samostatném okně, aby
        bezpečně oddělily platební údaje od editoru webu.
      </p>
      <a
        href="/account/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-md bg-slate-900 px-3.5 text-[12px] font-semibold text-white hover:bg-slate-800"
      >
        Otevřít Můj účet
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
