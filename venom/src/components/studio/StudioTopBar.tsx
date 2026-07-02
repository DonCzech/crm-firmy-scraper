"use client";

import { useEffect, useRef, useState } from "react";
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, ExternalLink, ChevronLeft, Folder, PanelLeft,
  ZoomIn, ZoomOut, ChevronDown, Check, Loader2, LogOut, LayoutDashboard, User,
} from "lucide-react";
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
}: {
  state: StudioState;
  onHelp: () => void;
  isMobile?: boolean;
}) {
  const studio = useStudio();
  const { sidebarOpen, toggleSidebar } = studio;

  useHotkey("1", () => studio.setBreakpoint("desktop"));
  useHotkey("2", () => studio.setBreakpoint("tablet"));
  useHotkey("3", () => studio.setBreakpoint("mobile"));
  useHotkey("cmd+z", () => state.canUndo && state.undo());
  useHotkey("cmd+shift+z", () => state.canRedo && state.redo());
  useHotkey("cmd+s", () => { void state.flushSave(); });

  // On mobile: left zone always 55px (panel is an overlay, not inline)
  const leftZoneWidth = isMobile ? 55 : (sidebarOpen ? 275 : 55);

  return (
    <header className="flex h-[53px] shrink-0 items-center bg-[var(--vs-bg-soft)] border-b border-[var(--vs-border)] shadow-[0_1px_0_rgba(255,255,255,0.03)]">

      {/* Left sidebar zone */}
      <div
        style={{ width: leftZoneWidth, transition: "width 0.2s ease-in-out" }}
        className="shrink-0 flex h-full border-r border-[var(--vs-border)] overflow-hidden"
      >
        {/* Rail strip — Webero brand logo (inline SVG for gradient colors). */}
        <div
          className="w-[55px] shrink-0 h-full flex items-center justify-center"
          style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.055)" }}
          aria-label="Webero"
          title="Webero"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[10px] select-none shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_2px_10px_rgba(20,184,166,0.4)]"
            style={{ background: "var(--vs-grad-brand)" }}
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
          </div>
        </div>
        {/* Panel strip — desktop only */}
        <div className="flex w-[220px] shrink-0 items-center px-3">
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
      <div className="flex flex-1 items-center gap-2 px-2 min-w-0">

        {/* Mobile: sidebar toggle button */}
        {isMobile && (
          <button
            type="button"
            aria-label={sidebarOpen ? "Skrýt panel" : "Zobrazit panel"}
            onClick={toggleSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
          >
            <PanelLeft size={17} strokeWidth={1.6} />
          </button>
        )}

        {/* Center — breadcrumb */}
        <div className={clsx(
          "flex flex-1 items-center gap-2 min-w-0",
          isMobile ? "justify-start" : "justify-center px-2"
        )}>
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--vs-text-muted)] min-w-0">
            {!isMobile && <Folder className="h-4 w-4 shrink-0 opacity-70 max-[1180px]:hidden" strokeWidth={1.75} />}
            {!isMobile && <span className="shrink-0 max-[1180px]:hidden">Statické stránky</span>}
            {!isMobile && <span className="shrink-0 opacity-50 max-[1180px]:hidden">/</span>}
            <span
              className="truncate rounded-md px-2 py-1 font-semibold text-[var(--vs-text)] transition-colors duration-100 hover:bg-[var(--vs-surface-2)]"
              style={{ maxWidth: isMobile ? 110 : 154 }}
            >
              {state.page?.title ?? state.page?.slug ?? "Úvod"}
            </span>
          </div>
          {!isMobile && (
            <span
              title="Demo verze webu není indexována vyhledávači. Po spuštění na vlastní doméně se indexace zapne automaticky."
              className="inline-flex items-center gap-1.5 shrink-0 cursor-default rounded-full bg-[var(--vs-warning-bg)] px-2.5 py-[3px] text-[11px] font-semibold text-[var(--vs-warning)] ring-1 ring-inset ring-[rgba(251,191,36,0.25)] max-[1010px]:hidden"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--vs-warning)]" />
              Neindexováno
            </span>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-0.5 shrink-0">

          {/* Breakpoint switcher */}
          <div className="flex items-center gap-0.5 rounded-lg bg-[var(--vs-bg)] p-[3px] ring-1 ring-inset ring-[var(--vs-border)] shadow-[0_1px_2px_rgba(0,0,0,0.35)_inset] mr-1">
            <BPButton bp="desktop" active={studio.breakpoint === "desktop"} onClick={studio.setBreakpoint} label={isMobile ? "Desktop" : "Desktop (1)"}>
              <Monitor className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.75} />
            </BPButton>
            <BPButton bp="tablet" active={studio.breakpoint === "tablet"} onClick={studio.setBreakpoint} label={isMobile ? "Tablet" : "Tablet (2)"}>
              <Tablet className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.75} />
            </BPButton>
            <BPButton bp="mobile" active={studio.breakpoint === "mobile"} onClick={studio.setBreakpoint} label={isMobile ? "Mobil" : "Mobil (3)"} compact={isMobile}>
              <Smartphone className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.75} />
            </BPButton>
          </div>

          <button
            type="button"
            aria-label="Zpět (⌘Z)"
            title="Zpět (⌘Z)"
            disabled={!state.canUndo}
            onClick={state.undo}
            className="flex h-[31px] w-[31px] items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 transition-colors duration-100"
          >
            <Undo2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Vpřed (⌘⇧Z)"
            title="Vpřed (⌘⇧Z)"
            disabled={!state.canRedo}
            onClick={state.redo}
            className="flex h-[31px] w-[31px] items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 transition-colors duration-100"
          >
            <Redo2 className="h-4 w-4" strokeWidth={1.75} />
          </button>

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
                className="flex h-[31px] w-[31px] items-center justify-center rounded-lg text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
              </a>
            </>
          )}

          <div className="h-[22px] w-px bg-[var(--vs-border)] mx-1" />

          {!isMobile && <ZoomControl />}

          {!isMobile && <div className="h-[22px] w-px bg-[var(--vs-border)] mx-1" />}

          {!isMobile && <SaveStatusBadge state={state} />}

          <div className="flex items-center gap-1.5" data-tour-id="topbar-publish">
            {!isMobile && <GoLiveButton state={state} />}
            <PublishButton state={state} />
          </div>

          <div className="h-[22px] w-px bg-[var(--vs-border)] mx-1" />

          <UserMenu />
        </div>
      </div>
    </header>
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

  const label = studio.zoom === "fit" ? "Přizp." : `${studio.zoom}%`;

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
        className="flex h-[28px] min-w-[56px] items-center justify-center gap-0.5 rounded-md px-1.5 text-[12px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
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
        "flex items-center justify-center rounded-md transition-[background,color,box-shadow] duration-100",
        compact ? "h-[24px] w-[26px]" : "h-[26px] w-[31px]",
        active
          ? "bg-[var(--vs-surface-3)] text-[var(--vs-accent-hi)] shadow-[inset_0_0_0_1px_var(--vs-accent-ring),0_1px_3px_rgba(0,0,0,0.3)]"
          : "text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
      )}
    >
      {children}
    </button>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.email) setEmail(d.email); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    window.location.href = "/account/login";
  }

  const initial = email ? email[0].toUpperCase() : null;

  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={email ?? "Účet"}
        className="flex h-[31px] w-[31px] items-center justify-center rounded-full text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
      >
        {initial ? (
          <span
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_2px_6px_rgba(20,184,166,0.4)]"
            style={{ background: "var(--vs-grad-brand)" }}
          >
            {initial}
          </span>
        ) : (
          <User className="h-4 w-4" strokeWidth={1.75} />
        )}
      </button>

      {open && (
        <div
          className="vs-glass vs-pop absolute right-0 top-[calc(100%+6px)] z-[200] w-52 rounded-xl border border-[var(--vs-border-strong)] py-1.5"
          style={{ boxShadow: "var(--vs-shadow-lg)" }}
        >
          {email && (
            <>
              <div className="px-3.5 py-2.5">
                <p className="text-[11px] text-[var(--vs-text-dim)] truncate">{email}</p>
              </div>
              <div className="my-1 border-t border-[var(--vs-border)]" />
            </>
          )}
          <a
            href="/account/dashboard"
            className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
            Moje projekty
          </a>
          <div className="my-1 border-t border-[var(--vs-border)]" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
            Odhlásit se
          </button>
        </div>
      )}
    </div>
  );
}
