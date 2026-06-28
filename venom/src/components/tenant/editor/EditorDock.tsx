"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Eye, Save, Undo2, Redo2, Monitor, Smartphone, Tablet, MoreHorizontal,
  Sparkles, Layers, ChevronDown, Rocket, X, Globe, PanelRightClose,
  LayoutDashboard, Home, FileText, Check, Plus,
  BarChart3, MessageSquare, Puzzle, History, ShieldCheck, User,
} from "lucide-react";
import "../../studio/design-tokens.css";
import { TrialChip, type TrialStatus } from "./TrialChip";

/**
 * Editor floating top dock — replaces the legacy pill bar on TenantEditorView.
 *
 * Layout zones (left → center → right):
 *   • Brand mark + breadcrumb (Editor • <tenant slug> • <page>)
 *   • Viewport switcher + undo/redo
 *   • Save indicator + Náhled + Page Builder (primary) + overflow menu
 *
 * Overflow menu groups the secondary tools (Blog, SEO, Zprávy, Analytics,
 * Moduly, Verze, Audit, Můj účet) into a categorised dropdown so the dock
 * stays compact at all viewport widths. Each item opens its own side drawer
 * via the onOpenDrawer callback.
 *
 * Design tokens come from src/components/studio/design-tokens.css. No Wix
 * code is reproduced — visual identity, spacing, palette and typography
 * are our own.
 */
export type DrawerKey =
  | "blog" | "seo" | "messages" | "analytics"
  | "modules" | "revisions" | "audit" | "account";

export interface DockPage {
  id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
  status: string;
}

export interface EditorDockProps {
  tenantSlug: string;
  pageTitle?: string;
  pages?: DockPage[];
  currentPageSlug?: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  /** Timestamp (ms) of the most recent successful save — used to render
      a "Posledně uloženo před Xm" hint when status is idle. */
  lastSavedAt?: number | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFlushSave: () => void;
  viewport: "desktop" | "tablet" | "mobile";
  onViewportChange: (v: "desktop" | "tablet" | "mobile") => void;
  builderOpen: boolean;
  onToggleBuilder: () => void;
  adminOpen: boolean;
  onToggleAdmin: () => void;
  onOpenDrawer: (k: DrawerKey) => void;
  onCollapse: () => void;
  /** Open AdminConsole pre-routed to the Pages panel (used by PageSwitcher) */
  onManagePages?: () => void;
  /** Current trial / subscription state — rendered as a chip when present. */
  trialStatus?: TrialStatus | null;
}

interface MenuGroup {
  title: string;
  items: Array<{
    key: DrawerKey;
    label: string;
    desc: string;
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    accent?: boolean;
  }>;
}

const MENU: MenuGroup[] = [
  {
    title: "Obsah",
    items: [
      { key: "blog",     label: "Blog",     desc: "Články a kategorie",     Icon: FileText },
      { key: "messages", label: "Zprávy",   desc: "Příchozí z formulářů",   Icon: MessageSquare },
    ],
  },
  {
    title: "Růst",
    items: [
      { key: "seo",       label: "SEO",       desc: "Title, popis, sitemap",     Icon: Globe },
      { key: "analytics", label: "Analytics", desc: "Návštěvy a konverze",       Icon: BarChart3 },
      { key: "modules",   label: "Moduly",    desc: "Rezervace, e-shop, formuláře", Icon: Puzzle },
    ],
  },
  {
    title: "Správa",
    items: [
      { key: "revisions", label: "Verze",     desc: "Historie a obnovení",  Icon: History },
      { key: "audit",     label: "Audit",     desc: "Záznamy úprav",        Icon: ShieldCheck },
      { key: "account",   label: "Můj účet",  desc: "Profil a předplatné",  Icon: User, accent: true },
    ],
  },
];

