"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bold, Italic, Underline, Strikethrough, CaseUpper,
  AlignLeft, AlignCenter, AlignRight,
  Copy, ClipboardPaste, RotateCcw, Check, X,
} from "lucide-react";
import { useGenericInlineEditor } from "./GenericInlineEditorContext";
import { useStudioOptional } from "@/components/studio/StudioContext";

// ─── Toolbar geometry + palette. The portal renders outside [data-studio],
//     but design-tokens.css defines --vs-* variables on :root too, so we can
//     consume them directly; hex fallbacks cover non-studio surfaces where
//     the stylesheet isn't loaded. ──────────────────────────────────────────
const TB_W = 516;           // fixed toolbar width — keeps clamping exact
const TB_H = 92;            // estimated height incl. grip row
const TB_TOP_SAFE = 100;    // studio top bar (48) + secondary bar (42) + gap
const TB = {
  bg:          "rgba(20,21,34,0.97)",
  border:      "var(--vs-border-strong, #2d3048)",
  surface:     "var(--vs-surface-2, #1f2131)",
  surfaceHi:   "var(--vs-surface-3, #272a3d)",
  text:        "var(--vs-text, #f5f5f9)",
  textMuted:   "var(--vs-text-muted, #8b8d9e)",
  textDim:     "var(--vs-text-dim, #5c5e6e)",
  accent:      "var(--vs-accent, #d4d4d8)",
  accentHi:    "var(--vs-accent-hi, #f4f4f5)",
  accentBg:    "var(--vs-accent-bg, rgba(212,212,216,0.13))",
  danger:      "var(--vs-danger, #f87171)",
  shadow:      "var(--vs-shadow-lg, 0 1px 0 0 rgba(255,255,255,0.05) inset, 0 18px 38px rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.35))",
};

