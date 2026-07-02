"use client";

/**
 * Dark-themed "+ Přidat" button — sits in StudioShell's SecondaryActionBar.
 * Visual language matches the rest of the dark editor chrome (vs-* tokens,
 * indigo accent on active). Wix puts an identical button as the primary
 * action on the secondary toolbar; we mirror that placement while keeping
 * our own brand surface so it doesn't look like a transplant.
 */

import { Plus } from "@/components/studio/icons";
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
          ? "bg-[rgba(139,92,246,0.18)] text-[#ddd6fe] shadow-[inset_0_0_0_1px_rgba(167,139,250,0.34),0_0_18px_rgba(139,92,246,0.18)]"
          : "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_56%,#a855f7_100%)] text-white shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_8px_22px_rgba(139,92,246,0.34)] hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_28px_rgba(139,92,246,0.46)]",
      )}
    >
      <Plus size={14} strokeWidth={2.5} />
      <span>Přidat</span>
    </button>
  );
}
