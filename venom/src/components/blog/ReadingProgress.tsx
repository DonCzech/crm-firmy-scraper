"use client";

import { useEffect, useState } from "react";

/** Fixed top progress bar driven by scroll position of the article body. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setProgress(total > 0 ? scrolled / total : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none" aria-hidden>
      <div
        className="h-full origin-left transition-transform duration-100 ease-out"
        style={{ backgroundColor: "var(--blog-primary)", transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
