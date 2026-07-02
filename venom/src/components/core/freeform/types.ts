/**
 * Shared types and constants for the freeform canvas engine.
 * Used by FreeformSection, OverlayLayer (Sprint 2), and any future
 * component that embeds a pixel-positioned editable canvas.
 */

export const CANVAS_WIDTH = 1200;
export const CANVAS_GRID = 10;
export const CANVAS_MOBILE_BREAKPOINT = 768;

export type ElementType = "heading" | "text" | "button" | "image" | "divider" | "shape";

export interface BaseEl {
  id: string;
  type: ElementType;
  x: number; y: number; w: number; h: number;
  /** When true, element is hidden in mobile stacked view (<768 px). */
  mobileHidden?: boolean;
  /** Entrance animation preset applied on public render. */
  animation?: { preset: "none" | "fade-in" | "slide-up" | "slide-right" | "zoom-in" | "scale-hover" };
  style?: {
    color?: string;
    background?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlign?: "left" | "center" | "right";
    borderRadius?: number;
    border?: string;
  };
}

export interface HeadingEl extends BaseEl { type: "heading"; text: string; level?: 1 | 2 | 3 | 4 }
export interface TextEl    extends BaseEl { type: "text";    text: string }
export interface ButtonEl  extends BaseEl { type: "button";  text: string; href?: string }
export interface ImageEl   extends BaseEl { type: "image";   src?: string; alt?: string; objectFit?: "cover" | "contain" }
export interface DividerEl extends BaseEl { type: "divider" }
export interface ShapeEl   extends BaseEl { type: "shape" }

export type FreeformEl = HeadingEl | TextEl | ButtonEl | ImageEl | DividerEl | ShapeEl;

export interface FreeformContent {
  width?: number;
  height?: number;
  background?: string;
  elements?: FreeformEl[];
}

export type DragKind = "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export function defaultElement(type: ElementType, idCounter: number): FreeformEl {
  const id = `el-${Date.now()}-${idCounter}`;
  const cx = CANVAS_WIDTH / 2;
  switch (type) {
    case "heading":
      return { id, type, x: cx - 200, y: 80,  w: 400, h: 60,  text: "Nadpis", level: 1, style: { fontSize: 36, fontWeight: 700, textAlign: "left", color: "#0f172a" } };
    case "text":
      return { id, type, x: cx - 200, y: 160, w: 400, h: 100, text: "Sem napiš krátký odstavec textu. Klikni dvakrát pro úpravu.", style: { fontSize: 16, color: "#334155" } };
    case "button":
      return { id, type, x: cx - 100, y: 280, w: 200, h: 50,  text: "Tlačítko", href: "#", style: { background: "#6366f1", color: "#ffffff", fontSize: 14, fontWeight: 600, borderRadius: 8, textAlign: "center" } };
    case "image":
      return { id, type, x: cx - 150, y: 80,  w: 300, h: 200, src: "", alt: "Obrázek", objectFit: "cover", style: { borderRadius: 8 } };
    case "divider":
      return { id, type, x: cx - 200, y: 200, w: 400, h: 2,   style: { background: "#e2e8f0" } };
    case "shape":
      return { id, type, x: cx - 100, y: 200, w: 200, h: 200, style: { background: "#818cf8", borderRadius: 12 } };
  }
}
