"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { snapToGrid, findAlignmentGuides, type BBox } from "@/lib/snap";
import { AlignmentGuides } from "./AlignmentGuides";

/**
 * Generic 8-handle drag-resize primitive. Headless — renders children inside
 * an absolutely-sized box plus 8 resize handles when `active` is true. The
 * handle/drag math was lifted from `FreeformSection.tsx` (Sprint 2 will
 * fully share that path; T1.5 just extracts the resize subset).
 *
 * The component is fully controlled: width/height come from props, drag
 * computes the new size and calls `onResize` continuously and `onResizeEnd`
 * once on pointerup. Snap to `snap` px (default 8). Optional aspect lock
 * keeps width:height ratio when dragging corner handles.
 */
export type ResizeCorner = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const ALL_CORNERS: ResizeCorner[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

interface ResizableBoxProps {
  width: number;
  height: number;
  /** Called during drag with the in-progress dimensions. */
  onResize?: (w: number, h: number) => void;
  /** Called once on pointerup with the final dimensions. */
  onResizeEnd?: (w: number, h: number) => void;
  /** Show handles + size badge. Hide for read-only render. */
  active?: boolean;
  /** Lock width/height ratio while dragging corner handles. */
  aspectLock?: boolean;
  snap?: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  /** Show "WxH" badge under the box during drag. */
  showSizeBadge?: boolean;
  /**
   * Sibling bounding boxes for snap-alignment guide rendering.
   * When provided, alignment guides appear during drag/resize when this
   * element's edge/center aligns with a sibling.
   */
  siblings?: BBox[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function ResizableBox({
  width, height,
  onResize, onResizeEnd,
  active = false,
  aspectLock = false,
  snap = 8,
  minW = 20, minH = 20,
  maxW = Number.POSITIVE_INFINITY, maxH = Number.POSITIVE_INFINITY,
  showSizeBadge = true,
  siblings = [],
  className, style, children,
}: ResizableBoxProps) {
  const dragState = useRef<{
    corner: ResizeCorner;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    /** Měřítko canvasu (CSS zoom / transform) — screen px → canvas px. */
    scale: number;
    rafPending: number | null;
    lastClientX: number;
    lastClientY: number;
  } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ w: number; h: number } | null>(null);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });

  function onPointerDown(corner: ResizeCorner, e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    // Canvas Studia bývá škálovaný (zoom/fit) — bez přepočtu by box
    // nesledoval kurzor 1:1. Poměr rect/offsetWidth pokrývá zoom i transform.
    const el = boxRef.current;
    const scale = el && el.offsetWidth > 0
      ? (el.getBoundingClientRect().width / el.offsetWidth) || 1
      : 1;
    dragState.current = {
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startW: width,
      startH: height,
      scale,
      rafPending: null,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
    };
    setDrag({ w: width, h: height });
  }

  function computeNext(d: NonNullable<typeof dragState.current>) {
    const dx = (d.lastClientX - d.startX) / d.scale;
    const dy = (d.lastClientY - d.startY) / d.scale;
    let w = d.startW;
    let h = d.startH;
    const c = d.corner;
    if (c.includes("e")) w = d.startW + dx;
    if (c.includes("w")) w = d.startW - dx;
    if (c.includes("s")) h = d.startH + dy;
    if (c.includes("n")) h = d.startH - dy;
    // Corner drag + aspectLock → derive missing dim from ratio
    const isCorner = c.length === 2;
    if (aspectLock && isCorner) {
      const ratio = d.startW / d.startH;
      const wDelta = Math.abs(w - d.startW) / d.startW;
      const hDelta = Math.abs(h - d.startH) / d.startH;
      if (wDelta >= hDelta) h = w / ratio;
      else w = h * ratio;
    }
    w = clamp(snapToGrid(w, snap), minW, maxW);
    h = clamp(snapToGrid(h, snap), minH, maxH);
    return { w, h };
  }

  function computeGuides(w: number, h: number) {
    if (!siblings.length || !boxRef.current) return;
    const containerEl = boxRef.current.parentElement;
    const containerW = containerEl?.offsetWidth ?? 0;
    const containerH = containerEl?.offsetHeight ?? 0;
    const result = findAlignmentGuides(
      { x: 0, y: 0, w, h },
      siblings,
      containerW,
      containerH,
    );
    setGuides({ v: result.guidesV, h: result.guidesH });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragState.current;
    if (!d) return;
    d.lastClientX = e.clientX;
    d.lastClientY = e.clientY;
    if (d.rafPending != null) return;
    d.rafPending = requestAnimationFrame(() => {
      if (!dragState.current) return;
      dragState.current.rafPending = null;
      const next = computeNext(dragState.current);
      setDrag(next);
      computeGuides(next.w, next.h);
      onResize?.(next.w, next.h);
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragState.current;
    if (!d) return;
    if (d.rafPending != null) cancelAnimationFrame(d.rafPending);
    const final = computeNext(d);
    dragState.current = null;
    setDrag(null);
    setGuides({ v: [], h: [] });
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    onResizeEnd?.(final.w, final.h);
  }

  useEffect(() => () => {
    const d = dragState.current;
    if (d?.rafPending != null) cancelAnimationFrame(d.rafPending);
    dragState.current = null;
  }, []);

  const liveW = drag?.w ?? width;
  const liveH = drag?.h ?? height;

  return (
    <div
      ref={boxRef}
      className={className}
      style={{
        ...style,
        position: style?.position ?? "relative",
        width: liveW,
        height: liveH,
        boxSizing: "border-box",
      }}
    >
      {children}
      {active && drag && (
        <AlignmentGuides guidesV={guides.v} guidesH={guides.h} />
      )}
      {active && ALL_CORNERS.map((corner) => (
        <div
          key={corner}
          role="slider"
          aria-label={`Změnit velikost (${corner})`}
          aria-valuenow={corner.includes("w") || corner.includes("e") ? liveW : liveH}
          onPointerDown={(e) => onPointerDown(corner, e)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            background: "#ffffff",
            border: "2px solid var(--vs-accent-solid)",
            borderRadius: 2,
            cursor: cursorFor(corner),
            touchAction: "none",
            zIndex: 30,
            ...handlePos(corner),
          }}
        />
      ))}
      {active && showSizeBadge && drag && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            bottom: -22,
            right: 0,
            background: "var(--vs-accent-solid)",
            color: "#fff",
            fontSize: 10,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            padding: "2px 6px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            zIndex: 30,
          }}
        >
          {liveW}×{liveH}
        </div>
      )}
    </div>
  );
}

function handlePos(corner: ResizeCorner): CSSProperties {
  const o = -5;
  const mid = "calc(50% - 5px)";
  switch (corner) {
    case "nw": return { top: o, left: o };
    case "n":  return { top: o, left: mid };
    case "ne": return { top: o, right: o };
    case "e":  return { top: mid, right: o };
    case "se": return { bottom: o, right: o };
    case "s":  return { bottom: o, left: mid };
    case "sw": return { bottom: o, left: o };
    case "w":  return { top: mid, left: o };
  }
}

function cursorFor(corner: ResizeCorner): string {
  switch (corner) {
    case "nw": case "se": return "nwse-resize";
    case "ne": case "sw": return "nesw-resize";
    case "n":  case "s":  return "ns-resize";
    case "e":  case "w":  return "ew-resize";
  }
}
