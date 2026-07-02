"use client";

import clsx from "clsx";
import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

/* ============================================================================
   Webero Studio UI primitives. All consume design tokens from design-tokens.css.
   Import via `import { Button, Input, Panel, EmptyState, Pill, Tooltip, Spinner } from "@/components/studio/ui"`.
   ============================================================================ */

// ── Button ─────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "sm", loading, iconLeft, iconRight, fullWidth, children, className, disabled, ...rest },
  ref
) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium tracking-tight rounded-md vs-focus-ring transition-[background,box-shadow,transform,color] duration-100 ease-out select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes: Record<ButtonSize, string> = {
    xs: "h-6 px-2 text-[10.5px]",
    sm: "h-7 px-2.5 text-[11.5px]",
    md: "h-8 px-3 text-[12.5px]",
    lg: "h-9 px-4 text-[13px]",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "vs-grad-accent text-white shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_4px_14px_rgba(20,184,166,0.35)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_6px_18px_rgba(20,184,166,0.5)] active:translate-y-[0.5px]",
    secondary: "bg-[var(--vs-surface)] text-[var(--vs-text)] border border-[var(--vs-border-strong)] hover:bg-[var(--vs-surface-2)] active:translate-y-[0.5px]",
    ghost: "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]",
    danger: "bg-[var(--vs-danger-bg)] text-[var(--vs-danger)] border border-[rgba(248,113,113,0.25)] hover:bg-[rgba(248,113,113,0.18)]",
    success: "bg-[var(--vs-success)] text-[#0a3622] shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_14px_rgba(52,211,153,0.35)] hover:bg-emerald-300",
  };
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(base, sizes[size], variants[variant], fullWidth && "w-full", className)}
      {...rest}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : iconLeft}
      {children}
      {iconRight}
    </button>
  );
});

// ── IconButton ────────────────────────────────────────────────────────────
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  active?: boolean;
  label: string;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = "sm", active, label, children, className, ...rest },
  ref
) {
  const sizes: Record<ButtonSize, string> = {
    xs: "h-6 w-6",
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-9 w-9",
  };
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex items-center justify-center rounded-md vs-focus-ring transition-[background,color] duration-100 ease-out disabled:opacity-40",
        sizes[size],
        active
          ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
          : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

// ── Input ────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  modified?: boolean;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, iconLeft, iconRight, modified, className, id, ...rest },
  ref
) {
  const generatedId = useRef(`vs-input-${Math.random().toString(36).slice(2)}`);
  const inputId = id ?? generatedId.current;
  return (
    <div className="block">
      {label && (
        <label htmlFor={inputId} className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
          {label}
          {modified && (
            <span title="Změněno oproti šabloně" className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--vs-accent-hi)]" />
          )}
        </label>
      )}
      <div className={clsx(
        "relative flex items-center rounded-md border bg-[var(--vs-bg-soft)] transition-shadow duration-150",
        error
          ? "border-[var(--vs-danger)] focus-within:shadow-[0_0_0_3px_var(--vs-danger-bg)]"
          : "border-[var(--vs-border-strong)] focus-within:border-[var(--vs-accent)] focus-within:shadow-[0_0_0_3px_var(--vs-accent-bg)]"
      )}>
        {iconLeft && <span className="pl-2 text-[var(--vs-text-muted)]">{iconLeft}</span>}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full bg-transparent text-[12.5px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] outline-none",
            iconLeft ? "pl-2" : "pl-2.5",
            iconRight ? "pr-2" : "pr-2.5",
            "py-1.5",
            className
          )}
          {...rest}
        />
        {iconRight && <span className="pr-2 text-[var(--vs-text-muted)]">{iconRight}</span>}
      </div>
      {(hint || error) && (
        <p className={clsx(
          "mt-1 text-[10.5px] leading-snug",
          error ? "text-[var(--vs-danger)]" : "text-[var(--vs-text-dim)]"
        )}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

// ── Textarea ──────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  modified?: boolean;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, modified, className, id, ...rest },
  ref
) {
  const generatedId = useRef(`vs-textarea-${Math.random().toString(36).slice(2)}`);
  const tid = id ?? generatedId.current;
  return (
    <div className="block">
      {label && (
        <label htmlFor={tid} className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
          {label}
          {modified && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--vs-accent-hi)]" />}
        </label>
      )}
      <textarea
        ref={ref}
        id={tid}
        className={clsx(
          "w-full resize-none rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-2.5 py-2 text-[12.5px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] outline-none transition-shadow duration-150 vs-scroll",
          "focus:border-[var(--vs-accent)] focus:shadow-[0_0_0_3px_var(--vs-accent-bg)]",
          className
        )}
        rows={3}
        {...rest}
      />
      {hint && <p className="mt-1 text-[10.5px] leading-snug text-[var(--vs-text-dim)]">{hint}</p>}
    </div>
  );
});

