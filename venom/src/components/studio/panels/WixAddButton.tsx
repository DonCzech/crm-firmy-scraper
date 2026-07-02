"use client";

/**
 * Dark-themed "+ Přidat" button — sits in StudioShell's SecondaryActionBar.
 * Visual language matches the rest of the dark editor chrome (vs-* tokens,
 * indigo accent on active). Wix puts an identical button as the primary
 * action on the secondary toolbar; we mirror that placement while keeping
 * our own brand surface so it doesn't look like a transplant.
 */

import { Plus } from "lucide-react";
import clsx from "clsx";
import { toggleWixAdd, useWixAdd } from "./wix-add-state";

export function WixAddButton() {
  const view = useWixAdd();
  const active = view !== "closed";
  return (
    <button
      type="button"
      onClick={toggleWixAdd}
      aria-label="Přidat"
      data-tour-id="wix-add-button"
      aria-expanded={active}
      className={clsx(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-[background,color,box-shadow,transform] duration-100 active:translate-y-[0.5px]",
        active
          ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] shadow-[inset_0_0_0_1px_var(--vs-accent-ring)]"
          : "vs-grad-accent text-white shadow-[var(--vs-glow-brand)]",
      )}
    >
      <Plus size={14} strokeWidth={2.5} />
      <span>Přidat</span>
    </button>
  );
}
