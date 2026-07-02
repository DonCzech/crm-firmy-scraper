"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface Props {
  value: string;         // "YYYY-MM-DD"
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const MONTHS = [
  "Leden","Únor","Březen","Duben","Květen","Červen",
  "Červenec","Srpen","Září","Říjen","Listopad","Prosinec",
];
const DAYS = ["Po","Út","St","Čt","Pá","So","Ne"];

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatCZ(s: string): string {
  const d = parseDate(s);
  if (!d) return "";
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}

export default function DatePicker({ value, onChange, placeholder = "Vyberte datum", className = "" }: Props) {
  const selected = parseDate(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => selected ?? new Date());
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // When opening, sync view to selected date
  function handleOpen() {
    if (selected) setView(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setOpen((v) => !v);
  }

  function prevMonth() {
    setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  }
  function nextMonth() {
    setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));
  }

  function selectDay(day: number) {
    const d = new Date(view.getFullYear(), view.getMonth(), day);
    onChange(toISO(d));
    setOpen(false);
  }

  // Build calendar grid
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = toISO(new Date());

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleOpen}
        className={`input w-full text-left flex items-center justify-between gap-2 ${!value ? "text-slate-400" : "text-slate-900"}`}
      >
        <span>{value ? formatCZ(value) : placeholder}</span>
        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-64">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-800">
              {MONTHS[month]} {year}
            </span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const iso = toISO(new Date(year, month, day));
              const isSelected = iso === value;
              const isToday = iso === todayISO;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`
                    h-8 w-full rounded-lg text-sm transition-colors font-medium
                    ${isSelected
                      ? "bg-indigo-600 text-white"
                      : isToday
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "hover:bg-slate-100 text-slate-700"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
