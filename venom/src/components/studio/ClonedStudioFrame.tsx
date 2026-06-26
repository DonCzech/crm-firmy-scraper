"use client";

import { useEffect, useRef, useState } from "react";
import { useStudio, type CloneSelection, type CloneCommand } from "./StudioContext";

interface Props {
  tenantSlug: string;
  /** Inner iframe width in px (390 mobile / 768 tablet / 1280 desktop) */
  width: number;
  /** CSS selector to scroll into view inside the iframe */
  scrollTo?: string | null;
}

/**
 * Embeds /demo/{slug} in a same-origin iframe so the original WP CSS media
 * queries fire correctly against the iframe's own viewport width. Because
 * it's same-origin, the parent can directly query the iframe DOM for
 * scroll-into-view and click highlighting — no postMessage needed.
 */
export function ClonedStudioFrame({ tenantSlug, width, scrollTo }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const studio = useStudio();

  // ── Iframe → Parent: selection messages ──────────────────────────────────
  // Use ref to setCloneSelected so studio identity changes don't re-register
  // the listener (which causes infinite render loops).
  const setCloneSelectedRef = useRef(studio.setCloneSelected);
  setCloneSelectedRef.current = studio.setCloneSelected;
  useEffect(() => {
    function onMsg(ev: MessageEvent) {
      const d = ev.data as { __weberoStudio?: boolean; type?: string; payload?: CloneSelection };
      if (!d || !d.__weberoStudio) return;
      if (d.type === "select" && d.payload) {
        setCloneSelectedRef.current(d.payload);
      } else if (d.type === "deselect") {
        setCloneSelectedRef.current(null);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // ── Parent → Iframe: command sender ──────────────────────────────────────
  // Register a sender into studio context so the right-side Inspector can
  // dispatch style/text/src patches. Sender is a stable closure over `ref`
  // — only re-registered when `loaded` flips (iframe contentWindow becomes
  // available).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const sender = (cmd: CloneCommand) => {
      const win = ref.current?.contentWindow;
      if (!win) return;
      win.postMessage({ __weberoStudioCmd: true, ...cmd }, "*");
    };
    studio.setCloneCommand(sender);
    return () => studio.setCloneCommand(null);
  }, [loaded]);

  // Sub-layer scroll: directly manipulate iframe DOM (same-origin)
  useEffect(() => {
    if (!scrollTo || !loaded) return;
    const doc = ref.current?.contentDocument;
    if (!doc) return;
    let el: HTMLElement | null = null;
    try {
      el = doc.querySelector(scrollTo) as HTMLElement | null;
    } catch {
      return;
    }
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const prev = el.style.outline;
    const prevOffset = el.style.outlineOffset;
    el.style.outline = "3px solid #6366f1";
    el.style.outlineOffset = "2px";
    const t = setTimeout(() => {
      if (!el) return;
      el.style.outline = prev;
      el.style.outlineOffset = prevOffset;
    }, 1400);
    return () => clearTimeout(t);
  }, [scrollTo, loaded]);

  // Selection state is now driven by postMessage from inside the iframe
  // (ClonedSiteRenderer emits `__weberoStudio: select/deselect`).

  return (
    <iframe
      ref={ref}
      title="Cloned site preview"
      src={`/demo/${tenantSlug}/edit-frame`}
      onLoad={() => setLoaded(true)}
      style={{
        width,
        height: 900, // fixed canvas — inner content scrolls within
        border: "0",
        display: "block",
        background: "#fff",
      }}
    />
  );
}
