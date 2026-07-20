"use client";

/** Modul „Odpočet akce“ — countdown do konce týdne u zlevněných produktů. */

import { useEffect, useState } from "react";

function endOfWeek(): number {
  const d = new Date();
  const day = d.getDay(); // 0 = neděle
  const daysLeft = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysLeft);
  d.setHours(23, 59, 59, 0);
  return d.getTime();
}

export function SaleCountdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = endOfWeek();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  if (left == null || left <= 0) return null;

  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
      <span className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide text-red-600">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></svg>
        Akce končí za
      </span>
      <span className="flex items-center gap-1 text-[14px] font-extrabold tabular-nums text-red-700">
        {days > 0 && <span>{days} d</span>}
        <span>{pad(hours)}:{pad(mins)}:{pad(secs)}</span>
      </span>
    </div>
  );
}
