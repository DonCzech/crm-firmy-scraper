"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Kbd } from "./ui";

interface Group {
  title: string;
  items: Array<{ keys: string[]; label: string }>;
}

const GROUPS: Group[] = [
  {
    title: "Layout Builder",
    items: [
      { keys: ["⌘", "Z"],          label: "Zpět" },
      { keys: ["⌘", "⇧", "Z"],     label: "Vpřed" },
      { keys: ["⌥", "+DRAG"],      label: "Duplikovat" },
      { keys: ["⌘", "D"],          label: "Duplikovat" },
      { keys: ["⌘", "C"],          label: "Kopírovat" },
      { keys: ["⌘", "V"],          label: "Vložit" },
      { keys: ["⌘", "+CLICK"],     label: "Vybrat více" },
    ],
  },
  {
    title: "Textový editor",
    items: [
      { keys: ["⌘", "B"],          label: "Tučné" },
      { keys: ["⌘", "I"],          label: "Kurzíva" },
      { keys: ["⌘", "U"],          label: "Podtržení" },
      { keys: ["⌘", "⇧", "K"],    label: "Odkaz" },
      { keys: ["⌘", "⇧", "L"],    label: "Zarovnat doleva" },
      { keys: ["⌘", "⇧", "C"],    label: "Zarovnat na střed" },
      { keys: ["⌘", "⇧", "R"],    label: "Zarovnat doprava" },
      { keys: ["⌥", "SPACE"],      label: "Nedělitelná mezera" },
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm vs-enter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-[var(--vs-surface)] shadow-2xl ring-1 ring-[var(--vs-border-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--vs-surface-2)]">
          <h2 className="text-[15px] font-semibold text-white">Klávesové zkratky</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-muted)] transition-colors"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Groups — side by side */}
        <div className="grid grid-cols-2 gap-0 divide-x divide-[var(--vs-surface-2)]">
          {GROUPS.map((g) => (
            <div key={g.title} className="px-5 py-4">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                {g.title}
              </h3>
              <ul className="space-y-1">
                {g.items.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--vs-surface-2)] transition-colors">
                    <span className="text-[12.5px] text-[var(--vs-text-muted)]">{it.label}</span>
                    <span className="flex items-center gap-0.5 shrink-0">
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
        <div className="flex items-center justify-end border-t border-[var(--vs-surface-2)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#6366f1] px-5 py-1.5 text-[13px] font-semibold text-white hover:bg-[#4f46e5] transition-colors"
          >
            Hotovo
          </button>
        </div>
      </div>
    </div>
  );
}
