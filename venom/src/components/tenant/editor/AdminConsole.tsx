"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  X, Sparkles, FileText, MessageSquare, BarChart3, Globe, Puzzle,
  History, ShieldCheck, User, ChevronRight, Mail,
  Loader2, Search, Rocket, ExternalLink, FileStack, LayoutTemplate,
  AlertCircle, Check, Menu, Palette, Wand2, Image as ImageIcon, Database, Bot, Gauge, Brush,
  CalendarCheck,
} from "lucide-react";
import {
  SeoPanel, MessagesPanel, RevisionsPanel, AuditPanel, PagesPanel, TemplatePanel, DesignPanel, AiTextPanel, StockImagesPanel, DomainWizardPanel, BackupPanel, AnalyticsPanel, AiBuilderPanel, PerformancePanel, LogoGeneratorPanel,
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
  | "overview" | "pages" | "design" | "logo" | "template" | "aibuild" | "ai" | "stock" | "domain" | "blog" | "messages" | "seo" | "perf" | "analytics"
  | "modules" | "bookings" | "revisions" | "backup" | "audit" | "account";

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
  { key: "pages",     label: "Stránky",    hint: "Úvodní + podstránky",         Icon: FileStack,   native: true },
  { key: "design",    label: "Vzhled",     hint: "Barvy, fonty, rohy",          Icon: Palette,     native: true },
  { key: "logo",      label: "Logo",       hint: "SVG + PNG + favicon",         Icon: Brush,       native: true },
  { key: "template",  label: "Šablona",    hint: "Změnit vzhled webu",          Icon: LayoutTemplate, native: true },
  { key: "aibuild",   label: "AI builder", hint: "Postavit celý web s AI",       Icon: Bot,         native: true },
  { key: "ai",        label: "AI texty",   hint: "Claude napíše hero/about…",   Icon: Wand2,       native: true },
  { key: "stock",     label: "Stock fotky", hint: "Hledat na Unsplash",          Icon: ImageIcon,   native: true },
  { key: "domain",    label: "Doména",     hint: "Připojit vlastní doménu",     Icon: Globe,       native: true },
  { key: "blog",      label: "Blog",       hint: "Články a kategorie",         Icon: FileText },
  { key: "messages",  label: "Zprávy",     hint: "Z formulářů",                Icon: MessageSquare, native: true },
  { key: "seo",       label: "SEO",        hint: "Title, popis, sitemap",      Icon: Globe,       native: true },
  { key: "perf",      label: "Výkon",      hint: "Audit obrázků a odkazů",      Icon: Gauge,       native: true },
  { key: "analytics", label: "Analytics",  hint: "GTM, GA4, Pixel, GSC",        Icon: BarChart3, native: true },
  { key: "modules",   label: "Moduly",     hint: "Rezervace, e-shop, formuláře", Icon: Puzzle },
  { key: "bookings",  label: "Rezervace",  hint: "Termíny klientů",             Icon: CalendarCheck },
  { key: "revisions", label: "Verze",      hint: "Historie a obnovení",        Icon: History,     native: true },
  { key: "backup",    label: "Záloha",     hint: "Stáhnout / obnovit JSON",     Icon: Database,    native: true },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { if (open) setView(initialView); }, [open, initialView]);
  useEffect(() => { setMobileNavOpen(false); }, [view]);

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
      className="fixed inset-0 z-[99999] flex items-stretch justify-center p-0 sm:items-center sm:p-4 lg:p-6"
      style={{ fontFamily: "var(--vs-font-sans, Inter, sans-serif)" }}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(2,6,23,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
        onClick={onClose}
      />

      <div
        className="relative flex h-full w-full max-h-none max-w-[1280px] overflow-hidden rounded-none sm:max-h-[96vh] sm:rounded-2xl"
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

        {/* Sidebar — desktop only via sm:flex */}
        <Sidebar
          view={view}
          onView={setView}
          tenantSlug={tenantSlug}
          tenantBusinessName={tenantBusinessName}
        />

        {/* Mobile drawer — slides in from left, covers admin pane.
            Triggered by hamburger button in the header below. */}
        {mobileNavOpen && (
          <div className="absolute inset-0 z-40 flex sm:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="vs-enter relative flex h-full w-[78%] max-w-[300px] flex-col"
              style={{ animation: "vs-mobile-nav-in 240ms cubic-bezier(0.18,0.89,0.32,1)" }}
            >
              <style>{`@keyframes vs-mobile-nav-in {
                from { transform: translateX(-12px); opacity: 0; }
                to   { transform: translateX(0); opacity: 1; }
              }`}</style>
              <Sidebar
                view={view}
                onView={(v) => { setView(v); setMobileNavOpen(false); }}
                tenantSlug={tenantSlug}
                tenantBusinessName={tenantBusinessName}
                forceVisible
              />
            </div>
          </div>
        )}

        {/* Main area */}
        <main className="flex h-full min-w-0 flex-1 flex-col bg-[#f8fafc]">
          {/* Top header */}
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-3 sm:px-5 backdrop-blur">
            <div className="flex min-w-0 items-center gap-2 text-[12px] text-slate-500">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Otevřít menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:hidden"
              >
                <Menu className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <span className="hidden sm:inline">Administrace</span>
              <ChevronRight className="hidden h-3 w-3 sm:block" />
              <span className="truncate font-semibold text-slate-900">{activeItem.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <GoLiveControl tenantSlug={tenantSlug} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Zavřít (Esc)"
                title="Zavřít (Esc)"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-100 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </header>

          {/* Content frame */}
          <div className="flex-1 overflow-y-auto">
            {view === "overview"  && <OverviewView tenantSlug={tenantSlug} onView={setView} />}
            {view === "pages"     && <NativeView    title="Stránky"><PagesPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "design"    && <NativeView    title="Vzhled"><DesignPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "logo"      && <NativeView    title="Logo"><LogoGeneratorPanel tenantSlug={tenantSlug} businessName={tenantBusinessName} /></NativeView>}
            {view === "template"  && <NativeView    title="Šablona"><TemplatePanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "aibuild"   && <NativeView    title="AI builder"><AiBuilderPanel tenantSlug={tenantSlug} businessName={tenantBusinessName} /></NativeView>}
            {view === "ai"        && <NativeView    title="AI texty"><AiTextPanel tenantSlug={tenantSlug} businessName={tenantBusinessName} /></NativeView>}
            {view === "stock"     && <NativeView    title="Stock fotky"><StockImagesPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "domain"    && <NativeView    title="Doména"><DomainWizardPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "blog"      && <IframeView    tenantSlug={tenantSlug} path="/admin/blog"      title="Blog" />}
            {view === "messages"  && <NativeView    title="Zprávy"><MessagesPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "seo"       && <NativeView    title="SEO"><SeoPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "perf"      && <NativeView    title="Výkon"><PerformancePanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "analytics" && <NativeView    title="Analytics"><AnalyticsPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "modules"   && <IframeView    tenantSlug={tenantSlug} path="/admin/modules"   title="Moduly" />}
            {view === "bookings"  && <IframeView    tenantSlug={tenantSlug} path="/admin/rezervace" title="Rezervace" />}
            {view === "revisions" && <NativeView    title="Verze"><RevisionsPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "backup"    && <NativeView    title="Záloha"><BackupPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "audit"     && <NativeView    title="Audit"><AuditPanel tenantSlug={tenantSlug} /></NativeView>}
            {view === "account"   && <AccountExternal />}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  view, onView, tenantSlug, tenantBusinessName, forceVisible,
}: {
  view: AdminView;
  onView: (v: AdminView) => void;
  tenantSlug: string;
  tenantBusinessName?: string | null;
  forceVisible?: boolean;
}) {
  return (
    <aside
      className={`${forceVisible ? "flex" : "hidden sm:flex"} h-full w-full sm:w-64 shrink-0 flex-col border-r border-slate-200`}
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
          Icon={FileStack}
          onClick={() => onView("pages")}
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

type GoLivePhase =
  | { phase: "loading" }
  | { phase: "ready" }
  | { phase: "blocked"; missing: string[] }
  | { phase: "published" }
  | { phase: "error" };

function GoLiveControl({ tenantSlug }: { tenantSlug: string }) {
  const [pf, setPf] = useState<GoLivePhase>({ phase: "loading" });
  const [publishing, setPublishing] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/demo/${tenantSlug}/go-live`, { cache: "no-store" });
        if (!res.ok) { if (!cancelled) setPf({ phase: "error" }); return; }
        const json = (await res.json()) as { isPublished: boolean; ready: boolean; missing: string[] };
        if (cancelled) return;
        if (json.isPublished) setPf({ phase: "published" });
        else if (json.ready)  setPf({ phase: "ready" });
        else                  setPf({ phase: "blocked", missing: json.missing });
      } catch {
        if (!cancelled) setPf({ phase: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [tenantSlug]);

  useEffect(() => {
    if (!showMissing) return;
    function onDoc(e: MouseEvent) {
      if (!popRef.current?.contains(e.target as Node)) setShowMissing(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showMissing]);

  async function publish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/go-live`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (Array.isArray(json.missing)) { setPf({ phase: "blocked", missing: json.missing }); setShowMissing(true); }
        else setPf({ phase: "error" });
        return;
      }
      setPf({ phase: "published" });
    } finally { setPublishing(false); }
  }

  if (pf.phase === "loading" || pf.phase === "error") return null;
  if (pf.phase === "published") {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 text-[11.5px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
        <span className="hidden sm:inline">Web v provozu</span>
        <span className="sm:hidden">Online</span>
      </span>
    );
  }

  const blocked = pf.phase === "blocked";
  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => (blocked ? setShowMissing(v => !v) : void publish())}
        disabled={publishing}
        title={blocked ? "Před spuštěním vyplň povinné údaje" : "Spustit web do produkce"}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-semibold transition-colors duration-150 ${
          blocked
            ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-100"
            : "bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.30)] hover:bg-emerald-500"
        } disabled:opacity-60`}
      >
        {publishing
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : blocked
            ? <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
            : <Rocket className="h-3.5 w-3.5" strokeWidth={2.25} />}
        <span className="hidden sm:inline">{blocked ? "Před spuštěním…" : "Spustit web"}</span>
        <span className="sm:hidden">{blocked ? "Doplnit" : "Spustit"}</span>
      </button>

      {blocked && showMissing && pf.phase === "blocked" && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-lg border border-amber-200 bg-white p-3 text-[11.5px] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
          <div className="mb-1.5 font-semibold text-amber-700">Před spuštěním webu doplň:</div>
          <ul className="space-y-1 text-slate-700">
            {pf.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-500">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setShowMissing(false)} className="mt-2 text-[10.5px] text-slate-500 hover:text-slate-900">
            Zavřít
          </button>
        </div>
      )}
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