export function EditorDock(props: EditorDockProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div
      data-studio
      className="fixed inset-x-2 top-2 z-[99999] flex justify-center sm:left-1/2 sm:right-auto sm:top-3 sm:inset-x-auto sm:-translate-x-1/2"
      style={{ fontFamily: "var(--vs-font-sans)" }}
    >
      <nav
        aria-label="Editor"
        data-tour="dock"
        className="vs-enter flex h-[46px] max-w-full items-center gap-0.5 overflow-x-auto rounded-2xl px-1.5 sm:gap-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          background: "linear-gradient(180deg, rgba(18,18,23,0.92) 0%, rgba(13,13,17,0.92) 100%)",
          boxShadow: "var(--vs-shadow-xl), 0 0 0 1px rgba(255,255,255,0.06)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
        }}
      >
        {/* Brand + page switcher */}
        <div className="flex items-center gap-1.5 pl-1.5 pr-1">
          <div className="vs-grad-accent flex h-7 w-7 items-center justify-center rounded-lg shadow-[0_8px_16px_rgba(99,102,241,0.45)]">
            <span className="text-[11px] font-bold text-white tracking-tight">W</span>
          </div>
          <span data-tour="pageswitcher">
            <PageSwitcher
              tenantSlug={props.tenantSlug}
              pageTitle={props.pageTitle}
              pages={props.pages ?? []}
              currentPageSlug={props.currentPageSlug}
              onManagePages={props.onManagePages}
            />
          </span>
        </div>

        {/* Viewport switcher — desktop-only (on phones you're already on mobile) */}
        <div className="hidden sm:flex sm:items-center sm:gap-1">
          <Divider />
          <ViewportGroup current={props.viewport} onChange={props.onViewportChange} />
        </div>

        {/* Undo / Redo — desktop-only (no ⌘ on touch) */}
        <div className="hidden sm:flex sm:items-center sm:gap-1">
          <Divider />
          <DockIconButton title="Zpět (⌘Z)" disabled={!props.canUndo} onClick={props.onUndo}>
            <Undo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </DockIconButton>
          <DockIconButton title="Vpřed (⌘⇧Z)" disabled={!props.canRedo} onClick={props.onRedo}>
            <Redo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </DockIconButton>
        </div>

        <Divider />

        {/* Save indicator */}
        <span data-tour="save">
          <SaveBadge status={props.saveStatus} onSave={props.onFlushSave} lastSavedAt={props.lastSavedAt ?? null} />
        </span>

        <div className="hidden sm:block"><Divider /></div>

        {/* Náhled — text hidden on mobile to save horizontal real estate */}
        <a
          href={`/demo/${props.tenantSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          data-tour="nahled"
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 sm:px-2.5 text-[11.5px] font-medium tracking-tight text-[var(--vs-text-soft)] transition-colors duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
          title="Veřejný náhled"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Náhled</span>
        </a>

        {/* Trial countdown chip — hidden when subscription is active */}
        <TrialChip status={props.trialStatus ?? null} />

        {/* Twin primary CTAs — Administrace + Builder. The user explicitly
            asked for these to be the most prominent affordance in the dock
            so they're laid out next to each other on the right cluster.
            Administrace = unified admin shell. Builder = the side panel for
            section reordering / editing. */}
        <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)" }}>
          <button
            type="button"
            data-tour="administrace"
            onClick={props.onToggleAdmin}
            aria-pressed={props.adminOpen}
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-semibold tracking-tight transition-[background,box-shadow,transform] duration-100 active:translate-y-[0.5px]"
            style={{
              background: props.adminOpen
                ? "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                : "rgba(248,250,252,0.10)",
              color: props.adminOpen ? "#0f172a" : "#f8fafc",
              boxShadow: props.adminOpen
                ? "0 1px 0 0 rgba(255,255,255,0.50) inset, 0 4px 14px rgba(15,23,42,0.30)"
                : "0 1px 0 0 rgba(255,255,255,0.08) inset",
            }}
            title="Otevřít administraci"
          >
            <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Administrace</span>
          </button>
          <button
            type="button"
            data-tour="builder"
            onClick={props.onToggleBuilder}
            aria-pressed={props.builderOpen}
            className="vs-grad-accent inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-semibold tracking-tight text-white transition-[box-shadow,transform] duration-100 hover:scale-[1.02] active:translate-y-[0.5px]"
            style={{ boxShadow: "0 1px 0 0 rgba(255,255,255,0.18) inset, 0 4px 14px rgba(99,102,241,0.40)" }}
            title="Otevřít Page Builder"
          >
            {props.builderOpen ? (
              <>
                <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                <span className="hidden sm:inline">Zavřít</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
                <span className="hidden sm:inline">Builder</span>
              </>
            )}
          </button>
        </div>

        {/* Direct "Zasunout" — one-click collapse so admins don't have to
            open the ⋯ menu to slide the dock away. */}
        <button
          type="button"
          onClick={props.onCollapse}
          aria-label="Zasunout dock"
          title="Zasunout dock do strany"
          className="hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-muted)] transition-colors duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
        >
          <PanelRightClose className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        {/* More menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Více"
            title="Více"
            className="ml-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-muted)] transition-colors duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
          >
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          {menuOpen && (
            <MoreMenu
              onOpenDrawer={(k) => { setMenuOpen(false); props.onOpenDrawer(k); }}
              onCollapse={() => { setMenuOpen(false); props.onCollapse(); }}
            />
          )}
        </div>
      </nav>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px bg-[var(--vs-border)]" />;
}

function DockIconButton({
  children, title, disabled, onClick,
}: { children: React.ReactNode; title: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-muted)] transition-[background,color] duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function ViewportGroup({
  current, onChange,
}: { current: "desktop" | "tablet" | "mobile"; onChange: (v: "desktop" | "tablet" | "mobile") => void }) {
  const items = [
    { id: "desktop", Icon: Monitor,    label: "Desktop" },
    { id: "tablet",  Icon: Tablet,     label: "Tablet" },
    { id: "mobile",  Icon: Smartphone, label: "Mobile" },
  ] as const;
  return (
    <div className="flex items-center gap-0.5 rounded-md bg-[var(--vs-surface)] p-0.5 ring-1 ring-[var(--vs-border)]">
      {items.map(({ id, Icon, label }) => {
        const active = current === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => onChange(id)}
            className={`flex h-6 w-7 items-center justify-center rounded transition-[background,color] duration-100 ${
              active
                ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
                : "text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

function formatAgo(ms: number): string {
  if (ms < 5_000) return "právě teď";
  if (ms < 60_000) return `před ${Math.floor(ms / 1000)} s`;
  if (ms < 3_600_000) return `před ${Math.floor(ms / 60_000)} min`;
  if (ms < 86_400_000) return `před ${Math.floor(ms / 3_600_000)} h`;
  return `před ${Math.floor(ms / 86_400_000)} dny`;
}

function SaveBadge({
  status, onSave, lastSavedAt,
}: { status: EditorDockProps["saveStatus"]; onSave: () => void; lastSavedAt: number | null }) {
  // Tick once per ~15 s while idle so the "před Xm" hint stays fresh.
  const [, force] = useState(0);
  useEffect(() => {
    if (status !== "idle" || !lastSavedAt) return;
    const t = setInterval(() => force((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, [status, lastSavedAt]);
  if (status === "saving") {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[var(--vs-warning-bg)] px-2.5 text-[10.5px] font-medium text-[var(--vs-warning)] ring-1 ring-inset ring-[rgba(251,191,36,0.30)]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--vs-warning)]" />
        Ukládám…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex h-7 items-center gap-1 rounded-md bg-[var(--vs-success-bg)] px-2.5 text-[10.5px] font-medium text-[var(--vs-success)] ring-1 ring-inset ring-[rgba(52,211,153,0.30)]">
        <Save className="h-3 w-3" strokeWidth={2.25} />
        Uloženo
      </span>
    );
  }
  if (status === "error") {
    return (
      <button
        type="button"
        onClick={onSave}
        className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[var(--vs-danger-bg)] px-2.5 text-[10.5px] font-medium text-[var(--vs-danger)] ring-1 ring-inset ring-[rgba(248,113,113,0.30)] hover:bg-[rgba(248,113,113,0.18)]"
        title="Opakovat uložení"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--vs-danger)]" />
        Offline · Zkusit
      </button>
    );
  }
  const agoLabel = lastSavedAt ? formatAgo(Date.now() - lastSavedAt) : null;
  return (
    <button
      type="button"
      onClick={onSave}
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2.5 text-[10.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      title={agoLabel ? `Poslední uložení ${agoLabel} · ⌘S pro ruční uložení` : "Uložit (⌘S)"}
    >
      <Save className="h-3 w-3" strokeWidth={2} />
      <span className="hidden sm:inline">{agoLabel ? <span className="text-[var(--vs-text-muted)]">Uloženo · {agoLabel}</span> : "Uložit"}</span>
    </button>
  );
}

function MoreMenu({
  onOpenDrawer, onCollapse,
}: { onOpenDrawer: (k: DrawerKey) => void; onCollapse: () => void }) {
  return (
    <div
      role="menu"
      className="vs-enter absolute right-0 top-9 w-[320px] rounded-xl p-1.5"
      style={{
        background: "rgba(18,18,23,0.96)",
        boxShadow: "var(--vs-shadow-xl), 0 0 0 1px var(--vs-border-strong)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      {MENU.map((g) => (
        <div key={g.title} className="px-1 py-1">
          <div className="px-2 pb-1 pt-1 text-[9.5px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-dim)]">
            {g.title}
          </div>
          <div className="grid gap-0.5">
            {g.items.map(({ key, label, desc, Icon, accent }) => (
              <button
                key={key}
                role="menuitem"
                onClick={() => onOpenDrawer(key)}
                className="group flex items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors duration-100 hover:bg-[var(--vs-surface-2)]"
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                  accent
                    ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] ring-1 ring-inset ring-[var(--vs-accent-ring)]"
                    : "bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)] group-hover:bg-[var(--vs-accent-bg)] group-hover:text-[var(--vs-accent-hi)]"
                }`}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-[var(--vs-text)]">{label}</div>
                  <div className="text-[10.5px] text-[var(--vs-text-muted)]">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="my-1 h-px bg-[var(--vs-border)]" />
      <button
        role="menuitem"
        onClick={onCollapse}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[11.5px] text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      >
        <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
        Zasunout editor do strany
        <span className="ml-auto inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-1 text-[9.5px] font-mono text-[var(--vs-text-soft)]">
          ⌘.
        </span>
      </button>
    </div>
  );
}

/** Collapsed tab visible on right edge — replaces the legacy vertical pill. */
export function EditorCollapsedTab({ onExpand }: { onExpand: () => void }) {
  return (
    <button
      type="button"
      data-studio
      onClick={onExpand}
      aria-label="Vysunout editor"
      title="Vysunout editor"
      className="vs-grad-accent fixed right-0 top-24 z-[99999] inline-flex flex-col items-center gap-1 rounded-l-xl px-2 py-3 text-white shadow-[var(--vs-shadow-lg)]"
      style={{ fontFamily: "var(--vs-font-sans)" }}
    >
      <Rocket className="h-3.5 w-3.5" strokeWidth={2} />
      <span className="block text-[10.5px] font-semibold tracking-wide [writing-mode:vertical-rl]">
        Editor
      </span>
    </button>
  );
}

function PageSwitcher({
  tenantSlug, pageTitle, pages, currentPageSlug, onManagePages,
}: {
  tenantSlug: string;
  pageTitle?: string;
  pages: DockPage[];
  currentPageSlug?: string;
  onManagePages?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Track the trigger button rect so the portal-rendered dropdown can be
  // positioned absolutely under it (the dropdown lives outside the dock's
  // overflow-x-auto so it's no longer clipped vertically).
  useEffect(() => {
    if (!open) { setAnchorRect(null); return; }
    function measure() {
      if (btnRef.current) setAnchorRect(btnRef.current.getBoundingClientRect());
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  function slugify(s: string) {
    return s
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  async function createPage() {
    const title = newTitle.trim();
    if (!title) return;
    const slug = slugify(title);
    if (!slug) { alert("Zadej alespoň jedno písmeno v názvu."); return; }
    setCreating(true);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title, slug }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { alert(json.error ?? `Chyba ${r.status}`); return; }
      // Navigate to the new page's editor so the user can start filling it.
      window.location.href = `/demo/${tenantSlug}/admin/${slug}?addSection=1`;
    } finally { setCreating(false); }
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      // Dropdown is portaled to body, so it's NOT inside `ref.current`. Check
      // both the trigger wrapper and the popover root to avoid auto-closing
      // when the user clicks inside the dropdown content.
      if (ref.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const sorted = [...pages].sort((a, b) => {
    if (a.is_homepage) return -1;
    if (b.is_homepage) return 1;
    return a.title.localeCompare(b.title, "cs");
  });

  function hrefFor(p: DockPage) {
    return p.is_homepage ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}/admin/${p.slug}`;
  }

  const label = pageTitle ?? (currentPageSlug === "home" ? "Úvodní stránka" : currentPageSlug ?? tenantSlug);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Stránka: ${label} · ${tenantSlug}`}
        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-left transition-colors duration-100 hover:bg-[var(--vs-surface-2)]"
      >
        <span className="max-w-[160px] truncate text-[12px] font-semibold leading-none text-[var(--vs-text)]">
          {label}
        </span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-[var(--vs-text-muted)] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && anchorRect && typeof document !== "undefined" && createPortal(
        <div
          ref={popRef}
          role="menu"
          data-studio
          className="fixed z-[99998] w-[268px] overflow-hidden rounded-2xl"
          style={{
            // Sit directly under the dock with zero gap and a continuous
            // pill-style background so the dropdown reads as an extension
            // of the dock, not a separate floating card.
            top: anchorRect.bottom - 2,
            left: Math.max(8, Math.min(anchorRect.left - 8, (typeof window !== "undefined" ? window.innerWidth : 1200) - 276)),
            fontFamily: "var(--vs-font-sans, Inter, sans-serif)",
            background: "linear-gradient(180deg, rgba(20,20,26,0.96) 0%, rgba(13,13,17,0.96) 100%)",
            backdropFilter: "blur(18px) saturate(140%)",
            WebkitBackdropFilter: "blur(18px) saturate(140%)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.55), 0 12px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
            animation: "vs-pageswitcher-in 200ms cubic-bezier(0.18,0.89,0.32,1)",
            // Force a light palette inside the dark surface so every nested
            // text/icon uses the cinematic tokens regardless of body context.
            "--vs-text": "#f8fafc",
            "--vs-text-soft": "#cbd5e1",
            "--vs-text-muted": "#94a3b8",
            "--vs-text-dim": "#64748b",
            "--vs-border": "rgba(255,255,255,0.08)",
            "--vs-border-strong": "rgba(255,255,255,0.14)",
            "--vs-surface": "rgba(255,255,255,0.04)",
            "--vs-surface-2": "rgba(255,255,255,0.07)",
            "--vs-surface-3": "rgba(255,255,255,0.10)",
            color: "#f8fafc",
          } as React.CSSProperties}
        >
          <style>{`@keyframes vs-pageswitcher-in {
            from { opacity: 0; transform: translateY(-4px) scale(0.985); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }`}</style>

          <div className="border-b border-white/5 px-3 py-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">
              Stránky · {sorted.length}
            </p>
          </div>

          <div className="max-h-[340px] overflow-y-auto py-1">
            {sorted.length === 0 ? (
              <div className="px-3 py-4 text-[11.5px] text-[var(--vs-text-muted)]">
                Žádné stránky
              </div>
            ) : (
              sorted.map(p => {
                const isCurrent = p.slug === currentPageSlug;
                return (
                  <a
                    key={p.id}
                    href={isCurrent ? undefined : hrefFor(p)}
                    onClick={isCurrent ? (e) => e.preventDefault() : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors ${
                      isCurrent
                        ? "bg-white/5 text-[var(--vs-text)]"
                        : "text-[var(--vs-text-soft)] hover:bg-white/5 hover:text-[var(--vs-text)]"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5">
                      {p.is_homepage ? (
                        <Home className="h-3 w-3 text-indigo-300" strokeWidth={2} />
                      ) : (
                        <FileText className="h-3 w-3 text-[var(--vs-text-muted)]" strokeWidth={1.75} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{p.title}</span>
                        {p.status === "draft" && (
                          <span className="inline-flex h-3.5 items-center rounded-full bg-amber-500/15 px-1.5 text-[8.5px] font-semibold uppercase tracking-wider text-amber-300">
                            koncept
                          </span>
                        )}
                      </div>
                      <code className="block truncate font-mono text-[10px] text-[var(--vs-text-dim)]">
                        /{p.is_homepage ? "" : p.slug}
                      </code>
                    </div>
                    {isCurrent && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-400" strokeWidth={2.5} />}
                  </a>
                );
              })
            )}
          </div>

          <div className="border-t border-white/5 p-1.5">
            {adding ? (
              <div className="space-y-1.5 p-1">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); void createPage(); }
                    if (e.key === "Escape") { setAdding(false); setNewTitle(""); }
                  }}
                  autoFocus
                  placeholder="Název stránky (např. O nás)"
                  className="block w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[11.5px] text-white placeholder-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
                {newTitle.trim() && (
                  <p className="px-1 text-[10px] text-white/40">
                    URL: <code className="font-mono">/{slugify(newTitle.trim())}</code>
                  </p>
                )}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => { setAdding(false); setNewTitle(""); }}
                    className="inline-flex h-7 flex-1 items-center justify-center rounded-md bg-white/5 text-[11px] font-medium text-white/70 hover:bg-white/10"
                  >Zrušit</button>
                  <button
                    type="button"
                    onClick={() => void createPage()}
                    disabled={creating || !newTitle.trim()}
                    className="vs-grad-accent inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-white disabled:opacity-50"
                  >
                    {creating ? "Vytvářím…" : "Vytvořit a otevřít"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11.5px] font-semibold text-[var(--vs-text)] transition-colors hover:bg-white/5"
                >
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-md"
                    style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
                  >
                    <Plus className="h-3 w-3 text-white" strokeWidth={2.5} />
                  </span>
                  Přidat novou stránku
                </button>
                {onManagePages && (
                  <button
                    type="button"
                    onClick={() => { setOpen(false); onManagePages?.(); }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] font-medium text-[var(--vs-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--vs-text-soft)]"
                  >
                    <FileText className="h-3 w-3" strokeWidth={1.75} />
                    Spravovat všechny stránky
                  </button>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
