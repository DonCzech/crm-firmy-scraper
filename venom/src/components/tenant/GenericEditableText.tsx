"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGenericInlineEditor } from "./GenericInlineEditorContext";

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
  /** Live translate during drag — overrides displayStyle.translateX/Y so element follows immediately */
  const [liveTranslate, setLiveTranslate] = useState<{ x: number; y: number } | null>(null);
  // Resize-by-drag state
  const [isResizing, setIsResizing] = useState(false);
  const resizeInitRectRef = useRef<DOMRect | null>(null);

  // Draft style state — snapshot on focus, live preview without saving
  const snapshotRef = useRef<import("./GenericInlineEditorContext").GenericTextStyle>({});
  const [draft, setDraft] = useState<import("./GenericInlineEditorContext").GenericTextStyle>({});
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
    updateStyle(sectionId, field, draft);
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
      const toolbarW = isNarrow ? Math.min(window.innerWidth - 16, 320) : 360;
      setToolbarPos({
        top: Math.max(8, rect.top - 54),
        left: isNarrow
          ? Math.max(8, Math.min((window.innerWidth - toolbarW) / 2, window.innerWidth - toolbarW - 8))
          : Math.max(8, Math.min(rect.left, window.innerWidth - toolbarW - 8)),
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
    dragInitRectRef.current = ref.current?.getBoundingClientRect() ?? null;
    const stored = getStyle(sectionId, field);
    const storedTx = parseFloat(stored.translateX ?? "0") || 0;
    const storedTy = parseFloat(stored.translateY ?? "0") || 0;
    const startMouse = { x: e.clientX, y: e.clientY };
    let finalTx = storedTx;
    let finalTy = storedTy;
    setIsDragging(true);
    setDragDelta({ dx: 0, dy: 0 });

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startMouse.x;
      const dy = ev.clientY - startMouse.y;
      finalTx = storedTx + dx;
      finalTy = storedTy + dy;
      setDragDelta({ dx, dy });
      // liveTranslate overrides displayStyle transform so the element follows the drag immediately
      setLiveTranslate({ x: Math.round(finalTx), y: Math.round(finalTy) });
      updateStyleLocal(sectionId, field, { ...stored, translateX: `${Math.round(finalTx)}px`, translateY: `${Math.round(finalTy)}px` });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setIsDragging(false);
      setDragDelta({ dx: 0, dy: 0 });
      setLiveTranslate(null);
      dragInitRectRef.current = null;
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
    const publicTransform = (fTxV || fTyV) ? `translate(${fTxV}px, ${fTyV}px)` : undefined;
    return <El className={className} style={{ ...style, ...publicCss, ...alignStyle, transform: publicTransform }}>{children ?? value}</El>;
  }

  // Extract translateX/translateY — not valid CSS; converted to transform below
  const { translateX: txProp, translateY: tyProp, ...pureCssStyle } = displayStyle;
  // liveTranslate takes priority during drag so the element follows pointer immediately
  // (displayStyle.translateX/Y lags one render behind because updateStyleLocal → context → re-render)
  const txVal = liveTranslate?.x ?? (parseFloat(txProp ?? "0") || 0);
  const tyVal = liveTranslate?.y ?? (parseFloat(tyProp ?? "0") || 0);
  const transformStr = (txVal || tyVal) ? `translate(${txVal}px, ${tyVal}px)` : undefined;

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

  const btnBase: React.CSSProperties = {
    minWidth: 28, height: 28, border: "none", borderRadius: 6,
    background: "rgba(255,255,255,0.10)", color: "#fff", cursor: "pointer", fontSize: 12,
  };
  const btnActive: React.CSSProperties = { ...btnBase, background: "#6d28d9", color: "#fff" };

  // Floating toolbar drag
  function startToolbarDrag(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const autoTop = toolbarPos ? Math.max(8, toolbarPos.top - 30) : 8;
    const autoLeft = toolbarPos ? Math.max(8, Math.min(toolbarPos.left, window.innerWidth - 524)) : 8;
    const startPos = toolbarUserPos ?? { top: autoTop, left: autoLeft };
    toolbarDragRef.current = { startMouse: { x: e.clientX, y: e.clientY }, startPos };
    function onMove(ev: PointerEvent) {
      if (!toolbarDragRef.current) return;
      const dx = ev.clientX - toolbarDragRef.current.startMouse.x;
      const dy = ev.clientY - toolbarDragRef.current.startMouse.y;
      setToolbarUserPos({
        top: Math.max(4, toolbarDragRef.current.startPos.top + dy),
        left: Math.max(4, Math.min(window.innerWidth - 524, toolbarDragRef.current.startPos.left + dx)),
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

  const finalToolbarTop = toolbarUserPos?.top ?? (toolbarPos ? Math.max(8, toolbarPos.top - 30) : 8);
  const finalToolbarLeft = toolbarUserPos?.left ?? (toolbarPos ? Math.max(8, Math.min(toolbarPos.left, window.innerWidth - 524)) : 8);

  const toolbar = focused && toolbarPos
    ? createPortal(
        <div
          ref={toolbarRef}
          tabIndex={-1}
          onBlur={(e) => {
            // Close toolbar when focus leaves both toolbar AND contentEditable
            const next = e.relatedTarget as Node | null;
            if (next && (toolbarRef.current?.contains(next) || ref.current?.contains(next))) return;
            editing.current = false;
            setFocused(false);
          }}
          style={{
            position: "fixed",
            top: finalToolbarTop,
            left: finalToolbarLeft,
            zIndex: 100000,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "4px 8px 7px",
            borderRadius: 12,
            background: "#0f172a",
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            minWidth: 500,
            border: "1px solid rgba(255,255,255,0.08)",
            outline: "none",
          }}
        >
          {/* Drag grip — move toolbar */}
          <div
            onPointerDown={startToolbarDrag}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 14, cursor: "grab", marginBottom: 1, flexShrink: 0 }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)" }} />
          </div>
          {/* Row 1: formatting */}
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {/* B */}
            <button type="button" title="Tučně" onMouseDown={(e) => { e.preventDefault(); applyDraft({ fontWeight: isBold ? "400" : "700" }); }}
              style={{ ...isBold ? btnActive : btnBase, fontWeight: 800 }}>B</button>
            {/* I */}
            <button type="button" title="Kurzíva" onMouseDown={(e) => { e.preventDefault(); applyDraft({ fontStyle: isItalic ? undefined : "italic" }); }}
              style={{ ...isItalic ? btnActive : btnBase, fontStyle: "italic" }}>I</button>
            {/* U */}
            <button type="button" title="Podtržení" onMouseDown={(e) => { e.preventDefault(); applyDraft({ textDecoration: isUnderline ? undefined : "underline" }); }}
              style={{ ...isUnderline ? btnActive : btnBase, textDecoration: "underline" }}>U</button>
            {/* S */}
            <button type="button" title="Přeškrtnutí" onMouseDown={(e) => { e.preventDefault(); applyDraft({ textDecoration: isStrike ? undefined : "line-through" }); }}
              style={{ ...isStrike ? btnActive : btnBase, textDecoration: "line-through" }}>S</button>
            {/* AA */}
            <button type="button" title="Verzálky" onMouseDown={(e) => { e.preventDefault(); applyDraft({ textTransform: isUpper ? undefined : "uppercase" }); }}
              style={{ ...isUpper ? btnActive : btnBase, fontSize: 11, fontWeight: 700 }}>AA</button>

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 3px" }} />

            {/* Font size */}
            <span style={{ fontSize: 10, color: "#64748b", marginLeft: 2 }}>Vel.</span>
            <input
              type="number"
              title="Vlastní velikost písma"
              min={6} max={320} step={1}
              value={effectiveSize ? parseFloat(effectiveSize) : ""}
              placeholder="—"
              onChange={(e) => applyDraft({ fontSize: e.target.value ? `${e.target.value}px` : undefined })}
              style={{ width: 48, height: 28, borderRadius: 6, border: "1px solid #1e293b", background: "#1e293b", color: "#fff", fontSize: 12, padding: "0 6px" }}
            />

            {/* Font weight */}
            <span style={{ fontSize: 10, color: "#64748b" }}>Tl.</span>
            <select
              title="Tloušťka písma"
              value={effectiveWeight}
              onChange={(e) => applyDraft({ fontWeight: e.target.value || undefined })}
              style={{ height: 28, borderRadius: 6, border: "1px solid #1e293b", background: "#1e293b", color: "#fff", fontSize: 12, paddingLeft: 4 }}
            >
              {FONT_WEIGHTS.map(w => <option key={w.v} value={w.v}>{w.l}</option>)}
            </select>

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 3px" }} />

            {/* Color */}
            <label title="Barva textu" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.10)", cursor: "pointer" }}>
              <span style={{ display: "block", width: 14, height: 14, borderRadius: 3, border: "1px solid rgba(255,255,255,0.25)", background: effectiveColor ?? "#ffffff" }} />
              <input type="color" value={draft.color ?? "#ffffff"}
                onChange={(e) => applyDraft({ color: e.target.value })}
                style={{ position: "absolute", width: 0, height: 0, opacity: 0 }} />
            </label>

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 3px" }} />

            {/* Alignment */}
            {(["left","center","right"] as const).map(a => (
              <button key={a} type="button" title={a === "left" ? "Vlevo" : a === "center" ? "Střed" : "Vpravo"}
                onMouseDown={(e) => { e.preventDefault(); applyDraft({ textAlign: draft.textAlign === a ? undefined : a }); }}
                style={{ ...draft.textAlign === a ? btnActive : btnBase, fontSize: 13, fontWeight: 700 }}>
                {a === "left" ? "←" : a === "center" ? "↔" : "→"}
              </button>
            ))}
          </div>

          {/* Row 2: spacing + commit/revert */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 5 }}>
            <span style={{ fontSize: 10, color: "#64748b" }}>Rozs.</span>
            <input type="number" min={-5} max={20} step={0.5}
              value={draft.letterSpacing ? parseFloat(draft.letterSpacing) : ""}
              placeholder="0"
              onChange={(e) => applyDraft({ letterSpacing: e.target.value ? `${e.target.value}px` : undefined })}
              style={{ width: 52, height: 24, borderRadius: 5, border: "1px solid #1e293b", background: "#1e293b", color: "#fff", fontSize: 11, padding: "0 6px" }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>Výška</span>
            <input type="number" min={0.8} max={4} step={0.1}
              value={draft.lineHeight ? parseFloat(draft.lineHeight) : ""}
              placeholder="—"
              onChange={(e) => applyDraft({ lineHeight: e.target.value || undefined })}
              style={{ width: 52, height: 24, borderRadius: 5, border: "1px solid #1e293b", background: "#1e293b", color: "#fff", fontSize: 11, padding: "0 6px" }}
            />
            <div style={{ flex: 1 }} />
            {/* Copy style */}
            <button type="button" title="Kopírovat styl (⌘⇧C)"
              onMouseDown={(e) => { e.preventDefault(); copyStyle(); }}
              style={{ height: 26, padding: "0 10px", borderRadius: 6, border: `1px solid ${copyFlash ? "#6366f1" : "#1e293b"}`, background: copyFlash ? "rgba(99,102,241,0.18)" : "#1e293b", color: copyFlash ? "#a5b4fc" : "#94a3b8", fontSize: 11, cursor: "pointer", transition: "all 0.25s" }}>
              Kopír.
            </button>
            {/* Paste style */}
            <button type="button" title="Vložit styl (⌘⇧V)"
              onMouseDown={(e) => { e.preventDefault(); pasteStyle(); }}
              disabled={!clipboardHas}
              style={{ height: 26, padding: "0 10px", borderRadius: 6, border: "1px solid #1e293b", background: "#1e293b", color: clipboardHas ? "#94a3b8" : "#334155", fontSize: 11, cursor: clipboardHas ? "pointer" : "default" }}>
              Vložit
            </button>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)" }} />
            {/* Reset */}
            <button type="button" title="Resetovat styl"
              onMouseDown={(e) => { e.preventDefault(); resetStyle(); }}
              style={{ height: 26, padding: "0 10px", borderRadius: 6, border: "1px solid #1e293b", background: "#1e293b", color: "#94a3b8", fontSize: 11, cursor: "pointer" }}>
              Reset
            </button>
            {/* Revert */}
            <button type="button" title="Zahodit změny (Esc)"
              onMouseDown={(e) => { e.preventDefault(); revertStyle(); }}
              style={{ height: 26, padding: "0 10px", borderRadius: 6, border: "1px solid #1e293b", background: "#1e293b", color: "#f87171", fontSize: 11, cursor: "pointer" }}>
              Zrušit
            </button>
            {/* Commit */}
            <button type="button" title="Uložit styl (⌘Enter)"
              onMouseDown={(e) => { e.preventDefault(); commitStyle(); }}
              style={{ height: 26, padding: "0 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              Uložit
            </button>
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
        background: "#7c3aed",
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
        userSelect: "none",
        touchAction: "none",
      }}
      title="Přesunout (drag)"
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
        background: "#7c3aed",
        borderRadius: 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        userSelect: "none",
        touchAction: "none",
      }}
      title="Změnit velikost (drag nahoru/dolů)"
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
          transform: transformStr,
          outline: focused
            ? "2px solid #7c3bb2"
            : highlightedBlock
              ? "3px solid rgba(245, 158, 11, 0.95)"
              : hovered
                ? "1px dashed rgba(124,59,178,0.55)"
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
          if (event.key === "Escape") { revertStyle(); return; }
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); commitStyle(); ref.current?.blur(); return; }
          if (event.key === "c" && (event.metaKey || event.ctrlKey) && event.shiftKey) { event.preventDefault(); copyStyle(); return; }
          if (event.key === "v" && (event.metaKey || event.ctrlKey) && event.shiftKey) { event.preventDefault(); pasteStyle(); return; }
        }}
        onBlur={(event: React.FocusEvent<HTMLElement>) => {
          // If focus moved into the toolbar, keep editing open
          if (toolbarRef.current?.contains(event.relatedTarget as Node)) return;
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
