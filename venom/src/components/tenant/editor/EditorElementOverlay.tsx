"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp, ArrowDown, Copy, Trash2, EyeOff, Eye, GripVertical, MoreVertical, Layers,
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

export interface ElementMicroRailProps {
  target: HTMLElement | null;
  section: SectionMeta;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
}

/** Floating left-of-selection rail of icon actions for the current section. */
export function ElementMicroRail({
  target, section, onMoveUp, onMoveDown, onDuplicate, onToggleVisible, onDelete,
}: ElementMicroRailProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

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

  if (!target || !rect) return null;

  // Position to the left of the selection, vertically centered against its top
  const top = Math.max(80, rect.top + 8);
  const left = Math.max(8, rect.left - 44);

  return (
    <div
      data-studio
      className="pointer-events-auto fixed z-[99997]"
      style={{ top, left, fontFamily: "var(--vs-font-sans)" }}
    >
      <div
        className="vs-enter flex flex-col items-stretch gap-0.5 rounded-xl p-1"
        style={{
          background: "rgba(18,18,23,0.96)",
          boxShadow: "var(--vs-shadow-lg), 0 0 0 1px var(--vs-border-strong)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
        }}
      >
        <RailButton title="Posunout nahoru" disabled={!section.canMoveUp} onClick={onMoveUp}>
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
        </RailButton>
        <RailButton title="Posunout dolů" disabled={!section.canMoveDown} onClick={onMoveDown}>
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
        </RailButton>
        <RailButton title="Duplikovat" onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
        </RailButton>
        <RailButton title={section.visible ? "Skrýt" : "Zobrazit"} onClick={onToggleVisible}>
          {section.visible
            ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            : <EyeOff className="h-3.5 w-3.5 text-[var(--vs-warning)]" strokeWidth={1.75} />}
        </RailButton>

        <div className="my-0.5 h-px bg-[var(--vs-border)]" />

        <div className="relative" ref={moreRef}>
          <RailButton title="Více" onClick={() => setMoreOpen((o) => !o)} active={moreOpen}>
            <MoreVertical className="h-3.5 w-3.5" strokeWidth={1.75} />
          </RailButton>
          {moreOpen && (
            <div
              role="menu"
              className="vs-enter absolute left-9 top-0 w-44 rounded-md p-1"
              style={{
                background: "rgba(18,18,23,0.97)",
                boxShadow: "var(--vs-shadow-lg), 0 0 0 1px var(--vs-border-strong)",
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
              }}
            >
              <MenuItem onClick={() => { setMoreOpen(false); onDelete(); }} danger>
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Smazat sekci
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      {/* Label badge — shows above selection */}
      <div
        className="absolute flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--vs-tracking-wide)] text-white"
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
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-[background,color,transform] duration-100 vs-focus-ring active:translate-y-[0.5px] ${
        active
          ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)]"
          : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 disabled:hover:bg-transparent"
      }`}
    >
      {children}
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
 */
export interface SectionFrameProps {
  sectionId: number;
  selected: boolean;
  hover: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
  onMount: (el: HTMLDivElement | null) => void;
  label: string;
  children: React.ReactNode;
}

export function SectionFrame({
  sectionId, selected, hover, onSelect, onHover, onMount, label, children,
}: SectionFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => { onMount(ref.current); return () => onMount(null); }, [onMount]);

  return (
    <div
      ref={(el) => { ref.current = el; }}
      data-editor-section={sectionId}
      data-studio
      className="relative group"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClickCapture={(e) => {
        const t = e.target as HTMLElement;
        if (t.isContentEditable) return;
        if (t.closest("[contenteditable='true']")) return;
        if (t.closest("input,textarea,select,button,a")) return;
        onSelect();
      }}
    >
      {children}
      {/* Hover ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[box-shadow,opacity] duration-150"
        style={{
          opacity: selected ? 1 : hover ? 0.6 : 0,
          boxShadow: selected
            ? "inset 0 0 0 2px #818cf8, 0 0 0 0 rgba(0,0,0,0)"
            : "inset 0 0 0 1.5px rgba(129,140,248,0.55)",
        }}
      />
      {/* Top-left label badge — appears on hover when not selected */}
      {hover && !selected && (
        <div
          className="vs-enter pointer-events-none absolute left-0 top-0 z-10 inline-flex items-center gap-1 rounded-br-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
          style={{ background: "rgba(129,140,248,0.85)" }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