// ── Panel ─────────────────────────────────────────────────────────────────
export function Panel({
  title, action, children, className,
}: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("flex flex-col", className)}>
      {(title || action) && (
        <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-[var(--vs-border)] px-3">
          {title && <h3 className="text-[10.5px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">{title}</h3>}
          {action}
        </header>
      )}
      <div className="flex-1 overflow-y-auto vs-scroll">{children}</div>
    </section>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────
export function EmptyState({
  icon, title, description, action, illustration,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: "default" | "search" | "image" | "error";
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center vs-enter">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--vs-surface)] shadow-[var(--vs-shadow-md)] ring-1 ring-[var(--vs-border-strong)]">
        {icon ?? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--vs-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        )}
      </div>
      <h4 className="text-[13px] font-semibold text-[var(--vs-text)]">{title}</h4>
      {description && (
        <p className="mt-1.5 max-w-[220px] text-[11.5px] leading-snug text-[var(--vs-text-muted)]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
      {illustration && <BackgroundIllustration kind={illustration} />}
    </div>
  );
}

function BackgroundIllustration({ kind }: { kind: "default" | "search" | "image" | "error" }) {
  // Decorative SVG glyphs absolute behind content
  const glyph =
    kind === "search"  ? "M14 14l4 4M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" :
    kind === "image"   ? "M4 4h16v16H4z M4 16l4-4 4 4 4-4 4 4 M9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" :
    kind === "error"   ? "M12 8v5 M12 16v.5 M4 18h16L12 4 4 18z" :
                         "M12 5v14 M5 12h14";
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="pointer-events-none absolute -z-10 h-60 w-60 text-[var(--vs-surface-2)] opacity-50"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      <path d={glyph} />
    </svg>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────
type PillTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
export function Pill({
  children, tone = "neutral", size = "sm",
}: { children: ReactNode; tone?: PillTone; size?: "xs" | "sm" }) {
  const tones: Record<PillTone, string> = {
    neutral: "bg-[var(--vs-surface-2)] text-[var(--vs-text-soft)] ring-[var(--vs-border-strong)]",
    accent:  "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] ring-[var(--vs-accent-ring)]",
    success: "bg-[var(--vs-success-bg)] text-[var(--vs-success)] ring-[rgba(52,211,153,0.30)]",
    warning: "bg-[var(--vs-warning-bg)] text-[var(--vs-warning)] ring-[rgba(251,191,36,0.30)]",
    danger:  "bg-[var(--vs-danger-bg)]  text-[var(--vs-danger)]  ring-[rgba(248,113,113,0.30)]",
    info:    "bg-[var(--vs-info-bg)]    text-[var(--vs-info)]    ring-[rgba(96,165,250,0.30)]",
  };
  const sizes = {
    xs: "px-1.5 py-0.5 text-[9.5px]",
    sm: "px-2 py-0.5 text-[10.5px]",
  };
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 rounded-full ring-1 ring-inset font-medium uppercase tracking-[var(--vs-tracking-wide)]",
      tones[tone],
      sizes[size]
    )}>
      {children}
    </span>
  );
}

