"use client";

import { type ReactNode } from "react";
import { openLightbox } from "./Lightbox";

interface Props {
  images: { url: string; alt?: string; caption?: string }[];
  index: number;
  children: ReactNode;
}

export function ClickableImage({ images, index, children }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="group/zoom relative cursor-pointer"
      onClick={() => openLightbox(images, index)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(images, index); } }}
    >
      {children}
      {/* Expand affordance — a framed corner glyph reads more considered than
          the browser's default zoom cursor. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full opacity-0 transition-opacity duration-200 group-hover/zoom:opacity-100"
        style={{ backgroundColor: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6" />
          <path d="M9 21H3v-6" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
        </svg>
      </span>
    </div>
  );
}
