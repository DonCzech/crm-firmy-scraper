"use client";

import { useEffect, useState } from "react";
import { ResizableBox } from "./ResizableBox";
import { useGenericInlineEditor } from "@/components/tenant/GenericInlineEditorContext";
import { useSectionContent } from "@/components/tenant/SectionContentContext";
import { useStudioOptional } from "@/components/studio/StudioContext";

/**
 * Opt-in image wrapper with 8-handle drag resize. Persists size to
 * section content as `<field>Width` and `<field>Height` (px integers).
 * Falls back to the rendered intrinsic size (or `fallbackWidth/Height`)
 * when those keys aren't set.
 *
 * Use it where a variant component would otherwise put a fixed-size
 * `<img>` and you want the user to be able to drag the corners:
 *
 *   <ResizableImage
 *     sectionId={sectionId}
 *     field="aboutImage"
 *     src={content.aboutImage}
 *     alt="…"
 *     fallbackWidth={520}
 *     fallbackHeight={680}
 *     className="rounded-2xl shadow-xl object-cover"
 *   />
 *
 * Notes:
 * - Handles render only when the parent section is studio-selected.
 * - Mobile breakpoint disables resize (you'd never want a 360-wide
 *   phone to inherit a 520 px corner-dragged size). Falls back to
 *   100% width / auto height.
 * - Pairs cleanly with `GenericEditableImage` if you want both
 *   resize AND upload — wrap GEI inside the children slot of
 *   ResizableImage (then upload still works, focus point still
 *   works, and resize is the outermost concern).
 */
interface Props {
  sectionId: number;
  field: string;
  src: string;
  alt?: string;
  fallbackWidth: number;
  fallbackHeight: number;
  className?: string;
  style?: React.CSSProperties;
  /** Lock aspect ratio while dragging corner handles (n/s/e/w handles
   *  always change a single dimension). Default false. */
  aspectLock?: boolean;
  /** Min pixel size (both axes). Default 64. */
  min?: number;
  /** Max pixel size. Default 1600. */
  max?: number;
  /** Snap-to grid in px. Default 8. */
  snap?: number;
  /** If provided, used as the rendered img — otherwise a plain <img>
   *  with the src/alt props is rendered. Use this when you want a
   *  Next.js Image or GenericEditableImage as the inner. */
  children?: React.ReactNode;
  /** When true and no size has been explicitly saved by the user, the
   *  non-active wrapper renders with width:"100%" / height:"auto" instead
   *  of the fallback pixel values. Use for fluid-card images (e.g. team
   *  member portraits) where the card constrains width naturally.
   *  Once the user drags a size and it's saved, that saved value is used. */
  fluidDefault?: boolean;
}

export function ResizableImage({
  sectionId, field, src, alt,
  fallbackWidth, fallbackHeight,
  className, style,
  aspectLock = false, min = 64, max = 1600, snap = 8,
  children, fluidDefault = false,
}: Props) {
  const { isAdmin, updateField } = useGenericInlineEditor();
  const content = (useSectionContent() ?? {}) as Record<string, unknown>;
  const studio = useStudioOptional();

  const rawW = getNestedValue(content, `${field}Width`);
  const rawH = getNestedValue(content, `${field}Height`);
  const hasSaved = typeof rawW === "number" && typeof rawH === "number";
  const savedW = numOr(rawW, fallbackWidth);
  const savedH = numOr(rawH, fallbackHeight);

  // Live size during drag; null when not actively resizing.
  const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => { setLiveSize(null); }, [savedW, savedH]);

  const w = liveSize?.w ?? savedW;
  const h = liveSize?.h ?? savedH;

  const selected = studio?.selectedSectionId === sectionId;
  const isMobile = studio?.breakpoint === "mobile";
  const active = !!isAdmin && !!selected && !isMobile;

  function commit(nextW: number, nextH: number) {
    updateField(sectionId, `${field}Width`, nextW);
    updateField(sectionId, `${field}Height`, nextH);
    setLiveSize(null);
  }

  function reset() {
    // Set to undefined to remove the saved size — setPathValue in updateField
    // accepts unknown at runtime even though TS types say string|number|boolean.
    updateField(sectionId, `${field}Width`, undefined as unknown as number);
    updateField(sectionId, `${field}Height`, undefined as unknown as number);
    setLiveSize(null);
  }

  // Non-admin (or mobile / unselected): static render — just the img,
  // no resize chrome. Width/height baked from saved values so the
  // public site honours past edits.
  const inner = children ?? (
    <img
      src={src}
      alt={alt ?? ""}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }}
      draggable={false}
    />
  );

  if (!active) {
    const fluidStyle: React.CSSProperties =
      fluidDefault && !hasSaved
        ? { width: "100%", height: "auto", position: "relative", ...style }
        : { width: w, height: h, position: "relative", ...style };
    return (
      <div style={fluidStyle} className={className} data-studio-field={field}>
        {inner}
      </div>
    );
  }

  return (
    <ResizableBox
      width={w}
      height={h}
      onResize={(nw, nh) => setLiveSize({ w: nw, h: nh })}
      onResizeEnd={commit}
      active={active}
      aspectLock={aspectLock}
      snap={snap}
      minW={min}
      minH={min}
      maxW={max}
      maxH={max}
      className={className}
      style={style}
    >
      {inner}
      {hasSaved && (
        <button
          type="button"
          title="Vrátit velikost na výchozí"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); reset(); }}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.5)",
            background: "rgba(20,20,20,0.85)",
            color: "#fff",
            fontSize: 11,
            lineHeight: 1,
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          ↺
        </button>
      )}
    </ResizableBox>
  );
}

function numOr(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const parsed = parseFloat(v);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/** Traverse a dot-notation path (e.g. "members.0.imageWidth") through a
 *  nested object/array — mirrors the logic in TenantStudioView's setPathValue. */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  let cur: unknown = obj;
  for (const key of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = Array.isArray(cur) ? (cur as unknown[])[Number(key)] : (cur as Record<string, unknown>)[key];
  }
  return cur;
}