// ── Tooltip ──────────────────────────────────────────────────────────────
export function Tooltip({
  label, children, side = "bottom",
}: { label: ReactNode; children: ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  const [hovered, setHovered] = useState(false);
  const positions = {
    top:    "bottom-full mb-1.5 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-1.5 left-1/2 -translate-x-1/2",
    left:   "right-full mr-1.5 top-1/2 -translate-y-1/2",
    right:  "left-full ml-1.5 top-1/2 -translate-y-1/2",
  };
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <span className={clsx(
          "pointer-events-none absolute z-50 rounded-md bg-[var(--vs-surface-3)] px-2 py-1 text-[10.5px] font-medium text-[var(--vs-text)] shadow-[var(--vs-shadow-lg)] ring-1 ring-[var(--vs-border-strong)] whitespace-nowrap",
          positions[side],
          "vs-enter"
        )}>
          {label}
        </span>
      )}
    </span>
  );
}

// ── Spinner ──────────────────────────────────────────────────────────────
export function Spinner({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <Loader2
      className={clsx("animate-spin text-[var(--vs-text-muted)]", className)}
      width={size}
      height={size}
      strokeWidth={1.75}
    />
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx("animate-pulse rounded-md bg-[var(--vs-surface-2)]", className)}
    />
  );
}

/** Stacked list-row skeletons for panel loading states. */
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-3/4" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Kbd ──────────────────────────────────────────────────────────────────
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[5px] border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-1 text-[10.5px] font-mono font-semibold text-[var(--vs-text-soft)] shadow-[var(--vs-shadow-sm)]">
      {children}
    </kbd>
  );
}

// ── SectionHeader (use inside scrollable panel content) ──────────────────
export function SectionHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--vs-border)] px-3 py-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
        {title}
      </h4>
      {action}
    </div>
  );
}

// ── Toast (lightweight) ──────────────────────────────────────────────────
export function Toast({
  tone = "neutral", icon, children, onClose,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  icon?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
}) {
  const tones = {
    neutral: "bg-[var(--vs-surface-2)] text-[var(--vs-text)]",
    success: "bg-[var(--vs-success-bg)] text-[var(--vs-success)] ring-[rgba(52,211,153,0.30)]",
    warning: "bg-[var(--vs-warning-bg)] text-[var(--vs-warning)] ring-[rgba(251,191,36,0.30)]",
    danger:  "bg-[var(--vs-danger-bg)]  text-[var(--vs-danger)]  ring-[rgba(248,113,113,0.30)]",
    info:    "bg-[var(--vs-info-bg)]    text-[var(--vs-info)]    ring-[rgba(96,165,250,0.30)]",
  };
  return (
    <div
      role="status"
      className={clsx(
        "flex items-start gap-2 rounded-md px-3 py-2 text-[11.5px] font-medium ring-1 ring-inset shadow-[var(--vs-shadow-md)] vs-enter",
        tones[tone]
      )}
    >
      {icon}
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
          aria-label="Zavřít"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ── Stateful press feedback ──────────────────────────────────────────────
export function usePressFeedback() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    onTouchStart: () => setPressed(true),
    onTouchEnd: () => setPressed(false),
  };
}

// ── useHotkey hook ────────────────────────────────────────────────────────
export function useHotkey(combo: string, handler: () => void, opts?: { active?: boolean }) {
  useEffect(() => {
    if (opts?.active === false) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t?.isContentEditable) return;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      const parts = combo.toLowerCase().split("+");
      const need = {
        meta: parts.includes("cmd") || parts.includes("meta"),
        ctrl: parts.includes("ctrl"),
        shift: parts.includes("shift"),
        alt: parts.includes("alt"),
        key: parts[parts.length - 1],
      };
      if (e.metaKey !== need.meta && !(need.meta && e.ctrlKey)) return;
      if (e.ctrlKey !== need.ctrl && !(need.ctrl && e.metaKey)) return;
      if (e.shiftKey !== need.shift) return;
      if (e.altKey !== need.alt) return;
      if (e.key.toLowerCase() !== need.key) return;
      e.preventDefault();
      handler();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [combo, handler, opts?.active]);
}
