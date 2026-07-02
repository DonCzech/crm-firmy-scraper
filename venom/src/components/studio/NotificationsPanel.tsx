"use client";

import { useEffect, useRef, useState } from "react";
import { X, Monitor } from "lucide-react";
import { useStudio } from "./StudioContext";

export function NotificationsPanel() {
  const studio = useStudio();
  const [onlyUnread, setOnlyUnread] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!studio.notificationsOpen) return;
    function onDown(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        studio.setNotificationsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") studio.setNotificationsOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [studio.notificationsOpen, studio]);

  if (!studio.notificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none vs-enter">
      {/* Dimmed backdrop (click-through except panel) */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={() => studio.setNotificationsOpen(false)}
      />

      {/* Panel — anchored left of the rail (55px) */}
      <div
        ref={panelRef}
        className="pointer-events-auto absolute left-[55px] right-0 top-0 bottom-0 flex flex-col bg-[var(--vs-surface)] border-r border-[var(--vs-surface-2)] shadow-[4px_0_32px_rgba(0,0,0,0.5)]"
        style={{ maxWidth: 320 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--vs-surface-2)]">
          <h2 className="text-[15px] font-semibold text-white">Upozornění</h2>
          <button
            type="button"
            onClick={() => studio.setNotificationsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-muted)] transition-colors"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--vs-surface-2)]">
          <span className="text-[13px] text-[var(--vs-text-muted)]">Pouze nepřečtené</span>
          <button
            type="button"
            role="switch"
            aria-checked={onlyUnread}
            onClick={() => setOnlyUnread((v) => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              onlyUnread ? "bg-blue-600" : "bg-[var(--vs-border-strong)]"
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              onlyUnread ? "translate-x-4" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Empty state */}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--vs-surface-2)] text-[#4b5563]">
            <Monitor className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] text-[#6b7280]">Žádná oznámení</p>
        </div>
      </div>
    </div>
  );
}
