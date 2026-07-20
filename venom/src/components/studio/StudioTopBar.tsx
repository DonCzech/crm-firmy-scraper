"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, ExternalLink, ChevronLeft, PanelLeft,
  ZoomIn, ZoomOut, ChevronDown, Check, Loader2, History, Sparkles, FileText, Home, Plus,
} from "@/components/studio/icons";
import clsx from "clsx";
import { useStudio, type StudioBreakpoint } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";
import { GoLiveButton } from "./GoLiveButton";
import { PublishButton } from "./PublishButton";
import { useHotkey } from "./ui";

export function StudioTopBar({
  state,
  onHelp: _onHelp,
  isMobile = false,
  secondaryActions,
}: {
  state: StudioState;
  onHelp: () => void;
  isMobile?: boolean;
  secondaryActions?: ReactNode;
}) {
  const studio = useStudio();
  const minimal = studio.editorTheme === "apple";

  useHotkey("1", () => studio.setBreakpoint("desktop"));
  useHotkey("2", () => studio.setBreakpoint("tablet"));
  useHotkey("3", () => studio.setBreakpoint("mobile"));
  useHotkey("cmd+z", () => state.canUndo && state.undo());
  useHotkey("cmd+shift+z", () => state.canRedo && state.redo());
  useHotkey("cmd+s", () => { void state.flushSave(); });

  // On mobile: left zone always 55px (panel is an overlay, not inline)
  const leftZoneWidth = 55;

  return (
    // relative z-[100]: backdrop-filter na .vs-topbar vytváří stacking context —
    // bez vlastního z-indexu by dropdowny z hlavičky (PageSwitcher, zoom)
    // končily POD canvasem/raily, které mají z 50–80.
    <header className="vs-topbar relative z-[100] flex h-[53px] shrink-0 items-center bg-[var(--vs-bg-soft)] border-b border-[var(--vs-border)] shadow-[0_1px_0_rgba(255,255,255,0.03)]">

      {/* Left sidebar zone */}
      <div
        style={{ width: leftZoneWidth, transition: "width 0.2s ease-in-out" }}
        className="vs-topbar-left shrink-0 flex h-full border-r border-[var(--vs-border)] overflow-hidden"
      >
        {/* Rail strip — Webero brand logo (inline SVG for gradient colors). */}
        <button
          type="button"
          onClick={() => {
            if (isMobile) studio.closeAllPanels({ collapseMobileRail: true });
          }}
          aria-label="Webero"
          title={isMobile ? "Zavřít panely" : "Webero"}
          className="vs-brand-cell w-[55px] shrink-0 h-full flex items-center justify-center"
          style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.055)" }}
        >
          <span
            className="vs-brand-mark flex h-9 w-9 items-center justify-center rounded-[10px] select-none shadow-[0_1px_0_rgba(255,255,255,0.24)_inset,0_8px_22px_rgba(var(--vs-cta-rgb),0.38)] ring-1 ring-white/10"
            style={{ background: "var(--vs-cta-grad)" }}
          >
            <svg width="22" height="22" viewBox="0 0 30 30" fill="none" aria-hidden>
              <path
                d="M7 9.5L10.8 20.5L15 12.5L19.2 20.5L23 9.5"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
        </button>
        {/* Panel strip — desktop only */}
        <div className="vs-topbar-panel-strip flex w-[220px] shrink-0 items-center px-3">
          {!isMobile && (studio.leftPanel || studio.settingsView) && (
            <button
              type="button"
              onClick={() => {
                if (studio.settingsView) { studio.setSettingsView(null); return; }
                studio.goBack();
              }}
              className="flex items-center gap-1.5 text-[13px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] transition-colors duration-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              Zpět
            </button>
          )}
        </div>
      </div>

      {/* Canvas zone */}
      <div className="vs-topbar-main flex flex-1 items-center gap-2 px-2 min-w-0">

        {!isMobile && (studio.leftPanel || studio.settingsView) && (
          <button
            type="button"
            onClick={() => {
              if (studio.settingsView) { studio.setSettingsView(null); return; }
              studio.goBack();
            }}
            className="vs-topbar-back flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-[12.5px] font-medium text-[var(--vs-text-muted)] transition-colors hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            Zpět
          </button>
        )}

        {/* Mobile: sidebar toggle button */}
        {isMobile && (
          <button
            type="button"
            aria-label={studio.mobileRailCollapsed ? "Zobrazit nástroje" : "Skrýt nástroje"}
            onClick={() => {
              if (studio.mobileRailCollapsed) {
                studio.setMobileRailCollapsed(false);
                return;
              }
              studio.setSidebarOpen(false);
              studio.setMobileRailCollapsed(true);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
          >
            <PanelLeft size={17} strokeWidth={1.6} />
          </button>
        )}

        {/* Center — přepínač stránek (rychlá navigace mezi stránkami webu) */}
        <div className="flex flex-1 items-center justify-center min-w-0 px-2">
          <PageSwitcher state={state} isMobile={isMobile} />
        </div>

        {secondaryActions && (
          <div className="vs-topbar-inline-actions flex shrink-0 items-center gap-1">
            {secondaryActions}
          </div>
        )}

        {/* Right controls */}
        <div className="vs-topbar-actions flex items-center gap-0.5 shrink-0">

          {/* Breakpoint switcher */}
          {!isMobile && (
            <div className="vs-device-switch flex items-center gap-1 mr-1">
              <BPButton bp="desktop" active={studio.breakpoint === "desktop"} onClick={studio.setBreakpoint} label="Desktop (1)">
                <Monitor className="h-4 w-4" weight={minimal ? "regular" : studio.breakpoint === "desktop" ? "duotone" : "regular"} />
                <span className="vs-toolbar-control-label">Desktop</span>
              </BPButton>
              <BPButton bp="tablet" active={studio.breakpoint === "tablet"} onClick={studio.setBreakpoint} label="Tablet (2)">
                <Tablet className="h-4 w-4" weight={minimal ? "regular" : studio.breakpoint === "tablet" ? "duotone" : "regular"} />
                <span className="vs-toolbar-control-label">Tablet</span>
              </BPButton>
              <BPButton bp="mobile" active={studio.breakpoint === "mobile"} onClick={studio.setBreakpoint} label="Mobil (3)">
                <Smartphone className="h-4 w-4" weight={minimal ? "regular" : studio.breakpoint === "mobile" ? "duotone" : "regular"} />
                <span className="vs-toolbar-control-label">Mobil</span>
              </BPButton>
            </div>
          )}

          {!isMobile && (
            <>
              <button
                type="button"
                aria-label="Zpět (⌘Z)"
                title="Zpět (⌘Z)"
                disabled={!state.canUndo}
                onClick={state.undo}
                className="flex h-[31px] items-center justify-center gap-1.5 rounded-lg px-2 text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 transition-colors duration-100"
              >
                <Undo2 className="h-4 w-4" strokeWidth={1.75} />
                <span className="vs-toolbar-control-label text-[12px] font-medium">Zpět</span>
              </button>
              <button
                type="button"
                aria-label="Znovu (⌘⇧Z)"
                title="Znovu (⌘⇧Z)"
                disabled={!state.canRedo}
                onClick={state.redo}
                className="flex h-[31px] items-center justify-center gap-1.5 rounded-lg px-2 text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 transition-colors duration-100"
              >
                <Redo2 className="h-4 w-4" strokeWidth={1.75} />
                <span className="vs-toolbar-control-label text-[12px] font-medium">Znovu</span>
              </button>
              <button
                type="button"
                aria-label="Historie verzí"
                title="Historie verzí"
                onClick={() => studio.setHistoryPanelOpen(true)}
                className={clsx(
                  "flex h-[31px] items-center justify-center gap-1.5 rounded-lg px-2 transition-colors duration-100",
                  studio.historyPanelOpen
                    ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
                    : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
                )}
              >
                <History className="h-4 w-4" weight={minimal ? "regular" : studio.historyPanelOpen ? "duotone" : "regular"} />
                <span className="vs-toolbar-control-label text-[12px] font-medium">Historie verzí</span>
              </button>
            </>
          )}

          {/* External preview link — desktop only */}
          {!isMobile && (
            <>
              <div className="h-[22px] w-px bg-[var(--vs-border)] mx-1" />
              <a
                href={state.page && !state.page.is_homepage
                  ? `/demo/${state.tenant.slug}/${state.page.slug}`
                  : `/demo/${state.tenant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Veřejný náhled"
                title="Veřejný náhled"
                className="flex h-[31px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                <span className="vs-toolbar-control-label text-[12px] font-medium">Veřejný náhled</span>
              </a>
            </>
          )}

          <div className="h-[22px] w-px bg-[var(--vs-border)] mx-1" />

          {!isMobile && <ZoomControl />}

          {!isMobile && <div className="h-[22px] w-px bg-[var(--vs-border)] mx-1" />}

          {!isMobile && <SaveStatusBadge state={state} />}

          {/* AI Builder — mobil (desktop má tlačítko v SecondaryActions) */}
          {isMobile && (
            <button
              type="button"
              onClick={() => studio.setBuilderOpen(true)}
              title="AI Builder — popište změnu a AI ji postaví"
              aria-label="AI Builder"
              className="mr-1.5 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_4px_14px_rgba(124,58,237,0.35)] transition-[filter] hover:brightness-110"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}

          <div className="flex items-center gap-1.5" data-tour-id="topbar-publish">
            {/* E-shop tenanti: rychlý návrat do administrace obchodu */}
            {state.tenant.tenant_kind === "commerce" && (
              <a
                href={`/demo/${state.tenant.slug}/admin/obchod`}
                title="Zpět do administrace e-shopu"
                className="flex h-[31px] items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16l-1.5 12.5a2 2 0 0 1-2 1.5h-9a2 2 0 0 1-2-1.5L4 7Z" /><path d="M8.5 10V6a3.5 3.5 0 0 1 7 0v4" /></svg>
                {!isMobile && "E-shop"}
              </a>
            )}
            {!isMobile && <GoLiveButton state={state} />}
            <PublishButton state={state} />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Přepínač stránek (střed hlavičky) ─────────────────────────────────────
 * Pill s názvem právě editované stránky; kliknutí otevře dropdown se všemi
 * stránkami webu — přepnutí = plná navigace na /admin[/<slug>] (stejný vzor
 * jako PagesPanel). Seznam se stahuje lazy až při prvním otevření. */

interface SwitcherPage {
  id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
  status: "draft" | "published";
}

function PageSwitcher({ state, isMobile }: { state: StudioState; isMobile: boolean }) {
  const studio = useStudio();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<SwitcherPage[] | null>(null);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOut(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOut);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || pages !== null) return;
    fetch(`/api/demo/${state.tenant.slug}/pages`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { pages?: SwitcherPage[] } | null) => setPages(d?.pages ?? []))
      .catch(() => setPages([]));
  }, [open, pages, state.tenant.slug]);

  function navigateTo(p: SwitcherPage) {
    if (p.id === state.page.id) { setOpen(false); return; }
    setNavigatingId(p.id);
    window.location.assign(p.is_homepage
      ? `/demo/${state.tenant.slug}/admin`
      : `/demo/${state.tenant.slug}/admin/${encodeURIComponent(p.slug)}`);
  }

  const currentLabel = state.page?.title?.trim() || state.page?.slug || "Úvod";

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Přepnout editovanou stránku"
        className={clsx(
          "flex max-w-[260px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors duration-100",
          open
            ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
            : "bg-[var(--vs-surface)] text-[var(--vs-text)] ring-1 ring-inset ring-[var(--vs-border)] hover:bg-[var(--vs-surface-2)]"
        )}
      >
        {state.page?.is_homepage
          ? <Home className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
          : <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />}
        <span className="truncate">{currentLabel}</span>
        <ChevronDown className={clsx("h-3 w-3 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="vs-glass vs-pop absolute left-1/2 top-full z-[240] mt-1.5 w-[240px] -translate-x-1/2 rounded-xl border border-[var(--vs-border-strong)] py-1.5 shadow-[var(--vs-shadow-xl)]">
          <div className="px-3 pb-1 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--vs-text-dim)]">
            Stránky webu
          </div>
          {pages === null ? (
            <div className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-[var(--vs-text-muted)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} /> Načítám…
            </div>
          ) : (
            <div className="max-h-[min(48vh,380px)] overflow-y-auto vs-scroll">
              {pages.map((p) => {
                const current = p.id === state.page.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => navigateTo(p)}
                    className={clsx(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] transition-colors duration-75",
                      current
                        ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
                        : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
                    )}
                  >
                    {p.is_homepage
                      ? <Home className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
                      : <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />}
                    <span className="min-w-0 flex-1 truncate">{p.title?.trim() || p.slug}</span>
                    {p.status === "draft" && !current && (
                      <span className="shrink-0 rounded bg-[var(--vs-surface-2)] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-[var(--vs-text-dim)]">
                        Koncept
                      </span>
                    )}
                    {navigatingId === p.id
                      ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" strokeWidth={2} />
                      : current && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />}
                  </button>
                );
              })}
            </div>
          )}
          {!isMobile && (
            <>
              <div className="mx-2 my-1 h-px bg-[var(--vs-border)]" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  studio.setLeftPanel("pages");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-[var(--vs-text-muted)] transition-colors duration-75 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                Nová stránka / správa stránek
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const ZOOM_PRESETS: { label: string; value: number | "fit" }[] = [
  { label: "Přizpůsobit", value: "fit" },
  { label: "40%", value: 40 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "100%", value: 100 },
  { label: "125%", value: 125 },
  { label: "150%", value: 150 },
  { label: "200%", value: 200 },
];

function ZoomControl() {
  const studio = useStudio();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOut(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, [open]);

  function stepZoom(delta: number) {
    const cur = studio.zoom === "fit" ? 100 : studio.zoom;
    studio.setZoom(Math.max(40, Math.min(200, cur + delta)));
  }

  const label = studio.zoom === "fit" ? "Přizpůsobit" : `${studio.zoom}%`;

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        type="button"
        aria-label="Zmenšit (−10%)"
        title="Zmenšit (−10%)"
        onClick={() => stepZoom(-10)}
        className="flex h-[28px] w-[26px] items-center justify-center rounded-md text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="vs-zoom-label flex h-[28px] min-w-[88px] items-center justify-center gap-0.5 rounded-md px-1.5 text-[12px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
      >
        {label}
        <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
      </button>
      <button
        type="button"
        aria-label="Přiblížit (+10%)"
        title="Přiblížit (+10%)"
        onClick={() => stepZoom(10)}
        className="flex h-[28px] w-[26px] items-center justify-center rounded-md text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="vs-glass vs-pop absolute right-0 top-full z-50 mt-1 w-[150px] rounded-lg border border-[var(--vs-border-strong)] py-1 shadow-[var(--vs-shadow-lg)]">
          {ZOOM_PRESETS.map(p => (
            <button
              key={String(p.value)}
              type="button"
              onClick={() => { studio.setZoom(p.value); setOpen(false); }}
              className={clsx(
                "w-full px-3 py-1.5 text-left text-[12px] transition-colors duration-75",
                studio.zoom === p.value
                  ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
                  : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SaveStatusBadge({ state }: { state: StudioState }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.saveStatus === "saving" || state.saveStatus === "error") {
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else if (state.saveStatus === "saved") {
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 2000);
    } else {
      // idle — show only if there are unsaved changes
      setVisible(state.canUndo);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.saveStatus, state.canUndo]);

  if (!visible) return null;

  if (state.saveStatus === "saving") {
    return (
      <span className="flex items-center gap-1 text-[11.5px] text-[var(--vs-text-muted)] mr-1">
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
        Ukládám…
      </span>
    );
  }
  if (state.saveStatus === "saved") {
    return (
      <span className="flex items-center gap-1 text-[11.5px] text-emerald-400 mr-1">
        <Check className="h-3 w-3" strokeWidth={2.5} />
        Uloženo
      </span>
    );
  }
  if (state.saveStatus === "error") {
    return (
      <span className="flex items-center gap-1 text-[11.5px] text-red-400 mr-1">
        <span className="font-bold">!</span>
        Chyba uložení
      </span>
    );
  }
  // idle + canUndo = unsaved changes
  return (
    <span className="flex items-center gap-1 text-[11.5px] text-[var(--vs-text-muted)] mr-1">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Neuloženo
    </span>
  );
}

function BPButton({
  bp, active, onClick, label, children, compact = false,
}: {
  bp: StudioBreakpoint;
  active: boolean;
  onClick: (b: StudioBreakpoint) => void;
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => onClick(bp)}
      className={clsx(
        "vs-device-button flex items-center justify-center gap-1.5 rounded-lg border border-transparent text-[12px] font-medium transition-[background,color,border-color,box-shadow] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vs-accent-ring)]",
        compact ? "h-[24px] w-[26px]" : "h-[31px] px-2.5",
        active
          ? "border-[var(--vs-accent-ring)] bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] shadow-[0_1px_2px_rgba(17,24,39,0.06)]"
          : "text-[var(--vs-text-muted)] hover:border-[var(--vs-border)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      )}
    >
      {children}
    </button>
  );
}
