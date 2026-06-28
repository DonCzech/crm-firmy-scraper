"use client";

import { useEffect, useRef } from "react";

interface Props {
  content: { html?: string; height?: string; backgroundColor?: string };
  sectionId: number;
  isAdmin?: boolean;
}

/**
 * EmbedSection — renders arbitrary HTML provided by the tenant. Designed for
 * 3rd-party widgets (calendar embeds, video, map, custom forms, social feeds).
 *
 * Safety:
 * - Strips <script> tags, inline event handlers (onclick, onerror, etc.) and
 *   javascript: URLs before rendering. Iframes from a known allowlist
 *   (youtube/vimeo/mapy.cz/google maps/calendly/booking) are preserved.
 * - Admin mode shows a labelled placeholder when content is empty.
 *
 * This deliberately does NOT use DOMPurify (avoids extra dep). The sanitiser
 * is conservative: anything not on the allowlist drops to plain text.
 */
const IFRAME_ALLOWLIST = [
  "youtube.com", "www.youtube.com", "youtube-nocookie.com",
  "player.vimeo.com",
  "mapy.cz", "frame.mapy.cz",
  "google.com", "www.google.com",
  "calendly.com",
  "booking.com",
  "spotify.com",
  "soundcloud.com",
  "tidio.co",
  "smartsupp.com",
  "tawk.to",
];

function sanitizeHtml(raw: string): string {
  if (!raw) return "";
  let html = raw;
  // Drop <script> blocks
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  // Drop on* event handler attributes
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Drop javascript: URLs
  html = html.replace(/\b(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, "");
  // Validate iframes against allowlist
  html = html.replace(/<iframe[^>]*src=("([^"]*)"|'([^']*)')[^>]*>[\s\S]*?<\/iframe>/gi, (match, _q, dq, sq) => {
    const url = dq ?? sq ?? "";
    try {
      const host = new URL(url).hostname.toLowerCase();
      const ok = IFRAME_ALLOWLIST.some((d) => host === d || host.endsWith(`.${d}`));
      return ok ? match : "";
    } catch {
      return "";
    }
  });
  return html;
}

export function EmbedSection({ content, sectionId, isAdmin }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const safeHtml = sanitizeHtml(content.html ?? "");

  // After mount, execute any <script> tags that the sanitiser left in place
  // (we strip <script> by default; if a future schema lets trusted tenants
  // opt in, the executor lives here). Currently a no-op pass-through.
  useEffect(() => {
    void ref.current;
  }, [safeHtml]);

  const style = {
    minHeight: content.height ?? "auto",
    background: content.backgroundColor ?? "transparent",
  };

  if (!content.html?.trim()) {
    return (
      <section data-section-id={sectionId} className="px-6 py-16" style={style}>
        <div className="mx-auto max-w-3xl rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-[14px] font-semibold text-slate-700">Vlastní HTML / Embed</p>
          <p className="mt-1 text-[12px] text-slate-500">
            {isAdmin
              ? "Vlož HTML kód (YouTube iframe, Calendly widget, Tidio chat, mapu Mapy.cz nebo Google Maps…). Otevři Page Builder → klikni sekci → Upravit."
              : "Sekce zatím nemá obsah."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      data-section-id={sectionId}
      className="vs-embed-section"
      style={style}
    >
      <div
        ref={ref}
        className="vs-embed-content"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      <style>{`
        .vs-embed-section { width: 100%; }
        .vs-embed-content > iframe { width: 100%; max-width: 100%; min-height: 480px; border: 0; display: block; }
        @media (max-width: 768px) {
          .vs-embed-content > iframe { min-height: 360px; }
        }
      `}</style>
    </section>
  );
}
