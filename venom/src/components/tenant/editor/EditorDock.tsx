"use client";

import { useState, useEffect, useRef } from "react";
import {
  Eye, Save, Undo2, Redo2, Monitor, Smartphone, Tablet, MoreHorizontal,
  Sparkles, Layers, ChevronDown, Rocket, X, Globe, PanelRightClose,
} from "lucide-react";
import "../../studio/design-tokens.css";

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

export interface EditorDockProps {
  tenantSlug: string;
  pageTitle?: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFlushSave: () => void;
  viewport: "desktop" | "tablet" | "mobile";
  onViewportChange: (v: "desktop" | "tablet" | "mobile") => void;
  builderOpen: boolean;
  onToggleBuilder: () => void;
  onOpenDrawer: (k: DrawerKey) => void;
  onCollapse: () => void;
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

import { FileText, BarChart3, MessageSquare, Puzzle, History, ShieldCheck, User } from "lucide-react";
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
      className="fixed left-1/2 top-3 z-[99999] -translate-x-1/2"
      style={{ fontFamily: "var(--vs-font-sans)" }}
    >
      <nav
        aria-label="Editor"
        className="vs-enter flex h-[46px] items-center gap-1 rounded-2xl px-1.5"
        style={{
          background: "linear-gradient(180deg, rgba(18,18,23,0.92) 0%, rgba(13,13,17,0.92) 100%)",
          boxShadow: "var(--vs-shadow-xl), 0 0 0 1px rgba(255,255,255,0.06)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
        }}
      >
        {/* Brand + breadcrumb */}
        <div className="flex items-center gap-2 px-2">
          <div className="vs-grad-accent flex h-7 w-7 items-center justify-center rounded-lg shadow-[0_8px_16px_rgba(99,102,241,0.45)]">
            <span className="text-[11px] font-bold text-white tracking-tight">W</span>
          </div>
          <div className="hidden flex-col leading-tight md:flex">
            <span className="text-[11px] font-semibold text-[var(--vs-text)]">Editor</span>
            <span className="text-[9.5px] text-[var(--vs-text-muted)] uppercase tracking-[var(--vs-tracking-wider)]">
              {props.tenantSlug}{props.pageTitle ? ` · ${props.pageTitle}` : ""}
            </span>
          </div>
        </div>

        <Divider />

        {/* Viewport switcher */}
        <ViewportGroup current={props.viewport} onChange={props.onViewportChange} />

        <Divider />

        {/* Undo / Redo */}
        <DockIconButton title="Zpět (⌘Z)" disabled={!props.canUndo} onClick={props.onUndo}>
          <Undo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </DockIconButton>
        <DockIconButton title="Vpřed (⌘⇧Z)" disabled={!props.canRedo} onClick={props.onRedo}>
          <Redo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </DockIconButton>

        <Divider />

        {/* Save indicator */}
        <SaveBadge status={props.saveStatus} onSave={props.onFlushSave} />

        <Divider />

        {/* Náhled */}
        <a
          href={`/demo/${props.tenantSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium tracking-tight text-[var(--vs-text-soft)] transition-colors duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
          Náhled
        </a>

        {/* Page Builder — primary CTA */}
        <button
          type="button"
          onClick={props.onToggleBuilder}
          className="vs-grad-accent inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-semibold tracking-tight text-white transition-[box-shadow,transform] duration-100 hover:scale-[1.02] active:translate-y-[0.5px]"
          style={{ boxShadow: "0 1px 0 0 rgba(255,255,255,0.18) inset, 0 4px 14px rgba(99,102,241,0.40)" }}
        >
          {props.builderOpen ? (
            <>
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
              Zavřít builder
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
              Page Builder
            </>
          )}
        </button>

        {/* Direct "Zasunout" — one-click collapse so admins don't have to
            open the ⋯ menu to slide the dock away. */}
        <button
          type="button"
          onClick={props.onCollapse}
          aria-label="Zasunout dock"
          title="Zasunout dock do strany"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-muted)] transition-colors duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
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

function SaveBadge({
  status, onSave,
}: { status: EditorDockProps["saveStatus"]; onSave: () => void }) {
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
  return (
    <button
      type="button"
      onClick={onSave}
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2.5 text-[10.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      title="Uložit (⌘S)"
    >
      <Save className="h-3 w-3" strokeWidth={2} />
      Uložit
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
