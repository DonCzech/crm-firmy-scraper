"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Floating scroll-hint pill — clickable. Outer wrapper has pointer-events:none
 * so it doesn't block iframe scrolling; the inner button restores pointer
 * events so the click works.
 *
 * On click → smooth-scrolls the IFRAME's internal content by ~80% of its
 * logical viewport (so user sees a clear jump to the next screen of the
 * preview website with some context overlap).
 */
function ScrollHint({
  small = false,
  iframeRef,
  scrollAmount,
  locale = "cs",
}: {
  small?: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  scrollAmount: number;
  locale?: "cs" | "en";
}) {
  function handleClick() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) return;

      // Determine if user is at the very bottom — then loop back to top
      const scrollEl =
        (doc.scrollingElement as HTMLElement | null) ??
        doc.documentElement ??
        doc.body;
      if (scrollEl) {
        const atBottom =
          scrollEl.scrollTop + scrollEl.clientHeight >=
          scrollEl.scrollHeight - 4;
        if (atBottom) {
          win.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

      win.scrollBy({ top: scrollAmount, behavior: "smooth" });
    } catch {
      // Cross-origin or sandbox restriction — ignore
    }
  }

  return (
    <div
      className={`scroll-hint-pill pointer-events-none absolute inset-x-0 z-30 flex justify-center ${
        small ? "bottom-3" : "bottom-4"
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={locale === "en" ? "Scroll the preview content" : "Posunout obsah uvnitř náhledu"}
        className={`pointer-events-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-[#0a0a0a]/85 text-white backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition hover:bg-[#0a0a0a] active:scale-[0.96] ${
          small ? "px-2.5 py-1" : "px-3.5 py-1.5"
        }`}
      >
        <span
          className={`font-semibold tracking-[0.02em] ${small ? "text-[10px]" : "text-[11.5px]"}`}
        >
          {locale === "en" ? "Scroll" : "Scrollujte"}
        </span>
        <svg
          className="scroll-hint-arrow"
          width={small ? 10 : 12}
          height={small ? 10 : 12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>
    </div>
  );
}

/** Logical desktop viewport — same number for all desktop-style frames so
 *  template renders identically (1440×900). Mobile uses iPhone 14 Pro viewport. */
const DESKTOP_VW = 1440;
const DESKTOP_VH = 900;
const MOBILE_VW = 390;
const MOBILE_VH = 844;

/**
 * Apple Studio Display — thin black bezel, aluminum stand.
 * Screen is responsive: iframe scales pixel-perfect to parent width.
 */
export function LiveDesktopFrame({
  demoUrl,
  maxWidth = 820,
  compact = false,
  locale = "cs",
}: {
  demoUrl: string | null;
  maxWidth?: number;
  /** When true (used in hero), hides the aluminum stand on mobile to save vertical space. */
  compact?: boolean;
  locale?: "cs" | "en";
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!screenRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / DESKTOP_VW);
    });
    ro.observe(screenRef.current);
    return () => ro.disconnect();
  }, []);

  /* Load iframe only when container enters viewport */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !demoUrl) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setShouldLoad(true), 400);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [demoUrl]);

  return (
    <div ref={containerRef} className="relative mx-auto w-full" style={{ maxWidth: `${maxWidth}px` }}>
      <div
        className="relative rounded-[14px] bg-[#0a0a0a] p-[12px]"
        style={{
          boxShadow:
            "0 60px 120px -40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(0,0,0,0.4)",
        }}
      >
        {/* Tiny camera dot */}
        <div className="absolute left-1/2 top-[5px] z-10 -translate-x-1/2">
          <div className="h-[4px] w-[4px] rounded-full bg-[#1a1a1a]" />
        </div>

        {/* Screen — height tracks 16:10 of width */}
        <div
          ref={screenRef}
          className="relative w-full overflow-hidden rounded-[3px] bg-white"
          style={{ aspectRatio: "16 / 10" }}
        >
          {demoUrl && shouldLoad && (
            <iframe
              ref={iframeRef}
              src={demoUrl}
              title="Live desktop preview"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${DESKTOP_VW}px`,
                height: `${DESKTOP_VH}px`,
                border: "none",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
          {demoUrl && (!shouldLoad || !iframeLoaded) && (
            /* Apple-style loading screen — shown until iframe fully loads */
            <div className="absolute inset-0 z-10 flex flex-col bg-[#f5f5f7]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
              {/* Safari chrome */}
              <div className="flex-shrink-0 bg-[#ececec] border-b border-[#d1d1d1]" style={{ padding: "8px 12px 7px" }}>
                {/* Traffic lights */}
                <div className="flex items-center gap-[6px] mb-[6px]">
                  <div className="h-[10px] w-[10px] rounded-full bg-[#ff5f57]" />
                  <div className="h-[10px] w-[10px] rounded-full bg-[#febc2e]" />
                  <div className="h-[10px] w-[10px] rounded-full bg-[#28c840]" />
                </div>
                {/* URL bar */}
                <div className="flex items-center gap-[6px] rounded-[6px] bg-white border border-[#d1d1d1] px-3 py-[5px]" style={{ maxWidth: "340px", margin: "0 auto" }}>
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
                    <rect x="1" y="4.5" width="8" height="7" rx="1.2" stroke="#555" strokeWidth="1.2" />
                    <path d="M3 4.5V3a2 2 0 014 0v1.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: "11px", color: "#444", letterSpacing: "0.01em", opacity: 0.7 }}>vasfirma.webero.co</span>
                </div>
              </div>
              {/* Animated progress bar */}
              <div className="relative h-[2px] w-full overflow-hidden bg-[#e0e0e0]" style={{ flexShrink: 0 }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, #6366f1 40%, #818cf8 60%, transparent)", animation: "progressBar 1.8s cubic-bezier(0.4,0,0.2,1) infinite" }} />
              </div>
              {/* Centered branding */}
              <div className="flex flex-1 flex-col items-center justify-center gap-3" style={{ animation: "frameLogoFade 0.6s ease both 0.1s" }}>
                <svg width="38" height="38" viewBox="0 0 30 30" fill="none">
                  <rect width="30" height="30" rx="8" fill="url(#wm-grad-d)" />
                  <path d="M7 9.5L10.8 20.5L15 12.5L19.2 20.5L23 9.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <defs><linearGradient id="wm-grad-d" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#4338ca" /></linearGradient></defs>
                </svg>
                <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.04em", color: "#111" }}>Webero</span>
                <span style={{ fontSize: "11px", color: "#888", letterSpacing: "0.04em", marginTop: "-4px" }}>Načítám váš web…</span>
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", animation: `loadDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          {!demoUrl && (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              Demo nedostupné
            </div>
          )}
          {demoUrl && shouldLoad && iframeLoaded && <ScrollHint iframeRef={iframeRef} scrollAmount={Math.round(DESKTOP_VH * 0.8)} locale={locale} />}
        </div>
      </div>

      {/* Aluminum neck — hidden on phone when compact (hero) */}
      <div
        className={`relative mx-auto mt-[-2px] h-[36px] w-[16%] rounded-b-[3px] ${
          compact ? "hidden sm:block" : ""
        }`}
        style={{
          background: "linear-gradient(180deg, #b8bbbe 0%, #8a8d91 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset -2px 0 2px rgba(0,0,0,0.15)",
        }}
      />
      {/* Aluminum foot — hidden on phone when compact (hero) */}
      <div
        className={`relative mx-auto mt-[-1px] h-[10px] w-[34%] rounded-[2px] ${
          compact ? "hidden sm:block" : ""
        }`}
        style={{
          background: "linear-gradient(180deg, #b8bbbe 0%, #6a6d71 100%)",
          boxShadow:
            "0 18px 30px -10px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.25)",
        }}
      />
      {/* Floor shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -bottom-3 h-[18px] w-[40%] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.25), transparent 70%)", filter: "blur(8px)" }}
      />
    </div>
  );
}

/**
 * MacBook Pro 16" — realistic macOS chrome (menu bar, Safari toolbar)
 * NO dock per user request. Screen is responsive.
 */
export function LiveMacBookFrame({ demoUrl, maxWidth = 900 }: { demoUrl: string | null; maxWidth?: number }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const CHROME_HEIGHT = 56; // 22 menu + 34 toolbar

  useEffect(() => {
    if (!screenRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / DESKTOP_VW);
    });
    ro.observe(screenRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: `${maxWidth}px` }}>

      {/* Screen body */}
      <div
        className="relative rounded-[18px] bg-[#1a1a1a] p-[10px] pt-[16px]"
        style={{
          boxShadow:
            "0 50px 100px -30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.5)",
        }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-[8px] z-10 -translate-x-1/2">
          <div className="flex h-[10px] w-[100px] items-center justify-center rounded-b-[8px] bg-[#0a0a0a]">
            <div className="h-[4px] w-[4px] rounded-full bg-[#2a2a2a] ring-1 ring-white/5" />
          </div>
        </div>

        {/* Screen */}
        <div
          ref={screenRef}
          className="relative w-full overflow-hidden rounded-[6px] bg-white"
          style={{ aspectRatio: "16 / 10" }}
        >
          {/* macOS menu bar */}
          <div
            className="absolute inset-x-0 top-0 z-20 flex h-[22px] items-center px-3 text-[10.5px] text-white"
            style={{
              background: "rgba(20, 20, 22, 0.78)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="mr-3 opacity-95">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className="font-bold mr-4">Safari</span>
            <span className="mr-3 opacity-80">File</span>
            <span className="mr-3 opacity-80">Edit</span>
            <span className="mr-3 opacity-80">View</span>
            <span className="mr-3 opacity-80">History</span>
            <span className="mr-3 opacity-80">Bookmarks</span>
            <span className="mr-3 opacity-80 hidden sm:inline">Window</span>
            <span className="opacity-80 hidden sm:inline">Help</span>
            <div className="ml-auto flex items-center gap-2.5 opacity-95">
              <svg width="18" height="9" viewBox="0 0 26 12" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="0.5" y="0.5" width="21" height="11" rx="2" />
                <rect x="2" y="2" width="14" height="8" fill="currentColor" />
                <rect x="22" y="3.5" width="2" height="5" rx="0.5" fill="currentColor" />
              </svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 13a4 4 0 00-3.5 2.1l1.7 1A2 2 0 0112 15a2 2 0 011.8 1.1l1.7-1A4 4 0 0012 13zM12 8a8 8 0 00-7.1 4.3l1.7 1A6 6 0 0112 10a6 6 0 015.4 3.3l1.7-1A8 8 0 0012 8z" />
              </svg>
              <span className="text-[10px] font-medium">14:32</span>
            </div>
          </div>

          {/* Safari toolbar */}
          <div
            className="absolute inset-x-0 top-[22px] z-20 flex h-[34px] items-center gap-2 border-b border-black/10 px-3"
            style={{
              background: "rgba(245, 245, 247, 0.92)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center gap-1.5 mr-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" style={{ boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.15)" }} />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" style={{ boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.15)" }} />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" style={{ boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.15)" }} />
            </div>
            <button className="grid h-6 w-6 place-items-center rounded text-[#0a0a0a] hover:bg-black/5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button className="grid h-6 w-6 place-items-center rounded text-[#666] hover:bg-black/5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <div className="flex flex-1 items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 shadow-[0_0_0_0.5px_rgba(0,0,0,0.1)]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#666]">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
              <span className="text-[10.5px] font-medium text-[#0a0a0a]">vasfirma.webero.co</span>
            </div>
            <button className="grid h-6 w-6 place-items-center rounded text-[#666] hover:bg-black/5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" /></svg>
            </button>
          </div>

          {/* Live iframe — absolute so its 1440px CSS box doesn't propagate to parent layout */}
          <div className="absolute inset-0 overflow-hidden bg-white" style={{ paddingTop: `${CHROME_HEIGHT}px` }}>
            {demoUrl ? (
              <iframe
                ref={iframeRef}
                src={demoUrl}
                title="Live MacBook preview"
                style={{
                  position: "absolute",
                  top: `${CHROME_HEIGHT}px`,
                  left: 0,
                  width: `${DESKTOP_VW}px`,
                  height: `${DESKTOP_VH}px`,
                  border: "none",
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                Demo nedostupné
              </div>
            )}
          </div>
          {demoUrl && <ScrollHint iframeRef={iframeRef} scrollAmount={Math.round(DESKTOP_VH * 0.8)} />}
        </div>
      </div>

      {/* Keyboard deck */}
      <div className="relative mx-auto" style={{ width: "108%" }}>
        <div
          className="mx-auto h-[8px] rounded-b-[10px]"
          style={{
            background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #cfd1d4 51%, #a8aab0 100%)",
          }}
        />
        <div
          className="mx-auto h-[10px] rounded-b-[14px]"
          style={{
            background: "linear-gradient(180deg, #d8dadd 0%, #c2c4c8 40%, #9c9ea3 100%)",
            boxShadow:
              "0 20px 30px -10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.25)",
          }}
        />
        <div
          className="mx-auto h-[2px] w-[24%] rounded-b-[3px]"
          style={{ background: "linear-gradient(180deg, #9c9ea3 0%, #6f7176 100%)" }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -bottom-3 h-[18px] w-[50%] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.30), transparent 70%)",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}

/** iPhone 14 Pro — fixed 300px width, dynamic island, native viewport scaled.
 *  Uses IntersectionObserver to load iframe only when visible in viewport.
 *  Shows skeleton while iframe is loading. */
export function LiveMobileFrame({ demoUrl, locale = "cs" }: { demoUrl: string | null; locale?: "cs" | "en" }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.7077);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!screenRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / MOBILE_VW);
    });
    ro.observe(screenRef.current);
    return () => ro.disconnect();
  }, []);

  /* Load iframe only when container enters viewport */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !demoUrl) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setShouldLoad(true), 400);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [demoUrl]);

  return (
    <div ref={containerRef} className="relative w-[300px] rounded-[2.75rem] border-[12px] border-slate-900 bg-slate-900 shadow-2xl shadow-slate-900/20">
      <div className="absolute left-1/2 top-2 z-10 h-5 w-28 -translate-x-1/2 rounded-full bg-slate-900" />
      <div
        ref={screenRef}
        className="relative overflow-hidden rounded-[2rem] bg-white"
        style={{ width: "276px", height: "598px" }}
      >
        {/* iOS-style loading screen — visible until iframe is loaded */}
        {(!iframeLoaded || !shouldLoad) && demoUrl && (
          <div className="absolute inset-0 z-10 flex flex-col bg-[#f5f5f7]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1" style={{ flexShrink: 0 }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#111", letterSpacing: "-0.02em" }}>9:41</span>
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {/* Signal bars */}
                <svg width="16" height="10" viewBox="0 0 16 10" fill="#111" style={{ opacity: 0.8 }}>
                  <rect x="0" y="6" width="3" height="4" rx="0.6" />
                  <rect x="4.5" y="4" width="3" height="6" rx="0.6" />
                  <rect x="9" y="2" width="3" height="8" rx="0.6" />
                  <rect x="13.5" y="0" width="3" height="10" rx="0.6" />
                </svg>
                {/* Wifi */}
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ opacity: 0.8 }}>
                  <path d="M7 8.5a0.7 0.7 0 1 1 0-1.4 0.7 0.7 0 0 1 0 1.4z" fill="#111"/>
                  <path d="M4.5 6.2a3.5 3.5 0 0 1 5 0" stroke="#111" strokeWidth="1.1" strokeLinecap="round"/>
                  <path d="M2.2 3.9A6.5 6.5 0 0 1 11.8 3.9" stroke="#111" strokeWidth="1.1" strokeLinecap="round"/>
                  <path d="M0 1.7A9.5 9.5 0 0 1 14 1.7" stroke="#111" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                {/* Battery */}
                <svg width="22" height="11" viewBox="0 0 22 11" fill="none" style={{ opacity: 0.8 }}>
                  <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="#111" strokeWidth="1"/>
                  <rect x="2" y="2" width="13" height="7" rx="1.5" fill="#111"/>
                  <path d="M19.5 3.8v3.4a1.5 1.5 0 0 0 0-3.4z" fill="#111" opacity="0.5"/>
                </svg>
              </div>
            </div>
            {/* Safari URL bar */}
            <div style={{ padding: "4px 10px 6px", flexShrink: 0 }}>
              <div className="flex items-center gap-[5px] rounded-[9px] bg-white border border-[#d1d1d1] px-2 py-[5px]">
                <svg width="8" height="10" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
                  <rect x="1" y="4.5" width="8" height="7" rx="1.2" stroke="#555" strokeWidth="1.2" />
                  <path d="M3 4.5V3a2 2 0 014 0v1.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: "10px", color: "#444", letterSpacing: "0.01em", opacity: 0.7 }}>vasfirma.webero.co</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="relative h-[2px] w-full overflow-hidden bg-[#e0e0e0]" style={{ flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, #6366f1 40%, #818cf8 60%, transparent)", animation: "progressBar 1.8s cubic-bezier(0.4,0,0.2,1) infinite" }} />
            </div>
            {/* Centered branding */}
            <div className="flex flex-1 flex-col items-center justify-center gap-2" style={{ animation: "frameLogoFade 0.6s ease both 0.1s" }}>
              <svg width="32" height="32" viewBox="0 0 30 30" fill="none">
                <rect width="30" height="30" rx="8" fill="url(#wm-grad-m)" />
                <path d="M7 9.5L10.8 20.5L15 12.5L19.2 20.5L23 9.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <defs><linearGradient id="wm-grad-m" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#4338ca" /></linearGradient></defs>
              </svg>
              <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", color: "#111" }}>Webero</span>
              <span style={{ fontSize: "10px", color: "#888", letterSpacing: "0.04em", marginTop: "-2px" }}>Načítám váš web…</span>
              <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", animation: `loadDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
            {/* Home indicator */}
            <div style={{ display: "flex", justifyContent: "center", paddingBottom: "8px", flexShrink: 0 }}>
              <div style={{ width: "100px", height: "4px", borderRadius: "2px", background: "#c7c7cc" }} />
            </div>
          </div>
        )}
        {demoUrl && shouldLoad ? (
          <iframe
            ref={iframeRef}
            src={demoUrl}
            title="Mobile live preview"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${MOBILE_VW}px`,
              height: `${MOBILE_VH}px`,
              border: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            onLoad={() => setIframeLoaded(true)}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : !demoUrl ? (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            Demo nedostupné
          </div>
        ) : null}
        {demoUrl && shouldLoad && iframeLoaded && <ScrollHint small iframeRef={iframeRef} scrollAmount={Math.round(MOBILE_VH * 0.8)} locale={locale} />}
      </div>
    </div>
  );
}
