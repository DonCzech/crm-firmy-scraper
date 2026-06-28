"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "webero_cookie_consent_v1";

type Choice = "accepted" | "rejected" | "custom";

interface ConsentState {
  choice: Choice;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function writeConsent(c: ConsentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: c }));
  } catch {}
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) return;
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, []);

  function acceptAll() {
    writeConsent({ choice: "accepted", analytics: true, marketing: true, timestamp: Date.now() });
    setOpen(false);
  }
  function rejectAll() {
    writeConsent({ choice: "rejected", analytics: false, marketing: false, timestamp: Date.now() });
    setOpen(false);
  }
  function saveCustom() {
    writeConsent({ choice: "custom", analytics, marketing, timestamp: Date.now() });
    setOpen(false);
  }

  if (!open) return null;

  return (
    <>
      {/* Minimal centered bar */}
      <div
        role="dialog"
        aria-label="Souhlas s cookies"
        className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[860px] sm:bottom-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
        style={{ animation: "cookieSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both" }}
      >
        <div
          className="flex flex-col items-stretch gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 px-5 py-4 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-5 sm:px-6 sm:py-3.5"
        >
          {/* Icon */}
          <div className="hidden h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white/8 text-[#a5b4fc] sm:grid">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21.5 12c0 5.2-4.3 9.5-9.5 9.5S2.5 17.2 2.5 12 6.8 2.5 12 2.5c.4 0 .8 0 1.2.1a3 3 0 002.7 4.4 3 3 0 003.4 3.1c.7 0 1.4-.2 1.9-.6 0 .8.3 1.6.3 2.5z" />
              <circle cx="9" cy="9" r="1" fill="currentColor" />
              <circle cx="14" cy="14" r="1" fill="currentColor" />
              <circle cx="9" cy="15" r="1" fill="currentColor" />
            </svg>
          </div>

          {/* Copy */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[13px] leading-[1.5] text-white/90 sm:text-[13.5px]">
              Používáme cookies pro lepší zážitek a anonymní analytiku.{" "}
              <a
                href="/ochrana-udaju"
                className="font-semibold text-white underline-offset-2 hover:underline"
              >
                Více info
              </a>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-shrink-0 items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setDetails((v) => !v)}
              className="rounded-full px-4 py-1.5 text-[12.5px] font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Nastavit
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="rounded-full px-4 py-1.5 text-[12.5px] font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Odmítnout
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-[#0a0a0a] shadow-[0_4px_14px_-4px_rgba(255,255,255,0.3)] transition hover:bg-white/92"
            >
              Přijmout vše
            </button>
          </div>
        </div>

        {/* Details popover */}
        {details && (
          <div
            className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 p-5 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md"
            style={{ animation: "cookieSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            <div className="space-y-3">
              <ConsentRow label="Nezbytné" desc="Funkce webu (přihlášení, košík). Vždy aktivní." value={true} disabled />
              <ConsentRow label="Analytika" desc="Anonymní statistiky návštěvnosti (Google Analytics)." value={analytics} onChange={setAnalytics} />
              <ConsentRow label="Marketing" desc="Retargeting reklam (Meta Pixel)." value={marketing} onChange={setMarketing} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDetails(false)}
                className="rounded-full px-4 py-2 text-[12.5px] font-medium text-white/65 transition hover:text-white"
              >
                Zavřít
              </button>
              <button
                type="button"
                onClick={saveCustom}
                className="rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-[#0a0a0a] transition hover:bg-white/92"
              >
                Uložit volbu
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

function ConsentRow({
  label, desc, value, onChange, disabled = false,
}: { label: string; desc: string; value: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-white">{label}</div>
        <div className="mt-0.5 text-[11.5px] leading-[1.45] text-white/55">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange?.(!value)}
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition ${
          value ? "bg-[#6366f1]" : "bg-white/15"
        } ${disabled ? "opacity-60" : "cursor-pointer"}`}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ left: value ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
    </div>
  );
}
