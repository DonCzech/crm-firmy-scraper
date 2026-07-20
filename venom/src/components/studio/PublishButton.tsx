"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "@/components/studio/icons";
import type { StudioState } from "./TenantStudioView";
import { useStudio } from "./StudioContext";

/**
 * Studio top-bar "Publikovat" dropdown.
 *
 * Three actions chosen from the dropdown:
 *  1. Publikovat aktuální stránku — publishes ONLY the active page (flips its
 *     status to 'published'; saves any pending section edits).
 *  2. Publikovat celý web — full-site publish: flushes pending edits, then
 *     marks every page as published.
 *  3. Uložit jako koncept — sets the active page status to 'draft' so it
 *     persists but doesn't render publicly. The home page can't be drafted.
 *
 * The primary button label reflects the most recently chosen action;
 * defaults to "Publikovat".
 */

type Mode = "page" | "site" | "draft";

interface Props {
  state: StudioState;
}

export function PublishButton({ state }: Props) {
  const studio = useStudio();
  const minimal = studio.editorTheme === "apple";
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("page");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2500);
    return () => clearTimeout(t);
  }, [msg]);

  const slug = state.tenant.slug;

  async function publishCurrentPage() {
    setBusy(true);
    try {
      // Make sure any pending text edits hit the DB first.
      await state.flushSave();
      const res = await fetch(`/api/demo/${slug}/pages/${state.page.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setMsg({ kind: "ok", text: "Stránka publikována" });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Chyba" });
    } finally {
      setBusy(false);
    }
  }

  async function publishWholeSite() {
    setBusy(true);
    try {
      await state.flushSave();
      // Flip every page → published. The /go-live endpoint also flips the
      // tenant status; here we just mark all pages published which surfaces
      // every page on the public site even if some were drafts.
      const pagesRes = await fetch(`/api/demo/${slug}/pages`, { cache: "no-store" });
      const pagesJson = (await pagesRes.json()) as { pages: Array<{ id: number; status: string }> };
      const drafts = (pagesJson.pages ?? []).filter((p) => p.status !== "published");
      for (const p of drafts) {
        await fetch(`/api/demo/${slug}/pages/${p.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: "published" }),
        });
      }
      setMsg({ kind: "ok", text: `Web publikován (${drafts.length + (pagesJson.pages?.length ?? 0) - drafts.length} stránek)` });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Chyba" });
    } finally {
      setBusy(false);
    }
  }

  async function saveAsDraft() {
    if (state.page.is_homepage) {
      setMsg({ kind: "err", text: "Úvodní stránka musí být publikovaná" });
      return;
    }
    setBusy(true);
    try {
      await state.flushSave();
      const res = await fetch(`/api/demo/${slug}/pages/${state.page.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setMsg({ kind: "ok", text: "Uloženo jako koncept" });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Chyba" });
    } finally {
      setBusy(false);
    }
  }

  async function runMode(m: Mode) {
    setMode(m);
    setOpen(false);
    if (m === "page") await publishCurrentPage();
    else if (m === "site") await publishWholeSite();
    else await saveAsDraft();
  }

  // Publikaci lze vyvolat i odjinud (command palette) přes custom event
  useEffect(() => {
    function onPublishEvent(e: Event) {
      const detail = (e as CustomEvent<{ mode?: Mode }>).detail;
      void runMode(detail?.mode ?? "page");
    }
    window.addEventListener("venom-studio:publish", onPublishEvent);
    return () => window.removeEventListener("venom-studio:publish", onPublishEvent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page.id, state.tenant.slug]);

  const label =
    mode === "draft" ? "Uložit koncept" : mode === "site" ? "Publikovat web" : "Publikovat";

  return (
    <div ref={rootRef} className="relative">
      <div className="vs-publish-group inline-flex h-8 overflow-hidden rounded-lg shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_8px_22px_rgba(var(--vs-cta-rgb),0.34)]">
        <button
          type="button"
          onClick={() => void runMode(mode)}
          disabled={busy}
          className="vs-publish-main inline-flex items-center gap-1.5 bg-[var(--vs-cta-grad)] px-3.5 text-[12.5px] font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {label}
        </button>
        {!minimal && (
          <button
            type="button"
            aria-label="Možnosti publikace"
            onClick={() => setOpen((o) => !o)}
            className="vs-publish-menu grid w-7 place-items-center border-l border-white/20 bg-[var(--vs-cta-grad)] text-white transition-[filter] hover:brightness-110"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && !minimal && (
        <div className="vs-glass vs-pop fixed left-3 right-3 top-[calc(var(--vs-topbar-h)+6px)] z-50 w-auto overflow-hidden rounded-xl border border-[var(--vs-border-strong)] text-[var(--vs-text)] shadow-[var(--vs-shadow-xl)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+6px)] sm:w-[min(340px,calc(100vw-24px))]">
          <Option
            indicator="filled"
            active={mode === "page"}
            title="Publikovat aktuální stránku"
            desc="Zveřejní pouze obsah na aktuální stránce."
            onClick={() => void runMode("page")}
          />
          <Option
            indicator="ring"
            active={mode === "site"}
            title="Publikovat celý web"
            desc="Všechny změny obsahu a designu se projeví na webu."
            onClick={() => void runMode("site")}
          />
          <Option
            indicator="dashed"
            active={mode === "draft"}
            title="Uložit jako koncept"
            desc="Aktuální stránka se uloží, ale nebude zobrazena veřejně na webu."
            onClick={() => void runMode("draft")}
          />
        </div>
      )}

      {msg && (
        <div
          className={`fixed left-3 right-3 top-[calc(var(--vs-topbar-h)+6px)] z-40 rounded-md px-3 py-1.5 text-[11.5px] font-medium shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+6px)] ${
            msg.kind === "ok" ? "bg-emerald-600 text-[var(--vs-text)]" : "bg-red-600 text-[var(--vs-text)]"
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}

function Option({
  indicator,
  active,
  title,
  desc,
  onClick,
}: {
  indicator: "filled" | "ring" | "dashed";
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors ${
        active ? "bg-[var(--vs-surface-2)]" : "hover:bg-[var(--vs-surface)]"
      }`}
    >
      <Indicator kind={indicator} />
      <div className="flex-1">
        <div className="text-[14.5px] font-semibold leading-tight">{title}</div>
        <div className="mt-1 text-[12.5px] leading-snug text-[var(--vs-text-muted)]">{desc}</div>
      </div>
    </button>
  );
}

function Indicator({ kind }: { kind: "filled" | "ring" | "dashed" }) {
  if (kind === "filled") {
    return <span className="mt-[3px] inline-block h-[14px] w-[14px] rounded-full bg-[#22c55e]" />;
  }
  if (kind === "ring") {
    return (
      <span className="mt-[3px] inline-block h-[14px] w-[14px] rounded-full border-2 border-[#22c55e]" />
    );
  }
  // dashed
  return (
    <span
      className="mt-[3px] inline-block h-[14px] w-[14px] rounded-full"
      style={{ border: "1.6px dashed #9ca3af" }}
    />
  );
}
