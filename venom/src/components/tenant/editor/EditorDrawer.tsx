"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";
import type { DrawerKey } from "./EditorDock";
import "../../studio/design-tokens.css";

/**
 * Slide-in side drawer system — replaces the legacy "navigate to fullscreen
 * /admin/<feature>" flow. Each tool (Blog, SEO, Zprávy, Analytics, Moduly,
 * Verze, Audit, Můj účet) opens its own panel that overlays the live editor
 * canvas without losing your place.
 *
 * For now the body of each drawer loads the existing /demo/<slug>/admin/<x>
 * page inside an iframe — zero backend changes required while the
 * presentational shell is being upgraded. Future iterations can swap each
 * iframe for a native React panel once we extract the underlying forms.
 */
export interface EditorDrawerProps {
  open: DrawerKey | null;
  tenantSlug: string;
  onClose: () => void;
}

interface DrawerConfig {
  title: string;
  subtitle: string;
  path: string;          // route used inside the iframe
  width: number;         // px
  external?: boolean;    // open as new tab instead of iframe (account)
}

const CONFIG: Record<DrawerKey, DrawerConfig> = {
  blog:       { title: "Blog",      subtitle: "Články a kategorie",       path: "/admin/blog",      width: 720 },
  seo:        { title: "SEO",       subtitle: "Title, popis, sitemap",    path: "/admin/seo",       width: 520 },
  messages:   { title: "Zprávy",    subtitle: "Příchozí z formulářů",     path: "/admin/contact",   width: 620 },
  analytics:  { title: "Analytics", subtitle: "Návštěvy a konverze",      path: "/admin/analytics", width: 760 },
  modules:    { title: "Moduly",    subtitle: "Rezervace, e-shop, formuláře", path: "/admin/modules", width: 560 },
  revisions:  { title: "Verze",     subtitle: "Historie a obnovení",      path: "/admin/revisions", width: 560 },
  audit:      { title: "Audit",     subtitle: "Záznamy úprav",            path: "/admin/audit",     width: 620 },
  account:    { title: "Můj účet",  subtitle: "Profil a předplatné",      path: "/account/dashboard", width: 720, external: true },
};

export function EditorDrawer({ open, tenantSlug, onClose }: EditorDrawerProps) {
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => { setIframeReady(false); }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const cfg = CONFIG[open];
  const url = cfg.external ? cfg.path : `/demo/${tenantSlug}${cfg.path}`;

  return (
    <div data-studio className="fixed inset-0 z-[99998]" style={{ fontFamily: "var(--vs-font-sans)" }}>
      {/* Scrim */}
      <div
        className="vs-enter absolute inset-0"
        style={{ background: "rgba(8,8,10,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal
        aria-label={cfg.title}
        className="absolute right-0 top-0 flex h-full flex-col"
        style={{
          width: `min(${cfg.width}px, 92vw)`,
          background: "var(--vs-bg)",
          boxShadow: "var(--vs-shadow-xl), -1px 0 0 0 var(--vs-border-strong)",
          animation: "vs-drawer-in 320ms var(--vs-ease-out)",
        }}
      >
        <style>{`
          @keyframes vs-drawer-in {
            from { transform: translateX(24px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <header
          className="flex h-12 shrink-0 items-center justify-between border-b px-3"
          style={{
            background: "var(--vs-bg-soft)",
            borderColor: "var(--vs-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="vs-grad-accent flex h-7 w-7 items-center justify-center rounded-md shadow-[0_4px_10px_rgba(99,102,241,0.30)]">
              <span className="text-[10.5px] font-bold text-white">W</span>
            </div>
            <div className="leading-tight">
              <div className="text-[12.5px] font-semibold tracking-tight text-[var(--vs-text)]">{cfg.title}</div>
              <div className="text-[9.5px] uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
                {cfg.subtitle}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Otevřít v novém okně"
              className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2 text-[10.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
            >
              <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
              Otevřít
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zavřít"
              title="Zavřít (Esc)"
              className="ml-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="relative flex-1 overflow-hidden bg-[var(--vs-bg)]">
          {!iframeReady && (
            <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[var(--vs-text-muted)]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Načítám…
            </div>
          )}
          {cfg.external ? (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div>
                <p className="text-[12.5px] text-[var(--vs-text-soft)]">
                  Tento odkaz se otevírá v novém okně.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vs-grad-accent mt-3 inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold text-white"
                >
                  Otevřít {cfg.title}
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                </a>
              </div>
            </div>
          ) : (
            <iframe
              key={open}
              src={url}
              title={cfg.title}
              onLoad={() => setIframeReady(true)}
              className="h-full w-full border-0"
              style={{ background: "var(--vs-bg)" }}
            />
          )}
        </div>

        {/* Footer hint */}
        <footer
          className="flex h-8 shrink-0 items-center justify-between border-t px-3 text-[10px] text-[var(--vs-text-dim)]"
          style={{ background: "var(--vs-bg-soft)", borderColor: "var(--vs-border)" }}
        >
          <span>Esc pro zavření</span>
          <span>Webero Editor</span>
        </footer>
      </aside>
    </div>
  );
}
