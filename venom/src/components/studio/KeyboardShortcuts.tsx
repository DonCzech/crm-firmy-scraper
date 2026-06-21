"use client";

import { useEffect } from "react";
import { X, Command } from "lucide-react";
import { Kbd } from "./ui";

/**
 * Luxury keyboard shortcuts overlay. Triggered by `?` from StudioShell.
 */
interface Group {
  title: string;
  items: Array<{ keys: string[]; label: string; mac?: string[] }>;
}

const GROUPS: Group[] = [
  {
    title: "Navigace",
    items: [
      { keys: ["?"],            label: "Zobrazit klávesové zkratky" },
      { keys: ["Esc"],          label: "Zavřít panel / odznačit" },
      { keys: ["1"],            label: "Náhled Desktop" },
      { keys: ["2"],            label: "Náhled Tablet" },
      { keys: ["3"],            label: "Náhled Mobile" },
    ],
  },
  {
    title: "Sekce",
    items: [
      { keys: ["↑"],            label: "Posunout sekci nahoru" },
      { keys: ["↓"],            label: "Posunout sekci dolů" },
      { keys: ["⌘", "D"], mac: ["⌘","D"], label: "Duplikovat vybranou sekci" },
      { keys: ["⌫"],            label: "Smazat vybranou sekci" },
      { keys: ["V"],            label: "Skrýt / zobrazit sekci" },
    ],
  },
  {
    title: "Úpravy",
    items: [
      { keys: ["⌘", "Z"],        label: "Zpět" },
      { keys: ["⌘", "⇧", "Z"],   label: "Znovu" },
      { keys: ["⌘", "S"],        label: "Uložit změny" },
      { keys: ["⌘", "K"],        label: "Rychlé vyhledávání sekcí" },
    ],
  },
  {
    title: "Panely",
    items: [
      { keys: ["L"],             label: "Vrstvy" },
      { keys: ["A"],             label: "Přidat sekci" },
      { keys: ["P"],             label: "Stránky" },
      { keys: ["I"],             label: "Knihovna obrázků" },
      { keys: ["B"],             label: "Identita firmy (Brand)" },
    ],
  },
];

export function KeyboardShortcutsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm vs-enter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-[var(--vs-surface)] shadow-[var(--vs-shadow-xl)] ring-1 ring-[var(--vs-border-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--vs-border)] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] ring-1 ring-[var(--vs-accent-ring)]">
              <Command className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight text-[var(--vs-text)]">Klávesové zkratky</h2>
              <p className="text-[10.5px] text-[var(--vs-text-muted)]">Pracuj rychleji a pohodlněji</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Groups */}
        <div className="grid max-h-[68vh] grid-cols-1 gap-x-8 gap-y-5 overflow-y-auto vs-scroll p-5 md:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
                {g.title}
              </h3>
              <ul className="space-y-1.5">
                {g.items.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-[var(--vs-surface-2)]">
                    <span className="text-[12px] text-[var(--vs-text-soft)]">{it.label}</span>
                    <span className="flex items-center gap-1">
                      {it.keys.map((k, i) => (
                        <Kbd key={i}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-5 py-2.5 text-[10.5px] text-[var(--vs-text-muted)]">
          <span>Stiskni <Kbd>Esc</Kbd> pro zavření</span>
          <span>Webero Studio</span>
        </div>
      </div>
    </div>
  );
}
