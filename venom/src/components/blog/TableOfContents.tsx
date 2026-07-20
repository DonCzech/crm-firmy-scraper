"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog/content";

/** Sticky side-rail table of contents with scrollspy highlighting. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -70% 0px" }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Obsah článku" className="text-sm">
      <p
        className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3"
        style={{ color: "var(--blog-muted)" }}
      >
        Obsah
      </p>
      <ul className="space-y-1 border-l" style={{ borderColor: "var(--blog-border)" }}>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block py-1 leading-snug transition-colors duration-200 border-l-2 -ml-[1.5px]"
                style={{
                  paddingLeft: item.level === 3 ? "1.5rem" : "0.75rem",
                  color: active ? "var(--blog-primary)" : "var(--blog-muted)",
                  borderColor: active ? "var(--blog-primary)" : "transparent",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
