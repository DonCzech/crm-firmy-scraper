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
}

export function ResizableImage({
  sectionId, field, src, alt,
  fallbackWidth, fallbackHeight,
  className, style,
  aspectLock = false, min = 64, max = 1600, snap = 8,
  children,
}: Props) {
  const { isAdmin, updateField } = useGenericInlineEditor();
  const content = (useSectionContent() ?? {}) as Record<string, unknown>;
  const studio = useStudioOptional();

  const savedW = numOr(content[`${field}Width`], fallbackWidth);
  const savedH = numOr(content[`${field}Height`], fallbackHeight);

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
    return (
      <div
        style={{ width: w, height: h, position: "relative", ...style }}
        className={className}
        data-studio-field={field}
      >
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
