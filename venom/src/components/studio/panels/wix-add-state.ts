/**
 * Tiny module-level store for the Wix "+ Add" UI so the button (rendered
 * inside SecondaryActionBar) and the overlay (mounted at the StudioShell
 * root) can stay in sync without prop-drilling or a React Context tree.
 */

import { useSyncExternalStore } from "react";

export type WixAddView = "closed" | "popover" | "elements" | "sections" | "pages";

export interface WixAddOptions {
  /** When set, Sekce panel pre-filters by this type and clicking a card
      REPLACES the section's variant instead of adding a new section. */
  replaceSectionId?: number;
  /** Restrict Sekce panel to a specific section type (used by "Změnit
      rozložení" so the user only sees variants of the same kind). */
  filterType?: string;
}

let _view: WixAddView = "closed";
let _opts: WixAddOptions = {};
const listeners = new Set<() => void>();

function emit() { for (const fn of listeners) fn(); }

export function setWixAdd(next: WixAddView, opts: WixAddOptions = {}) {
  _view = next;
  _opts = next === "closed" ? {} : opts;
  emit();
}

export function toggleWixAdd() {
  setWixAdd(_view === "closed" ? "popover" : "closed");
}

export function useWixAdd(): WixAddView {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => _view,
    () => "closed",
  );
}

export function useWixAddOptions(): WixAddOptions {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => _opts,
    () => ({}),
  );
}
