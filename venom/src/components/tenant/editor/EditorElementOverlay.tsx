"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp, ArrowDown, Copy, Trash2, EyeOff, Eye, GripVertical, MoreVertical, Layers,
  Plus, ArrowUpFromLine, ArrowDownFromLine, Monitor, Tablet, Smartphone, Check,
} from "lucide-react";
import "../../studio/design-tokens.css";

/**
 * Element overlay — selection ring + floating micro-rail rendered on top of the
 * live editor canvas. Attaches to a target DOM node (a Section wrapper) and
 * mirrors its bounding rect via ResizeObserver / MutationObserver.
 *
 * Two pieces:
 *   • SectionFrame — wraps each editable section, exposes label + hover ring
 *     + click selection
 *   • ElementMicroRail — vertical column of icon buttons that floats just left
 *     of the active selection (up / down / duplicate / hide / delete / more)
 */

export interface SectionMeta {
  id: number;
  type: string;
  label: string;
  visible: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export interface VariantOption {
  variant: string;
  label: string;
  description?: string;
}

export type SectionAnimation = "none" | "fade" | "slide-up" | "slide-left" | "slide-right" | "scale";

export const ANIMATION_OPTIONS: Array<{ key: SectionAnimation; label: string }> = [
  { key: "none",         label: "Žádná" },
  { key: "fade",         label: "Fade" },
  { key: "slide-up",     label: "Slide nahoru" },
  { key: "slide-left",   label: "Slide zleva" },
  { key: "slide-right",  label: "Slide zprava" },
  { key: "scale",        label: "Scale" },
];

export interface ElementMicroRailProps {
  target: HTMLElement | null;
  section: SectionMeta;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddAbove?: () => void;
  onAddBelow?: () => void;
  onDuplicate: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
  hiddenOnMobile?: boolean;
  hiddenOnTablet?: boolean;
  onToggleHiddenOn?: (bp: "mobile" | "tablet") => void;
  animation?: SectionAnimation;
  onChangeAnimation?: (a: SectionAnimation) => void;
  /** Variants available for this section_type. The currently active one is
      `section.variant` (already exposed on SectionMeta). */
  variants?: VariantOption[];
  currentVariant?: string;
  onChangeVariant?: (variant: string) => void;
}

/** Floating left-of-selection rail of icon actions for the current section. */
export function ElementMicroRail({
  target, section, onMoveUp, onMoveDown, onAddAbove, onAddBelow,
  onDuplicate, onToggleVisible, onDelete,
  hiddenOnMobile, hiddenOnTablet, onToggleHiddenOn,
  variants, currentVariant, onChangeVariant,
  animation, onChangeAnimation,
}: ElementMicroRailProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const variantRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!target) { setRect(null); return; }
    let frame = 0;
    function measure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (target) setRect(target.getBoundingClientRect());
      });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(target);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [target]);

  useEffect(() => {
    if (!moreOpen) return;
    function onDoc(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [moreOpen]);

  useEffect(() => {
    if (!variantOpen) return;
    function onDoc(e: MouseEvent) {
      if (!variantRef.current?.contains(e.target as Node)) setVariantOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [variantOpen]);

  if (!target || !rect) return null;

  // Detect mobile breakpoint at render time. On phones the floating left
  // column would overlap edge-to-edge section content, so we switch to a
  // fixed horizontal bottom bar (Wix mobile pattern) with bigger touch
  // targets and overflow scroll.
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const top = isMobile ? undefined : Math.max(80, rect.top + 8);
  const left = isMobile ? undefined : Math.max(8, rect.left - 44);

  return (
    <div
      data-studio
      className="pointer-events-auto fixed z-[99997]"
      style={
        isMobile
          ? { left: 8, right: 8, bottom: 12, fontFamily: "var(--vs-font-sans)" }
          : { top, left, fontFamily: "var(--vs-font-sans)" }
      }
    >
      <div
        className={`vs-enter flex items-stretch gap-0.5 rounded-xl p-1 ${
          isMobile
            ? "flex-row justify-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex-col"
        }`}
        style={{
          background: "rgba(18,18,23,0.96)",
          boxShadow: "var(--vs-shadow-lg), 0 0 0 1px var(--vs-border-strong)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
        }}
      >
        {onAddAbove && (
          <RailButton title="Přidat sekci nad" onClick={onAddAbove}>
            <ArrowUpFromLine className="h-3.5 w-3.5" strokeWidth={1.75} />
          </RailButton>
        )}
        <RailButton title="Posunout nahoru" disabled={!section.canMoveUp} onClick={onMoveUp}>
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
        </RailButton>
        <RailButton title="Posunout dolů" disabled={!section.canMoveDown} onClick={onMoveDown}>
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
        </RailButton>
        {onAddBelow && (
          <RailButton title="Přidat sekci pod" onClick={onAddBelow}>
            <ArrowDownFromLine className="h-3.5 w-3.5" strokeWidth={1.75} />
          </RailButton>
        )}
        {variants && variants.length > 1 && onChangeVariant && (
          <div className="relative" ref={variantRef}>
            <RailButton
              title={`Změnit variantu (${variants.length})`}
              active={variantOpen}
              onClick={() => setVariantOpen((o) => !o)}
            >
              <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
            </RailButton>
            {variantOpen && (
              <div
                role="menu"
                className={`vs-enter absolute w-[min(264px,calc(100vw-32px))] rounded-lg p-2 ${
                  isMobile ? "bottom-10 left-1/2 -translate-x-1/2" : "left-9 top-0"
                }`}
                style={{
                  background: "rgba(18,18,23,0.97)",
                  boxShadow: "var(--vs-shadow-lg), 0 0 0 1px var(--vs-border-strong)",
                  backdropFilter: "blur(20px) saturate(140%)",
                  WebkitBackdropFilter: "blur(20px) saturate(140%)",
                }}
              >
                <div className="mb-1.5 px-1.5 text-[9.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">
                  Varianty {section.label.toLowerCase()}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {variants.map((v) => {
                    const active = v.variant === currentVariant;
                    return (
                      <button
                        key={v.variant}
                        type="button"
                        onClick={() => { setVariantOpen(false); onChangeVariant(v.variant); }}
                        className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors duration-100 ${
                          active
                            ? "bg-indigo-500/15 text-[var(--vs-text)] ring-1 ring-inset ring-indigo-400/40"
                            : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
                        }`}
                      >
                        <span
                          aria-hidden
                          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[9px] font-bold uppercase tracking-tight"
                          style={{
                            background: active ? "rgba(129,140,248,0.30)" : "rgba(255,255,255,0.05)",
                            color: active ? "#c7d2fe" : "var(--vs-text-muted)",
                          }}
                        >
                          {v.variant.slice(0, 2)}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate text-[11.5px] font-semibold">{v.label}</span>
                          {v.description && (
                            <span className="line-clamp-2 text-[10px] text-[var(--vs-text-muted)]">{v.description}</span>
                          )}
                        </span>
                        {active && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-300" strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <RailButton title="Duplikovat" onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
        </RailButton>
        <RailButton title={section.visible ? "Skrýt" : "Zobrazit"} onClick={onToggleVisible}>
          {section.visible
            ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            : <EyeOff className="h-3.5 w-3.5 text-[var(--vs-warning)]" strokeWidth={1.75} />}
        </RailButton>

        <div className={isMobile ? "mx-0.5 w-px self-stretch bg-[var(--vs-border)]" : "my-0.5 h-px bg-[var(--vs-border)]"} />

        <div className="relative" ref={moreRef}>
          <RailButton title="Více" onClick={() => setMoreOpen((o) => !o)} active={moreOpen}>
            <MoreVertical className="h-3.5 w-3.5" strokeWidth={1.75} />
          </RailButton>
          {moreOpen && (
            <div
              role="menu"
              className={`vs-enter absolute w-52 rounded-md p-1 ${
                isMobile ? "bottom-10 right-0" : "left-9 top-0"
              }`}
              style={{
                background: "rgba(18,18,23,0.97)",
                boxShadow: "var(--vs-shadow-lg), 0 0 0 1px var(--vs-border-strong)",
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
              }}
            >
              {onChangeAnimation && (
                <>
                  <div className="px-2.5 pt-1.5 pb-1 text-[9.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">
                    Animace při scrollu
                  </div>
                  <div className="grid grid-cols-3 gap-0.5 px-1.5 pb-1">
                    {ANIMATION_OPTIONS.map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => onChangeAnimation(a.key)}
                        className={`rounded px-1.5 py-1 text-[10px] font-medium transition-colors ${
                          (animation ?? "none") === a.key
                            ? "bg-indigo-500/15 text-[var(--vs-text)] ring-1 ring-inset ring-indigo-400/40"
                            : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                  <div className="mx-1.5 my-1 h-px bg-[var(--vs-border)]" />
                </>
              )}
              {onToggleHiddenOn && (
                <>
                  <div className="px-2.5 pt-1.5 pb-1 text-[9.5px] font-semibold uppercase tracking-[0.10em] text-[var(--vs-text-muted)]">
                    Viditelnost
                  </div>
                  <BreakpointToggle
                    icon={<Smartphone className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    label="Skrýt na mobilu"
                    on={!!hiddenOnMobile}
                    onClick={() => onToggleHiddenOn("mobile")}
                  />
                  <BreakpointToggle
                    icon={<Tablet className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    label="Skrýt na tabletu"
                    on={!!hiddenOnTablet}
                    onClick={() => onToggleHiddenOn("tablet")}
                  />
                  <div className="mx-1.5 my-1 h-px bg-[var(--vs-border)]" />
                </>
              )}
              <MenuItem onClick={() => { setMoreOpen(false); onDelete(); }} danger>
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Smazat sekci
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      {/* Label badge — shows above selection (desktop only; on mobile the
          bottom action bar already shows actions for the selected section). */}
      <div
        className={`absolute items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--vs-tracking-wide)] text-white ${
          isMobile ? "hidden" : "flex"
        }`}
        style={{
          top: -22,
          left: 0,
          background: "linear-gradient(180deg, #818cf8 0%, #6366f1 100%)",
          boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        <Layers className="h-2.5 w-2.5" strokeWidth={2.5} />
        {section.label}
      </div>
    </div>
  );
}

function RailButton({
  children, title, onClick, disabled, active,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-[background,color,transform] duration-100 vs-focus-ring active:translate-y-[0.5px] sm:h-7 sm:w-7 ${
        active
          ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)]"
          : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 disabled:hover:bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function BreakpointToggle({
  icon, label, on, onClick,
}: { icon: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      role="menuitemcheckbox"
      aria-checked={on}
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[11.5px] text-[var(--vs-text-soft)] transition-colors duration-100 hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
    >
      <span className="text-[var(--vs-text-muted)]">{icon}</span>
      <span className="flex-1">{label}</span>
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded ${
          on
            ? "bg-indigo-500 text-white"
            : "border border-[var(--vs-border-strong)] bg-transparent"
        }`}
      >
        {on && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

function MenuItem({
  children, onClick, danger,
}: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[11.5px] transition-colors duration-100 ${
        danger
          ? "text-[var(--vs-danger)] hover:bg-[var(--vs-danger-bg)]"
          : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * SectionFrame — wraps a section, displays a hover/selected ring, and exposes
 * the element to the page-level overlay via a ref callback.
 *
 * Hidden sections (admin mode) get a 35% opacity treatment with a corner
 * "skrytá" badge so the admin can still see, click and restore them.
 * pulseToken — when changed, triggers a 1s violet glow animation so the
 * admin sees which section was just jumped to from the page builder.
 */
export interface SectionFrameProps {
  sectionId: number;
  selected: boolean;
  hover: boolean;
  hidden?: boolean;
  pulseToken?: number;
  onSelect: () => void;
  onHover: (h: boolean) => void;
  onMount: (el: HTMLDivElement | null) => void;
  label: string;
  children: React.ReactNode;
  /** Drag & drop hooks. When provided, a drag handle pill appears on hover
      on the left edge and the wrapper becomes draggable. */
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  dragState?: "idle" | "dragging" | "drop-before" | "drop-after";
}

export function SectionFrame({
  sectionId, selected, hover, hidden, pulseToken, onSelect, onHover, onMount, label, children,
  draggable, onDragStart, onDragEnd, onDragOver, onDrop, dragState = "idle",
}: SectionFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => { onMount(ref.current); return () => onMount(null); }, [onMount]);

  // When pulseToken bumps, fire the highlight animation for 1s.
  useEffect(() => {
    if (pulseToken === undefined) return;
    setPulsing(true);
    const t = setTimeout(() => setPulsing(false), 1100);
    return () => clearTimeout(t);
  }, [pulseToken]);

  // outline paints at the box border and is never clipped by children
  // (unlike inset box-shadow on a sibling overlay, which gets covered when a
  // section has a full-bleed background, e.g. CTA-hair-01). It also doesn't
  // take any space in layout, so it doesn't shift section contents.
  const outline = selected
    ? "2px solid #818cf8"
    : hover
      ? "1.5px solid rgba(129,140,248,0.85)"
      : "0 solid rgba(129,140,248,0)";
  const outlineOffset = selected ? "-2px" : hover ? "-1.5px" : "0";

  return (
    <div
      ref={(el) => { ref.current = el; }}
      data-editor-section={sectionId}
      data-studio
      className="relative group"
      style={{
        opacity: hidden ? 0.38 : dragState === "dragging" ? 0.55 : 1,
        outline,
        outlineOffset,
        scrollMarginTop: 96,
        scrollMarginBottom: 32,
        transition: "opacity 220ms cubic-bezier(0.18,0.89,0.32,1), outline 150ms cubic-bezier(0.18,0.89,0.32,1)",
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={draggable ? onDrop : undefined}
      onClickCapture={(e) => {
        const t = e.target as HTMLElement;
        if (t.isContentEditable) return;
        if (t.closest("[contenteditable='true']")) return;
        if (t.closest("input,textarea,select,button,a")) return;
        onSelect();
      }}
    >
      {/* Drop indicator — solid indigo bar at top or bottom while a drag
          is hovering. Cleaner cue than the dashed InsertZone since it's
          DURING the drag, not an idle add-affordance. */}
      {dragState === "drop-before" && (
        <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-0 z-[15]"
          style={{ height: 3, background: "linear-gradient(90deg, transparent, #6366f1 20%, #6366f1 80%, transparent)", boxShadow: "0 0 12px rgba(99,102,241,0.65)" }}
        />
      )}
      {dragState === "drop-after" && (
        <div aria-hidden className="pointer-events-none absolute left-0 right-0 bottom-0 z-[15]"
          style={{ height: 3, background: "linear-gradient(90deg, transparent, #6366f1 20%, #6366f1 80%, transparent)", boxShadow: "0 0 12px rgba(99,102,241,0.65)" }}
        />
      )}

      {/* Drag handle pill — left edge, visible on hover/selected when
          draggable. The handle owns the `draggable` HTML attr so dragging
          the section body (where contenteditable lives) does NOT start a
          DnD that would interfere with text selection. */}
      {/* Drag handle — desktop-only (HTML5 DnD doesn't work on touch;
          mobile uses the ↑↓ arrows in the micro-rail instead). */}
      {draggable && (hover || selected) && (
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="absolute -left-3 top-3 z-[16] hidden h-7 w-6 cursor-grab items-center justify-center rounded-md active:cursor-grabbing sm:inline-flex"
          style={{
            background: "rgba(18,18,23,0.92)",
            boxShadow: "0 6px 14px rgba(15,23,42,0.30), 0 0 0 1px rgba(255,255,255,0.10)",
          }}
          title="Přetáhnout sekci"
          aria-label="Přetáhnout sekci"
        >
          <GripVertical className="h-3.5 w-3.5 text-white/85" strokeWidth={1.75} />
        </div>
      )}

      {children}

      {/* Hidden checkered overlay — visually marks the section as not visible
          publicly while keeping it interactive in the editor. */}
      {hidden && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0 8px, transparent 8px 16px)",
            mixBlendMode: "multiply",
            zIndex: 5,
          }}
        />
      )}

      {/* Extra inner glow when selected — sits ABOVE child content thanks to
          z-index so it shows on sections that paint their own backgrounds. */}
      {selected && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(129,140,248,0.55), inset 0 0 24px rgba(99,102,241,0.18)",
            zIndex: 6,
          }}
        />
      )}

      {/* Jump-to pulse — animated indigo glow that fades out over 1s */}
      {pulsing && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            animation: "vs-section-pulse 1100ms cubic-bezier(0.18,0.89,0.32,1) forwards",
            zIndex: 10,
          }}
        />
      )}

      {/* Top-left label badge — appears on hover when not selected */}
      {hover && !selected && !hidden && (
        <div
          className="vs-enter pointer-events-none absolute left-0 top-0 z-10 inline-flex items-center gap-1 rounded-br-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
          style={{ background: "rgba(129,140,248,0.85)" }}
        >
          {label}
        </div>
      )}

      {/* "Skrytá" badge — top-right corner when hidden */}
      {hidden && (
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 inline-flex items-center gap-1 rounded-bl-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.95) 0%, rgba(217,119,6,0.95) 100%)",
            boxShadow: "0 4px 12px rgba(217,119,6,0.40)",
          }}
        >
          <EyeOff className="h-2.5 w-2.5" strokeWidth={2.5} />
          Skrytá
        </div>
      )}

      <style>{`
        @keyframes vs-section-pulse {
          0%   { box-shadow: inset 0 0 0 0px rgba(129,140,248,0), 0 0 0 0 rgba(129,140,248,0); background: rgba(129,140,248,0); }
          15%  { box-shadow: inset 0 0 0 4px rgba(129,140,248,0.90), 0 0 32px 8px rgba(129,140,248,0.45); background: rgba(129,140,248,0.18); }
          60%  { box-shadow: inset 0 0 0 3px rgba(129,140,248,0.55), 0 0 22px 4px rgba(129,140,248,0.25); background: rgba(129,140,248,0.08); }
          100% { box-shadow: inset 0 0 0 0px rgba(129,140,248,0), 0 0 0 0 rgba(129,140,248,0); background: rgba(129,140,248,0); }
        }
      `}</style>
    </div>
  );
}

/**
 * InsertZone — a thin sliver rendered between sections. The strip itself is
 * almost invisible until the admin hovers it: then a centered "+" pill
 * appears with a hairline rule across the canvas. Click → onAdd(insertOrder).
 *
 * Reserves 18px of vertical space so the hover target is comfortable even
 * when adjacent sections paint full-bleed backgrounds. The pill is rendered
 * outside the layout flow (`absolute`) so it doesn't shift content when it
 * appears.
 */
/**
 * InsertZone — sliver between sections that only shows editor chrome on
 * hover. No persistent divider line (would be mistaken for template design):
 * the resting state is a 14px transparent gap. On hover a floating pill
 * lifts in just at the cursor's vertical midpoint with a thin DASHED indigo
 * rail behind it — clearly a UI hint, not a real section border. The pill
 * carries a "+" badge plus an "EDITOR" mini-chip so the client always reads
 * it as tool chrome.
 */
export function InsertZone({
  onAdd, label = "Přidat sekci",
}: { onAdd: () => void; label?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      role="presentation"
      data-studio
      className="relative z-[12]"
      style={{ height: 14 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Dashed rail — only paints while hovered, with feathered ends so it
          never reads as a permanent section divider. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2"
        style={{
          height: 1,
          opacity: hover ? 1 : 0,
          transition: "opacity 140ms cubic-bezier(0.18,0.89,0.32,1)",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(99,102,241,0.55) 0 5px, transparent 5px 11px)",
          maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
      />

      <button
        type="button"
        onClick={onAdd}
        aria-label={label}
        title={label}
        className="absolute left-1/2 top-1/2 inline-flex items-center gap-1.5 rounded-full font-semibold tracking-tight transition-[transform,opacity,box-shadow] duration-150 will-change-transform"
        style={{
          opacity: hover ? 1 : 0,
          pointerEvents: hover ? "auto" : "none",
          transform: `translate(-50%,-50%) scale(${hover ? 1 : 0.92})`,
          padding: "4px 10px 4px 4px",
          fontSize: 11,
          background: "#0f1117",
          color: "#ffffff",
          boxShadow: "0 8px 22px rgba(8,8,12,0.45), 0 0 0 1px rgba(129,140,248,0.55), 0 0 0 4px rgba(255,255,255,0.85)",
        }}
      >
        <span
          aria-hidden
          className="inline-flex h-5 items-center gap-1 rounded-full px-1.5 text-[8.5px] font-bold uppercase tracking-[0.10em]"
          style={{
            background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
            color: "#ffffff",
            letterSpacing: "0.10em",
          }}
        >
          <Plus className="h-3 w-3" strokeWidth={2.75} />
          Editor
        </span>
        <span className="pr-0.5">{label}</span>
      </button>
    </div>
  );
}

