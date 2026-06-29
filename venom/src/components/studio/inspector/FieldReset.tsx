"use client";

import { RotateCcw } from "lucide-react";
import clsx from "clsx";

/**
 * Reset šipka pro jedno konkrétní pole v inspector tabech.
 * Vrátí pole na default hodnotu šablony.
 *
 * Použití: vedle libovolného editovatelného controlu (slider, input, color picker,
 * select…) tak, aby uživatel jedním klikem vrátil jen to konkrétní pole na výchozí
 * hodnotu, aniž by se dotkl ostatních úprav.
 */
export function FieldReset({
  onReset,
  modified,
  title = "Vrátit pole na výchozí hodnotu",
  size = "sm",
  className,
}: {
  onReset: () => void;
  /** Je pole změněno oproti šabloně? Když ne, button bude disabled. */
  modified: boolean;
  title?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const sz = size === "md" ? "h-7 w-7" : "h-6 w-6";
  const icon = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onReset}
      disabled={!modified}
      className={clsx(
        sz,
        "flex shrink-0 items-center justify-center rounded transition-colors",
        modified
          ? "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
          : "text-[var(--vs-text-dim)] opacity-30 cursor-not-allowed",
        className
      )}
    >
      <RotateCcw className={icon} strokeWidth={1.75} />
    </button>
  );
}