// Module-level style clipboard — shared across all GenericEditableText instances
let _styleClipboard: import("./GenericInlineEditorContext").GenericTextStyle | null = null;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyTextHighlights(root: HTMLElement, snippets: string[]) {
  const cleanSnippets = snippets.map(s => s.trim()).filter(Boolean);
  if (!cleanSnippets.length) return;

  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])(${cleanSnippets.map(escapeRegExp).join("|")})(?=$|[^\\p{L}\\p{N}_])`, "giu");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  textNodes.forEach(node => {
    const text = node.nodeValue ?? "";
    if (!pattern.test(text)) return;
    pattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    text.replace(pattern, (match, prefix, word, offset) => {
      const wordOffset = offset + prefix.length;
      fragment.append(document.createTextNode(text.slice(lastIndex, wordOffset)));
      const mark = document.createElement("mark");
      mark.textContent = word;
      mark.style.background = "rgba(250, 204, 21, 0.55)";
      mark.style.boxShadow = "0 0 0 3px rgba(250, 204, 21, 0.28)";
      mark.style.borderRadius = "3px";
      mark.style.padding = "0 2px";
      fragment.append(mark);
      lastIndex = wordOffset + word.length;
      return match;
    });

    fragment.append(document.createTextNode(text.slice(lastIndex)));
    node.parentNode?.replaceChild(fragment, node);
  });
}

interface Props {
  sectionId: number;
  field: string;
  value: string;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const FONT_WEIGHTS = [
  { v: "300", l: "Light" }, { v: "400", l: "Normal" }, { v: "500", l: "Medium" },
  { v: "600", l: "Semi" },  { v: "700", l: "Bold" },   { v: "800", l: "Extra" },  { v: "900", l: "Black" },
];

export function GenericEditableText({
  sectionId,
  field,
  value,
  tag = "span",
  className,
  style,
  children,
}: Props) {
  const { isAdmin, highlighted, updateField, updateStyle, updateStyleLocal, getStyle } = useGenericInlineEditor();
  // Optional — present only inside the studio shell. Lets focusing a text
  // field select its parent section so the right inspector shows context.
  const studioCtx = useStudioOptional();
  const ref = useRef<HTMLElement>(null);
  const editing = useRef(false);
  const sessionHasHistory = useRef(false);
  const latestValue = useRef(value);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  // User can drag the toolbar to reposition it (floating)
  const [toolbarUserPos, setToolbarUserPos] = useState<{ top: number; left: number } | null>(null);
  const toolbarDragRef = useRef<{ startMouse: { x: number; y: number }; startPos: { top: number; left: number } } | null>(null);

  // Drag-to-reposition state
  const [elRect, setElRect] = useState<DOMRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const dragInitRectRef = useRef<DOMRect | null>(null);
  // Resize-by-drag state
  const [isResizing, setIsResizing] = useState(false);
  const resizeInitRectRef = useRef<DOMRect | null>(null);

  // Draft style state — snapshot on focus, live preview without saving.
  // draftRef mirrors the state so blur handlers never read a stale closure.
  const snapshotRef = useRef<import("./GenericInlineEditorContext").GenericTextStyle>({});
  const draftRef = useRef<import("./GenericInlineEditorContext").GenericTextStyle>({});
  const [draft, setDraftState] = useState<import("./GenericInlineEditorContext").GenericTextStyle>({});
  const setDraft = (next: import("./GenericInlineEditorContext").GenericTextStyle) => {
    draftRef.current = next;
    setDraftState(next);
  };
  const toolbarRef = useRef<HTMLDivElement>(null);
  // Computed style cache — populated on focus to show actual rendered values in toolbar
  const computedRef = useRef<{ fontSize?: string; fontWeight?: string; color?: string }>({});
  const [clipboardHas, setClipboardHas] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);

  const change = highlighted.find(item => item.sectionId === sectionId && item.field === field);
  const highlightedBlock = Boolean(change && change.snippets.length === 0);
  const fieldStyle = getStyle(sectionId, field);
  const displayStyle = focused ? draft : fieldStyle;
  const alignStyle: React.CSSProperties = displayStyle.textAlign
    ? { display: "block", width: "100%" }
    : {};
  const El = tag as any;

  function applyDraft(patch: Partial<import("./GenericInlineEditorContext").GenericTextStyle>) {
    const next = { ...draft, ...patch };
    // Remove undefined values
    (Object.keys(next) as Array<keyof typeof next>).forEach(k => { if (next[k] === undefined) delete next[k]; });
    setDraft(next);
    updateStyleLocal(sectionId, field, next);
  }

  function commitStyle() {
    updateStyle(sectionId, field, draftRef.current);
    snapshotRef.current = { ...draftRef.current };
  }

  /** Persist draft when the editing session ends with uncommitted changes —
   *  otherwise the canvas shows a style the DB never received. */
  function commitDraftIfChanged() {
    if (JSON.stringify(draftRef.current) !== JSON.stringify(snapshotRef.current)) {
      commitStyle();
    }
  }

  function revertStyle() {
    const snap = { ...snapshotRef.current };
    setDraft(snap);
    updateStyleLocal(sectionId, field, snap);
  }

  function resetStyle() {
    setDraft({});
    updateStyleLocal(sectionId, field, {});
  }

  function copyStyle() {
    _styleClipboard = { ...draft };
    setClipboardHas(true);
    setCopyFlash(true);
    setTimeout(() => setCopyFlash(false), 700);
  }

  function pasteStyle() {
    if (!_styleClipboard) return;
    applyDraft(_styleClipboard);
  }

  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  useLayoutEffect(() => {
    if (!isAdmin || editing.current || !ref.current) return;
    ref.current.textContent = value;
    if (change?.snippets.length) applyTextHighlights(ref.current, change.snippets);
  }, [value, isAdmin, change]);

  useEffect(() => {
    if (!focused || !ref.current) {
      setToolbarPos(null);
      return;
    }
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const isNarrow = window.innerWidth < 640;
      const toolbarW = isNarrow ? Math.min(window.innerWidth - 16, 340) : TB_W;
      // Prefer above the element; flip below when it would cover the top bars.
      const above = rect.top - TB_H - 12;
      const top = above >= TB_TOP_SAFE
        ? above
        : Math.min(window.innerHeight - TB_H - 8, rect.bottom + 12);
      setToolbarPos({
        top: Math.max(8, top),
        left: isNarrow
          ? Math.max(8, (window.innerWidth - toolbarW) / 2)
          : Math.max(8, Math.min(rect.left + rect.width / 2 - toolbarW / 2, window.innerWidth - toolbarW - 8)),
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [focused]);

  // Track element bounding rect for drag/resize handle positioning
  useEffect(() => {
    if (!isAdmin) return;
    if (!hovered && !focused && !isDragging && !isResizing) {
      setElRect(null);
      return;
    }
    function update() {
      if (!ref.current) return;
      setElRect(ref.current.getBoundingClientRect());
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, hovered, focused, isDragging, isResizing]);

  function startDrag(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!ref.current) return;
    dragInitRectRef.current = ref.current.getBoundingClientRect();
    const stored = getStyle(sectionId, field);
    const storedTx = parseFloat(stored.translateX ?? "0") || 0;
    const storedTy = parseFloat(stored.translateY ?? "0") || 0;
    const startMouse = { x: e.clientX, y: e.clientY };
    // CSS zoom on the canvas container — convert viewport px → canvas px
    const canvasZoom = (() => {
      let el: HTMLElement | null = ref.current;
      while (el) {
        if (el.hasAttribute("data-studio-canvas-preview")) {
          const z = parseFloat(window.getComputedStyle(el).zoom || "1");
          return isNaN(z) || z <= 0 ? 1 : z;
        }
        el = el.parentElement;
      }
      return 1;
    })();
    let finalTx = storedTx;
    let finalTy = storedTy;
    setIsDragging(true);
    setDragDelta({ dx: 0, dy: 0 });

    // Apply offset via position:relative left/top — immune to CSS animations
    // (CSS animations have higher cascade priority than inline transform, but NOT than position:relative offsets
    //  for properties they don't animate. Template animations typically use transform/opacity, not left/top.)
    const el = ref.current;
    el.style.position = "relative";

    function onMove(ev: PointerEvent) {
      const dx = (ev.clientX - startMouse.x) / canvasZoom;
      const dy = (ev.clientY - startMouse.y) / canvasZoom;
      finalTx = storedTx + dx;
      finalTy = storedTy + dy;
      // Direct DOM write — bypasses React render cycle, wins over CSS animations
      el.style.left = `${Math.round(finalTx)}px`;
      el.style.top  = `${Math.round(finalTy)}px`;
      // Update drag handle position (viewport px, portal is position:fixed)
      setDragDelta({ dx: ev.clientX - startMouse.x, dy: ev.clientY - startMouse.y });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setIsDragging(false);
      setDragDelta({ dx: 0, dy: 0 });
      dragInitRectRef.current = null;
      // Save to server — next React render will apply via style prop
      updateStyle(sectionId, field, { ...stored, translateX: `${Math.round(finalTx)}px`, translateY: `${Math.round(finalTy)}px` });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function startResize(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizeInitRectRef.current = ref.current?.getBoundingClientRect() ?? null;
    const stored = getStyle(sectionId, field);
    const computedSize = ref.current ? parseFloat(window.getComputedStyle(ref.current).fontSize) : 16;
    const baseFontSize = parseFloat(stored.fontSize ?? "") || computedSize;
    const startY = e.clientY;
    let finalSize = baseFontSize;
    setIsResizing(true);

    function onMove(ev: PointerEvent) {
      const dy = startY - ev.clientY; // drag up → bigger
      finalSize = Math.max(6, Math.min(320, Math.round(baseFontSize + dy * 0.5)));
      updateStyleLocal(sectionId, field, { ...stored, fontSize: `${finalSize}px` });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setIsResizing(false);
      resizeInitRectRef.current = null;
      updateStyle(sectionId, field, { ...stored, fontSize: `${finalSize}px` });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  if (!isAdmin) {
    const { translateX: fTx, translateY: fTy, ...publicCss } = fieldStyle;
    const fTxV = parseFloat(fTx ?? "0") || 0;
    const fTyV = parseFloat(fTy ?? "0") || 0;
    const pubOffset: React.CSSProperties = (fTxV || fTyV) ? { position: "relative", left: fTxV, top: fTyV } : {};
    return <El className={className} style={{ ...style, ...publicCss, ...alignStyle, ...pubOffset }}>{children ?? value}</El>;
  }

  // Extract translateX/translateY — stored as strings ("Xpx"), applied as position:relative left/top
  // (position:relative left/top is NOT affected by CSS animations unlike transform)
  const { translateX: txProp, translateY: tyProp, ...pureCssStyle } = displayStyle;
  const txVal = parseFloat(txProp ?? "0") || 0;
  const tyVal = parseFloat(tyProp ?? "0") || 0;
  const offsetStyle: React.CSSProperties = (txVal || tyVal) ? { position: "relative", left: txVal, top: tyVal } : {};

  // Drag/resize handles show when element is focused (selected by click) — not on hover
  // This avoids the handle disappearing before the user can click it
  const showHandles = focused && elRect !== null;
  const dragHandleLeft = isDragging && dragInitRectRef.current
    ? dragInitRectRef.current.left + dragDelta.dx
    : (elRect?.left ?? 0);
  const dragHandleTop = isDragging && dragInitRectRef.current
    ? dragInitRectRef.current.top + dragDelta.dy - 28
    : (elRect?.top ?? 0) - 28;
  const resizeHandleLeft = isResizing && resizeInitRectRef.current
    ? resizeInitRectRef.current.right - 10
    : (elRect?.right ?? 0) - 10;
  const resizeHandleTop = isResizing && resizeInitRectRef.current
    ? resizeInitRectRef.current.bottom - 10
    : (elRect?.bottom ?? 0) - 10;

  // Use computed style as fallback so toolbar reflects actual rendered appearance
  const effectiveWeight = draft.fontWeight ?? computedRef.current.fontWeight ?? "400";
  const effectiveSize   = draft.fontSize   ?? computedRef.current.fontSize;
  const effectiveColor  = draft.color      ?? computedRef.current.color;

  const isBold      = Number(effectiveWeight) >= 600;
  const isItalic    = draft.fontStyle === "italic";
  const isUnderline = draft.textDecoration === "underline";
  const isStrike    = draft.textDecoration === "line-through";
  const isUpper     = draft.textTransform === "uppercase";

  // Floating toolbar drag
  function startToolbarDrag(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const startPos = toolbarUserPos ?? { top: toolbarPos?.top ?? 8, left: toolbarPos?.left ?? 8 };
    toolbarDragRef.current = { startMouse: { x: e.clientX, y: e.clientY }, startPos };
    function onMove(ev: PointerEvent) {
      if (!toolbarDragRef.current) return;
      const dx = ev.clientX - toolbarDragRef.current.startMouse.x;
      const dy = ev.clientY - toolbarDragRef.current.startMouse.y;
      setToolbarUserPos({
        top: Math.max(4, Math.min(window.innerHeight - 48, toolbarDragRef.current.startPos.top + dy)),
        left: Math.max(4, Math.min(window.innerWidth - TB_W - 4, toolbarDragRef.current.startPos.left + dx)),
      });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      toolbarDragRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const finalToolbarTop = toolbarUserPos?.top ?? toolbarPos?.top ?? 8;
  const finalToolbarLeft = toolbarUserPos?.left ?? toolbarPos?.left ?? 8;

  const toolbar = focused && toolbarPos
    ? createPortal(
        <div
          ref={toolbarRef}
          tabIndex={-1}
          onBlur={(e) => {
            // Close toolbar when focus leaves both toolbar AND contentEditable
            const next = e.relatedTarget as Node | null;
            if (next && (toolbarRef.current?.contains(next) || ref.current?.contains(next))) return;
            commitDraftIfChanged();
            editing.current = false;
            setFocused(false);
          }}
          style={{
            position: "fixed",
            top: finalToolbarTop,
            left: finalToolbarLeft,
            zIndex: 100000,
            display: "flex",
            alignItems: "stretch",
            width: TB_W,
            borderRadius: 12,
            background: TB.bg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: TB.shadow,
            color: TB.text,
            fontFamily: "Inter, system-ui, sans-serif",
            border: `1px solid ${TB.border}`,
            outline: "none",
            overflow: "hidden",
          }}
        >
          <style>{`
            .vs-tb-btn { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border:none; border-radius:7px; background:transparent; color:${TB.textMuted}; cursor:pointer; padding:0; transition:background .12s ease, color .12s ease; }
            .vs-tb-btn:hover { background:${TB.surfaceHi}; color:${TB.text}; }
            .vs-tb-btn[data-active="true"] { background:${TB.accentBg}; color:${TB.accentHi}; }
            .vs-tb-btn:disabled { color:#3a3a44; cursor:default; background:transparent; }
            .vs-tb-btn[data-flash="true"] { background:${TB.accentBg}; color:${TB.accentHi}; }
            .vs-tb-input { height:26px; border-radius:6px; border:1px solid ${TB.border}; background:${TB.surface}; color:${TB.text}; font-size:11.5px; padding:0 7px; outline:none; transition:border-color .12s ease; font-family:inherit; }
            .vs-tb-input:focus { border-color:rgba(212,212,216,0.55); }
            .vs-tb-input::-webkit-outer-spin-button, .vs-tb-input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
            .vs-tb-label { font-size:9.5px; letter-spacing:.05em; color:${TB.textDim}; text-transform:uppercase; font-weight:600; white-space:nowrap; }
            .vs-tb-sep { width:1px; height:18px; background:${TB.border}; margin:0 5px; flex-shrink:0; align-self:center; }
            .vs-tb-action { height:27px; padding:0 10px; border-radius:7px; border:1px solid ${TB.border}; background:${TB.surface}; color:#d1d1d9; font-size:11.5px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:background .12s ease, color .12s ease; font-family:inherit; }
            .vs-tb-action:hover { background:${TB.surfaceHi}; color:${TB.text}; }
            .vs-tb-action[data-danger="true"]:hover { background:rgba(248,113,113,0.12); color:${TB.danger}; border-color:rgba(248,113,113,0.35); }
            .vs-tb-primary { height:27px; padding:0 12px; border-radius:7px; border:none; background-image:var(--vs-grad-brand, linear-gradient(135deg,var(--vs-accent) 0%,var(--vs-accent) 60%,#7c5cf6 100%)); color:#fff; font-size:11.5px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 8px rgba(20,184,166,0.35); font-family:inherit; transition:filter .12s ease; }
            .vs-tb-primary:hover { filter:brightness(1.12); }
          `}</style>

          {/* Drag grip — left edge column */}
          <div
            onPointerDown={startToolbarDrag}
            title="Přesunout panel"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, cursor: "grab", flexShrink: 0, background: TB.surface, borderRight: `1px solid ${TB.border}` }}
          >
            <svg width="6" height="22" viewBox="0 0 6 22" fill="none">
              {[2, 8.5, 15, 21].slice(0, 3).map((y) => (
                <g key={y}>
                  <circle cx="1.5" cy={y + 1} r="1.2" fill={TB.textDim} />
                  <circle cx="4.5" cy={y + 1} r="1.2" fill={TB.textDim} />
                </g>
              ))}
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, padding: "6px 8px", minWidth: 0, flex: 1 }}>
            {/* Row 1: formatting */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button type="button" className="vs-tb-btn" data-active={isBold} title="Tučně"
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ fontWeight: isBold ? "400" : "700" }); }}>
                <Bold size={14} strokeWidth={2.2} />
              </button>
              <button type="button" className="vs-tb-btn" data-active={isItalic} title="Kurzíva"
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ fontStyle: isItalic ? undefined : "italic" }); }}>
                <Italic size={14} strokeWidth={2} />
              </button>
              <button type="button" className="vs-tb-btn" data-active={isUnderline} title="Podtržení"
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ textDecoration: isUnderline ? undefined : "underline" }); }}>
                <Underline size={14} strokeWidth={2} />
              </button>
              <button type="button" className="vs-tb-btn" data-active={isStrike} title="Přeškrtnutí"
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ textDecoration: isStrike ? undefined : "line-through" }); }}>
                <Strikethrough size={14} strokeWidth={2} />
              </button>
              <button type="button" className="vs-tb-btn" data-active={isUpper} title="Verzálky"
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ textTransform: isUpper ? undefined : "uppercase" }); }}>
                <CaseUpper size={16} strokeWidth={2} />
              </button>

              <div className="vs-tb-sep" />

              <input
                type="number"
                className="vs-tb-input"
                title="Velikost písma (px)"
                min={6} max={320} step={1}
                value={effectiveSize ? parseFloat(effectiveSize) : ""}
                placeholder="px"
                onChange={(e) => applyDraft({ fontSize: e.target.value ? `${e.target.value}px` : undefined })}
                style={{ width: 46 }}
              />
              <select
                className="vs-tb-input"
                title="Tloušťka písma"
                value={effectiveWeight}
                onChange={(e) => applyDraft({ fontWeight: e.target.value || undefined })}
                style={{ width: 78 }}
              >
                {FONT_WEIGHTS.map(w => <option key={w.v} value={w.v}>{w.l}</option>)}
              </select>

              <div className="vs-tb-sep" />

              <label className="vs-tb-btn" title="Barva textu" style={{ position: "relative", cursor: "pointer" }}>
                <span style={{ display: "block", width: 15, height: 15, borderRadius: 4, border: "1px solid rgba(255,255,255,0.25)", background: effectiveColor ?? "#ffffff" }} />
                <input type="color" value={draft.color ?? "#ffffff"}
                  onChange={(e) => applyDraft({ color: e.target.value })}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
              </label>

              <div className="vs-tb-sep" />

              <button type="button" className="vs-tb-btn" data-active={draft.textAlign === "left"} title="Zarovnat vlevo"
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ textAlign: draft.textAlign === "left" ? undefined : "left" }); }}>
                <AlignLeft size={14} strokeWidth={2} />
              </button>
              <button type="button" className="vs-tb-btn" data-active={draft.textAlign === "center"} title="Zarovnat na střed"
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ textAlign: draft.textAlign === "center" ? undefined : "center" }); }}>
                <AlignCenter size={14} strokeWidth={2} />
              </button>
              <button type="button" className="vs-tb-btn" data-active={draft.textAlign === "right"} title="Zarovnat vpravo"
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ textAlign: draft.textAlign === "right" ? undefined : "right" }); }}>
                <AlignRight size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Row 2: spacing + clipboard + commit/revert */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, borderTop: `1px solid ${TB.border}`, paddingTop: 6, marginTop: 6 }}>
              <span className="vs-tb-label" title="Rozestup znaků">Rozestup</span>
              <input type="number" className="vs-tb-input" min={-5} max={20} step={0.5}
                title="Rozestup znaků (px)"
                value={draft.letterSpacing ? parseFloat(draft.letterSpacing) : ""}
                placeholder="0"
                onChange={(e) => applyDraft({ letterSpacing: e.target.value ? `${e.target.value}px` : undefined })}
                style={{ width: 46, height: 24 }}
              />
              <span className="vs-tb-label" title="Výška řádku">Řádek</span>
              <input type="number" className="vs-tb-input" min={0.8} max={4} step={0.1}
                title="Výška řádku (násobek)"
                value={draft.lineHeight ? parseFloat(draft.lineHeight) : ""}
                placeholder="—"
                onChange={(e) => applyDraft({ lineHeight: e.target.value || undefined })}
                style={{ width: 46, height: 24 }}
              />

              <div style={{ flex: 1 }} />

              <button type="button" className="vs-tb-btn" data-flash={copyFlash} title="Kopírovat styl (⌘⇧C)"
                onMouseDown={(e) => { e.preventDefault(); copyStyle(); }}>
                {copyFlash ? <Check size={13.5} strokeWidth={2.2} /> : <Copy size={13.5} strokeWidth={2} />}
              </button>
              <button type="button" className="vs-tb-btn" title="Vložit styl (⌘⇧V)"
                onMouseDown={(e) => { e.preventDefault(); pasteStyle(); }}
                disabled={!clipboardHas}>
                <ClipboardPaste size={13.5} strokeWidth={2} />
              </button>
              <button type="button" className="vs-tb-btn" title="Resetovat na výchozí styl šablony"
                onMouseDown={(e) => { e.preventDefault(); resetStyle(); }}>
                <RotateCcw size={13} strokeWidth={2} />
              </button>

              <div className="vs-tb-sep" />

              <button type="button" className="vs-tb-action" data-danger="true" title="Zahodit změny (Esc)"
                onMouseDown={(e) => { e.preventDefault(); revertStyle(); }}>
                <X size={13} strokeWidth={2.2} /> Zrušit
              </button>
              <button type="button" className="vs-tb-primary" title="Uložit styl (⌘Enter)"
                onMouseDown={(e) => { e.preventDefault(); commitStyle(); }}>
                <Check size={13} strokeWidth={2.4} /> Uložit
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  const dragHandleEl = (showHandles || isDragging) ? createPortal(
    <div
      style={{
        position: "fixed",
        left: Math.max(4, dragHandleLeft),
        top: Math.max(4, dragHandleTop),
        zIndex: 100001,
        cursor: isDragging ? "grabbing" : "grab",
        width: 22,
        height: 22,
        background: "var(--vs-accent)",
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
        userSelect: "none",
        touchAction: "none",
      }}
      title="Přesunout (drag)"
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={startDrag}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="3.5" cy="2.5" r="1.2" fill="white" />
        <circle cx="8.5" cy="2.5" r="1.2" fill="white" />
        <circle cx="3.5" cy="6" r="1.2" fill="white" />
        <circle cx="8.5" cy="6" r="1.2" fill="white" />
        <circle cx="3.5" cy="9.5" r="1.2" fill="white" />
        <circle cx="8.5" cy="9.5" r="1.2" fill="white" />
      </svg>
    </div>,
    document.body
  ) : null;

  const resizeHandleEl = (showHandles || isResizing) ? createPortal(
    <div
      style={{
        position: "fixed",
        left: resizeHandleLeft,
        top: resizeHandleTop,
        zIndex: 100001,
        cursor: "se-resize",
        width: 14,
        height: 14,
        background: "var(--vs-accent)",
        borderRadius: 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        userSelect: "none",
        touchAction: "none",
      }}
      title="Změnit velikost (drag nahoru/dolů)"
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={startResize}
    />,
    document.body
  ) : null;

  return (
    <>
      {toolbar}
      {dragHandleEl}
      {resizeHandleEl}
      <El
        ref={ref}
        className={className}
        style={{
          ...style,
          ...pureCssStyle,
          ...alignStyle,
          ...offsetStyle,
          outline: focused
            ? "2px solid var(--vs-accent)"
            : highlightedBlock
              ? "3px solid rgba(245, 158, 11, 0.95)"
              : hovered
                ? "1px dashed rgba(212,212,216,0.65)"
                : "none",
          outlineOffset: 3,
          boxShadow: highlightedBlock ? "0 0 0 7px rgba(245, 158, 11, 0.18)" : undefined,
          borderRadius: 3,
          cursor: "text",
          minWidth: "4px",
          transition: "outline-color 0.2s ease, box-shadow 0.25s ease",
        }}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => {
          editing.current = true;
          sessionHasHistory.current = false;
          if (ref.current) ref.current.textContent = latestValue.current;
          // Snapshot stored style for revert
          const stored = getStyle(sectionId, field);
          snapshotRef.current = { ...stored };
          setDraft({ ...stored });
          setClipboardHas(_styleClipboard !== null);
          // Cache computed style so toolbar shows actual rendered values (e.g. CSS-class font size)
          if (ref.current) {
            const cs = window.getComputedStyle(ref.current);
            const rawSize = parseFloat(cs.fontSize);
            const roundedSize = isNaN(rawSize) ? undefined : `${Math.round(rawSize)}px`;
            computedRef.current = {
              fontSize: roundedSize,
              fontWeight: cs.fontWeight || undefined,
              color: cs.color || undefined,
            };
          }
          setFocused(true);
          // Select the parent section in the studio so the inspector opens
          // with relevant context instead of the empty state.
          studioCtx?.setSelection(sectionId, field);
        }}
        onPaste={(event: React.ClipboardEvent<HTMLElement>) => {
          event.preventDefault();
          const plain = event.clipboardData.getData("text/plain");
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return;
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const node = document.createTextNode(plain);
          range.insertNode(node);
          range.setStartAfter(node);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }}
        onInput={(event: React.FormEvent<HTMLElement>) => {
          const nextValue = event.currentTarget.textContent ?? "";
          latestValue.current = nextValue;
          updateField(sectionId, field, nextValue, { recordHistory: !sessionHasHistory.current });
          sessionHasHistory.current = true;
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === "Escape") { revertStyle(); event.currentTarget.blur(); return; }
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); commitStyle(); ref.current?.blur(); return; }
          if (event.key === "c" && (event.metaKey || event.ctrlKey) && event.shiftKey) { event.preventDefault(); copyStyle(); return; }
          if (event.key === "v" && (event.metaKey || event.ctrlKey) && event.shiftKey) { event.preventDefault(); pasteStyle(); return; }
        }}
        onBlur={(event: React.FocusEvent<HTMLElement>) => {
          // If focus moved into the toolbar, keep editing open
          if (toolbarRef.current?.contains(event.relatedTarget as Node)) return;
          commitDraftIfChanged();
          const nextValue = event.currentTarget.textContent ?? "";
          editing.current = false;
          setFocused(false);
          if (nextValue !== latestValue.current) {
            latestValue.current = nextValue;
            updateField(sectionId, field, nextValue, { recordHistory: !sessionHasHistory.current });
          }
          sessionHasHistory.current = false;
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
    </>
  );
}
