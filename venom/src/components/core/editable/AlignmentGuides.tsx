"use client";

/**
 * Renders snap alignment guide lines inside a `position: relative` container.
 *
 * Guides are thin blue vertical/horizontal lines that appear during drag/resize
 * when an element's edge or center aligns with another element's edge or center.
 *
 * Usage:
 *   <div style={{ position: "relative" }}>
 *     {children}
 *     <AlignmentGuides guidesV={result.guidesV} guidesH={result.guidesH} />
 *   </div>
 *
 * Pass empty arrays (or omit when not dragging) to hide all guides.
 */
interface Props {
  guidesV: number[];   // x-positions in px
  guidesH: number[];   // y-positions in px
}

const LINE = {
  background: "var(--vs-accent-solid)",
  boxShadow: "0 0 4px rgba(120,120,132,0.55)",
  pointerEvents: "none" as const,
  position: "absolute" as const,
  zIndex: 40,
};

export function AlignmentGuides({ guidesV, guidesH }: Props) {
  if (guidesV.length === 0 && guidesH.length === 0) return null;
  return (
    <>
      {guidesV.map((x, i) => (
        <div
          key={`gv-${i}-${x}`}
          aria-hidden
          style={{ ...LINE, left: x - 0.5, top: 0, width: 1, height: "100%" }}
        />
      ))}
      {guidesH.map((y, i) => (
        <div
          key={`gh-${i}-${y}`}
          aria-hidden
          style={{ ...LINE, top: y - 0.5, left: 0, height: 1, width: "100%" }}
        />
      ))}
    </>
  );
}
