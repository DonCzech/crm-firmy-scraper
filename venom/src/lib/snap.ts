/**
 * Shared snap-to-grid and alignment guide utilities used by ResizableBox,
 * OverlayLayer (Sprint 2), and FreeformSection.
 */

/** Axis-aligned bounding box — all values in px. */
export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Output of findAlignmentGuides. */
export interface AlignmentResult {
  /** X positions (in container coords) where a vertical guide should be drawn. */
  guidesV: number[];
  /** Y positions (in container coords) where a horizontal guide should be drawn. */
  guidesH: number[];
  /** If snapping occurred, the corrected x/y for the active element. */
  snappedX: number;
  snappedY: number;
}

/**
 * Snap a single value to the nearest grid multiple.
 * @param value  raw pixel value
 * @param grid   grid step in px (default 8)
 */
export function snapToGrid(value: number, grid = 8): number {
  return Math.round(value / grid) * grid;
}

/**
 * Clamp a value between lo and hi.
 */
export function clampValue(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

/**
 * Find alignment guides between a moving/resizing element and a set of
 * reference elements (siblings, container edges/centers).
 *
 * Checks each of the active element's 3 vertical points (left, center, right)
 * against each reference element's 3 vertical points, and similarly for the
 * 3 horizontal points (top, center, bottom). When a pair is within `threshold`
 * px, the active element is snapped to that reference coordinate and a guide
 * line is emitted at that coordinate.
 *
 * @param active     bounding box of the element being dragged (already grid-snapped)
 * @param references bounding boxes of all other elements to align against
 * @param containerW width of the parent container (for center + edge targets)
 * @param containerH height of the parent container
 * @param threshold  snap attraction distance in px (default 6)
 */
export function findAlignmentGuides(
  active: BBox,
  references: BBox[],
  containerW: number,
  containerH: number,
  threshold = 6,
): AlignmentResult {
  // Candidate reference x-coords (vertical guide lines)
  const refV: number[] = [
    0,
    containerW / 2,
    containerW,
    ...references.flatMap((r) => [r.x, r.x + r.w / 2, r.x + r.w]),
  ];
  // Candidate reference y-coords (horizontal guide lines)
  const refH: number[] = [
    0,
    containerH / 2,
    containerH,
    ...references.flatMap((r) => [r.y, r.y + r.h / 2, r.y + r.h]),
  ];

  // Active element probe points
  const ownV = [active.x, active.x + active.w / 2, active.x + active.w];
  const ownH = [active.y, active.y + active.h / 2, active.y + active.h];

  const guidesV = new Set<number>();
  const guidesH = new Set<number>();
  let snappedX = active.x;
  let snappedY = active.y;

  for (const ref of refV) {
    for (let i = 0; i < ownV.length; i++) {
      const delta = ref - ownV[i];
      if (Math.abs(delta) <= threshold) {
        guidesV.add(ref);
        // Apply snap correction so the matched own-point lands on ref
        snappedX = active.x + delta;
        break;
      }
    }
  }

  for (const ref of refH) {
    for (let i = 0; i < ownH.length; i++) {
      const delta = ref - ownH[i];
      if (Math.abs(delta) <= threshold) {
        guidesH.add(ref);
        snappedY = active.y + delta;
        break;
      }
    }
  }

  return {
    guidesV: Array.from(guidesV),
    guidesH: Array.from(guidesH),
    snappedX,
    snappedY,
  };
}
