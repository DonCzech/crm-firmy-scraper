"use client";
import { useEffect, useRef } from "react";

/**
 * Scroll-reveal for restaurant-01 sections.
 * Attach returned ref to the <section>. Mark animatable children with data-r01="N"
 * where N is the stagger index (0, 1, 2 …).
 * CSS lives in each component as a <style> tag using .r01-hidden / .r01-vis classes.
 */
export function useR01Reveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-r01]"));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("r01-vis");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item) => obs.observe(item));
    return () => obs.disconnect();
  }, []);
  return ref;
}

export const R01_REVEAL_CSS = `
  [data-r01] {
    opacity: 0;
    transform: translateY(36px);
    transition: opacity 0.72s cubic-bezier(0.22,1,0.36,1), transform 0.72s cubic-bezier(0.22,1,0.36,1);
  }
  [data-r01].r01-vis {
    opacity: 1;
    transform: translateY(0);
  }
`;
