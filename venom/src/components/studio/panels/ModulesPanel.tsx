"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useStudio } from "../StudioContext";
import type { StudioState } from "../TenantStudioView";
import clsx from "clsx";

const TOP_ITEMS = [
  { id: "form-data", label: "Data z formulářů" },
  { id: "contacts",  label: "Získané kontakty" },
];

const EVENTS_SUB = [
  { id: "events",              label: "Přehled událostí" },
  { id: "events-people",       label: "Osoby" },
  { id: "events-person-types", label: "Typy osob" },
  { id: "events-speaker-tags", label: "Tagy vystoupení" },
  { id: "events-event-tags",   label: "Tagy událostí" },
  { id: "events-categories",   label: "Kategorie událostí" },
];

function NavItem({ id, label }: { id: string; label: string }) {
  const studio = useStudio();
  const active = studio.modulesView === id;

  return (
    <button
      type="button"
      onClick={() => studio.setModulesView(id)}
      className={clsx(
        "relative flex w-full items-center px-4 py-[8px] text-[13px] transition-colors duration-100 text-left",
        active
          ? "text-[var(--vs-accent-hi)] bg-[rgba(129,140,248,0.08)]"
          : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#6366f1]" />
      )}
      {label}
    </button>
  );
}

function SubNavItem({ id, label }: { id: string; label: string }) {
  const studio = useStudio();
  const active = studio.modulesView === id;

  return (
    <button
      type="button"
      onClick={() => studio.setModulesView(id)}
      className={clsx(
        "relative flex w-full items-center pl-6 pr-4 py-[7px] text-[12.5px] transition-colors duration-100 text-left",
        active
          ? "text-[var(--vs-accent-hi)] bg-[rgba(129,140,248,0.08)]"
          : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#6366f1]" />
      )}
      {label}
    </button>
  );
}

export function ModulesPanel({ state: _state }: { state: StudioState }) {
  const studio = useStudio();
  const eventsActive = studio.modulesView.startsWith("events");
  const [eventsOpen, setEventsOpen] = useState(eventsActive);

  return (
    <div className="vs-enter flex-1 overflow-y-auto vs-scroll py-2">
      {TOP_ITEMS.map((item) => (
        <NavItem key={item.id} id={item.id} label={item.label} />
      ))}

      {/* Události accordion */}
      <button
        type="button"
        onClick={() => setEventsOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-[8px] text-[13px] text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
      >
        <span>Události</span>
        {eventsOpen
          ? <ChevronDown className="h-3.5 w-3.5 text-[var(--vs-text-dim)] shrink-0" strokeWidth={2} />
          : <ChevronRight className="h-3.5 w-3.5 text-[var(--vs-text-dim)] shrink-0" strokeWidth={2} />
        }
      </button>

      {eventsOpen && (
        <div>
          {EVENTS_SUB.map((item) => (
            <SubNavItem key={item.id} id={item.id} label={item.label} />
          ))}
        </div>
      )}
    </div>
  );
}
